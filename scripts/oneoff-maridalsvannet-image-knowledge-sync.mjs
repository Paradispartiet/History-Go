#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
const path='data/places/natur/oslo/places_oslo_natur_hovedsteder/maridalsvannet.json';
const obj=JSON.parse(fs.readFileSync(path,'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pic1='bilder/places/maridalsvannet_front_portrait.webp';
const pic2='bilder/places/maridalsvannet_landscape.webp';
for(const f of [pic1,pic2]) if(!fs.existsSync(f)||fs.statSync(f).size<10000) throw Error('Missing generated image '+f);
obj.frontImage=pic1;
obj.image=pic2;
obj.frontImageMeta={
 ...obj.frontImageMeta,
 sourcePage:'https://commons.wikimedia.org/wiki/File:Maridalsvannet,_Oslo.jpg',
 creator:'Grzegorz Wysocki',credit:'Grzegorz Wysocki / Wikimedia Commons',
 license:'CC BY 3.0',licenseUrl:'https://creativecommons.org/licenses/by/3.0/',
 orientation:'portrait',sourceImageDimensions:[1024,1369],outputDimensions:[600,800],
 sourceSha256:hash('/tmp/maridals-portrait.jpg'),outputSha256:hash(pic1),
 transformation:'Standalone 600×800 WebP from documentary Commons photograph; no content invented',
 visualReview:'crop_produced_pending_real_app_browser_review'
};
obj.imageMeta={
 ...obj.imageMeta,
 sourcePage:'https://commons.wikimedia.org/wiki/File:Maridalsvannet_i_Maridalen,_Oslo,_Norway_(2022.11.12).jpg',
 creator:'Geir Hval (Macwhale)',credit:'Geir Hval / Wikimedia Commons',
 license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
 orientation:'landscape',outputDimensions:[1400,900],
 sourceSha256:hash('/tmp/maridals-landscape.jpg'),outputSha256:hash(pic2),
 transformation:'Standalone 1400×900 WebP from Commons documentary photograph; no content invented',
 visualReview:'crop_produced_pending_real_app_browser_review'
};
obj.imageComposition={portraitPosition:'50% 50%',heroPosition:'50% 50%',portraitRatio:'3:4'};
fs.writeFileSync(path,JSON.stringify(obj,null,2)+'\n');
fs.writeFileSync('reports/place-production/maridalsvannet-v1-image-qa-20261021.json',JSON.stringify({
 schema:'history-go-maridalsvannet-image-qa-v1',status:'local_assets_complete_browser_qa_pending',
 assets:[
 {kind:'frontImage',file:pic1,author:obj.frontImageMeta.creator,license:obj.frontImageMeta.license,sha256:hash(pic1),dimensions:[600,800],visualAppApproval:false},
 {kind:'image',file:pic2,author:obj.imageMeta.creator,license:obj.imageMeta.license,sha256:hash(pic2),dimensions:[1400,900],visualAppApproval:false}],
 note:'Both locally encoded source photographs. Actual mobile and desktop PlaceCard/popup acceptance is an explicit separate v1 gate.'
},null,2)+'\n');
