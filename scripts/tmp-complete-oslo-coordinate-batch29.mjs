import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const aggregatePath = path.join(root, 'data/places/litteratur/oslo/places_litteratur.json');
const splitDir = path.join(root, 'data/places/litteratur/oslo/places_litteratur');
const categoryIndexPath = path.join(root, 'data/places/litteratur/oslo/places_litteratur_index.json');
const splitManifestPath = path.join(root, 'data/places/litteratur/oslo/places_litteratur_manifest.json');
const topManifestPath = path.join(root, 'data/places/manifest.json');
const evidenceRoot = path.join(root, 'data/coordinate-evidence');
const evidenceManifestPath = path.join(evidenceRoot, 'manifest.json');
const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-29');
const today = '2026-07-19';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const writeJsonAndHash = (file, value) => {
  const text = JSON.stringify(value, null, 2) + '\n';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return sha256Text(text);
};

const aggregate = readJson(aggregatePath);
const categoryIndex = readJson(categoryIndexPath);
const splitManifest = readJson(splitManifestPath);
const topManifest = readJson(topManifestPath);

const byId = new Map(aggregate.map((p) => [p.id, p]));
for (const id of [
  'kulturkirken_jakob_litteratur', 'norli_universitetsgata', 'sigrid_undset_statue',
  'ruth_maier_minne', 'alf_proysen_statue_nittedal', 'proysenhuset_rudshogda', 'inger_hagerups_plass'
]) {
  if (!byId.has(id)) throw new Error(`Mangler batch 29-place ${id}`);
}

const movedAlf = structuredClone(byId.get('alf_proysen_statue_nittedal'));
const movedProysen = structuredClone(byId.get('proysenhuset_rudshogda'));

const patches = {
  kulturkirken_jakob_litteratur: {
    lat: 59.9180329772343,
    lon: 10.754119014784367,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-adresser-v1:0301:12782:14',
    address: { street: 'Hausmanns gate', number: '14', postcode: '0182', city: 'Oslo', country: 'NO' },
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-adresser-v1:0301:12782:14',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Hausmanns%20gate%2014%20Oslo',
    coordVerifiedAt: today,
    coordNote: 'Offisiell adressekoordinat fra Geonorge for Hausmanns gate 14, kryssjekket mot det eksplisitt navngitte OSM-byggobjektet Kulturkirken Jakob (way 44044595). Punktet representerer selve kulturkirken og erstatter det tidligere omtrentlige legacy-punktet.'
  },
  norli_universitetsgata: {
    lat: 59.9152021,
    lon: 10.7371559,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:1664967174',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'site_center',
    coordType: 'poi',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 1664967174 – Norli',
    coordSourceId: 'osm-node:1664967174',
    coordSourceUrl: 'https://www.openstreetmap.org/node/1664967174',
    coordVerifiedAt: today,
    coordNote: 'Eksakt navngitt bokhandel-POI for Norli Universitetsgata. Norlis offisielle adresse er Universitetsgata 22–24, og Geonorge gir separate punkter for 22 og 24; det navngitte POI-et brukes derfor for å unngå å velge ett husnummer vilkårlig.'
  },
  sigrid_undset_statue: {
    year: 1991,
    desc: 'Står i Stensparken ved Fagerborg – avduket i 1991 til minne om forfatteren og nobelprisvinneren Sigrid Undset.',
    locatorType: 'poi',
    sourceProvider: 'legacy_unknown',
    sourceObjectId: 'legacy-coordinate:sigrid_undset_statue',
    geocodeAccuracy: 'unknown',
    coordRole: 'display_marker',
    coordType: 'unverified_monument_point',
    coordStatus: 'needs_manual_visual_qa',
    coordSource: 'legacy_unknown',
    coordSourceId: 'legacy-coordinate:sigrid_undset_statue',
    coordVerifiedAt: today,
    coordNote: 'Legacy-punktet er ikke godkjent som koordinat for Sigrid Undset-statuen. Kildene dokumenterer statuen i Stensparken og avduking i 1991, men objektpasset fant ingen entydig navngitt statuegeometri. Punktet beholdes kun midlertidig i aktiv data til eksakt monumentobjekt eller dokumentert sokkelpunkt er funnet.'
  },
  ruth_maier_minne: {
    lat: 59.92269694444444,
    lon: 10.737988055555554,
    desc: 'Snublesteinen utenfor Dalsbergstien 3 minnes Ruth Maier, den østerrikske-jødiske flyktningen og forfatteren som ble deportert og drept i Auschwitz i 1942.',
    popupDesc: 'Snublesteinen utenfor Dalsbergstien 3 markerer stedet der Ruth Maier bodde før hun ble arrestert og deportert i 1942. Minnestedet knytter hennes dagbøker, dikt og vennskap med Gunvor Hofmo til et konkret sted i Oslo og gjør den europeiske jødeforfølgelsen synlig i byens hverdagsrom.',
    locatorType: 'poi',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikidata:Q44179381',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'site_center',
    coordType: 'site_center',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikidata Q44179381 / Snublestein.no – Ruth Maier',
    coordSourceId: 'wikidata:Q44179381',
    coordSourceUrl: 'https://www.wikidata.org/wiki/Q44179381',
    coordVerifiedAt: today,
    coordNote: 'Eksakt kildeobjekt for snublesteinen viet Ruth Maier, kryssjekket mot Snublestein.no og Dalsbergstien 3. Recordens tidligere tekst om en generell minnetavle er korrigert til det faktiske minnesmerket.'
  },
  inger_hagerups_plass: {
    lat: 59.9221744,
    lon: 10.853756,
    year: 1994,
    locatorType: 'square',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikidata:Q19347867',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikidata Q19347867 / Lokalhistoriewiki – Inger Hagerups plass',
    coordSourceId: 'wikidata:Q19347867',
    coordSourceUrl: 'https://www.wikidata.org/wiki/Q19347867',
    coordVerifiedAt: today,
    coordNote: 'Navngitt plass/snuplass innerst i Hagapynten på Haugerud. Wikidata-punktet samsvarer med Lokalhistoriewikis stedsangivelse; året er korrigert til 1994, da navnet ble offisielt fastsatt.'
  }
};

