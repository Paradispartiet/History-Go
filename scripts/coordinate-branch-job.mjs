import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-kilder-audit';
const domainId = 'his_kilder_arkiv_spor';
const base = 'data/fag/historie';
const read = (name) => JSON.parse(fs.readFileSync(`${base}/${name}`, 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
const concepts = read('concepts_historie_canonical_v5_5.json');
const emners = read('emner_historie_canonical_v4_5.json');
const pensum = read('historiepensum_canonical_v4_5.json');
const domain = A(pensum.domains).find((item) => item.domain_id === domainId);
const emneIds = new Set(A(domain?.emne_ids));

const lines = ['[CONCEPTS]'];
for (const item of concepts.filter((concept) => A(concept.domain_ids).includes(domainId))) {
  lines.push([
    item.concept_id,
    item.label,
    item.status,
    A(item.domain_ids).join(','),
    A(item.source_emne_ids).filter((id) => emneIds.has(id)).join(',')
  ].join('\t'));
}
lines.push('', '[EMNERS]');
for (const item of emners.filter((emne) => emneIds.has(emne.emne_id))) {
  lines.push([
    item.emne_id,
    item.title,
    `key=${A(item.key_concepts).join(' | ')}`,
    `core=${A(item.core_concepts).join(' | ')}`,
    `sub=${A(item.sub_concepts).join(' | ')}`
  ].join('\t'));
}

const reportPath = 'reports/historie-v5/kilder-arkiv-spor-quality-index.txt';
fs.writeFileSync(reportPath, lines.join('\n') + '\n');
fs.rmSync('scripts/coordinate-branch-job.mjs');

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
}
for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', 'Index source archive quality concepts']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) run(command, args);
console.log(`Published ${reportPath}`);
