#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'data/places/manifest.json');
const OUT_JSON = path.join(ROOT, 'reports/place-coordinate-source-candidates.json');
const OUT_MD = path.join(ROOT, 'reports/place-coordinate-source-candidates.md');
const CACHE = path.join(ROOT, 'reports/place-coordinate-source-cache.json');
const UA = 'HistoryGoCoordinateAudit/1.0 contact: repo-owner';
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const limitArg = [...args].find((a)=>a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const distM = (a,b,c,d)=>{const R=6371000,p=Math.PI/180;const d1=(c-a)*p,d2=(d-b)*p;const q=Math.sin(d1/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(d2/2)**2;return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));};

async function readJson(f){return JSON.parse(await fs.readFile(f,'utf8'));}

async function fetchNominatim(query){
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Nominatim ${r.status}`);
  return r.json();
}

function pick(place, results){
  if (!results.length) return { confidence:'no_match', reason:'Ingen treff fra Nominatim.' };
  const name = place.name.toLowerCase();
  const best = results[0];
  const lat = Number(best.lat), lon = Number(best.lon);
  const d = distM(place.lat, place.lon, lat, lon);
  const dn = `${best.name||''} ${best.display_name||''}`.toLowerCase();
  let confidence = 'medium';
  let reason = 'Treff fra Nominatim, men krever manuell kontroll.';
  if ((dn.includes('oslo') || dn.includes('norway')) && d < 1200) { confidence = 'high'; reason = 'Navn/område matcher og avstand er plausibel.'; }
  if (d > 3000) { confidence = 'low'; reason = 'For stor avstand fra eksisterende punkt.'; }
  return {
    source:'osm_nominatim', sourceName:best.display_name, sourceLat:lat, sourceLon:lon,
    sourceType:`${best.class||'unknown'}/${best.type||'unknown'}`, sourceId:`${best.osm_type}:${best.osm_id}`,
    sourceUrl:`https://www.openstreetmap.org/${best.osm_type}/${best.osm_id}`,
    distanceFromCurrentMeters:Math.round(d), confidence, reason
  };
}

const manifest = await readJson(MANIFEST);
const places=[];
for (const rel of manifest.files){
  const file = path.join(ROOT,'data',rel);
  const arr = await readJson(file);
  for (const p of arr) places.push({file:path.relative(ROOT,file),...p});
}
let cache = {};
try { cache = await readJson(CACHE); } catch {}
const candidates=[];
for (const p of (limit ? places.slice(0, limit) : places)){
  const key = `${p.id}::${p.name}`;
  let raw = cache[key];
  if (!raw){
    try { raw = { ok:true, results: await fetchNominatim(`${p.name}, ${p.category||''}, Oslo, Norway`) }; }
    catch (e){ raw = { ok:false, error:String(e.message||e) }; }
    cache[key]=raw;
    await sleep(1100);
  }
  const base = { file:p.file,id:p.id,name:p.name,category:p.category,currentLat:p.lat,currentLon:p.lon,currentR:p.r };
  if (!raw.ok){ candidates.push({...base, source:'osm_nominatim', confidence:'no_match', reason:`Lookup feilet: ${raw.error}`}); continue; }
  const chosen = pick(p, raw.results||[]);
  candidates.push({...base, ...chosen});
}

const payload = { generatedAt: new Date().toISOString().slice(0,10), dryRun, userAgent:UA, count:candidates.length, candidates };
await fs.writeFile(CACHE, JSON.stringify(cache,null,2));
await fs.writeFile(OUT_JSON, JSON.stringify(payload,null,2));
const md = ['# Place coordinate source candidates','','- Generated: '+payload.generatedAt,`- Dry run: ${dryRun}`,'', '|id|name|source|confidence|distance_m|reason|','|---|---|---|---:|---:|---|', ...candidates.map(c=>`|${c.id}|${c.name}|${c.source||''}|${c.confidence}|${c.distanceFromCurrentMeters??''}|${(c.reason||'').replace(/\|/g,'/')}|`)].join('\n');
await fs.writeFile(OUT_MD, md+'\n');
console.log(`Wrote ${OUT_JSON} and ${OUT_MD}`);
