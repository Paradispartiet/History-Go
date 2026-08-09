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
function bumpMinor(version){ const p=String(version||'0.0.0').split('.').map(Number); if(p.length!==3||p.some(Number.isNaN)) throw new Error(`Kan ikke bumpe ${version}`); return `${p[0]}.${p[1]+1}.0`; }
function assert(c,m){ if(!c) throw new Error(m); }
function replaceOnce(s,n,r,l){ assert(s.includes(n),`Fant ikke forventet tekst i ${l}: ${n}`); return s.replace(n,r); }

const registryPath='data/fagverk/fagverk_registry.json';
const registry=readJson(registryPath); registry.version=bumpMinor(registry.version); registry.updatedAt=UPDATED_AT;
assert(registry.subjects?.by,'Fagverk-registeret mangler By');
assert(Array.isArray(registry.subjects.by.chapters),'By mangler chapters-array');
assert(registry.subjects.by.chapters.length===3,'Fjerde By Fase 4-batch forventer nøyaktig tre kapitler som utgangspunkt');
assert(registry.subjects.by.chapters.map(x=>x.id).join('|')==='byliv-offentlige-rom|byliv-sosial-offentlighet|byliv-hendelser-midlertidighet','By-kapitlene har uventet rekkefølge før kapittel 4');
registry.subjects.by.chapters.push({
  id:'byliv-stemning-mikrokomfort',
  title:'Stemning og mikrokomfort: lyd, lys, materialitet og vær i byrommet',
  subtitle:'Hvordan sanseerfaring, støy, sol, skygge, temperatur og hvilemuligheter kan undersøkes uten å blande fysisk eksponering, subjektiv opplevelse og dokumentert effekt',
  file:'data/fagverk/by/byliv-stemning-mikrokomfort.json',
  primary_domain_id:'byliv',
  chapter_role:'core',
  emne_ids:[
    'em_by_stemning_lyd_lys_tetthet',
    'em_by_materialitet_og_sanseerfaring',
    'em_by_mikroklima_og_var',
    'em_by_kroppslig_komfort_i_byrom',
    'em_by_sol_skygge_mikro_opphold'
  ],
  claimsFile:'data/fagverk/by/byliv-stemning-mikrokomfort/claims.json',
  briefFile:'data/fagverk/by/byliv-stemning-mikrokomfort/brief.json'
});
registry.subjects.by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Pensummodulene og curriculum-arkitekturen eier progresjon. Fire redigerte Fase 4-kapitler dekker nå tjuefem Byliv-emner med tolv moduler, 50 inspectable kapittelkilder og 72 claimsporede påstander; fem Byliv-emner og øvrige By-områder gjenstår i sammenhengende kapittelproduksjon.';
writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const byStatus=status.subjects.find(x=>x.id==='by'); assert(byStatus,'Statusregisteret mangler By');
Object.assign(byStatus,{
  navigationStatus:'materialized',
  assessmentStatus:'audited',
  editorialStatus:'chapters_in_progress',
  nextGate:'chapter_production',
  note:'By & arkitektur fortsetter sammenhengende Fase 4-produksjon med fire registrerte Byliv-kapitler. Kapittel 4 dekker stemning, lyd/lys/tetthet, materialitet/sanseerfaring, mikroklima/vær, kroppslig komfort og sol/skygge/mikro-opphold gjennom fem canonicale emner, fem metoder, tre redigerte moduler, ni seksjoner, tretten inspectable kilder og atten verified claims. Kapittelet skiller fysisk utforming, dokumentert eksponering, observert bruk og brukeropplevelse/effekt, og blokkerer oppdiktede feltmålinger. Byliv har nå 25 av 30 canonicale emner i redigerte kapitler; faget er fortsatt ikke komplett.'
});
writeJson(statusPath,status);

const byPilotPath='scripts/audit-fagverk-by-pilot.mjs'; let byPilot=read(byPilotPath);
byPilot=replaceOnce(byPilot,"assert(model.chapters.length === 3 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet') && model.chapters.some((chapter) => chapter.id === 'byliv-hendelser-midlertidighet'), 'By skal registrere alle tre Byliv-kapitlene i Fase 4');","assert(model.chapters.length === 4 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet') && model.chapters.some((chapter) => chapter.id === 'byliv-hendelser-midlertidighet') && model.chapters.some((chapter) => chapter.id === 'byliv-stemning-mikrokomfort'), 'By skal registrere alle fire Byliv-kapitlene i Fase 4');",byPilotPath);
write(byPilotPath,byPilot);

const byPilotTestPath='tests/fagverk-by-pilot.test.mjs'; let byPilotTest=read(byPilotTestPath);
byPilotTest=replaceOnce(byPilotTest,'registeredChapterCount: 3','registeredChapterCount: 4',byPilotTestPath);
write(byPilotTestPath,byPilotTest);

