import type { Register } from 'claude-code'

// Two hooks on tool.call with different matchers that both match a Bash call.
// Each appends its name on the way in and on the way out, and records next.origin.
export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const r = await next({ ...e, command: `${e.command} >first` })
    return { result: `${String((r as { result?: unknown }).result)} <first(origin=${next.origin.plugin}/${next.origin.tier})` } as never
  })
  on('tool.call', { tool: ['Bash', 'Read'] }, async ($, e, next) => {
    const r = await next({ ...e, command: `${e.command} >second` })
    return { result: `${String((r as { result?: unknown }).result)} <second` } as never
  })
}
