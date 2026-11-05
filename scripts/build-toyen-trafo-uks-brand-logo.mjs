import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const path='bilder/brands/source/toyen_trafo_uks_official_logo_2018.png';
const output='bilder/brands/toyen_trafo_uks_official_logo.webp';
const officialUrl='https://www.uks.no/wp-content/uploads/2018/04/uks-logo-3.png';
const expectedSourceSha='144d9febb7884645aa544e820e6d9ed3e7cf5604842ab8c363b318f6f621e460';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(path),metadata=await sharp(bytes).metadata();
if(hash(bytes)!==expectedSourceSha)throw Error('Official UKS website logo hash changed; source requires re-review');
if(metadata.format!=='png'||metadata.width!==1200||metadata.height!==630)throw Error('Unexpected original UKS logo dimensions');
await sharp(bytes).resize(900,520,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).webp({quality:90,effort:6}).toFile(output);
const final=fs.readFileSync(output),w=await sharp(final).metadata();
if(w.format!=='webp'||w.width!==900||w.height!==520)throw Error('UKS WebP generation invalid');
const file='data/brands/actors_by_place.json';
const all=JSON.parse(fs.readFileSync(file,'utf8')),brands=all.toyen_trafo;
if(brands.length!==2||brands[1].id!=='unge_kunstneres_samfund')throw Error('Expected two canonical Tøyen trafo Brands');
const uks=brands[1];
uks.image=output;uks.cardImage=output;uks.logo=output;uks.imageKind='official_logo';
uks.imageAlt='Unge Kunstneres Samfund (UKS): organisasjonens autentiske svarte UKS-bokstaver og grenmotiv i en nyere grafisk profil';
uks.imageMeta={
  imageKind:'official_organization_logo',creator:'Studio Manuel Raeder – UKS visuell identitet 2017–2018',
  credit:'Unge Kunstneres Samfund (UKS) – organisasjonens offisielle nettsted',
  source:'official_organization_website_og_image',sourcePage:'https://www.uks.no/',
  sourceUrl:officialUrl,designerEvidence:'https://manuelraeder.com/project/uks/',
  sourceFile:path,sourceFileSha256:hash(bytes),mediaType:'image/webp',sourceMediaType:'image/png',
  width:w.width,height:w.height,sourceWidth:metadata.width,sourceHeight:metadata.height,
  sha256:hash(final),bytes:final.length,identityPeriod:'2017-2018_visual_identity_not_evidence_of_1970s_logo',
  disclosure:'Offisiell, nyere UKS-identitet fra organisasjonens eget nettsted. Logoen dokumenterer ikke grafikken som ble brukt under atelierinitiativet på 1970-tallet.',
  rightsBasis:'Original logo published as an official UKS website social share image; rights remain with UKS/designers.',
  license:'No open license asserted; editorial identifying use only',noOpenLicenseClaim:true,
  edit:'Only proportionally resized to 900×520 on white background; no recreation or restyling',
  verifiedAt:'2026-11-05'
};
fs.writeFileSync(file,JSON.stringify(all,null,2)+'\n');
const rp='reports/place-production/toyen-trafo-brand-visuals-20261105.json';
const report=JSON.parse(fs.readFileSync(rp,'utf8'));
report.status='two_distinct_official_brand_assets_integrated';
report.uksBrandLogo={id:uks.id,sourceUrl:officialUrl,sourcePage:'https://www.uks.no/',
 sourceFile:path,sourceHash:hash(bytes),image:output,sha256:hash(final),bytes:final.length,
 dimensions:[900,520],sourceDimensions:[1200,630],designDate:'2017–2018 graphic identity',
 rights:'Official website brand mark, no open license claim',identityDistinction:'NOT verified 1970s Tøyen trafo logotype'};
report.otherBrand={id:uks.id,status:'modern_authentic_UKS_identity_visual_approved',
 note:'The historical UKS atelier initiative remains an initiator role and not a claim that UKS occupied Tøyen trafo as resident or used this 2017–2018 graphic in the 1970s.'};
report.collection='Two independently source-authenticated identities in Brands; visible brand panel in Place Sheet Direct belongs to About, not the hidden original grid icon';
report.placeStatus='not_vferdig_pending_productions_and_release_closeout';
fs.writeFileSync(rp,JSON.stringify(report,null,2)+'\n');
console.log('UKS official asset integrated '+final.length+' bytes SHA-256='+hash(final));
