import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const allowlistPath = '.github/ci/repository-hygiene-allowlist-v1.json';
const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
const allowed = new Set(allowlist.allowedReportArtifacts || []);
const base = process.env.REPO_HYGIENE_BASE_SHA || '';
const head = process.env.REPO_HYGIENE_HEAD_SHA || '';
const maxDiagnosticBytes = 500 * 1024;
const diagnosticExtensions = new Set(['.html', '.htm', '.zip', '.tar', '.gz', '.7z', '.pdf']);

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `git ${args.join(' ')} failed\n`);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

const tracked = git(['ls-files', '-z']).split('\0').filter(Boolean);
const largest = tracked
  .map((file) => {
    try { return { file, bytes: fs.statSync(file).size }; }
    catch { return { file, bytes: 0 }; }
  })
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 25);

console.log('Largest tracked files in current tree:');
for (const row of largest) console.log(`${String(row.bytes).padStart(10)}  ${row.file}`);

if (!base || !head) {
  console.log('No comparison range supplied; size inventory only.');
  process.exit(0);
}

const changed = git(['diff', '--name-only', '--diff-filter=ACMRT', base, head])
  .split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
const violations = [];

for (const file of changed) {
  if (!file.startsWith('reports/') || allowed.has(file) || !fs.existsSync(file)) continue;
  const ext = path.extname(file).toLowerCase();
  const bytes = fs.statSync(file).size;
  if (diagnosticExtensions.has(ext)) {
    violations.push(`${file}: diagnostic ${ext} files belong in GitHub Actions artifacts unless explicitly allowlisted`);
  }
  if (bytes > maxDiagnosticBytes) {
    violations.push(`${file}: ${bytes} bytes exceeds the 500 KiB report threshold; store large diagnostic output as an Actions artifact`);
  }
}

if (violations.length) {
  console.error('Repository hygiene violations:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('Repository hygiene: changed report artifacts are within policy.');
