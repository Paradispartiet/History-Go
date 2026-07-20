// ============================================================
// LEFT PANEL – NEARBY / PEOPLE / NATURE / ROUTES / BADGES
// Eier: #nearbyListContainer + panel*-seksjoner
// Init: initLeftPanel() kalles fra DOMContentLoaded
// ============================================================

function tUI(key, fallback = "") {
  try {
    return window.HG_I18N?.t?.(key, fallback) || fallback;
  } catch {
    return fallback;
  }
}

function tfUI(key, fallback = "", vars = {}) {
  const template = tUI(key, fallback);
  return String(template).replace(/\{(\w+)\}/g, (_, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
  );
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hg$(id) {
  return document.getElementById(id);
}

function hgActiveLeftPanelMode() {
  return window.HGLeftPanelMode?.getActiveMode?.() || "nearby";
}

function normalizeNearbySort(mode) {
  return window.HGNearbyFilters?.normalizeSort?.(mode) || "distance";
}

function getNearbyControlsContainer(placeFilterBtn) {
  return document.querySelector(".nearby-controls") || placeFilterBtn?.parentElement || null;
}

function updateNearbyControlVisibility() {
  window.HGLeftPanelMode?.updateControlVisibility?.();
}

function renderActiveLeftPanelModeNow() {
  window.HGLeftPanelMode?.renderNow?.();
}

function rerenderActiveLeftPanelMode() {
  window.HGLeftPanelMode?.rerender?.();
}

// ============================================================
// LEFT PANEL MODES
// ============================================================

function setLeftPanelMode(mode) {
  return window.HGLeftPanelMode?.setMode?.(mode) || "nearby";
}

// ============================================================
// UTFORSK-DRAWER (åpen/lukket)
// #nearbyListContainer er lukket som standard og åpnes via
// #nearbyExploreToggle. Tilstanden styres med klassene
// is-drawer-open / is-drawer-closed (se css/layout.css).
// ============================================================

function isNearbyDrawerOpen() {
  return !!window.HGNearbyDrawer?.isOpen?.();
}

function setNearbyDrawerOpen(open) {
  window.HGNearbyDrawer?.setOpen?.(!!open);
}

function openNearbyDrawer() {
  window.HGNearbyDrawer?.open?.();
}

function closeNearbyDrawer() {
  window.HGNearbyDrawer?.close?.();
}

function toggleNearbyDrawer() {
  window.HGNearbyDrawer?.toggle?.();
}

// ============================================================
// FRAME SYNC (kun header)
// ============================================================

function syncLeftPanelFrame() {
  const root = document.documentElement;
  if (!root) return;

  const styles = window.getComputedStyle(root);
  const visualHeaderHeight = parseFloat(
    styles.getPropertyValue("--hg-visual-header-height")
  );

  let headerH = Number.isFinite(visualHeaderHeight) ? visualHeaderHeight : 0;

  if (!headerH) {
    const header =
      document.querySelector("header") ||
      document.querySelector(".site-header");

    if (!header) return;
    headerH = header.getBoundingClientRect().bottom;
  }

  headerH = Math.max(0, Math.round(headerH));

  root.style.setProperty("--hg-header-h", headerH + "px");
}

// ============================================================
// BADGE FILTER HELPERS
// ============================================================

let _badgeFilterTapLockedUntil = 0;

function badgeFilterTapIsLocked() {
  const now = Date.now();
  if (now < _badgeFilterTapLockedUntil) return true;
  _badgeFilterTapLockedUntil = now + 120;
  return false;
}

function getCategoryById(id) {
  return window.HGNearbyFilters?.getCategoryById?.(id) || null;
}

function getNearbyBadgeOptions() {
  return window.HGNearbyFilters?.getBadgeOptions?.() || ["all"];
}

function normalizeBadgeFilter(id) {
  return window.HGNearbyFilters?.normalizeBadgeFilter?.(id) || "all";
}

function getActiveBadgeFilter() {
  return window.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";
}

function setActiveBadgeFilter(nextFilter, options = {}) {
  const next = normalizeBadgeFilter(nextFilter);
  const current = getActiveBadgeFilter();

  window.HGNearbyFilters?.setActiveBadgeFilter?.(next);

  if (typeof window.updateNearbyBadgeFilterButton === "function") {
    window.updateNearbyBadgeFilterButton();
  }

  const activeMode = hgActiveLeftPanelMode();

  if (activeMode === "badges" || options.renderBadgesList) {
    renderLeftBadges();
    return;
  }

  if (next !== current || options.forceRender) {
    rerenderActiveLeftPanelMode();
  }
}

function isBadgeFilterActive() {
  return window.HGNearbyFilters?.isBadgeFilterActive?.() || false;
}

window.HG_getActiveBadgeFilter = getActiveBadgeFilter;
window.HG_isBadgeFilterActive = isBadgeFilterActive;

// ============================================================
// BADGES I VENSTRE PANEL
// ============================================================

function getCollectedBadgeCount() {
  try {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    if (!merits || typeof merits !== "object" || Array.isArray(merits)) return 0;
    return Object.keys(merits).length;
  } catch {
    return 0;
  }
}

function renderLeftBadges() {
  const box = hg$("leftBadgesList");
  if (!box) return;

  if (box.dataset.hgBadgeDelegated !== "1") {
    box.dataset.hgBadgeDelegated = "1";
    box.addEventListener("click", (event) => {
      const btn = /** @type {Element|null} */ (event.target)?.closest?.("[data-badge-id]");
      if (!btn || !box.contains(btn)) return;
      if (badgeFilterTapIsLocked()) return;

      const next = btn.getAttribute("data-badge-id") || "all";
      setActiveBadgeFilter(next, { renderBadgesList: true });
    });
  }

  const collectedBadgeCount = getCollectedBadgeCount();
  const collectedBadgeText = tfUI("ui.badges.collectedCount", "{count} merker samlet", { count: collectedBadgeCount });
  const summaryHtml = `<div class="muted" style="font-size:13px;margin:0 0 8px;padding:0 2px;">${escapeHTML(collectedBadgeText)}</div>`;

  if (!Array.isArray(window.CATEGORY_LIST) || !window.CATEGORY_LIST.length) {
    box.innerHTML = `${summaryHtml}<div class="muted">${tUI("ui.badges.noCategoriesLoaded", "Ingen kategorier lastet.")}</div>`;
    return;
  }

  const activeBadge = getActiveBadgeFilter();
  let categories = window.CATEGORY_LIST;

  if (activeBadge !== "all") {
    categories = categories.filter(c => String(c.id || "").trim() === String(activeBadge).trim());
  }

  if (!categories.length) {
    box.innerHTML = `
      ${summaryHtml}
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">🏅</div>
        <div class="hg-empty-guide-title">${tUI("ui.badges.none", "Ingen merker")}</div>
        <div class="hg-empty-guide-text">${tUI("ui.badges.filterHidesAll", "Badgefilteret skjuler alle merker akkurat nå. Trykk badgeknappen for å vise alle.")}</div>
      </div>
    `;
    return;
  }

  box.innerHTML = summaryHtml + categories.map(c => `
    <button class="chip ghost" data-badge-id="${c.id}"
      style="justify-content:flex-start;width:100%;">
      <img src="bilder/merker/${c.id}.PNG"
           alt=""
           loading="lazy"
           decoding="async"
           style="width:18px;height:18px;margin-right:8px;border-radius:4px;">
      ${c.name}
    </button>
  `).join("");
}

// ============================================================
// NEARBY BADGE FILTER BUTTON
// ============================================================

function ensureNearbyBadgeFilterButton(placeFilterBtn) {
  if (!placeFilterBtn) return null;

  const controls = getNearbyControlsContainer(placeFilterBtn);
  if (!controls) return null;

  let btn = /** @type {HTMLButtonElement|null} */ (document.getElementById("nearbyBadgeFilterBtn"));
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "nearbyBadgeFilterBtn";
    btn.className = "nearby-filter-icon nearby-badge-filter-icon";
    btn.type = "button";
    btn.setAttribute("aria-label", tUI("ui.badges.badgeFilter", "Badgefilter"));
  }

  const sortBtn = document.getElementById("nearbySortBtn");
  controls.insertBefore(btn, sortBtn?.parentElement === controls ? sortBtn : null);
  return btn;
}

function ensureNearbyFavoritesFilterButton(placeFilterBtn) {
  if (!placeFilterBtn) return null;

  const controls = getNearbyControlsContainer(placeFilterBtn);
  if (!controls) return null;

  let btn = /** @type {HTMLButtonElement|null} */ (document.getElementById("nearbyFavoritesFilterBtn"));
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "nearbyFavoritesFilterBtn";
    btn.className = "nearby-filter-icon nearby-favorites-filter-icon";
    btn.type = "button";
  }

  controls.appendChild(btn);
  return btn;
}

