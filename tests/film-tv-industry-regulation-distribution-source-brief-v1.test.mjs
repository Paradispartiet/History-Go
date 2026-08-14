import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isFilmTvUnitTenOrLaterGate } from '../scripts/audit-film-tv-industry-regulation-distribution-fulltext-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);

test('tiende planenhets kilde- og claimbrief forblir komplett gjennom senere fulltekstprogresjon', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_industry_regulation_distribution_source_claim_brief_v1.json');
  const sources = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_sources_v1.json',
    'source_files',
    'sources'
  );
  const cases = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_cases_v1.json',
    'case_files',
    'cases'
  );
  const topicBriefs = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_topic_claims_v1.json',
    'topic_claim_files',
    'topic_briefs'
  );
  const plannedClaims = topicBriefs.flatMap((topic) => topic.planned_claims);

  assert.equal(brief.status, 'source_claim_brief_complete_full_chapter_production');
  assert.equal(brief.scope.emne_count, 12);
  assert.equal(brief.proposed_module_order.length, 4);
  assert.equal(sources.length, 34);
  assert.equal(cases.length, 34);
  assert.equal(plannedClaims.length, 52);
  assert.deepEqual(
    topicBriefs.map((topic) => topic.planned_claims.length),
    [4, 5, 4, 4, 5, 4, 5, 4, 5, 4, 4, 4]
  );
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);
  assert.equal(plannedClaims.every((claim) => claim.status === 'planned_requires_fulltext_verification'), true);
});

test('alle kilde-, case- og claimreferanser er konkrete og resolvable', () => {
  const sources = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_sources_v1.json',
    'source_files',
    'sources'
  );
  const cases = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_cases_v1.json',
    'case_files',
    'cases'
  );
  const topicBriefs = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_topic_claims_v1.json',
    'topic_claim_files',
    'topic_briefs'
  );
  const sourceIds = new Set(sources.map((source) => source.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const usedSources = new Set([
    ...topicBriefs.flatMap((topic) => topic.source_ids),
    ...cases.flatMap((row) => row.source_ids)
  ]);
  const usedCases = new Set(topicBriefs.flatMap((topic) => topic.case_ids));

  assert.equal(sources.every((source) => /^https:\/\//.test(source.url) && source.source_location), true);
  assert.equal(sources.every((source) => usedSources.has(source.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal(topicBriefs.every((topic) => topic.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(topicBriefs.every((topic) => topic.case_ids.every((id) => caseIds.has(id))), true);
});

test('runtime kan stå på enhet-10-porten eller kjente senere porter, men aldri på en tidligere port', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const film = status.subjects.find((row) => row.id === 'film_tv');

  assert.equal(
    registry.subjects.film_tv.canonicalModel.tenthSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_source_claim_brief_v1.json'
  );
  assert.equal(isFilmTvUnitTenOrLaterGate(film.nextGate), true);
  assert.equal(
    isFilmTvUnitTenOrLaterGate('creative_work_technology_responsibility_full_chapter_complete_next_unit_source_brief'),
    false
  );
  assert.equal(
    isFilmTvUnitTenOrLaterGate('screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief'),
    false
  );
  assert.equal(
    registry.subjects.film_tv.chapters.some((row) => row.id === 'industri-regulering-og-distribusjon'),
    true
  );
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(
    new URL('../scripts/brief-film-tv-industry-regulation-distribution-sources-v1.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
