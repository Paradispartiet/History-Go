import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-27';

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const writeText = (rel, value) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
};

const places = [
  {
    id: 'bitraf',
    name: 'Bitraf',
    lat: 59.92035190289846,
    lon: 10.752792129992647,
    r: 70,
    category: 'vitenskap',
    secondaryBadgeIds: ['teknologi'],
    year: 2021,
    desc: 'Aktivt makerspace der elektronikk, digital fabrikasjon, maskinering og prototyping utføres i verksteder ved Akerselva.',
    image: '',
    cardImage: '',
    popupDesc: 'Bitraf er et medlemsdrevet makerspace og teknologiverksted i Brenneriveien 9. Foreningen flyttet hit i 2021 og disponerer verksteder der medlemmer kan utvikle, bygge, teste og reparere fysiske og digitale løsninger.\n\nStedet har konkrete teknologiske arbeidsmiljøer for elektronikk, overflatemontering, 3D-printing, laserkutting, CNC-fresing, tre- og metallarbeid. Teknologien er derfor ikke en skjult støttefunksjon i bygget: den er selve aktiviteten som foregår her.\n\nBitraf viser hvordan en idé kan gå fra krav og skisse til prototype, måling, feilretting og ny versjon. Stedet gjør også produksjonskunnskap tilgjengelig utenfor universiteter og kommersielle utviklingsavdelinger.\n\nKartpunktet markerer besøksadressen og den offentlige inngangen til makerspacet. Tilgang til enkelte maskiner krever medlemskap eller sikkerhetsopplæring, og stedskortet skal ikke love fri bruk av verkstedutstyret.',
    emne_ids: [
      'em_vit_abstraksjon_forenkling',
      'em_tek_ingeniorprosess_krav_og_design',
      'em_tek_prototyper_forsok_og_validering',
      'em_tek_produksjonsprosesser_toleranser_kvalitet',
      'em_tek_kretser_komponenter_og_maling'
    ],
    underbadge_ids: [
      'teknologi_og_ingeniorfag',
      'materialer_og_produksjon',
      'elektronikk',
      'robotikk_og_automatisering'
    ],
    quiz_profile: {
      place_type: 'makerspace',
      subtype: 'aktivt_prototype_og_fabrikasjonsverksted',
      signature_features: [
        'medlemsdrevet makerspace i Brenneriveien 9',
        'elektronikk, 3D-printing, CNC og laserkutting',
        'prototyping og reparasjon utføres på stedet'
      ],
      primary_angles: ['designprosess', 'prototype', 'produksjon', 'elektronikk', 'feilretting'],
      question_families: ['mekanisme', 'prosessrekkefolge', 'verktoy_og_formal', 'feildiagnose', 'begrunnet_designvalg'],
      avoid_angles: ['generisk_kreativitet', 'kontorfellesskap', 'teknologi_som_buzzord'],
      must_include: [
        'at teknologien bygges og testes på stedet',
        'minst én konkret produksjons- eller måleprosess',
        'at enkelte maskiner krever opplæring'
      ]
    },
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-address-v1:0301:brenneriveien-9:59.92035190,10.75279213',
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-address-v1:0301:brenneriveien-9:59.92035190,10.75279213',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Brenneriveien&nummer=9&kommunenummer=0301&treffPerSide=20',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: 'Offisielt Kartverket/Geonorge-adressepunkt for Brenneriveien 9 brukes som byggpunkt. Bitrafs egne sider bekrefter besøksadressen og beskriver inngangen til makerspacet i byggets andre etasje. Radius 70 meter dekker den aktuelle bygningsdelen uten å gjøre hele Vulkan-området til samme sted.',
    address: { street: 'Brenneriveien', number: '9', postcode: '0182', city: 'Oslo', country: 'NO' },
    externalLinks: [
      { type: 'official', label: 'Bitraf – hvor er Bitraf?', url: 'https://bitraf.no/hvor-er-bitraf/', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'official', label: 'Bitraf – makerspace og utstyr', url: 'https://bitraf.no/', lang: 'nb', verifiedAt: VERIFIED_AT }
    ]
  },
  {
    id: 'tandbergs_radiofabrikk_kjelsas',
    name: 'Tandbergs Radiofabrikk på Kjelsås',
    lat: 59.96851908911736,
    lon: 10.772328336306844,
    r: 110,
    category: 'vitenskap',
    secondaryBadgeIds: ['teknologi'],
    year: 1951,
    desc: 'Tidligere fabrikk- og forskningsanlegg for radio, båndopptakere, fjernsyn, profesjonell elektronikk og datateknologi.',
    image: '',
    cardImage: '',
    popupDesc: 'Tandbergs nye fabrikkanlegg på Kjelsås stod ferdig ved årsskiftet 1950–1951. Her ble radioapparater, høyttalere, mikrofoner, båndopptakere og senere fjernsyn utviklet og produsert i stor skala.\n\nI 1962 fikk anlegget et eget laboratorium og forskningsbygg. Virksomheten utvidet seg videre til profesjonell elektronikk og datateknologi, slik at stedet samlet produktutvikling, måling, produksjon, kvalitetskontroll og forskning.\n\nStedet er teknologisk fordi konkrete elektroniske produkter og produksjonsprosesser ble utviklet her, ikke fordi bygningen bare huset et teknologiselskap. Tandberg-miljøet ble utgangspunkt for senere virksomheter innen datalagring, videokonferanse og kringkastingsteknologi.\n\nDen tidligere fabrikkbygningen er bevart og markert med blått kulturhistorisk skilt. Kartpunktet markerer Kjelsåsveien 161 og fabrikkankeret, ikke hele boligområdet som senere ble utviklet rundt anlegget.',
    emne_ids: [
      'em_vit_hist_teknologi',
      'em_tek_kretser_komponenter_og_maling',
      'em_tek_produksjonsprosesser_toleranser_kvalitet',
      'em_tek_teknologihistorie_sti_og_innelasing',
      'em_tek_standarder_infrastruktur_interoperabilitet'
    ],
    underbadge_ids: ['elektronikk', 'materialer_og_produksjon', 'datamaskiner_og_programvare', 'teknologihistorie'],
    quiz_profile: {
      place_type: 'historic_factory',
      subtype: 'elektronikkfabrikk_med_laboratorium_og_forskning',
      signature_features: [
        'fabrikkanlegg i Kjelsåsveien 161',
        'radio, båndopptakere og fjernsyn',
        'laboratorium og forskningsbygg fra 1962',
        'blått kulturhistorisk skilt'
      ],
      primary_angles: ['elektronikk', 'serieproduksjon', 'kvalitetskontroll', 'forskning_og_utvikling', 'teknologisk_stiavhengighet'],
      question_families: ['historisk_endring', 'produksjonsprosess', 'komponent_og_funksjon', 'standard_og_kompatibilitet', 'feil_og_kvalitet'],
      avoid_angles: ['generisk_bedriftshistorie', 'varemerkegjetting', 'boligomradet_i_dag'],
      must_include: ['konkrete produkter', 'koblingen mellom laboratorium og produksjon', 'fabrikkstedet på Kjelsås']
    },
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-address-v1:0301:kjelsasveien-161:59.96851909,10.77232834',
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-address-v1:0301:kjelsasveien-161:59.96851909,10.77232834',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Kjels%C3%A5sveien&nummer=161&kommunenummer=0301&treffPerSide=20',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: 'Offisielt Kartverket/Geonorge-adressepunkt for Kjelsåsveien 161 brukes som byggpunkt for den tidligere Tandberg-fabrikken. Oslo byleksikon dokumenterer samme adresse, fabrikkanlegget, forskningsbygget og det blå skiltet. Radius 110 meter dekker det sentrale fabrikkankeret, men ikke hele det senere boligkomplekset.',
    address: { street: 'Kjelsåsveien', number: '161', postcode: '0884', city: 'Oslo', country: 'NO' },
    externalLinks: [
      { type: 'reference', label: 'Oslo byleksikon – Tandbergs Radiofabrikk', url: 'https://oslobyleksikon.no/side/Tandbergs_Radiofabrikk', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'reference', label: 'Store norske leksikon – Tandbergs Radiofabrikk', url: 'https://snl.no/Tandbergs_Radiofabrikk', lang: 'nb', verifiedAt: VERIFIED_AT }
    ]
  },
  {
    id: 'radionette_fodested_bygdoy_alle_67',
    name: 'Radionettes fødested',
    lat: 59.918959,
    lon: 10.702483,
    r: 35,
    category: 'vitenskap',
    secondaryBadgeIds: ['teknologi'],
    year: 1927,
    desc: 'Bygningen der Jan Wessel startet Radionette-produksjonen og utviklet en tidlig radio for direkte tilkobling til lysnettet.',
    image: '',
    cardImage: '',
    popupDesc: 'I Bygdøy allé 67 startet Jan Wessel produksjonen av Radionette på gutterommet i familiens hjem i 1927. Det lille produksjonsstedet ble begynnelsen på det som regnes som Norges første radiofabrikk.\n\nWessels tidlige gjennombrudd var en enkel radiomottaker som kunne kobles direkte til lysnettet. Løsningen gjorde radioen mindre avhengig av batterier og viser hvordan et konkret brukerbehov kunne omformes til kretsdesign, komponentvalg og et produkt som kunne produseres.\n\nProduksjonen flyttet raskt videre til større lokaler, men oppfinnelses- og etableringspunktet er stedsspesifikt. Det kan ikke erstattes med et tilfeldig bolighus eller med Radionettes senere fabrikk uten å miste historien om den første prototypen og oppstarten.\n\nEt blått kulturhistorisk skilt på fasaden markerer forbindelsen. Kartpunktet er derfor et lite fasade- og minneanker med kort radius, ikke et stort fabrikk- eller områdepunkt.',
    emne_ids: [
      'em_vit_hist_teknologi',
      'em_tek_kretser_komponenter_og_maling',
      'em_tek_ingeniorprosess_krav_og_design',
      'em_tek_teknologihistorie_sti_og_innelasing'
    ],
    underbadge_ids: ['elektronikk', 'teknologi_og_ingeniorfag', 'teknologihistorie'],
    quiz_profile: {
      place_type: 'technology_microplace',
      subtype: 'oppfinnelses_og_etableringssted_med_blatt_skilt',
      signature_features: [
        'Bygdøy allé 67',
        'produksjonsstart på gutterommet i 1927',
        'radio koblet direkte til lysnettet',
        'blått kulturhistorisk skilt'
      ],
      primary_angles: ['behov_og_design', 'elektronisk_krets', 'prototype_til_produksjon', 'teknologihistorie'],
      question_families: ['stedsgjenkjenning', 'mekanisme', 'designbegrunnelse', 'historisk_endring'],
      avoid_angles: ['generisk_radiohistorie', 'senere_fabrikker_som_hovedsted', 'varemerkegjetting'],
      must_include: ['den direkte lysnettilkoblingen', 'at produksjonen startet her', 'det blå skiltet som fysisk anker']
    },
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-address-v1:0301:bygdoy-alle-67:59.91895900,10.70248300',
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-address-v1:0301:bygdoy-alle-67:59.91895900,10.70248300',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Bygd%C3%B8y%20all%C3%A9&nummer=67&kommunenummer=0301&treffPerSide=20',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: 'Kartverket/Geonorge-adressepunktet for Bygdøy allé 67 brukes som fasade- og byggpunkt. Oslo byleksikon og Lokalhistoriewiki dokumenterer produksjonsstarten i bygningen og det blå skiltet. Radius 35 meter holder mikroplassen avgrenset til den aktuelle fasaden og eiendommen.',
    address: { street: 'Bygdøy allé', number: '67', postcode: '0265', city: 'Oslo', country: 'NO' },
    externalLinks: [
      { type: 'reference', label: 'Oslo byleksikon – Radionette', url: 'https://oslobyleksikon.no/side/Radionette', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'reference', label: 'Lokalhistoriewiki – Radionette Norsk Radiofabrikk', url: 'https://lokalhistoriewiki.no/Radionette_Norsk_Radiofabrikk', lang: 'nb', verifiedAt: VERIFIED_AT }
    ]
  },
  {
    id: 'stk_pex_kabeltarnet',
    name: 'STK PEX-kabeltårnet',
    lat: 59.927639,
    lon: 10.816681,
    r: 75,
    category: 'vitenskap',
    secondaryBadgeIds: ['teknologi'],
    year: 1962,
    desc: 'Det høye produksjonstårnet der Standard Telefon og Kabelfabrik fremstilte avanserte PEX- og høyspentkabler.',
    image: '',
    cardImage: '',
    popupDesc: 'PEX-tårnet i Kabelgata 51 ble reist i 1962 som del av Standard Telefon og Kabelfabriks store anlegg på Økern. Den høye, smale bygningen var ikke et vanlig administrasjonstårn: høyden inngikk i selve kabelproduksjonen.\n\nSTK produserte telekabler, telefonsentraler, instrumenter og elektronikk, og utviklet også internasjonalt anerkjent teknologi for kraft- og sjøkabler. I tårnet kunne isolasjon og kabelmaterialer bearbeides gjennom en lang vertikal produksjonslinje.\n\nStedet kvalifiserer som teknologi fordi den bevarte bygningen er en konkret produksjonsmaskin i arkitektonisk skala. Telefonnettet og strømnettet hører som bysystemer under Infrastruktur, mens tårnet handler om hvordan kabelen ble utviklet og fremstilt.\n\nTårnet er senere omformet til kulturarena, men industrielle detaljer og den tydelige bygningsformen er bevart. Kartpunktet markerer selve tårnbygningen ved Kabelgata 51.',
    emne_ids: [
      'em_vit_hist_teknologi',
      'em_tek_materialstruktur_og_egenskaper',
      'em_tek_produksjonsprosesser_toleranser_kvalitet',
      'em_tek_kretser_komponenter_og_maling',
      'em_tek_teknologihistorie_sti_og_innelasing'
    ],
    underbadge_ids: ['materialer_og_produksjon', 'elektronikk', 'digital_infrastruktur', 'teknologihistorie'],
    quiz_profile: {
      place_type: 'historic_industrial_tower',
      subtype: 'vertikalt_produksjonsanlegg_for_pex_og_hoyspentkabel',
      signature_features: [
        'Kabelgata 51',
        'produksjonstårn fra 1962',
        'brukt til fremstilling av PEX-kabler',
        'del av Standard Telefon og Kabelfabrik'
      ],
      primary_angles: ['materialteknologi', 'kabelproduksjon', 'vertikal_prosesslinje', 'isolasjon', 'teknologisk_ombruk'],
      question_families: ['mekanisme', 'hvorfor_bygget_ser_slik_ut', 'materialvalg', 'produksjonsrekkefolge', 'historisk_endring'],
      avoid_angles: ['kulturarena_som_hovedtema', 'telefonnettet_som_byinfrastruktur', 'generisk_industrihistorie'],
      must_include: ['at tårnhøyden hadde produksjonsfunksjon', 'PEX- eller høyspentkabel', 'skillet mellom kabelproduksjon og byinfrastruktur']
    },
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-address-v1:0301:kabelgata-51:59.92763900,10.81668100',
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-address-v1:0301:kabelgata-51:59.92763900,10.81668100',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Kabelgata&nummer=51&kommunenummer=0301&treffPerSide=20',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: 'Kartverket/Geonorge-adressepunktet for Kabelgata 51 brukes som byggpunkt for det bevarte PEX-tårnet. Tårnet Kulturarena, Oxer Eiendom og Oslo kommune dokumenterer samme adresse, byggeåret og den opprinnelige kabelproduksjonen. Radius 75 meter dekker tårnbygningen og nærmeste fotavtrykk, ikke hele STK-området.',
    address: { street: 'Kabelgata', number: '51', postcode: '0581', city: 'Oslo', country: 'NO' },
    externalLinks: [
      { type: 'official', label: 'Tårnet Kulturarena – tårnets historie', url: 'https://www.taarnetkulturarena.no/om-tarnet', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'official', label: 'Oxer Eiendom – transformasjon av kabeltårnet', url: 'https://www.oxer.no/naeringseiendom/tarnet/', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'government', label: 'Oslo kommune – kabelfabrikk blir kulturfabrikk', url: 'https://magasin.oslo.kommune.no/byplan/kabelfabrikk-blir-kulturfabrikk', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'reference', label: 'Store norske leksikon – Standard Telefon og Kabelfabrik', url: 'https://snl.no/Standard_Telefon_og_Kabelfabrik', lang: 'nb', verifiedAt: VERIFIED_AT }
    ]
  },
  {
    id: 'sintef_minalab',
    name: 'SINTEF MiNaLab',
    lat: 59.943728,
    lon: 10.718136,
    r: 75,
    category: 'vitenskap',
    secondaryBadgeIds: ['teknologi'],
    year: 2004,
    desc: 'Renromslaboratorium for utvikling, prototyping og småskalaproduksjon av mikrobrikker, sensorer og mikrosystemer.',
    image: '',
    cardImage: '',
    popupDesc: 'MiNaLab åpnet i 2004 som et felles løft for mikro- og nanoteknologi. Laboratoriet i Gaustadalléen 23C har et høyteknologisk renrom på omkring 800 kvadratmeter og en komplett prosesslinje for silisiumbrikker.\n\nHer utvikles, prototypetestes og produseres sensorbrikker og mikrosystemer i små serier. Arbeidet omfatter blant annet tynnfilmprosesser, litografi, etsing, termiske prosesser, elektrisk karakterisering og kvalitetsstyring.\n\nMiNaLab er derfor både et vitenskapelig laboratorium og et teknologisk produksjonssted. Målinger og materialkunnskap brukes til å bygge fysiske komponenter som kan inngå i medisin, romfart, industri, energi og partikkelfysikk.\n\nRenrommet har adgangskontroll. Kartpunktet markerer den offentlige besøksadressen og laboratoriebygningen, men stedskortet skal ikke gi inntrykk av at publikum kan gå inn i produksjonsområdene uten avtale.',
    emne_ids: [
      'em_vit_abstraksjon_forenkling',
      'em_vit_algoritmer_data',
      'em_tek_materialstruktur_og_egenskaper',
      'em_tek_produksjonsprosesser_toleranser_kvalitet',
      'em_tek_kretser_komponenter_og_maling',
      'em_tek_signaler_sensorer_og_stoy'
    ],
    underbadge_ids: ['teknologi_og_ingeniorfag', 'materialer_og_produksjon', 'elektronikk'],
    quiz_profile: {
      place_type: 'research_and_fabrication_laboratory',
      subtype: 'mikrobrikke_og_sensorlaboratorium_med_renrom',
      signature_features: [
        'Gaustadalléen 23C',
        'åpnet i 2004',
        'omkring 800 kvadratmeter renrom',
        'komplett silisiumprosesslinje',
        'sensorutvikling og småskalaproduksjon'
      ],
      primary_angles: ['mikrofabrikasjon', 'materialprosess', 'sensor', 'målekjede', 'prototyping_og_kvalitet'],
      question_families: ['prosessrekkefolge', 'materiale_og_egenskap', 'sensor_og_signal', 'renrom_og_forurensning', 'validering_og_kvalitet'],
      avoid_angles: ['fri_offentlig_adgang', 'generisk_forskningspark', 'mikrobrikke_som_buzzord'],
      must_include: ['renrommet', 'komplett prosesslinje', 'skillet mellom forskning, prototype og småskalaproduksjon', 'adgangsbegrensningen']
    },
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: 'geonorge-address-v1:0301:gaustadalleen-23c:59.94372800,10.71813600',
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: 'geonorge-address-v1:0301:gaustadalleen-23c:59.94372800,10.71813600',
    coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Gaustadall%C3%A9en&nummer=23&bokstav=C&kommunenummer=0301&treffPerSide=20',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: 'Kartverket/Geonorge-adressepunktet for Gaustadalléen 23C brukes som byggpunkt. SINTEF oppgir samme besøksadresse og dokumenterer MiNaLabs renrom, sensorutvikling og mikrobrikkeproduksjon. Radius 75 meter dekker laboratoriebygningen uten å gjøre hele Forskningsparken eller Gaustadbekkdalen til samme sted.',
    address: { street: 'Gaustadalléen', number: '23C', postcode: '0373', city: 'Oslo', country: 'NO' },
    externalLinks: [
      { type: 'official', label: 'SINTEF – MiNaLab', url: 'https://www.sintef.no/laboratorier/minalab/', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'official', label: 'SINTEF – MiNaLab fyller 10 år', url: 'https://www.sintef.no/siste-nytt/2014/minalab-fyller-10-ar/', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'official', label: 'NorFab – SINTEF MiNaLab', url: 'https://norfab.no/labs/sintef-minalab/', lang: 'en', verifiedAt: VERIFIED_AT }
    ]
  }
];

