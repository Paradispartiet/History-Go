import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const SOURCE_REL = 'data/places/historie/oslo/places_historie.json';
const SOURCE = path.join(ROOT, SOURCE_REL);
const HISTORY_DIR = path.join(ROOT, 'data/places/historie/oslo');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT = path.join(ROOT, 'reports/oslo-coordinate-control-batch-18/README.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`);
};
const sha256 = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');
const coordinateSnapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? '',
});

const places = readJson(SOURCE);
if (!Array.isArray(places)) throw new Error('places_historie.json er ikke en array');
const byId = new Map(places.map((place) => [place.id, place]));

const definitions = {
  middelalder_oslo: {
    locatorType: 'park',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:kultureiendommer:middelalderparken',
    coordStatus: 'verified_geometry',
    coordType: 'park_center',
    coordSource: 'Oslo kommune – Middelalderparken',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/middelalderparken/',
    coordNote: 'Representativt områdeanker inne i Middelalderparken. Oslo kommune dokumenterer parkområdet sør for Bispegata og øst for Sørenggata med middelalderruinene som del av kulturmiljøet. Eksisterende punkt beholdes som park-/ruinområdets displayanker, ikke som adressepunkt for én enkelt ruin.',
    resolvedIdentity: 'Middelalderparken som avgrenset park- og ruinområde i Gamle Oslo',
    finding: 'Oslo kommune dokumenterer Middelalderparken som et konkret parkområde med bevarte middelalderruiner.',
  },
  gamlebyen_gravlund: {
    locatorType: 'linear_area',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:gravplass:gamlebyen-gravlund',
    coordStatus: 'verified_geometry',
    coordType: 'cemetery_center',
    coordSource: 'Oslo kommune – Gamlebyen gravlund',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/gamlebyen-gravlund/',
    coordNote: 'Representativt områdeanker inne på Gamlebyen gravlund. Oslo kommune dokumenterer gravlunden og besøksadressen Ekebergveien 4. Eksisterende punkt beholdes inne i gravlundsområdet og brukes ikke som adressepunkt for kapell, port eller parkeringsinnkjøring.',
    resolvedIdentity: 'Gamlebyen gravlund som avgrenset kommunal gravplass',
    finding: 'Oslo kommune dokumenterer Gamlebyen gravlund som egen gravplass med besøksadresse Ekebergveien 4.',
  },
  akershus_festning: {
    locatorType: 'historic_site',
    sourceProvider: 'manual_research',
    sourceObjectId: 'forsvarsbygg:akershus-festning',
    coordStatus: 'verified_historical_source',
    coordType: 'historical_site',
    coordSource: 'Forsvarsbygg – Akershus festning',
    coordSourceUrl: 'https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning',
    coordNote: 'Representativt områdeanker i Akershus festning-komplekset. Forsvarsbygg dokumenterer festningen som det historiske anlegget og nasjonalsymbolet. Punktet beholdes som anker for hele festningsområdet, ikke som egen koordinat for Akershus slott inne i komplekset.',
    resolvedIdentity: 'Akershus festning som samlet historisk festningsanlegg',
    finding: 'Forsvarsbygg dokumenterer Akershus festning som det samlede historiske festningsanlegget og skiller anlegget fra Akershus slott som delobjekt.',
  },
  var_frelsers_gravlund: {
    locatorType: 'linear_area',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:gravplass:var-frelsers-gravlund',
    coordStatus: 'verified_geometry',
    coordType: 'cemetery_center',
    coordSource: 'Oslo kommune – Vår Frelsers gravlund',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/var-frelsers-gravlund/',
    coordNote: 'Representativt områdeanker inne på Vår Frelsers gravlund. Oslo kommune dokumenterer gravlunden og besøksadressen Akersbakken 32. Eksisterende punkt beholdes som gravlundens displayanker, ikke som punkt for én bestemt grav eller Æreslunden alene.',
    resolvedIdentity: 'Vår Frelsers gravlund som avgrenset kommunal gravplass og kulturhistorisk minnelandskap',
    finding: 'Oslo kommune dokumenterer Vår Frelsers gravlund som egen gravplass med besøksadresse Akersbakken 32.',
  },
  hovedoya_kloster: {
    locatorType: 'archaeological_site',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslo-kommune:rehabilitering:hovedoya-klosterruin',
    coordStatus: 'verified_historical_source',
    coordType: 'ruin_center',
    coordSource: 'Oslo kommune – Rehabilitering av Hovedøya klosterruin',
    coordSourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/rehabilitering-av-hovedoya-klosterruin/',
    coordNote: 'Representativt områdeanker ved klosterruinene på Hovedøya. Oslo kommune dokumenterer det konkrete klosterruin-anlegget og pågående bevaring. Eksisterende punkt beholdes som ruinområdets displayanker, ikke som koordinat for hele Hovedøya.',
    resolvedIdentity: 'det konkrete middelalderske klosterruin-anlegget på Hovedøya',
    finding: 'Oslo kommune dokumenterer det konkrete klosterruin-anlegget på Hovedøya som eget bevarings- og rehabiliteringsobjekt.',
  },
};

