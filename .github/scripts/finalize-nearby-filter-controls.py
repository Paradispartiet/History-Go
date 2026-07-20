from pathlib import Path


def replace_once(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    source = path.read_text()
    if old not in source:
        raise SystemExit(f"Expected migration anchor not found in {path_str}: {old[:140]!r}")
    path.write_text(source.replace(old, new, 1))


replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyFilters.ts", out: "nearbyFilters" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" }\n',
    '  { in: "js/ui/nearbyFilters.ts", out: "nearbyFilters" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" },\n  { in: "js/ui/nearbyFilterControls.ts", out: "nearbyFilterControls" }\n',
)

replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyFilters", () => loadScriptOnce("dist/web/nearbyFilters.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));\n    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));',
    '    await safeRun("loadNearbyFilters", () => loadScriptOnce("dist/web/nearbyFilters.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));\n    await safeRun("loadNearbyFilterControls", () => loadScriptOnce("dist/web/nearbyFilterControls.js"));\n    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));',
)

replace_once(
    "js/ui/left-panel.js",
    '''function normalizeNearbySort(mode) {
  return window.HGNearbyFilters?.normalizeSort?.(mode) || "distance";
}

function getNearbyControlsContainer(placeFilterBtn) {
  return document.querySelector(".nearby-controls") || placeFilterBtn?.parentElement || null;
}

function updateNearbyControlVisibility() {
  window.HGLeftPanelMode?.updateControlVisibility?.();
}

''',
    '',
)

replace_once(
    "js/ui/left-panel.js",
    '''function getCategoryById(id) {
  return window.HGNearbyFilters?.getCategoryById?.(id) || null;
}

function getNearbyBadgeOptions() {
  return window.HGNearbyFilters?.getBadgeOptions?.() || ["all"];
}

function normalizeBadgeFilter(id) {
  return window.HGNearbyFilters?.normalizeBadgeFilter?.(id) || "all";
}

''',
    '',
)

left_panel = Path("js/ui/left-panel.js")
source = left_panel.read_text()
controls_start = source.find("// ============================================================\n// NEARBY BADGE FILTER BUTTON")
controls_end = source.find("// ============================================================\n// INIT", controls_start)
if controls_start < 0 or controls_end < 0:
    raise SystemExit("Could not locate legacy Nearby filter button helper section")
source = source[:controls_start] + source[controls_end:]

init_start = source.find("  // =====================================\n  // Nearby filter button")
init_end_marker = "  updateNearbyControlVisibility();\n}"
init_end = source.find(init_end_marker, init_start)
if init_start < 0 or init_end < 0:
    raise SystemExit("Could not locate legacy Nearby filter control init block")
source = (
    source[:init_start]
    + "  // Filterkontroller eies av TypeScript-controlleren.\n"
    + "  window.HGNearbyFilterControls?.init?.();\n"
    + source[init_end + len("  updateNearbyControlVisibility();\n"):]
)
left_panel.write_text(source)

replace_once(
    "schemas/app-globals.d.ts",
    '    HGNearbyFilters?: {\n',
    '''    HGNearbyFilterControls?: {
      init?: () => void;
      updateFilterButton?: () => void;
      updateBadgeFilterButton?: () => void;
      updateFavoritesFilterButton?: () => void;
      updateSortButton?: () => void;
    };
    HGNearbyFilters?: {
''',
)
