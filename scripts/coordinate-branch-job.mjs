import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='regjeringskvartalet';
const CENTER={lat:59.9156,lon:10.7451};
const OUT='reports/oslo-coordinate-regjeringskvartalet-area-research-post-192';
const OVERPASS='https://overpass.kumi.systems/api/interpreter';
const OFFICIAL='https://www.regjeringen.no/no/tema/plan-bygg-og-eiendom/regjeringskvartalet/id669703/';
const PLAN='https://www.regjeringen.no/no/dokumenter/vedtak-av-statlig-reguleringsplan-for-nytt-regjeringskvartal/id2538263/';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`);
const rad=x=>x*Math.PI/180;
const dist=(a,b,c,d)=>{const R=6371000,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));};
const area=g=>{if(!g||g.length<3)return 0;const lat0=g.reduce((s,p)=>s+p.lat,0)/g.length,mx=111320*Math.cos(rad(lat0)),my=110540;let s=0;for(let i=0;i<g.length;i++){const a=g[i],b=g[(i+1)%g.length];s+=(a.lon*mx)*(b.lat*my)-(b.lon*mx)*(a.lat*my);}return Math.abs(s)/2;};
async function text(url,opts={}){const r=await fetch(url,{...opts,headers:{'user-agent':'History-Go coordinate research/1.0',...(opts.headers||{})}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}`);return t;}
async function json(url,opts={}){return JSON.parse(await text(url,opts));}

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==192)throw new Error(`Expected coordinate max batch 192, got ${maxBatch}`);
const place=readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source'||place.locatorType!=='institutional_area')throw new Error('Unexpected Regjeringskvartalet canonical state');
const evidence=readJson('data/coordinate-evidence/oslo/politikk/regjeringskvartalet.json');
if(evidence.placeId!==PLACE_ID||evidence.coordinateDecision!=='needs_geometry')throw new Error('Unexpected Regjeringskvartalet evidence state');

const officialHtml=await text(OFFICIAL), planHtml=await text(PLAN);
const sourceChecks={officialMentions:/Regjeringskvartalet/i.test(officialHtml),officialBetween:/Akersgata/i.test(officialHtml)&&/Møllergata/i.test(officialHtml),planMentions:/Regjeringskvartalet/i.test(planHtml),planBounds:/Akersgata/i.test(planHtml)&&/Møllergata/i.test(planHtml)&&/Trefoldighetskirken/i.test(planHtml)};
if(!sourceChecks.officialMentions||!sourceChecks.planMentions)throw new Error(`Official identity checks failed: ${JSON.stringify(sourceChecks)}`);

const q=`[out:json][timeout:60];(nwr["name"="Regjeringskvartalet"](around:1200,${CENTER.lat},${CENTER.lon});nwr["name:en"~"Government (Quarter|Building Complex)",i](around:1200,${CENTER.lat},${CENTER.lon});nwr["office"="government"](around:700,${CENTER.lat},${CENTER.lon});nwr["government"](around:700,${CENTER.lat},${CENTER.lon});nwr["landuse"="civic_admin"](around:700,${CENTER.lat},${CENTER.lon}););out tags center geom;`;
const raw=await text(OVERPASS,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:q}).toString()});
writeFileSync(`${OUT}/overpass-raw.json`,raw);
const osm=JSON.parse(raw);
const objects=(osm.elements||[]).map(e=>{const g=(e.geometry||[]).map(p=>({lat:Number(p.lat),lon:Number(p.lon)}));const c=e.center?{lat:Number(e.center.lat),lon:Number(e.center.lon)}:(Number.isFinite(Number(e.lat))?{lat:Number(e.lat),lon:Number(e.lon)}:g.length?{lat:g.reduce((s,p)=>s+p.lat,0)/g.length,lon:g.reduce((s,p)=>s+p.lon,0)/g.length}:null);return{type:e.type,id:Number(e.id),sourceObjectId:`osm-${e.type}:${e.id}`,tags:e.tags||{},center:c,distanceM:c?Number(dist(CENTER.lat,CENTER.lon,c.lat,c.lon).toFixed(2)):null,geometryPointCount:g.length,approxAreaM2:g.length>=3?Math.round(area(g)):null,geometry:g};}).filter(o=>o.center);
const exactNamed=objects.filter(o=>o.tags.name==='Regjeringskvartalet'||/government (quarter|building complex)/i.test(o.tags['name:en']||''));
const exactNamedAreas=exactNamed.filter(o=>o.geometryPointCount>=3);
const governmentAreas=objects.filter(o=>o.geometryPointCount>=3&&(o.tags.office==='government'||o.tags.landuse==='civic_admin'||o.tags.government));

