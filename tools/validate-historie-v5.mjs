#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const historyDir = path.join(root, "data/fag/historie");
const toolsDir = path.join(root, "tools");
const reportsDir = path.join(root, "reports/historie-v5");

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(historyDir, file), "utf8"));
const plan = readJson("historie_v5_5_domain_plan.json");
const contract = readJson("historie_v5_contract.json");
const pensum = readJson(contract.authoritative_files.pensum);
const emner = readJson(contract.authoritative_files.emner);
const mappings = readJson(contract.authoritative_files.emnemapping);
const methodsFile = readJson(contract.authoritative_files.methods);
const fagkart = readJson(contract.authoritative_files.fagkart);
const generatorRules = readJson(contract.authoritative_files.generator_rules);

const asArray = (value) => Array.isArray(value) ? value : [];
const hasText = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const methodList = asArray(methodsFile.methods);
const productionDomains = new Map(asArray(pensum.domains).map((item) => [item.domain_id, item]));
const emneById = new Map(asArray(emner).map((item) => [item.emne_id, item]));
const mappingByEmne = new Map(asArray(mappings).map((item) => [item.emne_id, item]));
const methodIds = new Set(methodList.map((item) => item.method_id));
const fagkartIds = new Set(asArray(fagkart.categories).map((item) => item.id));
const stopwordConcepts = new Set(["og", "eller", "i", "på", "av", "for", "med", "til"]);
const tools = fs.existsSync(toolsDir) ? fs.readdirSync(toolsDir) : [];

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

function validatorCandidates(domainId) {
  const derived = `validate-historie-${domainId.replace(/^his_/, "").replaceAll("_", "-")}.mjs`;
  return [...new Set([...(validatorAliases[domainId] || []), derived])];
}

function hasDomainValidator(domainId) {
  return validatorCandidates(domainId).some((candidate) => tools.includes(candidate));
}

function domainMappings(domain) {
  return asArray(domain?.emne_ids).map((emneId) => mappingByEmne.get(emneId)).filter(Boolean);
}

function isTwoLane(mapping) {
  const lanes = asArray(mapping?.mappings);
  const tiers = new Set(lanes.map((item) => item.mapping_tier).filter(Boolean));
  return lanes.length >= 2 && tiers.size >= 2;
}

function conceptNoise(emne) {
  const values = [
    ...asArray(emne.core_concepts),
    ...asArray(emne.key_concepts),
    ...asArray(emne.sub_concepts)
  ];
  return values.filter((value) => typeof value === "string" && stopwordConcepts.has(value.trim().toLowerCase()));
}

function emneAudit(emne) {
  const c = contract.emne_freeze_contract;
  const core = asArray(emne.core_concepts).length ? asArray(emne.core_concepts) : asArray(emne.core_concept_ids);
  const sub = asArray(emne.sub_concepts).length ? asArray(emne.sub_concepts) : asArray(emne.sub_concept_ids);
  const cases = asArray(emne.recommended_oslo_cases);
  const thinkerIds = asArray(emne.canonical_thinker_ids);
  const methodRefs = asArray(emne.method_ids);
  const gaps = [];

  if (!hasText(emne.definition, 45)) gaps.push("weak_definition");
  if (!hasText(emne.why_it_matters, 45)) gaps.push("weak_why_it_matters");
  if (core.length < c.min_core_concepts) gaps.push("too_few_core_concepts");
  if (sub.length < c.min_sub_concepts) gaps.push("too_few_sub_concepts");
  if (asArray(emne.key_questions).length < c.min_key_questions) gaps.push("too_few_key_questions");
  if (asArray(emne.analysis_axes).length < c.min_analysis_axes) gaps.push("too_few_analysis_axes");
  if (methodRefs.length < c.min_methods) gaps.push("too_few_methods");
  if (methodRefs.some((id) => !methodIds.has(id))) gaps.push("unknown_method");
  if (cases.length < c.min_cases) gaps.push("too_few_cases");
  if (!thinkerIds.length) gaps.push("missing_thinker_path");
  if (!emne.generator_constraints || typeof emne.generator_constraints !== "object") gaps.push("missing_generator_constraints");
  if (!asArray(emne.anti_patterns).length) gaps.push("missing_anti_patterns");
  if (!asArray(emne.distinguish_from_emner).length || !hasText(emne.overlap_resolution_note, 20)) gaps.push("missing_overlap_resolution");
  if (!asArray(emne.historiographical_conflicts).length && !asArray(emne.conflicts).length) gaps.push("missing_historiographical_conflict");
  if (!emne.requires_temporal_scope && !emne.generator_constraints?.require_temporal_scope && !emne.generator_constraints?.require_chronology_or_temporal_claim) gaps.push("missing_temporal_scope_guard");
  if (!emne.generator_constraints?.require_external_claim_basis) gaps.push("missing_external_claim_guard");
  if (!emne.generator_constraints?.require_critical_distinction) gaps.push("missing_critical_distinction_guard");
  if (conceptNoise(emne).length) gaps.push("concept_noise");

  const genericPhrases = [
    "som historisk prosess med eksplisitt kildegrunnlag",
    "et historiefaglig begrep brukt til å analysere",
    "gjør det mulig å knytte konkrete steder og hendelser"
  ];
  const combined = `${emne.definition || ""} ${emne.why_it_matters || ""}`.toLowerCase();
  if (genericPhrases.some((phrase) => combined.includes(phrase))) gaps.push("synthetic_generator_language");

  return { emne_id: emne.emne_id, gaps: [...new Set(gaps)] };
}

