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
const ROLE = 'kunst_museumsledelse';
const KEY = `${CATEGORY}/${ROLE}`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MANIFEST = 'data/Civication/roleModels/manifest.json';
const BADGE = 'data/badges/kunst.json';
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const SOURCE = 'reports/CIVICATION_KUNST_MUSEUMSLEDELSE_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'institusjonsstrategi_budsjett_styre_risiko_arbeidsmiljo_og_beredskapslogg';
const LOOPS = [
  'mandat -> strategi -> budsjett -> gjennomforing -> rapportering -> evaluering',
  'hendelse -> sikre mennesker og samling -> etablere fakta -> beslutte -> informere -> etterkontroll'
];
const AUTHORITY = {
  may: ['lede institusjonen innen mandat','fordele ressurser innen fullmakt','utøve arbeidsgiveransvar'],
  may_not: ['sette styrets myndighet til side','bruke samling eller midler privat','overstyre dokumenterte faglige sikkerhetsgrenser uten grunnlag','skjule vesentlig risiko']
};
const POLICY = {Museumsdirektør:{policy:'appointment_required',qualification_ids:['employer_appointment']}};

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
const tier = badge.tiers.find((entry) => entry.label === 'Museumsdirektør');
must(tier?.career_offer?.role_scope === ROLE, 'Museumsdirektør badge binding drifted');
must(tier.career_offer.policy === 'appointment_required', 'Museumsdirektør must remain appointment_required');
must(JSON.stringify(tier.career_offer.qualification_ids) === JSON.stringify(['employer_appointment']), 'Museumsdirektør employer appointment drifted');

const places = [
  {
    id:'direktor_og_ledergruppebord',
    name:'Direktør- og ledergruppebordet',
    description:'Her holdes samfunnsoppdrag, institusjonsstrategi, lederansvar, tverrfaglige avhengigheter og neste eier av tiltak sammen før direktøren bruker delegert myndighet.'
  },
  {
    id:'styre_eier_og_mandatspunkt',
    name:'Styre-, eier- og mandatspunktet',
    description:'Her skilles direktørens fullmakter fra styrevedtak, eierkrav, rapportering, habilitet og saker som må eskaleres i stedet for å avgjøres uformelt.'
  },
  {
    id:'budsjett_arbeidsgiver_og_prioriteringsrom',
    name:'Budsjett-, arbeidsgiver- og prioriteringsrommet',
    description:'Her kobles bemanning, arbeidsmiljø, innkjøp, kontrakter, driftsmidler, program og samlingsarbeid til vedtatt budsjett og eksplisitte fullmakter.'
  },
  {
    id:'samlingsrisiko_beredskap_og_offentlighetsrom',
    name:'Samlingsrisiko-, beredskaps- og offentlighetsrommet',
    description:'Her samles verifiserte fakta om mennesker, samling, bygg, sikkerhet, juridisk risiko og kommunikasjon før krisevedtak, varsling og etterkontroll.'
  }
];
const actors = [
  {
    id:'anne_styreleder_kunst_museumsledelse',name:'Anne',role:'styreleder',place:places[1].id,
    function:'Anne holder styrets myndighet, vedtatt strategi og direktørens delegasjon fra hverandre når tidspress eller prestisje gjør det fristende å behandle ledelsesmessig tillit som en åpen fullmakt. Hun krever beslutningsgrunnlag der økonomi, risiko, faglige premisser, mindretall og faktisk beslutningseier kan leses etterpå.',
    authority:'Anne kan innkalle til styrebehandling, avklare hva styret har delegert og kreve rapportering på vesentlig risiko. Hun kan ikke gjøre styrets rolle til operativ detaljstyring av konservatorfag, personalsaksbehandling eller kuratorisk enkeltskjønn, og direktøren kan ikke bruke god relasjon til styreleder som erstatning for formelt vedtak.'
  },
  {
    id:'omar_okonomi_hr_kunst_museumsledelse',name:'Omar',role:'økonomi- og HR-leder',place:places[2].id,
    function:'Omar gjør budsjett, prognose, bemanning, arbeidsmiljø, anskaffelsesgrenser og arbeidsgiveransvar til konkrete styringsdata i stedet for bakgrunnsstøy. Han viser hvilke konsekvenser et program- eller sparevalg får for mennesker og drift, og markerer når en personalsak eller økonomisk forpliktelse trenger egen prosess.',
    authority:'Omar kan kvalitetssikre budsjettgrunnlag, varsle avvik og eie avtalte HR- og økonomiprosesser, men kan ikke overta styrets myndighet eller direktørens samlede prioriteringsansvar. Direktøren kan ikke instruere ham til å skjule prognoser, omgå arbeidsmiljøplikt, flytte midler privat eller behandle en alvorlig personalsak som omdømmekommunikasjon.'
  },
  {
    id:'ida_samlings_beredskapsleder_kunst_museumsledelse',name:'Ida',role:'samlings- og beredskapsleder',place:places[3].id,
    function:'Ida bringer samlingsforvaltning, bygningshendelser, sikkerhet og beredskap inn i direktørens beslutningsrom med eksplisitt skille mellom verifisert fakta, faglig risikovurdering og ledelsens prioritering. Hun gjør det synlig når konservatorfaglige eller sikkerhetsfaglige grenser må få operativ forrang i en hendelse.',
    authority:'Ida kan aktivere avtalte beredskapsprosedyrer, kreve sikringstiltak og løfte dokumenterte faglige sikkerhetsgrenser som direktøren ikke kan overstyre uten grunnlag. Hun kan ikke alene vedta institusjonens langsiktige budsjett eller kommunikasjonsstrategi, og direktøren kan ikke gjøre sin tittel til erstatning for faglig kompetanse i samlingsinngrep.'
  },
  {
    id:'marius_kunstnerisk_leder_kunst_museumsledelse',name:'Marius',role:'kunstnerisk leder',place:places[0].id,
    function:'Marius bærer den kunstneriske porteføljen og gjør konsekvensene av strategi, sponsorvilkår, budsjettkutt og styresignaler synlige for program, kunstnere og fagteam. Han gir direktøren et selvstendig faglig motblikk som må dokumenteres, særlig når økonomisk eller offentlig press kan bli skjult programstyring.',
    authority:'Marius kan anbefale kunstnerisk retning og prioritere innen sitt delegerte mandat, men kan ikke bruke faglig autonomi til å sette direktørens arbeidsgiveransvar, vedtatt budsjett eller styrets myndighet til side. Direktøren kan heller ikke diktere programinnhold gjennom sponsorpress eller bruke styringsmakt til å omskrive faglig uenighet.'
  }
];

