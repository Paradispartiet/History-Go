import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';

const source='bilder/places/source/toyen_trafo_ots_2010_original.jpg';
const output='bilder/places/toyen_trafo_hero_2010.webp';
const placeFile='data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json';
const sourcePage='https://commons.wikimedia.org/wiki/File:T%C3%B8yenTrafo001.jpg';
const sourceUrl='https://upload.wikimedia.org/wikipedia/commons/1/1a/T%C3%B8yenTrafo001.jpg';
const expectedSha1='f52fdd669bbdf9d7394e65ea5dc2303247c5111b';
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const photo=fs.readFileSync(source),meta=await sharp(photo).metadata();
if(crypto.createHash('sha1').update(photo).digest('hex')!==expectedSha1)
  throw Error('2010 source bytes do not match the Wikimedia Commons original SHA-1');
if(meta.format!=='jpeg'||meta.width!==800||meta.height!==535)
  throw Error('Expected authentic 800x535 TøyenTrafo001.jpg, not a substituted image');
await sharp(photo).webp({quality:92,effort:6}).toFile(output);
const final=fs.readFileSync(output),m=await sharp(final).metadata();
if(m.format!=='webp'||m.width!==800||m.height!==535)
  throw Error('Local hero WebP must retain source geometry');
const place=JSON.parse(fs.readFileSync(placeFile,'utf8'));
if(place.id!=='toyen_trafo')throw Error('Wrong Place ID');
if(place.frontImage!=='bilder/places/toyen_trafo_front_portrait.webp')throw Error('Independent 2014 portrait must stay unchanged');
if(!place.imageSourceUrl?.includes('1931_OMU_OB.Z12059'))throw Error('Expected existing 1931 documentary reference');
const historical={
 sourcePage:place.imageSourceUrl,
 image:place.image,
 caption:place.imageCaption,
 credit:place.imageCredit,
 license:place.imageLicense,
 licenseUrl:place.imageLicenseUrl,
 imageMeta:place.imageMeta
};
place.image=output;
place.imageCredit='Nina Reistad / Oslo teatersenter / Wikimedia Commons';
place.imageLicense='CC BY-SA 3.0';
place.imageLicenseUrl='https://creativecommons.org/licenses/by-sa/3.0/';
place.imageSourceUrl=sourcePage;
place.imageCaption='Tøyen trafo / Tøyen kulturhus i 2010. Foto: Nina Reistad / Oslo teatersenter (CC BY-SA 3.0).';
place.imageMeta={
 source:'wikimedia_commons',sourcePage,assetUrl:sourceUrl,
 sourceFile:source,sourceFileSha1:expectedSha1,sourceFileSha256:sha256(photo),
 sourceDimensions:[800,535],outputDimensions:[800,535],mediaType:'image/webp',
 sha256:sha256(final),bytes:final.length,
 creator:'Nina Reistad (camera EXIF); uploaded by Oslo teatersenter',
 credit:'Nina Reistad / Oslo teatersenter / Wikimedia Commons',
 license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',
 assetKind:'documentary_building_exterior',
 transformation:'WebP normalization only; original 800 × 535 framing preserved',
 historicalCompanion:historical,
 disclosure:'Separate 2010 photograph of building. A distinct 1931 Oslo Museum photograph remains documented as an archival source in externalLinks and the historical companion metadata.',
 verifiedAt:'2026-11-05'
};
place.imageComposition={...(place.imageComposition||{}),heroPosition:'52% 38%'};
delete place.cardImage;
fs.writeFileSync(placeFile,JSON.stringify(place,null,2)+'\n');
fs.writeFileSync('reports/place-production/toyen-trafo-hero-photo-20261105.json',JSON.stringify({
 place_id:place.id,date:'2026-11-05',status:'independent_place_focused_hero_integrated',
 heroImage:output,sourcePage,sourceUrl,sourceSha1:expectedSha1,sourceSha256:sha256(photo),
 heroSha256:sha256(final),bytes:final.length,dimensions:[800,535],
 photographer:'Nina Reistad (EXIF)',uploader:'Oslo teatersenter',license:'CC BY-SA 3.0',
 heroPosition:place.imageComposition.heroPosition,
 portraitImage:place.frontImage,portraitUnchanged:true,
 historicalCompanion:historical.sourcePage,
 rationale:'The older 1931 photograph primarily depicts Tøyen surroundings, with Tøyen trafo near the frame edge; the independent 2010 photograph directly shows the building in a usable banner composition.',
 vFerdig:'final_photo_review_pending'
},null,2)+'\n');
console.log('Independent building-focused 2010 hero integrated '+final.length+' bytes SHA-256 '+sha256(final));
