/* =========================================================
   CIVICATION MAP – Stylisert Oslo SVG
   ========================================================= */

const SVG_NS = "http://www.w3.org/2000/svg";

/* =========================================================
   HELPERS
   ========================================================= */

function svgEl(tag) {
  return document.createElementNS(SVG_NS, tag);
}

/* =========================================================
   RENDER ENTRY
   ========================================================= */

function renderCiviMap() {

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

  const baseLayer = svgEl("g");
  const objectLayer = svgEl("g");
  const fxLayer = svgEl("g");

  drawBase(baseLayer, w, h);
  drawSkyline(baseLayer, w, h);
  drawRoads(baseLayer, w, h);

  svg.appendChild(baseLayer);
  svg.appendChild(objectLayer);
  svg.appendChild(fxLayer);

  host.appendChild(svg);

  renderCommercialObjects(objectLayer, fxLayer, w, h);
}

/* =========================================================
   BASE MAP
   ========================================================= */

function drawBase(base, w, h) {

  // Fjord
  const fjord = svgEl("ellipse");
  fjord.setAttribute("cx", w * 0.55);
  fjord.setAttribute("cy", h * 0.88);
  fjord.setAttribute("rx", w * 0.38);
  fjord.setAttribute("ry", h * 0.20);
  fjord.setAttribute("fill", "#0b1b2a");
  base.appendChild(fjord);

  // Bymasse
  const city = svgEl("ellipse");
  city.setAttribute("cx", w * 0.48);
  city.setAttribute("cy", h * 0.55);
  city.setAttribute("rx", w * 0.32);
  city.setAttribute("ry", h * 0.32);
  city.setAttribute("fill", "#18222f");
  base.appendChild(city);

  // Akerselva
  const river = svgEl("line");
  river.setAttribute("x1", w * 0.46);
  river.setAttribute("y1", h * 0.20);
  river.setAttribute("x2", w * 0.50);
  river.setAttribute("y2", h * 0.72);
  river.setAttribute("stroke", "#1f4e79");
  river.setAttribute("stroke-width", "4");
  river.setAttribute("opacity", "0.6");
  base.appendChild(river);
}

/* =========================================================
   SKYLINE
   ========================================================= */

function drawSkyline(base, w, h) {

  const skyline = svgEl("g");

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

    skyline.appendChild(tower);
  }

  base.appendChild(skyline);
}

/* =========================================================
   ROADS
   ========================================================= */

function drawRoad(base, x1, y1, x2, y2) {

  const road = svgEl("line");
  road.setAttribute("x1", x1);
  road.setAttribute("y1", y1);
  road.setAttribute("x2", x2);
  road.setAttribute("y2", y2);
  road.setAttribute("stroke", "rgba(255,255,255,0.08)");
  road.setAttribute("stroke-width", "2");

  base.appendChild(road);
}

function drawRoads(base, w, h) {

  const centerX = w * 0.48;
  const centerY = h * 0.55;

  drawRoad(base, centerX, centerY, w * 0.35, h * 0.55); // vest
  drawRoad(base, centerX, centerY, w * 0.60, h * 0.42); // øst
  drawRoad(base, centerX, centerY, w * 0.46, h * 0.30); // nord
  drawRoad(base, centerX, centerY, w * 0.55, h * 0.75); // sør
}

/* =========================================================
   DISTRICT COORDINATES
   ========================================================= */

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
    baerum: { x: w*0.15, y: h*0.60, suburb:true },
    asker: { x: w*0.05, y: h*0.60, suburb:true },
    lorenskog: { x: w*0.80, y: h*0.45, suburb:true },
    lillestrom: { x: w*0.88, y: h*0.38, suburb:true },
    ski: { x: w*0.78, y: h*0.95, suburb:true },
    nittedal: { x: w*0.45, y: h*0.05, suburb:true },
    nesodden: { x: w*0.70, y: h*0.70, suburb:true }
  };
}

/* =========================================================
   COMMERCIAL OBJECTS
   ========================================================= */

function renderCommercialObjects(layer, fxLayer, w, h) {

  const zones = getZones(w, h);
  const inv = window.HG_CiviShop?.getInv();
  if (!inv?.packs) return;

  window.HG_CiviShop.getPacks().then(packs => {

    const zoneStack = {};

    Object.keys(inv.packs).forEach(packId => {

      const pack = packs.find(p => String(p.id) === String(packId));
      if (!pack) return;

      const district = String(pack.district || "sentrum").toLowerCase();
      const pos = zones[district];
      if (!pos) return;

      if (!zoneStack[district]) {
        zoneStack[district] = 0;
        addDistrictGlow(fxLayer, pos.x, pos.y);
      }

      const index = zoneStack[district]++;

      const g = svgEl("g");
      g.setAttribute(
        "transform",
        `translate(${pos.x + index*18}, ${pos.y}) scale(0)`
      );

      const building = createMiniBuilding({
        isSuburb: !!pos.suburb,
        isCentral: district === "sentrum",
        type: pack.type || "generic",
        seed: index
      });

      g.appendChild(building);
      layer.appendChild(g);

      requestAnimationFrame(() => {
        g.style.transition = "transform 350ms cubic-bezier(.2,.8,.2,1)";
        g.setAttribute(
          "transform",
          `translate(${pos.x + index*18}, ${pos.y}) scale(1)`
        );
      });

    });

  });
}

/* =========================================================
   BUILDINGS
   ========================================================= */

function createMiniBuilding(config) {

  const g = svgEl("g");

  let width = 16;
  let height = 28;

  if (config.isSuburb) height = 18;
  if (config.isCentral) height = 40;

  const rect = svgEl("rect");
  rect.setAttribute("x", -width/2);
  rect.setAttribute("y", -height);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("fill", config.isSuburb ? "#4a5a6a" : "#708090");
  rect.setAttribute("rx", 2);

  g.appendChild(rect);

  return g;
}

/* =========================================================
   DISTRICT GLOW
   ========================================================= */

function addDistrictGlow(layer, x, y) {

  const glow = svgEl("circle");
  glow.setAttribute("cx", x);
  glow.setAttribute("cy", y);
  glow.setAttribute("r", 30);
  glow.setAttribute("fill", "rgba(123,216,143,0.15)");

  layer.appendChild(glow);
}
