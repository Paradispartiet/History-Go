type LayerMode = "explore" | "map";

type LayerOptions = {
  hideInMapMode?: boolean;
  showInMapMode?: boolean;
  ariaHiddenControlsDisplay?: boolean;
  display?: string;
};

type NormalizedLayerOptions = Required<LayerOptions>;

type LayerEntry = {
  name: string;
  el: HTMLElement;
  z: number;
  opts: NormalizedLayerOptions;
};

type LayerManagerApi = {
  init: () => void;
  register: (name: string, element: Element | null, z: number, options?: LayerOptions) => LayerEntry | null;
  show: (name: string) => void;
  hide: (name: string) => void;
  setMode: (mode: LayerMode) => void;
  getMode: () => LayerMode;
  Z: Readonly<Record<string, number>>;
};

type RuntimeWindow = Window & typeof globalThis & {
  LayerManager?: LayerManagerApi;
  HGMap?: {
    resize?: () => void;
    maybeDrawMarkers?: () => void;
  };
};

const win = window as RuntimeWindow;

function readLayerIndex(property: string, fallback: number): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(property);
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// CSS owns the layer contract. Runtime reads the same values whenever it must
// apply an inline z-index, so JavaScript cannot silently create another order.
const Z = Object.freeze({
  MAP: readLayerIndex("--hg-z-map", 0),
  MAP_CONTROLS: 50,
  NEARBY: readLayerIndex("--hg-z-nearby", 80),
  PLACECARD: readLayerIndex("--hg-z-placecard", 100),
  FOOTER: readLayerIndex("--hg-z-footer", 110),
  NEXTUP: 115,
  HEADER: readLayerIndex("--hg-z-header", 120),
  SEARCH: 130,
  TOAST: 900,
  MODAL: 1000
});

const state: {
  mode: LayerMode;
  layers: Map<string, LayerEntry>;
  initialized: boolean;
} = {
  mode: "explore",
  layers: new Map(),
  initialized: false
};

function query(selector: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(selector);
}

