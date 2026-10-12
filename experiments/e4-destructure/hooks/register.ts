import type { Register } from 'claude-code'

export const register: Register = on => {
  on('tool.call', async ($, e, next) => {
    const { ui } = $
    ui.toast('hi')
    return next(e)
  })
}
