from pathlib import Path


def replace_once(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    source = path.read_text()
    if old not in source:
        raise SystemExit(f"Expected migration anchor not found in {path_str}: {old[:120]!r}")
    path.write_text(source.replace(old, new, 1))


replace_once(
    "js/ui/left-panel.js",
    '''  // =====================================
  // Utforsk-drawer: toggle, Escape, klikk utenfor
  // =====================================

  // Drawer starter alltid lukket (synker også aria-expanded på togglen).
  closeNearbyDrawer();

  const exploreToggle = hg$("nearbyExploreToggle");
  if (exploreToggle) {
    exploreToggle.addEventListener("click", toggleNearbyDrawer);
  }

  // Alle faktiske oppføringer i Utforsk-draweren skal gi kartet/kortet plass
  // straks de velges. Delegert lytting dekker også lister som rendres på nytt.
  panel.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const item = target?.closest(".nearby-item");
    if (!item || !panel.contains(item)) return;

    closeNearbyDrawer();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isNearbyDrawerOpen()) return;
    closeNearbyDrawer();
    exploreToggle?.focus?.();
  });

  document.addEventListener("click", (event) => {
    if (!isNearbyDrawerOpen()) return;

    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("#nearbyListContainer, #nearbyExploreToggle")) return;

    closeNearbyDrawer();
  });''',
    '''  // Drawer-state og interaksjoner eies av TypeScript-controlleren.
  window.HGNearbyDrawer?.bindInteractions?.();''',
)

replace_once(
    "schemas/app-globals.d.ts",
    '''    HGNearbyDrawer?: {
      isOpen?: () => boolean;
      setOpen?: (open: boolean) => void;
      open?: () => void;
      close?: () => void;
      toggle?: () => void;
    };''',
    '''    HGNearbyDrawer?: {
      isOpen?: () => boolean;
      setOpen?: (open: boolean) => void;
      open?: () => void;
      close?: () => void;
      toggle?: () => void;
      bindInteractions?: () => void;
    };''',
)
