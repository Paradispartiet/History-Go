import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditKunstTidTransformasjonPhase4 } from '../scripts/audit-fagverk-kunst-tid-transformasjon-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Tid og transformasjon er canonicalt materialisert 2/2', () => {
  const { report } = auditKunstTidTransformasjonPhase4();
  assert.equal(report.subject.id, 'kunst');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.registeredChapterCount, 6);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'tid_transformasjon');
  assert.equal(report.canonicalCoverage.exactCoverage, '2/2');
  assert.equal(report.canonicalCoverage.remainingDomainCount, 0);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
});

test('kapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditKunstTidTransformasjonPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: 12, sourceCount: 18, claimCount: 24, placeCaseCount: 4
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), ['nasjonalmuseet', 'munch_museet', 'astrup_fearnley', 'kunstnernes_hus']);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Kunst går til complete bare med eksplisitt helhetsauditport', () => {
  const { report } = auditKunstTidTransformasjonPhase4();
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(report.subject.canonicalDomainCount, 6);
  assert.equal(report.subject.canonicalEmneCount, 21);
  assert.equal(report.gates.fullSubjectCompletionGateDeclared, true);
  assert.equal(report.gates.completeSubjectStatusBackedByAudit, true);
});

test('Tid og transformasjon hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.kunst.chapters.find((chapter) => chapter.id === 'tid-og-transformasjon');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 18);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