for (const [id, definition] of Object.entries(definitions)) {
  const place = byId.get(id);
  if (!place) throw new Error(`Mangler ${id}`);
  Object.assign(place, {
    locatorType: definition.locatorType,
    sourceProvider: definition.sourceProvider,
    sourceObjectId: definition.sourceObjectId,
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordStatus: definition.coordStatus,
    coordType: definition.coordType,
    coordSource: definition.coordSource,
    coordSourceId: definition.sourceObjectId,
    coordSourceUrl: definition.coordSourceUrl,
    coordVerifiedAt: DATE,
    coordNote: definition.coordNote,
  });
}

const legacyAlias = byId.get('akerhus_slott');
const grini = byId.get('grini_fangeleir');
if (!legacyAlias || !grini) throw new Error('Mangler akerhus_slott eller grini_fangeleir');

writeJson(SOURCE, places);

// Keep aggregate, one-file-per-place split, split manifest and lightweight index in sync.
const splitDir = path.join(HISTORY_DIR, 'places_historie');
fs.mkdirSync(splitDir, { recursive: true });
const manifestRows = [];
const indexRows = [];
for (let index = 0; index < places.length; index += 1) {
  const place = places[index];
  const file = `places_historie/${place.id}.json`;
  const body = `${JSON.stringify(place, null, 2)}\n`;
  fs.writeFileSync(path.join(HISTORY_DIR, file), body);
  manifestRows.push({
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    file,
    order: index,
    sha256: sha256(body),
  });
  indexRows.push({
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file,
  });
}
const sourceText = fs.readFileSync(SOURCE, 'utf8');
const splitManifestPath = path.join(HISTORY_DIR, 'places_historie_manifest.json');
const splitManifest = readJson(splitManifestPath);
writeJson(splitManifestPath, {
  ...splitManifest,
  source_sha256: sha256(sourceText),
  generated_at: new Date().toISOString(),
  place_count: places.length,
  places: manifestRows,
});
writeJson(path.join(HISTORY_DIR, 'places_historie_index.json'), indexRows);

function approvedEvidence(id) {
  const place = byId.get(id);
  const definition = definitions[id];
  return {
    placeId: id,
    placeFile: SOURCE_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: coordinateSnapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: definition.resolvedIdentity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: definition.locatorType,
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: [
      'stabil kildeidentitet',
      'objekttilpasset representasjon',
      'fysisk avgrensning mot nærliggende canonical steder',
    ],
    evidence: [{
      sourceProvider: definition.sourceProvider,
      sourceName: definition.coordSource,
      sourceUrl: definition.coordSourceUrl,
      sourceObjectId: definition.sourceObjectId,
      sourceQuality: definition.sourceProvider === 'municipality' ? 'stable_object_or_extent' : 'stable_historical_site_identity',
      finding: definition.finding,
      canVerifyCoordinate: true,
      reason: definition.coordNote,
    }],
    addressCandidates: [],
    sourceObjectCandidates: [{
      sourceProvider: definition.sourceProvider,
      sourceObjectId: definition.sourceObjectId,
      canApplyToPlace: true,
    }],
    geometryCandidates: [],
    coordinateCandidates: [{
      lat: place.lat,
      lon: place.lon,
      coordRole: place.coordRole,
      canApplyToPlace: true,
    }],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.',
    },
    notes: [definition.coordNote],
  };
}

for (const id of Object.keys(definitions)) {
  writeJson(path.join(EVIDENCE_ROOT, `oslo/historie/${id}.json`), approvedEvidence(id));
}

