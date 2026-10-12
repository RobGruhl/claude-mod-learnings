import { expect, test } from 'claude-code/testing'

import { world } from './world'

test('holds destructive shell commands and lets the rest run', async ($, on) => {
  const { ran } = world(on)
  for (const command of ['rm -rf build', 'git push --force origin main', 'git reset --hard HEAD~1']) {
    const held = await $.tool.call({ tool: 'Bash', command })
    expect(JSON.stringify(held)).toContain('destructive')
  }
  await $.tool.call({ tool: 'Bash', command: 'ls -la' })
  expect(ran).toEqual(['ls -la'])
})

test('fails closed: a call the guard cannot read is held', async ($, on) => {
  const { ran } = world(on)
  const held = await $.tool.call({ tool: 'Bash' } as never)
  expect(JSON.stringify(held)).toContain('could not check')
  expect(ran).toEqual([])
})

test('fails closed: when the store the guard counts in is down, the call is held', async ($, on) => {
  const { ran } = world(on, {}, { brokenStore: true })
  const held = await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(JSON.stringify(held)).toContain('could not check')
  expect(ran).toEqual([])
})
