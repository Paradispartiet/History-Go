import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const aggregatePath = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv.json');
const splitDir = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv');
const categoryIndexPath = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv_index.json');
const splitManifestPath = path.join(root, 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json');
const evidenceRoot = path.join(root, 'data/coordinate-evidence');
const evidenceManifestPath = path.join(evidenceRoot, 'manifest.json');
const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-26');
const today = '2026-07-19';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const writeJsonAndHash = (file, value) => {
  const text = JSON.stringify(value, null, 2) + '\n';
  fs.writeFileSync(file, text);
  return sha256(text);
};

const verified = {
  myrens_verksted: {
    lat: 59.9346455,
    lon: 10.7594222,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:99757039',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'site_center',
    coordType: 'site_center',
    coordStatus: 'verified_geometry',
    coordSource: 'osm',
    coordSourceId: 'osm-way:99757039',
    coordSourceUrl: 'https://www.openstreetmap.org/way/99757039',
    coordVerifiedAt: today,
    coordNote: 'Navngitt OSM-områdeobjekt for Myrens Verksted, kryssjekket mot Oslo byleksikons identifikasjon av fabrikkanlegget i Sandakerveien 24c og dagens Myren Eiendom. Punktet er geometrisk senter for det navngitte komplekset og brukes som display-/site-center, ikke som påstått sentrum for én bestemt fabrikkbygning.'
  },
  christiania_seildugsfabrik: {
    lat: 59.9253444010033,
    lon: 10.75475549771365,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-adresser-v1:0301:11891:24',
    address: {
      street: 'Fossveien',
      number: '24',
      postcode: '0551',
      city: 'Oslo',
      country: 'NO'
    },
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-adresser-v1:0301:11891:24',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Fossveien%2024%20Oslo',
    coordVerifiedAt: today,
    coordNote: 'Offisiell adressekoordinat fra Geonorge for Fossveien 24, kryssjekket mot Oslo byleksikons identifikasjon av Christiania Seildugsfabrik på denne adressen. Punktet brukes som representativ display-marker for det bevarte fabrikkanlegget.'
  }
};

const aggregate = readJson(aggregatePath);
const categoryIndex = readJson(categoryIndexPath);
const splitManifest = readJson(splitManifestPath);
const metadataFields = [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource',
  'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote'
];

for (const [id, patch] of Object.entries(verified)) {
  const splitPath = path.join(splitDir, `${id}.json`);
  const split = readJson(splitPath);
  const aggregateRow = aggregate.find((item) => item?.id === id);
  const indexRow = categoryIndex.find((item) => item?.id === id);
  const manifestRow = splitManifest.places.find((item) => item?.id === id);
  if (!aggregateRow || !indexRow || !manifestRow) throw new Error(`Mangler sync-rad for ${id}`);
  for (const [key, value] of Object.entries(patch)) {
    split[key] = value;
    aggregateRow[key] = value;
  }
  manifestRow.sha256 = writeJsonAndHash(splitPath, split);
  for (const field of metadataFields) {
    if (Object.prototype.hasOwnProperty.call(split, field)) indexRow[field] = split[field];
    else delete indexRow[field];
  }
}

const aggregateText = JSON.stringify(aggregate, null, 2) + '\n';
fs.writeFileSync(aggregatePath, aggregateText);
splitManifest.source_sha256 = sha256(aggregateText);
splitManifest.generated_at = new Date().toISOString();
writeJson(splitManifestPath, splitManifest);
writeJson(categoryIndexPath, categoryIndex);

const placeById = new Map(aggregate.map((p) => [p.id, p]));
const placeFile = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const snapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? ''
});

