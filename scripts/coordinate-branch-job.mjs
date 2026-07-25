import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-tid-curation';
const historyDir = path.join(root, 'data/fag/historie');
const reportPath = path.join(root, 'reports/historie-v5/tid-periodisering-curation-index.json');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

const domainId = 'his_tid_periodisering';
const pensum = readJson('historiepensum_canonical_v4_5.json');
const emner = readJson('emner_historie_canonical_v4_5.json');
const concepts = readJson('concepts_historie_canonical_v5_5.json');
const theories = readJson('theory_objects_historie_canonical_v5_5.json');
const domain = pensum.domains.find((item) => item.domain_id === domainId);
const domainEmner = emner.filter((item) => domain.emne_ids.includes(item.emne_id));
const domainConcepts = concepts.filter((item) => (item.domain_ids || []).includes(domainId));
const domainTheories = theories.filter((item) => (item.explanatory_scope || []).includes(domainId));

const report = {
  generated_at: new Date().toISOString(),
  concept_schema_keys: Object.keys(domainConcepts[0] || {}),
  theory_schema_keys: Object.keys(domainTheories[0] || {}),
  emne_schema_keys: Object.keys(domainEmner[0] || {}),
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
    source_emne_ids: item.source_emne_ids,
    thinker_ids: item.thinker_ids,
    method_ids: item.method_ids,
    current: item
  })),
  emner: domainEmner.map((item) => ({
    emne_id: item.emne_id,
    title: item.title,
    core_concepts: item.core_concepts,
    sub_concepts: item.sub_concepts,
    concept_model: item.concept_model,
    topic_hook_ids: item.topic_hook_ids,
    method_ids: item.method_ids
  }))
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
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
run('git', ['commit', '-m', 'Index time and periodization curation objects']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Published compact time-domain curation index.');
