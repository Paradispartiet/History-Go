(function () {
  "use strict";

  const ROLE_CONFIG = {
    arbeider: {
      plan_id: "arbeider_naeringsliv_v1",
      allowed_prefixes: ["arb_", "arbeider_", "phase_"]
    },
    fagarbeider: {
      plan_id: "fagarbeider_naeringsliv_v2",
      allowed_prefixes: ["fagarbeider_", "phase_"]
    },
    mellomleder: {
      plan_id: "mellomleder_naeringsliv_v1",
      allowed_prefixes: ["ml_", "phase_"]
    },
    formann: {
      plan_id: "formann_naeringsliv_v1",
      allowed_prefixes: ["formann_", "phase_"]
    }
  };

  function norm(v) {
    return String(v || "").trim();
  }

  function roleKey(active) {
    return norm(active?.role_key || active?.title || active?.role_id).toLowerCase();
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getInbox() {
    return window.CivicationState?.getInbox?.() || [];
  }

  function setInbox(arr) {
    window.CivicationState?.setInbox?.(Array.isArray(arr) ? arr : []);
    window.dispatchEvent(new Event("updateProfile"));
  }

  function getActive() {
    window.CivicationActivePositionRecovery?.recoverActivePosition?.();
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function isNav(ev) {
    const id = norm(ev?.id);
    return norm(ev?.source) === "NAV" || id.startsWith("nav_auto_") || norm(ev?.stage) === "unemployed";
  }

  function eventMatchesRole(ev, key) {
    if (!ev || !key || !ROLE_CONFIG[key]) return true;
    const id = norm(ev.id);
    if (!id) return true;
    if (isNav(ev)) return false;
    return ROLE_CONFIG[key].allowed_prefixes.some((prefix) => id.startsWith(prefix));
  }

  function cleanInboxRoleMismatch() {
    const active = getActive();
    const key = roleKey(active);
    if (!key || !ROLE_CONFIG[key]) return false;

    const inbox = getInbox();
    if (!Array.isArray(inbox) || !inbox.length) return false;

    const next = inbox.filter((item) => {
      const ev = item?.event || item || null;
      return eventMatchesRole(ev, key);
    });

    if (next.length === inbox.length) return false;
    setInbox(next);
    return true;
  }

  function ensureRolePlan() {
    const active = getActive();
    const key = roleKey(active);
    const cfg = ROLE_CONFIG[key];
    if (!cfg) return null;

    const state = getState();
    const ms = state.mail_system && typeof state.mail_system === "object" ? state.mail_system : {};
    const mp = state.mail_plan_progress && typeof state.mail_plan_progress === "object" ? state.mail_plan_progress : {};

    const patch = {
      active_role_key: key,
      unemployed_since_week: null
    };

    let needsPatch = false;

    if (norm(ms.role_plan_id) !== cfg.plan_id) {
      patch.mail_system = {
        ...ms,
        role_plan_id: cfg.plan_id,
        step_index: 0,
        current_cycle: Number(ms.current_cycle || 1),
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
      needsPatch = true;
    }

    if (norm(mp.role_plan_id) !== cfg.plan_id) {
      patch.mail_plan_progress = {
        role_plan_id: cfg.plan_id,
        step_index: 0,
        current_step_type: "job"
      };
      needsPatch = true;
    }

    if (state.active_role_key !== key || state.unemployed_since_week) needsPatch = true;

    if (needsPatch) return setState(patch);
    return state;
  }

  function cleanDirectorRoleMismatch() {
    const active = getActive();
    const key = roleKey(active);
    const cfg = ROLE_CONFIG[key];
    if (!cfg) return false;

    const state = getState();
    const d = state.mail_director_v2 && typeof state.mail_director_v2 === "object" ? state.mail_director_v2 : null;
    if (!d) return false;

    function keep(id) {
      id = norm(id);
      if (!id) return false;
      return cfg.allowed_prefixes.some((prefix) => id.startsWith(prefix));
    }

    const shown = (Array.isArray(d.shown_ids) ? d.shown_ids : []).filter(keep);
    const answered = (Array.isArray(d.answered_ids) ? d.answered_ids : []).filter(keep);
    const blocked = (Array.isArray(d.blocked_recent_ids) ? d.blocked_recent_ids : []).filter(keep);
    const lastOk = keep(d.last_event_id);

    const changed =
      shown.length !== (Array.isArray(d.shown_ids) ? d.shown_ids.length : 0) ||
      answered.length !== (Array.isArray(d.answered_ids) ? d.answered_ids.length : 0) ||
      blocked.length !== (Array.isArray(d.blocked_recent_ids) ? d.blocked_recent_ids.length : 0) ||
      (!lastOk && !!norm(d.last_event_id));

    if (!changed) return false;

    setState({
      mail_director_v2: {
        ...d,
        shown_ids: shown,
        answered_ids: answered,
        blocked_recent_ids: blocked,
        last_event_id: lastOk ? d.last_event_id : null,
        last_mail_type: lastOk ? d.last_mail_type : null,
        last_family: lastOk ? d.last_family : null,
        last_phase: lastOk ? d.last_phase : null,
        turn_index: Math.min(Number(d.turn_index || 0), shown.length),
        updated_at: new Date().toISOString()
      }
    });

    return true;
  }

  function run() {
    ensureRolePlan();
    cleanInboxRoleMismatch();
    cleanDirectorRoleMismatch();
  }

  function patchEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__runtimeSanityGuardPatched) return false;

    const originalOnAppOpen = proto.onAppOpen;
    if (typeof originalOnAppOpen === "function") {
      proto.onAppOpen = async function sanityOnAppOpen(opts) {
        run();
        const res = await originalOnAppOpen.call(this, opts || {});
        run();
        return res;
      };
    }

    const originalAnswer = proto.answer;
    if (typeof originalAnswer === "function") {
      proto.answer = async function sanityAnswer(eventId, choiceId) {
        run();
        const res = await originalAnswer.call(this, eventId, choiceId);
        run();
        return res;
      };
    }

    proto.__runtimeSanityGuardPatched = true;
    return true;
  }

  function boot() {
    patchEngine();
    run();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:booted", boot);
  window.addEventListener("civi:dataReady", boot);

  window.CivicationRuntimeSanityGuard = {
    run,
    patchEngine,
    cleanInboxRoleMismatch,
    cleanDirectorRoleMismatch,
    ensureRolePlan
  };
})();
