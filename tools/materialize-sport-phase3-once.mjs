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
function assert(condition, message) { if (!condition) throw new Error(message); }
function replaceOnce(source, needle, replacement, label) {
  assert(source.includes(needle), `Fant ikke forventet tekst i ${label}`);
  return source.replace(needle, replacement);
}

const manifestPath = 'data/fag/fag_manifest.json';
const manifest = readJson(manifestPath);
assert(manifest.sport, 'Manifestet mangler Sport');
manifest.sport.emneMappings = 'sport/emnemapping_sport_canonical_v4_5.json';
writeJson(manifestPath, manifest);

const inventoryPath = 'data/fagverk/subject_inventory.json';
const inventory = readJson(inventoryPath);
inventory.version = bumpMinor(inventory.version);
inventory.updatedAt = UPDATED_AT;
const inventoryEntry = inventory.subjects.find((row) => row.id === 'sport');
assert(inventoryEntry, 'Inventaret mangler Sport');
inventoryEntry.optionalManifestFields = [...new Set([...(inventoryEntry.optionalManifestFields || []), 'emneMappings'])];
writeJson(inventoryPath, inventory);

const portalPath = 'data/fagverk/fagverk_portal.json';
const portal = readJson(portalPath);
portal.version = bumpMinor(portal.version);
portal.updatedAt = UPDATED_AT;
const portalEntry = portal.categories.find((row) => row.id === 'sport');
assert(portalEntry, 'Portalen mangler Sport');
portalEntry.subjectPage = 'fagverk.html?subject=sport';
portalEntry.subjectStatus = 'materialized';
writeJson(portalPath, portal);

const statusPath = 'data/fagverk/subject_status.json';
const status = readJson(statusPath);
status.version = bumpMinor(status.version);
status.updatedAt = UPDATED_AT;
const statusEntry = status.subjects.find((row) => row.id === 'sport');
assert(statusEntry, 'Statusregisteret mangler Sport');
Object.assign(statusEntry, {
  navigationStatus: 'materialized',
  assessmentStatus: 'audited',
  editorialStatus: 'structure_ready',
  nextGate: 'chapter_production',
  note: 'Sport er det femte individuelt materialiserte Fase 3-faget. Standardadapteren viser seks canonicale fagområder, 116 aktive emner, 109 metoder, 116 normaliserte mappinger og 60 hooks. Alle emner er dekket i pensum, fagkart og mappingregister, alle metodekoblinger er løst, generatorens canonicale tellinger er synkronisert, og de eksisterende Knowledge-kontraktene er bevart. Groundhopper beholdes som eksplisitt stedlig idrettslogikk. Redaksjonelle kapitler registreres ikke før fulltekst, claims og inspectable kilder er produsert.'
});
writeJson(statusPath, status);

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = readJson(registryPath);
registry.version = bumpMinor(registry.version);
registry.updatedAt = UPDATED_AT;
registry.placePage ||= {};
registry.placePage.fallbackSubjectByCategory ||= {};
registry.placePage.fallbackSubjectByCategory.sport = 'sport';
registry.subjects ||= {};
registry.subjects.sport = {
  title: 'Sport & lek',
  description: 'Et arena-, praksis- og kildebasert fagverk om sport, lek, konkurranse, trening, kropp, klubber, frivillighet, supporterkultur, folkehelse og stedlig idrettshukommelse. Faget undersøker hvordan regler, prestasjon, lag, arenaer, publikum og tilgang former idrettslige erfaringer gjennom konkrete stadioner, baner, haller, løkker, klubber, kamper, trening, rekorder og dokumenterte aktiviteter.',
  canonicalModel: {
    manifest: 'data/fag/fag_manifest.json',
    schemaFamily: 'standard_canonical',
    sourceOfTruth: true,
    note: 'Sports seks canonicale fagområder eier rendererstrukturen. Alle 116 aktive emner er integrert i pensum, fagkart og det eksplisitte mappingregisteret; 109 metoder og 60 hooks er løst uten syntetiske fagområder. Knowledge-kontraktene og Groundhopper-logikken bevares. Ingen kapitler registreres før fulltekst, claims og inspectable kilder er produsert.'
  },
  chapters: []
};
writeJson(registryPath, registry);

const badgePath = 'data/fag/sport/merke_sport.html';
let badge = read(badgePath);
if (!badge.includes('../../../fagverk.html?subject=sport')) {
  badge = replaceOnce(
    badge,
    '  <main class="merke-main">\n',
    '  <main class="merke-main">\n    <p class="merke-fagverk-lenker"><a href="../../../fagverk.html?subject=sport">Åpne Sport-faget</a> · <a href="../../../fagverk-forside.html">Se alle fagverk</a></p>\n',
    badgePath
  );
}
write(badgePath, badge);

