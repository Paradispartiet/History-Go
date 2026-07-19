import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const today = '2026-07-19';
const aggregatePath = path.join(root, 'data/places/litteratur/oslo/places_litteratur.json');
const splitDir = path.join(root, 'data/places/litteratur/oslo/places_litteratur');
const categoryIndexPath = path.join(root, 'data/places/litteratur/oslo/places_litteratur_index.json');
const splitManifestPath = path.join(root, 'data/places/litteratur/oslo/places_litteratur_manifest.json');
const splitReportPath = path.join(root, 'data/places/litteratur/oslo/places_litteratur_split_report.txt');
const topManifestPath = path.join(root, 'data/places/manifest.json');
const evidenceRoot = path.join(root, 'data/coordinate-evidence');
const evidenceManifestPath = path.join(evidenceRoot, 'manifest.json');
const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-29-v3');
const resultDir = path.join(reportDir, 'address-results');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256Text = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function readVerifiedResult(id) {
  const result = readJson(path.join(resultDir, `${id}.json`));
  if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
    throw new Error(`${id}: expected verified_candidate, got ${result.status}`);
  }
  return result;
}

const geo = {
  kulturkirken_jakob_litteratur: readVerifiedResult('kulturkirken_jakob_litteratur'),
  ruth_maier_minne: readVerifiedResult('ruth_maier_minne'),
  proysenhuset_rudshogda: readVerifiedResult('proysenhuset_rudshogda'),
  alf_proysen_statue_nittedal: readVerifiedResult('alf_proysen_statue_nittedal'),
  norli22: readVerifiedResult('norli_universitetsgata_22'),
  norli24: readVerifiedResult('norli_universitetsgata_24'),
};
const norliRange = readJson(path.join(resultDir, 'norli_universitetsgata.json'));
if (norliRange.ok || norliRange.status !== 'not_found') {
  throw new Error('Norli range query should remain unresolved; refusing to choose an endpoint implicitly.');
}
if (geo.norli22.sourceObjectId === geo.norli24.sourceObjectId) {
  throw new Error('Norli endpoints unexpectedly resolve to the same address object.');
}

const aggregate = readJson(aggregatePath);
const categoryIndex = readJson(categoryIndexPath);
const splitManifest = readJson(splitManifestPath);
const topManifest = readJson(topManifestPath);
const byId = new Map(aggregate.map((place) => [place.id, place]));
const batchIds = [
  'kulturkirken_jakob_litteratur',
  'norli_universitetsgata',
  'sigrid_undset_statue',
  'ruth_maier_minne',
  'alf_proysen_statue_nittedal',
  'proysenhuset_rudshogda',
  'inger_hagerups_plass',
];
for (const id of batchIds) {
  if (!byId.has(id)) throw new Error(`Missing batch 29 place ${id}`);
}

function applyAddress(place, result, overrides = {}) {
  const c = result.coordinate;
  Object.assign(place, {
    lat: c.lat,
    lon: c.lon,
    r: c.r,
    locatorType: overrides.locatorType ?? c.locatorType,
    sourceProvider: 'official_address',
    sourceObjectId: result.sourceObjectId,
    address: c.address,
    geocodeAccuracy: c.geocodeAccuracy,
    coordRole: overrides.coordRole ?? c.coordRole,
    coordType: c.coordType,
    coordStatus: overrides.coordStatus ?? c.coordStatus,
    coordSource: c.coordSource,
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: today,
    coordNote: overrides.coordNote ?? c.coordNote,
  });
  delete place.coordPrecisionM;
}

const jakob = byId.get('kulturkirken_jakob_litteratur');
applyAddress(jakob, geo.kulturkirken_jakob_litteratur, {
  coordNote: 'Offisiell Geonorge-adressekoordinat for Hausmanns gate 14, dokumentert av Kulturkirken JAKOB som besøksadresse. Punktet representerer selve kulturkirken og erstatter det tidligere omtrentlige legacy-punktet.',
});

