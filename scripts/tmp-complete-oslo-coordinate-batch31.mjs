import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const today = '2026-07-19';
const aggregatePath = path.join(root, 'data/places/natur/oslo/places_oslo_alna.json');
const splitRoot = path.join(root, 'data/places/natur/oslo/places_oslo_alna');
const evidenceRoot = path.join(root, 'data/coordinate-evidence');
const evidenceManifestPath = path.join(evidenceRoot, 'manifest.json');
const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-31');

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const places = read(aggregatePath);
const byId = new Map(places.map((place) => [place.id, place]));
const required = [
  'alnaelva',
  'alnaelvstien',
  'loelva_historisk',
  'trosterud_friomrade',
  'furuset_haugerud_skogbelte',
  'hellerud_gard',
  'alnabru_jernbane_og_logistikk',
];
for (const id of required) if (!byId.has(id)) throw new Error(`Missing batch 31 place ${id}`);

function markNeedsSource(place, { locatorType, sourceObjectId, sourceUrl, coordSource, note }) {
  place.locatorType = locatorType;
  place.sourceProvider = 'manual_research';
  place.sourceObjectId = sourceObjectId;
  place.geocodeAccuracy = 'unknown';
  place.coordRole = locatorType === 'route' ? 'line_anchor' : 'display_marker';
  place.coordType = 'legacy_unverified';
  place.coordStatus = 'needs_source';
  place.coordSource = coordSource;
  place.coordSourceId = sourceObjectId;
  place.coordSourceUrl = sourceUrl;
  place.coordVerifiedAt = today;
  place.coordNote = note;
}

const alna = byId.get('alnaelva');
markNeedsSource(alna, {
  locatorType: 'route',
  sourceObjectId: 'snl:alna-elv-oslo',
  sourceUrl: 'https://snl.no/Alna_(elv_i_Oslo)',
  coordSource: 'river_route_geometry_unresolved',
  note: 'Alna er dokumentert som et langt vassdrag fra Alnsjøen gjennom Groruddalen mot fjorden. OSM-søket finner flere separate elve-way-er, inkludert tunnellagte deler, men ingen samlet entydig river-relation som kan verifisere ett canonical punkt for hele elva. Eksisterende lat/lon beholdes kun som legacy representasjonsanker; recorden må modelleres med kildebelagt rute-/elvegeometri eller flere verifiserte delankre før koordinaten kan godkjennes.',
});

const alnastien = byId.get('alnaelvstien');
markNeedsSource(alnastien, {
  locatorType: 'route',
  sourceObjectId: 'oslo-kommune:turvei-langs-alnaelva',
  sourceUrl: 'https://aktuelt.oslo.kommune.no/rehabilitering-av-hengebrua-i-svartdalsparken',
  coordSource: 'trail_route_geometry_unresolved',
  note: 'Oslo kommune dokumenterer turvei langs Alnaelva, mens OSM har flere separate ways med navnet Alnastien og ingen samlet entydig ruterelasjon i kontrollen. Ett legacy-punkt kan derfor ikke verifisere hele stien. Eksisterende lat/lon beholdes kun som uverifisert representasjonsanker til routeSegments eller en samlet kildebelagt rutetrase er modellert.',
});

const loelva = byId.get('loelva_historisk');
loelva.name = 'Loelva – historisk navn på Alna';
loelva.desc = 'Historisk navn på Alnaelva, ikke et eget separat vassdrag. Recorden beholdes som historisk navne- og landskapsreferanse til Alna.';
loelva.popupDesc = 'Loelva er et historisk navn som har vært brukt om Alna. Kildene identifiserer derfor ikke Loelva som et separat fysisk vassdrag som kan få sin egen selvstendige canonical koordinat. History Go-recorden beholdes foreløpig som historisk navne- og landskapsreferanse, men det gamle punktet er ikke godkjent som en egen elvelokasjon.';
markNeedsSource(loelva, {
  locatorType: 'historical_alias',
  sourceObjectId: 'snl:alna:loelva-alias',
  sourceUrl: 'https://snl.no/Alna_(elv_i_Oslo)',
  coordSource: 'historical_alias_no_separate_geometry',
  note: 'Store norske leksikon og OSM-data identifiserer Loelva som alternativt/historisk navn på Alna, ikke som et separat vassdrag. Eksisterende punkt kan derfor ikke godkjennes som egen fysisk Loelva-koordinat. Recorden bør senere modelleres som historisk alias/relation til `alnaelva` fremfor som et selvstendig fysisk sted.',
});

