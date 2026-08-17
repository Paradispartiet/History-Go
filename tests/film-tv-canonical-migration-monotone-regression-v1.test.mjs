import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('Film & TV variable canon remains materialized after later chapter production', () => {
  const inventory = read('data/fag/TV_og_Film/film_tv_variable_inventory_v1.json');
  const emners = read('data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json');
  const methods = read('data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json');
  const mappings = read('data/fag/TV_og_Film/emnemapping_film_tv_canonical_v4_5.json');
  const fagkart = read('data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json');
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'film_tv');
  const registry = read('data/fagverk/fagverk_registry.json').subjects.film_tv;

  assert.equal(emners.length, 192);
  assert.equal(methods.methods.length, 119);
  assert.equal(mappings.length, 192);
  assert.equal(fagkart.categories.length, 10);
  assert.equal(fagkart.categories.flatMap((row) => row.topic_hooks || []).length, 192);
  assert.equal(new Set(inventory.emner.flatMap((row) => row.legacy_aliases || [])).size, 120);

  const canonicalIds = new Set(emners.map((row) => row.emne_id));
  assert.equal(canonicalIds.size, 192);
  assert.ok(mappings.every((row) => canonicalIds.has(row.emne_id)));
  assert.ok(registry.chapters.some((row) => row.id === 'kinoer-visningssteder-og-publikum'));
  assert.ok(registry.chapters.some((row) => row.id === 'produksjon-studio-og-filmarbeid'));
  assert.ok(registry.chapters.flatMap((row) => row.emne_ids || []).every((id) => canonicalIds.has(id)));

  const postMigrationGate = status.nextGate === 'canonical_inventory_migrated_existing_chapter_reaudit'
    || status.nextGate === 'canonical_chapter_reaudit_complete_learning_order_plan'
    || status.nextGate === 'learning_order_plan_complete_first_chapter_source_brief'
    || /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit)$/.test(status.nextGate)
    || status.nextGate === 'maintenance_source_refresh_and_place_case_expansion';
  assert.ok(postMigrationGate);
});
