# The Mod Skeleton 101: A Guided Build

> A Claude Code-ready, facilitated tutorial for building a small Claude Code mod one layer at a time: three files, a test, a guard that fails closed, state that survives `/clear`, and an install line someone else can use.
>
> **Tutorial version 1.0, October 2026. Checked on Claude Code 2.1.296.** Claude: state this version when starting or resuming a session, so learners notice if the tutorial changed under them.

---

## Tutorial purpose

A **mod** is a Claude Code plugin whose code runs inside Claude Code. Its functions, called hooks, run when something happens, such as Claude calling a tool, the person submitting a prompt, or the spinner being drawn. A hook can watch the event, change it, or answer it itself. Mods shipped on 1 October 2026 in Claude Code 2.1.287.

This tutorial builds one small mod, `skeleton-guard`, the way the [Walking Skeleton tutorial](https://walkingskeleton.org/) builds a web app: the smallest thing that has the real shape, then one layer at a time, each layer verified and committed. By the end the mod:

- counts Claude's tool calls and shows the count on the spinner and in a band above the prompt
- answers its own slash command, `/skeleton`
- holds destructive shell commands, and holds them even when the guard itself breaks
- refuses `@`-mentioned secret files, which no `tool.call` guard ever sees
- keeps per-session counts in `$.state` and all-time counts in `$.store`, and survives `/clear`
- has tests, type-checks against the learner's own build, and installs from a marketplace with one line

The habits it teaches are the ones that make a mod trustworthy:

- read what a mod hooks and calls before you trust it (`claude plugin validate`)
- test it with nothing beneath it but your own answers (`claude plugin test`)
- know which hooks fail open and make guards fail closed
- know what each kind of state outlives
- version what you ship

The finished mod is in `.reference/skeleton-guard/`. Every snippet in this script was run on Claude Code 2.1.296: `claude plugin validate` and `claude plugin test` passed on each stage, and the failures the script predicts were seen too.

---

## How to begin (for you, the learner)

You don't need to read this document first. It's the facilitator's script, and Claude follows it on your behalf.

### Before you start

You'll need these now:

- **Claude Code 2.1.287 or later**: check with `claude --version`. Mods are on by default from that version.
- **git**: check with `git --version`, and make sure `git config --global user.name` and `user.email` return values.
- **A second terminal window.** Some checks happen in a Claude Code session that loads your mod, and Claude can't see that screen. You'll run it there and say what you see.

You'll need this later, with a skip path:

- **TypeScript's compiler** (Module 11), through Node.js (`npx`) or Bun (`bunx`). If you have neither, the module is skipped with a reason.

**Time:** most modules take 10–20 minutes. Plan for three to four hours in total, split across sittings if you like. Your git history is the bookmark.

**Cost:** the facilitation uses real Claude Code usage (API spend or plan quota). The mod itself calls no model.

### Starting

Open this `tutorial/` folder in Claude Code (`cd tutorial && claude`). It greets you and offers to begin. If it doesn't, say:

> Walk me through the Mod Skeleton 101 one module at a time, following the Facilitator Contract in 101-mod-skeleton.md.

Then:

- **Answer each reflection question in your own words before Claude shows the Expected intuition.** The thinking is the point.
- **Predict before each check.** One sentence is enough. Being wrong in a prediction is how the model in your head gets corrected.
- **Watch the history grow.** Each module becomes one commit, like `module 7: make the guard fail closed`.

### Coming back later?

Open this folder in Claude Code again and say:

> We're partway through the Mod Skeleton 101. Read the git log in my-mod, work out which module we finished last, and continue from the next one.

---

## The Facilitator Contract

Claude Code: treat this document as the tutorial plan, and this section as your operating contract for every module. If you are resuming in a fresh session, re-read this section first. (`CLAUDE.md` in this folder carries the entry and resume rules; this section is the full contract.)

Teach the habit and the mental model over syntax.

### The module loop

For each module:

1. Explain the intuition behind the layer in 3–6 plain sentences. Explain any term the moment you use it.
2. Inspect the current state of `my-mod/`.
3. Propose the smallest change.
4. Make the change. The **Reference** snippets below are verified on 2.1.296; adapt them to the learner's own choices (a different plugin name, extra patterns) rather than overwriting what they made.
5. **Ask the learner to predict what the check will show, then end your message and wait.** A prediction collected after the check is no prediction.
6. Run the check and compare the result with the prediction.
7. Show what changed (`git diff --stat`, or the diff itself for small changes).
8. Commit with **`module <number>: <short title>`**.
9. Ask the reflection question, **then end your message.** Do not include the Expected intuition, the next module, or a preview of the answer.
10. After they answer: name what's right, add what's missing, then show the Expected intuition. Wait for the learner before starting the next module, unless they ask you to keep going.

### Reflection questions are questions, not answers

- Never show or paraphrase the Expected intuition before the learner has answered.
- If an answer is thin or wrong: point to the part that's right, ask at most one follow-up probe, and never make it feel like grading.
- If they say "I don't know": re-teach from a different angle (an example, an analogy), then ask again.

### Calibrate to the learner

Before Module 0, ask who you're teaching: have they written TypeScript or JavaScript? Used Claude Code's settings hooks, skills or MCP servers? Then calibrate. For someone new to code, read each snippet aloud in plain words before writing it. For an experienced engineer, compress the syntax and go deeper on the chain: who runs first, what fails open, what each state outlives.

### Keep changes small

Each module is one small diff and one commit. Don't combine modules unless the learner asks.

### Prefer verification over confidence

The two headless checks are `claude plugin validate my-mod` and `claude plugin test my-mod`. Run them yourself, for real, and show the output. `claude plugin test` exits 1 on a failing test; `claude plugin validate` exits 1 on an error.

Some checks only exist in an interactive session that loads the mod: the status line, the spinner suffix, the band, `/plugin`, a slash command typed at the prompt. You cannot see that screen. Ask the learner to run it in their second terminal (`claude --plugin-dir my-mod`, started from this `tutorial/` folder) and tell you what they see. Record what they report; never fill it in yourself. If they'd rather skip an interactive check, record the skip.

If a check fails:

1. show the failure
2. explain the likely cause
3. fix the smallest thing
4. rerun the check

**Circuit breaker:** after about three failed attempts at the same check, stop fixing. Explain plainly what's blocking and whether it's environmental (an old Claude Code, mods turned off remotely or by an organization, a missing tool) rather than anything the learner did, and say so. Then offer three choices: simplify the scope, mark the layer skipped with a reason, or pause and resume later.

**Mods turned off:** if `claude plugin test` on a folder reports that hooks modules are turned off in this process, mods can't load on this machine (a remote switch, or an organization's policy). Explain that, and offer to continue with `validate` only, marking each `test` check skipped.

### Commits and the git workflow

In Module 0.5, collect standing consent once: (a) you'll commit after every module without asking each time, (b) commits go directly on the default branch, so the history reads as one layer per commit, and (c) you'll honor any commit-attribution conventions from the learner's own global settings, which always win. Say why committing straight to `main` is a simplification: on a team, changes ride branches and pull requests.

Module 0 is the only module without a commit, so the log always starts at `module 0.5`.

### Resuming across sessions

Run `git log --oneline` in `my-mod/`, map the `module <n>:` commits to the Module Index, re-run the last completed module's Check, recap briefly, and continue from the next module.

### Make AI collaboration explicit

