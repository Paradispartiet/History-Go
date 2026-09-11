#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditLitteraturArticleEditorialQuality, auditLitteraturExpandedArticleRequirements } from '../scripts/audit-litteratur-article-editorial-quality-v1.mjs';
import { auditLitteraturAssessment } from '../scripts/audit-litteratur-assessment-v1.mjs';
import { auditLitteraturTheoryIntegrity } from './audit-litteratur-theory-integrity.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const CONTRACT = `${BASE}/expanded_quality_contract_v1.json`;
const EDITORIAL = `${BASE}/editorial_quality_v1.json`;
const COVERAGE = `${BASE}/coverage_contract_v1.json`;
const SUBJECT_STATUS = 'data/fagverk/subject_status.json';
const REPORT = 'reports/fagverk/litteratur-expanded-quality-audit.json';
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const REQUIRED_RULES = {
  whole_subject_editorial_expansion_required: true,
  all_canonical_areas_must_be_editorial_ready: true,
  all_canonical_topics_must_be_editorial_ready: true,
  every_article_must_pass_expanded_requirement_review: true,
  strict_theory_integrity_required_per_major_field: true,
  specialized_full_field_contracts_are_additional_depth_not_universal_denominator: true,
  missing_specialized_wrapper_is_not_a_content_gap_when_universal_editorial_and_strict_gates_pass: true,
  content_rewrite_allowed_only_for_proven_substantive_gap: true,
  quality_status_is_separate_from_global_editorial_lifecycle: true,
  global_subject_lifecycle_is_read_only_for_this_reconciliation: true,
  all_declared_rules_and_required_gates_are_enforced: true
};

const REQUIRED_GATES = [
  'docs/LITTERATUR_ARTICLE_EDITORIAL_CONTRACT_V1.md',
  'scripts/audit-litteratur-article-editorial-quality-v1.mjs',
  'tools/audit-litteratur-theory-integrity.mjs',
  'scripts/audit-litteratur-assessment-v1.mjs',
  'tools/audit-litteratur-expanded-quality.mjs',
  'tests/litteratur-article-editorial-quality-v1.test.mjs',
  'tests/litteratur-expanded-quality.test.mjs'
];

function assertContract(contract) {
  assert(contract.schema === 'history_go_literature_expanded_quality_contract_v1', 'Ugyldig Litteratur expanded-quality-kontrakt');
  assert(contract.version === '1.1.0', 'Uventet Litteratur expanded-quality-kontraktversjon');
  assert(contract.status === 'active', 'Litteratur expanded-quality-kontrakten er ikke aktiv');
  assert(JSON.stringify(contract.rules) === JSON.stringify(REQUIRED_RULES), 'Expanded-quality-kontraktens regler er svekket, mangler eller har ukjente tillegg');
  assert(JSON.stringify(contract.required_gates) === JSON.stringify(REQUIRED_GATES), 'Expanded-quality-kontraktens required_gates er svekket eller usynkronisert');
  for (const gate of REQUIRED_GATES) assert(fs.existsSync(abs(gate)), `Påkrevd expanded-quality-gate mangler: ${gate}`);
  const expected = {
    canonical_areas: 28,
    canonical_topics: 168,
    editorial_ready_areas: 28,
    editorial_ready_topics: 168,
    fully_reviewed_articles: 168,
    article_requirement_gaps: 0,
    article_requirement_dimensions: 8,
    rewrite_pending_areas: 0,
    rewrite_pending_topics: 0,
    strictly_proven_fields: 28,
    specialized_full_field_contracts: 18,
    legacy_editorial_expansion_areas: 10,
    substantive_content_gaps: 0
  };
  assert(JSON.stringify(contract.expected) === JSON.stringify(expected), 'Expanded-quality-kontraktens denominator eller forventede nullkøer er endret');
}

