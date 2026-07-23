#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const evidenceRoot = 'data/coordinate-evidence/oslo';
const runtimeIndexFile = 'data/places/places_index.json';
const reportDir = 'reports/oslo-coordinate-protocol-sync-20260723';
const syncMarker = 'Protokollsynk (2026-07-23, post batch 165)';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};

function walkJson(dir) {
  const out = [];
  for (const entry of fs.readdirSync(abs(dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(rel));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(rel);
  }
  return out;
}

function deepFindById(value, id, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return null;
  seen.add(value);
  if (!Array.isArray(value) && value.id === id) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = deepFindById(item, id, seen);
      if (found) return found;
    }
    return null;
  }
  for (const child of Object.values(value)) {
    const found = deepFindById(child, id, seen);
    if (found) return found;
  }
  return null;
}

const isVerified = (status) => typeof status === 'string' && status.startsWith('verified');
const sameNumber = (a, b) => Number.isFinite(Number(a)) && Number.isFinite(Number(b)) && Math.abs(Number(a) - Number(b)) <= 1e-7;

const evidenceByPlace = new Map();
for (const file of walkJson(evidenceRoot)) {
  let evidence;
  try {
    evidence = readJson(file);
  } catch {
    continue;
  }
  const placeId = evidence?.placeId;
  if (!placeId) continue;
  if (evidenceByPlace.has(placeId)) {
    throw new Error(`Duplicate Oslo coordinate evidence for ${placeId}: ${evidenceByPlace.get(placeId).file} and ${file}`);
  }
  evidenceByPlace.set(placeId, { file, evidence });
}

const runtimeIndex = readJson(runtimeIndexFile);
let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
const countMatch = protocol.match(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./);
if (!countMatch) throw new Error('Could not read current Oslo verified count from protocol header');
const verifiedCount = Number(countMatch[1]);

const sectionHeading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const sectionStart = protocol.indexOf(sectionHeading);
if (sectionStart < 0) throw new Error('Could not locate Oslo needs_review section');
const nextHeading = protocol.indexOf('\n## ', sectionStart + sectionHeading.length);
if (nextHeading < 0) throw new Error('Could not locate end of Oslo needs_review section');

const prefix = protocol.slice(0, sectionStart);
let section = protocol.slice(sectionStart, nextHeading);
const suffix = protocol.slice(nextHeading);
const lines = section.split('\n');
const removed = [];
const retained = [];
const inconsistencies = [];

const rowRegex = /^\| `([^`]+)` .*?\| needs_review(?:;[^|]*)? \|/;
const outputLines = [];
for (const line of lines) {
  const match = line.match(rowRegex);
  if (!match) {
    outputLines.push(line);
    continue;
  }

  const placeId = match[1];
  const evidenceEntry = evidenceByPlace.get(placeId);
  if (!evidenceEntry) {
    retained.push({ placeId, reason: 'no_coordinate_evidence_file' });
    outputLines.push(line);
    continue;
  }

  const { file: evidenceFile, evidence } = evidenceEntry;
  const evidenceStatus = evidence?.currentCoordinate?.coordStatus;
  let sourceRecord = null;
  let runtimeRecord = null;
  let sourceError = null;
  try {
    if (evidence?.placeFile && fs.existsSync(abs(evidence.placeFile))) {
      sourceRecord = deepFindById(readJson(evidence.placeFile), placeId);
    } else {
      sourceError = `missing placeFile ${evidence?.placeFile || '(none)'}`;
    }
  } catch (error) {
    sourceError = String(error?.message || error);
  }
  runtimeRecord = deepFindById(runtimeIndex, placeId);

  const evidenceVerified = evidence?.evidenceStatus === 'applied_to_place' && isVerified(evidenceStatus);
  const sourceVerified = isVerified(sourceRecord?.coordStatus);
  const runtimeVerified = isVerified(runtimeRecord?.coordStatus);
  const coordsAgree = sourceRecord && runtimeRecord && evidence?.currentCoordinate
    ? sameNumber(evidence.currentCoordinate.lat, sourceRecord.lat)
      && sameNumber(evidence.currentCoordinate.lon, sourceRecord.lon)
      && sameNumber(sourceRecord.lat, runtimeRecord.lat)
      && sameNumber(sourceRecord.lon, runtimeRecord.lon)
    : false;

  if (evidenceVerified && sourceVerified && runtimeVerified && coordsAgree) {
    removed.push({
      placeId,
      evidenceFile,
      coordStatus: sourceRecord.coordStatus,
      sourceObjectId: sourceRecord.sourceObjectId || sourceRecord.coordSourceId || null,
      lat: sourceRecord.lat,
      lon: sourceRecord.lon,
    });
    continue;
  }

  if (evidenceVerified && (!sourceVerified || !runtimeVerified || !coordsAgree)) {
    inconsistencies.push({
      placeId,
      evidenceFile,
      evidenceStatus,
      sourceStatus: sourceRecord?.coordStatus || null,
      runtimeStatus: runtimeRecord?.coordStatus || null,
      coordsAgree,
      sourceError,
    });
  }

  retained.push({
    placeId,
    reason: evidenceVerified ? 'verified_evidence_but_not_consistent_across_all_layers' : 'still_not_verified_in_evidence',
    evidenceFile,
    evidenceStatus: evidenceStatus || null,
    sourceStatus: sourceRecord?.coordStatus || null,
    runtimeStatus: runtimeRecord?.coordStatus || null,
  });
  outputLines.push(line);
}

if (inconsistencies.length) {
  writeJson(`${reportDir}/inconsistencies.json`, inconsistencies);
  throw new Error(`Protocol sync found ${inconsistencies.length} verified-evidence inconsistencies; refusing to remove rows`);
}

section = outputLines.join('\n');
section = section.replace(
  /Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte canonical Oslo-stedene.`
);

if (!section.includes(syncMarker)) {
  const ids = removed.map((item) => `\`${item.placeId}\``).join(', ');
  section = `${section.trimEnd()}\n\n${syncMarker}: fjernet ${removed.length} stale \`needs_review\`-rader etter trippelkontroll mot dagens koordinat-evidens, canonical source-record og runtime-indeks. Fjernet: ${ids || 'ingen'}. Ingen koordinater eller place-identiteter ble endret.\n`;
}

protocol = `${prefix}${section}${suffix}`;
fs.writeFileSync(abs(protocolFile), protocol);

writeJson(`${reportDir}/result.json`, {
  generatedAt: new Date().toISOString(),
  verifiedCount,
  needsReviewRowsScanned: removed.length + retained.length,
  staleRowsRemoved: removed.length,
  removed,
  retainedRows: retained.length,
  retained,
  invariants: {
    removalRequiresAppliedEvidence: true,
    removalRequiresVerifiedEvidenceStatus: true,
    removalRequiresVerifiedCanonicalSource: true,
    removalRequiresVerifiedRuntimeIndex: true,
    removalRequiresCoordinateAgreementAcrossAllLayers: true,
  },
});

console.log(JSON.stringify({
  verifiedCount,
  needsReviewRowsScanned: removed.length + retained.length,
  staleRowsRemoved: removed.length,
  removed: removed.map((item) => item.placeId),
  retainedRows: retained.length,
}, null, 2));
