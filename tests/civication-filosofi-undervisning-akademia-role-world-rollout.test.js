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

const KEY = 'filosofi/filosofi_undervisning_og_akademia';
const ROLE = 'filosofi_undervisning_og_akademia';
const WORLD_PATH = 'data/Civication/roleWorlds/filosofi/filosofi_undervisning_og_akademia.json';
const PLAN_PATH = 'data/Civication/mailPlans/filosofi/filosofi_undervisning_og_akademia_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/filosofi/filosofi_undervisning_og_akademia.json';
const MODEL_PATH = 'data/Civication/roleModels/filosofi/filosofi_undervisning_og_akademia.json';
const TYPES = ['job','people','conflict','story','event','micro','knowledge','followup','consequence'];
const expected = {
  job:'filosofi_undervisning_job_laringsdesign_001',
  people:'filosofi_undervisning_people_studentuenighet_001',
  conflict:'filosofi_undervisning_conflict_sensorgrunnlag_001',
  story:'filosofi_undervisning_story_integritet_001',
  event:'filosofi_undervisning_event_tilrettelegging_001',
  micro:'filosofi_undervisning_micro_kriteriepresisering_001',
  knowledge:'filosofi_undervisning_knowledge_naess_001',
  followup:'filosofi_undervisning_followup_vurdering_001',
  consequence:'filosofi_undervisning_consequence_eksamen_001'
};
const catalogPath = type => `data/Civication/mailFamilies/filosofi/${type}/filosofi_undervisning_og_akademia_${type}.json`;

assert.ok(exists(WORLD_PATH), 'Filosofi undervisning/akademia Role World must exist before strict rollout proof runs');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'filosofi');
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
assert.ok(world.recurring_people_archetypes.length >= 6);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);

