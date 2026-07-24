import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='ostensjovannet_sivbelte';
const CENTER={lat:59.8859,lon:10.8247};
const OUT='reports/oslo-coordinate-ostensjovannet-reedbelt-research-post-193';
const OVERPASS='https://overpass.kumi.systems/api/interpreter';
const NATURBASE='https://faktaark.naturbase.no/?id=VV00000972';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
const rad=x=>x*Math.PI/180;
const dist=(a,b,c,d)=>{const R=6371000,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));};
const area=g=>{if(!g||g.length<3)return 0;const pts=g[0].lat===g.at(-1).lat&&g[0].lon===g.at(-1).lon?g.slice(0,-1):g;const lat0=pts.reduce((s,p)=>s+p.lat,0)/pts.length,mx=111320*Math.cos(rad(lat0)),my=110540;let sum=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];sum+=(a.lon*mx)*(b.lat*my)-(b.lon*mx)*(a.lat*my);}return Math.abs(sum)/2;};
const pointInPolygon=(lat,lon,g)=>{let inside=false;for(let i=0,j=g.length-1;i<g.length;j=i++){const xi=g[i].lon,yi=g[i].lat,xj=g[j].lon,yj=g[j].lat;const hit=((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/((yj-yi)||1e-12)+xi);if(hit)inside=!inside;}return inside;};
async function text(url,opts={}){const r=await fetch(url,{...opts,headers:{'user-agent':'History-Go coordinate research/1.0',...(opts.headers||{})}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}`);return t;}
async function json(url,opts={}){return JSON.parse(await text(url,opts));}

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const places=readJson('data/places/natur/oslo/places_oslo_natur_ostensjovannet.json');
const matches=places.filter(x=>x?.id===PLACE_ID);
if(matches.length!==1||matches[0].coordStatus!=='needs_source')throw new Error('Unexpected Østensjøvannet sivbelte place state');
const place=matches[0];
const evidence=readJson('data/coordinate-evidence/oslo/natur/ostensjovannet_sivbelte.json');
if(evidence.placeId!==PLACE_ID||evidence.coordinateDecision!=='needs_geometry')throw new Error('Unexpected sivbelte evidence state');

const query=`[out:json][timeout:60];(way["natural"="wetland"](around:1800,${CENTER.lat},${CENTER.lon});relation["natural"="wetland"](around:1800,${CENTER.lat},${CENTER.lon});way["wetland"~"reedbed|reeds|reed",i](around:1800,${CENTER.lat},${CENTER.lon});relation["wetland"~"reedbed|reeds|reed",i](around:1800,${CENTER.lat},${CENTER.lon});nwr["name"~"Østensjø|Ostensjo",i](around:1800,${CENTER.lat},${CENTER.lon}););out tags center geom;`;
const raw=await text(OVERPASS,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}).toString()});
writeFileSync(`${OUT}/overpass-raw.json`,raw,'utf8');
const osm=JSON.parse(raw);
const objects=(osm.elements||[]).map(e=>{const g=(e.geometry||[]).map(p=>({lat:Number(p.lat),lon:Number(p.lon)}));const c=e.center?{lat:Number(e.center.lat),lon:Number(e.center.lon)}:(Number.isFinite(Number(e.lat))?{lat:Number(e.lat),lon:Number(e.lon)}:g.length?{lat:g.reduce((s,p)=>s+p.lat,0)/g.length,lon:g.reduce((s,p)=>s+p.lon,0)/g.length}:null);return{type:e.type,id:Number(e.id),sourceObjectId:`osm-${e.type}:${e.id}`,tags:e.tags||{},center:c,distanceM:c?Number(dist(CENTER.lat,CENTER.lon,c.lat,c.lon).toFixed(2)):null,geometryPointCount:g.length,approxAreaM2:g.length>=3?Number(area(g).toFixed(2)):null,containsLegacy:g.length>=3?pointInPolygon(CENTER.lat,CENTER.lon,g):false,geometry:g};}).filter(o=>o.center);
const reedbeds=objects.filter(o=>o.geometryPointCount>=3&&/reedbed|reeds|reed/i.test(o.tags.wetland||''));
const allWetlands=objects.filter(o=>o.geometryPointCount>=3&&o.tags.natural==='wetland');
const containingReedbeds=reedbeds.filter(o=>o.containsLegacy);
const nearestReedbeds=[...reedbeds].sort((a,b)=>a.distanceM-b.distanceM);
const westSouthReedbeds=reedbeds.filter(o=>o.center.lat<59.889&&o.center.lon<10.829).sort((a,b)=>a.distanceM-b.distanceM);

const nq=[];
for(const q of ['Østensjøvannet sivbelte Oslo','Østensjøvannet reedbed Oslo','Østensjøvannet våtmark Oslo']){const u='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',polygon_geojson:'1',limit:'20',q}).toString();const r=await json(u,{headers:{'accept-language':'nb,en'}});nq.push({query:q,results:r.map(x=>({osm_type:x.osm_type,osm_id:x.osm_id,category:x.category,type:x.type,display_name:x.display_name,lat:Number(x.lat),lon:Number(x.lon),geojsonType:x.geojson?.type||null,distanceM:Number(dist(CENTER.lat,CENTER.lon,Number(x.lat),Number(x.lon)).toFixed(2))}))});}
writeJson(`${OUT}/nominatim.json`,nq);

let decision='keep_needs_source';
if(containingReedbeds.length===1)decision=`candidate_explicit_reedbed_contains_legacy:${containingReedbeds[0].sourceObjectId}`;
else if(westSouthReedbeds.length===1)decision=`candidate_explicit_west_south_reedbed_requires_scope_crosscheck:${westSouthReedbeds[0].sourceObjectId}`;
else if(reedbeds.length>0)decision=`multiple_explicit_reedbeds_require_scope_or_split:${reedbeds.map(x=>x.sourceObjectId).join(',')}`;

const summary={version:DATE,placeId:PLACE_ID,maxBatch,canonical:{lat:place.lat,lon:place.lon,coordStatus:place.coordStatus},parentSource:{url:NATURBASE,sourceObjectId:'miljodirektoratet-naturvern:VV00000972'},reedbeds,allWetlands,containingReedbeds,westSouthReedbeds,nearestReedbeds,nominatim:nq,decision,privacyModel:'Only public habitat polygons are evaluated. Individual species observations are not used.'};
writeJson(`${OUT}/summary.json`,summary);
writeFileSync(`${OUT}/README.md`,`# Østensjøvannet sivbelte explicit geometry research\n\nDate: ${DATE}\n\n- explicit OSM reedbed polygons: ${reedbeds.length}\n- all public wetland polygons in search radius: ${allWetlands.length}\n- reedbeds containing the legacy marker: ${containingReedbeds.length}\n- explicit west/southwest reedbed candidates: ${westSouthReedbeds.length}\n\nDecision: **${decision}**\n\nNo canonical coordinate changed. The parent nature-reserve polygon is not accepted as a substitute for a specific reedbelt geometry.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,reedbedCount:reedbeds.length,wetlandCount:allWetlands.length,containingReedbedCount:containingReedbeds.length,westSouthReedbedCount:westSouthReedbeds.length,reedbeds:nearestReedbeds.map(o=>({sourceObjectId:o.sourceObjectId,tags:o.tags,center:o.center,distanceM:o.distanceM,areaM2:o.approxAreaM2,containsLegacy:o.containsLegacy})),decision},null,2));
