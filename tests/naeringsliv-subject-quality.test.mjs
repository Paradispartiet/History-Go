import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditNaeringslivQuality } from '../scripts/audit-naeringsliv-subject-quality.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8'));

test('Økonomi og næringsliv validerer canonical fagpakke og registrerte kapitler', () => {
  const report = auditNaeringslivQuality();
  const chapters = registry.subjects.naeringsliv.chapters;
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.domainCount, 6);
  assert.equal(report.summary.emneCount, 38);
  assert.equal(report.summary.coreEmneCount, 36);
  assert.equal(report.summary.methodCount, 27);
  assert.equal(report.summary.academicTrackCount, 6);
  assert.equal(report.summary.professionalTrackCount, 5);
  assert.equal(report.summary.professionalModuleCount, 25);
  assert.equal(report.summary.totalLearningUnits, 61);
  assert.equal(report.summary.registeredChapterCount, chapters.length);
  assert.equal(report.summary.registeredDomainCount, 6);
  assert.equal(report.summary.coreChapterCount, 6);
  assert.equal(report.summary.specializationChapterCount, 6);
  assert.deepEqual(report.summary.chapterContent, { modules: 36, sections: 108, paragraphs: 324, claims: 422, sources: 185, workedExamples: 24, misconceptions: 60, applicationTasks: 36, selfCheck: 96, relatedPlaces: 72 });
  assert.equal(report.summary.registeredEmneCount, new Set(chapters.flatMap((chapter) => chapter.emne_ids)).size);
});
