import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('legacy Fagverk-migreringen er eksplisitt lukket 44/44', () => {
  const semantics = readJson('reports/fagverk/fagverk-place-page-coverage-semantics-v1.json');
  const migration = semantics.legacy_completed_place_migration;

  assert.equal(migration.completed, 44);
  assert.equal(migration.total, 44);
  assert.equal(migration.missing, 0);
  assert.equal(migration.status, 'complete');
  assert.equal(migration.closed_by, 'PR #5606');
});

test('global unfinished coverage er ikke definert som post-produksjonsbacklog', () => {
  const semantics = readJson('reports/fagverk/fagverk-place-page-coverage-semantics-v1.json');
  const coverage = readJson('reports/fagverk/fagverk-place-page-coverage-v2.json');
  const summary = coverage.summary;
  const unfinished = summary.in_production + summary.linked_unfinished + summary.category_only_unfinished;

  assert.equal(semantics.backlog_semantics.unfinished_counts_are_post_production_backlog, false);
  assert.equal(semantics.backlog_semantics.unfinished_counts_are_global_coverage, true);
  assert.equal(summary.all, summary.curated + unfinished);
  assert.ok(summary.curated >= 44);
});

test('Fagverk-sted-workcardet er lukket som legacy-program og peker til integrert produksjon', () => {
  const document = fs.readFileSync('docs/FAGVERK_PLACE_V2_WORKCARD.md', 'utf8');

  assert.match(document, /legacy-migrering fullført; integrert sted-for-sted-produksjon aktiv/u);
  assert.match(document, /44\/44/u);
  assert.match(document, /PR #5606/u);
  assert.match(document, /ikke.*post-produksjonsbacklog|ikke.*legacy-backlog/iu);
  assert.doesNotMatch(document, /Status: aktivt legacy-migrerings- og produksjonsprogram/u);
  assert.doesNotMatch(document, /Separate batcher brukes til å lukke den eksisterende legacy-backloggen/u);
});
