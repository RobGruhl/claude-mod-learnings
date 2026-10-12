import type { Register } from 'claude-code'

export const register: Register = on => {
  // Bash: runs the call, then throws while post-processing the result.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const r = await next(e)
    if (e.command === 'boom') throw new Error('post-processing bug')
    return r
  })
  // Read: answers with a shape tool.call doesn't accept, without calling next.
  on('tool.call', { tool: 'Read' }, async ($, e, next) => ({ verdict: 'nope' }) as never)
}
