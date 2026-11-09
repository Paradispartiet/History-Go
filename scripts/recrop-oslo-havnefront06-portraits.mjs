#!/usr/bin/env node
// Visual QA correction for three specific portraits; originals are re-fetched,
// never crop a portrait from the derived hero. Does not alter historic text.
import fs from 'node:fs';import crypto from 'node:crypto';import sharp from 'sharp';
const corrections=[
  {id:'amerikalinjen',file:'data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_03/amerikalinjen.json',original:'frontImage',position:'centre'},
  {id:'aker_brygge',file:'data/places/by/oslo/places/aker_brygge.json',original:'image',position:'west'},
  {id:'akerselva_utlop_bjorvika',file:'data/places/natur/oslo/places_oslo_natur_akerselvarute/akerselva_utlop_bjorvika.json',original:'frontImage',position:'centre'}
];
const provenancePath='reports/place-production/oslo-havnefront06-media-provenance.json';
const provenance=JSON.parse(fs.readFileSync(provenancePath,'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const c of corrections){
 const p=JSON.parse(fs.readFileSync(c.file,'utf8'));
 if(p.id!==c.id||!p.frontImage?.startsWith('bilder/places/oslo-havnefront06-20261109/')||!fs.existsSync(p.frontImage))throw Error('WRONG_PLACE_OR_FRONT: '+c.id);
 const base=p[c.original+'Meta'];
 if(!base?.originalUrl?.startsWith('https://upload.wikimedia.org/wikipedia/commons/')||!base.sourceSha256||!base.licenseUrl?.includes('creativecommons.org'))throw Error('SOURCE_NOT_LICENSE_LOCKED: '+c.id);
 const response=await fetch(base.originalUrl,{headers:{'User-Agent':'HistoryGoOsloHavnefrontEditorial/1.0 (https://github.com/Paradispartiet/History-Go)'}});
 if(!response.ok||!String(response.headers.get('content-type')||'').startsWith('image/'))throw Error('SOURCE_DOWNLOAD_FAILED: '+c.id+' '+response.status);
 const raw=Buffer.from(await response.arrayBuffer());
 if(hash(raw)!==base.sourceSha256)throw Error('SOURCE_HASH_CHANGED: '+c.id);
 const photo=await sharp(raw).metadata();
 if(photo.width<1400||photo.height<1400)throw Error('SOURCE_TOO_SMALL: '+c.id);
 const result=await sharp(raw).rotate().resize(900,1350,{fit:'cover',position:c.position}).webp({quality:87,effort:4}).toBuffer();
 const dims=await sharp(result).metadata();
 if(dims.format!=='webp'||dims.width!==900||dims.height!==1350)throw Error('OUTPUT_DIMENSIONS_BAD: '+c.id);
 fs.writeFileSync(p.frontImage,result);
 const updated={...base,assetType:'documentary_place_portrait',transformation:'Independently cropped licensed original to 900x1350 WebP, editorial position '+c.position,orientation:'portrait',outputSha256:hash(result),outputDimensions:[900,1350],outputBytes:result.length,cropPosition:c.position};
 p.frontImageMeta=updated;p.frontImageCredit=updated.credit;p.frontImageLicense=updated.license;p.frontImageLicenseUrl=updated.licenseUrl;p.frontImageSourceUrl=updated.sourcePage;
 p.frontImageCaption=c.id==='aker_brygge'?'Aker Brygges eldre verkstedbygninger og nyere sjøfront, fotografert 2026.':p.frontImageCaption;
 if(c.id==='aker_brygge')p.frontImageMeta.caption=p.frontImageCaption;
 fs.writeFileSync(c.file,JSON.stringify(p,null,2)+'\n');
 const entry=provenance.items.find(x=>x.placeId===c.id);
 if(!entry)throw Error('PROVENANCE_ITEM_NOT_FOUND: '+c.id);
 entry.sources.frontImage={original:base.originalUrl,source:base.sourcePage,sha256:base.sourceSha256,dimensions:base.sourceDimensions,license:base.license,creator:base.creator};
 entry.outputs.frontImage=p.frontImage; entry.visualQa='portrait_recropped_pending_app_qa';entry.portraitReview={reason:'Previous automated crop did not keep the canonical subject central',position:c.position,outputSha256:updated.outputSha256};
 console.log('OSLO06_PORTRAIT_RECROPPED',c.id,c.position,updated.outputSha256);
}
provenance.updatedAt=new Date().toISOString();provenance.releaseStatus='candidate_pending_browser_qa';
fs.writeFileSync(provenancePath,JSON.stringify(provenance,null,2)+'\n');
