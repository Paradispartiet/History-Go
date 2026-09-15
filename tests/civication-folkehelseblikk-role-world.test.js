#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const stream=read('data/Civication/narratives/leisure/helse_folkehelseblikk.json');
const world=read('data/Civication/roleWorlds/helse/helse_folkehelseblikk.json');
const index=read('data/Civication/roleWorlds/index.json');
const row=audit.positions.find(x=>x.key==='helse/folkehelseblikk');
assert.ok(row);
assert.equal(world.status,'role_world_complete');
assert.equal(world.subject_type,'life_position');
assert.deepEqual(world.life_position_ref,{badge_id:'helse',id:'folkehelseblikk',label:'Folkehelseblikk'});
assert.equal(stream.storylets.length,14);
assert.equal(world.season.coverage.length,56);
assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
assert.equal(world.primary_threads.length,14);
assert.equal(world.recurring_people_archetypes.length,6);
assert.equal(world.private_aftermath.length,5);
assert.equal(world.delayed_consequences.length,6);
assert.equal(world.materialization.source_refs.length,14);
for(const t of world.primary_threads){
  assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10,t.id);
  assert.ok(new Set(t.beat_refs.map(ref=>Number(ref.split('/')[0]))).size>=3,t.id);
}
for(const beat of world.season.coverage){assert.ok(beat.thread_ids.length>=1);assert.ok(beat.materialization_refs.length>=1);}
assert.equal(row.classification,'ready');
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.role_world_path,'data/Civication/roleWorlds/helse/helse_folkehelseblikk.json');
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.ok(!audit.queue.some(x=>x.key==='helse/folkehelseblikk'));
assert.equal(audit.summary.pending_ready_positions,0);
assert.equal(audit.summary.completed_life_position_role_worlds,index.life_position_role_world_count);
assert.equal(index.roles.length,index.summary.role_worlds_total);
assert.equal(index.life_position_role_world_count,index.summary.life_position_role_worlds);
for(const id of ['conditions_vs_blame','average_vs_distribution','prevention_vs_visibility','universal_vs_targeted','measurement_vs_lived_experience','equity_vs_equal_treatment'])assert.ok(world.primary_threads.some(x=>x.id===id),id);
for(const id of ['pendlernabo','omsorgsforelder','statistikkvenn','lokal_arrangor','systemplanlegger','forebyggingsskeptiker'])assert.ok(world.recurring_people_archetypes.some(x=>x.id===id),id);
assert.match(world.sociological_core.description,/ingen diagnostisk, klinisk eller behandlende myndighet/i);
console.log('Folkehelseblikk Role World gate ok');
