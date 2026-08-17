#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildFilmTvScreenPublicSphereCommunitySocietyFulltextV1 } from './materialize-film-tv-screen-public-sphere-community-society-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_GATE = 'screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief';
const FILM_TV_PRODUCTION_GATE = /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$/;
const P = Object.freeze({
  chapter: 'data/fagverk/film_tv/skjermoffentlighet-fellesskap-og-samfunn.json',
  brief: 'data/fagverk/film_tv/skjermoffentlighet-fellesskap-og-samfunn/brief.json',
  claims: 'data/fagverk/film_tv/skjermoffentlighet-fellesskap-og-samfunn/claims.json',
  sourceBrief: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_source_claim_brief_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_topic_claims_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-screen-public-sphere-community-society-source-brief-v1-audit.json',
  report: 'reports/fagverk/film-tv-screen-public-sphere-community-society-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };

export function auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1({ writeReport = false } = {}) {
  const built = buildFilmTvScreenPublicSphereCommunitySocietyFulltextV1();
  const chapter = read(P.chapter);
  const brief = read(P.brief);
  const claimsDoc = read(P.claims);
  const sourceBrief = read(P.sourceBrief);
  const topicClaims = read(P.topicClaims);
  const registry = read(P.registry);
  const status = read(P.status);
  const sourceBriefReport = read(P.sourceBriefReport);
  const sections = built.modules.flatMap((row) => row.sections);
  const paragraphClaimIds = sections.flatMap((row) => row.paragraphClaimIds).flat();
  const claims = claimsDoc.claims;
  const claimIds = new Set(claims.map((row) => row.id));
  const sourceIds = new Set(claimsDoc.sources.map((row) => row.id));
  const usedSourceIds = new Set(claims.flatMap((row) => row.source_ids));
  const resolvedPlans = topicClaims.topic_briefs.flatMap((row) => row.planned_claims);
  const effectClaim = claims.find((row) => row.id === 'sp-climate-5');
  const chapterRecord = registry.subjects.film_tv.chapters.find((row) => row.id === chapter.id);
  const builtChapterRecord = built.registry.subjects.film_tv.chapters.find((row) => row.id === chapter.id);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');

  const gates = {
    exact_canonical_emne_coverage: chapter.emne_ids.length === 9 && built.unit.emne_ids.every((id) => chapter.emne_ids.includes(id)),
    four_modules_and_nine_emne_owned_sections: built.modules.length === 4 && sections.length === 9 && sections.every((row) => row.emne_ids.length === 1),
    thirty_six_claim_traced_paragraphs: paragraphClaimIds.length === 36 && paragraphClaimIds.every((id) => claimIds.has(id)),
    thirty_six_verified_final_claims: claims.length === 36 && claims.every((row) => row.status === 'verified'),
    all_planned_claims_resolved: resolvedPlans.length === 36 && resolvedPlans.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id && claimIds.has(row.id)),
    all_twenty_eight_sources_used_by_final_claims: claimsDoc.sources.length === 28 && claimsDoc.sources.every((row) => usedSourceIds.has(row.id)),
    all_claim_source_references_resolve: claims.every((row) => row.source_ids.length > 0 && row.source_ids.every((id) => sourceIds.has(id))),
    thirty_cases_remain_available: built.casesDoc.cases.length === 30 && chapter.workCases.length === 30,
    empirical_effect_case_is_bounded: effectClaim?.evidence_mode === 'peer_reviewed_pre_post_impact_study' && effectClaim.source_ids.length === 1 && effectClaim.source_ids[0] === 'ftvsp20-yale-day-after',
    public_sphere_evidence_layers_are_visible: chapter.diagnosticQuestions.some((row) => row.question.includes('samfunnsoppdrag')) && brief.requiredCriticalDistinctions.some((row) => row.includes('regulatorisk vurdering')),
    identity_inference_safeguard_visible: chapter.learningObjectives.some((row) => row.includes('navn, aksent, utseende')) && brief.sourceStrategy.noIdentityInferenceFromNameAccentAppearanceOrOrigin === true,
    city_scope_boundary_visible: brief.requiredCriticalDistinctions.some((row) => row.includes('opptakssted')),
    climate_scope_boundary_visible: brief.requiredCriticalDistinctions.some((row) => row.includes('produksjonsfotavtrykk')),
    religion_scope_boundary_visible: brief.requiredCriticalDistinctions.some((row) => row.includes('trosstatus')),
    chapter_registered_after_gate: sourceBrief.runtime_registration.registered === true && sourceBrief.runtime_registration.chapter_id === chapter.id && Boolean(chapterRecord),
    registry_points_to_fulltext_assets: chapterRecord?.file === P.chapter && chapterRecord?.claimsFile === P.claims && chapterRecord?.briefFile === P.brief,
    status_advanced_to_next_unit: ['chapters_in_progress', 'complete'].includes(filmStatus?.editorialStatus) && FILM_TV_PRODUCTION_GATE.test(filmStatus?.nextGate || ''),
    source_brief_consumed_after_fulltext: sourceBrief.status === 'source_claim_brief_consumed_by_verified_chapter' && sourceBrief.next_gate === 'produce_source_and_claim_brief_for_skapende_arbeid_teknologi_og_ansvar',
    source_brief_audit_records_resolution: sourceBriefReport.status === 'source_claim_brief_consumed_by_verified_chapter' && sourceBriefReport.summary.resolved_claim_count === 36,
    deterministic_generated_state: isDeepStrictEqual(claimsDoc, built.claimsDoc)
      && isDeepStrictEqual(sourceBrief, built.sourceBrief)
      && isDeepStrictEqual(topicClaims, built.topicClaims)
      && isDeepStrictEqual(sourceBriefReport, built.sourceBriefReport)
      && isDeepStrictEqual(chapterRecord, builtChapterRecord)
  };

  const report = {
    schema: 'history_go_film_tv_screen_public_sphere_community_society_fulltext_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-12',
    status: 'full_chapter_complete_next_unit_source_brief',
    subject_id: 'film_tv',
    chapter_id: chapter.id,
    summary: {
      emne_count: chapter.emne_ids.length,
      module_count: built.modules.length,
      section_count: sections.length,
      paragraph_count: paragraphClaimIds.length,
      verified_claim_count: claims.length,
      used_source_count: usedSourceIds.size,
      case_count: chapter.workCases.length,
      related_place_count: chapter.relatedPlaces.length
    },
    gates,
    next_gate: OUTPUT_GATE
  };
  assert(Object.values(gates).every(Boolean), 'Minst én skjermoffentlighetsfulltekst-port feiler');
  if (writeReport) write(P.report, report);
  else assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFilmTvScreenPublicSphereCommunitySocietyFulltextV1({ writeReport: args.has('--write-report') });
    console.log(`Film & TV skjermoffentlighetsfulltekst OK: ${report.summary.emne_count} emner, ${report.summary.module_count} moduler, ${report.summary.section_count} seksjoner, ${report.summary.verified_claim_count} claims og ${report.summary.used_source_count} kilder.`);
  } catch (error) {
    console.error(`Film & TV skjermoffentlighetsfulltekst FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
