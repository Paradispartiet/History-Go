#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const args=new Set(process.argv.slice(2));
const mode=(process.argv.find((arg)=>arg.startsWith('--mode='))||'--mode=all').split('=')[1];
const reportArg=process.argv.find((arg)=>arg.startsWith('--report='));
const reportPath=reportArg?path.resolve(ROOT,reportArg.split('=').slice(1).join('=')):null;
const strict=args.has('--strict');
const IMAGE_FIELDS=['popupImage','cardImage','image'];

function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function list(value){return Array.isArray(value)?value:[];}
function text(value){return String(value==null?'':value).trim();}
function placesFrom(data){if(Array.isArray(data))return data;if(Array.isArray(data?.places))return data.places;if(data&&typeof data==='object'&&typeof data.id==='string')return[data];return[];}
function dataFile(manifestPath){return path.join(ROOT,'data',manifestPath.replace(/^data\//,''));}
function siblingManifest(file){const ext=path.extname(file);return file.slice(0,-ext.length)+'_manifest'+ext;}
function resolveChild(baseManifest,child){const clean=text(child).replace(/^\.\//,'').replace(/^data\//,'');if(clean.startsWith('places/'))return clean;return path.posix.join(path.posix.dirname(baseManifest),clean);}

function loadEntries(){
  const manifest=readJson(path.join(ROOT,'data/places/manifest.json'));
  const rows=[];
  for(const manifestFile of list(manifest.files)){
    const normalized=text(manifestFile).replace(/^data\//,'');
    const split=siblingManifest(normalized);
    const splitAbs=dataFile(split);
    if(fs.existsSync(splitAbs)){
      const splitData=readJson(splitAbs);
      if(Array.isArray(splitData?.places)&&splitData.places.some((row)=>text(row?.file))){
        for(const row of splitData.places){
          const child=resolveChild(split,row.file);
          const abs=dataFile(child);
          if(!fs.existsSync(abs))continue;
          for(const place of placesFrom(readJson(abs)))rows.push({place,sourceFile:`data/${child}`});
        }
        continue;
      }
    }
    const abs=dataFile(normalized);
    if(!fs.existsSync(abs))continue;
    for(const place of placesFrom(readJson(abs)))rows.push({place,sourceFile:`data/${normalized}`});
  }
  const exclusionsPath=path.join(ROOT,'data/places/place_exclusions.json');
  const disabled=new Set(fs.existsSync(exclusionsPath)?list(readJson(exclusionsPath)?.disabledPlaceIds).map(text):[]);
  return rows.filter(({place})=>!disabled.has(text(place?.id)));
}

function imageCandidate(place){for(const field of IMAGE_FIELDS){const value=text(place?.[field]);if(value)return{field,value};}return{field:'',value:''};}
function localAssetPath(value){
  let clean=text(value).split('#')[0].split('?')[0];
  try{clean=decodeURIComponent(clean);}catch{}
  if(/^https?:\/\//i.test(clean))return{kind:'remote',path:clean};
  if(/^data:/i.test(clean)||/^blob:/i.test(clean))return{kind:'invalid',path:clean};
  clean=clean.replace(/^https?:\/\/[^/]+\/History-Go\//i,'').replace(/^\/History-Go\//,'').replace(/^\.\//,'').replace(/^\//,'');
  return{kind:'local',path:path.resolve(ROOT,clean)};
}
function inspect(entry){
  const id=text(entry.place?.id)||'(mangler id)';
  const category=text(entry.place?.category)||'ukjent';
  const candidate=imageCandidate(entry.place);
  if(!candidate.value)return{id,category,sourceFile:entry.sourceFile,status:'missing',field:'',value:'',reason:'Ingen popupImage, cardImage eller image'};
  const asset=localAssetPath(candidate.value);
  if(asset.kind==='remote')return{id,category,sourceFile:entry.sourceFile,status:'remote',field:candidate.field,value:candidate.value,reason:''};
  if(asset.kind==='invalid')return{id,category,sourceFile:entry.sourceFile,status:'invalid',field:candidate.field,value:candidate.value,reason:'Inline/blob-bilder er ikke inspectable stedsressurser'};
  if(!fs.existsSync(asset.path))return{id,category,sourceFile:entry.sourceFile,status:'invalid',field:candidate.field,value:candidate.value,reason:'Lokal bildefil finnes ikke'};
  return{id,category,sourceFile:entry.sourceFile,status:'local',field:candidate.field,value:candidate.value,reason:''};
}
function changedFiles(){
  const base=process.env.GITHUB_BASE_REF||'main';
  try{return new Set(execFileSync('git',['diff','--name-only',`origin/${base}...HEAD`],{cwd:ROOT,encoding:'utf8'}).split(/\r?\n/).map(text).filter(Boolean));}
  catch{return new Set();}
}

const entries=loadEntries();
const changed=mode==='changed'?changedFiles():null;
const inspected=entries.map(inspect).filter((row)=>!changed||changed.has(row.sourceFile));
const failures=inspected.filter((row)=>row.status==='missing'||row.status==='invalid');
const byCategory={};
for(const row of entries.map(inspect)){const bucket=byCategory[row.category]||(byCategory[row.category]={total:0,local:0,remote:0,missing:0,invalid:0});bucket.total+=1;bucket[row.status]+=1;}
const report={schema:'history_go_place_image_audit_v1',generatedAt:new Date().toISOString(),mode,totalPlaces:entries.length,checkedPlaces:inspected.length,summary:{local:entries.map(inspect).filter((row)=>row.status==='local').length,remote:entries.map(inspect).filter((row)=>row.status==='remote').length,missing:entries.map(inspect).filter((row)=>row.status==='missing').length,invalid:entries.map(inspect).filter((row)=>row.status==='invalid').length},byCategory,failures:entries.map(inspect).filter((row)=>row.status==='missing'||row.status==='invalid')};
if(reportPath){fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');}
console.log(`Place image audit: ${report.totalPlaces} steder · ${report.summary.local} lokale · ${report.summary.remote} eksterne · ${report.summary.missing} mangler · ${report.summary.invalid} ugyldige`);
if(failures.length){for(const row of failures.slice(0,80))console.error(`- ${row.id} [${row.category}] ${row.sourceFile}: ${row.reason}${row.value?` (${row.value})`:''}`);if(failures.length>80)console.error(`… og ${failures.length-80} til`);}
if((mode==='changed'||strict)&&failures.length)process.exitCode=1;
