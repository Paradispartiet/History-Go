import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='tjernsmyr_salamanderlokalitet';
const CENTER={lat:59.911,lon:10.62714};
const OUT='reports/akershus-coordinate-tjernsmyr-wetland-research-post-192';
const OVERPASS='https://overpass.kumi.systems/api/interpreter';
const SVV='https://www.vegvesen.no/vegprosjekter/europaveg/e18vestkorridoren/nyhetsarkiv/undersokte-salamanderliv-ved-tjernsmyr/';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`);
const rad=x=>x*Math.PI/180;
const dist=(a,b,c,d)=>{const R=6371000,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));};
const area=g=>{if(!g||g.length<3)return 0;const lat0=g.reduce((s,p)=>s+p.lat,0)/g.length,mx=111320*Math.cos(rad(lat0)),my=110540;let s=0;for(let i=0;i<g.length;i++){const a=g[i],b=g[(i+1)%g.length];s+=(a.lon*mx)*(b.lat*my)-(b.lon*mx)*(a.lat*my);}return Math.abs(s)/2;};
const pointInPolygon=(lat,lon,g)=>{let inside=false;for(let i=0,j=g.length-1;i<g.length;j=i++){const xi=g[i].lon,yi=g[i].lat,xj=g[j].lon,yj=g[j].lat;const hit=((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/((yj-yi)||1e-12)+xi);if(hit)inside=!inside;}return inside;};
async function text(url,opts={}){const r=await fetch(url,{...opts,headers:{'user-agent':'History-Go coordinate research/1.0',...(opts.headers||{})}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}`);return t;}
async function json(url,opts={}){return JSON.parse(await text(url,opts));}

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==192)throw new Error(`Expected coordinate max batch 192, got ${maxBatch}`);
const source=readJson('data/places/natur/oslo/places_oslo_natur_salamanderdammer.json');
const matches=source.filter(x=>x?.id===PLACE_ID);
if(matches.length!==1||matches[0].coordStatus!=='needs_source')throw new Error('Unexpected Tjernsmyr source state');
const place=matches[0];
const evidence=readJson('data/coordinate-evidence/oslo/natur/tjernsmyr_salamanderlokalitet.json');
if(evidence.placeId!==PLACE_ID||evidence.coordinateDecision!=='needs_geometry')throw new Error('Unexpected Tjernsmyr evidence state');

const svvHtml=await text(SVV);
const sourceChecks={mentionsTjernsmyr:/Tjernsmyr/i.test(svvHtml),mentionsBaerum:/Bærum|Baerum/i.test(svvHtml),mentionsBothSpecies:/småsalamander|småsalamander/i.test(svvHtml)&&/storsalamander/i.test(svvHtml),mentionsLysaker:/Lysaker/i.test(svvHtml)};
if(!sourceChecks.mentionsTjernsmyr||!sourceChecks.mentionsBaerum)throw new Error(`SVV identity checks failed: ${JSON.stringify(sourceChecks)}`);

const q=`[out:json][timeout:60];(nwr["name"~"Tjernsmyr",i](around:1500,${CENTER.lat},${CENTER.lon});way["natural"="wetland"](around:1200,${CENTER.lat},${CENTER.lon});relation["natural"="wetland"](around:1200,${CENTER.lat},${CENTER.lon});way["natural"="water"](around:1200,${CENTER.lat},${CENTER.lon});relation["natural"="water"](around:1200,${CENTER.lat},${CENTER.lon});way["water"~"pond|marsh|wetland",i](around:1200,${CENTER.lat},${CENTER.lon}););out tags center geom;`;
const raw=await text(OVERPASS,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:q}).toString()});
writeFileSync(`${OUT}/overpass-raw.json`,raw);
const osm=JSON.parse(raw);
const objects=(osm.elements||[]).map(e=>{const g=(e.geometry||[]).map(p=>({lat:Number(p.lat),lon:Number(p.lon)}));const c=e.center?{lat:Number(e.center.lat),lon:Number(e.center.lon)}:(Number.isFinite(Number(e.lat))?{lat:Number(e.lat),lon:Number(e.lon)}:g.length?{lat:g.reduce((s,p)=>s+p.lat,0)/g.length,lon:g.reduce((s,p)=>s+p.lon,0)/g.length}:null);return{type:e.type,id:Number(e.id),sourceObjectId:`osm-${e.type}:${e.id}`,tags:e.tags||{},center:c,distanceM:c?Number(dist(CENTER.lat,CENTER.lon,c.lat,c.lon).toFixed(2)):null,geometryPointCount:g.length,approxAreaM2:g.length>=3?Math.round(area(g)):null,containsLegacy:g.length>=3?pointInPolygon(CENTER.lat,CENTER.lon,g):false,geometry:g};}).filter(o=>o.center);
const named=objects.filter(o=>/tjernsmyr/i.test(`${o.tags.name||''} ${o.tags.alt_name||''} ${o.tags.old_name||''}`));
const namedAreas=named.filter(o=>o.geometryPointCount>=3);
const wetlandAreas=objects.filter(o=>o.geometryPointCount>=3&&(o.tags.natural==='wetland'||o.tags.natural==='water'||/pond|marsh|wetland/i.test(o.tags.water||''))).sort((a,b)=>a.distanceM-b.distanceM);
const containing=wetlandAreas.filter(o=>o.containsLegacy);

