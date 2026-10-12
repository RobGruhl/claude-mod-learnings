import type { Register } from 'claude-code'

const EVENTS = ['tool.call'] as const

export const register: Register = on => {
  for (const ev of EVENTS) on(ev, async ($, e, next) => next(e))
}
