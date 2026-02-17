// ============================================================
// LEFT PANEL – NEARBY / PEOPLE / NATURE / ROUTES / BADGES
// Eier: #nearbyListContainer + panel*-seksjoner
// Init: initLeftPanel() kalles fra DOMContentLoaded
// ============================================================

function hg$(id) {
  return document.getElementById(id);
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

  // 🔹 Render riktig liste når mode byttes
  if (mode === "nearby" && typeof renderNearbyPlaces === "function") {
    renderNearbyPlaces();
  }

  if (mode === "people" && typeof renderNearbyPeople === "function") {
    renderNearbyPeople();
  }

  if (mode === "routes" && typeof renderLeftRoutesList === "function") {
    renderLeftRoutesList();
  }

  if (mode === "badges" && typeof renderLeftBadges === "function") {
    renderLeftBadges();
  }

  window.HGMap?.resize?.();
  window.MAP?.resize?.();
}

// ============================================================
// FRAME SYNC (header + placeCard påvirker høyde)
// ============================================================

function syncLeftPanelFrame() {
  const header =
    document.querySelector("header") ||
    document.querySelector(".site-header");

  const pc = hg$("placeCard");

  const headerH = Math.round(header?.getBoundingClientRect().height || 62);
  document.documentElement.style.setProperty("--hg-header-h", headerH + "px");

  if (!pc) return;

  // 👉 bruk offsetHeight i stedet for getBoundingClientRect().top
  const h = pc.offsetHeight || 0;

  document.documentElement.style.setProperty(
    "--hg-placecard-h",
    h + "px"
  );
}

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

  box.innerHTML = window.CATEGORY_LIST.map(c => `
    <button class="chip ghost" data-badge-id="${c.id}"
      style="justify-content:flex-start;width:100%;">
      <img src="bilder/merker/${c.id}.PNG"
           alt=""
           style="width:18px;height:18px;margin-right:8px;border-radius:4px;">
      ${c.name}
    </button>
  `).join("");
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

  function updateFilterButton() {
  const icons = {
    unvisited: "🎯",  // Gjenstår
    unlocked: "🔓",   // Besøkt / låst opp
    all: "🌍"         // Alle
  };

  if (btn) {
    btn.textContent = icons[window.HG_NEARBY_FILTER] || "🎯";
  }
}

  if (btn) {
    btn.addEventListener("click", () => {
      const order = ["unvisited", "all", "unlocked"];
      const i = order.indexOf(window.HG_NEARBY_FILTER);
      window.HG_NEARBY_FILTER = order[(i + 1) % order.length];

      try {
        localStorage.setItem("hg_nearby_filter_v1", window.HG_NEARBY_FILTER);
      } catch {}

      updateFilterButton();

      if (typeof renderNearbyPlaces === "function") {
        renderNearbyPlaces();
      }
    });

    updateFilterButton();
  }
}

// ============================================================
// COLLAPSE API (kartmodus osv.)
// ============================================================

window.setNearbyCollapsed = function (hidden) {
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
