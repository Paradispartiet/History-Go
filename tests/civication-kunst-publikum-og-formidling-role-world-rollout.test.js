const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const CATEGORY = 'kunst';
const ROLE = 'kunst_publikum_og_formidling';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_KUNST_PUBLIKUM_OG_FORMIDLING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'publikumsmote_formidling_tilgjengelighet_hendelses_og_eskaleringslogg';
const LOOPS = ['forbered -> motta -> avklare behov -> formidle -> observer -> dokumenter','hendelse -> sikre situasjon -> eskaler -> informer -> dokumenter -> lær'];
const AUTHORITY = {
  may:['formidle godkjent fagstoff','veilede publikum','håndtere ordinære publikumsbehov'],
  may_not:['endre proveniens eller katalogdata','love utlån eller salg uten fullmakt','omdefinere institusjonens faglige standpunkt','ignorere sikkerhets- eller bevaringsrutiner']
};
const POLICY = {
  'Vertskap (museum/galleri)':{policy:'direct',qualification_ids:[]},
  Gallerimedarbeider:{policy:'direct',qualification_ids:[]},
  Formidler:{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};
const EXPECTED_THEMES = ['professional_culture','class_power','status_anxiety','bureaucratic_power','care_vs_efficiency','invisible_work','shame_reputation','public_private_leakage','public_attention'];
const EXPECTED_AUDIENCES = ['visitors_and_mixed_publics','disabled_visitors_and_access_needs','educators_hosts_and_frontline_peers','curators_researchers_and_subject_specialists','conservation_security_and_gallery_operations','teachers_guides_and_community_partners','critics_media_and_public_attention','private_relations'];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});

for (const rel of [MODEL,GRAMMAR,PLAN,WORLD,SOURCE]) assert.ok(exists(rel),`${rel} missing`);
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const world = read(WORLD);
const badge = read('data/badges/kunst.json');

assert.equal(model.schema,'civication_role_model_v2');
assert.equal(model.role_scope,ROLE);
assert.equal(grammar.schema,'civication_work_grammar_v2');
assert.equal(grammar.role_scope,ROLE);
assert.equal(plan.sequence.length,16);
assert.deepEqual(grammar.work_loops,LOOPS);
assert.deepEqual(grammar.authority_boundary,AUTHORITY);
assert.equal(grammar.persistent_work_object_contract.id,PERSISTENT);
assert.equal(grammar.day_one_contract.entry,'career_offer_policy_by_title');
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title,POLICY);
assert.equal(grammar.rhythm_contract.waiting_states.length,6);
assert.ok(grammar.persistent_work_object_contract.states.length >= 14);

const byLabel = Object.fromEntries(badge.tiers.map((entry) => [entry.label,entry]));
assert.equal(byLabel['Vertskap (museum/galleri)'].career_offer.role_scope,ROLE);
assert.equal(byLabel['Vertskap (museum/galleri)'].career_offer.policy,'direct');
assert.equal(byLabel.Gallerimedarbeider.career_offer.role_scope,ROLE);
assert.equal(byLabel.Gallerimedarbeider.career_offer.policy,'direct');
assert.equal(byLabel.Formidler.career_offer.role_scope,ROLE);
assert.equal(byLabel.Formidler.career_offer.policy,'qualification_required');
assert.deepEqual(byLabel.Formidler.career_offer.qualification_ids,['relevant_education_or_employer_qualification']);
for (const title of ['Vertskap (museum/galleri)','Gallerimedarbeider','Formidler']) assert.equal(byLabel[title].career_offer.salary_tier,1,title);

assert.equal(model.related_people.length,4);
for (const person of model.related_people) {
  assert.equal(person.fictional,true);
  assert.equal(person.fictional_scenario_actor,true);
  assert.equal(person.canonical_person_ref,null);
}
assert.equal(canonicalRefs.length,15);
assert.equal(new Set(canonicalRefs).size,15);

assert.equal(world.schema,'civication_role_world_v1');
assert.equal(world.version,1);
assert.equal(world.category,CATEGORY);
assert.equal(world.role_scope,ROLE);
assert.equal(world.status,'role_world_complete');
assert.deepEqual(world.theme_ids,EXPECTED_THEMES);
assert.deepEqual(world.materialization.authored_dimensions,['situated_reputation']);
assert.equal(world.materialization.no_new_runtime,true);
for (const key of ['existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved','career_title_gates_preserved']) assert.equal(world.materialization[key],true,key);
assert.equal(world.materialization.cross_role_link_materialized,false);
assert.deepEqual(world.materialization.source_refs,canonicalRefs);