const metadataFields = [
  'name','lat','lon','r','year','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy',
  'coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote'
];

for (const [id, patch] of Object.entries(patches)) {
  const place = byId.get(id);
  Object.assign(place, patch);
  const splitPath = path.join(splitDir, `${id}.json`);
  const split = readJson(splitPath);
  Object.assign(split, patch);
  writeJson(splitPath, split);
  const idx = categoryIndex.find((row) => row?.id === id);
  if (!idx) throw new Error(`Mangler litteratur-indexrad for ${id}`);
  for (const field of metadataFields) {
    if (Object.prototype.hasOwnProperty.call(split, field)) idx[field] = split[field];
    else delete idx[field];
  }
}

Object.assign(movedAlf, {
  lat: 60.04401205900787,
  lon: 10.880400225286696,
  fylke: 'Akershus',
  kommune: 'Nittedal',
  desc: 'En bronsefigur av Alf Prøysen som tidligere sto ved Oslo Spektrum og ble flyttet til kulturhuset Flammen i Nittedal i 2019.',
  popupDesc: 'Alf Prøysen-statuen ved kulturhuset Flammen knytter den folkekjære visedikteren og fortelleren til et aktivt litteratur- og kulturmiljø i Nittedal. Statuen ble flyttet hit fra Oslo i 2019. Det eksakte sokkelpunktet er ennå ikke kildeverifisert; kartpunktet er derfor et foreløpig site-anchor for Flammen, ikke et godkjent monumentpunkt.',
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:3232:2380:3',
  address: { street: 'Borghild Ruds vei', number: '3', postcode: '1482', city: 'Nittedal', country: 'NO' },
  geocodeAccuracy: 'rooftop',
  coordRole: 'site_center',
  coordType: 'address_point',
  coordStatus: 'needs_manual_visual_qa',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:3232:2380:3',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Borghild%20Ruds%20vei%203%20Nittedal',
  coordVerifiedAt: today,
  coordNote: 'Posten er flyttet ut av Oslo til Nittedal. Geonorge-punktet markerer kulturhuset Flammen som foreløpig site-anchor fordi kildene plasserer statuen ved kulturhuset, men exact statue/sokkel-geometri er ikke identifisert. Status er derfor needs_manual_visual_qa, ikke verified.'
});

