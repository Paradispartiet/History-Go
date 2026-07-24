import { readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const OUT='reports/oslo-coordinate-regjeringskvartalet-planinnsyn-discovery-post-193';
const ENDPOINT='https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const TYPE='ms:Omraadeplan';
const FORMAT='application/json; subtype=geojson; charset=ISO-8859-1';
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
async function fetchText(url){const r=await fetch(url,{headers:{'user-agent':'History-Go coordinate research/1.0'}});const t=await r.text();return{url,status:r.status,ok:r.ok,contentType:r.headers.get('content-type'),text:t};}
function flattenCoords(geometry){const out=[];const visit=v=>{if(!Array.isArray(v))return;if(v.length>=2&&typeof v[0]==='number'&&typeof v[1]==='number'){out.push(v);return;}v.forEach(visit);};visit(geometry?.coordinates);return out;}
function bboxOf(geometry){const p=flattenCoords(geometry);if(!p.length)return null;return{minX:Math.min(...p.map(x=>x[0])),minY:Math.min(...p.map(x=>x[1])),maxX:Math.max(...p.map(x=>x[0])),maxY:Math.max(...p.map(x=>x[1]))};}
const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source')throw new Error('Unexpected Regjeringskvartalet state');
const vector=readJson(`${OUT}/regtillegg-vector-discovery.json`);
if(!vector.featureTypes?.includes(TYPE))throw new Error('Omraadeplan WFS type missing');

const params=new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetFeature',version:'2.0.0',typeNames:TYPE,outputFormat:FORMAT,count:'10000'});
const response=await fetchText(`${ENDPOINT}?${params}`);
writeFileSync(`${OUT}/omraadeplan-native-response.txt`,response.text,'utf8');
if(!response.ok)throw new Error(`Native Omraadeplan GetFeature HTTP ${response.status}: ${response.text.slice(0,800)}`);
if(!/^\s*\{/.test(response.text))throw new Error(`Native Omraadeplan response is not JSON: ${response.text.slice(0,800)}`);
const data=JSON.parse(response.text);
const features=data.features||[];
const analyzed=features.map(feature=>({
  featureId:feature.id||null,
  properties:feature.properties||{},
  geometryType:feature.geometry?.type||null,
  bbox:bboxOf(feature.geometry),
  coordinateSample:flattenCoords(feature.geometry).slice(0,5)
}));
const propertyKeys=[...new Set(analyzed.flatMap(x=>Object.keys(x.properties)))].sort();
const textMatches=analyzed.filter(x=>/regjeringskvartalet|regjeringskvartal|government quarter/i.test(JSON.stringify(x.properties)));
const planLike=analyzed.filter(x=>/2017|2020|2025|statlig|regjering|s-?4\d{3}/i.test(JSON.stringify(x.properties)));
writeJson(`${OUT}/omraadeplan-native-summary.json`,{
  version:DATE,
  placeId:PLACE_ID,
  coordinateMaxBatch:maxBatch,
  endpoint:response.url,
  contentType:response.contentType,
  featureCount:features.length,
  propertyKeys,
  textMatches,
  planLike,
  allFeatures:analyzed,
  nextAction:textMatches.length===1?'Use the matching plan feature identifier and exact geometry, then crosscheck against the 2025 current plan version.':textMatches.length>1?'Resolve which matching feature is the adopted current Regjeringskvartalet plan area.':'Inspect plan-like attributes and identify the official plan number needed for an attribute-filtered WFS query.'
});
console.log(JSON.stringify({placeId:PLACE_ID,featureCount:features.length,propertyKeys,textMatchCount:textMatches.length,textMatches,planLikeCount:planLike.length,planLike:planLike.slice(0,30)},null,2));
