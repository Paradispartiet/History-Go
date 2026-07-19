import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const REPORT_ROOT = 'reports/oslo-coordinate-retro-audit-from-batch-6';

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (rel) => crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');

function findPlace(data, id, rel) {
  if (Array.isArray(data)) {
    const hits = data.filter((row) => row && row.id === id);
    if (hits.length !== 1) throw new Error(`${rel}: expected one ${id}, found ${hits.length}`);
    return hits[0];
  }
  if (data?.id === id) return data;
  throw new Error(`${rel}: missing ${id}`);
}

const INDEX_COORD_FIELDS = [
  'lat', 'lon', 'r', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider',
  'sourceObjectId', 'address', 'geocodeAccuracy', 'coordRole', 'coordSource',
  'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote'
];

function syncIndexCoordinateFields(indexPlace, sourcePlace) {
  for (const key of INDEX_COORD_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(sourcePlace, key)) {
      indexPlace[key] = structuredClone(sourcePlace[key]);
    } else {
      delete indexPlace[key];
    }
  }
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

function makeDataset({ aggregate, index, manifest, childDir, evidenceDir }) {
  return {
    aggregateRel: aggregate,
    indexRel: index,
    manifestRel: manifest,
    childDir,
    evidenceDir,
    aggregate: readJson(aggregate),
    index: readJson(index),
    manifest: readJson(manifest),
    touched: []
  };
}

function downgradePlace(dataset, config) {
  const childRel = `${dataset.childDir}/${config.id}.json`;
  const evidenceRel = `${dataset.evidenceDir}/${config.id}.json`;
  const child = readJson(childRel);
  const aggregatePlace = findPlace(dataset.aggregate, config.id, dataset.aggregateRel);
  const childPlace = findPlace(child, config.id, childRel);
  const indexPlace = findPlace(dataset.index, config.id, dataset.indexRel);
  const before = {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordStatus: childPlace.coordStatus,
    coordType: childPlace.coordType,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId
  };

  for (const place of [aggregatePlace, childPlace]) {
    delete place.coordSourceId;
    delete place.coordSourceUrl;
    Object.assign(place, {
      locatorType: config.locatorType,
      sourceProvider: config.identityProvider,
      sourceObjectId: config.identityObjectId,
      geocodeAccuracy: 'unknown',
      coordRole: 'display_marker',
      coordType: 'legacy_unverified',
      coordStatus: 'needs_source',
      coordSource: config.unresolvedSource,
      coordVerifiedAt: VERIFIED_AT,
      coordNote: config.reason
    });
  }

  syncIndexCoordinateFields(indexPlace, childPlace);

  const evidence = readJson(evidenceRel);
  evidence.currentCoordinate = currentCoordinate(childPlace);
  evidence.evidenceStatus = 'needs_research';
  evidence.coordinateDecision = 'needs_geometry';
  evidence.requiredEvidence = config.requiredEvidence;
  evidence.evidence = config.evidence;
  evidence.addressCandidates = config.addressCandidates || [];
  evidence.sourceObjectCandidates = config.sourceObjectCandidates || [];
  evidence.geometryCandidates = [];
  evidence.coordinateCandidates = [];
  evidence.decision = {
    canBecomeVerified: false,
    blockedReason: config.reason,
    nextAction: config.nextAction
  };
  evidence.notes = [config.reason];

  writeJson(childRel, child);
  writeJson(evidenceRel, evidence);
  dataset.touched.push({ id: config.id, childRel });

  return { batch: config.batch, id: config.id, name: config.name, before, reason: config.reason };
}

function saveDataset(dataset) {
  if (dataset.touched.length === 0) return;
  writeJson(dataset.aggregateRel, dataset.aggregate);
  writeJson(dataset.indexRel, dataset.index);
  dataset.manifest.source_sha256 = sha256(dataset.aggregateRel);
  dataset.manifest.generated_at = new Date().toISOString();
  for (const { id, childRel } of dataset.touched) {
    const row = (dataset.manifest.places || []).find((item) => item.id === id);
    if (!row) throw new Error(`${dataset.manifestRel}: missing row for ${id}`);
    row.sha256 = sha256(childRel);
  }
  writeJson(dataset.manifestRel, dataset.manifest);
}

