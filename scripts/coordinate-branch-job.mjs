import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const aggregatePath = 'data/places/sport/europa/norway/oslo_sport.json';
const splitDir = 'data/places/sport/europa/norway/oslo_sport';
const splitManifestPath = 'data/places/sport/europa/norway/oslo_sport_manifest.json';
const splitIndexPath = 'data/places/sport/europa/norway/oslo_sport_index.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-120-sport-main';
const resultsPath = `${reportDir}/results.json`;
const verifiedAt = '2026-07-21';

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ø/g,'o').replace(/æ/g,'ae').replace(/å/g,'a').replace(/[^a-z0-9]+/g,' ').trim();
const ringCentroid = (ring) => {
  let twiceArea=0,cx=0,cy=0;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const cross=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1];
    twiceArea+=cross;cx+=(ring[j][0]+ring[i][0])*cross;cy+=(ring[j][1]+ring[i][1])*cross;
  }
  return Math.abs(twiceArea)<1e-12?ring[0]:[cx/(3*twiceArea),cy/(3*twiceArea)];
};
const pointFrom = (candidate) => {
  if(candidate.geojson?.type==='Polygon'){const [lon,lat]=ringCentroid(candidate.geojson.coordinates[0]);return {lat,lon};}
  if(candidate.geojson?.type==='MultiPolygon'){const [lon,lat]=ringCentroid(candidate.geojson.coordinates[0][0]);return {lat,lon};}
  return {lat:Number(candidate.lat),lon:Number(candidate.lon)};
};
const candidateName = (candidate) => candidate.namedetails?.name ?? candidate.name ?? String(candidate.display_name ?? '').split(',')[0];
const osmId = (candidate) => `osm-${candidate.osm_type}:${candidate.osm_id}`;
const osmUrl = (candidate) => `https://www.openstreetmap.org/${candidate.osm_type}/${candidate.osm_id}`;

const aggregate = readJson(aggregatePath);
const byId = new Map(aggregate.map((place)=>[place.id,place]));
const results = readJson(resultsPath);
if(results.batch!==120) throw new Error(`Forventet batch 120, fikk ${results.batch}`);

const frognerRaw = readJson(`${reportDir}/nominatim-frogner_stadion.json`);
const frogner = (frognerRaw.combinedResults??[]).find((candidate)=>candidate.osm_type==='way'&&candidate.osm_id===4272321&&normalize(candidateName(candidate))===normalize('Frogner stadion')&&(candidate.class??candidate.category)==='leisure'&&candidate.type==='pitch'&&candidate.geojson?.type==='Polygon');
if(!frogner) throw new Error('Fant ikke validert Frogner stadion-polygon way 4272321.');

const holmenRaw = readJson(`${reportDir}/nominatim-holmenkollen_nasjonalanlegg.json`);
const holmen = (holmenRaw.combinedResults??[]).find((candidate)=>candidate.osm_type==='way'&&candidate.osm_id===81300521&&normalize(candidateName(candidate))===normalize('Holmenkollen nasjonalanlegg')&&(candidate.class??candidate.category)==='landuse'&&candidate.type==='winter_sports'&&candidate.geojson?.type==='Polygon');
if(!holmen) throw new Error('Fant ikke validert Holmenkollen nasjonalanlegg-polygon way 81300521.');

const upgrades = [
  {id:'frogner_stadion',candidate:frogner,locatorType:'current_place',coordRole:'area_anchor',coordType:'stadium_center',identity:'Frogner stadion som det eksakt navngitte stadion-/banepolygonet'},
  {id:'holmenkollen_nasjonalanlegg',candidate:holmen,locatorType:'current_place',coordRole:'area_anchor',coordType:'sports_complex_center',identity:'Holmenkollen nasjonalanlegg som samlet navngitt vintersportsområde'}
];

