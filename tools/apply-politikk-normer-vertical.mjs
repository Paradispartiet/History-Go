import fs from 'node:fs';
import path from 'node:path';

const REVISION = 'politikk-normer-vertical-2026-07-24';
const DOMAIN_ID = 'normer_identitet_hverdagsliv';
const BASE = process.env.POLITIKK_BASE || 'data/fag/politikk';
const REPORT_BASE = process.env.POLITIKK_REPORT_BASE || 'reports/politikk-canonical-migration';
const p = (name) => path.join(BASE, name);
const read = (name) => JSON.parse(fs.readFileSync(p(name), 'utf8'));
const write = (name, value) => fs.writeFileSync(p(name), `${JSON.stringify(value, null, 2)}\n`);
const unique = (values) => [...new Set(values)];
const requireValue = (value, message) => { if (!value) throw new Error(message); return value; };

const files = {
  fagkart: 'fagkart_politikk_canonical_v4_5.json',
  emner: 'emner_politikk_canonical_v4_5.json',
  methods: 'methods_politikk_canonical_v4_5.json',
  mapping: 'emnemapping_politikk_canonical_v4_5.json',
  pensum: 'politikkpensum_canonical_v4_5.json',
  generator: 'quiz_generator_rules_politikk_v5_1_source_priority_patch.json'
};

const thinkerNames = {
  emile_durkheim: 'Émile Durkheim',
  erving_goffman: 'Erving Goffman',
  michel_foucault: 'Michel Foucault',
  judith_butler: 'Judith Butler',
  pierre_bourdieu: 'Pierre Bourdieu',
  james_c_scott: 'James C. Scott',
  antonio_gramsci: 'Antonio Gramsci',
  theda_skocpol: 'Theda Skocpol',
  john_rawls: 'John Rawls',
  ronald_dworkin: 'Ronald Dworkin',
  hannah_arendt: 'Hannah Arendt',
  robert_dahl: 'Robert Dahl',
  anne_phillips: 'Anne Phillips',
  arend_lijphart: 'Arend Lijphart',
  stein_rokkan: 'Stein Rokkan'
};

