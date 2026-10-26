import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const ARENDT = ['adv18-labor-work-action', 'adv18-plurality', 'adv18-natality'];
const wordCount = (s) => s.trim().split(/\s+/u).length;

test('Arendt distinguishes labor/work/action, plurality and natality', () => {
  const work = canonical.works.find((w) => w.id === 'adv18-arendt-human-condition');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((u) => u.id), ARENDT);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(wordCount(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.match(unit.expanded_prose, /tenkt|eksempel|konstruert/i, unit.id);
    assert.equal(sources.get(unit.id)?.work_id, work.id);
    assert.equal(sources.get(unit.id)?.verification_status, 'fulltext_verified');
    assert.match(sources.get(unit.id)?.evidence_url || '', /kuleuven\.be/);
    assert.match(sources.get(unit.id)?.locator || '', /1987/);
  }
  assert.match(work.theory_units[0].expanded_prose, /nødvendighet, varighet og politisk samhandling/);
  assert.match(work.theory_units[0].expanded_prose, /ikke om hvilken yrkestittel/);
  assert.match(work.theory_units[1].expanded_prose, /likeverdige deltakere/);
  assert.match(work.theory_units[1].expanded_prose, /ikke at alle kan komme til orde/);
  assert.match(work.theory_units[2].expanded_prose, /ny begynnelse/);
  assert.match(work.theory_units[2].expanded_prose, /ikke et mål på kreativitet/);
  assert.match(sources.get(ARENDT[0]).locator, /29–30/);
  assert.match(sources.get(ARENDT[1]).locator, /p\. 39/);
  assert.match(sources.get(ARENDT[2]).locator, /41–42/);
});

test('Arendt generator parity retains 20 works, 60 theory IDs, claims and assessments', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const target = packages.find((p) => p.domain_id === 'sosiologisk_teori');
  assert.ok(target);
  const work = canonical.works.find((w) => w.id === 'adv18-arendt-human-condition');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, ARENDT.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/sosiologisk_teori.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose), work.theory_units.map((u) => u.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, p) => n + p.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, p) => n + p.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => ARENDT.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id), ARENDT.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
