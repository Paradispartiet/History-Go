#!/usr/bin/env node
import fs from 'node:fs';
import cp from 'node:child_process';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const replace=(p,a,b)=>{const s=fs.readFileSync(p,'utf8');if(!s.includes(a))throw new Error(`${p}: missing ${a}`);fs.writeFileSync(p,s.replace(a,b));};
const worldPath='data/Civication/roleWorlds/litteratur/litteratur_aktiv_leser.json';
const key='litteratur/aktiv_leser';

const index=read('data/Civication/roleWorlds/index.json');
if(!index.roles.some(x=>x.life_position_key===key)) index.roles.push({category:'litteratur',role_scope:'litteratur_aktiv_leser',subject_type:'life_position',life_position_ref:{badge_id:'litteratur',id:'aktiv_leser',label:'Aktiv leser'},status:'role_world_complete',path:worldPath,life_position_key:key});
index.status='179_role_worlds_materialized';
index.summary.role_worlds_total=179;index.summary.career_role_worlds=85;index.summary.life_position_role_worlds=94;
index.career_role_world_count=85;index.life_position_role_world_count=94;write('data/Civication/roleWorlds/index.json',index);

const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
if(!checklist.reference_worlds.includes(worldPath)) checklist.reference_worlds.push(worldPath);write('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
taxonomy.canonical_counts.life_position_role_worlds=94;taxonomy.canonical_counts.total_role_worlds=179;
if(!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(key)) taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push(key);
write('data/Civication/nonCareerRoleTaxonomy.json',taxonomy);

const policy=read('data/Civication/roleWorldPolicy.json');
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds=94;write('data/Civication/roleWorldPolicy.json',policy);

const themes=read('data/Civication/roleWorldThemeBank.json');
themes.reference_profiles['litteratur/litteratur_aktiv_leser']=['professional_culture','status_anxiety','shame_reputation','class_power','public_private_leakage','care_vs_efficiency'];write('data/Civication/roleWorldThemeBank.json',themes);

cp.execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{stdio:'inherit'});
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
if(audit.summary.classifications.ready!==94||audit.summary.classifications.needs_authored_depth!==65||audit.summary.classifications.not_a_standalone_world!==40) throw new Error('unexpected readiness classification after Aktiv leser generation: '+JSON.stringify(audit.summary.classifications));
if(audit.summary.completed_life_position_role_worlds!==94||audit.first_ready!==null||audit.summary.pending_ready_positions!==0) throw new Error('unexpected readiness lifecycle after Aktiv leser generation');
const row=audit.positions.find(x=>x.key===key);if(!row||row.classification!=='ready'||row.role_world_status!=='role_world_complete'||row.authored_depth.exact_source_ref_count!==1||row.authored_depth.max_narrative_depth!==14) throw new Error('Aktiv leser readiness row mismatch');

replace('tests/civication-role-world-contract.test.js',"assert.equal(index.life_position_role_world_count, 93);\nassert.equal(index.roles.length, 178);","assert.equal(index.life_position_role_world_count, 94);\nassert.equal(index.roles.length, 179);");

let nt=fs.readFileSync('tests/civication-noncareer-role-taxonomy.test.js','utf8');
nt=nt.replace("assert.equal(roleWorldIndex.roles.length, 178, 'Role World-indeksen skal ha 85 karriereverdener + 93 life-position worlds');","assert.equal(roleWorldIndex.roles.length, 179, 'Role World-indeksen skal ha 85 karriereverdener + 94 life-position worlds');")
.replace("assert.equal(lifePositionWorlds.length, 93, '93 canonical life-position worlds skal være materialisert, inkludert Gallerist');","assert.equal(lifePositionWorlds.length, 94, '94 canonical life-position worlds skal være materialisert, inkludert Aktiv leser');")
.replace("assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 178, career_role_worlds: 85, life_position_role_worlds: 93 });","assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 179, career_role_worlds: 85, life_position_role_worlds: 94 });")
.replace("  life_position_role_worlds: 93,\n  total_role_worlds: 178,","  life_position_role_worlds: 94,\n  total_role_worlds: 179,")
.replace("85 career Role Worlds + 93 life-position worlds / layers remain separate","85 career Role Worlds + 94 life-position worlds / layers remain separate");
const ntAnchor="assert.equal(lifeWorldByKey.get('kunst/gallerist').role_scope, 'kunst_gallerist');";
if(!nt.includes("lifeWorldByKey.get('litteratur/aktiv_leser')")) nt=nt.replace(ntAnchor,ntAnchor+"\nassert.deepEqual(lifeWorldByKey.get('litteratur/aktiv_leser').life_position_ref, { badge_id: 'litteratur', id: 'aktiv_leser', label: 'Aktiv leser' });\nassert.equal(lifeWorldByKey.get('litteratur/aktiv_leser').role_scope, 'litteratur_aktiv_leser');");
fs.writeFileSync('tests/civication-noncareer-role-taxonomy.test.js',nt);

let rt=fs.readFileSync('tests/civication-life-position-role-world-readiness.test.js','utf8');
rt=rt.replace("  ready: 93,\n  needs_authored_depth: 66,","  ready: 94,\n  needs_authored_depth: 65,")
.replace('assert.equal(audit.summary.completed_life_position_role_worlds, 93);','assert.equal(audit.summary.completed_life_position_role_worlds, 94);')
.replace('assert.equal(audit.summary.positions_with_exact_governed_sources, 93);','assert.equal(audit.summary.positions_with_exact_governed_sources, 94);')
.replace('assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 93);','assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 94);')
.replace('93 ready / 66 authored-depth / 40 not-standalone; 93 complete / no pending-ready','94 ready / 65 authored-depth / 40 not-standalone; 94 complete / no pending-ready');
const rtAnchor="assert.ok(!(audit.queue || []).some((row) => row.key === 'kunst/gallerist'));";
if(!rt.includes("const aktivLeser =")) rt=rt.replace(rtAnchor,rtAnchor+"\nconst aktivLeser = audit.positions.find((row) => row.key === 'litteratur/aktiv_leser');\nassert.ok(aktivLeser);\nassert.equal(aktivLeser.classification, 'ready');\nassert.equal(aktivLeser.role_world_status, 'role_world_complete');\nassert.equal(aktivLeser.role_world_path, 'data/Civication/roleWorlds/litteratur/litteratur_aktiv_leser.json');\nassert.equal(aktivLeser.authored_depth.exact_source_ref_count, 1);\nassert.equal(aktivLeser.authored_depth.max_narrative_depth, 14);\nassert.deepEqual(aktivLeser.evidence.exact_source_refs, ['data/Civication/narratives/leisure/litteratur_aktiv_leser.json']);\nassert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/aktiv_leser'));");
fs.writeFileSync('tests/civication-life-position-role-world-readiness.test.js',rt);

console.log('Aktiv leser canonical sync complete:',JSON.stringify({worlds:index.roles.length,life:index.life_position_role_world_count,ready:audit.summary.classifications.ready,needs:audit.summary.classifications.needs_authored_depth}));
