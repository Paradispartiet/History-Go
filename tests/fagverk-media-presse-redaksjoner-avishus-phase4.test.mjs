import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditMediaPresseRedaksjonerAvishusPhase4 } from '../scripts/audit-fagverk-media-presse-redaksjoner-avishus-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Presse, redaksjoner og avishus er canonicalt materialisert 21/21', () => {
  const { report } = auditMediaPresseRedaksjonerAvishusPhase4();
  assert.equal(report.subject.id, 'media');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.registeredChapterCount, 6);
  assert.equal(report.subject.nestedPopularCultureEmneCount, 56);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'presse_redaksjoner_avishus');
  assert.equal(report.canonicalCoverage.exactCoverage, '21/21');
  assert.equal(report.canonicalCoverage.remainingDomainCount, 5);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
});

test('Media-kapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditMediaPresseRedaksjonerAvishusPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: 21, sourceCount: 19, claimCount: 25, placeCaseCount: 4
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), ['aftenposten_akersgata', 'vg_huset', 'dagbladet_akersgata', 'nrk_huset_marienlyst']);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Media beholder komplett fagstatus i presseauditen', () => {
  const { report } = auditMediaPresseRedaksjonerAvishusPhase4();
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(report.subject.canonicalDomainCount, 6);
  assert.equal(report.subject.canonicalEmneCount, 120);
  assert.equal(report.gates.completeSubjectStatusPreserved, true);
  assert.equal(report.gates.nestedPopularCulturePreserved, true);
});

test('Presse, redaksjoner og avishus hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.media.chapters.find((chapter) => chapter.id === 'presse-redaksjoner-og-avishus');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 19);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