function ensureNearbySortButton(placeFilterBtn) {
  if (!placeFilterBtn) return null;

  const controls = getNearbyControlsContainer(placeFilterBtn);
  if (!controls) return null;

  let btn = /** @type {HTMLButtonElement|null} */ (document.getElementById("nearbySortBtn"));
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "nearbySortBtn";
    btn.className = "nearby-filter-icon nearby-sort-icon";
    btn.type = "button";
    btn.setAttribute("aria-label", tUI("ui.sort.sortDistance", "Sortering: avstand"));
  }

  controls.appendChild(btn);
  return btn;
}

// ============================================================
// INIT
// ============================================================

function initLeftPanel() {
  if (window.__HG_LEFT_PANEL_INIT_DONE__) return;
  window.__HG_LEFT_PANEL_INIT_DONE__ = true;

  const panel = hg$("nearbyListContainer");
  if (!panel) return;

  // #leftPanelMode er valgfri bakoverkompatibilitet. Den faktiske UI-kilden er
  // .nearby-tab[data-leftmode]. Index trenger ikke et skjult select for å virke.
  const sel = /** @type {HTMLSelectElement|null} */ (hg$("leftPanelMode"));

    window.HGNearbyFilters?.initializeFromStorage?.();

  const mode = hgActiveLeftPanelMode() || "nearby";
  if (sel) sel.value = mode;

  setLeftPanelMode(mode);

  // Valgfri skjult dropdown (kun bakoverkompatibilitet hvis elementet finnes).
  if (sel) {
    sel.addEventListener("change", () => setLeftPanelMode(sel.value));
  }

  // tabs – faktisk UI-kilde
  document.querySelectorAll(".nearby-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const m = btn.getAttribute("data-leftmode") || "nearby";
      if (sel) sel.value = m;
      setLeftPanelMode(m);
      if (!isNearbyDrawerOpen()) openNearbyDrawer();
    });
  });

  // Drawer-state og interaksjoner eies av TypeScript-controlleren.
  window.HGNearbyDrawer?.bindInteractions?.();

  renderLeftBadges();

  // Re-render natur når DataHub blir ferdig (hvis fanen allerede står åpen).
  window.addEventListener("hg:nature-loaded", () => {
    const active = hgActiveLeftPanelMode();
    if (active === "nature" && typeof renderNearbyNature === "function") {
      renderNearbyNature();
    }
  });

  // Re-render natur når en unlock skjer fra quiz (HGNatureUnlocks dispatcher hg:nature).
  window.addEventListener("hg:nature", () => {
    const active = hgActiveLeftPanelMode();
    if (active === "nature" && typeof renderNearbyNature === "function") {
      renderNearbyNature();
    }
  });

  syncLeftPanelFrame();
  window.addEventListener("resize", syncLeftPanelFrame);

  // observer placeCard
  const pc = hg$("placeCard");
  if (pc && "ResizeObserver" in window) {
    new ResizeObserver(syncLeftPanelFrame).observe(pc);
  }


  // =====================================
  // Nearby filter button
  // =====================================

  const btn = document.getElementById("nearbyFilterBtn");
  const badgeBtn = ensureNearbyBadgeFilterButton(btn);
  const favoritesBtn = ensureNearbyFavoritesFilterButton(btn);
  const sortBtn = ensureNearbySortButton(btn);
  updateNearbyControlVisibility();

  const PLACES_ICONS = { unvisited: "🎯", unlocked: "🔓", all: "🌍" };

  const NATURE_ICONS = { all: "🌍", unlocked: "🔓", flora: "🌿", fauna: "🐞" };
  const SORT_ICONS = { distance: "📍", oldest: "⏳", newest: "🕰️" };
  const SORT_TITLES = {
    distance: () => tUI("ui.sort.sortDistance", "Sortering: Avstand"),
    oldest: () => tUI("ui.sort.sortOldest", "Sortering: Eldst"),
    newest: () => tUI("ui.sort.sortNewest", "Sortering: Nyest")
  };

  function updateBadgeFilterButton() {
    if (!badgeBtn) return;
    const activeMode = hgActiveLeftPanelMode();
    if (activeMode === "nature") {
      updateNearbyControlVisibility();
      return;
    }

    const filter = getActiveBadgeFilter();
    const cat = getCategoryById(filter);

    if (!cat || filter === "all") {
      badgeBtn.textContent = "🏅";
      badgeBtn.title = tUI("ui.badges.badgeFilterAll", "Badgefilter: alle");
      badgeBtn.setAttribute("aria-label", tUI("ui.badges.badgeFilterAll", "Badgefilter: alle"));
      updateNearbyControlVisibility();
      return;
    }

    badgeBtn.innerHTML = `<img src="bilder/merker/${cat.id}.PNG" alt="" loading="lazy" decoding="async" style="width:22px;height:22px;object-fit:contain;display:block;">`;
    const badgeFilterCategory = tfUI("ui.badges.badgeFilterCategory", "Badgefilter: {category}", { category: cat.name || cat.id });
    badgeBtn.title = badgeFilterCategory;
    badgeBtn.setAttribute("aria-label", badgeFilterCategory);
    updateNearbyControlVisibility();
  }
  window.updateNearbyBadgeFilterButton = updateBadgeFilterButton;

  function updateFilterButton() {
    if (!btn) return;
    const mode = hgActiveLeftPanelMode();
    if (mode === "nature") {
      btn.style.display = "inline-flex";
      btn.textContent = NATURE_ICONS[window.HG_NATURE_FILTER] || "🌍";
      btn.title = `Natur-filter: ${window.HG_NATURE_FILTER}`;
    } else if (mode === "nearby") {
      btn.style.display = "inline-flex";
      btn.textContent = PLACES_ICONS[window.HG_NEARBY_FILTER] || "🎯";
      btn.title = `Filter: ${window.HG_NEARBY_FILTER}`;
    } else {
      btn.style.display = "none";
    }

    updateBadgeFilterButton();
    updateNearbyControlVisibility();
  }
  window.updateNearbyFilterButton = updateFilterButton;

  function updateNearbyFavoritesFilterButton() {
    if (!favoritesBtn) return;
    const active = !!window.HG_NEARBY_FAVORITES_ONLY;
    favoritesBtn.classList.toggle("is-active", active);
    favoritesBtn.textContent = active ? "★" : "☆";
    const label = active ? "Favorittfilter: på" : "Favorittfilter: av";
    favoritesBtn.title = label;
    favoritesBtn.setAttribute("aria-label", label);
    favoritesBtn.setAttribute("aria-pressed", active ? "true" : "false");
    updateNearbyControlVisibility();
  }
  window.updateNearbyFavoritesFilterButton = updateNearbyFavoritesFilterButton;

  function updateNearbySortButton() {
    if (!sortBtn) return;
    const mode = hgActiveLeftPanelMode();
    const isSortableMode = mode === "nearby";
    updateNearbyControlVisibility();
    if (!isSortableMode) return;

    const activeSort = normalizeNearbySort(window.HG_NEARBY_SORT);
    sortBtn.textContent = SORT_ICONS[activeSort] || "📍";
    const sortTitle = (SORT_TITLES[activeSort] || SORT_TITLES.distance)();
    sortBtn.title = sortTitle;
    sortBtn.setAttribute("aria-label", sortTitle);
  }
  window.updateNearbySortButton = updateNearbySortButton;

  if (btn) {
    btn.addEventListener("click", () => {
      const mode = hgActiveLeftPanelMode();
      if (mode === "nature") {
        window.HG_NATURE_FILTER = window.HGNearbyFilters?.cycleNatureFilter?.() || "all";
        updateFilterButton();
        if (typeof renderNearbyNature === "function") renderNearbyNature();
      } else if (mode === "nearby") {
        window.HG_NEARBY_FILTER = window.HGNearbyFilters?.cyclePlaceFilter?.() || "unvisited";
        updateFilterButton();
        rerenderActiveLeftPanelMode();
      }
    });
  }

  if (badgeBtn) {
    badgeBtn.addEventListener("click", () => {
      if (badgeFilterTapIsLocked()) return;

      const order = getNearbyBadgeOptions();
      const current = getActiveBadgeFilter();
      const i = order.indexOf(current);
      const next = order[(i + 1) % order.length] || "all";

      setActiveBadgeFilter(next, { forceRender: true });
    });
  }

  if (favoritesBtn) {
    favoritesBtn.addEventListener("click", () => {
      if (hgActiveLeftPanelMode() !== "nearby") return;
      window.HG_NEARBY_FAVORITES_ONLY = window.HGNearbyFilters?.toggleFavorites?.() || false;
      updateNearbyFavoritesFilterButton();
      rerenderActiveLeftPanelMode();
    });
  }

  if (sortBtn) {
    sortBtn.addEventListener("click", () => {
      const mode = hgActiveLeftPanelMode();
      if (mode !== "nearby") return;

      window.HG_NEARBY_SORT = window.HGNearbyFilters?.cycleSort?.() || "distance";
      updateNearbySortButton();
      rerenderActiveLeftPanelMode();
    });
  }

  updateFilterButton();
  updateBadgeFilterButton();
  updateNearbyFavoritesFilterButton();
  updateNearbySortButton();
  updateNearbyControlVisibility();
}

