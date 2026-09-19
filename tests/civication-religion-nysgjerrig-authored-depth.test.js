#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));

const badge=read('data/badges/religion.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const evidence=read('data/Civication/religionCareerLifeEvidence.json');

const lifeId='nysgjerrig';
const lifeKey='religion/nysgjerrig';
const lifeScope='religion_nysgjerrig';
const streamPath='data/Civication/narratives/leisure/religion_nysgjerrig.json';
const worldPath='data/Civication/roleWorlds/religion/religion_nysgjerrig.json';

const stream=read(streamPath);
const tier=badge.tiers.find(x=>x.life_position?.id===lifeId);
assert.ok(tier,'Religion Nysgjerrig tier must exist');
assert.equal(tier.life_position.label,'Nysgjerrig');
assert.equal(tier.life_position.kind,'exploration_interest');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
assert.equal(tier.career_unlock,undefined);
assert.ok(evidence.canonical_decision.pure_life_or_practice_tiers.includes('Nysgjerrig'));
assert.ok(evidence.salary_mapping.not_salary_jobs.includes('Nysgjerrig'));

assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,lifeScope+'_stream');
assert.deepEqual(stream.applies_when.any_tags,['religion:'+lifeId]);
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
for(const storylet of stream.storylets){
  assert.ok(Array.isArray(storylet.situation)&&storylet.situation.length>=3,storylet.id+' needs concrete multi-line situation');
  assert.equal(storylet.choices.length,2,storylet.id+' needs exactly two bounded choices');
  assert.deepEqual(storylet.choices.map(c=>c.effect),[1,-1],storylet.id+' choice effects must remain [1,-1]');
  assert.ok(storylet.choices.every(c=>Array.isArray(c.tags)&&c.tags.length>=2),storylet.id+' choices need semantic tags');
}

const row=audit.positions.find(x=>x.key===lifeKey);
assert.ok(row,'Religion Nysgjerrig must remain in life-position readiness');
assert.equal(row.classification,'ready','The authored Religion Nysgjerrig stream must make the position ready before Role World production');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.thematic_source_ref_count,0);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(row.authored_depth.livelihood_template_count,0);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.deepEqual(row.evidence.thematic_source_refs,[]);
assert.deepEqual(row.evidence.livelihood_templates,[]);

const philosophyTwin=audit.positions.find(x=>x.key==='filosofi/nysgjerrig');
assert.ok(philosophyTwin,'Filosofi Nysgjerrig must remain independently classified');
assert.ok(!(philosophyTwin.evidence.exact_source_refs||[]).includes(streamPath),'Badge-scoped Religion Nysgjerrig source must not bind Filosofi Nysgjerrig');
assert.ok(!(philosophyTwin.evidence.thematic_source_refs||[]).includes(streamPath),'Religion Nysgjerrig source must not become thematic evidence for Filosofi Nysgjerrig');

for(const key of ['religion/besokende','religion/dialogbygger','religion/feltarbeider','religion/livssynsutforsker','religion/pilegrim','religion/trosstedsvandrer','religion/ritualkjenner','religion/symboltolker','religion/tradisjonskjenner','religion/troslivskjenner']){
  const neighbor=audit.positions.find(x=>x.key===key);
  assert.ok(neighbor,key);
  assert.ok(!(neighbor.evidence.exact_source_refs||[]).includes(streamPath),streamPath+' leaked exact binding into '+key);
}

const indexed=index.roles.find(x=>x.life_position_key===lifeKey);
const worldExists=fs.existsSync(path.join(ROOT,worldPath));
if(!worldExists){
  assert.equal(row.role_world_status,'role_world_not_started');
  assert.equal(row.role_world_path,null);
  assert.equal(indexed,undefined,'Source-depth phase must not pre-register an unbuilt Role World');
  const queued=audit.queue.find(x=>x.key===lifeKey);
  assert.ok(queued,'Ready but unbuilt Nysgjerrig must remain in queue');
  assert.equal(queued.rank,1,'Nysgjerrig should become the next canonical ready Role World after authored-depth repair');
  assert.equal(queued.classification,'ready');
}else{
  const world=read(worldPath);
  assert.equal(row.role_world_status,'role_world_complete');
  assert.equal(row.role_world_path,worldPath);
  assert.ok(!audit.queue.some(x=>x.key===lifeKey),'Completed Nysgjerrig must leave the queue');
  assert.ok(indexed,'Completed Nysgjerrig must be indexed');
  assert.equal(indexed.role_scope,lifeScope);
  assert.equal(indexed.status,'role_world_complete');
  assert.equal(world.schema,'civication_role_world_v1');
  assert.equal(world.subject_type,'life_position');
  assert.equal(world.status,'role_world_complete');
  assert.deepEqual(world.life_position_ref,{badge_id:'religion',id:lifeId,label:'Nysgjerrig'});
  assert.equal(world.materialization.no_new_runtime,true);
}

console.log(worldExists
  ? 'Religion Nysgjerrig authored-depth and completed Role World gate ok'
  : 'Religion Nysgjerrig authored-depth gate ok: exact 14-storylet source makes the life position ready without employment or authority');