const model = {
  ...originalModel,
  core_narrative:[
    originalModel.core_narrative[0],
    'Rollen gjør institusjonell ledelse spillbar gjennom et versjonert styringsspor der mandat, strategi, budsjett, arbeidsgiveransvar, samlingsrisiko, beredskap, faglige motstemmer, styre/eierdialog og offentlig begrunnelse kan følges uten at direktørtittel blir ubegrenset myndighet.'
  ],
  work_life:{
    daily_work:[
      'Oppdaterer institusjonsloggen med mandat, strategi, budsjettstatus, risiko, beslutning og neste eier.',
      'Leder ledergruppen og skiller operative avklaringer fra saker som krever styre, fagmyndighet eller egen HR-/juridisk prosess.',
      'Følger økonomi, arbeidsgiveransvar, samling og publikumsoppdrag som samtidige styringsforpliktelser.',
      'Rapporterer avvik og forklarer beslutninger offentlig uten å skjule vesentlig usikkerhet eller risiko.'
    ],
    responsibilities:[...originalModel.work_life.responsibilities],
    work_environment:['Museum, ledergruppe, styre/eierdialog, budsjett- og arbeidsgiverprosesser, samlingsberedskap og offentlig etterprøvbarhet.'],
    status_position:['Museumsdirektørens status kommer fra et uttrykkelig employer_appointment og et avgrenset mandat; omdømme, Kunst-Badge, History Go-kunnskap eller gode resultater kan aldri i seg selv utnevne spilleren eller utvide styre- og faggrenser.'],
    workplaces:places.map((entry) => entry.id)
  },
  career_path:{
    entry_from:['Museumsdirektør er en formelt utnevnt lederstilling og krever employer_appointment; Kunst-Badge, erfaring eller uformelt ansvar alene gir ikke stillingen.'],
    progression_to:['Større institusjons-, konsern- eller sektoransvar bare når ny formell utnevnelse og nye fullmakter faktisk følger med.'],
    possible_promotions:['Direktøransvar i større eller mer kompleks institusjon med eksplisitt ny utnevnelse.','Sektor- eller konsernledelse der styre/eier gir nytt formelt mandat.'],
    possible_exits:['Tilbake til faglig, kuratorisk eller administrativ lederrolle med mindre institusjonelt totalansvar.','Overgang til kulturforvaltning, rådgivning, styrearbeid eller undervisning uten at tidligere direktørtittel automatisk gir ny myndighet.'],
    career_risks:['Prestisje og mediepress kan gjøre det fristende å skjule risiko eller bruke uformell styring.','Sterk styre- eller sponsorrelation kan forveksles med delegert myndighet og svekke faglig autonomi eller habilitet.']
  },
  required_knowledge:{
    education_basis:['Relevant institusjons-, økonomi-, arbeidsgiver- og kulturfaglig kompetanse kombinert med dokumentert ledererfaring og konkret arbeidsgiverutnevnelse.'],
    skills:['institusjonsstrategi','budsjett og prognose','styre- og eierstyring','arbeidsgiveransvar','arbeidsmiljø','risikostyring','samlingsansvar','beredskap','offentlig kommunikasjon'],
    category_knowledge:['Kunstinstitusjoners historie, samfunnsoppdrag, samlingsforvaltning, kuratorisk autonomi og hvordan offentlig eller privat styring påvirker faglig legitimitet.'],
    history_go_badges:['kunst'],
    place_connections:places.map((entry) => entry.id),
    people_connections:actors.map((entry) => entry.id)
  },
  authority_boundary:AUTHORITY,
  challenges:[
    {id:'samfunnsoppdrag_vs_kutt',title:'Samfunnsoppdrag under kutt',description:'Budsjettpress må håndteres uten å skjule konsekvensene for ansatte, samling, program og publikum eller love at alt kan bevares uendret.',pressure:'samfunnsoppdrag_vs_okonomi',affects:['quality','trust','risk']},
    {id:'styring_vs_fagautonomi',title:'Styring uten skjult faglig overtakelse',description:'Styret, sponsor eller direktøren kan ha legitim styringsmakt uten at økonomisk eller hierarkisk makt blir skjult kuratorisk eller konservatorfaglig fasit.',pressure:'faglig_autonomi_vs_styring',affects:['quality','trust','status']}
  ],
  dilemmas:[
    {id:'prestisjeprosjekt_arbeidsmiljo',title:'Prestisjeprosjekt mot arbeidsgiveransvar',setup:'Et profilert prosjekt har høy offentlig verdi, men belastningen i organisasjonen og økonomien er dokumentert som alvorlig.',choice_axis:'prestisje_og_tempo_vs_arbeidsgiveransvar_og_sporbar_prioritering',consequence_axis:'kortsiktig_synlighet_vs_langsiktig_institusjonell_baerekraft',mail_hooks:TYPES}
  ],
  related_people:actors.map((entry) => ({id:entry.id,name:entry.name,role:entry.role,fictional:true,fictional_scenario_actor:true,canonical_person_ref:null,function:entry.function,authority_relation:entry.authority,workplace_ids:[entry.place]})),
  related_places:places.map((entry) => ({id:entry.id,name:entry.name,function:entry.description})),
  mail_integration:{role_scope:ROLE,mail_profile:ROLE,can_feed_mail_types:TYPES,recommended_mail_families:TYPES.map((type) => `museumsledelse_${type}`),role_model_refs_supported:true}
};

