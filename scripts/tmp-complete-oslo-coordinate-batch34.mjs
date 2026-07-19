import fs from 'node:fs';
import crypto from 'node:crypto';

const sourcePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const splitRoot = 'data/places/natur/oslo/places_oslo_natur_akerselvarute';
const manifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const indexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceDir = 'data/coordinate-evidence/oslo/natur';
const reportDir = 'reports/oslo-coordinate-control-batch-34';
const sourceDir = `${reportDir}/sources`;
const verifiedAt = '2026-07-19';
const ids = [
  'vulkan_industriomrade',
  'elvestrekning_bla_brenneriveien',
  'fossveien_elvestrekning',
  'hausmannsbrua',
  'hausmannsomradet_elvelop',
  'ankerbrua',
  'nybrua_vaterlandsparken',
];
const coordKeys = [
  'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole',
  'coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote','coordPrecisionM',
  'anchors','geometry'
];
const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (path) => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const clone = (value) => JSON.parse(JSON.stringify(value));
const snapshot = (place) => ({
  lat: place.lat ?? null,
  lon: place.lon ?? null,
  r: place.r ?? null,
  coordStatus: place.coordStatus ?? '',
  coordSource: place.coordSource ?? '',
  coordType: place.coordType ?? '',
  coordNote: place.coordNote ?? '',
});

