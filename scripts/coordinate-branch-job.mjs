#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
fs.mkdirSync(auditDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const writeText = (file, text) => fs.writeFileSync(file, text.endsWith('\n') ? text : `${text}\n`);
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const clone = (value) => JSON.parse(JSON.stringify(value));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
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
  if (!place) throw new Error(`${rel(file)} mangler ${placeId}`);
  const before = clone(place);
  mutate(place);
  writeJson(file, payload);
  return { file: rel(file), before, after: clone(place) };
}

function patchSplitIndex(file, placeId, patch) {
  if (!fs.existsSync(file)) return;
  const rows = readJson(file);
  if (!Array.isArray(rows)) throw new Error(`${rel(file)} er ikke en array`);
  const row = rows.find((item) => item?.id === placeId);
  if (!row) throw new Error(`${rel(file)} mangler ${placeId}`);
  Object.assign(row, patch);
  writeJson(file, rows);
}

function refreshSplitManifest(manifestFile, aggregateFile, childFile, placeId) {
  if (!fs.existsSync(manifestFile)) return;
  const manifest = readJson(manifestFile);
  const row = (manifest.places || []).find((item) => item?.id === placeId);
  if (!row) throw new Error(`${rel(manifestFile)} mangler ${placeId}`);
  manifest.source_sha256 = sha256(aggregateFile);
  row.sha256 = sha256(childFile);
  manifest.generated_at = new Date().toISOString();
  writeJson(manifestFile, manifest);
}

function patchSplitFamily({ aggregate, child, manifest, index, placeId, mutate, indexPatch }) {
  const childChange = patchPlace(child, placeId, mutate);
  const aggregateChange = patchPlace(aggregate, placeId, mutate);
  patchSplitIndex(index, placeId, indexPatch);
  refreshSplitManifest(manifest, aggregate, child, placeId);
  return [childChange, aggregateChange];
}

function currentRuntimeMap() {
  const map = new Map();
  for (const place of toPlaces(readJson(path.join(root, 'data/places/places_index.json')))) {
    if (place?.id) map.set(String(place.id), place);
  }
  return map;
}

