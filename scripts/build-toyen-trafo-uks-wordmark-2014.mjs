import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const originalPDF='/tmp/toyen_trafo_uks_2014.pdf';
const rendered='/tmp/toyen_trafo_uks_2014_firstpage.png';
const source='bilder/brands/source/toyen_trafo_uks_2014_letterhead_crop.png';
const target='bilder/brands/toyen_trafo_uks_2014_letterhead_wordmark.webp';
const docURL='https://www.regjeringen.no/globalassets/upload/kud/styrer_raad_utvalg/kunstavdelingen/kunstnerokonomi/ungekunstneressamfund_.pdf';
const bytes=fs.readFileSync(originalPDF);
if(bytes.subarray(0,4).toString()!=='%PDF')throw Error('UKS letterhead URL did not return a PDF');
const inputMeta=await sharp(rendered).metadata();
const W=inputMeta.width,H=inputMeta.height;
if(W<1000||H<1400)throw Error('UKS 2014 page render too small');
const crop={left:Math.round(W*.112),top:Math.round(H*.052),width:Math.round(W*.130),height:Math.round(H*.050)};
await sharp(rendered).extract(crop).png().toFile(source);
const cropBytes=fs.readFileSync(source);
await sharp(cropBytes).resize(900,520,{fit:'contain',background:'#ffffff'}).flatten({background:'#ffffff'}).webp({quality:90,effort:6}).toFile(target);
const outputBytes=fs.readFileSync(target),m=await sharp(outputBytes).metadata();
if(m.format!=='webp'||m.width!==900||m.height!==520)throw Error('Invalid UKS asset');
const actorsPath='data/brands/actors_by_place.json',actors=read(actorsPath);
const uks=actors.toyen_trafo.find(a=>a.id==='unge_kunstneres_samfund');
if(!uks)throw Error('UKS missing in canonical Brand actor index');
uks.image=target;uks.cardImage=target;
uks.imageAlt='Historisk UKS-ordmerke beskåret fra organisasjonens eget brevark datert 15. august 2014; ikke nåværende logo';
uks.imageKind='historical_wordmark';
uks.imageMeta={
 imageKind:'authentic_historical_organization_wordmark',
 source:'official_UKS_letterhead_as_archived_by_Norwegian_government',
 sourceUrl:docURL,sourcePageUrl:docURL,
 sourcePublicationDate:'2014-08-15',pageNumber:1,
 temporalScope:'historic_UKS_letterhead_2014_only',
 noContemporaryLogoClaim:true,no1972LogoClaim:true,
 creator:'Unge Kunstneres Samfund (letterhead sender)',
 credit:'Unge Kunstneres Samfund / norsk offentlig høringsarkiv, brevark 15. august 2014',
 sourceMediaType:'application/pdf',sourceDocumentSha256:hash(bytes),
 cropSourceFile:source,cropSourceSha256:hash(cropBytes),
 crop:{...crop,sourcePagePixelWidth:W,sourcePagePixelHeight:H},
 imageKindDetail:'Faithful pixel crop of original header wordmark UKS; NOT a reconstruction or newly generated logo.',
 edit:'Only document-page rasterization, exact crop of left UKS sender mark and proportional white-canvas WebP resize',
 rightsBasis:'Publicly archived original organization letterhead; used solely to identify UKS historically. No free license is asserted.',
 license:'No open license asserted; contextual editorial identification only',
 noOpenLicenseClaim:true,mediaType:'image/webp',width:900,height:520,
 sha256:hash(outputBytes),bytes:outputBytes.length,verifiedAt:'2026-11-05'
};
if(!uks.source_urls.includes(docURL))uks.source_urls.push(docURL);
write(actorsPath,actors);
const reportFile='reports/place-production/toyen-trafo-uks-wordmark-2014-20261105.json';
write(reportFile,{place_id:'toyen_trafo',date:'2026-11-05',status:'authentic_historic_wordmark_image_integrated',
 organisation:'Unge Kunstneres Samfund (UKS)',sourceDocument:docURL,
 publicationDate:'2014-08-15',sourceKind:'actual official letterhead in government public archive',
 pageNumber:1,sourceDocumentSha256:hash(bytes),crop,cropFile:source,cropFileSha256:hash(cropBytes),
 image:target,imageSha256:hash(outputBytes),width:900,height:520,bytes:outputBytes.length,
 noOpenLicenseClaim:true,no1972LogoClaim:true,noContemporaryLogoClaim:true,
 placeStatus:'not_vferdig',note:'UKS is an historical initiator in the early 1970s, not a proven permanent Tøyen trafo tenant. This 2014 wordmark confirms organization visual identity only for 2014.'});
const visuals='reports/place-production/toyen-trafo-brand-visuals-20261105.json',v=read(visuals);
v.status='both_brands_have_separate_authentic_source_linked_visuals__uks_historically_dated';
v.otherBrand={id:uks.id,status:'historic_official_2014_wordmark_integrated_not_current_logo',source:docURL,image:target,sha256:hash(outputBytes),bytes:outputBytes.length,no1972LogoClaim:true,noContemporaryLogoClaim:true};
write(visuals,v);
console.log('UKS historical letterhead wordmark extracted and WebP produced; PDF SHA256='+hash(bytes)+'; WebP SHA256='+hash(outputBytes));
