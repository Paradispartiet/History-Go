#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditRepository } from '../scripts/audit-fagverk-musikk.mjs';
import { auditMusikkTheoryIntegrity } from './audit-musikk-theory-integrity.mjs';
import { auditMusikkSourceRefreshPlaceCaseExpansion } from '../scripts/audit-musikk-source-refresh-place-case-expansion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'data/fag/musikk/expanded_quality_contract_v1.json';
const SUBJECT_STATUS = 'data/fagverk/subject_status.json';
const PLAN = 'reports/fagverk/fagverk-expanded-subject-by-subject-audit-v1.json';
const THEORY_BINDINGS = 'data/fag/musikk/musikkvitenskap_canonical_v1/theory_integrity_bindings_v1.json';
const LEGACY_ADJUDICATION = 'data/fag/musikk/legacy_theory_adjudication_v1.json';
const ROUND_FILE = 'data/fagverk/musikk/maintenance/source-refresh-place-case-expansion-round1-2026-09-11.json';
const REPORT = 'reports/fagverk/musikk-expanded-quality-audit.json';

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
  legacy_equivalence_or_route_retirement_alone_is_insufficient: true,
  content_rewrite_allowed_only_for_proven_substantive_gap: true,
  quality_status_is_separate_from_global_editorial_lifecycle: true,
  global_subject_lifecycle_is_read_only_for_this_reconciliation: true,
  global_subject_by_subject_plan_is_read_only: true,
  all_declared_rules_and_required_gates_are_enforced: true
};

const EXPECTED = {
  canonical_domains: 8,
  canonical_chapters: 8,
  canonical_emner: 48,
  canonical_methods: 18,
  baseline_claims: 55,
  baseline_sources: 67,
  baseline_paragraphs: 216,
  baseline_unique_places: 0,
  strictly_proven_fields: 8,
  theory_objects: 16,
  legacy_knowledge_sections: 8,
  legacy_canonical_supersedes: 8,
  legacy_migrated_sections: 0,
  maintenance_rounds: 1,
  reconciled_chapters: 8,
  maintenance_cases: 8,
  source_refreshes: 16,
  projected_unique_places: 8,
  substantive_content_gaps: 0
};

const REQUIRED_GATES = [
  'scripts/audit-fagverk-musikk.mjs',
  'tools/audit-musikk-theory-integrity.mjs',
  'scripts/audit-fagverk-musikk-legacy-theory.mjs',
  'scripts/audit-fagverk-musikk-legacy-adjudication.mjs',
  'scripts/audit-musikk-source-refresh-place-case-expansion.mjs',
  'tools/audit-musikk-expanded-quality.mjs',
  'tests/musikk-expanded-quality.test.mjs'
];

