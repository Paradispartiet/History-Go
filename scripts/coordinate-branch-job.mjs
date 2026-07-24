import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const PLACE_ID='bygdoy_kongsgard_salamanderdam';
const CENTER={lat:59.91117,lon:10.68258};
const OUT='reports/oslo-coordinate-bygdoy-kongsgard-public-pond-research-post-193';
const SOURCE='https://www.naturarv.no/bygdoey-kongsgaard.371995-72064.html';
const OVERPASS='https://overpass.kumi.systems/api/interpreter';
mkdirSync(OUT,{recursive:true});
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');
const rad=x=>x*Math.PI/180;
const dist=(a,b,c,d)=>{const R=6371000,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));};
const area=g=>{if(!g||g.length<3)return 0;const pts=g[0].lat===g.at(-1).lat&&g[0].lon===g.at(-1).lon?g.slice(0,-1):g;const lat0=pts.reduce((s,p)=>s+p.lat,0)/pts.length,mx=111320*Math.cos(rad(lat0)),my=110540;let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=(a.lon*mx)*(b.lat*my)-(b.lon*mx)*(a.lat*my);}return Math.abs(s)/2;};
async function text(url,opts={}){const r=await fetch(url,{...opts,headers:{'user-agent':'History-Go coordinate research/1.0',...(opts.headers||{})}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}`);return t;}
async function json(url,opts={}){return JSON.parse(await text(url,opts));}

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==193)throw new Error(`Expected coordinate max batch 193, got ${maxBatch}`);
const place=readJson('data/places/natur/oslo/places_oslo_natur_salamanderdammer/bygdoy_kongsgard_salamanderdam.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source')throw new Error('Unexpected Bygdøy Kongsgård salamander place state');
const evidence=readJson('data/coordinate-evidence/oslo/natur/bygdoy_kongsgard_salamanderdam.json');
if(evidence.placeId!==PLACE_ID||evidence.coordinateDecision!=='needs_geometry')throw new Error('Unexpected coordinate evidence state');

const sourceHtml=await text(SOURCE);
const sourceChecks={mentionsDam:/Dam,?\s*Bygdøy\s*kongsgård/i.test(sourceHtml),area1800:/Areal:\s*1\s*800\s*m|Areal:\s*1800\s*m/i.test(sourceHtml.replace(/&nbsp;|&#160;/g,' ')),depth6:/Største\s*dybde:\s*6\s*m/i.test(sourceHtml.replace(/&nbsp;|&#160;/g,' ')),parkLandscape:/lysåpent\s*parklandskap/i.test(sourceHtml.replace(/<[^>]+>/g,' '))};
if(!sourceChecks.mentionsDam)throw new Error(`Norsk Naturarv source no longer identifies the Bygdøy Kongsgård pond: ${JSON.stringify(sourceChecks)}`);

const query=`[out:json][timeout:60];(way["natural"="water"](around:1800,${CENTER.lat},${CENTER.lon});relation["natural"="water"](around:1800,${CENTER.lat},${CENTER.lon});way["water"="pond"](around:1800,${CENTER.lat},${CENTER.lon});relation["water"="pond"](around:1800,${CENTER.lat},${CENTER.lon});nwr["name"~"Kongsgård|Kongsgaard|Bygdøy|Bygdo",i](around:1800,${CENTER.lat},${CENTER.lon}););out tags center geom;`;
const raw=await text(OVERPASS,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}).toString()});
writeFileSync(`${OUT}/overpass-raw.json`,raw,'utf8');
const osm=JSON.parse(raw);
const objects=(osm.elements||[]).map(e=>{const g=(e.geometry||[]).map(p=>({lat:Number(p.lat),lon:Number(p.lon)}));const c=e.center?{lat:Number(e.center.lat),lon:Number(e.center.lon)}:(Number.isFinite(Number(e.lat))?{lat:Number(e.lat),lon:Number(e.lon)}:g.length?{lat:g.reduce((s,p)=>s+p.lat,0)/g.length,lon:g.reduce((s,p)=>s+p.lon,0)/g.length}:null);return{type:e.type,id:Number(e.id),sourceObjectId:`osm-${e.type}:${e.id}`,tags:e.tags||{},center:c,distanceM:c?Number(dist(CENTER.lat,CENTER.lon,c.lat,c.lon).toFixed(2)):null,geometryPointCount:g.length,approxAreaM2:g.length>=3?Number(area(g).toFixed(2)):null,geometry:g};}).filter(o=>o.center);
const waterAreas=objects.filter(o=>o.geometryPointCount>=3&&(o.tags.natural==='water'||o.tags.water==='pond')).sort((a,b)=>a.distanceM-b.distanceM);
const sourceAreaCandidates=waterAreas.filter(o=>o.approxAreaM2>=1200&&o.approxAreaM2<=2400);
const tightAreaCandidates=waterAreas.filter(o=>o.approxAreaM2>=1500&&o.approxAreaM2<=2100);

const nq=[];
for(const q of ['Bygdøy Kongsgård dam Oslo','Bygdø Kongsgård pond Oslo','Bygdøy Kongsgård Oslo']){const u='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',polygon_geojson:'1',limit:'20',q}).toString();const r=await json(u,{headers:{'accept-language':'nb,en'}});nq.push({query:q,results:r.map(x=>({osm_type:x.osm_type,osm_id:x.osm_id,category:x.category,type:x.type,display_name:x.display_name,lat:Number(x.lat),lon:Number(x.lon),geojsonType:x.geojson?.type||null,distanceM:Number(dist(CENTER.lat,CENTER.lon,Number(x.lat),Number(x.lon)).toFixed(2))}))});}
writeJson(`${OUT}/nominatim.json`,nq);

let decision='keep_needs_source';
if(tightAreaCandidates.length===1)decision=`candidate_public_pond_matching_source_area:${tightAreaCandidates[0].sourceObjectId}`;
else if(sourceAreaCandidates.length===1)decision=`candidate_public_pond_broad_area_match_requires_visual_crosscheck:${sourceAreaCandidates[0].sourceObjectId}`;
else if(sourceAreaCandidates.length>1)decision=`multiple_public_pond_area_matches:${sourceAreaCandidates.map(x=>x.sourceObjectId).join(',')}`;

const summary={version:DATE,placeId:PLACE_ID,maxBatch,canonical:{lat:place.lat,lon:place.lon,coordStatus:place.coordStatus},source:{url:SOURCE,checks:sourceChecks,documentedAreaM2:1800,documentedMaxDepthM:6,documentedSetting:'lysapent parklandskap'},waterAreas,sourceAreaCandidates,tightAreaCandidates,nominatim:nq,decision,privacyModel:'Only public pond geometry is evaluated. Exact amphibian observation, road-find or breeding-individual coordinates are not used as canonical place coordinates.'};
writeJson(`${OUT}/summary.json`,summary);
writeFileSync(`${OUT}/README.md`,`# Bygdøy Kongsgård salamander pond public-geometry research\n\nDate: ${DATE}\n\nSource describes a pond of about 1800 m², maximum depth 6 m, in open parkland.\n\n- public water/pond polygons in search radius: ${waterAreas.length}\n- broad area matches (1200–2400 m²): ${sourceAreaCandidates.length}\n- tight area matches (1500–2100 m²): ${tightAreaCandidates.length}\n\nDecision: **${decision}**\n\nNo canonical coordinate changed. Only public pond geometry is evaluated; biological observation points remain out of scope.\n`,'utf8');
console.log(JSON.stringify({placeId:PLACE_ID,sourceChecks,waterAreaCount:waterAreas.length,sourceAreaCandidateCount:sourceAreaCandidates.length,tightAreaCandidateCount:tightAreaCandidates.length,candidates:sourceAreaCandidates.map(o=>({sourceObjectId:o.sourceObjectId,tags:o.tags,center:o.center,distanceM:o.distanceM,areaM2:o.approxAreaM2})),decision},null,2));
