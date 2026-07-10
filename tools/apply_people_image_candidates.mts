#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT=process.cwd();
const INPUT='data/people/people_image_candidates.json';
const WRITE=process.argv.includes('--write');
const abs=(p:string)=>path.join(ROOT,p);
async function readJson(p:string){return JSON.parse(await fs.readFile(abs(p),'utf8'));}
async function writeJson(p:string,v:any){await fs.writeFile(abs(p),JSON.stringify(v,null,2)+'\n');}
function peopleArray(data:any){if(Array.isArray(data)) return data; for(const k of ['people','persons','items']) if(Array.isArray(data?.[k])) return data[k]; if(data?.id) return [data]; return [];}
function ext(mime:string,url:string){if(mime.includes('png'))return'png';if(mime.includes('webp'))return'webp';return url.toLowerCase().includes('.png')?'png':'jpg';}
const candidateFile=await readJson(INPUT);
const approved=(candidateFile.results||[]).filter((r:any)=>Number.isInteger(r.approvedCandidateIndex));
let changed=0;
for(const row of approved){
  const candidate=row.candidates?.[row.approvedCandidateIndex];
  if(!candidate?.allowed) throw new Error(`${row.personId}: kandidat har ikke tillatt lisens`);
  const data=await readJson(row.sourceFile); const arr=peopleArray(data); const person=arr.find((p:any)=>p.id===row.personId);
  if(!person) throw new Error(`${row.personId}: ikke funnet i ${row.sourceFile}`);
  const extension=ext(candidate.mime,candidate.originalUrl);
  const rel=`bilder/people/auto/${row.personId}.${extension}`;
  const meta={source:'wikimedia_commons',wikidataId:candidate.wikidataId,sourcePage:candidate.pageUrl,creator:candidate.author||'',credit:candidate.credit||'',license:candidate.license,licenseUrl:candidate.licenseUrl,retrievedAt:new Date().toISOString().slice(0,10),reviewStatus:'approved'};
  console.log(`${WRITE?'APPLY':'DRY'} ${row.personId} <- ${candidate.fileTitle}`);
  if(!WRITE) continue;
  const res=await fetch(candidate.originalUrl,{headers:{'User-Agent':'HistoryGoPeopleImageBot/1.0 (https://github.com/Paradispartiet/History-Go)'}});
  if(!res.ok) throw new Error(`${row.personId}: bildehenting feilet ${res.status}`);
  await fs.mkdir(path.dirname(abs(rel)),{recursive:true}); await fs.writeFile(abs(rel),Buffer.from(await res.arrayBuffer()));
  person.image=rel; person.cardImage=rel; person.imageMeta=meta;
  await writeJson(row.sourceFile,data); changed++;
}
console.log(`${WRITE?'Oppdatert':'Ville oppdatert'} ${approved.length} personer${WRITE?` (${changed} filer skrevet)`:''}.`);