function domainAudit(planDomain) {
  const domain = productionDomains.get(planDomain.domain_id);
  if (!domain) {
    return {
      domain_id: planDomain.domain_id,
      label: planDomain.label,
      maturity: "planned_only",
      production_complete: false,
      freeze_ready: false,
      counts: { emner: 0, hooks: 0, methods: 0, mappings: 0, two_lane_mappings: 0, cases: 0, thinkers: 0, norwegian_thinkers: 0 },
      gaps: ["not_in_production_canonical"],
      emne_gaps: []
    };
  }

  const domainEmneIds = asArray(domain.emne_ids);
  const domainEmner = domainEmneIds.map((id) => emneById.get(id)).filter(Boolean);
  const mapped = domainMappings(domain);
  const twoLane = mapped.filter(isTwoLane);
  const counts = {
    emner: domainEmneIds.length,
    resolved_emner: domainEmners.length,
    hooks: asArray(domain.hook_ids).length,
    methods: asArray(domain.method_ids).length,
    mappings: mapped.length,
    two_lane_mappings: twoLane.length,
    cases: asArray(domain.recommended_oslo_cases).length,
    thinkers: asArray(domain.canonical_thinker_ids).length,
    norwegian_thinkers: asArray(domain.norwegian_thinker_ids).length
  };

  const f = contract.domain_freeze_contract;
  const productionGaps = [];
  if (domain.status !== f.required_status) productionGaps.push("status_not_complete_revised");
  if (counts.emner < f.min_emner) productionGaps.push("too_few_emner");
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
  if (!asArray(domain.domain_chain).length) freezeGaps.push("missing_domain_chain");
  if (!domain.boundary_rules || Object.keys(domain.boundary_rules).length < 3) freezeGaps.push("missing_boundary_rules");
  if (!domain.source_anchor_required) freezeGaps.push("missing_source_anchor_gate");
  if (!domain.external_claim_basis_required) freezeGaps.push("missing_external_claim_gate");
  if (!(domain.source_limitation_required || domain.limitation_required || domain.uncertainty_note_required)) freezeGaps.push("missing_source_limitation_gate");
  if (!domain.critical_distinction_required) freezeGaps.push("missing_critical_distinction_gate");
  if (twoLane.length < f.min_mapped_emner) freezeGaps.push("two_lane_mapping_incomplete");
  if (!hasDomainValidator(domain.domain_id)) freezeGaps.push("missing_domain_validator");

  const emneGaps = domainEmners.map(emneAudit).filter((item) => item.gaps.length);
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

const domainResults = asArray(plan.domains).map(domainAudit);
const stateCounts = domainResults.reduce((acc, item) => {
  acc[item.maturity] = (acc[item.maturity] || 0) + 1;
  return acc;
}, {});
const allEmneAudits = domainResults.flatMap((item) => item.emne_gaps);
const conceptNoiseCount = allEmneAudits.filter((item) => item.gaps.includes("concept_noise")).length;
const syntheticLanguageCount = allEmneAudits.filter((item) => item.gaps.includes("synthetic_generator_language")).length;

const globalGates = {
  exactly_20_planned_domains: asArray(plan.domains).length === 20,
  production_domain_ids_unique: productionDomains.size === asArray(pensum.domains).length,
  generator_counts_match_production: generatorRules.canonical_inputs?.domain_count === asArray(pensum.domains).length &&
    generatorRules.canonical_inputs?.emne_count === asArray(emner).length &&
    generatorRules.canonical_inputs?.method_count === methodList.length &&
    generatorRules.canonical_inputs?.mapping_count === asArray(mappings).length,
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
    planned_domains: asArray(plan.domains).length,
    production_domains: asArray(pensum.domains).length,
    production_emner: asArray(emner).length,
    production_methods: methodList.length,
    production_mappings: asArray(mappings).length
  },
  maturity_counts: stateCounts,
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
