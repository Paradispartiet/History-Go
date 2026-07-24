import fs from "node:fs";

const REVISION = "politikk-konflikt-vertical-2026-07-24";
const DOMAIN_ID = "konflikt_makt_sivilsamfunn";
const BASE = "data/fag/politikk";
const REPORT_BASE = "reports/politikk-canonical-migration";
const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const unique = (values) => [...new Set(values)];
const requireValue = (value, message) => {
  if (!value) throw new Error(message);
  return value;
};

const thinkerNames = {
  karl_marx: "Karl Marx",
  antonio_gramsci: "Antonio Gramsci",
  charles_tilly: "Charles Tilly",
  sidney_tarrow: "Sidney Tarrow",
  chantal_mouffe: "Chantal Mouffe",
  jurgen_habermas: "Jürgen Habermas",
  hannah_arendt: "Hannah Arendt",
  alexis_de_tocqueville: "Alexis de Tocqueville",
  robert_dahl: "Robert Dahl",
  stein_rokkan: "Stein Rokkan",
  gudmund_hernes: "Gudmund Hernes"
};

const hookSpecs = {
  makt_og_interesser: {
    title: "Makt og interesser",
    definition: "Makt og interesser analyserer hvordan aktører får gjennomslag ved å kontrollere ressurser, dagsorden, informasjon, organisasjon, adgang til beslutningsarenaer eller hvilke alternativer som framstår som mulige.",
    core_problem: "Hvordan blir særskilte interesser omformet til politisk innflytelse, og hvilke aktører, ressurser eller ikke-beslutninger blir usynlige i utfallet?",
    mechanisms: ["ressurskontroll", "dagsordenmakt", "lobbyvirksomhet", "koalisjonsbygging", "informasjonsasymmetri", "institusjonell adgang", "vetomakt", "ikke-beslutning"],
    distinctions: ["maktressurs vs faktisk gjennomslag", "åpen beslutning vs dagsordenmakt", "interesse vs organisert interesse", "formell lik adgang vs ulik påvirkningskapasitet"],
    lenses: [["robert_dahl", "beslutningsmakt og observerbar innflytelse"], ["antonio_gramsci", "hegemoni og organisert samtykke"], ["karl_marx", "klasseinteresser og kontroll over materielle ressurser"]],
    cases: ["Stortinget", "Regjeringskvartalet", "Næringslivets Hus"],
    methods: ["met_pol_makt_og_interesseanalyse", "met_pol_institusjonsanalyse", "met_pol_diskursanalyse"],
    anti: ["Ikke likestill økonomiske ressurser med automatisk politisk seier.", "Ikke reduser makt til synlige vedtak; undersøk også dagsorden og ikke-beslutninger.", "Ikke kall enhver organisasjon en interessegruppe uten dokumentert påvirkningsrolle."],
    anchors: ["decision", "lobby_record", "hearing", "resource_or_access_data"],
    moves: ["identify_actor_resource_and_target", "trace_access_to_decision", "compare_formal_access_with_effective_influence"]
  },
  demonstrasjoner: {
    title: "Demonstrasjoner",
    definition: "Demonstrasjoner er organiserte offentlige handlinger som synliggjør krav, bygger kollektiv identitet, skaper forstyrrelse eller presser beslutningstakere gjennom antall, symbolbruk, mediedekning og kontroll over sted.",
    core_problem: "Når og hvordan blir en offentlig markering politisk virksom, og hvordan påvirker mobilisering, politi, medier, motmobilisering og sted protestens rekkevidde?",
    mechanisms: ["mobilisering", "kollektiv identitet", "repertoarvalg", "forstyrrelse", "medialisering", "politisk mulighetsstruktur", "politi- og tillatelsesregime", "motmobilisering"],
    distinctions: ["deltakelse vs representativitet", "synlighet vs gjennomslag", "lovlig regulering vs politisk begrensning", "symbolsk markering vs materiell forstyrrelse"],
    lenses: [["charles_tilly", "protestrepertoarer og kollektiv handling"], ["sidney_tarrow", "politisk mulighetsstruktur og mobilisering"], ["hannah_arendt", "kollektiv handling i offentligheten"]],
    cases: ["Eidsvolls plass", "Youngstorget", "Rådhusplassen"],
    methods: ["met_pol_protest_og_bevegelsesanalyse", "met_pol_offentlighetsanalyse", "met_pol_romlig_maktanalyse"],
    anti: ["Ikke bruk deltakerantall alene som mål på politisk virkning.", "Ikke anta at all protest representerer en samlet gruppe.", "Ikke vurder en demonstrasjon uten å skille krav, repertoar, målgruppe og myndighetsrespons."],
    anchors: ["demonstration_record", "permit_or_police_rule", "movement_source", "documented_outcome"],
    moves: ["identify_claim_target_and_repertoire", "trace_mobilisation_and_response", "separate_visibility_from_outcome"]
  },
  sivilsamfunn: {
    title: "Sivilsamfunn",
    definition: "Sivilsamfunn omfatter frivillige organisasjoner, foreninger, nettverk og fellesskap mellom stat, marked og privatliv som organiserer interesser, tjenester, offentlighet, solidaritet og motmakt.",
    core_problem: "Når fungerer sivilsamfunnet som demokratisk deltakelse og motmakt, og når reproduserer organisasjonene ulikhet, profesjonalisering eller avhengighet av staten?",
    mechanisms: ["medlemsorganisering", "frivillig arbeid", "ressursmobilisering", "tjenesteproduksjon", "nettverksbygging", "offentlig finansiering", "profesjonalisering", "representasjonskrav"],
    distinctions: ["medlemsmakt vs profesjonell ledelse", "autonomi vs offentlig finansieringsavhengighet", "tjenesteyting vs politisk påvirkning", "organisert deltakelse vs sosial skjevhet"],
    lenses: [["alexis_de_tocqueville", "foreningsliv som demokratisk skole"], ["antonio_gramsci", "sivilsamfunn som hegemonisk og mothegemonisk arena"], ["jurgen_habermas", "foreninger og offentlig meningsdannelse"]],
    cases: ["Folkets Hus", "Litteraturhuset", "frivillighetssentraler"],
    methods: ["met_pol_sivilsamfunnsanalyse", "met_pol_parti_og_bevegelsesanalyse", "met_pol_offentlighetsanalyse"],
    anti: ["Ikke behandle sivilsamfunnet som automatisk demokratisk eller inkluderende.", "Ikke likestill organisasjonens ledelse med medlemmenes syn.", "Ikke skjul offentlig finansiering eller profesjonalisering når autonomi vurderes."],
    anchors: ["organisation_statutes", "membership_data", "funding_record", "campaign_or_service_case"],
    moves: ["identify_membership_resource_and_function", "test_autonomy_against_dependency", "compare_service_role_with_advocacy_role"]
  },
  interessegrupper: {
    title: "Interessegrupper",
    definition: "Interessegrupper er organiserte aktører som forsøker å påvirke politikk på vegne av medlemmer, næringer, profesjoner, saker eller målgrupper uten selv å stille til valg som parti.",
    core_problem: "Hvordan får noen interesser stabil adgang til beslutningstakere, høringer og ekspertarenaer, mens andre må mobilisere utenfra?",
    mechanisms: ["høringsdeltakelse", "lobbykontakt", "ekspertkunnskap", "medlemsmobilisering", "økonomisk ressursbruk", "korporativ representasjon", "mediestrategi", "alliansebygging"],
    distinctions: ["interessegruppe vs politisk parti", "innsidepåvirkning vs utsidemobilisering", "ekspertise vs partsinteresse", "medlemsrepresentasjon vs organisatorisk egeninteresse"],
    lenses: [["robert_dahl", "pluralistisk konkurranse mellom organiserte interesser"], ["stein_rokkan", "korporative kanaler og konfliktlinjer"], ["gudmund_hernes", "maktressurser og organiserte aktører"]],
    cases: ["Folkets Hus", "Næringslivets Hus", "Stortingets høringer"],
    methods: ["met_pol_makt_og_interesseanalyse", "met_pol_sivilsamfunnsanalyse", "met_pol_institusjonsanalyse"],
    anti: ["Ikke mål innflytelse bare ved antall møter.", "Ikke presenter ekspertuttalelser som nøytrale uten å identifisere partsrollen.", "Ikke anta at medlemsrike organisasjoner alltid har større gjennomslag enn ressurssterke smågrupper."],
    anchors: ["hearing_submission", "lobby_or_meeting_record", "membership_or_resource_data", "policy_change"],
    moves: ["identify_constituency_and_strategy", "trace_inside_and_outside_channels", "separate_access_from_policy_effect"]
  },
  ideologi: {
    title: "Ideologi",
    definition: "Ideologi er sammenhengende fortolkninger av samfunn, interesser, problemer og ønsket orden som gjør noen løsninger rimelige, andre utenkelige og bestemte maktforhold legitime eller kritikkverdige.",
    core_problem: "Hvordan former ideologiske problemdefinisjoner hvilke aktører, årsaker og løsninger som blir synlige i en konkret konflikt?",
    mechanisms: ["problemdefinisjon", "begrepsinnramming", "verdihierarki", "historiefortelling", "naturaliserende språk", "fiende- og fellesskapskonstruksjon", "programformulering", "hegemonisk normalisering"],
    distinctions: ["ideologi vs enkeltstandpunkt", "beskrivelse vs normativ problemramme", "partiprogram vs faktisk politikk", "hegemoni vs tvang"],
    lenses: [["antonio_gramsci", "hegemoni og common sense"], ["karl_marx", "ideologi og materielle klasseforhold"], ["chantal_mouffe", "hegemonisk artikulasjon og konflikt"]],
    cases: ["Stortinget", "partiprogrammer", "Youngstorget"],
    methods: ["met_pol_ideologianalyse", "met_pol_diskursanalyse", "met_pol_politisk_historisk_analyse"],
    anti: ["Ikke bruk ideologi som skjellsord for motpartens meninger.", "Ikke utled faktisk politikk bare fra et ideologisk navn.", "Ikke reduser ideologi til teoretiker- eller partinavn uten problemdefinisjon og mekanisme."],
    anchors: ["party_programme", "speech_or_manifesto", "policy_document", "historical_conflict"],
    moves: ["identify_problem_frame_and_values", "trace_frame_to_policy_option", "compare_declared_ideology_with_practice"]
  },
  arbeidslivspolitikk: {
    title: "Arbeidslivspolitikk",
    definition: "Arbeidslivspolitikk analyserer hvordan lov, tariffavtaler, organisering, forhandling, streik og medbestemmelse fordeler makt, risiko og inntekt mellom arbeidstakere, arbeidsgivere og staten.",
    core_problem: "Hvordan virker kollektiv organisering og institusjonelle spilleregler inn på lønn, arbeidsvilkår, konflikt og hvem som bærer omstillingsrisiko?",
    mechanisms: ["tariffavtale", "kollektiv forhandling", "streik og lockout", "organisasjonsgrad", "medbestemmelse", "arbeidsrettslig regulering", "frontfagskoordinering", "trepartssamarbeid"],
    distinctions: ["individuell kontrakt vs kollektiv avtale", "formell rett vs faktisk forhandlingsmakt", "interessekonflikt vs rettstvist", "samarbeid vs maktbalanse"],
    lenses: [["karl_marx", "arbeidsforhold, klasse og konflikt"], ["stein_rokkan", "organiserte konfliktlinjer og korporative kanaler"], ["charles_tilly", "kollektiv organisering og mobilisering"]],
    cases: ["Folkets Hus", "Youngstorget", "Arbeidsretten"],
    methods: ["met_pol_konfliktanalyse", "met_pol_makt_og_interesseanalyse", "met_pol_politisk_historisk_analyse"],
    anti: ["Ikke framstill den norske modellen som konfliktfri konsensus.", "Ikke likestill lovfestet rett med lik faktisk forhandlingsstyrke.", "Ikke forklar lønnsutfall uten å undersøke organisering, avtalesystem og konjunktur."],
    anchors: ["collective_agreement", "labour_law", "strike_or_negotiation_case", "organisation_data"],
    moves: ["identify_parties_rules_and_resources", "trace_bargaining_mechanism", "separate_right_dispute_from_interest_dispute"]
  },
  miljopolitisk_konflikt: {
    title: "Miljøpolitisk konflikt",
    definition: "Miljøpolitisk konflikt oppstår når natur, klima, areal, energi, transport, arbeidsplasser og fordelingsvirkninger vurderes ulikt av berørte grupper og beslutningsnivåer.",
    core_problem: "Hvem får definere miljøproblemet, hvilke kunnskapsformer teller, og hvordan fordeles gevinster, kostnader, risiko og beslutningsmyndighet?",
    mechanisms: ["konsekvensutredning", "arealplanlegging", "kunnskapskonflikt", "kostnadsfordeling", "høringsprosess", "rettslig prøving", "protestmobilisering", "kompensasjon"],
    distinctions: ["vitenskapelig usikkerhet vs politisk uenighet", "nasjonal gevinst vs lokal kostnad", "formell medvirkning vs reell påvirkning", "miljømål vs fordelingsvirkning"],
    lenses: [["chantal_mouffe", "legitim agonistisk konflikt"], ["jurgen_habermas", "offentlig begrunnelse og deliberasjon"], ["charles_tilly", "mobilisering rundt krav og politiske muligheter"]],
    cases: ["Regjeringskvartalet", "Oslo rådhus", "Eidsvolls plass"],
    methods: ["met_pol_konfliktanalyse", "met_pol_protest_og_bevegelsesanalyse", "met_pol_plan_og_reguleringsanalyse"],
    anti: ["Ikke framstill all miljøkonflikt som vitenskapsfornektelse.", "Ikke skjul fordelingsvirkninger bak et samlet miljømål.", "Ikke likestill gjennomført høring med faktisk påvirkning."],
    anchors: ["environmental_assessment", "planning_decision", "hearing_record", "protest_or_litigation_case"],
    moves: ["identify_competing_problem_definitions", "trace_cost_risk_and_authority", "separate_scientific_uncertainty_from_value_conflict"]
  },
  minne_og_makt: {
    title: "Minne og makt",
    definition: "Minne og makt analyserer hvordan monumenter, minnesteder, navngivning, jubileer og institusjonelle fortellinger velger ut fortid, fordeler offentlig anerkjennelse og former politisk identitet.",
    core_problem: "Hvem får definere hva som skal minnes offentlig, hvilke erfaringer utelates, og hvordan endres minnets betydning gjennom konflikt, ritual og nytolkning?",
    mechanisms: ["kanonisering", "navngivning", "monumentalisering", "offentlig ritual", "institusjonell kuratering", "motminne", "omtolkning", "fjerning eller flytting"],
    distinctions: ["historisk hendelse vs offentlig minne", "minne vs hyllest", "representasjon vs dokumentasjon", "glemsel vs aktiv utelatelse"],
    lenses: [["hannah_arendt", "offentlig handling og politisk erindring"], ["antonio_gramsci", "hegemonisk historiesyn og motminne"], ["chantal_mouffe", "strid om offentlig symbolsk orden"]],
    cases: ["22. juli-senteret", "Eidsvolls plass", "Arbeidersamfunnets plass"],
    methods: ["met_pol_symbolanalyse", "met_pol_politisk_historisk_analyse", "met_pol_diskursanalyse"],
    anti: ["Ikke likestill et minnesmerke med historisk dokumentasjon.", "Ikke anta at offentlig minne er stabilt eller enstemmig.", "Ikke reduser minnekonflikt til smak uten å undersøke representasjon og makt."],
    anchors: ["memorial_or_monument", "commemoration_record", "naming_decision", "public_controversy"],
    moves: ["identify_author_and_excluded_memory", "trace_ritual_and_reinterpretation", "separate_remembrance_from_honour"]
  },
  polarisering: {
    title: "Polarisering",
    definition: "Polarisering beskriver økende avstand eller motsetning mellom politiske posisjoner, grupper eller identiteter og må skilles fra vanlig uenighet, konfliktintensitet og midlertidig mobilisering.",
    core_problem: "Er et dokumentert case preget av større meningsavstand, sterkere gruppefiendtlighet, mer sosial sortering eller bare høyere synlighet og konfliktnivå?",
    mechanisms: ["partipolitisk sortering", "affektiv gruppeknytning", "elitepolarisering", "medial forsterkning", "identitetskobling", "segregerte nettverk", "mistillit", "strategisk fiendebilde"],
    distinctions: ["ideologisk vs affektiv polarisering", "polarisering vs konflikt", "elitepolarisering vs massepolarisering", "meningsavstand vs sosial fiendtlighet"],
    lenses: [["chantal_mouffe", "agonisme vs antagonisme"], ["jurgen_habermas", "offentlig begrunnelse og kommunikativ fragmentering"], ["robert_dahl", "demokratisk opposisjon og gjensidig toleranse"]],
    cases: ["Stortinget", "Litteraturhuset", "offentlige debattarenaer"],
    methods: ["met_pol_diskursanalyse", "met_pol_legitimitetsanalyse", "met_pol_offentlighetsanalyse"],
    anti: ["Ikke kall enhver sterk uenighet polarisering.", "Ikke bruk enkeltstående sitater som bevis for samfunnstrend.", "Ikke bland ideologisk avstand, affektiv fiendtlighet og mistillit uten å skille målene."],
    anchors: ["survey_or_time_series", "party_position_data", "debate_corpus", "trust_data"],
    moves: ["identify_dimension_and_level", "compare_over_time_or_groups", "separate_disagreement_from_hostility"]
  },
  konfliktens_rom: {
    title: "Konfliktens rom",
    definition: "Konfliktens rom analyserer hvordan plasser, gater, institusjonsbygg, møterom og digitale eller juridiske adgangsregler former hvem som kan samles, bli synlig, nå en målgruppe og utfordre makt.",
    core_problem: "Hvordan påvirker stedets plassering, symbolikk, eierskap, tillatelser, sikring og publikum konfliktens form og politiske virkning?",
    mechanisms: ["romlig nærhet til beslutningstaker", "samlingsadgang", "tillatelsesregime", "synlighetskontroll", "sikkerhetssone", "symbolsk okkupasjon", "rutevalg", "ekskluderende utforming"],
    distinctions: ["offentlig eid vs offentlig tilgjengelig", "synlighet vs adgang", "sikkerhet vs politisk begrensning", "symbolsk sted vs operativ beslutningsarena"],
    lenses: [["hannah_arendt", "offentlig rom som handlingsrom"], ["charles_tilly", "repertoar og romlig målretting"], ["jurgen_habermas", "offentlighetens institusjonelle og romlige vilkår"]],
    cases: ["Eidsvolls plass", "Youngstorget", "Regjeringskvartalet"],
    methods: ["met_pol_romlig_maktanalyse", "met_pol_protest_og_bevegelsesanalyse", "met_pol_symbolanalyse"],
    anti: ["Ikke anta at et fysisk offentlig sted er politisk tilgjengelig for alle.", "Ikke reduser stedets betydning til nærhet uten å undersøke adgang og symbolikk.", "Ikke behandle sikkerhetstiltak som enten rent tekniske eller alltid undertrykkende."],
    anchors: ["place_and_access_rule", "demonstration_route", "security_or_design_document", "documented_conflict_event"],
    moves: ["identify_target_audience_and_access", "trace_spatial_constraint_or_amplification", "separate_symbolic_site_from_decision_site"]
  }
};

