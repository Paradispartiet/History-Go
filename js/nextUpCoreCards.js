// ============================================================
// HISTORY GO – NextUp core cards bridge
// Guarantees the four original core suggestions remain visible even when
// HGNavigator v4/progression adds a ranked suggestions array.
// ============================================================
(function () {
  "use strict";

  const TRI_KEY = "hg_nextup_tri";
  const CORE_TYPES = ["spatial", "wonderkammer", "narrative", "concept"];

  function s(value) {
    return String(value ?? "").trim();
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

  function legacyCoreSuggestions(tri) {
    const out = [];

    if (tri?.spatial?.place_id) {
      out.push({
        type: "spatial",
        target_id: s(tri.spatial.place_id),
        label: s(tri.spatial.label),
        reason: s(tri.spatial.because),
        deep_reason: s(tri.spatial.deep_reason),
        evidence: Array.isArray(tri.spatial.evidence) ? tri.spatial.evidence : [],
        score: Number(tri.spatial.score || 60),
        source: s(tri.spatial.source || "places"),
        href: "",
        meta: { place_id: s(tri.spatial.place_id), core_card: true }
      });
    }

    if (tri?.wk?.entry_id) {
      out.push({
        type: "wonderkammer",
        target_id: s(tri.wk.entry_id),
        label: s(tri.wk.label),
        reason: s(tri.wk.because),
        deep_reason: s(tri.wk.deep_reason),
        evidence: Array.isArray(tri.wk.evidence) ? tri.wk.evidence : [],
        score: Number(tri.wk.score || 55),
        source: s(tri.wk.source || "wonderkammer"),
        href: "",
        meta: { entry_id: s(tri.wk.entry_id), core_card: true }
      });
    }

    if (tri?.narrative?.next_place_id) {
      out.push({
        type: "narrative",
        target_id: s(tri.narrative.next_place_id),
        label: s(tri.narrative.label),
        reason: s(tri.narrative.because),
        deep_reason: s(tri.narrative.deep_reason),
        evidence: Array.isArray(tri.narrative.evidence) ? tri.narrative.evidence : [],
        score: Number(tri.narrative.score || 70),
        source: s(tri.narrative.source || "stories"),
        href: "",
        meta: {
          next_place_id: s(tri.narrative.next_place_id),
          story_id: s(tri.narrative.story_id),
          core_card: true
        }
      });
    }

    if (tri?.concept?.emne_id) {
      out.push({
        type: "concept",
        target_id: s(tri.concept.emne_id),
        label: s(tri.concept.label),
        reason: s(tri.concept.because),
        deep_reason: s(tri.concept.deep_reason),
        evidence: Array.isArray(tri.concept.evidence) ? tri.concept.evidence : [],
        score: Number(tri.concept.score || 65),
        source: s(tri.concept.source || "knowledge"),
        href: s(tri.concept.knowledge_href),
        meta: {
          emne_id: s(tri.concept.emne_id),
          subject_id: s(tri.concept.subject_id),
          core_card: true
        }
      });
    }

    return out.filter(item => item.type && item.target_id && item.label);
  }

  function ensureCoreCards(tri) {
    if (!tri || typeof tri !== "object") return tri || {};

    const ranked = Array.isArray(tri.suggestions) ? tri.suggestions.filter(Boolean) : [];
    const legacy = legacyCoreSuggestions(tri);
    const selectedCore = [];

    CORE_TYPES.forEach(type => {
      const rankedMatch = ranked.find(item => s(item?.type) === type);
      const legacyMatch = legacy.find(item => item.type === type);
      const picked = rankedMatch || legacyMatch;
      if (!picked) return;
      selectedCore.push({
        ...picked,
        meta: { ...(picked.meta || {}), core_card: true }
      });
    });

    const selectedKeys = new Set(
      selectedCore.map(item => `${s(item.type)}::${s(item.target_id)}`)
    );
    const extras = ranked.filter(item =>
      !selectedKeys.has(`${s(item?.type)}::${s(item?.target_id)}`)
    );

    return {
      ...tri,
      core_suggestions: selectedCore,
      suggestions: [...selectedCore, ...extras]
    };
  }

  function repairStoredTri() {
    const tri = readJSON(TRI_KEY, null);
    if (!tri || typeof tri !== "object") return null;
    const repaired = ensureCoreCards(tri);
    writeJSON(TRI_KEY, repaired);
    if (typeof window.renderNextUpV2 === "function") {
      window.renderNextUpV2(repaired, { logShow: false });
    }
    return repaired;
  }

  function patchNavigator() {
    const navigator = window.HGNavigator;
    const currentBuild = navigator?.buildForPlace;
    if (typeof currentBuild !== "function") return false;
    if (currentBuild.__hgNextUpCoreCardsWrapped) return true;

    const wrapped = async function buildForPlaceWithCoreCards(place, context = {}) {
      const tri = await currentBuild.call(this, place, context);
      return ensureCoreCards(tri);
    };
    wrapped.__hgNextUpCoreCardsWrapped = true;
    wrapped.__hgNextUpCoreCardsBase = currentBuild;
    navigator.buildForPlace = wrapped;
    repairStoredTri();
    return true;
  }

  window.HGNextUpCoreCards = {
    ensureCoreCards,
    legacyCoreSuggestions,
    repairStoredTri,
    patchNavigator
  };

  window.addEventListener("hg:mpNextUp", (event) => {
    const tri = event?.detail?.tri;
    if (!tri || typeof tri !== "object") return;
    const repaired = ensureCoreCards(tri);
    if (event.detail) event.detail.tri = repaired;
    writeJSON(TRI_KEY, repaired);
    window.setTimeout(() => {
      if (typeof window.renderNextUpV2 === "function") {
        window.renderNextUpV2(repaired, { logShow: false });
      }
    }, 0);
  });

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    patchNavigator();
    if (attempts >= 40) window.clearInterval(timer);
  }, 100);

  patchNavigator();
  window.setTimeout(repairStoredTri, 0);
})();
