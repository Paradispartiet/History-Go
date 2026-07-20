(() => {
  // js/ui/leftPanelMode.ts
  var win = window;
  var LIST_IDS_BY_MODE = {
    nearby: "nearbyList",
    people: "leftPeopleList",
    nature: "leftNatureList",
    routes: "leftRoutesList",
    badges: "leftBadgesList"
  };
  var MODES = new Set(Object.keys(LIST_IDS_BY_MODE));
  var renderRaf = 0;
  var renderTimer = 0;
  function normalizeMode(mode) {
    const normalized = String(mode != null ? mode : "").trim();
    return MODES.has(normalized) ? normalized : "nearby";
  }
  function getActiveMode() {
    var _a;
    const activeMode = (_a = document.querySelector(".nearby-tab.is-active")) == null ? void 0 : _a.getAttribute("data-leftmode");
    return normalizeMode(activeMode);
  }
  function updateControlVisibility() {
    const mode = getActiveMode();
    const placeFilterButton = document.getElementById("nearbyFilterBtn");
    const badgeButton = document.getElementById("nearbyBadgeFilterBtn");
    const sortButton = document.getElementById("nearbySortBtn");
    const favoritesButton = document.getElementById("nearbyFavoritesFilterBtn");
    if (placeFilterButton) {
      placeFilterButton.style.display = mode === "nearby" || mode === "nature" ? "inline-flex" : "none";
    }
    if (badgeButton) {
      badgeButton.style.display = mode === "nature" ? "none" : "inline-flex";
    }
    if (sortButton) {
      sortButton.style.display = mode === "nearby" ? "inline-flex" : "none";
    }
    if (favoritesButton) {
      favoritesButton.style.display = mode === "nearby" ? "inline-flex" : "none";
    }
  }
  function renderNow() {
    var _a, _b, _c, _d, _e;
    const mode = getActiveMode();
    if (mode === "nearby") (_a = win.renderNearbyPlaces) == null ? void 0 : _a.call(win);
    if (mode === "people") (_b = win.renderNearbyPeople) == null ? void 0 : _b.call(win);
    if (mode === "nature") (_c = win.renderNearbyNature) == null ? void 0 : _c.call(win);
    if (mode === "routes") (_d = win.renderLeftRoutesList) == null ? void 0 : _d.call(win);
    if (mode === "badges") (_e = win.renderLeftBadges) == null ? void 0 : _e.call(win);
  }
  function rerender() {
    if (typeof win.requestAnimationFrame === "function") {
      if (renderRaf) win.cancelAnimationFrame(renderRaf);
      renderRaf = win.requestAnimationFrame(() => {
        renderRaf = 0;
        renderNow();
      });
      return;
    }
    if (renderTimer) win.clearTimeout(renderTimer);
    renderTimer = win.setTimeout(() => {
      renderTimer = 0;
      renderNow();
    }, 0);
  }
  function setMode(input) {
    var _a, _b, _c, _d, _e, _f, _g;
    const mode = normalizeMode(input);
    for (const [candidateMode, id] of Object.entries(LIST_IDS_BY_MODE)) {
      const list = document.getElementById(id);
      if (list) list.hidden = candidateMode !== mode;
    }
    if (mode === "nature") {
      win.HG_NEARBY_BADGE_FILTER = "all";
      try {
        localStorage.setItem("hg_nearby_badge_filter_v1", "all");
      } catch {
      }
    }
    try {
      localStorage.setItem("hg_leftpanel_mode_v1", mode);
    } catch {
    }
    document.querySelectorAll(".nearby-tab").forEach((button) => {
      const active = button.getAttribute("data-leftmode") === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    (_a = win.updateNearbyFilterButton) == null ? void 0 : _a.call(win);
    (_b = win.updateNearbyBadgeFilterButton) == null ? void 0 : _b.call(win);
    (_c = win.updateNearbySortButton) == null ? void 0 : _c.call(win);
    updateControlVisibility();
    rerender();
    (_e = (_d = win.HGMap) == null ? void 0 : _d.resize) == null ? void 0 : _e.call(_d);
    (_g = (_f = win.MAP) == null ? void 0 : _f.resize) == null ? void 0 : _g.call(_f);
    return mode;
  }
  win.HGLeftPanelMode = {
    getActiveMode,
    setMode,
    renderNow,
    rerender,
    updateControlVisibility
  };
})();
