import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith('\n') ? value : `${value}\n`);
};
const must = (condition, message) => { if (!condition) throw new Error(`PRECHECK: ${message}`); };

const CATEGORY = 'kunst';
const ROLE = 'kunst_publikum_og_formidling';
const KEY = `${CATEGORY}/${ROLE}`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MANIFEST = 'data/Civication/roleModels/manifest.json';
const BADGE = 'data/badges/kunst.json';
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const SOURCE = 'reports/CIVICATION_KUNST_PUBLIKUM_OG_FORMIDLING_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'publikumsmote_formidling_tilgjengelighet_hendelses_og_eskaleringslogg';
const LOOPS = [
  'forbered -> motta -> avklare behov -> formidle -> observer -> dokumenter',
  'hendelse -> sikre situasjon -> eskaler -> informer -> dokumenter -> lær'
];
const AUTHORITY = {
  may: ['formidle godkjent fagstoff','veilede publikum','håndtere ordinære publikumsbehov'],
  may_not: ['endre proveniens eller katalogdata','love utlån eller salg uten fullmakt','omdefinere institusjonens faglige standpunkt','ignorere sikkerhets- eller bevaringsrutiner']
};
const POLICY = {
  'Vertskap (museum/galleri)': {policy:'direct',qualification_ids:[]},
  'Gallerimedarbeider': {policy:'direct',qualification_ids:[]},
  'Formidler': {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};

for (const rel of [MODEL,GRAMMAR,MANIFEST,BADGE]) must(fs.existsSync(path.join(root, rel)), `${rel} missing`);
must(!fs.existsSync(path.join(root, PLAN)), `${PLAN} already exists`);
must(!fs.existsSync(path.join(root, WORLD)), 'Role World must remain unmaterialized in prerequisite phase');
for (const type of TYPES) must(!fs.existsSync(path.join(root, `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`)), `mail catalog ${type} already exists`);

const originalModel = read(MODEL);
const originalGrammar = read(GRAMMAR);
const badge = read(BADGE);
const manifest = read(MANIFEST);
must(originalModel.schema === 'civication_role_model_v2' && originalModel.role_scope === ROLE, 'role model identity drifted');
must(originalGrammar.schema === 'civication_work_grammar_v2' && originalGrammar.role_scope === ROLE, 'work grammar identity drifted');
must(JSON.stringify(originalGrammar.work_loops) === JSON.stringify(LOOPS), 'work loops drifted');
must(JSON.stringify(originalGrammar.authority_boundary) === JSON.stringify(AUTHORITY), 'authority boundary drifted');
const byLabel = Object.fromEntries((badge.tiers || []).map((entry) => [entry.label, entry]));
for (const title of ['Vertskap (museum/galleri)','Gallerimedarbeider','Formidler']) must(byLabel[title]?.career_offer?.role_scope === ROLE, `${title} badge binding drifted`);
must(byLabel['Vertskap (museum/galleri)'].career_offer.policy === 'direct', 'Vertskap must remain direct');
must(byLabel.Gallerimedarbeider.career_offer.policy === 'direct', 'Gallerimedarbeider must remain direct');
must(byLabel.Formidler.career_offer.policy === 'qualification_required', 'Formidler must remain qualification_required');
must(JSON.stringify(byLabel.Formidler.career_offer.qualification_ids) === JSON.stringify(['relevant_education_or_employer_qualification']), 'Formidler qualification gate drifted');

const places = [
  {id:'publikumsinngang_og_vertskapspunkt',name:'Publikumsinngang og vertskapspunkt',description:'Her starter publikumsmøtet med mottak, orientering, kø- og kapasitetsavklaring, praktiske behov, trygghetsinformasjon og tydelig skille mellom vanlig service og spørsmål som må eskaleres.'},
  {id:'omvisning_og_formidlingsflate',name:'Omvisning og formidlingsflate',description:'Her forberedes og gjennomføres verk- og utstillingsformidling med eksplisitt skille mellom katalogdata, godkjent fagstoff, begrunnede tolkninger, åpne spørsmål og publikums egne perspektiver.'},
  {id:'tilgjengelighet_og_gruppetilpasningsbord',name:'Tilgjengelighet og gruppetilpasningsbord',description:'Her planlegges språk, tempo, sensoriske hensyn, alternative formater, pauser, gruppestørrelse og ledsagerbehov slik at tilgjengelighet blir en kvalitetsdimensjon uten å redusere faglig presisjon.'},
  {id:'galleridrift_hendelse_og_eskaleringspunkt',name:'Galleridrift, hendelse og eskaleringspunkt',description:'Her dokumenteres berøring av verk, utrygge situasjoner, kapasitetsavvik, uavklarte fagspørsmål og andre hendelser med sikring, riktig eskalering, informasjon, etterkontroll og læring.'}
];
const actors = [
  {
    id:'sara_senior_formidler_kunst_publikum_og_formidling',name:'Sara',role:'senior formidler',place:places[1].id,
    function:'Sara gjør faglig presisjon og åpent fortolkningsrom konkret i omvisninger. Hun kan hjelpe spilleren med å skille dokumenterte verkdata, institusjonens godkjente fagstoff, faglig begrunnede tolkninger og reelle åpne spørsmål, særlig når publikum utfordrer en påstand eller når en sterk fortelling frister til å bli presentert som endelig fasit.',
    authority:'Sara kan kvalitetssikre formidlingsopplegg, korrigere ubegrunnede påstander og ta over vanskelige faglige spørsmål innen sitt mandat, men kan ikke endre proveniens eller katalogdata uformelt, love utlån eller salg eller gjøre egen tolkning til institusjonens nye standpunkt. Spilleren må eskalere dokumentasjons- og fagmyndighetsspørsmål i stedet for å improvisere autoritet.'
  },
  {
    id:'jon_publikumsvert_kunst_publikum_og_formidling',name:'Jon',role:'publikumsvert',place:places[0].id,
    function:'Jon bærer den praktiske frontlinjen der kø, orientering, spørsmål, uenighet, barn, grupper og samtidige behov møtes. Han viser hvordan service og trygghet må holdes sammen i sanntid, og hvordan rolig grensesetting kan bevare et godt publikumsmøte uten at vertskap blir ansvarlig for faglige eller sikkerhetsmessige beslutninger utenfor rollen.',
    authority:'Jon kan håndtere ordinære publikumsbehov, forklare regler, fordele flyt og varsle avvik, men kan ikke love unntak fra sikkerhets- eller bevaringsrutiner, endre institusjonens faglige standpunkt eller gjøre et salg-, utlåns- eller proveniensspørsmål til et servicespørsmål. Han kan eskalere og dokumentere, ikke late som alle problemer kan løses i front.'
  },
  {
    id:'amal_tilgjengelighetskoordinator_kunst_publikum_og_formidling',name:'Amal',role:'tilgjengelighetskoordinator',place:places[2].id,
    function:'Amal gjør tilgjengelighet til konkret formidlingskvalitet gjennom språk, tempo, alternative sanse- og presentasjonsformer, pauser, gruppestørrelse og forberedelse. Hun utfordrer løsninger som er faglig korrekte på papiret, men utilgjengelige i praksis, og hjelper spilleren å dokumentere hva som faktisk fungerte for ulike grupper.',
    authority:'Amal kan anbefale og koordinere tilgjengelige formater og be om endringer i publikumsopplegget, men kan ikke omskrive verksmetadata, overstyre bevarings- eller sikkerhetsrutiner uten faglig grunnlag eller erklære én gruppes behov som universell løsning. Tilpasning må skje innen riktig fag- og sikkerhetsramme og dokumenteres som konkret publikumserfaring.'
  },
  {
    id:'erik_galleridrift_sikkerhet_kunst_publikum_og_formidling',name:'Erik',role:'galleridrift- og sikkerhetsansvarlig',place:places[3].id,
    function:'Erik gjør hendelsesløkken spillbar når publikum berører verk, kapasitet blir utrygg, en installasjon oppfører seg uventet eller andre avvik krever rask sikring. Han skiller umiddelbar situasjonssikring fra senere faglig vurdering og gjør det tydelig hvilke fakta, tiltak, varsler og kontrollpunkter som må stå igjen i loggen.',
    authority:'Erik kan aktivere avtalte sikkerhetsrutiner, stoppe en utrygg publikumssituasjon og eskalere til riktig fag- eller driftsansvar, men kan ikke endre proveniens, godkjenne konserveringsinngrep eller bruke sikkerhetsrollen til å omdefinere institusjonens faglige standpunkt. Formidleren kan heller ikke ignorere hans dokumenterte sikkerhets- eller bevaringsgrenser for å redde flyt eller service.'
  }
];

const model = {
  ...originalModel,
  core_narrative:[
    originalModel.core_narrative[0],
    'Rollen gjør publikumsmøtet spillbart gjennom et versjonert formidlings- og hendelsesspor der behov, verk-/utstillingsgrunnlag, tilgjengelighet, faglig usikkerhet, publikumsrespons, sikkerhet, eskalering, dokumentasjon og læring kan følges uten at god service eller personlig overbevisning blir ubegrenset fagmyndighet.'
  ],
  work_life:{
    daily_work:[
      'Åpner publikumsmøteloggen med målgruppe, verk-/utstillingsgrunnlag, tilgjengelighetsbehov, risikopunkter og hvem som eier faglige eller sikkerhetsmessige avklaringer.',
      'Mottar og veileder publikum, avklarer behov og gjennomfører formidling med tydelig skille mellom dokumentert fakta, tolkning og åpne spørsmål.',
      'Tilpasser språk, tempo og format uten å redusere faglig presisjon eller omgå bevarings- og sikkerhetsrutiner.',
      'Dokumenterer hendelser, uavklarte spørsmål, eskalering, publikumsrespons og hva som må endres før neste gruppe eller vakt.'
    ],
    responsibilities:[...originalModel.work_life.responsibilities],
    work_environment:['Museum, kunsthall, galleri og visningssted der mottak, omvisning, tilgjengelighet, publikumsflyt og hendelser håndteres i samme arbeidsdag.'],
    status_position:[
      'Vertskap og gallerimedarbeider kan gå direkte inn i rollen etter den canonicale Career-porten; Formidler krever relevant_education_or_employer_qualification. Ingen Kunst-Badge, History Go-kunnskap, popularitet eller god publikumsrespons kan fjerne Formidler-kvalifikasjonskravet eller gi myndighet til å endre proveniens, katalogdata eller sikkerhetsrutiner.'
    ],
    workplaces:places.map((entry) => entry.id)
  },
  career_path:{
    entry_from:[
      'Vertskap (museum/galleri) og Gallerimedarbeider er direkte Career-entry etter canonical badge-policy.',
      'Formidler krever relevant_education_or_employer_qualification og kan ikke låses opp bare gjennom erfaring, standing, History Go eller Kunst-Badge.'
    ],
    progression_to:['Mer selvstendig formidlings-, publikumsutviklings- eller koordineringsansvar når institusjonen faktisk tildeler ansvar og nødvendig kompetanse er dokumentert.'],
    possible_promotions:['Senior formidler eller faglig koordinator med dokumentert større metode- og kvalitetssikringsansvar.','Publikums- eller formidlingsleder der arbeidsgiver uttrykkelig tildeler personal-, budsjett- eller programansvar.'],
    possible_exits:['Overgang til kuratering, undervisning, kommunikasjon eller publikumsutvikling når ny rolle og nødvendige kvalifikasjoner er oppfylt.','Tilbake til vertskap/galleridrift med mindre faglig ansvar uten at tidligere Formidler-status gir skjult myndighet.'],
    career_risks:['Sterk scene- eller publikumsmestring kan gjøre det fristende å improvisere over ukjent proveniens eller institusjonelt standpunkt.','Servicepress og høyt besøk kan normalisere snarveier rundt sikkerhet, tilgjengelighet eller dokumentasjon.']
  },
  required_knowledge:{
    education_basis:['Praktisk vertskaps- og gallerikunnskap for direkte entry; relevant utdanning eller dokumentert arbeidsgiverkvalifikasjon for Formidler.'],
    skills:['publikumskommunikasjon','kunstformidling','verk- og utstillingsforståelse','åpen fortolkning','tilgjengelighet','gruppedynamikk','publikumssikkerhet','hendelsesdokumentasjon','faglig eskalering'],
    category_knowledge:['Kunsthistoriske og institusjonelle kilder, verks- og utstillingskontekst, hvordan tolkning skilles fra katalogdata, og hvordan tilgjengelighet og publikumsmøte påvirker hva som faktisk kan formidles presist.'],
    history_go_badges:['kunst'],
    place_connections:places.map((entry) => entry.id),
    people_connections:actors.map((entry) => entry.id)
  },
  authority_boundary:AUTHORITY,
  challenges:[
    {id:'presisjon_vs_apen_tolkning',title:'Presisjon uten fasitretorikk',description:'Et engasjerende publikumsmøte må kunne være tydelig på dokumenterte data og samtidig vise hvilke spørsmål og tolkninger som er åpne.',pressure:'åpen_fortolkning_vs_faglig_presisjon',affects:['quality','trust','status']},
    {id:'service_vs_sikkerhet',title:'God service uten sikkerhetssnarvei',description:'Høy trafikk eller krevende gjester kan ikke gjøre berøring, kapasitet eller andre sikkerhetsgrenser forhandlingsbare.',pressure:'service_vs_sikkerhet',affects:['quality','trust','risk']}
  ],
  dilemmas:[
    {id:'full_gruppe_ukjent_sporsmal',title:'Ukjent spørsmål foran full gruppe',setup:'En gjest stiller et detaljert proveniensspørsmål midt i en full omvisning, og et raskt svar vil holde flyten bedre enn en synlig eskalering.',choice_axis:'troverdig_usikkerhet_vs_improvisert_autoritet',consequence_axis:'kortsiktig_flyt_vs_langsiktig_faglig_tillit',mail_hooks:TYPES}
  ],
  related_people:actors.map((entry) => ({id:entry.id,name:entry.name,role:entry.role,fictional:true,fictional_scenario_actor:true,canonical_person_ref:null,function:entry.function,authority_relation:entry.authority,workplace_ids:[entry.place]})),
  related_places:places.map((entry) => ({id:entry.id,name:entry.name,function:entry.description})),
  mail_integration:{role_scope:ROLE,mail_profile:ROLE,can_feed_mail_types:TYPES,recommended_mail_families:TYPES.map((type) => `publikum_formidling_${type}`),role_model_refs_supported:true}
};

const grammar = {
  ...originalGrammar,
  actor_grammar:actors.map((entry) => ({id:entry.id,name:entry.name,role:entry.role,workplace_ids:[entry.place]})),
  place_grammar:places.map((entry) => ({id:entry.id,name:entry.name,function:entry.description})),
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Et vedvarende, versjonert publikumsspor som holder målgruppe og behov, verk-/utstillingsgrunnlag, godkjent fagstoff, tolkning og usikkerhet, tilgjengelighet, publikumsrespons, kapasitet, sikkerhet, hendelser, eskalering, informasjon, dokumentasjon og læring i samme arbeidsobjekt.',
    states:['forberedt','klar_for_mottak','publikum_mottatt','behov_avklart','under_formidling','venter_pa_faglig_avklaring','venter_pa_tilgjengelighetstilpasning','venter_pa_sikkerhet_eller_bevaring','hendelse_registrert','sikret_og_eskalert','informert','dokumentert','evaluert','gjenapnet_for_rework'],
    handoff_rule:'Neste eier overtar eksplisitt versjon, gruppe-/publikumsbehov, hvilke verkdata og fagkilder som er godkjent, hva som fortsatt er tolkning eller uavklart, tilgjengelighetsbehov, eventuell hendelse, sikkerhets-/bevaringsgrense, hva som er kommunisert og hvilket kontrollpunkt som gjenstår; handoff kan ikke slette tidligere usikkerhet eller avvik.'
  },
  rhythm_contract:{
    loop:'forberedelse -> mottak -> behovsavklaring -> waiting/venting på faglig, tilgjengelighets- eller sikkerhetsavklaring -> formidling/vertskap -> observasjon -> handoff eller eskalering -> dokumentasjon -> læring -> rework',
    waiting_states:['faglig_kilde_eller_proveniensavklaring','tilgjengelighetsavklaring','sikkerhets_eller_bevaringsavklaring','kapasitets_og_gruppeflyt','ansvarlig_fagperson','hendelsesetterkontroll'],
    rework_rule:'Nytt faglig grunnlag, endret gruppebehov, tilgjengelighetsfunn, publikumsrespons eller sikkerhets-/bevaringshendelse gjenåpner bare berørte deler av publikumsmøteloggen med ny versjon og ny eier; tidligere kommunisert informasjon og registrerte avvik blir stående.'
  },
  knowledge_dependencies:[
    {id:'history_go_kunst_verk_utstilling_og_institusjon',badge_id:'kunst',use:'Gir kunsthistorisk, verk-, utstillings- og institusjonskontekst som kan forbedre spørsmål og formidling, men kan ikke gi Formidler-kvalifikasjon, endre proveniens eller katalogdata, autorisere salg/utlån, omdefinere institusjonens faglige standpunkt eller overstyre sikkerhets- og bevaringsrutiner.'}
  ],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:POLICY,first_object:PERSISTENT,first_task:'Registrer én konkret publikumssituasjon med målgruppe, verk-/utstillingsgrunnlag, tilgjengelighetsbehov, faglig usikkerhet, sikkerhetsgrense, riktig eskaleringspunkt og neste eier før du starter formidling.'},
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
};

