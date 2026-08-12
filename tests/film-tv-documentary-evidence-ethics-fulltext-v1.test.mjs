import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditFilmTvDocumentaryEvidenceEthicsFulltextV1 } from '../scripts/audit-film-tv-documentary-evidence-ethics-fulltext-v1.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Dokumentar, evidens og etikk dekker læringsenheten eksakt', () => {
  const { report } = auditFilmTvDocumentaryEvidenceEthicsFulltextV1();
  assert.equal(report.canonicalCoverage.exactCoverage, '15/15 canonical emner');
  assert.equal(report.canonicalCoverage.sectionOwnership, '15 emner eid av 15 naturlig avgrensede seksjoner');
  assert.equal(report.subject.nextGate, 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief');
  assert.equal(report.nextGate, 'produce_source_and_claim_brief_for_representasjon_posisjon_og_motbilder');
});

test('alle 54 claimplaner er løst og alle 26 kilder brukes', () => {
  const { report, claimsDoc, sourceBrief } = auditFilmTvDocumentaryEvidenceEthicsFulltextV1();
  assert.equal(report.claimPlanResolution.exactResolution, '54/54');
  assert.deepEqual(report.claimPlanResolution.rewrittenClaimIds, []);
  assert.equal(claimsDoc.claims.length, 54);
  assert.equal(claimsDoc.sources.length, 26);
  assert.ok(claimsDoc.claims.every((row) => row.status === 'verified' && row.source_ids.length && row.used_in.length === 1));
  assert.ok(sourceBrief.topic_briefs.flatMap((row) => row.planned_claims).every((row) => row.status === 'resolved_to_verified_claim'));
});

test('fullteksten har variable problemmoduler og ansvarlige pedagogiske lag', () => {
  const { report, chapter, modules } = auditFilmTvDocumentaryEvidenceEthicsFulltextV1();
  assert.deepEqual(report.summary, {
    moduleCount: 4,
    moduleSectionCounts: [4, 3, 4, 4],
    sectionCount: 15,
    paragraphCount: 54,
    conceptCount: 10,
    workedExampleCount: 7,
    misconceptionCount: 8,
    applicationTaskCount: 8,
    selfCheckCount: 10,
    methodCount: chapter.method_ids.length,
    sourceCount: 26,
    claimCount: 54,
    workCaseCount: 25,
    placeCaseCount: 3
  });
  assert.equal(new Set(modules.flatMap((row) => row.sections).map((row) => row.paragraphs.length)).size, 2);
  assert.deepEqual(chapter.relatedPlaces.map((row) => row.id), ['nasjonalbiblioteket', 'nrk_huset_marienlyst', 'egertorget']);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('opptak, påstand, rekonstruksjon, syntese og deltakeransvar holdes fra hverandre', () => {
  const { report } = auditFilmTvDocumentaryEvidenceEthicsFulltextV1();
  assert.equal(report.gates.authenticityAndEvidenceClaimSeparated, true);
  assert.equal(report.gates.collaborativeStagingCoercionReconstructionAndDeceptionDistinguished, true);
  assert.equal(report.gates.recordingReuseModelAnimationInterfaceAndSyntheticStatusDistinct, true);
  assert.equal(report.gates.consentPowerRiskUseChangeAndAftereffectsCovered, true);
  assert.equal(report.gates.testimonyRetainsInterviewSequenceContextAndAftereffects, true);
});

test('Dokumentar, evidens og etikk hydrerer rendererfeltene', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const meta = registry.subjects.film_tv.chapters.find((row) => row.id === 'dokumentar-evidens-og-etikk');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(meta, fetchFile);
  assert.equal(chapter.sections.length, 15);
  assert.equal(chapter.sources.length, 26);
  assert.equal(chapter.claims.length, 54);
  assert.equal(chapter.concepts.length, 10);
  assert.equal(chapter.workedExamples.length, 7);
  assert.equal(chapter.commonMisconceptions.length, 8);
  assert.equal(chapter.applicationTasks.length, 8);
  assert.equal(chapter.selfCheck.length, 10);
  assert.ok(chapter.workedExamples.every((row) => row.analysis.length >= 2 && row.analysis.every(Boolean)));
});
