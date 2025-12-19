// js/console/diagnosticConsole.js
// =============================================================
// HISTORY GO — DIAGNOSTIC CONSOLE (v4.2, iPad-friendly, nyttig)
//  • Åpne/lukk:  DEV-knapp (🩺) når ?dev=1 eller localStorage.devMode="true"
//  • Viser: status, events, ruter, localStorage, JS-feil
//  • Kommandoer + knapper: status, health, domains, errors, routes check, storage check
//  • Eval (valgfritt): skriv JS og trykk Enter (Shift+Enter for ny linje)
//  • Modulstatus-panel (🧩) med ok/warn/idle/fail
//  • NYTT: Geo-hook som gjør "posisjon blokkert" = 🟡 AVVENTER, ikke 🔴 FEIL
// =============================================================
(() => {
  if (window.HGConsole) return;

  // -----------------------------
  // Utils
  // -----------------------------
  const ts = () => new Date().toLocaleTimeString();
  const safeJSON = (x) => {
    try { return JSON.stringify(x, null, 2); }
    catch { return String(x); }
  };
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

  // Dev mode gate (samme idé som init.js)
  const isDev =
    window.location.search.includes("dev=1") ||
    window.location.search.includes("dev") ||
    localStorage.getItem("devMode") === "true";

  // -----------------------------
  // UI
  // -----------------------------
  function createUI() {
    const wrap = document.createElement("section");
    wrap.id = "devConsole";
    wrap.className = "hg-console";
    wrap.style.display = "none";
    wrap.innerHTML = `
      <div class="hg-console-actions" aria-label="Console actions">
        <button data-cmd="status">Status</button>
        <button data-cmd="health">Health</button>
        <button data-cmd="domains">Domains</button>
        <button data-cmd="errors">Errors</button>
        <button data-cmd="routes check">Routes</button>
        <button data-cmd="storage check">Storage</button>
        <button data-cmd="clear log">Clear</button>
        <button data-cmd="hide">Hide</button>
      </div>

      <div class="hg-console-output" id="hgOut" aria-live="polite"></div>

      <textarea class="hg-console-input" id="hgIn" rows="2" spellcheck="false"
        placeholder="Skriv 'help' for kommandoer. Du kan også skrive JS (eval). Enter=kjør, Shift+Enter=ny linje."></textarea>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  // -----------------------------
  // State + logging
  // -----------------------------
  const state = {
    el: null,
    out: null,
    eventsLog: [],
    jsErrors: [],
    moduleStatus: {},   // { [name]: { status, detail, time } }
    statusPanel: null   // DOM element
  };

  function print(line, cls = "log") {
    if (!state.out) return;
    const div = document.createElement("div");
    div.className = `hg-log ${cls}`;
    div.innerHTML = `<span class="ts">[${ts()}]</span> ${line}`;
    state.out.appendChild(div);
    state.out.scrollTop = state.out.scrollHeight;
  }

  function printBlock(title, obj, cls = "log") {
    print(`<strong>${title}</strong>`, cls);
    print(`<pre>${safeJSON(obj)}</pre>`, cls);
  }

  // -----------------------------
  // Module status (ok/warn/idle/fail) — panel
  // -----------------------------
  const STATUS_META = {
    ok:   { dot: "🟢", cls: "ok",   label: "OK" },
    warn: { dot: "🟡", cls: "warn", label: "AVVENTER" },
    idle: { dot: "⚫", cls: "idle", label: "VALGFRI" },
    fail: { dot: "🔴", cls: "fail", label: "FEIL" }
  };

  const normalizeStatus = (s) => (STATUS_META[s] ? s : "fail");

 function ensureStatusPanel() {
  if (!isDev) return; // kun i dev-mode
  if (state.statusPanel) return;

  const panel = document.createElement("section");
  panel.id = "hgModuleStatus";

  panel.style.cssText = `
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 999999;
    background: rgba(10,20,35,.88);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    padding: 10px 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 14px;
    color: #e6eef9;
    min-width: 210px;
    max-width: 320px;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
  `;

  panel.innerHTML = `
    <div id="hgStatusHead" style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
      <div id="hgStatusTitle" style="font-weight:700;">🧩 Modulstatus</div>

      <div style="display:flex; align-items:center; gap:6px;">
        <button id="hgStatusToggle" type="button" style="
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.12);
          color: #e6eef9;
          width: 28px;
          height: 28px;
          border-radius: 9px;
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
        " aria-label="Minimer">▾</button>
      </div>
    </div>

    <div id="hgStatusList" style="margin-top:8px; display:flex; flex-direction:column; gap:6px;"></div>
  `;

  // --- FAB (egen knapp når panelet er minimert) ---
  let fab = document.getElementById("hgStatusFab");
  if (!fab) {
    fab = document.createElement("button");
    fab.id = "hgStatusFab";
    fab.type = "button";
    fab.textContent = "🧩";
    fab.setAttribute("aria-label", "Vis modulstatus");
    fab.style.cssText = `
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 999999;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      font-size: 18px;
      cursor: pointer;
      background: rgba(10,20,35,.88);
      border: 1px solid rgba(255,255,255,.12);
      color: #e6eef9;
      box-shadow: 0 10px 30px rgba(0,0,0,.35);
      display: none;
    `;
    document.body.appendChild(fab);
  }

  const btn = panel.querySelector("#hgStatusToggle");
const list = panel.querySelector("#hgStatusList");
const title = panel.querySelector("#hgStatusTitle");
const head = panel.querySelector("#hgStatusHead");

// --- FAB (minimert knapp) ---
let fab = document.getElementById("hgStatusFab");
if (!fab) {
  fab = document.createElement("button");
  fab.id = "hgStatusFab";
  fab.type = "button";
  fab.textContent = "🧩";
  fab.setAttribute("aria-label", "Vis modulstatus");
  fab.style.cssText = `
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 999999;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    font-size: 18px;
    cursor: pointer;
    background: rgba(10,20,35,.88);
    border: 1px solid rgba(255,255,255,.12);
    color: #e6eef9;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    display: none;
  `;
  document.body.appendChild(fab);
}

function setCollapsed(collapsed) {
  panel.dataset.collapsed = collapsed ? "1" : "0";
  localStorage.setItem("hg_modstatus_collapsed", collapsed ? "1" : "0");

  if (collapsed) {
    // Skjul hele panelet, vis kun FAB
    panel.style.display = "none";
    fab.style.display = "block";
    fab.style.pointerEvents = "auto";

  } else {
    // Vis panelet, skjul FAB
    panel.style.display = "block";
    fab.style.display = "none";

    // sørg for at innhold er synlig når panelet er åpent
    title.style.display = "";
    list.style.display = "flex";

    // knapp tilbake til liten toggle
    btn.textContent = "▾";
    btn.setAttribute("aria-label", "Minimer");
  }
}

// restore state (default = ÅPEN hvis ikke lagret)
const savedRaw = localStorage.getItem("hg_modstatus_collapsed");
const saved = savedRaw == null ? true : (savedRaw === "1");
setCollapsed(saved);

function toggleCollapsed() {
  const collapsed = panel.dataset.collapsed === "1";
  setCollapsed(!collapsed);
}

// Gjør header klikkbar (ikke bare knappen)
if (head) {
  head.style.cursor = "pointer";
  head.onclick = (e) => {
    // hvis man klikker på knappen, la knappen styre selv
    if (e.target && e.target.id === "hgStatusToggle") return;
    e.preventDefault();
    e.stopPropagation();
    toggleCollapsed();
  };
}

// Gjør tittel klikkbar (valgfritt, men nice)
if (title) {
  title.style.cursor = "pointer";
  title.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCollapsed();
  };
}

// Knappen (▾) toggler også
btn.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleCollapsed();
};

// Klikk på FAB → åpne
fab.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setCollapsed(false);
};

document.body.appendChild(panel);
state.statusPanel = panel;

  function renderStatusPanel() {
    if (!isDev) return;
    ensureStatusPanel();
    if (!state.statusPanel) return;

    const box = state.statusPanel.querySelector("#hgStatusList");
    const entries = Object.entries(state.moduleStatus);

    if (!entries.length) {
      box.innerHTML = `<div style="color:#9bb0c9;">Ingen moduler rapportert ennå.</div>`;
      return;
    }

    const rank = { fail: 0, warn: 1, idle: 2, ok: 3 };

    const rows = entries
      .sort((a, b) => {
        const sa = normalizeStatus(a[1].status);
        const sb = normalizeStatus(b[1].status);
        if (rank[sa] !== rank[sb]) return rank[sa] - rank[sb];
        return a[0].localeCompare(b[0]);
      })
      .map(([name, v]) => {
        const st = normalizeStatus(v.status);
        const meta = STATUS_META[st];
        const detail = v.detail ? String(v.detail) : "";
        const detailHtml = detail
          ? `<div style="color:#9bb0c9; font-size:12px; line-height:1.2; margin-left:22px;">${detail.replace(/</g, "&lt;")}</div>`
          : "";

        return `
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="width:18px;">${meta.dot}</span>
              <span style="flex:1;">${name}</span>
              <span style="color:#9bb0c9; font-size:12px;">${meta.label}</span>
            </div>
            ${detailHtml}
          </div>
        `;
      })
      .join("");

    box.innerHTML = rows;
  }

  // -----------------------------
  // Event tracking (read-only)
  // -----------------------------
  const TRACKED = [
    "updateProfile",
    "sheetOpened",
    "sheetClosed",
    "quizCompleted",
    "placeSelected",
    "routeActivated"
  ];

  function hookEvents() {
    TRACKED.forEach(ev =>
      window.addEventListener(ev, e => {
        state.eventsLog.push({ t: Date.now(), name: ev, detail: e?.detail });
        if (state.eventsLog.length > 200) state.eventsLog.shift();
      })
    );
  }

  // -----------------------------
  // Error capture
  // -----------------------------
  function hookErrors() {
    window.addEventListener("error", (e) => {
      state.jsErrors.push({
        time: Date.now(),
        message: e?.message,
        file: e?.filename,
        line: e?.lineno,
        col: e?.colno
      });
      if (state.jsErrors.length > 200) state.jsErrors.shift();
    });

    window.addEventListener("unhandledrejection", (e) => {
      const r = e?.reason;
      state.jsErrors.push({
        time: Date.now(),
        message: "Promise rejection: " + (r?.message || String(r)),
        stack: r?.stack || null
      });
      if (state.jsErrors.length > 200) state.jsErrors.shift();
    });
  }

  // -----------------------------
  // Geo status hook (NEW)
  // -----------------------------
  function hookGeoStatus() {
    if (!isDev) return;

    // Baseline: inntil geo er avklart skal disse ikke stå som FEIL.
    // (Du kan fjerne dette hvis andre moduler setter status senere.)
    if (!state.moduleStatus.API) api.warn("API", "Avventer posisjon");
    if (!state.moduleStatus.HG) api.warn("HG", "Avventer posisjon");
    if (!state.moduleStatus.DomainRegistry) api.warn("DomainRegistry", "Avventer posisjon");

    window.addEventListener("hg:geo", (e) => {
      const d = e?.detail || {};
      const st = d.status;

      if (st === "granted") {
        api.ok("API", "Geo OK");
        api.ok("HG", "Geo OK");
        api.ok("DomainRegistry", "Geo OK");
        return;
      }

      if (st === "blocked") {
        const reason =
          d.reason === "unsupported" ? "Geo ikke støttet" :
          d.reason === 1 ? "Blokkert i Safari" :
          d.reason === 2 ? "Fant ikke posisjon" :
          d.reason === 3 ? "Timeout" :
          (d.message || "Geo blokkert");

        api.warn("API", reason);
        api.warn("HG", reason);
        api.warn("DomainRegistry", reason);
        return;
      }

      if (st === "unknown") {
        api.warn("API", "Henter posisjon…");
        api.warn("HG", "Henter posisjon…");
        api.warn("DomainRegistry", "Henter posisjon…");
      }
    });
  }

  // -----------------------------
  // Status helpers
  // -----------------------------
  function readMapStatus() {
    const inst = window.MAP || window.HGMap?.MAP || null;

    let center = null, zoom = null, active = false;
    try {
      if (inst && typeof inst.getCenter === "function") {
        const c = inst.getCenter();
        center = [Number(c.lat.toFixed(5)), Number(c.lng.toFixed(5))];
        zoom = inst.getZoom();
        active = true;
      }
    } catch {}

    return {
      "#map-element": !!document.getElementById("map"),
      maplibrePresent: typeof window.maplibregl !== "undefined",
      hasHGMap: !!window.HGMap,
      hasMAP: !!window.MAP,
      active,
      center,
      zoom
    };
  }

  function readDataStatus() {
    const d = window.HG?.data || null;

    // fallback: prøv DataHub hvis den er global
    const hub = window.DataHub || window.dataHub || null;
    const hd = (hub && typeof hub.getData === "function") ? hub.getData() : null;

    const src = d || hd || {};

    return {
      source: d ? "HG.data" : (hd ? "DataHub.getData()" : "none"),
      places: src.places?.length || 0,
      people: src.people?.length || 0,
      badges: src.badges?.length || 0,
      routes: src.routes?.length || 0
    };
  }

  function readStorageStatus() {
    let bytes = 0, keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        bytes += k.length + (localStorage.getItem(k) || "").length;
        keys.push(k);
      }
    } catch {}
    return { keys, approxSize: kb(bytes) };
  }

  function checkRoutes() {
    const d = window.HG?.data || null;
    const hub = window.DataHub || window.dataHub || null;
    const hd = (hub && typeof hub.getData === "function") ? hub.getData() : null;
    const src = d || hd || {};

    const routes = src.routes || [];
    const places = new Set((src.places || []).map(p => p.id));

    const rep = routes.map(r => {
      const stops = (r.stops || []).map(s => s.placeId);
      const missing = stops.filter(id => !places.has(id));
      return { id: r.id || r.name, name: r.name, stops: stops.length, missing };
    });

    return {
      total: routes.length,
      problems: rep.filter(x => x.missing.length),
      ok: rep.filter(x => !x.missing.length)
    };
  }

  // -----------------------------
  // Commands
  // -----------------------------
  const commands = {
    help() {
      printBlock("Kommandoer", {
        status: "oversikt (map, data, storage, events count)",
        events: "siste 20 hendelser",
        "routes check": "valider ruter mot places",
        "storage check": "list localStorage nøkler + størrelse",
        errors: "JS-feil / promise-feil",
        health: "kjør DomainHealthReport (hvis lastet)",
        domains: "vis DomainRegistry (hvis lastet)",
        modulstatus: "vis modulstatus-panelet (🧩)",
        "clear log": "tøm konsollvisning",
        hide: "skjul konsollen",
        "JS eval": "skriv JS og trykk Enter (read-only anbefalt)"
      }, "cmd");
    },

    status() {
      printBlock("Map", readMapStatus());
      printBlock("Data", readDataStatus());
      printBlock("Storage", readStorageStatus());
      printBlock("Events (count)", { count: state.eventsLog.length });
    },

    events() {
      const last = state.eventsLog.slice(-20).map(e => ({
        time: new Date(e.t).toLocaleTimeString(),
        name: e.name,
        detail: e.detail || null
      }));
      printBlock("Siste hendelser", last);
    },

    "routes check"() {
      const rep = checkRoutes();
      printBlock("Ruter OK", rep.ok);
      if (rep.problems.length) printBlock("Ruter med manglende steder", rep.problems, "warn");
      else print("Ingen ruteproblemer funnet.", "cmd");
    },

    "storage check"() {
      printBlock("LocalStorage", readStorageStatus());
    },

    errors() {
      if (!state.jsErrors.length) print("Ingen JS-feil registrert.", "cmd");
      else printBlock("JS-feil", state.jsErrors, "error");
    },

    health: async () => {
      if (!window.DomainHealthReport) {
        print("DomainHealthReport mangler. Last js/domainHealthReport.js i index.html", "warn");
        return;
      }
      const r = await DomainHealthReport.run({ toast: true });
      printBlock("Health summary", r.summary, "cmd");
      if (r.manifest) printBlock("Quiz manifest", r.manifest, "cmd");
    },

    domains: () => {
      if (!window.DomainRegistry) {
        print("DomainRegistry mangler. Last js/domainRegistry.js i index.html", "warn");
        return;
      }
      printBlock("Domains", DomainRegistry.list(), "cmd");
      printBlock("Aliases", DomainRegistry.aliasMap(), "cmd");
    },

    modulstatus: () => {
      window.HGConsole?.showStatus();
      print("Modulstatus åpnet (🧩).", "cmd");
    },

    "clear log"() {
      if (state.out) state.out.innerHTML = "";
    },

    hide() {
      HGConsole.hide();
    }
  };

  // -----------------------------
  // Command runner (keeps your eval)
  // -----------------------------
  async function runCommand(raw) {
    if (!raw) return;
    print(`› ${raw}`, "cmd");

    const key = String(raw).trim().toLowerCase();
    const fn = commands[key];

    if (fn) {
      try {
        const out = fn();
        if (out instanceof Promise) await out;
        print(`✅ Utført`, "cmd");
      } catch (e) {
        print(`❌ Feil: ${e?.message || e}`, "error");
      }
      return;
    }

    // Fallback: eval (best effort)
    try {
      const res = eval(raw);
      if (res instanceof Promise) {
        res.then(v => printBlock("Eval-resultat (Promise)", v, "cmd"))
          .catch(e => print(`❌ Eval-feil: ${e?.message || e}`, "error"));
      } else if (typeof res === "object") {
        printBlock("Eval-resultat", res, "cmd");
      } else {
        print(`<span style="color:#7CFC00;">✅ ${String(res)}</span>`, "cmd");
      }
    } catch (e) {
      print(`❌ Eval-feil: ${e?.message || e}`, "error");
    }
  }

  // -----------------------------
  // Public API
  // -----------------------------
  const api = {
    show() { state.el.style.display = "flex"; },
    hide() { state.el.style.display = "none"; },
    toggle() {
      const vis = state.el.style.display !== "none";
      vis ? api.hide() : api.show();
    },

    // vanlig logging
    log(msg, type = "log") { print(String(msg), type); },
    run: runCommand,

    // ---- Modulstatus API ----
    set(moduleName, status, detail = "") {
      const st = normalizeStatus(status);
      state.moduleStatus[moduleName] = { status: st, detail, time: Date.now() };
      renderStatusPanel();
    },
    ok(name, detail = "")   { api.set(name, "ok", detail); },
    warn(name, detail = "") { api.set(name, "warn", detail); },
    idle(name, detail = "") { api.set(name, "idle", detail); },
    fail(name, detail = "") { api.set(name, "fail", detail); },

    showStatus() {
      ensureStatusPanel();
      if (state.statusPanel) state.statusPanel.style.display = "block";
      renderStatusPanel();
    },
    hideStatus() {
      if (state.statusPanel) state.statusPanel.style.display = "none";
    }
  };

  window.HGConsole = api;

  // -----------------------------
  // Init
  // -----------------------------
  state.el = createUI();
  state.out = state.el.querySelector("#hgOut");

  // Hook buttons
  state.el.querySelectorAll("[data-cmd]").forEach(btn => {
    btn.addEventListener("click", () => runCommand(btn.getAttribute("data-cmd")));
  });

  // Hook input
  const input = state.el.querySelector("#hgIn");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runCommand(input.value.trim());
      input.value = "";
    }
  });

  hookEvents();
  hookErrors();
  hookGeoStatus(); // ✅ NEW

  // Auto-create status panel in dev mode (hidden until it has data)
  ensureStatusPanel();
  renderStatusPanel();

  print("History Go Diagnostic Console · v4.2. Skriv \"help\" eller bruk knappene.", "cmd");

  // iPad friendly toggle button in dev mode
  if (isDev) {
    const btn = document.createElement("button");
    btn.textContent = "🩺";
    btn.title = "Åpne diagnosekonsoll";
    btn.className = "hg-console-btn";
    btn.onclick = () => api.toggle();
    document.body.appendChild(btn);

    // optional: quick-open modulstatus on long-press (iOS)
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      api.showStatus();
    });
  }
})();
