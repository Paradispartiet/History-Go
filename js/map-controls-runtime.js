// History Go map-mode controls + category filtering.
(function () {
  "use strict";

  const FILTER_KEY = "hg_map_category_filter_v1";
  const ALL = "all";
  let activeCategory = readSavedCategory();
  let sourcePlaces = [];
  let originalSetPlaces = null;

  function readSavedCategory() {
    try { return localStorage.getItem(FILTER_KEY) || ALL; } catch { return ALL; }
  }

  function categories() {
    return Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  }

  function normalizeCategory(value) {
    const id = String(value || ALL).trim() || ALL;
    if (id === ALL) return ALL;
    return categories().some((category) => String(category?.id || "") === id) ? id : ALL;
  }

  function placeCategory(place) {
    const raw = String(place?.category || "").trim();
    const match = categories().find((category) =>
      String(category?.id || "") === raw ||
      (Array.isArray(category?.aliases) && category.aliases.some((alias) => String(alias) === raw))
    );
    return String(match?.id || raw);
  }

  function filteredPlaces(places) {
    const list = Array.isArray(places) ? places : [];
    activeCategory = normalizeCategory(activeCategory);
    return activeCategory === ALL ? list : list.filter((place) => placeCategory(place) === activeCategory);
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
      const filter = document.createElement("div");
      filter.className = "hg-map-category-filter";
      filter.innerHTML = `
        <button class="hg-map-category-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="hgMapCategoryOptions">
          <span class="hg-map-category-trigger-icon" aria-hidden="true">🌍</span>
          <span class="hg-map-category-trigger-label">Alle prikker</span>
          <span class="hg-map-category-trigger-caret" aria-hidden="true">⌄</span>
        </button>
        <div id="hgMapCategoryOptions" class="hg-map-category-options" role="menu" aria-label="Filtrer kartprikker etter kategori" hidden></div>`;
      controls.appendChild(filter);
    }

    if (!document.getElementById("btnCenter")) {
      const button = document.createElement("button");
      button.id = "btnCenter";
      button.className = "hg-map-utility-btn";
      button.type = "button";
      button.title = "Sentrer";
      button.setAttribute("aria-label", "Sentrer kartet på posisjonen din");
      button.textContent = "◎";
      controls.appendChild(button);
    }

    if (!document.getElementById("btnExitMap")) {
      const button = document.createElement("button");
      button.id = "btnExitMap";
      button.className = "hg-map-utility-btn hg-map-exit-btn";
      button.type = "button";
      button.title = "Lukk kartmodus";
      button.setAttribute("aria-label", "Lukk kartmodus");
      button.textContent = "×";
      controls.appendChild(button);
    }

    return controls;
  }

  function ensureStyles() {
    if (document.getElementById("hg-map-controls-runtime-style")) return;
    const style = document.createElement("style");
    style.id = "hg-map-controls-runtime-style";
    style.textContent = `
      .map-controls{display:none!important;flex-direction:column!important;align-items:flex-end!important;gap:8px!important;width:min(360px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important}
      body.mode-map .map-controls,body.map-only .map-controls{display:flex!important}
      .hg-map-category-filter{position:relative;width:max-content;max-width:100%;pointer-events:auto}
      .map-controls .hg-map-category-trigger{width:auto!important;min-width:190px;max-width:min(320px,calc(100vw - 24px));height:44px!important;display:flex;align-items:center;gap:9px;padding:0 13px!important;border-radius:999px!important;font-size:13px;font-weight:700;white-space:nowrap}
      .hg-map-category-trigger-icon{display:grid;place-items:center;width:23px;min-width:23px;height:23px;font-size:18px}
      .hg-map-category-trigger-label{overflow:hidden;text-overflow:ellipsis}
      .hg-map-category-trigger-caret{margin-left:auto;font-size:16px;opacity:.78;transition:transform .16s ease}
      .hg-map-category-trigger[aria-expanded="true"] .hg-map-category-trigger-caret{transform:rotate(180deg)}
      .hg-map-category-options{position:absolute;right:0;bottom:calc(100% + 8px);z-index:10080;width:min(330px,calc(100vw - 24px));max-height:min(62vh,520px);overflow:auto;padding:8px;border:1px solid rgba(255,255,255,.2);border-radius:18px;background:rgba(16,24,36,.96);box-shadow:0 18px 45px rgba(0,0,0,.36);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
      .hg-map-category-options[hidden]{display:none!important}
      .map-controls .hg-map-category-option{width:100%!important;height:auto!important;min-height:44px;display:grid;grid-template-columns:30px minmax(0,1fr) 22px;align-items:center;gap:9px;padding:8px 10px!important;border:0!important;border-radius:12px!important;background:transparent!important;box-shadow:none!important;text-align:left;font-size:13px;font-weight:650}
      .map-controls .hg-map-category-option+.hg-map-category-option{margin-top:2px}
      .map-controls .hg-map-category-option:hover,.map-controls .hg-map-category-option:focus-visible,.map-controls .hg-map-category-option.is-active{background:rgba(255,255,255,.13)!important}
      .hg-map-category-option-icon{display:grid;place-items:center;width:28px;height:28px;border-radius:999px;background:var(--hg-cat-color,rgba(255,255,255,.12));font-size:17px}
      .hg-map-category-option-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .hg-map-category-option-check{text-align:center;opacity:0}.hg-map-category-option.is-active .hg-map-category-option-check{opacity:1}
      .map-controls .hg-map-utility-btn{display:grid;place-items:center;font-size:24px;line-height:1}.map-controls .hg-map-exit-btn{font-size:27px}
      @media(max-width:640px){.map-controls{right:10px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 12px)!important;width:calc(100vw - 20px)!important;max-width:calc(100vw - 20px)!important}.map-controls .hg-map-category-trigger{min-width:176px;max-width:calc(100vw - 20px)}.hg-map-category-options{width:min(320px,calc(100vw - 20px))}}
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function meta(categoryId) {
    if (categoryId === ALL) return { id: ALL, name: "Alle prikker", icon: "🌍", color: "#60758a" };
    return categories().find((category) => String(category?.id || "") === categoryId) || { id: categoryId, name: categoryId, icon: "•", color: "#60758a" };
  }

  function renderCategoryUi() {
    if (!categories().length) return;
    activeCategory = normalizeCategory(activeCategory);
    const trigger = document.querySelector(".hg-map-category-trigger");
    const options = document.getElementById("hgMapCategoryOptions");
    if (!trigger || !options) return;

    const active = meta(activeCategory);
    trigger.querySelector(".hg-map-category-trigger-icon").textContent = active.icon || "•";
    trigger.querySelector(".hg-map-category-trigger-label").textContent = active.name || active.id;
    trigger.title = activeCategory === ALL ? "Viser alle kategorier" : `Viser bare ${active.name || active.id}`;

    options.innerHTML = [meta(ALL), ...categories()].map((category) => {
      const id = String(category?.id || ALL);
      const isActive = id === activeCategory;
      return `<button class="hg-map-category-option${isActive ? " is-active" : ""}" type="button" role="menuitemradio" aria-checked="${isActive}" data-map-category="${escapeHtml(id)}" style="--hg-cat-color:${escapeHtml(category?.color || "#60758a")}"><span class="hg-map-category-option-icon" aria-hidden="true">${escapeHtml(category?.icon || "•")}</span><span class="hg-map-category-option-label">${escapeHtml(category?.name || id)}</span><span class="hg-map-category-option-check" aria-hidden="true">✓</span></button>`;
    }).join("");
  }

  function installFilterHook() {
    const api = window.HGMap;
    if (!api || typeof api.setPlaces !== "function") return false;
    if (api.__hgCategoryFilterPatched) return true;

    originalSetPlaces = api.setPlaces.bind(api);
    api.setPlaces = function (places) {
      sourcePlaces = Array.isArray(places) ? places : [];
      return originalSetPlaces(filteredPlaces(sourcePlaces));
    };
    api.__hgCategoryFilterPatched = true;

    if (Array.isArray(window.PLACES) && window.PLACES.length) {
      sourcePlaces = window.PLACES;
      originalSetPlaces(filteredPlaces(sourcePlaces));
    }
    return true;
  }

  function applyFilter(categoryId) {
    activeCategory = normalizeCategory(categoryId);
    try { localStorage.setItem(FILTER_KEY, activeCategory); } catch {}
    if (!sourcePlaces.length && Array.isArray(window.PLACES)) sourcePlaces = window.PLACES;
    if (originalSetPlaces) originalSetPlaces(filteredPlaces(sourcePlaces));
    renderCategoryUi();
    window.dispatchEvent(new CustomEvent("hg:map-category-filter", { detail: { category: activeCategory } }));
  }

  function closeMenu() {
    const trigger = document.querySelector(".hg-map-category-trigger");
    const options = document.getElementById("hgMapCategoryOptions");
    if (!trigger || !options) return;
    trigger.setAttribute("aria-expanded", "false");
    options.hidden = true;
  }

  async function centerMap() {
    const button = document.getElementById("btnCenter");
    if (button) button.disabled = true;
    try {
      let pos = window.getPos?.();
      if ((!Number.isFinite(Number(pos?.lat)) || !Number.isFinite(Number(pos?.lon))) && window.HGPos?.request) {
        try { await window.HGPos.request(); } catch {}
        pos = window.getPos?.();
      }
      const lat = Number(pos?.lat);
      const lon = Number(pos?.lon);
      const map = window.HGMap?.getMap?.();
      if (!map || !Number.isFinite(lat) || !Number.isFinite(lon)) {
        window.showToast?.("Fant ikke posisjonen din");
        return;
      }
      map.flyTo({ center: [lon, lat], zoom: Math.max(Number(map.getZoom?.()) || 13, 15), pitch: Math.max(Number(map.getPitch?.()) || 0, 35), speed: 1.2, essential: true });
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
        const button = event.target instanceof Element ? event.target.closest("[data-map-category]") : null;
        if (!button) return;
        applyFilter(button.getAttribute("data-map-category") || ALL);
        closeMenu();
      });
    }

    if (center && center.dataset.hgBound !== "1") {
      center.dataset.hgBound = "1";
      center.addEventListener("click", centerMap);
    }

    if (exit && exit.dataset.hgRuntimeBound !== "1") {
      exit.dataset.hgRuntimeBound = "1";
      exit.addEventListener("click", () => {
        window.LayerManager?.setMode?.("explore");
        window.exitMapMode?.();
      });
    }
  }

  function refresh() {
    ensureControls();
    ensureStyles();
    bindUi();
    installFilterHook();
    renderCategoryUi();
  }

  function init() {
    refresh();
    let attempts = 0;
    const timer = setInterval(() => {
      refresh();
      attempts += 1;
      if ((window.HGMap?.__hgCategoryFilterPatched && categories().length) || attempts > 80) clearInterval(timer);
    }, 150);
    window.addEventListener("hg:appReady", refresh);
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest(".hg-map-category-filter")) closeMenu();
    });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  }

  window.HGMapCategoryFilter = { get: () => activeCategory, set: applyFilter, showAll: () => applyFilter(ALL), refresh };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
