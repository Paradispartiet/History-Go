import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const REPORT_DIR = 'reports/oslo-coordinate-retro-audit-from-batch-6';
fs.mkdirSync(path.join(ROOT, REPORT_DIR), { recursive: true });

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (rel) => crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');
const INDEX_COORD_FIELDS = [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource',
  'coordVerifiedAt', 'coordNote'
];

function findPlace(data, id, rel) {
  const rows = Array.isArray(data) ? data : data?.id ? [data] : data?.places || [];
  const hits = rows.filter((row) => row?.id === id);
  if (hits.length !== 1) throw new Error(`${rel}: expected one ${id}, found ${hits.length}`);
  return hits[0];
}

function currentCoordinate(place) {
  return {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  };
}

function dataset(config) {
  return {
    ...config,
    aggregateData: readJson(config.aggregate),
    indexData: readJson(config.index),
    manifestData: readJson(config.manifest),
    touched: []
  };
}

function updateRecord(ds, id, mutatePlace, mutateEvidence) {
  const childRel = `${ds.childDir}/${id}.json`;
  const evidenceRel = `${ds.evidenceDir}/${id}.json`;
  const childData = readJson(childRel);
  const aggregatePlace = findPlace(ds.aggregateData, id, ds.aggregate);
  const childPlace = findPlace(childData, id, childRel);
  const indexPlace = findPlace(ds.indexData, id, ds.index);
  const before = {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordType: childPlace.coordType,
    coordStatus: childPlace.coordStatus,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId
  };

  mutatePlace(aggregatePlace);
  mutatePlace(childPlace);

  for (const field of INDEX_COORD_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(indexPlace, field)) {
      if (Object.prototype.hasOwnProperty.call(childPlace, field)) indexPlace[field] = childPlace[field];
      else delete indexPlace[field];
    }
  }

  const evidence = readJson(evidenceRel);
  mutateEvidence(evidence, childPlace);
  writeJson(childRel, childData);
  writeJson(evidenceRel, evidence);
  ds.touched.push({ id, childRel });
  return before;
}

function saveDataset(ds) {
  writeJson(ds.aggregate, ds.aggregateData);
  writeJson(ds.index, ds.indexData);
  ds.manifestData.source_sha256 = sha256(ds.aggregate);
  ds.manifestData.generated_at = new Date().toISOString();
  for (const { id, childRel } of ds.touched) {
    const row = (ds.manifestData.places || []).find((item) => item.id === id);
    if (!row) throw new Error(`${ds.manifest}: missing row for ${id}`);
    row.sha256 = sha256(childRel);
  }
  writeJson(ds.manifest, ds.manifestData);
}

const naeringsliv = dataset({
  aggregate: 'data/places/naeringsliv/oslo/places_naeringsliv.json',
  index: 'data/places/naeringsliv/oslo/places_naeringsliv_index.json',
  manifest: 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json',
  childDir: 'data/places/naeringsliv/oslo/places_naeringsliv',
  evidenceDir: 'data/coordinate-evidence/oslo/naeringsliv'
});
const litteratur = dataset({
  aggregate: 'data/places/litteratur/oslo/places_litteratur.json',
  index: 'data/places/litteratur/oslo/places_litteratur_index.json',
  manifest: 'data/places/litteratur/oslo/places_litteratur_manifest.json',
  childDir: 'data/places/litteratur/oslo/places_litteratur',
  evidenceDir: 'data/coordinate-evidence/oslo/litteratur'
});

const corrections = [];