// One-gap rollout only: persistent work and rhythm were already proven before this PR.
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
assert.ok(existing.work_loops.includes('undervisningsdesign_og_gjennomforing'));
assert.ok(existing.work_loops.includes('vurdering_og_kvalitetssikring'));
for (const thread of ['filosofi_undervisning_alignment_001','filosofi_undervisning_vurdering_001','filosofi_undervisning_integritet_001','filosofi_undervisning_tilrettelegging_001','filosofi_undervisning_uenighet_001']) {
  assert.ok(existing.thread_keys.includes(thread), `missing existing continuity ${thread}`);
}
assert.match(existing.rule, /undervisning|vurdering|kriter|klage|integritet|tilrettelegging|uenighet/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
const requiredAudiences = ['study_leadership','seminar_colleagues','assessment_sensor','study_administration','students','academic_integrity_and_appeal_process','academic_peers','private_relations'];
const audienceIds = new Set((rep.audiences || []).map(row => row.id));
for (const id of requiredAudiences) assert.ok(audienceIds.has(id), `missing audience ${id}`);
const standingAxes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(standingAxes).size, standingAxes.length);
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').length >= 45);
}
assert.ok(rep.divergence_examples.length >= 4);
assert.match(rep.rule, /audience|spesifikk|diverg|standing/i);
assert.match(rep.authority_separation, /enighet|kriter|fusk|klage|tilrettelegging|personvern|Professor|Næss|myndighet/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing') || String(axis.id).includes('status') || String(axis.id).includes('trust') || String(axis.id).includes('mask')) {
    assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
  }
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'not_required_for_rollout');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /not required|ikke.*nødvendig|shared|delt/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'must reuse exactly nine canonical Filosofi teaching/academia mail scenes');
for (const type of TYPES) {
  const ref = `${catalogPath(type)}#${expected[type]}`;
  assert.ok(refs.includes(ref), `missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'filosofi');
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
const consequence = flattenMails(readJson(catalogPath('consequence'))).find(row => row.id === expected.consequence);
assert.equal(job.thread_key, 'filosofi_undervisning_alignment_001');
assert.equal(consequence.thread_key, job.thread_key);
assert.equal(consequence.narrative_arc, job.narrative_arc);
const conflict = flattenMails(readJson(catalogPath('conflict'))).find(row => row.id === expected.conflict);
const micro = flattenMails(readJson(catalogPath('micro'))).find(row => row.id === expected.micro);
const followup = flattenMails(readJson(catalogPath('followup'))).find(row => row.id === expected.followup);
assert.equal(conflict.thread_key, 'filosofi_undervisning_vurdering_001');
assert.equal(micro.thread_key, conflict.thread_key);
assert.equal(followup.thread_key, conflict.thread_key);
assert.equal(micro.narrative_arc, conflict.narrative_arc);
assert.equal(followup.narrative_arc, conflict.narrative_arc);
assert.match(`${conflict.summary} ${followup.summary}`, /kriter|begrunn|klage|syntese/i);

const people = flattenMails(readJson(catalogPath('people'))).find(row => row.id === expected.people);
assert.equal(people.thread_key, 'filosofi_undervisning_uenighet_001');
assert.match(people.summary, /uenig|argument/i);
const story = flattenMails(readJson(catalogPath('story'))).find(row => row.id === expected.story);
assert.equal(story.thread_key, 'filosofi_undervisning_integritet_001');
const event = flattenMails(readJson(catalogPath('event'))).find(row => row.id === expected.event);
assert.equal(event.thread_key, 'filosofi_undervisning_tilrettelegging_001');

const knowledge = flattenMails(readJson(catalogPath('knowledge'))).find(row => row.id === expected.knowledge);
assert.equal(knowledge.task_payload?.person_id, 'arne_naess');
assert.equal(knowledge.place_id, 'maerradalen');
assert.equal(knowledge.task_payload?.completion_mode, 'read_profile');
assert.match(knowledge.summary, /ikke.*autoritet|uten.*autoritet|skille/i);

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'filosofi_undervisning_og_akademia_v1');
assert.equal(plan.sequence.length, 9);
assert.deepEqual(plan.sequence.map(step => step.type), TYPES);
assert.ok(plan.sequence.every(step => Array.isArray(step.fallback_types) && step.fallback_types.length === 0));

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
const loopIds = new Set((grammar.work_loops || []).map(row => row.id));
assert.ok(loopIds.has('undervisningsdesign_og_gjennomforing'));
assert.ok(loopIds.has('vurdering_og_kvalitetssikring'));
for (const boundary of ['gjore_personlig_enighet_til_vurderingskriterium','innfore_skjulte_kriterier_retroaktivt','avgjore_formell_fuskesak_eller_sanksjon_alene','overstyre_klage_habilitets_tilretteleggings_eller_personvernprosess','ettersporre_unodvendige_sensitive_studentopplysninger','bruke_historiske_filosofer_som_fiktive_radgivere_eller_normativ_fasit','late_som_badge_poeng_er_akademisk_kvalifikasjon_eller_ansettelse']) {
  assert.ok(grammar.authority_boundary?.may_not?.includes(boundary), `missing grammar boundary ${boundary}`);
}
for (const escalation of ['mistanke_om_fusk_kan_utlose_formell_sak','student_ber_om_formell_tilrettelegging','karakterklage_eller_habilitet_krever_uavhengig_prosess']) {
  assert.ok(grammar.authority_boundary?.must_escalate_when?.includes(escalation), `missing escalation ${escalation}`);
}

const model = readJson(MODEL_PATH);
assert.equal(model.category, 'filosofi');
assert.equal(model.role_id, ROLE);
assert.deepEqual(model.badge_titles, ['Foreleser','Professor']);
assert.ok(model.related_people.every(row => row.fictional === true));
for (const id of ['sigrid_studieleder_filosofi','emil_seminarleder_filosofi','amal_sensorpartner_filosofi','nora_studiekonsulent_filosofi']) assert.ok(model.related_people.some(row => row.id === id));
assert.ok(model.related_places.some(row => row.place_id === 'maerradalen' && row.kind === 'canonical_history_go_place'));
for (const boundary of ['gjore_personlig_enighet_til_vurderingskriterium','innfore_skjulte_vurderingskrav_etter_innlevering','avgjore_formell_fuskesak_eller_sanksjon_alene','overstyre_formell_klage_habilitets_tilretteleggings_eller_personvernprosess','ettersporre_unodvendige_sensitive_studentopplysninger','bruke_historiske_filosofer_som_fiktive_npc_er_eller_normativ_fasit_for_dagens_undervisning','late_som_badge_poeng_eller_Professor_tier_er_akademisk_kvalifikasjon_eller_ansettelse']) {
  assert.ok(model.authority_boundaries?.cannot?.includes(boundary), `missing role-model boundary ${boundary}`);
}

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'filosofi' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_FILOSOFI_UNDERVISNING_AKADEMIA_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_FILOSOFI_UNDERVISNING_AKADEMIA_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.ok((career.artifacts?.role_models || []).includes(MODEL_PATH));

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 32);
assert.ok(readiness.summary?.rollout_queue_roles <= 53);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: filosofi/filosofi_undervisning_og_akademia');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Filosofi undervisning/akademia Role World rollout closes situated-reputation debt fail-closed');