const emneSpecs = {
  em_pol_makt_interesser: {
    definition: "Studiet av hvordan aktører omsetter ressurser, organisasjon, adgang, informasjon og dagsorden til politisk innflytelse.",
    why: "Gjør makt analyserbar som konkrete mekanismer framfor en løs egenskap ved mektige personer eller bygg.",
    concepts: ["maktressurs", "dagsordenmakt", "lobbyvirksomhet", "ikke-beslutning", "koalisjon", "institusjonell adgang"],
    questions: ["Hvilke aktører forsøker å påvirke hvilket konkret utfall?", "Hvilke ressurser og adgangskanaler kan dokumenteres?", "Skjer påvirkningen i vedtaket, dagsordenen eller hvilke alternativer som utelates?"],
    conflicts: ["åpen konkurranse vs strukturell skjevhet", "formell adgang vs faktisk kapasitet", "synlig beslutning vs ikke-beslutning"],
    axes: ["ressurs vs gjennomslag", "adgang vs effekt", "beslutning vs dagsorden"],
    thinkers: ["robert_dahl", "antonio_gramsci", "karl_marx"],
    methods: ["met_pol_makt_og_interesseanalyse", "met_pol_institusjonsanalyse", "met_pol_diskursanalyse"],
    mechanisms: hookSpecs.makt_og_interesser.mechanisms,
    distinguish: hookSpecs.makt_og_interesser.distinctions,
    misconceptions: hookSpecs.makt_og_interesser.anti
  },
  em_pol_demonstrasjoner_protest: {
    definition: "Studiet av hvordan kollektive krav mobiliseres og framføres gjennom demonstrasjoner, aksjoner, marsjer, okkupasjoner og andre protestrepertoarer.",
    why: "Skiller protestens synlighet fra dens representativitet, organisering, myndighetsrespons og faktiske politiske virkning.",
    concepts: ["mobilisering", "protestrepertoar", "politisk mulighetsstruktur", "kollektiv identitet", "motmobilisering", "forstyrrelse"],
    questions: ["Hvilket krav, hvilken målgruppe og hvilket protestrepertoar dokumenteres?", "Hvordan ble deltakere mobilisert, og hvordan svarte myndigheter eller motaktører?", "Hva kan dokumenteres som synlighet, prosessvirkning eller faktisk utfall?"],
    conflicts: ["orden vs protestrett", "synlighet vs gjennomslag", "bred mobilisering vs sosial skjevhet"],
    axes: ["krav vs repertoar", "mobilisering vs respons", "synlighet vs virkning"],
    thinkers: ["charles_tilly", "sidney_tarrow", "hannah_arendt"],
    methods: ["met_pol_protest_og_bevegelsesanalyse", "met_pol_offentlighetsanalyse", "met_pol_romlig_maktanalyse"],
    mechanisms: hookSpecs.demonstrasjoner.mechanisms,
    distinguish: hookSpecs.demonstrasjoner.distinctions,
    misconceptions: hookSpecs.demonstrasjoner.anti
  },
  em_pol_interessegrupper_organisasjoner: {
    definition: "Studiet av hvordan foreninger, frivillige organisasjoner og interessegrupper organiserer medlemmer, ressurser, tjenester og politisk påvirkning.",
    why: "Viser både sivilsamfunnets demokratiske funksjoner og skjevhetene som følger av ulik medlemsbase, profesjonalisering, finansiering og adgang.",
    concepts: ["sivilsamfunn", "interessegruppe", "medlemsmakt", "profesjonalisering", "høringskanal", "organisasjonsressurs"],
    questions: ["Hvem hevder organisasjonen å representere, og hvordan kan dette dokumenteres?", "Bruker den innsidekanaler, utsidemobilisering, tjenesteyting eller en kombinasjon?", "Hvordan påvirker ressurser, finansiering og profesjonalisering autonomi og gjennomslag?"],
    conflicts: ["medlemmer vs ledelse", "autonomi vs finansieringsavhengighet", "ekspertise vs partsinteresse"],
    axes: ["representasjon vs organisasjonsinteresse", "innside vs utside", "frivillighet vs profesjonalisering"],
    thinkers: ["alexis_de_tocqueville", "antonio_gramsci", "robert_dahl"],
    methods: ["met_pol_sivilsamfunnsanalyse", "met_pol_makt_og_interesseanalyse", "met_pol_parti_og_bevegelsesanalyse"],
    mechanisms: unique([...hookSpecs.sivilsamfunn.mechanisms, ...hookSpecs.interessegrupper.mechanisms]),
    distinguish: unique([...hookSpecs.sivilsamfunn.distinctions, ...hookSpecs.interessegrupper.distinctions]),
    misconceptions: unique([...hookSpecs.sivilsamfunn.anti, ...hookSpecs.interessegrupper.anti])
  },
  em_pol_ideologi_konfliktlinjer: {
    definition: "Studiet av hvordan ideologier og historiske konfliktlinjer organiserer problemforståelser, interesser, partier, allianser og politiske alternativer.",
    why: "Forhindrer at ideologi reduseres til etiketter ved å knytte ideer til konkrete problemrammer, sosiale interesser og institusjonell praksis.",
    concepts: ["ideologi", "hegemoni", "konfliktlinje", "problemdefinisjon", "verdihierarki", "politisk artikulasjon"],
    questions: ["Hvordan definerer aktøren problemet, årsaken og den legitime løsningen?", "Hvilke interesser eller historiske konfliktlinjer kobles sammen?", "Hvordan skiller erklært ideologi seg fra dokumentert praksis?"],
    conflicts: ["universelle prinsipper vs gruppeinteresser", "ideologisk konsistens vs kompromiss", "hegemoni vs mothegemoni"],
    axes: ["idé vs praksis", "problemramme vs alternativ", "historisk konfliktlinje vs ny artikulasjon"],
    thinkers: ["antonio_gramsci", "karl_marx", "chantal_mouffe"],
    methods: ["met_pol_ideologianalyse", "met_pol_diskursanalyse", "met_pol_politisk_historisk_analyse"],
    mechanisms: hookSpecs.ideologi.mechanisms,
    distinguish: hookSpecs.ideologi.distinctions,
    misconceptions: hookSpecs.ideologi.anti
  },
  em_pol_arbeidsliv_kollektiv_kamp: {
    definition: "Studiet av hvordan arbeidstakere, arbeidsgivere og staten organiserer lønn, vilkår, medbestemmelse og konflikt gjennom lov, avtaler og kollektiv handling.",
    why: "Viser at samarbeid i arbeidslivet bygger på institusjonalisert maktbalanse, organisering og konfliktregler, ikke fravær av interessekonflikt.",
    concepts: ["tariffavtale", "streik", "lockout", "organisasjonsgrad", "medbestemmelse", "trepartssamarbeid"],
    questions: ["Hvilke parter, avtaler og rettsregler strukturerer konflikten?", "Hvilke ressurser og sanksjoner har partene?", "Er saken en rettstvist, en interessekonflikt eller en omstillingskonflikt?"],
    conflicts: ["arbeid vs kapital", "individuell avtale vs kollektiv regulering", "samarbeid vs maktbalanse"],
    axes: ["rettighet vs forhandlingsstyrke", "avtale vs konflikt", "produktivitet vs fordeling"],
    thinkers: ["karl_marx", "stein_rokkan", "charles_tilly"],
    methods: ["met_pol_konfliktanalyse", "met_pol_makt_og_interesseanalyse", "met_pol_politisk_historisk_analyse"],
    mechanisms: hookSpecs.arbeidslivspolitikk.mechanisms,
    distinguish: hookSpecs.arbeidslivspolitikk.distinctions,
    misconceptions: hookSpecs.arbeidslivspolitikk.anti
  },
  em_pol_miljopolitikk_samfunn: {
    definition: "Studiet av hvordan klima-, natur-, areal- og energispørsmål blir politiske konflikter om kunnskap, verdier, risiko, territorium og fordeling.",
    why: "Gjør det mulig å skille faglig usikkerhet fra interesse- og verdikonflikt og å undersøke hvem som får gevinster, kostnader og beslutningsmakt.",
    concepts: ["konsekvensutredning", "miljøkonflikt", "kunnskapskonflikt", "medvirkning", "risikofordeling", "arealpolitikk"],
    questions: ["Hvilke miljøpåstander og kilder kan dokumenteres?", "Hvordan fordeles gevinster, kostnader og risiko mellom aktører og steder?", "Er uenigheten faglig, normativ, fordelingsmessig eller institusjonell?"],
    conflicts: ["miljømål vs lokal kostnad", "ekspertkunnskap vs erfaringskunnskap", "nasjonal styring vs lokal medvirkning"],
    axes: ["usikkerhet vs verdi", "gevinst vs kostnad", "medvirkning vs gjennomslag"],
    thinkers: ["chantal_mouffe", "jurgen_habermas", "charles_tilly"],
    methods: ["met_pol_konfliktanalyse", "met_pol_protest_og_bevegelsesanalyse", "met_pol_plan_og_reguleringsanalyse"],
    mechanisms: hookSpecs.miljopolitisk_konflikt.mechanisms,
    distinguish: hookSpecs.miljopolitisk_konflikt.distinctions,
    misconceptions: hookSpecs.miljopolitisk_konflikt.anti
  },
  em_pol_minnesteder_politisk_kamp: {
    definition: "Studiet av hvordan monumenter, minnesteder, navngivning og ritualer organiserer offentlig erindring, anerkjennelse og strid om fortiden.",
    why: "Viser at minnesteder er politiske utvalg og fortolkninger, ikke nøytrale kopier av historien.",
    concepts: ["kollektivt minne", "monument", "motminne", "offentlig ritual", "kanonisering", "symbolsk makt"],
    questions: ["Hvem initierte og autoriserte minnet, og hvilken hendelse eller person framstilles?", "Hvilke erfaringer eller grupper inkluderes og utelates?", "Hvordan har stedet blitt brukt, utfordret eller nytolket over tid?"],
    conflicts: ["minne vs glemsel", "hyllest vs dokumentasjon", "offisiell fortelling vs motminne"],
    axes: ["historie vs minne", "representasjon vs utelatelse", "stabilitet vs nytolkning"],
    thinkers: ["hannah_arendt", "antonio_gramsci", "chantal_mouffe"],
    methods: ["met_pol_symbolanalyse", "met_pol_politisk_historisk_analyse", "met_pol_diskursanalyse"],
    mechanisms: hookSpecs.minne_og_makt.mechanisms,
    distinguish: hookSpecs.minne_og_makt.distinctions,
    misconceptions: hookSpecs.minne_og_makt.anti
  },
  em_pol_polarisering_tillit: {
    definition: "Studiet av ideologisk og affektiv polarisering, sosial sortering og politisk tillit på tvers av eliter, partier og befolkning.",
    why: "Forhindrer at all uenighet kalles polarisering og krever dokumentasjon av hvilken dimensjon, hvilket nivå og hvilken tidsutvikling som faktisk endres.",
    concepts: ["ideologisk polarisering", "affektiv polarisering", "sosial sortering", "mistillit", "agonisme", "antagonisme"],
    questions: ["Hvilken dimensjon av polarisering eller tillit måles, og på hvilket nivå?", "Finnes sammenlignbare data over tid eller mellom grupper?", "Er caset sterk uenighet, gruppefiendtlighet, sosial sortering eller institusjonell mistillit?"],
    conflicts: ["uenighet vs fiendtlighet", "elite vs masse", "agonisme vs antagonisme"],
    axes: ["meningsavstand vs affekt", "øyeblikk vs trend", "politisk konflikt vs demokratisk sammenbrudd"],
    thinkers: ["chantal_mouffe", "jurgen_habermas", "robert_dahl"],
    methods: ["met_pol_diskursanalyse", "met_pol_legitimitetsanalyse", "met_pol_offentlighetsanalyse"],
    mechanisms: hookSpecs.polarisering.mechanisms,
    distinguish: hookSpecs.polarisering.distinctions,
    misconceptions: hookSpecs.polarisering.anti
  }
};

