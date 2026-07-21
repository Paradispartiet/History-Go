import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const ID = 'holmenkollen_skimuseum';
const PLACE_FILE = 'data/places/historie/oslo/places_historie/holmenkollen_skimuseum.json';
const PLACE_MANIFEST_ENTRY = 'places/historie/oslo/places_historie/holmenkollen_skimuseum.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/historie/holmenkollen_skimuseum.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/historie/holmenkollen_skimuseum.json';
const DECISION_FILE = 'reports/visitoslo-holmenkollen-audit-20260721/coordinate-intake/holmenkollen_skimuseum/decision.json';
const PRODUCTION_REPORT = 'reports/visitoslo-holmenkollen-audit-20260721/production/holmenkollen_skimuseum.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const rowsFrom = (data) => Array.isArray(data)
  ? data
  : Array.isArray(data?.places)
    ? data.places
    : Array.isArray(data?.items)
      ? data.items
      : data?.id
        ? [data]
        : [];

const decision = readJson(DECISION_FILE);
if (decision.placeId !== ID || decision.productionGate !== 'ready_for_canonical_production') {
  throw new Error('Skimuseet clean intake decision is missing or not production-ready');
}

for (const entry of readJson(PLACE_MANIFEST).files || []) {
  const rel = `data/${entry}`;
  if (!fs.existsSync(abs(rel))) continue;
  if (rowsFrom(readJson(rel)).some((row) => row?.id === ID)) {
    throw new Error(`${ID}: active canonical place already exists in ${rel}`);
  }
}
if (fs.existsSync(abs(PLACE_FILE)) || fs.existsSync(abs(EVIDENCE_FILE))) {
  throw new Error(`${ID}: target place/evidence files already exist`);
}

execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
const addressAttempt = spawnSync(
  process.execPath,
  ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Kongeveien 40 Oslo'],
  { cwd: ROOT, encoding: 'utf8' }
);
if (addressAttempt.stdout) process.stdout.write(addressAttempt.stdout);
if (addressAttempt.stderr) process.stderr.write(addressAttempt.stderr);
if (addressAttempt.status !== 0) throw new Error(`Address finder exited ${addressAttempt.status}`);
const addressResult = JSON.parse(String(addressAttempt.stdout || '').trim());
if (addressResult.status !== 'verified_candidate') {
  throw new Error(`Expected verified Kongeveien 40 result, got ${addressResult.status}`);
}
if (addressResult.sourceObjectId !== decision.coordinate.sourceObjectId) {
  throw new Error(`Locked source mismatch: ${addressResult.sourceObjectId} !== ${decision.coordinate.sourceObjectId}`);
}
const c = addressResult.coordinate;
const locked = decision.coordinate;
if (Math.abs(Number(c.lat) - Number(locked.lat)) > 1e-9 || Math.abs(Number(c.lon) - Number(locked.lon)) > 1e-9) {
  throw new Error('Kongeveien 40 coordinate changed since the locked intake');
}

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Kongeveien 40, OSLO, brukt som bygnings-, display- og unlock-marker for Skimuseet i Holmenkollen. Museet er en egen vedvarende institusjon inne i Holmenkollen nasjonalanlegg, mens hopptårnet og det bredere arenaområdet fortsatt representeres av `holmenkollen_nasjonalanlegg`.';

