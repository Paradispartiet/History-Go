from pathlib import Path


def replace_once(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    source = path.read_text()
    if old not in source:
        raise SystemExit(f"Expected migration anchor not found in {path_str}: {old[:140]!r}")
    path.write_text(source.replace(old, new, 1))


replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/left-panel.ts", out: "left-panel" }\n',
    '  { in: "js/ui/left-panel.ts", out: "left-panel" },\n  { in: "js/ui/nearbyPlaceSelector.ts", out: "nearbyPlaceSelector" }\n',
)

replace_once(
    "js/app.js",
    '    await safeRun("loadAhaMusicBridge", () => loadScriptOnce("js/integrations/aha-music.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));',
    '    await safeRun("loadAhaMusicBridge", () => loadScriptOnce("js/integrations/aha-music.js"));\n    await safeRun("loadNearbyPlaceSelector", () => loadScriptOnce("dist/web/nearbyPlaceSelector.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));',
)

lists_path = Path("js/ui/lists.js")
lists_source = lists_path.read_text()
selection_start = lists_source.find('  const PLACES = window.PLACES || [];\n', lists_source.find("function renderNearbyPlaces()"))
selection_end = lists_source.find('  const renderSignature = JSON.stringify({\n', selection_start)
if selection_start < 0 or selection_end < 0:
    raise SystemExit("Could not locate Nearby place selection block")

selection_block = '''  const visited = window.visited || {};
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
lists_source = lists_source[:selection_start] + selection_block + lists_source[selection_end:]
lists_source = lists_source.replace(
    '    badge: window.HG_NEARBY_BADGE_FILTER || "all",\n    favoritesOnly: !!window.HG_NEARBY_FAVORITES_ONLY,',
    '    badge: badgeFilter,\n    favoritesOnly,',
    1,
)
lists_source = lists_source.replace(
    '    if (window.HG_NEARBY_FAVORITES_ONLY) {',
    '    if (favoritesOnly) {',
    1,
)
lists_path.write_text(lists_source)

replace_once(
    "schemas/app-globals.d.ts",
    '    HGLeftPanelMode?: {\n',
    '''    HGNearbyPlaceSelector?: {
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
    HGLeftPanelMode?: {
''',
)
