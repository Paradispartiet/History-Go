import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const DATE='2026-07-24';
const BATCH=193;
const PLACE_ID='tjernsmyr_salamanderlokalitet';
const WAY_ID=150926471;
const SOURCE_OBJECT_ID=`osm-way:${WAY_ID}`;
const SOURCE_URL=`https://www.openstreetmap.org/way/${WAY_ID}`;
const OVERPASS='https://overpass.kumi.systems/api/interpreter';
const SVV='https://www.vegvesen.no/vegprosjekter/europaveg/e18vestkorridoren/nyhetsarkiv/undersokte-salamanderliv-ved-tjernsmyr/';

const OLD_AGG='data/places/natur/oslo/places_oslo_natur_salamanderdammer.json';
const OLD_CHILD='data/places/natur/oslo/places_oslo_natur_salamanderdammer/tjernsmyr_salamanderlokalitet.json';
const OLD_SPLIT_MANIFEST='data/places/natur/oslo/places_oslo_natur_salamanderdammer_manifest.json';
const OLD_SPLIT_INDEX='data/places/natur/oslo/places_oslo_natur_salamanderdammer_index.json';
const NEW_PLACE='data/places/natur/akershus/tjernsmyr_salamanderlokalitet.json';
const PLACE_MANIFEST='data/places/manifest.json';
const NEW_PLACE_ENTRY='places/natur/akershus/tjernsmyr_salamanderlokalitet.json';

const OLD_EVIDENCE='data/coordinate-evidence/oslo/natur/tjernsmyr_salamanderlokalitet.json';
const NEW_EVIDENCE='data/coordinate-evidence/akershus/baerum/tjernsmyr_salamanderlokalitet.json';
const EVIDENCE_MANIFEST='data/coordinate-evidence/manifest.json';
const OLD_EVIDENCE_ENTRY='oslo/natur/tjernsmyr_salamanderlokalitet.json';
const NEW_EVIDENCE_ENTRY='akershus/baerum/tjernsmyr_salamanderlokalitet.json';

const RESEARCH='reports/akershus-coordinate-tjernsmyr-wetland-research-post-192/summary.json';
const PROTOCOL='docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR='reports/akershus-coordinate-control-batch-193-tjernsmyr-wetland-relocation';
mkdirSync(REPORT_DIR,{recursive:true});

