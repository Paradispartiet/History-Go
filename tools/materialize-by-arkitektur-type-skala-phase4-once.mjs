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
assert(registry.subjects.by.chapters.length===5,'Første Arkitektur-batch forventer nøyaktig fem Byliv-kapitler som utgangspunkt');
assert(registry.subjects.by.chapters.every((row)=>row.primary_domain_id==='byliv'),'Utgangspunktet skal bare ha de fem ferdige Byliv-kapitlene');
registry.subjects.by.chapters.push({
  id:'arkitektur-type-skala-byform',
  title:'Type, skala og byform: fra hageby til høyhus',
  subtitle:'Hvordan bygningstyper, boligstruktur, historiske lag, høyde, volum og romlig orden kan analyseres uten å gjøre stil, størrelse eller skjønnhet til enkle fasitsvar',
  file:'data/fagverk/by/arkitektur-type-skala-byform.json',
  primary_domain_id:'arkitektur',
  chapter_role:'core',
  emne_ids:[
    'em_by_bygningstyper_og_typologier',
    'em_by_boligstruktur',
    'em_by_historiske_lag_i_hverdagsrom',
    'em_by_skala_hoyde_volum',
    'em_by_romlig_orden',
    'em_by_estetikk_vs_funksjon'
  ],
  claimsFile:'data/fagverk/by/arkitektur-type-skala-byform/claims.json',
  briefFile:'data/fagverk/by/arkitektur-type-skala-byform/brief.json'
});
registry.subjects.by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Pensummodulene og curriculum-arkitekturen eier progresjon. Byliv er kapitteldekket 30/30 gjennom fem kapitler. Første Arkitektur-kapittel dekker 6 av 12 canonicale Arkitektur-emner om type, boligstruktur, historiske lag, skala/volum, romlig orden og estetikk/funksjon. By-faget fortsetter sammenhengende Fase 4-kapittelproduksjon.';
writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const byStatus=status.subjects.find(x=>x.id==='by'); assert(byStatus,'Statusregisteret mangler By');
Object.assign(byStatus,{
  navigationStatus:'materialized',
  assessmentStatus:'audited',
  editorialStatus:'chapters_in_progress',
  nextGate:'chapter_production',
  note:'By & arkitektur fortsetter Fase 4-produksjon. Byliv er ferdig kapitteldekket 30/30 gjennom fem kapitler. Arkitektur-produksjonen er startet med kapittelet Type, skala og byform, som dekker 6 av 12 canonicale Arkitektur-emner med fem metoder, tre redigerte moduler, ni seksjoner, tretten inspectable kilder og atten verified claims. Kapittelet skiller type fra stil, historisk preg fra vernestatus, høyde fra volum og strategisk høyhusramme fra byggerett. Hele By-faget er fortsatt ikke komplett.'
});
writeJson(statusPath,status);

const byPilotPath='scripts/audit-fagverk-by-pilot.mjs'; let byPilot=read(byPilotPath);
byPilot=replaceOnce(byPilot,
"assert(model.chapters.length === 5 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet') && model.chapters.some((chapter) => chapter.id === 'byliv-hendelser-midlertidighet') && model.chapters.some((chapter) => chapter.id === 'byliv-stemning-mikrokomfort') && model.chapters.some((chapter) => chapter.id === 'byliv-rytmer-miks-konflikt'), 'By skal registrere alle fem Byliv-kapitlene i Fase 4');",
"assert(model.chapters.length === 6 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet') && model.chapters.some((chapter) => chapter.id === 'byliv-hendelser-midlertidighet') && model.chapters.some((chapter) => chapter.id === 'byliv-stemning-mikrokomfort') && model.chapters.some((chapter) => chapter.id === 'byliv-rytmer-miks-konflikt') && model.chapters.some((chapter) => chapter.id === 'arkitektur-type-skala-byform'), 'By skal registrere fem Byliv-kapitler og første Arkitektur-kapittel i Fase 4');",
byPilotPath);
write(byPilotPath,byPilot);

const byPilotTestPath='tests/fagverk-by-pilot.test.mjs'; let byPilotTest=read(byPilotTestPath);
byPilotTest=replaceOnce(byPilotTest,'registeredChapterCount: 5','registeredChapterCount: 6',byPilotTestPath);
write(byPilotTestPath,byPilotTest);

