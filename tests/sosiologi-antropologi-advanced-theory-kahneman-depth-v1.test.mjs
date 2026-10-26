import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const canonical = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const KAHNEMAN = ['adv19-system1-system2', 'adv19-heuristics-biases', 'adv19-prospect-theory'];
const wordCount = (s) => s.trim().split(/\s+/u).length;

test('Kahneman distinguishes explanatory systems, decision heuristics and prospect theory', () => {
  const work = canonical.works.find((w) => w.id === 'adv19-kahneman-thinking-fast-slow');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((u) => u.id), KAHNEMAN);
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
  assert.match(work.theory_units[0].expanded_prose, /oppdiktede karakterer/);
  assert.match(work.theory_units[0].expanded_prose, /ikke to atskilte hjerneområder/);
  assert.match(work.theory_units[1].expanded_prose, /representativitet, tilgjengelighet og justering fra et anker/);
  assert.match(work.theory_units[1].expanded_prose, /nyere og kontekstspesifikk evidens/);
  assert.match(work.theory_units[2].expanded_prose, /referansepunkt/);
  assert.match(work.theory_units[2].expanded_prose, /ikke en universell konstant/);
  assert.match(work.theory_units[2].expanded_prose, /priming-påstander/);
  assert.match(sources.get(KAHNEMAN[0]).locator, /Chapter 1/);
  assert.match(sources.get(KAHNEMAN[1]).locator, /1974/);
  assert.match(sources.get(KAHNEMAN[2]).locator, /1979/);
});

test('Kahneman generator parity preserves 20 works, all 60 theory IDs, claims and assessments', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  const target = packages.find((p) => p.domain_id === 'normer_identitet_hverdagsliv');
  assert.ok(target);
  const work = canonical.works.find((w) => w.id === 'adv19-kahneman-thinking-fast-slow');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, KAHNEMAN.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/normer_identitet_hverdagsliv.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose), work.theory_units.map((u) => u.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, p) => n + p.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, p) => n + p.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => KAHNEMAN.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id), KAHNEMAN.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
