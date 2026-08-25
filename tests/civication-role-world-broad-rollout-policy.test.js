const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const matrix = read('data/Civication/roleWorldRealismMatrix.json');
const policy = read('data/Civication/roleWorldPolicy.json');
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');

assert.equal(matrix.status, 'gate_green_controlled_rollout_open');
assert.equal(matrix.semantics.broad_rollout_allowed, true);
assert.equal(matrix.semantics.rollout_mode, 'controlled_role_by_role');
assert.equal(matrix.semantics.no_new_runtime, true);
assert.equal(matrix.semantics.new_parallel_scene_format_allowed, false);
assert.equal(matrix.semantics.completion_statuses_unchanged, true);
assert.equal(matrix.program_level_proofs.cross_role_links.status, 'runtime_proven');

assert.equal(policy.realism_matrix_gate.status, 'gate_green_controlled_rollout_open');
assert.equal(policy.realism_matrix_gate.broad_rollout_allowed, true);
assert.equal(policy.realism_matrix_gate.readiness_path, 'data/Civication/roleWorldRolloutReadiness.json');
assert.equal(policy.realism_matrix_gate.completion_statuses_unchanged, true);
assert.equal(policy.realism_matrix_gate.new_runtime_allowed, false);

const runtime = policy.runtime_boundary;
assert.equal(runtime.editorial_layer_only, true);
assert.equal(runtime.new_runtime_allowed, false);
assert.equal(runtime.new_parallel_scene_format_allowed, false);
assert.equal(runtime.role_world_declared_runtime_capabilities_allowed, false);
assert.equal(runtime.canonical_scene_schema, 'data/Civication/sceneContractV1.schema.json');
assert.equal(runtime.compiled_registry, 'data/Civication/compiledSceneRegistryV1.json');
assert.ok(new Set(runtime.governed_capability_requirements || []).has('existing_scene_pipeline_remains_canonical'));

const rollout = policy.broad_rollout_governance;
assert.equal(rollout.mode, 'controlled_role_by_role');
assert.equal(rollout.one_role_per_pr, true);
assert.equal(rollout.blocked_roles_may_roll_out, false);
assert.equal(rollout.authority_must_not_be_inferred, true);
assert.equal(rollout.cross_role_links_only_when_genuinely_shared, true);
assert.equal(rollout.full_civication_suite_required, true);
assert.equal(rollout.compiled_registry_parity_required, true);
assert.equal(rollout.realism_matrix_gate_required, true);
assert.equal(rollout.provenance_required, true);
assert.equal(rollout.existing_scene_pipeline_remains_canonical, true);
assert.equal(rollout.parallel_scene_engine_allowed, false);
assert.equal(rollout.employment_conditions_global_runtime_field, false);
assert.equal(rollout.professional_culture_global_runtime_field, false);

assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.policy_state_consistent, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);
assert.equal(readiness.gate.policy_recommendation, 'controlled_rollout_open_with_role_level_gates');
assert.ok(readiness.blocked_roles.length > 0, 'Policy opening must not erase role-level blockers');
const blocked = new Set(readiness.blocked_roles.map((row) => row.key));
assert.ok(readiness.first_wave_candidates.every((row) => !blocked.has(row.key)), 'Blocked roles cannot enter the first controlled wave');
assert.ok(readiness.first_wave_candidates.every((row) => row.classification === 'rollout_ready'));
assert.ok(readiness.first_wave_candidates.length >= 3 && readiness.first_wave_candidates.length <= 4);
assert.equal(new Set(readiness.first_wave_candidates.map((row) => row.structural_family)).size, readiness.first_wave_candidates.length);

const roleOwned = new Set(matrix.role_owned_not_global || []);
assert.ok(roleOwned.has('role_specific_employment_conditions'));
assert.ok(roleOwned.has('role_specific_professional_culture'));
const deferred = new Map((matrix.deferred_dimensions || []).map((row) => [row.id, row.status]));
assert.equal(deferred.get('employment_conditions'), 'editorial_only');
assert.equal(deferred.get('professional_culture'), 'editorial_only');

console.log('PASS: broad Role World rollout is open only as controlled one-role-per-PR delivery with authority, provenance, registry and blocker gates intact.');
