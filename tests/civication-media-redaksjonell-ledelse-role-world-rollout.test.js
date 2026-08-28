'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseBeat = ref => { const [day, phase] = ref.split('/'); return {day:Number(day),phase}; };
const beatOrder = ref => { const {day,phase}=parseBeat(ref); return day*10+({morning:1,lunch:2,afternoon:3,evening:4}[phase]||0); };

const KEY = 'media/media_redaksjonell_ledelse';
const WORLD_PATH = 'data/Civication/roleWorlds/media/media_redaksjonell_ledelse.json';
const PLAN_PATH = 'data/Civication/mailPlans/media/media_redaksjonell_ledelse_plan.json';
const TYPES = ['job','people','conflict','knowledge','event','micro','followup','story','consequence'];
const PLAN_TYPES = ['job','people','conflict','knowledge','event','micro','followup','story'];
const catalogPath = type => `data/Civication/mailFamilies/media/${type}/media_redaksjonell_ledelse_${type}.json`;
const expected = {
  job:['ledelse_prioritering_og_mandat','media_redaksjonell_ledelse_job_prioritering_001'],
  people:['ledelse_status_og_ansvar','media_redaksjonell_ledelse_people_status_001'],
  conflict:['ledelse_uavhengighet_vs_press','media_redaksjonell_ledelse_conflict_press_001'],
  knowledge:['ledelse_belegg_og_publiseringsansvar','media_redaksjonell_ledelse_knowledge_belegg_001'],
  event:['ledelse_ny_opplysning','media_redaksjonell_ledelse_event_nyopplysning_001'],
  micro:['ledelse_siste_kontroll','media_redaksjonell_ledelse_micro_eier_001'],
  followup:['ledelse_rettelse_og_laring','media_redaksjonell_ledelse_followup_rettelse_001'],
  story:['ledelse_tillit_som_system','media_redaksjonell_ledelse_story_tillit_001'],
  consequence:['ledelse_rettelse_og_laring','media_redaksjonell_ledelse_consequence_publisering_001']
};

const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'media');
assert.equal(world.role_scope, 'media_redaksjonell_ledelse');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day=1; day<=14; day+=1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
assert.ok(world.recurring_people_archetypes.length >= 6);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);
assert.equal(world.materialization.no_new_runtime, true);
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_cross_role_runtime_proof_reused, true);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false, 'situated reputation must not collapse to one global score');
assert.ok(rep.audiences.length >= 6);
const audienceIds = new Set(rep.audiences.map(a => a.id));
for (const id of ['reporter_staff','desk_and_shift_leads','editor_in_chief_line','sources_and_affected','public','private_relationships']) assert.ok(audienceIds.has(id), `Missing situated audience ${id}`);
const standingAxes = rep.audiences.map(a => a.standing_axis);
assert.equal(new Set(standingAxes).size, standingAxes.length, 'each audience must have its own standing axis');
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').trim());
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.rule, /audience|spesifikk|diverg/i);
assert.match(rep.rule, /evidens|authority|myndighet|publiseringsgrunnlag/i);
assert.match(rep.authority_separation, /Standing/i);
assert.match(rep.authority_separation, /evidens|authority|work-object/i);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding, 'editorial_only_until_governed', `${axis.id}: standing rollout must not create runtime state`);

const cross = world.cross_role_proof;
assert.equal(cross.status, 'reuse_existing_runtime_proof');
assert.equal(cross.work_object_id, 'media_redaksjon_publication_case_001');
assert.equal(cross.reporter_role_scope, 'media_redaksjon');
assert.equal(cross.leader_role_scope, 'media_redaksjonell_ledelse');
assert.equal(cross.leader_scene_id, 'media_cross_role_editor_shared_case_review_001');
assert.equal(cross.forbidden_authority_action, 'overwrite_reporter_evidence');
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared/i);
assert.match(cross.rule, /privilege|evidens|role_scope/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 10, 'rollout must reuse nine canonical mail-type scenes plus the existing cross-role leader scene');
for (const type of TYPES) {
  const [familyId,mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `Missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'media');
  assert.equal(doc.role_scope, 'media_redaksjonell_ledelse');
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `Missing canonical ${type} family ${familyId}`);
  assert.ok((family.mails || []).some(row => row.id === mailId), `Missing canonical ${type} scene ${mailId}`);
}
const jobCatalog = readJson(catalogPath('job'));
const sharedFamily = (jobCatalog.families || []).find(row => row.id === 'cross_role_shared_publication_case');
assert.ok(sharedFamily);
const sharedScene = (sharedFamily.mails || []).find(row => row.id === 'media_cross_role_editor_shared_case_review_001');
assert.ok(sharedScene);
assert.ok(refs.includes(`${catalogPath('job')}#media_cross_role_editor_shared_case_review_001`));
assert.deepEqual(sharedScene.work_context?.object_ids, ['media_redaksjon_publication_case_001']);
assert.equal(sharedScene.authority_context?.role_scope, 'media_redaksjonell_ledelse');
const authority = new Map((sharedScene.authority_context?.authority_rules || []).map(row => [row.action_id,row.authority]));
assert.equal(authority.get('return_shared_case_for_rework'), 'direct');
assert.equal(authority.get('advance_shared_case_to_editorial_decision'), 'direct');
assert.equal(authority.get('overwrite_reporter_evidence'), 'forbidden');
assert.ok(!(sharedScene.choices || []).some(choice => choice.authority_action?.action_id === 'overwrite_reporter_evidence'));

for (const ref of refs) {
  const [rel,id] = ref.split('#');
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id), `Missing provenance target ${ref}`);
}
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 120, `${beat.day}/${beat.phase}: summary must remain substantive`);
  assert.ok(beat.materialization_refs.length >= 1);
  for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref));
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref));
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref));
}

const plan = readJson(PLAN_PATH);
assert.equal(plan.sequence.length, 8, 'existing editorial leadership plan must remain exactly eight steps');
assert.deepEqual(plan.sequence.map(step => step.type), PLAN_TYPES);
assert.equal(plan.sequence[0].allowed_families.includes('ledelse_prioritering_og_mandat'), true);
assert.equal(plan.sequence[0].allowed_families.includes('cross_role_shared_publication_case'), true);
for (let i=1; i<PLAN_TYPES.length; i+=1) assert.equal(plan.sequence[i].allowed_families[0], expected[PLAN_TYPES[i]][0]);

const grammar = readJson('data/Civication/workGrammars/media/media_redaksjonell_ledelse.json');
assert.equal(grammar.role_scope, 'media_redaksjonell_ledelse');
assert.ok((grammar.authority_boundary?.cannot || []).includes('utvide eget mandat gjennom Badge-poeng'));
assert.ok((grammar.authority_boundary?.cannot || []).includes('behandle offentlig status som jobb'));
assert.ok((grammar.authority_boundary?.cannot || []).includes('hoppe over etablerte kvalitets- og beslutningslinjer'));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'media' && row.role_scope === 'media_redaksjonell_ledelse' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_MEDIA_REDAKSJONELL_LEDELSE_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_MEDIA_REDAKSJONELL_LEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 19);
assert.ok(readiness.summary?.rollout_queue_roles <= 66);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: media/media_redaksjonell_ledelse');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Media Redaksjonell ledelse Role World rollout closes situated-reputation debt fail-closed');
