import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-07-21';
const aggregatePath = 'data/places/politikk/oslo/places_politikk.json';
const splitDir = 'data/places/politikk/oslo/places_politikk';
const splitManifestPath = 'data/places/politikk/oslo/places_politikk_manifest.json';
const splitIndexPath = 'data/places/politikk/oslo/places_politikk_index.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-116-politikk';
const resultsPath = `${reportDir}/results.json`;

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a')
  .replace(/[^a-z0-9]+/g, ' ').trim();

const ringCentroid = (ring) => {
  let twiceArea = 0; let cx = 0; let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    twiceArea += cross; cx += (ring[j][0] + ring[i][0]) * cross; cy += (ring[j][1] + ring[i][1]) * cross;
  }
  return Math.abs(twiceArea) < 1e-12 ? ring[0] : [cx / (3 * twiceArea), cy / (3 * twiceArea)];
};
const representativePoint = (candidate) => {
  if (candidate.geojson?.type === 'Point') return { lat: candidate.geojson.coordinates[1], lon: candidate.geojson.coordinates[0] };
  if (candidate.geojson?.type === 'Polygon') { const [lon, lat] = ringCentroid(candidate.geojson.coordinates[0]); return { lat, lon }; }
  if (candidate.geojson?.type === 'MultiPolygon') { const [lon, lat] = ringCentroid(candidate.geojson.coordinates[0][0]); return { lat, lon }; }
  return { lat: Number(candidate.lat), lon: Number(candidate.lon) };
};
const candidateName = (candidate) => candidate.namedetails?.name ?? candidate.name ?? String(candidate.display_name ?? '').split(',')[0];
const sourceObjectId = (candidate) => `osm-${candidate.osm_type}:${candidate.osm_id}`;
const sourceUrl = (candidate) => `https://www.openstreetmap.org/${candidate.osm_type}/${candidate.osm_id}`;

const aggregate = readJson(aggregatePath);
const byId = new Map(aggregate.map((place) => [place.id, place]));
const results = readJson(resultsPath);
if (results.batch !== 116) throw new Error(`Forventet batch 116-resultat, fikk ${results.batch}.`);

const youngRaw = readJson(`${reportDir}/nominatim-youngstorget.json`);
const young = (youngRaw.combinedResults ?? []).find((candidate) =>
  candidate.osm_type === 'relation' && candidate.osm_id === 12773689 &&
  normalize(candidateName(candidate)) === normalize('Youngstorget') &&
  (candidate.class ?? candidate.category) === 'highway' && candidate.type === 'pedestrian' &&
  candidate.geojson?.type === 'Polygon'
);
if (!young) throw new Error('Fant ikke det validerte Youngstorget-polygonet relation 12773689.');

const folketsRaw = readJson(`${reportDir}/nominatim-folkets_hus_oslo.json`);
const folkets = (folketsRaw.combinedResults ?? []).find((candidate) =>
  candidate.osm_type === 'way' && candidate.osm_id === 112233121 &&
  normalize(candidateName(candidate)) === normalize('Folkets Hus') &&
  (candidate.class ?? candidate.category) === 'building' && candidate.type === 'office' &&
  candidate.geojson?.type === 'Polygon'
);
if (!folkets) throw new Error('Fant ikke det validerte Folkets Hus-polygonet way 112233121.');

const hParams = new URLSearchParams({
  format: 'jsonv2', q: 'Høyesterett, Oslo, Norway', limit: '20', polygon_geojson: '1', addressdetails: '1', namedetails: '1',
  viewbox: '10.736,59.920,10.752,59.909', bounded: '1'
});
const hUrl = `https://nominatim.openstreetmap.org/search?${hParams}`;
const hResponse = await fetch(hUrl, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!hResponse.ok) throw new Error(`Nominatim failed for Høyesterett: ${hResponse.status} ${hResponse.statusText}`);
const hResults = await hResponse.json();
const oldHRaw = readJson(`${reportDir}/nominatim-hoyesteretts_hus.json`);
oldHRaw.queryRuns.push({ query: 'Høyesterett', queryUrl: hUrl, results: hResults });
const hCombined = new Map((oldHRaw.combinedResults ?? []).map((candidate) => [`${candidate.osm_type}:${candidate.osm_id}`, candidate]));
for (const candidate of hResults) hCombined.set(`${candidate.osm_type}:${candidate.osm_id}`, candidate);
oldHRaw.combinedResults = [...hCombined.values()];
writeJson(`${reportDir}/nominatim-hoyesteretts_hus.json`, oldHRaw);

