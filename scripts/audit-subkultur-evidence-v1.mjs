#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/subkultur-evidence-audit.json';
const PATHS = Object.freeze({
  contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  theory: 'data/fag/subkultur/theory_objects_subkultur_canonical_v1.json',
  claims: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
  sources: 'data/fag/subkultur/sources_subkultur_canonical_v1.json',
  links: 'data/fag/subkultur/evidence_links_subkultur_canonical_v1.json',
  evidence: 'data/fag/subkultur/theory_evidence_subkultur_canonical_v1.json',
  caseRequirements: 'data/fag/subkultur/case_requirements_subkultur_canonical_v1.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  runtime: 'data/fag/subkultur/subkultur_runtime_manifest.json'
});

const abs = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();
const exists = (relative) => fs.existsSync(abs(relative));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

function missingRefs(entries, field, registry) {
  return [...new Set(entries.flatMap((entry) => list(entry[field])).filter((id) => !registry.has(id)))].sort();
}

export function buildEvidenceReport() {
  const contract = readJson(PATHS.contract);
  const emner = list(readJson(PATHS.emner));
  const methods = list(readJson(PATHS.methods).methods);
  const pensum = readJson(PATHS.pensum);
  const theories = list(readJson(PATHS.theory));
  const claims = list(readJson(PATHS.claims).claims);
  const sources = list(readJson(PATHS.sources).sources);
  const links = list(readJson(PATHS.links).links);
  const evidence = list(readJson(PATHS.evidence).entries);
  const caseRequirements = list(readJson(PATHS.caseRequirements).requirements);
  const emneIds = new Set(emner.map((entry) => entry.emne_id));
  const methodIds = new Set(methods.map((entry) => entry.method_id));
  const theoryIds = new Set(theories.map((entry) => entry.theory_id));
  const claimIds = new Set(claims.map((entry) => entry.claim_id));
  const sourceIds = new Set(sources.map((entry) => entry.source_id));
  const linkIds = new Set(links.map((entry) => entry.evidence_link_id));
  const evidenceIds = new Set(evidence.map((entry) => entry.theory_id));
  const status = list(readJson(PATHS.status).subjects).find((entry) => entry.id === 'subkultur');
  const registry = readJson(PATHS.registry);
  const domains = list(pensum.domains).map((entry) => entry.domain_id);
  const sourceUse = new Map(sources.map((entry) => [entry.source_id, 0]));
  for (const theory of theories) for (const id of list(theory.source_ids)) sourceUse.set(id, (sourceUse.get(id) ?? 0) + 1);

  const invalidTheoryObjects = theories.filter((theory) => !(
    text(theory.thesis_or_definition)
    && text(theory.research_line)
    && text(theory.mechanism)
    && list(theory.application_scope).length >= 2
    && list(theory.limitations_and_misuse).length >= 2
    && text(theory.critique_or_counterposition)
    && list(theory.method_ids).length >= 1
    && text(theory.primary_source_id)
    && text(theory.independent_control_source_id)
    && theory.primary_source_id !== theory.independent_control_source_id
    && text(theory.case_application_rule)
    && list(theory.ethics_review?.dimensions).length >= 4
    && list(theory.claim_ids).length === 2
    && theory.status === 'evidence_ready'
    && theory.evidence_ready === true
  )).map((entry) => entry.theory_id).sort();

  const invalidClaims = claims.filter((claim) => !(
    text(claim.statement)
    && theoryIds.has(claim.theory_id)
    && domains.includes(claim.domain_id)
    && list(claim.emne_ids).length === 1
    && list(claim.source_ids).length >= 2
    && claim.case_fact === false
    && text(claim.uncertainty)
  )).map((entry) => entry.claim_id).sort();

  const invalidSources = sources.filter((source) => !(
    text(source.title)
    && list(source.creators).length >= 1
    && text(source.publisher)
    && text(source.source_type)
    && /^https:\/\//.test(text(source.url))
    && text(source.contribution)
    && list(source.limitations).length >= 1
    && source.provenance?.canonical_files_are_not_external_evidence === true
  )).map((entry) => entry.source_id).sort();

  const invalidEvidence = evidence.filter((entry) => !(
    theoryIds.has(entry.theory_id)
    && entry.status === 'evidence_ready'
    && entry.scope_status === 'theory_ready_case_evidence_required'
    && entry.universalization_status === 'bounded_not_universal'
    && list(entry.claim_ids).length === 2
    && list(entry.source_ids).length >= 4
    && list(entry.method_ids).length >= 1
    && list(entry.evidence_link_ids).length >= 4
    && list(entry.evidence_dimensions).includes('limitation_test')
    && list(entry.evidence_dimensions).includes('counterposition')
    && list(entry.limitations).length >= 2
    && list(entry.alternative_interpretations).length >= 1
    && list(entry.disconfirmation_conditions).length >= 1
    && entry.case_evidence_gate?.environment_near_source_required === true
    && entry.case_evidence_gate?.independent_control_source_required === true
    && entry.case_evidence_gate?.case_as_universal_proof_forbidden === true
  )).map((entry) => entry.theory_id).sort();

  return {
    schema: 'history_go_subkultur_evidence_audit_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    audited_at: '2026-08-04',
    status: 'THEORY_EVIDENCE_READY_CASES_REQUIRED',
    counts: {
      domains: domains.length,
      emner: emner.length,
      theories: theories.length,
      evidence_ready_theories: evidence.filter((entry) => entry.status === 'evidence_ready').length,
      claims: claims.length,
      sources: sources.length,
      evidence_links: links.length,
      case_requirements: caseRequirements.length
    },
    per_domain: domains.map((domainId) => ({
      id: domainId,
      theories: theories.filter((entry) => entry.domain_id === domainId).length,
      claims: claims.filter((entry) => entry.domain_id === domainId).length,
      ethics_required: theories.filter((entry) => entry.domain_id === domainId && entry.ethics_review?.required).length
    })),
    integrity: {
      duplicate_theory_ids: duplicates(theories.map((entry) => entry.theory_id)),
      duplicate_claim_ids: duplicates(claims.map((entry) => entry.claim_id)),
      duplicate_source_ids: duplicates(sources.map((entry) => entry.source_id)),
      duplicate_source_urls: duplicates(sources.map((entry) => entry.url)),
      duplicate_link_ids: duplicates(links.map((entry) => entry.evidence_link_id)),
      duplicate_evidence_theory_ids: duplicates(evidence.map((entry) => entry.theory_id)),
      missing_theory_for_emne_ids: [...emneIds].filter((emneId) => !theories.some((theory) => list(theory.emne_ids).includes(emneId))).sort(),
      orphan_theory_emne_ids: missingRefs(theories, 'emne_ids', emneIds),
      orphan_theory_method_ids: missingRefs(theories, 'method_ids', methodIds),
      orphan_theory_source_ids: missingRefs(theories, 'source_ids', sourceIds),
      orphan_theory_claim_ids: missingRefs(theories, 'claim_ids', claimIds),
      orphan_claim_source_ids: missingRefs(claims, 'source_ids', sourceIds),
      orphan_evidence_claim_ids: missingRefs(evidence, 'claim_ids', claimIds),
      orphan_evidence_source_ids: missingRefs(evidence, 'source_ids', sourceIds),
      orphan_evidence_method_ids: missingRefs(evidence, 'method_ids', methodIds),
      orphan_evidence_link_ids: missingRefs(evidence, 'evidence_link_ids', linkIds),
      orphan_link_theory_ids: [...new Set(links.map((entry) => entry.theory_id).filter((id) => !theoryIds.has(id)))].sort(),
      orphan_link_claim_ids: [...new Set(links.map((entry) => entry.claim_id).filter((id) => !claimIds.has(id)))].sort(),
      orphan_link_source_ids: [...new Set(links.map((entry) => entry.source_id).filter((id) => !sourceIds.has(id)))].sort(),
      theories_without_evidence: [...theoryIds].filter((id) => !evidenceIds.has(id)).sort(),
      evidence_without_theory: [...evidenceIds].filter((id) => !theoryIds.has(id)).sort(),
      unused_source_ids: [...sourceUse].filter(([, count]) => count === 0).map(([id]) => id).sort(),
      invalid_theory_objects: invalidTheoryObjects,
      invalid_claims: invalidClaims,
      invalid_sources: invalidSources,
      invalid_evidence_entries: invalidEvidence
    },
    policy: {
      theory_object_requirement_count: list(contract.theory_object_requirements).length,
      canonical_files_are_not_external_evidence: readJson(PATHS.sources).source_policy?.canonical_files_are_not_external_evidence === true,
      case_environment_near_source_required: readJson(PATHS.caseRequirements).policy?.environment_near_source_required === true,
      case_independent_control_source_required: readJson(PATHS.caseRequirements).policy?.independent_control_source_required === true,
      vulnerable_people_minimize_identification: readJson(PATHS.caseRequirements).policy?.minimize_identification_and_aggregation_for_vulnerable_people === true
    },
    status_guard: {
      navigation_status: status?.navigationStatus ?? null,
      assessment_status: status?.assessmentStatus ?? null,
      editorial_status: status?.editorialStatus ?? null,
      runtime_manifest_exists: exists(PATHS.runtime),
      registry_subject_exists: Boolean(registry.subjects?.subkultur)
    },
    next_gate: 'chapter_and_case_profiles'
  };
}

