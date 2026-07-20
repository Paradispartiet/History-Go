// ============================================================
// HISTORY GO – HGNavigator v4
// Candidate engine for contextual Next Up recommendations.
//
// Contract:
// window.HGNavigator.buildForPlace(place, { nearbyPlaces, personsHere })
// -> {
//      schema: "hg_nextup_v4",
//      current_place_id,
//      generated_at,
//      suggestions: [{ type, target_id, label, reason, score, source, href, meta }],
//      candidate_counts,
//      spatial, wk, narrative, concept // legacy compatibility
//    }
// ============================================================

(function () {
  "use strict";

  const MODE_KEY = "hg_nextup_mode_v1";
  const MAX_SUGGESTIONS = 12;
  const MAX_PER_TYPE = 3;
  const MODES = {
    nearest: { mode: "nearest", label: "Nærmest" },
    learn: { mode: "learn", label: "Lær mest" },
    story: { mode: "story", label: "Fortsett historien" },
    wonder: { mode: "wonder", label: "Oppdag noe rart" },
    complete: { mode: "complete", label: "Fullfør merket" }
  };

  function s(value) {
    return String(value ?? "").trim();
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "");
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function placeId(place) {
    return s(place?.id);
  }

  function placeLabel(place) {
    return s(place?.name) || placeId(place);
  }

  function categoryOf(place) {
    return s(place?.categoryId || place?.category || place?.subject_id || "by");
  }

  function emneIds(place) {
    return arr(place?.emne_ids).map(s).filter(Boolean);
  }

  function findPlace(id) {
    const key = s(id);
    if (!key) return null;
    return arr(window.PLACES).find(place => placeId(place) === key) || null;
  }

  function getVisited() {
    const value = readJSON("visited_places", {});
    return value && typeof value === "object" ? value : {};
  }

  function getLearningLog() {
    const value = readJSON("hg_learning_log_v1", []);
    return Array.isArray(value) ? value : [];
  }

  function getInsightsEvents() {
    const value = readJSON("hg_insights_events_v1", []);
    return Array.isArray(value) ? value : [];
  }

  function getNextUpHistory() {
    const value = readJSON("hg_nextup_history_v1", []);
    return Array.isArray(value) ? value : [];
  }

  function getActivePathSummary() {
    const path = readJSON("hg_active_path_v1", {});
    return path?.summary && typeof path.summary === "object" ? path.summary : {};
  }

  function getQuizSets() {
    const value = readJSON("hg_quiz_sets_v1", {});
    return value && typeof value === "object" ? value : {};
  }

  function hasAnyCompletedSetForPlace(place) {
    const id = placeId(place);
    if (!id) return false;

    const sets = getQuizSets();
    return Object.keys(sets).some(key => key.startsWith(`${id}::`) && !!sets[key]?.completed);
  }

  function distanceFromCurrent(place) {
    if (Number.isFinite(place?._d)) return Number(place._d);

    try {
      const pos = typeof window.getPos === "function" ? window.getPos() : null;
      if (!pos || typeof window.distMeters !== "function") return Infinity;
      if (place?.lat == null || place?.lon == null) return Infinity;
      return window.distMeters(pos, { lat: place.lat, lon: place.lon });
    } catch {
      return Infinity;
    }
  }

  function sharedEmneCount(a, b) {
    const ids = new Set(emneIds(a));
    if (!ids.size) return 0;
    return emneIds(b).filter(id => ids.has(id)).length;
  }

  function makeSuggestion({
    type,
    target_id,
    label,
    reason,
    deep_reason = "",
    evidence = [],
    score,
    source,
    href = "",
    meta = {}
  }) {
    const safeType = s(type);
    const safeTarget = s(target_id);
    const safeLabel = s(label);
    if (!safeType || !safeTarget || !safeLabel) return null;

    return {
      type: safeType,
      target_id: safeTarget,
      label: safeLabel,
      reason: s(reason),
      deep_reason: s(deep_reason),
      evidence: arr(evidence).map(s).filter(Boolean),
      score: clamp(Number(score) || 0, 0, 100),
      source: s(source),
      href: s(href),
      meta: meta && typeof meta === "object" ? meta : {}
    };
  }

  function getCandidatePlaces(currentPlace, nearbyPlaces = []) {
    const currentId = placeId(currentPlace);
    const seen = new Set();
    const out = [];

    const push = (place) => {
      const id = placeId(place);
      if (!id || id === currentId || seen.has(id)) return;
      seen.add(id);
      out.push(place);
    };

    arr(nearbyPlaces).forEach(push);
    arr(window.NEARBY_PLACES).forEach(push);
    arr(window.PLACES).forEach(push);
    return out;
  }

  function scoreSpatialCandidate(currentPlace, candidate, visited) {
    const distance = distanceFromCurrent(candidate);
    const sameCategory = categoryOf(candidate) === categoryOf(currentPlace);
    const shared = sharedEmneCount(currentPlace, candidate);
    const isVisited = !!visited[placeId(candidate)];
    const completed = hasAnyCompletedSetForPlace(candidate);

    let score = 24;

    if (Number.isFinite(distance)) {
      score += clamp(32 - Math.round(distance / 75), 0, 32);
    }

    if (sameCategory) score += 10;
    if (shared) score += Math.min(24, shared * 12);
    if (!isVisited) score += 12;
    if (!completed) score += 7;
    if (arr(window.WK_BY_PLACE?.[placeId(candidate)]).length) score += 3;

    return clamp(score, 0, 100);
  }

  function buildSpatialReason(currentPlace, candidatePlace, meta = {}) {
    const distance = Number.isFinite(meta.distance_m) ? `${Math.round(meta.distance_m)} m` : "";
    const shared = Number(meta.shared_emne_count || 0);
    const sameCategory = !!meta.same_category;
    const unvisited = !!meta.unvisited;
    const quizIncomplete = !!meta.quiz_incomplete;
    const category = categoryOf(candidatePlace);

    const reason = shared
      ? `Deler ${shared} emne${shared === 1 ? "" : "r"} med dette stedet.`
      : distance
        ? `Et relevant stopp ${distance} unna.`
        : "Et relevant sted som passer videre i utforskingen.";

    const parts = [];
    if (distance) parts.push(`${placeLabel(candidatePlace)} ligger ${distance} unna`);
    else parts.push(`${placeLabel(candidatePlace)} er et mulig neste stopp`);
    if (sameCategory) parts.push(`samme kategori (${category})`);
    if (shared > 0) parts.push(`${shared} felles emne${shared === 1 ? "" : "r"}`);
    if (unvisited) parts.push("ubesøkt");
    if (quizIncomplete) parts.push("har ufullført quizprogresjon");

    return {
      reason,
      deep_reason: `${parts.join(", ")}.`,
      evidence: [
        "distance_m",
        "place.categoryId",
        "place.emne_ids",
        "visited_places",
        "hg_quiz_sets_v1"
      ]
    };
  }

  function buildSpatialCandidates(currentPlace, nearbyPlaces = [], limit = 12) {
    const visited = getVisited();

    return getCandidatePlaces(currentPlace, nearbyPlaces)
      .map(candidate => {
        const distance = distanceFromCurrent(candidate);
        const shared = sharedEmneCount(currentPlace, candidate);
        const quizIncomplete = !hasAnyCompletedSetForPlace(candidate);
        const meta = {
          place_id: placeId(candidate),
          distance_m: Number.isFinite(distance) ? Math.round(distance) : null,
          shared_emne_count: shared,
          category_id: categoryOf(candidate),
          same_category: categoryOf(candidate) === categoryOf(currentPlace),
          unvisited: !visited[placeId(candidate)],
          quiz_incomplete: quizIncomplete,
          incomplete: quizIncomplete
        };
        const reasonMeta = buildSpatialReason(currentPlace, candidate, meta);
        const distanceText = Number.isFinite(distance) ? `${Math.round(distance)} m` : "";

        return makeSuggestion({
          type: "spatial",
          target_id: placeId(candidate),
          label: distanceText ? `${placeLabel(candidate)} · ${distanceText}` : placeLabel(candidate),
          reason: reasonMeta.reason,
          deep_reason: reasonMeta.deep_reason,
          evidence: reasonMeta.evidence,
          score: scoreSpatialCandidate(currentPlace, candidate, visited),
          source: "places",
          meta
        });
      })
      .filter(Boolean)
      .sort((a, b) =>
        b.score - a.score ||
        Number(a.meta?.distance_m ?? Infinity) - Number(b.meta?.distance_m ?? Infinity)
      )
      .slice(0, limit);
  }

  function buildWonderkammerReason(place, entry, meta = {}) {
    const count = Number(meta.chamber_count || 0);
    const title = s(entry?.title || entry?.label || entry?.name || "objekt");
    const entryType = s(entry?.type);

    return {
      reason: "Et Wonderkammer-funn er knyttet direkte til dette stedet.",
      deep_reason: `${placeLabel(place)} har ${count || "flere"} Wonderkammer-oppføring${count === 1 ? "" : "er"}, blant annet “${title}”${entryType ? ` (${entryType})` : ""}.`,
      evidence: ["WK_BY_PLACE", "wonderkammer.entry", "place.id"]
    };
  }

  function buildWonderkammerCandidates(place, limit = 8) {
    const id = placeId(place);
    const chambers = arr(window.WK_BY_PLACE?.[id]);
    const seen = new Set();

    return chambers
      .map((entry, index) => {
        const entryId = s(entry?.id || entry?.entry_id || entry?.slug || entry?.title || entry?.label || entry?.name);
        const label = s(entry?.title || entry?.label || entry?.name || entryId || "Wonderkammer");
        const key = entryId || label;
        if (!key || seen.has(key)) return null;
        seen.add(key);

        const reasonMeta = buildWonderkammerReason(place, entry, {
          chamber_count: chambers.length
        });

        return makeSuggestion({
          type: "wonderkammer",
          target_id: key,
          label,
          reason: reasonMeta.reason,
          deep_reason: reasonMeta.deep_reason,
          evidence: reasonMeta.evidence,
          score: clamp(70 + Math.min(12, chambers.length * 2) - Math.min(10, index * 2), 0, 100),
          source: "wonderkammer",
          meta: {
            entry_id: entryId || key,
            place_id: id,
            chamber_count: chambers.length,
            entry_index: index,
            entry_type: s(entry?.type)
          }
        });
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function storyTitle(story) {
    return s(story?.title || story?.summary || "Neste scene");
  }

  function storyNextScenes(story) {
    return arr(story?.next_scenes)
      .map(scene => ({
        place_id: s(scene?.place_id || scene?.target_id || scene?.id),
        reason: s(scene?.reason)
      }))
      .filter(scene => scene.place_id);
  }

  function storyNextPlaces(story) {
    return arr(story?.next_places).map(s).filter(Boolean);
  }

  function storyRelatedPlaces(story) {
    return [
      ...arr(story?.related_places),
      ...arr(story?.place_ids),
      ...arr(story?.places)
    ].map(s).filter(Boolean);
  }

  function buildNarrativeReason(story, nextPlace, direction, sourceType = "related_places", explicitReason = "") {
    const title = storyTitle(story);
    const summary = s(story?.summary);
    const sceneReason = s(explicitReason);
    const fallback = sourceType === "related_places"
      ? "tematisk kobling"
      : direction === "reverse"
        ? "omvendt kobling fra en eksplisitt neste scene"
        : "kobling i storyens stedsliste";

    return {
      reason: sceneReason || (sourceType === "next_scenes"
        ? "Denne scenen følger eksplisitt videre i fortellingen."
        : sourceType === "next_places"
          ? "Fortellingen peker videre til dette stedet."
          : "Tematisk kobling til et relatert sted."),
      deep_reason: `Forslaget følger historien “${title}”${summary ? `: ${summary}` : ""}. Neste sted er ${placeLabel(nextPlace)}${sceneReason ? ` fordi ${sceneReason}` : ` via ${fallback}`}.`,
      evidence: ["story.next_scenes", "story.next_places", "story.related_places", "story.title", "story.place_id"]
    };
  }

  function makeNarrativeSuggestion(story, nextId, direction, sourceType = "related_places", explicitReason = "") {
    const nextPlace = findPlace(nextId);
    if (!nextId || !nextPlace) return null;

    const base = sourceType === "next_scenes"
      ? 90
      : sourceType === "next_places"
        ? 82
        : sourceType === "reverse_related"
          ? 64
          : 70;
    const storyScore = Number(story?.score?.total || 0);
    const reasonMeta = buildNarrativeReason(story, nextPlace, direction, sourceType, explicitReason);

    return makeSuggestion({
      type: "narrative",
      target_id: nextId,
      label: `${storyTitle(story)} → ${placeLabel(nextPlace)}`,
      reason: reasonMeta.reason,
      deep_reason: reasonMeta.deep_reason,
      evidence: reasonMeta.evidence,
      score: clamp(base + Math.min(10, Math.round(storyScore / 3)), 0, 100),
      source: "stories",
      meta: {
        next_place_id: nextId,
        story_id: s(story?.id),
        source_type: sourceType,
        direction,
        story_type: s(story?.type),
        place_id: nextId,
        category_id: categoryOf(nextPlace)
      }
    });
  }

  function buildNarrativeCandidates(place, limit = 10) {
    const currentId = placeId(place);
    if (!currentId || !window.HGStories) return [];

    const candidates = [];
    const pushStoryTargets = (story, direction = "direct") => {
      storyNextScenes(story).forEach(scene => {
        if (!scene.place_id || scene.place_id === currentId) return;
        const suggestion = makeNarrativeSuggestion(story, scene.place_id, direction, "next_scenes", scene.reason);
        if (suggestion) candidates.push(suggestion);
      });

      storyNextPlaces(story).forEach(nextId => {
        if (!nextId || nextId === currentId) return;
        const suggestion = makeNarrativeSuggestion(story, nextId, direction, "next_places");
        if (suggestion) candidates.push(suggestion);
      });

      storyRelatedPlaces(story).forEach(nextId => {
        if (!nextId || nextId === currentId) return;
        const suggestion = makeNarrativeSuggestion(story, nextId, direction, "related_places");
        if (suggestion) candidates.push(suggestion);
      });
    };

    try {
      if (typeof window.HGStories.getByPlace === "function") {
        arr(window.HGStories.getByPlace(currentId)).forEach(story => pushStoryTargets(story, "direct"));
      }

      arr(window.HGStories.all).forEach(story => {
        const primaryPlaceId = s(story?.place_id);
        if (!primaryPlaceId || primaryPlaceId === currentId || !findPlace(primaryPlaceId)) return;

        storyNextScenes(story)
          .filter(scene => scene.place_id === currentId)
          .forEach(scene => {
            const suggestion = makeNarrativeSuggestion(story, primaryPlaceId, "reverse", "reverse_related", scene.reason);
            if (suggestion) candidates.push(suggestion);
          });
      });
    } catch (error) {
      if (window.DEBUG) console.warn("[HGNavigator] buildNarrativeCandidates failed", error);
    }

    return dedupeSuggestions(candidates)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function countConceptHits(emneId) {
    const key = s(emneId);
    if (!key) return 0;

    const insightsHits = getInsightsEvents().filter(event =>
      s(event?.emne_id) === key ||
      arr(event?.related_emner).map(s).includes(key)
    ).length;

    const learningHits = getLearningLog().filter(event =>
      s(event?.emne_id) === key ||
      arr(event?.related_emner).map(s).includes(key) ||
      arr(event?.correctAnswers).some(answer => s(answer?.emne_id) === key)
    ).length;

    return insightsHits + learningHits;
  }

  function conceptLabel(place, emneId) {
    const primaryAngles = arr(place?.quiz_profile?.primary_angles).map(s).filter(Boolean);
    const subtype = s(place?.quiz_profile?.subtype);
    const index = Math.max(0, emneIds(place).indexOf(emneId));
    return primaryAngles[index] || primaryAngles[0] || subtype || emneId;
  }

  function buildConceptReason(place, emneId, meta = {}) {
    const hits = Number(meta.hit_count || 0);
    const lowCoverage = !!meta.low_coverage;
    const angle = s(place?.quiz_profile?.primary_angles?.[0]);

    return {
      reason: lowCoverage
        ? "Et relevant kunnskapshull ved dette stedet."
        : "Et sentralt emne ved stedet som kan utdypes.",
      deep_reason: hits
        ? `Emnet ${emneId} går igjen på ${placeLabel(place)}${angle ? ` med vinkelen “${angle}”` : ""}. Du har ${hits} registrerte treff${lowCoverage ? ", men dekningen er fortsatt lav" : ""}.`
        : `Emnet ${emneId} er koblet til ${placeLabel(place)}${angle ? ` og quiz-vinkelen “${angle}”` : ""}, men mangler registrerte læringstreff.`,
      evidence: ["place.emne_ids", "quiz_profile.primary_angles", "hg_learning_log_v1", "hg_insights_events_v1"]
    };
  }

  function buildConceptCandidates(place, limit = 8) {
    const subject = categoryOf(place);

    return emneIds(place)
      .map((emneId, index) => {
        const hits = countConceptHits(emneId);
        const score = clamp(90 - Math.min(36, hits * 6) - Math.min(6, index * 2), 48, 94);
        const reasonMeta = buildConceptReason(place, emneId, {
          hit_count: hits,
          low_coverage: hits < 2
        });

        return makeSuggestion({
          type: "concept",
          target_id: emneId,
          label: conceptLabel(place, emneId),
          reason: reasonMeta.reason,
          deep_reason: reasonMeta.deep_reason,
          evidence: reasonMeta.evidence,
          score,
          source: "knowledge",
          href: `knowledge/knowledge_${encodeURIComponent(subject)}.html#${encodeURIComponent(emneId)}`,
          meta: {
            emne_id: emneId,
            subject_id: subject,
            hit_count: hits,
            low_coverage: hits < 2,
            place_id: placeId(place),
            emne_index: index
          }
        });
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function readActiveMode() {
    const raw = readJSON(MODE_KEY, {});
    const mode = s(raw?.mode || "nearest");
    return MODES[mode] || MODES.nearest;
  }

  function applyModeWeights(suggestion, mode, currentPlace) {
    if (!suggestion) return null;

    const clone = { ...suggestion, meta: { ...(suggestion.meta || {}) } };
    const categoryMatch = clone.meta?.category_id && categoryOf(currentPlace) === clone.meta.category_id;

    if (mode === "nearest" && clone.type === "spatial") {
      clone.score += 16;
      if (Number.isFinite(clone.meta?.distance_m)) {
        clone.score += Math.max(0, 12 - Math.round(clone.meta.distance_m / 180));
      }
    }

    if (mode === "learn") {
      if (clone.type === "concept") clone.score += 20;
      if (clone.type === "narrative") clone.score += 4;
      if (clone.type === "concept") {
        clone.score += Math.max(0, 8 - Math.min(8, Number(clone.meta?.hit_count || 0) * 2));
      }
    }

    if (mode === "story" && clone.type === "narrative") {
      clone.score += clone.meta?.story_id ? 24 : 8;
    }

    if (mode === "wonder" && clone.type === "wonderkammer") {
      clone.score += 24;
    }

    if (mode === "complete") {
      if (clone.meta?.incomplete) clone.score += 16;
      if (clone.type === "spatial" && categoryMatch) clone.score += 8;
      if (clone.type === "concept" && Number(clone.meta?.hit_count || 0) <= 1) clone.score += 8;
    }

    clone.score = clamp(clone.score, 0, 100);
    clone.meta.mode = mode;
    return clone;
  }

  function applyRouteBoost(suggestion) {
    if (!suggestion) return null;

    const clone = { ...suggestion, meta: { ...(suggestion.meta || {}) } };
    const summary = getActivePathSummary();
    const emneSet = new Set(arr(summary?.emne_ids).map(s).filter(Boolean));
    const dominantType = s(arr(summary?.dominant_types)[0]);
    let boost = 0;

    const targetPlace = findPlace(clone.meta?.place_id || clone.meta?.next_place_id || clone.target_id);
    const targetEmner = new Set([
      ...arr(targetPlace?.emne_ids),
      s(clone.meta?.emne_id)
    ].map(s).filter(Boolean));

    if (emneSet.size && Array.from(targetEmner).some(id => emneSet.has(id))) boost += 8;
    if (dominantType === "concept" && clone.type === "concept") boost += 6;
    if (dominantType === "narrative" && clone.type === "narrative") boost += 8;
    if (dominantType === "spatial" && clone.type === "spatial") boost += 5;

    boost = clamp(boost, 0, 12);
    clone.score = clamp(clone.score + boost, 0, 100);
    clone.meta.route_boost = boost;
    return clone;
  }

  function dedupeSuggestions(suggestions = []) {
    const bestByKey = new Map();

    arr(suggestions).filter(Boolean).forEach(suggestion => {
      const key = `${s(suggestion.type)}::${s(suggestion.target_id)}`;
      if (!s(suggestion.type) || !s(suggestion.target_id)) return;
      const existing = bestByKey.get(key);
      if (!existing || Number(suggestion.score || 0) > Number(existing.score || 0)) {
        bestByKey.set(key, suggestion);
      }
    });

    return Array.from(bestByKey.values());
  }

  function selectRankedSuggestions(suggestions = [], limit = MAX_SUGGESTIONS) {
    const typeCounts = new Map();
    const selected = [];

    dedupeSuggestions(suggestions)
      .sort((a, b) => b.score - a.score)
      .forEach(suggestion => {
        if (selected.length >= limit) return;
        const type = s(suggestion.type);
        const count = typeCounts.get(type) || 0;
        if (count >= MAX_PER_TYPE) return;
        typeCounts.set(type, count + 1);
        selected.push(suggestion);
      });

    return selected;
  }

  function bestOfType(suggestions, type) {
    return arr(suggestions).find(suggestion => suggestion?.type === type) || null;
  }

  function toLegacyShape(suggestion) {
    if (!suggestion) return null;

    if (suggestion.type === "spatial") {
      return {
        place_id: suggestion.meta?.place_id || suggestion.target_id,
        label: suggestion.label,
        because: suggestion.reason,
        deep_reason: suggestion.deep_reason,
        evidence: suggestion.evidence,
        score: suggestion.score,
        source: suggestion.source
      };
    }

    if (suggestion.type === "wonderkammer") {
      return {
        entry_id: suggestion.meta?.entry_id || suggestion.target_id,
        label: suggestion.label,
        because: suggestion.reason,
        deep_reason: suggestion.deep_reason,
        evidence: suggestion.evidence,
        score: suggestion.score,
        source: suggestion.source
      };
    }

    if (suggestion.type === "narrative") {
      return {
        next_place_id: suggestion.meta?.next_place_id || suggestion.target_id,
        story_id: suggestion.meta?.story_id || "",
        label: suggestion.label,
        because: suggestion.reason,
        deep_reason: suggestion.deep_reason,
        evidence: suggestion.evidence,
        score: suggestion.score,
        source: suggestion.source
      };
    }

    if (suggestion.type === "concept") {
      return {
        emne_id: suggestion.meta?.emne_id || suggestion.target_id,
        subject_id: suggestion.meta?.subject_id || "",
        knowledge_href: suggestion.href,
        label: suggestion.label,
        because: suggestion.reason,
        deep_reason: suggestion.deep_reason,
        evidence: suggestion.evidence,
        score: suggestion.score,
        source: suggestion.source
      };
    }

    return null;
  }

  async function buildForPlace(place, context = {}) {
    if (!place) return {};

    const activeMode = readActiveMode();
    const sourceCandidates = {
      spatial: buildSpatialCandidates(place, arr(context.nearbyPlaces)),
      wonderkammer: buildWonderkammerCandidates(place),
      narrative: buildNarrativeCandidates(place),
      concept: buildConceptCandidates(place)
    };

    const allCandidates = Object.values(sourceCandidates)
      .flat()
      .map(suggestion => applyModeWeights(suggestion, activeMode.mode, place))
      .map(applyRouteBoost)
      .filter(Boolean);

    const suggestions = selectRankedSuggestions(allCandidates);
    const bestSpatial = bestOfType(suggestions, "spatial") || sourceCandidates.spatial[0] || null;
    const bestWonder = bestOfType(suggestions, "wonderkammer") || sourceCandidates.wonderkammer[0] || null;
    const bestNarrative = bestOfType(suggestions, "narrative") || sourceCandidates.narrative[0] || null;
    const bestConcept = bestOfType(suggestions, "concept") || sourceCandidates.concept[0] || null;

    return {
      schema: "hg_nextup_v4",
      mode: activeMode,
      current_place_id: placeId(place),
      current_place_label: placeLabel(place),
      category_id: categoryOf(place),
      generated_at: new Date().toISOString(),
      candidate_counts: Object.fromEntries(
        Object.entries(sourceCandidates).map(([type, values]) => [type, values.length])
      ),
      suggestions,
      spatial: toLegacyShape(bestSpatial),
      wk: toLegacyShape(bestWonder),
      narrative: toLegacyShape(bestNarrative),
      concept: toLegacyShape(bestConcept)
    };
  }

  function first(builder) {
    return (...args) => builder(...args)[0] || null;
  }

  window.HGNavigator = {
    buildForPlace,
    _debug: {
      buildSpatialSuggestion: first(buildSpatialCandidates),
      buildWonderkammerSuggestion: first(buildWonderkammerCandidates),
      buildNarrativeSuggestion: first(buildNarrativeCandidates),
      buildConceptSuggestion: first(buildConceptCandidates),
      buildSpatialCandidates,
      buildWonderkammerCandidates,
      buildNarrativeCandidates,
      buildConceptCandidates,
      dedupeSuggestions,
      selectRankedSuggestions,
      getNextUpHistory
    }
  };
})();
