import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = {
  pensum: "data/fag/historie/historiepensum_canonical_v4_5.json",
  fagkart: "data/fag/historie/fagkart_historie_canonical_v4_5.json",
  emner: "data/fag/historie/emner_historie_canonical_v4_5.json",
  mapping: "data/fag/historie/emnemapping_historie_canonical_v4_5.json",
  methods: "data/fag/historie/methods_historie_canonical_v4_5.json",
  generator: "data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json",
  tests: "tests/quiz-production-pipeline.test.mjs"
};

const docs = Object.fromEntries(
  Object.entries(files)
    .filter(([key]) => key !== "tests")
    .map(([key, file]) => [key, JSON.parse(fs.readFileSync(path.join(root, file), "utf8"))])
);

function shape(value) {
  if (Array.isArray(value)) return { type: "array", length: value.length, firstKeys: value[0] && typeof value[0] === "object" ? Object.keys(value[0]) : [] };
  if (value && typeof value === "object") {
    return {
      type: "object",
      keys: Object.keys(value),
      children: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, Array.isArray(child) ? { type: "array", length: child.length, firstKeys: child[0] && typeof child[0] === "object" ? Object.keys(child[0]) : [] } : typeof child]))
    };
  }
  return { type: typeof value };
}

function collect(value, predicate, out = [], seen = new Set()) {
  if (!value || typeof value !== "object") return out;
  if (seen.has(value)) return out;
  seen.add(value);
  if (!Array.isArray(value) && predicate(value)) out.push(value);
  if (Array.isArray(value)) {
    for (const item of value) collect(item, predicate, out, seen);
  } else {
    for (const child of Object.values(value)) collect(child, predicate, out, seen);
  }
  return out;
}

const domains = new Set(["his_migrasjon_minoritet_tilhorighet", "his_byhistorie_stedsendring"]);
const migrationEmner = new Set(["em_his_migrasjon_mangfold", "em_his_minoritetshistorie", "em_his_tilhorighet_ekskludering"]);
const methodIds = new Set([
  "met_muntlig_historie", "met_arkivlesning", "met_sporlesning", "met_minneanalyse",
  "met_seriell_kildeanalyse", "met_livslopsanalyse", "met_husholdsanalyse",
  "met_historisk_gis", "met_romlig_historie", "met_plan_og_gjennomforingsanalyse",
  "met_arealbruksendringsanalyse", "met_eiendoms_og_verdidynamikkanalyse"
]);

function matchesDomain(obj) {
  return domains.has(obj.domain_id) || domains.has(obj.id) || domains.has(obj.category_id) || domains.has(obj.curriculum_domain_id);
}
function matchesMigrationEmne(obj) {
  return migrationEmner.has(obj.emne_id) || migrationEmner.has(obj.id);
}
function matchesMethod(obj) {
  return methodIds.has(obj.method_id) || methodIds.has(obj.id);
}
function matchesGenerator(obj) {
  const values = [obj.domain_id, obj.id, obj.category_id, obj.profile_id, obj.curriculum_domain_id];
  return values.some((value) => domains.has(value)) || values.some((value) => typeof value === "string" && (value.includes("byhistorie") || value.includes("migrasjon")));
}

const testText = fs.readFileSync(path.join(root, files.tests), "utf8");
const testLines = testText.split("\n").filter((line) => /considered_curriculum\.counts|pensum_modules|topic_hooks|methods|emner/.test(line));

const report = {
  generated_at: new Date().toISOString(),
  source_sha: process.env.GITHUB_SHA || null,
  files,
  shapes: Object.fromEntries(Object.entries(docs).map(([key, doc]) => [key, shape(doc)])),
  pensum_domains: collect(docs.pensum, matchesDomain),
  fagkart_domains: collect(docs.fagkart, matchesDomain),
  migration_emner: collect(docs.emner, matchesMigrationEmne),
  sample_byhistorie_emner: collect(docs.emner, (obj) => obj.domain_id === "his_byhistorie_stedsendring" || (typeof obj.id === "string" && obj.id.startsWith("em_his_") && JSON.stringify(obj).includes("his_byhistorie_stedsendring"))),
  migration_mappings: collect(docs.mapping, (obj) => matchesMigrationEmne(obj) || obj.domain_id === "his_migrasjon_minoritet_tilhorighet"),
  sample_byhistorie_mappings: collect(docs.mapping, (obj) => obj.domain_id === "his_byhistorie_stedsendring" || JSON.stringify(obj).includes("his_byhistorie_stedsendring")),
  relevant_methods: collect(docs.methods, matchesMethod),
  all_method_ids: [...new Set(collect(docs.methods, (obj) => typeof obj.id === "string" && obj.id.startsWith("met_")).map((obj) => obj.id))].sort(),
  generator_profiles: collect(docs.generator, matchesGenerator),
  test_count_lines: testLines
};

const out = path.join(root, "reports/historie-canonical-migration/phase7-structure-audit.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Wrote ${out}`);
