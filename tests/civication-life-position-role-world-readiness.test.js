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

assert.match(output, /PASS: 199 life positions audited/);

const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(audit.schema, 'civication_life_position_role_world_readiness_v2');
assert.equal(audit.version, 2);
assert.equal(audit.summary.selectable_life_positions, taxonomy.canonical_counts.selectable_life_positions_total);
assert.equal(audit.summary.selectable_life_positions, 199);
assert.deepEqual(audit.summary.classifications, {
  ready: 11,
  needs_authored_depth: 148,
  not_a_standalone_world: 40
});
assert.equal(audit.summary.completed_life_position_role_worlds, 10);
assert.equal(audit.summary.pending_ready_positions, 1);
assert.equal(audit.summary.livelihood_backed_positions, 14);
assert.equal(audit.summary.positions_with_exact_governed_sources, 11);
assert.equal(audit.summary.positions_with_multi_scene_narrative_foundation, 11);
assert.equal(audit.first_ready?.key, 'by/byflanor');

assert.deepEqual(policy.noncareer_subject_boundary.life_position_readiness.classifications, [
  'ready',
  'needs_authored_depth',
  'not_a_standalone_world'
]);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.lifecycle_field, 'role_world_status');

const nabolagskjenner = audit.positions.find((row) => row.key === 'by/nabolagskjenner');
assert.ok(nabolagskjenner);
assert.equal(nabolagskjenner.classification, 'ready');
assert.equal(nabolagskjenner.role_world_status, 'role_world_complete');
assert.equal(nabolagskjenner.role_world_path, 'data/Civication/roleWorlds/by/by_nabolagskjenner.json');
assert.equal(nabolagskjenner.authored_depth.max_narrative_depth, 14);
assert.deepEqual(nabolagskjenner.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/nabolagskjenner.json'
]);

const filmklubbmenneske = audit.positions.find((row) => row.key === 'film_tv/filmklubbmenneske');
assert.ok(filmklubbmenneske);
assert.equal(filmklubbmenneske.classification, 'ready');
assert.equal(filmklubbmenneske.role_world_status, 'role_world_complete');
assert.equal(filmklubbmenneske.role_world_path, 'data/Civication/roleWorlds/film_tv/film_tv_filmklubbmenneske.json');
assert.equal(filmklubbmenneske.authored_depth.max_narrative_depth, 14);

const sofafilosof = audit.positions.find((row) => row.key === 'filosofi/sofafilosof');
assert.ok(sofafilosof);
assert.equal(sofafilosof.classification, 'ready');
assert.equal(sofafilosof.role_world_status, 'role_world_complete');
assert.equal(sofafilosof.role_world_path, 'data/Civication/roleWorlds/filosofi/filosofi_sofafilosof.json');
assert.equal(sofafilosof.authored_depth.max_narrative_depth, 14);
assert.deepEqual(sofafilosof.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/sofafilosof.json'
]);

const genericKjenner = audit.positions.find((row) => row.key === 'film_tv/kjenner');
assert.ok(genericKjenner);
assert.equal(genericKjenner.classification, 'needs_authored_depth');
assert.equal(genericKjenner.authored_depth.exact_source_ref_count, 0,
  'generic Kjenner must not match the substring inside Nabolagskjenner');
assert.equal(genericKjenner.authored_depth.max_narrative_depth, 0);

const supporter = audit.positions.find((row) => row.key === 'sport/supporter');
assert.ok(supporter);
assert.equal(supporter.classification, 'ready');
assert.equal(supporter.role_world_status, 'role_world_complete');
assert.equal(supporter.authored_depth.max_narrative_depth, 14);
assert.deepEqual(supporter.evidence.exact_source_refs, [
  'data/Civication/narratives/leisure/football_supporter.json'
]);

for (const row of audit.positions.filter((item) => item.authored_depth.livelihood_template_count > 0 && item.authored_depth.max_narrative_depth < 4)) {
  assert.notEqual(row.classification, 'ready',
    `${row.key}: livelihood opportunity alone must not certify Role World readiness`);
}

for (const row of audit.positions.filter((item) => item.classification === 'not_a_standalone_world')) {
  assert.equal(row.semantic_mode, 'overlay_or_outcome_status',
    `${row.key}: non-standalone classification must come from status/outcome semantics`);
}

for (const row of audit.positions.filter((item) => item.classification === 'ready')) {
  assert.ok(row.authored_depth.max_narrative_depth >= 4, `${row.key}: ready requires multi-scene depth`);
  assert.ok(row.authored_depth.exact_source_ref_count >= 1, `${row.key}: ready requires exact governed provenance`);
}

assert.ok(!(audit.queue || []).some((row) => ['sport/supporter','by/nabolagskjenner','film_tv/filmklubbmenneske'].includes(row.key)),
  'completed life-position worlds must leave the readiness queue');
assert.ok((audit.queue || []).every((row) => row.classification !== 'not_a_standalone_world'));
assert.equal(new Set(audit.positions.map((row) => row.key)).size, 199);
assert.deepEqual(new Set(audit.positions.map((row) => row.classification)),
  new Set(['ready', 'needs_authored_depth', 'not_a_standalone_world']));
assert.ok(audit.semantics.audit_only_no_new_runtime);
assert.ok(audit.semantics.readiness_classification_is_independent_of_role_world_lifecycle);
assert.ok(audit.semantics.one_life_position_per_role_world_pr);
assert.ok(audit.semantics.livelihood_opportunity_alone_is_not_role_world_depth);

console.log('civication life-position Role World readiness v2 ok: 11 ready / 148 authored-depth / 40 not-standalone; 10 complete / Flanør next');
