/* /js/historygo/HGEngine.js */

import { StorageAdapter } from "/js/core/StorageAdapter.js";
import { CoreEngine } from "/js/core/CoreEngine.js";

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
    level: 1,
    meritsByCategory: {},
    badges: {
      unlocked: [],
      tiers: {}
    }
  };
}

function uniqPush(arr, value) {
  if (!arr.includes(value)) arr.push(value);
}

function addEvent(state, t, id) {
  state.events.push({ t, id, at: isoNow() });
}

function rebuildDerivedFromState(state) {
  // MINIMAL: du kan senere plugge inn ekte beregning (poeng, merits, badges)
  // uten å endre resten av arkitekturen.

  const derived = defaultDerived();
  derived.updatedAt = isoNow();

  derived.points =
    (state.visitedPlaces.length * 5) +
    (state.completedQuizzes.length * 20) +
    (state.collectedPeople.length * 3) +
    (state.earnedBadges.length * 10);

  derived.level = Math.max(1, Math.floor(derived.points / 100) + 1);

  return derived;
}

function getSnapshot(derived, state) {
  return {
    level: derived.level,
    points: derived.points,
    visitedPlaces: state.visitedPlaces.length,
    completedQuizzes: state.completedQuizzes.length,
    collectedPeople: state.collectedPeople.length,
    badges: {
      total: state.earnedBadges.length
    },
    meritsByCategory: derived.meritsByCategory
  };
}

export const HGEngine = {
  init() {
    const v = StorageAdapter.load(KEYS.version, 0);

    // Første gang
    if (!v) {
      StorageAdapter.save(KEYS.state, defaultState());
      StorageAdapter.save(KEYS.derived, defaultDerived());
      StorageAdapter.save(KEYS.version, HG_VERSION);
      CoreEngine.publishSnapshot("historygo", getSnapshot(defaultDerived(), defaultState()));
      return;
    }

    // Migrering stub (utvides når schema endres)
    if (v < HG_VERSION) {
      const state = StorageAdapter.load(KEYS.state, defaultState());
      state.schemaVersion = HG_VERSION;
      StorageAdapter.save(KEYS.state, state);
      StorageAdapter.save(KEYS.version, HG_VERSION);
    }

    // Rebuild derived og snapshot ved init
    const state = StorageAdapter.load(KEYS.state, defaultState());
    const derived = rebuildDerivedFromState(state);
    StorageAdapter.save(KEYS.derived, derived);
    CoreEngine.publishSnapshot("historygo", getSnapshot(derived, state));
  },

  loadState() {
    return StorageAdapter.load(KEYS.state, defaultState());
  },

  loadDerived() {
    return StorageAdapter.load(KEYS.derived, defaultDerived());
  },

  saveState(state) {
    StorageAdapter.save(KEYS.state, state);

    const derived = rebuildDerivedFromState(state);
    StorageAdapter.save(KEYS.derived, derived);

    CoreEngine.publishSnapshot("historygo", getSnapshot(derived, state));

    window.dispatchEvent(new Event("hg:changed"));
    window.dispatchEvent(new Event("updateProfile")); // din regel, også direkte ved subsystem-endring
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
