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
  return document.querySelector(".nearby-tab.is-active")?.getAttribute("data-leftmode") || "nearby";
}

function normalizeNearbySort(mode) {
  const raw = String(mode || "distance").trim().toLowerCase();
  if (raw === "oldest" || raw === "newest") return raw;
  return "distance";
}

function getNearbyControlsContainer(placeFilterBtn) {
  return document.querySelector(".nearby-controls") || placeFilterBtn?.parentElement || null;
}

function updateNearbyControlVisibility() {
  const mode = hgActiveLeftPanelMode();
  const btn = document.getElementById("nearbyFilterBtn");
  const badgeBtn = document.getElementById("nearbyBadgeFilterBtn");
  const sortBtn = document.getElementById("nearbySortBtn");

  if (btn) btn.style.display = (mode === "nearby" || mode === "nature") ? "inline-flex" : "none";
  if (badgeBtn) badgeBtn.style.display = (mode === "nature") ? "none" : "inline-flex";
  if (sortBtn) sortBtn.style.display = (mode === "nearby" || mode === "favorites") ? "inline-flex" : "none";
}

let _leftPanelRenderRaf = 0;
let _leftPanelRenderTimer = 0;

function renderActiveLeftPanelModeNow() {
  const mode = hgActiveLeftPanelMode();

  if (mode === "nearby" && typeof renderNearbyPlaces === "function") renderNearbyPlaces();
  if (mode === "favorites" && typeof renderLeftFavoritesList === "function") renderLeftFavoritesList();
  if (mode === "people" && typeof renderNearbyPeople === "function") renderNearbyPeople();
  if (mode === "nature" && typeof renderNearbyNature === "function") renderNearbyNature();
  if (mode === "music" && typeof renderNearbyMusic === "function") renderNearbyMusic();
  if (mode === "routes" && typeof renderLeftRoutesList === "function") renderLeftRoutesList();
  if (mode === "badges" && typeof renderLeftBadges === "function") renderLeftBadges();
}

function rerenderActiveLeftPanelMode() {
  // Badgefilteret kan trykkes svært raskt på iPad/Safari.
  // Ikke bygg hele Nearby/People/Nature/Routes-listen for hvert trykk.
  // Samle flere raske trykk til én render i neste frame.
  if (typeof window.requestAnimationFrame === "function") {
    if (_leftPanelRenderRaf) window.cancelAnimationFrame(_leftPanelRenderRaf);
    _leftPanelRenderRaf = window.requestAnimationFrame(() => {
      _leftPanelRenderRaf = 0;
      renderActiveLeftPanelModeNow();
    });
    return;
  }

  if (_leftPanelRenderTimer) window.clearTimeout(_leftPanelRenderTimer);
  _leftPanelRenderTimer = window.setTimeout(() => {
    _leftPanelRenderTimer = 0;
    renderActiveLeftPanelModeNow();
  }, 0);
}

// ============================================================
// LEFT PANEL MODES
// ============================================================

function setLeftPanelMode(mode) {
  const listIdsByMode = {
    nearby: "nearbyList",
    favorites: "leftFavoritesList",
    people: "leftPeopleList",
    nature: "leftNatureList",
    music: "leftMusicList",
    routes: "leftRoutesList",
    badges: "leftBadgesList",
  };

  Object.entries(listIdsByMode).forEach(([key, id]) => {
    const list = hg$(id);
    if (list) list.hidden = key !== mode;
  });

  if (mode === "nature") {
    window.HG_NEARBY_BADGE_FILTER = "all";
    try {
      localStorage.setItem("hg_nearby_badge_filter_v1", "all");
    } catch {}
  }

  try {
    localStorage.setItem("hg_leftpanel_mode_v1", mode);
  } catch {}

  document.querySelectorAll(".nearby-tab").forEach(btn => {
    btn.classList.toggle(
      "is-active",
      btn.getAttribute("data-leftmode") === mode
    );
  });

  if (typeof window.updateNearbyFilterButton === "function") {
    window.updateNearbyFilterButton();
  }

  if (typeof window.updateNearbyBadgeFilterButton === "function") {
    window.updateNearbyBadgeFilterButton();
  }

  if (typeof window.updateNearbySortButton === "function") {
    window.updateNearbySortButton();
  }

  updateNearbyControlVisibility();

  rerenderActiveLeftPanelMode();

  window.HGMap?.resize?.();
  window.MAP?.resize?.();
}

// ============================================================
// UTFORSK-DRAWER (åpen/lukket)
// #nearbyListContainer er lukket som standard og åpnes via
// #nearbyExploreToggle. Tilstanden styres med klassene
// is-drawer-open / is-drawer-closed (se css/layout.css).
// ============================================================

function isNearbyDrawerOpen() {
  const panel = hg$("nearbyListContainer");
  return !!panel && panel.classList.contains("is-drawer-open");
}

function setNearbyDrawerOpen(open) {
  const panel = hg$("nearbyListContainer");
  if (!panel) return;

  panel.classList.toggle("is-drawer-open", !!open);
  panel.classList.toggle("is-drawer-closed", !open);

  const toggle = hg$("nearbyExploreToggle");
  if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");

  // Listene kan ha endret seg (posisjon, unlocks) mens draweren var lukket.
  if (open) rerenderActiveLeftPanelMode();
}

