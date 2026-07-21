#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const auditDir = path.join(root, 'reports/oslo-coordinate-retro-compliance-20260721');
const methodFile = path.join(auditDir, 'current-oslo-method-classification.json');
const auditFile = path.join(auditDir, 'audit.json');
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const sectionHeading = '### Retrospektiv current-sett compliance (2026-07-21)';
const sectionEndHeading = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const toPlaces = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : Array.isArray(payload?.items) ? payload.items : payload?.id ? [payload] : [];

function isOsloSourceFile(sourceFile) {
  return /(^|\/)(?:places_)?oslo(?:\/|_|$)/.test(String(sourceFile || '').replace(/\\/g, '/').toLowerCase());
}

function parseMainRows(markdown) {
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

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
const validateCoordinateSource = (await import(pathToFileURL(path.join(root, 'dist/tools/coordinate-source-contract.mjs')).href)).validateCoordinateSource;

const runtime = toPlaces(readJson(path.join(root, 'data/places/places_index.json')));
const currentOsloVerified = runtime
  .filter((place) => verifiedStatuses.has(String(place.coordStatus || '')) && isOsloSourceFile(place.sourceFile))
  .sort((a, b) => String(a.id).localeCompare(String(b.id)));
const currentById = new Map(currentOsloVerified.map((place) => [String(place.id), place]));

const contractFailures = [];
for (const place of currentOsloVerified) {
  const result = validateCoordinateSource(place);
  if (result.trust !== 'verified') {
    contractFailures.push({
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

let protocol = fs.readFileSync(protocolFile, 'utf8');
// Remove an old generated supplemental section if this job is rerun.
const oldSectionStart = protocol.indexOf(sectionHeading);
if (oldSectionStart >= 0) {
  const oldSectionEnd = protocol.indexOf(sectionEndHeading, oldSectionStart);
  if (oldSectionEnd < 0) throw new Error('Fant supplemental start uten sluttmarkør');
  protocol = protocol.slice(0, oldSectionStart) + protocol.slice(oldSectionEnd);
}

const mainRows = parseMainRows(protocol);
const mainIds = new Set(mainRows.map((row) => row.placeId));
const missingFromMain = currentOsloVerified.filter((place) => !mainIds.has(String(place.id)));
const methodReport = readJson(methodFile);
const methodPass = Array.isArray(methodReport?.pass) ? methodReport.pass : [];
const methodReview = Array.isArray(methodReport?.review) ? methodReport.review : [];
const passById = new Map(methodPass.map((row) => [String(row.placeId), row]));

const classificationDrift = [];
for (const place of missingFromMain) {
  const classified = passById.get(String(place.id));
  if (!classified) classificationDrift.push({ placeId: place.id, problem: 'Current verified place mangler metodisk PASS i materialisert klassifisering.' });
  else if (classified.sourceObjectId !== place.sourceObjectId || classified.coordStatus !== place.coordStatus || classified.sourceProvider !== place.sourceProvider) {
    classificationDrift.push({
      placeId: place.id,
      problem: 'Metodeklassifisering matcher ikke current source/status.',
      classified: { sourceObjectId: classified.sourceObjectId, coordStatus: classified.coordStatus, sourceProvider: classified.sourceProvider },
      current: { sourceObjectId: place.sourceObjectId, coordStatus: place.coordStatus, sourceProvider: place.sourceProvider }
    });
  }
}
for (const row of methodPass) {
  if (!missingFromMain.some((place) => String(place.id) === String(row.placeId))) {
    classificationDrift.push({ placeId: row.placeId, problem: 'Metodeklassifisert place er ikke lenger i current supplement-scope.' });
  }
}
if (methodReview.length) {
  for (const row of methodReview) classificationDrift.push({ placeId: row.placeId, problem: 'Metodeklassifisering står fortsatt til review.' });
}

const supplementRows = missingFromMain.map((place) => {
  const method = passById.get(String(place.id));
  return {
    audit: 'R2026-07-21',
    placeId: place.id,
    name: place.name,
    status: place.coordStatus,
    sourceObjectId: place.sourceObjectId,
    method: method?.method || 'UNCLASSIFIED'
  };
});

const supplementSection = [
  sectionHeading,
  '',
  'Denne tabellen dekker aktive current `verified*` Oslo-steder som ikke allerede har en unik historisk batchrad i tabellen over. Radene er ikke gitt oppdiktede gamle batchnumre; de dokumenterer den retrospektive revisjonen av dagens canonical sett. Hvert sted er kontrollert mot Coordinate Source Contract v1 og klassifisert mot den låste metodeprioriteten.',
  '',
  '| audit | placeId | navn | godkjent status | kildeobjekt | metodegrunnlag |',
  '|---|---|---|---|---|---|',
  ...supplementRows.map((row) => '| ' + row.audit + ' | `' + escapeCell(row.placeId) + '` | ' + escapeCell(row.name) + ' | ' + row.status + ' | `' + escapeCell(row.sourceObjectId) + '` | `' + escapeCell(row.method) + '` |'),
  '',
  'Metodegrunnlagene betyr:',
  '- `address_first_official_address`: konkret norsk adresse er verifisert med Geonorge og stabil adresse-ID.',
  '- `object_type_first_exact_osm_geometry`: eksakt navngitt fysisk objekt/geometri er valgt etter objekttype og dokumentert scope, ikke nearest/first-hit.',
  '- `official_map_object_type_first`: offisielt kartobjekt fra Kartverket brukes for ikke-adressebasert areal/geometri.',
  '- `historical_source_first`: historisk sted bruker stabil historisk forskningskilde og historisk anker.',
  '- `documented_semantic_geometry`: dokumentert linje-/områdeutstrekning bruker kildebelagt semantisk geometri.',
  ''
].join('\n');

const insertAt = protocol.indexOf(sectionEndHeading);
if (insertAt < 0) throw new Error('Fant ikke innsettingspunkt for supplemental current-sett-tabell');
protocol = protocol.slice(0, insertAt) + supplementSection + '\n' + protocol.slice(insertAt);

const mainSet = new Set(mainRows.map((row) => row.placeId));
const supplementSet = new Set(supplementRows.map((row) => String(row.placeId)));
const inventoryIds = [...mainSet, ...supplementSet];
const duplicates = [...mainSet].filter((id) => supplementSet.has(id));
const currentIds = new Set(currentOsloVerified.map((place) => String(place.id)));
const missingFromInventory = [...currentIds].filter((id) => !mainSet.has(id) && !supplementSet.has(id));
const inventoryMissingFromCurrent = inventoryIds.filter((id) => !currentIds.has(id));

const openFindings = [];
for (const item of contractFailures) openFindings.push({ type: 'contract_failure', ...item });
for (const item of classificationDrift) openFindings.push({ type: 'classification_drift', ...item });
for (const id of duplicates) openFindings.push({ type: 'duplicate_inventory_id', placeId: id });
for (const id of missingFromInventory) openFindings.push({ type: 'current_verified_missing_from_inventory', placeId: id });
for (const id of inventoryMissingFromCurrent) openFindings.push({ type: 'inventory_id_not_current_verified', placeId: id });

const summary = {
  currentOsloVerifiedRecords: currentOsloVerified.length,
  historicalBatchRows: mainRows.length,
  retrospectiveCurrentSetRows: supplementRows.length,
  inventoryUniqueIds: new Set(inventoryIds).size,
  contractFailures: contractFailures.length,
  methodReview: methodReview.length,
  classificationDrift: classificationDrift.length,
  duplicateInventoryIds: duplicates.length,
  currentVerifiedMissingFromInventory: missingFromInventory.length,
  inventoryIdsNotCurrentVerified: inventoryMissingFromCurrent.length,
  openFindings: openFindings.length
};

// Update the stale opening count without erasing the following batch notes.
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ dokumenterte verifiserte eller kildekontrollerte canonical steder\./, 'Oslo-protokollen dekker nå ' + summary.currentOsloVerifiedRecords + ' aktive current `verified*` canonical Oslo-steder: ' + summary.historicalBatchRows + ' i den historiske batchtabellen og ' + summary.retrospectiveCurrentSetRows + ' i den retrospektive current-sett-tabellen.');

const retroMarker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
const noteIndex = protocol.indexOf(retroMarker);
if (noteIndex >= 0) {
  const lineStart = protocol.lastIndexOf('\n', noteIndex) + 1;
  const nextNewline = protocol.indexOf('\n', noteIndex);
  const lineEnd = nextNewline >= 0 ? nextNewline : protocol.length;
  const note = retroMarker + ' Full revisjon er nå utvidet fra de historiske batchradene til hele det aktive current verified*-settet fra Oslo-kilder. Sluttinventaret dekker ' + summary.currentOsloVerifiedRecords + '/' + summary.currentOsloVerifiedRecords + ' current verified*-steder uten duplikater, kontraktfeil eller metodiske review-punkter. Detaljer: `reports/oslo-coordinate-retro-compliance-20260721/final-current-oslo-compliance.json`.';
  protocol = protocol.slice(0, lineStart) + note + protocol.slice(lineEnd);
}
writeText(protocolFile, protocol);

const finalReport = {
  generatedAt: new Date().toISOString(),
  scope: 'Complete active current verified* Oslo set, not only historical batch rows.',
  summary,
  methodBreakdown: methodReport.byMethod || {},
  contractFailures,
  classificationDrift,
  duplicates,
  missingFromInventory,
  inventoryMissingFromCurrent,
  openFindings,
  supplementRows
};
writeJson(path.join(auditDir, 'final-current-oslo-compliance.json'), finalReport);

const legacyAudit = readJson(auditFile);
legacyAudit.finalCurrentSetAudit = {
  generatedAt: finalReport.generatedAt,
  summary,
  report: 'reports/oslo-coordinate-retro-compliance-20260721/final-current-oslo-compliance.json'
};
writeJson(auditFile, legacyAudit);

const readmeFile = path.join(auditDir, 'README.md');
let readme = fs.readFileSync(readmeFile, 'utf8');
const finalHeading = '## Endelig current-sett compliance';
const finalSection = [
  finalHeading,
  '',
  '- Aktive current `verified*` Oslo-steder: **' + summary.currentOsloVerifiedRecords + '**',
  '- Historiske batchrader: **' + summary.historicalBatchRows + '**',
  '- Retrospektive current-sett-rader: **' + summary.retrospectiveCurrentSetRows + '**',
  '- Inventardekning: **' + summary.inventoryUniqueIds + '/' + summary.currentOsloVerifiedRecords + '**',
  '- Contract v1-feil: **' + summary.contractFailures + '**',
  '- Metode-review: **' + summary.methodReview + '**',
  '- Klassifiseringsdrift: **' + summary.classificationDrift + '**',
  '- Duplikater: **' + summary.duplicateInventoryIds + '**',
  '- Åpne funn: **' + summary.openFindings + '**',
  '',
  'Autoritativ sluttfil: `reports/oslo-coordinate-retro-compliance-20260721/final-current-oslo-compliance.json`.'
].join('\n');
if (readme.includes(finalHeading)) {
  readme = readme.slice(0, readme.indexOf(finalHeading)).trimEnd() + '\n\n' + finalSection + '\n';
} else {
  readme = readme.trimEnd() + '\n\n' + finalSection + '\n';
}
writeText(readmeFile, readme);

console.log(JSON.stringify({ status: openFindings.length === 0 ? 'complete_current_oslo_compliance_pass' : 'complete_current_oslo_compliance_fail', ...summary }, null, 2));
if (openFindings.length) throw new Error('Final current Oslo compliance har ' + openFindings.length + ' åpne funn.');
