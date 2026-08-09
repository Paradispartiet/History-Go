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
function replaceOnce(s,n,r,l){ assert(s.includes(n),`Fant ikke forventet tekst i ${l}: ${n}`); return s.replace(n,r); }

const registryPath='data/fagverk/fagverk_registry.json';
const registry=readJson(registryPath); registry.version=bumpMinor(registry.version); registry.updatedAt=UPDATED_AT;
assert(registry.subjects?.by,'Fagverk-registeret mangler By');
assert(Array.isArray(registry.subjects.by.chapters),'By mangler chapters-array');
assert(registry.subjects.by.chapters.length===1 && registry.subjects.by.chapters[0].id==='byliv-offentlige-rom','Andre By Fase 4-batch forventer nøyaktig første Byliv-kapittel som utgangspunkt');
registry.subjects.by.chapters.push({
  id:'byliv-sosial-offentlighet',
  title:'Sosial offentlighet: møter, venting og lavterskel byliv',
  subtitle:'Hvordan samtilstedeværelse, uformelt opphold og skiftende tempo kan undersøkes uten å forveksle folkemengde, inkludering og sosial kvalitet',
  file:'data/fagverk/by/byliv-sosial-offentlighet.json',
  primary_domain_id:'byliv',
  chapter_role:'core',
  emne_ids:[
    'em_by_sosiale_knutepunkt',
    'em_by_tilfeldige_moter',
    'em_by_lavterskel_moteplasser_uten_kjopspress',
    'em_by_publikum_deltakelse_tilskuere',
    'em_by_sittekanter_trapper_uformelle_soner',
    'em_by_venting_som_bypraksis',
    'em_by_tempo_sakte_rask_by'
  ],
  claimsFile:'data/fagverk/by/byliv-sosial-offentlighet/claims.json',
  briefFile:'data/fagverk/by/byliv-sosial-offentlighet/brief.json'
});
registry.subjects.by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Pensummodulene og curriculum-arkitekturen eier progresjon. To redigerte Fase 4-kapitler dekker nå fjorten Byliv-emner med seks moduler, 24 inspectable kapittelkilder og 36 claimsporede påstander; øvrige By-områder er fortsatt under sammenhengende kapittelproduksjon.';
writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const byStatus=status.subjects.find(x=>x.id==='by'); assert(byStatus,'Statusregisteret mangler By');
Object.assign(byStatus,{
  navigationStatus:'materialized',
  assessmentStatus:'audited',
  editorialStatus:'chapters_in_progress',
  nextGate:'chapter_production',
  note:'By & arkitektur fortsetter sammenhengende Fase 4-produksjon med to registrerte Byliv-kapitler. Kapittel 1 dekker offentlige rom, opphold og bevegelse; kapittel 2 dekker sosial offentlighet, sosiale knutepunkt, tilfeldige møter, lavterskel møteplasser, uformelle sitteformer, venting, tempo og skiftet mellom hverdag, publikum og deltakelse. Hvert kapittel har sju canonicale emner, tre metoder, tre redigerte moduler, ni seksjoner, tolv inspectable kilder og atten verified claims med full avsnittssporing. Faget er fortsatt ikke komplett; kapittelproduksjonen fortsetter i By.'
});
writeJson(statusPath,status);

// Evolve permanent By gates from one to two registered Phase 4 chapters without weakening chapter 1.
const byPilotPath='scripts/audit-fagverk-by-pilot.mjs'; let byPilot=read(byPilotPath);
byPilot=replaceOnce(byPilot,"assert(model.chapters.length === 1 && model.chapters[0].id === 'byliv-offentlige-rom', 'By skal registrere nøyaktig første Byliv-kapittel i Fase 4');","assert(model.chapters.length === 2 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet'), 'By skal registrere begge Byliv-kapitlene i Fase 4');",byPilotPath);
write(byPilotPath,byPilot);

const byPilotTestPath='tests/fagverk-by-pilot.test.mjs'; let byPilotTest=read(byPilotTestPath);
byPilotTest=replaceOnce(byPilotTest,'registeredChapterCount: 1','registeredChapterCount: 2',byPilotTestPath);
write(byPilotTestPath,byPilotTest);

const firstAuditPath='scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs'; let firstAudit=read(firstAuditPath);
firstAudit=replaceOnce(firstAudit,"assert(registrySubject.chapters.length === 1, 'Første By Fase 4-batch skal registrere nøyaktig ett kapittel');","assert(registrySubject.chapters.length === 2, 'By skal nå ha to registrerte Fase 4-kapitler');",firstAuditPath);
firstAudit=replaceOnce(firstAudit,"assert(model.chapters.length === 1, 'Normalisert By-modell skal vise ett kapittel');","assert(model.chapters.length === 2, 'Normalisert By-modell skal vise to kapitler etter andre Byliv-batch');",firstAuditPath);
firstAudit=replaceOnce(firstAudit,'oneRegisteredChapterOnly: true,','firstChapterPreservedAcrossTwoChapterRegistry: true,',firstAuditPath);
write(firstAuditPath,firstAudit);

const firstTestPath='tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs'; let firstTest=read(firstTestPath);
firstTest=replaceOnce(firstTest,'assert.equal(report.subject.registeredChapterCount, 1);','assert.equal(report.subject.registeredChapterCount, 2);',firstTestPath);
write(firstTestPath,firstTest);

const generalTestPath='tests/fagverk-general-engine.test.mjs'; let generalTest=read(generalTestPath);
generalTest=replaceOnce(generalTest,'  assert.equal(by.chapterCount, 1);','  assert.equal(by.chapterCount, 2);',generalTestPath);
write(generalTestPath,generalTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('by-byliv-sosial-offentlighet-phase4-audit.json')) {
  const marker='- `by-byliv-offentlige-rom-phase4-audit.json` — første Fase 4-kapittelgate for By: sju Byliv-emner, tre metoder, tre moduler, ni seksjoner, 18 verified claims og 12 inspectable kilder med full avsnittssporing.\n';
  assert(readme.includes(marker),'README mangler første By Fase 4-rapportlinje');
  readme=readme.replace(marker,`${marker}- \`by-byliv-sosial-offentlighet-phase4-audit.json\` — andre Fase 4-kapittelgate for By: sju Byliv-emner, tre metoder, tre moduler, ni seksjoner, 18 verified claims og 12 gjenbrukte inspectable institusjonelle kilder med låst kildeproveniens.\n`);
}
if(!readme.includes('audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs --write-report')) {
  const marker='node scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs\n';
  assert(readme.includes(marker),'README mangler første By Fase 4-kommando');
  readme=readme.replace(marker,`${marker}node scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs\n`);
}
write(readmePath,readme);

function node(args){ execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'}); }
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs','--write-report']);
node(['scripts/audit-fagverk-by-pilot.mjs','--write-report']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-by-pilot.mjs']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-by-pilot.test.mjs']);
node(['--test','tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('By sosial offentlighet Fase 4-kapittel materialisert og validert.');
