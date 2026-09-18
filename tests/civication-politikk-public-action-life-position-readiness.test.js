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
const lifeId=['akti','vist'].join('');
const lifeLabel=['Akti','vist'].join('');
const lifeKey=['politikk',lifeId].join('/');
const lifeScope=['politikk','aktivisme','praksis'].join('_');
const streamPath=['data','Civication','narratives','leisure',lifeScope+'.json'].join('/');
const worldPath=['data','Civication','roleWorlds','politikk',lifeScope+'.json'].join('/');
const legacyPath=['data','Civication','roleModels','politikk',lifeId+'.json'].join('/');
const stream=read(streamPath);
const legacy=read(legacyPath);
const tier=badge.tiers.find(x=>x.life_position?.id===lifeId);
assert.ok(tier);
assert.equal(tier.life_position.label,lifeLabel);
assert.equal(tier.life_position.kind,'activism_practice');
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
for(const key of ['politikk/grasrotbygger','politikk/kampanjemenneske','politikk/motesliter','politikk/organisasjonsmenneske']){
 const neighbor=audit.positions.find(x=>x.key===key);assert.ok(neighbor);assert.equal(neighbor.classification,'ready');
 assert.ok(!(neighbor.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+key);
}
const democracyNeighbor=audit.positions.find(x=>x.key==='politikk/demokratianalytiker');
assert.ok(democracyNeighbor);
assert.equal(democracyNeighbor.classification,'ready');
assert.ok(!(democracyNeighbor.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into politikk/demokratianalytiker');
for(const key of ['politikk/samfunnsengasjert_borger','politikk/statsvitenskapelig_ekspert','politikk/tillitsvalgt']){
 const pending=audit.positions.find(x=>x.key===key);assert.ok(pending);assert.equal(pending.classification,'needs_authored_depth');
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
 const indexed=index.roles.find(x=>x.life_position_key===lifeKey);
 assert.ok(indexed);
 assert.equal(indexed.role_scope,lifeScope);
 const world=read(worldPath);
 assert.equal(world.subject_type,'life_position');
 assert.equal(world.status,'role_world_complete');
 assert.deepEqual(world.life_position_ref,{badge_id:'politikk',id:lifeId,label:lifeLabel});
 assert.equal(world.materialization.no_new_runtime,true);
 assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
 assert.equal(world.season.coverage.length,56);
 assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
 assert.equal(world.materialization.source_refs.length,14);
 assert.equal(world.primary_threads.length,14);
 assert.equal(world.recurring_people_archetypes.length,6);
 assert.equal(world.private_aftermath.length,5);
 assert.equal(world.delayed_consequences.length,6);
 assert.match(world.sociological_core.description,/Grasrotbygger/);
 assert.match(world.sociological_core.description,/Kampanjemenneske/);
 assert.match(world.sociological_core.description,/Organisasjonssekretær/);
}else{
 assert.equal(row.role_world_status,'role_world_not_started');
 assert.equal(row.role_world_path,null);
 assert.equal(audit.first_ready?.key,lifeKey);
}
console.log('political activism life-position gate ok: public-action practice remains separate from legacy work role and formal political authority');
