import { expect, test } from 'claude-code/testing'

test('observe, rewrite, answer, post-process, retry', async ($, on) => {
  const core: string[] = []
  let retries = 0
  on('tool.call', (_$, e) => {
    if (e.command.startsWith('retry')) retries += 1
    core.push(e.command)
    const stdout = e.command.startsWith('retry') && retries === 1 ? 'flaky' : `ran: ${e.command}`
    return { result: { stdout, stderr: '', interrupted: false } } as never
  })
  const out: Record<string, unknown> = {}
  for (const c of ['observe ls', 'rewrite rm -rf /', 'answer pwd', 'post ls', 'retry make']) out[c] = await $.tool.call({ tool: 'Bash', command: c })
  console.log('E3 core saw:', JSON.stringify(core))
  for (const [k, v] of Object.entries(out)) console.log(`E3 ${k} ->`, JSON.stringify((v as { result?: { stdout?: string } }).result?.stdout))
  expect(core).toEqual(['observe ls', 'echo rewritten', 'post ls', 'retry make', 'retry make'])
})
