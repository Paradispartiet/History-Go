// ============================================================
// HISTORY GO – HGNavigator v2
// Bygger kontekstuell NextUp for sist åpne placeCard.
//
// Ny kontrakt:
// window.HGNavigator.buildForPlace(place, { nearbyPlaces, personsHere })
// -> {
//      current_place_id,
//      generated_at,
//      suggestions: [{ type, target_id, label, reason, score, source, href, meta }],
//      spatial, wk, narrative, concept // bakoverkompatibilitet
//    }
// ============================================================

(function () {
  "use strict";

  function s(value) {
    return String(value ?? "").trim();
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
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

  function findPlace(id) {
    const key = s(id);
    if (!key) return null;
    return arr(window.PLACES).find(p => placeId(p) === key) || null;
  }

  function getVisited() {
    try {
      const v = JSON.parse(localStorage.getItem("visited_places") || "{}");
      return v && typeof v === "object" ? v : {};
    } catch {
      return {};
    }
  }

  function getLearningLog() {
    try {
      const v = JSON.parse(localStorage.getItem("hg_learning_log_v1") || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  function getInsightsEvents() {
    try {
      const v = JSON.parse(localStorage.getItem("hg_insights_events_v1") || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  const MODE_KEY = "hg_nextup_mode_v1";
  const MODES = {
    nearest: { mode: "nearest", label: "Nærmest" },
    learn: { mode: "learn", label: "Lær mest" },
    story: { mode: "story", label: "Fortsett historien" },
    wonder: { mode: "wonder", label: "Oppdag noe rart" },
    complete: { mode: "complete", label: "Fullfør merket" }
  };

  function getNextUpHistory() {
    try {
      const v = JSON.parse(localStorage.getItem("hg_nextup_history_v1") || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  function getActivePathSummary() {
    try {
      const path = JSON.parse(localStorage.getItem("hg_active_path_v1") || "{}");
      return path?.summary && typeof path.summary === "object" ? path.summary : {};
    } catch {
      return {};
    }
  }

  function getQuizSets() {
    try {
      const v = JSON.parse(localStorage.getItem("hg_quiz_sets_v1") || "{}");
      return v && typeof v === "object" ? v : {};
    } catch {
      return {};
    }
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

  function emneIds(place) {
    return arr(place?.emne_ids).map(s).filter(Boolean);
  }

  function sharedEmneCount(a, b) {
    const aIds = new Set(emneIds(a));
    if (!aIds.size) return 0;
    return emneIds(b).filter(id => aIds.has(id)).length;
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
    const d = distanceFromCurrent(candidate);
    const sameCategory = categoryOf(candidate) === categoryOf(currentPlace);
    const shared = sharedEmneCount(currentPlace, candidate);
    const isVisited = !!visited[placeId(candidate)];
    const completed = hasAnyCompletedSetForPlace(candidate);

    let score = 30;

    if (Number.isFinite(d)) {
      score += clamp(35 - Math.round(d / 60), 0, 35);
    }

    if (sameCategory) score += 16;
    if (shared) score += Math.min(24, shared * 12);
    if (!isVisited) score += 14;
    if (!completed) score += 8;
    if (arr(window.WK_BY_PLACE?.[placeId(candidate)]).length) score += 4;

    return clamp(score, 0, 100);
  }

  function makeSuggestion({ type, target_id, label, reason, deep_reason = "", evidence = [], score, source, href = "", meta = {} }) {
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

  function buildSpatialReason(currentPlace, candidatePlace, meta = {}) {
    const distance = Number.isFinite(meta.distance_m) ? `${Math.round(meta.distance_m)} m` : "";
    const shared = Number(meta.shared_emne_count || 0);
    const sameCategory = !!meta.same_category;
    const unvisited = !!meta.unvisited;
    const quizIncomplete = !!meta.quiz_incomplete;
    const category = categoryOf(candidatePlace);

    const reason = shared
      ? `Deler ${shared} emne${shared === 1 ? "" : "r"} med dette stedet.`
      : "Nærliggende sted som passer videre i løypa.";

    const parts = [];
    if (distance) parts.push(`${placeLabel(candidatePlace)} ligger ${distance} unna`);
    else parts.push(`${placeLabel(candidatePlace)} ligger som et naturlig neste stopp`);
    if (sameCategory) parts.push(`og deler kategori (${category})`);
    if (shared > 0) parts.push(`med ${shared} felles emne${shared === 1 ? "" : "r"}`);
    if (unvisited) parts.push("Stedet er ubesøkt");
    if (quizIncomplete) parts.push("quizen der er ikke fullført");

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

  function buildWonderkammerReason(place, entry, meta = {}) {
    const count = Number(meta.chamber_count || 0);
    const title = s(entry?.title || entry?.label || entry?.name || "objekt");
    const entryType = s(entry?.type);
    const reason = "Dette stedet har Wonderkammer-innhold du kan åpne.";
    const deep_reason = `${placeLabel(place)} har ${count || "flere"} Wonderkammer-oppføring${count === 1 ? "" : "er"}, blant annet “${title}”${entryType ? ` (${entryType})` : ""}, knyttet til place_id ${placeId(place)}.`;
    return {
      reason,
      deep_reason,
      evidence: ["WK_BY_PLACE", "wonderkammer.entry", "place.id"]
    };
  }

  function buildNarrativeReason(story, nextPlace, direction, sourceType = "related_places", explicitReason = "") {
    const title = storyTitle(story);
    const summary = s(story?.summary);
    const sceneReason = s(explicitReason);
    const fallback = sourceType === "related_places"
      ? "Tematisk kobling via related_places, ikke eksplisitt neste scene."
      : direction === "reverse"
        ? "Omvendt kobling via eksplisitt next_scenes fra en annen story."
        : "Koblingen kommer via storyens stedsliste.";

    return {
      reason: sceneReason || (sourceType === "related_places"
        ? "Tematisk kobling til et relatert sted."
        : "Denne scenen følger en eksisterende fortelling."),
      deep_reason: `Forslaget følger historien “${title}”${summary ? `: ${summary}` : ""}. Neste sted er ${placeLabel(nextPlace)}${sceneReason ? ` fordi ${sceneReason}` : ` (${fallback})`}.`,
      evidence: ["story.next_scenes", "story.title", "story.place_id", "story.summary", "story.related_places"]
    };
  }

  function buildConceptReason(place, emneId, meta = {}) {
    const hits = Number(meta.hit_count || 0);
    const lowCoverage = !!meta.low_coverage;
    const angle = s(place?.quiz_profile?.primary_angles?.[0]);
    const reason = "Stedet er koblet til dette emnet.";
    const deep_reason = hits
      ? `Emnet ${emneId} går igjen på ${placeLabel(place)}${angle ? ` med vinkel “${angle}”` : ""}. Du har ${hits} treff i learning-log/insights${lowCoverage ? ", men dekningen er fortsatt lav" : ""}, så dette er et godt fordypningspunkt.`
      : `Emnet ${emneId} er koblet til ${placeLabel(place)}${angle ? ` og quiz-vinkelen “${angle}”` : ""}, men mangler treff i learning-log/insights. Derfor foreslås det for å bygge dekning tidlig.`;
    return {
      reason,
      deep_reason,
      evidence: ["place.emne_ids", "quiz_profile.primary_angles", "hg_learning_log_v1", "hg_insights_events_v1", "emne_coverage"]
    };
  }

  function buildSpatialSuggestion(currentPlace, nearbyPlaces = []) {
    const visited = getVisited();
    const candidates = getCandidatePlaces(currentPlace, nearbyPlaces)
      .map(place => ({
        place,
        d: distanceFromCurrent(place),
        score: scoreSpatialCandidate(currentPlace, place, visited)
      }))
      .sort((a, b) => b.score - a.score || a.d - b.d);

    const preferred = candidates[0];
    if (!preferred?.place) return null;

    const dText = Number.isFinite(preferred.d) ? `${Math.round(preferred.d)} m` : "";
    const shared = sharedEmneCount(currentPlace, preferred.place);

    const reasonMeta = buildSpatialReason(currentPlace, preferred.place, {
      distance_m: Number.isFinite(preferred.d) ? Math.round(preferred.d) : null,
      shared_emne_count: shared,
      same_category: categoryOf(preferred.place) === categoryOf(currentPlace),
      unvisited: !visited[placeId(preferred.place)],
      quiz_incomplete: !hasAnyCompletedSetForPlace(preferred.place)
    });

    return makeSuggestion({
      type: "spatial",
      target_id: placeId(preferred.place),
      label: dText ? `${placeLabel(preferred.place)} · ${dText}` : placeLabel(preferred.place),
      reason: reasonMeta.reason,
      deep_reason: reasonMeta.deep_reason,
      evidence: reasonMeta.evidence,
      score: preferred.score,
      source: "places",
      meta: {
        place_id: placeId(preferred.place),
        distance_m: Number.isFinite(preferred.d) ? Math.round(preferred.d) : null,
        shared_emne_count: shared,
        category_id: categoryOf(preferred.place)
      }
    });
  }

  function buildWonderkammerSuggestion(place) {
    const id = placeId(place);
    const chambers = arr(window.WK_BY_PLACE?.[id]);
    if (!chambers.length) return null;

    const first = chambers.find(c => s(c?.id || c?.entry_id || c?.title || c?.label || c?.name)) || chambers[0];
    const entryId = s(first?.id || first?.entry_id || first?.slug || first?.title || first?.label || "");
    const label = s(first?.title || first?.label || first?.name || entryId || "Wonderkammer");

    if (!entryId && !label) return null;

    const reasonMeta = buildWonderkammerReason(place, first, { chamber_count: chambers.length });

    return makeSuggestion({
      type: "wonderkammer",
      target_id: entryId || label,
      label,
      reason: reasonMeta.reason,
      deep_reason: reasonMeta.deep_reason,
      evidence: reasonMeta.evidence,
      score: clamp(68 + Math.min(20, chambers.length * 4), 0, 100),
      source: "wonderkammer",
      meta: {
        entry_id: entryId,
        place_id: id,
        chamber_count: chambers.length
      }
    });
  }

  function storyTitle(story) {
    return s(story?.title || story?.summary || "Neste scene");
  }

  function storyNextScenes(story) {
    return arr(story?.next_scenes)
      .map(sc => ({
        place_id: s(sc?.place_id || sc?.target_id || sc?.id),
        reason: s(sc?.reason)
      }))
      .filter(sc => sc.place_id);
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

  function nextSceneReason(story, nextId, direction) {
    const explicit = arr(story?.next_scenes)
      .find(sc => s(sc?.place_id || sc?.target_id || sc?.id) === s(nextId));

    if (explicit?.reason) return s(explicit.reason);

    return direction === "reverse"
      ? "En story et annet sted peker tilbake hit som relatert sted."
      : "Stories-systemet peker videre til et relatert sted.";
  }

  function makeNarrativeSuggestion(story, nextId, direction, source = "related_places", explicitReason = "") {
    const nextPlace = findPlace(nextId);
    if (!nextId || !nextPlace) return null;

    const base = source === "next_scenes" ? 90 : source === "next_places" ? 82 : source === "reverse_related" ? 66 : 70;
    const storyScore = Number(story?.score?.total || 0);

    const reasonMeta = buildNarrativeReason(story, nextPlace, direction, source, explicitReason);

    return makeSuggestion({
      type: "narrative",
      target_id: nextId,
      label: `${storyTitle(story)} → ${placeLabel(nextPlace)}`,
      reason: reasonMeta.reason,
      deep_reason: reasonMeta.deep_reason,
      evidence: reasonMeta.evidence,
      score: clamp(base + Math.min(18, Math.round(storyScore / 2)), 0, 100),
      source: "stories",
      meta: {
        next_place_id: nextId,
        story_id: s(story?.id),
        source_type: source,
        direction,
        story_type: s(story?.type)
      }
    });
  }

  function buildNarrativeSuggestion(place) {
    const currentId = placeId(place);
    if (!currentId || !window.HGStories) return null;

    try {
      if (typeof window.HGStories.getByPlace === "function") {
        const storiesHere = arr(window.HGStories.getByPlace(currentId));

        for (const story of storiesHere) {
          const explicit = storyNextScenes(story).find(sc => sc.place_id && sc.place_id !== currentId && findPlace(sc.place_id));
          if (explicit) {
            const result = makeNarrativeSuggestion(story, explicit.place_id, "direct", "next_scenes", explicit.reason);
            if (result) return result;
            continue;
          }
          const nextPlaceId = storyNextPlaces(story).find(id => id && id !== currentId && findPlace(id));
          if (nextPlaceId) {
            const result = makeNarrativeSuggestion(story, nextPlaceId, "direct", "next_places");
            if (result) return result;
            continue;
          }
          const relatedPlaceId = storyRelatedPlaces(story).find(id => id && id !== currentId && findPlace(id));
          const result = makeNarrativeSuggestion(story, relatedPlaceId, "direct", "related_places");
          if (result) return result;
        }
      }

      const allStories = arr(window.HGStories.all);
      for (const story of allStories) {
        const primaryPlaceId = s(story?.place_id);
        if (!primaryPlaceId || primaryPlaceId === currentId || !findPlace(primaryPlaceId)) continue;
        const backLink = storyNextScenes(story).find(sc => s(sc.place_id) === currentId);
        if (!backLink) continue;
        const result = makeNarrativeSuggestion(story, primaryPlaceId, "reverse", "reverse_related", backLink.reason);
        if (result) return result;
      }
    } catch (e) {
      if (window.DEBUG) console.warn("[HGNavigator] buildNarrativeSuggestion failed", e);
    }

    return null;
  }

  function countConceptHits(emneId) {
    const key = s(emneId);
    if (!key) return 0;

    const insightsHits = getInsightsEvents().filter(evt =>
      s(evt?.emne_id) === key ||
      arr(evt?.related_emner).map(s).includes(key)
    ).length;

    const learningHits = getLearningLog().filter(evt =>
      s(evt?.emne_id) === key ||
      arr(evt?.related_emner).map(s).includes(key) ||
      arr(evt?.correctAnswers).some(ans => s(ans?.emne_id) === key)
    ).length;

    return insightsHits + learningHits;
  }

  function conceptLabel(place, emneId) {
    const angle = s(place?.quiz_profile?.primary_angles?.[0]);
    const subtype = s(place?.quiz_profile?.subtype);
    return angle || subtype || emneId;
  }

  function readActiveMode() {
    try {
      const raw = JSON.parse(localStorage.getItem(MODE_KEY) || "{}");
      const mode = s(raw?.mode || "nearest");
      return MODES[mode] || MODES.nearest;
    } catch {
      return MODES.nearest;
    }
  }

  function buildConceptSuggestion(place) {
    const ids = emneIds(place);
    if (!ids.length) return null;

    const scored = ids.map(id => {
      const hits = countConceptHits(id);
      // Lav dekning får høyere prioritet, men helt ukjente emner beholdes høyt.
      const score = clamp(88 - Math.min(30, hits * 6), 45, 95);
      return { id, hits, score };
    }).sort((a, b) => b.score - a.score);

    const picked = scored[0];
    if (!picked) return null;

    const subject = categoryOf(place);
    const href = `knowledge/knowledge_${encodeURIComponent(subject)}.html#${encodeURIComponent(picked.id)}`;

    const reasonMeta = buildConceptReason(place, picked.id, {
      hit_count: picked.hits,
      low_coverage: picked.hits < 2
    });

    return makeSuggestion({
      type: "concept",
      target_id: picked.id,
      label: conceptLabel(place, picked.id),
      reason: reasonMeta.reason,
      deep_reason: reasonMeta.deep_reason,
      evidence: reasonMeta.evidence,
      score: picked.score,
      source: "knowledge",
      href,
      meta: {
        emne_id: picked.id,
        subject_id: subject,
        hit_count: picked.hits,
        place_id: placeId(place)
      }
    });
  }

  function toLegacyShape(suggestion) {
    if (!suggestion) return null;

    if (suggestion.type === "spatial") {
      return {
        place_id: suggestion.meta.place_id || suggestion.target_id,
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
        entry_id: suggestion.meta.entry_id || suggestion.target_id,
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
        next_place_id: suggestion.meta.next_place_id || suggestion.target_id,
        story_id: suggestion.meta.story_id || "",
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
        emne_id: suggestion.meta.emne_id || suggestion.target_id,
        subject_id: suggestion.meta.subject_id || "",
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

  function applyModeWeights(suggestion, mode, currentPlace) {
    if (!suggestion) return null;

    const clone = { ...suggestion, meta: { ...(suggestion.meta || {}) } };
    const categoryMatch = clone.meta?.category_id && categoryOf(currentPlace) === clone.meta.category_id;
    const incompleteBoost = clone.meta?.incomplete ? 25 : 0;

    if (mode === "nearest") {
      if (clone.type === "spatial") clone.score += 25;
      if (clone.type === "spatial" && Number.isFinite(clone.meta?.distance_m)) {
        clone.score += Math.max(0, 20 - Math.round(clone.meta.distance_m / 120));
      }
    }

    if (mode === "learn") {
      if (clone.type === "concept") clone.score += 30;
      if (clone.type === "concept") clone.score += Math.max(0, 15 - Math.min(15, Number(clone.meta?.hit_count || 0) * 3));
    }

    if (mode === "story") {
      if (clone.type === "narrative" && clone.meta?.story_id) clone.score += 35;
      if (clone.type === "narrative" && !clone.meta?.story_id) clone.score -= 30;
    }

    if (mode === "wonder") {
      if (clone.type === "wonderkammer") clone.score += 35;
    }

    if (mode === "complete") {
      if (clone.type === "quiz" || clone.type === "spatial") clone.score += incompleteBoost;
      if (categoryMatch) clone.score += 10;
      if (clone.type === "concept" && Number(clone.meta?.hit_count || 0) <= 1) clone.score += 6;
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
    const targetEmner = new Set([...(targetPlace?.emne_ids || []), s(clone.meta?.emne_id)].map(s).filter(Boolean));
    if (emneSet.size && Array.from(targetEmner).some(id => emneSet.has(id))) boost += 8;
    if (dominantType === "concept" && clone.type === "concept") boost += 6;
    if (dominantType === "narrative" && clone.type === "narrative") boost += 8;
    if (dominantType === "spatial" && clone.type === "spatial") boost += 5;
    boost = clamp(boost, 0, 12);
    clone.score = clamp(clone.score + boost, 0, 100);
    clone.meta.route_boost = boost;
    return clone;
  }

  async function buildForPlace(place, context = {}) {
    if (!place) return {};

    const nearbyPlaces = arr(context.nearbyPlaces);

    const spatialSuggestion = buildSpatialSuggestion(place, nearbyPlaces);
    const wkSuggestion = buildWonderkammerSuggestion(place);
    const narrativeSuggestion = buildNarrativeSuggestion(place);
    const conceptSuggestion = buildConceptSuggestion(place);

    const activeMode = readActiveMode();

    const suggestions = [
      spatialSuggestion,
      wkSuggestion,
      narrativeSuggestion,
      conceptSuggestion
    ].filter(Boolean)
      .map(sug => applyModeWeights(sug, activeMode.mode, place))
      .map(sug => applyRouteBoost(sug))
      .sort((a, b) => b.score - a.score);

    return {
      schema: "hg_nextup_v3",
      mode: activeMode,
      current_place_id: placeId(place),
      current_place_label: placeLabel(place),
      category_id: categoryOf(place),
      generated_at: new Date().toISOString(),
      suggestions,
      spatial: toLegacyShape(spatialSuggestion),
      wk: toLegacyShape(wkSuggestion),
      narrative: toLegacyShape(narrativeSuggestion),
      concept: toLegacyShape(conceptSuggestion)
    };
  }

  window.HGNavigator = {
    buildForPlace,
    _debug: {
      buildSpatialSuggestion,
      buildWonderkammerSuggestion,
      buildNarrativeSuggestion,
      buildConceptSuggestion,
      getNextUpHistory
    }
  };
})();
