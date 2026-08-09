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
assert(registry.subjects.by.chapters.length===4,'Femte By Fase 4-batch forventer nøyaktig fire kapitler som utgangspunkt');
assert(registry.subjects.by.chapters.map(x=>x.id).join('|')==='byliv-offentlige-rom|byliv-sosial-offentlighet|byliv-hendelser-midlertidighet|byliv-stemning-mikrokomfort','Byliv-kapitlene har uventet rekkefølge før kapittel 5');
registry.subjects.by.chapters.push({
  id:'byliv-rytmer-miks-konflikt',
  title:'Rytmer, sosial miks og hverdagsfriksjon: hvem deler byen når?',
  subtitle:'Hvordan dag/natt, ukedag/helg, samtilstedeværelse og konkurrerende bruk kan undersøkes uten å forveksle øyeblikksbilder, identitet og konflikt',
  file:'data/fagverk/by/byliv-rytmer-miks-konflikt.json',
  primary_domain_id:'byliv',
  chapter_role:'core',
  emne_ids:[
    'em_by_tidsrytmer_i_bylivet',
    'em_by_dag_vs_natt',
    'em_by_ukedag_vs_helg',
    'em_by_sosial_miks_i_offentlige_rom',
    'em_by_sma_hverdagskonflikter'
  ],
  claimsFile:'data/fagverk/by/byliv-rytmer-miks-konflikt/claims.json',
  briefFile:'data/fagverk/by/byliv-rytmer-miks-konflikt/brief.json'
});
registry.subjects.by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Pensummodulene og curriculum-arkitekturen eier progresjon. Fem redigerte Fase 4-kapitler dekker nå nøyaktig alle 30 canonicale Byliv-emner med femten moduler, 63 inspectable kapittelkilder og 90 claimsporede påstander. Byliv er dermed kapitteldekket 30/30, mens de øvrige elleve By-fagområdene fortsatt er under sammenhengende kapittelproduksjon.';
writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const byStatus=status.subjects.find(x=>x.id==='by'); assert(byStatus,'Statusregisteret mangler By');
Object.assign(byStatus,{
  navigationStatus:'materialized',
  assessmentStatus:'audited',
  editorialStatus:'chapters_in_progress',
  nextGate:'chapter_production',
  note:'By & arkitektur fortsetter Fase 4-produksjon. Byliv-domenet er nå redaksjonelt kapitteldekket 30/30 gjennom fem kapitler. Kapittel 5 dekker tidsrytmer, dag/natt, ukedag/helg, sosial miks og små hverdagskonflikter med fem canonicale emner, fem metoder, tre redigerte moduler, ni seksjoner, tretten inspectable kilder og atten verified claims. Sensitive identitetsinferenser, oppdiktede intervjuer, øyeblikksbilde=rytme og sambruk=konflikt er eksplisitt blokkert. By-faget er fortsatt ikke komplett; neste gate er kapittelproduksjon i neste canonicale By-fagområde.'
});
writeJson(statusPath,status);

const byPilotPath='scripts/audit-fagverk-by-pilot.mjs'; let byPilot=read(byPilotPath);
byPilot=replaceOnce(byPilot,"assert(model.chapters.length === 4 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet') && model.chapters.some((chapter) => chapter.id === 'byliv-hendelser-midlertidighet') && model.chapters.some((chapter) => chapter.id === 'byliv-stemning-mikrokomfort'), 'By skal registrere alle fire Byliv-kapitlene i Fase 4');","assert(model.chapters.length === 5 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet') && model.chapters.some((chapter) => chapter.id === 'byliv-hendelser-midlertidighet') && model.chapters.some((chapter) => chapter.id === 'byliv-stemning-mikrokomfort') && model.chapters.some((chapter) => chapter.id === 'byliv-rytmer-miks-konflikt'), 'By skal registrere alle fem Byliv-kapitlene i Fase 4');",byPilotPath);
write(byPilotPath,byPilot);

const byPilotTestPath='tests/fagverk-by-pilot.test.mjs'; let byPilotTest=read(byPilotTestPath);
byPilotTest=replaceOnce(byPilotTest,'registeredChapterCount: 4','registeredChapterCount: 5',byPilotTestPath);
write(byPilotTestPath,byPilotTest);

