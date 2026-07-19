import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-20');
const REPORT = path.join(REPORT_DIR, 'README.md');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');

const ADDED_REL = 'data/places/historie/oslo/places_historie_added_batch_01.json';
const ADDED = path.join(ROOT, ADDED_REL);
const ADDED_SPLIT_DIR = path.join(ROOT, 'data/places/historie/oslo/places_historie_added_batch_01');
const ADDED_MANIFEST = path.join(ROOT, 'data/places/historie/oslo/places_historie_added_batch_01_manifest.json');
const ADDED_INDEX = path.join(ROOT, 'data/places/historie/oslo/places_historie_added_batch_01_index.json');
const GAMLE_RADHUS_REL = 'data/places/by/oslo/gamle_radhus.json';
const GAMLE_RADHUS = path.join(ROOT, GAMLE_RADHUS_REL);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
};
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const replaceRequired = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error('Mangler forventet tekst: ' + label);
  return text.replace(from, to);
};
const snapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? ''
});

function readFinder(file, label) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`Fant ikke JSON i Geonorge-resultatet for ${label}`);
  return JSON.parse(raw.slice(start));
}
function requireVerified(result, label) {
  if (!result?.ok || result?.status !== 'verified_candidate' || !result?.coordinate || !result?.sourceObjectId) {
    throw new Error(`${label} fikk ikke entydig verified_candidate fra Geonorge: ` + JSON.stringify({ status: result?.status, reason: result?.reason }));
  }
  return result;
}
function finderUpdate(result, note) {
  return {
    ...result.coordinate,
    sourceObjectId: result.sourceObjectId,
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: DATE,
    coordNote: note
  };
}

const finderDefs = {
  oslo_hospital: {
    label: 'Oslo Hospital', address: 'Ekebergveien 1 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for det historiske Oslo Hospital-anlegget i Ekebergveien 1. Oslo byleksikon og Oslo Hospital dokumenterer samme historiske tomt. Punktet brukes som representativt bygg-/anleggsanker og holdes adskilt fra Gamlebyen gravlund og Middelalderparken.'
  },
  botsfengselet: {
    label: 'Botsfengselet', address: 'Åkebergveien 11 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for fengselsanlegget i Åkebergveien 11. Oslo kommune dokumenterer Oslo fengsel på samme adresse, mens recorden gjelder det historiske Botsfengselet/Botsen innenfor anlegget. Punktet brukes som fysisk anker for fengselskomplekset.'
  },
  prinds_christian_augusts_minde: {
    label: 'Prinds Christian Augusts Minde', address: 'Storgata 36 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Prindsen-komplekset i Storgata 36, dersom adressefinneren gir ett entydig treff. Oslo kommune dokumenterer dagens Prindsen-virksomhet i Storgata 36/36B. Punktet representerer det historiske anlegget, ikke bare én moderne aktivitet.'
  },
  gamle_radhus: {
    label: 'Gamle Rådhus', address: 'Nedre Slottsgate 1 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Gamle Rådhus i Nedre Slottsgate 1. Oslo kommune dokumenterer samme besøksadresse. Punktet representerer selve rådhusbygningen.'
  }
};
const results = {};
for (const [id, def] of Object.entries(finderDefs)) {
  results[id] = readFinder(path.join(REPORT_DIR, `${id}-geonorge.json`), def.label);
}
requireVerified(results.oslo_hospital, finderDefs.oslo_hospital.label);
requireVerified(results.botsfengselet, finderDefs.botsfengselet.label);
requireVerified(results.gamle_radhus, finderDefs.gamle_radhus.label);
const prindsenVerified = results.prinds_christian_augusts_minde?.ok && results.prinds_christian_augusts_minde?.status === 'verified_candidate' && results.prinds_christian_augusts_minde?.coordinate && results.prinds_christian_augusts_minde?.sourceObjectId;
if (!prindsenVerified && results.prinds_christian_augusts_minde?.status !== 'needs_review') {
  throw new Error('Prindsen ga uventet finder-status: ' + JSON.stringify({ status: results.prinds_christian_augusts_minde?.status, reason: results.prinds_christian_augusts_minde?.reason }));
}

const added = readJson(ADDED);
const updates = {
  oslo_hospital: finderUpdate(results.oslo_hospital, finderDefs.oslo_hospital.note),
  botsfengselet: finderUpdate(results.botsfengselet, finderDefs.botsfengselet.note)
};
if (prindsenVerified) updates.prinds_christian_augusts_minde = finderUpdate(results.prinds_christian_augusts_minde, finderDefs.prinds_christian_augusts_minde.note);

