import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE = '2026-07-24';
const PLACE_ID = 'sigrid_undset_statue';
const NODE_ID = 7596280553;
const LEGACY = { lat: 59.9242, lon: 10.7297 };
const OUT = 'reports/oslo-coordinate-sigrid-undset-exact-object-refresh-post-192';
mkdirSync(OUT, { recursive: true });

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, v) => writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`);
const rad = (x) => x * Math.PI / 180;
const dist = (a,b,c,d) => {
  const R=6371000, x=rad(c-a), y=rad(d-b);
  const q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;
  return 2*R*Math.asin(Math.sqrt(q));
};
const plain = (v) => String(v || '').replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').toLowerCase();
const isUndset = (v) => /sigrid\s+undset/.test(plain(v));
async function getText(url, options={}) {
  const r=await fetch(url,{...options,headers:{'user-agent':'History-Go coordinate research/1.0',...(options.headers||{})}});
  const t=await r.text();
  if(!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return t;
}
async function getJson(url, options={}) { return JSON.parse(await getText(url, options)); }

const protocol=readFileSync('docs/coordinates/coordinate-control-protocol.md','utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==192) throw new Error(`Expected max batch 192, got ${maxBatch}`);

const place=readJson('data/places/litteratur/oslo/places_litteratur/sigrid_undset_statue.json');
if(place.id!==PLACE_ID||place.coordStatus!=='needs_source') throw new Error('Unexpected canonical state');
const evidence=readJson('data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json');
if(evidence.placeId!==PLACE_ID||evidence.coordinateDecision!=='needs_geometry') throw new Error('Unexpected evidence state');

const overpass='https://overpass.kumi.systems/api/interpreter';
const query=`[out:json][timeout:45];(node(${NODE_ID});nwr["tourism"="artwork"](around:250,${LEGACY.lat},${LEGACY.lon});nwr["historic"="memorial"](around:250,${LEGACY.lat},${LEGACY.lon}););out tags center;`;
const osm=await getJson(overpass,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}).toString()});
writeJson(`${OUT}/overpass.json`,osm);
const objects=(osm.elements||[]).map(e=>({
  type:e.type,id:Number(e.id),lat:Number(e.lat??e.center?.lat),lon:Number(e.lon??e.center?.lon),tags:e.tags||{}
})).filter(o=>Number.isFinite(o.lat)&&Number.isFinite(o.lon)).map(o=>({...o,distanceFromLegacyM:Number(dist(LEGACY.lat,LEGACY.lon,o.lat,o.lon).toFixed(2))}));
const candidates=objects.filter(o=>o.type==='node'&&o.id===NODE_ID);
if(candidates.length!==1) throw new Error(`Expected one node ${NODE_ID}, got ${candidates.length}`);
const candidate=candidates[0];
const directIdentity=isUndset(Object.entries(candidate.tags).flat().join(' '));

const nominatim=[];
for(const q of ['Sigrid Undset statue Stensparken Oslo','Sigrid Undset skulptur Stensparken Oslo']){
  const u='https://nominatim.openstreetmap.org/search?'+new URLSearchParams({format:'jsonv2',limit:'20',q}).toString();
  const results=await getJson(u,{headers:{'accept-language':'nb,en'}});
  nominatim.push({query:q,results:results.map(x=>({display_name:x.display_name,osm_type:x.osm_type,osm_id:x.osm_id,lat:Number(x.lat),lon:Number(x.lon)}))});
}
writeJson(`${OUT}/nominatim.json`,nominatim);

const api='https://commons.wikimedia.org/w/api.php';
const pages=new Map();
async function collect(params,label){
  const u=api+'?'+new URLSearchParams({action:'query',format:'json',...params}).toString();
  const data=await getJson(u);
  for(const p of Object.values(data.query?.pages||{})){
    const old=pages.get(p.pageid)||{pageid:p.pageid,title:p.title,sources:[]};
    old.sources=[...new Set([...old.sources,label])];
    old.coordinates=p.coordinates||old.coordinates||[];
    const info=p.imageinfo?.[0]||{};
    old.descriptionurl=info.descriptionurl||old.descriptionurl||null;
    old.meta=Object.fromEntries(Object.entries(info.extmetadata||{}).map(([k,v])=>[k,v?.value??v]));
    pages.set(p.pageid,old);
  }
}
for(const term of ['Sigrid Undset Stensparken','Sigrid Undset statue Oslo']){
  await collect({generator:'search',gsrsearch:term,gsrnamespace:'6',gsrlimit:'50',prop:'coordinates|imageinfo',iiprop:'url|extmetadata'},`text:${term}`);
}
await collect({generator:'geosearch',ggsprimary:'all',ggsnamespace:'6',ggscoord:`${candidate.lat}|${candidate.lon}`,ggsradius:'250',ggslimit:'100',prop:'coordinates|imageinfo',iiprop:'url|extmetadata'},'geo:250m');

const commons=[...pages.values()].map(p=>{
  const text=[p.title,...Object.values(p.meta||{})].join(' ');
  const c=p.coordinates?.[0];
  const lat=c?Number(c.lat):null,lon=c?Number(c.lon):null;
  return {...p,identityMatch:isUndset(text),coordinate:Number.isFinite(lat)&&Number.isFinite(lon)?{lat,lon}:null,distanceFromCandidateM:Number.isFinite(lat)&&Number.isFinite(lon)?Number(dist(candidate.lat,candidate.lon,lat,lon).toFixed(2)):null,materialText:plain(text)};
});
writeJson(`${OUT}/commons.json`,commons);
const identityCommons=commons.filter(p=>p.identityMatch);
const tight=identityCommons.filter(p=>p.coordinate&&p.distanceFromCandidateM<=20);
const material=plain(candidate.tags.material||'');
const contradiction=material.includes('bronze')&&tight.some(p=>/(granitt|granite|stein|stone)/.test(p.materialText)&&!/(bronse|bronze)/.test(p.materialText));
const canPromote=directIdentity||(tight.length>0&&!contradiction);
const decision=directIdentity?`promotable_direct_osm_identity`:tight.length&&contradiction?`blocked_material_contradiction`:tight.length?`promotable_independent_geotagged_crosscheck`:`keep_needs_source`;
const summary={version:DATE,placeId:PLACE_ID,maxBatch,candidate,directIdentity,nominatim,commonsIdentityCount:identityCommons.length,tightCrosschecks:tight,materialContradiction:contradiction,canPromote,decision,nearbyObjects:objects.sort((a,b)=>a.distanceFromLegacyM-b.distanceFromLegacyM)};
writeJson(`${OUT}/summary.json`,summary);
writeFileSync(`${OUT}/README.md`,`# Sigrid Undset exact-object refresh\n\nDate: ${DATE}\n\nCandidate: OSM node ${NODE_ID} at ${candidate.lat}, ${candidate.lon}.\n\n- direct identity: ${directIdentity}\n- material: ${candidate.tags.material||'none'}\n- Commons identity hits: ${identityCommons.length}\n- geotagged identity hits within 20 m: ${tight.length}\n- material contradiction: ${contradiction}\n\nDecision: **${decision}**\n\nNo canonical coordinate changed.\n`);
console.log(JSON.stringify({placeId:PLACE_ID,candidateNodeId:NODE_ID,candidateCoordinate:{lat:candidate.lat,lon:candidate.lon},candidateTags:candidate.tags,directIdentity,commonsIdentityCount:identityCommons.length,tightCrosscheckCount:tight.length,materialContradiction:contradiction,canPromote,decision},null,2));
