#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const sourcePath=path.join(root,'data/Civication/narratives/leisure/scenekunst_skuespiller_danser.json');
let s=fs.readFileSync(sourcePath,'utf8');
s=s.replace(/publikums/gi,'tilskueres').replace(/publikum/gi,'tilskuere');
fs.writeFileSync(sourcePath,s);

const worldPath=path.join(root,'data/Civication/roleWorlds/scenekunst/scenekunst_skuespiller_danser.json');
const world=JSON.parse(fs.readFileSync(worldPath,'utf8'));
world.theme_ids=world.theme_ids.map((id)=>id==='status_games'?'status_anxiety':id);
fs.writeFileSync(worldPath,JSON.stringify(world,null,2)+'\n');

const bankPath=path.join(root,'data/Civication/roleWorldThemeBank.json');
const bank=JSON.parse(fs.readFileSync(bankPath,'utf8'));
const key='scenekunst/scenekunst_skuespiller_danser';
bank.reference_profiles[key]=(bank.reference_profiles[key]||[]).map((id)=>id==='status_games'?'status_anxiety':id);
fs.writeFileSync(bankPath,JSON.stringify(bank,null,2)+'\n');

const readinessTestPath=path.join(root,'tests/civication-life-position-role-world-readiness.test.js');
let t=fs.readFileSync(readinessTestPath,'utf8');
t=t.replace("new Set(['ready', 'needs_authored_depth', 'not_a_standalone_world'])","new Set(['ready', 'not_a_standalone_world'])")
  .replace(/console\.log\('civication life-position Role World readiness v2 ok: [^']*'\);/,"console.log('civication life-position Role World readiness v2 ok: 159 ready / 0 authored-depth / 40 not-standalone; 159 complete / no pending-ready');");
fs.writeFileSync(readinessTestPath,t);
console.log('isolated premieregjenger hook collision, aligned canonical status theme, and set final two-class readiness contract');