Object.assign(movedProysen, {
  lat: 60.9121822,
  lon: 10.7912923,
  fylke: 'Innlandet',
  kommune: 'Ringsaker',
  locatorType: 'building',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:319658476',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'building_center',
  coordType: 'building_center',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 319658476 – Prøysenhuset',
  coordSourceId: 'osm-way:319658476',
  coordSourceUrl: 'https://www.openstreetmap.org/way/319658476',
  coordVerifiedAt: today,
  coordNote: 'Posten er flyttet ut av Oslo til Ringsaker. Det navngitte OSM-museumsbygget Prøysenhuset er kryssjekket mot Prøysenhusets offisielle besøksadresse Prestvegen 1, 2360 Rudshøgda og brukes som building-center.'
});

const movedIds = new Set(['alf_proysen_statue_nittedal', 'proysenhuset_rudshogda']);
const newAggregate = aggregate.filter((p) => !movedIds.has(p.id));
const newIndex = categoryIndex.filter((p) => !movedIds.has(p.id));
writeJson(aggregatePath, newAggregate);
writeJson(categoryIndexPath, newIndex);

for (const id of movedIds) {
  const childPath = path.join(splitDir, `${id}.json`);
  if (fs.existsSync(childPath)) fs.unlinkSync(childPath);
}

splitManifest.places = splitManifest.places
  .filter((row) => !movedIds.has(row.id))
  .map((row, order) => ({ ...row, order }));
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256File(aggregatePath);
splitManifest.generated_at = new Date().toISOString();
for (const row of splitManifest.places) {
  const child = path.join(path.dirname(splitManifestPath), row.file);
  if (!fs.existsSync(child)) throw new Error(`Split manifest peker på manglende fil ${row.file}`);
  row.sha256 = sha256File(child);
}
writeJson(splitManifestPath, splitManifest);

const alfDestRel = 'places/litteratur/akershus/alf_proysen_statue_nittedal.json';
const proysenDestRel = 'places/litteratur/innlandet/proysenhuset_rudshogda.json';
writeJson(path.join(root, 'data', alfDestRel), movedAlf);
writeJson(path.join(root, 'data', proysenDestRel), movedProysen);

function insertBeforeOsloLiterature(rel) {
  if (topManifest.files.includes(rel)) return;
  const oslo = 'places/litteratur/oslo/places_litteratur.json';
  const i = topManifest.files.indexOf(oslo);
  if (i < 0) throw new Error('Fant ikke Oslo litteraturkilden i top manifest');
  topManifest.files.splice(i, 0, rel);
}
if (!topManifest.files.includes(proysenDestRel)) {
  const after = topManifest.files.indexOf('places/litteratur/innlandet/proysenstua_rudshogda.json');
  if (after >= 0) topManifest.files.splice(after + 1, 0, proysenDestRel);
  else insertBeforeOsloLiterature(proysenDestRel);
}
if (!topManifest.files.includes(alfDestRel)) insertBeforeOsloLiterature(alfDestRel);
writeJson(topManifestPath, topManifest);

const activePlaces = new Map(newAggregate.map((p) => [p.id, p]));
activePlaces.set(movedAlf.id, movedAlf);
activePlaces.set(movedProysen.id, movedProysen);
const snapshot = (p) => ({
  lat: p?.lat ?? null, lon: p?.lon ?? null, r: p?.r ?? null,
  coordStatus: p?.coordStatus ?? '', coordSource: p?.coordSource ?? '', coordType: p?.coordType ?? '', coordNote: p?.coordNote ?? ''
});

