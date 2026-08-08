#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = '2026-08-08';
const p = (relativePath) => path.join(ROOT, relativePath);
const read = (relativePath) => fs.readFileSync(p(relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));
const write = (relativePath, content) => fs.writeFileSync(p(relativePath), content);
const writeJson = (relativePath, value) => write(relativePath, `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function setVersion(document, expected, next, label) {
  assert(document.version === expected, `${label}: forventet versjon ${expected}, fikk ${document.version}`);
  document.version = next;
  document.updatedAt = TODAY;
}

function materializeManifest() {
  const file = 'data/fag/fag_manifest.json';
  const doc = readJson(file);
  assert(doc.psykologi, 'fag_manifest mangler psykologi');
  doc.psykologi.emneMappings = 'psykologi/emnemapping_psykologi_canonical_v4_5.json';
  writeJson(file, doc);
}

function materializePortal() {
  const file = 'data/fagverk/fagverk_portal.json';
  const doc = readJson(file);
  setVersion(doc, '1.10.0', '1.11.0', 'fagverk_portal');
  const row = doc.categories.find((item) => item.id === 'psykologi');
  assert(row, 'fagverk_portal mangler psykologi');
  row.subjectPage = 'fagverk.html?subject=psykologi';
  row.subjectStatus = 'materialized';
  writeJson(file, doc);
}

function materializeInventory() {
  const file = 'data/fagverk/subject_inventory.json';
  const doc = readJson(file);
  setVersion(doc, '1.6.0', '1.7.0', 'subject_inventory');
  const row = doc.subjects.find((item) => item.id === 'psykologi');
  assert(row, 'subject_inventory mangler psykologi');
  row.optionalManifestFields = [...new Set([...row.optionalManifestFields, 'emneMappings'])];
  writeJson(file, doc);
}

function materializeStatus() {
  const file = 'data/fagverk/subject_status.json';
  const doc = readJson(file);
  assert(doc.version === '2.28.0', `subject_status: forventet versjon 2.28.0, fikk ${doc.version}`);
  doc.version = '2.29.0';
  doc.updatedAt = TODAY;
  const row = doc.subjects.find((item) => item.id === 'psykologi');
  assert(row, 'subject_status mangler psykologi');
  Object.assign(row, {
    navigationStatus: 'materialized',
    assessmentStatus: 'audited',
    editorialStatus: 'structure_ready',
    nextGate: 'chapter_production',
    note: 'Psykologi er det tredje individuelt materialiserte Fase 3-faget. Standardadapteren viser seks canonicale fagområder, 58 aktive emner, 58 metoder, 58 normaliserte mappinger og 60 hooks. Alle emner er dekket i pensum, fagkart og mappingregister, alle metodekoblinger er løst, og generatorens canonicale tellinger er synkronisert. Faget beholder eksplisitt vern mot diagnostisering av enkeltpersoner. Redaksjonelle kapitler, claims og kapittelkilder gjenstår.'
  });
  writeJson(file, doc);
}

function materializeRegistry() {
  const file = 'data/fagverk/fagverk_registry.json';
  const doc = readJson(file);
  setVersion(doc, '2.29.0', '2.30.0', 'fagverk_registry');

  const fallback = doc.placePage?.fallbackSubjectByCategory;
  assert(fallback, 'fagverk_registry mangler fallbackSubjectByCategory');
  const nextFallback = {};
  let fallbackInserted = false;
  for (const [key, value] of Object.entries(fallback)) {
    nextFallback[key] = value;
    if (key === 'politikk') {
      nextFallback.psykologi = 'psykologi';
      fallbackInserted = true;
    }
  }
  if (!fallbackInserted) nextFallback.psykologi = 'psykologi';
  doc.placePage.fallbackSubjectByCategory = nextFallback;

  const psychology = {
    title: 'Psykologi',
    description: 'Et sted-, metode- og evidensbasert fagverk om psykisk helse, institusjoner og behandling, fagtradisjoner og teorier om sinnet, utvikling, oppvekst og læring, kognisjon, følelser og atferd, sosialpsykologi, normalitet og stigma samt traume, krise, resiliens og omsorg. Faget undersøker hvordan opplevelse, tenkning, følelse og handling kan studeres gjennom dokumenterte institusjoner, forskningsdesign, behandlingspraksiser og konkrete sosiale situasjoner, og skiller psykologisk analyse fra diagnostisering av enkeltpersoner.',
    canonicalModel: {
      manifest: 'data/fag/fag_manifest.json',
      schemaFamily: 'standard_canonical',
      sourceOfTruth: true,
      note: 'Psykologifagets seks canonicale fagområder eier rendererstrukturen. Alle 58 aktive emner er dekket i pensum, fagkart og mappingregister, med 58 løste metoder og 60 hooks. Ingen kapitler registreres før fulltekst, claims og inspectable kilder er produsert.'
    },
    chapters: []
  };
  const nextSubjects = {};
  let inserted = false;
  for (const [key, value] of Object.entries(doc.subjects || {})) {
    if (key === 'psykologi') continue;
    nextSubjects[key] = value;
    if (key === 'politikk') {
      nextSubjects.psykologi = psychology;
      inserted = true;
    }
  }
  if (!inserted) nextSubjects.psykologi = psychology;
  doc.subjects = nextSubjects;
  writeJson(file, doc);
}

function materializeBadgePage() {
  const file = 'data/fag/psykologi/merke_psykologi (1).html';
  let html = read(file);
  html = html.replace(
    '<a href="merker.html" class="tilbake-knapp">← Til oversikt over merker</a>',
    '<a href="../../../fagverk-forside.html" class="tilbake-knapp">← Til Fagverk-forsiden</a>\n\n    <p class="merke-fagverk-link">\n      <a href="../../../fagverk.html?subject=psykologi">Åpne Psykologi-faget</a>\n      · <a href="../../../fagverk-forside.html">Se alle fagverk</a>\n    </p>'
  );
  assert(html.includes('../../../fagverk.html?subject=psykologi'), 'Psykologi-merkesiden fikk ikke fagsidelenke');
  assert(html.includes('../../../fagverk-forside.html'), 'Psykologi-merkesiden fikk ikke fagverkforside');
  write(file, html);
}

function materializeSubjectInventoryTest() {
  const file = 'tests/fagverk-subject-inventory.test.mjs';
  let source = read(file);
  const oldAudited = "['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','religion','subkultur','vitenskap']";
  const newAudited = "['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','subkultur','vitenskap']";
  const oldStructureReady = "['by','kunst','media','religion','vitenskap']";
  const newStructureReady = "['by','kunst','media','psykologi','religion','vitenskap']";
  assert(source.includes(oldAudited), 'subject-inventory-test: fant ikke audited-listen');
  assert(source.includes(oldStructureReady), 'subject-inventory-test: fant ikke structure_ready-listen');
  source = source.replace(oldAudited, newAudited).replace(oldStructureReady, newStructureReady);
  write(file, source);
}

function materializeGeneralEngineTest() {
  const file = 'tests/fagverk-general-engine.test.mjs';
  let source = read(file);
  const marker = "  const musikk = result.materializedRows.find((row) => row.id === 'musikk');";
  assert(source.includes(marker), 'general-engine-test: fant ikke Musikk-markøren');
  const block = "  const psykologi = result.materializedRows.find((row) => row.id === 'psykologi');\n  assert.ok(psykologi);\n  assert.equal(psykologi.schemaFamily, 'standard_canonical');\n  assert.equal(psykologi.adapter, 'standard');\n  assert.equal(psykologi.domainCount, 6);\n  assert.equal(psykologi.emneCount, 58);\n  assert.equal(psykologi.methodCount, 58);\n  assert.equal(psykologi.mappingCount, 58);\n  assert.equal(psykologi.hookCount, 60);\n  assert.equal(psykologi.chapterCount, 0);\n";
  source = source.replace(marker, `${block}${marker}`);
  write(file, source);
}

function materializeReportsReadme() {
  const file = 'reports/fagverk/README.md';
  let source = read(file);
  const mediaBullet = '- `media-phase3-audit.json` — individuell Fase 3-gate for Media: seks hovedområder, 120 aktive hovedemner, 163 samlede metoder, 120 mappinger og 60 hooks, samt Populærkultur som komplett nested mediefelt med 56 emner uten konkurrerende toppfag.\n';
  const psychBullet = '- `psykologi-phase3-audit.json` — individuell Fase 3-gate for Psykologi: seks canonicale fagområder, 58 aktive emner, 58 metoder, 58 mappinger og 60 hooks, med full emnedekning og eksplisitt vern mot diagnostisering av enkeltpersoner.\n';
  assert(source.includes(mediaBullet), 'reports README: fant ikke Media-bullet');
  source = source.replace(mediaBullet, `${mediaBullet}${psychBullet}`);
  const mediaCommands = 'node scripts/audit-fagverk-media-phase3.mjs --write-report\nnode scripts/audit-fagverk-media-phase3.mjs\n';
  const psychCommands = 'node scripts/audit-fagverk-psykologi-phase3.mjs --write-report\nnode scripts/audit-fagverk-psykologi-phase3.mjs\n';
  assert(source.includes(mediaCommands), 'reports README: fant ikke Media-regenereringskommandoene');
  source = source.replace(mediaCommands, `${mediaCommands}${psychCommands}`);
  write(file, source);
}

materializeManifest();
materializePortal();
materializeInventory();
materializeStatus();
materializeRegistry();
materializeBadgePage();
materializeSubjectInventoryTest();
materializeGeneralEngineTest();
materializeReportsReadme();
console.log('Psykologi Fase 3-kilder materialisert.');
