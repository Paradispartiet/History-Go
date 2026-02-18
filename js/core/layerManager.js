(function () {
  "use strict";

  // Engine z-index plan (låst, deterministisk)
  const Z = {
    MAP: 0,
    MAP_CONTROLS: 50,

    NEARBY: 80,
    FOOTER: 90,
    NEXTUP: 95,
    PLACECARD: 100,
    HEADER: 120,

    SEARCH: 130,   // #searchResults ligger i header, men ok å reservere
    TOAST: 900,
    MODAL: 1000
  };

  const state = {
    mode: "explore", // "explore" | "map"
    layers: new Map(),
    initialized: false
  };

  function $(sel) {
    return document.querySelector(sel);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setZ(el, z) {
    if (!el) return;
    el.style.zIndex = String(z);
  }

function showEl(el, display = "") {
  if (!el) return;
  el.style.display = display || "";
  el.style.pointerEvents = "";
}

function hideEl(el) {
  if (!el) return;
  el.style.display = "none";
  el.style.pointerEvents = "none";
}

  function register(name, el, z, opts = {}) {
    if (!el) return null;
    const entry = {
      name,
      el,
      z,
      opts: {
        hideInMapMode: !!opts.hideInMapMode,
        showInMapMode: !!opts.showInMapMode,
        // If true, visibility is controlled by aria-hidden (default false)
        ariaHiddenControlsDisplay: !!opts.ariaHiddenControlsDisplay,
        // Default display when shown (optional)
        display: opts.display ?? ""
      }
    };
    state.layers.set(name, entry);
    setZ(el, z);
    return entry;
  }

  function applyVisibilityFromAria(entry) {
    const el = entry.el;
    if (!el) return;

    // Only apply if this layer is aria-driven
    if (!entry.opts.ariaHiddenControlsDisplay) return;

    const aria = el.getAttribute("aria-hidden");
    const hidden = aria === "true";

    if (state.mode === "map") {
      // Map mode overrides everything else (handled in applyMode)
      return;
    }

    if (hidden) hideEl(el);
    else showEl(el, entry.opts.display);
  }

  function applyMode(mode) {
    state.mode = mode;

    // Map-only mode: show map + controls, hide UI layers
    const isMap = mode === "map";

    for (const entry of state.layers.values()) {
      const { el, opts } = entry;
      if (!el) continue;

      // Always keep modals/toast logic separate (we don't force-hide them)
      if (entry.name === "toast" || entry.name === "badgeModal") continue;

      if (isMap) {
        if (opts.showInMapMode) showEl(el, opts.display);
        else if (opts.hideInMapMode) hideEl(el);
        else {
          // default in map mode: keep visible if not explicitly hidden
          showEl(el, opts.display);
        }
      } else {
        // explore mode
        if (opts.ariaHiddenControlsDisplay) {
          applyVisibilityFromAria(entry);
        } else {
          // show by default in explore unless something else hides it
          showEl(el, opts.display);
        }
      }
    }

    // Explicit: map-controls should only show in map mode
    const mapControls = state.layers.get("mapControls")?.el || $(".map-controls");
    if (mapControls) {
      if (isMap) showEl(mapControls, "flex");
      else hideEl(mapControls);
    }

    // Optional class hook (for future, not required)
    document.body.classList.toggle("mode-map", isMap);
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
    if (!entry || !entry.el) return;

    const el = entry.el;
    const obs = new MutationObserver(() => applyVisibilityFromAria(entry));

    obs.observe(el, { attributes: true, attributeFilter: ["aria-hidden"] });

    // apply immediately
    applyVisibilityFromAria(entry);
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;

    // Core DOM from index (161).html
    const header = $("header.site-header");
    const map = byId("map");
    const mapControls = $(".map-controls");
    const nearby = byId("nearbyListContainer");
    const placeCard = byId("placeCard");
    const footer = $(".app-footer");
    const nextUp = byId("mpNextUp");
    const toast = byId("toast");
    const badgeModal = byId("badgeModal");

    // Register layers
    register("map", map, Z.MAP, { display: "" });

    register("mapControls", mapControls, Z.MAP_CONTROLS, {
      display: "flex",
      showInMapMode: true,
      hideInMapMode: false
    });

    register("nearby", nearby, Z.NEARBY, {
     hideInMapMode: true,
     ariaHiddenControlsDisplay: false,
     display: ""
    
    });

    register("footer", footer, Z.FOOTER, {
      hideInMapMode: true,
      display: "flex"
    });

    register("nextUp", nextUp, Z.NEXTUP, {
      hideInMapMode: true,
      display: ""
    });

    // PlaceCard: visibility drives from aria-hidden in explore mode
    register("placeCard", placeCard, Z.PLACECARD, {
      hideInMapMode: true,
      ariaHiddenControlsDisplay: false,
      display: ""
    });

    register("header", header, Z.HEADER, {
      hideInMapMode: true,
      display: "flex"
    });

    // Toast + modal: always on top, we do not map-hide them
    register("toast", toast, Z.TOAST, { display: "" });
    register("badgeModal", badgeModal, Z.MODAL, { display: "" });

    // Ensure fixed UI bits behave deterministically
    setZ(header, Z.HEADER);
    setZ(placeCard, Z.PLACECARD);
    setZ(footer, Z.FOOTER);
    setZ(nearby, Z.NEARBY);
    setZ(mapControls, Z.MAP_CONTROLS);

    // Map controls hidden in explore by default
    if (mapControls) hideEl(mapControls);

    // Observe nearby aria-hidden
    observeAriaHidden("nearby");

    // Wire map mode buttons
    wireButtons();

    // Apply initial mode
    applyMode("explore");
  }

  function show(name) {
    const entry = state.layers.get(name);
    if (!entry || !entry.el) return;
    showEl(entry.el, entry.opts.display);
  }

  function hide(name) {
    const entry = state.layers.get(name);
    if (!entry || !entry.el) return;
    hideEl(entry.el);
  }

  function setMode(mode) {
    if (mode !== "explore" && mode !== "map") return;
    applyMode(mode);
  }

  function getMode() {
    return state.mode;
  }

  window.LayerManager = {
    init,
    register,   // exposed for future layers (search overlay, quiz modal, etc.)
    show,
    hide,
    setMode,
    getMode,
    Z
  };
})();
