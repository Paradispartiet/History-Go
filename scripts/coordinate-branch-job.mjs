import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-unresolved-audit-post-195');
const summaryPath = join(reportDir, 'summary.json');
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(summary.coordinateMaxBatch === 195, 'Audit is not post-195.');
assert(summary.activeUnresolvedCentralCount === 1, 'Unexpected central unresolved count.');
assert(summary.centralProductionReadyCount === 0, 'Central queue is no longer blocked.');
assert(summary.centralRows?.[0]?.placeId === 'sigrid_undset_statue', 'Unexpected central unresolved place.');
assert(summary.centralRows[0].productionReadiness === 'needs_source_or_scope', 'Sigrid Undset unexpectedly production-ready.');
assert(!summary.rankedOsloRows.some((row) => row.placeId === 'frognerstranda'), 'Verified Frognerstranda remains unresolved.');

const outsideRows = summary.rankedOsloRows.filter((row) => row.centralBbox === false);
assert(outsideRows.length === summary.outsideCentralUnresolvedCount, 'Outside-central queue count mismatch.');
assert(outsideRows.length > 0, 'No outside-central candidate exists.');
const nextCandidate = outsideRows.find((row) => row.productionReadiness === 'production_ready') ?? outsideRows[0];
assert(nextCandidate.placeId === 'bygdoy_natur', `Expected ranked outside-central candidate bygdoy_natur, got ${nextCandidate.placeId}.`);

summary.nextCandidate = nextCandidate;
summary.decision = nextCandidate.productionReadiness === 'production_ready'
  ? 'central_queue_blocked_continue_with_next_production_ready_oslo_candidate'
  : 'central_queue_blocked_continue_with_ranked_research_first_outside_central_candidate';
summary.scope.nextCandidateRule = 'When no central place is production-ready, select the highest-ranked unresolved Oslo place outside the central box; do not recycle the blocked central place.';

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(join(reportDir, 'README.md'), `# Oslo unresolved coordinate audit after batch 195\n\nCoordinate protocol max batch: **195**.\n\n## Oslo sentrum\n\n- unresolved central places: **${summary.activeUnresolvedCentralCount}**\n- production-ready central places: **${summary.centralProductionReadyCount}**\n- remaining central place: **sigrid_undset_statue**\n\nFrognerstranda is excluded because batch 195 applied Oslo kommunes official full-scope GeoJSON and set the place to \`verified_geometry\`. Sigrid Undset-statuen remains blocked; exact OSM node 7596280553 is explicitly rejected and cannot be reused.\n\n## Whole Oslo queue\n\n- active unresolved evidence-backed Oslo places: **${summary.activeUnresolvedOsloCount}**\n- outside the central box: **${summary.outsideCentralUnresolvedCount}**\n- production-ready: **${summary.readinessCounts.production_ready ?? 0}**\n- needs source or scope: **${summary.readinessCounts.needs_source_or_scope ?? 0}**\n\nBecause the central queue has no production-ready place, the next candidate is selected from outside the central box.\n\nNext candidate: **${nextCandidate.placeId} — ${nextCandidate.name}**  \nReadiness: **${nextCandidate.productionReadiness}**  \nDecision: **${summary.decision}**\n\nNo canonical place, coordinate evidence or protocol data changed in this audit.\n`, 'utf8');

console.log(JSON.stringify({
  coordinateMaxBatch: summary.coordinateMaxBatch,
  centralCandidate: summary.centralRows[0].placeId,
  centralCandidateReadiness: summary.centralRows[0].productionReadiness,
  nextCandidate: {
    placeId: nextCandidate.placeId,
    name: nextCandidate.name,
    productionReadiness: nextCandidate.productionReadiness,
    distanceFromCentralReferenceM: nextCandidate.distanceFromCentralReferenceM
  },
  decision: summary.decision
}, null, 2));
