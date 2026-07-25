#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const replacements = new Map([
  ["em_naer_felt_arbeid_verdiskaping", "em_naering_felt_arbeid_verdiskaping"],
  ["em_naer_geografi_infrastruktur", "em_naering_geografi_infrastruktur"]
]);

const canonicalPath = "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const legacyPath = "data/fag/naeringsliv/emner_naeringsliv2.json";
const pensumPath = "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json";
const methodsPath = "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json";

const workMethods = [
  "met_naering_arbeidslivsanalyse",
  "met_naering_verdiskapingsanalyse",
  "met_naering_logistikk_og_verdikjedeanalyse",
  "met_naering_omstilling_og_endringsanalyse",
  "met_naering_makt_og_ulikhetsanalyse",
  "met_naering_industrihistorisk_analyse"
];

const geographyMethods = [
  "met_naering_romlig_okonomisk_analyse",
  "met_naering_infrastrukturanalyse",
  "met_naering_logistikk_og_verdikjedeanalyse",
  "met_naering_investering_og_eiendomsanalyse",
  "met_naering_byhistorisk_naeringsanalyse",
  "met_naering_statistikk_og_indikatoranalyse"
];

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function walkJson(current, callback) {
  if (!fs.existsSync(current)) return;
  const stat = fs.statSync(current);
  if (stat.isDirectory()) {
    if (["node_modules", ".git", "reports"].includes(path.basename(current))) return;
    for (const name of fs.readdirSync(current)) walkJson(path.join(current, name), callback);
    return;
  }
  if (current.endsWith(".json") && stat.size <= 8_000_000) callback(current);
}

let replacedFiles = 0;
walkJson("data", file => {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  for (const [from, to] of replacements) after = after.split(from).join(to);
  if (after !== before) {
    fs.writeFileSync(file, after);
    replacedFiles += 1;
  }
});

function normalizeModule(item, { domains, methods }) {
  const tasks = Array.isArray(item.field_tasks)
    ? item.field_tasks
    : Array.isArray(item.methods)
      ? item.methods.filter(value => typeof value === "string" && !value.startsWith("met_naering_"))
      : [];

  Object.assign(item, {
    module_type: "cross_domain_field_module",
    emne_role: "field_module",
    canonical_status: "canonical_supplement",
    canonical_file_role: "supplementary_active",
    quiz_priority: "medium",
    direct_quiz_ok: false,
    opening_use_ok: false,
    bridge_use_ok: true,
    late_use_ok: true,
    mapping_required: false,
    primary_domain_ids: domains,
    method_ids: methods,
    methods,
    recommended_methods: methods,
    field_tasks: tasks,
    requires_business_anchor: true,
    requires_external_claim_basis: true,
    requires_documented_economic_context: true,
    requires_work_capital_firm_or_infrastructure_anchor: true,
    scope_guard: "Brukes som tverrgående feltmodul når spilleren kan undersøke konkrete virksomheter, arbeidsformer, kapitalstrømmer, markeder, teknologier, logistikk eller infrastruktur."
  });
}

function updateEmneFile(file) {
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const list = Array.isArray(data) ? data : data.emner;
  if (!Array.isArray(list)) throw new Error(`${file}: emneliste mangler`);

  const work = list.find(item => item.emne_id === "em_naering_felt_arbeid_verdiskaping");
  const geography = list.find(item => item.emne_id === "em_naering_geografi_infrastruktur");
  if (!work || !geography) throw new Error(`${file}: begge feltmoduler må finnes`);

  normalizeModule(work, {
    domains: [
      "arbeid_produksjon_verdiskaping",
      "handel_forbruk_marked",
      "teknologi_innovasjon_plattform",
      "logistikk_infrastruktur_rom",
      "makt_regulering_baerekraft"
    ],
    methods: workMethods
  });

  normalizeModule(geography, {
    domains: [
      "logistikk_infrastruktur_rom",
      "kapital_eierskap_finans",
      "teknologi_innovasjon_plattform",
      "makt_regulering_baerekraft"
    ],
    methods: geographyMethods
  });

  writeJson(file, data);
}

