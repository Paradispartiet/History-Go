import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const verifiedAt = '2026-07-21';
const aggregatePath = 'data/places/sport/europa/norway/oslo_sport.json';
const splitDir = 'data/places/sport/europa/norway/oslo_sport';
const splitManifestPath = 'data/places/sport/europa/norway/oslo_sport_manifest.json';
const splitIndexPath = 'data/places/sport/europa/norway/oslo_sport_index.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const reportSeed = 'reports/oslo-coordinate-control-sport-main-working';

const run = (args) => execFileSync('git', args, { stdio: 'inherit' });
const selfPath = path.resolve('scripts/coordinate-branch-job.mjs');
const selfSource = fs.readFileSync(selfPath, 'utf8');
const branchName = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (!branchName) throw new Error('Kunne ikke identifisere koordinatbranchen.');
run(['config', 'user.name', 'github-actions[bot]']);
run(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run(['fetch', 'origin', 'main']);
run(['reset', '--hard', 'origin/main']);
fs.writeFileSync(selfPath, selfSource);
run(['add', selfPath]);
run(['commit', '-m', 'Rebase Oslo sport coordinate runner onto latest main']);
run(['push', '--force-with-lease', 'origin', `HEAD:${branchName}`]);

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a')
  .replace(/[^a-z0-9]+/g, ' ').trim();

const ringArea = (ring) => {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) sum += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  return sum / 2;
};
const ringCentroid = (ring) => {
  let twiceArea = 0; let cx = 0; let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    twiceArea += cross; cx += (ring[j][0] + ring[i][0]) * cross; cy += (ring[j][1] + ring[i][1]) * cross;
  }
  return Math.abs(twiceArea) < 1e-12 ? ring[0] : [cx / (3 * twiceArea), cy / (3 * twiceArea)];
};
const representativePoint = (geojson, fallbackLat, fallbackLon) => {
  if (geojson?.type === 'Point') return { lat: geojson.coordinates[1], lon: geojson.coordinates[0] };
  if (geojson?.type === 'Polygon') { const [lon, lat] = ringCentroid(geojson.coordinates[0]); return { lat, lon }; }
  if (geojson?.type === 'MultiPolygon') {
    const polygon = [...geojson.coordinates].sort((a, b) => Math.abs(ringArea(b[0])) - Math.abs(ringArea(a[0])))[0];
    const [lon, lat] = ringCentroid(polygon[0]); return { lat, lon };
  }
  return { lat: Number(fallbackLat), lon: Number(fallbackLon) };
};

const aggregate = readJson(aggregatePath);
const splitManifest = readJson(splitManifestPath);
const byId = new Map(aggregate.map((place) => [place.id, place]));
const manifestIds = [...splitManifest.places].sort((a,b) => a.order - b.order).map((row) => row.id);
let protocol = fs.readFileSync(path.join(root, protocolPath), 'utf8');

