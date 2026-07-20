import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = path.join(ROOT, "reports", "knowledge-link-audit.json");
const SUBJECT_IDS = [
  "historie",
  "vitenskap",
  "kunst",
  "natur",
  "musikk",
  "populaerkultur",
  "subkultur",
  "sport",
  "by",
  "politikk",
  "naeringsliv",
  "litteratur",
  "psykologi"
];
const SUBJECT_SET = new Set(SUBJECT_IDS);
const SCAN_EXTENSIONS = new Set([".html", ".htm", ".js", ".mjs", ".ts"]);
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "reports"]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs));
    else if (SCAN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) out.push(abs);
  }
  return out;
}

function repoRelative(abs) {
  return path.relative(ROOT, abs).split(path.sep).join("/");
}

function normalizeRoute(raw, sourceFile, sourceIsHtml) {
  const clean = String(raw || "")
    .trim()
    .replace(/^https?:\/\/[^/]+\//i, "/")
    .split("#")[0];

  const [pathname, query = ""] = clean.split("?");
  let targetPath = pathname;

  if (targetPath.startsWith("/History-Go/")) {
    targetPath = targetPath.slice("/History-Go/".length);
  } else if (targetPath.startsWith("/")) {
    targetPath = targetPath.slice(1);
  } else if (sourceIsHtml) {
    targetPath = path.relative(ROOT, path.resolve(path.dirname(sourceFile), targetPath));
  } else {
    // URL-er i JS/TS løses av dokumentets URL, ikke av scriptfilens mappe.
    // Knowledge-ruter i runtime-kode behandles derfor som repo-root-ruter.
    const knowledgeIndex = targetPath.indexOf("knowledge");
    if (knowledgeIndex >= 0) targetPath = targetPath.slice(knowledgeIndex);
  }

  return {
    raw: clean,
    targetPath: targetPath.split(path.sep).join("/"),
    query
  };
}

function isExternalOrNonFile(href) {
  return !href || /^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(href);
}

function extractKnowledgeRouteStrings(content) {
  const matches = [];
  const routeRe = /["'`](?<route>(?:\/History-Go\/|\/|\.\.\/|\.\/)?(?:knowledge(?:\/knowledge)?_[a-z0-9_-]+\.(?:html?|htm)|knowledge\.html(?:\?subject=[a-z0-9_-]+)?))["'`]/gi;
  for (const match of content.matchAll(routeRe)) matches.push(match.groups.route);
  return matches;
}

function extractKnowledgePageHrefs(content) {
  const matches = [];
  const hrefRe = /\bhref=["']([^"']+)["']/gi;
  for (const match of content.matchAll(hrefRe)) matches.push(match[1]);
  return matches;
}

function dynamicLegacyKnowledgeTemplates(content) {
  return /knowledge\/knowledge_\$\{[^}]+\}\.html/i.test(content);
}

const files = walk(ROOT);
const references = [];
const broken = [];
const invalidSubjects = [];
const dynamicTemplates = [];

for (const abs of files) {
  const rel = repoRelative(abs);
  const ext = path.extname(rel).toLowerCase();
  const sourceIsHtml = ext === ".html" || ext === ".htm";
  const content = fs.readFileSync(abs, "utf8");
  const routes = extractKnowledgeRouteStrings(content);

  const isKnowledgeHtml = rel === "knowledge.html" ||
    /^knowledge\/knowledge_[^/]+\.html?$/i.test(rel) ||
    /^knowledge_[^/]+\.html?$/i.test(rel);

  if (isKnowledgeHtml) {
    for (const href of extractKnowledgePageHrefs(content)) {
      if (isExternalOrNonFile(href)) continue;
      routes.push(href);
    }
  }

  for (const rawRoute of routes) {
    const route = normalizeRoute(rawRoute, abs, sourceIsHtml);
    const targetAbs = path.join(ROOT, route.targetPath);
    const exists = fs.existsSync(targetAbs) && fs.statSync(targetAbs).isFile();
    const item = { source: rel, route: route.raw, target: route.targetPath, exists };
    references.push(item);
    if (!exists) broken.push(item);

    if (route.targetPath === "knowledge.html" && route.query) {
      const params = new URLSearchParams(route.query);
      const subject = params.get("subject");
      if (subject && !SUBJECT_SET.has(subject)) invalidSubjects.push({ ...item, subject });
    }
  }

  if (dynamicLegacyKnowledgeTemplates(content)) {
    const missingTargets = SUBJECT_IDS
      .map((subject) => `knowledge/knowledge_${subject}.html`)
      .filter((target) => !fs.existsSync(path.join(ROOT, target)));
    const item = { source: rel, pattern: "knowledge/knowledge_${subject}.html", missing_targets: missingTargets };
    dynamicTemplates.push(item);
    for (const target of missingTargets) {
      broken.push({ source: rel, route: item.pattern, target, exists: false });
    }
  }
}

const unique = (rows) => Array.from(new Map(rows.map((row) => [`${row.source}|${row.route || row.pattern}|${row.target || ""}`, row])).values());
const report = {
  generated_at: new Date().toISOString(),
  scanned_files: files.length,
  references: unique(references),
  dynamic_templates: unique(dynamicTemplates),
  broken: unique(broken),
  invalid_subjects: unique(invalidSubjects),
  ok: broken.length === 0 && invalidSubjects.length === 0
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

console.log(`Knowledge link audit: ${report.references.length} statiske ruter kontrollert i ${report.scanned_files} runtime-filer.`);
if (report.dynamic_templates.length) console.log(`Kontrollerte ${report.dynamic_templates.length} dynamiske legacy-rutegeneratorer.`);
if (report.broken.length) {
  console.error(`Fant ${report.broken.length} døde Knowledge-ruter:`);
  for (const row of report.broken) console.error(`- ${row.source}: ${row.route} -> ${row.target}`);
}
if (report.invalid_subjects.length) {
  console.error(`Fant ${report.invalid_subjects.length} ugyldige subject-parametre:`);
  for (const row of report.invalid_subjects) console.error(`- ${row.source}: ${row.route} (${row.subject})`);
}

process.exit(report.ok ? 0 : 1);
