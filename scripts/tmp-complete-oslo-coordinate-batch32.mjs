import fs from 'node:fs';

const source = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceDir = 'data/coordinate-evidence/oslo/natur';
const reportDir = 'reports/oslo-coordinate-control-batch-32';
const date = '2026-07-19';
const places = JSON.parse(fs.readFileSync(source, 'utf8'));
const byId = new Map(places.map(p => [p.id, p]));
const get = id => { const p = byId.get(id); if (!p) throw new Error(`Missing ${id}`); return p; };

function unresolved(id, patch) {
  Object.assign(get(id), {
    coordStatus: 'needs_source', geocodeAccuracy: 'unknown', coordVerifiedAt: date, ...patch,
  });
}

unresolved('frysjadammen', {
  locatorType: 'unknown', sourceProvider: 'manual_research',
  sourceObjectId: 'identity-conflict:frysjadammen-brekkedammen-maridalsoset',
  coordRole: 'display_marker', coordType: 'legacy_unverified', coordSource: 'identity_conflict_unresolved',
  coordNote: 'Recorden blander Brekkedammen/Kjelsåsdammen ved Frysja med reguleringsanlegget ved Maridalsoset. Eksisterende lat/lon beholdes kun som legacy til identiteten er splittet eller avgrenset.'
});
unresolved('nydalen_industristed', {
  locatorType: 'linear_area', sourceProvider: 'manual_research', sourceObjectId: 'canonical-overlap:nydalen',
  coordRole: 'area_anchor', coordType: 'duplicate_area_candidate', coordSource: 'canonical_overlap_unresolved',
  coordNote: 'Recorden overlapper fysisk med allerede canonical og koordinatverifiserte `nydalen`. Et nytt områdepunkt ville duplisere samme fysiske sted; eksisterende lat/lon beholdes kun som legacy.'
});
unresolved('seilduksfabrikken_nydalen', {
  locatorType: 'building', sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:gjerdrums-vei-12:ovre-spinderi',
  coordRole: 'display_marker', coordType: 'legacy_unverified', coordSource: 'official_address_ambiguous',
  coordSourceUrl: 'https://oslobyleksikon.no/side/Gjerdrums_vei',
  coordNote: 'Øvre Spinderi er dokumentert som Gjerdrums vei 12, men repoets normative Geonorge-finner returnerer flere treff uten én entydig kandidat. Eksisterende lat/lon beholdes kun som legacy.'
});
unresolved('stilla_nydalen', {
  locatorType: 'natural_area', sourceProvider: 'manual_research', sourceObjectId: 'stilla-nydalen:unresolved-river-section',
  coordRole: 'area_anchor', coordType: 'legacy_unverified', coordSource: 'named_river_section_unresolved',
  coordNote: 'Stilla beskriver en elvestrekning uten ett entydig navngitt kartobjekt eller dokumentert avgrensning. Eksisterende lat/lon beholdes kun som legacy til rutegeometri eller et kildebelagt anker er dokumentert.'
});

Object.assign(get('nydalsdammen'), {
  lat: 59.9572011, lon: 10.7658593, locatorType: 'natural_area', sourceProvider: 'osm',
  sourceObjectId: 'osm-relation:14637129', geocodeAccuracy: 'geometric_center', coordRole: 'area_anchor',
  coordType: 'reservoir', coordStatus: 'verified_geometry', coordSource: 'OpenStreetMap relation 14637129 – Nydalsdammen',
  coordSourceId: 'osm-relation:14637129', coordSourceUrl: 'https://www.openstreetmap.org/relation/14637129', coordVerifiedAt: date,
  coordNote: 'Eksakt navngitt OSM-vannrelasjon for Nydalsdammen, kryssjekket mot Oslo kommune og Oslo byleksikon. Relasjonens representasjonspunkt brukes som area-anchor; den gamle markøren lå over én kilometer lenger sør.'
});
Object.assign(get('bjoelsenfossen'), {
  lat: 59.9408256, lon: 10.7693368, locatorType: 'poi', sourceProvider: 'osm', sourceObjectId: 'osm-node:10679414566',
  geocodeAccuracy: 'geometric_center', coordRole: 'display_marker', coordType: 'waterfall', coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap node 10679414566 – Bjølsenfossen', coordSourceId: 'osm-node:10679414566',
  coordSourceUrl: 'https://www.openstreetmap.org/node/10679414566', coordVerifiedAt: date,
  coordNote: 'Eksakt navngitt OSM-punkt for Bjølsenfossen/Bjølsenfallet, koblet til Wikidata Q15063812 og kryssjekket mot Oslo byleksikon. Det gamle punktet lå vest for selve fossen.'
});
Object.assign(get('bjoelsenparken_elvenaer'), {
  sourceObjectId: 'osm-way:336602343', coordSource: 'OpenStreetMap way 336602343 – Advokat Dehlis plass',
  coordSourceId: 'osm-way:336602343', coordSourceUrl: 'https://www.openstreetmap.org/way/336602343', coordVerifiedAt: date,
  coordNote: 'Eksakt navngitt OSM-areal for grøntarealet på Advokat Dehlis plass, way 336602343, kryssjekket mot Wikidata Q15063467 og Oslo byleksikon.'
});
fs.writeFileSync(source, JSON.stringify(places, null, 2) + '\n');

