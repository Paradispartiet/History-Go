#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(value, null, 2) + '\n');
const worldPath = 'data/Civication/roleWorlds/naeringsliv/naeringsliv_industrieier.json';
const streamPath = 'data/Civication/narratives/leisure/naeringsliv_industrieier.json';
const lifeKey = 'naeringsliv/industrieier';
const roleScope = 'naeringsliv_industrieier';
const world = readJson(worldPath);
const stream = readJson(streamPath);

if (world.life_position_ref?.id !== 'industrieier' || stream.id !== 'naeringsliv_industrieier_stream') {
  throw new Error('Industrieier source/world identity mismatch');
}
if (stream.storylets?.length !== 14 || world.season?.coverage?.length !== 56) {
  throw new Error('Industrieier authored depth is incomplete');
}

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = readJson(indexPath);
if (!index.roles.some((x) => x.life_position_key === lifeKey)) {
  index.roles.push({
    category: 'naeringsliv',
    role_scope: roleScope,
    subject_type: 'life_position',
    life_position_key: lifeKey,
    life_position_ref: { badge_id: 'naeringsliv', id: 'industrieier', label: 'Industrieier' },
    status: 'role_world_complete',
    path: worldPath
  });
}
index.status = '238_role_worlds_materialized';
index.summary.role_worlds_total = 238;
index.summary.career_role_worlds = 85;
index.summary.life_position_role_worlds = 153;
index.career_role_world_count = 85;
index.life_position_role_world_count = 153;
writeJson(indexPath, index);

const taxonomyPath = 'data/Civication/nonCareerRoleTaxonomy.json';
const taxonomy = readJson(taxonomyPath);
taxonomy.canonical_counts.life_position_role_worlds = 153;
taxonomy.canonical_counts.total_role_worlds = 238;
const completed = taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds;
if (!completed.includes(lifeKey)) completed.push(lifeKey);
writeJson(taxonomyPath, taxonomy);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = readJson(checklistPath);
if (!checklist.reference_worlds.includes(worldPath)) checklist.reference_worlds.push(worldPath);
writeJson(checklistPath, checklist);

const themeBankPath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = readJson(themeBankPath);
themeBank.reference_profiles[roleScope.replace('_industrieier', '/naeringsliv_industrieier')] = world.theme_ids;
// The governed key format is category/role_scope.
delete themeBank.reference_profiles['naeringsliv/naeringsliv_industrieier'];
themeBank.reference_profiles['naeringsliv/naeringsliv_industrieier'] = world.theme_ids;
writeJson(themeBankPath, themeBank);

const policyPath = 'data/Civication/roleWorldPolicy.json';
const policy = readJson(policyPath);
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds = 153;
writeJson(policyPath, policy);

// Keep permanent count sentinels synchronized without broad semantic rewrites.
const testsDir = path.join(ROOT, 'tests');
for (const name of fs.readdirSync(testsDir)) {
  if (!name.endsWith('.test.js')) continue;
  const full = path.join(testsDir, name);
  let text = fs.readFileSync(full, 'utf8');
  const before = text;
  text = text
    .replaceAll('canonical_counts.life_position_role_worlds,152', 'canonical_counts.life_position_role_worlds,153')
    .replaceAll('canonical_counts.life_position_role_worlds, 152', 'canonical_counts.life_position_role_worlds, 153')
    .replaceAll('canonical_counts.total_role_worlds,237', 'canonical_counts.total_role_worlds,238')
    .replaceAll('canonical_counts.total_role_worlds, 237', 'canonical_counts.total_role_worlds, 238')
    .replaceAll('completed_life_position_role_worlds,152', 'completed_life_position_role_worlds,153')
    .replaceAll('completed_life_position_role_worlds, 152', 'completed_life_position_role_worlds, 153')
    .replaceAll('index.life_position_role_world_count, 152', 'index.life_position_role_world_count, 153')
    .replaceAll('index.roles.length, 237', 'index.roles.length, 238')
    .replaceAll("assert.equal(audit.queue[0].key,'naeringsliv/industrieier');", "assert.equal(audit.queue[0].key,'naeringsliv/investor');");
  if (name === 'civication-noncareer-role-taxonomy.test.js') {
    text = text
      .replace("assert.equal(roleWorldIndex.roles.length, 237, 'Role World-indeksen skal ha 85 karriereverdener + 152 life-position worlds');", "assert.equal(roleWorldIndex.roles.length, 238, 'Role World-indeksen skal ha 85 karriereverdener + 153 life-position worlds');")
      .replace("assert.equal(lifePositionWorlds.length, 152, '152 canonical life-position worlds skal være materialisert, nå også Næringsliv Gründer som egen employment-independent entrepreneurial practice and self-employment');", "assert.equal(lifePositionWorlds.length, 153, '153 canonical life-position worlds skal være materialisert, nå også Næringsliv Industrieier som egen employment-independent industrial ownership');")
      .replace("assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 237, career_role_worlds: 85, life_position_role_worlds: 152 });", "assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 238, career_role_worlds: 85, life_position_role_worlds: 153 });")
      .replace('  life_position_role_worlds: 152,\n  total_role_worlds: 237,', '  life_position_role_worlds: 153,\n  total_role_worlds: 238,')
      .replace("console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 152 life-position worlds / layers remain separate');", "console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 153 life-position worlds / layers remain separate');");
    const anchor = "assert.equal(lifeWorldByKey.get('naeringsliv/grunder').role_scope, 'naeringsliv_grunder');";
    const addition = "\nassert.deepEqual(lifeWorldByKey.get('naeringsliv/industrieier').life_position_ref, { badge_id: 'naeringsliv', id: 'industrieier', label: 'Industrieier' });\nassert.equal(lifeWorldByKey.get('naeringsliv/industrieier').role_scope, 'naeringsliv_industrieier');";
    if (!text.includes("lifeWorldByKey.get('naeringsliv/industrieier')")) text = text.replace(anchor, anchor + addition);
  }
  if (text !== before) fs.writeFileSync(full, text);
}

