#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rel=(p)=>path.join(ROOT,p);
const read=(p)=>fs.readFileSync(rel(p),'utf8');
const json=(p)=>JSON.parse(read(p));
const writeJson=(p,value)=>fs.writeFileSync(rel(p),`${JSON.stringify(value,null,2)}\n`,'utf8');
const write=(p,value)=>fs.writeFileSync(rel(p),value,'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m);};

const chapter={
  id:'urbanisme-idealer-forbindelser-fortetting',
  title:'Byidealer, forbindelser og fortetting: fra planmodell til faktisk by',
  subtitle:'Hvordan ideer om blanding, mobilitet og tetthet blir planer, fysiske spor og omstridte hverdagsmiljøer',
  file:'data/fagverk/by/urbanisme-idealer-forbindelser-fortetting.json',
  primary_domain_id:'urbanisme',
  chapter_role:'core',
  emne_ids:[
    'em_by_byidealer_og_plantradisjoner',
    'em_by_funksjonsdeling_vs_blandet_by',
    'em_by_infrastruktur_mobilitet',
    'em_by_barrierer_forbindelser',
    'em_by_tetthet_og_fortetting',
    'em_by_teori_vs_praksis_i_byutvikling'
  ],
  claimsFile:'data/fagverk/by/urbanisme-idealer-forbindelser-fortetting/claims.json',
  briefFile:'data/fagverk/by/urbanisme-idealer-forbindelser-fortetting/brief.json'
};

function materializeRegistry(){
  const p='data/fagverk/fagverk_registry.json';
  const doc=json(p); const by=doc.subjects?.by;
  assert(by&&Array.isArray(by.chapters),'By mangler i registry');
  assert(doc.version==='2.43.0'||doc.version==='2.44.0',`Uventet registry-versjon ${doc.version}`);
  const existing=by.chapters.find((r)=>r.id===chapter.id);
  if(!existing) by.chapters.push(chapter);
  else Object.assign(existing,chapter);
  assert(by.chapters.length===10,`Registry skal ha 10 By-kapitler, fikk ${by.chapters.length}`);
  doc.version='2.44.0';
  doc.updatedAt='2026-08-09';
  by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Byliv er kapitteldekket 30/30 gjennom fem kapitler. Arkitektur er kapitteldekket 12/12 gjennom to kapitler. Bolig og nabolag er kapitteldekket 5/5 gjennom ett kapittel. Administrasjon og plan er kapitteldekket 3/3 gjennom ett kapittel. Urbanisme er nå kapitteldekket 6/6 gjennom ett kapittel. By-faget fortsetter sammenhengende Fase 4-produksjon i neste canonicale fagområde.';
  writeJson(p,doc);
}

function materializeStatus(){
  const p='data/fagverk/subject_status.json';
  const doc=json(p); const by=doc.subjects?.find((r)=>r.id==='by');
  assert(by,'By mangler i subject_status');
  assert(doc.version==='2.42.0'||doc.version==='2.43.0',`Uventet status-versjon ${doc.version}`);
  doc.version='2.43.0'; doc.updatedAt='2026-08-09';
  by.navigationStatus='materialized'; by.assessmentStatus='audited'; by.editorialStatus='chapters_in_progress'; by.nextGate='chapter_production';
  by.note='By & arkitektur fortsetter Fase 4. Byliv er 30/30, Arkitektur 12/12, Bolig og nabolag 5/5, Administrasjon og plan 3/3 og Urbanisme 6/6 kapitteldekket. Hele By-faget er fortsatt ikke komplett; neste canonicale fagområde skal produseres sammenhengende.';
  writeJson(p,doc);
}

function bumpLegacyByAudits(){
  const dir=rel('scripts');
  for(const name of fs.readdirSync(dir).filter((n)=>n.startsWith('audit-fagverk-by-')&&n.endsWith('.mjs')&&!n.includes('urbanisme-idealer-forbindelser-fortetting'))){
    const p=`scripts/${name}`; let text=read(p);
    text=text.replace(/(\.chapters\.length\s*===\s*)9\b/g,'$110');
    text=text.replace(/exactlyNineRegisteredByChapters/g,'preservedAcrossTenRegisteredByChapters');
    text=text.replace(/preservedAcrossNineRegisteredByChapters/g,'preservedAcrossTenRegisteredByChapters');
    text=text.replace(/preservedAcrossNineChapterRegistry/g,'preservedAcrossTenChapterRegistry');
    text=text.replace(/AcrossNineChapterRegistry/g,'AcrossTenChapterRegistry');
    text=text.replace(/AcrossNineRegisteredByChapters/g,'AcrossTenRegisteredByChapters');
    write(p,text);
  }
  const tdir=rel('tests');
  for(const name of fs.readdirSync(tdir).filter((n)=>n.startsWith('fagverk-by-')&&n.endsWith('.test.mjs')&&!n.includes('urbanisme-idealer-forbindelser-fortetting'))){
    const p=`tests/${name}`; let text=read(p);
    text=text.replace(/(registeredChapterCount\s*,\s*)9\b/g,'$110');
    write(p,text);
  }
  const general='tests/fagverk-general-engine.test.mjs';
  let gt=read(general).replace('assert.equal(by.chapterCount, 9);','assert.equal(by.chapterCount, 10);');
  write(general,gt);
}

function updateReadme(){
  const p='reports/fagverk/README.md'; let text=read(p);
  const bullet='- `by-urbanisme-idealer-forbindelser-fortetting-phase4-audit.json` — Urbanisme-domenets 6/6-port: seks canonicale eieremner, åtte metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kommunale kilder med eksplisitte vakter mellom planideal, gjennomføring og målt/observert effekt.\n';
  if(!text.includes('by-urbanisme-idealer-forbindelser-fortetting-phase4-audit.json')) text=text.replace('\n## Regenerering\n',`\n${bullet}\n## Regenerering\n`);
  const commands='node scripts/audit-fagverk-by-urbanisme-idealer-forbindelser-fortetting-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-urbanisme-idealer-forbindelser-fortetting-phase4.mjs\n';
  if(!text.includes('audit-fagverk-by-urbanisme-idealer-forbindelser-fortetting-phase4.mjs --write-report')) text=text.replace('```bash\n','```bash\n'+commands);
  write(p,text);
}

function regenerate(){
  const scripts=fs.readdirSync(rel('scripts')).filter((n)=>n.startsWith('audit-fagverk-by-')&&n.endsWith('.mjs')).sort();
  for(const name of scripts) execFileSync(process.execPath,[rel(`scripts/${name}`),'--write-report'],{cwd:ROOT,stdio:'inherit'});
  execFileSync(process.execPath,[rel('scripts/audit-fagverk-general-engine.mjs'),'--write-report'],{cwd:ROOT,stdio:'inherit'});
  execFileSync(process.execPath,[rel('scripts/build-fagverk-release-manifest.mjs')],{cwd:ROOT,stdio:'inherit'});
}

materializeRegistry();
materializeStatus();
bumpLegacyByAudits();
updateReadme();
regenerate();
console.log('Urbanisme materialisert: registry 2.44.0, status 2.43.0, 10 By-kapitler og regenererte rapporter/release.');
