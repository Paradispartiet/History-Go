import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outRel = 'reports/oslo-coordinate-naturhistorisk-museum-research-post-195';
const out = path.join(root, outRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/naturhistorisk_museum.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const subunit = '926495720';
const parent = '971035854';
const assert = (v, m) => { if (!v) throw new Error(m); };
const read = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await read(rel));
const getJson = async (url) => {
  const r = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'History-Go/1.0' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
};
const norm = (v) => String(v ?? '').replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
const dist = (a, b) => {
  const rad = (v) => v * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const pointIn = (p, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if (((a.lat > p.lat) !== (b.lat > p.lat)) && p.lon < ((b.lon - a.lon) * (p.lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
  }
  return inside;
};
const metrics = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon ? points : [...points, points[0]];
  const meanLat = ring.reduce((s, p) => s + p.lat, 0) / ring.length;
  const ys = 111320, xs = ys * Math.cos(meanLat * Math.PI / 180);
  let a2 = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const x1 = ring[i].lon * xs, y1 = ring[i].lat * ys, x2 = ring[i + 1].lon * xs, y2 = ring[i + 1].lat * ys;
    const cross = x1 * y2 - x2 * y1;
    a2 += cross; cx += (x1 + x2) * cross; cy += (y1 + y2) * cross;
  }
  assert(Math.abs(a2) > 0.01, 'Zero-area polygon.');
  return { ring, area: Math.abs(a2 / 2), centroid: { lat: (cy / (3 * a2)) / ys, lon: (cx / (3 * a2)) / xs } };
};

await fs.mkdir(out, { recursive: true });
const protocol = await read(protocolRel);
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])));
assert(maxBatch === 195 && !/^\|\s*196\s*\|/m.test(protocol), 'Coordinate protocol must stop at 195.');
const place = await readJson(placeRel);
assert(place.id === 'naturhistorisk_museum' && place.year === 1814, 'Unexpected canonical place.');
const current = { lat: Number(place.lat), lon: Number(place.lon) };

