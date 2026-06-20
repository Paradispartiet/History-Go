(function () {
  "use strict";

  const FLAG_KEY = "civication_test_mode_v1";
  const PANEL_ID = "civicationTestModePanel";
  const SELECT_ID = "civicationTestRoleSelect";
  const STATUS_ID = "civicationTestStatus";
  const MANIFEST_PATH = "data/Civication/roleModels/manifest.json";

  function norm(value) { return String(value || "").trim(); }
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function slugify(value) {
    return norm(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  }
  function isEnabled() {
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("civiTest") === "1") return true;
    return localStorage.getItem(FLAG_KEY) === "true";
  }
  async function loadJson(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      return res.ok ? res.json() : null;
    } catch (e) { return null; }
  }
  function fallbackRoleFromPath(path) {
    const parts = norm(path).split("/");
    const file = parts.pop() || "";
    return { category: parts.pop() || "", role_scope: file.replace(/\.json$/i, ""), title: file.replace(/\.json$/i, "").replace(/_/g, " ") };
  }
  async function loadRoles() {
    const manifest = await loadJson(MANIFEST_PATH);
    const paths = Array.isArray(manifest?.files) ? manifest.files : [];
    const models = await Promise.all(paths.map(async path => ({ path, model: await loadJson(path) })));
    return models.map(({ path, model }) => {
      const fallback = fallbackRoleFromPath(path);
      const category = norm(model?.category || fallback.category);
      const roleScope = norm(model?.role_scope || fallback.role_scope);
      const roleKey = roleScope || slugify(model?.title || fallback.title);
      return {
        title: norm(model?.title || fallback.title),
        category,
        career_id: category,
        career_name: norm(model?.source?.badge_name || category),
        role_scope: roleScope,
        role_key: roleKey,
        role_id: norm(model?.role_id),
        path
      };
    }).filter(role => role.title && role.role_key).sort((a, b) => (a.category + a.title).localeCompare(b.category + b.title, "no"));
  }
  function registerRoleForStarter(role) {
    const starter = window.CivicationRoleStarter;
    if (!starter?.ROLES || !starter?.ROLE_TO_PLAN) return;
    if (!starter.ROLES[role.role_key]) {
      starter.ROLES[role.role_key] = {
        career_id: role.career_id,
        career_name: role.career_name || role.career_id,
        title: role.title,
        role_key: role.role_key,
        role_scope: role.role_scope || role.role_key,
        role_id: role.role_id || `${role.career_id}_${role.role_key}`
      };
    }
    if (!starter.ROLE_TO_PLAN[role.role_key]) starter.ROLE_TO_PLAN[role.role_key] = `${role.role_key}_${role.career_id}_test_v1`;
  }
  function getSelectedRole() {
    const select = document.getElementById(SELECT_ID);
    const index = Number(select?.value || -1);
    return window.__civicationTestRoles?.[index] || null;
  }
  function renderStatus(message) {
    const el = document.getElementById(STATUS_ID);
    if (!el) return;
    const active = window.CivicationState?.getActivePosition?.() || null;
    const inspect = window.CivicationDailyMailBuilder?.inspect?.() || null;
    const runtime = inspect?.runtime || null;
    el.innerHTML = `
      ${message ? `<p class="civi-test-message">${esc(message)}</p>` : ""}
      <div><span>aktiv rolle</span><strong>${esc(active?.title || "—")}</strong></div>
      <div><span>career_id</span><strong>${esc(active?.career_id || "—")}</strong></div>
      <div><span>role_key</span><strong>${esc(active?.role_key || active?.role_scope || "—")}</strong></div>
      <div><span>role_id</span><strong>${esc(active?.role_id || "—")}</strong></div>
      <div><span>DailyMailBuilder runtime-status</span><strong>${runtime ? "runtime finnes" : "ingen runtime"}</strong></div>
      <div><span>item_count</span><strong>${runtime ? esc(inspect?.item_count ?? 0) : "—"}</strong></div>`;
  }
  async function startSelectedRole() {
    const role = getSelectedRole();
    if (!role) return renderStatus("Velg en rolle først.");
    registerRoleForStarter(role);
    const started = window.CivicationRoleStarter?.startRole?.(role.role_key, { clearInbox: true });
    renderStatus(started ? `Startet ${role.title}.` : `Kunne ikke starte ${role.title}.`);
  }
  async function startDayOne() {
    const result = await window.CivicationDailyMailBuilder?.startToday?.({ forceNew: true, ignorePending: true });
    window.dispatchEvent(new Event("updateInbox"));
    renderStatus(result?.ok ? "Dag 1 startet." : `Dag 1 feilet: ${result?.reason || "ukjent"}`);
  }
  function resetDay() {
    window.CivicationDailyMailBuilder?.resetToday?.();
    window.CivicationState?.setInbox?.([]);
    window.dispatchEvent(new Event("updateInbox"));
    renderStatus("Testdag nullstilt.");
  }
  function mount() {
    if (!isEnabled() || document.getElementById(PANEL_ID)) return;
    const host = document.querySelector(".civi-panels") || document.body;
    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "civi-test-mode";
    panel.innerHTML = `<h2>Civication testmodus</h2><label for="${SELECT_ID}">Rolle</label><select id="${SELECT_ID}"><option>Laster roller …</option></select><div class="civi-test-actions"><button id="civiTestStartRole">Start valgt rolle</button><button id="civiTestStartDay">Start Dag 1</button><button id="civiTestResetDay">Nullstill testdag</button></div><div id="${STATUS_ID}" class="civi-test-status"></div>`;
    host.insertBefore(panel, host.firstChild);
    document.getElementById("civiTestStartRole")?.addEventListener("click", startSelectedRole);
    document.getElementById("civiTestStartDay")?.addEventListener("click", startDayOne);
    document.getElementById("civiTestResetDay")?.addEventListener("click", resetDay);
    loadRoles().then(roles => {
      window.__civicationTestRoles = roles;
      const select = document.getElementById(SELECT_ID);
      select.innerHTML = roles.map((role, index) => `<option value="${index}">${esc(role.title)} — ${esc(role.category)} — ${esc(role.role_scope || role.role_key)}${role.role_id ? ` — ${esc(role.role_id)}` : ""}</option>`).join("");
      renderStatus(`${roles.length} roller lastet fra roleModels-manifest.`);
    });
    renderStatus();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true }); else mount();
  window.addEventListener("updateProfile", () => renderStatus());
  window.addEventListener("updateInbox", () => renderStatus());
})();
