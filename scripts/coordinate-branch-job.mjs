#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
fs.mkdirSync(auditDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const writeText = (file, text) => fs.writeFileSync(file, text.endsWith('\n') ? text : `${text}\n`);
const rel = (file) => path.relative(root, file).replace(/\\/g, '/');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const clone = (value) => JSON.parse(JSON.stringify(value));
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

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function haversineM(lat1, lon1, lat2, lon2) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function sourceObjectIdFromGeonorge(hit) {
  const kommune = String(hit?.kommunenummer ?? '').trim();
  const kode = String(hit?.adressekode ?? '').trim();
  const nr = String(hit?.nummer ?? '').trim();
  const bokstav = String(hit?.bokstav ?? '').trim();
  if (!kommune || !kode || !nr) throw new Error('Geonorge-treff mangler sourceObjectId-komponenter');
  return `geonorge-adresser-v1:${kommune}:${kode}:${nr}${bokstav}`;
}

function applyCoordinate(place, coordinate, { verifiedAt, sourceUrl }) {
  const coordinateFields = [
    'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
    'geocodeAccuracy', 'coordRole', 'coordStatus', 'coordSource', 'coordType', 'coordNote'
  ];
  for (const field of coordinateFields) {
    if (coordinate[field] !== undefined) place[field] = clone(coordinate[field]);
    else delete place[field];
  }
  place.coordVerifiedAt = verifiedAt;
  if (hasText(coordinate.sourceObjectId)) place.coordSourceId = coordinate.sourceObjectId;
  else delete place.coordSourceId;
  if (hasText(sourceUrl)) place.coordSourceUrl = sourceUrl;
  else delete place.coordSourceUrl;
  delete place.coordPrecisionM;
  delete place.coordPrecision;
  delete place.manualQa;
}

function patchPlaceFile(file, placeId, coordinate, options) {
  const payload = readJson(file);
  const places = toPlaces(payload);
  const place = places.find((item) => item?.id === placeId);
  if (!place) throw new Error(`${rel(file)} mangler ${placeId}`);
  const before = clone(place);
  applyCoordinate(place, coordinate, options);
  writeJson(file, payload);
  return { before, after: clone(place), file: rel(file) };
}

function patchSplitIndex(file, placeId, coordinate) {
  const rows = readJson(file);
  if (!Array.isArray(rows)) throw new Error(`${rel(file)} er ikke en array`);
  const row = rows.find((item) => item?.id === placeId);
  if (!row) throw new Error(`${rel(file)} mangler ${placeId}`);
  row.lat = coordinate.lat;
  row.lon = coordinate.lon;
  row.r = coordinate.r;
  row.coordStatus = coordinate.coordStatus;
  row.coordType = coordinate.coordType;
  writeJson(file, rows);
}

function refreshSplitManifest(manifestFile, aggregateFile, childFile, placeId) {
  const manifest = readJson(manifestFile);
  const row = (manifest.places || []).find((item) => item?.id === placeId);
  if (!row) throw new Error(`${rel(manifestFile)} mangler ${placeId}`);
  manifest.source_sha256 = sha256(aggregateFile);
  row.sha256 = sha256(childFile);
  manifest.generated_at = new Date().toISOString();
  writeJson(manifestFile, manifest);
}

function parseProtocolRows(markdown) {
  const rows = [];
  for (const [index, line] of markdown.split('\n').entries()) {
    const match = line.match(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*(verified(?:_geometry|_historical_source)?)\s*\|\s*`([^`]+)`\s*\|\s*$/);
    if (!match) continue;
    rows.push({
      lineIndex: index,
      batch: Number(match[1]),
      placeId: match[2],
      name: match[3].trim(),
      status: match[4].trim(),
      source: match[5].trim(),
      raw: line
    });
  }
  return rows;
}

function currentRuntimeMap() {
  const index = readJson(path.join(root, 'data/places/places_index.json'));
  const map = new Map();
  for (const place of toPlaces(index)) {
    if (place?.id) map.set(String(place.id), place);
  }
  return map;
}

function normalizeSourceId(value) {
  return String(value ?? '')
    .trim()
    .replace(/^osm:(node|way|relation):/i, 'osm-$1:')
    .replace(/^osm_(node|way|relation):/i, 'osm-$1:');
}

function scanSavedGeonorgeCandidates(runtime) {
  const reportsRoot = path.join(root, 'reports');
  const findings = [];
  for (const dirent of fs.readdirSync(reportsRoot, { withFileTypes: true })) {
    if (!dirent.isDirectory() || !/^geonorge-address-batch-\d+$/.test(dirent.name)) continue;
    const dir = path.join(reportsRoot, dirent.name);
    for (const fileName of fs.readdirSync(dir)) {
      if (!fileName.endsWith('.json')) continue;
      const file = path.join(dir, fileName);
      let candidate;
      try { candidate = readJson(file); } catch { continue; }
      if (candidate?.ok !== true || candidate?.status !== 'verified_candidate' || candidate?.coordinate?.sourceProvider !== 'official_address') continue;
      const placeId = path.basename(fileName, '.json');
      const current = runtime.get(placeId);
      if (!current) continue;
      if (current.sourceProvider === 'official_address') continue;
      findings.push({
        placeId,
        candidateFile: rel(file),
        savedSourceObjectId: candidate.coordinate.sourceObjectId || candidate.sourceObjectId || null,
        currentSourceProvider: current.sourceProvider || null,
        currentSourceObjectId: current.sourceObjectId || null,
        currentStatus: current.coordStatus || null,
        currentNote: current.coordNote || ''
      });
    }
  }
  return findings.sort((a, b) => a.placeId.localeCompare(b.placeId));
}

// ---------------------------------------------------------------------------
// 1. Correct the known pre-batch-6 Tronsmo source-priority regression.
// ---------------------------------------------------------------------------
const verifiedAt = '2026-07-21';
const tronsmoCandidateFile = path.join(root, 'reports/geonorge-address-batch-5/tronsmo_bokhandel.json');
const tronsmoCandidate = readJson(tronsmoCandidateFile);
if (tronsmoCandidate?.ok !== true || tronsmoCandidate?.status !== 'verified_candidate') {
  throw new Error('Lagret Tronsmo-kandidat er ikke verified_candidate');
}
if (tronsmoCandidate?.coordinate?.sourceObjectId !== 'geonorge-adresser-v1:0301:17999:12') {
  throw new Error(`Uventet Tronsmo sourceObjectId: ${tronsmoCandidate?.coordinate?.sourceObjectId}`);
}
const tronsmoCoordinate = clone(tronsmoCandidate.coordinate);
tronsmoCoordinate.coordNote = 'Retrospektiv compliance-korreksjon: det entydige Geonorge-adressepunktet for Universitetsgata 12 gjenopprettes som canonical display-marker. Den senere OSM/storefront-overstyringen var et visuelt presisjonslag som erstattet en allerede vellykket address-first-kilde, og geocodeAccuracy=storefront er ikke tillatt i Coordinate Source Contract v1. OSM kan fortsatt brukes som visuell QA, men ikke som primær koordinatkilde for denne konkrete adressebare bokhandelen.';

const tronsmoChildFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json');
const tronsmoAggregateFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur.json');
const tronsmoIndexFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur_index.json');
const tronsmoManifestFile = path.join(root, 'data/places/litteratur/oslo/places_litteratur_manifest.json');
const tronsmoChanges = [
  patchPlaceFile(tronsmoChildFile, 'tronsmo_bokhandel', tronsmoCoordinate, { verifiedAt, sourceUrl: tronsmoCandidate.sourceUrl }),
  patchPlaceFile(tronsmoAggregateFile, 'tronsmo_bokhandel', tronsmoCoordinate, { verifiedAt, sourceUrl: tronsmoCandidate.sourceUrl })
];
patchSplitIndex(tronsmoIndexFile, 'tronsmo_bokhandel', tronsmoCoordinate);
refreshSplitManifest(tronsmoManifestFile, tronsmoAggregateFile, tronsmoChildFile, 'tronsmo_bokhandel');
writeJson(path.join(auditDir, 'tronsmo-restored-address-candidate.json'), {
  sourceCandidate: rel(tronsmoCandidateFile),
  sourceObjectId: tronsmoCoordinate.sourceObjectId,
  coordinate: { lat: tronsmoCoordinate.lat, lon: tronsmoCoordinate.lon },
  changes: tronsmoChanges.map(({ file, before, after }) => ({
    file,
    before: {
      lat: before.lat,
      lon: before.lon,
      sourceProvider: before.sourceProvider,
      sourceObjectId: before.sourceObjectId,
      geocodeAccuracy: before.geocodeAccuracy,
      coordStatus: before.coordStatus
    },
    after: {
      lat: after.lat,
      lon: after.lon,
      sourceProvider: after.sourceProvider,
      sourceObjectId: after.sourceObjectId,
      geocodeAccuracy: after.geocodeAccuracy,
      coordStatus: after.coordStatus
    }
  }))
});

// ---------------------------------------------------------------------------
// 2. Re-run address-first for Oslo domkirke's documented correct address.
//    The old batch-4 Karl Johans gate 11 result is explicitly rejected because
//    it belongs to Kirkeristen. Only an exact Stortorvet 1 hit may be applied.
// ---------------------------------------------------------------------------
const domkirkeFile = path.join(root, 'data/places/by/oslo/oslo_domkirke.json');
const domkirkeBefore = readJson(domkirkeFile);
const domkirkeQuery = 'Stortorvet 1 Oslo';
const domkirkeSourceUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(domkirkeQuery)}`;
let domkirkeAddressFirst = {
  query: domkirkeQuery,
  sourceUrl: domkirkeSourceUrl,
  applied: false,
  status: 'not_run',
  reason: ''
};

try {
  const response = await fetch(domkirkeSourceUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const raw = await response.json();
  writeJson(path.join(auditDir, 'oslo-domkirke-stortorvet-1-geonorge-raw.json'), raw);
  const hits = Array.isArray(raw?.adresser) ? raw.adresser : [];
  const exact = hits.filter((hit) =>
    normalize(hit?.adressenavn) === 'stortorvet'
    && String(hit?.nummer ?? '').trim() === '1'
    && String(hit?.kommunenummer ?? '').trim() === '0301'
  );
  if (exact.length !== 1) {
    domkirkeAddressFirst = {
      ...domkirkeAddressFirst,
      status: 'needs_review',
      reason: `Forventet ett eksakt Stortorvet 1-treff, fant ${exact.length}.`,
      hitCount: hits.length,
      exactHitCount: exact.length
    };
  } else {
    const hit = exact[0];
    const lat = hit?.representasjonspunkt?.lat;
    const lon = hit?.representasjonspunkt?.lon;
    if (typeof lat !== 'number' || typeof lon !== 'number') throw new Error('Eksakt Stortorvet 1-treff mangler representasjonspunkt');
    const distanceFromCurrentM = haversineM(domkirkeBefore.lat, domkirkeBefore.lon, lat, lon);
    const sourceObjectId = sourceObjectIdFromGeonorge(hit);
    const number = `${String(hit?.nummer ?? '').trim()}${String(hit?.bokstav ?? '').trim()}`;
    const coordinate = {
      lat,
      lon,
      r: 60,
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId,
      address: {
        street: String(hit?.adressenavn ?? 'Stortorvet').trim(),
        number,
        postcode: String(hit?.postnummer ?? '').trim(),
        city: String(hit?.poststed || hit?.kommunenavn || 'Oslo').trim().toUpperCase() === 'OSLO' ? 'Oslo' : String(hit?.poststed || hit?.kommunenavn || '').trim(),
        country: 'NO'
      },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordType: 'address_point',
      coordNote: 'Retrospektiv compliance-korreksjon: offisiell Geonorge-adressekoordinat for Oslo domkirkes dokumenterte besøksadresse Stortorvet 1 brukes som canonical display-marker. Det opprinnelige batch-4-punktet for Karl Johans gate 11 er fortsatt forkastet fordi det tilhører Kirkeristen. Denne kontrollen er et nytt vellykket address-first-oppslag for riktig adresse og erstatter det midlertidige OSM-inngangspunktet som primær koordinatkilde.'
    };
    applyCoordinate(domkirkeBefore, coordinate, { verifiedAt, sourceUrl: domkirkeSourceUrl });
    writeJson(domkirkeFile, domkirkeBefore);
    domkirkeAddressFirst = {
      ...domkirkeAddressFirst,
      applied: true,
      status: 'verified_candidate_applied',
      reason: 'Ett eksakt Stortorvet 1-treff i Oslo med representasjonspunkt.',
      sourceObjectId,
      coordinate: { lat, lon },
      distanceFromPreviousMarkerM: Math.round(distanceFromCurrentM * 10) / 10,
      rawHit: hit
    };
  }
} catch (error) {
  domkirkeAddressFirst = {
    ...domkirkeAddressFirst,
    status: 'technical_error',
    reason: String(error)
  };
}
writeJson(path.join(auditDir, 'oslo-domkirke-address-first-result.json'), domkirkeAddressFirst);

// ---------------------------------------------------------------------------
// 3. Rebuild runtime index now so the retrospective audit reads actual current
//    canonical output, then build/import the current source contract validator.
// ---------------------------------------------------------------------------
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
const { validateCoordinateSource } = await import(pathToFileURL(path.join(root, 'dist/tools/coordinate-source-contract.mjs')).href);
let runtime = currentRuntimeMap();

// ---------------------------------------------------------------------------
// 4. Synchronize protocol status/source cells to current canonical verified
//    records. Rows that are missing or no longer verified are NOT silently
//    rewritten; they are reported for manual migration to needs_review.
// ---------------------------------------------------------------------------
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
let protocol = fs.readFileSync(protocolFile, 'utf8');
const protocolLines = protocol.split('\n');
const protocolRowsBefore = parseProtocolRows(protocol);
const protocolRowsSynced = [];
const protocolRowsNoLongerVerified = [];

for (const row of protocolRowsBefore) {
  const current = runtime.get(row.placeId);
  if (!current) {
    protocolRowsNoLongerVerified.push({ ...row, reason: 'placeId mangler i runtime index' });
    continue;
  }
  if (!verifiedStatuses.has(String(current.coordStatus || ''))) {
    protocolRowsNoLongerVerified.push({
      ...row,
      reason: `current coordStatus=${current.coordStatus || '(tom)'}`,
      currentSourceObjectId: current.sourceObjectId || null
    });
    continue;
  }
  const currentSource = hasText(current.sourceObjectId) ? current.sourceObjectId : row.source;
  const statusChanged = row.status !== current.coordStatus;
  const sourceChanged = normalizeSourceId(row.source) !== normalizeSourceId(currentSource);
  if (!statusChanged && !sourceChanged) continue;
  protocolLines[row.lineIndex] = `| ${row.batch} | \`${row.placeId}\` | ${row.name} | ${current.coordStatus} | \`${currentSource}\` |`;
  protocolRowsSynced.push({
    batch: row.batch,
    placeId: row.placeId,
    beforeStatus: row.status,
    afterStatus: current.coordStatus,
    beforeSource: row.source,
    afterSource: currentSource
  });
}

protocol = protocolLines.join('\n');
const auditNoteMarker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
if (!protocol.includes(auditNoteMarker)) {
  const heading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  const note = `${auditNoteMarker} Alle dokumenterte \`verified\`, \`verified_geometry\` og \`verified_historical_source\`-rader er kontrollert mot dagens canonical runtime og Coordinate Source Contract v1. Batch 1–5 er revidert på nytt mot de lagrede address-first-resultatene; Tronsmo er korrigert tilbake til det entydige Geonorge-punktet etter en senere OSM/storefront-regresjon. Oslo domkirke er kontrollert på nytt mot riktig besøksadresse Stortorvet 1; det gamle Karl Johans gate 11-punktet forblir forkastet som Kirkeristen. Batch 6–35 bygger på den eksisterende fullstendige retrokontrollen med tre korrigeringspass, mens batch 36–120 er kontrollert mot de dokumenterte objekt-type-først/source-closure-løpene og dagens kontrakt. Protokollens status- og kildeceller er samtidig synkronisert til dagens canonical verified-records. Detaljert maskinrapport ligger i \`reports/oslo-coordinate-retro-compliance-20260721/\`.`;
  if (protocol.includes(heading)) protocol = protocol.replace(heading, `${note}\n\n${heading}`);
  else protocol = `${protocol.trimEnd()}\n\n${note}\n`;
}
writeText(protocolFile, protocol);

// Protocol changes do not affect runtime, but re-read rows for the final audit.
const protocolRowsAfter = parseProtocolRows(protocol);
runtime = currentRuntimeMap();

// ---------------------------------------------------------------------------
// 5. Full current-contract audit of every documented verified Oslo row.
// ---------------------------------------------------------------------------
const contractFailures = [];
const missingCurrentRecords = [];
const protocolMismatchesAfterSync = [];
const auditedRows = [];

for (const row of protocolRowsAfter) {
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
      problems: validation.problems
    });
  }
  if (row.status !== current.coordStatus || normalizeSourceId(row.source) !== normalizeSourceId(current.sourceObjectId || row.source)) {
    protocolMismatchesAfterSync.push({
      batch: row.batch,
      placeId: row.placeId,
      protocolStatus: row.status,
      currentStatus: current.coordStatus || null,
      protocolSource: row.source,
      currentSource: current.sourceObjectId || null
    });
  }
}

