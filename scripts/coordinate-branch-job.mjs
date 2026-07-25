import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-tid-audit';
const domainId = 'his_tid_periodisering';
const base = 'data/fag/historie';
const concepts = JSON.parse(fs.readFileSync(`${base}/concepts_historie_canonical_v5_5.json`, 'utf8'));
const theories = JSON.parse(fs.readFileSync(`${base}/theory_objects_historie_canonical_v5_5.json`, 'utf8'));
const asArray = (value) => Array.isArray(value) ? value : [];

const compact = {
  domain_id: domainId,
  concepts: concepts
    .filter((item) => asArray(item.domain_ids).includes(domainId))
    .map((item) => ({
      concept_id: item.concept_id,
      label: item.label,
      concept_type: item.concept_type,
      source_emne_ids: item.source_emne_ids,
      domain_ids: item.domain_ids
    })),
  theories: theories
    .filter((item) => asArray(item.explanatory_scope).includes(domainId))
    .map((item) => ({
      theory_id: item.theory_id,
      label: item.label,
      source_hook_id: item.source_hook_id,
      definition: item.definition,
      method_links: item.method_links,
      thinker_ids: item.thinker_ids,
      limitations: item.limitations
    }))
};
compact.counts = { concepts: compact.concepts.length, theories: compact.theories.length };

const reportPath = 'reports/historie-v5/tid-periodisering-quality-objects.json';
fs.writeFileSync(reportPath, JSON.stringify(compact, null, 2) + '\n');
fs.rmSync('scripts/coordinate-branch-job.mjs');
fs.rmSync('reports/historie-v5/.quality-audit-trigger', { force: true });

for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', 'Summarize time-domain quality objects']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
}

console.log(`Published ${reportPath}`);
