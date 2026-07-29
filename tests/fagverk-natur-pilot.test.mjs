import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditNaturePilot } from '../scripts/audit-fagverk-natur-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Natur er materialisert, auditert og redaksjonelt komplett', () => {
  const { report } = auditNaturePilot();
  assert.equal(report.subject.id, 'natur');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'editorial_maintenance');
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 35,
    methodCount: 30,
    mappingCount: 35,
    hookCount: 60,
    chapterCount: 6,
    coveredEmneCount: 35,
    placeCount: 0
  });
});

test('Natur har ett redigert kapittel per canonicalt fagområde', () => {
  const { report } = auditNaturePilot();
  assert.equal(report.chapters.length, 6);
  assert.deepEqual(report.chapters.map((chapter) => chapter.primaryDomainId), report.canonicalDomainOrder);
  assert.equal(report.chapters.reduce((sum, chapter) => sum + chapter.emneCount, 0), 35);
  for (const chapter of report.chapters) {
    assert.equal(chapter.sectionCount, 5);
    assert.equal(chapter.paragraphCount, 15);
    assert.ok(chapter.conceptCount >= 8);
    assert.ok(chapter.sourceCount >= 3);
  }
});

test('Natur-merkesiden tilbyr både Fagverket og den komplette fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/natur/merke_natur (1).html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=natur/);
});
