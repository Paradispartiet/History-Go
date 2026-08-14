import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditFilosofiPhase3 } from '../scripts/audit-fagverk-filosofi-phase3.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Filosofi er individuelt materialisert og auditert som komplett Fase 3-fag etter 54 av 54 universitetsreviews', () => {
  const { report } = auditFilosofiPhase3();
  assert.equal(report.subject.id, 'filosofi');
  assert.equal(report.subject.schemaFamily, 'foundation_v1');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.navigationStatus, 'materialized');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(report.subject.subjectPage, 'fagverk.html?subject=filosofi');
  assert.equal(report.subject.badgePage, 'data/fag/filosofi/merke_filosofi.html');
  assert.deepEqual(report.summary, {
    domainCount: 13,
    emneCount: 54,
    methodCount: 27,
    mappingCount: 54,
    hookCount: 37,
    courseModuleCount: 13,
    conceptCount: 162,
    thinkerCount: 157,
    activeThinkerCount: 149,
    contextualThinkerCount: 8,
    registeredChapterCount: 13
  });
});

test('Filosofi beholder tretten fagkart-eide områder og pensum som progresjonslag', () => {
  const { report, model } = auditFilosofiPhase3();
  assert.deepEqual(report.canonicalDomainOrder, [
    'argumentasjon_logikk',
    'erkjennelse_sannhet',
    'metafysikk_virkelighet',
    'sinn_bevissthet_identitet',
    'etikk_moralpsykologi',
    'politisk_filosofi_rettferdighet',
    'sosial_filosofi_makt',
    'estetikk_fortolkning',
    'vitenskapsfilosofi',
    'teknologi_ai',
    'eksistens_fenomenologi',
    'miljo_dyr_klima',
    'globale_tradisjoner'
  ]);
  assert.ok(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'));
  assert.equal(Object.values(report.domainEmneCounts).reduce((sum, count) => sum + count, 0), 54);
  assert.equal(report.gates.courseModulesRemainProgressionOnly, true);
});

test('Filosofi løser emner, metoder, hooks, begreper og teoretikere', () => {
  const { report, model } = auditFilosofiPhase3();
  assert.equal(model.emners.length, 54);
  assert.equal(report.gates.allActiveEmnersMapped, true);
  assert.equal(report.gates.allCourseModulesCoverCanonicalEmners, true);
  assert.equal(report.gates.allMethodReferencesResolved, true);
  assert.equal(report.gates.allConceptReferencesResolved, true);
  assert.equal(report.gates.allThinkerReferencesResolved, true);
});

test('Filosofi låser argument-first, kildekrav, global kanon og konsistent sluttstatus', () => {
  const { report } = auditFilosofiPhase3();
  assert.equal(report.gates.philosophyPrinciplesLocked, true);
  assert.equal(report.gates.chapterClaimsNotOverstated, true);
  assert.equal(report.gates.editorialLifecycleConsistent, true);
});

test('Filosofi-merkesiden skiller merket fra fagsiden', () => {
  const html = fs.readFileSync(path.join(root, 'data/fag/filosofi/merke_filosofi.html'), 'utf8');
  assert.match(html, /fagverk-forside\.html/);
  assert.match(html, /fagverk\.html\?subject=filosofi/);
  assert.match(html, /Åpne Filosofi-faget/);
});