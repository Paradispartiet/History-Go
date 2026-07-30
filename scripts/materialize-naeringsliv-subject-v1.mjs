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
const insertBefore = (object, beforeKey, key, value) => {
  const output = {};
  let inserted = false;
  for (const [entryKey, entryValue] of Object.entries(object)) {
    if (!inserted && entryKey === beforeKey) {
      output[key] = value;
      inserted = true;
    }
    if (entryKey !== key) output[entryKey] = entryValue;
  }
  if (!inserted) output[key] = value;
  return output;
};

const base = 'data/fag/naeringsliv';
const pensum = readJson(`${base}/naeringslivpensum_canonical_v4_5.json`);
const emners = readJson(`${base}/emner_naeringsliv_canonical_v4_5.json`);
const methodsDocument = readJson(`${base}/methods_naeringsliv_canonical_v4_5.json`);
const mappings = readJson(`${base}/emnemapping_naeringsliv_canonical_v4_5.json`);
const fagkart = readJson(`${base}/fagkart_naeringsliv_canonical_v4_5.json`);
const universityTracks = readJson(`${base}/universitetsspor_okonomi_og_naeringsliv_v1.json`);
const universityMapping = readJson(`${base}/universitetsmapping_okonomi_og_naeringsliv_v1.json`);
const universityQuality = readJson(`${base}/universitetskvalitet_okonomi_og_naeringsliv_v2.json`);
const businessFramework = readJson(`${base}/handelshogskoleramme_okonomi_og_naeringsliv_v1.json`);
const businessTracks = readJson(`${base}/handelshogskolespor_okonomi_og_naeringsliv_v1.json`);
const businessModules = readJson(`${base}/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json`);

const domains = pensum.domains || [];
const coreEmners = emners.filter((row) => row?.emne_role !== 'field_module' && row?.module_type !== 'cross_domain_field_module');
const fieldModules = emners.filter((row) => row?.emne_role === 'field_module' || row?.module_type === 'cross_domain_field_module');
const methods = methodsDocument.methods || [];
const hookCount = (fagkart.categories || []).reduce((sum, category) => sum + (category.topic_hooks || []).length, 0);
const academicTrackIds = Object.keys(universityTracks.tracks || {});
const professionalTrackIds = Object.keys(businessTracks.tracks || {});
const professionalModules = businessModules.modules || [];

assert(domains.length === 6, `Expected 6 domains, got ${domains.length}`);
assert(emners.length === 38, `Expected 38 emners, got ${emners.length}`);
assert(coreEmners.length === 36, `Expected 36 core emners, got ${coreEmners.length}`);
assert(fieldModules.length === 2, `Expected 2 field modules, got ${fieldModules.length}`);
assert(methods.length === 27, `Expected 27 methods, got ${methods.length}`);
assert(mappings.length === 36, `Expected 36 core mappings, got ${mappings.length}`);
assert(hookCount === 60, `Expected 60 hooks, got ${hookCount}`);
assert(academicTrackIds.length === 6, `Expected 6 academic tracks, got ${academicTrackIds.length}`);
assert(professionalTrackIds.length === 5, `Expected 5 professional tracks, got ${professionalTrackIds.length}`);
assert(professionalModules.length === 25, `Expected 25 professional modules, got ${professionalModules.length}`);
assert(businessFramework.relationship_to_university_core?.total_learning_units === 61, 'Expected 61 combined learning units');
assert(universityMapping.core_emne_count === 36, 'University mapping must declare 36 core emners');
assert(universityQuality.individual_revision?.status === 'complete', 'Individual university revision must remain complete');

const runtimeManifestPath = `${base}/naeringsliv_runtime_manifest.json`;
writeJson(runtimeManifestPath, {
  schema: 'history_go_naeringsliv_runtime_manifest_v1',
  version: '1.0.0',
  updatedAt: DATE,
  subjectId: 'naeringsliv',
  displayName: 'Økonomi og næringsliv',
  sourceOfTruth: {
    badge: 'data/badges/naeringsliv.json',
    pensum: `${base}/naeringslivpensum_canonical_v4_5.json`,
    fagkart: `${base}/fagkart_naeringsliv_canonical_v4_5.json`,
    emner: `${base}/emner_naeringsliv_canonical_v4_5.json`,
    methods: `${base}/methods_naeringsliv_canonical_v4_5.json`,
    emnemapping: `${base}/emnemapping_naeringsliv_canonical_v4_5.json`,
    universityFramework: `${base}/universitetsramme_okonomi_og_naeringsliv_v1.json`,
    universityTracks: `${base}/universitetsspor_okonomi_og_naeringsliv_v1.json`,
    universityMapping: `${base}/universitetsmapping_okonomi_og_naeringsliv_v1.json`,
    universityQuality: `${base}/universitetskvalitet_okonomi_og_naeringsliv_v2.json`,
    businessSchoolFramework: `${base}/handelshogskoleramme_okonomi_og_naeringsliv_v1.json`,
    businessSchoolTracks: `${base}/handelshogskolespor_okonomi_og_naeringsliv_v1.json`,
    businessSchoolModules: `${base}/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json`,
    fagverkRegistry: 'data/fagverk/fagverk_registry.json'
  },
  routes: {
    subjectHome: 'data/fag/naeringsliv/merke_naeringsliv (1).html',
    textbook: 'fagverk.html?subject=naeringsliv',
    progress: 'emner.html',
    placePage: 'fagverk-sted.html?place={placeId}'
  },
  canonicalSummary: {
    domainCount: domains.length,
    emneCount: emners.length,
    coreEmneCount: coreEmners.length,
    fieldModuleCount: fieldModules.length,
    methodCount: methods.length,
    mappingCount: mappings.length,
    hookCount,
    academicTrackCount: academicTrackIds.length,
    professionalTrackCount: professionalTrackIds.length,
    professionalModuleCount: professionalModules.length,
    totalLearningUnits: businessFramework.relationship_to_university_core.total_learning_units
  },
  chapterByDomain: {},
  chapterByEmne: {},
  chapterProductionOrder: pensum.domain_order || domains.map((domain) => domain.domain_id)
});

