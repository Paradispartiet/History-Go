import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = 'reports/oslo-museum-special-coordinate-audit-20260720/ibsen-geonorge';
const PLACE_ID = 'ibsen_museum_teater';
const ADDRESS = 'Henrik Ibsens gate 26 Oslo';

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
const exactOutput = [stdout, stderr].filter(Boolean).join(stderr && stdout ? '\n--- STDERR ---\n' : '');
writeText(`${OUT_DIR}/terminal.txt`, exactOutput || `(no output; exit ${run.status ?? 'unknown'})`);

const parsed = parseFinderJson(stdout);
if (!parsed) throw new Error(`Could not parse address-finder JSON output; exit=${run.status}`);
writeJson(`${OUT_DIR}/result.json`, parsed);

const decision = {
  version: '2026-07-20',
  placeId: PLACE_ID,
  addressQuery: ADDRESS,
  historicSiteAddress: 'Arbins gate 1 Oslo',
  displayAnchorDecision: 'current_public_visitor_address',
  commandExitCode: run.status,
  finderStatus: parsed.status,
  ok: parsed.ok,
  sourceProvider: parsed.sourceProvider || null,
  sourceObjectId: parsed.sourceObjectId || null,
  sourceUrl: parsed.sourceUrl || null,
  coordinate: parsed.coordinate || null,
  productionGate: parsed.status === 'verified_candidate'
    ? 'ready_for_identity_crosscheck_and_canonical_production'
    : 'needs_review',
  note: 'The current visitor entrance at Henrik Ibsens gate 26 is the display/unlock anchor. Arbins gate 1 remains the historical apartment layer and must be preserved in the place content rather than substituted as the public entrance coordinate.'
};
writeJson(`${OUT_DIR}/decision.json`, decision);

const readme = `# Ibsen Museum & Teater — Geonorge address intake\n\nDate: 2026-07-20\n\n- Place ID: \`${PLACE_ID}\`\n- Public visitor address: **${ADDRESS}**\n- Historical apartment address: **Arbins gate 1 Oslo**\n- Finder status: **${parsed.status}**\n- Source object: **${parsed.sourceObjectId || 'none'}**\n\nThe public visitor address is the display/unlock anchor. The historical Ibsen apartment in Arbins gate 1 remains an explicit historical layer in the place record. No canonical place is created by this intake pass.\n`;
writeText(`${OUT_DIR}/README.md`, readme);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log(`Ibsen Museum address intake completed: ${parsed.status}`);
