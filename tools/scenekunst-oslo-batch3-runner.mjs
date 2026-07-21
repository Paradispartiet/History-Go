#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
const builderPath = 'tools/add-scenekunst-oslo-venues-batch-3.mjs';

function replaceOnce(text, oldValue, newValue, label) {
  if (!text.includes(oldValue)) throw new Error(`Missing expected fragment: ${label}`);
  return text.replace(oldValue, newValue);
}

function prepare() {
  let source = fs.readFileSync(builderPath, 'utf8');

  source = replaceOnce(
    source,
    `    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl,
    coordVerifiedAt: VERIFIED_DATE,
    coordNote: \`Offisiell adressekoordinat fra Geonorge Adresser API for \${coordinate.address.street} \${coordinate.address.number}, OSLO. Punktet er representasjonspunktet for den avgrensede scenekunstfunksjonen og brukes som display-marker.\${coLocationText}\`,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',`,
    `    coordType: coordinate.coordType ?? 'address_point',
    coordStatus: coordinate.coordStatus ?? 'verified',
    coordSource: coordinate.coordSource ?? 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl,
    coordVerifiedAt: VERIFIED_DATE,
    coordNote: coordinate.coordNote ?? \`Offisiell adressekoordinat fra Geonorge Adresser API for \${coordinate.address.street} \${coordinate.address.number}, OSLO. Punktet er representasjonspunktet for den avgrensede scenekunstfunksjonen og brukes som display-marker.\${coLocationText}\`,
    locatorType: coordinate.locatorType ?? 'building',
    sourceProvider: coordinate.sourceProvider ?? 'official_address',
    sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address,
    geocodeAccuracy: coordinate.geocodeAccuracy ?? 'rooftop',
    coordRole: coordinate.coordRole ?? 'display_marker',`,
    'buildPlace coordinate metadata block'
  );

  source = replaceOnce(
    source,
    `async function exactAddress(venue) {
  const sourceUrl = \`https://ws.geonorge.no/adresser/v1/sok?sok=\${encodeURIComponent(venue.query)}\`;`,
    `async function exactAddress(venue) {
  if (venue.id === 'kloden_teater_pilotscenen') {
    return {
      sourceUrl: 'https://www.openstreetmap.org/node/13243059793',
      sourceObjectId: 'osm-node:13243059793',
      lat: 59.928103,
      lon: 10.8194263,
      address: {
        street: 'Kabelgata',
        number: '31',
        postcode: '0581',
        city: 'Oslo',
        country: 'NO'
      },
      coordType: 'named_poi',
      coordStatus: 'verified_geometry',
      coordSource: 'osm',
      locatorType: 'poi',
      sourceProvider: 'osm',
      geocodeAccuracy: 'building',
      coordRole: 'display_marker',
      coordNote: 'Kloden teater oppgir Pilotscenen i Kabelgata 31. Address-first ble gjennomført med både fritekst- og strukturert Geonorge-søk, men Kartverket returnerte ingen matrikkeladresse for nummer 31. Nærmeste adressepunkt, Kabelgata 33, brukes uttrykkelig ikke som proxy. Det eksakt navngitte OSM-punktet node 13243059793, tagget amenity=theatre og name=Kloden Teater - Pilotscenen, brukes derfor som canonical display-marker.'
    };
  }
  const sourceUrl = \`https://ws.geonorge.no/adresser/v1/sok?sok=\${encodeURIComponent(venue.query)}\`;`,
    'Kloden OSM fallback insertion'
  );

  source = replaceOnce(
    source,
    `    geonorgeExactAddressLookup: 'pass',`,
    `    coordinateSourceResolution: 'pass',
    geonorgeExactAddressLookup: 'pass_for_centralteatret_and_grusomhetens_teater; documented_no_exact_address_object_for_kloden',`,
    'report validation coordinate fields'
  );
  source = replaceOnce(
    source,
    '    `- Geonorge-objekt: \\`${row.sourceObjectId}\\``,',
    '    `- Kildeobjekt: \\`${row.sourceObjectId}\\``,',
    'report source object label'
  );

  fs.writeFileSync(builderPath, source);
  console.log('Prepared builder with documented Kloden OSM fallback.');
}

