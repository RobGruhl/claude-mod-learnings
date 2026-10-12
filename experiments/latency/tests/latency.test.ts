import { expect, test } from 'claude-code/testing'

// Times N tool calls through 0, 1, 5 and 20 pass-through hooks, three runs each, against a
// test-registered stand-in for core that answers at once. This is the test kit's engine with
// no session, model or terminal: it measures the chain's own overhead and nothing else.
const N = 2000
const RUNS = 3
const DEPTH: Record<string, number> = { Glob: 0, Write: 1, Read: 5, Bash: 20 }
const ARGS: Record<string, Record<string, unknown>> = {
  Glob: { pattern: '*.ts' },
  Write: { file_path: '/tmp/x', content: 'x' },
  Read: { file_path: '/tmp/x' },
  Bash: { command: 'ls' },
  Grep: { pattern: 'x' },
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]

test('chain overhead per tool call', async ($, on) => {
  on('tool.call', () => ({ result: 'ok' }) as never)
  on('store.get', () => ({ value: 1 }))
  // Warm up every path once.
  for (const tool of [...Object.keys(DEPTH), 'Grep']) for (let i = 0; i < 200; i++) await $.tool.call({ tool, ...ARGS[tool] } as never)

  const rows: string[] = []
  const per: Record<string, number> = {}
  for (const tool of [...Object.keys(DEPTH), 'Grep']) {
    const runs: number[] = []
    for (let r = 0; r < RUNS; r++) {
      const t0 = performance.now()
      for (let i = 0; i < N; i++) await $.tool.call({ tool, ...ARGS[tool] } as never)
      runs.push(((performance.now() - t0) * 1000) / N)
    }
    per[tool] = median(runs)
    rows.push(`${tool} depth=${DEPTH[tool] ?? '1 + one $ call'} runs_us=${runs.map(x => x.toFixed(1)).join('/')} median_us=${per[tool].toFixed(1)}`)
  }
  const hits = await $.command.run({ command: 'hits', args: '' })
  for (const r of rows) console.log('LAT', r)
  console.log('LAT marginal_us_per_hook (20 vs 0) =', ((per.Bash - per.Glob) / 20).toFixed(2))
  console.log('LAT marginal_us_per_hook (5 vs 0) =', ((per.Read - per.Glob) / 5).toFixed(2))
  console.log('LAT one $ call over one plain hook =', (per.Grep - per.Write).toFixed(1), 'us')
  console.log('LAT hits', hits.text)
  expect(per.Bash).toBeDefined()
})
