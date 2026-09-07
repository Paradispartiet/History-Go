#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-09-07';
const INVENTORY_PATH = path.join(ROOT, 'reports/lesekiosker-oslo-2026/lesekiosker-oslo-litteratur-inventory.json');
const EVIDENCE_MANIFEST_PATH = path.join(ROOT, 'data/coordinate-evidence/manifest.json');

const osmWay = (id, from, lat, lon) => ({
  from,
  lat,
  lon,
  locatorType: 'building',
  sourceProvider: 'osm',
  sourceObjectId: `osm-way:${id}`,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'building_center',
  coordType: 'building_center',
  coordStatus: 'verified_geometry',
  coordPrecisionM: 2,
  coordSource: `OpenStreetMap – telefonkioskfotavtrykk ${id}`,
  coordSourceUrl: `https://www.openstreetmap.org/way/${id}`,
  coordSourceLabel: `OpenStreetMap – way ${id}`,
  sourceKind: 'osm_way',
  sourceElementId: String(id),
  coordNote: `Geometrisk senter av OSM way ${id}, som kartlegger selve telefonkioskens fotavtrykk som offentlig bokkasse.`
});

const osmNode = (id, from, lat, lon, options = {}) => ({
  from,
  lat,
  lon,
  locatorType: 'poi',
  sourceProvider: 'osm',
  sourceObjectId: `osm-node:${id}`,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'object_point',
  coordStatus: options.coordStatus ?? 'verified',
  coordPrecisionM: options.coordPrecisionM ?? 3,
  coordSource: `OpenStreetMap – bokkioskpunkt ${id}`,
  coordSourceUrl: `https://www.openstreetmap.org/node/${id}`,
  coordSourceLabel: `OpenStreetMap – node ${id}`,
  sourceKind: 'osm_node',
  sourceElementId: String(id),
  coordNote: options.coordNote ?? `OSM node ${id} kartlegger den fysiske offentlige bokkassen på dette punktet.`
});

const googlePoi = (featureId, from, lat, lon, title, pathPart) => ({
  from,
  lat,
  lon,
  locatorType: 'poi',
  sourceProvider: 'google_places',
  sourceObjectId: `google-maps-feature:${featureId}`,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'object_point',
  coordStatus: 'verified',
  coordPrecisionM: 5,
  coordSource: `Google Maps – ${title}`,
  coordSourceUrl: `https://www.google.com/maps/place/${pathPart}/data=!4m6!3m5!1s${featureId}!8m2!3d${lat}!4d${lon}`,
  coordSourceLabel: `Google Maps – ${title}`,
  sourceKind: 'google_place',
  sourceElementId: featureId,
  coordNote: `Google Maps-stedsposten «${title}» identifiserer telefonkiosken ved navn og plasserer den på dette objektpunktet.`
});

const sageneNote = 'OSM kartlegger de to fysiske bokkioskene som separate punkter. Koblingen mellom kiosknummer 70/71 og hvert enkelt punkt er ikke dokumentert, så nummer-til-punkt-forholdet krever fortsatt manuell kontroll.';