{
  const id = 'telegrafbygningen';
  const sourceObjectId = 'osm-relation:13931026';
  const note = 'Geonorge-oppslaget for Kongens gate 21 ble kjørt først og ga flere ikke-entydige treff. Deretter ble det eksakte OSM-bygningsobjektet relation 13931026 identifisert for Telegrafbygningen og kryssjekket mot Riksantikvaren og Telenor Kulturarv. Koordinatet beholdes fordi det allerede representerer selve Telegrafbygningen; primær kildeidentitet flyttes fra Wikidata til det dokumenterte fysiske OSM-objektet.';
  const before = updateRecord(naeringsliv, id, (place) => Object.assign(place, {
    locatorType: 'building', sourceProvider: 'osm', sourceObjectId,
    geocodeAccuracy: 'geometric_center', coordRole: 'building_center',
    coordType: 'building_center', coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 13931026; identity cross-checked with Riksantikvaren and Telenor Kulturarv',
    coordSourceId: sourceObjectId,
    coordSourceUrl: 'https://www.openstreetmap.org/relation/13931026',
    coordVerifiedAt: VERIFIED_AT, coordNote: note
  }), (evidence, place) => {
    evidence.currentCoordinate = currentCoordinate(place);
    evidence.evidenceStatus = 'applied_to_place';
    evidence.coordinateDecision = 'do_not_change_coordinates_yet';
    evidence.evidence = [
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap relation 13931026', sourceUrl: 'https://www.openstreetmap.org/relation/13931026', sourceObjectId, sourceQuality: 'exact_building_geometry_after_ambiguous_official_address', finding: 'Det dokumenterte OSM-objektet representerer Telegrafbygningen etter at Geonorge-adressen var tvetydig.', canVerifyCoordinate: true, reason: note },
      { sourceProvider: 'manual_research', sourceName: 'Riksantikvaren – Telegrafbygningen', sourceUrl: 'https://riksantikvaren.no/eksempelsamling/mindre-telekommunikasjon-bedre-internkommunikasjon/', sourceObjectId: 'riksantikvaren:telegrafbygningen-kongens-gate-21', sourceQuality: 'official_building_identity', finding: 'Riksantikvaren dokumenterer Telegrafbygningen i Kongens gate 21.', canVerifyCoordinate: false, reason: 'Offisiell identitetskryssjekk; OSM-relationen er geometrikilden.' }
    ];
    evidence.sourceObjectCandidates = [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }];
    evidence.geometryCandidates = [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }];
    evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'building_center', canApplyToPlace: true }];
    evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Eksakt OSM-bygningsobjekt er primær geometrikilde etter dokumentert tvetydig Geonorge-oppslag.' };
    evidence.notes = [note];
  });
  corrections.push({ batch: 22, id, before, after: { sourceProvider: 'osm', sourceObjectId } });
}