fs.mkdirSync(evidenceDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const vulkanFinder = read(`${sourceDir}/vulkan-maridalsveien-17-geonorge.json`);
if (!vulkanFinder?.ok || vulkanFinder?.status !== 'verified_candidate' || vulkanFinder?.sourceObjectId !== 'geonorge-adresser-v1:0301:14622:17') {
  throw new Error('Vulkan: expected one verified Geonorge candidate for Maridalsveien 17');
}
const osmRows = read(`${sourceDir}/osm-lookup.json`);
if (!Array.isArray(osmRows)) throw new Error('OSM lookup must be an array');
const osm = new Map(osmRows.map((row) => [`${row.osm_type}:${row.osm_id}`, row]));
for (const key of ['way:377766486','way:381749949','way:315066295','way:4334996']) {
  if (!osm.has(key)) throw new Error(`Missing OSM source object ${key}`);
}
const broadSearches = read(`${sourceDir}/broad-segment-searches.json`);
for (const [id, rows] of Object.entries(broadSearches)) {
  if (!Array.isArray(rows) || rows.length !== 0) throw new Error(`${id}: exact-name search changed; manual re-audit required`);
}
const nybrua = osm.get('way:315066295');
const vaterland = osm.get('way:4334996');
const toRad = (deg) => deg * Math.PI / 180;
const haversineM = (aLat, aLon, bLat, bLon) => {
  const R = 6371000;
  const dLat = toRad(bLat-aLat), dLon = toRad(bLon-aLon);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
};
const compositeDistanceM = haversineM(Number(nybrua.lat), Number(nybrua.lon), Number(vaterland.lat), Number(vaterland.lon));
if (compositeDistanceM < 300) throw new Error(`Nybrua/Vaterlandsparken objects unexpectedly close: ${compositeDistanceM} m`);

const places = read(sourcePath);
const byId = new Map(places.map((place) => [place.id, place]));
const get = (id) => {
  const place = byId.get(id);
  if (!place) throw new Error(`Missing ${id}`);
  return place;
};
const before = new Map(ids.map((id) => [id, clone(get(id))]));

const v = vulkanFinder.coordinate;
Object.assign(get('vulkan_industriomrade'), {
  lat: v.lat,
  lon: v.lon,
  locatorType: 'linear_area',
  sourceProvider: 'official_address',
  sourceObjectId: vulkanFinder.sourceObjectId,
  address: v.address,
  geocodeAccuracy: 'rooftop',
  coordRole: 'area_anchor',
  coordType: 'area_address_anchor',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: vulkanFinder.sourceObjectId,
  coordSourceUrl: vulkanFinder.sourceUrl,
  coordVerifiedAt: verifiedAt,
  coordNote: 'Offisiell Geonorge-adressekoordinat for Maridalsveien 17 brukes som dokumentert area_anchor for Vulkan som tidligere industriområde. SNL, Oslo byleksikon og Vulkan Oslo dokumenterer Vulkan-området ved denne adressen. Punktet er et adresseanker for området, ikke et geometrisk sentrum og ikke samme objekt som den separate Vulkan energisentral-recorden på Vulkan 5.',
});
for (const key of ['coordPrecisionM','anchors','geometry']) delete get('vulkan_industriomrade')[key];

function applyBridge(id, row, label, wikidata) {
  Object.assign(get(id), {
    lat: Number(row.lat),
    lon: Number(row.lon),
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: `osm-way:${row.osm_id}`,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'line_anchor',
    coordType: 'bridge_center',
    coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap way ${row.osm_id} – ${label}`,
    coordSourceId: `osm-way:${row.osm_id}`,
    coordSourceUrl: `https://www.openstreetmap.org/way/${row.osm_id}`,
    coordVerifiedAt: verifiedAt,
    coordNote: `Eksakt navngitt OSM-way for ${label}, way ${row.osm_id}, koblet til Wikidata ${wikidata}. Wayens representasjonspunkt brukes som line_anchor for selve broen; den gamle markøren lå langt vest for Akerselva.`,
  });
  for (const key of ['coordPrecisionM','anchors','geometry','address']) delete get(id)[key];
}
applyBridge('hausmannsbrua', osm.get('way:377766486'), 'Hausmanns bru', 'Q11974529');
applyBridge('ankerbrua', osm.get('way:381749949'), 'Ankerbrua', 'Q557132');

function unresolvedRoute(id, sourceObjectId, note) {
  const place = get(id);
  Object.assign(place, {
    locatorType: 'route',
    sourceProvider: 'manual_research',
    sourceObjectId,
    geocodeAccuracy: 'unknown',
    coordRole: 'line_anchor',
    coordType: 'legacy_unverified',
    coordStatus: 'needs_source',
    coordSource: 'named_river_segment_unresolved',
    coordVerifiedAt: verifiedAt,
    coordNote: note,
  });
  for (const key of ['coordPrecisionM','anchors','geometry','address','coordSourceId','coordSourceUrl']) delete place[key];
}
unresolvedRoute(
  'elvestrekning_bla_brenneriveien',
  'akerselva-segment:bla-brenneriveien:unresolved',
  'Recorden beskriver en lokalt definert Akerselva-strekning ved Blå/Brenneriveien, men kontrollen fant ikke ett entydig navngitt kildeobjekt som avgrenser akkurat denne strekningen. De tidligere manuelle ruteankrene lå feilplassert vest for Akerselva og er fjernet. Eksisterende lat/lon beholdes kun som legacy til en eksplisitt kildebelagt elvegeometri eller fleranker-modell er dokumentert.'
);
unresolvedRoute(
  'fossveien_elvestrekning',
  'akerselva-segment:fossveien:unresolved',
  'Recorden beskriver en lokalt definert Akerselva-strekning ved Fossveien, men kontrollen fant ikke ett entydig navngitt kildeobjekt som avgrenser akkurat denne strekningen. De tidligere manuelle ruteankrene lå feilplassert vest for Akerselva og er fjernet. Eksisterende lat/lon beholdes kun som legacy til en eksplisitt kildebelagt elvegeometri eller fleranker-modell er dokumentert.'
);
unresolvedRoute(
  'hausmannsomradet_elvelop',
  'akerselva-segment:hausmannsomradet:unresolved',
  'Recorden beskriver et bredt elveløp gjennom Hausmannsområdet uten en entydig fysisk avgrensning i dagens modell. De tidligere manuelle ruteankrene lå feilplassert vest for Akerselva og er fjernet. Eksisterende lat/lon beholdes kun som legacy til en eksplisitt kildebelagt elvegeometri eller fleranker-modell er dokumentert.'
);

const composite = get('nybrua_vaterlandsparken');
Object.assign(composite, {
  locatorType: 'unknown',
  sourceProvider: 'manual_research',
  sourceObjectId: 'identity-conflict:nybrua-vaterlandsparken',
  geocodeAccuracy: 'unknown',
  coordRole: 'display_marker',
  coordType: 'legacy_unverified',
  coordStatus: 'needs_source',
  coordSource: 'identity_conflict_unresolved',
  coordVerifiedAt: verifiedAt,
  coordNote: `Recorden kombinerer to separate fysiske objekter: Nybrua (OSM way 315066295) og Vaterlandsparken (OSM way 4334996), omtrent ${Math.round(compositeDistanceM)} meter fra hverandre. Dagens punkt ligger på et tredje objekt og kan ikke verifiseres som representasjon for begge. De gamle manuelle ankrene er fjernet. Recorden må splittes eller få én eksplisitt canonical identitet før ny koordinat godkjennes.`,
});
for (const key of ['coordPrecisionM','anchors','geometry','address','coordSourceId','coordSourceUrl']) delete composite[key];

write(sourcePath, places);

for (const id of ids) {
  const source = get(id);
  const splitPath = `${splitRoot}/${id}.json`;
  const split = read(splitPath);
  for (const key of coordKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) split[key] = source[key];
    else delete split[key];
  }
  write(splitPath, split);
}

