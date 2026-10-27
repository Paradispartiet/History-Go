#!/usr/bin/env node
// Deterministic, source-attributed documentary photos for the five still-imageless
// Places in the Oslo sentrum v1 six-place batch. The sixth (Wessels plass) is
// already licensed and has local assets; it must never be rewritten by this job.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync('reports/place-production/oslo-sentrum-next-six-image-sources-20261027.json', 'utf8'));
const expected = new Set(['kontraskjaeret','palehaven_paleet','avisen_tiden_radhusgata_10','egertorget','mustadgarden_kongens_gate_3']);
if (manifest.images.length !== 5 || manifest.images.some(entry => !expected.delete(entry.placeId)) || expected.size) {
  throw new Error('Oslo picture manifest does not match the five authorized place ids');
}
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const imageRoot = 'bilder/places/oslo-sentrum-next-six-20261027';
const sourcesRoot = 'reports/place-production/oslo-sentrum-next-six-media-provenance-20261027.json';
const output = [];
const body = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 80000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent':'HistoryGoOsloEditorial/1.0 (GitHub Paradispartiet/History-Go; licensed documentary images)', Accept:'image/jpeg,image/png,image/webp' },
      redirect: 'follow'
    });
    if (!res.ok) throw new Error('Source HTTP '+res.status+' for '+url);
    const type = String(res.headers.get('content-type')||'');
    if (!type.startsWith('image/')) throw new Error('Not an image response: '+type);
    const data = Buffer.from(await res.arrayBuffer());
    if (data.length < 20000 || data.length > 40*1024*1024) throw new Error('Unexpected image file size '+data.length);
    return data;
  } finally { clearTimeout(timeout); }
};
for(const item of manifest.images){
  if (!item.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:') ||
      !item.sourceUrl.startsWith('https://upload.wikimedia.org/wikipedia/commons/')) {
    throw new Error('Non-Wikimedia photo source for '+item.placeId);
  }
  const placePath = path.resolve(root,item.placeFile);
  const place = JSON.parse(fs.readFileSync(placePath,'utf8'));
  if(place.id!==item.placeId || place.image || place.cardImage || place.frontImage) {
    throw new Error('Unexpected place or previously delivered image: '+item.placeId);
  }
  const raw = await body(item.sourceUrl);
  const meta = await sharp(raw).metadata();
  if(!['jpeg','png','webp'].includes(meta.format) || meta.width<700 || meta.height<500){
    throw new Error('Source image resolution or format inadequate for '+item.placeId);
  }
  const save = async (target,width,height) => {
    const bytes = await sharp(raw).rotate().resize(width,height,{fit:'cover',position:'attention',withoutEnlargement:true})
      .webp({quality:85,effort:5}).toBuffer();
    const full = path.resolve(root,target);
    fs.mkdirSync(path.dirname(full),{recursive:true});
    fs.writeFileSync(full,bytes);
    const info = await sharp(bytes).metadata();
    return {target,sha256:digest(bytes),dimensions:info.width+'x'+info.height,size:bytes.length};
  };
  const image = await save(imageRoot+'/'+item.placeId+'_hero.webp',1400,900);
  const front = await save(imageRoot+'/'+item.placeId+'_portrait.webp',800,1050);
  const card = await save('bilder/kort/places/'+item.placeId+'.webp',700,980);
  const credit = item.creator+' / Wikimedia Commons';
  const provenance = {
    source:'wikimedia_commons', sourcePage:item.sourcePage, creator:item.creator, credit,
    license:item.license, licenseUrl:item.licenseUrl, date:item.date, verifiedAt:manifest.verifiedAt,
    assetType:item.assetType,delivery:'local_webp_licensed',
    transformation:'Cropped from a license-checked photograph and converted to WebP.',
    sourceSha256:digest(raw)
  };
  place.image=image.target;
  place.cardImage=card.target;
  place.frontImage=front.target;
  place.imageMeta={...provenance,outputDimensions:image.dimensions,outputSha256:image.sha256};
  place.frontImageMeta={...provenance,outputDimensions:front.dimensions,outputSha256:front.sha256};
  place.cardImageMeta={...provenance,outputDimensions:card.dimensions,outputSha256:card.sha256};
  place.imageCaption=item.caption;
  place.imageCredit=credit;
  place.imageLicense=item.license;
  place.imageSourceUrl=item.sourcePage;
  place.frontImageCaption=item.caption;
  place.frontImageCredit=credit;
  place.frontImageLicense=item.license;
  place.frontImageSourceUrl=item.sourcePage;
  fs.writeFileSync(placePath,JSON.stringify(place,null,2)+'\n');
  output.push({placeId:item.placeId,placeFile:item.placeFile,sourcePage:item.sourcePage,
               assetType:item.assetType,license:item.license,sourceSha256:digest(raw),assets:[image,front,card]});
  console.log('OSLO_NEXT_SIX_IMAGE_OK',item.placeId,item.license,
              image.dimensions,front.dimensions,card.dimensions);
}
fs.writeFileSync(sourcesRoot,JSON.stringify({
 schema:'history_go_oslo_next_six_media_provenance_v1',verifiedAt:manifest.verifiedAt,
 itemCount:output.length,items:output
},null,2)+'\n');
console.log('OSLO_NEXT_SIX_LICENSED_ASSETS_DONE_5',output.length*3);
