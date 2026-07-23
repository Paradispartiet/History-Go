#!/usr/bin/env node
import process from "node:process";
import {
  MANIFEST_PATH,
  asArray,
  collectQuestions,
  isCli,
  loadProductionInputs,
  loadProductionTarget,
  parseProfile,
  readJson,
  summarizeQuestionBalance
} from "./quiz-production-lib.mjs";

function addFailure(failures, file, reason, details = {}) {
  failures.push({ file, reason, ...details });
}

function isTheoryBound(question) {
  return Boolean(question.topic_hook_id || question.thinker_id || question.theory_ref);
}

export async function auditQuizProgression({ root = process.cwd() } = {}) {
  const manifest = await readJson(root, MANIFEST_PATH);
  const failures = [];
  const checked = [];

  for (const [categoryId, entry] of Object.entries(manifest)) {
    if (!entry?.quizProduction) continue;
    const loaded = await loadProductionInputs({ root, categoryId });
    const superset = loaded.records.supersetQuizMal.data;

    for (const targetId of Object.keys(entry.quizProduction.targets || {})) {
      const targetProduction = await loadProductionTarget({ root, loaded, targetId });
      const quizPath = targetProduction.paths.quiz_file;
      const quiz = await readJson(root, quizPath);
      const context = quiz.production_context || {};
      const profile = parseProfile(context.profile);
      const sets = asArray(quiz.sets);
      const questions = collectQuestions(quiz);
      const balance = summarizeQuestionBalance(questions);
      checked.push({ file: quizPath, profile: context.profile, balance });

      if (!profile) {
        addFailure(failures, quizPath, "ugyldig profilformat", { profile: context.profile });
        continue;
      }
      if (profile.setCount !== sets.length) {
        addFailure(failures, quizPath, "profilens settantall stemmer ikke", {
          expected: profile.setCount,
          actual: sets.length
        });
      }

      const configuredProfile = superset.adaptive_profiles?.[profile.id];
      if (!configuredProfile) {
        addFailure(failures, quizPath, "profil finnes ikke i kategoriens superset", { profileId: profile.id });
      } else {
        const minimum = configuredProfile.sets ?? configuredProfile.sets_min;
        const maximum = configuredProfile.sets ?? configuredProfile.sets_max;
        if (profile.setCount < minimum || profile.setCount > maximum) {
          addFailure(failures, quizPath, "settantallet ligger utenfor adaptiv profil", {
            profileId: profile.id,
            minimum,
            maximum,
            actual: profile.setCount
          });
        }
        if (profile.questionsPerSet !== configuredProfile.questions_per_set) {
          addFailure(failures, quizPath, "spørsmål per sett avviker fra superset", {
            expected: configuredProfile.questions_per_set,
            actual: profile.questionsPerSet
          });
        }
      }

      const phases = asArray(superset.relative_progression?.phase_sequences?.[String(sets.length)]);
      if (phases.length !== sets.length) {
        addFailure(failures, quizPath, "mangler relativ faseplan", { setCount: sets.length });
      }

      for (const [index, set] of sets.entries()) {
        if (set.order !== index + 1) {
          addFailure(failures, quizPath, "settrekkefølgen er feil", { setId: set.set_id, order: set.order });
        }
        if (set.phase !== phases[index]) {
          addFailure(failures, quizPath, "sett har feil relativ fase", {
            setId: set.set_id,
            expected: phases[index],
            actual: set.phase
          });
        }
        if (asArray(set.questions).length !== profile.questionsPerSet) {
          addFailure(failures, quizPath, "sett har feil antall spørsmål", {
            setId: set.set_id,
            expected: profile.questionsPerSet,
            actual: asArray(set.questions).length
          });
        }
      }

      const finalSet = sets.at(-1);
      if (!asArray(finalSet?.questions).some(isTheoryBound)) {
        addFailure(failures, quizPath, "sluttlaget mangler eksplisitt teoribinding");
      }
      if (!asArray(finalSet?.questions).some((question) => question.method_id)) {
        addFailure(failures, quizPath, "sluttlaget mangler eksplisitt metode");
      }

      if (context.theory_start_phase) {
        for (const set of sets) {
          if (set.phase !== context.theory_start_phase && asArray(set.questions).some(isTheoryBound)) {
            addFailure(failures, quizPath, "teori starter før oppgitt fase", {
              setId: set.set_id,
              expectedStartPhase: context.theory_start_phase
            });
          }
        }
      }
      if (context.method_start_phase) {
        for (const set of sets) {
          if (set.phase !== context.method_start_phase && asArray(set.questions).some((question) => question.method_id)) {
            addFailure(failures, quizPath, "metode starter før oppgitt fase", {
              setId: set.set_id,
              expectedStartPhase: context.method_start_phase
            });
          }
        }
      }

      const families = superset.question_families || {};
      const ratioChecks = [
        ["fact", balance.ratios.fact],
        ["context", balance.ratios.context],
        ["concept_theory", balance.ratios.concept_theory]
      ];
      for (const [family, ratio] of ratioChecks) {
        const policyKey = family === "concept_theory" ? "concept_theory" : family;
        const policy = families[policyKey];
        if (!policy) continue;
        if (ratio < policy.normal_share_min || ratio > policy.normal_share_max) {
          addFailure(failures, quizPath, "innholdsbalanse utenfor superset", {
            family,
            ratio,
            minimum: policy.normal_share_min,
            maximum: policy.normal_share_max
          });
        }
      }
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
  const report = await auditQuizProgression();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === "passed" ? 0 : 1;
}

if (isCli(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