for(const upgrade of upgrades){
  const {id,candidate,locatorType,coordRole,coordType,identity}=upgrade;
  const place=byId.get(id);const point=pointFrom(candidate);const sourceObjectId=osmId(candidate);const category=candidate.class??candidate.category;
  Object.assign(place,{lat:point.lat,lon:point.lon,locatorType,sourceProvider:'osm',sourceObjectId,geocodeAccuracy:'geometric_center',coordRole,coordType,coordStatus:'verified_geometry',coordSource:`OpenStreetMap ${candidate.osm_type} ${candidate.osm_id} – ${candidateName(candidate)}`,coordSourceId:sourceObjectId,coordSourceUrl:osmUrl(candidate),coordVerifiedAt:verifiedAt,coordNote:`Eksakt navngitt samlet OSM-geometri valgt etter fysisk sportsobjektkontroll (${category}/${candidate.type}); ikke nearest/first-hit. Representasjonspunktet er beregnet fra selve polygonet.`});
  delete place.coordPrecisionM;
  writeJson(`data/coordinate-evidence/oslo/sport/${id}.json`,{schemaVersion:'1.0',placeId:id,placeFile:aggregatePath,evidenceStatus:'applied_to_place',coordinateDecision:'do_not_change_coordinates_yet',currentCoordinate:{lat:place.lat,lon:place.lon,r:place.r,coordStatus:place.coordStatus,coordSource:place.coordSource,coordType:place.coordType,coordNote:place.coordNote},identity:{currentName:place.name,resolvedIdentity:identity,identityStatus:'resolved',identityProblem:'',locatorTypeCandidate:locatorType,requiresSplit:false,splitReason:''},requiredEvidence:['ett eksakt navngitt fysisk sportsobjekt med riktig semantisk type og legitim geometri'],evidence:[{sourceProvider:'osm',sourceName:`OpenStreetMap – ${candidateName(candidate)}`,sourceUrl:osmUrl(candidate),sourceObjectId,sourceQuality:'exact_named_semantic_sports_object_in_local_scope',finding:`Eksakt navnetreff med objekttype ${category}/${candidate.type} og polygongeometri.`,canVerifyCoordinate:true,reason:place.coordNote}],addressCandidates:[],sourceObjectCandidates:[{sourceProvider:'osm',sourceObjectId,canApplyToPlace:true}],geometryCandidates:[{sourceProvider:'osm',sourceObjectId,lat:place.lat,lon:place.lon,coordRole,canApplyToPlace:true}],coordinateCandidates:[{lat:place.lat,lon:place.lon,coordRole,sourceObjectId,canApplyToPlace:true}],decision:{canBecomeVerified:true,blockedReason:'',nextAction:'Kildeobjekt og representasjonspunkt er anvendt på canonical place.'},notes:[place.coordNote]});
  results.after[id]={lat:place.lat,lon:place.lon,coordStatus:place.coordStatus,coordSource:place.coordSource,coordType:place.coordType,sourceObjectId};
  if(!results.verified.includes(id)) results.verified.push(id);
  results.needsReview=results.needsReview.filter((candidateId)=>candidateId!==id);
}

writeJson(aggregatePath,aggregate);
const splitManifest=readJson(splitManifestPath);
for(const row of splitManifest.places){
  if(!upgrades.some((upgrade)=>upgrade.id===row.id)) continue;
  const childPath=`${splitDir}/${row.id}.json`;const child=readJson(childPath);const place=byId.get(row.id);
  for(const field of ['lat','lon','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote']) child[field]=place[field];
  delete child.coordPrecisionM;writeJson(childPath,child);
}
splitManifest.source_sha256=sha256Text(fs.readFileSync(path.join(root,aggregatePath),'utf8'));splitManifest.generated_at=new Date().toISOString();
const splitIndex=[];
for(const row of [...splitManifest.places].sort((a,b)=>a.order-b.order)){
  const childPath=`data/places/sport/europa/norway/${row.file}`;const childText=fs.readFileSync(path.join(root,childPath),'utf8');row.sha256=sha256Text(childText);const place=JSON.parse(childText);
  splitIndex.push({id:place.id,name:place.name??null,category:place.category??null,lat:place.lat??null,lon:place.lon??null,r:place.r??null,year:place.year??null,coordStatus:place.coordStatus??null,coordType:place.coordType??null,locatorType:place.locatorType??null,sourceProvider:place.sourceProvider??null,sourceObjectId:place.sourceObjectId??null,geocodeAccuracy:place.geocodeAccuracy??null,coordRole:place.coordRole??null,coordSource:place.coordSource??null,coordSourceId:place.coordSourceId??null,coordSourceUrl:place.coordSourceUrl??null,coordVerifiedAt:place.coordVerifiedAt??null,coordNote:place.coordNote??null,file:row.file});
}
writeJson(splitManifestPath,splitManifest);writeJson(splitIndexPath,splitIndex);

