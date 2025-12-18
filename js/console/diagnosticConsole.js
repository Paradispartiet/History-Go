// js/console/diagnosticConsole.js
// =============================================================
// HISTORY GO — DIAGNOSTIC CONSOLE (v4.0, iPad-friendly, nyttig)
//  • Åpne/lukk:  DEV-knapp (🩺) når ?dev=1 eller localStorage.devMode="true"
//  • Viser: status, events, ruter, localStorage, JS-feil
//  • Kommandoer + knapper: status, health, domains, errors, routes check, storage check
//  • Eval (valgfritt): skriv JS og trykk Enter (Shift+Enter for ny linje)
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
    jsErrors: []
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
  // Status helpers
  // -----------------------------
  function readMapStatus() {
    // Din app bruker MapLibre (map.js), men du har litt Leaflet-sjekk i gammel konsoll.
    // Her gjør vi en “best effort” uten å anta for mye:
    const hasMapEl = !!document.getElementById("map");
    const hasMapLibre = !!window.maplibregl;
    const hasMapObj = !!window.map;
    const hasInit = typeof window.map?.initMap === "function" || typeof window.initMap === "function";

    return {
      "#map-element": hasMapEl,
      "maplibregl": hasMapLibre,
      "window.map": hasMapObj,
      "initMap function": hasInit
    };
  }

  function readDataStatus() {
    // Du bruker dataHub/HG.data i flere deler.
    const d = window.HG?.data || {};
    return {
      places: d.places?.length || 0,
      people: d.people?.length || 0,
      badges: d.badges?.length || 0,
      routes: d.routes?.length || 0
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
    const routes = window.HG?.data?.routes || [];
    const places = new Set((window.HG?.data?.places || []).map(p => p.id));
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
    log(msg, type = "log") { print(String(msg), type); },
    run: runCommand
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

  print("History Go Diagnostic Console · v4.0. Skriv \"help\" eller bruk knappene.", "cmd");

  // iPad friendly toggle button in dev mode
  if (isDev) {
    const btn = document.createElement("button");
    btn.textContent = "🩺";
    btn.title = "Åpne diagnosekonsoll";
    btn.className = "hg-console-btn";
    btn.onclick = () => api.toggle();
    document.body.appendChild(btn);
  }
})();
