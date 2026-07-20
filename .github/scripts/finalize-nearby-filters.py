from pathlib import Path


def replace_once(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    source = path.read_text()
    if old not in source:
        raise SystemExit(f"Expected migration anchor not found in {path_str}: {old[:140]!r}")
    path.write_text(source.replace(old, new, 1))


replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyDrawer.ts", out: "nearbyDrawer" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" }\n',
    '  { in: "js/ui/nearbyDrawer.ts", out: "nearbyDrawer" },\n  { in: "js/ui/nearbyFilters.ts", out: "nearbyFilters" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" }\n',
)

replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyDrawer", () => loadScriptOnce("js/ui/nearby-drawer.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));',
    '    await safeRun("loadNearbyDrawer", () => loadScriptOnce("js/ui/nearby-drawer.js"));\n    await safeRun("loadNearbyFilters", () => loadScriptOnce("dist/web/nearbyFilters.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));',
)

replace_once(
    "js/ui/left-panel.js",
    '''function normalizeNearbySort(mode) {
  const raw = String(mode || "distance").trim().toLowerCase();
  if (raw === "oldest" || raw === "newest") return raw;
  return "distance";
}''',
    '''function normalizeNearbySort(mode) {
  return window.HGNearbyFilters?.normalizeSort?.(mode) || "distance";
}''',
)

replace_once(
    "js/ui/left-panel.js",
    '''function getCategoryById(id) {
  const cats = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  return cats.find(c => String(c.id || "").trim() === String(id || "").trim()) || null;
}

function getNearbyBadgeOptions() {
  const cats = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  return ["all", ...cats.map(c => String(c.id || "").trim()).filter(Boolean)];
}

function normalizeBadgeFilter(id) {
  const raw = String(id || "all").trim() || "all";
  if (raw === "all") return "all";
  return getCategoryById(raw) ? raw : "all";
}

function getActiveBadgeFilter() {
  return normalizeBadgeFilter(window.HG_NEARBY_BADGE_FILTER || "all");
}''',
    '''function getCategoryById(id) {
  return window.HGNearbyFilters?.getCategoryById?.(id) || null;
}

function getNearbyBadgeOptions() {
  return window.HGNearbyFilters?.getBadgeOptions?.() || ["all"];
}

function normalizeBadgeFilter(id) {
  return window.HGNearbyFilters?.normalizeBadgeFilter?.(id) || "all";
}

function getActiveBadgeFilter() {
  return window.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";
}''',
)

replace_once(
    "js/ui/left-panel.js",
    '''function setActiveBadgeFilter(nextFilter, options = {}) {
  const next = normalizeBadgeFilter(nextFilter);
  const current = getActiveBadgeFilter();

  window.HG_NEARBY_BADGE_FILTER = next;
  try { localStorage.setItem("hg_nearby_badge_filter_v1", next); } catch {}

  if (typeof window.updateNearbyBadgeFilterButton === "function") {
    window.updateNearbyBadgeFilterButton();
  }

  const activeMode = hgActiveLeftPanelMode();

  if (activeMode === "badges" || options.renderBadgesList) {
    renderLeftBadges();
    return;
  }

  if (next !== current || options.forceRender) {
    rerenderActiveLeftPanelMode();
  }
}

function isBadgeFilterActive() {
  const f = getActiveBadgeFilter();
  return !!f && f !== "all";
}''',
    '''function setActiveBadgeFilter(nextFilter, options = {}) {
  const current = getActiveBadgeFilter();
  const next = window.HGNearbyFilters?.setActiveBadgeFilter?.(nextFilter) || "all";

  if (typeof window.updateNearbyBadgeFilterButton === "function") {
    window.updateNearbyBadgeFilterButton();
  }

  const activeMode = hgActiveLeftPanelMode();

  if (activeMode === "badges" || options.renderBadgesList) {
    renderLeftBadges();
    return;
  }

  if (next !== current || options.forceRender) {
    rerenderActiveLeftPanelMode();
  }
}

function isBadgeFilterActive() {
  return window.HGNearbyFilters?.isBadgeFilterActive?.() || false;
}''',
)

replace_once(
    "js/ui/left-panel.js",
    '''    window.HG_NEARBY_FILTER =
      localStorage.getItem("hg_nearby_filter_v1") || "unvisited";

    window.HG_NEARBY_BADGE_FILTER =
      normalizeBadgeFilter(localStorage.getItem("hg_nearby_badge_filter_v1") || "all");
    window.HG_NEARBY_SORT =
      normalizeNearbySort(localStorage.getItem("hg_nearby_sort_v1") || "distance");
    window.HG_NEARBY_FAVORITES_ONLY =
      localStorage.getItem("hg_nearby_favorites_filter_v1") === "1";

    window.HG_NATURE_FILTER =
      localStorage.getItem("hg_nature_filter_v1") || "all";''',
    '''  window.HGNearbyFilters?.initializeFromStorage?.();''',
)