export function auditEvidence({ writeReport = false, checkReport = true } = {}) {
  const report = buildEvidenceReport();
  assert(report.counts.domains === 8, 'Evidenslaget må dekke åtte domener');
  assert(report.counts.emner === 80, 'Evidenslaget må bygge på 80 emner');
  assert(report.counts.theories === 80 && report.counts.evidence_ready_theories === 80, 'Alle 80 teoriobjekter må være evidence-ready');
  assert(report.counts.claims === 160, 'Hvert teoriobjekt må ha to canonicale claims');
  assert(report.counts.sources >= 20, 'Kilderegisteret må ha minst 20 kuraterte kilder');
  assert(report.counts.evidence_links >= 320, 'Claims må ha eksplisitte kilde–evidenslenker');
  assert(report.counts.case_requirements >= 5, 'Caseporten må ha minst fem krav');
  assert(report.per_domain.every((domain) => domain.theories === 10 && domain.claims === 20), 'Hvert domene må ha 10 teoriobjekter og 20 claims');
  assert(report.per_domain.find((domain) => domain.id === 'sosiale_randsoner_omsorg_skadereduksjon')?.ethics_required === 10, 'Randsonedomenet må kreve etikk på alle teoriobjekter');
  for (const [name, values] of Object.entries(report.integrity)) assert(values.length === 0, `${name} må være tom, fikk ${values.join(', ')}`);
  assert(report.policy.theory_object_requirement_count === 11, 'Alle elleve teoriobjektkrav må beholdes');
  assert(Object.values(report.policy).every(Boolean), 'Kilde- eller etikkpolicy er svekket');
  assert(report.status_guard.navigation_status === 'planned', 'Subkultur kan ikke materialiseres før kapitler og cases');
  assert(report.status_guard.assessment_status === 'pending', 'Assessment må forbli pending før quiz-audit');
  assert(['not_started', 'chapters_in_progress'].includes(report.status_guard.editorial_status), 'Editorial status må være not_started eller chapters_in_progress før sluttport');
  assert(report.status_guard.runtime_manifest_exists === false, 'Runtime-manifest skal ikke finnes ennå');
  assert(report.status_guard.registry_subject_exists === false, 'Fagverkregisteret skal ikke materialisere Subkultur ennå');

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
    fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  if (checkReport) {
    assert(exists(REPORT), `${REPORT} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert. Kjør --write-report`);
  }
  return report;
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditEvidence({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Subkultur evidence OK: ${report.counts.evidence_ready_theories}/80 teoriobjekter, ${report.counts.claims} claims, ${report.counts.sources} kilder.`);
  } catch (error) {
    console.error(`Subkultur evidence FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
