// ==============================
// 9.x VENSTRE PANEL – DROPDOWN + RAMME
// (må ligge før wire/boot, og init kjøres i DOMContentLoaded)
// ==============================

function getPlaceCardEl() {
  return document.getElementById("placeCard");
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
  if (window.HGMap?.resize) HGMap.resize();
  if (window.MAP?.resize) window.MAP.resize();
}

function expandPlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;
  pc.classList.remove("is-collapsed");
  document.body.classList.remove("pc-collapsed");
  try { localStorage.setItem("hg_placecard_collapsed_v1", "0"); } catch {}
  if (window.HGMap?.resize) HGMap.resize();
  if (window.MAP?.resize) window.MAP.resize();
}

function togglePlaceCard() {
  if (isPlaceCardCollapsed()) expandPlaceCard();
  else collapsePlaceCard();
}

function initPlaceCardCollapse() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  // restore collapsed-state
  const saved = (() => {
    try { return localStorage.getItem("hg_placecard_collapsed_v1") === "1"; }
    catch { return false; }
  })();
  if (saved) collapsePlaceCard();

  // KUN handle-stripen (øverste ~32px) toggler
  pc.addEventListener("click", (e) => {
    const rect = pc.getBoundingClientRect();
    const y = e.clientY - rect.top;
    if (y <= 32) {
      e.preventDefault();
      togglePlaceCard();
    }
  });
}


function initLeftPanel() {
  const sel = document.getElementById("leftPanelMode");
  const vNearby = document.getElementById("panelNearby");
  const vRoutes  = document.getElementById("panelRoutes");
  const vBadges  = document.getElementById("panelBadges");

  if (!sel || !vNearby || !vRoutes || !vBadges) return;

  function show(mode) {
    vNearby.style.display = mode === "nearby" ? "" : "none";
    vRoutes.style.display  = mode === "routes" ? "" : "none";
    vBadges.style.display  = mode === "badges" ? "" : "none";
    try { localStorage.setItem("hg_leftpanel_mode_v1", mode); } catch {}
  }

  // restore mode
  const saved = localStorage.getItem("hg_leftpanel_mode_v1") || "nearby";
  sel.value = saved;
  show(saved);

  sel.addEventListener("change", () => show(sel.value));

  renderLeftBadges();
  syncLeftPanelFrame();

  window.addEventListener("resize", syncLeftPanelFrame);

  // resync når placeCard endrer høyde (åpne/lukke/innhold)
  const pc = document.getElementById("placeCard");
  if (pc && "ResizeObserver" in window) {
    const ro = new ResizeObserver(() => syncLeftPanelFrame());
    ro.observe(pc);
  } else {
    // fallback: mild polling (billig)
    let last = 0;
    setInterval(() => {
      const el = document.getElementById("placeCard");
      if (!el) return;
      const h = Math.round(el.getBoundingClientRect().height || 0);
      if (Math.abs(h - last) > 6) {
        last = h;
        syncLeftPanelFrame();
      }
    }, 500);
  }
}

function syncLeftPanelFrame() {
  const header = document.querySelector("header") || document.querySelector(".site-header");
  const pc = document.getElementById("placeCard");
  if (!pc) return;

  const headerH = Math.round(header?.getBoundingClientRect().height || 62);
  document.documentElement.style.setProperty("--hg-header-h", headerH + "px");

  // ✅ Eksakt: hvor mye plass placeCard faktisk tar fra bunnen
  const rect = pc.getBoundingClientRect();

  // bottomOffset = avstand fra bunnen av viewport til toppen av placeCard
  // (dette matcher selv om du har ekstra bunnpanel/knapper)
  let bottomOffset = Math.round(window.innerHeight - rect.top);

  // fallback hvis placeCard midlertidig måles rart
  if (!isFinite(bottomOffset) || bottomOffset < 80) bottomOffset = 220;

  document.documentElement.style.setProperty("--hg-placecard-h", bottomOffset + "px");
}

function renderLeftBadges() {
  const box = document.getElementById("leftBadgesList");
  if (!box) return;

  if (!Array.isArray(CATEGORY_LIST) || !CATEGORY_LIST.length) {
    box.innerHTML = `<div style="color:#9bb0c9;">Ingen kategorier lastet.</div>`;
    return;
  }

  box.innerHTML = CATEGORY_LIST.map(c => {
    const img = `bilder/merker/${c.id}.PNG`;
    return `
      <button class="chip ghost" data-badge-id="${c.id}" style="justify-content:flex-start; width:100%;">
        <img src="${img}" alt="" style="width:18px; height:18px; margin-right:8px; border-radius:4px;">
        ${c.name}
      </button>
    `;
  }).join("");

  // (valgfritt) klikk-håndtering kan legges i wire() via delegation senere
}

// === LEFTPANEL TABS (Rad 1) ===
(function bindLeftPanelTabs(){
  const sel = document.getElementById("leftPanelMode");
  if (!sel) return;

  document.querySelectorAll(".nearby-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-leftmode") || "nearby";
      sel.value = mode;

      // trigger eksisterende change-logikk
      sel.dispatchEvent(new Event("change", { bubbles: true }));

      // aktiv-state visuelt
      document.querySelectorAll(".nearby-tab").forEach(b => {
        b.classList.toggle("is-active", b === btn);
      });
    });
  });
})();

// === SEARCH (Rad 1) – lagrer query og ber om rerender ===
(function bindNearbySearch(){
  const inp = document.getElementById("nearbySearch");
  if (!inp) return;

  window.HG_NEARBY_QUERY = window.HG_NEARBY_QUERY || "";

  inp.addEventListener("input", (e) => {
    window.HG_NEARBY_QUERY = (e.target.value || "").trim().toLowerCase();

    // be pos.js om å rerendre om den har en funksjon
    window.renderNearbyPlaces?.();
  });
})();