for (const [id, update] of Object.entries(updates)) {
  const row = added.find((p) => p?.id === id);
  if (!row) throw new Error('Mangler added history place: ' + id);
  Object.assign(row, update);
  delete row.coordPrecision;
  delete row.coordPrecisionM;
}
writeJson(ADDED, added);

for (const [id, update] of Object.entries(updates)) {
  const file = path.join(ADDED_SPLIT_DIR, id + '.json');
  const row = readJson(file);
  Object.assign(row, update);
  delete row.coordPrecision;
  delete row.coordPrecisionM;
  writeJson(file, row);
}

const addedManifest = readJson(ADDED_MANIFEST);
addedManifest.source_sha256 = sha256(ADDED);
addedManifest.generated_at = new Date().toISOString();
for (const entry of addedManifest.places || []) {
  if (updates[entry.id]) entry.sha256 = sha256(path.join(path.dirname(ADDED_MANIFEST), entry.file));
}
writeJson(ADDED_MANIFEST, addedManifest);

const addedIndex = readJson(ADDED_INDEX);
for (const id of Object.keys(updates)) {
  const row = addedIndex.find((p) => p?.id === id);
  const source = added.find((p) => p?.id === id);
  if (!row || !source) throw new Error('Mangler added index/source: ' + id);
  for (const key of ['lat', 'lon', 'r', 'coordType', 'coordStatus']) row[key] = source[key];
}
writeJson(ADDED_INDEX, addedIndex);

const gamleRadhusData = readJson(GAMLE_RADHUS);
if (!Array.isArray(gamleRadhusData) || gamleRadhusData.length !== 1 || gamleRadhusData[0]?.id !== 'gamle_radhus') throw new Error('Uventet gamle_radhus-format');
Object.assign(gamleRadhusData[0], finderUpdate(results.gamle_radhus, finderDefs.gamle_radhus.note));
delete gamleRadhusData[0].coordPrecision;
delete gamleRadhusData[0].coordPrecisionM;
writeJson(GAMLE_RADHUS, gamleRadhusData);

const places = {
  oslo_hospital: added.find((p) => p?.id === 'oslo_hospital'),
  botsfengselet: added.find((p) => p?.id === 'botsfengselet'),
  prinds_christian_augusts_minde: added.find((p) => p?.id === 'prinds_christian_augusts_minde'),
  gamle_radhus: gamleRadhusData[0]
};
const placeFiles = {
  oslo_hospital: ADDED_REL,
  botsfengselet: ADDED_REL,
  prinds_christian_augusts_minde: ADDED_REL,
  gamle_radhus: GAMLE_RADHUS_REL
};

