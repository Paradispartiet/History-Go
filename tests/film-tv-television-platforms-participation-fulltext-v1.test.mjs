import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvTelevisionPlatformsParticipationFulltextV1 } from '../scripts/audit-film-tv-television-platforms-participation-fulltext-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Fjernsyn, plattformer og deltakerhistorier dekker læringsenheten eksakt', () => {
  const { report } = auditFilmTvTelevisionPlatformsParticipationFulltextV1();
  assert.equal(report.canonicalCoverage.exactCoverage, '8/8 canonical emner');
  assert.equal(report.canonicalCoverage.sectionOwnership, '8 emner eid av 8 naturlig avgrensede seksjoner');
  assert.ok(['television_platforms_participation_full_chapter_complete_next_unit_source_brief', 'documentary_evidence_ethics_source_brief_complete_full_chapter_production'].includes(report.subject.nextGate));
  assert.equal(report.nextGate, 'produce_source_and_claim_brief_for_dokumentar_evidens_og_etikk');
});

test('alle 31 claimplaner er løst og alle 20 kilder brukes', () => {
  const { report, claimsDoc, sourceBrief } = auditFilmTvTelevisionPlatformsParticipationFulltextV1();
  assert.equal(report.claimPlanResolution.exactResolution, '31/31');
  assert.deepEqual(report.claimPlanResolution.rewrittenClaimIds, ['ftv-tp-pc-30']);
  assert.equal(claimsDoc.claims.length, 31);
  assert.equal(claimsDoc.sources.length, 20);
  assert.ok(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length && row.used_in.length === 1));
  assert.ok(sourceBrief.topic_briefs.flatMap((row) => row.planned_claims).every((row) => row.status === 'resolved_to_verified_claim'));
});

test('fullteksten har variable problemmoduler og kildekritiske pedagogiske lag', () => {
  const { report, chapter, modules } = auditFilmTvTelevisionPlatformsParticipationFulltextV1();
  assert.deepEqual(report.summary, {
    moduleCount: 3, moduleSectionCounts: [2, 3, 3], sectionCount: 8, paragraphCount: 31,
    conceptCount: 8, workedExampleCount: 5, misconceptionCount: 6, applicationTaskCount: 6,
    selfCheckCount: 8, methodCount: chapter.method_ids.length, sourceCount: 20, claimCount: 31,
    workCaseCount: 19, placeCaseCount: 3
  });
  assert.equal(new Set(modules.flatMap((row) => row.sections).map((row) => row.paragraphs.length)).size, 2);
  assert.deepEqual(chapter.relatedPlaces.map((row) => row.id), ['egertorget', 'nrk_huset_marienlyst', 'nasjonalbiblioteket']);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Fjernsyn, plattformer og deltakerhistorier hydrerer rendererfeltene', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const meta = registry.subjects.film_tv.chapters.find((row) => row.id === 'fjernsyn-plattformer-og-deltakerhistorier');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(meta, fetchFile);
  assert.equal(chapter.sections.length, 8);
  assert.equal(chapter.sources.length, 20);
  assert.equal(chapter.claims.length, 31);
  assert.equal(chapter.concepts.length, 8);
  assert.equal(chapter.workedExamples.length, 5);
  assert.equal(chapter.commonMisconceptions.length, 6);
  assert.equal(chapter.applicationTasks.length, 6);
  assert.equal(chapter.selfCheck.length, 8);
  assert.ok(chapter.workedExamples.every((row) => row.analysis.length >= 2 && row.analysis.every(Boolean)));
});