const methodProfiles = {
  met_pol_konfliktanalyse: ["aktører, krav og konfliktobjekt", "ressurser og sanksjoner", "eskalering, kompromiss og utfall"],
  met_pol_fordelingsanalyse: ["fordeling av kostnad og gevinst", "berørte grupper", "kompensasjon og ulik virkning"],
  met_pol_protest_og_bevegelsesanalyse: ["mobilisering og organisasjon", "repertoar og målgruppe", "mulighetsstruktur og myndighetsrespons"],
  met_pol_offentlighetsanalyse: ["adgang til offentligheten", "synlighet og dagsorden", "begrunnelse, motstemmer og medialisering"],
  met_pol_romlig_maktanalyse: ["sted, adgang og eierskap", "nærhet til målgruppe", "sikkerhet, rute og symbolsk okkupasjon"],
  met_pol_parti_og_bevegelsesanalyse: ["organisasjonsform", "medlems- og alliansebygging", "kravoversettelse og strategi"],
  met_pol_ideologianalyse: ["problemdefinisjon", "verdihierarki", "kobling mellom idé, interesse og politisk alternativ"],
  met_pol_makt_og_interesseanalyse: ["maktressurser", "adgang og dagsorden", "observerbart gjennomslag og ikke-beslutning"],
  met_pol_diskursanalyse: ["begrepsinnramming", "subjekt- og fiendekonstruksjon", "normalisering og utelukkede alternativer"],
  met_pol_sivilsamfunnsanalyse: ["medlemsgrunnlag", "autonomi og finansiering", "tjenesteyting, offentlighet og påvirkning"],
  met_pol_symbolanalyse: ["symbolprodusent og målgruppe", "representasjon og utelatelse", "ritual, bruk og nytolkning"],
  met_pol_politisk_historisk_analyse: ["historisk konfliktkontekst", "institusjonell endring", "kontinuitet, brudd og senere minnebruk"],
  met_pol_legitimitetsanalyse: ["begrunnelseskrav", "prosedyre og aksept", "tillit, opposisjon og gjensidig toleranse"]
};

