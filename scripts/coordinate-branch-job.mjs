import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const reportDir = "reports/visitoslo-galleries-audit-20260723/institutional-scope-intake-v2";
mkdirSync(reportDir, { recursive: true });

const candidates = [
  { placeId: "fotogalleriet", name: "Fotogalleriet", street: "Møllergata", number: "34", postcode: "0179", municipalityNumber: "0301", founded: 1977, institutionClass: "noncommercial_camera_based_art_institution" },
  { placeId: "kunstnerforbundet", name: "Kunstnerforbundet", street: "Kjeld Stubs gate", number: "3", postcode: "0160", municipalityNumber: "0301", founded: 1910, institutionClass: "artist_run_noncommercial_exhibition_institution" },
  { placeId: "soft_galleri", name: "SOFT galleri", street: "Rådhusgata", number: "20", postcode: "0151", municipalityNumber: "0301", founded: 2006, institutionClass: "artist_organization_run_textile_art_gallery" },
  { placeId: "oslo_kunstforening", name: "Oslo Kunstforening", street: "Rådhusgata", number: "19", postcode: "0158", municipalityNumber: "0301", founded: 1836, institutionClass: "noncommercial_membership_art_institution" }
];

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}
function sourceObjectId(hit) {
  return `geonorge-adresser-v1:${String(hit.kommunenummer ?? "").trim()}:${String(hit.adressekode ?? "").trim()}:${String(hit.nummer ?? "").trim()}${String(hit.bokstav ?? "").trim()}`;
}
function pointKey(hit) {
  const lat = Number(hit.representasjonspunkt?.lat);
  const lon = Number(hit.representasjonspunkt?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? `${lat.toFixed(8)},${lon.toFixed(8)}` : "missing";
}
function haversineMeters(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function nearestPlaces(places, point, limit = 15) {
  return places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile, distanceM: Math.round(haversineMeters(point, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM).slice(0, limit);
}
async function fetchGeonorge(candidate) {
  const query = `${candidate.street} ${candidate.number} ${candidate.postcode} Oslo`;
  const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${candidate.placeId}: Geonorge HTTP ${response.status}`);
  const json = await response.json();
  const hits = Array.isArray(json?.adresser) ? json.adresser : [];
  const exactComponents = hits.filter((hit) =>
    norm(hit.adressenavn) === norm(candidate.street) &&
    String(hit.nummer ?? "").trim() === candidate.number &&
    String(hit.postnummer ?? "").trim() === candidate.postcode &&
    String(hit.kommunenummer ?? "").trim() === candidate.municipalityNumber
  );
  const uniquePoints = new Map();
  for (const hit of exactComponents) {
    const key = pointKey(hit);
    if (key !== "missing" && !uniquePoints.has(key)) uniquePoints.set(key, []);
    if (key !== "missing") uniquePoints.get(key).push(hit);
  }
  if (uniquePoints.size !== 1) {
    throw new Error(`${candidate.placeId}: strict Geonorge component gate resolved ${exactComponents.length} exact-component hits across ${uniquePoints.size} unique coordinate points. Raw: ${JSON.stringify(exactComponents)}`);
  }
  const [coordinateKey, equivalentHits] = [...uniquePoints.entries()][0];
  const hit = equivalentHits[0];
  const [lat, lon] = coordinateKey.split(",").map(Number);
  return { query, url, rawHitCount: hits.length, exactComponentHitCount: exactComponents.length, equivalentExactHits: equivalentHits, selectedHit: hit, lat, lon, sourceObjectId: sourceObjectId(hit) };
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const results = [];

for (const candidate of candidates) {
  const geonorge = await fetchGeonorge(candidate);
  const point = { lat: geonorge.lat, lon: geonorge.lon };
  const identityMatches = places.filter((place) => norm(place.id) === norm(candidate.placeId) || norm(place.name) === norm(candidate.name)).map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
  const nearest = nearestPlaces(places, point);
  const result = {
    version: DATE,
    ...candidate,
    status: identityMatches.length ? "identity_review_required" : "verified_address_scope_candidate",
    coordinate: {
      lat: point.lat,
      lon: point.lon,
      r: 60,
      locatorType: "building",
      sourceProvider: "official_address",
      sourceObjectId: geonorge.sourceObjectId,
      geocodeAccuracy: "rooftop",
      coordRole: "display_marker",
      coordStatus: "verified",
      coordSource: "geonorge_adresser_v1",
      coordSourceUrl: geonorge.url,
      coordType: "address_point",
      address: { street: candidate.street, number: candidate.number, postcode: candidate.postcode, city: "Oslo", country: "NO" },
      coordNote: `Offisiell adressekoordinat fra Geonorge for ${candidate.street} ${candidate.number}, ${candidate.postcode} Oslo. Ved flere råtreff ble kandidaten godkjent bare fordi streng gate på gatenavn, husnummer, postnummer og kommunenummer 0301 kollapset alle eksakte treff til ett unikt fysisk representasjonspunkt.`
    },
    geonorgeResolution: {
      query: geonorge.query,
      sourceUrl: geonorge.url,
      rawHitCount: geonorge.rawHitCount,
      exactComponentHitCount: geonorge.exactComponentHitCount,
      uniqueCoordinatePointsAfterStrictFilter: 1,
      equivalentExactHits: geonorge.equivalentExactHits
    },
    physicalScopeGate: {
      canonicalIdentityMatches: identityMatches,
      canonicalPlacesWithin35m: nearest.filter((p) => p.distanceM <= 35),
      nearestCanonicalPlaces: nearest,
      requiresManualParentOverlapDecision: nearest.some((p) => p.distanceM <= 35)
    }
  };
  mkdirSync(`${reportDir}/${candidate.placeId}`, { recursive: true });
  writeFileSync(`${reportDir}/${candidate.placeId}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  results.push(result);
  console.log(`${candidate.placeId}: ${result.status}; ${point.lat}, ${point.lon}; exactHits=${geonorge.exactComponentHitCount}; <=35m=${result.physicalScopeGate.canonicalPlacesWithin35m.map((p) => `${p.id}:${p.distanceM}`).join(",") || "none"}`);
}

const summary = {
  version: DATE,
  total: results.length,
  verifiedAddressScopeCandidates: results.filter((r) => r.status === "verified_address_scope_candidate").length,
  identityReviewRequired: results.filter((r) => r.status === "identity_review_required").length,
  candidatesRequiringParentOverlapDecision: results.filter((r) => r.physicalScopeGate.requiresManualParentOverlapDecision).length,
  results: results.map((r) => ({ placeId: r.placeId, name: r.name, founded: r.founded, status: r.status, coordinate: r.coordinate, exactComponentHitCount: r.geonorgeResolution.exactComponentHitCount, canonicalPlacesWithin35m: r.physicalScopeGate.canonicalPlacesWithin35m, nearestCanonicalPlaces: r.physicalScopeGate.nearestCanonicalPlaces.slice(0, 10) }))
};
writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
const rows = summary.results.map((r) => `| ${r.placeId} | ${r.name} | ${r.coordinate.lat}, ${r.coordinate.lon} | ${r.exactComponentHitCount} | ${r.canonicalPlacesWithin35m.map((p) => `${p.id} (${p.distanceM} m)`).join("; ") || "—"} |`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# VisitOSLO gallery priority tranche — institutional physical-scope intake v2\n\nDate: ${DATE}\n\nAll addresses are resolved through Geonorge. If a free-text query returned multiple rows, the runner required exact street, house number, postcode and Oslo municipality and then required exactly one unique physical representation point.\n\n| placeId | Institution | Coordinate | Exact component hits | Canonical places within 35 m |\n|---|---|---|---:|---|\n${rows}\n\nA nearby or co-located canonical place is not automatically a duplicate; manual institutional/parent scope review follows.\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
