from pathlib import Path
import re


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"Expected anchor not found in {path}: {old[:120]!r}")
    file_path.write_text(text.replace(old, new, 1))


def sub_once(path: str, pattern: str, replacement: str, marker: str, flags: int = 0) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    if marker in text:
        return
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"Expected regex anchor not found in {path}: {pattern[:140]!r}")
    file_path.write_text(updated)


# Build the new TypeScript runtime as a direct dist/web entry.
replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyDrawer.ts", out: "nearbyDrawer" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" }',
    '  { in: "js/ui/nearbyDrawer.ts", out: "nearbyDrawer" },\n  { in: "js/ui/nearbyFilters.ts", out: "nearbyFilters" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" }'
)

# Filters must exist before leftPanelMode so mode changes can reset badge state through the canonical API.
replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyDrawer", () => loadScriptOnce("js/ui/nearby-drawer.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));',
    '    await safeRun("loadNearbyDrawer", () => loadScriptOnce("js/ui/nearby-drawer.js"));\n    await safeRun("loadNearbyFilters", () => loadScriptOnce("dist/web/nearbyFilters.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));'
)

# Let the TypeScript mode controller use the canonical filter API when entering nature mode.
left_mode_path = Path("js/ui/leftPanelMode.ts")
left_mode = left_mode_path.read_text()
if 'import type { NearbyFiltersApi } from "./nearbyFilters";' not in left_mode:
    left_mode = left_mode.replace(
        '// this module owns mode selection, list visibility and render scheduling.\n',
        '// this module owns mode selection, list visibility and render scheduling.\n\nimport type { NearbyFiltersApi } from "./nearbyFilters";\n',
        1
    )
if 'HGNearbyFilters?: NearbyFiltersApi;' not in left_mode:
    left_mode = left_mode.replace(
        '  HGLeftPanelMode?: LeftPanelModeApi;\n',
        '  HGLeftPanelMode?: LeftPanelModeApi;\n  HGNearbyFilters?: NearbyFiltersApi;\n',
        1
    )
old_nature_reset = '''  if (mode === "nature") {
    win.HG_NEARBY_BADGE_FILTER = "all";
    try {
      localStorage.setItem("hg_nearby_badge_filter_v1", "all");
    } catch {}
  }'''
new_nature_reset = '''  if (mode === "nature") {
    if (win.HGNearbyFilters?.setActiveBadgeFilter) {
      win.HGNearbyFilters.setActiveBadgeFilter("all");
    } else {
      // Compatibility fallback while the legacy shell still exists.
      win.HG_NEARBY_BADGE_FILTER = "all";
      try {
        localStorage.setItem("hg_nearby_badge_filter_v1", "all");
      } catch {}
    }
  }'''
if new_nature_reset not in left_mode:
    if old_nature_reset not in left_mode:
        raise SystemExit("Expected nature-mode badge reset not found in js/ui/leftPanelMode.ts")
    left_mode = left_mode.replace(old_nature_reset, new_nature_reset, 1)
left_mode_path.write_text(left_mode)

# Declare the public runtime surface for legacy consumers.
globals_path = Path("schemas/app-globals.d.ts")
globals = globals_path.read_text()
if "HGNearbyFilters?:" not in globals:
    drawer_decl = '''    HGNearbyDrawer?: {
      isOpen?: () => boolean;
      setOpen?: (open: boolean) => void;
      open?: () => void;
      close?: () => void;
      toggle?: () => void;
      bindInteractions?: () => void;
    };
'''
    filters_decl = '''    HGNearbyFilters?: {
      initializeFromStorage?: () => void;
      normalizeSort?: (value: unknown) => "distance" | "oldest" | "newest";
      normalizeBadgeFilter?: (value: unknown) => string;
      getCategoryById?: (value: unknown) => any;
      getBadgeOptions?: () => string[];
      getActiveBadgeFilter?: () => string;
      setActiveBadgeFilter?: (value: unknown) => string;
      isBadgeFilterActive?: () => boolean;
      cyclePlaceFilter?: () => "unvisited" | "all" | "unlocked";
      cycleNatureFilter?: () => "all" | "unlocked" | "flora" | "fauna";
      toggleFavorites?: () => boolean;
      cycleSort?: () => "distance" | "oldest" | "newest";
    };
'''
    if drawer_decl not in globals:
        raise SystemExit("HGNearbyDrawer declaration anchor not found in schemas/app-globals.d.ts")
    globals = globals.replace(drawer_decl, drawer_decl + filters_decl, 1)
if "HG_NEARBY_FAVORITES_ONLY?:" not in globals:
    globals = globals.replace(
        "    HG_NEARBY_FILTER?: any;\n",
        "    HG_NEARBY_FILTER?: any;\n    HG_NEARBY_FAVORITES_ONLY?: boolean;\n",
        1
    )
globals_path.write_text(globals)