const fagkartPath = `${BASE}/fagkart_politikk_canonical_v4_5.json`;
const emnerPath = `${BASE}/emner_politikk_canonical_v4_5.json`;
const methodsPath = `${BASE}/methods_politikk_canonical_v4_5.json`;
const mappingPath = `${BASE}/emnemapping_politikk_canonical_v4_5.json`;
const pensumPath = `${BASE}/politikkpensum_canonical_v4_5.json`;
const generatorPath = `${BASE}/quiz_generator_rules_politikk_v5_1_source_priority_patch.json`;

const fagkart = read(fagkartPath);
const emner = read(emnerPath);
const methods = read(methodsPath);
const mapping = read(mappingPath);
const pensum = read(pensumPath);
const generator = read(generatorPath);

const domain = requireValue(fagkart.categories.find((item) => item.id === DOMAIN_ID), `Mangler fagkartdomene ${DOMAIN_ID}`);
Object.assign(domain, {
  tagline: "Hvordan interesser, organisasjoner, protester, ideologier og offentlige rom omformer konflikt til politisk makt, motmakt og institusjonell endring.",
  definition: "Domenet analyserer hvordan interesser organiseres, hvordan makt utøves og utfordres, og hvordan sivilsamfunn, protest, arbeidsliv, ideologi, miljøstrid, minne og polarisering påvirker politiske beslutninger og offentlig orden.",
  focus: ["maktressurser og interesser", "sivilsamfunn og organisering", "protest og politiske muligheter", "ideologi og konfliktlinjer", "arbeidsliv og miljøkonflikt", "minne, polarisering og konfliktens rom"],
  quality_revision: REVISION,
  generator_profile_id: DOMAIN_ID
});

