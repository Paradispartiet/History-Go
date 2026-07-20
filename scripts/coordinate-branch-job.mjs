import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const outDir = 'reports/geonorge-address-jordal-ungdomshall-20260720';
const address = 'Jordalgata 12 Oslo';
execFileSync('bash', ['-lc', `
set -euo pipefail
mkdir -p ${outDir}
npm run places:coords:find:address -- --address "${address}" 2>&1 | tee ${outDir}/terminal-output.txt
npm run build:tools >/dev/null
node dist/tools/address-first-coordinate-finder.mjs --address "${address}" > ${outDir}/result.json
`], { stdio: 'inherit' });

const result = JSON.parse(readFileSync(`${outDir}/result.json`, 'utf8'));
const decision = {
  placeId: 'jordal_ungdomshall',
  candidateName: 'Jordal ungdomshall',
  query: address,
  status: result.status,
  ok: result.ok,
  reason: result.reason,
  sourceObjectId: result.sourceObjectId ?? null,
  coordinate: result.coordinate ?? null,
  identityCaveat: 'Jordal ungdomshall and Jordal Amfi belong to the same Jordal sports complex and use Jordalgata 12 in public-facing sources. The official address point is therefore only the mandatory address-first result; it must not be applied as the final display point until building identity and geometry distinguish the youth hall from Jordal Amfi.'
};
writeFileSync(`${outDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`);
writeFileSync(`${outDir}/README.md`, `# Jordal ungdomshall — adresse-først-intak\n\n- Kandidat: \`jordal_ungdomshall\`\n- Adressequery: \`${address}\`\n- Status: \`${result.status}\`\n- Kildeobjekt: \`${result.sourceObjectId ?? 'ingen'}\`\n\nDette er den obligatoriske Geonorge adresse-først-kontrollen. Jordal ungdomshall og Jordal Amfi ligger i samme idrettskompleks og bruker samme offentlige gateadresse, så et entydig adressepunkt er ikke automatisk et entydig bygningspunkt. Et eventuelt canonical displaypunkt må senere kryssjekkes mot eksakt hallidentitet/geometri.\n`);
if (!result.ok || result.status !== 'verified_candidate') throw new Error(`Jordal address intake did not yield a verified candidate: ${result.status}`);
rmSync(new URL(import.meta.url));