const grammar = {
  ...originalGrammar,
  actor_grammar:actors.map((entry) => ({id:entry.id,name:entry.name,role:entry.role,workplace_ids:[entry.place]})),
  place_grammar:places.map((entry) => ({id:entry.id,name:entry.name,function:entry.description})),
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Et vedvarende, versjonert institusjonsgrunnlag som holder mandat, strategi, budsjett/prognose, styre/eierstatus, arbeidsgiver- og arbeidsmiljøspørsmål, samlings- og sikkerhetsrisiko, beredskap, faglige motstemmer, beslutninger, kommunikasjon og etterkontroll i samme spor.',
    states:['registrert','under_ledergruppevurdering','venter_pa_faglig_avklaring','venter_pa_hr_juridisk_avklaring','venter_pa_budsjettgrunnlag','venter_pa_styre_eller_eier','beslutningsklart','besluttet','under_gjennomforing','under_beredskap','rapportert','evaluert','gjenapnet_for_rework'],
    handoff_rule:'Neste eier overtar eksplisitt mandat, versjon, verifiserte fakta, økonomisk status, faglige grenser, vesentlig risiko, ventepunkt og beslutningsnivå; ingen handoff kan slette et styrekrav, arbeidsmiljøansvar, tidligere risikovarsel eller faglig motstemme.'
  },
  rhythm_contract:{
    loop:'registrering -> ledergruppevurdering -> waiting/venting på faglig, HR/juridisk, budsjett- eller styre/eieravklaring -> handoff -> beslutning -> gjennomføring/beredskap -> rapportering -> evaluering -> rework',
    waiting_states:['faglig_sikkerhetsavklaring','hr_eller_juridisk_avklaring','budsjett_og_prognose','styre_eller_eierbeslutning','samlings_eller_byggfakta','arbeidsmiljooppfolging'],
    rework_rule:'Nytt avvik, endret prognose, faglig sikkerhetsfunn, arbeidsmiljøinformasjon eller styre/eierpremiss gjenåpner bare berørte deler av institusjonsloggen med ny versjon og ny eier; tidligere beslutningsgrunnlag blir stående.'
  },
  knowledge_dependencies:[
    {id:'history_go_kunst_institusjon_samling_og_offentlighet',badge_id:'kunst',use:'Gir kunsthistorisk og institusjonshistorisk kontekst for samfunnsoppdrag, samling, kanon, representasjon og offentlig begrunnelse, men gir ikke employer_appointment, styremyndighet, budsjettfullmakt, arbeidsgiverfullmakt eller konservatorfaglig sikkerhetskompetanse.'}
  ],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:POLICY,first_object:PERSISTENT,first_task:'Registrer én institusjonssak med mandat, økonomisk og faglig status, vesentlig risiko, riktig beslutningsnivå og neste eier før du bruker direktørfullmakt.'},
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
};