const hookSpecs = {
  normalitet: {
    title: 'Normalitet',
    definition: 'Normalitet analyserer hvordan institusjoner, fagstandarder, statistiske kategorier og hverdagsforventninger gjør enkelte kropper, livsformer og handlinger til målestokk, mens andre markeres som avvik eller særtilfeller.',
    core_problem: 'Hvilken standard eller forventning brukes, hvem har definert den, hvordan håndheves den, og hvilke konkrete konsekvenser får den for adgang, vurdering eller behandling?',
    mechanisms: ['standardisering', 'klassifikasjon', 'normalitetsmåling', 'institusjonell rutine', 'faglig vurderingsmakt', 'selvregulering', 'stigmatisering', 'tilpasningskrav'],
    distinctions: ['statistisk vanlig vs normativt ønskelig', 'forskjell vs avvik', 'formell standard vs lokal praksis', 'beskrivelse vs normalisering'],
    lenses: [['michel_foucault', 'normalisering og disiplin'], ['emile_durkheim', 'normer og sosial orden'], ['pierre_bourdieu', 'doxa og symbolsk klassifikasjon']],
    cases: ['skoler i Oslo', 'NAV-kontor', 'Oslo tinghus'],
    methods: ['met_pol_normanalyse', 'met_pol_praksisanalyse', 'met_pol_diskursanalyse'],
    anti: ['Ikke bruk «normal» som synonym for riktig eller naturlig.', 'Ikke utled en norm bare fra ett avvikstilfelle.', 'Ikke bland statistisk flertall med legitim standard.'],
    anchors: ['official_standard_or_guideline', 'institutional_practice_record', 'statistics_or_classification', 'complaint_or_case'],
    moves: ['identify_standard_and_authority', 'trace_enforcement_and_consequence', 'separate_description_from_normalisation']
  },
  minoritet_majoritet: {
    title: 'Minoritet og majoritet',
    definition: 'Minoritet og majoritet analyserer ikke bare antall, men hvordan rettigheter, representasjon, språk, institusjonell adgang og sosial dominans former gruppers mulighet til å bli hørt og påvirke beslutninger.',
    core_problem: 'Er majoriteten numerisk, kulturelt dominerende eller institusjonelt overrepresentert, og hvilke rettigheter eller ordninger beskytter minoritetens faktiske handlingsrom?',
    mechanisms: ['flertallsregel', 'representasjonsordning', 'språkkrav', 'minoritetsvern', 'agendaadgang', 'koalisjonsbygging', 'institusjonell overrepresentasjon', 'sosial dominans'],
    distinctions: ['numerisk minoritet vs maktsvak minoritet', 'lik behandling vs likeverdig virkning', 'tilstedeværelse vs innflytelse', 'integrasjon vs assimilering'],
    lenses: [['robert_dahl', 'opposisjonsrett og demokratisk inkludering'], ['anne_phillips', 'politisk tilstedeværelse og representasjon'], ['arend_lijphart', 'maktfordeling og minoritetsvern']],
    cases: ['Stortinget', 'Oslo rådhus', 'Grønland'],
    methods: ['met_pol_minoritet_og_representasjonsanalyse', 'met_pol_representasjonsanalyse', 'met_pol_rettighetsanalyse'],
    anti: ['Ikke behandle minoritet som synonym for liten gruppe i alle sammenhenger.', 'Ikke anta at formell stemmerett gir lik politisk innflytelse.', 'Ikke generaliser om en gruppe uten å identifisere populasjon og kilde.'],
    anchors: ['representation_data', 'law_or_rights_rule', 'participation_statistics', 'institutional_decision'],
    moves: ['identify_majority_dimension', 'trace_rule_access_and_representation', 'separate_presence_from_influence']
  },
  hverdagslivets_politikk: {
    title: 'Hverdagslivets politikk',
    definition: 'Hverdagslivets politikk undersøker hvordan rutiner, køer, åpningstider, transport, språk, kroppslig opptreden og uformelle forventninger fordeler tid, verdighet, synlighet og adgang i dagliglivet.',
    core_problem: 'Hvilken konkret rutine eller praksis organiserer hverdagen, hvem forventes å tilpasse seg, og hvilke ressurser eller grupper rammes ulikt?',
    mechanisms: ['rutinisering', 'tidsdisiplin', 'interaksjonsorden', 'adgangskode', 'uformell sanksjon', 'praktisk tilpasning', 'skjult motstand', 'serviceutforming'],
    distinctions: ['regel vs rutine', 'frivillig vane vs forventet tilpasning', 'små ulemper vs systematisk skjevhet', 'individuell høflighet vs institusjonell adgang'],
    lenses: [['erving_goffman', 'interaksjonsorden og situasjonsregler'], ['pierre_bourdieu', 'habitus og praktisk sans'], ['james_c_scott', 'hverdagsmotstand og skjulte praksiser']],
    cases: ['Tøyen', 'Oslo kollektivtransport', 'bydelskontor'],
    methods: ['met_pol_praksisanalyse', 'met_pol_normanalyse', 'met_pol_levekarsanalyse'],
    anti: ['Ikke gjør enhver vane politisk uten å vise fordeling eller maktvirkning.', 'Ikke forklar hverdagspraksis bare med individuelle holdninger.', 'Ikke bruk stedets rykte som dokumentasjon på praksis.'],
    anchors: ['service_or_access_rule', 'observed_or_documented_practice', 'time_use_or_usage_data', 'complaint_or_user_experience_source'],
    moves: ['identify_routine_and_expected_user', 'trace_distribution_of_time_access_or_dignity', 'separate_personal_habit_from_institutional_practice']
  },
  kjonn_og_samfunn: {
    title: 'Kjønn og samfunn',
    definition: 'Kjønn og samfunn analyserer hvordan lover, arbeidsdeling, familieroller, representasjon, institusjonelle kategorier og forventninger produserer kjønnete muligheter og byrder.',
    core_problem: 'Hvilken regel, ordning eller praksis får ulik virkning etter kjønn, og skyldes forskjellen direkte regulering, arbeidsdeling, normer eller skjev tilgang til ressurser?',
    mechanisms: ['kjønnet arbeidsdeling', 'direkte diskriminering', 'indirekte diskriminering', 'representasjonsmønster', 'omsorgsfordeling', 'performativ norm', 'institusjonell kategorisering', 'ressursulikhet'],
    distinctions: ['lik regel vs ulik virkning', 'biologisk forskjell vs sosial organisering', 'representasjon vs beslutningsmakt', 'familievalg vs strukturelt handlingsrom'],
    lenses: [['judith_butler', 'kjønnsnormer og performativitet'], ['pierre_bourdieu', 'symbolsk makt og kjønnet habitus'], ['john_rawls', 'rettferdig fordeling av grunnleggende muligheter']],
    cases: ['Stortinget', 'Oslo tinghus', 'skoler i Oslo'],
    methods: ['met_pol_likestillingsanalyse', 'met_pol_fordelingsanalyse', 'met_pol_rettslig_analyse'],
    anti: ['Ikke forklar kjønnsforskjeller uten å identifisere sammenligningsgrunnlaget.', 'Ikke likestill representasjon med faktisk innflytelse.', 'Ikke gjør individuelle livsvalg til full forklaring på institusjonelle mønstre.'],
    anchors: ['equality_law_or_decision', 'gender_disaggregated_statistics', 'institutional_rule', 'documented_practice_or_case'],
    moves: ['identify_rule_or_practice', 'trace_gendered_effect', 'separate_formal_equality_from_substantive_effect']
  },
  familie_og_stat: {
    title: 'Familie og stat',
    definition: 'Familie og stat analyserer hvordan foreldreansvar, omsorg, samliv, barnevern, permisjon, ytelser og tjenester fordeler rettigheter, plikter og skjønn mellom familie, marked og offentlig myndighet.',
    core_problem: 'Hvilket omsorgsansvar eller familiebegrep ligger i ordningen, hvem får rettigheter og plikter, og hvor oppstår konflikt mellom privatliv, barnets beste og offentlig inngrep?',
    mechanisms: ['rettighetsfastsettelse', 'omsorgsfordeling', 'ytelsesvilkår', 'forvaltningsskjønn', 'barnets beste-vurdering', 'tjenestetildeling', 'familiekategorisering', 'kontroll og oppfølging'],
    distinctions: ['privat omsorg vs offentlig ansvar', 'familieautonomi vs beskyttelsesplikt', 'universell ytelse vs behovsprøving', 'rettighet vs forvaltningsskjønn'],
    lenses: [['theda_skocpol', 'velferdsstat og sosialpolitisk institusjonsbygging'], ['michel_foucault', 'styring av befolkning og familie'], ['ronald_dworkin', 'likeverdig offentlig omtanke og rettigheter']],
    cases: ['familievernkontor', 'NAV-kontor', 'Oslo tinghus'],
    methods: ['met_pol_velferdsstatlig_analyse', 'met_pol_rettighetsanalyse', 'met_pol_forvaltningsanalyse'],
    anti: ['Ikke framstill familien som rent privat når rettigheter og tjenester reguleres offentlig.', 'Ikke anta at barnets beste har én automatisk løsning.', 'Ikke bland lovfestet rett med faktisk tjenestetilgang.'],
    anchors: ['family_law_or_regulation', 'service_eligibility_rule', 'administrative_decision', 'official_statistics_or_evaluation'],
    moves: ['identify_family_category_and_state_role', 'trace_right_duty_and_discretion', 'separate_legal_entitlement_from_service_access']
  },
  migrasjon: {
    title: 'Migrasjon',
    definition: 'Migrasjon analyserer hvordan statsborgerskap, opphold, arbeid, språk, bolig, skole og velferdstjenester former rettigheter, deltakelse og tilhørighet for personer som flytter mellom land og samfunn.',
    core_problem: 'Hvilken rettslig eller institusjonell status er avgjørende, hvilke barrierer dokumenteres, og måles integrering som deltakelse, likhet, tilhørighet eller tilpasning?',
    mechanisms: ['oppholdsstatus', 'statsborgerskapsregel', 'språkkrav', 'arbeidsmarkedsadgang', 'tjenestetilgang', 'bosettingspolitikk', 'diskriminering', 'nettverksressurs'],
    distinctions: ['migrasjon vs integrering', 'integrering vs assimilering', 'rettslig status vs sosial tilhørighet', 'gruppegjennomsnitt vs individuell situasjon'],
    lenses: [['hannah_arendt', 'statsborgerskap og retten til å ha rettigheter'], ['pierre_bourdieu', 'kapital, felt og ulik adgang'], ['stein_rokkan', 'territorium, sentrum og politiske grenser']],
    cases: ['Grønland', 'Tøyen', 'Politihuset på Grønland'],
    methods: ['met_pol_integreringsanalyse', 'met_pol_statistikk_og_fordelingsanalyse', 'met_pol_rettighetsanalyse'],
    anti: ['Ikke bruk integrering som mål uten å definere indikator og sammenligningsgrunnlag.', 'Ikke generaliser fra landbakgrunn til individ.', 'Ikke bland oppholdsstatus, statsborgerskap og sosial tilhørighet.'],
    anchors: ['migration_or_citizenship_rule', 'population_statistics', 'service_or_labour_market_data', 'administrative_or_court_decision'],
    moves: ['identify_status_rule_and_population', 'trace_barrier_or_participation_mechanism', 'separate_integration_from_assimilation']
  },
  sosial_kontroll: {
    title: 'Sosial kontroll',
    definition: 'Sosial kontroll analyserer hvordan formelle regler, overvåking, rykter, skam, belønning, sanksjoner og gjensidig forventning regulerer handlinger i familier, miljøer og institusjoner.',
    core_problem: 'Hvem overvåker eller vurderer hvem, hvilken norm håndheves, hvilke sanksjoner er mulige, og finnes det reell mulighet til å protestere eller forlate situasjonen?',
    mechanisms: ['formell sanksjon', 'uformell sanksjon', 'overvåking', 'ryktekontroll', 'skam og anerkjennelse', 'selvdisiplin', 'avhengighet', 'klage- og utgangsmulighet'],
    distinctions: ['omsorg vs kontroll', 'sosialisering vs tvang', 'formell regel vs uformell sanksjon', 'negativ sosial kontroll vs all sosial regulering'],
    lenses: [['michel_foucault', 'disiplin, overvåking og selvregulering'], ['emile_durkheim', 'normbrudd og sosial sanksjon'], ['erving_goffman', 'stigma og situasjonell kontroll']],
    cases: ['skoler i Oslo', 'Oslo tinghus', 'familievernkontor'],
    methods: ['met_pol_kontroll_og_sanksjonsanalyse', 'met_pol_normanalyse', 'met_pol_kritisk_rettsanalyse'],
    anti: ['Ikke bruk sosial kontroll bare om minoritetsmiljøer.', 'Ikke likestill alle normer med tvang.', 'Ikke påstå kontroll uten å identifisere sanksjon, avhengighet eller overvåking.'],
    anchors: ['rule_or_sanction_record', 'complaint_or_case', 'institutional_guideline', 'survey_or_research_data'],
    moves: ['identify_norm_controller_and_target', 'trace_sanction_dependency_and_exit', 'separate_socialisation_from_coercion']
  },
  tause_regler: {
    title: 'Tause regler',
    definition: 'Tause regler er forventninger som sjelden formuleres eksplisitt, men som læres gjennom korreksjon, imitasjon, belønning og hvem som oppfattes som naturlig hjemme i en situasjon.',
    core_problem: 'Hvordan kan en regel dokumenteres når den ikke står skrevet, hvem behersker den på forhånd, og hvilke konkrete reaksjoner møter den som bryter den?',
    mechanisms: ['doxa', 'habitus', 'situasjonell korreksjon', 'portvokting', 'kodekunnskap', 'symbolsk belønning', 'forlegenhet', 'common sense'],
    distinctions: ['taus regel vs personlig preferanse', 'implisitt forventning vs formelt krav', 'manglende kodekunnskap vs manglende evne', 'frivillig stil vs adgangsbetingelse'],
    lenses: [['pierre_bourdieu', 'doxa, habitus og symbolsk mestring'], ['erving_goffman', 'situasjonsregler og forlegenhet'], ['antonio_gramsci', 'common sense og hegemonisk selvfølgelighet']],
    cases: ['Stortinget', 'Oslo rådhus', 'skoler i Oslo'],
    methods: ['met_pol_praksisanalyse', 'met_pol_diskursanalyse', 'met_pol_normanalyse'],
    anti: ['Ikke påstå en taus regel uten gjentakende praksis eller reaksjoner.', 'Ikke forveksle manglende kunnskap om kode med individuell inkompetanse.', 'Ikke bruk anekdote alene som bevis for institusjonell norm.'],
    anchors: ['documented_repeated_practice', 'interaction_or_access_case', 'institutional_ethnography_or_study', 'complaint_or_testimony_collection'],
    moves: ['identify_unwritten_expectation', 'trace_learning_correction_and_gatekeeping', 'separate_preference_from_access_condition']
  },
  likeverd: {
    title: 'Likeverd',
    definition: 'Likeverd analyserer om mennesker møtes med samme grunnleggende respekt, rettighetsvern og reelle adgang, selv når lik behandling krever ulike tiltak eller tilrettelegging.',
    core_problem: 'Er regelen lik på papiret, hvem får ulik virkning i praksis, og hvilket rettighets-, fordelings- eller tilretteleggingsprinsipp begrunner forskjellsbehandling?',
    mechanisms: ['rettighetsvern', 'universell utforming', 'rimelig tilrettelegging', 'indirekte diskriminering', 'ressursfordeling', 'prosessuell rettssikkerhet', 'representasjon', 'klageadgang'],
    distinctions: ['likhet vs likeverd', 'lik behandling vs like muligheter', 'forskjellsbehandling vs diskriminering', 'formell rett vs faktisk adgang'],
    lenses: [['john_rawls', 'rettferdige grunninstitusjoner og reelle muligheter'], ['ronald_dworkin', 'lik omtanke og respekt'], ['anne_phillips', 'tilstedeværelse, forskjell og politisk likhet']],
    cases: ['Oslo tinghus', 'Stortinget', 'Oslo rådhus'],
    methods: ['met_pol_rettighetsanalyse', 'met_pol_likestillingsanalyse', 'met_pol_fordelingsanalyse'],
    anti: ['Ikke bruk likeverd som løs moralsk ros uten regel eller virkning.', 'Ikke anta at identisk behandling alltid er rettferdig.', 'Ikke påstå diskriminering uten sammenligningsgrunnlag og mekanisme.'],
    anchors: ['rights_or_equality_law', 'ombud_or_court_decision', 'access_or_outcome_data', 'institutional_rule'],
    moves: ['identify_comparator_and_rule', 'trace_effect_and_accommodation', 'separate_equal_treatment_from_equal_access']
  },
  samfunnets_grenser: {
    title: 'Samfunnets grenser',
    definition: 'Samfunnets grenser analyserer hvordan statsborgerskap, medlemskap, språk, bosted, funksjonsevne, alder og sosial kategori avgjør hvem som regnes med, får adgang eller kan gjøre krav gjeldende.',
    core_problem: 'Hvilken grense trekkes, hvem kontrollerer den, hvilke kriterier brukes, og finnes det rett til begrunnelse, klage eller endring av status?',
    mechanisms: ['medlemskapskriterium', 'statsborgerskap', 'adgangskontroll', 'kategoriport', 'dokumentasjonskrav', 'territoriell avgrensning', 'rettighetsstatus', 'klage og statusendring'],
    distinctions: ['juridisk medlemskap vs sosial tilhørighet', 'åpen arena vs reell adgang', 'inkludering vs betinget assimilering', 'kategori vs identitet'],
    lenses: [['hannah_arendt', 'medlemskap og retten til å ha rettigheter'], ['pierre_bourdieu', 'klassifikasjon og symbolsk grensedragning'], ['robert_dahl', 'inkludering i det politiske fellesskapet']],
    cases: ['Stortinget', 'Oslo tinghus', 'Rådhusplassen'],
    methods: ['met_pol_rettighetsanalyse', 'met_pol_minoritet_og_representasjonsanalyse', 'met_pol_kritisk_rettsanalyse'],
    anti: ['Ikke behandle sosial identitet som fast og naturlig kategori.', 'Ikke kall en arena inkluderende bare fordi den formelt er åpen.', 'Ikke bland juridisk status med opplevd tilhørighet.'],
    anchors: ['membership_or_citizenship_rule', 'access_criteria', 'court_or_administrative_decision', 'participation_or_exclusion_data'],
    moves: ['identify_boundary_and_gatekeeper', 'trace_criteria_consequence_and_appeal', 'separate_legal_membership_from_social_belonging']
  }
};

