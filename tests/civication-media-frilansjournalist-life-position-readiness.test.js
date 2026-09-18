#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const badge = read('data/badges/media.json');
const audit = read('data/Civication/lifePositionRoleWorldReadiness.json');
const livelihood = read('data/Civication/livelihoodOpportunityTemplates.json');
const index = read('data/Civication/roleWorlds/index.json');
const streamPath = 'data/Civication/narratives/leisure/media_frilansjournalist.json';
const worldPath = 'data/Civication/roleWorlds/media/media_frilansjournalist.json';
const stream = read(streamPath);

const tier = badge.tiers.find((entry) => entry.life_position?.id === 'frilansjournalist');
assert.ok(tier);
assert.equal(tier.threshold, 40);
assert.equal(tier.life_position.kind, 'freelance_professional_practice');
assert.equal(tier.life_position.employment_independent, true);

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'media_frilansjournalist_stream');
assert.deepEqual(stream.applies_when.any_tags, ['media:frilansjournalist']);
assert.equal(stream.storylets.length, 14);
assert.equal(new Set(stream.storylets.map((storylet) => storylet.id)).size, 14);
for (const storylet of stream.storylets) {
  assert.equal(storylet.choices.length, 2);
  assert.deepEqual(storylet.choices.map((choice) => choice.effect), [1, -1]);
}

const template = livelihood.templates.find((entry) => entry.id === 'frilansjournalist_artikkeloppdrag');
assert.ok(template);
assert.equal(template.badge_id, 'media');
assert.equal(template.life_position_label, 'Frilansjournalist');
assert.equal(template.kind_id, 'freelance_assignment');

const row = audit.positions.find((entry) => entry.key === 'media/frilansjournalist');
assert.ok(row);
assert.equal(row.classification, 'ready');
assert.equal(row.authored_depth.exact_source_ref_count, 1);
assert.equal(row.authored_depth.max_narrative_depth, 14);
assert.equal(row.authored_depth.livelihood_template_count, 1);
assert.deepEqual(row.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(row.evidence.livelihood_templates, ['frilansjournalist_artikkeloppdrag']);
assert.equal(row.evidence.livelihood_ref, 'data/Civication/livelihoodOpportunityTemplates.json');

if (fs.existsSync(path.join(ROOT, worldPath))) {
  assert.equal(row.role_world_status, 'role_world_complete');
  assert.equal(row.role_world_path, worldPath);
  const indexed = index.roles.find((entry) => entry.life_position_key === 'media/frilansjournalist');
  assert.ok(indexed);
  assert.equal(indexed.role_scope, 'media_frilansjournalist');
  const world = read(worldPath);
  assert.equal(world.subject_type, 'life_position');
  assert.equal(world.status, 'role_world_complete');
  assert.deepEqual(world.life_position_ref, { badge_id: 'media', id: 'frilansjournalist', label: 'Frilansjournalist' });
  assert.equal(world.materialization.no_new_runtime, true);
  assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
  assert.equal(world.season.coverage.length, 56);
  assert.equal(new Set(world.season.coverage.map((x) => x.day + '/' + x.phase)).size, 56);
  assert.equal(world.materialization.source_refs.length, 14);
  assert.equal(world.primary_threads.length, 14);
  assert.equal(world.recurring_people_archetypes.length, 6);
  assert.equal(world.private_aftermath.length, 5);
  assert.equal(world.delayed_consequences.length, 6);
  assert.match(world.sociological_core.description, /Næringsliv\/Frilanser/i);
  assert.match(world.sociological_core.description, /Journalist\/Reporter/i);
  assert.match(world.sociological_core.description, /ingen fast jobb|ingen fast lønn/i);
} else {
  assert.equal(row.role_world_status, 'role_world_not_started');
  assert.equal(row.role_world_path, null);
  assert.equal(audit.first_ready?.key, 'media/frilansjournalist');
  assert.ok(audit.queue.some((entry) => entry.key === 'media/frilansjournalist' && entry.classification === 'ready'));
}

const serialized = JSON.stringify({stream, template});
for (const forbidden of ['fixed_salary','editorial_authority','career_offer']) {
  assert.ok(!serialized.includes(forbidden), 'Frilansjournalist authored source must not claim ' + forbidden);
}
console.log('Frilansjournalist readiness gate ok: ready + ' + row.role_world_status);
