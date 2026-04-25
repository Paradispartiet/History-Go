(function () {
  "use strict";

  var ROLES = {
    arbeider: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Arbeider",
      role_key: "arbeider",
      role_id: "naer_arbeider"
    },
    fagarbeider: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Fagarbeider",
      role_key: "fagarbeider",
      role_id: "naer_fagarbeider"
    },
    mellomleder: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Mellomleder",
      role_key: "mellomleder",
      role_id: "naer_mellomleder"
    },
    formann: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Formann",
      role_key: "formann",
      role_id: "naer_formann"
    }
  };

  var PLAN_TO_ROLE = {
    arbeider_naeringsliv_v1: "arbeider",
    fagarbeider_naeringsliv_v2: "fagarbeider",
    mellomleder_naeringsliv_v1: "mellomleder",
    formann_naeringsliv_v1: "formann"
  };

  function norm(v) {
    return String(v || "").trim();
  }

  function lower(v) {
    return norm(v).toLowerCase();
  }

  function inferRoleKey(state) {
    var direct = lower(state && state.active_role_key);
    if (ROLES[direct]) return direct;

    var msPlan = norm(state && state.mail_system && state.mail_system.role_plan_id);
    if (PLAN_TO_ROLE[msPlan]) return PLAN_TO_ROLE[msPlan];

    var mpPlan = norm(state && state.mail_plan_progress && state.mail_plan_progress.role_plan_id);
    if (PLAN_TO_ROLE[mpPlan]) return PLAN_TO_ROLE[mpPlan];

    return null;
  }

  function recoverActivePosition() {
    var api = window.CivicationState;
    if (!api || typeof api.getActivePosition !== "function" || typeof api.setActivePosition !== "function") return null;

    var active = api.getActivePosition();
    if (active && norm(active.role_key || active.title || active.role_id)) return active;

    var state = api.getState ? api.getState() : {};
    var roleKey = inferRoleKey(state);
    if (!roleKey || !ROLES[roleKey]) return null;

    var recovered = Object.assign({}, ROLES[roleKey], {
      recovered_from_state: true,
      recovered_at: new Date().toISOString()
    });

    api.setActivePosition(recovered);

    if (typeof api.setState === "function") {
      api.setState({
        active_role_key: roleKey,
        unemployed_since_week: null,
        stability: state.stability || "STABLE"
      });
    }

    return recovered;
  }

  function boot() {
    recoverActivePosition();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:booted", boot);
  window.addEventListener("civi:dataReady", boot);

  window.CivicationActivePositionRecovery = {
    recoverActivePosition: recoverActivePosition,
    inferRoleKey: inferRoleKey,
    ROLES: ROLES,
    PLAN_TO_ROLE: PLAN_TO_ROLE
  };
})();