const emneSpecs = {
  em_pol_familie_stat_omsorg: ['familie_og_stat', ['theda_skocpol', 'michel_foucault', 'ronald_dworkin']],
  em_pol_hverdagslivets_regler: ['hverdagslivets_politikk', ['erving_goffman', 'pierre_bourdieu', 'james_c_scott']],
  em_pol_inkludering_ekskludering: ['samfunnets_grenser', ['hannah_arendt', 'pierre_bourdieu', 'robert_dahl']],
  em_pol_integrering_migrasjon: ['migrasjon', ['hannah_arendt', 'pierre_bourdieu', 'stein_rokkan']],
  em_pol_kjonn_familie_likestilling: ['kjonn_og_samfunn', ['judith_butler', 'pierre_bourdieu', 'john_rawls']],
  em_pol_majoritet_minoritet: ['minoritet_majoritet', ['robert_dahl', 'anne_phillips', 'arend_lijphart']],
  em_pol_normer_doxa: ['tause_regler', ['pierre_bourdieu', 'erving_goffman', 'antonio_gramsci']],
  em_pol_normer_normalitet: ['normalitet', ['michel_foucault', 'emile_durkheim', 'pierre_bourdieu']],
  em_pol_sosial_kontroll: ['sosial_kontroll', ['michel_foucault', 'emile_durkheim', 'erving_goffman']]
};

