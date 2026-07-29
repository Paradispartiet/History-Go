import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditNaturePilot } from '../scripts/audit-fagverk-natur-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Natur er auditert og ærlig under utvidelse', () => {
  const { report } = auditNaturePilot();
  assert.equal(report.subject.id, 'natur');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'materialize_biology_and_inner_geology_domains');
  assert.deepEqual(report.summary, {
    domainCount: 12,
    materializedEmneCount: 35,
    materializedMethodCount: 30,
    materializedMappingCount: 35,
    materializedHookCount: 60,
    existingChapterCount: 6,
    requiredGapDomainCount: 6,
    partialDomainCount: 1,
    placeCount: 0
  });
});

test('Natur bevarer seks miljøkapitler og viser seks bindende hull', () => {
  const { report } = auditNaturePilot();
  assert.equal(report.canonicalDomainOrder.length, 12);
  assert.equal(report.chapters.length, 6);
  assert.equal(report.requiredGapDomains.length, 6);
  assert.equal(report.chapters.reduce((sum, chapter) => sum + chapter.emneCount, 0), 35);
  for (const chapter of report.chapters) {
    assert.ok(chapter.sectionCount >= 5);
    assert.ok(chapter.paragraphCount >= 15);
    assert.ok(chapter.conceptCount >= 8);
    assert.ok(chapter.sourceCount >= 3);
  }
});

test('Natur-merkesiden forklarer at faget ikke er heldekkende ennå', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/natur/merke_natur (1).html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=natur/);
  assert.match(html, /ikke et heldekkende Natur-fag ennå/);
  assert.match(html, /Artskunnskap og systematikk/);
  assert.match(html, /Organismebiologi og fysiologi/);
});
