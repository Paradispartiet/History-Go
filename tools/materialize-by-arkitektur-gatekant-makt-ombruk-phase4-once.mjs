#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const at=(p)=>path.join(ROOT,p);
const readJson=(p)=>JSON.parse(fs.readFileSync(at(p),'utf8'));
const writeJson=(p,v)=>fs.writeFileSync(at(p),`${JSON.stringify(v,null,2)}\n`);
const read=(p)=>fs.readFileSync(at(p),'utf8');
const write=(p,v)=>fs.writeFileSync(at(p),v);
const UPDATED_AT='2026-08-09';
function assert(c,m){ if(!c) throw new Error(m); }
function bumpMinor(version){ const p=String(version||'0.0.0').split('.').map(Number); if(p.length!==3||p.some(Number.isNaN)) throw new Error(`Kan ikke bumpe ${version}`); return `${p[0]}.${p[1]+1}.0`; }
function replaceRequired(text,from,to,label){ assert(text.includes(from),`Fant ikke forventet tekst i ${label}: ${from}`); return text.replace(from,to); }
function replaceCount(text,from,to,label){ const matches=text.split(from).length-1; assert(matches>0,`Fant ikke ${from} i ${label}`); return text.split(from).join(to); }

const registryPath='data/fagverk/fagverk_registry.json';
const registry=readJson(registryPath); registry.version=bumpMinor(registry.version); registry.updatedAt=UPDATED_AT;
assert(registry.subjects?.by && Array.isArray(registry.subjects.by.chapters),'By mangler kapittelregister');
assert(registry.subjects.by.chapters.length===6,'Arkitektur 12/12-materialisering forventer seks eksisterende By-kapitler');
assert(registry.subjects.by.chapters.filter((r)=>r.primary_domain_id==='byliv').length===5,'Byliv skal fortsatt ha fem kapitler');
assert(registry.subjects.by.chapters.filter((r)=>r.primary_domain_id==='arkitektur').length===1,'Utgangspunktet skal ha nøyaktig ett Arkitektur-kapittel');
registry.subjects.by.chapters.push({
  id:'arkitektur-gatekant-makt-ombruk',
  title:'Gatekant, symbol og ombruk: hvordan arkitektur virker og styres',
  subtitle:'Fra åpne førsteetasjer og innganger til transformasjon, representasjon og planmakt',
  file:'data/fagverk/by/arkitektur-gatekant-makt-ombruk.json',
  primary_domain_id:'arkitektur',
  chapter_role:'core',
  emne_ids:[
    'em_by_butikkfasader_vindusutstillinger','em_by_dodt_vs_aktivt_gateniva','em_by_gateliv_kantsoner','em_by_styring_forvaltning_planmakt','em_by_symbolsk_makt_og_representasjon','em_by_transformasjon_ombruk'
  ],
  claimsFile:'data/fagverk/by/arkitektur-gatekant-makt-ombruk/claims.json',
  briefFile:'data/fagverk/by/arkitektur-gatekant-makt-ombruk/brief.json'
});
registry.subjects.by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Pensummodulene og curriculum-arkitekturen eier progresjon. Byliv er kapitteldekket 30/30 gjennom fem kapitler. Arkitektur er nå kapitteldekket 12/12 gjennom to kapitler: type/skala/byform og gatekant/makt/ombruk. By-faget fortsetter sammenhengende Fase 4-produksjon i neste canonicale fagområde.';
writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const byStatus=status.subjects.find((x)=>x.id==='by'); assert(byStatus,'Statusregisteret mangler By');
Object.assign(byStatus,{navigationStatus:'materialized',assessmentStatus:'audited',editorialStatus:'chapters_in_progress',nextGate:'chapter_production',note:'By & arkitektur fortsetter Fase 4-produksjon. Byliv er kapitteldekket 30/30 gjennom fem kapitler. Arkitektur er nå kapitteldekket 12/12 gjennom to kapitler med eksplisitte porter for eierdomene, gatekant, universell inngang, planmakt, symbolsk representasjon og transformasjon/ombruk. Hele By-faget er fortsatt ikke komplett; neste canonicale fagområde skal produseres sammenhengende.'});
writeJson(statusPath,status);

