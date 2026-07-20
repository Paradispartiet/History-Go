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

const sharedEmner = [
  'em_his_spor_materialitet',
  'em_his_historiske_lag_i_byrom',
  'em_his_kulturminner_bevaring',
  'em_his_samtid_ettertid_fortelling'
];

const places = [
  {
    file: 'data/places/historie/oslo/places_historie/frogner_hovedgard.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/frogner_hovedgard.json',
    evidenceManifestEntry: 'oslo/historie/frogner_hovedgard.json',
    manifestEntry: 'places/historie/oslo/places_historie/frogner_hovedgard.json',
    identity: 'Frogner hovedgård, det bevarte herskapsgårdsanlegget og dagens fysiske vertssted for Bymuseet og Teatermuseet',
    overlapNote: '`vigelandsparken` representerer det større park- og skulpturanlegget. Bymuseet og Teatermuseet deler Frogner hovedgård og skal ikke få separate markører på samme fysiske sted.',
    record: {
      id: 'frogner_hovedgard',
      name: 'Frogner hovedgård',
      lat: 59.92395135932375,
      lon: 10.703042174281878,
      r: 60,
      category: 'historie',
      year: 1747,
      desc: 'Bevart herskapsgårdsanlegg i Frognerparken, utviklet til en representativ lystgård fra midten av 1700-tallet og siden 1909 brukt som bymuseum; i dag holder Bymuseet og Teatermuseet til her.',
      popupDesc: 'Frogner er en av de eldste bosetningene i Aker, men dagens hovedgårdsanlegg fikk sin herskapelige form på 1700-tallet. Da major og ingeniøroffiser Hans Jacob Scheel kjøpte gården i 1747, lot han oppføre en ny hovedbygning og uthusene som rammer inn tunet. Bernt Anker kjøpte Frogner i 1790 og utvidet hovedbygningen betydelig for å bruke stedet som lystgård og representasjonsarena.\n\nKristiania kommune kjøpte eiendommen i 1896. I 1909 flyttet foreningen Det gamle Christiania inn og etablerte bymuseum. I dag holder Bymuseet og Teatermuseet til i Frogner hovedgård. History Go bruker derfor selve hovedgården som canonical sted: museene er nåværende institusjonslag i det samme fysiske anlegget, ikke to separate markører på samme adresse.',
      emne_ids: sharedEmner,
      quiz_profile: {
        place_type: 'historisk_hovedgard',
        subtype: 'herskapsgard_og_museumsanlegg',
        signature_features: [
          'Hans Jacob Scheel utviklet gården til herskapsgård etter kjøpet i 1747',
          'Bernt Anker utvidet hovedbygningen etter 1790',
          'komplett 1700-tallsanlegg med hovedbygning, driftsbygninger og lukket gårdsrom',
          'Det gamle Christiania etablerte bymuseum her i 1909',
          'Bymuseet og Teatermuseet deler i dag det samme fysiske museumsanlegget'
        ],
        primary_angles: ['gårdshistorie', 'herskapskultur', 'arkitektur', 'museumshistorie', 'bevaring'],
        question_families: ['historisk_endring', 'eierhistorie', 'arkitektur', 'institusjonsendring', 'kontrast'],
        avoid_angles: ['generisk_herregard', 'lage_separate_markorer_for_bymuseet_og_teatermuseet'],
        must_include: [
          'omformingen til herskapsgård fra 1747',
          'Bernt Ankers utvidelse og representasjonsbruk',
          'overgangen til museum fra 1909 og dagens Bymuseum/Teatermuseum'
        ],
        contrast_targets: ['vigelandsparken', 'bogstad_gard', 'norsk_folkemuseum'],
        notes: 'Canonical place er det fysiske hovedgårdsanlegget. Bymuseet og Teatermuseet er bruks- og institusjonslag på samme sted, ikke egne kartmarkører.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:12613:58',
      address: { street: 'Halvdan Svartes gate', number: '58', postcode: '0266', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:12613:58',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Halvdan%20Svartes%20gate%2058%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Halvdan Svartes gate 58, OSLO. Punktet brukes som display-marker for Frogner hovedgårds museumskompleks og ikke som områdeanker for hele Frognerparken.',
      externalLinks: [
        { type: 'official', label: 'Oslo Museum – Frogner hovedgård', url: 'https://www.oslomuseum.no/besok-oss/frogner-hovedgard/', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    }
  },
  {
    file: 'data/places/historie/oslo/places_historie/arbeidermuseet.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/arbeidermuseet.json',
    evidenceManifestEntry: 'oslo/historie/arbeidermuseet.json',
    manifestEntry: 'places/historie/oslo/places_historie/arbeidermuseet.json',
    identity: 'Arbeidermuseet, Oslo Museums konkrete besøkssted i Sagveien 28 i det historiske fabrikkmiljøet ved Akerselva',
    overlapNote: '`sagene_kvernhus` er et bredt og sammensatt industrihistorisk områdeanker. Arbeidermuseet er et eget museumssted i Sagveien 28 og skal ikke slås sammen med dette.',
    record: {
      id: 'arbeidermuseet',
      name: 'Arbeidermuseet',
      lat: 59.93093537120987,
      lon: 10.755766647060659,
      r: 60,
      category: 'historie',
      year: 2013,
      desc: 'Oslo Museums besøkssted for byens industri- og arbeiderhistorie, åpnet i 2013 i Sagveien 28 midt i det historiske fabrikkmiljøet ved Akerselva.',
      popupDesc: 'Arbeidermuseet ble opprettet som en del av Oslo Museum i 2013 og åpnet på Sagene i juni samme år. Museet ligger i Sagveien 28, midt i miljøet der Akerselva drev fram en av Norges viktigste industrielle konsentrasjoner på 1800-tallet. Her formidles historiene om fabrikker, arbeid, klasse, hverdagsliv og menneskene som levde av industrien langs elva.\n\nMuseumsstedet er et konkret anker inne i et større historisk landskap. Nærliggende fabrikker, arbeiderboliger, Beierbrua og Akerselva er del av sammenhengen, men de er ikke det samme fysiske stedet. History Go beholder derfor Arbeidermuseet som egen place-record og bruker den bredere industrihistorien som kontekst i stedet for å slå museet sammen med `sagene_kvernhus`.',
      emne_ids: sharedEmner,
      quiz_profile: {
        place_type: 'museum',
        subtype: 'arbeider_og_industrihistorisk_museum',
        signature_features: [
          'opprettet som del av Oslo Museum i 2013',
          'ligger i Sagveien 28 i det gamle fabrikkmiljøet ved Akerselva',
          'formidler Oslos industri- og arbeiderhistorie',
          'bruker det omkringliggende industrilandskapet som en del av museumsopplevelsen',
          'er fysisk separat fra brede industriområde-records langs Akerselva'
        ],
        primary_angles: ['arbeiderhistorie', 'industrialisering', 'hverdagsliv', 'klasse', 'museumshistorie'],
        question_families: ['historisk_endring', 'arbeidsliv', 'hverdagsliv', 'industrimiljo', 'kontrast'],
        avoid_angles: ['generisk_industrimuseum', 'behandle_hele_akerselva_industrien_som_museumsbygget'],
        must_include: [
          'opprettelsen i 2013',
          'plasseringen midt i det historiske industrimiljøet',
          'skillet mellom museet som konkret sted og det større industrilandskapet'
        ],
        contrast_targets: ['sagene_kvernhus', 'myrens_verksted', 'christiania_seildugsfabrik'],
        notes: 'Spør både museet og det konkrete industrimiljøet uten å gjøre Sagveien 28 til en proxy for hele Akerselvas industrihistorie.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:16135:28',
      address: { street: 'Sagveien', number: '28', postcode: '0459', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:16135:28',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Sagveien%2028%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Sagveien 28, OSLO. Punktet brukes som display-marker for Arbeidermuseets konkrete besøkssted og ikke som generelt områdeanker for industrilandskapet langs Akerselva.',
      externalLinks: [
        { type: 'official', label: 'Oslo Museum – Arbeidermuseet', url: 'https://www.oslomuseum.no/besok-oss/arbeidermuseet/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Oslo Museum – om Oslo Museum', url: 'https://www.oslomuseum.no/om-oss/', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    }
  },
  {
    file: 'data/places/historie/oslo/places_historie/nobels_fredssenter.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/nobels_fredssenter.json',
    evidenceManifestEntry: 'oslo/historie/nobels_fredssenter.json',
    manifestEntry: 'places/historie/oslo/places_historie/nobels_fredssenter.json',
    identity: 'Nobels Fredssenter, museet for Nobels fredspris i den tidligere Vestbanestasjonens hovedbygning på Brynjulf Bulls plass 1',
    overlapNote: '`radhusplassen` er et åpent byrom, og `nobelinstituttet` er Nobelkomiteens arbeids- og sekretariatsinstitusjon. Nobels Fredssenter er et separat museum i den tidligere Vestbanestasjonen.',
    record: {
      id: 'nobels_fredssenter',
      name: 'Nobels Fredssenter',
      lat: 59.911609366245315,
      lon: 10.730476225834142,
      r: 60,
      category: 'historie',
      year: 2005,
      desc: 'Museet for Nobels fredspris, åpnet i 2005 i hovedbygningen til den tidligere Vestbanestasjonen fra 1872 ved Rådhusplassen.',
      popupDesc: 'Nobels Fredssenter åpnet 11. juni 2005 som et museum og offentlig møtested for historien om Nobels fredspris, fredsprisvinnerne og temaer som fred, menneskerettigheter, dialog og konfliktløsning. Senteret holder til i hovedbygningen til den tidligere Vestbanestasjonen, som åpnet i 1872 som Oslos vestlige jernbaneterminal.\n\nStedet binder dermed sammen to svært ulike institusjonelle tidslag: først en transportterminal der mennesker ankom og reiste, senere et museum som samler publikum rundt globale spørsmål om fred og konflikt. I History Go er Nobels Fredssenter et eget fysisk sted. `radhusplassen` representerer byrommet utenfor, mens `nobelinstituttet` representerer institusjonen som støtter Nobelkomiteens arbeid.',
      emne_ids: sharedEmner,
      quiz_profile: {
        place_type: 'museum',
        subtype: 'fredsprismuseum_i_ombygd_jernbanestasjon',
        signature_features: [
          'åpnet som Nobels Fredssenter i 2005',
          'holder til i Vestbanestasjonens hovedbygning fra 1872',
          'er museet for Nobels fredspris og fredsprisvinnerne',
          'bruker en tidligere transportterminal som arena for utstillinger og offentlig samtale',
          'er fysisk separat fra både Rådhusplassen og Nobelinstituttet'
        ],
        primary_angles: ['fredsprishistorie', 'institusjonshistorie', 'ombruk', 'menneskerettigheter', 'offentlig_samtale'],
        question_families: ['historisk_endring', 'institusjonsfunksjon', 'ombruk', 'symbolikk', 'kontrast'],
        avoid_angles: ['generisk_fredsmuseum', 'forveksle_med_nobelinstituttet_eller_radhuset'],
        must_include: [
          'åpningen i 2005',
          'Vestbanestasjonens eldre lag fra 1872',
          'forskjellen mellom fredssenteret, Nobelinstituttet og Rådhusplassen'
        ],
        contrast_targets: ['nobelinstituttet', 'radhusplassen', 'oslo_radhus'],
        notes: 'Spør stedet som både fredsprismuseum og ombrukt jernbanestasjon. Ikke gjør det til en generell markør for hele Nobel-systemet i Oslo.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:18199:1',
      address: { street: 'Brynjulf Bulls plass', number: '1', postcode: '0250', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:18199:1',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Brynjulf%20Bulls%20plass%201%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Brynjulf Bulls plass 1, OSLO. Punktet brukes som display-marker for Nobels Fredssenter i den tidligere Vestbanestasjonens hovedbygning, ikke som områdeanker for Rådhusplassen.',
      externalLinks: [
        { type: 'official', label: 'Nobels Fredssenter – om oss', url: 'https://www.nobelpeacecenter.org/om-oss', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Nobels Fredssenter – Vestbanen og byggets historie', url: 'https://www.nobelpeacecenter.org/en/news/a-meeting-place-for-people-and-culture', lang: 'en', verifiedAt: VERIFIED_AT }
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
    requiredEvidence: [
      'entydig offisielt adressepunkt',
      'offisiell institusjons- eller stedsidentitet',
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
      { address: `${p.address.street} ${p.address.number} Oslo`, sourceProvider: 'official_address', sourceObjectId: p.sourceObjectId, canApplyToPlace: true }
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
  'Oslo-tabellen inneholder nå 181 verifiserte eller kildekontrollerte canonical steder. Batch 42 legger til Norsk Folkemuseum, Norsk Maritimt Museum og Historisk museum med entydige offisielle Geonorge-adressepunkter etter fullført duplikat- og overlapaudit. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo-tabellen inneholder nå 184 verifiserte eller kildekontrollerte canonical steder. Batch 43 legger til Frogner hovedgård, Arbeidermuseet og Nobels Fredssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt fysisk avgrensning mot eksisterende parent- og nabosteder. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 42 | `historisk_museum` | Historisk museum | verified | `geonorge-adresser-v1:0301:11941:2` |',
  '| 42 | `historisk_museum` | Historisk museum | verified | `geonorge-adresser-v1:0301:11941:2` |\n| 43 | `frogner_hovedgard` | Frogner hovedgård | verified | `geonorge-adresser-v1:0301:12613:58` |\n| 43 | `arbeidermuseet` | Arbeidermuseet | verified | `geonorge-adresser-v1:0301:16135:28` |\n| 43 | `nobels_fredssenter` | Nobels Fredssenter | verified | `geonorge-adresser-v1:0301:18199:1` |',
  'Batch 43 rows'
);
protocol = replaceOnce(
  protocol,
  'Batch 42 (2026-07-20) produserer tre nye, fysisk selvstendige museumssteder fra den lukkede Oslo-museumsauditen. `norsk_folkemuseum` bruker det entydige Geonorge-punktet for Museumsveien 10 og modelleres separat fra `gol_stavkirke_bygdoy`, som er ett konkret objekt inne i det større museumsområdet. `norsk_maritimt_museum` bruker Bygdøynesveien 37 og er separat fra de nærliggende `frammuseet` og `kon_tiki_museet`. `historisk_museum` bruker Frederiks gate 2 og representerer selve museumsbygningen, mens `tullin` fortsatt er det bredere områdeankeret for Tullinløkka.',
  'Batch 42 (2026-07-20) produserer tre nye, fysisk selvstendige museumssteder fra den lukkede Oslo-museumsauditen. `norsk_folkemuseum` bruker det entydige Geonorge-punktet for Museumsveien 10 og modelleres separat fra `gol_stavkirke_bygdoy`, som er ett konkret objekt inne i det større museumsområdet. `norsk_maritimt_museum` bruker Bygdøynesveien 37 og er separat fra de nærliggende `frammuseet` og `kon_tiki_museet`. `historisk_museum` bruker Frederiks gate 2 og representerer selve museumsbygningen, mens `tullin` fortsatt er det bredere områdeankeret for Tullinløkka.\n\nBatch 43 (2026-07-20) produserer tre videre museumssteder fra samme lukkede audit. `frogner_hovedgard` bruker Halvdan Svartes gate 58 og modellerer selve hovedgårdsanlegget, med Bymuseet og Teatermuseet som nåværende institusjonslag i stedet for separate markører. `arbeidermuseet` bruker Sagveien 28 og holdes fysisk separat fra brede industriområde-records langs Akerselva. `nobels_fredssenter` bruker Brynjulf Bulls plass 1 i den tidligere Vestbanestasjonen og skilles fra både områdeankeret `radhusplassen` og institusjonsstedet `nobelinstituttet`.',
  'Batch 43 note'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 181 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 184 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Created Oslo museum production batch 43 with three canonical places, evidence files, manifests and protocol rows.');
