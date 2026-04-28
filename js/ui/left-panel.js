// ============================================================
// LEFT PANEL – NEARBY / PEOPLE / NATURE / ROUTES / BADGES
// Eier: #nearbyListContainer + panel*-seksjoner
// Init: initLeftPanel() kalles fra DOMContentLoaded
// ============================================================

function hg$(id) {
  return document.getElementById(id);
}

function hgActiveLeftPanelMode() {
  return document.querySelector(".nearby-tab.is-active")?.getAttribute("data-leftmode") || "nearby";
}

function rerenderActiveLeftPanelMode() {
  const mode = hgActiveLeftPanelMode();

  if (mode === "nearby" && typeof renderNearbyPlaces === "function") renderNearbyPlaces();
  if (mode === "people" && typeof renderNearbyPeople === "function") renderNearbyPeople();
  if (mode === "nature" && typeof renderNearbyNature === "function") renderNearbyNature();
  if (mode === "routes" && typeof renderLeftRoutesList === "function") renderLeftRoutesList();
  if (mode === "badges" && typeof renderLeftBadges === "function") renderLeftBadges();
}

// ============================================================
// LEFT PANEL MODES
// ============================================================

function setLeftPanelMode(mode) {
  const views = {
    nearby: hg$("panelNearby"),
    people: hg$("panelPeople"),
    nature: hg$("panelNature"),
    routes: hg$("panelRoutes"),
    badges: hg$("panelBadges"),
  };

  Object.entries(views).forEach(([key, el]) => {
    if (!el) return;
    el.style.display = (key === mode) ? "" : "none";
  });

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

  rerenderActiveLeftPanelMode();

  window.HGMap?.resize?.();
  window.MAP?.resize?.();
}

// ============================================================
// FRAME SYNC (kun header)
// ============================================================

function syncLeftPanelFrame() {
  const header =
    document.querySelector("header") ||
    document.querySelector(".site-header");

  if (!header) return;

  const shell = document.querySelector(".app-shell");

  const hr = header.getBoundingClientRect();
  let headerH = hr.bottom;

  if (shell) {
    const sr = shell.getBoundingClientRect();
    headerH = hr.bottom - sr.top;
  }

  headerH = Math.max(0, Math.round(headerH));

  document.documentElement.style.setProperty("--hg-header-h", headerH + "px");
}

// ============================================================
// BADGE FILTER HELPERS
// ============================================================

function getCategoryById(id) {
  const cats = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  return cats.find(c => String(c.id || "").trim() === String(id || "").trim()) || null;
}

function getNearbyBadgeOptions() {
  const cats = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  return ["all", ...cats.map(c => String(c.id || "").trim()).filter(Boolean)];
}

function getActiveBadgeFilter() {
  return window.HG_NEARBY_BADGE_FILTER || "all";
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

function renderLeftBadges() {
  const box = hg$("leftBadgesList");
  if (!box) return;

  if (!Array.isArray(window.CATEGORY_LIST) || !window.CATEGORY_LIST.length) {
    box.innerHTML = `<div class="muted">Ingen kategorier lastet.</div>`;
    return;
  }

  const activeBadge = getActiveBadgeFilter();
  let categories = window.CATEGORY_LIST;

  if (activeBadge !== "all") {
    categories = categories.filter(c => String(c.id || "").trim() === String(activeBadge).trim());
  }

  if (!categories.length) {
    box.innerHTML = `
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">🏅</div>
        <div class="hg-empty-guide-title">Ingen merker</div>
        <div class="hg-empty-guide-text">Badgefilteret skjuler alle merker akkurat nå. Trykk badgeknappen for å vise alle.</div>
      </div>
    `;
    return;
  }

  box.innerHTML = categories.map(c => `
    <button class="chip ghost" data-badge-id="${c.id}"
      style="justify-content:flex-start;width:100%;">
      <img src="bilder/merker/${c.id}.PNG"
           alt=""
           style="width:18px;height:18px;margin-right:8px;border-radius:4px;">
      ${c.name}
    </button>
  `).join("");

  box.querySelectorAll("[data-badge-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      window.HG_NEARBY_BADGE_FILTER = btn.getAttribute("data-badge-id") || "all";
      try { localStorage.setItem("hg_nearby_badge_filter_v1", window.HG_NEARBY_BADGE_FILTER); } catch {}
      if (typeof window.updateNearbyBadgeFilterButton === "function") window.updateNearbyBadgeFilterButton();
      renderLeftBadges();
    });
  });
}

// ============================================================
// NEARBY BADGE FILTER BUTTON
// ============================================================

function ensureNearbyBadgeFilterButton(placeFilterBtn) {
  if (!placeFilterBtn) return null;

  let btn = document.getElementById("nearbyBadgeFilterBtn");
  if (btn) return btn;

  btn = document.createElement("button");
  btn.id = "nearbyBadgeFilterBtn";
  btn.className = "nearby-filter-icon nearby-badge-filter-icon";
  btn.type = "button";
  btn.setAttribute("aria-label", "Badgefilter");

  placeFilterBtn.insertAdjacentElement("afterend", btn);
  return btn;
}