const corrections = {
  lesekiosk_11_kjelsasveien_141: osmWay(1192611826, [59.9661015, 10.7833146], 59.9659814, 10.7830648),
  lesekiosk_22_vigelandsparken: osmWay(669155295, [59.9262575, 10.7031905], 59.9254315, 10.704871),
  lesekiosk_79_inkognitogata: osmWay(668983403, [59.9182108, 10.7226299], 59.9153107, 10.7208611),
  lesekiosk_42_munkedamsveien: osmWay(669303908, [59.9122394, 10.7272333], 59.9118415, 10.7189098),
  lesekiosk_10_refstadsvingen: osmWay(669605657, [59.9428406, 10.8140023], 59.9426535, 10.8134408),
  lesekiosk_76_hjemmets_kolonihager: osmNode(12790115997, [59.9410481, 10.7552854], 59.9411041, 10.7548409),
  lesekiosk_13_jacob_aalls_gate_58: osmWay(669586276, [59.9318962, 10.7258071], 59.9316901, 10.7254466),
  lesekiosk_74_huk_aveny_35: osmWay(605176436, [59.904593, 10.6849079], 59.9044564, 10.6862806),
  lesekiosk_56_vestgrensa_2: osmNode(12092702423, [59.9411528, 10.7296172], 59.9407512, 10.7294955),
  lesekiosk_51_skedsmogata_20: osmNode(12090528535, [59.9132515, 10.7822487], 59.9131116, 10.7827777),
  lesekiosk_9_akershusstranda_3: osmWay(669390501, [59.9095155, 10.7345678], 59.9093294, 10.7346325),
  lesekiosk_70_sagene_kirke: {
    ...osmNode(10069592234, [59.9377174, 10.7528534], 59.9380765, 10.7525542, { coordStatus: 'needs_manual_visual_qa', coordPrecisionM: 3, coordNote: sageneNote }),
    officialPage: 'https://lesekiosk.no/lesekiosk/lesekiosk-i-theresesgate-louisesgate/',
    pairedSourceObjectId: 'osm-node:10069592235',
    pairedSourceUrl: 'https://www.openstreetmap.org/node/10069592235'
  },
  lesekiosk_71_sagene_kirke: {
    ...osmNode(10069592235, [59.9377174, 10.7528534], 59.9380673, 10.7525367, { coordStatus: 'needs_manual_visual_qa', coordPrecisionM: 3, coordNote: sageneNote }),
    pairedSourceObjectId: 'osm-node:10069592234',
    pairedSourceUrl: 'https://www.openstreetmap.org/node/10069592234'
  },
  lesekiosk_0_sentralen: osmWay(886781211, [59.911125, 10.740317], 59.9109386, 10.7402001),
  lesekiosk_23_skoyen_stasjon: osmWay(669605654, [59.9218151, 10.6882814], 59.9222519, 10.6779623),
  lesekiosk_1_solli_plass: osmWay(668983401, [59.9150102, 10.7179623], 59.9148491, 10.7182501),
  lesekiosk_50_bislett_stadion: osmWay(669586271, [59.9250158, 10.7333583], 59.9257368, 10.7311442),
  lesekiosk_78_olav_kyrres_plass: googlePoi('0x46416d2048c589db:0xc12a02f1196a8566', [59.9192766, 10.6945543], 59.9191394, 10.6955202, 'Bokbytte telefonkiosk på Olav Kyrres plass', 'Bokbytte+telefonkiosk+p%C3%A5+Olav+Kyrres+plass'),
  lesekiosk_80_majorstukrysset: osmWay(669586275, [59.9292023, 10.7152563], 59.9292094, 10.7157735),
  lesekiosk_8_radhusgata_28: googlePoi('0x46416f021b2e8929:0xde1ce8221951be50', [59.9097098, 10.7404937], 59.9114168, 10.7361632, 'Telefonkiosk med bokbytte', 'Telefonkiosk+med+bokbytte'),
  lesekiosk_48_valerenga_kirke: osmWay(669605658, [59.9073411, 10.7850058], 59.9072601, 10.785392)
};

