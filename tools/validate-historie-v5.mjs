#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const historyDir = path.join(root, "data/fag/historie");
const toolsDir = path.join(root, "tools");
const reportsDir = path.join(root, "reports/historie-v5");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(historyDir, file), "utf8"));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value, min = 1) => typeof value === "string" && value.trim().length >= min;

const plan = readJson("historie_v5_5_domain_plan.json");
const contract = readJson("historie_v5_contract.json");
const pensum = readJson(contract.authoritative_files.pensum);
const emner = readJson(contract.authoritative_files.emner);
const mappings = readJson(contract.authoritative_files.emnemapping);
const methodsFile = readJson(contract.authoritative_files.methods);
const fagkart = readJson(contract.authoritative_files.fagkart);
const generatorRules = readJson(contract.authoritative_files.generator_rules);

const methods = list(methodsFile.methods);
const domainById = new Map(list(pensum.domains).map((item) => [item.domain_id, item]));
const emneById = new Map(list(emner).map((item) => [item.emne_id, item]));
const mappingByEmne = new Map(list(mappings).map((item) => [item.emne_id, item]));
const methodIds = new Set(methods.map((item) => item.method_id));
const fagkartIds = new Set(list(fagkart.categories).map((item) => item.id));
const toolNames = fs.existsSync(toolsDir) ? fs.readdirSync(toolsDir) : [];
const stopwords = new Set(["og", "eller", "i", "på", "av", "for", "med", "til"]);

const validatorAliases = {
  his_tid_periodisering: ["validate-historie-tid-periodisering.mjs"],
  his_kilder_arkiv_spor: ["validate-historie-kilder-arkiv-spor.mjs"],
  his_makt_stat_institusjoner: ["validate-historie-makt-stat-institusjoner.mjs"],
  his_industri_arbeid_sosialhistorie: ["validate-historie-industri-arbeid.mjs"],
  his_velferd_rett_hverdagsliv: ["validate-historie-velferd-rett-hverdagsliv.mjs", "validate-historie-velferd.mjs"],
  his_migrasjon_minoritet_tilhorighet: ["validate-historie-migrasjon-minoritet-tilhorighet.mjs", "validate-historie-migrasjon.mjs"],
  his_minne_kulturarv_historiebruk: ["validate-historie-minne-kulturarv-historiebruk.mjs", "validate-historie-minne-kulturarv.mjs"],
  his_byhistorie_stedsendring: ["validate-historie-byhistorie-stedsendring.mjs", "validate-historie-byhistorie.mjs"]
};

function hasDomainValidator(domainId) {
  const derived = `validate-historie-${domainId.replace(/^his_/, "").replaceAll("_", "-")}.mjs`;
  return [...new Set([...(validatorAliases[domainId] || []), derived])]
    .some((candidate) => toolNames.includes(candidate));
}

function twoLane(mapping) {
  const lanes = list(mapping?.mappings);
  const tiers = new Set(lanes.map((item) => item.mapping_tier).filter(Boolean));
  return lanes.length >= 2 && tiers.size >= 2;
}

function emneConceptNoise(emne) {
  return [
    ...list(emne.core_concepts),
    ...list(emne.key_concepts),
    ...list(emne.sub_concepts)
  ].filter((value) => typeof value === "string" && stopwords.has(value.trim().toLowerCase()));
}

