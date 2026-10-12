import type { EngineInterface, Register } from 'claude-code'

// Tier 1, code: rules you can write down. Microseconds.
const ALWAYS_DENY = [/\brm\s+-[a-z]*r[a-z]*f\b|\brm\s+-[a-z]*f[a-z]*r\b/, /\bgit\s+push\b.*(--force\b|\s-f\b)/, /\bgit\s+reset\s+--hard\b/]
const ALWAYS_ALLOW = /^(ls|pwd|cat|head|tail|wc|git (status|diff|log))(\s|$)/
// Words that make a command worth a second look. Everything else passes in code.
const SUSPICIOUS = /\b(rm|mv|dd|truncate|chmod|chown|kill|drop|delete|purge|--force|-delete)\b|>\s*\S/

type Verdict = { probability: number; doubt: number } | undefined
type Ruling = 'allow' | 'deny'

// Tier 2, a decision model: one typed judgment with a probability and its own doubt.
async function judge($: EngineInterface, url: string, command: string): Promise<Verdict> {
  if (!url) return undefined
  const res = await $.http.fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ command }) })
  if (!res.ok) return undefined
  const v = JSON.parse(res.text) as { probability?: unknown; doubt?: unknown }
  return typeof v.probability === 'number' && typeof v.doubt === 'number' ? { probability: v.probability, doubt: v.doubt } : undefined
}

// Every ruling a person makes is stored, so the same command never climbs the stairs twice.
async function remembered($: EngineInterface, command: string): Promise<Ruling | undefined> {
  return (await $.store.get(`ruling:${command}`)) as Ruling | undefined
}

export const register: Register = (on, options) => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const command = e.command.trim()
    if (ALWAYS_DENY.some(re => re.test(command))) return { deny: `${$.plugin.name}: destructive by rule; ask the person to run it.` }
    if (ALWAYS_ALLOW.test(command) || !SUSPICIOUS.test(command)) return next(e)

    const ruling = await remembered($, command)
    if (ruling === 'allow') return next(e)
    if (ruling === 'deny') return { deny: `${$.plugin.name}: the person refused this command before.` }

    const v = await judge($, String(options.judgeUrl ?? ''), command)
    if (v && v.probability < 0.1 && v.doubt < 0.5) return next(e)
    if (v && v.doubt >= 0.5 && v.doubt <= 0.7) $.ui.log(`${$.plugin.name}: watch band, doubt ${v.doubt.toFixed(2)} on: ${command}`, { to: 'debug' })

    // Tier 4, the person. No model answer, a likely-destructive one, or a doubtful one all end here.
    const why = v ? `decision model: ${Math.round(v.probability * 100)}% destructive, doubt ${v.doubt.toFixed(2)}` : 'no decision model answer'
    const answer = await $.ui.ask(`Run this command? ${command} (${why})`, ['Allow', 'Deny'])
    const decided: Ruling = answer === 'Allow' ? 'allow' : 'deny'
    await $.store.set(`ruling:${command}`, decided)
    return decided === 'allow' ? next(e) : { deny: `${$.plugin.name}: the person refused this command.` }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `cascade-guard failed (${next.error.kind}); refusing to be safe.` }))
}
