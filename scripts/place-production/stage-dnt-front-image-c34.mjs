#!/usr/bin/env node
// DNT: stage a separate historic, documented building photograph for a real portrait frontImage.
// This script never updates Place, frontImage, PlaceCard, quizzes, or production state.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import {pathToFileURL} from "node:url";
const req="reports/place-production/det-norske-teatret/20261020/front-image-intake-c34.json";
const placeFile="data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const exactTitle="File:Oslo Det norske teatret IMG 0553.JPG";
const imagePath="bilder/places/det_norske_teatret_front_bjoertvedt_2013.webp";
const photoSourcePage="https://commons.wikimedia.org/wiki/File:Oslo_Det_norske_teatret_IMG_0553.JPG";
const checksum=b=>crypto.createHash("sha256").update(b).digest("hex");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const normal=s=>String(s||"").replaceAll("_"," ").replace(/\s+/g," ").trim();
export function validateRequest(q,p){
 if(q.schema!=="history_go_dnt_front_image_source_v1"||q.place_id!=="det_norske_teatret"||p.id!==q.place_id)throw Error("Place/contract mismatch");
 if(q.source_file!==exactTitle||q.source_page!==photoSourcePage||q.front_image_path!==imagePath)throw Error("Source/destination substitution");
 if(q.creator!=="Bjoertvedt"||q.license!=="CC BY-SA 3.0"||q.source_mime!=="image/jpeg")throw Error("Rights not documented");
 if(q.source_date!=="2013-12-15"||q.source_dimensions.width!==5184||q.source_dimensions.height!==3456)throw Error("Source dimensions differ");
 if(JSON.stringify(q.crop_pixels)!==JSON.stringify({left:1440,top:0,width:2304,height:3456})||q.front_image_dimensions.width!==900||q.front_image_dimensions.height!==1350)throw Error("Unreviewed crop");
 if(q.publication!=="DRAFT_MEDIA_ONLY_NO_PLACECARD_MIGRATION"||q.review_status!=="VISUAL_REVIEW_REQUIRED_DRAFT_ONLY")throw Error("Unsafe publication state");
 if(p.frontImage)throw Error("Existing frontImage: review first");
 if(p.image!=="bilder/places/det_norske_teatret_haros_2006.jpg")throw Error("Existing identity/source changed");
 if(q.front_image_path===p.image||q.front_image_path===p.cardImage)throw Error("FrontImage cannot be Place image alias");
}
export function validateCommons(page,info,q){
 if(normal(page.title)!==normal(q.source_file)||page.missing!==undefined)throw Error("Different Commons source file");
 if(info?.mime!==q.source_mime||info.width!==q.source_dimensions.width||info.height!==q.source_dimensions.height||info.size<100000||info.size>10000000)throw Error("Different Commons media specs");
 const url=new URL(info.url);
 if(url.protocol!=="https:"||url.hostname!=="upload.wikimedia.org")throw Error("Not an original Wikimedia JPEG");
 const meta=info.extmetadata||{};
 if(meta.LicenseShortName?.value!==q.license)throw Error("License changed");
 if(!String(meta.Artist?.value||"").includes(q.creator))throw Error("Photographer differs");
}
async function fetchChecked(url){
 const res=await fetch(url,{headers:{"User-Agent":"HistoryGoMediaSourceCheck/1.0 (https://github.com/Paradispartiet/History-Go)"},signal:AbortSignal.timeout(60000)});
 if(!res.ok)throw Error("Source request failed with HTTP "+res.status);
 return res;
}
export async function stage(){
 const q=read(req),p=read(placeFile);validateRequest(q,p);
 if(fs.existsSync(q.front_image_path)||fs.existsSync(q.provenance_path))throw Error("Refuse overwrite of existing media");
 const uri=new URL("https://commons.wikimedia.org/w/api.php");
 for(const [k,v] of Object.entries({action:"query",format:"json",prop:"imageinfo",iiprop:"url|size|mime|extmetadata",titles:q.source_file}))uri.searchParams.set(k,v);
 const query=await (await fetchChecked(uri.href)).json();
 const pages=Object.values(query.query?.pages||{});
 if(pages.length!==1)throw Error("Missing/ambiguous Commons file");
 const page=pages[0],info=page.imageinfo?.[0];
 validateCommons(page,info,q);
 const response=await fetchChecked(info.url);
 if(new URL(response.url).hostname!=="upload.wikimedia.org"||!String(response.headers.get("content-type")||"").startsWith("image/jpeg"))throw Error("Unexpected source download");
 const raw=Buffer.from(await response.arrayBuffer());
 if(raw.length>10000000||raw.length<100000)throw Error("Unexpected source file size");
 const meta=await sharp(raw).metadata();
 if(meta.format!=="jpeg"||meta.width!==5184||meta.height!==3456)throw Error("Encoded source dimensions differ");
 const out=await sharp(raw).extract(q.crop_pixels).resize(900,1350).webp({quality:87,effort:5}).toBuffer();
 const check=await sharp(out).metadata();
 if(check.format!=="webp"||check.width!==900||check.height!==1350||check.height<=check.width)throw Error("Front image not truly vertical");
 const record={schema:"history_go_dnt_front_image_draft_v1",place_id:q.place_id,status:"DRAFT_PHOTO_NOT_CANONICAL",source_page:q.source_page,source_file:q.source_file,source_date:q.source_date,creator:q.creator,credit:q.source_credit,license:q.license,license_url:q.license_url,source_url:info.url,source_sha256:checksum(raw),asset_sha256:checksum(out),source_dimensions:q.source_dimensions,crop_pixels:q.crop_pixels,asset_dimensions:q.front_image_dimensions,asset_path:q.front_image_path,transformation:q.image_transform,distinct_from_place_image:"Different original photo and photographer, not computed from 2006 image",next_gate:"Manually preview actual vertical crop and verify facade/sign visibility before setting canonical frontImage and regenerating indexes."};
 fs.mkdirSync(path.dirname(q.front_image_path),{recursive:true});
 fs.mkdirSync(path.dirname(q.provenance_path),{recursive:true});
 fs.writeFileSync(q.front_image_path,out);
 fs.writeFileSync(q.provenance_path,JSON.stringify(record,null,2)+"\n");
 console.log(JSON.stringify({path:q.front_image_path,bytes:out.length,sha256:record.asset_sha256,status:record.status}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)stage().catch(err=>{console.error("DNT C34 frontImage source FAILED CLOSED:",err);process.exitCode=1;});
