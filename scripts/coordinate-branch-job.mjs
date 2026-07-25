#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportDir = path.join(root, 'reports', 'uranienborg-coordinate-evidence-contract');
const auditReport = path.join(root, 'reports', 'coordinate-evidence-audit.md');
fs.mkdirSync(reportDir, { recursive: true });

const build = spawnSync('npm', ['run', 'build:tools'], { cwd: root, encoding: 'utf8' });
const buildOutput = `$ npm run build:tools\n${build.stdout || ''}${build.stderr || ''}`;
fs.writeFileSync(path.join(reportDir, 'build-tools.log'), buildOutput);
process.stdout.write(buildOutput);
if (build.status !== 0) process.exit(build.status ?? 1);

const audit = spawnSync(process.execPath, ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, encoding: 'utf8' });
let auditOutput = `$ ${process.execPath} dist/tools/audit-coordinate-evidence.mjs\n${audit.stdout || ''}${audit.stderr || ''}`;
if (fs.existsSync(auditReport)) {
  const problemRows = fs.readFileSync(auditReport, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('| ') && !line.endsWith('| OK |') && !line.startsWith('|---') && !line.includes('| placeId |'));
  auditOutput += `\nEksakte problemrader:\n${problemRows.join('\n')}\n`;
}
fs.writeFileSync(path.join(reportDir, 'coordinate-evidence.log'), auditOutput);
process.stdout.write(auditOutput);
if (audit.status !== 0) process.exit(audit.status ?? 1);