const portalPath = 'data/fagverk/fagverk_portal.json';
const portal = readJson(portalPath);
portal.version = '1.4.0';
portal.updatedAt = DATE;
const portalEntry = portal.categories.find((row) => row.id === 'naeringsliv');
assert(portalEntry, 'Missing naeringsliv portal entry');
portalEntry.subjectPage = 'fagverk.html?subject=naeringsliv';
portalEntry.subjectStatus = 'materialized';
writeJson(portalPath, portal);

const statusPath = 'data/fagverk/subject_status.json';
const status = readJson(statusPath);
status.version = '2.7.0';
status.updatedAt = DATE;
const statusEntry = status.subjects.find((row) => row.id === 'naeringsliv');
assert(statusEntry, 'Missing naeringsliv status entry');
statusEntry.navigationStatus = 'materialized';
statusEntry.assessmentStatus = 'audited';
statusEntry.editorialStatus = 'structure_ready';
statusEntry.nextGate = 'phase_4_chapters';
statusEntry.note = 'Økonomi og næringsliv er strukturelt materialisert fra seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. Universitetslaget har seks akademiske spor og 36 individuelt reviderte kjerneemner. Handelshøgskolelaget har fem profesjonsspor og 25 individuelt fordypede moduler, samlet 61 læringsenheter. Redigerte hovedkapitler gjenstår før faget kan bli chapters_in_progress eller complete.';
writeJson(statusPath, status);

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = readJson(registryPath);
registry.version = '2.6.0';
registry.updatedAt = DATE;
registry.placePage.fallbackSubjectByCategory.naeringsliv = 'naeringsliv';
registry.subjects = insertBefore(registry.subjects, 'natur', 'naeringsliv', {
  title: 'Økonomi og næringsliv',
  description: 'Et sammenhengende læreverk om arbeid, produksjon, kapital, eierskap, finans, handel, forbruk, marked, teknologi, innovasjon, logistikk, regulering og bærekraft, med både universitetsfaglig og profesjonsrettet fordypning.',
  canonicalModel: {
    runtimeManifest: runtimeManifestPath,
    sourceOfTruth: true,
    note: 'Fagområder, emner, metoder, mappings, universitetsutvidelser og handelshøgskolemoduler leses fra canonicale næringslivsdata. Registryet eier bare ferdigskrevne lærekapitler og stedsspesifikk kuratering.'
  },
  chapters: []
});
writeJson(registryPath, registry);

const badgePagePath = 'data/fag/naeringsliv/merke_naeringsliv (1).html';
let badgePage = read(badgePagePath);
if (!badgePage.includes('fagverk.html?subject=naeringsliv')) {
  badgePage = badgePage.replace(
    '  </header>',
    '    <p><a href="../../../fagverk.html?subject=naeringsliv" class="tilbake-knapp">Åpne Fagverket for Økonomi og næringsliv →</a></p>\n  </header>'
  );
}
write(badgePagePath, badgePage);

let readme = read('reports/fagverk/README.md');
if (!readme.includes('`naeringsliv-quality-audit.json`')) {
  readme = readme.replace('- `politikk-quality-audit.json`', '- `naeringsliv-quality-audit.json` — deterministisk materialiserings- og kvalitetsgate for seks fagområder, 38 emner, 27 metoder, 60 hooks, seks akademiske spor og fem profesjonsspor med 25 moduler.\n- `politikk-quality-audit.json`');
}
if (!readme.includes('node scripts/audit-naeringsliv-subject-quality.mjs --write-report')) {
  readme = readme.replace('node scripts/audit-politikk-subject-quality.mjs --write-report', 'node scripts/audit-naeringsliv-subject-quality.mjs --write-report\nnode scripts/audit-naeringsliv-subject-quality.mjs\nnode scripts/audit-politikk-subject-quality.mjs --write-report');
}
readme = readme.replace('tests/natur-universal-coverage.test.mjs tests/politikk-subject-quality.test.mjs', 'tests/natur-universal-coverage.test.mjs tests/naeringsliv-subject-quality.test.mjs tests/politikk-subject-quality.test.mjs');
if (!readme.includes('Økonomi og næringsliv står `materialized`')) {
  readme = readme.replace('Politikk står `materialized`', 'Økonomi og næringsliv står `materialized`, `audited` og `structure_ready`. Faget har seks canonicale fagområder, 38 emner, 27 metoder og 60 hooks. Universitetslaget dekker seks akademiske spor og alle 36 kjerneemnene individuelt; handelshøgskolelaget dekker fem profesjonsspor og 25 moduler, samlet 61 læringsenheter. Ingen hovedkapitler er registrert ennå, så neste gate er seks separate kapittelbatcher.\n\nPolitikk står `materialized`');
}
write('reports/fagverk/README.md', readme);

run('node', ['scripts/audit-naeringsliv-subject-quality.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-general-engine.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs', '--write-report', '--no-check-report']);
run('node', ['scripts/audit-naeringsliv-subject-quality.mjs']);
run('node', ['scripts/audit-fagverk-general-engine.mjs']);
run('node', ['scripts/audit-fagverk-subject-inventory.mjs']);

fs.rmSync(p('scripts/materialize-naeringsliv-subject-v1.mjs'));
fs.rmSync(p('.github/workflows/temp-materialize-naeringsliv-subject-v1.yml'));
console.log('Materialized Økonomi og næringsliv subject foundation and removed bootstrap files.');
