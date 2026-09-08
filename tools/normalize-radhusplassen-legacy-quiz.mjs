#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const quizFile = path.join(root, "data/quiz/by/radhusplassen_sets.json");
const reportFile = path.join(root, "reports/place-production/radhusplassen-legacy-quiz-reconciliation.json");
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const quiz = read(quizFile);
if (!Array.isArray(quiz.sets)) throw new Error("Rådhusplassen quiz mangler sets-array");
if (quiz.sets.some(set => !Array.isArray(set.questions) || set.questions.length !== 7)) {
  throw new Error("Rådhusplassen legacy quiz har et sett som ikke inneholder nøyaktig 7 spørsmål");
}

const originalIds = quiz.sets.map(set => set.set_id);
const originalQuestions = quiz.sets.flatMap(set => set.questions);

if (quiz.sets.length === 5) {
  write(reportFile, {
    schema: "history_go_legacy_quiz_reconciliation_v1",
    target_id: "radhusplassen",
    status: "already_5x7",
    active_set_ids: originalIds,
    active_question_count: originalQuestions.length,
    retired_set: null,
    rationale: "Quizbanken er allerede 5×7. Ingen spørsmål er fjernet av normalisatoren."
  });
  console.log("Rådhusplassen quiz er allerede 5×7; ingen legacy-reduksjon nødvendig.");
  process.exit(0);
}

if (quiz.sets.length !== 6) {
  throw new Error(`Forventet legacy 6×7 eller canonical 5×7, fikk ${quiz.sets.length} sett`);
}

const expectedIds = Array.from({ length: 6 }, (_, index) => `by_radhusplassen_set_${index + 1}`);
if (!expectedIds.every((id, index) => quiz.sets[index]?.set_id === id)) {
  throw new Error(`Uventet legacy set-rekkefølge: ${originalIds.join(", ")}`);
}

const retired = structuredClone(quiz.sets[3]);
const retained = [quiz.sets[0], quiz.sets[1], quiz.sets[2], quiz.sets[4], quiz.sets[5]].map(set => structuredClone(set));
retained.forEach((set, index) => {
  set.set_id = `by_radhusplassen_set_${index + 1}`;
  set.order = index + 1;
  set.level = index + 1;
});
quiz.sets = retained;
write(quizFile, quiz);

write(reportFile, {
  schema: "history_go_legacy_quiz_reconciliation_v1",
  target_id: "radhusplassen",
  status: "normalized_6x7_to_5x7",
  original_set_count: 6,
  original_question_count: 42,
  canonical_set_count: 5,
  canonical_question_count: 35,
  retained_legacy_sets: [
    { legacy_set_id: "by_radhusplassen_set_1", canonical_set_id: "by_radhusplassen_set_1", role: "fact_opening" },
    { legacy_set_id: "by_radhusplassen_set_2", canonical_set_id: "by_radhusplassen_set_2", role: "fact_opening" },
    { legacy_set_id: "by_radhusplassen_set_3", canonical_set_id: "by_radhusplassen_set_3", role: "fact_middle" },
    { legacy_set_id: "by_radhusplassen_set_5", canonical_set_id: "by_radhusplassen_set_4", role: "context_bridge" },
    { legacy_set_id: "by_radhusplassen_set_6", canonical_set_id: "by_radhusplassen_set_5", role: "concept_final" }
  ],
  retired_set: {
    legacy_set_id: retired.set_id,
    reason: "Legacy-banken hadde fire rene faktasett (28 fakta), mens canonical rich 5×7 krever 21 fact + 7 context + 7 concept. Set 4 er derfor den ekstra faktablokken; høyereordens set 5 og begrepsset 6 beholdes og flyttes fram.",
    question_count: retired.questions.length,
    questions: retired.questions.map(question => ({
      id: question.id,
      quiz_id: question.quiz_id,
      question: question.question,
      answer: question.answer,
      knowledge: question.knowledge,
      source: question.source
    }))
  },
  invariant: "Ingen spørsmål er syntetisert av normalisatoren; 35 eksisterende legacy-spørsmål beholdes, og de sju utgående faktaspørsmålene er eksplisitt auditert i denne rapporten."
});

console.log("Rådhusplassen legacy quiz normalisert deterministisk fra 6×7 til 5×7; gammel set 4 er auditert som retired fact extension.");
