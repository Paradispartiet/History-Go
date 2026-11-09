#!/usr/bin/env node
// Converts just the three individually sourced harborfront Fagverk pages from
// draft to curated. Must be followed by canonical audit + actual browser QA.
import fs from 'node:fs';
const r='data/fagverk/fagverk_registry.json';
const registry=JSON.parse(fs.readFileSync(r,'utf8'));
const entries=[
['astrup_fearnley','data/places/kunst/oslo/places_kunst/astrup_fearnley.json'],
['amerikalinjen','data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/amerikalinjen.json'],
['akerselva_utlop_bjorvika','data/places/natur/oslo/places_oslo_natur_akerselvarute/akerselva_utlop_bjorvika.json']
];
for(const [id,p] of entries){
 const place=JSON.parse(fs.readFileSync(p,'utf8'));
 if(place.id!==id||place.fagverk?.status!=='in_production'||registry.placeLinks[id]?.status!=='in_production')throw Error('UNEXPECTED_PLACE_STATUS: '+id);
 const f=place.fagverk;
 if(f.level!=='standard'||f.article.length<3||f.lenses.length<3||f.guiding_questions.length<4||f.chapter_ids.length<1||f.source_urls.length<2)throw Error('SUBSTANCE_MINIMUM_NOT_MET: '+id);
 const links=new Set((place.externalLinks||[]).filter(x=>x.label).map(x=>x.url));
 for(const u of f.source_urls)if(!links.has(u))throw Error('MISSING_LABELLED_SOURCE: '+id+' '+u);
 const chap=new Set((registry.subjects[f.subject_ids[0]]?.chapters||[]).map(x=>x.id));
 for(const ch of f.chapter_ids)if(!chap.has(ch))throw Error('DEAD_CHAPTER_ID: '+id+' '+ch);
 f.status='curated';registry.placeLinks[id].status='curated';
 fs.writeFileSync(p,JSON.stringify(place,null,2)+'\n');
 console.log('OSLO06_FAGVERK_STAGED',id);
}
registry.updatedAt='2026-11-09';
fs.writeFileSync(r,JSON.stringify(registry,null,2)+'\n');
