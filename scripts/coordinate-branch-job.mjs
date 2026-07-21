#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
const auditFile = path.join(auditDir, 'audit.json');
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const batch120Ids = ['holmenkollen_skimuseum'];
const batch121Ids = [
  'bislett_stadion',
  'ullevaal_stadion',
  'intility_arena',
  'jordal_amfi',
  'holmenkollen_nasjonalanlegg',
  'frogner_stadion',
  'valle_hovin_stadion',
  'ekebergsletta',
  'vallhall_arena',
  'manglerudhallen',
  'furuset_forum'
];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : payload?.id
        ? [payload]
        : [];

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

function isOsloSourceFile(sourceFile) {
  const value = String(sourceFile || '').replace(/\\/g, '/').toLowerCase();
  return /(^|\/)(?:places_)?oslo(?:\/|_|$)/.test(value);
}

function rowFor(batch, place) {
  if (!place) throw new Error('Mangler runtime place for batch ' + batch);
  if (!verifiedStatuses.has(String(place.coordStatus || ''))) {
    throw new Error(place.id + ' er ikke verified i current runtime');
  }
  if (!place.sourceObjectId) throw new Error(place.id + ' mangler sourceObjectId');
  return '| ' + batch + ' | `' + place.id + '` | ' + place.name + ' | ' + place.coordStatus + ' | `' + place.sourceObjectId + '` |';
}

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
const validateCoordinateSource = (await import(pathToFileURL(path.join(root, 'dist/tools/coordinate-source-contract.mjs')).href)).validateCoordinateSource;
const runtime = toPlaces(readJson(path.join(root, 'data/places/places_index.json')));
const byId = new Map(runtime.filter((place) => place?.id).map((place) => [String(place.id), place]));

// Add missing protocol rows for batches that were documented in prose/reports
// but not entered into the main verified table.
let protocol = fs.readFileSync(protocolFile, 'utf8');
const additions = [];
for (const id of batch120Ids) {
  if (!protocol.includes('`' + id + '`')) additions.push(rowFor(120, byId.get(id)));
}
for (const id of batch121Ids) {
  if (!protocol.includes('`' + id + '`')) additions.push(rowFor(121, byId.get(id)));
}
if (additions.length) {
  const marker = 'Batch 119 (2026-07-21) er korrigert til objekt-type-først/address-first-metoden.';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Fant ikke Batch 119-markør for protokollinnsetting');
  const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
  protocol = protocol.slice(0, lineStart) + additions.join('\n') + '\n\n' + protocol.slice(lineStart);
  writeText(protocolFile, protocol);
}

const parsed = parseOsloRows(fs.readFileSync(protocolFile, 'utf8'));
const protocolById = new Map(parsed.rows.map((row) => [row.placeId, row]));

const currentOsloVerified = runtime
  .filter((place) => verifiedStatuses.has(String(place.coordStatus || '')) && isOsloSourceFile(place.sourceFile))
  .sort((a, b) => String(a.id).localeCompare(String(b.id)));

const currentSetContractFailures = [];
for (const place of currentOsloVerified) {
  const result = validateCoordinateSource(place);
  if (result.trust !== 'verified') {
    currentSetContractFailures.push({
      placeId: place.id,
      name: place.name,
      sourceFile: place.sourceFile,
      coordStatus: place.coordStatus,
      sourceProvider: place.sourceProvider || null,
      sourceObjectId: place.sourceObjectId || null,
      trust: result.trust,
      problems: result.problems
    });
  }
}

const currentVerifiedMissingFromProtocol = currentOsloVerified
  .filter((place) => !protocolById.has(String(place.id)))
  .map((place) => ({
    placeId: place.id,
    name: place.name,
    sourceFile: place.sourceFile,
    coordStatus: place.coordStatus,
    sourceObjectId: place.sourceObjectId || null
  }));

const protocolVerifiedMissingFromCurrentOsloSet = parsed.rows
  .filter((row) => {
    const place = byId.get(row.placeId);
    return !place || !verifiedStatuses.has(String(place.coordStatus || '')) || !isOsloSourceFile(place.sourceFile);
  })
  .map((row) => ({
    batch: row.batch,
    placeId: row.placeId,
    name: row.name,
    currentSourceFile: byId.get(row.placeId)?.sourceFile || null,
    currentStatus: byId.get(row.placeId)?.coordStatus || null
  }));

const duplicateProtocolIds = [];
const seen = new Set();
for (const row of parsed.rows) {
  if (seen.has(row.placeId)) duplicateProtocolIds.push(row.placeId);
  seen.add(row.placeId);
}

const openFindings = [];
for (const item of currentSetContractFailures) openFindings.push({ type: 'current_oslo_verified_contract_failure', ...item });
for (const item of currentVerifiedMissingFromProtocol) openFindings.push({ type: 'current_oslo_verified_missing_from_protocol', ...item });
for (const item of protocolVerifiedMissingFromCurrentOsloSet) openFindings.push({ type: 'protocol_verified_missing_from_current_oslo_set', ...item });
for (const placeId of duplicateProtocolIds) openFindings.push({ type: 'duplicate_protocol_place_id', placeId });

