import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-kilder-audit';
const domainId = 'his_kilder_arkiv_spor';
const base = 'data/fag/historie';
const read = (name) => JSON.parse(fs.readFileSync(`${base}/${name}`, 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
const concepts = read('concepts_historie_canonical_v5_5.json');
const theories = read('theory_objects_historie_canonical_v5_5.json');
const emners = read('emner_historie_canonical_v4_5.json');
const pensum = read('historiepensum_canonical_v4_5.json');
const domain = A(pensum.domains).find((item) => item.domain_id === domainId);
const emneIds = new Set(A(domain?.emne_ids));

const report = {
  domain_id: domainId,
  concepts: concepts
    .filter((item) => A(item.domain_ids).includes(domainId))
    .map((item) => ({
      concept_id: item.concept_id,
      label: item.label,
      concept_type: item.concept_type,
      status: item.status,
      source_emne_ids: item.source_emne_ids,
      domain_ids: item.domain_ids
    })),
  theories: theories
    .filter((item) => A(item.explanatory_scope).includes(domainId))
    .map((item) => ({
      theory_id: item.theory_id,
      label: item.label,
      object_type: item.object_type,
      definition: item.definition,
      source_hook_id: item.source_hook_id,
      method_links: item.method_links,
      thinker_ids: item.thinker_ids,
      limitations: item.limitations,
      status: item.status
    })),
  emners: emners
    .filter((item) => emneIds.has(item.emne_id))
    .map((item) => ({
      emne_id: item.emne_id,
      title: item.title,
      definition: item.definition,
      key_concepts: item.key_concepts,
      core_concepts: item.core_concepts,
      sub_concepts: item.sub_concepts
    }))
};
report.counts = {
  concepts: report.concepts.length,
  theories: report.theories.length,
  emners: report.emners.length,
  already_curated_concepts: report.concepts.filter((item) => item.status === 'canonical_v5_5_curated').length
};

const reportPath = 'reports/historie-v5/kilder-arkiv-spor-quality-objects.json';
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
  ['git', ['commit', '-m', 'Summarize source archive quality objects']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) run(command, args);
console.log(`Published ${reportPath}`);