// ============================================================
// INIT
// ============================================================

function initLeftPanel() {

  const panel = hg$("nearbyListContainer");
  const sel   = hg$("leftPanelMode");
  if (!panel || !sel) return;

    window.HG_NEARBY_FILTER =
      localStorage.getItem("hg_nearby_filter_v1") || "unvisited";

    window.HG_NEARBY_BADGE_FILTER =
      localStorage.getItem("hg_nearby_badge_filter_v1") || "all";

    window.HG_NATURE_FILTER =
      localStorage.getItem("hg_nature_filter_v1") || "all";

  let saved = null;
  try { saved = localStorage.getItem("hg_leftpanel_mode_v1"); } catch {}

  const mode = saved || sel.value || "nearby";
  sel.value = mode;
  
  setLeftPanelMode(mode);

  // dropdown (skjult state-holder)
  sel.addEventListener("change", () => setLeftPanelMode(sel.value));

  // tabs
  document.querySelectorAll(".nearby-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const m = btn.getAttribute("data-leftmode") || "nearby";
      sel.value = m;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    });
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

  const PLACES_ICONS = { unvisited: "🎯", unlocked: "🔓", all: "🌍" };
  const PLACES_ORDER = ["unvisited", "all", "unlocked"];

  const NATURE_ICONS = { all: "🌍", unlocked: "🔓", flora: "🌿", fauna: "🐞" };
  const NATURE_ORDER = ["all", "unlocked", "flora", "fauna"];

  function updateBadgeFilterButton() {
    if (!badgeBtn) return;

    badgeBtn.style.display = "inline-flex";

    const filter = getActiveBadgeFilter();
    const cat = getCategoryById(filter);

    if (!cat || filter === "all") {
      badgeBtn.textContent = "🏅";
      badgeBtn.title = "Badgefilter: alle";
      badgeBtn.setAttribute("aria-label", "Badgefilter: alle");
      return;
    }

    badgeBtn.innerHTML = `<img src="bilder/merker/${cat.id}.PNG" alt="" style="width:22px;height:22px;object-fit:contain;display:block;">`;
    badgeBtn.title = `Badgefilter: ${cat.name || cat.id}`;
    badgeBtn.setAttribute("aria-label", `Badgefilter: ${cat.name || cat.id}`);
  }
  window.updateNearbyBadgeFilterButton = updateBadgeFilterButton;

  function updateFilterButton() {
    if (!btn) return;
    const mode = hgActiveLeftPanelMode();
    if (mode === "nature") {
      btn.textContent = NATURE_ICONS[window.HG_NATURE_FILTER] || "🌍";
      btn.title = `Natur-filter: ${window.HG_NATURE_FILTER}`;
    } else {
      btn.textContent = PLACES_ICONS[window.HG_NEARBY_FILTER] || "🎯";
      btn.title = `Filter: ${window.HG_NEARBY_FILTER}`;
    }

    updateBadgeFilterButton();
  }
  window.updateNearbyFilterButton = updateFilterButton;

  if (btn) {
    btn.addEventListener("click", () => {
      const mode = hgActiveLeftPanelMode();
      if (mode === "nature") {
        const i = NATURE_ORDER.indexOf(window.HG_NATURE_FILTER);
        window.HG_NATURE_FILTER = NATURE_ORDER[(i + 1) % NATURE_ORDER.length];
        try { localStorage.setItem("hg_nature_filter_v1", window.HG_NATURE_FILTER); } catch {}
        updateFilterButton();
        if (typeof renderNearbyNature === "function") renderNearbyNature();
      } else {
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
      const order = getNearbyBadgeOptions();
      const current = getActiveBadgeFilter();
      const i = order.indexOf(current);
      window.HG_NEARBY_BADGE_FILTER = order[(i + 1) % order.length] || "all";
      try { localStorage.setItem("hg_nearby_badge_filter_v1", window.HG_NEARBY_BADGE_FILTER); } catch {}
      updateBadgeFilterButton();
      rerenderActiveLeftPanelMode();
    });
  }

  updateFilterButton();
  updateBadgeFilterButton();
}

// ============================================================
// COLLAPSE API (kartmodus osv.)
// ============================================================

window.setNearbyCollapsed = function (hidden) {
  // Nearby skal kun kollapse i kartmodus
  if (window.LayerManager?.getMode?.() !== "map") hidden = false;

  const panel = hg$("nearbyListContainer");
  if (!panel) return;

  panel.classList.toggle("is-hidden", !!hidden);

  window.HGMap?.resize?.();
  window.MAP?.resize?.();
};

// ============================================================
// EXPOSE
// ============================================================

window.initLeftPanel = initLeftPanel;
window.initPlaceCardCollapse = initPlaceCardCollapse;
