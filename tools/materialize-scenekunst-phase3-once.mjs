#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(at(p), 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(at(p), `${JSON.stringify(value, null, 2)}\n`);
const read = (p) => fs.readFileSync(at(p), 'utf8');
const write = (p, value) => fs.writeFileSync(at(p), value);
const UPDATED_AT = '2026-08-08';

function bumpMinor(version) {
  const parts = String(version || '0.0.0').split('.').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) throw new Error(`Kan ikke bumpe versjon ${version}`);
  return `${parts[0]}.${parts[1] + 1}.0`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function replaceOnce(source, needle, replacement, label) {
  assert(source.includes(needle), `Fant ikke forventet tekst i ${label}`);
  return source.replace(needle, replacement);
}

const portalPath = 'data/fagverk/fagverk_portal.json';
const portal = readJson(portalPath);
portal.version = bumpMinor(portal.version);
portal.updatedAt = UPDATED_AT;
const portalEntry = portal.categories.find((row) => row.id === 'scenekunst');
assert(portalEntry, 'Portalen mangler Scenekunst');
portalEntry.subjectPage = 'fagverk.html?subject=scenekunst';
portalEntry.subjectStatus = 'materialized';
writeJson(portalPath, portal);

const statusPath = 'data/fagverk/subject_status.json';
const status = readJson(statusPath);
status.version = bumpMinor(status.version);
status.updatedAt = UPDATED_AT;
const statusEntry = status.subjects.find((row) => row.id === 'scenekunst');
assert(statusEntry, 'Statusregisteret mangler Scenekunst');
Object.assign(statusEntry, {
  navigationStatus: 'materialized',
  assessmentStatus: 'audited',
  editorialStatus: 'structure_ready',
  nextGate: 'chapter_production',
  note: 'Scenekunst er det fjerde individuelt materialiserte Fase 3-faget. Foundation v1-adapteren viser fire fagkart-eide fagområder, åtte aktive emner, ni canonicale metoder, åtte normaliserte mappinger og null canonicale hooks. De tre pensummodulene bevares som progresjonslag og blir ikke parallelle renderer-fagområder. Teater, dans, musikkteater, live-humor, produksjon og publikum behandles som levende fremføring forankret i dokumenterte forestillinger eller sceneinstitusjoner. Redaksjonelle kapitler, claims og kapittelkilder gjenstår.'
});
writeJson(statusPath, status);

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = readJson(registryPath);
registry.version = bumpMinor(registry.version);
registry.updatedAt = UPDATED_AT;
registry.placePage ||= {};
registry.placePage.fallbackSubjectByCategory ||= {};
registry.placePage.fallbackSubjectByCategory.scenekunst = 'scenekunst';
registry.subjects ||= {};
registry.subjects.scenekunst = {
  title: 'Scenekunst',
  description: 'Et forestillings-, institusjons- og produksjonsbasert fagverk om teater, dans, musikkteater, revy, standup, improvisasjon og andre levende sceneformer. Faget undersøker hvordan dramaturgi, rollefortolkning, regi, scenografi, lys, kostyme, koreografi, produksjonsarbeid, repertoar og publikum skaper scenekunst i konkrete forestillinger og sceneinstitusjoner.',
  canonicalModel: {
    manifest: 'data/fag/fag_manifest.json',
    schemaFamily: 'foundation_v1',
    sourceOfTruth: true,
    note: 'Scenekunstfagets fire fagkart-eide områder eier rendererstrukturen. De tre pensummodulene er progresjonslag, ikke parallelle fagområder. Alle åtte aktive emner og ni canonicale metoder løses gjennom foundation v1-adapteren. Ingen kapitler registreres før fulltekst, claims og inspectable kilder er produsert.'
  },
  chapters: []
};
writeJson(registryPath, registry);

const badgePagePath = 'data/fag/scenekunst/merke_scenekunst.html';
write(badgePagePath, `<!DOCTYPE html>\n<html lang="no">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>History Go – Scenekunst</title>\n  <link rel="stylesheet" href="../../../merker/merker.css">\n</head>\n<body class="merke-oversikt-side">\n  <main class="merke-main">\n    <header class="merke-header">\n      <img src="../../../bilder/merker/scenekunst.svg" alt="Scenekunst" style="width:120px;height:120px;object-fit:contain">\n      <h1>Scenekunst</h1>\n      <p>Teater, dans, musikal, revy, standup, improvisasjon, scenografi, regi, dramaturgi og levende fremføring.</p>\n    </header>\n    <p>\n      <a href="../../../fagverk.html?subject=scenekunst">Åpne Scenekunst-faget</a>\n      · <a href="../../../fagverk-forside.html">Se alle fagverk</a>\n      · <a href="../../../merker/merker.html">Tilbake til alle merker</a>\n    </p>\n  </main>\n</body>\n</html>\n`);

