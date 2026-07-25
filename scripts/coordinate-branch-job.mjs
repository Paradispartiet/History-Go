import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const parts = [
  'scripts/.medieval-builder.gz.b64.02',
  'scripts/.medieval-builder.gz.b64.03'
];
const cleanupFiles = [
  'scripts/.medieval-builder.gz.b64.00',
  'scripts/.medieval-builder.gz.b64.01',
  ...parts
];
const encoded = parts.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('');
let source = zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');

const marker = `run(process.execPath, [paths.validator]);
run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);`;
const replacement = `run(process.execPath, [paths.validator]);
run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);

const quizProductionTestPath = 'tests/quiz-production-pipeline.test.mjs';
let quizProductionTest = fs.readFileSync(quizProductionTestPath, 'utf8');
const originalQuizProductionTest = quizProductionTest;
quizProductionTest = quizProductionTest
  .replaceAll('context.considered_curriculum.counts.emner, 92', 'context.considered_curriculum.counts.emner, 99')
  .replaceAll('context.considered_curriculum.counts.topic_hooks, 84', 'context.considered_curriculum.counts.topic_hooks, 93')
  .replaceAll('context.considered_curriculum.counts.methods, 54', 'context.considered_curriculum.counts.methods, 58');
if (quizProductionTest === originalQuizProductionTest) {
  throw new Error('Quiz production count expectations were not updated');
}
fs.writeFileSync(quizProductionTestPath, quizProductionTest);

for (const targetId of [
  'grindheim_runestein',
  'grindheim_steinkross',
  'grindheimsveien_nord_gravfelt',
  'hoyland_gravhaug_etne'
]) {
  run(process.execPath, [
    'scripts/build-quiz-production-context.mjs',
    '--category', 'historie',
    '--target', targetId,
    '--output', 'data/quiz/production_context/historie/' + targetId + '.json'
  ]);
}

run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);`;
if (!source.includes(marker)) throw new Error('Could not find medieval final validation marker');
source = source.replace(marker, replacement);

const target = path.join('/tmp', 'history-medieval-v5-5-builder.mjs');
fs.writeFileSync(target, source);
for (const file of cleanupFiles) fs.rmSync(path.join(root, file), { force: true });
await import(`file://${target}?v=${Date.now()}`);
