import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  evaluateSourceEvidence,
  buildOverlays,
  buildDomainPackages,
} from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const canon = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');

const ids = ['adv01-taste-distinction', 'adv01-cultural-capital', 'adv01-classificatory-struggle'];
const sourcePaths = {
  'adv01-taste-distinction': '/Bourdieu_Distinction.pdf',
  'adv01-cultural-capital': '/Bourdieu-The-Forms-of-Capital.pdf',
  'adv01-classificatory-struggle': '/BourdieuPower.pdf',
};
const countWords = (text) => text.trim().split(/\s+/u).length;

test('Bourdieu explanations are substantive, distinguish source works and guard against class stereotypes', () => {
  const work = canon.works.find((w) => w.id === 'adv01-bourdieu-distinction');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((unit) => unit.id), ids);
  const source = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(countWords(unit.expanded_prose) >= 120, `Short or missing explanation: ${unit.id}`);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.ok(!unit.expanded_prose.includes(unit.misuse_guardrail), `Avoid templating guardrail: ${unit.id}`);
    const row = source.get(unit.id);
    assert.equal(row?.work_id, work.id);
    assert.equal(row?.verification_status, 'fulltext_verified');
    assert.ok(row.evidence_url?.startsWith('https://'));
    assert.ok(new URL(row.evidence_url).pathname.endsWith(sourcePaths[unit.id]), unit.id);
    assert.ok(row.locator?.length > 60, unit.id);
  }
  assert.match(work.theory_units[1].expanded_prose, /1986/);
  assert.match(work.theory_units[2].expanded_prose, /1989/);
});

test('generator-owned Bourdieu module is reproducible and all 60 theory ids retain their claims and assessments', () => {
  const gate = evaluateSourceEvidence(canon, evidence);
  const packages = buildDomainPackages(buildOverlays(canon, contract), production, gate);
  const work = canon.works.find((w) => w.id === 'adv01-bourdieu-distinction');
  const sociology = packages.find((pkg) => pkg.domain_id === 'sosiologisk_teori');
  assert.equal(packages.length, 7);
  assert.ok(sociology);
  const section = sociology.module.sections.find((entry) => entry.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(read(sociology.paths.module), sociology.module);
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/sosiologisk_teori.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id)?.theory_units.map((u) => u.expanded_prose),
    work.theory_units.map((u) => u.expanded_prose));
  assert.equal(packages.reduce((n, pkg) => n + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.assessment.questions.length, 0), 60);
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, `Claim drift in ${pkg.domain_id}`);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, `Assessment drift in ${pkg.domain_id}`);
  }
});
