import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const intakePath = "reports/visitoslo-oslofjord-audit-20260721/coordinate-intake-final.json";
const intake = JSON.parse(readFileSync(intakePath, "utf8"));
const productionDate = "2026-07-21";
const ids = ["heggholmen", "rambergoya", "ormoya", "malmoya", "nakholmen", "lindoya", "bleikoya", "ulvoya"];

const byleksikon = {
  heggholmen: "https://oslobyleksikon.no/side/Heggholmen",
  rambergoya: "https://oslobyleksikon.no/side/Ramberg%C3%B8ya",
  ormoya: "https://oslobyleksikon.no/side/Orm%C3%B8ya",
  malmoya: "https://oslobyleksikon.no/side/Malm%C3%B8ya",
  nakholmen: "https://oslobyleksikon.no/side/Nakholmen",
  lindoya: "https://oslobyleksikon.no/side/Lind%C3%B8ya",
  bleikoya: "https://oslobyleksikon.no/side/Bleik%C3%B8ya",
  ulvoya: "https://oslobyleksikon.no/side/Ulv%C3%B8ya"
};

const definitions = {
  heggholmen: {
    name: "Heggholmen",
    category: "historie",
    year: 1876,
    r: 90,
    desc: "Fjordøy i det sammenvokste Gressholmen-systemet, med Heggholmen fyr, industrispor og bebyggelse som viser hvordan sjømerking, produksjon og naturvern har avløst og lagt seg oppå hverandre.",
    popupDesc: "Heggholmen var tidligere en tydeligere avgrenset øy, men er i dag fysisk sammenvokst med Gressholmen og Rambergøya. Likevel har stedet en egen historisk identitet. Heggholmen fyr har røtter tilbake til 1800-tallet, og dagens fyrbygning fra 1876 er et viktig spor etter sjømerking og ferdsel i indre Oslofjord.\n\nPå 1900-tallet fikk Heggholmen også industriell bruk. Her fantes blant annet fabrikkmiljø knyttet til maling, lakk og senere såpe, med arbeider- og funksjonærboliger, brygge og andre materielle spor. I dag ligger mye av øya i et vernet landskap. History Go-recorden skal derfor handle om Heggholmen som eget historisk sted: et lite fjordlandskap der fyr, industri, bebyggelse og senere naturvern fortsatt kan leses i samme terreng. Den skal ikke brukes som samlemarkør for hele Gressholmen–Heggholmen–Rambergøya-systemet.",
    emne_ids: ["em_his_spor_materialitet", "em_his_historiske_lag_i_byrom", "em_his_kulturminner_bevaring"],
    quiz_profile: {
      place_type: "historisk_fjordoy",
      subtype: "fyr_og_industrimiljo_i_sammenvokst_oylandskap",
      signature_features: ["Heggholmen fyr og sjømerkingshistorie", "industrispor etter fabrikkvirksomhet", "egen navngitt øyidentitet selv om landformen nå henger sammen med naboøyene"],
      primary_angles: ["fyrhistorie", "industrihistorie", "materielle_spor", "fjordferdsel", "vern_og_endring"],
      question_families: ["historisk_endring", "materielle_spor", "funksjon_og_ferdsel", "bevaring", "kontrast"],
      avoid_angles: ["behandle_heggholmen_som_hele_gressholmen-systemet", "generisk_fyrhistorie", "late_som_oyas_grenser_er_uendret"],
      must_include: ["Heggholmens egen stedsidentitet", "forholdet mellom fyr og industri", "at øylandskapet har endret fysisk form"],
      contrast_targets: ["gressholmen", "rambergoya", "hovedoya"],
      notes: "Spør gjennom dokumenterte stedlige spor. Eksterne lokalhistoriske og institusjonelle kilder skal dominere synlig quizinnhold."
    }
  },
  rambergoya: {
    name: "Rambergøya",
    category: "natur",
    year: 2008,
    r: 100,
    desc: "Vernet fjordnatur i det sammenvokste Gressholmen-systemet, der strand, vegetasjon og fugleliv møter spor etter langvarig bruk som skytebane og senere miljøopprydding.",
    popupDesc: "Rambergøya ligger tett sammen med Gressholmen og Heggholmen, men er en egen navngitt øyidentitet. I dag er naturverdiene sentrale, med vernet kystlandskap og viktige leveområder i indre Oslofjord. Samtidig er dette ikke et urørt landskap. Gressholmen og Rambergøya ble brukt som skytebane fra 1800-tallet og langt inn på 1900-tallet, og senere forvaltning har måttet håndtere forurensning og andre spor etter denne bruken.\n\nStedet er derfor godt egnet til å vise hvordan naturvern ofte handler om landskap som allerede er påvirket av mennesker. History Go skal behandle Rambergøya primært som natursted, men den tidligere skytebanen og miljøarbeidet er nødvendige historiske lag. Recorden skal ikke slås sammen med Gressholmen bare fordi øyene nå henger fysisk sammen.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_natur_arter_habitat_mangfold", "em_his_historiske_lag_i_byrom"],
    quiz_profile: {
      place_type: "vernet_fjordoy",
      subtype: "kystnatur_med_tidligere_skytebane",
      signature_features: ["vernet natur i indre Oslofjord", "tidligere skytebanehistorie", "menneskepåvirket landskap under naturforvaltning"],
      primary_angles: ["kystnatur", "naturvern", "menneskepavirkning", "forurensning_og_opprydding", "historiske_bruksspor"],
      question_families: ["vern_og_naturkvaliteter", "historisk_bruk", "menneske_og_natur", "forvaltning", "kontrast"],
      avoid_angles: ["urort_natur-fortelling", "forveksle_med_gressholmen", "detaljerte_artslister_uten_kilde"],
      must_include: ["at naturen har en brukshistorie", "den tidligere skytebanen", "Rambergøya som egen navngitt identitet"],
      contrast_targets: ["gressholmen", "heggholmen", "hovedoya"],
      notes: "Naturfakta og forvaltningshistorie må kildebelegges eksternt; unngå å romantisere stedet som uberørt."
    }
  },
  ormoya: {
    name: "Ormøya",
    category: "by",
    year: 1875,
    period: "1870-årene – bro og boligvekst",
    r: 180,
    desc: "Bebodd fjordøy der broforbindelse, sommervillaer og senere helårsboliger gjorde et tidligere utfartssted til et særegent småskala boligmiljø nær byen.",
    popupDesc: "Ormøya viser hvordan en øy i indre Oslofjord gradvis kunne bli en del av den vanlige byen. På 1800-tallet var området attraktivt som utfarts- og sommersted. Da broforbindelsen kom i 1870-årene, ble det lettere å bygge og bo fast på øya, og Ormøya fikk et særpreget miljø av villaer, blant annet i sveitserstil.\n\nSenere kom flere lag til: Ormøy kirke ble et lokalt landemerke, forbindelsen videre til Malmøya knyttet øyene tettere sammen, og under andre verdenskrig fikk høyden på øya militær bruk som observasjons- og varslingsted. I History Go skal Ormøya behandles som et bolig- og byformsted: en øy der infrastruktur endret hvem som kunne bruke stedet og hvordan det ble bygd. Malmøya beholdes som en egen fysisk og faglig place-record.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    quiz_profile: {
      place_type: "boligoy",
      subtype: "brokoblet_villaoy_med_historiske_lag",
      signature_features: ["broforbindelse som muliggjorde sterkere boligvekst", "eldre villa- og sommerstedskarakter", "egen øyidentitet i et bynært fjordlandskap"],
      primary_angles: ["boligstruktur", "infrastruktur_og_tilgang", "villaarkitektur", "historisk_endring", "oy_og_by"],
      question_families: ["byutvikling", "boligtypologi", "forbindelser", "historiske_lag", "kontrast"],
      avoid_angles: ["slå_sammen_med_malmoya", "generisk_villastrøk", "kun_kirkehistorie"],
      must_include: ["broens betydning", "overgangen fra utfartssted til boligøy", "den særegne småskala boligformen"],
      contrast_targets: ["malmoya", "nakholmen", "ulvoya"],
      notes: "Spør Ormøya som urban øyform og boligmiljø, ikke bare som naturskjønn øy."
    }
  },
  malmoya: {
    name: "Malmøya",
    category: "natur",
    year: 1965,
    r: 260,
    desc: "Fjordøy med særpreget kalkrik geologi og flere vernede naturområder, samtidig preget av tidligere kalk- og sementvirksomhet, sommerhus og senere helårs bosetting.",
    popupDesc: "Malmøya er et av de tydeligste stedene i Oslofjorden der geologi, naturvern og menneskelig bruk ligger tett oppå hverandre. Øya har kalkrik berggrunn og flere vernede områder, og naturverdiene er hovedgrunnen til at stedet behandles som `natur` i History Go.\n\nSamtidig har øya en tydelig brukshistorie. Kalk- og sementrelatert virksomhet satte spor på 1800-tallet, sommerhus kom tidlig, og etter hvert ble øya også et helårs boligområde. Broforbindelsen fra 1965 knyttet Malmøya tettere til Ormøya og fastlandet. History Go-recorden skal holde hele Malmøya som fysisk identitet; Solvikbukta og andre delområder er innholdslag, ikke erstatninger for øya som place.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_natur_arter_habitat_mangfold", "em_his_historiske_lag_i_byrom"],
    quiz_profile: {
      place_type: "fjordoy_med_verneomrader",
      subtype: "kalkrik_kystnatur_med_industri_og_bosetting",
      signature_features: ["kalkrik geologi og vernede naturområder", "spor etter kalk- og sementvirksomhet", "brokoblet øy med både natur og bosetting"],
      primary_angles: ["geologi", "kystnatur", "naturvern", "industrihistorie", "bosetting_og_endring"],
      question_families: ["naturgrunnlag", "vern", "historisk_bruk", "menneske_og_natur", "kontrast"],
      avoid_angles: ["slå_sammen_med_ormoya", "redusere_til_solvikbukta", "generisk_oynatur"],
      must_include: ["kalkgrunnlaget", "vern som hovedlag", "at menneskelig bruk også har formet øya"],
      contrast_targets: ["ormoya", "rambergoya", "bleikoya"],
      notes: "Natur er primærinngangen; industri og bolig er historiske forklaringslag, ikke grunn til å miste øyas naturprofil."
    }
  },
  nakholmen: {
    name: "Nakholmen",
    category: "by",
    year: 1920,
    period: "1920-årene – hyttekoloni",
    r: 180,
    desc: "Hytteøy i indre Oslofjord der tett organisert sesongbosetting fra mellomkrigstiden skapte et særegent bynært boligmiljø uten vanlig helårsbebyggelse.",
    popupDesc: "Nakholmen er ikke en vanlig boligbydel, men øya viser likevel en tydelig form for urban bosetting. Fra 1920-årene vokste det fram en organisert hyttekoloni med mange små fritidsboliger, felles regler og en sesongrytme knyttet til ferge, sommerliv og nærhet til byen.\n\nDenne hytteformen gjør Nakholmen til et interessant sted for å forstå hvordan Oslo også strekker seg ut i fjorden gjennom fritidsbebyggelse og midlertidig bosetting. Samtidig har deler av øya vernede naturverdier. I History Go er den primære inngangen likevel hytteøya som bolig- og byform: et tett, planlagt og regulert sommermiljø som skiller seg både fra helårs villaøyer og fra ubebygde naturøyer.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    quiz_profile: {
      place_type: "hytteoy",
      subtype: "organisert_sesongbosetting_i_indre_oslofjord",
      signature_features: ["hyttekoloni med røtter i 1920-årene", "sesongbasert boligmiljø uten vanlig helårsbosetting", "tett kobling mellom ferge, fjord og byliv"],
      primary_angles: ["boligstruktur", "sesongbosetting", "fritidskultur", "regulering", "by_og_fjord"],
      question_families: ["boligtypologi", "historisk_endring", "bruk_og_rytme", "planlegging", "kontrast"],
      avoid_angles: ["generisk_hytteidyll", "late_som_helars_boligomrade", "overse_naturvernet"],
      must_include: ["hyttekoloniens organiserte karakter", "sesongrytmen", "forholdet til Oslo som by"],
      contrast_targets: ["lindoya", "ormoya", "ulvoya"],
      notes: "Spør som en særskilt bolig- og sesongbyform, ikke bare som fritidsdestinasjon."
    }
  },
  lindoya: {
    name: "Lindøya",
    category: "by",
    year: 1923,
    r: 220,
    desc: "Hytteøy med tett sommerbebyggelse, sterk farge- og byggekontroll og et særegent sesongbasert boligmiljø midt i indre Oslofjord.",
    popupDesc: "Lindøya fikk en omfattende hyttebebyggelse fra 1920-årene og utviklet seg til et av de mest karakteristiske sommermiljøene i indre Oslofjord. De små hyttene, de tydelige fargene og reglene for hvordan bebyggelsen kunne se ut, gjorde øya til et planlagt og gjenkjennelig landskap, ikke bare en tilfeldig samling fritidshus.\n\nSamtidig ligger hyttekolonien tett på vernede naturverdier. Det gjør Lindøya til et godt eksempel på hvordan bynær fritidsbosetting, regulering og natur må eksistere i samme begrensede øyrom. History Go skal behandle Lindøya primært som en særegen bolig- og byform med sesongrytme, mens naturreservatet er et viktig side- og konfliktlag.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    quiz_profile: {
      place_type: "hytteoy",
      subtype: "regulert_sommerkoloni_med_fargeplan",
      signature_features: ["stor hyttekoloni fra 1920-årene", "karakteristisk regulert farge- og byggeskikk", "sesongbasert øysamfunn tett på vernet natur"],
      primary_angles: ["boligstruktur", "arkitektur_og_regulering", "sesongbosetting", "fritidskultur", "vern_og_bruk"],
      question_families: ["boligtypologi", "planlegging", "historisk_endring", "bruk_og_rytme", "kontrast"],
      avoid_angles: ["generisk_hytteoy", "bare_fargequiz", "overse_forholdet_til_naturvern"],
      must_include: ["hytteveksten fra 1920-årene", "den regulerte visuelle karakteren", "sesongbosetting som byform"],
      contrast_targets: ["nakholmen", "ormoya", "ulvoya"],
      notes: "Spør som planlagt hyttekoloni og sesongby, med konkrete bygg- og bruksspor."
    }
  },
  bleikoya: {
    name: "Bleikøya",
    category: "natur",
    year: 1885,
    r: 180,
    desc: "Liten fjordøy med vernet natur, strandenger og fugleliv, men også en sterk sosialhistorie knyttet til barnesanatorium, gårdsdrift og senere hyttebebyggelse.",
    popupDesc: "Bleikøya har et sårbart og variert øylandskap der naturvern er den primære History Go-inngangen. Strandenger, kystvegetasjon og fugleliv gjør øya til en viktig del av naturmangfoldet i indre Oslofjord.\n\nSamtidig bærer øya tydelige historiske lag. Fra 1885 lå det et kystsanatorium for barn her, og senere ble øya åpnet for hyttebebyggelse. Den eldre gården er også en del av stedets kulturhistorie. Recorden skal derfor vise hvordan et lite naturområde kan romme både institusjonshistorie, bosetting og vern. Bleikøykalven er et delområde og skal ikke erstatte Bleikøya som samlet place-identitet.",
    emne_ids: ["em_natur_kyst_okosystemer", "em_natur_arter_habitat_mangfold", "em_his_historiske_lag_i_byrom"],
    quiz_profile: {
      place_type: "vernet_fjordoy",
      subtype: "kystnatur_med_sanatorium_og_hyttehistorie",
      signature_features: ["vernet øynatur og fugleliv", "tidligere kystsanatorium for barn", "senere hyttebebyggelse og bevart gårdsmiljø"],
      primary_angles: ["kystnatur", "naturvern", "sosialhistorie", "bosetting", "historiske_lag"],
      question_families: ["vern_og_naturkvaliteter", "institusjonshistorie", "historisk_endring", "menneske_og_natur", "kontrast"],
      avoid_angles: ["redusere_til_bleikoykalven", "kun_hyttehistorie", "generisk_fugleoy"],
      must_include: ["naturvern som hovedlag", "sanatoriumshistorien", "at øya også har bosettingshistorie"],
      contrast_targets: ["malmoya", "rambergoya", "lindoya"],
      notes: "Natur er primær kategori, men den dokumenterte sosialhistorien skal brukes til å vise historiske lag i landskapet."
    }
  },
  ulvoya: {
    name: "Ulvøya",
    category: "by",
    year: 1935,
    r: 220,
    desc: "Helårsbebodd villaøy der broforbindelse og systematisk tomtedeling gjorde et fjordlandskap til et tydelig boligområde, samtidig som strand og vernet natur fortsatt preger øya.",
    popupDesc: "Ulvøya ble knyttet til fastlandet med bro i 1928, og i 1935 ble store deler av øya kjøpt og delt opp i villatomter. Dermed fikk øya en helt annen utvikling enn de klassiske hytteøyene lenger inne i fjorden: her vokste det fram et helårsbebodd boligområde med villaer, veier og daglig forbindelse til resten av byen.\n\nSamtidig finnes offentlige rekreasjonsområder som Sydstranda og vernede naturverdier. History Go skal likevel behandle Ulvøya primært som `by`, fordi den mest særpregede historien handler om hvordan infrastruktur, eiendomsutvikling og boligbygging gjorde en øy til en permanent del av Oslos boliggeografi.",
    emne_ids: ["em_by_boligstruktur", "em_by_historiske_lag_i_hverdagsrom", "em_by_byidealer_og_plantradisjoner"],
    quiz_profile: {
      place_type: "boligoy",
      subtype: "brokoblet_villaomrade",
      signature_features: ["fastlandsbro fra mellomkrigstiden", "systematisk villautbygging fra 1930-årene", "helårsbebodd øy med både private boliger og offentlige strandarealer"],
      primary_angles: ["boligstruktur", "infrastruktur", "eiendomsutvikling", "villaomrade", "by_og_natur"],
      question_families: ["byutvikling", "boligtypologi", "forbindelser", "historisk_endring", "kontrast"],
      avoid_angles: ["generisk_villastrøk", "kun_badestrand", "forveksle_med_hytteoyene"],
      must_include: ["broens betydning", "tomtedelingen og villautbyggingen", "forskjellen fra sesongbaserte hytteøyer"],
      contrast_targets: ["ormoya", "nakholmen", "lindoya"],
      notes: "Spør Ulvøya som permanent boligøy og infrastrukturdrevet byutvikling."
    }
  }
};