At each layer, say how the practice helps a code-generation tool as well as a person:

- `validate`'s `hooks:` and `calls:` lines are a review Claude and the learner can both read
- tests give Claude a feedback loop that needs no session, no network and no sign-in
- the `.catch` line is a decision written down, so a later edit can't quietly make a guard fail open
- the `PluginState` contract makes Claude declare state before using it
- the type-check catches the misspelling `validate` can't
- the mod's own `CLAUDE.md` tells the next session how to change it safely

### Avoid fake completeness

`skeleton-guard` is a teaching mod, not a safety control. A list of regular expressions can be talked around (`find . -delete`, a script file, a different spelling). Say so when you build the guard, and again in the README.

### End with a teachable artifact

At the end, `my-mod/` is a small mod with a clean history, one layer per commit, that the learner can copy the next time they write a mod.

---

## Module Index

Sixteen modules. Commit messages use the module number, which is how a resuming session finds its place.

| # | Module |
|---|---|
| 0 | Orient: what a mod is, and what this machine runs |
| 0.5 | Initialize version control |
| 1 | Three files: a tool counter |
| 2 | Read it like a reviewer: `claude plugin validate` |
| 3 | The first test |
| 4 | Rewrite what Claude Code draws |
| 5 | Answer for yourself: a slash command |
| 6 | A guard on `tool.call` |
| 7 | Make the guard fail closed |
| 8 | The second door: `@`-mentioned files |
| 9 | State that redraws: `$.state` and a band |
| 10 | State that lasts: `$.store` and the `/clear` trap |
| 11 | Type-check against your build |
| 12 | A README with an install line, and a CLAUDE.md for the mod |
| 13 | Package it as a marketplace and install it |
| 14 | Ship one change through everything |

---

## What the learner should understand by the end

- A mod's hooks form a chain: each `($, e, next)` hook can observe, rewrite (`next({ ...e, ... })`) or answer (return without calling `next`).
- Everything a mod does outside its own code goes through `$`, which is why `validate` can list it before anything runs.
- A hook that throws, returns the wrong shape or overruns its budget is skipped. For a guard that means the thing it guarded goes ahead: guards fail open unless they have a `.catch`.
- A `tool.call` guard is not a whole guard: `@`-mentioned files are read with no tool call.
- Module variables die at a hot reload, `$.state` dies at `/clear` (without `session.start` firing again), and `$.store` outlives the session.
- Tests stand in for Claude Code beneath the mod, so a test must answer every event and `$` call the mod makes.

The key mental shift:

> A mod is code inside the loop, with your permissions. Make it easy to read, prove what it does with tests, and decide on purpose what happens when it breaks.

---

# Module 0: Orient

## Goal

Know what a mod is, check that this machine can run one, and know how to turn mods off.

## Intuition

Claude Code has several ways to extend it, and they differ in where they run. A skill is instructions Claude reads. An MCP server is a separate program that gives Claude tools. A settings hook is a shell command Claude Code runs on an event. A mod is different: its functions run *inside* Claude Code, in the event chain itself, so it can change a tool call, a prompt, or what the screen draws. That reach is the point, and it's also why a mod deserves the same care as any code you run with your own permissions.

Before writing one, know how to stop one. If a mod misbehaves, you want the off switch in your hands, not in a search engine.

## Claude Code instructions

**Guard:** this folder holds the tutorial's own files. Do not build the mod here. The mod goes in `my-mod/` (Module 0.5 creates it as its own git repository).

**Toolchain check:** run `claude --version` (2.1.287 or later is required; this script was checked on 2.1.296), `git --version`, and `git config user.name` / `git config user.email`. Help fix anything missing. Mention that Module 11 will want `npx` (Node.js) or `bunx` (Bun), with a skip path.

**Can mods load here?** Make an empty scratch folder outside `my-mod/` (your scratchpad, or a temporary directory) and run `claude plugin test <that folder>`. The troubleshooting docs suggest this. Verified on 2.1.296: where mods can load, it answers `no hooks module to load; there is no hooks/hooks.json naming one in "modules"`; where they're switched off in this process, it says hooks modules are turned off. Delete the scratch folder afterwards.

Then explain, in plain words, the three ways to turn mods off, from smallest to largest:

- one mod: disable or uninstall it in `/plugin`
- every installed mod for one session: start with `claude --safe-mode`
- every mod you installed, in every session: `"disableAllHooks": true` in `~/.claude/settings.json` (this also stops your settings hooks and custom status line)

Mention that an organization can limit mods through managed settings, and that `--safe-mode` and `disableAllHooks` don't stop Claude Code's built-in mods.

## Implementation task

No files yet. Write a short orientation in the conversation:

```text
This machine:
- Claude Code version:
- Mods can load here: yes / no (what claude plugin test said)
- git identity set: yes / no
- Module 11 tool available: npx / bunx / neither
How I'd turn a misbehaving mod off:
```

## Check

Each line of the orientation comes from a command you actually ran.

## Done when

- The orientation is written and every line is backed by a command's output.
- The learner can name one way to turn off a single mod and one way to turn off all of them.

## Reflection prompt

> A skill and a mod can both change how Claude Code behaves. What can a mod do that a skill can't, and what does that ask of you before you install one?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

A skill is text Claude reads; Claude decides what to do with it. A mod is code Claude Code runs at the events themselves: it can rewrite a tool call, refuse it, approve it, redraw the interface, read your files and make network requests, all with your permissions and without asking Claude. So before installing one you read what it hooks and calls (`claude plugin validate`, Module 2) and trust its author the way you'd trust any program you run. Mods aren't sandboxed.

</details>

---

# Module 0.5: Initialize version control

## Goal

Make `my-mod/` a git repository before any code exists.

## Intuition

Version control is what makes every later step safe to try. A change you don't like is one `git revert` away, which matters even more when Claude is writing the code. The repository is also your record: by the end, `git log` reads as the list of layers a mod needs.

Two files Claude Code writes beside a mod shouldn't be committed: the typings it lays in `.claude-plugin/types/` each time it loads the mod from your folder (they belong to your build, and they're rewritten anyway), and `.claude/settings.local.json`, which Module 13 creates and which holds settings for this machine only.

## Claude Code instructions

Create `my-mod/` inside this tutorial folder and run `git init` there. Never initialize git in the tutorial folder itself, and never commit to the repository the tutorial belongs to.

**Collect standing consent for the git workflow, once** (see the contract): commit after every module, straight on the default branch, honoring the learner's own attribution settings.

Create `my-mod/.gitignore`:

```gitignore
# Typings Claude Code writes beside the mod each time it loads it from this folder
.claude-plugin/types/
# Settings for this machine only (Module 13)
.claude/settings.local.json
.DS_Store
node_modules/
```

Commit: `module 0.5: initialize version control`.

## Check

`git -C my-mod status` is clean and `git -C my-mod log --oneline` shows one commit.

## Done when

- `my-mod/` is its own git repository with one commit.
- `.gitignore` ignores the generated typings and local settings.

## Reflection prompt

> Why ignore the `.claude-plugin/types/` folder Claude Code writes, instead of committing it with the mod?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

It describes the API of the Claude Code build that loaded the mod, and Claude Code rewrites it on every load. Committing it would freeze one build's view of the API into your history, and someone on a different version would be type-checking against the wrong contract. The source of truth is whatever your own build writes today.

</details>

---

# Module 1: Three files: a tool counter

## Goal

