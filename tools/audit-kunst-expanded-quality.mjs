#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditKunstComplete } from '../scripts/audit-fagverk-kunst-complete.mjs';
import { auditKunstTheoryIntegrity } from './audit-kunst-theory-integrity.mjs';
import { auditKunstSourceRefreshPlaceCaseExpansion } from '../scripts/audit-kunst-source-refresh-place-case-expansion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'data/fag/kunst/expanded_quality_contract_v1.json';
const SUBJECT_STATUS = 'data/fagverk/subject_status.json';
const PLAN = 'reports/fagverk/fagverk-expanded-subject-by-subject-audit-v1.json';
const REPORT = 'reports/fagverk/kunst-expanded-quality-audit.json';
const ROUND_FILE = 'data/fagverk/kunst/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json';

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const REQUIRED_RULES = {
  whole_subject_expansion_proof_required: true,
  all_canonical_domains_must_be_reconciled: true,
  every_canonical_chapter_must_have_post_completion_source_case_expansion: true,
  strict_theory_integrity_required_per_major_field: true,
  baseline_complete_audit_required: true,
  post_completion_maintenance_may_supply_expansion_evidence: true,
  content_rewrite_allowed_only_for_proven_substantive_gap: true,
  quality_status_is_separate_from_global_editorial_lifecycle: true,
  global_subject_lifecycle_is_read_only_for_this_reconciliation: true,
  global_subject_by_subject_plan_is_read_only: true,
  all_declared_rules_and_required_gates_are_enforced: true
};

const EXPECTED = {
  canonical_domains: 6,
  canonical_chapters: 6,
  canonical_emner: 21,
  baseline_claims: 140,
  baseline_sources: 100,
  baseline_unique_places: 11,
  strictly_proven_fields: 6,
  maintenance_rounds: 1,
  reconciled_chapters: 6,
  maintenance_cases: 6,
  source_refreshes: 12,
  projected_unique_places: 17,
  substantive_content_gaps: 0
};

const REQUIRED_GATES = [
  'scripts/audit-fagverk-kunst-complete.mjs',
  'tools/audit-kunst-theory-integrity.mjs',
  'scripts/audit-kunst-source-refresh-place-case-expansion.mjs',
  'tools/audit-kunst-expanded-quality.mjs',
  'tests/kunst-expanded-quality.test.mjs'
];

function assertContract(contract) {
  assert(contract.schema === 'history_go_kunst_expanded_quality_contract_v1', 'Ugyldig Kunst expanded-quality-kontrakt');
  assert(contract.version === '1.0.0' && contract.status === 'active', 'Kunst expanded-quality-kontrakten er ikke aktiv v1.0.0');
  assert(JSON.stringify(contract.rules) === JSON.stringify(REQUIRED_RULES), 'Kunst expanded-quality-reglene er svekket, mangler eller har ukjente tillegg');
  assert(JSON.stringify(contract.expected) === JSON.stringify(EXPECTED), 'Kunst expanded-quality-denominator eller nullkøer er endret');
  assert(JSON.stringify(contract.required_gates) === JSON.stringify(REQUIRED_GATES), 'Kunst expanded-quality required_gates er usynkronisert');
  assert(contract.read_only_plan_ref === PLAN, 'Kunst expanded-quality-kontrakten peker ikke til den read-only fag-for-fag-planen');
  for (const gate of REQUIRED_GATES) assert(fs.existsSync(abs(gate)), `Påkrevd Kunst expanded-quality-gate mangler: ${gate}`);
}

