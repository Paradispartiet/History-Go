import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const sourceRef = 'origin/agent/oslo-coordinate-history-phase4-builder';
const sourceFiles = [
  'data/fag/historie/emnemapping_historie_canonical_v4_5.json',
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  'data/fag/historie/historiepensum_canonical_v4_5.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json',
  'data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json',
  'reports/historie-canonical-migration/industri-arbeid-question-blueprints.json',
  'reports/historie-canonical-migration/industri-arbeid-vertical-chain-validation.txt',
  'reports/historie-canonical-migration/industri-arbeid-vertical-chain.md',
  'tests/quiz-production-pipeline.test.mjs',
  'tools/validate-historie-industri-arbeid.mjs'
];

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

run('git', ['fetch', 'origin', 'agent/oslo-coordinate-history-phase4-builder']);
run('git', ['checkout', sourceRef, '--', ...sourceFiles]);

for (const file of sourceFiles.filter((file) => file.endsWith('.json'))) {
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`json ok: ${file}`);
}

run('node', ['tools/validate-historie-industri-arbeid.mjs']);
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'quiz:context']);
run('node', ['tools/validate-historie-industri-arbeid.mjs']);
run('npm', ['run', 'knowledge:canonical:check']);

console.log('History phase 4 materialized on current main.');