Write the smallest complete mod and load it in a real session.

## Intuition

A mod is three files. `plugin.json` names the plugin. `hooks/hooks.json` points at one code file, the hooks module; its `modules` key is what makes a plugin a mod. The hooks module exports `register(on)`, and each `on(event, hook)` call adds a hook to that event's chain.

Every hook has the same shape: `($, e, next)`. `e` is the event, here the tool call Claude is about to make. `next(e)` hands the event on to the rest of the chain and, at the end, to Claude Code's own behaviour. `$` is the only way out of your code: drawing, files, the network, everything goes through it.

No build step and no Node are needed. Claude Code loads `.ts` directly.

## Claude Code instructions

Explain each file as you write it. If the learner wants a different plugin name, use it everywhere (it must not start with `claude-`; Module 2 shows why).

Reference (verified on 2.1.296):

`my-mod/.claude-plugin/plugin.json`

```json
{
  "name": "skeleton-guard",
  "version": "0.1.0",
  "description": "The Mod Skeleton: a small mod built one module at a time",
  "author": { "name": "Your Name" }
}
```

`my-mod/hooks/hooks.json`

```json
{ "modules": ["./register.ts"] }
```

`my-mod/hooks/register.ts`

```ts
import type { Register } from 'claude-code'

// Module 1: count Claude's tool calls and show the count on the status line under the prompt.
let count = 0

export const register: Register = on => {
  on('tool.call', ($, e, next) => {
    count += 1
    $.ui.status(`skeleton-guard: ${count} tool calls`)
    return next(e)
  })
}
```

Point out the three parts of the hook: it **observes** (counts), calls `$` to draw, and calls `next(e)` so the tool runs as usual. The `import type` line is erased when the module loads; it only helps editors and the type-check in Module 11.

## Implementation task

Write the three files. Then the learner loads the mod in their second terminal, started from this `tutorial/` folder:

```bash
claude --plugin-dir my-mod
```

In that session they ask Claude to do something that uses a tool (for example, "list the files here") and run `/plugin`.

## Check

Ask for a prediction first: what will the status line under the prompt say after Claude lists the files, and what will `/plugin` show?

Interactive check (the learner reports): the status line reads `skeleton-guard: 1 tool calls` (or more, one per tool call), and the dim line under `/plugin`'s tabs reads `1 mod active · skeleton-guard`. The folder is watched, so an edit to `register.ts` reloads the mod in that session.

If the learner can't run a second session, record the skip; Module 2's `validate` and Module 3's test cover the same code headlessly.

## Done when

- The three files exist and the mod loaded in a real session (or the skip is recorded).
- The learner can say what `next(e)` does.

Commit: `module 1: three files, a tool counter`.

## Reflection prompt

> What would happen to Claude's tool calls if the hook forgot to `return next(e)`?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

A hook that returns without calling `next` answers the event itself, so the tool would never run: the rest of the chain and Claude Code's own behaviour never see the call. (Returning nothing at all is a wrong-shaped answer: verified on 2.1.296, such a hook is skipped with `returned no result` and the call goes on, which is its own lesson for Module 7.) `next` is the hand-off that makes a hook a link in a chain rather than a wall.

</details>

---

# Module 2: Read it like a reviewer: `claude plugin validate`

## Goal

Learn to read what a mod hooks and calls, before anything runs.

## Intuition

