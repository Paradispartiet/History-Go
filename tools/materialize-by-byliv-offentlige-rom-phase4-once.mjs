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
const UPDATED_AT = '2026-08-09';
function bumpMinor(version) { const p=String(version||'0.0.0').split('.').map(Number); if(p.length!==3||p.some(Number.isNaN)) throw new Error(`Kan ikke bumpe ${version}`); return `${p[0]}.${p[1]+1}.0`; }
function assert(c,m){ if(!c) throw new Error(m); }
function replaceOnce(s,n,r,l){ assert(s.includes(n),`Fant ikke forventet tekst i ${l}`); return s.replace(n,r); }

// Preserve the exact evidence strength of the WHO review before publication.
const claimsPath='data/fagverk/by/byliv-offentlige-rom/claims.json';
let claimsText=read(claimsPath);
claimsText=replaceOnce(
  claimsText,
  'WHO/Europe peker på at fysiske forbedringer av grøntområder virker best når de kombineres med sosial deltakelse eller aktivitet som faktisk når nye brukergrupper.',
  'WHO/Europes gjennomgang peker på at fysiske forbedringer av grøntområder ser ut til å være mest effektive når de kombineres med sosial deltakelse eller aktivitet som faktisk når nye brukergrupper.',
  claimsPath
);
write(claimsPath,claimsText);

const registryPath='data/fagverk/fagverk_registry.json';
const registry=readJson(registryPath); registry.version=bumpMinor(registry.version); registry.updatedAt=UPDATED_AT;
assert(registry.subjects?.by,'Fagverk-registeret mangler By');
assert(Array.isArray(registry.subjects.by.chapters),'By mangler chapters-array');
assert(registry.subjects.by.chapters.length===0,'Første By Fase 4-batch forventer tomt kapittelregister');
registry.subjects.by.chapters.push({
  id:'byliv-offentlige-rom',
  title:'Offentlige rom: opphold, bevegelse og møteplasser',
  subtitle:'Hvordan gater, torg og parker blir levde byrom – og hvordan bruk kan undersøkes uten å forveksle plan, form og faktisk hverdagsliv',
  file:'data/fagverk/by/byliv-offentlige-rom.json',
  primary_domain_id:'byliv',
  chapter_role:'core',
  emne_ids:[
    'em_by_offentlige_rom_motesteder',
    'em_by_torg_plasser_som_scene',
    'em_by_parker_som_sosial_infrastruktur',
    'em_by_lek_trening_uformell_aktivitet',
    'em_by_stillhet_vs_aktivitet_i_grontrom',
    'em_by_opphold_vs_gjennomgang',
    'em_by_gangstrommer_snarveier'
  ],
  claimsFile:'data/fagverk/by/byliv-offentlige-rom/claims.json',
  briefFile:'data/fagverk/by/byliv-offentlige-rom/brief.json'
});
registry.subjects.by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Pensummodulene og curriculum-arkitekturen eier progresjon. Første redigerte Fase 4-kapittel dekker sju Byliv-emner med tre moduler, inspectable kilder og claimspor; øvrige By-områder er fortsatt under kapittelproduksjon.';
writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const byStatus=status.subjects.find(x=>x.id==='by'); assert(byStatus,'Statusregisteret mangler By');
Object.assign(byStatus,{
  navigationStatus:'materialized',
  assessmentStatus:'audited',
  editorialStatus:'chapters_in_progress',
  nextGate:'chapter_production',
  note:'By & arkitektur har startet sammenhengende Fase 4-kapittelproduksjon. Første registrerte kapittel er Byliv: Offentlige rom – opphold, bevegelse og møteplasser, med sju canonicale emner, tre metoder, tre redigerte moduler, ni seksjoner, tolv inspectable kilder og atten verified claims. Kapittelet skiller planintensjon, fysisk tiltak, observasjon og effekt, og bruker Youngstorget, Rådhusplassen, Tøyen torg og Birkelunden som felt-/caseinnganger uten å overføre udokumenterte stedspåstander. Faget er ikke komplett; kapittelproduksjonen fortsetter sammenhengende i By.'
});
writeJson(statusPath,status);

