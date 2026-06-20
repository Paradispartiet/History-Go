// js/Civication/ui/CivicationTestModeUI.js
// Civication testmodus: alltid synlig "Test"-knapp + testpanel for å starte ALLE roller,
// ikke bare Controller, uten konsoll.
//
// Prinsipp:
// - Knappen monteres alltid i Civication-headeren som et permanent utviklerverktøy.
// - Rollelisten bygges datadrevet fra data/Civication/roleModels/manifest.json.
// - Roller startes via eksisterende CivicationRoleStarter.
// - Arbeidsdagen bygges via eksisterende CivicationDailyMailBuilder.
// - Modulen eksponerer et samlet test-API på window.CivicationTestMode.
//
// UI eier aldri sannhet: knappene leser/skriver kun via RoleStarter, DailyMailBuilder
// og CivicationState. Statuspanelet viser kun det disse lagene rapporterer.

(function () {
  "use strict";

  const FLAG_KEY = "civication_test_mode_v1";
  const PANEL_ID = "civicationTestModePanel";
  const BUTTON_ID = "civicationTestButton";
  const SEARCH_ID = "civicationTestSearch";
  const FILTER_ID = "civicationTestFilter";
  const ROLES_ID = "civicationTestRoles";
  const STATUS_ID = "civicationTestStatus";
  const WEEK_NAME = "civicationTestWeek";
  const MANIFEST_PATH = "data/Civication/roleModels/manifest.json";

  // Startpunkt -> step_index i mail_plan_progress. DailyMailBuilder tolker
  // step_index >= 10 som uke 2 og holder uke 1 ren for tidlige steg.
  const STARTPOINTS = [
    { key: "begin", label: "Start fra begynnelsen", step_index: 0 },
    { key: "week1", label: "Uke 1", step_index: 0 },
    { key: "week2", label: "Uke 2", step_index: 10 }
  ];

  const state = {
    roles: [],
    rolesPromise: null,
    rolesError: "",
    selectedKey: "",
    startpoint: "week1",
    panelOpen: false,
    query: "",
    category: ""
  };

  function norm(value) { return String(value || "").trim(); }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function slugify(value) {
    return norm(value).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  }

  function hasDom() {
    return typeof document !== "undefined" && !!document && typeof document.createElement === "function";
  }

  function isEnabled() {
    return true;
  }

  async function loadJson(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      return res && res.ok ? res.json() : null;
    } catch (e) { return null; }
  }

  function fallbackRoleFromPath(path) {
    const parts = norm(path).split("/");
    const file = parts.pop() || "";
    return {
      category: parts.pop() || "",
      role_scope: file.replace(/\.json$/i, ""),
      title: file.replace(/\.json$/i, "").replace(/_/g, " ")
    };
  }

  function toRole(path, model) {
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
  }

  async function loadRoles() {
    state.rolesError = "";
    const manifest = await loadJson(MANIFEST_PATH);
    if (!manifest) {
      state.rolesError = "Kunne ikke laste roleModels/manifest.json";
      return [];
    }
    const paths = Array.isArray(manifest?.files) ? manifest.files : [];
    if (!paths.length) {
      state.rolesError = "Fant ingen roller";
      return [];
    }
    const models = await Promise.all(paths.map(async path => ({ path, model: await loadJson(path) })));
    return models
      .map(({ path, model }) => toRole(path, model))
      .filter(role => role.title && role.role_key)
      .sort((a, b) => (a.category + a.title).localeCompare(b.category + b.title, "no"));
  }

  // Bygger (og cacher) rollelisten. Brukes både av UI og test-API-et.
  function listRoles() {
    if (state.roles.length) return Promise.resolve(state.roles);
    if (!state.rolesPromise) {
      state.rolesPromise = loadRoles().then(roles => {
        state.roles = roles;
        if (!roles.length && !state.rolesError) state.rolesError = "Fant ingen roller";
        return roles;
      });
    }
    return state.rolesPromise;
  }

  function findRole(roleKey) {
    const key = slugify(roleKey);
    return state.roles.find(role => slugify(role.role_key) === key)
      || state.roles.find(role => slugify(role.role_scope) === key)
      || null;
  }

  function getSelectedRole() {
    return findRole(state.selectedKey);
  }

  // Registrerer en datadrevet rolle i RoleStarter dersom den ikke allerede er
  // hardkodet. Roller som finnes fra før (f.eks. Controller) beholder sin
  // ekte mailPlan og overskrives ikke.
  function registerRoleForStarter(role) {
    const starter = window.CivicationRoleStarter;
    if (!role || !starter?.ROLES || !starter?.ROLE_TO_PLAN) return;
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
    if (!starter.ROLE_TO_PLAN[role.role_key]) {
      starter.ROLE_TO_PLAN[role.role_key] = `${role.role_key}_${role.career_id}_test_v1`;
    }
  }

  function startpointByKey(key) {
    return STARTPOINTS.find(sp => sp.key === key) || STARTPOINTS.find(sp => sp.key === "week1");
  }

  // Setter et generelt startpunkt (step_index) før dagen bygges. Holdt generisk
  // slik at alle roller kan få tilsvarende uke-/pakke-startpunkter senere.
  function applyStartpoint(key) {
    const api = window.CivicationState;
    if (!api?.getState || !api?.setState) return null;
    const sp = startpointByKey(key);
    const current = /** @type {any} */ (api.getState() || {});
    const progress = current.mail_plan_progress && typeof current.mail_plan_progress === "object"
      ? current.mail_plan_progress
      : {};
    api.setState({
      mail_plan_progress: {
        ...progress,
        step_index: sp.step_index
      }
    });
    return sp;
  }

  // ---- Handlinger (delt mellom UI og test-API) ----

  function startRole(roleKey) {
    const role = findRole(roleKey);
    if (!role) {
      renderStatus("Ingen rolle valgt");
      return null;
    }
    registerRoleForStarter(role);
    const started = window.CivicationRoleStarter?.startRole?.(role.role_key, { clearInbox: true });
    state.selectedKey = role.role_key;
    renderRoles();
    renderStatus(started ? `Startet ${role.title}.` : `Kunne ikke starte ${role.title}.`);
    return started || null;
  }

  async function startDay(opts) {
    const startpointKey = norm(opts?.startpoint) || state.startpoint;
    applyStartpoint(startpointKey);
    const result = await window.CivicationDailyMailBuilder?.startToday?.({
      forceNew: true,
      ignorePending: true
    });
    try { window.dispatchEvent(new Event("updateInbox")); } catch (e) { /* ignore */ }
    const sp = startpointByKey(startpointKey);
    const info = window.CivicationDailyMailBuilder?.inspect?.() || {};
    const count = Number(info.item_count || 0);
    renderStatus(result?.ok ? `Dag startet: ${count} elementer (${sp.label}).` : `Dag feilet: ${result?.reason || "ukjent"}`);
    return result || null;
  }

  function resetDay() {
    if (window.CivicationDailyMailBuilder?.resetToday) window.CivicationDailyMailBuilder.resetToday();
    else window.CivicationState?.setState?.({ mail_day_runtime_v1: null, narrative_day_state_v1: null });
    window.CivicationState?.setInbox?.([]);
    try { window.dispatchEvent(new Event("updateInbox")); } catch (e) { /* ignore */ }
    renderStatus("Testdag nullstilt.");
    return true;
  }

  function inspect() {
    const dmb = window.CivicationDailyMailBuilder?.inspect?.() || null;
    const runtime = dmb?.runtime || null;
    const selected = getSelectedRole();
    return {
      enabled: isEnabled(),
      panelOpen: state.panelOpen,
      active: window.CivicationState?.getActivePosition?.() || null,
      selectedRole: selected,
      roleCount: state.roles.length,
      rolesError: state.rolesError || null,
      startpoint: state.startpoint,
      runtimeExists: !!runtime,
      itemCount: dmb ? Number(dmb.item_count || 0) : 0,
      byPhase: dmb?.by_phase || {},
      byStatus: dmb?.by_status || {},
      pending: dmb?.pending || null
    };
  }

  // ---- Rendering ----

  function countsLabel(map) {
    const entries = Object.entries(map || {});
    if (!entries.length) return "—";
    return entries.map(([key, value]) => `${esc(key)}: ${esc(value)}`).join(", ");
  }

  function renderStatus(message) {
    if (!hasDom()) return;
    const el = document.getElementById(STATUS_ID);
    if (!el) return;
    const info = inspect();
    const active = /** @type {any} */ (info.active || {});
    const statusMessage = message || (info.selectedRole ? `Valgt rolle: ${info.selectedRole.title}` : "Ingen rolle valgt");
    el.innerHTML = `
      <p class="civi-test-message">${esc(statusMessage)}</p>
      <div><span>aktiv rolle</span><strong>${esc(active.title || "—")}</strong></div>
      <div><span>career_id</span><strong>${esc(active.career_id || "—")}</strong></div>
      <div><span>role_key</span><strong>${esc(active.role_key || active.role_scope || "—")}</strong></div>
      <div><span>role_id</span><strong>${esc(active.role_id || "—")}</strong></div>
      <div><span>DailyMailBuilder runtime</span><strong>${info.runtimeExists ? "runtime finnes" : "ingen runtime"}</strong></div>
      <div><span>item_count</span><strong>${info.runtimeExists ? esc(info.itemCount) : "—"}</strong></div>
      <div><span>by_phase</span><strong>${esc(countsLabel(info.byPhase))}</strong></div>
      <div><span>by_status</span><strong>${esc(countsLabel(info.byStatus))}</strong></div>
      <div><span>pending subject</span><strong>${esc(info.pending?.subject || "—")}</strong></div>`;
  }

  function visibleRoles() {
    const query = slugify(state.query);
    const category = norm(state.category);
    return state.roles.filter(role => {
      if (category && norm(role.category) !== category) return false;
      if (!query) return true;
      const hay = slugify(`${role.title} ${role.category} ${role.role_key} ${role.role_scope} ${role.role_id}`);
      return hay.includes(query);
    });
  }

  function renderRoles() {
    if (!hasDom()) return;
    const list = document.getElementById(ROLES_ID);
    if (!list) return;
    const roles = visibleRoles();
    if (!state.roles.length && state.rolesError) {
      list.innerHTML = `<p class="civi-test-empty">${esc(state.rolesError)}</p>`;
      return;
    }
    if (!roles.length) {
      list.innerHTML = `<p class="civi-test-empty">${state.roles.length ? "Ingen roller matcher." : "Fant ingen roller"}</p>`;
      return;
    }
    list.innerHTML = roles.map(role => {
      const selected = slugify(role.role_key) === slugify(state.selectedKey);
      return `<button type="button" class="civi-test-role${selected ? " is-selected" : ""}" data-role-key="${esc(role.role_key)}">
        <span class="civi-test-role-title">${esc(role.title)}</span>
        <span class="civi-test-role-meta">${esc(role.category)} · ${esc(role.role_scope || role.role_key)}${role.role_id ? ` · ${esc(role.role_id)}` : ""}</span>
      </button>`;
    }).join("");
  }

  function renderCategories() {
    if (!hasDom()) return;
    const select = /** @type {any} */ (document.getElementById(FILTER_ID));
    if (!select) return;
    const categories = [...new Set(state.roles.map(role => norm(role.category)).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "no"));
    select.innerHTML = `<option value="">Alle kategorier (${state.roles.length})</option>`
      + categories.map(cat => `<option value="${esc(cat)}">${esc(cat)}</option>`).join("");
    select.value = state.category;
  }

  function buildPanelHtml() {
    const weeks = STARTPOINTS.map(sp =>
      `<label class="civi-test-week"><input type="radio" name="${WEEK_NAME}" value="${esc(sp.key)}"${sp.key === state.startpoint ? " checked" : ""}> ${esc(sp.label)}</label>`
    ).join("");
    return `
      <div class="civi-test-head">
        <h2>Civication testmodus</h2>
        <button type="button" id="civicationTestClose" class="civi-test-close" aria-label="Lukk">×</button>
      </div>
      <div class="civi-test-controls">
        <input type="search" id="${SEARCH_ID}" class="civi-test-search" placeholder="Søk rolle …" autocomplete="off">
        <select id="${FILTER_ID}" class="civi-test-filter"><option value="">Alle kategorier</option></select>
      </div>
      <div id="${ROLES_ID}" class="civi-test-roles"><p class="civi-test-empty">Laster roller …</p></div>
      <div class="civi-test-startpoint">
        <div class="civi-test-startpoint-label">Progresjonsuke / startpunkt</div>
        <div class="civi-test-weeks">${weeks}</div>
      </div>
      <div class="civi-test-actions">
        <button type="button" id="civiTestStartRole">Start rolle</button>
        <button type="button" id="civiTestStartDay">Start Dag</button>
        <button type="button" id="civiTestResetDay">Nullstill testdag</button>
      </div>
      <div id="${STATUS_ID}" class="civi-test-status"></div>`;
  }

  function ensurePanel() {
    if (!hasDom()) return null;
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;

    panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "civi-test-mode civi-test-floating is-hidden";
    panel.innerHTML = buildPanelHtml();

    const host = document.querySelector(".civi-panels") || document.body;
    if (host && host.firstChild) host.insertBefore(panel, host.firstChild);
    else if (host) host.appendChild(panel);

    document.getElementById("civicationTestClose")?.addEventListener("click", closePanel);
    document.getElementById("civiTestStartRole")?.addEventListener("click", () => startRole(state.selectedKey));
    document.getElementById("civiTestStartDay")?.addEventListener("click", () => { startDay(); });
    document.getElementById("civiTestResetDay")?.addEventListener("click", resetDay);

    const search = /** @type {any} */ (document.getElementById(SEARCH_ID));
    search?.addEventListener("input", () => { state.query = search.value || ""; renderRoles(); });

    const filter = /** @type {any} */ (document.getElementById(FILTER_ID));
    filter?.addEventListener("change", () => { state.category = filter.value || ""; renderRoles(); });

    const roles = document.getElementById(ROLES_ID);
    roles?.addEventListener("click", event => {
      const button = /** @type {any} */ (event.target)?.closest?.(".civi-test-role");
      const key = button?.dataset?.roleKey;
      if (!key) return;
      state.selectedKey = key;
      renderRoles();
      renderStatus(`Valgt rolle: ${esc(findRole(key)?.title || key)}`);
    });

    panel.querySelectorAll?.(`input[name="${WEEK_NAME}"]`).forEach((/** @type {any} */ input) => {
      input.addEventListener("change", () => { if (input.checked) state.startpoint = input.value; });
    });

    listRoles().then(() => {
      renderCategories();
      renderRoles();
      renderStatus(`${state.roles.length} roller lastet fra roleModels-manifest.`);
    });
    renderStatus();
    return panel;
  }

  function openPanel() {
    const panel = ensurePanel();
    if (!panel) return;
    panel.classList?.remove("is-hidden");
    state.panelOpen = true;
    const button = document.getElementById(BUTTON_ID);
    button?.classList?.add("is-active");
    renderStatus();
  }

  function closePanel() {
    const panel = hasDom() ? document.getElementById(PANEL_ID) : null;
    panel?.classList?.add("is-hidden");
    state.panelOpen = false;
    const button = hasDom() ? document.getElementById(BUTTON_ID) : null;
    button?.classList?.remove("is-active");
  }

  function togglePanel() {
    if (state.panelOpen) closePanel();
    else openPanel();
  }

  function ensureButton() {
    if (!hasDom()) return null;
    let button = /** @type {any} */ (document.getElementById(BUTTON_ID));
    if (button) return button;

    button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.className = "civi-test-button";
    button.textContent = "Test";
    button.title = "Civication testmodus";
    button.addEventListener("click", togglePanel);

    const host = document.querySelector(".topbar-right") || document.querySelector(".topbar") || document.body;
    if (host) host.insertBefore(button, host.firstChild || null);
    return button;
  }

  function mount() {
    if (!hasDom()) return;
    ensureButton();
  }

  function unmount() {
    if (!hasDom()) return;
    document.getElementById(PANEL_ID)?.remove?.();
    document.getElementById(BUTTON_ID)?.remove?.();
    state.panelOpen = false;
  }

  function enable() {
    try { localStorage.setItem(FLAG_KEY, "true"); } catch (e) { /* ignore */ }
    mount();
    return true;
  }

  function disable() {
    try { localStorage.setItem(FLAG_KEY, "false"); } catch (e) { /* ignore */ }
    closePanel();
    return true;
  }

  window.CivicationTestMode = {
    enable,
    disable,
    isEnabled,
    listRoles,
    startRole,
    startDay,
    resetDay,
    inspect,
    openPanel,
    closePanel,
    togglePanel,
    open: openPanel,
    close: closePanel,
    toggle: togglePanel
  };

  if (hasDom()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
    window.addEventListener?.("updateProfile", () => renderStatus());
    window.addEventListener?.("updateInbox", () => renderStatus());
  }
})();
