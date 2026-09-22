#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));

const catalog=read('data/Civication/lifePositionCatalog.json');
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank=read('data/Civication/roleWorldThemeBank.json');
const policy=read('data/Civication/roleWorldPolicy.json');

const lifeKey='kunst/kunstsamler';
const lifeScope='kunst_kunstsamler';
const streamPath='data/Civication/narratives/leisure/kunst_kunstsamler.json';
const worldPath='data/Civication/roleWorlds/kunst/kunst_kunstsamler.json';

const kunst=(catalog.badges||[]).find(x=>x.badge_id==='kunst');
assert.ok(kunst);
const position=(kunst.positions||[]).find(x=>x.id==='kunstsamler');
assert.ok(position);
assert.equal(position.label,'Kunstsamler');
assert.equal(position.kind,'livelihood_sensitive_status');
assert.match(position.description,/samling over tid|økonomien/i);
assert.deepEqual(position.hooks,['samling','marked','likviditet']);

const stream=read(streamPath);
assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,'kunst_kunstsamler_stream');
assert.deepEqual(stream.applies_when.any_tags,['kunst:kunstsamler']);
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
assert.equal(row.runtime_source,'catalog');
assert.equal(row.semantic_mode,'livelihood_or_ownership_identity');
assert.equal(row.classification,'ready');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.thematic_source_ref_count,6);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.equal(row.authored_depth.livelihood_template_count,0);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.equal(row.evidence.thematic_source_refs.length,6);
for(const other of audit.positions.filter(x=>x.key!==lifeKey)){
  assert.ok(!(other.evidence.exact_source_refs||[]).includes(streamPath),streamPath+' leaked exact into '+other.key);
  assert.ok(!(other.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+other.key);
}

const indexed=index.roles.find(x=>x.life_position_key===lifeKey);
const world=read(worldPath);
assert.ok(indexed);
assert.equal(indexed.role_scope,lifeScope);
assert.equal(indexed.status,'role_world_complete');
assert.deepEqual(indexed.life_position_ref,{badge_id:'kunst',id:'kunstsamler',label:'Kunstsamler'});
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.role_world_path,worldPath);
assert.equal(row.priority_score,380);
assert.ok(!audit.queue.some(x=>x.key===lifeKey));

assert.equal(world.schema,'civication_role_world_v1');
assert.equal(world.subject_type,'life_position');
assert.equal(world.status,'role_world_complete');
assert.deepEqual(world.life_position_ref,{badge_id:'kunst',id:'kunstsamler',label:'Kunstsamler'});
assert.equal(world.materialization.no_new_runtime,true);
assert.match(world.sociological_core.description,/livelihood-sensitive|økonomi|samling/i);
assert.match(world.sociological_core.description,/ikke automatisk Gallerist|kunsthandler|investor|rådgiver/i);
assert.match(world.sociological_core.description,/ingen jobb|ingen lønn|ingen selskapsstatus|ingen ny runtime/i);

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

assert.deepEqual(themeBank.reference_profiles['kunst/kunst_kunstsamler'],world.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));
assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(lifeKey));
assert.equal(taxonomy.canonical_counts.life_position_role_worlds,146);
assert.equal(taxonomy.canonical_counts.total_role_worlds,231);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds,146);

const budget=stream.storylets.find(x=>x.id==='budsjettet_som_ser_lite_ut');
assert.match(budget.situation.join(' '),/likviditetsbelastningen|frie midler|totalsummen/i);
const valuation=stream.storylets.find(x=>x.id==='forsikringen_som_endrer_bildet');
assert.match(valuation.situation.join(' '),/ikke.*tilgjengelig kontant|likvide penger|verdi/i);
const artist=stream.storylets.find(x=>x.id==='kunstneren_som_vet_du_kjoper');
assert.match(artist.situation.join(' '),/økonomisk tyngde|kunstneriske valg|myndighet/i);
const finale=stream.storylets.find(x=>x.id==='sesongslutt_hva_er_kunstsamler');
assert.match(finale.situation.join(' '),/sikker investering|kunstnerisk autoritet|sosial rang/i);

console.log('Kunstsamler authored-depth and Role World gate ok');
