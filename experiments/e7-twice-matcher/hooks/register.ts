import type { Register } from 'claude-code'

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => next(e))
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => next(e))
}
