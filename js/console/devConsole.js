// ============================================================
// === HISTORY GO – DEV CONSOLE (v2.0, multiline + logg) ======
// ============================================================
//
//  • Åpnes med tilde (~)
//  • Shift+Enter = ny linje
//  • Skriver alt til intern app.log (localStorage)
//  • Henter historikk via kommandoer:
//      → show log
//      → clear log
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

    inputEl.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const cmd = inputEl.value.trim();
        if (cmd) runCommand(cmd);
        inputEl.value = "";
      }
    });

    console.log("🧠 DevConsole v2.0 initialisert");
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
          logLine(" clear storage, show log, clear log, reload");
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
            const entries = JSON.parse(localStorage.getItem(logKey) || "[]");
            logLine(`📜 Logg (${entries.length} linjer):`);
            entries.slice(-50).forEach(e => logLine(e));
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
          if (arg1 === "hg.data") {
            logLine(JSON.stringify(HG.data, null, 2));
          } else {
            logLine("Ukjent log-kommando.");
          }
          break;

        default:
          // eval — trygg eval med output
          const result = eval(cmd);
          logLine(result === undefined ? "(ingen returverdi)" : result);
      }
    } catch (err) {
      logLine(`⚠️ Feil: ${err.message}`, true);
    }
  }

  // ----------------------------------------------------------
  // LOGG-HJELPERE
  // ----------------------------------------------------------
  function logLine(text, isError = false) {
    const div = document.createElement("div");
    div.textContent = text;
    if (isError) div.style.color = "#f66";
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;

    const log = JSON.parse(localStorage.getItem(logKey) || "[]");
    log.push(text);
    localStorage.setItem(logKey, JSON.stringify(log.slice(-500))); // maks 500 linjer
  }

  function logList(arr, key) {
    if (!arr?.length) return logLine("(tom liste)");
    arr.slice(0, 10).forEach(e => logLine(`- ${e[key] || "(ingen navn)"}`));
  }

  // ----------------------------------------------------------
  // HOTKEY ~
  // ----------------------------------------------------------
  document.addEventListener("keydown", e => {
    if (e.key === "~") toggleConsole();
  });
})();
