import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const ID = 'oslo_kraftselskap';
const VERIFIED_AT = '2026-07-20';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/oslo_kraftselskap.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/naeringsliv/oslo_kraftselskap.json';
const CIVICATION = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-kraftselskap-headquarters-coordinate-control';
const ADDRESS_REPORT = `${REPORT_DIR}/address-sommerrogata-1.json`;

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex');
}

fs.mkdirSync(full(REPORT_DIR), { recursive: true });

// Address-first is mandatory for this resolved addressable building.
execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
const finderOutput = execFileSync(
  'node',
  ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Sommerrogata 1 Oslo'],
  { encoding: 'utf8' }
);
fs.writeFileSync(full(ADDRESS_REPORT), finderOutput.endsWith('\n') ? finderOutput : `${finderOutput}\n`);
const finder = JSON.parse(finderOutput);
if (!finder.ok || finder.status !== 'verified_candidate' || !finder.coordinate) {
  throw new Error(`Sommerrogata 1 is not an unambiguous Geonorge verified_candidate: ${finderOutput}`);
}
const c = finder.coordinate;
const sourceObjectId = String(finder.sourceObjectId || '');
if (sourceObjectId !== 'geonorge-adresser-v1:0301:16854:1') {
  throw new Error(`Unexpected Sommerrogata 1 source object: ${sourceObjectId}`);
}
if (c.lat !== 59.915245305085435 || c.lon !== 10.719611579321567) {
  throw new Error(`Sommerrogata 1 address point changed unexpectedly: ${c.lat}, ${c.lon}`);
}

const previous = readJson(CHILD);
if (previous.id !== ID) throw new Error(`Unexpected child state for ${ID}`);
if (previous.coordStatus === 'verified' && previous.sourceObjectId === sourceObjectId) {
  throw new Error(`${ID} is already verified at the intended address object`);
}

const coordNote = `${c.coordNote} History Go-recorden er avgrenset til Oslo Lysverkers bevarte hovedkontor i Sommerrogata 1, oppført i 1931; punktet skal ikke tolkes som anker for hele strømnettet eller for Christiania Elektricitetsværks første kraftstasjon i Rosenkrantz' gate 14 fra 1892.`;
const updatedPlace = {
  ...previous,
  name: 'Oslo Lysverkers hovedkontor',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  year: 1931,
  desc: 'Monumentalt hovedkontor oppført for Oslo Lysverker i 1931, der byens energiforsyning fikk en tydelig administrativ og representativ base.',
  popupDesc: "Christiania Elektricitetsværk startet byens kommunale elektrisitetsforsyning i 1892, med den første kraftstasjonen i Rosenkrantz' gate 14. Virksomheten utviklet seg senere til Oslo Lysverker, og i 1931 fikk etaten et nytt monumentalt hovedkontor i Sommerrogata 1.\n\nI History Go representerer denne place-recorden selve hovedkontorbygningen fra 1931, ikke Oslo Lysverker som abstrakt institusjon, hele strømnettet eller den første kraftstasjonen fra 1892. Bygget gjør likevel energihistorien fysisk lesbar: administrasjon, teknisk styring og byens voksende kraftsystem fikk her en tydelig arkitektonisk adresse.",
  quiz_profile: {
    place_type: 'institusjonsbygg',
    subtype: 'energiverk_hovedkontor_og_administrasjon',
    signature_features: [
      'Oslo Lysverkers hovedkontor i Sommerrogata 1',
      'monumental energiforvaltningsbygning oppført i 1931',
      'fysisk administrativt anker for byens kommunale elektrisitetsforsyning'
    ],
    primary_angles: ['historie', 'arbeid', 'teknikk', 'arkitektur', 'konflikt_forandring'],
    question_families: ['historisk_endring', 'funksjon_i_byokonomi', 'arbeid_og_produksjon', 'teknisk_fysisk', 'kontrast'],
    avoid_angles: [
      'behandle hele strømnettet som om det lå i Sommerrogata 1',
      'blande kraftstasjonen i Rosenkrantz gate fra 1892 med hovedkontoret fra 1931',
      'generisk energihistorie uten fysisk forankring'
    ],
    must_include: [
      'at place-recorden gjelder hovedkontorbygningen fra 1931',
      'skillet mellom institusjonshistorien fra 1892 og bygningens egen historie',
      'koblingen mellom energiinfrastruktur, administrasjon og byutvikling'
    ],
    contrast_targets: ['vulkan_energisentral', 'toyen_trafo', 'oslo_gassverk'],
    notes: 'Spør bygget som fysisk hovedkontor og administrativt energianlegg. 1892 er institusjonell forhistorie, ikke byggeåret for Sommerrogata 1.'
  },
  locatorType: c.locatorType,
  sourceProvider: c.sourceProvider,
  sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordType: c.coordType,
  coordNote,
  coordVerifiedAt: VERIFIED_AT
};
writeJson(CHILD, updatedPlace);