# Turn legacy left-panel helpers into thin consumers of the TypeScript state runtime.
sub_once(
    "js/ui/left-panel.js",
    r'function normalizeNearbySort\(mode\) \{.*?\n\}',
    'function normalizeNearbySort(mode) {\n  return window.HGNearbyFilters?.normalizeSort?.(mode) || "distance";\n}',
    'window.HGNearbyFilters?.normalizeSort?.(mode)',
    re.S
)
sub_once(
    "js/ui/left-panel.js",
    r'function getCategoryById\(id\) \{.*?\n\}',
    'function getCategoryById(id) {\n  return window.HGNearbyFilters?.getCategoryById?.(id) || null;\n}',
    'window.HGNearbyFilters?.getCategoryById?.(id)',
    re.S
)
sub_once(
    "js/ui/left-panel.js",
    r'function getNearbyBadgeOptions\(\) \{.*?\n\}',
    'function getNearbyBadgeOptions() {\n  return window.HGNearbyFilters?.getBadgeOptions?.() || ["all"];\n}',
    'window.HGNearbyFilters?.getBadgeOptions?.()',
    re.S
)
sub_once(
    "js/ui/left-panel.js",
    r'function normalizeBadgeFilter\(id\) \{.*?\n\}',
    'function normalizeBadgeFilter(id) {\n  return window.HGNearbyFilters?.normalizeBadgeFilter?.(id) || "all";\n}',
    'window.HGNearbyFilters?.normalizeBadgeFilter?.(id)',
    re.S
)
sub_once(
    "js/ui/left-panel.js",
    r'function getActiveBadgeFilter\(\) \{.*?\n\}',
    'function getActiveBadgeFilter() {\n  return window.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";\n}',
    'window.HGNearbyFilters?.getActiveBadgeFilter?.()',
    re.S
)
sub_once(
    "js/ui/left-panel.js",
    r'  window\.HG_NEARBY_BADGE_FILTER = next;\n  try \{ localStorage\.setItem\("hg_nearby_badge_filter_v1", next\); \} catch \{\}',
    '  window.HGNearbyFilters?.setActiveBadgeFilter?.(next);',
    'window.HGNearbyFilters?.setActiveBadgeFilter?.(next)'
)
sub_once(
    "js/ui/left-panel.js",
    r'function isBadgeFilterActive\(\) \{.*?\n\}',
    'function isBadgeFilterActive() {\n  return window.HGNearbyFilters?.isBadgeFilterActive?.() || false;\n}',
    'window.HGNearbyFilters?.isBadgeFilterActive?.()',
    re.S
)
sub_once(
    "js/ui/left-panel.js",
    r'\n    window\.HG_NEARBY_FILTER =\n      localStorage\.getItem\("hg_nearby_filter_v1"\) \|\| "unvisited";.*?window\.HG_NATURE_FILTER =\n      localStorage\.getItem\("hg_nature_filter_v1"\) \|\| "all";\n',
    '\n    window.HGNearbyFilters?.initializeFromStorage?.();\n',
    'window.HGNearbyFilters?.initializeFromStorage?.()',
    re.S
)

left_panel_path = Path("js/ui/left-panel.js")
left_panel = left_panel_path.read_text()
left_panel = left_panel.replace('  const PLACES_ORDER = ["unvisited", "all", "unlocked"];\n', '')
left_panel = left_panel.replace('  const NATURE_ORDER = ["all", "unlocked", "flora", "fauna"];\n', '')
left_panel = left_panel.replace('  const SORT_ORDER = ["distance", "oldest", "newest"];\n', '')
left_panel_path.write_text(left_panel)

sub_once(
    "js/ui/left-panel.js",
    r'        const i = NATURE_ORDER\.indexOf\(window\.HG_NATURE_FILTER\);\n        window\.HG_NATURE_FILTER = NATURE_ORDER\[\(i \+ 1\) % NATURE_ORDER\.length\];\n        try \{ localStorage\.setItem\("hg_nature_filter_v1", window\.HG_NATURE_FILTER\); \} catch \{\}',
    '        window.HG_NATURE_FILTER = window.HGNearbyFilters?.cycleNatureFilter?.() || "all";',
    'window.HGNearbyFilters?.cycleNatureFilter?.()'
)
sub_once(
    "js/ui/left-panel.js",
    r'        const i = PLACES_ORDER\.indexOf\(window\.HG_NEARBY_FILTER\);\n        window\.HG_NEARBY_FILTER = PLACES_ORDER\[\(i \+ 1\) % PLACES_ORDER\.length\];\n        try \{ localStorage\.setItem\("hg_nearby_filter_v1", window\.HG_NEARBY_FILTER\); \} catch \{\}',
    '        window.HG_NEARBY_FILTER = window.HGNearbyFilters?.cyclePlaceFilter?.() || "unvisited";',
    'window.HGNearbyFilters?.cyclePlaceFilter?.()'
)
sub_once(
    "js/ui/left-panel.js",
    r'      window\.HG_NEARBY_FAVORITES_ONLY = !window\.HG_NEARBY_FAVORITES_ONLY;\n      try \{ localStorage\.setItem\("hg_nearby_favorites_filter_v1", window\.HG_NEARBY_FAVORITES_ONLY \? "1" : "0"\); \} catch \{\}',
    '      window.HG_NEARBY_FAVORITES_ONLY = window.HGNearbyFilters?.toggleFavorites?.() || false;',
    'window.HGNearbyFilters?.toggleFavorites?.()'
)
sub_once(
    "js/ui/left-panel.js",
    r'      const current = normalizeNearbySort\(window\.HG_NEARBY_SORT\);\n      const i = SORT_ORDER\.indexOf\(current\);\n      const next = SORT_ORDER\[\(i \+ 1\) % SORT_ORDER\.length\] \|\| "distance";\n      window\.HG_NEARBY_SORT = next;\n      try \{ localStorage\.setItem\("hg_nearby_sort_v1", next\); \} catch \{\}',
    '      window.HG_NEARBY_SORT = window.HGNearbyFilters?.cycleSort?.() || "distance";',
    'window.HGNearbyFilters?.cycleSort?.()'
)
