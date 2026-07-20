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
  function normalizeSort(value) {
    const raw = String(value || "distance").trim().toLowerCase();
    if (raw === "oldest" || raw === "newest") return raw;
    return "distance";
  }
  function getCategoryById(value) {
    var _a;
    const id = String(value || "").trim();
    const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
    return (_a = categories.find((category) => category.id.trim() === id)) != null ? _a : null;
  }
  function getBadgeOptions() {
    const categories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
    return ["all", ...categories.map((category) => category.id.trim()).filter(Boolean)];
  }
  function normalizeBadgeFilter(value) {
    const raw = String(value || "all").trim() || "all";
    if (raw === "all") return "all";
    return getCategoryById(raw) ? raw : "all";
  }
  function getActiveBadgeFilter() {
    return normalizeBadgeFilter(win.HG_NEARBY_BADGE_FILTER || "all");
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
  function cyclePlaceFilter() {
    const current = String(win.HG_NEARBY_FILTER || "unvisited");
    const index = PLACE_FILTER_ORDER.indexOf(current);
    const next = PLACE_FILTER_ORDER[(index + 1) % PLACE_FILTER_ORDER.length];
    win.HG_NEARBY_FILTER = next;
    writeStorage("hg_nearby_filter_v1", next);
    return next;
  }
  function cycleNatureFilter() {
    const current = String(win.HG_NATURE_FILTER || "all");
    const index = NATURE_FILTER_ORDER.indexOf(current);
    const next = NATURE_FILTER_ORDER[(index + 1) % NATURE_FILTER_ORDER.length];
    win.HG_NATURE_FILTER = next;
    writeStorage("hg_nature_filter_v1", next);
    return next;
  }
  function toggleFavorites() {
    const next = !Boolean(win.HG_NEARBY_FAVORITES_ONLY);
    win.HG_NEARBY_FAVORITES_ONLY = next;
    writeStorage("hg_nearby_favorites_filter_v1", next ? "1" : "0");
    return next;
  }
  function cycleSort() {
    const current = normalizeSort(win.HG_NEARBY_SORT);
    const index = SORT_ORDER.indexOf(current);
    const next = SORT_ORDER[(index + 1) % SORT_ORDER.length];
    win.HG_NEARBY_SORT = next;
    writeStorage("hg_nearby_sort_v1", next);
    return next;
  }
  function initializeFromStorage() {
    win.HG_NEARBY_FILTER = readStorage("hg_nearby_filter_v1") || "unvisited";
    win.HG_NEARBY_BADGE_FILTER = normalizeBadgeFilter(readStorage("hg_nearby_badge_filter_v1") || "all");
    win.HG_NEARBY_SORT = normalizeSort(readStorage("hg_nearby_sort_v1") || "distance");
    win.HG_NEARBY_FAVORITES_ONLY = readStorage("hg_nearby_favorites_filter_v1") === "1";
    win.HG_NATURE_FILTER = readStorage("hg_nature_filter_v1") || "all";
  }
  var api = {
    initializeFromStorage,
    normalizeSort,
    normalizeBadgeFilter,
    getCategoryById,
    getBadgeOptions,
    getActiveBadgeFilter,
    setActiveBadgeFilter,
    isBadgeFilterActive,
    cyclePlaceFilter,
    cycleNatureFilter,
    toggleFavorites,
    cycleSort
  };
  win.HGNearbyFilters = api;
  win.HG_getActiveBadgeFilter = getActiveBadgeFilter;
  win.HG_isBadgeFilterActive = isBadgeFilterActive;
  initializeFromStorage();
})();