const nq=[];
for(const query of ['Regjeringskvartalet Oslo','Government Quarter Oslo','Government Building Complex Oslo']){const u='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',polygon_geojson:'1',limit:'20',q:query}).toString();const r=await json(u,{headers:{'accept-language':'nb,en'}});nq.push({query,results:r.map(x=>({osm_type:x.osm_type,osm_id:x.osm_id,category:x.category,type:x.type,display_name:x.display_name,lat:Number(x.lat),lon:Number(x.lon),geojsonType:x.geojson?.type||null,geojson:x.geojson||null,distanceM:Number(dist(CENTER.lat,CENTER.lon,Number(x.lat),Number(x.lon)).toFixed(2))}))});}
writeJson(`${OUT}/nominatim.json`,nq);
const namedNominatim=nq.flatMap(x=>x.results.map(r=>({query:x.query,...r}))).filter(r=>/Regjeringskvartalet|Government (Quarter|Building Complex)/i.test(r.display_name||''));
const polygonNominatim=namedNominatim.filter(r=>['Polygon','MultiPolygon'].includes(r.geojsonType));

let decision='needs_official_plan_geometry';
if(exactNamedAreas.length===1)decision=`candidate_exact_named_osm_area:${exactNamedAreas[0].sourceObjectId}`;
else if(polygonNominatim.length===1)decision=`candidate_exact_named_nominatim_area:osm-${polygonNominatim[0].osm_type}:${polygonNominatim[0].osm_id}`;
else if(exactNamed.length===1)decision=`named_point_or_line_only:${exactNamed[0].sourceObjectId}; still needs official plan-area geometry`;

const summary={version:DATE,placeId:PLACE_ID,maxBatch,canonical:{lat:place.lat,lon:place.lon,coordStatus:place.coordStatus},sourceChecks,officialSources:{official:OFFICIAL,plan:PLAN},exactNamed,exactNamedAreas,governmentAreas,nominatim:nq,namedNominatim,polygonNominatim,decision,notes:['Individual government buildings are contextual candidates only and cannot represent the entire complex.','If no exact combined area exists in OSM/Nominatim, the next pass must resolve the official state regulation-plan boundary.']};
writeJson(`${OUT}/summary.json`,summary);
writeFileSync(`${OUT}/README.md`,`# Regjeringskvartalet combined-area research\n\nDate: ${DATE}\n\n- exact named OSM objects: ${exactNamed.length}\n- exact named OSM areas: ${exactNamedAreas.length}\n- government-area candidates: ${governmentAreas.length}\n- named Nominatim hits: ${namedNominatim.length}\n- named Nominatim polygons: ${polygonNominatim.length}\n\nDecision: **${decision}**\n\nNo canonical coordinate changed. Single buildings are not accepted as proxies for the whole Regjeringskvartalet.\n`);
console.log(JSON.stringify({placeId:PLACE_ID,exactNamedCount:exactNamed.length,exactNamedAreaCount:exactNamedAreas.length,governmentAreaCount:governmentAreas.length,namedNominatimCount:namedNominatim.length,polygonNominatimCount:polygonNominatim.length,exactNamed:exactNamed.map(o=>({sourceObjectId:o.sourceObjectId,tags:o.tags,center:o.center,pointCount:o.geometryPointCount,area:o.approxAreaM2})),decision},null,2));