const evidenceSpecs = {
  kulturkirken_jakob_litteratur: {
    path: 'oslo/litteratur/kulturkirken_jakob_litteratur.json', status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json', resolved: 'Kulturkirken Jakob i Hausmanns gate 14', locator: 'building',
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Hausmanns%20gate%2014%20Oslo', sourceObjectId: 'geonorge-adresser-v1:0301:12782:14', sourceQuality: 'official_address', finding: 'Geonorge gir ett eksakt treff for Hausmanns gate 14.', canVerifyCoordinate: true, reason: 'Konkret bygg med dokumentert adresse.' },
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Kulturkirken Jakob', sourceUrl: 'https://www.openstreetmap.org/way/44044595', sourceObjectId: 'osm-way:44044595', sourceQuality: 'named_object_crosscheck', finding: 'OSM way 44044595 er eksplisitt navngitt Kulturkirken Jakob og ligger på samme bygg.', canVerifyCoordinate: true, reason: 'Uavhengig fysisk identitetskryssjekk.' }
    ]
  },
  norli_universitetsgata: {
    path: 'oslo/litteratur/norli_universitetsgata.json', status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json', resolved: 'Norli Universitetsgata, bokhandel med offisiell adresse Universitetsgata 22–24', locator: 'poi',
    evidence: [
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Norli', sourceUrl: 'https://www.openstreetmap.org/node/1664967174', sourceObjectId: 'osm-node:1664967174', sourceQuality: 'named_poi_geometry', finding: 'OSM node 1664967174 er et eksplisitt navngitt bokhandel-POI for Norli i Universitetsgata.', canVerifyCoordinate: true, reason: 'POI-et løser 22/24-tvetydigheten uten å velge husnummer tilfeldig.' },
      { sourceProvider: 'manual_research', sourceName: 'Norli – Om oss', sourceUrl: 'https://www.norli.no/kundeservice/omoss', sourceObjectId: 'norli:universitetsgata:22-24', sourceQuality: 'official_institution_address', finding: 'Norli oppgir Universitetsgata 22–24 som adresse og dokumenterer bokhandelshistorien fra 1890.', canVerifyCoordinate: true, reason: 'Offisiell institusjonskilde bekrefter identitet og adresseintervall.' }
    ]
  },
  sigrid_undset_statue: {
    path: 'oslo/litteratur/sigrid_undset_statue.json', status: 'needs_research', decision: 'needs_geometry',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json', resolved: 'Sigrid Undset-statuen i Stensparken, avduket i 1991', locator: 'poi',
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Stensparken', sourceUrl: 'https://oslobyleksikon.no/side/Stensparken', sourceObjectId: 'oslobyleksikon:stensparken:sigrid-undset', sourceQuality: 'documented_monument_identity', finding: 'Kilden dokumenterer Sigrid Undset-statuen i Stensparken og avduking i 1991.', canVerifyCoordinate: false, reason: 'Kilden dokumenterer park og historie, men ikke et eksakt maskinsporbar statuepunkt.' },
      { sourceProvider: 'osm', sourceName: 'OSM artwork audit around Stensparken', sourceUrl: 'https://www.openstreetmap.org/', sourceObjectId: 'osm-audit:stensparken-artworks', sourceQuality: 'negative_object_match', finding: 'Objektauditen fant flere anonyme statue-/kunstobjekter, men ingen entydig navngitt Sigrid Undset-geometri.', canVerifyCoordinate: false, reason: 'Et anonymt nærliggende statuepunkt kan ikke identifiseres ved nærhet alene.' }
    ]
  },
  ruth_maier_minne: {
    path: 'oslo/litteratur/ruth_maier_minne.json', status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json', resolved: 'snublesteinen viet Ruth Maier utenfor Dalsbergstien 3', locator: 'poi',
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Wikidata – Stolperstein dedicated to Ruth Maier', sourceUrl: 'https://www.wikidata.org/wiki/Q44179381', sourceObjectId: 'wikidata:Q44179381', sourceQuality: 'named_memorial_geometry', finding: 'Wikidata Q44179381 identifiserer den konkrete snublesteinen og gir monumentpunktet.', canVerifyCoordinate: true, reason: 'Eksplisitt monumentobjekt.' },
      { sourceProvider: 'manual_research', sourceName: 'Snublestein.no – Ruth Maier', sourceUrl: 'https://www.snublestein.no/Ruth-Maier/p%3D92/', sourceObjectId: 'snublestein:ruth-maier:dalsbergstien-3', sourceQuality: 'official_project_crosscheck', finding: 'Snublestein.no oppgir Dalsbergstien 3, Oslo.', canVerifyCoordinate: true, reason: 'Prosjektkilden kryssjekker identitet og adresse.' }
    ]
  },
  alf_proysen_statue_nittedal: {
    path: 'akershus/nittedal/alf_proysen_statue_nittedal.json', status: 'needs_research', decision: 'needs_geometry',
    placeFile: `data/${alfDestRel}`, resolved: 'Alf Prøysen-statuen ved kulturhuset Flammen i Nittedal', locator: 'building',
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Borghild%20Ruds%20vei%203%20Nittedal', sourceObjectId: 'geonorge-adresser-v1:3232:2380:3', sourceQuality: 'official_host_address', finding: 'Geonorge plasserer Borghild Ruds vei 3 i Nittedal, Akershus.', canVerifyCoordinate: false, reason: 'Adressepunktet dokumenterer kulturhuset Flammen som foreløpig host/site-anchor, ikke statue-sokkelen.' }
    ]
  },
  proysenhuset_rudshogda: {
    path: 'innlandet/ringsaker/proysenhuset_rudshogda.json', status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    placeFile: `data/${proysenDestRel}`, resolved: 'Prøysenhuset på Rudshøgda i Ringsaker', locator: 'building',
    evidence: [
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Prøysenhuset', sourceUrl: 'https://www.openstreetmap.org/way/319658476', sourceObjectId: 'osm-way:319658476', sourceQuality: 'named_museum_geometry', finding: 'OSM way 319658476 er det eksplisitt navngitte museumsbygget Prøysenhuset.', canVerifyCoordinate: true, reason: 'Navngitt museumsbygg.' },
      { sourceProvider: 'manual_research', sourceName: 'Prøysenhuset – offisiell besøksadresse', sourceUrl: 'https://www.proysenhuset.no/', sourceObjectId: 'proysenhuset:prestvegen-1', sourceQuality: 'official_institution_address', finding: 'Prøysenhuset oppgir Prestvegen 1, 2360 Rudshøgda som besøksadresse.', canVerifyCoordinate: true, reason: 'Offisiell kilde kryssjekker at museumsobjektet ligger i Ringsaker.' }
    ]
  },
  inger_hagerups_plass: {
    path: 'oslo/litteratur/inger_hagerups_plass.json', status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json', resolved: 'Inger Hagerups plass, snuplassen innerst i Hagapynten på Haugerud', locator: 'square',
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Wikidata – Inger Hagerups plass', sourceUrl: 'https://www.wikidata.org/wiki/Q19347867', sourceObjectId: 'wikidata:Q19347867', sourceQuality: 'named_place_geometry', finding: 'Wikidata Q19347867 identifiserer Inger Hagerups plass i Oslo med koordinatpunkt.', canVerifyCoordinate: true, reason: 'Eksplisitt navngitt plassobjekt.' },
      { sourceProvider: 'manual_research', sourceName: 'Lokalhistoriewiki – Inger Hagerups plass', sourceUrl: 'https://lokalhistoriewiki.no/wiki/Inger_Hagerups_plass', sourceObjectId: 'lokalhistoriewiki:inger-hagerups-plass', sourceQuality: 'local_history_crosscheck', finding: 'Kilden plasserer plassen innerst i Hagapynten og oppgir at navnet ble offisielt fastsatt i 1994.', canVerifyCoordinate: true, reason: 'Kryssjekker fysisk identitet og år.' }
    ]
  }
};