const aggregate = readJson(AGGREGATE);
let aggregateMatches = 0;
const updatedAggregate = aggregate.map((place) => {
  if (place?.id !== ID) return place;
  aggregateMatches++;
  return updatedPlace;
});
if (aggregateMatches !== 1) throw new Error(`Expected one ${ID} in aggregate, found ${aggregateMatches}`);
writeJson(AGGREGATE, updatedAggregate);

const splitIndex = readJson(SPLIT_INDEX);
let indexMatches = 0;
const updatedIndex = splitIndex.map((row) => {
  if (row?.id !== ID) return row;
  indexMatches++;
  return {
    ...row,
    name: updatedPlace.name,
    category: updatedPlace.category,
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
    year: updatedPlace.year,
    coordType: updatedPlace.coordType,
    coordStatus: updatedPlace.coordStatus,
    locatorType: updatedPlace.locatorType,
    sourceProvider: updatedPlace.sourceProvider,
    sourceObjectId: updatedPlace.sourceObjectId,
    coordSource: updatedPlace.coordSource,
    coordVerifiedAt: updatedPlace.coordVerifiedAt,
    coordNote: updatedPlace.coordNote
  };
});
if (indexMatches !== 1) throw new Error(`Expected one ${ID} in split index, found ${indexMatches}`);
writeJson(SPLIT_INDEX, updatedIndex);

const splitManifest = readJson(SPLIT_MANIFEST);
const manifestRow = (splitManifest.places || []).find((row) => row?.id === ID);
if (!manifestRow) throw new Error(`${ID} missing from split manifest`);
manifestRow.name = updatedPlace.name;
manifestRow.sha256 = sha256(CHILD);
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

writeJson(EVIDENCE, {
  placeId: ID,
  placeFile: AGGREGATE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: updatedPlace.coordNote
  },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Oslo Lysverkers hovedkontor i Sommerrogata 1, oppført i 1931',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: "Institusjonshistorien er avgrenset fra det fysiske place-objektet: recorden representerer hovedkontorbygningen i Sommerrogata 1. Kraftstasjonen i Rosenkrantz' gate 14 og øvrige anlegg er historisk kontekst, ikke samme fysiske anker."
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for Sommerrogata 1',
    'dokumentert identitet som Oslo Lysverkers hovedkontorbygning fra 1931',
    'overlap-audit mot eksisterende canonical places på samme adresse'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: finder.sourceName,
      sourceUrl: finder.sourceUrl,
      sourceObjectId,
      sourceQuality: 'official_address_for_resolved_surviving_headquarters_building',
      finding: `Geonorge returnerte et entydig adressepunkt for Sommerrogata 1: ${updatedPlace.lat}, ${updatedPlace.lon}.`,
      canVerifyCoordinate: true,
      reason: 'Recorden er eksplisitt avgrenset til den adressebare hovedkontorbygningen, så offisiell adressekoordinat er riktig primær koordinatkilde.'
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Oslo Lysverker',
      sourceUrl: 'https://oslobyleksikon.no/side/Oslo_Lysverker',
      sourceObjectId: 'oslobyleksikon:oslo-lysverker',
      sourceQuality: 'documented_building_identity_and_institution_history',
      finding: 'Kilden skiller institusjonens start i 1892 fra hovedkontorbygningen i Sommerrogata 1, oppført i 1931.',
      canVerifyCoordinate: false,
      reason: 'Brukes til identitets- og tidsavgrensning; Geonorge er primær koordinatkilde.'
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Sommerrogata',
      sourceUrl: 'https://oslobyleksikon.no/side/Sommerrogata',
      sourceObjectId: 'oslobyleksikon:sommerrogata',
      sourceQuality: 'documented_address_building_identity',
      finding: 'Sommerrogata 1 dokumenteres som bygningen oppført for Oslo Lysverker i 1931.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker at det offisielle adressepunktet representerer riktig historisk hovedobjekt.'
    }
  ],
  addressCandidates: [{
    address: 'Sommerrogata 1 Oslo',
    sourceProvider: 'official_address',
    sourceObjectId,
    canApplyToPlace: true
  }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: updatedPlace.lat, lon: updatedPlace.lon, coordRole: updatedPlace.coordRole, canApplyToPlace: true }],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Use Sommerrogata 1 as the verified address anchor for the resolved 1931 headquarters building; keep 1892 and the first power station as institutional history only.'
  },
  notes: [
    `Geonorge address-first result is saved in ${ADDRESS_REPORT}.`,
    'No separate canonical place at Sommerrogata 1 was found in the repository overlap audit.',
    'The place year is 1931 because the active physical object is the headquarters building; 1892 remains in the historical narrative.'
  ]
});