function auditEmne(emne) {
  const c = contract.emne_freeze_contract;
  const core = list(emne.core_concepts).length ? list(emne.core_concepts) : list(emne.core_concept_ids);
  const sub = list(emne.sub_concepts).length ? list(emne.sub_concepts) : list(emne.sub_concept_ids);
  const methodRefs = list(emne.method_ids);
  const gaps = [];

  if (!text(emne.definition, 45)) gaps.push("weak_definition");
  if (!text(emne.why_it_matters, 45)) gaps.push("weak_why_it_matters");
  if (core.length < c.min_core_concepts) gaps.push("too_few_core_concepts");
  if (sub.length < c.min_sub_concepts) gaps.push("too_few_sub_concepts");
  if (list(emne.key_questions).length < c.min_key_questions) gaps.push("too_few_key_questions");
  if (list(emne.analysis_axes).length < c.min_analysis_axes) gaps.push("too_few_analysis_axes");
  if (methodRefs.length < c.min_methods) gaps.push("too_few_methods");
  if (methodRefs.some((id) => !methodIds.has(id))) gaps.push("unknown_method");
  if (list(emne.recommended_oslo_cases).length < c.min_cases) gaps.push("too_few_cases");
  if (!list(emne.canonical_thinker_ids).length) gaps.push("missing_thinker_path");
  if (!emne.generator_constraints || typeof emne.generator_constraints !== "object") gaps.push("missing_generator_constraints");
  if (!list(emne.anti_patterns).length) gaps.push("missing_anti_patterns");
  if (!list(emne.distinguish_from_emner).length || !text(emne.overlap_resolution_note, 20)) gaps.push("missing_overlap_resolution");
  if (!list(emne.historiographical_conflicts).length && !list(emne.conflicts).length) gaps.push("missing_historiographical_conflict");
  if (!emne.requires_temporal_scope && !emne.generator_constraints?.require_temporal_scope && !emne.generator_constraints?.require_chronology_or_temporal_claim) gaps.push("missing_temporal_scope_guard");
  if (!emne.generator_constraints?.require_external_claim_basis) gaps.push("missing_external_claim_guard");
  if (!emne.generator_constraints?.require_critical_distinction) gaps.push("missing_critical_distinction_guard");
  if (emneConceptNoise(emne).length) gaps.push("concept_noise");

  const combined = `${emne.definition || ""} ${emne.why_it_matters || ""}`.toLowerCase();
  const genericPhrases = [
    "som historisk prosess med eksplisitt kildegrunnlag",
    "et historiefaglig begrep brukt til å analysere",
    "gjør det mulig å knytte konkrete steder og hendelser"
  ];
  if (genericPhrases.some((phrase) => combined.includes(phrase))) gaps.push("synthetic_generator_language");
  return { emne_id: emne.emne_id, gaps: [...new Set(gaps)] };
}

function auditDomain(planned) {
  const domain = domainById.get(planned.domain_id);
  if (!domain) {
    return {
      domain_id: planned.domain_id,
      label: planned.label,
      maturity: "planned_only",
      production_complete: false,
      freeze_ready: false,
      counts: { emner: 0, resolved_emner: 0, hooks: 0, methods: 0, mappings: 0, two_lane_mappings: 0, cases: 0, thinkers: 0, norwegian_thinkers: 0 },
      gaps: ["not_in_production_canonical"],
      emne_gaps: []
    };
  }

  const emneIds = list(domain.emne_ids);
  const resolvedEmner = emneIds.map((id) => emneById.get(id)).filter(Boolean);
  const domainMappings = emneIds.map((id) => mappingByEmne.get(id)).filter(Boolean);
  const counts = {
    emner: emneIds.length,
    resolved_emner: resolvedEmner.length,
    hooks: list(domain.hook_ids).length,
    methods: list(domain.method_ids).length,
    mappings: domainMappings.length,
    two_lane_mappings: domainMappings.filter(twoLane).length,
    cases: list(domain.recommended_oslo_cases).length,
    thinkers: list(domain.canonical_thinker_ids).length,
    norwegian_thinkers: list(domain.norwegian_thinker_ids).length
  };

  const f = contract.domain_freeze_contract;
  const productionGaps = [];
  if (domain.status !== f.required_status) productionGaps.push("status_not_complete_revised");
  if (counts.emners < f.min_emner) productionGaps.push("too_few_emner");
  if (counts.resolved_emner !== counts.emner) productionGaps.push("unresolved_emne_references");
  if (counts.hooks < f.min_theory_hooks) productionGaps.push("too_few_hooks");
  if (counts.methods < f.min_methods) productionGaps.push("too_few_methods");
  if (counts.mappings < f.min_mapped_emner) productionGaps.push("too_few_mappings");
  if (counts.cases < f.min_recommended_cases) productionGaps.push("too_few_cases");
  if (counts.thinkers < f.min_canonical_thinkers) productionGaps.push("too_few_thinkers");
  if (counts.norwegian_thinkers < f.min_norwegian_thinkers) productionGaps.push("missing_norwegian_thinker_path");
  if (!fagkartIds.has(domain.domain_id)) productionGaps.push("missing_fagkart_category");

  const productionComplete = productionGaps.length === 0;
  const freezeGaps = [...productionGaps];
  if (!list(domain.domain_chain).length) freezeGaps.push("missing_domain_chain");
  if (!domain.boundary_rules || Object.keys(domain.boundary_rules).length < 3) freezeGaps.push("missing_boundary_rules");
  if (!domain.source_anchor_required) freezeGaps.push("missing_source_anchor_gate");
  if (!domain.external_claim_basis_required) freezeGaps.push("missing_external_claim_gate");
  if (!(domain.source_limitation_required || domain.limitation_required || domain.uncertainty_note_required)) freezeGaps.push("missing_source_limitation_gate");
  if (!domain.critical_distinction_required) freezeGaps.push("missing_critical_distinction_gate");
  if (counts.two_lane_mappings < f.min_mapped_emner) freezeGaps.push("two_lane_mapping_incomplete");
  if (!hasDomainValidator(domain.domain_id)) freezeGaps.push("missing_domain_validator");

  const emneGaps = resolvedEmner.map(auditEmne).filter((item) => item.gaps.length);
  if (emneGaps.length) freezeGaps.push("emne_curation_incomplete");
  const freezeReady = freezeGaps.length === 0;

  return {
    domain_id: domain.domain_id,
    label: domain.label,
    maturity: freezeReady ? "freeze_ready" : productionComplete ? "production_complete" : "production_partial",
    production_complete: productionComplete,
    freeze_ready: freezeReady,
    counts,
    gaps: [...new Set(freezeGaps)],
    emne_gaps: emneGaps
  };
}

