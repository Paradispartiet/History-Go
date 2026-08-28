'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseBeat = ref => { const [day, phase] = ref.split('/'); return { day:Number(day), phase }; };
const beatOrder = ref => { const {day, phase} = parseBeat(ref); return day * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0); };

const KEY = 'religion/religion_forskning';
const ROLE = 'religion_forskning';
const WORLD_PATH = 'data/Civication/roleWorlds/religion/religion_forskning.json';
const PLAN_PATH = 'data/Civication/mailPlans/religion/religion_forskning_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/religion/religion_forskning.json';
const MODEL_PATH = 'data/Civication/roleModels/religion/religion_forskning.json';
const TYPES = ['job','people','conflict','event','knowledge','followup','consequence'];
const expected = {
  job:'religion_forskning_job_problemstilling',
  people:'religion_forskning_people_motlesning',
  conflict:'religion_forskning_conflict_formidling',
  event:'religion_forskning_event_motkilde',
  knowledge:'religion_forskning_knowledge_analytisk_kategori',
  followup:'religion_forskning_followup_kodebok',
  consequence:'religion_forskning_consequence_fagfelle'
};
const catalogPath = type => `data/Civication/mailFamilies/religion/${type}/religion_forskning_${type}.json`;

assert.ok(exists(WORLD_PATH), 'Religion forskning Role World must exist before strict rollout proof runs');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'religion');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day = 1; day <= 14; day += 1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').length >= 115, `${beat.day}/${beat.phase}: substantive coverage required`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
assert.ok(world.recurring_people_archetypes.length >= 8);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);

// One-gap rollout only. Existing research work/rhythm already passed readiness.
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.existing_persistent_work_preserved, true);
assert.equal(world.materialization.existing_rhythm_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.doesNotMatch(JSON.stringify(world.materialization.authored_dimensions), /persistent_work_object|rhythm_waiting_handoff_rework|people_places_integrity|career:/);

const existing = world.existing_work_continuity;
assert.equal(existing.runtime_binding, 'existing_mail_and_work_grammar');
assert.equal(existing.new_runtime_state, false);
for (const loop of [
  'formuler spørsmål og avgrens påstand',
  'velg metode og dokumenter kildegrunnlag',
  'ivareta samtykke, personvern og posisjonalitet der mennesker inngår',
  'analyser med alternative forklaringer og negativ evidens',
  'skriv funn, begrensninger og sporbar argumentasjon'
]) assert.ok(existing.work_loops.includes(loop), `missing existing research loop ${loop}`);
assert.match(existing.rule, /problemstilling|metode|samtykke|arkiv|rival|fagfelle|sporbar/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
const requiredAudiences = ['project_leadership','method_peers','research_ethics','archivists_and_source_stewards','field_participants','peer_reviewers','public_communicators','private_relations'];
const audienceIds = new Set((rep.audiences || []).map(row => row.id));
for (const id of requiredAudiences) assert.ok(audienceIds.has(id), `missing audience ${id}`);
const standingAxes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(standingAxes).size, standingAxes.length);
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').length >= 45);
}
assert.ok(rep.divergence_examples.length >= 5);
assert.match(rep.rule, /audience|spesifikk|diverg|standing/i);
assert.match(rep.authority_separation, /samtykke|konfidensialitet|teolog|informant|Badge|kvalifikasjon|myndighet/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing') || String(axis.id).includes('trust') || String(axis.id).includes('mask')) {
    assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
  }
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'not_required_for_rollout');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /not required|ikke.*nødvendig|shared|delt/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 7, 'must reuse exactly seven canonical Religion forskning source scenes');
for (const type of TYPES) {
  const ref = `${catalogPath(type)}#${expected[type]}`;
  assert.ok(refs.includes(ref), `missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'religion');
  assert.equal(doc.role_scope, ROLE);
  assert.equal(doc.mail_type, type);
  assert.ok(flattenMails(doc).some(row => row.id === expected[type]), `missing canonical scene ${expected[type]}`);
}
for (const ref of refs) {
  const [rel, id] = ref.split('#');
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id), `missing provenance target ${ref}`);
}
for (const beat of world.season.coverage) for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref), `${beat.day}/${beat.phase}: unknown source ref`);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${thread.id}: thread length`);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref), `${thread.id}: missing beat ${ref}`);
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref), `${delayed.id}: delayed consequence must return later`);
}

const job = flattenMails(readJson(catalogPath('job'))).find(row => row.id === expected.job);
assert.match(job.summary, /hypotese|spørsmål|støtte/i);
const people = flattenMails(readJson(catalogPath('people'))).find(row => row.id === expected.people);
assert.match(people.summary, /alternativ|forklaring|mønster/i);
const conflict = flattenMails(readJson(catalogPath('conflict'))).find(row => row.id === expected.conflict);
assert.match(conflict.summary, /gjenkjenn|detalj|formidler/i);
const event = flattenMails(readJson(catalogPath('event'))).find(row => row.id === expected.event);
assert.match(event.summary, /mappe|motsier|fravær/i);
const followup = flattenMails(readJson(catalogPath('followup'))).find(row => row.id === expected.followup);
assert.match(followup.summary, /kodebok|variabel|praksis|medlemskap/i);
const consequence = flattenMails(readJson(catalogPath('consequence'))).find(row => row.id === expected.consequence);
assert.match(consequence.summary, /fagfell|rival|alternativ|test/i);

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'religion_forskning_pilot_v1');
assert.equal(plan.sequence.length, 4);
assert.deepEqual(plan.sequence.map(step => step.type), ['job','people','conflict','event']);
assert.ok(plan.sequence.every(step => Array.isArray(step.fallback_types) && step.fallback_types.length === 0));

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
for (const loop of existing.work_loops) assert.ok(grammar.work_loops.includes(loop));
for (const boundary of ['utlede tro fra identitet alene','gjøre én informant representativ for alle','bryte feltetiske forpliktelser for et bedre resultat','forveksle teologisk sannhet med empirisk dokumentasjon']) {
  assert.ok(grammar.authority_boundary?.cannot?.includes(boundary), `missing grammar authority boundary ${boundary}`);
}

const model = readJson(MODEL_PATH);
assert.equal(model.category, 'religion');
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, ROLE);
assert.ok(model.related_people.some(row => row.id === 'mina_prosjektleder'));
assert.ok(model.related_people.some(row => row.id === 'oskar_forskningsetikk'));
assert.ok(model.related_people.some(row => row.id === 'lea_arkivar'));
assert.ok(model.related_people.some(row => row.id === 'sara_metodekollega'));
assert.ok(model.related_places.some(row => row.id === 'religionsforskningskontoret'));
assert.ok(model.related_places.some(row => row.id === 'religionsfeltet_lite_miljo'));
assert.ok(model.related_places.some(row => row.id === 'religionshistorisk_arkiv'));
assert.ok(model.related_places.some(row => row.id === 'religion_metodeverksted'));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'religion' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_RELIGION_FORSKNING_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_RELIGION_FORSKNING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.ok((career.artifacts?.role_models || []).includes(MODEL_PATH));

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 34);
assert.ok(readiness.summary?.rollout_queue_roles <= 51);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: religion/religion_forskning');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Religion forskning Role World rollout closes situated-reputation debt fail-closed');