fs.mkdirSync(evidenceDir, { recursive: true });
const cfg = {
  frysjadammen: ['needs_research','needs_identity_split','conflict'],
  nydalen_industristed: ['needs_research','needs_identity_split','duplicate_overlap'],
  seilduksfabrikken_nydalen: ['needs_research','needs_address_source','resolved_but_coordinate_ambiguous'],
  nydalsdammen: ['applied_to_place','do_not_change_coordinates_yet','resolved'],
  stilla_nydalen: ['needs_research','needs_geometry','partially_resolved'],
  bjoelsenfossen: ['applied_to_place','do_not_change_coordinates_yet','resolved'],
  bjoelsenparken_elvenaer: ['applied_to_place','do_not_change_coordinates_yet','resolved'],
};
const snap = p => ({lat:p.lat??null,lon:p.lon??null,r:p.r??null,coordStatus:p.coordStatus??'',coordSource:p.coordSource??'',coordType:p.coordType??'',coordNote:p.coordNote??''});
for (const [id,[status,decision,identityStatus]] of Object.entries(cfg)) {
  const p = get(id);
  const ev = {
    schemaVersion:'1.0', placeId:id, placeFile:source, evidenceStatus:status, coordinateDecision:decision,
    currentCoordinate:snap(p), identity:{currentName:p.name,resolvedIdentity:p.name,identityStatus,identityProblem:status==='applied_to_place'?'':p.coordNote,locatorTypeCandidate:p.locatorType,requiresSplit:decision==='needs_identity_split',splitReason:''},
    requiredEvidence:status==='applied_to_place'?[]:['exact canonical anchor or resolved identity'], evidence:[], addressCandidates:[], sourceObjectCandidates:[], geometryCandidates:[], coordinateCandidates:[],
    decision:{canBecomeVerified:status==='applied_to_place',blockedReason:status==='applied_to_place'?'':p.coordNote,nextAction:status==='applied_to_place'?'Applied to canonical place.':'Do not promote until the blocking issue is resolved.'}, notes:[p.coordNote]
  };
  fs.writeFileSync(`${evidenceDir}/${id}.json`, JSON.stringify(ev,null,2)+'\n');
}
const em = JSON.parse(fs.readFileSync(evidenceManifestPath,'utf8'));
for (const id of Object.keys(cfg)) { const rel=`oslo/natur/${id}.json`; if (!em.files.includes(rel)) em.files.push(rel); }
fs.writeFileSync(evidenceManifestPath,JSON.stringify(em,null,2)+'\n');

let protocol=fs.readFileSync(protocolPath,'utf8');
protocol=protocol.replace(/Oslo-tabellen inneholder nå 151 verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 40\./,'Oslo-tabellen inneholder nå 154 verifiserte eller kildekontrollerte canonical steder. Batch 32 kontrollerer de sju første recordene i Akerselva-ruten: Nydalsdammen og Bjølsenfossen får eksakt navngitt OSM-geometri, den allerede verifiserte Advokat Dehlis plass-markøren føres inn i protokollen, mens fire konflikt- eller uavklarte records avsluttes uten ny godkjent koordinat. Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 44.');
const anchor='| 31 | `alnabru_jernbane_og_logistikk` | Alnabru godsterminal | verified_geometry | `osm-way:84268939` |';
if(!protocol.includes('| 32 | `nydalsdammen`')) protocol=protocol.replace(anchor,anchor+'\n| 32 | `nydalsdammen` | Nydalsdammen | verified_geometry | `osm-relation:14637129` |\n| 32 | `bjoelsenfossen` | Bjølsenfossen | verified_geometry | `osm-node:10679414566` |\n| 32 | `bjoelsenparken_elvenaer` | Advokat Dehlis plass – grøntarealet | verified_geometry | `osm-way:336602343` |');
const h='| kandidat | status | dokumentert konflikt | oppfølging |\n|---|---|---|---|';
const rows='| `frysjadammen` – Frysjadammen | needs_review | Recorden blander Brekkedammen/Kjelsåsdammen ved Frysja med reguleringshistorie ved Maridalsoset. | Splitt eller velg én fysisk identitet før koordinat godkjennes. |\n| `nydalen_industristed` – Nydalen industristed | needs_review | Fysisk overlapp med canonical `nydalen`. | Modeller som delprofil/relation eller avgrens et separat fysisk objekt. |\n| `seilduksfabrikken_nydalen` – Øvre spinneri | needs_review | Gjerdrums vei 12 er dokumentert, men Geonorge gir flere ikke-entydige treff. | Finn eksakt bygningsgeometri eller dokumenter ett konkret adressepunkt. |\n| `stilla_nydalen` – Stilla ved Nydalen | needs_review | Elvestrekning uten entydig navngitt geometri eller avgrensning. | Krever rutegeometri eller eksplisitt kildebelagt anker. |';
if(!protocol.includes('| `frysjadammen` – Frysjadammen |')) protocol=protocol.replace(h,h+'\n'+rows);
fs.writeFileSync(protocolPath,protocol);

fs.mkdirSync(reportDir,{recursive:true});
fs.writeFileSync(`${reportDir}/README.md`,'# Oslo coordinate control batch 32\n\nKontrollerer de første sju ukontrollerte recordene i Akerselva-ruten. Tre avsluttes som verified_geometry; fire som needs_source. Bare Nydalsdammen og Bjølsenfossen flyttes fysisk.\n');
fs.writeFileSync(`${reportDir}/applied-summary.json`,JSON.stringify({batch:32,verifiedGeometry:['nydalsdammen','bjoelsenfossen','bjoelsenparken_elvenaer'],needsSource:['frysjadammen','nydalen_industristed','seilduksfabrikken_nydalen','stilla_nydalen'],moves:{nydalsdammen:{from:[59.9458,10.766],to:[59.9572011,10.7658593]},bjoelsenfossen:{from:[59.9398,10.7602],to:[59.9408256,10.7693368]}}},null,2)+'\n');
console.log('Applied batch 32.');
