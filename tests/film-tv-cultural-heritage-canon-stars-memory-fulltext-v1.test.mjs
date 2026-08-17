import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1 } from '../scripts/audit-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const FORBIDDEN = [
  /\bSpor \d+-\d+\b/u,
  /Analyselinsen er/u,
  /Metodisk kombineres/u,
  /Som første evidensanker brukes/u,
  /Som uavhengig kontrollanker brukes/u,
  /inspectable lokasjon/u,
  /Claimet kan verifiseres som planlagt/u,
  /Inferensgrensen blokkerer snarveien/u
];

test('Unit15 fulltekst dekker eksakt 12 emner, 56 sluttclaims og hele evidensinventaret', () => {
  const report = auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1();
  assert.equal(report.summary.emne_count, 12);
  assert.equal(report.summary.module_count, 4);
  assert.equal(report.summary.section_count, 12);
  assert.equal(report.summary.paragraph_count, 56);
  assert.equal(report.summary.verified_claim_count, 56);
  assert.equal(report.summary.source_count, 26);
  assert.equal(report.summary.used_source_count, 26);
  assert.equal(report.summary.case_count, 24);
  assert.equal(report.summary.used_case_count, 24);
  assert.equal(report.summary.canonical_method_count, 13);
  assert.equal(report.summary.minimum_paragraph_word_count >= 180, true);
  assert.equal(report.summary.maximum_repeated_sentence_count <= 3, true);
  assert.equal(report.summary.forbidden_editorial_fragment_count, 0);
  assert.equal(Object.values(report.gates).every(Boolean), true);
  assert.equal(report.status, 'cultural_heritage_canon_stars_memory_editorial_fulltext_verified');
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

test('sluttclaims har claimspesifikke kilder og alle 26 kilder brukes', () => {
  const claimsDoc = read('data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne/claims.json');
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const used = new Set(claimsDoc.claims.flatMap((row) => row.source_ids));
  assert.equal(claimsDoc.sources.length, 26);
  assert.equal(claimsDoc.claims.every((row) => row.source_ids.length >= 2), true);
  assert.equal(claimsDoc.claims.every((row) => row.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(claimsDoc.sources.every((row) => used.has(row.id)), true);
});

test('Unit15-prosa kan ikke falle tilbake til sporlogg eller generatorfrase', () => {
  const modules = [
    '01-kulturarv-kanon-og-motarkiv.json',
    '02-stjerner-kanonmakt-og-kollektiv-referanse.json',
    '03-kult-nostalgi-og-kulturell-varighet.json',
    '04-sitat-stjerneapparat-og-tv-minne.json'
  ].map((file) => read(`data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne/${file}`));
  const paragraphs = modules.flatMap((module) => module.sections.flatMap((section) => section.paragraphs));
  assert.equal(paragraphs.length, 56);
  for (const paragraph of paragraphs) {
    for (const pattern of FORBIDDEN) assert.doesNotMatch(paragraph, pattern);
  }
});

test('popularitet, stjerneteleologi, kultstatus, nostalgi og kollektivt minne kan ikke kortslutte evidens', () => {
  const sourceBrief = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json');
  const policy = sourceBrief.source_policy;
  assert.equal(policy.popularity_does_not_prove_canon_heritage_cult_status_or_collective_memory, true);
  assert.equal(policy.later_stardom_must_not_be_projected_backwards_without_contemporary_evidence, true);
  assert.equal(policy.cult_status_requires_documented_reception_or_audience_practice_and_an_explicit_definition, true);
  assert.equal(policy.nostalgic_textual_framing_does_not_prove_audience_nostalgia, true);
  assert.equal(policy.collective_memory_claims_require_defined_group_period_and_mediation_process, true);
  assert.equal(auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1().gates.source_policy_remains_strict, true);
});

test('Unit15-registrering er monoton fra completion-audit til bevist helhetscompletion', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const row = registry.subjects.film_tv.chapters.find((chapter) => chapter.id === 'kulturarv-kanon-stjerner-og-minne');
  assert.ok(row);
  assert.equal(row.file, 'data/fagverk/film_tv/kulturarv-kanon-stjerner-og-minne.json');
  assert.equal(registry.subjects.film_tv.canonicalModel.fifteenthChapterFulltext, row.file);
  assert.notEqual(film.nextGate, SOURCE_GATE);

  if (film.editorialStatus === 'complete') {
    assert.equal(film.nextGate, MAINTENANCE_GATE);
    assert.equal(registry.subjects.film_tv.chapters.length, 17);
    const completion = read('reports/fagverk/film-tv-holistic-completion-v1-audit.json');
    assert.equal(completion.status, 'complete');
    assert.equal(completion.summary.canonical_emne_count, 192);
    assert.equal(completion.summary.registered_chapter_count, 17);
    assert.ok(Object.values(completion.gates).every(Boolean));
  } else {
    assert.equal(film.editorialStatus, 'chapters_in_progress');
    assert.equal(film.nextGate, FULLTEXT_GATE);
  }
});

test('seksdelt kvalitetsvurdering består uten å forskuttere fagets complete-status', () => {
  const assessment = auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1().quality_assessment;
  assert.deepEqual(Object.values(assessment.dimensions).map((row) => row.score), [5,5,5,5,5,5]);
  assert.equal(assessment.total_score, 30);
  assert.equal(assessment.conclusion, 'high_quality_editorial_full_chapter_verified');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
});

test('Unit15 fulltekstverktøy inneholder ingen SCM-synk eller GitHub-push', () => {
  const files = [
    '../scripts/materialize-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs',
    '../scripts/materialize-film-tv-cultural-heritage-canon-stars-memory-editorial-v1.mjs',
    '../scripts/audit-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs',
    '../scripts/audit-film-tv-cultural-heritage-canon-stars-memory-editorial-v1.mjs'
  ];
  for (const file of files) {
    const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
  }
});
