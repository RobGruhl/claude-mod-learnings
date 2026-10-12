import type { Register } from 'claude-code'

// Two copies of the same broken guard. Each throws before it calls next.
// Bash: no .catch, so the docs say the guard is skipped and the call goes on (fail open).
// Write: a .catch that refuses whenever next was never called (fail closed).
export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (e.command.includes('rm')) throw new Error('guard bug')
    return next(e)
  })

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    throw new Error('guard bug')
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `guard failed (${next.error.kind}), so the call was refused` }))

  // Read: reports the budget it runs under, then passes the call on.
  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    const r = await next(e)
    return { result: { budgetMs: next.budget.ms, remainingMs: next.budget.remainingMs, inner: r } } as never
  })
}