const trosterud = byId.get('trosterud_friomrade');
markNeedsSource(trosterud, {
  locatorType: 'area',
  sourceObjectId: 'oslo-kommune:trosterud-haugerud-planprogram',
  sourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/planprogram-for-trosterud-og-haugerud',
  coordSource: 'named_area_identity_unresolved',
  note: 'Kommunale planer dokumenterer grøntområder, parker og forbindelser på Trosterud og Haugerud, men kontrollen fant ikke et stabilt offisielt eller eksakt OSM-objekt med navnet «Trosterud friområde». Det eksisterende punktet beholdes kun som legacy inntil recorden kan kobles til et konkret navngitt friområde eller avgrenset arealobjekt.',
});

const skogbelte = byId.get('furuset_haugerud_skogbelte');
markNeedsSource(skogbelte, {
  locatorType: 'area',
  sourceObjectId: 'oslo-kommune:alna-grontdrag-unresolved',
  sourceUrl: 'https://www.oslo.kommune.no/fag-og-utviklingsprosjekter/omradesatsingenes-prosjekter/omradeloft-trosterud-og-haugerud-2017-2026/',
  coordSource: 'named_area_identity_unresolved',
  note: 'Kontrollen fant ikke et stabilt offisielt eller eksakt OSM-objekt med navnet «Furuset–Haugerud skogbelte». Navnet beskriver et bredt grønt overgangsområde, og ett legacy-punkt kan ikke verifisere utstrekningen. Recorden må kobles til dokumentert grøntdrag-/skoggeometri eller erstattes med et konkret navngitt naturområde før koordinaten kan godkjennes.',
});

const hellerud = byId.get('hellerud_gard');
hellerud.desc = 'Historisk gårdsnavn knyttet til Hellerud-området. Den eksisterende recorden har en uløst identitetskonflikt og er ikke sikkert koblet til ett bestemt bevart gårdsanlegg.';
hellerud.popupDesc = 'Hellerud-navnet er knyttet til flere historiske gårdsbruk. Oslo byleksikon beskriver Øvre og Nedre Hellerud i området, mens den bevarte gården på Haugerudtunet 1 er Østre Haugerud gård – et annet gårdsnavn. Den eksisterende History Go-recorden hevdet et bevart Hellerud-gårdsanlegg, men kontrollen kan ikke dokumentere hvilket fysisk anlegg dette skulle være. Punktet beholdes derfor bare som legacy inntil riktig gård og fysisk identitet er avklart.';
markNeedsSource(hellerud, {
  locatorType: 'historic_site',
  sourceObjectId: 'oslobyleksikon:hellerud-nordre:identity-conflict',
  sourceUrl: 'https://oslobyleksikon.no/side/Hellerud%2C_Nordre',
  coordSource: 'farm_identity_unresolved',
  note: 'Recorden har en dokumentert identitetskonflikt. Nordre Hellerud omfatter historisk Øvre og Nedre Hellerud, mens det entydige Geonorge-punktet Haugerudtunet 1 gjelder den separate Østre Haugerud gård og kan ikke brukes som erstatning. Eksisterende lat/lon beholdes kun som legacy til riktig Hellerud-gård og fysisk hovedanker er identifisert.',
});