for (const [id, spec] of Object.entries(evidenceSpecs)) {
  const place = activePlaces.get(id);
  const applied = spec.status === 'applied_to_place';
  const evidence = {
    placeId: id,
    placeFile: spec.placeFile,
    evidenceStatus: spec.status,
    coordinateDecision: spec.decision,
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: spec.resolved,
      identityStatus: applied ? 'resolved' : 'conflict',
      identityProblem: applied ? '' : (id === 'sigrid_undset_statue' ? 'Eksakt statueobjekt er ikke identifisert.' : 'Eksakt statue-/sokkelgeometri er ikke identifisert.'),
      locatorTypeCandidate: spec.locator,
      requiresSplit: false,
      splitReason: id === 'alf_proysen_statue_nittedal' ? 'Posten er flyttet fra Oslo til Nittedal; koordinaten er fortsatt foreløpig.' : id === 'proysenhuset_rudshogda' ? 'Posten er flyttet fra Oslo til Ringsaker.' : ''
    },
    requiredEvidence: applied ? ['sporbar fysisk identitet', 'stabilt kildeobjekt'] : ['eksakt monumentobjekt eller dokumentert sokkelpunkt'],
    evidence: spec.evidence,
    addressCandidates: spec.evidence.filter((e) => e.sourceProvider === 'official_address').map((e) => ({ sourceProvider: e.sourceProvider, sourceObjectId: e.sourceObjectId, canApplyToPlace: applied && e.canVerifyCoordinate })),
    sourceObjectCandidates: spec.evidence.map((e) => ({ sourceProvider: e.sourceProvider, sourceObjectId: e.sourceObjectId, canApplyToPlace: applied && e.canVerifyCoordinate })),
    geometryCandidates: [],
    coordinateCandidates: applied ? [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }] : [],
    decision: {
      canBecomeVerified: applied,
      blockedReason: applied ? '' : (id === 'sigrid_undset_statue' ? 'Ingen entydig navngitt statuegeometri.' : 'Kulturhuset er lokalisert, men exact statue/sokkel-punkt mangler.'),
      nextAction: applied ? 'Koordinatkontrakt anvendt på canonical place.' : 'Finn et eksplisitt monumentobjekt eller dokumentert sokkelpunkt før verified-status.'
    },
    notes: [applied ? 'Koordinatkontrakt anvendt i batch 29.' : 'Ingen eksakt monumentkoordinat godkjent i batch 29.']
  };
  writeJson(path.join(evidenceRoot, spec.path), evidence);
}

