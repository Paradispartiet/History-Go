import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function run(command, args = []) {
  execFileSync(command, args, { stdio: 'inherit' });
}

run('npm', ['run', 'typecheck:web']);
run('npm', ['run', 'build:web']);

const generatedLegacyPath = 'js/Civication/systems/civicationSceneInteraction.js';
const generatedDistPath = 'dist/web/civicationSceneInteraction.js';
if (!fs.existsSync(generatedLegacyPath)) throw new Error(`${generatedLegacyPath} was not generated`);
if (!fs.existsSync(generatedDistPath)) throw new Error(`${generatedDistPath} was not generated`);
const legacy = fs.readFileSync(generatedLegacyPath, 'utf8');
const dist = fs.readFileSync(generatedDistPath, 'utf8');
if (legacy !== dist) throw new Error('SceneInteraction compatibility output differs from dist/web bundle');
for (const needle of [
  'decision_requires_two_choices',
  'task_requires_contract',
  'info_requires_zero_choices',
  'ack_allows_at_most_one_choice'
]) {
  if (!legacy.includes(needle)) throw new Error(`generated SceneInteraction bundle is missing ${needle}`);
}

const checks = [
  ['tests/civication-scene-interaction-contract.test.js'],
  ['tests/civication-scene-interaction-no-fallback.test.js'],
  ['tests/civication-scene-director-ownership.test.js'],
  ['tests/civication-scene-director-daily-catalog.test.js'],
  ['tests/civication-task-gate-inline.test.js'],
  ['tests/civication-scene-pipeline-reachability.test.js'],
  ['scripts/audit-civication-scene-pipeline.mjs']
];
for (const args of checks) run(process.execPath, args);
run('git', ['diff', '--check']);

console.log('Civication Scene Interaction 4E TypeScript materialization validated.');