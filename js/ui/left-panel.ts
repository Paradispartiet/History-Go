// Canonical orchestration shell for the Nearby/Utforsk left panel.
// State, mode/render scheduling, drawer interactions, filter controls and badge rendering
// live in focused TypeScript modules; this file wires those runtimes to the page lifecycle.

import type { LeftPanelMode, LeftPanelModeApi } from "./leftPanelMode";
import type { NearbyBadgesPanelApi } from "./nearbyBadgesPanel";
import type { NearbyDrawerApi } from "./nearbyDrawer";
import type { NearbyFilterControlsApi } from "./nearbyFilterControls";
import type { NearbyFiltersApi } from "./nearbyFilters";

type ResizeApi = {
  resize?: () => void;
};

type LayerManagerApi = {
  getMode?: () => string;
};

type RuntimeWindow = Window & typeof globalThis & {
  __HG_LEFT_PANEL_INIT_DONE__?: boolean;
  HGLeftPanelMode?: LeftPanelModeApi;
  HGNearbyDrawer?: NearbyDrawerApi;
  HGNearbyFilters?: NearbyFiltersApi;
  HGNearbyBadgesPanel?: NearbyBadgesPanelApi;
  HGNearbyFilterControls?: NearbyFilterControlsApi;
  renderNearbyNature?: () => void;
  LayerManager?: LayerManagerApi;
  HGMap?: ResizeApi;
  MAP?: ResizeApi;
  initPlaceCardCollapse?: (...args: unknown[]) => unknown;
  initLeftPanel?: () => void;
  setLeftPanelMode?: (mode: unknown) => LeftPanelMode;
  rerenderActiveLeftPanelMode?: () => void;
  renderActiveLeftPanelModeNow?: () => void;
  openNearbyDrawer?: () => void;
  closeNearbyDrawer?: () => void;
  toggleNearbyDrawer?: () => void;
  setNearbyCollapsed?: (hidden: unknown) => void;
};

const win = window as RuntimeWindow;

function byId(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function activeLeftPanelMode(): LeftPanelMode {
  return win.HGLeftPanelMode?.getActiveMode?.() || "nearby";
}

function renderActiveLeftPanelModeNow(): void {
  win.HGLeftPanelMode?.renderNow?.();
}

function rerenderActiveLeftPanelMode(): void {
  win.HGLeftPanelMode?.rerender?.();
}

function setLeftPanelMode(mode: unknown): LeftPanelMode {
  return win.HGLeftPanelMode?.setMode?.(mode) || "nearby";
}

function isNearbyDrawerOpen(): boolean {
  return Boolean(win.HGNearbyDrawer?.isOpen?.());
}

function openNearbyDrawer(): void {
  win.HGNearbyDrawer?.open?.();
}

function closeNearbyDrawer(): void {
  win.HGNearbyDrawer?.close?.();
}

function toggleNearbyDrawer(): void {
  win.HGNearbyDrawer?.toggle?.();
}

function syncLeftPanelFrame(): void {
  const root = document.documentElement;
  const styles = win.getComputedStyle(root);
  const visualHeaderHeight = Number.parseFloat(
    styles.getPropertyValue("--hg-visual-header-height")
  );

  let headerHeight = Number.isFinite(visualHeaderHeight) ? visualHeaderHeight : 0;

  if (!headerHeight) {
    const header = document.querySelector("header") || document.querySelector(".site-header");
    if (!header) return;
    headerHeight = header.getBoundingClientRect().bottom;
  }

  headerHeight = Math.max(0, Math.round(headerHeight));
  root.style.setProperty("--hg-header-h", `${headerHeight}px`);
}

function bindModeControls(select: HTMLSelectElement | null): void {
  select?.addEventListener("change", () => setLeftPanelMode(select.value));

  document.querySelectorAll(".nearby-tab").forEach(button => {
    button.addEventListener("click", () => {
      const mode = button.getAttribute("data-leftmode") || "nearby";
      if (select) select.value = mode;
      setLeftPanelMode(mode);
      if (!isNearbyDrawerOpen()) openNearbyDrawer();
    });
  });
}

function bindNatureRefreshEvents(): void {
  const renderNatureWhenActive = (): void => {
    if (activeLeftPanelMode() === "nature") {
      win.renderNearbyNature?.();
    }
  };

  win.addEventListener("hg:nature-loaded", renderNatureWhenActive);
  win.addEventListener("hg:nature", renderNatureWhenActive);
}

function bindFrameSync(): void {
  syncLeftPanelFrame();
  win.addEventListener("resize", syncLeftPanelFrame);

  const placeCard = byId("placeCard");
  if (placeCard && "ResizeObserver" in win) {
    new ResizeObserver(syncLeftPanelFrame).observe(placeCard);
  }
}

function initLeftPanel(): void {
  if (win.__HG_LEFT_PANEL_INIT_DONE__) return;
  win.__HG_LEFT_PANEL_INIT_DONE__ = true;

  const panel = byId("nearbyListContainer");
  if (!panel) return;

  const selectElement = byId("leftPanelMode");
  const select = selectElement instanceof HTMLSelectElement ? selectElement : null;

  win.HGNearbyFilters?.initializeFromStorage?.();

  const mode = activeLeftPanelMode();
  if (select) select.value = mode;
  setLeftPanelMode(mode);

  bindModeControls(select);
  win.HGNearbyDrawer?.bindInteractions?.();
  win.HGNearbyBadgesPanel?.render?.();
  bindNatureRefreshEvents();
  bindFrameSync();
  win.HGNearbyFilterControls?.init?.();
}

function setNearbyCollapsed(hidden: unknown): void {
  const wantHidden = Boolean(hidden);
  const shouldHide = win.LayerManager?.getMode?.() === "map" ? wantHidden : false;

  const panel = byId("nearbyListContainer");
  if (!panel) return;

  panel.classList.toggle("is-hidden", shouldHide);

  // A collapse request closes the drawer even if another map mode later keeps
  // the panel visible; reopening always starts from the explicit Explore toggle.
  if (wantHidden) closeNearbyDrawer();

  win.HGMap?.resize?.();
  win.MAP?.resize?.();
}

win.initLeftPanel = initLeftPanel;
win.setLeftPanelMode = setLeftPanelMode;
win.rerenderActiveLeftPanelMode = rerenderActiveLeftPanelMode;
win.renderActiveLeftPanelModeNow = renderActiveLeftPanelModeNow;
win.openNearbyDrawer = openNearbyDrawer;
win.closeNearbyDrawer = closeNearbyDrawer;
win.toggleNearbyDrawer = toggleNearbyDrawer;
win.setNearbyCollapsed = setNearbyCollapsed;

// place-card.js owns this API. Referencing it through window keeps the startup
// order safe while preserving the historical global contract when it is present.
if (typeof win.initPlaceCardCollapse === "function") {
  win.initPlaceCardCollapse = win.initPlaceCardCollapse;
}
