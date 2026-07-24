import { readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const OUT='reports/oslo-coordinate-regjeringskvartalet-planinnsyn-discovery-post-193';
const ENDPOINT='https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const TYPE='ms:Omraadeplan';
const FORMAT='application/json; subtype=geojson; charset=ISO-8859-1';
const CENTER={lat:59.9156,lon:10.7451};
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
async function fetchText(url){const r=await fetch(url,{headers:{'user-agent':'History-Go coordinate research/1.0'}});const t=await r.text();return{url,status:r.status,ok:r.ok,contentType:r.headers.get('content-type'),text:t};}
const rad=x=>x*Math.PI/180;
const dist=(a,b,c,d)=>{const R=6371000,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));};
function flattenCoords(geometry){const out=[];const visit=v=>{if(!Array.isArray(v))return;if(v.length>=2&&typeof v[0]==='number'&&typeof v[1]==='number'){out.push(v);return;}v.forEach(visit);};visit(geometry?.coordinates);return out;}
function bboxOf(geometry){const p=flattenCoords(geometry);if(!p.length)return null;return{minLon:Math.min(...p.map(x=>x[0])),minLat:Math.min(...p.map(x=>x[1])),maxLon:Math.max(...p.map(x=>x[0])),maxLat:Math.max(...p.map(x=>x[1]))};}
function bboxContains(b,lon,lat){return b&&lon>=b.minLon&&lon<=b.maxLon&&lat>=b.minLat&&lat<=b.maxLat;}
function approximateCenter(geometry){const p=flattenCoords(geometry);if(!p.length)return null;return{lon:p.reduce((s,x)=>s+x[0],0)/p.length,lat:p.reduce((s,x)=>s+x[1],0)/p.length};}

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source')throw new Error('Unexpected Regjeringskvartalet state');
const vector=readJson(`${OUT}/regtillegg-vector-discovery.json`);
if(!vector.featureTypes?.includes(TYPE))throw new Error('Omraadeplan feature type missing from merged discovery');

const attempts=[
  {label:'lonlat_bbox',bbox:'10.735,59.908,10.752,59.922,EPSG:4326'},
  {label:'latlon_bbox',bbox:'59.908,10.735,59.922,10.752,EPSG:4326'},
  {label:'all_features',bbox:null}
];
const results=[];
for(const attempt of attempts){
  const params=new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetFeature',version:'2.0.0',typeNames:TYPE,outputFormat:FORMAT,srsName:'EPSG:4326',count:attempt.bbox? '500':'10000'});
  if(attempt.bbox)params.set('bbox',attempt.bbox);
  const url=`${ENDPOINT}?${params}`;
  const r=await fetchText(url);
  let parsed=null,error=null;
  if(r.ok&&/^\s*\{/.test(r.text)){try{parsed=JSON.parse(r.text);}catch(e){error=String(e);}}
  results.push({label:attempt.label,url,status:r.status,ok:r.ok,contentType:r.contentType,size:r.text.length,preview:r.text.slice(0,1000),error,featureCount:parsed?.features?.length??null,parsed});
  if(r.text.length<30_000_000)writeFileSync(`${OUT}/omraadeplan-${attempt.label}.txt`,r.text,'utf8');
}

const features=[];
const seen=new Set();
for(const result of results){
  for(const feature of result.parsed?.features||[]){
    const key=feature.id||JSON.stringify([feature.properties,feature.geometry]);
    if(seen.has(key))continue;seen.add(key);features.push(feature);
  }
}
const analyzed=features.map(feature=>{
  const properties=feature.properties||{};
  const text=JSON.stringify(properties);
  const bbox=bboxOf(feature.geometry);
  const center=approximateCenter(feature.geometry);
  return{featureId:feature.id||null,properties,geometryType:feature.geometry?.type||null,bbox,containsLegacyCenter:bboxContains(bbox,CENTER.lon,CENTER.lat),approxCenter:center,distanceFromLegacyCenterM:center?Number(dist(CENTER.lat,CENTER.lon,center.lat,center.lon).toFixed(2)):null,regjeringskvartaletText:/regjeringskvartalet/i.test(text)};
});
const directMatches=analyzed.filter(x=>x.regjeringskvartaletText);
const centerCandidates=analyzed.filter(x=>x.containsLegacyCenter).sort((a,b)=>(a.distanceFromLegacyCenterM??Infinity)-(b.distanceFromLegacyCenterM??Infinity));
const propertyKeys=[...new Set(analyzed.flatMap(x=>Object.keys(x.properties||{})))].sort();
const summary={version:DATE,placeId:PLACE_ID,coordinateMaxBatch:maxBatch,attempts:results.map(({parsed,...rest})=>rest),uniqueFeatureCount:features.length,propertyKeys,directRegjeringskvartaletMatches:directMatches,featuresContainingLegacyCenter:centerCandidates,allFeatureSummaries:analyzed,nextAction:directMatches.length===1?'Resolve the exact feature geometry and plan metadata against current official plan version before production.':centerCandidates.length===1?'Inspect the sole plan feature covering the canonical Regjeringskvartalet center and resolve its plan identifier/title against official sources.':'Use returned property keys to query the adopted plan number explicitly.'};
writeJson(`${OUT}/omraadeplan-query-summary.json`,summary);
console.log(JSON.stringify({placeId:PLACE_ID,attempts:summary.attempts,uniqueFeatureCount:features.length,propertyKeys,directMatchCount:directMatches.length,directMatches,centerCandidateCount:centerCandidates.length,centerCandidates:centerCandidates.slice(0,20),nextAction:summary.nextAction},null,2));
