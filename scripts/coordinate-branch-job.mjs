import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const ROOT='https://od2.pbe.oslo.kommune.no/';
const OUT='reports/oslo-coordinate-regjeringskvartalet-planinnsyn-discovery-post-193';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
async function fetchText(url,opts={}){const r=await fetch(url,{...opts,headers:{'user-agent':'History-Go coordinate research/1.0',...(opts.headers||{})}});const t=await r.text();return{url,status:r.status,ok:r.ok,contentType:r.headers.get('content-type'),text:t};}
const absolute=(value,base)=>{try{return new URL(value,base).href;}catch{return null;}};
const unique=a=>[...new Set(a.filter(Boolean))];

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source')throw new Error('Unexpected Regjeringskvartalet state');

const root=await fetchText(ROOT);
if(!root.ok)throw new Error(`Planinnsyn root HTTP ${root.status}`);
writeFileSync(`${OUT}/root.html`,root.text,'utf8');
const scriptSrcs=unique([...root.text.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)].map(m=>absolute(m[1],ROOT)));
const linkSrcs=unique([...root.text.matchAll(/<link\b[^>]*href=["']([^"']+\.(?:js|json)(?:\?[^"']*)?)["']/gi)].map(m=>absolute(m[1],ROOT)));
const assets=unique([...scriptSrcs,...linkSrcs]).slice(0,40);

const urlRegex=/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g;
const relativeServiceRegex=/(?:["'`])((?:\/|\.\/|\.\.\/)[^"'`\s]{3,240}(?:MapServer|FeatureServer|wfs|WFS|ows|api|query|identify|plan)[^"'`\s]{0,120})(?:["'`])/g;
const keywordRegex=/(?:.{0,180})(?:FeatureServer|MapServer|GetFeature|WFS|wfs|geoserver|arcgis|reguleringsplan|planinnsyn|identify|GetCapabilities|planregister|plankart)(?:.{0,260})/gi;
const discoveredUrls=[];
const relativeCandidates=[];
const keywordSnippets=[];
const assetResults=[];

function scan(text,source){
  for(const match of text.matchAll(urlRegex)){
    const cleaned=match[0].replace(/\\\//g,'/').replace(/[),;]+$/,'');
    if(/pbe|oslo|arcgis|geoserver|wfs|mapserver|featureserver|plan/i.test(cleaned))discoveredUrls.push({source,url:cleaned});
  }
  for(const match of text.matchAll(relativeServiceRegex))relativeCandidates.push({source,value:match[1],absolute:absolute(match[1],source)});
  const snippets=text.match(keywordRegex)||[];
  for(const snippet of snippets.slice(0,150))keywordSnippets.push({source,snippet:snippet.replace(/\s+/g,' ').slice(0,500)});
}
scan(root.text,ROOT);
for(const url of assets){
  const res=await fetchText(url);
  assetResults.push({url,status:res.status,ok:res.ok,contentType:res.contentType,size:res.text.length});
  if(res.ok&&res.text.length<15_000_000)scan(res.text,url);
}

const normalizedUrls=unique(discoveredUrls.map(x=>x.url));
const candidateEndpoints=unique([
  ...normalizedUrls.filter(u=>/MapServer|FeatureServer|geoserver|wfs|ows|plan/i.test(u)),
  ...relativeCandidates.map(x=>x.absolute).filter(u=>/MapServer|FeatureServer|geoserver|wfs|ows|api|plan/i.test(u))
]).slice(0,200);

const probes=[];
for(const endpoint of candidateEndpoints.slice(0,80)){
  try{
    const res=await fetchText(endpoint);
    probes.push({url:endpoint,status:res.status,ok:res.ok,contentType:res.contentType,size:res.text.length,preview:res.text.slice(0,300).replace(/\s+/g,' ')});
  }catch(error){probes.push({url:endpoint,error:String(error)});}
}

const result={
  version:DATE,
  placeId:PLACE_ID,
  coordinateMaxBatch:maxBatch,
  root:{url:ROOT,status:root.status,contentType:root.contentType,size:root.text.length},
  assets:assetResults,
  discoveredUrls:[...new Map(discoveredUrls.map(x=>[x.url,x])).values()],
  relativeCandidates:[...new Map(relativeCandidates.map(x=>[x.absolute||x.value,x])).values()],
  candidateEndpoints,
  probes,
  keywordSnippets:keywordSnippets.slice(0,500),
  nextAction:'Identify the public endpoint/layer used by Oslo Planinnsyn for adopted regulation-plan geometry, then query the current Regjeringskvartalet plan by plan number/name and compare its area with the stale OSM construction polygon.'
};
writeJson(`${OUT}/discovery.json`,result);
writeFileSync(`${OUT}/README.md`,`# Regjeringskvartalet Planinnsyn endpoint discovery\n\nDate: ${DATE}\n\n- Planinnsyn root status: ${root.status}\n- JS/JSON assets inspected: ${assetResults.length}\n- candidate service endpoints discovered: ${candidateEndpoints.length}\n- endpoints probed: ${probes.length}\n- keyword snippets captured: ${keywordSnippets.length}\n\nNo canonical coordinate changed. See \`discovery.json\` for the public service candidates used by Oslo Planinnsyn.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,assetCount:assetResults.length,candidateEndpointCount:candidateEndpoints.length,probeCount:probes.length,successfulProbes:probes.filter(x=>x.ok).slice(0,30),topUrls:candidateEndpoints.slice(0,40)},null,2));
