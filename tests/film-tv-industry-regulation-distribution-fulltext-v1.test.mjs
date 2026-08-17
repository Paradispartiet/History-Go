import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditFilmTvIndustryRegulationDistributionFulltextV1
} from '../scripts/audit-film-tv-industry-regulation-distribution-fulltext-v1.mjs';
import {
  buildFilmTvIndustryRegulationDistributionFulltextV1
} from '../scripts/materialize-film-tv-industry-regulation-distribution-fulltext-v1.mjs';

const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  }
  return true;
};

test('tiende planenhet er fulltekstregistrert med variabelt omfang og eksakt claimspor', () => {
  const report = auditFilmTvIndustryRegulationDistributionFulltextV1();
  assert.deepEqual(report.summary, {
    emne_count: 12,
    module_count: 4,
    section_count: 12,
    paragraph_count: 52,
    verified_claim_count: 52,
    used_source_count: 34,
    case_count: 34,
    method_count: report.summary.method_count
  });
  assert.ok(report.summary.method_count > 0);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('sluttclaimene har claimspesifikk evidens og bruker alle briefkilder', () => {
  const { claimsDoc, topicBriefs, sources } =
    buildFilmTvIndustryRegulationDistributionFulltextV1();
  const topicByClaim = new Map();
  for (const topic of topicBriefs) {
    for (const claim of topic.planned_claims) topicByClaim.set(claim.id, topic);
  }
  const used = new Set(claimsDoc.claims.flatMap((claim) => claim.source_ids));

  assert.equal(claimsDoc.claims.length, 52);
  assert.equal(new Set(claimsDoc.claims.map((claim) => claim.id)).size, 52);
  assert.equal(claimsDoc.claims.every((claim) => claim.source_ids.length > 0), true);
  assert.equal(
    claimsDoc.claims.some((claim) =>
      claim.source_ids.length < topicByClaim.get(claim.id).source_ids.length
    ),
    true
  );
  assert.equal(sources.every((source) => used.has(source.id)), true);
});

test('kapittelregistrering og fagstatus avanserer monotont til neste kildebrief', () => {
  const { registry, status, chapter } =
    buildFilmTvIndustryRegulationDistributionFulltextV1();
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const registered = registry.subjects.film_tv.chapters.find((row) => row.id === chapter.id);

  assert.equal(versionAtLeast(registry.version, '2.93.0'), true);
  assert.equal(versionAtLeast(status.version, '1.86.0'), true);
  assert.ok(registry.updatedAt >= '2026-08-14');
  assert.ok(status.updatedAt >= '2026-08-14');
  assert.equal(registered.file, 'data/fagverk/film_tv/industri-regulering-og-distribusjon.json');
  assert.equal(registered.claimsFile, 'data/fagverk/film_tv/industri-regulering-og-distribusjon/claims.json');
  assert.equal(
    registry.subjects.film_tv.canonicalModel.tenthSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_source_claim_brief_v1.json'
  );
  assert.equal([
    'industry_regulation_distribution_full_chapter_complete_next_unit_source_brief',
    'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit'
  ].includes(film.nextGate), true);
});

test('markeds-, plattform-, publikum-, rettighets- og reguleringsgrenser er eksplisitte', () => {
  const report = auditFilmTvIndustryRegulationDistributionFulltextV1();
  for (const gate of [
    'funding_boundary',
    'ownership_boundary',
    'platform_procedure_boundary',
    'audience_measurement_boundary',
    'rights_chain_boundary',
    'regulation_boundary',
    'format_boundary',
    'piracy_boundary',
    'reception_remains_next_unit'
  ]) {
    assert.equal(report.gates[gate], true, gate);
  }
});

test('materializer og audit inneholder ingen SCM-synk eller GitHub-push', () => {
  for (const relative of [
    '../scripts/materialize-film-tv-industry-regulation-distribution-fulltext-v1.mjs',
    '../scripts/audit-film-tv-industry-regulation-distribution-fulltext-v1.mjs'
  ]) {
    const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
  }
});