const ruth = byId.get('ruth_maier_minne');
applyAddress(ruth, geo.ruth_maier_minne, {
  locatorType: 'poi',
  coordRole: 'display_marker',
  coordNote: 'Offisiell Geonorge-adressekoordinat for Dalsbergstien 3 brukes som dokumentert adresseanker for Ruth Maiers snublestein. Snublestein.no knytter minnesmerket eksplisitt til Dalsbergstien 3; punktet er et adresseanker for minnesmerket, ikke en påstand om millimeterpresis steinplassering.',
});
ruth.desc = 'Snublesteinen ved Dalsbergstien 3 minnes Ruth Maier, den østerriksk-jødiske flyktningen og dagbokforfatteren som ble deportert fra Norge og drept i Auschwitz i 1942.';
ruth.popupDesc = 'Snublesteinen ved Dalsbergstien 3 markerer adressen der Ruth Maier bodde før hun ble arrestert og deportert i november 1942. Minnestedet knytter hennes dagbøker, dikt og vennskap med Gunvor Hofmo til et konkret sted i Oslo og gjør den europeiske jødeforfølgelsen synlig i byens hverdagsrom.';

const norli = byId.get('norli_universitetsgata');
Object.assign(norli, {
  locatorType: 'building',
  sourceProvider: 'manual_research',
  sourceObjectId: 'norli:universitetsgata:22-24',
  geocodeAccuracy: 'unknown',
  coordRole: 'display_marker',
  coordType: 'legacy_unverified',
  coordStatus: 'needs_source',
  coordSource: 'official_address_range_unresolved',
  coordSourceId: 'norli:universitetsgata:22-24',
  coordSourceUrl: 'https://www.norli.no/kundeservice/omoss',
  coordVerifiedAt: today,
  coordNote: 'Norli oppgir Universitetsgata 22–24 som offisiell adresse. Repoets Geonorge-finder gir separate entydige adressepunkter for 22 og 24, mens intervallsøket ikke gir ett treff. Ingen av endepunktene velges vilkårlig; eksisterende lat/lon beholdes kun som legacy inntil en kilde identifiserer butikkens konkrete inngang/hovedanker.',
});

const sigrid = byId.get('sigrid_undset_statue');
Object.assign(sigrid, {
  year: 1991,
  desc: 'Sigrid Undset-skulpturen i Stensparken, utført av Kjersti Wexelsen Goksøyr og avduket i 1991 til minne om forfatteren og nobelprisvinneren.',
  locatorType: 'poi',
  sourceProvider: 'manual_research',
  sourceObjectId: 'oslo-kommune:stensparken:sigrid-undset-skulptur',
  geocodeAccuracy: 'unknown',
  coordRole: 'display_marker',
  coordType: 'unverified_monument_point',
  coordStatus: 'needs_source',
  coordSource: 'manual_research',
  coordSourceId: 'oslo-kommune:stensparken:sigrid-undset-skulptur',
  coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/',
  coordVerifiedAt: today,
  coordNote: 'Oslo kommune dokumenterer Sigrid Undsets skulptur i Stensparken, og lokalhistorisk kilde dokumenterer avduking i 1991. Ingen konkret adresse eller entydig maskinsporbar sokkelkoordinat er dokumentert i denne passeringen; eksisterende lat/lon er derfor ikke godkjent som verified.',
});

const inger = byId.get('inger_hagerups_plass');
Object.assign(inger, {
  year: 1999,
  locatorType: 'square',
  sourceProvider: 'manual_research',
  sourceObjectId: 'oslobyleksikon:inger-hagerups-plass',
  geocodeAccuracy: 'unknown',
  coordRole: 'area_anchor',
  coordType: 'legacy_unverified',
  coordStatus: 'needs_source',
  coordSource: 'manual_research',
  coordSourceId: 'oslobyleksikon:inger-hagerups-plass',
  coordSourceUrl: 'https://oslobyleksikon.no/side/Inger_Hagerups_plass',
  coordVerifiedAt: today,
  coordNote: 'Oslo byleksikon dokumenterer Inger Hagerups plass som snuplassen i enden av Hagapynten og at navnet ble gitt i 1999. Kilden gir ikke ett konkret adressepunkt eller en offisiell plassgeometri; eksisterende lat/lon beholdes kun som legacy og godkjennes ikke som verified.',
});