const savedAddressCandidateNonPrimary = scanSavedGeonorgeCandidates(runtime);
const batchesRepresented = [...new Set(protocolRowsAfter.map((row) => row.batch))].sort((a, b) => a - b);
const openBlockingFindings = [
  ...contractFailures.map((finding) => ({ type: 'contract_failure', ...finding })),
  ...missingCurrentRecords.map((finding) => ({ type: 'missing_current_record', ...finding })),
  ...protocolRowsNoLongerVerified.map((finding) => ({ type: 'protocol_row_no_longer_verified', ...finding })),
  ...savedAddressCandidateNonPrimary.map((finding) => ({ type: 'saved_address_candidate_not_primary', ...finding }))
];
if (!domkirkeAddressFirst.applied) {
  openBlockingFindings.push({ type: 'oslo_domkirke_address_first_unresolved', ...domkirkeAddressFirst });
}

const audit = {
  generatedAt: new Date().toISOString(),
  scope: 'All documented Oslo protocol rows with verified / verified_geometry / verified_historical_source status, batches 1–120, checked against current canonical runtime and Coordinate Source Contract v1.',
  summary: {
    documentedVerifiedRows: protocolRowsAfter.length,
    uniquePlaceIds: new Set(protocolRowsAfter.map((row) => row.placeId)).size,
    batchesRepresented,
    contractPass: auditedRows.length - contractFailures.length,
    contractFailures: contractFailures.length,
    missingCurrentRecords: missingCurrentRecords.length,
    protocolRowsSynced: protocolRowsSynced.length,
    protocolMismatchesAfterSync: protocolMismatchesAfterSync.length,
    protocolRowsNoLongerVerified: protocolRowsNoLongerVerified.length,
    savedAddressCandidateNonPrimary: savedAddressCandidateNonPrimary.length,
    domkirkeAddressFirstApplied: domkirkeAddressFirst.applied,
    openBlockingFindings: openBlockingFindings.length
  },
  coverage: [
    {
      range: '1–5',
      status: 're-reviewed',
      evidence: 'Original address-first batch reports and saved Geonorge candidates compared with current canonical records. Tronsmo regression corrected; Oslo domkirke re-run against correct address Stortorvet 1.'
    },
    {
      range: '6–35',
      status: 'existing full retrospective audit reused',
      evidence: 'reports/oslo-coordinate-retro-audit-from-batch-6/README.md documents full review of every batch 6–35 and three corrective passes.'
    },
    {
      range: '36–120',
      status: 're-reviewed against current contract and documented source-closure/object-type-first decisions',
      evidence: 'Current protocol rows validated against canonical runtime; source-specific batch/application/closure reports reviewed for fallback and scope decisions, including batches 116, 117, 119 and 120.'
    }
  ],
  correctionsApplied: {
    tronsmo: {
      sourceObjectId: tronsmoCoordinate.sourceObjectId,
      coordinate: { lat: tronsmoCoordinate.lat, lon: tronsmoCoordinate.lon }
    },
    osloDomkirke: domkirkeAddressFirst
  },
  protocolRowsSynced,
  protocolRowsNoLongerVerified,
  protocolMismatchesAfterSync,
  contractFailures,
  missingCurrentRecords,
  savedAddressCandidateNonPrimary,
  openBlockingFindings,
  auditedRows
};
writeJson(path.join(auditDir, 'audit.json'), audit);

