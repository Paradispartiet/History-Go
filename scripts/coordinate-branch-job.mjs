import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const reportDir = 'reports/oslo-attractions-completeness-20260720/oslo-prosjektrom';
const selfPath = 'scripts/coordinate-branch-job.mjs';
const addresses = [
  { key: 'platous-gate-10', query: 'Platous gate 10 Oslo' },
  { key: 'platous-gate-18', query: 'Platous gate 18 Oslo' }
];
fs.mkdirSync(reportDir, { recursive: true });

const summary = { candidateId: 'oslo_prosjektrom', results: [] };
for (const address of addresses) {
  const output = execFileSync('npm', ['run', 'places:coords:find:address', '--', '--address', address.query], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  fs.writeFileSync(path.join(reportDir, `${address.key}-terminal.txt`), output);
  const jsonStart = output.indexOf('\n{');
  if (jsonStart < 0) throw new Error(`Could not locate JSON payload for ${address.query}`);
  const result = JSON.parse(output.slice(jsonStart + 1));
  fs.writeFileSync(path.join(reportDir, `${address.key}-geonorge-result.json`), `${JSON.stringify(result, null, 2)}\n`);
  summary.results.push({ key: address.key, query: address.query, status: result.status, sourceObjectId: result.sourceObjectId, coordinate: result.coordinate ?? null });
}

fs.writeFileSync(path.join(reportDir, 'address-comparison.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo Prosjektrom – two-address coordinate intake\n\n- Candidate: \`oslo_prosjektrom\`\n- Address candidate A: \`Platous gate 10 Oslo\` (gallery's own latest published exhibition post says entrance via Platous gate 10).\n- Address candidate B: \`Platous gate 18 Oslo\` (current Oslo Art Guide venue listing says entrance at Platous gate 18).\n- Method: normative \`places:coords:find:address\` against Geonorge Adresser API for both addresses.\n\nNo canonical place data is changed in this intake. The two results must be compared with the physical building/entrance evidence before production.\n`);

if (fs.existsSync(selfPath)) fs.unlinkSync(selfPath);
console.log(JSON.stringify(summary, null, 2));