const movedAlf = structuredClone(byId.get('alf_proysen_statue_nittedal'));
applyAddress(movedAlf, geo.alf_proysen_statue_nittedal, {
  locatorType: 'poi',
  coordRole: 'site_center',
  coordStatus: 'needs_manual_visual_qa',
  coordNote: 'Geonorge-adressepunktet for Borghild Ruds vei 3 markerer Kulturverket Flammen, som er dokumentert vertssted for Alf Prøysen-monumentet. Nittedal kommunes kunstdatabase plasserer skulpturen utenfor nedre inngang, men denne passeringen har ikke et eksakt sokkelpunkt; koordinaten er derfor et foreløpig host/site-anchor og ikke verified.',
});
Object.assign(movedAlf, {
  name: 'Alf Prøysen-monumentet – Kulturverket Flammen',
  year: 2001,
  fylke: 'Akershus',
  kommune: 'Nittedal',
  desc: 'Sivert Donalis bronse- og granittskulptur «Trubaduren (Alf Prøysen)», avduket i Nittedal i 2001 og i dag plassert ved Kulturverket Flammen.',
  popupDesc: 'Alf Prøysen-monumentet «Trubaduren» er laget av Sivert Donali og står ved Kulturverket Flammen i Nittedal, der kommunens kunstdatabase plasserer det utenfor nedre inngang. Prøysen bodde store deler av sitt voksne liv i Nittedal. Kartpunktet i History Go er foreløpig kulturhusets dokumenterte adresseanker; det skal ikke tolkes som et eksakt verifisert sokkelpunkt før monumentets egen koordinat er dokumentert.',
});

const movedProysen = structuredClone(byId.get('proysenhuset_rudshogda'));
applyAddress(movedProysen, geo.proysenhuset_rudshogda, {
  coordNote: 'Offisiell Geonorge-adressekoordinat for Prøysenhuset på Prestvegen 1, Rudshøgda, dokumentert av Prøysenhuset som besøksadresse. Recorden er samtidig flyttet ut av Oslo-kilden til Innlandet/Ringsaker.',
});
Object.assign(movedProysen, {
  fylke: 'Innlandet',
  kommune: 'Ringsaker',
});

const movedIds = new Set(['alf_proysen_statue_nittedal', 'proysenhuset_rudshogda']);
const newAggregate = aggregate.filter((place) => !movedIds.has(place.id));
const newIndex = categoryIndex.filter((row) => !movedIds.has(row.id));

const metadataFields = [
  'name', 'lat', 'lon', 'r', 'year', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource', 'coordSourceId',
  'coordSourceUrl', 'coordVerifiedAt', 'coordNote',
];
for (const id of ['kulturkirken_jakob_litteratur', 'norli_universitetsgata', 'sigrid_undset_statue', 'ruth_maier_minne', 'inger_hagerups_plass']) {
  const place = byId.get(id);
  writeJson(path.join(splitDir, `${id}.json`), place);
  const idx = newIndex.find((row) => row?.id === id);
  if (!idx) throw new Error(`Missing literature index row for ${id}`);
  for (const field of metadataFields) {
    if (Object.prototype.hasOwnProperty.call(place, field)) idx[field] = place[field];
    else delete idx[field];
  }
}
writeJson(aggregatePath, newAggregate);
writeJson(categoryIndexPath, newIndex);
for (const id of movedIds) {
  const child = path.join(splitDir, `${id}.json`);
  if (fs.existsSync(child)) fs.unlinkSync(child);
}

splitManifest.places = splitManifest.places
  .filter((row) => !movedIds.has(row.id))
  .map((row, order) => ({ ...row, order }));
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256File(aggregatePath);
splitManifest.generated_at = new Date().toISOString();
for (const row of splitManifest.places) {
  const child = path.join(path.dirname(splitManifestPath), row.file);
  if (!fs.existsSync(child)) throw new Error(`Split manifest points to missing ${row.file}`);
  row.sha256 = sha256File(child);
}
writeJson(splitManifestPath, splitManifest);