const inputById = new Map((intake.candidates ?? []).map((row) => [row.placeId, row]));
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const currentPlaces = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
for (const id of ids) {
  if (currentPlaces.some((place) => place.id === id)) throw new Error(`Canonical id ${id} already exists on current main; refusing duplicate production.`);
  if (!inputById.has(id)) throw new Error(`Missing merged coordinate intake for ${id}.`);
}

function manifestEntryFor(id, category) {
  if (category === "by") return `places/by/oslo/places/${id}.json`;
  if (category === "historie") return `places/historie/oslo/places_historie/${id}.json`;
  return `places/natur/oslo/${id}.json`;
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function appendManifest(file, entry) {
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(manifest.files)) throw new Error(`${file} has no files array.`);
  if (!manifest.files.includes(entry)) manifest.files.push(entry);
  writeJson(file, manifest);
}

const produced = [];
for (const id of ids) {
  const definition = definitions[id];
  const intakeRow = inputById.get(id);
  if (!definition || !intakeRow?.coordinate) throw new Error(`Incomplete production definition for ${id}.`);
  if (definition.category !== intakeRow.productionCategory) throw new Error(`Category mismatch for ${id}: ${definition.category} vs ${intakeRow.productionCategory}.`);

  const c = intakeRow.coordinate;
  const placeManifestEntry = manifestEntryFor(id, definition.category);
  const placeFile = path.join("data", placeManifestEntry);
  const evidenceManifestEntry = `oslo/${definition.category}/${id}.json`;
  const evidenceFile = path.join("data", "coordinate-evidence", evidenceManifestEntry);
  if (existsSync(placeFile) || existsSync(evidenceFile)) throw new Error(`Output already exists for ${id}.`);

  const place = {
    id,
    name: definition.name,
    lat: c.lat,
    lon: c.lon,
    r: definition.r,
    category: definition.category,
    year: definition.year,
    ...(definition.period ? { period: definition.period } : {}),
    desc: definition.desc,
    popupDesc: definition.popupDesc,
    emne_ids: definition.emne_ids,
    quiz_profile: definition.quiz_profile,
    locatorType: c.locatorType,
    sourceProvider: c.sourceProvider,
    sourceObjectId: c.sourceObjectId,
    geocodeAccuracy: c.geocodeAccuracy,
    coordRole: c.coordRole,
    coordType: c.coordType,
    coordStatus: c.coordStatus,
    coordSource: c.coordSource,
    coordSourceId: c.coordSourceId,
    coordSourceUrl: c.coordSourceUrl,
    coordVerifiedAt: productionDate,
    coordNote: c.coordNote,
    externalLinks: [
      {
        type: "reference",
        label: `Oslo byleksikon – ${definition.name}`,
        url: byleksikon[id],
        lang: "nb",
        verifiedAt: productionDate
      },
      {
        type: "coordinate_source",
        label: c.sourceProvider === "osm" ? `OpenStreetMap – ${definition.name}` : `Kartverket SSR – ${definition.name}`,
        url: c.coordSourceUrl,
        lang: "nb",
        verifiedAt: productionDate
      }
    ]
  };

  const coordinateSourceName = c.sourceProvider === "osm" ? `OpenStreetMap – ${definition.name}` : `Kartverket SSR – ${definition.name}`;
  const evidence = {
    schemaVersion: "1.0",
    placeId: id,
    placeFile,
    evidenceStatus: "applied_to_place",
    coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: {
      lat: c.lat,
      lon: c.lon,
      r: definition.r,
      coordStatus: c.coordStatus,
      coordSource: c.coordSource,
      coordType: c.coordType,
      coordNote: c.coordNote
    },
    identity: {
      currentName: definition.name,
      resolvedIdentity: `${definition.name} som egen navngitt fysisk stedsidentitet i VisitOSLO Oslofjorden-auditen`,
      identityStatus: "resolved",
      identityProblem: "",
      locatorTypeCandidate: c.locatorType,
      requiresSplit: false,
      splitReason: ""
    },
    requiredEvidence: [
      c.sourceProvider === "osm" ? "eksakt navngitt fysisk OSM-objekt med godkjent øygeometri" : "eksakt aktiv Kartverket SSR-identitet med riktig navneobjekttype",
      "uavhengig lokalhistorisk identitetskryssjekk",
      "canonical identitets- og nærhetskontroll mot current main"
    ],
    evidence: [
      {
        sourceProvider: c.sourceProvider,
        sourceName: coordinateSourceName,
        sourceUrl: c.coordSourceUrl,
        sourceObjectId: c.sourceObjectId,
        sourceQuality: c.sourceProvider === "osm" ? "exact_named_semantic_object" : "official_named_place_registry",
        finding: c.coordNote,
        canVerifyCoordinate: true,
        reason: "Den låste Oslofjord-intaken godkjente dette kildeobjektet uten nearest/first-hit og uten canonical identitetsduplikat."
      },
      {
        sourceProvider: "manual_research",
        sourceName: `Oslo byleksikon – ${definition.name}`,
        sourceUrl: byleksikon[id],
        sourceObjectId: `oslobyleksikon:${id}`,
        sourceQuality: "independent_identity_crosscheck",
        finding: `Uavhengig lokalhistorisk kilde kryssjekker ${definition.name} som egen navngitt stedsidentitet og gir historisk kontekst til canonical scope.`,
        canVerifyCoordinate: false,
        reason: "Identitets- og innholdskryssjekk; primærkoordinaten kommer fra det låste kartobjektet."
      }
    ],
    addressCandidates: [],
    sourceObjectCandidates: [
      { sourceProvider: c.sourceProvider, sourceObjectId: c.sourceObjectId, canApplyToPlace: true },
      { sourceProvider: "manual_research", sourceObjectId: `oslobyleksikon:${id}`, canApplyToPlace: false }
    ],
    geometryCandidates: c.sourceProvider === "osm" ? [
      { sourceProvider: "osm", sourceObjectId: c.sourceObjectId, lat: c.lat, lon: c.lon, coordRole: c.coordRole, canApplyToPlace: true }
    ] : [],
    coordinateCandidates: [
      { lat: c.lat, lon: c.lon, coordRole: c.coordRole, sourceObjectId: c.sourceObjectId, canApplyToPlace: true }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: "",
      nextAction: "Kildeobjekt og representasjonspunkt er anvendt på canonical place."
    },
    notes: [
      c.coordNote,
      "Stedet ble re-auditert mot current runtime index umiddelbart før produksjon; ingen canonical place-id med samme identitet fantes."
    ]
  };

  writeJson(placeFile, place);
  writeJson(evidenceFile, evidence);
  appendManifest("data/places/manifest.json", placeManifestEntry);
  appendManifest("data/coordinate-evidence/manifest.json", evidenceManifestEntry);
  produced.push({ id, name: definition.name, category: definition.category, placeManifestEntry, evidenceManifestEntry, sourceObjectId: c.sourceObjectId, coordStatus: c.coordStatus });
}

