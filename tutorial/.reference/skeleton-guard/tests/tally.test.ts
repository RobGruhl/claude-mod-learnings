import { expect, test } from 'claude-code/testing'

import { START, world } from './world'

test('/skeleton reports this session and all time', async ($, on) => {
  world(on, { 'all-time': { sessions: 4, tools: 30, held: 1 } })
  await $.session.start(START)
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Bash', command: 'rm -rf /' })
  const out = await $.command.run({ command: 'skeleton', args: '' } as never)
  expect(out.text).toBe('skeleton-guard: this session 1 tool calls, 1 held; all time 31 tool calls over 5 sessions.')
})

test('a /clear does not write zeros over the stored totals', async ($, on) => {
  const { disk } = world(on, { 'all-time': { sessions: 4, tools: 30, held: 1 } })
  await $.session.start(START)
  await $.classic.SessionStart({ source: 'clear' } as never)
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(disk.get('all-time')).toEqual({ sessions: 5, tools: 31, held: 1 })
})
