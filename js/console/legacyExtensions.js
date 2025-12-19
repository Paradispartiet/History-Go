// js/console/legacyExtensions.js
// "Plug-in" som legger DevTools-features inn i eksisterende (gammel) konsoll.
// Fungerer best-effort: finner logger-funksjon eller logger-container og injiserer knapper.

(function () {
  if (window.HG_LEGACY_EXTENSIONS) return;
  window.HG_LEGACY_EXTENSIONS = true;

  // ---- 1) Finn en måte å skrive til din gamle konsoll på ----
  // Vi prøver flere "sannsynlige" API-er/DOM-er uten å vite hva du kalte dem.
  function findLegacySink() {
    // A) hvis du har en global med log-funksjon
    const candidates = [
      window.DevConsole,
      window.devConsole,
      window.DiagnosticConsole,
      window.diagnosticConsole,
      window.HG_CONSOLE,
      window.hgConsole
    ].filter(Boolean);

    for (const c of candidates) {
      if (typeof c.log === "function") {
        return (type, msg) => {
          try {
            if (type === "error" && typeof c.error === "function") c.error(msg);
            else if (type === "warn" && typeof c.warn === "function") c.warn(msg);
            else c.log(msg);
          } catch {}
        };
      }
      if (typeof c.append === "function") {
        return (type, msg) => { try { c.append(type, msg); } catch {} };
      }
      if (typeof c.addLine === "function") {
        return (type, msg) => { try { c.addLine(type, msg); } catch {} };
      }
    }

    // B) hvis konsollen har et log-container element
    const el =
      document.querySelector("#consoleLog") ||
      document.querySelector("#diagnosticLog") ||
      document.querySelector("#devConsoleLog") ||
      document.querySelector(".dev-console-log") ||
      document.querySelector(".diagnostic-log") ||
      document.querySelector("[data-console-log]");

    if (el) {
      return (type, msg) => {
        const row = document.createElement("div");
        row.style.cssText = "border-bottom:1px solid rgba(255,255,255,.08);padding:6px 0;white-space:pre-wrap;word-break:break-word;";
        const badge = type === "error" ? "🟥" : type === "warn" ? "🟨" : type === "net" ? "🟦" : "⬜️";
        row.textContent = `${badge} ${new Date().toISOString()} ${msg}`;
        el.appendChild(row);
        try { el.scrollTop = el.scrollHeight; } catch {}
      };
    }

    // C) fallback: ingen UI funnet -> gjør ingenting (men vi patcher fortsatt console i nettleseren)
    return null;
  }

  function formatArgs(args) {
    return args.map(a => {
      try {
        if (a instanceof Error) return a.stack || a.message;
        if (typeof a === "string") return a;
        return JSON.stringify(a, null, 2);
      } catch {
        return String(a);
      }
    }).join(" ");
  }

  const sink = findLegacySink();
  function write(type, ...args) {
    if (!sink) return;
    sink(type, formatArgs(args));
  }

  // ---- 2) Speil console.log/warn/error inn i gammel konsoll ----
  const orig = { log: console.log, warn: console.warn, error: console.error };
  console.log = (...a) => { orig.log(...a); write("log", ...a); };
  console.warn = (...a) => { orig.warn(...a); write("warn", ...a); };
  console.error = (...a) => { orig.error(...a); write("error", ...a); };

  // ---- 3) Global errors + promise rejections ----
  window.addEventListener("error", (e) => {
    write("error", "window.error:", e.message, e.filename, `line:${e.lineno}`, `col:${e.colno}`);
  });

  window.addEventListener("unhandledrejection", (e) => {
    write("error", "unhandledrejection:", e.reason);
  });

  // ---- 4) Fetch hook (nettverk) ----
  const _fetch = window.fetch;
  window.fetch = async function (...args) {
    const t0 = performance.now();
    const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url);
    try {
      const res = await _fetch.apply(this, args);
      const dt = Math.round(performance.now() - t0);
      write("net", "fetch", res.status, dt + "ms", url);
      return res;
    } catch (err) {
      const dt = Math.round(performance.now() - t0);
      write("error", "fetch FAIL", dt + "ms", url, err);
      throw err;
    }
  };

  // ---- 5) Debug-kommandoer (HG.*) ----
  window.HG = window.HG || {};

  function arr(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    return [x];
  }

  window.HG.dumpState = function () {
    const out = {
      hasPLACES: !!(window.PLACES || window.places),
      hasPEOPLE: !!(window.PEOPLE || window.people),
      placesCount: (window.PLACES || window.places || []).length,
      peopleCount: (window.PEOPLE || window.people || []).length,
      activeTheme: window.activeTheme || window.ACTIVE_THEME || null,
      scope: location.pathname
    };
    console.log("HG.dumpState:", out);
    return out;
  };

  window.HG.debugThemes = function () {
    const places = window.PLACES || window.places || [];
    console.log("PLACES count:", places.length);

    if (!places.length) {
      console.warn("PLACES er tom → last/reihefølge eller fetch/data-path problem, ikke kategori.");
      return;
    }

    const sample = places.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      theme: p.theme,
      themeId: p.themeId,
      subject_id: p.subject_id,
      tags: p.tags
    }));
    console.table(sample);

    const buckets = {};
    for (const p of places) {
      const keys = []
        .concat(arr(p.category))
        .concat(arr(p.theme))
        .concat(arr(p.themeId))
        .concat(arr(p.subject_id))
        .concat(arr(p.tags));

      for (const k of keys) {
        const kk = String(k).trim();
        if (!kk) continue;
        buckets[kk] = (buckets[kk] || 0) + 1;
      }
    }

    const top = Object.entries(buckets).sort((a,b) => b[1]-a[1]).slice(0, 40);
    console.log("Tema/keys funnet i data (topp):");
    console.table(top.map(([k,c]) => ({ key: k, count: c })));

    return { count: places.length, keys: top };
  };

  // ---- 6) Inject knapper/links inn i gammel konsoll UI (best-effort) ----
  function injectQuickActions() {
    // finn et toolbar/header sted i gammel konsoll
    const host =
      document.querySelector("#consoleToolbar") ||
      document.querySelector("#devConsoleToolbar") ||
      document.querySelector(".console-toolbar") ||
      document.querySelector(".dev-console-toolbar") ||
      document.querySelector("#diagnosticToolbar") ||
      document.querySelector("[data-console-toolbar]");

    // hvis vi ikke finner, prøv å legge over loggen (minimal invasiv)
    const fallback =
      document.querySelector("#consoleLog") ||
      document.querySelector("#diagnosticLog") ||
      document.querySelector("#devConsoleLog") ||
      document.querySelector(".dev-console-log") ||
      document.querySelector("[data-console-log]");

    const target = host || fallback;
    if (!target) return;

    const bar = document.createElement("div");
    bar.style.cssText = `
      display:flex; flex-wrap:wrap; gap:8px;
      padding:8px; border-bottom:1px solid rgba(255,255,255,.10);
      background: rgba(13,27,42,.35);
    `;

    function mk(label, cmd) {
      const b = document.createElement("button");
      b.textContent = label;
      b.style.cssText = `
        background: rgba(255,255,255,.06);
        color: inherit;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 10px;
        padding: 7px 10px;
        font-size: 12px;
      `;
      b.onclick = () => {
        console.log("> " + cmd);
        try { /* eslint-disable no-eval */ eval(cmd); } catch (e) { console.error(e); }
      };
      return b;
    }

    bar.appendChild(mk("Dump state", "HG.dumpState()"));
    bar.appendChild(mk("Debug themes", "HG.debugThemes()"));
    bar.appendChild(mk("PLACES 20", "console.table((window.PLACES||window.places||[]).slice(0,20))"));
    bar.appendChild(mk("PEOPLE 20", "console.table((window.PEOPLE||window.people||[]).slice(0,20))"));
    bar.appendChild(mk("Storage keys", "Object.keys(localStorage)"));
    bar.appendChild(mk("Cache keys", "caches?.keys?.()"));
    bar.appendChild(mk("URL", "location.href"));

    // Plassering:
    // - Hvis vi fant toolbar: append der.
    // - Hvis fallback (log): sett bar før loggen.
    if (host) target.appendChild(bar);
    else target.parentElement?.insertBefore(bar, target);
  }

  // prøv å injecte etter load (og litt senere, i tilfelle konsollen bygger UI sent)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectQuickActions);
  } else {
    injectQuickActions();
  }
  setTimeout(injectQuickActions, 600);

  console.log("Legacy console extensions loaded ✅ (hooks + quick actions + HG.*)");
})();