A mod's code can only reach the world through `$`, and Claude Code refuses to load a module whose use of `$` it can't read (for example, `$` passed into a helper that isn't a top-level function in the same file). That's what makes `claude plugin validate` useful: it reads the source the way the engine will and lists every event the mod hooks and every `$` call it makes. It's the review you'd do before installing someone else's mod, and the first check to run on your own.

`validate` also enforces names. A third-party plugin can't take a name that passes as Anthropic's own.

## Claude Code instructions

Run `claude plugin validate my-mod` and walk through the `hooks:`, `gating hook without .catch:` and `calls:` lines. Explain "gating": `tool.call` is a site whose answer can refuse what was asked. Module 7 comes back to that line.

Then demonstrate the name rule on a throwaway copy, not on `my-mod/`: copy the folder to your scratchpad, change the name to `claude-skeleton`, ask the learner to predict, and validate the copy. Delete the copy afterwards.

## Implementation task

No change to `my-mod/` beyond what the learner chooses. (If they used a reserved name in Module 1, fix it now.)

## Check

Ask for predictions first: which `calls:` will `validate` list for `my-mod`, and what happens to the renamed copy?

Verified on 2.1.296: `my-mod` passes with

```text
❯ ./register.ts hooks: tool.call
❯ ./register.ts gating hook without .catch: tool.call
❯ ./register.ts calls: $.ui.status
✔ Validation passed
```

and the copy named `claude-skeleton` fails (exit 1) with `Plugin name "claude-skeleton" is reserved: it passes as one of Anthropic's own`, which lists the reserved prefixes (`claude-`, `anthropic-`, `anthropics-`, `cc-plugin-`).

## Done when

- The learner can point to the line that says what the mod calls.
- The reserved-name failure was seen on a copy, and `my-mod` validates.

Commit (if anything changed; otherwise an empty commit is fine, `git commit --allow-empty`): `module 2: read it like a reviewer`.

## Reflection prompt

> You're about to install a stranger's mod that promises to "make the spinner prettier". Which line of `validate`'s output would make you stop, and why?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

The `calls:` line (and the `env reads`/`state` lines when present). A spinner mod needs `ui.render` and little else. If `calls:` lists `$.http.fetch`, `$.process.run`, `$.fs.read` or `$.env.get`, it can send your files or secrets somewhere or run programs, and nothing about a spinner needs that. Because every effect goes through `$`, the list is complete for what the engine will let the module do.

</details>

---

# Module 3: The first test

## Goal

Put a safety net under the counter, and watch it catch a break.

## Intuition

`claude plugin test` runs a mod's `*.test.ts` files against the real engine, with no session, no network and no sign-in. The test's own hooks sit *beneath* the mod and stand in for Claude Code. Nothing else is down there, so a test must answer every event and `$` call the mod makes: here, the tool call (with a fake result) and `$.ui.status`.

That sounds like extra work. It's actually the lesson: the test makes you write down exactly what the mod depends on.

## Claude Code instructions

Reference (verified on 2.1.296), `my-mod/tests/counter.test.ts`:

```ts
import { expect, test } from 'claude-code/testing'

// In a test, the hooks `on` registers sit beneath the mod and stand in for Claude Code:
// they answer every event and $ call the mod makes.
test('shows the running count on the status line', async ($, on) => {
  const shown: unknown[] = []
  on('ui.status', (_$, e) => (shown.push(e.text), { value: undefined }))
  on('tool.call', () => ({ result: { stdout: '', stderr: '', interrupted: false } }) as never)

  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Bash', command: 'pwd' })
  expect(shown).toEqual(['skeleton-guard: 1 tool calls', 'skeleton-guard: 2 tool calls'])
})
```

Explain `{ value: undefined }`: a `$` call's answer is wrapped in `{ value }`.

## Implementation task

Add the test. Run it.

## Check

Run `claude plugin test my-mod`. It passes (`1 pass`).

**Then break it on purpose, twice.** Ask for a prediction before each:

1. Change the status text in `register.ts` (not the test), for example `tool calls` to `tool cals`. Verified: the test fails (exit 1) and prints the expected and received arrays side by side. Revert and rerun to green.
2. Delete the test's `on('ui.status', …)` line. Verified: the test fails with `Received: []`, and the engine reports `$.ui.status dropped: HooksError: no implementation for ui.status`. That's what "nothing sits beneath the mod" means. Restore the line and rerun to green.

## Done when

- The test passes, and the learner has seen it fail both ways and pass again.

Commit: `module 3: the first test`.

## Reflection prompt

> The test had to answer `$.ui.status` itself. What does that tell you about everything your mod depends on, and why is that useful when Claude writes the next change?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Every outside dependency of a mod is a `$` call or an event, and the test has to name each one, so the test file is an honest list of what the mod needs. For Claude it's a feedback loop that runs in a fraction of a second with no session: try a change, run `claude plugin test`, read the failure, fix it. Without the test, a change could only look right; with it, the change is checked.

</details>

---

# Module 4: Rewrite what Claude Code draws

## Goal

Learn the second move, **rewrite**, by changing Claude Code's own spinner.

## Intuition

A hook has three moves. It can **observe** (Module 1), **rewrite** the event before passing it on with `next({ ...e, ... })`, or **answer** it without calling `next` (Modules 5 and 6). Drawing is an event too: `ui.render` fires each time Claude Code draws a component, and a hook can keep Claude Code's own drawing while changing its props. Here, the spinner keeps its word and gains a suffix.

Because the count changes outside of drawing, the counter asks for a redraw with `$.ui.invalidate('ui.render')`.

## Claude Code instructions

Reference (verified on 2.1.296). In `register.ts`, add the invalidate call inside the `tool.call` hook, after `$.ui.status(...)`:

```ts
    $.ui.invalidate('ui.render')
```

and a second hook inside `register`:

```ts
  // Module 4: keep Claude Code's spinner and add the count after its word.
  on('ui.render', { component: 'Spinner' }, ($, e, next) =>
    next({ ...e, props: { ...e.props, suffix: ` · tool calls: ${count}…` } }),
  )
```

Explain the matcher (`{ component: 'Spinner' }`): the hook runs only for that component.

The counter test now needs one more answer beneath the mod. Add to it:

```ts
  on('ui.invalidate', () => ({ value: undefined }))
```

## Implementation task

Make the two changes and update the test.

## Check

Prediction first: will `validate` list a new event and a new call? Will the existing test still pass?

Run `claude plugin validate my-mod` (verified: `hooks:` gains `ui.render{component=Spinner}`, `calls:` gains `$.ui.invalidate`) and `claude plugin test my-mod` (passes).

Interactive check (the learner reports): in their second session (it reloaded when the file was saved), while Claude works the spinner reads like `Thinking · tool calls: 3…`.

## Done when

- `validate` lists the spinner hook, the test passes, and the spinner change was seen or the skip recorded.

Commit: `module 4: rewrite what Claude Code draws`.

## Reflection prompt

> The hook passed Claude Code's own spinner on with one prop changed instead of drawing a new spinner. Why is that the polite default when other mods might hook the same component?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Calling `next` with changed props keeps the chain intact: mods further down and Claude Code's own drawing still get their turn, so several mods can each add something. A hook that returns its own tree instead replaces everything beneath it, including other mods' work. Rewrite when you can, replace only when you mean to own the whole thing.

</details>

---

# Module 5: Answer for yourself: a slash command

## Goal

Learn the third move, **answer**, with a slash command that runs your code with no Claude turn.

## Intuition

A mod can register its own `/command`. The registration happens in `session.start`, which Claude Code awaits before the first prompt, so the command exists from turn one. Running it raises `command.run`, and a hook that returns `{ text }` answers it: no tool, no model call, just your function. (Claude reads that text too, as the command's output.)

## Claude Code instructions

Reference (verified on 2.1.296). Add inside `register`:

```ts
  // Module 5: register /skeleton when the session starts; answer it in command.run.
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'skeleton', description: 'Show what skeleton-guard has counted' })
    return next(e)
  })

  on('command.run', { command: 'skeleton' }, () => ({ text: `skeleton-guard has counted ${count} tool calls.` }))
```

Add `my-mod/tests/command.test.ts`:

```ts
import { expect, test } from 'claude-code/testing'

test('/skeleton reports the count', async ($, on) => {
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.invalidate', () => ({ value: undefined }))
  on('tool.call', () => ({ result: { stdout: '', stderr: '', interrupted: false } }) as never)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  const out = await $.command.run({ command: 'skeleton', args: '' } as never)
  expect(out.text).toBe('skeleton-guard has counted 1 tool calls.')
})
```

Point out `{ value: { command: e.name } }`: the registration's answer must have the right shape. A test that answers it with nothing makes the engine skip the mod's `session.start` hook, with a line saying so in the test output.

## Implementation task

Add the command and its test.

## Check

Prediction first: what new line will `validate` print about the command hook?

`claude plugin validate my-mod` (verified: `answers its own command: command.run{command=skeleton}`) and `claude plugin test my-mod` (2 pass).

Interactive check (the learner reports): in the second session, after the reload, `/skeleton` appears in the command list and prints the count.

## Done when

- `/skeleton` is registered, answered, and tested.

Commit: `module 5: answer for yourself, a slash command`.

## Reflection prompt

> `/skeleton` answered without starting a Claude turn. Name one thing you'd want a command like that for, and one reason it's cheaper than asking Claude.

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Anything whose answer your code already knows: a count, a status, a toggle, opening a pane. It costs no model tokens, takes milliseconds, and works even while Claude is busy (a command registered with `immediate: true` runs mid-turn). Asking Claude to report a number your mod is holding would spend a turn to get a less reliable answer.

</details>

---

# Module 6: A guard on `tool.call`

## Goal

Hold destructive shell commands before they run.

## Intuition

`tool.call` sits in front of every tool. Answering it with `{ deny: 'why' }` instead of calling `next` stops the call, and Claude reads the reason, so it can tell the person what happened. That's the same answer move as the slash command, used to refuse.

Say it plainly: a list of patterns is a speed bump, not a wall. `find . -delete`, a script file, or a different spelling gets past it. It's still worth having, and it's the right place to learn how guards behave.

## Claude Code instructions

Reference (verified on 2.1.296). At the top of `register.ts`:

```ts
// Module 6: shell commands this mod holds.
const DESTRUCTIVE = [/\brm\s+-[a-z]*r[a-z]*f\b|\brm\s+-[a-z]*f[a-z]*r\b/, /\bgit\s+push\b.*(--force\b|\s-f\b)/]
```

The `tool.call` hook becomes:

```ts
  // Modules 1 and 6: count every tool call; hold destructive shell commands.
  on('tool.call', ($, e, next) => {
    if (e.tool === 'Bash') {
      const command = e.command.trim()
      if (DESTRUCTIVE.some(re => re.test(command))) {
        return { deny: `skeleton-guard: "${command}" is destructive; ask the person to run it themselves.` }
      }
    }
    count += 1
    $.ui.status(`skeleton-guard: ${count} tool calls`)
    $.ui.invalidate('ui.render')
    return next(e)
  })
```

Point out that `e.command` is typed only after `e.tool === 'Bash'` narrows the event, and that the guard judges *before* it calls `next`.

Add `my-mod/tests/guard.test.ts`:

```ts
import { expect, test } from 'claude-code/testing'

import type { On } from 'claude-code'

function world(on: On) {
  const ran: string[] = []
  on('ui.status', () => ({ value: undefined }))
  on('ui.invalidate', () => ({ value: undefined }))
  on('tool.call', (_$, e) => {
    if (e.tool === 'Bash') ran.push(String(e.command))
    return { result: { stdout: '', stderr: '', interrupted: false } } as never
  })
  return ran
}

test('holds destructive shell commands and lets the rest run', async ($, on) => {
  const ran = world(on)
  const held = await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })
  expect(JSON.stringify(held)).toContain('destructive')
  await $.tool.call({ tool: 'Bash', command: 'ls -la' })
  expect(ran).toEqual(['ls -la'])
})
```

`ran` records what reached "Claude Code" beneath the mod, so the test proves the held command never got there.

## Implementation task

Add the guard and its test.

## Check

Prediction first: which commands will reach `ran`?

`claude plugin test my-mod`: 3 pass (verified). Optional interactive check: in the second session, ask Claude to run `rm -rf build` in an empty scratch folder; the call is refused with the guard's reason.

## Done when

- The guard holds `rm -rf` and force pushes, lets other commands run, and the test proves both.

Commit: `module 6: a guard on tool.call`.

## Reflection prompt

> The deny message says "ask the person to run it themselves". Who reads that message, and why does its wording matter?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Claude reads it, as the tool call's result, and decides what to do next. A bare "denied" invites Claude to try another spelling of the same command; a reason plus an instruction ("ask the person") steers it to the right next step. A guard's message is a prompt to the model.

</details>

---

# Module 7: Make the guard fail closed

## Goal

Find out what happens when the guard itself breaks, then decide it on purpose.

## Intuition

A hook that throws, returns the wrong shape, or runs past its budget (10 seconds of its own time) is **skipped**, and the chain carries on without it. For most hooks that's a kindness: a broken spinner mod shouldn't break your session. For a guard it means the thing it was guarding goes ahead. Guards **fail open** by default.

A `.catch` handler on the registration changes that. If the hook fails before it called `next`, the handler answers in its place; `next.called` tells it which case it's in. `validate` has been printing `gating hook without .catch` since Module 2. This module makes that line say `with`.

## Claude Code instructions

First, prove the failure. Add a test where the guard can't read the call: a Bash call with no `command`, so `e.command.trim()` throws. Write it the way you *want* the guard to behave:

```ts
test('fails closed: a call the guard cannot read is held', async ($, on) => {
  const ran = world(on)
  const held = await $.tool.call({ tool: 'Bash' } as never)
  expect(JSON.stringify(held)).toContain('could not check')
  expect(ran).toEqual([])
})
```

Ask for a prediction, run it, and read the output together. Verified on 2.1.296: it fails, the call reached `ran` (`Received: ["undefined"]`), and the engine reports `skeleton-guard's tool.call hook was skipped: skeleton-guard: undefined is not an object (evaluating 'e.command.trim')`. The guard broke and the call ran.

Then add the handler to the end of the `tool.call` registration:

```ts
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'skeleton-guard could not check this call, so it is held.' }))
```

Explain both branches: if the hook had already called `next`, the call was judged and settled, so `next(e)` replays that result and nothing runs twice; if not, the handler refuses.

## Implementation task

Add the failing test, see it fail, add the `.catch`, see it pass.

## Check

Prediction first: what will `validate` now say about `tool.call`, and will the new test pass?

`claude plugin validate my-mod` (verified: `gating hook with .catch: tool.call`) and `claude plugin test my-mod` (4 pass).

## Done when

- The learner has seen the guard fail open and then fail closed, and `validate` reports the `.catch`.

Commit: `module 7: make the guard fail closed`.

## Reflection prompt

> Failing closed means that when the guard breaks, even a harmless `ls` is held. When is that the right trade, and when would you rather fail open?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Fail closed when letting the wrong thing through is worse than stopping the right thing: a guard against destroying work, leaking secrets, or breaking an organization's policy. Fail open when the hook is a convenience (a counter, a prettier spinner, a hint) and blocking would break the session for no safety gain. The point is to decide it and write it down. Without the `.catch`, the code decides for you, and it picks open.

</details>

---

# Module 8: The second door: `@`-mentioned files

## Goal

Close a gap the `tool.call` guard can't see.

## Intuition

When a person types `@.env` in a prompt, Claude Code reads that file and attaches it to the prompt. No tool is called for that read, so no `tool.call` hook ever sees it. The event for it is `prompt.mention`, which fires once per mentioned path before the read. A guard that keeps Claude away from secrets has to hook both doors.

## Claude Code instructions

First, prove the gap. Add `my-mod/tests/mention.test.ts` with what you'd naively expect (the mod holds nothing for mentions yet):

```ts
import { expect, test } from 'claude-code/testing'

test('refuses an @-mentioned secret file and reads the rest', async ($, on) => {
  const read: string[] = []
  on('prompt.mention', (_$, e) => (read.push(e.path), { type: 'file' }))
  const env = await $.prompt.mention({ mention: '.env', path: '/work/app/.env' })
  expect(JSON.stringify(env)).toContain('secrets')
  await $.prompt.mention({ mention: 'README.md', path: '/work/app/README.md' })
  expect(read).toEqual(['/work/app/README.md'])
})
```

Prediction, run, read. Verified on 2.1.296: it fails, and `read` holds `/work/app/.env`: the file was read, and the `tool.call` guard never ran.

Then add the guard (reference, verified):

```ts
// Module 8: files a prompt may not pull in with @.
const SECRET = /(^|\/)\.env(\.|$)|\.pem$|(^|\/)id_(rsa|ed25519)$/
```

```ts
  // Module 8: the second door. An @-mentioned file is read without any tool.call.
  on('prompt.mention', { path: SECRET }, () => ({ deny: 'skeleton-guard: that file may hold secrets.' })).catch(
    ($, e, next) => (next.called ? next(e) : { deny: 'skeleton-guard could not check this file, so it is held.' }),
  )
```

The matcher `{ path: SECRET }` means the hook runs only for matching paths. It gets its own `.catch` for the same reason as Module 7.

## Implementation task

Add the failing test, see it fail, add the guard, see it pass.

## Check

Prediction first. `claude plugin validate my-mod` (verified: `gating hook with .catch: prompt.mention{path=…}`) and `claude plugin test my-mod` (5 pass).

## Done when

- The learner has seen an `@`-mentioned `.env` get through the `tool.call` guard, and then seen it refused.

Commit: `module 8: the second door`.

## Reflection prompt

> What's the general lesson about guarding with mods, beyond `.env` files?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

A guard covers the events it hooks and nothing else. Before trusting one, list every way the thing you're guarding can happen (a tool call, a mention, a subagent, a command, a mod's own `$.fs.read`) and check each has a hook. "I guarded `tool.call`" is not "I guarded file reads". Mods' own `$.fs` and `$.process` calls don't pass deny rules either, which is one more door.

</details>

---

# Module 9: State that redraws: `$.state` and a band

## Goal

Move the count into `$.state` and draw it in a band above the prompt.

## Intuition

The count has lived in a module variable since Module 1. A hot reload (every save) runs `register` again in a fresh environment, so that variable resets to zero. `$.state` is held by Claude Code for the session and survives a reload. It's also reactive: a drawing that reads a state value is subscribed to it, and a write redraws exactly those drawings, so no more `$.ui.invalidate`.

State must be declared. A `types/index.d.ts` file names each value in a `PluginState` interface, and `plugin.json` points at it. `validate` refuses state that isn't declared.

The band above the prompt (`AbovePrompt`) replaces the status line: the status line is something you push, the band is drawn from state.

## Claude Code instructions

This module changes several files at once: say so, and walk through each.

1. Rename `hooks/register.ts` to `hooks/register.tsx` (the band uses JSX) and update `hooks/hooks.json` to `{ "modules": ["./register.tsx"] }`.
2. Add `"types": "./types/index.d.ts"` to `plugin.json`.
3. Add `my-mod/types/index.d.ts`:

```ts
export type Tally = { tools: number; held: number }

declare module 'claude-code' {
  interface PluginState {
    'skeleton-guard': { session: Tally }
  }
}
```

4. Rewrite `register.tsx`. Reference (verified on 2.1.296):

```tsx
import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const DESTRUCTIVE = [/\brm\s+-[a-z]*r[a-z]*f\b|\brm\s+-[a-z]*f[a-z]*r\b/, /\bgit\s+push\b.*(--force\b|\s-f\b)/]
const SECRET = /(^|\/)\.env(\.|$)|\.pem$|(^|\/)id_(rsa|ed25519)$/

// Module 9: the count moves from a module variable into $.state, which survives a hot reload
// and redraws every drawing that read it.
const session = atom({ plugin: 'skeleton-guard', key: 'session' } as const, { tools: 0, held: 0 })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'skeleton', description: 'Show what skeleton-guard has counted and held' })
    return next(e)
  })

  on('command.run', { command: 'skeleton' }, async $ => {
    const now = await read($, session)
    return { text: `skeleton-guard: this session ${now.tools} tool calls, ${now.held} held.` }
  })

  on('tool.call', async ($, e, next) => {
    if (e.tool === 'Bash') {
      const command = e.command.trim()
      if (DESTRUCTIVE.some(re => re.test(command))) {
        await update($, session, t => ({ ...t, held: t.held + 1 }))
        return { deny: `skeleton-guard: "${command}" is destructive; ask the person to run it themselves.` }
      }
    }
    await update($, session, t => ({ ...t, tools: t.tools + 1 }))
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'skeleton-guard could not check this call, so it is held.' }))

  on('prompt.mention', { path: SECRET }, () => ({ deny: 'skeleton-guard: that file may hold secrets.' })).catch(
    ($, e, next) => (next.called ? next(e) : { deny: 'skeleton-guard could not check this file, so it is held.' }),
  )

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const now = await read($, session)
    return next({ ...e, props: { ...e.props, suffix: ` · tool calls: ${now.tools}…` } })
  })

  // Module 9: a band above the prompt. Reading $.state here subscribes it; a write redraws it.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const now = await read($, session)
    if (e.props.hasSurvey) return next(e)
    const { Text } = $.ui.resolve(e)
    return (
      <Text dimColor>
        skeleton-guard · this session {now.tools} tools, {now.held} held
      </Text>
    )
  })
}
```

Point out: `plugin` and `key` in the atom are literals and must match the plugin's name; elements (`Text`) come from `$.ui.resolve(e)`, not globals; the band yields to a survey (`hasSurvey`); a render hook never writes state.

5. Tests: delete `tests/counter.test.ts` (the status line is gone), remove the `ui.status` and `ui.invalidate` answers from `guard.test.ts` (nothing calls them now), and replace `tests/command.test.ts` with:

```ts
import { expect, test } from 'claude-code/testing'

test('/skeleton reports the counts kept in $.state', async ($, on) => {
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('tool.call', () => ({ result: { stdout: '', stderr: '', interrupted: false } }) as never)
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Bash', command: 'rm -rf /' })
  const out = await $.command.run({ command: 'skeleton', args: '' } as never)
  expect(out.text).toBe('skeleton-guard: this session 1 tool calls, 1 held.')
})
```

The kit holds `$.state` itself, so the test doesn't answer it.

## Implementation task

Make the changes above.

## Check

Prediction first: what happens if `plugin.json` doesn't point at the types file? Show it on a scratch copy without the `"types"` line. Verified: `validate` fails with `skeleton-guard.session is not declared: the manifest's types contract must name it in interface PluginState`.

Then on `my-mod`: `claude plugin validate my-mod` (verified: `state writes: skeleton-guard.session`, `state reads: skeleton-guard.session`) and `claude plugin test my-mod` (4 pass).

Interactive check (the learner reports): the band above the prompt reads `skeleton-guard · this session N tools, M held` and updates as Claude works; save `register.tsx` with no change and the count is kept across the reload. This can't be checked headlessly.

## Done when

- Counts live in declared `$.state`, the band draws from them, and tests pass.

Commit: `module 9: state that redraws`.

## Reflection prompt

> Why does the band redraw on its own now, when the spinner in Module 4 needed `$.ui.invalidate`?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Reading a `$.state` value inside `ui.render` subscribes that drawing to the value, and every write to it redraws the subscribers. A module variable is invisible to Claude Code, so a change to it needed a manual nudge. Declaring state also means Claude Code holds it, which is why it survives a hot reload when a module variable doesn't.

</details>

---

# Module 10: State that lasts: `$.store` and the `/clear` trap

## Goal

Keep all-time counts across sessions, and survive `/clear`.

## Intuition

Three lifetimes now:

- a module variable dies at every hot reload
- `$.state` lives for the session and survives a reload, but `/clear`, `/resume` and `/branch` reset it to its default, and `session.start` does **not** fire again afterwards
- `$.store` is a small JSON store per plugin, shared by every session on the machine, that outlives the session

The trap: a mod that copies `$.store` into `$.state` at `session.start` and then writes `$.state` back to the store will, after a `/clear`, write the default (zero) over the stored total. The fix is to treat `$.store` as the source of truth, writing from what is stored, and to reload after a `/clear` in the classic `SessionStart` event, which does fire then with `source: 'clear'`.

## Claude Code instructions

Reference (verified on 2.1.296). `types/index.d.ts` gains `sessions` and an `allTime` value:

```ts
export type Tally = { sessions: number; tools: number; held: number }

declare module 'claude-code' {
  interface PluginState {
    'skeleton-guard': { session: Tally; allTime: Tally }
  }
}
```

In `register.tsx`, change the imports and add the store helpers:

```tsx
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Tally } from '../types'

