// js/Civication/systems/civicationRoleSession.js
// Felles Civication rolle-session: eksplisitt start, full aktiv rolle-reset og
// resetmarkør som hindrer at gammel backup gjenopprettes etter nullstilling.

(function () {
  "use strict";

  var LS_ACTIVE_POS = "hg_active_position_v1";
  var LS_LAST_ACTIVE_POS = "hg_civi_last_active_position_v1";
  var LS_FORCED_ROLE = "hg_civi_forced_role_key_v1";
  var LS_INBOX = "hg_civi_inbox_v1";
  var LS_PULSE = "hg_civi_pulse_v1";
  var LS_ROLE_SESSION = "role_session_v1";
  var LS_RESET_MARKER = "hg_civi_role_session_reset_v1";
  var REMOVE_KEYS = [
    LS_ACTIVE_POS,
    LS_LAST_ACTIVE_POS,
    LS_FORCED_ROLE,
    LS_INBOX,
    LS_PULSE,
    "active_role_key",
    "mail_runtime_v1",
    "mail_day_runtime_v1",
    "workday_runtime_v1",
    LS_ROLE_SESSION
  ];

  function nowIso() { return new Date().toISOString(); }

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function norm(value) { return String(value || "").trim(); }

  function validActive(pos) {
    return !!(pos && typeof pos === "object" && norm(pos.role_key || pos.title || pos.role_id));
  }

  function getResetMarker() {
    var marker = safeParse(localStorage.getItem(LS_RESET_MARKER), null);
    return marker && typeof marker === "object" ? marker : null;
  }

  function getResetAt() {
    return norm(getResetMarker() && getResetMarker().reset_at);
  }

  function isOlderThanReset(iso) {
    var resetAt = getResetAt();
    var stamp = norm(iso);
    if (!resetAt || !stamp) return false;
    return Date.parse(stamp) <= Date.parse(resetAt);
  }

  function clearStateRoleFields(reason) {
    var api = window.CivicationState;
    if (!api || typeof api.getState !== "function" || typeof api.setState !== "function") return null;
    var state = api.getState() || {};
    var mailSystem = state.mail_system && typeof state.mail_system === "object" ? Object.assign({}, state.mail_system) : {};
    var mailProgress = state.mail_plan_progress && typeof state.mail_plan_progress === "object" ? Object.assign({}, state.mail_plan_progress) : {};
    mailSystem.role_plan_id = null;
    mailProgress.role_plan_id = null;
    return api.setState({
      active_role_key: null,
      mail_runtime_v1: null,
      mail_day_runtime_v1: null,
      workday_runtime_v1: null,
      role_session_v1: null,
      mail_system: mailSystem,
      mail_plan_progress: mailProgress,
      last_role_session_reset_reason: reason || "reset"
    });
  }

  function clearActiveRoleSession(options) {
    var reason = norm(options && options.reason) || "reset";
    var reset = { reset_at: nowIso(), reason: reason };
    REMOVE_KEYS.forEach(function (key) { try { localStorage.removeItem(key); } catch (e) {} });
    localStorage.setItem(LS_RESET_MARKER, JSON.stringify(reset));

    var api = window.CivicationState;
    if (api && typeof api.setInbox === "function") api.setInbox([]);
    clearStateRoleFields(reason);

    try { window.dispatchEvent(new CustomEvent("civi:activeRoleSessionCleared", { detail: reset })); } catch (e) {}
    try { window.dispatchEvent(new Event("updateInbox")); } catch (e) {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch (e) {}
    return reset;
  }

  function markRoleStarted(options) {
    var started = Object.assign({
      started_at: nowIso(),
      started_by: norm(options && options.started_by) || "unknown",
      is_test_session: !!(options && options.is_test_session)
    }, options || {});
    localStorage.setItem(LS_ROLE_SESSION, JSON.stringify(started));
    return started;
  }

  function hasExplicitActiveRole() {
    var api = window.CivicationState;
    if (validActive(api && typeof api.getActivePosition === "function" ? api.getActivePosition() : null)) return true;
    var state = api && typeof api.getState === "function" ? api.getState() : {};
    return !!norm(state && state.active_role_key);
  }

  window.CivicationRoleSession = {
    clearActiveRoleSession: clearActiveRoleSession,
    markRoleStarted: markRoleStarted,
    hasExplicitActiveRole: hasExplicitActiveRole,
    getResetMarker: getResetMarker,
    getResetAt: getResetAt,
    isOlderThanReset: isOlderThanReset,
    validActive: validActive
  };
})();
