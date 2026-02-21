(function () {

  const KEY = "hg_psyche_v1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function ensure(state) {
    state.trust ||= {};
    state.trustMeta ||= {};
    return state;
  }

  function computeMaxTrust(collapses) {
    if (collapses === 0) return 80;
    if (collapses === 1) return 100;
    if (collapses === 2) return 80;
    return 60;
  }

  function getCareerTrust(careerId) {
    const state = ensure(load());
    const meta = state.trustMeta[careerId] || { collapses: 0 };
    const value = state.trust[careerId] ?? 50;
    const max = computeMaxTrust(meta.collapses);

    return {
      value,
      collapses: meta.collapses,
      max
    };
  }

  function updateTrust(careerId, delta) {
    const state = ensure(load());
    const current = getCareerTrust(careerId);

    const newValue = Math.max(
      0,
      Math.min(current.max, current.value + Number(delta || 0))
    );

    state.trust[careerId] = newValue;
    save(state);

    return getCareerTrust(careerId);
  }

  function registerCollapse(careerId, type = "fired") {
    const state = ensure(load());
    const meta = state.trustMeta[careerId] || { collapses: 0 };

    meta.collapses += 1;
    state.trustMeta[careerId] = meta;

    const max = computeMaxTrust(meta.collapses);
    const current = state.trust[careerId] ?? 50;
    state.trust[careerId] = Math.min(current, max);

    save(state);

    return getCareerTrust(careerId);
  }

  window.CivicationPsyche = {
    getCareerTrust,
    updateTrust,
    registerCollapse
  };

})();
