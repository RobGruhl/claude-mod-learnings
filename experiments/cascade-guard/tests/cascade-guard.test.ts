import { expect, test } from 'claude-code/testing'

// Each test plays the engine beneath the guard: core (tool.call), the decision model (http.fetch),
// the store and the person (an AskUserQuestion call). It records which tiers the command reached.
type Seen = { core: string[]; judge: number; asked: number; stored: string[] }
function engine(on: any, seen: Seen, verdict: { probability: number; doubt: number } | null, answer = 'Deny', ruling?: string) {
  on('tool.call', (_$: unknown, e: any) => {
    // $.ui.ask arrives here as a call of the AskUserQuestion tool: answer it as the person would.
    if (e.tool === 'AskUserQuestion') {
      seen.asked += 1
      return { result: { questions: e.questions, answers: { [e.questions[0].question]: answer } } }
    }
    if (e.tool === 'Bash') seen.core.push(e.command)
    return { result: { stdout: '', stderr: '', interrupted: false } }
  })
  on('http.fetch', () => {
    seen.judge += 1
    return verdict ? { value: { status: 200, ok: true, headers: {}, text: JSON.stringify(verdict) } } : { value: { status: 503, ok: false, headers: {}, text: '' } }
  })
  on('store.get', () => ({ value: ruling }))
  on('store.set', (_$: unknown, e: any) => (seen.stored.push(`${e.key}=${e.value}`), { value: undefined }))
}
const opts = { options: { judgeUrl: 'http://judge.local/destructive' } }
const fresh = (): Seen => ({ core: [], judge: 0, asked: 0, stored: [] })

test('tier 1: rules in code decide without a model or a person', opts, async ($, on) => {
  const seen = fresh(); engine(on, seen, { probability: 0.5, doubt: 0.5 })
  const held = await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })
  await $.tool.call({ tool: 'Bash', command: 'git status' })
  await $.tool.call({ tool: 'Bash', command: 'npm test' })
  expect(JSON.stringify(held)).toContain('destructive by rule')
  expect(seen.core).toEqual(['git status', 'npm test'])
  expect([seen.judge, seen.asked]).toEqual([0, 0])
})

test('tier 2: a confident "safe" from the decision model passes with no person', opts, async ($, on) => {
  const seen = fresh(); engine(on, seen, { probability: 0.03, doubt: 0.2 })
  await $.tool.call({ tool: 'Bash', command: 'mv notes.txt notes.md' })
  expect(seen.core).toEqual(['mv notes.txt notes.md'])
  expect([seen.judge, seen.asked]).toEqual([1, 0])
})

test('tier 4: a likely-destructive verdict goes to the person, and the ruling is stored', opts, async ($, on) => {
  const seen = fresh(); engine(on, seen, { probability: 0.82, doubt: 0.3 }, 'Deny')
  const out = await $.tool.call({ tool: 'Bash', command: 'find . -name "*.log" -delete' })
  expect(JSON.stringify(out)).toContain('refused')
  expect(seen.core).toEqual([])
  expect([seen.judge, seen.asked]).toEqual([1, 1])
  expect(seen.stored).toEqual(['ruling:find . -name "*.log" -delete=deny'])
})

test('a remembered ruling stays in code next time', opts, async ($, on) => {
  const seen = fresh(); engine(on, seen, { probability: 0.82, doubt: 0.3 }, 'Deny', 'allow')
  await $.tool.call({ tool: 'Bash', command: 'find . -name "*.log" -delete' })
  expect(seen.core).toEqual(['find . -name "*.log" -delete'])
  expect([seen.judge, seen.asked]).toEqual([0, 0])
})

test('no decision model answer fails closed to the person', opts, async ($, on) => {
  const seen = fresh(); engine(on, seen, null, 'Allow')
  await $.tool.call({ tool: 'Bash', command: 'chmod -R 777 public' })
  expect(seen.core).toEqual(['chmod -R 777 public'])
  expect([seen.judge, seen.asked]).toEqual([1, 1])
})
