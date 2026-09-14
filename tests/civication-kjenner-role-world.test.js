#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const stream=read('data/Civication/narratives/leisure/film_tv_kjenner.json');
const world=read('data/Civication/roleWorlds/film_tv/film_tv_kjenner.json');
const index=read('data/Civication/roleWorlds/index.json');
const row=audit.positions.find(x=>x.key==='film_tv/kjenner');
assert.ok(row);
assert.equal(world.subject_type,'life_position');
assert.deepEqual(world.life_position_ref,{badge_id:'film_tv',id:'kjenner',label:'Kjenner'});
assert.equal(stream.storylets.length,14);
assert.equal(world.season.coverage.length,56);
assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
for(const t of world.primary_threads)assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10,t.id);
for(const beat of world.season.coverage){assert.ok(beat.thread_ids.length>=1);assert.ok(beat.materialization_refs.length>=1);}
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(audit.summary.completed_life_position_role_worlds,audit.positions.filter(x=>x.role_world_status==='role_world_complete').length);
assert.equal(index.roles.length,index.summary.role_worlds_total);
assert.equal(index.life_position_role_world_count,index.summary.life_position_role_worlds);
for(const id of ['recommendation_fit_vs_status','formal_language_vs_verdict','interpretation_vs_fact','canon_vs_plurality','reputation_vs_authority','knowledge_vs_humility'])assert.ok(world.primary_threads.some(x=>x.id===id),id);
for(const id of ['venn_som_ber_om_rad','detaljsterk_venn','ny_seer_med_kort_tid','uenig_samtalepartner'])assert.ok(world.recurring_people_archetypes.some(x=>x.id===id),id);
console.log('Kjenner Role World gate ok');
