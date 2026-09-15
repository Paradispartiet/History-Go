#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANON_PATH = 'data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json';
const abs = (file) => path.join(ROOT, file);

export const REQUIRED_WORK_IDS = [
  'adv01-bourdieu-distinction',
  'adv02-goffman-presentation',
  'adv03-elias-civilizing-process',
  'adv04-foucault-discipline-punish',
  'adv05-scott-seeing-state',
  'adv06-anderson-imagined-communities',
  'adv07-hirschman-exit-voice-loyalty',
  'adv08-ostrom-governing-commons',
  'adv09-graeber-debt',
  'adv10-piketty-capital-ideology',
  'adv11-rosa-social-acceleration',
  'adv12-zuboff-surveillance-capitalism',
  'adv13-jacobs-death-life',
  'adv14-sennett-uses-disorder',
  'adv15-latour-reassembling-social',
  'adv16-geertz-interpretation-cultures',
  'adv17-polanyi-great-transformation',
  'adv18-arendt-human-condition',
  'adv19-kahneman-thinking-fast-slow',
  'adv20-haidt-righteous-mind',
];

const uniq = (xs) => new Set(xs).size === xs.length;
const sameSet = (a, b) => a.length === b.length && a.every((value) => b.includes(value));

export function audit() {
  const canon = JSON.parse(fs.readFileSync(abs(CANON_PATH), 'utf8'));
  const works = Array.isArray(canon.works) ? canon.works : [];
  const workIds = works.map((work) => work.id);
  const allowedDomains = new Set(canon.allowed_domain_ids ?? []);
  const allowedCrossSubjects = new Set(canon.allowed_cross_subject_ids ?? []);
  const theoryUnits = works.flatMap((work) => work.theory_units ?? []);
  const theoryIds = theoryUnits.map((unit) => unit.id);
  const priority = canon.materialization_plan?.priority_order ?? [];

  const gates = {
    schema: canon.schema === 'history_go_sosiologi_antropologi_advanced_theory_reading_canon_v1',
    owner: canon.subject_id === 'politikk' && canon.canonical_subcategory_id === 'sosiologi_antropologi',
    non_runtime_status: canon.status === 'canonical_source_and_theory_mapping_complete_fulltext_materialization_pending',
    expected_work_count: canon.expected_work_count === 20 && works.length === 20,
    exact_required_work_set: sameSet(REQUIRED_WORK_IDS, workIds),
    unique_work_ids: uniq(workIds),
    all_sources_traceable: works.every((work) => typeof work.source_url === 'string' && work.source_url.startsWith('https://')),
    all_works_have_domains: works.every((work) => Array.isArray(work.primary_domain_ids) && work.primary_domain_ids.length >= 1),
    domain_bindings_canonical: works.every((work) => work.primary_domain_ids.every((domainId) => allowedDomains.has(domainId))),
    canonical_cross_subject_bindings: works.every((work) => (work.cross_subject_links ?? []).every((subjectId) => allowedCrossSubjects.has(subjectId))),
    three_or_more_theory_units_each: works.every((work) => Array.isArray(work.theory_units) && work.theory_units.length >= 3),
    theory_units_complete: theoryUnits.every((unit) => unit.id && unit.name && unit.summary && unit.analytic_question && unit.misuse_guardrail),
    unique_theory_ids: uniq(theoryIds),
    materialization_priority_exact: sameSet(REQUIRED_WORK_IDS, priority) && uniq(priority),
    no_publication_ready_claims: canon.governance?.publication_ready_claims === false,
    runtime_claims_require_fulltext: canon.governance?.fulltext_materialization_required_for_runtime_claims === true,
    no_parallel_subject: canon.governance?.creates_parallel_subject === false,
    existing_goffman_binding_preserved: canon.governance?.existing_goffman_source_id === 'sat04-goffman-presentation',
    existing_bourdieu_binding_preserved: canon.governance?.existing_bourdieu_source_id === 'sat05-bourdieu-practice',
  };

  return {
    schema: canon.schema,
    status: canon.status,
    subject_id: canon.subject_id,
    canonical_subcategory_id: canon.canonical_subcategory_id,
    counts: {
      works: works.length,
      theoryUnits: theoryUnits.length,
      allowedDomains: allowedDomains.size,
      allowedCrossSubjects: allowedCrossSubjects.size,
      crossSubjectLinks: works.reduce((sum, work) => sum + (work.cross_subject_links?.length ?? 0), 0),
      gaps: works.filter((work) => work.existing_coverage === 'gap').length,
      existingOrExtendingCoverage: works.filter((work) => work.existing_coverage !== 'gap').length,
    },
    gates,
    passed: Object.values(gates).every(Boolean),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = audit();
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