// Evolve the permanent By pilot gate from structure-ready to chapters-in-progress without weakening its structural checks.
const byAuditPath='scripts/audit-fagverk-by-pilot.mjs'; let byAudit=read(byAuditPath);
byAudit=replaceOnce(byAudit,"assert(statusEntry?.editorialStatus === 'structure_ready', 'By må stå structure_ready før kapittelproduksjon');","assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'By skal stå chapters_in_progress etter første redigerte kapittel');",byAuditPath);
byAudit=replaceOnce(byAudit,"assert(model.chapters.length === 0, 'Structure-ready kan ikke late som By-kapitler finnes');","assert(model.chapters.length === 1 && model.chapters[0].id === 'byliv-offentlige-rom', 'By skal registrere nøyaktig første Byliv-kapittel i Fase 4');",byAuditPath);
byAudit=replaceOnce(byAudit,"status: 'by_compatibility_pilot_structure_ready'","status: 'by_compatibility_pilot_chapters_in_progress'",byAuditPath);
byAudit=replaceOnce(byAudit,"editorialStatusStructureReady: true,","editorialStatusChaptersInProgress: true,",byAuditPath);
byAudit=replaceOnce(byAudit,"chapterClaimsNotOverstated: true","chapterProductionStartedWithoutCompletenessOverclaim: true",byAuditPath);
write(byAuditPath,byAudit);

const byTestPath='tests/fagverk-by-pilot.test.mjs'; let byTest=read(byTestPath);
byTest=replaceOnce(byTest,"test('By er materialisert og auditert som structure-ready compatibility-pilot', () => {","test('By er materialisert og auditert som chapters-in-progress compatibility-fag', () => {",byTestPath);
byTest=replaceOnce(byTest,"assert.equal(report.subject.editorialStatus, 'structure_ready');","assert.equal(report.subject.editorialStatus, 'chapters_in_progress');",byTestPath);
byTest=replaceOnce(byTest,'registeredChapterCount: 0','registeredChapterCount: 1',byTestPath);
write(byTestPath,byTest);

const inventoryTestPath='tests/fagverk-subject-inventory.test.mjs'; let inventoryTest=read(inventoryTestPath);
inventoryTest=replaceOnce(
  inventoryTest,
  "const musikk=s.subjects.find(x=>x.id==='musikk');assert.equal(musikk.navigationStatus,'materialized');assert.equal(musikk.assessmentStatus,'audited');assert.equal(musikk.nextGate,'maintenance_source_refresh_and_place_case_expansion');for(const id of ['by','kunst','media','psykologi','religion','scenekunst','sport','vitenskap','filosofi','film_tv'])",
  "const musikk=s.subjects.find(x=>x.id==='musikk');assert.equal(musikk.navigationStatus,'materialized');assert.equal(musikk.assessmentStatus,'audited');assert.equal(musikk.nextGate,'maintenance_source_refresh_and_place_case_expansion');const by=s.subjects.find(x=>x.id==='by');assert.equal(by.editorialStatus,'chapters_in_progress');assert.equal(by.nextGate,'chapter_production');for(const id of ['kunst','media','psykologi','religion','scenekunst','sport','vitenskap','filosofi','film_tv'])",
  inventoryTestPath
);
write(inventoryTestPath,inventoryTest);

const generalTestPath='tests/fagverk-general-engine.test.mjs'; let generalTest=read(generalTestPath);
generalTest=replaceOnce(generalTest,'  assert.equal(by.chapterCount, 0);','  assert.equal(by.chapterCount, 1);',generalTestPath);
write(generalTestPath,generalTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('by-byliv-offentlige-rom-phase4-audit.json')) {
  const marker='- `by-pilot-audit.json` — individuell fase-2-gate for By som `by_compatibility`: tolv fagkart-eide fagområder, 82 source-emner, 14 canonicale metoder, 81 hooks og kurs-/curriculum-moduler som separate progresjonslag.\n';
  assert(readme.includes(marker),'README mangler By-pilot-rapportlinje');
  readme=readme.replace(marker,`${marker}- \`by-byliv-offentlige-rom-phase4-audit.json\` — første Fase 4-kapittelgate for By: sju Byliv-emner, tre metoder, tre moduler, ni seksjoner, 18 verified claims og 12 inspectable kilder med full avsnittssporing.\n`);
}
if(!readme.includes('audit-fagverk-by-byliv-offentlige-rom-phase4.mjs --write-report')) {
  const marker='node scripts/audit-fagverk-by-pilot.mjs\n';
  assert(readme.includes(marker),'README mangler By-pilot-kommando');
  readme=readme.replace(marker,`${marker}node scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs\n`);
}
write(readmePath,readme);

function node(args){ execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'}); }
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs','--write-report']);
node(['scripts/audit-fagverk-by-pilot.mjs','--write-report']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-by-pilot.mjs']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-by-pilot.test.mjs']);
node(['--test','tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('By Byliv Fase 4-kapittel materialisert og validert.');