const splitReport = [
  'places_litteratur split report',
  '',
  'Source: data/places/litteratur/oslo/places_litteratur.json',
  `Source sha256: ${sha256File(aggregatePath)}`,
  `Generated at: ${new Date().toISOString()}`,
  '',
  'Result:',
  `- Place files created: ${splitManifest.place_count}`,
  '- Directory: places_litteratur/',
  '- Manifest: places_litteratur_manifest.json',
  '- Lightweight index: places_litteratur_index.json',
  '',
  'Validation:',
  '- JSON parsed: yes',
  '- Source is array: yes',
  '- Missing place ids: 0',
  '- Duplicate ids: 0',
  '- Existing aggregate source left unchanged: no; batch 29 moved two non-Oslo records to correct county files',
  '',
].join('\n');
fs.writeFileSync(splitReportPath, `${splitReport}\n`);

const alfDestRel = 'places/litteratur/akershus/alf_proysen_statue_nittedal.json';
const proysenDestRel = 'places/litteratur/innlandet/proysenhuset_rudshogda.json';
writeJson(path.join(root, 'data', alfDestRel), movedAlf);
writeJson(path.join(root, 'data', proysenDestRel), movedProysen);

function insertBefore(rel, beforeRel) {
  if (topManifest.files.includes(rel)) return;
  const index = topManifest.files.indexOf(beforeRel);
  if (index < 0) throw new Error(`Cannot find manifest insertion anchor ${beforeRel}`);
  topManifest.files.splice(index, 0, rel);
}
if (!topManifest.files.includes(alfDestRel)) {
  insertBefore(alfDestRel, 'places/litteratur/oslo/places_litteratur.json');
}
if (!topManifest.files.includes(proysenDestRel)) {
  const after = topManifest.files.indexOf('places/litteratur/innlandet/proysenstua_rudshogda.json');
  if (after >= 0) topManifest.files.splice(after + 1, 0, proysenDestRel);
  else insertBefore(proysenDestRel, 'places/litteratur/oslo/places_litteratur.json');
}
writeJson(topManifestPath, topManifest);

const activePlaces = new Map(newAggregate.map((place) => [place.id, place]));
activePlaces.set(movedAlf.id, movedAlf);
activePlaces.set(movedProysen.id, movedProysen);
const snapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? '',
});

