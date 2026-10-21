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
const SCOTT = ['adv05-legibility', 'adv05-high-modernism', 'adv05-metis'];
const countWords = (text) => text.trim().split(/\s+/u).length;

test('Scott editorial prose differentiates legibility, high modernism and mētis', () => {
  const work = canonical.works.find((row) => row.id === 'adv05-scott-seeing-state');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((row) => row.id), SCOTT);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const unit of work.theory_units) {
    assert.equal(typeof unit.expanded_prose, 'string', unit.id);
    assert.ok(countWords(unit.expanded_prose) >= 120, unit.id);
    assert.ok(!unit.expanded_prose.includes('behandles her som en analyseenhet'), unit.id);
    assert.ok(!unit.expanded_prose.includes(unit.misuse_guardrail), unit.id);
    assert.match(unit.expanded_prose, /tenkt|illustrasjon/i, unit.id);
    const source = sources.get(unit.id);
    assert.equal(source?.work_id, work.id);
    assert.equal(source?.verification_status, 'fulltext_verified');
    assert.ok(source?.locator?.length > 90, unit.id);
    assert.ok(source?.evidence_url?.startsWith('https://'), unit.id);
  }
  assert.match(work.theory_units[0].expanded_prose, /kart|registre/);
  assert.match(work.theory_units[0].expanded_prose, /nødhjelp/);
  assert.match(work.theory_units[1].expanded_prose, /autoritær statsmakt/);
  assert.match(work.theory_units[1].expanded_prose, /sivilsamfunn/);
  assert.match(work.theory_units[2].expanded_prose, /mētis/);
  assert.match(work.theory_units[2].expanded_prose, /Lok(al|al praksis)|Lokal praksis/i);
  assert.match(sources.get('adv05-high-modernism').locator, /Chapter 3|High Modernism/);
  assert.notEqual(sources.get('adv05-high-modernism').evidence_url, sources.get('adv05-metis').evidence_url);
});

test('Scott generator parity retains all identities, claims and assessments in the established domain', () => {
  const gate = evaluateSourceEvidence(canonical, evidence);
  const packages = buildDomainPackages(buildOverlays(canonical, contract), production, gate);
  assert.equal(packages.length, 7);
  const target = packages.find((pkg) => pkg.domain_id === 'institusjoner_organisasjoner_arbeid_velferd');
  assert.ok(target, 'Scott must stay in the pre-existing institutional domain');
  const work = canonical.works.find((row) => row.id === 'adv05-scott-seeing-state');
  const section = target.module.sections.find((row) => row.id === work.id);
  assert.ok(section);
  assert.deepEqual(section.paragraphs, work.theory_units.map((row) => row.expanded_prose));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/institusjoner_organisasjoner_arbeid_velferd.json');
  assert.deepEqual(overlay.works.find((row) => row.id === work.id).theory_units.map((row) => row.expanded_prose),
    work.theory_units.map((row) => row.expanded_prose));
  assert.equal(canonical.works.length, 20);
  assert.equal(canonical.works.reduce((sum, row) => sum + row.theory_units.length, 0), 60);
  assert.equal(canonical.works.flatMap((row) => row.theory_units).filter((row) => row.expanded_prose).length, 60);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((sum, pkg) => sum + pkg.assessment.questions.length, 0), 60);
  assert.deepEqual(section.paragraphClaimIds, SCOTT.map((id) => ['advclaim-' + id]));
  assert.deepEqual(target.assessment.questions.filter((row) => SCOTT.includes(row.id.replace(/^advq-/, ''))).map((row) => row.id),
    SCOTT.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
