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
const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank=read('data/Civication/roleWorldThemeBank.json');
const policy=read('data/Civication/roleWorldPolicy.json');

const lifeKey='musikk/artist';
const lifeScope='musikk_artist';
const streamPath='data/Civication/narratives/leisure/musikk_artist.json';
const worldPath='data/Civication/roleWorlds/musikk/musikk_artist.json';

const tier=badge.tiers.find(x=>x.life_position?.id==='artist');
assert.ok(tier);
assert.equal(tier.label,'Artist');
assert.equal(tier.threshold,190);
assert.equal(tier.life_position.kind,'artistic_identity_and_livelihood');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
assert.equal(tier.career_unlock,undefined);

const stream=read(streamPath);
assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,'musikk_artist_stream');
assert.deepEqual(stream.applies_when.any_tags,['musikk:artist']);
assert.deepEqual(read('data/Civication/narratives/manifest.json').streams.filter(x=>x.id===stream.id),[{id:stream.id,path:streamPath}]);
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
assert.equal(row.runtime_source,'badge_tier');
assert.equal(row.semantic_mode,'livelihood_or_ownership_identity');
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
assert.deepEqual(indexed.life_position_ref,{badge_id:'musikk',id:'artist',label:'Artist'});
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.role_world_path,worldPath);
assert.equal(row.priority_score,365);
assert.ok(!audit.queue.some(x=>x.key===lifeKey));
assert.equal(audit.queue[0].key,'musikk/frilansmusiker');

assert.equal(world.schema,'civication_role_world_v1');
assert.equal(world.subject_type,'life_position');
assert.equal(world.status,'role_world_complete');
assert.deepEqual(world.life_position_ref,{badge_id:'musikk',id:'artist',label:'Artist'});
assert.equal(world.materialization.no_new_runtime,true);
assert.match(world.sociological_core.description,/employment-independent artistic_identity_and_livelihood|artistnavn|prosjektpremiss/i);
assert.match(world.sociological_core.description,/Plateartist|Solist|Utøvende musiker|Frilansmusiker/i);
assert.match(world.sociological_core.description,/ingen automatisk arbeidsgiver|fast lønn|bookingmakt/i);
assert.match(world.sociological_core.description,/Ingen ny runtime/i);

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

assert.deepEqual(themeBank.reference_profiles['musikk/musikk_artist'],world.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));
assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(lifeKey));
assert.equal(taxonomy.canonical_counts.life_position_role_worlds,149);
assert.equal(taxonomy.canonical_counts.total_role_worlds,234);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds,149);

const commission=stream.storylets.find(x=>x.id==='bestillingen_som_vil_kjope_uttrykket');
assert.match(commission.situation.join(' '),/betaling|kunstnerisk identitet|bestillingen/i);
const budget=stream.storylets.find(x=>x.id==='budsjettet_som_ikke_er_kunstnerisk');
assert.match(budget.situation.join(' '),/kostnad|prosjektøkonomi|risiko/i);
const employment=stream.storylets.find(x=>x.id==='nar_artistrollen_blir_tatt_for_en_job');
assert.match(employment.situation.join(' '),/employment-independent artistic_identity_and_livelihood|arbeidsgiver|fast lønn/i);
const finale=stream.storylets.find(x=>x.id==='sesongslutt_hva_er_en_artist');
assert.match(finale.situation.join(' '),/Utøvende musiker|Solist|Plateartist|Frilansmusiker/i);

assert.equal(new Set(stream.storylets.flatMap(s=>s.choices.map(c=>c.feedback))).size,28);
assert.equal(new Set(world.season.coverage.map(b=>b.summary)).size,56);
assert.ok(world.primary_threads.every(t=>typeof t.relationship==='string' && t.relationship.length>0 && !('description' in t)));
const allowedDomains=new Set(['job','relationship','psyche','livelihood','economy','housing','reputation','narrative']);
assert.ok(world.delayed_consequences.every(c=>c.domains.every(d=>allowedDomains.has(d))));
console.log('Musikk Artist authored-depth and Role World gate ok');
