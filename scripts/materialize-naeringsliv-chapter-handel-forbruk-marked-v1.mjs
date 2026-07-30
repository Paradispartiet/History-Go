#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DATE = '2026-07-30';
const p = (relative) => path.join(ROOT, relative);
const read = (relative) => fs.readFileSync(p(relative), 'utf8');
const readJson = (relative) => JSON.parse(read(relative));
const write = (relative, content) => {
  fs.mkdirSync(path.dirname(p(relative)), { recursive: true });
  fs.writeFileSync(p(relative), content);
};
const writeJson = (relative, value) => write(relative, `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

const chapterPath = 'data/fagverk/naeringsliv/handel-forbruk-marked.json';
const chapter = readJson(chapterPath);
const chapterId = chapter.id;
const domainId = chapter.primary_domain_id;
const runtimePath = 'data/fag/naeringsliv/naeringsliv_runtime_manifest.json';
const registryPath = 'data/fagverk/fagverk_registry.json';
const statusPath = 'data/fagverk/subject_status.json';

assert(chapterId === 'handel-forbruk-marked', 'Uventet kapittel-ID');
assert(domainId === 'handel_forbruk_marked', 'Uventet fagområde');
assert(chapter.emne_ids.length === 5, 'Kapittelet skal dekke fem emner');
assert(chapter.method_ids.length === 11, 'Kapittelet skal dekke elleve metoder');

const runtime = readJson(runtimePath);
runtime.version = '1.3.0';
runtime.updatedAt = DATE;
runtime.chapterByDomain = runtime.chapterByDomain || {};
runtime.chapterByEmne = runtime.chapterByEmne || {};
runtime.chapterByDomain[domainId] = chapterId;
for (const emneId of chapter.emne_ids) runtime.chapterByEmne[emneId] = chapterId;
writeJson(runtimePath, runtime);

const registry = readJson(registryPath);
registry.version = '2.9.0';
registry.updatedAt = DATE;
const subject = registry.subjects?.naeringsliv;
assert(subject, 'Registry mangler naeringsliv');
subject.chapters = (subject.chapters || []).filter((row) => row.id !== chapterId);
subject.chapters.push({
  id: chapterId,
  title: chapter.title,
  file: chapterPath,
  primary_domain_id: domainId,
  emne_ids: chapter.emne_ids,
  method_ids: chapter.method_ids,
  moduleFiles: chapter.moduleFiles,
  briefFile: chapter.briefFile,
  claimsFile: chapter.claimsFile,
  editorialStatus: chapter.editorialStatus,
  claimTraceRequired: chapter.claimTraceRequired
});
writeJson(registryPath, registry);

const status = readJson(statusPath);
status.version = '2.10.0';
status.updatedAt = DATE;
const statusEntry = status.subjects.find((row) => row.id === 'naeringsliv');
assert(statusEntry, 'Statusregisteret mangler naeringsliv');
statusEntry.navigationStatus = 'materialized';
statusEntry.assessmentStatus = 'audited';
statusEntry.editorialStatus = 'chapters_in_progress';
statusEntry.nextGate = 'phase_4_chapters';
statusEntry.note = 'Økonomi og næringsliv har nå 3 av 6 canonicale hovedkapitler ferdig: Arbeid, produksjon og verdiskaping; Kapital, eierskap og finans; og Handel, forbruk og marked. Kapittel 3 dekker alle fem emner og elleve metoder i fagområdet gjennom tre redigerte moduler, 54 sporede claims og 25 inspectable kilder. Tre fagområder står fortsatt uten ferdigskrevne kapitler.';
writeJson(statusPath, status);

const readmePath = 'reports/fagverk/README.md';
let readme = read(readmePath);
if (!readme.includes('`naeringsliv-handel-forbruk-marked-audit.json`')) {
  readme = readme.replace(
    '- `naeringsliv-kapital-eierskap-finans-audit.json`',
    '- `naeringsliv-handel-forbruk-marked-audit.json` — deterministisk kapittelgate for fem emner, elleve metoder, tre moduler, 54 claims og 25 inspectable kilder.\n- `naeringsliv-kapital-eierskap-finans-audit.json`'
  );
}
if (!readme.includes('node scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs --write-report')) {
  readme = readme.replace(
    'node scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs --write-report',
    'node scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs --write-report\nnode scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs\nnode scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs --write-report'
  );
}
if (!readme.includes('tests/naeringsliv-chapter-handel-forbruk-marked.test.mjs')) {
  readme = readme.replace(
    'tests/naeringsliv-chapter-kapital-eierskap-finans.test.mjs tests/naeringsliv-subject-quality.test.mjs',
    'tests/naeringsliv-chapter-kapital-eierskap-finans.test.mjs tests/naeringsliv-chapter-handel-forbruk-marked.test.mjs tests/naeringsliv-subject-quality.test.mjs'
  );
}
readme = readme.replace(
  'Økonomi og næringsliv står `materialized`, `audited` og `chapters_in_progress`. Faget har seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. To av seks hovedkapitler er ferdige: **Arbeid, produksjon og verdiskaping**, med ni emner og nitten metoder, og **Kapital, eierskap og finans**, med ni emner og fjorten metoder. Begge har tre redigerte moduler, 40 sporede claims og 20 inspectable kilder. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler, samlet 61 læringsenheter.',
  'Økonomi og næringsliv står `materialized`, `audited` og `chapters_in_progress`. Faget har seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. Tre av seks hovedkapitler er ferdige: **Arbeid, produksjon og verdiskaping**, **Kapital, eierskap og finans** og **Handel, forbruk og marked**. Kapittel 3 dekker fem emner og elleve metoder gjennom tre redigerte moduler, 54 sporede claims og 25 inspectable kilder. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler, samlet 61 læringsenheter.'
);
write(readmePath, readme);

run('node', ['scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-naeringsliv-subject-quality.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-general-engine.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs', '--write-report', '--no-check-report']);
for (const audit of [
  'scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs',
  'scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs',
  'scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs'
]) run('node', [audit]);
run('node', ['scripts/audit-naeringsliv-subject-quality.mjs']);
run('node', ['scripts/audit-fagverk-general-engine.mjs']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs']);
run('node', ['--test',
  'tests/naeringsliv-chapter-arbeid-produksjon-verdiskaping.test.mjs',
  'tests/naeringsliv-chapter-kapital-eierskap-finans.test.mjs',
  'tests/naeringsliv-chapter-handel-forbruk-marked.test.mjs',
  'tests/naeringsliv-subject-quality.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-documentation-contract.test.mjs'
]);

fs.rmSync(p('scripts/materialize-naeringsliv-chapter-handel-forbruk-marked-v1.mjs'));
fs.rmSync(p('.github/workflows/temp-materialize-naeringsliv-chapter-handel-forbruk-marked-v1.yml'));
console.log('Materialized third Økonomi og næringsliv chapter and removed bootstrap files.');
