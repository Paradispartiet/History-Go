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

const GOFFMAN = [
  'adv02-dramaturgy',
  'adv02-impression-management',
  'adv02-teams',
];
const wordCount = (value) => value.trim().split(/\s+/u).length;

test('three Goffman theory explanations contain source-bound substantial editorial prose', () => {
  const work = canonical.works.find((entry) => entry.id === 'adv02-goffman-presentation');
  assert.ok(work, 'Canonical Goffman work must exist');
  assert.deepEqual(work.theory_units.map((unit) => unit.id), GOFFMAN);

  const proof = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(wordCount(unit.expanded_prose) >= 110, `Substantive explanation missing: ${unit.id}`);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.ok(unit.expanded_prose.includes(unit.misuse_guardrail) === false, 'Use prose to explain limitations, not template the guardrail');
    assert.equal(proof.get(unit.id)?.work_id, work.id);
    assert.equal(proof.get(unit.id)?.verification_status, 'fulltext_verified');
    assert.match(proof.get(unit.id)?.evidence_url ?? '', /^https:\/\/web\.mit\.edu\/curhan\//);
    assert.ok(proof.get(unit.id)?.locator?.length > 40);
  }
});

test('Goffman prose is generator-owned and leaves all other theory units invariant', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const overlays = buildOverlays(canonical, contract);
  const packages = buildDomainPackages(overlays, production, gate);
  assert.equal(packages.length, 7);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.assessment.questions.length, 0), 60);
  const selected = packages.find((pkg) => pkg.domain_id === 'sosiologisk_teori');
  assert.ok(selected);
  const section = selected.module.sections.find((row) => row.id === 'adv02-goffman-presentation');
  assert.ok(section);
  assert.deepEqual(section.paragraphs, canonical.works.find((row) => row.id === 'adv02-goffman-presentation').theory_units.map((row) => row.expanded_prose));
  assert.deepEqual(read(selected.paths.module), selected.module, 'Generator-owned module must match');
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, `Claim drift: ${pkg.domain_id}`);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, `Assessment drift: ${pkg.domain_id}`);
  }
});
