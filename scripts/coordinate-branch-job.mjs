import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { runBuildQuizProductionContext } from './build-quiz-production-context.mjs';

const root = process.cwd();
const abs = (value) => path.resolve(root, value);
const sha = (value) => createHash('sha256').update(value).digest('hex');

function replaceExactly(text, before, after, count) {
  const found = text.split(before).length - 1;
  if (found !== count) throw new Error(`Expected ${count} occurrences, found ${found}: ${before.slice(0, 80)}`);
  return text.split(before).join(after);
}

function run(command, args, label) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with exit code ${result.status}`);
}

function validateDomain() {
  const result = spawnSync('node', ['tools/validate-historie-industri-arbeid.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  process.stdout.write(output);
  fs.mkdirSync(abs('reports/historie-canonical-migration'), { recursive: true });
  fs.writeFileSync(abs('reports/historie-canonical-migration/industri-arbeid-vertical-chain-validation.txt'), output);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`History phase 4 validator failed with exit code ${result.status}`);
}

const parts = [
  ...Array.from({ length: 6 }, (_, index) => `tools/.build-historie-industri-phase4.part${String(index + 1).padStart(2, '0')}`),
  'tools/.build-historie-industri-phase4.part07a',
  'tools/.build-historie-industri-phase4.part07b',
  'tools/.build-historie-industri-phase4.part07c',
];
const encoded = parts.map((file) => fs.readFileSync(abs(file), 'utf8').trim()).join('');
if (encoded.length !== 20800 || sha(encoded) !== '4118f3d530deb65ba9b4f1654e09d6a399793f9ddee7dabc674d39f5f2bfbbcb') {
  throw new Error(`Builder transport mismatch: ${encoded.length}, ${sha(encoded)}`);
}
const gzipBytes = Buffer.from(encoded, 'base64');
if (sha(gzipBytes) !== 'd844e1c6bc30b5850600bf5a997aed39ef602b7e2afab0e7633e3c7e7f4e30d3') throw new Error('Builder gzip mismatch');
const transported = gunzipSync(gzipBytes);
if (sha(transported) !== '3b2b94fa34698192e29a3cf4e98e3fc316cff8c87095da437c51215c0cede333') throw new Error('Builder source mismatch');

let source = transported.toString('utf8');
source = replaceExactly(source, 'for e in emners', 'for e in emner', 2);
source = replaceExactly(source, 'existing_emners', 'existing_emner', 1);
source = replaceExactly(source, 'updated_emners', 'updated_emner', 2);
source = replaceExactly(source, 'emners_out', 'emner_out', 5);
source = replaceExactly(
  source,
  'target_emner = [copy.deepcopy(emners_by_id[emne_id]) for emne_id in existing_target_ids]\ntarget_by_id = {item["emne_id"]: item for item in target_emner}\n',
  'target_emner = [copy.deepcopy(emners_by_id[emne_id]) for emne_id in existing_target_ids]\nnew_emne_template = copy.deepcopy(target_emner[0])\nfor emne_id in target_ids:\n    if emne_id in existing_target_ids:\n        continue\n    new_item = copy.deepcopy(new_emne_template)\n    new_item["emne_id"] = emne_id\n    new_item["title"] = new_emner_defs[emne_id]["title"]\n    new_item["aliases"] = []\n    target_emner.append(new_item)\ntarget_by_id = {item["emne_id"]: item for item in target_emner}\n',
  1,
);
const sourceBytes = Buffer.from(source);
if (sha(sourceBytes) !== '99baa78fb574a5012f2089fb73e07125e78d33d1cb5c263fb468576805a66baf') throw new Error(`Patched builder mismatch: ${sha(sourceBytes)}`);
fs.writeFileSync(abs('tools/build-historie-industri-phase4.py'), sourceBytes);

run('python3', ['-m', 'py_compile', 'tools/build-historie-industri-phase4.py'], 'Compile phase 4 builder');
run('python3', ['tools/build-historie-industri-phase4.py'], 'Build phase 4 canonical package');

const testPath = abs('tests/quiz-production-pipeline.test.mjs');
let tests = fs.readFileSync(testPath, 'utf8');
tests = replaceExactly(tests, 'assert.equal(context.considered_curriculum.counts.emner, 57);', 'assert.equal(context.considered_curriculum.counts.emner, 64);', 4);
tests = replaceExactly(tests, 'assert.equal(context.considered_curriculum.counts.topic_hooks, 39);', 'assert.equal(context.considered_curriculum.counts.topic_hooks, 48);', 4);
tests = replaceExactly(tests, 'assert.equal(context.considered_curriculum.counts.methods, 28);', 'assert.equal(context.considered_curriculum.counts.methods, 33);', 4);
fs.writeFileSync(testPath, tests);

run('node', ['--check', 'tools/validate-historie-industri-arbeid.mjs'], 'Syntax-check permanent validator');
for (const file of [
  'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  'data/fag/historie/historiepensum_canonical_v4_5.json',
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/emnemapping_historie_canonical_v4_5.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json',
  'data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json',
  'reports/historie-canonical-migration/industri-arbeid-question-blueprints.json',
]) JSON.parse(fs.readFileSync(abs(file), 'utf8'));
validateDomain();

run('npm', ['run', 'knowledge:canonical:write'], 'Regenerate canonical Knowledge data');
const manifest = JSON.parse(fs.readFileSync(abs('data/fag/fag_manifest.json'), 'utf8'));
for (const [targetId, config] of Object.entries(manifest.historie?.quizProduction?.targets || {})) {
  const outputPath = path.resolve(root, 'data/fag', config.context_artifact);
  await runBuildQuizProductionContext({ root, categoryId: 'historie', targetId, outputPath });
  console.log(`Rebuilt ${targetId}: ${path.relative(root, outputPath)}`);
}
validateDomain();
for (const [label, args] of [
  ['Check canonical Knowledge data', ['run', 'knowledge:canonical:check']],
  ['Check legacy Knowledge compatibility', ['run', 'knowledge:legacy:check']],
  ['Audit Knowledge contract', ['run', 'audit:knowledge']],
  ['Test quiz content audit', ['run', 'test:quiz-content-audit']],
  ['Test quiz production', ['run', 'test:quiz-production']],
  ['Audit quiz production contexts', ['run', 'audit:quiz-production-context']],
  ['Audit quiz progression', ['run', 'audit:quiz-progression']],
  ['Audit quiz theory binding', ['run', 'audit:quiz-theory-binding']],
]) run('npm', args, label);
run('git', ['diff', '--check'], 'Check diff whitespace');

for (const file of [...parts, 'tools/.build-historie-industri-phase4.part07', 'tools/build-historie-industri-phase4.py']) {
  if (fs.existsSync(abs(file))) fs.rmSync(abs(file), { force: true });
}
console.log('History phase 4 package built, validated and cleaned.');
