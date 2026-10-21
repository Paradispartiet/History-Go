import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const load = (file) => JSON.parse(fs.readFileSync('data/fag/politikk/' + file, 'utf8'));
const canon = load('advanced_political_science_reading_canon_v1.json');
const matrix2 = load('advanced_political_science_wave2_gap_matrix_v1.json');
const review = load('advanced_political_science_wave3_chapter_review_v1.json');
const methods = load('methods_politikk_canonical_v4_5.json');
const pensum = load('politikkpensum_canonical_v4_5.json');
const methodIDs = new Set(methods.methods.map(item => item.method_id));
const domainIDs = new Set(pensum.domains.map(item => item.domain_id));
const works = new Map(canon.works.map(item => [item.id, item]));
const wave2IDs = new Set(matrix2.work_audits.map(item => item.work_id));

test('Politikk bølge 3: kapitler tilhører eksisterende verifiserte verk og kanoniske eiere', () => {
  assert.equal(review.reviewed_books, 2);
  assert.equal(review.chapter_evidence.length, 4);
  assert.equal(new Set(review.chapter_evidence.map(item => item.id)).size, 4);
  assert.equal(new Set(review.chapter_evidence.map(item => item.work_id)).size, 2);
  for (const item of review.chapter_evidence) {
    assert.ok(works.has(item.work_id), item.id);
    assert.equal(works.get(item.work_id).source_status, 'publisher_verified');
    assert.ok(wave2IDs.has(item.work_id), item.id);
    assert.ok(methodIDs.has(item.method_id), item.id);
    assert.ok(domainIDs.has(item.domain_id), item.id);
    assert.ok(item.doi.startsWith('10.1017/'), item.id);
    assert.ok(item.source_url.startsWith('https://www.cambridge.org/core/books/'), item.id);
    assert.equal(item.source_access, 'open_access_html');
    assert.ok(item.sections_read.length >= 1);
    assert.ok(item.chapter_authors.length >= 1);
    assert.ok(item.evidence_summary_no_empirical_promotion.length > 80);
    assert.ok(item.prior_overlap.length > 45);
    assert.ok(item.specific_gap.length > 45);
    assert.ok(item.rival_explanation.length > 45);
  }
  const anthology = review.chapter_evidence.filter(item => item.work_id === 'psc-ginsburg-huq-khaitan-2024');
  assert.deepEqual(anthology.map(item => item.chapter_authors), [['Rosalind Dixon', 'David Landau'], ['Yasmin Dawood']]);
  for (const item of anthology) assert.deepEqual(item.volume_editors, ['Tom Ginsburg', 'Aziz Z. Huq', 'Tarunabh Khaitan']);
});

test('Politikk bølge 3: selektiv kapittelkontroll skal aldri automatisk bli fulltekst- eller runtime-publisering', () => {
  assert.equal(review.fulltext_verified_candidates, 0);
  assert.equal(review.concept_registry_fully_audited, false);
  assert.equal(review.new_domains_created, 0);
  assert.equal(review.new_method_ids_created, 0);
  assert.equal(review.claim_items_promoted, 0);
  assert.equal(review.assessment_items_promoted, 0);
  assert.equal(pensum.domains.length, 13);
  assert.equal(methods.methods.length, 71);
  for (const item of review.chapter_evidence) {
    assert.equal(item.source_review_scope, 'targeted_sections_not_exhaustive');
    assert.equal(item.fulltext_audited, false);
    assert.equal(item.concept_registry_audited, false);
    assert.equal(item.promotion_allowed, false);
    assert.match(item.editorial_decision, /^(candidate_for_existing_method_enrichment|review_existing_concepts_before_enrichment)$/);
  }
});
