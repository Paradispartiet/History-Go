import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository, buildBaselineReport } from '../scripts/audit-fagverk-subject-inventory.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

test('phase 0 inventory covers every canonical subject and required core file', () => {
  const result = auditRepository();
  assert.equal(result.subjectCount, 18);
  assert.equal(result.coreFileAudit.length, 72);
  assert.equal(result.report.summary.schemaFamilyCount, 4);
});

test('phase 0 baseline never pre-approves structural or editorial completion', () => {
  const status = readJson('data/fagverk/subject_status.json');
  for (const subject of status.subjects) {
    assert.equal(subject.assessmentStatus, 'pending');
    assert.equal(subject.editorialStatus, 'not_started');
  }
});

test('baseline report is a deterministic projection of owned sources', () => {
  const categories = readJson('data/categories/category_contract.json');
  const manifest = readJson('data/fag/fag_manifest.json');
  const inventory = readJson('data/fagverk/subject_inventory.json');
  const status = readJson('data/fagverk/subject_status.json');
  const committed = readJson('reports/fagverk/subject-baseline.json');
  assert.deepEqual(committed, buildBaselineReport({ categories, manifest, inventory, status }));
});

test('pilot set covers all four declared schema families', () => {
  const inventory = readJson('data/fagverk/subject_inventory.json');
  const pilots = inventory.subjects.filter((subject) => subject.pilot);
  assert.deepEqual(pilots.map((subject) => subject.id).sort(), ['by', 'natur', 'religion', 'teknologi']);
  assert.equal(new Set(pilots.map((subject) => subject.schemaFamily)).size, 4);
});
