#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditMediaComplete } from '../scripts/audit-fagverk-media-complete.mjs';
import { auditMediaTheoryIntegrity } from './audit-media-theory-integrity.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'data/fag/media/expanded_quality_contract_v1.json';
const SUBJECT_STATUS = 'data/fagverk/subject_status.json';
const PLAN = 'reports/fagverk/fagverk-expanded-subject-by-subject-audit-v1.json';
const THEORY_BINDINGS = 'data/fag/media/theory_integrity_bindings_media_v1.json';
const LEGACY_ADJUDICATION = 'data/fag/media/legacy_theory_adjudication_v1.json';
const MAINTENANCE_DIR = 'data/fagverk/media/maintenance';
const REPORT = 'reports/fagverk/media-expanded-quality-audit.json';

const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const REQUIRED_RULES = {
  whole_subject_expansion_proof_required: true,
  strict_theory_integrity_alone_is_insufficient: true,
  legacy_equivalence_or_route_retirement_alone_is_insufficient: true,
  missing_expansion_proof_is_not_automatically_a_content_gap: true,
  separate_post_completion_quality_expansion_evidence_required: true,
  content_rewrite_allowed_only_for_proven_substantive_gap: true,
  quality_status_is_separate_from_global_editorial_lifecycle: true,
  global_subject_lifecycle_is_read_only_for_this_audit: true,
  global_subject_by_subject_plan_is_read_only: true,
  all_declared_rules_and_required_gates_are_enforced: true
};

const EXPECTED = {
  canonical_domains: 6,
  canonical_chapters: 6,
  canonical_emner: 120,
  canonical_methods: 115,
  baseline_claims: 160,
  baseline_sources: 126,
  baseline_unique_places: 15,
  strictly_proven_fields: 6,
  theory_objects: 12,
  legacy_knowledge_sections: 10,
  legacy_canonical_supersedes: 10,
  legacy_migrated_sections: 0,
  post_completion_expansion_artifacts: 0,
  substantive_content_gaps: 0
};

const REQUIRED_GATES = [
  'scripts/audit-fagverk-media-complete.mjs',
  'tools/audit-media-theory-integrity.mjs',
  'scripts/audit-fagverk-media-legacy-theory.mjs',
  'scripts/audit-fagverk-media-legacy-adjudication.mjs',
  'tools/audit-media-expanded-quality.mjs',
  'tests/media-expanded-quality.test.mjs'
];

