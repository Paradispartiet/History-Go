// js/console/verify.js
// ============================================================
// HISTORY GO – VERIFY PANEL (modulstatus)  → CHIP i dev-mode
//  - KUN aktiv når ?dev=1 / ?dev / localStorage.devMode="true"
//  - Default: minimert chip (🧩)
//  - Trykk chip for å åpne/lukke liste
// ============================================================

(function () {
  // Dev gate
  const isDev =
    window.location.search.includes("dev=1") ||
    window.location.search.includes("dev") ||
    localStorage.getItem("devMode") === "true";

  // Hard rule: ALDRI vis uten dev
  if (!isDev) {
    try { document.getElementById("verifyPanel")?.remove(); } catch {}
    try { document.getElementById("verifyChip")?.remove(); } catch {}
    return;
  }

  // Unngå dobbel init
  if (window.HG_VERIFY_PANEL) return;

  const modules = [
    { name: "dev",     check: () => true },
    { name: "API",     check: () => typeof window.API?.showToast === "function" },

    { name: "DataHub", check: () => !!(window.DataHub || window.dataHub) },
    { name: "HG",      check: () => !!window.HG },

    { name: "HGMap",   check: () => !!window.HGMap },
    { name: "MAP",     check: () => !!window.MAP },
    { name: "maplibre",check: () => typeof window.maplibregl !== "undefined" },

    { name: "QuizEngine", check: () => typeof window.QuizEngine?.start === "function" },

    { name: "DomainRegistry",     check: () => typeof window.DomainRegistry?.resolve === "function" },
    { name: "DomainHealthReport", check: () => typeof window.DomainHealthReport?.run === "function" }
  ];

  // Cleanup gammel boks hvis den finnes
  try { document.getElementById("verifyPanel")?.remove(); } catch {}
  try { document.getElementById("verifyChip")?.remove(); } catch {}

  // ---- UI: CHIP ----
  const chip = document.createElement("button");
  chip.id = "verifyChip";
  chip.type = "button";
  chip.textContent = "🧩";
  chip.setAttribute("aria-label", "Vis modulstatus");
  chip.style.cssText = `
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 999999;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    font-size: 18px;
    cursor: pointer;
    background: rgba(10,25,41,.92);
    border: 1px solid rgba(255,255,255,.12);
    color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    backdrop-filter: blur(6px);
  `;

  // ---- UI: PANEL (skjult som default) ----
  const panel = document.createElement("div");
  panel.id = "verifyPanel";
  panel.style.cssText = `
    position: fixed;
    right: 12px;
    bottom: 12px;
    z-index: 999999;
    background: rgba(10,25,41,.92);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    padding: 10px 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 13px;
    color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    backdrop-filter: blur(6px);
    max-width: 260px;
    display: none;
  `;

  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
      <div style="font-weight:700;">🧩 Modulstatus</div>
      <button id="verifyClose" type="button" style="
        background: rgba(255,255,255,.10);
        border: 1px solid rgba(255,255,255,.12);
        color: #fff;
        width: 28px;
        height: 28px;
        border-radius: 9px;
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
      " aria-label="Lukk">✕</button>
    </div>
    <div id="verifyList" style="margin-top:8px;display:flex;flex-direction:column;gap:6px;"></div>
  `;

  const list = panel.querySelector("#verifyList");
  const closeBtn = panel.querySelector("#verifyClose");

  function updateStatus() {
    if (!list) return;
    list.innerHTML = "";

    for (const m of modules) {
      let ok = false;
      try { ok = !!m.check(); } catch { ok = false; }

      const row = document.createElement("div");
      row.innerHTML = `${ok ? "🟢" : "🔴"} <span style="opacity:.92">${m.name}</span>`;
      list.appendChild(row);
    }
  }

  function openPanel() {
    updateStatus();
    panel.style.display = "block";
    chip.style.display = "none";
    localStorage.setItem("hg_verify_open", "1");
  }

  function closePanel() {
    panel.style.display = "none";
    chip.style.display = "block";
    localStorage.setItem("hg_verify_open", "0");
  }

  chip.onclick = (e) => { e.preventDefault(); e.stopPropagation(); openPanel(); };
  closeBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); closePanel(); };

  // Auto refresh mens åpen (slipper å spamme når den er chip)
  let timer = null;
  function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
      if (panel.style.display === "block") updateStatus();
    }, 3000);
  }

  document.body.appendChild(chip);
  document.body.appendChild(panel);
  startTimer();

  // Restore state: default = chip (lukket)
  const saved = localStorage.getItem("hg_verify_open") === "1";
  if (saved) openPanel(); else closePanel();

  window.HG_VERIFY_PANEL = { open: openPanel, close: closePanel, update: updateStatus };

  console.log("🔍 Verify-chip aktivert (kun dev) ✅");
})();
