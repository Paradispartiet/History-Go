#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { domains, emner, concepts, theories, METHOD_IDS } from "../data/fag/historie/historie_v5_registry.mjs";

const contractPath = path.join(process.cwd(), "data/fag/historie/historie_v5_contract.json");
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const errors = [];
const unique = (values, label) => {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`duplicate ${label}: ${value}`);
    seen.add(value);
  }
};

unique(domains.map((item) => item.domain_id), "domain_id");
unique(emner.map((item) => item.emne_id), "emne_id");
unique(concepts.map((item) => item.concept_id), "concept_id");
unique(theories.map((item) => item.theory_id), "theory_id");

if (domains.length < contract.minimums.domains) errors.push(`domains ${domains.length} < ${contract.minimums.domains}`);
const emneById = new Map(emner.map((item) => [item.emne_id, item]));
const conceptIds = new Set(concepts.map((item) => item.concept_id));
const theoryIds = new Set(theories.map((item) => item.theory_id));
const methodIds = new Set(METHOD_IDS);

for (const domain of domains) {
  if (domain.emne_ids.length < contract.minimums.emner_per_domain) errors.push(`${domain.domain_id}: too few emner`);
  if (domain.concept_ids.length < contract.minimums.concepts_per_domain) errors.push(`${domain.domain_id}: too few concepts`);
  if (domain.method_ids.length < contract.minimums.methods_per_domain) errors.push(`${domain.domain_id}: too few methods`);
  if (domain.theory_object_ids.length < contract.minimums.theories_per_domain) errors.push(`${domain.domain_id}: too few theories`);
  for (const id of domain.emne_ids) if (!emneById.has(id)) errors.push(`${domain.domain_id}: missing emne ${id}`);
  for (const id of domain.concept_ids) if (!conceptIds.has(id)) errors.push(`${domain.domain_id}: missing concept ${id}`);
  for (const id of domain.theory_object_ids) if (!theoryIds.has(id)) errors.push(`${domain.domain_id}: missing theory ${id}`);
  for (const id of domain.method_ids) if (!methodIds.has(id)) errors.push(`${domain.domain_id}: missing method ${id}`);
  if (!domain.historiographical_conflicts?.length) errors.push(`${domain.domain_id}: missing historiography`);
  if (!domain.required_case_scopes?.includes("oslo_og_omegn")) errors.push(`${domain.domain_id}: missing Oslo case scope`);
  if (!domain.required_case_scopes?.includes("international_comparison")) errors.push(`${domain.domain_id}: missing international comparison scope`);
}

for (const emne of emner) {
  for (const id of emne.core_concept_ids || []) if (!conceptIds.has(id)) errors.push(`${emne.emne_id}: missing concept ${id}`);
  for (const id of emne.theory_object_ids || []) if (!theoryIds.has(id)) errors.push(`${emne.emne_id}: missing theory ${id}`);
  for (const id of emne.method_ids || []) if (!methodIds.has(id)) errors.push(`${emne.emne_id}: missing method ${id}`);
  if (!emne.generator_constraints?.require_external_claim_basis) errors.push(`${emne.emne_id}: external claim basis not required`);
  if (!emne.generator_constraints?.require_temporal_scope) errors.push(`${emne.emne_id}: temporal scope not required`);
  if (!emne.progression?.includes("historiography")) errors.push(`${emne.emne_id}: no historiography progression`);
  if (!emne.historiographical_conflicts?.length) errors.push(`${emne.emne_id}: missing historiographical conflict`);
}

for (const concept of concepts) {
  if (!concept.definition || concept.definition.length < 30) errors.push(`${concept.concept_id}: weak definition`);
  if (!concept.common_misuse?.length) errors.push(`${concept.concept_id}: missing misuse guard`);
  if (!concept.domain_ids?.length) errors.push(`${concept.concept_id}: orphan concept`);
}

for (const theory of theories) {
  if (!contract.theory_object_types.includes(theory.object_type)) errors.push(`${theory.theory_id}: invalid object type`);
  if (!theory.limitations?.length) errors.push(`${theory.theory_id}: missing limitations`);
  if (!theory.method_links?.length) errors.push(`${theory.theory_id}: missing method links`);
}

if (errors.length) {
  console.error(`Historie V5 validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(JSON.stringify({ status: "PASS", version: contract.version, domains: domains.length, emner: emner.length, concepts: concepts.length, theories: theories.length, methods: METHOD_IDS.length }, null, 2));