const alnabru = byId.get('alnabru_jernbane_og_logistikk');
alnabru.name = 'Alnabru godsterminal';
alnabru.lat = 59.9336032;
alnabru.lon = 10.8382823;
alnabru.r = 350;
alnabru.desc = 'Norges største godsterminal for jernbane og et nasjonalt knutepunkt for intermodal godstransport i Groruddalen.';
alnabru.popupDesc = 'Alnabru godsterminal er navet i norsk godstransport på jernbane. Bane NOR beskriver terminalen som Nordens største jernbanegodsterminal, med laste- og lossespor, hensettingsspor, gjennomkjøringsspor og store arealer for containere og semihengere. Markøren er flyttet fra et generelt punkt vest for terminalen til representasjonspunktet for den konkrete, navngitte OSM-terminalpolygonen.';
alnabru.locatorType = 'industrial_area';
alnabru.sourceProvider = 'osm';
alnabru.sourceObjectId = 'osm-way:84268939';
alnabru.geocodeAccuracy = 'geometric_center';
alnabru.coordRole = 'area_anchor';
alnabru.coordType = 'rail_terminal_area';
alnabru.coordStatus = 'verified_geometry';
alnabru.coordSource = 'OpenStreetMap way 84268939 – Alnabruterminalen';
alnabru.coordSourceId = 'osm-way:84268939';
alnabru.coordSourceUrl = 'https://www.openstreetmap.org/way/84268939';
alnabru.coordVerifiedAt = today;
alnabru.coordNote = 'Eksakt navngitt OSM-polygon for Alnabruterminalen, way 84268939, koblet til Wikidata Q76079 og kryssjekket mot Bane NORs offisielle beskrivelse av Alnabru godsterminal. Polygonens representasjonspunkt brukes som area_anchor for terminalområdet; dette er ikke et tilfeldig adresse- eller nabolagspunkt.';

write(aggregatePath, places);

const evidenceManifest = read(evidenceManifestPath);
const evidenceSpecs = [];

function addNeedsEvidence(place, rel, identity, problem, requiredEvidence, evidence, nextAction) {
  evidenceSpecs.push({
    rel,
    data: {
      schemaVersion: '1.0',
      placeId: place.id,
      placeFile: 'data/places/natur/oslo/places_oslo_alna.json',
      evidenceStatus: 'needs_research',
      coordinateDecision: 'needs_address_source',
      currentCoordinate: {
        lat: place.lat, lon: place.lon, r: place.r,
        coordStatus: place.coordStatus,
        coordSource: place.coordSource,
        coordType: place.coordType,
        coordNote: place.coordNote,
      },
      identity: {
        currentName: place.name,
        resolvedIdentity: identity,
        identityStatus: problem ? 'conflict' : 'resolved',
        identityProblem: problem,
        locatorTypeCandidate: place.locatorType,
        requiresSplit: false,
        splitReason: '',
      },
      requiredEvidence,
      evidence,
      addressCandidates: [],
      sourceObjectCandidates: evidence.map((entry) => ({
        sourceProvider: entry.sourceProvider,
        sourceObjectId: entry.sourceObjectId,
        canApplyToPlace: false,
      })),
      geometryCandidates: [],
      coordinateCandidates: [],
      decision: {
        canBecomeVerified: false,
        blockedReason: place.coordNote,
        nextAction,
      },
      notes: [place.coordNote],
    },
  });
}

addNeedsEvidence(
  alna,
  'oslo/natur/alnaelva.json',
  'Alnaelva / Alna som sammenhengende vassdrag fra Alnsjøen gjennom Groruddalen',
  '',
  ['samlet kildebelagt elvegeometri eller flere verifiserte delankre'],
  [
    {
      sourceProvider: 'manual_research', sourceName: 'Store norske leksikon – Alna',
      sourceUrl: 'https://snl.no/Alna_(elv_i_Oslo)', sourceObjectId: 'snl:alna-elv-oslo',
      sourceQuality: 'documented_river_identity', finding: 'Kilden dokumenterer Alna som et langt vassdrag gjennom Oslo.',
      canVerifyCoordinate: false, reason: 'Identitet og forløp dokumenteres, men kilden gir ikke ett canonical punkt for hele elva.',
    },
    {
      sourceProvider: 'osm', sourceName: 'OpenStreetMap – separate Alna waterway ways',
      sourceUrl: 'https://www.openstreetmap.org/search?query=Alna%20Oslo', sourceObjectId: 'osm:alna-multiple-waterway-ways',
      sourceQuality: 'fragmented_river_geometry', finding: 'Kontrollen fant flere separate elve-way-er, blant annet tunnellagte deler med alt_name=Loelva.',
      canVerifyCoordinate: false, reason: 'Ingen samlet entydig river-relation ble identifisert i kontrollen.',
    },
  ],
  'Modeller samlet elvegeometri eller verifiser flere routeSegments før hovedpunktet kan godkjennes.',
);

