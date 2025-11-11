// ============================================================
// === HISTORY GO – VERIFY PANEL (modulstatus) ================
// ============================================================
//
//  Viser et lite panel nederst som bekrefter at alle moduler
//  (core, app, map, routes, ui, quiz, profile) er lastet.
//
//  Farger:
//    🟢 = modul funnet
//    🔴 = mangler
// ============================================================

(function() {
  const modules = [
    { name: "core",     check: () => typeof boot === "function" },
    { name: "app",      check: () => typeof app?.initApp === "function" },
    { name: "map",      check: () => typeof map?.initMap === "function" },
    { name: "routes",   check: () => typeof Routes?.initRoutes === "function" },
    { name: "ui",       check: () => typeof ui?.initUI === "function" },
    { name: "quiz",     check: () => typeof quiz?.startQuiz === "function" },
    { name: "profile",  check: () => typeof Profile?.initProfilePage === "function" }
  ];

  // Opprett panelet
  const panel = document.createElement("div");
  panel.id = "verifyPanel";
  Object.assign(panel.style, {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    background: "rgba(10,25,41,.92)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "10px",
    padding: "8px 12px",
    fontFamily: "monospace",
    fontSize: "13px",
    color: "#fff",
    zIndex: 999999,
    boxShadow: "0 0 10px rgba(0,0,0,.5)",
    backdropFilter: "blur(6px)",
    maxWidth: "260px"
  });

  const title = document.createElement("div");
  title.textContent = "🧩 Modulstatus:";
  title.style.marginBottom = "4px";
  title.style.fontWeight = "600";
  panel.appendChild(title);

  const list = document.createElement("div");
  panel.appendChild(list);
  document.body.appendChild(panel);

  // Oppdater status
  function updateStatus() {
    list.innerHTML = "";
    modules.forEach(m => {
      const ok = !!m.check();
      const row = document.createElement("div");
      row.innerHTML = `${ok ? "🟢" : "🔴"} <span style="opacity:.9">${m.name}</span>`;
      row.style.marginBottom = "2px";
      list.appendChild(row);
    });
  }

  // Oppdater ved DOMReady og med jevne mellomrom
  document.addEventListener("DOMContentLoaded", updateStatus);
  setInterval(updateStatus, 3000);

  console.log("🔍 Verify-panel aktivert (js/console/verify.js)");
})();
