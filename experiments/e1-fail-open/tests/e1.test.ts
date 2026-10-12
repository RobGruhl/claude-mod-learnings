import { expect, test } from 'claude-code/testing'

test('a guard that throws without .catch is skipped and the call reaches core', async ($, on) => {
  const reached: string[] = []
  on('tool.call', (_$, e) => {
    reached.push(e.tool === 'Bash' ? `Bash ${e.command}` : e.tool)
    return { result: 'core ran it' } as never
  })
  const bash = await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })
  console.log('E1 bash result:', JSON.stringify(bash))
  const write = await $.tool.call({ tool: 'Write', file_path: '/tmp/x', content: 'x' })
  console.log('E1 write result:', JSON.stringify(write))
  const read = await $.tool.call({ tool: 'Read', file_path: '/tmp/x' })
  console.log('E1 read result:', JSON.stringify(read))
  console.log('E1 reached core:', JSON.stringify(reached))
  expect(reached).toContain('Bash rm -rf build')
  expect(reached).not.toContain('Write')
  expect(JSON.stringify(write)).toContain('refused')
})