assert.deepEqual(world.existing_work_continuity.work_loops,LOOPS);
assert.equal(world.existing_work_continuity.persistent_work_object,PERSISTENT);
assert.deepEqual(world.existing_work_continuity.waiting_states,grammar.rhythm_contract.waiting_states);
assert.equal(world.existing_work_continuity.handoff_rule,grammar.persistent_work_object_contract.handoff_rule);
assert.equal(world.existing_work_continuity.rework_rule,grammar.rhythm_contract.rework_rule);
assert.equal(world.existing_work_continuity.new_runtime_state,false);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
const validThemes = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of world.theme_ids) assert.ok(validThemes.has(id),id);
const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed,false);
assert.deepEqual(rep.audiences.map((entry) => entry.id),EXPECTED_AUDIENCES);
assert.equal(new Set(rep.audiences.map((entry) => entry.standing_axis)).size,8);
for (const audience of rep.audiences) {
  assert.equal(audience.cares_about.length,2,audience.id);
  assert.ok(audience.cannot_grant.length >= 260,audience.id);
  assert.match(audience.cannot_grant,/kan ikke|cannot/i);
}
assert.ok(rep.divergence_examples.length >= 6);
for (const term of [/global/i,/evidens/i,/direct/i,/qualification_required/i,/relevant_education_or_employer_qualification/i,/proveniens/i,/katalogdata/i,/utlån/i,/salg/i,/faglige standpunkt/i,/sikkerhet/i,/bevaring/i,/History Go/i,/Badge/i]) assert.match(rep.authority_separation,term);

assert.equal(world.slow_axes.length,9);
assert.equal(new Set(world.slow_axes.map((axis) => axis.id)).size,9);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding,'editorial_only_until_governed');
assert.ok(world.social_environments.length >= 8);
assert.equal(world.recurring_people_archetypes.length,7);
for (const person of world.recurring_people_archetypes) for (const field of ['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player']) assert.ok(String(person[field] || '').trim(),`${person.id}/${field}`);

assert.equal(world.history_go_affordance.badge_id,'kunst');
assert.ok(canonicalRefs.includes(world.history_go_affordance.source_ref));
assert.ok(world.history_go_affordance.better_question.length >= 500);
for (const term of [/kan ikke/i,/qualification_required/i,/relevant_education_or_employer_qualification/i,/proveniens/i,/katalogdata/i,/utlån/i,/salg/i,/sikkerhet/i,/bevaring/i,/Badge/i]) assert.match(world.history_go_affordance.authority_boundary,term);

assert.equal(world.cross_role_proof.status,'not_materialized_no_shared_work_object');
assert.equal(world.cross_role_proof.shared_work_object_found,false);
assert.equal(world.cross_role_proof.required_for_rollout,false);
assert.equal(world.cross_role_proof.new_runtime,false);
assert.equal(world.cross_role_proof.candidate_when_shared_work_is_real,false);
assert.match(world.cross_role_proof.rule,/not_required_for_rollout/i);
assert.match(world.cross_role_proof.rule,/genuint|shared/i);
assert.deepEqual(world.editorial_uniqueness.not_copy_of,['kunst/kunst_kuratering_og_program','kunst/kunst_utstillingsproduksjon','kunst/kunst_museumsledelse']);
for (const term of [/publikum/i,/frontlinje/i,/tilgjengelig/i,/hendelse/i,/korrig|korreks/i,/privat/i]) assert.match(world.editorial_uniqueness.rule,term);

assert.equal(world.season.days,14);
assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length,56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(beatKeys.size,56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.summary)).size,56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size,56);
const phaseTypes = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const useCounts = new Map(canonicalRefs.map((ref) => [ref,0]));
for (let day=1; day<=14; day+=1) {
  const beats = world.season.coverage.filter((beat) => beat.day === day);
  assert.equal(beats.length,4,`day ${day}`);
  assert.deepEqual(new Set(beats.map((beat) => beat.phase)),new Set(['morning','lunch','afternoon','evening']));
}
for (const beat of world.season.coverage) {
  assert.equal(beat.beat_type,phaseTypes[beat.phase]);
  assert.ok(beat.summary.length >= 1050,`${beat.day}/${beat.phase} summary=${beat.summary.length}`);
  assert.ok(beat.standing_consequence.length >= 750,`${beat.day}/${beat.phase} standing=${beat.standing_consequence.length}`);
  assert.ok(EXPECTED_AUDIENCES.includes(beat.standing_audience));
  assert.equal(beat.materialization_refs.length,1);
  const ref = beat.materialization_refs[0];
  assert.ok(canonicalRefs.includes(ref),ref);
  useCounts.set(ref,useCounts.get(ref)+1);
}
for (const [ref,count] of useCounts) assert.ok(count >= 3,`${ref} underused=${count}`);

