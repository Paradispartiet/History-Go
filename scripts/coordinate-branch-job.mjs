import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const address = 'Monrads gate 12 Oslo';
const outDir = 'reports/oslo-attractions-completeness-20260720/klimahuset';

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
  hit.adressetekst === 'Monrads gate 12' &&
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
  placeId: 'klimahuset',
  addressQuery: address,
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: result.coordinate,
  candidateGeometry: {
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:762832690',
    approximateRepresentativePoint: {
      lat: 59.91951,
      lon: 10.77289,
    },
    role: 'identity_and_visual_QA_only_until_cross_checked',
  },
  productionGate: 'coordinate_ready_overlap_and_taxonomy_review_pending',
  representationDecision:
    'Treat Klimahuset as a physically distinct named exhibition building and visitor experience inside the wider Naturhistorisk museum and Botanisk hage campus. Do not use the broad Sars gate 1 campus address as a proxy if Monrads gate 12 resolves to the building. Do not split the exhibition, auditorium and architecture into overlapping place markers.',
  duplicateGate: {
    canonicalNameSearch: 'no active Klimahuset place found before this intake',
    institutionalParent: 'naturhistorisk_museum',
    enclosingCampus: 'botanisk_hage',
    conclusion:
      'Not a duplicate if the Monrads gate 12 point and named Klimahuset building geometry resolve to the same distinct building. Existing parent/campus records remain broader places.',
  },
  sourceNotes: [
    'Naturhistorisk museum identifies Klimahuset as a dedicated exhibition house for climate and climate change, part of Naturhistorisk museum and located in Botanisk hage.',
    'The building opened to the public in June 2020 after completion in March 2020.',
    'Oslo municipality currently uses Monrads gate 12 as the address for Klimahuset in its public venue information.',
    'Atelier Oslo documents a distinct roughly 700 square metre building for exhibitions and events on climate and climate change.',
    'OpenStreetMap has a separately named Klimahuset building candidate, way 762832690, which must be used only as geometry/identity QA after the normative address-first lookup.',
  ],
};
writeFileSync(`${outDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`);

const readme = `# Klimahuset — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`klimahuset\`\n- Exact address tested: **Monrads gate 12 Oslo**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n- Geometry QA candidate: **osm-way:762832690**\n\nKlimahuset is institutionally part of Naturhistorisk museum and physically located within Botanisk hage, but authoritative and architectural sources describe a separate named exhibition building opened in 2020. The canonical overlap gate therefore depends on the physical building identity, not on institutional ownership.\n\nThis pass applies the locked address-first method. The broad Sars gate 1 museum-campus address is deliberately not used as a shortcut. If Monrads gate 12 is an exact Geonorge hit and is spatially consistent with the named Klimahuset building, the candidate can proceed as a distinct physical place while retaining explicit parent/campus relations in content.\n\nNo canonical place is created in this intake. Final taxonomy should evaluate \`vitenskap\` as the likely primary category, with climate/environment as the substantive core and architecture/sustainable building design as a secondary analytical layer.\n`;
writeFileSync(`${outDir}/README.md`, readme);

console.log(`Saved Klimahuset address intake evidence to ${outDir}`);
