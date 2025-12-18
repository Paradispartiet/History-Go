// ============================================================
// HISTORY GO – DEV CONSOLE LOADER (v2, iPad-proof)
//  - DEV MODE hvis ?dev eller localStorage.devMode === "true"
//  - Laster verify + diagnosticConsole
//  - Viser loader-status på skjermen (Loaded/Failed)
//  - Viser alltid 🩺-knapp i DEV MODE (fallback)
// ============================================================

(function () {
  const params = new URLSearchParams(location.search);
  const devMode = params.has("dev") || localStorage.getItem("devMode") === "true";
  if (!devMode) return;

  // ---- DEV badge (du hadde denne)
  const badge = document.createElement("div");
  badge.textContent = "DEV MODE";
  Object.assign(badge.style, {
    position: "fixed",
    top: "8px",
    right: "8px",
    background: "#FFD600",
    color: "#000",
    fontWeight: "700",
    fontSize: "11px",
    padding: "4px 7px",
    borderRadius: "6px",
    zIndex: 999999,
    boxShadow: "0 0 6px rgba(0,0,0,.4)",
    fontFamily: "system-ui, sans-serif"
  });
  document.body.appendChild(badge);

  // ---- Loader status box (NYTT: synlig bevis på hva som lastes)
  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "fixed",
    right: "8px",
    top: "36px",
    width: "240px",
    padding: "8px",
    borderRadius: "10px",
    background: "rgba(0,0,0,.75)",
    color: "#fff",
    fontSize: "12px",
    fontFamily: "system-ui, sans-serif",
    zIndex: 999999,
    boxShadow: "0 8px 24px rgba(0,0,0,.35)"
  });
  box.innerHTML = `<div style="font-weight:700;margin-bottom:6px;">DEV loader</div>`;
  document.body.appendChild(box);

  function line(text, ok) {
    const d = document.createElement("div");
    d.textContent = (ok ? "✅ " : "❌ ") + text;
    d.style.opacity = "0.95";
    d.style.margin = "3px 0";
    box.appendChild(d);
  }

  // ---- Scripts som SKAL lastes i dev mode
  const scripts = [
    "js/console/verify.js",
    "js/console/diagnosticConsole.js"
  ];

  // Viktig: dynamisk scripts + riktig rekkefølge
  // (defer hjelper ikke alltid på dynamisk injeksjon; bruk async=false)
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(src);
      document.head.appendChild(s);
    });
  }

  // ---- 🩺 fallback-knapp (vises alltid i dev mode)
  const btn = document.createElement("button");
  btn.textContent = "🩺";
  btn.title = "Åpne diagnosekonsoll";
  btn.className = "hg-console-btn"; // bruker din console.css hvis den finnes
  Object.assign(btn.style, {
    position: "fixed",
    right: "12px",
    bottom: "12px",
    zIndex: 1000000
  });
  btn.onclick = () => {
    if (window.HGConsole && typeof window.HGConsole.toggle === "function") {
      window.HGConsole.toggle();
    } else if (window.HGConsole && typeof window.HGConsole.show === "function") {
      window.HGConsole.show();
    } else {
      alert("HGConsole ikke tilgjengelig ennå. (diagnosticConsole.js lastet ikke / feilet)");
    }
  };
  document.body.appendChild(btn);

  // ---- Last alt og rapporter på skjerm
  (async () => {
    line("devMode active (" + location.search + ")", true);

    for (const src of scripts) {
      try {
        await loadScript(src);
        line(src, true);
      } catch (bad) {
        line(bad, false);
      }
    }

    // Bekreft at konsollen faktisk registrerte seg
    setTimeout(() => {
      if (window.HGConsole) line("HGConsole ready", true);
      else line("HGConsole MISSING", false);
    }, 300);
  })();
})();