const placePath = (id) => `data/places/vitenskap/oslo/places_vitenskap/${id}.json`;
const manifestPath = (id) => `places/vitenskap/oslo/places_vitenskap/${id}.json`;
const evidencePath = (id) => `data/coordinate-evidence/oslo/vitenskap/${id}.json`;
const evidenceManifestPath = (id) => `oslo/vitenskap/${id}.json`;

const evidenceSources = {
  bitraf: [
    ['official_address', 'Kartverket/Geonorge – Brenneriveien 9', places[0].coordSourceUrl, places[0].sourceObjectId, 'official_address', 'Offisielt adressepunkt for Brenneriveien 9.', true, 'Canonical byggpunkt under address-first policy.'],
    ['manual_research', 'Bitraf – hvor er Bitraf?', 'https://bitraf.no/hvor-er-bitraf/', 'bitraf:hvor-er-bitraf', 'official_current_site', 'Bitraf bekrefter besøksadressen og beskriver inngangen.', false, 'Identitets- og adressekryssjekk.']
  ],
  tandbergs_radiofabrikk_kjelsas: [
    ['official_address', 'Kartverket/Geonorge – Kjelsåsveien 161', places[1].coordSourceUrl, places[1].sourceObjectId, 'official_address', 'Offisielt adressepunkt for Kjelsåsveien 161.', true, 'Canonical byggpunkt under address-first policy.'],
    ['manual_research', 'Oslo byleksikon – Tandbergs Radiofabrikk', 'https://oslobyleksikon.no/side/Tandbergs_Radiofabrikk', 'oslo-byleksikon:tandbergs-radiofabrikk', 'documented_place_identity', 'Kilden dokumenterer fabrikkadressen, laboratoriet, forskningsbygget og det blå skiltet.', false, 'Historisk identitets- og funksjonskryssjekk.']
  ],
  radionette_fodested_bygdoy_alle_67: [
    ['official_address', 'Kartverket/Geonorge – Bygdøy allé 67', places[2].coordSourceUrl, places[2].sourceObjectId, 'official_address', 'Offisielt adressepunkt for Bygdøy allé 67.', true, 'Canonical fasade- og byggpunkt under address-first policy.'],
    ['manual_research', 'Oslo byleksikon – Radionette', 'https://oslobyleksikon.no/side/Radionette', 'oslo-byleksikon:radionette', 'documented_place_identity', 'Kilden dokumenterer produksjonsstarten i bygningen og det blå skiltet.', false, 'Historisk identitets- og funksjonskryssjekk.']
  ],
  stk_pex_kabeltarnet: [
    ['official_address', 'Kartverket/Geonorge – Kabelgata 51', places[3].coordSourceUrl, places[3].sourceObjectId, 'official_address', 'Offisielt adressepunkt for Kabelgata 51.', true, 'Canonical byggpunkt under address-first policy.'],
    ['manual_research', 'Tårnet Kulturarena – vår historie', 'https://www.taarnetkulturarena.no/om-tarnet', 'tarnet-kulturarena:historie', 'official_current_site', 'Kilden dokumenterer adressen, byggeåret og produksjonen av PEX-kabler.', false, 'Identitets- og funksjonskryssjekk.'],
    ['municipality', 'Oslo kommune – kabelfabrikk blir kulturfabrikk', 'https://magasin.oslo.kommune.no/byplan/kabelfabrikk-blir-kulturfabrikk', 'oslo-kommune:kabeltarnet', 'municipal_history', 'Kilden dokumenterer at tårnet ble brukt til avansert høyspentkabelproduksjon.', false, 'Kommunal historikk- og funksjonskryssjekk.']
  ],
  sintef_minalab: [
    ['official_address', 'Kartverket/Geonorge – Gaustadalléen 23C', places[4].coordSourceUrl, places[4].sourceObjectId, 'official_address', 'Offisielt adressepunkt for Gaustadalléen 23C.', true, 'Canonical byggpunkt under address-first policy.'],
    ['manual_research', 'SINTEF – MiNaLab', 'https://www.sintef.no/laboratorier/minalab/', 'sintef:minalab', 'official_current_site', 'SINTEF dokumenterer besøksadressen, renrommet, sensorutviklingen og produksjonen.', false, 'Institusjons-, adresse- og funksjonskryssjekk.'],
    ['manual_research', 'SINTEF – MiNaLab fyller 10 år', 'https://www.sintef.no/siste-nytt/2014/minalab-fyller-10-ar/', 'sintef:minalab-10-ar', 'official_history', 'SINTEF dokumenterer åpningen i 2004 og laboratoriets teknologiske virksomhet.', false, 'Historisk kryssjekk.']
  ]
};

