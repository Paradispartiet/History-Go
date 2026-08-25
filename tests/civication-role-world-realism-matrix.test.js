const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const matrixPath = 'data/Civication/roleWorldRealismMatrix.json';
const matrix = json(matrixPath);
const policy = json('data/Civication/roleWorldPolicy.json');
const roleWorldIndex = json('data/Civication/roleWorlds/index.json');
const careerMatrix = json('data/Civication/careerGameplayMatrix.json');
const standingSource = read('js/Civication/core/civicationSocialStanding.js');

assert.equal(matrix.schema, 'civication_role_world_realism_matrix_v1');
assert.equal(matrix.version, 1);
assert.equal(matrix.status, 'gate_active_broad_rollout_blocked');
assert.equal(matrix.semantics.no_new_runtime, true);
assert.equal(matrix.semantics.new_parallel_scene_format_allowed, false);
assert.equal(matrix.semantics.completion_statuses_unchanged, true);
assert.equal(matrix.semantics.broad_rollout_allowed, false);
assert.deepEqual(matrix.semantics.independent_from, ['reference_complete', 'role_world_complete']);
assert.deepEqual(matrix.semantics.allowed_dimension_statuses, [
  'not_started',
  'editorial_only',
  'runtime_proven',
  'reference_proven'
]);

assert.equal(policy.runtime_boundary.new_runtime_allowed, false);
assert.equal(policy.runtime_boundary.new_parallel_scene_format_allowed, false);
assert.equal(policy.career_status_boundary.career_reference_status, 'reference_complete');
assert.equal(policy.career_status_boundary.not_equivalent_to, 'role_world_complete');
assert.deepEqual(policy.role_world_statuses, [
  'role_world_not_started',
  'role_world_in_production',
  'role_world_complete'
]);
assert.equal(policy.realism_matrix_gate.path, matrixPath);
assert.equal(policy.realism_matrix_gate.schema, matrix.schema);
assert.equal(policy.realism_matrix_gate.status, 'gate_active');
assert.equal(policy.realism_matrix_gate.broad_rollout_allowed, false);
assert.equal(policy.realism_matrix_gate.completion_statuses_unchanged, true);
assert.equal(policy.realism_matrix_gate.new_runtime_allowed, false);

const pilots = matrix.pilot_set;
assert.equal(pilots.length, 4, 'Matrix must remain grounded in exactly the four agreed structural pilots');
assert.equal(new Set(pilots.map((pilot) => pilot.id)).size, pilots.length, 'Pilot IDs must be unique');
assert.deepEqual(pilots.map((pilot) => pilot.id), [
  'archive_documentation',
  'by_plan',
  'sport_performance',
  'journalism'
]);
assert.equal(new Set(pilots.map((pilot) => pilot.structural_type)).size, 4, 'Each pilot must represent a distinct world structure');
for (const pilot of pilots) {
  assert.ok(['runtime_proven', 'reference_proven'].includes(pilot.proof_status), `${pilot.id}: invalid proof status`);
  assert.ok(Array.isArray(pilot.evidence_refs) && pilot.evidence_refs.length >= 3, `${pilot.id}: evidence must be explicit`);
  for (const ref of pilot.evidence_refs) assert.ok(exists(ref), `${pilot.id}: missing evidence ref ${ref}`);
}

const indexedKeys = new Set((roleWorldIndex.roles || []).map((entry) => `${entry.category}/${entry.role_scope}`));
const indexedPilots = pilots.filter((pilot) => pilot.proof_status === 'reference_proven');
for (const pilot of indexedPilots) {
  const key = `${pilot.category}/${pilot.role_scope}`;
  assert.ok(indexedKeys.has(key), `Indexed structural pilot missing: ${pilot.id}`);
}
const archivePilot = pilots.find((pilot) => pilot.id === 'archive_documentation');
assert.ok(archivePilot, 'Archive structural vertical must remain declared');
assert.ok(!indexedKeys.has(`${archivePilot.category}/${archivePilot.role_scope}`), 'Archive vertical must not be fabricated into Role World completion by the Matrix');
const careerPilot = pilots.find((pilot) => pilot.id === 'by_plan');
assert.ok(careerPilot && careerMatrix.worlds.some((world) => world.key === `${careerPilot.category}/${careerPilot.role_scope}`), 'Career Matrix remains an independent status source');

