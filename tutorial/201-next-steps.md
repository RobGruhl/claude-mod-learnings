# The Mod Skeleton 201: Where to Go Next

> Seven directions for growing `skeleton-guard` from a small, careful mod into a useful one, without losing the habits the 101 taught.
>
> **Tutorial version 1.0, October 2026. Checked on Claude Code 2.1.296.** Claude: state this version when starting a direction.

---

## Before you start

If you've finished the [101](./101-mod-skeleton.md), your mod counts tool calls, answers `/skeleton`, holds destructive commands and secret files with guards that fail closed, keeps state that survives `/clear`, has tests, type-checks against your build, and installs from a marketplace.

The 201 directions are outcome lists, not scripts. Pick one, finish it the same careful way, then come back for another. Most are independent; the dependencies are:

```text
Entry points:  1 (Pane)   2 (Real policy)   3 (Hold and ask)   5 (Options)   7 (A tool for Claude)
Builds on:     4 (Decision tier) builds on 3        6 (Publish with CI) benefits from 5
```

**The 101 rules still apply:**

- Teach the intuition before the code.
- **Ask each prediction and reflection question, then end your message and wait.** This is the rule most easily dropped in a fresh session.
- Keep each change small and reviewable.
- Run every check for real. Interactive checks are the learner's to report.
- Keep `validate`'s `calls:` line honest: a new call (network, process, files) is said out loud before it's added.
- Update the README and the mod's `.claude/CLAUDE.md` as the mod grows.
- **Commit after each working step** with `201 direction <n>, step <m>: <short title>`, so a future session can find its place.
- Bump the version for anything an installed copy should pick up.

## How Claude Code should run a direction

A learner usually starts a direction in a fresh session. First re-read the Facilitator Contract at the top of [`101-mod-skeleton.md`](./101-mod-skeleton.md), then:

1. Check the direction's prerequisites against `my-mod`'s git history; redirect honestly if they're missing.
2. Read the parts of the declarations Claude Code wrote for this build (`my-mod/.claude-plugin/types/claude-code/index.d.ts`) that the direction uses. The API is early access, and the declarations are the authority.
3. Break the direction's "What you'll build" into 3–6 small steps and show the plan.
4. For each step: teach the intuition, make the smallest change, ask for a prediction and end your message, then run the check, compare, commit.
5. At the end, verify every "Done when" item for real, update the docs, then ask the reflection prompt and end your message.

These directions are not pre-verified the way the 101's modules are. Verify as you go, and if something here is wrong for the learner's build, say so.

---

## Direction 1: A pane with buttons

### Intuition

The band is one line. A pane is a panel beside or below the transcript with its own layout, buttons and text fields. Buttons keep their handlers in your mod and raise `ui.press`, so the same chain rules apply: another mod's hook sees a press before your callback does.

### What you'll build

- A `/skeleton` that opens a pane (`$.ui.open`) listing recent held commands, kept in `$.state`.
- A button per row that copies the command to the clipboard (`$.ui.copy`) or clears the list.
- A UI test with `$.ui.mount` on both `terminal` and `desktop` surfaces, pressing a button by key.

### Prerequisites

The 101 through Module 10.

### Done when

- The pane opens from `/skeleton`, its buttons work in a real session (learner reports), and a mount test presses one on two surfaces.

### Reflection prompt

> A pane opened without the person asking only appears on a wide terminal. Why might Claude Code be that careful about space it gives a mod?

### Starter prompt

> Walk me through 201 Direction 1 (a pane with buttons) one step at a time, the same way we did the 101.

---

## Direction 2: A real policy, not a pattern list

### Intuition

A deny-list of spellings is best effort. A guard's robust form is an allow-list on resolved paths: `$.fs.stat(path, { resolve: true })` answers `realPath` with every link and `..` resolved, so a guard can allow writes only under a root it resolved the same way. `tool.check` is the other gating site: its `next(e)` reads the permission verdict without running anything, and a hook can tighten it.

### What you'll build

- A `tool.call` guard for Write and Edit that allows paths only under the project root, judged on `realPath`.
- A `tool.check` hook that turns `allow` into `ask` for anything outside that root.
- Tests for a symlink and a `..` path that a spelling check would miss.
- `.catch` handlers on both, decided on purpose.

### Prerequisites

The 101.

### Done when

- A write through a symlink that points outside the root is held, a test proves it, and `validate` lists both gating hooks with `.catch`.

### Reflection prompt

> Why is "allow only under here" stronger than "deny these paths", and what does it cost?

### Starter prompt

> Walk me through 201 Direction 2 (a real policy) one step at a time, the same way we did the 101.

---

## Direction 3: Hold and ask

### Intuition

Denying is blunt. A guard can instead hold the call and ask the person, with `$.ui.ask`, then pass or refuse on their answer. Time spent waiting inside a `$` call doesn't count against the hook's budget. One trap to test for: if the hook times out while holding, it's skipped, and a skipped guard lets the call run.