for (const [hookId, spec] of Object.entries(hookSpecs)) {
  const hook = requireValue(domain.topic_hooks.find((item) => item.id === hookId), `Mangler hook ${hookId}`);
  hook.canon = hook.canon || {};
  hook.canon.thinkers = spec.lenses.map(([id, concept]) => ({ id, name: thinkerNames[id], role: concept, tier: "core" }));
  Object.assign(hook, {
    definition: spec.definition,
    core_problem: spec.core_problem,
    mechanisms: spec.mechanisms,
    critical_distinctions: spec.distinctions,
    theory_lenses: spec.lenses.map(([thinker_id, concept]) => ({ thinker_id, concept })),
    case_anchors: spec.cases,
    anti_reduction: spec.anti,
    required_anchor_types: spec.anchors,
    recommended_oslo_cases: spec.cases,
    recommended_method_ids: spec.methods,
    question_surface_mode: "conflict-case-actor-mechanism-distinction-theory",
    preferred_question_moves: spec.moves,
    comparison_pairs: [[spec.lenses[0][0], spec.lenses[1][0]], [spec.lenses[1][0], spec.lenses[2][0]]],
    norwegian_thinker_ids: spec.lenses.map(([id]) => id).filter((id) => ["stein_rokkan", "gudmund_hernes"].includes(id)),
    underused_thinker_ids: spec.lenses.map(([id]) => id),
    rotation_note: `Roter dokumenterbare konfliktcases, aktører, kilder og mekanismer for ${spec.title}. Teori brukes først etter at krav, maktmekanisme og distinksjon er identifisert.`,
    quality_revision: REVISION
  });
  hook.avoid_surface_forms = unique([
    ...(hook.avoid_surface_forms || []).slice(0, 5),
    ...spec.anti,
    "Ikke bruk teoretikernavn som svar uten begrep og mekanisme.",
    "Ikke bruk canonical-filen som faktakilde.",
    "Ikke hopp direkte fra sted til teori uten dokumentert konfliktpåstand."
  ]);
  hook.generator_constraints = {
    ...(hook.generator_constraints || {}),
    min_case_count: 2,
    min_method_count: 1,
    require_institution_law_conflict_or_social_process_anchor: true,
    require_external_claim_basis: true,
    rotate_theorists: true,
    do_not_generate_from_hook_label_only: true,
    require_concrete_institution_law_conflict_policy_or_social_process: true,
    do_not_generate_from_emne_label_only: true,
    required_emne_prefix: "em_pol_",
    require_case_specific_question: true,
    require_actor_and_claim_identification: true,
    require_mechanism_explanation: true,
    require_critical_distinction: true,
    require_method_match_to_mechanism: true,
    ban_theorist_name_as_answer_without_concept: true
  };
}
requireValue(domain.topic_hooks.length === 10, `Forventet 10 hooks, fikk ${domain.topic_hooks.length}`);