const audit = readJson(auditFile);
audit.currentSetCompleteness = {
  currentOsloVerifiedRecords: currentOsloVerified.length,
  protocolVerifiedRows: parsed.rows.length,
  currentSetContractPass: currentOsloVerified.length - currentSetContractFailures.length,
  currentSetContractFailures: currentSetContractFailures.length,
  currentVerifiedMissingFromProtocol: currentVerifiedMissingFromProtocol.length,
  protocolVerifiedMissingFromCurrentOsloSet: protocolVerifiedMissingFromCurrentOsloSet.length,
  duplicateProtocolIds: duplicateProtocolIds.length,
  rowsAddedForPreviouslyUndocumentedBatches: additions.length,
  openFindings: openFindings.length
};
audit.currentSetContractFailures = currentSetContractFailures;
audit.currentVerifiedMissingFromProtocol = currentVerifiedMissingFromProtocol;
audit.protocolVerifiedMissingFromCurrentOsloSet = protocolVerifiedMissingFromCurrentOsloSet;
audit.duplicateProtocolIds = duplicateProtocolIds;
audit.currentSetOpenFindings = openFindings;
audit.currentSetAuditedRows = currentOsloVerified.map((place) => ({
  placeId: place.id,
  name: place.name,
  sourceFile: place.sourceFile,
  coordStatus: place.coordStatus,
  sourceProvider: place.sourceProvider || null,
  sourceObjectId: place.sourceObjectId || null,
  protocolBatch: protocolById.get(String(place.id))?.batch || null
}));
writeJson(auditFile, audit);

const completenessFile = path.join(auditDir, 'current-oslo-verified-completeness.json');
writeJson(completenessFile, {
  generatedAt: new Date().toISOString(),
  scopeRule: 'Current runtime records with verified* status whose active sourceFile is in an Oslo-named source path.',
  summary: audit.currentSetCompleteness,
  rowsAdded: additions,
  currentSetContractFailures,
  currentVerifiedMissingFromProtocol,
  protocolVerifiedMissingFromCurrentOsloSet,
  duplicateProtocolIds,
  openFindings
});

const readmeFile = path.join(auditDir, 'README.md');
let readme = fs.readFileSync(readmeFile, 'utf8');
const completenessSection = [
  '',
  '## Current Oslo verified-sett - fullstendighet',
  '',
  '- Aktive verified* records fra Oslo-kilder: **' + currentOsloVerified.length + '**',
  '- Protokollrader med verified*: **' + parsed.rows.length + '**',
  '- Current-sett Contract v1 FAIL: **' + currentSetContractFailures.length + '**',
  '- Current verified mangler i protokollen: **' + currentVerifiedMissingFromProtocol.length + '**',
  '- Protokoll verified mangler i current Oslo-sett: **' + protocolVerifiedMissingFromCurrentOsloSet.length + '**',
  '- Duplikate placeId-er i protokollen: **' + duplicateProtocolIds.length + '**',
  '- Rader lagt inn for tidligere prose-only batcher: **' + additions.length + '**',
  '- Åpne fullstendighetsfunn: **' + openFindings.length + '**',
  '',
  'Maskinrapport: `reports/oslo-coordinate-retro-compliance-20260721/current-oslo-verified-completeness.json`.'
].join('\n');
if (!readme.includes('## Current Oslo verified-sett - fullstendighet')) readme = readme.trimEnd() + '\n' + completenessSection + '\n';
writeText(readmeFile, readme);

const noteMarker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
let finalProtocol = fs.readFileSync(protocolFile, 'utf8');
const noteIndex = finalProtocol.indexOf(noteMarker);
if (noteIndex >= 0) {
  const lineStart = finalProtocol.lastIndexOf('\n', noteIndex) + 1;
  const nextNewline = finalProtocol.indexOf('\n', noteIndex);
  const lineEnd = nextNewline >= 0 ? nextNewline : finalProtocol.length;
  const note = noteMarker + ' Full audit er gjennomført både mot protokollradene og mot det komplette current verified*-settet fra aktive Oslo-kilder. Protokollradene for batch 120 og 121 er etterført, og current-sett/fullstendighetskontrollen ligger i `reports/oslo-coordinate-retro-compliance-20260721/current-oslo-verified-completeness.json`.';
  finalProtocol = finalProtocol.slice(0, lineStart) + note + finalProtocol.slice(lineEnd);
  writeText(protocolFile, finalProtocol);
}

console.log(JSON.stringify({
  status: openFindings.length === 0 ? 'current_oslo_verified_set_complete' : 'current_oslo_verified_set_has_findings',
  ...audit.currentSetCompleteness,
  missingIds: currentVerifiedMissingFromProtocol.map((item) => item.placeId),
  staleProtocolIds: protocolVerifiedMissingFromCurrentOsloSet.map((item) => item.placeId),
  contractFailureIds: currentSetContractFailures.map((item) => item.placeId)
}, null, 2));

if (openFindings.length > 0) {
  throw new Error('Current Oslo verified-sett har ' + openFindings.length + ' åpne fullstendighets-/contractfunn.');
}