const methodProfiles = {
  met_pol_velferdsstatlig_analyse: ['rettighets- og tjenestearkitektur', 'familie- og omsorgskategori', 'universalisme, behovsprøving og faktisk tilgang'],
  met_pol_rettighetsanalyse: ['rettighetshaver og pliktsubjekt', 'vilkår, unntak og klage', 'formell rett og faktisk gjennomføring'],
  met_pol_forvaltningsanalyse: ['saksbehandlingsregel', 'skjønn og kategorisering', 'begrunnelse, likebehandling og klage'],
  met_pol_praksisanalyse: ['gjentakende rutine', 'læring, korreksjon og tilpasning', 'praktisk virkning for adgang og verdighet'],
  met_pol_dokumentanalyse: ['definisjoner og kategorier', 'målgruppe og problemframstilling', 'forholdet mellom dokumentert regel og praksis'],
  met_pol_rettslig_analyse: ['rettsgrunnlag og fortolkning', 'sammenligningsgrunnlag', 'regel, skjønn og rettsvirkning'],
  met_pol_normanalyse: ['forventning og normalitetsstandard', 'håndheving og sanksjon', 'avvikskategori og konsekvens'],
  met_pol_diskursanalyse: ['problemramme og begrepsbruk', 'subjekt- og gruppekategori', 'normalisering og utelukkede alternativer'],
  met_pol_minoritet_og_representasjonsanalyse: ['majoritetsdimensjon', 'vern og representasjonskanal', 'tilstedeværelse, talerett og innflytelse'],
  met_pol_makt_og_ulikhetsanalyse: ['ressurs- og statusforskjell', 'institusjonell omsetting', 'ulik virkning og kumulativ fordel'],
  met_pol_integreringsanalyse: ['populasjon og status', 'indikator for deltakelse', 'barriere, ressurs og assimilasjonspress'],
  met_pol_statistikk_og_fordelingsanalyse: ['populasjon og nevner', 'indikator og sammenligningsgruppe', 'fordeling, usikkerhet og gruppevariasjon'],
  met_pol_likestillingsanalyse: ['sammenligningsgrunnlag', 'direkte eller indirekte forskjellsvirkning', 'tilrettelegging, representasjon og ressursfordeling'],
  met_pol_fordelingsanalyse: ['fordeling av adgang, byrde og gevinst', 'berørte grupper', 'lik regel og ulik virkning'],
  met_pol_ideologianalyse: ['normalitets- og familieideal', 'verdihierarki og problemdefinisjon', 'kobling til institusjonell løsning'],
  met_pol_kontroll_og_sanksjonsanalyse: ['kontrollør, mål og norm', 'overvåking, avhengighet og sanksjon', 'protest, klage og utgangsmulighet']
};

