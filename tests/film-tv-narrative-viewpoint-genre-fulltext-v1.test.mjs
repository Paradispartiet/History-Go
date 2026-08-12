import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvNarrativeViewpointGenreFulltextV1 } from '../scripts/audit-film-tv-narrative-viewpoint-genre-fulltext-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Fortelling, synsvinkel og sjanger dekker læringsenheten eksakt', () => {
  const { report } = auditFilmTvNarrativeViewpointGenreFulltextV1();
  assert.equal(report.canonicalCoverage.exactCoverage, '5/5 canonical emner');
  assert.equal(report.canonicalCoverage.sectionOwnership, '5 emner eid av 5 naturlig avgrensede seksjoner');
  assert.ok(['narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief'].includes(report.subject.nextGate));
  assert.equal(report.nextGate, 'produce_source_and_claim_brief_for_serialitet_format_og_adaptasjon');
});

test('alle 13 claimplaner er løst og alle 12 kilder brukes', () => {
  const { report, claimsDoc, sourceBrief } = auditFilmTvNarrativeViewpointGenreFulltextV1();
  assert.equal(report.claimPlanResolution.exactResolution, '13/13');
  assert.deepEqual(report.claimPlanResolution.rewrittenClaimIds, ['ftv-nvg-pc-08']);
  assert.equal(claimsDoc.claims.length, 13);
  assert.equal(claimsDoc.sources.length, 12);
  assert.ok(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length && row.used_in.length === 1));
  assert.ok(sourceBrief.topic_briefs.flatMap((row) => row.planned_claims).every((row) => row.status === 'resolved_to_verified_claim'));
});

test('fullteksten har variabelt omfang, pedagogiske lag og film- og TV-case', () => {
  const { report, chapter, modules } = auditFilmTvNarrativeViewpointGenreFulltextV1();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 5, paragraphCount: 13, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: chapter.method_ids.length, sourceCount: 12,
    claimCount: 13, workCaseCount: 6, filmCaseCount: 5, televisionCaseCount: 1, placeCaseCount: 2
  });
  assert.equal(new Set(modules.flatMap((row) => row.sections).map((row) => row.paragraphs.length)).size, 2);
  assert.deepEqual(modules.flatMap((row) => row.sections).find((row) => row.id === 'ftv-nvg-verdener-1').keyPointClaimIds, [['ftv-nvg-pc-01'], ['ftv-nvg-pc-03']]);
  assert.deepEqual(modules.flatMap((row) => row.sections).find((row) => row.id === 'ftv-nvg-tid-1').keyPointClaimIds, [['ftv-nvg-pc-06'], ['ftv-nvg-pc-08']]);
  assert.equal(chapter.relatedPlaces.length, 2);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Fortelling, synsvinkel og sjanger hydrerer rendererfeltene', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const meta = registry.subjects.film_tv.chapters.find((row) => row.id === 'fortelling-synsvinkel-og-sjanger');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(meta, fetchFile);
  assert.equal(chapter.sections.length, 5);
  assert.equal(chapter.sources.length, 12);
  assert.equal(chapter.claims.length, 13);
  assert.equal(chapter.concepts.length, 6);
  assert.equal(chapter.workedExamples.length, 3);
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.equal(chapter.applicationTasks.length, 5);
  assert.equal(chapter.selfCheck.length, 7);
});
