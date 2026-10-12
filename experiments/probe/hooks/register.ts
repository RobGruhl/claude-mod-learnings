import type { Register } from 'claude-code'

export const register: Register = on => {
  on('command.run', { command: 'probe' }, async ($, e) => {
    const g = globalThis as Record<string, unknown>
    const has = (k: string) => (typeof g[k] === 'undefined' ? 'no' : typeof g[k])
    let timer = 'not tried'
    try {
      const t0 = performance.now()
      await new Promise<void>((resolve, reject) => {
        const st = g.setTimeout as (f: () => void, ms: number) => unknown
        try { st(() => resolve(), 20) } catch (err) { reject(err) }
      })
      timer = `fired after ${(performance.now() - t0).toFixed(1)} ms`
    } catch (err) {
      timer = `threw: ${String(err)}`
    }
    return { text: JSON.stringify({ Date: has('Date'), performance: has('performance'), setTimeout: has('setTimeout'), setInterval: has('setInterval'), timer, process: has('process'), fetch: has('fetch'), require: has('require'), crypto: has('crypto'), URL: has('URL'), TextEncoder: has('TextEncoder'), AbortController: has('AbortController'), WebSocket: has('WebSocket'), XMLHttpRequest: has('XMLHttpRequest'), Bun: has('Bun'), Deno: has('Deno') }) }
  })
}
