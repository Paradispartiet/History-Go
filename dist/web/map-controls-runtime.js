(() => {
  // js/map-controls-runtime.ts
  var win = window;
  var FILTER_KEY = "hg_map_category_filters_v2";
  var LEGACY_FILTER_KEY = "hg_map_category_filter_v1";
  var ALL = "all";
  var activeCategories = readSavedCategories();
  var sourcePlaces = [];
  var originalSetPlaces = null;
  var badgeCatalog = [];
  var badgeCatalogLoaded = false;
  var badgeLoadPromise = null;
  function runtimeCategories() {
    return Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
  }
  function runtimeCategoryId(value) {
    var _a;
    const raw = String(value || "").trim();
    if (!raw) return "";
    const bridge = (_a = win.DomainRegistry) == null ? void 0 : _a.toRuntimeCategoryId;
    if (typeof bridge === "function") {
      try {
        const resolved = String(bridge(raw) || "").trim();
        if (resolved) return resolved;
      } catch {
      }
    }
    const match = runtimeCategories().find(
      (category) => String(category.id || "") === raw || Array.isArray(category.aliases) && category.aliases.some((alias) => String(alias) === raw)
    );
    return String((match == null ? void 0 : match.id) || raw);
  }
  function normalizeSelection(values) {
    const list = Array.isArray(values) ? values : [values];
    const next = /* @__PURE__ */ new Set();
    for (const value of list) {
      const id = runtimeCategoryId(value);
      if (id && id !== ALL) next.add(id);
    }
    return next;
  }
  function readSavedCategories() {
    try {
      const raw = localStorage.getItem(FILTER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return normalizeSelection(parsed);
      }
      const legacy = localStorage.getItem(LEGACY_FILTER_KEY);
      if (legacy && legacy !== ALL) return normalizeSelection([legacy]);
    } catch {
    }
    return /* @__PURE__ */ new Set();
  }
  function saveActiveCategories() {
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify([...activeCategories]));
      localStorage.removeItem(LEGACY_FILTER_KEY);
    } catch {
    }
  }
  function badgeImagePath(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(https?:)?\/\//.test(raw)) return raw;
    if (raw.includes("/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) return raw;
    return "";
  }
  function buildBadgeCatalog(badges) {
    const byId = /* @__PURE__ */ new Map();
    for (const badge of Array.isArray(badges) ? badges : []) {
      const id = runtimeCategoryId(badge == null ? void 0 : badge.id);
      if (!id || byId.has(id)) continue;
      const runtime = runtimeCategories().find((category) => String(category.id || "") === id);
      byId.set(id, {
        id,
        name: String((badge == null ? void 0 : badge.name) || (badge == null ? void 0 : badge.title) || (runtime == null ? void 0 : runtime.name) || id),
        image: badgeImagePath((badge == null ? void 0 : badge.image) || (badge == null ? void 0 : badge.icon)),
        color: String((badge == null ? void 0 : badge.color) || (runtime == null ? void 0 : runtime.color) || "#60758a"),
        scope: runtime == null ? void 0 : runtime.scope,
        aliases: runtime == null ? void 0 : runtime.aliases
      });
    }
    return [...byId.values()];
  }
  async function ensureBadgeCatalog() {
    var _a;
    if (badgeCatalogLoaded) return;
    if (Array.isArray(win.BADGES) && win.BADGES.length) {
      badgeCatalog = buildBadgeCatalog(win.BADGES);
      badgeCatalogLoaded = true;
      return;
    }
    if (badgeLoadPromise) return badgeLoadPromise;
    const loader = (_a = win.DataHub) == null ? void 0 : _a.loadBadges;
    if (typeof loader !== "function") return;
    badgeLoadPromise = Promise.resolve(loader({ cache: "no-store" })).then((badges) => {
      badgeCatalog = buildBadgeCatalog(Array.isArray(badges) ? badges : []);
      badgeCatalogLoaded = true;
    }).catch((error) => {
      console.warn("[HGMapCategoryFilter] badge-load failed", error);
      badgeCatalog = [];
      badgeCatalogLoaded = true;
    }).finally(() => {
      badgeLoadPromise = null;
    });
    return badgeLoadPromise;
  }
  function placeCategory(place) {
    return runtimeCategoryId(place == null ? void 0 : place.category);
  }
  function mapApplicableCategories() {
    const places = sourcePlaces.length ? sourcePlaces : Array.isArray(win.PLACES) ? win.PLACES : [];
    const placeCategoryIds = new Set(places.map(placeCategory).filter(Boolean));
    if (badgeCatalog.length) {
      return badgeCatalog.filter((category) => {
        const runtime = runtimeCategories().find((item) => String(item.id || "") === category.id);
        const runtimeDomain = (runtime == null ? void 0 : runtime.scope) === "runtime_domain" || (runtime == null ? void 0 : runtime.scope) === "runtime_domain_alias";
        return runtimeDomain || placeCategoryIds.has(category.id);
      });
    }
    return runtimeCategories().filter((category) => category.scope !== "subfield_display").map((category) => ({
      ...category,
      image: `bilder/merker/${category.id}.PNG`
    }));
  }
  function sanitizeActiveCategories() {
    const validIds = new Set(mapApplicableCategories().map((category) => category.id));
    if (!validIds.size) return;
    const next = new Set([...activeCategories].filter((id) => validIds.has(id)));
    if (next.size !== activeCategories.size) {
      activeCategories = next;
      saveActiveCategories();
    }
  }
  function filteredPlaces(places) {
    const list = Array.isArray(places) ? places : [];
    sanitizeActiveCategories();
    if (!activeCategories.size) return list;
    return list.filter((place) => activeCategories.has(placeCategory(place)));
  }
  function ensureControlStyles() {
    if (document.getElementById("hgMapControlsRuntimeStyle")) return;
    const style = document.createElement("style");
    style.id = "hgMapControlsRuntimeStyle";
    style.textContent = `.map-controls{--hg-map-control-width:min(100vw - 24px,640px);top:auto!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;bottom:calc(var(--hg-bottom-nav-height,72px) + 12px + env(safe-area-inset-bottom,0px))!important;display:flex!important;flex-direction:row!important;align-items:flex-end!important;justify-content:center!important;gap:6px!important;width:auto!important;max-width:calc(100vw - 24px)!important;max-height:none!important;padding:0!important;pointer-events:none!important;}body.mode-map .map-controls,body.map-only .map-controls{top:auto!important;bottom:calc(var(--hg-bottom-nav-height,72px) + 12px + env(safe-area-inset-bottom,0px))!important;}body:not(.mode-map):not(.map-only) .map-controls > .hg-map-style-toggle{display:inline-flex!important;}body:not(.mode-map):not(.map-only) .map-controls > .hg-map-utility-row{display:flex!important;}.map-controls .hg-map-style-toggle{flex:0 0 auto;width:auto!important;min-width:154px;}.map-controls .hg-map-category-filter{flex:0 0 auto;width:88px!important;}.map-controls .hg-map-category-trigger{width:88px!important;grid-template-columns:minmax(0,1fr) 14px!important;}.hg-map-category-trigger-logos,.hg-map-category-option-logos{display:flex;align-items:center;justify-content:center;min-width:0;height:34px;}.hg-map-category-trigger-logos{width:auto!important;padding-left:0;overflow:hidden;}.hg-map-category-logo{display:block;width:34px;height:34px;flex:0 0 34px;object-fit:contain;border-radius:50%;background:rgba(255,255,255,.06);box-shadow:0 0 0 1px rgba(255,255,255,.12);}.hg-map-category-logo.is-stacked{margin-left:-14px;}.hg-map-category-trigger-logos .hg-map-category-logo:nth-child(2){transform:scale(.92);}.hg-map-category-trigger-logos .hg-map-category-logo:nth-child(3){transform:scale(.84);}.hg-map-category-options{display:block!important;width:88px!important;max-height:min(52dvh,430px);overflow-y:auto;overflow-x:hidden;}.hg-map-category-options[hidden]{display:none!important;}.map-controls .hg-map-category-option{grid-template-columns:1fr!important;place-items:center;min-height:48px;width:100%!important;aspect-ratio:auto;}.hg-map-category-option-logos{width:100%!important;}.hg-map-category-option-logos .hg-map-category-logo{width:40px;height:40px;flex-basis:40px;}.hg-map-category-option-check{position:absolute;top:3px;right:3px;display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.16);font-size:11px;font-weight:900;}.hg-map-category-option:not(.is-active) .hg-map-category-option-check{opacity:.2;color:transparent;}body:not(.mode-map):not(.map-only) .map-controls .hg-map-exit-btn{display:none!important;}@media (max-width:420px){.map-controls{max-width:calc(100vw - 12px)!important;gap:4px!important;bottom:calc(var(--hg-bottom-nav-height,72px) + 8px + env(safe-area-inset-bottom,0px))!important;}.map-controls .hg-map-style-toggle{min-width:128px;}.map-controls .hg-map-style-toggle .hg-map-style-btn{padding:0 6px;font-size:12px;}.map-controls .hg-map-category-filter,.map-controls .hg-map-category-trigger,.map-controls .hg-map-category-options{width:74px!important;}.map-controls .hg-map-utility-row{gap:4px!important;}.map-controls .hg-map-utility-btn{width:40px!important;height:40px!important;flex-basis:40px!important;}}`;
    document.head.appendChild(style);
  }
  function createCategoryFilter() {
    const filter = document.createElement("div");
    filter.className = "hg-map-category-filter";
    filter.innerHTML = `
    <button class="hg-map-category-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="hgMapCategoryOptions" aria-label="Velg kartbadges" title="Viser alle kategorier">
      <span class="hg-map-category-trigger-logos" aria-hidden="true"></span>
      <span class="hg-map-category-trigger-label">Alle prikker</span>
      <span class="hg-map-category-trigger-caret" aria-hidden="true">\u2304</span>
    </button>
    <div id="hgMapCategoryOptions" class="hg-map-category-options" role="menu" aria-label="Velg \xE9n eller flere kategorier som skal vises p\xE5 kartet" hidden></div>`;
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
  function logoStackMarkup(categories, limit = 3) {
    const images = categories.map((category) => badgeImagePath(category.image)).filter(Boolean).slice(0, limit);
    return images.map(
      (image, index) => `<img class="hg-map-category-logo${index ? " is-stacked" : ""}" src="${escapeHtml(image)}" alt="">`
    ).join("");
  }
  function renderCategoryUi() {
    const categories = mapApplicableCategories();
    if (!categories.length) return;
    sanitizeActiveCategories();
    const trigger = document.querySelector(".hg-map-category-trigger");
    const logos = trigger == null ? void 0 : trigger.querySelector(".hg-map-category-trigger-logos");
    const label = trigger == null ? void 0 : trigger.querySelector(".hg-map-category-trigger-label");
    const options = document.getElementById("hgMapCategoryOptions");
    if (!trigger || !logos || !label || !options) return;
    const selected = categories.filter((category) => activeCategories.has(category.id));
    const visibleForLogos = selected.length ? selected : categories;
    logos.innerHTML = logoStackMarkup(visibleForLogos);
    if (!selected.length) {
      label.textContent = "Alle prikker";
      trigger.title = "Viser alle kategorier";
    } else if (selected.length === 1) {
      label.textContent = selected[0].name || selected[0].id;
      trigger.title = `Viser ${selected[0].name || selected[0].id}`;
    } else {
      label.textContent = `${selected.length} kategorier`;
      trigger.title = `Viser ${selected.map((category) => category.name || category.id).join(", ")}`;
    }
    const allSelected = activeCategories.size === 0;
    const allLogos = logoStackMarkup(categories);
    const allOption = `<button class="hg-map-category-option${allSelected ? " is-active" : ""}" type="button" role="menuitemcheckbox" aria-checked="${allSelected}" data-map-category="${ALL}"><span class="hg-map-category-option-logos" aria-hidden="true">${allLogos}</span><span class="hg-map-category-option-label">Alle prikker</span><span class="hg-map-category-option-check" aria-hidden="true">\u2713</span></button>`;
    const categoryOptions = categories.map((category) => {
      const id = category.id;
      const isSelected = activeCategories.has(id);
      return `<button class="hg-map-category-option${isSelected ? " is-active" : ""}" type="button" role="menuitemcheckbox" aria-checked="${isSelected}" data-map-category="${escapeHtml(id)}"><span class="hg-map-category-option-logos" aria-hidden="true">${logoStackMarkup([category], 1)}</span><span class="hg-map-category-option-label">${escapeHtml(category.name || id)}</span><span class="hg-map-category-option-check" aria-hidden="true">\u2713</span></button>`;
    }).join("");
    const wasOpen = trigger.getAttribute("aria-expanded") === "true" && !options.hidden;
    options.innerHTML = allOption + categoryOptions;
    trigger.setAttribute("aria-expanded", String(wasOpen));
    options.hidden = !wasOpen;
  }
  function installFilterHook() {
    const api = win.HGMap;
    if (!api || typeof api.setPlaces !== "function") return false;
    if (api.__hgCategoryFilterPatched) return true;
    originalSetPlaces = api.setPlaces.bind(api);
    api.setPlaces = (places) => {
      sourcePlaces = Array.isArray(places) ? places : [];
      renderCategoryUi();
      return originalSetPlaces == null ? void 0 : originalSetPlaces(filteredPlaces(sourcePlaces));
    };
    api.__hgCategoryFilterPatched = true;
    if (Array.isArray(win.PLACES) && win.PLACES.length) {
      sourcePlaces = win.PLACES;
      originalSetPlaces(filteredPlaces(sourcePlaces));
    }
    return true;
  }
  function applyCurrentFilter() {
    if (!sourcePlaces.length && Array.isArray(win.PLACES)) {
      sourcePlaces = win.PLACES;
    }
    saveActiveCategories();
    originalSetPlaces == null ? void 0 : originalSetPlaces(filteredPlaces(sourcePlaces));
    renderCategoryUi();
    const categories = [...activeCategories];
    win.dispatchEvent(new CustomEvent("hg:map-category-filter", {
      detail: {
        categories,
        category: categories.length === 1 ? categories[0] : categories.length ? "multiple" : ALL
      }
    }));
  }
  function setFilter(categoryIds) {
    if (categoryIds === ALL || Array.isArray(categoryIds) && categoryIds.includes(ALL)) {
      activeCategories = /* @__PURE__ */ new Set();
    } else {
      activeCategories = normalizeSelection(categoryIds);
    }
    applyCurrentFilter();
  }
  function toggleFilter(categoryId) {
    const id = runtimeCategoryId(categoryId);
    if (!id || id === ALL) {
      activeCategories = /* @__PURE__ */ new Set();
      applyCurrentFilter();
      return;
    }
    if (activeCategories.has(id)) activeCategories.delete(id);
    else activeCategories.add(id);
    applyCurrentFilter();
  }
  function showAll() {
    activeCategories = /* @__PURE__ */ new Set();
    applyCurrentFilter();
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
        event.stopPropagation();
        const target = event.target;
        const option = target instanceof Element ? target.closest("[data-map-category]") : null;
        if (!option) return;
        const categoryId = option.dataset.mapCategory || ALL;
        if (categoryId === ALL) showAll();
        else toggleFilter(categoryId);
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
    ensureControlStyles();
    ensureControls();
    bindUi();
    installFilterHook();
    renderCategoryUi();
    void ensureBadgeCatalog().then(() => renderCategoryUi());
  }
  function init() {
    refresh();
    let attempts = 0;
    const timer = window.setInterval(() => {
      var _a;
      refresh();
      attempts += 1;
      if (((_a = win.HGMap) == null ? void 0 : _a.__hgCategoryFilterPatched) && runtimeCategories().length && badgeCatalogLoaded || attempts > 160) {
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
    get: () => [...activeCategories],
    set: setFilter,
    toggle: toggleFilter,
    showAll,
    refresh
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
