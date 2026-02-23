// ============================================================
// CivicationMap.js
// Territory-based stylised Oslo map (district-aware)
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

    const base = svgEl("g");
    base.setAttribute("id", "civi-map-base");

    const objects = svgEl("g");
    objects.setAttribute("id", "civi-map-objects");

    const fx = svgEl("g");
    fx.setAttribute("id", "civi-map-fx");

    // Fjord
    const fjord = svgEl("ellipse");
    fjord.setAttribute("cx", w * 0.55);
    fjord.setAttribute("cy", h * 0.88);
    fjord.setAttribute("rx", w * 0.38);
    fjord.setAttribute("ry", h * 0.20);
    fjord.setAttribute("fill", "#0b1b2a");
    fjord.setAttribute("opacity", "0.85");
    base.appendChild(fjord);

    // Bymasse
    const city = svgEl("ellipse");
    city.setAttribute("cx", w * 0.48);
    city.setAttribute("cy", h * 0.55);
    city.setAttribute("rx", w * 0.32);
    city.setAttribute("ry", h * 0.32);
    city.setAttribute("fill", "#18222f");
    city.setAttribute("stroke", "rgba(255,255,255,0.06)");
    city.setAttribute("stroke-width", "2");
    base.appendChild(city);

    // Akerselva
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
  // DISTRICT MAP
  // ============================================================

  function getZones(w, h) {
    return {
      sentrum: { x: w*0.48, y: h*0.55 },
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
      baerum_fornebu: { x: w*0.15, y: h*0.60, suburb: true },
      sandvika: { x: w*0.10, y: h*0.55, suburb: true },
      asker: { x: w*0.05, y: h*0.60, suburb: true },
      lorenskog: { x: w*0.80, y: h*0.45, suburb: true },
      lillestrom: { x: w*0.88, y: h*0.38, suburb: true },
      ski: { x: w*0.78, y: h*0.95, suburb: true },
      nittedal: { x: w*0.45, y: h*0.05, suburb: true },
      nesodden: { x: w*0.70, y: h*0.70, suburb: true }
    };
  }

  function createMiniBuilding(isSuburb = false, seed = 0) {

  const g = svgEl("g");

  const width = 18 + (seed % 3) * 3;
  const height = 22 + (seed % 4) * 4;

  const baseColor = isSuburb
    ? "#c9d6ff"
    : ["#f8f9fa", "#e9ecef", "#dee2e6", "#ffffff"][seed % 4];

  const roofColor = isSuburb ? "#8d99ae" : "#495057";

  // Kropp
  const body = svgEl("rect");
  body.setAttribute("x", -width / 2);
  body.setAttribute("y", -height);
  body.setAttribute("width", width);
  body.setAttribute("height", height);
  body.setAttribute("fill", baseColor);
  body.setAttribute("stroke", "#222");
  body.setAttribute("stroke-width", "1.2");

  // Tak
  const roof = svgEl("polygon");
  roof.setAttribute(
    "points",
    `${-width/2},${-height} 0,${-height - 10} ${width/2},${-height}`
  );
  roof.setAttribute("fill", roofColor);

  // Dør
  const door = svgEl("rect");
  door.setAttribute("x", -3);
  door.setAttribute("y", -10);
  door.setAttribute("width", 6);
  door.setAttribute("height", 10);
  door.setAttribute("fill", "#343a40");

  // Vinduer
  const window1 = svgEl("rect");
  window1.setAttribute("x", -width/4);
  window1.setAttribute("y", -height + 6);
  window1.setAttribute("width", 4);
  window1.setAttribute("height", 4);
  window1.setAttribute("fill", "#ffe066");

  const window2 = svgEl("rect");
  window2.setAttribute("x", width/4 - 4);
  window2.setAttribute("y", -height + 6);
  window2.setAttribute("width", 4);
  window2.setAttribute("height", 4);
  window2.setAttribute("fill", "#ffe066");

  g.appendChild(body);
  g.appendChild(roof);
  g.appendChild(door);
  g.appendChild(window1);
  g.appendChild(window2);

  return g;
}
  
  // ============================================================
  // OBJECTS
  // ============================================================

  function renderCommercialObjects(layer, w, h) {

    const zones = getZones(w, h);
    const inv = window.HG_CiviShop?.getInv();
    if (!inv?.packs) return;

    const packsPromise = window.HG_CiviShop?.getPacks?.();
    if (!packsPromise) return;

    packsPromise.then(packs => {

      const zoneStackCount = {};

      Object.keys(inv.packs).forEach(packId => {

        const pack = packs.find(p => String(p.id) === String(packId));
        if (!pack) return;

        const district = String(pack.district || "sentrum").toLowerCase();
        const pos = zones[district];
        if (!pos) return;

        if (!zoneStackCount[district]) zoneStackCount[district] = 0;
        const index = zoneStackCount[district]++;

        const offsetX = index * 18;
        const offsetY = index > 2 ? -20 : 0;

        const g = svgEl("g");
        g.setAttribute("transform",
          `translate(${pos.x + offsetX}, ${pos.y + offsetY}) scale(0)`
        );

        if (pos.suburb) {
          building.setAttribute("fill", "#c9d6ff");
          building.setAttribute("stroke", "#2f3e46");
        } else {
          building.setAttribute("fill", "#ffffff");
          building.setAttribute("stroke", "#222");
        }

        building.setAttribute("stroke-width", "1.5");

        const building = createMiniBuilding(pos.suburb, index);
        g.appendChild(building);
        layer.appendChild(g);

        requestAnimationFrame(() => {
          g.style.transition = "transform 350ms cubic-bezier(.2,.8,.2,1)";
          g.setAttribute("transform",
            `translate(${pos.x + offsetX}, ${pos.y + offsetY}) scale(1)`
          );
        });
      });

    });
  }

  function init() {
    render();
    window.addEventListener("resize", render, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", init);

})();