writeJson(path.join(EVIDENCE_ROOT, 'oslo/historie/akerhus_slott.json'), {
  placeId: 'akerhus_slott',
  placeFile: SOURCE_REL,
  evidenceStatus: 'rejected',
  coordinateDecision: 'needs_identity_split',
  currentCoordinate: coordinateSnapshot(legacyAlias),
  identity: {
    currentName: legacyAlias.name,
    resolvedIdentity: 'legacy-ID og typofeil beholdt for bakoverkompatibilitet; fysisk objekt er canonical akershus_festning',
    identityStatus: 'conflict',
    identityProblem: 'Repoets migreringsrapport dokumenterer akerhus_slott som legacy typo og akershus_festning som korrekt canonical placeId.',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: 'Det er ikke to fysiske steder; dette er en legacy-alias-konflikt.',
  },
  requiredEvidence: [
    'bevar bakoverkompatibilitet',
    'ikke tell aliaset som selvstendig canonical fysisk sted',
  ],
  evidence: [{
    sourceProvider: 'manual_research',
    sourceName: 'History Go – Akershus festning place target fix report',
    sourceUrl: 'reports/akershus_festning_place_target_fix_report.json',
    sourceObjectId: 'history-go:legacy-alias:akerhus_slott',
    sourceQuality: 'repository_identity_audit',
    finding: 'Repoets egen migreringsrapport sier at akerhus_slott er en typo/legacy-kandidat og at akershus_festning er canonical placeId.',
    canVerifyCoordinate: false,
    reason: 'Aliaset skal ikke få separat fysisk koordinatgodkjenning.',
  }],
  addressCandidates: [],
  sourceObjectCandidates: [],
  geometryCandidates: [],
  coordinateCandidates: [],
  decision: {
    canBecomeVerified: false,
    blockedReason: 'Legacy-alias for samme fysiske objekt som canonical akershus_festning.',
    nextAction: 'Behold bare som bakoverkompatibel resolver til gamle referanser er migrert; ikke tell som selvstendig koordinatkontroll.',
  },
  notes: ['Ingen koordinatendring på legacy-recorden.'],
});