const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
for (const id of ids) if (protocol.includes(`\`${id}\``)) throw new Error(`${id} already exists in Oslo coordinate protocol.`);
const marker = "\n\nRelevante korrigerende merger";
const markerIndex = protocol.indexOf(marker);
if (markerIndex < 0) throw new Error("Could not locate end of Oslo coordinate table.");
const tableSection = protocol.slice(0, markerIndex);
const batches = [...tableSection.matchAll(/^\|\s*(\d+)\s*\|\s*`[^`]+`/gm)].map((match) => Number(match[1]));
const nextBatch = Math.max(...batches) + 1;
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) [^\n]*canonical steder\./);
if (!countMatch) throw new Error("Could not parse Oslo protocol count.");
const newCount = Number(countMatch[1]) + produced.length;
const intro = `Oslo-tabellen inneholder nå ${newCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til åtte separate Oslofjord-steder etter den lukkede VisitOSLO Oslofjorden-auditen: Heggholmen, Rambergøya, Ormøya, Malmøya, Nakholmen, Lindøya, Bleikøya og Ulvøya. Eksakte OSM-øygeometrier brukes der de finnes, mens Heggholmen og Rambergøya bruker eksakte aktive Kartverket SSR-objekter med objekttype Øy i sjø.`;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ [^\n]*canonical steder\./, intro);
const rows = produced.map((row) => `| ${nextBatch} | \`${row.id}\` | ${row.name} | ${row.coordStatus} | \`${row.sourceObjectId}\` |`).join("\n");
protocol = `${protocol.slice(0, markerIndex)}\n${rows}${protocol.slice(markerIndex)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (${productionDate}) produserer åtte separate Oslofjord-identiteter fra VisitOSLO Oslofjorden-passet. Kombinerte VisitOSLO-rader er ikke kopiert som syntetiske steder: Heggholmen og Rambergøya beholdes som egne navngitte øyidentiteter ved siden av eksisterende \`gressholmen\`, og Ormøya og Malmøya beholdes som separate øyer. Alle åtte ble kontrollert mot current runtime-indeks umiddelbart før produksjon.\n`;
writeFileSync(protocolPath, protocol, "utf8");

writeJson("reports/visitoslo-oslofjord-audit-20260721/oslo-production-batch.json", {
  version: productionDate,
  batch: nextBatch,
  producedCount: produced.length,
  produced,
  sourceCoordinateIntake: intakePath,
  duplicateGate: "All eight ids absent from current runtime index immediately before production."
});

console.log(`Produced ${produced.length} VisitOSLO Oslofjord places as Oslo coordinate batch ${nextBatch}.`);
for (const row of produced) console.log(`${row.id}: ${row.placeManifestEntry} | ${row.sourceObjectId}`);
