#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const stream=read('data/Civication/narratives/leisure/kunst_gatekunstjeger.json');
const world=read('data/Civication/roleWorlds/kunst/kunst_gatekunstjeger.json');
const index=read('data/Civication/roleWorlds/index.json');
const row=audit.positions.find(x=>x.key==='kunst/gatekunstjeger');
assert.ok(row);
assert.equal(world.status,'role_world_complete');
assert.equal(world.subject_type,'life_position');
assert.deepEqual(world.life_position_ref,{badge_id:'kunst',id:'gatekunstjeger',label:'Gatekunstjeger'});
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
assert.equal(row.role_world_path,'data/Civication/roleWorlds/kunst/kunst_gatekunstjeger.json');
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.ok(!audit.queue.some(x=>x.key==='kunst/gatekunstjeger'));
assert.equal(audit.summary.pending_ready_positions,0);
assert.equal(audit.summary.completed_life_position_role_worlds,index.life_position_role_world_count);
assert.equal(index.roles.length,index.summary.role_worlds_total);
assert.equal(index.life_position_role_world_count,index.summary.life_position_role_worlds);
for(const id of ['ephemerality_vs_capture','attribution_vs_guessing','location_sharing_vs_stewardship','observation_vs_conservation','mapping_vs_selection_bias','street_art_practice_vs_professional_authority'])assert.ok(world.primary_threads.some(x=>x.id===id),id);
for(const id of ['nabolagsbeboeren','kunstneren_med_pseudonym','bildearkivaren','gaardeieren','den_andre_gatekunstjegeren','kulturforvalteren'])assert.ok(world.recurring_people_archetypes.some(x=>x.id===id),id);
assert.match(world.sociological_core.description,/ingen kunsthistoriker-, autentisator-, kurator-, konservator-/i);
assert.match(world.sociological_core.description,/ingen ny runtime/i);
console.log('Gatekunstjeger Role World gate ok');
