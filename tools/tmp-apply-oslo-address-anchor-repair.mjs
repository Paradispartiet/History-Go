import fs from 'node:fs';
import path from 'node:path';

const verifiedAt = '2026-07-19';
const resultDir = 'reports/oslo-address-anchor-repair-20260719/verified-coordinates';
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

function result(id) {
  const value = read(path.join(resultDir, `${id}.json`));
  if (!value.ok || value.status !== 'verified_candidate' || !value.coordinate) {
    throw new Error(`${id}: expected verified_candidate`);
  }
  return value;
}

const geo = {
  torggata: result('torggata'),
  storgata: result('storgata'),
  torggata_blad: result('torggata_blad'),
};

const splitFiles = {
  torggata: 'data/places/by/oslo/places/torggata.json',
  storgata: 'data/places/by/oslo/places/storgata.json',
  torggata_blad: 'data/places/subkultur/oslo/places_subkultur/torggata_blad.json',
};

function applyAddress(place, geocode, { locatorType, coordRole, note }) {
  const c = geocode.coordinate;
  place.lat = c.lat;
  place.lon = c.lon;
  place.coordType = 'address_point';
  place.coordStatus = 'verified';
  place.locatorType = locatorType;
  place.sourceProvider = 'official_address';
  place.sourceObjectId = geocode.sourceObjectId;
  place.address = c.address;
  place.geocodeAccuracy = c.geocodeAccuracy || 'rooftop';
  place.coordRole = coordRole;
  place.coordSource = 'geonorge_adresser_v1';
  place.coordSourceId = geocode.sourceObjectId;
  place.coordSourceUrl = geocode.sourceUrl;
  place.coordVerifiedAt = verifiedAt;
  place.coordNote = note;
  delete place.coordPrecisionM;
}

const torggata = read(splitFiles.torggata);
applyAddress(torggata, geo.torggata, {
  locatorType: 'street',
  coordRole: 'line_anchor',
  note: 'Offisiell Geonorge-adressekoordinat for Torggata 22 brukes som konkret representativt hovedanker for Torggata. Punktet ligger på den sentrale oppgraderte gate- og serveringsstrekningen. Det er ikke et beregnet midtpunkt og gjør ingen påstand om at hele gaten ligger i bygningen på adressen.',
});
write(splitFiles.torggata, torggata);

const storgata = read(splitFiles.storgata);
applyAddress(storgata, geo.storgata, {
  locatorType: 'street',
  coordRole: 'line_anchor',
  note: 'Offisiell Geonorge-adressekoordinat for Storgata 26 brukes som konkret representativt hovedanker for Storgata. Punktet ligger på den sentrale handels-, bylivs- og sporveisstrekningen. Det er ikke et beregnet midtpunkt og gjør ingen påstand om at hele gaten ligger i bygningen på adressen.',
});
write(splitFiles.storgata, storgata);