const naeringsliv = makeDataset({
  aggregate: 'data/places/naeringsliv/oslo/places_naeringsliv.json',
  index: 'data/places/naeringsliv/oslo/places_naeringsliv_index.json',
  manifest: 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json',
  childDir: 'data/places/naeringsliv/oslo/places_naeringsliv',
  evidenceDir: 'data/coordinate-evidence/oslo/naeringsliv'
});

const litteratur = makeDataset({
  aggregate: 'data/places/litteratur/oslo/places_litteratur.json',
  index: 'data/places/litteratur/oslo/places_litteratur_index.json',
  manifest: 'data/places/litteratur/oslo/places_litteratur_manifest.json',
  childDir: 'data/places/litteratur/oslo/places_litteratur',
  evidenceDir: 'data/coordinate-evidence/oslo/litteratur'
});

const downgraded = [];

downgraded.push(downgradePlace(naeringsliv, {
  batch: 22,
  id: 'telegrafbygningen',
  name: 'Telegrafbygningen',
  locatorType: 'building',
  identityProvider: 'official_heritage',
  identityObjectId: 'kulturminnesok:163682',
  unresolvedSource: 'exact_osm_building_geometry_not_applied',
  reason: 'Geonorge-oppslaget for Kongens gate 21 ble kjørt først og var tvetydig. Evidence peker på OSM relation 13931026 som sannsynlig eksakt bygningsobjekt, men dagens canonical koordinat stammer fra den tidligere Wikidata-forankringen og er ikke dokumentert som avledet fra relationens geometri. Punktet beholdes kun som legacy til relationens faktiske geometri/representasjonspunkt er hentet og kontrollert.',
  requiredEvidence: ['eksakt OSM relation 13931026-geometri eller annen offisiell bygningsgeometri', 'verifisert representasjonspunkt innen korrekt Telegrafbygning'],
  evidence: [
    { sourceProvider: 'official_heritage', sourceName: 'Kulturminnesøk – Telegrafbygningen', sourceUrl: 'https://www.kulturminnesok.no/', sourceObjectId: 'kulturminnesok:163682', sourceQuality: 'official_building_identity', finding: 'Kulturminne 163682 identifiserer Telegrafbygningen som fysisk kulturminne.', canVerifyCoordinate: false, reason: 'Identiteten er dokumentert, men exact canonical koordinat er ikke avledet fra kulturminnegeometri i denne kontrollen.' },
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap relation 13931026', sourceUrl: 'https://www.openstreetmap.org/relation/13931026', sourceObjectId: 'osm-relation:13931026', sourceQuality: 'exact_geometry_candidate_unfetched', finding: 'Relation 13931026 er dokumentert som kandidat for selve bygningen.', canVerifyCoordinate: false, reason: 'Relationens faktiske geometri/representasjonspunkt må hentes før koordinaten kan promoteres.' }
  ],
  addressCandidates: [{ address: 'Kongens gate 21 Oslo', sourceProvider: 'official_address', sourceObjectId: null, canApplyToPlace: false, reason: 'Geonorge returnerte flere treff uten entydig match.' }],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-relation:13931026', canApplyToPlace: false }],
  nextAction: 'Hent OSM relation 13931026 direkte og bruk dens dokumenterte geometri/representasjonspunkt før verified_geometry gjenopprettes.'
}));