const evidenceConfigs = {
  vulkan_industriomrade: ['applied_to_place','do_not_change_coordinates_yet','resolved','linear_area'],
  elvestrekning_bla_brenneriveien: ['needs_research','needs_geometry','partially_resolved','route'],
  fossveien_elvestrekning: ['needs_research','needs_geometry','partially_resolved','route'],
  hausmannsbrua: ['applied_to_place','do_not_change_coordinates_yet','resolved','linear_area'],
  hausmannsomradet_elvelop: ['needs_research','needs_geometry','partially_resolved','route'],
  ankerbrua: ['applied_to_place','do_not_change_coordinates_yet','resolved','linear_area'],
  nybrua_vaterlandsparken: ['needs_research','needs_identity_split','conflict','unknown'],
};
for (const [id, [evidenceStatus, coordinateDecision, identityStatus, locatorTypeCandidate]] of Object.entries(evidenceConfigs)) {
  const place = get(id);
  const approved = evidenceStatus === 'applied_to_place';
  const evidence = {
    schemaVersion: '1.0',
    placeId: id,
    placeFile: sourcePath,
    evidenceStatus,
    coordinateDecision,
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: place.name,
      identityStatus,
      identityProblem: approved ? '' : place.coordNote,
      locatorTypeCandidate,
      requiresSplit: coordinateDecision === 'needs_identity_split',
      splitReason: coordinateDecision === 'needs_identity_split' ? place.coordNote : '',
    },
    requiredEvidence: approved ? [] : [coordinateDecision === 'needs_identity_split' ? 'one canonical physical identity' : 'source-backed river geometry or multiple documented anchors'],
    evidence: [],
    addressCandidates: id === 'vulkan_industriomrade' ? [vulkanFinder] : [],
    sourceObjectCandidates: id === 'nybrua_vaterlandsparken' ? [
      { sourceObjectId: 'osm-way:315066295', name: 'Nybrua', lat: Number(nybrua.lat), lon: Number(nybrua.lon) },
      { sourceObjectId: 'osm-way:4334996', name: 'Vaterlandsparken', lat: Number(vaterland.lat), lon: Number(vaterland.lon) },
    ] : [],
    geometryCandidates: [],
    coordinateCandidates: [],
    decision: {
      canBecomeVerified: approved,
      blockedReason: approved ? '' : place.coordNote,
      nextAction: approved ? 'Applied to canonical place.' : (coordinateDecision === 'needs_identity_split' ? 'Split or resolve the composite identity before approving a coordinate.' : 'Document a stable river geometry or multiple source-backed anchors before approving a coordinate.'),
    },
    notes: [place.coordNote],
  };
  write(`${evidenceDir}/${id}.json`, evidence);
}
const evidenceManifest = read(evidenceManifestPath);
for (const id of ids) {
  const rel = `oslo/natur/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
}
write(evidenceManifestPath, evidenceManifest);

const manifest = read(manifestPath);
manifest.source_sha256 = sha256(sourcePath);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) {
  const childPath = `data/places/natur/oslo/${row.file}`;
  if (!fs.existsSync(childPath)) throw new Error(`Missing split child ${row.file}`);
  row.sha256 = sha256(childPath);
}
write(manifestPath, manifest);

const index = (manifest.places || []).map((row) => {
  const place = read(`data/places/natur/oslo/${row.file}`);
  return {
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file: row.file,
  };
});
write(indexPath, index);

let protocol = fs.readFileSync(protocolPath, 'utf8');
const oldHeader = /Oslo-tabellen inneholder nå 160 verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 45\./;
if (oldHeader.test(protocol)) {
  protocol = protocol.replace(oldHeader, 'Oslo-tabellen inneholder nå 163 verifiserte eller kildekontrollerte canonical steder. Batch 34 kontrollerer de neste sju recordene i Akerselva-ruten: Vulkan industriområde får et dokumentert Geonorge-adresseanker i Maridalsveien 17; Hausmannsbrua og Ankerbrua får eksakte navngitte OSM-broobjekter; tre lokalt definerte elvestrekninger og den sammenslåtte Nybrua/Vaterlandsparken-recorden avsluttes uten ny godkjent koordinat. Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 49.');
} else if (!protocol.includes('Oslo-tabellen inneholder nå 163 verifiserte eller kildekontrollerte canonical steder.')) {
  throw new Error('Unexpected protocol header before Batch 34');
}
protocol = protocol.replace('teller ikke blant de 160 verifiserte eller kildekontrollerte canonical Oslo-stedene', 'teller ikke blant de 163 verifiserte eller kildekontrollerte canonical Oslo-stedene');
const batch33Anchor = '| 33 | `nedre_foss` | Nedre Foss | verified_geometry | `osm-node:4171862592` |';
const batch34Rows = [
  '| 34 | `vulkan_industriomrade` | Vulkan industriområde | verified | `geonorge-adresser-v1:0301:14622:17` |',
  '| 34 | `hausmannsbrua` | Hausmannsbrua | verified_geometry | `osm-way:377766486` |',
  '| 34 | `ankerbrua` | Ankerbrua | verified_geometry | `osm-way:381749949` |',
].join('\n');
if (!protocol.includes('| 34 | `vulkan_industriomrade`')) {
  if (!protocol.includes(batch33Anchor)) throw new Error('Batch 33 protocol anchor not found');
  protocol = protocol.replace(batch33Anchor, `${batch33Anchor}\n${batch34Rows}`);
}
const unresolvedHeader = '| kandidat | status | dokumentert konflikt | oppfølging |\n|---|---|---|---|';
const unresolvedRows = [
  '| `elvestrekning_bla_brenneriveien` – Elvestrekning ved Blå (Brenneriveien) | needs_review | Lokalt definert elvestrekning uten ett entydig navngitt kildeobjekt; tidligere manuelle ankere lå feilplassert vest for Akerselva. | Dokumenter eksplisitt elvegeometri eller flere kildebelagte ankere. |',
  '| `fossveien_elvestrekning` – Fossveien – elvestrekning | needs_review | Lokalt definert elvestrekning uten ett entydig navngitt kildeobjekt; tidligere manuelle ankere lå feilplassert vest for Akerselva. | Dokumenter eksplisitt elvegeometri eller flere kildebelagte ankere. |',
  '| `hausmannsomradet_elvelop` – Hausmannsområdet (elveløp) | needs_review | Bredt elveløp uten stabil fysisk avgrensning i recorden; tidligere manuelle ankere lå feilplassert vest for Akerselva. | Dokumenter eksplisitt elvegeometri eller flere kildebelagte ankere. |',
  '| `nybrua_vaterlandsparken` – Nybrua / Vaterlandsparken | needs_review | Recorden kombinerer Nybrua og Vaterlandsparken, to separate fysiske objekter, mens dagens punkt ligger på et tredje objekt. | Splitt recorden eller velg én canonical fysisk identitet før koordinat godkjennes. |',
].join('\n');
if (!protocol.includes('| `elvestrekning_bla_brenneriveien` – Elvestrekning ved Blå')) {
  if (!protocol.includes(unresolvedHeader)) throw new Error('Unresolved protocol table header not found');
  protocol = protocol.replace(unresolvedHeader, `${unresolvedHeader}\n${unresolvedRows}`);
}
fs.writeFileSync(protocolPath, protocol);

const moves = {};
for (const id of ids) {
  const b = before.get(id);
  const a = get(id);
  moves[id] = {
    from: [b.lat, b.lon],
    to: [a.lat, a.lon],
    changed: b.lat !== a.lat || b.lon !== a.lon,
    status: a.coordStatus,
    sourceObjectId: a.sourceObjectId,
  };
}
write(`${reportDir}/applied-summary.json`, {
  batch: 34,
  verified: ['vulkan_industriomrade'],
  verifiedGeometry: ['hausmannsbrua','ankerbrua'],
  needsSource: ['elvestrekning_bla_brenneriveien','fossveien_elvestrekning','hausmannsomradet_elvelop','nybrua_vaterlandsparken'],
  compositeDistanceM,
  moves,
  protocolCounts: { approved: 163, unresolved: 49 },
});
fs.writeFileSync(`${reportDir}/README.md`, '# Oslo coordinate control batch 34\n\nKontrollerer manifestrekkefølge 14–20 i Akerselva-ruten. Vulkan industriområde får dokumentert adresseanker i Maridalsveien 17; Hausmannsbrua og Ankerbrua får eksakte OSM-broobjekter. Tre vilkårlige elvestrekninger og komposittrecorden Nybrua/Vaterlandsparken beholdes eksplisitt uverifisert. Feilplasserte source-less route-ankre fjernes. Bare koordinatfeltene synkroniseres til eksisterende rike split-filer.\n');

console.log(JSON.stringify({ batch: 34, approved: 3, unresolved: 4, compositeDistanceM, moves }, null, 2));
