import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { audit, REQUIRED_WORK_IDS } from '../scripts/audit-sosiologi-antropologi-advanced-theory-reading-canon-v1.mjs';
import { buildOverlays } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

test('Sosiologi og antropologi har et eksplisitt avansert teorikanon med komplette domenebindinger uten å late som fulltekst er materialisert', () => {
  const report = audit();
  assert.equal(report.subject_id, 'politikk');
  assert.equal(report.canonical_subcategory_id, 'sosiologi_antropologi');
  assert.equal(report.status, 'canonical_source_and_theory_mapping_complete_fulltext_materialization_pending');
  assert.equal(report.counts.works, 20);
  assert.equal(report.counts.allowedDomains, 12);
  assert.equal(report.counts.allowedCrossSubjects, 13);
  assert.equal(report.counts.theoryUnits, 60);
  assert.equal(report.counts.boundWorks, 20);
  assert.equal(report.counts.boundTheoryUnits, 60);
  assert.equal(report.domainBindings.status, 'secondary_bindings_complete_fulltext_refresh_pending');
  assert.equal(REQUIRED_WORK_IDS.length, 20);
  assert.equal(report.counts.existingOrExtendingCoverage, 2);
  assert.equal(report.counts.gaps, 18);
  assert.ok(Object.values(report.domainBindings.gates).every(Boolean));
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.passed, true);
});

test('advanced theory maintenance materializer covers the real canon without adding domains or dropping source guardrails', () => {
  const canon = JSON.parse(fs.readFileSync('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json', 'utf8'));
  const contract = JSON.parse(fs.readFileSync('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json', 'utf8'));
  const overlays = buildOverlays(canon, contract);
  const works = overlays.flatMap((overlay) => overlay.works);
  const units = works.flatMap((work) => work.theory_units);
  assert.equal(overlays.length, 7);
  assert.equal(works.length, 20);
  assert.equal(units.length, 60);
  assert.deepEqual(overlays.map((overlay) => overlay.domain_id).sort(), [
    'antropologisk_teori',
    'digitalisering_vitenskap_teknologi_samfunn',
    'institusjoner_organisasjoner_arbeid_velferd',
    'normer_identitet_hverdagsliv',
    'sosiologisk_teori',
    'sted_by_migrasjon_transnasjonalitet',
    'ulikhet_klasse_kjonn_rasialisering'
  ]);
  assert.equal(works.every((work) => typeof work.source_url === 'string' && work.source_url.startsWith('https://')), true);
  assert.equal(units.every((unit) => unit.summary && unit.analytic_question && unit.misuse_guardrail), true);
  assert.equal(new Set(works.map((work) => work.id)).size, 20);
  assert.equal(new Set(units.map((unit) => unit.id)).size, 60);
});

test('phase 3 materializes paragraphs, claim trace and assessment while keeping runtime claims pending', async () => {
  const materializer = await import('../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs');
  assert.equal(typeof materializer.buildDomainPackages, 'function', 'phase 3 domain package builder must exist');
  const canon = JSON.parse(fs.readFileSync('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json', 'utf8'));
  const contract = JSON.parse(fs.readFileSync('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json', 'utf8'));
  const production = JSON.parse(fs.readFileSync('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json', 'utf8'));
  const overlays = materializer.buildOverlays(canon, contract);
  const packages = materializer.buildDomainPackages(overlays, production);
  assert.equal(packages.length, 7);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.module.sections.length, 0), 20);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.module.sections.flatMap((section) => section.paragraphs).length, 0), 60);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.assessment.questions.length, 0), 60);
  assert.equal(packages.every((pkg) => pkg.claims.status === 'fulltext_verification_pending'), true);
  assert.equal(packages.every((pkg) => pkg.assessment.status === 'claim_verification_pending'), true);
  assert.equal(packages.every((pkg) => typeof pkg.target.chapter === 'string' && pkg.target.chapter.endsWith('.json')), true);
  const claims = packages.flatMap((pkg) => pkg.claims.claims);
  const claimIds = claims.map((claim) => claim.id);
  assert.equal(new Set(claimIds).size, 60);
  assert.equal(claims.every((claim) => claim.status === 'planned_requires_fulltext_verification'), true);
  const questions = packages.flatMap((pkg) => pkg.assessment.questions);
  assert.equal(questions.every((question) => claimIds.includes(question.claim_id)), true);
});
