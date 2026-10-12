# Experiments

Small throwaway mods, each written to check a single claim about Claude Code mods. The results, with the outputs we observed, are in [RESULTS.md](RESULTS.md), and the site's [Field tests](https://robgruhl.github.io/claude-mod-learnings/fieldtests.html) and [Latency ladder](https://robgruhl.github.io/claude-mod-learnings/latency.html) pages are built from them.

These are test fixtures, not mods to install. Several are broken on purpose (`e4-*`, `e7-twice`, `claude-lookalike`) so that validation refuses them, and `live-probe` holds every Read for 10 seconds.

```
claude plugin validate experiments/e1-fail-open
claude plugin test experiments/e1-fail-open
```

`live-probe` runs in a real headless session. Its `prompt.submit` hook drops the prompt, so no model is called. It expects a local HTTP server on 127.0.0.1:8799:

```
python3 -m http.server 8799 --bind 127.0.0.1 &
cd experiments/live-probe && HC_PROBE_OUT=/tmp/live-probe.json claude -p x --plugin-dir .
```

Checked on Claude Code 2.1.296, 2026-10-12.

`cascade-guard` is different: it's the worked example from [Mods meet the cascade](https://robgruhl.github.io/claude-mod-learnings/cascade.html), a Bash guard in tiers (rules in code, then a decision model behind a URL, then the person), with five tests.
