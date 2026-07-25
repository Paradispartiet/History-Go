import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const branch = 'agent/oslo-coordinate-history-quality-kilder-validator';
const timeValidatorPath = 'tools/validate-historie-quality-tid-periodisering.mjs';
const commandLogPath = 'reports/historie-v5/kilder-arkiv-spor-curation-command.log';

let timeValidator = fs.readFileSync(timeValidatorPath, 'utf8');
const oldQueueBlock = `  // Exact queue counts intentionally catch rollback of the first curated domain.\n  check(readiness.quality_issue_totals?.concepts === 785, 'global concept queue reduced to 785');\n  check(readiness.quality_issue_totals?.theories === 190, 'global theory queue reduced to 190');\n  check(readiness.quality_issue_totals?.emner === 0, 'global emne queue remains zero');\n  check(readiness.quality_issue_totals?.domains_not_freeze_ready === 19, '19 domains remain');`;
const newQueueBlock = `  // Upper bounds catch rollback of this domain while allowing later domains to reduce the queue.\n  check(readiness.quality_issue_totals?.concepts <= 785, 'global concept queue does not exceed 785');\n  check(readiness.quality_issue_totals?.theories <= 190, 'global theory queue does not exceed 190');\n  check(readiness.quality_issue_totals?.emner === 0, 'global emne queue remains zero');\n  check(readiness.quality_issue_totals?.domains_not_freeze_ready <= 19, 'at most 19 domains remain');`;
if (!timeValidator.includes(oldQueueBlock)) {
  throw new Error('Time validator queue block was not found exactly.');
}
timeValidator = timeValidator.replace(oldQueueBlock, newQueueBlock);
fs.writeFileSync(timeValidatorPath, timeValidator);
fs.rmSync(commandLogPath, { force: true });

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
}

run(process.execPath, ['tools/validate-historie-quality-tid-periodisering.mjs']);
run(process.execPath, ['tools/validate-historie-quality-kilder-arkiv-spor.mjs']);
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
run('git', ['diff', '--check']);

const reportDir = process.env.RUNNER_REPORT_DIR;
if (reportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  const rule = `/${reportDir.replaceAll('\\', '/')}/`;
  if (!existing.split(/\r?\n/).includes(rule)) {
    fs.appendFileSync(excludePath, `${existing.endsWith('\n') || existing.length === 0 ? '' : '\n'}${rule}\n`);
  }
}

fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Verify source-domain quality freeze']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log('Permanent source-domain quality validator passed.');
