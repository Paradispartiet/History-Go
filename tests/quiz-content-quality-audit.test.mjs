import assert from "node:assert/strict";
import { copyFile, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { auditQuizContent } from "../scripts/audit-quiz-content-quality.mjs";

async function withTempRoot(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "hg-quiz-audit-"));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function withFixture(questions, run) {
  await withTempRoot(async (root) => {
    const quizDir = path.join(root, "by");
    await mkdir(quizDir, { recursive: true });
    await writeFile(path.join(quizDir, "fixture_sets.json"), JSON.stringify({ sets: [{ questions }] }), "utf8");
    await run(root);
  });
}

async function withRepoQuizFiles(relativePaths, run) {
  await withTempRoot(async (root) => {
    for (const relativePath of relativePaths) {
      const destination = path.join(root, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.resolve(relativePath), destination);
    }
    await run(root);
  });
}

function question(id, text, questionType = "fact", options = ["Riktig", "Feil A", "Feil B"]) {
  return {
    id,
    targetId: "fixture_place",
    question: text,
    options,
    answer: options[0],
    answerIndex: 0,
    question_type: questionType
  };
}

test("flags emne-first wording and a quiz outside the canonical balance", async () => {
  const questions = [
    ...Array.from({ length: 4 }, (_, index) => question(`f${index}`, `Hvilket år skjedde hendelse ${index}?`)),
    question("c1", "Hvorfor ble bygningen reist?", "analysis"),
    question("c2", "Hva førte til at stedet ble endret?", "analysis"),
    question("t1", "Hvorfor passer stedet til emnet offentlige rom?", "analysis"),
    question("t2", "Hva er den mest presise faglige lesningen av stedet?", "analysis"),
    question("t3", "Hvilket begrep beskriver best stedet?", "concept"),
    question("t4", "Hva betyr sosial infrastruktur i denne konkrete situasjonen?", "concept")
  ];

  await withFixture(questions, async (rootDir) => {
    const report = await auditQuizContent({ rootDir });
    assert.equal(report.summary.questionsScanned, 10);
    assert.equal(report.summary.templateViolations, 3);
    assert.equal(report.balanceViolations.length, 1);
    assert.ok(report.balanceViolations[0].violations.some((value) => value.startsWith("fact_ratio_below_50_percent")));
    assert.ok(report.balanceViolations[0].violations.some((value) => value.startsWith("theory_ratio_above_25_percent")));
  });
});

test("accepts a 60/20/20 content mix", async () => {
  const questions = [
    ...Array.from({ length: 6 }, (_, index) => question(`f${index}`, `Hvem var knyttet til hendelse ${index}?`)),
    question("c1", "Hvorfor ble bygningen reist?", "analysis"),
    question("c2", "Hva førte til at funksjonen ble endret?", "analysis"),
    question("t1", "Hva betyr sosial infrastruktur i denne sammenhengen?", "concept"),
    question("t2", "Hva betyr lav terskel for brukerne her?", "concept")
  ];

  await withFixture(questions, async (rootDir) => {
    const report = await auditQuizContent({ rootDir });
    assert.equal(report.balanceViolations.length, 0);
    assert.equal(report.summary.templateViolations, 0);
    assert.equal(report.groups[0].ratios.fact, 0.6);
    assert.equal(report.groups[0].ratios.context, 0.2);
    assert.equal(report.groups[0].ratios.theory, 0.2);
  });
});

test("flags a correct answer that is much longer than the distractors", async () => {
  await withFixture([
    question(
      "length",
      "Hva skjedde?",
      "fact",
      ["Dette er en svært lang formulering som avslører det riktige svaret alene", "Nei", "Aldri"]
    )
  ], async (rootDir) => {
    const report = await auditQuizContent({ rootDir });
    assert.equal(report.summary.optionLengthSignals, 1);
  });
});

test("keeps repaired Deichman and Ullevaal quizzes within the canonical balance", async () => {
  await withRepoQuizFiles([
    "data/quiz/by/deichman_bjorvika_sets.json",
    "data/quiz/sport/ullevaal_stadion_sets.json"
  ], async (rootDir) => {
    const report = await auditQuizContent({ rootDir });
    assert.equal(report.summary.questionsScanned, 47);
    assert.equal(report.summary.templateViolations, 0);
    assert.equal(report.summary.balanceViolations, 0);
    assert.equal(report.summary.repeatedOpenings, 0);
    assert.equal(report.summary.optionLengthSignals, 0);

    const byTarget = Object.fromEntries(report.groups.map((group) => [group.target, group.ratios]));
    assert.deepEqual(byTarget.deichman_bjorvika, { fact: 0.543, context: 0.257, theory: 0.2 });
    assert.deepEqual(byTarget.ullevaal_stadion, { fact: 0.583, context: 0.25, theory: 0.167 });
  });
});
