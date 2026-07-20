import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = 'reports/oslo-attractions-completeness-20260720/brannmuseet-oslo';
const ADDRESS = 'Grønlandsleiret 32 Oslo';

function abs(rel) { return path.join(ROOT, rel); }
function write(rel, content) { fs.mkdirSync(path.dirname(abs(rel)), { recursive: true }); fs.writeFileSync(abs(rel), content); }
function writeJson(rel, value) { write(rel, JSON.stringify(value, null, 2) + '\n'); }

const run = spawnSync('npm', ['run', 'places:coords:find:address', '--', '--address', ADDRESS], { cwd: ROOT, encoding: 'utf8' });
const terminal = `${run.stdout || ''}${run.stderr || ''}`;
write(`${OUT}/terminal.txt`, terminal);
if (run.status !== 0) throw new Error(`Address finder exited with ${run.status}`);
const start = (run.stdout || '').indexOf('{');
if (start < 0) throw new Error('Address finder produced no JSON payload');
const result = JSON.parse(run.stdout.slice(start));
writeJson(`${OUT}/result.json`, result);
writeJson(`${OUT}/decision.json`, {
  version: '2026-07-20',
  placeId: 'brannmuseet_oslo',
  name: 'Brannmuseet i Oslo',
  addressQuery: ADDRESS,
  currentOfficialStatus: 'open_limited_hours',
  historicalBuildingStart: 1861,
  candidateCategory: 'historie',
  overlapAudit: {
    existingCanonicalNeighbour: 'gronlandsleiret',
    duplicate: false,
    reason: 'Grønlandsleiret is a street-level urban place; Brannmuseet occupies the former Grønland fire station as a distinct named historic building and museum.'
  },
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: result.coordinate,
  productionGate: result.status === 'verified_candidate' ? 'ready_for_canonical_production' : 'needs_coordinate_review',
  representationDecision: 'Model the former Grønland fire station / current Brannmuseet as one historical building-place. Do not reuse the broad Grønlandsleiret street marker as a proxy and do not create separate overlapping markers for the museum and historic fire station.'
});
write(`${OUT}/README.md`, `# Brannmuseet i Oslo — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`brannmuseet_oslo\`\n- Official visitor address: **${ADDRESS}**\n- Proposed category: **historie**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId || 'none'}**\n\nThe canonical overlap audit found no Brannmuseet/Grønland fire-station place. The existing \`gronlandsleiret\` record represents the street, while the former fire station is a separately named historic building that now houses the museum. No canonical place is created by this intake pass.\n`);
console.log(`Brannmuseet address intake completed: ${result.status}`);
