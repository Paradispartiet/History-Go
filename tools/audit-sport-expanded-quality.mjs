#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditSportPhase3 } from '../scripts/audit-fagverk-sport-phase3.mjs';
import { auditSportTheoryIntegrity } from './audit-sport-theory-integrity.mjs';
import { auditSportLegacyTheory } from '../scripts/audit-fagverk-sport-legacy-theory.mjs';
import { auditSportLegacyAdjudication } from '../scripts/audit-fagverk-sport-legacy-adjudication.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACT = 'data/fag/sport/expanded_quality_contract_v1.json';
const PLAN = 'reports/fagverk/fagverk-expanded-subject-by-subject-audit-v1.json';
const STATUS = 'data/fagverk/subject_status.json';
const REPORT = 'reports/fagverk/sport-expanded-quality-audit.json';
const MAINTENANCE_DIR = 'data/fagverk/sport/maintenance';
const ORDER = ['arenaer_steder_groundhopper','regler_spill_konkurranse','kropp_trening_prestasjon','klubber_lag_frivillighet','supportere_publikum_kultur','inkludering_helse_lek_samfunn'];
const CHAPTERS = ['arenaer-steder-groundhopper','regler-spill-konkurranse','kropp-trening-prestasjon','klubber-lag-frivillighet','supportere-publikum-kultur','inkludering-helse-lek-samfunn'];
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

function countExpansionArtifacts() {
  if (!fs.existsSync(abs(MAINTENANCE_DIR))) return 0;
  return fs.readdirSync(abs(MAINTENANCE_DIR), { recursive: true }).filter((entry) => {
    const file = path.join(abs(MAINTENANCE_DIR), String(entry));
    return fs.existsSync(file) && fs.statSync(file).isFile();
  }).length;
}