const place = {
  id: ID,
  visual: {
    designCode: 'museum_miniature'
  },
  name: 'Skimuseet i Holmenkollen',
  lat: Number(c.lat),
  lon: Number(c.lon),
  r: 55,
  category: 'historie',
  year: 1923,
  rounds_exclude: [
    'nature',
    'training'
  ],
  desc: 'Skimuseum etablert i 1923 og i dag plassert inne i Holmenkollen-anlegget. Museet formidler norsk ski- og polarhistorie gjennom samlinger som spenner fra tidlige ski og friluftsliv til moderne vintersport.',
  popupDesc: 'Skimuseet i Holmenkollen ble etablert i 1923 med utgangspunkt i samlingen til arkitekt og slottsforvalter Hjalmar Welhaven. Museet regnes som verdens eldste spesialmuseum for ski og forvalter en lang historie om ski, friluftsliv, polarekspedisjoner og vintersport. I forbindelse med vinter-OL i Oslo i 1952 ble museet flyttet fra Frognerseteren til Holmenkollbakken. Senere fulgte større utvidelser, blant annet lokaler sprengt inn i fjellet i 1983, og museet fikk ny foajé og kafé ved hundreårsjubileet i 2023.\n\nI History Go behandles Skimuseet og Holmenkollen nasjonalanlegg som to relaterte, men forskjellige steder. `holmenkollen_nasjonalanlegg` representerer hoppbakken, hopptårnet og det bredere idrettsanlegget. `holmenkollen_skimuseum` representerer den vedvarende museumsinstitusjonen, samlingene og den egne besøksfunksjonen ved Kongeveien 40. At én billett i dag kan omfatte både museum og hopptårn er et besøksprodukt, ikke grunnlag for å slå sammen de to canonical identitetene.',
  emne_ids: [
    'em_his_spor_materialitet',
    'em_his_historiske_lag_i_byrom',
    'em_his_kulturminner_bevaring',
    'em_his_samtid_ettertid_fortelling'
  ],
  quiz_profile: {
    place_type: 'skimuseum_i_idrettsanlegg',
    subtype: 'ski_og_polarhistorisk_spesialmuseum',
    signature_features: [
      'etablert i 1923',
      'flyttet til Holmenkollbakken i forbindelse med OL-perioden rundt 1952',
      'egen museuminstitusjon inne i det bredere Holmenkollen nasjonalanlegg'
    ],
    primary_angles: [
      'skihistorie',
      'museum_og_samling',
      'polarhistorie',
      'friluftsliv',
      'museum_vs_arena'
    ],
    question_families: [
      'institusjonshistorie',
      'gjenstand_og_spor',
      'ski_og_friluftsliv',
      'polarhistorie',
      'museum_vs_arena'
    ],
    avoid_angles: [
      'generisk_sportsmuseum',
      'duplisere_holmenkollen_nasjonalanlegg_som_hopptarn',
      'behandle_felles_billett_som_felles_fysisk_identitet',
      'anta_at_museet_har_ligget_i_holmenkollbakken_siden_1923'
    ],
    must_include: [
      'etableringen i 1923',
      'flyttingen fra Frognerseteren til Holmenkollbakken rundt OL i 1952',
      'den funksjonelle forskjellen mellom museet og nasjonalanlegget'
    ],
    contrast_targets: [
      'holmenkollen_nasjonalanlegg',
      'skoytemuseet',
      'norsk_idrettsmedisinsk_museum'
    ],
    notes: 'Synlige spørsmål skal starte i dokumentert museumshistorie, konkrete samlinger og fysisk utvikling. Arenaen og hopptårnet er relaterte kontekster, men ikke museets canonical identitet.'
  },
  related_place_ids: [
    'holmenkollen_nasjonalanlegg'
  ],
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: decision.coordinate.sourceObjectId,
  address: c.address,
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: decision.coordinate.sourceObjectId,
  coordSourceUrl: decision.coordinate.coordSourceUrl,
  coordType: 'address_point',
  coordVerifiedAt: '2026-07-21',
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Skimuseet i Holmenkollen – om museet',
      url: 'https://holmenkollen.com/om-skimuseet/',
      lang: 'nb',
      verifiedAt: '2026-07-21'
    },
    {
      type: 'official',
      label: 'Skimuseet i Holmenkollen – besøk og adkomst',
      url: 'https://holmenkollen.com/apningstider/',
      lang: 'nb',
      verifiedAt: '2026-07-21'
    },
    {
      type: 'reference',
      label: 'VisitOSLO – Holmenkollen Ski Museum & Tower',
      url: 'https://www.visitoslo.com/en/activities-and-attractions/boroughs/holmenkollen/attractions/?name=Holmenkollen-Ski-Museum--Tower&tlp=2992333',
      lang: 'en',
      verifiedAt: '2026-07-21'
    }
  ]
};
writeJson(PLACE_FILE, place);