const fagkart = read(files.fagkart);
const emner = read(files.emner);
const methods = read(files.methods);
const mapping = read(files.mapping);
const pensum = read(files.pensum);
const generator = read(files.generator);
const domain = requireValue(fagkart.categories.find((item) => item.id === DOMAIN_ID), `Mangler fagkartdomene ${DOMAIN_ID}`);
Object.assign(domain, {
  tagline: 'Hvordan regler, kategorier og hverdagspraksiser fordeler normalitet, tilhørighet, omsorg, adgang og likeverd.',
  definition: 'Domenet analyserer hvordan normer og identitetskategorier blir politiske når de bygges inn i lover, tjenester, institusjonelle rutiner, familier, offentlige rom og uformelle sanksjoner. Det undersøker både formelle rettigheter og den faktiske hverdagsvirkningen.',
  focus: ['normalitet og standardisering', 'hverdagsregler og praksis', 'majoritet, minoritet og representasjon', 'kjønn, familie og omsorg', 'migrasjon, medlemskap og samfunnsgrenser', 'likeverd, sosial kontroll og tause regler'],
  quality_revision: REVISION,
  generator_profile_id: DOMAIN_ID
});

for (const [hookId, spec] of Object.entries(hookSpecs)) {
  const hook = requireValue(domain.topic_hooks.find((item) => item.id === hookId), `Mangler hook ${hookId}`);
  hook.canon = hook.canon || {};
  hook.canon.thinkers = spec.lenses.map(([id, concept]) => ({ id, name: thinkerNames[id], role: concept, tier: 'core' }));
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
    question_surface_mode: 'norm-case-rule-practice-consequence-distinction-theory',
    preferred_question_moves: spec.moves,
    comparison_pairs: [[spec.lenses[0][0], spec.lenses[1][0]], [spec.lenses[1][0], spec.lenses[2][0]]],
    norwegian_thinker_ids: spec.lenses.map(([id]) => id).filter((id) => id === 'stein_rokkan'),
    underused_thinker_ids: spec.lenses.map(([id]) => id),
    rotation_note: `Roter dokumenterbare norm-, rettighets-, praksis- og tilgangscase for ${spec.title}. Teori brukes først etter at regel eller forventning, håndheving og konkret virkning er identifisert.`,
    quality_revision: REVISION
  });
  hook.avoid_surface_forms = unique([...(hook.avoid_surface_forms || []).slice(0, 4), ...spec.anti, 'Ikke bruk teoretikernavn som svar uten begrep og mekanisme.', 'Ikke bruk gruppeidentitet som forklaring uten dokumentert regel, praksis eller populasjonsdata.', 'Ikke bruk canonical-filen som faktakilde.']);
  hook.generator_constraints = {
    ...(hook.generator_constraints || {}),
    min_case_count: 2,
    min_method_count: 1,
    require_institution_law_conflict_or_social_process_anchor: true,
    require_external_claim_basis: true,
    do_not_generate_from_hook_label_only: true,
    require_case_specific_question: true,
    require_norm_rule_or_category_identification: true,
    require_actor_or_institution_identification: true,
    require_practice_or_enforcement_mechanism: true,
    require_observable_consequence: true,
    require_critical_distinction: true,
    require_method_match_to_mechanism: true,
    require_population_and_denominator_for_group_claims: true,
    ban_identity_essence_questions: true,
    ban_theorist_name_as_answer_without_concept: true
  };
}