function makeEvidence(place) {
  const sources = evidenceSources[place.id].map(([sourceProvider, sourceName, sourceUrl, sourceObjectId, sourceQuality, finding, canVerifyCoordinate, reason]) => ({
    sourceProvider,
    sourceName,
    sourceUrl,
    sourceObjectId,
    sourceQuality,
    finding,
    canVerifyCoordinate,
    reason
  }));
  return {
    schemaVersion: '1.0',
    placeId: place.id,
    placeFile: placePath(place.id),
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'candidate_ready_for_production',
    currentCoordinate: {
      lat: place.lat,
      lon: place.lon,
      r: place.r,
      coordStatus: place.coordStatus,
      coordSource: place.coordSource,
      coordType: place.coordType,
      coordNote: place.coordNote
    },
    identity: {
      currentName: place.name,
      resolvedIdentity: `${place.name}, ${place.address.street} ${place.address.number}, ${place.address.postcode} ${place.address.city}`,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: place.locatorType,
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['offisiell adresse', 'stedets dokumenterte teknologiske identitet', 'avgrenset fysisk kartanker'],
    evidence: sources,
    addressCandidates: [{
      address: `${place.address.street} ${place.address.number}, ${place.address.postcode} ${place.address.city}`,
      sourceProvider: 'official_address',
      sourceObjectId: place.sourceObjectId,
      lat: place.lat,
      lon: place.lon,
      canApplyToPlace: true
    }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{
      sourceProvider: 'official_address',
      sourceObjectId: place.sourceObjectId,
      lat: place.lat,
      lon: place.lon,
      coordRole: place.coordRole,
      canApplyToPlace: true
    }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Koordinaten og kildekontrakten er anvendt i canonical place-fil.' },
    notes: [place.coordNote]
  };
}

for (const place of places) {
  writeJson(placePath(place.id), place);
  writeJson(evidencePath(place.id), makeEvidence(place));
}

const manifest = readJson('data/places/manifest.json');
if (!Array.isArray(manifest.files)) throw new Error('data/places/manifest.json mangler files[]');
const newManifestFiles = places.map((place) => manifestPath(place.id));
manifest.files = manifest.files.filter((entry) => !newManifestFiles.includes(entry));
const placeAnchor = manifest.files.indexOf('places/vitenskap/oslo/places_vitenskap/teknisk_museum.json');
manifest.files.splice(placeAnchor >= 0 ? placeAnchor + 1 : manifest.files.length, 0, ...newManifestFiles);
manifest.layout = 'one_file_per_place_v1';
writeJson('data/places/manifest.json', manifest);

const evidenceManifest = readJson('data/coordinate-evidence/manifest.json');
if (!Array.isArray(evidenceManifest.files)) throw new Error('data/coordinate-evidence/manifest.json mangler files[]');
const newEvidenceFiles = places.map((place) => evidenceManifestPath(place.id));
evidenceManifest.files = evidenceManifest.files.filter((entry) => !newEvidenceFiles.includes(entry));
let evidenceAnchor = -1;
for (let i = 0; i < evidenceManifest.files.length; i += 1) {
  if (String(evidenceManifest.files[i]).startsWith('oslo/vitenskap/')) evidenceAnchor = i;
}
evidenceManifest.files.splice(evidenceAnchor >= 0 ? evidenceAnchor + 1 : evidenceManifest.files.length, 0, ...newEvidenceFiles);
writeJson('data/coordinate-evidence/manifest.json', evidenceManifest);

const registryPath = 'data/fag/teknologi/geographic/oslo_teknologisteder_candidates_v1.json';
const registry = readJson(registryPath);
if (!Array.isArray(registry.candidates)) throw new Error(`${registryPath} mangler candidates[]`);
const produced = new Set(places.map((place) => place.id));
registry.candidates = registry.candidates.map((candidate) => produced.has(candidate.id)
  ? {
      ...candidate,
      status: 'canonical_produced',
      production_action: 'none',
      place_file: placePath(candidate.id),
      coordinate_evidence_file: evidencePath(candidate.id)
    }
  : candidate);
registry.production_status = {
  status: 'complete',
  produced_at: VERIFIED_AT,
  existing_places_enriched: ['teknisk_museum'],
  new_places_created: places.map((place) => place.id)
};
writeJson(registryPath, registry);

const report = `# Oslo Vitenskap – teknologisteder, produksjonsbatch 01

Dato: ${VERIFIED_AT}

## Resultat

Fem godkjente kandidater er produsert som aktive kartsteder under primærkategorien \`vitenskap\`, med \`teknologi\` som sekundærbadge og canonical \`em_tek_*\`-koblinger.

| placeId | sted | kartanker | radius |
|---|---|---|---:|
${places.map((place) => `| ${place.id} | ${place.name} | ${place.address.street} ${place.address.number} | ${place.r} m |`).join('\n')}

Norsk Teknisk Museum var allerede canonical og ble beriket i den foregående committen.

## Kategorigrense

- Stedene er \`vitenskap\` i runtime.
- Teknologi er faglig og sekundært lag.
- Ordinær trafikk, stasjoner og byinfrastruktur er ikke flyttet til Teknologi.
- PEX-tårnet kvalifiserer fordi selve bygningen var produksjonsutstyr for kabel, ikke fordi kabelnettet er infrastruktur.

## Produksjon

- 5 nye place-filer
- 5 Coordinate Evidence v1-filer
- global place-manifest registrert deterministisk
- coordinate-evidence-manifest registrert deterministisk
- kandidatregister oppdatert til \`canonical_produced\`
- runtime place-index bygges av coordinate-runneren etter denne jobben

## Kilder

- Bitraf: offisielle sider for besøksadresse, lokaler og utstyr
- Tandberg: Oslo byleksikon og Store norske leksikon
- Radionette: Oslo byleksikon og Lokalhistoriewiki
- STK PEX-tårnet: Tårnet Kulturarena, Oxer Eiendom, Oslo kommune og Store norske leksikon
- MiNaLab: SINTEF og NorFab

## Validering

Coordinate branch runner kjører etter produksjonen:

- \`places:index:build\`
- split-manifest sync
- place-index parity
- coordinate source contract
- coordinate quality
- strict coordinate intake
- coordinate evidence audit
- place health
- \`git diff --check\`
`;
writeText('reports/oslo-vitenskap-teknologisteder-production-batch-01.md', report);

console.log(`Produserte ${places.length} Vitenskap/Teknologi-steder med coordinate evidence og manifestregistrering.`);
