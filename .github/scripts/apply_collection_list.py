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
    '  { in: "js/ui/nearbyPlacesList.ts", out: "nearbyPlacesList" },\n  { in: "js/ui/nearbyPeopleList.ts", out: "nearbyPeopleList" }',
    '  { in: "js/ui/nearbyPlacesList.ts", out: "nearbyPlacesList" },\n  { in: "js/ui/nearbyPeopleList.ts", out: "nearbyPeopleList" },\n  { in: "js/ui/collectionList.ts", out: "collectionList" }'
)

replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyPlacesList", () => loadScriptOnce("dist/web/nearbyPlacesList.js"));\n    await safeRun("loadNearbyPeopleList", () => loadScriptOnce("dist/web/nearbyPeopleList.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));',
    '    await safeRun("loadNearbyPlacesList", () => loadScriptOnce("dist/web/nearbyPlacesList.js"));\n    await safeRun("loadNearbyPeopleList", () => loadScriptOnce("dist/web/nearbyPeopleList.js"));\n    await safeRun("loadCollectionList", () => loadScriptOnce("dist/web/collectionList.js"));\n    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));'
)

globals_path = Path("schemas/app-globals.d.ts")
globals = globals_path.read_text()
if "HGCollectionList?:" not in globals:
    anchor = '''    HGNearbyPeopleList?: {
      render?: () => void;
    };
    renderNearbyPeople?: () => void;
'''
    declaration = '''    HGCollectionList?: {
      render?: () => void;
    };
    renderCollection?: () => void;
'''
    if anchor not in globals:
        raise SystemExit("HGNearbyPeopleList declaration anchor missing")
    globals = globals.replace(anchor, anchor + declaration, 1)
globals_path.write_text(globals)

lists_path = Path("js/ui/lists.js")
lists = lists_path.read_text()
pattern = r'\nfunction renderCollection\(\) \{.*?\n\}\n'
lists, count = re.subn(pattern, '\n', lists, count=1, flags=re.S)
if count != 1:
    raise SystemExit("renderCollection block missing")
assignment = 'window.renderCollection = renderCollection;\n'
if assignment not in lists:
    raise SystemExit("renderCollection export assignment missing")
lists = lists.replace(assignment, '', 1)
lists_path.write_text(lists)
