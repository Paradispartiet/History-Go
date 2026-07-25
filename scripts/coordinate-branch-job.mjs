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

const compact = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  emner: emner
    .filter((item) => domain.emne_ids.includes(item.emne_id))
    .map((item) => ({
      emne_id: item.emne_id,
      title: item.title,
      definition: item.definition,
      key_concepts: item.key_concepts,
      core_concepts: item.core_concepts,
      sub_concepts: item.sub_concepts,
      primary_theory_hooks: item.primary_theory_hooks,
      secondary_theory_hooks: item.secondary_theory_hooks,
      method_ids: item.method_ids,
      canonical_thinker_ids: item.canonical_thinker_ids,
      norwegian_thinker_ids: item.norwegian_thinker_ids,
      source_method_profile: item.source_method_profile,
      historiographical_conflicts: item.historiographical_conflicts
    })),
  concepts: concepts
    .filter((item) => (item.domain_ids || []).includes(domainId))
    .map((item) => ({
      concept_id: item.concept_id,
      label: item.label,
      status: item.status,
      definition: item.definition,
      broader_concepts: item.broader_concepts,
      narrower_concepts: item.narrower_concepts,
      related_concepts: item.related_concepts,
      distinguish_from: item.distinguish_from,
      common_misuse: item.common_misuse,
      source_emne_ids: item.source_emne_ids,
      domain_ids: item.domain_ids
    })),
  theories: theories
    .filter((item) => (item.explanatory_scope || []).includes(domainId))
    .map((item) => ({
      theory_id: item.theory_id,
      label: item.label,
      object_type: item.object_type,
      definition: item.definition,
      limitations: item.limitations,
      method_links: item.method_links,
      thinker_ids: item.thinker_ids,
      source_hook_id: item.source_hook_id,
      evidence_ready: item.evidence_ready,
      status: item.status
    }))
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'kilder-arkiv-spor-curation-compact.json'), `${JSON.stringify(compact, null, 2)}\n`);
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
run('git', ['commit', '-m', 'Create compact sources and archives curation extract']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Published compact kilder curation extract.');
