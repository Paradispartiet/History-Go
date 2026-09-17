#!/usr/bin/env node
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(value, null, 2) + '\n');
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const writeText = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), value);
const replaceOnce = (text, from, to, label) => {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, got ${count}`);
  return text.replace(from, to);
};

const worldPath = 'data/Civication/roleWorlds/litteratur/litteratur_leser.json';
const narrativePath = 'data/Civication/narratives/leisure/litteratur_leser.json';
const key = 'litteratur/leser';
const themes = ['professional_culture','status_anxiety','shame_reputation','class_power','public_private_leakage','care_vs_efficiency'];

const index = readJson('data/Civication/roleWorlds/index.json');
if (!index.roles.some((row) => row.life_position_key === key)) {
  index.roles.push({
    category: 'litteratur',
    role_scope: 'litteratur_leser',
    subject_type: 'life_position',
    life_position_ref: { badge_id: 'litteratur', id: 'leser', label: 'Leser' },
    status: 'role_world_complete',
    path: worldPath,
    life_position_key: key
  });
}
index.status = '184_role_worlds_materialized';
index.summary.role_worlds_total = 184;
index.summary.career_role_worlds = 85;
index.summary.life_position_role_worlds = 99;
index.career_role_world_count = 85;
index.life_position_role_world_count = 99;
writeJson('data/Civication/roleWorlds/index.json', index);

const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
taxonomy.canonical_counts.life_position_role_worlds = 99;
taxonomy.canonical_counts.total_role_worlds = 184;
if (!taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes(key)) {
  taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.push(key);
}
writeJson('data/Civication/nonCareerRoleTaxonomy.json', taxonomy);

const policy = readJson('data/Civication/roleWorldPolicy.json');
policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds = 99;
writeJson('data/Civication/roleWorldPolicy.json', policy);

const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
if (!checklist.reference_worlds.includes(worldPath)) checklist.reference_worlds.push(worldPath);
writeJson('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles['litteratur/litteratur_leser'] = themes;
writeJson('data/Civication/roleWorldThemeBank.json', themeBank);

execFileSync(process.execPath, [path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'), '--write'], { cwd: ROOT, stdio: 'inherit' });
const readiness = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
if (readiness.summary.classifications.ready !== 99 || readiness.summary.classifications.needs_authored_depth !== 60 || readiness.summary.life_position_role_world_complete !== 99) {
  throw new Error(`Unexpected readiness summary: ${JSON.stringify(readiness.summary)}`);
}
const reader = readiness.positions.find((row) => row.key === key);
if (!reader || reader.classification !== 'ready' || reader.role_world_status !== 'role_world_complete' || reader.role_world_path !== worldPath || reader.authored_depth.exact_source_ref_count !== 1 || reader.authored_depth.max_narrative_depth !== 14 || !reader.evidence.exact_source_refs.includes(narrativePath)) {
  throw new Error(`Unexpected Leser readiness row: ${JSON.stringify(reader)}`);
}
if ((readiness.queue || []).some((row) => row.key === key)) throw new Error('Leser must leave readiness queue');

let readinessTest = readText('tests/civication-life-position-role-world-readiness.test.js');
readinessTest = replaceOnce(readinessTest, '  ready: 98,\n  needs_authored_depth: 61,', '  ready: 99,\n  needs_authored_depth: 60,', 'readiness classification counts');
readinessTest = replaceOnce(readinessTest, 'assert.equal(audit.summary.completed_life_position_role_worlds, 98);', 'assert.equal(audit.summary.completed_life_position_role_worlds, 99);', 'readiness completed count');
readinessTest = replaceOnce(readinessTest, 'assert.equal(audit.summary.positions_with_exact_governed_sources, 98);', 'assert.equal(audit.summary.positions_with_exact_governed_sources, 99);', 'readiness exact source count');
readinessTest = replaceOnce(readinessTest, 'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 98);', 'assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 99);', 'readiness narrative count');
const forfatterBlock = "const forfatter = audit.positions.find((row) => row.key === 'litteratur/forfatter');\nassert.ok(forfatter);\nassert.equal(forfatter.classification, 'ready');\nassert.equal(forfatter.role_world_status, 'role_world_complete');\nassert.equal(forfatter.role_world_path, 'data/Civication/roleWorlds/litteratur/litteratur_forfatter.json');\nassert.equal(forfatter.authored_depth.exact_source_ref_count, 1);\nassert.equal(forfatter.authored_depth.max_narrative_depth, 14);\nassert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/forfatter'));";
const readerBlock = `${forfatterBlock}\nconst reader = audit.positions.find((row) => row.key === 'litteratur/leser');\nassert.ok(reader);\nassert.equal(reader.classification, 'ready');\nassert.equal(reader.role_world_status, 'role_world_complete');\nassert.equal(reader.role_world_path, 'data/Civication/roleWorlds/litteratur/litteratur_leser.json');\nassert.equal(reader.authored_depth.exact_source_ref_count, 1);\nassert.equal(reader.authored_depth.max_narrative_depth, 14);\nassert.ok(!(audit.queue || []).some((row) => row.key === 'litteratur/leser'));`;
readinessTest = replaceOnce(readinessTest, forfatterBlock, readerBlock, 'readiness Leser assertion block');
readinessTest = replaceOnce(readinessTest, "console.log('civication life-position Role World readiness v2 ok: 98 ready / 61 authored-depth / 40 not-standalone; 98 complete / no pending-ready');", "console.log('civication life-position Role World readiness v2 ok: 99 ready / 60 authored-depth / 40 not-standalone; 99 complete / no pending-ready');", 'readiness console summary');
writeText('tests/civication-life-position-role-world-readiness.test.js', readinessTest);

let taxonomyTest = readText('tests/civication-noncareer-role-taxonomy.test.js');
taxonomyTest = replaceOnce(taxonomyTest, "assert.equal(roleWorldIndex.roles.length, 183, 'Role World-indeksen skal ha 85 karriereverdener + 98 life-position worlds');", "assert.equal(roleWorldIndex.roles.length, 184, 'Role World-indeksen skal ha 85 karriereverdener + 99 life-position worlds');", 'taxonomy total count');
taxonomyTest = replaceOnce(taxonomyTest, "assert.equal(lifePositionWorlds.length, 98, '98 canonical life-position worlds skal være materialisert, inkludert Forfatter');", "assert.equal(lifePositionWorlds.length, 99, '99 canonical life-position worlds skal være materialisert, inkludert Leser');", 'taxonomy life count');
const forfatterAssertions = "assert.deepEqual(lifeWorldByKey.get('litteratur/forfatter').life_position_ref, { badge_id: 'litteratur', id: 'forfatter', label: 'Forfatter' });\nassert.equal(lifeWorldByKey.get('litteratur/forfatter').role_scope, 'litteratur_forfatter');";
const readerAssertions = `${forfatterAssertions}\nassert.deepEqual(lifeWorldByKey.get('litteratur/leser').life_position_ref, { badge_id: 'litteratur', id: 'leser', label: 'Leser' });\nassert.equal(lifeWorldByKey.get('litteratur/leser').role_scope, 'litteratur_leser');`;
taxonomyTest = replaceOnce(taxonomyTest, forfatterAssertions, readerAssertions, 'taxonomy Leser assertions');
taxonomyTest = replaceOnce(taxonomyTest, "assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 183, career_role_worlds: 85, life_position_role_worlds: 98 });", "assert.deepEqual(roleWorldIndex.summary, { role_worlds_total: 184, career_role_worlds: 85, life_position_role_worlds: 99 });", 'taxonomy summary');
taxonomyTest = replaceOnce(taxonomyTest, '  life_position_role_worlds: 98,\n  total_role_worlds: 183,', '  life_position_role_worlds: 99,\n  total_role_worlds: 184,', 'taxonomy expected counts');
taxonomyTest = replaceOnce(taxonomyTest, "console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 98 life-position worlds / layers remain separate');", "console.log('civication non-career role taxonomy ok: 199 selectable life positions / 85 career Role Worlds + 99 life-position worlds / layers remain separate');", 'taxonomy console summary');
writeText('tests/civication-noncareer-role-taxonomy.test.js', taxonomyTest);

let contractTest = readText('tests/civication-role-world-contract.test.js');
contractTest = replaceOnce(contractTest, 'assert.equal(index.life_position_role_world_count, 98);\nassert.equal(index.roles.length, 183);', 'assert.equal(index.life_position_role_world_count, 99);\nassert.equal(index.roles.length, 184);', 'role world contract counts');
writeText('tests/civication-role-world-contract.test.js', contractTest);

console.log('DIAGNOSTIC ONLY — do not merge this head. Generated Leser governance artifact at 184 total / 99 life-position worlds.');
