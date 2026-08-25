const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const run = spawnSync(process.execPath, ['scripts/audit-civication-role-world-rollout-readiness.mjs', '--check'], {
  cwd: ROOT,
  encoding: 'utf8'
});
if (run.status !== 0) {
  process.stderr.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
}
assert.equal(run.status, 0, 'Readiness audit --check must pass without drift');

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
const career = readJson('data/Civication/careerGameplayMatrix.json');
const realism = readJson('data/Civication/roleWorldRealismMatrix.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');
const roleWorldIndex = readJson('data/Civication/roleWorlds/index.json');

assert.equal(readiness.schema, 'civication_role_world_rollout_readiness_v1');
assert.equal(readiness.version, 1);
assert.equal(readiness.semantics.audit_only_no_new_runtime, true);
assert.equal(readiness.semantics.existing_scene_pipeline_remains_canonical, true);
assert.equal(readiness.semantics.authority_contract_must_not_be_weakened, true);
assert.equal(readiness.semantics.one_role_per_rollout_pr, true);
assert.equal(readiness.semantics.cross_role_links_only_when_work_is_genuinely_shared, true);
assert.equal(readiness.semantics.employment_conditions_remain_role_owned_editorial_content, true);
assert.equal(readiness.semantics.professional_culture_remains_role_owned_editorial_content, true);
assert.equal(readiness.semantics.this_pr_does_not_open_broad_rollout, true);

const canonicalCareerWorlds = (career.worlds || []).filter((world) => ['reference_complete', 'playable', 'partial', 'architecture_only'].includes(world.status));
assert.equal(canonicalCareerWorlds.length, career.summary.career_worlds);
assert.equal(readiness.summary.canonical_career_roles, career.summary.career_worlds);
assert.equal(readiness.roles.length, career.summary.career_worlds);
assert.equal(new Set(readiness.roles.map((role) => role.key)).size, readiness.roles.length, 'Every canonical role key must be unique');
assert.deepEqual(
  readiness.roles.map((role) => role.key).sort(),
  canonicalCareerWorlds.map((world) => world.key).sort(),
  'Readiness gate must classify every canonical career world and no extras'
);

const classifications = new Set(['rollout_ready', 'needs_role_authored_work', 'blocked']);
const dimensions = [
  'persistent_work_object',
  'institution_authority',
  'rhythm_waiting_handoff_rework',
  'history_go_affordance',
  'situated_reputation',
  'people_places_integrity',
  'provenance'
];
for (const role of readiness.roles) {
  assert.ok(classifications.has(role.classification), `${role.key}: invalid readiness classification`);
  assert.deepEqual(Object.keys(role.dimensions), dimensions, `${role.key}: readiness dimensions drifted`);
  assert.ok(role.cross_role && typeof role.cross_role.need === 'string', `${role.key}: cross-role need must be explicit`);
  assert.ok(Array.isArray(role.source_refs), `${role.key}: source provenance must be explicit`);
  if (role.classification === 'blocked') assert.ok(role.blockers.length > 0, `${role.key}: blocked roles require explicit blockers`);
  if (role.classification === 'rollout_ready') {
    assert.equal(role.runtime_gate, true, `${role.key}: rollout_ready requires the existing career runtime gate`);
    assert.equal(role.dimensions.institution_authority.status === 'blocked', false, `${role.key}: rollout_ready cannot weaken authority`);
    assert.equal(role.dimensions.provenance.status === 'blocked', false, `${role.key}: rollout_ready requires provenance`);
  }
}

const counted = Object.values(readiness.summary.classifications).reduce((sum, value) => sum + value, 0);
assert.equal(counted, readiness.summary.canonical_career_roles, 'Classification counts must cover the whole canonical role matrix');
assert.equal(readiness.blocked_roles.length, readiness.summary.role_level_blocked_count);
for (const role of readiness.blocked_roles) assert.ok(role.blockers.length > 0, `${role.key}: blocked queue row needs reasons`);

const completedKeys = new Set((roleWorldIndex.roles || []).map((row) => `${row.category}/${row.role_scope}`));
const pilotKeys = new Set((realism.pilot_set || []).map((row) => `${row.category}/${row.role_scope}`));
for (const queued of readiness.rollout_queue) {
  assert.equal(completedKeys.has(queued.key), false, `${queued.key}: completed Role World must not be re-queued`);
  assert.equal(pilotKeys.has(queued.key), false, `${queued.key}: structural pilot must not be re-queued`);
}
assert.deepEqual(
  readiness.rollout_queue.map((row) => row.rank),
  readiness.rollout_queue.map((_, index) => index + 1),
  'Rollout queue ranks must be contiguous and deterministic'
);

assert.ok(readiness.first_wave_candidates.length >= 3 && readiness.first_wave_candidates.length <= 4, 'First rollout wave must contain 3–4 structurally varied role candidates');
assert.equal(new Set(readiness.first_wave_candidates.map((row) => row.key)).size, readiness.first_wave_candidates.length);
assert.equal(new Set(readiness.first_wave_candidates.map((row) => row.structural_family)).size, readiness.first_wave_candidates.length, 'First wave must not repeat the same life-world structure');
for (const row of readiness.first_wave_candidates) assert.equal(row.classification, 'rollout_ready', `${row.key}: first-wave candidate must be rollout_ready`);

assert.equal(realism.semantics.broad_rollout_allowed, false, 'Readiness PR must not open broad rollout in the Realism Matrix');
assert.equal(policy.realism_matrix_gate.broad_rollout_allowed, false, 'Readiness PR must not open broad rollout in policy');
assert.equal(readiness.gate.current_policy_still_closed, true);
assert.equal(readiness.gate.locked_matrix_dimensions_reference_proven, true);
assert.equal(readiness.gate.cross_role_program_proof_runtime_proven, true);
assert.equal(readiness.gate.role_coverage_complete, true);
assert.equal(readiness.gate.role_blockers_documented, true);
assert.equal(readiness.gate.gate_pass, true, 'Program-level readiness gate must be green before the separate policy PR');
assert.equal(readiness.gate.broad_rollout_allowed_now, false);
assert.equal(readiness.gate.policy_recommendation, 'open_with_role_level_gates_in_separate_policy_pr');
assert.equal(readiness.gate.next_required_pr, 'Civication Role World broad-rollout policy');

const roleOwned = new Set(realism.role_owned_not_global || []);
assert.ok(roleOwned.has('role_specific_employment_conditions'));
assert.ok(roleOwned.has('role_specific_professional_culture'));
assert.equal(realism.program_level_proofs.cross_role_links.status, 'runtime_proven');

console.log(`PASS: Role World rollout readiness classifies all ${readiness.summary.canonical_career_roles} canonical career roles, quarantines role-level blockers, keeps policy closed, and produces a deterministic varied rollout queue.`);
