(function () {
  "use strict";

  const KEY = "hg_psyche_v1";

  // -----------------------------
  // Storage helpers
  // -----------------------------
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      return raw && typeof raw === "object" ? raw : {};
    } catch {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state || {}));
    } catch {}
  }

  function clamp(n, min, max) {
    const x = Number(n);
    if (!Number.isFinite(x)) return min;
    return Math.max(min, Math.min(max, x));
  }

  function ensure(state) {
  // --------------------------------------------------
// TRUST – per career (badge-id)
// --------------------------------------------------
state.trust ||= {};      // { [careerId]: number }
state.trustMeta ||= {};  // { [careerId]: { collapses:number, lastCollapse?, collapseHistory? } }
    
  // --------------------------------------------------
  // Global psyke
  // --------------------------------------------------
  if (!Number.isFinite(state.integrity)) state.integrity = 50;
  if (!Number.isFinite(state.visibility)) state.visibility = 50;
  if (!Number.isFinite(state.economicRoom)) state.economicRoom = 50;

  // Autonomi override
  if (!("autonomyOverride" in state)) state.autonomyOverride = null;

// --------------------------------------------------
// ROLE BASELINE (strukturelt klima)
// --------------------------------------------------
if (!state.roleBaseline || typeof state.roleBaseline !== "object") {
  state.roleBaseline = {
    role_key: null,
    integrity: 0,
    visibility: 0,
    economicRoom: 0,
    autonomy: 0
  };
}
    
  return state;
}

  function write(patchFn) {
    const state = ensure(load());
    patchFn(state);
    save(state);
    return state;
  }

  // -----------------------------
  // TRUST (rolle-spesifikk)
  // Max-regel:
  // 0 kollaps -> max 80
  // 1 kollaps -> max 100
  // 2 kollaps -> max 80
  // 3+ kollaps -> max 60
  // -----------------------------
  function computeMaxTrust(collapses) {
    const c = Number(collapses || 0);
    if (c === 0) return 80;
    if (c === 1) return 100;
    if (c === 2) return 80;
    return 60;
  }

  function getCareerTrust(careerId) {
    const id = String(careerId || "").trim();
    const state = ensure(load());

    const meta = state.trustMeta[id] || { collapses: 0 };
    const collapses = clamp(meta.collapses ?? 0, 0, 99);
    const max = computeMaxTrust(collapses);

    const value = clamp(state.trust[id] ?? 50, 0, max);

    return {
      value,
      max,
      collapses,
      lastCollapse: meta.lastCollapse || null
    };
  }

  function setTrust(careerId, value) {
    const id = String(careerId || "").trim();
    if (!id) return null;

    const current = getCareerTrust(id);

    write((state) => {
      state.trust[id] = clamp(value, 0, current.max);
    });

    return getCareerTrust(id);
  }

  function updateTrust(careerId, delta) {
    const id = String(careerId || "").trim();
    if (!id) return null;

    const current = getCareerTrust(id);
    const next = clamp(current.value + Number(delta || 0), 0, current.max);

    write((state) => {
      state.trust[id] = next;
    });

    return getCareerTrust(id);
  }

  function registerCollapse(careerId, type = "fired") {
    const id = String(careerId || "").trim();
    if (!id) return null;

    const now = new Date().toISOString();

    write((state) => {
      const meta = state.trustMeta[id] || { collapses: 0 };
      meta.collapses = clamp((meta.collapses ?? 0) + 1, 0, 99);
      meta.collapseHistory ||= [];
      meta.collapseHistory.push({
       type: String(type || "fired"),
       at: now
     });

     meta.lastCollapse = {
      type: String(type || "fired"),
      at: now
     };

     state.trustMeta[id] = meta;
      const max = computeMaxTrust(meta.collapses);
      const cur = Number(state.trust[id] ?? 50);
      state.trust[id] = clamp(cur, 0, max);
    });

    return getCareerTrust(id);
  }

  function getTrustSummary() {
    const state = ensure(load());
    const ids = Object.keys(state.trust || {});
    if (!ids.length) {
      return {
        avgPercent: 50,
        count: 0,
        byCareer: {}
      };
    }

    let sum = 0;
    let n = 0;
    const byCareer = {};

    for (const id of ids) {
      const t = getCareerTrust(id);
      const pct = t.max ? Math.round((t.value / t.max) * 100) : 0;
      byCareer[id] = { ...t, percent: pct };
      sum += pct;
      n += 1;
    }

    return {
      avgPercent: Math.round(sum / Math.max(1, n)),
      count: n,
      byCareer
    };
  }

  // -----------------------------
  // INTEGRITY (global 0..100)
  // -----------------------------
  function getIntegrity() {
    const state = ensure(load());
    return clamp(state.integrity, 0, 100);
  }

  function setIntegrity(value) {
    write((state) => {
      state.integrity = clamp(value, 0, 100);
    });
    return getIntegrity();
  }

  function updateIntegrity(delta) {
    return setIntegrity(getIntegrity() + Number(delta || 0));
  }

  // -----------------------------
  // VISIBILITY (global 0..100)
  // -----------------------------
  function getVisibility() {
    const state = ensure(load());
    return clamp(state.visibility, 0, 100);
  }

  function setVisibility(value) {
    write((state) => {
      state.visibility = clamp(value, 0, 100);
    });
    return getVisibility();
  }

  function updateVisibility(delta) {
    return setVisibility(getVisibility() + Number(delta || 0));
  }

  // -----------------------------
  // ECONOMIC ROOM (global 0..100)
  // (buffer / fleksibilitet, ikke PC-saldo direkte)
  // -----------------------------
  function getEconomicRoom() {
    const state = ensure(load());
    return clamp(state.economicRoom, 0, 100);
  }

  function setEconomicRoom(value) {
    write((state) => {
      state.economicRoom = clamp(value, 0, 100);
    });
    return getEconomicRoom();
  }

  function updateEconomicRoom(delta) {
    return setEconomicRoom(getEconomicRoom() + Number(delta || 0));
  }


    // -----------------------------
  // ROLE BASELINE (settes av jobb/rolle)
  // -----------------------------
  function applyRoleBaseline(baseline) {
    write((state) => {
      state.roleBaseline = {
        integrity: Number(baseline?.integrity || 0),
        visibility: Number(baseline?.visibility || 0),
        economicRoom: Number(baseline?.economicRoom || 0)
      };
    });
  }

  function clearRoleBaseline() {
  write((state) => {
    state.roleBaseline = {
      role_key: null,
      integrity: 0,
      visibility: 0,
      economicRoom: 0,
      autonomy: 0
    };
  });
}
  // -----------------------------
  // AUTONOMY (0..100)
  // Default: beregnes dynamisk av de andre.
  // Valgfri override hvis du vil "fryse" autonomy midlertidig.
  // -----------------------------
