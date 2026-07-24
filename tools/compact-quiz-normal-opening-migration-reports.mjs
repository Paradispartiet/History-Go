#!/usr/bin/env node
import { promises as fs } from "node:fs";

const JSON_REPORTS = [
  "reports/quiz-content-quality.json",
  "reports/quiz-normal-opening-migration-inventory.json"
];
const MARKDOWN_REPORT = "reports/quiz-normal-opening-migration-inventory.md";

for (const reportPath of JSON_REPORTS) {
  const parsed = JSON.parse(await fs.readFile(reportPath, "utf8"));
  await fs.writeFile(reportPath, `${JSON.stringify(parsed)}\n`, "utf8");
  console.log(`Komprimerte ${reportPath}`);
}

const markdown = await fs.readFile(MARKDOWN_REPORT, "utf8");
await fs.writeFile(MARKDOWN_REPORT, `${markdown.trimEnd()}\n`, "utf8");
console.log(`Normaliserte slutten av ${MARKDOWN_REPORT}`);
