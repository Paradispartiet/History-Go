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
const replaceRequired = (value, before, after, label) => {
  assert(value.includes(before), `Mangler forventet tekst for ${label}`);
  return value.replace(before, after);
};
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

const chapterPath = 'data/fagverk/naeringsliv/arbeid-produksjon-verdiskaping.json';
const chapter = readJson(chapterPath);
const chapterId = chapter.id;
const domainId = chapter.primary_domain_id;
const runtimePath = 'data/fag/naeringsliv/naeringsliv_runtime_manifest.json';
const registryPath = 'data/fagverk/fagverk_registry.json';
const statusPath = 'data/fagverk/subject_status.json';

assert(chapterId === 'arbeid-produksjon-verdiskaping', 'Uventet kapittel-ID');
assert(domainId === 'arbeid_produksjon_verdiskaping', 'Uventet fagområde');
assert(chapter.emne_ids.length === 9, 'Kapittelet skal dekke ni emner');
assert(chapter.method_ids.length === 19, 'Kapittelet skal dekke nitten metoder');

const runtime = readJson(runtimePath);
runtime.version = '1.1.0';
runtime.updatedAt = DATE;
runtime.chapterByDomain = runtime.chapterByDomain || {};
runtime.chapterByEmne = runtime.chapterByEmne || {};
runtime.chapterByDomain[domainId] = chapterId;
for (const emneId of chapter.emne_ids) runtime.chapterByEmne[emneId] = chapterId;
writeJson(runtimePath, runtime);

const registry = readJson(registryPath);
registry.version = '2.7.0';
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
status.version = '2.8.0';
status.updatedAt = DATE;
const statusEntry = status.subjects.find((row) => row.id === 'naeringsliv');
assert(statusEntry, 'Statusregisteret mangler naeringsliv');
statusEntry.navigationStatus = 'materialized';
statusEntry.assessmentStatus = 'audited';
statusEntry.editorialStatus = 'chapters_in_progress';
statusEntry.nextGate = 'phase_4_chapters';
statusEntry.note = 'Økonomi og næringsliv har nå 1 av 6 canonicale hovedkapitler ferdig: Arbeid, produksjon og verdiskaping. Kapittelet dekker alle ni emner og nitten metoder i fagområdet gjennom tre redigerte moduler, 40 sporede claims og 20 inspectable kilder. De fem resterende fagområdene står fortsatt uten ferdigskrevne kapitler.';
writeJson(statusPath, status);

const subjectAuditPath = 'scripts/audit-naeringsliv-subject-quality.mjs';
let subjectAudit = read(subjectAuditPath);
subjectAudit = replaceRequired(
  subjectAudit,
  "  assert(Object.keys(runtime.chapterByDomain || {}).length === 0 && Object.keys(runtime.chapterByEmne || {}).length === 0, 'Foundation materialization must not invent chapters');",
  "  const firstDomain = domains.find((row) => row.domain_id === 'arbeid_produksjon_verdiskaping');\n  assert(firstDomain, 'Canonical first domain is missing');\n  assert(runtime.chapterByDomain?.[firstDomain.domain_id] === 'arbeid-produksjon-verdiskaping', 'Runtime is missing the first canonical chapter');\n  for (const emneId of firstDomain.emne_ids || []) assert(runtime.chapterByEmne?.[emneId] === 'arbeid-produksjon-verdiskaping', `Runtime is missing first-chapter emne ${emneId}`);",
  'runtime chapter mapping'
);
subjectAudit = replaceRequired(
  subjectAudit,
  "  assert(statusEntry?.editorialStatus === 'structure_ready', 'Status editorial state must be structure_ready before chapters');",
  "  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'Status editorial state must be chapters_in_progress after the first chapter');",
  'subject editorial status'
);
subjectAudit = replaceRequired(
  subjectAudit,
  "  assert((registry.subjects?.naeringsliv?.chapters || []).length === 0, 'Foundation materialization must not register fictional chapters');",
  "  const registeredChapter = (registry.subjects?.naeringsliv?.chapters || []).find((row) => row.id === 'arbeid-produksjon-verdiskaping');\n  assert(registeredChapter?.file === 'data/fagverk/naeringsliv/arbeid-produksjon-verdiskaping.json', 'Registry is missing the first canonical chapter');",
  'registry chapter mapping'
);
subjectAudit = replaceRequired(subjectAudit, '      registeredChapterCount: 0,', '      registeredChapterCount: (registry.subjects?.naeringsliv?.chapters || []).length,', 'registered chapter count');
subjectAudit = replaceRequired(subjectAudit, '      noInventedChapters: true', '      registeredChapterSynchronized: true', 'chapter gate name');
write(subjectAuditPath, subjectAudit);