const specs = {
  gronlikaia: {
    status: 'needs_research', decision: 'needs_geometry',
    identity: { currentName: 'Grønlikaia', resolvedIdentity: 'bredt tidligere havne-/containerområde og dagens utviklingsområde på Grønlia', identityStatus: 'resolved_broad_area', identityProblem: 'Offisielle kilder dokumenterer Grønlikaia som et større utviklings- og havneområde. OSM-søket ga bare serviceveier med navnet Grønlikaia, ikke en arealgeometri som kan bære verified-status for hele stedet.', locatorTypeCandidate: 'quay', requiresSplit: false, splitReason: 'Området kan beholdes, men trenger dokumentert quay-/områdegeometri eller flere area-ankre.' },
    required: ['offisiell plan-/havnegeometri', 'eller flere kildebelagte area-/quay-ankre'],
    evidence: [{ sourceProvider: 'municipality', sourceName: 'Oslo kommune – utvikling av Grønlikaia', sourceUrl: 'https://aktuelt.oslo.kommune.no/feil-retning-i-utviklingen-av-gronlikaia', sourceObjectId: 'oslo-kommune:plan:gronlikaia', sourceQuality: 'official_area_identity', finding: 'Oslo kommune dokumenterer Grønlikaia som et større plan- og utviklingsområde knyttet til tidligere havnearealer.', canVerifyCoordinate: false, reason: 'Områdeidentitet er dokumentert, men batchen har ikke maskinsporbar arealgeometri.' }],
    next: 'Hent offisiell plan-/havnegeometri eller flere dokumenterte quay-/area-ankre før verified coordinate contract.'
  },
  myrens_verksted: {
    status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    identity: { currentName: 'Myrens Verksted', resolvedIdentity: 'det navngitte tidligere fabrikkomplekset Myrens Verksted ved Akerselva', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'poi', requiresSplit: false, splitReason: '' },
    required: ['dokumentert fysisk identitet', 'navngitt områdeobjekt', 'overlap-audit'],
    evidence: [
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Myrens Verksted', sourceUrl: 'https://oslobyleksikon.no/side/Myrens_Verksted', sourceObjectId: 'oslobyleksikon:myrens-verksted', sourceQuality: 'documented_physical_identity', finding: 'Kilden identifiserer Myrens Verksted som det nedlagte fabrikkanlegget ved Akerselva, med historisk adresse Sandakerveien 24c.', canVerifyCoordinate: true, reason: 'Løser fysisk identitet, mens Geonorge ikke har treff på 24C.' },
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Myrens Verksted', sourceUrl: 'https://www.openstreetmap.org/way/99757039', sourceObjectId: 'osm-way:99757039', sourceQuality: 'named_object_geometry', finding: 'OSM way 99757039 er et eksplisitt navngitt områdeobjekt for Myrens Verksted-komplekset.', canVerifyCoordinate: true, reason: 'Navngitt områdepresentasjon gir et sporbart fysisk site-center for komplekset.' }
    ],
    next: 'Navngitt OSM-kompleks og dokumentert fysisk identitet er anvendt på canonical place.'
  },
  christiania_seildugsfabrik: {
    status: 'applied_to_place', decision: 'do_not_change_coordinates_yet',
    identity: { currentName: 'Christiania Seildugsfabrik', resolvedIdentity: 'det bevarte fabrikkanlegget i Fossveien 24', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'building', requiresSplit: false, splitReason: '' },
    required: ['entydig offisiell adresse', 'dokumentert fysisk identitet'],
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Fossveien%2024%20Oslo', sourceObjectId: 'geonorge-adresser-v1:0301:11891:24', sourceQuality: 'official_address', finding: 'Geonorge returnerte ett tydelig adressetreff for Fossveien 24.', canVerifyCoordinate: true, reason: 'Adressepunktet kryssjekkes mot dokumentert fabrikkanlegg.' },
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Christiania Seildugsfabrik', sourceUrl: 'https://oslobyleksikon.no/side/Christiania_Seildugsfabrik', sourceObjectId: 'oslobyleksikon:christiania-seildugsfabrik', sourceQuality: 'documented_physical_identity', finding: 'Kilden identifiserer fabrikkanlegget som Fossveien 24.', canVerifyCoordinate: true, reason: 'Kilden kobler den aktive recorden til den entydige adressen.' }
    ],
    next: 'Offisielt adresseanker og dokumentert fysisk identitet er anvendt på canonical place.'
  },
  lilleborg_fabrikker: {
    status: 'needs_research', decision: 'needs_identity_split',
    identity: { currentName: 'Lilleborg Fabrikker', resolvedIdentity: 'historisk fabrikkmiljø ved Akerselva med fabrikkport i Sandakerveien 54 og administrasjonsbygg i Sandakerveien 56', identityStatus: 'conflict', identityProblem: 'Aktiv record bruker 1833 som etableringsår, men dette viser til en oljemølle på eiendommen. Såpefabrikk kom i 1842 og A/S Lilleborg Fabriker ble grunnlagt i 1897. Fabrikkområdet er dessuten delvis revet og ombygd, med flere mulige fysiske ankere.', locatorTypeCandidate: 'historic_site', requiresSplit: false, splitReason: 'Historisk identitet og representativt fysisk hovedanker må avklares før ett adressepunkt kan brukes.' },
    required: ['korrigert historisk identitet/år', 'valg av fabrikkport, administrasjonsbygg eller historisk område som place-scope'],
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Sandakerveien%2054%20Oslo', sourceObjectId: 'geonorge-adresser-v1:0301:16161:54', sourceQuality: 'official_address_candidate', finding: 'Sandakerveien 54 gir ett entydig adressepunkt for den dokumenterte fabrikkporten.', canVerifyCoordinate: false, reason: 'Fabrikkporten kan være et mulig anker, men recordens scope/år er ikke ryddet.' },
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Lilleborg AS', sourceUrl: 'https://oslobyleksikon.no/side/Lilleborg_AS', sourceObjectId: 'oslobyleksikon:lilleborg-as', sourceQuality: 'identity_history_audit', finding: 'Kilden skiller 1833-oljemøllen, 1842-såpeproduksjonen og selskapet Lilleborg Fabriker fra 1897, og dokumenterer flere fysiske bygg/adresser.', canVerifyCoordinate: false, reason: 'Aktiv record sammenblander tidslag og hele fabrikkomplekset.' }
    ],
    next: 'Rett år og place-scope; avgjør deretter om Sandakerveien 54, et annet bevart bygg eller historisk områdegeometri skal være canonical anker.'
  },
  akerselva_industri: {
    status: 'needs_research', decision: 'needs_geometry',
    identity: { currentName: 'Akerselva industriområde', resolvedIdentity: 'lang industrihistorisk korridor langs Akerselva med mange separate fabrikker og anlegg', identityStatus: 'conflict', identityProblem: 'Recorden beskriver en lang industriell korridor som overlapper canonical `akerselva` og flere egne industriplaces. Ett punkt ved Øvre Foss kan ikke representere hele korridoren.', locatorTypeCandidate: 'linear_area', requiresSplit: false, splitReason: 'Korridoren må modelleres med geometri/anchors eller som tematisk relasjon til Akerselva og de konkrete industristedene.' },
    required: ['lineær geometri eller flere industrikorridor-ankre', 'overlap-/modellavgjørelse mot canonical `akerselva` og konkrete industriplaces'],
    evidence: [{ sourceProvider: 'manual_research', sourceName: 'Norsk Teknisk Museum / Industrimuseum – Akerselva Digitalt', sourceUrl: 'https://www.industrimuseum.no/akerselvadigitalt', sourceObjectId: 'industrimuseum:akerselva-digitalt', sourceQuality: 'documented_linear_history', finding: 'Kilden dokumenterer en lang rekke separate industristeder langs Akerselva og tilbyr en kulturminnerute/KML snarere enn ett fysisk industriområdepunkt.', canVerifyCoordinate: false, reason: 'Tematisk korridor krever lineær geometri eller flere anchors.' }],
    next: 'Modeller som lineær industrikorridor med kildebelagte anchors/geometri, eller som tematisk relation til canonical Akerselva og de konkrete industriplacene.'
  }
};

