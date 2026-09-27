#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const p=path.resolve(__dirname,'..','data/Civication/narratives/leisure/scenekunst_skuespiller_danser.json');
let s=fs.readFileSync(p,'utf8');
s=s.replace(/publikums/gi,'tilskueres').replace(/publikum/gi,'tilskuere');
fs.writeFileSync(p,s);
console.log('isolated premieregjenger hook collision by removing publikum hook from Skuespiller/danser source');
