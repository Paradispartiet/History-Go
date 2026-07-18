// CivicationOsloMapCalibration.js
// Kalibreringsmodell for det Canvas-baserte Civication-Oslo-kartet.
//
// Inneholder faste Oslo-ankere (lat/lon -> ønsket normalisert x/y på kartet)
// og en kalibrert projeksjon basert på inverse distance weighting (IDW) over
// de nærmeste ankrene. Dette flytter History Go-places mykt mot et mer
// Oslo-riktig stilisert landskap uten å måtte plassere hvert sted manuelt.
//
// x/y-verdiene er startverdier og kan justeres senere – de er samlet her,
// ikke spredt rundt i renderlogikken.
(function (global) {
  "use strict";

  // Bounding box som matcher den gamle baseline-projeksjonen i Canvas-kartet.
  const OSLO_BOUNDS = { minLat: 59.80, maxLat: 60.02, minLon: 10.55, maxLon: 10.90 };

  // Hvor mange nærmeste ankere som brukes i IDW-vektingen.
  const NEAREST_ANCHORS = 5;
  const EPSILON = 1e-4;

  // Ankere: ekte lat/lon -> ønsket normalisert x/y på det stiliserte kartet.
  // De sentrale ankrene ligger på de håndmodellerte landemerkenes posisjoner, så
  // History GO-places projiseres i tråd med landemerkene (ting ligger riktig ift
  // hverandre). Feltet er tett nok (vest/nord medregnet) til at IDW-interpolasjonen
  // ikke over-trekker enkeltsteder (f.eks. Vindern) mot Marka/Holmenkollen.
  const ANCHORS = [
    // Marka / nord / vest – rammer inn åsene så vestlige steder ikke trekkes for langt nord.
    { id: "holmenkollen",  name: "Holmenkollen",      lat: 59.9633, lon: 10.6664, x: 0.285, y: 0.108 },
    { id: "sognsvann",     name: "Sognsvann",         lat: 59.9717, lon: 10.7335, x: 0.420, y: 0.115 },
    { id: "vindern",       name: "Vindern",           lat: 59.9473, lon: 10.6845, x: 0.335, y: 0.330 },
    { id: "ullevaal",      name: "Ullevål stadion",   lat: 59.9487, lon: 10.7340, x: 0.416, y: 0.255 },
    { id: "nydalen",       name: "Nydalen",           lat: 59.9497, lon: 10.7650, x: 0.560, y: 0.270 },
    // Vest / midt-vest.
    { id: "frognerparken", name: "Frognerparken",     lat: 59.9276, lon: 10.7000, x: 0.305, y: 0.465 },
    { id: "majorstuen",    name: "Majorstuen",        lat: 59.9290, lon: 10.7140, x: 0.360, y: 0.445 },
    { id: "bislett",       name: "Bislett",           lat: 59.9257, lon: 10.7319, x: 0.430, y: 0.465 },
    { id: "sagene",        name: "Sagene",            lat: 59.9370, lon: 10.7585, x: 0.545, y: 0.400 },
    { id: "grunerlokka",   name: "Grünerløkka",       lat: 59.9239, lon: 10.7595, x: 0.555, y: 0.455 },
    // Sentrum (på landemerkenes posisjoner).
    { id: "slottet",       name: "Slottet",           lat: 59.9169, lon: 10.7276, x: 0.404, y: 0.558 },
    { id: "nationaltheatret", name: "Nationaltheatret", lat: 59.9147, lon: 10.7332, x: 0.458, y: 0.574 },
    { id: "stortinget",    name: "Stortinget",        lat: 59.9130, lon: 10.7400, x: 0.495, y: 0.575 },
    { id: "oslo_s",        name: "Oslo S",            lat: 59.9109, lon: 10.7534, x: 0.535, y: 0.585 },
    { id: "radhuset",      name: "Rådhuset",          lat: 59.9122, lon: 10.7336, x: 0.470, y: 0.610 },
    { id: "akershus",      name: "Akershus festning", lat: 59.9076, lon: 10.7369, x: 0.500, y: 0.640 },
    { id: "aker_brygge",   name: "Aker Brygge",       lat: 59.9105, lon: 10.7285, x: 0.386, y: 0.655 },
    { id: "tjuvholmen",    name: "Tjuvholmen",        lat: 59.9061, lon: 10.7211, x: 0.338, y: 0.694 },
    // Bjørvika / øst.
    { id: "bjorvika",      name: "Bjørvika",          lat: 59.9075, lon: 10.7579, x: 0.573, y: 0.622 },
    { id: "operaen",       name: "Operaen",           lat: 59.9075, lon: 10.7522, x: 0.584, y: 0.657 },
    { id: "munch",         name: "Munchmuseet",       lat: 59.9062, lon: 10.7553, x: 0.600, y: 0.636 },
    { id: "toyen",         name: "Tøyen",             lat: 59.9155, lon: 10.7759, x: 0.625, y: 0.520 },
    { id: "kampen",        name: "Kampen",            lat: 59.9124, lon: 10.7807, x: 0.662, y: 0.552 },
    { id: "jordal",        name: "Jordal",            lat: 59.9137, lon: 10.7857, x: 0.690, y: 0.562 },
    // Sør / øy / halvøy.
    { id: "ekeberg",       name: "Ekeberg",           lat: 59.8976, lon: 10.7780, x: 0.660, y: 0.705 },
    { id: "bygdoy",        name: "Bygdøy",            lat: 59.9020, lon: 10.6820, x: 0.200, y: 0.790 },
    { id: "hovedoya",      name: "Hovedøya",          lat: 59.8952, lon: 10.7305, x: 0.470, y: 0.780 },
    { id: "nordstrand",    name: "Nordstrand",        lat: 59.8620, lon: 10.7960, x: 0.720, y: 0.860 }
  ];

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // Rå baseline-projeksjon (uten kant-clamp) – brukes for offset-beregning.
  function rawBoundingBox(lat, lon) {
    const x = (lon - OSLO_BOUNDS.minLon) / (OSLO_BOUNDS.maxLon - OSLO_BOUNDS.minLon);
    const rawY = 1 - ((lat - OSLO_BOUNDS.minLat) / (OSLO_BOUNDS.maxLat - OSLO_BOUNDS.minLat));
    const y = 0.18 + rawY * 0.74;
    return { x, y };
  }

  // Klampet baseline (samme oppførsel som den gamle fallback-projeksjonen).
  function projectLatLonBoundingBox(lat, lon) {
    const b = rawBoundingBox(lat, lon);
    return { x: clamp(b.x, 0.04, 0.96), y: clamp(b.y, 0.08, 0.94) };
  }

  // Enkel ekvirektangulær avstand i grader (godt nok for vekting).
  function geoDistance(lat1, lon1, lat2, lon2) {
    const dLat = lat1 - lat2;
    const dLon = (lon1 - lon2) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  // Beregner kalibrert projeksjon + full debug-info.
  function projectDetailed(lat, lon) {
    const baseline = rawBoundingBox(lat, lon);

    if (!ANCHORS.length) {
      return {
        x: clamp(baseline.x, 0.03, 0.97),
        y: clamp(baseline.y, 0.04, 0.96),
        baseline: projectLatLonBoundingBox(lat, lon),
        nearest: [],
        source: "fallback"
      };
    }

    const contributions = ANCHORS.map((anchor) => {
      const ab = rawBoundingBox(anchor.lat, anchor.lon);
      const dist = geoDistance(lat, lon, anchor.lat, anchor.lon);
      const weight = 1 / Math.pow(dist + EPSILON, 2);
      return { anchor, dist, weight, dx: anchor.x - ab.x, dy: anchor.y - ab.y };
    });

    contributions.sort((a, b) => a.dist - b.dist);
    const used = contributions.slice(0, Math.min(NEAREST_ANCHORS, contributions.length));

    let sumW = 0, sumDx = 0, sumDy = 0;
    used.forEach((c) => { sumW += c.weight; sumDx += c.dx * c.weight; sumDy += c.dy * c.weight; });

    const wdx = sumW ? sumDx / sumW : 0;
    const wdy = sumW ? sumDy / sumW : 0;

    return {
      x: clamp(baseline.x + wdx, 0.03, 0.97),
      y: clamp(baseline.y + wdy, 0.04, 0.96),
      baseline: projectLatLonBoundingBox(lat, lon),
      nearest: used.map((c) => ({ id: c.anchor.id, name: c.anchor.name, dist: Number(c.dist.toFixed(5)) })),
      source: "calibrated"
    };
  }

  function projectLatLonWithAnchors(lat, lon) {
    if (typeof lat !== "number" || typeof lon !== "number" ||
        !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const d = projectDetailed(lat, lon);
    return { x: d.x, y: d.y, source: d.source };
  }

  global.CIVI_OSLO_GEO_ANCHORS = ANCHORS;
  global.CivicationOsloMapCalibration = {
    OSLO_BOUNDS,
    getAnchors: () => ANCHORS.slice(),
    geoDistance,
    rawBoundingBox,
    projectLatLonBoundingBox,
    projectLatLonWithAnchors,
    projectDetailed
  };
})(typeof window !== "undefined" ? window : this);
