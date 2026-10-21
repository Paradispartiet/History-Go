import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const ROSA = ['adv11-technological-acceleration', 'adv11-social-change', 'adv11-pace-of-life'];
const wordCount = (text) => text.trim().split(/\s+/u).length;

test('Rosa distinguishes technology, changing institutions and measured versus felt pace', () => {
  const work = canonical.works.find((row) => row.id === 'adv11-rosa-social-acceleration');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((row) => row.id), ROSA);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(wordCount(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.match(unit.expanded_prose, /tenkt|eksempel|konstruert/i, unit.id);
    assert.equal(sources.get(unit.id)?.work_id, work.id);
    assert.equal(sources.get(unit.id)?.verification_status, 'fulltext_verified');
    assert.ok(sources.get(unit.id)?.locator.includes('pp.'), unit.id);
  }
  assert.match(work.theory_units[0].expanded_prose, /transport, kommunikasjon og produksjon/);
  assert.match(work.theory_units[0].expanded_prose, /tidsgevinster/);
  assert.match(work.theory_units[1].expanded_prose, /krympende nåtid/);
  assert.match(work.theory_units[1].expanded_prose, /dokumenterte tidsserier/);
  assert.match(work.theory_units[2].expanded_prose, /objektiv dimensjon/);
  assert.match(work.theory_units[2].expanded_prose, /subjektiv dimensjon/);
  assert.match(sources.get(ROSA[0]).locator, /97–107/);
  assert.match(sources.get(ROSA[1]).locator, /108–119/);
  assert.match(sources.get(ROSA[2]).locator, /120–148/);
});

test('Rosa generator parity preserves all 60 identity, claim and assessment bindings', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const target = packages.find((pkg) => pkg.domain_id === 'sosiologisk_teori');
  assert.ok(target);
  const work = canonical.works.find((row) => row.id === 'adv11-rosa-social-acceleration');
  const section = target.module.sections.find((row) => row.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((row) => row.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, ROSA.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/sosiologisk_teori.json');
  assert.deepEqual(overlay.works.find((row) => row.id === work.id).theory_units.map((row) => row.expanded_prose),
    work.theory_units.map((row) => row.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => ROSA.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id),
    ROSA.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
