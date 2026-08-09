#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const abs=(p)=>path.join(ROOT,p),read=(p)=>fs.readFileSync(abs(p),'utf8'),json=(p)=>JSON.parse(read(p));
const write=(p,v)=>fs.writeFileSync(abs(p),v,'utf8'),writeJson=(p,v)=>write(p,`${JSON.stringify(v,null,2)}\n`);
const assert=(c,m)=>{if(!c)throw new Error(m);};
const chapter={id:'historiske-lag-ruiner-minner',title:'Ruiner, tomrom og minnespor: hvordan byen husker',subtitle:'Fra arkeologiske rester og historiske kart til gatenavn, plaketter og aktive valg om hva som synliggjøres',file:'data/fagverk/by/historiske-lag-ruiner-minner.json',primary_domain_id:'historiske_lag',chapter_role:'core',emne_ids:['em_by_ruiner_tomrom_restar','em_by_navneskilt_plaketter_minner'],claimsFile:'data/fagverk/by/historiske-lag-ruiner-minner/claims.json',briefFile:'data/fagverk/by/historiske-lag-ruiner-minner/brief.json'};

function registry(){
 const p='data/fagverk/fagverk_registry.json',d=json(p),by=d.subjects?.by;assert(by&&Array.isArray(by.chapters),'By mangler i registry');assert(['2.45.0','2.46.0'].includes(d.version),`Uventet registry-versjon ${d.version}`);
 const x=by.chapters.find((r)=>r.id===chapter.id);if(x)Object.assign(x,chapter);else by.chapters.push(chapter);assert(by.chapters.length===12,`Registry skal ha 12 By-kapitler, fikk ${by.chapters.length}`);
 d.version='2.46.0';d.updatedAt='2026-08-09';by.canonicalModel.note='Fagkartets tolv kategorier eier renderer-fagområdene. Byliv er kapitteldekket 30/30 gjennom fem kapitler. Arkitektur er kapitteldekket 12/12 gjennom to kapitler. Bolig og nabolag er kapitteldekket 5/5 gjennom ett kapittel. Administrasjon og plan er kapitteldekket 3/3 gjennom ett kapittel. Urbanisme er kapitteldekket 6/6 gjennom ett kapittel. Arbeid og næring er kapitteldekket 8/8 gjennom ett kapittel. Historiske lag er nå kapitteldekket 2/2 gjennom ett kapittel. By-faget fortsetter sammenhengende Fase 4-produksjon i neste canonicale fagområde.';writeJson(p,d);
}
function status(){
 const p='data/fagverk/subject_status.json',d=json(p),by=d.subjects?.find((r)=>r.id==='by');assert(by,'By mangler i subject_status');assert(['2.44.0','2.45.0'].includes(d.version),`Uventet status-versjon ${d.version}`);
 d.version='2.45.0';d.updatedAt='2026-08-09';Object.assign(by,{navigationStatus:'materialized',assessmentStatus:'audited',editorialStatus:'chapters_in_progress',nextGate:'chapter_production',note:'By & arkitektur fortsetter Fase 4. Byliv er 30/30, Arkitektur 12/12, Bolig og nabolag 5/5, Administrasjon og plan 3/3, Urbanisme 6/6, Arbeid og næring 8/8 og Historiske lag 2/2 kapitteldekket. Hele By-faget er fortsatt ikke komplett; neste canonicale fagområde skal produseres sammenhengende.'});writeJson(p,d);
}
function bumpLegacy(){
 for(const name of fs.readdirSync(abs('scripts')).filter((n)=>n.startsWith('audit-fagverk-by-')&&n.endsWith('.mjs')&&!n.includes('historiske-lag-ruiner-minner'))){
  const p=`scripts/${name}`;let t=read(p);
  t=t.replace(/(\.chapters\.length\s*===\s*)11\b/g,(_,a)=>`${a}12`);
  t=t.replace(/exactlyElevenRegisteredByChapters/g,'preservedAcrossTwelveRegisteredByChapters')
   .replace(/preservedAcrossElevenRegisteredByChapters/g,'preservedAcrossTwelveRegisteredByChapters')
   .replace(/preservedAcrossElevenChapterRegistry/g,'preservedAcrossTwelveChapterRegistry')
   .replace(/AcrossElevenChapterRegistry/g,'AcrossTwelveChapterRegistry')
   .replace(/AcrossElevenRegisteredByChapters/g,'AcrossTwelveRegisteredByChapters');
  write(p,t);
 }
 for(const name of fs.readdirSync(abs('tests')).filter((n)=>n.startsWith('fagverk-by-')&&n.endsWith('.test.mjs')&&!n.includes('historiske-lag-ruiner-minner'))){
  const p=`tests/${name}`;let t=read(p);
  t=t.replace(/registeredChapterCount:\s*11\b/g,'registeredChapterCount: 12');
  t=t.replace(/registeredChapterCount\s*,\s*11\b/g,'registeredChapterCount, 12');
  write(p,t);
 }
 const gp='tests/fagverk-general-engine.test.mjs';let g=read(gp).replace('assert.equal(by.chapterCount, 11);','assert.equal(by.chapterCount, 12);');write(gp,g);
}
function readme(){
 const p='reports/fagverk/README.md';let t=read(p);const bullet='- `by-historiske-lag-ruiner-minner-phase4-audit.json` — Historiske lag-domenets 2/2-port: to canonicale eieremner, seks metoder, tre moduler, ni seksjoner, 18 verified claims og 13 inspectable kilder med eksplisitte skiller mellom fysisk levn, tomrom, vernestatus, rekonstruksjon og minnemarkering.\n';
 if(!t.includes('by-historiske-lag-ruiner-minner-phase4-audit.json'))t=t.replace('\n## Regenerering\n',`\n${bullet}\n## Regenerering\n`);
 const cmds='node scripts/audit-fagverk-by-historiske-lag-ruiner-minner-phase4.mjs --write-report\nnode scripts/audit-fagverk-by-historiske-lag-ruiner-minner-phase4.mjs\n';if(!t.includes('audit-fagverk-by-historiske-lag-ruiner-minner-phase4.mjs --write-report'))t=t.replace('```bash\n','```bash\n'+cmds);write(p,t);
}
function regenerate(){
 const names=fs.readdirSync(abs('scripts')).filter((n)=>n.startsWith('audit-fagverk-by-')&&n.endsWith('.mjs')).sort();for(const n of names)execFileSync(process.execPath,[abs(`scripts/${n}`),'--write-report'],{cwd:ROOT,stdio:'inherit'});
 execFileSync(process.execPath,[abs('scripts/audit-fagverk-general-engine.mjs'),'--write-report'],{cwd:ROOT,stdio:'inherit'});
 execFileSync(process.execPath,[abs('scripts/build-fagverk-release-manifest.mjs')],{cwd:ROOT,stdio:'inherit'});
}
registry();status();bumpLegacy();readme();regenerate();console.log('Historiske lag materialisert: registry 2.46.0, status 2.45.0, 12 By-kapitler og regenererte rapporter/release.');