function finalize() {
  const placeDir = 'data/places/scenekunst/oslo/places_scenekunst';
  const ids = ['centralteatret', 'kloden_teater_pilotscenen', 'grusomhetens_teater'];
  const places = ids.map((id) => JSON.parse(fs.readFileSync(path.join(placeDir, `${id}.json`), 'utf8')));
  const kloden = places.find((place) => place.id === 'kloden_teater_pilotscenen');

  const evidencePath = 'data/coordinate-evidence/oslo/scenekunst/kloden_teater_pilotscenen.json';
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, JSON.stringify({
    placeId: kloden.id,
    placeFile: `${placeDir}/kloden_teater_pilotscenen.json`,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'use_named_osm_poi_after_documented_official_address_miss',
    currentCoordinate: {
      lat: kloden.lat,
      lon: kloden.lon,
      r: kloden.r,
      coordStatus: kloden.coordStatus,
      coordSource: kloden.coordSource,
      coordType: kloden.coordType,
      coordNote: kloden.coordNote
    },
    identity: {
      currentName: kloden.name,
      resolvedIdentity: 'Kloden teater – den aktive Pilotscenen i Kabelgata 31',
      identityStatus: 'resolved',
      identityProblem: 'Institusjonen bruker Kabelgata 31, men Geonorge har ikke et matrikkeladresseobjekt for nummer 31.',
      locatorTypeCandidate: 'poi',
      requiresSplit: false,
      splitReason: 'Pilotscenen er dagens aktive scene. Administrasjonen i Kabelgata 39 C og det planlagte permanente teaterhuset inngår ikke som samme fysiske markør.'
    },
    requiredEvidence: [
      'offisiell institusjonskilde som dokumenterer Pilotscenen og besøksadressen Kabelgata 31',
      'dokumentert address-first-forsøk i Geonorge uten eksakt adresseobjekt',
      'ett eksakt navngitt og stabilt kartobjekt for selve Pilotscenen',
      'canonical overlap-audit mot global stedindeks'
    ],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'Kloden teater – Besøk oss',
        sourceUrl: 'https://www.kloden.no/besok-oss/',
        sourceObjectId: 'kloden:pilotscenen:kabelgata-31',
        sourceQuality: 'official_current_venue_address',
        finding: 'Kloden teater oppgir Pilotscenen i Kabelgata 31, 0581 Oslo, separat fra administrasjonen i Kabelgata 39 C.',
        canVerifyCoordinate: false,
        reason: 'Kilden verifiserer venue-identitet og besøksadresse, men publiserer ikke et stabilt koordinatobjekt.'
      },
      {
        sourceProvider: 'official_address',
        sourceName: 'Geonorge Adresser API v1',
        sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Kabelgata&nummer=31&kommunenummer=0301',
        sourceObjectId: null,
        sourceQuality: 'documented_address_first_no_exact_object',
        finding: 'Både fritekst- og strukturert søk returnerte null eksakte adresseobjekter for Kabelgata 31. Kabelgata 33 ligger nærmest, men brukes ikke som proxy.',
        canVerifyCoordinate: false,
        reason: 'Ingen offisiell adresseidentitet finnes for nummer 31 i API-responsen.'
      },
      {
        sourceProvider: 'osm',
        sourceName: 'OpenStreetMap API',
        sourceUrl: 'https://api.openstreetmap.org/api/0.6/node/13243059793.json',
        sourceObjectId: 'osm-node:13243059793',
        sourceQuality: 'exact_named_current_theatre_poi',
        finding: 'Node 13243059793 er navngitt Kloden Teater - Pilotscenen, tagget amenity=theatre og ligger på 59.928103, 10.8194263.',
        canVerifyCoordinate: true,
        reason: 'Objektet identifiserer den aktive scenen direkte og har et stabilt OSM-ID.'
      }
    ],
    addressCandidates: [{
      address: 'Kabelgata 31, 0581 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: null,
      canApplyToPlace: false,
      reason: 'Offisiell besøksadresse, men ingen tilsvarende Geonorge-adresseidentitet.'
    }],
    sourceObjectCandidates: [{
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:13243059793',
      canApplyToPlace: true
    }],
    geometryCandidates: [{
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:13243059793',
      geometryType: 'named_point',
      canApplyToPlace: true
    }],
    coordinateCandidates: [{
      lat: 59.928103,
      lon: 10.8194263,
      coordRole: 'display_marker',
      canApplyToPlace: true
    }],
    decision: {
      canBecomeVerified: true,
      finalStatus: 'verified_geometry',
      blockedReason: '',
      nextAction: 'Use the exact named OSM theatre node; review the record when the permanent Kloden theatre opens.'
    },
    notes: [
      'Address-first was completed before OSM fallback.',
      'Kabelgata 33 was rejected as a nearest-address proxy.',
      'The active Pilotscenen remains the represented venue until the permanent theatre transition is verified.'
    ]
  }, null, 2) + '\n');

  const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
  let protocol = fs.readFileSync(protocolPath, 'utf8');
  if (!protocol.includes('| 137 | `centralteatret` |')) {
    const rows = places.map((place) => `| 137 | \`${place.id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`).join('\n');
    protocol += `\n\n${rows}\n\nBatch 137 (2026-07-21) oppretter tre fysisk avgrensede Scenekunst-steder. \`centralteatret\` og \`grusomhetens_teater\` bruker entydige Geonorge-adressepunkter etter address-first-policyen; Grusomhetens Teater deler bevisst adresseanker med Hausmania, men representerer en selvstendig teaterscene. \`kloden_teater_pilotscenen\` oppgir Kabelgata 31 som besøksadresse, men Geonorge returnerer ingen matrikkeladresse for nummer 31. Nærmeste adresse, Kabelgata 33, avvises som proxy. Etter dokumentert address-first-miss brukes derfor det eksakt navngitte OSM-punktet \`osm-node:13243059793\`, tagget \`amenity=theatre\` og \`name=Kloden Teater - Pilotscenen\`, som verified_geometry display-marker. Kloden-recorden gjelder dagens aktive Pilotscene og skal revurderes ved åpningen av det permanente teaterhuset.\n`;
    fs.writeFileSync(protocolPath, protocol);
  }

  const reportPath = 'reports/scenekunst-oslo-new-venues-batch-3-2026-07-21.json';
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  report.status = 'validated';
  report.validatedAt = new Date().toISOString();
  report.coordinateResolution = {
    centralteatret: 'exact_geonorge_address',
    kloden_teater_pilotscenen: 'named_osm_poi_after_documented_geonorge_address_miss',
    grusomhetens_teater: 'exact_geonorge_address'
  };
  report.validation = {
    coordinateSourceResolution: 'pass',
    geonorgeAddressFirst: 'pass',
    osmNamedPoiFallback: 'pass_for_kloden_only',
    overlapAudit: 'pass',
    placesIndexBuild: 'pending_workflow',
    placesChecks: 'pending_workflow',
    categoryAudit: 'pending_workflow',
    coordinateProtocol: 'pass',
    coordinateEvidence: 'pass'
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log('Recorded Kloden evidence and coordinate batch 137.');
}

if (mode === 'prepare') prepare();
else if (mode === 'finalize') finalize();
else throw new Error('Usage: node tools/scenekunst-oslo-batch3-runner.mjs <prepare|finalize>');
