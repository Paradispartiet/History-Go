(function () {
  "use strict";

  const LS_KEY = "hg_civi_active_faction_v1";
  const IDS = ["industri", "kontroll", "institusjon", "menneske"];

  function normStr(v) {
    return String(v || "").trim();
  }

  function readState() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return raw && typeof raw === "object" ? raw : { active_faction: null, history: [], updated_at: null };
    } catch {
      return { active_faction: null, history: [], updated_at: null };
    }
  }

  function writeState(state) {
    const safe = {
      active_faction: state?.active_faction || null,
      history: Array.isArray(state?.history) ? state.history : [],
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(safe));
    window.dispatchEvent(new Event("updateProfile"));
    return safe;
  }

  function setActiveFaction(factionId, source) {
    const id = normStr(factionId);
    if (!IDS.includes(id)) return readState();

    const current = readState();
    const entry = {
      faction_id: id,
      source: normStr(source || "manual"),
      at: new Date().toISOString()
    };

    return writeState({
      active_faction: entry,
      history: [entry, ...(current.history || [])].slice(0, 20)
    });
  }

  function clearActiveFaction() {
    const current = readState();
    return writeState({ ...current, active_faction: null });
  }

  function getActiveFaction() {
    return readState().active_faction || null;
  }

  function getOptions() {
    return IDS.slice();
  }

  window.CivicationFactionChoiceSystem = {
    getState: readState,
    getOptions,
    getActiveFaction,
    setActiveFaction,
    clearActiveFaction
  };
})();
