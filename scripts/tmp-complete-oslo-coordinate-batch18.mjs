import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const HISTORY_REL = 'data/places/historie/oslo/places_historie.json';
const HISTORY = path.join(ROOT, HISTORY_REL);
const SPLIT_DIR = path.join(ROOT, 'data/places/historie/oslo/places_historie');
const SPLIT_MANIFEST = path.join(ROOT, 'data/places/historie/oslo/places_historie_manifest.json');
const SPLIT_INDEX = path.join(ROOT, 'data/places/historie/oslo/places_historie_index.json');
const GRINI_REL = 'data/places/historie/akershus/grini_fangeleir.json';
const GRINI = path.join(ROOT, GRINI_REL);
const GLOBAL_MANIFEST = path.join(ROOT, 'data/places/manifest.json');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT = path.join(ROOT, 'reports/oslo-coordinate-control-batch-18.md');

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

const updates = {
  middelalder_oslo: {
    locatorType: 'park',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:kultureiendom:middelalderparken',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'park_ruin_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Middelalderparken',
    coordSourceId: 'oslo-kommune:kultureiendom:middelalderparken',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/middelalderparken/',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker inne i Middelalderparken. Oslo kommune avgrenser parken sør for Bispegata og øst for Sørenggata og dokumenterer ruinene i området. Det eksisterende punktet beholdes som representativt park-/ruinanker, ikke som koordinat for én enkelt ruin.'
  },
  gamlebyen_gravlund: {
    locatorType: 'linear_area',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:gravplass:gamlebyen',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'cemetery_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Gamlebyen gravlund',
    coordSourceId: 'oslo-kommune:gravplass:gamlebyen',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/gamlebyen-gravlund/',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker for Gamlebyen gravlund. Oslo kommune identifiserer gravlunden og besøksadressen Ekebergveien 4, men adressepunktet brukes ikke som snarvei for hele gravlunden. Det eksisterende punktet beholdes som representativt anker inne i gravplassområdet.'
  },
  akershus_festning: {
    locatorType: 'linear_area',
    sourceProvider: 'official_map',
    sourceObjectId: 'forsvarsbygg:akershus-festning',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'fortress_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Forsvarsbygg – Akershus festning',
    coordSourceId: 'forsvarsbygg:akershus-festning',
    coordSourceUrl: 'https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker inne i Akershus festning. Forsvarsbygg forvalter og identifiserer festningsområdet som eget historisk anlegg. Punktet representerer festningskomplekset og skal ikke tolkes som et separat anker for legacy-typofeilen `akerhus_slott`.'
  },
  var_frelsers_gravlund: {
    locatorType: 'linear_area',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:gravplass:var-frelsers',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'cemetery_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Vår Frelsers gravlund',
    coordSourceId: 'oslo-kommune:gravplass:var-frelsers',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/var-frelsers-gravlund/',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker for Vår Frelsers gravlund. Oslo kommune identifiserer gravlunden og besøksadressen Akersbakken 32, men stedet behandles som et utstrakt gravplassområde. Det eksisterende punktet beholdes som representativt anker inne i gravlunden.'
  },
  hovedoya_kloster: {
    lat: 59.89633,
    lon: 10.72838,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:457724681',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'ruin_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 457724681 – Hovedøya kloster / Hovedøya Abbey',
    coordSourceId: 'osm-way:457724681',
    coordSourceUrl: 'https://www.openstreetmap.org/way/457724681',
    coordVerifiedAt: DATE,
    coordNote: 'Geometriforankret områdeanker for selve klosterruinene på Hovedøya. OSM way 457724681 modellerer ruin-/arkeologiobjektet, og Oslo kommune dokumenterer klosterruinen på øya. Det tidligere punktet lå flere hundre meter øst for ruinområdet og er derfor flyttet til ruinens representasjonspunkt.'
  }
};

let aggregate = readJson(HISTORY);
const griniOriginal = aggregate.find((p) => p?.id === 'grini_fangeleir');
if (!griniOriginal) throw new Error('Mangler grini_fangeleir i Oslo-historiefilen');
for (const [id, update] of Object.entries(updates)) {
  const row = aggregate.find((p) => p?.id === id);
  if (!row) throw new Error('Mangler history place: ' + id);
  Object.assign(row, update);
  delete row.coordPrecisionM;
}
aggregate = aggregate.filter((p) => p?.id !== 'grini_fangeleir');
writeJson(HISTORY, aggregate);