for (const id of ['oslo_hospital', 'botsfengselet', 'gamle_radhus']) {
  const place = places[id];
  const def = finderDefs[id];
  writeJson(path.join(EVIDENCE_ROOT, `oslo/${id === 'gamle_radhus' ? 'by' : 'historie'}/${id}.json`), {
    placeId: id,
    placeFile: placeFiles[id],
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: { currentName: def.label, resolvedIdentity: `${def.label} på ${def.address}`, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'offisielt adressepunkt', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'official_address_plus_documented_identity', finding: `Geonorge gir ett entydig offisielt adressepunkt for ${def.address}.`, canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: [{ address: def.address, sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Offisielt adressepunkt og fysisk identitet er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
}

const prindsenEvidenceFile = 'oslo/historie/prinds_christian_augusts_minde.json';
if (prindsenVerified) {
  const place = places.prinds_christian_augusts_minde;
  writeJson(path.join(EVIDENCE_ROOT, prindsenEvidenceFile), {
    placeId: 'prinds_christian_augusts_minde',
    placeFile: ADDED_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: { currentName: 'Prinds Christian Augusts Minde', resolvedIdentity: 'det historiske Prindsen/Mangelsgården-komplekset i Storgata 36', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'offisielt adressepunkt', 'fysisk kontroll av komplekset'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'official_address_plus_documented_identity', finding: 'Geonorge gir ett entydig offisielt adressepunkt for Storgata 36, og Oslo kommune dokumenterer Prindsen-virksomhet på samme adresseområde.', canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: [{ address: 'Storgata 36 Oslo', sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Offisielt adressepunkt og fysisk identitet er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
} else {
  const place = places.prinds_christian_augusts_minde;
  const blocked = 'Geonorge gir flere ikke-entydige treff for Storgata 36. Prindsen er et historisk bygningskompleks, og ett vilkårlig husbokstavpunkt kan ikke velges som canonical anker uten dokumentert kobling til komplekset.';
  writeJson(path.join(EVIDENCE_ROOT, prindsenEvidenceFile), {
    placeId: 'prinds_christian_augusts_minde',
    placeFile: ADDED_REL,
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_geometry',
    currentCoordinate: snapshot(place),
    identity: { currentName: 'Prinds Christian Augusts Minde', resolvedIdentity: 'det historiske Prindsen/Mangelsgården-komplekset i Storgata 36', identityStatus: 'resolved', identityProblem: 'Adressekandidaten er fysisk flertydig på bygnings-/inngangsnivå.', locatorTypeCandidate: 'linear_area', requiresSplit: false, splitReason: '' },
    requiredEvidence: ['offisiell bygnings- eller eiendomsgeometri for Prindsen-komplekset', 'entydig kobling mellom komplekset og ett representativt adressepunkt'],
    evidence: [{ sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 + Oslo kommune', sourceUrl: '', sourceObjectId: '', sourceQuality: 'ambiguous_address_candidates', finding: 'Adressefinneren gir flere treff for Storgata 36, mens Oslo kommune dokumenterer dagens aktivitet i Storgata 36/36B.', canVerifyCoordinate: false, reason: blocked }],
    addressCandidates: [{ address: 'Storgata 36 Oslo', sourceProvider: 'official_address', canApplyToPlace: false }, { address: 'Storgata 36B Oslo', sourceProvider: 'official_address', canApplyToPlace: false }],
    sourceObjectCandidates: [],
    geometryCandidates: [],
    coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: blocked, nextAction: 'Finn offisiell kompleks-/eiendomsgeometri eller dokumentert representativt anker før koordinaten endres.' },
    notes: ['Eksisterende koordinat beholdes uendret. Ikke velg første eller nærmeste adressekandidat.']
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
const evidenceFiles = [
  'oslo/historie/oslo_hospital.json',
  'oslo/historie/botsfengselet.json',
  prindsenEvidenceFile,
  'oslo/by/gamle_radhus.json'
];
for (const file of evidenceFiles) if (!evidenceManifest.files.includes(file)) evidenceManifest.files.push(file);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const approvedCount = prindsenVerified ? 4 : 3;
const totalApproved = 115 + approvedCount;
const reviewCount = prindsenVerified ? 8 : 9;
let protocol = fs.readFileSync(PROTOCOL, 'utf8');
const oldSummary = 'Oslo-tabellen inneholder nå 115 verifiserte eller kildekontrollerte canonical steder. Batch 19 legger til sju godkjente skole-, bymiljø-, bygnings- og historiske ankere: Sagene skole, Damstredet/Telthusbakken, Gamle trikkestallen, Trefoldighetskirken, Nonneseter kloster, Oslo ladegård og Galgeberg. Åtte fullførte kontroller fra Oslo-køen står fortsatt separat uten godkjent Oslo-koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.';
const batchText = prindsenVerified
  ? 'Batch 20 avslutter Oslo-klyngen i globalmanifestet med fire godkjente adresseverifiserte historiske bygg og anlegg: Oslo Hospital, Botsfengselet, Prinds Christian Augusts Minde og Gamle Rådhus.'
  : 'Batch 20 avslutter Oslo-klyngen i globalmanifestet med tre godkjente adresseverifiserte historiske bygg og anlegg: Oslo Hospital, Botsfengselet og Gamle Rådhus. Prinds Christian Augusts Minde står separat som `needs_review` fordi Storgata 36 gir flere ikke-entydige adressekandidater for det historiske komplekset.';
const newSummary = `Oslo-tabellen inneholder nå ${totalApproved} verifiserte eller kildekontrollerte canonical steder. ${batchText} ${reviewCount} fullførte kontroller fra Oslo-køen står dermed separat uten godkjent Oslo-koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.`;
protocol = replaceRequired(protocol, oldSummary, newSummary, 'Oslo summary');

const lastApproved = '| 19 | `galgeberg` | Galgeberg | verified_historical_source | `oslobyleksikon:galgeberg-rettersted` |';
const approvedRows = [
  `| 20 | \`oslo_hospital\` | Oslo Hospital | verified | \`${results.oslo_hospital.sourceObjectId}\` |`,
  `| 20 | \`botsfengselet\` | Botsfengselet | verified | \`${results.botsfengselet.sourceObjectId}\` |`,
  ...(prindsenVerified ? [`| 20 | \`prinds_christian_augusts_minde\` | Prinds Christian Augusts Minde | verified | \`${results.prinds_christian_augusts_minde.sourceObjectId}\` |`] : []),
  `| 20 | \`gamle_radhus\` | Gamle Rådhus | verified | \`${results.gamle_radhus.sourceObjectId}\` |`
].join('\n');
protocol = replaceRequired(protocol, lastApproved, lastApproved + '\n' + approvedRows, 'batch 20 approved rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 115 verifiserte eller kildekontrollerte canonical Oslo-stedene.', `Disse kontrollene er fullført, men teller ikke blant de ${totalApproved} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
if (!prindsenVerified) {
  const griniRow = '| `grini_fangeleir` – Grini fangeleir | needs_review; moved to Akershus/Bærum | Recorden lå feilaktig i Oslo-kilden. Bærum kommune dokumenterer leiren ved Ila, men dagens punkt mangler kildebelagt leirgeometri. | Finn offisiell/historisk leirgeometri; Grinimuseets adresse skal ikke brukes som sentrum for hele leiren. |';
  const prindsenRow = '| `prinds_christian_augusts_minde` – Prinds Christian Augusts Minde | needs_review | Storgata 36 gir flere ikke-entydige Geonorge-treff for et historisk bygningskompleks; ingen husbokstav er dokumentert som canonical hovedanker. | Krever offisiell kompleks-/eiendomsgeometri eller et dokumentert representativt anker. |';
  protocol = replaceRequired(protocol, griniRow, griniRow + '\n' + prindsenRow, 'Prindsen review row');
}
protocol = replaceRequired(
  protocol,
  '- Neste nye Oslo-kontroll er nummer 122 og starter batch 20.\n- Batch 19 er fullført med sju godkjente skole-, bymiljø-, bygnings- og historiske ankere.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  `- Neste nye Oslo-kontroll er nummer 126 og starter batch 21.\n- Batch 20 er fullført med ${approvedCount} godkjente adresseverifiserte historiske bygg/anlegg${prindsenVerified ? '' : ' og én dokumentert Prindsen-adressekonflikt'}.\n- Oslo-klyngen i det globale place-manifestet er nå ferdig kontrollert; batch 21 skal starte en eksplisitt sekundær Oslo-kildekø for aktive places som ligger utenfor dette manifestet.\n- Fortsett kilde for kilde i stabil manifest-/filrekkefølge og velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.`,
  'next work'
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 20\n\nDato: ${DATE}\n\nDenne batchen avslutter Oslo-klyngen i det globale place-manifestet. Fire canonical steder er kontrollert. ${approvedCount} er godkjent.${prindsenVerified ? '' : ' Prinds Christian Augusts Minde er fullført som needs_review uten koordinatendring fordi adressefinneren ikke ga ett entydig kompleksanker.'}\n\n| placeId | resultat | kildeobjekt / avgjørelse |\n|---|---|---|\n| \`oslo_hospital\` | verified | \`${results.oslo_hospital.sourceObjectId}\` |\n| \`botsfengselet\` | verified | \`${results.botsfengselet.sourceObjectId}\` |\n| \`prinds_christian_augusts_minde\` | ${prindsenVerified ? 'verified' : 'needs_review'} | ${prindsenVerified ? `\`${results.prinds_christian_augusts_minde.sourceObjectId}\`` : 'flere ikke-entydige treff for Storgata 36'} |\n| \`gamle_radhus\` | verified | \`${results.gamle_radhus.sourceObjectId}\` |\n\n## Metode\n\n- Oslo Hospital: Ekebergveien 1.\n- Botsfengselet: Åkebergveien 11.\n- Prindsen: Storgata 36; godkjennes bare ved ett entydig finder-treff.\n- Gamle Rådhus: Nedre Slottsgate 1.\n\nAlle finder-resultater er lagret med \`tee\` i denne rapportmappen.\n`);

console.log(`Completed Oslo coordinate batch 20: ${approvedCount} verified, ${prindsenVerified ? 0 : 1} needs_review`);
