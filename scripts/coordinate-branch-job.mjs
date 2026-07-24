import { readFile, rm, writeFile } from 'node:fs/promises';

const base = 'reports/oslo-coordinate-sigrid-undset-independent-anchor-post-195';
const compactPath = `${base}/compact-summary.json`;
const summaryPath = `${base}/summary.json`;
const readmePath = `${base}/README.md`;

const compact = JSON.parse(await readFile(compactPath, 'utf8'));
if (compact.placeId !== 'sigrid_undset_statue') throw new Error('Unexpected compact report placeId.');
if (compact.decision !== 'keep_needs_source_no_independent_exact_anchor') throw new Error(`Unexpected decision: ${compact.decision}`);
if ((compact.exactIndependentCandidates ?? []).length !== 0) throw new Error('Compact report still contains exact candidates.');
if ((compact.falsePositiveCandidates ?? []).length !== 2) throw new Error('Expected two documented false positives.');
if (!compact.hardGates?.rejectedOsmNodeBlocked) throw new Error('Rejected OSM node hard gate is missing.');

compact.reportRetention = {
  policy: 'compact_machine_traceable_summary_only',
  removedRawCaptures: [
    '500-file Commons geosearch and full EXIF detail dump',
    '2,036-row nearby Wikidata SPARQL response',
    'raw Overpass artwork/memorial response',
    'blocked eMuseum HTML/JSON/XML/RDF response bodies',
    'live artist and Oslo municipality HTML bodies'
  ],
  retainedEvidence: 'Endpoint URLs, HTTP status, source hashes, query result counts, relevant result metadata, nearest OSM rows, all exact-candidate decisions and false-positive rejection reasons remain in this summary.'
};

await writeFile(summaryPath, `${JSON.stringify(compact, null, 2)}\n`, 'utf8');
await writeFile(readmePath, `# Sigrid Undset independent-anchor research after batch 195\n\n- Canonical coordinate remains unchanged and \`needs_source\`.\n- Exact official object identity: Oslo kommunes kunstsamling object 2339 / eMuseum 168573.\n- Rejected node \`osm-node:7596280553\` remains hard-blocked.\n- Artist and Oslo municipality identity sources were live and consistent.\n- eMuseum blocked GitHub Actions with HTTP 403; the exact merged object contract was used.\n- Commons exact text searches: 0 relevant results.\n- Commons geosearch inspected 500 nearby files.\n- Two token matches were rejected because both depict athlete Sigrid Borge at Bislett Games 2026.\n- Wikidata searched 2,036 nearby coordinate-bearing items; no exact Sigrid Undset monument identity was found.\n- OSM inspected 93 nearby artwork/memorial objects; no new exact identity candidate was found.\n- Nominatim returned 0 exact results for all three monument queries.\n- Decision: \`keep_needs_source_no_independent_exact_anchor\`.\n\nThe retained \`summary.json\` contains URLs, status codes, hashes, counts, relevant metadata and rejection reasons. Voluminous raw API/EXIF captures were deliberately removed before merge. No canonical place, coordinate, evidence or protocol data changes are made.\n`, 'utf8');

await Promise.all([
  rm(compactPath, { force: true }),
  rm(`${base}/commons-details.json`, { force: true }),
  rm(`${base}/commons-geosearch.json`, { force: true }),
  rm(`${base}/overpass-artwork-memorials.json`, { force: true }),
  rm(`${base}/wikidata-sparql.json`, { force: true }),
  rm(`${base}/responses`, { recursive: true, force: true }),
  rm(`${base}/images`, { recursive: true, force: true })
]);

console.log(JSON.stringify({
  decision: compact.decision,
  exactIndependentCandidateCount: compact.exactIndependentCandidates.length,
  falsePositiveCount: compact.falsePositiveCandidates.length,
  retainedReport: summaryPath
}, null, 2));
