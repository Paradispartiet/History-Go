from pathlib import Path
import re


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"Expected anchor not found in {path}: {old[:140]!r}")
    file_path.write_text(text.replace(old, new, 1))


# Build the controls as a direct dist/web TypeScript runtime.
replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyFilters.ts", out: "nearbyFilters" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" }',
    '  { in: "js/ui/nearbyFilters.ts", out: "nearbyFilters" },\n  { in: "js/ui/leftPanelMode.ts", out: "leftPanelMode" },\n  { in: "js/ui/nearbyControls.ts", out: "nearbyControls" }'
)

# Controls depend on both filter state and panel mode, and must publish the legacy
# update hooks before left-panel.js initializes the panel.
replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyFilters", () => loadScriptOnce("dist/web/nearbyFilters.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));\n    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));',
    '    await safeRun("loadNearbyFilters", () => loadScriptOnce("dist/web/nearbyFilters.js"));\n    await safeRun("loadLeftPanelMode", () => loadScriptOnce("dist/web/leftPanelMode.js"));\n    await safeRun("loadNearbyControls", () => loadScriptOnce("dist/web/nearbyControls.js"));\n    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));'
)

# Public runtime contracts used by legacy consumers and the mode controller.
globals_path = Path("schemas/app-globals.d.ts")
globals = globals_path.read_text()
if "HGNearbyControls?:" not in globals:
    mode_decl = '''    HGLeftPanelMode?: {
      getActiveMode?: () => "nearby" | "people" | "nature" | "routes" | "badges";
      setMode?: (mode: unknown) => "nearby" | "people" | "nature" | "routes" | "badges";
      renderNow?: () => void;
      rerender?: () => void;
      updateControlVisibility?: () => void;
    };
'''
    controls_decl = '''    HGNearbyControls?: {
      bind?: () => void;
      refresh?: () => void;
      updateFilterButton?: () => void;
      updateBadgeFilterButton?: () => void;
      updateFavoritesFilterButton?: () => void;
      updateSortButton?: () => void;
      badgeFilterTapIsLocked?: () => boolean;
    };
    updateNearbyFilterButton?: () => void;
    updateNearbyBadgeFilterButton?: () => void;
    updateNearbyFavoritesFilterButton?: () => void;
    updateNearbySortButton?: () => void;
'''
    if mode_decl not in globals:
        raise SystemExit("HGLeftPanelMode declaration anchor missing")
    globals = globals.replace(mode_decl, mode_decl + controls_decl, 1)
globals_path.write_text(globals)

left_path = Path("js/ui/left-panel.js")
left = left_path.read_text()

# The badge list still uses the lock, but the lock itself is now owned by the controls runtime.
lock_pattern = re.compile(
    r'let _badgeFilterTapLockedUntil = 0;\n\nfunction badgeFilterTapIsLocked\(\) \{.*?\n\}',
    re.S,
)
lock_replacement = '''function badgeFilterTapIsLocked() {
  return !!window.HGNearbyControls?.badgeFilterTapIsLocked?.();
}'''
if lock_replacement not in left:
    left, count = lock_pattern.subn(lock_replacement, left, count=1)
    if count != 1:
        raise SystemExit("Badge filter tap-lock anchor missing")

# Button creation is entirely owned by nearbyControls.ts now.
button_section_start = left.find("// ============================================================\n// NEARBY BADGE FILTER BUTTON")
button_section_end = left.find("// ============================================================\n// INIT", button_section_start)
if button_section_start < 0 or button_section_end < 0:
    raise SystemExit("Nearby button creation section anchors missing")
left = left[:button_section_start] + left[button_section_end:]

# Replace the full control-strip setup/render/binding block in initLeftPanel with one delegate.
control_start_marker = "  // =====================================\n  // Nearby filter button\n  // ====================================="
control_end_marker = "\n}\n\n// ============================================================\n// COLLAPSE API"
control_start = left.find(control_start_marker)
control_end = left.find(control_end_marker, control_start)
if control_start < 0 or control_end < 0:
    raise SystemExit("Nearby control init block anchors missing")
left = (
    left[:control_start]
    + "  // Filter control creation, rendering and interactions are owned by TypeScript.\n"
    + "  window.HGNearbyControls?.bind?.();"
    + left[control_end:]
)

# Remove helper functions that only served the migrated control-strip implementation.
for pattern in (
    r'\nfunction normalizeNearbySort\(mode\) \{.*?\n\}\n',
    r'\nfunction getNearbyControlsContainer\(placeFilterBtn\) \{.*?\n\}\n',
    r'\nfunction getCategoryById\(id\) \{.*?\n\}\n',
    r'\nfunction getNearbyBadgeOptions\(\) \{.*?\n\}\n',
    r'\nfunction normalizeBadgeFilter\(id\) \{.*?\n\}\n',
):
    left, _ = re.subn(pattern, "\n", left, count=1, flags=re.S)

left_path.write_text(left)