addNeedsEvidence(
  alnastien,
  'oslo/natur/alnaelvstien.json',
  'Turvei langs Alnaelva, med flere OSM-segmenter navngitt Alnastien',
  '',
  ['samlet offisiell rutetrase eller eksplisitte verifiserte routeSegments'],
  [
    {
      sourceProvider: 'municipality', sourceName: 'Oslo kommune – turvei langs Alnaelva',
      sourceUrl: 'https://aktuelt.oslo.kommune.no/rehabilitering-av-hengebrua-i-svartdalsparken', sourceObjectId: 'oslo-kommune:turvei-langs-alnaelva',
      sourceQuality: 'official_route_identity', finding: 'Oslo kommune dokumenterer turveien langs Alnaelva og konkrete deler gjennom Svartdalsparken.',
      canVerifyCoordinate: false, reason: 'Kilden dokumenterer ruten som lineært system, ikke ett canonical punkt.',
    },
    {
      sourceProvider: 'osm', sourceName: 'OpenStreetMap – Alnastien-segmenter',
      sourceUrl: 'https://www.openstreetmap.org/search?query=Alnastien%20Oslo', sourceObjectId: 'osm:alnastien-multiple-ways',
      sourceQuality: 'fragmented_trail_geometry', finding: 'Nominatim finner flere separate ways med navnet Alnastien.',
      canVerifyCoordinate: false, reason: 'Ingen samlet ruterelasjon ble identifisert; ett av segmentene kan ikke velges som hele stiens hovedpunkt.',
    },
  ],
  'Bygg routeSegments eller finn samlet offisiell/OSM-ruterelasjon før canonical koordinat godkjennes.',
);

addNeedsEvidence(
  loelva,
  'oslo/natur/loelva_historisk.json',
  'Loelva som historisk/alternativt navn på Alna',
  'Recorden representerer ikke et separat fysisk vassdrag og bør senere modelleres som alias/relation til alnaelva.',
  ['alias-/relationsmodell til alnaelva i stedet for separat koordinat'],
  [
    {
      sourceProvider: 'manual_research', sourceName: 'Store norske leksikon – Alna',
      sourceUrl: 'https://snl.no/Alna_(elv_i_Oslo)', sourceObjectId: 'snl:alna:loelva-alias',
      sourceQuality: 'documented_historical_name', finding: 'Loelva er dokumentert som tidligere/alternativt navn på Alna.',
      canVerifyCoordinate: false, reason: 'Et historisk alias gir ikke grunnlag for et separat fysisk canonical punkt.',
    },
  ],
  'Migrer recorden til historisk alias/relation til alnaelva eller definer en eksplisitt historisk delstrekning med kilde.',
);

addNeedsEvidence(
  trosterud,
  'oslo/natur/trosterud_friomrade.json',
  'Uavklart grøntområde på Trosterud',
  'Eksakt fysisk entitet med navnet «Trosterud friområde» er ikke dokumentert.',
  ['offisiell navngitt arealgeometri eller annet stabilt fysisk objekt'],
  [
    {
      sourceProvider: 'municipality', sourceName: 'Oslo kommune – Planprogram for Trosterud og Haugerud',
      sourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/planprogram-for-trosterud-og-haugerud', sourceObjectId: 'oslo-kommune:trosterud-haugerud-planprogram',
      sourceQuality: 'official_area_planning_context', finding: 'Planprogrammet dokumenterer offentlige rom, parker og forbindelser i området, men ikke ett areal med recordens eksakte navn.',
      canVerifyCoordinate: false, reason: 'Områdekontekst er ikke nok til å velge et konkret friområdepunkt.',
    },
  ],
  'Identifiser konkret navngitt friområde eller erstatt recorden med et dokumentert fysisk områdeobjekt.',
);

