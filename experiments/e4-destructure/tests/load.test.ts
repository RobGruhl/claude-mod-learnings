import { expect, test } from 'claude-code/testing'

test('does the engine load a module that destructures $?', async ($, on) => {
  on('tool.call', () => ({ result: 'core' }) as never)
  on('ui.toast', () => ({ value: undefined }))
  let out: unknown
  try { out = await $.tool.call({ tool: 'Bash', command: 'ls' }) } catch (err) { out = `threw: ${(err as Error).message}` }
  console.log('E4 load:', JSON.stringify(out))
  expect(out).toBeDefined()
})
