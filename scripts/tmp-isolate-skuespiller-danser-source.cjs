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
console.log('isolated premieregjenger hook collision and aligned status_games to canonical status_anxiety theme');