const familyByType = {
  job:'publikum_formidling_job',
  people:'publikum_formidling_profesjonelle_relations',
  conflict:'publikum_formidling_presisjon_service_og_grensekonflikt',
  story:'publikum_formidling_identitet_og_mote_med_kunst',
  event:'publikum_formidling_hendelse_og_endret_situasjon',
  micro:'publikum_formidling_rask_avklaring',
  followup:'publikum_formidling_etterkontroll_og_laring',
  knowledge:'publikum_formidling_history_go_kunstkontekst',
  consequence:'publikum_formidling_beslutning_og_etterspill'
};
const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const plan = {
  schema:'civication_mail_plan_v1',version:1,id:'kunst_publikum_og_formidling_foundation_v1',category:CATEGORY,role_scope:ROLE,title:'Publikum og formidling',
  description:'Seksten steg fra første publikumsmottak til etterprøvbar læring fra samme formidlings-, tilgjengelighets- og hendelsesspor.',
  arc:{from:'Ny publikumsarbeider som må skille service, formidling, tilgjengelighet, faglig usikkerhet og sikkerhet i sanntid.',to:'En trygg publikumsarbeider som kan holde åpen fortolkning, presis kunnskap, tilgjengelighet og riktig eskalering sammen uten å late som egen rolle har større fagmyndighet enn den faktisk har.',core_questions:['Hva vet vi dokumentert, og hva er tolkning eller åpent spørsmål?','Hva trenger denne gruppen for å delta trygt og meningsfullt?','Når skal jeg stoppe, sikre eller eskalere i stedet for å improvisere?']},
  outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','publikum_formidling_grensesvikt']}},
  sequence:sequenceTypes.map((type,index) => ({step:index+1,type,phase:index<3?'intro':index<10?'advanced':'mastery',step_goal:`Før publikumsmøteloggen gjennom ${type} med synlig behov, faglig grunnlag, tilgjengelighet, sikkerhetsgrense, ventepunkt, eskalering og neste eier.`,allowed_families:[familyByType[type]],fallback_types:[]}))
};

