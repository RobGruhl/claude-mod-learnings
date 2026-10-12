import type { Register } from 'claude-code'

export const register: Register = on => {
  on('tool.call', async ($, e, next) => {
    await import('./other.ts')
    return next(e)
  })
}
