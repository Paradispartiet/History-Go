import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const manifestPath = 'data/quiz/manifest.json';
const reportPath = 'reports/quiz_manifest_v2_audit_report.json';
const peopleCoveragePath = 'reports/quiz_historie_norge_for_1500_final_coverage_report.json';
const placeCoveragePath = 'reports/places_historie_norge_for_1500_quiz_final_coverage_report.json';

const report = {
  status: 'failed',
  manifestJsonParses: false,
  legacyFilesCount: 0,
  legacyQuizItemsCount: 0,
  setManifestEntriesCount: 0,
  setFilesChecked: 0,
  setBlocksChecked: 0,
  setQuestionsChecked: 0,
  duplicateQuizItemIds: [],
  duplicateSetKeys: [],
  missingFiles: [],
  missingSetIds: [],
  invalidQuestions: [],
  targetMismatchQuestions: [],
  norgeFor1500PeopleCoverageComplete: false,
  norgeFor1500PlaceCoverageComplete: false,
  peopleDataChanged: false,
  placesDataChanged: false,
  quizDataChanged: false,
  manifestChanged: false,
  notes: []
};

function rel(p) { return p.split(path.sep).join('/'); }
function abs(p) { return path.resolve(repoRoot, p); }
function hasText(v) { return typeof v === 'string' ? v.trim().length > 0 : v !== undefined && v !== null && v !== ''; }
function asArray(v) { return Array.isArray(v) ? v : []; }
async function readJson(file) { return JSON.parse(await readFile(abs(file), 'utf8')); }
function addInvalid(scope, file, id, reason) { report.invalidQuestions.push({ scope, file, id: id || null, reason }); }
function questionTarget(q) { return q?.targetId || q?.placeId || q?.personId || ''; }
function answerIsValid(q) {
  if (!hasText(q?.answer)) return false;
  if (Number.isInteger(q?.answerIndex)) return q.answerIndex >= 0 && q.answerIndex < asArray(q.options).length;
  return asArray(q.options).some((o) => String(o) === String(q.answer));
}
function validateQuestion(q, { file, scope, entryTargetId, entryTargetKind }) {
  const id = q?.quiz_id || q?.id;
  if (!hasText(q?.id)) addInvalid(scope, file, id, 'missing id');
  if (!hasText(q?.quiz_id) && !hasText(q?.id)) addInvalid(scope, file, id, 'missing quiz_id or id');
  if (!hasText(q?.categoryId)) addInvalid(scope, file, id, 'missing categoryId');
  if (!hasText(questionTarget(q))) addInvalid(scope, file, id, 'missing targetId/placeId/personId');
  if (!hasText(q?.question)) addInvalid(scope, file, id, 'missing question');
  if (!Array.isArray(q?.options) || q.options.length < 2) addInvalid(scope, file, id, 'options must contain at least 2 choices');
  if (!answerIsValid(q)) addInvalid(scope, file, id, 'missing answer/answerIndex or answer does not match an option');
  const targets = [q?.targetId, q?.placeId, q?.personId].filter(hasText).map(String);
  if (hasText(entryTargetId) && !targets.includes(String(entryTargetId))) {
    report.targetMismatchQuestions.push({ file, id: id || null, entryTargetId, questionTargets: targets });
  }
  if (entryTargetKind === 'place' && hasText(q?.question_scope) && q.question_scope !== 'place') addInvalid(scope, file, id, 'place question_scope must be place');
  if (entryTargetKind === 'person' && hasText(q?.question_scope) && !['person', 'people'].includes(String(q.question_scope))) {
    addInvalid(scope, file, id, 'person question_scope must be person/people when present');
  }
}

async function listJsonFiles(dir) {
  const root = abs(dir);
  if (!existsSync(root)) return [];
  const out = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(rel(path.relative(repoRoot, full)));
    }
  }
  await walk(root);
  return out;
}
function collectIds(value, ids = new Set()) {
  if (Array.isArray(value)) for (const item of value) collectIds(item, ids);
  else if (value && typeof value === 'object') {
    if (hasText(value.id)) ids.add(String(value.id));
    for (const key of ['items', 'people', 'places', 'data']) collectIds(value[key], ids);
  }
  return ids;
}
async function collectDomainIds() {
  const peopleIds = new Set();
  const placeIds = new Set();
  const peopleFiles = await listJsonFiles('data/people');
  const placeFiles = [
    ...(await listJsonFiles('data/places')),
    ...['data/places_musikk.json', 'data/places_baseskjema.json'].filter((f) => existsSync(abs(f)))
  ];
  for (const file of peopleFiles) { try { for (const id of collectIds(await readJson(file))) peopleIds.add(id); } catch {} }
  for (const file of placeFiles) { try { for (const id of collectIds(await readJson(file))) placeIds.add(id); } catch {} }
  return { peopleIds, placeIds };
}

let manifest;
const { peopleIds, placeIds } = await collectDomainIds();
try {
  manifest = await readJson(manifestPath);
  report.manifestJsonParses = true;
} catch (error) {
  report.notes.push(`Manifest JSON parse failed: ${error.message}`);
}

