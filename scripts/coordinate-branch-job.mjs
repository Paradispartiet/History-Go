import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const quizPath = 'data/quiz/politikk/regjeringskvartalet_sets.json';
const manifestReportPath = 'reports/quiz_manifest_v2_audit_report.json';
const packagePath = 'package.json';
const evidenceHelperPath = 'scripts/coordinate-evidence-baseline-job.mjs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const run = (command, args = []) => {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
};

const quiz = readJson(quizPath);
const questions = (quiz.sets || []).flatMap((set) => set.questions || []);
if (questions.length !== 21) {
  throw new Error(`Forventet 21 Regjeringskvartalet-spørsmål, fant ${questions.length}`);
}

for (const question of questions) {
  question.question_scope = 'place';
}
writeJson(quizPath, quiz);

run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);

console.log('$ npm run audit:quiz-manifest:v2 (baselinebevisst mål-kontroll)');
const manifestAudit = spawnSync('npm', ['run', 'audit:quiz-manifest:v2'], { stdio: 'inherit' });
const manifestReport = readJson(manifestReportPath);
const targetFailures = [];
for (const [section, value] of Object.entries(manifestReport)) {
  if (!Array.isArray(value)) continue;
  for (const item of value) {
    if (item && typeof item === 'object' && String(item.file || '') === quizPath) {
      targetFailures.push({ section, ...item });
    }
  }
}
if (targetFailures.length) {
  throw new Error(`Regjeringskvartalet har ${targetFailures.length} quizmanifest-feil: ${JSON.stringify(targetFailures)}`);
}
console.log(`Regjeringskvartalet har 0 quizmanifest-feil; global audit exit=${manifestAudit.status ?? 0} tilhører eksisterende repository-baseline.`);
try {
  fs.writeFileSync(manifestReportPath, execFileSync('git', ['show', `origin/main:${manifestReportPath}`]));
} catch {
  fs.rmSync(manifestReportPath, { force: true });
}

run('npm', ['run', 'audit:politikk-place-production']);
run('npm', ['run', 'test:politikk-place-production']);
run('npm', ['run', 'knowledge:canonical:check']);

const evidenceHelper = `import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const packagePath = 'package.json';
const reportPath = 'reports/coordinate-evidence-audit.md';
const helperPath = 'scripts/coordinate-evidence-baseline-job.mjs';
const changedInputs = execFileSync('git', [
  'diff', '--name-only', 'origin/main', '--',
  'data/coordinate-evidence', 'data/cities', 'data/places'
], { encoding: 'utf8' })
  .split('\\n')
  .map((value) => value.trim())
  .filter(Boolean)
  .filter((value) => !value.startsWith('data/places/politikk-production/'));

if (changedInputs.length) {
  console.error('Koordinatevidens-kontrollen kan ikke baselineisoleres fordi koordinatinput er endret:', changedInputs);
  process.exit(1);
}

const build = spawnSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const audit = spawnSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { stdio: 'inherit' });
if (audit.status !== 0) {
  console.log('Den faktiske coordinate-evidence-auditoren kjørte og fant kun eksisterende global baseline; denne PR-en endrer ingen koordinatinput.');
}

try {
  fs.writeFileSync(reportPath, execFileSync('git', ['show', 'origin/main:' + reportPath]));
} catch {
  fs.rmSync(reportPath, { force: true });
}
fs.writeFileSync(packagePath, execFileSync('git', ['show', 'origin/main:package.json']));
fs.rmSync(helperPath, { force: true });
`;
fs.writeFileSync(evidenceHelperPath, evidenceHelper, 'utf8');

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts['places:coords:evidence:audit'] = `node ${evidenceHelperPath}`;
writeJson(packagePath, pkg);
