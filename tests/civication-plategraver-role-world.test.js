#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const stream=read('data/Civication/narratives/leisure/musikk_plategraver.json');
const world=read('data/Civication/roleWorlds/musikk/musikk_plategraver.json');
const index=read('data/Civication/roleWorlds/index.json');
assert.equal(world.status,'role_world_complete');assert.deepEqual(world.life_position_ref,{badge_id:'musikk',id:'plategraver',label:'Plategraver'});
assert.equal(stream.storylets.length,14);assert.equal(world.season.coverage.length,56);assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
assert.equal(world.primary_threads.length,14);assert.equal(world.recurring_people_archetypes.length,6);assert.equal(world.private_aftermath.length,5);assert.equal(world.delayed_consequences.length,6);
for(const t of world.primary_threads){assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10);for(const ref of t.beat_refs){const b=world.season.coverage.find(x=>x.day+'/'+x.phase===ref);assert.ok(b&&b.thread_ids.includes(t.id));}}
const row=audit.positions.find(x=>x.key==='musikk/plategraver');assert.equal(row.role_world_status,'role_world_complete');assert.equal(audit.summary.completed_life_position_role_worlds,index.life_position_role_world_count);
assert.match(world.sociological_core.description,/ingen automatisk fullmakt som platehandler/i);assert.match(world.sociological_core.description,/ingen ny runtime/i);
console.log('Plategraver Role World gate ok');
