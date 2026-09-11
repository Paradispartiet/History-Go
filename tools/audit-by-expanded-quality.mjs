#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditByComplete } from '../scripts/audit-fagverk-by-complete.mjs';
import { auditByTheoryIntegrity } from './audit-by-theory-integrity.mjs';
import { auditBySourceRefreshPlaceCaseExpansion } from '../scripts/audit-by-source-refresh-place-case-expansion.mjs';
import { auditBySourceRefreshPlaceCaseExpansionRound2 } from '../scripts/audit-by-source-refresh-place-case-expansion-round2.mjs';
import { auditBySourceRefreshPlaceCaseExpansionRound3 } from '../scripts/audit-by-source-refresh-place-case-expansion-round3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'data/fag/by/expanded_quality_contract_v1.json';
const SUBJECT_STATUS = 'data/fagverk/subject_status.json';
const PLAN = 'reports/fagverk/fagverk-expanded-subject-by-subject-audit-v1.json';
const REPORT = 'reports/fagverk/by-expanded-quality-audit.json';
const ROUND_FILES = [
  'data/fagverk/by/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json',
  'data/fagverk/by/maintenance/source-refresh-place-case-expansion-round2-2026-09-04.json',
  'data/fagverk/by/maintenance/source-refresh-place-case-expansion-round3-2026-09-04.json'
];

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
  canonical_domains: 12,
  canonical_chapters: 17,
  canonical_emner: 82,
  baseline_claims: 306,
  baseline_sources: 219,
  strictly_proven_fields: 12,
  maintenance_rounds: 3,
  reconciled_chapters: 17,
  maintenance_cases: 17,
  source_refreshes: 36,
  minimum_projected_unique_places: 41,
  substantive_content_gaps: 0
};

const REQUIRED_GATES = [
  'scripts/audit-fagverk-by-complete.mjs',
  'tools/audit-by-theory-integrity.mjs',
  'scripts/audit-by-source-refresh-place-case-expansion.mjs',
  'scripts/audit-by-source-refresh-place-case-expansion-round2.mjs',
  'scripts/audit-by-source-refresh-place-case-expansion-round3.mjs',
  'tools/audit-by-expanded-quality.mjs',
  'tests/by-expanded-quality.test.mjs'
];

function assertContract(contract) {
  assert(contract.schema === 'history_go_by_expanded_quality_contract_v1', 'Ugyldig By expanded-quality-kontrakt');
  assert(contract.version === '1.0.0' && contract.status === 'active', 'By expanded-quality-kontrakten er ikke aktiv v1.0.0');
  assert(JSON.stringify(contract.rules) === JSON.stringify(REQUIRED_RULES), 'By expanded-quality-reglene er svekket, mangler eller har ukjente tillegg');
  assert(JSON.stringify(contract.expected) === JSON.stringify(EXPECTED), 'By expanded-quality-denominator eller nullkøer er endret');
  assert(JSON.stringify(contract.required_gates) === JSON.stringify(REQUIRED_GATES), 'By expanded-quality required_gates er usynkronisert');
  assert(contract.read_only_plan_ref === PLAN, 'By expanded-quality-kontrakten peker ikke til den read-only fag-for-fag-planen');
  for (const gate of REQUIRED_GATES) assert(fs.existsSync(abs(gate)), `Påkrevd By expanded-quality-gate mangler: ${gate}`);
}

function collectMaintenance() {
  const docs = ROUND_FILES.map(json);
  const targets = docs.flatMap((doc) => doc.target_chapters || []);
  const cases = docs.flatMap((doc) => doc.cases || []);
  const sources = docs.flatMap((doc) => doc.source_refresh || []);
  return { docs, targets, cases, sources };
}

