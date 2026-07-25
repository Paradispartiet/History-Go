import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const branch = 'agent/history-medieval-v5-5';
const root = process.cwd();
const reportDir = 'reports/historie-canonical-migration';
const reportPath = `${reportDir}/middelalder-v5-5-structure-audit.json`;

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['fetch', 'origin', 'main']);
run('git', ['rebase', 'origin/main']);

const pensum = readJson('data/fag/historie/historiepensum_canonical_v4_5.json');
const fagkart = readJson('data/fag/historie/fagkart_historie_canonical_v4_5.json');
const emner = readJson('data/fag/historie/emner_historie_canonical_v4_5.json');
const mappings = readJson('data/fag/historie/emnemapping_historie_canonical_v4_5.json');
const methodsFile = readJson('data/fag/historie/methods_historie_canonical_v4_5.json');

const domainId = 'his_middelalder_kirke_kongemakt';
const emneIds = [
  'em_his_kirke_kloster_middelalder',
  'em_his_kongemakt_kirke_konflikt',
  'em_his_middelalder_oslo'
];
const methodIds = [
  'met_sporlesning','met_kildekritikk','met_periodisering','met_diplomatikk','met_paleografi',
  'met_proveniensanalyse','met_rettshistorisk_analyse','met_historisk_gis','met_seriell_kildeanalyse',
  'met_komparativ_historie','met_mikrohistorisk_analyse'
];
const category = fagkart.categories.find((item) => item.id === domainId);
const domain = pensum.domains.find((item) => item.domain_id === domainId);
const selectedEmners = emner.filter((item) => emneIds.includes(item.emne_id));
const selectedMappings = mappings.filter((item) => emneIds.includes(item.emne_id));
const selectedMethods = (methodsFile.methods || []).filter((item) => methodIds.includes(item.method_id));

const report = {
  generated_at: new Date().toISOString(),
  main_head: run('git', ['rev-parse', 'origin/main']).trim(),
  branch_head_after_rebase: run('git', ['rev-parse', 'HEAD']).trim(),
  domain,
  category,
  emners: selectedEmners,
  mappings: selectedMappings,
  methods: selectedMethods,
  schemas: {
    domain_keys: Object.keys(domain || {}),
    category_keys: Object.keys(category || {}),
    emne_keys: [...new Set(selectedEmners.flatMap((item) => Object.keys(item)))],
    mapping_keys: [...new Set(selectedMappings.flatMap((item) => Object.keys(item)))],
    method_keys: [...new Set(selectedMethods.flatMap((item) => Object.keys(item)))]
  }
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });

const runnerReportDir = process.env.RUNNER_REPORT_DIR;
if (runnerReportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${runnerReportDir.replaceAll('\\\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}

run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Audit medieval V5.5 production structure']);
run('git', ['push', '--force-with-lease', 'origin', `HEAD:${branch}`]);
console.log(`Published ${reportPath}`);
