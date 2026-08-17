import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

const canonical = read('data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json');
const registry = read('data/fagverk/fagverk_registry.json').subjects.film_tv;
const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'film_tv');
const report = read('reports/fagverk/film-tv-full-subject-completion-v1.json');
const historical = read('reports/fagverk/film-tv-curriculum-completeness-v1.json');

test('Film & TV completion is locked to the 192-topic canon and the registered chapter set', () => {
  assert.equal(canonical.length, 192);
  assert.equal(new Set(canonical.map((row) => row.emne_id)).size, 192);
  assert.equal(new Set(canonical.map((row) => row.domain)).size, 10);
  assert.equal(registry.chapters.length, 17);

  const assignments = registry.chapters.flatMap((registered) => {
    const chapter = read(registered.file);
    assert.equal(chapter.id, registered.id);
    assert.equal(chapter.subject_id, 'film_tv');
    return chapter.emne_ids;
  });
  assert.equal(assignments.length, 192);
  assert.equal(new Set(assignments).size, 192);
  assert.deepEqual([...assignments].sort(), canonical.map((row) => row.emne_id).sort());
});

test('Film & TV complete status depends on the permanent holistic audit, not the historical quota audit', () => {
  assert.equal(report.status, 'film_tv_full_subject_completion_verified');
  assert.equal(report.canonicalInventory.topicCount, 192);
  assert.equal(report.chapterSet.registeredChapterCount, 17);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(status.editorialStatus, 'complete');
  assert.equal(status.nextGate, 'maintenance_source_refresh_and_place_case_expansion');

  assert.notEqual(historical.status, 'film_tv_full_subject_completion_verified');
  assert.match(report.historicalAuditBoundary.rule, /historical/i);
});

test('Every completion chapter keeps brief, module, claim and source provenance', () => {
  for (const registered of registry.chapters) {
    const chapter = read(registered.file);
    const brief = read(registered.briefFile ?? chapter.briefFile);
    const claims = read(registered.claimsFile ?? chapter.claimsFile);
    const moduleFiles = chapter.moduleFiles ?? registered.moduleFiles;

    assert.deepEqual([...brief.requiredEmneIds].sort(), [...chapter.emne_ids].sort());
    assert.ok(Array.isArray(moduleFiles) && moduleFiles.length > 0);
    assert.ok(claims.claims.length > 0);
    assert.ok(claims.sources.length > 0);

    const sourceIds = new Set(claims.sources.map((row) => row.id));
    assert.equal(sourceIds.size, claims.sources.length);
    assert.ok(claims.sources.every((row) => /^https?:\/\//.test(row.url)));
    assert.ok(claims.claims.every((claim) => claim.status === 'verified'));
    assert.ok(claims.claims.every((claim) => claim.source_ids.length > 0 && claim.source_ids.every((id) => sourceIds.has(id))));
  }
});
