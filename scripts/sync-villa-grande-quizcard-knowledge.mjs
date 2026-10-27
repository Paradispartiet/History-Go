#!/usr/bin/env node
// Copy the canonical Knowledge links from reviewed fullquiz questions to QuizCard.
import fs from "node:fs";
const quizPath = "data/quiz/historie/villa_grande_sets.json";
const cardPath = "data/quizcards/historie/villa_grande_quizcard_v1.json";
const quiz = JSON.parse(fs.readFileSync(quizPath, "utf8"));
const card = JSON.parse(fs.readFileSync(cardPath, "utf8"));
const byId = new Map(quiz.sets.flatMap(set => set.questions).map(q => [q.id, q]));
const questions = card.cards.flatMap(entry => entry.questions);
if (quiz.sets.length !== 3 || quiz.sets.some(set => set.questions.length !== 7)) {
  throw new Error("Villa Grande requires three sets of seven questions.");
}
if (questions.length !== 10) throw new Error("Villa Grande requires ten QuizCard questions.");
for (const q of questions) {
  const source = byId.get(q.sourceQuestionId);
  if (!source?.primary_knowledge_unit_id || !source.knowledge_unit_ids?.length || source.knowledge_link_status !== "linked") {
    throw new Error("Unlinked source question: " + q.sourceQuestionId);
  }
  q.primary_knowledge_unit_id = source.primary_knowledge_unit_id;
  q.knowledge_unit_ids = [...source.knowledge_unit_ids];
  q.knowledge_link_status = "linked";
}
card.production_status = "knowledge_linked";
fs.writeFileSync(cardPath, JSON.stringify(card, null, 2) + "\n");
console.log("Villa Grande: 10/10 QuizCard questions have canonical Knowledge links.");
