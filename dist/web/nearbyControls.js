(() => {
  // js/ui/nearbyControls.ts
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
  var badgeFilterTapLockedUntil = 0;
  function tUI(key, fallback = "") {
    var _a, _b;
    try {
      return ((_b = (_a = win.HG_I18N) == null ? void 0 : _a.t) == null ? void 0 : _b.call(_a, key, fallback)) || fallback;
    } catch {
      return fallback;
    }
  }
  function tfUI(key, fallback = "", vars = {}) {
    const template = tUI(key, fallback);
    return String(template).replace(
      /\{(\w+)\}/g,
      (_, name) => Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
    );
  }
  function getActiveMode() {
    var _a, _b;
    return ((_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.getActiveMode) == null ? void 0 : _b.call(_a)) || "nearby";
  }
  function updateControlVisibility() {
    var _a, _b;
    (_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.updateControlVisibility) == null ? void 0 : _b.call(_a);
  }
  function rerenderActiveMode() {
    var _a, _b;
    (_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.rerender) == null ? void 0 : _b.call(_a);
  }
  function getControlsContainer(placeFilterButton) {
    const controls = document.querySelector(".nearby-controls");
    return controls || (placeFilterButton == null ? void 0 : placeFilterButton.parentElement) || null;
  }
  function getPlaceFilterButton() {
    const element = document.getElementById("nearbyFilterBtn");
    return element instanceof HTMLButtonElement ? element : null;
  }
  function ensureBadgeFilterButton(placeFilterButton) {
    if (!placeFilterButton) return null;
    const controls = getControlsContainer(placeFilterButton);
    if (!controls) return null;
    const existing = document.getElementById("nearbyBadgeFilterBtn");
    const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");
    if (!button.id) {
      button.id = "nearbyBadgeFilterBtn";
      button.className = "nearby-filter-icon nearby-badge-filter-icon";
      button.type = "button";
      button.setAttribute("aria-label", tUI("ui.badges.badgeFilter", "Badgefilter"));
    }
    const sortButton = document.getElementById("nearbySortBtn");
    controls.insertBefore(button, (sortButton == null ? void 0 : sortButton.parentElement) === controls ? sortButton : null);
    return button;
  }
  function ensureFavoritesFilterButton(placeFilterButton) {
    if (!placeFilterButton) return null;
    const controls = getControlsContainer(placeFilterButton);
    if (!controls) return null;
    const existing = document.getElementById("nearbyFavoritesFilterBtn");
    const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");
    if (!button.id) {
      button.id = "nearbyFavoritesFilterBtn";
      button.className = "nearby-filter-icon nearby-favorites-filter-icon";
      button.type = "button";
    }
    controls.appendChild(button);
    return button;
  }
  function ensureSortButton(placeFilterButton) {
    if (!placeFilterButton) return null;
    const controls = getControlsContainer(placeFilterButton);
    if (!controls) return null;
    const existing = document.getElementById("nearbySortBtn");
    const button = existing instanceof HTMLButtonElement ? existing : document.createElement("button");
    if (!button.id) {
      button.id = "nearbySortBtn";
      button.className = "nearby-filter-icon nearby-sort-icon";
      button.type = "button";
      button.setAttribute("aria-label", tUI("ui.sort.sortDistance", "Sortering: avstand"));
    }
    controls.appendChild(button);
    return button;
  }
  function badgeFilterTapIsLocked() {
    const now = Date.now();
    if (now < badgeFilterTapLockedUntil) return true;
    badgeFilterTapLockedUntil = now + 120;
    return false;
  }
  function updateBadgeFilterButton() {
    var _a, _b, _c, _d;
    const button = document.getElementById("nearbyBadgeFilterBtn");
    if (!(button instanceof HTMLButtonElement)) return;
    if (getActiveMode() === "nature") {
      updateControlVisibility();
      return;
    }
    const filter = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getActiveBadgeFilter) == null ? void 0 : _b.call(_a)) || "all";
    const category = ((_d = (_c = win.HGNearbyFilters) == null ? void 0 : _c.getCategoryById) == null ? void 0 : _d.call(_c, filter)) || null;
    if (!category || filter === "all") {
      button.textContent = "\u{1F3C5}";
      const label2 = tUI("ui.badges.badgeFilterAll", "Badgefilter: alle");
      button.title = label2;
      button.setAttribute("aria-label", label2);
      updateControlVisibility();
      return;
    }
    button.innerHTML = `<img src="bilder/merker/${category.id}.PNG" alt="" loading="lazy" decoding="async" style="width:22px;height:22px;object-fit:contain;display:block;">`;
    const label = tfUI(
      "ui.badges.badgeFilterCategory",
      "Badgefilter: {category}",
      { category: category.name || category.id }
    );
    button.title = label;
    button.setAttribute("aria-label", label);
    updateControlVisibility();
  }
  function updateFilterButton() {
    var _a, _b, _c, _d;
    const button = getPlaceFilterButton();
    if (!button) return;
    const mode = getActiveMode();
    if (mode === "nature") {
      const filter = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getNatureFilter) == null ? void 0 : _b.call(_a)) || "all";
      button.style.display = "inline-flex";
      button.textContent = NATURE_ICONS[filter] || "\u{1F30D}";
      button.title = `Natur-filter: ${filter}`;
    } else if (mode === "nearby") {
      const filter = ((_d = (_c = win.HGNearbyFilters) == null ? void 0 : _c.getPlaceFilter) == null ? void 0 : _d.call(_c)) || "unvisited";
      button.style.display = "inline-flex";
      button.textContent = PLACE_ICONS[filter] || "\u{1F3AF}";
      button.title = `Filter: ${filter}`;
    } else {
      button.style.display = "none";
    }
    updateBadgeFilterButton();
    updateControlVisibility();
  }
  function updateFavoritesFilterButton() {
    var _a, _b;
    const button = document.getElementById("nearbyFavoritesFilterBtn");
    if (!(button instanceof HTMLButtonElement)) return;
    const active = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getFavoritesOnly) == null ? void 0 : _b.call(_a)) || false;
    button.classList.toggle("is-active", active);
    button.textContent = active ? "\u2605" : "\u2606";
    const label = active ? "Favorittfilter: p\xE5" : "Favorittfilter: av";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    updateControlVisibility();
  }
  function getSortTitle(sort) {
    if (sort === "oldest") return tUI("ui.sort.sortOldest", "Sortering: Eldst");
    if (sort === "newest") return tUI("ui.sort.sortNewest", "Sortering: Nyest");
    return tUI("ui.sort.sortDistance", "Sortering: Avstand");
  }
  function updateSortButton() {
    var _a, _b;
    const button = document.getElementById("nearbySortBtn");
    if (!(button instanceof HTMLButtonElement)) return;
    updateControlVisibility();
    if (getActiveMode() !== "nearby") return;
    const sort = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getSort) == null ? void 0 : _b.call(_a)) || "distance";
    button.textContent = SORT_ICONS[sort] || "\u{1F4CD}";
    const title = getSortTitle(sort);
    button.title = title;
    button.setAttribute("aria-label", title);
  }
  function bindButtonOnce(button, key, handler) {
    if (!button || button.dataset[key] === "1") return;
    button.dataset[key] = "1";
    button.addEventListener("click", handler);
  }
  function bind() {
    const placeFilterButton = getPlaceFilterButton();
    const badgeButton = ensureBadgeFilterButton(placeFilterButton);
    const favoritesButton = ensureFavoritesFilterButton(placeFilterButton);
    const sortButton = ensureSortButton(placeFilterButton);
    bindButtonOnce(placeFilterButton, "hgNearbyFilterBound", () => {
      var _a, _b, _c, _d, _e;
      const mode = getActiveMode();
      if (mode === "nature") {
        (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.cycleNatureFilter) == null ? void 0 : _b.call(_a);
        updateFilterButton();
        (_c = win.renderNearbyNature) == null ? void 0 : _c.call(win);
        return;
      }
      if (mode === "nearby") {
        (_e = (_d = win.HGNearbyFilters) == null ? void 0 : _d.cyclePlaceFilter) == null ? void 0 : _e.call(_d);
        updateFilterButton();
        rerenderActiveMode();
      }
    });
    bindButtonOnce(badgeButton, "hgNearbyBadgeFilterBound", () => {
      var _a, _b, _c;
      if (badgeFilterTapIsLocked()) return;
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.cycleBadgeFilter) == null ? void 0 : _b.call(_a);
      updateBadgeFilterButton();
      if (getActiveMode() === "badges") {
        (_c = win.renderLeftBadges) == null ? void 0 : _c.call(win);
      } else {
        rerenderActiveMode();
      }
    });
    bindButtonOnce(favoritesButton, "hgNearbyFavoritesFilterBound", () => {
      var _a, _b;
      if (getActiveMode() !== "nearby") return;
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.toggleFavorites) == null ? void 0 : _b.call(_a);
      updateFavoritesFilterButton();
      rerenderActiveMode();
    });
    bindButtonOnce(sortButton, "hgNearbySortBound", () => {
      var _a, _b;
      if (getActiveMode() !== "nearby") return;
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.cycleSort) == null ? void 0 : _b.call(_a);
      updateSortButton();
      rerenderActiveMode();
    });
    refresh();
  }
  function refresh() {
    updateFilterButton();
    updateBadgeFilterButton();
    updateFavoritesFilterButton();
    updateSortButton();
    updateControlVisibility();
  }
  var api = {
    bind,
    refresh,
    updateFilterButton,
    updateBadgeFilterButton,
    updateFavoritesFilterButton,
    updateSortButton,
    badgeFilterTapIsLocked
  };
  win.HGNearbyControls = api;
  win.updateNearbyFilterButton = updateFilterButton;
  win.updateNearbyBadgeFilterButton = updateBadgeFilterButton;
  win.updateNearbyFavoritesFilterButton = updateFavoritesFilterButton;
  win.updateNearbySortButton = updateSortButton;
})();
