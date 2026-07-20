(() => {
  // js/map-controls-runtime.ts
  var win = window;
  var FILTER_KEY = "hg_map_category_filter_v1";
  var ALL = "all";
  var activeCategory = readSavedCategory();
  var sourcePlaces = [];
  var originalSetPlaces = null;
  function readSavedCategory() {
    try {
      return localStorage.getItem(FILTER_KEY) || ALL;
    } catch {
      return ALL;
    }
  }
  function categories() {
    return Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  }
  function normalizeCategory(value) {
    const id = String(value || ALL).trim() || ALL;
    if (id === ALL) return ALL;
    return categories().some((category) => String(category.id || "") === id) ? id : ALL;
  }
  function placeCategory(place) {
    const raw = String((place == null ? void 0 : place.category) || "").trim();
    const match = categories().find(
      (category) => String(category.id || "") === raw || Array.isArray(category.aliases) && category.aliases.some((alias) => String(alias) === raw)
    );
    return String((match == null ? void 0 : match.id) || raw);
  }
  function filteredPlaces(places) {
    const list = Array.isArray(places) ? places : [];
    activeCategory = normalizeCategory(activeCategory);
    return activeCategory === ALL ? list : list.filter((place) => placeCategory(place) === activeCategory);
  }
  function createCategoryFilter() {
    const filter = document.createElement("div");
    filter.className = "hg-map-category-filter";
    filter.innerHTML = `
    <button class="hg-map-category-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="hgMapCategoryOptions">
      <span class="hg-map-category-trigger-icon" aria-hidden="true">\u{1F30D}</span>
      <span class="hg-map-category-trigger-label">Alle prikker</span>
      <span class="hg-map-category-trigger-caret" aria-hidden="true">\u2304</span>
    </button>
    <div id="hgMapCategoryOptions" class="hg-map-category-options" role="menu" aria-label="Filtrer kartprikker etter kategori" hidden></div>`;
    return filter;
  }
  function createIconButton(id, className, label, title, iconMarkup) {
    const button = document.createElement("button");
    button.id = id;
    button.className = className;
    button.type = "button";
    button.title = title;
    button.setAttribute("aria-label", label);
    button.innerHTML = iconMarkup;
    return button;
  }
  function createUtilityRow() {
    const row = document.createElement("div");
    row.className = "hg-map-utility-row";
    const center = createIconButton(
      "btnCenter",
      "hg-map-utility-btn hg-map-center-btn",
      "Sentrer kartet p\xE5 posisjonen din",
      "Sentrer",
      `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="5.2"></circle><path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3"></path></svg>`
    );
    const exit = createIconButton(
      "btnExitMap",
      "hg-map-utility-btn hg-map-exit-btn",
      "Lukk kartmodus",
      "Lukk kartmodus",
      `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"></path></svg>`
    );
    row.append(center, exit);
    return row;
  }
  function ensureControls() {
    if (!document.getElementById("mapLayer")) return null;
    let controls = document.querySelector(".map-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "map-controls";
      controls.setAttribute("aria-label", "Kartkontroller");
      document.body.appendChild(controls);
    }
    if (!controls.querySelector(".hg-map-category-filter")) {
      controls.appendChild(createCategoryFilter());
    }
    if (!controls.querySelector(".hg-map-utility-row")) {
      controls.appendChild(createUtilityRow());
    }
    return controls;
  }
  function escapeHtml(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function categoryMeta(categoryId) {
    if (categoryId === ALL) {
      return { id: ALL, name: "Alle prikker", icon: "\u{1F30D}", color: "#60758a" };
    }
    return categories().find((category) => String(category.id || "") === categoryId) || {
      id: categoryId,
      name: categoryId,
      icon: "\u2022",
      color: "#60758a"
    };
  }
  function renderCategoryUi() {
    if (!categories().length) return;
    activeCategory = normalizeCategory(activeCategory);
    const trigger = document.querySelector(".hg-map-category-trigger");
    const icon = trigger == null ? void 0 : trigger.querySelector(".hg-map-category-trigger-icon");
    const label = trigger == null ? void 0 : trigger.querySelector(".hg-map-category-trigger-label");
    const options = document.getElementById("hgMapCategoryOptions");
    if (!trigger || !icon || !label || !options) return;
    const active = categoryMeta(activeCategory);
    icon.textContent = active.icon || "\u2022";
    label.textContent = active.name || active.id;
    trigger.title = activeCategory === ALL ? "Viser alle kategorier" : `Viser bare ${active.name || active.id}`;
    options.innerHTML = [categoryMeta(ALL), ...categories()].map((category) => {
      const id = String(category.id || ALL);
      const selected = id === activeCategory;
      return `<button class="hg-map-category-option${selected ? " is-active" : ""}" type="button" role="menuitemradio" aria-checked="${selected}" data-map-category="${escapeHtml(id)}" style="--hg-cat-color:${escapeHtml(category.color || "#60758a")}"><span class="hg-map-category-option-icon" aria-hidden="true">${escapeHtml(category.icon || "\u2022")}</span><span class="hg-map-category-option-label">${escapeHtml(category.name || id)}</span><span class="hg-map-category-option-check" aria-hidden="true">\u2713</span></button>`;
    }).join("");
  }
  function installFilterHook() {
    const api = win.HGMap;
    if (!api || typeof api.setPlaces !== "function") return false;
    if (api.__hgCategoryFilterPatched) return true;
    originalSetPlaces = api.setPlaces.bind(api);
    api.setPlaces = (places) => {
      sourcePlaces = Array.isArray(places) ? places : [];
      return originalSetPlaces == null ? void 0 : originalSetPlaces(filteredPlaces(sourcePlaces));
    };
    api.__hgCategoryFilterPatched = true;
    if (Array.isArray(win.PLACES) && win.PLACES.length) {
      sourcePlaces = win.PLACES;
      originalSetPlaces(filteredPlaces(sourcePlaces));
    }
    return true;
  }
  function applyFilter(categoryId) {
    activeCategory = normalizeCategory(categoryId);
    try {
      localStorage.setItem(FILTER_KEY, activeCategory);
    } catch {
    }
    if (!sourcePlaces.length && Array.isArray(win.PLACES)) {
      sourcePlaces = win.PLACES;
    }
    originalSetPlaces == null ? void 0 : originalSetPlaces(filteredPlaces(sourcePlaces));
    renderCategoryUi();
    win.dispatchEvent(new CustomEvent("hg:map-category-filter", {
      detail: { category: activeCategory }
    }));
  }
  function closeMenu() {
    const trigger = document.querySelector(".hg-map-category-trigger");
    const options = document.getElementById("hgMapCategoryOptions");
    if (!trigger || !options) return;
    trigger.setAttribute("aria-expanded", "false");
    options.hidden = true;
  }
  async function centerMap() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const button = document.getElementById("btnCenter");
    if (button) button.disabled = true;
    try {
      let pos = ((_a = win.getPos) == null ? void 0 : _a.call(win)) || null;
      const hasCoordinates = () => Number.isFinite(Number(pos == null ? void 0 : pos.lat)) && Number.isFinite(Number(pos == null ? void 0 : pos.lon));
      if (!hasCoordinates() && ((_b = win.HGPos) == null ? void 0 : _b.request)) {
        try {
          await win.HGPos.request();
        } catch {
        }
        pos = ((_c = win.getPos) == null ? void 0 : _c.call(win)) || null;
      }
      const lat = Number(pos == null ? void 0 : pos.lat);
      const lon = Number(pos == null ? void 0 : pos.lon);
      const map = ((_e = (_d = win.HGMap) == null ? void 0 : _d.getMap) == null ? void 0 : _e.call(_d)) || null;
      if (!map || !Number.isFinite(lat) || !Number.isFinite(lon)) {
        (_f = win.showToast) == null ? void 0 : _f.call(win, "Fant ikke posisjonen din");
        return;
      }
      map.flyTo({
        center: [lon, lat],
        zoom: Math.max(Number((_g = map.getZoom) == null ? void 0 : _g.call(map)) || 13, 15),
        pitch: Math.max(Number((_h = map.getPitch) == null ? void 0 : _h.call(map)) || 0, 35),
        speed: 1.2,
        essential: true
      });
    } finally {
      if (button) button.disabled = false;
    }
  }
  function bindUi() {
    const trigger = document.querySelector(".hg-map-category-trigger");
    const options = document.getElementById("hgMapCategoryOptions");
    const center = document.getElementById("btnCenter");
    const exit = document.getElementById("btnExitMap");
    if (trigger && trigger.dataset.hgBound !== "1") {
      trigger.dataset.hgBound = "1";
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = trigger.getAttribute("aria-expanded") !== "true";
        trigger.setAttribute("aria-expanded", String(open));
        if (options) options.hidden = !open;
        if (open) renderCategoryUi();
      });
    }
    if (options && options.dataset.hgBound !== "1") {
      options.dataset.hgBound = "1";
      options.addEventListener("click", (event) => {
        const target = event.target;
        const option = target instanceof Element ? target.closest("[data-map-category]") : null;
        if (!option) return;
        applyFilter(option.dataset.mapCategory || ALL);
        closeMenu();
      });
    }
    if (center && center.dataset.hgBound !== "1") {
      center.dataset.hgBound = "1";
      center.addEventListener("click", () => {
        void centerMap();
      });
    }
    if (exit && exit.dataset.hgRuntimeBound !== "1") {
      exit.dataset.hgRuntimeBound = "1";
      exit.addEventListener("click", () => {
        var _a, _b, _c;
        (_b = (_a = win.LayerManager) == null ? void 0 : _a.setMode) == null ? void 0 : _b.call(_a, "explore");
        (_c = win.exitMapMode) == null ? void 0 : _c.call(win);
      });
    }
  }
  function refresh() {
    ensureControls();
    bindUi();
    installFilterHook();
    renderCategoryUi();
  }
  function init() {
    refresh();
    let attempts = 0;
    const timer = window.setInterval(() => {
      var _a;
      refresh();
      attempts += 1;
      if (((_a = win.HGMap) == null ? void 0 : _a.__hgCategoryFilterPatched) && categories().length || attempts > 80) {
        window.clearInterval(timer);
      }
    }, 150);
    win.addEventListener("hg:appReady", refresh);
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".hg-map-category-filter")) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }
  win.HGMapCategoryFilter = {
    get: () => activeCategory,
    set: applyFilter,
    showAll: () => applyFilter(ALL),
    refresh
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