writeJson(path.join(EVIDENCE_ROOT, 'oslo/historie/grini_fangeleir.json'), {
  placeId: 'grini_fangeleir',
  placeFile: SOURCE_REL,
  evidenceStatus: 'needs_research',
  coordinateDecision: 'needs_identity_split',
  currentCoordinate: coordinateSnapshot(grini),
  identity: {
    currentName: grini.name,
    resolvedIdentity: 'Grini fangeleir / Grinimuseet-området i Eiksmarka, Bærum kommune',
    identityStatus: 'resolved',
    identityProblem: 'Recorden ligger i Oslo-kildefilen, men både place-teksten og Grinimuseets besøksinformasjon plasserer stedet i Bærum.',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: false,
    splitReason: 'PlaceId kan beholdes, men recorden må flyttes til korrekt fylkes-/kommunekontekst før ny canonical koordinatgodkjenning.',
  },
  requiredEvidence: [
    'flytt canonical place-record til Akershus/Bærum',
    'verifiser historisk leiravgrensning eller dokumentert representasjonsanker etter flytting',
  ],
  evidence: [{
    sourceProvider: 'manual_research',
    sourceName: 'Grinimuseet – Besøk oss',
    sourceUrl: 'https://mia.no/grinimuseet/velkommen-til-grinimuseet',
    sourceObjectId: 'mia:grinimuseet:jossingveien-31',
    sourceQuality: 'official_institution_location',
    finding: 'Grinimuseet oppgir Jøssingveien 31 på Eiksmarka i Bærum kommune.',
    canVerifyCoordinate: false,
    reason: 'Koordinaten kan ikke godkjennes som Oslo-canonical mens recorden ligger i Oslo-kildefilen; den historiske leiren er dessuten et område, ikke bare museumsadressen.',
  }],
  addressCandidates: [{
    address: 'Jøssingveien 31, Eiksmarka, Bærum',
    sourceProvider: 'manual_research',
    canApplyToPlace: false,
  }],
  sourceObjectCandidates: [{
    sourceProvider: 'manual_research',
    sourceObjectId: 'mia:grinimuseet:jossingveien-31',
    canApplyToPlace: false,
  }],
  geometryCandidates: [],
  coordinateCandidates: [],
  decision: {
    canBecomeVerified: false,
    blockedReason: 'Feil geografisk kildefil: stedet ligger i Bærum, ikke Oslo.',
    nextAction: 'Flytt placeId uendret til Akershus/Bærum og kjør ny objekttilpasset koordinatkontroll der.',
  },
  notes: ['Ingen koordinatendring i Oslo-batch 18.'],
});

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const file of [
  'oslo/historie/middelalder_oslo.json',
  'oslo/historie/gamlebyen_gravlund.json',
  'oslo/historie/akerhus_slott.json',
  'oslo/historie/akershus_festning.json',
  'oslo/historie/var_frelsers_gravlund.json',
  'oslo/historie/hovedoya_kloster.json',
  'oslo/historie/grini_fangeleir.json',
]) {
  if (!evidenceManifest.files.includes(file)) evidenceManifest.files.push(file);
}
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  'Oslo-tabellen inneholder nå 108 verifiserte eller kildekontrollerte canonical steder. Batch 18 omfatter sju fullførte kontroller: fem godkjente park-, gravlund-, festnings- og ruinankre, mens legacy-ID-en `akerhus_slott` og den geografisk feilplasserte `grini_fangeleir` står separat uten godkjent Oslo-koordinat. Åtte fullførte Oslo-kontroller står dermed separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
);
const batch17Anchor = '| 17 | `vika_kino` | Vika kino | verified | `geonorge-adresser-v1:0301:16038:14` |';
if (!protocol.includes(batch17Anchor)) throw new Error('Mangler batch 17-ankerrad i protokollen');
const batch18Rows = [
  '| 18 | `middelalder_oslo` | Middelalderparken | verified_geometry | `oslo-kommune:kultureiendommer:middelalderparken` |',
  '| 18 | `gamlebyen_gravlund` | Gamlebyen gravlund | verified_geometry | `oslo-kommune:gravplass:gamlebyen-gravlund` |',
  '| 18 | `akershus_festning` | Akershus festning | verified_historical_source | `forsvarsbygg:akershus-festning` |',
  '| 18 | `var_frelsers_gravlund` | Vår Frelsers gravlund | verified_geometry | `oslo-kommune:gravplass:var-frelsers-gravlund` |',
  '| 18 | `hovedoya_kloster` | Hovedøya kloster | verified_historical_source | `oslo-kommune:rehabilitering:hovedoya-klosterruin` |',
].join('\n');
if (!protocol.includes('| 18 | `middelalder_oslo`')) {
  protocol = protocol.replace(batch17Anchor, `${batch17Anchor}\n${batch18Rows}`);
}
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 103 verifiserte eller kildekontrollerte canonical stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 108 verifiserte eller kildekontrollerte canonical stedene.',
);
const hartvigRow = "| `hartvig_nissens_skole_skam` – Hartvig Nissens skole (SKAM) | needs_review | Det historiske SKAM-skolebygget er identifisert, men Geonorge gir flere ikke-entydige treff for President Harbitz' gate 11. | Krever offisiell bygningsgeometri eller eksplisitt kobling mellom det historiske bygget og ett konkret adressepunkt. |";
if (!protocol.includes(hartvigRow)) throw new Error('Mangler Hartvig Nissen-raden i protokollen');
const additionalReviewRows = [
  '| `akerhus_slott` – Akerhus Slott (legacy-ID) | needs_review | Repoets egen migreringsrapport dokumenterer `akerhus_slott` som en typo/legacy-ID beholdt for bakoverkompatibilitet, mens `akershus_festning` er korrekt canonical placeId for det samme fysiske anlegget. | Ikke gi aliaset en separat fysisk koordinatgodkjenning; migrer gamle referanser før legacy-recorden eventuelt fjernes. |',
  '| `grini_fangeleir` – Grini fangeleir | needs_review | Place-recorden ligger i Oslo-kildefilen, men stedet og Grinimuseet ligger i Eiksmarka i Bærum kommune. | Flytt placeId uendret til Akershus/Bærum og verifiser historisk leirgeometri eller eget representasjonsanker der. |',
].join('\n');
if (!protocol.includes('`akerhus_slott` – Akerhus Slott (legacy-ID)')) {
  protocol = protocol.replace(hartvigRow, `${hartvigRow}\n${additionalReviewRows}`);
}
protocol = protocol.replace(
  '- Neste nye Oslo-kontroll er nummer 108 og starter batch 18.',
  '- Neste nye Oslo-kontroll er nummer 115 og starter batch 19.',
);
protocol = protocol.replace(
  '- Batch 17 er fullført med seks godkjente ankere og én dokumentert adresse-/bygningskonflikt for Hartvig Nissens skole (SKAM).',
  '- Batch 18 er fullført med fem godkjente ankere, én dokumentert legacy-ID-konflikt (`akerhus_slott`) og én dokumentert geografisk kildefeil (`grini_fangeleir` i Bærum).',
);
writeText(PROTOCOL, protocol);

writeText(REPORT, `# Oslo coordinate control batch 18

Dato: ${DATE}

## Kontroll 108–114

Godkjent:
- middelalder_oslo – Middelalderparken – verified_geometry
- gamlebyen_gravlund – Gamlebyen gravlund – verified_geometry
- akershus_festning – Akershus festning – verified_historical_source
- var_frelsers_gravlund – Vår Frelsers gravlund – verified_geometry
- hovedoya_kloster – Hovedøya kloster – verified_historical_source

Fullført uten godkjent Oslo-koordinat:
- akerhus_slott – legacy typo/alias for canonical akershus_festning.
- grini_fangeleir – ligger i Bærum og må flyttes ut av Oslo-kildefilen før ny canonical koordinatgodkjenning.

Ingen eksisterende lat/lon ble flyttet i denne batchen. Områdeobjekter fikk eksplisitt area_anchor og stabil kildeidentitet; legacy-alias og feil kommuneplassering ble ikke presset gjennom som verifiserte koordinater.
`);

console.log('Batch 18 applied: 5 approved, 2 needs_review.');
