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

const KEY = 'subkultur/subkultur_arrangementsdrift';
const WORLD_PATH = 'data/Civication/roleWorlds/subkultur/subkultur_arrangementsdrift.json';
const PLAN_PATH = 'data/Civication/mailPlans/subkultur/subkultur_arrangementsdrift_plan.json';
const TYPES = ['job','people','conflict','event','followup','knowledge','consequence'];
const PLAN_TYPES = ['job','people','conflict','event'];
const catalogPath = type => `data/Civication/mailFamilies/subkultur/${type}/subkultur_arrangementsdrift_${type}.json`;
const expected = {
  job:['subkultur_arrangementsdrift_apning','subkultur_arrangementsdrift_job_apning'],
  people:['subkultur_arrangementsdrift_crew','subkultur_arrangementsdrift_people_vaktfordeling'],
  conflict:['subkultur_arrangementsdrift_adgangspress','subkultur_arrangementsdrift_conflict_backstage'],
  event:['subkultur_arrangementsdrift_riggavvik','subkultur_arrangementsdrift_event_rigg'],
  followup:['subkultur_arrangementsdrift_overlevering','subkultur_arrangementsdrift_followup_overlevering'],
  knowledge:['subkultur_arrangementsdrift_kunnskap_i_bruk','subkultur_arrangementsdrift_knowledge_tilgjengelighet'],
  consequence:['subkultur_arrangementsdrift_forsinket_konsekvens','subkultur_arrangementsdrift_consequence_neste_vakt']
};

const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'subkultur');
assert.equal(world.role_scope, 'subkultur_arrangementsdrift');
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
assert.equal(world.materialization.cross_role_link_materialized, false);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false, 'situated reputation must not collapse to one global score');
assert.ok(rep.audiences.length >= 6);
const audienceIds = new Set(rep.audiences.map(a => a.id));
for (const id of ['arrangementsansvarlig_and_shift_leads','crew_and_volunteers','technical_safety_staff','artists_and_accredited','public_and_accessibility','friends_and_subculture_peers']) {
  assert.ok(audienceIds.has(id), `Missing situated audience ${id}`);
}
const standingAxes = rep.audiences.map(a => a.standing_axis);
assert.equal(new Set(standingAxes).size, standingAxes.length, 'each audience must have its own standing axis');
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').trim());
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.rule, /audience|spesifikk|diverg/i);
assert.match(rep.rule, /myndighet|authority|adgang|kompetanse/i);
assert.match(rep.authority_separation, /Standing|standing/i);
assert.match(rep.authority_separation, /sikkerhet|authority|mandat|adgang/i);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding, 'editorial_only_until_governed', `${axis.id}: standing rollout must not create runtime state`);

const cross = world.cross_role_proof;
assert.equal(cross.status, 'not_materialized_no_shared_work_object');
assert.equal(cross.shared_work_object_found, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /ikke|not/i);
assert.match(cross.rule, /shared|delt|arbeidsobjekt/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 7, 'Arrangementsdrift rollout must reuse exactly the existing seven authored mail-type scenes');
for (const type of TYPES) {
  const [familyId,mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `Missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'subkultur');
  assert.equal(doc.role_scope, 'subkultur_arrangementsdrift');
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `Missing canonical ${type} family ${familyId}`);
  assert.ok((family.mails || []).some(row => row.id === mailId), `Missing canonical ${type} scene ${mailId}`);
}
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
assert.equal(plan.sequence.length, 4, 'existing Arrangementsdrift plan must remain exactly four steps');
assert.deepEqual(plan.sequence.map(step => step.type), PLAN_TYPES);
for (const type of PLAN_TYPES) assert.ok(plan.sequence.some(step => step.type === type && step.allowed_families?.[0] === expected[type][0]));

const grammar = readJson('data/Civication/workGrammars/subkultur/subkultur_arrangementsdrift.json');
assert.equal(grammar.role_scope, 'subkultur_arrangementsdrift');
for (const boundary of ['overstyre_sikkerhetsplan','utføre_teknisk_arbeid_uten_opplaring','gi_venner_skjult_saertilgang','inngaa_avtaler_uten_mandat']) {
  assert.ok((grammar.authority_boundary?.cannot || []).includes(boundary), `Missing authority boundary ${boundary}`);
}
for (const type of TYPES) for (const scene of flattenMails(readJson(catalogPath(type)))) for (const choice of scene.choices || []) {
  assert.equal(choice.authority_action, undefined, `${scene.id}: situated reputation must not manufacture executable authority`);
}

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'subkultur' && row.role_scope === 'subkultur_arrangementsdrift' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_SUBKULTUR_ARRANGEMENTSDRIFT_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_SUBKULTUR_ARRANGEMENTSDRIFT_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 20);
assert.ok(readiness.summary?.rollout_queue_roles <= 65);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: subkultur/subkultur_arrangementsdrift');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Subkultur Arrangementsdrift Role World rollout closes situated-reputation debt fail-closed');
