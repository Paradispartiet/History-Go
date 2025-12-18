// ============================================================
// === HISTORY GO – VERIFY PANEL (modulstatus) ================
// ============================================================
//  Viser et lite panel nederst som bekrefter at moduler finnes.
//  Viktig: bruk window.* for å unngå ReferenceError.
// ============================================================

(function () {
  const modules = [
    { name: "core",    check: () => typeof window.boot === "function" },

    // Hvis du ikke har window.app (du har sannsynligvis ikke), så blir dette rød – men det krasjer ikke.
    { name: "app",     check: () => typeof window.app?.initApp === "function" },

    // Du har map.js som IIFE – ofte eksponerer den ikke window.map.
    // Hvis du faktisk eksponerer map på window, blir den grønn.
    { name: "map",     check: () => typeof window.map?.initMap === "function" },

    // Tilpass disse til dine faktiske globals:
    { name: "routes",  check: () => typeof window.Routes?.initRoutes === "function" },
    { name: "quiz",    check: () => typeof window.QuizEngine?.start === "function" || typeof window.quiz?.startQuiz === "function" },
    { name: "profile", check: () => typeof window.Profile?.initProfilePage === "function" },
    { name: "ui",      check: () => typeof window.ui?.initUI === "function" }
  ];

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

  function updateStatus() {
    list.innerHTML = "";
    modules.forEach((m) => {
      let ok = false;
      try { ok = !!m.check(); } catch { ok = false; }

      const row = document.createElement("div");
      row.innerHTML = `${ok ? "🟢" : "🔴"} <span style="opacity:.9">${m.name}</span>`;
      row.style.marginBottom = "2px";
      list.appendChild(row);
    });
  }

  document.addEventListener("DOMContentLoaded", updateStatus);
  setInterval(updateStatus, 3000);

  console.log("🔍 Verify-panel aktivert (js/console/verify.js)");
})();
