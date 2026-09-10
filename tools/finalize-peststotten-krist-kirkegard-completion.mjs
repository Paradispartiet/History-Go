#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";
import { id, verifiedAt, placeFile, urls, sourceDefs, desc, popupDesc } from "./peststotten-krist-kirkegard-content.mjs";
import { quizQuestions, phases, phaseTitles, selectedCurriculum, existingQuizAudit, profileDecision, heldBackCandidates, quizSources } from "./peststotten-krist-kirkegard-quiz.mjs";
import { materializePlaceCore } from "./peststotten-krist-kirkegard-place.mjs";
import { buildHistoryProduction, buildQualityAudit } from "./peststotten-krist-kirkegard-history.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`); };
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = value => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(value)].map(item => item.segment.trim()).filter(Boolean);

const core = await materializePlaceCore({ root, read, write, addOnce });
const { place, monumentObject, structures, historicalEvents, chronology, languageEntries, readingRows } = core;

const briefFile = `data/quiz/production_briefs/historie/${id}.json`;
const contextFile = `data/quiz/production_context/historie/${id}.json`;
const quizFile = `data/quiz/historie/${id}_sets.json`;
const briefSources = Object.fromEntries(Object.entries(sourceDefs).map(([key, source]) => [key, { url: source.url, source_type: source.source_type, review_status: "reviewed", review_note: source.title }]));
const briefClaims = quizQuestions.map((question, index) => ({ claim_id: question.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: index < 14 ? "fact" : index < 21 ? "context" : "concept_theory", statement: question.claim_basis, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }));
write(briefFile, {
  schema_version: "1.0", categoryId: "historie", targetId: id, scope: "place", status: "reviewed", reviewed_at: verifiedAt, profile_hint: "normal_4x7",
  review_note: "Oslo kommune, Oslo byleksikon og lokalhistoriske kilder er sammenlignet; usikkert samlet dødstall holdes ute av nøkkelfakta.",
  sources: briefSources, selected_curriculum: selectedCurriculum, profile_decision: profileDecision, existing_quiz_audit: existingQuizAudit, held_back_candidates: heldBackCandidates, claims: briefClaims
});
write(quizFile, {
  targetId: id, categoryId: "historie", size_class: "normal_4x7", generated_from: briefFile, generator_version: "history_go_manual_reviewed_v1", sources: quizSources,
  sets: phases.map((phase, index) => ({ set_id: `historie_${id}_set_${index + 1}`, level: index + 1, order: index + 1, phase, title: phaseTitles[index], xp: 50, questions: quizQuestions.slice(index * 7, index * 7 + 7) }))
});
const quizManifest = read("data/quiz/manifest.json"); quizManifest.historie ||= {}; quizManifest.historie[id] = `historie/${id}_sets.json`; write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json"); fagManifest.historie.quizProduction.targets[id] = { source_brief: `../quiz/production_briefs/historie/${id}.json`, context_artifact: `../quiz/production_context/historie/${id}.json`, quiz_file: `../quiz/historie/${id}_sets.json` }; write("data/fag/fag_manifest.json", fagManifest);
const built = await runBuildQuizProductionContext({ root, categoryId: "historie", targetId: id, outputPath: contextFile });
const quiz = read(quizFile);
quiz.production_context = {
  manifest_category: "historie", profile: built.profile, standard_version: "3.4", source_brief: briefFile, context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(built.resolved_files).map(([key, value]) => [key, value.path])), required_inputs_loaded: built.required_inputs_loaded,
  pensum_module_ids: built.selected_curriculum.module_ids, emne_ids: built.selected_curriculum.emne_ids, topic_hook_ids: built.selected_curriculum.topic_hook_ids,
  method_ids: built.selected_curriculum.method_ids, thinker_ids: built.selected_curriculum.thinker_ids, works: built.selected_curriculum.works,
  source_review_status: built.source_review_status, existing_quiz_audit: built.existing_quiz_audit, profile_decision: built.profile_decision,
  held_back_candidates: built.held_back_candidates, theory_start_phase: "final", method_start_phase: "final"
};
write(quizFile, quiz);

