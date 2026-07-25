#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const domainId = 'his_kilder_arkiv_spor';
const historyDir = 'data/fag/historie';
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values)];

const concepts = readJson(historyDir + '/concepts_historie_canonical_v5_5.json');
const theories = readJson(historyDir + '/theory_objects_historie_canonical_v5_5.json');
const emners = readJson(historyDir + '/emner_historie_canonical_v4_5.json');
const pensum = readJson(historyDir + '/historiepensum_canonical_v4_5.json');
const curationResult = readJson('reports/historie-v5/kilder-arkiv-spor-curation-result.json');

const failures = [];
const check = (condition, label) => {
  if (condition) console.log(`PASS | ${label}`);
  else failures.push(label);
};

const genericConceptDefinition = /^I .+ betegner «.+» en historisk avgrenset relasjon, praksis, prosess eller institusjon som må dokumenteres gjennom kilder, tid, sted og aktører\.$/u;
const genericConceptMisuse = /^Å bruke «.+» som en tidløs etikett uten kilde, kronologi eller aktør\.$/u;
const genericTheoryLimitations = new Set([
  'Må brukes med eksplisitt tids-, steds- og kildeavgrensning.',
  'Kan ikke erstatte dokumentert historisk årsaksanalyse eller kontrollkilde.'
]);
const allowedTheoryTypes = new Set([
  'theory_framework',
  'middle_range_model',
  'analytical_concept',
  'historiographical_tradition'
]);
const staleLabels = [
  'arkiver',
  'begrensning',
  'bygninger',
  'claim_basis',
  'finnes',
  'fortsatt',
  'funksjoner',
  'gjør',
  'grunnspørsmål',
  'historiefagets',
  'hvem',
  'ikke',
  'kildene',
  'kilder',
  'manglende',
  'materialer',
  'noen',
  'ødelagt',
  'rester',
  'samler',
  'serielle',
  'tapte',
  'tidligere',
  'utelatt',
  'viktig',
  'visuelle',
  'være'
];

const domain = A(pensum.domains).find((item) => item.domain_id === domainId);
const domainEmneIds = A(domain?.emne_ids);
const domainEmners = emners.filter((item) => domainEmneIds.includes(item.emne_id));
const domainConcepts = concepts.filter((item) => A(item.domain_ids).includes(domainId));
const domainTheories = theories.filter((item) => A(item.explanatory_scope).includes(domainId));
const conceptIds = new Set(concepts.map((item) => item.concept_id));
const curatedResultItems = A(curationResult.renamed_labels);
const curatedResultById = new Map(curatedResultItems.map((item) => [item.concept_id, item]));
const curatedResultIds = new Set(curatedResultById.keys());

check(Boolean(domain), 'domain exists');
check(domain?.status === 'complete_revised', 'domain remains complete_revised');
check(domainEmners.length === 10, '10 domain emners');
check(domainConcepts.length === 68, '68 domain concepts');
check(domainTheories.length === 10, '10 domain theories');
check(curationResult.status === 'CURATED_FREEZE_READY', 'curation result is freeze-ready');
check(curationResult.concepts_curated === 64, 'curation result concept count');
check(curationResult.theories_curated === 10, 'curation result theory count');
check(curationResult.emner_corrected === 10, 'curation result emne count');
check(curatedResultItems.length === 64, '64 individually curated concept records');
check(curatedResultIds.size === 64, 'curated concept ids are unique');
check(new Set(curatedResultItems.map((item) => item.label)).size === 64, 'curated concept labels are unique');
check(curationResult.global_v6_allowed === false, 'curation result keeps V6 blocked');

