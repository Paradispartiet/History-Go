#!/usr/bin/env node
import fs from 'node:fs';

const file = 'scripts/materialize-vitenskap-university-breadth-v4_6.mjs';
let source = fs.readFileSync(file, 'utf8');

const flat = "const newTopics = spec.families.flatMap((family) => family.topics.map((topic) => ({ ...topic, family })));";
const wrapped = "const newTopics = spec.families.flatMap((family) => family.topics.map((topic) => ({ topic, family })));";
if (source.includes(flat)) source = source.replace(flat, wrapped);
if (!source.includes(wrapped)) throw new Error('Fant ikke forventet topic-family-konstruksjon');

const start = source.indexOf('function buildMapping(topic, family) {');
const end = source.indexOf('\nfunction buildHook(family) {', start);
if (start < 0 || end < 0) throw new Error('Fant ikke buildMapping-blokken');

const replacement = `function buildMapping(topic, family) {
  const domain = pensumDomainById.get(family.target_domain_id);
  const template = mappings.find((row) => (row.mappings || []).some((mapping) => mapping.fagkart_kategori === family.target_domain_id));
  assert(template, \`Mangler mapping-template for \${family.target_domain_id}\`);
  const record = clone(template);
  const sourceMapping = template.mappings.find((mapping) => mapping.fagkart_kategori === family.target_domain_id) || template.mappings[0];
  const primary = clone(sourceMapping);
  record.emne_id = topic.id;
  record.title = topic.title;
  primary.fagkart_kategori = family.target_domain_id;
  primary.fagkart_kategori_tittel = domain.label;
  primary.topic_hook = family.hook.id;
  primary.topic_hook_tittel = family.hook.title;
  primary.mapping_tier = 'primary';
  primary.priority_score = 10;
  primary.tenkere = [];
  primary.thinker_ids = [];
  primary.norwegian_thinker_ids = [];
  primary.norwegian_thinkers = [];
  primary.comparison_pairs = [];
  primary.recommended_oslo_cases = family.hook.recommended_oslo_cases;
  primary.recommended_method_ids = topic.method_ids;
  primary.generator_constraints = {
    ...(primary.generator_constraints || {}),
    require_concrete_institution_method_model_instrument_or_discovery: true,
    require_external_claim_basis: true,
    do_not_generate_from_hook_label_only: true,
    do_not_generate_from_emne_label_only: true,
    required_emne_prefix: 'em_vit_'
  };
  record.mappings = [primary];
  record.mapping_status = 'tiered+canonical';
  record.primary_hooks = [family.hook.id];
  record.secondary_hooks = [];
  record.reserve_hooks = [];
  record.canonical_thinkers = [];
  record.canonical_thinker_ids = [];
  record.norwegian_thinker_ids = [];
  record.norwegian_thinkers = [];
  record.theory_diversity_score = 0;
  record.has_norwegian_theory_path = false;
  record.recommended_oslo_cases = family.hook.recommended_oslo_cases;
  record.recommended_method_ids = topic.method_ids;
  record.canonical_status = 'canonical';
  record.registry_version = 'vitenskappensum_v4_6';
  record.case_gate_required = true;
  record.method_gate_required = true;
  record.source_anchor_required = true;
  record.external_claim_basis_required = true;
  record.institution_method_model_instrument_or_discovery_anchor_required = true;
  record.breadth_reconciliation = {
    coverage_family_id: family.coverage_family_id,
    hook_id: family.hook.id,
    spec_version: spec.version
  };
  return record;
}
`;

source = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(file, source);
console.log('Repaired Vitenskap v4.6 materializer wrapper and tiered mapping builder.');