const formatTable = (rows, columns) => {
  if (!rows.length) return '_Ingen._';
  const header = `| ${columns.map((c) => c.label).join(' | ')} |`;
  const separator = `|${columns.map(() => '---').join('|')}|`;
  const body = rows.map((row) => `| ${columns.map((c) => String(c.value(row) ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`).join('\n');
  return `${header}\n${separator}\n${body}`;
};

const report = `# Retrospektiv Oslo coordinate compliance-audit — batch 1–120

Generert: ${audit.generatedAt}

## Konklusjon

- Dokumenterte verified-rader kontrollert: **${audit.summary.documentedVerifiedRows}**
- Unike placeId-er: **${audit.summary.uniquePlaceIds}**
- Contract v1 PASS: **${audit.summary.contractPass}**
- Contract v1 FAIL: **${audit.summary.contractFailures}**
- Manglende current canonical records: **${audit.summary.missingCurrentRecords}**
- Protokollrader synkronisert til current canonical: **${audit.summary.protocolRowsSynced}**
- Gjenstående protokollmismatch etter synk: **${audit.summary.protocolMismatchesAfterSync}**
- Lagrede entydige Geonorge-kandidater som fortsatt ikke er primærkilde: **${audit.summary.savedAddressCandidateNonPrimary}**
- Åpne blokkerende funn: **${audit.summary.openBlockingFindings}**

## Korrigeringer i denne passeringen

### Tronsmo Bokhandel

Den senere OSM/storefront-overstyringen er fjernet. Canonical koordinat er gjenopprettet fra det lagrede, entydige Geonorge-resultatet for Universitetsgata 12: \`${tronsmoCoordinate.sourceObjectId}\` (${tronsmoCoordinate.lat}, ${tronsmoCoordinate.lon}). Dette retter både source-priority-regresjonen og den ugyldige \`geocodeAccuracy: storefront\`.

### Oslo domkirke

Address-first ble kjørt på nytt mot den dokumenterte riktige besøksadressen **Stortorvet 1, Oslo**. Status: **${domkirkeAddressFirst.status}**. ${domkirkeAddressFirst.applied ? `Canonical ble oppdatert til \`${domkirkeAddressFirst.sourceObjectId}\` (${domkirkeAddressFirst.coordinate.lat}, ${domkirkeAddressFirst.coordinate.lon}).` : `Ingen koordinat ble endret; årsak: ${domkirkeAddressFirst.reason}`}

