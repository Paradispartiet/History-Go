import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const PLANID='202020172';
const PLANNAVN='S-5100';
const OUT='reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193';
const ENDPOINT='https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const FORMAT='application/json; subtype=geojson; charset=ISO-8859-1';
const TYPES=['ms:EnkeltPlan','ms:Omraadeplan','ms:RegTilleggTidl','ms:Utbyggingsomrade','ms:Kartutsnitt','ms:Eiendom'];
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
async function fetchText(url){const r=await fetch(url,{headers:{'user-agent':'History-Go coordinate research/1.0'}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}: ${t.slice(0,800)}`);return{url,contentType:r.headers.get('content-type'),text:t};}
function flattenCoords(geometry){const out=[];const visit=v=>{if(!Array.isArray(v))return;if(v.length>=2&&typeof v[0]==='number'&&typeof v[1]==='number'){out.push(v);return;}v.forEach(visit);};visit(geometry?.coordinates);return out;}
function bboxOf(geometry){const p=flattenCoords(geometry);if(!p.length)return null;return{minX:Math.min(...p.map(x=>x[0])),minY:Math.min(...p.map(x=>x[1])),maxX:Math.max(...p.map(x=>x[0])),maxY:Math.max(...p.map(x=>x[1]))};}
const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source')throw new Error('Unexpected Regjeringskvartalet state');
const baseResearch=readJson(`${OUT}/summary.json`);
const covering=(baseResearch.geometryContainsCenter||[]).filter(x=>x.properties?.PLANID===PLANID&&x.properties?.PLANNAVN===PLANNAVN);
if(covering.length!==1)throw new Error(`Expected one locked Omraadeplan covering feature ${PLANID}/${PLANNAVN}, got ${covering.length}`);

const typeResults=[];
for(const typeName of TYPES){
  const params=new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetFeature',version:'2.0.0',typeNames:typeName,outputFormat:FORMAT,count:'10000'});
  const response=await fetchText(`${ENDPOINT}?${params}`);
  if(!/^\s*\{/.test(response.text))throw new Error(`${typeName} did not return GeoJSON: ${response.text.slice(0,800)}`);
  const data=JSON.parse(response.text);
  writeFileSync(`${OUT}/${typeName.replace(':','_')}.geojson`,response.text,'utf8');
  const features=(data.features||[]).map(feature=>({
    featureId:feature.id||null,
    properties:feature.properties||{},
    geometryType:feature.geometry?.type||null,
    bbox:bboxOf(feature.geometry),
    coordinateCount:flattenCoords(feature.geometry).length
  }));
  const matches=features.filter(x=>x.properties?.PLANID===PLANID||x.properties?.PLANNAVN===PLANNAVN||JSON.stringify(x.properties).includes(PLANID)||JSON.stringify(x.properties).includes(PLANNAVN));
  typeResults.push({typeName,featureCount:features.length,propertyKeys:[...new Set(features.flatMap(x=>Object.keys(x.properties)))].sort(),matchCount:matches.length,matches});
}

const allMatches=typeResults.flatMap(result=>result.matches.map(match=>({typeName:result.typeName,...match})));
const titleSignals=[...new Set(allMatches.flatMap(x=>Object.entries(x.properties||{}).filter(([key])=>/navn|name|title|tittel|beskriv|formål|formaal|plan/i.test(key)).map(([key,value])=>`${key}=${value}`)))];
const currentCopyDates=[...new Set(allMatches.map(x=>x.properties?.KOPIDATO).filter(Boolean))];
const result={
  version:DATE,
  placeId:PLACE_ID,
  coordinateMaxBatch:maxBatch,
  lockedCandidate:{planId:PLANID,planName:PLANNAVN,omraadeplanFeature:covering[0]},
  exposedTypes:TYPES,
  typeResults,
  allMatches,
  titleSignals,
  currentCopyDates,
  decision:allMatches.length?'plan_id_resolved_across_oslo_planinnsyn_layers_requires_official_title_crosscheck':'plan_id_not_found_outside_omraadeplan',
  nextAction:'Use matching feature properties and the current Planinnsyn copy date to identify the adopted plan title/version. Only then decide whether the Omraadeplan polygon is the correct canonical institutional-area geometry.'
};
writeJson(`${OUT}/planid-crosscheck.json`,result);
writeFileSync(`${OUT}/README.md`,`# Regjeringskvartalet Oslo Planinnsyn WFS area research\n\nDate: ${DATE}\n\nLocked candidate covering the canonical center:\n- PLANID: ${PLANID}\n- PLANNAVN: ${PLANNAVN}\n\nCrosschecked exposed WFS layers: ${TYPES.length}\nMatching features across layers: ${allMatches.length}\nCurrent copy dates: ${currentCopyDates.join(', ')||'none'}\n\nDecision: **${result.decision}**\n\nNo canonical coordinate changed.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,planId:PLANID,planName:PLANNAVN,typeResults:typeResults.map(x=>({typeName:x.typeName,featureCount:x.featureCount,propertyKeys:x.propertyKeys,matchCount:x.matchCount,matches:x.matches})),titleSignals,currentCopyDates,decision:result.decision},null,2));