export function auditByExpandedQuality({ writeReport = false, checkReport = true } = {}) {
  const contract = json(CONTRACT);
  const status = json(SUBJECT_STATUS);
  const plan = json(PLAN);
  assertContract(contract);

  const { report: complete } = auditByComplete({ writeReport: false, checkReport: true });
  const theory = auditByTheoryIntegrity({ writeReport: false, checkReport: true });
  const round1 = auditBySourceRefreshPlaceCaseExpansion();
  const round2 = auditBySourceRefreshPlaceCaseExpansionRound2();
  const round3 = auditBySourceRefreshPlaceCaseExpansionRound3();
  const maintenance = collectMaintenance();

  const byStatus = status.subjects.find((row) => row.id === 'by');
  assert(byStatus, 'Global Fagverk-status mangler By');
  assert(byStatus.editorialStatus === 'complete', 'Denne reconciliationen skal ikke mutere global By lifecycle-status');
  assert(byStatus.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Global By nextGate er uventet endret');

  assert(plan.status === 'read_only_fail_closed_audit_complete', 'Fag-for-fag-planen er ikke lenger read-only fail-closed');
  const planBy = plan.subjects.find((row) => row.id === 'by');
  assert(planBy, 'Read-only fag-for-fag-plan mangler By');
  assert(planBy.whole_subject_expansion_proven === false, 'Read-only plan-snapshot skal ikke muteres av denne reconciliationen');
  assert(planBy.content_gap_proven === false, 'Read-only plan-snapshot skal fortsatt vise at intet innholdshull var bevist');
  assert(planBy.expanded_verdict === 'HIGH_QUALITY_COMPLETE_NO_SEPARATE_WHOLE_SUBJECT_EXPANSION_PROOF', 'Read-only plan-snapshot har uventet By-verdict');

  assert(complete.status === 'complete', 'By baseline complete-audit er ikke grønn');
  assert(complete.summary.domainCount === EXPECTED.canonical_domains, 'By har feil antall canonicale fagområder');
  assert(complete.summary.chapterCount === EXPECTED.canonical_chapters, 'By har feil antall canonicale kapitler');
  assert(complete.summary.emneCount === EXPECTED.canonical_emner, 'By har feil antall canonicale emner');
  assert(complete.summary.claimCount === EXPECTED.baseline_claims, 'By baseline claim-telling har endret seg');
  assert(complete.summary.sourceCount === EXPECTED.baseline_sources, 'By baseline source-telling har endret seg');

  assert(theory.status === 'STRICTLY_PROVEN', 'By theory-integrity er ikke STRICTLY_PROVEN');
  assert(theory.summary.canonicalMajorFields === EXPECTED.canonical_domains, 'By theory-integrity har feil denominator');
  assert(theory.summary.fieldsStrictlyProven === EXPECTED.strictly_proven_fields, 'By theory-integrity er ikke 12/12');
  assert(theory.summary.substantiveContentGapsProven === EXPECTED.substantive_content_gaps, 'By theory-integrity har bevist et substansielt innholdshull');
  assert(theory.content_rewrite_required === false, 'By theory-integrity krever uventet innholdsomskriving');

  for (const round of [round1, round2, round3]) {
    assert(round.status === 'passed', `By maintenance round ${round.round} er ikke grønn`);
    assert(round.gates?.claim_provenance_preserved === true, `By maintenance round ${round.round} svekker claim provenance`);
    assert(round.gates?.theory_integrity_scope_unchanged === true, `By maintenance round ${round.round} endrer theory-integrity-scope`);
    assert(round.gates?.subject_architecture_unchanged === true, `By maintenance round ${round.round} endrer fagarkitekturen`);
    assert(round.gates?.completion_status_preserved === true, `By maintenance round ${round.round} endrer completion-status`);
  }
  assert(round1.chapter_count === 5 && round2.chapter_count === 5 && round3.chapter_count === 7, 'By maintenance-rundene dekker ikke 5+5+7 kapitler');
  assert(round3.combined_maintenance_chapter_count === EXPECTED.reconciled_chapters, 'By maintenance-rundene reconciler ikke alle 17 kapitler');
  assert(round3.canonical_chapter_count === EXPECTED.canonical_chapters, 'Round 3 er ikke låst til 17 canonicale kapitler');
  assert(round3.projected_unique_place_count >= EXPECTED.minimum_projected_unique_places, 'By maintenance dokumenterer for få utvidede stedscase');

  assert(maintenance.docs.length === EXPECTED.maintenance_rounds, 'By har feil antall maintenance-runder');
  assert(maintenance.targets.length === EXPECTED.reconciled_chapters, 'By maintenance har feil antall kapittel-targets');
  assert(new Set(maintenance.targets).size === EXPECTED.reconciled_chapters, 'By maintenance-targets overlapper');
  assert(maintenance.cases.length === EXPECTED.maintenance_cases, 'By maintenance har feil antall nye case');
  assert(maintenance.sources.length === EXPECTED.source_refreshes, 'By maintenance har feil antall kildeoppfriskninger');
  assert(new Set(maintenance.sources.map((source) => source.id)).size === EXPECTED.source_refreshes, 'By maintenance-kilde-ID-er overlapper');

  const canonicalChapterIds = complete.canonicalDomainCoverage.flatMap((row) => row.chapterIds);
  assert(new Set(canonicalChapterIds).size === EXPECTED.canonical_chapters, 'By complete-audit har ikke 17 unike canonicale kapittel-ID-er');
  assert(canonicalChapterIds.every((chapterId) => maintenance.targets.includes(chapterId)), 'Minst ett canonicalt By-kapittel mangler post-completion expansion');
  assert(maintenance.targets.every((chapterId) => canonicalChapterIds.includes(chapterId)), 'Maintenance inneholder et ikke-canonicalt By-kapittel');

  const theoryByDomain = new Map(theory.fields.map((field) => [field.domainId, field]));
  const casesByChapter = new Map(maintenance.cases.map((item) => [item.chapter_id, item]));
  const domains = complete.canonicalDomainCoverage.map((domain) => {
    const theoryField = theoryByDomain.get(domain.domainId);
    assert(theoryField?.strictlyProven === true, `${domain.domainId}: strict theory proof mangler`);
    assert(domain.chapterIds.every((chapterId) => casesByChapter.has(chapterId)), `${domain.domainId}: minst ett kapittel mangler post-completion kildebundet case`);
    const chapterAudits = complete.chapterAudits.filter((row) => domain.chapterIds.includes(row.chapterId));
    assert(chapterAudits.length === domain.chapterCount, `${domain.domainId}: chapter-audit denominator er feil`);
    assert(chapterAudits.every((row) => row.paragraphCount >= 27 && row.claimCount >= 18 && row.sourceCount >= 12 && row.methodIds.length >= 1 && row.relatedPlaceIds.length >= 4), `${domain.domainId}: baseline helfagskvalitet er svekket`);
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

  assert(domains.length === EXPECTED.canonical_domains, 'By expanded-quality dekker ikke 12/12 fagområder');
  assert(domains.every((row) => row.strictTheoryProven && row.postCompletionSourceCaseExpansionProven && !row.substantiveContentGapProven), 'By expanded-quality har ulukket fagområde');

  const report = {
    schema: 'history_go_by_expanded_quality_audit_v1',
    version: '1.0.0',
    subject_id: 'by',
    status: 'PROVEN_WHOLE_SUBJECT_EXPANSION',
    canonical_editorial_status_mutated: false,
    canonical_editorial_status: byStatus.editorialStatus,
    quality_status: 'expanded_and_audited',
    content_rewrite_required: false,
    conclusion: 'By har bevist helfags expanded-kvalitet uten ny fagtekst: 17/17 canonicale kapitler fikk dokumentert post-completion kilde- og stedscaseutvidelse gjennom tre disjunkte maintenance-runder, alle 12 fagområder er strict theory-proven, og ingen substansielle innholdshull er påvist. Global Fagverk-lifecycle forblir complete, og den read-only fag-for-fag-planen fra 8. september muteres ikke.',
    summary: {
      canonicalDomains: EXPECTED.canonical_domains,
      canonicalChapters: EXPECTED.canonical_chapters,
      canonicalEmner: EXPECTED.canonical_emner,
      baselineClaims: EXPECTED.baseline_claims,
      baselineSources: EXPECTED.baseline_sources,
      strictFields: EXPECTED.strictly_proven_fields,
      maintenanceRounds: EXPECTED.maintenance_rounds,
      reconciledChapters: EXPECTED.reconciled_chapters,
      maintenanceCases: EXPECTED.maintenance_cases,
      sourceRefreshes: EXPECTED.source_refreshes,
      minimumProjectedUniquePlaces: EXPECTED.minimum_projected_unique_places,
      substantiveContentGapsProven: EXPECTED.substantive_content_gaps
    },
    readOnlyPlanSnapshot: {
      ref: PLAN,
      preserved: true,
      priorExpandedVerdict: planBy.expanded_verdict,
      priorWholeSubjectExpansionProven: planBy.whole_subject_expansion_proven,
      priorContentGapProven: planBy.content_gap_proven
    },
    domains,
    evidence: {
      completeAudit: 'reports/fagverk/by-complete-audit.json',
      theoryAudit: 'reports/fagverk/by-theory-integrity-audit.json',
      maintenanceRounds: ROUND_FILES,
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
    const report = auditByExpandedQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`By expanded-quality OK: ${report.summary.canonicalDomains}/12 fagområder, ${report.summary.reconciledChapters}/17 post-completion-reconciled chapters, ${report.summary.strictFields}/12 strict fields, ${report.summary.substantiveContentGapsProven} innholdshull.`);
  } catch (error) {
    console.error(`By expanded-quality FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