const curatedDefinitionSet = new Set();
for (const concept of domainConcepts) {
  const prefix = concept.concept_id;
  const relations = unique([
    ...A(concept.broader_concepts),
    ...A(concept.narrower_concepts),
    ...A(concept.related_concepts),
    ...A(concept.distinguish_from)
  ]);
  check(concept.status === 'canonical_v5_5_curated', `${prefix}: curated status`);
  check(relations.length >= 2, `${prefix}: semantic relations`);
  check(relations.every((id) => conceptIds.has(id)), `${prefix}: relation targets exist`);
  check(A(concept.domain_ids).length >= 1 && A(concept.source_emne_ids).length >= 1, `${prefix}: provenance links`);

  if (curatedResultIds.has(prefix)) {
    curatedDefinitionSet.add(concept.definition);
    check(concept.label === curatedResultById.get(prefix)?.label, `${prefix}: result label matches canonical object`);
    check(typeof concept.definition === 'string' && concept.definition.length >= 60 && !genericConceptDefinition.test(concept.definition), `${prefix}: specific definition`);
    check(A(concept.common_misuse).length >= 1 && !A(concept.common_misuse).every((item) => genericConceptMisuse.test(item)), `${prefix}: specific misuse guard`);
  }
}
check(curatedDefinitionSet.size === 64, '64 distinct curated concept definitions');

const theoryDefinitionSet = new Set();
const limitationSignatures = new Set();
for (const theory of domainTheories) {
  const prefix = theory.theory_id;
  theoryDefinitionSet.add(theory.definition);
  limitationSignatures.add(JSON.stringify(A(theory.limitations).slice().sort()));
  check(theory.status === 'canonical_v5_5_curated', `${prefix}: curated status`);
  check(allowedTheoryTypes.has(theory.object_type), `${prefix}: typed object`);
  check(typeof theory.definition === 'string' && theory.definition.length >= 60, `${prefix}: specific definition`);
  check(A(theory.limitations).length >= 2 && A(theory.limitations).every((item) => !genericTheoryLimitations.has(item)), `${prefix}: theory-specific limitations`);
  check(A(theory.method_links).length >= 1, `${prefix}: method links`);
  check(A(theory.thinker_ids).length >= 1, `${prefix}: thinker links`);
  check(Boolean(theory.source_hook_id), `${prefix}: hook provenance`);
  check(theory.evidence_ready === false, `${prefix}: evidence gate remains closed`);
}
check(theoryDefinitionSet.size === 10, '10 distinct theory definitions');
check(limitationSignatures.size === 10, '10 distinct theory limitation profiles');

for (const emne of domainEmners) {
  const values = [
    ...A(emne.key_concepts),
    ...A(emne.core_concepts),
    ...A(emne.sub_concepts)
  ];
  check(staleLabels.every((label) => !values.includes(label)), `${emne.emne_id}: no stale concept labels`);
}

check(!fs.existsSync('reports/historie-v5/kilder-arkiv-spor-curation-command.log'), 'temporary command log is absent');
check(fs.existsSync('reports/historie-v5/kilder-arkiv-spor-curation-validation.txt'), 'curation validation report exists');

const globalRun = spawnSync(process.execPath, ['tools/validate-historie-v5.mjs'], {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});
check(globalRun.status === 0, 'global V5.5 validator executes');
let readiness = null;
try {
  readiness = JSON.parse(globalRun.stdout);
} catch {
  failures.push('global V5.5 validator returned parseable JSON');
}
if (readiness) {
  const domainReadiness = A(readiness.domains).find((item) => item.domain_id === domainId);
  check(domainReadiness?.freeze_ready === true, 'source domain is freeze-ready');
  check(domainReadiness?.issue_counts?.emner === 0, 'source domain has zero emne issues');
  check(domainReadiness?.issue_counts?.concepts === 0, 'source domain has zero concept issues');
  check(domainReadiness?.issue_counts?.theories === 0, 'source domain has zero theory issues');

  // Upper bounds catch rollback of this domain while allowing later domains to reduce the queue.
  check(readiness.quality_issue_totals?.concepts <= 721, 'global concept queue does not exceed 721');
  check(readiness.quality_issue_totals?.theories <= 180, 'global theory queue does not exceed 180');
  check(readiness.quality_issue_totals?.emner === 0, 'global emne queue remains zero');
  check(readiness.quality_issue_totals?.domains_not_freeze_ready <= 18, 'at most 18 domains remain');
  check(readiness.v6_allowed === false, 'V6 remains blocked');
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL | ${failure}`);
  console.error(`RESULT | ${failures.length} FAIL`);
  process.exit(1);
}
console.log('RESULT | Kilder, arkiv og spor quality freeze PASS');