const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const writeJson=(p,v)=>{mkdirSync(p.split('/').slice(0,-1).join('/'),{recursive:true});writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8');};
const sha256=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const rad=x=>x*Math.PI/180;
const dist=(a,b,c,d)=>{const R=6371000,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(q));};
const pointInPolygon=(lat,lon,g)=>{let inside=false;for(let i=0,j=g.length-1;i<g.length;j=i++){const xi=g[i].lon,yi=g[i].lat,xj=g[j].lon,yj=g[j].lat;const hit=((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/((yj-yi)||1e-12)+xi);if(hit)inside=!inside;}return inside;};
const polygonArea=(g)=>{const pts=g.length>1&&g[0].lat===g.at(-1).lat&&g[0].lon===g.at(-1).lon?g.slice(0,-1):g;const lat0=pts.reduce((s,p)=>s+p.lat,0)/pts.length,mx=111320*Math.cos(rad(lat0)),my=110540;let s=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s+=(a.lon*mx)*(b.lat*my)-(b.lon*mx)*(a.lat*my);}return Math.abs(s)/2;};
function polygonCentroid(g){
  const pts=g.length>1&&g[0].lat===g.at(-1).lat&&g[0].lon===g.at(-1).lon?g.slice(0,-1):g;
  const lat0=pts.reduce((s,p)=>s+p.lat,0)/pts.length,mx=111320*Math.cos(rad(lat0)),my=110540;
  let twice=0,cx=0,cy=0;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ax=a.lon*mx,ay=a.lat*my,bx=b.lon*mx,by=b.lat*my,cross=ax*by-bx*ay;twice+=cross;cx+=(ax+bx)*cross;cy+=(ay+by)*cross;}
  if(Math.abs(twice)<1e-9)return null;
  return {lat:(cy/(3*twice))/my,lon:(cx/(3*twice))/mx};
}
function deterministicInteriorPoint(g){
  const centroid=polygonCentroid(g);
  if(centroid&&pointInPolygon(centroid.lat,centroid.lon,g))return {...centroid,method:'polygon_centroid'};
  const pts=g.length>1&&g[0].lat===g.at(-1).lat&&g[0].lon===g.at(-1).lon?g.slice(0,-1):g;
  const minLat=Math.min(...pts.map(p=>p.lat)),maxLat=Math.max(...pts.map(p=>p.lat));
  for(const fraction of [0.5,0.45,0.55,0.4,0.6,0.35,0.65]){
    const y=minLat+(maxLat-minLat)*fraction, intersections=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){
      const a=pts[j],b=pts[i];
      if((a.lat>y)!==(b.lat>y))intersections.push(a.lon+(b.lon-a.lon)*(y-a.lat)/(b.lat-a.lat));
    }
    intersections.sort((a,b)=>a-b);
    let best=null;
    for(let i=0;i+1<intersections.length;i+=2){const width=intersections[i+1]-intersections[i];if(!best||width>best.width)best={width,lon:(intersections[i]+intersections[i+1])/2};}
    if(best&&pointInPolygon(y,best.lon,g))return {lat:y,lon:best.lon,method:`scanline_${fraction}`};
  }
  throw new Error('Could not derive deterministic interior point from wetland polygon');
}
const extractPlaces=root=>{const out=[],seen=new Set();const visit=(v,d=0)=>{if(d>8||v==null)return;if(Array.isArray(v))return v.forEach(x=>visit(x,d+1));if(typeof v!=='object')return;if(typeof v.id==='string'&&typeof v.name==='string'&&Number.isFinite(v.lat)&&Number.isFinite(v.lon)){if(!seen.has(v.id)){seen.add(v.id);out.push(v);}return;}Object.values(v).forEach(x=>visit(x,d+1));};visit(root);return out;};
async function fetchText(url,opts={}){const r=await fetch(url,{...opts,headers:{'user-agent':'History-Go coordinate production/1.0',...(opts.headers||{})}});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status} for ${url}`);return t;}

if(existsSync(NEW_PLACE)||existsSync(NEW_EVIDENCE))throw new Error('Tjernsmyr Akershus target already exists');
let protocol=readFileSync(PROTOCOL,'utf8');
const maxBatch=Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map(m=>Number(m[1])));
if(maxBatch!==192)throw new Error(`Expected coordinate max batch 192, got ${maxBatch}`);

const research=readJson(RESEARCH);
if(research.placeId!==PLACE_ID||research.decision!==`candidate_exact_public_named_wetland:${SOURCE_OBJECT_ID}`)throw new Error(`Merged Tjernsmyr research is not production-ready: ${research.decision}`);
const researched=(research.classificationCorrection?.exactNamedWetlands||[]).filter(x=>x.sourceObjectId===SOURCE_OBJECT_ID);
if(researched.length!==1)throw new Error(`Expected one locked researched wetland, got ${researched.length}`);
const researchedGeom=researched[0].geometry;
if(!Array.isArray(researchedGeom)||researchedGeom.length<4)throw new Error('Merged research has no exact wetland polygon geometry');

const oldAggregate=readJson(OLD_AGG);
if(!Array.isArray(oldAggregate)||oldAggregate.filter(x=>x?.id===PLACE_ID).length!==1)throw new Error('Unexpected old Tjernsmyr aggregate state');
const oldPlace=oldAggregate.find(x=>x.id===PLACE_ID);
if(oldPlace.coordStatus!=='needs_source'||oldPlace.locatorType!=='natural_area')throw new Error('Tjernsmyr legacy record no longer matches unresolved natural-area state');
const oldEvidence=readJson(OLD_EVIDENCE);
if(oldEvidence.placeId!==PLACE_ID||oldEvidence.coordinateDecision!=='needs_geometry')throw new Error('Unexpected old Tjernsmyr evidence state');

const query=`[out:json][timeout:45];way(${WAY_ID});out tags geom;`;
const raw=await fetchText(OVERPASS,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}).toString()});
writeFileSync(`${REPORT_DIR}/overpass-exact-wetland.json`,raw,'utf8');
const osm=JSON.parse(raw), matches=(osm.elements||[]).filter(x=>x.type==='way'&&Number(x.id)===WAY_ID);
if(matches.length!==1)throw new Error(`Expected one live OSM way ${WAY_ID}, got ${matches.length}`);
const way=matches[0];
if(way.tags?.name!=='Tjernsmyr'||way.tags?.natural!=='wetland')throw new Error(`Live wetland identity changed: ${JSON.stringify(way.tags||{})}`);
const geometry=(way.geometry||[]).map(p=>({lat:Number(p.lat),lon:Number(p.lon)}));
if(geometry.length!==researchedGeom.length)throw new Error(`Wetland point count drifted from ${researchedGeom.length} to ${geometry.length}`);
const direct=geometry.every((p,i)=>dist(p.lat,p.lon,researchedGeom[i].lat,researchedGeom[i].lon)<=0.25);
const reverse=geometry.every((p,i)=>dist(p.lat,p.lon,researchedGeom[researchedGeom.length-1-i].lat,researchedGeom[researchedGeom.length-1-i].lon)<=0.25);
if(!direct&&!reverse)throw new Error('Live Tjernsmyr wetland polygon drifted from merged research geometry');
const areaM2=polygonArea(geometry);
if(Math.abs(areaM2-2277)>10)throw new Error(`Unexpected Tjernsmyr wetland area ${areaM2.toFixed(2)}m²`);
const anchor=deterministicInteriorPoint(geometry);
if(!pointInPolygon(anchor.lat,anchor.lon,geometry))throw new Error('Derived Tjernsmyr area anchor is not inside polygon');

const pts=geometry.length>1&&geometry[0].lat===geometry.at(-1).lat&&geometry[0].lon===geometry.at(-1).lon?geometry.slice(0,-1):geometry;
const cardinal=[
  ['north',pts.reduce((a,b)=>b.lat>a.lat?b:a)],
  ['south',pts.reduce((a,b)=>b.lat<a.lat?b:a)],
  ['east',pts.reduce((a,b)=>b.lon>a.lon?b:a)],
  ['west',pts.reduce((a,b)=>b.lon<a.lon?b:a)]
];
const anchors=[...new Map(cardinal.map(([dir,p])=>[`${p.lat},${p.lon}`,{id:`tjernsmyr_boundary_${dir}`,name:`Tjernsmyr våtmark – ${dir}`,type:'boundary_point',lat:p.lat,lon:p.lon,r:25}])).values()];

const runtime=extractPlaces(readJson('data/places/places_index.json'));
const nameDup=runtime.filter(p=>p.id!==PLACE_ID&&p.name.trim().toLowerCase()===oldPlace.name.trim().toLowerCase());
if(nameDup.length)throw new Error(`Existing canonical Tjernsmyr identity duplicate: ${nameDup.map(p=>p.id).join(', ')}`);
const nearby=runtime.filter(p=>p.id!==PLACE_ID).map(p=>({id:p.id,name:p.name,distanceMeters:Number(dist(anchor.lat,anchor.lon,p.lat,p.lon).toFixed(2))})).sort((a,b)=>a.distanceMeters-b.distanceMeters);
if(nearby[0]?.distanceMeters<=3)throw new Error(`Existing canonical marker within 3m: ${nearby[0].id} at ${nearby[0].distanceMeters}m`);

const coordNote=`Exact public area geometry: OpenStreetMap way ${WAY_ID} is named Tjernsmyr and tagged natural=wetland. Canonical lat/lon is a deterministic interior ${anchor.method} derived from the public wetland polygon (${areaM2.toFixed(0)} m²), not a salamander capture, trap, nest or individual-observation point. Statens vegvesen documents Tjernsmyr at Lysaker as a salamander habitat affected by E18 planning; the canonical source family is therefore moved from Oslo to Bærum/Akershus.`;
const place={
  ...oldPlace,
  lat:anchor.lat,
  lon:anchor.lon,
  r:120,
  sourceHint:'Statens vegvesen documents the Tjernsmyr salamander habitat at Lysaker. The public named Tjernsmyr wetland polygon is used only as the area locator; precise biological observation locations are intentionally excluded.',
  locatorType:'natural_area',
  sourceProvider:'osm',
  sourceObjectId:SOURCE_OBJECT_ID,
  geocodeAccuracy:'semantic_anchor',
  coordRole:'area_anchor',
  coordType:'wetland_area_anchor',
  coordStatus:'verified_geometry',
  coordSource:`OpenStreetMap exact named wetland way ${WAY_ID} – Tjernsmyr`,
  coordSourceId:SOURCE_OBJECT_ID,
  coordSourceUrl:SOURCE_URL,
  coordVerifiedAt:DATE,
  coordNote,
  anchors,
  links:{...(oldPlace.links||{}),website:SVV,map:SOURCE_URL}
};

const evidence={
  schemaVersion:'1.0',
  placeId:PLACE_ID,
  placeFile:NEW_PLACE,
  evidenceStatus:'applied_to_place',
  coordinateDecision:'do_not_change_coordinates_yet',
  currentCoordinate:{lat:anchor.lat,lon:anchor.lon,r:120,coordStatus:'verified_geometry',coordSource:place.coordSource,coordType:'wetland_area_anchor',coordNote},
  identity:{
    currentName:place.name,
    resolvedIdentity:'den offentlig kartlagte våtmarksflaten Tjernsmyr ved Lysaker i Bærum, brukt som habitatområde-locator for salamandercaset',
    identityStatus:'resolved',
    identityProblem:'',
    locatorTypeCandidate:'natural_area',
    requiresSplit:false,
    splitReason:''
  },
  requiredEvidence:['eksakt offentlig navngitt våtmarksgeometri','innvendig deterministisk områdeanker på samme polygon','offisiell kilde som dokumenterer Tjernsmyr som salamanderhabitat ved Lysaker/Bærum'],
  evidence:[
    {sourceProvider:'osm',sourceName:`OpenStreetMap – way ${WAY_ID} Tjernsmyr`,sourceUrl:SOURCE_URL,sourceObjectId:SOURCE_OBJECT_ID,sourceQuality:'exact_named_public_wetland_geometry',finding:`Eksakt offentlig polygon med name=Tjernsmyr og natural=wetland, ca. ${areaM2.toFixed(0)} m².`,canVerifyCoordinate:true,reason:coordNote},
    {sourceProvider:'statens_vegvesen',sourceName:'Statens vegvesen – undersøkte salamanderliv ved Tjernsmyr',sourceUrl:SVV,sourceObjectId:'vegvesen:e18-vestkorridoren:tjernsmyr-salamander',sourceQuality:'official_habitat_identity',finding:'Statens vegvesen dokumenterer Tjernsmyr ved Lysaker som salamanderlokalitet i samferdsels- og utbyggingslandskapet.',canVerifyCoordinate:false,reason:'Dokumenterer habitatidentiteten og geografisk Bærum/Lysaker-kontekst; den offentlige OSM-våtmarksflaten brukes som koordinatgeometri.'}
  ],
  addressCandidates:[],
  sourceObjectCandidates:[{sourceProvider:'osm',sourceObjectId:SOURCE_OBJECT_ID,canApplyToPlace:true},{sourceProvider:'statens_vegvesen',sourceObjectId:'vegvesen:e18-vestkorridoren:tjernsmyr-salamander',canApplyToPlace:false}],
  geometryCandidates:[{sourceProvider:'osm',sourceObjectId:SOURCE_OBJECT_ID,lat:anchor.lat,lon:anchor.lon,coordRole:'area_anchor',canApplyToPlace:true},...anchors.map(a=>({sourceProvider:'osm',sourceObjectId:SOURCE_OBJECT_ID,lat:a.lat,lon:a.lon,coordRole:'boundary_anchor',canApplyToPlace:false}))],
  coordinateCandidates:[{sourceProvider:'osm',sourceObjectId:SOURCE_OBJECT_ID,lat:anchor.lat,lon:anchor.lon,coordRole:'area_anchor',canApplyToPlace:true}],
  decision:{canBecomeVerified:true,blockedReason:'',nextAction:'Tjernsmyr er flyttet til Bærum/Akershus og verifisert på den offentlige navngitte våtmarksflaten; biologiske individ- og fangstpunkter er eksplisitt ikke del av koordinatmodellen.'},
  notes:[coordNote,`Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id||'ingen'} på ${nearby[0]?.distanceMeters??'n/a'} meter; ingen markør lå innen 3 meter.`]
};

// Remove the misplaced Oslo source record and split artifacts.
writeJson(OLD_AGG,oldAggregate.filter(x=>x?.id!==PLACE_ID));
if(!existsSync(OLD_CHILD))throw new Error(`Missing old split child ${OLD_CHILD}`);
rmSync(OLD_CHILD);
const splitManifest=readJson(OLD_SPLIT_MANIFEST);
if(!Array.isArray(splitManifest.places)||splitManifest.places.filter(x=>x?.id===PLACE_ID).length!==1)throw new Error('Unexpected old split manifest state');
splitManifest.places=splitManifest.places.filter(x=>x?.id!==PLACE_ID).map((x,order)=>({...x,order}));
splitManifest.place_count=splitManifest.places.length;
splitManifest.source_sha256=sha256(OLD_AGG);
splitManifest.generated_at=new Date().toISOString();
writeJson(OLD_SPLIT_MANIFEST,splitManifest);
const splitIndex=readJson(OLD_SPLIT_INDEX);
if(!Array.isArray(splitIndex)||splitIndex.filter(x=>x?.id===PLACE_ID).length!==1)throw new Error('Unexpected old split index state');
writeJson(OLD_SPLIT_INDEX,splitIndex.filter(x=>x?.id!==PLACE_ID));

// Add the canonical Bærum/Akershus standalone source.
writeJson(NEW_PLACE,place);
const placeManifest=readJson(PLACE_MANIFEST);
if(!Array.isArray(placeManifest.files))throw new Error('Place manifest missing files[]');
if(placeManifest.files.includes(NEW_PLACE_ENTRY))throw new Error('New Tjernsmyr place manifest entry already exists');
placeManifest.files.push(NEW_PLACE_ENTRY);
writeJson(PLACE_MANIFEST,placeManifest);

// Move coordinate evidence to Bærum/Akershus.
writeJson(NEW_EVIDENCE,evidence);
if(!existsSync(OLD_EVIDENCE))throw new Error(`Missing old evidence ${OLD_EVIDENCE}`);
rmSync(OLD_EVIDENCE);
const evidenceManifest=readJson(EVIDENCE_MANIFEST);
if(!Array.isArray(evidenceManifest.files)||!evidenceManifest.files.includes(OLD_EVIDENCE_ENTRY))throw new Error('Old Tjernsmyr evidence manifest entry missing');
evidenceManifest.files=evidenceManifest.files.filter(x=>x!==OLD_EVIDENCE_ENTRY&&x!==NEW_EVIDENCE_ENTRY);
evidenceManifest.files.push(NEW_EVIDENCE_ENTRY);
writeJson(EVIDENCE_MANIFEST,evidenceManifest);

// Update any Civication mapping objects without touching ordinary placeId references.
const grep=await import('node:child_process').then(({spawnSync})=>spawnSync('git',['grep','-l','-F',`"${PLACE_ID}"`,'--','data/Civication'],{encoding:'utf8'}));
if(![0,1].includes(grep.status))throw new Error(`git grep failed for Civication: ${grep.stderr}`);
const civiFiles=String(grep.stdout||'').trim().split('\n').filter(Boolean).filter(f=>f.endsWith('.json'));
let civiUpdates=0;
const updatedCiviFiles=[];
for(const file of civiFiles){
  let data;try{data=readJson(file);}catch{continue;}
  let changed=false;
  const visit=v=>{if(Array.isArray(v))return v.forEach(visit);if(!v||typeof v!=='object')return;if(v.historyGoPlaceId===PLACE_ID){v.historyGoSourceFile=NEW_PLACE_ENTRY;v.name=place.name;v.lat=place.lat;v.lon=place.lon;v.needsVerification=false;civiUpdates++;changed=true;}Object.values(v).forEach(visit);};
  visit(data);if(changed){writeJson(file,data);updatedCiviFiles.push(file);}
}

const protocolLines=protocol.split('\n');
const unresolvedRows=protocolLines.map((line,index)=>line.includes(`\`${PLACE_ID}\``)?index:-1).filter(index=>index>=0);
if(unresolvedRows.length!==1)throw new Error(`Expected one unresolved protocol row for ${PLACE_ID}, got ${unresolvedRows.length}`);
protocol=protocolLines.filter((_,index)=>!unresolvedRows.includes(index)).join('\n');
protocol=`${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Tjernsmyr salamanderlokalitet | verified geometry; moved to Akershus/Bærum | \`${SOURCE_OBJECT_ID}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved å rette både geografisk kildefamilie og fysisk locator. Recorden flyttes fra Oslo-salamanderkilden til Bærum/Akershus. Live OSM way ${WAY_ID} er den eksakte offentlige våtmarksflaten med \`name=Tjernsmyr\` og \`natural=wetland\`, ca. ${areaM2.toFixed(0)} m². Canonical lat/lon er et deterministisk innvendig områdeanker beregnet fra polygonet (\`${anchor.method}\`), med fire offentlige grenseankre lagret for kildekontrakten. Statens vegvesen dokumenterer Tjernsmyr ved Lysaker som salamanderhabitat i E18-planleggingen, men ingen presise fangst-, felle-, individ- eller observasjonspunkter brukes eller publiseres. Den nærliggende offentlige dammen Lysakertjern/Tjernsmyrtjern er habitatkontekst, ikke koordinatkilden for selve Tjernsmyr-våtmarksrecorden.\n`;
writeFileSync(PROTOCOL,protocol,'utf8');