const evolutions = [
  {
    audit:'scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs', test:'tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler');","assert(registrySubject.chapters.length === 6, 'By skal nå ha seks registrerte Fase 4-kapitler totalt');"],
    model:["assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');","assert(model.chapters.length === 6, 'Normalisert By-modell skal vise seks kapitler etter første Arkitektur-batch');"],
    gate:['firstChapterPreservedAcrossFiveChapterRegistry: true,','firstChapterPreservedAcrossSixChapterRegistry: true,']
  },
  {
    audit:'scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs', test:'tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler totalt');","assert(registrySubject.chapters.length === 6, 'By skal nå ha seks registrerte Fase 4-kapitler totalt');"],
    model:["assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');","assert(model.chapters.length === 6, 'Normalisert By-modell skal vise seks kapitler etter første Arkitektur-batch');"],
    gate:['secondChapterPreservedAcrossFiveChapterRegistry: true,','secondChapterPreservedAcrossSixChapterRegistry: true,']
  },
  {
    audit:'scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs', test:'tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler totalt');","assert(registrySubject.chapters.length === 6, 'By skal nå ha seks registrerte Fase 4-kapitler totalt');"],
    model:["assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');","assert(model.chapters.length === 6, 'Normalisert By-modell skal vise seks kapitler etter første Arkitektur-batch');"],
    gate:['thirdChapterPreservedAcrossFiveChapterRegistry: true,','thirdChapterPreservedAcrossSixChapterRegistry: true,']
  },
  {
    audit:'scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs', test:'tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs',
    registry:["assert(registrySubject.chapters.length === 5, 'By skal nå ha fem registrerte Fase 4-kapitler totalt');","assert(registrySubject.chapters.length === 6, 'By skal nå ha seks registrerte Fase 4-kapitler totalt');"],
    model:["assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler etter fullført Byliv-batch');","assert(model.chapters.length === 6, 'Normalisert By-modell skal vise seks kapitler etter første Arkitektur-batch');"],
    gate:['fourthChapterPreservedAcrossFiveChapterRegistry: true,','fourthChapterPreservedAcrossSixChapterRegistry: true,']
  }
];
for (const e of evolutions) {
  let a=read(e.audit);
  a=replaceOnce(a,e.registry[0],e.registry[1],e.audit);
  a=replaceOnce(a,e.model[0],e.model[1],e.audit);
  a=replaceOnce(a,e.gate[0],e.gate[1],e.audit);
  write(e.audit,a);
  let t=read(e.test);
  t=replaceOnce(t,'assert.equal(report.subject.registeredChapterCount, 5);','assert.equal(report.subject.registeredChapterCount, 6);',e.test);
  write(e.test,t);
}

const finalBylivAudit='scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs'; let finalAudit=read(finalBylivAudit);
finalAudit=replaceOnce(finalAudit,"assert(registrySubject.chapters.length === 5, 'Femte By Fase 4-batch skal registrere nøyaktig fem kapitler totalt');","assert(registrySubject.chapters.length === 6, 'By skal ha fem Byliv-kapitler og ett Arkitektur-kapittel etter Arkitektur-start');",finalBylivAudit);
finalAudit=replaceOnce(finalAudit,"assert(registrySubject.chapters.map((row) => row.id).join('|') === EXPECTED_CHAPTER_ORDER.join('|'), 'Byliv-kapitlene har feil rekkefølge eller mangler');","assert(registrySubject.chapters.filter((row) => row.primary_domain_id === 'byliv').map((row) => row.id).join('|') === EXPECTED_CHAPTER_ORDER.join('|'), 'Byliv-kapitlene har feil rekkefølge eller mangler');",finalBylivAudit);
finalAudit=replaceOnce(finalAudit,"assert(model.chapters.length === 5, 'Normalisert By-modell skal vise fem kapitler');","assert(model.chapters.length === 6, 'Normalisert By-modell skal vise seks kapitler etter første Arkitektur-batch');",finalBylivAudit);
finalAudit=replaceOnce(finalAudit,"const allChapterRefs = registrySubject.chapters.flatMap((row) => row.emne_ids || []);","const allChapterRefs = registrySubject.chapters.filter((row) => row.primary_domain_id === 'byliv').flatMap((row) => row.emne_ids || []);",finalBylivAudit);
finalAudit=replaceOnce(finalAudit,'exactlyFiveRegisteredByChapters: true,','fiveBylivChaptersPreservedAcrossSixChapterRegistry: true,',finalBylivAudit);
write(finalBylivAudit,finalAudit);

const finalBylivTest='tests/fagverk-by-byliv-rytmer-miks-konflikt-phase4.test.mjs'; let finalTest=read(finalBylivTest);
finalTest=replaceOnce(finalTest,'assert.equal(report.subject.registeredChapterCount, 5);','assert.equal(report.subject.registeredChapterCount, 6);',finalBylivTest);
write(finalBylivTest,finalTest);

const generalTestPath='tests/fagverk-general-engine.test.mjs'; let generalTest=read(generalTestPath);
generalTest=replaceOnce(generalTest,'  assert.equal(by.chapterCount, 5);','  assert.equal(by.chapterCount, 6);',generalTestPath);
write(generalTestPath,generalTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('by-arkitektur-type-skala-phase4-audit.json')) {
  const marker='- `by-byliv-rytmer-miks-konflikt-phase4-audit.json` — femte Fase 4-kapittelgate og Byliv-domenets 30/30-port: fem emner, fem metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med tidsserie-, identitets- og konfliktevidensvakter.\n';
  assert(readme.includes(marker),'README mangler Byliv 30/30-rapportlinjen');
  readme=readme.replace(marker,`${marker}- \`by-arkitektur-type-skala-phase4-audit.json\` — første Arkitektur-kapittelgate: seks av tolv Arkitektur-eide emner, fem metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder; Byliv 30/30 bevares eksplisitt.\n`);
}
if(!readme.includes('audit-fagverk-by-arkitektur-type-skala-phase4.mjs --write-report')) {
  const marker='node scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs\n';
  assert(readme.includes(marker),'README mangler Byliv 30/30-kommando');
  readme=readme.replace(marker,`${marker}node scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs\n`);
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
node(['scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-by-pilot.mjs']);
node(['scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs']);
node(['scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs']);
node(['scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-by-pilot.test.mjs']);
node(['--test','tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs']);
node(['--test','tests/fagverk-by-byliv-rytmer-miks-konflikt-phase4.test.mjs']);
node(['--test','tests/fagverk-by-arkitektur-type-skala-phase4.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('Første Arkitektur-kapittel materialisert: Arkitektur 6/12, Byliv fortsatt 30/30, By-subjektet fortsetter.');
