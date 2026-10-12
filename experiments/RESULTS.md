# Field test results

Claude Code **2.1.296** (built 2026-10-09), macOS on Apple Silicon, run on **2026-10-12**. Every output quoted below was observed in this run. Each experiment is a small throwaway mod in this folder. To re-run one, use `claude plugin validate <dir>` and `claude plugin test <dir>`.

Two kinds of evidence appear here. Most experiments use the test kit (`claude plugin test`), which runs the real engine with no session, model or terminal: hooks a test registers sit beneath the mod and stand in for Claude Code's own behaviour. One experiment, `live-probe`, runs in a real headless session (`claude -p`) and drops the prompt in `prompt.submit`, so no model is ever called.

Verdicts: **confirmed** (we saw what the docs say), **contradicted** (we saw something else), **not testable in the kit** (with what we did instead).

| # | Claim | Verdict |
| --- | --- | --- |
| E1 | A guard that throws before `next` is skipped and the call goes on; `.catch` makes it fail closed | Confirmed |
| E1b | A guard that runs past its 10 s budget is skipped and the call goes on | Not testable in the kit (5 s test limit); confirmed live |
| E2 | Order: prepend tier, then user mods, then core; within a module, the order `on` was called | Confirmed |
| E3 | A hook can observe, rewrite, answer, post-process and retry | Confirmed |
| E4 | Validate and the engine refuse a module whose use of `$` can't be read statically | Confirmed |
| E5 | A failure after `next` keeps the result and nothing runs twice; a wrong-shape answer before `next` is skipped | Confirmed |
| E6 | A `tool.call` guard never sees `@`-mentioned files; `prompt.mention` is its own door | Confirmed in the kit (event separation only) |
| E7a | The module has no timer globals such as `setTimeout` | **Contradicted**, in the kit and live |
| E7b | Register each event once per matcher | **Partly contradicted**: only duplicates without a matcher are refused |
| E7c | A wrong-shape answer is a failure; `.catch` sees `next.error.kind` of `throw` or `timeout` | Confirmed, with a detail: a wrong shape arrives as `throw` |
| E7d | Plugin names that pass as Anthropic's fail validation | Confirmed; the reserved list is wider than `claude-` |

## E1: fail-open, and `.catch` (`e1-fail-open/`)

**Claim.** "When a hook with no `.catch` handler throws, times out, or returns a result of the wrong shape … it failed before calling `next`: Claude Code skips it, and the next handler runs in its place." (mods-events, *Handle a hook that fails*)

**Method.** The same guard is registered twice. On Bash it has no `.catch`. On Write its `.catch` is `next.called ? next(e) : { deny }`. Both throw before calling `next`. A test-registered core stand-in records which calls reach it.

**Observed.**

```
E1 bash result: {"result":"core ran it"}
E1 write result: {"deny":"guard failed (throw), so the call was refused"}
E1 reached core: ["Bash rm -rf build","Read"]
```

The guard's `rm -rf build` reached core. The Write call never did. `next.budget.ms` read `10000` in the kit, the same as the docs' limit.

`claude plugin validate` flags the difference before anything runs:

```
❯ ./register.ts gating hook without .catch: tool.call{tool=Bash}
❯ ./register.ts gating hook with .catch: tool.call{tool=Write}
```

**Verdict.** Confirmed.

## E1b: a guard that overruns its budget (`live-probe/`)

**Claim.** A hook's own time is limited to 10 s, and a hook past it is skipped (mods-reference, *Limits*).

**Kit attempt.** A guard that waits 11 s on a timer failed the test itself first: `Error: timed out after 5000 ms`. The kit's per-test limit is 5 s, which is shorter than the hook budget, so this can't be tested in the kit.

**Live method.** `live-probe` registers a Read guard that waits 11 s and then denies. Its `prompt.submit` hook calls `$.tool.call({ tool: 'Read', … })`, which runs every hook except the calling one, so the guard sees the call. The hook records the result and drops the prompt. Run three times with `HC_PROBE_OUT=… claude -p x --plugin-dir experiments/live-probe`.

**Observed** (on stderr, every run):

```
live-probe: tool.call hook skipped: ran past its 10s budget
Prompt dropped by a hook: live-probe: measurements written; no model call
```

The Read result came back after 10,015 to 10,030 ms with the file's contents. The guard's `deny` never took effect.

**Verdict.** Confirmed live. A slow guard is a guard that isn't there.

## E2: order (`e2-order/`)