updateEmneFile(canonicalPath);
updateEmneFile(legacyPath);

const pensum = JSON.parse(fs.readFileSync(pensumPath, "utf8"));
pensum.version = "v4.6-canonical";
pensum.canonical_registry_version = "naeringslivpensum_v4_6";
pensum.updated_at = new Date().toISOString().slice(0, 10);
pensum.summary = {
  ...pensum.summary,
  emne_count: 38,
  core_emne_count: 36,
  field_module_count: 2,
  mapping_count: 36,
  core_mapping_count: 36,
  field_module_mapping_count: 0,
  all_emner_have_mapping: false,
  all_core_emner_have_mapping: true,
  field_modules_require_mapping: false
};
pensum.field_modules = [
  {
    emne_id: "em_naering_felt_arbeid_verdiskaping",
    title: "Næringsliv som arbeid og verdiskaping",
    module_type: "cross_domain_field_module",
    status: "canonical_supplement",
    mapping_required: false,
    primary_domain_ids: [
      "arbeid_produksjon_verdiskaping",
      "handel_forbruk_marked",
      "teknologi_innovasjon_plattform",
      "logistikk_infrastruktur_rom",
      "makt_regulering_baerekraft"
    ],
    purpose: "Tverrgående feltmodul for å kartlegge arbeid, verdiskaping, produksjonskjeder, teknologisk endring og ulikhet i konkrete virksomheter og arbeidssteder."
  },
  {
    emne_id: "em_naering_geografi_infrastruktur",
    title: "Økonomiens geografi og infrastruktur",
    module_type: "cross_domain_field_module",
    status: "canonical_supplement",
    mapping_required: false,
    primary_domain_ids: [
      "logistikk_infrastruktur_rom",
      "kapital_eierskap_finans",
      "teknologi_innovasjon_plattform",
      "makt_regulering_baerekraft"
    ],
    purpose: "Tverrgående feltmodul for å undersøke hvor arbeidsplasser, lager, havner, transport, eierskap og teknisk infrastruktur ligger og hvordan de former byens økonomiske rom."
  }
];
pensum.legacy_policy = {
  ...pensum.legacy_policy,
  naeringsliv_emne_prefix_required: "em_naering_",
  field_module_ids_normalized: true,
  normalized_field_module_ids: [
    "em_naering_felt_arbeid_verdiskaping",
    "em_naering_geografi_infrastruktur"
  ]
};
writeJson(pensumPath, pensum);

const methodsRaw = JSON.parse(fs.readFileSync(methodsPath, "utf8"));
const methods = Array.isArray(methodsRaw) ? methodsRaw : methodsRaw.methods || [];
const validMethodIds = new Set(methods.map(item => item.method_id));
const canonical = JSON.parse(fs.readFileSync(canonicalPath, "utf8"));

for (const moduleId of ["em_naering_felt_arbeid_verdiskaping", "em_naering_geografi_infrastruktur"]) {
  const module = canonical.find(item => item.emne_id === moduleId);
  if (!module) throw new Error(`${moduleId}: feltmodul mangler`);
  if (!Array.isArray(module.field_tasks) || module.field_tasks.length < 5) {
    throw new Error(`${moduleId}: feltoppgavene ble ikke bevart`);
  }
  for (const methodId of module.method_ids) {
    if (!validMethodIds.has(methodId)) throw new Error(`${moduleId}: ukjent metode ${methodId}`);
  }
}

for (const oldId of replacements.keys()) {
  const hits = [];
  walkJson("data", file => {
    if (fs.readFileSync(file, "utf8").includes(oldId)) hits.push(file);
  });
  if (hits.length) throw new Error(`${oldId} finnes fortsatt i ${hits.join(", ")}`);
}

console.log(`Normaliserte feltmodul-ID-er i ${replacedFiles} JSON-filer.`);
