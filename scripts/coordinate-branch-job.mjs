import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const ADDRESS = 'Ekebergveien 99 Oslo';
const PLACE_ID = 'ekt_rideskole_husdyrpark';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/ekt-rideskole-husdyrpark';

function abs(rel) { return path.join(ROOT, rel); }
function writeText(rel, text) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), text.endsWith('\n') ? text : `${text}\n`);
}
function writeJson(rel, data) {
  writeText(rel, JSON.stringify(data, null, 2));
}
function parseFinderJson(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Address finder returned no JSON object');
  return JSON.parse(output.slice(start, end + 1));
}

const terminal = execFileSync(
  'npm',
  ['run', 'places:coords:find:address', '--', '--address', ADDRESS],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
);
process.stdout.write(terminal);
writeText(`${REPORT_DIR}/terminal.txt`, terminal);

const result = parseFinderJson(terminal);
writeJson(`${REPORT_DIR}/result.json`, result);

if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
  throw new Error(`EKT coordinate intake did not return verified_candidate: ${result.status ?? 'unknown'}`);
}

const decision = {
  version: '2026-07-20',
  placeId: PLACE_ID,
  addressQuery: ADDRESS,
  currentOfficialStatus: 'open',
  firstEstablished: 1954,
  currentSiteEstablished: 1964,
  candidateCategory: null,
  taxonomyDecision: 'pending_canonical_taxonomy_audit',
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: result.coordinate,
  productionGate: 'coordinate_ready_taxonomy_pending',
  representationDecision: 'Model EKT Rideskole og Husdyrpark as one physical visitor and riding-site record at the current Ekebergveien 99 complex. Do not create separate overlapping markers for the riding school and petting zoo unless later physical evidence establishes distinct public sites.',
  duplicateGate: {
    canonicalNameSearch: 'no active EKT Rideskole og Husdyrpark place found',
    aliasSearch: 'no active EKT or Husdyrpark alias found',
    addressNote: 'Older aggregate search text may mention Ekebergveien, but no canonical EKT place record was found before intake.'
  },
  sourceNotes: [
    'VisitOSLO lists EKT Rideskole og Husdyrpark as a current Oslo attraction at Ekebergveien 99.',
    'EKT states that the rideschool was established in 1954 and that the present Ekebergveien 99 site was developed after a municipal lease agreement in 1964.',
    'The official EKT site identifies the current visitor address as Ekebergveien 99.'
  ]
};
writeJson(`${REPORT_DIR}/decision.json`, decision);

const readme = `# EKT Rideskole og Husdyrpark — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${PLACE_ID}\`\n- Official visitor address: **Ekebergveien 99 Oslo**\n- Proposed category: **pending canonical taxonomy audit**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n\nVisitOSLO currently lists EKT Rideskole og Husdyrpark as an Oslo attraction, and EKT's own site identifies the same visitor address. The institution was established in 1954; the current Ekebergveien 99 complex dates from the 1964 municipal lease and subsequent construction of riding hall, stables and animal park. Repo-wide name, alias and Husdyrpark searches found no active canonical EKT place before this intake.\n\nThis pass only validates the current physical address coordinate. No canonical place is created here, and the final History Go category remains deliberately unresolved until the taxonomy fit between sport, nature and public animal education has been audited against existing canonical place patterns.\n`;
writeText(`${REPORT_DIR}/README.md`, readme);

console.log(`Saved EKT address intake evidence to ${REPORT_DIR}`);
