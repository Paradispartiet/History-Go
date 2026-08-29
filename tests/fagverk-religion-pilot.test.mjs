import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditReligionPilot } from '../scripts/audit-fagverk-religion-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Religion bevarer foundation-piloten under pågående universitetsproduksjon', () => {
  const { report } = auditReligionPilot();
  assert.equal(report.subject.id, 'religion');
  assert.equal(report.subject.schemaFamily, 'foundation_v1');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'religion_concept_registry_and_final_completion_audit');
  assert.deepEqual(report.summary, {
    domainCount: 4,
    emneCount: 8,
    methodCount: 26,
    foundationMethodCount: 8,
    universityMethodCount: 18,
    mappingCount: 8,
    hookCount: 0,
    courseModuleCount: 3,
    registeredChapterCount: 0
  });
});

test('Religion bruker fagkartets områder og bevarer kursmoduler som progresjon', () => {
  const { report, model } = auditReligionPilot();
  assert.deepEqual(report.canonicalDomainOrder, ['hellige_rom', 'praksis_ritual', 'tradisjoner_historie', 'religion_samfunn']);
  assert.deepEqual(report.domainEmneCounts, {
    hellige_rom: 1,
    praksis_ritual: 2,
    tradisjoner_historie: 4,
    religion_samfunn: 1
  });
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'));
  assert.ok(model.emners.every((emne) => emne.methodIds.length === 2));
  assert.equal(report.gates.courseModulesRemainProgressionOnly, true);
  assert.equal(report.gates.respectfulRepresentationPrinciplesLocked, true);
});

test('Religion bevarer den gamle stubben som arkiv og bruker aktiv URL kun som compatibility-redirect', () => {
  const compatibility = fs.readFileSync(path.join(root, 'data/fag/religion/merke_religion.html'), 'utf8');
  const archive = fs.readFileSync(path.join(root, 'data/fag/religion/archive/merke_religion_legacy_20260828.html'), 'utf8');

  assert.match(compatibility, /location\.replace/);
  assert.match(compatibility, /fagverk\.html\?subject=religion#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibility, /fire fagområder, åtte emner og åtte metoder/);
  assert.doesNotMatch(compatibility, /dokumentert observasjon fra antakelser om tro/);

  assert.match(archive, /fagverk-forside\.html/);
  assert.match(archive, /fagverk\.html\?subject=religion/);
  assert.match(archive, /fire fagområder, åtte emner og åtte metoder/);
  assert.match(archive, /dokumentert observasjon fra antakelser om tro/);
});