{
  const id = 'ovre_foss';
  const sourceObjectId = 'kulturminnesok:164747';
  const note = 'Geonorge-oppslaget for Sagveien 23 Oslo ble kjørt først og ga flere treff uten entydig match; dette er lagret i batch-24-rapporten. Hjula Væverier er identifisert som kulturminne 164747 og dokumentert i Sagveien 23 av Oslo byleksikon. Det eksisterende punktet beholdes som et representativt site_center-anker inne i Hjula-anlegget, ikke som et påstått offisielt adressepunkt eller eksakt bygningssentrum.';
  const before = updateRecord(naeringsliv, id, (place) => Object.assign(place, {
    locatorType: 'historic_site', sourceProvider: 'manual_research', sourceObjectId,
    geocodeAccuracy: 'semantic_anchor', coordRole: 'site_center',
    coordType: 'historical_site', coordStatus: 'verified_geometry',
    coordSource: 'Riksantikvaren/Kulturminnesøk 164747; identity cross-checked with Oslo byleksikon',
    coordSourceId: sourceObjectId, coordSourceUrl: 'https://www.kulturminnesok.no/',
    coordVerifiedAt: VERIFIED_AT, coordNote: note
  }), (evidence, place) => {
    evidence.currentCoordinate = currentCoordinate(place);
    evidence.evidenceStatus = 'applied_to_place';
    evidence.coordinateDecision = 'do_not_change_coordinates_yet';
    evidence.addressCandidates = [{ address: 'Sagveien 23 Oslo', sourceProvider: 'official_address', sourceObjectId: null, canApplyToPlace: false, reason: 'Geonorge returnerte flere treff uten entydig match; oppslaget er lagret i reports/oslo-coordinate-control-batch-24/lookups/ovre_foss-sagveien-23-geonorge.json.' }];
    evidence.evidence = [
      { sourceProvider: 'manual_research', sourceName: 'Riksantikvaren/Kulturminnesøk – kulturminne 164747', sourceUrl: 'https://www.kulturminnesok.no/', sourceObjectId, sourceQuality: 'official_cultural_heritage_identity', finding: 'Kulturminne-ID 164747 identifiserer Hjula Væverier som det fysiske kulturminneanlegget.', canVerifyCoordinate: true, reason: note },
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Hjula Væverier', sourceUrl: 'https://oslobyleksikon.no/side/Hjula_V%C3%A6verier', sourceObjectId: 'oslobyleksikon:hjula-vaeverier', sourceQuality: 'documented_physical_identity', finding: 'Oslo byleksikon dokumenterer Hjula Væverier i Sagveien 23 ved Hjulafossen.', canVerifyCoordinate: false, reason: 'Identitets- og områdekryssjekk.' }
    ];
    evidence.sourceObjectCandidates = [{ sourceProvider: 'manual_research', sourceObjectId, canApplyToPlace: true }];
    evidence.geometryCandidates = [];
    evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'site_center', canApplyToPlace: true }];
    evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Offisiell kulturminneidentitet og eksplisitt semantic site anchor er anvendt; tvetydig adresse er dokumentert og ikke gjettet.' };
    evidence.notes = [note];
  });
  corrections.push({ batch: 24, id, before, after: { sourceProvider: 'manual_research', sourceObjectId } });
}

{
  const id = 'henrik_wergeland_statue';
  const sourceObjectId = 'oslo-museum:OB.A17403';
  const note = 'Henrik Wergeland-statuen er et monument og skal ikke reduseres til et tilfeldig adressepunkt. Det eksisterende objektpunktet beholdes. Primær kildeidentitet er Oslo Museums stabile aksesjonsnummer OB.A17403; Wikimedia Commons er bare vert for museumsmaterialet. Oslo byleksikon kryssjekker monumentets plassering på Eidsvolls plass mellom Roald Amundsens gate og Spikersuppa.';
  const before = updateRecord(litteratur, id, (place) => Object.assign(place, {
    locatorType: 'poi', sourceProvider: 'manual_research', sourceObjectId,
    geocodeAccuracy: 'geometric_center', coordRole: 'display_marker',
    coordType: 'monument', coordStatus: 'verified_geometry',
    coordSource: 'Oslo Museum OB.A17403 object location; cross-checked with Oslo byleksikon',
    coordSourceId: sourceObjectId,
    coordSourceUrl: 'https://commons.wikimedia.org/wiki/File:Wergeland-statuen_-_1998_-_Jan-Christian_Raastad_-_Oslo_Museum_-_OB.A17403.jpg',
    coordVerifiedAt: VERIFIED_AT, coordNote: note
  }), (evidence, place) => {
    evidence.currentCoordinate = currentCoordinate(place);
    evidence.evidenceStatus = 'applied_to_place';
    evidence.coordinateDecision = 'do_not_change_coordinates_yet';
    evidence.evidence = [
      { sourceProvider: 'manual_research', sourceName: 'Oslo Museum OB.A17403 – Henrik Wergeland-statuen', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wergeland-statuen_-_1998_-_Jan-Christian_Raastad_-_Oslo_Museum_-_OB.A17403.jpg', sourceObjectId, sourceQuality: 'museum_object_location', finding: 'Oslo Museum-objektet har stabil aksesjonsidentitet og dokumentert objektplassering for Wergelandmonumentet.', canVerifyCoordinate: true, reason: note },
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Henrik Wergeland-statuen', sourceUrl: 'https://oslobyleksikon.no/index.php/Henrik_Wergeland-statuen', sourceObjectId: 'oslobyleksikon:henrik-wergeland-statuen', sourceQuality: 'documented_monument_identity', finding: 'Oslo byleksikon dokumenterer statuen på Eidsvolls plass mellom Roald Amundsens gate og Spikersuppa.', canVerifyCoordinate: false, reason: 'Plasserings- og identitetskryssjekk.' }
    ];
    evidence.addressCandidates = [];
    evidence.sourceObjectCandidates = [{ sourceProvider: 'manual_research', sourceObjectId, canApplyToPlace: true }];
    evidence.geometryCandidates = [];
    evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: 'display_marker', canApplyToPlace: true }];
    evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Museumets stabile objektidentitet er satt som primær kildeidentitet.' };
    evidence.notes = [note];
  });
  corrections.push({ batch: 21, id, before, after: { sourceProvider: 'manual_research', sourceObjectId } });
}

