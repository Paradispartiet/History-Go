#!/usr/bin/env node
import fs from "node:fs";

const quizPath = "data/quiz/by/vinderen_sets.json";
const briefPath = "data/quiz/production_briefs/by/vinderen.json";
const contextPath = "data/quiz/production_context/by/vinderen.json";
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const write = (p, v) => fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`);

const quiz = read(quizPath);
const brief = read(briefPath);
const phases = ["opening", "middle", "middle", "bridge", "final"];
const emneAliases = new Map([
  ["em_by_institusjoner_kulturformidling", "em_by_infrastruktur_mobilitet"],
  ["em_by_landemerker_utsyn_orientering", "em_by_infrastruktur_mobilitet"]
]);

for (const claim of brief.claims) {
  claim.emne_id = emneAliases.get(claim.emne_id) || claim.emne_id;
}
const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));

for (const [setIndex, set] of quiz.sets.entries()) {
  set.phase = phases[setIndex];
  for (const question of set.questions) {
    question.emne_id = emneAliases.get(question.emne_id) || question.emne_id;
    const claim = claims.get(question.claim_id);
    if (!claim) throw new Error(`Missing claim for ${question.id}: ${question.claim_id}`);
    question.claim_basis = claim.statement;
    question.source = [...claim.source_ids];
    question.question_layer = phases[setIndex];
  }
}

const finalSet = quiz.sets.at(-1);
if (!finalSet || finalSet.questions.length !== 7) throw new Error("Vinderen final set must contain 7 questions");
const theoryQuestion = finalSet.questions[0];
theoryQuestion.topic_hook_id = "urb_bil_vs_menneske";
theoryQuestion.thinker_id = "jan_gehl";
theoryQuestion.work = "Life Between Buildings";
theoryQuestion.theory_ref = {
  topic_hook_id: "urb_bil_vs_menneske",
  thinker_id: "jan_gehl",
  work: "Life Between Buildings",
  why_it_helps: "Gehls menneskeskala kobler Vinderens baneforbindelse til hvordan mobilitet, kryssing og opphold faktisk organiseres rundt stasjonen."
};
const theoryClaim = claims.get(theoryQuestion.claim_id);
theoryClaim.topic_hook_id = theoryQuestion.topic_hook_id;
theoryClaim.thinker_id = theoryQuestion.thinker_id;
theoryClaim.work = theoryQuestion.work;

const methodQuestion = finalSet.questions[1];
methodQuestion.method_id = "met_gaanalyse";
const methodClaim = claims.get(methodQuestion.claim_id);
methodClaim.method_id = methodQuestion.method_id;

quiz.sources = Object.fromEntries(Object.entries(brief.sources).map(([id, source]) => [id, source.url]));
const selected = brief.selected_curriculum;
quiz.production_context = {
  manifest_category: "by",
  profile: "rich_5x7",
  standard_version: "3.4",
  source_brief: briefPath,
  context_artifact: contextPath,
  resolved_files: {
    pensum: "data/fag/by/pensum_by.json",
    emner: "data/fag/by/emner_by.json",
    fagkart: "data/fag/by/fagkart_by.json",
    methods: "data/fag/by/methods_by.json",
    supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json",
    quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
    quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
  },
  required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
  pensum_module_ids: [...selected.module_ids],
  emne_ids: [...selected.emne_ids],
  topic_hook_ids: [...selected.topic_hook_ids],
  method_ids: [...selected.method_ids],
  thinker_ids: [...selected.thinker_ids],
  works: [...selected.works],
  source_review_status: brief.status,
  existing_quiz_audit: brief.existing_quiz_audit,
  profile_decision: brief.profile_decision,
  held_back_candidates: brief.held_back_candidates,
  normal_opening_questions: 21,
  theory_start_phase: "final",
  method_start_phase: "final"
};

write(briefPath, brief);
write(quizPath, quiz);
console.log(`Normalized Vinderen quiz production contract: ${quiz.sets.length} sets / ${quiz.sets.flatMap(s => s.questions).length} questions.`);
