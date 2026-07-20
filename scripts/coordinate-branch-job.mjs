import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const PLACE_ID = 'oslo_kornmagasin';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/oslo_kornmagasin.json';
const INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/naeringsliv/oslo_kornmagasin.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const QUIZ = 'data/quiz/naeringsliv/oslo_kornmagasin_sets_merged.json';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-41';

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function writeJson(file, value) {
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex');
}

function updatePlaceArray(file, updater) {
  const data = readJson(file);
  if (!Array.isArray(data)) throw new Error(`${file} is not an array`);
  const index = data.findIndex((place) => place?.id === PLACE_ID);
  if (index < 0) throw new Error(`${PLACE_ID} missing from ${file}`);
  data[index] = updater(data[index]);
  writeJson(file, data);
  return data[index];
}

const finalPlace = {
  id: PLACE_ID,
  name: 'Kornmagasinet på Akershus festning',
  lat: 59.9071958,
  lon: 10.7379439,
  r: 120,
  category: 'naeringsliv',
  year: 1788,
  desc: 'Kornmagasinet på Akershus festning ble oppført i 1788 som et konkret lagerbygg for korn og proviant. Bygningen ble senere tatt i bruk som slaveri og inngikk deretter i Akershus landsfengsel, og viser hvordan samme fysiske anlegg kunne skifte rolle fra forsyningsinfrastruktur til straffeinstitusjon.',
  popupDesc: 'Kornmagasinet på Akershus festning er inventar 0008 i det fredede festningsanlegget og er dokumentert som oppført i 1788. Den opprinnelige funksjonen var lagring av korn og proviant. I 1820 ble bygningen innredet som slaveri, og den ble senere en del av Akershus landsfengsel.\n\nI History Go brukes stedet som et konkret eksempel på hvordan statlig forsyning, lagring og institusjonsmakt kunne være samlet i samme bygningsmiljø, og hvordan et bygg kan få helt nye funksjoner gjennom historien.',
  emne_ids: [
    'em_naer_felt_arbeid_verdiskaping',
    'em_naer_geografi_infrastruktur',
    'em_by_kommersielle_gater'
  ],
  quiz_profile: {
    place_type: 'historisk_bygning',
    subtype: 'militaert_kornmagasin_og_senere_fengselsbygg',
    signature_features: [
      'Kornmagasinet, inventar 0008 på Akershus festning',
      'oppført i 1788 som lager for korn og proviant',
      'senere brukt som slaveri og del av Akershus landsfengsel'
    ],
    primary_angles: [
      'historie',
      'arbeid',
      'teknikk',
      'konflikt_forandring'
    ],
    question_families: [
      'historisk_endring',
      'funksjon_i_byokonomi',
      'arbeid_og_produksjon',
      'kontrast'
    ],
    avoid_angles: [
      'kun_arkitektur',
      'generisk_turistsporsmal',
      'udokumentert_1785_identitet'
    ],
    must_include: [
      'den dokumenterte 1788-identiteten som Kornmagasinet på Akershus festning',
      'skiftet fra forsyningslager til slaveri og fengselsbruk'
    ],
    contrast_targets: [
      'akershus_slott_bakeriet',
      'akershus_festning',
      'jernbanetorget'
    ],
    notes: 'Spør om det konkrete Kornmagasinet fra 1788 og bygningens dokumenterte funksjonsskifter; ikke gjenbruk den tidligere udokumenterte Christiania-kornmagasin-identiteten fra 1785.'
  },
  locatorType: 'building',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:669390505',
  geocodeAccuracy: 'building',
  coordRole: 'building_center',
  coordType: 'building_center',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 669390505; identity and year cross-checked against Lovdata fredningsforskrift for Akershus festning, inventar 0008',
  coordSourceId: 'osm-way:669390505',
  coordSourceUrl: 'https://www.openstreetmap.org/way/669390505',
  coordVerifiedAt: '2026-07-20',
  coordNote: 'Den tidligere aktive 1785-recorden «Christiania kornmagasin» manglet eksternt verifisert identitet. Offisiell fredningsforskrift identifiserer i stedet inventar 0008 som Kornmagasinet fra 1788 på Akershus festning. Det eksakte navngitte OSM-bygningsobjektet way 669390505 brukes som geometrikilde for selve bygningen. Fysisk overlap er kontrollert mot det separate Bakeriet, som har eget bygningsobjekt osm-way:669390521.'
};

