import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
const root=process.cwd();
const url='https://osloteatersenter.no/dokumenter/logo/OTSLogo_Pos_RGB_2000x730px.png';
const input='bilder/brands/source/toyen_trafo_oslo_teatersenter_official_logo.png';
const output='bilder/brands/toyen_trafo_oslo_teatersenter_official_logo.webp';
const bytes=fs.readFileSync(input);
const sourceMetadata=await sharp(bytes).metadata();
if(sourceMetadata.format!=='png'||sourceMetadata.width<500||sourceMetadata.height<200)throw Error('Official OTS logo has unexpected content');
await sharp(bytes).resize(900,520,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).webp({quality:90,effort:6}).toFile(output);
const imageBytes=fs.readFileSync(output),m=await sharp(imageBytes).metadata();
if(m.format!=='webp'||m.width!==900||m.height!==520)throw Error('Invalid OTS brand output');
const hex=b=>crypto.createHash('sha256').update(b).digest('hex');
const file='data/brands/actors_by_place.json',all=JSON.parse(fs.readFileSync(file,'utf8'));
const rows=all.toyen_trafo||[];
const ots=rows.find(x=>x.id==='oslo_teatersenter');
if(!ots||rows.length!==2)throw Error('Two canonical Brand actors missing');
ots.image=output;
ots.cardImage=output;
ots.logo=output;
ots.imageAlt='Oslo teatersenters offisielle sorte logo, levert via organisasjonens pressearkiv';
ots.imageKind='official_logo';
ots.imageMeta={
  imageKind:'official_organization_logo',creator:'Oslo teatersenter / Kristoffer Eliassen (visuell profil)',
  credit:'Oslo teatersenter – offisielt pressearkiv',
  source:'official_press_logo_archive',sourcePage:'https://osloteatersenter.no/ots/',
  sourceUrl:url,sourceFile:input,sourceFileSha256:hex(bytes),
  mediaType:'image/webp',sourceMediaType:'image/png',width:900,height:520,
  sourceWidth:sourceMetadata.width,sourceHeight:sourceMetadata.height,
  sha256:hex(imageBytes),bytes:imageBytes.length,
  disclosure:'Organisasjonens offisielle logo. Brukt for identifisering av historisk og nåværende aktør; ikke et History Go-utformet merke.',
  rightsBasis:'Official organization press-logo download; original ownership and trademarks remain with Oslo teatersenter.',
  license:'No open license asserted; editorial identifying use only',
  noOpenLicenseClaim:true,
  edit:'Resized proportionally and placed on plain white canvas; visual identity not redrawn',
  verifiedAt:'2026-11-05'
};
fs.writeFileSync(file,JSON.stringify(all,null,2)+'\n');
const report='reports/place-production/toyen-trafo-brand-visuals-20261105.json';
fs.writeFileSync(report,JSON.stringify({
 place_id:'toyen_trafo',date:'2026-11-05',status:'one_official_brand_asset_integrated_second_member_without_visual',
 brandLogo:{id:ots.id,url,sourceFile:input,sourceHash:hex(bytes),image:output,sha256:hex(imageBytes),bytes:imageBytes.length,dimensions:[900,520],sourceDimensions:[sourceMetadata.width,sourceMetadata.height],rights:'official press-logo; no open license asserted'},
 otherBrand:{id:'unge_kunstneres_samfund',status:'historically_verified_actor_not_visual_member',note:'UKS has separate established identity and 1921 emblem, but no verified local visual source in this delivery; do not invent an official logo.'},
 collection:'Brands preview uses Oslo teatersenter, a documented actor of this place, and remains separate from UKS text record',
 placeStatus:'not_vferdig'
},null,2)+'\n');
console.log('Branded OTS official logo integrated, bytes='+imageBytes.length);
