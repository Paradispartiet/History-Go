// ============================================================
// === HISTORY GO – DEV CONSOLE (interaktiv terminal) =========
// ============================================================
//
//  Åpnes/lukkes med: ~  (tilde-tasten)
//
//  Kommandoer (eksempler):
//   • help
//   • list places
//   • list routes
//   • list people
//   • clear storage
//   • reload
//   • debug on / debug off
//   • log HG.data
// ============================================================

(function() {
  let consoleOpen = false;
  let consoleEl, inputEl, outputEl;

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
      background: "rgba(0,0,0,.88)",
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

    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.placeholder = "skriv kommando...";
    Object.assign(inputEl.style, {
      width: "100%",
      background: "rgba(255,255,255,.1)",
      border: "1px solid rgba(255,255,255,.2)",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: "13px",
      padding: "5px 8px",
      outline: "none"
    });

    consoleEl.appendChild(outputEl);
    consoleEl.appendChild(inputEl);
    document.body.appendChild(consoleEl);

    inputEl.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const cmd = inputEl.value.trim();
        if (cmd) runCommand(cmd);
        inputEl.value = "";
      }
    });

    console.log("🧠 DevConsole initialisert");
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
    const log = msg => {
      const div = document.createElement("div");
      div.textContent = msg;
      outputEl.appendChild(div);
      outputEl.scrollTop = outputEl.scrollHeight;
    };

    log(`> ${cmd}`);

    try {
      const [main, arg1, arg2] = cmd.toLowerCase().split(" ");

      switch (main) {
        case "help":
          log("Kommandoer:");
          log(" help, list places|people|routes, clear storage, reload");
          log(" debug on/off, log HG.data");
          break;

        case "list":
          if (arg1 === "places") logList(HG.data.places, "name");
          else if (arg1 === "people") logList(HG.data.people, "name");
          else if (arg1 === "routes") logList(HG.data.routes, "name");
          else log("Ukjent kategori.");
          break;

        case "clear":
          if (arg1 === "storage") {
            localStorage.clear();
            log("🧹 localStorage slettet");
          }
          break;

        case "reload":
          location.reload();
          break;

        case "debug":
          if (arg1 === "on") {
            localStorage.setItem("debug", "true");
            log("✅ Debug aktivert");
          } else if (arg1 === "off") {
            localStorage.removeItem("debug");
            log("❌ Debug deaktivert");
          }
          break;

        case "log":
          if (arg1 === "hg.data") {
            log(JSON.stringify(HG.data, null, 2));
          } else {
            log("Ukjent log-kommando.");
          }
          break;

        default:
          log(eval(cmd));
      }
    } catch (err) {
      const error = document.createElement("div");
      error.textContent = `⚠️ Feil: ${err.message}`;
      error.style.color = "#f66";
      outputEl.appendChild(error);
    }
  }

  // ----------------------------------------------------------
  // HJELPERE
  // ----------------------------------------------------------
  function logList(arr, key) {
    if (!arr?.length) return outputEl.innerHTML += "<div>(tom liste)</div>";
    arr.slice(0, 10).forEach(e => {
      const div = document.createElement("div");
      div.textContent = `- ${e[key] || "(ingen navn)"}`;
      outputEl.appendChild(div);
    });
  }

  // ----------------------------------------------------------
  // AKTIVERING MED ~
  // ----------------------------------------------------------
  document.addEventListener("keydown", e => {
    if (e.key === "~") toggleConsole();
  });
})();
