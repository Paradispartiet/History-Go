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
    '  { in: "js/ui/nearbyPlaceSelector.ts", out: "nearbyPlaceSelector" },\n  { in: "js/ui/nearbyPlacesList.ts", out: "nearbyPlacesList" }',
    '  { in: "js/ui/nearbyPlaceSelector.ts", out: "nearbyPlaceSelector" },\n  { in: "js/ui/nearbyPlacesList.ts", out: "nearbyPlacesList" },\n  { in: "js/ui/nearbyPeopleList.ts", out: "nearbyPeopleList" }'
)

replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyPlaceSelector", () => loadScriptOnce("dist/web/nearbyPlaceSelector.js"));\n    await safeRun("loadNearbyPlacesList", () => loadScriptOnce("dist/web/nearbyPlacesList.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));',
    '    await safeRun("loadNearbyPlaceSelector", () => loadScriptOnce("dist/web/nearbyPlaceSelector.js"));\n    await safeRun("loadNearbyPlacesList", () => loadScriptOnce("dist/web/nearbyPlacesList.js"));\n    await safeRun("loadNearbyPeopleList", () => loadScriptOnce("dist/web/nearbyPeopleList.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));'
)

globals_path = Path("schemas/app-globals.d.ts")
globals = globals_path.read_text()
if "HGNearbyPeopleList?:" not in globals:
    anchor = '''    HGNearbyPlacesList?: {
      render?: () => void;
    };
    renderNearbyPlaces?: () => void;
'''
    declaration = '''    HGNearbyPeopleList?: {
      render?: () => void;
    };
    renderNearbyPeople?: () => void;
'''
    if anchor not in globals:
        raise SystemExit("HGNearbyPlacesList declaration anchor missing")
    globals = globals.replace(anchor, anchor + declaration, 1)
globals_path.write_text(globals)

lists_path = Path("js/ui/lists.js")
lists = lists_path.read_text()

patterns = [
    r'\nfunction personMatchesActiveBadge\(person, placesById\) \{.*?\n\}\n',
    r'\nfunction renderNearbyPeople\(\) \{.*?\n\}\n\n// ============================================================\n// NATURE',
]
for pattern in patterns:
    replacement = '\n// ============================================================\n// NATURE' if 'renderNearbyPeople' in pattern else '\n'
    lists, count = re.subn(pattern, replacement, lists, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Expected People migration block not found: {pattern[:100]}")

assignment = 'window.renderNearbyPeople = renderNearbyPeople;\n'
if assignment not in lists:
    raise SystemExit("renderNearbyPeople export assignment missing")
lists = lists.replace(assignment, '', 1)

lists_path.write_text(lists)
