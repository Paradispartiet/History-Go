#!/usr/bin/env node
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
