#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const badge=read('data/badges/musikk.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const streamPath='data/Civication/narratives/leisure/musikk_plateartist.json';
const worldPath='data/Civication/roleWorlds/musikk/musikk_plateartist.json';
const stream=read(streamPath);

const tier=badge.tiers.find((entry)=>entry.life_position?.id==='plateartist');
assert.ok(tier);
assert.equal(tier.threshold,300);
assert.equal(tier.life_position.kind,'recording_artist_status');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
assert.equal(tier.career_unlock,undefined);

assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,'musikk_plateartist_stream');
assert.deepEqual(stream.applies_when.any_tags,['musikk:plateartist']);
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
for(const s of stream.storylets){
  assert.equal(s.choices.length,2);
  assert.deepEqual(s.choices.map(c=>c.effect),[1,-1]);
}

const row=audit.positions.find(x=>x.key==='musikk/plateartist');
assert.ok(row);
assert.equal(row.classification,'ready');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(row.authored_depth.livelihood_template_count,0);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.deepEqual(row.evidence.livelihood_templates,[]);

if(fs.existsSync(path.join(ROOT,worldPath))){
  assert.equal(row.role_world_status,'role_world_complete');
  assert.equal(row.role_world_path,worldPath);
  const indexed=index.roles.find(x=>x.life_position_key==='musikk/plateartist');
  assert.ok(indexed);
  assert.equal(indexed.role_scope,'musikk_plateartist');
  const world=read(worldPath);
  assert.equal(world.subject_type,'life_position');
  assert.equal(world.status,'role_world_complete');
  assert.deepEqual(world.life_position_ref,{badge_id:'musikk',id:'plateartist',label:'Plateartist'});
  assert.equal(world.materialization.no_new_runtime,true);
  assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
  assert.equal(world.season.coverage.length,56);
  assert.equal(new Set(world.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
  assert.equal(world.materialization.source_refs.length,14);
  assert.equal(world.primary_threads.length,14);
  assert.equal(world.recurring_people_archetypes.length,6);
  assert.equal(world.private_aftermath.length,5);
  assert.equal(world.delayed_consequences.length,6);
  assert.match(world.sociological_core.description,/Artist/);
  assert.match(world.sociological_core.description,/Utøvende musiker/);
  assert.match(world.sociological_core.description,/Plategraver/);
  assert.match(world.sociological_core.description,/Headliner/);
} else {
  assert.equal(row.role_world_status,'role_world_not_started');
  assert.equal(row.role_world_path,null);
  assert.equal(audit.first_ready?.key,'musikk/plateartist');
}

const serialized=JSON.stringify(stream);
for(const forbidden of ['fixed_salary','career_offer','employer_appointment','booking_status','fame_status']){
  assert.ok(!serialized.includes(forbidden),'Plateartist authored source must not claim '+forbidden);
}
console.log('Plateartist readiness gate ok: ready + '+row.role_world_status);
