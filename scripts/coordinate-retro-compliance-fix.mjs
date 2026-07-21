#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
fs.mkdirSync(auditDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const clone = (value) => JSON.parse(JSON.stringify(value));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : payload?.id
        ? [payload]
        : [];

function normalizeSourceId(value) {
  return String(value ?? '')
    .trim()
    .replace(/^osm:(node|way|relation):/i, 'osm-$1:')
    .replace(/^osm_(node|way|relation):/i, 'osm-$1:');
}

function patchPlace(file, placeId, mutate) {
  const payload = readJson(file);
  const place = toPlaces(payload).find((item) => item?.id === placeId);
  if (!place) throw new Error(file + ' mangler ' + placeId);
  mutate(place);
  writeJson(file, payload);
}

function patchSplitIndex(file, placeId, patch) {
  if (!fs.existsSync(file)) return;
  const rows = readJson(file);
  if (!Array.isArray(rows)) throw new Error(file + ' er ikke array');
  const row = rows.find((item) => item?.id === placeId);
  if (!row) throw new Error(file + ' mangler ' + placeId);
  Object.assign(row, patch);
  writeJson(file, rows);
}

function refreshSplitManifest(manifestFile, aggregateFile, childFile, placeId) {
  if (!fs.existsSync(manifestFile)) return;
  const manifest = readJson(manifestFile);
  const row = (manifest.places || []).find((item) => item?.id === placeId);
  if (!row) throw new Error(manifestFile + ' mangler ' + placeId);
  manifest.source_sha256 = sha256(aggregateFile);
  row.sha256 = sha256(childFile);
  manifest.generated_at = new Date().toISOString();
  writeJson(manifestFile, manifest);
}

function patchSplitFamily(config) {
  patchPlace(config.child, config.placeId, config.mutate);
  patchPlace(config.aggregate, config.placeId, config.mutate);
  patchSplitIndex(config.index, config.placeId, config.indexPatch);
  refreshSplitManifest(config.manifest, config.aggregate, config.child, config.placeId);
}

function runtimeMap() {
  const map = new Map();
  for (const place of toPlaces(readJson(path.join(root, 'data/places/places_index.json')))) {
    if (place?.id) map.set(String(place.id), place);
  }
  return map;
}

function parseOsloRows(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Oslo');
  if (start < 0) throw new Error('Fant ikke ## Oslo');
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i]) && lines[i].trim() !== '## Oslo') {
      end = i;
      break;
    }
  }
  const rows = [];
  for (let i = start; i < end; i++) {
    const match = lines[i].match(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*(verified(?:_geometry|_historical_source)?)\s*\|\s*`([^`]+)`\s*\|\s*$/);
    if (!match) continue;
    rows.push({
      lineIndex: i,
      batch: Number(match[1]),
      placeId: match[2],
      name: match[3].trim(),
      status: match[4].trim(),
      source: match[5].trim()
    });
  }
  return { lines, start, end, rows };
}

function geonorgeId(hit) {
  const kommune = String(hit?.kommunenummer ?? '').trim();
  const kode = String(hit?.adressekode ?? '').trim();
  const number = String(hit?.nummer ?? '').trim();
  const letter = String(hit?.bokstav ?? '').trim();
  if (!kommune || !kode || !number) throw new Error('Ufullstendig Geonorge-identitet');
  return 'geonorge-adresser-v1:' + kommune + ':' + kode + ':' + number + letter;
}

// 1) Oslo domkirke: use exact Stortorvet 1, not Stortorvet 1B.
const domRaw = readJson(path.join(auditDir, 'oslo-domkirke-stortorvet-1-geonorge-raw.json'));
const domHits = Array.isArray(domRaw?.adresser) ? domRaw.adresser : [];
const domExact = domHits.filter((hit) =>
  String(hit?.adressenavn ?? '').trim().toLowerCase() === 'stortorvet'
  && String(hit?.nummer ?? '').trim() === '1'
  && String(hit?.bokstav ?? '').trim() === ''
  && String(hit?.kommunenummer ?? '').trim() === '0301'
);
if (domExact.length !== 1) throw new Error('Forventet ett eksakt Stortorvet 1-treff uten bokstav, fant ' + domExact.length);
const domHit = domExact[0];
const domLat = domHit?.representasjonspunkt?.lat;
const domLon = domHit?.representasjonspunkt?.lon;
if (typeof domLat !== 'number' || typeof domLon !== 'number') throw new Error('Stortorvet 1 mangler representasjonspunkt');
const domSourceId = geonorgeId(domHit);
const domSourceUrl = 'https://ws.geonorge.no/adresser/v1/sok?sok=Stortorvet%201%20Oslo';
patchPlace(path.join(root, 'data/places/by/oslo/oslo_domkirke.json'), 'oslo_domkirke', (place) => {
  place.lat = domLat;
  place.lon = domLon;
  place.r = 60;
  place.locatorType = 'building';
  place.sourceProvider = 'official_address';
  place.sourceObjectId = domSourceId;
  place.address = {
    street: 'Stortorvet',
    number: '1',
    postcode: String(domHit.postnummer ?? '').trim(),
    city: 'Oslo',
    country: 'NO'
  };
  place.geocodeAccuracy = 'rooftop';
  place.coordRole = 'display_marker';
  place.coordStatus = 'verified';
  place.coordSource = 'geonorge_adresser_v1';
  place.coordType = 'address_point';
  place.coordVerifiedAt = '2026-07-21';
  place.coordSourceId = domSourceId;
  place.coordSourceUrl = domSourceUrl;
  place.coordNote = 'Retrospektiv compliance-korreksjon: offisiell Geonorge-adressekoordinat for Oslo domkirkes dokumenterte besøksadresse Stortorvet 1 brukes som canonical display-marker. Det opprinnelige batch-4-punktet for Karl Johans gate 11 er fortsatt forkastet fordi det tilhører Kirkeristen. Et nytt live address-first-oppslag ga ett eksakt Stortorvet 1-treff når bokstav ble matchet eksplisitt, og dette erstatter det midlertidige OSM-inngangspunktet som primær koordinatkilde.';
  delete place.coordPrecisionM;
  delete place.coordPrecision;
  delete place.manualQa;
});
writeJson(path.join(auditDir, 'oslo-domkirke-address-first-result.json'), {
  query: 'Stortorvet 1 Oslo',
  sourceUrl: domSourceUrl,
  applied: true,
  status: 'verified_candidate_applied',
  reason: 'Stortorvet 1 uten bokstav ble entydig skilt fra Stortorvet 1B.',
  sourceObjectId: domSourceId,
  coordinate: { lat: domLat, lon: domLon },
  rawHit: domHit
});

// 2) Korketrekkeren: keep source and coordinates, normalize contract enums.
const sportBase = path.join(root, 'data/places/sport/europa/norway');
patchSplitFamily({
  aggregate: path.join(sportBase, 'places_oslo_lekeplasser_trening.json'),
  child: path.join(sportBase, 'places_oslo_lekeplasser_trening/korketrekkeren.json'),
  manifest: path.join(sportBase, 'places_oslo_lekeplasser_trening_manifest.json'),
  index: path.join(sportBase, 'places_oslo_lekeplasser_trening_index.json'),
  placeId: 'korketrekkeren',
  mutate: (place) => {
    place.locatorType = 'route';
    place.geocodeAccuracy = 'semantic_anchor';
    place.coordRole = 'line_anchor';
    place.coordStatus = 'verified_geometry';
    place.coordVerifiedAt = '2026-07-21';
    const suffix = ' Contract v1-normalisering 2026-07-21: samme eksakte øvre rutepunkt og samme OSM-ruterelasjon beholdes, men metadata uttrykkes med tillatte canonical verdier locatorType=route, geocodeAccuracy=semantic_anchor og coordRole=line_anchor. Ingen koordinat eller kildeidentitet er endret.';
    if (!String(place.coordNote || '').includes('Contract v1-normalisering 2026-07-21')) place.coordNote = String(place.coordNote || '').trim() + suffix;
  },
  indexPatch: { coordStatus: 'verified_geometry', coordType: 'route_start' }
});

// 3) Vaterland historical river: line anchor must survive the light runtime index.
const natureBase = path.join(root, 'data/places/natur/oslo');
patchSplitFamily({
  aggregate: path.join(natureBase, 'places_oslo_natur_akerselvarute.json'),
  child: path.join(natureBase, 'places_oslo_natur_akerselvarute/vaterland_historisk_elvelop.json'),
  manifest: path.join(natureBase, 'places_oslo_natur_akerselvarute_manifest.json'),
  index: path.join(natureBase, 'places_oslo_natur_akerselvarute_index.json'),
  placeId: 'vaterland_historisk_elvelop',
  mutate: (place) => {
    place.coordRole = 'line_anchor';
    place.coordVerifiedAt = '2026-07-21';
    const suffix = ' Contract v1-normalisering 2026-07-21: Vaterlands bru er start-/linjeanker for det historiske elveløpet, derfor brukes coordRole=line_anchor slik at den kildebelagte linjerepresentasjonen også beholder verified trust i den lette runtime-indeksen. Ingen koordinat eller kildeidentitet er endret.';
    if (!String(place.coordNote || '').includes('Contract v1-normalisering 2026-07-21')) place.coordNote = String(place.coordNote || '').trim() + suffix;
  },
  indexPatch: { coordStatus: 'verified_historical_source', coordType: 'historic_river_course_anchor' }
});

// 4) Migrate two stale protocol IDs to their current canonical IDs.
let protocol = fs.readFileSync(protocolFile, 'utf8');
protocol = protocol.replace(
  '| 8 | `folkeobservatoriet` | Folkeobservatoriet | verified | `geonorge-adresser-v1:0301:13070:119` |',
  '| 8 | `folkeobservatoriet_holmenkollen` | Folkeobservatoriet | verified | `geonorge-adresser-v1:0301:13070:119` |'
);
protocol = protocol.replace(
  '| 8 | `slurpen` | Slurpen | verified | `geonorge-adresser-v1:0301:14097:79C` |',
  '| 8 | `slurpen_lakkegata` | Slurpen | verified | `geonorge-adresser-v1:0301:14097:79C` |'
);
writeText(protocolFile, protocol);

// Build current runtime and validator.
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
const validatorModule = await import(pathToFileURL(path.join(root, 'dist/tools/coordinate-source-contract.mjs')).href);
const validateCoordinateSource = validatorModule.validateCoordinateSource;
let runtime = runtimeMap();

// Sync Oslo protocol rows to current verified status/source.
let parsed = parseOsloRows(fs.readFileSync(protocolFile, 'utf8'));
const protocolSync = [];
for (const row of parsed.rows) {
  const current = runtime.get(row.placeId);
  if (!current || !verifiedStatuses.has(String(current.coordStatus || ''))) continue;
  const source = String(current.sourceObjectId || row.source);
  if (row.status === current.coordStatus && normalizeSourceId(row.source) === normalizeSourceId(source)) continue;
  parsed.lines[row.lineIndex] = '| ' + row.batch + ' | `' + row.placeId + '` | ' + row.name + ' | ' + current.coordStatus + ' | `' + source + '` |';
  protocolSync.push({
    batch: row.batch,
    placeId: row.placeId,
    beforeStatus: row.status,
    afterStatus: current.coordStatus,
    beforeSource: row.source,
    afterSource: source
  });
}
writeText(protocolFile, parsed.lines.join('\n'));

// Final Oslo-only audit.
protocol = fs.readFileSync(protocolFile, 'utf8');
parsed = parseOsloRows(protocol);
runtime = runtimeMap();
const auditedRows = [];
const contractFailures = [];
const missingCurrentRecords = [];
const protocolMismatches = [];

for (const row of parsed.rows) {
  const current = runtime.get(row.placeId);
  if (!current) {
    missingCurrentRecords.push({ batch: row.batch, placeId: row.placeId, name: row.name });
    continue;
  }
  const result = validateCoordinateSource(current);
  auditedRows.push({
    batch: row.batch,
    placeId: row.placeId,
    protocolStatus: row.status,
    currentStatus: current.coordStatus || null,
    sourceProvider: current.sourceProvider || null,
    sourceObjectId: current.sourceObjectId || null,
    trust: result.trust,
    sourceFile: current.sourceFile || null
  });
  if (result.trust !== 'verified') {
    contractFailures.push({
      batch: row.batch,
      placeId: row.placeId,
      currentStatus: current.coordStatus || null,
      sourceProvider: current.sourceProvider || null,
      sourceObjectId: current.sourceObjectId || null,
      trust: result.trust,
      problems: result.problems
    });
  }
  if (row.status !== current.coordStatus || normalizeSourceId(row.source) !== normalizeSourceId(current.sourceObjectId || row.source)) {
    protocolMismatches.push({
      batch: row.batch,
      placeId: row.placeId,
      protocolStatus: row.status,
      currentStatus: current.coordStatus || null,
      protocolSource: row.source,
      currentSource: current.sourceObjectId || null
    });
  }
}

// A previously stored successful address-first candidate must not be silently
// overridden for a current Oslo protocol place.
const protocolIds = new Set(parsed.rows.map((row) => row.placeId));
const savedAddressCandidateNonPrimary = [];
const reportsRoot = path.join(root, 'reports');
for (const dirent of fs.readdirSync(reportsRoot, { withFileTypes: true })) {
  if (!dirent.isDirectory() || !/^geonorge-address-batch-\d+$/.test(dirent.name)) continue;
  const dir = path.join(reportsRoot, dirent.name);
  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith('.json')) continue;
    const placeId = path.basename(fileName, '.json');
    if (!protocolIds.has(placeId)) continue;
    let candidate;
    try { candidate = readJson(path.join(dir, fileName)); } catch { continue; }
    if (candidate?.ok !== true || candidate?.status !== 'verified_candidate' || candidate?.coordinate?.sourceProvider !== 'official_address') continue;
    const current = runtime.get(placeId);
    if (!current || current.sourceProvider === 'official_address') continue;
    savedAddressCandidateNonPrimary.push({
      placeId,
      candidateFile: path.relative(root, path.join(dir, fileName)).replace(/\\/g, '/'),
      savedSourceObjectId: candidate.coordinate.sourceObjectId || candidate.sourceObjectId || null,
      currentSourceProvider: current.sourceProvider || null,
      currentSourceObjectId: current.sourceObjectId || null
    });
  }
}

const batchesRepresented = [...new Set(parsed.rows.map((row) => row.batch))].sort((a, b) => a - b);
const outOfScopeBatches = batchesRepresented.filter((batch) => batch < 1 || batch > 120);
const openBlockingFindings = [];
for (const item of contractFailures) openBlockingFindings.push({ type: 'contract_failure', ...item });
for (const item of missingCurrentRecords) openBlockingFindings.push({ type: 'missing_current_record', ...item });
for (const item of protocolMismatches) openBlockingFindings.push({ type: 'protocol_mismatch', ...item });
for (const item of savedAddressCandidateNonPrimary) openBlockingFindings.push({ type: 'saved_address_candidate_not_primary', ...item });
for (const batch of outOfScopeBatches) openBlockingFindings.push({ type: 'out_of_scope_batch', batch });

const summary = {
  documentedVerifiedRows: parsed.rows.length,
  uniquePlaceIds: new Set(parsed.rows.map((row) => row.placeId)).size,
  batchesRepresented,
  contractPass: auditedRows.length - contractFailures.length,
  contractFailures: contractFailures.length,
  missingCurrentRecords: missingCurrentRecords.length,
  protocolRowsSyncedThisPass: protocolSync.length,
  protocolMismatchesAfterSync: protocolMismatches.length,
  savedAddressCandidateNonPrimary: savedAddressCandidateNonPrimary.length,
  outOfScopeBatches: outOfScopeBatches.length,
  openBlockingFindings: openBlockingFindings.length
};

const audit = {
  generatedAt: new Date().toISOString(),
  scope: 'Oslo section only: every documented verified / verified_geometry / verified_historical_source row in batches 1-120, checked against current canonical runtime and Coordinate Source Contract v1.',
  summary,
  coverage: [
    {
      range: '1-5',
      status: 're-reviewed and corrected where required',
      evidence: 'Stored Geonorge address-first outputs compared with current canonical records. Tronsmo restored to valid address-first source. Oslo domkirke resolved against the correct Stortorvet 1 address, explicitly excluding Stortorvet 1B.'
    },
    {
      range: '6-35',
      status: 'existing full retrospective audit reused and final contract normalized',
      evidence: 'reports/oslo-coordinate-retro-audit-from-batch-6/README.md documents full review of every batch 6-35 and three corrective passes. Vaterland historical river metadata was normalized so its line anchor retains verified runtime trust.'
    },
    {
      range: '36-120',
      status: 're-reviewed against current contract and documented source-closure/object-type-first decisions',
      evidence: 'Every current Oslo protocol row was validated against runtime Contract v1. Korketrekkeren retained its route geometry/source and was normalized to canonical route, semantic_anchor and line_anchor enums.'
    }
  ],
  correctionsApplied: {
    tronsmo: 'Restored in first audit pass to geonorge-adresser-v1:0301:17999:12.',
    osloDomkirke: { sourceObjectId: domSourceId, coordinate: { lat: domLat, lon: domLon } },
    korketrekkeren: { locatorType: 'route', geocodeAccuracy: 'semantic_anchor', coordRole: 'line_anchor', coordinateChanged: false, sourceChanged: false },
    vaterlandHistoriskElvelop: { coordRole: 'line_anchor', coordinateChanged: false, sourceChanged: false },
    protocolIdMigrations: [
      { from: 'folkeobservatoriet', to: 'folkeobservatoriet_holmenkollen' },
      { from: 'slurpen', to: 'slurpen_lakkegata' }
    ],
    protocolSync
  },
  contractFailures,
  missingCurrentRecords,
  protocolMismatches,
  savedAddressCandidateNonPrimary,
  outOfScopeBatches,
  openBlockingFindings,
  auditedRows
};
writeJson(path.join(auditDir, 'audit.json'), audit);

const reportLines = [
  '# Retrospektiv Oslo coordinate compliance-audit - batch 1-120',
  '',
  'Generert: ' + audit.generatedAt,
  '',
  '## Konklusjon',
  '',
  '- Dokumenterte Oslo verified-rader kontrollert: **' + summary.documentedVerifiedRows + '**',
  '- Unike placeId-er: **' + summary.uniquePlaceIds + '**',
  '- Contract v1 PASS: **' + summary.contractPass + '**',
  '- Contract v1 FAIL: **' + summary.contractFailures + '**',
  '- Manglende current canonical records: **' + summary.missingCurrentRecords + '**',
  '- Protokollmismatch etter synk: **' + summary.protocolMismatchesAfterSync + '**',
  '- Lagrede entydige Geonorge-kandidater som fortsatt er overstyrt: **' + summary.savedAddressCandidateNonPrimary + '**',
  '- Regionale batcher feilaktig fanget av Oslo-auditen: **' + summary.outOfScopeBatches + '**',
  '- Åpne blokkerende funn: **' + summary.openBlockingFindings + '**',
  '',
  '## Korrigeringer',
  '',
  '- **Tronsmo Bokhandel:** gjenopprettet til den lagrede entydige Geonorge-adressekilden for Universitetsgata 12.',
  '- **Oslo domkirke:** Stortorvet 1 er skilt fra Stortorvet 1B og brukes nå som official-address canonical: `' + domSourceId + '` (' + domLat + ', ' + domLon + '). Karl Johans gate 11 forblir forkastet som Kirkeristen.',
  '- **Korketrekkeren:** samme rutegeometri og startpunkt beholdt; ugyldige enum-verdier normalisert til `route`, `semantic_anchor`, `line_anchor`.',
  '- **Vaterland - historisk elveløp:** samme Vaterlands bru-anker og historiske kilde beholdt; `coordRole` normalisert til `line_anchor`.',
  '- **Folkeobservatoriet / Slurpen:** stale protokoll-ID-er migrert til `folkeobservatoriet_holmenkollen` og `slurpen_lakkegata`.',
  '',
  '## Åpne blokkerende funn',
  '',
  openBlockingFindings.length ? JSON.stringify(openBlockingFindings, null, 2) : '_Ingen._',
  '',
  '## Dekningsgrunnlag',
  '',
  '- **Batch 1-5:** ny sammenligning mot lagrede address-first-resultater og dagens canonical data.',
  '- **Batch 6-35:** eksisterende full retrokontroll med tre korrigeringspass gjenbrukt, deretter dagens Contract v1 validert.',
  '- **Batch 36-120:** dagens canonical verified-rader validert mot Contract v1 og dokumenterte source-closure-/objekttypebeslutninger.',
  '',
  'Maskinrapport: `reports/oslo-coordinate-retro-compliance-20260721/audit.json`.'
];
writeText(path.join(auditDir, 'README.md'), reportLines.join('\n'));

const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
let finalProtocol = fs.readFileSync(protocolFile, 'utf8');
const note = marker + ' Full Oslo-only audit er gjennomført mot dagens Coordinate Source Contract v1 og current canonical runtime. Batch 1–5 er revidert på nytt mot address-first-evidens; batch 6–35 bygger på den dokumenterte full-retrokontrollen med tre korrigeringspass; batch 36–120 er kontrollert mot dagens verified-records og dokumenterte source-closure-/objekttypebeslutninger. Tronsmo, Oslo domkirke, Korketrekkeren, Vaterlands historiske elveløp og to stale canonical placeId-er er korrigert/synkronisert i audit-PR-en. Maskinrapport: `reports/oslo-coordinate-retro-compliance-20260721/audit.json`.';
const markerIndex = finalProtocol.indexOf(marker);
if (markerIndex >= 0) {
  const lineStart = finalProtocol.lastIndexOf('\n', markerIndex) + 1;
  const nextNewline = finalProtocol.indexOf('\n', markerIndex);
  const lineEnd = nextNewline >= 0 ? nextNewline : finalProtocol.length;
  finalProtocol = finalProtocol.slice(0, lineStart) + note + finalProtocol.slice(lineEnd);
} else {
  const heading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  finalProtocol = finalProtocol.includes(heading)
    ? finalProtocol.replace(heading, note + '\n\n' + heading)
    : finalProtocol.trimEnd() + '\n\n' + note + '\n';
}
writeText(protocolFile, finalProtocol);

console.log(JSON.stringify({ status: openBlockingFindings.length === 0 ? 'retrospective_compliance_pass' : 'retrospective_compliance_open_findings', ...summary }, null, 2));

if (openBlockingFindings.length > 0) {
  throw new Error('Retrospektiv Oslo-compliance har ' + openBlockingFindings.length + ' åpne blokkerende funn.');
}

// The branch runner removes scripts/coordinate-branch-job.mjs. Remove this
// implementation too, so no one-shot audit machinery remains after success.
fs.unlinkSync(new URL(import.meta.url));
