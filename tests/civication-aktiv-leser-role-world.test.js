#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const worldPath='data/Civication/roleWorlds/litteratur/litteratur_aktiv_leser.json';
const narrativePath='data/Civication/narratives/leisure/litteratur_aktiv_leser.json';
const world=read(worldPath),stream=read(narrativePath);
assert.equal(world.schema,'civication_role_world_v1');
assert.equal(world.version,1);
assert.equal(world.category,'litteratur');
assert.equal(world.role_scope,'litteratur_aktiv_leser');
assert.equal(world.subject_type,'life_position');
assert.deepEqual(world.life_position_ref,{badge_id:'litteratur',id:'aktiv_leser',label:'Aktiv leser'});
assert.equal(world.status,'role_world_complete');
assert.equal(world.materialization.no_new_runtime,true);
assert.equal(stream.applies_when.any_tags[0],'litteratur:aktiv_leser');
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
assert.equal(world.season.days,14);
assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length,56);
assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
assert.equal(world.primary_threads.length,14);
assert.equal(world.recurring_people_archetypes.length,6);
assert.equal(world.private_aftermath.length,5);
assert.equal(world.delayed_consequences.length,6);
assert.equal(world.materialization.source_refs.length,14);
const storyIds=new Set(stream.storylets.map(x=>x.id)),prefix=narrativePath+'#';
for(const beat of world.season.coverage){
  assert.ok(Array.isArray(beat.thread_ids)&&beat.thread_ids.length>=1);
  assert.ok(Array.isArray(beat.materialization_refs)&&beat.materialization_refs.length>=1);
  for(const ref of beat.materialization_refs){assert.ok(ref.startsWith(prefix),ref);assert.ok(storyIds.has(ref.slice(prefix.length)),ref);}
}
for(const thread of world.primary_threads){
  assert.ok(thread.beat_refs.length>=5&&thread.beat_refs.length<=10,thread.id);
  assert.ok(new Set(thread.beat_refs.map(ref=>Number(ref.split('/')[0]))).size>=3,thread.id+' day span');
  for(const ref of thread.beat_refs){const beat=world.season.coverage.find(x=>x.day+'/'+x.phase===ref);assert.ok(beat,ref);assert.ok(beat.thread_ids.includes(thread.id),thread.id+' missing reciprocal beat binding at '+ref);}
}
const required=['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player'];
for(const person of world.recurring_people_archetypes) for(const field of required) assert.ok(String(person[field]||'').trim(),person.id+' missing '+field);
assert.match(world.sociological_core.description,/ingen kritiker-, redaktør-, lærer-/i);
assert.match(world.sociological_core.description,/ingen automatisk jobb eller lønn/i);
assert.match(world.sociological_core.description,/ingen ny runtime/i);
console.log('Aktiv leser Role World gate ok: 14 storylets / 56 beats / 14 threads / 6 people / 5 aftermath / 6 delayed');
