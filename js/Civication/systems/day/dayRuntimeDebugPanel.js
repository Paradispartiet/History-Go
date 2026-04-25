(function () {
  "use strict";

  const PANEL_ID = "civiRuntimeDebugPanel";
  const BODY_ID = "civiRuntimeDebugBody";
  const LS_OPEN_KEY = "hg_civi_debug_panel_open_v1";

  function normStr(v) {
    return String(v || "").trim();
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function isOpen() {
    return localStorage.getItem(LS_OPEN_KEY) === "1";
  }

  function setOpen(value) {
    localStorage.setItem(LS_OPEN_KEY, value ? "1" : "0");
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.classList.toggle("is-open", !!value);
    render();
  }

  function getActivePosition() {
    return window.CivicationState?.getActivePosition?.() || safeJson("hg_active_position_v1", null) || null;
  }

  function getCiviState() {
    return window.CivicationState?.getState?.() || safeJson("hg_civi_state_v1", {}) || {};
  }

  function getPendingEvent() {
    const engine = window.HG_CiviEngine;
    if (engine && typeof engine.getPendingEvent === "function") return engine.getPendingEvent() || null;
    const inbox = safeJson("hg_civi_inbox_v1", []);
    return Array.isArray(inbox) ? inbox.find((x) => x?.status === "pending") || inbox[0] || null : null;
  }

  function getPlanProgress(state) {
    if (window.CiviMailPlanBridge?.getPlanProgress) return window.CiviMailPlanBridge.getPlanProgress(state || {});
    return state?.mail_plan_progress || {};
  }

  function getPeopleRows() {
    const rows = window.CivicationNpcCharacterThreads?.getActiveCharacters?.() || [];
    return Array.isArray(rows) ? rows : [];
  }

  function getAllianceState() {
    return window.CivicationAllianceSystem?.getState?.() || safeJson("hg_civi_alliances_v1", { allies: [], enemies: [], tensions: [] });
  }

  function getFactionState() {
    return window.CivicationFactionConflictSystem?.getState?.() || safeJson("hg_civi_faction_conflicts_v1", { factions: {}, conflicts: [], dominant_conflict: null });
  }

  function compactRows(rows, limit) {
    return (Array.isArray(rows) ? rows : []).slice(0, limit || 8);
  }

  function renderKV(label, value) {
    return `<div class="civi-debug-kv"><span>${esc(label)}</span><strong>${esc(value || "—")}</strong></div>`;
  }

  function renderScoreBreakdown(eventObj) {
    const breakdown = eventObj?._score_breakdown || eventObj?.score_breakdown || null;
    if (!breakdown || typeof breakdown !== "object") return `<div class="civi-debug-muted">Ingen score breakdown på pending mail.</div>`;
    return `<div class="civi-debug-score">${Object.entries(breakdown)
      .map(([k, v]) => renderKV(k, v))
      .join("")}</div>`;
  }

  function renderPeople(rows) {
    if (!rows.length) return `<div class="civi-debug-muted">Ingen aktive character threads.</div>`;
    return `<table class="civi-debug-table"><thead><tr><th>Person</th><th>Trust</th><th>Møter</th><th>Status</th></tr></thead><tbody>${compactRows(rows, 10)
      .map((row) => `<tr><td>${esc(row.name || row.id)}</td><td>${esc(row.trust_score ?? 0)}</td><td>${esc(row.appearances ?? 0)}</td><td>${esc(row.status || "—")}</td></tr>`)
      .join("")}</tbody></table>`;
  }

  function renderAllianceList(title, rows) {
    const safeRows = compactRows(rows, 6);
    if (!safeRows.length) return `<div class="civi-debug-list"><strong>${esc(title)}</strong><span>—</span></div>`;
    return `<div class="civi-debug-list"><strong>${esc(title)}</strong>${safeRows
      .map((row) => `<span>${esc(row.name || row.id)} (${esc(row.trust_score ?? 0)})</span>`)
      .join("")}</div>`;
  }

  function renderFactionConflict(factionState) {
    const dominant = factionState?.dominant_conflict || null;
    const conflicts = compactRows(factionState?.conflicts || [], 5);
    return `
      ${renderKV("Dominant konflikt", dominant ? `${dominant.label} / press ${dominant.pressure}` : "—")}
      ${conflicts.length ? `<table class="civi-debug-table"><thead><tr><th>Konflikt</th><th>Press</th></tr></thead><tbody>${conflicts
        .map((c) => `<tr><td>${esc(c.label || c.id)}</td><td>${esc(c.pressure ?? 0)}</td></tr>`)
        .join("")}</tbody></table>` : `<div class="civi-debug-muted">Ingen fraksjonskonflikter ennå.</div>`}
    `;
  }

  function render() {
    const body = document.getElementById(BODY_ID);
    const panel = document.getElementById(PANEL_ID);
    if (!body || !panel) return;

    panel.classList.toggle("is-open", isOpen());

    const active = getActivePosition();
    const state = getCiviState();
    const progress = getPlanProgress(state);
    const pending = getPendingEvent();
    const eventObj = pending?.event || pending || null;
    const peopleRows = getPeopleRows();
    const alliances = getAllianceState();
    const factions = getFactionState();
    const activeFaction = state?.activeFaction || safeJson("hg_civi_active_faction_v1", {})?.active_faction?.id || "—";

    body.innerHTML = `
      <section>
        <h4>Runtime</h4>
        ${renderKV("Aktiv rolle", active ? `${active.title || active.role_key || "—"} / ${active.career_id || "—"}` : "—")}
        ${renderKV("Active faction", activeFaction)}
        ${renderKV("Plan", progress?.role_plan_id || "—")}
        ${renderKV("Step index", progress?.step_index ?? "—")}
        ${renderKV("Step type", progress?.current_step_type || "—")}
      </section>

      <section>
        <h4>Pending mail</h4>
        ${renderKV("ID", eventObj?.id || "—")}
        ${renderKV("Type", eventObj?.mail_type || "—")}
        ${renderKV("Family", eventObj?.mail_family || "—")}
        ${renderKV("Subject", eventObj?.subject || "—")}
        ${renderKV("People ref", eventObj?.people_ref || "—")}
        ${renderKV("Total score", eventObj?._score_total ?? eventObj?.score_total ?? "—")}
        ${renderScoreBreakdown(eventObj)}
      </section>

      <section>
        <h4>People / trust</h4>
        ${renderPeople(peopleRows)}
      </section>

      <section>
        <h4>Allianser</h4>
        ${renderAllianceList("Allies", alliances?.allies || [])}
        ${renderAllianceList("Enemies", alliances?.enemies || [])}
        ${renderAllianceList("Tensions", alliances?.tensions || [])}
      </section>

      <section>
        <h4>Fraksjoner</h4>
        ${renderFactionConflict(factions)}
      </section>
    `;
  }

  function injectStyles() {
    if (document.getElementById("civiRuntimeDebugStyles")) return;
    const style = document.createElement("style");
    style.id = "civiRuntimeDebugStyles";
    style.textContent = `
      #${PANEL_ID}{position:fixed;right:12px;bottom:76px;z-index:99999;width:min(420px,calc(100vw - 24px));font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f6f1e7;pointer-events:none}
      #${PANEL_ID} *{box-sizing:border-box}
      .civi-debug-toggle{pointer-events:auto;width:100%;border:1px solid rgba(255,255,255,.22);background:rgba(22,20,17,.92);color:#f6f1e7;border-radius:14px;padding:10px 12px;font-weight:800;text-align:left;box-shadow:0 8px 30px rgba(0,0,0,.28)}
      .civi-debug-card{display:none;pointer-events:auto;margin-top:8px;max-height:62vh;overflow:auto;background:rgba(18,16,14,.96);border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:12px;box-shadow:0 12px 38px rgba(0,0,0,.35)}
      #${PANEL_ID}.is-open .civi-debug-card{display:block}
      .civi-debug-card h3{margin:0 0 8px;font-size:15px}
      .civi-debug-card h4{margin:12px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#f0c56c}
      .civi-debug-kv{display:flex;gap:10px;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);padding:4px 0;font-size:12px}
      .civi-debug-kv span{color:rgba(246,241,231,.68)}
      .civi-debug-kv strong{font-weight:700;text-align:right;max-width:62%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .civi-debug-table{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}
      .civi-debug-table th,.civi-debug-table td{border-bottom:1px solid rgba(255,255,255,.08);padding:5px 4px;text-align:left;vertical-align:top}
      .civi-debug-table th{color:#f0c56c;font-weight:800}
      .civi-debug-list{display:grid;grid-template-columns:92px 1fr;gap:4px;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.08)}
      .civi-debug-list strong{color:#f0c56c}
      .civi-debug-list span{color:#f6f1e7}
      .civi-debug-muted{font-size:12px;color:rgba(246,241,231,.56);padding:4px 0}
      .civi-debug-actions{display:flex;gap:8px;margin-top:10px}
      .civi-debug-actions button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#f6f1e7;border-radius:10px;padding:7px 9px;font-size:12px;font-weight:700}
    `;
    document.head.appendChild(style);
  }

  function mount() {
    if (document.getElementById(PANEL_ID)) return;
    injectStyles();

    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <button class="civi-debug-toggle" type="button">⚙ Civication runtime debug</button>
      <div class="civi-debug-card">
        <h3>Runtime debug</h3>
        <div id="${BODY_ID}"></div>
        <div class="civi-debug-actions">
          <button type="button" data-civi-debug-refresh>Oppdater</button>
          <button type="button" data-civi-debug-log>Logg state</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector(".civi-debug-toggle")?.addEventListener("click", () => setOpen(!isOpen()));
    panel.querySelector("[data-civi-debug-refresh]")?.addEventListener("click", render);
    panel.querySelector("[data-civi-debug-log]")?.addEventListener("click", () => {
      console.log("Civication runtime debug", buildSnapshot());
    });

    render();
  }

  function buildSnapshot() {
    const state = getCiviState();
    const pending = getPendingEvent();
    return {
      activePosition: getActivePosition(),
      state,
      planProgress: getPlanProgress(state),
      pending,
      people: getPeopleRows(),
      alliances: getAllianceState(),
      factions: getFactionState()
    };
  }

  function scheduleRender() {
    window.clearTimeout(scheduleRender._t);
    scheduleRender._t = window.setTimeout(render, 60);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }

  window.addEventListener("updateProfile", scheduleRender);
  window.addEventListener("civi:npcReaction", scheduleRender);
  window.addEventListener("storage", scheduleRender);

  window.CivicationRuntimeDebugPanel = {
    render,
    buildSnapshot,
    open() { setOpen(true); },
    close() { setOpen(false); }
  };
})();
