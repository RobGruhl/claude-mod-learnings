import { expect, test } from 'claude-code/testing'

const outer = {
  name: 'outer-guard',
  tier: 'prepend' as const,
  register(on: (ev: 'tool.call', h: (...a: any[]) => unknown) => void) {
    on('tool.call', async ($: unknown, e: { command: string }, next: (e: unknown) => Promise<{ result: string }>) => {
      const r = await next({ ...e, command: `${e.command} >prepend` })
      return { result: `${r.result} <prepend` }
    })
  },
}

const sibling = {
  name: 'other-user-mod',
  register(on: (ev: 'tool.call', h: (...a: any[]) => unknown) => void) {
    on('tool.call', async ($: unknown, e: { command: string }, next: (e: unknown) => Promise<{ result: string }>) => {
      const r = await next({ ...e, command: `${e.command} >other-user` })
      return { result: `${r.result} <other-user` }
    })
  },
}

test('order: prepend, then user mods, then core; within a module, on() order', { plugins: [outer, sibling] }, async ($, on) => {
  on('tool.call', (_$, e) => ({ result: `core saw "${e.command}"` }) as never)
  const out = await $.tool.call({ tool: 'Bash', command: 'ls' })
  console.log('E2 result:', JSON.stringify(out))
  expect(JSON.stringify(out)).toContain('>first >second')
})
