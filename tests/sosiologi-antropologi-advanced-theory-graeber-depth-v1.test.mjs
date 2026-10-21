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
const GRAEBER = ['adv09-credit-before-coin', 'adv09-moral-economy-debt', 'adv09-debt-power'];
const countWords = (value) => value.trim().split(/\s+/u).length;

test('Graeber prose distinguishes early credit, moral language and power, with historical caveats', () => {
  const work = canonical.works.find((row) => row.id === 'adv09-graeber-debt');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((row) => row.id), GRAEBER);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(countWords(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.ok(!unit.expanded_prose.includes(unit.misuse_guardrail), unit.id);
    assert.match(unit.expanded_prose, /tenkt|illustrasjon|eksempel/i, unit.id);
    const source = sources.get(unit.id);
    assert.equal(source?.work_id, work.id);
    assert.equal(source?.verification_status, 'fulltext_verified');
    assert.ok(source?.locator?.length > 90, unit.id);
    assert.ok(source?.evidence_url?.startsWith('https://'), unit.id);
  }
  assert.match(work.theory_units[0].expanded_prose, /Mesopotamia/);
  assert.match(work.theory_units[0].expanded_prose, /byttehandel/);
  assert.match(work.theory_units[1].expanded_prose, /moralsk forpliktelse/);
  assert.match(work.theory_units[1].expanded_prose, /rettferdighet/);
  assert.match(work.theory_units[2].expanded_prose, /krig, slaveri/);
  assert.match(work.theory_units[2].expanded_prose, /periodisering/);
  assert.match(sources.get('adv09-credit-before-coin').locator, /2010/);
  assert.match(sources.get('adv09-debt-power').locator, /2009/);
});

test('Graeber generator parity retains all 60 IDs, claim references and assessment units', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  assert.equal(packages.length, 7);
  const anthropology = packages.find((pkg) => pkg.domain_id === 'antropologisk_teori');
  assert.ok(anthropology, 'Graeber must remain in canonical anthropology domain');
  const work = canonical.works.find((row) => row.id === 'adv09-graeber-debt');
  const section = anthropology.module.sections.find((row) => row.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((row) => row.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, GRAEBER.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/antropologisk_teori.json');
  assert.deepEqual(overlay.works.find((row) => row.id === work.id).theory_units.map((row) => row.expanded_prose),
    work.theory_units.map((row) => row.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.assessment.questions.length, 0), 60);
  assert.deepEqual(anthropology.assessment.questions
    .filter((q) => GRAEBER.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id),
    GRAEBER.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
