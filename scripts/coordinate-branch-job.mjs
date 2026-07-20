import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

const placeId = 'klimahuset';
const placeName = 'Klimahuset';
const placePath = `data/places/vitenskap/oslo/places_vitenskap/${placeId}.json`;
const placeManifestPath = 'data/places/manifest.json';
const placeManifestEntry = `places/vitenskap/oslo/places_vitenskap/${placeId}.json`;
const evidencePath = `data/coordinate-evidence/oslo/vitenskap/${placeId}.json`;
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceManifestEntry = `oslo/vitenskap/${placeId}.json`;
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';

const coordinate = {
  lat: 59.919394833984754,
  lon: 10.772833068414897,
  r: 60,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:14797:12',
  address: {
    street: 'Monrads gate',
    number: '12',
    postcode: '0562',
    city: 'Oslo',
    country: 'NO',
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:14797:12',
  coordSourceUrl:
    'https://ws.geonorge.no/adresser/v1/sok?sok=Monrads%20gate%2012%20Oslo',
  coordType: 'address_point',
  coordVerifiedAt: '2026-07-20',
  coordNote:
    'Offisiell adressekoordinat fra Geonorge Adresser API for Monrads gate 12, OSLO. Punktet brukes som display- og unlock-marker for Klimahuset. Adressepunktet ligger om lag 13,2 meter fra den separat navngitte Klimahuset-geometrien OSM-way 762832690 og er kryssjekket som samme bygg; punktet representerer ikke hele Naturhistorisk museum eller Botanisk hage.',
};

const place = {
  id: placeId,
  name: placeName,
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: coordinate.r,
  category: 'vitenskap',
  primary_category: 'vitenskap',
  secondary_category: 'natur',
  hybrid: true,
  year: 2020,
  emne_ids: [
    'em_vit_kunnskap_formidling_utdanning',
    'em_vit_miljo_okologi_system',
    'em_vit_sannhet_maling_modeller',
  ],
  desc:
    'Eget utstillings- og kunnskapsbygg i Botanisk hage, åpnet i 2020 for forskningsbasert formidling av jordas klimasystem, global oppvarming, konsekvenser og mulige løsninger.',
  popupDesc:
    'Klimahuset er et eget utstillingsbygg ved Naturhistorisk museum i Botanisk hage. Huset stod ferdig i mars 2020 og åpnet for publikum 17. juni samme år. Det ble utviklet som en arena for forskning, utdanning og formidling, med særlig vekt på å gjøre klimakunnskap forståelig og relevant for unge. Utstillingene tar for seg hvordan jordas klimasystemer fungerer, konsekvenser av global oppvarming og ulike mulige løsninger, og bygget brukes også til dialog, debatter, foredrag og undervisning.\n\nSelve bygningen er en del av formidlingen. Klimahuset er et FutureBuilt-forbildeprosjekt og ble prosjektert med blant annet naturlig ventilasjon, tre i bærende konstruksjoner, lavkarbonbetong, kortreiste materialer, fossilfri byggeplass, solceller, fjernvarme og regnbed for overvann. Dermed kan stedet brukes til å undersøke forholdet mellom vitenskapelig kunnskap, klimaproblemer og konkrete teknologiske og arkitektoniske valg.\n\nI History Go behandles Klimahuset som et eget fysisk sted, selv om det institusjonelt er del av Naturhistorisk museum og ligger inne i Botanisk hage. Den eksakte markøren er Monrads gate 12. `naturhistorisk_museum` fortsetter å representere den bredere institusjonen, mens `botanisk_hage` representerer den større levende samlingen og hagearenaen. Klimahuset skal derfor ikke slås sammen med noen av dem eller splittes videre i separate markører for utstilling, amfi, Klimahage eller arkitektur.',
  quiz_profile: {
    place_type: 'klimavitenskapelig_utstillings_og_kunnskapsbygg',
    subtype: 'forskningsbasert_klimaformidling_i_lavutslippsbygg',
    signature_features: [
      'eget Klimahus åpnet for publikum i juni 2020',
      'forskningsbaserte utstillinger om klimasystemer, global oppvarming og løsninger',
      'del av Naturhistorisk museum, men fysisk eget bygg i Botanisk hage',
      'bygget selv brukes som konkret eksempel på klima- og miljøtiltak',
    ],
    primary_angles: [
      'klimasystem_og_global_oppvarming',
      'vitenskapsformidling',
      'evidens_modeller_og_usikkerhet',
      'klima_og_samfunn',
      'lavutslippsbygg_og_materialvalg',
      'utstilling_dialog_og_laering',
    ],
    question_families: [
      'institusjon_og_formidling',
      'naturvitenskapelig_forklaring',
      'evidens_og_modeller',
      'bygg_som_klimacase',
      'konsekvenser_og_losninger',
      'kontrast',
    ],
    avoid_angles: [
      'generisk_klimaquiz_uten_stedlig_kilde',
      'behandle_klimahuset_som_hele_naturhistorisk_museum',
      'behandle_klimahuset_som_hele_botanisk_hage',
      'gjette_lokale_artsfunn',
      'skille_arkitekturen_fra_klimaformidlingen_som_eget_sted',
    ],
    must_include: [
      'rollen som eget forskningsbasert klimautstillingsbygg',
      'åpningen i 2020',
      'forholdet til Naturhistorisk museum og Botanisk hage',
      'minst ett dokumentert bygg- eller materialgrep når arkitekturen brukes i spørsmål',
    ],
    contrast_targets: [
      'naturhistorisk_museum',
      'botanisk_hage',
      'meteorologisk_institutt',
      'teknisk_museum',
    ],
    notes:
      'Spør som et konkret vitenskaps- og formidlingssted. Eksterne institusjons-, klima- og arkitekturkilder skal drive synlig quizinnhold; canonical emner organiserer spørsmålene, men er ikke faktakilde.',
  },
  nature_profile: {
    type: 'klimasystem / miljøendring / menneskelig påvirkning / kunnskapsformidling',
    title: 'Klima som naturvitenskapelig system og menneskelig påvirkning',
    summary:
      'Natur-rundingen skal bruke dokumentert klimakunnskap og Klimahusets egne formidlingsgrep som anker. Den kan koble atmosfære, energi, karbon, økosystemer, global oppvarming og klimatilpasning, men skal ikke late som bygget er et vilt habitat eller fylle stedet med udokumenterte lokale artsobservasjoner.',
    themes: [
      'jordas klimasystem og energibalanse',
      'drivhuseffekt og global oppvarming',
      'klimaendringer og økologiske konsekvenser',
      'menneskelig påvirkning og utslippskilder',
      'overvann, materialbruk og energi som dokumenterte byggcase',
    ],
    nearby_place_ids: ['naturhistorisk_museum', 'botanisk_hage'],
  },
  locatorType: coordinate.locatorType,
  sourceProvider: coordinate.sourceProvider,
  sourceObjectId: coordinate.sourceObjectId,
  address: coordinate.address,
  geocodeAccuracy: coordinate.geocodeAccuracy,
  coordRole: coordinate.coordRole,
  coordStatus: coordinate.coordStatus,
  coordSource: coordinate.coordSource,
  coordSourceId: coordinate.coordSourceId,
  coordSourceUrl: coordinate.coordSourceUrl,
  coordType: coordinate.coordType,
  coordVerifiedAt: coordinate.coordVerifiedAt,
  coordNote: coordinate.coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'UiO / Naturhistorisk museum – Kronprinsen åpnet Klimahuset',
      url: 'https://kommunikasjon.ntb.no/pressemelding/17887418/kronprinsen-apnet-klimahuset?publisherId=14037540',
      lang: 'nb',
      verifiedAt: '2026-07-20',
    },
    {
      type: 'official',
      label: 'Oslo kommune – Klimahuset',
      url: 'https://www.oslo.kommune.no/radhuset/vielse-i-oslo-radhus/klimahuset/',
      lang: 'nb',
      verifiedAt: '2026-07-20',
    },
    {
      type: 'reference',
      label: 'Atelier Oslo – Climate House',
      url: 'https://atelieroslo.no/project/climate-house',
      lang: 'en',
      verifiedAt: '2026-07-20',
    },
    {
      type: 'reference',
      label: 'Oslo kommune Byplan – Klimahuset: Nullutslipp og arkitektur i tre',
      url: 'https://magasin.oslo.kommune.no/byplan/klimahuset---nullutslipp-og-arkitektur-i-tre',
      lang: 'nb',
      verifiedAt: '2026-07-20',
    },
  ],
};

