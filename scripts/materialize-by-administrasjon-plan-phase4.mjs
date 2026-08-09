#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rel=(p)=>path.join(ROOT,p);
const read=(p)=>fs.readFileSync(rel(p),'utf8');
const write=(p,s)=>fs.writeFileSync(rel(p),s.endsWith('\n')?s:`${s}\n`,'utf8');
const json=(p)=>JSON.parse(read(p));
const writeJson=(p,v)=>write(p,JSON.stringify(v,null,2));
const assert=(c,m)=>{if(!c)throw new Error(m);};

const chapterMeta={
  id:'administrasjon-plan-kontroll-beredskap',
  title:'Regler, kontroll og beredskap: hvordan byen styres i praksis',
  subtitle:'Fra planvedtak og medvirkning til tilsyn, håndheving, risiko og robusthet',
  file:'data/fagverk/by/administrasjon-plan-kontroll-beredskap.json',
  primary_domain_id:'administrasjon_og_plan',
  chapter_role:'core',
  emne_ids:['em_by_overvakning_kontroll_toleranse','em_by_regler_brudd_toleranse','em_by_risiko_beredskap_robusthet'],
  claimsFile:'data/fagverk/by/administrasjon-plan-kontroll-beredskap/claims.json',
  briefFile:'data/fagverk/by/administrasjon-plan-kontroll-beredskap/brief.json'
};

const registry=json('data/fagverk/fagverk_registry.json');
assert(registry.version==='2.42.0','Forventet registry 2.42.0 før Administrasjon og plan');
registry.version='2.43.0';
registry.updatedAt='2026-08-09';
const by=registry.subjects?.by;
assert(by&&Array.isArray(by.chapters)&&by.chapters.length===8,'Forventet åtte By-kapitler før materialisering');
assert(!by.chapters.some((r)=>r.id===chapterMeta.id),'Administrasjon og plan-kapittelet finnes allerede');
by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Byliv er kapitteldekket 30/30 gjennom fem kapitler. Arkitektur er kapitteldekket 12/12 gjennom to kapitler. Bolig og nabolag er kapitteldekket 5/5 gjennom ett kapittel. Administrasjon og plan er nå kapitteldekket 3/3 gjennom ett kapittel. By-faget fortsetter sammenhengende Fase 4-produksjon i neste canonicale fagområde.';
by.chapters.push(chapterMeta);
writeJson('data/fagverk/fagverk_registry.json',registry);

const status=json('data/fagverk/subject_status.json');
assert(status.version==='2.41.0','Forventet subject_status 2.41.0 før Administrasjon og plan');
status.version='2.42.0';
status.updatedAt='2026-08-09';
const statusBy=status.subjects.find((r)=>r.id==='by');
assert(statusBy,'Mangler By i subject_status');
statusBy.note='By & arkitektur fortsetter Fase 4. Byliv er 30/30, Arkitektur 12/12, Bolig og nabolag 5/5 og Administrasjon og plan 3/3 kapitteldekket. Hele By-faget er fortsatt ikke komplett; neste canonicale fagområde skal produseres sammenhengende.';
writeJson('data/fagverk/subject_status.json',status);

const legacyScripts=[
  'scripts/audit-fagverk-by-pilot.mjs',
  'scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs',
  'scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs',
  'scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs',
  'scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs',
  'scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs',
  'scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs',
  'scripts/audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs',
  'scripts/audit-fagverk-by-bolig-nabolag-tilgang-endring-phase4.mjs'
];
function bumpByCount(text){
  return text
    .replaceAll('chapters.length===8','chapters.length===9')
    .replaceAll('chapters.length === 8','chapters.length === 9')
    .replaceAll('model.chapters.length===8','model.chapters.length===9')
    .replaceAll('model.chapters.length === 8','model.chapters.length === 9')
    .replaceAll('åtte registrerte','ni registrerte')
    .replaceAll('åtte By-kapitler','ni By-kapitler')
    .replaceAll('åtte kapitler','ni kapitler')
    .replaceAll('EightRegisteredByChapters','NineRegisteredByChapters')
    .replaceAll('EightChapter','NineChapter')
    .replaceAll('eightRegisteredByChapters','nineRegisteredByChapters');
}
for(const p of legacyScripts){const before=read(p), after=bumpByCount(before);assert(after!==before,`Ingen kapitteltallsendring i ${p}`);write(p,after);}

const legacyTests=[
  'tests/fagverk-by-pilot.test.mjs',
  'tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs',
  'tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs',
  'tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs',
  'tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs',
  'tests/fagverk-by-byliv-rytmer-miks-konflikt-phase4.test.mjs',
  'tests/fagverk-by-arkitektur-type-skala-phase4.test.mjs',
  'tests/fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.test.mjs',
  'tests/fagverk-by-bolig-nabolag-tilgang-endring-phase4.test.mjs'
];
for(const p of legacyTests){
  let t=read(p);
  const before=t;
  t=t.replace(/registeredChapterCount\s*,\s*8/g,'registeredChapterCount, 9').replace(/chapterCount\s*,\s*8/g,'chapterCount, 9').replaceAll('EightRegisteredByChapters','NineRegisteredByChapters').replaceAll('EightChapter','NineChapter');
  if(t!==before) write(p,t);
}
let generalTest=read('tests/fagverk-general-engine.test.mjs');
assert(/chapterCount\s*,\s*8/.test(generalTest),'General-engine-test mangler forventet By chapterCount=8');
generalTest=generalTest.replace(/chapterCount\s*,\s*8/g,'chapterCount, 9');
write('tests/fagverk-general-engine.test.mjs',generalTest);

const auditScripts=[...legacyScripts,'scripts/audit-fagverk-by-administrasjon-plan-kontroll-beredskap-phase4.mjs'];
for(const script of auditScripts)execFileSync(process.execPath,[script,'--write-report','--no-check-report'],{cwd:ROOT,stdio:'inherit'});
execFileSync(process.execPath,['scripts/audit-fagverk-general-engine.mjs','--write-report','--no-check-report'],{cwd:ROOT,stdio:'inherit'});
execFileSync(process.execPath,['scripts/build-fagverk-release-manifest.mjs'],{cwd:ROOT,stdio:'inherit'});

const readmePath='reports/fagverk/README.md';
let readme=read(readmePath);
const marker='## By Administrasjon og plan Fase 4';
if(!readme.includes(marker)){
  readme += `\n${marker}\n\nAdministrasjon og plan er materialisert 3/3 gjennom \`administrasjon-plan-kontroll-beredskap\`, med bevaring av Byliv 30/30, Arkitektur 12/12 og Bolig og nabolag 5/5. Permanent audit: \`reports/fagverk/by-administrasjon-plan-kontroll-beredskap-phase4-audit.json\`.\n`;
  write(readmePath,readme);
}
console.log('Administrasjon og plan-materialisering ferdig.');