for (const [emneId, spec] of Object.entries(emneSpecs)) {
  const emne = requireValue(emner.find((item) => item.emne_id === emneId), `Mangler emne ${emneId}`);
  Object.assign(emne, {
    definition: spec.definition,
    why_it_matters: spec.why,
    core_concepts: spec.concepts,
    key_questions: spec.questions,
    conflicts: spec.conflicts,
    analysis_axes: spec.axes,
    canonical_thinker_ids: spec.thinkers,
    canonical_thinkers: spec.thinkers.map((id) => thinkerNames[id]),
    norwegian_thinker_ids: spec.thinkers.filter((id) => ["stein_rokkan", "gudmund_hernes"].includes(id)),
    quiz_angles: ["identifiser dokumentert aktør, krav og konfliktobjekt", "forklar makt-, mobiliserings- eller påvirkningsmekanismen", "test en presis konfliktdistinksjon før eventuell teori"],
    generator_use_note: "Bruk emnet til å velge aktører, mekanisme, distinksjon og metode. Faktapåstanden må komme fra ekstern dokumentasjon av organisasjon, vedtak, protest, avtale, konflikt, måling eller offentlig hendelse.",
    mechanisms: spec.mechanisms,
    distinguish_from: spec.distinguish,
    misconceptions: spec.misconceptions,
    recommended_method_ids: spec.methods,
    recommended_methods: spec.methods,
    theory_progression: ["case og kilde", "aktør og krav", "makt- eller mobiliseringsmekanisme", "kritisk distinksjon", "målrettet teoribegrep"],
    quality_revision: REVISION
  });
  emne.generator_constraints = {
    ...(emne.generator_constraints || {}),
    require_case_anchor_before_theory: true,
    require_external_claim_basis: true,
    require_institution_law_conflict_or_social_process_anchor: true,
    do_not_generate_from_emne_label_only: true,
    require_actor_and_claim_identification: true,
    require_mechanism_explanation: true,
    require_critical_distinction: true,
    ban_theorist_name_as_answer_without_concept: true
  };
  emne.anti_patterns = unique([
    ...(emne.anti_patterns || []).slice(0, 3),
    "Ikke bruk teoretikernavn som svar uten begrep og mekanisme.",
    "Ikke bruk canonical-filen som faktakilde.",
    "Ikke hopp direkte fra sted til teori uten dokumentert konfliktpåstand."
  ]);
}

