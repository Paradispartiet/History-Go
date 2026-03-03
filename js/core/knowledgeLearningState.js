(function () {

  const KEY = "hg_learning_v1";

  function baseState() {
    return {
      version: 1,
      learning: {}
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return baseState();

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return baseState();
      if (!parsed.learning || typeof parsed.learning !== "object") {
        parsed.learning = {};
      }
      return parsed;
    } catch (e) {
      return baseState();
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function ensureEntry(state, emne_id) {
    if (!state.learning[emne_id]) {
      state.learning[emne_id] = {
        seen: false,
        understood: false,
        applied: false,
        seen_at: null,
        understood_at: null,
        applied_at: null
      };
    }
    return state.learning[emne_id];
  }

  function getState() {
    return load();
  }

  function getLearning(emne_id) {
    if (!emne_id) {
      return {
        seen: false,
        understood: false,
        applied: false
      };
    }

    const state = load();
    const entry = state.learning[emne_id];

    if (!entry) {
      return {
        seen: false,
        understood: false,
        applied: false
      };
    }

    return {
      seen: !!entry.seen,
      understood: !!entry.understood,
      applied: !!entry.applied
    };
  }

  function setSeen(emne_id) {
    if (!emne_id) return;

    const state = load();
    const entry = ensureEntry(state, emne_id);

    if (!entry.seen) {
      entry.seen = true;
      entry.seen_at = new Date().toISOString();
      save(state);
    }
  }

  function setUnderstood(emne_id) {
    if (!emne_id) return;

    const state = load();
    const entry = ensureEntry(state, emne_id);

    if (!entry.seen) {
      entry.seen = true;
      entry.seen_at = new Date().toISOString();
    }

    if (!entry.understood) {
      entry.understood = true;
      entry.understood_at = new Date().toISOString();
      save(state);
    }
  }

  function setApplied(emne_id) {
    if (!emne_id) return;

    const state = load();
    const entry = ensureEntry(state, emne_id);

    if (!entry.understood) return;

    if (!entry.applied) {
      entry.applied = true;
      entry.applied_at = new Date().toISOString();
      save(state);
    }
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  window.KnowledgeLearning = {
    getState,
    getLearning,
    setSeen,
    setUnderstood,
    setApplied,
    reset
  };

})();
