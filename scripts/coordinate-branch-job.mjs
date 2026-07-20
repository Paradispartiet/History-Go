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
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected text not found`);
  if (text.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: expected exactly one match`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}
function assertNoActivePlaceId(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const row of rowsFrom(readJson(rel))) {
      if (row?.id === placeId) hits.push(rel);
    }
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}

const historyEmner = [
  'em_his_spor_materialitet',
  'em_his_historiske_lag_i_byrom',
  'em_his_kulturminner_bevaring',
  'em_his_samtid_ettertid_fortelling'
];

const places = [
  {
    file: 'data/places/kunst/oslo/places_kunst/kunstnernes_hus.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/kunstnernes_hus.json',
    evidenceManifestEntry: 'oslo/kunst/kunstnernes_hus.json',
    manifestEntry: 'places/kunst/oslo/places_kunst/kunstnernes_hus.json',
    identity: 'Kunstnernes Hus, det kunstnerstyrte utstillings- og møtestedet i den modernistiske bygningen i Wergelandsveien 17',
    overlapNote: 'Kunstnernes Hus er et selvstendig institusjonsbygg og kunststed. Nærliggende park-, slotts- og byområde-records representerer andre fysiske steder.',
    record: {
      id: 'kunstnernes_hus',
      name: 'Kunstnernes Hus',
      lat: 59.91943035555868,
      lon: 10.730615118964748,
      r: 60,
      category: 'kunst',
      year: 1930,
      desc: 'Norges eldste kunstnerstyrte institusjon, åpnet i 1930 som kunstnernes eget utstillingshus og fortsatt et sentralt ikke-kommersielt møtested for samtidskunst og kunstnerisk offentlighet.',
      popupDesc: 'Kunstnernes Hus åpnet 1. oktober 1930 med Høstutstillingen etter at norske kunstnere selv hadde initiert og reist huset. Bygningen, tegnet av Gudolf Blakstad og Herman Munthe-Kaas, ble sett som et radikalt moderne utstillingsbygg og regnes i dag som et hovedverk i norsk modernistisk arkitektur.\n\nHuset har siden åpningen vært et kunstnerstyrt, ikke-kommersielt visningssted og møtepunkt for kunstnere og publikum. Høstutstillingen står sentralt i identiteten, mens Per Krohgs takmaleri fra 1932 og Ørnulf Basts løver fra 1931 er blitt egne kjennetegn. I History Go er stedet særlig viktig for å forstå hvordan kunstnere organiserer sine egne institusjoner, hvordan arkitektur former kunstoffentligheten, og hvordan kunstnerisk frihet får et konkret fysisk hjem.',
      emne_ids: [
        'em_kunst_institusjonskritikk_og_representasjon',
        'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
        'em_kunst_okonomi_og_finansiering'
      ],
      quiz_profile: {
        place_type: 'kunstinstitusjon',
        subtype: 'kunstnerstyrt_modernistisk_utstillingshus',
        signature_features: [
          'åpnet med Høstutstillingen 1. oktober 1930',
          'Norges eldste kunstnerstyrte institusjon',
          'tegnet av Gudolf Blakstad og Herman Munthe-Kaas',
          'viktig eksempel på norsk modernistisk arkitektur',
          'kunstnerstyrt og ikke-kommersielt møtested for kunstfeltet og publikum'
        ],
        primary_angles: ['kunstinstitusjon', 'kunstnerorganisering', 'modernisme', 'hostutstillingen', 'offentlighet'],
        question_families: ['institusjonshistorie', 'arkitektur', 'kunstpolitikk', 'symbolikk', 'kontrast'],
        avoid_angles: ['generisk_kunstgalleri', 'redusere_til_enkeltutstillinger'],
        must_include: [
          'kunstnernes egen rolle i etableringen',
          'åpningen i 1930 og Høstutstillingen',
          'bygningens modernistiske arkitektur og institusjonelle betydning'
        ],
        contrast_targets: ['nasjonalmuseet', 'astrup_fearnley', 'munch_museet'],
        notes: 'Spør huset som kunstnerstyrt institusjon og arkitektonisk ramme for kunstnerisk offentlighet, ikke bare som et tilfeldig galleri.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:18496:17',
      address: { street: 'Wergelandsveien', number: '17', postcode: '0167', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:18496:17',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Wergelandsveien%2017%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Wergelandsveien 17, OSLO. Punktet brukes som display-marker for Kunstnernes Hus-bygningen.',
      externalLinks: [
        { type: 'official', label: 'Kunstnernes Hus – om huset', url: 'https://kunstnerneshus.no/om', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Kunstnernes Hus – historie', url: 'https://kunstnerneshus.no/om/historie', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    }
  },
  {
    file: 'data/places/kunst/oslo/places_kunst/vigelandmuseet.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/vigelandmuseet.json',
    evidenceManifestEntry: 'oslo/kunst/vigelandmuseet.json',
    manifestEntry: 'places/kunst/oslo/places_kunst/vigelandmuseet.json',
    identity: 'Vigelandmuseet, Gustav Vigelands tidligere atelier og bolig i museumsbygningen i Nobels gate 32',
    overlapNote: '`vigelandsparken` er et utendørs park- og skulpturområdeanker. Vigelandmuseet er en egen bygning sør for parken og skal ha separat canonical markør.',
    record: {
      id: 'vigelandmuseet',
      name: 'Vigelandmuseet',
      lat: 59.92281343368528,
      lon: 10.700466646968607,
      r: 60,
      category: 'kunst',
      year: 1947,
      desc: 'Gustav Vigelands tidligere atelier, arbeidsplass og bolig, åpnet som museum i 1947 og i dag et sentralt sted for å forstå både kunstnerskapet og tilblivelsen av Vigelandsparken.',
      popupDesc: 'I 1919 besluttet Kristiania kommune å bygge et nytt atelier for Gustav Vigeland, og avtalen fra 1921 fastsatte at bygningen senere skulle bli museum for verkene hans. Vigeland flyttet inn i leiligheten i andre etasje i 1924 og bodde og arbeidet her fram til sin død i 1943. Atelieret åpnet som museum i 1947.\n\nMuseet rommer skulpturer, tresnitt, tegninger, arkivmateriale og gipsoriginalene til mange av verkene som senere ble utført i stein eller bronse i Vigelandsparken. Bygningen er tegnet av Lorentz Ree og regnes som et viktig nyklassisistisk verk. History Go skiller derfor tydelig mellom `vigelandmuseet` som atelier-, bolig- og museumsbygning og `vigelandsparken` som det store utendørs kunst- og parklandskapet.',
      emne_ids: [
        'em_kunst_offentlig_kunst_monumenter',
        'em_kunst_hverdagsestetikk',
        'em_kunst_institusjonskritikk_og_representasjon',
        'em_kunst_kvalitet_kritikk_og_symbolsk_kapital'
      ],
      quiz_profile: {
        place_type: 'museum',
        subtype: 'kunstneratelier_bolig_og_museum',
        signature_features: [
          'bygget som Gustav Vigelands atelier og framtidige museum',
          'Vigeland bodde i leiligheten her fra 1924 til 1943',
          'åpnet som museum i 1947',
          'rommer originalmateriale og gipsmodeller knyttet til Vigelandsparken',
          'nyklassisistisk museumsbygning tegnet av Lorentz Ree'
        ],
        primary_angles: ['kunstnerliv', 'atelier', 'museumshistorie', 'skulpturprosess', 'arkitektur'],
        question_families: ['historisk_endring', 'kunstnerpraksis', 'material_prosess', 'arkitektur', 'kontrast'],
        avoid_angles: ['behandle_museet_og_parken_som_samme_sted', 'generisk_kunstmuseum'],
        must_include: [
          'atelier- og boligfunksjonen før museumsåpningen',
          'åpningen i 1947',
          'forbindelsen til, men den fysiske forskjellen fra, Vigelandsparken'
        ],
        contrast_targets: ['vigelandsparken', 'kunstnernes_hus', 'munch_museet'],
        notes: 'Spør museet gjennom arbeidsprosessen, atelieret og kunstnerhjemmet. Parken er et eget canonical sted.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:15080:32',
      address: { street: 'Nobels gate', number: '32', postcode: '0268', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:15080:32',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Nobels%20gate%2032%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Nobels gate 32, OSLO. Punktet brukes som display-marker for Vigelandmuseets museumsbygning og ikke som områdeanker for Vigelandsparken.',
      externalLinks: [
        { type: 'official', label: 'Vigelandmuseet – museet', url: 'https://vigeland.museum.no/vigeland-museet', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Vigelandmuseet – historie', url: 'https://vigeland.museum.no/en/vigelandmuseum/historie', lang: 'en', verifiedAt: VERIFIED_AT }
      ]
    }
  },
  {
    file: 'data/places/historie/oslo/places_historie/mollergata_skole.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/mollergata_skole.json',
    evidenceManifestEntry: 'oslo/historie/mollergata_skole.json',
    manifestEntry: 'places/historie/oslo/places_historie/mollergata_skole.json',
    identity: 'Møllergata skole, det historiske kommunale skolekomplekset i Møllergata 49 med Oslo Skolemuseum som institusjonslag i bygg D',
    overlapNote: 'Oslo Skolemuseum holder til i en del av Møllergata skole. Det opprettes derfor én canonical markør for skolekomplekset, ikke en overlappende separat museumspinne.',
    record: {
      id: 'mollergata_skole',
      name: 'Møllergata skole',
      lat: 59.918190097882,
      lon: 10.750406532588284,
      r: 60,
      category: 'historie',
      year: 1861,
      desc: 'Oslos eldste kommunalt oppførte skole, ferdigstilt i 1861 og regnet som Norges første moderne folkeskole; Oslo Skolemuseum har siden 2000 holdt til i en del av det historiske skolekomplekset.',
      popupDesc: 'Møllergata skole sto ferdig i januar 1861 etter tegninger av arkitekt J.W. Nordan og regnes skolehistorisk som Norges første moderne folkeskole. Anlegget ble senere utvidet i 1893 og 1933, og de fire bygningene har stor kulturhistorisk og arkitektonisk verdi.\n\nOslo Skolemuseum har disponert bygg D siden 2000 og bruker det historiske skoleanlegget til å formidle skolehistorie. En planlagt avvikling sommeren 2026 ble omgjort, og virksomheten videreføres etter sommerstengingen. History Go modellerer derfor Møllergata skole som det fysiske canonical stedet og Oslo Skolemuseum som et nåværende institusjonslag i samme kompleks, i stedet for å legge to markører på samme skoleområde.',
      emne_ids: historyEmner,
      quiz_profile: {
        place_type: 'skolekompleks',
        subtype: 'historisk_folkeskole_med_skolemuseum',
        signature_features: [
          'ferdigstilt i januar 1861 etter tegninger av J.W. Nordan',
          'Oslos eldste kommunalt oppførte skole',
          'regnes som Norges første moderne folkeskole',
          'utvidet i 1893 og 1933',
          'Oslo Skolemuseum har holdt til i bygg D siden 2000'
        ],
        primary_angles: ['skolehistorie', 'offentlig_institusjon', 'arkitektur', 'utdanningshistorie', 'museum'],
        question_families: ['historisk_endring', 'institusjonshistorie', 'arkitektur', 'hverdagsliv', 'kontrast'],
        avoid_angles: ['lage_separat_skolemuseum_markor_pa_samme_anlegg', 'generisk_skolehistorie'],
        must_include: [
          'åpningen i 1861 og rollen i norsk folkeskolehistorie',
          'skoleanleggets bevarte historiske lag',
          'Oslo Skolemuseum som bruks- og institusjonslag siden 2000'
        ],
        contrast_targets: ['sagene_skole', 'mollergata_19', 'arbeidermuseet'],
        notes: 'Canonical stedet er skolekomplekset. Oslo Skolemuseum er et institusjonslag i bygg D og skal ikke få en separat overlappende markør.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:14943:49',
      address: { street: 'Møllergata', number: '49', postcode: '0179', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:14943:49',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=M%C3%B8llergata%2049%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Møllergata 49, OSLO. Punktet brukes som display-marker for det historiske skolekomplekset; Oslo Skolemuseum modelleres som et institusjonslag i samme anlegg.',
      externalLinks: [
        { type: 'official', label: 'Møllergata skole – skolens historie', url: 'https://mollergata.osloskolen.no/om-skolen/om-oss/skolens-historie/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Oslo Skolemuseum', url: 'https://skolemuseum.osloskolen.no/', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    }
  }
];

for (const item of places) {
  assertNoActivePlaceId(item.record.id);
  if (fs.existsSync(abs(item.file))) throw new Error(`${item.record.id}: place file already exists`);
  if (fs.existsSync(abs(item.evidenceFile))) throw new Error(`${item.record.id}: evidence file already exists`);
  writeJson(item.file, item.record);

  const p = item.record;
  writeJson(item.evidenceFile, {
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
    requiredEvidence: ['entydig offisielt adressepunkt', 'offisiell stedsidentitet', 'fysisk avgrensning mot nærliggende canonical steder'],
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
    addressCandidates: [{ address: `${p.address.street} ${p.address.number} Oslo`, sourceProvider: 'official_address', sourceObjectId: p.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: p.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: p.lat, lon: p.lon, coordRole: p.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt, identitet og representasjonsanker er anvendt på canonical place.' },
    notes: [p.coordNote, item.overlapNote]
  });
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
  'Oslo-tabellen inneholder nå 184 verifiserte eller kildekontrollerte canonical steder. Batch 43 legger til Frogner hovedgård, Arbeidermuseet og Nobels Fredssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt fysisk avgrensning mot eksisterende parent- og nabosteder. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo-tabellen inneholder nå 187 verifiserte eller kildekontrollerte canonical steder. Batch 44 legger til Kunstnernes Hus, Vigelandmuseet og Møllergata skole med entydige offisielle Geonorge-adressepunkter og parent-modeller som hindrer duplikatmarkører for Vigelandsparken og Oslo Skolemuseum. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 43 | `nobels_fredssenter` | Nobels Fredssenter | verified | `geonorge-adresser-v1:0301:18199:1` |',
  '| 43 | `nobels_fredssenter` | Nobels Fredssenter | verified | `geonorge-adresser-v1:0301:18199:1` |\n| 44 | `kunstnernes_hus` | Kunstnernes Hus | verified | `geonorge-adresser-v1:0301:18496:17` |\n| 44 | `vigelandmuseet` | Vigelandmuseet | verified | `geonorge-adresser-v1:0301:15080:32` |\n| 44 | `mollergata_skole` | Møllergata skole | verified | `geonorge-adresser-v1:0301:14943:49` |',
  'Batch 44 rows'
);
protocol = replaceOnce(
  protocol,
  'Batch 43 (2026-07-20) produserer tre videre museumssteder fra samme lukkede audit. `frogner_hovedgard` bruker Halvdan Svartes gate 58 og modellerer selve hovedgårdsanlegget, med Bymuseet og Teatermuseet som nåværende institusjonslag i stedet for separate markører. `arbeidermuseet` bruker Sagveien 28 og holdes fysisk separat fra brede industriområde-records langs Akerselva. `nobels_fredssenter` bruker Brynjulf Bulls plass 1 i den tidligere Vestbanestasjonen og skilles fra både områdeankeret `radhusplassen` og institusjonsstedet `nobelinstituttet`.',
  'Batch 43 (2026-07-20) produserer tre videre museumssteder fra samme lukkede audit. `frogner_hovedgard` bruker Halvdan Svartes gate 58 og modellerer selve hovedgårdsanlegget, med Bymuseet og Teatermuseet som nåværende institusjonslag i stedet for separate markører. `arbeidermuseet` bruker Sagveien 28 og holdes fysisk separat fra brede industriområde-records langs Akerselva. `nobels_fredssenter` bruker Brynjulf Bulls plass 1 i den tidligere Vestbanestasjonen og skilles fra både områdeankeret `radhusplassen` og institusjonsstedet `nobelinstituttet`.\n\nBatch 44 (2026-07-20) legger til tre fysisk avklarte institusjonssteder. `kunstnernes_hus` bruker Wergelandsveien 17 som eget kunstinstitusjonsbygg. `vigelandmuseet` bruker Nobels gate 32 som atelier-, bolig- og museumsbygning og holdes separat fra det større parkankeret `vigelandsparken`. `mollergata_skole` bruker Møllergata 49 som canonical skolekompleks, mens Oslo Skolemuseum modelleres som institusjonslag i bygg D i stedet for en separat overlappende markør.',
  'Batch 44 note'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 184 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 187 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Created Oslo museum production batch 44 with three canonical places, evidence files, manifests and protocol rows.');
