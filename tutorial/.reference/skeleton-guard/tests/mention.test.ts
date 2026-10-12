import { expect, test } from 'claude-code/testing'

test('refuses an @-mentioned secret file and reads the rest', async ($, on) => {
  const read: string[] = []
  on('prompt.mention', (_$, e) => (read.push(e.path), { type: 'file' }))
  const env = await $.prompt.mention({ mention: '.env', path: '/work/app/.env' })
  expect(JSON.stringify(env)).toContain('secrets')
  await $.prompt.mention({ mention: 'README.md', path: '/work/app/README.md' })
  expect(read).toEqual(['/work/app/README.md'])
})