for (const [emneId, [hookId, thinkers]] of Object.entries(emneSpecs)) {
  const emne = requireValue(emner.find((item) => item.emne_id === emneId), `Mangler emne ${emneId}`);
  const spec = hookSpecs[hookId];
  const definition = emneId === 'em_pol_familie_stat_omsorg' ? 'Studiet av hvordan omsorg, foreldreansvar, samliv, barnets beste, ytelser og offentlige tjenester fordeler rettigheter, plikter og skjønn mellom familie og stat.'
    : emneId === 'em_pol_hverdagslivets_regler' ? 'Studiet av hvordan formelle og uformelle rutiner organiserer tid, kropp, språk, opptreden og adgang i dagliglivets institusjoner og offentlige rom.'
    : emneId === 'em_pol_inkludering_ekskludering' ? 'Studiet av regler, kriterier, praksiser og fysiske eller symbolske grenser som avgjør hvem som får adgang, medlemskap, synlighet og mulighet til å gjøre krav gjeldende.'
    : emneId === 'em_pol_integrering_migrasjon' ? 'Studiet av hvordan oppholdsstatus, statsborgerskap, arbeid, språk, bolig, skole og tjenester former deltakelse og tilhørighet for migranter og deres etterkommere.'
    : emneId === 'em_pol_kjonn_familie_likestilling' ? 'Studiet av hvordan kjønn, familieformer, omsorgsarbeid, arbeidsdeling, representasjon og likestillingsregler påvirker muligheter og byrder.'
    : emneId === 'em_pol_majoritet_minoritet' ? 'Studiet av hvordan antall, sosial dominans, rettighetsvern og representasjon former majoriteters og minoriteters politiske handlingsrom.'
    : emneId === 'em_pol_normer_doxa' ? 'Studiet av forventninger og klassifikasjoner som framstår som selvfølgelige, men som organiserer legitimitet, adgang og handlingsrom.'
    : emneId === 'em_pol_normer_normalitet' ? 'Studiet av hvordan standarder, kategorier og forventninger definerer vanlig, ønskelig og avvikende handling eller livsførsel.'
    : 'Studiet av hvordan formelle og uformelle normer håndheves gjennom overvåking, belønning, skam, rykter, avhengighet og sanksjoner.';
  const why = emneId === 'em_pol_integrering_migrasjon' ? 'Tvinger fram presise mål på integrering og hindrer at gruppebakgrunn brukes som forklaring uten mekanisme.'
    : emneId === 'em_pol_normer_normalitet' ? 'Skiller statistisk vanlig fra normativt ønskelig og viser hvordan normalitet får institusjonelle konsekvenser.'
    : `Gjør ${hookId.replaceAll('_', ' ')} analyserbart gjennom dokumentert regel, praksis og konsekvens.`;
  const concepts = unique(spec.mechanisms.slice(0, 4).concat(spec.distinctions.slice(0, 2)));
  const questions = [spec.core_problem, `Hvilken ekstern kilde dokumenterer regelen, praksisen eller populasjonen?`, `Hvilken observerbar konsekvens kan skilles fra antakelser om identitet eller motiv?`];
  emne.domain_profiles = emne.domain_profiles || {};
  emne.domain_profiles[DOMAIN_ID] = {
    quality_revision: REVISION,
    definition,
    why_it_matters: why,
    core_concepts: concepts,
    key_questions: questions,
    conflicts: spec.distinctions.slice(0, 3),
    analysis_axes: spec.distinctions,
    canonical_thinker_ids: thinkers,
    canonical_thinkers: thinkers.map((id) => thinkerNames[id]),
    mechanisms: spec.mechanisms,
    distinguish_from: spec.distinctions,
    misconceptions: spec.anti,
    recommended_method_ids: spec.methods,
    theory_progression: ['dokumentert case og kilde', 'regel, kategori eller forventning', 'praksis, håndheving eller tilpasning', 'observerbar konsekvens', 'kritisk distinksjon', 'målrettet teoribegrep'],
    generator_constraints: {
      require_external_claim_basis: true,
      require_norm_rule_or_category_identification: true,
      require_actor_or_institution_identification: true,
      require_practice_or_enforcement_mechanism: true,
      require_observable_consequence: true,
      require_critical_distinction: true,
      require_population_and_denominator_for_group_claims: true,
      ban_identity_essence_questions: true,
      ban_theorist_name_as_answer_without_concept: true
    }
  };
  if (!emne.quality_revision) {
    Object.assign(emne, {
      definition,
      why_it_matters: why,
      core_concepts: concepts,
      key_questions: questions,
      conflicts: spec.distinctions.slice(0, 3),
      analysis_axes: spec.distinctions,
      canonical_thinker_ids: thinkers,
      canonical_thinkers: thinkers.map((id) => thinkerNames[id]),
      recommended_method_ids: spec.methods,
      mechanisms: spec.mechanisms,
      distinguish_from: spec.distinctions,
      misconceptions: spec.anti,
      quality_revision: REVISION
    });
  }
}