const evidenceSpecs = {
  kulturkirken_jakob_litteratur: {
    path: 'oslo/litteratur/kulturkirken_jakob_litteratur.json',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    resolved: 'Kulturkirken Jakob i Hausmanns gate 14', locator: 'building',
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: geo.kulturkirken_jakob_litteratur.sourceUrl, sourceObjectId: geo.kulturkirken_jakob_litteratur.sourceObjectId, sourceQuality: 'official_address', finding: 'Geonorge ga ett entydig verified_candidate for Hausmanns gate 14.', canVerifyCoordinate: true, reason: 'Konkret bygg med dokumentert besøksadresse.' },
      { sourceProvider: 'manual_research', sourceName: 'Kulturkirken JAKOB – Praktisk info/adkomst', sourceUrl: 'https://www.jakob.no/om-jakob/praktisk/adkomst', sourceObjectId: 'kulturkirken-jakob:hausmanns-gate-14', sourceQuality: 'official_institution_address', finding: 'Kulturkirken JAKOB oppgir at kirken ligger i Hausmanns gate 14.', canVerifyCoordinate: true, reason: 'Offisiell institusjonskilde kobler place-identiteten til adressen.' },
    ],
  },
  norli_universitetsgata: {
    path: 'oslo/litteratur/norli_universitetsgata.json',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    status: 'needs_research', decision: 'needs_address_source',
    resolved: 'Norli Universitetsgata med offisiell adresse Universitetsgata 22–24', locator: 'building',
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Norli – Om oss', sourceUrl: 'https://www.norli.no/kundeservice/omoss', sourceObjectId: 'norli:universitetsgata:22-24', sourceQuality: 'official_institution_address', finding: 'Norli oppgir Universitetsgata 22–24 som adresse.', canVerifyCoordinate: false, reason: 'Adresseintervallet identifiserer ikke hvilket av to separate Geonorge-punkter som skal være canonical hovedanker.' },
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Universitetsgata 22', sourceUrl: geo.norli22.sourceUrl, sourceObjectId: geo.norli22.sourceObjectId, sourceQuality: 'official_address_candidate', finding: 'Universitetsgata 22 gir ett entydig adressepunkt.', canVerifyCoordinate: false, reason: 'Offisiell Norli-kilde oppgir 22–24; 22 kan ikke velges alene uten ytterligere inngangs-/hovedankerkilde.' },
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Universitetsgata 24', sourceUrl: geo.norli24.sourceUrl, sourceObjectId: geo.norli24.sourceObjectId, sourceQuality: 'official_address_candidate', finding: 'Universitetsgata 24 gir ett annet entydig adressepunkt.', canVerifyCoordinate: false, reason: 'Offisiell Norli-kilde oppgir 22–24; 24 kan ikke velges alene uten ytterligere inngangs-/hovedankerkilde.' },
    ],
  },
  sigrid_undset_statue: {
    path: 'oslo/litteratur/sigrid_undset_statue.json',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    status: 'needs_research', decision: 'needs_geometry',
    resolved: 'Sigrid Undset-skulpturen i Stensparken, avduket i 1991', locator: 'poi',
    evidence: [
      { sourceProvider: 'municipality', sourceName: 'Oslo kommune – 17. mai-bekransninger', sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/', sourceObjectId: 'oslo-kommune:stensparken:sigrid-undset-skulptur', sourceQuality: 'official_monument_identity', finding: 'Oslo kommune dokumenterer Sigrid Undsets skulptur i Stensparken.', canVerifyCoordinate: false, reason: 'Siden identifiserer park og monument, men gir ikke eksakt sokkelpunkt.' },
      { sourceProvider: 'manual_research', sourceName: 'Lokalhistoriewiki – Stensparken', sourceUrl: 'https://lokalhistoriewiki.no/wiki/Stensparken', sourceObjectId: 'lokalhistoriewiki:stensparken:sigrid-undset', sourceQuality: 'documented_monument_history', finding: 'Kilden oppgir at Kjersti Wexelsen Goksøyrs Sigrid Undset-statue ble avduket i 1991.', canVerifyCoordinate: false, reason: 'Historien er dokumentert, men eksakt monumentgeometri mangler.' },
    ],
  },
  ruth_maier_minne: {
    path: 'oslo/litteratur/ruth_maier_minne.json',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    resolved: 'Ruth Maiers snublestein ved Dalsbergstien 3', locator: 'poi',
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Snublestein.no – Ruth Maier', sourceUrl: 'https://www.snublestein.no/Ruth-Maier/p%3D92/', sourceObjectId: 'snublestein:ruth-maier:dalsbergstien-3', sourceQuality: 'official_memorial_project_address', finding: 'Snublestein.no dokumenterer Ruth Maier-minnesmerket på Dalsbergstien 3 i Oslo.', canVerifyCoordinate: true, reason: 'Prosjektkilden kobler konkret minnesmerke til konkret adresse.' },
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: geo.ruth_maier_minne.sourceUrl, sourceObjectId: geo.ruth_maier_minne.sourceObjectId, sourceQuality: 'official_address', finding: 'Geonorge ga ett entydig verified_candidate for Dalsbergstien 3.', canVerifyCoordinate: true, reason: 'Dokumentert adresseanker for minnesmerket.' },
    ],
  },
  alf_proysen_statue_nittedal: {
    path: 'akershus/nittedal/alf_proysen_statue_nittedal.json',
    placeFile: `data/${alfDestRel}`,
    status: 'needs_research', decision: 'needs_geometry',
    resolved: 'Sivert Donalis Trubaduren (Alf Prøysen) ved Kulturverket Flammen i Nittedal', locator: 'poi',
    evidence: [
      { sourceProvider: 'municipality', sourceName: 'Nittedal kommunes kunstdatabase – Trubaduren (Alf Prøysen)', sourceUrl: 'https://nittedal.nkdb.no/objekt/420000/Trubaduren%2B%28Alf%2BPr%C3%B8ysen%29', sourceObjectId: 'nittedal-nkdb:420000', sourceQuality: 'official_art_object_identity', finding: 'Kommunens kunstdatabase identifiserer verket, år 2001 og plassering utenfor nedre inngang ved Kulturverket Flammen.', canVerifyCoordinate: false, reason: 'Objektets plassering er dokumentert tekstlig, men eksakt sokkelkoordinat er ikke tilgjengelig i denne passeringen.' },
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: geo.alf_proysen_statue_nittedal.sourceUrl, sourceObjectId: geo.alf_proysen_statue_nittedal.sourceObjectId, sourceQuality: 'official_host_address', finding: 'Geonorge ga ett entydig verified_candidate for Kulturverket Flammens adresse Borghild Ruds vei 3.', canVerifyCoordinate: false, reason: 'Adressepunktet verifiserer vertsstedet, ikke monumentets sokkel.' },
    ],
  },
  proysenhuset_rudshogda: {
    path: 'innlandet/ringsaker/proysenhuset_rudshogda.json',
    placeFile: `data/${proysenDestRel}`,
    status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    resolved: 'Prøysenhuset på Prestvegen 1, Rudshøgda i Ringsaker', locator: 'building',
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Prøysenhuset – offisiell besøksadresse', sourceUrl: 'https://www.proysenhuset.no/', sourceObjectId: 'proysenhuset:prestvegen-1', sourceQuality: 'official_institution_address', finding: 'Prøysenhuset oppgir Prestvegen 1, 2360 Rudshøgda som besøksadresse.', canVerifyCoordinate: true, reason: 'Offisiell institusjonskilde kobler place-identiteten til adressen.' },
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: geo.proysenhuset_rudshogda.sourceUrl, sourceObjectId: geo.proysenhuset_rudshogda.sourceObjectId, sourceQuality: 'official_address', finding: 'Geonorge ga ett eksakt verified_candidate for Prestvegen 1 i Ringsaker.', canVerifyCoordinate: true, reason: 'Konkret museumsbygg med dokumentert adresse.' },
    ],
  },
  inger_hagerups_plass: {
    path: 'oslo/litteratur/inger_hagerups_plass.json',
    placeFile: 'data/places/litteratur/oslo/places_litteratur.json',
    status: 'needs_research', decision: 'needs_geometry',
    resolved: 'Inger Hagerups plass, snuplassen i enden av Hagapynten på Haugerud', locator: 'square',
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Inger Hagerups plass', sourceUrl: 'https://oslobyleksikon.no/side/Inger_Hagerups_plass', sourceObjectId: 'oslobyleksikon:inger-hagerups-plass', sourceQuality: 'documented_place_identity', finding: 'Kilden identifiserer plassen som snuplassen i enden av Hagapynten og oppgir at navnet ble gitt i 1999.', canVerifyCoordinate: false, reason: 'Kilden gir ikke et entydig adressepunkt eller offisiell plassgeometri.' },
    ],
  },
};

