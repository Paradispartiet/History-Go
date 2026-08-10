import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditMediaPropagandaPavirkningInformasjonskrigPhase4 } from '../scripts/audit-fagverk-media-propaganda-pavirkning-informasjonskrig-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Propaganda, påvirkning og informasjonskrig er canonicalt materialisert 18/18', () => {
  const { report } = auditMediaPropagandaPavirkningInformasjonskrigPhase4();
  assert.equal(report.subject.id, 'media');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.registeredChapterCount, 5);
  assert.equal(report.subject.nestedPopularCultureEmneCount, 56);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'propaganda_pavirkning_informasjonskrig');
  assert.equal(report.canonicalCoverage.exactCoverage, '18/18');
  assert.equal(report.canonicalCoverage.coveredSubjectEmneCount, 100);
  assert.equal(report.canonicalCoverage.remainingDomainCount, 1);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
});

test('Propagandakapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditMediaPropagandaPavirkningInformasjonskrigPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6,
    workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5,
    selfCheckCount: 7, methodCount: 18, sourceCount: 23, claimCount: 27,
    placeCaseCount: 4, criticalDistinctionCount: 24
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), ['stortinget', 'regjeringskvartalet', 'youngstorget', 'nrk_huset_marienlyst']);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url && source.source_location));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Media står ærlig som uferdig etter fem av seks hovedområder', () => {
  const { report } = auditMediaPropagandaPavirkningInformasjonskrigPhase4();
  assert.equal(report.subject.nextGate, 'remaining_domain_chapter_production');
  assert.equal(report.subject.canonicalDomainCount, 6);
  assert.equal(report.subject.canonicalEmneCount, 120);
  assert.equal(report.gates.incompleteSubjectStatusHonest, true);
  assert.equal(report.gates.previousMediaChaptersPreserved, true);
  assert.equal(report.gates.nestedPopularCulturePreserved, true);
});

test('Propaganda, påvirkning og informasjonskrig hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.media.chapters.find((chapter) => chapter.id === 'propaganda-pavirkning-og-informasjonskrig');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);
  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 23);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
