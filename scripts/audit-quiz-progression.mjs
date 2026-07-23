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

const NORMAL_OPENING_POLICY_PATH = "data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json";

const OPENING_SURFACE_RULES = [
  ["emne_prompt", /\b(?:passer|relevant)\b.{0,45}\b(?:emnet|temaet|fagfeltet)\b/iu],
  ["place_as_example", /\bhva gjør\b.{0,50}\b(?:til et eksempel på|relevant for)\b|\bkva gjer\b.{0,50}\b(?:til eit døme på|relevant for)\b/iu],
  ["reading_language", /\b(?:faglig lesning|fagleg lesing|leses som|lesast som|tolkes som|tolkast som)\b/iu],
  ["most_precise", /\b(?:mest presise|mest presist|mest treffende|mest treffande)\b/iu],
  ["concept_pick", /\b(?:hvilket|kva) begrep\b.{0,45}\b(?:passer|beskriver|forklarer|høver|skildrar|forklarar)\b/iu],
  ["theory_pick", /\b(?:hvilken|kva) (?:teori|teoretiker|teoretikar|metode|hook)\b/iu],
  ["curriculum_language", /\b(?:fagplan|fagkart|topic hook|emnekart|mapping|generator)\b/iu],
  ["institutional_reading", /\b(?:lese|lesa|lesast)\b.{0,35}\bsom (?:institusjon|byrom|møtested|møtestad|symbol)\b/iu],
  ["player_instruction", /\b(?:hva|kva) bør (?:spilleren|spelaren|du)\b|\b(?:hva|kva) skal (?:spilleren|spelaren|du) (?:se|sjå) etter\b/iu],
  ["question_about_question", /\b(?:hvilket|hvilke|kva|kva for eit) spørsmål\b/iu],
  ["quiz_about_quiz", /\b(?:god|beste|sterk)\b.{0,35}\bquiz\b|\bquiz\b.{0,45}\b(?:trene|trenar|lære|lærer|teste|testar)\b/iu],
  ["history_go_question", /\b(?:history go|history-go)\b.{0,25}\bspørsmål\b|\bspørsmål\b.{0,25}\b(?:history go|history-go)\b/iu],
  ["more_than_place", /\bhva gjør\b.{0,55}\bmer enn\b|\bkva gjer\b.{0,55}\bmeir enn\b/iu]
];

function addFailure(failures, file, reason, details = {}) {
  failures.push({ file, reason, ...details });
}

function isTheoryBound(question) {
  return Boolean(question.topic_hook_id || question.thinker_id || question.theory_ref);
}

function normalizedQuestionType(question) {
  return String(question?.question_type ?? "").trim().toLowerCase();
}

function normalOpeningProblems(question, openingPolicy) {
  const opening = openingPolicy.opening_block || {};
  const problems = [];

  for (const field of asArray(opening.forbidden_binding_fields)) {
    if (question?.[field]) problems.push(`forbidden_binding:${field}`);
  }

  const questionType = normalizedQuestionType(question);
  if (!questionType) {
    problems.push("missing_question_type");
  } else if (asArray(opening.forbidden_question_types).includes(questionType)) {
    problems.push(`forbidden_question_type:${questionType}`);
  } else {
    const allowedTypes = asArray(opening.allowed_question_types);
    if (allowedTypes.length && !allowedTypes.includes(questionType)) {
      problems.push(`question_type_not_allowed_in_opening:${questionType}`);
    }
  }

  const enabledSurfaceRules = new Set(asArray(opening.forbidden_surface_rule_ids));
  for (const [ruleId, regex] of OPENING_SURFACE_RULES) {
    if (enabledSurfaceRules.has(ruleId) && regex.test(String(question?.question ?? ""))) {
      problems.push(`forbidden_surface:${ruleId}`);
    }
  }

  return problems;
}

function auditNormalOpening({ quizPath, targetId, sets, openingPolicy, failures }) {
  const grandfathered = openingPolicy.grandfathered_targets?.[targetId] || null;
  if (grandfathered) {
    return {
      status: "grandfathered",
      reason: grandfathered.reason || null,
      temporary: grandfathered.temporary === true
    };
  }

  const requiredSets = Number(openingPolicy.opening_block?.sets || 2);
  const questionsPerSet = Number(openingPolicy.opening_block?.questions_per_set || 7);
  const requiredTotal = Number(openingPolicy.opening_block?.total_questions || requiredSets * questionsPerSet);
  const openingSets = sets.slice(0, requiredSets);

  if (sets.length < requiredSets) {
    addFailure(failures, quizPath, "quizen mangler to normale åpningssett", {
      targetId,
      expectedSets: requiredSets,
      actualSets: sets.length
    });
    return { status: "failed", checkedQuestions: 0 };
  }

  let checkedQuestions = 0;
  for (const [setIndex, set] of openingSets.entries()) {
    const questions = asArray(set.questions);
    if (questions.length !== questionsPerSet) {
      addFailure(failures, quizPath, "åpningssett har ikke sju spørsmål", {
        targetId,
        setId: set.set_id,
        order: setIndex + 1,
        expected: questionsPerSet,
        actual: questions.length
      });
    }

    for (const question of questions) {
      checkedQuestions += 1;
      const problems = normalOpeningProblems(question, openingPolicy);
      if (problems.length) {
        addFailure(failures, quizPath, "første 2×7 er ikke normale quizspørsmål", {
          targetId,
          setId: set.set_id,
          questionId: question.quiz_id || question.id || null,
          question: question.question,
          problems
        });
      }
    }
  }

  if (checkedQuestions !== requiredTotal) {
    addFailure(failures, quizPath, "åpningsblokken inneholder ikke fjorten spørsmål", {
      targetId,
      expected: requiredTotal,
      actual: checkedQuestions
    });
  }

  return {
    status: "checked",
    checkedSets: openingSets.length,
    checkedQuestions
  };
}

export async function auditQuizProgression({ root = process.cwd() } = {}) {
  const manifest = await readJson(root, MANIFEST_PATH);
  const openingPolicy = await readJson(root, NORMAL_OPENING_POLICY_PATH);
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
      const normalOpening = auditNormalOpening({
        quizPath,
        targetId,
        sets,
        openingPolicy,
        failures
      });
      checked.push({
        file: quizPath,
        profile: context.profile,
        balance,
        normalOpening
      });

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
    openingPolicy: NORMAL_OPENING_POLICY_PATH,
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