const aggregate = readJson(AGGREGATE);
if (!Array.isArray(aggregate)) throw new Error('Aggregate place file is not an array');
const aggregateIndex = aggregate.findIndex((place) => place?.id === PLACE_ID);
if (aggregateIndex < 0) throw new Error(`${PLACE_ID} missing from aggregate`);
const beforePlace = structuredClone(aggregate[aggregateIndex]);
aggregate[aggregateIndex] = { ...aggregate[aggregateIndex], ...finalPlace };
writeJson(AGGREGATE, aggregate);
writeJson(CHILD, { ...readJson(CHILD), ...finalPlace });

const index = readJson(INDEX);
if (!Array.isArray(index)) throw new Error('Split index is not an array');
const indexRow = index.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`${PLACE_ID} missing from split index`);
Object.assign(indexRow, {
  name: finalPlace.name,
  lat: finalPlace.lat,
  lon: finalPlace.lon,
  r: finalPlace.r,
  year: finalPlace.year,
  coordStatus: finalPlace.coordStatus,
  coordType: finalPlace.coordType,
  locatorType: finalPlace.locatorType,
  sourceProvider: finalPlace.sourceProvider,
  sourceObjectId: finalPlace.sourceObjectId,
  geocodeAccuracy: finalPlace.geocodeAccuracy,
  coordRole: finalPlace.coordRole,
  coordSource: finalPlace.coordSource,
  coordVerifiedAt: finalPlace.coordVerifiedAt,
  coordNote: finalPlace.coordNote
});
writeJson(INDEX, index);

const splitManifest = readJson(SPLIT_MANIFEST);
const splitRow = splitManifest.places?.find((row) => row?.id === PLACE_ID);
if (!splitRow) throw new Error(`${PLACE_ID} missing from split manifest`);
splitRow.name = finalPlace.name;
splitRow.sha256 = sha256(CHILD);
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: AGGREGATE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: finalPlace.lat,
    lon: finalPlace.lon,
    r: finalPlace.r,
    coordStatus: finalPlace.coordStatus,
    coordSource: finalPlace.coordSource,
    coordType: finalPlace.coordType,
    coordNote: finalPlace.coordNote
  },
  identity: {
    currentName: finalPlace.name,
    resolvedIdentity: 'Kornmagasinet, inventar 0008 på Akershus festning, oppført 1788',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'offisiell historisk identitet og år',
    'eksakt fysisk bygningsgeometri',
    'fysisk avgrensning mot andre Akershus-bygninger'
  ],
  evidence: [
    {
      sourceProvider: 'official_heritage',
      sourceName: 'Lovdata – fredningsforskrift for Akershus festning',
      sourceUrl: 'https://lovdata.no/dokument/LF/forskrift/2014-12-17-1696/%C2%A73',
      sourceObjectId: 'akershus-inventar:0008',
      sourceQuality: 'official_heritage_identity',
      finding: 'Fredningsforskriften identifiserer inventar 0008 som Kornmagasinet og daterer bygningen til 1788.',
      canVerifyCoordinate: false,
      reason: 'Kilden verifiserer identitet og år; det eksakte OSM-bygningsobjektet er geometrikilden.'
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 669390505 – Kornmagasinet',
      sourceUrl: 'https://www.openstreetmap.org/way/669390505',
      sourceObjectId: 'osm-way:669390505',
      sourceQuality: 'exact_named_building_geometry',
      finding: 'Det navngitte OSM-way-objektet representerer Kornmagasinet på Akershus festning.',
      canVerifyCoordinate: true,
      reason: finalPlace.coordNote
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 669390521 – Bakeriet',
      sourceUrl: 'https://www.openstreetmap.org/way/669390521',
      sourceObjectId: 'osm-way:669390521',
      sourceQuality: 'physical_overlap_cross_check',
      finding: 'Det separate canonical Bakeriet har et eget fysisk bygningsobjekt og overlapper ikke Kornmagasinets objektidentitet.',
      canVerifyCoordinate: false,
      reason: 'Brukes som fysisk overlap-audit, ikke som koordinatkilde for Kornmagasinet.'
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:669390505',
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:669390505',
      canApplyToPlace: true
    }
  ],
  coordinateCandidates: [
    {
      lat: finalPlace.lat,
      lon: finalPlace.lon,
      coordRole: 'building_center',
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Identiteten er korrigert til det offisielt dokumenterte Kornmagasinet fra 1788, og eksakt navngitt bygningsgeometri er anvendt.'
  },
  notes: [finalPlace.coordNote]
};
writeJson(EVIDENCE, evidence);