const domainResults = list(plan.domains).map(auditDomain);
const maturityCounts = domainResults.reduce((acc, item) => {
  acc[item.maturity] = (acc[item.maturity] || 0) + 1;
  return acc;
}, {});
const allEmneGaps = domainResults.flatMap((item) => item.emne_gaps);
const conceptNoiseCount = allEmneGaps.filter((item) => item.gaps.includes("concept_noise")).length;
const syntheticLanguageCount = allEmneGaps.filter((item) => item.gaps.includes("synthetic_generator_language")).length;

const globalGates = {
  exactly_20_planned_domains: list(plan.domains).length === 20,
  production_domain_ids_unique: domainById.size === list(pensum.domains).length,
  generator_counts_match_production: generatorRules.canonical_inputs?.domain_count === list(pensum.domains).length &&
    generatorRules.canonical_inputs?.emne_count === list(emner).length &&
    generatorRules.canonical_inputs?.method_count === methods.length &&
    generatorRules.canonical_inputs?.mapping_count === list(mappings).length,
  concept_noise_zero: conceptNoiseCount === 0,
  synthetic_generator_language_zero: syntheticLanguageCount === 0,
  typed_curated_theory_registry_present: fs.existsSync(path.join(historyDir, "theory_objects_historie_canonical_v5_5.json")),
  curated_concept_registry_present: fs.existsSync(path.join(historyDir, "concepts_historie_canonical_v5_5.json")),
  all_domains_freeze_ready: domainResults.every((item) => item.freeze_ready)
};

const freezeReady = Object.values(globalGates).every(Boolean);
const report = {
  version: contract.version,
  subject_id: "historie",
  status: freezeReady ? "FREEZE_READY" : "NOT_READY",
  v6_allowed: freezeReady,
  generated_at: new Date().toISOString(),
  authoritative_counts: {
    planned_domains: list(plan.domains).length,
    production_domains: list(pensum.domains).length,
    production_emner: list(emner).length,
    production_methods: methods.length,
    production_mappings: list(mappings).length
  },
  maturity_counts: maturityCounts,
  global_gates: globalGates,
  domains: domainResults
};

if (process.argv.includes("--write")) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, "historie-v5-5-readiness.json"), `${JSON.stringify(report, null, 2)}\n`);
  const summary = [
    `Historie ${contract.version}: ${report.status}`,
    `V6 allowed: ${report.v6_allowed}`,
    `Planned domains: ${report.authoritative_counts.planned_domains}`,
    `Production domains: ${report.authoritative_counts.production_domains}`,
    `Production emner: ${report.authoritative_counts.production_emner}`,
    `Maturity: ${JSON.stringify(report.maturity_counts)}`,
    "",
    ...domainResults.map((item) => `${item.domain_id}: ${item.maturity}${item.gaps.length ? ` | ${item.gaps.join(", ")}` : ""}`)
  ].join("\n");
  fs.writeFileSync(path.join(reportsDir, "validation.txt"), `${summary}\n`);
}

console.log(JSON.stringify(report, null, 2));
if (process.argv.includes("--require-freeze") && !freezeReady) process.exit(1);