const nq=[];
for(const query of ['Tjernsmyr Bærum','Tjernsmyr Lysaker','Tjernsmyr wetland Bærum']){const u='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',polygon_geojson:'1',limit:'20',q:query}).toString();const r=await json(u,{headers:{'accept-language':'nb,en'}});nq.push({query,results:r.map(x=>({osm_type:x.osm_type,osm_id:x.osm_id,category:x.category,type:x.type,display_name:x.display_name,lat:Number(x.lat),lon:Number(x.lon),geojsonType:x.geojson?.type||null,geojson:x.geojson||null,distanceM:Number(dist(CENTER.lat,CENTER.lon,Number(x.lat),Number(x.lon)).toFixed(2))}))});}
writeJson(`${OUT}/nominatim.json`,nq);
const namedNominatim=nq.flatMap(x=>x.results.map(r=>({query:x.query,...r}))).filter(r=>/Tjernsmyr/i.test(r.display_name||''));
const polygonNominatim=namedNominatim.filter(r=>['Polygon','MultiPolygon'].includes(r.geojsonType));

let decision='move_to_baerum_but_keep_needs_source';
if(namedAreas.length===1&&/wetland|water/.test(`${namedAreas[0].tags.natural||''} ${namedAreas[0].tags.water||''}`))decision=`candidate_exact_public_named_wetland:${namedAreas[0].sourceObjectId}`;
else if(polygonNominatim.length===1)decision=`candidate_named_nominatim_polygon:osm-${polygonNominatim[0].osm_type}:${polygonNominatim[0].osm_id}`;
else if(containing.length===1)decision=`candidate_unnamed_wetland_requires_identity_crosscheck:${containing[0].sourceObjectId}`;

const summary={version:DATE,placeId:PLACE_ID,maxBatch,canonical:{lat:place.lat,lon:place.lon,coordStatus:place.coordStatus,sourceFile:'data/places/natur/oslo/places_oslo_natur_salamanderdammer.json'},sourceChecks,officialSource:SVV,named,namedAreas,wetlandAreas,containing,nominatim:nq,namedNominatim,polygonNominatim,decision,privacyModel:'Only a publicly mapped named wetland/area may become the canonical locator. Exact salamander captures, traps, nests or individual observations are not collected or published.'};
writeJson(`${OUT}/summary.json`,summary);
writeFileSync(`${OUT}/README.md`,`# Tjernsmyr public wetland geometry research\n\nDate: ${DATE}\n\n- public OSM objects named Tjernsmyr: ${named.length}\n- named Tjernsmyr area geometries: ${namedAreas.length}\n- wetland/water areas within search radius: ${wetlandAreas.length}\n- wetland areas containing legacy anchor: ${containing.length}\n- named Nominatim hits: ${namedNominatim.length}\n- named Nominatim polygons: ${polygonNominatim.length}\n\nDecision: **${decision}**\n\nThe record belongs in Bærum/Akershus. Only a public area geometry may be used; precise salamander observation locations are out of scope.\n`);
console.log(JSON.stringify({placeId:PLACE_ID,namedCount:named.length,namedAreaCount:namedAreas.length,wetlandAreaCount:wetlandAreas.length,containingCount:containing.length,namedNominatimCount:namedNominatim.length,polygonNominatimCount:polygonNominatim.length,named:named.map(o=>({sourceObjectId:o.sourceObjectId,tags:o.tags,center:o.center,area:o.approxAreaM2})),nearestWetlands:wetlandAreas.slice(0,12).map(o=>({sourceObjectId:o.sourceObjectId,tags:o.tags,center:o.center,distanceM:o.distanceM,area:o.approxAreaM2,containsLegacy:o.containsLegacy})),decision},null,2));