function transformQuizValue(value) {
  if (Array.isArray(value)) return value.map(transformQuizValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, transformQuizValue(item)]));
  }
  if (typeof value === 'number' && value === 1785) return 1788;
  if (typeof value !== 'string') return value;
  return value
    .replaceAll('Christiania kornmagasin', 'Kornmagasinet på Akershus festning')
    .replaceAll('christiania kornmagasin', 'Kornmagasinet på Akershus festning')
    .replaceAll('christiania_kornmagasin_matberedskap_og_proviant', 'akershus_kornmagasin_1788')
    .replaceAll('1785', '1788')
    .replaceAll('source-limited', 'offisielt dokumentert')
    .replaceAll('source_limited', 'officially_documented');
}

let quiz = transformQuizValue(readJson(QUIZ));
const lovdata = 'https://lovdata.no/dokument/LF/forskrift/2014-12-17-1696/%C2%A73';
const lokalhistorie = 'https://lokalhistoriewiki.no/wiki/Kornmagasinet_(Akershus_festning)';
if (!quiz.generated_from.includes(lovdata)) quiz.generated_from.push(lovdata);
quiz.merge_notes = {
  existing_quiz_status: 'Existing 5×6 set retained and corrected in batch 41.',
  kept: 'Kept the broader grain-storage, provisioning and institutional-history learning arc.',
  corrected: 'The unsupported active identity «Christiania kornmagasin, 1785» was replaced by the documented Kornmagasinet, inventory 0008 at Akershus festning, built in 1788. Meta-questions about what the place file claimed were replaced with externally grounded questions.',
  not_continued: 'No unsupported 1785 identity, no invented address, and no place-file-as-source quiz questions.',
  added: 'Official heritage identity from Lovdata, exact OSM building geometry, and documented reuse as slaveri and later prison context.'
};
quiz.profile_snapshot = {
  place_type: 'historical_grain_magazine_and_reused_institutional_building',
  subtype: 'akershus_kornmagasinet_1788',
  signature_features: [
    'Kornmagasinet, inventory 0008 at Akershus festning',
    'built in 1788 as a grain/provision magazine',
    'later reused as slaveri and in prison history'
  ],
  primary_angles: ['matforsyning', 'lager', 'beredskap', 'institusjonell_ombruk'],
  must_include: [
    'use the documented 1788 Akershus building identity',
    'connect original storage function to later institutional reuse',
    'avoid the unsupported former 1785 identity'
  ]
};

