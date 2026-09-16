#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const worldPath='data/Civication/roleWorlds/filosofi/filosofi_fagfilosof.json';
const narrativePath='data/Civication/narratives/leisure/filosofi_fagfilosof.json';
const world=read(worldPath),stream=read(narrativePath),index=read('data/Civication/roleWorlds/index.json');
const themeBank=read('data/Civication/roleWorldThemeBank.json');
assert.equal(world.schema,'civication_role_world_v1');
assert.equal(world.version,1);
assert.equal(world.category,'filosofi');
assert.equal(world.role_scope,'filosofi_fagfilosof');
assert.equal(world.subject_type,'life_position');
assert.deepEqual(world.life_position_ref,{badge_id:'filosofi',id:'fagfilosof',label:'Fagfilosof'});
assert.equal(world.status,'role_world_complete');
assert.equal(world.materialization?.no_new_runtime,true);
assert.match(world.sociological_core.description,/professional_field_identity/i);
assert.match(world.sociological_core.description,/employment-independent/i);
assert.match(world.sociological_core.description,/ingen automatisk grad|ingen automatisk.*stilling|professortittel|foreleserrolle/i);
assert.match(world.sociological_core.description,/ingen ny runtime/i);
assert.equal(stream.storylets.length,14);
assert.equal(world.season.days,14);
assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length,56);
assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
assert.equal(world.primary_threads.length,14);
assert.equal(world.recurring_people_archetypes.length,6);
assert.equal(world.private_aftermath.length,5);
assert.equal(world.delayed_consequences.length,6);
const storyIds=new Set(stream.storylets.map(x=>x.id));
const prefix=narrativePath+'#';
for(const beat of world.season.coverage){
  assert.ok(Array.isArray(beat.materialization_refs)&&beat.materialization_refs.length>=1);
  for(const ref of beat.materialization_refs){
    assert.ok(ref.startsWith(prefix),ref);
    assert.ok(storyIds.has(ref.slice(prefix.length)),ref);
  }
}
for(const t of world.primary_threads){
  assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10,t.id+' beat span');
  for(const ref of t.beat_refs){
    const b=world.season.coverage.find(x=>x.day+'/'+x.phase===ref);
    assert.ok(b&&b.thread_ids.includes(t.id),t.id+' missing on '+ref);
  }
}
const required=['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player'];
for(const person of world.recurring_people_archetypes) for(const field of required) assert.ok(person[field],person.id+' missing '+field);
assert.deepEqual(themeBank.reference_profiles['filosofi/filosofi_fagfilosof'],world.theme_ids);
const entry=index.roles.find(x=>x.life_position_key==='filosofi/fagfilosof');
assert.ok(entry);
assert.equal(entry.role_scope,'filosofi_fagfilosof');
assert.equal(entry.path,worldPath);
assert.equal(index.career_role_world_count,85);
assert.equal(index.life_position_role_world_count,88);
assert.equal(index.roles.length,173);
console.log('Fagfilosof Role World gate ok: 14 storylets / 56 beats / 14 threads / 6 people / 5 aftermath / 6 delayed');
