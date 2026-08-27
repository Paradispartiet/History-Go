#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PATHS = {
  place: "data/places/naeringsliv/oslo/places_naeringsliv/lilleborg_fabrikker.json",
  production: "data/places/production/lilleborg_fabrikker.json",
  business: "data/places/naeringsliv-production/lilleborg_fabrikker.json",
  leksikon: "data/leksikon/places/oslo/naeringsliv/leksikon_lilleborg_fabrikker.json",
  runtime: "data/runtime/place-open/lilleborg_fabrikker.json",
  quiz: "data/quiz/naeringsliv/lilleborg_fabrikker_sets.json",
  brief: "data/quiz/production_briefs/naeringsliv/lilleborg_fabrikker.json",
  context: "data/quiz/production_context/naeringsliv/lilleborg_fabrikker.json",
  stories: "data/stories/stories_lilleborg_fabrikker.json",
  brands: "data/brands/brands_master.json",
  brandsByPlace: "data/brands/brands_by_place.json",
  peopleClaims: "data/people/claims/naeringsliv/oslo/lilleborg_fabrikker/peter_wessel_wind_kildal_lilleborg.claims.json",
  lesespor: "data/lesespor/oslo/lesespor_oslo_naeringsliv.json"
};

const PLACE_ID = "lilleborg_fabrikker";
const PERSON_ID = "peter_wessel_wind_kildal_lilleborg";
const BRAND_ID = "lilleborg_fabrikker_company";
const REQUIRED_ARTICLE_FIELDS = [
  "definition",
  "historical_or_systemic_background",
  "theories_researchers_and_findings",
  "methods_and_limitations",
  "boundaries_and_disagreements",
  "documented_cases_or_teaching_scenarios",
  "key_questions",
  "source_ids",
  "claim_ids"
];

const asArray = value => Array.isArray(value) ? value : [];
const nonTrivial = (value, minimum = 40) => typeof value === "string" && value.trim().length >= minimum;
const resolves = (ids, registry) => asArray(ids).length > 0 && asArray(ids).every(id => registry.has(id));
const dimensionScore = (checks, maximum = 5) => {
  const values = Object.values(checks);
  if (values.length === 0) return 1;
  return Math.max(1, Math.min(maximum, Math.round(maximum * values.filter(Boolean).length / values.length)));
};

export function loadLilleborgArtifacts(root = process.cwd()) {
  const read = relativePath => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  return Object.fromEntries(Object.entries(PATHS).map(([key, relativePath]) => [key, read(relativePath)]));
}

