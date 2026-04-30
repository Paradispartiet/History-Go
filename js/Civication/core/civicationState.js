// ============================================================
// CivicationState – kompatibel med civicationEngine (56)
// ============================================================

(function () {

  const LS_STATE = "hg_civi_state_v1";
  const LS_INBOX = "hg_civi_inbox_v1";
  const LS_ACTIVE_POS = "hg_active_position_v1";
  const LS_JOB_HISTORY = "hg_job_history_v1";
  const LS_PULSE = "hg_civi_pulse_v1";
  const LS_WALLET = "hg_civi_wallet_v1";

  const DEFAULTS = {
  stability: "STABLE",
  warning_used: false,
  strikes: 0,
  score: 0,
  active_role_key: null,
  consumed: {},
  identity_tags: [],
  tracks: [],
  track_progress: {},
  unemployed_since_week: null,
  version: 1,

  onboarding: {
    by_role: {}
  },

  mail_branch_state: {
    preferred_types: [],
    preferred_families: [],
    flags: []
  },

  mail_system: {
    role_plan_id: null,
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
  },

  mail_director: {
    turn_index: 0,
    last_source_type: null,
    consecutive_role_mails: 0
  },

  conflict_state: {
    category: null,
    tier_label: null,
    active_conflicts: [],
    cycle_index: 0
  },

  story_state: {
    generated_at: null,
    snapshot: null,
    story_flags: [],
    story_tags: [],
    threads: []
  },

  career: {
    activeJob: null,
    obligations: [],
    reputation: 70,
    salaryModifier: 1
  }
};

function getPulse() {
  return safeParse(
    localStorage.getItem(LS_PULSE),
    { date: null, seen: {} }
  );
}

function setPulse(p) {
  localStorage.setItem(
    LS_PULSE,
    JSON.stringify(p || { date: null, seen: {} })
  );
}
  
  function safeParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function deepMerge(target, source) {
    const out = { ...target };
    for (const k in source) {
      if (
        source[k] &&
        typeof source[k] === "object" &&
        !Array.isArray(source[k])
      ) {
        out[k] = deepMerge(target[k] || {}, source[k]);
      } else {
        out[k] = source[k];
      }
    }
    return out;
  }

  function getState() {
    const raw = localStorage.getItem(LS_STATE);
    const parsed = raw ? safeParse(raw, {}) : {};
    return deepMerge(DEFAULTS, parsed);
  }

  function setState(patch) {
    const current = getState();
    const next = deepMerge(current, patch || {});
    localStorage.setItem(LS_STATE, JSON.stringify(next));
    return next;
  }

  function getInbox() {
    if (window.CivicationMailEngine?.getInbox) {
      const engineInbox = window.CivicationMailEngine.getInbox();
      return Array.isArray(engineInbox) ? engineInbox : [];
    }

    const legacy = safeParse(
      localStorage.getItem(LS_INBOX),
      []
    );

    if (Array.isArray(legacy)) return legacy;
    if (legacy && typeof legacy === "object" && Array.isArray(legacy.items)) return legacy.items;
    return [];
  }

  function setInbox(arr) {
    if (window.CivicationMailEngine?.replaceInbox) {
      window.CivicationMailEngine.replaceInbox(Array.isArray(arr) ? arr : []);
      return;
    }

    localStorage.setItem(
      LS_INBOX,
      JSON.stringify(Array.isArray(arr) ? arr : [])
    );
  }

  function getActivePosition() {
    return safeParse(
      localStorage.getItem(LS_ACTIVE_POS),
      null
    );
  }

  function setActivePosition(pos) {
    localStorage.setItem(
      LS_ACTIVE_POS,
      JSON.stringify(pos)
    );
  }

  function getOnboardingRoleKey(active) {
    const roleId = String(active?.role_id || "").trim();
    if (roleId) return roleId;

    const roleKey = String(active?.role_key || "").trim();
    if (roleKey) return roleKey;

    return null;
  }

  function getOnboardingState(active) {
    const state = getState();
    const roleKey = getOnboardingRoleKey(active);
    if (!roleKey) return null;

    const byRole =
      state?.onboarding?.by_role &&
      typeof state.onboarding.by_role === "object"
        ? state.onboarding.by_role
        : {};

    return byRole[roleKey] || null;
  }

  function ensureOnboardingState(active) {
    const roleKey = getOnboardingRoleKey(active);
    if (!roleKey) return null;

    const current = getOnboardingState(active);
    if (current) return current;

    const fresh = {
      intro_done: false,
      first_day_done: false,
      complete: false
    };

    const state = getState();
    const byRole =
      state?.onboarding?.by_role &&
      typeof state.onboarding.by_role === "object"
        ? state.onboarding.by_role
        : {};

    setState({
      onboarding: {
        by_role: {
          ...byRole,
          [roleKey]: fresh
        }
      }
    });

    return fresh;
  }

  function setOnboardingState(active, patch) {
    const roleKey = getOnboardingRoleKey(active);
    if (!roleKey) return null;

    const current = ensureOnboardingState(active) || {
      intro_done: false,
      first_day_done: false,
      complete: false
    };

    const state = getState();
    const byRole =
      state?.onboarding?.by_role &&
      typeof state.onboarding.by_role === "object"
        ? state.onboarding.by_role
        : {};

    const next = {
      ...current,
      ...(patch || {})
    };

    setState({
      onboarding: {
        by_role: {
          ...byRole,
          [roleKey]: next
        }
      }
    });

    return next;
  }

  function getMailBranchState() {
    const state = getState();
    const branch =
      state?.mail_branch_state && typeof state.mail_branch_state === "object"
        ? state.mail_branch_state
        : {};

    return {
      preferred_types: Array.isArray(branch.preferred_types) ? branch.preferred_types : [],
      preferred_families: Array.isArray(branch.preferred_families) ? branch.preferred_families : [],
      flags: Array.isArray(branch.flags) ? branch.flags : []
    };
  }

  function setMailBranchState(patch) {
    const current = getMailBranchState();
    const next = {
      preferred_types: Array.isArray(patch?.preferred_types)
        ? patch.preferred_types
        : current.preferred_types,
      preferred_families: Array.isArray(patch?.preferred_families)
        ? patch.preferred_families
        : current.preferred_families,
      flags: Array.isArray(patch?.flags)
        ? patch.flags
        : current.flags
    };

    setState({
      mail_branch_state: next
    });

    return next;
  }

  function clearMailBranchState() {
    return setMailBranchState({
      preferred_types: [],
      preferred_families: [],
      flags: []
    });
  }

  function getWallet() {
  return safeParse(
    localStorage.getItem(LS_WALLET),
    { balance: 0, last_tick_iso: null }
  );
}

function updateWallet(wallet) {
  localStorage.setItem(
    LS_WALLET,
    JSON.stringify(wallet || { balance: 0, last_tick_iso: null })
  );

  window.dispatchEvent(new Event("updateProfile"));
}

  

  function appendJobHistoryEnded(prevPos, reason) {
    if (!prevPos) return;

    const hist = safeParse(
      localStorage.getItem(LS_JOB_HISTORY),
      []
    );

    const entry = {
      ...prevPos,
      ended_at: new Date().toISOString(),
      end_reason: reason || "ended"
    };

    hist.unshift(entry);

    localStorage.setItem(
      LS_JOB_HISTORY,
      JSON.stringify(hist)
    );
  }


  
// --------------------------------------------------
// Week utilities (global single source of truth)
// --------------------------------------------------

function weekKey(d) {

  const base = d || new Date();

  const date = new Date(
    Date.UTC(
      base.getFullYear(),
      base.getMonth(),
      base.getDate()
    )
  );

  const dayNum = date.getUTCDay() || 7;

  date.setUTCDate(
    date.getUTCDate() + 4 - dayNum
  );

  const yearStart = new Date(
    Date.UTC(date.getUTCFullYear(), 0, 1)
  );

  const weekNo = Math.ceil(
    (((date - yearStart) / 86400000) + 1) / 7
  );

  return (
    date.getUTCFullYear() +
    "-W" +
    String(weekNo).padStart(2, "0")
  );
}

function weekIndexFromWeekKey(k) {

  const m = String(k || "")
    .match(/^(\d{4})-W(\d{2})$/);

  if (!m) return null;

  const y = Number(m[1]);
  const w = Number(m[2]);

  if (!Number.isFinite(y) ||
      !Number.isFinite(w)) {
    return null;
  }

  return y * 53 + w;
}

function weeksPassedBetweenWeekKeys(sinceW, nowW) {

  const a = weekIndexFromWeekKey(sinceW);
  const b = weekIndexFromWeekKey(nowW);

  if (a == null || b == null) return 0;

  return Math.max(0, b - a);
}

// Eksporter globalt
window.weekKey = weekKey;
window.weekIndexFromWeekKey = weekIndexFromWeekKey;
window.weeksPassedBetweenWeekKeys = weeksPassedBetweenWeekKeys;
  
  window.CivicationState = {
  getState,
  setState,
  getInbox,
  setInbox,
  getActivePosition,
  setActivePosition,
  appendJobHistoryEnded,
  getPulse,
  setPulse,
  getWallet,
  updateWallet,
  getOnboardingRoleKey,
  getOnboardingState,
  ensureOnboardingState,
  setOnboardingState,
  getMailBranchState,
  setMailBranchState,
  clearMailBranchState
};

})();
