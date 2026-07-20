import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = 'reports/oslo-attractions-completeness-20260720/oslo-reptilpark';
const PLACE_ID = 'oslo_reptilpark';
const ADDRESS = 'St. Olavs gate 2 Oslo';

function abs(rel) { return path.join(ROOT, rel); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function writeText(rel, text) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), text.endsWith('\n') ? text : `${text}\n`);
}
function parseFinderJson(stdout) {
  const first = stdout.indexOf('{');
  const last = stdout.lastIndexOf('}');
  if (first < 0 || last < first) return null;
  try { return JSON.parse(stdout.slice(first, last + 1)); }
  catch { return null; }
}

const run = spawnSync(
  'npm',
  ['run', 'places:coords:find:address', '--', '--address', ADDRESS],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 180000 }
);
const stdout = run.stdout || '';
const stderr = run.stderr || '';
writeText(`${OUT_DIR}/terminal.txt`, [stdout, stderr].filter(Boolean).join(stderr && stdout ? '\n--- STDERR ---\n' : '') || `(no output; exit ${run.status ?? 'unknown'})`);

const parsed = parseFinderJson(stdout);
if (!parsed) throw new Error(`Could not parse address-finder JSON output; exit=${run.status}`);
writeJson(`${OUT_DIR}/result.json`, parsed);
writeJson(`${OUT_DIR}/decision.json`, {
  version: '2026-07-20',
  placeId: PLACE_ID,
  addressQuery: ADDRESS,
  currentOfficialStatus: 'open',
  firstOpened: '2002-01-10',
  movedToCurrentAddress: '2007-09',
  candidateCategory: 'vitenskap',
  finderStatus: parsed.status,
  ok: parsed.ok === true,
  sourceProvider: parsed.sourceProvider || null,
  sourceObjectId: parsed.sourceObjectId || null,
  sourceUrl: parsed.sourceUrl || null,
  coordinate: parsed.coordinate || null,
  productionGate: parsed.status === 'verified_candidate' ? 'ready_for_canonical_production' : 'needs_review',
  representationDecision: 'Model the indoor zoological collection and public science/animal education venue itself. Do not use nearby St. Olav church, Edderkoppen Scene or the surrounding district as proxy anchors.'
});
writeText(`${OUT_DIR}/README.md`, `# Oslo Reptilpark — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${PLACE_ID}\`\n- Official visitor address: **${ADDRESS}**\n- Proposed category: **vitenskap**\n- Finder status: **${parsed.status}**\n- Source object: **${parsed.sourceObjectId || 'none'}**\n\nOslo Reptilpark is a concrete indoor animal and public-education venue. It opened in Storgata on 10 January 2002 and moved to the current St. Olavs gate 2 premises in September 2007. The current official site lists regular opening hours and the same visitor address. No canonical place is created by this intake pass.\n`);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log(`Oslo Reptilpark address intake completed: ${parsed.status}`);
