'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseBeat = ref => { const [day, phase] = ref.split('/'); return {day:Number(day), phase}; };
const beatOrder = ref => { const {day, phase} = parseBeat(ref); return day * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0); };

const KEY = 'psykologi/forsker_psykologi';
const ROLE = 'forsker_psykologi';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/forsker_psykologi.json';
const PLAN_PATH = 'data/Civication/mailPlans/psykologi/forsker_psykologi_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/psykologi/forsker_psykologi.json';
const MODEL_PATH = 'data/Civication/roleModels/psykologi/forsker_psykologi.json';
const TYPES = ['job','people','conflict','knowledge','event','micro','followup','story','consequence'];
const PLAN_TYPES = ['job','people','conflict','knowledge','event','micro','followup','story'];
const catalogPath = type => `data/Civication/mailFamilies/psykologi/${type}/forsker_psykologi_${type}.json`;
const expected = {
  job:['analyseplan_for_resultat','psykologi_forsker_psykologi_job_analyseplan_001'],
  people:['metodekritikk_og_datakvalitet','psykologi_forsker_psykologi_people_metodekritikk_001'],
  conflict:['sterkere_resultat_etter_data','psykologi_forsker_psykologi_conflict_sterkere_resultat_001'],
  knowledge:['planlagt_vs_utforskende','psykologi_forsker_psykologi_knowledge_planlagt_utforskende_001'],
  event:['frist_data_og_personvern','psykologi_forsker_psykologi_event_frist_data_001'],
  micro:['figur_og_usikkerhet','psykologi_forsker_psykologi_micro_figur_usikkerhet_001'],
  followup:['analyseavvik_og_robusthet','psykologi_forsker_psykologi_followup_analyseavvik_001'],
  story:['etterprovbar_sluttrapport','psykologi_forsker_psykologi_story_sluttrapport_001'],
  consequence:['robusthet_som_konsekvens','psykologi_forsker_psykologi_consequence_robusthet_001']
};

assert.ok(exists(WORLD_PATH), 'Forsker Role World must be materialized before rollout proof runs');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'psykologi');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day = 1; day <= 14; day += 1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').length >= 120, `${beat.day}/${beat.phase}: coverage summary must stay substantive`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
assert.ok(world.recurring_people_archetypes.length >= 6);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);
assert.equal(world.materialization.no_new_runtime, true);
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false, 'research standing must never collapse to one global score');
assert.ok(rep.audiences.length >= 6);
const audienceIds = new Set(rep.audiences.map(row => row.id));
for (const id of ['project_leadership','method_peers_and_coauthors','ethics_privacy_governance','external_partners','research_community_and_reviewers','private_relationships']) {
  assert.ok(audienceIds.has(id), `Missing situated research audience ${id}`);
}
const axes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(axes).size, axes.length, 'each research audience needs its own standing axis');
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').trim());
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.rule, /audience|spesifikk|diverg/i);
assert.match(rep.authority_separation, /psykologautorisasjon|diagnos|behand|persondata|evidens/i);
assert.match(rep.evidence_separation, /planlagt|utforsk|post hoc|evidens/i);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding, 'editorial_only_until_governed', `${axis.id}: rollout must not manufacture runtime state`);

const cross = world.cross_role_link;
assert.equal(cross.status, 'not_required_for_rollout');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared work|delt arbeid|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'Forsker rollout must reuse exactly the nine canonical mail scenes');
for (const type of TYPES) {
  const [familyId, mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `Missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'psykologi');
  assert.equal(doc.role_scope, ROLE);
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `Missing canonical ${type} family ${familyId}`);
  assert.ok((family.mails || []).some(row => row.id === mailId), `Missing canonical ${type} scene ${mailId}`);
}
for (const ref of refs) {
  const [rel, id] = ref.split('#');
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id), `Missing provenance target ${ref}`);
}
for (const beat of world.season.coverage) for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref), `${beat.day}/${beat.phase}: unknown materialization ref`);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${thread.id}: thread length`);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref), `${thread.id}: missing beat ${ref}`);
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref), `${delayed.id}: consequence must return later`);
}

const conflict = flattenMails(readJson(catalogPath('conflict')))[0];
const followup = flattenMails(readJson(catalogPath('followup')))[0];
const consequence = flattenMails(readJson(catalogPath('consequence')))[0];
assert.equal(conflict.thread_key, 'psykologi_forsker_psykologi_analyseintegritet_001');
assert.equal(followup.thread_key, conflict.thread_key);
assert.equal(consequence.thread_key, conflict.thread_key, 'existing analysis-integrity continuity must remain intact');

const plan = readJson(PLAN_PATH);
assert.equal(plan.sequence.length, 8, 'existing Forsker mail plan must remain exactly eight steps');
assert.deepEqual(plan.sequence.map(step => step.type), PLAN_TYPES);
for (let i = 0; i < PLAN_TYPES.length; i += 1) assert.equal(plan.sequence[i].allowed_families[0], expected[PLAN_TYPES[i]][0]);

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
assert.equal(grammar.badge_binding.tier_threshold, 300);
assert.ok(grammar.authority_boundary?.may_not?.some(line => /psykologautorisasjon/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /diagnostisere eller behandle/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /nullfunn|analyseendringer/.test(line)));
assert.ok(grammar.place_grammar.every(surface => surface.kind === 'fictionalized_work_surface'));
assert.ok(grammar.work_loops.length >= 4);

const model = readJson(MODEL_PATH);
assert.equal(model.source.tier_threshold, 300);
assert.ok(model.scope_boundary?.cannot?.some(line => /psykologautorisasjon/.test(line)));
assert.ok(model.scope_boundary?.cannot?.some(line => /diagnostisere eller behandle/.test(line)));
assert.ok(model.scope_boundary?.cannot?.some(line => /nullfunn|analysehistorikken/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_FORSKER_PSYKOLOGI_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_FORSKER_PSYKOLOGI_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 22);
assert.ok(readiness.summary?.rollout_queue_roles <= 63);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: psykologi/forsker_psykologi');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Psykologi Forsker Role World rollout closes situated-reputation debt fail-closed');
