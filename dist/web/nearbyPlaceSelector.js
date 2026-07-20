(() => {
  // js/ui/nearbyPlaceSelector.ts
  var win = window;
  function normalizePlaceFilter(value) {
    const raw = String(value != null ? value : "unvisited").trim().toLowerCase();
    if (raw === "all" || raw === "unlocked") return raw;
    return "unvisited";
  }
  function normalizeSort(value) {
    const raw = String(value != null ? value : "distance").trim().toLowerCase();
    if (raw === "oldest" || raw === "newest") return raw;
    return "distance";
  }
  function getPlaceDistanceMeters(place, position) {
    const distMeters = win.distMeters;
    if (!place || !position || typeof distMeters !== "function") return null;
    const getTargets = win.getPlaceDistanceTargets;
    const targets = typeof getTargets === "function" ? getTargets(place) : [{ lat: place.lat, lon: place.lon }];
    let best = Infinity;
    for (const target of targets || []) {
      const distance = distMeters(position, { lat: target.lat, lon: target.lon });
      if (Number.isFinite(distance) && distance < best) best = distance;
    }
    return Number.isFinite(best) ? Math.round(best) : null;
  }
  function readSortYear(place, resolved) {
    const candidates = [
      resolved == null ? void 0 : resolved.year,
      resolved == null ? void 0 : resolved.startYear,
      place.year,
      place.start_year,
      place.startYear
    ];
    for (const candidate of candidates) {
      if (candidate == null) continue;
      if (typeof candidate === "string" && candidate.trim() === "") continue;
      const value = Number(candidate);
      if (Number.isFinite(value)) return value;
    }
    return null;
  }
  function distanceAndNameCompare(a, b) {
    var _a, _b;
    const distanceDelta = ((_a = a._d) != null ? _a : 1e12) - ((_b = b._d) != null ? _b : 1e12);
    if (distanceDelta !== 0) return distanceDelta;
    return String(a.name || "").localeCompare(String(b.name || ""), "nb");
  }
  function comparePlaces(sortMode, a, b) {
    if (sortMode === "distance") return distanceAndNameCompare(a, b);
    const aTime = a._timeSortKey;
    const bTime = b._timeSortKey;
    const aHasTime = typeof aTime === "number" && Number.isFinite(aTime);
    const bHasTime = typeof bTime === "number" && Number.isFinite(bTime);
    if (aHasTime !== bHasTime) return aHasTime ? -1 : 1;
    if (!aHasTime || !bHasTime || aTime == null || bTime == null) {
      return distanceAndNameCompare(a, b);
    }
    const delta = sortMode === "oldest" ? aTime - bTime : bTime - aTime;
    if (delta !== 0) return delta;
    return distanceAndNameCompare(a, b);
  }
  function select() {
    var _a, _b, _c, _d, _e, _f;
    const places = Array.isArray(win.PLACES) ? win.PLACES : [];
    const visited = win.visited || {};
    const position = (_a = win.getPos) == null ? void 0 : _a.call(win);
    const filters = win.HGNearbyFilters;
    const filterMode = ((_b = filters == null ? void 0 : filters.getPlaceFilter) == null ? void 0 : _b.call(filters)) || normalizePlaceFilter(win.HG_NEARBY_FILTER);
    const sortMode = ((_c = filters == null ? void 0 : filters.getSort) == null ? void 0 : _c.call(filters)) || normalizeSort(win.HG_NEARBY_SORT);
    const badgeFilter = ((_d = filters == null ? void 0 : filters.getActiveBadgeFilter) == null ? void 0 : _d.call(filters)) || String(win.HG_NEARBY_BADGE_FILTER || "all").trim() || "all";
    const favoritesOnly = (_f = (_e = filters == null ? void 0 : filters.getFavoritesOnly) == null ? void 0 : _e.call(filters)) != null ? _f : Boolean(win.HG_NEARBY_FAVORITES_ONLY);
    const freshPlaceId = String(win.HG_LAST_DISCOVERED_PLACE_ID || "").trim();
    const timeResolver = win.HGTimeResolver;
    const resolvePlaceTime = timeResolver == null ? void 0 : timeResolver.resolvePlaceTime;
    const resolveTime = typeof resolvePlaceTime === "function" ? (place) => resolvePlaceTime.call(timeResolver, place) : null;
    let items = places.map((place) => {
      var _a2, _b2;
      const resolved = resolveTime ? resolveTime(place) || null : null;
      const sortYear = readSortYear(place, resolved);
      const hasTime = typeof sortYear === "number" && Number.isFinite(sortYear);
      const legacyEpokeLabel = place.epokeLabel;
      return {
        ...place,
        _d: getPlaceDistanceMeters(place, position),
        _timeSortKey: hasTime ? sortYear : null,
        _timeLabel: hasTime ? String(sortYear) : "",
        _epokeLabel: String((_b2 = (_a2 = resolved == null ? void 0 : resolved.epokeLabel) != null ? _a2 : legacyEpokeLabel) != null ? _b2 : "").trim(),
        _isZeitgeist: Boolean(resolved == null ? void 0 : resolved.isZeitgeist)
      };
    });
    if (filterMode === "unvisited") {
      items = items.filter((place) => !visited[place.id]);
    } else if (filterMode === "unlocked") {
      items = items.filter((place) => Boolean(visited[place.id]));
    }
    if (favoritesOnly) {
      items = items.filter((place) => {
        var _a2, _b2;
        return Boolean((_b2 = (_a2 = win.HGFavoritePlaces) == null ? void 0 : _a2.has) == null ? void 0 : _b2.call(_a2, place.id));
      });
    }
    if (badgeFilter !== "all") {
      items = items.filter((place) => String(place.category || "").trim() === badgeFilter);
    }
    items.sort((a, b) => comparePlaces(sortMode, a, b));
    return {
      items,
      filterMode,
      sortMode,
      badgeFilter,
      favoritesOnly,
      freshPlaceId
    };
  }
  var api = {
    select,
    getPlaceDistanceMeters
  };
  win.HGNearbyPlaceSelector = api;
})();
