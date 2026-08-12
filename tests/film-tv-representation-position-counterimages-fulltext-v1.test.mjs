import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvRepresentationPositionCounterimagesFulltextV1 } from '../scripts/audit-film-tv-representation-position-counterimages-fulltext-v1.mjs';
import { materializeFilmTvRepresentationPositionCounterimagesFulltextV1 } from '../scripts/materialize-film-tv-representation-position-counterimages-fulltext-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console }; sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Representasjon, posisjon og motbilder dekker læringsenheten eksakt', () => {
  const { report } = auditFilmTvRepresentationPositionCounterimagesFulltextV1();
  assert.equal(report.canonicalCoverage.exactCoverage, '10/10 canonical emner');
  assert.equal(report.canonicalCoverage.sectionOwnership, '10 emner eid av 10 naturlig avgrensede seksjoner');
  assert.equal(report.subject.nextGate, 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief');
  assert.equal(report.nextGate, 'produce_source_and_claim_brief_for_skjermoffentlighet_fellesskap_og_samfunn');
});

test('alle 38 claimplaner er løst og alle 25 kilder brukes', () => {
  const { report, claimsDoc, sourceBrief } = auditFilmTvRepresentationPositionCounterimagesFulltextV1();
  assert.equal(report.claimPlanResolution.exactResolution, '38/38');
  assert.deepEqual(report.claimPlanResolution.rewrittenClaimIds, []);
  assert.equal(claimsDoc.claims.length, 38);
  assert.equal(claimsDoc.sources.length, 25);
  assert.equal(new Set(claimsDoc.claims.flatMap((row) => row.source_ids)).size, 25);
  assert.ok(sourceBrief.topic_briefs.flatMap((row) => row.planned_claims).every((row) => row.status === 'resolved_to_verified_claim'));
});

test('fullteksten har variabelt omfang og eksplisitte makt- og identitetsporter', () => {
  const { report, modules } = auditFilmTvRepresentationPositionCounterimagesFulltextV1();
  assert.deepEqual(new Set(modules.flatMap((row) => row.sections).map((row) => row.paragraphs.length)), new Set([3, 4]));
  assert.equal(report.summary.paragraphCount, 38);
  assert.ok(report.summary.editorialWordCount >= 1800);
  assert.equal(report.summary.workedExampleCount, 7);
  assert.equal(report.summary.protocolCount, 2);
  assert.equal(report.summary.applicationTaskCount, 7);
  assert.ok(report.gates.noVisualIdentityInference);
  assert.ok(report.gates.quantitativeVisibilityBounded);
  assert.ok(report.gates.samiIndigenousScreenSovereigntyAudited);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Representasjon, posisjon og motbilder hydrerer rendererfeltene', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const meta = registry.subjects.film_tv.chapters.find((row) => row.id === 'representasjon-posisjon-og-motbilder');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(meta, fetchFile);
  assert.equal(chapter.sections.length, 10);
  assert.equal(chapter.sources.length, 25);
  assert.equal(chapter.claims.length, 38);
  assert.equal(chapter.concepts.length, 8);
  assert.equal(chapter.workedExamples.length, 7);
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.equal(chapter.applicationTasks.length, 7);
  assert.equal(chapter.selfCheck.length, 6);
  assert.ok(chapter.lead.length > 100);
  assert.equal(chapter.diagnosticQuestions.length, 5);
  assert.equal(chapter.learningObjectives.length, 10);
  assert.deepEqual(Array.from(chapter.applicationTasks.filter((row) => row.protocol_id), (row) => row.protocol_id), ['ftv-rp-protocol-1', 'ftv-rp-protocol-2']);
});

test('materialisereren er idempotent på neste kildebriefport', () => {
  assert.equal(materializeFilmTvRepresentationPositionCounterimagesFulltextV1(), null);
});