const evolutions = [
  {
    audit:'scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs',
    test:'tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 4, 'By skal nå ha fire registrerte Fase 4-kapitler');","assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler');"],
    model:["assert(model.chapters.length === 4, 'Normalisert By-modell skal vise fire kapitler etter fjerde Byliv-batch');","assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');"],
    gate:['firstChapterPreservedAcrossFourChapterRegistry: true,','firstChapterPreservedAcrossFiveChapterRegistry: true,']
  },
  {
    audit:'scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs',
    test:'tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 4, 'By skal nå ha fire registrerte Fase 4-kapitler totalt');","assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler totalt');"],
    model:["assert(model.chapters.length === 4, 'Normalisert By-modell skal vise fire kapitler etter fjerde Byliv-batch');","assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');"],
    gate:['secondChapterPreservedAcrossFourChapterRegistry: true,','secondChapterPreservedAcrossFiveChapterRegistry: true,']
  },
  {
    audit:'scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs',
    test:'tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 4, 'By skal nå ha fire registrerte Fase 4-kapitler totalt');","assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler totalt');"],
    model:["assert(model.chapters.length === 4, 'Normalisert By-modell skal vise fire kapitler etter fjerde Byliv-batch');","assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');"],
    gate:['thirdChapterPreservedAcrossFourChapterRegistry: true,','thirdChapterPreservedAcrossFiveChapterRegistry: true,']
  },
  {
    audit:'scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs',
    test:'tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 4, 'Fjerde By Fase 4-batch skal registrere nøyaktig fire kapitler totalt');","assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler totalt');"],
    model:["assert(model.chapters.length === 4, 'Normalisert By-modell skal vise fire kapitler');","assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');"],
    gate:['exactlyFourRegisteredByChapters: true,','fourthChapterPreservedAcrossFiveChapterRegistry: true,']
  }
];
for (const e of evolutions) {
  let a=read(e.audit);
  a=replaceOnce(a,e.registry[0],e.registry[1],e.audit);
  a=replaceOnce(a,e.model[0],e.model[1],e.audit);
  a=replaceOnce(a,e.gate[0],e.gate[1],e.audit);
  write(e.audit,a);
  let t=read(e.test);
  t=replaceOnce(t,'assert.equal(report.subject.registeredChapterCount, 4);','assert.equal(report.subject.registeredChapterCount, 5);',e.test);
  write(e.test,t);
}

const generalTestPath='tests/fagverk-general-engine.test.mjs'; let generalTest=read(generalTestPath);
generalTest=replaceOnce(generalTest,'  assert.equal(by.chapterCount, 4);','  assert.equal(by.chapterCount, 5);',generalTestPath);
write(generalTestPath,generalTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('by-byliv-rytmer-miks-konflikt-phase4-audit.json')) {
  const marker='- `by-byliv-stemning-mikrokomfort-phase4-audit.json` — fjerde Fase 4-kapittelgate for By: fem Byliv-emner, fem metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med målefabrikasjons- og evidenslagvakt.\n';
  assert(readme.includes(marker),'README mangler fjerde By Fase 4-rapportlinje');
  readme=readme.replace(marker,`${marker}- \`by-byliv-rytmer-miks-konflikt-phase4-audit.json\` — femte Fase 4-kapittelgate og Byliv-domenets 30/30-port: fem emner, fem metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med tidsserie-, identitets- og konfliktevidensvakter.\n`);
}
if(!readme.includes('audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs --write-report')) {
  const marker='node scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs\n';
  assert(readme.includes(marker),'README mangler fjerde By Fase 4-kommando');
  readme=readme.replace(marker,`${marker}node scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs\n`);
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
node(['scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-by-pilot.mjs']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-by-pilot.test.mjs']);
node(['--test','tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-rytmer-miks-konflikt-phase4.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('Siste Byliv-kapittel materialisert: canonical Byliv er 30/30 kapitteldekket, By-subjektet fortsetter.');
