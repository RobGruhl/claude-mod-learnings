import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Tally } from '../types'

// The Mod Skeleton, finished. Each block names the module that added it.

// Module 6, widened in module 14: shell commands this mod holds.
const DESTRUCTIVE = [
  /\brm\s+-[a-z]*r[a-z]*f\b|\brm\s+-[a-z]*f[a-z]*r\b/,
  /\bgit\s+push\b.*(--force\b|\s-f\b)/,
  /\bgit\s+reset\s+--hard\b/,
]
// Module 8: files a prompt may not pull in with @.
const SECRET = /(^|\/)\.env(\.|$)|\.pem$|(^|\/)id_(rsa|ed25519)$/

// Modules 9 and 10: per-session counts in $.state, all-time counts in $.store.
const ZERO: Tally = { sessions: 0, tools: 0, held: 0 }
const KEY = 'all-time'
const session = atom({ plugin: 'skeleton-guard', key: 'session' } as const, ZERO)
const allTime = atom({ plugin: 'skeleton-guard', key: 'allTime' } as const, ZERO)

async function stored($: EngineInterface): Promise<Tally> {
  return ((await $.store.get(KEY)) as Tally | undefined) ?? ZERO
}

// $.store is the source of truth: every write starts from what is stored, never from $.state.
async function bump($: EngineInterface, field: keyof Tally) {
  if (field !== 'sessions') await update($, session, t => ({ ...t, [field]: t[field] + 1 }))
  const before = await stored($)
  const total = { ...before, [field]: before[field] + 1 }
  await $.store.set(KEY, total)
  await update($, allTime, () => total)
}

export const register: Register = on => {
  // Module 5: a slash command. Register it when the session starts, answer it in command.run.
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'skeleton', description: 'Show what skeleton-guard has counted and held' })
    await bump($, 'sessions')
    return next(e)
  })

  on('command.run', { command: 'skeleton' }, async $ => {
    const now = await read($, session)
    const ever = await read($, allTime)
    return { text: `skeleton-guard: this session ${now.tools} tool calls, ${now.held} held; all time ${ever.tools} tool calls over ${ever.sessions} sessions.` }
  })

  // Module 10: /clear, /resume and /branch reset $.state and do not fire session.start again.
  on('classic.SessionStart', async ($, e, next) => {
    if (e.source === 'clear' || e.source === 'resume' || e.source === 'fork') {
      const total = await stored($)
      await update($, allTime, () => total)
    }
    return next(e)
  })

  // Modules 1, 6 and 7: count every tool call, hold destructive shell commands, fail closed.
  on('tool.call', async ($, e, next) => {
    if (e.tool === 'Bash') {
      const command = e.command.trim()
      if (DESTRUCTIVE.some(re => re.test(command))) {
        await bump($, 'held')
        return { deny: `skeleton-guard: "${command}" is destructive; ask the person to run it themselves.` }
      }
    }
    await bump($, 'tools')
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'skeleton-guard could not check this call, so it is held.' }))

  // Module 8: the second door. An @-mentioned file is read without any tool.call.
  on('prompt.mention', { path: SECRET }, () => ({ deny: 'skeleton-guard: that file may hold secrets.' })).catch(
    ($, e, next) => (next.called ? next(e) : { deny: 'skeleton-guard could not check this file, so it is held.' }),
  )

  // Module 4: rewrite what Claude Code draws. Keep the spinner, add a suffix.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const now = await read($, session)
    return next({ ...e, props: { ...e.props, suffix: ` · tool calls: ${now.tools}…` } })
  })

  // Module 9: a band above the prompt, drawn from $.state, so a state write redraws it.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const now = await read($, session)
    const ever = await read($, allTime)
    if (e.props.hasSurvey || ever.sessions === 0) return next(e)
    const { Text } = $.ui.resolve(e)
    return (
      <Text dimColor>
        skeleton-guard · this session {now.tools} tools, {now.held} held · all time {ever.tools} tools over {ever.sessions} sessions
      </Text>
    )
  })
}