const industrieierTest = `#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const audit=read('data/Civication/lifePositionRoleWorldReadiness.json');
const index=read('data/Civication/roleWorlds/index.json');
const taxonomy=read('data/Civication/nonCareerRoleTaxonomy.json');
const checklist=read('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank=read('data/Civication/roleWorldThemeBank.json');
const policy=read('data/Civication/roleWorldPolicy.json');
const contracts=read('data/Civication/badgeCareerContracts/naeringsliv.json');
const lifeKey='naeringsliv/industrieier';
const lifeScope='naeringsliv_industrieier';
const streamPath='data/Civication/narratives/leisure/naeringsliv_industrieier.json';
const worldPath='data/Civication/roleWorlds/naeringsliv/naeringsliv_industrieier.json';
const tier=contracts.tiers.find(x=>x.life_position?.id==='industrieier');
assert.ok(tier);
assert.equal(tier.label,'Industrieier');
assert.equal(tier.life_position.kind,'industrial_ownership');
assert.equal(tier.life_position.employment_independent,true);
assert.equal(tier.career_offer,undefined);
const stream=read(streamPath);
assert.equal(stream.schema,'civication_narrative_stream_v1');
assert.equal(stream.id,'naeringsliv_industrieier_stream');
assert.deepEqual(stream.applies_when.any_tags,['naeringsliv:industrieier']);
assert.deepEqual(read('data/Civication/narratives/manifest.json').streams.filter(x=>x.id===stream.id),[{id:stream.id,path:streamPath}]);
assert.equal(stream.storylets.length,14);
assert.equal(new Set(stream.storylets.map(x=>x.id)).size,14);
for(const s of stream.storylets){ assert.ok(s.situation.length>=3); assert.equal(s.choices.length,2); assert.deepEqual(s.choices.map(c=>c.effect),[1,-1]); assert.ok(s.choices.every(c=>c.tags.length>=2)); }
const row=audit.positions.find(x=>x.key===lifeKey);
assert.ok(row);
assert.equal(row.runtime_source,'badge_tier');
assert.equal(row.semantic_mode,'livelihood_or_ownership_identity');
assert.equal(row.classification,'ready');
assert.equal(row.authored_depth.exact_source_ref_count,1);
assert.equal(row.authored_depth.thematic_source_ref_count,0);
assert.equal(row.authored_depth.max_narrative_depth,14);
assert.deepEqual(row.evidence.exact_source_refs,[streamPath]);
assert.deepEqual(row.evidence.thematic_source_refs,[]);
for(const other of audit.positions.filter(x=>x.key!==lifeKey)){ assert.ok(!(other.evidence.exact_source_refs||[]).includes(streamPath),streamPath+' leaked exact into '+other.key); assert.ok(!(other.evidence.thematic_source_refs||[]).includes(streamPath),streamPath+' leaked thematic into '+other.key); }
const indexed=index.roles.find(x=>x.life_position_key===lifeKey);
const rw=read(worldPath);
assert.ok(indexed);
assert.equal(indexed.role_scope,lifeScope);
assert.equal(indexed.status,'role_world_complete');
assert.deepEqual(indexed.life_position_ref,{badge_id:'naeringsliv',id:'industrieier',label:'Industrieier'});
assert.equal(row.role_world_status,'role_world_complete');
assert.equal(row.role_world_path,worldPath);
assert.equal(row.priority_score,365);
assert.ok(!audit.queue.some(x=>x.key===lifeKey));
assert.equal(audit.queue[0].key,'naeringsliv/investor');
assert.equal(rw.schema,'civication_role_world_v1');
assert.equal(rw.subject_type,'life_position');
assert.equal(rw.status,'role_world_complete');
assert.deepEqual(rw.life_position_ref,{badge_id:'naeringsliv',id:'industrieier',label:'Industrieier'});
assert.equal(rw.materialization.no_new_runtime,true);
assert.match(rw.sociological_core.description,/industrial_ownership|produksjonsmidler|kapitalbinding/i);
assert.match(rw.sociological_core.description,/Bedriftseier|Investor|Industribygger|Daglig leder|Produksjonsleder/i);
assert.match(rw.sociological_core.description,/ingen automatisk operativ instruksjonsmyndighet|fagansvar|styrelederstatus/i);
assert.match(rw.sociological_core.description,/Ingen ny runtime/i);
assert.equal(rw.season.days,14);
assert.deepEqual(rw.season.day_phases,['morning','lunch','afternoon','evening']);
assert.equal(rw.season.coverage.length,56);
assert.equal(new Set(rw.season.coverage.map(x=>x.day+'/'+x.phase)).size,56);
assert.equal(new Set(rw.season.coverage.map(x=>x.summary)).size,56);
assert.deepEqual([...new Set(rw.season.coverage.filter(x=>x.phase==='evening').map(x=>x.beat_type))],['private_consequence']);
assert.equal(rw.primary_threads.length,14);
assert.ok(rw.primary_threads.every(x=>x.beat_refs.length===5));
assert.ok(rw.primary_threads.every(x=>new Set(x.beat_refs.map(ref=>Number(ref.split('/')[0]))).size>=3));
assert.equal(rw.recurring_people_archetypes.length,6);
assert.equal(rw.private_aftermath.length,5);
assert.equal(rw.delayed_consequences.length,6);
assert.ok(rw.delayed_consequences.every(x=>Number(x.return_ref.split('/')[0])>Number(x.setup_ref.split('/')[0])));
assert.equal(rw.materialization.source_refs.length,14);
assert.equal(new Set(rw.materialization.source_refs).size,14);
for(const ref of rw.materialization.source_refs) assert.ok(ref.startsWith(streamPath+'#'));
assert.deepEqual(themeBank.reference_profiles['naeringsliv/naeringsliv_industrieier'],rw.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));
assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(lifeKey));
assert.equal(taxonomy.canonical_counts.life_position_role_worlds,153);
assert.equal(taxonomy.canonical_counts.total_role_worlds,238);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds,153);
assert.match(stream.storylets.find(x=>x.id==='produksjonslinjen_som_ma_fornyes').situation.join(' '),/produksjonslinje|kapitalbinding|levetid/i);
assert.match(stream.storylets.find(x=>x.id==='panten_som_legges_i_maskinene').situation.join(' '),/sikkerhet|maskiner|anlegg|risiko/i);
assert.match(stream.storylets.find(x=>x.id==='anlegget_som_kanskje_ma_stenges').situation.join(' '),/anlegg|avvikling|kapital/i);
assert.match(stream.storylets.find(x=>x.id==='sesongslutt_hva_er_en_industrieier').situation.join(' '),/Bedriftseier|Investor|Industribygger|Daglig leder|Produksjonsleder/i);
assert.equal(new Set(stream.storylets.flatMap(s=>s.choices.map(c=>c.feedback))).size,28);
assert.ok(rw.primary_threads.every(t=>typeof t.relationship==='string' && t.relationship.length>0 && !('description' in t)));
const allowedDomains=new Set(['job','relationship','psyche','livelihood','economy','housing','reputation','narrative']);
assert.ok(rw.delayed_consequences.every(c=>c.domains.every(d=>allowedDomains.has(d))));
console.log('Næringsliv Industrieier authored-depth and Role World gate ok');
`;
fs.writeFileSync(path.join(ROOT, 'tests/civication-naeringsliv-industrieier-authored-depth.test.js'), industrieierTest);

execFileSync(process.execPath, [path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'), '--write'], { stdio: 'inherit' });
console.log('Industrieier governance materialized; readiness outputs regenerated.');
