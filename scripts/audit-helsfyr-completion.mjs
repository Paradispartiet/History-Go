#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const exists = file => fs.existsSync(path.join(root, file));
const asArray = value => Array.isArray(value) ? value : [];
const place = read("data/places/by/oslo/places/helsfyr.json");
const production = read("data/places/production/helsfyr.json");
const quiz = read("data/quiz/by/helsfyr_sets.json");
const brief = read("data/quiz/production_briefs/by/helsfyr.json");
const context = read("data/quiz/production_context/by/helsfyr.json");
const story = read("data/stories/stories_helsfyr.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/helsfyr.json");
const leksikon = read("data/leksikon/places/oslo/by/leksikon_helsfyr.json");
const workcard = read("reports/place-production/helsfyr-workcard-current.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");
const bruskelandPayload = read("data/people/by/oslo/helsfyr/guttorm_bruskeland.json");
const bruskeland = Array.isArray(bruskelandPayload) ? bruskelandPayload[0] : bruskelandPayload;
const questions = asArray(quiz.sets).flatMap(set => asArray(set.questions));
const first14 = questions.slice(0, 14);
const briefSources = brief.sources && typeof brief.sources === "object" && !Array.isArray(brief.sources) ? brief.sources : {};
const briefSourceEntries = Object.entries(briefSources);
const sourceIds = new Set(Object.keys(briefSources));
const quizSources = quiz.sources && typeof quiz.sources === "object" && !Array.isArray(quiz.sources) ? quiz.sources : {};
const claimIds = new Set(asArray(production.claims).map(claim => claim.id));
const localAssets = [
  place.image, place.cardImage, place.frontImage, place.quizCardImage,
  bruskeland.image,
  ...asArray(place.objects).map(item => item.image),
  ...asArray(place.structures).map(item => item.image),
  brands.find(brand => brand.id === "sporveien")?.logo,
  place.for_na?.beforeImage, place.for_na?.nowImage
].filter(Boolean);
const checks = {
  canonical_identity: place.id === "helsfyr" && place.category === "by" && place.coordStatus === "verified_geometry",
  curated_fagverk_preserved: place.fagverk?.schema === "history_go_place_fagverk_v2" && place.fagverk?.status === "curated" && place.fagverk?.level === "full",
  exact_four_collections: JSON.stringify(place.place_card_profile?.collection_ids) === JSON.stringify(["people", "objects", "brands", "structures"]),
  people_image_ready: bruskeland?.placeId === "helsfyr" && /^bilder\/kort\/people\//u.test(bruskeland?.image || "") && Boolean(bruskeland?.imageMeta?.sourcePage),
  two_physical_objects: asArray(place.objects).length === 2 && asArray(place.objects).every(item => item.physicalObject === true && item.placeSpecific === true && item.image),
  direct_brand_ready: asArray(brandsByPlace.helsfyr).includes("sporveien") && brands.some(brand => brand.id === "sporveien" && brand.imageMeta?.noEndorsement === true && brand.logo),
  station_structure_ready: asArray(place.structures).length >= 1 && asArray(place.structures).every(item => item.image && asArray(item.source_urls).length >= 1),
  local_assets_exist: localAssets.length >= 9 && localAssets.every(exists),
  dedicated_quizcard: /^bilder\/QuizCards\/Helsfyr\./u.test(place.quizCardImage || "") && exists(place.quizCardImage),
  normal_quiz_4x7: asArray(quiz.sets).length === 4 && asArray(quiz.sets).every(set => asArray(set.questions).length === 7) && questions.length === 28,
  opening_is_14_normal_questions: first14.length === 14 && first14.every(q => q.question_type === "fact" && !q.method_id && !q.thinker_id && !q.topic_hook_id && !q.theory_ref),
  answer_positions_are_varied: new Set(questions.map(q => q.answerIndex)).size === 3 && questions.every(q => Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < asArray(q.options).length),
  quiz_claim_knowledge_links: questions.every(q => q.claim_id && q.primary_knowledge_unit_id && asArray(q.knowledge_unit_ids).includes(q.primary_knowledge_unit_id) && q.knowledge_link_status === "linked"),
  reviewed_source_brief: brief.status === "reviewed" && briefSourceEntries.length >= 6 && briefSourceEntries.every(([id, source]) => Boolean(id) && source?.review_status === "reviewed" && /^https:\/\//u.test(source?.url || "")),
  quiz_sources_resolve: questions.every(q => asArray(q.source).length >= 1 && asArray(q.source).every(id => sourceIds.has(id) && typeof quizSources[id] === "string" && quizSources[id] === briefSources[id]?.url)),
  generated_context_matches: context.targetId === "helsfyr" && context.categoryId === "by" && context.profile === "normal_4x7",
  story_episode_ready: asArray(story).length === 1 && story[0].quality_profile === "episode_v1" && asArray(story[0].sources).length >= 3,
  language_ready: language.place_id === "helsfyr" && language.dialect_status === "not_applicable_place_level" && asArray(language.entries).length === 5 && asArray(language.entries).every(entry => asArray(entry.sources).length >= 1),
  chronology_ready: asArray(leksikon).length === 1 && asArray(leksikon[0].chronology).length === 8 && asArray(leksikon[0].chronology).every(item => asArray(item.sources).length >= 1),
  production_claims_bound: production.status === "ready_v4_2" && claimIds.size === asArray(production.claims).length && asArray(production.claims).length >= 10 && asArray(production.claims).every(claim => claim.status === "verified" && /^https:\/\//u.test(claim.sourceUrl || "")),
  sentence_coverage_complete: asArray(production.sentenceCoverage?.desc).length > 0 && asArray(production.sentenceCoverage?.popupDesc).length > 0 && [...asArray(production.sentenceCoverage?.desc), ...asArray(production.sentenceCoverage?.popupDesc)].every(row => asArray(row.claimIds).length >= 1 && asArray(row.claimIds).every(id => claimIds.has(id))),
  workcard_complete_and_preflighted: workcard.place_id === "helsfyr" && workcard.status === "complete" && workcard.rule_preflight?.schema === "history_go_place_rule_preflight_v1" && workcard.rule_preflight?.status === "PASS",
  image_comparison_is_bounded: /ulike ståsteder|ulike ståsted/iu.test(place.for_na?.change || "") && asArray(place.for_na?.sources).length >= 2,
  privacy_boundary_explicit: /bosted|arbeidssted|reiseformål/iu.test(JSON.stringify(place.interpretation?.counterpoints || [])) && /identifiserbare|personvern|privat/iu.test(JSON.stringify(place.onsite || {}))
};
const failed = Object.entries(checks).filter(([, passed]) => !passed).map(([id]) => id);
const report = {
  schema: "history_go_helsfyr_completion_audit_v1",
  status: failed.length ? "blocked" : "high_quality",
  place_id: "helsfyr",
  checks,
  failed_checks: failed,
  summary: {
    collections: asArray(place.place_card_profile?.collection_ids).length,
    local_assets: localAssets.length,
    quiz_sets: asArray(quiz.sets).length,
    quiz_questions: questions.length,
    chronology_anchors: asArray(leksikon[0]?.chronology).length,
    language_entries: asArray(language.entries).length,
    stories: asArray(story).length,
    production_claims: asArray(production.claims).length
  }
};
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exitCode = 1;
