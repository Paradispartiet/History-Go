import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-kilder-audit';
const domainId = 'his_kilder_arkiv_spor';
const base = 'data/fag/historie';
const read = (name) => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];

const concepts = read('concepts_historie_canonical_v5_5.json');
const theories = read('theory_objects_historie_canonical_v5_5.json');
const emner = read('emner_historie_canonical_v4_5.json');
const mappings = read('emnemapping_historie_canonical_v4_5.json');
const fagkart = read('fagkart_historie_canonical_v4_5.json');
const methodsDoc = read('methods_historie_canonical_v4_5.json');
const pensum = read('historiepensum_canonical_v4_5.json');
const readiness = JSON.parse(fs.readFileSync('reports/historie-v5/historie-v5-5-readiness.json', 'utf8'));

const domain = A(pensum.domains).find((item) => item.domain_id === domainId);
const category = A(fagkart.categories).find((item) => item.id === domainId);
const hookIds = new Set(A(category?.topic_hooks).map((item) => item.id));
const emneIds = new Set(A(domain?.emne_ids));
const domainEmners = emners.filter((item) => emneIds.has(item.emne_id));
const domainMappings = mappings.filter((item) => emneIds.has(item.emne_id));
const domainConcepts = concepts.filter((item) => A(item.domain_ids).includes(domainId));
const domainTheories = theories.filter((item) => A(item.explanatory_scope).includes(domainId) || hookIds.has(item.source_hook_id));
const methodIds = new Set([
  ...A(domain?.method_ids),
  ...A(category?.topic_hooks).flatMap((item) => A(item.recommended_method_ids)),
  ...domainEmners.flatMap((item) => A(item.method_ids)),
  ...domainTheories.flatMap((item) => A(item.method_links))
]);
const domainMethods = A(methodsDoc.methods).filter((item) => methodIds.has(item.method_id));

const genericDefinition = /^I .+ betegner «.+» en historisk avgrenset relasjon, praksis, prosess eller institusjon som må dokumenteres gjennom kilder, tid, sted og aktører\.$/u;
const genericMisuse = /^Å bruke «.+» som en tidløs etikett uten kilde, kronologi eller aktør\.$/u;
const genericTheoryLimitations = new Set([
  'Må brukes med eksplisitt tids-, steds- og kildeavgrensning.',
  'Kan ikke erstatte dokumentert historisk årsaksanalyse eller kontrollkilde.'
]);
const suspiciousSingleWords = new Set([
  'av', 'bare', 'bevart', 'blinde', 'dokumentert', 'etter', 'forskjell', 'gjennom', 'hull',
  'ikke', 'kan', 'manglende', 'materielle', 'med', 'mot', 'muntlige', 'på', 'samme',
  'skriftlige', 'som', 'spor', 'taushet', 'ulike', 'uten', 'visuelle'
]);

const conceptAudit = domainConcepts.map((item) => {
  const relations = [
    ...A(item.broader_concepts),
    ...A(item.narrower_concepts),
    ...A(item.related_concepts),
    ...A(item.distinguish_from)
  ];
  const label = String(item.label ?? '').trim();
  const words = label.split(/\s+/u).filter(Boolean);
  const issues = [
    ...(genericDefinition.test(item.definition ?? '') ? ['synthetic_template_definition'] : []),
    ...(!relations.length ? ['missing_semantic_relations'] : []),
    ...(!A(item.common_misuse).length || A(item.common_misuse).every((value) => genericMisuse.test(value)) ? ['generic_or_missing_misuse_guard'] : []),
    ...(words.length === 1 && suspiciousSingleWords.has(label.toLowerCase()) ? ['lexical_fragment_candidate'] : []),
    ...(/(?:ende|lige|iske)$/u.test(label) && words.length === 1 ? ['adjectival_fragment_candidate'] : [])
  ];
  return { ...item, issues };
});

const theoryAudit = domainTheories.map((item) => ({
  ...item,
  issues: [
    ...(A(item.limitations).length && A(item.limitations).every((value) => genericTheoryLimitations.has(value)) ? ['only_generic_limitations'] : []),
    ...(!A(item.method_links).length ? ['missing_method_links'] : []),
    ...(!A(item.thinker_ids).length ? ['missing_thinker_path'] : []),
    ...(!item.source_hook_id ? ['missing_hook_provenance'] : [])
  ]
}));

const report = {
  schema_version: '1.0',
  generated_from_commit: process.env.GITHUB_SHA ?? null,
  domain_id: domainId,
  counts: {
    emners: domainEmners.length,
    hooks: A(category?.topic_hooks).length,
    concepts: domainConcepts.length,
    theories: domainTheories.length,
    mappings: domainMappings.length,
    methods_referenced: domainMethods.length
  },
  readiness_domain: A(readiness.domains).find((item) => item.domain_id === domainId),
  pensum_domain: domain,
  hooks: A(category?.topic_hooks).map((item) => ({
    id: item.id,
    title: item.title,
    definition: item.definition,
    critical_distinctions: item.critical_distinctions,
    emne_ids: item.emne_ids,
    recommended_method_ids: item.recommended_method_ids,
    thinkers: A(item.canon?.thinkers).map((thinker) => ({ id: thinker.id, name: thinker.name, why: thinker.why }))
  })),
  emners: domainEmners.map((item) => ({
    emne_id: item.emne_id,
    title: item.title,
    definition: item.definition,
    why_it_matters: item.why_it_matters,
    key_concepts: item.key_concepts,
    core_concepts: item.core_concepts,
    sub_concepts: item.sub_concepts,
    key_questions: item.key_questions,
    analysis_axes: item.analysis_axes,
    primary_theory_hooks: item.primary_theory_hooks,
    secondary_theory_hooks: item.secondary_theory_hooks,
    method_ids: item.method_ids,
    canonical_thinker_ids: item.canonical_thinker_ids
  })),
  mappings: domainMappings,
  methods: domainMethods.map((item) => ({
    method_id: item.method_id,
    title: item.title,
    definition: item.definition,
    limitations: item.limitations
  })),
  concepts: conceptAudit,
  theories: theoryAudit,
  summary: {
    concept_issue_counts: conceptAudit.flatMap((item) => item.issues).reduce((acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + 1 }), {}),
    theory_issue_counts: theoryAudit.flatMap((item) => item.issues).reduce((acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + 1 }), {}),
    lexical_fragment_candidates: conceptAudit.filter((item) => item.issues.some((issue) => issue.includes('fragment_candidate'))).map((item) => ({ concept_id: item.concept_id, label: item.label }))
  }
};

const reportPath = 'reports/historie-v5/kilder-arkiv-spor-quality-audit.json';
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
fs.rmSync('scripts/coordinate-branch-job.mjs');

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
}
for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', 'Audit source archive and trace quality freeze']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) run(command, args);
console.log(`Published ${reportPath}`);