writeJson(`${REPORT_DIR}/batch-193-result.json`,{
  version:DATE,batch:BATCH,placeId:PLACE_ID,status:'produced_from_exact_public_named_wetland_and_relocated_to_baerum',
  old:{file:OLD_AGG,coordinate:{lat:oldPlace.lat,lon:oldPlace.lon,r:oldPlace.r},coordStatus:oldPlace.coordStatus},
  current:{file:NEW_PLACE,coordinate:{lat:place.lat,lon:place.lon,r:place.r},sourceObjectId:SOURCE_OBJECT_ID,coordStatus:place.coordStatus,coordType:place.coordType,locatorType:place.locatorType,representationMethod:anchor.method,polygonAreaM2:Number(areaM2.toFixed(2)),anchors},
  liveTags:way.tags,geometryPointCount:geometry.length,exactNameDuplicateCount:nameDup.length,nearestCanonicalBeforeWrite:nearby[0]||null,civicationUpdates,updatedCiviFiles,
  privacyModel:'Only the public named Tjernsmyr wetland polygon is used. Precise salamander capture, trap, individual or observation locations are excluded.'
});
console.log(JSON.stringify({batch:BATCH,placeId:PLACE_ID,sourceObjectId:SOURCE_OBJECT_ID,coordinate:{lat:place.lat,lon:place.lon},representationMethod:anchor.method,polygonAreaM2:Number(areaM2.toFixed(2)),movedFrom:'oslo',movedTo:'akershus/baerum',civicationUpdates,nearestCanonicalBeforeWrite:nearby[0]||null},null,2));
