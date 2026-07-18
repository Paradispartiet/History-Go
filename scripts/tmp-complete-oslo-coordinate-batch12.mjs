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
const REPORT = path.join(ROOT, 'reports/oslo-coordinate-control-batch-12.md');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const replaceRequired = (text, from, to, label) => { if (!text.includes(from)) throw new Error('Mangler forventet tekst: ' + label); return text.replace(from, to); };

const verifiedUpdates = {
  grunerlokka_helgesens_tm: {
    locatorType: 'street',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:thorvald-meyers-gate:helgesens-gate-corner',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'intersection_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Thorvald Meyers gate / Helgesens gate',
    coordSourceId: 'oslobyleksikon:thorvald-meyers-gate:helgesens-gate-corner',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Thorvald_Meyers_gate',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker for byrommet rundt krysset Helgesens gate / Thorvald Meyers gate. Oslo byleksikon identifiserer Thorvald Meyers gate 34 som hjørnegård ved krysset med Helgesens gate. Punktet representerer det nære gatekryss- og kantsonemiljøet som History Go-stedet beskriver, ikke et påstått matematisk kryssenter.'
  },
  toyen_torg: {
    locatorType: 'square',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:byplan:toyen-torg',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Tøyen torg / torg- og møteplassprogrammet',
    coordSourceId: 'oslo-kommune:byplan:toyen-torg',
    coordSourceUrl: 'https://magasin.oslo.kommune.no/byplan/gode-ideer-gir-gode-moteplasser',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker i selve Tøyen torg ved Tøyensenteret. Oslo kommune dokumenterer ombyggingen av selve sentertorget som offentlig møteplass. Punktet ligger i torgrommet og brukes som områdeanker, ikke som adressepunkt for en av bygningene rundt.'
  },
  majorstuen_krysset: {
    locatorType: 'street',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:valkyriegata:majorstukrysset',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'intersection_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Valkyriegata / Majorstukrysset',
    coordSourceId: 'oslobyleksikon:valkyriegata:majorstukrysset',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Valkyriegata',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker for Majorstukrysset. Oslo byleksikon oppgir at Valkyriegata krysser Kirkeveien i Majorstukrysset. Punktet representerer det trafikale overgangsrommet rundt krysset og kollektivknutepunktet, ikke et påstått matematisk kryssenter.'
  },
  st_hanshaugen_park: {
    locatorType: 'park',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:park:st-hanshaugen',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'park_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – St. Hanshaugen park + OSM way 3426697',
    coordSourceId: 'oslo-kommune:park:st-hanshaugen',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/st-hanshaugen/',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker inne i St. Hanshaugen park. Oslo kommune identifiserer parken og dens topografiske parkrom; den tidligere kartkontrollen plasserte punktet innenfor OSM-way 3426697. Punktet brukes som parkanker, ikke som et eksakt sentrum for hele parkpolygonet.'
  },
  aker_brygge: {
    locatorType: 'linear_area',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:fjordbyen:aker-brygge',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Fjordbyen: Aker brygge',
    coordSourceId: 'oslo-kommune:fjordbyen:aker-brygge',
    coordSourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/aker-brygge',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Aker Brygge. Oslo kommune avgrenser det 58 dekar store Fjordby-området mot Tjuvholmen og Filipstad i vest og Rådhusplassen/Vestbanen i nord. Punktet brukes som display-/områdeanker for byutviklingsområdet, ikke som én enkelt adresse.'
  }
};

const aggregate = readJson(AGG);
for (const [id, update] of Object.entries(verifiedUpdates)) {
  const row = aggregate.find((p) => p?.id === id);
  if (!row) throw new Error('Mangler place i aggregate: ' + id);
  Object.assign(row, update);
  delete row.coordPrecisionM;
}
writeJson(AGG, aggregate);

