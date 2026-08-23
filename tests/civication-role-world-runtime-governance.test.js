const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const policy = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/Civication/roleWorldPolicy.json'), 'utf8')
);

const runtime = policy.runtime_boundary || {};

assert.equal(runtime.editorial_layer_only, true);
assert.equal(runtime.new_runtime_allowed, false);
assert.equal(runtime.new_parallel_scene_format_allowed, false);
assert.equal(runtime.role_world_declared_runtime_capabilities_allowed, false);
assert.equal(runtime.governed_additive_runtime_capabilities_allowed, true);
assert.equal(runtime.canonical_scene_schema, 'data/Civication/sceneContractV1.schema.json');
assert.equal(runtime.compiled_registry, 'data/Civication/compiledSceneRegistryV1.json');
assert.equal(runtime.scene_catalog, 'CivicationSceneCatalog');
assert.equal(runtime.scene_director, 'CivicationSceneDirector');
assert.equal(runtime.choice_director, 'CivicationChoiceDirector');

const requirements = new Set(runtime.governed_capability_requirements || []);
for (const requirement of [
  'existing_scene_pipeline_remains_canonical',
  'capability_has_explicit_runtime_owner',
  'capability_is_additive_for_existing_saves_and_roles',
  'schema_or_state_contract_is_versioned_or_strictly_bounded',
  'permanent_tests_prove_legacy_roles_remain_compatible',
  'role_world_complete_semantics_are_unchanged'
]) {
  assert.ok(requirements.has(requirement), `Missing governed runtime requirement: ${requirement}`);
}

assert.match(runtime.rule, /Role World-filer kan ikke opprette runtime-capabilities/i);
assert.match(runtime.rule, /ordinær runtime-governance/i);
assert.match(runtime.rule, /canonicale Scene Pipeline/i);

assert.equal(policy.completion_requirements.no_new_runtime_true, true);
assert.equal(policy.career_status_boundary.not_equivalent_to, 'role_world_complete');

console.log('Civication Role World runtime governance: OK');