const evidenceManifest = readJson(evidenceManifestPath);
for (const spec of Object.values(evidenceSpecs)) {
  if (!evidenceManifest.files.includes(spec.path)) evidenceManifest.files.push(spec.path);
}
writeJson(evidenceManifestPath, evidenceManifest);

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo koordinatkontroll – batch 29\n\nDato: 2026-07-19\n\nKontroll 175–181 behandler de første sju ukontrollerte recordene i litteratur-manifestet. Fire Oslo-steder får nye godkjente ankere, én Oslo-record avsluttes som needs_review, og to feilplasserte Prøysen-records flyttes til korrekt fylke/kommune.\n\n| placeId | resultat | kilde / flytting |\n|---|---|---|\n| \`kulturkirken_jakob_litteratur\` | verified | \`geonorge-adresser-v1:0301:12782:14\` |\n| \`norli_universitetsgata\` | verified_geometry | \`osm-node:1664967174\` |\n| \`sigrid_undset_statue\` | needs_review | eksakt monumentobjekt mangler; år korrigert til 1991 |\n| \`ruth_maier_minne\` | verified_geometry | \`wikidata:Q44179381\`; tekst korrigert til snublestein |\n| \`alf_proysen_statue_nittedal\` | moved to Akershus/Nittedal; needs_manual_visual_qa | Flammen-adresse som foreløpig site-anchor |\n| \`proysenhuset_rudshogda\` | moved to Innlandet/Ringsaker; verified_geometry | \`osm-way:319658476\` |\n| \`inger_hagerups_plass\` | verified_geometry | \`wikidata:Q19347867\`; år korrigert til 1994 |\n`);

let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 146 verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 150 verifiserte eller kildekontrollerte canonical steder. Batch 29 godkjenner fire nye Oslo-ankere, avslutter Sigrid Undset-statuen som `needs_review`, og flytter to Prøysen-records ut av Oslo til korrekt kommune. Antallet fullførte Oslo-kontroller uten godkjent Oslo-koordinat er nå 31.'
);
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 146 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 150 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);

