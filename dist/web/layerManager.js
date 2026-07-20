(() => {
  // js/core/layerManager.ts
  var win = window;
  function readLayerIndex(property, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(property);
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  var Z = Object.freeze({
    MAP: readLayerIndex("--hg-z-map", 0),
    MAP_CONTROLS: 50,
    NEARBY: readLayerIndex("--hg-z-nearby", 80),
    PLACECARD: readLayerIndex("--hg-z-placecard", 100),
    FOOTER: readLayerIndex("--hg-z-footer", 110),
    NEXTUP: 115,
    HEADER: readLayerIndex("--hg-z-header", 120),
    SEARCH: 130,
    TOAST: 900,
    MODAL: 1e3
  });
  var state = {
    mode: "explore",
    layers: /* @__PURE__ */ new Map(),
    initialized: false
  };
  function query(selector) {
    return document.querySelector(selector);
  }
  function byId(id) {
    return document.getElementById(id);
  }
  function setZ(element, z) {
    if (!(element instanceof HTMLElement)) return;
    element.style.zIndex = String(z);
  }
  function showEl(element, display = "") {
    if (!element) return;
    element.style.display = display;
    element.style.pointerEvents = "";
  }
  function hideEl(element) {
    if (!element) return;
    element.style.display = "none";
    element.style.pointerEvents = "none";
  }
  function register(name, element, z, options = {}) {
    var _a;
    if (!(element instanceof HTMLElement)) return null;
    const entry = {
      name,
      el: element,
      z,
      opts: {
        hideInMapMode: Boolean(options.hideInMapMode),
        showInMapMode: Boolean(options.showInMapMode),
        ariaHiddenControlsDisplay: Boolean(options.ariaHiddenControlsDisplay),
        display: (_a = options.display) != null ? _a : ""
      }
    };
    state.layers.set(name, entry);
    setZ(element, z);
    return entry;
  }
  function applyVisibilityFromAria(entry) {
    if (!entry.opts.ariaHiddenControlsDisplay || state.mode === "map") return;
    const hidden = entry.el.getAttribute("aria-hidden") === "true";
    if (hidden) hideEl(entry.el);
    else showEl(entry.el, entry.opts.display);
  }
  function syncMapViewportLock(isMap) {
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
  function applyMode(mode) {
    state.mode = mode;
    const isMap = mode === "map";
    for (const entry of state.layers.values()) {
      const { el, opts, name } = entry;
      if (name === "toast" || name === "badgeModal") continue;
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
      const mapLayer = byId("mapLayer");
      const map = byId("map");
      showEl(mapLayer || map);
      requestAnimationFrame(() => {
        var _a, _b, _c, _d;
        (_b = (_a = win.HGMap) == null ? void 0 : _a.resize) == null ? void 0 : _b.call(_a);
        (_d = (_c = win.HGMap) == null ? void 0 : _c.maybeDrawMarkers) == null ? void 0 : _d.call(_c);
      });
    }
  }
  function wireButtons() {
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
  function observeAriaHidden(layerName) {
    const entry = state.layers.get(layerName);
    if (!entry) return;
    const observer = new MutationObserver(() => applyVisibilityFromAria(entry));
    observer.observe(entry.el, { attributes: true, attributeFilter: ["aria-hidden"] });
    applyVisibilityFromAria(entry);
  }
  function init() {
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
  function show(name) {
    const entry = state.layers.get(name);
    if (entry) showEl(entry.el, entry.opts.display);
  }
  function hide(name) {
    const entry = state.layers.get(name);
    if (entry) hideEl(entry.el);
  }
  function setMode(mode) {
    if (mode !== "explore" && mode !== "map") return;
    applyMode(mode);
  }
  function getMode() {
    return state.mode;
  }
  var LayerManager = {
    init,
    register,
    show,
    hide,
    setMode,
    getMode,
    Z
  };
  win.LayerManager = LayerManager;
})();
