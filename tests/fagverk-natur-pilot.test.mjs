import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditNaturePilot } from '../scripts/audit-fagverk-natur-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Natur er auditert og redaksjonelt complete', () => {
  const { report } = auditNaturePilot();
  assert.equal(report.subject.id, 'natur');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'complete');
  assert.deepEqual(report.summary, {
    domainCount: 12,
    materializedEmneCount: 77,
    materializedMethodCount: 51,
    materializedMappingCount: 77,
    materializedHookCount: 136,
    registeredChapterCount: 12,
    preservedEnvironmentChapterCount: 6,
    requiredGapDomainCount: 0,
    partialDomainCount: 0,
    placeCount: 0
  });
});

test('Natur har ett inspectable kapittel for alle tolv canonicale fagområder', () => {
  const { report } = auditNaturePilot();
  assert.equal(report.canonicalDomainOrder.length, 12);
  assert.equal(report.chapters.length, 12);
  assert.equal(report.requiredGapDomains.length, 0);
  assert.equal(report.chapters.reduce((sum, chapter) => sum + chapter.emneCount, 0), 77);
  for (const chapter of report.chapters) {
    assert.ok(chapter.sectionCount >= 5);
    assert.ok(chapter.paragraphCount >= 15);
    assert.ok(chapter.conceptCount >= 8);
    assert.ok(chapter.sourceCount >= 3);
  }
});

test('Natur-merkesiden viser sluttfasen og alle tolv fagområder', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/natur/merke_natur (1).html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=natur/);
  assert.match(html, /77 materialiserte emner, 51 metoder og tolv redigerte kapitler/);
  assert.match(html, /Alle tolv canonicale Natur-områder er nå materialisert og auditert/);
  assert.match(html, /Sopp, lav og mikroorganismer/);
  assert.match(html, /Geologi og naturhistorie/);
});
