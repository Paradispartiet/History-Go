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
const OSTROM = ['adv08-common-pool-resources', 'adv08-design-principles', 'adv08-institutional-diversity'];
const countWords = (text) => text.trim().split(/\s+/u).length;

test('Ostrom prose distinguishes common-pool resources, design principles and polycentric arrangements', () => {
  const work = canonical.works.find((w) => w.id === 'adv08-ostrom-governing-commons');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((unit) => unit.id), OSTROM);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(countWords(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.ok(!unit.expanded_prose.includes(unit.misuse_guardrail), unit.id);
    assert.match(unit.expanded_prose, /tenkt|illustrer|eksempel/i, unit.id);
    const source = sources.get(unit.id);
    assert.equal(source?.work_id, work.id);
    assert.equal(source?.verification_status, 'fulltext_verified');
    assert.ok(source?.locator?.length > 70, unit.id);
    assert.ok(source?.evidence_url?.startsWith('https://'), unit.id);
  }
  assert.match(work.theory_units[0].expanded_prose, /uttak/);
  assert.match(work.theory_units[0].expanded_prose, /privatiseres|staten/);
  assert.match(work.theory_units[1].expanded_prose, /graderte sanksjoner/);
  assert.match(work.theory_units[1].expanded_prose, /sju prinsipper/);
  assert.match(work.theory_units[1].expanded_prose, /åttende/);
  assert.match(work.theory_units[2].expanded_prose, /polysentrisk styring/);
  assert.match(work.theory_units[2].expanded_prose, /offentlige myndigheter/);
  assert.match(sources.get('adv08-design-principles').locator, /1999/);
  assert.match(sources.get('adv08-institutional-diversity').locator, /2010/);
});

test('Ostrom generator parity preserves 60 source claims, theory identities and assessment questions', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  assert.equal(packages.length, 7);
  const target = packages.find((pkg) => pkg.domain_id === 'institusjoner_organisasjoner_arbeid_velferd');
  assert.ok(target);
  const work = canonical.works.find((w) => w.id === 'adv08-ostrom-governing-commons');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, OSTROM.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/institusjoner_organisasjoner_arbeid_velferd.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose),
    work.theory_units.map((u) => u.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, pkg) => n + pkg.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => OSTROM.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id),
    OSTROM.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
