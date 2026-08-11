import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvExistingChapterReauditV1, buildFilmTvExistingChapterReauditV1 } from '../scripts/reaudit-film-tv-existing-chapters-v1.mjs';

test('begge eksisterende Film & TV-kapitler er deterministisk reauditerte mot canonen', () => {
  const result = auditFilmTvExistingChapterReauditV1();
  assert.deepEqual(buildFilmTvExistingChapterReauditV1().report, result.report);
  assert.equal(result.report.chapters.length, 2);
  assert.deepEqual(result.report.chapters.map((row) => [row.legacy_source_emne_count, row.canonical_emne_count]), [[20, 18], [20, 20]]);
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('kapittel, brief og registry bruker samme canonicale emne-ID-er', () => {
  const result = auditFilmTvExistingChapterReauditV1();
  for (const row of result.report.chapters) {
    const chapter = Object.values(result.outputs).find((value) => value.chapter_id === row.chapter_id && value.schema === 'history_go_fagverk_chapter_v1');
    const brief = Object.values(result.outputs).find((value) => value.chapter_id === row.chapter_id && value.schema === 'history_go_fagverk_chapter_brief_v1');
    const registry = result.registry.subjects.film_tv.chapters.find((value) => value.id === row.chapter_id);
    assert.deepEqual(chapter.emne_ids, row.canonical_emne_ids);
    assert.deepEqual(brief.requiredEmneIds, row.canonical_emne_ids);
    assert.deepEqual(registry.emne_ids, row.canonical_emne_ids);
  }
  assert.ok(['canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief'].includes(result.status.subjects.find((row) => row.id === 'film_tv').nextGate));
});
