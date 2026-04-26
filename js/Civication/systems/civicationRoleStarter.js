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

  var ROLE_TO_PLAN = {
    arbeider: "arbeider_naeringsliv_v1",
    fagarbeider: "fagarbeider_naeringsliv_v2",
    mellomleder: "mellomleder_naeringsliv_v1",
    formann: "formann_naeringsliv_v1"
  };

  function norm(v) {
    return String(v || "").trim();
  }

  function lower(v) {
    return norm(v).toLowerCase();
  }

  function cleanMailSystem(planId) {
    return {
      role_plan_id: planId,
      step_index: 0,
      current_cycle: 1,
      last_mail_type: null,
      active_conflict_id: null,
      active_conflict_phase: "intro",
      active_people_threads: [],
      people_thread_phases: {},
      active_story_threads: [],
      story_thread_phases: {},
      active_event_queue: [],
      active_event_thread_id: null,
      active_event_phase: null,
      consumed_mail_ids: [],
      consumed_families: [],
      cooldowns: {},
      history: []
    };
  }

  function startRole(roleKey, opts) {
    var api = window.CivicationState;
    roleKey = lower(roleKey);
    if (!api || !ROLES[roleKey] || !ROLE_TO_PLAN[roleKey]) return null;

    var role = Object.assign({}, ROLES[roleKey]);
    var planId = ROLE_TO_PLAN[roleKey];
    var state = api.getState ? api.getState() : {};

    if (typeof api.setActivePosition === "function") api.setActivePosition(role);

    if (typeof api.setState === "function") {
      api.setState({
        active_role_key: roleKey,
        unemployed_since_week: null,
        stability: state.stability || "STABLE",
        mail_system: cleanMailSystem(planId),
        mail_plan_progress: {
          role_plan_id: planId,
          step_index: 0,
          current_step_type: "job"
        }
      });
    }

    if (opts?.clearInbox !== false && typeof api.setInbox === "function") api.setInbox([]);
    if (window.CivicationActivePositionRecovery?.backupActivePosition) {
      window.CivicationActivePositionRecovery.backupActivePosition(role);
    }

    localStorage.setItem("hg_civi_forced_role_key_v1", roleKey);
    window.dispatchEvent(new Event("updateProfile"));
    return role;
  }

  function clearForcedRole() {
    localStorage.removeItem("hg_civi_forced_role_key_v1");
  }

  window.CivicationRoleStarter = {
    startRole: startRole,
    clearForcedRole: clearForcedRole,
    ROLES: ROLES,
    ROLE_TO_PLAN: ROLE_TO_PLAN
  };
})();
