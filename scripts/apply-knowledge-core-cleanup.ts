import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file: string): string {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file: string, content: string): void {
  fs.writeFileSync(path.join(root, file), content);
}

function replaceOnce(source: string, before: string, after: string, label: string): string {
  if (!source.includes(before)) throw new Error(`Missing exact block: ${label}`);
  return source.replace(before, after);
}

function replaceRange(source: string, start: string, end: string, replacement: string, label: string): string {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`Missing range: ${label}`);
  return `${source.slice(0, from)}${replacement}\n\n${source.slice(to)}`;
}

function patchKnowledgeSource(): void {
  const file = "js/knowledge.ts";
  let source = read(file);

  source = replaceRange(
    source,
    "function getKnowledgeForCategory(categoryId) {",
    "// ------------------------------------------------------------\n// LAG KUNNSKAPSPUNKT NÅR QUIZ SVARES RIKTIG",
    `function getKnowledgeForCategory(categoryId) {
  const cid = String(categoryId || "").trim();
  const canonical = window.HGKnowledgeV2?.getEntries?.();
  if (Array.isArray(canonical)) {
    const grouped = {};
    canonical
      .filter((entry) => String(entry?.subject_id || entry?.fagkart_category_id || "").trim() === cid)
      .forEach((entry) => {
        const dimension = String(entry?.dimension || "generelt").trim() || "generelt";
        grouped[dimension] ||= [];
        grouped[dimension].push({ id: entry.id, topic: entry.topic, text: entry.text });
      });
    if (Object.keys(grouped).length) return grouped;
  }
  const legacy = getKnowledgeUniverse();
  return legacy[cid] || {};
}`,
    "knowledge.ts canonical read model"
  );

  source = replaceRange(
    source,
    "function saveKnowledgeFromQuiz(quizItem, context = {}) {",
    "window.saveKnowledgeFromQuiz = saveKnowledgeFromQuiz;",
    `function saveKnowledgeFromQuiz(quizItem, context = {}) {
  return window.HGKnowledgeV2?.captureQuizKnowledge?.(quizItem, context) || null;
}`,
    "knowledge.ts canonical quiz capture"
  );

  write(file, source);
}

function patchBuild(): void {
  const file = "build/build-web.mjs";
  let source = read(file);
  source = replaceOnce(
    source,
    `  { in: "js/knowledge.ts", out: "knowledge" },\n`,
    `  { in: "js/knowledge.ts", out: "knowledge" },\n  { in: "js/knowledgeV2.ts", out: "knowledgeV2" },\n`,
    "build knowledgeV2 entry"
  );
  write(file, source);
}

function patchHtml(): void {
  for (const file of ["index.html", "knowledge.html"]) {
    let source = read(file);
    source = replaceOnce(source, `src="js/knowledgeV2.js"`, `src="dist/web/knowledgeV2.js"`, `${file} knowledgeV2 bundle`);
    if (file === "knowledge.html") {
      source = source
        .replace(/\n\s*<script src="js\/quizKnowledgeQuality\.js"><\/script>/, "")
        .replace(/\n\s*<script src="js\/knowledgeLegacyTextQuality\.js"><\/script>/, "");
    }
    write(file, source);
  }
}

function patchPsychologyEntry(): void {
  const file = "js/ui/psychology-room-entry.js";
  let source = read(file);
  source = replaceRange(
    source,
    "  function loadLegacyKnowledgeTextQualityLayer() {",
    "  function ensureCss() {",
    `  function loadQuizKnowledgeMemoryLayer() {
    if (window.HGQuizKnowledgeMemory) return;
    if (document.getElementById("quiz-knowledge-memory-script")) return;

    const script = document.createElement("script");
    script.id = "quiz-knowledge-memory-script";
    script.src = "js/quizKnowledgeMemory.js";
    script.async = false;
    document.head.appendChild(script);
  }`,
    "psychology room Knowledge loaders"
  );
  write(file, source);
}

function patchMemoryPageBridge(): void {
  const file = "js/knowledgeMemoryPageBridge.js";
  let source = read(file);
  source = replaceOnce(
    source,
    `      topic: s(unit?.topic || unit?.question_family || unit?.question_type || unit?.question || "Kunnskap"),\n      text: s(unit?.text || unit?.answer),\n`,
    `      topic: s(unit?.topic || unit?.question_family || unit?.question_type || "Kunnskap"),\n      text: s(unit?.text),\n`,
    "memory page bridge precise unit"
  );
  write(file, source);
}

