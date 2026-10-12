import type { EngineInterface, Register } from 'claude-code'

async function note($: EngineInterface, text: string) {
  await $.ui.toast(text)
}

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    await note($, e.command)
    const home = await $.env.get('HOME')
    await $.store.set('last', { command: e.command, home })
    return next(e)
  })
}
