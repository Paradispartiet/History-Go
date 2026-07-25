import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-makt-curation';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_makt_stat_institusjoner';
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

const pensum = readJson('historiepensum_canonical_v4_5.json');
const emner = readJson('emner_historie_canonical_v4_5.json');
const concepts = readJson('concepts_historie_canonical_v5_5.json');
const theories = readJson('theory_objects_historie_canonical_v5_5.json');
const mappings = readJson('emnemapping_historie_canonical_v4_5.json');
const domain = pensum.domains.find((item) => item.domain_id === domainId);
if (!domain) throw new Error(`Missing domain ${domainId}`);

const domainEmner = emner.filter((item) => domain.emne_ids.includes(item.emne_id));
const emneIds = new Set(domainEmner.map((item) => item.emne_id));
const domainConcepts = concepts.filter((item) => (item.domain_ids || []).includes(domainId));
const domainTheories = theories.filter((item) => (item.explanatory_scope || []).includes(domainId));
const domainMappings = mappings.filter((item) => emneIds.has(item.emne_id));

const tokenNoise = [...new Set(domainEmner.flatMap((item) => [
  ...(item.core_concepts || []),
  ...(item.sub_concepts || [])
]).filter((term) => /^(og|i|på|av|for|til|med|som|fra|ulike|åpne|lang|lange|tidsmessig|historisk|moderne|statlig|politisk)$/i.test(term)))];

const report = {
  generated_at: new Date().toISOString(),
  domain,
  counts: {
    emner: domainEmner.length,
    concepts: domainConcepts.length,
    theories: domainTheories.length,
    mappings: domainMappings.length
  },
  token_noise: tokenNoise,
  emner: domainEmner.map((item) => ({
    emne_id: item.emne_id,
    title: item.title,
    definition: item.definition,
    core_concepts: item.core_concepts,
    sub_concepts: item.sub_concepts,
    canonical_thinker_ids: item.canonical_thinker_ids,
    norwegian_thinker_ids: item.norwegian_thinker_ids,
    historiographical_conflicts: item.historiographical_conflicts,
    method_ids: item.method_ids,
    distinguish_from_emners: item.distinguish_from_emners,
    overlap_resolution_note: item.overlap_resolution_note
  })),
  concepts: domainConcepts,
  theories: domainTheories,
  mappings: domainMappings
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'makt-stat-institusjoner-curation-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
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
run('git', ['commit', '-m', 'Audit power state and institution concept quality']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Published power, state and institution curation audit.');
