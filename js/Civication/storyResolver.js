// ============================================================
// js/Civication/storyResolver.js
// History Go / Civication
// Resolver historiske story flags fra faktisk spillerdata
// ============================================================

(function () {
  "use strict";

  const LS_STORY_STATE = "hg_story_state_v1";
  const STORY_MANIFEST_URL = "data/Civication/storyThreads/st_manifest.json";

  let THREADS_CACHE = null;
  let CATALOG_CACHE = {
    places: null,
    people: null
  };

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function readLS(key, fallback) {
    return safeParse(localStorage.getItem(key), fallback);
  }

  function writeLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uniq(arr) {
    return Array.from(new Set((Array.isArray(arr) ? arr : []).filter(Boolean)));
  }

  function normStr(v) {
    return String(v || "").trim();
  }

  function normLower(v) {
    return normStr(v).toLowerCase();
  }

  function tokenizeText(text) {
    return normLower(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9æøå]+/gi, " ")
      .split(/\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function toLowerSet(arr) {
    return new Set(
      (Array.isArray(arr) ? arr : [])
        .map(normLower)
        .filter(Boolean)
    );
  }

  function intersectCount(a, b) {
    const aSet = toLowerSet(a);
    const bSet = toLowerSet(b);

    let count = 0;
    for (const v of aSet) {
      if (bSet.has(v)) count += 1;
    }
    return count;
  }

  function hasAll(requiredValues, actualValues) {
    const req = Array.isArray(requiredValues) ? requiredValues : [];
    if (!req.length) return true;

    const actual = toLowerSet(actualValues);
    return req.every(v => actual.has(normLower(v)));
  }

  function getUnlockState() {
    const unlocks = readLS("hg_unlocks_v1", {});
    const byQuiz =
      unlocks && typeof unlocks === "object" && unlocks.byQuiz && typeof unlocks.byQuiz === "object"
        ? unlocks.byQuiz
        : {};

    const unlockIds = uniq(
      Object.keys(byQuiz)
        .map(normStr)
        .filter(Boolean)
    );

    return {
      raw: unlocks,
      byQuiz,
      unlockIds
    };
  }

  async function ensureCatalogsLoaded() {
    if (
      Array.isArray(CATALOG_CACHE.places) &&
      Array.isArray(CATALOG_CACHE.people)
    ) {
      return CATALOG_CACHE;
    }

    const globalPlaces = Array.isArray(window.PLACES) ? window.PLACES : null;
    const globalPeople = Array.isArray(window.PEOPLE) ? window.PEOPLE : null;

    if (globalPlaces && globalPeople) {
      CATALOG_CACHE.places = globalPlaces;
      CATALOG_CACHE.people = globalPeople;
      return CATALOG_CACHE;
    }

    const out = {
      places: globalPlaces || [],
      people: globalPeople || []
    };

    try {
      if (window.DataHub?.loadPlacesBase) {
        const places = await window.DataHub.loadPlacesBase();
        if (Array.isArray(places)) out.places = places;
      } else if (window.DataHub?.loadPlaces) {
        const places = await window.DataHub.loadPlaces();
        if (Array.isArray(places)) out.places = places;
      }
    } catch {}

    try {
      if (window.DataHub?.loadPeopleBase) {
        const people = await window.DataHub.loadPeopleBase();
        if (Array.isArray(people)) out.people = people;
      } else if (window.DataHub?.loadPeople) {
        const people = await window.DataHub.loadPeople();
        if (Array.isArray(people)) out.people = people;
      }
    } catch {}

    CATALOG_CACHE = out;
    return out;
  }

  function collectVisitedPlaceIds(unlockIds, places) {
    const placeIds = new Set(
      (Array.isArray(places) ? places : [])
        .map(p => normStr(p && p.id))
        .filter(Boolean)
    );

    if (!placeIds.size) return [];
    return unlockIds.filter(id => placeIds.has(id));
  }

  function collectUnlockedPeopleIds(unlockIds, people) {
    const peopleIds = new Set(
      (Array.isArray(people) ? people : [])
        .map(p => normStr(p && p.id))
        .filter(Boolean)
    );

    if (!peopleIds.size) return [];
    return unlockIds.filter(id => peopleIds.has(id));
  }

  function collectQuizCategoryIds() {
    const hist = readLS("quiz_history", []);
    if (!Array.isArray(hist)) return [];

    return uniq(
      hist
        .map(h => normStr(h && h.categoryId))
        .filter(Boolean)
    );
  }

  function collectMeritCategoryIds() {
    const merits = readLS("merits_by_category", {});
    if (!merits || typeof merits !== "object") return [];

    return uniq(
      Object.keys(merits)
        .map(normStr)
        .filter(Boolean)
    );
  }

  function collectMeritPointsByCategory() {
    const merits = readLS("merits_by_category", {});
    const out = {};

    if (!merits || typeof merits !== "object") return out;

    for (const key of Object.keys(merits)) {
      out[key] = Number(merits[key]?.points || 0);
    }

    return out;
  }

  function collectKnowledgeTopics() {
    const uni = readLS("knowledge_universe", {});
    const out = [];

    if (!uni || typeof uni !== "object") return [];

    for (const cat of Object.keys(uni)) {
      const dims = uni[cat];
      if (!dims || typeof dims !== "object") continue;

      for (const dim of Object.keys(dims)) {
        const items = Array.isArray(dims[dim]) ? dims[dim] : [];

        for (const item of items) {
          const topic = normStr(item && item.topic);
          const text = normStr(item && item.text);

          if (topic) out.push(topic);
          if (text) out.push(...tokenizeText(text));
        }
      }
    }

    return uniq(out.map(normLower).filter(Boolean));
  }

  function collectLearningConcepts() {
    const log = readLS("hg_learning_log_v1", []);
    if (!Array.isArray(log)) return [];

    const out = [];

    for (const evt of log) {
      const concepts = Array.isArray(evt?.concepts) ? evt.concepts : [];
      for (const c of concepts) {
        const v = normStr(c);
        if (v) out.push(v);
      }
    }

    return uniq(out.map(normLower).filter(Boolean));
  }

  function collectLearningEmner() {
    const log = readLS("hg_learning_log_v1", []);
    if (!Array.isArray(log)) return [];

    const out = [];

    for (const evt of log) {
      const emner = Array.isArray(evt?.related_emner) ? evt.related_emner : [];
      for (const id of emner) {
        const v = normStr(id);
        if (v) out.push(v);
      }
    }

    return uniq(out.map(normLower).filter(Boolean));
  }

  async function buildSnapshot() {
    const { unlockIds } = getUnlockState();
    const catalogs = await ensureCatalogsLoaded();

    const visitedPlaceIds = collectVisitedPlaceIds(unlockIds, catalogs.places);
    const unlockedPeopleIds = collectUnlockedPeopleIds(unlockIds, catalogs.people);
    const quizCategoryIds = collectQuizCategoryIds();
    const meritCategoryIds = collectMeritCategoryIds();

    const categoryIds = uniq(
      quizCategoryIds.concat(meritCategoryIds).map(normStr).filter(Boolean)
    );

    return {
      unlock_ids: unlockIds,
      visited_place_ids: visitedPlaceIds,
      unlocked_people_ids: unlockedPeopleIds,
      category_ids: categoryIds,
      merit_points_by_category: collectMeritPointsByCategory(),
      knowledge_topics: collectKnowledgeTopics(),
      learning_concepts: collectLearningConcepts(),
      emne_hits: collectLearningEmner()
    };
  }

  // ------------------------------------------------------------
  // Story threads
  // ------------------------------------------------------------

async function loadThreads(force = false) {
  if (THREADS_CACHE && !force) return THREADS_CACHE;

  const manifestRes = await fetch(STORY_MANIFEST_URL, { cache: "no-store" });
  if (!manifestRes.ok) {
    throw new Error(`Could not load ${STORY_MANIFEST_URL} (${manifestRes.status})`);
  }

  const manifest = await manifestRes.json();
  const files = Array.isArray(manifest?.files) ? manifest.files : [];

  const allThreads = [];

  for (const url of files) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Could not load ${url} (${res.status})`);
    }

    const json = await res.json();
    const threads = Array.isArray(json?.threads) ? json.threads : [];
    allThreads.push(...threads);
  }

  THREADS_CACHE = allThreads;
  return allThreads;
}

  function evaluateRequired(thread, snapshot) {
    const req = thread?.required || {};

    const okUnlocks = hasAll(req.unlock_ids, snapshot.unlock_ids);
    const okPlaces = hasAll(req.places, snapshot.visited_place_ids);
    const okPeople = hasAll(req.people, snapshot.unlocked_people_ids);
    const okCategories = hasAll(req.categories, snapshot.category_ids);

    return okUnlocks && okPlaces && okPeople && okCategories;
  }

  function evaluateDerived(thread, snapshot) {
    const derived = thread?.derived_from || {};

    const knowledgeReq = Array.isArray(derived.knowledge_topics)
      ? derived.knowledge_topics
      : [];

    const emneReq = Array.isArray(derived.emner)
      ? derived.emner
      : [];

    const conceptReq = Array.isArray(derived.learning_concepts)
      ? derived.learning_concepts
      : [];

    const meritReq = derived.min_merit_points && typeof derived.min_merit_points === "object"
      ? derived.min_merit_points
      : {};

    const knowledgeHits = intersectCount(knowledgeReq, snapshot.knowledge_topics);
    const emneHits = intersectCount(emneReq, snapshot.emne_hits);
    const conceptHits = intersectCount(conceptReq, snapshot.learning_concepts);

    let meritOk = true;
    for (const categoryId of Object.keys(meritReq)) {
      const need = Number(meritReq[categoryId] || 0);
      const have = Number(snapshot.merit_points_by_category?.[categoryId] || 0);
      if (have < need) {
        meritOk = false;
        break;
      }
    }

    const minimumMatches = Number(
      derived.minimum_matches ??
      ((knowledgeReq.length || emneReq.length || conceptReq.length) ? 1 : 0)
    );

    const totalMatches = knowledgeHits + emneHits + conceptHits;
    const contentOk = totalMatches >= minimumMatches;

    return {
      ok: meritOk && contentOk,
      knowledgeHits,
      emneHits,
      conceptHits,
      meritOk,
      totalMatches
    };
  }

  function scoreThread(thread, snapshot, derivedResult) {
    const priority = Number(thread?.priority || 0);
    const tagCount = Array.isArray(thread?.tags) ? thread.tags.length : 0;

    const categoryOverlap = intersectCount(thread?.careers || [], snapshot.category_ids);

    return (
      priority * 100 +
      derivedResult.totalMatches * 10 +
      categoryOverlap * 5 +
      tagCount
    );
  }

  function materializeThread(thread, snapshot, derivedResult) {
    return {
      id: normStr(thread.id),
      title: normStr(thread.title),
      summary: normStr(thread.summary),
      tags: uniq((Array.isArray(thread.tags) ? thread.tags : []).map(normLower)),
      careers: uniq((Array.isArray(thread.careers) ? thread.careers : []).map(normStr)),
      score: scoreThread(thread, snapshot, derivedResult),
      priority: Number(thread?.priority || 0),
      evidence: {
        required: thread?.required || {},
        derived_from: thread?.derived_from || {},
        matches: {
          knowledge_topics: derivedResult.knowledgeHits,
          emner: derivedResult.emneHits,
          learning_concepts: derivedResult.conceptHits
        }
      }
    };
  }

  function resolveFromThreads(threads, snapshot) {
    const activeThreads = [];

    for (const thread of (Array.isArray(threads) ? threads : [])) {
      if (!thread || !thread.id) continue;

      const requiredOk = evaluateRequired(thread, snapshot);
      if (!requiredOk) continue;

      const derivedResult = evaluateDerived(thread, snapshot);
      if (!derivedResult.ok) continue;

      activeThreads.push(materializeThread(thread, snapshot, derivedResult));
    }

    activeThreads.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.id.localeCompare(b.id);
    });

    const storyFlags = activeThreads.map(t => `thread_${t.id}`);
    const storyTags = uniq(activeThreads.flatMap(t => t.tags || []));

    return {
      story_flags: storyFlags,
      story_tags: storyTags,
      threads: activeThreads
    };
  }

  // ------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------

  function getState() {
  if (window.__HG_STORY_STATE_MEM__) {
    return window.__HG_STORY_STATE_MEM__;
  }

  const saved = readLS(LS_STORY_STATE, {
    generated_at: null,
    story_flags: [],
    story_tags: [],
    thread_ids: []
  });

  return {
    generated_at: saved?.generated_at || null,
    snapshot: null,
    story_flags: Array.isArray(saved?.story_flags) ? saved.story_flags : [],
    story_tags: Array.isArray(saved?.story_tags) ? saved.story_tags : [],
    threads: []
  };
}

  function saveState(state) {
  const full = {
    generated_at: new Date().toISOString(),
    snapshot: state?.snapshot || null,
    story_flags: Array.isArray(state?.story_flags) ? state.story_flags : [],
    story_tags: Array.isArray(state?.story_tags) ? state.story_tags : [],
    threads: Array.isArray(state?.threads) ? state.threads : []
  };

  const light = {
    generated_at: full.generated_at,
    story_flags: full.story_flags,
    story_tags: full.story_tags,
    thread_ids: full.threads.map(t => t?.id).filter(Boolean)
  };

  window.__HG_STORY_STATE_MEM__ = full;

  try {
    writeLS(LS_STORY_STATE, light);
  } catch (e) {
    console.warn("Could not persist hg_story_state_v1", e);
  }

  return full;
}

  async function refresh(opts = {}) {
    const threads = await loadThreads(!!opts.forceThreads);
    const snapshot = await buildSnapshot();
    const resolved = resolveFromThreads(threads, snapshot);

    const state = saveState({
      snapshot,
      story_flags: resolved.story_flags,
      story_tags: resolved.story_tags,
      threads: resolved.threads
    });

    return state;
  }

  async function init(opts = {}) {
    const existing = getState();
    if (existing?.generated_at && !opts.force) {
      return existing;
    }

    return refresh(opts);
  }

  function clearState() {
    localStorage.removeItem(LS_STORY_STATE);
  }

  function hasFlag(flag) {
    const wanted = normStr(flag);
    if (!wanted) return false;

    return getState().story_flags.includes(wanted);
  }

  function getFlags() {
    return Array.isArray(getState().story_flags)
      ? getState().story_flags
      : [];
  }

  function getTags() {
    return Array.isArray(getState().story_tags)
      ? getState().story_tags
      : [];
  }

  function getThreads() {
    return Array.isArray(getState().threads)
      ? getState().threads
      : [];
  }

  window.CiviStoryResolver = {
    init,
    refresh,
    loadThreads,
    buildSnapshot,
    getState,
    getFlags,
    getTags,
    getThreads,
    hasFlag,
    clearState
  };
})();
