import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const AGG_REL = 'data/places/by/oslo/places_by.json';
const AGG = path.join(ROOT, AGG_REL);
const SPLIT_DIR = path.join(ROOT, 'data/places/by/oslo/places');
const SPLIT_MANIFEST = path.join(ROOT, 'data/places/by/oslo/places_by_manifest.json');
const SPLIT_INDEX = path.join(ROOT, 'data/places/by/oslo/places_by_index.json');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-16');
const REPORT = path.join(REPORT_DIR, 'README.md');
const VOIEN_LOOKUP = path.join(REPORT_DIR, 'voienvolden-geonorge.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const replaceRequired = (text, from, to, label) => { if (!text.includes(from)) throw new Error('Mangler forventet tekst: ' + label); return text.replace(from, to); };

function parseFinderOutput(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error('Fant ikke JSON i Geonorge-resultatet for Vøienvolden');
  return JSON.parse(raw.slice(start));
}

const voienResult = parseFinderOutput(VOIEN_LOOKUP);
if (!voienResult?.ok || voienResult?.status !== 'verified_candidate' || !voienResult?.coordinate) {
  throw new Error('Vøienvolden fikk ikke entydig verified_candidate fra Geonorge: ' + JSON.stringify({ status: voienResult?.status, reason: voienResult?.reason }));
}

const updates = {
  vigelandsparken: {
    locatorType: 'park',
    sourceProvider: 'municipality',
    sourceObjectId: 'vigelandmuseet:vigeland-park',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'park_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Vigelandmuseet / Oslo kommune – Vigelandsparken',
    coordSourceId: 'vigelandmuseet:vigeland-park',
    coordSourceUrl: 'https://vigeland.museum.no/',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker i selve Vigelandsparken. Vigelandmuseet, som er del av Oslo kommunes Kulturetat, dokumenterer parken som det samlede skulptur- og parkanlegget. Punktet beholdes på den sentrale aksen og brukes som parkanker, ikke som koordinat for én enkelt skulptur eller hele Frognerparken.'
  },
  voienvolden: {
    ...voienResult.coordinate,
    sourceObjectId: voienResult.sourceObjectId,
    coordVerifiedAt: DATE,
    coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Maridalsveien 120, Oslo. Punktet representerer Vøienvolden gårds stående gårdsanlegg og brukes som bygnings-/displayanker, ikke som et generelt Sagene-områdepunkt.'
  },
  carl_berner_plass: {
    lat: 59.926111,
    lon: 10.775833,
    r: 180,
    locatorType: 'square',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikidata:Q5039902',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikidata Q5039902 – Carl Berners plass',
    coordSourceId: 'wikidata:Q5039902',
    coordSourceUrl: 'https://www.wikidata.org/wiki/Q5039902',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for selve Carl Berners plass som trafikalt plass- og fordelingsrom. Wikidata-objekt Q5039902 identifiserer plassen, ikke T-banestasjonen eller en enkelt holdeplass. Punktet er derfor holdt adskilt fra kollektivobjektene med samme navn.'
  },
  tullin: {
    lat: 59.91651,
    lon: 10.73644,
    r: 300,
    locatorType: 'square',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:666946874',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 666946874 – Tullinløkka',
    coordSourceId: 'osm-way:666946874',
    coordSourceUrl: 'https://www.openstreetmap.org/way/666946874',
    coordVerifiedAt: DATE,
    coordNote: 'Geometriforankret områdeanker for Tullinløkka som det fysiske kjernepunktet i History Go-stedet Tullin. OSM-way 666946874 identifiserer selve løkke-/plassrommet. Radiusen dekker det nærliggende institusjons- og byområdet uten å hevde at hele Tullin er ett presist polygon.'
  },
  okern: {
    locatorType: 'linear_area',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikidata:Q12011791',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikidata Q12011791 – Økern',
    coordSourceId: 'wikidata:Q12011791',
    coordSourceUrl: 'https://www.wikidata.org/wiki/Q12011791',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Økern som by- og næringsområde. Wikidata Q12011791 identifiserer Økern som eget Oslo-strøk og koordinaten samsvarer med det eksisterende sentrale områdeankeret. Punktet er ikke én adresse eller selve T-banestasjonen.'
  },
  skoyen: {
    locatorType: 'linear_area',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikidata:Q6514682',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikidata Q6514682 – Skøyen',
    coordSourceId: 'wikidata:Q6514682',
    coordSourceUrl: 'https://www.wikidata.org/wiki/Q6514682',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Skøyen som by- og næringsområde. Wikidata Q6514682 identifiserer strøket og den dokumenterte koordinaten samsvarer med dagens sentrale områdeanker. Punktet er ikke Skøyen stasjon eller én enkelt næringseiendom.'
  },
  torshov: {
    locatorType: 'linear_area',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikidata:Q7827191',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikidata Q7827191 – Torshov',
    coordSourceId: 'wikidata:Q7827191',
    coordSourceUrl: 'https://www.wikidata.org/wiki/Q7827191',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Torshov som Oslo-strøk. Wikidata Q7827191 identifiserer Torshov som eget nabolag, og koordinaten samsvarer med det eksisterende sentrale områdeankeret. Punktet representerer ikke bare Torshov holdeplass eller Torshovparken.'
  }
};

const ids = Object.keys(updates);
const aggregate = readJson(AGG);
for (const [id, update] of Object.entries(updates)) {
  const row = aggregate.find((p) => p?.id === id);
  if (!row) throw new Error('Mangler place i aggregate: ' + id);
  Object.assign(row, update);
  delete row.coordPrecisionM;
}
writeJson(AGG, aggregate);

for (const [id, update] of Object.entries(updates)) {
  const file = path.join(SPLIT_DIR, id + '.json');
  const row = readJson(file);
  Object.assign(row, update);
  delete row.coordPrecisionM;
  writeJson(file, row);
}

const splitManifest = readJson(SPLIT_MANIFEST);
splitManifest.source_sha256 = sha256(AGG);
splitManifest.generated_at = new Date().toISOString();
for (const entry of splitManifest.places || []) {
  if (!updates[entry.id]) continue;
  entry.sha256 = sha256(path.join(path.dirname(SPLIT_MANIFEST), entry.file));
}
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
for (const id of ids) {
  const row = splitIndex.find((p) => p?.id === id);
  const source = aggregate.find((p) => p?.id === id);
  if (!row || !source) throw new Error('Mangler by-index/source for ' + id);
  for (const key of ['lat', 'lon', 'r', 'coordType', 'coordStatus']) row[key] = source[key];
}
writeJson(SPLIT_INDEX, splitIndex);

const evidenceDefs = {
  vigelandsparken: ['oslo/by/vigelandsparken.json', 'Vigelandsparken', 'det samlede skulptur- og parkanlegget i Frognerparken', 'Vigelandmuseet dokumenterer Vigelandsparken som et eget, alltid åpent skulptur- og parkanlegg og er selv del av Oslo kommunes Kulturetat.'],
  voienvolden: ['oslo/by/voienvolden.json', 'Vøienvolden', 'Vøienvolden gård i Maridalsveien 120', 'Geonorge gir ett entydig offisielt adressetreff for Maridalsveien 120; Fortidsminneforeningen dokumenterer gårdsanlegget på samme adresse.'],
  carl_berner_plass: ['oslo/by/carl_berner_plass.json', 'Carl Berners plass', 'Carl Berners plass som trafikalt plass- og fordelingsrom', 'Wikidata Q5039902 identifiserer selve plassen som square, adskilt fra T-bane- og holdeplassobjektene med samme navn.'],
  tullin: ['oslo/by/tullin.json', 'Tullin', 'Tullinløkka som fysisk kjerne i det bredere Tullin-området', 'OSM way 666946874 identifiserer Tullinløkka som eget park-/plassobjekt.'],
  okern: ['oslo/by/okern.json', 'Økern', 'Økern som by- og næringsområde i Bjerke', 'Wikidata Q12011791 identifiserer Økern som eget nabolag/strøk i Oslo.'],
  skoyen: ['oslo/by/skoyen.json', 'Skøyen', 'Skøyen som by- og næringsområde vest i Oslo', 'Wikidata Q6514682 identifiserer Skøyen som eget Oslo-strøk og skiller området fra stasjonen.'],
  torshov: ['oslo/by/torshov.json', 'Torshov', 'Torshov som bystrøk i indre Oslo nordøst', 'Wikidata Q7827191 identifiserer Torshov som eget nabolag i Oslo.']
};

for (const id of ids) {
  const place = aggregate.find((p) => p?.id === id);
  const d = evidenceDefs[id];
  writeJson(path.join(EVIDENCE_ROOT, d[0]), {
    placeId: id,
    placeFile: AGG_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: d[1], resolvedIdentity: d[2], identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'stable_object_or_area_definition', finding: d[3], canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: id === 'voienvolden' ? [{ address: 'Maridalsveien 120, 0461 Oslo', sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }] : [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const d of Object.values(evidenceDefs)) if (!evidenceManifest.files.includes(d[0])) evidenceManifest.files.push(d[0]);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(protocol, '| 15 | `birkelunden` | Birkelunden | verified_geometry | `oslo-kommune:park:birkelunden` |', '| 15 | `birkelunden` | Birkelunden | verified_geometry | `osm-way:3236549` |', 'Birkelunden protocol source correction');
protocol = replaceRequired(protocol,
  'Oslo-tabellen inneholder nå 90 verifiserte eller kildekontrollerte canonical steder. Batch 15 omfatter sju fullførte kontroller: seks godkjente stasjons-, plass-, park-, elve- og områdeankre, mens Bislett står separat som `needs_review` fordi område-recorden overlapper det separate canonical stadionstedet. Fem fullførte Oslo-kontroller står dermed separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo-tabellen inneholder nå 97 verifiserte eller kildekontrollerte canonical steder. Batch 16 legger til sju godkjente kontroller: Vigelandsparken, Vøienvolden, Carl Berners plass, Tullin, Økern, Skøyen og Torshov. Fem fullførte Oslo-kontroller står fortsatt separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo summary');

const last = '| 15 | `barcode` | Barcode | verified_geometry | `osm-node:8071120191` |';
const rows = [
  '| 16 | `vigelandsparken` | Vigelandsparken | verified_geometry | `vigelandmuseet:vigeland-park` |',
  `| 16 | \`voienvolden\` | Vøienvolden | verified | \`${voienResult.sourceObjectId}\` |`,
  '| 16 | `carl_berner_plass` | Carl Berners plass | verified_geometry | `wikidata:Q5039902` |',
  '| 16 | `tullin` | Tullin | verified_geometry | `osm-way:666946874` |',
  '| 16 | `okern` | Økern | verified_geometry | `wikidata:Q12011791` |',
  '| 16 | `skoyen` | Skøyen | verified_geometry | `wikidata:Q6514682` |',
  '| 16 | `torshov` | Torshov | verified_geometry | `wikidata:Q7827191` |'
].join('\n');
protocol = replaceRequired(protocol, last, last + '\n' + rows, 'batch 16 rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 90 verifiserte eller kildekontrollerte canonical stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 97 verifiserte eller kildekontrollerte canonical stedene.');
protocol = replaceRequired(protocol,
  '- Neste nye Oslo-kontroll er nummer 94 og starter batch 16.\n- Batch 15 er fullført med seks godkjente ankere og én dokumentert overlap-sak for Bislett-strøket.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 101 og starter batch 17.\n- Batch 16 er fullført med sju godkjente park-, bygnings-, plass- og områdeankre.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work');
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 16\n\nDato: ${DATE}\n\nSju nye canonical Oslo-steder er kontrollert og godkjent. Vøienvolden bruker den normative Geonorge-adresseflyten; de øvrige bruker objekt- eller områdekilder som passer stedstypen.\n\n| placeId | status | kildeobjekt |\n|---|---|---|\n| \`vigelandsparken\` | verified_geometry | \`vigelandmuseet:vigeland-park\` |\n| \`voienvolden\` | verified | \`${voienResult.sourceObjectId}\` |\n| \`carl_berner_plass\` | verified_geometry | \`wikidata:Q5039902\` |\n| \`tullin\` | verified_geometry | \`osm-way:666946874\` |\n| \`okern\` | verified_geometry | \`wikidata:Q12011791\` |\n| \`skoyen\` | verified_geometry | \`wikidata:Q6514682\` |\n| \`torshov\` | verified_geometry | \`wikidata:Q7827191\` |\n\nBirkelunden-raden i den løpende protokollen korrigeres samtidig fra den tidligere kommunale identitetskilden til den faktiske endelige koordinatkilden \`osm-way:3236549\`.\n`);

console.log('Completed Oslo coordinate batch 16');
