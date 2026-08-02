import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const branch = 'agent/historie-gamle-aker-sources-v1';
const publishDir = '/tmp/gamle-aker-sources-publish';
const canonicalWorkflowPath = '.github/workflows/coordinate-branch-runner.yml';

const run = (command, args, cwd = process.cwd()) => {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
};

await import('./gamle-aker-sources-materialize.mjs');

const changed = execFileSync('git', ['diff', '--name-only', '-z'])
  .toString('utf8')
  .split('\0')
  .filter(Boolean);

if (!changed.length) throw new Error('Materialiseringen produserte ingen filendringer.');

fs.rmSync(publishDir, { recursive: true, force: true });
run('git', ['worktree', 'add', '--detach', publishDir, 'HEAD']);

for (const file of changed) {
  const source = path.resolve(file);
  const target = path.join(publishDir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

for (const relativePath of [
  'scripts/coordinate-branch-job.mjs',
  'scripts/gamle-aker-sources-materialize.mjs',
  '.github/workflows/gamle-aker-sources-materialize.yml'
]) {
  fs.rmSync(path.join(publishDir, relativePath), { force: true });
}

const canonicalWorkflow = execFileSync(
  'git',
  ['show', `origin/main:${canonicalWorkflowPath}`],
  { encoding: 'utf8' }
);
fs.writeFileSync(path.join(publishDir, canonicalWorkflowPath), canonicalWorkflow);

run('git', ['config', 'user.name', 'github-actions[bot]'], publishDir);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], publishDir);
run('git', ['add', '-A'], publishDir);
run('git', ['diff', '--cached', '--check'], publishDir);
run('git', ['commit', '-m', 'Bygg brukerrettede Kilder for Gamle Aker kirke'], publishDir);
run('git', ['pull', '--rebase', 'origin', branch], publishDir);
run('git', ['push', 'origin', `HEAD:${branch}`], publishDir);

console.log(`Published ${changed.length} materialized file(s) and removed one-shot files.`);