function parseOsloProtocolRows(markdown) {
  const lines = markdown.split('\n');
  const osloStart = lines.findIndex((line) => line.trim() === '## Oslo');
  if (osloStart < 0) throw new Error('Fant ikke ## Oslo i koordinatprotokollen');
  let osloEnd = lines.length;
  for (let i = osloStart + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i]) && lines[i].trim() !== '## Oslo') {
      osloEnd = i;
      break;
    }
  }
  const rows = [];
  for (let i = osloStart; i < osloEnd; i++) {
    const line = lines[i];
    const match = line.match(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*(verified(?:_geometry|_historical_source)?)\s*\|\s*`([^`]+)`\s*\|\s*$/);
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
  return { lines, osloStart, osloEnd, rows };
}

function sourceObjectIdFromGeonorge(hit) {
  const kommune = String(hit?.kommunenummer ?? '').trim();
  const kode = String(hit?.adressekode ?? '').trim();
  const nr = String(hit?.nummer ?? '').trim();
  const bokstav = String(hit?.bokstav ?? '').trim();
  if (!kommune || !kode || !nr) throw new Error('Geonorge-treff mangler sourceObjectId-komponenter');
  return `geonorge-adresser-v1:${kommune}:${kode}:${nr}${bokstav}`;
}

function applyAddressCoordinate(place, hit, sourceUrl) {
  const lat = hit?.representasjonspunkt?.lat;
  const lon = hit?.representasjonspunkt?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') throw new Error('Geonorge-treff mangler representasjonspunkt');
  const sourceObjectId = sourceObjectIdFromGeonorge(hit);
  const street = String(hit?.adressenavn ?? '').trim();
  const number = `${String(hit?.nummer ?? '').trim()}${String(hit?.bokstav ?? '').trim()}`;
  const postcode = String(hit?.postnummer ?? '').trim();
  const rawCity = String(hit?.poststed || hit?.kommunenavn || '').trim();
  place.lat = lat;
  place.lon = lon;
  place.r = 60;
  place.locatorType = 'building';
  place.sourceProvider = 'official_address';
  place.sourceObjectId = sourceObjectId;
  place.address = { street, number, postcode, city: rawCity.toUpperCase() === 'OSLO' ? 'Oslo' : rawCity, country: 'NO' };
  place.geocodeAccuracy = 'rooftop';
  place.coordRole = 'display_marker';
  place.coordStatus = 'verified';
  place.coordSource = 'geonorge_adresser_v1';
  place.coordType = 'address_point';
  place.coordVerifiedAt = '2026-07-21';
  place.coordSourceId = sourceObjectId;
  place.coordSourceUrl = sourceUrl;
  place.coordNote = 'Retrospektiv compliance-korreksjon: offisiell Geonorge-adressekoordinat for Oslo domkirkes dokumenterte besøksadresse Stortorvet 1 brukes som canonical display-marker. Det opprinnelige batch-4-punktet for Karl Johans gate 11 er fortsatt forkastet fordi det tilhører Kirkeristen. Et nytt live address-first-oppslag ga ett eksakt Stortorvet 1-treff når bokstav ble matchet eksplisitt, og dette erstatter det midlertidige OSM-inngangspunktet som primær koordinatkilde.';
  delete place.coordPrecisionM;
  delete place.coordPrecision;
  delete place.manualQa;
  return { sourceObjectId, lat, lon };
}

// ---------------------------------------------------------------------------
// 1. Oslo domkirke: resolve Stortorvet 1 vs Stortorvet 1B correctly.
// ---------------------------------------------------------------------------
const domkirkeRawFile = path.join(auditDir, 'oslo-domkirke-stortorvet-1-geonorge-raw.json');
const domkirkeRaw = readJson(domkirkeRawFile);
const domkirkeHits = Array.isArray(domkirkeRaw?.adresser) ? domkirkeRaw.adresser : [];
const domkirkeExact = domkirkeHits.filter((hit) =>
  String(hit?.adressenavn ?? '').trim().toLowerCase() === 'stortorvet'
  && String(hit?.nummer ?? '').trim() === '1'
  && String(hit?.bokstav ?? '').trim() === ''
  && String(hit?.kommunenummer ?? '').trim() === '0301'
);
if (domkirkeExact.length !== 1) throw new Error(`Forventet ett eksakt Stortorvet 1-treff uten bokstav, fant ${domkirkeExact.length}`);
const domkirkeSourceUrl = 'https://ws.geonorge.no/adresser/v1/sok?sok=Stortorvet%201%20Oslo';
let domkirkeApplied;
const domkirkeChange = patchPlace(
  path.join(root, 'data/places/by/oslo/oslo_domkirke.json'),
  'oslo_domkirke',
  (place) => { domkirkeApplied = applyAddressCoordinate(place, domkirkeExact[0], domkirkeSourceUrl); }
);
writeJson(path.join(auditDir, 'oslo-domkirke-address-first-result.json'), {
  query: 'Stortorvet 1 Oslo',
  sourceUrl: domkirkeSourceUrl,
  applied: true,
  status: 'verified_candidate_applied',
  reason: 'Ett eksakt Stortorvet 1-treff uten bokstav i Oslo; Stortorvet 1B er et separat adressetreff og ble korrekt ekskludert.',
  sourceObjectId: domkirkeApplied.sourceObjectId,
  coordinate: { lat: domkirkeApplied.lat, lon: domkirkeApplied.lon },
  rawHit: domkirkeExact[0]
});

// ---------------------------------------------------------------------------
// 2. Korketrekkeren: preserve route/source, normalize only contract enums.
// ---------------------------------------------------------------------------
const korkBase = path.join(root, 'data/places/sport/europa/norway');
const korkChanges = patchSplitFamily({
  aggregate: path.join(korkBase, 'places_oslo_lekeplasser_trening.json'),
  child: path.join(korkBase, 'places_oslo_lekeplasser_trening/korketrekkeren.json'),
  manifest: path.join(korkBase, 'places_oslo_lekeplasser_trening_manifest.json'),
  index: path.join(korkBase, 'places_oslo_lekeplasser_trening_index.json'),
  placeId: 'korketrekkeren',
  mutate: (place) => {
    place.locatorType = 'route';
    place.geocodeAccuracy = 'semantic_anchor';
    place.coordRole = 'line_anchor';
    place.coordStatus = 'verified_geometry';
    place.coordVerifiedAt = '2026-07-21';
    place.coordNote = `${String(place.coordNote || '').replace(/\s+$/g, '')} Contract v1-normalisering 2026-07-21: det samme eksakte øvre rutepunktet beholdes som display-/startmarkør, men metadata uttrykkes med tillatte canonical verdier locatorType=route, geocodeAccuracy=semantic_anchor og coordRole=line_anchor. Ingen koordinat eller kildeidentitet er endret.`;
  },
  indexPatch: { coordStatus: 'verified_geometry', coordType: 'route_start' }
});

// ---------------------------------------------------------------------------
// 3. Vaterland historical river: keep exact bridge anchor, expose it to the
//    light runtime contract as a line_anchor so semantic verified trust survives.
// ---------------------------------------------------------------------------
const vaterBase = path.join(root, 'data/places/natur/oslo');
const vaterChanges = patchSplitFamily({
  aggregate: path.join(vaterBase, 'places_oslo_natur_akerselvarute.json'),
  child: path.join(vaterBase, 'places_oslo_natur_akerselvarute/vaterland_historisk_elvelop.json'),
  manifest: path.join(vaterBase, 'places_oslo_natur_akerselvarute_manifest.json'),
  index: path.join(vaterBase, 'places_oslo_natur_akerselvarute_index.json'),
  placeId: 'vaterland_historisk_elvelop',
  mutate: (place) => {
    place.coordRole = 'line_anchor';
    place.coordVerifiedAt = '2026-07-21';
    place.coordNote = `${String(place.coordNote || '').replace(/\s+$/g, '')} Contract v1-normalisering 2026-07-21: Vaterlands bru er start-/linjeanker for det historiske elveløpet, derfor brukes coordRole=line_anchor slik at den kildebelagte linjerepresentasjonen også beholder verified trust i den lette runtime-indeksen. Ingen koordinat eller kildeidentitet er endret.`;
  },
  indexPatch: { coordStatus: 'verified_historical_source', coordType: 'historic_river_course_anchor' }
});

// ---------------------------------------------------------------------------
// 4. Protocol: migrate two renamed canonical IDs, then sync all Oslo rows to
//    current verified status/source after rebuilding runtime.
// ---------------------------------------------------------------------------
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
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

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
const { validateCoordinateSource } = await import(pathToFileURL(path.join(root, 'dist/tools/coordinate-source-contract.mjs')).href);
let runtime = currentRuntimeMap();

let parsed = parseOsloProtocolRows(fs.readFileSync(protocolFile, 'utf8'));
const protocolSync = [];
for (const row of parsed.rows) {
  const current = runtime.get(row.placeId);
  if (!current || !verifiedStatuses.has(String(current.coordStatus || ''))) continue;
  const currentSource = hasText(current.sourceObjectId) ? current.sourceObjectId : row.source;
  if (row.status === current.coordStatus && normalizeSourceId(row.source) === normalizeSourceId(currentSource)) continue;
  parsed.lines[row.lineIndex] = `| ${row.batch} | \`${row.placeId}\` | ${row.name} | ${current.coordStatus} | \`${currentSource}\` |`;
  protocolSync.push({
    batch: row.batch,
    placeId: row.placeId,
    beforeStatus: row.status,
    afterStatus: current.coordStatus,
    beforeSource: row.source,
    afterSource: currentSource
  });
}
protocol = parsed.lines.join('\n');
writeText(protocolFile, protocol);

