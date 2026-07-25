#!/usr/bin/env node
import fs from "node:fs";

const file = "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const emner = JSON.parse(fs.readFileSync(file, "utf8"));

const patches = {
  em_naering_data_algoritmer_verdiskaping: {
    definition: "Emnet undersøker hvordan data samles inn, renses, merkes, kombineres og behandles av algoritmer for å forbedre beslutninger, automatisere oppgaver, målrette tjenester eller utvikle nye produkter og inntektsstrømmer.",
    why_it_matters: "Data får ikke økonomisk verdi av seg selv. Verdien avhenger av menneskelig arbeid, teknisk infrastruktur, tilgangsrettigheter, datakvalitet, modellvalg og virksomhetens evne til å bruke resultatet i en konkret prosess.",
    keywords: ["data", "algoritme", "datakvalitet", "datamerking", "modell", "prediksjon", "personvern", "datarettighet", "modelltrening", "dataverdi"],
    key_concepts: ["datainnsamling", "datakvalitet", "algoritme", "modell", "prediksjon", "datamerking", "datarettighet", "verdifangst"],
    core_concepts: ["data", "algoritme", "datakvalitet", "modell", "prediksjon", "datarettighet"],
    sub_concepts: ["treningsdata", "inndata", "utdata", "bias", "datamerking", "modellfeil", "personvern", "syntetiske data"],
    key_questions: [
      "Hvilke data samles inn, fra hvem, gjennom hvilken prosess og med hvilket formål?",
      "Hvilket menneskelig arbeid kreves for å registrere, rense, merke, kontrollere og tolke dataene?",
      "Hvilken beslutning eller arbeidsoppgave påvirker algoritmens utdata, og hvordan kontrolleres feil?",
      "Hvem har rett til dataene, hvem får den økonomiske gevinsten, og hvem bærer risikoen ved feil eller misbruk?"
    ],
    conflicts: ["datatilgang vs personvern", "prediksjonskraft vs forklarbarhet", "dataskala vs datakvalitet", "automatisert beslutning vs menneskelig ansvar", "brukerverdi vs kommersiell overvåking"],
    ideological_dimensions: ["data som privat eiendel vs felles ressurs", "innovasjon vs databeskyttelse", "algoritmisk effektivitet vs rettferdig behandling", "teknisk objektivitet vs sosialt formede data"],
    analysis_axes: ["rådata vs bearbeidet data", "innsamling vs samtykke", "modell vs virkelighet", "prediksjon vs forklaring", "maskinberegning vs menneskelig dataarbeid", "brukerverdi vs verdifangst"],
    quiz_angles: ["trace_data_source_labor_model_and_use", "identify_algorithmic_output_and_decision", "test_quality_bias_and_error_control", "map_data_rights_value_and_risk"],
    blindspots: ["Store datamengder kan forsterke systematiske feil dersom datagrunnlaget er skjevt.", "Algoritmens resultat er avhengig av valg av mål, variabler og terskler, ikke bare av dataene.", "Datainnsamling og modelltrening kan bygge på usynlig og lavt lønnet arbeid.", "En prediksjon kan være statistisk presis uten å forklare årsak eller være egnet til beslutningen."],
    question_surface_mode: "data-source-labor-model-use-first",
    generator_use_note: "Start med en dokumentert datakilde, behandlingsprosess og konkret beslutning eller tjeneste. Spør hvem som skaper, kontrollerer og bruker dataene før algoritme- eller overvåkingsteori introduseres.",
    overlap_resolution_note: "Bruk emnet når dataflyt og algoritmisk behandling skaper den økonomiske funksjonen. Bruk automatisering og arbeid når oppgavefordelingen mellom menneske og system er hovedsaken, og digitalisering og plattformøkonomi for markeds- og formidlingsmodellen.",
    anti_patterns: ["Ikke bruk data og kunnskap som synonymer.", "Ikke omtale en regelbasert digital prosess som kunstig intelligens uten dokumentasjon.", "Ikke påstå at algoritmen skaper verdi alene uten dataarbeid, infrastruktur og faktisk bruk."]
  },
  em_naering_digitalisering_plattformokonomi: {
    definition: "Emnet undersøker hvordan analoge arbeids-, betalings- og formidlingsprosesser blir digitale, og hvordan plattformer kobler flere brukergrupper gjennom regler, rangering, gebyrer, data og nettverkseffekter.",
    why_it_matters: "En plattform er ikke bare en app. Den organiserer adgang til markedet, setter vilkår, fordeler synlighet og kan flytte risiko og kostnader til brukere, leverandører og selvstendige arbeidstakere.",
    keywords: ["digitalisering", "plattform", "tosidig marked", "nettverkseffekt", "kommisjon", "rangering", "plattformstyring", "skalering", "lock-in", "interoperabilitet"],
    key_concepts: ["digitalisering", "plattformøkonomi", "tosidig marked", "nettverkseffekt", "plattformstyring", "kommisjon", "lock-in", "interoperabilitet"],
    core_concepts: ["plattform", "tosidig marked", "nettverkseffekt", "plattformstyring", "kommisjon", "lock-in"],
    sub_concepts: ["rangering", "matching", "abonnement", "API", "selvstendig oppdragstaker", "dataportabilitet", "multihoming", "moderering"],
    key_questions: [
      "Hvilke brukergrupper kobles sammen, og hvilken transaksjon eller aktivitet formidler plattformen?",
      "Hvordan fastsetter plattformen adgang, rangering, pris, kommisjon og andre vilkår?",
      "Hvilke nettverkseffekter, byttekostnader eller datafordeler gjør det vanskelig å forlate eller konkurrere med plattformen?",
      "Hvilke oppgaver, kostnader og risikoer flyttes til leverandører, kunder eller selvstendige arbeidstakere?"
    ],
    conflicts: ["skalering vs lokal tilpasning", "brukervennlighet vs plattformkontroll", "nettverkseffekt vs konkurranse", "fleksibilitet vs arbeidsrettigheter", "åpen tilgang vs privat regelverk"],
    ideological_dimensions: ["plattform som markedsplass vs plattform som regulator", "innovasjon vs konkurranseinngrep", "selvstendig arbeid vs arbeidsgiveransvar", "dataportabilitet vs proprietært økosystem"],
    analysis_axes: ["plattform vs bruker", "kundegruppe vs leverandørgruppe", "åpenhet vs lock-in", "kommisjon vs levert verdi", "algoritmisk rangering vs fri konkurranse", "digital formidling vs fysisk arbeid"],
    quiz_angles: ["identify_platform_sides_transaction_and_revenue", "trace_rules_ranking_and_commission", "test_network_effect_and_switching_cost", "map_shifted_labor_cost_and_risk"],
    blindspots: ["Digital formidling kan fortsatt være avhengig av fysisk transport, lager, kundeservice og lokalt arbeid.", "Mange brukere er ikke alene bevis på lønnsomhet eller varig nettverkseffekt.", "Leverandører kan være formelt selvstendige, men sterkt styrt gjennom rangering, priser og tilgang.", "Lav brukerpris kan være subsidiert for å bygge markedsandel og endres når konkurransen svekkes."],
    question_surface_mode: "platform-sides-rules-revenue-first",
    generator_use_note: "Start med plattformens brukergrupper, transaksjon, inntektsmodell og konkrete regler. Dokumenter rangering, gebyrer eller avhengighet før plattform- og nettverksteori brukes.",
    overlap_resolution_note: "Bruk emnet for digital formidling og flersidige markeder. Bruk data og algoritmer når databehandlingen er hovedsaken, og teknologi og infrastruktur for de underliggende nettverkene og systemene.",
    anti_patterns: ["Ikke kall enhver nettside eller digital tjeneste en plattform.", "Ikke bruke nettverkseffekt som synonym for popularitet.", "Ikke beskrive plattformen som nøytral mellommann når den setter priser, regler eller rangering."]
  },
  em_naering_doxa_vekst_effektivitet: {
    definition: "Emnet undersøker hvordan vekst, skalering, produktivitet og effektivitet kan bli tatt-for-gitte mål i næringslivet, hvilke indikatorer som bærer disse målene, og hvilke verdier og kostnader som dermed blir mindre synlige.",
    why_it_matters: "Mål som omsetningsvekst, markedsandel og kostnad per enhet kan være nyttige, men de er ikke nøytrale. De påvirker investeringer, arbeidstempo, tjenestekvalitet, ressursbruk og hvilke alternativer som framstår som realistiske.",
    keywords: ["doxa", "vekst", "skalering", "effektivitet", "produktivitetskrav", "nøkkeltall", "målforskyvning", "økonomisk verdi", "postvekst", "alternativ indikator"],
    key_concepts: ["doxa", "vekstlogikk", "skalering", "effektivitetsnorm", "nøkkeltall", "målforskyvning", "alternativ indikator", "postvekst"],
    core_concepts: ["doxa", "vekstlogikk", "effektivitetsnorm", "nøkkeltall", "målforskyvning", "skalering"],
    sub_concepts: ["markedsandel", "avkastningskrav", "målhierarki", "reboundeffekt", "tilstrekkelighet", "robusthet", "samfunnsverdi", "postvekst"],
    key_questions: [
      "Hvilket mål behandles som selvsagt: vekst i omsetning, volum, markedsandel, produktivitet eller noe annet?",
      "Hvilket nøkkeltall gjør målet styrbart, og hvilke aktiviteter endres for å forbedre tallet?",
      "Hvilke kvaliteter, kostnader eller grupper faller utenfor målingen?",
      "Hvilke alternative mål kunne endret beslutningen uten å avvise behovet for økonomisk bærekraft?"
    ],
    conflicts: ["vekst vs tilstrekkelighet", "effektivitet vs robusthet", "skalering vs lokal kvalitet", "målt resultat vs utelatt verdi", "kort avkastning vs langsiktig kapasitet"],
    ideological_dimensions: ["vekst som nødvendighet vs vekst som politisk valg", "aksjonærmål vs flerfoldig verdiskaping", "effektivitet vs omsorg og vedlikehold", "markedsverdi vs økologiske og sosiale grenser"],
    analysis_axes: ["mål vs middel", "målt vs utelatt", "vekst vs fordeling", "effektivitet vs kvalitet", "skalering vs stedstilpasning", "kort vs lang tidshorisont"],
    quiz_angles: ["identify_taken_for_granted_goal_and_metric", "trace_metric_to_behavior", "detect_omitted_cost_or_value", "compare_growth_metric_with_alternative_goal"],
    blindspots: ["Kritikk av vekstmål betyr ikke at alle investeringer, produktivitetsforbedringer eller overskudd er uønsket.", "Et alternativt mål kan også skape målforskyvning og må vurderes konkret.", "Effektivisering kan redusere ressursbruk per enhet samtidig som totalforbruket øker.", "Virksomhetens overlevelse kan kreve inntekter uten at maksimal vekst er eneste strategi."],
    question_surface_mode: "goal-metric-omission-alternative-first",
    generator_use_note: "Start med et eksplisitt mål, nøkkeltall og dokumentert beslutning. Vis hva målingen gjør synlig og usynlig før begrepene doxa, vekstlogikk eller postvekst brukes.",
    overlap_resolution_note: "Bruk emnet for kritisk analyse av selve målhierarkiet. Bruk effektivitet og optimalisering for prosessmåling, og bærekraft og eksternaliteter for konkrete miljø- og samfunnskostnader.",
    anti_patterns: ["Ikke bruk vekstkritikk som generell moralsk dom over næringsliv.", "Ikke påstå at et mål er doxa uten å vise hvordan det tas for gitt i kilder eller beslutninger.", "Ikke erstatte ett enkelt nøkkeltall med et annet uten å diskutere nye blindsoner."]
  },
  em_naering_innovasjon_teknologisk_skift: {
    definition: "Emnet undersøker hvordan nye produkter, prosesser og tekniske løsninger utvikles, prøves, finansieres, standardiseres, tas i bruk og spres, og hvordan de virker sammen med eksisterende kompetanse, organisasjon og infrastruktur.",
    why_it_matters: "En oppfinnelse blir ikke automatisk en innovasjon. Gevinsten oppstår først når løsningen kan brukes, vedlikeholdes, finansieres og kombineres med andre systemer, mens tap og overgangskostnader fordeles mellom aktører.",
    keywords: ["innovasjon", "oppfinnelse", "adopsjon", "diffusjon", "standard", "pilot", "komplementær investering", "stiavhengighet", "teknologisk skift", "modning"],
    key_concepts: ["innovasjon", "oppfinnelse", "adopsjon", "diffusjon", "komplementaritet", "standardisering", "stiavhengighet", "teknologisk skift"],
    core_concepts: ["innovasjon", "adopsjon", "diffusjon", "standardisering", "komplementaritet", "teknologisk skift"],
    sub_concepts: ["pilot", "prototyp", "brukerinnovasjon", "modning", "dominant design", "installert base", "produktivitetsforsinkelse", "teknologisk lock-in"],
    key_questions: [
      "Hvilket konkret problem løser den nye løsningen, og hva er faktisk nytt sammenlignet med tidligere praksis?",
      "Hvem utviklet, finansierte, testet og tok løsningen i bruk, og i hvilken rekkefølge?",
      "Hvilke standarder, ferdigheter, investeringer og infrastrukturer måtte endres samtidig?",
      "Hvilke aktører vant eller tapte da teknologien spredte seg eller en eldre løsning ble fortrengt?"
    ],
    conflicts: ["nyhet vs pålitelighet", "åpen standard vs proprietær kontroll", "rask adopsjon vs overgangssikkerhet", "pionerfordel vs kompatibilitet", "teknologisk framgang vs tap av kompetanse og investeringer"],
    ideological_dimensions: ["entreprenøriell innovasjon vs kollektivt innovasjonssystem", "patentvern vs kunnskapsspredning", "teknologisk determinisme vs sosial utforming", "disrupsjon vs institusjonell kontinuitet"],
    analysis_axes: ["oppfinnelse vs bruk", "pilot vs skalering", "ny løsning vs installert base", "proprietær vs åpen standard", "teknisk ytelse vs organisatorisk tilpasning", "pioner vs sen adopter"],
    quiz_angles: ["separate_invention_adoption_and_diffusion", "trace_developer_funder_user_and_standard", "identify_complementary_investment", "compare_old_new_system_and_transition_cost"],
    blindspots: ["Innovasjonshistorier overvurderer ofte enkeltgründeren og undervurderer forskning, ansatte, leverandører, brukere og offentlig infrastruktur.", "En teknisk bedre løsning kan tape dersom den mangler standarder, nettverk eller komplementære investeringer.", "Produktivitetsgevinsten kan komme lenge etter at teknologien er installert.", "Det som beskrives som disrupsjon kan være en gradvis omorganisering av eksisterende arbeid og kapital."],
    question_surface_mode: "problem-novelty-adoption-system-first",
    generator_use_note: "Start med en dokumentert ny løsning, tidligere praksis, adopterende aktør og tidslinje. Skill oppfinnelse, pilot, adopsjon og diffusjon før innovasjonsteori brukes.",
    overlap_resolution_note: "Bruk emnet for utvikling og spredning av nye løsninger. Bruk startup og gründer for etablering og finansiering av ny virksomhet, og automatisering og arbeid for endringen i konkrete arbeidsoppgaver.",
    anti_patterns: ["Ikke kalle enhver oppgradering eller ny modell innovasjon.", "Ikke tilskrive teknologisk skift én oppfinner uten å dokumentere adopsjonssystemet.", "Ikke anta at utbredelse beviser høyere produktivitet eller samfunnsnytte."]
  },
  em_naering_ledelse_kontrollsystemer: {
    definition: "Emnet undersøker hvordan virksomheter bruker budsjetter, nøkkeltall, ERP-systemer, tidsregistrering, sensorer, rangering og algoritmiske regler til å overvåke arbeid, sammenligne enheter og korrigere avvik.",
    why_it_matters: "Kontrollsystemer gjør komplekse virksomheter styrbare, men målene og datakildene påvirker atferden. Det som ikke registreres kan bli nedprioritert, mens ansatte og ledere kan tilpasse seg målingen fremfor formålet.",
    keywords: ["styringssystem", "nøkkeltall", "budsjettkontroll", "ERP", "tidsregistrering", "overvåking", "rangering", "algoritmisk ledelse", "avvik", "målforskyvning"],
    key_concepts: ["ledelseskontroll", "nøkkeltall", "budsjett", "avviksanalyse", "ERP", "prestasjonsovervåking", "algoritmisk ledelse", "målforskyvning"],
    core_concepts: ["ledelseskontroll", "nøkkeltall", "budsjett", "avvik", "prestasjonsovervåking", "algoritmisk ledelse"],
    sub_concepts: ["dashboard", "benchmarking", "tidsregistrering", "sensor", "rangering", "bonusmål", "internkontroll", "gaming"],
    key_questions: [
      "Hvilket mål eller avvik forsøker kontrollsystemet å registrere og påvirke?",
      "Hvilke data samles inn, av hvem, og hvordan omformes de til rapport, rangering eller beslutning?",
      "Hvordan reagerer ansatte og ledere på målet, og kan de forbedre tallet uten å forbedre formålet?",
      "Hvilke rettigheter, feilkontroller og klagemuligheter finnes når systemet vurderer mennesker eller enheter?"
    ],
    conflicts: ["oversikt vs overvåking", "standardisering vs faglig skjønn", "målt ytelse vs faktisk kvalitet", "sentral kontroll vs lokal kunnskap", "automatisert beslutning vs ansvar"],
    ideological_dimensions: ["vitenskapelig styring vs arbeidsautonomi", "datadrevet ledelse vs profesjonelt skjønn", "kontrollrett vs personvern", "resultatansvar vs systemansvar"],
    analysis_axes: ["mål vs formål", "data vs praksis", "sentral ledelse vs lokal enhet", "overvåking vs tillit", "standard vs unntak", "automatisk vurdering vs menneskelig ansvar"],
    quiz_angles: ["identify_metric_data_source_and_action", "trace_dashboard_to_work_behavior", "detect_gaming_or_goal_displacement", "evaluate_error_rights_and_human_review"],
    blindspots: ["Et komplett dashboard kan bygge på ufullstendige eller strategisk registrerte data.", "Ansatte kan flytte innsats mot det målbare og bort fra nødvendig, men usynlig arbeid.", "Algoritmisk styring bygger fortsatt på menneskelige mål, terskler og beslutninger.", "Sammenligning mellom enheter kan bli misvisende dersom oppgaver, kunder og rammevilkår er ulike."],
    question_surface_mode: "control-goal-data-behavior-first",
    generator_use_note: "Start med et konkret kontrollsystem, måltall, datagrunnlag og beslutning. Spør hvordan målingen påvirket arbeidet før kontroll-, overvåkings- eller algoritmeteori introduseres.",
    overlap_resolution_note: "Bruk emnet for måle- og overvåkingssystemet. Bruk organisasjoner og ledelse for bred struktur og strategi, og data og algoritmer for modellens databehandling og prediksjon.",
    anti_patterns: ["Ikke kalle enhver rapport eller programvare et kontrollsystem.", "Ikke anta at mer data gir bedre styring uten å vurdere målet og datakvaliteten.", "Ikke omtale algoritmen som ansvarlig aktør når virksomheten har valgt mål og bruk."]
  },
  em_naering_startup_grunder_innovasjon: {
    definition: "Emnet undersøker hvordan en ny virksomhet etableres rundt et problem, en løsning og en forretningsmodell, hvordan den finansierer utvikling og drift, tester etterspørsel, bygger team og forsøker å finne en skalerbar eller bærekraftig markedsposisjon.",
    why_it_matters: "Startupfortellinger framhever ofte idé og gründer, men overlevelse avhenger av kunder, ansatte, kapital, timing, regulering, leverandører og kontantbeholdning. De fleste forsøk endres, selges eller avsluttes.",
    keywords: ["startup", "gründer", "forretningsmodell", "produkt-marked-tilpasning", "såkornkapital", "runway", "pivot", "skalering", "venturekapital", "exit"],
    key_concepts: ["startup", "gründer", "forretningsmodell", "produkt-marked-tilpasning", "runway", "finansieringsrunde", "pivot", "skalering"],
    core_concepts: ["startup", "forretningsmodell", "produkt-marked-tilpasning", "runway", "pivot", "skalering"],
    sub_concepts: ["såkornkapital", "venturekapital", "burn rate", "minimumsprodukt", "inkubator", "opsjonsprogram", "exit", "konkurs"],
    key_questions: [
      "Hvilket konkret problem og hvilken kundegruppe bygger virksomheten på, og hvilke bevis finnes for etterspørselen?",
      "Hvordan tjener eller planlegger virksomheten å tjene penger, og hvilke kostnader vokser med aktiviteten?",
      "Hvem finansierer utviklingen, hvor lang runway har virksomheten, og hvilke kontroll- eller avkastningskrav følger kapitalen?",
      "Hva ble endret etter testing, motgang eller nye data, og hvordan endte etableringsforsøket?"
    ],
    conflicts: ["rask vekst vs bærekraftig økonomi", "gründervisjon vs investorstyring", "testing vs kundesikkerhet", "skalering vs produktkvalitet", "exit vs langsiktig virksomhetsbygging"],
    ideological_dimensions: ["individuell helt vs kollektivt innovasjonsmiljø", "venturevekst vs egenfinansiert drift", "disrupsjon vs regulert ansvar", "risikovilje vs sosial sikkerhet"],
    analysis_axes: ["problem vs løsning", "brukervekst vs inntekt", "burn rate vs runway", "gründer vs investor", "pilot vs skalerbar drift", "overlevelse vs exit"],
    quiz_angles: ["identify_problem_customer_and_business_model", "trace_funding_round_runway_and_control", "compare_hypothesis_test_and_pivot", "document_scale_failure_acquisition_or_exit"],
    blindspots: ["Kapitalinnhenting er ikke det samme som inntekt eller lønnsomhet.", "Gründerens fortelling kan undervurdere ansatte, medgründere, offentlige ordninger og tidligere kunnskap.", "Sterk brukervekst kan skjule høye subsidier eller svak betalingsvilje.", "Nedleggelse er ikke alltid bare personlig fiasko; timing, marked, finansiering og regulering påvirker utfallet."],
    question_surface_mode: "problem-customer-model-runway-first",
    generator_use_note: "Start med dokumentert problem, kunde, produkt, inntektsmodell og finansiering. Spør hva som ble testet og endret før gründer- eller innovasjonsteori introduseres.",
    overlap_resolution_note: "Bruk emnet for etableringen og finansieringsløpet til en ny virksomhet. Bruk innovasjon og teknologisk skift for løsningens adopsjon i et større system, og kapital og finans for generell virksomhetsfinansiering.",
    anti_patterns: ["Ikke bruke startup som synonym for enhver liten eller ny bedrift.", "Ikke behandle kapitalinnhenting som dokumentasjon på forretningsmodellens kvalitet.", "Ikke skrive gründeren som eneste årsak til virksomhetens utvikling."]
  },
  em_naering_teknologi_infrastruktur: {
    definition: "Emnet undersøker de tekniske grunnsystemene som virksomheter er avhengige av, blant annet energi, telekommunikasjon, datasentre, kabler, programvareplattformer, standarder og grensesnitt, samt arbeidet som holder dem tilgjengelige og kompatible.",
    why_it_matters: "Teknologisk infrastruktur er ofte usynlig når den virker og kritisk når den svikter. Eierskap, standarder, kapasitet, vedlikehold og fysisk plassering avgjør tilgang, konkurranse, sikkerhet og muligheten til å bygge nye tjenester.",
    keywords: ["teknisk infrastruktur", "nettverk", "standard", "interoperabilitet", "kapasitet", "oppetid", "vedlikehold", "datasenter", "kabel", "avhengighet"],
    key_concepts: ["infrastruktur", "nettverk", "standard", "interoperabilitet", "kapasitet", "oppetid", "vedlikehold", "kritisk avhengighet"],
    core_concepts: ["teknisk infrastruktur", "nettverk", "standard", "interoperabilitet", "kapasitet", "vedlikehold"],
    sub_concepts: ["datasenter", "fiber", "strømforsyning", "API", "redundans", "legacy-system", "leverandørlåsing", "beredskap"],
    key_questions: [
      "Hvilken fysisk og digital infrastruktur må fungere for at virksomheten skal kunne levere?",
      "Hvem eier, drifter og vedlikeholder systemet, og hvilke standarder eller grensesnitt styrer tilgangen?",
      "Hvor finnes flaskehalser, avhengigheter og enkeltpunkter som kan stoppe hele tjenesten?",
      "Hvordan håndteres kapasitet, sikkerhet, oppgraderinger, kompatibilitet og beredskap over tid?"
    ],
    conflicts: ["åpen standard vs leverandørlåsing", "kapasitetsutnyttelse vs redundans", "sentralisering vs robusthet", "rask oppgradering vs kompatibilitet", "privat kontroll vs samfunnskritisk tilgang"],
    ideological_dimensions: ["infrastruktur som marked vs offentlig gode", "proprietært økosystem vs interoperabilitet", "effektiv sentralisering vs distribuert beredskap", "teknologisk suverenitet vs global leverandørkjede"],
    analysis_axes: ["synlig tjeneste vs underliggende system", "eier vs bruker", "kapasitet vs reserve", "åpen vs proprietær standard", "nytt system vs installert base", "normaldrift vs beredskap"],
    quiz_angles: ["map_service_to_underlying_technical_layers", "identify_owner_operator_standard_and_interface", "locate_bottleneck_dependency_and_single_point", "compare_capacity_redundancy_and_upgrade"],
    blindspots: ["Skybaserte tjenester er fortsatt avhengige av fysiske datasentre, strøm, kjøling og kabler.", "Høy oppetid krever løpende vedlikehold, reservekapasitet og menneskelig beredskap.", "En teknisk standard kan åpne markedet, men også kontrolleres gjennom sertifisering, patenter eller grensesnitt.", "Legacy-systemer kan bestå fordi utskifting krever koordinering og risiko, ikke bare fordi teknologien er gammel."],
    question_surface_mode: "technical-layer-owner-standard-dependency-first",
    generator_use_note: "Start med en konkret tjeneste og følg den ned til energi, nettverk, maskinvare, programvare, standard og drift. Spør hvem som eier og vedlikeholder kritiske ledd før infrastrukturbegreper brukes.",
    overlap_resolution_note: "Bruk emnet for tekniske grunnsystemer og interoperabilitet. Bruk logistikk og verdikjeder for vare- og materialflyt, og digitalisering og plattformøkonomi for markeds- og formidlingsmodellen oppå infrastrukturen.",
    anti_patterns: ["Ikke omtale digital tjeneste som immateriell eller stedløs.", "Ikke kalle en enkelt bedriftsapplikasjon infrastruktur uten bred avhengighet eller grunnfunksjon.", "Ikke anta at ny teknologi er mer robust uten dokumentasjon på drift, vedlikehold og reservekapasitet."]
  }
};