const mailSpecs = {
  job:[
    ['ukjent_proveniens_001','Sara','sara_senior_formidler_kunst_publikum_og_formidling',places[1].id,'Gruppen spør om proveniens du ikke kan dokumentere','En gjest stiller et detaljert proveniensspørsmål midt i omvisningen, og publikum forventer et raskt svar selv om underlaget bare dokumenterer deler av historikken.'],
    ['tilgjengelig_gruppe_002','Amal','amal_tilgjengelighetskoordinator_kunst_publikum_og_formidling',places[2].id,'Gruppen trenger en annen formidlingsform enn planlagt','En forhåndsbooket gruppe har konkrete språk-, tempo- og sensoriske behov som gjør standardopplegget lite tilgjengelig uten at det faglige må forenkles bort.'],
    ['publikumstopp_003','Jon','jon_publikumsvert_kunst_publikum_og_formidling',places[0].id,'Tre grupper ankommer samtidig og kapasiteten presses','Publikumsinngangen fylles raskt, flere grupper vil starte samtidig, og presset på service, ro, verkavstand og tydelig informasjon øker.'],
    ['beroring_verk_004','Erik','erik_galleridrift_sikkerhet_kunst_publikum_og_formidling',places[3].id,'En besøkende berører et verk til tross for reglene','En gjest berører et verk under en travel periode, og hendelsen må både stoppes rolig, sikres, eskaleres og dokumenteres uten å spekulere i skadeomfang.']
  ],
  people:[
    ['seniorformidler_001','Sara','sara_senior_formidler_kunst_publikum_og_formidling',places[1].id,'Senior formidler ber deg markere tolkning tydeligere','Sara har hørt en formulering i omvisningen som gjør en omstridt faglig tolkning mer sikker enn kildene tillater, og vil at skillet mellom data, tolkning og åpent spørsmål skal bli synlig.'],
    ['publikumsvert_002','Jon','jon_publikumsvert_kunst_publikum_og_formidling',places[0].id,'Publikumsverten ber om et tydeligere handoff ved kø og konflikt','Jon opplever at vanskelige gjestespørsmål og kapasitetsproblemer ofte blir stående hos vertskapet uten klart punkt for når formidler, drift eller sikkerhet skal overta.'],
    ['tilgjengelighet_003','Amal','amal_tilgjengelighetskoordinator_kunst_publikum_og_formidling',places[2].id,'Tilgjengelighetskoordinatoren vil dokumentere hva som faktisk fungerte','Amal mener tilpasninger må evalueres mot konkrete gruppers erfaringer, ikke bare mot at institusjonen har tilbudt et alternativt format.'],
    ['sikkerhet_004','Erik','erik_galleridrift_sikkerhet_kunst_publikum_og_formidling',places[3].id,'Sikkerhetsansvarlig krever at et avvik ikke normaliseres','Erik har sett gjentatte små overskridelser av verkavstand i en populær sal og vil at formidling og vertskap skal endres før en hendelse blir alvorlig.']
  ],
  conflict:[['fasit_vs_apenhet_001','Sara','sara_senior_formidler_kunst_publikum_og_formidling',places[1].id,'En engasjerende fortelling kolliderer med kildegrensen','Et populært omvisningsgrep får sterke publikumsreaksjoner, men gjør en tolkning til tilsynelatende institusjonell fasit og skaper konflikt mellom dramaturgisk flyt og faglig redelighet.']],
  story:[['formidleridentitet_001','Sara','sara_senior_formidler_kunst_publikum_og_formidling',places[1].id,'Når den gode formidleren blir viktigere enn verket og publikum','Etter mange vellykkede omvisninger har spilleren fått sterk personlig respons, og en ny kritisk gruppe tester om formidlingen fortsatt gir plass til verk, kilder, uenighet og publikums egne perspektiver.']],
  event:[['ny_hendelse_001','Erik','erik_galleridrift_sikkerhet_kunst_publikum_og_formidling',places[3].id,'Et teknisk avvik endrer publikumsflyten midt i dagen','En installasjon må midlertidig avsperres, og plutselig endres rute, kapasitet, tilgjengelighet og hvilke opplysninger publikum må få uten at formidleren spekulerer i årsak.']],
  micro:[['eskaler_001','Jon','jon_publikumsvert_kunst_publikum_og_formidling',places[0].id,'Svar nå eller hent riktig fagperson?','Et kort spørsmål kommer i køen og krever mer sikker fagkunnskap enn den som står i vertsbriefen; du må velge mellom synlig usikkerhet og en rask improvisasjon.']],
  followup:[['etterkontroll_001','Amal','amal_tilgjengelighetskoordinator_kunst_publikum_og_formidling',places[2].id,'Tilpasningen er gjennomført, men læringen må tilbake i loggen','Et alternativt formidlingsopplegg fungerte bedre for gruppen enn standardformatet, og erfaringene må dokumenteres slik at neste team kan vite hva som var behov, tiltak og faktisk effekt.']],
  knowledge:[['history_go_001','Sara','sara_senior_formidler_kunst_publikum_og_formidling',places[1].id,'Bruk kunsthistorien til bedre spørsmål, ikke til skjult fagmyndighet','En omvisning trenger rikere kontekst om verk, epoke og institusjon, men History Go-kunnskap må brukes til kildebevisste spørsmål og kan ikke fylle hull i proveniens, katalogdata eller dagens institusjonelle standpunkt.']],
  consequence:[['hendelse_etterspill_001','Erik','erik_galleridrift_sikkerhet_kunst_publikum_og_formidling',places[3].id,'En liten hendelse viser at handoffen var for svak','Et tidligere avvik ble håndtert rolig, men oppfølgingen viser at publikum, vertskap og drift satt igjen med ulike versjoner av hva som var kommunisert og hvem som eide neste kontroll.']]
};

