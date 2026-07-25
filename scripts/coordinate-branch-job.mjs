import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-tid-audit';
const domainId = 'his_tid_periodisering';
const base = 'data/fag/historie';
const read = (name) => JSON.parse(fs.readFileSync(`${base}/${name}`, 'utf8'));

const concepts = read('concepts_historie_canonical_v5_5.json');
const theories = read('theory_objects_historie_canonical_v5_5.json');
const emnerDoc = read('emner_historie_canonical_v4_5.json');
const mappingDoc = read('emnemapping_historie_canonical_v4_5.json');
const fagkart = read('fagkart_historie_canonical_v4_5.json');
const methodsDoc = read('methods_historie_canonical_v4_5.json');
const pensum = read('historiepensum_canonical_v4_5.json');
const readiness = JSON.parse(fs.readFileSync('reports/historie-v5/historie-v5-5-readiness.json', 'utf8'));

const asArray = (v) => Array.isArray(v) ? v : [];
const emners = Array.isArray(emnerDoc) ? emnerDoc : asArray(emnerDoc.emner);
const mappings = Array.isArray(mappingDoc) ? mappingDoc : asArray(mappingDoc.mappings ?? mappingDoc.emnemappings);
const methods = asArray(methodsDoc.methods);
const categories = asArray(fagkart.categories);
const domain = categories.find((item) => item.id === domainId);
const hooks = asArray(domain?.topic_hooks);
const hookIds = new Set(hooks.map((item) => item.id));
const domainEmneIds = new Set([
  ...asArray(domain?.emne_ids),
  ...hooks.flatMap((hook) => asArray(hook.emne_ids))
]);
const domainEmners = emners.filter((item) => domainEmneIds.has(item.emne_id));
const domainMappings = mappings.filter((item) => domainEmneIds.has(item.emne_id));
const domainConcepts = concepts.filter((item) => asArray(item.domain_ids).includes(domainId));
const domainTheories = theories.filter((item) => asArray(item.explanatory_scope).includes(domainId) || hookIds.has(item.source_hook_id));
const methodIds = new Set([
  ...hooks.flatMap((hook) => asArray(hook.recommended_method_ids)),
  ...domainEmners.flatMap((emne) => asArray(emne.method_ids ?? emne.methods)),
  ...domainTheories.flatMap((theory) => asArray(theory.method_links)),
  ...domainMappings.flatMap((mapping) => asArray(mapping.method_ids ?? mapping.methods))
]);
const domainMethods = methods.filter((item) => methodIds.has(item.method_id));
const pensumDomains = asArray(pensum.domains).length ? asArray(pensum.domains) : asArray(pensum.modules);
const pensumDomain = pensumDomains.find((item) => (item.domain_id ?? item.module_id) === domainId);

const templateDefinition = /betegner «.+» en historisk avgrenset relasjon, praksis, prosess eller institusjon/u;
const genericMisuse = /som en tidløs etikett uten kilde, kronologi eller aktør/u;
const genericLimitations = new Set([
  'Må brukes med eksplisitt tids-, steds- og kildeavgrensning.',
  'Kan ikke erstatte dokumentert historisk årsaksanalyse eller kontrollkilde.'
]);

const conceptAudit = domainConcepts.map((item) => ({
  concept_id: item.concept_id,
  label: item.label,
  source_emne_ids: item.source_emne_ids,
  concept_type: item.concept_type,
  issues: [
    ...(templateDefinition.test(item.definition ?? '') ? ['synthetic_template_definition'] : []),
    ...(!asArray(item.broader_concepts).length && !asArray(item.narrower_concepts).length && !asArray(item.related_concepts).length && !asArray(item.distinguish_from).length ? ['missing_semantic_relations'] : []),
    ...(asArray(item.common_misuse).some((value) => genericMisuse.test(value)) ? ['generic_misuse_guard'] : []),
    ...(/^\d{3,4}$/u.test(item.label ?? '') ? ['numeric_reference'] : []),
    ...(/(?:tallets|århundrets)$/u.test(item.label ?? '') ? ['lexical_fragment'] : [])
  ],
  object: item
}));

const theoryAudit = domainTheories.map((item) => ({
  theory_id: item.theory_id,
  label: item.label,
  source_hook_id: item.source_hook_id,
  issues: [
    ...(asArray(item.limitations).length && asArray(item.limitations).every((value) => genericLimitations.has(value)) ? ['generic_limitations_only'] : []),
    ...(!asArray(item.method_links).length ? ['missing_method_links'] : []),
    ...(!asArray(item.thinker_ids).length ? ['missing_thinker_links'] : [])
  ],
  object: item
}));

const report = {
  schema_version: '1.0',
  generated_from_commit: process.env.GITHUB_SHA ?? null,
  domain_id: domainId,
  counts: {
    emners: domainEmners.length,
    hooks: hooks.length,
    concepts: domainConcepts.length,
    theories: domainTheories.length,
    mappings: domainMappings.length,
    methods_referenced: domainMethods.length
  },
  readiness_domain: asArray(readiness.domains).find((item) => item.domain_id === domainId),
  pensum_domain: pensumDomain,
  fagkart_domain: domain,
  emners: domainEmners,
  mappings: domainMappings,
  methods: domainMethods,
  concept_audit: conceptAudit,
  theory_audit: theoryAudit,
  summary: {
    concept_issue_counts: conceptAudit.flatMap((item) => item.issues).reduce((acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + 1 }), {}),
    theory_issue_counts: theoryAudit.flatMap((item) => item.issues).reduce((acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + 1 }), {})
  }
};

const reportPath = 'reports/historie-v5/tid-periodisering-quality-audit.json';
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
fs.rmSync('scripts/coordinate-branch-job.mjs');

for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', 'Audit Historie quality freeze for time and periodization']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
}

console.log(`Published ${reportPath}`);
