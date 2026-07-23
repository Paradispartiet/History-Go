#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";

const quizPath = "data/quiz/naeringsliv/telegrafbygningen_sets_merged.json";
const contextPath = "data/quiz/production_context/naeringsliv/telegrafbygningen.json";
const categoryId = "naeringsliv";
const targetId = "telegrafbygningen";

const quiz = JSON.parse(await readFile(quizPath, "utf8"));
const context = await buildQuizProductionContext({ categoryId, targetId });
const questions = quiz.sets.flatMap((set) => set.questions || []);
const methods = new Map([
  [15, "met_naering_verdiskapingsanalyse"],
  [22, "met_naering_omstillingsanalyse"],
  [28, "met_naering_forbruker_og_atferdsanalyse"],
  [32, "met_naering_infrastrukturanalyse"],
  [33, "met_naering_omstillingsanalyse"],
  [34, "met_naering_verdiskapingsanalyse"],
  [35, "met_naering_verdiskapingsanalyse"]
]);
const guidanceBasis = [
  "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json",
  "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json"
];

quiz.production_context.profile = context.profile;
quiz.production_context.resolved_files = Object.fromEntries(
  Object.entries(context.resolved_files).map(([key, value]) => [key, value.path])
);
quiz.production_context.required_inputs_loaded = context.required_inputs_loaded;
quiz.production_context.pensum_module_ids = context.selected_curriculum.module_ids;
quiz.production_context.emne_ids = context.selected_curriculum.emne_ids;
quiz.production_context.topic_hook_ids = context.selected_curriculum.topic_hook_ids;
quiz.production_context.method_ids = context.selected_curriculum.method_ids;
quiz.production_context.thinker_ids = context.selected_curriculum.thinker_ids;
quiz.production_context.works = context.selected_curriculum.works;
quiz.production_context.source_review_status = context.source_review_status;
quiz.production_context.theory_start_phase = "final";
delete quiz.production_context.method_start_phase;

for (const question of questions) {
  const number = Number(question.id.split("_").at(-1));
  for (const key of [
    "method_id",
    "guidance_basis",
    "topic_hook_id",
    "thinker_id",
    "thinker_name",
    "work",
    "theory_ref",
    "theory_focus"
  ]) delete question[key];

  if (methods.has(number)) {
    question.method_id = methods.get(number);
    question.guidance_basis = guidanceBasis;
  }
}

const q32 = questions.find((question) => question.id === "telegrafbygningen_quiz_32");
q32.question = "Hva viser det at sentraler, administrasjon og mange arbeidsplasser ble samlet i ett kvartal?";
q32.options = [
  "At virksomheten ble spredt mellom små private verksteder",
  "At kommunikasjonstjenestene ble samlet og rasjonalisert i ett stort anlegg",
  "At bygningen bare fungerte som et ordinært varelager"
];
q32.answer = q32.options[1];
q32.answerIndex = 1;
q32.knowledge = "Samlingen av sentraler, administrasjon og mange arbeidsplasser i ett kvartal viser en storstilt rasjonalisering og organisering av kommunikasjonstjenestene.";
q32.claim_basis = q32.knowledge;
q32.emne_id = "em_naering_arbeid_verdiskaping";
q32.topic_hook_id = "arbeid_som_verdiskaping";
q32.thinker_id = "max_weber";
q32.thinker_name = "Max Weber";
q32.theory_focus = "rasjonalisering og organisering";
q32.theory_ref = {
  topic_hook_id: "arbeid_som_verdiskaping",
  why_it_helps: "Webers perspektiv på rasjonalisering gjør det mulig å forstå hvorfor tekniske systemer, administrasjon og arbeidskraft ble samlet og organisert i ett stort anlegg."
};

await writeFile(quizPath, `${JSON.stringify(quiz, null, 2)}\n`, "utf8");
await writeFile(contextPath, `${JSON.stringify(context, null, 2)}\n`, "utf8");
console.log(`Oppdaterte ${quizPath} og ${contextPath}`);
