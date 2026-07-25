import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-kilder-curation';
const domainId = 'his_kilder_arkiv_spor';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout || ''}\n${result.stderr || ''}`);
  return result.stdout || '';
}

const pensum = readJson('historiepensum_canonical_v4_5.json');
const emner = readJson('emner_historie_canonical_v4_5.json');
const concepts = readJson('concepts_historie_canonical_v5_5.json');
const theories = readJson('theory_objects_historie_canonical_v5_5.json');
const domain = A(pensum.domains).find((item) => item.domain_id === domainId);
if (!domain) throw new Error(`Missing domain ${domainId}`);

const domainEmners = emner.filter((item) => A(domain.emne_ids).includes(item.emne_id));
const domainConcepts = concepts.filter((item) => A(item.domain_ids).includes(domainId));
const domainTheories = theories.filter((item) => A(item.explanatory_scope).includes(domainId));

const report = {
  generated_at: new Date().toISOString(),
  domain: {
    domain_id: domain.domain_id,
    label: domain.label,
    emne_ids: domain.emne_ids,
    hook_ids: domain.hook_ids,
    method_ids: domain.method_ids,
    canonical_thinker_ids: domain.canonical_thinker_ids,
    norwegian_thinker_ids: domain.norwegian_thinker_ids
  },
  counts: { emner: domainEmners.length, concepts: domainConcepts.length, theories: domainTheories.length },
  concepts: domainConcepts.map((item) => ({
    concept_id: item.concept_id,
    label: item.label,
    concept_type: item.concept_type,
    domain_ids: item.domain_ids,
    source_emne_ids: item.source_emne_ids
  })),
  theories: domainTheories.map((item) => ({
    theory_id: item.theory_id,
    label: item.label,
    object_type: item.object_type,
    definition: item.definition,
    method_links: item.method_links,
    thinker_ids: item.thinker_ids,
    source_hook_id: item.source_hook_id,
    current_limitations: item.limitations
  })),
  emners: domainEmners.map((item) => ({
    emne_id: item.emne_id,
    title: item.title,
    definition: item.definition,
    core_concepts: item.core_concepts,
    sub_concepts: item.sub_concepts,
    method_ids: item.method_ids,
    historiographical_conflicts: item.historiographical_conflicts
  }))
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'kilder-arkiv-spor-curation-object-list.json'), `${JSON.stringify(report, null, 2)}\n`);
const summary = [
  'Historie V5.5 – Kilder, arkiv og spor audit',
  `Emner: ${domainEmners.length}`,
  `Begreper: ${domainConcepts.length}`,
  `Teoriobjekter: ${domainTheories.length}`
].join('\n') + '\n';
fs.writeFileSync(path.join(reportDir, 'kilder-arkiv-spor-curation-audit.txt'), summary);
fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });

const runnerReportDir = process.env.RUNNER_REPORT_DIR;
if (runnerReportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${runnerReportDir.replaceAll('\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Audit source archive and trace concept quality']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log(summary);
