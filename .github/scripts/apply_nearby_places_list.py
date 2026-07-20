from pathlib import Path
import re


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
    '  { in: "js/ui/nearbyPlaceSelector.ts", out: "nearbyPlaceSelector" }',
    '  { in: "js/ui/nearbyPlaceSelector.ts", out: "nearbyPlaceSelector" },\n  { in: "js/ui/nearbyPlacesList.ts", out: "nearbyPlacesList" }'
)

replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyPlaceSelector", () => loadScriptOnce("dist/web/nearbyPlaceSelector.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));',
    '    await safeRun("loadNearbyPlaceSelector", () => loadScriptOnce("dist/web/nearbyPlaceSelector.js"));\n    await safeRun("loadNearbyPlacesList", () => loadScriptOnce("dist/web/nearbyPlacesList.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));'
)

globals_path = Path("schemas/app-globals.d.ts")
globals = globals_path.read_text()
if "HGNearbyPlacesList?:" not in globals:
    anchor = '''    HGNearbyPlaceSelector?: {
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
    declaration = '''    HGNearbyPlacesList?: {
      render?: () => void;
    };
    renderNearbyPlaces?: () => void;
'''
    if anchor not in globals:
        raise SystemExit("HGNearbyPlaceSelector declaration anchor missing")
    globals = globals.replace(anchor, anchor + declaration, 1)
globals_path.write_text(globals)

lists_path = Path("js/ui/lists.js")
lists = lists_path.read_text()

for pattern in (
    r'\nfunction getPlaceDistanceMeters\(place, pos\) \{.*?\n\}\n',
    r'\nfunction routeToPlace\(placeId\) \{.*?\n\}\n',
    r'\nfunction renderNearbyPlaces\(\) \{.*?\n\}\n\nfunction renderNearbyPeople\(\)',
):
    replacement = '\nfunction renderNearbyPeople()' if 'renderNearbyPlaces' in pattern else '\n'
    lists, count = re.subn(pattern, replacement, lists, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Expected lists.js migration block not found: {pattern[:100]}")

assignment = 'window.renderNearbyPlaces = renderNearbyPlaces;\n'
if assignment not in lists:
    raise SystemExit("renderNearbyPlaces export assignment missing")
lists = lists.replace(assignment, '', 1)

lists_path.write_text(lists)
