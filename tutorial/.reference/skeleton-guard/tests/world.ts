import type { On } from 'claude-code'

// What sits beneath the mod in every test: an in-memory store and answers for each event it raises.
export function world(on: On, start: Record<string, unknown> = {}, options: { brokenStore?: boolean } = {}) {
  const disk = new Map<string, unknown>(Object.entries(start))
  const ran: string[] = []
  on('store.get', (_$, e) => {
    if (options.brokenStore) throw new Error('the store is down')
    return { value: disk.get(e.key) }
  })
  on('store.set', (_$, e) => (disk.set(e.key, e.value), { value: undefined }))
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('classic.SessionStart', () => ({}) as never)
  on('tool.call', (_$, e) => {
    if (e.tool === 'Bash') ran.push(e.command)
    return { result: { stdout: '', stderr: '', interrupted: false } } as never
  })
  return { disk, ran }
}

export const START = { cwd: '/tmp', surface: 'terminal', isInteractive: true } as const