for (const [id, update] of Object.entries(updates)) {
  const file = path.join(SPLIT_DIR, id + '.json');
  const row = readJson(file);
  Object.assign(row, update);
  delete row.coordPrecisionM;
  writeJson(file, row);
}
const griniSplit = path.join(SPLIT_DIR, 'grini_fangeleir.json');
if (fs.existsSync(griniSplit)) fs.unlinkSync(griniSplit);

const splitManifest = readJson(SPLIT_MANIFEST);
splitManifest.places = (splitManifest.places || []).filter((p) => p?.id !== 'grini_fangeleir');
splitManifest.places.forEach((entry, index) => {
  entry.order = index;
  if (updates[entry.id]) entry.sha256 = sha256(path.join(path.dirname(SPLIT_MANIFEST), entry.file));
});
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(HISTORY);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

let splitIndex = readJson(SPLIT_INDEX).filter((p) => p?.id !== 'grini_fangeleir');
for (const id of Object.keys(updates)) {
  const row = splitIndex.find((p) => p?.id === id);
  const source = aggregate.find((p) => p?.id === id);
  if (!row || !source) throw new Error('Mangler history index/source: ' + id);
  for (const key of ['lat', 'lon', 'r', 'coordType', 'coordStatus']) row[key] = source[key];
}
writeJson(SPLIT_INDEX, splitIndex);

const griniMoved = {
  ...griniOriginal,
  coordStatus: 'needs_source',
  coordSource: 'Bærum kommune – Grini fangeleir; MiA – Grinimuseet',
  coordSourceId: 'baerum-kommune:grini-fangeleir',
  coordSourceUrl: 'https://www.baerum.kommune.no/tjenester/kultur-idrett-og-fritid/kunst-og-kultur/rik-pa-historie/6.-forsvar-og-krigsminner',
  coordVerifiedAt: null,
  coordType: 'historical_camp_area',
  locatorType: 'linear_area',
  sourceProvider: 'municipality',
  sourceObjectId: 'baerum-kommune:grini-fangeleir',
  geocodeAccuracy: 'approximate',
  coordRole: 'area_anchor',
  coordNote: 'Recorden er flyttet fra Oslo-kilden til Akershus/Bærum fordi både place-teksten og Bærum kommune plasserer Grini fangeleir i Bærum. Eksisterende punkt beholdes foreløpig uten godkjenning. Grinimuseets besøksadresse Jøssingveien 31 dokumenterer dagens museum ved leirstedet, men brukes ikke som kunstig sentrum for hele den historiske leiren. Krever offisiell leirgeometri eller dokumentert historisk områdeanker før koordinaten kan godkjennes.'
};
delete griniMoved.coordPrecision;
delete griniMoved.coordPrecisionM;
writeJson(GRINI, griniMoved);

const globalManifest = readJson(GLOBAL_MANIFEST);
const griniManifestRel = 'places/historie/akershus/grini_fangeleir.json';
if (!globalManifest.files.includes(griniManifestRel)) {
  const anchor = 'places/historie/akershus/places_historie_akershus_batch1.json';
  const idx = globalManifest.files.indexOf(anchor);
  if (idx < 0) throw new Error('Mangler Akershus history anchor i global manifest');
  globalManifest.files.splice(idx + 1, 0, griniManifestRel);
}
writeJson(GLOBAL_MANIFEST, globalManifest);

