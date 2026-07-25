import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-miljo-curation';
const domainId = 'his_miljo_klima_landskap';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(historyDir, name), 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout || ''}\n${result.stderr || ''}`);
  return result.stdout || '';
}
const concepts = readJson('concepts_historie_canonical_v5_5.json')
  .filter((item) => A(item.domain_ids).includes(domainId))
  .sort((a, b) => a.label.localeCompare(b.label, 'nb'));
const theories = readJson('theory_objects_historie_canonical_v5_5.json')
  .filter((item) => A(item.explanatory_scope).includes(domainId))
  .sort((a, b) => a.theory_id.localeCompare(b.theory_id));
const emner = readJson('emner_historie_canonical_v4_5.json')
  .filter((item) => item.area_id === domainId)
  .sort((a, b) => a.emne_id.localeCompare(b.emne_id));
const lines = [
  '# concepts',
  ...concepts.map((item) => `${item.concept_id}\t${item.label}\t${item.concept_type}`),
  '', '# theories',
  ...theories.map((item) => `${item.theory_id}\t${item.label}\t${item.object_type}\t${item.definition}`),
  '', '# emner',
  ...emner.map((item) => `${item.emne_id}\t${item.title}\tCORE=${A(item.core_concepts).join('|')}\tSUB=${A(item.sub_concepts).join('|')}`)
];
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'miljo-klima-landskap-curation-labels.txt'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(reportDir, 'miljo-klima-landskap-curation-audit.txt'), [
  'Historie V5.5 – Miljø-, klima- og landskapshistorie audit',
  `Emner: ${emner.length}`,
  `Begreper: ${concepts.length}`,
  `Teoriobjekter: ${theories.length}`
].join('\n') + '\n');
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
run('git', ['commit', '-m', 'Audit environment climate and landscape curation objects']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log(`Saved ${concepts.length} concepts, ${theories.length} theories and ${emner.length} emner.`);
