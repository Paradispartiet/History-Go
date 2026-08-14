import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSportScientificQuality } from '../scripts/audit-fagverk-sport-scientific-quality.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const EXPECTED = {
  chapterCount: 6,
  peerReviewedSourceCount: 25,
  synthesisSourceCount: 20,
  academicallyMappedClaimCount: 54,
  chaptersMeetingMinimum: 6
};

test('Sport har vitenskapelig sterkt forskningslag over alle seks kapitler', () => {
  const { report } = auditSportScientificQuality();
  assert.equal(report.status, 'scientific_quality_strong');
  assert.deepEqual(report.summary, EXPECTED);
  assert.equal(Object.keys(report.chapterCoverage).length, 6);
  assert.ok(Object.values(report.chapterCoverage).every((row) => row.peerReviewedSourceCount >= 3));
  assert.ok(Object.values(report.chapterCoverage).every((row) => row.synthesisSourceCount >= 1));
  assert.ok(Object.values(report.chapterCoverage).every((row) => row.academicallyMappedClaimCount >= 5));
});

test('Sport skiller offisielle primærkilder fra akademisk evidens og bevarer begrensninger', () => {
  const doc = readJson('data/fagverk/sport/sport_scientific_quality_v1.json');
  assert.equal(doc.scope.not_a_formal_systematic_review, true);
  assert.equal(doc.scope.v2_pipeline_publication_status_unchanged, true);
  assert.match(doc.quality_contract.principles.join(' '), /Official rules and institutional documents remain the best source/);
  const sources = doc.chapters.flatMap((chapter) => chapter.sources);
  assert.equal(sources.length, 25);
  assert.ok(sources.every((source) => source.peer_reviewed === true));
  assert.ok(sources.every((source) => source.limitations.length >= 30));
  assert.ok(sources.every((source) => source.supported_claim_ids.length > 0));
});

test('Sport låser motstridende motorlæringsmeta-evidens i samme kvalitetsport', () => {
  const doc = readJson('data/fagverk/sport/sport_scientific_quality_v1.json');
  const body = doc.chapters.find((chapter) => chapter.chapter_id === 'kropp-trening-prestasjon');
  const balance = body.balance_requirements.find((row) => row.topic === 'attentional focus and motor learning');
  assert.deepEqual(balance.source_ids, ['sport-sci-body-chua-2021', 'sport-sci-body-mckay-2024']);
  const mckay = body.sources.find((source) => source.id === 'sport-sci-body-mckay-2024');
  assert.equal(mckay.use_role, 'counterevidence_and_uncertainty');
});

test('Sport scientific quality endrer ikke den formelle V2 publication-ready-statusen', () => {
  const v2 = readJson('data/fag/sport/sport_scientific_pipeline_manifest_v2.json');
  assert.equal(v2.counts.publication_ready_claims, 0);
  assert.equal(v2.readiness.evidence_claim_publication, 'blocked');
});

test('Sport completion-overlay materialiserer den vitenskapelige kvalitetsvurderingen', () => {
  const completion = readJson('data/fagverk/sport/sport_completion_v1.json');
  assert.equal(completion.status, 'complete');
  assert.equal(completion.complete_ready, true);
  assert.deepEqual(completion.scientific_quality, {
    status: 'strong',
    evidence_registry: 'data/fagverk/sport/sport_scientific_quality_v1.json',
    audit_report: 'reports/fagverk/sport-scientific-quality-audit.json',
    peer_reviewed_source_count: 25,
    synthesis_source_count: 20,
    academically_mapped_claim_count: 54,
    chapter_minimums_passed: true,
    contested_evidence_balance_passed: true,
    formal_v2_systematic_pipeline_required_for_editorial_completion: false
  });
});
