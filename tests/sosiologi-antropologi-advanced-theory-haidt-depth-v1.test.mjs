import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const HAIDT = ['adv20-social-intuitionist', 'adv20-moral-foundations', 'adv20-groupishness'];
const wordCount = (s) => s.trim().split(/\s+/u).length;

test('Haidt distinguishes social intuitionism, evolving moral foundations and group cooperation', () => {
  const work = canonical.works.find((w) => w.id === 'adv20-haidt-righteous-mind');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((u) => u.id), HAIDT);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(wordCount(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.match(unit.expanded_prose, /tenkt|eksempel|konstruert/i, unit.id);
    assert.equal(sources.get(unit.id)?.work_id, work.id);
    assert.equal(sources.get(unit.id)?.verification_status, 'fulltext_verified');
    assert.match(sources.get(unit.id)?.evidence_url || '', /stern\.nyu\.edu/);
  }
  assert.match(work.theory_units[0].expanded_prose, /utestenger ikke|utelukker ikke/);
  assert.match(work.theory_units[0].expanded_prose, /etterrasjonalisering/);
  assert.match(work.theory_units[1].expanded_prose, /tidligere femdelt modell/);
  assert.match(work.theory_units[1].expanded_prose, /frihet og undertrykkelse/);
  assert.match(work.theory_units[1].expanded_prose, /sammenlignbarhet på tvers av kulturer/);
  assert.match(work.theory_units[2].expanded_prose, /hive psychology/);
  assert.match(work.theory_units[2].expanded_prose, /Gruppemedlemskap alene/);
  assert.match(sources.get(HAIDT[0]).locator, /2001/);
  assert.match(sources.get(HAIDT[1]).locator, /2009/);
  assert.match(sources.get(HAIDT[2]).locator, /2008/);
});

test('Full depth completion: 20 works, 60 expanded units, 60 claims, 60 assessments and generator parity', () => {
  const units = canonical.works.flatMap((w) => w.theory_units);
  assert.equal(canonical.works.length, 20);
  assert.equal(units.length, 60);
  assert.equal(new Set(units.map((u) => u.id)).size, 60);
  assert.equal(units.filter((u) => u.expanded_prose).length, 60);
  for (const unit of units) {
    assert.ok(wordCount(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
  }
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const target = packages.find((p) => p.domain_id === 'normer_identitet_hverdagsliv');
  assert.ok(target);
  const work = canonical.works.find((w) => w.id === 'adv20-haidt-righteous-mind');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, HAIDT.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/normer_identitet_hverdagsliv.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose), work.theory_units.map((u) => u.expanded_prose));
  assert.equal(packages.reduce((n, p) => n + p.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, p) => n + p.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => HAIDT.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id), HAIDT.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
