#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_middelalder_kirke_kongemakt';
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(historyDir, file), 'utf8'));

const concepts = readJson('concepts_historie_canonical_v5_5.json');
const theories = readJson('theory_objects_historie_canonical_v5_5.json');
const emner = readJson('emner_historie_canonical_v4_5.json');

const conceptRows = concepts
  .filter((item) => item.domain_ids?.includes(domainId))
  .map((item) => ({
    concept_id: item.concept_id,
    label: item.label,
    status: item.status,
    concept_type: item.concept_type,
    definition: item.definition,
    broader_concepts: item.broader_concepts ?? [],
    narrower_concepts: item.narrower_concepts ?? [],
    related_concepts: item.related_concepts ?? [],
    distinguish_from: item.distinguish_from ?? [],
    common_misuse: item.common_misuse ?? [],
    indicators: item.indicators ?? [],
    source_requirements: item.source_requirements ?? [],
    source_emne_ids: item.source_emne_ids ?? [],
    domain_ids: item.domain_ids ?? []
  }));

const theoryRows = theories
  .filter((item) => item.explanatory_scope?.includes(domainId))
  .map((item) => ({
    theory_id: item.theory_id,
    label: item.label,
    status: item.status,
    object_type: item.object_type,
    definition: item.definition,
    limitations: item.limitations ?? [],
    method_links: item.method_links ?? [],
    thinker_ids: item.thinker_ids ?? [],
    source_hook_id: item.source_hook_id,
    explanatory_scope: item.explanatory_scope ?? [],
    evidence_ready: item.evidence_ready
  }));

const emneRows = emner
  .filter((item) => item.domain_id === domainId || item.domain_ids?.includes(domainId) || String(item.emne_id).includes('middelalder'))
  .map((item) => ({ emne_id: item.emne_id, title: item.title, status: item.status }));

const unresolvedConcepts = conceptRows.filter((item) => item.status !== 'canonical_v5_5_curated');
const unresolvedTheories = theoryRows.filter((item) => item.status !== 'canonical_v5_5_curated');
const report = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  counts: {
    concepts: conceptRows.length,
    unresolved_concepts: unresolvedConcepts.length,
    theories: theoryRows.length,
    unresolved_theories: unresolvedTheories.length,
    emner: emneRows.length
  },
  unresolved_concept_ids: unresolvedConcepts.map((item) => item.concept_id),
  unresolved_theory_ids: unresolvedTheories.map((item) => item.theory_id),
  concepts: conceptRows,
  theories: theoryRows,
  emner: emneRows
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'middelalder-kirke-kongemakt-inventory.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.counts));
