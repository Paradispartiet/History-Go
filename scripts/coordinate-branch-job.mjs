import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = 'reports/oslo-attractions-completeness-20260720/ekt-rideskole-husdyrpark';
const ADDRESS = 'Ekebergveien 99 Oslo';

function abs(rel) { return path.join(ROOT, rel); }
function write(rel, content) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), content);
}
function writeJson(rel, value) { write(rel, JSON.stringify(value, null, 2) + '\n'); }

const run = spawnSync('npm', ['run', 'places:coords:find:address', '--', '--address', ADDRESS], {
  cwd: ROOT,
  encoding: 'utf8'
});
const terminal = `${run.stdout || ''}${run.stderr || ''}`;
write(`${OUT}/terminal.txt`, terminal);
if (run.status !== 0) throw new Error(`Address finder exited with ${run.status}`);

const start = (run.stdout || '').indexOf('{');
if (start < 0) throw new Error('Address finder produced no JSON payload');
const result = JSON.parse(run.stdout.slice(start));
writeJson(`${OUT}/result.json`, result);

const decision = {
  version: '2026-07-20',
  placeId: 'ekt_rideskole_husdyrpark',
  name: 'EKT Rideskole og Husdyrpark',
  addressQuery: ADDRESS,
  currentOfficialStatus: 'open',
  established: 1954,
  candidateCategory: 'sport',
  overlapAudit: {
    existingCanonicalNeighbour: 'ekebergsletta',
    duplicate: false,
    reason: 'Ekebergsletta is modeled as a broad football and tournament landscape. EKT is a separately named riding-school and animal-park facility with its own visitor identity and address.'
  },
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: result.coordinate,
  productionGate: result.status === 'verified_candidate' ? 'ready_for_canonical_production' : 'needs_coordinate_review',
  representationDecision: 'Model the named EKT riding-school and animal-park facility itself. Do not reuse the broad Ekebergsletta tournament-ground marker as a proxy. Keep riding school as the primary sport identity and the public animal park as an institution/use layer of the same physical facility.'
};
writeJson(`${OUT}/decision.json`, decision);

write(`${OUT}/README.md`, `# EKT Rideskole og Husdyrpark — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`ekt_rideskole_husdyrpark\`\n- Official visitor address: **${ADDRESS}**\n- Proposed category: **sport**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId || 'none'}**\n\nThe canonical overlap audit found no EKT duplicate. The existing \`ekebergsletta\` place represents the broad football/Norway Cup tournament landscape, while EKT is a separately named riding-school and animal-park facility. No canonical place is created by this intake pass.\n`);

console.log(`EKT Rideskole address intake completed: ${result.status}`);