export function auditKunstExpandedQuality({ writeReport = false, checkReport = true } = {}) {
  const contract = json(CONTRACT);
  const status = json(SUBJECT_STATUS);
  const plan = json(PLAN);
  const maintenanceDoc = json(ROUND_FILE);
  assertContract(contract);

  const { report: complete } = auditKunstComplete({ writeReport: false, checkReport: true });
  const theory = auditKunstTheoryIntegrity({ writeReport: false, checkReport: true });
  const maintenance = auditKunstSourceRefreshPlaceCaseExpansion();

  const kunstStatus = status.subjects.find((row) => row.id === 'kunst');
  assert(kunstStatus, 'Global Fagverk-status mangler Kunst');
  assert(kunstStatus.editorialStatus === 'complete', 'Denne reconciliationen skal ikke mutere global Kunst lifecycle-status');
  assert(kunstStatus.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Global Kunst nextGate er uventet endret');

  assert(plan.status === 'read_only_fail_closed_audit_complete', 'Fag-for-fag-planen er ikke lenger read-only fail-closed');
  const planKunst = plan.subjects.find((row) => row.id === 'kunst');
  assert(planKunst, 'Read-only fag-for-fag-plan mangler Kunst');
  assert(planKunst.whole_subject_expansion_proven === false, 'Read-only plan-snapshot skal ikke muteres av denne reconciliationen');
  assert(planKunst.content_gap_proven === false, 'Read-only plan-snapshot skal fortsatt vise at intet innholdshull var bevist');
  assert(planKunst.expanded_verdict === 'HIGH_QUALITY_COMPLETE_NO_SEPARATE_WHOLE_SUBJECT_EXPANSION_PROOF', 'Read-only plan-snapshot har uventet Kunst-verdict');

  assert(complete.status === 'complete', 'Kunst baseline complete-audit er ikke grønn');
  assert(complete.summary.domainCount === EXPECTED.canonical_domains, 'Kunst har feil antall canonicale fagområder');
  assert(complete.summary.chapterCount === EXPECTED.canonical_chapters, 'Kunst har feil antall canonicale kapitler');
  assert(complete.summary.emneCount === EXPECTED.canonical_emner, 'Kunst har feil antall canonicale emner');
  assert(complete.summary.claimCount === EXPECTED.baseline_claims, 'Kunst baseline claim-telling har endret seg');
  assert(complete.summary.sourceCount === EXPECTED.baseline_sources, 'Kunst baseline source-telling har endret seg');
  assert(complete.summary.uniquePlaceCount === EXPECTED.baseline_unique_places, 'Kunst baseline place-telling har endret seg');

  assert(theory.status === 'STRICTLY_PROVEN', 'Kunst theory-integrity er ikke STRICTLY_PROVEN');
  assert(theory.summary.canonicalMajorFields === EXPECTED.canonical_domains, 'Kunst theory-integrity har feil denominator');
  assert(theory.summary.fieldsStrictlyProven === EXPECTED.strictly_proven_fields, 'Kunst theory-integrity er ikke 6/6');
  assert(theory.summary.substantiveContentGapsProven === EXPECTED.substantive_content_gaps, 'Kunst theory-integrity har bevist et substansielt innholdshull');
  assert(theory.content_rewrite_required === false, 'Kunst theory-integrity krever uventet innholdsomskriving');

  assert(maintenance.status === 'passed', 'Kunst maintenance round 1 er ikke grønn');
  assert(maintenance.round === 1, 'Kunst expanded-quality forventer eksakt maintenance round 1');
  assert(maintenance.chapter_count === EXPECTED.reconciled_chapters, 'Kunst maintenance reconciler ikke alle 6 kapitler');
  assert(maintenance.canonical_chapter_count === EXPECTED.canonical_chapters, 'Kunst maintenance er ikke låst til 6 canonicale kapitler');
  assert(maintenance.case_count === EXPECTED.maintenance_cases, 'Kunst maintenance har feil antall nye case');
  assert(maintenance.source_refresh_count === EXPECTED.source_refreshes, 'Kunst maintenance har feil antall kildekontroller');
  assert(maintenance.baseline_unique_place_count === EXPECTED.baseline_unique_places, 'Kunst maintenance bruker feil place-baseline');
  assert(maintenance.projected_unique_place_count === EXPECTED.projected_unique_places, 'Kunst maintenance dokumenterer feil projisert stedscasebredde');
  assert(maintenance.gates?.claim_provenance_preserved === true, 'Kunst maintenance svekker claim provenance');
  assert(maintenance.gates?.theory_integrity_scope_unchanged === true, 'Kunst maintenance endrer theory-integrity-scope');
  assert(maintenance.gates?.subject_architecture_unchanged === true, 'Kunst maintenance endrer fagarkitekturen');
  assert(maintenance.gates?.completion_status_preserved === true, 'Kunst maintenance endrer completion-status');

  assert(maintenanceDoc.status === 'verified', 'Kunst maintenance-evidence er ikke verified');
  assert(maintenanceDoc.scope?.maintenance_evidence_only === true, 'Kunst maintenance skal være evidence-only');
  assert(maintenanceDoc.target_chapters.length === EXPECTED.reconciled_chapters, 'Kunst maintenance har feil target-denominator');
  assert(new Set(maintenanceDoc.target_chapters).size === EXPECTED.reconciled_chapters, 'Kunst maintenance-targets overlapper');
  assert(maintenanceDoc.cases.length === EXPECTED.maintenance_cases, 'Kunst maintenance-doc har feil case-denominator');
  assert(maintenanceDoc.source_refresh.length === EXPECTED.source_refreshes, 'Kunst maintenance-doc har feil source-denominator');
  assert(new Set(maintenanceDoc.source_refresh.map((source) => source.id)).size === EXPECTED.source_refreshes, 'Kunst maintenance-kilde-ID-er overlapper');

  const canonicalChapterIds = complete.canonicalDomainCoverage.flatMap((row) => row.chapterIds);
  assert(new Set(canonicalChapterIds).size === EXPECTED.canonical_chapters, 'Kunst complete-audit har ikke 6 unike canonicale kapittel-ID-er');
  assert(canonicalChapterIds.every((chapterId) => maintenanceDoc.target_chapters.includes(chapterId)), 'Minst ett canonicalt Kunst-kapittel mangler post-completion expansion');
  assert(maintenanceDoc.target_chapters.every((chapterId) => canonicalChapterIds.includes(chapterId)), 'Maintenance inneholder et ikke-canonicalt Kunst-kapittel');

  const theoryByDomain = new Map(theory.fields.map((field) => [field.domainId, field]));
  const casesByChapter = new Map(maintenanceDoc.cases.map((item) => [item.chapter_id, item]));
  const domains = complete.canonicalDomainCoverage.map((domain) => {
    const theoryField = theoryByDomain.get(domain.domainId);
    assert(theoryField?.strictlyProven === true, `${domain.domainId}: strict theory proof mangler`);
    assert(domain.chapterIds.every((chapterId) => casesByChapter.has(chapterId)), `${domain.domainId}: kapittelet mangler post-completion kildebundet case`);
    const chapterAudits = complete.chapterAudits.filter((row) => domain.chapterIds.includes(row.chapterId));
    assert(chapterAudits.length === domain.chapterCount, `${domain.domainId}: chapter-audit denominator er feil`);
    assert(chapterAudits.every((row) => row.paragraphCount >= 27 && row.claimCount >= 21 && row.sourceCount >= 16 && row.methodIds.length >= 1 && row.relatedPlaceIds.length >= 4), `${domain.domainId}: baseline helfagskvalitet er svekket`);
    return {
      domainId: domain.domainId,
      chapterCount: domain.chapterCount,
      chapterIds: domain.chapterIds,
      strictTheoryProven: true,
      postCompletionSourceCaseExpansionProven: true,
      postCompletionCaseCount: domain.chapterIds.length,
      substantiveContentGapProven: false
    };
  });

  assert(domains.length === EXPECTED.canonical_domains, 'Kunst expanded-quality dekker ikke 6/6 fagområder');
  assert(domains.every((row) => row.strictTheoryProven && row.postCompletionSourceCaseExpansionProven && !row.substantiveContentGapProven), 'Kunst expanded-quality har ulukket fagområde');

  const report = {
    schema: 'history_go_kunst_expanded_quality_audit_v1',
    version: '1.0.0',
    subject_id: 'kunst',
    status: 'PROVEN_WHOLE_SUBJECT_EXPANSION',
    canonical_editorial_status_mutated: false,
    canonical_editorial_status: kunstStatus.editorialStatus,
    quality_status: 'expanded_and_audited',
    content_rewrite_required: false,
    conclusion: 'Kunst har bevist helfags expanded-kvalitet uten ny fagtekst: 6/6 canonicale kapitler fikk dokumentert post-completion kilde- og stedscaseutvidelse i den permanente maintenance-runden, alle 6 fagområder er strict theory-proven, og ingen substansielle innholdshull er påvist. Global Fagverk-lifecycle forblir complete, og den read-only fag-for-fag-planen fra 8. september muteres ikke.',
    summary: {
      canonicalDomains: EXPECTED.canonical_domains,
      canonicalChapters: EXPECTED.canonical_chapters,
      canonicalEmner: EXPECTED.canonical_emner,
      baselineClaims: EXPECTED.baseline_claims,
      baselineSources: EXPECTED.baseline_sources,
      baselineUniquePlaces: EXPECTED.baseline_unique_places,
      strictFields: EXPECTED.strictly_proven_fields,
      maintenanceRounds: EXPECTED.maintenance_rounds,
      reconciledChapters: EXPECTED.reconciled_chapters,
      maintenanceCases: EXPECTED.maintenance_cases,
      sourceRefreshes: EXPECTED.source_refreshes,
      projectedUniquePlaces: EXPECTED.projected_unique_places,
      substantiveContentGapsProven: EXPECTED.substantive_content_gaps
    },
    readOnlyPlanSnapshot: {
      ref: PLAN,
      preserved: true,
      priorExpandedVerdict: planKunst.expanded_verdict,
      priorWholeSubjectExpansionProven: planKunst.whole_subject_expansion_proven,
      priorContentGapProven: planKunst.content_gap_proven
    },
    domains,
    evidence: {
      completeAudit: 'reports/fagverk/kunst-complete-audit.json',
      theoryAudit: 'reports/fagverk/kunst-theory-integrity-audit.json',
      maintenanceRounds: [ROUND_FILE],
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
    const report = auditKunstExpandedQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Kunst expanded-quality OK: ${report.summary.canonicalDomains}/6 fagområder, ${report.summary.reconciledChapters}/6 post-completion-reconciled chapters, ${report.summary.strictFields}/6 strict fields, ${report.summary.substantiveContentGapsProven} innholdshull.`);
  } catch (error) {
    console.error(`Kunst expanded-quality FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
