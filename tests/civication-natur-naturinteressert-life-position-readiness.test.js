#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const overlay=read('data/Civication/badgeCareerContracts/natur.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const lifeId=['natur','interessert'].join('');
const lifeKey=['natur',lifeId].join('/');
const lifeScope=['natur',lifeId].join('_');
const streamPath=['data','Civication','narratives','leisure',lifeScope+'.json'].join('/');
const worldPath=['data','Civication','roleWorlds','natur',lifeScope+'.json'].join('/');
const stream=read(streamPath);
const tier=overlay.tiers.find(x=>x.life_position?.id===lifeId);
assert.ok(tier);
assert.equal(tier.label,'Naturinteressert');
assert.equal(tier.life_position.kind,'nature_interest');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
assert.equal(tier.career_unlock,undefined);
assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,lifeScope+'_stream');
assert.deepEqual(stream.applies_when.any_tags,['natur:'+lifeId]);
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
for(const key of ['natur/feltobservator','natur/artsobservator','natur/artsjeger','natur/fuglekikker','natur/sanker','natur/turgaer']){
 const neighbor=audit.positions.find(x=>x.key===key);
 assert.ok(neighbor,key);
 assert.equal(neighbor.classification,'ready',key+' must remain ready');
 assert.ok(!(neighbor.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+key);
}
const careerWorlds=index.roles.filter(x=>x.category==='natur'&&x.subject_type!=='life_position');
assert.equal(careerWorlds.length,5,'Natur career worlds must remain separate and unchanged in count');
if(fs.existsSync(path.join(ROOT,worldPath))){
 assert.equal(row.role_world_status,'role_world_complete');
 assert.equal(row.role_world_path,worldPath);
 const indexed=index.roles.find(x=>x.life_position_key===lifeKey);
 assert.ok(indexed);
 assert.equal(indexed.role_scope,lifeScope);
 const world=read(worldPath);
 assert.equal(world.subject_type,'life_position');
 assert.equal(world.status,'role_world_complete');
 assert.deepEqual(world.life_position_ref,{badge_id:'natur',id:lifeId,label:'Naturinteressert'});
 assert.equal(world.materialization.no_new_runtime,true);
 assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
 assert.equal(world.season.coverage.length,56);
 assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
 assert.equal(world.materialization.source_refs.length,14);
 assert.equal(world.primary_threads.length,14);
 assert.equal(world.recurring_people_archetypes.length,6);
 assert.equal(world.private_aftermath.length,5);
 assert.equal(world.delayed_consequences.length,6);
 assert.match(world.sociological_core.description,/Turgåer/);
 assert.match(world.sociological_core.description,/Artsobservatør/);
 assert.match(world.sociological_core.description,/Feltobservatør/);
 assert.match(world.sociological_core.description,/Feltassistent/);
}else{
 assert.equal(row.role_world_status,'role_world_not_started');
 assert.equal(row.role_world_path,null);
 assert.equal(audit.first_ready?.key,lifeKey);
}
console.log('Naturinteressert readiness gate ok: broad nature interest remains separate from specialized Natur practices and careers');