const firstAuditPath='scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs'; let firstAudit=read(firstAuditPath);
firstAudit=replaceOnce(firstAudit,"assert(registrySubject.chapters.length === 3, 'By skal nå ha tre registrerte Fase 4-kapitler');","assert(registrySubject.chapters.length === 4, 'By skal nå ha fire registrerte Fase 4-kapitler');",firstAuditPath);
firstAudit=replaceOnce(firstAudit,"assert(model.chapters.length === 3, 'Normalisert By-modell skal vise tre kapitler etter tredje Byliv-batch');","assert(model.chapters.length === 4, 'Normalisert By-modell skal vise fire kapitler etter fjerde Byliv-batch');",firstAuditPath);
firstAudit=replaceOnce(firstAudit,'firstChapterPreservedAcrossThreeChapterRegistry: true,','firstChapterPreservedAcrossFourChapterRegistry: true,',firstAuditPath);
write(firstAuditPath,firstAudit);

const firstTestPath='tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs'; let firstTest=read(firstTestPath);
firstTest=replaceOnce(firstTest,'assert.equal(report.subject.registeredChapterCount, 3);','assert.equal(report.subject.registeredChapterCount, 4);',firstTestPath);
write(firstTestPath,firstTest);

const secondAuditPath='scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs'; let secondAudit=read(secondAuditPath);
secondAudit=replaceOnce(secondAudit,"assert(registrySubject.chapters.length === 3, 'By skal nå ha tre registrerte Fase 4-kapitler totalt');","assert(registrySubject.chapters.length === 4, 'By skal nå ha fire registrerte Fase 4-kapitler totalt');",secondAuditPath);
secondAudit=replaceOnce(secondAudit,"assert(model.chapters.length === 3, 'Normalisert By-modell skal vise tre kapitler etter tredje Byliv-batch');","assert(model.chapters.length === 4, 'Normalisert By-modell skal vise fire kapitler etter fjerde Byliv-batch');",secondAuditPath);
secondAudit=replaceOnce(secondAudit,'secondChapterPreservedAcrossThreeChapterRegistry: true,','secondChapterPreservedAcrossFourChapterRegistry: true,',secondAuditPath);
write(secondAuditPath,secondAudit);

const secondTestPath='tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs'; let secondTest=read(secondTestPath);
secondTest=replaceOnce(secondTest,'assert.equal(report.subject.registeredChapterCount, 3);','assert.equal(report.subject.registeredChapterCount, 4);',secondTestPath);
write(secondTestPath,secondTest);

const thirdAuditPath='scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs'; let thirdAudit=read(thirdAuditPath);
thirdAudit=replaceOnce(thirdAudit,"assert(registrySubject.chapters.length === 3, 'Tredje By Fase 4-batch skal registrere nøyaktig tre kapitler totalt');","assert(registrySubject.chapters.length === 4, 'By skal nå ha fire registrerte Fase 4-kapitler totalt');",thirdAuditPath);
thirdAudit=replaceOnce(thirdAudit,"assert(model.chapters.length === 3, 'Normalisert By-modell skal vise tre kapitler');","assert(model.chapters.length === 4, 'Normalisert By-modell skal vise fire kapitler etter fjerde Byliv-batch');",thirdAuditPath);
thirdAudit=replaceOnce(thirdAudit,'exactlyThreeRegisteredByChapters: true,','thirdChapterPreservedAcrossFourChapterRegistry: true,',thirdAuditPath);
write(thirdAuditPath,thirdAudit);

const thirdTestPath='tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs'; let thirdTest=read(thirdTestPath);
thirdTest=replaceOnce(thirdTest,'assert.equal(report.subject.registeredChapterCount, 3);','assert.equal(report.subject.registeredChapterCount, 4);',thirdTestPath);
write(thirdTestPath,thirdTest);

const generalTestPath='tests/fagverk-general-engine.test.mjs'; let generalTest=read(generalTestPath);
generalTest=replaceOnce(generalTest,'  assert.equal(by.chapterCount, 3);','  assert.equal(by.chapterCount, 4);',generalTestPath);
write(generalTestPath,generalTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('by-byliv-stemning-mikrokomfort-phase4-audit.json')) {
  const marker='- `by-byliv-hendelser-midlertidighet-phase4-audit.json` — tredje Fase 4-kapittelgate for By: seks Byliv-emner, fire metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med temporal status-guard og eksplisitt pilot≠permanent-effekt.\n';
  assert(readme.includes(marker),'README mangler tredje By Fase 4-rapportlinje');
  readme=readme.replace(marker,`${marker}- \`by-byliv-stemning-mikrokomfort-phase4-audit.json\` — fjerde Fase 4-kapittelgate for By: fem Byliv-emner, fem metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med målefabrikasjons- og evidenslagvakt.\n`);
}
if(!readme.includes('audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs --write-report')) {
  const marker='node scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs\n';
  assert(readme.includes(marker),'README mangler tredje By Fase 4-kommando');
  readme=readme.replace(marker,`${marker}node scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs\n`);
}
write(readmePath,readme);

function node(args){ execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'}); }
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs','--write-report']);
node(['scripts/audit-fagverk-by-pilot.mjs','--write-report']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-by-pilot.mjs']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-by-pilot.test.mjs']);
node(['--test','tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('By stemning og mikrokomfort Fase 4-kapittel materialisert og validert.');
