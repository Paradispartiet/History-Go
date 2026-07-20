import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const outDir = 'reports/geonorge-address-klimahuset-20260720';
const address = 'Monrads gate 12 Oslo';

execFileSync('bash', ['-lc', `
set -euo pipefail
mkdir -p ${outDir}
npm run places:coords:find:address -- --address "${address}" 2>&1 | tee ${outDir}/terminal-output.txt
npm run build:tools >/dev/null
node dist/tools/address-first-coordinate-finder.mjs --address "${address}" > ${outDir}/result.json
`], { stdio: 'inherit' });

const result = JSON.parse(readFileSync(resolve(outDir, 'result.json'), 'utf8'));
const summary = {
  placeId: 'klimahuset',
  candidateName: 'Klimahuset',
  query: address,
  status: result.status,
  ok: result.ok,
  reason: result.reason,
  sourceObjectId: result.sourceObjectId ?? null,
  coordinate: result.coordinate ?? null,
};
writeFileSync(resolve(outDir, 'decision.json'), `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(resolve(outDir, 'README.md'), `# Klimahuset — adresse-først-intak\n\n- Kandidat: \`klimahuset\`\n- Adressequery: \`${address}\`\n- Status: \`${result.status}\`\n- Kildeobjekt: \`${result.sourceObjectId ?? 'ingen'}\`\n- Formål: dokumentere normativ Geonorge adresse-først-kontroll før eventuell canonical place-produksjon.\n\nFull terminaloutput er lagret i \`terminal-output.txt\`; ren maskinlesbar finder-respons ligger i \`result.json\`.\n`);

if (!result.ok || result.status !== 'verified_candidate') {
  throw new Error(`Klimahuset intake is not a verified candidate: ${result.status} — ${result.reason}`);
}

rmSync(new URL(import.meta.url));
