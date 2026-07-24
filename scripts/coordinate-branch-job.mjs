import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const OUT='reports/oslo-coordinate-regjeringskvartalet-planinnsyn-discovery-post-193';
const BASE='https://od2.pbe.oslo.kommune.no/cgi-bin';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
async function fetchText(url){const r=await fetch(url,{headers:{'user-agent':'History-Go coordinate research/1.0'}});const t=await r.text();return{url,status:r.status,ok:r.ok,contentType:r.headers.get('content-type'),text:t};}
const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source')throw new Error('Unexpected Regjeringskvartalet state');
const discovery=readJson(`${OUT}/discovery.json`);
if(!JSON.stringify(discovery).includes('map=REGTILLEGG'))throw new Error('Planinnsyn discovery no longer contains REGTILLEGG MapServer evidence');

const probes=[
  `${BASE}/wms?map=REGTILLEGG&service=WMS&request=GetCapabilities&version=1.3.0`,
  `${BASE}/wfs?map=REGTILLEGG&service=WFS&request=GetCapabilities&version=2.0.0`,
  `${BASE}/wfs?map=REGTILLEGG&service=WFS&request=GetCapabilities&version=1.1.0`,
  `${BASE}/wms?map=REGTILLEGG&service=WFS&request=GetCapabilities&version=2.0.0`,
  `${BASE}/mapserv?map=REGTILLEGG&service=WFS&request=GetCapabilities&version=2.0.0`
];
const results=[];
for(const url of probes){
  try{
    const r=await fetchText(url);
    results.push({url,status:r.status,ok:r.ok,contentType:r.contentType,size:r.text.length,preview:r.text.slice(0,1000),text:r.text});
  }catch(error){results.push({url,error:String(error)});}
}
const serviceResults=results.map(r=>({url:r.url,status:r.status,ok:r.ok,contentType:r.contentType,size:r.size,preview:r.preview}));
writeJson(`${OUT}/regtillegg-service-probes.json`,serviceResults);
for(let i=0;i<results.length;i++)if(results[i].text)writeFileSync(`${OUT}/regtillegg-capabilities-${i}.xml`,results[i].text,'utf8');

const combined=results.map(r=>r.text||'').join('\n');
const featureTypes=[...combined.matchAll(/<(?:wfs:)?FeatureType>[\s\S]*?<(?:wfs:)?Name>([^<]+)<\/(?:wfs:)?Name>[\s\S]*?<\/(?:wfs:)?FeatureType>/gi)].map(m=>m[1].trim());
const wmsLayers=[...combined.matchAll(/<Layer[^>]*>[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<Title>([^<]+)<\/Title>/gi)].map(m=>({name:m[1].trim(),title:m[2].trim()}));
const relevantFeatures=[...new Set(featureTypes.filter(n=>/plan|reg|omraade|område/i.test(n)))];
const relevantLayers=[...new Map(wmsLayers.filter(x=>/plan|reg|omraade|område/i.test(`${x.name} ${x.title}`)).map(x=>[x.name,x])).values()];

const queryAttempts=[];
for(const typeName of relevantFeatures.slice(0,30)){
  const params=new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetFeature',version:'2.0.0',typeNames:typeName,outputFormat:'application/json',count:'10',bbox:'10.735,59.908,10.752,59.922,EPSG:4326'});
  const candidates=[`${BASE}/wfs?${params}`,`${BASE}/wms?${params}`];
  for(const url of candidates){
    try{const r=await fetchText(url);queryAttempts.push({typeName,url,status:r.status,ok:r.ok,contentType:r.contentType,size:r.text.length,preview:r.text.slice(0,1200),body:r.text});}catch(error){queryAttempts.push({typeName,url,error:String(error)});}
  }
}
writeJson(`${OUT}/regtillegg-query-attempts.json`,queryAttempts.map(x=>({...x,body:undefined})));
for(let i=0;i<queryAttempts.length;i++)if(queryAttempts[i].body&&queryAttempts[i].body.length<5_000_000)writeFileSync(`${OUT}/regtillegg-query-${i}.txt`,queryAttempts[i].body,'utf8');

const jsonFeatures=[];
for(const q of queryAttempts){
  if(!q.body||!/^\s*\{/.test(q.body))continue;
  try{const parsed=JSON.parse(q.body);for(const f of parsed.features||[])jsonFeatures.push({typeName:q.typeName,feature:f});}catch{}
}
const namedMatches=jsonFeatures.filter(x=>/regjeringskvartalet/i.test(JSON.stringify(x.feature.properties||{})));
const result={version:DATE,placeId:PLACE_ID,coordinateMaxBatch:maxBatch,serviceResults,featureTypes:[...new Set(featureTypes)],relevantFeatures,relevantLayers,queryAttemptCount:queryAttempts.length,jsonFeatureCount:jsonFeatures.length,namedRegjeringskvartaletMatches:namedMatches,nextAction:namedMatches.length?'Inspect exact returned plan feature geometry and plan metadata before production.':'If WFS exposes plan features but no named match in the center bbox, identify the adopted plan number from official sources and query that attribute explicitly.'};
writeJson(`${OUT}/regtillegg-vector-discovery.json`,result);
writeFileSync(`${OUT}/README.md`,`# Regjeringskvartalet Planinnsyn endpoint discovery\n\nDate: ${DATE}\n\n- REGTILLEGG service probes: ${serviceResults.length}\n- discovered WFS feature types: ${result.featureTypes.length}\n- plan-like feature types: ${relevantFeatures.length}\n- plan-like WMS layers: ${relevantLayers.length}\n- bounded GetFeature attempts: ${queryAttempts.length}\n- returned JSON features: ${jsonFeatures.length}\n- Regjeringskvartalet-named feature matches: ${namedMatches.length}\n\nNo canonical coordinate changed.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,services:serviceResults,featureTypeCount:result.featureTypes.length,relevantFeatures,relevantLayers,queryAttemptCount:queryAttempts.length,jsonFeatureCount:jsonFeatures.length,namedMatchCount:namedMatches.length,namedMatches:namedMatches.slice(0,10).map(x=>({typeName:x.typeName,properties:x.feature.properties,geometryType:x.feature.geometry?.type}))},null,2));
