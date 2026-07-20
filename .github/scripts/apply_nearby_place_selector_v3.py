from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"Expected anchor not found in {path}: {old[:180]!r}")
    file_path.write_text(text.replace(old, new, 1))


replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyBadgesPanel.ts", out: "nearbyBadgesPanel" },\n  { in: "js/ui/left-panel.ts", out: "left-panel" }',
    '  { in: "js/ui/nearbyBadgesPanel.ts", out: "nearbyBadgesPanel" },\n  { in: "js/ui/nearbyPlaceSelector.ts", out: "nearbyPlaceSelector" },\n  { in: "js/ui/left-panel.ts", out: "left-panel" }'
)

replace_once(
    "js/app.js",
    '    await safeRun("loadMap", () => loadScriptOnce("js/map.js"));\n    await safeRun("loadAhaMusicBridge", () => loadScriptOnce("js/integrations/aha-music.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));',
    '    await safeRun("loadMap", () => loadScriptOnce("js/map.js"));\n    await safeRun("loadAhaMusicBridge", () => loadScriptOnce("js/integrations/aha-music.js"));\n    await safeRun("loadNearbyPlaceSelector", () => loadScriptOnce("dist/web/nearbyPlaceSelector.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));'
)

globals_path = Path("schemas/app-globals.d.ts")
globals = globals_path.read_text()
if "HGNearbyPlaceSelector?:" not in globals:
    anchor = '''    HGNearbyFilters?: {
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
'''
    declaration = '''    HGNearbyPlaceSelector?: {
      select?: () => {
        items: Array<any & {
          _d: number | null;
          _timeSortKey: number | null;
          _timeLabel: string;
          _epokeLabel: string;
          _isZeitgeist: boolean;
        }>;
        filterMode: "unvisited" | "all" | "unlocked";
        sortMode: "distance" | "oldest" | "newest";
        badgeFilter: string;
        favoritesOnly: boolean;
        freshPlaceId: string;
      };
      getPlaceDistanceMeters?: (place: any, position: unknown) => number | null;
    };
'''
    if anchor not in globals:
        raise SystemExit("HGNearbyFilters declaration anchor missing")
    globals = globals.replace(anchor, anchor + declaration, 1)
globals_path.write_text(globals)

lists_path = Path("js/ui/lists.js")
lists = lists_path.read_text()
function_start = lists.find("function renderNearbyPlaces()")
start = lists.find('  const PLACES = window.PLACES || [];\n', function_start)
end = lists.find('  const renderSignature = JSON.stringify({\n', start)
if function_start < 0 or start < 0 or end < 0:
    raise SystemExit("renderNearbyPlaces selector block anchors missing")

replacement = '''  const visited = window.visited || {};
  const selection = window.HGNearbyPlaceSelector?.select?.();

  if (!selection) {
    console.warn("[Nearby] HGNearbyPlaceSelector is not available");
    return;
  }

  const {
    items,
    filterMode,
    sortMode,
    badgeFilter,
    favoritesOnly,
    freshPlaceId
  } = selection;

'''
lists = lists[:start] + replacement + lists[end:]
lists = lists.replace('    badge: window.HG_NEARBY_BADGE_FILTER || "all",\n', '    badge: badgeFilter,\n', 1)
lists = lists.replace('    favoritesOnly: !!window.HG_NEARBY_FAVORITES_ONLY,\n', '    favoritesOnly,\n', 1)
lists = lists.replace('    if (window.HG_NEARBY_FAVORITES_ONLY) {\n', '    if (favoritesOnly) {\n', 1)
lists_path.write_text(lists)
