#!/usr/bin/env node
const fs=require('fs');
const checks=new Set([
 'data/badges.json',
 'data/Civication/hg_careers.json',
 'data/Civication/lifeMails/life_manifest.json',
 'data/Civication/jobbmails/naeringsliv/naeringslivCivic.json',
 'data/Civication/jobbmails/vitenskapCivic.json',
 'data/Civication/jobbmails/mediaCivic.json',
 'data/Civication/jobbmails/byCivic.json'
]);
const lifeManifest=JSON.parse(fs.readFileSync('data/Civication/lifeMails/life_manifest.json','utf8'));
for(const p of (lifeManifest.packs||[])){ if (p.path) checks.add(p.path); }
let missing=[];let invalid=[];
for(const p of checks){ if(!fs.existsSync(p)){missing.push(p); continue;} try{JSON.parse(fs.readFileSync(p,'utf8'));}catch(e){invalid.push(`${p}: ${e.message}`);} }
if(missing.length||invalid.length){ if(missing.length) console.error('Missing JSON:\n'+missing.join('\n')); if(invalid.length) console.error('Invalid JSON:\n'+invalid.join('\n')); process.exit(1);} 
console.log(`Verified ${checks.size} JSON files exist and parse.`);