function sha(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function distanceM(aLat, aLon, bLat, bLon) {
  const rad = (degrees) => degrees * Math.PI / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function coordinateClaim(candidate, correction) {
  if (candidate.kioskNumber === 70 || candidate.kioskNumber === 71) {
    return {
      claim: 'OpenStreetMap kartlegger tvillingkioskene ved Sagene kirke som to separate public_bookcase-punkter; koblingen mellom kiosknummer 70/71 og hvert enkelt punkt er fortsatt uavklart.',
      sourceLocation: `OSM node ${correction.sourceElementId} og det separate paret ${correction.pairedSourceObjectId}.`,
      sourceType: 'catalogue',
      independentSourceUrls: [correction.pairedSourceUrl]
    };
  }
  if (correction.sourceKind === 'osm_way') {
    return {
      claim: `OpenStreetMap way ${correction.sourceElementId} kartlegger selve telefonkioskens fotavtrykk; markøren bruker fotavtrykkets geometriske senter ${correction.lat}, ${correction.lon}.`,
      sourceLocation: `OSM way ${correction.sourceElementId}: offentlig bokkasse/telefonkiosk og objektgeometri.`,
      sourceType: 'catalogue'
    };
  }
  if (correction.sourceKind === 'osm_node') {
    return {
      claim: `OpenStreetMap node ${correction.sourceElementId} kartlegger den fysiske bokkiosken på ${correction.lat}, ${correction.lon}.`,
      sourceLocation: `OSM node ${correction.sourceElementId}: offentlig bokkasse på objektpunktet.`,
      sourceType: 'catalogue'
    };
  }
  return {
    claim: `${correction.coordSource} identifiserer telefonkiosken ved navn og plasserer den på ${correction.lat}, ${correction.lon}.`,
    sourceLocation: 'Navngitt Google Maps-stedspost med adresse, kartpunkt og telefonkioskidentitet.',
    sourceType: 'catalogue'
  };
}

const inventory = readJson(INVENTORY_PATH);
const candidates = Array.isArray(inventory.candidates) ? inventory.candidates : [];
const ids = candidates.map((candidate) => candidate.id);
const correctionIds = Object.keys(corrections);
if (ids.length !== 21 || correctionIds.length !== 21 || ids.some((id) => !corrections[id])) {
  throw new Error(`Expected the same 21 Lesekiosk IDs in inventory and correction set; inventory=${ids.length}, corrections=${correctionIds.length}`);
}

inventory.generatedAt = VERIFIED_AT;
inventory.sourceOfTruth.coordinateRule = 'Use an object-mapped OSM telephone-booth geometry/point or a named Google Maps booth POI. Area and address anchors are not accepted as kiosk coordinates.';
inventory.repoPreflight.existingCanonicalMatches = 21;
inventory.repoPreflight.classification = 'existing distinct canonical microplaces with object-coordinate correction';
inventory.repoPreflight.activationMode = 'active_object_coordinates';
inventory.repoPreflight.reason = 'All 21 records are active canonical Micro Places; this audit replaces broad map anchors with physical kiosk objects.';
inventory.counts.canonicalPlacesCreatedByThisInventory = 21;

const evidenceManifest = readJson(EVIDENCE_MANIFEST_PATH);
const appliedEvidenceFiles = [];
const reportRows = [];

for (const candidate of candidates) {
  const correction = corrections[candidate.id];
  const currentMatchesFrom = candidate.lat === correction.from[0] && candidate.lon === correction.from[1];
  const currentMatchesTo = candidate.lat === correction.lat && candidate.lon === correction.lon;
  if (!currentMatchesFrom && !currentMatchesTo) {
    throw new Error(`${candidate.id}: inventory coordinate matches neither audited old nor corrected coordinate`);
  }

  if (correction.officialPage) candidate.officialPage = correction.officialPage;
  candidate.canonicalPlaceStatus = 'created_active';
  candidate.officialMapAnchor = { lat: correction.from[0], lon: correction.from[1] };
  candidate.lat = correction.lat;
  candidate.lon = correction.lon;
  candidate.coordinateEvidence = correction.coordSourceLabel;
  candidate.coordinateVerifiedAt = VERIFIED_AT;
  candidate.coordinate = {
    locatorType: correction.locatorType,
    sourceProvider: correction.sourceProvider,
    sourceObjectId: correction.sourceObjectId,
    geocodeAccuracy: correction.geocodeAccuracy,
    coordRole: correction.coordRole,
    coordType: correction.coordType,
    coordStatus: correction.coordStatus,
    coordPrecisionM: correction.coordPrecisionM,
    coordSource: correction.coordSource,
    coordSourceUrl: correction.coordSourceUrl,
    coordNote: correction.coordNote,
    ...(correction.pairedSourceObjectId ? { pairedSourceObjectId: correction.pairedSourceObjectId, pairedSourceUrl: correction.pairedSourceUrl } : {})
  };
  if (candidate.id === 'lesekiosk_70_sagene_kirke') candidate.notes = 'Kiosk 70 and 71 are separate current Lesekiosker and separate OSM public_bookcase nodes. The number-to-node mapping remains unresolved; the individual page for 70 is the misleadingly slugged lesekiosk-i-theresesgate-louisesgate page.';
  if (candidate.id === 'lesekiosk_71_sagene_kirke') candidate.notes = 'Twin kiosk at Sagene kirke. The two physical OSM nodes are distinct, but the number-to-node mapping remains unresolved and needs onsite visual QA.';
  if (candidate.id === 'lesekiosk_23_skoyen_stasjon') candidate.notes = 'The current Lesekiosk map query uses Drammensveien 127, but protected-kiosk material and OSM way 669605654 place the physical kiosk by Drammensveien 157. Canonical coordinates follow the kiosk footprint.';
  if (candidate.id === 'lesekiosk_48_valerenga_kirke') candidate.notes = 'The broad Opplandsgata 5 map anchor is replaced by OSM way 669605658, the mapped Lesekiosk at the Danmarksgata/Opplandsgata junction.';

  const placeFile = path.join(ROOT, `data/places/litteratur/oslo/lesekiosk/${candidate.id}.json`);
  const place = readJson(placeFile);
  Object.assign(place, {
    lat: correction.lat,
    lon: correction.lon,
    locatorType: correction.locatorType,
    sourceProvider: correction.sourceProvider,
    sourceObjectId: correction.sourceObjectId,
    geocodeAccuracy: correction.geocodeAccuracy,
    coordRole: correction.coordRole,
    coordType: correction.coordType,
    coordStatus: correction.coordStatus,
    coordPrecisionM: correction.coordPrecisionM,
    coordSource: correction.coordSource,
    coordSourceId: correction.sourceObjectId,
    coordSourceUrl: correction.coordSourceUrl,
    coordNote: correction.coordNote
  });
  if (correction.coordStatus.startsWith('verified')) place.coordVerifiedAt = VERIFIED_AT;
  else delete place.coordVerifiedAt;
  const retainedLinks = (place.externalLinks ?? []).filter((link) => link.type !== 'coordinate_source');
  if (correction.officialPage && retainedLinks[0]?.type === 'reference') {
    retainedLinks[0].url = correction.officialPage;
    retainedLinks[0].label = `Lesekiosk – ${candidate.name}`;
  }
  place.externalLinks = [
    ...retainedLinks,
    { type: 'coordinate_source', label: correction.coordSourceLabel, url: correction.coordSourceUrl, lang: correction.sourceProvider === 'osm' ? 'en' : 'nb', verifiedAt: VERIFIED_AT },
    ...(correction.pairedSourceUrl ? [{ type: 'coordinate_source', label: `OpenStreetMap – ${correction.pairedSourceObjectId}`, url: correction.pairedSourceUrl, lang: 'en', verifiedAt: VERIFIED_AT }] : [])
  ];
  writeJson(placeFile, place);

  const packetFile = path.join(ROOT, `data/places/production/${candidate.id}.json`);
  const packet = readJson(packetFile);
  const coordinateClaimId = `claim_${candidate.id}_coordinate`;
  const mapAnchorClaimId = `claim_${candidate.id}_map_anchor`;
  let claim = packet.claims.find((item) => item.id === coordinateClaimId);
  let mapAnchorClaim = packet.claims.find((item) => item.id === mapAnchorClaimId);
  if (!mapAnchorClaim) {
    if (!claim) throw new Error(`${candidate.id}: coordinate claim missing`);
    claim.id = mapAnchorClaimId;
    mapAnchorClaim = claim;
    for (const section of Object.values(packet.sentenceCoverage ?? {})) {
      for (const row of section ?? []) {
        row.claimIds = (row.claimIds ?? []).map((id) => id === coordinateClaimId ? mapAnchorClaimId : id);
      }
    }
    claim = null;
  }
  if (!claim) {
    claim = {
      id: coordinateClaimId,
      claim: '',
      sourceUrl: '',
      sourceLocation: '',
      sourceType: 'catalogue',
      verifiedAt: VERIFIED_AT,
      status: 'verified',
      claimKind: 'ordinary',
      evidenceMode: 'direct',
      temporalStatus: 'current'
    };
    packet.claims.push(claim);
  }
  const claimUpdate = coordinateClaim(candidate, correction);
  Object.assign(claim, {
    claim: claimUpdate.claim,
    sourceUrl: correction.coordSourceUrl,
    sourceLocation: claimUpdate.sourceLocation,
    sourceType: claimUpdate.sourceType,
    verifiedAt: VERIFIED_AT,
    status: 'verified',
    claimKind: 'ordinary',
    evidenceMode: 'direct',
    temporalStatus: 'current'
  });
  if (claimUpdate.independentSourceUrls) claim.independentSourceUrls = claimUpdate.independentSourceUrls;
  else delete claim.independentSourceUrls;
  packet.textHashes.desc = sha(place.desc);
  packet.textHashes.popupDesc = sha(place.popupDesc);
  packet.reviews.factual = { status: 'passed', reviewedAt: VERIFIED_AT, reviewer: 'History GO object-coordinate source audit' };
  packet.reviews.editorial = { status: 'passed', reviewedAt: VERIFIED_AT, reviewer: 'History GO object-coordinate source audit', introducedNewFacts: false };
  packet.completion.sourceVerifiedAt = VERIFIED_AT;
  packet.completion.claimsVerified = { verified: packet.claims.length, total: packet.claims.length };
  writeJson(packetFile, packet);

  const movedM = Math.round(distanceM(correction.from[0], correction.from[1], correction.lat, correction.lon));
  reportRows.push({
    id: candidate.id,
    kioskNumber: candidate.kioskNumber,
    name: candidate.name,
    previousCoordinate: { lat: correction.from[0], lon: correction.from[1] },
    correctedCoordinate: { lat: correction.lat, lon: correction.lon },
    movedM,
    sourceProvider: correction.sourceProvider,
    sourceObjectId: correction.sourceObjectId,
    sourceUrl: correction.coordSourceUrl,
    coordStatus: correction.coordStatus,
    note: correction.coordNote
  });

  if (correction.coordStatus.startsWith('verified')) {
    const evidenceRel = `oslo/litteratur/lesekiosk/${candidate.id}.json`;
    const evidenceFile = path.join(ROOT, 'data/coordinate-evidence', evidenceRel);
    const evidence = {
      placeId: candidate.id,
      placeFile: `data/places/litteratur/oslo/lesekiosk/${candidate.id}.json`,
      evidenceStatus: 'applied_to_place',
      coordinateDecision: 'candidate_ready_for_production',
      currentCoordinate: {
        lat: place.lat,
        lon: place.lon,
        r: place.r,
        coordStatus: place.coordStatus,
        coordSource: place.coordSource,
        coordType: place.coordType,
        coordNote: place.coordNote
      },
      identity: {
        currentName: candidate.name,
        resolvedIdentity: `${candidate.name} som den fysiske røde telefonkiosken med bokdelingsfunksjon`,
        identityStatus: 'resolved',
        identityProblem: '',
        locatorTypeCandidate: correction.locatorType,
        requiresSplit: false,
        splitReason: 'Lesekiosken er allerede et eget canonical mikrosted, adskilt fra nabostedet.'
      },
      evidence: [{
        sourceProvider: correction.sourceProvider,
        sourceName: correction.coordSourceLabel,
        sourceUrl: correction.coordSourceUrl,
        sourceObjectId: correction.sourceObjectId,
        sourceQuality: correction.sourceKind === 'osm_way' ? 'object_geometry' : 'named_object_point',
        finding: correction.coordNote,
        canVerifyCoordinate: true,
        reason: 'Kilden identifiserer selve telefonkiosken/bokkiosken, ikke bare adressen eller nærområdet.'
      }],
      coordinateCandidates: [{ lat: correction.lat, lon: correction.lon, coordRole: correction.coordRole, canApplyToPlace: true }],
      decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Objektpunktet er anvendt i canonical place og synkroniseres til places-index.' },
      notes: [`Tidligere områdeanker er flyttet ${movedM} meter til det dokumenterte kioskobjektet.`]
    };
    writeJson(evidenceFile, evidence);
    if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
    appliedEvidenceFiles.push(evidenceRel);
  }
}

writeJson(EVIDENCE_MANIFEST_PATH, evidenceManifest);
writeJson(INVENTORY_PATH, inventory);

const materializedPath = path.join(ROOT, 'reports/lesekiosker-oslo-2026/materialized-canonical-places.json');
const materialized = readJson(materializedPath);
materialized.generatedAt = VERIFIED_AT;
for (const row of materialized.places ?? []) {
  const correction = corrections[row.id];
  if (!correction) continue;
  const candidate = candidates.find((item) => item.id === row.id);
  row.lat = correction.lat;
  row.lon = correction.lon;
  row.source = candidate?.officialPage || inventory.sourceOfTruth.currentListUrl;
  row.coordinateSource = correction.sourceObjectId;
  row.coordStatus = correction.coordStatus;
}
writeJson(materializedPath, materialized);

const placesIndexPath = path.join(ROOT, 'data/places/places_index.json');
const placesIndex = readJson(placesIndexPath);
const indexFields = [
  'id', 'name', 'lat', 'lon', 'r', 'category', 'subcategory_id', 'placeTier', 'micro_place_profile',
  'year', 'desc', 'aliases', 'image', 'cardImage', 'frontImage', 'hidden', 'stub', 'groundhopper',
  'placeScope', 'mapLod', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address', 'geocodeAccuracy',
  'coordRole', 'coordType', 'coordStatus', 'coordSource', 'coordVerifiedAt', 'coordNote'
];
for (const indexPlace of placesIndex) {
  if (!corrections[indexPlace.id]) continue;
  const sourceFile = `places/litteratur/oslo/lesekiosk/${indexPlace.id}.json`;
  const sourcePlace = readJson(path.join(ROOT, 'data', sourceFile));
  for (const field of indexFields) {
    if (Object.prototype.hasOwnProperty.call(sourcePlace, field)) indexPlace[field] = sourcePlace[field];
    else delete indexPlace[field];
  }
  indexPlace.sourceFile = sourceFile;
}
writeJson(placesIndexPath, placesIndex);

writeJson(path.join(ROOT, 'reports/lesekiosker-oslo-2026/object-coordinate-corrections.json'), {
  schema: 'history_go_lesekiosk_object_coordinate_corrections_v1',
  auditedAt: VERIFIED_AT,
  count: reportRows.length,
  verifiedCount: reportRows.filter((row) => row.coordStatus.startsWith('verified')).length,
  needsManualVisualQaCount: reportRows.filter((row) => row.coordStatus === 'needs_manual_visual_qa').length,
  evidenceFiles: appliedEvidenceFiles,
  places: reportRows
});

console.log(`Corrected ${reportRows.length} Lesekiosk coordinates (${appliedEvidenceFiles.length} verified object records; 2 Sagene pair members retained for manual number-to-node QA).`);
