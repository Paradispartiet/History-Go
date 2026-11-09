#!/usr/bin/env node
// QA-only contact sheet for source-locked hero/portrait image pairs.
import fs from 'node:fs';
import sharp from 'sharp';
const manifest=JSON.parse(fs.readFileSync('reports/place-production/oslo-havnefront06-image-manifest.json','utf8'));
const width=1000,rowH=486;
const out='artifacts/oslo-havnefront06-media-review';
fs.mkdirSync(out,{recursive:true});
const composites=[];
for(const [i,item] of manifest.images.entries()){
  const place=JSON.parse(fs.readFileSync(item.placeFile,'utf8'));
  const top=i*rowH;
  const header=Buffer.from('<svg width="1000" height="50"><rect width="1000" height="50" fill="#171b21"/><text x="18" y="33" fill="white" font-family="sans-serif" font-size="23">'+item.placeId.replaceAll('&','&amp;')+'</text><text x="590" y="33" fill="#abb5c2" font-family="sans-serif" font-size="19">HERO / FRONTIMAGE</text></svg>');
  composites.push({input:header,left:0,top});
  if(!place.image||!place.frontImage)throw Error('MISSING_MEDIA: '+item.placeId);
  const [hero,portrait]=await Promise.all([
    sharp(place.image).resize(600,390,{fit:'cover'}).jpeg({quality:82}).toBuffer(),
    sharp(place.frontImage).resize(270,405,{fit:'cover'}).jpeg({quality:82}).toBuffer()
  ]);
  composites.push({input:hero,left:15,top:top+65});
  composites.push({input:portrait,left:680,top:top+56});
}
const canvas=sharp({create:{width,height:manifest.images.length*rowH,channels:3,background:'#171b21'}});
await canvas.composite(composites).jpeg({quality:86}).toFile(out+'/contact-sheet.jpg');
console.log('OSLO06_CONTACT_SHEET',out+'/contact-sheet.jpg');
