// CivicationMap.js
// Stylisert Oslo-kart + replica-bygg fra Civication packs
(function () {

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  // Landemerke → bygningstype (brukes hvis pack.placeId finnes)
  const PLACE_TYPE = {
    operaen: "opera",
    barcode: "barcode",
    munch_museet: "museum",
    nasjonalmuseet: "museum",
    astrup_fearnley: "museum",
    deichman_bjorvika: "library",
    stortinget: "parliament",
    oslo_radhus: "cityhall",
    nationaltheatret: "theatre",
    rockefeller: "club",
    bla: "club",
    parkteatret: "theatre",
    salt: "venue",
    ullevaal_stadion: "stadium",
    valle_hovin: "stadium",
    holmenkollen: "tower",
    aker_brygge: "harbor",
    tjuvholmen: "harbor",
    youngstorget: "square",
    tollbukaia: "port",
    havnelageret: "warehouse",
    oslo_posthus: "post",
    telegrafbygningen: "telecom",
    oslo_gassverk: "factory",
    akershus_kaier: "port",
    jernbaneverkstedet_lodalen: "rail",
    akerselva_industri: "factory",
    myrens_verksted: "factory",
    lilleborg_fabrikker: "factory",
    schous_bryggeri: "brewery",
    ringnes_bryggeri: "brewery",
    hausmania: "culture_house",
    skur13: "skate",
    stovnertarnet: "tower",
    vulkan_energisentral: "power",
    botanisk_hage: "park",
    sognsvann: "park"
  };

  function normalizeType(raw) {
    const t = String(raw || "").trim().toLowerCase();
    if (!t) return "generic";

    // gamle generiske typer (fargekoder)
    if (t === "kultur") return "generic_kultur";
    if (t === "butikk") return "generic_butikk";
    if (t === "industri") return "generic_industri";
    if (t === "bolig") return "generic_bolig";

    return t;
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

        // ======================================================
    // DEFS (50-talls plakat / spillkart-effekter)
    // ======================================================
    const defs = svgEl("defs");

    // Sky / paper tint
    const skyGrad = svgEl("radialGradient");
    skyGrad.setAttribute("id", "civiSkyGrad");
    skyGrad.setAttribute("cx", "50%");
    skyGrad.setAttribute("cy", "0%");
    skyGrad.setAttribute("r", "80%");
    const sky1 = svgEl("stop"); sky1.setAttribute("offset", "0%");  sky1.setAttribute("stop-color", "#ffffff"); sky1.setAttribute("stop-opacity", "0.75");
    const sky2 = svgEl("stop"); sky2.setAttribute("offset", "55%"); sky2.setAttribute("stop-color", "#cfe9ff"); sky2.setAttribute("stop-opacity", "0.28");
    const sky3 = svgEl("stop"); sky3.setAttribute("offset", "100%");sky3.setAttribute("stop-color", "#f7f0d8"); sky3.setAttribute("stop-opacity", "0.18");
    skyGrad.appendChild(sky1); skyGrad.appendChild(sky2); skyGrad.appendChild(sky3);
    defs.appendChild(skyGrad);

    // Fjord gradient
    const fjordGrad = svgEl("linearGradient");
    fjordGrad.setAttribute("id", "civiFjordGrad");
    fjordGrad.setAttribute("x1", "0%"); fjordGrad.setAttribute("y1", "0%");
    fjordGrad.setAttribute("x2", "0%"); fjordGrad.setAttribute("y2", "100%");
    const f1 = svgEl("stop"); f1.setAttribute("offset", "0%");   f1.setAttribute("stop-color", "#9ad7ff"); f1.setAttribute("stop-opacity", "0.95");
    const f2 = svgEl("stop"); f2.setAttribute("offset", "100%"); f2.setAttribute("stop-color", "#4a9fdc"); f2.setAttribute("stop-opacity", "0.95");
    fjordGrad.appendChild(f1); fjordGrad.appendChild(f2);
    defs.appendChild(fjordGrad);

    // City / parkland gradient
    const cityGrad = svgEl("radialGradient");
    cityGrad.setAttribute("id", "civiCityGrad");
    cityGrad.setAttribute("cx", "45%");
    cityGrad.setAttribute("cy", "45%");
    cityGrad.setAttribute("r", "70%");
    const c1 = svgEl("stop"); c1.setAttribute("offset", "0%");   c1.setAttribute("stop-color", "#e7f4da"); c1.setAttribute("stop-opacity", "0.98");
    const c2 = svgEl("stop"); c2.setAttribute("offset", "70%");  c2.setAttribute("stop-color", "#bfe3a6"); c2.setAttribute("stop-opacity", "0.98");
    const c3 = svgEl("stop"); c3.setAttribute("offset", "100%"); c3.setAttribute("stop-color", "#95c987"); c3.setAttribute("stop-opacity", "0.98");
    cityGrad.appendChild(c1); cityGrad.appendChild(c2); cityGrad.appendChild(c3);
    defs.appendChild(cityGrad);

    // Soft shadow for “cutout” look
    const drop = svgEl("filter");
    drop.setAttribute("id", "civiDrop");
    drop.setAttribute("x", "-30%"); drop.setAttribute("y", "-30%");
    drop.setAttribute("width", "160%"); drop.setAttribute("height", "160%");
    const feD = svgEl("feDropShadow");
    feD.setAttribute("dx", "0");
    feD.setAttribute("dy", "2");
    feD.setAttribute("stdDeviation", "2.2");
    feD.setAttribute("flood-color", "rgba(0,0,0,0.22)");
    drop.appendChild(feD);
    defs.appendChild(drop);

    // Grain overlay (plakat/papir)
    const grain = svgEl("filter");
    grain.setAttribute("id", "civiGrain");
    grain.setAttribute("x", "-20%"); grain.setAttribute("y", "-20%");
    grain.setAttribute("width", "140%"); grain.setAttribute("height", "140%");
    const turb = svgEl("feTurbulence");
    turb.setAttribute("type", "fractalNoise");
    turb.setAttribute("baseFrequency", "0.9");
    turb.setAttribute("numOctaves", "2");
    turb.setAttribute("stitchTiles", "stitch");
    const col = svgEl("feColorMatrix");
    col.setAttribute("type", "matrix");
    col.setAttribute("values", `
      0 0 0 0 0
      0 0 0 0 0
      0 0 0 0 0
      0 0 0 .08 0
    `.trim().replace(/\s+/g, " "));
    grain.appendChild(turb);
    grain.appendChild(col);
    defs.appendChild(grain);

    svg.appendChild(defs);

    const base = svgEl("g");
    base.setAttribute("id", "civi-map-base");

    // “Sollys” over kartet (idyll/50-talls-illustrasjon)
    const sunlight = svgEl("circle");
    sunlight.setAttribute("cx", w * 0.20);
    sunlight.setAttribute("cy", h * 0.18);
    sunlight.setAttribute("r", Math.min(w,h) * 0.28);
    sunlight.setAttribute("fill", "rgba(255, 235, 170, 0.35)");
    base.appendChild(sunlight);

    const objects = svgEl("g");
    objects.setAttribute("id", "civi-map-objects");

    const fx = svgEl("g");
    fx.setAttribute("id", "civi-map-fx");

// Fjord (sommerfjord) – stilisert form (ikke ellipse)
    const fjord = svgEl("path");
    fjord.setAttribute("d", `
      M ${w*0.18} ${h*0.76}
      Q ${w*0.34} ${h*0.83}, ${w*0.52} ${h*0.88}
      Q ${w*0.68} ${h*0.92}, ${w*0.86} ${h*0.86}
      L ${w*0.86} ${h*1.02}
      L ${w*0.18} ${h*1.02}
      Z
    `);
    fjord.setAttribute("fill", "url(#civiFjordGrad)");
    fjord.setAttribute("opacity", "0.92");
    fjord.setAttribute("stroke", "rgba(20,60,90,0.22)");
    fjord.setAttribute("stroke-width", "2");
    fjord.setAttribute("filter", "url(#civiDrop)");
    base.appendChild(fjord);



     function addIsland(x, y, r) {
     const island = svgEl("ellipse");
     island.setAttribute("cx", x);
     island.setAttribute("cy", y);
     island.setAttribute("rx", r * 1.6);
     island.setAttribute("ry", r);
     island.setAttribute("fill", "rgba(70,110,70,0.7)");
     island.setAttribute("stroke", "rgba(40,70,40,0.4)");
     island.setAttribute("stroke-width", "1.5");
     base.appendChild(island);
   }

   addIsland(w*0.55, h*0.86, 10);
   addIsland(w*0.62, h*0.90, 7);
   addIsland(w*0.48, h*0.89, 8);

   

    const zones = getZones(w, h);

    function drawDistrictArea(id, points, style = {}) {
      const zone = zones[id];
      if (!zone) return;
      const poly = svgEl("polygon");
      poly.setAttribute("points", points.map(([px, py]) => `${w*px},${h*py}`).join(" "));
      poly.setAttribute("fill", style.fill || "rgba(255,255,255,0.25)");
      poly.setAttribute("stroke", style.stroke || "rgba(0,0,0,0.25)");
      poly.setAttribute("stroke-width", style.strokeWidth || "1.2");
      poly.setAttribute("opacity", style.opacity || "0.85");
      base.appendChild(poly);
    }

    function drawCityBlocks(id, cfg = {}) {
      const zone = zones[id];
      if (!zone) return;
      const g = svgEl("g");
      const cols = cfg.cols || 4;
      const rows = cfg.rows || 3;
      const cellW = cfg.cellW || 8;
      const cellH = cfg.cellH || 6;
      const gap = cfg.gap || 3;
      const x0 = zone.x - ((cols * cellW + (cols - 1) * gap) / 2);
      const y0 = zone.y - ((rows * cellH + (rows - 1) * gap) / 2);
      for (let ry = 0; ry < rows; ry++) {
        for (let cx = 0; cx < cols; cx++) {
          if ((cx + ry + (cfg.seed || 0)) % (cfg.skipModulo || 7) === 0) continue;
          const rect = svgEl("rect");
          rect.setAttribute("x", x0 + cx * (cellW + gap));
          rect.setAttribute("y", y0 + ry * (cellH + gap));
          rect.setAttribute("width", cellW - (cx % 2));
          rect.setAttribute("height", cellH - (ry % 2));
          rect.setAttribute("fill", cfg.fill || "rgba(76,91,105,0.36)");
          rect.setAttribute("stroke", "rgba(36,45,58,0.28)");
          rect.setAttribute("stroke-width", "0.5");
          g.appendChild(rect);
        }
      }
      base.appendChild(g);
    }

    function drawInstitution(id, kind, dx = 0, dy = 0) {
      const zone = zones[id];
      if (!zone) return;
      const g = svgEl("g");
      g.setAttribute("transform", `translate(${zone.x + dx}, ${zone.y + dy})`);
      const body = svgEl("rect");
      body.setAttribute("x", -9); body.setAttribute("y", -10);
      body.setAttribute("width", 18); body.setAttribute("height", 12);
      body.setAttribute("rx", 1.5);
      const roof = svgEl("polygon");
      roof.setAttribute("points", "-10,-10 0,-16 10,-10");
      if (kind === "rådhus") { body.setAttribute("fill", "#e7d1af"); }
      else if (kind === "bibliotek") { body.setAttribute("fill", "#d6e5f3"); }
      else if (kind === "kultur") { body.setAttribute("fill", "#d7c7e8"); }
      else if (kind === "industri") { body.setAttribute("fill", "#b5b9bf"); }
      else { body.setAttribute("fill", "#e8e8e8"); }
      roof.setAttribute("fill", "rgba(60,60,60,0.55)");
      g.appendChild(body); g.appendChild(roof); base.appendChild(g);
    }

    function drawHousingCluster(id) { drawCityBlocks(id, { cols: 4, rows: 3, cellW: 9, cellH: 7, gap: 3, fill: "rgba(199,171,140,0.45)", skipModulo: 9 }); }
    function drawCommercialCluster(id) { drawCityBlocks(id, { cols: 5, rows: 4, cellW: 7, cellH: 6, gap: 2, fill: "rgba(116,123,160,0.42)", seed: 2, skipModulo: 11 }); }
    function drawGreenArea(id, rx = 22, ry = 14) {
      const zone = zones[id]; if (!zone) return;
      const park = svgEl("ellipse");
      park.setAttribute("cx", zone.x); park.setAttribute("cy", zone.y);
      park.setAttribute("rx", rx); park.setAttribute("ry", ry);
      park.setAttribute("fill", "rgba(103,165,94,0.35)");
      park.setAttribute("stroke", "rgba(58,102,51,0.35)");
      park.setAttribute("stroke-width", "1");
      base.appendChild(park);
    }
    function drawWorkZone(id) {
      const zone = zones[id]; if (!zone) return;
      const poly = svgEl("polygon");
      poly.setAttribute("points", `${zone.x-16},${zone.y+8} ${zone.x+16},${zone.y+8} ${zone.x+10},${zone.y-8} ${zone.x-10},${zone.y-8}`);
      poly.setAttribute("fill", "rgba(123,131,140,0.35)");
      poly.setAttribute("stroke", "rgba(61,69,79,0.35)");
      poly.setAttribute("stroke-width", "1");
      base.appendChild(poly);
    }

    drawDistrictArea("sentrum", [[0.44,0.50],[0.50,0.49],[0.54,0.54],[0.50,0.60],[0.43,0.58]], { fill:"rgba(227,196,143,0.42)", stroke:"rgba(128,97,55,0.45)" });
    drawDistrictArea("grunerlokka", [[0.42,0.41],[0.48,0.40],[0.50,0.45],[0.46,0.49],[0.41,0.46]], { fill:"rgba(196,158,189,0.36)" });
    drawDistrictArea("frogner", [[0.30,0.50],[0.38,0.49],[0.40,0.56],[0.35,0.61],[0.29,0.58]], { fill:"rgba(182,200,226,0.35)" });
    drawDistrictArea("sagene", [[0.40,0.30],[0.47,0.31],[0.48,0.37],[0.43,0.40],[0.39,0.36]], { fill:"rgba(164,196,173,0.36)" });
    drawDistrictArea("gamle_oslo", [[0.49,0.56],[0.58,0.57],[0.60,0.63],[0.52,0.67],[0.47,0.62]], { fill:"rgba(196,184,168,0.4)" });
    drawDistrictArea("alna", [[0.56,0.38],[0.65,0.37],[0.67,0.44],[0.61,0.49],[0.55,0.45]], { fill:"rgba(156,161,173,0.36)" });
    drawDistrictArea("nordstrand", [[0.51,0.69],[0.61,0.71],[0.62,0.79],[0.54,0.82],[0.49,0.76]], { fill:"rgba(145,188,145,0.35)" });
    drawDistrictArea("ullern", [[0.24,0.53],[0.31,0.54],[0.32,0.61],[0.26,0.65],[0.22,0.59]], { fill:"rgba(176,190,206,0.34)" });
    drawDistrictArea("st_hanshaugen", [[0.36,0.44],[0.43,0.44],[0.44,0.49],[0.38,0.52],[0.35,0.48]], { fill:"rgba(211,180,146,0.36)" });
    drawDistrictArea("stovner", [[0.61,0.17],[0.68,0.16],[0.70,0.23],[0.64,0.27],[0.59,0.22]], { fill:"rgba(151,178,148,0.34)" });

    drawCommercialCluster("sentrum");
    drawCommercialCluster("grunerlokka");
    drawHousingCluster("frogner");
    drawHousingCluster("sagene");
    drawHousingCluster("nordstrand");
    drawHousingCluster("ullern");
    drawCityBlocks("gamle_oslo", { cols: 5, rows: 3, cellW: 8, cellH: 7, gap: 3, fill: "rgba(153,129,109,0.35)", seed: 1 });
    drawCityBlocks("st_hanshaugen", { cols: 4, rows: 3, cellW: 8, cellH: 7, gap: 3, fill: "rgba(152,141,119,0.35)" });
    drawWorkZone("alna");
    drawCityBlocks("alna", { cols: 5, rows: 3, cellW: 10, cellH: 6, gap: 4, fill: "rgba(124,131,143,0.44)", seed: 3 });
    drawWorkZone("gamle_oslo");

    drawGreenArea("nordstrand", 25, 16);
    drawGreenArea("stovner", 20, 14);
    drawGreenArea("sagene", 16, 11);

    drawInstitution("sentrum", "rådhus", -8, -12);
    drawInstitution("st_hanshaugen", "bibliotek", 6, -8);
    drawInstitution("grunerlokka", "kultur", 8, -10);
    drawInstitution("alna", "industri", 10, -8);
    drawInstitution("frogner", "handel", 8, -8);

// -------------------------------------------------------
    // Ingen skyline – realistisk kart skal ikke ha kulisser
    // -------------------------------------------------------

    svg.appendChild(base);
    svg.appendChild(objects);
    svg.appendChild(fx);

    host.appendChild(svg);

    renderCommercialObjects(objects, fx, w, h);
    renderHomeObjects(objects, fx, zones);
  function getZones(w, h) {
    return {
      // Spill-sone (ikke bydel)
      sentrum: { x: w * 0.48, y: h * 0.55 },

      // Oslo bydeler
      gamle_oslo: { x: w * 0.52, y: h * 0.60 },
      grunerlokka: { x: w * 0.46, y: h * 0.45 },
      sagene: { x: w * 0.44, y: h * 0.35 },
      st_hanshaugen: { x: w * 0.40, y: h * 0.48 },
      frogner: { x: w * 0.35, y: h * 0.55 },
      ullern: { x: w * 0.28, y: h * 0.58 },
      vestre_aker: { x: w * 0.30, y: h * 0.30 },
      nordre_aker: { x: w * 0.42, y: h * 0.22 },
      bjerke: { x: w * 0.52, y: h * 0.35 },
      grorud: { x: w * 0.60, y: h * 0.28 },
      stovner: { x: w * 0.65, y: h * 0.22 },
      alna: { x: w * 0.60, y: h * 0.42 },
      ostensjo: { x: w * 0.60, y: h * 0.55 },
      nordstrand: { x: w * 0.55, y: h * 0.75 },
      sondre_nordstrand: { x: w * 0.60, y: h * 0.88 },

      // Suburbs
      baerum_fornebu: { x: w * 0.15, y: h * 0.60, suburb: true },
      sandvika: { x: w * 0.10, y: h * 0.55, suburb: true },
      asker: { x: w * 0.05, y: h * 0.60, suburb: true },
      lorenskog: { x: w * 0.80, y: h * 0.45, suburb: true },
      lillestrom: { x: w * 0.88, y: h * 0.38, suburb: true },
      ski: { x: w * 0.78, y: h * 0.95, suburb: true },
      nittedal: { x: w * 0.45, y: h * 0.05, suburb: true },
      nesodden: { x: w * 0.70, y: h * 0.70, suburb: true }
    };
  }

  // Mini-bygg dispatcher (replicaer + generisk fallback)
    function createMiniBuilding(options = {}) {

  const capital =
  JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");

const isSuburb = !!options.isSuburb;
const isCentral = !!options.isCentral;
const seed = Number(options.seed || 0);

const type = normalizeType(options.type);

const baseScale = isCentral
  ? 1.15
  : (isSuburb ? 0.90 : 1.0);

const economicScale =
  1 + (capital.economic || 0) / 200;

const wrapper = svgEl("g");
wrapper.setAttribute(
  "transform",
  `scale(${baseScale * economicScale})`
);

    switch (type) {
      case "opera": wrapper.appendChild(buildOpera()); return wrapper;
      case "barcode": wrapper.appendChild(buildBarcode(seed)); return wrapper;
      case "museum": wrapper.appendChild(buildMuseum(seed)); return wrapper;
      case "library": wrapper.appendChild(buildLibrary()); return wrapper;
      case "parliament": wrapper.appendChild(buildParliament()); return wrapper;
      case "cityhall": wrapper.appendChild(buildCityHall()); return wrapper;
      case "theatre": wrapper.appendChild(buildTheatre()); return wrapper;
      case "club":
      case "venue":
      case "culture_house": wrapper.appendChild(buildVenue(seed)); return wrapper;
      case "stadium": wrapper.appendChild(buildStadium()); return wrapper;
      case "tower": wrapper.appendChild(buildTower(seed)); return wrapper;
      case "warehouse":
      case "port":
      case "harbor": wrapper.appendChild(buildHarbor(seed)); return wrapper;
      case "post":
      case "telecom":
      case "rail":
      case "power": wrapper.appendChild(buildInfrastructure(type, seed)); return wrapper;
      case "brewery":
      case "factory": wrapper.appendChild(buildFactory(seed)); return wrapper;
      case "skate": wrapper.appendChild(buildSkate()); return wrapper;
      case "park": wrapper.appendChild(buildPark(seed)); return wrapper;

      // gamle generiske fargekoder
      case "generic_kultur":
      case "generic_butikk":
      case "generic_industri":
      case "generic_bolig":
        wrapper.appendChild(buildGenericHouse({ isSuburb, isCentral, seed, flavor: type }));
        return wrapper;

      default:
        wrapper.appendChild(buildGenericHouse({ isSuburb, isCentral, seed, flavor: "generic" }));
        return wrapper;
    }
  }
}

  // Replica-bygninger (enkle SVG-ikoner)
  function buildOpera() {
    const g = svgEl("g");
    const base = svgEl("polygon");
    base.setAttribute("points", "-20,0 20,0 10,-10 -10,-10");
    base.setAttribute("fill", "#dfe6ee");
    const roof = svgEl("polygon");
    roof.setAttribute("points", "-10,-10 10,-10 0,-20");
    roof.setAttribute("fill", "#ffffff");
    g.appendChild(base);
    g.appendChild(roof);
    return g;
  }

  function buildBarcode(seed) {
    const g = svgEl("g");
    for (let i = 0; i < 4; i++) {
      const rect = svgEl("rect");
      rect.setAttribute("x", -12 + i * 6);
      rect.setAttribute("y", -40 + (i * 4));
      rect.setAttribute("width", 4);
      rect.setAttribute("height", 40 - (i * 4));
      rect.setAttribute("fill", ["#6c757d", "#7f8c8d", "#8d99ae"][seed % 3]);
      g.appendChild(rect);
    }
    return g;
  }

  function buildMuseum(seed) {
    const g = svgEl("g");
    const plinth = svgEl("rect");
    plinth.setAttribute("x", -14);
    plinth.setAttribute("y", -10);
    plinth.setAttribute("width", 28);
    plinth.setAttribute("height", 10);
    plinth.setAttribute("fill", "#ced4da");
    const body = svgEl("rect");
    body.setAttribute("x", -12);
    body.setAttribute("y", -30);
    body.setAttribute("width", 24);
    body.setAttribute("height", 20);
    body.setAttribute("fill", ["#dee2e6", "#e9ecef", "#f8f9fa"][seed % 3]);
    body.setAttribute("stroke", "rgba(0,0,0,0.25)");
    body.setAttribute("stroke-width", "1");
    const roof = svgEl("polygon");
    roof.setAttribute("points", "-12,-30 0,-40 12,-30");
    roof.setAttribute("fill", "#adb5bd");
    g.appendChild(plinth);
    g.appendChild(body);
    g.appendChild(roof);
    return g;
  }

  function buildLibrary() {
    const g = svgEl("g");
    const body = svgEl("rect");
    body.setAttribute("x", -14);
    body.setAttribute("y", -22);
    body.setAttribute("width", 28);
    body.setAttribute("height", 22);
    body.setAttribute("fill", "#f1f3f5");
    body.setAttribute("stroke", "rgba(0,0,0,0.25)");
    body.setAttribute("stroke-width", "1");
    const stripe = svgEl("rect");
    stripe.setAttribute("x", -14);
    stripe.setAttribute("y", -14);
    stripe.setAttribute("width", 28);
    stripe.setAttribute("height", 4);
    stripe.setAttribute("fill", "#74c0fc");
    g.appendChild(body);
    g.appendChild(stripe);
    return g;
  }

  function buildParliament() {
    const g = svgEl("g");
    const base = svgEl("rect");
    base.setAttribute("x", -16);
    base.setAttribute("y", -18);
    base.setAttribute("width", 32);
    base.setAttribute("height", 18);
    base.setAttribute("fill", "#f0c674");
    base.setAttribute("stroke", "rgba(0,0,0,0.25)");
    base.setAttribute("stroke-width", "1");
    const dome = svgEl("ellipse");
    dome.setAttribute("cx", 0);
    dome.setAttribute("cy", -20);
    dome.setAttribute("rx", 10);
    dome.setAttribute("ry", 6);
    dome.setAttribute("fill", "#e0a800");
    g.appendChild(base);
    g.appendChild(dome);
    return g;
  }

  function buildCityHall() {
    const g = svgEl("g");
    const left = svgEl("rect");
    left.setAttribute("x", -16);
    left.setAttribute("y", -34);
    left.setAttribute("width", 12);
    left.setAttribute("height", 34);
    left.setAttribute("fill", "#b56576");
    const right = svgEl("rect");
    right.setAttribute("x", 4);
    right.setAttribute("y", -34);
    right.setAttribute("width", 12);
    right.setAttribute("height", 34);
    right.setAttribute("fill", "#b56576");
    const mid = svgEl("rect");
    mid.setAttribute("x", -4);
    mid.setAttribute("y", -18);
    mid.setAttribute("width", 8);
    mid.setAttribute("height", 18);
    mid.setAttribute("fill", "#9a4f63");
    g.appendChild(left);
    g.appendChild(right);
    g.appendChild(mid);
    return g;
  }

  function buildTheatre() {
    const g = svgEl("g");
    const body = svgEl("rect");
    body.setAttribute("x", -16);
    body.setAttribute("y", -18);
    body.setAttribute("width", 32);
    body.setAttribute("height", 18);
    body.setAttribute("fill", "#f8f9fa");
    body.setAttribute("stroke", "rgba(0,0,0,0.25)");
    body.setAttribute("stroke-width", "1");
    const roof = svgEl("polygon");
    roof.setAttribute("points", "-16,-18 0,-30 16,-18");
    roof.setAttribute("fill", "#6c757d");
    g.appendChild(body);
    g.appendChild(roof);
    return g;
  }

  function buildVenue(seed) {
    const g = svgEl("g");
    const body = svgEl("rect");
    body.setAttribute("x", -14);
    body.setAttribute("y", -16);
    body.setAttribute("width", 28);
    body.setAttribute("height", 16);
    body.setAttribute("fill", ["#ff66cc", "#ffd166", "#74c0fc"][seed % 3]);
    const sign = svgEl("rect");
    sign.setAttribute("x", -10);
    sign.setAttribute("y", -22);
    sign.setAttribute("width", 20);
    sign.setAttribute("height", 6);
    sign.setAttribute("fill", "rgba(0,0,0,0.35)");
    g.appendChild(body);
    g.appendChild(sign);
    return g;
  }

  function buildStadium() {
    const g = svgEl("g");
    const base = svgEl("ellipse");
    base.setAttribute("cx", 0);
    base.setAttribute("cy", -10);
    base.setAttribute("rx", 18);
    base.setAttribute("ry", 8);
    base.setAttribute("fill", "#2a9d8f");
    const ring = svgEl("ellipse");
    ring.setAttribute("cx", 0);
    ring.setAttribute("cy", -10);
    ring.setAttribute("rx", 12);
    ring.setAttribute("ry", 5);
    ring.setAttribute("fill", "rgba(255,255,255,0.25)");
    g.appendChild(base);
    g.appendChild(ring);
    return g;
  }

  function buildTower(seed) {
    const g = svgEl("g");
    const body = svgEl("rect");
    body.setAttribute("x", -4);
    body.setAttribute("y", -34);
    body.setAttribute("width", 8);
    body.setAttribute("height", 34);
    body.setAttribute("fill", ["#adb5bd", "#8d99ae", "#6c757d"][seed % 3]);
    const cap = svgEl("polygon");
    cap.setAttribute("points", "-6,-34 0,-42 6,-34");
    cap.setAttribute("fill", "#495057");
    g.appendChild(body);
    g.appendChild(cap);
    return g;
  }

  function buildHarbor(seed) {
    const g = svgEl("g");
    const dock = svgEl("rect");
    dock.setAttribute("x", -18);
    dock.setAttribute("y", -10);
    dock.setAttribute("width", 36);
    dock.setAttribute("height", 10);
    dock.setAttribute("fill", "#343a40");
    const container = svgEl("rect");
    container.setAttribute("x", -14);
    container.setAttribute("y", -24);
    container.setAttribute("width", 12);
    container.setAttribute("height", 14);
    container.setAttribute("fill", ["#ff8800", "#ffb703", "#06d6a0"][seed % 3]);
    const crane = svgEl("line");
    crane.setAttribute("x1", 10);
    crane.setAttribute("y1", -24);
    crane.setAttribute("x2", 16);
    crane.setAttribute("y2", -10);
    crane.setAttribute("stroke", "rgba(255,255,255,0.35)");
    crane.setAttribute("stroke-width", "2");
    g.appendChild(dock);
    g.appendChild(container);
    g.appendChild(crane);
    return g;
  }

  function buildInfrastructure(kind, seed) {
    const g = svgEl("g");
    const body = svgEl("rect");
    body.setAttribute("x", -14);
    body.setAttribute("y", -20);
    body.setAttribute("width", 28);
    body.setAttribute("height", 20);
    body.setAttribute("fill", "#ced4da");
    const icon = svgEl("rect");
    icon.setAttribute("x", -6);
    icon.setAttribute("y", -16);
    icon.setAttribute("width", 12);
    icon.setAttribute("height", 8);
    const map = { post: "#ff595e", telecom: "#74c0fc", rail: "#adb5bd", power: "#ffd166" };
    icon.setAttribute("fill", map[kind] || ["#74c0fc", "#ffd166"][seed % 2]);
    g.appendChild(body);
    g.appendChild(icon);
    return g;
  }

  function buildFactory(seed) {
    const g = svgEl("g");
    const body = svgEl("rect");
    body.setAttribute("x", -12);
    body.setAttribute("y", -20);
    body.setAttribute("width", 24);
    body.setAttribute("height", 20);
    body.setAttribute("fill", "#5c6b73");
    const chimney = svgEl("rect");
    chimney.setAttribute("x", 6);
    chimney.setAttribute("y", -35);
    chimney.setAttribute("width", 6);
    chimney.setAttribute("height", 15);
    chimney.setAttribute("fill", "#3a444a");
    const smoke = svgEl("circle");
    smoke.setAttribute("cx", 9);
    smoke.setAttribute("cy", -40);
    smoke.setAttribute("r", 4);
    smoke.setAttribute("fill", "rgba(255,255,255,0.25)");
    g.appendChild(body);
    g.appendChild(chimney);
    if (seed % 2 === 0) g.appendChild(smoke);
    return g;
  }

  function buildSkate() {
    const g = svgEl("g");
    const ramp = svgEl("path");
    ramp.setAttribute("d", "M -16 0 Q -6 -18 12 -10 L 16 0 Z");
    ramp.setAttribute("fill", "#495057");
    g.appendChild(ramp);
    return g;
  }

  function buildPark(seed) {
    const g = svgEl("g");
    const trunk = svgEl("rect");
    trunk.setAttribute("x", -2);
    trunk.setAttribute("y", -12);
    trunk.setAttribute("width", 4);
    trunk.setAttribute("height", 12);
    trunk.setAttribute("fill", "#8b5e3c");
    const crown = svgEl("circle");
    crown.setAttribute("cx", 0);
    crown.setAttribute("cy", -18);
    crown.setAttribute("r", 10);
    crown.setAttribute("fill", ["#2d6a4f", "#40916c", "#52b788"][seed % 3]);
    g.appendChild(trunk);
    g.appendChild(crown);
    return g;
  }

  // Generisk “Settlers”-hus (tak/vinduer/trær + fargevarianter)
  function buildGenericHouse({ isSuburb, isCentral, seed, flavor }) {
    const g = svgEl("g");

    let width = 18 + (seed % 3) * 4;
    let height = 24 + (seed % 4) * 6;

    if (isCentral) height *= 1.6;
    if (isSuburb) height *= 0.8;

    let baseColor = "#ffffff";
    let roofColor = "#495057";

    if (flavor === "generic_kultur") baseColor = "#ffd166";
    if (flavor === "generic_butikk") baseColor = "#06d6a0";
    if (flavor === "generic_industri") baseColor = "#adb5bd";
    if (flavor === "generic_bolig") baseColor = "#e9ecef";

    if (isSuburb) roofColor = "#8d99ae";

    const body = svgEl("rect");
    body.setAttribute("x", -width / 2);
    body.setAttribute("y", -height);
    body.setAttribute("width", width);
    body.setAttribute("height", height);
    body.setAttribute("fill", baseColor);
    body.setAttribute("stroke", "#222");
    body.setAttribute("stroke-width", "1.2");
    
    const capital =
     JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
    body.setAttribute("fill-opacity", 0.6 + (capital.symbolic || 0) / 250);
   
    const roof = svgEl("polygon");
    roof.setAttribute("points", `${-width/2},${-height} 0,${-height - 10} ${width/2},${-height}`);
    roof.setAttribute("fill", roofColor);

    g.appendChild(body);
    g.appendChild(roof);

    const floors = Math.floor(height / 12);
    for (let i = 0; i < floors; i++) {
      const win = svgEl("rect");
      win.setAttribute("x", -width / 4);
      win.setAttribute("y", -height + 8 + i * 12);
      win.setAttribute("width", 4);
      win.setAttribute("height", 4);
      win.setAttribute("fill", "#ffe066");
      g.appendChild(win);
    }

    if (isSuburb) {
      const tree = svgEl("circle");
      tree.setAttribute("cx", width / 2 + 6);
      tree.setAttribute("cy", -6);
      tree.setAttribute("r", 5);
      tree.setAttribute("fill", "#2d6a4f");
      g.appendChild(tree);
    }

    return g;
  }

  
  function renderCommercialObjects(objectsLayer, fxLayer, w, h) {
    const rawCapital =
     JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
    const capital = normalizeCapital(rawCapital);
    
    const zones = getZones(w, h);

    const inv = window.HG_CiviShop?.getInv();
    if (!inv?.packs) return;

    const packsPromise = window.HG_CiviShop?.getPacks?.();
    if (!packsPromise) return;

    packsPromise.then((packs) => {
      const zoneStackCount = {};

      Object.keys(inv.packs).forEach((packId) => {
        const pack = packs.find((p) => String(p.id) === String(packId));
        if (!pack) return;

        const district = String(pack.district || "sentrum").toLowerCase();
const pos = zones[district];
if (!pos) return;

// Init stack counter hvis ikke finnes
if (zoneStackCount[district] === undefined) {
  zoneStackCount[district] = 0;

  // Base glow (én per aktiv sone)
  addDistrictGlow(fxLayer, pos.x, pos.y);

  // Subculture-forsterkning (kun suburbs)
  if (pos.suburb && capital.subculture > 60) {
    const boost = svgEl("circle");
    boost.setAttribute("cx", pos.x);
    boost.setAttribute("cy", pos.y);
    boost.setAttribute("r", 32);
    boost.setAttribute("fill", "rgba(255,120,200,0.15)");
    boost.setAttribute("class", "civi-subculture-glow");
    fxLayer.appendChild(boost);
  }
}

        const index = zoneStackCount[district]++;

        const offsetX = index * 18;
        const offsetY = index > 2 ? -20 : 0;

        const g = svgEl("g");
        g.setAttribute("data-pack-id", String(pack.id || ""));
        g.setAttribute("transform", `translate(${pos.x + offsetX}, ${pos.y + offsetY}) scale(0)`);

        const inferredType =
          pack.type ||
          (pack.placeId ? PLACE_TYPE[String(pack.placeId).trim()] : "") ||
          "generic";

        const building = createMiniBuilding({
          isSuburb: !!pos.suburb,
          isCentral: district === "sentrum",
          type: inferredType,
          seed: index
        });

        g.appendChild(building);
        objectsLayer.appendChild(g);

        requestAnimationFrame(() => {
          g.style.transition = "transform 350ms cubic-bezier(.2,.8,.2,1)";
          g.setAttribute("transform", `translate(${pos.x + offsetX}, ${pos.y + offsetY}) scale(1)`);
        });
      });
    });
  }

   // ============================================================
// HOME OBJECTS (PERSONLIG LAG)
// ============================================================

function renderHomeObjects(objectsLayer, fxLayer, zones) {
  const homeState = window.CivicationHome?.getState?.();
  if (!homeState) return;

  if (homeState.home?.status !== "settled") return;
  if (!Array.isArray(homeState.objects) || homeState.objects.length === 0) return;

  const district = homeState.home.district;
  const pos = zones[district];
  if (!pos) return;

  homeState.objects.forEach((obj, index) => {

    const g = svgEl("g");
    g.setAttribute("data-home-object", obj.type || "home");
    g.setAttribute(
      "transform",
      `translate(${pos.x + index * 18}, ${pos.y - 12}) scale(0)`
    );

    const building = createMiniBuilding({
      isSuburb: !!pos.suburb,
      isCentral: district === "sentrum",
      type: obj.type || "generic",
      seed: index,
      isHome: true
    });

    g.appendChild(building);
    objectsLayer.appendChild(g);

    requestAnimationFrame(() => {
      g.style.transition = "transform 300ms ease-out";
      g.setAttribute(
        "transform",
        `translate(${pos.x + index * 18}, ${pos.y - 12}) scale(1)`
      );
    });
  });
}
  
function drawNetworkLine(x1,y1,x2,y2,strength){
  const line = svgEl("line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "rgba(255,255,255,0.15)");
  line.setAttribute("stroke-width", 1 + strength/25);
  return line;
}
  
function normalizeCapital(capital) {
  const result = {};
  Object.keys(capital).forEach(key => {
    result[key] = Math.max(0, Math.min(100, capital[key]));
  });
  return result;
}
  
  function init() {
  render();

  window.addEventListener("resize", render, { passive: true });
  window.addEventListener("civi:homeChanged", render);
  window.addEventListener("civi:mapActivated", render);
}

document.addEventListener("DOMContentLoaded", init);

})();