const corePath = 'js/fagverk-subject-core.js';
let core = read(corePath);
const rawEmneNeedle = `    const rawEmners = Array.isArray(source.emners) ? source.emners : list(source.emners?.emners);\n    const methods = normalizeMethods(source.methods || {});`;
const rawEmneReplacement = `    const sourceRawEmners = Array.isArray(source.emners) ? source.emners : list(source.emners?.emners);\n    // Standard-canonical fag med eksplisitt emnemapping bruker pensumdomenene som autoritativt aktivt emnesett.\n    // Rå emnekataloger kan dermed bevare legacy-/paraplyrader uten at de materialiseres som aktive emner.\n    const domainOwnedEmneIds = new Set(rawDomainCandidates(adapter, pensum, fagkart).flatMap(candidateEmneIds));\n    const rawEmners = adapter === 'standard' && text(input?.manifestEntry?.emneMappings) && domainOwnedEmneIds.size\n      ? sourceRawEmners.filter((emne) => domainOwnedEmneIds.has(firstText(emne?.emne_id, emne?.id)))\n      : sourceRawEmners;\n    const methods = normalizeMethods(source.methods || {});`;
core = replaceOnce(core, rawEmneNeedle, rawEmneReplacement, corePath);
write(corePath, core);

const inventoryTestPath = 'tests/fagverk-subject-inventory.test.mjs';
let inventoryTest = read(inventoryTestPath);
inventoryTest = replaceOnce(
  inventoryTest,
  "['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','scenekunst','subkultur','vitenskap']",
  "['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','scenekunst','sport','subkultur','vitenskap']",
  inventoryTestPath
);
inventoryTest = replaceOnce(
  inventoryTest,
  "['by','kunst','media','psykologi','religion','scenekunst','vitenskap']",
  "['by','kunst','media','psykologi','religion','scenekunst','sport','vitenskap']",
  inventoryTestPath
);
write(inventoryTestPath, inventoryTest);

const generalTestPath = 'tests/fagverk-general-engine.test.mjs';
let generalTest = read(generalTestPath);
const marker = `  assert.equal(scenekunst.chapterCount, 0);\n`;
assert(generalTest.includes(marker), 'General-engine-test mangler Scenekunst-markør');
const sportBlock = `${marker}  const sport = result.materializedRows.find((row) => row.id === 'sport');\n  assert.ok(sport);\n  assert.equal(sport.schemaFamily, 'standard_canonical');\n  assert.equal(sport.adapter, 'standard');\n  assert.equal(sport.domainCount, 6);\n  assert.equal(sport.emneCount, 116);\n  assert.equal(sport.methodCount, 109);\n  assert.equal(sport.mappingCount, 116);\n  assert.equal(sport.hookCount, 60);\n  assert.equal(sport.chapterCount, 0);\n`;
generalTest = generalTest.replace(marker, sportBlock);
write(generalTestPath, generalTest);

const sportTestPath = 'tests/fagverk-sport-phase3.test.mjs';
let sportTest = read(sportTestPath);
sportTest = replaceOnce(
  sportTest,
  `    registeredChapterCount: 0,\n    explicitMappingRowCount: 116\n  });`,
  `    registeredChapterCount: 0,\n    explicitMappingRowCount: 116,\n    legacyUmbrellaEmneCount: 2\n  });`,
  sportTestPath
);
sportTest = replaceOnce(
  sportTest,
  `  assert.equal(report.gates.allCanonicalEmnersInMappingRegistry, true);\n  assert.equal(report.gates.allMethodReferencesResolved, true);`,
  `  assert.equal(report.gates.allCanonicalEmnersInMappingRegistry, true);\n  assert.equal(report.gates.legacyUmbrellaEmnersExcludedFromActiveSet, true);\n  assert.equal(report.gates.allMethodReferencesResolved, true);`,
  sportTestPath
);
write(sportTestPath, sportTest);

const readmePath = 'reports/fagverk/README.md';
let readme = read(readmePath);
if (!readme.includes('sport-phase3-audit.json')) {
  const reportMarker = readme.split('\n').find((line) => line.includes('scenekunst-phase3-audit.json'));
  assert(reportMarker, 'README mangler Scenekunst-rapportmarkør');
  readme = readme.replace(`${reportMarker}\n`, `${reportMarker}\n- \`sport-phase3-audit.json\` — individuell Fase 3-gate for Sport: seks canonicale fagområder, 116 aktive emner, 109 metoder, 116 mappinger og 60 hooks med bevart Knowledge- og Groundhopper-logikk.\n`);
}
if (!readme.includes('audit-fagverk-sport-phase3.mjs --write-report')) {
  const commandMarker = 'node scripts/audit-fagverk-scenekunst-phase3.mjs\n';
  assert(readme.includes(commandMarker), 'README mangler Scenekunst-regenereringskommando');
  readme = readme.replace(commandMarker, `${commandMarker}node scripts/audit-fagverk-sport-phase3.mjs --write-report\nnode scripts/audit-fagverk-sport-phase3.mjs\n`);
}
write(readmePath, readme);

function node(args) { execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' }); }
node(['scripts/audit-fagverk-subject-inventory.mjs', '--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs', '--write-report']);
node(['scripts/audit-fagverk-sport-phase3.mjs', '--write-report', '--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-sport-phase3.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs', '--check']);
node(['--test', 'tests/fagverk-subject-inventory.test.mjs']);
node(['--test', 'tests/fagverk-general-engine.test.mjs']);
node(['--test', 'tests/fagverk-sport-phase3.test.mjs']);
node(['--test', 'tests/fagverk-release-manifest.test.mjs']);
console.log('Sport Fase 3 materialisert og validert.');
