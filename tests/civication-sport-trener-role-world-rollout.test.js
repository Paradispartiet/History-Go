'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(f => f.mails || []);
const order = ref => { const [d,p] = ref.split('/'); return Number(d) * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[p] || 0); };

const KEY = 'sport/sport_trener';
const ROLE = 'sport_trener';
const WORLD_PATH = 'data/Civication/roleWorlds/sport/sport_trener.json';
const PLAN_PATH = 'data/Civication/mailPlans/sport/sport_trener_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/sport/sport_trener.json';
const MODEL_PATH = 'data/Civication/roleModels/sport/trener.json';
const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_SPORT_TRENER_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
const expected = {
  job:['data/Civication/mailFamilies/sport/job/sport_trener_job.json','sport_trener_job_okt_001'],
  people:['data/Civication/mailFamilies/sport/people/sport_trener_people.json','sport_trener_people_lina_001'],
  conflict:['data/Civication/mailFamilies/sport/conflict/sport_trener_conflict.json','sport_trener_conflict_uttak_001'],
  story:['data/Civication/mailFamilies/sport/story/sport_trener_story.json','sport_trener_story_resultatkrise_001'],
  event:['data/Civication/mailFamilies/sport/event/sport_trener_event.json','sport_trener_event_kampdag_001'],
  micro:['data/Civication/mailFamilies/sport/micro/sport_trener_micro.json','sport_trener_micro_feedback_001'],
  knowledge:['data/Civication/mailFamilies/sport/knowledge/sport_trener_knowledge.json','sport_trener_knowledge_faggrense_001'],
  followup:['data/Civication/mailFamilies/sport/followup/sport_trener_followup.json','sport_trener_followup_belastning_001'],
  consequence:['data/Civication/mailFamilies/sport/consequence/sport_trener_consequence.json','sport_trener_consequence_belastning_001']
};
const expectedRefs = Object.values(expected).map(([rel,id]) => `${rel}#${id}`);

assert.ok(exists(WORLD_PATH), 'Sport-trener Role World must exist');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'sport');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverage = new Set(world.season.coverage.map(b => `${b.day}/${b.phase}`));
assert.equal(coverage.size, 56);
for (let day=1; day<=14; day++) for (const phase of world.season.day_phases) assert.ok(coverage.has(`${day}/${phase}`));
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').length >= 115, `${beat.day}/${beat.phase}: substantive beat required`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
  for (const ref of beat.materialization_refs) assert.ok(expectedRefs.includes(ref), `${beat.day}/${beat.phase}: unknown provenance ${ref}`);
}
assert.ok(world.recurring_people_archetypes.length >= 8);
assert.ok(world.social_environments.length >= 4);
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
assert.deepEqual(world.materialization.source_refs, expectedRefs);
assert.doesNotMatch(JSON.stringify(world.materialization.authored_dimensions), /persistent_work_object|rhythm_waiting_handoff_rework|people_places_integrity|career:/);

