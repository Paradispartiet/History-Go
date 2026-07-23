#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";

const briefPath = "data/quiz/production_briefs/naeringsliv/telegrafbygningen.json";
const quizPath = "data/quiz/naeringsliv/telegrafbygningen_sets_merged.json";
const contextPath = "data/quiz/production_context/naeringsliv/telegrafbygningen.json";
const invalidMethod = "met_naering_omstillingsanalyse";
const validMethod = "met_naering_arbeidslivsanalyse";

const brief = JSON.parse(await readFile(briefPath, "utf8"));
brief.selected_curriculum.method_ids = [...new Set(
  brief.selected_curriculum.method_ids.map((id) => id === invalidMethod ? validMethod : id)
)];
for (const claim of brief.claims) {
  if (claim.method_id === invalidMethod) claim.method_id = validMethod;
}
await writeFile(briefPath, `${JSON.stringify(brief, null, 2)}\n`, "utf8");

const context = await buildQuizProductionContext({
  categoryId: "naeringsliv",
  targetId: "telegrafbygningen"
});

const quiz = JSON.parse(await readFile(quizPath, "utf8"));
const questions = quiz.sets.flatMap((set) => set.questions || []);
for (const question of questions) {
  if (question.method_id === invalidMethod) question.method_id = validMethod;
}

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

await writeFile(quizPath, `${JSON.stringify(quiz, null, 2)}\n`, "utf8");
await writeFile(contextPath, `${JSON.stringify(context, null, 2)}\n`, "utf8");
console.log(`Erstattet ${invalidMethod} med ${validMethod} og regenererte konteksten.`);
