#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const stream=read('data/Civication/narratives/leisure/film_tv_kinogjenger.json');
const world=read('data/Civication/roleWorlds/film_tv/film_tv_kinogjenger.json');
const index=read('data/Civication/roleWorlds/index.json');
const row=audit.positions.find(x=>x.key==='film_tv/kinogjenger');
assert.ok(row);
assert.equal(world.subject_type,'life_position');
assert.deepEqual(world.life_position_ref,{badge_id:'film_tv',id:'kinogjenger',label:'Kinogjenger'});
assert.equal(stream.storylets.length,14);
assert.equal(world.season.coverage.length,56);
assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
for(const t of world.primary_threads)assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10,t.id);
for(const beat of world.season.coverage){
  assert.ok(beat.thread_ids.length>=1);
  assert.ok(beat.materialization_refs.length>=1);
}
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(audit.summary.completed_life_position_role_worlds,audit.positions.filter(x=>x.role_world_status==='role_world_complete').length);
assert.equal(index.roles.length,index.summary.role_worlds_total);
assert.equal(index.life_position_role_world_count,index.summary.life_position_role_worlds);
assert.ok(world.primary_threads.some(x=>x.id==='budget_vs_frequency'));
assert.ok(world.primary_threads.some(x=>x.id==='accessibility_vs_assumption'));
assert.ok(world.primary_threads.some(x=>x.id==='etiquette_vs_policing'));
assert.ok(world.primary_threads.some(x=>x.id==='late_show_vs_transport'));
assert.ok(world.primary_threads.some(x=>x.id==='postfilm_talk_vs_spoiler_boundaries'));
assert.ok(world.recurring_people_archetypes.some(x=>x.id==='kinoverten'));
assert.ok(world.recurring_people_archetypes.some(x=>x.id==='budsjettgjesten'));
assert.ok(world.recurring_people_archetypes.some(x=>x.id==='tilgjengelighetsgjesten'));
console.log('Kinogjenger Role World gate ok');
