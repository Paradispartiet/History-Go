import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

run('npm', ['run', 'build:tools']);
run('node', ['dist/tools/audit-people-of-places-status.mjs']);
run('node', ['dist/tools/check-people-of-places-gate.mjs']);
run('node', ['--experimental-strip-types', 'tools/audit-oslo-people-coverage.mts']);
run('node', ['--experimental-strip-types', 'tools/audit-oslo-latent-people-coverage.mts']);

const coverage = JSON.parse(fs.readFileSync('reports/oslo-people-coverage.json', 'utf8'));
const scenekunst = coverage.categories.find((entry) => entry.category === 'scenekunst') ?? null;
const queue = coverage.uncoveredRequired.filter((entry) => entry.category === 'scenekunst');

const lines = [
  '# Oslo People zero-gap batch 8 – fresh baseline',
  '',
  `Generated: ${coverage.generatedAt}`,
  '',
  '## Global Oslo coverage',
  '',
  `- Required non-nature Oslo places: **${coverage.totals.requiredNonNaturePlaces}**`,
  `- Covered required places: **${coverage.totals.coveredRequiredPlaces}**`,
  `- Uncovered required places: **${coverage.totals.uncoveredRequiredPlaces}**`,
  `- Logical People: **${coverage.totals.logicalPeople}**`,
  `- Invalid People refs in the Oslo coverage helper: **${coverage.totals.invalidPeopleRefs}**`,
  '',
  '## Scenekunst baseline',
  '',
  scenekunst
    ? `- Total: **${scenekunst.total}**; covered: **${scenekunst.covered}**; uncovered: **${scenekunst.uncovered}**; links: **${scenekunst.peopleLinks}**`
    : '- No scenekunst category row found.',
  '',
  '## Current uncovered scenekunst queue',
  '',
  ...(queue.length
    ? queue.map((entry) => `- \`${entry.placeId}\` — ${entry.name}`)
    : ['- None.']),
  '',
  '## Gate note',
  '',
  '- The canonical People of Places gate passed with zero duplicate IDs and zero invalid refs.',
  '- The Oslo helper reports legacy/global references separately and is not the canonical merge gate.',
  '',
];
fs.writeFileSync('reports/people-oslo-zero-gap-batch8-baseline.md', `${lines.join('\n')}\n`);

fs.rmSync('scripts/coordinate-branch-job.mjs');
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Refresh Oslo People zero-gap batch 8 baseline']);
run('git', ['push', 'origin', 'HEAD:agent/oslo-coordinate-people-zero-gap-batch8']);
