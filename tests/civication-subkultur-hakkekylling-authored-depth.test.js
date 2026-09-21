#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));

const badge=read('data/badges/subkultur.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank=read('data/Civication/roleWorldThemeBank.json');
const policy=read('data/Civication/roleWorldPolicy.json');

const lifeKey='subkultur/hakkekylling';
const lifeScope='subkultur_hakkekylling';
const streamPath='data/Civication/narratives/leisure/subkultur_hakkekylling.json';
const worldPath='data/Civication/roleWorlds/subkultur/subkultur_hakkekylling.json';

const tier=badge.tiers.find(x=>x.label==='Hakkekylling');
assert.ok(tier);
assert.equal(tier.life_position.kind,'subculture_status');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
assert.equal(tier.career_unlock.title,'Produksjonsassistent');
assert.equal(tier.career_unlock.policy,'direct');
assert.equal(tier.career_unlock.role_scope,'subkultur_arrangementsdrift');

const stream=read(streamPath);
assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,'subkultur_hakkekylling_stream');
assert.deepEqual(stream.applies_when.any_tags,['subkultur:hakkekylling']);
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
for(const s of stream.storylets){
  assert.ok(s.situation.length>=3);
  assert.equal(s.choices.length,2);
  assert.deepEqual(s.choices.map(c=>c.effect),[1,-1]);
  assert.ok(s.choices.every(c=>c.tags.length>=2));
  assert.ok(s.choices.every(c=>new Set(c.tags).size===c.tags.length));
}

const row=audit.positions.find(x=>x.key===lifeKey);
assert.ok(row);
assert.equal(row.classification,'ready');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.thematic_source_ref_count,0);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(row.authored_depth.livelihood_template_count,0);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.deepEqual(row.evidence.thematic_source_refs,[]);
for(const other of audit.positions.filter(x=>x.key!==lifeKey)){
  assert.ok(!(other.evidence.exact_source_refs||[]).includes(streamPath),streamPath+' leaked exact into '+other.key);
  assert.ok(!(other.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+other.key);
}

const indexed=index.roles.find(x=>x.life_position_key===lifeKey);
const world=read(worldPath);
assert.ok(indexed);
assert.equal(indexed.role_scope,lifeScope);
assert.equal(indexed.status,'role_world_complete');
assert.deepEqual(indexed.life_position_ref,{badge_id:'subkultur',id:null,label:'Hakkekylling'});
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.role_world_path,worldPath);
assert.ok(!audit.queue.some(x=>x.key===lifeKey));

assert.equal(world.schema,'civication_role_world_v1');
assert.equal(world.subject_type,'life_position');
assert.equal(world.status,'role_world_complete');
assert.deepEqual(world.life_position_ref,{badge_id:'subkultur',id:null,label:'Hakkekylling'});
assert.equal(world.materialization.no_new_runtime,true);
assert.match(world.sociological_core.description,/employment-independent|Produksjonsassistent|Career-laget/i);
assert.match(world.sociological_core.description,/ikke en plikt til å tåle mobbing|ikke en permanent identitet|ikke automatisk jobb/i);

assert.equal(world.season.days,14);
assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length,56);
const coverage=new Set(world.season.coverage.map(x=>x.day+'/'+x.phase));
assert.equal(coverage.size,56);
assert.deepEqual([...new Set(world.season.coverage.filter(x=>x.phase==='evening').map(x=>x.beat_type))],['private_consequence']);
assert.equal(world.primary_threads.length,14);
assert.ok(world.primary_threads.every(x=>x.beat_refs.length===5));
assert.ok(world.primary_threads.every(x=>new Set(x.beat_refs.map(ref=>Number(ref.split('/')[0]))).size>=3));
assert.equal(world.recurring_people_archetypes.length,6);
assert.equal(world.private_aftermath.length,5);
assert.equal(world.delayed_consequences.length,6);
assert.ok(world.delayed_consequences.every(x=>Number(x.return_ref.split('/')[0])>Number(x.setup_ref.split('/')[0])));
assert.equal(world.materialization.source_refs.length,14);
assert.equal(new Set(world.materialization.source_refs).size,14);
for(const ref of world.materialization.source_refs) assert.ok(ref.startsWith(streamPath+'#'));

assert.deepEqual(themeBank.reference_profiles['subkultur/subkultur_hakkekylling'],world.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));
assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(lifeKey));
assert.equal(taxonomy.canonical_counts.life_position_role_worlds,142);
assert.equal(taxonomy.canonical_counts.total_role_worlds,227);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds,142);

const hazing=stream.storylets.find(x=>x.id==='henteoppgaven_som_ikke_finnes');
assert.match(hazing.situation.join(' '),/sannsynligvis ikke finnes|innvielsesvits|konstruert umulighet/i);
const next=stream.storylets.find(x=>x.id==='den_nye_som_kommer_etter_deg');
assert.match(next.situation.join(' '),/ny person|havner under deg|sende kostnaden nedover/i);
const finale=stream.storylets.find(x=>x.id==='sesongslutt_hva_er_hakkekylling');
assert.match(finale.situation.join(' '),/sosial erfaring|ikke en plikt|permanent identitet|frikort/i);

console.log('Subkultur Hakkekylling authored-depth and Role World gate ok');
