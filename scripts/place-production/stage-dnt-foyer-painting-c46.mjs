#!/usr/bin/env node
// C46: stage one Commons-licensed photograph of the foyer painting, draft-only.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { pathToFileURL } from "node:url";

const qPath="reports/place-production/det-norske-teatret/20261021/painting-photo-intake-c46.json";
const researchPath="reports/place-production/det-norske-teatret/20261021/foyer-paintings-c46-research.json";
const workcardPath="reports/place-production/det-norske-teatret-workcard-current.json";
const placePath="data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const exactTitle="File:Axel Waldemar Johannessen Kirkegårdsgraveren Det norske teatret Oslo, Norway (slightly distorted).jpg";
const exactImage="bilder/objects/det_norske_teatret/kirkegardsgraveren_foyer_wolfmann_2017.webp";
const exactReport="reports/place-production/det-norske-teatret/20261021/painting-photo-c46-generated.json";
const candidate="dnt_aksel_waldemar_johannessen_kirkegardsgraveren_foyer";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sha256=b=>crypto.createHash("sha256").update(b).digest("hex");
const normal=s=>String(s||"").replaceAll("_"," ").replace(/\s+/g," ").trim();
export function validateRequest(q, research, place, workcard){
 if(q.schema!=="history_go_dnt_foyer_painting_image_intake_c46_v1"||q.place_id!=="det_norske_teatret")throw Error("Wrong request");
 if(q.candidate_id!==candidate||q.title!==exactTitle||q.image_path!==exactImage||q.report_path!==exactReport)throw Error("Wrong painting source or output");
 if(q.photographer!=="Wolfmann"||q.credit!=="Wolfmann / Wikimedia Commons"||q.license!=="CC BY-SA 4.0")throw Error("Wrong creator or license");
 if(q.license_url!=="https://creativecommons.org/licenses/by-sa/4.0/"||q.expected_mime!=="image/jpeg")throw Error("Wrong rights or MIME");
 if(q.expected_source_size_bytes!==1983705||q.min_width!==2400||q.min_height!==3500)throw Error("Unreviewed size/quality");
 if(q.source_page!=="https://commons.wikimedia.org/wiki/File:Axel_Waldemar_Johannessen_Kirkeg%C3%A5rdsgraveren_Det_norske_teatret_Oslo,_Norway_(slightly_distorted).jpg")throw Error("Source page differs");
 if(q.publication!=="DRAFT_MEDIA_ONLY_OBJECTS_BLOCKED")throw Error("Unsafe scope");
 if(research.canonical_objects_published!==0||research.objects_status!=="BLOCKED")throw Error("C46 register no longer matches");
 const item=research.evidence.filter(x=>x.id===q.candidate_id);
 if(item.length!==1||item[0].photo_title!==q.title||item[0].photo_author!==q.photographer||item[0].photo_license!==q.license)throw Error("Research object mismatch");
 if(place.id!==q.place_id||place.objects?.length||workcard.status!=="in_progress"||workcard.collections?.objects?.status!=="BLOCKED")throw Error("Canonical object gate changed");
}
export function validateCommons(page,info,q,sourceWikitext){
 if(!page||page.missing!==undefined||normal(page.title)!==normal(q.title))throw Error("Wikimedia Commons title mismatch");
 if(!info||info.mime!==q.expected_mime||info.width<q.min_width||info.height<q.min_height||info.size!==q.expected_source_size_bytes)throw Error("Unexpected original image properties");
 const u=new URL(info.url);
 if(u.protocol!=="https:"||u.hostname!=="upload.wikimedia.org")throw Error("Untrusted image host");
 const ext=info.extmetadata||{};
 if(ext.LicenseShortName?.value!==q.license)throw Error("Live Commons license unverified");
 // In the Artwork template, 'artist' identifies the painter and 'author' the photographer.
 // The rendered imageinfo Artist field must NOT be mistaken for photographer attribution.
 const text=String(sourceWikitext||"");
 if(!/\|\s*author\s*=\s*\[\[\s*User:Wolfmann\s*\|\s*Wolfmann\s*\]\]/i.test(text))throw Error("Live Commons photographer attribution unverified");
 if(!/\|\s*artist\s*=\s*\{\{\s*Creator:Aksel Waldemar Johannessen\s*\}\}/i.test(text))throw Error("Live Commons artwork author unverified");
 if(!/\{\{\s*self\s*\|\s*cc-by-sa-4\.0\s*\}\}/i.test(text))throw Error("Live Commons self-licensed photo declaration unverified");
}
async function checkedFetch(url){
 const res=await fetch(url,{headers:{"User-Agent":"HistoryGoImageAudit/1.0 (https://github.com/Paradispartiet/History-Go)"},signal:AbortSignal.timeout(45000)});
 if(!res.ok)throw Error("Source HTTP "+res.status);
 return res;
}
export async function stage(){
 const q=read(qPath),research=read(researchPath),place=read(placePath),workcard=read(workcardPath);
 validateRequest(q,research,place,workcard);
 if(fs.existsSync(q.image_path)||fs.existsSync(q.report_path))throw Error("C46 refuses to overwrite staged media");
 const api=new URL("https://commons.wikimedia.org/w/api.php");
 for(const [k,v] of Object.entries({action:"query",format:"json",prop:"imageinfo|revisions",iiprop:"url|size|mime|extmetadata",rvprop:"content",rvslots:"main",titles:q.title}))api.searchParams.set(k,v);
 const result=await (await checkedFetch(api.href)).json();
 const pages=Object.values(result.query?.pages||{});
 if(pages.length!==1)throw Error("Ambiguous Commons file");
 const page=pages[0],info=page.imageinfo?.[0];
 validateCommons(page,info,q,page.revisions?.[0]?.slots?.main?.["*"]);
 const response=await checkedFetch(info.url);
 if(new URL(response.url).hostname!=="upload.wikimedia.org"||!String(response.headers.get("content-type")||"").startsWith("image/jpeg"))throw Error("Unexpected downloaded source");
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length!==q.expected_source_size_bytes)throw Error("Source bytes differ from Commons size");
 const meta=await sharp(bytes).metadata();
 if(meta.format!=="jpeg"||meta.width!==info.width||meta.height!==info.height)throw Error("Downloaded JPEG identity mismatch");
 const image=await sharp(bytes).rotate().resize(800,800,{fit:"contain",background:"#191919"}).webp({quality:84,effort:4}).toBuffer();
 const out=await sharp(image).metadata();
 if(out.format!=="webp"||out.width!==800||out.height!==800)throw Error("WebP shape mismatch");
 const record={
  schema:"history_go_dnt_foyer_painting_draft_media_c46_v1",
  place_id:q.place_id,candidate_id:q.candidate_id,status:"IMAGE_STAGED_FOR_VISUAL_REVIEW_NOT_CANONICAL",
  source_page:q.source_page,original_title:page.title,source_url:info.url,
  photo_author:q.photographer,credit:q.credit,license:q.license,license_url:q.license_url,
  original_artwork_artist:"Aksel Waldemar Johannessen",original_artwork_death_year:1922,
  theatre_title:"Kirkegårdsgravere",commons_title:"Kirkegårdsgraveren",
  source_sha256:sha256(bytes),asset_sha256:sha256(image),
  source_dimensions:[meta.width,meta.height],asset_dimensions:[800,800],
  asset_path:q.image_path,transformation:q.transformation,
  visual_limit:"Commons labels photograph 'slightly distorted'; physical canvas/geometry and title equivalence require human check.",
  next_gate:"Manually inspect exact staged WebP and select coherent stagecraft-led Objects group; update canonical Object only with tested PlaceCard preview."
 };
 fs.mkdirSync(path.dirname(q.image_path),{recursive:true});
 fs.mkdirSync(path.dirname(q.report_path),{recursive:true});
 fs.writeFileSync(q.image_path,image);
 fs.writeFileSync(q.report_path,JSON.stringify(record,null,2)+"\n");
 console.log(JSON.stringify({staged:true,asset:q.image_path,sha256:record.asset_sha256}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 stage().catch(err=>{console.error("C46 fail-closed media stage:",err);process.exitCode=1;});
}