downgraded.push(downgradePlace(naeringsliv, {
  batch: 24,
  id: 'ovre_foss',
  name: 'Øvre Foss – Hjula Veveri',
  locatorType: 'building',
  identityProvider: 'official_heritage',
  identityObjectId: 'kulturminnesok:164747',
  unresolvedSource: 'ambiguous_official_address_and_exact_hjula_geometry_unresolved',
  reason: 'Adresse-first ble faktisk fulgt: det lagrede Geonorge-oppslaget for Sagveien 23 ga flere treff uten entydig match. Hjula Væverier er identifisert som kulturminne 164747, men dagens canonical punkt stammer fra den tidligere Wikidata-forankringen og er ikke dokumentert som et offisielt kulturminnepunkt eller et eksakt bygningsanker. Punktet beholdes kun som legacy til eksakt Hjula-geometri er dokumentert.',
  requiredEvidence: ['ett entydig fysisk Hjula Væverier-objekt eller offisiell kulturminnegeometri', 'representasjonspunkt som kan reproduseres fra kilden'],
  evidence: [
    { sourceProvider: 'official_heritage', sourceName: 'Kulturminnesøk – Hjula Væverier', sourceUrl: 'https://www.kulturminnesok.no/', sourceObjectId: 'kulturminnesok:164747', sourceQuality: 'official_cultural_heritage_identity', finding: 'Kulturminne 164747 identifiserer Hjula Væverier.', canVerifyCoordinate: false, reason: 'Identiteten er dokumentert, men exact canonical koordinat er ikke hentet fra objektgeometri i denne kontrollen.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Hjula Væverier', sourceUrl: 'https://oslobyleksikon.no/side/Hjula_V%C3%A6verier', sourceObjectId: 'oslobyleksikon:hjula-vaeverier', sourceQuality: 'documented_physical_identity', finding: 'Oslo byleksikon dokumenterer Hjula Væverier i Sagveien 23.', canVerifyCoordinate: false, reason: 'Brukes som identitets- og adressekryssjekk.' }
  ],
  addressCandidates: [{ address: 'Sagveien 23 Oslo', sourceProvider: 'official_address', sourceObjectId: null, canApplyToPlace: false, reason: 'Geonorge returnerte flere treff uten entydig match; råkjøringen er lagret i batch-24-rapporten.' }],
  sourceObjectCandidates: [{ sourceProvider: 'official_heritage', sourceObjectId: 'kulturminnesok:164747', canApplyToPlace: false }],
  nextAction: 'Hent eksakt kulturminne-/OSM-geometri for Hjula Væverier og dokumenter ett reproduserbart hovedanker.'
}));

downgraded.push(downgradePlace(litteratur, {
  batch: 21,
  id: 'henrik_wergeland_statue',
  name: 'Henrik Wergeland-statuen',
  locatorType: 'poi',
  identityProvider: 'manual_research',
  identityObjectId: 'oslo-museum:OB.A17403',
  unresolvedSource: 'monument_identity_known_exact_geometry_unresolved',
  reason: 'Henrik Wergeland-statuen er dokumentert på Eidsvolls plass, og Oslo Museum-aksesjonen OB.A17403 er en stabil identitetskilde. Den tidligere canonical koordinaten var likevel båret av en Commons-/museumslokasjon uten et separat dokumentert canonical monumentobjekt i koordinatkontrakten. Punktet beholdes kun som legacy til eksakt sokkel-/monumentgeometri er dokumentert.',
  requiredEvidence: ['ett eksakt monumentobjekt eller offisiell kunst-/museumskartgeometri', 'reproduserbart sokkelpunkt eller objektgeometri'],
  evidence: [
    { sourceProvider: 'manual_research', sourceName: 'Oslo Museum OB.A17403 – Henrik Wergeland-statuen', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wergeland-statuen_-_1998_-_Jan-Christian_Raastad_-_Oslo_Museum_-_OB.A17403.jpg', sourceObjectId: 'oslo-museum:OB.A17403', sourceQuality: 'museum_object_identity_and_location_lead', finding: 'Museumskilden dokumenterer monumentet og en objektlokasjon, men brukes ikke alene som canonical geometrikilde.', canVerifyCoordinate: false, reason: 'Eksakt monumentgeometri må dokumenteres separat.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Henrik Wergeland-statuen', sourceUrl: 'https://oslobyleksikon.no/index.php/Henrik_Wergeland-statuen', sourceObjectId: 'oslobyleksikon:henrik-wergeland-statuen', sourceQuality: 'documented_monument_identity', finding: 'Oslo byleksikon dokumenterer statuen på Eidsvolls plass mellom Roald Amundsens gate og Spikersuppa.', canVerifyCoordinate: false, reason: 'Identiteten og området er dokumentert; exact sokkelpunkt er fortsatt uløst.' }
  ],
  sourceObjectCandidates: [],
  nextAction: 'Finn ett eksakt monumentobjekt eller annen kildebelagt sokkelgeometri før koordinaten promoteres.'
}));

saveDataset(naeringsliv);
saveDataset(litteratur);

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8');
for (const item of downgraded) {
  const approvedPattern = new RegExp(`^\\|\\s*\\d+\\s*\\|\\s*\\\`${item.id}\\\`\\s*\\|[^\\n]*\\n`, 'm');
  protocol = protocol.replace(approvedPattern, '');
}

const needsReviewRows = [
  '| `telegrafbygningen` – Telegrafbygningen | needs_review | Geonorge-adressen var tvetydig; OSM relation 13931026 er kandidat, men dagens canonical punkt er ikke dokumentert som avledet fra relationens geometri. | Hent relationens faktiske geometri/representasjonspunkt og kontroller bygget. |',
  '| `ovre_foss` – Øvre Foss – Hjula Veveri | needs_review | Geonorge Sagveien 23 var tvetydig; kulturminneidentiteten er kjent, men dagens punkt er ikke dokumentert fra eksakt Hjula-geometri. | Hent eksakt kulturminne-/OSM-geometri og dokumenter hovedanker. |',
  '| `henrik_wergeland_statue` – Henrik Wergeland-statuen | needs_review | Monumentidentiteten er kjent, men museum/Commons-lokasjonen er ikke alene tilstrekkelig canonical geometrikilde. | Finn eksakt monumentobjekt eller kildebelagt sokkelgeometri. |'
];
const sectionMarker = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const sectionIndex = protocol.indexOf(sectionMarker);
if (sectionIndex < 0) throw new Error('Needs-review protocol section missing');
const header = '|---|---|---|---|\n';
const headerIndex = protocol.indexOf(header, sectionIndex);
if (headerIndex < 0) throw new Error('Needs-review table header missing');
let insertion = '';
for (const row of needsReviewRows) {
  const idMatch = row.match(/`([^`]+)`/);
  if (idMatch && !protocol.includes(`\`${idMatch[1]}\` –`)) insertion += `${row}\n`;
}
if (insertion) protocol = `${protocol.slice(0, headerIndex + header.length)}${insertion}${protocol.slice(headerIndex + header.length)}`;

