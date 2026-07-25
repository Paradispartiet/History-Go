import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const load = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const docs = {
  pensum: load("data/fag/historie/historiepensum_canonical_v4_5.json"),
  fagkart: load("data/fag/historie/fagkart_historie_canonical_v4_5.json"),
  emner: load("data/fag/historie/emner_historie_canonical_v4_5.json"),
  mapping: load("data/fag/historie/emnemapping_historie_canonical_v4_5.json"),
  methods: load("data/fag/historie/methods_historie_canonical_v4_5.json"),
  generator: load("data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json")
};

const targetDomain = "his_migrasjon_minoritet_tilhorighet";
const sampleDomain = "his_byhistorie_stedsendring";
const targetEmneIds = ["em_his_migrasjon_mangfold", "em_his_minoritetshistorie", "em_his_tilhorighet_ekskludering"];
const sampleEmneId = "em_his_gatenett_tomtestruktur_infrastruktur";
const methodIds = [
  "met_muntlig_historie", "met_arkivlesning", "met_sporlesning", "met_minneanalyse",
  "met_seriell_kildeanalyse", "met_livslopsanalyse", "met_husholdsanalyse",
  "met_historisk_gis", "met_romlig_historie", "met_planhistorisk_analyse",
  "met_arealbruksendringsanalyse", "met_eiendoms_og_verdidynamikkanalyse"
];

function findObjects(value, predicate, out = [], seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return out;
  seen.add(value);
  if (!Array.isArray(value) && predicate(value)) out.push(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) findObjects(child, predicate, out, seen);
  return out;
}

const targetCategory = docs.fagkart.categories.find((entry) => entry.id === targetDomain);
const sampleCategory = docs.fagkart.categories.find((entry) => entry.id === sampleDomain);
const targetPensum = docs.pensum.domains.find((entry) => entry.domain_id === targetDomain);
const samplePensum = docs.pensum.domains.find((entry) => entry.domain_id === sampleDomain);
const targetEmners = docs.emner.filter((entry) => targetEmneIds.includes(entry.emne_id));
const sampleEmne = docs.emner.find((entry) => entry.emne_id === sampleEmneId);
const targetMappings = docs.mapping.filter((entry) => targetEmneIds.includes(entry.emne_id));
const sampleMapping = docs.mapping.find((entry) => entry.emne_id === sampleEmneId);
const relevantMethods = docs.methods.methods.filter((entry) => methodIds.includes(entry.method_id));
const allMethodIds = docs.methods.methods.map((entry) => entry.method_id).sort();
const profiles = docs.generator.domain_profiles || {};

const report = {
  generated_at: new Date().toISOString(),
  source_sha: process.env.GITHUB_SHA || null,
  target: {
    pensum: targetPensum,
    category: targetCategory,
    emners: targetEmners,
    mappings: targetMappings,
    generator_profile: profiles[targetDomain] || null
  },
  completed_sample: {
    pensum: samplePensum,
    category_shell: sampleCategory ? { ...sampleCategory, topic_hooks: undefined } : null,
    hook: sampleCategory?.topic_hooks?.[0] || null,
    emne: sampleEmne || null,
    mapping: sampleMapping || null,
    new_method: docs.methods.methods.find((entry) => entry.method_id === "met_historisk_gis") || null,
    generator_profile: profiles[sampleDomain] || null
  },
  methods: {
    relevant: relevantMethods,
    all_ids: allMethodIds
  },
  generator: {
    profile_keys: Object.keys(profiles),
    normal_opening_contract: docs.generator.normal_opening_contract,
    set_guidance: docs.generator.set_guidance
  },
  counts: {
    emners: docs.emner.length,
    mappings: docs.mapping.length,
    methods: docs.methods.methods.length,
    domains: docs.pensum.domains.length
  }
};

const out = path.join(root, "reports/historie-canonical-migration/phase7-compact-audit.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Wrote ${out}`);
