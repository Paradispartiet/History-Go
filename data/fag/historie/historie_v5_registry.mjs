// DEPRECATED V5 scaffold.
//
// This module previously generated 200 generic emner and concepts from title
// tokens and marked every planned domain complete/evidence-ready. Those objects
// were never the production canonical model and must not be used as a source for
// quiz generation, V6 evidence, or maturity reporting.
//
// Authoritative production data lives in:
// - fagkart_historie_canonical_v4_5.json
// - methods_historie_canonical_v4_5.json
// - emner_historie_canonical_v4_5.json
// - emnemapping_historie_canonical_v4_5.json
// - historiepensum_canonical_v4_5.json
//
// The target domain set lives in historie_v5_5_domain_plan.json and is audited
// by tools/validate-historie-v5.mjs.

export const registry = Object.freeze({
  version: "v5.0-synthetic-scaffold-deprecated",
  subject_id: "historie",
  status: "deprecated",
  authoritative: false,
  evidence_ready: false,
  replacement: {
    domain_plan: "historie_v5_5_domain_plan.json",
    readiness_validator: "tools/validate-historie-v5.mjs",
    production_pensum: "historiepensum_canonical_v4_5.json"
  }
});

// Compatibility exports are deliberately empty. Any consumer expecting synthetic
// canonical objects must migrate to the production files instead of silently
// receiving generated filler.
export const DOMAIN_TOPICS = Object.freeze({});
export const METHOD_IDS = Object.freeze([]);
export const THEORY_IDS = Object.freeze([]);
export const THEORY_LABELS = Object.freeze({});
export const domains = Object.freeze([]);
export const emner = Object.freeze([]);
export const concepts = Object.freeze([]);
export const theories = Object.freeze([]);

export function assertHistorieV5RegistryIsAuthoritative() {
  throw new Error(
    "historie_v5_registry.mjs is a deprecated synthetic scaffold. " +
    "Use the production canonical files and the V5.5 readiness validator."
  );
}