if (manifest) {
  const seenQuizIds = new Map();
  const files = asArray(manifest.files);
  report.legacyFilesCount = files.length;
  for (const file of files) {
    if (!existsSync(abs(file))) { report.missingFiles.push({ file, scope: 'legacy' }); continue; }
    let data;
    try { data = await readJson(file); } catch (error) { report.missingFiles.push({ file, scope: 'legacy', reason: `JSON parse failed: ${error.message}` }); continue; }
    if (!Array.isArray(data)) continue;
    report.legacyQuizItemsCount += data.length;
    for (const q of data) {
      const id = q?.id;
      if (hasText(id)) {
        if (seenQuizIds.has(id)) report.duplicateQuizItemIds.push({ id, files: [seenQuizIds.get(id), file] });
        else seenQuizIds.set(id, file);
      }
      if (!hasText(q?.id)) addInvalid('legacy', file, id, 'missing id');
      if (!hasText(q?.categoryId)) addInvalid('legacy', file, id, 'missing categoryId');
      if (!hasText(q?.question)) addInvalid('legacy', file, id, 'missing question');
      if (!Array.isArray(q?.options) || q.options.length < 2) addInvalid('legacy', file, id, 'options must contain at least 2 choices');
      if (!answerIsValid(q)) addInvalid('legacy', file, id, 'missing answer/answerIndex or answer does not match an option');
      if (!hasText(q?.targetId) && !hasText(q?.personId) && !hasText(q?.placeId)) addInvalid('legacy', file, id, 'missing targetId/personId/placeId');
    }
  }

  const setEntries = asArray(manifest.sets);
  report.setManifestEntriesCount = setEntries.length;
  if (!Array.isArray(manifest.sets)) report.notes.push('manifest.sets is not an array.');
  const checkedFiles = new Set();
  const seenSetKeys = new Map();
  for (const [index, entry] of setEntries.entries()) {
    if (!hasText(entry?.targetId)) report.notes.push(`manifest.sets[${index}] is missing targetId.`);
    if (!hasText(entry?.file)) { report.notes.push(`manifest.sets[${index}] is missing file.`); continue; }
    if (!existsSync(abs(entry.file))) { report.missingFiles.push({ file: entry.file, scope: 'sets', targetId: entry.targetId || null }); continue; }
    let data;
    try { data = await readJson(entry.file); } catch (error) { report.missingFiles.push({ file: entry.file, scope: 'sets', reason: `JSON parse failed: ${error.message}` }); continue; }
    checkedFiles.add(entry.file);
    const entryTargetId = hasText(entry?.targetId) ? String(entry.targetId) : '';
    const entryTargetKind = placeIds.has(entryTargetId) ? 'place' : peopleIds.has(entryTargetId) ? 'person' : null;
    if (hasText(entryTargetId) && entryTargetKind === null) {
      addInvalid('sets', entry.file, entryTargetId, 'manifest targetId does not resolve to a place or person');
    }
    const sets = asArray(data?.sets);
    if (!sets.length) report.missingFiles.push({ file: entry.file, scope: 'sets', reason: 'missing or empty sets[]' });
    const blocks = hasText(entry.set_id) ? sets.filter((s) => s?.set_id === entry.set_id) : sets;
    if (hasText(entry.set_id) && !blocks.length) report.missingSetIds.push({ file: entry.file, targetId: entry.targetId, set_id: entry.set_id });
    for (const block of blocks) {
      const setKey = `${entry.targetId}::${block?.set_id || entry.set_id || ''}`;
      if (seenSetKeys.has(setKey)) report.duplicateSetKeys.push({ key: setKey, entries: [seenSetKeys.get(setKey), { index, file: entry.file }] });
      else seenSetKeys.set(setKey, { index, file: entry.file });
      report.setBlocksChecked += 1;
      const questions = asArray(block?.questions);
      if (!questions.length) report.missingSetIds.push({ file: entry.file, targetId: entry.targetId, set_id: block?.set_id || entry.set_id || null, reason: 'set has no questions' });
      for (const q of questions) { report.setQuestionsChecked += 1; validateQuestion(q, { file: entry.file, scope: 'sets', entryTargetId, entryTargetKind }); }
    }
  }
  report.setFilesChecked = checkedFiles.size;
}

try {
  const p = await readJson(placeCoveragePath);
  report.norgeFor1500PlaceCoverageComplete = p.sourcePlacesTotal === 43 && p.quizSetsProduced === 43 && p.quizSetsActivatedInManifest === 43 && p.coverageComplete === true && Array.isArray(p.uncoveredSourcePlaceTargetIds) && p.uncoveredSourcePlaceTargetIds.length === 0;
  if (!report.norgeFor1500PlaceCoverageComplete) report.notes.push('Norge før 1500 place coverage report has mismatched final coverage values.');
} catch (error) { report.notes.push(`Place final coverage report missing or invalid: ${error.message}`); }
try {
  const p = await readJson(peopleCoveragePath);
  report.norgeFor1500PeopleCoverageComplete = p?.coverageSummary?.coverageComplete === true || p?.coverageComplete === true;
  if (!report.norgeFor1500PeopleCoverageComplete) report.notes.push('Norge før 1500 people coverage is not complete.');
} catch (error) { report.notes.push(`People final coverage report missing or invalid: ${error.message}`); }

const failureCounts = report.missingFiles.length + report.missingSetIds.length + report.invalidQuestions.length + report.targetMismatchQuestions.length + report.duplicateQuizItemIds.length + report.duplicateSetKeys.length;
report.status = report.manifestJsonParses && report.norgeFor1500PeopleCoverageComplete && report.norgeFor1500PlaceCoverageComplete && failureCounts === 0 ? 'passed' : 'failed';

await mkdir(abs('reports'), { recursive: true });
await writeFile(abs(reportPath), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${reportPath}`);
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.status === 'passed' ? 0 : 1;