const evidence = {
  placeId,
  placeFile: placePath,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: coordinate.lat,
    lon: coordinate.lon,
    r: coordinate.r,
    coordStatus: coordinate.coordStatus,
    coordSource: coordinate.coordSource,
    coordType: coordinate.coordType,
    coordNote: coordinate.coordNote,
  },
  identity: {
    currentName: placeName,
    resolvedIdentity:
      'The separately named Klimahuset exhibition and knowledge building at Monrads gate 12, institutionally part of Naturhistorisk museum and physically inside Botanisk hage',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for Monrads gate 12',
    'dokumentert identitet som separat navngitt Klimahuset-bygg',
    'fysisk kryssjekk mot navngitt bygningsgeometri',
    'eksplisitt skille fra brede canonical steder for Naturhistorisk museum og Botanisk hage',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: coordinate.coordSourceUrl,
      sourceObjectId: coordinate.sourceObjectId,
      sourceQuality:
        'official_address_plus_official_institution_identity_plus_named_building_geometry_qa',
      finding:
        'Geonorge gir ett tydelig adressetreff for Monrads gate 12. Oslo kommune oppgir samme adresse for Klimahuset, UiO/Naturhistorisk museum dokumenterer Klimahuset som eget utstillingsbygg, og adressepunktet ligger om lag 13,2 meter fra den separat navngitte OSM-bygningsgeometrien 762832690.',
      canVerifyCoordinate: true,
      reason: coordinate.coordNote,
    },
  ],
  addressCandidates: [
    {
      address: 'Monrads gate 12 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: coordinate.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: coordinate.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:762832690',
      canApplyToPlace: false,
      role: 'identity_and_visual_QA',
      approximateDistanceFromAppliedAddressPointM: 13.2,
    },
  ],
  coordinateCandidates: [
    {
      lat: coordinate.lat,
      lon: coordinate.lon,
      coordRole: coordinate.coordRole,
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction:
      'Applied Monrads gate 12 as the canonical building/display marker for Klimahuset after exact address-first verification and named-building geometry QA.',
  },
  notes: [coordinate.coordNote],
};

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

