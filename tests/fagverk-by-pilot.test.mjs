import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditByPilot } from '../scripts/audit-fagverk-by-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('By er materialisert, auditert og komplett som compatibility-fag', () => {
  const { report } = auditByPilot();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.schemaFamily, 'by_compatibility');
  assert.equal(report.subject.adapter, 'by');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.deepEqual(report.summary, {
    domainCount: 12,
    emneCount: 82,
    activeEmneCount: 74,
    methodCount: 14,
    mappingCount: 82,
    hookCount: 81,
    courseModuleCount: 7,
    curriculumModuleCount: 8,
    registeredChapterCount: 17
  });
});

test('By bruker bare fagkartets tolv områder og dekker alle source-emner', () => {
  const { report, model } = auditByPilot();
  assert.deepEqual(report.canonicalDomainOrder, [
    'byliv', 'arkitektur', 'bolig_og_nabolag', 'administrasjon_og_plan',
    'urbanisme', 'arbeid_og_naering', 'historiske_lag', 'makt_og_konflikt',
    'klima_og_helse', 'data_og_styring', 'regional_og_global', 'boligpolitikk_og_velferd'
  ]);
  assert.equal(Object.values(report.primaryDomainEmneCounts).reduce((sum, count) => sum + count, 0), 82);
  assert.deepEqual(report.emneStatusCounts, { active: 74, core: 4, planned: 4 });
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'));
  assert.equal(report.gates.noSyntheticCompatibilityDomains, true);
  assert.equal(report.gates.allSourceEmnersMapped, true);
  assert.equal(report.gates.courseAndCurriculumModulesRemainProgressionOnly, true);
  assert.equal(report.gates.byPlaceFallbackCorrected, true);
});

test('By-merkesiden er en ren compatibility-rute til materialisert Progresjon', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/by/merke_by.html'), 'utf8');
  assert.match(html, /location\.replace\(target\)/);
  assert.match(html, /fagverk\.html\?subject=by#fagverkIaProgresjon/);
  assert.doesNotMatch(html, /merke-blokk|<h2>1\. Felt<\/h2>|id="begreper"/i);
});
