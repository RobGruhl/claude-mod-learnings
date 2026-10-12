import type { EngineInterface, Register } from 'claude-code'

// Run headless: HC_PROBE_OUT=/abs/out.json claude -p x --plugin-dir experiments/live-probe
// session.start times a few $ round trips in the real hooks worker; prompt.submit runs one
// Read through a guard that overruns its budget, writes the results, and drops the prompt,
// so the session ends without asking a model anything.

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const report: Record<string, unknown> = {}

async function time($: EngineInterface, label: string, n: number, f: () => Promise<unknown>) {
  const xs: number[] = []
  for (let i = 0; i < n; i++) {
    const t0 = performance.now()
    await f()
    xs.push((performance.now() - t0) * 1000)
  }
  report[label] = { n, median_us: Math.round(median(xs)), min_us: Math.round(Math.min(...xs)) }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const g = globalThis as Record<string, unknown>
    report.globals = { setTimeout: typeof g.setTimeout, setInterval: typeof g.setInterval, performance: typeof g.performance, process: typeof g.process, fetch: typeof g.fetch }
    if (typeof g.setTimeout === 'function') {
      const t0 = performance.now()
      await new Promise<void>(r => (g.setTimeout as (f: () => void, ms: number) => void)(r, 20))
      report.setTimeout20ms = `fired after ${(performance.now() - t0).toFixed(1)} ms`
    }
    report.surface = e.surface
    report.version = await $.session.version()
    await time($, 'store.get', 200, () => $.store.get('k'))
    await time($, 'env.get', 200, () => $.env.get('HOME'))
    await time($, 'fs.read (small file)', 50, () => $.fs.read('hooks/hooks.json'))
    await time($, 'process.run true', 20, () => $.process.run(['true']))
    await time($, 'http.fetch localhost', 20, () => $.http.fetch('http://127.0.0.1:8799/'))
    report.httpStatus = (await $.http.fetch('http://127.0.0.1:8799/')).status
    return next(e)
  })

  // A guard that waits 11 s on a plain timer before deciding: past its 10 s budget.
  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    const g = globalThis as Record<string, unknown>
    await new Promise<void>(r => (g.setTimeout as (f: () => void, ms: number) => void)(r, 11_000))
    return { deny: 'decided too late' }
  })

  on('prompt.submit', async ($, e, next) => {
    const t0 = performance.now()
    try {
      const r = await $.tool.call({ tool: 'Read', file_path: 'hooks/hooks.json' })
      report.overrun = { elapsed_ms: Math.round(performance.now() - t0), result: JSON.stringify(r).slice(0, 200) }
    } catch (err) {
      report.overrun = { elapsed_ms: Math.round(performance.now() - t0), threw: String(err).slice(0, 300) }
    }
    const out = await $.env.get('HC_PROBE_OUT')
    if (out) await $.fs.write(out, JSON.stringify(report, null, 2))
    return { drop: 'live-probe: measurements written; no model call' }
  })
}
