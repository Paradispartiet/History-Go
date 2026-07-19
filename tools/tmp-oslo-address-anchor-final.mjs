import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-07-19';
const reportRoot = 'reports/oslo-address-anchor-repair-20260719';
const verifiedDir = `${reportRoot}/verified-coordinates`;

const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => {
  const abs = path.join(root, file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
};

function geonorge(id) {
  const value = read(`${verifiedDir}/${id}.json`);
  if (!value.ok || value.status !== 'verified_candidate' || !value.coordinate) {
    throw new Error(`${id}: expected one verified_candidate`);
  }
  return value;
}

const geo = {
  torggata: geonorge('torggata'),
  storgata: geonorge('storgata'),
  torggata_blad: geonorge('torggata_blad'),
};

const splitFiles = {
  torggata: 'data/places/by/oslo/places/torggata.json',
  storgata: 'data/places/by/oslo/places/storgata.json',
  torggata_blad: 'data/places/subkultur/oslo/places_subkultur/torggata_blad.json',
};

const before = Object.fromEntries(
  Object.entries(splitFiles).map(([id, file]) => {
    const place = read(file);
    return [id, { lat: place.lat, lon: place.lon, r: place.r }];
  }),
);

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
blad.desc = 'Historisk redaksjons- og publiseringssted for det uavhengige kulturbladet Torggata Blad i Hausmanns gate 19.';
blad.popupDesc = 'De tidlige papirutgavene av Torggata Blad dokumenterer at redaksjonen holdt til i Hausmannsgate 19, 6. etasje. History Go-markøren representerer dette dokumenterte historiske redaksjons- og publiseringsstedet. Dagens offisielle adressepunkt Hausmanns gate 19A brukes som displayanker for eiendommen; dette er en moderne adresse-normalisering, ikke en påstand om at 2007–2008-utgavene skrev bokstaven A.';
blad.quiz_profile = {
  ...blad.quiz_profile,
  place_type: 'redaksjonssted',
  subtype: 'uavhengig_kulturblad_og_publiseringsmiljo',
  signature_features: [
    'historisk redaksjon i Hausmannsgate 19, 6. etasje',
    'uavhengig lokal- og kulturpublisering fra Torggata-miljøet',
    'fysisk anker for småskala redaksjonell og subkulturell infrastruktur',
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

function updateStreetEvidence(file, place, geocode, sourceName, sourceUrl, sourceId) {
  const evidence = read(file);
  const c = geocode.coordinate;
  evidence.placeFile = 'data/places/by/oslo/places_by.json';
  evidence.evidenceStatus = 'applied_to_place';
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
      sourceObjectId: sourceId,
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
  evidence.sourceObjectCandidates = [{ sourceProvider: 'official_address', sourceObjectId: geocode.sourceObjectId, canApplyToPlace: true }];
  evidence.geometryCandidates = [];
  evidence.coordinateCandidates = [{ lat: c.lat, lon: c.lon, coordRole: 'line_anchor', canApplyToPlace: true }];
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

write(`${reportRoot}/torggata-blad-coordinate-evidence.json`, {
  placeId: 'torggata_blad',
  placeFile: 'data/places/subkultur/oslo/places_subkultur.json',
  historicalIdentity: 'Torggata Blads historiske redaksjons- og Aktbo-kontorsted i Hausmannsgate 19, 6. etasje.',
  primarySources: [
    {
      source: 'Torggata Blad nr. 2, 2007',
      url: 'https://torggatablad.no/wp-content/uploads/2020/04/torggatablad_nr02_07_web.pdf',
      finding: 'Redaksjonen oppgir at den holder til i Hausmannsgate 19, 6. etasje, med takterrasse på baksiden.',
    },
    {
      source: 'Torggata Blad nr. 1 og nr. 2, 2008',
      url: 'https://torggatablad.no/torggata-blad-total/',
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

const rad = (n) => n * Math.PI / 180;
function distance(a, b) {
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const after = {
  torggata: { lat: torggata.lat, lon: torggata.lon, r: torggata.r },
  storgata: { lat: storgata.lat, lon: storgata.lon, r: storgata.r },
  torggata_blad: { lat: blad.lat, lon: blad.lon, r: blad.r },
};
const movement = {};
for (const id of Object.keys(after)) {
  const movedMeters = Math.round(distance(before[id], after[id]));
  if (movedMeters < 20) throw new Error(`${id}: marker moved only ${movedMeters} m`);
  movement[id] = {
    old: before[id],
    new: after[id],
    movedMeters,
    sourceObjectId: geo[id].sourceObjectId,
  };
}
write(`${reportRoot}/marker-movement.json`, movement);
write(`${reportRoot}/applied-summary.json`, { appliedAt: new Date().toISOString(), addresses: geo, movement });

const readme = `# Oslo address anchor repair — Torggata, Storgata og Torggata Blad\n\n## Bakgrunn\n\nDenne reparasjonen gjenopptar den normative Geonorge-løypen fra de vellykkede adressebatchene og erstatter den senere gategeometri/status-tilnærmingen som lot feil hovedkoordinater stå.\n\n## Anvendte adresseankre\n\n- \`torggata\` → **Torggata 22, Oslo** — \`${geo.torggata.sourceObjectId}\` — \`${torggata.lat}, ${torggata.lon}\`.\n- \`storgata\` → **Storgata 26, Oslo** — \`${geo.storgata.sourceObjectId}\` — \`${storgata.lat}, ${storgata.lon}\`.\n- \`torggata_blad\` → historisk redaksjonssted **Hausmannsgate 19, 6. etasje**, dokumentert i Torggata Blads egne 2007–2008-utgaver. Dagens offisielle **Hausmanns gate 19A** brukes som displayanker — \`${geo.torggata_blad.sourceObjectId}\` — \`${blad.lat}, ${blad.lon}\`.\n\nDet generiske Geonorge-oppslaget \`Hausmanns gate 19 Oslo\` returnerte flere kandidater og ble derfor ikke brukt som koordinatkilde. Primærpublikasjonene dokumenterer nummer 19 og 6. etasje, men ikke dagens A/B-bokstav. Bruken av 19A er eksplisitt registrert som en moderne adresse-normalisering for det historiske kontorstedet, ikke som et historisk sitat.\n\n## Gate-regel\n\nFor Torggata og Storgata dokumenterer Oslo byleksikon selve gateløpet. Geonorge-adressepunktet brukes som konkret representativ hovedmarkør innenfor gateløpet. \`locatorType\` forblir \`street\`, \`coordRole\` er \`line_anchor\`, og koordinatet er ikke et beregnet midtpunkt.\n\n## Faktisk markørflytting\n\n- \`torggata\`: **${movement.torggata.movedMeters} m**\n- \`storgata\`: **${movement.storgata.movedMeters} m**\n- \`torggata_blad\`: **${movement.torggata_blad.movedMeters} m**\n\nKilde, splitfil, aggregat, kategoriindeks og global \`places_index.json\` synkroniseres og valideres i batchjobben.\n`;
fs.mkdirSync(path.join(root, reportRoot), { recursive: true });
fs.writeFileSync(path.join(root, reportRoot, 'README.md'), readme);

console.log(JSON.stringify(movement, null, 2));
