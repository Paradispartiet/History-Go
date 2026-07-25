import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-tid-audit';
const domainId = 'his_tid_periodisering';
const base = 'data/fag/historie';
const concepts = JSON.parse(fs.readFileSync(`${base}/concepts_historie_canonical_v5_5.json`, 'utf8'));
const emnerDoc = JSON.parse(fs.readFileSync(`${base}/emner_historie_canonical_v4_5.json`, 'utf8'));
const pensum = JSON.parse(fs.readFileSync(`${base}/historiepensum_canonical_v4_5.json`, 'utf8'));
const asArray = (value) => Array.isArray(value) ? value : [];
const emners = Array.isArray(emnerDoc) ? emnerDoc : asArray(emnerDoc.emner);
const domain = (asArray(pensum.domains).length ? asArray(pensum.domains) : asArray(pensum.modules))
  .find((item) => (item.domain_id ?? item.module_id) === domainId);
const emneIds = new Set(asArray(domain?.emne_ids));

function conceptFields(item) {
  const output = {};
  for (const [key, value] of Object.entries(item ?? {})) {
    if (/concept|begrep/u.test(key)) output[key] = value;
  }
  return output;
}

const domainConcepts = concepts
  .filter((item) => asArray(item.domain_ids).includes(domainId))
  .map((item) => ({
    concept_id: item.concept_id,
    label: item.label,
    source_emne_ids: item.source_emne_ids,
    shared_domain_ids: item.domain_ids
  }));

const report = {
  domain_id: domainId,
  concept_lines: domainConcepts.map((item) => `${item.concept_id}\t${item.label}\t${asArray(item.source_emne_ids).join(',')}\t${asArray(item.shared_domain_ids).join(',')}`),
  emners: emners
    .filter((item) => emneIds.has(item.emne_id))
    .map((item) => ({
      emne_id: item.emne_id,
      title: item.title,
      keys: Object.keys(item),
      concept_fields: conceptFields(item)
    }))
};

const reportPath = 'reports/historie-v5/tid-periodisering-concept-usage.json';
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
fs.rmSync('scripts/coordinate-branch-job.mjs');

for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', 'Map concept usage for time-domain quality freeze']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
}

console.log(`Published ${reportPath}`);
