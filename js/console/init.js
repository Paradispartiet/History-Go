// ============================================================
// === HISTORY GO – DEV CONSOLE LOADER ========================
// ============================================================
//
// Laster kun konsollverktøy (terminal, devConsole, verify)
// dersom URL inneholder ?dev eller localStorage.devMode === "true"
// ============================================================

(function() {
  const params = new URLSearchParams(location.search);
  const devMode = params.has("dev") || localStorage.getItem("devMode") === "true";

  if (!devMode) return; // ikke last for vanlige brukere

  console.log("🧩 DEV MODE aktivert – laster utviklerverktøy...");

  const scripts = [
    "js/console/verify.js",
    "js/console/devConsole.js",
    "js/console/terminal.js"
  ];

  scripts.forEach(src => {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  });

  // Vis tydelig dev-indikator på skjermen
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
})();
