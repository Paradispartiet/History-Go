import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const OLD_ID = "sagene_kvernhus";
const NEW_ID = "glads_molle";
const REPORT_DIR = "reports/oslo-coordinate-sagene-kvernhus-duplicate-reference-audit";
mkdirSync(REPORT_DIR, { recursive: true });

const roots = ["data", "src", "tests", "docs"];
const allowed = new Set([".json", ".jsonl", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".md"]);
const files = [];
const walk = (path) => {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) walk(join(path, name));
    return;
  }
  if (allowed.has(extname(path).toLowerCase())) files.push(path);
};
for (const root of roots) walk(root);

const textHits = { [OLD_ID]: [], [NEW_ID]: [] };
const exactJsonRefs = { [OLD_ID]: [], [NEW_ID]: [] };

const visit = (value, pointer, file) => {
  if (typeof value === "string") {
    if (value === OLD_ID) exactJsonRefs[OLD_ID].push({ file, pointer });
    if (value === NEW_ID) exactJsonRefs[NEW_ID].push({ file, pointer });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, `${pointer}/${index}`, file));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      const escaped = key.replaceAll("~", "~0").replaceAll("/", "~1");
      visit(item, `${pointer}/${escaped}`, file);
    }
  }
};

for (const path of files) {
  const file = relative(process.cwd(), path).replaceAll("\\", "/");
  const text = readFileSync(path, "utf8");
  for (const id of [OLD_ID, NEW_ID]) {
    if (!text.includes(id)) continue;
    const lines = text.split("\n");
    const matchingLines = [];
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].includes(id)) matchingLines.push({ line: i + 1, text: lines[i].trim().slice(0, 500) });
    }
    textHits[id].push({ file, occurrenceCount: text.split(id).length - 1, matchingLines: matchingLines.slice(0, 30) });
  }
  if (extname(path).toLowerCase() === ".json") {
    try { visit(JSON.parse(text), "", file); } catch {}
  }
}

const summary = {
  version: "2026-07-23",
  purpose: "Determine whether unresolved sagene_kvernhus can be retired in favor of already-canonical glads_molle without breaking references.",
  canonicalCollision: {
    oldId: OLD_ID,
    newId: NEW_ID,
    relationship: "same exact physical object and exact Geonorge address coordinate according to the failed batch-188 collision gate"
  },
  textHits,
  exactJsonRefs,
  counts: {
    oldIdFiles: textHits[OLD_ID].length,
    oldIdExactJsonRefs: exactJsonRefs[OLD_ID].length,
    newIdFiles: textHits[NEW_ID].length,
    newIdExactJsonRefs: exactJsonRefs[NEW_ID].length
  }
};
writeFileSync(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