export function auditSportExpandedQuality({ writeReport = false, checkReport = true } = {}) {
  const contract = json(CONTRACT);
  const phase3 = auditSportPhase3({ checkReport: true }).report;
  const theory = auditSportTheoryIntegrity({ checkReport: true });
  const legacy = auditSportLegacyTheory();
  const adjudication = auditSportLegacyAdjudication();
  const status = json(STATUS).subjects.find((row) => row.id === 'sport');
  const plan = json(PLAN).subjects.find((row) => row.id === 'sport');
  const expected = contract.expected_baseline;
  const expansionArtifacts = countExpansionArtifacts();

  assert(contract.subject_id === 'sport', 'Sport expanded-quality contract har feil subject.');
  assert(contract.rules.whole_subject_expansion_proof_required === true, 'Sport contract må kreve helfagsbevis.');
  assert(contract.rules.strict_theory_integrity_alone_is_insufficient === true, 'Strict theory kan ikke alene være expansion proof.');
  assert(contract.rules.legacy_equivalence_or_route_retirement_alone_is_insufficient === true, 'Legacy equivalence/retirement kan ikke alene være expansion proof.');
  assert(contract.rules.missing_expansion_proof_is_not_a_content_gap === true, 'Manglende proof må skilles fra content gap.');
  assert(contract.rules.new_content_requires_demonstrated_substantive_gap === true, 'Ny Sport-prosa skal kreve bevist substansielt hull.');

  assert(status.editorialStatus === 'complete', 'Sport canonical lifecycle må forbli complete.');
  assert(status.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Sport canonical maintenance gate har endret seg.');
  assert(plan.canonical_editorial_status === 'complete', 'Read-only Sport-planen må fortsatt beskrive complete lifecycle.');
  assert(plan.whole_subject_expansion_proven === false && plan.content_gap_proven === false, 'Read-only Sport-planen skal ikke muteres av reconciliation.');

  assert(phase3.status === 'sport_complete', 'Sport phase-3 må være complete.');
  assert(phase3.summary.domainCount === expected.canonical_domains, 'Sport domain baseline mismatch.');
  assert(phase3.summary.emneCount === expected.canonical_emner, 'Sport emne baseline mismatch.');
  assert(phase3.summary.methodCount === expected.canonical_methods, 'Sport metode baseline mismatch.');
  assert(phase3.summary.hookCount === expected.canonical_hooks, 'Sport hook baseline mismatch.');
  assert(phase3.summary.registeredChapterCount === expected.canonical_chapters, 'Sport chapter baseline mismatch.');
  assert(phase3.summary.sectionCount === expected.chapter_sections, 'Sport section baseline mismatch.');
  assert(phase3.summary.paragraphCount === expected.chapter_paragraphs, 'Sport paragraph baseline mismatch.');
  assert(phase3.summary.claimCount === expected.chapter_claims, 'Sport claim baseline mismatch.');
  assert(phase3.summary.sourceRegistrationCount === expected.chapter_source_registrations, 'Sport source baseline mismatch.');

  assert(theory.status === 'STRICTLY_PROVEN', 'Sport strict theory må fortsatt være proven.');
  assert(theory.summary.fieldsStrictlyProven === expected.strict_fields, 'Sport strict-field baseline mismatch.');
  assert(theory.summary.theoryObjects === expected.strict_theory_objects, 'Sport theory-object baseline mismatch.');
  assert(theory.summary.universalArticlesValidated === expected.standalone_articles, 'Sport universal article gate mismatch.');
  assert(theory.summary.substantiveContentGapsProven === 0 && theory.content_rewrite_required === false, 'Sport theory proof har påvist et uventet content gap.');
  assert(theory.completion_status_read_only === true, 'Sport strict proof må være read-only.');

  assert(legacy.summary.knowledgeSectionCount === expected.legacy_knowledge_sections, 'Sport legacy knowledge count mismatch.');
  assert(legacy.summary.anchorCompleteCount === expected.legacy_knowledge_sections && legacy.summary.manualReviewCount === 0, 'Sport legacy raw audit er ikke 10/10 komplett.');
  assert(adjudication.summary.canonicalSupersedesCount === expected.legacy_canonical_supersedes, 'Sport legacy supersedes count mismatch.');
  assert(adjudication.summary.migratedSectionCount === expected.legacy_migrated_sections, 'Sport legacy migration count mismatch.');
  assert(adjudication.summary.redirectReady === true, 'Sport legacy route retirement er ikke ferdig adjudicated.');
  assert(expansionArtifacts === expected.post_completion_whole_subject_expansion_artifacts, 'Sport har fått nye post-completion expansion artifacts; auditen må revurderes før merge.');

  const report = {
    schema: 'history_go_sport_expanded_quality_audit_v1',
    version: '1.0.0',
    subject_id: 'sport',
    status: 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN',
    canonical_editorial_status_mutated: false,
    canonical_editorial_status: 'complete',
    quality_status: 'high_quality_complete_without_separate_whole_subject_expansion_proof',
    whole_subject_expansion_proven: false,
    content_gap_proven: false,
    content_rewrite_required: false,
    conclusion: 'Sport består bounded whole-subject-auditen som et sterkt complete-fag. 6/6 felt er strict theory-proven, 116/116 artikler passerer universal theory/claim-gaten, og legacy-reconciliationen er fullført med 9 canonical_supersedes + 1 avgrenset migrated_to_canonical uten strukturell utvidelse. Det finnes fortsatt ingen separat post-completion kvalitetsutvidelse over alle seks canonicale kapitlene. Manglende expansion-proof skal derfor ikke konverteres til kunstig innholdsproduksjon.',
    summary: {
      canonicalDomains: phase3.summary.domainCount,
      canonicalChapters: phase3.summary.registeredChapterCount,
      canonicalEmner: phase3.summary.emneCount,
      canonicalMethods: phase3.summary.methodCount,
      canonicalHooks: phase3.summary.hookCount,
      baselineSections: phase3.summary.sectionCount,
      baselineParagraphs: phase3.summary.paragraphCount,
      baselineClaims: phase3.summary.claimCount,
      baselineSources: phase3.summary.sourceRegistrationCount,
      standaloneArticles: theory.summary.universalArticlesValidated,
      strictFields: theory.summary.fieldsStrictlyProven,
      theoryObjects: theory.summary.theoryObjects,
      legacyKnowledgeSections: legacy.summary.knowledgeSectionCount,
      legacyCanonicalSupersedes: adjudication.summary.canonicalSupersedesCount,
      legacyMigratedSections: adjudication.summary.migratedSectionCount,
      postCompletionExpansionArtifacts: expansionArtifacts,
      substantiveContentGapsProven: 0
    },
    readOnlyPlanSnapshot: {
      ref: PLAN,
      preserved: true,
      priorExpandedVerdict: plan.expanded_verdict,
      priorWholeSubjectExpansionProven: plan.whole_subject_expansion_proven,
      priorContentGapProven: plan.content_gap_proven
    },
    domains: ORDER.map((domainId, index) => ({
      domainId,
      chapterId: CHAPTERS[index],
      strictTheoryProven: true,
      separatePostCompletionExpansionEvidence: false,
      substantiveContentGapProven: false
    })),
    nextAction: 'Do not create Sport content without a demonstrated qualitative gap. Reopen whole-subject expansion proof only after explicit post-completion quality expansion evidence exists or a future bounded audit proves a real content gap.',
    evidence: {
      completeAudit: 'reports/fagverk/sport-phase3-audit.json',
      theoryAudit: 'reports/fagverk/sport-theory-integrity-audit.json',
      theoryBindings: 'data/fag/sport/theory_integrity_bindings_sport_v1.json',
      legacyTheoryAudit: 'scripts/audit-fagverk-sport-legacy-theory.mjs',
      legacyAdjudication: 'data/fag/sport/legacy_theory_adjudication_v1.json',
      globalLifecycleRegistry: STATUS
    }
  };

  if (writeReport) fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(json(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditSportExpandedQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Sport expansion audit OK: ${report.status}; ${report.summary.canonicalDomains}/6 felt; rewrite=${report.content_rewrite_required}.`);
  } catch (error) {
    console.error(`Sport expansion audit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