const hAliases = new Set(['hoyesteretts hus','hoyesterett','norges hoyesterett'].map(normalize));
const hCandidates = hResults.filter((candidate) => {
  const category = candidate.class ?? candidate.category;
  return hAliases.has(normalize(candidateName(candidate))) &&
    [['amenity','courthouse'],['building','government'],['office','government']].some(([c,t]) => category === c && candidate.type === t);
});
const hUnique = hCandidates.length === 1 ? hCandidates[0] : null;

const decisions = [
  { id: 'youngstorget', candidate: young, locatorType: 'square', coordRole: 'area_anchor', coordType: 'square_center', identity: 'Youngstorget som fysisk torg og offentlig byrom' },
  { id: 'folkets_hus_oslo', candidate: folkets, locatorType: 'building', coordRole: 'building_center', coordType: 'building_center', identity: 'Folkets Hus i Oslo som arbeiderbevegelsens institusjonsbygg' }
];
if (hUnique) decisions.push({ id: 'hoyesteretts_hus', candidate: hUnique, locatorType: 'building', coordRole: 'building_center', coordType: 'building_center', identity: 'Høyesteretts hus som bygning for Norges øverste domstol' });

for (const decision of decisions) {
  const { id, candidate, locatorType, coordRole, coordType, identity } = decision;
  const place = byId.get(id);
  if (!place) throw new Error(`Mangler ${id} i politikk-aggregatet.`);
  const point = representativePoint(candidate);
  const objectId = sourceObjectId(candidate);
  const category = candidate.class ?? candidate.category;
  Object.assign(place, {
    lat: point.lat, lon: point.lon, locatorType,
    sourceProvider: 'osm', sourceObjectId: objectId,
    geocodeAccuracy: ['Polygon','MultiPolygon'].includes(candidate.geojson?.type) ? 'geometric_center' : locatorType === 'building' ? 'building' : 'semantic_anchor',
    coordRole, coordType, coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap ${candidate.osm_type} ${candidate.osm_id} – ${candidateName(candidate)}`,
    coordSourceId: objectId, coordSourceUrl: sourceUrl(candidate), coordVerifiedAt: verifiedAt,
    coordNote: `Eksakt navngitt OSM-objekt valgt etter lokal bounded kontroll og fysisk objekttype ${category}/${candidate.type}; ikke nearest/first-hit. Representasjonspunktet er beregnet fra kildegeometrien.`
  });
  delete place.coordPrecisionM;

  writeJson(`data/coordinate-evidence/oslo/politikk/${id}.json`, {
    schemaVersion: '1.0', placeId: id, placeFile: aggregatePath,
    evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: identity, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['ett unikt eller semantisk entydig eksakt navngitt fysisk objekt i forhåndsdefinert lokal scope'],
    evidence: [{
      sourceProvider: 'osm', sourceName: `OpenStreetMap – ${candidateName(candidate)}`, sourceUrl: sourceUrl(candidate), sourceObjectId: objectId,
      sourceQuality: 'exact_named_semantic_object_in_local_scope',
      finding: `Eksakt navnetreff med objekttype ${category}/${candidate.type} og geometri ${candidate.geojson?.type ?? 'Point'}.`,
      canVerifyCoordinate: true, reason: place.coordNote
    }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: objectId, canApplyToPlace: true }],
    geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: objectId, lat: place.lat, lon: place.lon, coordRole, canApplyToPlace: true }],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole, sourceObjectId: objectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildeobjekt og representasjonspunkt er anvendt på canonical place.' },
    notes: [place.coordNote]
  });

  results.after[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, sourceObjectId: objectId };
  if (!results.verified.includes(id)) results.verified.push(id);
  results.needsReview = results.needsReview.filter((candidateId) => candidateId !== id);
}

writeJson(aggregatePath, aggregate);
const splitManifest = readJson(splitManifestPath);
for (const row of splitManifest.places) {
  if (!decisions.some((decision) => decision.id === row.id)) continue;
  const childPath = `${splitDir}/${row.id}.json`; const child = readJson(childPath); const place = byId.get(row.id);
  for (const field of ['lat','lon','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote']) child[field] = place[field];
  delete child.coordPrecisionM; writeJson(childPath, child);
}
splitManifest.source_sha256 = sha256Text(fs.readFileSync(path.join(root, aggregatePath), 'utf8'));
splitManifest.generated_at = new Date().toISOString();
const splitIndex = [];
for (const row of splitManifest.places) {
  const childPath = `data/places/politikk/oslo/${row.file}`; const childText = fs.readFileSync(path.join(root, childPath), 'utf8');
  row.sha256 = sha256Text(childText); const place = JSON.parse(childText);
  splitIndex.push({
    id: place.id, name: place.name ?? null, category: place.category ?? null, lat: place.lat ?? null, lon: place.lon ?? null, r: place.r ?? null, year: place.year ?? null,
    coordStatus: place.coordStatus ?? null, coordType: place.coordType ?? null, locatorType: place.locatorType ?? null, sourceProvider: place.sourceProvider ?? null,
    sourceObjectId: place.sourceObjectId ?? null, geocodeAccuracy: place.geocodeAccuracy ?? null, coordRole: place.coordRole ?? null, coordSource: place.coordSource ?? null,
    coordSourceId: place.coordSourceId ?? null, coordSourceUrl: place.coordSourceUrl ?? null, coordVerifiedAt: place.coordVerifiedAt ?? null, coordNote: place.coordNote ?? null, file: row.file
  });
}
writeJson(splitManifestPath, splitManifest); writeJson(splitIndexPath, splitIndex);

const manifestOrder = readJson(splitManifestPath).places.sort((a,b) => a.order - b.order).map((row) => row.id);
results.verified = manifestOrder.filter((id) => results.verified.includes(id));
results.needsReview = manifestOrder.filter((id) => results.needsReview.includes(id));
writeJson(resultsPath, results);
fs.writeFileSync(path.join(root, reportDir, 'README.md'), `# Oslo coordinate control batch 116 – politikk\n\n## Verified\n${results.verified.map((id) => `- \`${id}\` → \`${byId.get(id).sourceObjectId}\``).join('\n') || '- none'}\n\n## Completed without approved coordinate\n${results.needsReview.map((id) => `- \`${id}\` → needs_review / needs_source`).join('\n') || '- none'}\n\nYoungstorget uses the full named pedestrian-square relation rather than a same-name road segment. All bounded candidate sets are stored in this report directory. No nearest/first-hit selection is used.\n`);

let protocol = fs.readFileSync(path.join(root, protocolPath), 'utf8');
for (const { id } of decisions) {
  protocol = protocol.split('\n').filter((line) => !line.startsWith(`| \`${id}\` – `)).join('\n');
  const objectId = byId.get(id).sourceObjectId;
  const row = `| 116 | \`${id}\` | ${byId.get(id).name} | verified_geometry | \`${objectId}\` |`;
  if (!protocol.includes(row)) protocol = protocol.replace('\nRelevante korrigerende merger for de første Oslo-batchene:', `\n${row}\nRelevante korrigerende merger for de første Oslo-batchene:`);
}
fs.writeFileSync(path.join(root, protocolPath), protocol);

console.log(JSON.stringify({
  upgradedToVerified: decisions.map((decision) => decision.id),
  hoyesterettCandidateCount: hCandidates.length,
  remainingNeedsReview: results.needsReview
}, null, 2));