const familyByType = {
  job:'museumsledelse_institusjonsstyring_job',
  people:'museumsledelse_profesjonelle_relations',
  conflict:'museumsledelse_styre_fag_og_arbeidsgiverkonflikt',
  story:'museumsledelse_lederidentitet_og_samfunnsoppdrag',
  event:'museumsledelse_beredskap_og_endret_risiko',
  micro:'museumsledelse_rask_mandatavklaring',
  followup:'museumsledelse_rapportering_og_etterkontroll',
  knowledge:'museumsledelse_history_go_kunstinstitusjon',
  consequence:'museumsledelse_beslutning_og_etterspill'
};
const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const plan = {
  schema:'civication_mail_plan_v1',version:1,id:'kunst_museumsledelse_foundation_v1',category:CATEGORY,role_scope:ROLE,title:'Museumsledelse',
  description:'Seksten steg fra første styre- og risikosak til etterprøvbar evaluering av samme institusjonelle styringsspor.',
  arc:{from:'Formelt utnevnt museumsdirektør som arver et uavklart styrings- og risikobilde.',to:'Direktør som kan holde samfunnsoppdrag, styremandat, faggrenser, budsjett, arbeidsgiveransvar, samling og offentlighet sammen uten å gjøre tittel til ubegrenset myndighet.',core_questions:['Hvem kan faktisk beslutte denne saken?','Hva må stå igjen som vesentlig risiko eller faglig grense?','Når må ny informasjon gjenåpne beslutningen?']},
  outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','museumsledelse_mandatssvikt']}},
  sequence:sequenceTypes.map((type,index) => ({step:index+1,type,phase:index<3?'intro':index<10?'advanced':'mastery',step_goal:`Før institusjonsloggen gjennom ${type} med synlig mandat, vesentlig risiko, ventepunkt, beslutningsnivå og neste eier.`,allowed_families:[familyByType[type]],fallback_types:[]}))
};

