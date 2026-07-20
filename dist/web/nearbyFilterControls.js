(() => {
  // js/ui/nearbyFilterControls.ts
  var win = window;
  var PLACE_ICONS = {
    unvisited: "\u{1F3AF}",
    unlocked: "\u{1F513}",
    all: "\u{1F30D}"
  };
  var NATURE_ICONS = {
    all: "\u{1F30D}",
    unlocked: "\u{1F513}",
    flora: "\u{1F33F}",
    fauna: "\u{1F41E}"
  };
  var SORT_ICONS = {
    distance: "\u{1F4CD}",
    oldest: "\u23F3",
    newest: "\u{1F570}\uFE0F"
  };
  var initialized = false;
  var badgeTapLockedUntil = 0;
  var placeFilterButton = null;
  var badgeFilterButton = null;
  var favoritesFilterButton = null;
  var sortButton = null;
  function tUI(key, fallback) {
    var _a, _b;
    try {
      return ((_b = (_a = win.HG_I18N) == null ? void 0 : _a.t) == null ? void 0 : _b.call(_a, key, fallback)) || fallback;
    } catch {
      return fallback;
    }
  }
  function tfUI(key, fallback, vars) {
    const template = tUI(key, fallback);
    return template.replace(
      /\{(\w+)\}/g,
      (_match, name) => Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
    );
  }
  function getControlsContainer() {
    return document.querySelector(".nearby-controls") || (placeFilterButton == null ? void 0 : placeFilterButton.parentElement) || null;
  }
  function ensureButton(id, className, controls, ariaLabel) {
    const existing = document.getElementById(id);
    const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");
    if (!existing) {
      button.id = id;
      button.className = className;
      button.type = "button";
      if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
    }
    return button;
  }
  function ensureControls() {
    const existingPlaceFilter = document.getElementById("nearbyFilterBtn");
    if (!(existingPlaceFilter instanceof HTMLButtonElement)) return false;
    placeFilterButton = existingPlaceFilter;
    const controls = getControlsContainer();
    if (!controls) return false;
    badgeFilterButton = ensureButton(
      "nearbyBadgeFilterBtn",
      "nearby-filter-icon nearby-badge-filter-icon",
      controls,
      tUI("ui.badges.badgeFilter", "Badgefilter")
    );
    favoritesFilterButton = ensureButton(
      "nearbyFavoritesFilterBtn",
      "nearby-filter-icon nearby-favorites-filter-icon",
      controls
    );
    sortButton = ensureButton(
      "nearbySortBtn",
      "nearby-filter-icon nearby-sort-icon",
      controls,
      tUI("ui.sort.sortDistance", "Sortering: avstand")
    );
    controls.insertBefore(
      badgeFilterButton,
      sortButton.parentElement === controls ? sortButton : null
    );
    controls.appendChild(favoritesFilterButton);
    controls.appendChild(sortButton);
    return true;
  }
  function getMode() {
    var _a, _b;
    return ((_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.getActiveMode) == null ? void 0 : _b.call(_a)) || "nearby";
  }
  function updateVisibility() {
    var _a, _b;
    (_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.updateControlVisibility) == null ? void 0 : _b.call(_a);
  }
  function updateBadgeFilterButton() {
    var _a, _b, _c, _d;
    if (!badgeFilterButton) return;
    if (getMode() === "nature") {
      updateVisibility();
      return;
    }
    const filter = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getActiveBadgeFilter) == null ? void 0 : _b.call(_a)) || "all";
    const category = ((_d = (_c = win.HGNearbyFilters) == null ? void 0 : _c.getCategoryById) == null ? void 0 : _d.call(_c, filter)) || null;
    if (!category || filter === "all") {
      badgeFilterButton.textContent = "\u{1F3C5}";
      const label2 = tUI("ui.badges.badgeFilterAll", "Badgefilter: alle");
      badgeFilterButton.title = label2;
      badgeFilterButton.setAttribute("aria-label", label2);
      updateVisibility();
      return;
    }
    badgeFilterButton.innerHTML = `<img src="bilder/merker/${category.id}.PNG" alt="" loading="lazy" decoding="async" style="width:22px;height:22px;object-fit:contain;display:block;">`;
    const label = tfUI(
      "ui.badges.badgeFilterCategory",
      "Badgefilter: {category}",
      { category: category.name || category.id }
    );
    badgeFilterButton.title = label;
    badgeFilterButton.setAttribute("aria-label", label);
    updateVisibility();
  }
  function updateFilterButton() {
    var _a, _b, _c, _d;
    if (!placeFilterButton) return;
    const mode = getMode();
    if (mode === "nature") {
      const filter = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getNatureFilter) == null ? void 0 : _b.call(_a)) || "all";
      placeFilterButton.style.display = "inline-flex";
      placeFilterButton.textContent = NATURE_ICONS[filter] || "\u{1F30D}";
      placeFilterButton.title = `Natur-filter: ${filter}`;
    } else if (mode === "nearby") {
      const filter = ((_d = (_c = win.HGNearbyFilters) == null ? void 0 : _c.getPlaceFilter) == null ? void 0 : _d.call(_c)) || "unvisited";
      placeFilterButton.style.display = "inline-flex";
      placeFilterButton.textContent = PLACE_ICONS[filter] || "\u{1F3AF}";
      placeFilterButton.title = `Filter: ${filter}`;
    } else {
      placeFilterButton.style.display = "none";
    }
    updateBadgeFilterButton();
    updateVisibility();
  }
  function updateFavoritesFilterButton() {
    var _a, _b;
    if (!favoritesFilterButton) return;
    const active = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getFavoritesOnly) == null ? void 0 : _b.call(_a)) || false;
    favoritesFilterButton.classList.toggle("is-active", active);
    favoritesFilterButton.textContent = active ? "\u2605" : "\u2606";
    const label = active ? "Favorittfilter: p\xE5" : "Favorittfilter: av";
    favoritesFilterButton.title = label;
    favoritesFilterButton.setAttribute("aria-label", label);
    favoritesFilterButton.setAttribute("aria-pressed", active ? "true" : "false");
    updateVisibility();
  }
  function getSortTitle(sort) {
    if (sort === "oldest") return tUI("ui.sort.sortOldest", "Sortering: Eldst");
    if (sort === "newest") return tUI("ui.sort.sortNewest", "Sortering: Nyest");
    return tUI("ui.sort.sortDistance", "Sortering: Avstand");
  }
  function updateSortButton() {
    var _a, _b;
    if (!sortButton) return;
    updateVisibility();
    if (getMode() !== "nearby") return;
    const activeSort = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getSort) == null ? void 0 : _b.call(_a)) || "distance";
    sortButton.textContent = SORT_ICONS[activeSort] || "\u{1F4CD}";
    const title = getSortTitle(activeSort);
    sortButton.title = title;
    sortButton.setAttribute("aria-label", title);
  }
  function badgeTapIsLocked() {
    const now = Date.now();
    if (now < badgeTapLockedUntil) return true;
    badgeTapLockedUntil = now + 120;
    return false;
  }
  function bindInteractions() {
    placeFilterButton == null ? void 0 : placeFilterButton.addEventListener("click", () => {
      var _a, _b, _c, _d, _e, _f, _g;
      const mode = getMode();
      if (mode === "nature") {
        (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.cycleNatureFilter) == null ? void 0 : _b.call(_a);
        updateFilterButton();
        (_c = win.renderNearbyNature) == null ? void 0 : _c.call(win);
        return;
      }
      if (mode === "nearby") {
        (_e = (_d = win.HGNearbyFilters) == null ? void 0 : _d.cyclePlaceFilter) == null ? void 0 : _e.call(_d);
        updateFilterButton();
        (_g = (_f = win.HGLeftPanelMode) == null ? void 0 : _f.rerender) == null ? void 0 : _g.call(_f);
      }
    });
    badgeFilterButton == null ? void 0 : badgeFilterButton.addEventListener("click", () => {
      var _a, _b, _c, _d;
      if (badgeTapIsLocked()) return;
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.cycleBadgeFilter) == null ? void 0 : _b.call(_a);
      updateBadgeFilterButton();
      (_d = (_c = win.HGLeftPanelMode) == null ? void 0 : _c.rerender) == null ? void 0 : _d.call(_c);
    });
    favoritesFilterButton == null ? void 0 : favoritesFilterButton.addEventListener("click", () => {
      var _a, _b, _c, _d;
      if (getMode() !== "nearby") return;
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.toggleFavorites) == null ? void 0 : _b.call(_a);
      updateFavoritesFilterButton();
      (_d = (_c = win.HGLeftPanelMode) == null ? void 0 : _c.rerender) == null ? void 0 : _d.call(_c);
    });
    sortButton == null ? void 0 : sortButton.addEventListener("click", () => {
      var _a, _b, _c, _d;
      if (getMode() !== "nearby") return;
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.cycleSort) == null ? void 0 : _b.call(_a);
      updateSortButton();
      (_d = (_c = win.HGLeftPanelMode) == null ? void 0 : _c.rerender) == null ? void 0 : _d.call(_c);
    });
  }
  function init() {
    if (initialized) return;
    if (!ensureControls()) return;
    initialized = true;
    bindInteractions();
    updateFilterButton();
    updateBadgeFilterButton();
    updateFavoritesFilterButton();
    updateSortButton();
    updateVisibility();
  }
  var api = {
    init,
    updateFilterButton,
    updateBadgeFilterButton,
    updateFavoritesFilterButton,
    updateSortButton
  };
  win.HGNearbyFilterControls = api;
  win.updateNearbyFilterButton = updateFilterButton;
  win.updateNearbyBadgeFilterButton = updateBadgeFilterButton;
  win.updateNearbyFavoritesFilterButton = updateFavoritesFilterButton;
  win.updateNearbySortButton = updateSortButton;
})();
