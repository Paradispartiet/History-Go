import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  evaluateSourceEvidence,
  buildOverlays,
  buildDomainPackages,
} from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const ELIAS = ['adv03-sociogenesis-psychogenesis', 'adv03-monopoly-formation', 'adv03-interdependence'];
const countWords = (value) => value.trim().split(/\s+/u).length;

test('Elias editorial prose is substantial, source-traced and differentiates all three theories', () => {
  const work = canonical.works.find((entry) => entry.id === 'adv03-elias-civilizing-process');
  assert.ok(work, 'The canonical Elias work must exist');
  assert.deepEqual(work.theory_units.map((unit) => unit.id), ELIAS);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(countWords(unit.expanded_prose) >= 120, 'Insufficient editorial explanation for ' + unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.ok(!unit.expanded_prose.includes(unit.misuse_guardrail), 'Do not paste template guardrail for ' + unit.id);
    assert.match(unit.expanded_prose, /tenkt|analytisk eksempel|illustrasjons|hypotetisk/i, 'Separate illustrative examples from historical evidence: ' + unit.id);
    const source = sources.get(unit.id);
    assert.equal(source?.work_id, work.id);
    assert.equal(source?.verification_status, 'fulltext_verified');
    assert.ok(source?.locator?.length > 90, unit.id);
    assert.ok(source?.evidence_url?.startsWith('https://'), unit.id);
  }
  assert.match(work.theory_units[0].expanded_prose, /selvkontroll|selvregulering/);
  assert.match(work.theory_units[1].expanded_prose, /skatt/);
  assert.match(work.theory_units[1].expanded_prose, /militær|voldsmakt/);
  assert.match(work.theory_units[2].expanded_prose, /gjensidig avhengighet/);
});

test('Elias generator-owned module and overlay preserve every source claim, assessment and identity', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const work = canonical.works.find((entry) => entry.id === 'adv03-elias-civilizing-process');
  assert.equal(packages.length, 7);
  const sociology = packages.find((pkg) => pkg.domain_id === 'sosiologisk_teori');
  assert.ok(sociology);
  const section = sociology.module.sections.find((entry) => entry.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((unit) => unit.expanded_prose));
  assert.deepEqual(read(sociology.paths.module), sociology.module, 'Generator-owned module drift');
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/sosiologisk_teori.json');
  assert.deepEqual(overlay.works.find((entry) => entry.id === work.id)?.theory_units.map((unit) => unit.expanded_prose),
    work.theory_units.map((unit) => unit.expanded_prose));
  assert.equal(packages.reduce((n, pkg) => n + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.assessment.questions.length, 0), 60);
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift in ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift in ' + pkg.domain_id);
  }
});
