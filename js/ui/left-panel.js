// ============================================================
// LEFT PANEL – NEARBY / PEOPLE / NATURE / ROUTES / BADGES
// Eier: #nearbyListContainer + panel*-seksjoner
// Init: initLeftPanel() kalles fra DOMContentLoaded
// ============================================================

function hg$(id) {
  return document.getElementById(id);
}

// ============================================================
// PLACE CARD – collapse / expand
// ============================================================

function getPlaceCardEl() {
  return hg$("placeCard");
}

function isPlaceCardCollapsed() {
  return !!getPlaceCardEl()?.classList.contains("is-collapsed");
}

function collapsePlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;
  pc.classList.add("is-collapsed");
  document.body.classList.add("pc-collapsed");
  try { localStorage.setItem("hg_placecard_collapsed_v1", "1"); } catch {}
  window.HGMap?.resize?.();
  window.MAP?.resize?.();
}

function expandPlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;
  pc.classList.remove("is-collapsed");
  document.body.classList.remove("pc-collapsed");
  try { localStorage.setItem("hg_placecard_collapsed_v1", "0"); } catch {}
  window.HGMap?.resize?.();
  window.MAP?.resize?.();
}

function togglePlaceCard() {
  isPlaceCardCollapsed() ? expandPlaceCard() : collapsePlaceCard();
}

function initPlaceCardCollapse() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  try {
    if (localStorage.getItem("hg_placecard_collapsed_v1") === "1") {
      collapsePlaceCard();
    }
  } catch {}

  // kun topp-strip (~32px) toggler
  pc.addEventListener("click", (e) => {
    const rect = pc.getBoundingClientRect();
    if ((e.clientY - rect.top) <= 32) {
      e.preventDefault();
      togglePlaceCard();
    }
  });
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

  // 🔹 Render riktig liste når mode byttes
if (mode === "nearby" && typeof renderNearbyPlaces === "function") {
  renderNearbyPlaces();
}

if (mode === "people" && typeof renderNearbyPeople === "function") {
  renderNearbyPeople();
}

  try { localStorage.setItem("hg_leftpanel_mode_v1", mode); } catch {}

  document.querySelectorAll(".nearby-tab").forEach(btn => {
    btn.classList.toggle(
      "is-active",
      btn.getAttribute("data-leftmode") === mode
    );
  });

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
  
  console.log("INIT STEP 1");
  
  const panel = hg$("nearbyListContainer");
  const sel = hg$("leftPanelMode");
  if (!panel || !sel) return;

  let saved = null;
  try { saved = localStorage.getItem("hg_leftpanel_mode_v1"); } catch {}

  const mode = saved || sel.value || "nearby";
  sel.value = mode;
  setLeftPanelMode(mode);

  // dropdown (skjult, men state-holder)
  sel.addEventListener("change", () => setLeftPanelMode(sel.value));

  // tabs
  document.querySelectorAll(".nearby-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const m = btn.getAttribute("data-leftmode") || "nearby";
      sel.value = m;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  
console.log("INIT STEP 2");
  
  renderLeftBadges();

console.log("INIT STEP 3");
  
  syncLeftPanelFrame();
  window.addEventListener("resize", syncLeftPanelFrame);

  // observer placeCard
  const pc = hg$("placeCard");
  if (pc && "ResizeObserver" in window) {
    new ResizeObserver(syncLeftPanelFrame).observe(pc);
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
