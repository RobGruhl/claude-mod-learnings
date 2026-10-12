import type { EngineInterface, Register } from 'claude-code'

export const register: Register = on => {
  const note = ($: EngineInterface, t: string) => $.ui.toast(t)
  on('tool.call', async ($, e, next) => {
    note($, 'hi')
    return next(e)
  })
}
