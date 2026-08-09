#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const at=(p)=>path.join(ROOT,p), read=(p)=>fs.readFileSync(at(p),'utf8'), write=(p,v)=>fs.writeFileSync(at(p),v), json=(p)=>JSON.parse(read(p)), writeJson=(p,v)=>write(p,`${JSON.stringify(v,null,2)}\n`);
const assert=(c,m)=>{if(!c)throw new Error(m);};
const bump=(v)=>{const p=String(v||'0.0.0').split('.').map(Number);assert(p.length===3&&!p.some(Number.isNaN),`Ugyldig versjon ${v}`);return `${p[0]}.${p[1]+1}.0`;};
const replaceRequired=(text,from,to,file)=>{assert(text.includes(from),`Fant ikke forventet tekst i ${file}: ${from}`);return text.split(from).join(to);};
const UPDATED_AT='2026-08-09';

const registryPath='data/fagverk/fagverk_registry.json'; const registry=json(registryPath); registry.version=bump(registry.version); registry.updatedAt=UPDATED_AT; const rs=registry.subjects?.by;
assert(rs&&Array.isArray(rs.chapters)&&rs.chapters.length===7,'Bolig og nabolag-materialisering forventer sju eksisterende By-kapitler');
assert(rs.chapters.filter((r)=>r.primary_domain_id==='byliv').length===5,'Byliv skal ha fem kapitler før boligbatch');
assert(rs.chapters.filter((r)=>r.primary_domain_id==='arkitektur').length===2,'Arkitektur skal ha to kapitler før boligbatch');
rs.chapters.push({id:'bolig-nabolag-tilgang-endring',title:'Bolig, tilgang og nabolagsendring: hvem kan bli boende?',subtitle:'Fra drabantby og eie/leie til gentrifisering, ulikhet og fellesrom',file:'data/fagverk/by/bolig-nabolag-tilgang-endring.json',primary_domain_id:'bolig_og_nabolag',chapter_role:'core',emne_ids:['em_by_modernistisk_boligplanlegging','em_by_eie_vs_leie_boligokonomi','em_by_gentrifisering_eiendom','em_by_bydelsforskjeller_segregering','em_by_sittekanter_trapper_uformelle_soner'],claimsFile:'data/fagverk/by/bolig-nabolag-tilgang-endring/claims.json',briefFile:'data/fagverk/by/bolig-nabolag-tilgang-endring/brief.json'});
rs.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Byliv er kapitteldekket 30/30 gjennom fem kapitler. Arkitektur er kapitteldekket 12/12 gjennom to kapitler. Bolig og nabolag er nå kapitteldekket 5/5 gjennom ett kapittel. By-faget fortsetter sammenhengende Fase 4-produksjon i neste canonicale fagområde.'; writeJson(registryPath,registry);

const statusPath='data/fagverk/subject_status.json'; const status=json(statusPath); status.version=bump(status.version); status.updatedAt=UPDATED_AT; const bs=status.subjects.find((r)=>r.id==='by'); assert(bs,'Status mangler By'); Object.assign(bs,{navigationStatus:'materialized',assessmentStatus:'audited',editorialStatus:'chapters_in_progress',nextGate:'chapter_production',note:'By & arkitektur fortsetter Fase 4. Byliv er 30/30, Arkitektur 12/12 og Bolig og nabolag 5/5 kapitteldekket. Hele By-faget er fortsatt ikke komplett; neste canonicale fagområde skal produseres sammenhengende.'}); writeJson(statusPath,status);

const priorAudits=[
 'scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs','scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs','scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs','scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs','scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs','scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs','scripts/audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs'];
const priorTests=[
 'tests/fagverk-by-byliv-offentlige-rom-phase4.test.mjs','tests/fagverk-by-byliv-sosial-offentlighet-phase4.test.mjs','tests/fagverk-by-byliv-hendelser-midlertidighet-phase4.test.mjs','tests/fagverk-by-byliv-stemning-mikrokomfort-phase4.test.mjs','tests/fagverk-by-byliv-rytmer-miks-konflikt-phase4.test.mjs','tests/fagverk-by-arkitektur-type-skala-phase4.test.mjs','tests/fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.test.mjs'];
for(const file of priorAudits){let t=read(file);t=t.replaceAll('registrySubject.chapters.length === 7','registrySubject.chapters.length === 8').replaceAll('rs.chapters.length===7','rs.chapters.length===8').replaceAll('model.chapters.length === 7','model.chapters.length === 8').replaceAll('model.chapters.length===7','model.chapters.length===8').replaceAll('SevenChapterRegistry','EightChapterRegistry').replaceAll('sevenChapterRegistry','eightChapterRegistry').replaceAll('exactlySevenRegisteredByChapters','preservedAcrossEightRegisteredByChapters').replaceAll('sju registrerte By-kapitler','åtte registrerte By-kapitler').replaceAll('sju registrerte','åtte registrerte').replaceAll('sju kapitler','åtte kapitler');write(file,t);}
for(const file of priorTests){let t=read(file);t=t.replaceAll('registeredChapterCount, 7','registeredChapterCount, 8').replaceAll('registeredChapterCount: 7','registeredChapterCount: 8');write(file,t);}

const pilot='scripts/audit-fagverk-by-pilot.mjs'; let p=read(pilot); p=replaceRequired(p,'model.chapters.length === 7','model.chapters.length === 8',pilot); p=replaceRequired(p,"model.chapters.some((chapter) => chapter.id === 'arkitektur-gatekant-makt-ombruk')","model.chapters.some((chapter) => chapter.id === 'arkitektur-gatekant-makt-ombruk') && model.chapters.some((chapter) => chapter.id === 'bolig-nabolag-tilgang-endring')",pilot); write(pilot,p);
const pilotTest='tests/fagverk-by-pilot.test.mjs'; let pt=read(pilotTest); pt=replaceRequired(pt,'registeredChapterCount: 7','registeredChapterCount: 8',pilotTest); write(pilotTest,pt);
const generalTest='tests/fagverk-general-engine.test.mjs'; let gt=read(generalTest); gt=replaceRequired(gt,'assert.equal(by.chapterCount, 7);','assert.equal(by.chapterCount, 8);',generalTest); write(generalTest,gt);
const readme='reports/fagverk/README.md'; let rd=read(readme); if(!rd.includes('by-bolig-nabolag-tilgang-endring-phase4-audit.json')) rd+='\n- `by-bolig-nabolag-tilgang-endring-phase4-audit.json` — Bolig og nabolag 5/5: fem emner, seks metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder; Byliv 30/30 og Arkitektur 12/12 bevares.\n'; write(readme,rd);

const node=(args)=>execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'});
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']); node(['scripts/audit-fagverk-general-engine.mjs','--write-report']); node([pilot,'--write-report']); for(const a of priorAudits)node([a,'--write-report','--no-check-report']); node(['scripts/audit-fagverk-by-bolig-nabolag-tilgang-endring-phase4.mjs','--write-report','--no-check-report']); node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']); node(['scripts/audit-fagverk-general-engine.mjs']); node([pilot]); for(const a of priorAudits)node([a]); node(['scripts/audit-fagverk-by-bolig-nabolag-tilgang-endring-phase4.mjs']); node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']); node(['--test','tests/fagverk-general-engine.test.mjs']); node(['--test',pilotTest]); for(const t of priorTests)node(['--test',t]); node(['--test','tests/fagverk-by-bolig-nabolag-tilgang-endring-phase4.test.mjs']); node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('Bolig og nabolag materialisert 5/5; Byliv 30/30 og Arkitektur 12/12 bevart; By fortsetter.');
