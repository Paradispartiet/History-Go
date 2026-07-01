// js/progress/profileProgressReader.js
// Shared read-only progress helpers extracted from profile.js patterns.
// No writes, no migrations, no DOM rendering.
(function (global) {
  "use strict";

  const KEYS = {
    VISITED_PLACES: "visited_places",
    PEOPLE_COLLECTED: "people_collected",
    QUIZ_PROGRESS: "quiz_progress",
    MERITS_BY_CATEGORY: "merits_by_category",
    MUSIC_UNLOCKS: "hg_unlocked_music_objects_v1",
    FAVORITE_PLACES: "hg_favorite_place_ids_v1",
    GROUNDHOPPER_STATS: "hg_groundhopper_stats_v1",
    UNLOCKS: "hg_unlocks_v1"
  };

  function normalizeId(value) {
    return String(value ?? "").trim();
  }

  function readJSON(key, fallback) {
    try {
      const raw = global.localStorage?.getItem?.(key);
      if (raw == null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function readProgressIdSet(storageKey) {
    const raw = readJSON(storageKey, {});
    const ids = new Set();
    const addId = (value) => {
      if (value == null) return;
      if (["boolean", "function", "object", "symbol"].includes(typeof value)) return;
      const id = normalizeId(value);
      if (id) ids.add(id);
    };

    if (Array.isArray(raw)) {
      raw.forEach(addId);
      return ids;
    }

    if (raw && typeof raw === "object") {
      Object.entries(raw).forEach(([id, value]) => {
        if (value) addId(id);
      });
    }

    return ids;
  }

  function toIdList(set) {
    return Array.from(set || []).map(normalizeId).filter(Boolean);
  }

  function getVisitedPlaceIds() {
    return readProgressIdSet(KEYS.VISITED_PLACES);
  }

  function getVisitedPlaceIdList() {
    return toIdList(getVisitedPlaceIds());
  }

  function getCollectedPeopleIds() {
    return readProgressIdSet(KEYS.PEOPLE_COLLECTED);
  }

  function getCollectedPeopleIdList() {
    return toIdList(getCollectedPeopleIds());
  }

  function getQuizHistory() {
    try {
      const history = global.HGLearningLog?.getQuizHistory?.();
      if (Array.isArray(history)) return history;
    } catch {}
    return [];
  }

  function getCompletedQuizUnitIds() {
    const ids = new Set();
    const history = getQuizHistory();

    history.forEach((entry) => {
      const id = normalizeId(entry?.id || entry?.targetId);
      if (id) ids.add(id);
    });

    const quizProgress = readJSON(KEYS.QUIZ_PROGRESS, {});
    if (quizProgress && typeof quizProgress === "object") {
      Object.values(quizProgress).forEach((value) => {
        const completed = Array.isArray(value?.completed) ? value.completed : [];
        completed.forEach((id) => {
          const key = normalizeId(id);
          if (key) ids.add(key);
        });
      });
    }

    return ids;
  }

  function getCompletedQuizUnitIdList() {
    return toIdList(getCompletedQuizUnitIds());
  }

  function getCompletedQuizUnitCount() {
    return getCompletedQuizUnitIds().size;
  }

  function getMeritsByCategory() {
    const merits = readJSON(KEYS.MERITS_BY_CATEGORY, {});
    return merits && typeof merits === "object" ? merits : {};
  }

  function getFavoritePlaceIds() {
    try {
      const ids = global.HGFavoritePlaces?.getIds?.();
      if (Array.isArray(ids)) return new Set(ids.map(normalizeId).filter(Boolean));
    } catch {}
    return readProgressIdSet(KEYS.FAVORITE_PLACES);
  }

  function getFavoritePlaceIdList() {
    return toIdList(getFavoritePlaceIds());
  }

  function isFavoritePlace(placeId) {
    const id = normalizeId(placeId);
    return !!id && getFavoritePlaceIds().has(id);
  }

  function getMusicUnlockRows() {
    if (typeof global.HGAhaMusic?.getUnlockedMusicObjects === "function") {
      try {
        const rows = global.HGAhaMusic.getUnlockedMusicObjects();
        if (Array.isArray(rows)) return rows;
      } catch {}
    }
    return Object.values(readJSON(KEYS.MUSIC_UNLOCKS, {}));
  }

  function getMusicUnlockSummary() {
    if (typeof global.HGAhaMusic?.getMusicUnlockSummary === "function") {
      try {
        const summary = global.HGAhaMusic.getMusicUnlockSummary();
        if (summary && typeof summary === "object") return summary;
      } catch {}
    }

    const rows = getMusicUnlockRows();
    const places = new Set(rows.map((item) => normalizeId(item?.placeId)).filter(Boolean));
    return {
      total: rows.length,
      artists: rows.filter((item) => item?.type === "music_artist").length,
      tracks: rows.filter((item) => item?.type === "music_track").length,
      places: places.size
    };
  }

  function getUnlockState() {
    const unlocks = readJSON(KEYS.UNLOCKS, {});
    const byQuiz = unlocks?.byQuiz && typeof unlocks.byQuiz === "object" ? unlocks.byQuiz : {};
    const quizIds = Object.keys(byQuiz).map(normalizeId).filter(Boolean);
    return { raw: unlocks || {}, byQuiz, quizIds, visitedCount: quizIds.length };
  }

  function getGroundhopperStats() {
    const stats = readJSON(KEYS.GROUNDHOPPER_STATS, null);
    return stats && typeof stats === "object" ? stats : null;
  }

  function getPlaceProgressSummary(placeId, options = {}) {
    const id = normalizeId(placeId || options?.placeId);
    const category = normalizeId(options?.category);
    const visited = !!id && getVisitedPlaceIds().has(id);
    const quizCompleted = !!id && getCompletedQuizUnitIds().has(id);
    const favorite = !!id && isFavoritePlace(id);
    const merits = getMeritsByCategory();
    const meritInfo = category ? (merits[category] || null) : null;

    let status = "unknown";
    if (visited) status = "visited";
    if (quizCompleted) status = "quiz_completed";
    if (visited && quizCompleted) status = "completed";

    const nextAction = quizCompleted ? "completed" : (visited ? "quiz" : "open");

    return {
      placeId: id,
      category,
      visited,
      quizCompleted,
      favorite,
      status,
      nextAction,
      meritInfo
    };
  }

  function getProfileProgressSummary() {
    return {
      visitedPlaceIds: getVisitedPlaceIdList(),
      visitedPlaceCount: getVisitedPlaceIds().size,
      collectedPeopleIds: getCollectedPeopleIdList(),
      collectedPeopleCount: getCollectedPeopleIds().size,
      completedQuizUnitIds: getCompletedQuizUnitIdList(),
      completedQuizUnitCount: getCompletedQuizUnitCount(),
      favoritePlaceIds: getFavoritePlaceIdList(),
      favoritePlaceCount: getFavoritePlaceIds().size,
      meritsByCategory: getMeritsByCategory(),
      musicUnlockSummary: getMusicUnlockSummary(),
      unlockState: getUnlockState(),
      groundhopperStats: getGroundhopperStats()
    };
  }

  global.HGProfileProgressReader = {
    KEYS,
    normalizeId,
    readJSON,
    readProgressIdSet,
    getVisitedPlaceIds,
    getVisitedPlaceIdList,
    getCollectedPeopleIds,
    getCollectedPeopleIdList,
    getQuizHistory,
    getCompletedQuizUnitIds,
    getCompletedQuizUnitIdList,
    getCompletedQuizUnitCount,
    getMeritsByCategory,
    getFavoritePlaceIds,
    getFavoritePlaceIdList,
    isFavoritePlace,
    getMusicUnlockRows,
    getMusicUnlockSummary,
    getUnlockState,
    getGroundhopperStats,
    getPlaceProgressSummary,
    getProfileProgressSummary
  };
})(window);
