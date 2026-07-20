import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const VERIFIED_AT = '2026-07-20';
const PLACE_FILE = 'data/places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json';
const PLACE_MANIFEST_ENTRY = 'places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/vitenskap/oslo_reptilpark.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/vitenskap/oslo_reptilpark.json';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected text not found`);
  if (text.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: expected exactly one match`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}
function assertNoActivePlaceId(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const row of rowsFrom(readJson(rel))) {
      if (row?.id === placeId) hits.push(rel);
    }
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}

assertNoActivePlaceId('oslo_reptilpark');
if (fs.existsSync(abs(PLACE_FILE))) throw new Error('oslo_reptilpark: place file already exists');
if (fs.existsSync(abs(EVIDENCE_FILE))) throw new Error('oslo_reptilpark: evidence file already exists');

const place = {
  id: 'oslo_reptilpark',
  name: 'Oslo Reptilpark',
  lat: 59.918158949801764,
  lon: 10.74326746089802,
  r: 60,
  category: 'vitenskap',
  year: 2002,
  desc: 'Zoologisk formidlingssted med levende dyr i Oslo sentrum. Oslo Reptilpark åpnet i Storgata i 2002 og flyttet til dagens lokaler i St. Olavs gate 2 i 2007.',
  popupDesc: 'Oslo Reptilpark åpnet dørene første gang i Storgata 10. januar 2002. I september 2007 flyttet dyrene inn i større lokaler i St. Olavs gate 2, som fortsatt er parkens besøksadresse. Her møter publikum levende reptiler og andre dyr i et innendørs zoologisk formidlingsmiljø.\n\nI History Go behandles Reptilparken som et vitenskaps- og formidlingssted, ikke som et naturlig habitat. Spørsmål skal starte i konkrete dyr, artskunnskap, biologiske tilpasninger, dyrehold og institusjonens dokumenterte historie. Dagens Geonorge-punkt representerer besøksbygget i St. Olavs gate 2. Det skal ikke brukes som om parken lå på denne adressen da den åpnet i 2002; den opprinnelige Storgata-perioden bevares som et eget historisk lag.',
  emne_ids: [
    'em_vit_miljo_okologi_system',
    'em_vit_kunnskap_formidling_utdanning'
  ],
  quiz_profile: {
    place_type: 'zoologisk_formidlingssted',
    subtype: 'levende_dyresamling_og_publikumsformidling',
    signature_features: [
      'åpnet i Storgata 10. januar 2002',
      'flyttet til større lokaler i St. Olavs gate 2 i september 2007',
      'formidler zoologi gjennom møter med levende reptiler og andre dyr'
    ],
    primary_angles: ['zoologi', 'artsformidling', 'biologiske_tilpasninger', 'dyrehold', 'institusjonshistorie'],
    question_families: ['institusjonshistorie', 'artsfakta', 'tilpasning_og_biologi', 'formidling', 'kontrast'],
    avoid_angles: [
      'generisk_turistattraksjon',
      'anta_at_dagens_adresse_er_opprinnelig_2002_lokasjon',
      'bruke_levende_dyr_som_bevis_for_vilt_habitat_i_oslo'
    ],
    must_include: [
      'åpningen i Storgata i 2002',
      'flyttingen til St. Olavs gate 2 i 2007',
      'rollen som offentlig zoologisk formidlingssted'
    ],
    contrast_targets: ['naturhistorisk_museum', 'botanisk_hage', 'teknisk_museum'],
    notes: 'Synlige spørsmål skal bygge på konkrete eksterne dyre-, arts- og stedsfakta. Emner brukes som faglig ramme. Stedet er en innendørs samling og formidlingsarena, ikke et naturlig Oslo-habitat.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:16935:2',
  address: { street: 'St. Olavs gate', number: '2', postcode: '0165', city: 'Oslo', country: 'NO' },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:16935:2',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=St.%20Olavs%20gate%202%20Oslo',
  coordType: 'address_point',
  coordVerifiedAt: VERIFIED_AT,
  coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for St. Olavs gate 2, OSLO. Punktet er representasjonspunktet for Oslo Reptilparks nåværende besøksadresse og brukes som display-marker. Institusjonen åpnet først i Storgata i 2002 og flyttet til dagens adresse i 2007; koordinaten skal derfor ikke leses som opprinnelig 2002-lokasjon.',
  externalLinks: [
    { type: 'official', label: 'Oslo Reptilpark – om oss', url: 'https://www.reptilpark.no/om-oss', lang: 'nb', verifiedAt: VERIFIED_AT },
    { type: 'official', label: 'Oslo Reptilpark – slik finner du oss', url: 'https://www.reptilpark.no/slik-finner-du-oss', lang: 'nb', verifiedAt: VERIFIED_AT },
    { type: 'official', label: 'Oslo Reptilpark – åpningstider', url: 'https://www.reptilpark.no/apningstider', lang: 'nb', verifiedAt: VERIFIED_AT }
  ]
};
writeJson(PLACE_FILE, place);

writeJson(EVIDENCE_FILE, {
  placeId: place.id,
  placeFile: PLACE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
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
    currentName: place.name,
    resolvedIdentity: 'Oslo Reptilpark at its current public visitor premises in St. Olavs gate 2, with the original 2002 Storgata location retained only as institutional history',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for dagens besøksadresse',
    'offisiell institusjonsdokumentasjon av dagens adresse',
    'eksplisitt skille mellom åpningen i Storgata i 2002 og dagens lokaler fra 2007'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'official_address_plus_documented_visitor_identity',
      finding: 'Geonorge gir et eksakt adressetreff for St. Olavs gate 2. Oslo Reptilpark oppgir samme adresse som dagens besøksadresse, og parkens egen historikkside dokumenterer at institusjonen åpnet i Storgata i 2002 og flyttet til St. Olavs gate 2 i september 2007.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }
  ],
  addressCandidates: [
    { address: 'St. Olavs gate 2 Oslo', sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }
  ],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Current St. Olavs gate 2 visitor address is applied as canonical display marker; the 2002 Storgata opening remains an institutional-history layer rather than coordinate identity.'
  },
  notes: [place.coordNote]
});

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_MANIFEST_ENTRY)) throw new Error(`${PLACE_MANIFEST_ENTRY}: already in place manifest`);
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) throw new Error(`${EVIDENCE_MANIFEST_ENTRY}: already in evidence manifest`);
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
protocol = replaceOnce(
  protocol,
  'Oslo-tabellen inneholder nå 196 verifiserte eller kildekontrollerte canonical steder. Duplikatet `nrk_marienlyst` er migrert til `nrk_huset_marienlyst` uten å opprette et nytt fysisk sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 36.',
  'Oslo-tabellen inneholder nå 197 verifiserte eller kildekontrollerte canonical steder. Batch 51 legger til Oslo Reptilpark med det entydige Geonorge-punktet for dagens besøksadresse i St. Olavs gate 2, samtidig som åpningen i Storgata i 2002 bevares som et separat historisk lokaliseringslag. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 36.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 50 | `ibsen_museum_teater` | IBSEN Museum & Teater | verified | `geonorge-adresser-v1:0301:21471:26` |',
  '| 50 | `ibsen_museum_teater` | IBSEN Museum & Teater | verified | `geonorge-adresser-v1:0301:21471:26` |\n| 51 | `oslo_reptilpark` | Oslo Reptilpark | verified | `geonorge-adresser-v1:0301:16935:2` |',
  'Batch 51 row'
);
const batch50Paragraph = 'Batch 50 (2026-07-20) fullfører den siste spesialkoordinatsaken fra museumsauditen. `ibsen_museum_teater` bruker det eksakte Geonorge-punktet for dagens offisielle publikumsinngang i Henrik Ibsens gate 26 som display- og unlock-anker. Museets historiske kjerne er Henrik og Suzannah Ibsens leilighet i Arbins gate 1, der de bodde fra 1895 til 1906; denne adressen bevares eksplisitt som historisk lag og skal ikke erstattes av den moderne besøksadressen i litteraturhistorisk innhold.';
protocol = replaceOnce(
  protocol,
  batch50Paragraph,
  `${batch50Paragraph}\n\nBatch 51 (2026-07-20) starter den avgrensede completeness-passeringen for VisitOSLO-attraksjoner utenfor museumskategorien. \`oslo_reptilpark\` bruker det entydige Geonorge-adressepunktet \`geonorge-adresser-v1:0301:16935:2\` for St. Olavs gate 2 som dagens bygnings- og displayanker. Oslo Reptilparks egen historikk dokumenterer at institusjonen åpnet i Storgata 10. januar 2002 og flyttet til større lokaler i St. Olavs gate 2 i september 2007. Dagens koordinat representerer derfor nåværende besøkssted, ikke den opprinnelige 2002-lokasjonen.`,
  'Batch 51 narrative'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 196 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 197 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Oslo unresolved count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log('Created Oslo Reptilpark as Oslo coordinate batch 51.');