addNeedsEvidence(
  skogbelte,
  'oslo/natur/furuset_haugerud_skogbelte.json',
  'Beskrivende skog-/grøntdrag mellom byområder i Alna',
  'Eksakt avgrenset fysisk entitet med recordens navn er ikke dokumentert.',
  ['offisiell grøntdrag-/skoggeometri med eksplisitt avgrensning'],
  [
    {
      sourceProvider: 'municipality', sourceName: 'Oslo kommune – Områdeløft Trosterud og Haugerud',
      sourceUrl: 'https://www.oslo.kommune.no/fag-og-utviklingsprosjekter/omradesatsingenes-prosjekter/omradeloft-trosterud-og-haugerud-2017-2026/', sourceObjectId: 'oslo-kommune:alna-grontdrag-unresolved',
      sourceQuality: 'official_area_context', finding: 'Kommunen dokumenterer grønt- og byutviklingskonteksten, men ikke et stabilt navngitt objekt kalt Furuset–Haugerud skogbelte.',
      canVerifyCoordinate: false, reason: 'Et bredt beskrivende landskapsbelte kan ikke verifiseres med ett punkt uten avgrensning.',
    },
  ],
  'Finn en eksplisitt plan-/naturgeometri eller erstatt med konkrete navngitte naturområder.',
);

addNeedsEvidence(
  hellerud,
  'oslo/natur/hellerud_gard.json',
  'Historiske Hellerud-gårdsbruk med uavklart hvilken gård denne recorden skal representere',
  'Recorden hevdet et bevart gårdsanlegg, men Hellerud-navnet dekker flere historiske bruk; Haugerudtunet 1 er separat Haugerud gård og kan ikke brukes som automatisk erstatning.',
  ['entydig gårdsidentitet og dokumentert fysisk hovedanker'],
  [
    {
      sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Hellerud, Nordre',
      sourceUrl: 'https://oslobyleksikon.no/side/Hellerud%2C_Nordre', sourceObjectId: 'oslobyleksikon:hellerud-nordre',
      sourceQuality: 'documented_farm_identity_conflict', finding: 'Nordre Hellerud ble delt i Øvre og Nedre Hellerud; recordens generiske «Hellerud gård» identifiserer ikke hvilket bruk som menes.',
      canVerifyCoordinate: false, reason: 'Flere historiske gårdsidentiteter gjør ett punkt tvetydig.',
    },
    {
      sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Haugerudtunet 1',
      sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Haugerudtunet%201%20Oslo', sourceObjectId: 'geonorge-adresser-v1:0301:21388:1',
      sourceQuality: 'rejected_nearby_identity_candidate', finding: 'Haugerudtunet 1 gir ett entydig adressepunkt, men kilden identifiserer stedet som Østre Haugerud gård – en separat gård.',
      canVerifyCoordinate: false, reason: 'Et entydig punkt for feil gårdsidentitet skal ikke brukes som erstatning.',
    },
  ],
  'Avklar hvilken historisk Hellerud-gård recorden skal representere og dokumenter fysisk hovedanker før koordinaten godkjennes.',
);

