#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const batch120Ids = ['holmenkollen_skimuseum'];
const batch121Ids = ['bislett_stadion','ullevaal_stadion','intility_arena','jordal_amfi','holmenkollen_nasjonalanlegg','frogner_stadion','valle_hovin_stadion','ekebergsletta','vallhall_arena','manglerudhallen','furuset_forum'];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const toPlaces = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : Array.isArray(payload?.items) ? payload.items : payload?.id ? [payload] : [];

function parseOsloRows(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Oslo');
  if (start < 0) throw new Error('Fant ikke ## Oslo');
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i]) && lines[i].trim() !== '## Oslo') { end = i; break; }
  }
  const rows = [];
  for (let i = start; i < end; i++) {
    const match = lines[i].match(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*(verified(?:_geometry|_historical_source)?)\s*\|\s*`([^`]+)`\s*\|\s*$/);
    if (match) rows.push({ batch: Number(match[1]), placeId: match[2], name: match[3].trim(), status: match[4], source: match[5] });
  }
  return rows;
}

function isOsloSourceFile(sourceFile) {
  return /(^|\/)(?:places_)?oslo(?:\/|_|$)/.test(String(sourceFile || '').replace(/\\/g, '/').toLowerCase());
}

function rowFor(batch, place) {
  return '| ' + batch + ' | `' + place.id + '` | ' + place.name + ' | ' + place.coordStatus + ' | `' + place.sourceObjectId + '` |';
}

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
const validateCoordinateSource = (await import(pathToFileURL(path.join(root, 'dist/tools/coordinate-source-contract.mjs')).href)).validateCoordinateSource;
const runtime = toPlaces(readJson(path.join(root, 'data/places/places_index.json')));
const byId = new Map(runtime.filter((p) => p?.id).map((p) => [String(p.id), p]));

let protocol = fs.readFileSync(protocolFile, 'utf8');
const rowsToAdd = [];
for (const id of batch120Ids) if (!protocol.includes('`' + id + '`')) rowsToAdd.push(rowFor(120, byId.get(id)));
for (const id of batch121Ids) if (!protocol.includes('`' + id + '`')) rowsToAdd.push(rowFor(121, byId.get(id)));
if (rowsToAdd.length) {
  const marker = 'Batch 119 (2026-07-21) er korrigert til objekt-type-først/address-first-metoden.';
  const idx = protocol.indexOf(marker);
  if (idx < 0) throw new Error('Fant ikke Batch 119-markøren');
  const lineStart = protocol.lastIndexOf('\n', idx) + 1;
  protocol = protocol.slice(0, lineStart) + rowsToAdd.join('\n') + '\n\n' + protocol.slice(lineStart);
  writeText(protocolFile, protocol);
}

const protocolRows = parseOsloRows(fs.readFileSync(protocolFile, 'utf8'));
const protocolIds = new Set(protocolRows.map((row) => row.placeId));
const currentOsloVerified = runtime.filter((place) => verifiedStatuses.has(String(place.coordStatus || '')) && isOsloSourceFile(place.sourceFile));

const contractFailures = [];
const missingFromProtocol = [];
for (const place of currentOsloVerified) {
  const result = validateCoordinateSource(place);
  if (result.trust !== 'verified') {
    contractFailures.push({
      placeId: place.id,
      name: place.name,
      sourceFile: place.sourceFile,
      lat: place.lat,
      lon: place.lon,
      r: place.r,
      locatorType: place.locatorType || null,
      sourceProvider: place.sourceProvider || null,
      sourceObjectId: place.sourceObjectId || null,
      geocodeAccuracy: place.geocodeAccuracy || null,
      coordRole: place.coordRole || null,
      coordType: place.coordType || null,
      coordStatus: place.coordStatus || null,
      coordSource: place.coordSource || null,
      coordNote: place.coordNote || null,
      trust: result.trust,
      problems: result.problems
    });
  }
  if (!protocolIds.has(String(place.id))) {
    missingFromProtocol.push({
      placeId: place.id,
      name: place.name,
      sourceFile: place.sourceFile,
      lat: place.lat,
      lon: place.lon,
      locatorType: place.locatorType || null,
      sourceProvider: place.sourceProvider || null,
      sourceObjectId: place.sourceObjectId || null,
      geocodeAccuracy: place.geocodeAccuracy || null,
      coordRole: place.coordRole || null,
      coordType: place.coordType || null,
      coordStatus: place.coordStatus || null,
      coordSource: place.coordSource || null,
      coordNote: place.coordNote || null,
      contractTrust: validateCoordinateSource(place).trust
    });
  }
}

const staleProtocol = protocolRows.filter((row) => {
  const place = byId.get(row.placeId);
  return !place || !verifiedStatuses.has(String(place.coordStatus || '')) || !isOsloSourceFile(place.sourceFile);
});

const byProvider = {};
for (const place of missingFromProtocol) {
  const key = String(place.sourceProvider || '(missing)');
  byProvider[key] = (byProvider[key] || 0) + 1;
}
const byLocatorType = {};
for (const place of missingFromProtocol) {
  const key = String(place.locatorType || '(missing)');
  byLocatorType[key] = (byLocatorType[key] || 0) + 1;
}

const worklist = {
  generatedAt: new Date().toISOString(),
  summary: {
    currentOsloVerifiedRecords: currentOsloVerified.length,
    protocolVerifiedRows: protocolRows.length,
    contractFailures: contractFailures.length,
    missingFromProtocol: missingFromProtocol.length,
    staleProtocolRows: staleProtocol.length,
    rowsAddedForBatch120And121: rowsToAdd.length
  },
  missingFromProtocolBreakdown: { byProvider, byLocatorType },
  contractFailures: contractFailures.sort((a, b) => String(a.placeId).localeCompare(String(b.placeId))),
  missingFromProtocol: missingFromProtocol.sort((a, b) => String(a.placeId).localeCompare(String(b.placeId))),
  staleProtocolRows: staleProtocol
};
writeJson(path.join(auditDir, 'current-oslo-verified-worklist.json'), worklist);

const lines = [
  '# Current Oslo verified compliance worklist',
  '',
  'Generert: ' + worklist.generatedAt,
  '',
  '- Current Oslo verified*: **' + worklist.summary.currentOsloVerifiedRecords + '**',
  '- Verified-rader i protokollen: **' + worklist.summary.protocolVerifiedRows + '**',
  '- Contract trust != verified: **' + worklist.summary.contractFailures + '**',
  '- Current verified som mangler i protokollen: **' + worklist.summary.missingFromProtocol + '**',
  '- Stale verified-rader i protokollen: **' + worklist.summary.staleProtocolRows + '**',
  '- Batch 120/121-rader lagt inn i denne passeringen: **' + worklist.summary.rowsAddedForBatch120And121 + '**',
  '',
  '## Mangler i protokollen per sourceProvider',
  '',
  '```json',
  JSON.stringify(byProvider, null, 2),
  '```',
  '',
  '## Mangler i protokollen per locatorType',
  '',
  '```json',
  JSON.stringify(byLocatorType, null, 2),
  '```',
  '',
  'Detaljer: `reports/oslo-coordinate-retro-compliance-20260721/current-oslo-verified-worklist.json`.'
];
writeText(path.join(auditDir, 'CURRENT_SET_WORKLIST.md'), lines.join('\n'));

console.log(JSON.stringify({
  status: 'worklist_materialized',
  ...worklist.summary,
  contractFailureIds: contractFailures.map((item) => item.placeId),
  missingIds: missingFromProtocol.map((item) => item.placeId)
}, null, 2));

fs.unlinkSync(new URL(import.meta.url));