function openNearbyDrawer() {
  setNearbyDrawerOpen(true);
}

function closeNearbyDrawer() {
  setNearbyDrawerOpen(false);
}

function toggleNearbyDrawer() {
  setNearbyDrawerOpen(!isNearbyDrawerOpen());
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
  const cats = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  return cats.find(c => String(c.id || "").trim() === String(id || "").trim()) || null;
}

function getNearbyBadgeOptions() {
  const cats = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  return ["all", ...cats.map(c => String(c.id || "").trim()).filter(Boolean)];
}

function normalizeBadgeFilter(id) {
  const raw = String(id || "all").trim() || "all";
  if (raw === "all") return "all";
  return getCategoryById(raw) ? raw : "all";
}

function getActiveBadgeFilter() {
  return normalizeBadgeFilter(window.HG_NEARBY_BADGE_FILTER || "all");
}

function setActiveBadgeFilter(nextFilter, options = {}) {
  const next = normalizeBadgeFilter(nextFilter);
  const current = getActiveBadgeFilter();

  window.HG_NEARBY_BADGE_FILTER = next;
  try { localStorage.setItem("hg_nearby_badge_filter_v1", next); } catch {}

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
  const f = getActiveBadgeFilter();
  return !!f && f !== "all";
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

    window.HG_NEARBY_FILTER =
      localStorage.getItem("hg_nearby_filter_v1") || "unvisited";

    window.HG_NEARBY_BADGE_FILTER =
      normalizeBadgeFilter(localStorage.getItem("hg_nearby_badge_filter_v1") || "all");
    window.HG_NEARBY_SORT =
      normalizeNearbySort(localStorage.getItem("hg_nearby_sort_v1") || "distance");

    window.HG_NATURE_FILTER =
      localStorage.getItem("hg_nature_filter_v1") || "all";

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

  // =====================================
  // Utforsk-drawer: toggle, Escape, klikk utenfor
  // =====================================

  // Drawer starter alltid lukket (synker også aria-expanded på togglen).
  closeNearbyDrawer();

  const exploreToggle = hg$("nearbyExploreToggle");
  if (exploreToggle) {
    exploreToggle.addEventListener("click", toggleNearbyDrawer);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isNearbyDrawerOpen()) return;
    closeNearbyDrawer();
    exploreToggle?.focus?.();
  });

  document.addEventListener("click", (event) => {
    if (!isNearbyDrawerOpen()) return;

    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("#nearbyListContainer, #nearbyExploreToggle")) return;

    closeNearbyDrawer();
  });

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
  const sortBtn = ensureNearbySortButton(btn);
  updateNearbyControlVisibility();

  const PLACES_ICONS = { unvisited: "🎯", unlocked: "🔓", all: "🌍" };
  const PLACES_ORDER = ["unvisited", "all", "unlocked"];

  const NATURE_ICONS = { all: "🌍", unlocked: "🔓", flora: "🌿", fauna: "🐞" };
  const NATURE_ORDER = ["all", "unlocked", "flora", "fauna"];
  const SORT_ICONS = { distance: "📍", oldest: "⏳", newest: "🕰️" };
  const SORT_TITLES = {
    distance: () => tUI("ui.sort.sortDistance", "Sortering: Avstand"),
    oldest: () => tUI("ui.sort.sortOldest", "Sortering: Eldst"),
    newest: () => tUI("ui.sort.sortNewest", "Sortering: Nyest")
  };
  const SORT_ORDER = ["distance", "oldest", "newest"];

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

  function updateNearbySortButton() {
    if (!sortBtn) return;
    const mode = hgActiveLeftPanelMode();
    const isSortableMode = mode === "nearby" || mode === "favorites";
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
        const i = NATURE_ORDER.indexOf(window.HG_NATURE_FILTER);
        window.HG_NATURE_FILTER = NATURE_ORDER[(i + 1) % NATURE_ORDER.length];
        try { localStorage.setItem("hg_nature_filter_v1", window.HG_NATURE_FILTER); } catch {}
        updateFilterButton();
        if (typeof renderNearbyNature === "function") renderNearbyNature();
      } else if (mode === "nearby") {
        const i = PLACES_ORDER.indexOf(window.HG_NEARBY_FILTER);
        window.HG_NEARBY_FILTER = PLACES_ORDER[(i + 1) % PLACES_ORDER.length];
        try { localStorage.setItem("hg_nearby_filter_v1", window.HG_NEARBY_FILTER); } catch {}
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

  if (sortBtn) {
    sortBtn.addEventListener("click", () => {
      const mode = hgActiveLeftPanelMode();
      if (mode !== "nearby" && mode !== "favorites") return;

      const current = normalizeNearbySort(window.HG_NEARBY_SORT);
      const i = SORT_ORDER.indexOf(current);
      const next = SORT_ORDER[(i + 1) % SORT_ORDER.length] || "distance";
      window.HG_NEARBY_SORT = next;
      try { localStorage.setItem("hg_nearby_sort_v1", next); } catch {}
      updateNearbySortButton();
      rerenderActiveLeftPanelMode();
    });
  }

  updateFilterButton();
  updateBadgeFilterButton();
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
