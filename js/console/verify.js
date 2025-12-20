// ============================================================
// === HISTORY GO – VERIFY PANEL (modulstatus) ================
// ============================================================
//  DEV-ONLY: viser modulstatus som en CHIP (🧩)
//   - Default: kun chip synlig
//   - Klikk chip -> åpner panel
//   - Klikk ✕ -> lukker panel (tilbake til chip)
//  Viktig: bruker window.* for å unngå ReferenceError.
// ============================================================

(function () {
  // --- DEV gate (samme logikk som resten av dev-tools) ---
  const isDev =
    window.location.search.includes("dev=1") ||
    window.location.search.includes("dev") ||
    localStorage.getItem("devMode") === "true";

  // Hard rule: ikke-dev => fjern evt rester og stopp
  if (!isDev) {
    try { document.getElementById("verifyPanel")?.remove(); } catch {}
    try { document.getElementById("verifyChip")?.remove(); } catch {}
    return;
  }

  // Unngå dobbel init (hot reload / dobbel script-load)
  if (document.getElementById("verifyPanel") || document.getElementById("verifyChip")) {
    return;
  }

  const modules = [
    // Core/system
    { name: "dev",     check: () => true },
    { name: "API",     check: () => typeof window.API?.showToast === "function" },

    // Data / hub
    { name: "DataHub", check: () => !!(window.DataHub || window.dataHub) },
    { name: "HG",      check: () => !!window.HG },

    // Map (din app)
    { name: "HGMap",    check: () => !!window.HGMap },
    { name: "MAP",      check: () => !!window.MAP },
    { name: "maplibre", check: () => typeof window.maplibregl !== "undefined" },

    // Quiz
    { name: "QuizEngine", check: () => typeof window.QuizEngine?.start === "function" },

    // Domener
    { name: "DomainRegistry",     check: () => typeof window.DomainRegistry?.resolve === "function" },
    { name: "DomainHealthReport", check: () => typeof window.DomainHealthReport?.run === "function" }
  ];

  // --------------------------
  // CHIP (FAB)
  // --------------------------
  const chip = document.createElement("button");
  chip.id = "verifyChip";
  chip.type = "button";
  chip.textContent = "🧩";
  chip.title = "Modulstatus (dev)";
  chip.setAttribute("aria-label", "Åpne modulstatus");
  chip.style.cssText = `
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 999999;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    background: rgba(10,25,41,.92);
    border: 1px solid rgba(255,255,255,.12);
    color: #e6eef9;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    backdrop-filter: blur(6px);
  `;

  // --------------------------
  // PANEL
  // --------------------------
  const panel = document.createElement("div");
  panel.id = "verifyPanel";
  Object.assign(panel.style, {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    background: "rgba(10,25,41,.92)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: "12px",
    padding: "10px 12px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: "13px",
    color: "#fff",
    zIndex: 999999,
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    backdropFilter: "blur(6px)",
    maxWidth: "280px",
    display: "none" // ✅ default: skjult (kun chip vises)
  });

  const head = document.createElement("div");
  head.style.cssText = "display:flex;align-items:center;gap:10px;margin-bottom:6px;";

  const title = document.createElement("div");
  title.textContent = "🧩 Modulstatus:";
  title.style.cssText = "font-weight:700;flex:1;";

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "✕";
  close.setAttribute("aria-label", "Lukk modulstatus");
  close.style.cssText = `
    width: 28px;
    height: 28px;
    border-radius: 9px;
    cursor: pointer;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    color: #e6eef9;
    font-size: 14px;
    line-height: 1;
  `;

  head.appendChild(title);
  head.appendChild(close);
  panel.appendChild(head);

  const list = document.createElement("div");
  panel.appendChild(list);

  document.body.appendChild(chip);
  document.body.appendChild(panel);

  // --------------------------
  // Status update
  // --------------------------
  function updateStatus() {
    list.innerHTML = "";
    modules.forEach((m) => {
      let ok = false;
      try { ok = !!m.check(); } catch { ok = false; }

      const row = document.createElement("div");
      row.style.cssText = "margin-bottom:2px; display:flex; align-items:center; gap:8px;";
      row.innerHTML = `
        <span style="width:18px">${ok ? "🟢" : "🔴"}</span>
        <span style="opacity:.92">${m.name}</span>
      `;
      list.appendChild(row);
    });
  }

  // Kjør uansett (også hvis script lastes etter DOMContentLoaded)
  updateStatus();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateStatus);
  }

  // Oppdater jevnlig (spiller ingen rolle om panelet er åpent/lukket)
  setInterval(updateStatus, 3000);

  // --------------------------
  // Toggle UI
  // --------------------------
  function openPanel() {
    chip.style.display = "none";
    panel.style.display = "block";
    updateStatus();
  }

  function closePanel() {
    panel.style.display = "none";
    chip.style.display = "block";
  }

  chip.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPanel();
  };

  close.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePanel();
  };

  console.log("🔍 Verify-chip aktivert (js/console/verify.js) ✅");
})();