const continuity = world.existing_work_continuity;
assert.equal(continuity.runtime_binding, 'existing_mail_and_work_grammar');
assert.equal(continuity.new_runtime_state, false);
for (const loop of [
  'definer mål og belastning for perioden',
  'planlegg og gjennomfør økter med tydelige observasjonspunkter',
  'evaluer utvikling og konkurransegrunnlag',
  'kommuniser beslutninger og juster planen på dokumenterbart grunnlag'
]) assert.ok(continuity.work_loops.includes(loop), `missing preserved work loop: ${loop}`);
assert.match(continuity.rule, /belastning|uttak|kamp|feedback|oppfølging/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
const requiredAudiences = ['sports_leadership','coaching_staff','players','performance_analysis','player_development_and_load_support','club_leadership','public_external_pressure','private_relations'];
const audienceIds = new Set((rep.audiences || []).map(a => a.id));
for (const id of requiredAudiences) assert.ok(audienceIds.has(id), `missing audience ${id}`);
assert.equal(new Set(rep.audiences.map(a => a.standing_axis)).size, rep.audiences.length);
for (const a of rep.audiences) {
  assert.ok(String(a.standing_axis || '').trim());
  assert.ok(Array.isArray(a.cares_about) && a.cares_about.length >= 2);
  assert.ok(String(a.cannot_grant || '').length >= 45);
}
assert.ok(rep.divergence_examples.length >= 5);
assert.match(rep.authority_separation, /medisinsk|kontrakt|uttak|Badge|mandat|myndighet/i);
assert.doesNotMatch(JSON.stringify(world), /global_reputation_score|universal_reputation|reputation_points/i);

const cross = world.cross_role_link;
assert.equal(cross.status, 'candidate_when_shared_work_is_real');
assert.equal(cross.companion, 'sport/sport_utover');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.equal(world.cross_role_sessions, undefined);
assert.match(cross.rule, /future|framtid|shared|delt|authority|mandat/i);
assert.match(sourceFirst, /candidate_when_shared_work_is_real/);
assert.match(sourceFirst, /materialized: `false`/);
assert.match(sourceFirst, /new runtime: `false`/);

for (const [type,[rel,id]] of Object.entries(expected)) {
  const doc = readJson(rel);
  assert.equal(doc.category, 'sport');
  assert.equal(doc.role_scope, ROLE);
  assert.equal(doc.mail_type, type);
  assert.ok(flattenMails(doc).some(m => m.id === id), `missing canonical ${type} scene ${id}`);
}
const follow = flattenMails(readJson(expected.followup[0])).find(m => m.id === expected.followup[1]);
const consequence = flattenMails(readJson(expected.consequence[0])).find(m => m.id === expected.consequence[1]);
assert.equal(follow.thread_key, 'sport_trener.case.belastning_og_faggrense');
assert.equal(consequence.thread_key, follow.thread_key);
for (const t of world.primary_threads) {
  assert.ok(t.beat_refs.length >= 5 && t.beat_refs.length <= 10);
  for (const ref of t.beat_refs) assert.ok(coverage.has(ref));
}
for (const d of world.delayed_consequences) {
  assert.ok(coverage.has(d.setup_ref));
  assert.ok(coverage.has(d.return_ref));
  assert.ok(order(d.return_ref) > order(d.setup_ref));
}

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'sport_trener_v1');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.sequence.every(step => step.type === 'job'));
assert.ok(plan.sequence.every(step => JSON.stringify(step.fallback_types) === '["job"]'));
const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
for (const loop of continuity.work_loops) assert.ok(grammar.work_loops.includes(loop));
for (const boundary of ['inngå kontrakter uten fullmakt','garantere landslagsplass eller medalje','utvide eget trener- eller ledermandat gjennom Badge-poeng','ta beslutninger som er lagt til andre fag- eller lederroller']) assert.ok(grammar.authority_boundary.cannot.includes(boundary));
const model = readJson(MODEL_PATH);
assert.equal(model.role_scope, ROLE);
assert.equal(model.role_id, ROLE);
for (const id of ['sportslig_koordinator_ida','assistenttrener_lina','analyseansvarlig_noah','spillerutvikler_amina']) assert.ok(model.related_people.some(p => p.id === id));
for (const id of ['sport_treningsfelt','sport_garderobe','sport_konkurransearena']) assert.ok(model.related_places.some(p => p.id === id));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(r => r.category === 'sport' && r.role_scope === ROLE && r.status === 'role_world_complete' && r.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_SPORT_TRENER_ROLE_WORLD_ROLLOUT.md'));

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 35);
assert.ok(readiness.summary?.rollout_queue_roles <= 50);
assert.ok(!(readiness.rollout_queue || []).some(r => r.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: sport/sport_trener');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const rr = (readiness.roles || []).find(r => r.key === KEY);
assert.ok(rr?.already_reference_or_pilot);

console.log('✓ Sport-trener Role World rollout closes situated-reputation debt without forcing cross-role runtime');
