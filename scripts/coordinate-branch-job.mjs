#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_katastrofer_brudd_ulykker';
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));

const concepts = readJson('concepts_historie_canonical_v5_5.json')
  .filter((item) => item.domain_ids?.includes(domainId))
  .map((item) => ({
    concept_id: item.concept_id,
    label: item.label,
    status: item.status,
    concept_type: item.concept_type,
    domain_ids: item.domain_ids,
    source_emne_ids: item.source_emne_ids
  }));
const theories = readJson('theory_objects_historie_canonical_v5_5.json')
  .filter((item) => item.explanatory_scope?.includes(domainId))
  .map((item) => ({
    theory_id: item.theory_id,
    label: item.label,
    status: item.status,
    object_type: item.object_type,
    source_hook_id: item.source_hook_id,
    method_links: item.method_links,
    thinker_ids: item.thinker_ids
  }));
const emner = readJson('emner_historie_canonical_v4_5.json')
  .filter((item) => item.area_id === domainId)
  .map((item) => ({
    emne_id: item.emne_id,
    title: item.title,
    definition: item.definition,
    analysis_axes: item.analysis_axes,
    canonical_thinkers: item.canonical_thinkers,
    core_concepts: item.core_concepts,
    critical_distinctions: item.critical_distinctions
  }));

const output = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  counts: {concepts: concepts.length, theories: theories.length, emner: emner.length},
  unresolved_concept_ids: concepts.filter((item) => item.status !== 'canonical_v5_5_curated').map((item) => item.concept_id),
  unresolved_theory_ids: theories.filter((item) => item.status !== 'canonical_v5_5_curated').map((item) => item.theory_id),
  concepts,
  theories,
  emner
};

fs.mkdirSync(reportDir, {recursive: true});
const outputPath = path.join(reportDir, 'katastrofer-brudd-ulykker-curation-index.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(JSON.stringify(output.counts));
