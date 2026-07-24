import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const OUT='reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193';
const ROOT='https://od2.pbe.oslo.kommune.no/kart/';
const ENDPOINT='https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
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
const baseResearch=readJson(`${OUT}/summary.json`);
if(!(baseResearch.geometryContainsCenter||[]).some(x=>x.properties?.PLANID==='202020172'&&x.properties?.PLANNAVN==='S-5100'))throw new Error('Locked S-5100 covering feature missing from base research');

const root=await fetchText(ROOT);
if(!root.ok)throw new Error(`Planinnsyn /kart HTTP ${root.status}`);
const scripts=unique([...root.text.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)].map(m=>absolute(m[1],ROOT)));
const assets=[];
const mapNames=new Set(['REGTILLEGG']);
const snippets=[];
function scan(text,source){
  const normalized=text.replace(/\\\//g,'/');
  const patterns=[/\bmap=([A-Za-z0-9_-]+)/g,/\bmap%3D([A-Za-z0-9_-]+)/gi,/["']map["']\s*:\s*["']([A-Za-z0-9_-]+)["']/g,/[?&]map\s*[:=]\s*["']?([A-Za-z0-9_-]+)/gi];
  for(const pattern of patterns)for(const match of normalized.matchAll(pattern)){mapNames.add(match[1]);if(snippets.length<300)snippets.push({source,match:match[0],map:match[1]});}
}
scan(root.text,ROOT);
for(const url of scripts.slice(0,50)){
  const r=await fetchText(url);
  assets.push({url,status:r.status,ok:r.ok,size:r.text.length,contentType:r.contentType});
  if(r.ok&&r.text.length<30_000_000)scan(r.text,url);
}

const mapConfigs=[...mapNames].sort();
const probes=[];
for(const map of mapConfigs){
  const url=`${ENDPOINT}?`+new URLSearchParams({map,service:'WFS',request:'GetCapabilities',version:'2.0.0'});
  const r=await fetchText(url);
  const featureTypes=[];
  if(r.ok){
    for(const block of r.text.matchAll(/<FeatureType>([\s\S]*?)<\/FeatureType>/gi)){
      const name=block[1].match(/<Name>([^<]+)<\/Name>/i)?.[1]?.trim();
      const crs=block[1].match(/<DefaultCRS>([^<]+)<\/DefaultCRS>/i)?.[1]?.trim();
      if(name)featureTypes.push({name,defaultCrs:crs||null});
    }
  }
  probes.push({map,url,status:r.status,ok:r.ok,contentType:r.contentType,size:r.text.length,featureTypes,preview:r.text.slice(0,500).replace(/\s+/g,' ')});
  if(r.ok&&r.text.length<5_000_000)writeFileSync(`${OUT}/wfs-capabilities-${map}.xml`,r.text,'utf8');
}
const usable=probes.filter(x=>x.ok&&x.featureTypes.length);
const result={version:DATE,placeId:PLACE_ID,coordinateMaxBatch:maxBatch,mapConfigs,assetCount:assets.length,assets,snippets,probes,usable,nextAction:'Query PLANID 202020172 / PLANNAVN S-5100 only against WFS feature types actually advertised by the discovered Planinnsyn map configurations.'};
writeJson(`${OUT}/map-config-wfs-discovery.json`,result);
writeFileSync(`${OUT}/README.md`,`# Regjeringskvartalet Oslo Planinnsyn WFS area research\n\nDate: ${DATE}\n\nLocked candidate: PLANID 202020172 / S-5100.\n\n- Planinnsyn JS assets scanned: ${assets.length}\n- map configurations discovered: ${mapConfigs.length}\n- map configurations with usable WFS feature types: ${usable.length}\n\nNo canonical coordinate changed.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,mapConfigs,usable:usable.map(x=>({map:x.map,featureTypes:x.featureTypes})),probeSummary:probes.map(x=>({map:x.map,status:x.status,featureTypeCount:x.featureTypes.length}))},null,2));
