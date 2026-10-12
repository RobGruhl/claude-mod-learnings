# skeleton-guard: notes for Claude

This folder is a Claude Code mod: a plugin whose `hooks/hooks.json` names a hooks module, `hooks/register.tsx`.

- Before and after every change, run `claude plugin validate .` and `claude plugin test .`. Both must pass. Read validate's `hooks:` and `calls:` lines: a new `calls:` entry (network, process, fs) is a change the person should hear about.
- Guards live on `tool.call` and `prompt.mention`. Every guard keeps its `.catch(($, e, next) => next.called ? next(e) : { deny })`, so a guard that throws holds the call instead of letting it through. A guard judges before it calls `next`.
- Counts live in `$.state` for the session and `$.store` for all time. `$.store` is the source of truth: write from what is stored, never from `$.state`. `/clear`, `/resume` and `/branch` reset `$.state` without firing `session.start`; the `classic.SessionStart` hook reloads it.
- State is declared in `types/index.d.ts` (`PluginState`). Add a key there before using it, or validate fails.
- Tests sit beneath the mod and must answer every event and `$` call the mod makes; see `tests/world.ts`. The kit refuses two test hooks on one event.
- Bump `version` in `.claude-plugin/plugin.json` for every change you want installed copies to pick up.
- Plugin names may not start with `claude-`, `anthropic-` or `cc-plugin-`.
