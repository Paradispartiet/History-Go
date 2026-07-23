#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DATE = '2026-07-23';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const runtimeIndexFile = 'data/places/places_index.json';
const reportDir = 'reports/oslo-coordinate-unresolved-protocol-sync-post-176';
const abs = (file) => path.join(root, file);
const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : [payload];

const runtimePayload = JSON.parse(fs.readFileSync(abs(runtimeIndexFile), 'utf8'));
const active = new Map();
for (const place of toPlaces(runtimePayload)) {
  if (place?.id) active.set(String(place.id), place);
}

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1])).filter(Number.isFinite);
const maxBatch = Math.max(...batches);
if (maxBatch !== 176) throw new Error(`Expected current Oslo coordinate max batch 176, got ${maxBatch}. Rebase before protocol sync.`);

const heading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const sectionStart = protocol.indexOf(heading);
if (sectionStart < 0) throw new Error('Unresolved Oslo protocol heading not found');
let sectionEnd = protocol.indexOf('\n## Etne – historiesett', sectionStart);
if (sectionEnd < 0) sectionEnd = protocol.length;
const section = protocol.slice(sectionStart, sectionEnd);
const candidateRows = [...section.matchAll(/^\|\s*`([^`]+)`[^\n]*$/gm)].map((match) => ({ id: match[1], row: match[0] }));
if (!candidateRows.length) throw new Error('No unresolved candidate rows found');

const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const removed = [];
const kept = [];
let updatedSection = section;
for (const candidate of candidateRows) {
  const place = active.get(candidate.id) ?? null;
  const status = String(place?.coordStatus ?? 'missing_from_active_runtime');
  if (!place || verifiedStatuses.has(status)) {
    updatedSection = updatedSection.replace(`${candidate.row}\n`, '').replace(candidate.row, '');
    removed.push({
      id: candidate.id,
      reason: !place ? 'not_in_active_runtime_index' : 'active_place_now_verified',
      coordStatus: status,
      name: place?.name ?? null,
      category: place?.category ?? null
    });
  } else {
    kept.push({ id: candidate.id, coordStatus: status, name: place.name ?? null, category: place.category ?? null });
  }
}

const note = removed.length
  ? `\nProtokollsynk (${DATE}, post batch 176): fjernet ${removed.length} stale unresolved-rader etter kontroll mot dagens aktive runtime-indeks. Fjernet: ${removed.map((row) => `\`${row.id}\``).join(', ')}. Ingen koordinater eller place-identiteter ble endret i denne synken.\n`
  : `\nProtokollsynk (${DATE}, post batch 176): kontroll mot dagens aktive runtime-indeks fant ingen stale unresolved-rader. Ingen koordinater eller place-identiteter ble endret.\n`;
updatedSection = `${updatedSection.trimEnd()}${note}\n`;
protocol = `${protocol.slice(0, sectionStart)}${updatedSection}${protocol.slice(sectionEnd)}`;
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/summary.json`), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  activeAuthority: runtimeIndexFile,
  maxCoordinateBatch: maxBatch,
  unresolvedRowsBefore: candidateRows.length,
  staleRowsRemoved: removed.length,
  unresolvedRowsAfter: kept.length,
  removed,
  kept
}, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/README.md`), '# Oslo unresolved coordinate protocol sync — post batch 176\n\nThis sync compares unresolved Oslo protocol rows with the generated active runtime index. Rows are removed only when a place is now verified or absent from active runtime. Truly unresolved active records remain untouched. No coordinates or place identities are changed.\n');

console.log(JSON.stringify({ removed: removed.map((row) => row.id), kept: kept.map((row) => row.id) }, null, 2));
