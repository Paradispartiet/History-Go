#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const BASE = "abd2875a4263af8353f2eeb5a26f39678c4aacde";
const ORIGINAL_HEAD = "f6a8426eba3a6521616e7cc4d2199577d785b519";
const report = [];

function note(text) {
  report.push(String(text));
  process.stdout.write(`${text}\n`);
}

function run(label, command, args, extra = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env: { ...process.env, ...(extra.env || {}) },
    maxBuffer: 32 * 1024 * 1024
  });
  note(`\n===== ${label} =====`);
  note(`$ ${command} ${args.join(" ")}`);
  note(`exit=${result.status ?? "null"}`);
  if (result.stdout) note(result.stdout);
  if (result.stderr) note(result.stderr);
  return result.status ?? 1;
}

function replaceExact(path, before, after) {
  const source = fs.readFileSync(path, "utf8");
  if (!source.includes(before)) throw new Error(`Expected block not found in ${path}`);
  fs.writeFileSync(path, source.replace(before, after));
}

const auditPath = "scripts/audit-quiz-progression.mjs";
replaceExact(
  auditPath,
  `function isTheoryBound(question) {\n  return Boolean(question.topic_hook_id || question.thinker_id || question.theory_ref);\n}\n`,
  `function isTheoryBound(question) {\n  return Boolean(question.topic_hook_id || question.thinker_id || question.theory_ref);\n}\n\nexport function phaseAllowsBinding(phases, setIndex, startPhase) {\n  const startIndex = phases.indexOf(startPhase);\n  return startIndex >= 0 && setIndex >= startIndex;\n}\n`
);

replaceExact(
  auditPath,
  `      if (context.theory_start_phase) {\n        for (const set of sets) {\n          if (set.phase !== context.theory_start_phase && asArray(set.questions).some(isTheoryBound)) {\n            addFailure(failures, quizPath, "teori starter før oppgitt fase", {\n              setId: set.set_id,\n              expectedStartPhase: context.theory_start_phase\n            });\n          }\n        }\n      }\n      if (context.method_start_phase) {\n        for (const set of sets) {\n          if (set.phase !== context.method_start_phase && asArray(set.questions).some((question) => question.method_id)) {\n            addFailure(failures, quizPath, "metode starter før oppgitt fase", {\n              setId: set.set_id,\n              expectedStartPhase: context.method_start_phase\n            });\n          }\n        }\n      }\n`,
  `      if (context.theory_start_phase) {\n        for (const [index, set] of sets.entries()) {\n          if (!phaseAllowsBinding(phases, index, context.theory_start_phase) && asArray(set.questions).some(isTheoryBound)) {\n            addFailure(failures, quizPath, "teori starter før oppgitt fase", {\n              setId: set.set_id,\n              expectedStartPhase: context.theory_start_phase\n            });\n          }\n        }\n      }\n      if (context.method_start_phase) {\n        for (const [index, set] of sets.entries()) {\n          if (!phaseAllowsBinding(phases, index, context.method_start_phase) && asArray(set.questions).some((question) => question.method_id)) {\n            addFailure(failures, quizPath, "metode starter før oppgitt fase", {\n              setId: set.set_id,\n              expectedStartPhase: context.method_start_phase\n            });\n          }\n        }\n      }\n`
);

fs.writeFileSync(
  "tests/quiz-progression-phase-order.test.mjs",
  `import test from "node:test";\nimport assert from "node:assert/strict";\nimport { phaseAllowsBinding } from "../scripts/audit-quiz-progression.mjs";\n\ntest("binding is rejected before its configured start phase and allowed from that point onward", () => {\n  const phases = ["opening", "middle", "middle", "bridge", "bridge", "final"];\n  assert.equal(phaseAllowsBinding(phases, 0, "bridge"), false);\n  assert.equal(phaseAllowsBinding(phases, 2, "bridge"), false);\n  assert.equal(phaseAllowsBinding(phases, 3, "bridge"), true);\n  assert.equal(phaseAllowsBinding(phases, 4, "bridge"), true);\n  assert.equal(phaseAllowsBinding(phases, 5, "bridge"), true);\n  assert.equal(phaseAllowsBinding(phases, 5, "missing"), false);\n});\n`
);

run("phase-order regression", process.execPath, ["--test", "tests/quiz-progression-phase-order.test.mjs"]);
run("quiz production context", "npm", ["run", "audit:quiz-production-context"]);
run("quiz progression", "npm", ["run", "audit:quiz-progression"]);
run("quiz theory binding", "npm", ["run", "audit:quiz-theory-binding"]);

const phase3Env = {
  FAGVERK_PHASE3_BASE_SHA: BASE,
  FAGVERK_PHASE3_HEAD_SHA: ORIGINAL_HEAD
};
run("fagverk phase3 before release regeneration", process.execPath, ["scripts/run-fagverk-phase3-ci-v1.mjs"], { env: phase3Env });
run("materialize natur final registry", process.execPath, ["scripts/materialize-natur-final-registry.mjs"]);
run("regenerate fagverk release", process.execPath, ["scripts/build-fagverk-release-manifest.mjs"]);
run("fagverk phase3 after release regeneration", process.execPath, ["scripts/run-fagverk-phase3-ci-v1.mjs"], { env: phase3Env });

run("knowledge canonical check", "npm", ["run", "knowledge:canonical:check"]);
run("knowledge legacy check", "npm", ["run", "knowledge:legacy:check"]);
run("knowledge audit", "npm", ["run", "audit:knowledge"]);
run("knowledge links", process.execPath, ["scripts/audit-knowledge-links.mjs"]);
run("git diff check", "git", ["diff", "--check"]);
run("changed files", "git", ["status", "--short"]);

fs.mkdirSync("reports/place-production", { recursive: true });
fs.writeFileSync("reports/place-production/stortorget-fixed-point-probe.txt", `${report.join("\n")}\n`);
