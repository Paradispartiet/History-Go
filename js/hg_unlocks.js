// js/hg_unlocks.js
// ------------------------------------------------------------
// HGUnlocks v1 — samler "unlock" fra quiz (chips/begreper/tenkere/hooks)
// Lagrer kun det som faktisk var riktig (du kaller recordFromQuiz kun ved correct).
// Ingen ny “kilde”, bare en logg du kan bruke i UI.
// ------------------------------------------------------------

(function () {
  "use strict";

  const KEY = "hg_unlocks_v1";
  const PLACE_COLLECTION_KEY = "places_collected";
  const NEXTUP_TRI_KEY = "hg_nextup_tri";
  const NEXTUP_PENDING_SCHEMA = "hg_nextup_pending_v1";
  const nextUpTriByPlace = new Map();

  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function load() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!x || typeof x !== "object") return {};
      return x;
    } catch {
      return {};
    }
  }

  function save(x) {
    try {
      localStorage.setItem(KEY, JSON.stringify(x));
    } catch {}
  }

  function loadCollectedPlaces() {
    try {
      const x = JSON.parse(localStorage.getItem(PLACE_COLLECTION_KEY) || "{}");
      if (!x || typeof x !== "object" || Array.isArray(x)) return {};
      return x;
    } catch {
      return {};
    }
  }

  function recordCollectedPlace(placeId, source = "quiz") {
    const id = normId(placeId);
    if (!id) return false;

    const collected = loadCollectedPlaces();
    if (collected[id]) return false;

    collected[id] = {
      source: normId(source) || "quiz",
      ts: Date.now()
    };

    try {
      localStorage.setItem(PLACE_COLLECTION_KEY, JSON.stringify(collected));
      dispatchProfileUpdate();
      return true;
    } catch {
      return false;
    }
  }

  function asArr(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x.filter(Boolean).map(String);
    return [String(x)];
  }

  function uniqPush(arr, values) {
    const set = new Set(Array.isArray(arr) ? arr : []);
    asArr(values).forEach((v) => {
      const s = String(v || "").trim();
      if (s) set.add(s);
    });
    return Array.from(set);
  }

  function normId(s) {
    return String(s || "").trim();
  }

  function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function readNextUpTri() {
    try {
      const parsed = JSON.parse(localStorage.getItem(NEXTUP_TRI_KEY) || "null");
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function currentPlaceCardId() {
    return normId(document.getElementById("placeCard")?.dataset?.currentPlaceId);
  }

  function isPendingNextUpTri(tri) {
    return isRecord(tri) && normId(tri.schema) === NEXTUP_PENDING_SCHEMA;
  }

  function isResolvedNextUpTri(tri) {
    if (!isRecord(tri) || isPendingNextUpTri(tri)) return false;
    const schema = normId(tri.schema);
    return schema.startsWith("hg_nextup_v4") ||
      Array.isArray(tri.suggestions) ||
      !!(tri.spatial || tri.wk || tri.narrative || tri.concept);
  }

  function triPlaceId(tri) {
    return normId(isRecord(tri) ? tri.current_place_id : "");
  }

  function cacheResolvedNextUpTri(tri, fallbackPlaceId = "") {
    if (!isResolvedNextUpTri(tri)) return null;
    const placeId = triPlaceId(tri) || normId(fallbackPlaceId);
    if (!placeId) return null;
    const normalized = triPlaceId(tri) === placeId
      ? tri
      : { ...tri, current_place_id: placeId };
    nextUpTriByPlace.set(placeId, normalized);
    return normalized;
  }

  function preservedNextUpTriForPlace(placeId) {
    const id = normId(placeId);
    if (!id) return null;

    // localStorage is the source of truth for the currently displayed place.
    // This matters after a mode change, because nextUpRuntime rebuilds directly
    // and persists the newer tri without emitting hg:mpNextUp again.
    const stored = readNextUpTri();
    if (isResolvedNextUpTri(stored) && triPlaceId(stored) === id) {
      nextUpTriByPlace.set(id, stored);
      return stored;
    }

    const cached = nextUpTriByPlace.get(id);
    return isResolvedNextUpTri(cached) ? cached : null;
  }

  function makePendingNextUpTri(placeId) {
    return {
      schema: NEXTUP_PENDING_SCHEMA,
      current_place_id: normId(placeId),
      generated_at: new Date().toISOString(),
      pending: true,
      candidate_counts: {},
      suggestions: []
    };
  }

  // PlaceCard åpnes progressivt. Etter første NextUp-bygg kan fullPlace/natur/
  // sosial-data åpne det samme kortet på nytt. place-card.js sender da tri:null,
  // samtidig som nav-Settet bevisst hindrer et nytt kandidatbygg. Uten denne
  // vakten overskriver nextUpRuntime den ferdige tri-en med {}, og bare den
  // globale historiske ruten blir stående. Bevar derfor siste ferdige tri per
  // sted; på første åpning brukes kun en ikke-destruktiv pending-tri frem til
  // HGNavigator leverer kandidatene.
  function preserveNextUpTriEvent(event) {
    const detail = event?.detail;
    if (!isRecord(detail)) return null;

    const currentPlaceId = currentPlaceCardId();
    const incoming = detail.tri;

    if (isResolvedNextUpTri(incoming)) {
      const incomingPlaceId = triPlaceId(incoming);

      // Ta vare på en ferdig tri selv om et sent async-resultat kommer etter at
      // brukeren har skiftet sted, men vis aldri forslag fra feil sted.
      if (incomingPlaceId) cacheResolvedNextUpTri(incoming, incomingPlaceId);
      if (currentPlaceId && incomingPlaceId && incomingPlaceId !== currentPlaceId) {
        const recovered = preservedNextUpTriForPlace(currentPlaceId);
        detail.tri = recovered || makePendingNextUpTri(currentPlaceId);
        return detail.tri;
      }

      const normalized = cacheResolvedNextUpTri(incoming, currentPlaceId);
      if (normalized) detail.tri = normalized;
      return detail.tri || null;
    }

    if (!currentPlaceId) return incoming || null;

    const recovered = preservedNextUpTriForPlace(currentPlaceId);
    if (recovered) {
      detail.tri = recovered;
      return recovered;
    }

    const pending = makePendingNextUpTri(currentPlaceId);
    detail.tri = pending;
    return pending;
  }

  function recordFromQuiz({ quizId, categoryId, item, targetId }) {
    const db = load();

    const qid = normId(quizId || targetId || item?.quiz_id || item?.id || "unknown");
    const cat = normId(categoryId || item?.categoryId || item?.category_id || item?.category || "");

    db.byQuiz = db.byQuiz || {};
    const rowWasNew = !db.byQuiz[qid];
    db.byQuiz[qid] = db.byQuiz[qid] || {
      quizId: qid,
      categoryId: cat || null,
      ts_first: Date.now(),
      ts_last: Date.now(),
      hooks: [],
      concepts: [],
      thinkers: [],
      knowledge_ids: [],
      trivia_ids: [],
      emne_ids: []
    };

    const row = db.byQuiz[qid];
    let categoryChanged = false;
    if (!row.categoryId && cat) {
      row.categoryId = cat;
      categoryChanged = true;
    }

    const hooks = item?.topic_hook || item?.topic_hooks || item?.hook || item?.hooks || item?.emne_hook || item?.topicHook || "";
    const concepts = item?.core_concepts || item?.concepts || item?.keywords || "";
    const thinkers = item?.thinkers || item?.canon_thinkers || item?.canon?.thinkers || item?.canonThinkers || "";
    const knowledgeIds = item?.knowledge_ids || item?.knowledgeIds || item?.knowledge || [];
    const triviaIds = item?.trivia_ids || item?.triviaIds || item?.trivia || [];
    const emneIds = item?.emne_id || item?.emneId || item?.emne_ids || item?.related_emner || item?.relatedEmner || [];

    const nextHooks = uniqPush(row.hooks, hooks);
    const nextConcepts = uniqPush(row.concepts, concepts);
    const nextThinkers = uniqPush(row.thinkers, thinkers);
    const nextKnowledgeIds = uniqPush(row.knowledge_ids, knowledgeIds);
    const nextTriviaIds = uniqPush(row.trivia_ids, triviaIds);
    const nextEmneIds = uniqPush(row.emne_ids, emneIds);

    const metadataChanged =
      nextHooks.length !== row.hooks.length ||
      nextConcepts.length !== row.concepts.length ||
      nextThinkers.length !== row.thinkers.length ||
      nextKnowledgeIds.length !== row.knowledge_ids.length ||
      nextTriviaIds.length !== row.trivia_ids.length ||
      nextEmneIds.length !== row.emne_ids.length;

    row.hooks = nextHooks;
    row.concepts = nextConcepts;
    row.thinkers = nextThinkers;
    row.knowledge_ids = nextKnowledgeIds;
    row.trivia_ids = nextTriviaIds;
    row.emne_ids = nextEmneIds;

    db.index = db.index || { hooks: [], concepts: [], thinkers: [] };
    const beforeIndexHooks = Array.isArray(db.index.hooks) ? db.index.hooks.length : 0;
    const beforeIndexConcepts = Array.isArray(db.index.concepts) ? db.index.concepts.length : 0;
    const beforeIndexThinkers = Array.isArray(db.index.thinkers) ? db.index.thinkers.length : 0;
    db.index.hooks = uniqPush(db.index.hooks, row.hooks);
    db.index.concepts = uniqPush(db.index.concepts, row.concepts);
    db.index.thinkers = uniqPush(db.index.thinkers, row.thinkers);
    const indexChanged =
      db.index.hooks.length !== beforeIndexHooks ||
      db.index.concepts.length !== beforeIndexConcepts ||
      db.index.thinkers.length !== beforeIndexThinkers;

    const changed = rowWasNew || categoryChanged || metadataChanged || indexChanged;
    if (changed) {
      row.ts_last = Date.now();
      save(db);
      dispatchProfileUpdate();
    }

    try { window.dispatchEvent(new CustomEvent("hg:unlocks")); } catch {}
  }

  window.HGUnlocks = {
    key: KEY,
    placeCollectionKey: PLACE_COLLECTION_KEY,
    nextUpTriKey: NEXTUP_TRI_KEY,
    load,
    loadCollectedPlaces,
    recordCollectedPlace,
    recordFromQuiz,
    preserveNextUpTriEvent,
    getPreservedNextUpTri: preservedNextUpTriForPlace
  };

  // Capture-fasen gjør kontrakten robust selv om nextUpRuntime/core-card-listenere
  // registreres i en annen rekkefølge senere.
  window.addEventListener("hg:mpNextUp", preserveNextUpTriEvent, true);

  window.addEventListener("hg:target-unlock", (event) => {
    const detail = /** @type {CustomEvent} */ (event).detail || {};
    if (detail?.kind !== "place") return;
    recordCollectedPlace(detail.id, "quiz");
  });

  if (!document.querySelector('script[data-hg-nextup-progression="1"]')) {
    const script = document.createElement("script");
    script.src = "js/nextUpProgression.js";
    script.async = true;
    script.dataset.hgNextupProgression = "1";
    script.onerror = () => {
      if (window.DEBUG) console.warn("[HGUnlocks] could not load NextUp progression extension");
    };
    document.head.appendChild(script);
  }

  if (!document.querySelector('script[data-hg-nextup-core-cards="1"]')) {
    const script = document.createElement("script");
    script.src = "js/nextUpCoreCards.js";
    script.async = true;
    script.dataset.hgNextupCoreCards = "1";
    script.onerror = () => {
      if (window.DEBUG) console.warn("[HGUnlocks] could not load NextUp core cards bridge");
    };
    document.head.appendChild(script);
  }
})();