for (const [id, update] of Object.entries(verifiedUpdates)) {
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
  if (!verifiedUpdates[entry.id]) continue;
  entry.sha256 = sha256(path.join(path.dirname(SPLIT_MANIFEST), entry.file));
}
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
for (const [id, update] of Object.entries(verifiedUpdates)) {
  const row = splitIndex.find((p) => p?.id === id);
  if (!row) throw new Error('Mangler place i by-index: ' + id);
  for (const key of ['lat', 'lon', 'r', 'coordType', 'coordStatus']) {
    const source = aggregate.find((p) => p?.id === id);
    row[key] = source[key];
  }
}
writeJson(SPLIT_INDEX, splitIndex);

const byId = new Map(aggregate.map((p) => [p.id, p]));
const verifiedEvidence = {
  grunerlokka_helgesens_tm: ['oslo/by/grunerlokka_helgesens_tm.json', 'Grünerløkka – Helgesens / Thorvald Meyers', 'gatekryss- og kantsonemiljøet rundt Helgesens gate / Thorvald Meyers gate', 'Oslo byleksikon identifiserer Thorvald Meyers gate 34 som hjørnegård ved krysset med Helgesens gate.'],
  toyen_torg: ['oslo/by/toyen_torg.json', 'Tøyen torg', 'det offentlige torgrommet ved Tøyensenteret', 'Oslo kommune dokumenterer Tøyen torg som et sentertorg som ble utviklet og ombygd som møteplass.'],
  majorstuen_krysset: ['oslo/by/majorstuen_krysset.json', 'Majorstuen krysset', 'trafikk- og overgangsrommet i Majorstukrysset', 'Oslo byleksikon identifiserer Majorstukrysset gjennom krysset Valkyriegata/Kirkeveien.'],
  st_hanshaugen_park: ['oslo/by/st_hanshaugen_park.json', 'St. Hanshaugen park', 'St. Hanshaugen som kommunalt parkareal og høydepark', 'Oslo kommune identifiserer og beskriver St. Hanshaugen som kommunal park; tidligere kartkontroll plasserer ankeret i parkpolygonet.'],
  aker_brygge: ['oslo/by/aker_brygge.json', 'Aker Brygge', 'Aker Brygge som avgrenset Fjordby-delområde', 'Oslo kommune dokumenterer Aker Brygge som et 58 dekar stort byutviklingsområde og beskriver nabogrensene.']
};