const genericPhrases = [
  "Hvilken konkret virksomhet, arbeidsplass, kapitalstrøm, marked, teknologi eller infrastruktur gjør emnet relevant?",
  "Hvordan skapes, organiseres, måles, fordeles eller skjules økonomisk verdi her?",
  "Hvilke eiere, arbeidere, kunder, reguleringer, risikoforhold, miljøkostnader eller maktstrukturer blir synlige?",
  "Hold emnet avgrenset ved å starte i konkret virksomhet, arbeid, kapitalstrøm, marked, teknologi, logistikk, byrom eller kilde."
];

for (const [emneId, patch] of Object.entries(patches)) {
  const item = emner.find(entry => entry.emne_id === emneId);
  if (!item) throw new Error(`Mangler ${emneId}`);
  Object.assign(item, patch, {
    curation_status: "individually_curated",
    curation_batch: "naeringsliv_teknologi_innovasjon_v1",
    curation_date: "2026-07-25"
  });
}

const fields = ["definition", "why_it_matters", "key_questions", "conflicts", "ideological_dimensions", "analysis_axes", "blindspots", "generator_use_note", "overlap_resolution_note", "anti_patterns"];
for (const field of fields) {
  const values = Object.keys(patches).map(id => JSON.stringify(emner.find(item => item.emne_id === id)[field]));
  if (new Set(values).size !== values.length) throw new Error(`Feltet ${field} er ikke individuelt for alle sju emner`);
}

for (const id of Object.keys(patches)) {
  const text = JSON.stringify(emner.find(item => item.emne_id === id));
  for (const phrase of genericPhrases) {
    if (text.includes(phrase)) throw new Error(`${id} beholder generisk standardtekst: ${phrase}`);
  }
}

fs.writeFileSync(file, `${JSON.stringify(emner, null, 2)}\n`);
console.log(`Kuraterte ${Object.keys(patches).length} teknologi- og innovasjonsemner individuelt.`);