const inventoryTestPath = 'tests/fagverk-subject-inventory.test.mjs';
let inventoryTest = read(inventoryTestPath);
inventoryTest = replaceOnce(
  inventoryTest,
  "['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','subkultur','vitenskap']",
  "['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','scenekunst','subkultur','vitenskap']",
  inventoryTestPath
);
inventoryTest = replaceOnce(
  inventoryTest,
  "['by','kunst','media','psykologi','religion','vitenskap']",
  "['by','kunst','media','psykologi','religion','scenekunst','vitenskap']",
  inventoryTestPath
);
write(inventoryTestPath, inventoryTest);

const generalTestPath = 'tests/fagverk-general-engine.test.mjs';
let generalTest = read(generalTestPath);
const religionBlock = `  const religion = result.materializedRows.find((row) => row.id === 'religion');\n  assert.ok(religion);\n  assert.equal(religion.schemaFamily, 'foundation_v1');\n  assert.equal(religion.adapter, 'standard');\n  assert.equal(religion.domainCount, 4);\n  assert.equal(religion.emneCount, 8);\n  assert.equal(religion.methodCount, 8);\n  assert.equal(religion.chapterCount, 0);\n`;
const scenekunstBlock = `${religionBlock}  const scenekunst = result.materializedRows.find((row) => row.id === 'scenekunst');\n  assert.ok(scenekunst);\n  assert.equal(scenekunst.schemaFamily, 'foundation_v1');\n  assert.equal(scenekunst.adapter, 'standard');\n  assert.equal(scenekunst.domainCount, 4);\n  assert.equal(scenekunst.emneCount, 8);\n  assert.equal(scenekunst.methodCount, 9);\n  assert.equal(scenekunst.mappingCount, 8);\n  assert.equal(scenekunst.hookCount, 0);\n  assert.equal(scenekunst.chapterCount, 0);\n`;
generalTest = replaceOnce(generalTest, religionBlock, scenekunstBlock, generalTestPath);
write(generalTestPath, generalTest);

const readmePath = 'reports/fagverk/README.md';
let readme = read(readmePath);
const reportLine = '- `scenekunst-phase3-audit.json` — individuell Fase 3-gate for Scenekunst som `foundation_v1`: fire fagkart-eide fagområder, åtte aktive emner, ni canonicale metoder, åtte mappinger, null syntetiske hooks og tre pensummoduler som separat progresjonslag.\n';
if (!readme.includes('scenekunst-phase3-audit.json')) {
  const marker = readme.split('\n').find((line) => line.includes('religion-pilot-audit.json'));
  assert(marker, 'README mangler Religion-rapportmarkør');
  readme = readme.replace(`${marker}\n`, `${marker}\n${reportLine}`);
}
if (!readme.includes('audit-fagverk-scenekunst-phase3.mjs --write-report')) {
  const commandMarker = 'node scripts/audit-fagverk-religion-pilot.mjs\n';
  assert(readme.includes(commandMarker), 'README mangler Religion-regenereringskommando');
  readme = readme.replace(commandMarker, `${commandMarker}node scripts/audit-fagverk-scenekunst-phase3.mjs --write-report\nnode scripts/audit-fagverk-scenekunst-phase3.mjs\n`);
}
write(readmePath, readme);

function node(args) {
  execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });
}

node(['scripts/audit-fagverk-subject-inventory.mjs', '--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs', '--write-report']);
node(['scripts/audit-fagverk-scenekunst-phase3.mjs', '--write-report', '--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);

node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-scenekunst-phase3.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs', '--check']);
node(['--test', 'tests/fagverk-subject-inventory.test.mjs']);
node(['--test', 'tests/fagverk-general-engine.test.mjs']);
node(['--test', 'tests/fagverk-scenekunst-phase3.test.mjs']);
node(['--test', 'tests/fagverk-release-manifest.test.mjs']);

console.log('Scenekunst Fase 3 materialisert og validert.');
