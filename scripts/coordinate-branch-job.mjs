import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const VERIFIED_AT = '2026-07-20';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected text not found`);
  if (text.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: expected exactly one match`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}

const sharedEmner = [
  'em_his_spor_materialitet',
  'em_his_historiske_lag_i_byrom',
  'em_his_kulturminner_bevaring',
  'em_his_samtid_ettertid_fortelling'
];

const places = [
  {
    file: 'data/places/historie/oslo/places_historie/norsk_folkemuseum.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/norsk_folkemuseum.json',
    evidenceManifestEntry: 'oslo/historie/norsk_folkemuseum.json',
    manifestEntry: 'places/historie/oslo/places_historie/norsk_folkemuseum.json',
    record: {
      id: 'norsk_folkemuseum',
      name: 'Norsk Folkemuseum',
      lat: 59.90748291814004,
      lon: 10.686716088479649,
      r: 60,
      category: 'historie',
      year: 1894,
      desc: 'Nasjonalt kulturhistorisk museum på Bygdøy og et av Europas største og eldste friluftsmuseer, grunnlagt i 1894 og etablert på Bygdøy fra 1898.',
      popupDesc: 'Norsk Folkemuseum ble grunnlagt i 1894 på initiativ fra Hans Aall og fikk et permanent museumsområde på Bygdøy i 1898. Museet skulle samle og formidle hvordan mennesker i Norge hadde levd, arbeidet og formet hverdagen sin, og utviklet seg til et omfattende kulturhistorisk museum med bygninger, gjenstander, fotografier og arkiver fra hele landet.\n\nFriluftsmuseet viser både by- og bygdemiljøer og dekker hverdagsliv fra 1500-tallet og fram til vår tid. Kong Oscar IIs Samling og Gol stavkirke er blant de mest kjente delene av området. I History Go er Norsk Folkemuseum et eget museumssted og ikke en erstatning for `gol_stavkirke_bygdoy`: stavkirken er ett konkret historisk objekt inne i et langt større museumslandskap.',
      emne_ids: sharedEmner,
      quiz_profile: {
        place_type: 'museum',
        subtype: 'nasjonalt_kulturhistorisk_friluftsmuseum',
        signature_features: [
          'grunnlagt i 1894 på initiativ fra Hans Aall',
          'permanent museumsområde på Bygdøy fra 1898',
          'et av Europas største og eldste friluftsmuseer',
          'viser hverdagsliv i Norge fra 1500-tallet til i dag',
          'Gol stavkirke og Kong Oscar IIs Samling inngår i museumsområdet'
        ],
        primary_angles: ['museumshistorie', 'hverdagsliv', 'kulturarv', 'historiske_bygninger', 'nasjonal_identitet'],
        question_families: ['historisk_endring', 'institusjonshistorie', 'hverdagsliv', 'kulturarv', 'kontrast'],
        avoid_angles: ['generisk_friluftsmuseum', 'behandle_gol_stavkirke_som_hele_museet'],
        must_include: [
          'grunnleggelsen i 1894 og etableringen på Bygdøy',
          'rollen som museum for dagligliv og kulturhistorie',
          'at Gol stavkirke er ett separat fysisk objekt inne i museumsområdet'
        ],
        contrast_targets: ['gol_stavkirke_bygdoy', 'frammuseet', 'kon_tiki_museet'],
        notes: 'Spør stedet som et stort kulturhistorisk museumslandskap. Ikke reduser hele Norsk Folkemuseum til Gol stavkirke, som fortsatt skal være en separat canonical place.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:14899:10',
      address: { street: 'Museumsveien', number: '10', postcode: '0287', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:14899:10',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Museumsveien%2010%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Museumsveien 10, OSLO. Punktet er representasjonspunktet for museets offisielle besøksadresse og brukes som display-marker for Norsk Folkemuseum, ikke som koordinat for Gol stavkirke eller hvert enkelt objekt i friluftsmuseet.',
      externalLinks: [
        { type: 'official', label: 'Norsk Folkemuseum – om museet', url: 'https://norskfolkemuseum.no/om-norsk-folkemuseum', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Norsk Folkemuseums historie', url: 'https://norskfolkemuseum.no/norsk-folkemuseums-historie', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    },
    identity: 'Norsk Folkemuseum, museumsinstitusjonen og besøksstedet i Museumsveien 10 på Bygdøy',
    overlapNote: 'Egen museumsmarkør er fysisk og semantisk separat fra `gol_stavkirke_bygdoy`, som representerer ett konkret bygg inne i museumsområdet.'
  },
  {
    file: 'data/places/historie/oslo/places_historie/norsk_maritimt_museum.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/norsk_maritimt_museum.json',
    evidenceManifestEntry: 'oslo/historie/norsk_maritimt_museum.json',
    manifestEntry: 'places/historie/oslo/places_historie/norsk_maritimt_museum.json',
    record: {
      id: 'norsk_maritimt_museum',
      name: 'Norsk Maritimt Museum',
      lat: 59.90287004478952,
      lon: 10.698052152795242,
      r: 60,
      category: 'historie',
      year: 1914,
      desc: 'Nasjonalt museum for norsk maritim kulturarv, grunnlagt i 1914 og i dag et eget museumsanlegg på Bygdøynes ved siden av Fram- og Kon-Tiki-museene.',
      popupDesc: 'Norsk Maritimt Museum ble grunnlagt i 1914, og de første samlingene kom fra jubileumsutstillingen i Kristiania samme år. Museet forvalter og formidler norsk maritim kulturarv gjennom sjøfart, båter, maritime næringer, arkeologi og historiske fartøy.\n\nMuseumsanlegget på Bygdøynes fikk sitt første byggetrinn i 1958. Arkitektene Trond Eliassen og Birger Lambertz-Nilssen utviklet anlegget videre i flere etapper, og tegl, kobber og tre ble brukt for å knytte moderne museumsarkitektur til det maritime landskapet. I History Go skal Norsk Maritimt Museum behandles som et selvstendig besøkssted, ikke slås sammen med de nærliggende, men separate `frammuseet` og `kon_tiki_museet`.',
      emne_ids: sharedEmner,
      quiz_profile: {
        place_type: 'museum',
        subtype: 'nasjonalt_maritimt_kulturhistorisk_museum',
        signature_features: [
          'grunnlagt i 1914 med samlinger fra jubileumsutstillingen i Kristiania',
          'nasjonalt ansvar for norsk maritim kulturarv',
          'eget museumsanlegg på Bygdøynes',
          'første byggetrinn på Bygdøynes stod ferdig i 1958',
          'arkitektur av Trond Eliassen og Birger Lambertz-Nilssen'
        ],
        primary_angles: ['maritim_historie', 'museumshistorie', 'sjoefart', 'arkitektur', 'kulturarv'],
        question_families: ['historisk_endring', 'institusjonshistorie', 'maritim_kultur', 'arkitektur', 'kontrast'],
        avoid_angles: ['generisk_sjofartsmuseum', 'slå_sammen_med_fram_eller_kon_tiki'],
        must_include: [
          'grunnleggelsen i 1914',
          'rollen som nasjonalt museum for maritim kulturarv',
          'det selvstendige museumsanlegget på Bygdøynes'
        ],
        contrast_targets: ['frammuseet', 'kon_tiki_museet', 'norsk_folkemuseum'],
        notes: 'Spør stedet gjennom norsk maritim kulturarv og museumsanleggets egen historie. Nærhet til Fram- og Kon-Tiki-museene betyr ikke at de er samme place.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:10977:37',
      address: { street: 'Bygdøynesveien', number: '37', postcode: '0286', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:10977:37',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Bygd%C3%B8ynesveien%2037%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Bygdøynesveien 37, OSLO. Punktet er representasjonspunktet for Norsk Maritimt Museums offisielle besøksadresse og brukes som display-marker for det selvstendige museumsanlegget.',
      externalLinks: [
        { type: 'official', label: 'Norsk Maritimt Museum – om museet', url: 'https://marmuseum.no/om-norsk-maritimt-museum', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Norsk Maritimt Museum – kontakt', url: 'https://marmuseum.no/kontakt-oss', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    },
    identity: 'Norsk Maritimt Museum, det selvstendige museumsanlegget i Bygdøynesveien 37',
    overlapNote: 'Museet er fysisk og institusjonelt separat fra `frammuseet` og `kon_tiki_museet`, selv om de ligger i samme museumsklynge på Bygdøynes.'
  },
  {
    file: 'data/places/historie/oslo/places_historie/historisk_museum.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/historisk_museum.json',
    evidenceManifestEntry: 'oslo/historie/historisk_museum.json',
    manifestEntry: 'places/historie/oslo/places_historie/historisk_museum.json',
    record: {
      id: 'historisk_museum',
      name: 'Historisk museum',
      lat: 59.916807785575195,
      lon: 10.735397626110528,
      r: 60,
      category: 'historie',
      year: 1904,
      desc: 'Museumsbygning ved Tullinløkka, åpnet for publikum i 1904 og i dag del av Kulturhistorisk museum ved Universitetet i Oslo.',
      popupDesc: 'Historisk museum ble reist i årene 1898–1902 og åpnet for publikum i 1904 som felles museumsbygning for universitetets oldsaks-, etnografiske og numismatiske samlinger. Bygningen ved Frederiks gate er et markant museumshus fra århundreskiftet og er i dag en del av Kulturhistorisk museum ved Universitetet i Oslo.\n\nMuseet formidler arkeologiske, etnografiske og numismatiske samlinger og gjør lange historiske tidsspenn tilgjengelige i ett konkret institusjonsbygg. I History Go er dette et eget museumssted: `tullin` representerer det bredere Tullinløkka-området, mens `historisk_museum` representerer selve museumsbygningen og institusjonen i Frederiks gate 2.',
      emne_ids: sharedEmner,
      quiz_profile: {
        place_type: 'museum',
        subtype: 'universitetsmuseum_arkeologi_etnografi_numismatikk',
        signature_features: [
          'reist 1898–1902 og åpnet for publikum i 1904',
          'museumshus ved Tullinløkka i Frederiks gate 2',
          'del av Kulturhistorisk museum ved Universitetet i Oslo',
          'samler arkeologiske, etnografiske og numismatiske perspektiver',
          'fredet statlig kulturhistorisk eiendom'
        ],
        primary_angles: ['museumshistorie', 'arkeologi', 'etnografi', 'numismatikk', 'arkitektur', 'kulturarv'],
        question_families: ['historisk_endring', 'institusjonshistorie', 'samlinger', 'arkitektur', 'kontrast'],
        avoid_angles: ['generisk_historisk_museum', 'behandle_tullin_og_museet_som_samme_place'],
        must_include: [
          'åpningen i 1904',
          'rollen som universitetsmuseum og samlingsbygg',
          'forskjellen mellom museumsbygningen og områdeankeret Tullin'
        ],
        contrast_targets: ['tullin', 'nasjonalmuseet', 'norsk_folkemuseum'],
        notes: 'Spør selve museumsbygningen og samlingsinstitusjonen. `tullin` er et bredere områdeanker og skal ikke erstatte denne fysiske place-recorden.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:11941:2',
      address: { street: 'Frederiks gate', number: '2', postcode: '0164', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:11941:2',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Frederiks%20gate%202%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Frederiks gate 2, OSLO. Punktet er representasjonspunktet for Historisk museums offisielle adresse og brukes som display-marker for museumsbygningen, ikke for hele Tullinløkka-området.',
      externalLinks: [
        { type: 'official', label: 'Kulturhistorisk museum – Universitetet i Oslo', url: 'https://www.khm.uio.no/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Lovdata – fredning av statens kulturhistoriske eiendommer', url: 'https://lovdata.no/dokument/SF/forskrift/2011-11-09-1088/KAPITTEL_13', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    },
    identity: 'Historisk museum, museumsbygningen og institusjonen i Frederiks gate 2 ved Tullinløkka',
    overlapNote: '`tullin` er et bredt områdeanker; denne recorden representerer den konkrete museumsbygningen og er derfor ikke et duplikat.'
  }
];

for (const item of places) {
  if (fs.existsSync(abs(item.file))) throw new Error(`${item.record.id}: place file already exists`);
  if (fs.existsSync(abs(item.evidenceFile))) throw new Error(`${item.record.id}: evidence file already exists`);
  writeJson(item.file, item.record);

  const p = item.record;
  const evidence = {
    placeId: p.id,
    placeFile: item.file,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat: p.lat,
      lon: p.lon,
      r: p.r,
      coordStatus: p.coordStatus,
      coordSource: p.coordSource,
      coordType: p.coordType,
      coordNote: p.coordNote
    },
    identity: {
      currentName: p.name,
      resolvedIdentity: item.identity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'building',
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: [
      'entydig offisielt adressepunkt',
      'offisiell institusjonsidentitet',
      'fysisk avgrensning mot nærliggende canonical steder'
    ],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'geonorge_adresser_v1',
        sourceUrl: p.coordSourceUrl,
        sourceObjectId: p.sourceObjectId,
        sourceQuality: 'official_address_plus_documented_identity',
        finding: `Geonorge gir et entydig offisielt adressepunkt for ${p.address.street} ${p.address.number} Oslo. ${item.overlapNote}`,
        canVerifyCoordinate: true,
        reason: p.coordNote
      }
    ],
    addressCandidates: [
      {
        address: `${p.address.street} ${p.address.number} Oslo`,
        sourceProvider: 'official_address',
        sourceObjectId: p.sourceObjectId,
        canApplyToPlace: true
      }
    ],
    sourceObjectCandidates: [
      { sourceProvider: 'official_address', sourceObjectId: p.sourceObjectId, canApplyToPlace: true }
    ],
    geometryCandidates: [],
    coordinateCandidates: [
      { lat: p.lat, lon: p.lon, coordRole: p.coordRole, canApplyToPlace: true }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Kildekontrakt, identitet og representasjonsanker er anvendt på canonical place.'
    },
    notes: [p.coordNote, item.overlapNote]
  };
  writeJson(item.evidenceFile, evidence);
}

const placeManifest = readJson(PLACE_MANIFEST);
for (const item of places) {
  if (placeManifest.files.includes(item.manifestEntry)) throw new Error(`${item.manifestEntry}: already in place manifest`);
  placeManifest.files.push(item.manifestEntry);
}
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const item of places) {
  if (evidenceManifest.files.includes(item.evidenceManifestEntry)) throw new Error(`${item.evidenceManifestEntry}: already in evidence manifest`);
  evidenceManifest.files.push(item.evidenceManifestEntry);
}
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
protocol = replaceOnce(
  protocol,
  'Oslo-tabellen inneholder nå 178 verifiserte eller kildekontrollerte canonical steder. Batch 41 etterfører tre museums- og kultursteder som allerede er produsert og runtime-synkronisert med kildebelagte geometriankre: Norges Hjemmefrontmuseum, Forsvarsmuseet og Roseslottet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo-tabellen inneholder nå 181 verifiserte eller kildekontrollerte canonical steder. Batch 42 legger til Norsk Folkemuseum, Norsk Maritimt Museum og Historisk museum med entydige offisielle Geonorge-adressepunkter etter fullført duplikat- og overlapaudit. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 41 | `roseslottet` | Roseslottet | verified_geometry | `osm-way:1004591108` |',
  '| 41 | `roseslottet` | Roseslottet | verified_geometry | `osm-way:1004591108` |\n| 42 | `norsk_folkemuseum` | Norsk Folkemuseum | verified | `geonorge-adresser-v1:0301:14899:10` |\n| 42 | `norsk_maritimt_museum` | Norsk Maritimt Museum | verified | `geonorge-adresser-v1:0301:10977:37` |\n| 42 | `historisk_museum` | Historisk museum | verified | `geonorge-adresser-v1:0301:11941:2` |',
  'Batch 42 rows'
);
protocol = replaceOnce(
  protocol,
  'Batch 41 (2026-07-20) etterfører de tre geometri-verifiserte stedene fra PR #2594 etter at batch 40 samtidig synkroniserte runtime-indeks og evidence-snapshotene. `norges_hjemmefrontmuseum` bruker Det dobbelte batteri / bygning 21 (`osm-way:111833902`) som eget bygningsanker, og `forsvarsmuseet` bruker Hovedarsenalet / bygning 62 (`osm-way:54830211`); begge er fysisk separate understeder inne på Akershus festning. `roseslottet` bruker den navngitte installasjonsgeometrien `osm-way:1004591108` som `site_center`, og aktiv status skal revurderes etter 2026-12-31.',
  'Batch 41 (2026-07-20) etterfører de tre geometri-verifiserte stedene fra PR #2594 etter at batch 40 samtidig synkroniserte runtime-indeks og evidence-snapshotene. `norges_hjemmefrontmuseum` bruker Det dobbelte batteri / bygning 21 (`osm-way:111833902`) som eget bygningsanker, og `forsvarsmuseet` bruker Hovedarsenalet / bygning 62 (`osm-way:54830211`); begge er fysisk separate understeder inne på Akershus festning. `roseslottet` bruker den navngitte installasjonsgeometrien `osm-way:1004591108` som `site_center`, og aktiv status skal revurderes etter 2026-12-31.\n\nBatch 42 (2026-07-20) produserer tre nye, fysisk selvstendige museumssteder fra den lukkede Oslo-museumsauditen. `norsk_folkemuseum` bruker det entydige Geonorge-punktet for Museumsveien 10 og modelleres separat fra `gol_stavkirke_bygdoy`, som er ett konkret objekt inne i det større museumsområdet. `norsk_maritimt_museum` bruker Bygdøynesveien 37 og er separat fra de nærliggende `frammuseet` og `kon_tiki_museet`. `historisk_museum` bruker Frederiks gate 2 og representerer selve museumsbygningen, mens `tullin` fortsatt er det bredere områdeankeret for Tullinløkka.',
  'Batch 42 note'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 178 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 181 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Created Oslo museum production batch 42 with three canonical places, evidence files, manifests and protocol rows.');