for (const [id, spec] of Object.entries(evidenceSpecs)) {
  const place = activePlaces.get(id);
  const applied = spec.status === 'applied_to_place';
  const addressEvidence = spec.evidence.filter((entry) => entry.sourceProvider === 'official_address');
  const evidence = {
    schemaVersion: '1.0',
    placeId: id,
    placeFile: spec.placeFile,
    evidenceStatus: spec.status,
    coordinateDecision: spec.decision,
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: spec.resolved,
      identityStatus: 'resolved',
      identityProblem: applied ? '' : 'Fysisk identitet er dokumentert, men batchens strenge koordinatkrav er ikke oppfylt for ett entydig canonical punkt.',
      locatorTypeCandidate: spec.locator,
      requiresSplit: false,
      splitReason: id === 'alf_proysen_statue_nittedal'
        ? 'Recorden flyttes fra Oslo til Nittedal; koordinaten forblir foreløpig host/site-anchor.'
        : id === 'proysenhuset_rudshogda'
          ? 'Recorden flyttes fra Oslo til Ringsaker og får dokumentert adresseanker.'
          : '',
    },
    requiredEvidence: applied ? ['sporbar fysisk identitet', 'entydig offisielt adresseanker'] : ['entydig canonical hovedanker eller eksakt objektgeometri'],
    evidence: spec.evidence,
    addressCandidates: addressEvidence.map((entry) => ({
      sourceProvider: entry.sourceProvider,
      sourceObjectId: entry.sourceObjectId,
      canApplyToPlace: applied && entry.canVerifyCoordinate,
    })),
    sourceObjectCandidates: spec.evidence.map((entry) => ({
      sourceProvider: entry.sourceProvider,
      sourceObjectId: entry.sourceObjectId,
      canApplyToPlace: applied && entry.canVerifyCoordinate,
    })),
    geometryCandidates: [],
    coordinateCandidates: applied ? [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }] : [],
    decision: {
      canBecomeVerified: applied,
      blockedReason: applied ? '' : place.coordNote,
      nextAction: applied
        ? 'Coordinate source contract is applied to canonical data.'
        : 'Do not promote to verified until one exact canonical anchor is documented.',
    },
    notes: [place.coordNote],
  };
  writeJson(path.join(evidenceRoot, spec.path), evidence);
}

