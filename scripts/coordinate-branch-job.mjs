import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-kilder-curation-v2';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_kilder_arkiv_spor';
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return `${result.stdout || ''}${result.stderr || ''}`;
}

const pensum = readJson('historiepensum_canonical_v4_5.json');
const emner = readJson('emner_historie_canonical_v4_5.json');
const concepts = readJson('concepts_historie_canonical_v5_5.json');
const theories = readJson('theory_objects_historie_canonical_v5_5.json');
const domain = pensum.domains.find((item) => item.domain_id === domainId);
if (!domain) throw new Error(`Missing domain ${domainId}`);

const lines = [];
for (const concept of concepts.filter((item) => (item.domain_ids || []).includes(domainId))) {
  lines.push([
    'CONCEPT',
    concept.concept_id,
    concept.label,
    concept.status,
    (concept.source_emne_ids || []).join(','),
    (concept.domain_ids || []).join(',')
  ].join('|'));
}
for (const theory of theories.filter((item) => (item.explanatory_scope || []).includes(domainId))) {
  lines.push([
    'THEORY',
    theory.theory_id,
    theory.label,
    theory.object_type,
    theory.source_hook_id,
    (theory.method_links || []).join(','),
    (theory.thinker_ids || []).join(','),
    theory.status
  ].join('|'));
}
for (const emne of emner.filter((item) => domain.emne_ids.includes(item.emne_id))) {
  lines.push([
    'EMNE',
    emne.emne_id,
    emne.title,
    [...new Set([...(emne.key_concepts || []), ...(emne.core_concepts || []), ...(emne.sub_concepts || [])])].join(',')
  ].join('|'));
}

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'kilder-arkiv-spor-curation-worklist.txt'), `${lines.join('\n')}\n`);
fs.rmSync(path.join(root, 'scripts/coordinate-branch-job.mjs'), { force: true });

const runnerReportDir = process.env.RUNNER_REPORT_DIR;
if (runnerReportDir) {
  const excludePath = path.join(root, '.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${runnerReportDir.replaceAll('\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Create sources and archives curation worklist']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Published kilder curation worklist.');
