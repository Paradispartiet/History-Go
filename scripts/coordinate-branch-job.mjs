import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='grini_fangeleir';
const CENTER={lat:59.9565,lon:10.5909};
const OUT='reports/akershus-coordinate-grini-camp-geometry-research-post-192';
const OVERPASS='https://overpass.kumi.systems/api/interpreter';
mkdirSync(OUT,{recursive:true});
const readJson=(p)=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`);
const rad=(x)=>x*Math.PI/180;
const dist=(a,b,c,d)=>{const R=6371000,x=rad(c-a),y=rad(d-b);const q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));};
const area=(g)=>{if(!g||g.length<3)return 0;const lat0=g.reduce((s,p)=>s+p.lat,0)/g.length,mx=111320*Math.cos(rad(lat0)),my=110540;let s=0;for(let i=0;i<g.length;i++){const a=g[i],b=g[(i+1)%g.length];s+=(a.lon*mx)*(b.lat*my)-(b.lon*mx)*(a.lat*my);}return Math.abs(s)/2;};
async function text(url,opts={}){const r=await fetch(url,{...opts,headers:{'user-agent':'History-Go coordinate research/1.0',...(opts.headers||{})}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}`);return t;}
async function json(url,opts={}){return JSON.parse(await text(url,opts));}

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==192)throw new Error(`Expected coordinate max batch 192, got ${maxBatch}`);
const place=readJson('data/places/historie/akershus/grini_fangeleir.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source'||place.coordType!=='historical_camp_area')throw new Error('Unexpected Grini canonical state');
const evidence=readJson('data/coordinate-evidence/akershus/baerum/grini_fangeleir.json');
if(evidence.placeId!==PLACE_ID||evidence.coordinateDecision!=='needs_geometry')throw new Error('Unexpected Grini evidence state');

const sources=[
  ['baerum','https://www.baerum.kommune.no/tjenester/kultur-idrett-og-fritid/kunst-og-kultur/rik-pa-historie/6.-forsvar-og-krigsminner'],
  ['mia','https://mia.no/grinimuseet/om-grini-fangeleir'],
  ['museum','https://mia.no/grinimuseet/finn-oss'],
  ['fanger','https://www.fanger.no/prisoncamps/672']
];
const sourceChecks={};
for(const [key,url] of sources){const html=await text(url);sourceChecks[key]={url,mentionsGrini:/Grini/i.test(html),mentionsIla:/Ila/i.test(html),mentionsBarracks:/brakk|barrack/i.test(html)};}
if(!sourceChecks.baerum.mentionsGrini||!sourceChecks.mia.mentionsGrini)throw new Error('Official identity sources no longer support Grini');

const q=`[out:json][timeout:75];(nwr["name"~"Grini|Ila",i](around:1800,${CENTER.lat},${CENTER.lon});nwr["historic"](around:1800,${CENTER.lat},${CENTER.lon});nwr["memorial"](around:1800,${CENTER.lat},${CENTER.lon});nwr["tourism"="museum"](around:1800,${CENTER.lat},${CENTER.lon});nwr["amenity"="prison"](around:1800,${CENTER.lat},${CENTER.lon});nwr["landuse"="prison"](around:1800,${CENTER.lat},${CENTER.lon}););out tags center geom;`;
const raw=await text(OVERPASS,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:q}).toString()});
writeFileSync(`${OUT}/overpass-raw.json`,raw);
const osm=JSON.parse(raw);
const objects=(osm.elements||[]).map(e=>{const g=(e.geometry||[]).map(p=>({lat:Number(p.lat),lon:Number(p.lon)}));const c=e.center?{lat:Number(e.center.lat),lon:Number(e.center.lon)}:(Number.isFinite(Number(e.lat))?{lat:Number(e.lat),lon:Number(e.lon)}:g.length?{lat:g.reduce((s,p)=>s+p.lat,0)/g.length,lon:g.reduce((s,p)=>s+p.lon,0)/g.length}:null);return{type:e.type,id:Number(e.id),sourceObjectId:`osm-${e.type}:${e.id}`,tags:e.tags||{},center:c,distanceM:c?Number(dist(CENTER.lat,CENTER.lon,c.lat,c.lon).toFixed(2)):null,geometryPointCount:g.length,approxAreaM2:g.length>=3?Math.round(area(g)):null,geometry:g};}).filter(o=>o.center);
const identityObjects=objects.filter(o=>/grini\s*fangeleir|polizeihäftlingslager\s*grini/i.test(`${o.tags.name||''} ${o.tags.alt_name||''} ${o.tags.old_name||''} ${o.tags.description||''}`));
const prisonAreas=objects.filter(o=>(o.tags.amenity==='prison'||o.tags.landuse==='prison')&&o.geometryPointCount>=3);
const museums=objects.filter(o=>o.tags.tourism==='museum');