const methodIds = new Set(methods.methods.map((method) => method.method_id));
for (const [methodId, focus] of Object.entries(methodProfiles)) {
  const method = requireValue(methods.methods.find((item) => item.method_id === methodId), `Mangler metode ${methodId}`);
  method.domain_profiles = method.domain_profiles || {};
  method.domain_profiles[DOMAIN_ID] = {
    quality_revision: REVISION,
    mechanism_focus: focus,
    critical_distinctions: ['formell regel vs faktisk praksis', 'lik behandling vs likeverdig virkning', 'kategori eller korrelasjon vs dokumentert mekanisme'],
    source_requirements: ['identifiserbar regel, kategori eller forventning', 'ekstern dokumentasjon av praksis, populasjon eller avgjørelse', 'kilde som kan bære påstanden om konsekvens eller fordeling'],
    case_anchor_types: ['law_or_official_rule', 'institutional_practice', 'statistics_or_population', 'decision_complaint_or_service_case'],
    question_use: ['etabler faktagrunnlag', 'identifiser regel og håndheving', 'forklar konsekvens', 'test distinksjon', 'bruk teori bare som presist forklaringsledd'],
    anti_patterns: ['gruppeessens som forklaring', 'teoretikernavn uten begrep', 'anekdote som populasjonspåstand', 'formell regel som bevis for faktisk praksis']
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
      norm_rule_or_category_required: true,
      actor_or_institution_required: true,
      mechanism_options: spec.mechanisms,
      observable_consequence_required: true,
      critical_distinction_options: spec.distinctions,
      theory_lenses: spec.lenses.map(([thinker_id, concept]) => ({ thinker_id, concept })),
      case_anchors: spec.cases,
      recommended_method_ids: spec.methods,
      question_chain: ['external_norm_rights_practice_or_population_source', 'claim_basis', 'rule_category_or_expectation', 'actor_institution_and_enforcement', 'observable_consequence', 'critical_distinction', 'optional_theory_lens'],
      source_rule: 'Konkrete påstander må bygge på ekstern dokumentasjon av lov, avgjørelse, tjeneste, praksis, klage, populasjon eller sosial prosess. Gruppepåstander krever definert populasjon, nevner og indikator. Canonical-filene styrer analysen, men er ikke faktakilder.'
    });
    map.generator_constraints = {
      ...(map.generator_constraints || {}),
      require_external_claim_basis: true,
      require_case_specific_question: true,
      require_norm_rule_or_category_identification: true,
      require_actor_or_institution_identification: true,
      require_practice_or_enforcement_mechanism: true,
      require_observable_consequence: true,
      require_critical_distinction: true,
      require_method_match_to_mechanism: true,
      require_population_and_denominator_for_group_claims: true,
      ban_identity_essence_questions: true,
      ban_theorist_name_as_answer_without_concept: true,
      do_not_generate_from_hook_or_emne_label_only: true
    };
    for (const methodId of map.recommended_method_ids) requireValue(methodIds.has(methodId), `Mapping ${map.topic_hook} peker til ukjent metode ${methodId}`);
  }
}
requireValue(mappingCount === 20, `Forventet 20 normmappinger, fikk ${mappingCount}`);

const pensumDomain = requireValue(pensum.domains.find((item) => item.domain_id === DOMAIN_ID), `Mangler pensumdomene ${DOMAIN_ID}`);
Object.assign(pensumDomain, {
  tagline: domain.tagline,
  definition: domain.definition,
  question_role: 'Start i en dokumentert lov, regel, tjeneste, praksis, klage, populasjon eller sosial situasjon. Identifiser kategori eller forventning, aktør og håndheving, forklar observerbar konsekvens, test en kritisk distinksjon og bruk teori bare når den presiserer mekanismen.',
  status: 'complete_revised',
  method_count: Object.keys(methodProfiles).length,
  quality_revision: REVISION,
  generator_profile: DOMAIN_ID,
  revised_method_ids: Object.keys(methodProfiles),
  required_question_chain: ['external_norm_rights_practice_or_population_source', 'claim_basis', 'rule_category_or_expectation', 'actor_institution_and_enforcement', 'observable_consequence', 'critical_distinction', 'optional_theory_lens'],
  quality_rule: 'Norm- og identitetsspørsmål må dokumentere regel, praksis, populasjon eller avgjørelse og teste virkning. Identitet eller gruppetilhørighet er aldri forklaring alene. Canonical-filene definerer analyseformen, men er ikke faktakilder.',
  vertical_chain_status: {
    fagkart_hooks_revised: 10,
    emne_domain_profiles_revised: Object.keys(emneSpecs).length,
    direct_generic_emner_revised: Object.keys(emneSpecs).filter((id) => emner.find((e) => e.emne_id === id)?.quality_revision === REVISION).length,
    method_profiles_revised: Object.keys(methodProfiles).length,
    mappings_revised: mappingCount,
    generator_profile_active: true,
    question_blueprints_validated: 10
  }
});

