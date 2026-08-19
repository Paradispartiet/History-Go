#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditFagverkTheoryIntegrity } from './audit-fagverk-theory-integrity.mjs';
import { auditScenekunstTheoryCanon } from './audit-fagverk-scenekunst-theory-canon.mjs';
import { auditSubkulturTheoryAttribution } from './audit-subkultur-theory-attribution-v1.mjs';
import { auditReligionTheoryCanon } from './audit-fagverk-religion-theory-canon.mjs';
import { auditFilmTvTheoryCanon } from './audit-fagverk-film-tv-theory-canon.mjs';
import { auditFilosofiTheoryIntegrity } from './audit-fagverk-filosofi-theory-integrity.mjs';
import { auditHistoryCompletion } from '../tools/audit-historie-completion.mjs';

const STRICT_GATES = {
  film_tv: {
    run: auditFilmTvTheoryCanon,
    capabilities: ['major_field_theory_objects','scope_core_evidence_limits','rivals','named_people_and_works','scholarly_provenance','actual_claim_source_binding'],
    proseBindingStatus: 'claim_binding_validated'
  },
  filosofi: {
    run: auditFilosofiTheoryIntegrity,
    capabilities: ['canonical_20_field_coverage','article_theory_hooks','named_people_and_primary_works','scholarly_claim_sources','rival_claims','actual_theory_and_disagreement_prose'],
    proseBindingStatus: 'prose_and_claim_binding_validated'
  },
  historie: {
    run: auditHistoryCompletion,
    capabilities: ['canonical_23_field_ownership','canonical_primary_theory_hooks','explicit_theory_id_for_18_generator_chapters','paragraph_claim_trace','historiography_evidence','source_authority'],
    proseBindingStatus: '18_generator_chapters_validated_5_handbuilt_chapters_pending_explicit_theory_reconciliation'
  },
  religion: {
    run: auditReligionTheoryCanon,
    capabilities: ['canonical_12_area_theory_frames','scope_core_evidence_limits','rivals','named_people_and_works','scholarly_provenance','area_claim_source_binding'],
    proseBindingStatus: 'claim_binding_validated'
  },
  scenekunst: {
    run: auditScenekunstTheoryCanon,
    capabilities: ['canonical_emne_theory_coverage','scope_core_evidence_limits','rivals','named_people_and_works','scholarly_provenance'],
    proseBindingStatus: 'explicit_prose_or_claim_binding_pending'
  },
  subkultur: {
    run: auditSubkulturTheoryAttribution,
    capabilities: ['canonical_emne_theory_coverage','domain_competing_positions','named_people_and_works','source_attribution','theory_counterpositions_and_limits'],
    proseBindingStatus: 'explicit_prose_or_claim_binding_pending'
  }
};

function runStrictGate(id, spec) {
  try {
    const result = spec.run();
    return { id, status: 'pass', capabilities: spec.capabilities, proseBindingStatus: spec.proseBindingStatus, result };
  } catch (error) {
    return { id, status: 'fail', capabilities: spec.capabilities, proseBindingStatus: spec.proseBindingStatus, error: String(error.message || error) };
  }
}

export function auditFagverkTheoryReconciliation() {
  const diagnostic = auditFagverkTheoryIntegrity();
  const strictGates = Object.fromEntries(Object.entries(STRICT_GATES).map(([id, spec]) => [id, runStrictGate(id, spec)]));
  const strictFailures = Object.values(strictGates).filter((gate) => gate.status !== 'pass').map((gate) => gate.id);

  const subjects = diagnostic.subjects.map((subject) => {
    const strict = strictGates[subject.id] || null;
    let reconciliationClass = 'evidence_adapter_required';
    let substantiveGapProven = false;
    let nextAction = 'reconcile_existing_canonical_evidence_before_content_changes';

    if (subject.id === 'film_tv' && strict?.status === 'pass' && subject.status === 'green') {
      reconciliationClass = 'strict_integrity_validated';
      nextAction = 'regression_only';
    } else if (subject.id === 'filosofi' && strict?.status === 'pass') {
      reconciliationClass = 'strict_integrity_validated';
      nextAction = 'wire_subject_gate_into_final_global_reconciliation';
    } else if (subject.id === 'historie' && strict?.status === 'pass') {
      reconciliationClass = 'handbuilt_chapter_theory_reconciliation_required';
      nextAction = 'verify_theory_provenance_and_actual_prose_or_claim_binding_in_5_handbuilt_chapters';
    } else if (subject.id === 'religion' && strict?.status === 'pass') {
      reconciliationClass = 'field_inventory_and_evidence_adapter_required';
      nextAction = 'use_religion_12_area_canon_in_global_gate';
    } else if (subject.id === 'scenekunst' && strict?.status === 'pass') {
      reconciliationClass = 'prose_binding_reconciliation_required';
      nextAction = 'prove_existing_theory_usage_in_prose_or_claims_without_rewriting_if_already_present';
    } else if (subject.id === 'subkultur' && strict?.status === 'pass') {
      reconciliationClass = 'schema_and_prose_binding_reconciliation_required';
      nextAction = 'adapt_existing_theory_attribution_schema_and_prove_existing_prose_or_claim_usage';
    } else if (subject.status === 'green') {
      reconciliationClass = 'generic_integrity_candidate';
      nextAction = 'verify_subject_specific_or_article_level_evidence_before_final_gate';
    }

    return {
      id: subject.id,
      genericDiagnosticStatus: subject.status,
      genericFieldCount: subject.fieldCount,
      genericTheoryCandidateCount: subject.theoryCandidateCount,
      strictGate: strict ? { status: strict.status, proseBindingStatus: strict.proseBindingStatus, capabilities: strict.capabilities } : null,
      reconciliationClass,
      substantiveGapProven,
      nextAction
    };
  });

  const contentRepairQueue = subjects.filter((subject) => subject.substantiveGapProven).map((subject) => subject.id);
  const evidenceReconciliationQueue = subjects.filter((subject) => subject.reconciliationClass !== 'strict_integrity_validated').map((subject) => subject.id);

  return {
    schema: 'history_go_fagverk_theory_reconciliation_v1',
    version: '1.2.0',
    status: strictFailures.length ? 'strict_subject_gate_failure' : 'evidence_reconciliation_in_progress',
    rules: {
      genericScannerFailureIsNotContentGap: true,
      completionStatusChangesAllowed: false,
      contentRepairRequiresSubstantiveGapProof: true,
      subjectSpecificStricterGatesRemainAuthoritative: true,
      noSubjectProseRewriteBeforeEvidenceReconciliation: true
    },
    diagnosticScope: diagnostic.scope,
    genericDiagnosticSummary: diagnostic.summary,
    strictSubjectGates: strictGates,
    strictSubjectGateFailures: strictFailures,
    evidenceReconciliationQueue,
    contentRepairQueue,
    subjects
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(auditFagverkTheoryReconciliation(), null, 2));
  } catch (error) {
    console.error(`Fagverk theory reconciliation FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
