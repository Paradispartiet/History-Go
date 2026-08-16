import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const SOURCE = 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json';
const CHAPTER = 'data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne.json';
const SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const FINAL_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const LATER_GATES = new Set([SOURCE_GATE, FULLTEXT_GATE, FINAL_GATE]);

test('Unit 15 source brief forblir canonical når fulltekst og senere porter avanserer', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const brief = read(SOURCE);
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const chapter = registry.subjects.film_tv.chapters.find((row) => row.id === 'kulturarv-kanon-stjerner-og-minne');

  assert.equal(registry.subjects.film_tv.canonicalModel.fifteenthSourceClaimBrief, SOURCE);
  assert.equal(LATER_GATES.has(film.nextGate), true);
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);

  if (film.nextGate === SOURCE_GATE) {
    assert.equal(chapter, undefined);
  } else {
    assert.ok(chapter);
    assert.equal(chapter.file, CHAPTER);
    assert.equal(registry.subjects.film_tv.canonicalModel.fifteenthChapterFulltext, CHAPTER);
  }
});
