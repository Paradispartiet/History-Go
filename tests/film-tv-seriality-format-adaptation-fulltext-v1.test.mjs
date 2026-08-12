import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvSerialityFormatAdaptationFulltextV1 } from '../scripts/audit-film-tv-seriality-format-adaptation-fulltext-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Serialitet, format og adaptasjon dekker læringsenheten eksakt', () => {
  const { report } = auditFilmTvSerialityFormatAdaptationFulltextV1();
  assert.equal(report.canonicalCoverage.exactCoverage, '10/10 canonical emner');
  assert.equal(report.canonicalCoverage.sectionOwnership, '10 emner eid av 10 naturlig avgrensede seksjoner');
  assert.ok(['seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief', 'documentary_evidence_ethics_source_brief_complete_full_chapter_production', 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief', 'representation_position_counterimages_source_brief_complete_full_chapter_production'].includes(report.subject.nextGate));
  assert.equal(report.nextGate, 'produce_source_and_claim_brief_for_filmhistorie_bevegelser_og_historiografi');
});

test('alle 28 claimplaner er løst og alle 16 kilder brukes', () => {
  const { report, claimsDoc, sourceBrief } = auditFilmTvSerialityFormatAdaptationFulltextV1();
  assert.equal(report.claimPlanResolution.exactResolution, '28/28');
  assert.deepEqual(report.claimPlanResolution.rewrittenClaimIds, ['ftv-sfa-pc-06', 'ftv-sfa-pc-09', 'ftv-sfa-pc-23']);
  assert.equal(claimsDoc.claims.length, 28);
  assert.equal(claimsDoc.sources.length, 16);
  assert.ok(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length && row.used_in.length === 1));
  assert.ok(sourceBrief.topic_briefs.flatMap((row) => row.planned_claims).every((row) => row.status === 'resolved_to_verified_claim'));
});

test('fullteksten har variable moduler, pedagogiske lag og sammenlignbare case', () => {
  const { report, chapter, modules } = auditFilmTvSerialityFormatAdaptationFulltextV1();
  assert.deepEqual(report.summary, {
    moduleCount: 4, moduleSectionCounts: [4, 2, 2, 2], sectionCount: 10, paragraphCount: 28,
    conceptCount: 8, workedExampleCount: 4, misconceptionCount: 6, applicationTaskCount: 6,
    selfCheckCount: 8, methodCount: chapter.method_ids.length, sourceCount: 16, claimCount: 28,
    workCaseCount: 12, filmOrCinemaCaseCount: report.summary.filmOrCinemaCaseCount,
    televisionCaseCount: report.summary.televisionCaseCount, placeCaseCount: 2
  });
  assert.ok(report.summary.filmOrCinemaCaseCount >= 4);
  assert.ok(report.summary.televisionCaseCount >= 6);
  assert.equal(new Set(modules.flatMap((row) => row.sections).map((row) => row.paragraphs.length)).size, 3);
  assert.equal(chapter.relatedPlaces.length, 2);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Serialitet, format og adaptasjon hydrerer rendererfeltene', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const meta = registry.subjects.film_tv.chapters.find((row) => row.id === 'serialitet-format-og-adaptasjon');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(meta, fetchFile);
  assert.equal(chapter.sections.length, 10);
  assert.equal(chapter.sources.length, 16);
  assert.equal(chapter.claims.length, 28);
  assert.equal(chapter.concepts.length, 8);
  assert.equal(chapter.workedExamples.length, 4);
  assert.equal(chapter.commonMisconceptions.length, 6);
  assert.equal(chapter.applicationTasks.length, 6);
  assert.equal(chapter.selfCheck.length, 8);
  assert.ok(chapter.workedExamples.every((row) => row.analysis.length >= 2 && row.analysis.every(Boolean)));
});