if (existsSync(placePath)) {
  throw new Error(`${placePath} already exists; refusing duplicate production.`);
}

writeJson(placePath, place);
writeJson(evidencePath, evidence);

const placeManifest = JSON.parse(readFileSync(placeManifestPath, 'utf8'));
if (!Array.isArray(placeManifest.files)) {
  throw new Error('data/places/manifest.json has no files array.');
}
if (!placeManifest.files.includes(placeManifestEntry)) {
  placeManifest.files.push(placeManifestEntry);
}
writeJson(placeManifestPath, placeManifest);

const evidenceManifest = JSON.parse(readFileSync(evidenceManifestPath, 'utf8'));
if (!Array.isArray(evidenceManifest.files)) {
  throw new Error('data/coordinate-evidence/manifest.json has no files array.');
}
if (!evidenceManifest.files.includes(evidenceManifestEntry)) {
  evidenceManifest.files.push(evidenceManifestEntry);
}
writeJson(evidenceManifestPath, evidenceManifest);

let protocol = readFileSync(protocolPath, 'utf8');
const tableEndMarker = '\n\nRelevante korrigerende merger';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) {
  throw new Error('Could not locate Oslo coordinate table end.');
}
const batchNumbers = [...protocol.slice(0, tableEnd).matchAll(/^\|\s*(\d+)\s*\|/gm)].map(
  (match) => Number(match[1]),
);
if (batchNumbers.length === 0) {
  throw new Error('Could not derive current Oslo coordinate batch number.');
}
const nextBatch = Math.max(...batchNumbers) + 1;

const summaryRegex =
  /Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./;
const summaryMatch = protocol.match(summaryRegex);
if (!summaryMatch) {
  throw new Error('Could not locate Oslo coordinate summary line.');
}
const previousCount = Number(summaryMatch[1]);
const unresolvedCount = Number(summaryMatch[2]);
const newCount = previousCount + 1;
protocol = protocol.replace(
  summaryRegex,
  `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Klimahuset som et eget klimavitenskapelig utstillings- og kunnskapsbygg på Monrads gate 12. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`,
);

const refreshedTableEnd = protocol.indexOf(tableEndMarker);
const tableRow = `| ${nextBatch} | \`${placeId}\` | ${placeName} | verified | \`${coordinate.sourceObjectId}\` |`;
protocol = `${protocol.slice(0, refreshedTableEnd)}\n${tableRow}${protocol.slice(refreshedTableEnd)}`;

const previousBatchParagraphRegex = /Batch 64 \(2026-07-20\)[^\n]*/;
if (!previousBatchParagraphRegex.test(protocol)) {
  throw new Error('Could not locate batch 64 paragraph insertion point.');
}
const newBatchParagraph = `Batch ${nextBatch} (2026-07-20) legger til \`${placeId}\` etter separat overlap-, adresse- og taxonomy-gate. Det entydige Geonorge-punktet \`${coordinate.sourceObjectId}\` for Monrads gate 12 brukes som display- og unlock-anker. Punktet ligger om lag 13,2 meter fra den separat navngitte Klimahuset-geometrien \`osm-way:762832690\`, som brukes som identitets- og visuell QA, ikke som erstatning for den normative adressekilden. Klimahuset beholdes som et fysisk eget \`vitenskap\`-sted med \`natur\` som sekundært faglag; \`naturhistorisk_museum\` representerer fortsatt den bredere institusjonen og \`botanisk_hage\` den større hage- og campusarenaen.`;
protocol = protocol.replace(
  previousBatchParagraphRegex,
  (match) => `${match}\n\n${newBatchParagraph}`,
);

protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`,
);

writeFileSync(protocolPath, protocol);

console.log(
  JSON.stringify(
    {
      placeId,
      placePath,
      evidencePath,
      previousCount,
      newCount,
      nextBatch,
      coordinateSource: coordinate.sourceObjectId,
    },
    null,
    2,
  ),
);
