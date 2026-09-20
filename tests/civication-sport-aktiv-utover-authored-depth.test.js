#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));

const badge=read('data/badges/sport.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');

const lifeId='aktiv_utover';
const lifeKey='sport/aktiv_utover';
const lifeScope='sport_aktiv_utover';
const streamPath='data/Civication/narratives/leisure/sport_aktiv_utover.json';
const worldPath='data/Civication/roleWorlds/sport/sport_aktiv_utover.json';

const stream=read(streamPath);
const tier=badge.tiers.find(x=>x.life_position?.id===lifeId);
assert.ok(tier,'Sport Aktiv utøver tier must exist');
assert.equal(tier.life_position.label,'Aktiv utøver');
assert.equal(tier.life_position.kind,'participation_practice');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
assert.equal(tier.career_unlock,undefined);

assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,lifeScope+'_stream');
assert.deepEqual(stream.applies_when.any_tags,['sport:'+lifeId]);
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
for(const storylet of stream.storylets){
  assert.ok(Array.isArray(storylet.situation)&&storylet.situation.length>=3,storylet.id+' needs concrete multi-line situation');
  assert.equal(storylet.choices.length,2,storylet.id+' needs exactly two bounded choices');
  assert.deepEqual(storylet.choices.map(c=>c.effect),[1,-1],storylet.id+' choice effects must remain [1,-1]');
  assert.ok(storylet.choices.every(c=>Array.isArray(c.tags)&&c.tags.length>=2),storylet.id+' choices need semantic tags');
}

const row=audit.positions.find(x=>x.key===lifeKey);
assert.ok(row,'Sport Aktiv utøver must remain in life-position readiness');
assert.equal(row.classification,'ready','The authored Sport Aktiv utøver stream must make the position ready before Role World production');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.thematic_source_ref_count,0);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(row.authored_depth.livelihood_template_count,0);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.deepEqual(row.evidence.thematic_source_refs,[]);
assert.deepEqual(row.evidence.livelihood_templates,[]);

for(const other of audit.positions.filter(x=>x.key!==lifeKey)){
  assert.ok(!(other.evidence.exact_source_refs||[]).includes(streamPath),streamPath+' leaked exact binding into '+other.key);
  assert.ok(!(other.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic binding into '+other.key);
}

const indexed=index.roles.find(x=>x.life_position_key===lifeKey);
const worldExists=fs.existsSync(path.join(ROOT,worldPath));
if(!worldExists){
  assert.equal(row.role_world_status,'role_world_not_started');
  assert.equal(row.role_world_path,null);
  assert.equal(indexed,undefined,'Source-depth phase must not pre-register an unbuilt Aktiv utøver Role World');
  const queued=audit.queue.find(x=>x.key===lifeKey);
  assert.ok(queued,'Ready but unbuilt Aktiv utøver must remain in queue');
  assert.equal(queued.rank,1,'Aktiv utøver should become the next canonical ready Role World after authored-depth repair');
  assert.equal(queued.classification,'ready');
}else{
  const world=read(worldPath);
  assert.equal(row.role_world_status,'role_world_complete');
  assert.equal(row.role_world_path,worldPath);
  assert.ok(!audit.queue.some(x=>x.key===lifeKey),'Completed Aktiv utøver must leave the readiness queue');
  assert.ok(indexed,'Completed Aktiv utøver must be indexed');
  assert.equal(indexed.role_scope,lifeScope);
  assert.equal(indexed.status,'role_world_complete');
  assert.equal(world.schema,'civication_role_world_v1');
  assert.equal(world.subject_type,'life_position');
  assert.equal(world.status,'role_world_complete');
  assert.deepEqual(world.life_position_ref,{badge_id:'sport',id:lifeId,label:'Aktiv utøver'});
  assert.equal(world.materialization.no_new_runtime,true);
  assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
  assert.equal(world.season.coverage.length,56);
  assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
  assert.equal(world.primary_threads.length,14);
  assert.equal(world.recurring_people_archetypes.length,6);
  assert.equal(world.private_aftermath.length,5);
  assert.equal(world.delayed_consequences.length,6);
  assert.equal(world.materialization.source_refs.length,14);
  assert.match(world.sociological_core.description,/Mosjonist/);
  assert.match(world.sociological_core.description,/Søndagsutøver/);
  assert.match(world.sociological_core.description,/Konkurranseutøver/);
  assert.match(world.sociological_core.description,/Klubbspiller/);
  assert.match(world.sociological_core.description,/Profesjonell utøver/);
  assert.match(world.sociological_core.description,/trener/);
}
console.log(worldExists
 ? 'Sport Aktiv utøver authored-depth and completed Role World gate ok'
 : 'Sport Aktiv utøver authored-depth gate ok: exact 14-storylet source makes regular participation practice ready without competition, club or professional status');
