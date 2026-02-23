// ============================================================
// CivicationMap.js
// Territory-based stylised Oslo map
// ============================================================

(function () {

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function render() {
    const host = document.getElementById("civiMapWorld");
    if (!host) return;

    host.innerHTML = "";

    const w = host.clientWidth || 900;
    const h = host.clientHeight || 600;

    const svg = svgEl("svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";

    // --------------------------
    // LAYERS
    // --------------------------

    const base = svgEl("g");
    base.setAttribute("id", "civi-map-base");

    const objects = svgEl("g");
    objects.setAttribute("id", "civi-map-objects");

    const fx = svgEl("g");
    fx.setAttribute("id", "civi-map-fx");

    // --------------------------
    // FJORD
    // --------------------------

    const fjord = svgEl("ellipse");
    fjord.setAttribute("cx", w * 0.55);
    fjord.setAttribute("cy", h * 0.88);
    fjord.setAttribute("rx", w * 0.38);
    fjord.setAttribute("ry", h * 0.20);
    fjord.setAttribute("fill", "#0b1b2a");
    fjord.setAttribute("opacity", "0.85");
    base.appendChild(fjord);

    // --------------------------
    // BYMASSE
    // --------------------------

    const city = svgEl("ellipse");
    city.setAttribute("cx", w * 0.48);
    city.setAttribute("cy", h * 0.55);
    city.setAttribute("rx", w * 0.32);
    city.setAttribute("ry", h * 0.32);
    city.setAttribute("fill", "#18222f");
    city.setAttribute("stroke", "rgba(255,255,255,0.06)");
    city.setAttribute("stroke-width", "2");
    base.appendChild(city);

    // --------------------------
    // AKERSELVA
    // --------------------------

    const elv = svgEl("line");
    elv.setAttribute("x1", w * 0.46);
    elv.setAttribute("y1", h * 0.20);
    elv.setAttribute("x2", w * 0.50);
    elv.setAttribute("y2", h * 0.72);
    elv.setAttribute("stroke", "#1f4e79");
    elv.setAttribute("stroke-width", "4");
    elv.setAttribute("opacity", "0.6");
    base.appendChild(elv);

    svg.appendChild(base);
    svg.appendChild(objects);
    svg.appendChild(fx);
    host.appendChild(svg);

    renderCommercialObjects(objects, w, h);
  }

  // ============================================================
  // DISTRICT COORDS
  // ============================================================

  function getZones(w, h) {
    return {
      gamle_oslo: { x: w*0.52, y: h*0.60 },
      grunerlokka: { x: w*0.46, y: h*0.45 },
      sagene: { x: w*0.44, y: h*0.35 },
      st_hanshaugen: { x: w*0.40, y: h*0.48 },
      frogner: { x: w*0.35, y: h*0.55 },
      ullern: { x: w*0.28, y: h*0.58 },
      vestre_aker: { x: w*0.30, y: h*0.30 },
      nordre_aker: { x: w*0.42, y: h*0.22 },
      bjerke: { x: w*0.52, y: h*0.35 },
      grorud: { x: w*0.60, y: h*0.28 },
      stovner: { x: w*0.65, y: h*0.22 },
      alna: { x: w*0.60, y: h*0.42 },
      ostensjo: { x: w*0.60, y: h*0.55 },
      nordstrand: { x: w*0.55, y: h*0.75 },
      sondre_nordstrand: { x: w*0.60, y: h*0.88 },

      // Suburbs
      baerum_fornebu: { x: w*0.15, y: h*0.60 },
      sandvika: { x: w*0.10, y: h*0.55 },
      asker: { x: w*0.05, y: h*0.60 },
      lorenskog: { x: w*0.80, y: h*0.45 },
      lillestrom: { x: w*0.88, y: h*0.38 },
      ski: { x: w*0.78, y: h*0.95 },
      nittedal: { x: w*0.45, y: h*0.05 },
      nesodden: { x: w*0.70, y: h*0.70 }
    };
  }

  // ============================================================
  // OBJECT RENDERING
  // ============================================================

  function renderCommercialObjects(layer, w, h) {
    const zones = getZones(w, h);
    const inv = window.HG_CiviShop?.getInv();
    if (!inv?.packs) return;

    const zoneStackCount = {};

    Object.keys(inv.packs).forEach(packId => {

      // midlertidig fallback
      const district = "sentrum"; 

      const pos = zones[district];
      if (!pos) return;

      if (!zoneStackCount[district]) zoneStackCount[district] = 0;
      const index = zoneStackCount[district]++;
      const offsetX = index * 18;

      const g = svgEl("g");
      g.setAttribute("transform", `translate(${pos.x + offsetX}, ${pos.y}) scale(0)`);

      const building = svgEl("rect");
      building.setAttribute("x", -10);
      building.setAttribute("y", -14);
      building.setAttribute("width", 20);
      building.setAttribute("height", 28);
      building.setAttribute("fill", "#ffffff");
      building.setAttribute("stroke", "#222");
      building.setAttribute("stroke-width", "1.5");

      g.appendChild(building);
      layer.appendChild(g);

      requestAnimationFrame(() => {
        g.style.transition = "transform 350ms cubic-bezier(.2,.8,.2,1)";
        g.setAttribute("transform", `translate(${pos.x + offsetX}, ${pos.y}) scale(1)`);
      });
    });
  }

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    render();
    window.addEventListener("resize", render, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", init);

})();
