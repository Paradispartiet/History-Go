#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const REPORT = 'reports/fagverk/sport-scientific-quality-audit.json';
const SUPPLEMENT = 'data/fagverk/sport/sport_scientific_quality_v1.json';
const V2 = 'data/fag/sport/sport_scientific_pipeline_manifest_v2.json';
const ORDER = [
  'arenaer-steder-groundhopper',
  'regler-spill-konkurranse',
  'kropp-trening-prestasjon',
  'klubber-lag-frivillighet',
  'supportere-publikum-kultur',
  'inkludering-helse-lek-samfunn'
];

function countBy(values) {
  const out = {};
  for (const value of values) out[value] = (out[value] || 0) + 1;
  return out;
}

export function auditSportScientificQuality({ writeReport = false, checkReport = true } = {}) {
  const doc = readJson(SUPPLEMENT);
  const completion = readJson('data/fagverk/sport/sport_completion_v1.json');
  const v2 = readJson(V2);
  const contract = doc.quality_contract;
  const acceptedSynthesis = new Set(contract.accepted_synthesis_classes || []);

  assert(doc.subject_id === 'sport', 'scientific supplement må tilhøre sport');
  assert(doc.status === 'scientifically_strengthened', 'Sport scientific supplement har feil status');
  assert(doc.scope?.not_a_formal_systematic_review === true, 'supplementet må eksplisitt skille seg fra formell systematisk review');
  assert(doc.scope?.v2_pipeline_publication_status_unchanged === true, 'supplementet må bevare V2 publication-status');
  assert(doc.scope?.editorial_scientific_quality_can_pass_independently_of_v2_publication_ready_claims === true, 'editorial scientific quality-kontrakten mangler');
  assert(completion.status === 'complete' && completion.complete_ready === true, 'Sport må være redaksjonelt komplett før scientific-quality-porten');
  assert((doc.chapters || []).length === 6, 'scientific supplement skal dekke 6 kapitler');
  assert(isDeepStrictEqual(doc.chapters.map((row) => row.chapter_id), ORDER), 'scientific supplement har feil kapittelrekkefølge');

  const sourceIds = new Set();
  const mappedClaims = new Set();
  const evidenceClasses = [];
  const chapterCoverage = {};
  let synthesisSourceCount = 0;

  for (const row of doc.chapters) {
    const claimsDoc = readJson(`data/fagverk/sport/${row.chapter_id}/claims.json`);
    const claimIds = new Set((claimsDoc.claims || []).map((claim) => claim.id));
    const chapterMapped = new Set();
    let chapterSynthesis = 0;
    const sources = row.sources || [];

    assert(sources.length >= contract.min_peer_reviewed_sources_per_chapter, `${row.chapter_id} har for få fagfellevurderte kilder`);
    for (const source of sources) {
      assert(source.id && !sourceIds.has(source.id), `${row.chapter_id} har duplisert/manglende source id: ${source.id}`);
      sourceIds.add(source.id);
      assert(source.peer_reviewed === true, `${source.id} er ikke eksplisitt fagfellevurdert`);
      assert(source.title && Number.isInteger(source.year) && source.journal, `${source.id} mangler bibliografiske kjernefelt`);
      assert(source.evidence_class && /^https:\/\//.test(source.url || ''), `${source.id} mangler evidence class eller inspiserbar URL`);
      assert(source.doi || source.pmid, `${source.id} må ha DOI eller PMID`);
      assert(typeof source.limitations === 'string' && source.limitations.length >= 30, `${source.id} mangler reell begrensningsnote`);
      assert(Array.isArray(source.supported_claim_ids) && source.supported_claim_ids.length > 0, `${source.id} mangler claim-mapping`);
      for (const claimId of source.supported_claim_ids) {
        assert(claimIds.has(claimId), `${source.id} peker til ukjent claim ${claimId}`);
        chapterMapped.add(claimId);
        mappedClaims.add(claimId);
      }
      evidenceClasses.push(source.evidence_class);
      if (acceptedSynthesis.has(source.evidence_class)) {
        chapterSynthesis += 1;
        synthesisSourceCount += 1;
      }
    }

    assert(chapterSynthesis >= contract.min_synthesis_sources_per_chapter, `${row.chapter_id} mangler syntese-/reviewkilde`);
    assert(chapterMapped.size >= 5, `${row.chapter_id} må ha minst fem akademisk mappede eksisterende claims`);
    chapterCoverage[row.chapter_id] = {
      peerReviewedSourceCount: sources.length,
      synthesisSourceCount: chapterSynthesis,
      academicallyMappedClaimCount: chapterMapped.size,
      passesMinimums: true
    };
  }

  assert(sourceIds.size >= contract.min_unique_peer_reviewed_sources_total, 'Sport har for få unike fagfellevurderte kilder totalt');
  assert(mappedClaims.size >= contract.min_unique_claims_academically_mapped_total, 'Sport har for få akademisk mappede claims totalt');

  const body = doc.chapters.find((row) => row.chapter_id === 'kropp-trening-prestasjon');
  const balance = body?.balance_requirements?.find((row) => row.topic === 'attentional focus and motor learning');
  assert(balance, 'Sport mangler eksplisitt balance requirement for attentional focus/motor learning');
  assert(isDeepStrictEqual(new Set(balance.source_ids), new Set(['sport-sci-body-chua-2021','sport-sci-body-mckay-2024'])), 'motor-learning balance må bevare både Chua 2021 og McKay 2024');
  const bodySourceIds = new Set(body.sources.map((source) => source.id));
  assert(balance.source_ids.every((id) => bodySourceIds.has(id)), 'motor-learning balance peker til ukjent kilde');

  const principleText = (contract.principles || []).join(' ');
  assert(/Official rules and institutional documents remain the best source/.test(principleText), 'rollefordelingen mellom primærkilder og akademisk evidens mangler');
  assert(/Contradictory or methodologically contested literatures are represented/.test(principleText), 'kontrær evidens-kontrakten mangler');
  assert(v2.counts?.publication_ready_claims === 0, 'scientific quality-pass skal ikke materialisere V2 publication-ready claims');
  assert(v2.readiness?.evidence_claim_publication === 'blocked', 'V2 publication gate skal stå urørt');

  const report = {
    schema: 'history_go_fagverk_sport_scientific_quality_audit_v1',
    version: '1.0.0',
    status: 'scientific_quality_strong',
    subject_id: 'sport',
    summary: {
      chapterCount: doc.chapters.length,
      peerReviewedSourceCount: sourceIds.size,
      synthesisSourceCount,
      academicallyMappedClaimCount: mappedClaims.size,
      chaptersMeetingMinimum: Object.values(chapterCoverage).filter((row) => row.passesMinimums).length
    },
    chapterCoverage,
    evidenceClassCounts: countBy(evidenceClasses),
    gates: {
      allChaptersCovered: true,
      minimumPeerReviewedSourcesPerChapter: true,
      minimumSynthesisSourcesPerChapter: true,
      allSourceIdsUnique: true,
      allAcademicMappingsResolve: true,
      limitationsRecorded: true,
      contestedMotorLearningEvidenceBalanced: true,
      officialAndAcademicEvidenceRolesSeparated: true,
      v2PublicationStatusUnmodified: true
    }
  };

  if (writeReport) fs.writeFileSync(path.join(ROOT, REPORT), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert`);
  return { report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditSportScientificQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Sport scientific quality OK: ${report.summary.peerReviewedSourceCount} fagfellevurderte kilder, ${report.summary.synthesisSourceCount} syntesekilder, ${report.summary.academicallyMappedClaimCount} mappede claims.`);
  } catch (error) {
    console.error(`Sport scientific quality FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