const nq=[];
for(const query of ['Grini fangeleir Bærum','Grini prison camp Bærum','Grinimuseet Ila Bærum']){const u='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',polygon_geojson:'1',limit:'20',q:query}).toString();const r=await json(u,{headers:{'accept-language':'nb,en'}});nq.push({query,results:r.map(x=>({osm_type:x.osm_type,osm_id:x.osm_id,category:x.category,type:x.type,display_name:x.display_name,lat:Number(x.lat),lon:Number(x.lon),geojsonType:x.geojson?.type||null,geojson:x.geojson||null,distanceM:Number(dist(CENTER.lat,CENTER.lon,Number(x.lat),Number(x.lon)).toFixed(2))}))});}
writeJson(`${OUT}/nominatim.json`,nq);
const namedNominatim=nq.flatMap(x=>x.results.map(r=>({query:x.query,...r}))).filter(r=>/grini/i.test(r.display_name||''));

const exactHistorical=identityObjects.filter(o=>o.geometryPointCount>=3&&/(camp|concentration|prison|memorial|historic)/i.test(`${o.tags.historic||''} ${o.tags.site||''} ${o.tags.place||''} ${o.tags.description||''}`));
let decision='keep_needs_source';
if(exactHistorical.length===1)decision=`candidate_exact_historical_geometry:${exactHistorical[0].sourceObjectId}`;
else if(identityObjects.length===1&&identityObjects[0].geometryPointCount>=3)decision=`candidate_named_geometry_requires_type_check:${identityObjects[0].sourceObjectId}`;
else if(prisonAreas.length===1)decision=`current_prison_geometry_only:${prisonAreas[0].sourceObjectId}; do not equate current prison boundary with wartime camp without historical crosswalk`;

const summary={version:DATE,placeId:PLACE_ID,maxBatch,canonical:{lat:place.lat,lon:place.lon,coordStatus:place.coordStatus,sourceObjectId:place.sourceObjectId},sourceChecks,identityObjects,exactHistorical,prisonAreas,museums,nominatim:nq,namedNominatim,decision,notes:['Current museum address is identity context only.','Current Ila prison geometry cannot be promoted as wartime camp geometry without an explicit historical crosswalk.','A production pass requires exact historical geometry or a documented historical area-anchor model.']};
writeJson(`${OUT}/summary.json`,summary);
writeFileSync(`${OUT}/README.md`,`# Grini fangeleir geometry research\n\nDate: ${DATE}\n\n- exact OSM Grini camp identity objects: ${identityObjects.length}\n- exact historical polygon candidates: ${exactHistorical.length}\n- current prison area candidates: ${prisonAreas.length}\n- museum objects: ${museums.length}\n- named Nominatim hits: ${namedNominatim.length}\n\nDecision: **${decision}**\n\nNo canonical coordinate changed. The current prison or museum is not automatically treated as the historical camp area.\n`);
console.log(JSON.stringify({placeId:PLACE_ID,identityObjectCount:identityObjects.length,exactHistoricalCount:exactHistorical.length,prisonAreaCount:prisonAreas.length,museumCount:museums.length,namedNominatimCount:namedNominatim.length,identityObjects:identityObjects.map(o=>({sourceObjectId:o.sourceObjectId,name:o.tags.name||null,tags:o.tags,center:o.center,area:o.approxAreaM2})),prisonAreas:prisonAreas.map(o=>({sourceObjectId:o.sourceObjectId,name:o.tags.name||null,center:o.center,area:o.approxAreaM2})),decision},null,2));
