#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const fail = (message) => {
  console.error(`Fagverk final program closure FAIL: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const FINAL_REPORT = 'reports/fagverk/fagverk-final-program-closure-v1.json';
const HISTORICAL_PLAN = 'reports/fagverk/fagverk-expanded-subject-by-subject-audit-v1.json';
const STRICT_RECONCILIATION = 'reports/fagverk/fagverk-expansion-19-plus-1-final-reconciliation-v1.json';
const SUBJECT_STATUS = 'data/fagverk/subject_status.json';

const CURRENT_PROOF_REPORTS = new Map([
  ['by', 'reports/fagverk/by-expanded-quality-audit.json'],
  ['kunst', 'reports/fagverk/kunst-expanded-quality-audit.json'],
  ['litteratur', 'reports/fagverk/litteratur-expanded-quality-audit.json'],
  ['media', 'reports/fagverk/media-expanded-quality-audit.json'],
  ['musikk', 'reports/fagverk/musikk-expanded-quality-audit.json'],
  ['sport', 'reports/fagverk/sport-expanded-quality-audit.json'],
]);

const report = readJson(FINAL_REPORT);
const historical = readJson(HISTORICAL_PLAN);
const strict = readJson(STRICT_RECONCILIATION);
const registry = readJson(SUBJECT_STATUS);

assert(report.schema === 'history_go_fagverk_final_program_closure_v1', 'unexpected final-report schema');
assert(report.version === '1.0.0', 'unexpected final-report version');
assert(report.status === 'PROGRAM_CLOSED_WITH_BOUNDED_VERDICTS', 'program closure status must stay bounded');
assert(/^[0-9a-f]{40}$/.test(report.reconciled_from_main_sha), 'reconciled_from_main_sha must be a full SHA');
assert(report.historical_plan_snapshot === HISTORICAL_PLAN, 'historical snapshot ref drifted');
assert(report.strict_19_plus_1_reconciliation === STRICT_RECONCILIATION, 'strict reconciliation ref drifted');
assert(report.subject_status_registry === SUBJECT_STATUS, 'subject-status ref drifted');

assert(historical.status === 'read_only_fail_closed_audit_complete', 'historical subject-by-subject audit must remain read-only');
assert(historical.scope?.top_level_subjects === 19, 'historical audit must cover 19 top-level subjects');
assert(historical.scope?.nested_specializations_reviewed === 1, 'historical audit must cover one nested specialization');
assert(historical.scope?.nested_specialization === 'teknologi', 'historical nested specialization must be teknologi');
assert(historical.scope?.parent_subject === 'vitenskap', 'teknologi must remain nested under vitenskap');
assert(historical.summary?.proven_whole_subject_expansion === 13, 'historical 13-subject expansion baseline changed');
assert(historical.summary?.mixed_or_partial_expansion_proof === 1, 'historical mixed baseline changed');
assert(historical.summary?.high_quality_complete_without_separate_whole_subject_expansion_proof === 5, 'historical no-proof baseline changed');
assert(historical.summary?.top_level_content_gaps_proven === 0, 'historical plan must not gain content gaps');

assert(strict.status === 'strict_completion_reconciled', '19+1 strict reconciliation is no longer closed');
assert(strict.scope?.top_level_subjects === 19, 'strict reconciliation must cover 19 top-level subjects');
assert(strict.scope?.nested_specializations === 1, 'strict reconciliation must cover one nested specialization');
assert(strict.scope?.total_audited_units === 20, 'strict reconciliation must cover 20 total units');
assert(strict.scope?.strictly_proven_units === 20, 'all 20 units must remain strict-proven');
for (const [queueName, values] of Object.entries(strict.queues ?? {})) {
  assert(Array.isArray(values) && values.length === 0, `strict reconciliation queue ${queueName} must stay empty`);
}
assert(strict.next_strict_subject === null, 'strict reconciliation must not expose a next strict subject');
assert(strict.ownership_decisions?.technology?.canonical_parent_subject === 'vitenskap', 'technology ownership drifted');
assert(strict.ownership_decisions?.technology?.top_level_subject === false, 'technology must not become a top-level subject');

assert(Array.isArray(registry.subjects), 'subject registry has no subjects array');
assert(registry.subjects.length === 19, `subject registry must contain 19 subjects, got ${registry.subjects.length}`);
const registryIds = registry.subjects.map((subject) => subject.id);
assert(new Set(registryIds).size === 19, 'subject registry contains duplicate ids');
for (const subject of registry.subjects) {
  assert(subject.navigationStatus === 'materialized', `${subject.id}: navigationStatus must be materialized`);
  assert(subject.assessmentStatus === 'audited', `${subject.id}: assessmentStatus must be audited`);
  assert(['complete', 'expanded_and_audited'].includes(subject.editorialStatus), `${subject.id}: editorialStatus is not terminal`);
}
const canonicalExpandedCount = registry.subjects.filter((subject) => subject.editorialStatus === 'expanded_and_audited').length;

const historicalById = new Map((historical.subjects ?? []).map((subject) => [subject.id, subject]));
assert(historicalById.size === 19, `historical audit must contain 19 unique subject entries, got ${historicalById.size}`);

const derived = [];
for (const registrySubject of registry.subjects) {
  const id = registrySubject.id;
  if (CURRENT_PROOF_REPORTS.has(id)) {
    const evidenceRef = CURRENT_PROOF_REPORTS.get(id);
    const evidence = readJson(evidenceRef);
    assert(evidence.subject_id === id, `${id}: current proof report subject mismatch`);
    assert(evidence.canonical_editorial_status_mutated === false, `${id}: proof report must not mutate canonical lifecycle`);
    assert(evidence.content_gap_proven === false || evidence.summary?.substantiveContentGapsProven === 0, `${id}: unexpected content gap`);
    const isProven = evidence.status === 'PROVEN_WHOLE_SUBJECT_EXPANSION';
    const isBoundedNoProof = evidence.status === 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN';
    assert(isProven || isBoundedNoProof, `${id}: unsupported proof verdict ${evidence.status}`);
    if (isProven) {
      assert(evidence.quality_status === 'expanded_and_audited', `${id}: proven expansion must carry expanded quality status`);
    } else {
      assert(evidence.quality_status === 'high_quality_complete_without_separate_whole_subject_expansion_proof', `${id}: bounded no-proof quality status drifted`);
    }
    derived.push({
      id,
      expansion_verdict: evidence.status,
      whole_subject_expansion_proven: isProven,
      content_gap_proven: false,
      quality_status: evidence.quality_status,
      evidence_ref: evidenceRef,
    });
    continue;
  }

  const historicalSubject = historicalById.get(id);
  assert(historicalSubject, `${id}: missing from historical audit`);
  assert(historicalSubject.expanded_verdict === 'PROVEN_WHOLE_SUBJECT_EXPANSION', `${id}: non-override subject was not historically expansion-proven`);
  assert(historicalSubject.whole_subject_expansion_proven === true, `${id}: historical whole-subject proof missing`);
  assert(historicalSubject.content_gap_proven === false, `${id}: historical content gap unexpectedly proven`);
  derived.push({
    id,
    expansion_verdict: 'PROVEN_WHOLE_SUBJECT_EXPANSION',
    whole_subject_expansion_proven: true,
    content_gap_proven: false,
    quality_status: 'expanded_and_audited',
    evidence_ref: HISTORICAL_PLAN,
  });
}

const proven = derived.filter((subject) => subject.whole_subject_expansion_proven).length;
const boundedNoProof = derived.filter((subject) => subject.expansion_verdict === 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN').length;
const mixed = derived.filter((subject) => !['PROVEN_WHOLE_SUBJECT_EXPANSION', 'WHOLE_SUBJECT_EXPANSION_NOT_PROVEN'].includes(subject.expansion_verdict)).length;
const contentGaps = derived.filter((subject) => subject.content_gap_proven).length;

assert(proven === 17, `expected 17 proven whole-subject expansions, got ${proven}`);
assert(boundedNoProof === 2, `expected 2 bounded no-proof subjects, got ${boundedNoProof}`);
assert(mixed === 0, `expected 0 mixed/partial subjects, got ${mixed}`);
assert(contentGaps === 0, `expected 0 proven content gaps, got ${contentGaps}`);
assert(derived.find((subject) => subject.id === 'media')?.whole_subject_expansion_proven === false, 'Media must remain fail-closed without expansion proof');
assert(derived.find((subject) => subject.id === 'sport')?.whole_subject_expansion_proven === false, 'Sport must remain fail-closed without expansion proof');

assert(Array.isArray(report.subjects) && report.subjects.length === 19, 'final report must contain 19 top-level subjects');
const reportById = new Map(report.subjects.map((subject) => [subject.id, subject]));
assert(reportById.size === 19, 'final report contains duplicate subject ids');
for (const subject of derived) {
  const actual = reportById.get(subject.id);
  assert(actual, `${subject.id}: missing from final report`);
  for (const key of ['expansion_verdict', 'whole_subject_expansion_proven', 'content_gap_proven', 'quality_status', 'evidence_ref']) {
    assert(actual[key] === subject[key], `${subject.id}: final report ${key} drifted`);
  }
}

const expectedSummary = {
  top_level_subjects: 19,
  nested_specializations: 1,
  total_strict_units: 20,
  strictly_proven_units: 20,
  top_level_subjects_reconciled: 19,
  proven_whole_subject_expansion: proven,
  high_quality_complete_without_separate_whole_subject_expansion_proof: boundedNoProof,
  mixed_or_partial_expansion_proof: mixed,
  top_level_content_gaps_proven: contentGaps,
  canonical_editorial_status_expanded_and_audited: canonicalExpandedCount,
  open_subject_reconciliation_queue: 0,
  program_closed: true,
};
for (const [key, value] of Object.entries(expectedSummary)) {
  assert(report.summary?.[key] === value, `final report summary.${key} expected ${value}, got ${report.summary?.[key]}`);
}

assert(Array.isArray(report.nested_specializations) && report.nested_specializations.length === 1, 'final report must contain exactly one nested specialization');
const technology = report.nested_specializations[0];
assert(technology.id === 'teknologi', 'nested specialization must be teknologi');
assert(technology.parent_subject === 'vitenskap', 'teknologi parent must be vitenskap');
assert(technology.top_level_subject === false, 'teknologi cannot be a top-level subject');
assert(technology.strictly_proven === true, 'teknologi must remain strict-proven');
assert(technology.included_in_top_level_expansion_denominator === false, 'teknologi must stay outside the 19-subject expansion denominator');

for (const [queueName, values] of Object.entries(report.queues ?? {})) {
  assert(Array.isArray(values) && values.length === 0, `final closure queue ${queueName} must be empty`);
}
assert(report.next_strict_subject === null, 'program closure must not name a next strict subject');
assert(report.summary?.program_closed === true, 'program closure flag must be true');

console.log(`Fagverk final program closure PASS: ${proven}/19 expansion-proven, ${boundedNoProof}/19 bounded no-proof, 0 content gaps, 20/20 strict units.`);
