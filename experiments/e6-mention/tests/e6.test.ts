import { expect, test } from 'claude-code/testing'

test('a Read of .env is refused at tool.call; an @-mention of .env is a different event', async ($, on) => {
  const core: string[] = []
  on('tool.call', (_$, e) => (core.push(`tool.call ${e.tool}`), { result: 'file text' }) as never)
  on('prompt.mention', (_$, e) => (core.push(`prompt.mention ${e.path}`), { type: 'file' }) as never)
  const read = await $.tool.call({ tool: 'Read', file_path: '/work/.env' })
  const right = await $.prompt.mention({ mention: 'right/.env', path: '/work/right/.env' })
  const wrong = await $.prompt.mention({ mention: 'wrong/.env', path: '/work/wrong/.env' })
  const other = await $.prompt.mention({ mention: 'other/.env', path: '/work/other/.env' })
  console.log('E6 Read tool .env:', JSON.stringify(read))
  console.log('E6 @right/.env (deny shape):', JSON.stringify(right))
  console.log('E6 @wrong/.env (bad shape):', JSON.stringify(wrong))
  console.log('E6 @other/.env (no mention hook):', JSON.stringify(other))
  console.log('E6 reached core:', JSON.stringify(core))
  expect(core).not.toContain('tool.call Read')
  expect(JSON.stringify(right)).toContain('looks like a secret')
})