const evidence = {
  placeId: ID,
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
    coordNote
  },
  identity: {
    currentName: 'Skimuseet i Holmenkollen',
    resolvedIdentity: 'Persistent Ski Museum institution at Kongeveien 40 inside the broader Holmenkollen National Ski Arena complex',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for Kongeveien 40',
    'dokumentert selvstendig museumsidentitet og institusjonshistorie',
    'eksplisitt parent/child-avgrensning mot holmenkollen_nasjonalanlegg',
    'ingen separat ny hopptarn-identitet'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: decision.coordinate.coordSourceUrl,
      sourceObjectId: decision.coordinate.sourceObjectId,
      sourceQuality: 'official_address_plus_official_museum_identity',
      finding: 'Geonorge gir ett entydig adressepunkt for Kongeveien 40. Skimuseets offisielle sider dokumenterer samme besøksadresse og en vedvarende museumsinstitusjon etablert i 1923, i dag fysisk inne i Holmenkollen-anlegget.',
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: 'Kongeveien 40 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: decision.coordinate.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: decision.coordinate.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    {
      lat: place.lat,
      lon: place.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied the exact Kongeveien 40 address point as the canonical museum marker. Keep the jump tower and broader arena under holmenkollen_nasjonalanlegg.'
  },
  notes: [
    coordNote,
    `The locked intake measured ${decision.parentOverlapAudit.distanceM} meters to the existing holmenkollen_nasjonalanlegg marker; this is expected parent/child proximity, not identity duplication.`
  ]
};
writeJson(EVIDENCE_FILE, evidence);

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_MANIFEST_ENTRY)) throw new Error(`${PLACE_MANIFEST_ENTRY}: already registered`);
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) throw new Error(`${EVIDENCE_MANIFEST_ENTRY}: already registered`);
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const osloIndex = lines.findIndex((line) => line === '## Oslo');
if (osloIndex < 0) throw new Error('Could not find Oslo protocol section');
const nextTopLevelIndex = lines.findIndex((line, index) => index > osloIndex && line.startsWith('## ') && !line.startsWith('### '));
const osloEnd = nextTopLevelIndex > osloIndex ? nextTopLevelIndex : lines.length;
const summaryIndex = lines.findIndex((line, index) => index > osloIndex && index < osloEnd && line.startsWith('Oslo-tabellen inneholder nå '));
const tableHeaderIndex = lines.findIndex((line, index) => index > osloIndex && index < osloEnd && line === '| batch | placeId | navn | godkjent status | kildeobjekt |');
if (summaryIndex < 0 || tableHeaderIndex < 0) throw new Error('Could not resolve Oslo summary/table structure');

let mainTableEnd = tableHeaderIndex + 2;
while (mainTableEnd < osloEnd && lines[mainTableEnd].startsWith('| ')) mainTableEnd += 1;
const mainRows = lines.slice(tableHeaderIndex + 2, mainTableEnd);
const mainIds = new Set(mainRows.flatMap((line) => {
  const match = line.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/);
  return match ? [match[1]] : [];
}));
if (mainIds.has(ID)) throw new Error(`${ID}: already recorded in Oslo main table`);