for (const [id, spec] of Object.entries(specs)) {
  const place = placeById.get(id);
  if (!place) throw new Error(`Mangler place ${id}`);
  const applied = spec.status === 'applied_to_place';
  const evidence = {
    placeId: id,
    placeFile,
    evidenceStatus: spec.status,
    coordinateDecision: spec.decision,
    currentCoordinate: snapshot(place),
    identity: spec.identity,
    requiredEvidence: spec.required,
    evidence: spec.evidence,
    addressCandidates: spec.evidence.filter((e) => e.sourceProvider === 'official_address').map((e) => ({ sourceProvider: e.sourceProvider, sourceObjectId: e.sourceObjectId, canApplyToPlace: applied && e.canVerifyCoordinate })),
    sourceObjectCandidates: spec.evidence.map((e) => ({ sourceProvider: e.sourceProvider, sourceObjectId: e.sourceObjectId, canApplyToPlace: applied && e.canVerifyCoordinate })),
    geometryCandidates: [],
    coordinateCandidates: applied ? [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }] : [],
    decision: { canBecomeVerified: applied, blockedReason: applied ? '' : spec.identity.identityProblem, nextAction: spec.next },
    notes: [applied ? 'Koordinatkontrakt anvendt i batch 26.' : 'Ingen koordinatendring i batch 26.']
  };
  writeJson(path.join(evidenceRoot, 'oslo/naeringsliv', `${id}.json`), evidence);
}