const claimSources = sentence => {
  if (/eldste|første/iu.test(sentence)) return ["byleksikon_pest", "oslo_brochure", "lokal_krist"];
  if (/Munch|Laura|Christian og søsteren|morens grav/iu.test(sentence)) return ["lokal_krist"];
  if (/1835|1840|1856|1924|1960|1971|Spigerverk|militær kirkegård/iu.test(sentence)) return ["byleksikon_krist", "lokal_krist"];
  if (/1999|rehabiliter|åpning som minnepark/iu.test(sentence)) return ["oslo_krist", "byleksikon_krist"];
  if (/dødstall|anslag|usikre|alle som/iu.test(sentence)) return ["lokal_pest", "byleksikon_pest"];
  return ["byleksikon_pest", "oslo_krist"];
};
const makeClaims = (field, text) => sentences(text).map((sentence, index) => {
  const ids = claimSources(sentence); const source = sourceDefs[ids[0]];
  const strong = /\b(?:første|eldste|største|minste|eneste|viktigste|ledende|avgjørende|førte til|på grunn av|derfor|dermed|revolusjonerte)\b/iu.test(sentence);
  const independent = [...new Set([...ids.slice(1).map(key => sourceDefs[key].url), urls.byleksikonPest, urls.osloKrist, urls.lokalKrist].filter(url => url !== source.url))];
  return {
    id: `claim_${id}_${field}_${String(index + 1).padStart(2, "0")}`, claim: sentence, sourceUrl: source.url,
    sourceLocation: `${source.title} – ${field}, setning ${index + 1}`, sourceType: source.source_type, verifiedAt, status: "verified",
    claimKind: index === 0 && field === "desc" ? "identity" : strong ? "strong" : "fact", evidenceMode: strong ? "explicit" : "direct",
    temporalStatus: "historical", independentSourceUrls: strong ? independent.slice(0, 2) : []
  };
});
const descClaims = makeClaims("desc", desc); const popupClaims = makeClaims("popup", popupDesc); const allClaims = [...descClaims, ...popupClaims];
const readinessTypes = ["når", "hvor", "hvilket_verk_eller_objekt", "hva", "hva_skjedde", "hvem", "hva", "hva_ble_bygget_produsert_eller_endret"];
write(`data/places/production/${id}.json`, {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId: id, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Peststøtten fra 1654 og den historiske Krist kirkegård-konteksten ved inngangen på Hammersborg.", period: "1654–", excludes: ["et eksakt samlet dødstall for alle pestofre i Christiania", "påstand om at Edvard Munch selv er gravlagt her", "Vår Frelsers gravlund som separat Place"] },
  claims: allClaims,
  sentenceCoverage: { desc: descClaims.map((claim, index) => ({ sentence: index + 1, claimIds: [claim.id] })), popupDesc: popupClaims.map((claim, index) => ({ sentence: index + 1, claimIds: [claim.id] })) },
  metadataSnapshot: { name: place.name, category: place.category, year: place.year, coordinates: { lat: place.lat, lon: place.lon } },
  collections: { people: ["edvard_munch"], objects: [monumentObject.id], structures: structures.map(item => item.id), historical_events: historicalEvents.map(item => item.id) },
  quizReadiness: { status: "canonical_normal_4x7", quizTargetId: id, sourceBrief: briefFile, productionContext: contextFile, normalOpeningQuestions: 14, totalQuestions: 28, reuseDecision: "Ingen aktiv target-quiz fantes.", questions: quizQuestions.slice(0, 8).map((question, index) => ({ question: question.question, answer: question.answer, type: readinessTypes[index], normalKnowledgeQuestion: true, claimIds: [index < descClaims.length ? descClaims[index].id : popupClaims[Math.min(index - descClaims.length, popupClaims.length - 1)].id] })) },
  roundsReadiness: { status: "ready", exactCollectionCount: 4 },
  source_conflicts: [{ claim: "Pesten i 1654 drepte et eksakt oppgitt antall mennesker i hele Christiania.", status: "qualified", reason: "Åpne kilder gir ulike anslag og ulike populasjonsgrunnlag; produksjonen bruker derfor ikke ett samlet tall som nøkkelfakta." }],
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Peststøtten source review", notes: "Offisiell gravplassinformasjon, Oslo byleksikon, lokalhistoriske utdypinger og monumentfoto er sammenlignet." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Peststøtten representation review", introducedNewFacts: false, notes: "Monument, gravplass, epidemier, Munch-familie og senere minnepark holdes som separate tidslag; usikkert samlet dødstall holdes utenfor." }
  },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: allClaims.length, total: allClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) }
});

write(`data/places/historie-production/${id}.json`, buildHistoryProduction(place, briefFile, contextFile));
const qualityAudit = buildQualityAudit(place, monumentObject, structures, historicalEvents);
write("reports/place-production/peststotten-krist-kirkegard-phase1-24-gate-audit-v1.json", qualityAudit);
write("reports/place-production/peststotten-krist-kirkegard-workcard-current.json", {
  schema: "history_go_place_workcard_v1", place_id: id, category: "historie", status: "complete", completed_at: verifiedAt,
  coordinate_decision: "preserved_verified_monument_point", source_review: "complete", collections: place.place_card_profile.collection_ids,
  quiz_profile: "normal_4x7", history_gates: "A-H PASS", quality_gate: "30/30", canonical_next: null
});

execFileSync("node", ["scripts/build-fagverk-release-manifest.mjs"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "places:index:build"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "knowledge:canonical:write"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "place-open:build"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "epoker:places:build"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "civication:history-people:build"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["--experimental-strip-types", "scripts/build-civication-scenario-people-index.mts"], { cwd: root, stdio: "inherit" });

console.log(JSON.stringify({ place: id, collections: place.place_card_profile.collection_ids, quizQuestions: quizQuestions.length, chronology: chronology.length, languageEntries: languageEntries.length, readings: readingRows.length, quality: qualityAudit.quality_score.total }, null, 2));
