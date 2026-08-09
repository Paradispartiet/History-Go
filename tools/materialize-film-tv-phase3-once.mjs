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

const manifestPath='data/fag/fag_manifest.json';
const manifest=readJson(manifestPath); assert(manifest.film_tv,'Manifest mangler Film & TV');
manifest.film_tv.emneMappings='TV_og_Film/emnemapping_film_tv_canonical_v4_5.json'; writeJson(manifestPath,manifest);

const inventoryPath='data/fagverk/subject_inventory.json';
const inventory=readJson(inventoryPath); inventory.version=bumpMinor(inventory.version); inventory.updatedAt=UPDATED_AT;
const ie=inventory.subjects.find(x=>x.id==='film_tv'); assert(ie,'Inventar mangler Film & TV');
ie.optionalManifestFields ||= []; if(!ie.optionalManifestFields.includes('emneMappings')) ie.optionalManifestFields.push('emneMappings'); writeJson(inventoryPath,inventory);

const portalPath='data/fagverk/fagverk_portal.json';
const portal=readJson(portalPath); portal.version=bumpMinor(portal.version); portal.updatedAt=UPDATED_AT;
const pe=portal.categories.find(x=>x.id==='film_tv'); assert(pe,'Portalen mangler Film & TV'); pe.subjectPage='fagverk.html?subject=film_tv'; pe.subjectStatus='materialized'; writeJson(portalPath,portal);

const statusPath='data/fagverk/subject_status.json';
const status=readJson(statusPath); status.version=bumpMinor(status.version); status.updatedAt=UPDATED_AT;
const se=status.subjects.find(x=>x.id==='film_tv'); assert(se,'Status mangler Film & TV');
Object.assign(se,{navigationStatus:'materialized',assessmentStatus:'audited',editorialStatus:'structure_ready',nextGate:'chapter_production',note:'Film & TV er det sjuende individuelt materialiserte Fase 3-faget og fullfører materialisering av alle 17 toppfag. Standardadapteren viser seks canonicale fagområder, 120 emner, 107 metoder, 120 normaliserte mappinger og 60 hooks. Alle emner er dekket i pensum, fagkart og eksplisitt mappingregister, alle metodekoblinger er løst, og generatorens canonicale tellinger er synkronisert. Source-first er bindende: konkrete film- og TV-verk, scener, kinoer, studioer, TV-hus, locations, produksjoner, kringkasting, publikum og audiovisuelle arkivspor skal komme før teori; canonicalfilene er styring, ikke faktakilde. Redaksjonelle kapitler registreres ikke før fulltekst, claims og inspectable kilder er produsert.'}); writeJson(statusPath,status);

const registryPath='data/fagverk/fagverk_registry.json';
const registry=readJson(registryPath); registry.version=bumpMinor(registry.version); registry.updatedAt=UPDATED_AT; registry.placePage ||= {}; registry.placePage.fallbackSubjectByCategory ||= {}; registry.placePage.fallbackSubjectByCategory.film_tv='film_tv'; registry.subjects ||= {};
registry.subjects.film_tv={title:'Film & TV',description:'Et audiovisuelt fagverk om kino og publikum, produksjon og studioarbeid, locations og byrom, sjanger og fortelling, institusjoner og offentlighet samt film- og TV-minne. Faget starter i dokumenterte verk, scener, kamera, klipp, lyd, produksjoner, visningssteder, TV-hus, locations, kringkasting, arkiver og publikumsformer før metode og teori løftes inn.',canonicalModel:{manifest:'data/fag/fag_manifest.json',schemaFamily:'standard_canonical',sourceOfTruth:true,note:'Seks pensum-eide områder, 120 emner, 107 metoder, 120 eksplisitte mappinger og 60 hooks. Source-first, ekstern claim-basis og audiovisuelle ankere er bindende. Ingen kapitler registreres før fulltekst, claims og inspectable kilder finnes.'},chapters:[]}; writeJson(registryPath,registry);

