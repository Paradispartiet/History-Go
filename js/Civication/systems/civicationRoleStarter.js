(function () {
  "use strict";

  var ROLES = {
    ekspeditor: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Ekspeditør / butikkmedarbeider",
      role_key: "ekspeditor",
      role_id: "naer_ekspeditor"
    },
    arbeider: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Lager- og driftsmedarbeider",
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
    formann: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Formann / arbeidsleder",
      role_key: "formann",
      role_id: "naer_formann"
    },
    controller: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Controller",
      role_key: "controller",
      role_id: "naer_controller"
    },
    finansanalytiker: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Finansanalytiker",
      role_key: "finansanalytiker",
      role_id: "naer_finansanalytiker"
    },
    okonomi_og_finanssjef: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Økonomi- og finanssjef",
      role_key: "okonomi_og_finanssjef",
      role_id: "naer_okonomi_og_finanssjef"
    },
    finansdirektor: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Finansdirektør",
      role_key: "finansdirektor",
      role_id: "naer_finansdirektor"
    },
    mellomleder: {
      career_id: "naeringsliv",
      career_name: "Næringsliv & industri",
      title: "Mellomleder",
      role_key: "mellomleder",
      role_id: "naer_mellomleder"
    }
  };

  var ROLE_TO_PLAN = {
    ekspeditor: "ekspeditor_naeringsliv_v1",
    arbeider: "arbeider_naeringsliv_v2",
    fagarbeider: "fagarbeider_naeringsliv_v3",
    formann: "formann_naeringsliv_v1",
    controller: "controller_naeringsliv_v1",
    finansanalytiker: "finansanalytiker_naeringsliv_v1",
    okonomi_og_finanssjef: "okonomi_og_finanssjef_naeringsliv_v1",
    finansdirektor: "finansdirektor_naeringsliv_v1",
    mellomleder: "mellomleder_naeringsliv_v2"
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

  function cleanMailRuntime(roleKey, planId) {
    var role = ROLES[roleKey] || null;
    return {
      version: 1,
      role_plan_id: planId,
      role_scope: role ? role.role_key : roleKey,
      career_id: role ? role.career_id : "naeringsliv",
      step_index: 0,
      consumed_ids: [],
      history: [],
      updated_at: new Date().toISOString()
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
        mail_runtime_v1: cleanMailRuntime(roleKey, planId),
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
