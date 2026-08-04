#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/subkultur-case-evidence-audit.json';
const PATHS = Object.freeze({
  evidence: 'data/fag/subkultur/case_evidence_subkultur_canonical_v1.json',
  sources: 'data/fag/subkultur/case_sources_subkultur_canonical_v1.json',
  requirements: 'data/fag/subkultur/case_requirements_subkultur_canonical_v1.json',
  validation: 'data/fag/subkultur/case_validation_subkultur_v1.json',
  profiles: 'data/fag/profiles/subkultur/manifest.json',
  status: 'data/fagverk/subject_status.json'
});

const abs = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

export function buildSubkulturCaseEvidenceReport() {
  const evidence = readJson(PATHS.evidence);
  const rejectedCases = list(evidence.nonqualifying_cases);
  const sources = readJson(PATHS.sources);
  const requirements = readJson(PATHS.requirements);
  const validation = readJson(PATHS.validation);
  const profileManifest = readJson(PATHS.profiles);
  const requirementIds = new Set(list(requirements.requirements).map((entry) => entry.requirement_id));
  const sourceById = new Map(list(sources.sources).map((entry) => [entry.source_id, entry]));
  const profileById = new Map(list(profileManifest.profiles).map((row) => [row.id, readJson(row.file)]));
  const failures = [];
  const cases = [];

  for (const entry of list(evidence.cases)) {
    const prefix = entry.case_id || '<ukjent case>';
    const report = readJson(entry.report_path);
    const profile = profileById.get(entry.profile_id);
    const profileCase = list(profile?.candidates).find((candidate) => candidate.case_id === entry.case_id);
    const reportCase = list(report.subcultureCases).find((candidate) => candidate.id === entry.report_case_id);
    const sourceRows = list(entry.source_ids).map((id) => sourceById.get(id));
    const resultIds = list(entry.requirement_results).map((result) => result.requirement_id);
    const milieu = sourceRows.filter((source) => source?.perspective === 'milieu');
    const independent = sourceRows.filter((source) => source?.perspective === 'secondary');

    const check = (condition, message) => { if (!condition) failures.push(`${prefix}: ${message}`); };
    check(entry.validation_status === 'validated_case', 'validation_status må være validated_case');
    check(entry.qualification === 'qualifying_case', 'qualification må være qualifying_case');
    check(report.placeId === entry.place_id && report.status === 'ready', 'rapporten er ikke en ready rapport for samme placeId');
    check(Boolean(reportCase) && text(reportCase?.claim) === text(entry.claim), 'caseclaim matcher ikke A–H-rapporten');
    check(Boolean(profileCase), 'mangler i geografisk profil');
    check(profileCase?.status === 'validated_case' && profileCase?.evidence_id === entry.evidence_id, 'profilen materialiserer ikke evidensen');
    check(list(profileCase?.missing_before_validation).length === 0, 'profilen skjuler uløste valideringsgap');
    check(resultIds.length === requirementIds.size && resultIds.every((id) => requirementIds.has(id)), 'dekker ikke alle fem casekrav');
    check(list(entry.requirement_results).every((result) => result.status === 'PASS' && list(result.evidence_paths).length >= 1), 'casekrav mangler PASS eller evidenssti');
    check(sourceRows.length >= 2 && sourceRows.every(Boolean), 'har færre enn to registrerte kilder');
    check(milieu.length >= 1, 'mangler miljønær kilde');
    check(independent.length >= 1, 'mangler uavhengig kontrollkilde');
    check(sourceRows.every((source) => /^https:\/\//u.test(text(source?.url))), 'har ikke-inspectable kilde');
    check(list(entry.environment_near_source_ids).every((id) => milieu.some((source) => source.source_id === id)), 'miljøkildeklassifiseringen er inkonsistent');
    check(list(entry.independent_control_source_ids).every((id) => independent.some((source) => source.source_id === id)), 'kontrollkildeklassifiseringen er inkonsistent');
    check(entry.ethics_review?.status === 'PASS' && text(entry.ethics_review?.identification_risk) && text(entry.ethics_review?.stigma_and_romanticization_risk), 'mangler etisk kontroll');
    check(text(entry.uncertainty) && text(entry.method_id) && text(entry.inference_status), 'mangler slutningsgrense');
    for (const gate of ['A', 'B', 'C', 'D', 'E', 'F']) check(report.gates?.[gate]?.status === 'PASS', `A–H-rapportens gate ${gate} er ikke PASS`);

    cases.push({
      case_id: entry.case_id,
      place_id: entry.place_id,
      profile_id: entry.profile_id,
      sources: sourceRows.length,
      environment_near_sources: milieu.length,
      independent_control_sources: independent.length,
      requirements_passed: list(entry.requirement_results).filter((result) => result.status === 'PASS').length,
      ethics_status: entry.ethics_review?.status ?? null
    });
  }

  const profiles = [...profileById.values()];
  const profileCandidates = profiles.flatMap((profile) => list(profile.candidates));
  const validatedProfileCases = profileCandidates.filter((candidate) => candidate.status === 'validated_case');
  const rejectedProfileCases = profileCandidates.filter((candidate) => candidate.status === 'rejected_nonqualifying');
  const unvalidatedProfileCases = profileCandidates.filter((candidate) => candidate.status === 'candidate_unvalidated');
  for (const rejected of rejectedCases) {
    const profile = profileById.get(rejected.profile_id);
    const profileCase = list(profile?.candidates).find((candidate) => candidate.case_id === rejected.case_id);
    if (!profileCase || profileCase.status !== 'rejected_nonqualifying') failures.push(`${rejected.case_id}: geografisk profil materialiserer ikke avvisningen`);
    if (profileCase?.resulting_category !== rejected.resulting_category || profileCase?.rejection_reason !== rejected.reason) failures.push(`${rejected.case_id}: profilens avvisningsgrunnlag er ute av synk`);
    if (list(profileCase?.missing_before_validation).length !== 0) failures.push(`${rejected.case_id}: avvist case teller feilaktig som evidensgap`);
  }
  const status = list(readJson(PATHS.status).subjects).find((entry) => entry.id === 'subkultur');

  return {
    schema: 'history_go_subkultur_case_evidence_audit_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    audited_at: '2026-08-04',
    status: failures.length ? 'FAIL' : 'PARTIAL_CASE_VALIDATION_READY',
    totals: {
      profile_candidates: profileCandidates.length,
      eligible_cases: profileCandidates.length - rejectedCases.length,
      validated_cases: cases.length,
      rejected_cases: rejectedCases.length,
      remaining_candidates: unvalidatedProfileCases.length,
      case_sources: list(sources.sources).length,
      environment_near_sources: list(sources.sources).filter((source) => source.perspective === 'milieu').length,
      independent_control_sources: list(sources.sources).filter((source) => source.perspective === 'secondary').length
    },
    cases,
    integrity: {
      duplicate_evidence_ids: duplicates(list(evidence.cases).map((entry) => entry.evidence_id)),
      duplicate_case_ids: duplicates(list(evidence.cases).map((entry) => entry.case_id)),
      duplicate_source_ids: duplicates(list(sources.sources).map((entry) => entry.source_id)),
      duplicate_source_urls: duplicates(list(sources.sources).map((entry) => entry.url)),
      profile_registry_mismatch: validatedProfileCases.map((candidate) => candidate.evidence_id).filter((id) => !list(evidence.cases).some((entry) => entry.evidence_id === id)),
      rejection_registry_mismatch: rejectedProfileCases.map((candidate) => candidate.case_id).filter((id) => !rejectedCases.some((entry) => entry.case_id === id)),
      validation_registry_mismatch: list(validation.validated_cases).map((entry) => entry.case_id).filter((id) => !list(evidence.cases).some((candidate) => candidate.case_id === id)),
      failures
    },
    status_guard: {
      navigation_status: status?.navigationStatus ?? null,
      assessment_status: status?.assessmentStatus ?? null,
      editorial_status: status?.editorialStatus ?? null,
      next_gate: status?.nextGate ?? null
    },
    next_gate: 'remaining_case_source_validation'
  };
}

export function auditSubkulturCaseEvidence({ writeReport = false, checkReport = true } = {}) {
  const report = buildSubkulturCaseEvidenceReport();
  assert(report.totals.profile_candidates === 50, 'caseprofilene må bevare 50 auditerte kandidater');
  assert(report.totals.eligible_cases === 48, 'to ikke-kvalifiserende kandidater skal holdes utenfor evidensrestansen');
  assert(report.totals.validated_cases >= 11, 'utvidet casekildeport krever minst elleve validerte cases');
  assert(report.totals.rejected_cases === 2, 'to auditerte ikke-kvalifiserende profilcases må forbli eksplisitt avvist');
  assert(report.totals.remaining_candidates === 37, 'caseevidensrestansen skal være 37');
  assert(report.totals.validated_cases + report.totals.rejected_cases + report.totals.remaining_candidates === report.totals.profile_candidates, 'casefordelingen summerer ikke til profiltotalen');
  assert(report.totals.case_sources >= report.totals.validated_cases * 2, 'hver validert case krever minst to kilder');
  assert(report.totals.environment_near_sources >= report.totals.validated_cases, 'hver validert case krever miljønær kilde');
  assert(report.totals.independent_control_sources >= report.totals.validated_cases, 'hver validert case krever uavhengig kontrollkilde');
  assert(report.integrity.duplicate_evidence_ids.length === 0, 'dupliserte evidence-ID-er');
  assert(report.integrity.duplicate_case_ids.length === 0, 'dupliserte case-ID-er');
  assert(report.integrity.duplicate_source_ids.length === 0, 'dupliserte casekilde-ID-er');
  assert(report.integrity.duplicate_source_urls.length === 0, 'dupliserte casekilde-URL-er');
  assert(report.integrity.profile_registry_mismatch.length === 0, 'profil og evidensregister er ute av synk');
  assert(report.integrity.rejection_registry_mismatch.length === 0, 'profil og avvisningsregister er ute av synk');
  assert(report.integrity.validation_registry_mismatch.length === 0, 'valideringssammendrag og evidensregister er ute av synk');
  assert(report.integrity.failures.length === 0, report.integrity.failures.join('\n'));
  assert(report.status_guard.navigation_status === 'planned', 'Subkultur kan ikke materialiseres i case-delporten');
  assert(report.status_guard.assessment_status === 'pending', 'assessment må forbli pending før Quiz/Knowledge');
  assert(report.status_guard.editorial_status === 'not_started', 'global editorialStatus må vente på runtime');
  assert(report.status_guard.next_gate === 'remaining_case_source_validation', 'neste globale port må være gjenstående casekildevalidering');

  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (writeReport) fs.writeFileSync(abs(REPORT), serialized, 'utf8');
  if (checkReport) assert(fs.readFileSync(abs(REPORT), 'utf8') === serialized, `${REPORT} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = auditSubkulturCaseEvidence({ writeReport: process.argv.includes('--write-report'), checkReport: !process.argv.includes('--write-report') });
    console.log(`Subkultur case evidence OK: ${report.totals.validated_cases} validerte, ${report.totals.rejected_cases} avviste, ${report.totals.remaining_candidates} gjenstår og ${report.totals.case_sources} casekilder.`);
  } catch (error) {
    console.error(`Subkultur case evidence FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
