#!/usr/bin/env python3
"""Build the Hook Chain site: wrap each page fragment in site/pages/ with the shared
template and write it to docs/, which GitHub Pages serves. Standard library only.

    python3 site/build.py
"""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "docs"
SITE_URL = "https://robgruhl.github.io/claude-mod-learnings/"

# (file, nav label, level tag, page title, description)
PAGES = [
    ("index.html", "Start", "", "Hook Chain", "A field guide to Claude Code mods, from explain-like-I'm-five to engineering a policy mod."),
    ("eli5.html", "Explain like I'm five", "L0", "Explain like I'm five", "Claude Code mods explained with a restaurant kitchen, a line of helpers and a chef."),
    ("101.html", "101 · What a mod is", "L1", "Mods 101", "The three files, register and on, the ($, e, next) hook, and the three moves: observe, rewrite, answer."),
    ("201.html", "201 · Writing mods well", "L2", "Mods 201", "Chain etiquette, guards that fail closed, state that survives /clear, drawing, commands and tests."),
    ("301.html", "301 · Engineering & policy", "L3", "Mods 301", "Tiers, policy mods, static analysis, failure modes, admin controls, CI and distribution."),
    ("which.html", "Mods vs skills vs MCP…", "Arch", "Which extension point?", "CLAUDE.md, skills, slash commands, subagents, MCP servers, settings hooks, mods, output styles and plugins compared."),
    ("chain.html", "The hook chain", "Arch", "The hook chain", "How a tool call travels: managed hooks, prepend, user, append, builtin, core, and the way back up."),
    ("lifetimes.html", "What lasts how long", "Arch", "What lasts how long", "Module variables, $.state, $.store and files: what survives a reload, /clear and a new session."),
    ("cascade.html", "Mods meet the cascade", "Arch", "Mods meet the cascade", "A guard mod as the fastest tier of a code → decision model → LLM → human cascade."),
    ("fieldtests.html", "Field tests", "Data", "Field tests", "Claims about mods checked by experiment on Claude Code 2.1.296: fail-open, .catch, order, rewrites and more."),
    ("latency.html", "Latency ladder", "Data", "The latency ladder", "From a pass-through hook to a decision model, an LLM call and a human prompt, normalized to the cheapest rung."),
    ("landscape.html", "Landscape · Oct 2026", "Data", "Landscape, October 2026", "Releases 2.1.287 to 2.1.296, the built-in mods, community catalogs and what changed for mod authors."),
    ("build.html", "Build your own", "Build", "Build your own mod skeleton", "A facilitated, module-by-module tutorial you run in Claude Code, from three files to a tested, published mod."),
]

NAV_GROUPS = [
    ("Learn", ["eli5.html", "101.html", "201.html", "301.html"]),
    ("Architecture", ["which.html", "chain.html", "lifetimes.html", "cascade.html"]),
    ("Evidence", ["fieldtests.html", "latency.html", "landscape.html"]),
    ("Build", ["build.html"]),
]

TEMPLATE = (ROOT / "template.html").read_text()


def nav_html(current: str) -> str:
    by_file = {p[0]: p for p in PAGES}
    parts = []
    for group, files in NAV_GROUPS:
        items = []
        for f in files:
            _, label, _, _, _ = by_file[f]
            cur = ' aria-current="page"' if f == current else ""
            items.append(f'<li><a href="{f}"{cur}>{html.escape(label)}</a></li>')
        parts.append(f'<div class="nav-group"><p class="nav-head">{group}</p><ul>{"".join(items)}</ul></div>')
    return "".join(parts)


def pager_html(current: str) -> str:
    order = [p[0] for p in PAGES]
    i = order.index(current)
    by_file = {p[0]: p for p in PAGES}
    prev_link = next_link = ""
    if i > 0:
        f = order[i - 1]
        prev_link = f'<a class="pager-prev" href="{f}"><span>Previous</span>{html.escape(by_file[f][3])}</a>'
    if i < len(order) - 1:
        f = order[i + 1]
        next_link = f'<a class="pager-next" href="{f}"><span>Next</span>{html.escape(by_file[f][3])}</a>'
    return f'<nav class="pager" aria-label="Page navigation">{prev_link}{next_link}</nav>'


def build() -> None:
    OUT.mkdir(exist_ok=True)
    for f, _, _, title, desc in PAGES:
        body = (ROOT / "pages" / f).read_text()
        full_title = title if f == "index.html" else f"{title} · Hook Chain"
        page = (
            TEMPLATE.replace("{{title}}", html.escape(full_title))
            .replace("{{description}}", html.escape(desc))
            .replace("{{url}}", SITE_URL + ("" if f == "index.html" else f))
            .replace("{{nav}}", nav_html(f))
            .replace("{{pager}}", "" if f == "index.html" else pager_html(f))
            .replace("{{bodyclass}}", "home" if f == "index.html" else "inner")
            .replace("{{content}}", body)
        )
        (OUT / f).write_text(page)
        print(f"wrote docs/{f}")
    # GitHub Pages: serve files as-is, no Jekyll processing.
    (OUT / ".nojekyll").write_text("")
    check_links()


def check_links() -> None:
    """Fail loudly on a relative link to a page or asset that doesn't exist."""
    bad = []
    for page in OUT.glob("*.html"):
        for ref in re.findall(r'(?:href|src)="([^"#:]+)(?:#[^"]*)?"', page.read_text()):
            if ref.startswith(("//", "mailto")) or not ref:
                continue
            if not (OUT / ref).exists():
                bad.append(f"{page.name} -> {ref}")
    if bad:
        raise SystemExit("broken links:\n  " + "\n  ".join(bad))
    print("links ok")


if __name__ == "__main__":
    build()
