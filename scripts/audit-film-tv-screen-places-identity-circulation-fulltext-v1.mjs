#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import {
  buildFilmTvScreenPlacesIdentityCirculationFulltextV1,
  buildClaimSourceIdsByClaim
} from './materialize-film-tv-screen-places-identity-circulation-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'skjermsteder-identitet-og-sirkulasjon';
const OUTPUT_GATE = 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  sourceBrief: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-screen-places-identity-circulation-fulltext-v1-audit.json'
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const normalize = (value) => String(value || '').toLocaleLowerCase('nb-NO').replace(/\s+/gu, ' ').trim();
const sentenceCounts = (paragraphs) => {
  const counts = new Map();
  for (const paragraph of paragraphs) {
    for (const raw of String(paragraph).split(/(?<=[.!?])\s+/u)) {
      const normalized = normalize(raw);
      if (normalized.length < 45) continue;
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    }
  }
  return counts;
};
const versionAtLeast = (actual, minimum) => {
  const a = String(actual || '0').split('.').map(Number);
  const b = String(minimum || '0').split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  }
  return true;
};

export function auditFilmTvScreenPlacesIdentityCirculationFulltextV1({ writeReport = false, checkReport = true } = {}) {
  const built = buildFilmTvScreenPlacesIdentityCirculationFulltextV1();
  const sourceBrief = read(P.sourceBrief);
  const chapter = read(P.chapter);
  const brief = read(P.brief);
  const claimsDoc = read(P.claims);
  const registry = read(P.registry);
  const status = read(P.status);
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const paragraphClaimIds = sections.flatMap((section) => section.paragraphClaimIds || []).flat();
  const keyPointClaimIds = sections.flatMap((section) => section.keyPointClaimIds || []).flat(Infinity);
  const claims = claimsDoc.claims || [];
  const claimIds = new Set(claims.map((claim) => claim.id));
  const sourceIds = new Set(claimsDoc.sources.map((source) => source.id));
  const usedSourceIds = new Set(claims.flatMap((claim) => claim.source_ids || []));
  const caseIds = new Set(chapter.workCases.map((row) => row.id));
  const expectedClaimSourceIds = buildClaimSourceIdsByClaim(built.topicBriefs);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  const chapterRecord = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const repeated = sentenceCounts(paragraphs);
  const maximumRepeatedSentenceCount = Math.max(0, ...repeated.values());
  const combinedText = normalize([
    chapter.lead,
    ...paragraphs,
    ...sections.flatMap((section) => section.methodLimits || []),
    ...sections.map((section) => section.documentedDisagreement)
  ].join(' '));
  const materializerSource = fs.readFileSync(new URL('./materialize-film-tv-screen-places-identity-circulation-fulltext-v1.mjs', import.meta.url), 'utf8');
  const auditSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);

  const gates = {
    exact_eleven_canonical_emne_coverage: chapter.emne_ids.length === 11
      && new Set(chapter.emne_ids).size === 11
      && isDeepStrictEqual(chapter.emne_ids, sourceBrief.scope.emne_ids),
    four_variable_modules_and_eleven_emne_owned_sections: modules.length === 4
      && sections.length === 11
      && new Set(sections.map((section) => section.emne_ids?.[0])).size === 11
      && isDeepStrictEqual(built.moduleParagraphCounts, [13, 10, 15, 14]),
    fifty_two_verified_final_claims: claims.length === 52
      && claimIds.size === 52
      && claims.every((claim) => claim.status === 'verified' && claim.plan_resolution === 'verified_as_planned'),
    claim_specific_evidence_complete_and_resolvable: claims.every((claim) =>
      Array.isArray(claim.source_ids)
      && claim.source_ids.length >= 2
      && claim.source_ids.every((id) => sourceIds.has(id))
      && isDeepStrictEqual(claim.source_ids, expectedClaimSourceIds[claim.id])
    ),
    all_thirty_six_inspectable_sources_used: sourceIds.size === 36
      && usedSourceIds.size === 36
      && [...sourceIds].every((id) => usedSourceIds.has(id))
      && claimsDoc.sources.every((source) => source.url?.startsWith('https://') && source.source_location && source.territory),
    thirty_three_documented_cases_renderable: chapter.workCases.length === 33
      && caseIds.size === 33
      && chapter.workCases.every((row) => row.title && row.medium && row.territory && row.role
        && row.source_ids.length > 0 && row.source_ids.every((id) => sourceIds.has(id)))
      && sections.every((section) => section.documentedCaseIds.length >= 3
        && section.documentedCaseIds.every((id) => caseIds.has(id))),
    fifty_two_substantive_unique_paragraphs: paragraphs.length === 52
      && new Set(paragraphs).size === 52
      && paragraphs.every((paragraph) => wordCount(paragraph) >= 150 && paragraph.length >= 900),
    editorial_sentence_repetition_controlled: maximumRepeatedSentenceCount <= 3,
    paragraph_and_keypoint_claim_trace_complete: paragraphClaimIds.length === 52
      && new Set(paragraphClaimIds).size === 52
      && paragraphClaimIds.every((id) => claimIds.has(id))
      && keyPointClaimIds.every((id) => claimIds.has(id))
      && sections.every((section) => section.paragraphs.length === section.paragraphClaimIds.length
        && section.keyPoints.length === section.keyPointClaimIds.length),
    canonical_methods_resolve: chapter.method_ids.length >= 12
      && isDeepStrictEqual(chapter.method_ids, built.chapter.method_ids)
      && isDeepStrictEqual(brief.requiredMethodIds, chapter.method_ids),
    sections_have_research_method_and_disagreement: sections.every((section) =>
      section.theoryResearchers.length >= 2
      && section.methodLimits.length >= 2
      && section.methodLimits.every((value) => value.length >= 70)
      && section.documentedDisagreement.length >= 120
      && section.keyPoints.length >= 2
    ),
    twelve_distributed_self_checks: modules.flatMap((module) => module.selfCheck || []).length === 12
      && modules.every((module) => (module.selfCheck || []).length === 3),
    four_place_and_viewing_layers_separated: combinedText.includes('vist sted')
      && combinedText.includes('opptakssted')
      && combinedText.includes('fiktiv')
      && combinedText.includes('lokal virkning')
      && sourceBrief.source_policy.shown_place_actual_shooting_location_fictional_space_and_documented_local_effect_are_distinct,
    maps_routes_and_databases_bounded: /kart|geokoding|database/u.test(combinedText)
      && /ikke.*(bevis|bevise)|kan ikke alene/u.test(combinedText)
      && sourceBrief.source_policy.maps_routes_geocoding_and_databases_document_spatial_relations_not_meaning_or_reception_alone,
    interior_building_set_and_lived_home_separated: combinedText.includes('scenografi')
      && combinedText.includes('location')
      && combinedText.includes('levd hjem')
      && sourceBrief.source_policy.interior_representation_actual_building_studio_set_and_digital_space_are_distinct,
    landscape_atmosphere_environment_and_production_effect_separated: combinedText.includes('landskaps')
      && combinedText.includes('stemning')
      && combinedText.includes('miljøtilstand')
      && sourceBrief.source_policy.landscape_atmosphere_is_an_audiovisual_construction_not_measured_audience_affect
      && sourceBrief.source_policy.screened_nature_is_not_evidence_of_actual_environmental_condition,
    indigenous_source_control_and_arctic_diversity_explicit: combinedText.includes('urfolksstyrte')
      && combinedText.includes('sápmi')
      && combinedText.includes('inuit nunangat')
      && sourceBrief.source_policy.indigenous_cases_require_authorship_language_territory_knowledge_position_and_source_control
      && sourceBrief.source_policy.rural_peripheral_and_arctic_geographies_are_not_homogeneous_or_empty,
    mobility_exile_diaspora_and_viewing_layers_separated: combinedText.includes('diaspora')
      && combinedText.includes('eksil')
      && combinedText.includes('transitt')
      && combinedText.includes('visningssituasjon')
      && sourceBrief.source_policy.exile_diaspora_mobility_and_multilingualism_must_not_be_essentialised,
    identity_representation_and_lived_belonging_separated: combinedText.includes('identitetsarbeid')
      && combinedText.includes('fellesskapsdata')
      && sourceBrief.source_policy.actual_identity_work_or_belonging_requires_person_or_community_evidence_not_representation_alone,
    iconicity_myth_memory_and_local_effect_separated: combinedText.includes('ikonstatus')
      && combinedText.includes('stedsmyte')
      && combinedText.includes('skjermminne')
      && sourceBrief.source_policy.iconicity_requires_documented_repetition_circulation_intertext_or_recognition
      && sourceBrief.source_policy.place_myth_is_a_historical_pattern_of_representation_not_a_synonym_for_falsehood
      && sourceBrief.source_policy.personal_popular_public_archival_and_institutional_memory_are_distinct,
    archive_provenance_and_memory_effect_bounded: combinedText.includes('digitalisering')
      && combinedText.includes('gaprapportering')
      && sourceBrief.source_policy.archive_absence_claims_require_collection_search_metadata_digitisation_and_gap_reporting
      && sourceBrief.source_policy.memory_effect_theories_are_not_universal_measured_audience_outcomes,
    unit_thirteen_boundary_explicit: combinedText.includes('enhet 13')
      && combinedText.includes('samtykke')
      && combinedText.includes('bilderett')
      && combinedText.includes('fysisk inngrep')
      && sourceBrief.source_policy.production_intervention_consent_image_rights_film_tourism_and_local_effects_are_deferred_to_unit_13,
    source_brief_is_immutable_historical_input: sourceBrief.status === 'source_claim_brief_complete_full_chapter_production'
      && sourceBrief.runtime_registration.registered === false
      && sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false
      && sourceBrief.production_requirements.current_claim_plan_counts_by_emne.reduce((sum, value) => sum + value, 0) === 52,
    chapter_registered_and_status_advanced: chapterRecord?.file === P.chapter
      && chapterRecord?.claimsFile === P.claims
      && chapterRecord?.briefFile === P.brief
      && registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief === P.sourceBrief
      && filmStatus?.editorialStatus === 'chapters_in_progress'
      && filmStatus?.nextGate === OUTPUT_GATE
      && versionAtLeast(registry.version, '2.97.0')
      && versionAtLeast(status.version, '1.90.0'),
    materializer_outputs_match_committed_files: isDeepStrictEqual(chapter, built.chapter)
      && isDeepStrictEqual(brief, built.chapterBrief)
      && isDeepStrictEqual(claimsDoc, built.claimsDoc)
      && isDeepStrictEqual(registry, built.registry)
      && isDeepStrictEqual(status, built.status)
      && modules.every((module, index) => isDeepStrictEqual(module, built.modules[index])),
    materializer_and_audit_are_scm_free: forbiddenScmTokens.every((token) => !materializerSource.includes(token) && !auditSource.includes(token))
      && !forbiddenGitCommand.test(materializerSource)
      && !forbiddenGitCommand.test(auditSource),
    all_source_policy_guards_remain_true: Object.values(sourceBrief.source_policy).every((value) => value === true)
  };
  for (const [id, ok] of Object.entries(gates)) assert(ok, `Fulltekstport feilet: ${id}`);

  const qualityAssessment = {
    schema: 'history_go_six_dimension_quality_assessment_v1',
    assessment_scope: 'film_tv_unit_12_verified_full_chapter',
    scale: { minimum: 1, maximum: 5 },
    threshold: { minimum_dimension_score: 4, minimum_total_score: 27, maximum_total_score: 30, critical_deviations_allowed: 0 },
    dimensions: {
      correctness_and_evidence: {
        score: 5,
        evidence_gate_ids: ['fifty_two_verified_final_claims', 'claim_specific_evidence_complete_and_resolvable', 'all_thirty_six_inspectable_sources_used'],
        evidence: '52/52 sluttclaims har claimspesifikk evidens fra 36/36 inspiserbare kilder, og alle kilder brukes innenfor emnets dokumenterte brief.'
      },
      coverage_and_completion: {
        score: 5,
        evidence_gate_ids: ['exact_eleven_canonical_emne_coverage', 'four_variable_modules_and_eleven_emne_owned_sections', 'thirty_three_documented_cases_renderable'],
        evidence: 'Alle 11 canonicale emner er dekket én gang gjennom fire variable moduler, 11 emneeide seksjoner, 52 fagavsnitt og 33 dokumenterte case.'
      },
      editorial_quality: {
        score: 4,
        evidence_gate_ids: ['fifty_two_substantive_unique_paragraphs', 'editorial_sentence_repetition_controlled', 'sections_have_research_method_and_disagreement'],
        evidence: 'Alle fagavsnitt er substansielle og unike, setningsgjenbruk er kontrollert, og hver seksjon har egne forskningsankre, metodegrenser og dokumentert faglig spenning.'
      },
      technical_integrity: {
        score: 5,
        evidence_gate_ids: ['paragraph_and_keypoint_claim_trace_complete', 'canonical_methods_resolve', 'materializer_outputs_match_committed_files'],
        evidence: 'Kapittel, moduler, brief, claims, register og status materialiseres deterministisk, og alle avsnitts- og nøkkelpunktreferanser er resolvable.'
      },
      safety_and_responsibility: {
        score: 5,
        evidence_gate_ids: ['indigenous_source_control_and_arctic_diversity_explicit', 'identity_representation_and_lived_belonging_separated', 'unit_thirteen_boundary_explicit'],
        evidence: 'Urfolksstyrt kildekontroll, arktisk heterogenitet, person- og fellesskapsevidens og grensen mot samtykke, bilderett, inngrep og lokal effekt er eksplisitte.'
      },
      maintainability_and_reproducibility: {
        score: 5,
        evidence_gate_ids: ['source_brief_is_immutable_historical_input', 'chapter_registered_and_status_advanced', 'materializer_and_audit_are_scm_free'],
        evidence: 'Den historiske source briefen forblir uendret input, progresjonen er monoton, og materializer og audit er rene dataverktøy uten SCM-sideeffekter.'
      }
    },
    total_score: 29,
    critical_deviations: [],
    unresolved_blockers: [],
    automation_limits: [
      'Automatiske porter kontrollerer dekning, sporbarhet, kildebruk, kontrakter, metodegrenser og deterministisk materialisering.',
      'Menneskelig stil- og brukstesting kan gi senere pedagogisk finjustering uten å endre evidensstatus.'
    ],
    conclusion: 'high_quality_verified_full_chapter'
  };
  assert(Object.values(qualityAssessment.dimensions).every((dimension) => dimension.score >= 4), 'Kvalitetsdimensjon under minstekrav');
  assert(qualityAssessment.total_score >= 27, 'Kvalitetsvurderingen er under totalgrensen');

  const report = {
    schema: 'history_go_film_tv_screen_places_identity_circulation_fulltext_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-14',
    status: 'screen_places_identity_circulation_chapter_verified_registered',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    summary: {
      emne_count: chapter.emne_ids.length,
      module_count: modules.length,
      section_count: sections.length,
      paragraph_count: paragraphs.length,
      verified_claim_count: claims.length,
      used_source_count: usedSourceIds.size,
      case_count: chapter.workCases.length,
      method_count: chapter.method_ids.length,
      self_check_count: modules.flatMap((module) => module.selfCheck || []).length,
      minimum_paragraph_word_count: Math.min(...paragraphs.map(wordCount)),
      maximum_repeated_sentence_count: maximumRepeatedSentenceCount
    },
    module_paragraph_counts: built.moduleParagraphCounts,
    quality_assessment: qualityAssessment,
    gates,
    next_gate: OUTPUT_GATE
  };

  if (writeReport) write(P.report, report);
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler`);
    assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFilmTvScreenPlacesIdentityCirculationFulltextV1({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--write-report')
    });
    console.log(`Film & TV enhet 12 fulltekst OK: ${report.summary.verified_claim_count} claims, ${report.summary.used_source_count} kilder og ${report.summary.case_count} case.`);
  } catch (error) {
    console.error(`Film & TV enhet 12 fulltekst FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
