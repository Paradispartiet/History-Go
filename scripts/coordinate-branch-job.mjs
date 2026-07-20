import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const reportDir = 'reports/oslo-attractions-completeness-20260720/frigo';
const selfPath = 'scripts/coordinate-branch-job.mjs';
const address = 'Ensjøveien 20 Oslo';
fs.mkdirSync(reportDir, { recursive: true });

const output = execFileSync(
  'npm',
  ['run', 'places:coords:find:address', '--', '--address', address],
  { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
);
fs.writeFileSync(path.join(reportDir, 'terminal.txt'), output);

const jsonStart = output.indexOf('\n{');
if (jsonStart < 0) throw new Error('Could not locate JSON payload in address-finder output');
const result = JSON.parse(output.slice(jsonStart + 1));
fs.writeFileSync(path.join(reportDir, 'geonorge-result.json'), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(
  path.join(reportDir, 'README.md'),
  `# FRIGO – address-first coordinate intake\n\n- Candidate: \`frigo_friluftssenteret\`\n- Query: \`${address}\`\n- Method: normative \`places:coords:find:address\` against Geonorge Adresser API.\n- Result status: \`${result.status}\`\n- Source object: \`${result.sourceObjectId ?? 'none'}\`\n\nFRIGO's own current site identifies Ensjøveien 20 as the visiting address. VisitOSLO's older Ensjøveien 7 listing is treated as stale unless independent evidence shows a separate current FRIGO facility there.\n`
);

if (fs.existsSync(selfPath)) fs.unlinkSync(selfPath);
console.log(JSON.stringify({ candidateId: 'frigo_friluftssenteret', query: address, status: result.status, sourceObjectId: result.sourceObjectId, coordinate: result.coordinate ?? null }, null, 2));
