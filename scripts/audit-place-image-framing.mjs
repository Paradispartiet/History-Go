#!/usr/bin/env node
// History Go: site-wide image/frontImage overview audit. This identifies
// previously cropped/missing/unproven sources; it does not modify any Places
// or infer absent photo content. Rendering fixes live in CSS; hard crops must
// be regenerated from a rightfully reusable original.
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync(path.join(root,"data/places/manifest.json"),"utf8"));
const args=process.argv.slice(2);
const outIndex=args.indexOf("--output");
const output=outIndex>=0?args[outIndex+1]:null;
if(outIndex>=0&&!output)throw Error("--output requires a file path");

const text=x=>typeof x==="string"?x.trim():"";
const isExternal=s=>/^https?:\/\//i.test(s);
const numberDimensions=value=>{
  if(Array.isArray(value)&&value.length>=2&&value.slice(0,2).every(x=>Number(x)>0))return value.slice(0,2).map(Number);
  if(value&&typeof value==="object"&&value.width>0&&value.height>0)return [Number(value.width),Number(value.height)];
  const str=String(value||"");
  const match=str.match(/(\d{2,5})\s*(?:x|×|by)\s*(\d{2,5})/i);
  return match?[Number(match[1]),Number(match[2])]:null;
};
const ratio=size=>size?size[0]/size[1]:null;
const getSize=(meta,kind)=>kind==="source"?
  numberDimensions(meta?.originalDimensions||meta?.sourceDimensions||meta?.localSourceDimensions):
  numberDimensions(meta?.outputDimensions||meta?.dimensions);
const sourceIdentity=meta=>text(meta?.sourceSha256||meta?.sourceLocalSha256||meta?.sourcePage||meta?.sourceUrl);
const overviewTerms=/\b(contain|full frame|full source|entire original|whole photo|uncropped|no crop|hele foto|hele original|uten beskj|uten zoom|ingen zoom)\b/i;
const cropTerms=/\b(cropped|crop|center.?crop|beskj[aæ]r|besk[aæ]r|utsnitt|imageops\.fit|object-fit:\s*cover)\b/i;
const tally={};
const rows=[],invalid=[];
for(const filename of manifest.files||[]){
  const abs=path.join(root,"data",filename);
  if(!fs.existsSync(abs)){invalid.push({path:filename,error:"missing"});continue;}
  let loaded;
  try{loaded=JSON.parse(fs.readFileSync(abs,"utf8"));}catch(err){invalid.push({path:filename,error:String(err).slice(0,180)});continue;}
  const candidates=Array.isArray(loaded)?loaded:(loaded&&Array.isArray(loaded.places)?loaded.places:[loaded]);
  for(const place of candidates){
    if(!place||typeof place!=="object"||!place.id)continue;
    const main=text(place.image),front=text(place.frontImage),mainMeta=place.imageMeta||{},frontMeta=place.frontImageMeta||{};
    const warnings=[];
    if(!main)warnings.push("image_missing");
    if(!front)warnings.push("frontImage_missing");
    if(main&&front&&main===front)warnings.push("same_photo_both_roles");
    if(front&&isExternal(front))warnings.push("frontImage_external_uncontrolled_dimensions");
    if(main&&isExternal(main))warnings.push("image_external_uncontrolled_dimensions");
    if(front&&front.startsWith("bilder/")&&!sourceIdentity(frontMeta))warnings.push("frontImage_source_not_auditable");
    if(main&&main.startsWith("bilder/")&&!sourceIdentity(mainMeta))warnings.push("image_source_not_auditable");
    const a=getSize(frontMeta,"source"),b=getSize(frontMeta,"output"),r1=ratio(a),r2=ratio(b);
    const transformation=text(frontMeta.transformation);
    const meaningfulDifference=r1&&r2?Math.max(r1/r2,r2/r1)>=1.12:false;
    if(meaningfulDifference&&cropTerms.test(transformation)&&!overviewTerms.test(transformation)){
      warnings.push("possible_pre_cropped_frontImage");
    }
    if(mainMeta&&frontMeta){
      const m=sourceIdentity(mainMeta),f=sourceIdentity(frontMeta);
      if(m&&f&&m===f)warnings.push("same_original_for_two_roles");
    }
    const high=warnings.includes("possible_pre_cropped_frontImage");
    const medium=warnings.some(w=>["same_photo_both_roles","same_original_for_two_roles","frontImage_source_not_auditable"].includes(w));
    const priority=high?"review_export":medium?"review_source":"display_only_or_not_proven";
    for(const warning of warnings)tally[warning]=(tally[warning]||0)+1;
    rows.push({
      id:place.id,name:place.name||"",category:place.category||"",canonical_file:"data/"+filename,
      image:main||null,frontImage:front||null,
      imageMeta:{source:sourceIdentity(mainMeta)||null,transform:text(mainMeta.transformation)||null},
      frontImageMeta:{source:sourceIdentity(frontMeta)||null,transform:transformation||null,
        source_dimensions:a,output_dimensions:b},
      warnings,priority
    });
  }
}
rows.sort((a,b)=>{
 const rank={review_export:0,review_source:1,display_only_or_not_proven:2};
 return rank[a.priority]-rank[b.priority]||a.category.localeCompare(b.category)||a.name.localeCompare(b.name);
});
const report={
  schema:"history_go_place_image_framing_inventory_v1",
  scan:"all canonical data/places/manifest.json records; metadata-only, no guessing from photo pixels",
  created_at:"2026-11-11",
  policies:[
    "Display complete image/frontImage in the intended frame with object-fit: contain.",
    "For new fixed-size WebP, preserve entire sharp original over blurred photo matte.",
    "Do not automatically treat a same-source photo as false or regenerate third-party images without rights review.",
    "Only a source-original re-export can restore content that was discarded by a previous hard crop."
  ],
  summary:{canonical_files:manifest.files?.length||0,places:rows.length,invalid_files:invalid.length,
    priority_review_export:rows.filter(x=>x.priority==="review_export").length,
    priority_review_source:rows.filter(x=>x.priority==="review_source").length,
    warning_counts:tally},
  invalid_files:invalid,
  places:rows
};
if(output){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");}
console.log(JSON.stringify({summary:report.summary,report:output||"stdout only"},null,2));
