#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const stream=read('data/Civication/narratives/leisure/litteratur_biblioteksvanker.json');
const world=read('data/Civication/roleWorlds/litteratur/litteratur_biblioteksvanker.json');
const index=read('data/Civication/roleWorlds/index.json');
const row=audit.positions.find(x=>x.key==='litteratur/biblioteksvanker');
assert.ok(row);
assert.equal(world.status,'role_world_complete');
assert.equal(world.subject_type,'life_position');
assert.deepEqual(world.life_position_ref,{badge_id:'litteratur',id:'biblioteksvanker',label:'Biblioteksvanker'});
assert.equal(stream.storylets.length,14);
assert.equal(world.season.coverage.length,56);
assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
assert.equal(world.primary_threads.length,14);
assert.equal(world.recurring_people_archetypes.length,6);
assert.equal(world.private_aftermath.length,5);
assert.equal(world.delayed_consequences.length,6);
assert.equal(world.materialization.source_refs.length,14);
for(const t of world.primary_threads){assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10,t.id);assert.ok(new Set(t.beat_refs.map(ref=>Number(ref.split('/')[0]))).size>=3,t.id);}
for(const beat of world.season.coverage){assert.ok(beat.thread_ids.length>=1);assert.ok(beat.materialization_refs.length>=1);}
assert.equal(row.classification,'ready');
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.role_world_path,'data/Civication/roleWorlds/litteratur/litteratur_biblioteksvanker.json');
assert.ok(!audit.queue.some(x=>x.key==='litteratur/biblioteksvanker'));
assert.equal(audit.summary.completed_life_position_role_worlds,index.life_position_role_world_count);
assert.equal(index.roles.length,index.summary.role_worlds_total);
for(const id of ['shared_space_vs_private_claim','reading_visibility_vs_privacy','staff_help_vs_service_entitlement','programming_vs_everyday_access','digital_access_vs_deservingness','library_habit_vs_professional_authority'])assert.ok(world.primary_threads.some(x=>x.id===id),id);
for(const id of ['bibliotekaren','den_andre_faste_brukeren','forstegangsbrukeren','programverten','den_digitale_brukeren','lesevennen'])assert.ok(world.recurring_people_archetypes.some(x=>x.id===id),id);
assert.match(world.sociological_core.description,/ingen bibliotekar-, arkivar-, konservator-/i);
assert.match(world.sociological_core.description,/ingen ny runtime/i);
console.log('Biblioteksvanker Role World gate ok');