saveDataset(naeringsliv);
saveDataset(litteratur);

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8');
const replacements = new Map(corrections.map((row) => [row.id, row.after.sourceObjectId]));
protocol = protocol.split('\n').map((line) => {
  for (const [id, sourceObjectId] of replacements) {
    if (!line.trimStart().startsWith('|') || !line.includes(`\`${id}\``)) continue;
    const cells = line.split('|');
    if (cells.length >= 7) {
      cells[cells.length - 2] = ` \`${sourceObjectId}\` `;
      return cells.join('|');
    }
  }
  return line;
}).join('\n');
const protocolNote = 'Retrokontroll fra batch 6 (2026-07-20), pass 3: `telegrafbygningen` bruker nå det dokumenterte OSM-bygningsobjektet som primær geometrikilde etter tvetydig Geonorge-oppslag; `ovre_foss` dokumenterer at Geonorge faktisk ble forsøkt først og bruker Kulturminnesøk 164747 med eksplisitt semantic site anchor; `henrik_wergeland_statue` bruker Oslo Museums stabile aksesjonsnummer OB.A17403 som primær kildeidentitet i stedet for Commons-siden.';
if (!protocol.includes(protocolNote)) protocol = protocol.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${protocolNote}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
fs.writeFileSync(abs(protocolRel), protocol);

writeJson(`${REPORT_DIR}/pass-3-batches-21-24.json`, {
  date: VERIFIED_AT,
  corrections,
  findings: [
    'Øvre Foss/Hjula was not an address-first omission: the saved batch-24 Geonorge lookup for Sagveien 23 exists and is ambiguous.',
    'Telegrafbygningen also had a documented ambiguous Geonorge lookup before fallback.',
    'Henrik Wergeland-statuen is a monument-object case, not an address case.'
  ]
});

const readmeRel = `${REPORT_DIR}/README.md`;
let readme = fs.existsSync(abs(readmeRel)) ? fs.readFileSync(abs(readmeRel), 'utf8') : '# Oslo coordinate retro-audit from batch 6\n';
const section = '\n## Pass 3 — batches 21–24 source-object corrections\n\n- `henrik_wergeland_statue`: stable primary identity moved from the Commons host page to Oslo Museum accession `OB.A17403`; coordinate unchanged.\n- `telegrafbygningen`: primary geometry source moved from Wikidata to documented exact OSM relation `13931026`; coordinate unchanged.\n- `ovre_foss`: confirmed that Geonorge address-first was already performed and ambiguous; primary identity moved from Wikidata to Kulturminnesøk `164747`, with the existing point explicitly modeled as a semantic site anchor rather than an address/building-center claim.\n';
if (!readme.includes('## Pass 3 — batches 21–24 source-object corrections')) readme += section;
fs.writeFileSync(abs(readmeRel), readme);

console.log(JSON.stringify({ ok: true, corrected: corrections.map((row) => row.id) }, null, 2));
