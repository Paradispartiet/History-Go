#!/usr/bin/env node
import process from "node:process";
import {
  MANIFEST_PATH,
  asArray,
  collectQuestions,
  curriculumIndexes,
  hasText,
  hookThinker,
  isCli,
  loadProductionInputs,
  loadProductionTarget,
  readJson
} from "./quiz-production-lib.mjs";

const BLOCKED_SURFACES = [
  /\bhvilken teoretiker passer best\b/iu,
  /\bhvilken teori beskriver\b.{0,40}\bbest\b/iu,
  /\bhvordan kan\b.{0,55}\bleses som\b/iu,
  /\bhvorfor passer\b.{0,55}\b(?:emnet|temaet)\b/iu,
  /\b(?:fagplan|fagkart|mapping|topic hook|quizgenerator)\b/iu
];

function addFailure(failures, file, question, reason, details = {}) {
  failures.push({
    file,
    questionId: question?.id || question?.quiz_id || null,
    reason,
    ...details
  });
}

function isTheoryQuestion(question) {
  return Boolean(question.topic_hook_id || question.thinker_id || question.theory_ref || question.work);
}

export async function auditQuizTheoryBinding({ root = process.cwd() } = {}) {
  const manifest = await readJson(root, MANIFEST_PATH);
  const failures = [];
  const checked = [];

  for (const [categoryId, entry] of Object.entries(manifest)) {
    if (!entry?.quizProduction) continue;
    const loaded = await loadProductionInputs({ root, categoryId });
    const indexes = curriculumIndexes(loaded.records);

    for (const targetId of Object.keys(entry.quizProduction.targets || {})) {
      const targetProduction = await loadProductionTarget({ root, loaded, targetId });
      const quizPath = targetProduction.paths.quiz_file;
      const quiz = await readJson(root, quizPath);
      const sourceIds = new Set(Object.keys(quiz.sources || {}));
      const questions = collectQuestions(quiz);
      let theoryQuestions = 0;
      let methodQuestions = 0;

      for (const question of questions) {
        if (BLOCKED_SURFACES.some((pattern) => pattern.test(question.question))) {
          addFailure(failures, quizPath, question, "forbudt teori- eller læreplansoverflate");
        }

        if (question.method_id) {
          methodQuestions += 1;
          if (!indexes.methodById.has(question.method_id)) {
            addFailure(failures, quizPath, question, "ukjent method_id", { methodId: question.method_id });
          }
          if (!hasText(question.claim_basis)) addFailure(failures, quizPath, question, "metodespørsmål mangler claim_basis");
          if (!asArray(question.source).length) addFailure(failures, quizPath, question, "metodespørsmål mangler kilde eller observasjon");
          if (!asArray(question.guidance_basis).length) addFailure(failures, quizPath, question, "metodespørsmål mangler guidance_basis");
        }

        if (!isTheoryQuestion(question)) continue;
        theoryQuestions += 1;

        for (const requiredField of ["claim_basis", "emne_id", "topic_hook_id", "theory_ref"]) {
          if (!question[requiredField] || (typeof question[requiredField] === "string" && !hasText(question[requiredField]))) {
            addFailure(failures, quizPath, question, `teorispørsmål mangler ${requiredField}`);
          }
        }
        if (!asArray(question.source).length) addFailure(failures, quizPath, question, "teorispørsmål mangler kilde");
        if (!question.thinker_id && !question.work) {
          addFailure(failures, quizPath, question, "teorispørsmål mangler teoretiker eller verk");
        }
        if (!indexes.emneById.has(question.emne_id)) {
          addFailure(failures, quizPath, question, "teorispørsmål har ukjent emne_id", { emneId: question.emne_id });
        }

        const { hook, thinker } = hookThinker(indexes, question.topic_hook_id, question.thinker_id);
        if (!hook) {
          addFailure(failures, quizPath, question, "ukjent topic_hook_id", { hookId: question.topic_hook_id });
        } else if (!asArray(hook.emne_ids).includes(question.emne_id)) {
          addFailure(failures, quizPath, question, "hook er ikke bundet til spørsmålets emne", {
            hookId: question.topic_hook_id,
            emneId: question.emne_id
          });
        }
        if (question.thinker_id && !thinker) {
          addFailure(failures, quizPath, question, "teoretiker finnes ikke i valgt hook", {
            hookId: question.topic_hook_id,
            thinkerId: question.thinker_id
          });
        }
        if (question.work && (!thinker || !asArray(thinker.works).includes(question.work))) {
          addFailure(failures, quizPath, question, "verk finnes ikke hos valgt teoretiker", {
            thinkerId: question.thinker_id,
            work: question.work
          });
        }
        if (question.theory_ref?.topic_hook_id !== question.topic_hook_id) {
          addFailure(failures, quizPath, question, "theory_ref peker til feil hook");
        }
        if (!hasText(question.theory_ref?.why_it_helps)) {
          addFailure(failures, quizPath, question, "theory_ref mangler why_it_helps");
        }
        for (const sourceId of asArray(question.source)) {
          if (!sourceIds.has(sourceId)) {
            addFailure(failures, quizPath, question, "ukjent kilde-ID", { sourceId });
          }
        }
      }

      checked.push({
        file: quizPath,
        questions: questions.length,
        theoryQuestions,
        methodQuestions
      });
      if (!theoryQuestions) addFailure(failures, quizPath, null, "quizpakken mangler teoribundne spørsmål");
      if (!methodQuestions) addFailure(failures, quizPath, null, "quizpakken mangler eksplisitt metode");
    }
  }

  return {
    status: failures.length ? "failed" : "passed",
    quizFilesChecked: checked.length,
    checked,
    failures
  };
}

async function main() {
  const report = await auditQuizTheoryBinding();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === "passed" ? 0 : 1;
}

if (isCli(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
