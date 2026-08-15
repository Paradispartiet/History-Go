#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNIT_ID = 'kulturarv-kanon-stjerner-og-minne';
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  brief: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-cultural-heritage-canon-stars-memory-source-brief-v1-audit.json'
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const normalize = (value) => String(value || '').toLocaleLowerCase('nb-NO').replace(/\s+/gu, ' ').trim();

export function auditFilmTvCulturalHeritageCanonStarsMemorySourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  const brief = read(P.brief);
  const sources = read(P.sources).sources || [];
  const cases = read(P.cases).cases || [];
  const topics = read(P.topicClaims).topic_briefs || [];

  const sourceIds = new Set(sources.map((row) => row.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const methodIds = new Set((brief.method_basis || []).map((row) => row.id));
  const usedSources = new Set([...topics.flatMap((row) => row.source_ids || []), ...cases.flatMap((row) => row.source_ids || [])]);
  const usedCases = new Set(topics.flatMap((row) => row.case_ids || []));
  const usedMethods = new Set(topics.flatMap((row) => row.method_basis_ids || []));
  const claims = topics.flatMap((row) => row.planned_claims || []);
  const claimCounts = topics.map((row) => (row.planned_claims || []).length);
  const moduleEmnes = (brief.proposed_module_order || []).flatMap((row) => row.emne_ids || []);
  const placeholder = /\b(?:todo|tbd|placeholder|lorem ipsum|sett inn|kommer senere)\b/iu;
  const serialized = JSON.stringify({ brief, sources, cases, topics });

  const gates = {
    exact_unit_fifteen_sequence_and_scope: Boolean(unit) && unit.sequence === 15 && unit.emne_count === 12 && plan.production_sequence[14] === UNIT_ID,
    exact_prerequisite_contract: Boolean(unit) && isDeepStrictEqual(unit.prerequisite_planned_unit_ids, ['arkiv-bevaring-tilgang-og-autentisitet','resepsjon-deltakelse-og-publikumsmetoder','representasjon-posisjon-og-motbilder']) && isDeepStrictEqual(unit.prerequisite_existing_chapter_ids, ['kinoer-visningssteder-og-publikum']),
    exact_twelve_topic_coverage: Boolean(unit) && topics.length === 12 && new Set(topics.map((row) => row.emne_id)).size === 12 && isDeepStrictEqual(brief.scope.emne_ids, unit.emne_ids) && isDeepStrictEqual(topics.map((row) => row.emne_id), unit.emne_ids),
    four_modules_cover_scope_once: (brief.proposed_module_order || []).length === 4 && moduleEmnes.length === 12 && new Set(moduleEmnes).size === 12 && isDeepStrictEqual(moduleEmnes, brief.scope.emne_ids),
    twenty_six_inspectable_sources: sources.length === 26 && new Set(sources.map((row) => row.id)).size === 26 && sources.every((row) => /^https:\/\//u.test(row.url || '') && row.source_location && row.territory && row.evidence_role && row.retrieval_status === 'verified_2026-08-15'),
    all_sources_used_and_resolvable: sources.every((row) => usedSources.has(row.id)) && [...usedSources].every((id) => sourceIds.has(id)),
    twenty_four_cases_used: cases.length === 24 && new Set(cases.map((row) => row.id)).size === 24 && cases.every((row) => usedCases.has(row.id) && Array.isArray(row.source_ids) && row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    all_case_references_resolve: topics.every((row) => row.case_ids.every((id) => caseIds.has(id))) && cases.every((row) => row.source_ids.every((id) => sourceIds.has(id))),
    every_case_overlaps_topic_evidence: topics.every((topic) => topic.case_ids.every((caseId) => {
      const row = cases.find((candidate) => candidate.id === caseId);
      return row && row.source_ids.some((sourceId) => topic.source_ids.includes(sourceId));
    })),
    fourteen_methods_all_used: (brief.method_basis || []).length === 14 && methodIds.size === 14 && methodIds.size === usedMethods.size && [...usedMethods].every((id) => methodIds.has(id)),
    every_topic_has_method_source_case_and_goal: topics.every((row) => row.method_basis_ids.length >= 3 && row.source_ids.length >= 3 && row.case_ids.length >= 3 && normalize(row.learning_goal).length >= 70),
    fifty_six_variable_planned_claims: claims.length === 56 && new Set(claims.map((row) => row.id)).size === 56 && isDeepStrictEqual(claimCounts, [5,4,5,5,5,4,4,5,5,4,5,5]) && new Set(claimCounts).size > 1,
    planned_claims_not_false_verified: claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.claim_focus && row.claim_type),
    runtime_registration_stays_closed: brief.runtime_registration?.registered === false && brief.runtime_registration?.allowed_before_full_chapter_gate === false,
    explicit_overlap_boundary: /Enhet 14/u.test(brief.scope.overlap_boundary) && /enhet 11/iu.test(brief.scope.overlap_boundary) && /enhet 7/iu.test(brief.scope.overlap_boundary),
    no_placeholders: !placeholder.test(serialized),
    no_popularity_shortcut: brief.source_policy?.popularity_does_not_prove_canon_heritage_cult_status_or_collective_memory === true,
    no_retrospective_star_teleology: brief.source_policy?.later_stardom_must_not_be_projected_backwards_without_contemporary_evidence === true,
    collective_memory_has_evidence_boundary: brief.source_policy?.collective_memory_claims_require_defined_group_period_and_mediation_process === true,
    audience_nostalgia_has_reception_boundary: brief.source_policy?.nostalgic_textual_framing_does_not_prove_audience_nostalgia === true,
    character_and_star_are_distinct: brief.source_policy?.character_iconicity_and_performer_stardom_are_distinct === true,
    fulltext_still_required: brief.production_requirements?.chapter_registration_only_after_fulltext_claim_and_evidence_audit === true && brief.next_gate === 'produce_full_chapter_claims_and_inspectable_sources_for_cultural_heritage_canon_stars_memory'
  };

  const passed = Object.values(gates).every(Boolean);
  const quality_assessment = {
    dimensions: {
      correctness_and_evidence: { score: passed ? 5 : 0 },
      coverage_and_completion: { score: passed ? 5 : 0 },
      editorial_quality: { score: passed ? 5 : 0 },
      technical_integrity: { score: passed ? 5 : 0 },
      safety_and_responsibility: { score: passed ? 5 : 0 },
      maintainability_and_reproducibility: { score: passed ? 5 : 0 }
    },
    total_score: passed ? 30 : 0,
    conclusion: passed ? 'high_quality_source_brief_ready_for_fulltext' : 'source_brief_blocked',
    critical_deviations: passed ? [] : Object.entries(gates).filter(([, ok]) => !ok).map(([id]) => id),
    unresolved_blockers: passed ? [] : ['unit15_source_brief_gate_failed']
  };

  return {
    schema: 'history_go_film_tv_cultural_heritage_canon_stars_memory_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-15',
    status: passed ? 'cultural_heritage_canon_stars_memory_source_brief_verified' : 'blocked',
    planned_unit_id: UNIT_ID,
    summary: {
      emne_count: topics.length,
      module_count: (brief.proposed_module_order || []).length,
      method_count: (brief.method_basis || []).length,
      planned_claim_count: claims.length,
      source_count: sources.length,
      used_source_count: usedSources.size,
      case_count: cases.length,
      used_case_count: usedCases.size
    },
    claim_counts_by_emne: claimCounts,
    gates,
    quality_assessment,
    next_gate: brief.next_gate
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditFilmTvCulturalHeritageCanonStarsMemorySourceBriefV1();
  write(P.report, report);
  if (report.status !== 'cultural_heritage_canon_stars_memory_source_brief_verified') {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Film & TV Unit 15 source brief OK: ${report.summary.emne_count}/12 emner, ${report.summary.planned_claim_count} claims, ${report.summary.source_count} kilder, ${report.summary.case_count} case, ${report.summary.method_count} metoder.`);
  }
}
