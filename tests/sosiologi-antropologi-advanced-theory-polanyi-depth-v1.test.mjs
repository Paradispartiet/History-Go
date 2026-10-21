import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const POLANYI = ['adv17-embeddedness', 'adv17-fictitious-commodities', 'adv17-double-movement'];
const wordCount = (s) => s.trim().split(/\s+/u).length;

test('Polanyi distinguishes embeddedness, fictitious commodities and double movement', () => {
  const work = canonical.works.find((w) => w.id === 'adv17-polanyi-great-transformation');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((u) => u.id), POLANYI);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(wordCount(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.match(unit.expanded_prose, /tenkt|eksempel|konstruert/i, unit.id);
    assert.equal(sources.get(unit.id)?.work_id, work.id);
    assert.equal(sources.get(unit.id)?.verification_status, 'fulltext_verified');
    assert.match(sources.get(unit.id)?.evidence_url || '', /^https:/);
  }
  assert.match(work.theory_units[0].expanded_prose, /gjensidighet og omfordeling/);
  assert.match(work.theory_units[0].expanded_prose, /ikke at alle eldre samfunn var harmoniske/);
  assert.match(work.theory_units[1].expanded_prose, /arbeid, jord og penger/);
  assert.match(work.theory_units[1].expanded_prose, /ordinære varer/);
  assert.match(work.theory_units[2].expanded_prose, /motstridende interesser/);
  assert.match(work.theory_units[2].expanded_prose, /autoritære politiske prosjekter/);
  assert.match(sources.get(POLANYI[0]).locator, /46–49/);
  assert.match(sources.get(POLANYI[1]).locator, /Chapter 6/);
  assert.match(sources.get(POLANYI[2]).locator, /130–133/);
});

test('Polanyi generator parity retains 20 works, 60 theories, claims and assessment bindings', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const target = packages.find((p) => p.domain_id === 'sosiologisk_teori');
  assert.ok(target);
  const work = canonical.works.find((w) => w.id === 'adv17-polanyi-great-transformation');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, POLANYI.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/sosiologisk_teori.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose), work.theory_units.map((u) => u.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, p) => n + p.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, p) => n + p.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => POLANYI.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id), POLANYI.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
