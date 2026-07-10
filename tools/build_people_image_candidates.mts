#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const MANIFEST = 'data/people/manifest.json';
const OUT = 'data/people/people_image_candidates.json';
const WIKIDATA = 'https://www.wikidata.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'HistoryGoPeopleImageBot/1.0 (https://github.com/Paradispartiet/History-Go)';
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const limit = limitArg ? Math.max(0, Number(limitArg.split('=')[1]) || 0) : Infinity;
const idsArg = process.argv.find(a => a.startsWith('--ids='));
const ids = idsArg ? new Set(idsArg.split('=')[1].split(',').map(v => v.trim()).filter(Boolean)) : null;

const abs = (p:string) => path.join(ROOT, p);
const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));

async function readJson(p:string){ return JSON.parse(await fs.readFile(abs(p),'utf8')); }
async function writeJson(p:string,v:unknown){ await fs.mkdir(path.dirname(abs(p)),{recursive:true}); await fs.writeFile(abs(p),JSON.stringify(v,null,2)+'\n'); }
function flattenPeople(data:any):any[]{
  if(Array.isArray(data)) return data;
  for(const key of ['people','persons','items']) if(Array.isArray(data?.[key])) return data[key];
  return data && typeof data==='object' && data.id ? [data] : [];
}
function resolve(entry:string){
  if(!entry.startsWith('people/')) throw new Error(`Ugyldig manifest-entry: ${entry}`);
  return `data/${entry}`;
}
function api(base:string, params:Record<string,string>){ const u=new URL(base); for(const [k,v] of Object.entries(params)) u.searchParams.set(k,v); return u; }
async function fetchJson(url:URL){ const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':USER_AGENT}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return r.json(); }
function text(v:any){ return String(v?.value ?? v ?? '').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim(); }
function allowedLicense(name:string){
  const n=name.toLowerCase();
  return n.includes('public domain') || n==='cc0' || n.startsWith('cc by') || n.startsWith('cc-by');
}
async function searchWikidata(person:any){
  const q=[person.name, person.birthYear || person.born, person.role || person.occupation].filter(Boolean).join(' ');
  const s=await fetchJson(api(WIKIDATA,{action:'wbsearchentities',format:'json',language:'en',uselang:'en',type:'item',limit:'5',search:q}));
  const hits=(s.search||[]).slice(0,5);
  if(!hits.length) return [];
  const e=await fetchJson(api(WIKIDATA,{action:'wbgetentities',format:'json',props:'claims|labels|descriptions',languages:'en|nb|no',ids:hits.map((h:any)=>h.id).join('|')}));
  return hits.map((hit:any)=>({hit,entity:e.entities?.[hit.id]})).filter((x:any)=>x.entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value);
}
async function commonsInfo(file:string){
  const title=file.startsWith('File:')?file:`File:${file}`;
  const d=await fetchJson(api(COMMONS,{action:'query',format:'json',formatversion:'2',titles:title,prop:'imageinfo',iiprop:'url|mime|size|extmetadata',iiurlwidth:'900'}));
  const p=d.query?.pages?.[0]; const i=p?.imageinfo?.[0]; if(!i?.url) return null;
  const m=i.extmetadata||{}; const license=text(m.LicenseShortName);
  return {fileTitle:p.title, originalUrl:i.url, thumbUrl:i.thumburl||i.url, pageUrl:i.descriptionurl, mime:i.mime, width:i.width, height:i.height, author:text(m.Artist), credit:text(m.Credit), license, licenseUrl:text(m.LicenseUrl), allowed:allowedLicense(license)};
}

const manifest=await readJson(MANIFEST);
const files=Array.isArray(manifest)?manifest:(manifest.files||[]);
const people:any[]=[];
for(const entry of files){
  const file=resolve(entry); const data=await readJson(file);
  for(const p of flattenPeople(data)) if(p?.id && p?.name) people.push({...p,__file:file});
}
const selected=people.filter(p=>!ids||ids.has(p.id)).slice(0,limit);
const results:any[]=[];
for(let idx=0; idx<selected.length; idx++){
  const p=selected[idx];
  const row:any={personId:p.id,name:p.name,sourceFile:p.__file,status:'no_candidate',candidates:[]};
  try{
    const matches=await searchWikidata(p);
    for(const {hit,entity} of matches){
      const file=entity.claims.P18[0].mainsnak.datavalue.value;
      const info=await commonsInfo(file);
      if(!info) continue;
      row.candidates.push({wikidataId:hit.id,label:hit.label,description:hit.description,source:'wikidata_p18',...info,reviewStatus:info.allowed?'needs_review':'rejected_license'});
    }
    if(row.candidates.some((c:any)=>c.allowed)) row.status='needs_review';
    else if(row.candidates.length) row.status='no_allowed_license';
  }catch(err:any){ row.status='error'; row.error=err?.message||String(err); }
  results.push(row);
  process.stdout.write(`[${idx+1}/${selected.length}] ${p.id}: ${row.status}\n`);
  await sleep(180);
}
await writeJson(OUT,{schema:'history-go.people-image-candidates.v1',generatedAt:new Date().toISOString(),policy:{automaticPublishing:false,allowedLicenses:['Public Domain','CC0','CC BY','CC BY-SA'],instructions:'Set approvedCandidateIndex on reviewed rows before apply:write.'},results});
console.log(`Skrev ${OUT}`);