generator.domain_quality_profiles = generator.domain_quality_profiles || {};
generator.domain_quality_profiles[DOMAIN_ID] = {
  status: 'complete_revised',
  quality_revision: REVISION,
  domain_id: DOMAIN_ID,
  question_surface_mode: 'norm-case-rule-practice-consequence-distinction-theory',
  required_chain: ['external_norm_rights_practice_or_population_source', 'claim_basis', 'rule_category_or_expectation', 'actor_institution_and_enforcement', 'observable_consequence', 'critical_distinction', 'optional_theory_lens'],
  source_anchor_required: true,
  external_claim_basis_required: true,
  norm_rule_or_category_required: true,
  observable_consequence_required: true,
  revised_hook_ids: Object.keys(hookSpecs),
  revised_emne_ids: Object.keys(emneSpecs),
  revised_method_ids: Object.keys(methodProfiles),
  global_bans: ['identitet eller gruppe som essensiell forklaring', 'teoretikernavn som løsrevet fasit', 'anekdote som populasjonspåstand', 'formell regel som bevis for faktisk praksis', 'påstand hentet bare fra emne- eller hooknavn'],
  generator_constraints: {
    require_external_claim_basis: true,
    require_norm_rule_or_category_identification: true,
    require_actor_or_institution_identification: true,
    require_practice_or_enforcement_mechanism: true,
    require_observable_consequence: true,
    require_critical_distinction: true,
    require_method_match_to_mechanism: true,
    require_population_and_denominator_for_group_claims: true,
    ban_identity_essence_questions: true,
    ban_theorist_name_as_answer_without_concept: true
  }
};

const blueprintEmne = {
  normalitet: 'em_pol_normer_normalitet',
  minoritet_majoritet: 'em_pol_majoritet_minoritet',
  hverdagslivets_politikk: 'em_pol_hverdagslivets_regler',
  kjonn_og_samfunn: 'em_pol_kjonn_familie_likestilling',
  familie_og_stat: 'em_pol_familie_stat_omsorg',
  migrasjon: 'em_pol_integrering_migrasjon',
  sosial_kontroll: 'em_pol_sosial_kontroll',
  tause_regler: 'em_pol_normer_doxa',
  likeverd: 'em_pol_inkludering_ekskludering',
  samfunnets_grenser: 'em_pol_inkludering_ekskludering'
};
const blueprints = Object.entries(hookSpecs).map(([hookId, spec], index) => ({
  blueprint_id: `pol_normer_${String(index + 1).padStart(2, '0')}_${hookId}`,
  domain_id: DOMAIN_ID,
  topic_hook: hookId,
  emne_id: blueprintEmne[hookId],
  source_anchor: spec.anchors[0],
  claim_basis: `Dokumenter en konkret ${spec.anchors[0]}-kilde som viser regelen, kategorien, praksisen eller populasjonen og en observerbar konsekvens.`,
  method_id: spec.methods[0],
  rule_or_category: spec.mechanisms[0],
  enforcement_or_practice_mechanism: spec.mechanisms[1],
  observable_consequence: 'adgang, ressurs, rettighet, tid, representasjon, sanksjon eller dokumentert ulik virkning',
  critical_distinction: spec.distinctions[0],
  theory_lens: { thinker_id: spec.lenses[0][0], concept: spec.lenses[0][1] },
  question_plan: `Start i det dokumenterte caset, identifiser regel eller kategori og hvem som håndhever den, forklar ${spec.mechanisms[1]}, og test forskjellen mellom ${spec.distinctions[0]}.`,
  answer_rule: 'Riktig svar må forklare dokumentert praksis eller virkning. Identitet eller teoretikernavn alene er aldri gyldig fasit.'
}));

fs.mkdirSync(REPORT_BASE, { recursive: true });
write(files.fagkart, fagkart);
write(files.emner, emner);
write(files.methods, methods);
write(files.mapping, mapping);
write(files.pensum, pensum);
write(files.generator, generator);
fs.writeFileSync(path.join(REPORT_BASE, 'normer-identitet-question-blueprints.json'), `${JSON.stringify(blueprints, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_BASE, 'normer-identitet-vertical-chain.md'), `# Politikk: normer, identitet og hverdagsliv – vertikal kvalitetskjede\n\nDomenet er revidert direkte i de aktive kanoniske filene.\n\n- 10 topic hooks\n- 9 emneprofiler\n- 16 metodeprofiler\n- 20 mappinger\n- 10 spørsmålsplaner\n\nFast kjede: ekstern kilde → claim basis → regel eller kategori → aktør og håndheving → observerbar konsekvens → kritisk distinksjon → valgfritt teoribegrep.\n\nIdentitet eller gruppetilhørighet er aldri forklaring alene. Gruppepåstander krever definert populasjon, nevner og indikator.\n`);
console.log(`Oppdaterte ${Object.keys(hookSpecs).length} hooks, ${Object.keys(emneSpecs).length} emneprofiler, ${Object.keys(methodProfiles).length} metodeprofiler og ${mappingCount} mappinger.`);
