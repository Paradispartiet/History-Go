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
    file: 'data/places/kunst/oslo/places_kunst/tbs_gallery.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/tbs_gallery.json',
    evidenceManifestEntry: 'oslo/kunst/tbs_gallery.json',
    manifestEntry: 'places/kunst/oslo/places_kunst/tbs_gallery.json',
    identity: 'TBS Gallery, det permanente kunstsenteret for Tore Bjørn Skjølsviks verk i villa- og stallanlegget i Oscars gate 23',
    overlapNote: 'Stedet er et selvstendig kunstsenter med permanent samling, atelier, historisk villa og skulpturhage; det overlapper ikke en eksisterende canonical place-record på adressen.',
    record: {
      id: 'tbs_gallery',
      name: 'TBS Gallery',
      lat: 59.922142741324926,
      lon: 10.725818640861803,
      r: 60,
      category: 'kunst',
      year: 2019,
      desc: 'Permanent kunstsenter for Tore Bjørn Skjølsviks verk i et historisk villa- og stallanlegg i Oscars gate 23, åpnet i 2019 og omgitt av en liten skulpturpark.',
      popupDesc: 'TBS Gallery åpnet 19. mai 2019 og er viet billedkunstneren Tore Bjørn Skjølsviks verk. Den permanente samlingen vises i et herskapshus og en tidligere stall, mens uteområdet fungerer som en liten skulpturpark. Hovedhuset er tegnet av Georg Andreas Bull i 1858, og stedet kombinerer derfor kunstinstitusjon, kunstnerhjem, atelier og et eldre arkitektonisk lag.\n\nI History Go skal TBS Gallery behandles som et varig kunst- og kultursted, ikke bare som et kommersielt salgsgalleri. Samtidig må spørsmål skille tydelig mellom Skjølsviks kunstneriske virksomhet og villaens egen 1800-tallshistorie. Det interessante er nettopp møtet mellom permanent samling, levende kunstnerpraksis, historisk arkitektur og kunst i hagen.',
      emne_ids: [
        'em_kunst_institusjonskritikk_og_representasjon',
        'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
        'em_kunst_okonomi_og_finansiering',
        'em_kunst_offentlig_kunst_monumenter'
      ],
      quiz_profile: {
        place_type: 'kunstinstitusjon',
        subtype: 'permanent_kunstnersamling_i_historisk_villaanlegg',
        signature_features: [
          'åpnet 19. mai 2019',
          'permanent samling av Tore Bjørn Skjølsviks verk',
          'historisk villa fra 1858 tegnet av Georg Andreas Bull',
          'tidligere stall, kunstneratelier og skulpturhage inngår i anlegget',
          'kombinerer permanent utstilling med levende kunstnerpraksis'
        ],
        primary_angles: ['kunstnerskap', 'permanent_samling', 'arkitektur', 'atelier', 'skulpturpark'],
        question_families: ['institusjonshistorie', 'kunstnerpraksis', 'arkitektur', 'romlig_lesning', 'kontrast'],
        avoid_angles: ['generisk_salgsgalleri', 'blande_villahistorie_og_kunstnerskap_uten_skille'],
        must_include: [
          'den permanente Skjølsvik-samlingen',
          'villaen fra 1858 og Georg Andreas Bull',
          'kombinasjonen av galleri, atelier og skulpturhage'
        ],
        contrast_targets: ['kunstnernes_hus', 'astrup_fearnley', 'vigelandmuseet'],
        notes: 'Spør stedet som permanent kunstnersenter i et historisk anlegg. Unngå reklamespråk og skill samlingshistorien fra bygningens eldre arkitekturhistorie.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:15439:23',
      address: { street: 'Oscars gate', number: '23', postcode: '0352', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:15439:23',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Oscars%20gate%2023%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Oscars gate 23, OSLO. Punktet brukes som display-marker for TBS Gallerys villa- og galleriområde.',
      externalLinks: [
        { type: 'official', label: 'TBS Gallery – om galleriet', url: 'https://tbsgalleri.no/om-oss/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'TBS Gallery – fast utstilling', url: 'https://tbsgalleri.no/fast_utstilling/', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    }
  },
  {
    file: 'data/places/historie/oslo/places_historie/viking_planet_oslo.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/viking_planet_oslo.json',
    evidenceManifestEntry: 'oslo/historie/viking_planet_oslo.json',
    manifestEntry: 'places/historie/oslo/places_historie/viking_planet_oslo.json',
    identity: 'The Viking Planet Oslo, det selvstendige digitale vikingmuseet i Fridtjof Nansens plass 4',
    overlapNote: 'Museet er fysisk separat fra Oslo rådhus og Rådhusplassen og må også holdes institusjonelt adskilt fra det framtidige Vikingtidsmuseet på Bygdøy.',
    record: {
      id: 'viking_planet_oslo',
      name: 'The Viking Planet Oslo',
      lat: 59.91321454837157,
      lon: 10.734083243973915,
      r: 60,
      category: 'historie',
      year: 2019,
      desc: 'Digitalt og interaktivt museum om vikingtiden ved Rådhusplassen, åpnet i 2019 og bygget rundt VR, film, holografiske og andre immersive formidlingsformer.',
      popupDesc: 'The Viking Planet Oslo åpnet 20. juni 2019 og er et digitalt museum som formidler vikingtiden gjennom blant annet VR, film, holografiske framstillinger og interaktive opplevelser. Museet ligger i Fridtjof Nansens plass 4, rett ved Oslo rådhus, men er et selvstendig besøkssted.\n\nI History Go er stedet særlig interessant som eksempel på moderne historieformidling. Digitale rekonstruksjoner kan gjøre fortiden sanselig og tilgjengelig, men de er fortolkninger bygget på utvalg, design og teknologiske valg — ikke primærkilder i seg selv. Quiz og oppgaver skal derfor skille mellom dokumentert kunnskap om vikingtiden og måten museet iscenesetter denne kunnskapen på. Stedet må også holdes tydelig adskilt fra Vikingtidsmuseet på Bygdøy.',
      emne_ids: historyEmner,
      quiz_profile: {
        place_type: 'museum',
        subtype: 'digitalt_interaktivt_vikingmuseum',
        signature_features: [
          'åpnet 20. juni 2019',
          'digital og immersiv formidling av vikingtiden',
          'bruker blant annet VR, film og interaktive teknologier',
          'ligger ved Rådhusplassen, men er et selvstendig besøkssted',
          'må holdes kildekritisk adskilt fra primær historisk dokumentasjon'
        ],
        primary_angles: ['vikingtid', 'historieformidling', 'digital_rekonstruksjon', 'kildekritikk', 'museumsdesign'],
        question_families: ['historisk_kunnskap', 'formidlingskritikk', 'teknologi', 'kildekritikk', 'kontrast'],
        avoid_angles: ['behandle_vr_som_primarkilde', 'forveksle_med_vikingtidsmuseet_pa_bygdoy'],
        must_include: [
          'åpningen i 2019',
          'den digitale og immersive formidlingsformen',
          'skillet mellom historisk kunnskap og rekonstruksjon'
        ],
        contrast_targets: ['historisk_museum', 'norsk_folkemuseum', 'radhusplassen'],
        notes: 'Stedet skal brukes kildekritisk: spørsmål må skille dokumenterte historiske påstander fra museets digitale visualisering og opplevelsesdesign.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:11993:4',
      address: { street: 'Fridtjof Nansens plass', number: '4', postcode: '0160', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:11993:4',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Fridtjof%20Nansens%20plass%204%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Fridtjof Nansens plass 4, OSLO. Punktet brukes som display-marker for The Viking Planet Oslo og ikke som områdeanker for Rådhusplassen.',
      externalLinks: [
        { type: 'official', label: 'The Viking Planet – planlegg besøket', url: 'https://www.thevikingplanet.com/no/planlegg-ditt-besok/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'The Viking Planet – om åpningen', url: 'https://www.thevikingplanet.com/home/about/', lang: 'en', verifiedAt: VERIFIED_AT }
      ]
    }
  },
  {
    file: 'data/places/naeringsliv/oslo/places_naeringsliv/the_salmon_vitensenter.json',
    evidenceFile: 'data/coordinate-evidence/oslo/naeringsliv/the_salmon_vitensenter.json',
    evidenceManifestEntry: 'oslo/naeringsliv/the_salmon_vitensenter.json',
    manifestEntry: 'places/naeringsliv/oslo/places_naeringsliv/the_salmon_vitensenter.json',
    identity: 'The Salmon kunnskapssenter, det gratis besøks- og læringssenteret om norsk lakseoppdrett i Strandpromenaden 11',
    overlapNote: '`tjuvholmen` er et bredt områdeanker. Canonical identitet her er kunnskapssenteret om havbruk, ikke restaurantvirksomheten eller hele Tjuvholmen.',
    record: {
      id: 'the_salmon_vitensenter',
      name: 'The Salmon – kunnskapssenter',
      lat: 59.90793198330203,
      lon: 10.723239043633493,
      r: 60,
      category: 'naeringsliv',
      year: 2019,
      desc: 'Gratis kunnskapssenter på Tjuvholmen om norsk lakseoppdrett og havbruksnæring, offisielt åpnet i 2019 og utviklet med NMBU som faglig samarbeidspartner.',
      popupDesc: 'The Salmon åpnet som visnings- og kunnskapssenter på Tjuvholmen i 2019. Senteret er etablert for å forklare norsk lakseoppdrett og havbruk for skoleklasser, turister og andre besøkende, og formidler produksjonskjeden fra sjø til matbord. Nova Sea står bak senteret sammen med Petter Sandberg, og Norges miljø- og biovitenskapelige universitet har vært faglig samarbeidspartner.\n\nStedet kombinerer kunnskapssenter og restaurant, men History Go-markøren representerer kunnskapssenteret. Det gjør stedet til et konkret case for hvordan en stor norsk eksportnæring presenterer teknologi, arbeid, kystgeografi, matproduksjon og bærekraftsspørsmål midt i hovedstaden. Formidlingen skal leses kildekritisk også her: senteret er tett knyttet til oppdrettsnæringen og er derfor både læringsarena og aktørformidling.',
      emne_ids: [
        'em_naer_felt_arbeid_verdiskaping',
        'em_naer_geografi_infrastruktur'
      ],
      quiz_profile: {
        place_type: 'kunnskapssenter',
        subtype: 'havbruk_og_lakseoppdrett_formidlingssenter',
        signature_features: [
          'offisielt åpnet som visningssenter i 2019',
          'gratis kunnskapssenter om norsk lakseoppdrett og havbruk',
          'formidler næringen fra sjø til matbord',
          'Nova Sea og Petter Sandberg står bak senteret',
          'NMBU er faglig samarbeidspartner'
        ],
        primary_angles: ['havbruk', 'næringsliv', 'teknologi', 'matproduksjon', 'kystgeografi', 'kildekritikk'],
        question_families: ['næringshistorie', 'produksjonskjede', 'teknologi', 'bærekraft', 'aktorperspektiv'],
        avoid_angles: ['restaurant_anmeldelse', 'behandle_naeringsaktoren_som_noytral_kilde'],
        must_include: [
          'kunnskapssenterets rolle framfor restaurantdelen',
          'havbruk som norsk næring og produksjonssystem',
          'kildekritikk rundt næringsfinansiert formidling'
        ],
        contrast_targets: ['tjuvholmen', 'norsk_maritimt_museum', 'vinmonopolet_lager'],
        notes: 'Canonical markør gjelder kunnskapssenteret. Bruk senterets egne framstillinger som aktørkilde og kombiner dem med uavhengige kilder i quizproduksjon.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:21458:11',
      address: { street: 'Strandpromenaden', number: '11', postcode: '0252', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:21458:11',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Strandpromenaden%2011%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Strandpromenaden 11, OSLO. Punktet brukes som display-marker for The Salmon kunnskapssenter og ikke som områdeanker for Tjuvholmen eller som egen restaurantmarkør.',
      externalLinks: [
        { type: 'official', label: 'The Salmon – kunnskapssenter', url: 'https://www.thesalmon.com/kunnskapssenter/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'source', label: 'Kyst.no – åpningen av The Salmon i 2019', url: 'https://www.kyst.no/erna-solberg-oppdrett-the-salmon/vil-spre-kunnskap-om-oppdrettsnaeringen-i-oslo/637743', lang: 'nb', verifiedAt: VERIFIED_AT }
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
  'Oslo-tabellen inneholder nå 188 verifiserte eller kildekontrollerte canonical steder. Batch 45 legger til Kunstnernes Hus, Vigelandmuseet og Møllergata skole med entydige offisielle Geonorge-adressepunkter og parent-modeller som hindrer duplikatmarkører for Vigelandsparken og Oslo Skolemuseum. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo-tabellen inneholder nå 191 verifiserte eller kildekontrollerte canonical steder. Batch 46 legger til TBS Gallery, The Viking Planet Oslo og The Salmon kunnskapssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt avgrensede institusjonsidentiteter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 45 | `mollergata_skole` | Møllergata skole | verified | `geonorge-adresser-v1:0301:14943:49` |',
  '| 45 | `mollergata_skole` | Møllergata skole | verified | `geonorge-adresser-v1:0301:14943:49` |\n| 46 | `tbs_gallery` | TBS Gallery | verified | `geonorge-adresser-v1:0301:15439:23` |\n| 46 | `viking_planet_oslo` | The Viking Planet Oslo | verified | `geonorge-adresser-v1:0301:11993:4` |\n| 46 | `the_salmon_vitensenter` | The Salmon – kunnskapssenter | verified | `geonorge-adresser-v1:0301:21458:11` |',
  'Batch 46 rows'
);
protocol = replaceOnce(
  protocol,
  'Batch 45 (2026-07-20) legger til tre fysisk avklarte institusjonssteder fra den lukkede museumsauditen. `kunstnernes_hus` bruker Wergelandsveien 17 som eget kunstinstitusjonsbygg. `vigelandmuseet` bruker Nobels gate 32 som atelier-, bolig- og museumsbygning og holdes separat fra det større parkankeret `vigelandsparken`. `mollergata_skole` bruker Møllergata 49 som canonical skolekompleks, mens Oslo Skolemuseum modelleres som institusjonslag i bygg D i stedet for en separat overlappende markør.',
  'Batch 45 (2026-07-20) legger til tre fysisk avklarte institusjonssteder fra den lukkede museumsauditen. `kunstnernes_hus` bruker Wergelandsveien 17 som eget kunstinstitusjonsbygg. `vigelandmuseet` bruker Nobels gate 32 som atelier-, bolig- og museumsbygning og holdes separat fra det større parkankeret `vigelandsparken`. `mollergata_skole` bruker Møllergata 49 som canonical skolekompleks, mens Oslo Skolemuseum modelleres som institusjonslag i bygg D i stedet for en separat overlappende markør.\n\nBatch 46 (2026-07-20) produserer tre stabile besøkssteder fra museumsauditens grensesone. `tbs_gallery` bruker Oscars gate 23 og modelleres som permanent kunstnersenter i et historisk villa- og stallanlegg, ikke som et tilfeldig kommersielt salgsgalleri. `viking_planet_oslo` bruker Fridtjof Nansens plass 4 og holdes fysisk separat fra Rådhusplassen og institusjonelt separat fra Vikingtidsmuseet på Bygdøy; den digitale formidlingen skal behandles kildekritisk. `the_salmon_vitensenter` bruker Strandpromenaden 11 og representerer det gratis kunnskapssenteret om havbruk, ikke restaurantdelen eller hele Tjuvholmen.',
  'Batch 46 note'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 188 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 191 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Created Oslo museum production batch 46 with three canonical places, evidence files, manifests and protocol rows.');
