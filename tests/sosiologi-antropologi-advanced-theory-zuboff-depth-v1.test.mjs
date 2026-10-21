import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateSourceEvidence, buildOverlays, buildDomainPackages } from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const canon = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');
const IDS = ['adv12-behavioral-surplus', 'adv12-prediction-products', 'adv12-instrumentarian-power'];
const wordCount = (s) => s.trim().split(/\s+/u).length;

test('Zuboff texts explain three distinct concepts with empirical caveats and primary sources', () => {
  const work = canon.works.find((w) => w.id === 'adv12-zuboff-surveillance-capitalism');
  assert.ok(work);
  assert.deepEqual(work.theory_units.map((u) => u.id), IDS);
  const sources = new Map(evidence.evidence_units.map((row) => [row.theory_unit_id, row]));
  for (const u of work.theory_units) {
    assert.equal(typeof u.expanded_prose, 'string');
    assert.ok(wordCount(u.expanded_prose) >= 120, u.id);
    assert.ok(!u.expanded_prose.includes('behandles her som en analyseenhet'), u.id);
    assert.match(u.expanded_prose, /tenkt|eksempel/i, u.id);
    assert.equal(sources.get(u.id)?.work_id, work.id);
    assert.equal(sources.get(u.id)?.verification_status, 'fulltext_verified');
    assert.match(sources.get(u.id)?.evidence_url || '', /oru\.se/);
    assert.match(sources.get(u.id)?.locator || '', /2019/);
  }
  assert.match(work.theory_units[0].expanded_prose, /ikke en nøytral teknisk kategori/);
  assert.match(work.theory_units[1].expanded_prose, /Prediksjoner er usikre/);
  assert.match(work.theory_units[2].expanded_prose, /totalitær makt/);
  assert.match(work.theory_units[2].expanded_prose, /faktisk systemdesign/);
  assert.match(sources.get(IDS[0]).locator, /p\. 13/);
  assert.match(sources.get(IDS[1]).locator, /p\. 13/);
  assert.match(sources.get(IDS[2]).locator, /19–20/);
});

test('Zuboff generator parity retains all 60 theory IDs, claims and assessments', () => {
  const gate = evaluateSourceEvidence(canon, evidence);
  const packages = buildDomainPackages(buildOverlays(canon, contract), production, gate);
  const target = packages.find((p) => p.domain_id === 'digitalisering_vitenskap_teknologi_samfunn');
  assert.ok(target);
  const work = canon.works.find((w) => w.id === 'adv12-zuboff-surveillance-capitalism');
  const section = target.module.sections.find((s) => s.id === work.id);
  assert.deepEqual(section.paragraphs, work.theory_units.map((u) => u.expanded_prose));
  assert.deepEqual(section.paragraphClaimIds, IDS.map((id) => ['advclaim-' + id]));
  const overlay = read('data/fagverk/politikk/sosiologi_antropologi/advanced_theory/digitalisering_vitenskap_teknologi_samfunn.json');
  assert.deepEqual(overlay.works.find((w) => w.id === work.id).theory_units.map((u) => u.expanded_prose),
    work.theory_units.map((u) => u.expanded_prose));
  assert.equal(canon.works.length, 20);
  assert.equal(canon.works.reduce((n, w) => n + w.theory_units.length, 0), 60);
  assert.equal(canon.works.flatMap((w) => w.theory_units).filter((u) => u.expanded_prose).length, 60);
  assert.equal(packages.reduce((n, p) => n + p.claims.claims.length, 0), 60);
  assert.equal(packages.reduce((n, p) => n + p.assessment.questions.length, 0), 60);
  assert.deepEqual(target.assessment.questions.filter((q) => IDS.includes(q.id.replace(/^advq-/, ''))).map((q) => q.id),
    IDS.map((id) => 'advq-' + id));
  for (const pkg of packages) {
    assert.deepEqual(read(pkg.paths.module), pkg.module, 'Module drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.claims), pkg.claims, 'Claim drift: ' + pkg.domain_id);
    assert.deepEqual(read(pkg.paths.assessment), pkg.assessment, 'Assessment drift: ' + pkg.domain_id);
  }
});
