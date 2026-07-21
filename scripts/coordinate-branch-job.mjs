import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const verifiedAt = '2026-07-21';
const batch = 114;

const placeSpecs = [
  {
    file: 'data/places/natur/oslo/places_natur/bogstadvannet.json',
    evidenceFile: 'data/coordinate-evidence/oslo/natur/bogstadvannet.json',
    evidenceManifestPath: 'oslo/natur/bogstadvannet.json',
    manifestPath: 'places/natur/oslo/places_natur/bogstadvannet.json',
    place: {
      id: 'bogstadvannet',
      name: 'Bogstadvannet',
      category: 'natur',
      lat: 59.9717523,
      lon: 10.6179088,
      r: 220,
      emne_ids: ['em_natur_vatmark_vannspeil_habitat', 'em_natur_naturopplevelse_folkehelse'],
      desc: 'Stor innsjø nederst i Sørkedalen som danner grense mellom Oslo og Bærum og samtidig fungerer som bade-, frilufts- og landskapsområde ved Bogstad.',
      popupDesc: 'Bogstadvannet ligger nederst i Sørkedalen og danner en tydelig landskapsgrense mellom Oslo og Bærum. Vannet er omtrent to kilometer langt, grunt sammenlignet med mange andre innsjøer og har avløp sørover gjennom Lysakerelva. Sørkedalselva renner inn fra nord. Rundt vannet møtes flere typer bruk: bading, roing, tur, golf, gårdslandskap og naturkontakt.\n\nI History Go skal Bogstadvannet behandles som selve innsjøen, ikke som en utvidelse av Bogstad gård. Stedet gjør det mulig å lese hvordan et større vann både er økosystem, kommunegrense, rekreasjonsrom og del av et historisk kulturlandskap. Kartankeret er et områdeanker på den eksakt navngitte vanngeometrien, ikke et påstått sentrum for alle aktiviteter rundt bredden.',
      tags: ['innsjo', 'vann', 'friluftsliv', 'bading', 'sorkedalen', 'bogstad'],
      underbadge_ids: ['innsjo', 'friluftsliv', 'vann', 'habitat'],
      visual: { designCode: 'waterfront_miniature' },
      quiz_profile: {
        place_type: 'innsjo',
        subtype: 'bynar_grenseinnsjo_og_friluftslandskap',
        signature_features: ['ligger nederst i Sørkedalen', 'danner grense mellom Oslo og Bærum', 'kobler innsjønatur med bading, roing og Bogstad-landskapet'],
        primary_angles: ['naturgrunnlag', 'friluftsliv', 'vassdrag', 'grense_og_landskap'],
        question_families: ['gjenkjenning', 'romlig_lesning', 'naturbruk', 'vassdrag'],
        avoid_angles: ['generisk_badevann', 'forveksling_med_bogstad_gard'],
        must_include: ['at canonical identitet er selve innsjøen', 'forholdet mellom Sørkedalselva, Bogstadvannet og Lysakerelva'],
        contrast_targets: ['sognsvann', 'maridalsvannet', 'bogstad_gard'],
        notes: 'Spør som innsjø og vassdrags-/friluftssted, ikke som badeplass alene.'
      },
      locatorType: 'natural_area',
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:4351126',
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'area_anchor',
      coordStatus: 'verified_geometry',
      coordSource: 'osm',
      coordType: 'area_center',
      coordVerifiedAt: verifiedAt,
      coordNote: 'Områdeanker på den eksakt navngitte OSM-vanngeometrien Bogstadvannet, way 4351126. Punktet er Nominatims representasjonspunkt for vannobjektet og brukes som display-/områdeanker; det er ikke et proxyanker for Bogstad gård eller en bestemt badeplass.'
    },
    identity: 'Bogstadvannet as the named lake, distinct from Bogstad gård and individual bathing facilities',
    evidenceProvider: 'osm',
    evidenceName: 'OpenStreetMap exact named water geometry',
    evidenceUrl: 'https://www.openstreetmap.org/way/4351126',
    evidenceObjectId: 'osm-way:4351126',
    evidenceQuality: 'exact_named_geometry_plus_authoritative_place_context',
    finding: 'Exact named OSM way 4351126 is tagged natural=water and identifies Bogstadvannet; the selected point is the geometry representation anchor.',
    nextAction: 'Keep the verified area anchor for the lake and keep Bogstad gård as a separate canonical place.'
  },
  {
    file: 'data/places/by/oslo/places/holmenkollen_kapell.json',
    evidenceFile: 'data/coordinate-evidence/oslo/by/holmenkollen_kapell.json',
    evidenceManifestPath: 'oslo/by/holmenkollen_kapell.json',
    manifestPath: 'places/by/oslo/places/holmenkollen_kapell.json',
    place: {
      id: 'holmenkollen_kapell',
      name: 'Holmenkollen kapell',
      category: 'by',
      year: 1903,
      lat: 59.96566486446608,
      lon: 10.672227570089706,
      r: 60,
      emne_ids: ['em_by_historiske_lag_i_hverdagsrom', 'em_by_romlig_orden'],
      desc: 'Kapell ved Holmenkollen, opprinnelig reist i 1903, innviet som kirke i 1913 og gjenreist etter brannen i 1992.',
      popupDesc: 'Holmenkollen kapell ble reist i 1903 og brukt som bedehus før det ble innviet i 1913. Plasseringen ved skogkanten og Holmenkollen-anlegget gjør kapellet til et tydelig møte mellom kirkebygg, friluftslandskap og en av Oslos mest kjente idrettsarenaer.\n\nDet opprinnelige kapellet brant ned i 1992. Gjenoppbyggingen startet i 1995, og det nye kapellet ble innviet i 1996. I History Go skal stedet derfor leses som ett vedvarende kapellsted med flere bygningslag: den historiske starten i 1903, tapet ved brannen og den gjenreiste bygningen som brukes i dag. Kartpunktet følger den dokumenterte besøksadressen Holmenkollveien 142.',
      tags: ['kirke', 'kapell', 'holmenkollen', 'arkitektur', 'gjenreisning', 'kulturminne'],
      underbadge_ids: ['kirke', 'arkitektur', 'historiske_lag', 'holmenkollen'],
      visual: { designCode: 'church_miniature' },
      quiz_profile: {
        place_type: 'institusjonsbygg',
        subtype: 'gjenreist_markakapell_ved_holmenkollen',
        signature_features: ['opprinnelig reist i 1903', 'innviet i 1913', 'brant i 1992 og ble gjenreist på 1990-tallet'],
        primary_angles: ['kirkearkitektur', 'historiske_lag', 'brann_og_gjenreisning', 'forhold_til_landskap'],
        question_families: ['historisk_endring', 'arkitektur', 'gjenkjenning', 'kontrast'],
        avoid_angles: ['generisk_kirke', 'forveksling_med_holmenkollen_nasjonalanlegg'],
        must_include: ['1903/1913-laget', 'brannen i 1992 og gjenreisningen'],
        contrast_targets: ['frogner_kirke', 'fagerborg_kirke', 'holmenkollen_nasjonalanlegg'],
        notes: 'Spør som et konkret kapellsted med brudd og gjenreisning, ikke bare som pittoresk kirke ved Marka.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:13070:142',
      address: { street: 'Holmenkollveien', number: '142', postcode: '0791', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordType: 'address_point',
      coordVerifiedAt: verifiedAt,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Holmenkollveien 142, OSLO. Punktet brukes som display- og unlock-marker for Holmenkollen kapell-bygningen.',
      externalLinks: [
        { type: 'reference', label: 'VisitOSLO – Holmenkollen kapell', url: 'https://www.visitoslo.com/no/produkt/?name=Holmenkollen-kapell&tlp=2984263', lang: 'nb', verifiedAt }
      ]
    },
    identity: 'Holmenkollen kapell at Holmenkollveien 142, represented as one continuous chapel place across original and rebuilt structures',
    evidenceProvider: 'official_address',
    evidenceName: 'geonorge_adresser_v1',
    evidenceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Holmenkollveien%20142%20Oslo',
    evidenceObjectId: 'geonorge-adresser-v1:0301:13070:142',
    evidenceQuality: 'official_address_plus_current_visitor_source',
    finding: 'Address-first lookup returned one clear official address result for Holmenkollveien 142, matching the documented chapel address.',
    nextAction: 'Keep the verified building-address marker and treat the chapel as distinct from the Holmenkollen sports complex.'
  },
  {
    file: 'data/places/kunst/oslo/places_kunst/kollentrollet.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/kollentrollet.json',
    evidenceManifestPath: 'oslo/kunst/kollentrollet.json',
    manifestPath: 'places/kunst/oslo/places_kunst/kollentrollet.json',
    place: {
      id: 'kollentrollet',
      name: 'Kollentrollet',
      category: 'kunst',
      year: 2002,
      lat: 59.9633497,
      lon: 10.6719057,
      r: 55,
      emne_ids: ['em_kunst_offentlig_kunst_monumenter', 'em_kunst_hverdagsestetikk'],
      desc: 'Monumental trollskulptur av Nils Aas på Gratishaugen ved Holmenkollen, avduket i 2002 som en gave til Oslo.',
      popupDesc: 'Kollentrollet sitter på Gratishaugen og vender mot Holmenkollbakken. Skulpturen bygger på et mindre trollarbeid av Nils Aas og ble forstørret til et monumentalt offentlig kunstverk før avdukingen i 2002. Den store skalaen og plasseringen i et av Oslos mest besøkte frilufts- og idrettslandskap gjør verket til noe annet enn en skulptur i et galleri.\n\nI History Go skal Kollentrollet brukes som et case for offentlig kunst, skala og publikumsbruk. Verket har sin egen fysiske identitet og får derfor eget punkt, selv om det ligger tett på Holmenkollen nasjonalanlegg. Kartankeret er det eksakt navngitte OSM-kunstobjektet og ikke et generelt arenaanker.',
      tags: ['kunst', 'skulptur', 'offentlig_kunst', 'nils_aas', 'holmenkollen', 'troll'],
      underbadge_ids: ['skulptur', 'offentlig_kunst', 'holmenkollen', 'monumental_kunst'],
      visual: { designCode: 'public_art_miniature' },
      quiz_profile: {
        place_type: 'skulptur',
        subtype: 'monumental_offentlig_trollskulptur',
        signature_features: ['står på Gratishaugen', 'monumental trollfigur knyttet til Nils Aas', 'avduket i 2002 med utsyn mot Holmenkollbakken'],
        primary_angles: ['offentlig_kunst', 'skala', 'stedsspesifikk_plassering', 'publikumsbruk'],
        question_families: ['gjenkjenning', 'verk_og_sted', 'skala', 'offentlig_kunst'],
        avoid_angles: ['generisk_trollmytologi', 'forveksling_med_holmenkollen_nasjonalanlegg'],
        must_include: ['Nils Aas', 'Gratishaugen og forholdet til Holmenkollbakken'],
        contrast_targets: ['ekebergparken', 'kragstotten', 'holmenkollen_nasjonalanlegg'],
        notes: 'Spør som offentlig skulptur med ekstrem skala og tydelig plassering, ikke som dekor ved skianlegget.'
      },
      locatorType: 'poi',
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:1768125117',
      geocodeAccuracy: 'geometric_center',
      coordRole: 'display_marker',
      coordStatus: 'verified_geometry',
      coordSource: 'osm',
      coordType: 'poi',
      coordVerifiedAt: verifiedAt,
      coordNote: 'Eksakt navngitt OSM-punkt for kunstverket Kollentrollet, node 1768125117, tagget tourism=artwork og artwork_type=sculpture. Punktet markerer selve skulpturen, ikke Holmenkollen-anlegget generelt.',
      externalLinks: [
        { type: 'reference', label: 'Nils Aas Kunstverksted – Kollentrollet', url: 'https://www.nilsaas.no/utstilling/kunsthandverk-2019-38599', lang: 'nb', verifiedAt },
        { type: 'reference', label: 'VisitOSLO – The Holmenkollen Troll', url: 'https://www.visitoslo.com/en/product/?name=The-Holmenkollen-Troll&tlp=2986963', lang: 'en', verifiedAt }
      ]
    },
    identity: 'The monumental Nils Aas troll sculpture at Gratishaugen, distinct from Holmenkollen nasjonalanlegg',
    evidenceProvider: 'osm',
    evidenceName: 'OpenStreetMap exact named artwork point',
    evidenceUrl: 'https://www.openstreetmap.org/node/1768125117',
    evidenceObjectId: 'osm-node:1768125117',
    evidenceQuality: 'exact_named_object_plus_artist_and_visitor_sources',
    finding: 'Exact named OSM node 1768125117 is tagged tourism=artwork and artwork_type=sculpture and matches the documented Kollentrollet at Gratishaugen.',
    nextAction: 'Keep the exact sculpture point as its own canonical art place.'
  },
  {
    file: 'data/places/natur/oslo/places_natur/vettakollen.json',
    evidenceFile: 'data/coordinate-evidence/oslo/natur/vettakollen.json',
    evidenceManifestPath: 'oslo/natur/vettakollen.json',
    manifestPath: 'places/natur/oslo/places_natur/vettakollen.json',
    place: {
      id: 'vettakollen',
      name: 'Vettakollen',
      category: 'natur',
      lat: 59.9765497,
      lon: 10.6990279,
      r: 100,
      emne_ids: ['em_natur_naturopplevelse_folkehelse'],
      desc: '419 meter høy topp i Nordmarka med vid utsikt over Oslo og fjorden, tydelig fysisk adskilt fra T-banestasjonen og boligområdet med samme navn.',
      popupDesc: 'Vettakollen er en 419 meter høy topp i Nordmarka og et mye brukt utsiktspunkt over Oslo. Navnet brukes også om et boligområde og en T-banestasjon lenger sør, men History Go-stedet representerer selve fjelltoppen.\n\nStedet er et godt eksempel på hvordan nærnaturen rundt byen kan gi en tydelig overgang fra kollektivtransport og boligområder til skog, stigning og utsyn. I quiz og stedsinnhold skal Vettakollen derfor handle om topografi, friluftsliv og byens forhold til Marka. Kartpunktet er den eksakte OSM-toppen, eksplisitt tagget natural=peak og med høyde 419 meter.',
      tags: ['topp', 'utsikt', 'nordmarka', 'friluftsliv', 'marka'],
      underbadge_ids: ['topp', 'utsikt', 'friluftsliv', 'marka'],
      visual: { designCode: 'nature_miniature' },
      quiz_profile: {
        place_type: 'topp',
        subtype: 'bynar_markatopp_og_utsiktspunkt',
        signature_features: ['419 meter høy', 'ligger i Nordmarka', 'vid utsikt over Oslo'],
        primary_angles: ['topografi', 'friluftsliv', 'utsyn', 'by_og_marka'],
        question_families: ['gjenkjenning', 'romlig_lesning', 'naturbruk', 'kontrast'],
        avoid_angles: ['forveksling_med_vettakollen_stasjon', 'generisk_turtips'],
        must_include: ['at stedet er selve 419-meters toppen', 'skillet fra boligområdet og T-banestasjonen'],
        contrast_targets: ['grefsenkollen', 'kolsastoppen', 'vettakollen_stasjon'],
        notes: 'Spør som fysisk topp og utsiktssted, ikke som rute eller stasjon.'
      },
      locatorType: 'poi',
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:301173327',
      geocodeAccuracy: 'geometric_center',
      coordRole: 'display_marker',
      coordStatus: 'verified_geometry',
      coordSource: 'osm',
      coordType: 'peak',
      coordVerifiedAt: verifiedAt,
      coordNote: 'Eksakt navngitt OSM-toppunkt for Vettakollen, node 301173327, tagget natural=peak og ele=419. Punktet representerer fjelltoppen og ikke T-banestasjonen, stopområdet eller boligstrøket med samme navn.'
    },
    identity: 'The 419 metre Vettakollen summit in Nordmarka, not the subway stop or residential suburb',
    evidenceProvider: 'osm',
    evidenceName: 'OpenStreetMap exact named peak point',
    evidenceUrl: 'https://www.openstreetmap.org/node/301173327',
    evidenceObjectId: 'osm-node:301173327',
    evidenceQuality: 'exact_named_peak_plus_topographic_reference',
    finding: 'Exact named OSM node 301173327 is tagged natural=peak and ele=419; same-name station, stop area and suburb objects were explicitly rejected.',
    nextAction: 'Keep the exact summit point as the canonical nature place.'
  },
  {
    file: 'data/places/kunst/oslo/places_kunst/kragstotten.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/kragstotten.json',
    evidenceManifestPath: 'oslo/kunst/kragstotten.json',
    manifestPath: 'places/kunst/oslo/places_kunst/kragstotten.json',
    place: {
      id: 'kragstotten',
      name: 'Kragstøtten',
      category: 'kunst',
      year: 1909,
      lat: 59.9724502,
      lon: 10.6554365,
      r: 55,
      emne_ids: ['em_kunst_offentlig_kunst_monumenter', 'em_kunst_hverdagsestetikk'],
      desc: 'Portrettstatue av veidirektør Hans Hagerup Krag på Voksenkollen, utført av Gustav Lærum og reist i 1909.',
      popupDesc: 'Kragstøtten er en portrettstatue av veidirektør Hans Hagerup Krag, mannen som stod sentralt bak veianleggene i Voksenkollen og Holmenkollen. Monumentet ble utført av Gustav Lærum og reist i 1909. Navnet brukes også om stedet rundt statuen, som har utsikt mot sør og vest.\n\nI History Go skal den canonical markøren være selve minnestatuen. Nærliggende kartobjekter med samme navn – et turveiskilt og et utsiktspunkt – er eksplisitt skilt ut i coordinate-auditen. Stedet kan dermed brukes både til offentlig kunst, monumentkultur og historien om infrastrukturen som gjorde Holmenkollen- og Voksenkollen-området tilgjengelig.',
      tags: ['kunst', 'monument', 'statue', 'hans_hagerup_krag', 'gustav_laerum', 'voksenkollen'],
      underbadge_ids: ['monument', 'offentlig_kunst', 'statue', 'voksenkollen'],
      visual: { designCode: 'public_art_miniature' },
      quiz_profile: {
        place_type: 'monument',
        subtype: 'portrettstatue_og_infrastrukturminne',
        signature_features: ['reist i 1909', 'portrettstatue av Hans Hagerup Krag', 'utført av Gustav Lærum ved Voksenkollveien'],
        primary_angles: ['offentlig_kunst', 'monument', 'infrastrukturhistorie', 'minnekultur'],
        question_families: ['gjenkjenning', 'historie', 'verk_og_person', 'sted_og_infrastruktur'],
        avoid_angles: ['forveksling_med_kragstotten_utsiktspunkt', 'generisk_statuesporsmal'],
        must_include: ['Hans Hagerup Krags rolle i veianleggene', 'Gustav Lærum og 1909'],
        contrast_targets: ['kollentrollet', 'krohgstotten', 'holmenkollen_kapell'],
        notes: 'Spør som offentlig monument med konkret veihistorisk betydning, ikke som utsiktspunkt alene.'
      },
      locatorType: 'poi',
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:484968664',
      geocodeAccuracy: 'geometric_center',
      coordRole: 'display_marker',
      coordStatus: 'verified_geometry',
      coordSource: 'osm',
      coordType: 'poi',
      coordVerifiedAt: verifiedAt,
      coordNote: 'Eksakt navngitt OSM-punkt for Kragstøtten, node 484968664, tagget historic=memorial, memorial=statue og start_date=1909. Punktet representerer selve monumentet; nærliggende guidepost og viewpoint med samme navn er avvist.',
      externalLinks: [
        { type: 'reference', label: 'Oslo byleksikon – Kragstøtten', url: 'https://oslobyleksikon.no/side/Kragst%C3%B8tten', lang: 'nb', verifiedAt }
      ]
    },
    identity: 'The 1909 Hans Hagerup Krag memorial statue, distinct from nearby guidepost and viewpoint objects sharing the name',
    evidenceProvider: 'osm',
    evidenceName: 'OpenStreetMap exact named memorial point',
    evidenceUrl: 'https://www.openstreetmap.org/node/484968664',
    evidenceObjectId: 'osm-node:484968664',
    evidenceQuality: 'exact_named_memorial_plus_local_history_reference',
    finding: 'Exact named OSM node 484968664 is tagged historic=memorial, memorial=statue and start_date=1909; guidepost and viewpoint namesakes were explicitly rejected.',
    nextAction: 'Keep the exact memorial point as its own canonical art place.'
  }
];

const ensureDir = (file) => fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
const writeJson = (file, value) => {
  ensureDir(file);
  fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
};

const placeManifestPath = path.join(root, 'data/places/manifest.json');
const placeManifest = JSON.parse(fs.readFileSync(placeManifestPath, 'utf8'));
if (!Array.isArray(placeManifest.files)) throw new Error('data/places/manifest.json mangler files-array');

const evidenceManifestPath = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceManifest = JSON.parse(fs.readFileSync(evidenceManifestPath, 'utf8'));
if (!Array.isArray(evidenceManifest.files)) throw new Error('data/coordinate-evidence/manifest.json mangler files-array');

const indexPath = path.join(root, 'data/places/places_index.json');
const indexRaw = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const indexPlaces = Array.isArray(indexRaw) ? indexRaw : Array.isArray(indexRaw?.places) ? indexRaw.places : [];
const activeIds = new Set(indexPlaces.map((p) => p?.id).filter(Boolean));
for (const spec of placeSpecs) {
  if (activeIds.has(spec.place.id)) throw new Error(`Duplicate canonical placeId already active: ${spec.place.id}`);
  if (fs.existsSync(path.join(root, spec.file))) throw new Error(`Place file already exists: ${spec.file}`);
  if (fs.existsSync(path.join(root, spec.evidenceFile))) throw new Error(`Evidence file already exists: ${spec.evidenceFile}`);
}

for (const spec of placeSpecs) {
  writeJson(spec.file, spec.place);
  if (!placeManifest.files.includes(spec.manifestPath)) placeManifest.files.push(spec.manifestPath);

  const currentCoordinate = {
    lat: spec.place.lat,
    lon: spec.place.lon,
    r: spec.place.r,
    coordStatus: spec.place.coordStatus,
    coordSource: spec.place.coordSource,
    coordType: spec.place.coordType,
    coordNote: spec.place.coordNote
  };
  const evidence = {
    placeId: spec.place.id,
    placeFile: spec.file,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate,
    identity: {
      currentName: spec.place.name,
      resolvedIdentity: spec.identity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: spec.place.locatorType,
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: [
      'active canonical duplicate audit',
      spec.place.sourceProvider === 'official_address' ? 'normative Geonorge address-first result' : 'exact named source object with matching physical object type',
      'independent identity/context source where applicable'
    ],
    evidence: [
      {
        sourceProvider: spec.evidenceProvider,
        sourceName: spec.evidenceName,
        sourceUrl: spec.evidenceUrl,
        sourceObjectId: spec.evidenceObjectId,
        sourceQuality: spec.evidenceQuality,
        finding: spec.finding,
        canVerifyCoordinate: true,
        reason: spec.place.coordNote
      }
    ],
    addressCandidates: spec.place.address ? [
      {
        address: `${spec.place.address.street} ${spec.place.address.number} Oslo`,
        sourceProvider: spec.place.sourceProvider,
        sourceObjectId: spec.place.sourceObjectId,
        canApplyToPlace: true
      }
    ] : [],
    sourceObjectCandidates: [
      {
        sourceProvider: spec.place.sourceProvider,
        sourceObjectId: spec.place.sourceObjectId,
        canApplyToPlace: true
      }
    ],
    geometryCandidates: spec.place.sourceProvider === 'osm' ? [
      {
        sourceProvider: 'osm',
        sourceObjectId: spec.place.sourceObjectId,
        canApplyToPlace: true
      }
    ] : [],
    coordinateCandidates: [
      {
        lat: spec.place.lat,
        lon: spec.place.lon,
        coordRole: spec.place.coordRole,
        canApplyToPlace: true
      }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: spec.nextAction
    },
    notes: [spec.place.coordNote]
  };
  writeJson(spec.evidenceFile, evidence);
  if (!evidenceManifest.files.includes(spec.evidenceManifestPath)) evidenceManifest.files.push(spec.evidenceManifestPath);
}

writeJson('data/places/manifest.json', placeManifest);
writeJson('data/coordinate-evidence/manifest.json', evidenceManifest);

const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
let protocol = fs.readFileSync(protocolPath, 'utf8');
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Fant ikke Oslo-teller i koordinatprotokollen');
const currentCount = Number(countMatch[1]);
if (currentCount !== 274) throw new Error(`Forventet Oslo-teller 274 på batch-114-baseline, fant ${currentCount}`);
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 274 dokumenterte verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 279 dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 114 produserer fem stabile Holmenkollen-kandidater fra VisitOSLO-auditen: Bogstadvannet, Holmenkollen kapell, Kollentrollet, Vettakollen og Kragstøtten.'
);
const rows = [
  '| 114 | `bogstadvannet` | Bogstadvannet | verified_geometry | `osm-way:4351126` |',
  '| 114 | `holmenkollen_kapell` | Holmenkollen kapell | verified | `geonorge-adresser-v1:0301:13070:142` |',
  '| 114 | `kollentrollet` | Kollentrollet | verified_geometry | `osm-node:1768125117` |',
  '| 114 | `vettakollen` | Vettakollen | verified_geometry | `osm-node:301173327` |',
  '| 114 | `kragstotten` | Kragstøtten | verified_geometry | `osm-node:484968664` |'
];
const lines = protocol.split('\n');
const row112 = lines.findIndex((line) => line.startsWith('| 112 |'));
if (row112 < 0) throw new Error('Fant ikke batch-112-raden i protokollen');
lines.splice(row112 + 1, 0, ...rows);
const batch113 = lines.findIndex((line) => line.startsWith('Batch 113 (2026-07-21)'));
if (batch113 < 0) throw new Error('Fant ikke batch-113-avsnittet i protokollen');
lines.splice(batch113 + 1, 0, '', 'Batch 114 (2026-07-21) produserer fem fysisk selvstendige Holmenkollen-steder fra den lukkede VisitOSLO-auditen. `holmenkollen_kapell` bruker det entydige Geonorge-adressepunktet for Holmenkollveien 142. `bogstadvannet` bruker et områdeanker på eksakt navngitt vanngeometri, mens `kollentrollet`, `vettakollen` og `kragstotten` bruker eksakte navngitte OSM-punktobjekter med riktig objekttype. Vettakollen-stasjon/-bydel og Kragstøtten-guidepost/-utsiktspunkt er eksplisitt avvist som navnelike feilobjekter. Oslo Golfklubb Bogstad holdes utenfor batchen til representasjonsrollen mellom klubbhusadresse og golfbanegeometri er eksplisitt avgjort.');
protocol = lines.join('\n').replace('- Neste nye Oslo-kontroll er batch 114.', '- Neste nye Oslo-kontroll er batch 115.');
fs.writeFileSync(protocolPath, protocol);

fs.rmSync(fileURLToPath(import.meta.url));
console.log('Produserte VisitOSLO Holmenkollen batch 114: bogstadvannet, holmenkollen_kapell, kollentrollet, vettakollen, kragstotten.');