**Claim.** The prepend tier runs first, then mods you install, then core. Within one module, hooks run in the order `register` called `on` (mods-events, *The order mods run in*).

**Method.** The mod under test registers two Bash hooks with different matchers. The test loads two inline mods: one with `tier: 'prepend'` and one plain user mod. Every hook appends its name to the command on the way in and to the result on the way out.

**Observed.**

```
E2 result: {"result":"core saw \"ls >prepend >first >second >other-user\" <other-user <second <first(origin=engine/core) <prepend"}
```

**Verdict.** Confirmed. The first mod is outermost: it sees the event first and the result last. `next.origin` for a call the test raised reads `engine/core`, which is what the reference says Claude Code itself is.

## E3: the moves (`e3-moves/`)

**Claim.** A hook can observe (`next(e)`), rewrite (`next({ ...e, … })`), answer (return without `next`), post-process (`await next`, then edit) and retry (call `next` twice).

**Observed.**

```
E3 core saw: ["observe ls","echo rewritten","post ls","retry make","retry make"]
E3 observe ls -> "ran: observe ls"
E3 rewrite rm -rf / -> "ran: echo rewritten"
E3 answer pwd -> "answered by the mod (seen 3)"
E3 post ls -> "ran: post ls [annotated]"
E3 retry make -> "ran: retry make"
```

Core never saw `rm -rf /` (rewritten) or `answer pwd` (answered by the mod). A rewrite is invisible downstream.

**Verdict.** Confirmed.

## E4: static analysis (`e4-*`, `claude-lookalike/`)

**Claim.** Claude Code refuses to load a module whose use of `$` it can't read: destructuring `$`, aliasing a noun, passing `$` to a function that isn't top-level, computed event names, `import()` (mods-create, mods-admin).

**Observed.** `validate` exits 1 for each. The messages (paths trimmed):

```
e4-destructure   compiled line 3 `const { ui } = $;`: $ itself is bound to a name (bound, passed, spread, returned or read)
e4-alias         compiled line 3 `const ui = $.ui;`: $.ui is used as a value (a noun of $ bound, passed or read)
e4-pass-arrow    compiled line 4 `note($, "hi");`: $ is passed to "note", which is not a function declared at the top of this file
e4-computed      compiled line 4 `on(ev, …)`: the event name passed to on() is not a string literal
e4-dynamic-import compiled line 3 `await import("./other.ts");`: a dynamic import()
```

The engine refuses the same module at load (from a test against `e4-destructure`):

```
threw: e4-destructure: hooks module did not load: … `const { ui } = $;`: $ itself is bound to a name …
```

A clean module gets an inventory instead, and calls made through a top-level helper are attributed to it:

```
❯ ./register.ts calls: $.env.get, $.store.set, $.ui.toast (via note)
❯ ./register.ts env reads: HOME
```

**Verdict.** Confirmed. This list is what you read before installing someone's mod.

## E5: failing after `next` (`e5-after-next/`)

**Claim.** "It failed after `next` resolved: that result stands, and nothing runs a second time." A wrong-shape result before `next` is skipped.

**Observed.**

```
E5 bash: {"result":"core ran Bash"} read: {"result":"core ran Read"} core calls: ["Bash","Read"]
```

The Bash hook threw after `next` and core ran Bash exactly once. The Read hook answered `{ verdict: 'nope' }` (not a `tool.call` result), so it was skipped and core ran Read.

**Verdict.** Confirmed.

## E6: `prompt.mention` (`e6-mention/`)

**Claim.** Files named after `@` in a prompt raise `prompt.mention` and no `tool.call`, so a `tool.call` guard never sees them (2.1.295 reference, update-2026-10-08 notes).

**Method.** A secrets guard refuses `Read` of `.env` at `tool.call`. A second hook on `prompt.mention` uses the right refusal shape (`{ deny }`), and a third uses our first, wrong attempt (`{ type: null, deny }`). The test raises both events.

**Observed.**

```
E6 Read tool .env: {"deny":"secret-guard: /work/.env looks like a secret"}
E6 @right/.env (deny shape): {"deny":"secret-guard: @right/.env looks like a secret"}
E6 @wrong/.env (bad shape): {"deny":"catch handler answered (throw)"}
E6 @other/.env (no mention hook): {"type":"file"}
E6 reached core: ["prompt.mention /work/other/.env"]
```

**Verdict.** Confirmed as far as the kit can show it: the events are separate, and a guard on one doesn't fire for the other. The kit can't show that a live session raises no `tool.call` for an `@` read, because the test raises the events itself. That part rests on the docs.

