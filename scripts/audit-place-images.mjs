#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isImageOptionalMicroPlace, isPlaceScopeOnlyJsonChange } from './lib/place-image-change-classifier.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=new Set(process.argv.slice(2));
const mode=(process.argv.find((arg)=>arg.startsWith('--mode='))||'--mode=all').split('=')[1];
const reportArg=process.argv.find((arg)=>arg.startsWith('--report='));
const reportPath=reportArg?path.resolve(ROOT,reportArg.split('=').slice(1).join('=')):null;
const summaryArg=process.argv.find((arg)=>arg.startsWith('--verify-summary='));
const summaryPath=summaryArg?path.resolve(ROOT,summaryArg.split('=').slice(1).join('=')):null;
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
  const resolved=path.resolve(ROOT,clean);
  if(resolved!==ROOT&&!resolved.startsWith(`${ROOT}${path.sep}`))return{kind:'invalid',path:resolved};
  return{kind:'local',path:resolved};
}
function inspect(entry){
  const id=text(entry.place?.id)||'(mangler id)';
  const category=text(entry.place?.category)||'ukjent';
  const candidate=imageCandidate(entry.place);
  if(!candidate.value&&isImageOptionalMicroPlace(entry.place))return{id,category,sourceFile:entry.sourceFile,status:'optional',field:'',value:'',reason:'Canonical Micro Place har ikke obligatorisk bilde'};
  if(!candidate.value)return{id,category,sourceFile:entry.sourceFile,status:'missing',field:'',value:'',reason:'Ingen popupImage, cardImage eller image'};
  const asset=localAssetPath(candidate.value);
  if(asset.kind==='remote')return{id,category,sourceFile:entry.sourceFile,status:'remote',field:candidate.field,value:candidate.value,reason:''};
  if(asset.kind==='invalid')return{id,category,sourceFile:entry.sourceFile,status:'invalid',field:candidate.field,value:candidate.value,reason:'Bildepekeren er ikke en inspectable stedsressurs'};
  if(!fs.existsSync(asset.path))return{id,category,sourceFile:entry.sourceFile,status:'invalid',field:candidate.field,value:candidate.value,reason:'Lokal bildefil finnes ikke'};
  return{id,category,sourceFile:entry.sourceFile,status:'local',field:candidate.field,value:candidate.value,reason:''};
}
function baseRef(){return process.env.GITHUB_BASE_REF||'main';}
function changedFiles(){
  try{return new Set(execFileSync('git',['diff','--name-only',`origin/${baseRef()}...HEAD`],{cwd:ROOT,encoding:'utf8'}).split(/\r?\n/).map(text).filter(Boolean));}
  catch{return new Set();}
}
function placeScopeOnlyFiles(changed){
  const ignored=new Set();
  for(const sourceFile of changed){
    if(!sourceFile.startsWith('data/places/')||!sourceFile.endsWith('.json'))continue;
    const currentPath=path.resolve(ROOT,sourceFile);
    if(!currentPath.startsWith(`${ROOT}${path.sep}`)||!fs.existsSync(currentPath))continue;
    try{
      const before=JSON.parse(execFileSync('git',['show',`origin/${baseRef()}:${sourceFile}`],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}));
      const after=readJson(currentPath);
      if(isPlaceScopeOnlyJsonChange(before,after))ignored.add(sourceFile);
    }catch{}
  }
  return ignored;
}
function verifySummary(report,file){
  const saved=readJson(file);
  const expected={totalPlaces:report.totalPlaces,validLocal:report.summary.local,validRemote:report.summary.remote,optionalMissing:report.summary.optional,missing:report.summary.missing,invalidLocalPath:report.summary.invalid,remaining:report.summary.missing+report.summary.invalid};
  const actual={totalPlaces:saved.totalPlaces,validLocal:saved.summary?.validLocal,validRemote:saved.summary?.validRemote,optionalMissing:saved.summary?.optionalMissing,missing:saved.summary?.missing,invalidLocalPath:saved.summary?.invalidLocalPath,remaining:saved.summary?.remaining};
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error(`Bildebacklog-summary er utdatert. Forventet ${JSON.stringify(expected)}, fant ${JSON.stringify(actual)}`);
}

const entries=loadEntries();
const allRows=entries.map(inspect);
const changed=mode==='changed'?changedFiles():null;
const scopeOnly=changed?placeScopeOnlyFiles(changed):new Set();
const inspected=allRows.filter((row)=>!changed||(changed.has(row.sourceFile)&&!scopeOnly.has(row.sourceFile)));
const failures=inspected.filter((row)=>row.status==='missing'||row.status==='invalid');
const byCategory={};
for(const row of allRows){const bucket=byCategory[row.category]||(byCategory[row.category]={total:0,local:0,remote:0,optional:0,missing:0,invalid:0});bucket.total+=1;bucket[row.status]+=1;}
const report={schema:'history_go_place_image_audit_v1',generatedAt:new Date().toISOString(),mode,totalPlaces:entries.length,checkedPlaces:inspected.length,summary:{local:allRows.filter((row)=>row.status==='local').length,remote:allRows.filter((row)=>row.status==='remote').length,optional:allRows.filter((row)=>row.status==='optional').length,missing:allRows.filter((row)=>row.status==='missing').length,invalid:allRows.filter((row)=>row.status==='invalid').length},byCategory,failures:allRows.filter((row)=>row.status==='missing'||row.status==='invalid')};
if(reportPath){fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');}
if(summaryPath)verifySummary(report,summaryPath);
console.log(`Place image audit: ${report.totalPlaces} steder · ${report.summary.local} lokale · ${report.summary.remote} eksterne · ${report.summary.optional} valgfrie Micro Place-bilder · ${report.summary.missing} mangler · ${report.summary.invalid} ugyldige`);
if(scopeOnly.size)console.log(`Place image audit: ${scopeOnly.size} filer med kun placeScope-metadata er utenfor changed-bildeporten.`);
if(failures.length){for(const row of failures.slice(0,80))console.error(`- ${row.id} [${row.category}] ${row.sourceFile}: ${row.reason}${row.value?` (${row.value})`:''}`);if(failures.length>80)console.error(`… og ${failures.length-80} til`);}
if((mode==='changed'||strict)&&failures.length)process.exitCode=1;