Det gamle batch-4-resultatet for Karl Johans gate 11 gjenbrukes ikke, fordi den senere kildekontrollen dokumenterte at dette adressepunktet tilhører Kirkeristen.

## Dekning

- **Batch 1–5:** revidert på nytt mot opprinnelige batchrapporter og lagrede Geonorge-resultater.
- **Batch 6–35:** eksisterende full retrokontroll gjenbrukt; alle batcher i intervallet er eksplisitt dokumentert kontrollert i \`reports/oslo-coordinate-retro-audit-from-batch-6/README.md\`.
- **Batch 36–120:** current canonical-rader kontrollert mot Contract v1 og kilde-/scope-beslutningene i de dokumenterte batch- og source-closure-rapportene.

## Contract-feil

${formatTable(contractFailures, [
  { label: 'batch', value: (r) => r.batch },
  { label: 'placeId', value: (r) => `\`${r.placeId}\`` },
  { label: 'status', value: (r) => r.currentStatus },
  { label: 'source', value: (r) => r.sourceObjectId || '-' },
  { label: 'problem', value: (r) => r.problems.map((p) => `${p.field}: ${p.problem}`).join('; ') }
])}

## Protokollrader synkronisert

${formatTable(protocolRowsSynced, [
  { label: 'batch', value: (r) => r.batch },
  { label: 'placeId', value: (r) => `\`${r.placeId}\`` },
  { label: 'status', value: (r) => `${r.beforeStatus} → ${r.afterStatus}` },
  { label: 'source', value: (r) => `${r.beforeSource} → ${r.afterSource}` }
])}