evidenceSpecs.push({
  rel: 'oslo/natur/alnabru_jernbane_og_logistikk.json',
  data: {
    schemaVersion: '1.0',
    placeId: alnabru.id,
    placeFile: 'data/places/natur/oslo/places_oslo_alna.json',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat: alnabru.lat, lon: alnabru.lon, r: alnabru.r,
      coordStatus: alnabru.coordStatus,
      coordSource: alnabru.coordSource,
      coordType: alnabru.coordType,
      coordNote: alnabru.coordNote,
    },
    identity: {
      currentName: alnabru.name,
      resolvedIdentity: 'Alnabru godsterminal / Alnabruterminalen',
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'industrial_area',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: ['offisiell terminalidentitet', 'eksakt terminalgeometri'],
    evidence: [
      {
        sourceProvider: 'official_institution', sourceName: 'Bane NOR – Alnabru godsterminal',
        sourceUrl: 'https://www.banenor.no/for-deg-i-bransjen/godstransport/terminaler/alnabru/', sourceObjectId: 'banenor:alnabru-godsterminal',
        sourceQuality: 'official_terminal_identity', finding: 'Bane NOR dokumenterer Alnabru som den sentrale store godsterminalen og beskriver terminalområdets funksjoner.',
        canVerifyCoordinate: false, reason: 'Offisiell identitet kryssjekker objektet, mens koordinaten hentes fra den eksakte kartlagte terminalpolygonen.',
      },
      {
        sourceProvider: 'osm', sourceName: 'OpenStreetMap way 84268939 – Alnabruterminalen',
        sourceUrl: 'https://www.openstreetmap.org/way/84268939', sourceObjectId: 'osm-way:84268939',
        sourceQuality: 'exact_named_terminal_polygon', finding: 'Eksakt navngitt landuse=railway-polygon for Alnabruterminalen, koblet til Wikidata Q76079.',
        canVerifyCoordinate: true, reason: 'Polygonen representerer selve terminalområdet; geometrisk representasjonspunkt brukes som area_anchor.',
      },
    ],
    addressCandidates: [
      {
        sourceProvider: 'official_address', sourceObjectId: 'geonorge-adresser-v1:0301:10090:27', canApplyToPlace: false,
      },
    ],
    sourceObjectCandidates: [
      { sourceProvider: 'official_institution', sourceObjectId: 'banenor:alnabru-godsterminal', canApplyToPlace: false },
      { sourceProvider: 'osm', sourceObjectId: 'osm-way:84268939', canApplyToPlace: true },
    ],
    geometryCandidates: [
      { sourceProvider: 'osm', sourceObjectId: 'osm-way:84268939', lat: alnabru.lat, lon: alnabru.lon, canApplyToPlace: true },
    ],
    coordinateCandidates: [
      { lat: alnabru.lat, lon: alnabru.lon, coordRole: 'area_anchor', canApplyToPlace: true },
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Verified terminal geometry is applied to canonical place data and must pass map QA before merge.',
    },
    notes: [alnabru.coordNote],
  },
});

for (const spec of evidenceSpecs) {
  write(path.join(evidenceRoot, spec.rel), spec.data);
  if (!evidenceManifest.files.includes(spec.rel)) evidenceManifest.files.push(spec.rel);
}
write(evidenceManifestPath, evidenceManifest);

let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol.replace(
  'Oslo-tabellen inneholder nå 150 verifiserte eller kildekontrollerte canonical steder. Batch 30 avslutter de to siste ukontrollerte recordene i Oslo-litteraturmanifestet med verified_geometry for Oskar Braaten-bysten ved Beierbrua og Alexander Kiellands plass. Antallet fullførte kontroller uten godkjent Oslo-koordinat er fortsatt 34.',
  'Oslo-tabellen inneholder nå 151 verifiserte eller kildekontrollerte canonical steder. Batch 31 kontrollerer de sju recordene i Alna-naturkilden: Alnabru godsterminal får verified_geometry på eksakt terminalpolygon, mens seks brede, fragmenterte eller identitetsmessig uavklarte records avsluttes som needs_review. Antallet fullførte kontroller uten godkjent Oslo-koordinat er nå 40.',
);
const verifiedAnchor = '| 30 | `alexander_kiellands_plass` | Alexander Kiellands plass | verified_geometry | `osm-way:3610607` |';
if (!protocol.includes('| 31 | `alnabru_jernbane_og_logistikk`')) {
  protocol = protocol.replace(
    verifiedAnchor,
    `${verifiedAnchor}\n| 31 | \`alnabru_jernbane_og_logistikk\` | Alnabru godsterminal | verified_geometry | \`osm-way:84268939\` |`,
  );
}
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 150 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 151 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
);
const reviewHeader = '| kandidat | status | dokumentert konflikt | oppfølging |\n|---|---|---|---|';
const reviewRows = [
  '| `alnaelva` – Alnaelva | needs_review | Elva er et langt og delvis tunnellagt vassdrag. OSM-kontrollen finner flere separate elve-way-er, men ingen samlet entydig geometri som kan verifisere ett hovedpunkt. | Modeller samlet elvegeometri eller flere kildebelagte delankre; legacy-punktet skal ikke promoteres. |',
  '| `alnaelvstien` – Alnaelvstien / Alnastien | needs_review | Oslo kommune dokumenterer turveien langs Alnaelva, men OSM har flere separate Alnastien-way-er og ingen samlet ruterelasjon i kontrollen. | Bygg routeSegments eller finn samlet offisiell rutetrase før canonical punkt godkjennes. |',
  '| `loelva_historisk` – Loelva, historisk navn på Alna | needs_review | Loelva er dokumentert som historisk/alternativt navn på Alna og er ikke et separat fysisk vassdrag. | Modeller som historisk alias/relation til `alnaelva`, eller dokumenter en eksplisitt historisk delstrekning. |',
  '| `trosterud_friomrade` – Trosterud friområde | needs_review | Kontrollen fant ingen stabil offisiell eller eksakt OSM-entitet med recordens navn; kommunale planer dokumenterer bare bredere grønt- og byutviklingskontekst. | Identifiser konkret navngitt friområde eller erstatt recorden med dokumentert arealobjekt. |',
  '| `furuset_haugerud_skogbelte` – Furuset–Haugerud skogbelte | needs_review | Navnet beskriver et bredt grønt overgangsområde, men ingen eksplisitt avgrenset offisiell eller eksakt OSM-geometri ble dokumentert. | Finn plan-/naturgeometri med eksplisitt avgrensning eller erstatt med konkrete navngitte naturområder. |',
  '| `hellerud_gard` – Hellerud gård | needs_review | Hellerud-navnet dekker flere historiske gårdsbruk. Det entydige Haugerudtunet 1 gjelder separate Østre Haugerud gård og kan ikke brukes som automatisk erstatning for den uklare Hellerud-recorden. | Avklar hvilken Hellerud-gård recorden representerer og dokumenter fysisk hovedanker før koordinaten godkjennes. |',
];
if (!protocol.includes('`alnaelva` – Alnaelva')) {
  protocol = protocol.replace(reviewHeader, `${reviewHeader}\n${reviewRows.join('\n')}`);
}
if (!protocol.includes('151 verifiserte eller kildekontrollerte canonical steder')) {
  throw new Error('Protocol count was not updated to 151');
}
fs.writeFileSync(protocolPath, protocol);

