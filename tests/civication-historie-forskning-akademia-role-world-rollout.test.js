const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const ROLE = 'historie_forskning_og_akademia';
const KEY = `historie/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/historie/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/historie/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/historie/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/historie/${ROLE}.json`;
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const catalogPath = (type) => `data/Civication/mailFamilies/historie/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});

assert.ok(exists(WORLD), 'Research Role World must exist before strict rollout proof runs');
const world = read(WORLD);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'historie');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of ['no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved']) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.equal(read(PLAN).sequence.length, 16);
assert.deepEqual(world.existing_work_continuity.work_loops, read(GRAMMAR).work_loops);
assert.equal(world.existing_work_continuity.persistent_work_object, 'forskningslogg_og_manusspor');
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.equal(read(GRAMMAR).day_one_contract.entry, 'qualification_required');

for (const person of read(MODEL).related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}
assert.equal(canonicalRefs.length, 15);
assert.equal(new Set(canonicalRefs).size, 15);
assert.deepEqual(world.materialization.source_refs, canonicalRefs, 'Role World must reuse complete 15-mail prerequisite provenance');

const audienceIds = [
  'supervisors_and_research_leads',
  'archive_and_source_stewards',
  'peer_reviewers_and_method_peers',
  'project_admin_ethics_and_funders',
  'coauthors_and_research_collaborators',
  'editors_publishers_and_academic_gatekeepers',
  'disciplinary_peers_and_future_employers',
  'private_relations'
];
const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
assert.deepEqual(rep.audiences.map((audience) => audience.id), audienceIds);
assert.equal(new Set(rep.audiences.map((audience) => audience.standing_axis)).size, audienceIds.length);
for (const audience of rep.audiences) {
  assert.ok(audience.cares_about.length >= 2);
  assert.ok(audience.cannot_grant.length >= 100);
  assert.match(audience.cannot_grant, /kan ikke|ikke gi|gir ikke/i);
}
assert.ok(rep.divergence_examples.length >= 6);
for (const term of [/global/i,/evidens|kilde/i,/funn|konklusjon/i,/grad|kvalifikasjon/i,/ansett|hiring/i,/etikk|personvern/i,/finansier|budsjett/i,/publiser/i,/History Go|Badge/i]) assert.match(rep.authority_separation, term);
assert.ok(world.slow_axes.length >= 9);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding, 'editorial_only_until_governed');

assert.ok(canonicalRefs.includes(world.history_go_affordance.source_ref));
assert.equal(world.history_go_affordance.badge_id, 'historie');
assert.ok(world.history_go_affordance.better_question.length >= 350);
assert.match(world.history_go_affordance.better_question, /kilde|historiografi|arkiv|rival/i);
for (const term of [/kan ikke|ikke gi/i,/grad|kvalifikasjon/i,/funn|konklusjon/i,/etikk|personvern/i,/ansett/i,/finansier/i,/publiser/i]) assert.match(world.history_go_affordance.authority_boundary, term);

assert.equal(world.cross_role_proof.status, 'not_materialized_not_required_for_rollout');
assert.equal(world.cross_role_proof.shared_work_object_found, false);
assert.equal(world.cross_role_proof.new_runtime, false);
assert.equal(world.cross_role_proof.required_for_rollout, false);
assert.match(world.cross_role_proof.rule, /not_required_for_rollout|ikke.*påkrevd|shared work object|delt arbeidsobjekt/i);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(beatKeys.size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.summary)).size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size, 56);
const expectedBeatType = { morning:'task', lunch:'relationship', afternoon:'decision', evening:'private_consequence' };
const useCounts = new Map(canonicalRefs.map((ref) => [ref, 0]));
for (const beat of world.season.coverage) {
  assert.equal(beat.beat_type, expectedBeatType[beat.phase]);
  assert.ok(beat.summary.length >= 650, `${beat.day}/${beat.phase}: summary too shallow (${beat.summary.length})`);
  assert.ok(beat.standing_consequence.length >= 520, `${beat.day}/${beat.phase}: standing too shallow (${beat.standing_consequence.length})`);
  assert.ok(audienceIds.includes(beat.standing_audience));
  assert.equal(beat.materialization_refs.length, 1);
  assert.ok(canonicalRefs.includes(beat.materialization_refs[0]));
  useCounts.set(beat.materialization_refs[0], useCounts.get(beat.materialization_refs[0]) + 1);
}
for (const [ref, count] of useCounts) assert.ok(count >= 3, `${ref} underused: ${count}`);

assert.equal(world.primary_threads.length, 7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 180);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => ref.split('/')[0])).size >= 3);
  for (const ref of thread.beat_refs) assert.ok(beatKeys.has(ref), `${thread.id}: ${ref}`);
}
assert.equal(world.private_aftermath.length, 5);
for (const aftermath of world.private_aftermath) {
  assert.ok(aftermath.description.length >= 180);
  assert.ok(aftermath.materialization_refs.length >= 1);
  for (const ref of aftermath.materialization_refs) assert.ok(canonicalRefs.includes(ref));
}
assert.equal(world.delayed_consequences.length, 8);
const order = (ref) => { const [day, phase] = ref.split('/'); return Number(day) * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0); };
for (const delayed of world.delayed_consequences) {
  assert.ok(beatKeys.has(delayed.setup_ref));
  assert.ok(beatKeys.has(delayed.return_ref));
  assert.ok(order(delayed.return_ref) > order(delayed.setup_ref));
  assert.ok(delayed.domains.includes('reputation') || delayed.domains.includes('relationship') || delayed.domains.includes('job'));
}

const index = read('data/Civication/roleWorlds/index.json');
assert.deepEqual(index.roles.find((entry) => entry.category === 'historie' && entry.role_scope === ROLE), {category:'historie',role_scope:ROLE,status:'role_world_complete',path:WORLD});
assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD));
assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY], world.theme_ids);
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((entry) => entry.key === KEY);
assert.equal(ready.role_world_status, 'role_world_complete');
assert.ok(ready.already_reference_or_pilot);
assert.ok(!(readiness.rollout_queue || []).some((entry) => entry.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 57);
assert.ok(readiness.summary.rollout_queue_roles <= 28);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
for (const salary of career.audit.salary.rows) assert.equal(salary.offer_policy, 'qualification_required');

const source = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_HISTORIE_FORSKNING_OG_AKADEMIA_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
assert.match(source, /Editorial uniqueness/i);
assert.match(source, /global reputation score/i);
assert.match(source, /not_required_for_rollout/);
assert.match(source, /29\/30/);
console.log('Civication Historie Forskning og akademia Role World rollout: OK');
