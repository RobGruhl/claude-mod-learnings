import type { Register } from 'claude-code'

const SECRET = /(^|\/)\.env(\.|$)|id_rsa|\.pem$/

// The guard everyone writes first: refuse Read on secret-looking paths.
export const register: Register = on => {
  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    if (SECRET.test(e.file_path)) return { deny: `secret-guard: ${e.file_path} looks like a secret` }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-guard failed' }))

  // The second door: files named after @ in a prompt. Right shape: { deny } alone.
  on('prompt.mention', { path: /\/right\// }, async ($, e, next) => {
    if (SECRET.test(e.path)) return { deny: `secret-guard: @${e.mention} looks like a secret` }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'secret-guard failed' }))

  // Our first attempt, kept on purpose: { type: null, deny } is not a shape prompt.mention accepts.
  on('prompt.mention', { path: /\/wrong\// }, async ($, e, next) => {
    if (SECRET.test(e.path)) return { type: null, deny: `secret-guard: @${e.mention} looks like a secret` } as never
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `catch handler answered (${next.error.kind})` }))
}