const oldAlnabru = { lat: 59.936, lon: 10.814 };
const rad = (value) => value * Math.PI / 180;
function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

write(path.join(reportDir, 'applied-summary.json'), {
  generatedAt: new Date().toISOString(),
  result: { verified_geometry: 1, needs_review: 6 },
  verified: {
    alnabru_jernbane_og_logistikk: {
      name: alnabru.name,
      lat: alnabru.lat,
      lon: alnabru.lon,
      sourceObjectId: alnabru.sourceObjectId,
      movedMeters: Math.round(distanceMeters(oldAlnabru, alnabru)),
    },
  },
  needsReview: [
    'alnaelva', 'alnaelvstien', 'loelva_historisk',
    'trosterud_friomrade', 'furuset_haugerud_skogbelte', 'hellerud_gard',
  ],
});

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo coordinate control batch 31\n\nDato: ${today}\n\nBatch 31 kontrollerer de sju aktive recordene i \`data/places/natur/oslo/places_oslo_alna.json\`.\n\n## Resultat\n\n- \`alnabru_jernbane_og_logistikk\` → **verified_geometry** på eksakt OSM terminalpolygon \`way 84268939\`, kryssjekket mot Bane NOR. Visningsnavnet korrigeres til **Alnabru godsterminal**.\n- \`alnaelva\` → **needs_review**: langt og fragmentert elveobjekt uten ett legitimt hovedpunkt.\n- \`alnaelvstien\` → **needs_review**: flere separate Alnastien-segmenter uten samlet ruterelasjon.\n- \`loelva_historisk\` → **needs_review**: historisk alias for Alna, ikke separat fysisk vassdrag.\n- \`trosterud_friomrade\` → **needs_review**: ingen stabil navngitt fysisk entitet dokumentert.\n- \`furuset_haugerud_skogbelte\` → **needs_review**: bred beskrivende grøntdrag-identitet uten avgrenset geometri.\n- \`hellerud_gard\` → **needs_review**: flere Hellerud-gårdsidentiteter; Haugerudtunet 1 gjelder en separat Haugerud-gård og brukes ikke som proxy.\n\nIngen av de seks avviste recordene får nytt proxy-punkt. Bare Alnabru-markøren flyttes fysisk i denne batchen, og den skal gjennom visuell kart-QA før merge.\n`);

console.log('Batch 31 application prepared: 1 verified_geometry, 6 needs_review.');