The lesson we didn't plan: our first `prompt.mention` refusal had the wrong shape. Before we added a `.catch` that returned the right shape, the hook was silently skipped and the file was read.

## E7: smaller findings

**E7a, timer globals (`probe/`, `live-probe/`).** mods-api says "The hooks module itself has no Node.js APIs, no timer globals such as `setTimeout`". We observed `setTimeout` and `setInterval` as functions, and a 20 ms timer firing after 20.3 to 21.1 ms, both in the kit and in the live hooks worker (`claude -p`). `validate` doesn't flag their use. `process`, `fetch`, `require`, `WebSocket` and `XMLHttpRequest` are absent, as documented, and `performance.now()` is present. **Contradicted.** Treat the timers as undocumented: they may go away, and a timer wait counts as the hook's own time (E1b's overrun waited on one). Use `$.clock` for real work.

**E7b, duplicate registrations (`e7-twice/`, `e7-twice-matcher/`).** mods-events says "Register each event once per matcher." Two `on('tool.call', …)` with no matcher fail validation: `on("tool.call") is registered twice without a matcher; the first is at …:2`. Two with the *same* matcher, `{ tool: 'Bash' }`, pass validation, load, and both run: the latency mod stacks 20 of them and counted 124,000 hits for 6,200 calls. **Partly contradicted.** Only the no-matcher duplicate is refused.

**E7c, wrong shapes and `.catch` (`e6-mention/`).** A wrong-shape answer is handed to `.catch` with `next.error.kind` reading `throw`. If the `.catch` answer is also the wrong shape, the hook is skipped and the guarded action goes ahead.

**E7d, reserved names (`claude-lookalike/`).** Validation refuses names that "start with "claude-", "anthropic-", "anthropics-", or "cc-plugin-", be "claude", "anthropic", "anthropics", "claude-code", or "claude-mods", or put "official" beside "claude" or "anthropic"." A plugin can't be called `claude-mods`, even though a repo can.

**E7e, headless probes cost nothing.** A `prompt.submit` hook that returns `{ drop }` ends a `claude -p` run without a model call. `e.surface` is `null` there, as documented.

## Latency (`latency/`, `live-probe/`)

### The chain itself, in the kit

`latency/` stacks pass-through `tool.call` hooks by matcher, so Glob meets 0 of the module's hooks, Write 1, Read 5 and Bash 20. Grep meets one hook that makes a single `$.store.get` (answered by a stub) before `next`. `tests/modules.test.ts` puts the same hook in k separate inline mods instead. Each config ran 3 × 2,000 calls (1,000 for the separate mods) after a warm-up. Three separate `claude plugin test` runs gave the same picture. Medians of per-call µs:

| Config | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| 0 hooks | 42.8 | 43.4 | 43.4 |
| 1 hook | 84.7 | 87.6 | 85.2 |
| 5 hooks, one module | 79.5 | 79.3 | 80.3 |
| 20 hooks, one module | 80.0 | 80.5 | 81.0 |
| 1 hook + one `$` call (stubbed) | 134.6 | 132.3 | 130.7 |
| 1 separate mod | 93.2 | 90.1 | 89.8 |
| 5 separate mods | 114.0 | 112.6 | 116.0 |
| 20 separate mods | 328.1 | 336.7 | 334.4 |

Reading: the kit's own dispatch costs about 43 µs. Entering a mod's hooks adds about 42 µs, and more hooks in the same module add nothing we could measure (20 measured no slower than 1). Each additional separate mod adds about 13 µs, averaged over 1 to 20. One `$` round trip adds about 47 µs. This is the test kit's engine with no session or terminal, so read it as the chain's overhead, not as a live TUI's.

### `$` round trips in the live hooks worker

`live-probe/` timed calls from a `session.start` hook in a real headless session, 4 runs (the fetch row from the 3 runs against our own local server). Medians:

| Call | Median per call |
| --- | --- |
| `$.env.get('HOME')` | ~43 µs |
| `$.store.get(k)` | ~90 µs |
| `$.fs.read` (small file) | ~180 µs |
| `$.http.fetch` to a local Python server | ~0.58 ms |
| `$.process.run(['true'])` | ~1.5 ms |

### Tooling

`claude plugin validate e1-fail-open`: 0.41 to 0.62 s wall clock, median 0.49 s over 5 runs. `claude plugin test e1-fail-open`: 0.58 to 0.84 s, median 0.64 s over 5 runs.