const mailSpecs = {
  job:[
    ['budsjettkutt_001','Omar','omar_okonomi_hr_kunst_museumsledelse',places[2].id,'Kuttet rammer både bemanning og samlingsarbeid','Budsjettkuttet kan ikke reduseres til én prosentlinje: prognosen viser samtidige konsekvenser for bemanning, samlingsarbeid, publikumsprogram og vedlikehold.'],
    ['styresak_002','Anne','anne_styreleder_kunst_museumsledelse',places[1].id,'Styresaken mangler beslutningsklart risikobilde','Et strategisk prosjekt er på vei til styret, men grunnlaget blander direktørens anbefaling, faglige motstemmer, økonomisk risiko og selve styrebeslutningen.'],
    ['arbeidsmiljo_003','Omar','omar_okonomi_hr_kunst_museumsledelse',places[2].id,'Prestisjeprosjektet har fått et alvorlig arbeidsmiljøvarsel','Et profilert prosjekt har høy offentlig verdi, men nye opplysninger viser vedvarende belastning, rolleuklarhet og arbeidsgiverrisiko som må behandles i egen prosess.'],
    ['beredskap_004','Ida','ida_samlings_beredskapsleder_kunst_museumsledelse',places[3].id,'Teknisk hendelse setter deler av samlingen i fare','En bygg- og klimahendelse har satt mennesker, verk og drift under press, og det er fortsatt forskjell mellom verifiserte fakta, faglige sikkerhetsgrenser og direktørens institusjonelle prioritering.']
  ],
  people:[
    ['styreleder_001','Anne','anne_styreleder_kunst_museumsledelse',places[1].id,'Styreleder ber om klarere skille mellom orientering og vedtak','Anne trenger et grunnlag der det framgår hva direktøren allerede kan gjøre, hva styret bare skal orienteres om, og hva som faktisk krever styrevedtak.'],
    ['okonomi_hr_002','Omar','omar_okonomi_hr_kunst_museumsledelse',places[2].id,'Økonomi- og HR-leder nekter å pakke personalsak inn i omdømmearbeid','Omar påpeker at en sensitiv sak både har arbeidsmiljø-, personvern- og ressurskonsekvenser, og at kommunikasjon ikke kan erstatte arbeidsgiverprosessen.'],
    ['samlingsberedskap_003','Ida','ida_samlings_beredskapsleder_kunst_museumsledelse',places[3].id,'Samlingsleder krever at sikkerhetsgrensen blir stående','Ida har dokumentert en faglig sikkerhetsgrense som forsinker en synlig åpning, og direktøren må velge mellom å støtte korrekt fagmyndighet eller presse fram en ubegrunnet omgåelse.'],
    ['kunstnerisk_leder_004','Marius','marius_kunstnerisk_leder_kunst_museumsledelse',places[0].id,'Kunstnerisk leder ber om dokumentert vern mot sponsorinnflytelse','Marius ber om at finansieringsdialogen og programmyndigheten skilles eksplisitt før en sponsorforhandling skaper forventninger om kunstnerisk innflytelse.']
  ],
  conflict:[['styre_fag_press_001','Anne','anne_styreleder_kunst_museumsledelse',places[1].id,'Styret og fagledelsen trekker institusjonen i ulike retninger','Styret etterspør lavere risiko etter offentlig kritikk, mens fagledelsen mener styringssignalet er i ferd med å bli skjult faglig overtakelse; direktøren må bevare både mandat, faglig uenighet og faktisk beslutningsnivå.']],
  story:[['lederidentitet_001','Marius','marius_kunstnerisk_leder_kunst_museumsledelse',places[0].id,'Når direktørtittelen begynner å ligne personlig eierskap','Flere vellykkede år har gjort omdømme og institusjonens profil tett knyttet til direktøren, og en ny uenighet tester om samfunnsoppdraget og styringssporet tåler at personlig status faller.']],
  event:[['hendelse_001','Ida','ida_samlings_beredskapsleder_kunst_museumsledelse',places[3].id,'Ny skadeinformasjon endrer beredskapsbildet','Etter den første sikringen kommer nye måledata som endrer både samlingsrisiko, evakueringsbehov og hva institusjonen trygt kan kommunisere offentlig.']],
  micro:[['mandat_001','Anne','anne_styreleder_kunst_museumsledelse',places[1].id,'Hvem eier beslutningen akkurat nå?','En kort forespørsel kommer midt i høyt tempo: saken er faglig vurdert, men det er uklart om neste steg ligger hos direktøren, styret eller en annen fag-/arbeidsgiverprosess.']],
  followup:[['etterkontroll_001','Omar','omar_okonomi_hr_kunst_museumsledelse',places[2].id,'Tiltaket er gjennomført, men effekten må dokumenteres','Et krevende spare- og bemanningstiltak er gjennomført; nå må faktisk økonomisk effekt, arbeidsmiljøkonsekvens, samlingsrisiko og restgjeld føres tilbake til institusjonsloggen.']],
  knowledge:[['history_go_001','Marius','marius_kunstnerisk_leder_kunst_museumsledelse',places[0].id,'Bruk institusjonshistorien uten å gjøre den til styringsfullmakt','Et strateginotat trenger historisk kontekst om museets samfunnsoppdrag, kanon, samling og offentlig rolle, men kunnskapen må holdes adskilt fra dagens styremandat, arbeidsgiveransvar og faglige sikkerhetsgrenser.']],
  consequence:[['sponsor_etterspill_001','Anne','anne_styreleder_kunst_museumsledelse',places[1].id,'Sponsoravtalen får et styringsmessig etterspill','En tidligere finansieringsavklaring tolkes nå offentlig som løfte om programinnflytelse, og institusjonen må rekonstruere hva som faktisk ble avtalt, hvem som hadde fullmakt og hvilke grenser som ble kommunisert.']]
};

