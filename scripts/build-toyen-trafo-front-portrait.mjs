import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';

const source = 'bilder/places/source/toyen_trafo_bjoertvedt_2014.jpg';
const output = 'bilder/places/toyen_trafo_front_portrait.webp';
const placeFile = 'data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json';
const workcardFile = 'reports/place-production/toyen-trafo-workcard-current.json';
const reportFile = 'reports/place-production/toyen-trafo-front-image-20261105.json';
const sourcePage = 'https://commons.wikimedia.org/wiki/File:Oslo_T%C3%B6yen_Trafostasjon_hovinveien_1_rk_166157_IMG_5512.JPG';
const sourceUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Oslo_T%C3%B6yen_Trafostasjon_hovinveien_1_rk_166157_IMG_5512.JPG';
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');

const photo = fs.readFileSync(source);
const meta = await sharp(photo).metadata();
if (meta.format !== 'jpeg' || meta.width !== 4142 || meta.height !== 3111) {
  throw Error('Source mismatch: expected Wikimedia Commons Bjoertvedt photograph (4142x3111)');
}
const crop = { left: 1030, top: 0, width: 2074, height: 3111 };
fs.mkdirSync('bilder/places', {recursive:true});
await sharp(photo).extract(crop).resize(900,1350).webp({quality:88, effort:6}).toFile(output);
const final = fs.readFileSync(output), finalMeta = await sharp(final).metadata();
if (finalMeta.format !== 'webp' || finalMeta.width !== 900 || finalMeta.height !== 1350)
  throw Error('Portrait file has wrong format or orientation');

const place = JSON.parse(fs.readFileSync(placeFile,'utf8'));
if (place.id !== 'toyen_trafo') throw Error('Wrong canonical Place');
if (!String(place.image).includes('1931')) throw Error('Canonical 1931 landscape image changed unexpectedly');
place.frontImage = output;
delete place.cardImage;
place.frontImageCredit = 'Bjoertvedt / Wikimedia Commons';
place.frontImageLicense = 'CC BY-SA 3.0 NO';
place.frontImageLicenseUrl = 'https://creativecommons.org/licenses/by-sa/3.0/no/deed.no';
place.frontImageCaption = 'Tøyen transformatorstasjon fotografert i 2014. Stående utsnitt av selvstendig bilde, ikke 1931-fotografiet.';
place.frontImageMeta = {
  assetType:'documentary_place_photo',source:'wikimedia_commons',sourcePage,assetUrl:sourceUrl,
  sourceFile:source,sourceSha256:sha256(photo),sourceDimensions:[meta.width,meta.height],
  creator:'Bjoertvedt',credit:'Bjoertvedt / Wikimedia Commons',
  license:'CC BY-SA 3.0 NO',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/no/deed.no',
  rightsBasis:'uploader-released CC BY-SA 3.0 Norway',
  orientation:'portrait',outputDimensions:'900x1350',sha256:sha256(final),bytes:final.length,
  transformation:'Separate 2014 source photograph cropped to a 2:3 upright frame (source crop x=1030,y=0,w=2074,h=3111) and resized; historical 1931 landscape image unchanged.',
  verifiedAt:'2026-11-05'
};
fs.writeFileSync(placeFile,JSON.stringify(place,null,2)+'\n');

const workcard=JSON.parse(fs.readFileSync(workcardFile,'utf8'));
workcard.active_phase='Separate standing CC BY-SA 3.0 NO frontImage completed; People, Objects and both authentic Brands ready. Productions service candidate requires own canonical member/visual decision before vFerdig.';
workcard.active_file_scope='Real independent 2014 Commons portrait source, 900x1350 WebP, separate landscape photo, no obsolete Place cardImage; production candidate/source audit.';
workcard.collection_status.category_expression='BLOCKED – original electricity-distribution work is Place history; independently documented 2026 Oslo teatersenter studio rental is a genuine service candidate, but no verified service-member image or canonical Production yet. Do not label N/A or fabricate output.';
workcard.remaining_before_vferdig=[
  'Productions: resolve documented Oslo teatersenter rehearsal-space rental service with authentic preview and canonical entity, or substantiate why it is not a separately qualifying production; no filler',
  'Final independent PlaceCard image/QuizCard flip and three visible collection QA in real mobile/desktop UI',
  'Final editorial checklist attestation and GitHub Pages publish confirmation for release commit'
];
workcard.editorial_status='not_vferdig';
fs.writeFileSync(workcardFile,JSON.stringify(workcard,null,2)+'\n');
fs.writeFileSync(reportFile,JSON.stringify({
  place_id:place.id,date:'2026-11-05',status:'independent_portrait_front_image_integrated',
  landscapeSource:place.imageSourceUrl,frontImage:output,
  frontSource:sourcePage,frontSourceUrl:sourceUrl,frontSourceHash:sha256(photo),
  frontOutputSha256:sha256(final),frontOutputBytes:final.length,
  dimensions:[finalMeta.width,finalMeta.height],crop,
  photographer:'Bjoertvedt',license:'CC BY-SA 3.0 NO',
  rightsLink:'https://creativecommons.org/licenses/by-sa/3.0/no/deed.no',
  transformation:'Crop of independently authored 2014 Commons photo, not crop of 1931 landscape image',
  category_expression:'BLOCKED: independent place-specific rehearsal-space rental service source verified; awaiting production entity and authentic service image',
  categorySource:'https://osloteatersenter.no/booking/',
  placeStatus:'not_vferdig'
},null,2)+'\n');
console.log('Tøyen trafo independent frontImage: '+finalMeta.width+'x'+finalMeta.height+' '+final.length+' bytes; sha256='+sha256(final));