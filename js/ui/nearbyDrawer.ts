// Canonical state and interaction controller for the Nearby/Utforsk drawer.
// The legacy left-panel shell can keep its public wrapper names during migration,
// while this module owns drawer state, accessibility sync and close/open behavior.

export type NearbyDrawerApi = {
  isOpen: () => boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  bindInteractions: () => void;
};

type RuntimeWindow = Window & typeof globalThis & {
  rerenderActiveLeftPanelMode?: () => void;
  HGNearbyDrawer?: NearbyDrawerApi;
};

const win = window as RuntimeWindow;
let interactionsBound = false;

function getPanel(): HTMLElement | null {
  return document.getElementById("nearbyListContainer");
}

function getToggle(): HTMLElement | null {
  return document.getElementById("nearbyExploreToggle");
}

function isOpen(): boolean {
  return getPanel()?.classList.contains("is-drawer-open") ?? false;
}

function setOpen(open: boolean): void {
  const panel = getPanel();
  if (!panel) return;

  panel.classList.toggle("is-drawer-open", open);
  panel.classList.toggle("is-drawer-closed", !open);

  getToggle()?.setAttribute("aria-expanded", open ? "true" : "false");

  // Lists may have changed while the drawer was closed.
  if (open) win.rerenderActiveLeftPanelMode?.();
}

function open(): void {
  setOpen(true);
}

function close(): void {
  setOpen(false);
}

function toggle(): void {
  setOpen(!isOpen());
}

function bindInteractions(): void {
  if (interactionsBound) return;

  const panel = getPanel();
  if (!panel) return;

  interactionsBound = true;
  const exploreToggle = getToggle();

  // Drawer starts closed and aria-expanded follows the canonical state.
  close();

  exploreToggle?.addEventListener("click", toggle);

  // Delegated listener covers Nearby entries that are rendered again later.
  panel.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const item = target?.closest(".nearby-item");
    if (!item || !panel.contains(item)) return;
    close();
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !isOpen()) return;
    close();
    exploreToggle?.focus();
  });

  document.addEventListener("click", event => {
    if (!isOpen()) return;

    const target = event.target;
    if (!(target instanceof Node)) return;
    if (panel.contains(target) || exploreToggle?.contains(target)) return;

    close();
  });
}

win.HGNearbyDrawer = {
  isOpen,
  setOpen,
  open,
  close,
  toggle,
  bindInteractions
};
