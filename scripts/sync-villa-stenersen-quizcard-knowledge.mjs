#!/usr/bin/env node
import fs from "node:fs";
const fullPath = "data/quiz/historie/villa_stenersen_sets.json";
const cardPath = "data/quizcards/historie/villa_stenersen_quizcard_v1.json";
const full = JSON.parse(fs.readFileSync(fullPath, "utf8"));
const card = JSON.parse(fs.readFileSync(cardPath, "utf8"));
const byId = new Map(full.sets.flatMap(set => set.questions).map(question => [question.id, question]));
const questions = card.cards.flatMap(entry => entry.questions);
if (questions.length !== 10) throw new Error("Villa Stenersen requires ten QuizCard questions.");
for (const q of questions) {
  const source = byId.get(q.sourceQuestionId);
  if (!source?.primary_knowledge_unit_id || !source.knowledge_unit_ids?.length || source.knowledge_link_status !== "linked") {
    throw new Error("Unlinked source question: " + q.sourceQuestionId);
  }
  q.primary_knowledge_unit_id = source.primary_knowledge_unit_id;
  q.knowledge_unit_ids = [...source.knowledge_unit_ids];
  q.knowledge_link_status = source.knowledge_link_status;
}
fs.writeFileSync(cardPath, JSON.stringify(card, null, 2) + "\n");
console.log("Villa Stenersen QuizCard: 10/10 canonical Knowledge links synchronized.");
