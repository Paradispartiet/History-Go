#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportsDir = path.join(root, 'reports/historie-v5');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values)];
const countBy = (items, keyFn) => items.reduce((map, item) => {
  const key = keyFn(item);
  map.set(key, (map.get(key) || 0) + 1);
  return map;
}, new Map());
const issueCounts = (items) => Object.fromEntries(
  [...items.flatMap((item) => item.issues).reduce((map, issue) => {
    map.set(issue, (map.get(issue) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1])
);

const contract = readJson('historie_v5_contract.json');
const pensum = readJson(contract.authoritative_files.pensum);
const emner = readJson(contract.authoritative_files.emner);
const mappings = readJson(contract.authoritative_files.emnemapping);
const methodsFile = readJson(contract.authoritative_files.methods);
const fagkart = readJson(contract.authoritative_files.fagkart);
const generatorRules = readJson(contract.authoritative_files.generator_rules);
const concepts = readJson(contract.authoritative_files.concepts);
const theories = readJson(contract.authoritative_files.theories);
const methods = A(methodsFile.methods);

const structuralErrors = [];
const duplicateIds = (items, key, label) => {
  const seen = new Set();
  for (const item of items) {
    const id = item?.[key];
    if (!id) structuralErrors.push(label + ' missing ' + key);
    else if (seen.has(id)) structuralErrors.push('duplicate ' + label + ': ' + id);
    seen.add(id);
  }
  return seen;
};

const domainIds = duplicateIds(A(pensum.domains), 'domain_id', 'domain');
const emneIds = duplicateIds(emner, 'emne_id', 'emne');
const mappingIds = duplicateIds(mappings, 'emne_id', 'mapping');
const methodIds = duplicateIds(methods, 'method_id', 'method');
const conceptIds = duplicateIds(concepts, 'concept_id', 'concept');
const theoryIds = duplicateIds(theories, 'theory_id', 'theory');
const categoryIds = duplicateIds(A(fagkart.categories), 'id', 'category');
const emneById = new Map(emner.map((item) => [item.emne_id, item]));
const mappingByEmne = new Map(mappings.map((item) => [item.emne_id, item]));

const expected = contract.coverage_counts || contract.counts || {};
for (const [label, actual] of [
  ['domains', domainIds.size],
  ['emner', emneIds.size],
  ['mappings', mappingIds.size],
  ['theory_hooks', A(fagkart.categories).flatMap((item) => A(item.topic_hooks)).length]
]) {
  if (expected[label] !== undefined && actual !== expected[label]) {
    structuralErrors.push(label + ' ' + actual + ' != expected ' + expected[label]);
  }
}

for (const domain of A(pensum.domains)) {
  if (!categoryIds.has(domain.domain_id)) structuralErrors.push(domain.domain_id + ': missing category');
  for (const id of A(domain.emne_ids)) if (!emneIds.has(id)) structuralErrors.push(domain.domain_id + ': missing emne ' + id);
  for (const id of A(domain.method_ids)) if (!methodIds.has(id)) structuralErrors.push(domain.domain_id + ': missing method ' + id);
}
for (const mapping of mappings) {
  if (!emneIds.has(mapping.emne_id)) structuralErrors.push('mapping references unknown emne ' + mapping.emne_id);
}

const genericConceptDefinition = /^I .+ betegner «.+» en historisk avgrenset relasjon, praksis, prosess eller institusjon som må dokumenteres gjennom kilder, tid, sted og aktører\.$/;
const genericConceptMisuse = /^Å bruke «.+» som en tidløs etikett uten kilde, kronologi eller aktør\.$/;
const stopwords = new Set(['og', 'eller', 'i', 'på', 'av', 'for', 'med', 'til', 'fra', 'som']);
const conceptDefinitionCounts = countBy(concepts, (item) => item.definition || '');
const conceptIssues = concepts.map((concept) => {
  const issues = [];
  const label = String(concept.label || '').trim();
  const relations = [
    ...A(concept.broader_concepts),
    ...A(concept.narrower_concepts),
    ...A(concept.related_concepts),
    ...A(concept.distinguish_from)
  ];
  if (!label || stopwords.has(label.toLowerCase())) issues.push('stopword_or_empty_label');
  if (/^\d+$/.test(label) && concept.concept_type === 'analytical_concept') issues.push('numeric_reference_mistyped_as_concept');
  if (/tallets$/i.test(label)) issues.push('lexical_fragment');
  if (genericConceptDefinition.test(concept.definition || '')) issues.push('synthetic_template_definition');
  if (conceptDefinitionCounts.get(concept.definition || '') > 4) issues.push('repeated_definition');
  if (!relations.length) issues.push('missing_semantic_relations');
  if (!A(concept.common_misuse).length || A(concept.common_misuse).every((item) => genericConceptMisuse.test(item))) {
    issues.push('generic_or_missing_misuse_guard');
  }
  if (!A(concept.domain_ids).length || !A(concept.source_emne_ids).length) issues.push('missing_provenance_links');
  return { concept_id: concept.concept_id, label, domain_ids: A(concept.domain_ids), issues: unique(issues) };
}).filter((item) => item.issues.length);

const genericTheoryLimitations = new Set([
  'Må brukes med eksplisitt tids-, steds- og kildeavgrensning.',
  'Kan ikke erstatte dokumentert historisk årsaksanalyse eller kontrollkilde.'
]);
const theoryDefinitionCounts = countBy(theories, (item) => item.definition || '');
const theoryLimitationSignatures = countBy(theories, (item) => JSON.stringify(A(item.limitations).slice().sort()));
const allowedTheoryTypes = new Set(['theory_framework', 'middle_range_model', 'analytical_concept', 'historiographical_tradition']);
const theoryIssues = theories.map((theory) => {
  const issues = [];
  if (!allowedTheoryTypes.has(theory.object_type)) issues.push('invalid_object_type');
  if (!theory.definition || theory.definition.length < 60) issues.push('weak_definition');
  if (theoryDefinitionCounts.get(theory.definition || '') > 2) issues.push('repeated_definition');
  if (!A(theory.method_links).length) issues.push('missing_method_links');
  if (!A(theory.thinker_ids).length) issues.push('missing_thinker_path');
  if (!theory.source_hook_id) issues.push('missing_hook_provenance');
  if (A(theory.limitations).length < 2) issues.push('too_few_limitations');
  if (A(theory.limitations).every((item) => genericTheoryLimitations.has(item))) issues.push('only_generic_limitations');
  if (theoryLimitationSignatures.get(JSON.stringify(A(theory.limitations).slice().sort())) > 20) issues.push('mass_repeated_limitation_profile');
  if (theory.evidence_ready !== false) issues.push('premature_evidence_ready');
  return { theory_id: theory.theory_id, label: theory.label, domain_ids: A(theory.explanatory_scope), issues: unique(issues) };
}).filter((item) => item.issues.length);

const genericEmnePhrases = [
  'som historisk prosess med eksplisitt kildegrunnlag',
  'gjør det mulig å knytte konkrete steder og hendelser',
  'må dokumenteres gjennom kilder, tid, sted og aktører'
];
const emneDefinitionCounts = countBy(emner, (item) => item.definition || '');
const conflictSignatures = countBy(emner, (item) => JSON.stringify(A(item.historiographical_conflicts).slice().sort()));
const emneIssues = emner.map((emne) => {
  const issues = [];
  const definition = String(emne.definition || '');
  const rationale = String(emne.why_it_matters || '');
  const combined = (definition + ' ' + rationale).toLowerCase();
  const core = A(emne.core_concepts).length ? A(emne.core_concepts) : A(emne.core_concept_ids);
  const sub = A(emne.sub_concepts).length ? A(emne.sub_concepts) : A(emne.sub_concept_ids);
  if (definition.length < 80) issues.push('weak_definition');
  if (rationale.length < 80) issues.push('weak_rationale');
  if (emneDefinitionCounts.get(definition) > 2) issues.push('repeated_definition');
  if (genericEmnePhrases.some((phrase) => combined.includes(phrase))) issues.push('synthetic_generator_language');
  if (core.length < 4 || sub.length < 4) issues.push('thin_concept_model');
  if (A(emne.key_questions).length < 3 || A(emne.analysis_axes).length < 3) issues.push('thin_question_or_axis_model');
  if (A(emne.method_ids).length < 2 || A(emne.recommended_oslo_cases).length < 4) issues.push('thin_method_or_case_model');
  if (A(emne.canonical_thinker_ids).length < 4 || A(emne.norwegian_thinker_ids).length < 1) issues.push('thin_thinker_path');
  if (A(emne.anti_patterns).length < 3) issues.push('thin_antipattern_model');
  if (A(emne.distinguish_from_emners).length < 2 || !String(emne.overlap_resolution_note || '').trim()) issues.push('missing_overlap_resolution');
  for (const id of A(emne.distinguish_from_emners)) if (!emneIds.has(id)) issues.push('unknown_overlap_reference');
  if (A(emne.historiographical_conflicts).length < 2) issues.push('thin_historiography');
  if (conflictSignatures.get(JSON.stringify(A(emne.historiographical_conflicts).slice().sort())) > 20) issues.push('mass_repeated_historiography');
  if (!emne.generator_constraints?.require_external_claim_basis || !emne.generator_constraints?.require_temporal_scope || !emne.generator_constraints?.require_critical_distinction) {
    issues.push('missing_generator_gate');
  }
  const mapping = mappingByEmne.get(emne.emne_id);
  const lanes = A(mapping?.mappings);
  if (lanes.length < 2 || new Set(lanes.map((item) => item.mapping_tier)).size < 2) issues.push('missing_two_lane_mapping');
  return { emne_id: emne.emne_id, domain_id: emne.area_id || emne.domain_id, issues: unique(issues) };
}).filter((item) => item.issues.length);

const validators = new Set(fs.readdirSync(path.join(root, 'tools')).filter((name) => name.startsWith('validate-historie-')));
const domainIssues = A(pensum.domains).map((domain) => {
  const issues = [];
  const domainEmneIds = A(domain.emne_ids);
  const category = A(fagkart.categories).find((item) => item.id === domain.domain_id);
  if (domain.status !== 'complete_revised') issues.push('status_not_complete_revised');
  if (domainEmneIds.length !== 10 || A(domain.hook_ids).length !== 10) issues.push('coverage_count_mismatch');
  if (A(domain.method_ids).length < 9 || A(domain.recommended_oslo_cases).length < 6) issues.push('thin_methods_or_cases');
  if (A(domain.canonical_thinker_ids).length < 4 || A(domain.norwegian_thinker_ids).length < 1) issues.push('thin_thinker_path');
  if (!A(domain.domain_chain).length || Object.keys(domain.boundary_rules || {}).length < 3) issues.push('missing_chain_or_boundaries');
  if (!category || A(category.topic_hooks).length !== 10) issues.push('category_hook_mismatch');
  const validatorName = 'validate-historie-' + domain.domain_id.replace(/^his_/, '').replaceAll('_', '-') + '.mjs';
  const aliases = {
    his_industri_arbeid_sosialhistorie: 'validate-historie-industri-arbeid-sosialhistorie.mjs',
    his_minne_kulturarv_historiebruk: 'validate-historie-minne-kulturarv-historiebruk.mjs'
  };
  if (!validators.has(aliases[domain.domain_id] || validatorName)) issues.push('missing_domain_validator');
  const emneGapCount = emneIssues.filter((item) => domainEmneIds.includes(item.emne_id)).length;
  const conceptGapCount = conceptIssues.filter((item) => A(item.domain_ids).includes(domain.domain_id)).length;
  const theoryGapCount = theoryIssues.filter((item) => A(item.domain_ids).includes(domain.domain_id)).length;
  if (emneGapCount) issues.push('emne_quality_incomplete');
  if (conceptGapCount) issues.push('concept_quality_incomplete');
  if (theoryGapCount) issues.push('theory_quality_incomplete');
  return {
    domain_id: domain.domain_id,
    label: domain.label,
    coverage_complete: !issues.some((item) => ['status_not_complete_revised', 'coverage_count_mismatch', 'thin_methods_or_cases', 'thin_thinker_path', 'missing_chain_or_boundaries', 'category_hook_mismatch', 'missing_domain_validator'].includes(item)),
    freeze_ready: issues.length === 0,
    issue_counts: { emner: emneGapCount, concepts: conceptGapCount, theories: theoryGapCount },
    issues: unique(issues)
  };
});

const quality = {
  concept_issue_counts: issueCounts(conceptIssues),
  theory_issue_counts: issueCounts(theoryIssues),
  emne_issue_counts: issueCounts(emneIssues)
};
const globalGates = {
  structural_integrity: structuralErrors.length === 0,
  coverage_counts_match: domainIds.size === 20 && emneIds.size === 200 && mappingIds.size === 200,
  generator_counts_match_production: generatorRules.canonical_inputs?.domain_count === domainIds.size &&
    generatorRules.canonical_inputs?.emne_count === emneIds.size &&
    generatorRules.canonical_inputs?.method_count === methodIds.size &&
    generatorRules.canonical_inputs?.mapping_count === mappingIds.size,
  all_domains_coverage_complete: domainIssues.every((item) => item.coverage_complete),
  concept_registry_curated: conceptIssues.length === 0,
  theory_registry_curated: theoryIssues.length === 0,
  emner_individually_curated: emneIssues.length === 0,
  all_domains_freeze_ready: domainIssues.every((item) => item.freeze_ready)
};
const freezeReady = Object.values(globalGates).every(Boolean);
const report = {
  version: contract.version,
  subject_id: 'historie',
  status: freezeReady ? 'FREEZE_READY' : 'QUALITY_REVIEW_REQUIRED',
  v6_allowed: freezeReady,
  generated_at: new Date().toISOString(),
  coverage_counts: {
    domains: domainIds.size,
    emner: emneIds.size,
    mappings: mappingIds.size,
    methods: methodIds.size,
    concepts: conceptIds.size,
    theories: theoryIds.size
  },
  quality_issue_totals: {
    concepts: conceptIssues.length,
    theories: theoryIssues.length,
    emner: emneIssues.length,
    domains_not_freeze_ready: domainIssues.filter((item) => !item.freeze_ready).length
  },
  global_gates: globalGates,
  quality,
  domains: domainIssues,
  samples: {
    concepts: conceptIssues.slice(0, 25),
    theories: theoryIssues.slice(0, 25),
    emner: emneIssues.slice(0, 25)
  }
};

if (process.argv.includes('--write')) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'historie-v5-5-readiness.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(reportsDir, 'quality-review-queue.json'), JSON.stringify({
    generated_at: report.generated_at,
    concepts: conceptIssues,
    theories: theoryIssues,
    emner: emneIssues,
    domains: domainIssues
  }, null, 2) + '\n');
  const summary = [
    'Historie V5.5 quality gate: ' + report.status,
    'V6 allowed: ' + report.v6_allowed,
    'Coverage: ' + JSON.stringify(report.coverage_counts),
    'Quality issues: ' + JSON.stringify(report.quality_issue_totals),
    'Freeze-ready domains: ' + domainIssues.filter((item) => item.freeze_ready).length + '/20',
    '',
    'Concept issues: ' + JSON.stringify(quality.concept_issue_counts),
    'Theory issues: ' + JSON.stringify(quality.theory_issue_counts),
    'Emne issues: ' + JSON.stringify(quality.emne_issue_counts)
  ].join('\n');
  fs.writeFileSync(path.join(reportsDir, 'validation.txt'), summary + '\n');
}

if (structuralErrors.length) {
  console.error('Historie V5.5 structural validation failed (' + structuralErrors.length + ')');
  for (const error of structuralErrors) console.error('- ' + error);
  process.exit(1);
}
if (process.argv.includes('--require-freeze') && !freezeReady) {
  console.error('Historie V5.5 is not freeze-ready. V6 remains blocked.');
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));