const needsHeadingIndex = lines.findIndex((line, index) => index > mainTableEnd && index < osloEnd && line === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const needsHeaderIndex = needsHeadingIndex >= 0
  ? lines.findIndex((line, index) => index > needsHeadingIndex && index < osloEnd && line.startsWith('| kandidat | status |'))
  : -1;
const needsIds = new Set();
if (needsHeaderIndex >= 0) {
  let i = needsHeaderIndex + 2;
  while (i < osloEnd && lines[i].startsWith('| ')) {
    const match = lines[i].match(/`([^`]+)`/);
    if (match) needsIds.add(match[1]);
    i += 1;
  }
}
if (needsIds.has(ID)) throw new Error(`${ID}: already recorded in Oslo needs_review table`);

const nextWorkIndex = lines.findIndex((line, index) => index > osloIndex && line.startsWith('- Neste nye Oslo-kontroll er batch '));
if (nextWorkIndex < 0) throw new Error('Could not find next Oslo batch pointer');
const batchMatch = lines[nextWorkIndex].match(/batch (\d+)/);
if (!batchMatch) throw new Error('Could not parse next Oslo batch number');
const batchNo = Number(batchMatch[1]);

const summaryMatch = lines[summaryIndex].match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!summaryMatch) throw new Error('Could not parse Oslo controlled total');
const parsedControlledTotal = new Set([...mainIds, ...needsIds]).size;
const statedControlledTotal = Number(summaryMatch[1]);
if (parsedControlledTotal !== statedControlledTotal) {
  throw new Error(`Protocol count mismatch before production: parsed ${parsedControlledTotal}, stated ${statedControlledTotal}`);
}

const newControlledTotal = parsedControlledTotal + 1;
const newVerifiedTotal = mainIds.size + 1;
const row = `| ${batchNo} | \`${ID}\` | Skimuseet i Holmenkollen | verified | \`${decision.coordinate.sourceObjectId}\` |`;
lines.splice(mainTableEnd, 0, row);
lines[summaryIndex] = `Oslo-tabellen inneholder nå ${newControlledTotal} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${batchNo} legger til Skimuseet i Holmenkollen som en egen museumsinstitusjon ved det verifiserte Kongeveien 40-punktet, fysisk inne i men identitetsmessig skilt fra Holmenkollen nasjonalanlegg.`;

const shiftedNextWorkIndex = lines.findIndex((line, index) => index > osloIndex && line.startsWith('- Neste nye Oslo-kontroll er batch '));
lines[shiftedNextWorkIndex] = `- Neste nye Oslo-kontroll er batch ${batchNo + 1}.`;

const notCountedIndex = lines.findIndex((line, index) => index > osloIndex && line.startsWith('Disse kontrollene er fullført, men teller ikke blant de '));
if (notCountedIndex >= 0) {
  lines[notCountedIndex] = `Disse kontrollene er fullført, men teller ikke blant de ${newVerifiedTotal} verifiserte eller kildekontrollerte canonical Oslo-stedene.`;
}

const narrative = `Batch ${batchNo} (2026-07-21) produserer \`${ID}\` som en egen historisk museumsinstitusjon inne i det bredere Holmenkollen-anlegget. Den låste address-first-kjøringen ga det entydige Geonorge-punktet \`${decision.coordinate.sourceObjectId}\` for Kongeveien 40, som brukes som bygnings-, display- og unlock-anker. Skimuseet ble etablert i 1923 og flyttet fra Frognerseteren til Holmenkollbakken i forbindelse med OL-perioden rundt 1952. \`holmenkollen_nasjonalanlegg\` beholder hoppbakken, hopptårnet og den brede arenaidentiteten; dagens felles billett for museum og tårn er et besøksprodukt og oppretter ikke en ny hopptårn-markør.`;
if (!lines.includes(narrative)) {
  const vestlandIndex = lines.findIndex((line) => line === '## Vestland – Etne');
  const insertionIndex = vestlandIndex >= 0 ? vestlandIndex : lines.length;
  lines.splice(insertionIndex, 0, '', narrative, '');
}

protocol = lines.join('\n');
fs.writeFileSync(abs(PROTOCOL), protocol);

writeJson(PRODUCTION_REPORT, {
  version: '2026-07-21',
  placeId: ID,
  batchNo,
  controlledTotalBefore: parsedControlledTotal,
  controlledTotalAfter: newControlledTotal,
  verifiedTotalAfter: newVerifiedTotal,
  sourceObjectId: decision.coordinate.sourceObjectId,
  coordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r
  },
  parentPlaceId: 'holmenkollen_nasjonalanlegg',
  parentDistanceM: decision.parentOverlapAudit.distanceM,
  representationDecision: decision.representationDecision
});

console.log(JSON.stringify({
  ok: true,
  placeId: ID,
  batchNo,
  sourceObjectId: decision.coordinate.sourceObjectId,
  coordinate: { lat: place.lat, lon: place.lon },
  controlledTotal: newControlledTotal,
  verifiedTotal: newVerifiedTotal,
  nextBatch: batchNo + 1
}, null, 2));
