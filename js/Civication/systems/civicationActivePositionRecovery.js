(function () {
  "use strict";

  var BACKUP_KEY = "hg_civi_last_active_position_v1";

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
    arbeider_naeringsliv_v2: "arbeider",
    fagarbeider_naeringsliv_v2: "fagarbeider",
    fagarbeider_naeringsliv_v3: "fagarbeider",
    mellomleder_naeringsliv_v1: "mellomleder",
    mellomleder_naeringsliv_v2: "mellomleder",
    formann_naeringsliv_v1: "formann"
  };

  function norm(v) {
    return String(v || "").trim();
  }

  function lower(v) {
    return norm(v).toLowerCase();
  }

  function safeParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function validActive(pos) {
    return !!(pos && norm(pos.role_key || pos.title || pos.role_id));
  }

  function clone(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  function backupActivePosition(pos) {
    if (!validActive(pos)) return null;
    var backup = Object.assign({}, pos, {
      backed_up_at: new Date().toISOString()
    });
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    return backup;
  }

  function getBackupActivePosition() {
    var backup = safeParse(localStorage.getItem(BACKUP_KEY), null);
    return validActive(backup) ? backup : null;
  }

  function inferRoleKey(state) {
    var forced = lower(localStorage.getItem("hg_civi_forced_role_key_v1"));
    if (ROLES[forced]) return forced;

    var direct = lower(state && state.active_role_key);
    if (ROLES[direct]) return direct;

    var runtimePlan = norm(state && state.mail_runtime_v1 && state.mail_runtime_v1.role_plan_id);
    if (PLAN_TO_ROLE[runtimePlan]) return PLAN_TO_ROLE[runtimePlan];

    var msPlan = norm(state && state.mail_system && state.mail_system.role_plan_id);
    if (PLAN_TO_ROLE[msPlan]) return PLAN_TO_ROLE[msPlan];

    var mpPlan = norm(state && state.mail_plan_progress && state.mail_plan_progress.role_plan_id);
    if (PLAN_TO_ROLE[mpPlan]) return PLAN_TO_ROLE[mpPlan];

    return null;
  }

  function roleFromState(state) {
    var roleKey = inferRoleKey(state);
    if (!roleKey || !ROLES[roleKey]) return null;
    return Object.assign({}, ROLES[roleKey]);
  }

  function patchSetActivePosition() {
    var api = window.CivicationState;
    if (!api || typeof api.setActivePosition !== "function") return false;
    if (api.__activePositionRecoveryPatched) return true;

    var original = api.setActivePosition.bind(api);
    api.setActivePosition = function patchedSetActivePosition(pos) {
      var res = original(pos);
      if (validActive(pos)) backupActivePosition(pos);
      return res;
    };

    api.__activePositionRecoveryPatched = true;
    return true;
  }

  function recoverActivePosition() {
    var api = window.CivicationState;
    if (!api || typeof api.getActivePosition !== "function" || typeof api.setActivePosition !== "function") return null;

    patchSetActivePosition();

    var active = api.getActivePosition();
    if (validActive(active)) {
      backupActivePosition(active);
      return active;
    }

    var state = api.getState ? api.getState() : {};
    var recoveredFromState = roleFromState(state);
    var recovered = recoveredFromState || getBackupActivePosition();
    if (!validActive(recovered)) return null;

    recovered = Object.assign({}, clone(recovered), {
      recovered_from_state: !!recoveredFromState,
      recovered_from_backup: !recoveredFromState,
      recovered_at: new Date().toISOString()
    });

    api.setActivePosition(recovered);

    if (typeof api.setState === "function") {
      var roleKey = lower(recovered.role_key || recovered.title);
      api.setState({
        active_role_key: roleKey,
        unemployed_since_week: null,
        stability: state.stability || "STABLE"
      });
    }

    backupActivePosition(recovered);
    return recovered;
  }

  function boot() {
    patchSetActivePosition();
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
    backupActivePosition: backupActivePosition,
    getBackupActivePosition: getBackupActivePosition,
    inferRoleKey: inferRoleKey,
    ROLES: ROLES,
    PLAN_TO_ROLE: PLAN_TO_ROLE
  };
})();
