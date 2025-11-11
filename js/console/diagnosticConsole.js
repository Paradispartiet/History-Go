// =============================================================
// HISTORY GO — DIAGNOSTIC CONSOLE (v3.1, utvidet og trygg)
//  • Åpne/lukk:  Ctrl + `   (tilde/backtick)
//  • Viser status, events, ruter, localStorage og JS-feil
//  • Evaluerer JS-uttrykk uten å endre app-data
// =============================================================
(() => {
  if (window.HGConsole) return;

  // -----------------------------
  // Små utils
  // -----------------------------
  const ts = () => new Date().toLocaleTimeString();
  const safeJSON = (x) => { try { return JSON.stringify(x, null, 2); } catch { return String(x); } };
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

  // -----------------------------
  // UI
  // -----------------------------
  function createUI() {
    const wrap = document.createElement("section");
    wrap.id = "devConsole";
    wrap.className = "hg-console";
    wrap.style.display = "none";
    wrap.innerHTML = `
      <div class="hg-console-output" id="hgOut" aria-live="polite"></div>
      <textarea class="hg-console-input" id="hgIn" rows="2" spellcheck="false"
        placeholder="skriv 'help' for kommandoer …"></textarea>`;
    document.body.appendChild(wrap);

    const input = wrap.querySelector("#hgIn");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        runCommand(input.value.trim());
        input.value = "";
      }
    });
    return wrap;
  }

  // -----------------------------
  // Tilstand og logging
  // -----------------------------
  const state = { el: null, out: null, eventsLog: [], jsErrors: [], originalDispatch: null };
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
  function hookDispatch() {
    if (state.originalDispatch) return;
    state.originalDispatch = window.dispatchEvent.bind(window);
    window.dispatchEvent = (evt) => {
      try {
        state.eventsLog.push({ t: Date.now(), name: evt?.type, detail: evt?.detail });
        if (state.eventsLog.length > 200) state.eventsLog.shift();
      } catch {}
      return state.originalDispatch(evt);
    };
  }
  ["updateProfile","sheetOpened","sheetClosed","quizCompleted","placeSelected","routeActivated"]
    .forEach(ev => window.addEventListener(ev, e => {
      state.eventsLog.push({ t: Date.now(), name: ev, detail: e?.detail });
      if (state.eventsLog.length > 200) state.eventsLog.shift();
    }));

  // -----------------------------
  // Feilfangst
  // -----------------------------
  window.addEventListener("error", e =>
    state.jsErrors.push({ time: Date.now(), message: e?.message, file: e?.filename, line: e?.lineno, col: e?.colno })
  );
  window.addEventListener("unhandledrejection", e =>
    state.jsErrors.push({ time: Date.now(), message: `Promise rejection: ${e?.reason}` })
  );

  // -----------------------------
  // Statusfunksjoner
  // -----------------------------
  function readMapStatus() {
    const Lmap = window.map;
    let center = null, zoom = null, active = false;
    try {
      const leafletMap = (Lmap && Lmap._getLeafletMap) ? Lmap._getLeafletMap() : null;
      if (leafletMap) {
        const c = leafletMap.getCenter();
        center = [Number(c.lat.toFixed(5)), Number(c.lng.toFixed(5))];
        zoom = leafletMap.getZoom();
        active = true;
      }
    } catch {}
    return { leafletPresent: !!window.L, active, center, zoom };
  }
  function readDataStatus() {
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
    return { total: routes.length, problems: rep.filter(x => x.missing.length), ok: rep.filter(x => !x.missing.length) };
  }

  // -----------------------------
  // Kommandoer
  // -----------------------------
  const commands = {
    help() {
      printBlock("Kommandoer", {
        status: "kort oversikt (map, data, storage, events)",
        mapcheck: "sjekker kartstatus (Leaflet, initMap, data osv.)",
        events: "siste 20 hendelser",
        "routes check": "valider ruter mot places",
        "storage check": "list nøkler og størrelse",
        errors: "JS-feil / promise-feil",
        "debug on/off": "slå ekstra logging i denne konsollen av/på",
        "clear log": "tøm konsollens visning",
        hide: "skjul konsollen"
      }, "cmd");
    },
    mapcheck() {
      const mapEl = document.getElementById("map");
      const leaflet = typeof L !== "undefined";
      const initFn = typeof map?.initMap === "function";
      const dataOK = !!window.HG?.data?.places?.length;
      const result = {
        "#map-element": mapEl ? "✅ finnes" : "❌ mangler",
        "Leaflet (L)": leaflet ? "✅ lastet" : "❌ ikke funnet",
        "map.initMap()": initFn ? "✅ definert" : "❌ mangler",
        "HG.data.places": dataOK ? `✅ ${HG.data.places.length} steder` : "❌ ingen data"
      };
      printBlock("Kart-diagnose", result);
    },
    status() {
      printBlock("Map", readMapStatus());
      printBlock("Data", readDataStatus());
      printBlock("Storage", readStorageStatus());
      printBlock("Events (count)", { count: state.eventsLog.length });
    },
    events() {
      const last = state.eventsLog.slice(-20).map(e => ({
        time: new Date(e.t).toLocaleTimeString(), name: e.name, detail: e.detail || null
      }));
      printBlock("Siste hendelser", last);
    },
    "routes check"() {
      const rep = checkRoutes();
      printBlock("Ruter OK", rep.ok);
      if (rep.problems.length) printBlock("Ruter med manglende steder", rep.problems, "warn");
      else print("Ingen ruteproblemer funnet.", "cmd");
    },
    "storage check"() { printBlock("LocalStorage", readStorageStatus()); },
    errors() {
      if (!state.jsErrors.length) print("Ingen JS-feil registrert.", "cmd");
      else printBlock("JS-feil", state.jsErrors, "error");
    },
    "debug on"() { print("Debug: ON", "cmd"); },
    "debug off"() { print("Debug: OFF", "cmd"); },
    "clear log"() { state.out.innerHTML = ""; },
    hide() { HGConsole.hide(); }
  };

  // -----------------------------
  // Kommando-parser + eval med grønn suksess
  // -----------------------------
  function runCommand(raw) {
    if (!raw) return;
    print(`› ${raw}`, "cmd");
    const m = raw.match(/^(\w+)\s*:?\s*(.*)$/);
    const cmd = m ? m[1].toLowerCase() : raw.toLowerCase();
    const arg = (m && m[2]) ? m[2] : "";
    const fn = commands[cmd];
    if (fn) {
      try { fn(arg); print(`<span style="color:#7CFC00;">✅ Utført</span>`, "cmd"); }
      catch (e) { print(`❌ Feil: ${e}`, "error"); }
      return;
    }
    try {
      const res = eval(raw);
      if (res instanceof Promise)
        res.then(v => { printBlock("Eval-resultat (Promise)", v); print(`<span style="color:#7CFC00;">✅ Kjørte Promise</span>`, "cmd"); })
           .catch(e => print(`❌ Feil: ${e}`, "error"));
      else if (typeof res === "object") { printBlock("Eval-resultat", res); print(`<span style="color:#7CFC00;">✅ Objekt lest</span>`, "cmd"); }
      else { print(`<span style="color:#7CFC00;">✅ ${String(res)}</span>`, "cmd"); }
    } catch (e) { print(`❌ Eval-feil: ${e}`, "error"); }
  }

  // -----------------------------
  // Public API
  // -----------------------------
  const api = {
    show() { state.el.style.display = "flex"; },
    hide() { state.el.style.display = "none"; },
    log(msg, type = "log") { print(String(msg), type); },
    run: runCommand
  };
  window.HGConsole = api;

  // -----------------------------
  // Init
  // -----------------------------
  state.el = createUI();
  state.out = state.el.querySelector("#hgOut");
  hookDispatch();
  print("History Go Diagnostic Console · v3.1 (read-only). Skriv \"help\".", "cmd");

  // Toggle Ctrl+`
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "`") {
      e.preventDefault();
      const vis = state.el.style.display !== "none";
      vis ? api.hide() : api.show();
    }
  });

  // Diagnose-knapp (?dev=1)
  if (window.location.search.includes("dev=1")) {
    const btn = document.createElement("button");
    btn.textContent = "🩺";
    btn.title = "Åpne diagnosekonsoll";
    btn.className = "hg-console-btn";
    btn.onclick = () => {
      const vis = state.el.style.display !== "none";
      vis ? api.hide() : api.show();
    };
    document.body.appendChild(btn);
  }
})();