function runJsonScript(script) {
  const result = spawnSync(process.execPath, [script], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${script} feilet:\n${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout);
}

function assertContract(contract) {
  assert(contract.schema === 'history_go_musikk_expanded_quality_contract_v1', 'Ugyldig Musikk expanded-quality-kontrakt');
  assert(contract.version === '1.1.0' && contract.status === 'active', 'Musikk expanded-quality-kontrakten er ikke aktiv v1.1.0');
  assert(JSON.stringify(contract.rules) === JSON.stringify(REQUIRED_RULES), 'Musikk expanded-quality-reglene er svekket, mangler eller har ukjente tillegg');
  assert(JSON.stringify(contract.expected) === JSON.stringify(EXPECTED), 'Musikk expanded-quality-denominator eller nullkøer er endret');
  assert(JSON.stringify(contract.required_gates) === JSON.stringify(REQUIRED_GATES), 'Musikk expanded-quality required_gates er usynkronisert');
  assert(contract.read_only_plan_ref === PLAN, 'Musikk expanded-quality-kontrakten peker ikke til den read-only fag-for-fag-planen');
  for (const gate of REQUIRED_GATES) assert(fs.existsSync(abs(gate)), `Påkrevd Musikk expanded-quality-gate mangler: ${gate}`);
}

export function auditMusikkExpandedQuality({ writeReport = false, checkReport = true } = {}) {
  const contract = json(CONTRACT);
  const status = json(SUBJECT_STATUS);
  const plan = json(PLAN);
  const theoryBindings = json(THEORY_BINDINGS);
  const legacyAdjudicationData = json(LEGACY_ADJUDICATION);
  const maintenanceDoc = json(ROUND_FILE);
  assertContract(contract);

  const { report: complete } = auditRepository({ writeReport: false, checkReport: true });
  const theory = auditMusikkTheoryIntegrity({ writeReport: false, checkReport: true });
  const legacyAudit = runJsonScript('scripts/audit-fagverk-musikk-legacy-theory.mjs');
  const legacyAdjudication = runJsonScript('scripts/audit-fagverk-musikk-legacy-adjudication.mjs');
  const maintenance = auditMusikkSourceRefreshPlaceCaseExpansion();

  const musikkStatus = status.subjects.find((row) => row.id === 'musikk');
  assert(musikkStatus, 'Global Fagverk-status mangler Musikk');
  assert(musikkStatus.editorialStatus === 'complete', 'Denne reconciliationen skal ikke mutere global Musikk lifecycle-status');
  assert(musikkStatus.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Global Musikk nextGate er uventet endret');

  assert(plan.status === 'read_only_fail_closed_audit_complete', 'Fag-for-fag-planen er ikke lenger read-only fail-closed');
  assert(plan.standard?.strict_theory_integrity_alone_is_insufficient === true, 'Planen tillater uventet theory-only expanded proof');
  assert(plan.standard?.missing_expansion_proof_is_not_automatically_a_content_gap === true, 'Planen skiller ikke lenger proof gap fra content gap');
  const planMusikk = plan.subjects.find((row) => row.id === 'musikk');
  assert(planMusikk, 'Read-only fag-for-fag-plan mangler Musikk');
  assert(planMusikk.whole_subject_expansion_proven === false, 'Read-only plan-snapshot skal ikke muteres av denne reconciliationen');
  assert(planMusikk.content_gap_proven === false, 'Read-only plan-snapshot skal fortsatt vise at intet innholdshull var bevist');
  assert(planMusikk.expanded_verdict === 'HIGH_QUALITY_COMPLETE_NO_SEPARATE_WHOLE_SUBJECT_EXPANSION_PROOF', 'Read-only plan-snapshot har uventet Musikk-verdict');

  assert(complete.status === 'complete', 'Musikk baseline subject-audit er ikke grønn');
  assert(complete.summary.domainCount === EXPECTED.canonical_domains, 'Musikk har feil antall canonicale fagområder');
  assert(complete.summary.chapterCount === EXPECTED.canonical_chapters, 'Musikk har feil antall canonicale kapitler');
  assert(complete.summary.emneCount === EXPECTED.canonical_emner, 'Musikk har feil antall canonicale emner');
  assert(complete.summary.methodCount === EXPECTED.canonical_methods, 'Musikk har feil antall canonicale metoder');
  assert(complete.summary.chapterClaimCount === EXPECTED.baseline_claims, 'Musikk baseline claim-telling har endret seg');
  assert(complete.summary.chapterSourceCount === EXPECTED.baseline_sources, 'Musikk baseline source-telling har endret seg');
  assert(complete.summary.chapterParagraphCount === EXPECTED.baseline_paragraphs, 'Musikk baseline avsnittstelling har endret seg');
  assert(complete.summary.placeCount === EXPECTED.baseline_unique_places, 'Musikk baseline stedscase-telling har endret seg');

  assert(theory.status === 'STRICTLY_PROVEN', 'Musikk theory-integrity er ikke STRICTLY_PROVEN');
  assert(theory.summary.canonicalMajorFields === EXPECTED.canonical_domains, 'Musikk theory-integrity har feil denominator');
  assert(theory.summary.fieldsStrictlyProven === EXPECTED.strictly_proven_fields, 'Musikk theory-integrity er ikke 8/8');
  assert(theory.summary.theoryObjects === EXPECTED.theory_objects, 'Musikk theory-integrity har feil theory-object-telling');
  assert(theory.summary.substantiveContentGapsProven === EXPECTED.substantive_content_gaps, 'Musikk theory-integrity har bevist et substansielt innholdshull');
  assert(theory.content_rewrite_required === false, 'Musikk theory-integrity krever uventet innholdsomskriving');
  assert(theoryBindings.completion_status_read_only === true && theoryBindings.content_mutation === false, 'Musikk theory bridge er ikke lenger read-only proof selection');

  assert(legacyAudit.summary?.knowledgeSectionCount === EXPECTED.legacy_knowledge_sections, 'Musikk legacy-audit har feil knowledge denominator');
  assert(legacyAudit.summary?.anchorCompleteCount === EXPECTED.legacy_knowledge_sections, 'Musikk legacy-audit har fortsatt canonicale ankerhull');
  assert(legacyAudit.summary?.manualReviewCount === 0, 'Musikk legacy-audit har uavklarte manuelle gap');
  assert(legacyAdjudication.summary?.canonicalSupersedesCount === EXPECTED.legacy_canonical_supersedes, 'Musikk legacy-adjudisering har feil canonical_supersedes-telling');
  assert(legacyAdjudication.summary?.migratedSectionCount === EXPECTED.legacy_migrated_sections, 'Musikk legacy-adjudisering har faktiske migreringer og må revurderes');
  assert(legacyAdjudication.summary?.redirectReady === true, 'Musikk legacy-adjudisering er ikke fullført');
  assert((legacyAdjudicationData.sections || []).filter((row) => row.role === 'knowledge').every((row) => (row.migration_refs || []).length === 0), 'Musikk legacy-adjudisering inneholder migreringsbevis som må revurderes');

  assert(maintenance.status === 'passed', 'Musikk maintenance round 1 er ikke grønn');
  assert(maintenance.round === 1, 'Musikk expanded-quality forventer eksakt maintenance round 1');
  assert(maintenance.chapter_count === EXPECTED.reconciled_chapters, 'Musikk maintenance reconciler ikke alle 8 kapitler');
  assert(maintenance.canonical_chapter_count === EXPECTED.canonical_chapters, 'Musikk maintenance er ikke låst til 8 canonicale kapitler');
  assert(maintenance.case_count === EXPECTED.maintenance_cases, 'Musikk maintenance har feil antall nye case');
  assert(maintenance.source_refresh_count === EXPECTED.source_refreshes, 'Musikk maintenance har feil antall kildekontroller');
  assert(maintenance.baseline_unique_place_count === EXPECTED.baseline_unique_places, 'Musikk maintenance bruker feil stedscase-baseline');
  assert(maintenance.projected_unique_place_count === EXPECTED.projected_unique_places, 'Musikk maintenance dokumenterer feil projisert stedscasebredde');
  assert(maintenance.gates?.claim_provenance_preserved === true, 'Musikk maintenance svekker claim provenance');
  assert(maintenance.gates?.theory_integrity_scope_unchanged === true, 'Musikk maintenance endrer theory-integrity-scope');
  assert(maintenance.gates?.subject_architecture_unchanged === true, 'Musikk maintenance endrer fagarkitekturen');
  assert(maintenance.gates?.completion_status_preserved === true, 'Musikk maintenance endrer completion-status');
  assert(maintenance.gates?.existing_place_only === true, 'Musikk maintenance introduserer uventet stedsproduksjon');
  assert(maintenance.gates?.no_chapter_prose_rewrite === true, 'Musikk maintenance omskriver uventet kapittelprosa');

  assert(maintenanceDoc.status === 'verified', 'Musikk maintenance-evidence er ikke verified');
  assert(maintenanceDoc.scope?.maintenance_evidence_only === true, 'Musikk maintenance skal være evidence-only');
  assert(maintenanceDoc.scope?.place_production === false && maintenanceDoc.scope?.chapter_prose_rewrite === false, 'Musikk maintenance skal verken produsere steder eller omskrive kapitler');
  assert(maintenanceDoc.target_chapters.length === EXPECTED.reconciled_chapters, 'Musikk maintenance har feil target-denominator');
  assert(new Set(maintenanceDoc.target_chapters).size === EXPECTED.reconciled_chapters, 'Musikk maintenance-targets overlapper');
  assert(maintenanceDoc.cases.length === EXPECTED.maintenance_cases, 'Musikk maintenance-doc har feil case-denominator');
  assert(maintenanceDoc.source_refresh.length === EXPECTED.source_refreshes, 'Musikk maintenance-doc har feil source-denominator');
  assert(new Set(maintenanceDoc.source_refresh.map((source) => source.id)).size === EXPECTED.source_refreshes, 'Musikk maintenance-kilde-ID-er overlapper');

  const canonicalChapterIds = complete.chapterAudits.map((row) => row.chapterId);
  assert(new Set(canonicalChapterIds).size === EXPECTED.canonical_chapters, 'Musikk subject-audit har ikke 8 unike canonicale kapittel-ID-er');
  assert(canonicalChapterIds.every((chapterId) => maintenanceDoc.target_chapters.includes(chapterId)), 'Minst ett canonicalt Musikk-kapittel mangler post-completion expansion');
  assert(maintenanceDoc.target_chapters.every((chapterId) => canonicalChapterIds.includes(chapterId)), 'Maintenance inneholder et ikke-canonicalt Musikk-kapittel');

  const theoryByDomain = new Map(theory.fields.map((field) => [field.domainId, field]));
  const casesByChapter = new Map(maintenanceDoc.cases.map((item) => [item.chapter_id, item]));
  const domains = complete.canonicalDomainOrder.map((domainId) => {
    const theoryField = theoryByDomain.get(domainId);
    assert(theoryField?.strictlyProven === true, `${domainId}: strict theory proof mangler`);
    const chapter = complete.chapterAudits.find((row) => row.domainId === domainId);
    assert(chapter, `${domainId}: canonicalt Musikk-kapittel mangler`);
    assert(casesByChapter.has(chapter.chapterId), `${domainId}: kapittelet mangler post-completion kildebundet stedscase`);
    assert(chapter.paragraphCount >= 27 && chapter.claimCount >= 1 && chapter.sourceCount >= 1, `${domainId}: baseline helfagskvalitet er svekket`);
    return {
      domainId,
      chapterId: chapter.chapterId,
      strictTheoryProven: true,
      postCompletionSourceCaseExpansionProven: true,
      postCompletionCaseCount: 1,
      substantiveContentGapProven: false
    };
  });
  assert(domains.length === EXPECTED.canonical_domains, 'Musikk expanded-quality dekker ikke 8/8 fagområder');
  assert(domains.every((row) => row.strictTheoryProven && row.postCompletionSourceCaseExpansionProven && !row.substantiveContentGapProven), 'Musikk expanded-quality har ulukket fagområde');

  const report = {
    schema: 'history_go_musikk_expanded_quality_audit_v1',
    version: '1.1.0',
    subject_id: 'musikk',
    status: 'PROVEN_WHOLE_SUBJECT_EXPANSION',
    canonical_editorial_status_mutated: false,
    canonical_editorial_status: musikkStatus.editorialStatus,
    quality_status: 'expanded_and_audited',
    whole_subject_expansion_proven: true,
    content_gap_proven: false,
    content_rewrite_required: false,
    conclusion: 'Musikk har bevist helfags expanded-kvalitet uten omskriving av de åtte canonicale kapitlene: 8/8 kapitler fikk dokumentert post-completion kilde- og stedscaseutvidelse i en permanent maintenance-runde med 16 kildeoppfriskninger og 8 eksisterende canonicale stedanker. Alle 8 fagområder forblir strict theory-proven, legacy-reconciliationen forblir 8/8 uten migrering, og 0 substansielle innholdshull er påvist. Global Fagverk-lifecycle forblir complete, og den historiske read-only fag-for-fag-planen muteres ikke.',
    summary: {
      canonicalDomains: EXPECTED.canonical_domains,
      canonicalChapters: EXPECTED.canonical_chapters,
      canonicalEmner: EXPECTED.canonical_emner,
      canonicalMethods: EXPECTED.canonical_methods,
      baselineClaims: EXPECTED.baseline_claims,
      baselineSources: EXPECTED.baseline_sources,
      baselineParagraphs: EXPECTED.baseline_paragraphs,
      baselineUniquePlaces: EXPECTED.baseline_unique_places,
      strictFields: EXPECTED.strictly_proven_fields,
      theoryObjects: EXPECTED.theory_objects,
      legacyKnowledgeSections: EXPECTED.legacy_knowledge_sections,
      legacyCanonicalSupersedes: EXPECTED.legacy_canonical_supersedes,
      legacyMigratedSections: EXPECTED.legacy_migrated_sections,
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
      priorExpandedVerdict: planMusikk.expanded_verdict,
      priorWholeSubjectExpansionProven: planMusikk.whole_subject_expansion_proven,
      priorContentGapProven: planMusikk.content_gap_proven
    },
    domains,
    evidence: {
      completeAudit: 'reports/fagverk/musikk-subject-audit.json',
      theoryAudit: 'reports/fagverk/musikk-theory-integrity-audit.json',
      theoryBindings: THEORY_BINDINGS,
      legacyTheoryAudit: 'reports/fagverk/musikk-legacy-theory-audit.json',
      legacyAdjudication: LEGACY_ADJUDICATION,
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
    const report = auditMusikkExpandedQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Musikk expanded-quality OK: ${report.summary.canonicalDomains}/8 fagområder, ${report.summary.reconciledChapters}/8 post-completion-reconciled chapters, ${report.summary.strictFields}/8 strict fields, ${report.summary.substantiveContentGapsProven} innholdshull.`);
  } catch (error) {
    console.error(`Musikk expanded-quality FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
