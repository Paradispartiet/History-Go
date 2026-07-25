import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-kilder-curation-v2';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const reportPath = path.join(reportDir, 'kilder-arkiv-spor-curation-audit.json');
const domainId = 'his_kilder_arkiv_spor';

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
  return `${result.stdout || ''}${result.stderr || ''}`;
}

const pensum = readJson('historiepensum_canonical_v4_5.json');
const emner = readJson('emner_historie_canonical_v4_5.json');
const concepts = readJson('concepts_historie_canonical_v5_5.json');
const theories = readJson('theory_objects_historie_canonical_v5_5.json');
const methods = readJson('methods_historie_canonical_v4_5.json');
const mappings = readJson('emnemapping_historie_canonical_v4_5.json');

const domain = pensum.domains.find((item) => item.domain_id === domainId);
if (!domain) throw new Error(`Missing domain ${domainId}`);

const domainEmner = emner.filter((item) => domain.emne_ids.includes(item.emne_id));
const domainConcepts = concepts.filter((item) => (item.domain_ids || []).includes(domainId));
const domainTheories = theories.filter((item) => (item.explanatory_scope || []).includes(domainId));
const methodIds = [...new Set(domainEmner.flatMap((item) => item.method_ids || []))];
const thinkerIds = [...new Set(domainEmner.flatMap((item) => [
  ...(item.canonical_thinker_ids || []),
  ...(item.norwegian_thinker_ids || [])
]))];

const report = {
  generated_at: new Date().toISOString(),
  domain,
  counts: {
    emner: domainEmner.length,
    concepts: domainConcepts.length,
    theories: domainTheories.length,
    methods: methodIds.length,
    thinkers: thinkerIds.length
  },
  emner: domainEmner,
  concepts: domainConcepts,
  theories: domainTheories,
  methods: (methods.methods || methods).filter((item) => methodIds.includes(item.method_id)),
  thinker_ids: thinkerIds,
  mappings: mappings.filter((item) => domain.emne_ids.includes(item.emne_id))
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
fs.rmSync(path.join(root, 'scripts/coordinate-branch-job.mjs'), { force: true });

const runnerReportDir = process.env.RUNNER_REPORT_DIR;
if (runnerReportDir) {
  const excludePath = path.join(root, '.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${runnerReportDir.replaceAll('\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) {
    fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
  }
}

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Audit sources archives and traces curation']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log(`Published ${path.relative(root, reportPath)}`);
