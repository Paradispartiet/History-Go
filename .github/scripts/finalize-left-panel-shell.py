from pathlib import Path
import subprocess


def replace_once(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    source = path.read_text()
    if old not in source:
        raise SystemExit(f"Expected migration anchor not found in {path_str}: {old[:140]!r}")
    path.write_text(source.replace(old, new, 1))


# Build the shell directly to dist/web. Unlike the earlier startup strangler files,
# left-panel is now fully TypeScript-owned and no longer needs a legacy JS copy.
replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyBadgesPanel.ts", out: "nearbyBadgesPanel" }\n',
    '  { in: "js/ui/nearbyBadgesPanel.ts", out: "nearbyBadgesPanel" },\n  { in: "js/ui/left-panel.ts", out: "left-panel" }\n',
)

replace_once(
    "js/app.js",
    '    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));',
    '    await safeRun("loadLeftPanel", () => loadScriptOnce("dist/web/left-panel.js"));',
)

replace_once(
    "sw.js",
    'const SW_VERSION = "hg-sw-2026-07-20-v1.3.129";',
    'const SW_VERSION = "hg-sw-2026-07-20-v1.3.130";',
)
replace_once(
    "sw.js",
    '  "js/ui/left-panel.js",',
    '  "dist/web/left-panel.js",',
)

# Remove two accidental dependencies on globals leaked by the old classic script.
replace_once(
    "js/routes.js",
    '  sel.addEventListener("change", () => setLeftPanelMode(sel.value));',
    '  sel.addEventListener("change", () => hgWindow.setLeftPanelMode?.(sel.value));',
)
replace_once(
    "js/routes.js",
    '  setLeftPanelMode(sel.value || "nearby");',
    '  hgWindow.setLeftPanelMode?.(sel.value || "nearby");',
)
replace_once(
    "js/ui/place-card.js",
    '  return hg$("placeCard");',
    '  return document.getElementById("placeCard");',
)

# The favorites regression test should follow the new canonical owners rather than
# keeping the deleted legacy shell file alive as a test fixture.
test_path = Path("tests/nearby-card-favorite-control.test.js")
test_source = test_path.read_text()
test_source = test_source.replace(
    'const leftPanel = fs.readFileSync("js/ui/left-panel.js", "utf8");\n',
    'const nearbyFilterControls = fs.readFileSync("js/ui/nearbyFilterControls.ts", "utf8");\n'
    'const nearbyFilters = fs.readFileSync("js/ui/nearbyFilters.ts", "utf8");\n',
)
test_source = test_source.replace(
    'assert(leftPanel.includes("nearbyFavoritesFilterBtn"), "The Nearby favorites filter must remain available");\n'
    'assert(leftPanel.includes("HG_NEARBY_FAVORITES_ONLY"), "The favorites-only filter behavior must remain intact");',
    'assert(nearbyFilterControls.includes("nearbyFavoritesFilterBtn"), "The Nearby favorites filter must remain available");\n'
    'assert(nearbyFilters.includes("HG_NEARBY_FAVORITES_ONLY"), "The favorites-only filter behavior must remain intact");',
)
test_path.write_text(test_source)

replace_once(
    "schemas/app-globals.d.ts",
    '    HGNearbyBadgesPanel?: {\n',
    '''    initLeftPanel?: () => void;
    setLeftPanelMode?: (mode: unknown) => "nearby" | "people" | "nature" | "routes" | "badges";
    rerenderActiveLeftPanelMode?: () => void;
    renderActiveLeftPanelModeNow?: () => void;
    openNearbyDrawer?: () => void;
    closeNearbyDrawer?: () => void;
    toggleNearbyDrawer?: () => void;
    setNearbyCollapsed?: (hidden: unknown) => void;
    HGNearbyBadgesPanel?: {
''',
)

# Remove the handwritten legacy source. The app and service worker now consume the
# generated dist/web bundle directly, so keeping this file would create two sources.
legacy_shell = Path("js/ui/left-panel.js")
if legacy_shell.exists():
    legacy_shell.unlink()

# The existing finalize workflow stages the canonical/build files itself. Stage the
# runtime-path, cache, consumer cleanup and regression-test changes here so the bot
# commit is atomic.
subprocess.run(
    [
        "git", "add", "-A", "--",
        "js/app.js",
        "sw.js",
        "js/routes.js",
        "js/ui/place-card.js",
        "tests/nearby-card-favorite-control.test.js",
        "js/ui/left-panel.js",
    ],
    check=True,
)
