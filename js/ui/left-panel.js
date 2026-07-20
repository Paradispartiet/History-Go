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

function getActiveBadgeFilter() {
  return window.HGNearbyFilters?.getActiveBadgeFilter?.() || "all";
}

function setActiveBadgeFilter(nextFilter, options = {}) {
  const current = getActiveBadgeFilter();
  const next = window.HGNearbyFilters?.setActiveBadgeFilter?.(nextFilter) || "all";

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


  // Filterkontroller eies av TypeScript-controlleren.
  window.HGNearbyFilterControls?.init?.();
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
