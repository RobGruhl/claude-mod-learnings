import type { Register } from 'claude-code'

// One move per command, chosen by the command text, so one hook shows all five.
export const register: Register = on => {
  let seen = 0
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    seen += 1
    if (e.command.startsWith('observe')) return next(e)
    if (e.command.startsWith('rewrite')) return next({ ...e, command: 'echo rewritten' })
    if (e.command.startsWith('answer')) return { result: { stdout: `answered by the mod (seen ${seen})`, stderr: '', interrupted: false } } as never
    if (e.command.startsWith('post')) {
      const r = (await next(e)) as { result?: { stdout?: string } }
      return { ...r, result: { ...r.result, stdout: `${r.result?.stdout ?? ''} [annotated]` } } as never
    }
    if (e.command.startsWith('retry')) {
      const first = (await next(e)) as { result?: { stdout?: string } }
      if (first.result?.stdout?.includes('flaky')) return next(e)
      return first as never
    }
    return next(e)
  })
}
