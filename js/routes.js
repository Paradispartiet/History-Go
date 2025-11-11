// ============================================================
// === HISTORY GO – ROUTES.JS (v1.1, komplett og kompatibel) ===
// ============================================================
//
//  • Leser rutedata fra HG.data.routes (lastet via core.js)
//  • Viser ruter i utforsk-panelet under “Utforsk ruter”
//  • Hver rute har en “Se på kart”-knapp som tegner ruten via map.showRouteNow()
//  • Minimal og effektiv – ingen lasting av kart eller data her
//
// ------------------------------------------------------------
// INNHOLDSFORTEGNELSE
// ------------------------------------------------------------
// 1) Initiering
// 2) Render ruter i panel
// 3) Hjelpefunksjon for farger
// 4) Eksport av funksjoner
// ============================================================

const Routes = (() => {

  // ----------------------------------------------------------
  // 1) INITIERING (kan kalles fra app.initApp)
  // ----------------------------------------------------------
  function initRoutes() {
    console.log("📜 Ruter klar:", (HG?.data?.routes || []).length, "ruter funnet");
    renderRoutesList();
  }

  // ----------------------------------------------------------
  // 2) RENDER RUTER I PANEL
  // ----------------------------------------------------------
  function renderRoutesList() {
    const list = document.getElementById("routesList");
    if (!list) return;
    list.innerHTML = "";

    const routes = HG?.data?.routes || [];
    if (!routes.length) {
      list.innerHTML = `<p style="opacity:.6;padding:10px;">Ingen ruter tilgjengelig</p>`;
      return;
    }

    routes.forEach(r => {
      const color = getCategoryColor(r.category);
      const div = document.createElement("div");
      div.className = "route-item";
      div.innerHTML = `
        <strong style="color:${color}">${r.name}</strong><br>
        <small>${r.category || ""}</small><br>
        <button class="see-map-btn" data-id="${r.id}" style="
          margin-top:6px;
          background:${color};
          color:#000;
          border:none;
          padding:4px 10px;
          border-radius:8px;
          cursor:pointer;
        ">Se på kart</button>
      `;

      // Knytt knapp til kart
      div.querySelector(".see-map-btn").onclick = () => {
        const route = routes.find(x => x.id === r.id);
        if (map?.showRouteNow && route) {
          map.showRouteNow(route);
          ui.showToast(`🗺️ Viser rute: ${r.name}`);
        }
      };

      list.appendChild(div);
    });
  }

  // ----------------------------------------------------------
  // 3) HJELPERE – farge etter kategori
  // ----------------------------------------------------------
  function getCategoryColor(cat = "") {
    const c = cat.toLowerCase();
    if (c.includes("historie")) return "#344B80";
    if (c.includes("vitenskap")) return "#9b59b6";
    if (c.includes("kunst")) return "#ffb703";
    if (c.includes("musikk")) return "#ff66cc";
    if (c.includes("litteratur")) return "#f6c800";
    if (c.includes("natur")) return "#4caf50";
    if (c.includes("sport")) return "#2a9d8f";
    if (c.includes("by")) return "#e63946";
    if (c.includes("politikk")) return "#c77dff";
    if (c.includes("populaerkultur")) return "#ff6f00";
    if (c.includes("subkultur")) return "#00c2ff";
    return "#FFD600";
  }

  // ----------------------------------------------------------
  // 4) EKSPORT
  // ----------------------------------------------------------
  return {
    initRoutes,
    renderRoutesList
  };

})();
