import { readFile, writeFile } from 'node:fs/promises';

const base = 'reports/oslo-coordinate-sigrid-undset-independent-anchor-post-195';
const summaryPath = `${base}/summary.json`;
const compactPath = `${base}/compact-summary.json`;
const readmePath = `${base}/README.md`;

const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
const compact = JSON.parse(await readFile(compactPath, 'utf8'));

if (summary.placeId !== 'sigrid_undset_statue' || compact.placeId !== 'sigrid_undset_statue') {
  throw new Error('Unexpected place identity in Sigrid research reports.');
}
if (!summary.hardGates?.rejectedOsmNodeBlocked || !compact.hardGates?.rejectedOsmNodeBlocked) {
  throw new Error('Rejected OSM node hard gate is missing.');
}

const expectedFalsePositiveIds = new Set([
  'commons:File:Bislett Games 2026 - Sigrid Borge.jpg',
  'commons:File:Bislett Games 2026 - Sigrid Borge (2).jpg'
]);
const rawCandidates = summary.exactIndependentCandidates ?? [];
if (rawCandidates.length !== 2 || rawCandidates.some((candidate) => !expectedFalsePositiveIds.has(candidate.sourceObjectId))) {
  throw new Error(`Unexpected candidate set: ${JSON.stringify(rawCandidates)}`);
}

const falsePositiveCandidates = rawCandidates.map((candidate) => ({
  ...candidate,
  rejected: true,
  rejectionReason: 'The Commons file title, description and categories identify Norwegian javelin thrower Sigrid Borge at Bislett Games 2026. The match came from the token “Sigrid” alone and has no connection to Sigrid Undset, Kjersti Wexelsen Goksøyr, Stensparken or the granite monument.'
}));

for (const report of [summary, compact]) {
  report.falsePositiveCandidates = falsePositiveCandidates;
  report.exactIndependentCandidates = [];
  report.coordinateChanged = false;
  report.decision = 'keep_needs_source_no_independent_exact_anchor';
  report.nextAction = 'Keep needs_source. Seek a new authoritative public-art point dataset or a geotagged image explicitly identifying and visibly matching the official grey-granite Sigrid Undset monument. Do not retry OSM node 7596280553.';
  report.filterCorrection = {
    date: '2026-07-24',
    reason: 'The initial candidate filter accepted files matching the standalone token “Sigrid”. Manual metadata review proved both candidates depict athlete Sigrid Borge at Bislett Games, not Sigrid Undset or her monument.',
    correctedRule: 'An independent candidate must explicitly identify Sigrid Undset or the official work/artist, not merely another person named Sigrid.',
    rejectedCandidateCount: falsePositiveCandidates.length
  };
}

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(compactPath, `${JSON.stringify(compact, null, 2)}\n`, 'utf8');
await writeFile(readmePath, `# Sigrid Undset independent-anchor research after batch 195\n\n- Canonical coordinate remains unchanged and \`needs_source\`.\n- Exact official object identity: Oslo kommunes kunstsamling object 2339 / eMuseum 168573.\n- Rejected node \`osm-node:7596280553\` remains hard-blocked.\n- Artist and Oslo municipality identity sources were live and consistent.\n- eMuseum blocked GitHub Actions with HTTP 403; the exact merged object contract was therefore used.\n- Commons exact text searches: 0 relevant results.\n- Commons geosearch inspected 500 nearby files.\n- Two automated token matches were manually rejected: both depict athlete Sigrid Borge at Bislett Games 2026.\n- Wikidata/Wikimedia/OSM/Nominatim produced no exact independent Sigrid Undset monument anchor.\n- Decision: \`keep_needs_source_no_independent_exact_anchor\`.\n\nNo canonical place, coordinate, evidence or protocol data changes are made in this research pass.\n`, 'utf8');

console.log(JSON.stringify({
  decision: summary.decision,
  exactIndependentCandidateCount: summary.exactIndependentCandidates.length,
  rejectedFalsePositiveCount: summary.falsePositiveCandidates.length,
  coordinateChanged: summary.coordinateChanged
}, null, 2));