### What you'll build

- For destructive commands, a question with "Run it" and "Don't" in place of the outright deny.
- A `.catch` that refuses if the ask fails or times out.
- Tests that answer the ask both ways beneath the mod.

### Prerequisites

The 101.

### Done when

- The person decides each held command in a real session (learner reports), and tests cover yes, no and a failed ask.

### Reflection prompt

> Asking the person moves the decision to the slowest, most expensive tier. When is that the right place for it?

### Starter prompt

> Walk me through 201 Direction 3 (hold and ask) one step at a time, the same way we did the 101.

---

## Direction 4: A decision tier inside the guard

### Intuition

Between "a pattern matched" and "ask the person" sits a judgment: is this command destructive in context? A small model can make it in about a second. Keep the order a cascade: the deterministic patterns first (fast and free), a model only for the ambiguous remainder, the person for what the model doubts, and fail closed on a timeout. See the site's "Mods meet the cascade" page and its sister site, Decision Tier, for measured latencies.

### What you'll build

- A judgment step using `$.model.complete` (on the person's own plan or key) or `$.http.fetch` to a decision model, only for commands the patterns don't settle.
- A timeout well inside the hook's 10-second budget, and a `.catch` that falls back to asking.
- A log of the model's verdicts (`$.ui.log`), so you can see what it decided.
- Tests that answer `model.complete` (or `http.fetch`) beneath the mod, including a timeout.

### Prerequisites

Direction 3. The learner agrees to the new `calls:` entry and to spending model usage.

### Done when

- Ambiguous commands reach the model, clear ones never do, a timeout falls back to the person, and `validate`'s `calls:` line shows the new call.

### Reflection prompt

> The model can only judge the command it's shown. What could make a command dangerous that the command's text doesn't contain?

### Starter prompt

> Walk me through 201 Direction 4 (a decision tier inside the guard) one step at a time, the same way we did the 101.

---

## Direction 5: Options people can set

### Intuition

Hard-coded patterns suit you, not everyone. A plugin's `userConfig` declares options; Claude Code fills in defaults, shows non-secret ones in the config menu, and reloads the mod when one changes. The values arrive as `register(on, options)`.

### What you'll build

- A `userConfig` option for extra patterns to hold, and a switch for the `@`-mention guard.
- Tests that pass options with `test(name, { options }, body)`.
- README lines that document each option.

### Prerequisites

The 101.

### Done when

- Changing an option in the config menu changes the guard after the reload (learner reports), and tests cover the defaults and a custom value.

### Reflection prompt

> Which of your mod's behaviours should never be an option, and why?

### Starter prompt

> Walk me through 201 Direction 5 (options) one step at a time, the same way we did the 101.

---

## Direction 6: Publish with CI

### Intuition

A mod in someone else's session is code you're responsible for. Publishing means a public repository with the install line working for a stranger, and CI that runs the same checks you run, on every push and pull request, so a broken change can't merge.

### What you'll build

- A public GitHub repository for `my-mod`, with its marketplace file at the root.
- A CI workflow that installs Claude Code on the runner and runs `claude plugin validate --strict .` and `claude plugin test .` (both exit 1 on failure).
- A tagged release whose version matches `plugin.json`, and the install line tested from a clean session.

### Prerequisites

The 101. A free GitHub account. Direction 5 helps but isn't needed.

### Done when

- A pull request that breaks a test is shown failing in CI, and the install line works from a session that never had the mod.

### Reflection prompt

> `validate --strict` fails on warnings too. Is that too strict for a mod, or exactly strict enough?

### Starter prompt

> Walk me through 201 Direction 6 (publish with CI) one step at a time, the same way we did the 101.

---

## Direction 7: A tool Claude can call

### Intuition

A mod can give Claude a tool of its own with `$.tool.register`. Claude sees it as `mcp__<plugin>__<name>`, and the mod serves it in its own `tool.call` hook. Unlike an MCP server, it runs in-process and can read the mod's state directly.

### What you'll build

- A `skeleton_report` tool that returns the session and all-time counts as JSON, registered in `session.start`.
- The `tool.call` hook that serves it, and a test that calls it.
- A note in the README about what the tool exposes to Claude.

### Prerequisites

The 101.

### Done when

- Asking Claude "how many commands has skeleton-guard held?" makes it call the tool (learner reports), and a test serves the tool beneath the mod.

### Reflection prompt

> When would you give Claude a tool through a mod rather than an MCP server?

### Starter prompt

> Walk me through 201 Direction 7 (a tool Claude can call) one step at a time, the same way we did the 101.

---

## After the 201

You'll start your next mod with three files, a test and a decided `.catch`, and you'll read a stranger's mod by its `hooks:` and `calls:` lines before you load it. That's the skeleton doing its job.
