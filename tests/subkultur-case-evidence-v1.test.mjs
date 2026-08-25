import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditSubkulturCaseEvidence, buildSubkulturCaseEvidenceReport } from '../scripts/audit-subkultur-case-evidence-v1.mjs';

test('caseprofilen lukker alle femti kandidater med førtito validerte og åtte eksplisitte avvisninger', () => {
  const report = auditSubkulturCaseEvidence();
  assert.equal(report.totals.profile_candidates, 50);
  assert.equal(report.totals.eligible_cases, 42);
  assert.equal(report.totals.validated_cases, 42);
  assert.equal(report.totals.rejected_cases, 8);
  assert.equal(report.totals.remaining_candidates, 0);
  assert.equal(report.status, 'CASE_VALIDATION_COMPLETE');
});

test('hver validert case har miljønær og uavhengig inspectable kilde', () => {
  const report = buildSubkulturCaseEvidenceReport();
  assert.equal(report.totals.case_sources, 85);
  assert.equal(report.totals.environment_near_sources, 42);
  assert.equal(report.totals.independent_control_sources, 43);
  assert.ok(report.cases.every((entry) => entry.sources >= 2));
  assert.ok(report.cases.every((entry) => entry.environment_near_sources >= 1));
  assert.ok(report.cases.every((entry) => entry.independent_control_sources >= 1));
});

test('tjenestenære kilder teller som miljønære uten å feilmerkes som deltakerstemmer', () => {
  const sources = JSON.parse(fs.readFileSync(new URL('../data/fag/subkultur/case_sources_subkultur_canonical_v1.json', import.meta.url), 'utf8')).sources;
  const supportSources = sources.filter((source) => source.perspective === 'support_service');
  assert.equal(supportSources.length, 4);
  assert.ok(supportSources.every((source) => source.source_type === 'service_provider'));
  assert.ok(supportSources.every((source) => !['participant', 'milieu'].includes(source.perspective)));
});

test('alle fem casekrav og etikkporten er eksplisitt bestått', () => {
  const report = buildSubkulturCaseEvidenceReport();
  assert.ok(report.cases.every((entry) => entry.requirements_passed === 5));
  assert.ok(report.cases.every((entry) => entry.ethics_status === 'PASS'));
  assert.deepEqual(report.integrity.failures, []);
});

test('avviste grensecases har ikke-sirkulær og etterprøvbar beslutningsproveniens', () => {
  const evidence = JSON.parse(fs.readFileSync(new URL('../data/fag/subkultur/case_evidence_subkultur_canonical_v1.json', import.meta.url), 'utf8'));
  const adjudications = JSON.parse(fs.readFileSync(new URL('../data/fag/subkultur/case_rejection_adjudications_subkultur_v1.json', import.meta.url), 'utf8'));
  const adjudicationByCase = new Map(adjudications.adjudications.map((entry) => [entry.case_id, entry]));
  const newRejections = evidence.nonqualifying_cases.filter((entry) => entry.decision_source === 'data/fag/subkultur/case_rejection_adjudications_subkultur_v1.json');
  assert.equal(newRejections.length, 6);
  assert.ok(evidence.nonqualifying_cases.every((entry) => entry.decision_source !== 'data/fag/subkultur/case_evidence_subkultur_canonical_v1.json'));
  assert.ok(newRejections.every((entry) => adjudicationByCase.get(entry.case_id)?.reason === entry.reason));
  assert.ok(newRejections.every((entry) => adjudicationByCase.get(entry.case_id)?.failed_case_requirements.length >= 1));
});

test('Slottsparkens dokumenterte Nisseberg-konflikt materialiseres som dokumentert', () => {
  const report = JSON.parse(fs.readFileSync(new URL('../data/places/subkultur-production/slottsparken.json', import.meta.url), 'utf8'));
  const conflict = report.subcultureCases[0].spaceAndPower.conflictOrNegotiation;
  assert.equal(conflict.status, 'documented');
  assert.match(conflict.statement, /Nisseberget|politiinngrep/u);
  assert.equal(conflict.rationale, undefined);
});

test('komplett casekildeport består etter ferdig runtime-materialisering', () => {
  const report = buildSubkulturCaseEvidenceReport();
  assert.deepEqual(report.status_guard, {
    navigation_status: 'materialized',
    assessment_status: 'audited',
    editorial_status: 'complete',
    next_gate: 'maintenance_and_source_refresh'
  });
  assert.equal(report.next_gate, 'quiz_knowledge_audit');
});
