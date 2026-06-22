(function () {
  "use strict";

  const PANEL_ID = "hgRuntimeHealthPanel";
  const STYLE_ID = "hgRuntimeHealthPanelStyle";
  const REFRESH_DELAY_MS = 180;
  const EVENTS = ["updateProfile", "civi:homeChanged", "civi:inboxChanged", "hg:socialChanged"];
  let refreshTimer = null;
  let listenersAttached = false;
  let lastHealth = null;
  let lastSmoke = null;

  function safeTestModeGlobal() {
    const candidates = [
      window.HG_TEST_MODE,
      window.TEST_MODE,
      window.HGTestMode?.enabled,
      window.HG_TestMode?.enabled,
      window.HGTestMode?.isEnabled?.(),
      window.HG_TestMode?.isEnabled?.()
    ];
    return candidates.some((value) => value === true || value === "1");
  }

  function isEnabled() {
    try {
      return window.localStorage?.getItem?.("HG_TEST_MODE") === "1" || safeTestModeGlobal();
    } catch (_error) {
      return safeTestModeGlobal();
    }
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${PANEL_ID}{position:fixed;right:12px;bottom:12px;z-index:2147483647;max-width:320px;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:rgba(17,24,39,.94);color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.32);padding:12px;box-sizing:border-box}
      #${PANEL_ID} h2{font-size:14px;margin:0 0 6px;font-weight:700}
      #${PANEL_ID} .hg-rhp-meta{display:grid;grid-template-columns:auto 1fr;gap:3px 8px;margin:6px 0}
      #${PANEL_ID} .hg-rhp-status{font-weight:700}
      #${PANEL_ID} ul{margin:6px 0 8px;padding-left:18px}
      #${PANEL_ID} button{margin-right:6px;border:0;border-radius:8px;padding:5px 8px;background:#e5e7eb;color:#111827;font:inherit}
      #${PANEL_ID} button:hover{background:#fff}
      #${PANEL_ID} .hg-rhp-smoke{margin:6px 0;font-weight:700}
    `;
    document.head?.appendChild(style);
  }

  function getPanel() {
    return document.getElementById(PANEL_ID);
  }

  function ensurePanel() {
    ensureStyle();
    let panel = getPanel();
    if (panel) return panel;
    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-live", "polite");
    const smokeButton = isEnabled() && window.HG_RuntimeSmokeRunner?.isEnabled?.() && window.HG_RuntimeSmokeRunner?.run
      ? '<button type="button" data-hg-rhp-smoke>Smoke</button>'
      : '';
    panel.innerHTML = `<h2>Runtime health</h2><div class="hg-rhp-body">Laster …</div><div>${smokeButton}<button type="button" data-hg-rhp-refresh>Oppdater</button><button type="button" data-hg-rhp-hide>Skjul</button></div>`;
    panel.querySelector("[data-hg-rhp-refresh]")?.addEventListener("click", () => { refresh(); });
    panel.querySelector("[data-hg-rhp-hide]")?.addEventListener("click", () => { remove(); });
    panel.querySelector("[data-hg-rhp-smoke]")?.addEventListener("click", () => { runSmoke(); });
    document.body?.appendChild(panel);
    return panel;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function itemText(item) {
    return String(item?.message || item?.summary || item?.key || item || "Ukjent");
  }

  function hasPrivacyBlocker(blockers) {
    return (blockers || []).some((item) => /privacy|personvern/i.test(`${item?.key || ""} ${item?.message || ""} ${item?.summary || ""}`));
  }

  function statusLabel(health) {
    if (hasPrivacyBlocker(health?.blockers)) return "Personvernblokkere";
    const score = Number(health?.score || 0);
    if (score >= 85) return "OK";
    if (score >= 60) return "Advarsler";
    return "Blokkere";
  }

  function smokeLabel(smoke) {
    if (!smoke) return null;
    if (smoke.skipped) return "Smoke: Skippet";
    if (Array.isArray(smoke.blockers) && smoke.blockers.length) return "Smoke: Blokkere";
    if (Array.isArray(smoke.warnings) && smoke.warnings.length) return "Smoke: Advarsler";
    return "Smoke: OK";
  }

  function paint(health) {
    const panel = ensurePanel();
    const body = panel.querySelector(".hg-rhp-body");
    if (!body) return;
    const blockers = Array.isArray(health?.blockers) ? health.blockers : [];
    const warnings = Array.isArray(health?.warnings) ? health.warnings : [];
    const issues = blockers.concat(warnings).slice(0, 5);
    const updated = new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const smoke = smokeLabel(lastSmoke);
    body.innerHTML = `
      <div class="hg-rhp-status">${escapeHtml(statusLabel(health))}</div>
      ${smoke ? `<div class="hg-rhp-smoke">${escapeHtml(smoke)}</div>` : ""}
      <div class="hg-rhp-meta"><span>Score</span><strong>${Number(health?.score ?? 0)}</strong><span>Summary</span><span>${escapeHtml(String(health?.summary || "Ingen summary"))}</span><span>Blokkere</span><span>${blockers.length}</span><span>Advarsler</span><span>${warnings.length}</span><span>Sist oppdatert</span><span>${updated}</span></div>
      <ul>${issues.map((item) => `<li>${escapeHtml(itemText(item))}</li>`).join("") || "<li>Ingen blokkere/advarsler</li>"}</ul>
    `;
  }

  async function runSmoke() {
    if (!isEnabled() || !window.HG_RuntimeSmokeRunner?.run) return null;
    try {
      lastSmoke = await window.HG_RuntimeSmokeRunner.run();
    } catch (error) {
      lastSmoke = { ok: false, blockers: [{ message: `Smoke feilet: ${error?.message || error}` }], warnings: [], summary: "Smoke-test fant blokkere." };
    }
    if (lastHealth) paint(lastHealth);
    return lastSmoke;
  }

  function paintMissing() {
    const panel = ensurePanel();
    const body = panel.querySelector(".hg-rhp-body");
    if (body) body.textContent = "HG_RuntimeHealth mangler";
  }

  async function refresh() {
    if (!isEnabled()) return;
    if (!window.HG_RuntimeHealth?.health) {
      paintMissing();
      return;
    }
    try {
      lastHealth = await window.HG_RuntimeHealth.health();
      paint(lastHealth);
    } catch (error) {
      paint({ score: 0, summary: `Runtime health feilet: ${error?.message || error}`, blockers: [{ message: "Kunne ikke lese runtime health" }], warnings: [] });
    }
  }

  function scheduleRefresh() {
    if (!isEnabled()) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => { refresh(); }, REFRESH_DELAY_MS);
  }

  function attachListeners() {
    if (listenersAttached || !isEnabled()) return;
    listenersAttached = true;
    EVENTS.forEach((eventName) => window.addEventListener?.(eventName, scheduleRefresh));
  }

  function render() {
    if (!isEnabled()) return;
    ensurePanel();
    attachListeners();
    return refresh();
  }

  function remove() {
    clearTimeout(refreshTimer);
    getPanel()?.remove?.();
    document.getElementById(STYLE_ID)?.remove?.();
  }

  window.HG_RuntimeHealthPanel = { render, refresh, remove, isEnabled, runSmoke };

  if (isEnabled()) {
    if (document.readyState === "loading") {
      document.addEventListener?.("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }
}());