const brregUrl = `https://data.brreg.no/enhetsregisteret/api/underenheter/${subunit}`;
const addressUrl = "https://ws.geonorge.no/adresser/v1/sok?adressenavn=Sars%27%20gate&nummer=1&kommunenummer=0301&treffPerSide=20";
const q = `[out:json][timeout:30];(nwr(around:1200,${current.lat},${current.lon})["name"~"Naturhistorisk museum|Natural History Museum",i];nwr(around:1200,${current.lat},${current.lon})["ref:NO:orgnr"="${subunit}"];);out center tags;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
const [brreg, geonorge, overpass] = await Promise.all([getJson(brregUrl), getJson(addressUrl), getJson(overpassUrl)]);
await fs.writeFile(path.join(out, 'brreg-subunit-926495720.json'), JSON.stringify(brreg, null, 2) + '\n');
await fs.writeFile(path.join(out, 'geonorge-sars-gate-1.json'), JSON.stringify(geonorge, null, 2) + '\n');
await fs.writeFile(path.join(out, 'overpass-naturhistorisk-museum.json'), JSON.stringify(overpass, null, 2) + '\n');
assert(String(brreg.organisasjonsnummer) === subunit && String(brreg.overordnetEnhet) === parent, 'Unexpected Brønnøysund identity.');
assert(norm(brreg.navn) === 'naturhistorisk museum', 'Unexpected Brønnøysund name.');
const brAddr = norm([...(brreg.beliggenhetsadresse?.adresse ?? []), brreg.beliggenhetsadresse?.postnummer, brreg.beliggenhetsadresse?.poststed].join(' '));
assert(brAddr.includes('sars gate 1') && brAddr.includes('0562 oslo'), 'Brønnøysund address mismatch.');

const rows = (geonorge.adresser ?? []).filter((r) => norm(r.adressetekst) === 'sars gate 1');
const coords = [];
for (const row of rows) {
  const p = row.representasjonspunkt ?? {};
  const lat = Number(p.lat), lon = Number(p.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  if (!coords.some((x) => Math.abs(x.lat - lat) < 1e-9 && Math.abs(x.lon - lon) < 1e-9)) coords.push({
    lat, lon, rowCount: 1, addressText: row.adressetekst,
    sourceObjectId: `geonorge-adresser-v1:0301:${row.adressekode ?? 'sars-gate'}:${row.nummer ?? 1}${row.bokstav ?? ''}:${lat.toFixed(8)},${lon.toFixed(8)}`,
  });
}
assert(coords.length >= 1, "No exact Kartverket point for Sars' gate 1.");
const official = coords.length === 1 ? coords[0] : null;

const rejected = [];
const candidates = [];
for (const e of overpass.elements ?? []) {
  const t = e.tags ?? {};
  const coordinate = Number.isFinite(Number(e.lat)) ? { lat: Number(e.lat), lon: Number(e.lon) } :
    Number.isFinite(Number(e.center?.lat)) ? { lat: Number(e.center.lat), lon: Number(e.center.lon) } : null;
  if (!coordinate) continue;
  const garden = norm([t.name, t['name:en']].join(' ')).includes('botanisk hage') || norm([t.name, t['name:en']].join(' ')).includes('botanical garden');
  const transport = Boolean(t.public_transport || t.railway || t.tram === 'yes' || t.subway === 'yes' || t.bus === 'yes');
  if (garden || transport) {
    rejected.push({ sourceObjectId: `osm-${e.type}:${e.id}`, name: t.name ?? null, reason: garden ? 'botanical_garden_is_separate_canonical_place' : 'transport_object' });
    continue;
  }
  let score = 0;
  const name = norm(t.name), en = norm(t['name:en']);
  if (t['ref:NO:orgnr'] === subunit) score += 1200;
  if (name === 'naturhistorisk museum') score += 700;
  if (name.includes('naturhistorisk museum')) score += 350;
  if (en.includes('natural history museum')) score += 250;
  if (t.amenity === 'museum') score += 250;
  if (t.website && String(t.website).includes('nhm.uio.no')) score += 150;
  if (t.wikidata) score += 50;
  if (official) score += Math.max(0, 200 - dist(coordinate, official));
  candidates.push({ ...e, coordinate, score });
}
candidates.sort((a, b) => b.score - a.score);
const selected = candidates[0];
assert(selected?.score >= 500, 'No strong named museum object found.');
const selectedId = `osm-${selected.type}:${selected.id}`;
const selectedDistance = official ? Number(dist(selected.coordinate, official).toFixed(1)) : null;
let geometry = null;
if (selected.type === 'way') {
  const full = await getJson(`https://api.openstreetmap.org/api/0.6/way/${selected.id}/full.json`);
  await fs.writeFile(path.join(out, `osm-way-${selected.id}-full.json`), JSON.stringify(full, null, 2) + '\n');
  const way = (full.elements ?? []).find((e) => e.type === 'way' && e.id === selected.id);
  const map = new Map((full.elements ?? []).filter((e) => e.type === 'node').map((e) => [e.id, { lat: Number(e.lat), lon: Number(e.lon) }]));
  const polygon = (way?.nodes ?? []).map((id) => map.get(id)).filter(Boolean);
  if (polygon.length >= 4) {
    const m = metrics(polygon);
    geometry = {
      sourceObjectId: selectedId, sourceUrl: `https://www.openstreetmap.org/way/${selected.id}`,
      polygonNodeCount: polygon.length, areaSquareMeters: Number(m.area.toFixed(1)),
      centroid: { lat: Number(m.centroid.lat.toFixed(8)), lon: Number(m.centroid.lon.toFixed(8)) },
      officialAddressPointInside: official ? pointIn(official, m.ring) : false,
      centroidInsidePolygon: pointIn(m.centroid, m.ring),
      addressToCentroidMeters: official ? Number(dist(official, m.centroid).toFixed(1)) : null,
      maximumVertexDistanceMeters: Number(Math.max(...m.ring.map((p) => dist(m.centroid, p))).toFixed(1)),
    };
  }
}
const canPromote = coords.length === 1 && selectedDistance <= 170 && (!geometry || geometry.officialAddressPointInside === true);
const candidate = canPromote ? { lat: official.lat, lon: official.lon, sourceProvider: 'official_address', sourceObjectId: official.sourceObjectId, sourceUrl: addressUrl, objectType: 'museum_address_point' } : null;
const displacement = candidate ? Number(dist(current, candidate).toFixed(1)) : null;
const summary = {
  version: '2026-07-24', protocolMaxBatch: maxBatch, researchOnly: true, canonicalChanged: false,
  placeId: place.id, placeName: place.name,
  identityDecision: 'resolved_natural_history_museum_uio_sars_gate_1',
  scopeDecision: 'museum_institution_separate_from_botanical_garden_canonical_place',
  coordinateDecision: canPromote ? 'promote_unique_official_address_point_supported_by_named_museum_object' : 'continue_exact_museum_geometry_research',
  currentCoordinate: current, candidate, displacementMeters: displacement,
  officialAddress: { address: "Sars' gate 1, 0562 Oslo", coordinateCount: coords.length, coordinates: coords, selectionDecision: coords.length === 1 ? 'unique_official_point' : 'multiple_official_points_preserved' },
  supportingOsmObject: { sourceObjectId: selectedId, sourceUrl: `https://www.openstreetmap.org/${selected.type}/${selected.id}`, coordinate: selected.coordinate, nearestAddressMeters: selectedDistance, score: selected.score, tags: selected.tags ?? {} },
  geometry, rejectedObjects: rejected,
  sourceChecks: { brregSubunitIdentityAndAddress: true, uioParentIdentity: true, geonorgeExactAddressCoordinatesPreserved: true, namedNonGardenMuseumObjectFound: true, botanicalGardenExcludedAsSeparateCanonicalPlace: true, transportObjectsExcluded: true, fullPolygonValidatedWhenAvailable: geometry !== null, officialAddressPointInsideGeometryWhenAvailable: geometry ? geometry.officialAddressPointInside === true : null },
  recommendation: { canBecomeVerified: canPromote, nextAction: canPromote ? `Apply ${candidate.sourceObjectId} as canonical display marker; preserve NHM/UiO and Brønnøysund identity, retain ${selectedId} as museum support, keep Botanisk hage separate, synchronize evidence/index and keep protocol max at 195.` : 'Continue bounded exact-museum research without using Botanisk hage as the museum marker.', coordStatus: canPromote ? 'verified' : 'needs_source', coordType: canPromote ? 'address_point' : null, locatorType: 'building', suggestedRadiusMeters: 170 },
};
await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
await fs.writeFile(path.join(out, 'README.md'), `# Natural History Museum coordinate research\n\n- Canonical changed: **no**\n- Address points: **${coords.length}**\n- Selected OSM object: **${selectedId}**\n- Candidate: **${candidate ? `${candidate.lat}, ${candidate.lon}` : 'none'}**\n- Displacement: **${displacement ?? 'n/a'} m**\n- Botanical garden excluded: **yes**\n- Can become verified: **${canPromote ? 'yes' : 'no'}**\n- Protocol max batch: **${maxBatch}**\n`, 'utf8');
console.log(JSON.stringify({ status: 'natural_history_museum_research_complete', reportDir: outRel, selectedOsmObject: selectedId, geometryValidated: Boolean(geometry), canBecomeVerified: canPromote, displacementMeters: displacement, protocolMaxBatch: maxBatch }, null, 2));
