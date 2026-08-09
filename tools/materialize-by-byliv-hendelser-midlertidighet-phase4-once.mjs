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
assert(registry.subjects.by.chapters.length===2,'Tredje By Fase 4-batch forventer nøyaktig to kapitler som utgangspunkt');
assert(registry.subjects.by.chapters[0].id==='byliv-offentlige-rom' && registry.subjects.by.chapters[1].id==='byliv-sosial-offentlighet','By-kapitlene har uventet rekkefølge før kapittel 3');
registry.subjects.by.chapters.push({
  id:'byliv-hendelser-midlertidighet',
  title:'Hendelser og midlertidighet: når byrom skifter modus',
  subtitle:'Festivaler, sesongbruk, pilotgater, pop-up, gatekunst og skate som tidsavgrenset eller improvisert byliv – lest gjennom regler, fysisk endring og faktisk bruk',
  file:'data/fagverk/by/byliv-hendelser-midlertidighet.json',
  primary_domain_id:'byliv',
  chapter_role:'core',
  emne_ids:[
    'em_by_festivaler_arrangementer',
    'em_by_hendelsesbasert_byliv_hoytider',
    'em_by_midlertidige_installasjoner',
    'em_by_sesongbruk_uteomrader',
    'em_by_uformell_bruk_av_byrom',
    'em_by_skate_gatekunst_improvisasjon'
  ],
  claimsFile:'data/fagverk/by/byliv-hendelser-midlertidighet/claims.json',
  briefFile:'data/fagverk/by/byliv-hendelser-midlertidighet/brief.json'
});
registry.subjects.by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Pensummodulene og curriculum-arkitekturen eier progresjon. Tre redigerte Fase 4-kapitler dekker nå tjue Byliv-emner med ni moduler, 37 inspectable kapittelkilder og 54 claimsporede påstander; øvrige Byliv-emner og By-områder er fortsatt under sammenhengende kapittelproduksjon.';
writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const byStatus=status.subjects.find(x=>x.id==='by'); assert(byStatus,'Statusregisteret mangler By');
Object.assign(byStatus,{
  navigationStatus:'materialized',
  assessmentStatus:'audited',
  editorialStatus:'chapters_in_progress',
  nextGate:'chapter_production',
  note:'By & arkitektur fortsetter sammenhengende Fase 4-produksjon med tre registrerte Byliv-kapitler. Kapittel 1 dekker offentlige rom, opphold og bevegelse; kapittel 2 dekker sosial offentlighet, møteplasser, venting og tempo; kapittel 3 dekker hendelsesbasert byliv, festivaler/høytider, midlertidige installasjoner, sesongbruk, uformell bruk, gatekunst og skate. Kapittel 3 har seks canonicale emner, fire metoder, tre redigerte moduler, ni seksjoner, tretten inspectable kilder og atten verified claims med full avsnittssporing og temporal status-guard. Faget er fortsatt ikke komplett; kapittelproduksjonen fortsetter i By.'
});
writeJson(statusPath,status);

const byPilotPath='scripts/audit-fagverk-by-pilot.mjs'; let byPilot=read(byPilotPath);
byPilot=replaceOnce(byPilot,"assert(model.chapters.length === 2 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet'), 'By skal registrere begge Byliv-kapitlene i Fase 4');","assert(model.chapters.length === 3 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet') && model.chapters.some((chapter) => chapter.id === 'byliv-hendelser-midlertidighet'), 'By skal registrere alle tre Byliv-kapitlene i Fase 4');",byPilotPath);
write(byPilotPath,byPilot);

const byPilotTestPath='tests/fagverk-by-pilot.test.mjs'; let byPilotTest=read(byPilotTestPath);
byPilotTest=replaceOnce(byPilotTest,'registeredChapterCount: 2','registeredChapterCount: 3',byPilotTestPath);
write(byPilotTestPath,byPilotTest);