const blad = read(splitFiles.torggata_blad);
applyAddress(blad, geo.torggata_blad, {
  locatorType: 'building',
  coordRole: 'display_marker',
  note: 'Historiske Torggata Blad-utgaver fra 2007–2008 dokumenterer redaksjonen/Aktbo-kontoret i Hausmannsgate 19, 6. etasje. Dagens matrikkel deler samme eiendom i 19A og 19B; 19A brukes som dagens offisielle adresse-normalisering og displayanker for det historiske kontorstedet. Bokstaven A er ikke gjengitt som et historisk 2008-sitat.',
});
blad.r = 60;
blad.name = 'Torggata Blad – historisk redaksjon';
blad.desc = 'Historisk redaksjons- og publiseringssted for det uavhengige kulturbladet Torggata Blad i Hausmanns gate 19.';
blad.popupDesc = 'De tidlige papirutgavene av Torggata Blad dokumenterer at redaksjonen holdt til i Hausmannsgate 19, 6. etasje. Her ble det uavhengige lokal- og kulturbladet utviklet i miljøet rundt Bror Wyller, Paul Brady og andre bidragsytere. History Go-markøren representerer dette dokumenterte historiske redaksjons- og publiseringsstedet. Dagens offisielle adressepunkt Hausmanns gate 19A brukes som displayanker for eiendommen; dette er en moderne adresse-normalisering, ikke en påstand om at 2007–2008-utgavene skrev bokstaven A.';
blad.quiz_profile = {
  ...blad.quiz_profile,
  place_type: 'redaksjonssted',
  subtype: 'uavhengig_kulturblad_og_publiseringsmiljo',
  signature_features: [
    'historisk redaksjon i Hausmannsgate 19, 6. etasje',
    'tidlig uavhengig lokal- og kulturpublisering fra 2007–2008',
    'kobling mellom Torggata-miljøet, Aktbo-kontoret og alternative publiseringsnettverk',
  ],
  primary_angles: ['historie', 'uavhengig_kultur', 'publisering', 'subkulturelt_miljo'],
  must_include: [
    'rollen som uavhengig kulturpublikasjon',
    'Hausmannsgate 19 som dokumentert historisk redaksjonssted',
  ],
  avoid_angles: ['generisk_bokhandel', 'nåværende_redaksjonsadresse'],
  notes: 'Spør som historisk redaksjons- og publiseringssted, ikke som bokhandel.',
};
write(splitFiles.torggata_blad, blad);

function replaceAggregate(file, replacements) {
  const data = read(file);
  if (!Array.isArray(data)) throw new Error(`${file}: expected array`);
  for (const [id, record] of Object.entries(replacements)) {
    const index = data.findIndex((item) => item?.id === id);
    if (index < 0) throw new Error(`${file}: missing ${id}`);
    data[index] = record;
  }
  write(file, data);
}

replaceAggregate('data/places/by/oslo/places_by.json', { torggata, storgata });
replaceAggregate('data/places/subkultur/oslo/places_subkultur.json', { torggata_blad: blad });

function updateLightIndex(file, records) {
  const data = read(file);
  if (!Array.isArray(data)) throw new Error(`${file}: expected array`);
  for (const record of records) {
    const item = data.find((candidate) => candidate?.id === record.id);
    if (!item) throw new Error(`${file}: missing ${record.id}`);
    item.name = record.name;
    item.lat = record.lat;
    item.lon = record.lon;
    item.r = record.r;
    item.coordStatus = record.coordStatus;
    item.coordType = record.coordType;
  }
  write(file, data);
}

updateLightIndex('data/places/by/oslo/places_by_index.json', [torggata, storgata]);
updateLightIndex('data/places/subkultur/oslo/places_subkultur_index.json', [blad]);

function updateStreetEvidence(file, place, geocode, sourceName, sourceUrl, sourceObjectId) {
  const evidence = read(file);
  const c = geocode.coordinate;
  evidence.placeFile = 'data/places/by/oslo/places_by.json';
  evidence.evidenceStatus = 'applied_to_place';
  // The evidence audit currently has no separate enum for an already-applied coordinate change.
  // Keep the existing allowed value while currentCoordinate records the applied state exactly.
  evidence.coordinateDecision = 'do_not_change_coordinates_yet';
  evidence.currentCoordinate = {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote,
  };
  evidence.identity = {
    ...(evidence.identity || {}),
    currentName: place.name,
    resolvedIdentity: `${place.name} representert med konkret offisielt adresseanker ${c.address.street} ${c.address.number} innenfor det dokumenterte gateløpet.`,
    identityStatus: 'resolved',
    locatorTypeCandidate: 'street',
    requiresSplit: false,
  };
  evidence.evidence = [
    {
      sourceProvider: 'manual_research',
      sourceName,
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'documented_street_extent',
      finding: 'Kilden dokumenterer gateidentiteten og gateløpet. Den brukes ikke som koordinatgenerator.',
      canVerifyCoordinate: false,
      reason: 'Koordinatet kommer fra det separate offisielle adresseankeret.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1',
      sourceUrl: geocode.sourceUrl,
      sourceObjectId: geocode.sourceObjectId,
      sourceQuality: 'official_address_point',
      finding: `${c.address.street} ${c.address.number} ga ett entydig verified_candidate og er anvendt som konkret representativt hovedanker.`,
      canVerifyCoordinate: true,
      reason: place.coordNote,
    },
  ];
  evidence.addressCandidates = [{
    query: geocode.query,
    sourceProvider: 'official_address',
    sourceObjectId: geocode.sourceObjectId,
    lat: c.lat,
    lon: c.lon,
    canApplyToPlace: true,
  }];
  evidence.sourceObjectCandidates = [{
    sourceProvider: 'official_address',
    sourceObjectId: geocode.sourceObjectId,
    canApplyToPlace: true,
  }];
  evidence.geometryCandidates = [];
  evidence.coordinateCandidates = [{
    lat: c.lat,
    lon: c.lon,
    coordRole: 'line_anchor',
    canApplyToPlace: true,
  }];
  evidence.decision = {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Det offisielle adresseankeret er anvendt på canonical place, aggregate og runtime-indekser.',
  };
  evidence.notes = [place.coordNote];
  write(file, evidence);
}