const badgePath='data/fag/TV_og_Film/merke_film_tv.html'; let badge=read(badgePath);
if(!badge.includes('../../../fagverk.html?subject=film_tv')) badge=replaceOnce(badge,'  <main class="merke-main">\n','  <main class="merke-main">\n    <p class="merke-fagverk-lenker"><a href="../../../fagverk.html?subject=film_tv">Åpne Film & TV-faget</a> · <a href="../../../fagverk-forside.html">Se alle fagverk</a></p>\n',badgePath); write(badgePath,badge);

const invTestPath='tests/fagverk-subject-inventory.test.mjs'; let invTest=read(invTestPath);
invTest=replaceOnce(invTest,"['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','scenekunst','sport','subkultur','vitenskap','filosofi']","['by','historie','kunst','litteratur','media','musikk','naeringsliv','natur','politikk','psykologi','religion','scenekunst','sport','subkultur','vitenskap','filosofi','film_tv']",invTestPath);
invTest=replaceOnce(invTest,"['by','kunst','media','psykologi','religion','scenekunst','sport','vitenskap','filosofi']","['by','kunst','media','psykologi','religion','scenekunst','sport','vitenskap','filosofi','film_tv']",invTestPath); write(invTestPath,invTest);

const genTestPath='tests/fagverk-general-engine.test.mjs'; let genTest=read(genTestPath);
const marker=`  assert.equal(filosofi.chapterCount, 0);\n`; assert(genTest.includes(marker),'General-engine mangler Filosofi-markør');
const block=`${marker}  const filmTv = result.materializedRows.find((row) => row.id === 'film_tv');\n  assert.ok(filmTv);\n  assert.equal(filmTv.schemaFamily, 'standard_canonical');\n  assert.equal(filmTv.adapter, 'standard');\n  assert.equal(filmTv.domainCount, 6);\n  assert.equal(filmTv.emneCount, 120);\n  assert.equal(filmTv.methodCount, 107);\n  assert.equal(filmTv.mappingCount, 120);\n  assert.equal(filmTv.hookCount, 60);\n  assert.equal(filmTv.chapterCount, 0);\n`; genTest=genTest.replace(marker,block); write(genTestPath,genTest);

const readmePath='reports/fagverk/README.md'; let readme=read(readmePath);
if(!readme.includes('film-tv-phase3-audit.json')){ const m=readme.split('\n').find(l=>l.includes('filosofi-phase3-audit.json')); assert(m,'README mangler Filosofi-rapport'); readme=readme.replace(`${m}\n`,`${m}\n- \`film-tv-phase3-audit.json\` — individuell Fase 3-gate for Film & TV: seks områder, 120 emner, 107 metoder, 120 mappinger og 60 hooks med audiovisuelle source-first- og kategorigrenser.\n`); }
if(!readme.includes('audit-fagverk-film-tv-phase3.mjs --write-report')){ const m='node scripts/audit-fagverk-filosofi-phase3.mjs\n'; assert(readme.includes(m),'README mangler Filosofi-kommando'); readme=readme.replace(m,`${m}node scripts/audit-fagverk-film-tv-phase3.mjs --write-report\nnode scripts/audit-fagverk-film-tv-phase3.mjs\n`); } write(readmePath,readme);

function node(args){ execFileSync(process.execPath,args,{cwd:ROOT,stdio:'inherit'}); }
node(['scripts/audit-fagverk-subject-inventory.mjs','--write-report']);
node(['scripts/audit-fagverk-general-engine.mjs','--write-report']);
node(['scripts/audit-fagverk-film-tv-phase3.mjs','--write-report','--no-check-report']);
node(['scripts/build-fagverk-release-manifest.mjs']);
node(['scripts/audit-fagverk-subject-inventory.mjs']);
node(['scripts/audit-fagverk-general-engine.mjs']);
node(['scripts/audit-fagverk-film-tv-phase3.mjs']);
node(['scripts/build-fagverk-release-manifest.mjs','--check']);
node(['--test','tests/fagverk-subject-inventory.test.mjs']);
node(['--test','tests/fagverk-general-engine.test.mjs']);
node(['--test','tests/fagverk-film-tv-phase3.test.mjs']);
node(['--test','tests/fagverk-release-manifest.test.mjs']);
console.log('Film & TV Fase 3 materialisert og validert.');
