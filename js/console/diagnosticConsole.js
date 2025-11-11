// =============================================================
// HISTORY GO — DIAGNOSTIC CONSOLE (v3.0, read-only)
//  • Åpne/lukk:  Ctrl + `   (tilde/backtick)
//  • Viser status, events, ruter, localStorage og JS-feil
//  • Endrer aldri app-data (kun leser og logger)
// =============================================================
(() => {
  if (window.HGConsole) return; // enkel guard

  // -----------------------------
  // Små utils
  // -----------------------------
  const ts = () => new Date().toLocaleTimeString();
  const safeJSON = (x) => {
    try { return JSON.stringify(x, null, 2); } catch { return String(x); }
  };
  const kb = (n) => `${(n/1024).toFixed(1)} KB`;

  // -----------------------------
  // UI oppsett (lager panelet)
  // -----------------------------
  function createUI() {
    const wrap = document.createElement('section');
    wrap.id = 'devConsole';
    wrap.className = 'hg-console';
    wrap.style.display = 'none';
    wrap.innerHTML = `
      <div class="hg-console-output" id="hgOut" aria-live="polite"></div>
      <textarea class="hg-console-input" id="hgIn" rows="2" spellcheck="false"
        placeholder="skriv 'help' for kommandoer …"></textarea>
    `;
    document.body.appendChild(wrap);

    const input = wrap.querySelector('#hgIn');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        runCommand(input.value.trim());
        input.value = '';
      }
    });
    return wrap;
  }

  // -----------------------------
  // Intern logg (kun konsollens egen)
  // -----------------------------
  const state = {
    el: null,
    out: null,
    eventsLog: [],
    jsErrors: [],
    debugEnabled: false,
    originalDispatch: null,
  };

  function print(line, cls = 'log') {
    if (!state.out) return;
    const div = document.createElement('div');
    div.className = `hg-log ${cls}`;
    div.innerHTML = `<span class="ts">[${ts()}]</span> ${line}`;
    state.out.appendChild(div);
    state.out.scrollTop = state.out.scrollHeight;
  }

  function printBlock(title, obj, cls = 'log') {
    print(`<strong>${title}</strong>`, cls);
    print(`<pre>${safeJSON(obj)}</pre>`, cls);
  }

  // -----------------------------
  // Event-tracking (read-only)
  // -----------------------------
  function hookDispatch() {
    if (state.originalDispatch) return;
    state.originalDispatch = window.dispatchEvent.bind(window);
    window.dispatchEvent = (evt) => {
      try {
        const name = evt?.type || '(ukjent)';
        state.eventsLog.push({ t: Date.now(), name, detail: evt?.detail });
        if (state.eventsLog.length > 200) state.eventsLog.shift();
      } catch {}
      return state.originalDispatch(evt);
    };
  }

  function unhookDispatch() {
    if (state.originalDispatch) {
      window.dispatchEvent = state.originalDispatch;
      state.originalDispatch = null;
    }
  }

  // Lytt også direkte på noen kjerne-events
  ['updateProfile','sheetOpened','sheetClosed','quizCompleted','placeSelected','routeActivated']
    .forEach(ev => window.addEventListener(ev, (e) => {
      state.eventsLog.push({ t: Date.now(), name: ev, detail: e?.detail });
      if (state.eventsLog.length > 200) state.eventsLog.shift();
    }));

  // -----------------------------
  // JS-feil (read-only)
  // -----------------------------
  window.addEventListener('error', (e) => {
    state.jsErrors.push({
      time: Date.now(),
      message: e?.message,
      file: e?.filename,
      line: e?.lineno,
      col: e?.colno,
    });
  });
  window.addEventListener('unhandledrejection', (e) => {
    state.jsErrors.push({
      time: Date.now(),
      message: `Promise rejection: ${e?.reason}`,
    });
  });

  // -----------------------------
  // Lesestatus (muterer ikke)
  // -----------------------------
  function readMapStatus() {
    const Lmap = window.map;                  // vår modul
    const lf = window.L && document.getElementById('map') ? (L?.map ? true : true) : false;
    let center=null, zoom=null, active=false;

    // prøv å lese Leaflet-instansen fra map-modulen (leafletMap)
    try {
      const leafletMap = (Lmap && Lmap._getLeafletMap) ? Lmap._getLeafletMap() : null;
      if (leafletMap) {
        const c = leafletMap.getCenter();
        center = [Number(c.lat.toFixed(5)), Number(c.lng.toFixed(5))];
        zoom = leafletMap.getZoom();
        active = true;
      }
    } catch {}

    return { leafletPresent: !!lf, active, center, zoom };
  }

  function readDataStatus() {
    const d = window.HG?.data || {};
    return {
      places: Array.isArray(d.places) ? d.places.length : 0,
      people: Array.isArray(d.people) ? d.people.length : 0,
      badges: Array.isArray(d.badges) ? d.badges.length : 0,
      routes: Array.isArray(d.routes) ? d.routes.length : 0,
      missing: Object.fromEntries(['places','people','badges','routes'].map(k => [k, !d[k]]))
    };
  }

  function readStorageStatus() {
    let bytes = 0;
    try {
      for (let i=0; i<localStorage.length; i++) {
        const k = localStorage.key(i);
        const v = localStorage.getItem(k) || '';
        bytes += k.length + v.length;
      }
    } catch {}
    const keys = [];
    try {
      for (let i=0; i<localStorage.length; i++) {
        const k = localStorage.key(i);
        keys.push(k);
      }
    } catch {}
    return { keys, approxSize: kb(bytes) };
  }

  function checkRoutes() {
    const routes = window.HG?.data?.routes || [];
    const places = new Set((window.HG?.data?.places || []).map(p => p.id));
    const report = routes.map(r => {
      const stops = (r.stops || []).map(s => s.placeId);
      const missing = stops.filter(id => !places.has(id));
      return { id: r.id || r.name, name: r.name, stops: stops.length, missing };
    });
    return {
      total: routes.length,
      problems: report.filter(x => x.missing.length > 0),
      ok: report.filter(x => x.missing.length === 0)
    };
  }

  // -----------------------------
  // Kommandoer (read-only)
  // -----------------------------
  const commands = {
    help() {
      printBlock('Kommandoer', {
        'status': 'kort oversikt (map, data, storage, events)',
        'events': 'siste 20 hendelser',
        'routes check': 'valider ruter mot places',
        'storage check': 'list nøkler og størrelse',
        'errors': 'JS-feil / promise-feil',
        'debug on/off': 'slå ekstra logging i denne konsollen av/på',
        'clear log': 'tøm konsollens visning (ikke data)',
        'hide': 'skjul konsollen'
      }, 'cmd');
    },

    status() {
      printBlock('Map', readMapStatus());
      printBlock('Data', readDataStatus());
      printBlock('Storage', readStorageStatus());
      printBlock('Events (count)', { count: state.eventsLog.length });
    },

    events() {
      const last = state.eventsLog.slice(-20).map(e => ({
        time: new Date(e.t).toLocaleTimeString(),
        name: e.name,
        detail: e.detail ? e.detail : null
      }));
      printBlock('Siste hendelser', last);
    },

    'routes check'() {
      const rep = checkRoutes();
      printBlock('Ruter OK', rep.ok.map(x => ({ id:x.id, name:x.name, stops:x.stops })));
      if (rep.problems.length) {
        printBlock('Ruter med manglende steder', rep.problems, 'warn');
      } else {
        print('Ingen ruteproblemer funnet.', 'cmd');
      }
    },

    'storage check'() {
      printBlock('LocalStorage', readStorageStatus());
      const keys = ['visited_places','people_collected','merits_by_category','quiz_progress'];
      const dump = {};
      keys.forEach(k => {
        try { dump[k] = JSON.parse(localStorage.getItem(k) || 'null'); }
        catch { dump[k] = '(kunne ikke parse)'; }
      });
      printBlock('Utvalgte nøkler', dump);
    },

    errors() {
      if (!state.jsErrors.length) {
        print('Ingen JS-feil registrert siden last.', 'cmd');
      } else {
        const list = state.jsErrors.map(e => ({
          time: new Date(e.time).toLocaleTimeString(),
          message: e.message, file: e.file, line: e.line, col: e.col
        }));
        printBlock('JS-feil', list, 'error');
      }
    },

    'debug on'()  { state.debugEnabled = true;  print('Debug: ON', 'cmd'); },
    'debug off'() { state.debugEnabled = false; print('Debug: OFF', 'cmd'); },

    'clear log'() { if (state.out) state.out.innerHTML = ''; },

    hide() { HGConsole.hide(); },
  };

  function runCommand(raw) {
    if (!raw) return;
    print(`› ${raw}`, 'cmd');
    const cmd = raw.toLowerCase();
    const fn = commands[cmd];
    if (fn) {
      try { fn(); } catch (e) { print(`Feil i kommando: ${e}`, 'error'); }
    } else {
      print(`Ukjent kommando. Skriv <strong>help</strong>.`, 'warn');
    }
  }

  // -----------------------------
  // Public API
  // -----------------------------
  const api = {
    show() { state.el.style.display = 'flex'; },
    hide() { state.el.style.display = 'none'; },
    log(msg, type='log') { print(String(msg), type); },
    run: runCommand
  };
  window.HGConsole = api;

  // -----------------------------
  // Init ved last
  // -----------------------------
  state.el = createUI();
  state.out = state.el.querySelector('#hgOut');
  hookDispatch();
  print('History Go Diagnostic Console · v3.0 (read-only). Skriv "help".', 'cmd');

  // Toggle: Ctrl + `
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      const visible = state.el.style.display !== 'none';
      visible ? api.hide() : api.show();
    }
  });

  // ----------------------------------------------------------
  // DIAGNOSE-KNAPP (vises kun med ?dev=1)
  // ----------------------------------------------------------
  if (window.location.search.includes("dev=1")) {
    const btn = document.createElement("button");
    btn.textContent = "🩺";
    btn.title = "Åpne diagnosekonsoll";
    btn.className = "hg-console-btn";
    btn.onclick = () => {
      const visible = state.el.style.display !== "none";
      visible ? api.hide() : api.show();
    };
    document.body.appendChild(btn);
  }

})();
