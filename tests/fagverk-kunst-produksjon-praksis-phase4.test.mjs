import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { auditKunstProduksjonPraksisPhase4 } from '../scripts/audit-fagverk-kunst-produksjon-praksis-phase4.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreSource = fs.readFileSync(path.join(root, 'js/fagverk-subject-core.js'), 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(coreSource, sandbox, { filename: 'js/fagverk-subject-core.js' });
const CORE = sandbox.HGFagverkSubjectCore;

test('Produksjon og praksis er canonicalt materialisert 5/5', () => {
  const { report } = auditKunstProduksjonPraksisPhase4();
  assert.equal(report.subject.id, 'kunst');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.registeredChapterCount, 4);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'produksjon_praksis');
  assert.equal(report.canonicalCoverage.exactCoverage, '5/5');
  assert.equal(report.canonicalCoverage.remainingDomainCount, 2);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
});

test('kapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report, chapter, claimsDoc, modules } = auditKunstProduksjonPraksisPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3,
    sectionCount: 9,
    paragraphCount: 27,
    conceptCount: 6,
    workedExampleCount: 3,
    misconceptionCount: 5,
    applicationTaskCount: 5,
    selfCheckCount: 7,
    methodCount: 9,
    sourceCount: 16,
    claimCount: 23,
    placeCaseCount: 4
  });
  assert.deepEqual(chapter.relatedPlaces.map((place) => place.id), [
    'edvard_munchs_atelier_ekely',
    'kunsthall_oslo',
    'hausmania',
    'kunstnernes_hus'
  ]);
  assert.ok(chapter.relatedPlaces.every((place) => place.name && place.role));
  assert.ok(claimsDoc.sources.every((source) => source.label && source.url));
  assert.ok(modules[1].commonMisconceptions.every((item) => item.claim && item.correction));
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Kunst står ærlig som uferdig etter fire av seks domener', () => {
  const { report } = auditKunstProduksjonPraksisPhase4();
  assert.equal(report.subject.nextGate, 'remaining_domain_chapter_production');
  assert.equal(report.subject.canonicalDomainCount, 6);
  assert.equal(report.subject.canonicalEmneCount, 21);
  assert.equal(report.gates.incompleteSubjectStatusHonest, true);
});

test('Produksjon og praksis hydrerer alle synlige rendererfelt', async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));
  const chapterMeta = registry.subjects.kunst.chapters.find((chapter) => chapter.id === 'produksjon-og-praksis');
  const fetchFile = async (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const chapter = await CORE.hydrateChapter(chapterMeta, fetchFile);

  assert.equal(chapter.relatedPlaces.length, 4);
  assert.ok(chapter.relatedPlaces.every((place) => place.id && place.name && place.role));
  assert.equal(chapter.sources.length, 16);
  assert.ok(chapter.sources.every((source) => source.label && source.url));
  assert.equal(chapter.commonMisconceptions.length, 5);
  assert.ok(chapter.commonMisconceptions.every((item) => item.claim && item.correction));
});
