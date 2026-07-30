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

const chapterPath = 'data/fagverk/naeringsliv/kapital-eierskap-finans.json';
const chapter = readJson(chapterPath);
const chapterId = chapter.id;
const domainId = chapter.primary_domain_id;
const runtimePath = 'data/fag/naeringsliv/naeringsliv_runtime_manifest.json';
const registryPath = 'data/fagverk/fagverk_registry.json';
const statusPath = 'data/fagverk/subject_status.json';

assert(chapterId === 'kapital-eierskap-finans', 'Uventet kapittel-ID');
assert(domainId === 'kapital_eierskap_finans', 'Uventet fagområde');
assert(chapter.emne_ids.length === 9, 'Kapittelet skal dekke ni emner');
assert(chapter.method_ids.length === 14, 'Kapittelet skal dekke fjorten metoder');

const runtime = readJson(runtimePath);
runtime.version = '1.2.0';
runtime.updatedAt = DATE;
runtime.chapterByDomain = runtime.chapterByDomain || {};
runtime.chapterByEmne = runtime.chapterByEmne || {};
runtime.chapterByDomain[domainId] = chapterId;
for (const emneId of chapter.emne_ids) runtime.chapterByEmne[emneId] = chapterId;
writeJson(runtimePath, runtime);

const registry = readJson(registryPath);
registry.version = '2.8.0';
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
status.version = '2.9.0';
status.updatedAt = DATE;
const statusEntry = status.subjects.find((row) => row.id === 'naeringsliv');
assert(statusEntry, 'Statusregisteret mangler naeringsliv');
statusEntry.navigationStatus = 'materialized';
statusEntry.assessmentStatus = 'audited';
statusEntry.editorialStatus = 'chapters_in_progress';
statusEntry.nextGate = 'phase_4_chapters';
statusEntry.note = 'Økonomi og næringsliv har nå 2 av 6 canonicale hovedkapitler ferdig: Arbeid, produksjon og verdiskaping samt Kapital, eierskap og finans. Kapittel 2 dekker alle ni emner og fjorten metoder i fagområdet gjennom tre redigerte moduler, 40 sporede claims og 20 inspectable kilder. Fire fagområder står fortsatt uten ferdigskrevne kapitler.';
writeJson(statusPath, status);

const readmePath = 'reports/fagverk/README.md';
let readme = read(readmePath);
if (!readme.includes('`naeringsliv-kapital-eierskap-finans-audit.json`')) {
  readme = readme.replace(
    '- `naeringsliv-arbeid-produksjon-verdiskaping-audit.json`',
    '- `naeringsliv-kapital-eierskap-finans-audit.json` — deterministisk kapittelgate for ni emner, fjorten metoder, tre moduler, 40 claims og 20 inspectable kilder.\n- `naeringsliv-arbeid-produksjon-verdiskaping-audit.json`'
  );
}
if (!readme.includes('node scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs --write-report')) {
  readme = readme.replace(
    'node scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs --write-report',
    'node scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs --write-report\nnode scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs\nnode scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs --write-report'
  );
}
readme = readme.replace(
  'tests/naeringsliv-subject-quality.test.mjs tests/politikk-subject-quality.test.mjs',
  'tests/naeringsliv-chapter-arbeid-produksjon-verdiskaping.test.mjs tests/naeringsliv-chapter-kapital-eierskap-finans.test.mjs tests/naeringsliv-subject-quality.test.mjs tests/politikk-subject-quality.test.mjs'
);
readme = readme.replace(
  'Økonomi og næringsliv står `materialized`, `audited` og `chapters_in_progress`. Faget har seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. Første av seks hovedkapitler er ferdig: **Arbeid, produksjon og verdiskaping**, med ni emner, nitten metoder, tre moduler, 40 sporede claims og 20 inspectable kilder. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler, samlet 61 læringsenheter.',
  'Økonomi og næringsliv står `materialized`, `audited` og `chapters_in_progress`. Faget har seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. To av seks hovedkapitler er ferdige: **Arbeid, produksjon og verdiskaping**, med ni emner og nitten metoder, og **Kapital, eierskap og finans**, med ni emner og fjorten metoder. Begge har tre redigerte moduler, 40 sporede claims og 20 inspectable kilder. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler, samlet 61 læringsenheter.'
);
write(readmePath, readme);

run('node', ['scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-naeringsliv-subject-quality.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-general-engine.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs']);
run('node', ['scripts/audit-naeringsliv-chapter-kapital-eierskap-finans.mjs']);
run('node', ['scripts/audit-naeringsliv-subject-quality.mjs']);
run('node', ['scripts/audit-fagverk-general-engine.mjs']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs']);
run('node', ['--test',
  'tests/naeringsliv-chapter-arbeid-produksjon-verdiskaping.test.mjs',
  'tests/naeringsliv-chapter-kapital-eierskap-finans.test.mjs',
  'tests/naeringsliv-subject-quality.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-documentation-contract.test.mjs'
]);

fs.rmSync(p('scripts/materialize-naeringsliv-chapter-kapital-eierskap-finans-v1.mjs'));
fs.rmSync(p('.github/workflows/temp-materialize-naeringsliv-chapter-kapital-eierskap-finans-v1.yml'));
console.log('Materialized second Økonomi og næringsliv chapter and removed bootstrap files.');
