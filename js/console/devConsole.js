// ============================================================
// === HISTORY GO – DEV CONSOLE (v2.2, interactive cmds) =====
// ============================================================
//
//  Åpnes med ~ (tilde). Shift+Enter for multiline.
//
//  Nye kommandoer:
//   • whoami                → viser HG.user (navn/farge)
//   • profile               → sammendrag av profil (level, poeng)
//   • profile set name "..."|color #hex
//   • stats                 → teller alt (steder, personer, quiz, merker)
//   • routes                → liste ruter (id + navn)
//   • route open <id|#idx>  → åpner rute i kartet
//   • mapinfo               → zoom, center, aktive lag/opacity
//
//  Eksisterende:
//   • help, list places|people|routes
//   • clear storage|log, show log|detailed, reload
//   • debug on/off, log HG.data
// ============================================================

(function() {
  "use strict";

  const qs = new URLSearchParams(window.location.search);
  const isDev =
    qs.has("dev_1") ||
    qs.get("dev_1") === "1" ||
    localStorage.getItem("devMode") === "true";

  if (!isDev) return;

  let consoleOpen = false;

  let consoleEl, inputEl, outputEl;
  const logKey = "app_log";

  // ---------- utils: storage ----------
  const loadJSON = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const saveJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const timestamp = () => new Date().toLocaleTimeString("no-NO", { hour12: false });

  // ---------- dom: init ----------
  function initConsole() {
    if (document.getElementById("devConsole")) return;

    consoleEl = document.createElement("div");
    consoleEl.id = "devConsole";
    consoleEl.className = "hg-console";

    outputEl = document.createElement("div");
    outputEl.className = "hg-console-output";

    inputEl = document.createElement("textarea");
    inputEl.className = "hg-console-input";
    inputEl.placeholder = "skriv kommando… (help)";

    consoleEl.appendChild(outputEl);
    consoleEl.appendChild(inputEl);
    document.body.appendChild(consoleEl);

    // multiline + enter
    inputEl.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const cmd = inputEl.value.trim();
        if (cmd) runCommand(cmd);
        inputEl.value = "";
      }
    });

    logLine("🧠 DevConsole v2.2 initialisert");
  }

  function toggleConsole() {
    if (!consoleEl) initConsole();
    consoleOpen = !consoleOpen;
    consoleEl.style.display = consoleOpen ? "flex" : "none";
    if (consoleOpen) inputEl.focus();
  }

  // ---------- logging ----------
  const loadLog = () => loadJSON(logKey, []);
  const saveLog = (arr) => saveJSON(logKey, arr.slice(-500));

  function logLine(text, type = "info") {
    const time = timestamp();
    const div = document.createElement("div");
    div.className = `hg-log ${type}`;
    div.innerHTML = `<span class="ts">[${time}]</span> ${escapeHTML(text)}`;
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;

    const log = loadLog();
    log.push({ time, text, type });
    saveLog(log);
  }
  const escapeHTML = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function logList(arr, key) {
    if (!arr?.length) return logLine("(tom liste)");
    arr.slice(0, 20).forEach((e, i) => logLine(`${i+1}. ${e[key] ?? "(ingen navn)"}  ${e.id ? `— ${e.id}` : ""}`));
  }

  // ---------- helpers: domain ----------
  function profileSummary() {
    const merits = loadJSON("merits_by_category", {});
    const visited = loadJSON("visited_places", []);
    const people  = loadJSON("people_collected", []);
    const quizzes = loadJSON("quiz_progress", {});
    const totalPoints = Object.values(merits).reduce((a, m) => a + (m?.points || 0), 0);
    const level = Math.floor(totalPoints / 50) + 1;
    return { merits, visited, people, quizzes, totalPoints, level };
  }

  function openRouteByKey(key) {
    const routes = window.HG?.data?.routes || [];
    if (!routes.length) { logLine("Ingen ruter i HG.data.routes", "warn"); return; }

    let route = null;
    if (key.startsWith("#")) {
      const idx = parseInt(key.slice(1), 10) - 1;
      route = routes[idx];
    } else {
      route = routes.find(r => r.id === key);
    }
    if (!route) { logLine("Fant ikke rute", "warn"); return; }

    // Prøv routes-modul, ellers map.showRouteNow
    if (window.Routes?.activateRoute) {
      window.Routes.activateRoute(route.id);
      logLine(`Rute aktivert via Routes: ${route.name}`);
    } else if (window.map?.showRouteNow) {
      window.map.showRouteNow(route);
      logLine(`Rute aktivert via map: ${route.name}`);
    } else {
      logLine("Ingen rutefunksjon tilgjengelig (mangler Routes/map)", "error");
    }
  }

  // ---------- command parser (med sitat/quotes) ----------
  function splitArgs(cmd) {
    const re = /"([^"]+)"|'([^']+)'|(\S+)/g;
    const out = [];
    let m;
    while ((m = re.exec(cmd))) out.push(m[1] || m[2] || m[3]);
    return out;
  }

  // ---------- run command ----------
  function runCommand(raw) {
    logLine(`> ${raw}`, "cmd");
    try {
      const parts = splitArgs(raw);
      const main = (parts[0] || "").toLowerCase();
      const a1 = (parts[1] || "").toLowerCase();
      const a2 = (parts[2] || "").toLowerCase();

      switch (main) {
        case "help":
          logLine("help, whoami, profile, profile set name \"…\"|color #hex, stats");
          logLine("routes, route open <id|#idx>, mapinfo");
          logLine("list places|people|routes");
          logLine("clear storage|log, show log|detailed, reload, debug on/off, log HG.data");
          break;

        case "whoami": {
          const user = window.HG?.user || {
            name: localStorage.getItem("user_name") || "Ukjent",
            color: localStorage.getItem("user_color") || "#FFD600"
          };
          logLine(`Bruker: ${user.name} · farge: ${user.color}`);
          break;
        }

        case "profile": {
          if (a1 === "set" && a2 === "name" && parts[3]) {
            const newName = parts.slice(3).join(" ");
            localStorage.setItem("user_name", newName);
            if (window.HG) window.HG.user = { ...(window.HG.user||{}), name: newName };
            window.dispatchEvent(new Event("updateProfile"));
            logLine(`Navn oppdatert → ${newName}`);
            break;
          }
          if (a1 === "set" && a2 === "color" && parts[3]) {
            const col = parts[3];
            localStorage.setItem("user_color", col);
            if (window.HG) window.HG.user = { ...(window.HG.user||{}), color: col };
            window.dispatchEvent(new Event("updateProfile"));
            logLine(`Farge oppdatert → ${col}`);
            break;
          }
          const u = window.HG?.user || {};
          const { totalPoints, level } = profileSummary();
          logLine(`Profil: ${u.name || localStorage.getItem("user_name") || "Ukjent"} · nivå ${level} · ${totalPoints}p`);
          break;
        }

        case "stats": {
          const { merits, visited, people, quizzes, totalPoints, level } = profileSummary();
          logLine(`Steder: ${visited.length} · Personer: ${people.length} · Quiz: ${Object.keys(quizzes).length} · Merker: ${Object.keys(merits).length}`);
          logLine(`Poeng: ${totalPoints} · Nivå: ${level}`);
          break;
        }

        case "routes":
          logLine("Ruter:");
          logList(window.HG?.data?.routes || [], "name");
          break;

        case "route":
          if (a1 === "open" && parts[2]) openRouteByKey(parts[2]);
          else logLine("Bruk: route open <id|#index>");
          break;

        case "mapinfo": {
          const L = window.L, m = window.map;
          const lm = document.getElementById("map") && window?.map && m;
          const g = window?.map && m;
          const leafletMap = m && m._getLeafletMap ? m._getLeafletMap() : (window._leaflet_map || null);
          // Fallback: prøv å finne fra global Leaflet
          const mapGuess = leafletMap || (window._leaflet_map = (window?.L && L?.map ? null : null));
          try {
            const mm = (window?.map && window.map._leafletMap) || null;
            const ll = mm || leafletMap;
            if (!ll) { logLine("Fant ikke Leaflet-kartinstans", "warn"); break; }
            const c = ll.getCenter(), z = ll.getZoom();
            logLine(`Kart: zoom ${z} · center ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
            const nl = window.map?._nightLayer?.options?.opacity ?? "(?)";
            const dl = window.map?._dayLayer?.options?.opacity ?? "(?)";
            logLine(`Lag: night=${nl} · day=${dl}`);
            const hasRoute = !!(window.map?._activeLineInner || window.map?._activeLineOuter || window.map?._activeGlow);
            logLine(`Aktiv rute: ${hasRoute ? "ja" : "nei"}`);
          } catch (e) {
            logLine(`mapinfo-feil: ${e.message}`, "error");
          }
          break;
        }

        case "list":
          if (a1 === "places") logList(HG?.data?.places || [], "name");
          else if (a1 === "people") logList(HG?.data?.people || [], "name");
          else if (a1 === "routes") logList(HG?.data?.routes || [], "name");
          else logLine("Ukjent kategori (places|people|routes).");
          break;

        case "clear":
          if (a1 === "storage") {
            localStorage.clear();
            window.dispatchEvent(new Event("updateProfile"));
            logLine("🧹 localStorage slettet");
          } else if (a1 === "log") {
            localStorage.removeItem(logKey);
            logLine("🧼 Logg tømt");
          } else logLine("Bruk: clear storage|log");
          break;

        case "show":
          if (a1 === "log") {
            const entries = loadLog();
            logLine(`📜 Logg (${entries.length} linjer):`);
            entries.slice(-50).forEach(e => logLine(e.text));
          } else if (a1 === "detailed") {
            const entries = loadLog();
            logLine(`📜 Detaljert logg (${entries.length} linjer):`);
            entries.slice(-50).forEach(e => logLine(`[${e.time}] ${e.text}`));
          } else logLine("Bruk: show log|detailed");
          break;

        case "reload": location.reload(); break;

        case "debug":
          if (a1 === "on")  { localStorage.setItem("debug","true"); logLine("✅ Debug aktivert"); }
          else if (a1 === "off") { localStorage.removeItem("debug"); logLine("❌ Debug deaktivert"); }
          else logLine("Bruk: debug on|off");
          break;

        case "log":
          if ((parts[1] || "").toLowerCase() === "hg.data") {
            logLine(JSON.stringify(HG?.data || {}, null, 2));
          } else logLine("Bruk: log HG.data");
          break;

        default:
          // Fallback: eval (bevisst synlig, intern dev-verktøy)
          // eslint-disable-next-line no-eval
          const result = eval(raw);
          logLine(result === undefined ? "(ingen returverdi)" : String(result));
      }
    } catch (err) {
      logLine(`⚠️ Feil: ${err.message}`, "error");
    }
  }

  // Hotkey
  document.addEventListener("keydown", e => {
    if (e.key === "~") {
      e.preventDefault();
      toggleConsole();
    }
  });

  // Gi map.js mulighet til å eksponere Leaflet-instans om ønskelig
  // (valgfritt – ikke påkrevd)
  if (!window.map?._getLeafletMap && window.map) {
    try {
      Object.defineProperty(window.map, "_getLeafletMap", {
        value: () => window.map?._leafletMap || null,
        writable: false
      });
    } catch {}
  }
})();
