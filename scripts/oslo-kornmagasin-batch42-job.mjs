import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-control-batch-41';
const PLACE_ID = 'oslo_kornmagasin';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/oslo_kornmagasin.json';
const INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/naeringsliv/oslo_kornmagasin.json';
const QUIZ = 'data/quiz/naeringsliv/oslo_kornmagasin_sets_merged.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-42';

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function writeJson(file, value) {
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex');
}

function showJson(file) {
  return JSON.parse(execFileSync('git', ['show', `FETCH_HEAD:${file}`], { cwd: ROOT, encoding: 'utf8' }));
}

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { cwd: ROOT, stdio: 'inherit' });

const sourcePlace = showJson(CHILD);
const sourceEvidence = showJson(EVIDENCE);
const sourceQuiz = showJson(QUIZ);
const sourceIndex = showJson(INDEX);
const sourceIndexRow = sourceIndex.find((row) => row?.id === PLACE_ID);
if (!sourceIndexRow) throw new Error('Validated source index row missing');
if (sourcePlace.name !== 'Kornmagasinet på Akershus festning' || sourcePlace.year !== 1788 || sourcePlace.sourceObjectId !== 'osm-way:669390505') {
  throw new Error('Validated source place identity does not match expected correction');
}

const aggregate = readJson(AGGREGATE);
if (!Array.isArray(aggregate)) throw new Error('Aggregate is not an array');
const aggregateIndex = aggregate.findIndex((place) => place?.id === PLACE_ID);
if (aggregateIndex < 0) throw new Error(`${PLACE_ID} missing from aggregate`);
const before = structuredClone(aggregate[aggregateIndex]);
aggregate[aggregateIndex] = sourcePlace;
writeJson(AGGREGATE, aggregate);
writeJson(CHILD, sourcePlace);

const index = readJson(INDEX);
if (!Array.isArray(index)) throw new Error('Split index is not an array');
const targetIndex = index.findIndex((row) => row?.id === PLACE_ID);
if (targetIndex < 0) throw new Error(`${PLACE_ID} missing from split index`);
const existingFile = index[targetIndex].file;
index[targetIndex] = { ...index[targetIndex], ...sourceIndexRow, file: existingFile || sourceIndexRow.file };
writeJson(INDEX, index);

const manifest = readJson(SPLIT_MANIFEST);
const manifestRow = manifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error(`${PLACE_ID} missing from split manifest`);
manifestRow.name = sourcePlace.name;
manifestRow.sha256 = sha256(CHILD);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, manifest);

writeJson(EVIDENCE, sourceEvidence);
sourceQuiz.merge_notes = {
  ...sourceQuiz.merge_notes,
  existing_quiz_status: 'Existing 5×6 set retained and corrected in batch 42 after a gate-validated source pass.'
};
const questionText = JSON.stringify(sourceQuiz.sets || []);
const staleQuestionMarkers = ['Christiania kornmagasin', '"year":1785', 'placefil-år 1785', 'source_limited'].filter((pattern) => questionText.includes(pattern));
if (staleQuestionMarkers.length) throw new Error(`Quiz questions still contain stale markers: ${staleQuestionMarkers.join(', ')}`);
writeJson(QUIZ, sourceQuiz);

let protocol = fs.readFileSync(path.join(ROOT, PROTOCOL), 'utf8');
protocol = protocol.split('\n').filter((line) => !line.includes('| `oslo_kornmagasin` – Christiania kornmagasin | needs_review')).join('\n');
const row42 = '| 42 | `oslo_kornmagasin` | Kornmagasinet på Akershus festning | verified_geometry | `osm-way:669390505` |';
if (!protocol.includes(row42)) {
  const anchorRow = '| 41 | `roseslottet` | Roseslottet | verified_geometry | `osm-way:1004591108` |';
  if (!protocol.includes(anchorRow)) throw new Error('Current main batch-41 anchor row missing');
  protocol = protocol.replace(anchorRow, `${anchorRow}\n${row42}`);
}
const narrative42 = 'Batch 42 (2026-07-20) løser `oslo_kornmagasin` som et identitetsproblem før koordinatproblemet. Den tidligere aktive «Christiania kornmagasin»-recorden fra 1785 manglet eksternt verifisert identitet, noe også eksisterende quiz-QC dokumenterte. Recorden er korrigert til Kornmagasinet, inventar 0008 på Akershus festning, offisielt datert 1788. Eksakt navngitt OSM-way 669390505 brukes som bygningsgeometri, kryssjekket mot fredningsforskriften. Fysisk overlap mot det separate Bakeriet er kontrollert mot dets eget OSM-bygningsobjekt 669390521. Den eksisterende quizfilen er samtidig korrigert slik at den ikke lenger lærer bort den udokumenterte 1785-identiteten eller bruker place-filen som faktakilde.';
if (!protocol.includes(narrative42)) {
  const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  if (!protocol.includes(unresolvedHeader)) throw new Error('Oslo unresolved header missing');
  protocol = protocol.replace(unresolvedHeader, `${narrative42}\n\n${unresolvedHeader}`);
}
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 42 korrigerer og koordinatfester Kornmagasinet på Akershus festning som dokumentert 1788-bygg. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(path.join(ROOT, PROTOCOL), protocol);

const report = {
  date: '2026-07-20',
  batch: 42,
  placeId: PLACE_ID,
  before: { name: before.name, year: before.year, lat: before.lat, lon: before.lon },
  after: { name: sourcePlace.name, year: sourcePlace.year, lat: sourcePlace.lat, lon: sourcePlace.lon, coordStatus: sourcePlace.coordStatus, sourceObjectId: sourcePlace.sourceObjectId },
  identityResolution: 'Unsupported 1785 Christiania identity replaced with officially documented Akershus inventory 0008, Kornmagasinet, 1788.',
  overlapAudit: 'Distinct from canonical akershus_slott_bakeriet, which uses separate OSM way 669390521.',
  concurrentMainSafety: 'Only the oslo_kornmagasin row is replaced in the current aggregate/index/manifest; unrelated current-main rows are preserved.',
  quizCleanup: 'Unsupported 1785 identity removed from question content; first three place-file/meta questions are externally grounded.',
  protocolCounts: { verifiedCount, unresolvedCount },
  validatedSourceBranch: SOURCE_BRANCH
};
writeJson(`${REPORT_DIR}/application-summary.json`, report);
fs.mkdirSync(path.join(ROOT, REPORT_DIR), { recursive: true });
fs.writeFileSync(path.join(ROOT, REPORT_DIR, 'README.md'), `# Oslo coordinate control batch 42\n\nBatch 42 resolves \`${PLACE_ID}\` by correcting identity before coordinate promotion.\n\n- Canonical identity: Kornmagasinet, inventory 0008 at Akershus festning, dated 1788.\n- Geometry: exact named OSM way 669390505.\n- Identity source: official Akershus heritage regulation (Lovdata).\n- Overlap audit: distinct from Bakeriet, OSM way 669390521.\n- Quiz cleanup: the unsupported 1785 identity is removed from question content and the opening place-file-meta questions are replaced.\n- Concurrent-main safety: only the target row is patched in the current aggregate/index/manifest, preserving unrelated main changes.\n- Protocol after application: ${verifiedCount} verified/source-controlled Oslo places and ${unresolvedCount} unresolved controls.\n\nAll coordinate gates are run before the workflow commits the selected canonical files.\n`);

console.log(JSON.stringify({ ok: true, batch: 42, verifiedCount, unresolvedCount, staleQuestionMarkers }, null, 2));