const baseSummary = (type, premise) => `${premise} Saken skal føres i ${PERSISTENT}, der styremandat, delegasjon, strategi, budsjett/prognose, arbeidsgiver- og arbeidsmiljøansvar, samlings- og sikkerhetsrisiko, faglige motstemmer, verifiserte fakta, beslutning, kommunikasjon, ventepunkt og neste eier er separate felt. Museumsdirektøren kan lede institusjonen innen mandat, fordele ressurser innen fullmakt og utøve arbeidsgiveransvar, men kan ikke sette styrets myndighet til side, bruke samling eller midler privat, overstyre dokumenterte faglige sikkerhetsgrenser uten grunnlag eller skjule vesentlig risiko. ${type === 'knowledge' ? 'History Go kan bidra med kunst- og institusjonshistorisk kontekst, men kan ikke gi employer_appointment, budsjettfullmakt, styremyndighet eller faglig sikkerhetskompetanse.' : 'Tempo, omdømme og sterke relasjoner må derfor ikke brukes som erstatning for riktig beslutningsnivå eller dokumentert grunnlag.'}`;
const situation = [
  'Institusjonsloggen viser siste versjon, beslutningseier, økonomisk status, faglige grenser og alle åpne ventepunkter.',
  'En rask lukking vil gi fremdrift eller bedre omdømme på kort sikt, men kan skjule styrekrav, arbeidsmiljøansvar, faglig risiko eller faktisk fullmakt.',
  'Du må velge et grep som gjør handoff og mulig rework lesbart for neste aktør uten å omskrive tidligere varsler eller beslutningsgrunnlag.'
];
const choiceA = (subject) => ({
  id:'A',label:`Avklar ${subject.toLowerCase()} i institusjonsloggen`,
  reply:`Jeg beholder siste dokumenterte versjon, skiller verifiserte fakta fra vurdering og beslutning, markerer styre-, fag-, HR/juridisk- eller budsjettventing eksplisitt og sender bare den avgrensede saken til den aktøren som faktisk har myndighet. Jeg dokumenterer også hva som fortsatt er vesentlig risiko og hvilket kontrollpunkt som må passeres før status kan lukkes.`,
  effect:1,tags:['sporbarhet','mandat','risiko'],
  feedback:'Grepet gjør ikke nødvendigvis saken raskere eller enklere å kommunisere, men det bevarer hvem som visste hva, hvilken faglig eller økonomisk grense som gjaldt, hvem som hadde beslutningsmyndighet og hva som fortsatt ventet. Neste eier kan derfor handle uten å arve skjulte løfter, uformelle fullmakter eller en omskrevet risikohistorie, og institusjonen kan senere forklare hvorfor beslutningen ble tatt og hva som faktisk endret seg.',
  effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}
});
const choiceB = (subject) => ({
  id:'B',label:`Lukk ${subject.toLowerCase()} gjennom direktørstatus og tempo`,
  reply:'Jeg bruker direktørtittel, relasjonell tillit og behovet for framdrift som tilstrekkelig grunnlag, rydder bort ventepunktet og kommuniserer saken som avklart selv om styre-, fag-, budsjett- eller arbeidsgiverpremiss fortsatt mangler. Dermed kan prosjektet gå videre uten en ny runde med eksplisitt eierskap og dokumentasjon.',
  effect:-1,tags:['uformell_myndighet','tempo','skjult_risiko'],
  feedback:'Den lokale flyten ser bedre ut, men institusjonsloggen mister skillet mellom anbefaling, fullmakt og vedtak. Styret, fagmiljøet, ansatte og offentligheten kan sitte med ulike versjoner av hva som var kjent og lovet, og direktørstatus brukes som substitutt for grunnlag. Det øker risikoen for økonomisk feil, arbeidsmiljøsvikt, faglig overstyring og omdømmetap nettopp fordi den vesentlige usikkerheten ble gjort usynlig.',
  effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}
});