protocol = protocol.replace(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./, (_, count) => `Oslo-tabellen inneholder nå ${Number(count) - downgraded.length} verifiserte eller kildekontrollerte canonical steder.`);
protocol = protocol.replace(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå (\d+)\./, (_, count) => `Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå ${Number(count) + downgraded.length}.`);

const protocolNote = 'Retrokontroll fra batch 6 (2026-07-20), pass 3: `telegrafbygningen`, `ovre_foss` og `henrik_wergeland_statue` er nedgradert fra `verified_geometry` til `needs_source` fordi den kjente identitetskilden ikke dokumenterer at dagens canonical punkt faktisk er avledet fra den eksakte fysiske objektgeometrien. Ingen av de gamle Wikidata-/Commons-punktene beholdes som verifisert bare ved å bytte kildeetikett.';
if (!protocol.includes(protocolNote)) protocol = protocol.replace(sectionMarker, `${protocolNote}\n\n${sectionMarker}`);
fs.writeFileSync(abs(protocolRel), protocol);

writeJson(`${REPORT_ROOT}/pass-3-batches-21-24.json`, {
  date: VERIFIED_AT,
  result: 'downgraded_unresolved_source_object_cases',
  downgraded,
  findings: [
    'Øvre Foss/Hjula was not an address-first omission: the saved batch-24 Geonorge lookup for Sagveien 23 exists and is ambiguous.',
    'Telegrafbygningen also had a documented ambiguous Geonorge lookup before fallback, but the canonical point still needs to be tied explicitly to relation 13931026 geometry.',
    'Henrik Wergeland-statuen is a monument-object case, not an address case; museum/Commons location is retained as research evidence, not as verified canonical geometry.'
  ]
});

const readmeRel = `${REPORT_ROOT}/README.md`;
let readme = fs.existsSync(abs(readmeRel)) ? fs.readFileSync(abs(readmeRel), 'utf8') : '# Oslo coordinate retro-audit from batch 6\n';
const section = '\n## Pass 3 — unresolved source-object corrections\n\nThe audit removes false confidence rather than relabeling old points. `telegrafbygningen`, `ovre_foss` and `henrik_wergeland_statue` are downgraded to `needs_source` until their canonical point can be reproduced from an exact physical source object. The saved Sagveien 23 Geonorge run confirms that Øvre Foss/Hjula did follow address-first and ended in an ambiguous address result.\n';
if (!readme.includes('## Pass 3 — unresolved source-object corrections')) readme += section;
fs.writeFileSync(abs(readmeRel), readme);

console.log(JSON.stringify({ ok: true, downgraded: downgraded.map((item) => item.id) }, null, 2));
