#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  buildQuizProductionContext,
  isCli,
  writeJson
} from "./quiz-production-lib.mjs";

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

async function existingProductionTargets(root) {
  const baseDir = path.join(root, "data/quiz/production_context");
  const categoryEntries = await fs.readdir(baseDir, { withFileTypes: true });
  const targets = [];

  for (const categoryEntry of categoryEntries
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const categoryDir = path.join(baseDir, categoryEntry.name);
    const files = await fs.readdir(categoryDir, { withFileTypes: true });
    for (const file of files
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .sort((a, b) => a.name.localeCompare(b.name))) {
      targets.push({
        categoryId: categoryEntry.name,
        targetId: file.name.slice(0, -5),
        outputPath: path.relative(root, path.join(categoryDir, file.name))
      });
    }
  }

  return targets;
}

export async function runBuildQuizProductionContext({
  root = process.cwd(),
  categoryId,
  targetId,
  outputPath
}) {
  if (!categoryId || !targetId) {
    throw new Error("Bruk --category <categoryId> --target <targetId>");
  }
  const context = await buildQuizProductionContext({ root, categoryId, targetId });
  if (outputPath) await writeJson(root, outputPath, context);
  return context;
}

async function main() {
  const args = process.argv.slice(2);
  const categoryId = valueAfter(args, "--category");
  const targetId = valueAfter(args, "--target");
  const outputPath = valueAfter(args, "--output");

  if (!categoryId && !targetId) {
    const targets = await existingProductionTargets(process.cwd());
    for (const target of targets) {
      await runBuildQuizProductionContext({ root: process.cwd(), ...target });
      console.log(`Skrev ${target.outputPath}`);
    }
    console.log(`Gjenbygde ${targets.length} produksjonskontekster.`);
    return;
  }

  if (!categoryId || !targetId) {
    throw new Error("Bruk både --category <categoryId> og --target <targetId>, eller ingen av dem for å gjenbygge alle eksisterende kontekster.");
  }

  const context = await runBuildQuizProductionContext({
    root: process.cwd(),
    categoryId,
    targetId,
    outputPath
  });

  if (outputPath) {
    console.log(`Skrev ${path.relative(process.cwd(), path.resolve(outputPath))}`);
  } else {
    console.log(JSON.stringify(context, null, 2));
  }
}

if (isCli(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
