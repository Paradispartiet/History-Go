import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository, buildBaselineReport } from '../scripts/audit-fagverk-subject-inventory.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

test('inventaret dekker hvert canonical fag og alle required core-filer', () => {
  const result = auditRepository();
  assert.equal(result.subjectCount, 18);
  assert.equal(result.coreFileAudit.length, 72);
  assert.equal(result.report.summary.schemaFamilyCount, 4);
});

test('statusregisteret tillater bare dokumentert fremdrift gjennom materialized og audited', () => {
  const status = readJson('data/fagverk/subject_status.json');
  const portal = readJson('data/fagverk/fagverk_portal.json');
  const portalById = new Map(portal.categories.map((item) => [item.id, item]));
  for (const subject of status.subjects) {
    const portalEntry = portalById.get(subject.id);
    assert.equal(subject.navigationStatus, portalEntry.subjectStatus);
    if (subject.editorialStatus !== 'not_started') {
      assert.equal(subject.navigationStatus, 'materialized');
      assert.equal(subject.assessmentStatus, 'audited');
    }
    if (subject.navigationStatus === 'planned') {
      assert.equal(subject.editorialStatus, 'not_started');
      assert.equal(portalEntry.subjectPage, '');
    }
  }
});

test('politikk er første audited structure-ready fag etter generell motor', () => {
  const status = readJson('data/fagverk/subject_status.json');
  const politics = status.subjects.find((subject) => subject.id === 'politikk');
  assert.equal(politics.navigationStatus, 'materialized');
  assert.equal(politics.assessmentStatus, 'audited');
  assert.equal(politics.editorialStatus, 'structure_ready');
  assert.equal(status.subjects.filter((subject) => subject.assessmentStatus === 'audited').length, 1);
});

test('baseline report er en deterministisk projeksjon av eide kilder', () => {
  const categories = readJson('data/categories/category_contract.json');
  const manifest = readJson('data/fag/fag_manifest.json');
  const inventory = readJson('data/fagverk/subject_inventory.json');
  const status = readJson('data/fagverk/subject_status.json');
  const committed = readJson('reports/fagverk/subject-baseline.json');
  assert.deepEqual(committed, buildBaselineReport({ categories, manifest, inventory, status }));
});

test('pilotsettet dekker alle fire erklærte schemafamilier', () => {
  const inventory = readJson('data/fagverk/subject_inventory.json');
  const pilots = inventory.subjects.filter((subject) => subject.pilot);
  assert.deepEqual(pilots.map((subject) => subject.id).sort(), ['by', 'natur', 'religion', 'teknologi']);
  assert.equal(new Set(pilots.map((subject) => subject.schemaFamily)).size, 4);
});
