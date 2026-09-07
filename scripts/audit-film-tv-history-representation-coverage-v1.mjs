import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/film-tv-history-representation-coverage-audit-v1.json';
const EXPECTED_BASELINE = 'a7f940db30462048d949720c485b1cb65932a6b7';
const EXPECTED_CORE = 613;

function fail(message) {
  throw new Error(`[film-tv-history-representation-coverage] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

const doc = readJson(REPORT);

assert(doc.schema === 'history_go_film_tv_history_representation_coverage_audit_v1', 'schema mismatch');
assert(doc.version === '1.0.0', 'version mismatch');
assert(doc.status === 'OPEN_GAPS_FAIL_CLOSED', 'audit must remain fail-closed while P0 gaps are open');
assert(doc.baseline?.main_sha === EXPECTED_BASELINE, 'audit is not SHA-locked to the expected baseline');
assert(doc.baseline?.expected_production_verified_core_scenarios === EXPECTED_CORE, '613-scenario core invariant changed');
assert(doc.baseline?.core_selection_frozen_during_audit === true, 'core must stay frozen during representation audit');
assert(doc.baseline?.chapter_19_frozen_observation_baseline === '2020-2025', 'Chapter 19 observation baseline changed');

const scale = doc.coverage_scale ?? {};
for (const key of ['0', '1', '2', '3']) {
  assert(scale[key]?.label, `coverage scale ${key} missing`);
}
assert(scale['0'].label === 'uncovered', 'status 0 must mean uncovered');
assert(scale['1'].label === 'weak', 'status 1 must mean weak');
assert(scale['2'].label === 'covered', 'status 2 must mean covered');
assert(scale['3'].label === 'triangulated', 'status 3 must mean triangulated');

const requiredAxes = [
  'technology_and_format',
  'production_economics_and_organization',
  'institutions_and_industry_systems',
  'geography_and_transnational_production',
  'aesthetics_and_form',
  'genre_and_popular_cinema',
  'labor_crew_and_union_history',
  'distribution_exhibition_and_audience_behavior',
  'production_scale_studio_midbudget_microbudget_independent',
  'regulation_power_finance_and_coproduction',
  'preservation_restoration_and_material_survival',
  'accessibility_sustainability_and_environmental_production'
];
const axisSet = new Set(doc.audit_axes ?? []);
for (const axis of requiredAxes) assert(axisSet.has(axis), `required audit axis missing: ${axis}`);
assert(axisSet.size === (doc.audit_axes ?? []).length, 'audit axes contain duplicates');

const strengthIds = new Set();
for (const row of doc.verified_existing_strengths ?? []) {
  assert(!strengthIds.has(row.development_id), `duplicate strength id: ${row.development_id}`);
  strengthIds.add(row.development_id);
  assert([2, 3].includes(row.initial_status), `verified strength ${row.development_id} must be status 2 or 3`);
  assert(Array.isArray(row.case_ids) && row.case_ids.length > 0, `verified strength ${row.development_id} lacks cases`);
}

const gapIds = new Set();
for (const row of doc.priority_gaps ?? []) {
  assert(!gapIds.has(row.development_id), `duplicate gap id: ${row.development_id}`);
  gapIds.add(row.development_id);
  assert([0, 1].includes(row.initial_status), `gap ${row.development_id} must remain status 0 or 1 until stronger evidence is mapped`);
  assert(['P0', 'P1', 'P2'].includes(row.priority), `gap ${row.development_id} has invalid priority`);
  assert(Array.isArray(row.axis_ids) && row.axis_ids.length > 0, `gap ${row.development_id} has no audit axes`);
  for (const axis of row.axis_ids) assert(axisSet.has(axis), `gap ${row.development_id} uses unknown axis ${axis}`);
}
assert((doc.priority_gaps ?? []).some((row) => row.priority === 'P0' && row.initial_status === 0), 'fail-closed audit must expose the currently documented P0 uncovered gaps');

const chapter19Ids = new Set();
for (const row of doc.chapter_19_fail_closed_matrix ?? []) {
  assert(!chapter19Ids.has(row.development_id), `duplicate Chapter 19 development id: ${row.development_id}`);
  chapter19Ids.add(row.development_id);
  assert([0, 1, 2, 3].includes(row.initial_status), `invalid Chapter 19 status: ${row.development_id}`);
  assert(['P0', 'P1', 'P2'].includes(row.priority), `invalid Chapter 19 priority: ${row.development_id}`);
  assert(typeof row.required_evidence === 'string' && row.required_evidence.length >= 30, `Chapter 19 row lacks concrete evidence requirement: ${row.development_id}`);
}
assert(chapter19Ids.size >= 13, 'Chapter 19 matrix is too narrow');

const gate = doc.candidate_admission_gate ?? {};
assert(gate.default === 'REJECT_NEW_IDENTITY', 'new scenario identity must be rejected by default');
for (const reason of [
  'closes_status_0_to_at_least_2',
  'raises_status_1_to_at_least_2',
  'raises_status_2_to_3_where_current_coverage_is_geographically_economically_or_institutionally_skewed'
]) {
  assert((gate.allowed_reasons ?? []).includes(reason), `missing allowed admission reason: ${reason}`);
}
for (const requirement of [
  'exact_historical_development_id',
  'current_coverage_status_with_evidence',
  'search_for_existing_613_scenarios_that_can_close_gap',
  'proof_that_in_place_enrichment_is_insufficient',
  'production_verification_source_set',
  'explicit_axis_contribution',
  'distinctiveness_against_existing_cases',
  'no_award_or_festival_status_as_primary_rationale'
]) {
  assert((gate.required_before_new_identity ?? []).includes(requirement), `missing new-identity prerequisite: ${requirement}`);
}
for (const reject of ['important_movie_only', 'festival_or_award_winner_only', 'critical_consensus_only', 'nationality_token_only']) {
  assert((gate.hard_reject_reasons ?? []).includes(reject), `missing hard reject reason: ${reject}`);
}

assert(doc.closure_contract?.selection_may_be_called_representationally_audited === false, 'selection may not be called closed while documented gaps remain');
assert((doc.closure_contract?.required_to_close ?? []).includes('map_every_production_verified_atlas_scenario_to_zero_or_more_historical_development_ids'), 'closure must require exact scenario mapping');

for (const evidencePath of doc.evidence_paths ?? []) {
  assert(fs.existsSync(path.join(ROOT, evidencePath)), `evidence path missing: ${evidencePath}`);
}

const p0Uncovered = (doc.priority_gaps ?? []).filter((row) => row.priority === 'P0' && row.initial_status === 0).length;
const p0Weak = (doc.priority_gaps ?? []).filter((row) => row.priority === 'P0' && row.initial_status === 1).length;
const ch19Uncovered = (doc.chapter_19_fail_closed_matrix ?? []).filter((row) => row.initial_status === 0).length;
const ch19Weak = (doc.chapter_19_fail_closed_matrix ?? []).filter((row) => row.initial_status === 1).length;

console.log(JSON.stringify({
  status: 'PASS_FAIL_CLOSED',
  baseline_main_sha: doc.baseline.main_sha,
  expected_core_scenarios: doc.baseline.expected_production_verified_core_scenarios,
  verified_strengths: (doc.verified_existing_strengths ?? []).length,
  priority_gaps: (doc.priority_gaps ?? []).length,
  p0_uncovered: p0Uncovered,
  p0_weak: p0Weak,
  chapter19_rows: chapter19Ids.size,
  chapter19_uncovered: ch19Uncovered,
  chapter19_weak: ch19Weak,
  new_identity_default: gate.default,
  representational_closure: false
}, null, 2));
