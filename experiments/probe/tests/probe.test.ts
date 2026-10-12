import { expect, test } from 'claude-code/testing'

test('probe globals', async ($, on) => {
  const g = globalThis as Record<string, unknown>
  const perf = typeof g.performance === 'object' && g.performance !== null ? typeof (g.performance as { now?: unknown }).now : 'no'
  console.log('TEST-SIDE', JSON.stringify({ Date: typeof Date, perfNow: perf, setTimeout: typeof g.setTimeout, process: typeof g.process }))
  const answer = await $.command.run({ command: 'probe', args: '' })
  console.log('MOD-SIDE', answer.text)
  expect(answer.text).toContain('Date')
})
