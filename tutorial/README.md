# The Mod Skeleton

**Build your first Claude Code mod one small, verified step at a time, with Claude Code as your guide.**

A *mod* is a Claude Code plugin whose code runs inside Claude Code: functions that run when Claude calls a tool, when you submit a prompt, or when part of the screen is drawn, and that can watch, change or answer each of those events. Mods shipped on 1 October 2026 in Claude Code 2.1.287.

This is a facilitated tutorial in the style of the [Walking Skeleton tutorial](https://walkingskeleton.org/): you run it inside Claude Code, which teaches one idea, makes one small change, asks you to predict what the check will show, runs the check for real, commits, and asks you a question. Then it waits for you.

**Tutorial version 1.0, October 2026. Checked on Claude Code 2.1.296.** The mods API is early access; where this tutorial and the types your own build writes disagree, the types win.

## What you'll build

`skeleton-guard`, a small mod that:

- counts Claude's tool calls and shows the count on the spinner and in a band above the prompt
- answers its own `/skeleton` command without starting a Claude turn
- holds `rm -rf`, force pushes and `git reset --hard`, and still holds them when the guard itself breaks
- refuses `@`-mentioned secret files, which no `tool.call` guard sees
- keeps per-session counts in `$.state` and all-time counts in `$.store`, and survives `/clear`
- has tests, type-checks against your build, and installs from a marketplace with one line

On the way you'll see a guard fail open, an `@`-mentioned `.env` slip past a `tool.call` guard, and a misspelling that `validate` passes and the compiler catches, each on purpose and each in a test.

## The modules

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

Then [`201-next-steps.md`](./201-next-steps.md) offers seven directions: a pane with buttons, a real path policy, hold-and-ask, a decision model inside the guard, options, publishing with CI, and a tool Claude can call.

## Before you start

- **Claude Code 2.1.287 or later** (`claude --version`). Mods are on by default from that version, unless your organization or Anthropic has switched them off; Module 0 checks.
- **git**, with `user.name` and `user.email` set.
- **A second terminal window**, for the checks that only show in a live session (the status line, the spinner, the band, `/plugin`). Claude can't see that screen, so you'll tell it what you see.
- Later, for Module 11, **Node.js or Bun** to run TypeScript's compiler. There's a skip path.

**Time:** 10–20 minutes per module, three to four hours in all. Split it across sittings; your git history is the bookmark.

**Cost:** facilitation uses real Claude Code usage (API spend or plan quota). The mod you build calls no model.

## How to start

```bash
git clone https://github.com/RobGruhl/claude-mod-learnings
cd claude-mod-learnings/tutorial
claude
```

`CLAUDE.md` in this folder makes Claude the facilitator. It greets you and offers to start, resume, or run a 201 direction. Your mod is built in `my-mod/`, its own git repository, which this repository ignores. If Claude doesn't pick up the tutorial, say:

> Walk me through the Mod Skeleton 101 one module at a time, following the Facilitator Contract in 101-mod-skeleton.md.

**Coming back later?** Open this folder again and say: *"We're partway through the Mod Skeleton 101. Read the git log in my-mod, work out which module we finished last, and continue from the next one."*

## What's here

```text
README.md              you are here
CLAUDE.md              makes Claude Code the facilitator
101-mod-skeleton.md    the facilitator's script: the contract, the module index, every module
201-next-steps.md      seven directions after the 101
.reference/
  skeleton-guard/      the finished mod, verified with claude plugin validate and claude plugin test
```

The reference is there for the facilitator to check its work against. Building the mod yourself, one layer at a time, is the point.

## Credit

The facilitation design (one module at a time, predict before every check, run every check for real, one commit per module, a circuit breaker, resume from the git log) comes from Rob Gruhl's [Walking Skeleton tutorial](https://walkingskeleton.org/). This is an independent study of Claude Code mods, not an Anthropic project.

## Feedback

Hit a confusing module or a check that behaves differently on your build? [Open an issue](https://github.com/RobGruhl/claude-mod-learnings/issues) with the module number and your `claude --version`.