const evidenceManifest = readJson(evidenceManifestPath);
for (const id of Object.keys(specs)) {
  const rel = `oslo/naeringsliv/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
}
writeJson(evidenceManifestPath, evidenceManifest);

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo koordinatkontroll – batch 26\n\nDato: 2026-07-19\n\nKontroll 161–165 avslutter næringslivsmanifestet. To steder får nye sporbare coordinate contracts; tre avsluttes som \`needs_review\`.\n\n| placeId | resultat | kilde / avgjørelse |\n|---|---|---|\n| \`gronlikaia\` | needs_review | bredt quay-/utviklingsområde uten kildebelagt geometri |\n| \`myrens_verksted\` | verified_geometry | \`osm-way:99757039\` |\n| \`christiania_seildugsfabrik\` | verified | \`geonorge-adresser-v1:0301:11891:24\` |\n| \`lilleborg_fabrikker\` | needs_review | 1833/1842/1897-identitetskonflikt og flere fysiske ankere |\n| \`akerselva_industri\` | needs_review | bred lineær industrikorridor som overlapper Akerselva og konkrete industriplaces |\n`);

let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol.replace(
  /Oslo-tabellen inneholder fortsatt 135 verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 137 verifiserte eller kildekontrollerte canonical steder. Batch 26 avslutter næringslivsmanifestet med to nye godkjente ankere: Myrens Verksted som navngitt OSM-kompleks og Christiania Seildugsfabrik i Fossveien 24. `gronlikaia`, `lilleborg_fabrikker` og `akerselva_industri` står som nye dokumenterte `needs_review`-utfall. 30 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat.'
);
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 135 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 137 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);

const batch24Anchor = '| 24 | `akershus_slott_bakeriet` | Bakeriet ved Akershus | verified_geometry | `osm-way:669390521` |';
if (!protocol.includes('| 26 | `myrens_verksted`')) {
  protocol = protocol.replace(batch24Anchor, `${batch24Anchor}\n| 26 | \`myrens_verksted\` | Myrens Verksted | verified_geometry | \`osm-way:99757039\` |\n| 26 | \`christiania_seildugsfabrik\` | Christiania Seildugsfabrik | verified | \`geonorge-adresser-v1:0301:11891:24\` |`);
}

const needsAnchor = '| `bryn_industriomrade` – Bryn industriområde | needs_review | Bryn er et stort industri- og boligstrøk på tvers av flere bydeler; recorden har ett punkt, men ingen dokumentert avgrensning av hvilket industriområde den representerer. | Definer fysisk scope og legg inn offisiell områdegeometri eller flere area-ankre. |';
const needsRows = `${needsAnchor}\n| \`gronlikaia\` – Grønlikaia | needs_review | Grønlikaia er et bredt tidligere havne-/containerområde og dagens utviklingsområde; batchens OSM-treff er serviceveier, ikke arealgeometri for hele stedet. | Hent offisiell plan-/havnegeometri eller flere dokumenterte quay-/area-ankre. |\n| \`lilleborg_fabrikker\` – Lilleborg Fabrikker | needs_review | Aktiv record bruker 1833, mens dette viser til oljemøllen; såpeproduksjon kom i 1842 og A/S Lilleborg Fabriker i 1897. Fabrikkomplekset har flere mulige fysiske ankere. | Rett historisk identitet/år og avgjør om fabrikkport, bevart bygg eller historisk områdegeometri skal være canonical anker. |\n| \`akerselva_industri\` – Akerselva industriområde | needs_review | Recorden beskriver en lang industrikorridor som overlapper canonical \`akerselva\` og flere separate industriplaces; ett punkt kan ikke representere hele systemet. | Legg inn lineær geometri/flere anchors eller modeller som tematisk relation til Akerselva og konkrete industristeder. |`;
if (!protocol.includes(needsRows.split('\n')[1])) {
  if (!protocol.includes(needsAnchor)) throw new Error('Mangler needs-review anker');
  protocol = protocol.replace(needsAnchor, needsRows);
}

protocol = protocol.replace('- Neste nye Oslo-kontroll er nummer 161 og starter batch 26.', '- Neste nye Oslo-kontroll er nummer 166 og starter batch 27.');
protocol = protocol.replace('- Batch 25 er fullført med null nye godkjente ankere og sju nye dokumenterte `needs_review`-utfall.', '- Batch 26 er fullført med to nye godkjente ankere og tre nye dokumenterte `needs_review`-utfall; `places_naeringsliv_manifest.json` er nå ferdig kontrollert.');
protocol = protocol.replace('- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `bryn_industriomrade`; `gronlikaia` er neste kandidat.', '- Næringslivsmanifestet er uttømt etter `akerselva_industri`. Før batch 27 starter skal neste sekundære Oslo-kildekø auditeres eksplisitt; ikke gjett neste manifest eller kategori.');
fs.writeFileSync(protocolPath, protocol);

console.log('Batch 26 applied: 2 verified coordinate contracts, 3 needs_review records, control advanced to 166.');