const tableAnchor = '| 28 | `christiania_torv` | Christiania Torv | verified_geometry | `osm-way:594329484` |';
if (!protocol.includes('| 29 | `kulturkirken_jakob_litteratur`')) {
  if (!protocol.includes(tableAnchor)) throw new Error('Mangler batch 28 tabellanker');
  protocol = protocol.replace(tableAnchor, `${tableAnchor}\n| 29 | \`kulturkirken_jakob_litteratur\` | Kulturkirken Jakob – litterær scene | verified | \`geonorge-adresser-v1:0301:12782:14\` |\n| 29 | \`norli_universitetsgata\` | Norli Universitetsgata | verified_geometry | \`osm-node:1664967174\` |\n| 29 | \`ruth_maier_minne\` | Ruth Maier-minnesmerke | verified_geometry | \`wikidata:Q44179381\` |\n| 29 | \`inger_hagerups_plass\` | Inger Hagerups plass | verified_geometry | \`wikidata:Q19347867\` |`);
}

const needsAnchor = '| `akerselva_industri` – Akerselva industriområde | needs_review | Recorden beskriver en lang industrikorridor som overlapper canonical `akerselva` og flere separate industriplaces; ett punkt kan ikke representere hele systemet. | Legg inn lineær geometri/flere anchors eller modeller som tematisk relation til Akerselva og konkrete industristeder. |';
const sigridRow = '| `sigrid_undset_statue` – Sigrid Undset-statuen | needs_review | Kildene dokumenterer statuen i Stensparken og avduking i 1991, men objektauditen fant ingen entydig navngitt monumentgeometri; anonyme statuepunkter kan ikke velges ved nærhet alene. | Finn eksplisitt monumentobjekt eller dokumentert sokkelpunkt før verified-status; legacy-punktet er merket needs_manual_visual_qa. |';
if (!protocol.includes(sigridRow)) {
  if (!protocol.includes(needsAnchor)) throw new Error('Mangler needs_review-anker');
  protocol = protocol.replace(needsAnchor, `${needsAnchor}\n${sigridRow}`);
}

const movedSection = `### Kontroller fra Oslo-køen flyttet til korrekt kommune\n\nDisse recordene kom fra en Oslo-kilde, men kontrollen dokumenterte at de tilhører andre kommuner. De teller derfor ikke som verifiserte Oslo-steder.\n\n| batch | placeId | korrekt plassering | status | kildeobjekt / oppfølging |\n|---:|---|---|---|---|\n| 29 | \`alf_proysen_statue_nittedal\` | Akershus / Nittedal | needs_manual_visual_qa | \`geonorge-adresser-v1:3232:2380:3\` er foreløpig Flammen-site-anchor; exact statuepunkt mangler |\n| 29 | \`proysenhuset_rudshogda\` | Innlandet / Ringsaker | verified_geometry | \`osm-way:319658476\` |\n\n`;
if (!protocol.includes('### Kontroller fra Oslo-køen flyttet til korrekt kommune')) {
  const marker = '## Etne – historiesett\n';
  if (!protocol.includes(marker)) throw new Error('Mangler Etne-seksjonsanker');
  protocol = protocol.replace(marker, `${movedSection}${marker}`);
}

protocol = protocol.replace('- Neste nye Oslo-kontroll er nummer 175 og starter batch 29.', '- Neste nye Oslo-kontroll er nummer 182 og starter batch 30.');
protocol = protocol.replace('- Batch 28 er fullført med to nye godkjente plassankere; `places_by_manifest.json` er nå ferdig kontrollert.', '- Batch 29 er fullført med fire nye godkjente Oslo-ankere, ett nytt `needs_review`-utfall og to records flyttet til korrekt kommune.');
protocol = protocol.replace('- By-manifestet er uttømt etter `christiania_torv`. Før batch 29 starter skal neste aktive sekundære Oslo-kildekø auditeres eksplisitt mot top-level manifestrekkefølgen; ikke gjett neste kategori.', '- Litteratur-manifestet har to ukontrollerte Oslo-records igjen etter batch 29: `oscar_braaten_statuen` og `alexander_kiellands_plass`. Batch 30 avslutter denne køen før neste sekundære kilde velges eksplisitt.');
fs.writeFileSync(protocolPath, protocol);

console.log('Batch 29 applied: 4 verified Oslo anchors, 1 Oslo needs_review, 2 records moved to correct municipalities.');