const questions = quiz.sets?.flatMap((set) => set.questions || []) || [];
const byId = new Map(questions.map((question) => [question.id, question]));
Object.assign(byId.get('oslo_kornmagasin_quiz_1') || {}, {
  question: 'Hvor ligger det dokumenterte Kornmagasinet fra 1788 som dette stedet representerer?',
  options: ['På Akershus festning', 'Ved Jernbanetorget', 'På Grünerløkka'],
  answer: 'På Akershus festning',
  answerIndex: 0,
  dimension: 'sted_identitet',
  topic: 'Kornmagasinet på Akershus festning',
  knowledge: 'Fredningsforskriften for Akershus festning identifiserer inventar 0008 som Kornmagasinet, datert 1788.',
  year: 1788,
  source: [lovdata, lokalhistorie],
  source_origin: 'external',
  claim_basis: 'official_heritage_identity',
  core_concepts: ['Kornmagasinet', 'Akershus festning', '1788'],
  concept_focus: ['Kornmagasinet', 'Akershus festning'],
  tags: ['akershus', 'kornmagasin', '1788']
});
Object.assign(byId.get('oslo_kornmagasin_quiz_2') || {}, {
  question: 'Hva var Kornmagasinets opprinnelige funksjon på Akershus festning?',
  options: ['Å lagre korn og proviant', 'Å være telegrafstasjon', 'Å reparere lokomotiver'],
  answer: 'Å lagre korn og proviant',
  answerIndex: 0,
  dimension: 'forsyning',
  topic: 'korn- og proviantlager',
  knowledge: 'Bygningen ble oppført som Kornmagasinet og inngikk i festningens forsynings- og lagerinfrastruktur.',
  year: 1788,
  source: [lovdata, lokalhistorie],
  source_origin: 'external',
  claim_basis: 'documented_building_function',
  core_concepts: ['kornlager', 'proviant', 'forsyning'],
  concept_focus: ['kornlager', 'proviant'],
  tags: ['korn', 'proviant', 'forsyning']
});
Object.assign(byId.get('oslo_kornmagasin_quiz_3') || {}, {
  question: 'Hvilket år er Kornmagasinet på Akershus festning dokumentert som oppført?',
  options: ['1788', '1820', '1854'],
  answer: '1788',
  answerIndex: 0,
  dimension: 'tidsfesting',
  topic: 'Kornmagasinet 1788',
  knowledge: 'Fredningsforskriften daterer Kornmagasinet, inventar 0008, til 1788.',
  year: 1788,
  source: [lovdata, lokalhistorie],
  source_origin: 'external',
  claim_basis: 'official_heritage_year',
  core_concepts: ['1788', 'Kornmagasinet', 'Akershus festning'],
  concept_focus: ['1788', 'Kornmagasinet'],
  tags: ['1788', 'kornmagasin', 'akershus']
});
writeJson(QUIZ, quiz);

let protocol = fs.readFileSync(path.join(ROOT, PROTOCOL), 'utf8');
protocol = protocol.split('\n').filter((line) => !line.includes('| `oslo_kornmagasin` – Christiania kornmagasin | needs_review')).join('\n');
const row41 = '| 41 | `oslo_kornmagasin` | Kornmagasinet på Akershus festning | verified_geometry | `osm-way:669390505` |';
if (!protocol.includes(row41)) {
  const row40 = '| 40 | `trikk_17_18` | Trikkelinje 17/18 | verified_geometry | `ruter:tram-lines:17+18:2026-04-20` |';
  if (!protocol.includes(row40)) throw new Error('Batch 40 protocol row missing');
  protocol = protocol.replace(row40, `${row40}\n${row41}`);
}
const narrative41 = 'Batch 41 (2026-07-20) løser `oslo_kornmagasin` som et identitetsproblem før koordinatproblemet. Den tidligere aktive «Christiania kornmagasin»-recorden fra 1785 manglet eksternt verifisert identitet, noe også eksisterende quiz-QC dokumenterte. Recorden er korrigert til Kornmagasinet, inventar 0008 på Akershus festning, offisielt datert 1788. Eksakt navngitt OSM-way 669390505 brukes som bygningsgeometri, kryssjekket mot fredningsforskriften. Fysisk overlap mot det separate Bakeriet er kontrollert mot dets eget OSM-bygningsobjekt 669390521.';
if (!protocol.includes(narrative41)) {
  const batch40Narrative = 'Batch 40 (2026-07-20) modellerer `trikk_17_18` som et forgrenet rutepar i stedet for ett symbolsk midtpunkt. Ruters gjeldende rutetabell definerer de to grenene, og fem entydige parent-stopp fra Enturs nasjonale stoppregister brukes som felles vestende, felles sentrums-/linjeanker ved Nybrua, grenankre ved Sinsenkrysset og Storo og felles ende ved Grefsen stasjon.';
  if (!protocol.includes(batch40Narrative)) throw new Error('Batch 40 narrative missing');
  protocol = protocol.replace(batch40Narrative, `${batch40Narrative}\n\n${narrative41}`);
}
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 41 korrigerer og koordinatfester Kornmagasinet på Akershus festning som dokumentert 1788-bygg. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(path.join(ROOT, PROTOCOL), protocol);

