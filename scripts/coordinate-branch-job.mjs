import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceRef = 'origin/agent/oslo-coordinate-history-v5-5-power-curation-v2';
const domainId = 'his_makt_stat_institusjoner';
const historyQuizTargets = [
  'grindheim_runestein',
  'grindheim_steinkross',
  'grindheimsveien_nord_gravfelt',
  'hoyland_gravhaug_etne'
];
const pathsToTransfer = [
  'data/fag/historie/concepts_historie_canonical_v5_5.json',
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/theory_objects_historie_canonical_v5_5.json',
  ...historyQuizTargets.map((targetId) => `data/quiz/production_context/historie/${targetId}.json`),
  'reports/historie-v5/historie-v5-5-readiness.json',
  'reports/historie-v5/quality-review-queue.json',
  'reports/historie-v5/validation.txt',
  'reports/historie-v5/makt-stat-institusjoner-curation-command-v2.log',
  'reports/historie-v5/makt-stat-institusjoner-curation-result-v2.json',
  'reports/historie-v5/makt-stat-institusjoner-curation-validation-v2.txt'
];

function run(command, args, maxBuffer = 256 * 1024 * 1024) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer,
    env: process.env
  });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} feilet med kode ${result.status}`);
  }
  return result.stdout;
}

for (const relativePath of pathsToTransfer) {
  const object = `${sourceRef}:${relativePath}`;
  const result = spawnSync('git', ['show', object], {
    cwd: root,
    encoding: null,
    maxBuffer: 512 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Kunne ikke hente ${relativePath} fra den validerte kurateringsgrenen\n${String(result.stderr || '')}`);
  }
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result.stdout);
  console.log(`Overførte ${relativePath}`);
}

run('node', ['tools/validate-historie-v5.mjs', '--write']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'history-quiz-context-'));
for (const targetId of historyQuizTargets) {
  const rebuiltPath = path.join(tempDir, `${targetId}.json`);
  run('node', [
    'scripts/build-quiz-production-context.mjs',
    '--category', 'historie',
    '--target', targetId,
    '--output', rebuiltPath
  ]);
  const trackedPath = path.join(root, 'data/quiz/production_context/historie', `${targetId}.json`);
  const tracked = JSON.stringify(JSON.parse(fs.readFileSync(trackedPath, 'utf8')));
  const rebuilt = JSON.stringify(JSON.parse(fs.readFileSync(rebuiltPath, 'utf8')));
  if (tracked !== rebuilt) {
    throw new Error(`Quizkonteksten for ${targetId} avviker fra deterministisk rebuild`);
  }
  console.log(`Quizkontekst verifisert: ${targetId}`);
}
fs.rmSync(tempDir, { recursive: true, force: true });

run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('git', ['diff', '--check']);

const readiness = JSON.parse(
  fs.readFileSync(path.join(root, 'reports/historie-v5/historie-v5-5-readiness.json'), 'utf8')
);
const domain = readiness.domains.find((item) => item.domain_id === domainId);
const freezeReadyCount = readiness.domains.filter((item) => item.freeze_ready).length;
if (!domain?.freeze_ready || domain.issue_counts?.concepts !== 0 || domain.issue_counts?.theories !== 0 || domain.issue_counts?.emner !== 0) {
  throw new Error(`Makt-domenet er ikke fryseklart: ${JSON.stringify(domain, null, 2)}`);
}
if (freezeReadyCount < 9) {
  throw new Error(`Forventet minst 9 fryseklare domener, fant ${freezeReadyCount}`);
}

console.log([
  'Historie V5.5 – Makt, stat og institusjoner',
  'Status: CURATED_FREEZE_READY',
  `Fryseklare domener: ${freezeReadyCount}/20`,
  `Resterende kvalitetsfeil: begreper=${readiness.quality_issue_totals.concepts}, teorier=${readiness.quality_issue_totals.theories}, emner=${readiness.quality_issue_totals.emner}`,
  `Global V6 tillatt: ${readiness.v6_allowed}`
].join('\n'));