const firstAuditPath='scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs'; let firstAudit=read(firstAuditPath);
firstAudit=replaceOnce(firstAudit,"assert(registrySubject.chapters.length === 2, 'By skal nå ha to registrerte Fase 4-kapitler');","assert(registrySubject.chapters.length === 3, 'By skal nå ha tre registrerte Fase 4-kapitler');",firstAuditPath);
firstAudit=replaceOnce(firstAudit,"assert(model.chapters.length === 2, 'Normalisert By-modell skal vise to kapitler etter andre Byliv-batch');","assert(model.chapters.length === 3, 'Normalisert By-modell skal vise tre kapitler etter tredje Byliv-batch');",firstAuditPath);
firstAudit=replaceOnce(firstAudit,'firstChapterPreservedAcrossTwoChapterRegistry: true,','firstChapterPreservedAcrossThreeChapterRegistry: true,',firstAuditPath);
write(firstAuditPath,firstAudit);

const firstTestPath='tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs'; let firstTest=read(firstTestPath);
firstTest=replaceOnce(firstTest,'assert.equal(report.subject.registeredChapterCount, 2);','assert.equal(report.subject.registeredChapterCount, 3);',firstTestPath);
write(firstTestPath,firstTest);

const secondAuditPath='scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs'; let secondAudit=read(secondAuditPath);
secondAudit=replaceOnce(secondAudit,"assert(registrySubject.chapters.length === 2, 'Andre By Fase 4-batch skal registrere nøyaktig to kapitler totalt');","assert(registrySubject.chapters.length === 3, 'By skal nå ha tre registrerte Fase 4-kapitler totalt');",secondAuditPath);
secondAudit=replaceOnce(secondAudit,"assert(model.chapters.length === 2, 'Normalisert By-modell skal vise to kapitler');","assert(model.chapters.length === 3, 'Normalisert By-modell skal vise tre kapitler etter tredje Byliv-batch');",secondAuditPath);
secondAudit=replaceOnce(secondAudit,'exactlyTwoRegisteredByChapters: true,','secondChapterPreservedAcrossThreeChapterRegistry: true,',secondAuditPath);
write(secondAuditPath,secondAudit);

const secondTestPath='tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs'; let secondTest=read(secondTestPath);
secondTest=replaceOnce(secondTest,'assert.equal(report.subject.registeredChapterCount, 2);','assert.equal(report.subject.registeredChapterCount, 3);',secondTestPath);
write(secondTestPath,secondTest);

const generalTestPath='tests/fagverk-general-engine.test.mjs'; let generalTest=read(generalTestPath);
generalTest=replaceOnce(generalTest,'  assert.equal(by.chapterCount, 2);','  assert.equal(by.chapterCount, 3);',generalTestPath);
write(generalTestPath,generalTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('by-byliv-hendelser-midlertidighet-phase4-audit.json')) {
  const marker='- `by-byliv-sosial-offentlighet-phase4-audit.json` — andre Fase 4-kapittelgate for By: sju Byliv-emner, tre metoder, tre moduler, ni seksjoner, 18 verified claims og 12 gjenbrukte inspectable institusjonelle kilder med låst kildeproveniens.\n';
  assert(readme.includes(marker),'README mangler andre By Fase 4-rapportlinje');
  readme=readme.replace(marker,`${marker}- \`by-byliv-hendelser-midlertidighet-phase4-audit.json\` — tredje Fase 4-kapittelgate for By: seks Byliv-emner, fire metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med temporal status-guard og eksplisitt pilot≠permanent-effekt.\n`);
}
if(!readme.includes('audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs --write-report')) {
  const marker='node scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs\n';
  assert(readme.includes(marker),'README mangler andre By Fase 4-kommando');
  readme=readme.replace(marker,`${marker}node scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs\n`);
}
write(readmePath,readme);

function node(args){ execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'}); }
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs','--write-report']);
node(['scripts/audit-fagverk-by-pilot.mjs','--write-report']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-by-pilot.mjs']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-by-pilot.test.mjs']);
node(['--test','tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('By hendelser og midlertidighet Fase 4-kapittel materialisert og validert.');
