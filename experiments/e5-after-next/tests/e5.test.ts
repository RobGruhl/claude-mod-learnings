import { expect, test } from 'claude-code/testing'

test('failure after next keeps the result; a wrong shape before next is skipped', async ($, on) => {
  const core: string[] = []
  on('tool.call', (_$, e) => {
    core.push(e.tool)
    return { result: `core ran ${e.tool}` } as never
  })
  const bash = await $.tool.call({ tool: 'Bash', command: 'boom' })
  const read = await $.tool.call({ tool: 'Read', file_path: '/tmp/a' })
  console.log('E5 bash:', JSON.stringify(bash), 'read:', JSON.stringify(read), 'core calls:', JSON.stringify(core))
  expect(core).toEqual(['Bash', 'Read'])
})
