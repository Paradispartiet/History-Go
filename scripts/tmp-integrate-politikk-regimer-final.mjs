#!/usr/bin/env node
import fs from 'node:fs';

const paths = {
  chapter: 'data/fagverk/politikk/regimer-og-institusjoner.json',
  registry: 'data/fagverk/fagverk_registry.json',
  runtime: 'data/fag/politikk/politikk_runtime_manifest.json',
  status: 'data/fagverk/subject_status.json',
  readme: 'reports/fagverk/README.md',
  inventoryTest: 'tests/fagverk-subject-inventory.test.mjs'
};
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const bumpMinor = (version) => {
  const match = String(version || '1.0.0').match(/^(\d+)\.(\d+)\.(\d+)$/);
  return match ? `${match[1]}.${Number(match[2]) + 1}.0` : '1.0.0';
};

const chapter = readJson(paths.chapter);
const registry = readJson(paths.registry);
const politics = registry.subjects?.politikk;
if (!politics || !Array.isArray(politics.chapters)) throw new Error('Politikk mangler kapittelregister');
const entry = {
  id: chapter.chapter_id,
  title: chapter.title,
  subtitle: chapter.subtitle,
  file: paths.chapter,
  primary_domain_id: chapter.primary_domain_id,
  emne_ids: chapter.emne_ids
};
politics.chapters = [...politics.chapters.filter((item) => item.id !== entry.id), entry];
registry.version = bumpMinor(registry.version);
registry.updatedAt = '2026-07-29';
writeJson(paths.registry, registry);

const runtime = readJson(paths.runtime);
runtime.updatedAt = '2026-07-29';
runtime.chapterByDomain = { ...(runtime.chapterByDomain || {}), [chapter.primary_domain_id]: chapter.chapter_id };
runtime.chapterByEmne = { ...(runtime.chapterByEmne || {}) };
for (const emneId of chapter.emne_ids) runtime.chapterByEmne[emneId] = chapter.chapter_id;
writeJson(paths.runtime, runtime);

const status = readJson(paths.status);
const row = status.subjects?.find((item) => item.id === 'politikk');
if (!row) throw new Error('Politikk mangler i subject_status.json');
row.navigationStatus = 'materialized';
row.assessmentStatus = 'audited';
row.editorialStatus = 'chapters_in_progress';
row.nextGate = 'phase_4_chapters';
row.note = 'Politikk har tre registrerte lærekapitler. Regimer og institusjoner er det første kapittelet produsert med egen brief, påstandsregister, 29 sporede claims og permanent kapittelaudit; 10 av 13 fagområder mangler fortsatt fullverdig hovedkapittel.';
status.version = bumpMinor(status.version);
status.updatedAt = '2026-07-29';
writeJson(paths.status, status);

let readme = fs.readFileSync(paths.readme, 'utf8');
const bullet = '- `politikk-regimer-institusjoner-audit.json` — kapittelgate for 15 emner, 16 metoder, tre redigerte moduler, 29 sporede claims og 16 inspectable kilder.\n';
if (!readme.includes('politikk-regimer-institusjoner-audit.json')) {
  const anchor = '- `politikk-thinker-integrity-audit.json`';
  const index = readme.indexOf(anchor);
  if (index >= 0) {
    const end = readme.indexOf('\n', index);
    readme = `${readme.slice(0, end + 1)}${bullet}${readme.slice(end + 1)}`;
  } else {
    readme += `\n${bullet}`;
  }
}
const statusLine = 'Politikk står nå `materialized`, `audited` og `chapters_in_progress`: tre av tretten fagområder har registrerte kapitler, mens ti fortsatt mangler fullverdig hovedkapittel. Regimer og institusjoner er det første Politikk-kapittelet med egen brief, påstandsregister og permanent kapittelaudit.';
if (!readme.includes(statusLine)) readme += `\n${statusLine}\n`;
fs.writeFileSync(paths.readme, readme);

let inventoryTest = fs.readFileSync(paths.inventoryTest, 'utf8');
inventoryTest = inventoryTest.replace("s.subjects.find(x=>x.id==='politikk').editorialStatus,'structure_ready'", "s.subjects.find(x=>x.id==='politikk').editorialStatus,'chapters_in_progress'");
fs.writeFileSync(paths.inventoryTest, inventoryTest);

console.log('Integrerte Politikk-kapittelet oppå nyeste Historie- og Natur-status.');