const ZERO: Tally = { sessions: 0, tools: 0, held: 0 }
const KEY = 'all-time'
const session = atom({ plugin: 'skeleton-guard', key: 'session' } as const, ZERO)
const allTime = atom({ plugin: 'skeleton-guard', key: 'allTime' } as const, ZERO)

async function stored($: EngineInterface): Promise<Tally> {
  return ((await $.store.get(KEY)) as Tally | undefined) ?? ZERO
}

// $.store is the source of truth: every write starts from what is stored, never from $.state.
async function bump($: EngineInterface, field: keyof Tally) {
  if (field !== 'sessions') await update($, session, t => ({ ...t, [field]: t[field] + 1 }))
  const before = await stored($)
  const total = { ...before, [field]: before[field] + 1 }
  await $.store.set(KEY, total)
  await update($, allTime, () => total)
}
```

Then: `session.start` calls `await bump($, 'sessions')` after registering the command; the `tool.call` hook calls `await bump($, 'held')` and `await bump($, 'tools')` in place of its two `update(...)` lines; `/skeleton` and the band read `allTime` too; and a new hook reloads after `/clear`:

```tsx
  // Module 10: /clear, /resume and /branch reset $.state and do not fire session.start again.
  on('classic.SessionStart', async ($, e, next) => {
    if (e.source === 'clear' || e.source === 'resume' || e.source === 'fork') {
      const total = await stored($)
      await update($, allTime, () => total)
    }
    return next(e)
  })
