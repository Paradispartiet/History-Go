import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const reportDir = 'reports/oslo-attractions-completeness-20260720/the-oslo-gallery';
const selfPath = 'scripts/coordinate-branch-job.mjs';
const address = 'Josefines gate 2A Oslo';
fs.mkdirSync(reportDir, { recursive: true });

const output = execFileSync('npm', ['run', 'places:coords:find:address', '--', '--address', address], {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
});
fs.writeFileSync(path.join(reportDir, 'terminal.txt'), output);
const jsonStart = output.indexOf('\n{');
if (jsonStart < 0) throw new Error('Could not locate JSON payload in address-finder output');
const result = JSON.parse(output.slice(jsonStart + 1));
fs.writeFileSync(path.join(reportDir, 'geonorge-result.json'), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'README.md'), `# The Oslo Gallery – address-first coordinate intake\n\n- Candidate: \`the_oslo_gallery\`\n- Query: \`${address}\`\n- Method: normative \`places:coords:find:address\` against Geonorge Adresser API.\n- Result status: \`${result.status}\`\n- Source object: \`${result.sourceObjectId ?? 'none'}\`\n\nThe gallery's own current contact page and VisitOSLO both identify Josefines gate 2A as the physical Bislett gallery. No canonical place data is changed in this intake.\n`);
if (fs.existsSync(selfPath)) fs.unlinkSync(selfPath);
console.log(JSON.stringify({ candidateId: 'the_oslo_gallery', query: address, status: result.status, sourceObjectId: result.sourceObjectId, coordinate: result.coordinate ?? null }, null, 2));
