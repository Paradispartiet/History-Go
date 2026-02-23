/* js/historygo/HGEngine.js */

(function () {

  const HG_VERSION = 1;

  const KEYS = {
    version: "hg:version",
    state: "hg:state",
    derived: "hg:derived"
  };

  function isoNow() {
    return new Date().toISOString();
  }

  function defaultState() {
    return {
      schemaVersion: HG_VERSION,
      visitedPlaces: [],
      completedQuizzes: [],
      collectedPeople: [],
      earnedBadges: [],
      events: []
    };
  }

  function defaultDerived() {
    return {
      schemaVersion: HG_VERSION,
      updatedAt: isoNow(),
      points: 0,
      level: 1
    };
  }

  function uniqPush(arr, value) {
    if (!arr.includes(value)) arr.push(value);
  }

  function addEvent(state, type, id) {
    state.events.push({
      t: type,
      id,
      at: isoNow()
    });
  }

  function rebuildDerived(state) {

    const derived = defaultDerived();

    derived.points =
      state.visitedPlaces.length * 5 +
      state.completedQuizzes.length * 20 +
      state.collectedPeople.length * 3 +
      state.earnedBadges.length * 10;

    derived.level = Math.max(1, Math.floor(derived.points / 100) + 1);
    derived.updatedAt = isoNow();

    return derived;
  }

  function getSnapshot(state, derived) {
    return {
      level: derived.level,
      points: derived.points,
      visitedPlaces: state.visitedPlaces.length,
      completedQuizzes: state.completedQuizzes.length,
      collectedPeople: state.collectedPeople.length,
      badges: state.earnedBadges.length
    };
  }

  const HGEngine = {

    init() {

      let version = StorageAdapter.load(KEYS.version, 0);

      if (!version) {
        StorageAdapter.save(KEYS.state, defaultState());
        StorageAdapter.save(KEYS.derived, defaultDerived());
        StorageAdapter.save(KEYS.version, HG_VERSION);
      }

      const state = StorageAdapter.load(KEYS.state, defaultState());
      const derived = rebuildDerived(state);

      StorageAdapter.save(KEYS.derived, derived);

      if (window.CoreEngine) {
        CoreEngine.publishSnapshot("historygo", getSnapshot(state, derived));
      }
    },

    loadState() {
      return StorageAdapter.load(KEYS.state, defaultState());
    },

    saveState(state) {
      StorageAdapter.save(KEYS.state, state);

      const derived = rebuildDerived(state);
      StorageAdapter.save(KEYS.derived, derived);

      if (window.CoreEngine) {
        CoreEngine.publishSnapshot("historygo", getSnapshot(state, derived));
      }

      window.dispatchEvent(new Event("hg:changed"));
      window.dispatchEvent(new Event("updateProfile"));
    },

    visitPlace(placeId) {
      const state = this.loadState();
      uniqPush(state.visitedPlaces, placeId);
      addEvent(state, "visit_place", placeId);
      this.saveState(state);
    },

    completeQuiz(quizId) {
      const state = this.loadState();
      uniqPush(state.completedQuizzes, quizId);
      addEvent(state, "complete_quiz", quizId);
      this.saveState(state);
    },

    collectPerson(personId) {
      const state = this.loadState();
      uniqPush(state.collectedPeople, personId);
      addEvent(state, "collect_person", personId);
      this.saveState(state);
    },

    earnBadge(badgeId) {
      const state = this.loadState();
      uniqPush(state.earnedBadges, badgeId);
      addEvent(state, "earn_badge", badgeId);
      this.saveState(state);
    }

  };

  window.HGEngine = HGEngine;

})();
