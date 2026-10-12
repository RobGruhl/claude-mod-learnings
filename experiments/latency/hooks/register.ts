import type { Register } from 'claude-code'

// Pass-through tool.call hooks, stacked by matcher so one module gives four chain depths:
// Glob meets 0 of them, Write 1, Read 5 and Bash 20. Each hook only counts and calls next.
// Grep meets one hook that makes a single $ call (a store read) before next.
export const hits: Record<string, number> = {}

export const register: Register = on => {
  on('tool.call', { tool: ['Bash', 'Read', 'Write'] }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: ['Bash', 'Read'] }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: ['Bash', 'Read'] }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: ['Bash', 'Read'] }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: ['Bash', 'Read'] }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    hits[e.tool] = (hits[e.tool] ?? 0) + 1
    return next(e)
  })
  on('tool.call', { tool: 'Grep' }, async ($, e, next) => {
    await $.store.get('k')
    return next(e)
  })
  on('command.run', { command: 'hits' }, async () => ({ text: JSON.stringify(hits) }))
}
