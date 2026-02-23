(function () {
  "use strict";

  const LS_IDENTITY = "hg_identity_v1";

  const DEFAULT_IDENTITY = {
    focus: {
      economic: 0.3,
      cultural: 0.3,
      social: 0.3,
      symbolic: 0.3,
      subculture: 0.2,
      political: 0.3
    },
    volatility: 0.2, // 0 = stabil, 1 = kaotisk
    lastShift: Date.now()
  };

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function loadIdentity() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_IDENTITY));
      return raw || DEFAULT_IDENTITY;
    } catch {
      return DEFAULT_IDENTITY;
    }
  }

  function saveIdentity(identity) {
    localStorage.setItem(LS_IDENTITY, JSON.stringify(identity));
  }

  function getIdentity() {
    return loadIdentity();
  }

  function getBoost(type) {
    const identity = loadIdentity();
    const weight = identity.focus[type] || 0.2;

    // Boost range 0.8–1.2
    return 0.8 + weight * 0.4;
  }

  function shiftFocus(type, intensity = 0.05) {
    const identity = loadIdentity();

    if (!identity.focus[type]) {
      identity.focus[type] = 0;
    }

    const delta = intensity * (1 + identity.volatility);

    identity.focus[type] = clamp01(identity.focus[type] + delta);

    // Lett normalisering (unngå at alt går til 1)
    Object.keys(identity.focus).forEach((k) => {
      if (k !== type) {
        identity.focus[k] = clamp01(identity.focus[k] - delta * 0.2);
      }
    });

    identity.lastShift = Date.now();

    saveIdentity(identity);

    return identity;
  }

  function getIdentityState() {
    const identity = loadIdentity();

    const dominant = Object.entries(identity.focus)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      dominant,
      volatility: identity.volatility,
      focus: identity.focus
    };
  }

  window.HG_IdentityCore = {
    getIdentity,
    getBoost,
    shiftFocus,
    getIdentityState
  };

})();