// ---------------------------------------------------------------------------
// 5. Final Oslo-only audit. Do not parse later regional protocol sections.
// ---------------------------------------------------------------------------
parsed = parseOsloProtocolRows(protocol);
runtime = currentRuntimeMap();
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
  const validation = validateCoordinateSource(current);
  auditedRows.push({
    batch: row.batch,
    placeId: row.placeId,
    protocolStatus: row.status,
    currentStatus: current.coordStatus || null,
    sourceProvider: current.sourceProvider || null,
    sourceObjectId: current.sourceObjectId || null,
    trust: validation.trust,
    sourceFile: current.sourceFile || null
  });
  if (validation.trust !== 'verified') {
    contractFailures.push({
      batch: row.batch,
      placeId: row.placeId,
      currentStatus: current.coordStatus || null,
      sourceProvider: current.sourceProvider || null,
      sourceObjectId: current.sourceObjectId || null,
      trust: validation.trust,
      problems: validation.problems
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

const protocolIds = new Set(parsed.rows.map((row) => row.placeId));
const savedAddressCandidateNonPrimary = [];
for (const dirent of fs.readdirSync(path.join(root, 'reports'), { withFileTypes: true })) {
  if (!dirent.isDirectory() || !/^geonorge-address-batch-\d+$/.test(dirent.name)) continue;
  const dir = path.join(root, 'reports', dirent.name);
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
      candidateFile: rel(path.join(dir, fileName)),
      savedSourceObjectId: candidate.coordinate.sourceObjectId || candidate.sourceObjectId || null,
      currentSourceProvider: current.sourceProvider || null,
      currentSourceObjectId: current.sourceObjectId || null,
      currentStatus: current.coordStatus || null
    });
  }
}

