(() => {
  // js/ui/nearbyFilters.ts
  var win = window;
  var PLACE_FILTER_ORDER = ["unvisited", "all", "unlocked"];
  var NATURE_FILTER_ORDER = ["all", "unlocked", "flora", "fauna"];
  var SORT_ORDER = ["distance", "oldest", "newest"];
  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
    }
  }
  function normalizeFromOrder(value, order, fallback) {
    const normalized = String(value != null ? value : "").trim().toLowerCase();
    return order.includes(normalized) ? normalized : fallback;
  }
  function normalizeSort(value) {
    return normalizeFromOrder(value, SORT_ORDER, "distance");
  }
  function normalizePlaceFilter(value) {
    return normalizeFromOrder(value, PLACE_FILTER_ORDER, "unvisited");
  }
  function normalizeNatureFilter(value) {
    return normalizeFromOrder(value, NATURE_FILTER_ORDER, "all");
  }
  function getCategoryById(value) {
    var _a;
    const id = String(value != null ? value : "").trim();
    const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
    return (_a = categories.find((category) => {
      var _a2;
      return String((_a2 = category.id) != null ? _a2 : "").trim() === id;
    })) != null ? _a : null;
  }
  function getBadgeOptions() {
    const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
    return ["all", ...categories.map((category) => {
      var _a;
      return String((_a = category.id) != null ? _a : "").trim();
    }).filter(Boolean)];
  }
  function normalizeBadgeFilter(value) {
    const raw = String(value != null ? value : "all").trim() || "all";
    if (raw === "all") return "all";
    return getCategoryById(raw) ? raw : "all";
  }
  function getPlaceFilter() {
    return normalizePlaceFilter(win.HG_NEARBY_FILTER);
  }
  function setPlaceFilter(value) {
    const next = normalizePlaceFilter(value);
    win.HG_NEARBY_FILTER = next;
    writeStorage("hg_nearby_filter_v1", next);
    return next;
  }
  function getNatureFilter() {
    return normalizeNatureFilter(win.HG_NATURE_FILTER);
  }
  function setNatureFilter(value) {
    const next = normalizeNatureFilter(value);
    win.HG_NATURE_FILTER = next;
    writeStorage("hg_nature_filter_v1", next);
    return next;
  }
  function getSort() {
    return normalizeSort(win.HG_NEARBY_SORT);
  }
  function setSort(value) {
    const next = normalizeSort(value);
    win.HG_NEARBY_SORT = next;
    writeStorage("hg_nearby_sort_v1", next);
    return next;
  }
  function getFavoritesOnly() {
    return Boolean(win.HG_NEARBY_FAVORITES_ONLY);
  }
  function setFavoritesOnly(value) {
    const next = Boolean(value);
    win.HG_NEARBY_FAVORITES_ONLY = next;
    writeStorage("hg_nearby_favorites_filter_v1", next ? "1" : "0");
    return next;
  }
  function getActiveBadgeFilter() {
    return normalizeBadgeFilter(win.HG_NEARBY_BADGE_FILTER);
  }
  function setActiveBadgeFilter(value) {
    const next = normalizeBadgeFilter(value);
    win.HG_NEARBY_BADGE_FILTER = next;
    writeStorage("hg_nearby_badge_filter_v1", next);
    return next;
  }
  function isBadgeFilterActive() {
    return getActiveBadgeFilter() !== "all";
  }
  function cycleValue(current, order) {
    var _a;
    const index = order.indexOf(current);
    return (_a = order[(index + 1) % order.length]) != null ? _a : order[0];
  }
  function cyclePlaceFilter() {
    return setPlaceFilter(cycleValue(getPlaceFilter(), PLACE_FILTER_ORDER));
  }
  function cycleNatureFilter() {
    return setNatureFilter(cycleValue(getNatureFilter(), NATURE_FILTER_ORDER));
  }
  function cycleSort() {
    return setSort(cycleValue(getSort(), SORT_ORDER));
  }
  function toggleFavorites() {
    return setFavoritesOnly(!getFavoritesOnly());
  }
  function cycleBadgeFilter() {
    var _a;
    const order = getBadgeOptions();
    const current = getActiveBadgeFilter();
    const index = order.indexOf(current);
    return setActiveBadgeFilter((_a = order[(index + 1) % order.length]) != null ? _a : "all");
  }
  function snapshot() {
    return {
      placeFilter: getPlaceFilter(),
      badgeFilter: getActiveBadgeFilter(),
      sort: getSort(),
      favoritesOnly: getFavoritesOnly(),
      natureFilter: getNatureFilter()
    };
  }
  function initializeFromStorage() {
    win.HG_NEARBY_FILTER = normalizePlaceFilter(readStorage("hg_nearby_filter_v1"));
    win.HG_NEARBY_BADGE_FILTER = normalizeBadgeFilter(readStorage("hg_nearby_badge_filter_v1"));
    win.HG_NEARBY_SORT = normalizeSort(readStorage("hg_nearby_sort_v1"));
    win.HG_NEARBY_FAVORITES_ONLY = readStorage("hg_nearby_favorites_filter_v1") === "1";
    win.HG_NATURE_FILTER = normalizeNatureFilter(readStorage("hg_nature_filter_v1"));
    return snapshot();
  }
  var api = {
    initializeFromStorage,
    snapshot,
    normalizeSort,
    getSort,
    setSort,
    cycleSort,
    getPlaceFilter,
    setPlaceFilter,
    cyclePlaceFilter,
    getNatureFilter,
    setNatureFilter,
    cycleNatureFilter,
    getFavoritesOnly,
    setFavoritesOnly,
    toggleFavorites,
    getCategoryById,
    getBadgeOptions,
    normalizeBadgeFilter,
    getActiveBadgeFilter,
    setActiveBadgeFilter,
    cycleBadgeFilter,
    isBadgeFilterActive
  };
  win.HGNearbyFilters = api;
  win.HG_getActiveBadgeFilter = getActiveBadgeFilter;
  win.HG_isBadgeFilterActive = isBadgeFilterActive;
  initializeFromStorage();
})();