const manifestOrder=[...splitManifest.places].sort((a,b)=>a.order-b.order).map((row)=>row.id);
results.verified=manifestOrder.filter((id)=>results.verified.includes(id));results.needsReview=manifestOrder.filter((id)=>results.needsReview.includes(id));writeJson(resultsPath,results);
fs.writeFileSync(path.join(root,reportDir,'README.md'),`# Oslo coordinate control batch 120 – sport main\n\n## Verified\n${results.verified.map((id)=>`- \`${id}\` → \`${byId.get(id).sourceObjectId}\``).join('\n')}\n\n## Completed without approved coordinate\n${results.needsReview.map((id)=>`- \`${id}\` → needs_review / needs_source`).join('\n')||'- none'}\n\nFrogner stadion accepts the exact named pitch polygon because that polygon is the canonical stadium playing surface. Holmenkollen nasjonalanlegg uses the exact aggregate landuse=winter_sports polygon, not an individual ski jump. No nearest/first-hit selection is used.\n`);

let protocol=fs.readFileSync(path.join(root,protocolPath),'utf8');
for(const {id} of upgrades){
  protocol=protocol.split('\n').filter((line)=>!line.startsWith(`| \`${id}\` – `)).join('\n');
  const place=byId.get(id);const row=`| 120 | \`${id}\` | ${place.name} | verified_geometry | \`${place.sourceObjectId}\` |`;
  if(!protocol.includes(row)) protocol=protocol.replace('\nRelevante korrigerende merger for de første Oslo-batchene:',`\n${row}\nRelevante korrigerende merger for de første Oslo-batchene:`);
}
fs.writeFileSync(path.join(root,protocolPath),protocol);

const altSearches={
  gressbanen:{queries:['Readybanen','Gressbanen Ready','Ready Gressbanen'],viewbox:'10.660,59.960,10.695,59.940'},
  kfum_arena:{queries:['KFUM-kameratene Oslo stadion','KFUM Oslo stadion','KFUM-hallen Ekeberg','KFUM Arena Ekeberg'],viewbox:'10.765,59.905,10.825,59.875'},
  nordre_aasen_idrettspark:{queries:['Skeid stadion','Nordre Åsen stadion','Nordre Åsen kunstgress'],viewbox:'10.770,59.960,10.815,59.930'}
};
for(const [id,config] of Object.entries(altSearches)){
  const queryRuns=[];const combined=new Map();
  for(const query of config.queries){
    const params=new URLSearchParams({format:'jsonv2',q:`${query}, Oslo, Norway`,limit:'20',polygon_geojson:'1',addressdetails:'1',namedetails:'1',viewbox:config.viewbox,bounded:'1'});
    const url=`https://nominatim.openstreetmap.org/search?${params}`;const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'History-Go-coordinate-audit/1.0'}});if(!response.ok)throw new Error(`Alt Nominatim failed for ${id}: ${response.status}`);const rows=await response.json();queryRuns.push({query,queryUrl:url,results:rows});for(const row of rows)combined.set(`${row.osm_type}:${row.osm_id}`,row);await new Promise((resolve)=>setTimeout(resolve,1100));
  }
  writeJson(`${reportDir}/nominatim-${id}-alternate.json`,{queryRuns,combinedResults:[...combined.values()]});
}
console.log(JSON.stringify({upgraded:upgrades.map((upgrade)=>upgrade.id),remainingNeedsReview:results.needsReview,alternateSearches:Object.keys(altSearches)},null,2));
