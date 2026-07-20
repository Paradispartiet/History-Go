// ============================================================
// HISTORY GO – NextUp progression candidates
// Adds actionable quiz and badge-progress candidates to HGNavigator v4.
// ============================================================
(function () {
  "use strict";

  const TRI_KEY = "hg_nextup_tri";
  const BECAUSE_KEY = "hg_nextup_because";
  const HISTORY_KEY = "hg_nextup_history_v1";
  const HANDLED_TYPES = new Set(["quiz", "badge"]);
  const MAX_TARGETS = 9;
  const MAX_SUGGESTIONS = 12;
  const MAX_PER_TYPE = 3;

  function s(value) {
    return String(value ?? "").trim();
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function placeId(place) {
    return s(place?.id);
  }

  function placeLabel(place) {
    return s(place?.name) || placeId(place);
  }

  function runtimeCategoryId(value) {
    const raw = s(value);
    if (!raw) return "";
    try {
      return s(window.DomainRegistry?.toRuntimeCategoryId?.(raw)) || raw;
    } catch {
      return raw === "popkultur" ? "populaerkultur" : raw;
    }
  }

  function categoryOf(place) {
    return runtimeCategoryId(place?.categoryId || place?.category || place?.subject_id || "by");
  }

  function findPlace(id) {
    const key = s(id);
    if (!key) return null;
    return arr(window.PLACES).find(place => placeId(place) === key) || null;
  }

  function visitedSet() {
    try {
      const fromReader = window.HGProfileProgressReader?.getVisitedPlaceIds?.();
      if (fromReader instanceof Set) return fromReader;
    } catch {}

    const raw = readJSON("visited_places", {});
    if (Array.isArray(raw)) return new Set(raw.map(s).filter(Boolean));
    if (raw && typeof raw === "object") {
      return new Set(Object.entries(raw).filter(([, value]) => !!value).map(([id]) => s(id)).filter(Boolean));
    }
    return new Set();
  }

  function meritsByCategory() {
    try {
      const merits = window.HGProfileProgressReader?.getMeritsByCategory?.();
      if (merits && typeof merits === "object") return merits;
    } catch {}
    const merits = readJSON("merits_by_category", {});
    return merits && typeof merits === "object" ? merits : {};
  }

  function makeSuggestion({ type, target_id, label, reason, deep_reason = "", evidence = [], score = 0, source, meta = {} }) {
    if (!s(type) || !s(target_id) || !s(label)) return null;
    return {
      type: s(type),
      target_id: s(target_id),
      label: s(label),
      reason: s(reason),
      deep_reason: s(deep_reason),
      evidence: arr(evidence).map(s).filter(Boolean),
      score: clamp(score, 0, 100),
      source: s(source),
      href: "",
      meta: meta && typeof meta === "object" ? meta : {}
    };
  }

  function candidateTargetIds(currentPlace, tri) {
    const ids = [];
    const seen = new Set();
    const push = (id) => {
      const key = s(id);
      if (!key || seen.has(key)) return;
      seen.add(key);
      ids.push(key);
    };

    push(placeId(currentPlace));
    arr(tri?.suggestions)
      .filter(item => s(item?.type) === "spatial")
      .forEach(item => push(item?.meta?.place_id || item?.target_id));
    arr(window.NEARBY_PLACES).forEach(place => push(placeId(place)));

    return ids.slice(0, MAX_TARGETS);
  }

  function spatialScoreForTarget(tri, targetId) {
    const match = arr(tri?.suggestions).find(item =>
      s(item?.type) === "spatial" && s(item?.meta?.place_id || item?.target_id) === s(targetId)
    );
    return Number(match?.score || 0);
  }

  async function buildQuizCandidates(currentPlace, tri) {
    if (typeof window.QuizEngine?.getTargetSummary !== "function") return [];

    const currentId = placeId(currentPlace);
    const visited = visitedSet();
    const mode = s(tri?.mode?.mode);
    const ids = candidateTargetIds(currentPlace, tri);

    const rows = await Promise.all(ids.map(async (targetId) => {
      try {
        const summary = await window.QuizEngine.getTargetSummary(targetId);
        if (!summary?.hasAny || summary?.isComplete) return null;

        const place = findPlace(targetId);
        const remaining = Math.max(1, Number(summary?.remainingSets || 1));
        const completed = Math.max(0, Number(summary?.completedSets || 0));
        const total = Math.max(1, Number(summary?.totalSets || remaining));
        const isCurrent = targetId === currentId;
        const continuation = completed > 0;
        const spatialScore = spatialScoreForTarget(tri, targetId);

        let score = isCurrent ? 90 : 62 + Math.min(16, Math.round(spatialScore / 6));
        if (continuation) score += 12;
        if (remaining === 1) score += 7;
        if (visited.has(targetId)) score += 5;
        if (mode === "complete") score += 18;

        const name = placeLabel(place) || targetId;
        const setText = remaining === 1 ? "1 sett igjen" : `${remaining} sett igjen`;
        const label = continuation
          ? `${name} · Fortsett · ${setText}`
          : `${name} · ${setText}`;

        return makeSuggestion({
          type: "quiz",
          target_id: targetId,
          label,
          reason: continuation
            ? `Du har allerede begynt på quizen her og har ${setText}.`
            : `Denne quizen er ikke fullført og gir progresjon i ${categoryOf(place) || "merket"}.`,
          deep_reason: `${name} har ${total} quizsett. ${completed} er fullført og ${remaining} gjenstår.`,
          evidence: ["QuizEngine.getTargetSummary", "hg_quiz_sets_v1", "quiz_progress"],
          score,
          source: "quiz-progress",
          meta: {
            quiz_target_id: targetId,
            place_id: targetId,
            category_id: categoryOf(place),
            completed_sets: completed,
            remaining_sets: remaining,
            total_sets: total,
            incomplete: true,
            continuation
          }
        });
      } catch {
        return null;
      }
    }));

    return rows.filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 4);
  }

  async function getBadges() {
    if (Array.isArray(window.BADGES) && window.BADGES.length) return window.BADGES;
    try {
      const badges = await window.HGBadges?.ensureBadgesLoaded?.();
      if (Array.isArray(badges)) return badges;
    } catch {}
    return Array.isArray(window.BADGES) ? window.BADGES : [];
  }

  function nextTierForBadge(badge, points) {
    return arr(badge?.tiers)
      .map(tier => ({ ...tier, threshold: Number(tier?.threshold || 0) }))
      .filter(tier => tier.threshold > Number(points || 0))
      .sort((a, b) => a.threshold - b.threshold)[0] || null;
  }

  function categoryActionPlaces(currentPlace, tri) {
    const visited = visitedSet();
    const places = [];
    const seen = new Set();
    const push = (place) => {
      const id = placeId(place);
      if (!id || seen.has(id)) return;
      seen.add(id);
      places.push(place);
    };

    arr(tri?.suggestions)
      .filter(item => s(item?.type) === "spatial")
      .map(item => findPlace(item?.meta?.place_id || item?.target_id))
      .filter(Boolean)
      .forEach(push);
    arr(window.NEARBY_PLACES).forEach(push);
    arr(window.PLACES).filter(place => !visited.has(placeId(place))).slice(0, 30).forEach(push);
    push(currentPlace);

    return places;
  }

  async function buildBadgeCandidates(currentPlace, tri) {
    const badges = await getBadges();
    if (!badges.length) return [];

    const merits = meritsByCategory();
    const currentCategory = categoryOf(currentPlace);
    const mode = s(tri?.mode?.mode);
    const actionPlaces = categoryActionPlaces(currentPlace, tri);
    const categories = [];
    const seenCategories = new Set();
    const pushCategory = (value) => {
      const category = runtimeCategoryId(value);
      if (!category || seenCategories.has(category)) return;
      seenCategories.add(category);
      categories.push(category);
    };

    pushCategory(currentCategory);
    actionPlaces.forEach(place => pushCategory(categoryOf(place)));

    return categories.slice(0, 8).map(category => {
      const badge = badges.find(item => runtimeCategoryId(item?.id) === category);
      if (!badge) return null;

      const points = Number(merits?.[category]?.points || 0);
      const tier = nextTierForBadge(badge, points);
      if (!tier) return null;

      const actionPlace = actionPlaces.find(place => categoryOf(place) === category && placeId(place) !== placeId(currentPlace))
        || actionPlaces.find(place => categoryOf(place) === category)
        || null;
      if (!actionPlace) return null;

      const remaining = Math.max(1, Number(tier.threshold) - points);
      let score = 64;
      if (category === currentCategory) score += 14;
      score += Math.max(0, 14 - Math.min(14, remaining * 2));
      if (mode === "complete") score += 20;
      if (!visitedSet().has(placeId(actionPlace))) score += 4;

      const badgeName = s(badge?.name || badge?.title || badge?.id || category);
      const tierLabel = s(tier?.label || "neste nivå");
      const actionName = placeLabel(actionPlace);

      return makeSuggestion({
        type: "badge",
        target_id: `${category}:${placeId(actionPlace)}`,
        label: `${badgeName}: ${remaining} poeng til ${tierLabel} · ${actionName}`,
        reason: `Dette stedet er et konkret neste steg mot ${tierLabel} i ${badgeName}.`,
        deep_reason: `Du har ${points} poeng i ${badgeName}. Neste nivå krever ${tier.threshold}, altså ${remaining} poeng til.`,
        evidence: ["merits_by_category", "BADGES.tiers", "place.category"],
        score,
        source: "badge-progress",
        meta: {
          badge_id: category,
          badge_name: badgeName,
          tier_label: tierLabel,
          current_points: points,
          next_threshold: Number(tier.threshold),
          points_remaining: remaining,
          place_id: placeId(actionPlace),
          category_id: category,
          incomplete: true
        }
      });
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 3);
  }

  function localSelect(suggestions) {
    const best = new Map();
    arr(suggestions).forEach(item => {
      if (!item) return;
      const key = `${s(item.type)}::${s(item.target_id)}`;
      if (!key || key === "::") return;
      const previous = best.get(key);
      if (!previous || Number(item.score || 0) > Number(previous.score || 0)) best.set(key, item);
    });

    const counts = {};
    const out = [];
    Array.from(best.values()).sort((a, b) => Number(b.score || 0) - Number(a.score || 0)).forEach(item => {
      const type = s(item.type);
      if ((counts[type] || 0) >= MAX_PER_TYPE || out.length >= MAX_SUGGESTIONS) return;
      counts[type] = (counts[type] || 0) + 1;
      out.push(item);
    });
    return out;
  }

  async function buildProgressionCandidates(currentPlace, tri) {
    const [quiz, badge] = await Promise.all([
      buildQuizCandidates(currentPlace, tri),
      buildBadgeCandidates(currentPlace, tri)
    ]);
    return { quiz, badge, all: [...quiz, ...badge] };
  }

  function historyWeighted(candidate, originalDebug) {
    try {
      return originalDebug?.applyHistoryWeights?.(candidate) || candidate;
    } catch {
      return candidate;
    }
  }

  function installNavigatorPatch() {
    const navigator = window.HGNavigator;
    if (!navigator || typeof navigator.buildForPlace !== "function") return false;
    if (navigator.__nextUpProgressionPatched) return true;

    const originalBuild = navigator.buildForPlace.bind(navigator);
    const originalDebug = navigator._debug || {};

    navigator.buildForPlace = async function buildForPlaceWithProgression(place, context = {}) {
      const tri = await originalBuild(place, context) || {};
      const progression = await buildProgressionCandidates(place, tri);
      const weighted = progression.all.map(candidate => historyWeighted(candidate, originalDebug));
      const selector = originalDebug.selectRankedSuggestions;
      const merged = typeof selector === "function"
        ? selector([...(arr(tri.suggestions)), ...weighted])
        : localSelect([...(arr(tri.suggestions)), ...weighted]);

      return {
        ...tri,
        schema: "hg_nextup_v4_progression",
        candidate_counts: {
          ...(tri.candidate_counts || {}),
          quiz: progression.quiz.length,
          badge: progression.badge.length
        },
        suggestions: merged
      };
    };

    navigator._debug = {
      ...originalDebug,
      buildQuizProgressionCandidates: buildQuizCandidates,
      buildBadgeProgressionCandidates: buildBadgeCandidates,
      buildProgressionCandidates
    };
    navigator.__nextUpProgressionPatched = true;
    return true;
  }

  function appendClickHistory(suggestion, tri) {
    const history = readJSON(HISTORY_KEY, []);
    const next = [{
      ts: Date.now(),
      iso: new Date().toISOString(),
      event: "click",
      place_id: s(tri?.current_place_id),
      type: s(suggestion?.type),
      target_id: s(suggestion?.target_id),
      label: s(suggestion?.label),
      score: Number(suggestion?.score || 0),
      source: s(suggestion?.source),
      reason: s(suggestion?.reason),
      deep_reason: s(suggestion?.deep_reason),
      evidence: arr(suggestion?.evidence)
    }, ...(Array.isArray(history) ? history : [])].slice(0, 200);
    writeJSON(HISTORY_KEY, next);
  }

  function handleProgressionSuggestion(suggestion) {
    const type = s(suggestion?.type);
    if (type === "quiz") {
      const targetId = s(suggestion?.meta?.quiz_target_id || suggestion?.meta?.place_id || suggestion?.target_id);
      if (!targetId) return false;
      if (window.HGMapView?.openQuiz?.(targetId)) return true;
      if (typeof window.QuizEngine?.start === "function") {
        void window.QuizEngine.start(targetId);
        return true;
      }
      return false;
    }

    if (type === "badge") {
      const targetId = s(suggestion?.meta?.place_id);
      if (!targetId) return false;
      if (window.HGMapView?.openPlace?.(targetId)) return true;
      const place = findPlace(targetId);
      if (place && typeof window.openPlaceCard === "function") {
        void window.openPlaceCard(place);
        return true;
      }
    }

    return false;
  }

  function findRenderedProgressionSuggestion(button, type) {
    const tri = readJSON(TRI_KEY, {});
    const label = s(button?.querySelector?.("span")?.textContent);
    const suggestion = arr(tri?.suggestions).find(item =>
      s(item?.type) === type && (!label || s(item?.label) === label)
    );
    return { tri, suggestion };
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    const button = target?.closest?.("#footerNextUpPanel [data-nextup-index]");
    if (!button) return;
    const line = button.closest("[data-nextup-type]");
    const type = s(line?.dataset?.nextupType);
    if (!HANDLED_TYPES.has(type)) return;

    const { tri, suggestion } = findRenderedProgressionSuggestion(button, type);
    if (!suggestion) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    appendClickHistory(suggestion, tri);
    try { window.appendNextUpPathStep?.(suggestion, { tri }); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    handleProgressionSuggestion(suggestion);
  }, true);

  function rebuildCurrentTri() {
    const tri = readJSON(TRI_KEY, {});
    const place = findPlace(tri?.current_place_id);
    if (!place || typeof window.HGNavigator?.buildForPlace !== "function") return;

    Promise.resolve(window.HGNavigator.buildForPlace(place, { nearbyPlaces: window.NEARBY_PLACES || [] }))
      .then(nextTri => {
        if (!nextTri) return;
        writeJSON(TRI_KEY, nextTri);
        try {
          window.dispatchEvent(new CustomEvent("hg:mpNextUp", {
            detail: {
              tri: nextTri,
              becauseLine: localStorage.getItem(BECAUSE_KEY) || ""
            }
          }));
        } catch {}
      })
      .catch(() => {});
  }

  function ensureInstalled(attempt = 0) {
    if (installNavigatorPatch()) {
      rebuildCurrentTri();
      return;
    }
    if (attempt >= 80) return;
    window.setTimeout(() => ensureInstalled(attempt + 1), 25);
  }

  window.HGNextUpProgression = {
    install: installNavigatorPatch,
    buildQuizCandidates,
    buildBadgeCandidates,
    buildProgressionCandidates,
    handleSuggestion: handleProgressionSuggestion,
    _debug: { localSelect, candidateTargetIds, nextTierForBadge }
  };

  ensureInstalled();
})();