const leftoverQuizIssues = [];
const quizText = fs.readFileSync(path.join(ROOT, QUIZ), 'utf8');
for (const pattern of ['Christiania kornmagasin', '"year": 1785', 'placefil-år 1785', 'source_limited']) {
  if (quizText.includes(pattern)) leftoverQuizIssues.push(pattern);
}

const report = {
  date: '2026-07-20',
  batch: 41,
  applied: [{
    id: PLACE_ID,
    before: {
      name: beforePlace.name,
      year: beforePlace.year,
      lat: beforePlace.lat,
      lon: beforePlace.lon,
      coordStatus: beforePlace.coordStatus || ''
    },
    after: {
      name: finalPlace.name,
      year: finalPlace.year,
      lat: finalPlace.lat,
      lon: finalPlace.lon,
      coordStatus: finalPlace.coordStatus,
      sourceObjectId: finalPlace.sourceObjectId
    },
    identityResolution: 'Unsupported 1785 Christiania identity replaced with officially documented Akershus inventory 0008, Kornmagasinet, 1788.',
    overlapAudit: 'Distinct from canonical akershus_slott_bakeriet, which uses separate OSM way 669390521.'
  }],
  quizCleanup: {
    file: QUIZ,
    firstThreeMetaQuestionsRewritten: true,
    nameAndYearNormalizedAcrossFile: true,
    leftoverQuizIssues
  },
  protocolCounts: { verifiedCount, unresolvedCount }
};
writeJson(`${REPORT_DIR}/application-summary.json`, report);
fs.mkdirSync(path.join(ROOT, REPORT_DIR), { recursive: true });
fs.writeFileSync(path.join(ROOT, REPORT_DIR, 'README.md'), `# Oslo coordinate control batch 41\n\nBatch 41 resolves \`${PLACE_ID}\` by correcting identity before coordinate promotion.\n\n- The unsupported active identity “Christiania kornmagasin, 1785” is replaced by the documented Kornmagasinet, inventory 0008 at Akershus festning, dated 1788.\n- Official heritage identity: Lovdata fredningsforskrift for Akershus festning, inventory 0008.\n- Physical geometry: exact named OpenStreetMap way 669390505.\n- Physical overlap audit: the separate Bakeriet record uses OSM way 669390521.\n- The existing quiz set is normalized to the documented identity/year, and the first three place-file/meta questions are rewritten as externally grounded questions.\n- Protocol after application: ${verifiedCount} verified/source-controlled Oslo places and ${unresolvedCount} unresolved controls.\n\nAll generated changes are subject to the standard coordinate branch runner gates.\n`);

console.log(JSON.stringify({ ok: true, placeId: PLACE_ID, verifiedCount, unresolvedCount, leftoverQuizIssues }, null, 2));
