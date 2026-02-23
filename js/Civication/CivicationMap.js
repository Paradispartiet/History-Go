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

function drawRoad(x1, y1, x2, y2) {
  const road = svgEl("line");
  road.setAttribute("x1", x1);
  road.setAttribute("y1", y1);
  road.setAttribute("x2", x2);
  road.setAttribute("y2", y2);
  road.setAttribute("stroke", "rgba(255,255,255,0.08)");
  road.setAttribute("stroke-width", "3");
  base.appendChild(road);
}

drawRoad(w*0.48, h*0.55, w*0.35, h*0.55); // sentrum → frogner
drawRoad(w*0.48, h*0.55, w*0.46, h*0.45); // sentrum → grunerløkka
drawRoad(w*0.48, h*0.55, w*0.52, h*0.60); // sentrum → gamle oslo

  svg.appendChild(base);
  svg.appendChild(objects);
  svg.appendChild(fx);
}
    
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
// SECTION: SKYLINE (Sentrum Only)
// ============================================================

function drawSkyline() {

  const skyline = svgEl("g");
  skyline.setAttribute("id", "civi-skyline");

  const centerX = w * 0.48;
  const centerY = h * 0.55;

  for (let i = 0; i < 6; i++) {

    const width = 18 + i * 4;
    const height = 60 + i * 12;

    const tower = svgEl("rect");
    tower.setAttribute("x", centerX - 60 + i * 25);
    tower.setAttribute("y", centerY - height);
    tower.setAttribute("width", width);
    tower.setAttribute("height", height);
    tower.setAttribute("fill", "rgba(255,255,255,0.05)");
    tower.setAttribute("stroke", "rgba(255,255,255,0.08)");
    tower.setAttribute("stroke-width", "1");

    skyline.appendChild(tower);
  }

  base.appendChild(skyline);
}

drawSkyline();

// ============================================================
// SECTION: ACTIVE DISTRICT GLOW
// ============================================================

function addDistrictGlow(layer, x, y) {

  const glow = svgEl("circle");
  glow.setAttribute("cx", x);
  glow.setAttribute("cy", y);
  glow.setAttribute("r", 22);
  glow.setAttribute("fill", "rgba(255,255,150,0.15)");
  glow.setAttribute("class", "civi-glow");

  layer.appendChild(glow);
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

  function createMiniBuilding(options = {}) {

  const {
    isSuburb = false,
    type = "generic",
    seed = 0,
    isCentral = false
  } = options;

  const g = svgEl("g");

  let width = 18 + (seed % 3) * 4;
  let height = 24 + (seed % 4) * 6;

  if (isCentral) {
    height *= 1.6;  // høyere i sentrum
  }

  if (isSuburb) {
    height *= 0.8;  // lavere i suburbs
  }

  let baseColor = "#ffffff";
  let roofColor = "#495057";

  if (type === "kultur") baseColor = "#ffd166";
  if (type === "butikk") baseColor = "#06d6a0";
  if (type === "industri") baseColor = "#adb5bd";
  if (type === "bolig") baseColor = "#e9ecef";

  if (isSuburb) roofColor = "#8d99ae";

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

  g.appendChild(body);
  g.appendChild(roof);

  // Vinduer
  const floors = Math.floor(height / 12);
  for (let i = 0; i < floors; i++) {
    const win = svgEl("rect");
    win.setAttribute("x", -width/4);
    win.setAttribute("y", -height + 8 + i*12);
    win.setAttribute("width", 4);
    win.setAttribute("height", 4);
    win.setAttribute("fill", "#ffe066");
    g.appendChild(win);
  }

  // Trær i suburbs
  if (isSuburb) {
    const tree = svgEl("circle");
    tree.setAttribute("cx", width/2 + 6);
    tree.setAttribute("cy", -6);
    tree.setAttribute("r", 5);
    tree.setAttribute("fill", "#2d6a4f");
    g.appendChild(tree);
  }

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

        const isCentral = district === "sentrum";

        const building = createMiniBuilding({
         isSuburb: !!pos.suburb,
         isCentral: isCentral,
         type: pack.type || "generic",
         seed: index
      });

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
