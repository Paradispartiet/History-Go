#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const output = execFileSync(process.execPath, [
  path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'),
  '--check'
], { cwd: ROOT, encoding: 'utf8' });

assert.match(output, /PASS: 200 life positions audited/);

const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');

assert.equal(audit.schema, 'civication_life_position_role_world_readiness_v1');
assert.equal(audit.summary.selectable_life_positions, taxonomy.canonical_counts.selectable_life_positions_total);
assert.equal(audit.summary.selectable_life_positions, 200);
assert.equal(audit.summary.classifications.role_world_candidate, 1);
assert.equal(audit.summary.classifications.needs_authored_depth, 159);
assert.equal(audit.summary.classifications.prefer_overlay_context, 40);
assert.equal(audit.summary.livelihood_backed_positions, 14);
assert.equal(audit.summary.positions_with_exact_governed_sources, 1);
assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 1);

assert.equal(audit.first_candidate.key, 'sport/supporter');
assert.equal(audit.first_candidate.classification, 'role_world_candidate');

const supporter = audit.positions.find((row) => row.key === 'sport/supporter');
assert.ok(supporter);
assert.equal(supporter.classification, 'role_world_candidate');
assert.equal(supporter.authored_depth.max_narrative_depth, 5);
assert.deepEqual(supporter.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/football_supporter.json'
]);

for (const row of audit.positions.filter((item) => item.authored_depth.livelihood_template_count > 0)) {
  assert.notEqual(row.classification, 'role_world_candidate',
    `${row.key}: livelihood opportunity alone must not certify Role World readiness`);
}

for (const row of audit.positions.filter((item) => item.classification === 'prefer_overlay_context')) {
  assert.equal(row.semantic_mode, 'overlay_or_outcome_status',
    `${row.key}: overlay/context classification must come from status/outcome semantics`);
}

assert.equal(new Set(audit.positions.map((row) => row.key)).size, 200);
assert.ok(audit.semantics.audit_only_no_new_runtime);
assert.ok(audit.semantics.one_life_position_per_role_world_pr);
assert.ok(audit.semantics.livelihood_opportunity_alone_is_not_role_world_depth);

console.log('civication life-position Role World readiness ok: Supporter first / 1 candidate / 159 authored-depth / 40 overlay-context');