export function auditLitteraturExpandedQuality({ writeReport = false, checkReport = true } = {}) {
  const contract = json(CONTRACT);
  const editorial = json(EDITORIAL);
  const coverage = json(COVERAGE);
  const subjectStatus = json(SUBJECT_STATUS);
  assertContract(contract);

  const article = auditLitteraturArticleEditorialQuality();
  const articleRequirements = auditLitteraturExpandedArticleRequirements();
  const assessment = auditLitteraturAssessment();
  const theory = auditLitteraturTheoryIntegrity({ writeReport: false, checkReport: true });

  const globalLitteratur = subjectStatus.subjects.find((row) => row.id === 'litteratur');
  assert(globalLitteratur, 'Global Fagverk-status mangler Litteratur');
  assert(globalLitteratur.editorialStatus === 'complete', 'Denne reconciliationen skal ikke mutere global Litteratur lifecycle-status');
  assert(globalLitteratur.nextGate === 'maintenance_and_source_refresh', 'Global Litteratur nextGate er uventet endret');
  assert(editorial.status === 'editorial_ready_complete', 'Litteratur sitt interne redaksjonelle register er ikke lukket');
  assert(editorial.qualityStatus === 'expanded_and_audited', 'Litteratur sitt separate kvalitetsregister er ikke expanded_and_audited');
  assert(editorial.totals.areas === contract.expected.canonical_areas, 'Feil antall canonicale Litteratur-områder');
  assert(editorial.totals.topics === contract.expected.canonical_topics, 'Feil antall canonicale Litteratur-emner');
  assert(editorial.totals.editorialReadyAreas === contract.expected.editorial_ready_areas, 'Ikke alle Litteratur-områder er editorial_ready');
  assert(editorial.totals.editorialReadyTopics === contract.expected.editorial_ready_topics, 'Ikke alle Litteratur-artikler er editorial_ready');
  assert(editorial.totals.rewritePendingAreas === contract.expected.rewrite_pending_areas && editorial.totals.rewritePendingTopics === contract.expected.rewrite_pending_topics && editorial.pendingAreaIds.length === 0, 'Litteratur har fortsatt redaksjonell rewrite-kø');
  assert(article.areaCount === 28 && article.articleCount === 168 && article.pendingAreaCount === 0, 'Universell Litteratur-artikkelport er ikke 28/28 og 168/168');
  assert(articleRequirements.articleCount === contract.expected.canonical_topics, 'Expanded artikkelreview dekker ikke alle 168 artikler');
  assert(articleRequirements.fullyReviewedArticleCount === contract.expected.fully_reviewed_articles, 'Ikke alle Litteratur-artikler består expanded requirement review');
  assert(articleRequirements.articleRequirementGapCount === contract.expected.article_requirement_gaps, 'Expanded artikkelreview har uløste artikkelkrav');
  assert(articleRequirements.requiredDimensions === contract.expected.article_requirement_dimensions, 'Expanded artikkelreview har feil antall kravdimensjoner');
  assert(assessment.assessed_articles === 168 && assessment.questions === 140 && assessment.sources === 384, 'Litteratur assessment er ikke komplett over 168 artikler / 140 spørsmål / 384 kilder');
  assert(theory.summary.canonicalMajorFields === 28 && theory.summary.fieldsStrictlyProven === contract.expected.strictly_proven_fields, 'Litteratur theory-integrity er ikke 28/28');
  assert(theory.summary.substantiveContentGapsProven === contract.expected.substantive_content_gaps, 'Litteratur har et bevist substansielt innholdshull');

  const specialized = theory.fields.filter((field) => field.fullFieldContract);
  const legacy = theory.fields.filter((field) => !field.fullFieldContract);
  assert(specialized.length === contract.expected.specialized_full_field_contracts, 'Feil antall ekstra full-field-kontrakter');
  assert(legacy.length === contract.expected.legacy_editorial_expansion_areas, 'Feil antall legacy editorial-expansion-områder');

  const editorialById = new Map(editorial.areas.map((row) => [row.areaId, row]));
  const coverageById = new Map(coverage.coverage_areas.map((row) => [row.id, row]));
  for (const field of theory.fields) {
    const area = coverageById.get(field.fieldId);
    const registryRow = editorialById.get(field.fieldId);
    const chapter = json(`${BASE}/foundation_texts/${field.fieldId}.json`);
    assert(area, `${field.fieldId}: mangler coverage-area`);
    assert(registryRow?.status === 'editorial_ready_v1', `${field.fieldId}: mangler editorial_ready_v1`);
    assert(chapter.editorial_status === 'editorial_ready_v1', `${field.fieldId}: kapittelet er ikke editorial_ready_v1`);
    assert(chapter.qualityProfile === 'full_depth_v2', `${field.fieldId}: kapittelet mangler full_depth_v2`);
    assert(field.strictlyProven === true, `${field.fieldId}: strict theory proof mangler`);
    assert(field.verifiedProseBoundClaims >= 4, `${field.fieldId}: for få prose-bound claims`);
    assert(field.scholarlyUsedSources >= 2, `${field.fieldId}: for få anvendte scholarly sources`);
    assert(field.theoryBearingParagraphs >= 2, `${field.fieldId}: for lite theory-bearing prosa`);
    assert(field.rivalOrAlternativeParagraphs >= 2, `${field.fieldId}: mangler rival/alternativ-prosa`);
    assert(field.limitationOrInferenceParagraphs >= 2, `${field.fieldId}: mangler begrensnings-/inferensprosa`);
  }

  for (const field of legacy) {
    const area = coverageById.get(field.fieldId);
    assert(!area.full_field_contract, `${field.fieldId}: legacy reconciliation forventer ikke full_field_contract`);
  }

  const report = {
    schema: 'history_go_litteratur_expanded_quality_audit_v1',
    version: '1.1.0',
    subject_id: 'litteratur',
    status: 'PROVEN_WHOLE_SUBJECT_EXPANSION',
    canonical_editorial_status_mutated: false,
    internal_editorial_status: editorial.status,
    quality_status: editorial.qualityStatus,
    conclusion: 'Litteratur har bevist helfags expanded-kvalitet gjennom 168/168 artikkelvis kravreview, universell 28/28 redaksjonell dekning, komplett assessment og 28/28 strict theory integrity. Global Fagverk-lifecycle forblir complete; expanded_and_audited er en separat kvalitetsdimensjon. De 18 full-field-kontraktene er ekstra spesialisert dybde og ikke denominator for den universelle kvalitetsutvidelsen.',
    summary: {
      canonicalAreas: 28,
      canonicalTopics: 168,
      editorialReadyAreas: 28,
      editorialReadyTopics: 168,
      fullyReviewedArticles: articleRequirements.fullyReviewedArticleCount,
      articleRequirementDimensions: articleRequirements.requiredDimensions,
      articleRequirementGaps: articleRequirements.articleRequirementGapCount,
      rewritePendingAreas: 0,
      rewritePendingTopics: 0,
      assessedArticles: assessment.assessed_articles,
      assessmentQuestions: assessment.questions,
      assessmentSources: assessment.sources,
      strictFields: theory.summary.fieldsStrictlyProven,
      specializedFullFieldAreas: specialized.length,
      legacyEditorialExpansionAreas: legacy.length,
      substantiveContentGapsProven: theory.summary.substantiveContentGapsProven
    },
    specializedFullFieldAreaIds: specialized.map((field) => field.fieldId),
    legacyEditorialExpansionAreaIds: legacy.map((field) => field.fieldId),
    evidence: {
      universalEditorialContract: 'docs/LITTERATUR_ARTICLE_EDITORIAL_CONTRACT_V1.md',
      editorialRegistry: EDITORIAL,
      articleAudit: 'scripts/audit-litteratur-article-editorial-quality-v1.mjs',
      assessmentAudit: 'scripts/audit-litteratur-assessment-v1.mjs',
      theoryAudit: 'tools/audit-litteratur-theory-integrity.mjs',
      expandedQualityContract: CONTRACT,
      globalLifecycleRegistry: SUBJECT_STATUS
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
    fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(REPORT)), `${REPORT} mangler`);
    assert(JSON.stringify(json(REPORT)) === JSON.stringify(report), `${REPORT} er utdatert`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditLitteraturExpandedQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Litteratur expanded-quality OK: ${report.summary.canonicalAreas}/28 områder, ${report.summary.fullyReviewedArticles}/168 artikkelreview, ${report.summary.strictFields}/28 strict fields, ${report.summary.substantiveContentGapsProven} innholdshull.`);
  } catch (error) {
    console.error(`Litteratur expanded-quality FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