const evidenceManifest = readJson(evidenceManifestPath);
for (const spec of Object.values(evidenceSpecs)) {
  if (!evidenceManifest.files.includes(spec.path)) evidenceManifest.files.push(spec.path);
}
writeJson(evidenceManifestPath, evidenceManifest);

let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol.replace(
  'Oslo-tabellen inneholder nå 146 verifiserte eller kildekontrollerte canonical steder. Batch 28 avslutter by-manifestet med to eksakte navngitte plassgeometrier: Bankplassen og Christiania Torv. Antallet fullførte kontroller uten godkjent Oslo-koordinat er fortsatt 30.',
  'Oslo-tabellen inneholder nå 148 verifiserte eller kildekontrollerte canonical steder. Batch 29 starter litteratur-manifestet med to nye godkjente adresseankre: Kulturkirken Jakob og Ruth Maier-minnesmerket. Tre ytterligere Oslo-records avsluttes som needs_review, mens to feilplasserte Prøysen-records flyttes ut av Oslo. Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 34.'
);
const batch28Tail = '| 28 | `christiania_torv` | Christiania Torv | verified_geometry | `osm-way:594329484` |';
if (!protocol.includes('| 29 | `kulturkirken_jakob_litteratur`')) {
  protocol = protocol.replace(batch28Tail, `${batch28Tail}\n| 29 | \`kulturkirken_jakob_litteratur\` | Kulturkirken Jakob | verified | \`${geo.kulturkirken_jakob_litteratur.sourceObjectId}\` |\n| 29 | \`ruth_maier_minne\` | Ruth Maier-minnesmerke | verified | \`${geo.ruth_maier_minne.sourceObjectId}\` |`);
}
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 146 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 148 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);
const needsHeader = '|---|---|---|---|';
const newNeedsRows = [
  '| `norli_universitetsgata` – Norli Universitetsgata | needs_review | Norli oppgir Universitetsgata 22–24. Intervallsøket gir ikke ett Geonorge-treff, mens 22 og 24 gir hvert sitt separate entydige adressepunkt. | Krever dokumentert hovedinngang eller annen kilde som velger ett konkret adresseanker; ikke velg 22 eller 24 vilkårlig. |',
  '| `sigrid_undset_statue` – Sigrid Undset-skulpturen | needs_review | Statuen er dokumentert i Stensparken og avduket i 1991, men ingen konkret adresse eller entydig sokkelkoordinat er dokumentert. | Finn eksakt monumentobjekt eller dokumentert sokkelpunkt før canonical koordinat kan godkjennes. |',
  '| `inger_hagerups_plass` – Inger Hagerups plass | needs_review | Oslo byleksikon identifiserer plassen som snuplassen i enden av Hagapynten og navn fra 1999, men gir ikke ett adressepunkt eller offisiell plassgeometri. | Hent offisiell plassgeometri eller et eksplisitt dokumentert representativt anker. |',
  '| `alf_proysen_statue_nittedal` – Alf Prøysen-monumentet ved Kulturverket Flammen | needs_review; moved to Akershus/Nittedal | Recorden lå feilaktig i Oslo-kilden. Kulturverket Flammen er dokumentert på Borghild Ruds vei 3 og kommunens kunstdatabase plasserer monumentet utenfor nedre inngang, men Geonorge-adressepunktet er ikke selve sokkelen. | Finn eksakt monument-/sokkelpunkt; behold Flammen-adressen kun som foreløpig host/site-anchor. |',
].join('\n');
if (!protocol.includes('`norli_universitetsgata` – Norli Universitetsgata')) {
  const firstNeedsRow = '| Frysja 33 / Brekke kraftstasjon |';
  protocol = protocol.replace(firstNeedsRow, `${newNeedsRows}\n${firstNeedsRow}`);
}
fs.writeFileSync(protocolPath, protocol);

