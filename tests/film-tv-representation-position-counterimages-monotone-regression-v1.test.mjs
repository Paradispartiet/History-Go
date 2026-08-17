import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const CHAPTER_ID = 'representasjon-posisjon-og-motbilder';
const UNIT8_ID = 'skjermoffentlighet-fellesskap-og-samfunn';
const FILM_TV_PRODUCTION_GATE = /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$/;

const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  sourceBrief: 'data/fag/TV_og_Film/film_tv_representation_position_counterimages_source_claim_brief_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-representation-position-counterimages-fulltext-v1-audit.json'
});

test('enhet 7 forblir komplett etter at Film & TV har avansert til enhet 8 eller senere', () => {
  const chapter = read(P.chapter);
  const brief = read(P.brief);
  const claimsDoc = read(P.claims);
  const sourceBrief = read(P.sourceBrief);
  const registry = read(P.registry);
  const status = read(P.status);
  const report = read(P.report);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  const registryChapter = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const registeredUnit8 = registry.subjects.film_tv.chapters.find((row) => row.id === UNIT8_ID);
  const plannedClaims = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims);

  assert.equal(chapter.id, CHAPTER_ID);
  assert.equal(chapter.subject_id, 'film_tv');
  assert.equal(chapter.editorialStatus, 'chapter_ready');
  assert.equal(chapter.emne_ids.length, 10);
  assert.equal(new Set(chapter.emne_ids).size, 10);
  assert.equal(chapter.moduleFiles.length, 4);
  assert.equal(chapter.workCases.length, 21);
  assert.equal(chapter.relatedPlaces.length, 2);

  assert.equal(brief.chapter_id, CHAPTER_ID);
  assert.equal(claimsDoc.chapter_id, CHAPTER_ID);
  assert.equal(claimsDoc.claims.length, 38);
  assert.equal(new Set(claimsDoc.claims.map((row) => row.id)).size, 38);
  assert.equal(claimsDoc.sources.length, 25);
  assert.equal(new Set(claimsDoc.sources.map((row) => row.id)).size, 25);
  assert.ok(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length > 0));

  assert.equal(sourceBrief.status, 'source_claim_brief_consumed_by_verified_chapter');
  assert.equal(sourceBrief.runtime_registration.registered, true);
  assert.equal(sourceBrief.runtime_registration.chapter_id, CHAPTER_ID);
  assert.ok(plannedClaims.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id));

  assert.ok(registryChapter);
  assert.equal(registryChapter.file, P.chapter);
  assert.equal(registryChapter.claimsFile, P.claims);
  assert.equal(registryChapter.briefFile, P.brief);
  assert.deepEqual(registryChapter.emne_ids, chapter.emne_ids);
  assert.ok(registeredUnit8);

  assert.equal(report.status, 'representation_position_counterimages_chapter_verified_registered');
  assert.equal(report.canonicalCoverage.exactCoverage, '10/10 canonical emner');
  assert.equal(report.claimPlanResolution.exactResolution, '38/38');
  assert.ok(Object.values(report.gates).every(Boolean));

  assert.equal(filmStatus.editorialStatus, 'chapters_in_progress');
  assert.match(filmStatus.nextGate, FILM_TV_PRODUCTION_GATE);
});