// ============================================================
// COLLAPSE API (kartmodus osv.)
// ============================================================

window.setNearbyCollapsed = function (hidden) {
  const wantHidden = !!hidden;

  // Nearby skal kun kollapse i kartmodus
  if (window.LayerManager?.getMode?.() !== "map") hidden = false;

  const panel = hg$("nearbyListContainer");
  if (!panel) return;

  panel.classList.toggle("is-hidden", !!hidden);

  // Kartmodus/ruter ber om kollaps: lukk draweren uansett, slik at
  // explore kommer tilbake med lukket drawer (åpnes via Utforsk-knappen).
  if (wantHidden) closeNearbyDrawer();

  window.HGMap?.resize?.();
  window.MAP?.resize?.();
};

// ============================================================
// EXPOSE
// ============================================================

window.initLeftPanel = initLeftPanel;
window.setLeftPanelMode = setLeftPanelMode;

// initPlaceCardCollapse defineres og eksponeres i js/ui/place-card.js.
// Les ikke en bar top-level binding her – hvis place-card.js ikke er lastet
// før left-panel.js vil det kaste ReferenceError ("Script error. 0 0") og
// hindre at resten av expose-blokken kjører. Bruk trygg globalThis-oppslag.
if (typeof globalThis.initPlaceCardCollapse === "function") {
  window.initPlaceCardCollapse = globalThis.initPlaceCardCollapse;
}
window.rerenderActiveLeftPanelMode = rerenderActiveLeftPanelMode;
window.renderActiveLeftPanelModeNow = renderActiveLeftPanelModeNow;
window.openNearbyDrawer = openNearbyDrawer;
window.closeNearbyDrawer = closeNearbyDrawer;
window.toggleNearbyDrawer = toggleNearbyDrawer;