replace_once(
    "js/ui/left-panel.js",
    '''  const PLACES_ICONS = { unvisited: "🎯", unlocked: "🔓", all: "🌍" };
  const PLACES_ORDER = ["unvisited", "all", "unlocked"];

  const NATURE_ICONS = { all: "🌍", unlocked: "🔓", flora: "🌿", fauna: "🐞" };
  const NATURE_ORDER = ["all", "unlocked", "flora", "fauna"];
  const SORT_ICONS = { distance: "📍", oldest: "⏳", newest: "🕰️" };''',
    '''  const PLACES_ICONS = { unvisited: "🎯", unlocked: "🔓", all: "🌍" };

  const NATURE_ICONS = { all: "🌍", unlocked: "🔓", flora: "🌿", fauna: "🐞" };
  const SORT_ICONS = { distance: "📍", oldest: "⏳", newest: "🕰️" };''',
)

replace_once(
    "js/ui/left-panel.js",
    '''  };
  const SORT_ORDER = ["distance", "oldest", "newest"];

  function updateBadgeFilterButton() {''',
    '''  };

  function updateBadgeFilterButton() {''',
)

replace_once(
    "js/ui/left-panel.js",
    '''      if (mode === "nature") {
        const i = NATURE_ORDER.indexOf(window.HG_NATURE_FILTER);
        window.HG_NATURE_FILTER = NATURE_ORDER[(i + 1) % NATURE_ORDER.length];
        try { localStorage.setItem("hg_nature_filter_v1", window.HG_NATURE_FILTER); } catch {}
        updateFilterButton();
        if (typeof renderNearbyNature === "function") renderNearbyNature();
      } else if (mode === "nearby") {
        const i = PLACES_ORDER.indexOf(window.HG_NEARBY_FILTER);
        window.HG_NEARBY_FILTER = PLACES_ORDER[(i + 1) % PLACES_ORDER.length];
        try { localStorage.setItem("hg_nearby_filter_v1", window.HG_NEARBY_FILTER); } catch {}
        updateFilterButton();
        rerenderActiveLeftPanelMode();
      }''',
    '''      if (mode === "nature") {
        window.HGNearbyFilters?.cycleNatureFilter?.();
        updateFilterButton();
        if (typeof renderNearbyNature === "function") renderNearbyNature();
      } else if (mode === "nearby") {
        window.HGNearbyFilters?.cyclePlaceFilter?.();
        updateFilterButton();
        rerenderActiveLeftPanelMode();
      }''',
)

replace_once(
    "js/ui/left-panel.js",
    '''      const order = getNearbyBadgeOptions();
      const current = getActiveBadgeFilter();
      const i = order.indexOf(current);
      const next = order[(i + 1) % order.length] || "all";

      setActiveBadgeFilter(next, { forceRender: true });''',
    '''      const next = window.HGNearbyFilters?.cycleBadgeFilter?.() || "all";
      setActiveBadgeFilter(next, { forceRender: true });''',
)

replace_once(
    "js/ui/left-panel.js",
    '''      window.HG_NEARBY_FAVORITES_ONLY = !window.HG_NEARBY_FAVORITES_ONLY;
      try { localStorage.setItem("hg_nearby_favorites_filter_v1", window.HG_NEARBY_FAVORITES_ONLY ? "1" : "0"); } catch {}
      updateNearbyFavoritesFilterButton();''',
    '''      window.HGNearbyFilters?.toggleFavorites?.();
      updateNearbyFavoritesFilterButton();''',
)

replace_once(
    "js/ui/left-panel.js",
    '''      const current = normalizeNearbySort(window.HG_NEARBY_SORT);
      const i = SORT_ORDER.indexOf(current);
      const next = SORT_ORDER[(i + 1) % SORT_ORDER.length] || "distance";
      window.HG_NEARBY_SORT = next;
      try { localStorage.setItem("hg_nearby_sort_v1", next); } catch {}
      updateNearbySortButton();''',
    '''      window.HGNearbyFilters?.cycleSort?.();
      updateNearbySortButton();''',
)

replace_once(
    "schemas/app-globals.d.ts",
    '    HGLeftPanelMode?: {\n',
    '''    HGNearbyFilters?: {
      initializeFromStorage?: () => any;
      snapshot?: () => any;
      normalizeSort?: (value: unknown) => "distance" | "oldest" | "newest";
      getSort?: () => "distance" | "oldest" | "newest";
      setSort?: (value: unknown) => "distance" | "oldest" | "newest";
      cycleSort?: () => "distance" | "oldest" | "newest";
      getPlaceFilter?: () => "unvisited" | "all" | "unlocked";
      setPlaceFilter?: (value: unknown) => "unvisited" | "all" | "unlocked";
      cyclePlaceFilter?: () => "unvisited" | "all" | "unlocked";
      getNatureFilter?: () => "all" | "unlocked" | "flora" | "fauna";
      setNatureFilter?: (value: unknown) => "all" | "unlocked" | "flora" | "fauna";
      cycleNatureFilter?: () => "all" | "unlocked" | "flora" | "fauna";
      getFavoritesOnly?: () => boolean;
      setFavoritesOnly?: (value: unknown) => boolean;
      toggleFavorites?: () => boolean;
      getCategoryById?: (value: unknown) => any;
      getBadgeOptions?: () => string[];
      normalizeBadgeFilter?: (value: unknown) => string;
      getActiveBadgeFilter?: () => string;
      setActiveBadgeFilter?: (value: unknown) => string;
      cycleBadgeFilter?: () => string;
      isBadgeFilterActive?: () => boolean;
    };
    HGLeftPanelMode?: {
''',
)
