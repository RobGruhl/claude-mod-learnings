import { expect, test } from 'claude-code/testing'

// The same pass-through hook, but one per mod: k inline mods, each its own module.
// Glob matches none of the module-under-test's hooks, so its depth is exactly k.
const N = 1000
const RUNS = 3
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const passMod = (i: number) => ({
  name: `pass-${i}`,
  register(on: (ev: 'tool.call', h: (...a: any[]) => unknown) => void) {
    on('tool.call', async ($: unknown, e: unknown, next: (e: unknown) => unknown) => next(e))
  },
})

for (const k of [1, 5, 20]) {
  test(`${k} separate mods`, { plugins: Array.from({ length: k }, (_, i) => passMod(i)) }, async ($, on) => {
    on('tool.call', () => ({ result: 'ok' }) as never)
    for (let i = 0; i < 200; i++) await $.tool.call({ tool: 'Glob', pattern: '*' } as never)
    const runs: number[] = []
    for (let r = 0; r < RUNS; r++) {
      const t0 = performance.now()
      for (let i = 0; i < N; i++) await $.tool.call({ tool: 'Glob', pattern: '*' } as never)
      runs.push(((performance.now() - t0) * 1000) / N)
    }
    console.log(`MODS k=${k} runs_us=${runs.map(x => x.toFixed(1)).join('/')} median_us=${median(runs).toFixed(1)}`)
    expect(runs.length).toBe(RUNS)
  })
}