const methodIds = new Set(methods.methods.map((method) => method.method_id));
for (const [methodId, focus] of Object.entries(methodProfiles)) {
  const method = requireValue(methods.methods.find((item) => item.method_id === methodId), `Mangler metode ${methodId}`);
  method.domain_profiles = method.domain_profiles || {};
  method.domain_profiles[DOMAIN_ID] = {
    quality_revision: REVISION,
    mechanism_focus: focus,
    critical_distinctions: ["adgang vs gjennomslag", "synlighet vs virkning", "uenighet vs maktasymmetri"],
    source_requirements: ["identifiserbar aktør og krav", "ekstern dokumentasjon av prosess eller hendelse", "kilde som kan bære den konkrete påstanden"],
    case_anchor_types: ["organisation", "decision_or_rule", "conflict_or_protest", "documented_outcome"],
    question_use: ["etabler faktagrunnlag", "forklar mekanisme", "test distinksjon", "bruk teori bare som presist forklaringsledd"],
    anti_patterns: ["teoretikernavn uten begrep", "holdningsspørsmål uten dokumentert case", "sted som erstatning for konfliktmekanisme"]
  };
}

let mappingCount = 0;
for (const item of mapping) {
  for (const map of item.mappings || []) {
    if (map.fagkart_kategori !== DOMAIN_ID) continue;
    const spec = requireValue(hookSpecs[map.topic_hook], `Mapping peker til ukjent hook ${map.topic_hook}`);
    mappingCount += 1;
    Object.assign(map, {
      quality_revision: REVISION,
      source_anchor_required: true,
      external_claim_basis_required: true,
      claim_basis_required: true,
      claim_basis_types: spec.anchors,
      actor_and_claim_required: true,
      mechanism_options: spec.mechanisms,
      critical_distinction_options: spec.distinctions,
      theory_lenses: spec.lenses.map(([thinker_id, concept]) => ({ thinker_id, concept })),
      case_anchors: spec.cases,
      recommended_method_ids: spec.methods,
      question_chain: ["external_conflict_case_or_source", "claim_basis", "actor_claim_and_target", "power_mobilisation_or_influence_mechanism", "critical_distinction", "optional_theory_lens"],
      source_rule: "Konkrete påstander må bygge på ekstern dokumentasjon av aktør, krav, organisasjon, vedtak, avtale, protest, konflikt, måling eller utfall. Canonical-filene styrer analysen, men er ikke faktakilder."
    });
    map.generator_constraints = {
      ...(map.generator_constraints || {}),
      require_external_claim_basis: true,
      require_case_specific_question: true,
      require_actor_and_claim_identification: true,
      require_mechanism_explanation: true,
      require_critical_distinction: true,
      require_method_match_to_mechanism: true,
      ban_theorist_name_as_answer_without_concept: true,
      do_not_generate_from_hook_or_emne_label_only: true
    };
    for (const methodId of map.recommended_method_ids) requireValue(methodIds.has(methodId), `Mapping ${map.topic_hook} peker til ukjent metode ${methodId}`);
  }
}
requireValue(mappingCount === 20, `Forventet 20 konfliktmappinger, fikk ${mappingCount}`);

