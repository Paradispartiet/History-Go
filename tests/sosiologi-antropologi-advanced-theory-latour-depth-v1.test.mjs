import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const LATOUR = ['adv15-trace-associations', 'adv15-mediators', 'adv15-nonhuman-actants'];
const wordCount = (s) => s.trim().split(/\s+/u).length;

test('Latour distinguishes tracing associations, mediators and nonhuman actants', () => {
  const work = canonical.works.find((w) => w.id === 'adv15-latour-reassembling-social');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((u) => u.id), LATOUR);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(wordCount(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.match(unit.expanded_prose, /tenkt|eksempel|konstruert/i, unit.id);
    assert.equal(sources.get(unit.id)?.work_id, work.id);
    assert.equal(sources.get(unit.id)?.verification_status, 'fulltext_verified');
    assert.match(sources.get(unit.id)?.evidence_url || '', /bruno-latour\.fr/);
  }
  assert.match(work.theory_units[0].expanded_prose, /observerbare spor og transformasjoner/);
  assert.match(work.theory_units[0].expanded_prose, /ikke at makt, institusjoner eller sosiale strukturer er uvirkelige/);
  assert.match(work.theory_units[1].expanded_prose, /to varige klasser/);
  assert.match(work.theory_units[1].expanded_prose, /oversettelser og transformasjoner/);
  assert.match(work.theory_units[2].expanded_prose, /ikke at en dør har ønsker/);
  assert.match(work.theory_units[2].expanded_prose, /ansvarsforhold/);
  assert.match(sources.get(LATOUR[0]).locator, /69–71/);
  assert.match(sources.get(LATOUR[1]).locator, /69–70/);
  assert.match(sources.get(LATOUR[2]).locator, /72–73/);
});

test('Latour generator parity preserves 20 works, 60 theory IDs, claims and assessments', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const target = packages.find((p) => p.domain_id === 'sosiologisk_teori');
  assert.ok(target);
  const work = canonical.works.find((w) => w.id === 'adv15-latour-reassembling-social');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, LATOUR.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/sosiologisk_teori.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose), work.theory_units.map((u) => u.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, p) => n + p.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, p) => n + p.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => LATOUR.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id), LATOUR.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