for (const [id, info] of Object.entries(verifiedEvidence)) {
  const place = byId.get(id);
  const update = verifiedUpdates[id];
  writeJson(path.join(EVIDENCE_ROOT, info[0]), {
    placeId: id,
    placeFile: AGG_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: info[1], resolvedIdentity: info[2], identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'representativt områdeanker', 'tydelig avgrensning mot nærliggende steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'documented_place_or_area_definition', finding: info[3], canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
}

const reviewEvidence = {
  ring_3: {
    file: 'oslo/by/ring_3.json',
    name: 'Ring 3',
    sourceProvider: 'official_map',
    sourceName: 'Statens vegvesen – rv. 150 Ring 3',
    sourceUrl: 'https://www.vegvesen.no/vegprosjekter/prosjekt/sykkelvegeroslo/',
    sourceObjectId: 'statens-vegvesen:rv150:ring-3',
    finding: 'Statens vegvesen dokumenterer Ring 3 som rv. 150 og viser flere delstrekninger, men dagens History Go-record mangler traségeometri eller flere kildebelagte ruteankre som kan verifisere hele lineære objektet.',
    blockedReason: 'Dagens ene lavpresisjonspunkt kan ikke verifisere hele Ring 3. Repoets tidligere coordinate-anchor-audit krever en senere routeSegments-/rutemodell.'
  },
  trikk_17_18: {
    file: 'oslo/by/trikk_17_18.json',
    name: 'Trikkelinje 17/18',
    sourceProvider: 'manual_research',
    sourceName: 'Ruter – trikkelinjer 17 og 18 / linjekart',
    sourceUrl: 'https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/trikk',
    sourceObjectId: 'ruter:tram-lines:17+18:2026',
    finding: 'Ruter dokumenterer linjene 17 og 18 i gjeldende trikkenett, men dagens kombinerte History Go-record har bare ett lavpresisjonspunkt og ingen kildebelagt traségeometri eller ruteankre.',
    blockedReason: 'Ett punkt kan ikke verifisere to lineære trikkeruter. Stedet trenger rutegeometri/routeSegments eller et eksplisitt modellert fellessegment.'
  }
};

for (const [id, d] of Object.entries(reviewEvidence)) {
  const place = byId.get(id);
  writeJson(path.join(EVIDENCE_ROOT, d.file), {
    placeId: id,
    placeFile: AGG_REL,
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_geometry',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource ?? '', coordType: place.coordType ?? '', coordNote: place.coordNote ?? '' },
    identity: { currentName: d.name, resolvedIdentity: d.name, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '' },
    requiredEvidence: ['offisiell eller stabil rutekilde', 'traségeometri eller flere kildebelagte ruteankre', 'egen representasjonsregel for lineært unlock/display'],
    evidence: [{ sourceProvider: d.sourceProvider, sourceName: d.sourceName, sourceUrl: d.sourceUrl, sourceObjectId: d.sourceObjectId, sourceQuality: 'official_route_identity', finding: d.finding, canVerifyCoordinate: false, reason: d.blockedReason }],
    addressCandidates: [], sourceObjectCandidates: [{ sourceProvider: d.sourceProvider, sourceObjectId: d.sourceObjectId, canApplyToPlace: false }], geometryCandidates: [], coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: d.blockedReason, nextAction: 'Bygg routeSegments/rutegeometri før koordinaten kan godkjennes.' },
    notes: [d.blockedReason]
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const info of Object.values(verifiedEvidence)) if (!evidenceManifest.files.includes(info[0])) evidenceManifest.files.push(info[0]);
for (const d of Object.values(reviewEvidence)) if (!evidenceManifest.files.includes(d.file)) evidenceManifest.files.push(d.file);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(protocol,
  'Oslo-tabellen inneholder nå 65 verifiserte eller kildekontrollerte canonical steder. Batch 1–11 er fullført, der batch 11 avsluttes med fem objekt- og områdespesifikke kontroller av Torggata, Bispelokket, Karl Johans gate, Rådhusplassen og Bjørvika. I tillegg er to kandidater ferdig kontrollert med `needs_review` og ført separat fordi ingen koordinat ble godkjent. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo-tabellen inneholder nå 70 verifiserte eller kildekontrollerte canonical steder. Batch 12 omfatter sju fullførte kontroller: fem nye godkjente områdeankre og to ruteobjekter som står dokumentert som `needs_review` fordi dagens datamodell mangler traségeometri. Totalt står fire fullførte Oslo-kontroller separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo summary');

const lastVerified = '| 11 | `bjorvika` | Bjørvika | verified_geometry | `oslo-kommune:fjordbyen:bjorvika` |';
protocol = replaceRequired(protocol, lastVerified, lastVerified + '\n' + [
  '| 12 | `grunerlokka_helgesens_tm` | Grünerløkka – Helgesens / Thorvald Meyers | verified_geometry | `oslobyleksikon:thorvald-meyers-gate:helgesens-gate-corner` |',
  '| 12 | `toyen_torg` | Tøyen torg | verified_geometry | `oslo-kommune:byplan:toyen-torg` |',
  '| 12 | `majorstuen_krysset` | Majorstuen krysset | verified_geometry | `oslobyleksikon:valkyriegata:majorstukrysset` |',
  '| 12 | `st_hanshaugen_park` | St. Hanshaugen park | verified_geometry | `oslo-kommune:park:st-hanshaugen` |',
  '| 12 | `aker_brygge` | Aker Brygge | verified_geometry | `oslo-kommune:fjordbyen:aker-brygge` |'
].join('\n'), 'batch 12 verified rows');

protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 65 verifiserte eller kildekontrollerte canonical stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 70 verifiserte eller kildekontrollerte canonical stedene.');
const bankall = '| Bånkall gård | needs_review | Trondheimsveien 640 ga flere ikke-entydige Geonorge-treff uten én eksakt fysisk match. | Krever mer presis offisiell adresse eller objektgeometri før canonical koordinat kan godkjennes. |';
protocol = replaceRequired(protocol, bankall, bankall + '\n| `ring_3` – Ring 3 | needs_review | Offisiell rv. 150-identitet er dokumentert, men ett lavpresisjonspunkt kan ikke verifisere hele ringveitraseen. | Krever routeSegments/traségeometri eller flere kildebelagte ruteankre. |\n| `trikk_17_18` – Trikkelinje 17/18 | needs_review | Ruter dokumenterer begge linjene, men den kombinerte recorden har bare ett lavpresisjonspunkt og ingen kildebelagt traségeometri. | Krever rutegeometri eller eksplisitt modellert fellessegment før canonical koordinat kan godkjennes. |', 'needs review rows');

protocol = replaceRequired(protocol,
  '- Neste nye Oslo-kontroll er nummer 66 og starter batch 12.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 73 og starter batch 13.\n- Batch 12 er fullført med fem godkjente områdeankre og to dokumenterte ruteobjekter som krever egen rutemodell.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work');
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 12\n\nDato: ${DATE}\n\n## Resultat\n\nSju canonical Oslo-steder er kontrollert. Fem får full Coordinate Source Contract v1 som dokumenterte områdeankre. To lineære ruteobjekter beholdes som \`needs_review\` fordi dagens enkeltpunkt ikke kan verifisere hele traseen.\n\n| placeId | resultat | kilde |\n|---|---|---|\n| \`ring_3\` | needs_review / needs_geometry | Statens vegvesen – rv. 150 Ring 3 |\n| \`trikk_17_18\` | needs_review / needs_geometry | Ruter – trikkelinjer 17 og 18 |\n| \`grunerlokka_helgesens_tm\` | verified_geometry | Oslo byleksikon – Thorvald Meyers gate |\n| \`toyen_torg\` | verified_geometry | Oslo kommune – torg- og møteplassprogrammet |\n| \`majorstuen_krysset\` | verified_geometry | Oslo byleksikon – Valkyriegata / Majorstukrysset |\n| \`st_hanshaugen_park\` | verified_geometry | Oslo kommune – St. Hanshaugen |\n| \`aker_brygge\` | verified_geometry | Oslo kommune – Fjordbyen: Aker brygge |\n\n## Metodebeslutninger\n\n- Ring 3 og trikk 17/18 blir ikke kunstig «presisert» ved å legge til desimaler på gamle symbolpunkter. Begge trenger traségeometri eller flere kildebelagte routeSegments.\n- Kryss-, torg-, park- og områdeobjektene bruker eksplisitt \`semantic_anchor\` + \`area_anchor\`; punktet er representativt for det dokumenterte fysiske området og ikke et påstått matematisk sentrum.\n- Ingen av de fem godkjente stedene flyttes i denne batchen. Arbeidet oppgraderer kildekontrakten og dokumenterer hvorfor eksisterende punkt er et gyldig display-/områdeanker.\n\n## Kilder\n\n- Statens vegvesen – sykkelveger langs rv. 150 Ring 3: https://www.vegvesen.no/vegprosjekter/prosjekt/sykkelvegeroslo/\n- Ruter – trikkelinjer og linjekart: https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/trikk\n- Oslo byleksikon – Thorvald Meyers gate: https://oslobyleksikon.no/side/Thorvald_Meyers_gate\n- Oslo kommune – møteplasser/Tøyen torg: https://magasin.oslo.kommune.no/byplan/gode-ideer-gir-gode-moteplasser\n- Oslo byleksikon – Valkyriegata: https://oslobyleksikon.no/side/Valkyriegata\n- Oslo kommune – St. Hanshaugen: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/st-hanshaugen/\n- Oslo kommune – Aker brygge: https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/aker-brygge\n`);

console.log('Completed Oslo coordinate batch 12');
