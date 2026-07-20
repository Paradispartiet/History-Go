from pathlib import Path


def replace_once(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    source = path.read_text()
    if old not in source:
        raise SystemExit(f"Expected migration anchor not found in {path_str}: {old[:140]!r}")
    path.write_text(source.replace(old, new, 1))


replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyFilterControls.ts", out: "nearbyFilterControls" }\n',
    '  { in: "js/ui/nearbyFilterControls.ts", out: "nearbyFilterControls" },\n  { in: "js/ui/nearbyBadgesPanel.ts", out: "nearbyBadgesPanel" }\n',
)

replace_once(
    "js/app.js",
    '    await safeRun("loadNearbyFilterControls", () => loadScriptOnce("dist/web/nearbyFilterControls.js"));\n    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));',
    '    await safeRun("loadNearbyFilterControls", () => loadScriptOnce("dist/web/nearbyFilterControls.js"));\n    await safeRun("loadNearbyBadgesPanel", () => loadScriptOnce("dist/web/nearbyBadgesPanel.js"));\n    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));',
)

replace_once(
    "js/ui/left-panel.js",
    '''function tUI(key, fallback = "") {
  try {
    return window.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function tfUI(key, fallback = "", vars = {}) {
  const template = tUI(key, fallback);
  return String(template).replace(/\\{(\\w+)\\}/g, (_, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

''',
    '',
)

left_panel = Path("js/ui/left-panel.js")
source = left_panel.read_text()
badge_start = source.find("// ============================================================\n// BADGE FILTER HELPERS")
badge_end = source.find("// ============================================================\n// INIT", badge_start)
if badge_start < 0 or badge_end < 0:
    raise SystemExit("Could not locate legacy badge helper/panel section")
source = source[:badge_start] + source[badge_end:]
source = source.replace(
    "  renderLeftBadges();\n",
    "  window.HGNearbyBadgesPanel?.render?.();\n",
    1,
)
left_panel.write_text(source)

replace_once(
    "schemas/app-globals.d.ts",
    '    HGNearbyFilterControls?: {\n',
    '''    HGNearbyBadgesPanel?: {
      render?: () => void;
    };
    renderLeftBadges?: () => void;
    HGNearbyFilterControls?: {
''',
)
