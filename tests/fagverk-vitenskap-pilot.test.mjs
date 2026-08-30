import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditVitenskapPilot } from '../scripts/audit-fagverk-vitenskap-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Vitenskap-piloten låser canonical v4.6 og fortsatt kapittelproduksjon', () => {
  const { report } = auditVitenskapPilot();
  assert.equal(report.subject.id, 'vitenskap');
  assert.ok(['chapters_in_progress', 'complete'].includes(report.subject.editorialStatus));
  assert.ok(['final_holistic_university_breadth_completion_audit', 'maintenance_source_refresh_and_place_case_expansion'].includes(report.subject.nextGate));
  assert.ok(report.subject.registeredChapterCount >= 5);
  assert.deepEqual(report.inventory, {
    domainCount: 6,
    emneCount: 117,
    methodCount: 84,
    mappingCount: 117,
    topicHookCount: 64
  });
  assert.equal(report.gates.canonicalModelV46, true);
  assert.equal(report.gates.exactInventoryLocked, true);
  assert.equal(report.gates.editorialStatusChaptersInProgress, true);
  assert.equal(report.gates.chapterProgressionMonotone, true);
  assert.equal(report.gates.registeredChapterPresent, true);
});

test('alle 117 Vitenskap-emner har unik canonical mapping og generatoren bruker v4.6', () => {
  const { report, pensum, mappings } = auditVitenskapPilot();
  assert.equal(pensum.domains.length, 6);
  assert.equal(mappings.length, 117);
  assert.equal(new Set(mappings.map((row) => row.emne_id)).size, 117);
  assert.equal(report.gates.allMappingsUnique, true);
  assert.equal(report.gates.generatorUsesCanonicalV46, true);
});

test('Teknologi forblir nested spesialisering under Vitenskap', () => {
  const { report } = auditVitenskapPilot();
  assert.deepEqual(report.technology, {
    canonicalParentSubject: 'vitenskap',
    topLevelSubject: false,
    areaCount: 12,
    topicCount: 48,
    methodCount: 35,
    hookCount: 36
  });
  assert.equal(report.gates.technologyRemainsNested, true);
});

test('Vitenskap-merke-URL-en er compatibility redirect til integrert Progresjon', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/vitenskap/merke_vitenskap (2).html'), 'utf8');
  assert.match(html, /location\.replace/);
  assert.match(html, /fagverk\.html\?subject=vitenskap#fagverkIaProgresjon/);
  assert.doesNotMatch(html, /fagverk-forside\.html|Åpne Vitenskap-faget|merke-blokk|emner-vitenskap/i);
  assert.doesNotMatch(html, /fagverk\.html\?subject=teknologi/);
});