```

The full file at this point is `.reference/skeleton-guard/hooks/register.tsx` without Module 14's third pattern. Compare against it if a check fails.

Tests: the mod now calls the store, so every test must answer it. Move the shared answers into `my-mod/tests/world.ts` (copy `.reference/skeleton-guard/tests/world.ts`: an in-memory store, answers for `session.start`, `command.register`, `classic.SessionStart` and `tool.call`, and a `brokenStore` option), point `guard.test.ts` at it, and replace `command.test.ts` with `tests/tally.test.ts` from the reference: one test for `/skeleton`'s text, one that raises `classic.SessionStart({ source: 'clear' })` and checks the stored totals aren't overwritten with zeros.

Explain the one kit rule that bites here: a test may register only one hook per event, which is why a broken store is an option of `world()` and not a second `store.get` hook. (Verified: a second `on('store.get', …)` makes the test fail with `on("store.get") registered twice`.)

Add one more test to `guard.test.ts`, from the reference: when the store throws, the guard is held by its `.catch`. Ask the learner whether that's what they want: counting now sits inside the gate, so a broken store stops every tool call.

## Implementation task

Make the changes above.

## Check

Prediction first: in the `/clear` test, what would the stored `sessions` be if the `classic.SessionStart` hook were missing?

`claude plugin validate my-mod` (verified: `calls:` lists `$.store.get (via stored)` and `$.store.set (via bump)`) and `claude plugin test my-mod` (verified: 6 pass with the reference tests).

Interactive check (the learner reports): `/skeleton` in the second session shows all-time counts; after `/clear`, the band still shows the all-time numbers; quit and start a new session and the all-time numbers carry over, with `sessions` one higher.

## Done when

- All-time counts survive `/clear` and a new session, and a test proves `/clear` doesn't zero them.

Commit: `module 10: state that lasts`.

## Reflection prompt

> Why does every write go to `$.store` first and then copy into `$.state`, rather than the other way round?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

`$.state` can be reset under you (by `/clear`, `/resume`, `/branch`) without any event your `session.start` hook sees, so it can't be trusted as the basis of a write. `$.store` is what survives, and it's shared by every session on the machine, so each write re-reads it first. `$.state` is the display copy: reactive, for drawing. (Even this isn't atomic across two sessions writing at once; per-item keys help when that matters.)

</details>

---

# Module 11: Type-check against your build

## Goal

Catch the mistakes `validate` can't, using the declarations your own Claude Code wrote.

## Intuition

`validate` reads which events and calls a mod uses. It doesn't check that you spelled a property right. The type declarations do: each time an interactive session loads a mod from your folder, Claude Code writes its own build's API beside the mod in `.claude-plugin/types/`. A `tsconfig.json` that includes that folder lets TypeScript's compiler check the mod against the exact build you run.

## Claude Code instructions

**Tool check first.** Look for `npx` (Node.js) or `bunx` (Bun). If neither is present, explain what installing one involves, offer to skip with a reason, and mark the module skipped if they choose that.

**Types check.** Look for `my-mod/.claude-plugin/types/claude-code/index.d.ts`. It's written when an interactive session loads the mod from the folder (the learner's second session since Module 1 did this). If it's missing, ask the learner to run `claude --plugin-dir my-mod` once in their second terminal and quit. A headless `claude -p` run doesn't write it. Show its first line, which names the Claude Code version that wrote it.

Add `my-mod/tsconfig.json` (this is the config the declarations' own header recommends):

```json
{
  "compilerOptions": {
    "target": "es2023", "lib": ["es2023"], "types": [],
    "module": "esnext", "moduleResolution": "bundler",
    "strict": true, "noUncheckedIndexedAccess": true,
    "noEmit": true, "skipLibCheck": true,
    "jsx": "react", "jsxFactory": "h", "jsxFragmentFactory": "Fragment"
  },
  "include": [".claude-plugin/types", "hooks", "types", "tests"]
}
```

Run the compiler from `my-mod/`: `npx -p typescript tsc -p .` (or `bunx -p typescript tsc -p .`, or a `tsc` already installed). If the learner's own settings say how to run packages, follow them. The results below were verified with `tsc` 5.9.3 run directly; the `npx`/`bunx` wrappers only fetch the same compiler.

Then break it on purpose: in `/skeleton`'s answer, change `now.tools` to `now.tool`.

## Implementation task

Add `tsconfig.json`, run the compiler, break and fix.

## Check

Prediction first, for each of three checks on the broken file: will `validate` catch the misspelling? Will `claude plugin test`? Will `tsc`?

Verified on 2.1.296 (with the declarations 2.1.296 wrote, TypeScript 5.9.3): the clean mod type-checks with exit 0. With the misspelling, `validate` still passes, the `/skeleton` test fails (its expected text no longer matches), and `tsc` exits 2 with `Property 'tool' does not exist on type 'Tally'. Did you mean 'tools'?`. Revert and rerun all three.

## Done when

- `tsc` passes on the mod, and the learner has seen it catch what `validate` missed. Or the skip is recorded with its reason.

Commit: `module 11: type-check against your build`.

## Reflection prompt

> The test caught the misspelling too, but only because it checks that exact text. What does the type-check give you that the tests don't?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

It checks every line against the real API, including lines no test exercises, and it checks against *your* build: when Claude Code renames something in a release, the next load rewrites the declarations and the compiler points at every place that broke. Tests prove the behaviour you thought to test; types catch the mistakes you didn't think of. For Claude, the compiler is another fast, precise referee.

</details>

---

# Module 12: A README with an install line, and a CLAUDE.md for the mod

## Goal

Write the two documents a mod needs: one for the person installing it, one for the agent changing it.

## Intuition

The README is for someone deciding whether to trust your mod and how to install it, so it says what the mod does, what it reads and calls (the same facts `validate` prints), and the one-line install. `validate` notices a README without an install line and advises one.

The `CLAUDE.md` is for whoever develops the mod next, probably Claude. Put it in `.claude/CLAUDE.md`, not the root: `validate` warns that a `CLAUDE.md` at a plugin's root isn't loaded for people who install the plugin, and `.claude/CLAUDE.md` is still read as project context when someone opens the mod's folder in Claude Code.

## Claude Code instructions

First write a README with no install line, ask for a prediction, and run `claude plugin validate my-mod`. Verified on 2.1.296: an `ℹ Advice (does not change the verdict)` block says the README has no line that installs `skeleton-guard` from a marketplace. With no marketplace file yet, it adds that validating the folder that holds `marketplace.json` fills in `<owner>/<repo>` (Module 13 adds that file); with one, it prints the line to add: `/plugin install skeleton-guard --marketplace <owner>/<repo>`.

Then finish both files. Use `.reference/skeleton-guard/README.md` and `.reference/skeleton-guard/.claude/CLAUDE.md` as models, but write them with the learner, in their words: what the mod does, what it hooks and calls, that it's a teaching mod and not a safety control, the install line (with their GitHub name and repository, or a placeholder if they won't publish), and the checks to run before every change.

## Implementation task

`my-mod/README.md` and `my-mod/.claude/CLAUDE.md`.

## Check

`claude plugin validate my-mod` passes with no advice and no warning about `CLAUDE.md` (verified with the reference's files: `✔ Validation passed`). Then demonstrate the warning on a scratch copy with the `CLAUDE.md` moved to the root. Verified: `CLAUDE.md at the plugin root is not loaded as project context`.

## Done when

- The README names what the mod does, what it calls, its limits, and its install line.
- `.claude/CLAUDE.md` tells an agent the checks, the guard rule (keep the `.catch`), the state rule (the store is the source of truth) and the version rule.

Commit: `module 12: a README and a CLAUDE.md for the mod`.

## Reflection prompt

> What's one rule in the mod's CLAUDE.md that would stop a future, well-meaning Claude session from making the mod less safe?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

"Every guard keeps its `.catch`" is the strongest candidate: deleting it looks like tidying up and silently makes the guard fail open. "A new `calls:` entry is a change the person should hear about" is another: it turns `validate`'s output into a review gate. Rules work best when they name the failure they prevent.

</details>

---

# Module 13: Package it as a marketplace and install it

## Goal

Install the mod the way someone else would, and learn what a version number does.

## Intuition

Plugins install from marketplaces. The smallest marketplace is the mod's own folder: one file, `.claude-plugin/marketplace.json`, beside `plugin.json`, listing the mod with `"source": "./"`. Push that folder to GitHub and anyone can install with `/plugin install skeleton-guard --marketplace <owner>/<repo>`.

How an installed copy updates depends on where it came from. A plugin installed from a folder marketplace with a relative source is read from that folder, so an edit plus `/reload-plugins` reaches the session with no reinstall. A plugin installed from GitHub runs the copy made at install time, and only a new version (or commit) plus `claude plugin update` brings changes. That's why every change you want others to get needs a version bump.

## Claude Code instructions

Reference (verified on 2.1.296), `my-mod/.claude-plugin/marketplace.json`:

```json
{
  "name": "skeleton-guard-dev",
  "description": "A local marketplace for the Mod Skeleton tutorial's mod",
  "owner": { "name": "Your Name" },
  "plugins": [{ "name": "skeleton-guard", "source": "./" }]
}
```

Run `claude plugin validate my-mod`: it now validates the marketplace file too.

**Install at local scope, from inside `my-mod/`**, so nothing changes in the learner's user settings or in the tutorial folder. Explain that `--scope local` writes `my-mod/.claude/settings.local.json`, which `.gitignore` already ignores. Ask before running:

```bash
cd my-mod
claude plugin marketplace add --scope local ./
claude plugin install --scope local skeleton-guard@skeleton-guard-dev
claude plugin list
```

Verified on 2.1.296: the marketplace is added (`declared in local settings`), the plugin installs (`scope: local`), and `claude plugin list` shows `Read from:` the folder itself. Use `./`, not `.`: verified, `.` is refused with `Invalid marketplace source format`.

Then show what a version bump does: run `claude plugin update skeleton-guard@skeleton-guard-dev`. Verified: it answers that the plugin is read from its folder and there's nothing to update; edits take effect at the next session start or `/reload-plugins`.

Interactive check (the learner reports): in a new session started **in `my-mod/` without `--plugin-dir`** (Claude Code asks to trust the new folder first; no mod loads until it's trusted), `/plugin` shows the mod installed and the band appears. Don't load the same mod twice (installed and `--plugin-dir`) in one session: two enabled plugins with the same name conflict, and 2.1.296's `/plugin` notes when one's hooks are left out for that reason.

If the learner wants to undo the install later: `claude plugin uninstall --scope local skeleton-guard@skeleton-guard-dev` and `claude plugin marketplace remove skeleton-guard-dev`, run from `my-mod/` (verified).

## Implementation task

Add the marketplace file, install locally, check the list.

## Check

Prediction first: after you edit `register.tsx`, what do you need to do for the installed copy to pick up the edit? Then the commands above, and the learner's interactive report.

## Done when

- `my-mod/` is a marketplace, the mod is installed at local scope from it, and the learner can say how a GitHub install differs.

Commit: `module 13: package it as a marketplace`.

## Reflection prompt

> Someone installed your mod from GitHub last week. You fixed a bug today and pushed it. What do they see, and what should you have done?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Probably nothing yet. Their install runs the copy made when they installed it; it changes only when a new version or commit reaches them through `claude plugin update` (or an auto-update) followed by a reload. Bumping `version` in `plugin.json` with the fix makes the change visible and lets them tell which copy they run. A folder marketplace on your own machine hides this, because it reads your working folder directly.

</details>

---

# Module 14: Ship one change through everything

## Goal

Make one real change the way the skeleton taught you, start to finish.

## Intuition

Every layer you built exists for this moment: a change goes in test-first, passes the checks, gets a version, and reaches the installed copy. If the skeleton is right, adding a feature feels small and safe.

The change: also hold `git reset --hard`, which throws away uncommitted work.

## Claude Code instructions

Let the learner drive. Ask them to say each step before you do it. Coach only if they get stuck:

1. **Test first.** Add a `git reset --hard HEAD~1` call to the guard test, expecting it to be held (the reference loops over a list of commands). Predict, run. Verified on 2.1.296: the test fails, and what came back is the tool's result, not a refusal: the command ran.
2. **Change.** Add `/\bgit\s+reset\s+--hard\b/` to `DESTRUCTIVE`. Run the test: green.
3. **All checks.** `claude plugin validate my-mod`, `claude plugin test my-mod`, and the type-check if Module 11 wasn't skipped.
4. **Version.** Bump `plugin.json` to `0.2.0`.
5. **Docs.** Add `git reset --hard` to the README's list.
6. **Reach the installed copy.** In the learner's session in `my-mod/`, `/reload-plugins`, then ask Claude to run `git reset --hard` in a scratch repository; the guard holds it.

Then compare `my-mod/` with `.reference/skeleton-guard/` (`diff -r`, excluding `.git`, `.claude-plugin/types`, `tsconfig.json` and `.claude/settings.local.json`). Differences in wording and names are fine; talk through any difference in behaviour.

Finish with a short review, in the conversation or as `my-mod/REVIEW.md` if the learner wants to keep it:

```text
What this mod hooks:
What it calls:
Guards and how each fails:
State and what it outlives:
Checks, and which were skipped and why:
What it doesn't protect against:
```

## Check

All three checks pass (or the type-check's skip is on record). Verified for the reference: `claude plugin validate` passes, `claude plugin test` gives 6 pass.

## Done when

- The change went in test-first, every check passed, the version is bumped, the installed copy holds `git reset --hard`, and the review is written.

Commit: `module 14: ship one change through everything`.

## Reflection prompt

> Look at `git log --oneline` in `my-mod/`. If you started a new mod tomorrow, which of these layers would you put in on day one, and which would you add only when you needed them?

<details>
<summary>Expected intuition (reveal only after the learner answers)</summary>

Day one: the three files, `validate`, a test with its world, and, for anything that guards, a `.catch` decided on purpose. They cost minutes and make every later change checkable. State, the store, a band and a marketplace come when the mod needs them, but because you've done each once, you'll know the traps: `$.state` resets at `/clear`, the store is the source of truth, versions matter for installs. There's no single right split; the point is that it's now your choice, not an accident.

</details>

---

You've finished the 101. `201-next-steps.md` has directions to take the mod further.
