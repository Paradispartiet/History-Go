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
    unemployed_since_week: null,
    version: 1
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
    return safeParse(
      localStorage.getItem(LS_INBOX),
      []
    );
  }

  function setInbox(arr) {
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
  updateWallet
};

})();