updateStreetEvidence(
  'data/coordinate-evidence/oslo/by/torggata.json',
  torggata,
  geo.torggata,
  'Oslo byleksikon – Torggata',
  'https://oslobyleksikon.no/side/Torggata',
  'oslobyleksikon:torggata',
);
updateStreetEvidence(
  'data/coordinate-evidence/oslo/by/storgata.json',
  storgata,
  geo.storgata,
  'Oslo byleksikon – Storgata',
  'https://oslobyleksikon.no/side/Storgata',
  'oslobyleksikon:storgata',
);

write('reports/oslo-address-anchor-repair-20260719/torggata-blad-coordinate-evidence.json', {
  placeId: blad.id,
  placeFile: 'data/places/subkultur/oslo/places_subkultur.json',
  evidenceStatus: 'applied_to_place',
  currentCoordinate: {
    lat: blad.lat,
    lon: blad.lon,
    r: blad.r,
    coordStatus: blad.coordStatus,
    coordSource: blad.coordSource,
    coordType: blad.coordType,
    coordNote: blad.coordNote,
  },
  historicalEvidence: [
    {
      source: 'Torggata Blad nr. 2, 2007',
      finding: 'Redaksjonen oppgir at den holder til i Hausmannsgate 19, 6. etasje, med takterrasse på baksiden.',
    },
    {
      source: 'Torggata Blad nr. 1 og nr. 2, 2008',
      finding: 'Mastheadene oppgir Torggata Blad, Hausmannsgate 19, 0182 Oslo; nr. 2 oppgir også Vitar Eiendom c/o Aktbo på samme adresse.',
    },
  ],
  addressNormalization: {
    historicalAddress: 'Hausmannsgate 19, 0182 Oslo',
    modernDisplayAddress: 'Hausmanns gate 19A, 0182 Oslo',
    note: 'A-bokstaven er dagens offisielle adresse-normalisering for displayankeret og er ikke gjengitt som historisk sitat.',
  },
  geonorge: geo.torggata_blad,
});

const old = {
  torggata: [59.91535, 10.75335],
  storgata: [59.9154, 10.7539],
  torggata_blad: [59.91504, 10.75326],
};
const updated = { torggata, storgata, torggata_blad: blad };
const rad = (n) => n * Math.PI / 180;
function distance(a, b) {
  const R = 6371000;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const movement = {};
for (const [id, place] of Object.entries(updated)) {
  const meters = distance(old[id], [place.lat, place.lon]);
  if (meters < 20) throw new Error(`${id} moved only ${meters.toFixed(1)} m; expected a real marker move`);
  movement[id] = {
    old: { lat: old[id][0], lon: old[id][1] },
    new: { lat: place.lat, lon: place.lon },
    movedMeters: Math.round(meters),
    sourceObjectId: place.coordSourceId,
  };
}

write('reports/oslo-address-anchor-repair-20260719/marker-movement.json', movement);
write('reports/oslo-address-anchor-repair-20260719/applied-summary.json', {
  appliedAt: new Date().toISOString(),
  addresses: geo,
  movement,
});

console.log(JSON.stringify(movement, null, 2));
