#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
const ROOT=process.cwd();
const dryRun=process.argv.includes('--dry-run');
const src=JSON.parse(await fs.readFile(path.join(ROOT,'reports/place-coordinate-source-candidates.json'),'utf8'));
const approved=(src.candidates||[]).filter(c=>c.approved===true);
const byFile=new Map();
for(const c of approved){if(!byFile.has(c.file))byFile.set(c.file,[]);byFile.get(c.file).push(c);}
for(const [file,items] of byFile){
  const abs=path.join(ROOT,file); const arr=JSON.parse(await fs.readFile(abs,'utf8'));
  for(const p of arr){
    const c=items.find(x=>x.id===p.id); if(!c) continue;
    p.lat=c.sourceLat; p.lon=c.sourceLon; if(c.newR) p.r=c.newR;
    p.coordStatus='verified'; p.coordSource=c.source; p.coordSourceId=c.sourceId||null; p.coordSourceUrl=c.sourceUrl||null;
    p.coordPrecisionM=c.coordPrecisionM ?? 40; p.coordVerifiedAt='2026-05-02'; p.coordNote='Koordinat satt etter kildebasert verifikasjon.';
  }
  if(!dryRun) await fs.writeFile(abs, JSON.stringify(arr,null,2)+'\n');
}
console.log(`${dryRun?'Dry-run':'Applied'} ${approved.length} approved candidates.`);