fs.mkdirSync(reportDir, { recursive: true });
const readme = `# Oslo koordinatkontroll – batch 29 v3\n\nDato: ${today}\n\nDenne batchen erstatter den lukkede metodeblandede PR #2459 og følger adresse-først-regelen konsekvent.\n\n| placeId | resultat | beslutning |\n|---|---|---|\n| \`kulturkirken_jakob_litteratur\` | verified | Hausmanns gate 14 ga ett entydig Geonorge-treff. |\n| \`norli_universitetsgata\` | needs_review | Offisiell adresse er 22–24; 22 og 24 gir to separate kandidater, så ingen velges vilkårlig. |\n| \`sigrid_undset_statue\` | needs_review | Identitet og 1991 er dokumentert, men eksakt sokkelpunkt mangler. |\n| \`ruth_maier_minne\` | verified | Snublestein.no dokumenterer Dalsbergstien 3; adressen ga ett entydig Geonorge-treff. |\n| \`alf_proysen_statue_nittedal\` | moved + needs_review | Flyttet til Akershus/Nittedal; Flammen-adressen er kun foreløpig host/site-anchor. |\n| \`proysenhuset_rudshogda\` | moved + verified | Flyttet til Innlandet/Ringsaker; Prestvegen 1 ga ett entydig Geonorge-treff. |\n| \`inger_hagerups_plass\` | needs_review | Stedsidentitet og navn fra 1999 dokumentert, men ingen legitim adresse-/geometrianker er valgt. |\n\n## Address-finder evidence\n\nAlle Geonorge-oppslag ligger i \`reports/oslo-coordinate-control-batch-29-v3/address-results/\` og ble lagret direkte fra repoets \`address-first-coordinate-finder\`.\n\n## Metodisk avgrensning\n\nIngen OSM- eller Wikidata-koordinater er brukt som erstatning for manglende adresseanker. Tre Oslo-steder forblir eksplisitt ikke-verifiserte, og Alf Prøysen-monumentets Flammen-punkt er markert som foreløpig host/site-anchor.\n`;
fs.writeFileSync(path.join(reportDir, 'README.md'), readme);

const summary = {
  generatedAt: new Date().toISOString(),
  verifiedOslo: {
    kulturkirken_jakob_litteratur: { lat: jakob.lat, lon: jakob.lon, sourceObjectId: jakob.sourceObjectId },
    ruth_maier_minne: { lat: ruth.lat, lon: ruth.lon, sourceObjectId: ruth.sourceObjectId },
  },
  needsReviewOslo: ['norli_universitetsgata', 'sigrid_undset_statue', 'inger_hagerups_plass'],
  moved: {
    alf_proysen_statue_nittedal: { destination: alfDestRel, coordStatus: movedAlf.coordStatus, lat: movedAlf.lat, lon: movedAlf.lon },
    proysenhuset_rudshogda: { destination: proysenDestRel, coordStatus: movedProysen.coordStatus, lat: movedProysen.lat, lon: movedProysen.lon },
  },
};
writeJson(path.join(reportDir, 'applied-summary.json'), summary);

console.log(JSON.stringify(summary, null, 2));
