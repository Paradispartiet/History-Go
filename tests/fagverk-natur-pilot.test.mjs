import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditNaturePilot } from '../scripts/audit-fagverk-natur-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Natur er individuelt materialisert gjennom standard canonical-adapteren', () => {
  const { report } = auditNaturePilot();
  assert.equal(report.subject.id, 'natur');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'structure_ready');
  assert.deepEqual(report.summary, {
    domainCount: 6,
    emneCount: 35,
    methodCount: 30,
    mappingCount: 35,
    hookCount: 60,
    chapterCount: 0,
    placeCount: 0
  });
});

test('Natur-merkesiden tilbyr både Fagverket og den materialiserte fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/natur/merke_natur (1).html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=natur/);
});
