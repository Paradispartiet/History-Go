import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const address = 'Skedsmogata 23 Oslo';
const outDir = 'reports/oslo-attractions-completeness-20260720/kampen-okologiske-barnebondegard';

const stdout = execFileSync(
  'npm',
  ['run', 'places:coords:find:address', '--', '--address', address],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
);
process.stdout.write(stdout);

const jsonStart = stdout.indexOf('{');
const jsonEnd = stdout.lastIndexOf('}');
if (jsonStart < 0 || jsonEnd <= jsonStart) {
  throw new Error('Could not locate JSON payload in address-finder output.');
}

const result = JSON.parse(stdout.slice(jsonStart, jsonEnd + 1));
const hit = result.rawHit ?? {};

const exactAddress =
  result.ok === true &&
  result.status === 'verified_candidate' &&
  hit.adressetekst === 'Skedsmogata 23' &&
  hit.kommunenummer === '0301' &&
  hit.kommunenavn === 'OSLO';

if (!exactAddress) {
  throw new Error(
    `Address gate failed for ${address}: ${JSON.stringify({
      ok: result.ok,
      status: result.status,
      reason: result.reason,
      adressetekst: hit.adressetekst,
      kommunenummer: hit.kommunenummer,
      kommunenavn: hit.kommunenavn,
    })}`,
  );
}

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`);

const decision = {
  version: '2026-07-20',
  placeId: 'kampen_okologiske_barnebondegard',
  addressQuery: address,
  currentOfficialStatus: 'open_with_seasonal_schedule',
  candidateCategory: null,
  taxonomyDecision: 'pending_canonical_taxonomy_audit',
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: result.coordinate,
  productionGate: 'coordinate_ready_taxonomy_pending',
  representationDecision:
    'Model Kampen Økologiske Barnebondegård as one physical visitor and learning-farm site at Skedsmogata 23. The farmyard, school garden, barn and stable are integrated parts of the same public site and must not become overlapping canonical markers.',
  duplicateGate: {
    canonicalNameSearch: 'no active Kampen Økologiske Barnebondegård place found before this intake',
    aliasSearch: 'no active barnebondegård or Skedsmogata 23 place found before this intake',
    nearbyCanonicalPlaces:
      'Kampen church and Kampen Park activity places are physically separate and do not represent the farm site.',
  },
  sourceNotes: [
    'The official Kampen Økologiske Barnebondegård site gives the visitor address Skedsmogata 23, 0655 Oslo.',
    'The official site describes a distinct farm complex with farmyard, school garden, barn and stable between Kampen school and Ensjø metro station.',
    'VisitOSLO lists Kampen Økologiske Barnebondegård as a current Oslo attraction at Skedsmogata 23.',
    'The site is seasonally operated; summer 2026 opening information states ordinary reopening in week 34 after the animals return from summer pasture.',
  ],
};
writeFileSync(`${outDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`);

const readme = `# Kampen Økologiske Barnebondegård — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`kampen_okologiske_barnebondegard\`\n- Official visitor address: **Skedsmogata 23 Oslo**\n- Proposed category: **pending canonical taxonomy audit**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n\nThe farm's official site identifies Skedsmogata 23 as the visitor address and describes one integrated urban farm site with a farmyard, school garden, barn and stable. VisitOSLO also lists the same attraction and address. Repo-wide name and address searches found no active canonical place for the farm before this intake. Existing Kampen church and Kampen Park records are separate physical sites.\n\nThis pass only validates the current physical address coordinate. No canonical place is created here. Final taxonomy must distinguish the farm's primary identity as an urban child-focused learning and community site from historical farm records such as Geitmyra and sport-led animal sites such as EKT.\n`;
writeFileSync(`${outDir}/README.md`, readme);

console.log(`Saved Kampen barnebondegård address intake evidence to ${outDir}`);
