import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvAudiovisualFormFulltextV1 } from '../scripts/audit-film-tv-audiovisual-form-fulltext-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Audiovisuell form og sansing dekker læringsenhetens variable canon eksakt', () => {
  const { report } = auditFilmTvAudiovisualFormFulltextV1();
  assert.equal(report.canonicalCoverage.exactCoverage, '10/10 canonical emner');
  assert.equal(report.canonicalCoverage.sectionOwnership, '10 emner eid av 10 naturlig avgrensede seksjoner');
  assert.ok(['audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production'].includes(report.subject.nextGate));
  assert.equal(report.nextGate, 'produce_source_and_claim_brief_for_fortelling_synsvinkel_og_sjanger');
});

test('Alle claimplaner er løst til verifiserte og brukte fulltekstclaims', () => {
  const { report, claimsDoc, sourceBrief } = auditFilmTvAudiovisualFormFulltextV1();
  assert.equal(report.claimPlanResolution.exactResolution, '20/20');
  assert.deepEqual(report.claimPlanResolution.rewrittenClaimIds, ['ftv-af-pc-08', 'ftv-af-pc-14']);
  assert.equal(claimsDoc.claims.length, 20);
  assert.ok(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length && row.used_in.length === 1));
  assert.ok(sourceBrief.topic_briefs.flatMap((row) => row.planned_claims).every((row) => row.status === 'resolved_to_verified_claim'));
});

test('Fullteksten har pedagogiske lag, variabel avsnittsstruktur og canonicale anvendelsessteder', () => {
  const { report, chapter, modules } = auditFilmTvAudiovisualFormFulltextV1();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 10, paragraphCount: 23, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: 18, sourceCount: 8, claimCount: 20,
    workCaseCount: 7, placeCaseCount: 2
  });
  assert.equal(chapter.relatedPlaces.length, 2);
  assert.equal(chapter.workCases.length, 7);
  assert.ok(modules[1].commonMisconceptions.every((row) => row.claim && row.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Audiovisuell form og sansing hydrerer rendererfeltene', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const meta = registry.subjects.film_tv.chapters.find((row) => row.id === 'audiovisuell-form-og-sansing');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(meta, fetchFile);
  assert.equal(chapter.sections.length, 10);
  assert.equal(chapter.sources.length, 8);
  assert.equal(chapter.claims.length, 20);
  assert.equal(chapter.concepts.length, 6);
  assert.equal(chapter.workedExamples.length, 3);
  assert.ok(chapter.workedExamples.every((row) => row.title && row.situation && Array.isArray(row.analysis) && row.analysis.length >= 2 && row.analysis.every(Boolean)));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.equal(chapter.applicationTasks.length, 5);
  assert.equal(chapter.selfCheck.length, 7);
});