export function evaluateLilleborgArtifacts(artifacts, { root = process.cwd() } = {}) {
  const { place, production, business, leksikon, runtime, quiz, brief, context, stories, brands, brandsByPlace, peopleClaims, lesespor } = artifacts;
  const sourceIds = new Set(asArray(leksikon.sources).map(source => source.id).filter(Boolean));
  const claimIds = new Set(asArray(production.claims).map(claim => claim.id).filter(Boolean));
  const methodRegistry = JSON.parse(fs.readFileSync(path.join(root, "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json"), "utf8"));
  const methodIds = new Set(asArray(methodRegistry.methods).map(method => method.method_id));
  const article = leksikon.scholarly_article || {};
  const articleSections = [
    ...asArray(article.theories_researchers_and_findings),
    ...asArray(article.methods_and_limitations),
    ...asArray(article.boundaries_and_disagreements),
    ...asArray(article.documented_cases_or_teaching_scenarios)
  ];
  const articleBindingsResolve = articleSections.every(section =>
    resolves(section.claim_ids, claimIds) && resolves(section.source_ids, sourceIds)
  );
  const articleMethodsResolve = asArray(article.methods_and_limitations).every(method => methodIds.has(method.method_id));
  const readings = asArray(lesespor.items).filter(item => asArray(item.place_ids).includes(PLACE_ID));
  const questions = asArray(quiz.sets).flatMap(set => asArray(set.questions));
  const localFiles = [
    place.frontImage,
    place.image,
    place.cardImage,
    ...asArray(place.objects).map(item => item.image),
    ...asArray(place.structures).map(item => item.image),
    "bilder/kort/people/peter_wessel_wind_kildal_lilleborg.webp",
    "bilder/kort/brands/lilleborg_gronnsepe_skilt.webp"
  ].filter(Boolean);

  const checks = {
    correctness_and_evidence: {
      canonical_identity_preserved: place.id === PLACE_ID && place.coordStatus === "verified" && production.placeId === PLACE_ID,
      all_place_claims_verified_and_sourced: asArray(production.claims).length >= 10 && asArray(production.claims).every(claim => claim.status === "verified" && /^https:\/\//u.test(claim.sourceUrl || "")),
      people_claims_complete: peopleClaims.person_id === PERSON_ID && peopleClaims.completion?.claims_verified === `${asArray(peopleClaims.claims).length}/${asArray(peopleClaims.claims).length}` && asArray(peopleClaims.claims).every(claim => claim.status === "verified"),
      article_top_level_bindings_resolve: resolves(article.source_ids, sourceIds) && resolves(article.claim_ids, claimIds),
      every_scholarly_section_is_claim_and_source_bound: articleBindingsResolve
    },
    coverage_and_completion: {
      four_image_ready_collections: JSON.stringify(place.place_card_profile?.collection_ids) === JSON.stringify(["people", "objects", "brands", "structures"]),
      all_expected_article_fields_exist: REQUIRED_ARTICLE_FIELDS.every(field => field in article),
      normal_quiz_is_four_by_seven: asArray(quiz.sets).length === 4 && asArray(quiz.sets).every(set => asArray(set.questions).length === 7) && questions.length === 28,
      popup_deliveries_materialized: asArray(runtime.leksikon).length === 1 && asArray(runtime.stories).length === 1 && asArray(runtime.lesespor).length === 4 && asArray(runtime.language?.entries).length === 3,
      people_brand_story_and_readings_resolve: asArray(runtime.people).some(person => person.id === PERSON_ID) && asArray(brands).some(brand => brand.id === BRAND_ID) && asArray(brandsByPlace[PLACE_ID]).includes(BRAND_ID) && asArray(stories).length === 1 && readings.length === 4
    },
    editorial_quality: {
      definition_and_background_are_substantive: nonTrivial(article.definition, 100) && asArray(article.historical_or_systemic_background).length >= 2 && asArray(article.historical_or_systemic_background).every(paragraph => nonTrivial(paragraph, 100)),
      named_researchers_and_frameworks_are_explicit: asArray(article.theories_researchers_and_findings).length >= 2 && ["Adam Smith", "Joseph Schumpeter"].every(name => asArray(article.theories_researchers_and_findings).some(item => item.researcher === name && nonTrivial(item.content, 120))),
      methods_include_limitations: asArray(article.methods_and_limitations).length >= 2 && asArray(article.methods_and_limitations).every(item => nonTrivial(item.application, 80) && nonTrivial(item.limitations, 80)),
      disagreements_are_substantive: asArray(article.boundaries_and_disagreements).length >= 2 && asArray(article.boundaries_and_disagreements).every(item => nonTrivial(item.content, 100)),
      two_documented_cases_are_declared: asArray(article.documented_cases_or_teaching_scenarios).length >= 2 && asArray(article.documented_cases_or_teaching_scenarios).every(item => item.kind === "documented_case" && nonTrivial(item.analysis, 120)),
      key_questions_and_user_facing_prose_exist: asArray(article.key_questions).length >= 3 && asArray(article.key_questions).every(question => nonTrivial(question, 30)) && asArray(leksikon.wikiText).length >= 8
    },
    technical_integrity: {
      production_packets_ready: production.status === "ready_v4_2" && business.status === "ready" && Object.values(business.gates || {}).every(gate => gate.status === "PASS"),
      quiz_context_and_brief_match: context.profile === "normal_4x7" && asArray(brief.claims).length === 28 && business.quizOpening?.firstTwoSetsQuestionCount === 14,
      scholarly_methods_resolve_to_canonical_registry: articleMethodsResolve,
      all_local_assets_exist: localFiles.every(file => fs.existsSync(path.join(root, file))),
      no_unresolved_runtime_delivery: asArray(runtime.people).length > 0 && asArray(runtime.leksikon[0]?.chronology).length === 14
    },
    safety_and_responsibility: {
      theory_is_labeled_as_lens_not_cause: asArray(article.theories_researchers_and_findings).every(item => item.status === "analytical_lens_not_causal_claim"),
      uncertainty_and_missing_measurement_are_explicit: asArray(article.methods_and_limitations).some(item => /kan ikke|mangler|ikke grunnlag/iu.test(item.limitations)) && asArray(article.boundaries_and_disagreements).some(item => /dokumenterer[^.!?]{0,80}ikke|fastslår[^.!?]{0,80}ikke|ikke én|uløst/iu.test(item.content)),
      current_company_is_separated_from_historic_site: /ikke.*Sandaker|uten at det historiske fabrikkstedet/iu.test(business.presentOperation?.originalEconomicRoleRelationship || ""),
      brand_and_image_safeguards_are_explicit: asArray(brands).find(brand => brand.id === BRAND_ID)?.imageMeta?.noEndorsement === true
    },
    maintainability_and_auditability: {
      article_references_are_machine_resolvable: articleBindingsResolve && articleMethodsResolve,
      source_and_claim_ids_are_unique: sourceIds.size === asArray(leksikon.sources).length && claimIds.size === asArray(production.claims).length,
      canonical_builder_and_artifact_paths_are_recorded: fs.existsSync(path.join(root, "tools/build-lilleborg-fabrikker-completion.mjs")) && Object.values(PATHS).every(relativePath => fs.existsSync(path.join(root, relativePath))),
      chronology_and_story_ownership_are_separate: business.chronologyStories?.status === "PASS" && asArray(leksikon.chronology).length === 14 && asArray(stories).every(story => story.quality_profile === "episode_v1")
    }
  };

  const failedChecks = Object.entries(checks).flatMap(([dimension, dimensionChecks]) =>
    Object.entries(dimensionChecks).filter(([, passed]) => !passed).map(([id]) => `${dimension}.${id}`)
  );
  const scores = {
    correctness_and_evidence: dimensionScore(checks.correctness_and_evidence),
    coverage_and_completion: dimensionScore(checks.coverage_and_completion),
    editorial_quality: dimensionScore(checks.editorial_quality, 4),
    technical_integrity: dimensionScore(checks.technical_integrity),
    safety_and_responsibility: dimensionScore(checks.safety_and_responsibility),
    maintainability_and_auditability: dimensionScore(checks.maintainability_and_auditability)
  };
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const criticalFindings = failedChecks.filter(id => /correctness|editorial_quality|safety/iu.test(id));
  const passed = failedChecks.length === 0 && Object.values(scores).every(score => score >= 4) && total >= 27;
  const qualityScore = Object.fromEntries(Object.entries(scores).map(([id, score]) => [id, {
    score,
    note: `${Object.values(checks[id]).filter(Boolean).length}/${Object.keys(checks[id]).length} eksplisitte kontroller bestod${id === "editorial_quality" ? "; automatisk kontroll er bevisst avgrenset til 4/5 og erstatter ikke redaksjonell menneskevurdering" : ""}.`
  }]));
  Object.assign(qualityScore, {
    total,
    critical_findings: criticalFindings.length,
    unresolved_blockers: failedChecks.length
  });

  return {
    schema: "history_go_lilleborg_completion_audit_v2",
    status: passed ? "high_quality" : "blocked",
    checks,
    failed_checks: failedChecks,
    quality_score: qualityScore,
    conclusion: passed
      ? "Alle maskinelt etterprøvbare Lilleborg-porter består; redaksjonell score er begrenset til 4/5 fordi automatisering ikke alene kan erklære teksten perfekt."
      : "Lilleborg kan ikke stå som complete før alle oppførte kontrollfeil er lukket."
  };
}

export function auditLilleborgCompletion({ root = process.cwd() } = {}) {
  return evaluateLilleborgArtifacts(loadLilleborgArtifacts(root), { root });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditLilleborgCompletion({ root: process.cwd() });
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== "high_quality") process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
