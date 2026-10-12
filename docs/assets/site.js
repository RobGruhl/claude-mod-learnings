// Hook Chain — theme, menu, and the small interactive widgets. No dependencies.
(function () {
  const root = document.documentElement;

  // Theme toggle: flips between light and dark and remembers the choice.
  const themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("hc-theme", next); } catch (e) {}
  });

  // Phone menu.
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.getElementById("sidenav");
  if (menuBtn && nav) menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  const $ = (sel, el) => (el || document).querySelector(sel);
  const fmt = (x, d) => Number(x).toFixed(d);

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Which extension point: tick needs, get the lightest tool for each.
  const which = $("#which-widget");
  if (which) {
    const NEEDS = [
      ["Give Claude standing instructions or facts about this project", "CLAUDE.md", "always loaded, plain text, advisory"],
      ["Teach Claude how to do one kind of task, maybe with scripts", "Skill", "loaded only when the task matches its description"],
      ["Save a prompt I type often as /name", "Custom slash command or skill", "a prompt that starts a Claude turn"],
      ["Let Claude reach an external system: an API, a database, a browser", "MCP server", "new tools are what MCP is for"],
      ["Hand a big job to a separate worker with its own context or model", "Subagent", "a fresh context; a mod can pin its model with agent.spawn"],
      ["Change how Claude writes: tone, format, length", "Output style", "a system-prompt variant you pick"],
      ["Block or allow tool calls by a simple pattern", "Permission rules", "declarative, fast, and they hold even with every mod unloaded"],
      ["Run a script I already have on an event: log, lint, notify", "Settings hook", "any language, JSON on stdin; no UI"],
      ["Show one line of information under the prompt", "Status line", "a script's output; a mod's $.ui.status also works"],
      ["Draw a pane or a band, or restyle part of Claude Code's screen", "Mod", "only mods can draw"],
      ["Rewrite prompts, tool calls, model requests or the system prompt, in a fixed order", "Mod", "an ordered chain, unlike parallel settings hooks"],
      ["Run my own code on a /command, with no Claude turn, even mid-turn", "Mod", "command.run answers with code"],
      ["Keep state across events or sessions: counters, ledgers, caches", "Mod", "$.state for the session, $.store across sessions"],
      ["Enforce an organization's policy that users can't switch off", "Managed settings", "deny rules and managed hooks first; a prepended policy mod for what rules can't express"],
      ["Ship several of these to other people as one install", "Plugin", "one marketplace entry can carry all of them"],
    ];
    const box = $("#which-opts", which), out = $("#which-out", which);
    box.innerHTML = NEEDS.map((n, i) => `<label style="display:flex;gap:10px;grid-template-columns:none;align-items:flex-start;margin:6px 0"><input type="checkbox" data-i="${i}" style="margin-top:5px"><span>${esc(n[0])}</span></label>`).join("");
    const render = () => {
      const picked = [...box.querySelectorAll("input:checked")].map(c => NEEDS[Number(c.dataset.i)]);
      if (!picked.length) { out.className = "verdict act"; out.textContent = "Tick a box to see a recommendation."; return; }
      const by = new Map();
      picked.forEach(([need, tool, why]) => { if (!by.has(tool)) by.set(tool, []); by.get(tool).push(why); });
      const kinds = [...by.keys()].filter(k => k !== "Plugin");
      let html = [...by].map(([tool, whys]) => `<strong>${esc(tool)}</strong>: ${esc([...new Set(whys)].join("; "))}.`).join("<br>");
      if (kinds.length > 1 && !by.has("Plugin")) html += "<br>More than one piece: ship them together in a <strong>plugin</strong>.";
      if (by.has("Mod")) html += "<br>Writing a mod? Give every guard a <code>.catch</code>, and run <code>claude plugin validate</code> early.";
      out.className = by.has("Mod") ? "verdict watch" : "verdict act";
      out.innerHTML = html;
    };
    box.addEventListener("change", render);
    render();
  }

  // Chain simulator: one Bash call through managed hooks, four seats of mods and core.
  const chain = $("#chain-widget");
  if (chain) {
    const SEATS = [["managed", "Managed PreToolUse hook"], ["prepend", "prepend (org policy)"], ["user", "user (your mod)"], ["append", "append"], ["builtin", "builtin"]];
    const MOVES = {
      managed: [["pass", "lets it through"], ["block", "blocks rm -rf"]],
      mod: [["pass", "observes: next(e)"], ["rewrite", "rewrites to trash build"], ["deny", "denies: { deny }"], ["answer", "answers: { result }"], ["post", "post-processes the result"], ["throw", "throws a bug"], ["throwc", "throws, but has .catch"], ["slow", "takes 11 s"]],
    };
    const seats = $("#chain-seats", chain), out = $("#chain-out", chain), trace = $("#chain-trace", chain);
    seats.innerHTML = SEATS.map(([id, label]) => {
      const opts = (id === "managed" ? MOVES.managed : MOVES.mod).map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("");
      return `<label><span>${esc(label)}</span><select data-seat="${id}" style="font:15px var(--sans);padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)">${opts}</select><span></span></label>`;
    }).join("");
    const managedBlocks = cmd => /\brm\s+-rf\b/.test(cmd);
    const render = () => {
      const pick = Object.fromEntries([...seats.querySelectorAll("select")].map(s => [s.dataset.seat, s.value]));
      const steps = []; let cmd = "rm -rf build"; let rewritten = false; const unwind = [];
      const done = (cls, text) => { out.className = "verdict " + cls; out.textContent = text; trace.innerHTML = steps.map(s => `<li>${s}</li>`).join(""); };
      if (pick.managed === "block" && managedBlocks(cmd)) { steps.push("Managed <code>PreToolUse</code> blocks it. No mod ever sees the call."); return done("up", "Refused by managed settings. Final."); }
      steps.push("Managed <code>PreToolUse</code> hooks let it through.");
      for (const [id] of SEATS.slice(1)) {
        const m = pick[id];
        if (m === "pass") { steps.push(`<strong>${id}</strong> observes and calls <code>next(e)</code>.`); continue; }
        if (m === "post") { steps.push(`<strong>${id}</strong> calls <code>await next(e)</code> and will edit the result on the way out.`); unwind.push(id); continue; }
        if (m === "rewrite") {
          cmd = "trash build"; rewritten = true;
          steps.push(`<strong>${id}</strong> rewrites the call to <code>${cmd}</code>; seats further in see the new command.`);
          continue;
        }
        if (m === "deny") { steps.push(`<strong>${id}</strong> returns <code>{ deny }</code> without calling <code>next</code>. Nothing further in runs.`); return done("up", `Refused by the ${id} seat. Claude reads the reason.`); }
        if (m === "answer") { steps.push(`<strong>${id}</strong> returns its own <code>{ result }</code>. The tool never runs; Claude sees the hook's answer as if it had.`); return done("watch", `Answered by the ${id} seat. Nothing ran.`); }
        if (m === "throw") { steps.push(`<strong>${id}</strong> throws before <code>next</code>. It is <em>skipped</em> and the next seat runs in its place (fail open).`); continue; }
        if (m === "slow") { steps.push(`<strong>${id}</strong> runs past its 10 s budget. It is <em>skipped</em>; the call goes on (fail open).`); continue; }
        if (m === "throwc") { steps.push(`<strong>${id}</strong> throws; its <code>.catch</code> sees <code>next.called === false</code> and returns <code>{ deny }</code>.`); return done("up", `Refused by the ${id} seat's .catch (fail closed).`); }
      }
      if (rewritten) {
        if (pick.managed === "block" && managedBlocks(cmd)) { steps.push("Managed <code>PreToolUse</code> hooks run again on the rewritten call and block it."); return done("up", "Refused by managed settings on the rewrite."); }
        steps.push("Managed <code>PreToolUse</code> hooks run again on the rewritten call, and pass it.");
      }
      steps.push("Core: settings <code>PreToolUse</code> hooks, then <code>tool.check</code>, then the permission prompt if needed.");
      steps.push(`The tool runs <code>${esc(cmd)}</code>.`);
      unwind.reverse().forEach(id => steps.push(`On the way out, <strong>${id}</strong> edits the result before seats further out see it.`));
      const danger = /\brm\s+-rf\b/.test(cmd);
      done(danger ? "up" : "act", danger ? "rm -rf build ran. Every guard that failed, failed open." : `The tool ran ${cmd}.`);
    };
    seats.addEventListener("change", render);
    render();
  }
})();