assert.equal(world.primary_threads.length,7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 300,thread.id);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10,thread.id);
  assert.equal(new Set(thread.beat_refs).size,thread.beat_refs.length,thread.id);
  assert.ok(new Set(thread.beat_refs.map((ref) => ref.split('/')[0])).size >= 2,thread.id);
  for (const ref of thread.beat_refs) assert.ok(beatKeys.has(ref),`${thread.id}/${ref}`);
}
assert.ok(world.private_aftermath.length >= 5);
for (const aftermath of world.private_aftermath) {
  assert.ok(aftermath.description.length >= 350,aftermath.id);
  for (const ref of aftermath.materialization_refs) assert.ok(canonicalRefs.includes(ref),`${aftermath.id}/${ref}`);
}
assert.ok(world.delayed_consequences.length >= 8);
assert.equal(new Set(world.delayed_consequences.map((entry) => entry.id)).size,world.delayed_consequences.length);
const order = (ref) => { const [day,phase] = ref.split('/'); return Number(day)*10+({morning:1,lunch:2,afternoon:3,evening:4}[phase]||0); };
for (const delayed of world.delayed_consequences) {
  assert.ok(beatKeys.has(delayed.setup_ref),delayed.id);
  assert.ok(beatKeys.has(delayed.return_ref),delayed.id);
  assert.ok(order(delayed.return_ref) > order(delayed.setup_ref),delayed.id);
  assert.ok(delayed.domains.length >= 2,delayed.id);
}

const index = read('data/Civication/roleWorlds/index.json');
const indexRows = index.roles.filter((entry) => entry.category === CATEGORY && entry.role_scope === ROLE);
assert.equal(indexRows.length,1);
assert.deepEqual(indexRows[0],{category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
assert.equal(checklist.reference_worlds.filter((entry) => entry === WORLD).length,1);
assert.deepEqual(themeBank.reference_profiles[KEY],EXPECTED_THEMES);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((entry) => entry.key === KEY);
assert.ok(ready,'readiness row missing');
assert.equal(ready.classification,'rollout_ready');
assert.equal(ready.role_world_status,'role_world_complete');
assert.ok(ready.already_reference_or_pilot);
assert.deepEqual(ready.authored_work_required,[]);
assert.equal(ready.dimensions.situated_reputation.status,'foundation_ready');
assert.ok(!(readiness.rollout_queue || []).some((entry) => entry.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 64);
assert.ok(readiness.summary.rollout_queue_roles <= 21);
assert.equal(readiness.gate.gate_pass,true);
assert.equal(readiness.gate.broad_rollout_allowed_now,true);
assert.equal(ready.cross_role.need,'not_required_for_rollout');

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status,'playable');
assert.equal(career.audit.runtime_gate,true);
assert.deepEqual(career.audit.missing_components,[]);
assert.equal(career.audit.salary.rows.length,3);
const actualPolicies = career.audit.salary.rows.map((row) => [row.title,row.offer_policy]).sort((a,b) => a[0].localeCompare(b[0],'nb'));
const expectedPolicies = [['Vertskap (museum/galleri)','direct'],['Gallerimedarbeider','direct'],['Formidler','qualification_required']].sort((a,b) => a[0].localeCompare(b[0],'nb'));
assert.deepEqual(actualPolicies,expectedPolicies);
for (const name of ['entry','day_one','workday_loop','people','places','mail','knowledge','authority','consequences','performance','economy','progression','exit']) assert.equal(career.audit.components[name].level,'complete',name);

const scenarioPeople = read('data/Civication/scenarioPeople/generated/kunst.json');
const factualPeople = new Set(Object.values(scenarioPeople.people_pool || {}).flat().map((person) => person.person_id));
for (const person of model.related_people) assert.ok(!factualPeople.has(person.id),`${person.id}: fictional actor entered factual people_pool`);

const source = fs.readFileSync(path.join(ROOT,SOURCE),'utf8');
for (const term of [/Scope lock/i,/Vertskap.*direct/i,/Gallerimedarbeider.*direct/i,/Formidler.*qualification_required/i,/relevant_education_or_employer_qualification/i,/situated_reputation/i,/no global reputation score/i,/not_materialized_no_shared_work_object/i,/not_required_for_rollout/i,/History Go/i,/no new runtime/i,/Editorial uniqueness/i,/15 canonical prerequisite mails|15 canonical|15 source/i,/30\/30/]) assert.match(source,term);

console.log('Civication Kunst Publikum og formidling Role World rollout: OK');
