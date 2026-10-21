import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const JACOBS = ['adv13-eyes-street', 'adv13-mixed-uses', 'adv13-urban-grain'];
const wordCount = (s) => s.trim().split(/\s+/u).length;

test('Jacobs paragraphs distinguish street observation, mixed primary uses and short blocks', () => {
  const work = canonical.works.find((w) => w.id === 'adv13-jacobs-death-life');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((u) => u.id), JACOBS);
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
  assert.match(work.theory_units[0].expanded_prose, /grenser mellom offentlige og private rom/);
  assert.match(work.theory_units[0].expanded_prose, /ikke en garanti/);
  assert.match(work.theory_units[1].expanded_prose, /primærfunksjoner/);
  assert.match(work.theory_units[1].expanded_prose, /ikke automatisk sosial blanding/);
  assert.match(work.theory_units[2].expanded_prose, /to forskjellige betingelser/);
  assert.match(work.theory_units[2].expanded_prose, /leiekostnader/);
  assert.match(sources.get(JACOBS[0]).locator, /107–109/);
  assert.match(sources.get(JACOBS[1]).locator, /150–153/);
  assert.match(sources.get(JACOBS[2]).locator, /178–186/);
});

test('Jacobs generator parity preserves 20 works, 60 IDs, claims and assessments', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const target = packages.find((p) => p.domain_id === 'sted_by_migrasjon_transnasjonalitet');
  assert.ok(target);
  const work = canonical.works.find((w) => w.id === 'adv13-jacobs-death-life');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, JACOBS.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/sted_by_migrasjon_transnasjonalitet.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose),
    work.theory_units.map((u) => u.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, p) => n + p.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, p) => n + p.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => JACOBS.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id),
    JACOBS.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
