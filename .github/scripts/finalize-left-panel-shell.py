from pathlib import Path


def replace_once(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    source = path.read_text()
    if old not in source:
        raise SystemExit(f"Expected migration anchor not found in {path_str}: {old[:140]!r}")
    path.write_text(source.replace(old, new, 1))


replace_once(
    "build/build-web.mjs",
    '  { in: "js/ui/nearbyBadgesPanel.ts", out: "nearbyBadgesPanel" }\n',
    '  { in: "js/ui/nearbyBadgesPanel.ts", out: "nearbyBadgesPanel" },\n  { in: "js/ui/left-panel.ts", out: "left-panel" }\n',
)

replace_once(
    "build/build-web.mjs",
    '  { out: "nearbyDrawer", target: "js/ui/nearby-drawer.js" }\n',
    '  { out: "nearbyDrawer", target: "js/ui/nearby-drawer.js" },\n  { out: "left-panel", target: "js/ui/left-panel.js" }\n',
)

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
