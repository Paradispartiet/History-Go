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

const portalPath='data/fagverk/fagverk_portal.json';
const portal=readJson(portalPath); portal.version=bumpMinor(portal.version); portal.updatedAt=UPDATED_AT;
const pe=portal.categories.find(x=>x.id==='filosofi'); assert(pe,'Portalen mangler Filosofi'); pe.subjectPage='fagverk.html?subject=filosofi'; pe.subjectStatus='materialized'; writeJson(portalPath,portal);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const se=status.subjects.find(x=>x.id==='filosofi'); assert(se,'Status mangler Filosofi'); Object.assign(se,{navigationStatus:'materialized',assessmentStatus:'audited',editorialStatus:'structure_ready',nextGate:'chapter_production',note:'Filosofi er det sjette individuelt materialiserte Fase 3-faget. Foundation v1-adapteren viser tretten fagkart-eide fagområder, 54 aktive emner, 27 canonicale metoder, 54 normaliserte mappinger og 37 hooks. De tretten pensummodulene bevares som progresjonslag. Det canonicale begrepsregisteret har 162 begreper og teoretikerregisteret 157 oppføringer (149 aktive, 8 kontekstuelle); alle referanser fra pensum, emner og hooks er auditert. Argument-first, kildekrav, dokumentert stedsanker og global kanon uten tokenisme er bindende. Redaksjonelle kapitler registreres ikke før fulltekst, claims og inspectable kilder er produsert.'}); writeJson(statusPath,status);

const registryPath='data/fagverk/fagverk_registry.json';
const registry=readJson(registryPath); registry.version=bumpMinor(registry.version); registry.updatedAt=UPDATED_AT; registry.placePage ||= {}; registry.placePage.fallbackSubjectByCategory ||= {}; registry.placePage.fallbackSubjectByCategory.filosofi='filosofi'; registry.subjects ||= {};
registry.subjects.filosofi={title:'Filosofi',description:'Et argument-, begreps- og problemorientert fagverk om logikk, erkjennelse, virkelighet, sinn, etikk, politikk, makt, estetikk, vitenskap, teknologi, eksistens, miljø og globale filosofiske tradisjoner. Faget kobler eksplisitte argumenter, verk og begreper til dokumenterte institusjoner, personer og steder uten å redusere filosofi til navnegjetting eller personlig mening.',canonicalModel:{manifest:'data/fag/fag_manifest.json',schemaFamily:'foundation_v1',sourceOfTruth:true,note:'Tretten fagkart-eide områder styrer rendererstrukturen. 54 aktive emner, 27 metoder og 37 hooks er løst; pensummodulene er progresjon. Begreps- og teoretikerregistrene er canonicale referanseregistre. Ingen kapitler registreres før fulltekst, claims og inspectable kilder finnes.'},chapters:[]}; writeJson(registryPath,registry);

const badgePath='data/fag/filosofi/merke_filosofi.html'; let badge=read(badgePath);
if(!badge.includes('../../../fagverk.html?subject=filosofi')) badge=replaceOnce(badge,'  <main class="merke-main">\n','  <main class="merke-main">\n    <p class="merke-fagverk-lenker"><a href="../../../fagverk.html?subject=filosofi">Åpne Filosofi-faget</a> · <a href="../../../fagverk-forside.html">Se alle fagverk</a></p>\n',badgePath); write(badgePath,badge);

const invTestPath='tests/fagverk-subject-inventory.test.mjs'; let invTest=read(invTestPath);
invTest=replaceOnce(invTest,"['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','scenekunst','sport','subkultur','vitenskap']","['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','scenekunst','sport','subkultur','vitenskap','filosofi']",invTestPath);
invTest=replaceOnce(invTest,"['by','kunst','media','psykologi','religion','scenekunst','sport','vitenskap']","['by','kunst','media','psykologi','religion','scenekunst','sport','vitenskap','filosofi']",invTestPath); write(invTestPath,invTest);

const genTestPath='tests/fagverk-general-engine.test.mjs'; let genTest=read(genTestPath);
const marker=`  assert.equal(sport.chapterCount, 0);\n`; assert(genTest.includes(marker),'General-engine mangler Sport-markør');
const block=`${marker}  const filosofi = result.materializedRows.find((row) => row.id === 'filosofi');\n  assert.ok(filosofi);\n  assert.equal(filosofi.schemaFamily, 'foundation_v1');\n  assert.equal(filosofi.adapter, 'standard');\n  assert.equal(filosofi.domainCount, 13);\n  assert.equal(filosofi.emneCount, 54);\n  assert.equal(filosofi.methodCount, 27);\n  assert.equal(filosofi.mappingCount, 54);\n  assert.equal(filosofi.hookCount, 37);\n  assert.equal(filosofi.chapterCount, 0);\n`; genTest=genTest.replace(marker,block); write(genTestPath,genTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('filosofi-phase3-audit.json')){ const m=readme.split('\n').find(l=>l.includes('sport-phase3-audit.json')); assert(m,'README mangler Sport-rapport'); readme=readme.replace(`${m}\n`,`${m}\n- \`filosofi-phase3-audit.json\` — individuell Fase 3-gate for Filosofi: 13 områder, 54 emner, 27 metoder, 37 hooks, 162 begreper og 157 teoretikeroppføringer med referanseintegritet.\n`); }
if(!readme.includes('audit-fagverk-filosofi-phase3.mjs --write-report')){ const m='node scripts/audit-fagverk-sport-phase3.mjs\n'; assert(readme.includes(m),'README mangler Sport-kommando'); readme=readme.replace(m,`${m}node scripts/audit-fagverk-filosofi-phase3.mjs --write-report\nnode scripts/audit-fagverk-filosofi-phase3.mjs\n`); } write(readmePath,readme);

console.log('Filosofi source domain ids:', JSON.stringify(readJson('data/fag/filosofi/fagkart_filosofi_canonical_v1.json').categories.map(x=>x.id)));
function node(args){ execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'}); }
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs','--write-report']);
node(['scripts/audit-fagverk-filosofi-phase3.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-filosofi-phase3.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-filosofi-phase3.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('Filosofi Fase 3 materialisert og validert.');