for (const type of TYPES) {
  const specs = mailSpecs[type];
  const familyId = familyByType[type];
  const mails = specs.map(([suffix,from,peopleRef,placeId,subject,premise], index) => ({
    id:`museumsledelse_${type}_${suffix}`,mail_type:type,mail_family:familyId,role_scope:ROLE,
    phase:index===0?'forenoon':'workday',priority:130-index,from,people_ref:peopleRef,place_id:placeId,subject,
    summary:baseSummary(type,premise),situation,
    task_domain:'museumsledelse_og_institusjonsstyring',competency:'sporbar_mandat_risiko_og_beslutningsledelse',
    pressure:'samfunnsoppdrag_vs_okonomi_faggrenser_og_offentlighet',choice_axis:'sporbar_avklaring_vs_uformell_lukking',consequence_axis:'institusjonell_legitimitet_vs_skjult_risiko',narrative_arc:suffix.replace(/_\d+$/,''),
    choices:[choiceA(subject),choiceB(subject)]
  }));
  write(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`,{
    schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,
    families:[{id:familyId,purpose:`Trene ${type} gjennom den versjonerte institusjonsloggen uten å blande styre-, arbeidsgiver-, fag- og direktørmyndighet.`,learning_focus:['mandat','styring','vesentlig risiko','sporbarhet'],mails}]
  });
}

write(MODEL, model);
write(GRAMMAR, grammar);
write(PLAN, plan);
if (!manifest.files.includes(MODEL)) manifest.files.push(MODEL);
write(MANIFEST, manifest);

const source = `# Kunst / Museumsledelse — prerequisites source-first\n\n## Scope\n\nCanonical role: \`${KEY}\`. This package materializes the playable Career/work foundation and is **not Role World completion**. The remaining realism dimension must stay \`situated_reputation\` until a dedicated Role World PR.\n\n## Locked canonical Career gate\n\n\`Museumsdirektør\` remains \`appointment_required\` with \`employer_appointment\`. History Go, Kunst-Badge, experience, standing, board familiarity or prior leadership do not appoint the player and do not expand delegated authority.\n\n## Locked work and authority contracts\n\nBoth existing work loops are preserved byte-for-byte. The existing authority boundary is preserved byte-for-byte: the director may lead within mandate, allocate resources within authority and exercise employer responsibility; the director may not set board authority aside, use collection or funds privately, override documented professional safety limits without grounds, or hide material risk.\n\n## Persistent editorial object\n\nThe persistent editorial object is \`${PERSISTENT}\`: a versioned institutional record for mandate, strategy, budget/forecast, board/owner state, employer and working-environment obligations, collection/safety risk, emergency response, professional dissent, decisions, communication and after-control. Waiting, owner, handoff and bounded rework are explicit.\n\n## People and places\n\nFour fictional current-work actors are scoped only to this playable role: board chair Anne, finance/HR lead Omar, collection/emergency lead Ida and artistic lead Marius. They are not canonical historical people. Four work surfaces separate leadership team, board/owner mandate, budget/employer priority, and collection-risk/emergency/public accountability.\n\n## Mail and day-one foundation\n\nThe package provides a deterministic 16-step plan and 15 source mails across all nine required types: 4 job, 4 people and one each conflict, story, event, micro, followup, knowledge and consequence. There is no generic fallback.\n\n## History Go boundary\n\nHistory Go may provide art-historical and institutional-history context for mission, collection, canon and public role. It cannot give \`employer_appointment\`, board authority, budget/delegation, employer authority, legal clearance, emergency authority or conservation/safety competence.\n\n## Cross-role decision\n\nReadiness says \`not_required_for_rollout\`; this prerequisite package does not materialize a cross-role link. Museumsledelse can interact with artistic leadership, conservation, finance/HR or the board through the existing Scene Pipeline without inventing a shared runtime object.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene engine. The existing Scene Pipeline, Career gate, mail machinery and audits remain canonical.\n`;
writeText(SOURCE, source);
console.log(`Materialized ${ROLE} prerequisites: 4 actors, 4 places, 16 plan steps, 15 mails, no new runtime.`);