const civication = readJson(CIVICATION);
const mapping = civication.mappings?.map_oslo_kraftselskap;
if (!mapping || mapping.historyGoPlaceId !== ID) throw new Error('Expected map_oslo_kraftselskap Civication mapping');
Object.assign(mapping, {
  name: updatedPlace.name,
  lat: updatedPlace.lat,
  lon: updatedPlace.lon,
  emne_ids: updatedPlace.emne_ids,
  buildingTypeId: 'building_energy_utility_headquarters',
  mapRole: 'historic_municipal_power_headquarters',
  visibleAs: 'institutional_building',
  needsVerification: false
});
writeJson(CIVICATION, civication);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart0 = protocol.indexOf(unresolvedHeader);
if (unresolvedStart0 < 0) throw new Error('Oslo unresolved header missing');
const osloStart0 = protocol.indexOf('## Oslo');
const tableSection = protocol.slice(osloStart0, unresolvedStart0);
if (tableSection.split('\n').some((line) => /^\| \d+ \|/.test(line) && line.includes('`' + ID + '`'))) {
  throw new Error(`${ID} already exists in the verified Oslo table`);
}
const batchMatches = [...tableSection.matchAll(/^\| (\d+) \|/gm)].map((match) => Number(match[1]));
const batch = Math.max(...batchMatches, 0) + 1;
const etneStart0 = protocol.indexOf('\n## Etne', unresolvedStart0);
const unresolvedEnd0 = etneStart0 >= 0 ? etneStart0 : protocol.length;
const unresolvedLines = protocol.slice(unresolvedStart0, unresolvedEnd0).split('\n');
const cleanedUnresolvedLines = unresolvedLines.filter((line) => !line.includes('`' + ID + '`'));
if (cleanedUnresolvedLines.length === unresolvedLines.length) {
  throw new Error(`${ID} not found in unresolved Oslo controls`);
}
protocol = protocol.slice(0, unresolvedStart0) + cleanedUnresolvedLines.join('\n') + protocol.slice(unresolvedEnd0);

const unresolvedStart1 = protocol.indexOf(unresolvedHeader);
const newRow = `| ${batch} | \`${ID}\` | ${updatedPlace.name} | verified | \`${sourceObjectId}\` |`;
protocol = `${protocol.slice(0, unresolvedStart1).replace(/\s*$/, '\n')}${newRow}\n\n${protocol.slice(unresolvedStart1)}`;

const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('\n## Etne', unresolvedStart);
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Siste kontroll avgrenset \`${ID}\` til Oslo Lysverkers hovedkontor i Sommerrogata 1 og verifiserte bygget med Geonorge-adressepunkt. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);
protocol = protocol.replace(
  /^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m,
  `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: VERIFIED_AT,
  placeId: ID,
  resolvedIdentity: updatedPlace.name,
  resolvedAddress: updatedPlace.address,
  sourceObjectId,
  coordinate: { lat: updatedPlace.lat, lon: updatedPlace.lon, r: updatedPlace.r },
  previousCoordinate: { lat: previous.lat, lon: previous.lon, r: previous.r },
  placeYear: 1931,
  institutionalHistoryStart: 1892,
  protocolBatch: batch,
  protocolCounts: { verifiedCount, unresolvedCount },
  overlapAudit: 'No separate canonical place at Sommerrogata 1 found in repository search.'
});
fs.writeFileSync(full(`${REPORT_DIR}/README.md`), `# Oslo Lysverkers hovedkontor coordinate control\n\n- Resolved \`${ID}\` as the surviving headquarters building at Sommerrogata 1, not the abstract utility system.\n- Ran the repository Geonorge address-first finder and saved the exact result in \`address-sommerrogata-1.json\`.\n- Applied the unambiguous official address point \`${sourceObjectId}\`.\n- Set the physical place year to 1931; retained 1892 as institutional history only.\n- Updated aggregate, split child/index/manifest, coordinate evidence, Civication mapping and coordinate protocol.\n- Protocol batch: ${batch}.\n- Protocol after control: ${verifiedCount} verified/source-controlled Oslo places; ${unresolvedCount} unresolved controls.\n`);

console.log(JSON.stringify({
  ok: true,
  placeId: ID,
  sourceObjectId,
  coordinate: { lat: updatedPlace.lat, lon: updatedPlace.lon },
  batch,
  verifiedCount,
  unresolvedCount
}, null, 2));
