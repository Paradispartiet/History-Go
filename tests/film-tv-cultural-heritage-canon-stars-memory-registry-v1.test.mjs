import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const SOURCE = 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json';
const GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
test('Unit 15 source brief er canonicalt registrert uten tidlig kapittelregistrering', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const brief = read(SOURCE);
  const film = status.subjects.find((row) => row.id === 'film_tv');
  assert.equal(registry.subjects.film_tv.canonicalModel.fifteenthSourceClaimBrief, SOURCE);
  assert.equal(film.nextGate, GATE);
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);
  assert.equal(registry.subjects.film_tv.chapters.some((row) => row.id === 'kulturarv-kanon-stjerner-og-minne'), false);
});
