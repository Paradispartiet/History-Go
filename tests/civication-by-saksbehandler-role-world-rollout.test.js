'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const beatOrder = ref => { const [day, phase] = ref.split('/'); return Number(day) * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0); };

const KEY = 'by/by_saksbehandler';
const ROLE = 'by_saksbehandler';
const WORLD_PATH = 'data/Civication/roleWorlds/by/by_saksbehandler.json';
const PLAN_PATH = 'data/Civication/mailPlans/by/by_saksbehandler_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/by/by_saksbehandler.json';
const MODEL_PATH = 'data/Civication/roleModels/by/saksbehandler_plan_bygg.json';
const TYPES = ['job','people','conflict','event','micro','story','knowledge','followup','consequence'];
const expected = {
  job:'by_saks_job_dok_001',
  people:'by_saksbehandler_people_anne_001',
  conflict:'by_saksbehandler_conflict_likebehandling_001',
  event:'by_saksbehandler_event_befaring_001',
  micro:'by_saksbehandler_micro_kildespor_001',
  story:'by_saksbehandler_story_vedtaksgrunnlag_001',
  knowledge:'by_saksbehandler_knowledge_likebehandling_001',
  followup:'by_saksbehandler_followup_hoyde_001',
  consequence:'by_saksbehandler_consequence_klage_001'
};
const catalogPath = type => `data/Civication/mailFamilies/by/${type}/by_saksbehandler_${type}.json`;

assert.ok(exists(WORLD_PATH), 'By Saksbehandler Role World must exist before strict rollout proof runs');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'by');
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

assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.existing_persistent_work_preserved, true);
assert.equal(world.materialization.existing_rhythm_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.doesNotMatch(JSON.stringify(world.materialization.authored_dimensions), /persistent_work_object|rhythm_waiting_handoff_rework/);

const existing = world.existing_work_continuity;
assert.equal(existing.runtime_binding, 'existing_mail_and_work_grammar');
assert.equal(existing.thread_key, 'by_saksbehandler.case.hoyde_nabovirkning_og_klage');
assert.equal(existing.new_runtime_state, false);
assert.ok(existing.work_loops.includes('saksbehandling'));
assert.ok(existing.work_loops.includes('kvalitetssikring'));
assert.match(existing.rule, /faktum|hjemmel|skjønn|journal|klage|etterprøv/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
const requiredAudiences = ['section_leadership','legal_quality_control','applicant_developer','neighbors_affected_residents','formal_decision_owner','appeal_review','peer_caseworkers','private_relations'];
const audienceIds = new Set((rep.audiences || []).map(row => row.id));
for (const id of requiredAudiences) assert.ok(audienceIds.has(id), `missing audience ${id}`);
const axes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(axes).size, axes.length);
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').length >= 35);
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.rule, /audience|spesifikk|diverg|standing/i);
assert.match(rep.authority_separation, /tillatelse|dispensasjon|lov|prosess|vedtak|likebehandling|opplysning/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing') || String(axis.id).includes('trust') || String(axis.id).includes('mask')) {
    assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
  }
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'candidate_when_shared_work_is_real');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared|delt|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'must reuse exactly nine canonical By Saksbehandler mail scenes');
for (const type of TYPES) {
  const ref = `${catalogPath(type)}#${expected[type]}`;
  assert.ok(refs.includes(ref), `missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'by');
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

const followup = flattenMails(readJson(catalogPath('followup'))).find(row => row.id === expected.followup);
const consequence = flattenMails(readJson(catalogPath('consequence'))).find(row => row.id === expected.consequence);
assert.equal(followup.thread_key, 'by_saksbehandler.case.hoyde_nabovirkning_og_klage');
assert.equal(consequence.thread_key, followup.thread_key);
assert.equal(followup.person_id, 'anne_planseksjon');
assert.equal(consequence.person_id, 'juridisk_rådgiver_erik');
assert.match(`${followup.summary} ${consequence.summary}`, /snitt|faktum|klage|journal|vurder|begrunn/i);

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'by_saksbehandler_v1');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.sequence.every(step => step.type === 'job'));
for (const family of ['dokumentasjon_og_mangler','nabomerknader_og_sted','regelverk_og_skjonn','frist_og_forvaltning']) {
  assert.ok(plan.sequence.some(step => step.allowed_families.includes(family)), `missing plan family ${family}`);
}

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
const loopIds = new Set((grammar.work_loops || []).map(row => row.id));
assert.ok(loopIds.has('saksbehandling'));
assert.ok(loopIds.has('kvalitetssikring'));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /forskjellsbehandle_uten_saklig_grunn/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /hoppe_over_lovpalagte_prosesser/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /love_tillatelse_for_formelt_vedtak/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /skjule_vesentlige_opplysninger/.test(line)));

const model = readJson(MODEL_PATH);
assert.equal(model.category, 'by');
assert.equal(model.role_id, 'by_saksbehandler_plan_bygg');
assert.equal(model.role_scope, 'saksbehandler_plan_bygg');
assert.equal(model.source?.tier_threshold, 25);
for (const id of ['anne_planseksjon','maria_medvirkning','juridisk_rådgiver_erik']) assert.ok((model.related_people || []).some(row => row.id === id));
assert.ok(model.authority_boundary?.may_not?.some(line => /forskjellsbehandle like saker/.test(line)));
assert.ok(model.authority_boundary?.may_not?.some(line => /lovpålagte prosesser/.test(line)));
assert.ok(model.authority_boundary?.may_not?.some(line => /love tillatelse, dispensasjon/.test(line)));
assert.ok(model.authority_boundary?.may_not?.some(line => /tolke bort klare plan- eller lovkrav/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'by' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_BY_SAKSBEHANDLER_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_BY_SAKSBEHANDLER_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.ok((career.artifacts?.role_models || []).includes(MODEL_PATH));

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 30);
assert.ok(readiness.summary?.rollout_queue_roles <= 55);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: by/by_saksbehandler');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ By Saksbehandler Role World rollout closes situated-reputation debt fail-closed');
