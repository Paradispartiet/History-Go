#!/usr/bin/env node
// Strictly stages one documented archival costume photo, NOT a canonical Object.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { pathToFileURL } from "node:url";

const requestPath="reports/place-production/det-norske-teatret/20261020/object-image-intake-c32.json";
const candidatesPath="reports/place-production/det-norske-teatret/20261020/objects-c31-candidates.json";
const placePath="data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json";
const approvedTitle="File:Kostyme fra Madame de Sade - lang overdel, langt skjørt i grønn silke - Oslo Museum - TM.01641.A-C - 1.jpg";
const expectedImage="bilder/objects/det_norske_teatret/madame_de_sade_1989_tm01641.webp";
const read=(p)=>JSON.parse(fs.readFileSync(p,"utf8"));
const hash=(bytes)=>crypto.createHash("sha256").update(bytes).digest("hex");
const normalized=(t)=>String(t||"").replaceAll("_"," ").replace(/\s+/g," ").trim();
export function validateRequest(q,register,place){
 if(q.schema!=="history_go_dnt_object_image_intake_v1"||q.place_id!=="det_norske_teatret")throw Error("Invalid source request");
 if(q.candidate_id!=="dnt_costume_madame_de_sade_1989_tm01641"||q.museum_accession!=="TM.01641.A-C")throw Error("Wrong museum item");
 if(q.file_title!==approvedTitle||q.image_path!==expectedImage)throw Error("Substituted image path or source");
 if(q.license!=="CC BY-SA 4.0"||q.creator!=="Lone Lunde"||q.expected_mime!=="image/jpeg")throw Error("Unreviewed rights");
 if(q.min_width!==850||q.min_height!==1150||q.publication!=="DRAFT_IMAGE_ONLY_CANONICAL_OBJECT_BLOCKED")throw Error("Unsafe scope");
 if(!q.report_path.startsWith("reports/place-production/det-norske-teatret/20261020/"))throw Error("Unreviewed output path");
 if(place.id!=="det_norske_teatret"||place.objects?.length)throw Error("Canonical objects need renewed audit");
 const matches=register.candidates.filter(x=>x.id===q.candidate_id);
 if(matches.length!==1||matches[0].museum_accession!=="TM.01641.A-C"||matches[0].publication_status!=="BLOCKED"||register.counts.published_objects!==0)throw Error("Source candidate differs");
}
export function validateCommons(page,info,q){
 if(normalized(page?.title)!==normalized(q.file_title)||page.missing!==undefined)throw Error("Commons identity mismatch");
 if(!info||info.mime!==q.expected_mime||info.width<q.min_width||info.height<q.min_height||info.size<10000||info.size>15000000)throw Error("Source image size invalid");
 const url=new URL(info.url);
 if(url.protocol!=="https:"||url.hostname!=="upload.wikimedia.org")throw Error("Wrong image host");
 const m=info.extmetadata||{};
 if(m.LicenseShortName?.value!==q.license||!String(m.Artist?.value||"").includes(q.creator))throw Error("Image rights/artist mismatch");
 const desc=String(m.ImageDescription?.value||"");
 // Wikimedia ImageDescription is optional/partial. A locked exact file title, archive ID,
 // live artist and live CC license remain hard gates; the resulting image is DRAFT-only.
 // Reject an explicit different museum accession rather than treating a missing prose
 // description as loss of rights. Human crop/depiction review remains mandatory.
 const otherAccessions=[...desc.matchAll(/TM\.\d{5}(?:\.[A-Z-]+)?/g)].map(x=>x[0]);
 if(otherAccessions.some(id=>id!==q.museum_accession))throw Error("Commons describes a different museum object");
}
async function checkedFetch(url){
 const response=await fetch(url,{headers:{"User-Agent":"HistoryGoImageAudit/1.0 (https://github.com/Paradispartiet/History-Go)"},signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error("HTTP "+response.status);
 return response;
}
export async function stage(){
 const q=read(requestPath),reg=read(candidatesPath),place=read(placePath);
 validateRequest(q,reg,place);
 if(fs.existsSync(q.image_path)||fs.existsSync(q.report_path))throw Error("Refusing to overwrite unreviewed output");
 const api=new URL("https://commons.wikimedia.org/w/api.php");
 for(const [k,v] of Object.entries({action:"query",format:"json",prop:"imageinfo",iiprop:"url|size|mime|extmetadata",titles:q.file_title}))api.searchParams.set(k,v);
 const result=await (await checkedFetch(api.href)).json();
 const pages=Object.values(result.query?.pages||{});
 if(pages.length!==1)throw Error("Ambiguous Commons page");
 const page=pages[0],info=page.imageinfo?.[0];
 validateCommons(page,info,q);
 const raw=await checkedFetch(info.url);
 if(new URL(raw.url).hostname!=="upload.wikimedia.org"||!String(raw.headers.get("content-type")||"").startsWith("image/jpeg"))throw Error("Not expected Wikimedia JPEG");
 const bytes=Buffer.from(await raw.arrayBuffer());
 if(bytes.length<10000||bytes.length>15000000)throw Error("Image byte count invalid");
 const metadata=await sharp(bytes).metadata();
 if(metadata.format!=="jpeg"||metadata.width!==info.width||metadata.height!==info.height)throw Error("Commons file image mismatch");
 const image=await sharp(bytes).rotate().resize(800,800,{fit:"contain",background:"#191919"}).webp({quality:84,effort:4}).toBuffer();
 const outMeta=await sharp(image).metadata();
 if(outMeta.format!=="webp"||outMeta.width!==800||outMeta.height!==800)throw Error("Rendered asset mismatch");
 const record={schema:"history_go_dnt_object_image_draft_v1",place_id:q.place_id,candidate_id:q.candidate_id,museum_accession:q.museum_accession,status:"LOCAL_IMAGE_IN_DRAFT_NOT_CANONICAL",source_page:q.source_page,original_file:page.title,source_url:info.url,creator:q.creator,credit:q.credit,license:q.license,license_url:q.license_url,source_sha256:hash(bytes),asset_sha256:hash(image),source_dimensions:{width:info.width,height:info.height},asset_dimensions:{width:800,height:800},asset_path:q.image_path,transformation:q.transformation,next_gate:"Visually review full costume; create canonical Object only with coherent Objects collection and valid member media."};
 fs.mkdirSync(path.dirname(q.image_path),{recursive:true});
 fs.mkdirSync(path.dirname(q.report_path),{recursive:true});
 fs.writeFileSync(q.image_path,image);
 fs.writeFileSync(q.report_path,JSON.stringify(record,null,2)+"\n");
 console.log(JSON.stringify({staged:true,path:q.image_path,sha256:record.asset_sha256}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)stage().catch(e=>{console.error("DNT image staging FAILED CLOSED:",e);process.exitCode=1;});
