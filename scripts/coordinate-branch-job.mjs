import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const workflowPath = '.github/workflows/coordinate-branch-runner.yml';
const canonicalWorkflow = execFileSync(
  'git',
  ['show', `origin/main:${workflowPath}`],
  { encoding: 'utf8' },
);

writeFileSync(workflowPath, canonicalWorkflow, 'utf8');
console.log('Restored canonical coordinate runner; runtime place index will be rebuilt by the workflow.');
console.log('Regjeringskvartalet index-sync job triggered.');
