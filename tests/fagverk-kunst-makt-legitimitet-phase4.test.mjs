import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditKunstMaktLegitimitetPhase4 } from '../scripts/audit-fagverk-kunst-makt-legitimitet-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Makt og legitimitet er canonicalt materialisert 3/3', () => {
  const { report } = auditKunstMaktLegitimitetPhase4();
  assert.equal(report.subject.id, 'kunst');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.registeredChapterCount, 6);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'makt_legitimitet');
  assert.equal(report.canonicalCoverage.exactCoverage, '3/3');
  assert.equal(report.canonicalCoverage.remainingDomainCount, 0);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
});

test('kapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditKunstMaktLegitimitetPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3,
    sectionCount: 9,
    paragraphCount: 27,
    conceptCount: 6,
    workedExampleCount: 3,
    misconceptionCount: 5,
    applicationTaskCount: 5,
    selfCheckCount: 7,
    methodCount: 14,
    sourceCount: 16,
    claimCount: 24,
    placeCaseCount: 4
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), ['nasjonalmuseet', 'kunstnernes_hus', 'kunsthall_oslo', 'oslo_radhus']);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Kunst står complete etter seks av seks domener', () => {
  const { report } = auditKunstMaktLegitimitetPhase4();
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(report.subject.canonicalDomainCount, 6);
  assert.equal(report.subject.canonicalEmneCount, 21);
  assert.equal(report.gates.completeSubjectStatusAudited, true);
});

test('Makt og legitimitet hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.kunst.chapters.find((chapter) => chapter.id === 'makt-og-legitimitet');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 16);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
