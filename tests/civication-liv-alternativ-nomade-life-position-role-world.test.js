#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const worldPath = 'data/Civication/roleWorlds/liv_alternativ/liv_alternativ_nomade.json';
const narrativePath = 'data/Civication/narratives/leisure/liv_alternativ_nomade.json';
const world = readJson(worldPath);
const stream = readJson(narrativePath);
const index = readJson('data/Civication/roleWorlds/index.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(world.category, 'liv_alternativ');
assert.equal(world.role_scope, 'liv_alternativ_nomade');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, { badge_id:'liv_alternativ', id:'nomade', label:'Nomade' });
assert.equal(world.status, 'role_world_complete');
assert.equal(world.materialization.no_new_runtime, true);
assert.match(world.sociological_core.description, /bostedsløshet|arbeidsledighet|profesjonell/i);

const phases=['morning','lunch','afternoon','evening'];
assert.equal(world.season.days,14);
assert.deepEqual(world.season.day_phases,phases);
assert.equal(world.season.coverage.length,56);
const coverage=new Set(world.season.coverage.map(x=>x.day+'/'+x.phase));
assert.equal(coverage.size,56);
for(let day=1;day<=14;day+=1) for(const phase of phases) assert.ok(coverage.has(day+'/'+phase));

const storyIds=new Set(stream.storylets.map(x=>x.id));
assert.equal(storyIds.size,14);
assert.equal(world.materialization.source_refs.length,14);
assert.equal(new Set(world.materialization.source_refs).size,14);
for(const ref of world.materialization.source_refs){
  assert.ok(ref.startsWith(narrativePath+'#'));
  assert.ok(storyIds.has(ref.slice((narrativePath+'#').length)));
}
for(const beat of world.season.coverage){
  assert.ok(beat.thread_ids.length>=1);
  assert.ok(beat.materialization_refs.length>=1);
}

assert.ok(world.recurring_people_archetypes.length>=5);
for(const person of world.recurring_people_archetypes){
  for(const field of ['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player']) assert.ok(person[field], person.id+' missing '+field);
}
assert.ok(world.recurring_people_archetypes.some(x=>x.id==='midlertidig_vert'));
assert.ok(world.recurring_people_archetypes.some(x=>x.id==='fjern_arbeidskontakt'));

const threadIds=new Set(world.primary_threads.map(x=>x.id));
assert.ok(threadIds.size>=7);
for(const thread of world.primary_threads){
  assert.ok(thread.beat_refs.length>=5 && thread.beat_refs.length<=10);
  assert.ok(new Set(thread.beat_refs.map(ref=>Number(ref.split('/')[0]))).size>=3);
  for(const ref of thread.beat_refs) assert.ok(coverage.has(ref));
}
for(const beat of world.season.coverage) for(const id of beat.thread_ids) assert.ok(threadIds.has(id));
assert.ok(world.private_aftermath.length>=4);
assert.ok(world.delayed_consequences.length>=6);
for(const delayed of world.delayed_consequences){
  assert.ok(coverage.has(delayed.setup_ref));
  assert.ok(coverage.has(delayed.return_ref));
  assert.ok(Number(delayed.return_ref.split('/')[0])>Number(delayed.setup_ref.split('/')[0]));
}

assert.deepEqual(themeBank.reference_profiles['liv_alternativ/liv_alternativ_nomade'],world.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));
const entry=index.roles.find(x=>x.life_position_key==='liv_alternativ/nomade');
assert.ok(entry);
assert.equal(entry.path,worldPath);
assert.equal(entry.status,'role_world_complete');
assert.deepEqual(entry.life_position_ref,{badge_id:'liv_alternativ',id:'nomade',label:'Nomade'});
assert.equal(index.roles.filter(x=>x.subject_type!=='life_position').length,85);
assert.equal(index.roles.filter(x=>x.subject_type==='life_position').length,17);
assert.equal(index.roles.length,102);
assert.equal(index.status,'102_role_worlds_materialized');
assert.deepEqual(index.summary,{role_worlds_total:102,career_role_worlds:85,life_position_role_worlds:17});
assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('liv_alternativ/nomade'));
assert.equal(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.length,17);
assert.equal(taxonomy.canonical_counts.life_position_role_worlds,17);
assert.equal(taxonomy.canonical_counts.total_role_worlds,102);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds,17);

const first=stream.storylets.find(x=>x.id==='avreisen_uten_rolle');
assert.match(first.situation.join(' '), /ikke automatisk arbeidsledighet, bostedsløshet, ferie eller profesjon/i);
const admin=stream.storylets.find(x=>x.id==='adressen_som_ikke_folger_deg');
assert.match(admin.choices.find(x=>x.id==='A').label,/lovlig|pålitelig/i);
console.log('civication Liv alternativ Nomade Role World ok: 56/56 / 14 anchors / 102 total / 17 life-position worlds');
