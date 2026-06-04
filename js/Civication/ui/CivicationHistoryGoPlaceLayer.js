// CivicationHistoryGoPlaceLayer.js
// Interaktivt History Go place-lag oppå det eksisterende Civication-SVG-kartet.
// - Laster steder via DataHub.loadPlacesBase() (samme kilde som resten av appen).
// - Filtrerer til Oslo-relevante steder.
// - Tegner små realistiske SVG-miniatyrbygg i <g id="civi-map-hg-places">.
// - Klikk åpner History Go PlaceCard via index.html#/place/<placeId>.
// - Godtar både gamle miniatyrmal-navn og nye *_miniature-navn.
// Bytter ikke kartmotor, fjerner ikke eksisterende lag, dupliserer ikke stedsdata.
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const LAYER_ID = "civi-map-hg-places";

  // Projeksjons-boks (fallback lat/lon -> civi x/y).
  const OSLO_BOUNDS = { minLat: 59.80, maxLat: 60.02, minLon: 10.55, maxLon: 10.90 };
  // Bredere filter-boks for "er dette et Oslo-sted i det hele tatt".
  const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };

  const LOW_ZOOM_LIMIT = 95;
  const MID_ZOOM_LIMIT = 220;

  let _places = null;        // normaliserte + Oslo-filtrerte steder
  let _loadStarted = false;
  let _renderQueued = false;
  let _zoomRenderTimer = null;
  let _lastRenderedBucket = null;

  const node = (t) => document.createElementNS(SVG_NS, t);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function host() { return document.getElementById("civiMapWorld"); }
  function svgEl() { const h = host(); return h ? h.querySelector("svg") : null; }

  // ---------------------------------------------------------------------------
  // Lag-håndtering
  // ---------------------------------------------------------------------------
  function ensureLayer(svg) {
    let g = svg.querySelector("#" + LAYER_ID);
    if (g) return g;
    g = node("g");
    g.setAttribute("id", LAYER_ID);
    g.setAttribute("class", "civi-hg-place-layer");
    // Etter landmarks/blocks, men før labels/state hvis mulig.
    const before = svg.querySelector("#civi-map-labels") || svg.querySelector("#civi-map-state");
    if (before) svg.insertBefore(g, before); else svg.appendChild(g);
    return g;
  }

  // ---------------------------------------------------------------------------
  // Normalisering + Oslo-filter
  // ---------------------------------------------------------------------------
  function normalize(place) {
    return {
      id: place.id,
      name: place.name || place.title || place.id,
      category: place.category || "unknown",
      lat: num(place.lat),
      lon: num(place.lon),
      civiMap: place.civiMap || null,
      raw: place
    };
  }

  function inBox(p, box) {
    return p.lat != null && p.lon != null &&
      p.lat >= box.minLat && p.lat <= box.maxLat &&
      p.lon >= box.minLon && p.lon <= box.maxLon;
  }

  function isOslo(p) {
    if (inBox(p, OSLO_FILTER)) return true;
    const cm = p.civiMap;
    if (cm && String(cm.region || "").toLowerCase() === "oslo") return true;
    if (String(p.raw.city || "").toLowerCase() === "oslo") return true;
    return false;
  }

  // ---------------------------------------------------------------------------
  // Del 5 – Koordinatmodell
  // ---------------------------------------------------------------------------
  function projectOsloLatLonToCiviXY(place) {
    const cm = place.civiMap;
    if (cm && typeof cm.x === "number" && typeof cm.y === "number" &&
        cm.x >= 0 && cm.x <= 1 && cm.y >= 0 && cm.y <= 1) {
      return { x: cm.x, y: cm.y, source: "manual" };
    }
    if (place.lat == null || place.lon == null) return null;
    const b = OSLO_BOUNDS;
    let x = (place.lon - b.minLon) / (b.maxLon - b.minLon);
    let y = 1 - ((place.lat - b.minLat) / (b.maxLat - b.minLat));
    x = clamp(x, 0.04, 0.96);
    y = 0.18 + y * 0.74;          // komprimer mot byflaten
    y = clamp(y, 0.08, 0.94);
    return { x, y, source: "projected" };
  }

  // ---------------------------------------------------------------------------
  // Del 6 – Forent asset-type: gamle malnavn + nye *_miniature-navn
  // ---------------------------------------------------------------------------
  const ASSET_ALIASES = {
    opera: "theatre_miniature",
    barcode: "skyline_miniature",
    skyline: "skyline_miniature",
    museum: "museum_miniature",
    library: "library_miniature",
    parliament: "civic_building_miniature",
    storting: "civic_building_miniature",
    cityhall: "civic_building_miniature",
    radhus: "civic_building_miniature",
    rådhus: "civic_building_miniature",
    theatre: "theatre_miniature",
    theater: "theatre_miniature",
    scene: "theatre_miniature",
    club: "theatre_miniature",
    venue: "theatre_miniature",
    stadium: "stadium_miniature",
    tower: "tower_miniature",
    warehouse: "warehouse_miniature",
    port: "waterfront_miniature",
    harbor: "waterfront_miniature",
    harbour: "waterfront_miniature",
    post: "post_miniature",
    telecom: "telecom_miniature",
    rail: "station_miniature",
    power: "power_miniature",
    brewery: "brewery_miniature",
    factory: "factory_miniature",
    skate: "skatepark_miniature",
    skatepark: "skatepark_miniature",
    park: "park_miniature",
    generic_kultur: "theatre_miniature",
    generic_butikk: "commerce_miniature",
    generic_industri: "factory_miniature",
    generic_bolig: "apartment_block_miniature",
    bolig: "apartment_block_miniature",
    butikk: "commerce_miniature",
    handel: "commerce_miniature",
    industri: "factory_miniature"
  };

  function normalizeAssetType(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const key = raw.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_").replace(/[\/]+/g, "_");
    return ASSET_ALIASES[key] || key;
  }

  function nameHint(hay) {
    if (/barcode|skyline/.test(hay)) return "skyline_miniature";
    if (/rådhus|radhus|storting|parlament|parliament/.test(hay)) return "civic_building_miniature";
    if (/kirke|kapell|katedral|domkirke/.test(hay)) return "church_miniature";
    if (/stasjon|t-bane|metro|jernbane|holdeplass|rail/.test(hay)) return "station_miniature";
    if (/museum|galleri/.test(hay)) return "museum_miniature";
    if (/bibliotek/.test(hay)) return "library_miniature";
    if (/opera|teater|scene|konserthus|kino|klubb|venue/.test(hay)) return "theatre_miniature";
    if (/universitet|institutt|fakultet|skole|gymnas|høgskole|college/.test(hay)) return "school_miniature";
    if (/stadion|arena/.test(hay)) return "stadium_miniature";
    if (/festning|slott|borg|skanse/.test(hay)) return "fortress_miniature";
    if (/lekeplass/.test(hay)) return "playground_miniature";
    if (/skate|rullebrett/.test(hay)) return "skatepark_miniature";
    if (/brygge|havn|kai|verft|port|harbor|harbour/.test(hay)) return "waterfront_miniature";
    if (/bryggeri/.test(hay)) return "brewery_miniature";
    if (/fabrikk|factory|verksted/.test(hay)) return "factory_miniature";
    if (/lager|warehouse|logistikk/.test(hay)) return "warehouse_miniature";
    if (/kraft|energi|power/.test(hay)) return "power_miniature";
    if (/telecom|telekom|telefon|kringkasting/.test(hay)) return "telecom_miniature";
    if (/post/.test(hay)) return "post_miniature";
    if (/butikk|handel|marked|magasin/.test(hay)) return "commerce_miniature";
    if (/park|hage|skog|mark|lund|ås/.test(hay)) return "park_miniature";
    return null;
  }

  function categoryAsset(place, hay) {
    const cat = String(place.category || "").toLowerCase();
    switch (cat) {
      case "sport":
        if (/stadion|arena|stadium/.test(hay)) return "stadium_miniature";
        if (/skate|rullebrett/.test(hay)) return "skatepark_miniature";
        return "sports_field_miniature";
      case "kunst": return "museum_miniature";
      case "litteratur": return "library_miniature";
      case "musikk": return "theatre_miniature";
      case "by":
        if (/gate|gata|street|vei|veien|allé|alle|plass|torg/.test(hay)) return "street_miniature";
        if (/butikk|handel|marked/.test(hay)) return "commerce_miniature";
        return "apartment_block_miniature";
      case "historie":
        if (/festning|slott|borg/.test(hay)) return "fortress_miniature";
        return "default_miniature";
      case "natur":
        if (/lekeplass/.test(hay)) return "playground_miniature";
        if (/vann|dam|elv|fjord|brygge|tjern/.test(hay)) return "waterfront_miniature";
        return "park_miniature";
      case "subkultur":
        if (/skate|rullebrett/.test(hay)) return "skatepark_miniature";
        if (/scene|klubb|teater/.test(hay)) return "theatre_miniature";
        return "street_miniature";
      case "politikk": return "civic_building_miniature";
      case "vitenskap": case "psykologi": return "school_miniature";
      case "media": return "civic_building_miniature";
      case "naeringsliv": case "næringsliv": return "commerce_miniature";
      case "film": case "film_tv": case "popkultur": return "theatre_miniature";
      default: return "default_miniature";
    }
  }

  function resolveAssetType(place) {
    const cm = place.civiMap;
    const explicit = normalizeAssetType(cm && cm.assetType) || normalizeAssetType(place.raw.mapAssetType);
    if (explicit) return explicit;

    const qp = place.raw.quiz_profile || {};
    const pt = String(qp.place_type || "") + " " + String(qp.subtype || "");
    const ptHint = nameHint(pt.toLowerCase()) || normalizeAssetType(pt);
    if (ptHint && ptHint !== "default_miniature") return ptHint;

    const hay = (String(place.id) + " " + String(place.name)).toLowerCase();
    return nameHint(hay) || categoryAsset(place, hay);
  }

  // ---------------------------------------------------------------------------
  // Del 6 – SVG-miniatyrer (diorama-stil, ingen eksterne bilder)
  // ---------------------------------------------------------------------------
  const CAT_COLOR = {
    by: "#dcbf97", sport: "#86be8f", kunst: "#c5a0e8", litteratur: "#9fb5ce",
    musikk: "#e8a0c0", historie: "#d8b27a", natur: "#7fc08a", subkultur: "#b48ed8",
    politikk: "#f1ce91", vitenskap: "#83aede", media: "#a0c8d8", film: "#d0a0e0",
    film_tv: "#d0a0e0", popkultur: "#e0b0d0", psykologi: "#a8c0d0", unknown: "#cfcfcf"
  };

  function el(tag, attrs) { const n = node(tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function rect(x, y, w, h, cls) { return el("rect", { x, y, width: w, height: h, class: cls }); }
  function poly(points, cls) { return el("polygon", { points, class: cls }); }
  function line(x1, y1, x2, y2, cls) { return el("line", { x1, y1, x2, y2, class: cls }); }
  function circ(cx, cy, r, cls) { return el("circle", { cx, cy, r, class: cls }); }
  function shadow(rx) { return el("ellipse", { cx: 0, cy: 2, rx, ry: rx * 0.3, class: "civi-hg-mini-shadow" }); }
  function add(g, arr) { arr.forEach((n) => g.appendChild(n)); }

  function windowGrid(x, y, cols, rows, gap) {
    const out = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        out.push(rect(x + c * gap, y + r * gap, 1.6, 1.6, "civi-hg-window"));
    return out;
  }

  const MINI = {
    default_miniature(g) {
      add(g, [shadow(8), rect(-6, -7, 12, 9, "civi-hg-base"),
        poly("-7,-7 0,-13 7,-7", "civi-hg-roof"),
        rect(-4.5, -5, 3, 3, "civi-hg-window"), rect(1.5, -5, 3, 3, "civi-hg-window"),
        rect(-1.4, -2, 2.8, 4, "civi-hg-door")]);
    },
    apartment_block_miniature(g) {
      add(g, [shadow(8), rect(-6, -16, 12, 18, "civi-hg-base"),
        rect(-6, -16, 12, 2.2, "civi-hg-roof")]);
      add(g, windowGrid(-4.4, -13.5, 3, 5, 3));
      g.appendChild(rect(-1.4, -2, 2.8, 4, "civi-hg-door"));
    },
    skyline_miniature(g) {
      add(g, [shadow(13)]);
      [-9, -4, 1, 6].forEach((x, i) => {
        const h = [17, 23, 19, 25][i];
        g.appendChild(rect(x, -h, 4.2, h + 2, "civi-hg-base"));
        g.appendChild(rect(x, -h, 4.2, 1.4, "civi-hg-roof"));
        add(g, windowGrid(x + 0.7, -h + 3, 1, Math.max(2, Math.floor(h / 5)), 4));
      });
    },
    civic_building_miniature(g) {
      add(g, [shadow(12), rect(-10, -8, 20, 10, "civi-hg-base"),
        poly("-11,-8 0,-14 11,-8", "civi-hg-roof"), rect(-11, 1, 22, 2, "civi-hg-step")]);
      for (let i = -7.5; i <= 7.5; i += 5) g.appendChild(rect(i - 0.9, -7, 1.8, 8, "civi-hg-face"));
      g.appendChild(rect(-1.8, -3, 3.6, 5, "civi-hg-door"));
    },
    commerce_miniature(g) {
      add(g, [shadow(9), rect(-8, -9, 16, 11, "civi-hg-base"),
        rect(-8, -9, 16, 2, "civi-hg-roof"), el("path", { d: "M -8 -3 Q 0 1 8 -3", class: "civi-hg-awning" })]);
      add(g, windowGrid(-5.5, -7, 4, 1, 3.2));
      g.appendChild(rect(-2, -3, 4, 5, "civi-hg-door"));
    },
    museum_miniature(g) {
      add(g, [shadow(11), rect(-9, -7, 18, 9, "civi-hg-base"),
        poly("-10.5,-7 0,-12.5 10.5,-7", "civi-hg-roof")]);
      for (let i = -7; i <= 7; i += 3.5) g.appendChild(rect(i - 0.7, -6.5, 1.4, 8, "civi-hg-face"));
      g.appendChild(rect(-2, -3, 4, 5, "civi-hg-door"));
    },
    library_miniature(g) {
      add(g, [shadow(10), rect(-8, -10, 16, 11, "civi-hg-base"),
        rect(-9, -1, 18, 3, "civi-hg-step"), rect(-8, -10, 16, 1.8, "civi-hg-roof")]);
      for (let i = -6; i <= 6; i += 3) g.appendChild(rect(i - 0.6, -8, 1.2, 6.5, "civi-hg-window"));
    },
    theatre_miniature(g) {
      add(g, [shadow(9), rect(-7, -10, 14, 12, "civi-hg-base"),
        rect(-7, -10, 14, 2, "civi-hg-roof"),
        el("path", { d: "M -8 -3 Q 0 1 8 -3", class: "civi-hg-awning" })]);
      add(g, windowGrid(-4.5, -8, 3, 2, 3));
      g.appendChild(rect(-1.6, -3, 3.2, 5, "civi-hg-door"));
    },
    church_miniature(g) {
      add(g, [shadow(8), rect(-5.5, -9, 11, 11, "civi-hg-base"),
        poly("-6.5,-9 0,-13 6.5,-9", "civi-hg-roof"),
        rect(3, -17, 4, 10, "civi-hg-base"),
        poly("2.4,-17 5,-21 7.6,-17", "civi-hg-roof"),
        line(5, -23, 5, -20.5, "civi-hg-detail"), line(3.8, -22, 6.2, -22, "civi-hg-detail"),
        rect(-1.4, -3, 2.8, 5, "civi-hg-door"),
        circ(0, -6, 1.3, "civi-hg-window")]);
    },
    school_miniature(g) {
      add(g, [shadow(11), rect(-9, -8, 18, 10, "civi-hg-base"),
        rect(-9, -8, 18, 1.8, "civi-hg-roof"),
        line(0, -8, 0, -12, "civi-hg-detail"), poly("0,-12 4,-11 0,-10", "civi-hg-flag")]);
      add(g, windowGrid(-7, -6, 5, 2, 3));
      g.appendChild(rect(-1.6, -3, 3.2, 5, "civi-hg-door"));
    },
    station_miniature(g) {
      add(g, [shadow(11), rect(-9, -6, 18, 8, "civi-hg-base"),
        el("path", { d: "M -10 -6 Q 0 -13 10 -6 Z", class: "civi-hg-roof" }),
        line(-11, 3, 11, 3, "civi-hg-rail"), line(-11, 4.4, 11, 4.4, "civi-hg-rail")]);
      add(g, windowGrid(-6.5, -4.5, 5, 1, 3));
    },
    tower_miniature(g) {
      add(g, [shadow(7), rect(-3.8, -22, 7.6, 24, "civi-hg-base"), rect(-4.4, -22, 8.8, 2, "civi-hg-roof")]);
      add(g, windowGrid(-2.2, -18, 2, 5, 3.2));
    },
    warehouse_miniature(g) {
      add(g, [shadow(13), rect(-12, -8, 24, 10, "civi-hg-base"),
        poly("-12,-8 -6,-13 0,-8 6,-13 12,-8", "civi-hg-roof"),
        rect(-8, -3, 5, 5, "civi-hg-door"), rect(3, -3, 6, 5, "civi-hg-door")]);
    },
    factory_miniature(g) {
      add(g, [shadow(13), rect(-12, -7, 24, 9, "civi-hg-base"),
        poly("-12,-7 -8,-12 -4,-7 0,-12 4,-7 8,-12 12,-7", "civi-hg-roof"),
        rect(7, -18, 3, 11, "civi-hg-stone"), rect(7.4, -20, 2.2, 2, "civi-hg-stone")]);
      add(g, windowGrid(-9, -5, 5, 1, 4));
    },
    brewery_miniature(g) {
      MINI.factory_miniature(g);
      g.appendChild(circ(-6, -12, 1.5, "civi-hg-mini-ring"));
      g.lastChild.setAttribute("fill", "#d8b27a");
    },
    post_miniature(g) {
      MINI.commerce_miniature(g);
      const mark = rect(-2.2, -11.5, 4.4, 3, "civi-hg-flag");
      g.appendChild(mark);
    },
    telecom_miniature(g) {
      MINI.tower_miniature(g);
      g.appendChild(line(-7, -21, 0, -17, "civi-hg-detail"));
      g.appendChild(line(7, -21, 0, -17, "civi-hg-detail"));
      g.appendChild(circ(0, -17, 1.6, "civi-hg-window"));
    },
    power_miniature(g) {
      add(g, [shadow(12), rect(-8, -8, 16, 10, "civi-hg-base"),
        rect(-8, -8, 16, 2, "civi-hg-roof"), line(-12, -15, -5, 2, "civi-hg-detail"),
        line(12, -15, 5, 2, "civi-hg-detail"), line(-10, -10, 10, -10, "civi-hg-rail")]);
    },
    fortress_miniature(g) {
      add(g, [shadow(11), rect(-10, -7, 20, 9, "civi-hg-stone")]);
      for (let i = -10; i < 10; i += 4) g.appendChild(rect(i, -9, 2, 2, "civi-hg-stone"));
      add(g, [rect(5, -13, 6, 6, "civi-hg-stone"),
        rect(6, -15, 1.6, 2, "civi-hg-stone"), rect(8.4, -15, 1.6, 2, "civi-hg-stone"),
        rect(-1.6, -3, 3.2, 5, "civi-hg-door"),
        rect(-6, -4, 1.6, 1.6, "civi-hg-window")]);
    },
    stadium_miniature(g) {
      add(g, [shadow(13),
        el("ellipse", { cx: 0, cy: -3, rx: 13, ry: 7, class: "civi-hg-stone" }),
        el("ellipse", { cx: 0, cy: -3, rx: 9, ry: 4.4, class: "civi-hg-field" }),
        line(0, -7, 0, 1, "civi-hg-fieldline"),
        el("ellipse", { cx: 0, cy: -3, rx: 2.4, ry: 1.4, class: "civi-hg-fieldline-stroke" })]);
    },
    sports_field_miniature(g) {
      add(g, [shadow(11),
        rect(-10, -6, 20, 10, "civi-hg-field"),
        line(0, -6, 0, 4, "civi-hg-fieldline"),
        circ(0, -1, 2, "civi-hg-fieldline-stroke"),
        rect(-10, -3, 2.4, 4, "civi-hg-goal"), rect(7.6, -3, 2.4, 4, "civi-hg-goal")]);
    },
    skatepark_miniature(g) {
      add(g, [shadow(11), rect(-10, -4, 20, 7, "civi-hg-street"),
        el("path", { d: "M -9 2 Q -5 -7 0 2 Q 5 -7 9 2", class: "civi-hg-fieldline-stroke" }),
        line(-7, -5, -2, -1, "civi-hg-rail"), line(2, -1, 7, -5, "civi-hg-rail")]);
    },
    park_miniature(g) {
      add(g, [shadow(11),
        el("ellipse", { cx: 0, cy: 0, rx: 11, ry: 4.4, class: "civi-hg-green" }),
        rect(-0.8, -7, 1.6, 5, "civi-hg-trunk"), circ(0, -8, 3.4, "civi-hg-tree"),
        rect(5.2, -5, 1.2, 3.6, "civi-hg-trunk"), circ(5.8, -6, 2.4, "civi-hg-tree"),
        rect(-6.4, -5, 1.2, 3.6, "civi-hg-trunk"), circ(-5.8, -6, 2.4, "civi-hg-tree")]);
    },
    playground_miniature(g) {
      add(g, [shadow(10),
        el("ellipse", { cx: 0, cy: 0, rx: 10, ry: 4, class: "civi-hg-sand" }),
        // sklie
        line(-6, -7, -2, 1, "civi-hg-detail"), line(-6, -7, -6, 1, "civi-hg-detail"),
        // huske
        line(3, -8, 7, -8, "civi-hg-detail"), line(3, -8, 3, 0, "civi-hg-detail"),
        line(7, -8, 7, 0, "civi-hg-detail"), line(5, -8, 5, -2, "civi-hg-rail"),
        rect(4.2, -2.4, 1.6, 1.2, "civi-hg-roof")]);
    },
    street_miniature(g) {
      add(g, [shadow(12),
        rect(-12, -2, 24, 5, "civi-hg-street"),
        line(-10, 0.5, 10, 0.5, "civi-hg-streetline"),
        rect(-11, -10, 6, 9, "civi-hg-base"), poly("-11.5,-10 -8,-13 -4.5,-10", "civi-hg-roof"),
        rect(5, -11, 6, 10, "civi-hg-base"), rect(5, -11, 6, 1.6, "civi-hg-roof")]);
      add(g, windowGrid(-9.5, -8, 2, 2, 2.6));
      add(g, windowGrid(6, -9, 2, 3, 2.6));
    },
    waterfront_miniature(g) {
      add(g, [shadow(12),
        rect(-12, 0, 24, 4, "civi-hg-water"),
        line(-11, 1.4, 11, 1.4, "civi-hg-waterline"),
        rect(-10, -2, 20, 2.4, "civi-hg-quay"),
        // liten kran
        rect(-4, -12, 1.6, 10, "civi-hg-detail"), line(-3.2, -12, 5, -12, "civi-hg-detail"),
        line(5, -12, 5, -7, "civi-hg-rail"),
        // liten bygning
        rect(4, -8, 7, 8, "civi-hg-base"), rect(4, -8, 7, 1.6, "civi-hg-roof")]);
    }
  };

  // ---------------------------------------------------------------------------
  // Del 8 – prioritet + synlighet per zoom
  // ---------------------------------------------------------------------------
  function getZoom() {
    try { return window.CivicationMapZoom && window.CivicationMapZoom.getZoom() || 1; }
    catch (e) { return 1; }
  }

  function zoomBucket(zoom) {
    if (zoom > 2.2) return "high";
    if (zoom > 1.4) return "mid";
    return "low";
  }

  function priorityOf(p) {
    const cm = p.civiMap;
    if (cm && typeof cm.priority === "number") return cm.priority;
    let s = 0;
    const hay = (p.id + " " + p.name).toLowerCase();
    const asset = resolveAssetType(p);
    if (p.category === "sport" && /stadion|arena/.test(hay)) s += 7;
    if (asset === "stadium_miniature" || asset === "skyline_miniature" || asset === "civic_building_miniature") s += 5;
    if (p.category === "historie") s += 3;
    if (p.category === "kunst" && /museum/.test(hay)) s += 4;
    if (p.category === "by") s += 2;
    if (p.raw.frontImage || p.raw.cardImage) s += 2;
    if (p.raw.quiz_profile) s += 1;
    return s;
  }

  function visibleSet(places, zoom) {
    const sorted = places.slice().sort((a, b) => priorityOf(b) - priorityOf(a));
    const bucket = zoomBucket(zoom);
    if (bucket === "high") return sorted;
    if (bucket === "mid") return sorted.slice(0, Math.min(sorted.length, MID_ZOOM_LIMIT));
    return sorted.slice(0, Math.min(sorted.length, LOW_ZOOM_LIMIT));
  }

  // ---------------------------------------------------------------------------
  // Del 9 – navigasjon
  // ---------------------------------------------------------------------------
  function navigate(placeId) {
    window.location.href = `index.html#/place/${encodeURIComponent(placeId)}`;
  }

  function buildMiniature(p, assetType, cx, cy, sc) {
    const g = node("g");
    g.setAttribute("class", "civi-hg-place-miniature");
    g.setAttribute("data-place-id", p.id);
    g.setAttribute("data-category", p.category);
    g.setAttribute("data-asset-type", assetType);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", p.name);
    g.setAttribute("transform", `translate(${cx.toFixed(1)},${cy.toFixed(1)}) scale(${sc.toFixed(3)})`);

    const title = node("title");
    title.textContent = p.name;
    g.appendChild(title);

    (MINI[assetType] || MINI.default_miniature)(g);

    const ring = circ(0, 3.6, 1.7, "civi-hg-mini-ring");
    ring.setAttribute("fill", CAT_COLOR[p.category] || CAT_COLOR.unknown);
    g.appendChild(ring);

    const label = node("text");
    label.textContent = p.name;
    label.setAttribute("class", "civi-hg-place-label");
    label.setAttribute("x", 0);
    label.setAttribute("y", -19);
    label.setAttribute("text-anchor", "middle");
    g.appendChild(label);

    g.addEventListener("click", (e) => { e.stopPropagation(); navigate(p.id); });
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); navigate(p.id); }
    });
    return g;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  function render() {
    const svg = svgEl();
    if (!svg) return;
    if (!_places) { ensureLoaded(); return; }

    const g = ensureLayer(svg);
    while (g.firstChild) g.removeChild(g.firstChild);

    const h = host();
    const w = (h && h.clientWidth) || 960;
    const hh = (h && h.clientHeight) || 640;
    const zoom = getZoom();
    const bucket = zoomBucket(zoom);
    _lastRenderedBucket = bucket;
    g.setAttribute("data-civi-zoom-level", bucket);
    const sc = clamp(1 / Math.sqrt(zoom), 0.48, 1.05);

    const list = visibleSet(_places, zoom);
    for (const p of list) {
      const proj = projectOsloLatLonToCiviXY(p);
      if (!proj) continue;
      g.appendChild(buildMiniature(p, resolveAssetType(p), proj.x * w, proj.y * hh, sc));
    }
  }

  function scheduleRender() {
    if (_renderQueued) return;
    _renderQueued = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { _renderQueued = false; render(); }));
  }

  function scheduleZoomRender() {
    const bucket = zoomBucket(getZoom());
    if (bucket === _lastRenderedBucket) return;
    clearTimeout(_zoomRenderTimer);
    _zoomRenderTimer = setTimeout(scheduleRender, 90);
  }

  // ---------------------------------------------------------------------------
  // Del 4 – innlasting via DataHub
  // ---------------------------------------------------------------------------
  function setPlaces(arr) {
    const seen = new Set();
    const out = [];
    for (const raw of (arr || [])) {
      const p = normalize(raw);
      if (!p.id || seen.has(p.id)) continue;
      if (!isOslo(p)) continue;
      seen.add(p.id);
      out.push(p);
    }
    _places = out;
    scheduleRender();
  }

  function ensureLoaded() {
    if (_loadStarted) return;
    _loadStarted = true;
    const dh = window.DataHub;
    if (dh && typeof dh.loadPlacesBase === "function") {
      dh.loadPlacesBase({ cache: "default" })
        .then(setPlaces)
        .catch((err) => {
          console.warn("[CivicationHistoryGoPlaceLayer] loadPlacesBase feilet:", err && err.message || err);
          if (Array.isArray(window.PLACES)) setPlaces(window.PLACES);
          else { _places = []; scheduleRender(); }
        });
    } else if (Array.isArray(window.PLACES)) {
      setPlaces(window.PLACES);
    } else {
      console.warn("[CivicationHistoryGoPlaceLayer] DataHub.loadPlacesBase mangler og window.PLACES finnes ikke – tegner tomt lag.");
      _places = [];
      scheduleRender();
    }
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", scheduleRender);
  ["civi:dataReady", "civi:booted", "civi:mapRendered", "resize", "storage"]
    .forEach((ev) => window.addEventListener(ev, scheduleRender));
  window.addEventListener("civi:mapZoomChanged", scheduleZoomRender);

  window.CivicationHistoryGoPlaceLayer = {
    render: scheduleRender,
    getPlaces: () => _places,
    projectOsloLatLonToCiviXY,
    resolveAssetType
  };
})();