const baseSummary = (type, premise) => `${premise} Saken skal føres i ${PERSISTENT}, der målgruppe og behov, verk-/utstillingsgrunnlag, godkjent fagstoff, tolkning og usikkerhet, tilgjengelighet, publikumsrespons, kapasitet, sikkerhets- eller bevaringsgrense, hendelse, eskalering, kommunikasjon, ventepunkt og neste eier er separate felt. Rollen kan formidle godkjent fagstoff, veilede publikum og håndtere ordinære publikumsbehov, men kan ikke endre proveniens eller katalogdata, love utlån eller salg uten fullmakt, omdefinere institusjonens faglige standpunkt eller ignorere sikkerhets- eller bevaringsrutiner. ${type === 'knowledge' ? 'History Go og Kunst-Badge kan bidra med kunsthistorisk og institusjonell kontekst, men kan ikke gi relevant_education_or_employer_qualification, gjøre spilleren til Formidler uten Career-port, endre katalogdata eller gi sikkerhets- og bevaringsmyndighet.' : 'God service, høy publikumstilfredshet og personlig overbevisning må derfor ikke brukes som erstatning for dokumentert faggrunnlag eller riktig eskalering.'}`;
const situation = [
  'Publikumsmøteloggen viser siste versjon, gruppens behov, hva som er dokumentert, hva som er tolkning eller uavklart, og alle åpne tilgjengelighets- og sikkerhetspunkter.',
  'En rask eller sosialt smidig løsning vil holde flyten bedre på kort sikt, men kan skjule faglig usikkerhet, gruppens faktiske behov eller et avvik som må eskaleres.',
  'Du må velge et grep som gjør neste handoff og mulig rework lesbart uten å omskrive hva publikum allerede har fått høre eller hvilke grenser som faktisk gjaldt.'
];
const choiceA = (subject) => ({
  id:'A',label:`Avklar ${subject.toLowerCase()} i publikumsmøteloggen`,
  reply:'Jeg beholder siste dokumenterte versjon, skiller godkjent fagstoff fra tolkning og usikkerhet, markerer tilgjengelighets-, fag- eller sikkerhetsventing eksplisitt og sender bare det uavklarte spørsmålet til den aktøren som faktisk har ansvar. Jeg dokumenterer også hva publikum allerede er informert om og hvilket kontrollpunkt som må passeres før saken kan lukkes.',
  effect:1,tags:['sporbarhet','tilgjengelighet','eskalering'],
  feedback:'Grepet kan gjøre møtet litt langsommere, men det bevarer skillet mellom det du vet, det du tolker og det du må eskalere. Neste vert, formidler eller fagperson kan se gruppens behov, tidligere kommunikasjon, eventuelle sikkerhetsgrenser og hva som fortsatt venter. Det beskytter både publikums tillit og institusjonens faglige redelighet fordi ingen senere trenger å late som usikkerheten aldri fantes.',
  effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}
});
const choiceB = (subject) => ({
  id:'B',label:`Lukk ${subject.toLowerCase()} gjennom flyt og improvisert autoritet`,
  reply:'Jeg prioriterer en rask og overbevisende løsning, fyller inn det uavklarte selv, behandler publikumsflyt som viktigere enn eksplisitt venting og unngår å sende saken videre dersom det kan skape forsinkelse eller gjøre meg mindre sikker i situasjonen. Jeg lar dermed neste aktør overta uten et tydelig spor av usikkerhet, avvik eller hvem som egentlig hadde fag- eller sikkerhetsansvar.',
  effect:-1,tags:['improvisert_autoritet','tempo','skjult_usikkerhet'],
  feedback:'Møtet kan føles smidigere der og da, men loggen mister skillet mellom dokumentert kunnskap, personlig tolkning og uavklart spørsmål. Publikum kan få en falsk sikkerhet, neste medarbeider kan gjenta samme påstand eller overse samme behov, og et sikkerhets- eller tilgjengelighetsproblem blir vanskeligere å følge opp. Rollen ser mer selvsikker ut, men institusjonen blir mindre presis, mindre lærende og mer sårbar for korrigering i ettertid.',
  effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}
});

