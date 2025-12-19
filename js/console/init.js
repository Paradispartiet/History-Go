// js/console/hgConsole.js
(function () {
  if (window.HG_DEVTOOLS) return;

  const state = {
    logs: [],
    max: 500,
    filter: "all", // all | log | warn | error | net
    pause: false,
    open: false
  };

  function esc(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function formatArg(a) {
    try {
      if (a instanceof Error) return a.stack || a.message;
      if (typeof a === "string") return a;
      return JSON.stringify(a, null, 2);
    } catch {
      return String(a);
    }
  }

  function push(type, args) {
    if (state.pause) return;
    const msg = args.map(formatArg).join(" ");
    state.logs.push({ t: new Date().toISOString(), type, msg });
    if (state.logs.length > state.max) state.logs.shift();
    render();
  }

  // --- UI ---
  const ui = document.createElement("div");
  ui.id = "hg-devtools";
  ui.style.cssText = `
    position: fixed;
    left: 8px; right: 8px; bottom: 8px;
    z-index: 999999;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: #e6eef9;
    pointer-events: none;
  `;

  const btn = document.createElement("button");
  btn.textContent = "⛏️ Console";
  btn.style.cssText = `
    pointer-events: auto;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(13,27,42,.88);
    color: inherit;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 13px;
  `;

  const panel = document.createElement("div");
  panel.style.cssText = `
    display:none;
    margin-top: 8px;
    pointer-events:auto;
    border:1px solid rgba(255,255,255,.12);
    background: rgba(13,27,42,.92);
    border-radius: 12px;
    overflow:hidden;
  `;

  function buttonStyle() {
    return `background:rgba(255,255,255,.06);color:#e6eef9;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:7px 10px;font-size:12px`;
  }

  panel.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;padding:8px;border-bottom:1px solid rgba(255,255,255,.10)">
      <strong style="flex:1">HG DevTools</strong>

      <select id="hgFilter" style="background:rgba(255,255,255,.06);color:#e6eef9;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:6px">
        <option value="all">all</option>
        <option value="log">log</option>
        <option value="warn">warn</option>
        <option value="error">error</option>
        <option value="net">net</option>
      </select>

      <button id="hgPause" style="${buttonStyle()}">pause</button>
      <button id="hgClear" style="${buttonStyle()}">clear</button>
      <button id="hgClose" style="${buttonStyle()}">close</button>
    </div>

    <!-- QUICK ACTIONS -->
    <div style="display:flex;flex-wrap:wrap;gap:8px;padding:8px;border-bottom:1px solid rgba(255,255,255,.10)">
      <button class="hgqa" data-cmd="HG.dumpState()" style="${buttonStyle()}">Dump state</button>
      <button class="hgqa" data-cmd="HG.debugThemes()" style="${buttonStyle()}">Debug themes</button>
      <button class="hgqa" data-cmd="console.table((window.PLACES||window.places||[]).slice(0,20))" style="${buttonStyle()}">PLACES 20</button>
      <button class="hgqa" data-cmd="console.table((window.PEOPLE||window.people||[]).slice(0,20))" style="${buttonStyle()}">PEOPLE 20</button>
      <button class="hgqa" data-cmd="localStorage.length" style="${buttonStyle()}">Storage len</button>
      <button class="hgqa" data-cmd="Object.keys(localStorage)" style="${buttonStyle()}">Storage keys</button>
      <button class="hgqa" data-cmd="caches?.keys?.()" style="${buttonStyle()}">Cache keys</button>
      <button class="hgqa" data-cmd="location.href" style="${buttonStyle()}">URL</button>
    </div>

    <div id="hgLog" style="max-height:42vh;overflow:auto;padding:8px;font-size:12px;line-height:1.35"></div>

    <div style="display:flex;gap:8px;padding:8px;border-top:1px solid rgba(255,255,255,.10)">
      <input id="hgCmd" placeholder="Skriv JS her (eller trykk en knapp over)"
        style="flex:1;background:rgba(255,255,255,.06);color:#e6eef9;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px;font-size:12px" />
      <button id="hgRun" style="background:rgba(255,255,255,.10);color:#e6eef9;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px">run</button>
    </div>
  `;

  ui.appendChild(btn);
  ui.appendChild(panel);
  document.documentElement.appendChild(ui);

  function render() {
    const logEl = panel.querySelector("#hgLog");
    if (!logEl) return;

    const f = state.filter;
    const rows = state.logs
      .filter(r => f === "all" || r.type === f)
      .slice(-250);

    logEl.innerHTML = rows.map(r => {
      const badge =
        r.type === "error" ? "🟥" :
        r.type === "warn"  ? "🟨" :
        r.type === "net"   ? "🟦" : "⬜️";
      return `
        <div style="border-bottom:1px solid rgba(255,255,255,.06);padding:6px 0">
          <div style="opacity:.75">${badge} ${esc(r.t)} <span style="opacity:.7">(${esc(r.type)})</span></div>
          <pre style="white-space:pre-wrap;margin:4px 0 0">${esc(r.msg)}</pre>
        </div>
      `;
    }).join("");

    logEl.scrollTop = logEl.scrollHeight;
  }

  function toggle(open) {
    state.open = open ?? !state.open;
    panel.style.display = state.open ? "block" : "none";
  }

  function run(code) {
    const c = (code || "").trim();
    if (!c) return;
    push("log", ["> " + c]);
    try {
      // eslint-disable-next-line no-eval
      const out = eval(c);
      push("log", [out]);
      return out;
    } catch (err) {
      push("error", [err]);
      return null;
    }
  }

  // Buttons
  btn.onclick = () => toggle(true);
  panel.querySelector("#hgClose").onclick = () => toggle(false);
  panel.querySelector("#hgClear").onclick = () => { state.logs = []; render(); };
  panel.querySelector("#hgPause").onclick = (e) => {
    state.pause = !state.pause;
    e.target.textContent = state.pause ? "resume" : "pause";
  };
  panel.querySelector("#hgFilter").onchange = (e) => { state.filter = e.target.value; render(); };

  // Quick actions
  panel.querySelectorAll(".hgqa").forEach(b => {
    b.onclick = () => run(b.getAttribute("data-cmd"));
  });

  // Command input
  const cmdInput = panel.querySelector("#hgCmd");
  panel.querySelector("#hgRun").onclick = () => run(cmdInput.value);
  cmdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run(cmdInput.value);
  });

  // Public API
  window.HG_DEVTOOLS = {
    log: (...a) => push("log", a),
    warn: (...a) => push("warn", a),
    error: (...a) => push("error", a),
    net: (...a) => push("net", a),
    toggle,
    run,
    state
  };

  // Mirror console output
  const orig = { log: console.log, warn: console.warn, error: console.error };
  console.log = (...a) => { orig.log(...a); push("log", a); };
  console.warn = (...a) => { orig.warn(...a); push("warn", a); };
  console.error = (...a) => { orig.error(...a); push("error", a); };

  push("log", ["HG DevTools loaded ✅"]);
})();
