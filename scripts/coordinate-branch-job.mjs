#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DATE = '2026-07-23';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const placeManifestFile = 'data/places/manifest.json';
const reportDir = 'reports/oslo-coordinate-unresolved-protocol-sync-post-176';
const abs = (file) => path.join(root, file);
const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : [payload];

const manifest = JSON.parse(fs.readFileSync(abs(placeManifestFile), 'utf8'));
const active = new Map();
for (const entry of manifest.files || []) {
  const file = path.join(root, 'data', entry);
  if (!fs.existsSync(file)) continue;
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const place of toPlaces(payload)) {
    if (!place?.id) continue;
    active.set(String(place.id), {
      place,
      file: path.relative(root, file).replaceAll('\\', '/'),
    });
  }
}

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1])).filter(Number.isFinite));
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
  const record = active.get(candidate.id) ?? null;
  const place = record?.place ?? null;
  const status = String(place?.coordStatus ?? 'missing_from_active_manifest');
  const retired = !place || place.disabled === true || place.hidden === true || place.active === false;
  const resolved = place && verifiedStatuses.has(status);
  if (retired || resolved) {
    updatedSection = updatedSection.replace(`${candidate.row}\n`, '').replace(candidate.row, '');
    removed.push({
      id: candidate.id,
      reason: retired ? 'retired_or_not_active' : 'active_place_now_verified',
      coordStatus: status,
      activeFile: record?.file ?? null,
      name: place?.name ?? null,
    });
  } else {
    kept.push({
      id: candidate.id,
      coordStatus: status,
      activeFile: record?.file ?? null,
      name: place?.name ?? null,
    });
  }
}

if (!removed.length) throw new Error('Protocol sync found no stale unresolved rows to remove');
const note = `\nProtokollsynk (${DATE}, post batch 176): fjernet ${removed.length} stale unresolved-rader etter kontroll mot dagens aktive place-manifest. Fjernet: ${removed.map((row) => `\`${row.id}\``).join(', ')}. Ingen koordinater eller place-identiteter ble endret i denne synken.\n`;
updatedSection = `${updatedSection.trimEnd()}${note}\n`;
protocol = `${protocol.slice(0, sectionStart)}${updatedSection}${protocol.slice(sectionEnd)}`;
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/summary.json`), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  maxCoordinateBatch: maxBatch,
  unresolvedRowsBefore: candidateRows.length,
  staleRowsRemoved: removed.length,
  unresolvedRowsAfter: kept.length,
  removed,
  kept,
}, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/README.md`), `# Oslo unresolved coordinate protocol sync — post batch 176\n\nThis sync compares every row in the unresolved Oslo protocol table with the current active place manifest. Rows are removed only when the place is now verified or no longer active/has been retired. Truly unresolved active records remain untouched.\n\nNo coordinates or place identities are changed by this job.\n`);

console.log(JSON.stringify({ removed: removed.map((row) => row.id), kept: kept.map((row) => row.id) }, null, 2));
