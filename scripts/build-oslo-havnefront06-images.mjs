#!/usr/bin/env node
// Oslo havnefront 06: small, source-locked Wikimedia Commons image producer.
// Outputs independent image + portrait crops; no generated cardImage / no V1 status.
// Usage: node scripts/build-oslo-havnefront06-images.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync('reports/place-production/oslo-havnefront06-image-manifest.json','utf8'));
const allowedIds = new Set(['astrup_fearnley','akrobaten_gangbro','amerikalinjen','aker_brygge','akerselva_utlop_bjorvika']);
if (manifest.images.length !== 5 || manifest.images.some(x => !allowedIds.delete(x.placeId)) || allowedIds.size) throw Error('OSLO06_SCOPE_MISMATCH');
const base='bilder/places/oslo-havnefront06-20261109';
const provenancePath='reports/place-production/oslo-havnefront06-media-provenance.json';
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const check=process.argv.includes('--check');
const agent='HistoryGoOsloHavnefrontEditorial/1.0 (https://github.com/Paradispartiet/History-Go; licensed historical photo review)';
const metadata='https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize&titles=';

async function getBytes(url,expectImage=false){
  let last;
  for(let attempt=0;attempt<4;attempt++){
    if(attempt) await sleep([0,5000,10000,18000][attempt]);
    const c=new AbortController();
    const timeout=setTimeout(()=>c.abort(),90000);
    try{
      const response=await fetch(url,{signal:c.signal,redirect:'follow',headers:{'User-Agent':agent,Accept:expectImage?'image/*':'application/json'}});
      if(!response.ok){
        last=Error('SOURCE_HTTP_'+response.status+': '+url);
        if([429,500,502,503,504].includes(response.status))continue;
        throw last;
      }
      const buffer=Buffer.from(await response.arrayBuffer());
      if(expectImage){
        if(!String(response.headers.get('content-type')||'').startsWith('image/')||buffer.length<10000||buffer.length>40*1024*1024)throw Error('INVALID_IMAGE_PAYLOAD: '+url);
      }else if(buffer.length<150||buffer.length>4*1024*1024)throw Error('INVALID_METADATA_PAYLOAD');
      return buffer;
    }catch(e){last=e;if(attempt===3)throw e}
    finally{clearTimeout(timeout)}
  }
  throw last||Error('RETRIEVAL_FAILED');
}
function normalize(s){return String(s||'').replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').toLowerCase().replace(/[^a-zæøå0-9]+/gi,' ');}
async function resolve(item){
  if(!/^File:[^/]+\.(?:jpg|jpeg|png)$/i.test(item.title)||!/^CC BY(?:-SA)? (?:3\.0|4\.0)$/.test(item.license)||!/^https:\/\/creativecommons\.org\/licenses\/by(?:-sa)?\/\d\.\d\//.test(item.licenseUrl)||!item.creator) throw Error('BAD_MANIFEST_ENTRY: '+item.title);
  const data=JSON.parse((await getBytes(metadata+encodeURIComponent(item.title))).toString('utf8'));
  const img=data?.query?.pages?.[0]?.imageinfo?.[0];
  if(!img?.url||!img.url.startsWith('https://upload.wikimedia.org/wikipedia/commons/'))throw Error('COMMONS_FILE_NOT_FOUND: '+item.title);
  const ext=img.extmetadata||{};
  const reportedLicense=String(ext.LicenseShortName?.value||'').replaceAll('-',' ').toLowerCase();
  const expected=item.license.toLowerCase().replaceAll('-',' ');
  const reportedUrl=String(ext.LicenseUrl?.value||'');
  if(!(reportedLicense.includes(expected)||reportedUrl.replace(/\/$/,'')===item.licenseUrl.replace(/\/$/,'')))throw Error('LICENSE_MISMATCH: '+item.title+' '+reportedLicense+' '+reportedUrl);
  const observedAuthor=normalize(ext.Artist?.value||ext.Attribution?.value||'');
  if(observedAuthor&&!observedAuthor.includes(normalize(item.creator)))throw Error('CREATOR_MISMATCH: '+item.title+' '+observedAuthor.slice(0,80));
  return {sourceUrl:img.url,sourcePage:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(item.title).replace(/%3A/gi,':'),sourceWidth:img.width,sourceHeight:img.height,licenseObserved:ext.LicenseShortName?.value||null};
}
async function variant(raw,placeId,field,item,resolved){
  const width=field==='image'?1400:900, height=field==='image'?900:1350;
  const file=base+'/'+placeId+'_'+(field==='image'?'hero':'portrait')+'.webp';
  const data=await sharp(raw).rotate().resize(width,height,{fit:'cover',position:sharp.strategy.attention}).webp({quality:85,effort:4}).toBuffer();
  const m=await sharp(data).metadata();
  if(m.width!==width||m.height!==height||m.format!=='webp')throw Error('OUTPUT_DIMENSIONS_INVALID: '+placeId+' '+field);
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data);
  const entry={source:'wikimedia_commons',sourcePage:resolved.sourcePage,originalUrl:resolved.sourceUrl,creator:item.creator,credit:item.creator+' / Wikimedia Commons',license:item.license,licenseUrl:item.licenseUrl,photoDate:item.photoDate,verifiedAt:manifest.verifiedAt,assetType:field==='image'?'documentary_place_photo':'documentary_place_portrait',transformation:'Cropped and converted from independently fetched licensed original to WebP',sourceSha256:digest(raw),sourceDimensions:[resolved.sourceWidth,resolved.sourceHeight],outputSha256:digest(data),outputDimensions:[m.width,m.height],outputBytes:data.length,caption:item.caption,orientation:field==='image'?'landscape':'portrait'};
  return {path:file,meta:entry};
}
const all=[];
for(const rec of manifest.images){
  const file=rec.placeFile;
  const p=JSON.parse(fs.readFileSync(file,'utf8'));
  if(p.id!==rec.placeId)throw Error('PLACE_ID_MISMATCH: '+rec.placeId);
  if(check){
    for(const [field,dim] of [['image',[1400,900]],['frontImage',[900,1350]]]){
      if(!p[field]?.startsWith(base+'/'))throw Error('EXPECTED_IMAGE_NOT_MATERIALIZED: '+rec.placeId+' '+field);
      const buf=fs.readFileSync(p[field]),m=await sharp(buf).metadata();
      if(m.width!==dim[0]||m.height!==dim[1]||m.format!=='webp'||digest(buf)!==p[field+'Meta']?.outputSha256)throw Error('IMAGE_INTEGRITY_FAILED: '+rec.placeId+' '+field);
    }
    continue;
  }
  for(const field of ['image','frontImage']){
    if(p[field]?.startsWith(base+'/'))throw Error('IMAGE_ALREADY_MATERIALIZED: '+rec.placeId+' '+field);
  }
  const sources={};const crops={};
  for(const field of ['image','frontImage']){
    const item=field==='image'?rec.hero:rec.portrait;
    const resolved=await resolve(item);
    const raw=await getBytes(resolved.sourceUrl,true);
    const m=await sharp(raw).metadata();
    if(!['jpeg','png','webp'].includes(m.format)||m.width<950||m.height<950)throw Error('SOURCE_QUALITY_TOO_LOW: '+item.title);
    const out=await variant(raw,rec.placeId,field,item,resolved);
    p[field]=out.path;
    p[field+'Meta']=out.meta;
    if(field==='image'){
      p.imageCaption=item.caption;p.imageCredit=out.meta.credit;p.imageLicense=item.license;p.imageLicenseUrl=item.licenseUrl;p.imageSourceUrl=resolved.sourcePage;
    }else{
      p.frontImageCaption=item.caption;p.frontImageCredit=out.meta.credit;p.frontImageLicense=item.license;p.frontImageLicenseUrl=item.licenseUrl;p.frontImageSourceUrl=resolved.sourcePage;
    }
    crops[field]=out; sources[field]={original:resolved.sourceUrl,source:resolved.sourcePage,sha256:digest(raw),dimensions:[m.width,m.height],license:item.license,creator:item.creator};
    await sleep(2500);
  }
  // Do not propagate retired cardImage aliases when changing the media contract.
  delete p.cardImage;
  if(p.imageCard===p.cardImage)delete p.imageCard;
  p.imageComposition={...p.imageComposition,portraitPosition:'50% 50%',heroPosition:'50% 50%',portraitRatio:'2:3',heroBehavior:'cover_with_subject_focal_point',quizCardBehavior:'contain_never_crop'};
  fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');
  all.push({placeId:rec.placeId,placeFile:file,sources,outputs:{image:crops.image.path,frontImage:crops.frontImage.path},verifiedAt:manifest.verifiedAt,visualQa:'pending_browser_review'});
  console.log('OSLO06_IMAGES_MATERIALIZED',rec.placeId,crops.image.path,crops.frontImage.path);
}
if(!check){
  fs.writeFileSync(provenancePath,JSON.stringify({schema:'oslo_havnefront06_media_provenance_v1',createdAt:new Date().toISOString(),verifiedAt:manifest.verifiedAt,items:all,releaseStatus:'candidate_pending_browser_qa'},null,2)+'\n');
  console.log('OSLO06_IMAGES_OUTPUT',all.length,'places',all.length*2,'WebP files');
}else console.log('OSLO06_IMAGE_INTEGRITY_PASS',manifest.images.length,'places');