for (const type of TYPES) {
  const specs = mailSpecs[type];
  const familyId = familyByType[type];
  const mails = specs.map(([suffix,from,peopleRef,placeId,subject,premise], index) => ({
    id:`publikum_formidling_${type}_${suffix}`,mail_type:type,mail_family:familyId,role_scope:ROLE,
    phase:index===0?'forenoon':'workday',priority:130-index,from,people_ref:peopleRef,place_id:placeId,subject,
    summary:baseSummary(type,premise),situation,
    task_domain:'publikum_formidling_og_galleridrift',competency:'presis_tilgjengelig_og_sporbar_formidling',
    pressure:'presisjon_tilgjengelighet_service_og_sikkerhet',choice_axis:'sporbar_avklaring_vs_improvisert_autoritet',consequence_axis:'faglig_tillit_og_trygghet_vs_skjult_usikkerhet',narrative_arc:suffix.replace(/_\d+$/,''),
    choices:[choiceA(subject),choiceB(subject)]
  }));
  write(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`,{
    schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,
    families:[{id:familyId,purpose:`Trene ${type} gjennom den versjonerte publikumsmøteloggen uten å blande service, formidling, faglig dokumentasjon og sikkerhetsmyndighet.`,learning_focus:['faglig_presisjon','tilgjengelighet','eskalering','sporbarhet'],mails}]
  });
}

write(MODEL, model);
write(GRAMMAR, grammar);
write(PLAN, plan);
if (!manifest.files.includes(MODEL)) manifest.files.push(MODEL);
write(MANIFEST, manifest);

const source = `# Kunst / Publikum og formidling — prerequisites source-first\n\n## Scope\n\nCanonical role: \`${KEY}\`. This package materializes the playable Career/work foundation and is **not Role World completion**. The remaining realism dimension must stay \`situated_reputation\` until a dedicated Role World PR.\n\n## Locked canonical Career gates\n\n\`Vertskap (museum/galleri)\` remains \`direct\`. \`Gallerimedarbeider\` remains \`direct\`. \`Formidler\` remains \`qualification_required\` with \`relevant_education_or_employer_qualification\`. History Go, Kunst-Badge, experience or good public response cannot waive that qualification gate.\n\n## Locked work and authority contracts\n\nBoth existing work loops are preserved byte-for-byte. The authority boundary is preserved byte-for-byte: the role may communicate approved content, guide visitors and handle ordinary visitor needs; it may not alter provenance/catalogue data, promise loans or sales without authority, redefine the institution's professional position or ignore safety/conservation routines.\n\n## Persistent editorial object\n\nThe persistent editorial object is \`${PERSISTENT}\`: a versioned record for audience/group needs, artwork/exhibition basis, approved content, interpretation and uncertainty, accessibility, visitor response, capacity, safety/conservation boundaries, incidents, escalation, communication, documentation and learning. Waiting, handoff and bounded rework are explicit.\n\n## People and places\n\nFour fictional current-work actors are scoped only to this playable role: senior educator Sara, visitor host Jon, accessibility coordinator Amal and gallery-operations/safety lead Erik. They are not canonical historical people. Four work surfaces separate reception/hosting, guided interpretation, accessibility/group adaptation and gallery-operation incident/escalation work.\n\n## Mail and day-one foundation\n\nThe package provides a deterministic 16-step plan and 15 source mails across all nine required types: 4 job, 4 people and one each conflict, story, event, micro, followup, knowledge and consequence. There is no generic fallback.\n\n## History Go boundary\n\nHistory Go may provide art-historical, artwork, exhibition and institutional context that improves questions and source-aware interpretation. It cannot grant the Formidler qualification, alter provenance or catalogue data, authorize sale/loan, redefine the institution's position, or override safety/conservation routines.\n\n## Cross-role decision\n\nReadiness says \`not_required_for_rollout\`; this prerequisite package does not materialize a cross-role link. Publikum og formidling can hand work to curatorial, conservation, accessibility or safety actors through the existing Scene Pipeline without inventing a shared runtime object.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene engine. The existing Scene Pipeline, Career gate, mail machinery and audits remain canonical.\n`;
writeText(SOURCE, source);
console.log(`Materialized ${ROLE} prerequisites: 4 actors, 4 places, 16 plan steps, 15 mails, no new runtime.`);
