import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1 } from '../scripts/audit-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';

test('Unit15 fulltekst dekker eksakt 12 emner i fire moduler og 56 sluttclaims', () => {
  const report = auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1();
  assert.deepEqual(report.summary, {
    emne_count: 12,
    module_count: 4,
    section_count: 12,
    paragraph_count: 56,
    verified_claim_count: 56,
    source_count: 26,
    used_source_count: 26,
    case_count: 24,
    used_case_count: 24,
    canonical_method_count: 13,
    maximum_repeated_sentence_count: report.summary.maximum_repeated_sentence_count
  });
  assert.deepEqual(report.module_paragraph_counts, [14,14,14,14]);
  assert.equal(report.summary.maximum_repeated_sentence_count <= 3, true);
  assert.equal(Object.values(report.gates).every(Boolean), true);
  assert.equal(report.status, 'cultural_heritage_canon_stars_memory_fulltext_verified');
});

test('alle planlagte claims beholdes som historisk briefinput mens sluttclaims er verifisert', () => {
  const topicBriefs = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_topic_claims_v1.json').topic_briefs;
  const planned = topicBriefs.flatMap((row) => row.planned_claims);
  const finalClaims = read('data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne/claims.json').claims;
  assert.equal(planned.length, 56);
  assert.equal(finalClaims.length, 56);
  assert.equal(planned.every((row) => row.status === 'planned_requires_fulltext_verification'), true);
  assert.equal(finalClaims.every((row) => row.status === 'verified' && row.plan_resolution === 'verified_as_planned'), true);
  assert.deepEqual(finalClaims.map((row) => row.id), planned.map((row) => row.id));
  assert.deepEqual(finalClaims.map((row) => row.claim), planned.map((row) => row.claim_focus));
});

test('sluttclaims har claimspesifikke inspectable kilder og alle 26 kilder brukes', () => {
  const claimsDoc = read('data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne/claims.json');
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const used = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  assert.equal(claimsDoc.sources.length, 26);
  assert.equal(claimsDoc.claims.every((row) => row.source_ids.length >= 2), true);
  assert.equal(claimsDoc.claims.every((row) => row.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(claimsDoc.sources.every((row) => used.has(row.id)), true);
});

test('popularitet, stjerneteleologi, kultstatus, nostalgi og kollektivt minne kan ikke kortslutte evidens', () => {
  const report = auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1();
  assert.equal(report.gates.popularity_heritage_canon_and_memory_shortcuts_blocked, true);
  assert.equal(report.gates.star_persona_role_private_person_and_teleology_separated, true);
  assert.equal(report.gates.cult_festival_home_movie_and_counterarchive_boundaries_explicit, true);
  assert.equal(report.gates.circulation_nostalgia_collective_memory_and_quotation_boundaries_explicit, true);
  assert.equal(report.gates.tv_memory_levels_separated, true);
});

test('Unit15 registreres, men Film & TV kan ikke bli complete før helhetsaudit', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const row = registry.subjects.film_tv.chapters.find((chapter) => chapter.id === 'kulturarv-kanon-stjerner-og-minne');
  assert.ok(row);
  assert.equal(row.file, 'data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne.json');
  assert.equal(registry.subjects.film_tv.canonicalModel.fifteenthChapterFulltext, row.file);
  assert.equal(film.editorialStatus, 'chapters_in_progress');
  assert.equal(film.nextGate, FULLTEXT_GATE);
  assert.notEqual(film.nextGate, SOURCE_GATE);
});

test('seksdelt kvalitetsvurdering består uten å forskuttere fagets complete-status', () => {
  const assessment = auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1().quality_assessment;
  assert.deepEqual(Object.values(assessment.dimensions).map((row) => row.score), [5,5,4,5,5,5]);
  assert.equal(assessment.total_score, 29);
  assert.equal(assessment.conclusion, 'high_quality_verified_full_chapter');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
});

test('Unit15 fulltekstverktøy inneholder ingen SCM-synk eller GitHub-push', () => {
  const materializer = fs.readFileSync(new URL('../scripts/materialize-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs', import.meta.url), 'utf8');
  const audit = fs.readFileSync(new URL('../scripts/audit-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs', import.meta.url), 'utf8');
  for (const source of [materializer, audit]) {
    assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
  }
});
