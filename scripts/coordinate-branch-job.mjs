import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const ROOT='https://od2.pbe.oslo.kommune.no/kart/';
const OUT='reports/oslo-coordinate-regjeringskvartalet-planinnsyn-discovery-post-193';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
async function fetchText(url){const r=await fetch(url,{headers:{'user-agent':'History-Go coordinate research/1.0'}});const t=await r.text();return{url,status:r.status,ok:r.ok,contentType:r.headers.get('content-type'),text:t};}
const absolute=(v,b)=>{try{return new URL(v,b).href;}catch{return null;}};
const unique=a=>[...new Set(a.filter(Boolean))];
const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source')throw new Error('Unexpected Regjeringskvartalet state');

const root=await fetchText(ROOT);if(!root.ok)throw new Error(`Planinnsyn /kart HTTP ${root.status}`);
writeFileSync(`${OUT}/kart-root.html`,root.text,'utf8');
const scriptSrcs=unique([...root.text.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)].map(m=>absolute(m[1],ROOT)));
const preloadSrcs=unique([...root.text.matchAll(/<link\b[^>]*(?:href|src)=["']([^"']+)["']/gi)].map(m=>absolute(m[1],ROOT)).filter(u=>/\.(?:js|json)(?:\?|$)/i.test(u||'')));
const assets=unique([...scriptSrcs,...preloadSrcs]).slice(0,60);
const assetResults=[];
const candidates=[];
const snippets=[];
const urlRegex=/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g;
const serviceStringRegex=/["'`]([^"'`]{0,260}(?:MapServer|FeatureServer|geoserver|GetFeature|GetCapabilities|WFS|wfs|\/api\/|identify|query|reguleringsplan|planregister|plankart)[^"'`]{0,260})["'`]/g;
function scan(text,source){
  for(const m of text.matchAll(urlRegex)){const u=m[0].replace(/\\\//g,'/').replace(/[),;]+$/,'');if(/oslo|pbe|arcgis|geoserver|mapserver|featureserver|wfs|plan/i.test(u))candidates.push({source,value:u,absolute:u});}
  for(const m of text.matchAll(serviceStringRegex)){const value=m[1].replace(/\\\//g,'/');const abs=absolute(value,source);candidates.push({source,value,absolute:abs});if(snippets.length<1000)snippets.push({source,snippet:value.slice(0,520)});}
}
scan(root.text,ROOT);
for(const url of assets){const res=await fetchText(url);assetResults.push({url,status:res.status,ok:res.ok,contentType:res.contentType,size:res.text.length});if(res.ok&&res.text.length<25_000_000)scan(res.text,url);}
const dedup=[...new Map(candidates.filter(x=>x.absolute).map(x=>[x.absolute,x])).values()];
const endpointCandidates=dedup.filter(x=>/MapServer|FeatureServer|geoserver|wfs|WFS|api|identify|query|plan/i.test(x.absolute)).slice(0,300);
const probes=[];
for(const item of endpointCandidates.slice(0,100)){
  try{const res=await fetchText(item.absolute);probes.push({url:item.absolute,status:res.status,ok:res.ok,contentType:res.contentType,size:res.text.length,preview:res.text.slice(0,240).replace(/\s+/g,' ')});}catch(error){probes.push({url:item.absolute,error:String(error)});}
}
const result={version:DATE,placeId:PLACE_ID,coordinateMaxBatch:maxBatch,root:{url:ROOT,status:root.status,size:root.text.length},assets:assetResults,candidates:dedup,endpointCandidates,probes,keywordSnippets:snippets,nextAction:'Select the public Planinnsyn service/layer that exposes adopted regulation-plan area geometry and query Regjeringskvartalet by plan id/name.'};
writeJson(`${OUT}/discovery.json`,result);
writeFileSync(`${OUT}/README.md`,`# Regjeringskvartalet Planinnsyn endpoint discovery\n\nDate: ${DATE}\n\n- actual map root: ${ROOT}\n- map HTML bytes: ${root.text.length}\n- JS/JSON assets inspected: ${assetResults.length}\n- service-like candidates: ${endpointCandidates.length}\n- endpoints probed: ${probes.length}\n- successful probes: ${probes.filter(x=>x.ok).length}\n\nNo canonical coordinate changed.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,mapHtmlBytes:root.text.length,assetCount:assetResults.length,endpointCandidateCount:endpointCandidates.length,successfulProbes:probes.filter(x=>x.ok).slice(0,40),topCandidates:endpointCandidates.slice(0,60).map(x=>x.absolute)},null,2));