const osloStart = protocol.indexOf('## Oslo');
const correctionsMarker = protocol.indexOf('\nRelevante korrigerende merger for de første Oslo-batchene:', osloStart);
const reviewStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const reviewEnd = protocol.indexOf('\n## ', reviewStart + 4);
if (osloStart < 0 || correctionsMarker < 0 || reviewStart < 0 || reviewEnd < 0) throw new Error('Fant ikke canonical Oslo-tabellseksjonene.');
const primaryIds = new Set([...protocol.slice(osloStart, correctionsMarker).matchAll(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/gm)].map((m) => m[1]));
const reviewIds = new Set([...protocol.slice(reviewStart, reviewEnd).matchAll(/^\| `([^`]+)`/gm)].map((m) => m[1]));
const controlled = new Set([...primaryIds, ...reviewIds]);
const pendingIds = manifestIds.filter((id) => !controlled.has(id));
if (!pendingIds.length) throw new Error('Oslo-sport-kilden har ingen ukontrollerte records.');
const batchMatch = protocol.match(/Neste nye Oslo-kontroll er batch (\d+)\./);
if (!batchMatch) throw new Error('Fant ikke neste batchnummer.');
const batch = Number(batchMatch[1]);

const definitions = {
  bislett_stadion: { queries:['Bislett Stadion'], aliases:['Bislett Stadion'], viewbox:'10.720,59.932,10.742,59.918', preferences:[['leisure','stadium'],['building','stadium'],['leisure','sports_centre']], locatorType:'current_place', coordRole:'area_anchor', coordType:'stadium_center', identity:'Bislett Stadion som samlet stadionanlegg' },
  ullevaal_stadion: { queries:['Ullevaal Stadion','Ullevaal stadion'], aliases:['Ullevaal Stadion','Ullevaal stadion'], viewbox:'10.718,59.957,10.744,59.941', preferences:[['leisure','stadium'],['building','stadium'],['leisure','sports_centre']], locatorType:'current_place', coordRole:'area_anchor', coordType:'stadium_center', identity:'Ullevaal Stadion som samlet fotballstadion' },
  intility_arena: { queries:['Intility Arena'], aliases:['Intility Arena'], viewbox:'10.795,59.925,10.825,59.912', preferences:[['leisure','stadium'],['building','stadium'],['leisure','sports_centre']], locatorType:'current_place', coordRole:'area_anchor', coordType:'stadium_center', identity:'Intility Arena som fotballstadion' },
  jordal_amfi: { queries:['Jordal Amfi'], aliases:['Jordal Amfi'], viewbox:'10.775,59.920,10.800,59.906', preferences:[['leisure','sports_centre'],['building','sports_hall'],['leisure','stadium'],['building','stadium']], locatorType:'building', coordRole:'building_center', coordType:'building_center', identity:'Jordal Amfi som ishall og arena' },
  holmenkollen_nasjonalanlegg: { queries:['Holmenkollen nasjonalanlegg'], aliases:['Holmenkollen nasjonalanlegg'], viewbox:'10.640,59.975,10.690,59.955', preferences:[['leisure','sports_centre'],['landuse','recreation_ground']], allowedGeometryTypes:['Polygon','MultiPolygon'], locatorType:'current_place', coordRole:'area_anchor', coordType:'sports_complex_center', identity:'Holmenkollen nasjonalanlegg som samlet nasjonalanlegg, ikke én enkelt hoppbakke' },
  frogner_stadion: { queries:['Frogner stadion'], aliases:['Frogner stadion'], viewbox:'10.690,59.935,10.720,59.922', preferences:[['leisure','stadium'],['leisure','sports_centre'],['building','stadium']], locatorType:'current_place', coordRole:'area_anchor', coordType:'stadium_center', identity:'Frogner stadion som samlet idrettsanlegg' },
  valle_hovin_stadion: { queries:['Valle Hovin stadion','Valle Hovin'], aliases:['Valle Hovin stadion','Valle Hovin'], viewbox:'10.790,59.930,10.815,59.918', preferences:[['leisure','stadium'],['leisure','sports_centre'],['landuse','recreation_ground']], locatorType:'current_place', coordRole:'area_anchor', coordType:'stadium_center', identity:'Valle Hovin stadion som sportsarena' },
  daelenenga_idrettspark: { queries:['Dælenenga idrettspark','Dælenenga'], aliases:['Dælenenga idrettspark','Dælenenga'], viewbox:'10.750,59.940,10.780,59.925', preferences:[['leisure','sports_centre'],['landuse','recreation_ground'],['leisure','stadium']], allowedGeometryTypes:['Polygon','MultiPolygon'], locatorType:'current_place', coordRole:'area_anchor', coordType:'sports_complex_center', identity:'Dælenenga idrettspark som samlet idrettsområde' },
  gressbanen: { queries:['Gressbanen Oslo','Gressbanen'], aliases:['Gressbanen'], viewbox:'10.680,59.960,10.705,59.940', preferences:[['leisure','stadium'],['leisure','sports_centre'],['leisure','pitch']], locatorType:'current_place', coordRole:'area_anchor', coordType:'stadium_center', identity:'Gressbanen som navngitt stadion- og idrettsanlegg' },
  ekebergsletta: { queries:['Ekebergsletta'], aliases:['Ekebergsletta'], viewbox:'10.760,59.910,10.795,59.880', preferences:[['landuse','recreation_ground'],['leisure','park'],['leisure','sports_centre']], allowedGeometryTypes:['Polygon','MultiPolygon'], locatorType:'current_place', coordRole:'area_anchor', coordType:'sports_area_center', identity:'Ekebergsletta som samlet aktivitets- og idrettsflate, ikke én enkelt bane' },
  kfum_arena: { queries:['KFUM Arena'], aliases:['KFUM Arena'], viewbox:'10.815,59.905,10.845,59.885', preferences:[['leisure','stadium'],['leisure','sports_centre'],['building','stadium']], locatorType:'current_place', coordRole:'area_anchor', coordType:'stadium_center', identity:'KFUM Arena som fotballstadion' },
  nordre_aasen_idrettspark: { queries:['Nordre Åsen idrettspark','Nordre Åsen'], aliases:['Nordre Åsen idrettspark','Nordre Åsen'], viewbox:'10.790,59.960,10.820,59.940', preferences:[['leisure','sports_centre'],['landuse','recreation_ground'],['leisure','stadium']], allowedGeometryTypes:['Polygon','MultiPolygon'], locatorType:'current_place', coordRole:'area_anchor', coordType:'sports_complex_center', identity:'Nordre Åsen idrettspark som samlet idrettsområde' },
  vallhall_arena: { queries:['Vallhall Arena','Vallhall'], aliases:['Vallhall Arena','Vallhall'], viewbox:'10.800,59.930,10.830,59.915', preferences:[['building','sports_hall'],['leisure','sports_centre'],['building','stadium']], locatorType:'building', coordRole:'building_center', coordType:'building_center', identity:'Vallhall Arena som innendørs idrettshall' },
  manglerudhallen: { queries:['Manglerudhallen'], aliases:['Manglerudhallen'], viewbox:'10.800,59.910,10.840,59.885', preferences:[['building','sports_hall'],['leisure','sports_centre'],['building','stadium']], locatorType:'building', coordRole:'building_center', coordType:'building_center', identity:'Manglerudhallen som idretts- og ishall' },
  furuset_forum: { queries:['Furuset Forum'], aliases:['Furuset Forum'], viewbox:'10.875,59.955,10.910,59.935', preferences:[['building','sports_hall'],['leisure','sports_centre'],['building','stadium']], locatorType:'building', coordRole:'building_center', coordType:'building_center', identity:'Furuset Forum som idretts- og ishall' }
};

const strongExisting = (place) => {
  const verified = ['verified','verified_geometry','verified_historical_source'].includes(String(place?.coordStatus ?? ''));
  const hasIdentity = Boolean(place?.sourceObjectId) || Boolean(place?.address && Object.values(place.address).some(Boolean));
  return verified && Boolean(place?.locatorType) && Boolean(place?.sourceProvider) && hasIdentity && Boolean(place?.geocodeAccuracy) && Boolean(place?.coordRole) && Boolean(place?.coordType) && Boolean(place?.coordNote);
};
const candidateName = (candidate) => candidate.namedetails?.name ?? candidate.name ?? String(candidate.display_name ?? '').split(',')[0];
const candidateKey = (candidate) => `${candidate.osm_type}:${candidate.osm_id}`;
const osmId = (candidate) => `osm-${candidate.osm_type}:${candidate.osm_id}`;
const osmUrl = (candidate) => `https://www.openstreetmap.org/${candidate.osm_type}/${candidate.osm_id}`;
const searchNominatim = async (id, definition) => {
  const queryRuns = []; const combined = new Map();
  for (const query of definition.queries) {
    const params = new URLSearchParams({format:'jsonv2',q:`${query}, Oslo, Norway`,limit:'20',polygon_geojson:'1',addressdetails:'1',namedetails:'1',viewbox:definition.viewbox,bounded:'1'});
    const url = `https://nominatim.openstreetmap.org/search?${params}`;
    const response = await fetch(url, { headers:{Accept:'application/json','User-Agent':'History-Go-coordinate-audit/1.0'} });
    if (!response.ok) throw new Error(`Nominatim failed for ${id}: ${response.status} ${response.statusText}`);
    const results = await response.json();
    queryRuns.push({query,queryUrl:url,results});
    for (const result of results) combined.set(candidateKey(result), result);
    await sleep(1100);
  }
  const results = [...combined.values()];
  writeJson(`${reportSeed}/nominatim-${id}.json`, {queryRuns,combinedResults:results});
  return results;
};
const chooseCandidate = (results, definition) => {
  const aliases = definition.aliases.map(normalize);
  const scored = results.map((candidate) => {
    if (!aliases.includes(normalize(candidateName(candidate)))) return {candidate,score:-Infinity};
    if (definition.allowedGeometryTypes && !definition.allowedGeometryTypes.includes(candidate.geojson?.type)) return {candidate,score:-Infinity};
    const category = candidate.class ?? candidate.category;
    const pref = definition.preferences.findIndex(([c,t]) => category === c && candidate.type === t);
    if (pref < 0) return {candidate,score:-Infinity};
    const geometryBonus = ['Polygon','MultiPolygon'].includes(candidate.geojson?.type) ? 40 : candidate.geojson?.type === 'Point' ? 10 : 0;
    return {candidate,score:1000-pref*100+geometryBonus};
  }).filter((entry) => Number.isFinite(entry.score)).sort((a,b) => b.score-a.score || Number(a.candidate.osm_id)-Number(b.candidate.osm_id));
  if (!scored.length) return {selected:null,reason:'no_exact_semantic_candidate'};
  const top = scored.filter((entry) => entry.score === scored[0].score);
  return top.length === 1 ? {selected:top[0].candidate,reason:'unique_best_exact_semantic_candidate'} : {selected:null,reason:`ambiguous_best_exact_semantic_candidates:${top.length}`};
};

const before = {}; const after = {}; const verified = {}; const unresolved = {}; const evidenceDefs = {};
for (const id of pendingIds) {
  const place = byId.get(id); if (!place) throw new Error(`Mangler ${id} i Oslo sport.`);
  before[id] = {lat:place.lat,lon:place.lon,coordStatus:place.coordStatus??null,coordSource:place.coordSource??null,coordType:place.coordType??null};
  if (strongExisting(place)) {
    place.coordVerifiedAt = verifiedAt;
    verified[id] = {sourceObjectId:place.sourceObjectId,sourceUrl:place.coordSourceUrl??'',provider:place.sourceProvider,mode:'existing_verified_v1'};
    evidenceDefs[id] = {identity:`${place.name} som allerede canonical dokumentert fysisk sportssted`,locatorType:place.locatorType,requiredEvidence:['eksisterende verified v1 source contract'],evidence:[{sourceProvider:place.sourceProvider,sourceName:`Eksisterende canonical kilde – ${place.name}`,sourceUrl:place.coordSourceUrl??'',sourceObjectId:place.sourceObjectId??`existing:${id}`,sourceQuality:'existing_verified_v1_contract',finding:place.coordNote,canVerifyCoordinate:true,reason:place.coordNote}]};
    after[id] = {lat:place.lat,lon:place.lon,coordStatus:place.coordStatus,coordSource:place.coordSource,coordType:place.coordType,sourceObjectId:place.sourceObjectId??null};
    continue;
  }
  const definition = definitions[id]; if (!definition) throw new Error(`Mangler sport-definisjon for ${id}`);
  const results = await searchNominatim(id, definition); const resolution = chooseCandidate(results, definition);
  if (resolution.selected) {
    const candidate = resolution.selected; const point = representativePoint(candidate.geojson,candidate.lat,candidate.lon); const sourceObjectId = osmId(candidate); const category = candidate.class ?? candidate.category;
    Object.assign(place,{lat:point.lat,lon:point.lon,locatorType:definition.locatorType,sourceProvider:'osm',sourceObjectId,geocodeAccuracy:['Polygon','MultiPolygon'].includes(candidate.geojson?.type)?'geometric_center':['building','current_place'].includes(definition.locatorType)?'building':'semantic_anchor',coordRole:definition.coordRole,coordType:definition.coordType,coordStatus:'verified_geometry',coordSource:`OpenStreetMap ${candidate.osm_type} ${candidate.osm_id} – ${candidateName(candidate)}`,coordSourceId:sourceObjectId,coordSourceUrl:osmUrl(candidate),coordVerifiedAt:verifiedAt,coordNote:`Eksakt navngitt OSM-sportsobjekt valgt innenfor forhåndsdefinert lokal scope og riktig objekttype ${category}/${candidate.type}; ikke nearest/first-hit. Representasjonspunktet er beregnet fra kildegeometrien.`});
    delete place.coordPrecisionM;
    verified[id] = {sourceObjectId,sourceUrl:osmUrl(candidate),provider:'osm',mode:resolution.reason};
    evidenceDefs[id] = {identity:definition.identity,locatorType:definition.locatorType,requiredEvidence:['ett eksakt navngitt fysisk sportsobjekt med riktig semantisk objekttype i lokal scope'],evidence:[{sourceProvider:'osm',sourceName:`OpenStreetMap – ${candidateName(candidate)}`,sourceUrl:osmUrl(candidate),sourceObjectId,sourceQuality:'exact_named_semantic_sports_object_in_local_scope',finding:`Eksakt navnetreff med objekttype ${category}/${candidate.type} og geometri ${candidate.geojson?.type??'Point'}.`,canVerifyCoordinate:true,reason:place.coordNote}]};
    after[id] = {lat:place.lat,lon:place.lon,coordStatus:place.coordStatus,coordSource:place.coordSource,coordType:place.coordType,sourceObjectId};
  } else {
    const reason = ['holmenkollen_nasjonalanlegg','ekebergsletta','daelenenga_idrettspark','nordre_aasen_idrettspark'].includes(id)
      ? `Kontrollen ga ikke én legitim samlet eksakt navngitt områdegeometri for hele canonical anlegget (${resolution.reason}). En enkelt bakke, bane eller delarena kan ikke brukes som proxy for hele området.`
      : `Den avgrensede kontrollen ga ikke ett entydig eksakt navngitt fysisk sportsobjekt med godkjent objekttype (${resolution.reason}). Legacy-punktet beholdes kun som uverifisert kartanker.`;
    const nextAction = ['holmenkollen_nasjonalanlegg','ekebergsletta','daelenenga_idrettspark','nordre_aasen_idrettspark'].includes(id)
      ? 'Dokumenter én samlet navngitt områdegeometri eller eksplisitt sammensatt canonical modell for hele anlegget.'
      : 'Dokumenter ett entydig eksakt fysisk sportsobjekt eller en offisiell adresse/geometri som matcher canonical identiteten.';
    Object.assign(place,{locatorType:definition.locatorType,coordStatus:'needs_source',coordType:'legacy_unverified',coordSource:`${id}_canonical_geometry_unresolved`,coordVerifiedAt:verifiedAt,coordNote:reason});
    for (const field of ['sourceProvider','sourceObjectId','coordSourceId','coordSourceUrl','geocodeAccuracy','coordPrecisionM','coordRole']) delete place[field];
    unresolved[id] = {reason,nextAction,locatorType:definition.locatorType};
    evidenceDefs[id] = {identity:definition.identity,locatorType:definition.locatorType,requiredEvidence:[nextAction],evidence:[{sourceProvider:'osm',sourceName:'OpenStreetMap bounded exact-name candidate audit',sourceUrl:`https://www.openstreetmap.org/search?query=${encodeURIComponent(definition.queries[0]+' Oslo')}`,sourceObjectId:`osm-search-audit:${id}`,sourceQuality:'candidate_search_without_unique_applicable_object',finding:reason,canVerifyCoordinate:false,reason}]};
    after[id] = {lat:place.lat,lon:place.lon,coordStatus:place.coordStatus,coordSource:place.coordSource,coordType:place.coordType,sourceObjectId:null};
  }
}

writeJson(aggregatePath, aggregate);
for (const id of pendingIds) {
  const childPath = `${splitDir}/${id}.json`; const child = readJson(childPath); const canonical = byId.get(id);
  for (const field of ['lat','lon','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote']) {
    if (Object.hasOwn(canonical,field)) child[field]=canonical[field]; else delete child[field];
  }
  delete child.coordPrecisionM; writeJson(childPath,child);
}
splitManifest.source_sha256 = sha256Text(fs.readFileSync(path.join(root,aggregatePath),'utf8'));
splitManifest.generated_at = new Date().toISOString();
const splitIndex=[];
for (const row of [...splitManifest.places].sort((a,b)=>a.order-b.order)) {
  const childPath=`data/places/sport/europa/norway/${row.file}`; const childText=fs.readFileSync(path.join(root,childPath),'utf8'); row.sha256=sha256Text(childText); const place=JSON.parse(childText);
  splitIndex.push({id:place.id,name:place.name??null,category:place.category??null,lat:place.lat??null,lon:place.lon??null,r:place.r??null,year:place.year??null,coordStatus:place.coordStatus??null,coordType:place.coordType??null,locatorType:place.locatorType??null,sourceProvider:place.sourceProvider??null,sourceObjectId:place.sourceObjectId??null,geocodeAccuracy:place.geocodeAccuracy??null,coordRole:place.coordRole??null,coordSource:place.coordSource??null,coordSourceId:place.coordSourceId??null,coordSourceUrl:place.coordSourceUrl??null,coordVerifiedAt:place.coordVerifiedAt??null,coordNote:place.coordNote??null,file:row.file});
}
writeJson(splitManifestPath,splitManifest); writeJson(splitIndexPath,splitIndex);

for (const id of pendingIds) {
  const place=byId.get(id); const definition=evidenceDefs[id]; const isVerified=Boolean(verified[id]); const sourceObjectId=isVerified?verified[id].sourceObjectId:null; const provider=isVerified?verified[id].provider:null;
  const candidate=isVerified?[{sourceProvider:provider,sourceObjectId,lat:place.lat,lon:place.lon,coordRole:place.coordRole,canApplyToPlace:true}]:[];
  writeJson(`data/coordinate-evidence/oslo/sport/${id}.json`,{schemaVersion:'1.0',placeId:id,placeFile:aggregatePath,evidenceStatus:isVerified?'applied_to_place':'needs_research',coordinateDecision:isVerified?'do_not_change_coordinates_yet':'needs_geometry',currentCoordinate:{lat:place.lat,lon:place.lon,r:place.r,coordStatus:place.coordStatus,coordSource:place.coordSource,coordType:place.coordType,coordNote:place.coordNote},identity:{currentName:place.name,resolvedIdentity:definition.identity,identityStatus:'resolved',identityProblem:isVerified?'':place.coordNote,locatorTypeCandidate:definition.locatorType,requiresSplit:false,splitReason:''},requiredEvidence:definition.requiredEvidence,evidence:definition.evidence,addressCandidates:[],sourceObjectCandidates:definition.evidence.map((item)=>({sourceProvider:item.sourceProvider,sourceObjectId:item.sourceObjectId,canApplyToPlace:Boolean(item.canVerifyCoordinate)})),geometryCandidates:isVerified&&provider==='osm'?candidate:[],coordinateCandidates:candidate,decision:{canBecomeVerified:isVerified,blockedReason:isVerified?'':place.coordNote,nextAction:isVerified?'Kildeobjekt og representasjonspunkt er anvendt på canonical place.':unresolved[id].nextAction},notes:[place.coordNote]});
}
const evidenceManifest=readJson(evidenceManifestPath);
for (const id of pendingIds) { const relative=`oslo/sport/${id}.json`; if (!evidenceManifest.files.includes(relative)) evidenceManifest.files.push(relative); }
writeJson(evidenceManifestPath,evidenceManifest);

const newTotal=controlled.size+pendingIds.length;
protocol=protocol.replace(/^Oslo-tabellen inneholder nå .*$/m,`Oslo-tabellen inneholder nå ${newTotal} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${batch} kontrollerer de gjenværende ukontrollerte recordene i \`places/sport/europa/norway/oslo_sport.json\` med eksisterende verified v1-kilder der de allerede finnes og ellers eksakt navngitt fysisk sportsobjekt i lokal scope.`);
const rows=Object.keys(verified).map((id)=>`| ${batch} | \`${id}\` | ${byId.get(id).name} | ${byId.get(id).coordStatus} | \`${byId.get(id).sourceObjectId}\` |`).join('\n');
const note=`Batch ${batch} (2026-07-21) reviderer Oslo-sport-manifestet. Stadioner og haller krever ett eksakt navngitt fysisk sportsobjekt; brede områder som Holmenkollen nasjonalanlegg og Ekebergsletta krever én legitim samlet områdegeometri og kan ikke verifiseres med en enkelt bakke eller bane som proxy. Ingen nearest/first-hit-logikk brukes.`;
protocol=protocol.replace('\nRelevante korrigerende merger for de første Oslo-batchene:',`\n${rows}${rows?'\n\n':''}${note}\nRelevante korrigerende merger for de første Oslo-batchene:`);
const reviewRows=Object.keys(unresolved).map((id)=>`| \`${id}\` – ${byId.get(id).name} | needs_review | ${unresolved[id].reason} | ${unresolved[id].nextAction} |`);
if (reviewRows.length) { const lines=protocol.split('\n'); const header=lines.findIndex((line)=>line.startsWith('### Dokumenterte Oslo-kontroller uten godkjent koordinat')); let started=false; let insertAt=-1; for (let i=header+1;i<lines.length;i+=1){if(lines[i].startsWith('| kandidat |'))started=true;if(started&&lines[i]===''){insertAt=i;break;}} if(insertAt<0)throw new Error('Fant ikke slutten av needs_review-tabellen.'); lines.splice(insertAt,0,...reviewRows); protocol=lines.join('\n'); }
protocol=protocol.replace(/## Neste arbeid\n\n(?:- .*\n){3,6}/,`## Neste arbeid\n\n- Neste nye Oslo-kontroll er batch ${batch+1}.\n- \`places/sport/europa/norway/oslo_sport.json\` er nå fullt kontrollert i manifestrekkefølge. Neste aktive manifestkilde er \`places/sport/europa/norway/places_oslo_lekeplasser_trening.json\`; tidligere kontrollerte placeId-er skal hoppes over.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.\n`);
fs.writeFileSync(path.join(root,protocolPath),protocol);

const reportDir=`reports/oslo-coordinate-control-batch-${batch}-sport-main`;
fs.mkdirSync(path.join(root,reportDir),{recursive:true});
if(fs.existsSync(path.join(root,reportSeed))){for(const file of fs.readdirSync(path.join(root,reportSeed)))fs.renameSync(path.join(root,reportSeed,file),path.join(root,reportDir,file));fs.rmSync(path.join(root,reportSeed),{recursive:true,force:true});}
writeJson(`${reportDir}/results.json`,{generatedAt:new Date().toISOString(),batch,sourceQueue:aggregatePath,pendingIds,skippedPreviouslyCompleted:manifestIds.filter((id)=>controlled.has(id)),verified:Object.keys(verified),needsReview:Object.keys(unresolved),before,after,method:'existing verified v1 where already canonical; otherwise bounded exact-name semantic sports object selection; broad complexes require aggregate polygon; no nearest/first-hit'});
fs.writeFileSync(path.join(root,reportDir,'README.md'),`# Oslo coordinate control batch ${batch} – sport main\n\n## Verified\n${Object.keys(verified).map((id)=>`- \`${id}\` → \`${byId.get(id).sourceObjectId}\``).join('\n')||'- none'}\n\n## Completed without approved coordinate\n${Object.keys(unresolved).map((id)=>`- \`${id}\` → needs_review / needs_source`).join('\n')||'- none'}\n\nBroad sports complexes require one legitimate aggregate geometry. All bounded OSM candidate sets are stored here. No nearest/first-hit selection is used.\n`);
console.log(JSON.stringify({batch,pendingIds,skippedPreviouslyCompleted:manifestIds.filter((id)=>controlled.has(id)),verified:Object.keys(verified),needsReview:Object.keys(unresolved),newTotal,nextBatch:batch+1,reportDir},null,2));