function byId(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function setZ(element: Element | null, z: number): void {
  if (!(element instanceof HTMLElement)) return;
  element.style.zIndex = String(z);
}

function showEl(element: HTMLElement | null, display = ""): void {
  if (!element) return;
  element.style.display = display;
  element.style.pointerEvents = "";
}

function hideEl(element: HTMLElement | null): void {
  if (!element) return;
  element.style.display = "none";
  element.style.pointerEvents = "none";
}

function register(
  name: string,
  element: Element | null,
  z: number,
  options: LayerOptions = {}
): LayerEntry | null {
  if (!(element instanceof HTMLElement)) return null;

  const entry: LayerEntry = {
    name,
    el: element,
    z,
    opts: {
      hideInMapMode: Boolean(options.hideInMapMode),
      showInMapMode: Boolean(options.showInMapMode),
      ariaHiddenControlsDisplay: Boolean(options.ariaHiddenControlsDisplay),
      display: options.display ?? ""
    }
  };

  state.layers.set(name, entry);
  setZ(element, z);
  return entry;
}

function applyVisibilityFromAria(entry: LayerEntry): void {
  if (!entry.opts.ariaHiddenControlsDisplay || state.mode === "map") return;
  const hidden = entry.el.getAttribute("aria-hidden") === "true";
  if (hidden) hideEl(entry.el);
  else showEl(entry.el, entry.opts.display);
}

function syncMapViewportLock(isMap: boolean): void {
  const docEl = document.documentElement;
  const body = document.body;
  if (!docEl || !body) return;

  if (isMap) {
    window.scrollTo(0, 0);
    docEl.scrollTop = 0;
    body.scrollTop = 0;
    docEl.classList.add("map-scroll-locked");
    body.classList.add("map-scroll-locked");
  } else {
    docEl.classList.remove("map-scroll-locked");
    body.classList.remove("map-scroll-locked");
  }
}

function applyMode(mode: LayerMode): void {
  state.mode = mode;
  const isMap = mode === "map";

  for (const entry of state.layers.values()) {
    const { el, opts, name } = entry;
    if (name === "toast" || name === "badgeModal") continue;

    // The map-controls host exists in both modes. CSS decides which controls are
    // visible in explore mode (category filter only) and map mode (full dock).
    if (name === "mapControls") {
      showEl(el, "flex");
      continue;
    }

    if (isMap) {
      if (opts.showInMapMode) showEl(el, opts.display);
      else if (opts.hideInMapMode) hideEl(el);
      else showEl(el, opts.display);
      continue;
    }

    if (opts.ariaHiddenControlsDisplay) applyVisibilityFromAria(entry);
    else showEl(el, opts.display);
  }

  document.body.classList.toggle("mode-map", isMap);
  syncMapViewportLock(isMap);

  if (isMap) {
    // The map layer must be visible before MapLibre measures the viewport;
    // otherwise a previously hidden map can render as a thin grey strip.
    const mapLayer = byId("mapLayer");
    const map = byId("map");
    showEl(mapLayer || map);

    requestAnimationFrame(() => {
      win.HGMap?.resize?.();
      win.HGMap?.maybeDrawMarkers?.();
    });
  }
}

function wireButtons(): void {
  const btnSeeMap = byId("btnSeeMap");
  const btnExitMap = byId("btnExitMap");

  if (btnSeeMap) {
    btnSeeMap.addEventListener("click", () => {
      LayerManager.setMode(state.mode === "map" ? "explore" : "map");
    });
  }

  if (btnExitMap) {
    btnExitMap.addEventListener("click", () => {
      LayerManager.setMode("explore");
    });
  }
}

function observeAriaHidden(layerName: string): void {
  const entry = state.layers.get(layerName);
  if (!entry) return;

  const observer = new MutationObserver(() => applyVisibilityFromAria(entry));
  observer.observe(entry.el, { attributes: true, attributeFilter: ["aria-hidden"] });
  applyVisibilityFromAria(entry);
}

function init(): void {
  if (state.initialized) return;
  state.initialized = true;

  const header = query("header.site-header");
  const mapLayer = byId("mapLayer");
  const map = byId("map");
  const mapControls = query(".map-controls");
  const nearby = byId("nearbyListContainer");
  const placeCard = byId("placeCard");
  const footer = query(".app-footer");
  const nextUp = byId("mpNextUp");
  const toast = byId("toast");
  const badgeModal = byId("badgeModal");

  register("map", mapLayer || map, Z.MAP);
  register("mapControls", mapControls, Z.MAP_CONTROLS, {
    display: "flex",
    showInMapMode: true
  });
  register("nearby", nearby, Z.NEARBY, {
    hideInMapMode: true
  });
  register("footer", footer, Z.FOOTER, {
    hideInMapMode: true,
    display: "flex"
  });
  register("nextUp", nextUp, Z.NEXTUP, {
    hideInMapMode: true
  });
  register("placeCard", placeCard, Z.PLACECARD, {
    hideInMapMode: true
  });
  register("header", header, Z.HEADER, {
    hideInMapMode: true,
    display: "flex"
  });
  register("toast", toast, Z.TOAST);
  register("badgeModal", badgeModal, Z.MODAL);

  setZ(header, Z.HEADER);
  setZ(placeCard, Z.PLACECARD);
  setZ(footer, Z.FOOTER);
  setZ(nearby, Z.NEARBY);
  setZ(mapControls, Z.MAP_CONTROLS);

  observeAriaHidden("nearby");
  wireButtons();
  applyMode("explore");
}

function show(name: string): void {
  const entry = state.layers.get(name);
  if (entry) showEl(entry.el, entry.opts.display);
}

function hide(name: string): void {
  const entry = state.layers.get(name);
  if (entry) hideEl(entry.el);
}

function setMode(mode: LayerMode): void {
  if (mode !== "explore" && mode !== "map") return;
  applyMode(mode);
}

function getMode(): LayerMode {
  return state.mode;
}

const LayerManager: LayerManagerApi = {
  init,
  register,
  show,
  hide,
  setMode,
  getMode,
  Z
};

win.LayerManager = LayerManager;

export { LayerManager };
export type { LayerEntry, LayerManagerApi, LayerMode, LayerOptions };