const approvedDefs = {
  middelalder_oslo: ['oslo/historie/middelalder_oslo.json', 'Middelalderparken', 'Middelalderparken som park- og ruinområde i Bydel Gamle Oslo', 'Oslo kommune dokumenterer parkens geografiske plassering og de bevarte middelalderruinene.'],
  gamlebyen_gravlund: ['oslo/historie/gamlebyen_gravlund.json', 'Gamlebyen gravlund', 'Gamlebyen gravlund som utstrakt gravplassområde', 'Oslo kommune dokumenterer gravlunden som eget gravplassområde med besøksadresse Ekebergveien 4.'],
  akershus_festning: ['oslo/historie/akershus_festning.json', 'Akershus festning', 'det canonical festningsområdet Akershus festning', 'Forsvarsbygg dokumenterer og forvalter Akershus festning som eget historisk festningsområde.'],
  var_frelsers_gravlund: ['oslo/historie/var_frelsers_gravlund.json', 'Vår Frelsers gravlund', 'Vår Frelsers gravlund som utstrakt kulturhistorisk gravplassområde', 'Oslo kommune dokumenterer gravlunden som eget gravplassområde med besøksadresse Akersbakken 32.'],
  hovedoya_kloster: ['oslo/historie/hovedoya_kloster.json', 'Hovedøya kloster', 'klosterruinene på Hovedøya', 'OSM way 457724681 modellerer selve ruinområdet; Oslo kommune dokumenterer klosterruinene på Hovedøya.']
};
for (const [id, d] of Object.entries(approvedDefs)) {
  const place = aggregate.find((p) => p?.id === id);
  writeJson(path.join(EVIDENCE_ROOT, d[0]), {
    placeId: id,
    placeFile: HISTORY_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: { currentName: d[1], resolvedIdentity: d[2], identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'stable_area_or_geometry_source', finding: d[3], canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: place.geometry ? [place.geometry] : [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
}

const legacyAlias = aggregate.find((p) => p?.id === 'akerhus_slott');
const aliasBlocked = 'Recorden `akerhus_slott` er en dokumentert legacy-typofeil som ble beholdt for bakoverkompatibilitet da canonical `akershus_festning` ble opprettet. Begge peker på samme fysiske anlegg og skal ikke godkjennes som to separate steder.';
writeJson(path.join(EVIDENCE_ROOT, 'oslo/historie/akerhus_slott.json'), {
  placeId: 'akerhus_slott',
  placeFile: HISTORY_REL,
  evidenceStatus: 'needs_research',
  coordinateDecision: 'needs_identity_split',
  currentCoordinate: snapshot(legacyAlias),
  identity: { currentName: 'Akerhus Slott', resolvedIdentity: 'legacy-alias/typofeil for canonical akershus_festning', identityStatus: 'conflict', identityProblem: aliasBlocked, locatorTypeCandidate: 'linear_area', requiresSplit: false, splitReason: 'Skal ikke splittes fysisk; legacy-referanser må migreres til canonical ID før alias-recorden eventuelt kan fjernes.' },
  requiredEvidence: ['full migrering av legacy quiz/story-referanser til akershus_festning', 'bekreftelse på at ingen runtime-avhengighet krever den gamle ID-en'],
  evidence: [{ sourceProvider: 'manual_research', sourceName: 'History Go canonical target-fix report', sourceUrl: '', sourceObjectId: 'history-go:canonical:akershus_festning', sourceQuality: 'internal_canonical_audit', finding: 'Repoets egen target-fix dokumenterer at sourceCandidateUsed var akerhus_slott, sourceCandidateWasTypo=true og at akershus_festning ble opprettet som canonical duplicate for bakoverkompatibilitet.', canVerifyCoordinate: false, reason: aliasBlocked }],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'manual_research', sourceObjectId: 'history-go:canonical:akershus_festning', canApplyToPlace: false }],
  geometryCandidates: [],
  coordinateCandidates: [],
  decision: { canBecomeVerified: false, blockedReason: aliasBlocked, nextAction: 'Migrer legacy-referanser til `akershus_festning`; ikke opprett eller godkjenn et separat fysisk anker for `akerhus_slott`.' },
  notes: ['Ingen koordinatendring. Dette er en identitets-/duplikatkonflikt, ikke et eget sted.']
});

const griniBlocked = 'Grini fangeleir ligger i Bærum og er derfor flyttet ut av Oslo-kilden. Dagens punkt er et eldre områdepunkt uten kildebelagt leirgeometri. Grinimuseets besøksadresse dokumenterer dagens museum ved stedet, men kan ikke brukes som sentrum for hele den historiske leiren.';
writeJson(path.join(EVIDENCE_ROOT, 'akershus/baerum/grini_fangeleir.json'), {
  placeId: 'grini_fangeleir',
  placeFile: GRINI_REL,
  evidenceStatus: 'needs_research',
  coordinateDecision: 'needs_geometry',
  currentCoordinate: snapshot(griniMoved),
  identity: { currentName: 'Grini fangeleir', resolvedIdentity: 'den historiske Grini fangeleir ved Ila i Bærum', identityStatus: 'resolved', identityProblem: 'Tidligere plassert i Oslo-kilden; korrekt fylkes-/kommunetilhørighet er Akershus/Bærum.', locatorTypeCandidate: 'linear_area', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['offisiell eller historisk leirgeometri', 'dokumentert områdeanker som representerer leiren og ikke bare museet', 'visuell kontroll mot Ila fengsel, Grinimuseet og historisk leirutstrekning'],
  evidence: [
    { sourceProvider: 'municipality', sourceName: 'Bærum kommune – Forsvar og krigsminner', sourceUrl: 'https://www.baerum.kommune.no/tjenester/kultur-idrett-og-fritid/kunst-og-kultur/rik-pa-historie/6.-forsvar-og-krigsminner', sourceObjectId: 'baerum-kommune:grini-fangeleir', sourceQuality: 'official_identity_and_municipality', finding: 'Bærum kommune dokumenterer Grini fangeleir ved Ila og leirens historiske utstrekning.', canVerifyCoordinate: false, reason: griniBlocked },
    { sourceProvider: 'manual_research', sourceName: 'MiA – Grinimuseet', sourceUrl: 'https://mia.no/grinimuseet/finn-oss', sourceObjectId: 'mia:grinimuseet:jossingveien-31', sourceQuality: 'official_museum_location', finding: 'Grinimuseet ligger i Jøssingveien 31 i Eiksmarka, Bærum, ved Ila. Adressen identifiserer museet, ikke hele den historiske leiren.', canVerifyCoordinate: false, reason: 'Brukes som fysisk identitetskontroll, ikke som canonical leirsentrum.' }
  ],
  addressCandidates: [{ address: 'Jøssingveien 31, 1359 Eiksmarka', sourceProvider: 'manual_research', sourceObjectId: 'mia:grinimuseet:jossingveien-31', canApplyToPlace: false }],
  sourceObjectCandidates: [{ sourceProvider: 'municipality', sourceObjectId: 'baerum-kommune:grini-fangeleir', canApplyToPlace: false }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: griniMoved.lat, lon: griniMoved.lon, coordRole: 'area_anchor', canApplyToPlace: false }],
  decision: { canBecomeVerified: false, blockedReason: griniBlocked, nextAction: 'Finn kildebelagt leirgeometri eller et dokumentert historisk områdeanker før koordinaten godkjennes.' },
  notes: [griniMoved.coordNote]
});

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
const evidenceFiles = [
  ...Object.values(approvedDefs).map((d) => d[0]),
  'oslo/historie/akerhus_slott.json',
  'akershus/baerum/grini_fangeleir.json'
];
for (const file of evidenceFiles) if (!evidenceManifest.files.includes(file)) evidenceManifest.files.push(file);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(
  protocol,
  'Oslo-tabellen inneholder nå 103 verifiserte eller kildekontrollerte canonical steder. Batch 17 omfatter sju fullførte kontroller: seks godkjente strøks-, kino- og filmlokasjonsankre, mens Hartvig Nissens skole (SKAM) står separat som `needs_review` fordi Geonorge gir flere ikke-entydige treff for det historiske skolebygget. Seks fullførte Oslo-kontroller står dermed separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo-tabellen inneholder nå 108 verifiserte eller kildekontrollerte canonical steder. Batch 18 omfatter sju fullførte kontroller fra Oslo-køen: fem godkjente park-, gravplass-, festnings- og ruinankre, legacy-typofeilen `akerhus_slott` som duplikatkonflikt, og `grini_fangeleir` som er flyttet til Akershus/Bærum uten at det eldre leirpunktet ble godkjent. Åtte fullførte kontroller fra Oslo-køen står dermed separat uten godkjent Oslo-koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo summary'
);
const lastApproved = '| 17 | `vika_kino` | Vika kino | verified | `geonorge-adresser-v1:0301:16038:14` |';
const rows = [
  '| 18 | `middelalder_oslo` | Middelalderparken | verified_geometry | `oslo-kommune:kultureiendom:middelalderparken` |',
  '| 18 | `gamlebyen_gravlund` | Gamlebyen gravlund | verified_geometry | `oslo-kommune:gravplass:gamlebyen` |',
  '| 18 | `akershus_festning` | Akershus festning | verified_geometry | `forsvarsbygg:akershus-festning` |',
  '| 18 | `var_frelsers_gravlund` | Vår Frelsers gravlund | verified_geometry | `oslo-kommune:gravplass:var-frelsers` |',
  '| 18 | `hovedoya_kloster` | Hovedøya kloster | verified_geometry | `osm-way:457724681` |'
].join('\n');
protocol = replaceRequired(protocol, lastApproved, lastApproved + '\n' + rows, 'batch 18 approved rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 103 verifiserte eller kildekontrollerte canonical stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 108 verifiserte eller kildekontrollerte canonical Oslo-stedene.');
const hartvigRow = "| `hartvig_nissens_skole_skam` – Hartvig Nissens skole (SKAM) | needs_review | Det historiske SKAM-skolebygget er identifisert, men Geonorge gir flere ikke-entydige treff for President Harbitz' gate 11. | Krever offisiell bygningsgeometri eller eksplisitt kobling mellom det historiske bygget og ett konkret adressepunkt. |";
const newReviewRows = [
  '| `akerhus_slott` – Akerhus Slott | needs_review | Dokumentert legacy-typofeil/duplikat av canonical `akershus_festning`; begge representerer samme fysiske anlegg. | Migrer gamle quiz/story-referanser til `akershus_festning`; ikke godkjenn et separat fysisk anker. |',
  '| `grini_fangeleir` – Grini fangeleir | needs_review; moved to Akershus/Bærum | Recorden lå feilaktig i Oslo-kilden. Bærum kommune dokumenterer leiren ved Ila, men dagens punkt mangler kildebelagt leirgeometri. | Finn offisiell/historisk leirgeometri; Grinimuseets adresse skal ikke brukes som sentrum for hele leiren. |'
].join('\n');
protocol = replaceRequired(protocol, hartvigRow, hartvigRow + '\n' + newReviewRows, 'batch 18 review rows');
protocol = replaceRequired(
  protocol,
  '- Neste nye Oslo-kontroll er nummer 108 og starter batch 18.\n- Batch 17 er fullført med seks godkjente ankere og én dokumentert adresse-/bygningskonflikt for Hartvig Nissens skole (SKAM).\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 115 og starter batch 19.\n- Batch 18 er fullført med fem godkjente Oslo-ankre, én dokumentert legacy-duplikatkonflikt og én geografisk feilplassering flyttet til Akershus/Bærum uten koordinatgodkjenning.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work'
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 18\n\nDato: ${DATE}\n\nSju kontroller fra Oslo-køen er fullført. Fem canonical Oslo-steder er godkjent. Legacy-recorden \`akerhus_slott\` er dokumentert som duplikat av \`akershus_festning\`, og \`grini_fangeleir\` er flyttet fra Oslo-kilden til Akershus/Bærum uten at den eldre koordinaten ble godkjent.\n\n| placeId | resultat | kilde / beslutning |\n|---|---|---|\n| \`middelalder_oslo\` | verified_geometry | \`oslo-kommune:kultureiendom:middelalderparken\` |\n| \`gamlebyen_gravlund\` | verified_geometry | \`oslo-kommune:gravplass:gamlebyen\` |\n| \`akerhus_slott\` | needs_review | legacy-typofeil for \`akershus_festning\` |\n| \`akershus_festning\` | verified_geometry | \`forsvarsbygg:akershus-festning\` |\n| \`var_frelsers_gravlund\` | verified_geometry | \`oslo-kommune:gravplass:var-frelsers\` |\n| \`hovedoya_kloster\` | verified_geometry | \`osm-way:457724681\`; hovedpunkt flyttet til ruinområdet |\n| \`grini_fangeleir\` | needs_review; moved to Akershus/Bærum | feil fylkeskilde rettet; koordinat beholdt uverifisert |\n\n## Viktige avgjørelser\n\n- Gravlunder behandles som områder; besøksadresser brukes ikke som kunstige sentrumspunkter.\n- \`akerhus_slott\` får ikke egen koordinatgodkjenning fordi repoets tidligere canonical-audit dokumenterer ID-en som en legacy-typofeil.\n- Hovedøya kloster flyttes fra det gamle feilplasserte punktet til OSM-geometrien for selve klosterruinen.\n- Grini flyttes organisatorisk til Akershus/Bærum, men museumsadressen Jøssingveien 31 brukes bare som identitetskontroll, ikke som leirsentrum.\n`);

console.log('Completed Oslo coordinate batch 18: 5 verified, 2 review outcomes, Grini moved to Akershus/Bærum');
