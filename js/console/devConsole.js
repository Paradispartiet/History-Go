// ============================================================
// === HISTORY GO – DEV CONSOLE (v2.1, timestamp + autoscroll)
// ============================================================
//
//  • Åpnes med ~ (tilde)
//  • Shift+Enter for multiline
//  • Intern logg lagres i localStorage (app_log)
//  • Kommandoer:
//      help, list, clear storage/log, show log/detailed,
//      debug on/off, log HG.data, reload
// ============================================================

(function() {
  let consoleOpen = false;
  let consoleEl, inputEl, outputEl;
  const logKey = "app_log";

  // ----------------------------------------------------------
  // INITIER TERMINAL
  // ----------------------------------------------------------
  function initConsole() {
    consoleEl = document.createElement("div");
    consoleEl.id = "devConsole";
    Object.assign(consoleEl.style, {
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "40vh",
      background: "rgba(0,0,0,.9)",
      color: "#0f0",
      fontFamily: "monospace",
      fontSize: "13px",
      borderTop: "1px solid rgba(255,255,255,.2)",
      zIndex: 999999,
      display: "none",
      flexDirection: "column",
      padding: "8px",
      boxSizing: "border-box"
    });

    outputEl = document.createElement("div");
    outputEl.style.flex = "1";
    outputEl.style.overflowY = "auto";
    outputEl.style.paddingRight = "6px";

    inputEl = document.createElement("textarea");
    inputEl.placeholder = "skriv kommando...";
    Object.assign(inputEl.style, {
      width: "100%",
      background: "rgba(255,255,255,.1)",
      border: "1px solid rgba(255,255,255,.2)",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: "13px",
      padding: "5px 8px",
      outline: "none",
      resize: "none",
      height: "40px"
    });

    consoleEl.appendChild(outputEl);
    consoleEl.appendChild(inputEl);
    document.body.appendChild(consoleEl);

    // --- multiline + enter ---
    inputEl.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const cmd = inputEl.value.trim();
        if (cmd) runCommand(cmd);
        inputEl.value = "";
      }
    });

    console.log("🧠 DevConsole v2.1 initialisert");
  }

  // ----------------------------------------------------------
  // VIS / SKJUL
  // ----------------------------------------------------------
  function toggleConsole() {
    if (!consoleEl) initConsole();
    consoleOpen = !consoleOpen;
    consoleEl.style.display = consoleOpen ? "flex" : "none";
    if (consoleOpen) inputEl.focus();
  }

  // ----------------------------------------------------------
  // HJELPEFUNKSJONER
  // ----------------------------------------------------------
  const timestamp = () => new Date().toLocaleTimeString("no-NO", { hour12: false });
  const loadLog = () => JSON.parse(localStorage.getItem(logKey) || "[]");
  const saveLog = arr => localStorage.setItem(logKey, JSON.stringify(arr.slice(-500)));

  function logLine(text, isError = false) {
    const time = timestamp();
    const div = document.createElement("div");
    div.innerHTML = `<span class="timestamp">[${time}]</span> ${text}`;
    if (isError) div.classList.add("error");
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;

    const log = loadLog();
    log.push({ time, text });
    saveLog(log);
  }

  function logList(arr, key) {
    if (!arr?.length) return logLine("(tom liste)");
    arr.slice(0, 10).forEach(e => logLine(`- ${e[key] || "(ingen navn)"}`));
  }

  // ----------------------------------------------------------
  // KJØR KOMMANDO
  // ----------------------------------------------------------
  function runCommand(cmd) {
    logLine(`> ${cmd}`);

    try {
      const [main, arg1, arg2] = cmd.toLowerCase().split(" ");

      switch (main) {
        case "help":
          logLine("Kommandoer:");
          logLine(" help, list places|people|routes");
          logLine(" clear storage|log, show log|detailed, reload");
          logLine(" debug on/off, log HG.data");
          break;

        case "list":
          if (arg1 === "places") logList(HG.data.places, "name");
          else if (arg1 === "people") logList(HG.data.people, "name");
          else if (arg1 === "routes") logList(HG.data.routes, "name");
          else logLine("Ukjent kategori.");
          break;

        case "clear":
          if (arg1 === "storage") {
            localStorage.clear();
            logLine("🧹 localStorage slettet");
          } else if (arg1 === "log") {
            localStorage.removeItem(logKey);
            logLine("🧼 Logg tømt");
          }
          break;

        case "show":
          if (arg1 === "log") {
            const entries = loadLog();
            logLine(`📜 Logg (${entries.length} linjer):`);
            entries.slice(-50).forEach(e => logLine(e.text));
          } else if (arg1 === "detailed") {
            const entries = loadLog();
            logLine(`📜 Detaljert logg (${entries.length} linjer):`);
            entries.slice(-50).forEach(e => logLine(`[${e.time}] ${e.text}`));
          }
          break;

        case "reload":
          location.reload();
          break;

        case "debug":
          if (arg1 === "on") {
            localStorage.setItem("debug", "true");
            logLine("✅ Debug aktivert");
          } else if (arg1 === "off") {
            localStorage.removeItem("debug");
            logLine("❌ Debug deaktivert");
          }
          break;

        case "log":
          if (arg1 === "hg.data") logLine(JSON.stringify(HG.data, null, 2));
          else logLine("Ukjent log-kommando.");
          break;

        default:
          const result = eval(cmd);
          logLine(result === undefined ? "(ingen returverdi)" : String(result));
      }
    } catch (err) {
      logLine(`⚠️ Feil: ${err.message}`, true);
    }
  }

  // ----------------------------------------------------------
  // HOTKEY ~
  // ----------------------------------------------------------
  document.addEventListener("keydown", e => {
    if (e.key === "~") toggleConsole();
  });
})();