function computeAutonomy(careerId = null) {
  const state = ensure(load());

  const integrity = clamp(
    state.integrity + (state.roleBaseline?.integrity || 0),
    0,
    100
  );

  const visibility = clamp(
    state.visibility + (state.roleBaseline?.visibility || 0),
    0,
    100
  );

  const economicRoom = clamp(
    state.economicRoom + (state.roleBaseline?.economicRoom || 0),
    0,
    100
  );

  let trustPct = 50;

  if (careerId) {
    const t = getCareerTrust(careerId);
    trustPct = t.max ? Math.round((t.value / t.max) * 100) : 0;
  } else {
    trustPct = getTrustSummary().avgPercent;
  }

  const raw =
    (economicRoom * 0.4) +
    (trustPct * 0.3) +
    (integrity * 0.2) -
    (visibility * 0.2);

  return clamp(
    raw + (state.roleBaseline?.autonomy || 0),
    0,
    100
  );
}

  function getAutonomy(careerId = null) {
    const state = ensure(load());
    if (Number.isFinite(state.autonomyOverride)) {
      return clamp(state.autonomyOverride, 0, 100);
    }
    return computeAutonomy(careerId);
  }

  function setAutonomyOverride(valueOrNull) {
    write((state) => {
      if (valueOrNull === null) state.autonomyOverride = null;
      else state.autonomyOverride = clamp(valueOrNull, 0, 100);
    });
    return getAutonomy();
  }

  function clearAutonomyOverride() {
    return setAutonomyOverride(null);
  }

// -----------------------------
// BURNOUT
// -----------------------------
function checkBurnout() {
  const state = ensure(load());

  const integrity = clamp(
    state.integrity + (state.roleBaseline?.integrity || 0),
    0,
    100
  );

  const visibility = clamp(
    state.visibility + (state.roleBaseline?.visibility || 0),
    0,
    100
  );

  if (state.burnoutActive) return false;

  if (visibility > 85 && integrity < 45) {
    write((s) => {
      s.burnoutActive = true;
      s.economicRoom = clamp(s.economicRoom - 15, 0, 100);
      s.integrity = clamp(s.integrity - 10, 0, 100);
      s.autonomyOverride = clamp(
        (s.autonomyOverride ?? computeAutonomy()) - 20,
        0,
        100
      );
    });

    return true;
  }

  return false;
}

function isBurnoutActive() {
  const state = ensure(load());
  return Boolean(state.burnoutActive);
}

function clearBurnout() {
  write((s) => {
    s.burnoutActive = false;
    s.autonomyOverride = null;
  });
}

  function getLifestyleEconomyModifier() {
  const lifestyle = getPrimaryLifestyle?.();
  if (!lifestyle || !lifestyle.economy_profile) {
    return { swing: 1, pressure: 1 };
  }

  const riskMap = {
    low: 0.8,
    medium: 1.0,
    high: 1.3
  };

  const pressureMap = {
    low: 0.9,
    medium: 1.0,
    medium_high: 1.15,
    high: 1.3
  };

  return {
    swing: riskMap[lifestyle.economy_profile.risk] || 1,
    pressure: pressureMap[lifestyle.economy_profile.budget_pressure] || 1
  };
}
  
  // -----------------------------
  // SNAPSHOT (til UI/debug)
  // -----------------------------
  function getSnapshot(activeCareerId = null) {
    const trustSummary = getTrustSummary();
    const activeTrust = activeCareerId ? getCareerTrust(activeCareerId) : null;

    return {
      integrity: getIntegrity(),
      visibility: getVisibility(),
      economicRoom: getEconomicRoom(),
      autonomy: getAutonomy(activeCareerId),
      trust: activeTrust,
      trustSummary
    };
  }

  // -----------------------------
  // PUBLIC API
  // -----------------------------
  window.CivicationPsyche = {
    // trust
    computeMaxTrust,
    getCareerTrust,
    setTrust,
    updateTrust,
    registerCollapse,
    getTrustSummary,

    // global psyche
    getIntegrity,
    setIntegrity,
    updateIntegrity,

    getVisibility,
    setVisibility,
    updateVisibility,

    getEconomicRoom,
    setEconomicRoom,
    updateEconomicRoom,

    getAutonomy,
    setAutonomyOverride,
    clearAutonomyOverride,

    applyRoleBaseline,
    clearRoleBaseline,

    checkBurnout,
    isBurnoutActive,
    clearBurnout,

    // debug/ui
    getSnapshot
  };
})();
