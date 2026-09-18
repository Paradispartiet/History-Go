#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const badge=read('data/badges/media.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const streamPath='data/Civication/narratives/leisure/media_leser.json';
const worldPath='data/Civication/roleWorlds/media/media_leser.json';
const stream=read(streamPath);

const tier=badge.tiers.find((entry)=>entry.life_position?.id==='leser');
assert.ok(tier);
assert.equal(tier.threshold,5);
assert.equal(tier.life_position.kind,'audience_practice');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);

assert.equal(stream.id,'media_leser_stream');
assert.deepEqual(stream.applies_when.any_tags,['media:leser']);
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
for(const s of stream.storylets){
  assert.equal(s.choices.length,2);
  assert.deepEqual(s.choices.map(c=>c.effect),[1,-1]);
}

const row=audit.positions.find(x=>x.key==='media/leser');
assert.ok(row);
assert.equal(row.classification,'ready');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(row.authored_depth.livelihood_template_count,0);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.deepEqual(row.evidence.livelihood_templates,[]);

const literature=audit.positions.find(x=>x.key==='litteratur/leser');
assert.ok(literature);
assert.ok(!literature.evidence.exact_source_refs.includes(streamPath),'Media Leser must not bind as Litteratur Leser exact evidence');

if(fs.existsSync(path.join(ROOT,worldPath))){
  assert.equal(row.role_world_status,'role_world_complete');
  assert.equal(row.role_world_path,worldPath);
  const indexed=index.roles.find(x=>x.life_position_key==='media/leser');
  assert.ok(indexed);
  assert.equal(indexed.role_scope,'media_leser');
} else {
  assert.equal(row.role_world_status,'role_world_not_started');
  assert.equal(audit.first_ready?.key,'media/leser');
}
const serialized=JSON.stringify(stream);
for(const forbidden of ['fixed_salary','career_offer','editorial_authority']){
  assert.ok(!serialized.includes(forbidden),'Media Leser must not claim '+forbidden);
}
console.log('Media Leser readiness gate ok: ready + '+row.role_world_status);