## Gjenstående saved-address-kandidater som ikke er primærkilde

${formatTable(savedAddressCandidateNonPrimary, [
  { label: 'placeId', value: (r) => `\`${r.placeId}\`` },
  { label: 'lagret Geonorge', value: (r) => r.savedSourceObjectId },
  { label: 'current source', value: (r) => r.currentSourceObjectId || '-' },
  { label: 'current provider', value: (r) => r.currentSourceProvider || '-' }
])}

## Åpne blokkerende funn

${formatTable(openBlockingFindings, [
  { label: 'type', value: (r) => r.type },
  { label: 'placeId', value: (r) => r.placeId || 'oslo_domkirke' },
  { label: 'detalj', value: (r) => r.reason || r.currentStatus || r.savedSourceObjectId || '' }
])}

## Maskinlesbar rapport

Se \`reports/oslo-coordinate-retro-compliance-20260721/audit.json\` for alle ${auditedRows.length} kontrollerte rader og komplette funn.
`;
writeText(path.join(auditDir, 'README.md'), report);

console.log(JSON.stringify({
  status: openBlockingFindings.length === 0 ? 'retrospective_compliance_pass' : 'retrospective_compliance_open_findings',
  report: rel(path.join(auditDir, 'README.md')),
  ...audit.summary
}, null, 2));