function patchQuizMemory(): void {
  const file = "js/quizKnowledgeMemory.js";
  let source = read(file);

  source = replaceOnce(
    source,
    `  const MANIFEST_PATH = "data/quiz/manifest.json";\n`,
    `  const MANIFEST_PATH = "data/quiz/manifest.json";\n  const ClaimCore = root?.HGKnowledgeV2?.claimCore;\n  if (!ClaimCore) throw new Error("HGKnowledgeV2 must load before quizKnowledgeMemory.js");\n`,
    "quiz memory canonical claim core"
  );

  source = replaceOnce(
    source,
    `    const knowledgeText = text(question?.knowledge || question?.explanation || question?.answer);\n`,
    `    const knowledgeText = ClaimCore.extractQuizClaims(question).join(" ");\n`,
    "quiz memory no answer fallback"
  );

  source = replaceOnce(
    source,
    `  function inferKnowledgeKind(question) {\n    const type = text(question?.question_type || question?.question_family || question?.dimension).toLowerCase();\n    if (/trivia|kurios|fun.?fact/.test(type)) return "fun_fact";\n    if (/story|historie|fortelling/.test(type)) return "story";\n    if (/concept|begrep|termin/.test(type)) return "concept";\n    if (/method|metode/.test(type)) return "method";\n    if (/theory|teori|analysis|analyse/.test(type)) return "analysis";\n    if (/observation|observasjon|place_reading|steds/.test(type)) return "observation";\n    return "knowledge";\n  }\n`,
    `  function inferKnowledgeKind(question) {\n    return ClaimCore.inferKind(question);\n  }\n`,
    "quiz memory kind inference"
  );

  const helpers = `  function splitUnit(unit) {
    const claims = ClaimCore.extractTextClaims(unit?.text, { question: unit?.question, answer: unit?.answer });
    if (!claims.length) return [];
    const kind = ClaimCore.inferKind(unit);
    const currentId = text(unit?.unit_id || unit?.id || "knowledge_unit");
    const sourceId = text(unit?.source_question_id || currentId);
    return claims.map((claim, index) => {
      const next = { ...unit };
      delete next.question;
      delete next.answer;
      delete next.trivia;
      next.unit_id = claims.length === 1 ? currentId : \`${sourceId}::claim::\${index + 1}\`;
      next.source_question_id = sourceId;
      next.kind = kind;
      next.topic = ClaimCore.cleanTopic(unit?.topic, kind);
      next.text = claim;
      next.quality = { version: 2, source: "canonical_quiz_builder", split_from_question: claims.length > 1 };
      return next;
    });
  }

  function mergeAssessment(a, b) {
    const mastered = a?.state === "mastered" || b?.state === "mastered" || a?.correct === true || b?.correct === true;
    return { ...(a || {}), ...(b || {}), correct: mastered, state: mastered ? "mastered" : (a?.state || b?.state || "needs_review") };
  }

  function dedupeUnits(units) {
    const map = new Map();
    array(units).forEach((unit) => {
      const key = ClaimCore.normalized(unit?.text);
      if (!key) return;
      const previous = map.get(key);
      if (!previous) return map.set(key, unit);
      for (const field of ["emne_ids", "concepts", "concept_focus", "terms", "tags"]) {
        previous[field] = unique([...(previous[field] || []), ...(unit[field] || [])]);
      }
      previous.sources = array(previous.sources).concat(array(unit.sources));
      previous.assessment = mergeAssessment(previous.assessment, unit.assessment);
    });
    return Array.from(map.values());
  }

  function sanitizeFunFacts(items, blocked) {
    const output = [];
    array(items).forEach((item, itemIndex) => {
      ClaimCore.splitClaims(item?.text || item).forEach((claim, claimIndex) => {
        const key = ClaimCore.normalized(claim);
        if (!key || blocked.has(key)) return;
        blocked.add(key);
        const raw = item && typeof item === "object" ? item : {};
        output.push({ ...raw, id: text(raw.id) || \`fun_fact_\${itemIndex + 1}_\${claimIndex + 1}\`, kind: "fun_fact", text: claim });
      });
    });
    return output;
  }

  function rebuildBundleIndexes(bundle) {
    const units = array(bundle?.knowledge_units);
    bundle.indexes = {
      ...(bundle.indexes || {}),
      emne_ids: unique(units.flatMap((unit) => array(unit?.emne_ids))),
      concepts: unique(units.flatMap((unit) => array(unit?.concepts))),
      concept_focus: unique(units.flatMap((unit) => array(unit?.concept_focus))),
      terms: unique(units.flatMap((unit) => array(unit?.terms))),
      people: unique(units.flatMap((unit) => array(unit?.people))),
      events: unique(units.flatMap((unit) => array(unit?.events))),
      methods: unique(units.flatMap((unit) => array(unit?.methods))),
      stories: unique(units.flatMap((unit) => array(unit?.stories)))
    };
    return bundle;
  }

  function sanitizeBundle(bundle) {
    if (!bundle || typeof bundle !== "object") return bundle;
    if (bundle?.content_quality?.version === 2 && array(bundle.knowledge_units).every((unit) => unit?.quality?.version === 2)) return bundle;
    const original = array(bundle.knowledge_units);
    const knowledgeUnits = dedupeUnits(original.flatMap(splitUnit));
    const blocked = new Set(knowledgeUnits.map((unit) => ClaimCore.normalized(unit.text)));
    return rebuildBundleIndexes({
      ...bundle,
      knowledge_units: knowledgeUnits,
      fun_facts: sanitizeFunFacts(bundle.fun_facts, blocked),
      content_quality: {
        version: 2,
        original_unit_count: original.length,
        precise_unit_count: knowledgeUnits.length,
        removed_or_merged_count: Math.max(0, original.length - knowledgeUnits.length),
        automatic_storage: true,
        canonical_builder: true
      }
    });
  }

`;

  source = replaceOnce(
    source,
    "  function buildQuizKnowledgeBundle(input = {}) {\n",
    `${helpers}  function buildQuizKnowledgeBundle(input = {}) {\n`,
    "quiz memory canonical helpers"
  );

  source = replaceOnce(
    source,
    `    return {\n      schema: SCHEMA,\n`,
    `    return sanitizeBundle({\n      schema: SCHEMA,\n`,
    "quiz memory sanitize bundle start"
  );
  source = replaceOnce(
    source,
    `        sources\n      }\n    };\n  }\n\n  function emptyMemory() {\n`,
    `        sources\n      }\n    });\n  }\n\n  function emptyMemory() {\n`,
    "quiz memory sanitize bundle end"
  );

  source = replaceRange(
    source,
    "  function readMemory() {",
    "  function addIndex(index, key, bundleId) {",
    `  function readMemory() {
    if (!root?.localStorage) return emptyMemory();
    try {
      const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || parsed.schema !== SCHEMA || !parsed.bundles) return emptyMemory();
      const next = { ...parsed, bundles: { ...parsed.bundles } };
      let changed = false;
      Object.entries(next.bundles).forEach(([bundleId, bundle]) => {
        const clean = sanitizeBundle(bundle);
        next.bundles[bundleId] = clean;
        if (JSON.stringify(clean) !== JSON.stringify(bundle)) changed = true;
      });
      rebuildIndexes(next);
      if (changed) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    } catch {
      return emptyMemory();
    }
  }`,
    "quiz memory integrated stored migration"
  );

  source = replaceOnce(
    source,
    `  function saveBundle(bundle) {\n    if (!bundle?.bundle_id) return null;\n    const memory = readMemory();\n`,
    `  function saveBundle(bundle) {\n    const preciseBundle = sanitizeBundle(bundle);\n    if (!preciseBundle?.bundle_id) return null;\n    bundle = preciseBundle;\n    const memory = readMemory();\n`,
    "quiz memory sanitize before save"
  );

  source = source
    .replace(/\n\s*<div style="display:flex;justify-content:flex-end;padding:12px 16px 16px">\n\s*<button id="quizKnowledgeMemoryRead">Lest – legg i Knowledge<\/button>\n\s*<\/div>/, "")
    .replace(/\n\s*modal\.querySelector\("#quizKnowledgeMemoryRead"\)\.onclick = \(\) => \{\n\s*updateReadingState\(bundle\.bundle_id, "read"\);\n\s*closeKnowledgePopup\(\);\n\s*\};/, "");

  source = replaceOnce(
    source,
    `    captureCompletion,\n    initBrowserIntegration\n`,
    `    captureCompletion,\n    sanitizeBundle,\n    initBrowserIntegration\n`,
    "quiz memory export sanitizer"
  );

  write(file, source);
}

function copyReports(): void {
  const outDir = path.join(root, "reports/knowledge-core-build");
  fs.mkdirSync(outDir, { recursive: true });
  const files = [
    "js/knowledge.ts",
    "js/knowledgeV2.ts",
    "js/knowledgeClaimCore.ts",
    "js/quizKnowledgeMemory.js",
    "js/knowledgeMemoryPageBridge.js",
    "js/ui/psychology-room-entry.js",
    "build/build-web.mjs",
    "index.html",
    "knowledge.html",
    "dist/web/knowledge.js",
    "dist/web/knowledge.js.map",
    "dist/web/knowledgeV2.js",
    "dist/web/knowledgeV2.js.map"
  ];
  for (const file of files) {
    const source = path.join(root, file);
    if (!fs.existsSync(source)) throw new Error(`Expected build output missing: ${file}`);
    const target = path.join(outDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

patchKnowledgeSource();
patchBuild();
patchHtml();
patchPsychologyEntry();
patchMemoryPageBridge();
patchQuizMemory();

if (process.argv.includes("--copy-reports")) copyReports();
console.log("Knowledge core cleanup applied");
