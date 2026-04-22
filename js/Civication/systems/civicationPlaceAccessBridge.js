(function () {
  "use strict";

  const LS_KEY = "hg_civi_access_v1";
  let contextsCache = null;
  let accessMapCache = null;

  function getVisitedPlaceIds() {
    try {
      const raw = JSON.parse(localStorage.getItem("visited_places") || "[]");

      if (Array.isArray(raw)) {
        return raw.map(String);
      }

      if (raw && typeof raw === "object") {
        return Object.keys(raw).filter((k) => !!raw[k]).map(String);
      }

      return [];
    } catch {
      return [];
    }
  }

  async function loadPlaceContexts() {
    if (Array.isArray(contextsCache)) return contextsCache;

    try {
      const res = await fetch("data/Civication/place_contexts.json", { cache: "no-store" });
      if (!res.ok) {
        contextsCache = [];
        return contextsCache;
      }
      const json = await res.json();
      contextsCache = Array.isArray(json?.contexts) ? json.contexts : [];
      return contextsCache;
    } catch {
      contextsCache = [];
      return contextsCache;
    }
  }

  async function loadAccessMap() {
    if (Array.isArray(accessMapCache)) return accessMapCache;

    try {
      const res = await fetch("data/Civication/place_access_map.json", { cache: "no-store" });
      if (!res.ok) {
        accessMapCache = [];
        return accessMapCache;
      }
      const json = await res.json();
      accessMapCache = Array.isArray(json?.contexts) ? json.contexts : [];
      return accessMapCache;
    } catch {
      accessMapCache = [];
      return accessMapCache;
    }
  }

  function matchContexts(placeContexts, visitedIds) {
    const ids = new Set((visitedIds || []).map(String));

    return (placeContexts || [])
      .map((ctx) => {
        const matches = Array.isArray(ctx?.matches_place_ids)
          ? ctx.matches_place_ids.filter((id) => ids.has(String(id)))
          : [];

        return {
          ...ctx,
          matchedPlaceIds: matches,
          matchCount: matches.length
        };
      })
      .filter((ctx) => Number(ctx.matchCount || 0) > 0)
      .sort((a, b) => Number(b.matchCount || 0) - Number(a.matchCount || 0));
  }

  function emptySets() {
    return {
      work: new Set(),
      leisure: new Set(),
      store: new Set(),
      debate: new Set(),
      people: new Set(),
      housing: new Set()
    };
  }

  function buildAccessFromContexts(matchedContexts, accessMap) {
    const mapById = new Map((accessMap || []).map((entry) => [String(entry?.context_id || ""), entry]));
    const access = emptySets();
    const matchedContextIds = [];

    (matchedContexts || []).forEach((ctx) => {
      const contextId = String(ctx?.id || "").trim();
      if (!contextId) return;
      const mapping = mapById.get(contextId);
      if (!mapping) return;

      matchedContextIds.push(contextId);

      ["work", "leisure", "store", "debate", "people", "housing"].forEach((bucket) => {
        const items = Array.isArray(mapping?.[bucket]) ? mapping[bucket] : [];
        items.forEach((item) => {
          if (item) access[bucket].add(String(item));
        });
      });
    });

    return {
      work: Array.from(access.work),
      leisure: Array.from(access.leisure),
      store: Array.from(access.store),
      debate: Array.from(access.debate),
      people: Array.from(access.people),
      housing: Array.from(access.housing),
      matched_context_ids: matchedContextIds
    };
  }

  function persistAccess(state) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
    return state;
  }

  function readAccess() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  async function rebuildAccessState() {
    const visitedIds = getVisitedPlaceIds();
    const [placeContexts, accessMap] = await Promise.all([
      loadPlaceContexts(),
      loadAccessMap()
    ]);

    const matched = matchContexts(placeContexts, visitedIds);
    const access = buildAccessFromContexts(matched, accessMap);

    return persistAccess({
      updated_at: new Date().toISOString(),
      visited_place_ids: visitedIds,
      matched_contexts: matched.map((ctx) => ({
        id: ctx.id,
        label: ctx.label,
        matchCount: ctx.matchCount,
        matchedPlaceIds: ctx.matchedPlaceIds
      })),
      access
    });
  }

  function getAccessState() {
    return readAccess() || {
      updated_at: null,
      visited_place_ids: [],
      matched_contexts: [],
      access: {
        work: [],
        leisure: [],
        store: [],
        debate: [],
        people: [],
        housing: []
      }
    };
  }

  function hasAccess(bucket, key) {
    const access = getAccessState()?.access || {};
    const list = Array.isArray(access?.[bucket]) ? access[bucket] : [];
    return list.includes(String(key));
  }

  function getBucket(bucket) {
    const access = getAccessState()?.access || {};
    return Array.isArray(access?.[bucket]) ? access[bucket] : [];
  }

  window.CivicationPlaceAccessBridge = {
    rebuildAccessState,
    getAccessState,
    hasAccess,
    getBucket
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.CivicationPlaceAccessBridge?.rebuildAccessState?.().then(function () {
      window.dispatchEvent(new Event("updateProfile"));
    });
  });

  window.addEventListener("updateProfile", function () {
    const current = getAccessState();
    const currentVisited = Array.isArray(current?.visited_place_ids) ? current.visited_place_ids : [];
    const latestVisited = getVisitedPlaceIds();

    if (currentVisited.length !== latestVisited.length) {
      window.CivicationPlaceAccessBridge?.rebuildAccessState?.();
    }
  });
})();