const subjectTestPath = 'tests/naeringsliv-subject-quality.test.mjs';
let subjectTest = read(subjectTestPath);
subjectTest = replaceRequired(subjectTest, '  assert.equal(report.summary.registeredChapterCount, 0);', '  assert.equal(report.summary.registeredChapterCount, 1);', 'subject test chapter count');
write(subjectTestPath, subjectTest);

const inventoryTestPath = 'tests/fagverk-subject-inventory.test.mjs';
let inventoryTest = read(inventoryTestPath);
inventoryTest = replaceRequired(
  inventoryTest,
  "for(const id of ['historie','natur','politikk'])",
  "for(const id of ['historie','naeringsliv','natur','politikk'])",
  'inventory chapters-in-progress list'
);
inventoryTest = replaceRequired(
  inventoryTest,
  "for(const id of ['musikk','naeringsliv'])",
  "for(const id of ['musikk'])",
  'inventory structure-ready list'
);
write(inventoryTestPath, inventoryTest);

const readmePath = 'reports/fagverk/README.md';
let readme = read(readmePath);
if (!readme.includes('`naeringsliv-arbeid-produksjon-verdiskaping-audit.json`')) {
  readme = readme.replace(
    '- `naeringsliv-quality-audit.json`',
    '- `naeringsliv-arbeid-produksjon-verdiskaping-audit.json` — deterministisk kapittelgate for ni emner, nitten metoder, tre moduler, 40 claims og 20 inspectable kilder.\n- `naeringsliv-quality-audit.json`'
  );
}
if (!readme.includes('node scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs --write-report')) {
  readme = readme.replace(
    'node scripts/audit-naeringsliv-subject-quality.mjs --write-report',
    'node scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs --write-report\nnode scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs\nnode scripts/audit-naeringsliv-subject-quality.mjs --write-report'
  );
}
readme = readme.replace(
  'Økonomi og næringsliv står `materialized`, `audited` og `structure_ready`. Faget har seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler, samlet 61 læringsenheter. Ingen hovedkapitler er registrert ennå, så neste gate er seks separate kapittelbatcher.',
  'Økonomi og næringsliv står `materialized`, `audited` og `chapters_in_progress`. Faget har seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. Første av seks hovedkapitler er ferdig: **Arbeid, produksjon og verdiskaping**, med ni emner, nitten metoder, tre moduler, 40 sporede claims og 20 inspectable kilder. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler, samlet 61 læringsenheter.'
);
write(readmePath, readme);

run('node', ['scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-naeringsliv-subject-quality.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-general-engine.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs']);
run('node', ['scripts/audit-naeringsliv-subject-quality.mjs']);
run('node', ['scripts/audit-fagverk-general-engine.mjs']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs']);
run('node', ['--test',
  'tests/naeringsliv-chapter-arbeid-produksjon-verdiskaping.test.mjs',
  'tests/naeringsliv-subject-quality.test.mjs',
  'tests/fagverk-general-engine.test.mjs',
  'tests/fagverk-subject-inventory.test.mjs',
  'tests/fagverk-documentation-contract.test.mjs'
]);

fs.rmSync(p('scripts/materialize-naeringsliv-chapter-arbeid-produksjon-verdiskaping-v1.mjs'));
fs.rmSync(p('.github/workflows/temp-materialize-naeringsliv-chapter-arbeid-produksjon-verdiskaping-v1.yml'));
console.log('Materialized first Økonomi og næringsliv chapter and removed bootstrap files.');