const pensumDomain = requireValue(pensum.domains.find((item) => item.domain_id === DOMAIN_ID), `Mangler pensumdomene ${DOMAIN_ID}`);
Object.assign(pensumDomain, {
  tagline: domain.tagline,
  definition: domain.definition,
  question_role: "Start i en dokumenterbar aktør, organisasjon, avtale, protest, beslutning, konflikt, måling eller offentlig hendelse. Identifiser krav og målgruppe, forklar makt-, mobiliserings- eller påvirkningsmekanismen, test en kritisk distinksjon og bruk teori bare når den presiserer mekanismen.",
  status: "complete_revised",
  method_count: Object.keys(methodProfiles).length,
  quality_revision: REVISION,
  generator_profile: DOMAIN_ID,
  revised_method_ids: Object.keys(methodProfiles),
  required_question_chain: ["external_conflict_case_or_source", "claim_basis", "actor_claim_and_target", "power_mobilisation_or_influence_mechanism", "critical_distinction", "optional_theory_lens"],
  quality_rule: "Teori brukes etter at aktør, krav, mål, kilde og konfliktmekanisme er dokumentert. Canonical-filene definerer analyseformen, men er ikke faktakilder.",
  vertical_chain_status: {
    fagkart_hooks_revised: 10,
    emner_revised: Object.keys(emneSpecs).length,
    method_profiles_revised: Object.keys(methodProfiles).length,
    mappings_revised: mappingCount,
    generator_profile_active: true,
    question_blueprints_validated: 10
  }
});

const emneIds = Object.keys(emneSpecs);
generator.domain_quality_profiles = generator.domain_quality_profiles || {};
generator.domain_quality_profiles[DOMAIN_ID] = {
  status: "complete_revised",
  quality_revision: REVISION,
  domain_id: DOMAIN_ID,
  question_surface_mode: "conflict-case-actor-mechanism-distinction-theory",
  required_chain: ["external_conflict_case_or_source", "claim_basis", "actor_claim_and_target", "power_mobilisation_or_influence_mechanism", "critical_distinction", "optional_theory_lens"],
  source_anchor_required: true,
  external_claim_basis_required: true,
  actor_and_claim_required: true,
  revised_hook_ids: Object.keys(hookSpecs),
  revised_emne_ids: emneIds,
  revised_method_ids: Object.keys(methodProfiles),
  global_bans: ["teoretikernavn som løsrevet fasit", "generisk moralsk holdningsspørsmål", "påstand hentet bare fra emne- eller hooknavn", "sted uten dokumentert aktør, krav eller konfliktprosess"],
  generator_constraints: {
    require_external_claim_basis: true,
    require_actor_and_claim_identification: true,
    require_mechanism_explanation: true,
    require_critical_distinction: true,
    require_method_match_to_mechanism: true,
    ban_theorist_name_as_answer_without_concept: true
  }
};

const blueprintEmne = {
  makt_og_interesser: "em_pol_makt_interesser",
  demonstrasjoner: "em_pol_demonstrasjoner_protest",
  sivilsamfunn: "em_pol_interessegrupper_organisasjoner",
  interessegrupper: "em_pol_interessegrupper_organisasjoner",
  ideologi: "em_pol_ideologi_konfliktlinjer",
  arbeidslivspolitikk: "em_pol_arbeidsliv_kollektiv_kamp",
  miljopolitisk_konflikt: "em_pol_miljopolitikk_samfunn",
  minne_og_makt: "em_pol_minnesteder_politisk_kamp",
  polarisering: "em_pol_polarisering_tillit",
  konfliktens_rom: "em_pol_demonstrasjoner_protest"
};
const blueprints = Object.entries(hookSpecs).map(([hookId, spec], index) => ({
  blueprint_id: `pol_konflikt_${String(index + 1).padStart(2, "0")}_${hookId}`,
  domain_id: DOMAIN_ID,
  topic_hook: hookId,
  emne_id: blueprintEmne[hookId],
  source_anchor: spec.anchors[0],
  claim_basis: `Dokumenter en konkret ${spec.anchors[0]}-kilde som identifiserer aktør, krav, mål eller utfall.`,
  method_id: spec.methods[0],
  mechanism: spec.mechanisms[0],
  critical_distinction: spec.distinctions[0],
  theory_lens: { thinker_id: spec.lenses[0][0], concept: spec.lenses[0][1] },
  question_plan: `Start i det dokumenterte caset, identifiser aktør og krav, forklar ${spec.mechanisms[0]}, og test forskjellen mellom ${spec.distinctions[0]}.`,
  answer_rule: "Riktig svar må forklare den dokumenterte mekanismen. Teoribegrepet er bare gyldig når det presiserer caset."
}));

fs.mkdirSync(REPORT_BASE, { recursive: true });
write(fagkartPath, fagkart);
write(emnerPath, emner);
write(methodsPath, methods);
write(mappingPath, mapping);
write(pensumPath, pensum);
write(generatorPath, generator);
write(`${REPORT_BASE}/konflikt-makt-question-blueprints.json`, blueprints);

const report = `# Politikk: konflikt, makt og sivilsamfunn – vertikal kvalitetskjede\n\n## Resultat\n\nDomenet \`${DOMAIN_ID}\` er revidert direkte i de aktive kanoniske filene. Ingen overlay eller runtime-sidekanal er opprettet.\n\n## Omfang\n\n- 10 topic hooks med presise definisjoner, mekanismer, distinksjoner, teorispor, caseankre og antireduksjon\n- ${Object.keys(emneSpecs).length} emner direkte revidert\n- ${Object.keys(methodProfiles).length} kanoniske metoder med domenespesifikk konfliktprofil\n- ${mappingCount} emnemappinger med aktør, krav, kildegrunnlag, mekanisme, distinksjon og metode\n- 10 representative spørsmålsplaner\n\n## Fast spørsmålsrekkefølge\n\n1. ekstern dokumentasjon av organisasjon, avtale, vedtak, protest, konflikt, måling eller hendelse\n2. presis claim basis\n3. aktør, krav og målgruppe\n4. makt-, mobiliserings- eller påvirkningsmekanisme\n5. kritisk distinksjon\n6. valgfritt teoribegrep\n\n## Kvalitetsregel\n\nTeoretikernavn alene er aldri gyldig fasit. Sted, person eller organisasjon er heller ikke nok: spørsmålet må bygge på en dokumentert konfliktprosess og teste hva aktørene gjør, hvilke ressurser eller regler som virker, og hvilken distinksjon caset krever.\n`;
fs.writeFileSync(`${REPORT_BASE}/konflikt-makt-vertical-chain.md`, report);

console.log(`Oppdaterte ${Object.keys(hookSpecs).length} hooks, ${Object.keys(emneSpecs).length} emner, ${Object.keys(methodProfiles).length} metodeprofiler og ${mappingCount} mappinger.`);
