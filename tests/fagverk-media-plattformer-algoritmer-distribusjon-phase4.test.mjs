import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditMediaPlattformerAlgoritmerDistribusjonPhase4 } from '../scripts/audit-fagverk-media-plattformer-algoritmer-distribusjon-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Plattformer, algoritmer og distribusjon er canonicalt materialisert 20/20', () => {
  const { report } = auditMediaPlattformerAlgoritmerDistribusjonPhase4();
  assert.equal(report.subject.id, 'media');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.registeredChapterCount, 4);
  assert.equal(report.subject.nestedPopularCultureEmneCount, 56);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'plattformer_algoritmer_distribusjon');
  assert.equal(report.canonicalCoverage.exactCoverage, '20/20');
  assert.equal(report.canonicalCoverage.coveredSubjectEmneCount, 82);
  assert.equal(report.canonicalCoverage.remainingDomainCount, 2);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
});

test('Plattformkapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditMediaPlattformerAlgoritmerDistribusjonPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: 20, sourceCount: 20, claimCount: 27,
    placeCaseCount: 4, criticalDistinctionCount: 23
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), ['vg_huset', 'fornebu_teknologipark', 'deichman_bjorvika', 'telegrafbygningen']);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url && source.source_location));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Media står ærlig som uferdig etter fire av seks hovedområder', () => {
  const { report } = auditMediaPlattformerAlgoritmerDistribusjonPhase4();
  assert.equal(report.subject.nextGate, 'remaining_domain_chapter_production');
  assert.equal(report.subject.canonicalDomainCount, 6);
  assert.equal(report.subject.canonicalEmneCount, 120);
  assert.equal(report.gates.incompleteSubjectStatusHonest, true);
  assert.equal(report.gates.previousMediaChaptersPreserved, true);
  assert.equal(report.gates.nestedPopularCulturePreserved, true);
});

test('Plattformer, algoritmer og distribusjon hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.media.chapters.find((chapter) => chapter.id === 'plattformer-algoritmer-og-distribusjon');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 20);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
