// Canonical state controller for the Nearby/Utforsk drawer.
// Interaction binding remains in left-panel.js during the strangler migration;
// this module owns the drawer's DOM state contract and public API.

export type NearbyDrawerApi = {
  isOpen: () => boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

type RuntimeWindow = Window & typeof globalThis & {
  rerenderActiveLeftPanelMode?: () => void;
  HGNearbyDrawer?: NearbyDrawerApi;
};

const win = window as RuntimeWindow;

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

win.HGNearbyDrawer = {
  isOpen,
  setOpen,
  open,
  close,
  toggle
};
