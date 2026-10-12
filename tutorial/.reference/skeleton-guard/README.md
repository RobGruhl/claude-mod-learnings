# skeleton-guard

A small Claude Code mod built in the Mod Skeleton tutorial. It counts Claude's tool calls, holds destructive shell commands (`rm -rf`, `git push --force`, `git reset --hard`), refuses `@`-mentioned secret files (`.env`, `*.pem`, SSH keys), and shows a tally on the spinner and in a band above the prompt. `/skeleton` prints the counts.

It is a teaching mod, not a safety control. Its guards fail closed when they throw (each has a `.catch`), but a determined command can still get past a list of patterns.

## Install

Type this at the prompt of a Claude Code terminal session (2.1.287 or later), answer `y` to add the marketplace, then pick a scope:

```
/plugin install skeleton-guard --marketplace your-github-name/my-mod
```

To try it for one session without installing it:

```
claude --plugin-dir path/to/my-mod
```

## What it reads and does

`claude plugin validate .` lists it. In short: it hooks `session.start`, `command.run`, `classic.SessionStart`, `tool.call`, `prompt.mention` and `ui.render` (Spinner and AbovePrompt), and it calls `$.command.register`, `$.state`, `$.store` and `$.ui.resolve`. It makes no network requests and starts no processes.

## Develop

```
claude plugin validate .
claude plugin test .
```

## License

MIT