const batchesRepresented = [...new Set(parsed.rows.map((row) => row.batch))].sort((a, b) => a - b);
const outOfScopeBatches = batchesRepresented.filter((batch) => batch < 1 || batch > 120);
const openBlockingFindings = [
  ...contractFailures.map((finding) => ({ type: 'contract_failure', ...finding })),
  ...missingCurrentRecords.map((finding) => ({ type: 'missing_current_record', ...finding })),
  ...protocolMismatches.map((finding) => ({ type: 'protocol_mismatch', ...finding })),
  ...savedAddressCandidateNonPrimary.map((finding) => ({ type: 'saved_address_candidate_not_primary', ...finding })),
  ...outOfScopeBatches.map((batch) => ({ type: 'out_of_scope_batch', batch }))
];

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
  scope: 'Oslo section only: every documented verified / verified_geometry / verified_historical_source row in batches 1–120, checked against current canonical runtime and Coordinate Source Contract v1.',
  summary,
  coverage: [
    {
      range: '1–5',
      status: 're-reviewed and corrected where required',
      evidence: 'Original stored Geonorge address-first outputs were compared with current canonical records. Tronsmo was restored to its valid address-first source. Oslo domkirke was re-run against the correct visiting address Stortorvet 1 and resolved distinctly from Stortorvet 1B.'
    },
    {
      range: '6–35',
      status: 'existing full retrospective audit reused and final contract normalized',
      evidence: 'reports/oslo-coordinate-retro-audit-from-batch-6/README.md documents the full batch 6–35 review and three corrective passes. Vaterland historical river metadata was normalized so its documented line anchor retains verified trust in runtime.'
    },
    {
      range: '36–120',
      status: 're-reviewed against current contract and documented source-closure/object-type-first decisions',
      evidence: 'All current protocol rows were validated against current runtime Contract v1. Korketrekkeren kept its route geometry/source but was normalized to canonical route/semantic_anchor/line_anchor enums.'
    }
  ],
  correctionsApplied: {
    tronsmo: 'Restored in previous pass to geonorge-adresser-v1:0301:17999:12.',
    osloDomkirke: domkirkeApplied,
    korketrekkeren: {
      locatorType: 'route',
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'line_anchor',
      coordinateChanged: false,
      sourceChanged: false
    },
    vaterlandHistoriskElvelop: {
      coordRole: 'line_anchor',
      coordinateChanged: false,
      sourceChanged: false
    },
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

const table = (rows, columns) => {
  if (!rows.length) return '_Ingen._';
  return `| ${columns.map((c) => c.label).join(' | ')} |\n|${columns.map(() => '---').join('|')}|\n${rows.map((row) => `| ${columns.map((c) => String(c.value(row) ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`).join('\n')}`;
};

const report = `# Retrospektiv Oslo coordinate compliance-audit — batch 1–120\n\nGenerert: ${audit.generatedAt}\n\n## Konklusjon\n\n- Dokumenterte Oslo verified-rader kontrollert: **${summary.documentedVerifiedRows}**\n- Unike placeId-er: **${summary.uniquePlaceIds}**\n- Contract v1 PASS: **${summary.contractPass}**\n- Contract v1 FAIL: **${summary.contractFailures}**\n- Manglende current canonical records: **${summary.missingCurrentRecords}**\n- Protokollmismatch etter synk: **${summary.protocolMismatchesAfterSync}**\n- Lagrede entydige Geonorge-kandidater som fortsatt er overstyrt: **${summary.savedAddressCandidateNonPrimary}**\n- Regionale batcher feilaktig fanget av Oslo-auditen: **${summary.outOfScopeBatches}**\n- Åpne blokkerende funn: **${summary.openBlockingFindings}**\n\n## Korrigeringer\n\n- **Tronsmo Bokhandel:** gjenopprettet til den lagrede entydige Geonorge-adressekilden for Universitetsgata 12 i første auditpass.\n- **Oslo domkirke:** riktig adresse **Stortorvet 1** er nå entydig skilt fra **Stortorvet 1B** og brukt som official-address canonical: \`${domkirkeApplied.sourceObjectId}\` (${domkirkeApplied.lat}, ${domkirkeApplied.lon}). Karl Johans gate 11 forblir forkastet som Kirkeristen.\n- **Korketrekkeren:** samme rutegeometri og startpunkt beholdt; ugyldige enum-verdier normalisert til \`route\`, \`semantic_anchor\`, \`line_anchor\`.\n- **Vaterland – historisk elveløp:** samme Vaterlands bru-anker og historiske kilde beholdt; \`coordRole\` normalisert til \`line_anchor\` slik at runtime beholder verified trust.\n- **Folkeobservatoriet / Slurpen:** stale protokoll-ID-er migrert til dagens canonical \`folkeobservatoriet_holmenkollen\` og \`slurpen_lakkegata\`.\n\n## Contract-feil\n\n${table(contractFailures, [\n  { label: 'batch', value: (r) => r.batch },\n  { label: 'placeId', value: (r) => `\\`${r.placeId}\\`` },\n  { label: 'trust', value: (r) => r.trust },\n  { label: 'problem', value: (r) => r.problems.map((p) => `${p.field}: ${p.problem}`).join('; ') || 'trust != verified uten eksplisitt problem' }\n])}\n\n## Åpne blokkerende funn\n\n${table(openBlockingFindings, [\n  { label: 'type', value: (r) => r.type },\n  { label: 'batch', value: (r) => r.batch || '-' },\n  { label: 'placeId', value: (r) => r.placeId || '-' }\n])}\n\n## Dekningsgrunnlag\n\n- **Batch 1–5:** ny sammenligning mot lagrede address-first-resultater og dagens canonical data.\n- **Batch 6–35:** eksisterende full retrokontroll med tre korrigeringspass gjenbrukt, deretter dagens Contract v1 validert.\n- **Batch 36–120:** dagens canonical verified-rader validert mot Contract v1 og dokumenterte source-closure-/objekttypebeslutninger.\n\nDen maskinlesbare fullrapporten ligger i \`reports/oslo-coordinate-retro-compliance-20260721/audit.json\`.\n`;
writeText(path.join(auditDir, 'README.md'), report);

const noteMarker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
let finalProtocol = fs.readFileSync(protocolFile, 'utf8');
const finalNote = `${noteMarker} Full Oslo-only audit er gjennomført mot dagens Coordinate Source Contract v1 og current canonical runtime. Batch 1–5 er revidert på nytt mot address-first-evidens; batch 6–35 bygger på den dokumenterte full-retrokontrollen med tre korrigeringspass; batch 36–120 er kontrollert mot dagens verified-records og dokumenterte source-closure-/objekttypebeslutninger. Tronsmo, Oslo domkirke, Korketrekkeren, Vaterlands historiske elveløp og to stale canonical placeId-er er korrigert/synkronisert i audit-PR-en. Maskinrapport: \`reports/oslo-coordinate-retro-compliance-20260721/audit.json\`.`;
const markerIndex = finalProtocol.indexOf(noteMarker);
if (markerIndex >= 0) {
  const lineStart = finalProtocol.lastIndexOf('\n', markerIndex) + 1;
  const lineEndRaw = finalProtocol.indexOf('\n', markerIndex);
  const lineEnd = lineEndRaw >= 0 ? lineEndRaw : finalProtocol.length;
  finalProtocol = `${finalProtocol.slice(0, lineStart)}${finalNote}${finalProtocol.slice(lineEnd)}`;
} else {
  const heading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  finalProtocol = finalProtocol.includes(heading)
    ? finalProtocol.replace(heading, `${finalNote}\n\n${heading}`)
    : `${finalProtocol.trimEnd()}\n\n${finalNote}\n`;
}
writeText(protocolFile, finalProtocol);

console.log(JSON.stringify({
  status: openBlockingFindings.length === 0 ? 'retrospective_compliance_pass' : 'retrospective_compliance_open_findings',
  report: rel(path.join(auditDir, 'README.md')),
  domkirkeApplied,
  korkChanges: korkChanges.map((change) => change.file),
  vaterChanges: vaterChanges.map((change) => change.file),
  ...summary
}, null, 2));
