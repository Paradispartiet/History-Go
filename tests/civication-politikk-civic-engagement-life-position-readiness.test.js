#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const badge=read('data/badges/politikk.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const lifeId=['samfunnsengasjert','borger'].join('_');
const lifeKey=['politikk',lifeId].join('/');
const lifeScope=['politikk','samfunnsdeltakelse'].join('_');
const streamPath=['data','Civication','narratives','leisure',lifeScope+'.json'].join('/');
const worldPath=['data','Civication','roleWorlds','politikk',lifeScope+'.json'].join('/');
const legacyPath=['data','Civication','roleModels','politikk',lifeId+'.json'].join('/');
const stream=read(streamPath);
const legacy=read(legacyPath);
const tier=badge.tiers.find(x=>x.life_position?.id===lifeId);
assert.ok(tier);
assert.equal(tier.life_position.kind,'civic_engagement');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
assert.equal(tier.career_unlock,undefined);
assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,lifeScope+'_stream');
assert.deepEqual(stream.applies_when.any_tags,['politikk:'+lifeId]);
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
for(const s of stream.storylets){assert.equal(s.choices.length,2);assert.deepEqual(s.choices.map(c=>c.effect),[1,-1]);}
const row=audit.positions.find(x=>x.key===lifeKey);
assert.ok(row);
assert.equal(row.classification,'ready');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(row.authored_depth.livelihood_template_count,0);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.deepEqual(row.evidence.livelihood_templates,[]);
for(const key of ['politikk/statsvitenskapelig_ekspert','politikk/tillitsvalgt']){
 const pending=audit.positions.find(x=>x.key===key);assert.ok(pending);assert.equal(pending.classification,'needs_authored_depth');
 assert.ok(!(pending.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+key);
}
for(const key of ['politikk/demokratianalytiker','politikk/aktivist','politikk/grasrotbygger','politikk/kampanjemenneske','politikk/motesliter','politikk/organisasjonsmenneske']){
 const ready=audit.positions.find(x=>x.key===key);assert.ok(ready);assert.equal(ready.classification,'ready');
 assert.ok(!(ready.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+key);
}
const legacyRoleId=['politikk',lifeId].join('_');
assert.equal(legacy.role_id,legacyRoleId);
assert.equal(legacy.role_scope,lifeId);
assert.notEqual(lifeScope,legacy.role_id);
assert.notEqual(lifeScope,legacy.role_scope);
const careerWorlds=index.roles.filter(x=>x.category==='politikk'&&x.subject_type!=='life_position');
assert.equal(careerWorlds.length,5,'Politikk career worlds must remain separate and unchanged in count');
if(fs.existsSync(path.join(ROOT,worldPath))){
 assert.equal(row.role_world_status,'role_world_complete');
 assert.equal(row.role_world_path,worldPath);
 const indexed=index.roles.find(x=>x.life_position_key===lifeKey);assert.ok(indexed);assert.equal(indexed.role_scope,lifeScope);
 const world=read(worldPath);
 assert.equal(world.subject_type,'life_position');
 assert.equal(world.status,'role_world_complete');
 assert.deepEqual(world.life_position_ref,{badge_id:'politikk',id:lifeId,label:'Samfunnsengasjert borger'});
 assert.equal(world.materialization.no_new_runtime,true);
 assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
 assert.equal(world.season.coverage.length,56);
 assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
 assert.equal(world.materialization.source_refs.length,14);
 assert.equal(world.primary_threads.length,14);
 assert.equal(world.recurring_people_archetypes.length,6);
 assert.equal(world.private_aftermath.length,5);
 assert.equal(world.delayed_consequences.length,6);
 assert.match(world.sociological_core.description,/Aktivist/);
 assert.match(world.sociological_core.description,/Grasrotbygger/);
 assert.match(world.sociological_core.description,/Tillitsvalgt/);
}else{
 assert.equal(row.role_world_status,'role_world_not_started');
 assert.equal(row.role_world_path,null);
 assert.equal(audit.first_ready?.key,lifeKey);
}
console.log('Samfunnsengasjert borger readiness gate ok: civic engagement remains separate from legacy role, activism and representative mandate');
