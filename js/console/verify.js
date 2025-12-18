// ============================================================
// === HISTORY GO – VERIFY PANEL (modulstatus) ================
// ============================================================
//  Viser et lite panel nederst som bekrefter at moduler finnes.
//  Viktig: bruk window.* for å unngå ReferenceError.
// ============================================================

(function () {
    const modules = [
    // Core/system
    { name: "dev",     check: () => true },
    { name: "API",     check: () => typeof window.API?.showToast === "function" },

    // Data / hub
    { name: "DataHub", check: () => !!(window.DataHub || window.dataHub) },
    { name: "HG",      check: () => !!window.HG },

    // Map (din app)
    { name: "HGMap",   check: () => !!window.HGMap },
    { name: "MAP",     check: () => !!window.MAP },
    { name: "maplibre",check: () => typeof window.maplibregl !== "undefined" },

    // Quiz
    { name: "QuizEngine", check: () => typeof window.QuizEngine?.start === "function" },

    // Domener (nytt)
    { name: "DomainRegistry",     check: () => typeof window.DomainRegistry?.resolve === "function" },
    { name: "DomainHealthReport", check: () => typeof window.DomainHealthReport?.run === "function" }
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
