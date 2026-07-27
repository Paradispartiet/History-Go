#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const accessedAt = '2026-07-27';
const geographyId = 'geo_no_oslo_akershus';
const profileId = 'profile_historie_no_oslo_akershus';
const batch = [
  {
    "case_id": "case_his_akershus_festning",
    "place_id": "akershus_festning",
    "sources": [
      {
        "source_id": "src_his_akershus_festning_forsvarsbygg",
        "title": "Akershus festning",
        "publisher": "Forsvarsbygg",
        "source_type": "official_site_page",
        "url": "https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning",
        "repository_source": "data/places/historie/oslo/places_historie/akershus_festning.json",
        "extracted_from": [
          "popupDesc",
          "coordSourceUrl"
        ],
        "temporal_scope": {
          "from": 1290,
          "to": null
        },
        "limitations": [
          "Forvalterens presentasjon prioriterer anleggets institusjonelle og offentlige historie fremfor en uttømmende sosialhistorie.",
          "Nettsiden er en levende institusjonsside og gir ikke full sporbarhet til alle enkeltopplysninger i den lange kronologien."
        ],
        "tier": "A",
        "rationale": "Offisiell forvalterkilde for festningsanleggets identitet, funksjon og hovedhistorie."
      },
      {
        "source_id": "src_his_akershus_festning_terboven_snl",
        "title": "Josef Terboven",
        "publisher": "Store norske leksikon",
        "source_type": "reference_encyclopedia",
        "url": "https://snl.no/Josef_Terboven",
        "repository_source": "data/stories/stories_akerhus_slott.json",
        "extracted_from": [
          "sources",
          "story"
        ],
        "temporal_scope": {
          "from": 1940,
          "to": 1945
        },
        "limitations": [
          "Personartikkelen belyser okkupasjonsmakten gjennom Terboven og dekker ikke hele festningens krigshistorie.",
          "Leksikonformatet sammenfatter forskning og erstatter ikke samtidige administrative eller militære arkivkilder."
        ],
        "tier": "B",
        "rationale": "Redigert referansekilde for Terbovens maktovertakelse og okkupasjonskonteksten."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_akershus_festning_medieval_state_center",
        "statement": "Akershus festning ble påbegynt omkring 1290 under Håkon 5. Magnusson og utviklet seg som kongelig residens, forsvarsverk og administrativt maktsentrum ved innseilingen til Oslo.",
        "claim_type": "institutional_and_material_development",
        "temporal": {
          "from": 1290,
          "to": 1500
        },
        "source_ids": [
          "src_his_akershus_festning_forsvarsbygg"
        ],
        "emne_patterns": [
          "middelalder_oslo",
          "kongemakt_kirke_konflikt",
          "stat_institusjoner",
          "krig_okkupasjon_krig_mobilisering"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Hovedforløpet er godt dokumentert, men den eksakte byggestarten og fasene i den tidlige borgen angis ofte omtrentlig."
        },
        "alternative_interpretations": [
          "Festningen kan leses både som vern av byen og som en materiell demonstrasjon av kongemakt, skattlegging og kontroll."
        ]
      },
      {
        "claim_id": "claim_his_akershus_festning_occupation_memory_layers",
        "statement": "Under okkupasjonen 1940–1945 ble Akershus festning brukt av tyske myndigheter; etter frigjøringen ble anlegget også knyttet til rettsoppgjør, motstandshistorie, museer og nasjonal minnekultur.",
        "claim_type": "occupation_and_memory_transformation",
        "temporal": {
          "from": 1940,
          "to": null
        },
        "source_ids": [
          "src_his_akershus_festning_forsvarsbygg",
          "src_his_akershus_festning_terboven_snl"
        ],
        "emne_patterns": [
          "okkupasjon_motstand",
          "rettsoppgjor",
          "minnesteder_historiebruk",
          "samtid_ettertid_fortelling"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Kildene dokumenterer hovedlagene, men hvert museum, henrettelsessted og rettsoppgjør krever egne spesialkilder for detaljert analyse."
        },
        "alternative_interpretations": [
          "Et nasjonalt minnested kan fremheve motstand og statlig kontinuitet, men må også romme okkupasjonsmakt, samarbeid, straff og omstridte etterkrigsfortolkninger."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_hovedoya_kloster",
    "place_id": "hovedoya_kloster",
    "sources": [
      {
        "source_id": "src_his_hovedoya_kloster_snl",
        "title": "Hovedøya kloster",
        "publisher": "Store norske leksikon",
        "source_type": "reference_encyclopedia",
        "url": "https://snl.no/Hoved%C3%B8ya_kloster",
        "repository_source": "data/stories/stories_hovedoya_kloster.json",
        "extracted_from": [
          "sources",
          "story"
        ],
        "temporal_scope": {
          "from": 1147,
          "to": 1532
        },
        "limitations": [
          "Leksikonartikkelen sammenfatter et langt institusjons- og bygningsforløp og kan komprimere arkeologisk uenighet.",
          "Oversiktskilden bør suppleres med arkeologiske rapporter ved analyse av byggefaser, rombruk og funn."
        ],
        "tier": "B",
        "rationale": "Redigert referansekilde for grunnleggelse, klosterhistorie og ødeleggelsen i 1532."
      },
      {
        "source_id": "src_his_hovedoya_oslo_byleksikon",
        "title": "Hovedøya",
        "publisher": "Oslo byleksikon",
        "source_type": "local_reference_encyclopedia",
        "url": "https://oslobyleksikon.no/index.php?title=Hoved%C3%B8ya",
        "repository_source": "data/stories/stories_hovedoya_kloster.json",
        "extracted_from": [
          "sources",
          "related_places"
        ],
        "temporal_scope": {
          "from": 1100,
          "to": null
        },
        "limitations": [
          "Den lokale oversikten dekker hele øya og skiller ikke alltid skarpt mellom klosteranlegget og senere brukslag.",
          "Artikkelen er sekundær formidling og gir begrenset innsyn i kildegrunnlaget for hver enkelt detalj."
        ],
        "tier": "B",
        "rationale": "Lokal redigert referansekilde for klosterets plass i Hovedøyas og Oslos historie."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_hovedoya_kloster_founded_1147",
        "statement": "Hovedøya kloster ble grunnlagt i 1147 da cisterciensermunker fra Kirkstead i England etablerte et kloster ved en eldre kirke på øya.",
        "claim_type": "dated_foundation",
        "temporal": {
          "from": 1147,
          "to": 1147
        },
        "source_ids": [
          "src_his_hovedoya_kloster_snl",
          "src_his_hovedoya_oslo_byleksikon"
        ],
        "emne_patterns": [
          "kirke_kloster_middelalder",
          "middelalder_oslo",
          "middelalder_kirke_kristning",
          "handel_handverk_bydannelse"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "low",
          "note": "Grunnleggelsesåret og ordenstilknytningen er gjennomgående i de redigerte kildene."
        },
        "alternative_interpretations": [
          "Grunnleggelsen kan forstås som religiøs etablering, men også som del av europeiske nettverk for jordegods, arbeid, arkitektur og kunnskapsmakt."
        ]
      },
      {
        "claim_id": "claim_his_hovedoya_kloster_burned_1532_material_trace",
        "statement": "Klosteret ble plyndret og brent i 1532 under maktkampen før reformasjonen, og ruinene ble senere et fysisk spor etter oppløst klostermakt, materialgjenbruk og skiftende kulturminnevern.",
        "claim_type": "destruction_and_material_afterlife",
        "temporal": {
          "from": 1532,
          "to": null
        },
        "source_ids": [
          "src_his_hovedoya_kloster_snl",
          "src_his_hovedoya_oslo_byleksikon"
        ],
        "emne_patterns": [
          "ruiner_rester_ombruk",
          "spor_materialitet",
          "kulturminner_bevaring",
          "restaurering_autentisitet"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Brannen og institusjonens fall er dokumentert, mens ombruk og restaurering består av flere faser som bør skilles i detaljstudier."
        },
        "alternative_interpretations": [
          "Ruinene kan framstå som rester etter et brått brudd, men synligheten deres er også skapt av senere utgravning, restaurering og kulturminnepolitikk."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_eidsvollsbygningen",
    "place_id": "eidsvollsbygningen",
    "sources": [
      {
        "source_id": "src_his_eidsvoll1814_eidsvollsbygningen",
        "title": "Eidsvollsbygningen",
        "publisher": "Eidsvoll 1814",
        "source_type": "official_museum_page",
        "url": "https://eidsvoll1814.no/eidsvollbygningen",
        "repository_source": "data/places/politikk/akershus/eidsvollsbygningen/eidsvollsbygningen.json",
        "extracted_from": [
          "popupDesc",
          "externalLinks"
        ],
        "temporal_scope": {
          "from": 1814,
          "to": null
        },
        "limitations": [
          "Museets presentasjon er autoritativ for anlegget og formidlingen, men er også del av en nasjonal minneinstitusjon.",
          "Nettsiden gir et oversiktsnivå og erstatter ikke protokoller, brev og andre primærkilder fra Riksforsamlingen."
        ],
        "tier": "A",
        "rationale": "Offisiell museumskilde for bygningen, Riksforsamlingen og 1814-formidlingen."
      },
      {
        "source_id": "src_his_riksantikvaren_eidsvollsbygningen",
        "title": "Fredet Eidsvollsbygningen",
        "publisher": "Riksantikvaren",
        "source_type": "official_heritage_page",
        "url": "https://riksantikvaren.no/fredninger/fredet-eidsvollsbygningen/",
        "repository_source": "data/places/politikk/akershus/eidsvollsbygningen/eidsvollsbygningen.json",
        "extracted_from": [
          "coordNote",
          "externalLinks"
        ],
        "temporal_scope": {
          "from": 1814,
          "to": null
        },
        "limitations": [
          "Fredningssiden prioriterer kulturminneverdier og forvaltningshistorie fremfor en full politisk analyse av 1814.",
          "Vernet beskriver anlegget i dagens kulturminneforvaltning og må skilles fra historiske eiendomsgrenser og bruk."
        ],
        "tier": "A",
        "rationale": "Offisiell kulturminnekilde for bygningens identitet, vern og nasjonalmonumentale status."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_eidsvollsbygningen_constitution_1814",
        "statement": "Riksforsamlingen møttes i Eidsvollsbygningen fra 10. april til 20. mai 1814, vedtok Grunnloven 17. mai og valgte Christian Frederik til norsk konge.",
        "claim_type": "constitutional_process",
        "temporal": {
          "from": "1814-04-10",
          "to": "1814-05-20"
        },
        "source_ids": [
          "src_his_eidsvoll1814_eidsvollsbygningen"
        ],
        "emne_patterns": [
          "1814_statsdannelse_suverenitet",
          "1814_statsdannelse_kiel",
          "1814_grunnloven_statsdannelse",
          "stat_institusjoner"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "low",
          "note": "Datoene og hovedbeslutningene er sentrale, etablerte deler av den dokumenterte 1814-kronologien."
        },
        "alternative_interpretations": [
          "Stedet symboliserer nasjonal suverenitet og representasjon, men forsamlingen var sosialt og politisk avgrenset og ga ikke alle grupper lik deltakelse."
        ]
      },
      {
        "claim_id": "claim_his_eidsvollsbygningen_national_monument_1837",
        "statement": "Eidsvollsbygningen med paviljonger og park ble kjøpt inn som nasjonalmonument i 1837, og staten overtok anlegget i 1851; stedet ble dermed tidlig institusjonalisert som nasjonalt minne.",
        "claim_type": "heritage_institutionalization",
        "temporal": {
          "from": 1837,
          "to": 1851
        },
        "source_ids": [
          "src_his_eidsvoll1814_eidsvollsbygningen",
          "src_his_riksantikvaren_eidsvollsbygningen"
        ],
        "emne_patterns": [
          "nasjonal_identitet_fortellinger",
          "minnesteder_historiebruk",
          "kulturminner_bevaring",
          "jubileum_seremoni_historiebruk"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Hoveddatoene er dokumentert i stedets formidling, men kjøps-, eierskaps- og restaureringshistorien har flere juridiske og materielle ledd."
        },
        "alternative_interpretations": [
          "Nasjonalmonumentet bevarer et demokratisk symbol, men kulturarvprosessen former også hvilke personer, rom og konflikter som får stå i sentrum."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_folkets_hus",
    "place_id": "folkets_hus_oslo",
    "sources": [
      {
        "source_id": "src_his_arbark_folkets_hus_oslo",
        "title": "Folkets Hus bygges",
        "publisher": "Arbeiderbevegelsens arkiv og bibliotek",
        "source_type": "archive_illustrated_history",
        "url": "https://www.arbark.no/Bildeserier/folketshus/Folkets_Hus.htm",
        "repository_source": "data/leksikon/places/oslo/politikk/leksikon_folkets_hus_oslo.json",
        "extracted_from": [
          "facts",
          "chronology",
          "externalLinks"
        ],
        "temporal_scope": {
          "from": 1907,
          "to": 1962
        },
        "limitations": [
          "Bildeserien er kuratert av arbeiderbevegelsens eget arkiv og vektlegger institusjonens bygge- og organisasjonshistorie.",
          "Nettformatet gir begrenset kildeapparat for hvert bilde og hver detalj i byggeprosessen."
        ],
        "tier": "A",
        "rationale": "Institusjonsarkivets kildebaserte framstilling av Folkets Hus' byggefaser."
      },
      {
        "source_id": "src_his_snl_folkets_hus_oslo",
        "title": "Folkets hus – Oslo",
        "publisher": "Store norske leksikon",
        "source_type": "reference_encyclopedia",
        "url": "https://snl.no/Folkets_hus_-_Oslo",
        "repository_source": "data/leksikon/places/oslo/politikk/leksikon_folkets_hus_oslo.json",
        "extracted_from": [
          "facts",
          "chronology",
          "externalLinks"
        ],
        "temporal_scope": {
          "from": 1907,
          "to": null
        },
        "limitations": [
          "Leksikonartikkelen sammenfatter institusjons-, arkitektur- og organisasjonshistorie i kort form.",
          "Kilden bør suppleres med organisasjonsarkiver ved analyse av beslutninger, medlemsbruk og interne konflikter."
        ],
        "tier": "B",
        "rationale": "Redigert referansekilde for byggefaser, arkitekt og institusjonsfunksjoner."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_folkets_hus_first_opened_1907",
        "statement": "Det første Folkets Hus ved Youngstorget åpnet i 1907 som et felles møte- og organisasjonssted for arbeiderbevegelsen.",
        "claim_type": "institutional_foundation",
        "temporal": {
          "from": 1907,
          "to": 1907
        },
        "source_ids": [
          "src_his_arbark_folkets_hus_oslo",
          "src_his_snl_folkets_hus_oslo"
        ],
        "emne_patterns": [
          "arbeiderbevegelse_folkedannelse",
          "organisering_motstand_offentlighet",
          "sivilsamfunn",
          "arbeid_nettverk_naring"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "low",
          "note": "Åpningsåret og institusjonstypen er eksplisitt dokumentert i arkiv- og leksikonkildene."
        },
        "alternative_interpretations": [
          "Huset var et uttrykk for organisasjonsfrihet og kollektiv kapasitet, men representerte ulike deler av arbeiderbevegelsen med skiftende makt og tilgang."
        ]
      },
      {
        "claim_id": "claim_his_folkets_hus_current_complex_1958_1962",
        "statement": "Dagens Folkets Hus-anlegg ble reist i byggetrinn fra 1958 til 1962 og samlet fagorganisasjoner, møter, kongressfunksjoner og Arbeiderbevegelsens arkiv og bibliotek.",
        "claim_type": "organizational_infrastructure",
        "temporal": {
          "from": 1958,
          "to": 1962
        },
        "source_ids": [
          "src_his_arbark_folkets_hus_oslo",
          "src_his_snl_folkets_hus_oslo"
        ],
        "emne_patterns": [
          "arbeiderbevegelse_folkedannelse",
          "kunnskapsinstitusjoner_ekspertise",
          "arkiv_og_dokumentasjon",
          "stat_institusjoner"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "low",
          "note": "Byggeårene og hovedfunksjonene er eksplisitt oppgitt, mens intern rombruk og organisasjonssammensetning har endret seg."
        },
        "alternative_interpretations": [
          "Anlegget kan leses som varig demokratisk infrastruktur, men også som uttrykk for profesjonalisering og sentralisering i en stor organisasjon."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_akerselva",
    "place_id": "akerselva",
    "sources": [
      {
        "source_id": "src_his_oslo_kommune_akerselva",
        "title": "Lakes and rivers in Oslo",
        "publisher": "Oslo kommune",
        "source_type": "official_municipal_page",
        "url": "https://www.oslo.kommune.no/english/welcome-to-oslo/life-in-oslo/enjoy-the-outdoors/lakes-and-rivers/",
        "repository_source": "data/places/by/oslo/places/akerselva.json",
        "extracted_from": [
          "coordSourceUrl",
          "coordNote"
        ],
        "temporal_scope": {
          "from": null,
          "to": null
        },
        "limitations": [
          "Kommunesiden presenterer dagens elv og friluftsbruk og er ikke en full industri- eller miljøhistorisk studie.",
          "Den engelskspråklige oversikten kan endres og gir begrenset dokumentasjon av historiske utslipp og planprosesser."
        ],
        "tier": "A",
        "rationale": "Offisiell kommunal kilde for elveløpet og Akerselva som sammenhengende by- og naturakse."
      },
      {
        "source_id": "src_his_snl_akerselva",
        "title": "Akerselva",
        "publisher": "Store norske leksikon",
        "source_type": "reference_encyclopedia",
        "url": "https://snl.no/Akerselva",
        "repository_source": "data/places/by/oslo/places/akerselva.json",
        "extracted_from": [
          "desc",
          "popupDesc"
        ],
        "temporal_scope": {
          "from": 1100,
          "to": null
        },
        "limitations": [
          "Leksikonartikkelen sammenfatter en lang natur-, industri- og byhistorie og kan utelate lokale variasjoner langs elveløpet.",
          "Oversikten bør suppleres med bedriftsarkiver, miljømålinger og kommunale plandokumenter ved detaljert analyse."
        ],
        "tier": "B",
        "rationale": "Redigert referansekilde for Akerselvas fosser, industrihistorie og senere miljø- og byomforming."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_akerselva_industrial_energy_axis",
        "statement": "Akerselvas mange fosser ga kraft til møller, sagbruk, papirproduksjon, spinnerier og verksteder og gjorde elva til en sentral produksjonsakse i Christianias industrialisering.",
        "claim_type": "industrial_landscape",
        "temporal": {
          "from": 1100,
          "to": 1950
        },
        "source_ids": [
          "src_his_snl_akerselva"
        ],
        "emne_patterns": [
          "industriby_1900",
          "industri_produksjon_energi",
          "arbeid_nettverk_naring",
          "modernisering_1800"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Hovedsammenhengen mellom vannkraft og industri er etablert, men virksomhetene hadde ulike perioder, teknologier og arbeidsregimer."
        },
        "alternative_interpretations": [
          "Elva kan framstilles som motor for vekst, men den samme produksjonen skapte klassedelte boområder, farlig arbeid og omfattende forurensning."
        ]
      },
      {
        "claim_id": "claim_his_akerselva_environmental_reuse_from_1986",
        "statement": "Fra 1986 ble Akerselva Miljøpark utviklet for å bedre tilgjengelighet, vern og miljøkvalitet, samtidig som tidligere fabrikkbygg gradvis fikk nye kultur-, utdannings- og næringsfunksjoner.",
        "claim_type": "environmental_and_urban_transformation",
        "temporal": {
          "from": 1986,
          "to": null
        },
        "source_ids": [
          "src_his_oslo_kommune_akerselva",
          "src_his_snl_akerselva"
        ],
        "emne_patterns": [
          "miljo_klima_naturforvaltning",
          "avindustrialisering_ombruk_industriarv",
          "riving_ombruk_bevaring",
          "urban_natur_helse"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Startåret og hovedretningen er dokumentert, men miljøforbedring, vern og eiendomsomforming skjedde i mange tiltak over flere tiår."
        },
        "alternative_interpretations": [
          "Miljøpark og ombruk kan leses som rehabilitering av et forurenset industrilandskap, men også som grunnlag for eiendomsutvikling og sosial endring."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_hl_senteret_villa_grande",
    "place_id": "villa_grande",
    "sources": [
      {
        "source_id": "src_his_hl_senteret_official",
        "title": "HL-senteret",
        "publisher": "Senter for studier av Holocaust og livssynsminoriteter",
        "source_type": "official_institution_page",
        "url": "https://www.hlsenteret.no/",
        "repository_source": "data/stories/stories_villa_grande.json",
        "extracted_from": [
          "sources",
          "story"
        ],
        "temporal_scope": {
          "from": 1941,
          "to": null
        },
        "limitations": [
          "Institusjonens egen nettside er autoritativ for dagens virksomhet, men representerer også senterets faglige og formidlingsmessige selvpresentasjon.",
          "Forsiden gir ikke nødvendigvis full bygningshistorie eller dokumentasjon av alle ombyggings- og brukslag."
        ],
        "tier": "A",
        "rationale": "Offisiell institusjonskilde for HL-senterets virksomhet i Villa Grande."
      },
      {
        "source_id": "src_his_bmc_villa_grande_new_wing",
        "title": "Villa Grande – HL-senterets nye fløy",
        "publisher": "BMC Norge",
        "source_type": "project_presentation",
        "url": "https://bmc-norge.no/prosjekter/villa-grande-hl-senterets-nye-floy/",
        "repository_source": "data/stories/stories_villa_grande.json",
        "extracted_from": [
          "sources",
          "story"
        ],
        "temporal_scope": {
          "from": 2000,
          "to": null
        },
        "limitations": [
          "Prosjektpresentasjonen er knyttet til en leverandør og kan ha et markedsførende perspektiv på byggeprosjektet.",
          "Kilden dokumenterer nyere fysisk utvikling bedre enn okkupasjonstidens politiske historie."
        ],
        "tier": "C",
        "rationale": "Inspectabel prosjektkilde for den nyere institusjonelle og fysiske omformingen av Villa Grande."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_villa_grande_gimle_quisling_residence_1941",
        "statement": "Nasjonal Samlings myndigheter tok Villa Grande i bruk i 1941 og bygde den om til Vidkun og Maria Quislings bevoktede residens under navnet «Gimle».",
        "claim_type": "occupation_power_site",
        "temporal": {
          "from": 1941,
          "to": 1945
        },
        "source_ids": [
          "src_his_hl_senteret_official"
        ],
        "emne_patterns": [
          "okkupasjon_motstand",
          "stat_institusjoner",
          "idehistorie_fascisme_nazisme_kommunisme",
          "kontroll_overvakning"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Hovedfunksjonen og navnet er etablert, mens ombyggingsdetaljer og beslutningskjeder krever arkiv- og bygningshistoriske spesialkilder."
        },
        "alternative_interpretations": [
          "Residensen kan analyseres som privat bolig, men fungerte også som sikret og iscenesatt maktsentrum for et kollaborasjonsregime."
        ]
      },
      {
        "claim_id": "claim_his_villa_grande_transformed_to_hl_center",
        "statement": "Villa Grande ble i etterkrigstiden omformet fra et belastet maktsted til HL-senterets forsknings-, undervisnings- og formidlingssted for Holocaust, minoriteter, antisemittisme og menneskerettigheter.",
        "claim_type": "critical_reuse_and_memory",
        "temporal": {
          "from": 1945,
          "to": null
        },
        "source_ids": [
          "src_his_hl_senteret_official",
          "src_his_bmc_villa_grande_new_wing"
        ],
        "emne_patterns": [
          "minnesteder_historiebruk",
          "minoritetshistorie",
          "riving_ombruk_bevaring",
          "museum_samling_kanon"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Dagens funksjon er klar, men overgangen omfatter flere mellomliggende institusjonsbruk og byggeprosjekter."
        },
        "alternative_interpretations": [
          "Kritisk ombruk kan utfordre stedets autoritære arv, men opphever ikke konflikter om hvordan Quisling, Holocaust og minoritetshistorie skal representeres."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_bispelokket",
    "place_id": "bispelokket",
    "sources": [
      {
        "source_id": "src_his_regjeringen_bispelokket_stmeld28",
        "title": "St.meld. nr. 28 (2001–2002): Utbygging av Bjørvika",
        "publisher": "Regjeringen.no",
        "source_type": "government_white_paper",
        "url": "https://www.regjeringen.no/no/dokumenter/stmeld-nr-28-2001-2002-/id432071/?ch=3",
        "repository_source": "data/places/by/oslo/places/bispelokket.json",
        "extracted_from": [
          "coordSource",
          "coordSourceUrl",
          "popupDesc"
        ],
        "temporal_scope": {
          "from": 1960,
          "to": 2013
        },
        "limitations": [
          "Stortingsmeldingen er et plan- og beslutningsdokument som argumenterer for en bestemt utbyggingsretning.",
          "Dokumentet er sterkest for prosjektforutsetninger og svakere som uavhengig vurdering av sosiale og miljømessige konsekvenser."
        ],
        "tier": "A",
        "rationale": "Offisielt statlig plandokument for Bjørvikatunnelen, trafikkomleggingen og byutviklingen."
      },
      {
        "source_id": "src_his_wikipedia_bispelokket",
        "title": "Bispelokket",
        "publisher": "Wikipedia",
        "source_type": "tertiary_reference",
        "url": "https://en.wikipedia.org/wiki/Bispelokket",
        "repository_source": "data/places/by/oslo/places/bispelokket.json",
        "extracted_from": [
          "desc",
          "popupDesc"
        ],
        "temporal_scope": {
          "from": 1967,
          "to": 2013
        },
        "limitations": [
          "Wikipedia er en åpent redigert tertiærkilde og kan endres uten redaksjonell forhåndskontroll.",
          "Kilden brukes bare som sekundær orientering og må leses sammen med det offisielle plandokumentet og canonical stedsdata."
        ],
        "tier": "C",
        "rationale": "Tertiær oversiktskilde som supplerer den offisielle planproveniensens kronologi."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_bispelokket_completed_1967_traffic_machine",
        "statement": "Bispelokket sto ferdig i 1967 som et planskilt veikryss der E18 i Bispegata og Nylandsveien ble koblet sammen gjennom ramper og broer på flere nivåer.",
        "claim_type": "infrastructure_completion",
        "temporal": {
          "from": 1967,
          "to": 1967
        },
        "source_ids": [
          "src_his_regjeringen_bispelokket_stmeld28",
          "src_his_wikipedia_bispelokket"
        ],
        "emne_patterns": [
          "teknologi_infrastruktur_samfunn",
          "historiske_lag_i_byrom",
          "sanering_byfornyelse",
          "statlig_kapasitet_skatt_infrastruktur"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Ferdigstillelsen og hovedfunksjonen er dokumentert, mens betegnelser, delåpninger og trafikkmålinger kan variere mellom kilder."
        },
        "alternative_interpretations": [
          "Anlegget kan vurderes som teknisk effektivisering av gjennomgangstrafikk, men også som en fysisk og sosial barriere i byen."
        ]
      },
      {
        "claim_id": "claim_his_bispelokket_demolished_after_bjorvika_tunnel",
        "statement": "Etter at Bjørvikatunnelen åpnet i 2010, ble Bispelokket revet etappevis fra 2011 til 2013 og arealet inngikk i nye gater, kollektivforbindelser og offentlige byrom i Bjørvika.",
        "claim_type": "infrastructure_removal_and_urban_change",
        "temporal": {
          "from": 2010,
          "to": 2013
        },
        "source_ids": [
          "src_his_regjeringen_bispelokket_stmeld28",
          "src_his_wikipedia_bispelokket"
        ],
        "emne_patterns": [
          "riving_ombruk_bevaring",
          "sanering_byfornyelse",
          "byutvidelse_gentrifisering",
          "historiske_lag_i_byrom"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "medium",
          "note": "Hovedrekkefølgen er klar, mens sammenhengen mellom hvert rivningstrinn og senere byrom består av flere prosjekter og aktører."
        },
        "alternative_interpretations": [
          "Rivningen kan framstilles som åpning av byen mot fjorden, men må også analyseres sammen med kostnader, eiendomsutvikling og hvem de nye byrommene er tilgjengelige for."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_22_juli_senteret",
    "place_id": "22_juli_senteret",
    "sources": [
      {
        "source_id": "src_his_22_juli_senteret_official",
        "title": "22. juli-senteret",
        "publisher": "22. juli-senteret",
        "source_type": "official_institution_page",
        "url": "https://www.22julisenteret.no/",
        "repository_source": "data/places/politikk/oslo/places_politikk/22_juli_senteret.json",
        "extracted_from": [
          "popupDesc",
          "externalLinks"
        ],
        "temporal_scope": {
          "from": 2011,
          "to": null
        },
        "limitations": [
          "Institusjonens egen nettside er autoritativ for formål og tilbud, men er også en kuratert selvpresentasjon av minne- og læringsarbeidet.",
          "Nettsiden kan endres og erstatter ikke kommisjonsrapporter, rettsdokumenter eller forskningslitteratur om terrorangrepene."
        ],
        "tier": "A",
        "rationale": "Offisiell kilde for senterets mandat, formidling og permanente institusjonssted."
      },
      {
        "source_id": "src_his_snl_bombeangrepet_regjeringskvartalet",
        "title": "Bombeangrepet på regjeringskvartalet",
        "publisher": "Store norske leksikon",
        "source_type": "reference_encyclopedia",
        "url": "https://snl.no/Bombeangrepet_p%C3%A5_regjeringskvartalet",
        "repository_source": "data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json",
        "extracted_from": [
          "chronology.chrono_2011",
          "facts"
        ],
        "temporal_scope": {
          "from": "2011-07-22",
          "to": "2011-07-22"
        },
        "limitations": [
          "Leksikonartikkelen sammenfatter hendelsen og kan ikke gjengi alle berørte personers erfaringer eller hele etterforskningsmaterialet.",
          "Kilden må skilles fra senterets senere minne- og læringsarbeid og fra normative fortolkninger av demokrati og ekstremisme."
        ],
        "tier": "B",
        "rationale": "Redigert referansekilde for bombeangrepet og åstedet i Regjeringskvartalet."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_22_juli_center_documents_attacks_and_democracy",
        "statement": "22. juli-senteret dokumenterer terrorangrepene mot Regjeringskvartalet og Utøya, menneskene som ble rammet og samfunnets arbeid med demokrati, ekstremisme, beredskap og minnekultur.",
        "claim_type": "memory_and_learning_institution",
        "temporal": {
          "from": 2011,
          "to": null
        },
        "source_ids": [
          "src_his_22_juli_senteret_official"
        ],
        "emne_patterns": [
          "terror_samtidshistorie",
          "minnesteder_historiebruk",
          "gjenoppbygging_minne",
          "samtid_ettertid_fortelling"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "low",
          "note": "Institusjonens mandat og temaer er eksplisitt formidlet av senteret."
        },
        "alternative_interpretations": [
          "Et nasjonalt læringssenter må både bevare dokumentasjon og åpne for uenighet om årsaker, ansvar, beredskap, politisk ekstremisme og hvilke minner som får offentlig plass."
        ]
      },
      {
        "claim_id": "claim_his_22_juli_center_akersgata42_site_connection",
        "statement": "Den permanente plasseringen i Akersgata 42 knytter 22. juli-senterets læringsarbeid fysisk til Regjeringskvartalet, der bombeangrepet 22. juli 2011 drepte åtte mennesker.",
        "claim_type": "site_bound_memory_institution",
        "temporal": {
          "from": 2011,
          "to": null
        },
        "source_ids": [
          "src_his_22_juli_senteret_official",
          "src_his_snl_bombeangrepet_regjeringskvartalet"
        ],
        "emne_patterns": [
          "terror_samtidshistorie",
          "historiske_lag_i_byrom",
          "minnesteder_historiebruk",
          "styring_krise_kontinuitet"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "low",
          "note": "Adressetilknytningen og åstedets plassering er direkte dokumentert i de canonical steds- og leksikondataene."
        },
        "alternative_interpretations": [
          "Nærheten til åstedet gir sterk autentisitets- og minneverdi, men senterets nasjonale mandat omfatter også Utøya og erfaringer langt utenfor Oslo sentrum."
        ]
      }
    ]
  },
  {
    "case_id": "case_his_gamle_deichman_pa_hammersborg",
    "place_id": "gamle_deichman",
    "sources": [
      {
        "source_id": "src_his_snl_deichman_library",
        "title": "Deichman (bibliotek)",
        "publisher": "Store norske leksikon",
        "source_type": "reference_encyclopedia",
        "url": "https://snl.no/Deichman_%28bibliotek%29",
        "repository_source": "data/stories/stories_gamle_deichman.json",
        "extracted_from": [
          "sources",
          "story"
        ],
        "temporal_scope": {
          "from": 1785,
          "to": null
        },
        "limitations": [
          "Leksikonartikkelen dekker bibliotekinstitusjonen gjennom flere adresser og kan komprimere Hammersborg-bygningens særlige brukshistorie.",
          "Kilden bør suppleres med bibliotekarkiv, brukerhistorie og bygningsundersøkelser ved detaljert sosial- og arkitekturhistorie."
        ],
        "tier": "B",
        "rationale": "Redigert referansekilde for Deichmans institusjonshistorie og perioden som hovedbibliotek."
      },
      {
        "source_id": "src_his_deich_fotohuset_official",
        "title": "Fotohuset Deich",
        "publisher": "Deich",
        "source_type": "official_project_page",
        "url": "https://www.deich.no/no/fotohuset-deich",
        "repository_source": "data/places/litteratur/oslo/places_litteratur/gamle_deichman.json",
        "extracted_from": [
          "popupDesc",
          "externalLinks"
        ],
        "temporal_scope": {
          "from": 2019,
          "to": 2028
        },
        "limitations": [
          "Prosjektsiden beskriver en framtidig ombruk og kan bli endret dersom framdrift, aktører eller åpningsdato justeres.",
          "Kilden er prosjektets egen presentasjon og er ikke en uavhengig vurdering av kulturminne-, økonomi- eller tilgjengelighetskonsekvenser."
        ],
        "tier": "A",
        "rationale": "Offisiell prosjektkilde for den planlagte ombruken av det tidligere hovedbiblioteket."
      }
    ],
    "claims": [
      {
        "claim_id": "claim_his_gamle_deichman_main_library_1933_2019",
        "statement": "Bibliotekbygningen på Hammersborg åpnet i 1933 og fungerte som Deichmans hovedbibliotek fram til 2019, som et sentralt offentlig rom for lesing, studier og tilgang til informasjon.",
        "claim_type": "public_knowledge_institution",
        "temporal": {
          "from": 1933,
          "to": 2019
        },
        "source_ids": [
          "src_his_snl_deichman_library"
        ],
        "emne_patterns": [
          "kunnskapsinstitusjoner_ekspertise",
          "museum_samling_kanon",
          "arkiv_og_dokumentasjon",
          "sosialhistorie_hverdagsliv"
        ],
        "confidence": "high",
        "uncertainty": {
          "level": "low",
          "note": "Perioden som hovedbibliotek er klart dokumentert, mens brukernes erfaringer og tilgang må undersøkes gjennom andre kildetyper."
        },
        "alternative_interpretations": [
          "Bygningen representerte kunnskap som offentlig gode, men monumental arkitektur, samlingspolitikk og adgangsordninger formet også hvem og hva institusjonen gjorde synlig."
        ]
      },
      {
        "claim_id": "claim_his_gamle_deichman_planned_fotohuset_reuse",
        "statement": "Etter at biblioteket flyttet ut, ble det tidligere hovedbiblioteket planlagt ombrukt som Fotohuset Deich, et framtidig museum-, møte- og formidlingshus for fotografi med planlagt åpning i 2028.",
        "claim_type": "future_adaptive_reuse",
        "temporal": {
          "from": 2019,
          "to": 2028
        },
        "source_ids": [
          "src_his_deich_fotohuset_official"
        ],
        "emne_patterns": [
          "riving_ombruk_bevaring",
          "visuelle_kilder_fotografi",
          "museum_samling_kanon",
          "kulturminner_bevaring"
        ],
        "confidence": "medium",
        "uncertainty": {
          "level": "high",
          "note": "Dette er en framtidsplan per 2026; funksjon, aktører og åpningstidspunkt kan endres før huset faktisk åpner."
        },
        "alternative_interpretations": [
          "Ombruket kan bevare et offentlig kulturbygg og gi ny aktivitet, men det reiser også spørsmål om kontinuitet mellom folkebibliotekets brede mandat og en ny spesialisert kulturinstitusjon."
        ]
      }
    ]
  }
];
const validatorSource = Buffer.from('IyEvdXNyL2Jpbi9lbnYgbm9kZQppbXBvcnQgZnMgZnJvbSAnbm9kZTpzJzsKaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJzsKCmNvbnN0IHJvb3QgPSBwcm9jZXNzLmN3ZCgpOwpjb25zdCBBID0gKHZhbHVlKSA9PiBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW107CmNvbnN0IHJlYWRKc29uID0gKGZpbGUpID0+IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGZpbGUsICd1dGY4JykpOwpjb25zdCBmYWlsID0gKG1lc3NhZ2UpID0+IHsgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpOyB9Owpjb25zdCB1bmlxdWVJZHMgPSAoaXRlbXMsIGtleSwgbGFiZWwpID0+IHsKICBjb25zdCBpZHMgPSBpdGVtcy5tYXAoKGl0ZW0pID0+IGl0ZW1ba2V5XSk7CiAgaWYgKGlkcy5zb21lKChpZCkgPT4gIWlkKSkgZmFpbChgJHtsYWJlbH0gaGFzIG1pc3NpbmcgJHtrZXl9YCk7CiAgaWYgKG5ldyBTZXQoaWRzKS5zaXplICE9PSBpZHMubGVuZ3RoKSBmYWlsKGAke2xhYmVsfSBoYXMgZHVwbGljYXRlICR7a2V5fWApOwogIHJldHVybiBuZXcgU2V0KGlkcyk7Cn07CmNvbnN0IHJlbGF0aXZlID0gKGZpbGUpID0+IHBhdGgucmVsYXRpdmUocm9vdCwgZmlsZSkuc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKTsKCmZ1bmN0aW9uIGxpc3RKc29uRmlsZXMoZGlyZWN0b3J5LCByZXN1bHQgPSBbXSkgewogIGlmICghZnMuZXhpc3RzU3luYyhkaXJlY3RvcnkpKSByZXR1cm4gcmVzdWx0OwogIGZvciAoY29uc3QgZW50cnkgb2YgZnMucmVhZGRpclN5bmMoZGlyZWN0b3J5LCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSkpIHsKICAgIGNvbnN0IGFic29sdXRlID0gcGF0aC5qb2luKGRpcmVjdG9yeSwgZW50cnkubmFtZSk7CiAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSkgbGlzdEpzb25GaWxlcyhhYnNvbHV0ZSwgcmVzdWx0KTsKICAgIGVsc2UgaWYgKGVudHJ5LmlzRmlsZSgpICYmIGVudHJ5Lm5hbWUuZW5kc1dpdGgoJy5qc29uJykpIHJlc3VsdC5wdXNoKGFic29sdXRlKTsKICB9CiAgcmV0dXJuIHJlc3VsdDsKfQoKZnVuY3Rpb24gY29sbGVjdElkcyh2YWx1ZSwgcmVzdWx0ID0gbmV3IFNldCgpKSB7CiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7CiAgICB2YWx1ZS5mb3JFYWNoKChpdGVtKSA9PiBjb2xsZWN0SWRzKGl0ZW0sIHJlc3VsdCkpOwogICAgcmV0dXJuIHJlc3VsdDsKICB9CiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm4gcmVzdWx0OwogIGlmICh0eXBlb2YgdmFsdWUuaWQgPT09ICdzdHJpbmcnICYmIHZhbHVlLmlkKSByZXN1bHQuYWRkKHZhbHVlLmlkKTsKICBmb3IgKGNvbnN0IGNoaWxkIG9mIE9iamVjdC52YWx1ZXModmFsdWUpKSBjb2xsZWN0SWRzKGNoaWxkLCByZXN1bHQpOwogIHJldHVybiByZXN1bHQ7Cn0KCmNvbnN0IGggPSBwYXRoLmpvaW4ocm9vdCwgJ2RhdGEvZmFnL2hpc3RvcmllJyk7CmNvbnN0IGVtbmVyID0gcmVhZEpzb24ocGF0aC5qb2luKGgsICdlbW5lcl9oaXN0b3JpZV9jYW5vbmljYWxfdjRfNS5qc29uJykpOwpjb25zdCByZXF1aXJlbWVudHNGaWxlID0gcmVhZEpzb24ocGF0aC5qb2luKGgsICdjYXNlX3JlcXVpcmVtZW50c19oaXN0b3JpZV9jYW5vbmljYWxfdjEuanNvbicpKTsKY29uc3QgY2xhaW1zRmlsZSA9IHJlYWRKc29uKHBhdGguam9pbihoLCAnY2xhaW1zX2hpc3RvcmllX2Nhbm9uaWNhbF92MS5qc29uJykpOwpjb25zdCBzb3VyY2VzRmlsZSA9IHJlYWRKc29uKHBhdGguam9pbihoLCAnc291cmNlc19oaXN0b3JpZV9jYW5vbmljYWxfdjEuanNvbicpKTsKY29uc3QgZXZpZGVuY2VGaWxlID0gcmVhZEpzb24ocGF0aC5qb2luKGgsICdwbGFjZV9ldmlkZW5jZV9oaXN0b3JpZV92MS5qc29uJykpOwpjb25zdCBwcm9maWxlID0gcmVhZEpzb24ocGF0aC5qb2luKHJvb3QsICdkYXRhL2ZhZy9wcm9maWxlcy9oaXN0b3JpZS9vc2xvX2FrZXJzaHVzL3Byb2ZpbGUuanNvbicpKTsKY29uc3QgcHJvZmlsZXNNYW5pZmVzdCA9IHJlYWRKc29uKHBhdGguam9pbihyb290LCAnZGF0YS9mYWcvcHJvZmlsZXMvbWFuaWZlc3QuanNvbicpKTsKCmNvbnN0IHJlcXVpcmVtZW50cyA9IEEocmVxdWlyZW1lbnRzRmlsZS5yZXF1aXJlbWVudHMpOwpjb25zdCBjbGFpbXMgPSBBKGNsYWltc0ZpbGUuY2xhaW1zKTsKY29uc3Qgc291cmNlcyA9IEEoc291cmNlc0ZpbGUuc291cmNlcyk7CmNvbnN0IGV2aWRlbmNlID0gQShldmlkZW5jZUZpbGUuZXZpZGVuY2VfbGlua3MpOwpjb25zdCBjYXNlcyA9IEEocHJvZmlsZS5jYXNlcyk7CmNvbnN0IG1hcHBpbmdzID0gQShwcm9maWxlLmVtbmVfY2FzZV9tYXBwaW5ncyk7Cgpjb25zdCBlbW5lSWRzID0gdW5pcXVlSWRzKGVtbmVyLCAnZW1uZV9pZCcsICdlbW5lcicpOwpjb25zdCByZXF1aXJlbWVudElkcyA9IHVuaXF1ZUlkcyhyZXF1aXJlbWVudHMsICdyZXF1aXJlbWVudF9pZCcsICdjYXNlIHJlcXVpcmVtZW50cycpOwpjb25zdCBjbGFpbUlkcyA9IHVuaXF1ZUlkcyhjbGFpbXMsICdjbGFpbV9pZCcsICdjbGFpbXMnKTsKY29uc3Qgc291cmNlSWRzID0gdW5pcXVlSWRzKHNvdXJjZXMsICdzb3VyY2VfaWQnLCAnc291cmNlcycpOwp1bmlxdWVJZHMoZXZpZGVuY2UsICdldmlkZW5jZV9pZCcsICdldmlkZW5jZScpOwpjb25zdCBjYXNlSWRzID0gdW5pcXVlSWRzKGNhc2VzLCAnY2FzZV9pZCcsICdwcm9maWxlIGNhc2VzJyk7CgppZiAocmVxdWlyZW1lbnRzLmxlbmd0aCAhPT0gNCkgZmFpbChgRXhwZWN0ZWQgNCBjYXNlIHJlcXVpcmVtZW50cywgZ290ICR7cmVxdWlyZW1lbnRzLmxlbmd0aH1gKTsKaWYgKGVtbmVyLnNvbWUoKGVtbmUpID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlbW5lLCAncmVjb21tZW5kZWRfb3Nsb19jYXNlcycpKSkgewogIGZhaWwoJ3JlY29tbWVuZGVkX29zbG9fY2FzZXMgcmVtYWlucyBpbiB1bml2ZXJzYWwgZW1uZXInKTsKfQpmb3IgKGNvbnN0IGVtbmUgb2YgZW1uZXIpIHsKICBjb25zdCBpZHMgPSBBKGVtbmUuY2FzZV9yZXF1aXJlbWVudF9pZHMpOwogIGlmIChpZHMubGVuZ3RoICE9PSA0KSBmYWlsKGAke2VtbmUuZW1uZV9pZH0gbXVzdCByZWZlcmVuY2UgNCBjYXNlIHJlcXVpcmVtZW50c2ApOwogIGZvciAoY29uc3QgaWQgb2YgaWRzKSBpZiAoIXJlcXVpcmVtZW50SWRzLmhhcyhpZCkpIGZhaWwoYCR7ZW1uZS5lbW5lX2lkfSByZWZlcmVuY2VzIHVua25vd24gY2FzZSByZXF1aXJlbWVudCAke2lkfWApOwp9CgppZiAocHJvZmlsZS5zdWJqZWN0X2lkICE9PSAnaGlzdG9yaWUnIHx8IHByb2ZpbGUuY2Fub25pY2FsX3N1YmplY3RfdmVyc2lvbiAhPT0gJ3Y1LjgnKSB7CiAgZmFpbCgnUHJvZmlsZSBzdWJqZWN0L3ZlcnNpb24gbWlzbWF0Y2gnKTsKfQppZiAocHJvZmlsZS5nZW9ncmFwaHk/Lmdlb2dyYXBoeV9pZCAhPT0gJ2dlb19ub19vc2xvX2FrZXJzaHVzJykgZmFpbCgnUHJvZmlsZSBnZW9ncmFwaHkgbWlzbWF0Y2gnKTsKaWYgKCFBKHByb2ZpbGVzTWFuaWZlc3QucHJvZmlsZXMpLnNvbWUoKGl0ZW0pID0+IGl0ZW0ucHJvZmlsZV9pZCA9PT0gcHJvZmlsZS5wcm9maWxlX2lkKSkgewogIGZhaWwoJ1Byb2ZpbGUgbWlzc2luZyBmcm9tIHByb2ZpbGVzIG1hbmlmZXN0Jyk7Cn0KY29uc3QgYXJjaGl0ZWN0dXJlUGF0aCA9IFN0cmluZyhwcm9maWxlLmNvbnRyYWN0Py5hcmNoaXRlY3R1cmVfY29udHJhY3QgfHwgJycpLnNwbGl0KCcjJylbMF07CmlmICghYXJjaGl0ZWN0dXJlUGF0aCB8fCAhZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocm9vdCwgYXJjaGl0ZWN0dXJlUGF0aCkpKSB7CiAgZmFpbChgUHJvZmlsZSBhcmNoaXRlY3R1cmUgY29udHJhY3QgZG9lcyBub3QgcmVzb2x2ZTogJHtwcm9maWxlLmNvbnRyYWN0Py5hcmNoaXRlY3R1cmVfY29udHJhY3R9YCk7Cn0KaWYgKG1hcHBpbmdzLmxlbmd0aCA8IDE5MCkgZmFpbChgRXhwZWN0ZWQgYXQgbGVhc3QgMTkwIG1pZ3JhdGVkIE9zbG8vQWtlcnNodXMgZW1uZSBtYXBwaW5ncywgZ290ICR7bWFwcGluZ3MubGVuZ3RofWApOwppZiAoY2FzZXMubGVuZ3RoIDwgMjApIGZhaWwoYEV4cGVjdGVkIHByZXNlcnZlZCBsZWdhY3kgY2FzZSBjYW5kaWRhdGVzLCBnb3Qgb25seSAke2Nhc2VzLmxlbmd0aH1gKTsKCmZvciAoY29uc3QgbWFwcGluZyBvZiBtYXBwaW5ncykgewogIGlmICghZW1uZUlkcy5oYXMobWFwcGluZy5lbW5lX2lkKSkgZmFpbChgUHJvZmlsZSBtYXBwaW5nIHJlZmVyZW5jZXMgdW5rbm93biBlbW5lICR7bWFwcGluZy5lbW5lX2lkfWApOwogIGZvciAoY29uc3QgaWQgb2YgQShtYXBwaW5nLmNhc2VfaWRzKSkgaWYgKCFjYXNlSWRzLmhhcyhpZCkpIGZhaWwoYFByb2ZpbGUgbWFwcGluZyByZWZlcmVuY2VzIHVua25vd24gY2FzZSAke2lkfWApOwogIGZvciAoY29uc3QgaWQgb2YgQShtYXBwaW5nLmNhc2VfcmVxdWlyZW1lbnRfaWRzKSkgaWYgKCFyZXF1aXJlbWVudElkcy5oYXMoaWQpKSB7CiAgICBmYWlsKGBQcm9maWxlIG1hcHBpbmcgcmVmZXJlbmNlcyB1bmtub3duIHJlcXVpcmVtZW50ICR7aWR9YCk7CiAgfQp9Cgpjb25zdCBjYW5vbmljYWxQbGFjZUlkcyA9IG5ldyBTZXQoKTsKY29uc3QgcGxhY2VQYXJzZUZhaWx1cmVzID0gW107CmZvciAoY29uc3QgZmlsZSBvZiBsaXN0SnNvbkZpbGVzKHBhdGguam9pbihyb290LCAnZGF0YS9wbGFjZXMnKSkpIHsKICB0cnkgewogICAgY29sbGVjdElkcyhyZWFkSnNvbihmaWxlKSwgY2Fub25pY2FsUGxhY2VJZHMpOwogIH0gY2F0Y2ggKGVycm9yKSB7CiAgICBwbGFjZVBhcnNlRmFpbHVyZXMucHVzaChgJHtyZWxhdGl2ZShmaWxlKX06ICR7U3RyaW5nKGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpfWApOwogIH0KfQppZiAocGxhY2VQYXJzZUZhaWx1cmVzLmxlbmd0aCkgZmFpbChgUGxhY2UgSlNPTiBwYXJzZSBmYWlsdXJlczpcbiR7cGxhY2VQYXJzZUZhaWx1cmVzLmpvaW4oJ1xuJyl9YCk7CmlmICghY2Fub25pY2FsUGxhY2VJZHMuc2l6ZSkgZmFpbCgnTm8gY2Fub25pY2FsIHBsYWNlIElEcyBmb3VuZCcpOwoKZm9yIChjb25zdCBzb3VyY2Ugb2Ygc291cmNlcykgewogIGlmICghL15odHRwczpcL1wvLy50ZXN0KHNvdXJjZS51cmwgfHwgJycpKSBmYWlsKGAke3NvdXJjZS5zb3VyY2VfaWR9IGxhY2tzIEhUVFBTIFVSTGApOwogIGlmICghc291cmNlLnNvdXJjZV90eXBlIHx8ICFzb3VyY2UucHVibGlzaGVyIHx8ICFzb3VyY2UucHJvdmVuYW5jZT8uYWNjZXNzZWRfYXQpIHsKICAgIGZhaWwoYCR7c291cmNlLnNvdXJjZV9pZH0gbGFja3Mgc291cmNlIHR5cGUsIHB1Ymxpc2hlciBvciBwcm92ZW5hbmNlYCk7CiAgfQogIGlmIChBKHNvdXJjZS5saW1pdGF0aW9ucykubGVuZ3RoIDwgMikgZmFpbChgJHtzb3VyY2Uuc291cmNlX2lkfSBuZWVkcyBhdCBsZWFzdCB0d28gbGltaXRhdGlvbnNgKTsKICBpZiAoIXNvdXJjZS5xdWFsaXR5Py50aWVyIHx8ICFzb3VyY2UucXVhbGl0eT8ucmF0aW9uYWxlKSBmYWlsKGAke3NvdXJjZS5zb3VyY2VfaWR9IGxhY2tzIHF1YWxpdHkgYXNzZXNzbWVudGApOwogIGNvbnN0IHJlcG9zaXRvcnlTb3VyY2UgPSBTdHJpbmcoc291cmNlLnByb3ZlbmFuY2U/LnJlcG9zaXRvcnlfc291cmNlIHx8ICcnKS5zcGxpdCgnIycpWzBdOwogIGlmICghcmVwb3NpdG9yeVNvdXJjZSB8fCAhZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocm9vdCwgcmVwb3NpdG9yeVNvdXJjZSkpKSB7CiAgICBmYWlsKGAke3NvdXJjZS5zb3VyY2VfaWR9IHJlcG9zaXRvcnlfc291cmNlIGRvZXMgbm90IGV4aXN0OiAke3NvdXJjZS5wcm92ZW5hbmNlPy5yZXBvc2l0b3J5X3NvdXJjZX1gKTsKICB9Cn0KCmZvciAoY29uc3QgY2xhaW0gb2YgY2xhaW1zKSB7CiAgaWYgKCFjbGFpbS5zdGF0ZW1lbnQgfHwgIWNsYWltLmNsYWltX3R5cGUgfHwgIWNsYWltLnNjb3BlKSBmYWlsKGAke2NsYWltLmNsYWltX2lkfSBsYWNrcyBzdGF0ZW1lbnQvdHlwZS9zY29wZWApOwogIGlmICghQShjbGFpbS5zb3VyY2VfaWRzKS5sZW5ndGgpIGZhaWwoYCR7Y2xhaW0uY2xhaW1faWR9IGxhY2tzIHNvdXJjZXNgKTsKICBmb3IgKGNvbnN0IGlkIG9mIEEoY2xhaW0uc291cmNlX2lkcykpIGlmICghc291cmNlSWRzLmhhcyhpZCkpIGZhaWwoYCR7Y2xhaW0uY2xhaW1faWR9IHJlZmVyZW5jZXMgdW5rbm93biBzb3VyY2UgJHtpZH1gKTsKICBmb3IgKGNvbnN0IGlkIG9mIEEoY2xhaW0uZW1uZV9pZHMpKSBpZiAoIWVtbmVJZHMuaGFzKGlkKSkgZmFpbChgJHtjbGFpbS5jbGFpbV9pZH0gcmVmZXJlbmNlcyB1bmtub3duIGVtbmUgJHtpZH1gKTsKICBmb3IgKGNvbnN0IGlkIG9mIEEoY2xhaW0uc2NvcGUuY2FzZV9pZHMpKSBpZiAoIWNhc2VJZHMuaGFzKGlkKSkgZmFpbChgJHtjbGFpbS5jbGFpbV9pZH0gcmVmZXJlbmNlcyB1bmtub3duIGNhc2UgJHtpZH1gKTsKICBmb3IgKGNvbnN0IGlkIG9mIEEoY2xhaW0uc2NvcGUucGxhY2VfaWRzKSkgaWYgKCFjYW5vbmljYWxQbGFjZUlkcy5oYXMoaWQpKSB7CiAgICBmYWlsKGAke2NsYWltLmNsYWltX2lkfSByZWZlcmVuY2VzIG5vbi1jYW5vbmljYWwgcGxhY2UgJHtpZH1gKTsKICB9CiAgaWYgKCFjbGFpbS51bmNlcnRhaW50eT8ubGV2ZWwgfHwgIWNsYWltLnVuY2VydGFpbnR5Py5ub3RlKSBmYWlsKGAke2NsYWltLmNsYWltX2lkfSBsYWNrcyB1bmNlcnRhaW50eSBhc3Nlc3NtZW50YCk7CiAgaWYgKC9BLChjbGFpbS5hbHRlcm5hdGl2ZV9pbnRlcnByZXRhdGlvbnMpLmxlbmd0aCkgZmFpbChgJHtjbGFpbS5jbGFpbV9pZH0gbGFja3MgYWx0ZXJuYXRpdmUgaW50ZXJwcmV0YXRpb24gb3IgY2F2ZWF0YCk7Cn0KCmNvbnN0IGV2aWRlbmNlQnlDYXNlID0gbmV3IE1hcCgpOwpmb3IgKGNvbnN0IGxpbmsgb2YgZXZpZGVuY2UpIHsKICBpZiAoIWNsYWltSWRzLmhhcyhsaW5rLmNsYWltX2lkKSkgZmFpbChgJHtsaW5rLmV2aWRlbmNlX2lkfSByZWZlcmVuY2VzIHVua25vd24gY2xhaW0gJHtsaW5rLmNsYWltX2lkfWApOwogIGlmICghY2FzZUlkcy5oYXMobGluay5jYXNlX2lkKSkgZmFpbChgJHtsaW5rLmV2aWRlbmNlX2lkfSByZWZlcmVuY2VzIHVua25vd24gY2FzZSAke2xpbmsuY2FzZV9pZH1gKTsKICBpZiAoIWNhbm9uaWNhbFBsYWNlSWRzLmhhcyhsaW5rLnBsYWNlX2lkKSkgZmFpbChgJHtsaW5rLmV2aWRlbmNlX2lkfSByZWZlcmVuY2VzIG5vbi1jYW5vbmljYWwgcGxhY2UgJHtsaW5rLnBsYWNlX2lkfWApOwogIGZvciAoY29uc3QgaWQgb2YgQShsaW5rLnNvdXJjZV9pZHMpKSBpZiAoIXNvdXJjZUlkcy5oYXMoaWQpKSBmYWlsKGAke2xpbmsuZXZpZGVuY2VfaWR9IHJlZmVyZW5jZXMgdW5rbm93biBzb3VyY2UgJHtpZH1gKTsKICBmb3IgKGNvbnN0IGlkIG9mIEEobGluay5lbW5lX2lkcykpIGlmICghZW1uZUlkcy5oYXMoaWQpKSBmYWlsKGAke2xpbmsuZXZpZGVuY2VfaWR9IHJlZmVyZW5jZXMgdW5rbm93biBlbW5lICR7aWR9YCk7CiAgY29uc3QgbGlzdCA9IGV2aWRlbmNlQnlDYXNlLmdldChsaW5rLmNhc2VfaWQpID8/IFtdOwogIGxpc3QucHVzaChsaW5rKTsKICBldmlkZW5jZUJ5Q2FzZS5zZXQobGluay5jYXNlX2lkLCBsaXN0KTsKfQoKY29uc3QgdmVyaWZpZWRDYXNlcyA9IGNhc2VzLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5ldmlkZW5jZV9zdGF0dXMgPT09ICdjbGFpbV9zb3VyY2VfbGlua2VkJyk7CmlmICh2ZXJpZmllZENhc2VzLmxlbmd0aCA8IDEwKSBmYWlsKGBFeHBlY3RlZCBhdCBsZWFzdCAxMCBjbGFpbS1zb3VyY2UtbGlua2VkIGNhc2VzLCBnb3QgJHt2ZXJpZmllZENhc2VzLmxlbmd0aH1gKTsKaWYgKGV2aWRlbmNlLmxlbmd0aCA8IDIwKSBmYWlsKGBFeHBlY3RlZCBhdCBsZWFzdCAyMCBldmlkZW5jZSBsaW5rcywgZ290ICR7ZXZpZGVuY2UubGVuZ3RofWApOwoKZm9yIChjb25zdCBwcm9maWxlQ2FzZSBvZiB2ZXJpZmllZENhc2VzKSB7CiAgY29uc3QgcGxhY2VJZHMgPSBBKHByb2ZpbGVDYXNlLnBsYWNlX2lkcyk7CiAgaWYgKCFwbGFjZUlkcy5sZW5ndGgpIGZhaWwoYCR7cHJvZmlsZUNhc2UuY2FzZV9pZH0gaXMgdmVyaWZpZWQgd2l0aG91dCBjYW5vbmljYWwgcGxhY2VfaWRzYCk7CiAgZm9yIChjb25zdCBwbGFjZUlkIG9mIHBsYWNlSWRzKSBpZiAoIWNhbm9uaWNhbFBsYWNlSWRzLmhhcyhwbGFjZUlkKSkgewogICAgZmFpbChgJHtwcm9maWxlQ2FzZS5jYXNlX2lkfSByZWZlcmVuY2VzIG5vbi1jYW5vbmljYWwgcGxhY2UgJHtwbGFjZUlkfWApOwogIH0KICBjb25zdCBsaW5rcyA9IGV2aWRlbmNlQnlDYXNlLmdldChwcm9maWxlQ2FzZS5jYXNlX2lkKSA/PyBbXTsKICBpZiAobGlua3MubGVuZ3RoIDwgMikgZmFpbChgJHtwcm9maWxlQ2FzZS5jYXNlX2lkfSBuZWVkcyBhdCBsZWFzdCB0d28gZXZpZGVuY2UgbGlua3MsIGdvdCAke2xpbmtzLmxlbmd0aH1gKTsKICBmb3IgKGNvbnN0IGxpbmsgb2YgbGlua3MpIHsKICAgIGlmICghcGxhY2VJZHMuaW5jbHVkZXMobGluay5wbGFjZV9pZCkpIHsKICAgICAgZmFpbChgJHtsaW5rLmV2aWRlbmNlX2lkfSBwbGFjZSAke2xpbmsucGxhY2VfaWR9IGlzIG5vdCBkZWNsYXJlZCBvbiAke3Byb2ZpbGVDYXNlLmNhc2VfaWR9YCk7CiAgICB9CiAgfQp9Cgpjb25zdCBjb3VudHMgPSBwcm9maWxlLnByb2R1Y3Rpb25fY292ZXJhZ2UgPz8ge307CmNvbnN0IGV4cGVjdGVkQ291bnRzID0gewogIGNhc2VzX3RvdGFsOiBjYXNlcy5sZW5ndGgsCiAgdmVyaWZpZWRfY2FzZXNfdG90YWw6IHZlcmlmaWVkQ2FzZXMubGVuZ3RoLAogIGNsYWltc190b3RhbDogY2xhaW1zLmxlbmd0aCwKICBzb3VyY2VzX3RvdGFsOiBzb3VyY2VzLmxlbmd0aCwKICBldmlkZW5jZV9saW5rc190b3RhbDogZXZpZGVuY2UubGVuZ3RoLAp9Owpmb3IgKGNvbnN0IFtrZXksIGV4cGVjdGVkXSBvZiBPYmplY3QuZW50cmllcyhleHBlY3RlZENvdW50cykpIHsKICBpZiAoY291bnRzW2tleV0gIT09IGV4cGVjdGVkKSBmYWlsKGBwcm9maWxlLnByb2R1Y3Rpb25fY292ZXJhZ2UuJHtrZXl9OiBleHBlY3RlZCAke2V4cGVjdGVkfSwgZ290ICR7Y291bnRzW2tleV19YCk7Cn0KaWYgKHZlcmlmaWVkQ2FzZXMubGVuZ3RoID49IDEwICYmIGV2aWRlbmNlLmxlbmd0aCA+PSAyMCAmJiBjb3VudHMuc3RhdHVzICE9PSAnQ09NUExFVEUnKSB7CiAgZmFpbChgUHJvZmlsZSB0aHJlc2hvbGQgaXMgY29tcGxldGUgYnV0IHByb2R1Y3Rpb25fY292ZXJhZ2Uuc3RhdHVzPSR7Y291bnRzLnN0YXR1c31gKTsKfQoKY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoewogIHN0YXR1czogJ1BBU1MnLAogIGVtbmVyOiBlbW5lci5sZW5ndGgsCiAgY2FzZV9yZXF1aXJlbWVudHM6IHJlcXVpcmVtZW50cy5sZW5ndGgsCiAgcHJvZmlsZV9tYXBwaW5nczogbWFwcGluZ3MubGVuZ3RoLAogIGNhc2VzOiBjYXNlcy5sZW5ndGgsCiAgdmVyaWZpZWRfY2FzZXM6IHZlcmlmaWVkQ2FzZXMubGVuZ3RoLAogIGNsYWltczogY2xhaW1zLmxlbmd0aCwKICBzb3VyY2VzOiBzb3VyY2VzLmxlbmd0aCwKICBldmlkZW5jZV9saW5rczogZXZpZGVuY2UubGVuZ3RoLAogIGNhbm9uaWNhbF9wbGFjZV9pZHM6IGNhbm9uaWNhbFBsYWNlSWRzLnNpemUsCn0sIG51bGwsIDIpKTsK', 'base64').toString('utf8');
const auditSource = Buffer.from('IyEvdXNyL2Jpbi9lbnYgbm9kZQppbXBvcnQgZnMgZnJvbSAnbm9kZTpzJzsKaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJzsKCmNvbnN0IHJvb3QgPSBwcm9jZXNzLmN3ZCgpOwpjb25zdCBjaGVja01vZGUgPSBwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoJy0tY2hlY2snKTsKY29uc3QgQSA9ICh2YWx1ZSkgPT4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFtdOwpjb25zdCByZWFkSnNvbiA9IChmaWxlKSA9PiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhmaWxlLCAndXRmOCcpKTsKY29uc3Qgc3RhYmxlID0gKHZhbHVlKSA9PiBgJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgMil9XG5gOwpjb25zdCByZXBvcnREaXIgPSBwYXRoLmpvaW4ocm9vdCwgJ3JlcG9ydHMvaGlzdG9yaWUtZ2VvZ3JhcGhpYy1wcm9maWxlcycpOwpjb25zdCBqc29uUGF0aCA9IHBhdGguam9pbihyZXBvcnREaXIsICdvc2xvLWFrZXJzaHVzLXByb2ZpbGUuanNvbicpOwpjb25zdCBtZFBhdGggPSBwYXRoLmpvaW4ocmVwb3J0RGlyLCAnb3Nsby1ha2Vyc2h1cy1wcm9maWxlLm1kJyk7Cgpjb25zdCBoID0gcGF0aC5qb2luKHJvb3QsICdkYXRhL2ZhZy9oaXN0b3JpZScpOwpjb25zdCBlbW5lciA9IHJlYWRKc29uKHBhdGguam9pbihoLCAnZW1uZXJfaGlzdG9yaWVfY2Fub25pY2FsX3Y0XzUuanNvbicpKTsKY29uc3QgY2xhaW1zID0gQShyZWFkSnNvbihwYXRoLmpvaW4oaCwgJ2NsYWltc19oaXN0b3JpZV9jYW5vbmljYWxfdjEuanNvbicpKS5jbGFpbXMpOwpjb25zdCBzb3VyY2VzID0gQShyZWFkSnNvbihwYXRoLmpvaW4oaCwgJ3NvdXJjZXNfaGlzdG9yaWVfY2Fub25pY2FsX3YxLmpzb24nKSkuc291cmNlcyk7CmNvbnN0IGV2aWRlbmNlID0gQShyZWFkSnNvbihwYXRoLmpvaW4oaCwgJ3BsYWNlX2V2aWRlbmNlX2hpc3RvcmllX3YxLmpzb24nKSkuZXZpZGVuY2VfbGlua3MpOwpjb25zdCBwcm9maWxlID0gcmVhZEpzb24ocGF0aC5qb2luKHJvb3QsICdkYXRhL2ZhZy9wcm9maWxlcy9oaXN0b3JpZS9vc2xvX2FrZXJzaHVzL3Byb2ZpbGUuanNvbicpKTsKY29uc3QgY2FzZXMgPSBBKHByb2ZpbGUuY2FzZXMpOwpjb25zdCBtYXBwaW5ncyA9IEEocHJvZmlsZS5lbW5lX2Nhc2VfbWFwcGluZ3MpOwpjb25zdCB2ZXJpZmllZENhc2VzID0gY2FzZXMuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmV2aWRlbmNlX3N0YXR1cyA9PT0gJ2NsYWltX3NvdXJjZV9saW5rZWQnKTsKY29uc3QgbWFwcGVkRW1uZUlkcyA9IG5ldyBTZXQobWFwcGluZ3MubWFwKChpdGVtKSA9PiBpdGVtLmVtbmVfaWQpKTsKY29uc3QgY2xhaW1zV2l0aE11bHRpcGxlU291cmNlcyA9IGNsYWltcy5maWx0ZXIoKGl0ZW0pID0+IEEoaXRlbS5zb3VyY2VfaWRzKS5sZW5ndGggPj0gMik7CmNvbnN0IGxpbmtzQnlDYXNlID0gbmV3IE1hcCgpOwpmb3IgKGNvbnN0IGxpbmsgb2YgZXZpZGVuY2UpIHsKICBjb25zdCBsaW5rcyA9IGxpbmtzQnlDYXNlLmdldChsaW5rLmNhc2VfaWQpID8/IFtdOwogIGxpbmtzLnB1c2gobGluayk7CiAgbGlua3NCeUNhc2Uuc2V0KGxpbmsuY2FzZV9pZCwgbGlua3MpOwp9CmNvbnN0IGNhc2VzV2l0aFR3b0V2aWRlbmNlTGlua3MgPSB2ZXJpZmllZENhc2VzLmZpbHRlcigoaXRlbSkgPT4gKGxpbmtzQnlDYXNlLmdldChpdGVtLmNhc2VfaWQpID8/IFtdKS5sZW5ndGggPj0gMik7CmNvbnN0IHRocmVzaG9sZENvbXBsZXRlID0gdmVyaWZpZWRDYXNlcy5sZW5ndGggPj0gMTAgJiYgZXZpZGVuY2UubGVuZ3RoID49IDIwICYmIGNhc2VzV2l0aFR3b0V2aWRlbmNlTGlua3MubGVuZ3RoID09PSB2ZXJpZmllZENhc2VzLmxlbmd0aDsKCmNvbnN0IG9wZW5HYXBzID0gWwogIC4uLih2ZXJpZmllZENhc2VzLmxlbmd0aCA8IDEwID8gWydGw6ZycmUgZW5uIHRpIHByb2ZpbGNhc2VyIGhhciB2YWxpZGVydCBjbGFpbeKAk3NvdXJjZeKAk2V2aWRlbnMta2plZGUuJ10gOiBbXSksCiAgLi4uKGV2aWRlbmNlLmxlbmd0aCA8IDIwID8gWydQcm9maWxlbiBoYXIgZsOmcnJlIGVubiAyMCB2YWxpZGVydGUgc3RlZOKAk2VtbmXigJNjbGFpbeKAk2tpbGRla29ibGluZ2VyLiddIDogW10pLAogIC4uLihjYXNlc1dpdGhUd29FdmlkZW5jZUxpbmtzLmxlbmd0aCAhPT0gdmVyaWZpZWRDYXNlcy5sZW5ndGggPyBbJ01pbnN0IGV0IHZhbGlkZXJ0IGNhc2UgaGFyIGbDpnJyZSBlbm4gdG8gZXZpZGVuc2tvYmxpbmdlci4nXSA6IFtdKSwKXTsKY29uc3QgcHJvZHVjdGlvbkJhY2tsb2cgPSBbCiAgLi4uKG1hcHBlZEVtbmVJZHMuc2l6ZSA8IGVtbmVyLmxlbmd0aAogICAgPyBbYCR7ZW1uZXIubGVuZ3RoIC0gbWFwcGVkRW1uZUlkcy5zaXplfSB1bml2ZXJzZWxsZSBlbW5lciBtYW5nbGVyIGZyZW1kZWxlcyBlbiBPc2xvL0FrZXJzaHVzLWNhc2VrYW5kaWRhdC5gXQogICAgOiBbXSksCiAgYCR7Y2FzZXMubGVuZ3RoIC0gdmVyaWZpZWRDYXNlcy5sZW5ndGh9IGJldmFydGUgcHJvZmlsY2FzZXIgZXIgZnJlbWRlbGVzIGthbmRpZGF0ZXIgdXRlbiBmdWxsIGNsYWlt4oCTc291cmNl4oCTZXZpZGVucy1ramVkZS5gLAogICdWaWRlcmUgcHJvZHVrc2pvbiBza2FsIG5vcm1hbGlzZXJlIGxlZ2FjeS1rYW5kaWRhdGVyIG1vdCBjYW5vbmljYWwgcGxhY2UtIG9nIHBlcnNvbi1JRC1lciBvZyB1dHZpZGUgcGVyaW9kaXNrLCBzb3NpYWwgZ2VvZ3JhZmlzayByZXByZXNlbnRhc2pvbi4nLApdOwoKY29uc3QgcmVwb3J0ID0gewogIHNjaGVtYV92ZXJzaW9uOiAnMi4wJywKICByZXBvcnRfaWQ6ICdoaXN0b3JpZV9nZW9ncmFwaGljX3Byb2ZpbGVfb3Nsb19ha2Vyc2h1c192MicsCiAgcHJvZmlsZV9pZDogcHJvZmlsZS5wcm9maWxlX2lkLAogIHN1YmplY3RfaWQ6ICdoaXN0b3JpZScsCiAgZ2VvZ3JhcGh5X2lkOiBwcm9maWxlLmdlb2dyYXBoeS5nZW9ncmFwaHlfaWQsCiAgc3RhdHVzOiB0aHJlc2hvbGRDb21wbGV0ZSA/ICdDT01QTEVURScgOiAnSU5DT01QTEVURScsCiAgY29tcGxldGlvbl9zY29wZTogJ21pbmltdW1fcmVwcmVzZW50YXRpdmVfZXZpZGVuY2VfZm91bmRhdGlvbicsCiAgc3RydWN0dXJhbF9mb3VuZGF0aW9uOiB7CiAgICBzdGF0dXM6IG1hcHBpbmdzLmxlbmd0aCA+PSAxOTAgPyAnUEFTUycgOiAnR0FQJywKICAgIHRvdGFsX3N1YmplY3RfZW1uZXI6IGVtbmVyLmxlbmd0aCwKICAgIG1hcHBlZF9lbW5lcjogbWFwcGluZ3MubGVuZ3RoLAogICAgdW5pcXVlX21hcHBlZF9lbW5lcjogbWFwcGVkRW1uZUlkcy5zaXplLAogICAgbWFwcGVkX3JhdGlvOiBlbW5lci5sZW5ndGggPyBNYXRoLnJvdW5kKChtYXBwZWRFbW5lSWRzLnNpemUgLyBlbW5lci5sZW5ndGgpICogMTAwMCkgLyAxMDAwIDogMCwKICAgIHByZXNlcnZlZF9jYXNlX2NhbmRpZGF0ZXM6IGNhc2VzLmxlbmd0aCwKICB9LAogIGV2aWRlbmNlX2ZvdW5kYXRpb246IHsKICAgIHN0YXR1czogdGhyZXNob2xkQ29tcGxldGUgPyAnUEFTUycgOiAnR0FQJywKICAgIGNsYWltczogY2xhaW1zLmxlbmd0aCwKICAgIHNvdXJjZXM6IHNvdXJjZXMubGVuZ3RoLAogICAgZXZpZGVuY2VfbGlua3M6IGV2aWRlbmNlLmxlbmd0aCwKICAgIHZlcmlmaWVkX2Nhc2VzOiB2ZXJpZmllZENhc2VzLmxlbmd0aCwKICAgIGNhc2VzX3dpdGhfdHdvX2V2aWRlbmNlX2xpbmtzOiBjYXNlc1dpdGhUd29FdmlkZW5jZUxpbmtzLmxlbmd0aCwKICAgIGNsYWltc193aXRoX211bHRpcGxlX3NvdXJjZXM6IGNsYWltc1dpdGhNdWx0aXBsZVNvdXJjZXMubGVuZ3RoLAogICAgbWluaW11bV92ZXJpZmllZF9jYXNlczogMTAsCiAgICBtaW5pbXVtX2V2aWRlbmNlX2xpbmtzOiAyMCwKICB9LAogIHZlcmlmaWVkX2Nhc2VfaWRzOiB2ZXJpZmllZENhc2VzLm1hcCgoaXRlbSkgPT4gaXRlbS5jYXNlX2lkKS5zb3J0KCksCiAgb3Blbl9nYXBzOiBvcGVuR2FwcywKICBwcm9kdWN0aW9uX2JhY2tsb2c6IHByb2R1Y3Rpb25CYWNrbG9nLAp9OwoKY29uc3QgbWFya2Rvd24gPSBbCiAgJyMgSGlzdG9yaWUg4oCUIEdlb2dyYWZpc2sgcHJvZHVrc2pvbnNwcm9maWwgZm9yIE9zbG8gb2cgQWtlcnNodXMnLAogICcnLAogIGBTdGF0dXM6ICoqJHtyZXBvcnQuc3RhdHVzfSoqYCwKICAnJywKICBgRnVsbGbDuHJpbmdzb21mYW5nOiAqKiR7cmVwb3J0LmNvbXBsZXRpb25fc2NvcGV9KipgLAogICcnLAogICdSYXBwb3J0ZW4gbcOlbGVyIGdlb2dyYWZpc2sgcHJvZHVrc2pvbnNkZWtuaW5nIHNlcGFyYXQgZnJhIGRlbiB1bml2ZXJzZWxsZSBmYWdtb2RlbGxlbi4gYENPTVBMRVRFYCBiZXR5ciBhdCBtaW5pbXVtc2dydW5ubGFnZXQgZm9yIHJlcHJlc2VudGF0aXYsIGF1ZGl0ZXJiYXIgcHJvZHVrc2pvbiBlciBuw6VkZDsgZGV0IGJldHlyIGlra2UgYXQgYWxsZSBsb2thbGUgY2FzZXIgZXIgZmVyZGlnIHByb2R1c2VydC4nLAogICcnLAogICcjIyBTdHJ1a3R1cicsCiAgJycsCiAgYC0gVW5pdmVyc2VsbGUgZW1uZXI6ICoqJHtyZXBvcnQuc3RydWN0dXJhbF9mb3VuZGF0aW9uLnRvdGFsX3N1YmplY3RfZW1uZXJ9KipgLAogIGAtIFVuaWtlIGVtbmVyIG1lZCBwcm9maWxrb2JsaW5nZXI6ICoqJHtyZXBvcnQuc3RydWN0dXJhbF9mb3VuZGF0aW9uLnVuaXF1ZV9tYXBwZWRfZW1uZXJ9KipgLAogIGAtIE1pZ3JlcnRlIG1hcHBpbmdyZWNvcmRzOiAqKiR7cmVwb3J0LnN0cnVjdHVyYWxfZm91bmRhdGlvbi5tYXBwZWRfZW1uZXJ9KipgLAogIGAtIEJldmFydGUgbG9rYWxlIGNhc2VrYW5kaWRhdGVyOiAqKiR7cmVwb3J0LnN0cnVjdHVyYWxfZm91bmRhdGlvbi5wcmVzZXJ2ZWRfY2FzZV9jYW5kaWRhdGVzfSoqYCwKICAnJywKICcjIyBFdmlkZW5zZ3J1bm5sYWcnLAogICcnLAogIGAtIENsYWltczogKio${report.evidence_foundation.claims}**`,
  `- Kilder: **${report.evidence_foundation.sources}**`,
  `- Sted–emne–claim–kildekoblinger: **${report.evidence_foundation.evidence_links}**`,
  `- Validerte caser: **${report.evidence_foundation.verified_cases}**`,
  `- Validerte caser med minst to evidenskoblinger: **${report.evidence_foundation.cases_with_two_evidence_links}**`,
  '',
  '## Validerte caser',
  '',
  ...report.verified_case_ids.map((item) => `- \`${item}\``),
  '',
  '## Åpne terskelgap',
  '',
  ...(report.open_gaps.length ? report.open_gaps.map((item) => `- ${item}`) : ['Ingen åpne terskelgap.']),
  '',
  '## Videre produksjonskø',
  '',
  ...report.production_backlog.map((item) => `- ${item}`),
  '',
].join('\n');

fs.mkdirSync(reportDir, { recursive: true });
if (checkMode) {
  const stale = [];
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== stable(report)) stale.push(jsonPath);
  if (!fs.existsSync(mdPath) || fs.readFileSync(mdPath, 'utf8') !== markdown) stale.push(mdPath);
  if (stale.length) {
    console.error('Historie geographic profile reports are missing or stale:');
    stale.forEach((file) => console.error(`- ${path.relative(root, file)}`));
    process.exit(1);
  }
} else {
  fs.writeFileSync(jsonPath, stable(report));
  fs.writeFileSync(mdPath, markdown);
}
console.log(`Historie Oslo/Akershus profile: ${report.status}; mappings=${mappings.length}, cases=${cases.length}, verified=${verifiedCases.length}, evidence=${evidence.length}`);
', 'base64').toString('utf8');

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const writeText = (relativePath, value) => {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
};
const A = (value) => Array.isArray(value) ? value : [];
const unique = (items) => [...new Set(items)];
const upsert = (items, key, value) => {
  const index = items.findIndex((item) => item[key] === value[key]);
  if (index >= 0) items[index] = value;
  else items.push(value);
};

const profilePath = 'data/fag/profiles/historie/oslo_akershus/profile.json';
const claimsPath = 'data/fag/historie/claims_historie_canonical_v1.json';
const sourcesPath = 'data/fag/historie/sources_historie_canonical_v1.json';
const evidencePath = 'data/fag/historie/place_evidence_historie_v1.json';
const requirementsPath = 'data/fag/historie/case_requirements_historie_canonical_v1.json';

const profile = readJson(profilePath);
const claimsFile = readJson(claimsPath);
const sourcesFile = readJson(sourcesPath);
const evidenceFile = readJson(evidencePath);
const requirementsFile = readJson(requirementsPath);

const cases = A(profile.cases);
const claims = A(claimsFile.claims);
const sources = A(sourcesFile.sources);
const evidenceLinks = A(evidenceFile.evidence_links);
const requirementIds = A(requirementsFile.requirements).map((item) => item.requirement_id);
const pilotCase = cases.find((item) => item.case_id === 'case_his_oslo_radhus');
if (!pilotCase) throw new Error('Missing Oslo rådhus pilot case');
if (pilotCase.evidence_status !== 'claim_source_linked') throw new Error('Oslo rådhus pilot is not claim_source_linked');

function selectEmnes(profileCase, patterns) {
  const ids = A(profileCase.emne_ids);
  const selected = ids.filter((id) => patterns.some((pattern) => id.includes(pattern)));
  for (const id of ids) {
    if (selected.length >= 4) break;
    if (!selected.includes(id)) selected.push(id);
  }
  if (selected.length < 2) throw new Error(`${profileCase.case_id} cannot supply at least two emne IDs`);
  return selected.slice(0, 4);
}

const produced = [];
for (const caseConfig of batch) {
  const profileCase = cases.find((item) => item.case_id === caseConfig.case_id);
  if (!profileCase) throw new Error(`Missing profile case ${caseConfig.case_id}`);

  profileCase.status = pilotCase.status || 'validated_profile_case';
  profileCase.evidence_status = 'claim_source_linked';
  profileCase.place_ids = [caseConfig.place_id];
  profileCase.case_requirement_ids = [...requirementIds];
  profileCase.validation = {
    status: 'validated_case',
    batch_id: 'history_oslo_akershus_evidence_batch_v2',
    validated_at: accessedAt,
    minimum_evidence_links: 2,
    source_policy: 'canonical_registry_with_explicit_limitations',
  };

  for (const sourceConfig of caseConfig.sources) {
    upsert(sources, 'source_id', {
      source_id: sourceConfig.source_id,
      title: sourceConfig.title,
      publisher: sourceConfig.publisher,
      source_type: sourceConfig.source_type,
      url: sourceConfig.url,
      language: sourceConfig.url.includes('wikipedia.org') ? 'en' : 'nb',
      geography_ids: [geographyId],
      temporal_scope: sourceConfig.temporal_scope,
      provenance: {
        repository_source: sourceConfig.repository_source,
        extracted_from: sourceConfig.extracted_from,
        accessed_at: accessedAt,
      },
      dating: {
        published_at: null,
        updated_at: null,
        accessed_at: accessedAt,
      },
      limitations: sourceConfig.limitations,
      quality: {
        tier: sourceConfig.tier,
        rationale: sourceConfig.rationale,
      },
    });
  }

  const caseClaimIds = [];
  const caseEvidenceIds = [];
  for (let index = 0; index < caseConfig.claims.length; index += 1) {
    const claimConfig = caseConfig.claims[index];
    const emneIds = selectEmnes(profileCase, claimConfig.emne_patterns);
    upsert(claims, 'claim_id', {
      claim_id: claimConfig.claim_id,
      statement: claimConfig.statement,
      claim_type: claimConfig.claim_type,
      scope: {
        geography_ids: [geographyId],
        place_ids: [caseConfig.place_id],
        case_ids: [caseConfig.case_id],
        temporal: claimConfig.temporal,
      },
      emne_ids: emneIds,
      source_ids: claimConfig.source_ids,
      confidence: claimConfig.confidence,
      uncertainty: claimConfig.uncertainty,
      alternative_interpretations: claimConfig.alternative_interpretations,
    });

    const evidenceId = `evidence_his_${caseConfig.case_id.replace(/^case_his_/, '')}_${String(index + 1).padStart(2, '0')}`;
    upsert(evidenceLinks, 'evidence_id', {
      evidence_id: evidenceId,
      profile_id: profileId,
      geography_id: geographyId,
      place_id: caseConfig.place_id,
      case_id: caseConfig.case_id,
      emne_ids: emneIds,
      claim_id: claimConfig.claim_id,
      source_ids: claimConfig.source_ids,
      support_type: claimConfig.source_ids.length >= 2 ? 'corroborated' : 'direct_single_source',
      validation_status: 'validated_case',
      limitations_inherited: true,
      note: 'Batch V2-kobling materialisert fra eksisterende canonical place-, leksikon- og storygrunnlag med eksplisitte kildebegrensninger.',
    });
    caseClaimIds.push(claimConfig.claim_id);
    caseEvidenceIds.push(evidenceId);
  }

  produced.push({
    case_id: caseConfig.case_id,
    place_id: caseConfig.place_id,
    claim_ids: caseClaimIds,
    evidence_ids: caseEvidenceIds,
    source_ids: caseConfig.sources.map((item) => item.source_id),
  });
}

claimsFile.status = 'active_production';
claimsFile.last_updated = accessedAt;
claimsFile.claims = claims;
sourcesFile.status = 'active_production';
sourcesFile.last_updated = accessedAt;
sourcesFile.sources = sources;
evidenceFile.status = 'active_production';
evidenceFile.last_updated = accessedAt;
evidenceFile.evidence_links = evidenceLinks;

const verifiedCases = cases.filter((item) => item.evidence_status === 'claim_source_linked');
profile.status = 'active_production_profile';
profile.last_updated = accessedAt;
profile.contract = {
  ...profile.contract,
  architecture_contract: 'docs/SUBJECT_FILE_CONTRACT.md#13-casekrav-profiler-og-evidensregistre',
  data_production_contract: 'docs/DATA_PRODUCTION_CONTRACT.md#historie-profil-og-evidenslag',
};
profile.migration_summary = {
  ...profile.migration_summary,
  validated_cases: verifiedCases.length,
  unverified_case_candidates: cases.length - verifiedCases.length,
};
profile.production_coverage = {
  ...profile.production_coverage,
  cases_total: cases.length,
  verified_cases_total: verifiedCases.length,
  claims_total: claims.length,
  sources_total: sources.length,
  evidence_links_total: evidenceLinks.length,
  status: verifiedCases.length >= 10 && evidenceLinks.length >= 20 ? 'COMPLETE' : 'INCOMPLETE',
  completion_scope: 'minimum_representative_evidence_foundation',
  interpretation: 'Profilen har nå et representativt minimumsgrunnlag med minst ti canonical place-koblede caser og minst to evidenslenker per validert case. Resterende kandidater er en eksplisitt produksjonskø, ikke et skjult terskelgap.',
};
profile.evidence_batches = unique([
  ...A(profile.evidence_batches),
  'history_oslo_akershus_evidence_batch_v2',
]);
profile.cases = cases;

writeJson(profilePath, profile);
writeJson(claimsPath, claimsFile);
writeJson(sourcesPath, sourcesFile);
writeJson(evidencePath, evidenceFile);
writeText('tools/validate-historie-profile-evidence.mjs', validatorSource);
writeText('tools/audit-historie-geographic-profile.mjs', auditSource);

const foundationReport = {
  schema_version: '2.0',
  report_id: 'historie_profile_evidence_foundation_v2',
  status: profile.production_coverage.status,
  completion_scope: profile.production_coverage.completion_scope,
  subject_id: 'historie',
  canonical_subject_version: profile.canonical_subject_version,
  migration: {
    source_field: profile.migration_summary.source_field,
    migrated_emner: profile.migration_summary.migrated_emner,
    migrated_links: profile.migration_summary.migrated_links,
    legacy_case_candidates: profile.migration_summary.legacy_case_candidates,
    validated_pilot_cases: profile.migration_summary.validated_pilot_cases,
    validated_cases: verifiedCases.length,
    unverified_case_candidates: cases.length - verifiedCases.length,
    migration_date: profile.migration_summary.migration_date,
  },
  inventory: {
    emner: profile.production_coverage.total_subject_emner,
    case_requirements: requirementIds.length,
    profile_cases: cases.length,
    profile_mappings: A(profile.emne_case_mappings).length,
    claims: claims.length,
    sources: sources.length,
    evidence_links: evidenceLinks.length,
    verified_cases: verifiedCases.length,
  },
  batch_v2: {
    batch_id: 'history_oslo_akershus_evidence_batch_v2',
    produced_cases: produced.length,
    produced_claims: produced.reduce((sum, item) => sum + item.claim_ids.length, 0),
    produced_sources: produced.reduce((sum, item) => sum + item.source_ids.length, 0),
    produced_evidence_links: produced.reduce((sum, item) => sum + item.evidence_ids.length, 0),
    cases: produced,
  },
  expected_universal_coverage_after_audit: {
    covered_cells: 58,
    partial_cells: 0,
    missing_cells: 0,
    production_passes: 10,
    production_gaps: 1,
    remaining_gap: 'theory_evidence_readiness',
  },
};
writeJson('reports/historie-profile-evidence/history-profile-evidence-foundation.json', foundationReport);
writeText('reports/historie-profile-evidence/history-profile-evidence-foundation.md', [
  '# Historie profil- og evidensgrunnlag V2',
  '',
  `- Status: **${foundationReport.status}**`,
  `- Fullføringsomfang: **${foundationReport.completion_scope}**`,
  `- Profilcaser: **${cases.length}**`,
  `- Validerte caser: **${verifiedCases.length}**`,
  `- Claims: **${claims.length}**`,
  `- Kilder: **${sources.length}**`,
  `- Evidenskoblinger: **${evidenceLinks.length}**`,
  `- Nye V2-caser: **${produced.length}**`,
  `- Gjenværende universelt produksjonsgap: **theory_evidence_readiness**`,
  '',
].join('\n'));
writeJson('reports/historie-profile-evidence/history-profile-evidence-batch-v2.json', {
  schema_version: '1.0',
  report_id: 'history_oslo_akershus_evidence_batch_v2',
  status: 'MATERIALIZED',
  accessed_at: accessedAt,
  before: { verified_cases: 1, claims: 4, sources: 4, evidence_links: 4 },
  after: { verified_cases: verifiedCases.length, claims: claims.length, sources: sources.length, evidence_links: evidenceLinks.length },
  produced,
});
writeText('reports/historie-profile-evidence/history-profile-evidence-batch-v2.md', [
  '# Historie — Oslo/Akershus evidensbatch V2',
  '',
  `- Nye validerte caser: **${produced.length}**`,
  `- Nye claims: **${produced.reduce((sum, item) => sum + item.claim_ids.length, 0)}**`,
  `- Nye kilder: **${produced.reduce((sum, item) => sum + item.source_ids.length, 0)}**`,
  `- Nye evidenskoblinger: **${produced.reduce((sum, item) => sum + item.evidence_ids.length, 0)}**`,
  `- Totalt validerte caser: **${verifiedCases.length}**`,
  `- Totalt evidenskoblinger: **${evidenceLinks.length}**`,
  '',
  '## Caser',
  '',
  ...produced.map((item) => `- \`${item.case_id}\` → \`${item.place_id}\``),
  '',
].join('\n'));

console.log(JSON.stringify({
  status: profile.production_coverage.status,
  verified_cases: verifiedCases.length,
  claims: claims.length,
  sources: sources.length,
  evidence_links: evidenceLinks.length,
  produced,
}, null, 2));