const expectedDimensions = [
  'persistent_work_object',
  'institution_authority',
  'rhythm_waiting_handoff_rework',
  'history_go_affordance',
  'situated_audience_types',
  'people_places_integrity',
  'provenance'
];
assert.deepEqual(matrix.locked_cross_role_dimensions.map((entry) => entry.id), expectedDimensions);
assert.equal(new Set(expectedDimensions).size, expectedDimensions.length);
const pilotIds = new Set(pilots.map((pilot) => pilot.id));
for (const dimension of matrix.locked_cross_role_dimensions) {
  assert.equal(dimension.status, 'reference_proven', `${dimension.id}: locked cross-role field must be reference-proven`);
  assert.ok(String(dimension.contract || '').trim(), `${dimension.id}: contract text required`);
  assert.ok(Array.isArray(dimension.evidence_pilots) && dimension.evidence_pilots.length >= 3, `${dimension.id}: needs evidence from at least three structurally different pilots`);
  assert.equal(new Set(dimension.evidence_pilots).size, dimension.evidence_pilots.length, `${dimension.id}: duplicate pilot evidence`);
  for (const pilotId of dimension.evidence_pilots) assert.ok(pilotIds.has(pilotId), `${dimension.id}: unknown pilot ${pilotId}`);
}

const situated = matrix.locked_cross_role_dimensions.find((entry) => entry.id === 'situated_audience_types');
assert.deepEqual(situated.bounded_audience_types, [
  'manager:*',
  'team:*',
  'professional:*',
  'public:*',
  'source:*'
]);
for (const prefix of ['manager', 'team', 'professional', 'public', 'source']) {
  assert.match(standingSource, new RegExp(`\\b${prefix}\\b`), `Situated-standing runtime must still recognize ${prefix}:*`);
}
assert.match(standingSource, /career\.reputation remains the legacy\/global summary/);
assert.match(standingSource, /it grants no authority/i);

const crossRole = matrix.cross_role_shared_world_proof;
assert.ok(crossRole, 'Matrix must carry a concrete shared-world proof');
assert.equal(crossRole.status, 'runtime_proven');
assert.ok(crossRole.work_object_id);
assert.ok(crossRole.institution_id);
assert.equal(crossRole.owner.category, crossRole.second_role.category);
assert.notEqual(crossRole.owner.role_scope, crossRole.second_role.role_scope);
assert.equal(crossRole.authority_contract.active_role_scope_mismatch_must_block, true);
assert.equal(crossRole.authority_contract.second_role_cannot_overwrite_owner_evidence, true);
assert.equal(crossRole.authority_contract.shared_object_does_not_transfer_owner_role_scope, true);
for (const ref of Object.values(crossRole.source_refs)) assert.ok(exists(ref), `cross-role source missing: ${ref}`);
for (const ref of crossRole.evidence_refs) assert.ok(exists(ref), `cross-role evidence missing: ${ref}`);

assert.equal(matrix.program_level_proofs.cross_role_links.status, 'runtime_proven');
assert.equal(matrix.program_level_proofs.cross_role_links.proof_ref, 'cross_role_shared_world_proof');
assert.ok(String(matrix.program_level_proofs.cross_role_links.contract || '').trim());
for (const ref of matrix.program_level_proofs.cross_role_links.evidence_refs) assert.ok(exists(ref), `program proof missing: ${ref}`);

const roleOwned = new Set(matrix.role_owned_not_global || []);
for (const required of [
  'work_object_kind',
  'work_object_phase_names',
  'relationship_actor_ids',
  'role_specific_authority_actions',
  'role_specific_professional_culture',
  'role_specific_employment_conditions'
]) {
  assert.ok(roleOwned.has(required), `Role-owned boundary missing: ${required}`);
}
for (const dimension of matrix.locked_cross_role_dimensions) {
  assert.ok(!roleOwned.has(dimension.id), `${dimension.id} cannot be both globally locked and role-owned`);
}

const deferred = new Map((matrix.deferred_dimensions || []).map((entry) => [entry.id, entry]));
assert.equal(deferred.get('employment_conditions')?.status, 'editorial_only');
assert.equal(deferred.get('professional_culture')?.status, 'editorial_only');
assert.equal(deferred.has('cross_role_links'), false, 'cross-role links leave deferred debt only after runtime proof exists');
for (const entry of deferred.values()) assert.ok(String(entry.reason || '').trim(), `${entry.id}: deferred reason required`);

assert.deepEqual(matrix.required_gate_tests, [
  'tests/civication-role-world-realism-matrix.test.js',
  'tests/civication-cross-role-shared-world.test.js',
  'tests/civication-semantic-playthrough-gate.test.js',
  'tests/civication-compiled-scene-registry-parity.test.js',
  'tests/civication-career-gameplay-matrix.test.js',
  'tests/civication-role-world-contract.test.js'
]);
for (const testPath of matrix.required_gate_tests) assert.ok(exists(testPath), `Required gate test missing: ${testPath}`);

assert.equal(policy.reference_wave_complete, true, 'Matrix must not rewrite the existing Role World reference wave');
assert.equal(policy.next_reference_world, null, 'Matrix must not invent a hidden next reference world');

console.log('PASS: Role World Realism Matrix v1 keeps seven cross-role fields locked, proves shared-world role boundaries, and leaves broad rollout policy-gated.');