function runJsonScript(script) {
  const result = spawnSync(process.execPath, [script], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${script} feilet:\n${result.stderr || result.stdout}`);
  return JSON.parse(result.stdout);
}

function assertContract(contract) {
  assert(contract.schema === 'history_go_media_expanded_quality_contract_v1', 'Ugyldig Media expanded-quality-kontrakt');
  assert(contract.version === '1.0.0' && contract.status === 'active', 'Media expanded-quality-kontrakten er ikke aktiv v1.0.0');
  assert(JSON.stringify(contract.rules) === JSON.stringify(REQUIRED_RULES), 'Media expanded-quality-reglene er svekket, mangler eller har ukjente tillegg');
  assert(JSON.stringify(contract.expected) === JSON.stringify(EXPECTED), 'Media expanded-quality-denominator eller nullkøer er endret');
  assert(JSON.stringify(contract.required_gates) === JSON.stringify(REQUIRED_GATES), 'Media expanded-quality required_gates er usynkronisert');
  assert(contract.read_only_plan_ref === PLAN, 'Media expanded-quality-kontrakten peker ikke til den read-only fag-for-fag-planen');
  for (const gate of REQUIRED_GATES) assert(fs.existsSync(abs(gate)), `Påkrevd Media expanded-quality-gate mangler: ${gate}`);
}

export function auditMediaExpandedQuality({ writeReport = false, checkReport = true } = {}) {
  const contract = json(CONTRACT);
  const status = json(SUBJECT_STATUS);
  const plan = json(PLAN);
  const theoryBindings = json(THEORY_BINDINGS);
  const legacyAdjudicationData = json(LEGACY_ADJUDICATION);
  assertContract(contract);

  const { report: complete } = auditMediaComplete({ writeReport: false, checkReport: true });
  const theory = auditMediaTheoryIntegrity({ writeReport: false, checkReport: true });
  const legacyAudit = runJsonScript('scripts/audit-fagverk-media-legacy-theory.mjs');
  const legacyAdjudication = runJsonScript('scripts/audit-fagverk-media-legacy-adjudication.mjs');

  const mediaStatus = status.subjects.find((row) => row.id === 'media');
  assert(mediaStatus, 'Global Fagverk-status mangler Media');
  assert(mediaStatus.editorialStatus === 'complete', 'Denne auditen skal ikke mutere global Media lifecycle-status');
  assert(mediaStatus.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Global Media nextGate er uventet endret');

  assert(plan.status === 'read_only_fail_closed_audit_complete', 'Fag-for-fag-planen er ikke lenger read-only fail-closed');
  assert(plan.standard?.strict_theory_integrity_alone_is_insufficient === true, 'Planen tillater uventet theory-only expanded proof');
  assert(plan.standard?.missing_expansion_proof_is_not_automatically_a_content_gap === true, 'Planen skiller ikke lenger proof gap fra content gap');
  const planMedia = plan.subjects.find((row) => row.id === 'media');
  assert(planMedia, 'Read-only fag-for-fag-plan mangler Media');
  assert(planMedia.whole_subject_expansion_proven === false, 'Read-only plan-snapshot skal ikke muteres av denne auditen');
  assert(planMedia.content_gap_proven === false, 'Read-only plan-snapshot skal fortsatt vise at intet innholdshull var bevist');
  assert(planMedia.expanded_verdict === 'HIGH_QUALITY_COMPLETE_NO_SEPARATE_WHOLE_SUBJECT_EXPANSION_PROOF', 'Read-only plan-snapshot har uventet Media-verdict');

  assert(complete.status === 'complete', 'Media baseline complete-audit er ikke grønn');
  assert(complete.summary.domainCount === EXPECTED.canonical_domains, 'Media har feil antall canonicale fagområder');
  assert(complete.summary.chapterCount === EXPECTED.canonical_chapters, 'Media har feil antall canonicale kapitler');
  assert(complete.summary.emneCount === EXPECTED.canonical_emner, 'Media har feil antall canonicale emner');
  assert(complete.summary.methodCount === EXPECTED.canonical_methods, 'Media har feil antall canonicale metoder');
  assert(complete.summary.claimCount === EXPECTED.baseline_claims, 'Media baseline claim-telling har endret seg');
  assert(complete.summary.sourceCount === EXPECTED.baseline_sources, 'Media baseline source-telling har endret seg');
  assert(complete.summary.uniquePlaceCount === EXPECTED.baseline_unique_places, 'Media baseline stedscase-telling har endret seg');

  assert(theory.status === 'STRICTLY_PROVEN', 'Media theory-integrity er ikke STRICTLY_PROVEN');
  assert(theory.summary.canonicalMajorFields === EXPECTED.canonical_domains, 'Media theory-integrity har feil denominator');
  assert(theory.summary.fieldsStrictlyProven === EXPECTED.strictly_proven_fields, 'Media theory-integrity er ikke 6/6');
  assert(theory.summary.theoryObjects === EXPECTED.theory_objects, 'Media theory-integrity har feil theory-object-telling');
  assert(theory.summary.substantiveContentGapsProven === EXPECTED.substantive_content_gaps, 'Media theory-integrity har bevist et substansielt innholdshull');
  assert(theory.content_rewrite_required === false, 'Media theory-integrity krever uventet innholdsomskriving');
  assert(theoryBindings.completion_status_read_only === true && theoryBindings.content_mutation === false, 'Media theory bridge er ikke lenger read-only proof selection');

  assert(legacyAudit.summary?.knowledgeSectionCount === EXPECTED.legacy_knowledge_sections, 'Media legacy-audit har feil knowledge denominator');
  assert(legacyAudit.summary?.anchorCompleteCount === EXPECTED.legacy_knowledge_sections, 'Media legacy-audit har fortsatt canonicale ankerhull');
  assert(legacyAudit.summary?.manualReviewCount === 0, 'Media legacy-audit har uavklarte manuelle gap');
  assert(legacyAdjudication.summary?.canonicalSupersedesCount === EXPECTED.legacy_canonical_supersedes, 'Media legacy-adjudisering har feil canonical_supersedes-telling');
  assert(legacyAdjudication.summary?.migratedSectionCount === EXPECTED.legacy_migrated_sections, 'Media legacy-adjudisering har faktiske migreringer og må revurderes');
  assert(legacyAdjudication.summary?.redirectReady === true, 'Media legacy-adjudisering er ikke fullført');
  assert((legacyAdjudicationData.sections || []).every((row) => (row.migration_refs || []).length === 0), 'Media legacy-adjudisering inneholder migreringsbevis som må revurderes');

  const postCompletionExpansionArtifacts = fs.existsSync(abs(MAINTENANCE_DIR))
    ? fs.readdirSync(abs(MAINTENANCE_DIR)).filter((name) => !name.startsWith('.')).length
    : 0;
  assert(postCompletionExpansionArtifacts === EXPECTED.post_completion_expansion_artifacts, 'Media har fått post-completion expansion-artefakter; bounded audit må revurderes');

  const theoryByDomain = new Map(theory.fields.map((field) => [field.domainId, field]));
  const domains = complete.canonicalDomainCoverage.map((domain) => {
    const theoryField = theoryByDomain.get(domain.domainId);
    assert(theoryField?.strictlyProven === true, `${domain.domainId}: strict theory proof mangler`);
    return {
      domainId: domain.domainId,
      chapterIds: domain.chapterIds,
      strictTheoryProven: true,
      separatePostCompletionExpansionEvidence: false,
      substantiveContentGapProven: false
    };
  });
  assert(domains.length === EXPECTED.canonical_domains, 'Media expanded-quality-audit dekker ikke 6/6 fagområder');

  const report = {
    schema: 'history_go_media_expanded_quality_audit_v1',
    version: '1.0.0',
    subject_id: 'media',
    status: 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN',
    canonical_editorial_status_mutated: false,
    canonical_editorial_status: mediaStatus.editorialStatus,
    quality_status: 'high_quality_complete_without_separate_whole_subject_expansion_proof',
    whole_subject_expansion_proven: false,
    content_gap_proven: false,
    content_rewrite_required: false,
    conclusion: 'Media består bounded whole-subject-auditen som et sterkt complete-fag, men separate expanded-status kan ikke bevises. 6/6 felt er strict theory-proven, 10/10 legacy-kunnskapsseksjoner er canonicalt superseded uten migrering, og 0 substansielle innholdshull er påvist. Samtidig finnes ingen separat post-completion source/case- eller annen kvalitetsutvidelse over de seks canonicale kapitlene. Manglende expansion-proof skal derfor ikke konverteres til kunstig innholdsproduksjon.',
    summary: {
      canonicalDomains: EXPECTED.canonical_domains,
      canonicalChapters: EXPECTED.canonical_chapters,
      canonicalEmner: EXPECTED.canonical_emner,
      canonicalMethods: EXPECTED.canonical_methods,
      baselineClaims: EXPECTED.baseline_claims,
      baselineSources: EXPECTED.baseline_sources,
      baselineUniquePlaces: EXPECTED.baseline_unique_places,
      strictFields: EXPECTED.strictly_proven_fields,
      theoryObjects: EXPECTED.theory_objects,
      legacyKnowledgeSections: EXPECTED.legacy_knowledge_sections,
      legacyCanonicalSupersedes: EXPECTED.legacy_canonical_supersedes,
      legacyMigratedSections: EXPECTED.legacy_migrated_sections,
      postCompletionExpansionArtifacts,
      substantiveContentGapsProven: EXPECTED.substantive_content_gaps
    },
    readOnlyPlanSnapshot: {
      ref: PLAN,
      preserved: true,
      priorExpandedVerdict: planMedia.expanded_verdict,
      priorWholeSubjectExpansionProven: planMedia.whole_subject_expansion_proven,
      priorContentGapProven: planMedia.content_gap_proven
    },
    domains,
    nextAction: 'Do not create Media content without a demonstrated qualitative gap. Whole-subject expansion proof can be reopened only after explicit post-completion quality expansion evidence exists or a future bounded audit proves a real content gap.',
    evidence: {
      completeAudit: 'reports/fagverk/media-complete-audit.json',
      theoryAudit: 'reports/fagverk/media-theory-integrity-audit.json',
      theoryBindings: THEORY_BINDINGS,
      legacyTheoryAudit: 'reports/fagverk/media-legacy-theory-audit.json',
      legacyAdjudication: LEGACY_ADJUDICATION,
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
    const report = auditMediaExpandedQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Media whole-subject audit OK: ${report.summary.canonicalDomains}/6 fagområder strict-proven, ${report.summary.postCompletionExpansionArtifacts} post-completion expansion-artefakter, ${report.summary.substantiveContentGapsProven} innholdshull, expanded=${report.whole_subject_expansion_proven}.`);
  } catch (error) {
    console.error(`Media expanded-quality FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
