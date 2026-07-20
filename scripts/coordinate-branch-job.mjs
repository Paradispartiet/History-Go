import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const VERIFIED_AT = '2026-07-20';
const PLACE_FILE = 'data/places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json';
const PLACE_MANIFEST_ENTRY = 'places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/litteratur/ibsen_museum_teater.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/litteratur/ibsen_museum_teater.json';

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

assertNoActivePlaceId('ibsen_museum_teater');
if (fs.existsSync(abs(PLACE_FILE))) throw new Error('ibsen_museum_teater: place file already exists');
if (fs.existsSync(abs(EVIDENCE_FILE))) throw new Error('ibsen_museum_teater: evidence file already exists');

const place = {
  id: 'ibsen_museum_teater',
  name: 'IBSEN Museum & Teater',
  lat: 59.91515703089785,
  lon: 10.726845708120743,
  r: 60,
  category: 'litteratur',
  year: 1895,
  desc: 'Litteraturmuseum og kulturhus for Henrik Ibsens liv og dramatikk. Dagens publikumsinngang ligger i Henrik Ibsens gate 26, mens museets historiske kjerne er Ibsens siste hjem i Arbins gate 1, der Henrik og Suzannah Ibsen bodde fra 1895 til 1906.',
  popupDesc: 'IBSEN Museum & Teater forvalter, forsker på og formidler Henrik Ibsens liv og dramatikk. Dagens besøk starter i Henrik Ibsens gate 26, men museets viktigste historiske rom ligger i den bevarte leiligheten i Arbins gate 1. Henrik og Suzannah Ibsen flyttet inn her i 1895, og Ibsen bodde i leiligheten de siste elleve årene av livet. Her skrev han sine to siste skuespill.\n\nLeiligheten er tilbakeført med Ibsens egne møbler og inventar, opprinnelige farger og dekor. Museumstilbudet knytter dermed et konkret forfatterhjem til utstillinger og teaterformidling i et moderne kulturhus. I History Go brukes publikumsinngangen i Henrik Ibsens gate 26 som display- og unlock-anker fordi det er den offisielle besøksadressen. Arbins gate 1 skal samtidig bevares eksplisitt som det historiske Ibsen-laget og aldri erstattes av den moderne inngangsadressen i spørsmål om forfatterens hjem og liv.',
  emne_ids: [
    'em_lit_drama_scene_og_teatertekst',
    'em_lit_forfatterskap_verk_og_liv'
  ],
  quiz_profile: {
    place_type: 'litteraturmuseum_og_forfatterhjem',
    subtype: 'ibsen_hjem_museum_og_teater',
    signature_features: [
      'dagens publikumsinngang ligger i Henrik Ibsens gate 26',
      'den historiske kjernen er Henrik og Suzannah Ibsens leilighet i Arbins gate 1',
      'Ibsen bodde i leiligheten fra 1895 til sin død i 1906',
      'her skrev han sine to siste skuespill',
      'leiligheten er tilbakeført med Ibsens egne møbler, inventar, farger og dekor'
    ],
    primary_angles: ['forfatterliv', 'dramatikk', 'forfatterhjem', 'museumshistorie', 'teaterformidling'],
    question_families: ['Ibsens_liv', 'forfatterhjem', 'verk_og_sted', 'museum_og_minne', 'kontrast'],
    avoid_angles: [
      'forveksle_publikumsinngangen_med_den_historiske_bostedsadressen',
      'generisk_forfattermuseum',
      'behandle_Arbins_gate_1_som_en_tilfeldig_sideadresse'
    ],
    must_include: [
      'skillet mellom dagens publikumsinngang og den historiske leiligheten',
      'Ibsens botid i Arbins gate 1 fra 1895 til 1906',
      'forbindelsen mellom hjemmet, de siste skuespillene og dagens museumsteater'
    ],
    contrast_targets: ['ibsen_quotes', 'nationaltheatret', 'ibsen_museet_grimstad'],
    notes: 'Coordinate/display-marker skal peke på den offisielle publikumsinngangen i Henrik Ibsens gate 26. Historiske spørsmål om Ibsens hjem skal eksplisitt bruke Arbins gate 1. De to adresselagene må ikke blandes.'
  },
  underbadge_ids: ['drama'],
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:21471:26',
  address: { street: 'Henrik Ibsens gate', number: '26', postcode: '0255', city: 'Oslo', country: 'NO' },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:21471:26',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Henrik%20Ibsens%20gate%2026%20Oslo',
  coordType: 'address_point',
  coordVerifiedAt: VERIFIED_AT,
  coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Henrik Ibsens gate 26, OSLO. Punktet er museets nåværende offentlige besøksinngang og brukes som display/unlock-marker. Henrik Ibsens historiske leilighet i Arbins gate 1 bevares som separat historisk adresselag i innholdet og skal ikke erstattes av publikumsadressen.',
  externalLinks: [
    { type: 'official', label: 'IBSEN Museum & Teater – om oss', url: 'https://ibsenmt.no/om-oss', lang: 'nb', verifiedAt: VERIFIED_AT },
    { type: 'official', label: 'IBSEN Museum & Teater – Henrik Ibsens leilighet', url: 'https://ibsenmt.no/en/the-home-of-henrik-ibsen', lang: 'en', verifiedAt: VERIFIED_AT },
    { type: 'official', label: 'IBSEN Museum & Teater – besøk oss', url: 'https://ibsenmt.no/besok-oss', lang: 'nb', verifiedAt: VERIFIED_AT }
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
    resolvedIdentity: 'IBSEN Museum & Teater with current public visitor entrance at Henrik Ibsens gate 26 and historical Henrik Ibsen apartment layer at Arbins gate 1',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for dagens publikumsinngang',
    'offisiell museumsdokumentasjon av besøksadressen',
    'eksplisitt bevaring av Arbins gate 1 som historisk leilighetslag'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'official_address_plus_documented_visitor_identity',
      finding: 'Geonorge gir et eksakt adressetreff for Henrik Ibsens gate 26. IBSEN Museum & Teater oppgir samme adresse som dagens besøksadresse, mens museets egen dokumentasjon identifiserer Arbins gate 1 som Henrik Ibsens historiske hjem.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }
  ],
  addressCandidates: [
    { address: 'Henrik Ibsens gate 26 Oslo', sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true },
    { address: 'Arbins gate 1 Oslo', sourceProvider: 'manual_research', sourceObjectId: 'ibsenmt:historical-apartment-arbins-gate-1', canApplyToPlace: false }
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
    nextAction: 'Public visitor entrance is applied as canonical display marker; Arbins gate 1 remains the historical apartment layer in place content.'
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
  'Oslo-tabellen inneholder nå 195 verifiserte eller kildekontrollerte canonical steder. Batch 49 legger til Jødisk Museum i Oslo og Det internasjonale Barnekunstmuseet med entydige offisielle Geonorge-adressepunkter, samtidig som protokollen skiller fysisk koordinatverifikasjon fra midlertidig stengt publikumsdrift. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 37.',
  'Oslo-tabellen inneholder nå 196 verifiserte eller kildekontrollerte canonical steder. Batch 50 legger til IBSEN Museum & Teater med den offisielle publikumsinngangen i Henrik Ibsens gate 26 som verifisert display-anker, mens Arbins gate 1 bevares som det historiske leilighetslaget. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 37.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 49 | `det_internasjonale_barnekunstmuseet` | Det internasjonale Barnekunstmuseet | verified | `geonorge-adresser-v1:0301:14283:4` |',
  '| 49 | `det_internasjonale_barnekunstmuseet` | Det internasjonale Barnekunstmuseet | verified | `geonorge-adresser-v1:0301:14283:4` |\n| 50 | `ibsen_museum_teater` | IBSEN Museum & Teater | verified | `geonorge-adresser-v1:0301:21471:26` |',
  'Batch 50 row'
);
protocol = replaceOnce(
  protocol,
  'Batch 49 (2026-07-20) fullfører de to status-sensitive standardkandidatene fra museumsauditen. `jodisk_museum_oslo` bruker Calmeyers gate 15B som fysisk museums- og kulturminneanker; museumsbygget er stengt for renovering fra 1. mai 2026 med estimert gjenåpning høsten 2028, men undervisning og byvandringer fortsetter utenfor bygget. `det_internasjonale_barnekunstmuseet` bruker Lille Frøens vei 4 som fysisk museumsanker; ordinære åpningstider har vært innstilt siden 8. desember 2025 og det finnes per 20. juli 2026 ingen fast gjenåpningsdato. `verified` i denne tabellen gjelder koordinat og fysisk identitet, ikke aktuell publikumsåpning.',
  'Batch 49 (2026-07-20) fullfører de to status-sensitive standardkandidatene fra museumsauditen. `jodisk_museum_oslo` bruker Calmeyers gate 15B som fysisk museums- og kulturminneanker; museumsbygget er stengt for renovering fra 1. mai 2026 med estimert gjenåpning høsten 2028, men undervisning og byvandringer fortsetter utenfor bygget. `det_internasjonale_barnekunstmuseet` bruker Lille Frøens vei 4 som fysisk museumsanker; ordinære åpningstider har vært innstilt siden 8. desember 2025 og det finnes per 20. juli 2026 ingen fast gjenåpningsdato. `verified` i denne tabellen gjelder koordinat og fysisk identitet, ikke aktuell publikumsåpning.\n\nBatch 50 (2026-07-20) fullfører den siste spesialkoordinatsaken fra museumsauditen. `ibsen_museum_teater` bruker det eksakte Geonorge-punktet for dagens offisielle publikumsinngang i Henrik Ibsens gate 26 som display- og unlock-anker. Museets historiske kjerne er Henrik og Suzannah Ibsens leilighet i Arbins gate 1, der de bodde fra 1895 til 1906; denne adressen bevares eksplisitt som historisk lag og skal ikke erstattes av den moderne besøksadressen i litteraturhistorisk innhold.',
  'Batch 50 note'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 195 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 196 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Created IBSEN Museum & Teater as Oslo coordinate batch 50.');