const byPilotPath='scripts/audit-fagverk-by-pilot.mjs'; let byPilot=read(byPilotPath);
byPilot=replaceRequired(byPilot,'model.chapters.length === 6','model.chapters.length === 7',byPilotPath);
byPilot=replaceRequired(byPilot,"model.chapters.some((chapter) => chapter.id === 'arkitektur-type-skala-byform')","model.chapters.some((chapter) => chapter.id === 'arkitektur-type-skala-byform') && model.chapters.some((chapter) => chapter.id === 'arkitektur-gatekant-makt-ombruk')",byPilotPath);
write(byPilotPath,byPilot);
const byPilotTestPath='tests/fagverk-by-pilot.test.mjs'; let byPilotTest=read(byPilotTestPath); byPilotTest=replaceRequired(byPilotTest,'registeredChapterCount: 6','registeredChapterCount: 7',byPilotTestPath); write(byPilotTestPath,byPilotTest);

const bylivPairs=[
 ['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs','tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs'],
 ['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs','tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs'],
 ['scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs','tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs'],
 ['scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs','tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs'],
 ['scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs','tests/fagverk-by-byliv-rytmer-miks-konflikt-phase4.test.mjs']
];
for(const [audit,test] of bylivPairs){
  let a=read(audit); a=replaceCount(a,'registrySubject.chapters.length === 6','registrySubject.chapters.length === 7',audit); a=replaceCount(a,'model.chapters.length === 6','model.chapters.length === 7',audit); a=a.replaceAll('AcrossSixChapterRegistry','AcrossSevenChapterRegistry').replaceAll('acrossSixChapterRegistry','acrossSevenChapterRegistry').replaceAll('seks registrerte','sju registrerte').replaceAll('seks kapitler','sju kapitler'); write(audit,a);
  let t=read(test); t=replaceCount(t,'registeredChapterCount, 6','registeredChapterCount, 7',test); write(test,t);
}

const firstArchAuditPath='scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs'; let firstArchAudit=read(firstArchAuditPath);
firstArchAudit=replaceCount(firstArchAudit,'registrySubject.chapters.length === 6','registrySubject.chapters.length === 7',firstArchAuditPath);
firstArchAudit=replaceCount(firstArchAudit,'model.chapters.length === 6','model.chapters.length === 7',firstArchAuditPath);
firstArchAudit=firstArchAudit.replace('exactlySixRegisteredByChapters: true','firstArchitectureChapterPreservedAcrossSevenChapterRegistry: true').replaceAll('seks registrerte','sju registrerte').replaceAll('seks kapitler','sju kapitler');
write(firstArchAuditPath,firstArchAudit);
const firstArchTestPath='tests/fagverk-by-arkitektur-type-skala-phase4.test.mjs'; let firstArchTest=read(firstArchTestPath); firstArchTest=replaceRequired(firstArchTest,'registeredChapterCount, 6','registeredChapterCount, 7',firstArchTestPath); write(firstArchTestPath,firstArchTest);

const generalTestPath='tests/fagverk-general-engine.test.mjs'; let generalTest=read(generalTestPath); generalTest=replaceRequired(generalTest,'assert.equal(by.chapterCount, 6);','assert.equal(by.chapterCount, 7);',generalTestPath); write(generalTestPath,generalTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('by-arkitektur-gatekant-makt-ombruk-phase4-audit.json')) readme += '\n- `by-arkitektur-gatekant-makt-ombruk-phase4-audit.json` — andre Arkitektur-kapittelgate og Arkitektur-domenets 12/12-port: seks emner, seks metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder; Byliv 30/30 bevares.\n';
if(!readme.includes('audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs')) readme += '\n```bash\nnode scripts/audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs\n```\n';
write(readmePath,readme);

function node(args){ execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'}); }
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs','--write-report']);
node(['scripts/audit-fagverk-by-pilot.mjs','--write-report']);
for(const [audit] of bylivPairs) node([audit,'--write-report','--no-check-report']);
node([firstArchAuditPath,'--write-report','--no-check-report']);
node(['scripts/audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-by-pilot.mjs']);
for(const [audit] of bylivPairs) node([audit]);
node([firstArchAuditPath]);
node(['scripts/audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-by-pilot.test.mjs']);
for(const [,test] of bylivPairs) node(['--test',test]);
node(['--test',firstArchTestPath]);
node(['--test','tests/fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('Arkitektur-domenet materialisert 12/12 gjennom to kapitler; Byliv fortsatt 30/30; By-subjektet fortsetter.');
