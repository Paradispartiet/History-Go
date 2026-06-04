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

  const ANCHORS = [
    { id: "oslo_s",        name: "Oslo S",            lat: 59.9109, lon: 10.7534, x: 0.535, y: 0.585 },
    { id: "bjorvika",      name: "Bjørvika",          lat: 59.9075, lon: 10.7579, x: 0.565, y: 0.625 },
    { id: "akershus",      name: "Akershus festning", lat: 59.9076, lon: 10.7369, x: 0.500, y: 0.640 },
    { id: "radhuset",      name: "Rådhuset",          lat: 59.9122, lon: 10.7336, x: 0.470, y: 0.610 },
    { id: "stortinget",    name: "Stortinget",        lat: 59.9130, lon: 10.7400, x: 0.495, y: 0.575 },
    { id: "bislett",       name: "Bislett",           lat: 59.9257, lon: 10.7319, x: 0.430, y: 0.465 },
    { id: "majorstuen",    name: "Majorstuen",        lat: 59.9290, lon: 10.7140, x: 0.360, y: 0.445 },
    { id: "frognerparken", name: "Frognerparken",     lat: 59.9276, lon: 10.7000, x: 0.305, y: 0.465 },
    { id: "grunerlokka",   name: "Grünerløkka",       lat: 59.9239, lon: 10.7595, x: 0.555, y: 0.455 },
    { id: "toyen",         name: "Tøyen",             lat: 59.9155, lon: 10.7759, x: 0.625, y: 0.520 },
    { id: "ekeberg",       name: "Ekeberg",           lat: 59.8976, lon: 10.7780, x: 0.660, y: 0.705 },
    { id: "bygdoy",        name: "Bygdøy",            lat: 59.9020, lon: 10.6820, x: 0.250, y: 0.680 },
    { id: "hovedoya",      name: "Hovedøya",          lat: 59.8952, lon: 10.7305, x: 0.465, y: 0.760 },
    { id: "sognsvann",     name: "Sognsvann",         lat: 59.9717, lon: 10.7335, x: 0.420, y: 0.115 }
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
