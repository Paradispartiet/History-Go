import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'civication:history-people:build']);

const auditPath = '/tmp/peststotten-place-image-audit.json';
run(process.execPath, ['scripts/audit-place-images.mjs', '--mode=all', `--report=${auditPath}`]);
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const summaryPath = path.join(root, 'data/places/place_image_backlog_summary.json');
const backlog = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
backlog.generatedAt = '2026-09-10';
backlog.generatedFromCommit = 'peststotten_krist_kirkegard_completion_20260910';
backlog.totalPlaces = audit.totalPlaces;
backlog.summary = {
  validLocal: audit.summary.local,
  validRemote: audit.summary.remote,
  optionalMissing: audit.summary.optional,
  missing: audit.summary.missing,
  invalidLocalPath: audit.summary.invalid,
  remaining: audit.summary.missing + audit.summary.invalid
};
backlog.byCategory = Object.fromEntries(Object.entries(audit.byCategory).map(([category, bucket]) => [category, {
  total: bucket.total,
  valid: bucket.local + bucket.remote,
  optional: bucket.optional,
  missing: bucket.missing,
  invalid: bucket.invalid
}]));
fs.writeFileSync(summaryPath, `${JSON.stringify(backlog, null, 2)}\n`, 'utf8');

run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'civication:history-people:check']);
run(process.execPath, ['scripts/audit-place-images.mjs', '--mode=all', '--report=/tmp/peststotten-place-image-audit-verify.json', '--verify-summary=data/places/place_image_backlog_summary.json']);
run('git', ['diff', '--check']);
