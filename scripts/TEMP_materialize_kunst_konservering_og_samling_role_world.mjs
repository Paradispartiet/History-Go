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
const ROLE = 'kunst_konservering_og_samling';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const INDEX = 'data/Civication/roleWorlds/index.json';
const CHECKLIST = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEMEBANK = 'data/Civication/roleWorldThemeBank.json';
const SOURCE = 'reports/CIVICATION_KUNST_KONSERVERING_OG_SAMLING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'kunstverk_tilstands_material_behandlings_og_utlanslogg';
const EXPECTED_LOOPS = [
  'undersøk -> dokumenter -> risikovurder -> tiltak -> kontroll -> dokumenter resultat',
  'forespørsel -> tilstand -> miljøkrav -> transportkrav -> faglig anbefaling -> oppfølging'
];
const EXPECTED_AUTHORITY = {
  may:['stanse risikofylt håndtering','sette faglige bevaringsvilkår','gjennomføre tiltak innen kompetanse og mandat'],
  may_not:['utføre udokumenterte inngrep','endre verk av kosmetiske grunner alene','skjule skade eller usikkerhet','overstyre juridisk eierskap eller forsikringsbeslutninger']
};
const EXPECTED_POLICIES = {
  Konservator:{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Senior konservator':{policy:'appointment_required',qualification_ids:['relevant_education_or_employer_qualification','employer_appointment']}
};
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

must(!fs.existsSync(path.join(root, WORLD)), `${WORLD} already exists`);
for (const rel of [MODEL, GRAMMAR, PLAN, INDEX, CHECKLIST, THEMEBANK]) must(fs.existsSync(path.join(root, rel)), `${rel} missing`);
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const index = read(INDEX);
const checklist = read(CHECKLIST);
const themeBank = read(THEMEBANK);
must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(plan.sequence?.length === 16, 'prerequisite plan must remain 16 steps');
must(grammar.persistent_work_object_contract?.id === PERSISTENT, 'persistent work object drifted');
must(JSON.stringify(grammar.work_loops) === JSON.stringify(EXPECTED_LOOPS), 'conservation work loops drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify(EXPECTED_AUTHORITY), 'authority boundary drifted');
must(grammar.day_one_contract?.entry === 'career_offer_policy_by_title', 'title-owned entry policy drifted');
must(JSON.stringify(grammar.day_one_contract?.entry_policy_by_title) === JSON.stringify(EXPECTED_POLICIES), 'Career title policies drifted');
must((model.related_people || []).length === 4, 'expected four prerequisite scenario actors');
must(!index.roles.some((entry) => entry.category === CATEGORY && entry.role_scope === ROLE), 'Role World already registered');
must(!checklist.reference_worlds.includes(WORLD), 'Role World already in authoring checklist');
must(!themeBank.reference_profiles?.[KEY], 'Role World theme profile already exists');

const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
must(canonicalRefs.length === 15 && new Set(canonicalRefs).size === 15, 'expected exactly 15 unique prerequisite mail refs');
const knowledgeRef = canonicalRefs.find((ref) => ref.includes('/knowledge/'));
must(knowledgeRef, 'knowledge provenance ref missing');

const themeIds = [
  'professional_culture','class_power','status_anxiety','bureaucratic_power','care_vs_efficiency',
  'invisible_work','shame_reputation','public_private_leakage','public_attention'
];
const validThemeIds = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of themeIds) must(validThemeIds.has(id), `unknown theme ${id}`);

const audiences = [
  {
    id:'conservation_peers_and_material_specialists',
    standing_axis:'material_judgment_traceability_and_competence',
    cares_about:['at materialobservasjon, tilstand, analysegrunnlag og tidligere inngrep holdes synlige før behandling','at kompetanse, reversibilitet og dokumentert stoppgrense veier tyngre enn ønsket om et penere eller raskere resultat'],
    cannot_grant:'Standing hos konservatorer og materialspesialister kan påvirke faglig tillit, tilgang til råd og hvor tidlig tvil meldes, men kan ikke gi manglende qualification_required-kompetanse eller employer_appointment, kan ikke autorisere et inngrep uten mandat og kan ikke gjøre kollegial enighet til dokumentert materialtilstand.'
  },
  {
    id:'registrars_and_collection_stewards',
    standing_axis:'object_identity_record_integrity_and_handoff',
    cares_about:['at objekt-ID, plassering, tidligere inngrep, lånestatus og versjoner kan rekonstrueres gjennom hele saken','at ny informasjon korrigerer berørte felt uten å slette hva institusjonen tidligere visste, antok eller gjorde'],
    cannot_grant:'Registrar- og samlingsstanding kan styrke sporbarhet og stoppe en uleselig handoff, men kan ikke diagnostisere materialtilstand, gi behandlingskompetanse, avgjøre juridisk eierskap eller forsikring alene eller gjøre registreringsstatus til faglig godkjenning av behandling, transport eller visning.'
  },
  {
    id:'curators_and_exhibition_team',
    standing_axis:'display_value_under_material_limits',
    cares_about:['at kunsthistorisk og kuratorisk verdi blir forstått uten at den brukes til å oppløse materialgrenser','at visningsperiode, lys, montering og objektvalg faktisk endres når dokumentert bevaringsrisiko krever det'],
    cannot_grant:'Kuratorisk og utstillingsfaglig standing kan påvirke hvilke alternativer som blir prioritert og hvor mye kontekst spilleren får, men kan ikke gi konserveringskvalifikasjon, arbeidsgiverutnevnelse eller behandlingsfullmakt og kan ikke gjøre publikumsverdi til forsikrings-, transport- eller tilstandsvedtak.'
  },
  {
    id:'lenders_insurers_and_transport_partners',
    standing_axis:'condition_commitment_and_transport_discipline',
    cares_about:['at facility report, forsikring, klima, pakking, transport, kurérbehov og mottakskontroll er avklart før et verk flyttes','at institusjonen ikke lover transport eller visning på et grunnlag som konservatorfaglig risiko eller avtale senere må motsi'],
    cannot_grant:'Standing hos långivere, forsikrere og transportpartnere kan gi bestemte avtaler, vilkår og samarbeidsmuligheter, men kan ikke erstatte materialdiagnose, konservatorfaglig qualification_required, employer_appointment, behandlingsmandat eller juridisk eierskap og kan ikke gjøre logistisk gjennomførbarhet til bevis på fysisk forsvarlighet.'
  },
  {
    id:'artists_estates_and_rightsholders',
    standing_axis:'intent_rights_and_material_history',
    cares_about:['at kunstnerintensjon, verkets materialhistorie, rettigheter og senere inngrep holdes adskilt når de ikke peker mot samme handling','at dialog med kunstner, bo eller rettighetshaver dokumenteres uten å bli brukt som en snarvei rundt fysisk tilstand og profesjonell kompetanse'],
    cannot_grant:'Standing hos kunstnere, bo og rettighetshavere kan endre kunnskapsgrunnlag, samtykker og tolkning av intensjon, men kan ikke alene skape konserveringskompetanse, oppheve dokumentert materialrisiko, gi arbeidsgiverutnevnelse eller gjøre et ønsket estetisk resultat til sikker fysisk behandling eller juridisk eierskapsfasit.'
  },
  {
    id:'mounting_security_and_museum_operations',
    standing_axis:'practical_reliability_and_visible_constraints',
    cares_about:['at håndterings-, sikkerhets-, klima- og monteringskrav er konkrete nok til at praktisk arbeid kan gjennomføres uten skjult improvisasjon','at venting, eier og handoff er synlig slik at produksjonslaget ikke arver konservatorfaglig usikkerhet som et uuttalt ansvar'],
    cannot_grant:'Operativ standing kan påvirke samarbeid, tempo og hvor tidlig praktiske problemer blir meldt, men kan ikke senke bevaringsgrensen, gi behandlingstillatelse, skape budsjett eller delegasjon, overstyre forsikring eller gjøre en vellykket montering til bevis på at materialtilstand og langtidsrisiko er akseptabel.'
  },
  {
    id:'researchers_future_conservators_and_public',
    standing_axis:'correction_access_and_long_material_memory',
    cares_about:['at senere forskere og konservatorer kan se hva som ble observert, analysert, behandlet, endret og fortsatt var usikkert','at institusjonen kan forklare en endret behandling, visningsgrense eller tilstandsforståelse uten å late som tidligere versjon aldri fantes'],
    cannot_grant:'Faglig offentlighet, forskerinteresse og framtidige vurderinger kan påvirke institusjonens troverdighet og læring, men kan ikke ansette eller utnevne spilleren, gi delegasjon eller budsjett, autentisere materialtilstand uten undersøkelse eller autorisere behandling, transport, forsikring, eierskap eller avtale.'
  },
  {
    id:'private_relations',
    standing_axis:'presence_confidentiality_and_identity_beyond_professional_status',
    cares_about:['at skade, stopp, kritikk og ansvar kan bearbeides uten at hjemmet blir uformelt behandlings- eller personalsaksrom','at spilleren kan tåle usikkerhet og korrigering uten å kreve privat bekreftelse på egen konservatorfaglige status'],
    cannot_grant:'En nær relasjon kan gi støtte, motstand og perspektiv på belastning, men kan ikke gi qualification_required, employer_appointment, behandlingsfullmakt, forsikrings- eller transportgodkjenning og kan ikke gjøre privat trygghet til evidens for materialtilstand, juridisk eierskap eller institusjonelt vedtak.'
  }
];

const recurringPeople = [
  {id:'eva_senior_konservator_world',social_function:'Eva gjør kompetansegrense, reversibilitet og materialrisiko sosialt synlig når et prestisjeverk, en frist eller en estetisk forventning gjør stopp upopulært.',class_position:'Senior konservator med sterk profesjonell kapital og arbeidsgiverutnevnt senioransvar, men uten rett til å oppheve forsikring, eierskap eller andre fagområders mandat.',status:'Hennes standing avhenger av om spilleren skiller faktisk observasjon fra ønsket behandlingsresultat og respekterer at seniorstatus ikke erstatter dokumentert grunnlag.',power_over_player:'Kan kreve ny tilstandskontroll, stoppe risikofylt håndtering og vurdere tiltak innen kompetanse og mandat, men kan ikke gjøre sin posisjon til juridisk eierskaps- eller forsikringsavgjørelse.',wants:'At kunstverket overlever, at hvert inngrep kan rekonstrueres, og at ingen bruker estetikk eller åpningstidspunkt til å skjule fysisk usikkerhet.',conceals:'Faglig forsiktighet kan bli unødvendig rigid dersom et stopp ikke kobles til tydelige nye data, alternativ plan eller beslutningspunkt.',speech_style:'Materialnær, rolig og presis; spør hva som faktisk er observert, hvilken kompetanse som finnes og hva som kan reverseres.',teaches_player:'At konservering er en kunnskaps- og myndighetsgrense, ikke en kosmetisk service for en ferdig utstillingsplan.'},
  {id:'jonas_registrar_world',social_function:'Jonas gjør objektidentitet, plassering, tidligere inngrep, lånestatus og dokumentversjon til levende deler av bevaringsarbeidet.',class_position:'Registrar og samlingsforvalter med informasjons- og prosessmakt over objektsporet, men uten behandlingsfullmakt eller eneautoritet over juridisk eierskap.',status:'Hans standing måler om spilleren lar et hull eller en gammel antakelse være synlig i stedet for å rydde systemet penere enn kunnskapsgrunnlaget tåler.',power_over_player:'Kan stoppe en uleselig handoff og kreve korrigert registrering, men kan ikke diagnostisere materiale eller autorisere fysisk behandling.',wants:'At neste forvalter kan se hva objektet er, hvor det har vært, hva som er gjort med det og hvilke spørsmål som fortsatt er åpne.',conceals:'Registreringssystemets orden kan friste til å gjøre et uavklart historisk eller teknisk spørsmål sikrere enn det faktisk er.',speech_style:'Kronologisk og versjonsbevisst; spør hvilken opplysning som endret seg, hvem som endret den og hva den nye versjonen påvirker.',teaches_player:'At bevaring krever et langt dokumentminne, ikke bare gode enkeltinngrep.'},
  {id:'samira_transport_klima_world',social_function:'Samira gjør klima-, pakke-, transport-, kurér- og mottakskrav til konkrete handoff-grenser mellom atelier og ekstern partner.',class_position:'Koordinator med reell kontroll over logistisk gjennomføring og avtalt miljø, men uten kompetanse til å senke konservatorens fysiske risikogrense.',status:'Hennes standing avhenger av om spilleren gir målbare, sporbare krav tidlig nok til at transporten kan planlegges uten muntlige snarveier.',power_over_player:'Kan holde en transport eller et utlån tilbake når avtalte vilkår mangler og kreve ny plan, men kan ikke erklære et verk behandlings- eller visningsklart på egen hånd.',wants:'At facility report, emballasje, klima, forsikring og mottak fungerer som én sporbar kjede fra avsender til etterkontroll.',conceals:'Sterk logistisk gjennomføringsevne kan skape press for å tolke det som kan transporteres som det som bør transporteres.',speech_style:'Operativ og måleorientert; spør hvilke vilkår som gjelder, hvem som eier avviket og hva som må dokumenteres før neste håndtering.',teaches_player:'At transport ikke er en pause i bevaringsarbeidet, men en fase med egne materialrisikoer og ansvar.'},
  {id:'mikkel_monteringsansvarlig_world',social_function:'Mikkel gjør møtet mellom lys, avstand, feste, sikkerhet, publikumsflyt og kunstverkets dokumenterte materialgrenser synlig.',class_position:'Utstillingsprodusent og monteringsansvarlig med praktisk produksjonsmakt, men uten konservatorfaglig behandlingskompetanse.',status:'Hans standing måler om spilleren gir tydelige vilkår og realistiske alternativer i tide, i stedet for å levere et sent faglig nei uten praktisk vei videre.',power_over_player:'Kan endre monterings- og produksjonsplan og stoppe usikkert praktisk arbeid, men kan ikke oppheve konservatorens stopp eller gjøre publikumsverdi til fysisk risikovurdering.',wants:'At produksjonen kan gjennomføres sikkert, presist og uten skjult improvisasjon når rammebetingelsene endrer seg.',conceals:'Produksjonslogikk kan gjøre en teknisk elegant løsning sosialt vanskelig å forkaste selv når nye tilstandsdata gjør den feil.',speech_style:'Konkret og løsningsorientert; spør hva som må endres i rom, lys, feste eller tidsplan for at kravet faktisk kan følges.',teaches_player:'At faglig ansvar blir sterkere når det oversettes til gjennomførbare grenser og alternativer.'},
  {id:'nora_materialforsker_world',social_function:'Nora representerer analyse- og forskningsblikket som kan gjøre tidligere sikre behandlingsantakelser usikre når nye materialdata kommer inn.',class_position:'Materialforsker med metode- og analysekompetanse, men uten automatisk behandlingsmandat eller personalmyndighet over konservatorrollen.',status:'Hennes standing avhenger av om spilleren bruker analyse til å korrigere beslutningsgrunnlaget uten å behandle instrumentresultat som hele verkets sannhet.',power_over_player:'Kan levere analyser, usikkerhetsintervaller og metodekritikk som bør endre risikovurderingen, men kan ikke alene velge inngrep eller overstyre eierskap og avtale.',wants:'At prøver, målinger og tolkning kobles eksplisitt til spørsmålene de faktisk kan besvare og til grensene for metoden.',conceals:'Teknisk presisjon kan gi falsk trygghet dersom prøvens representativitet, historisk kontekst eller praktisk relevans ikke er vurdert.',speech_style:'Metodisk og forbeholden; spør hva analysen faktisk måler, hva den ikke måler, og hvordan funnet endrer neste beslutning.',teaches_player:'At mer data ikke fjerner behovet for faglig skjønn, mandat og dokumentert usikkerhet.'},
  {id:'lina_kunstnerbo_rettighet_world',social_function:'Lina gjør kunstnerintensjon, dokumenterte instruksjoner, boets interesser og rettigheter til en egen kunnskaps- og myndighetslinje når behandling endrer synlig uttrykk.',class_position:'Representant for kunstnerbo eller rettighetshaver med bestemte kilder og samtykker, men uten automatisk konservatorfaglig eller institusjonell beslutningsmyndighet.',status:'Hennes standing måler om dialogen blir dokumentert og tatt alvorlig uten at ett ønske brukes som snarvei rundt fysisk tilstand eller faglig kompetanse.',power_over_player:'Kan gi relevante kilder, beskrive intensjon og utøve avtalte rettigheter, men kan ikke gjøre et risikofylt eller udokumentert inngrep fysisk forsvarlig.',wants:'At verkets identitet og intensjon behandles seriøst samtidig som endringer, usikkerhet og faktiske materialgrenser forblir synlige.',conceals:'Også en autorisert representant kan ha interesser som ikke sammenfaller perfekt med verkets langsiktige fysiske bevaring eller alle juridiske spørsmål.',speech_style:'Intensjons- og avtaleorientert; spør hva kunstneren dokumenterte, hva institusjonen har lovet og hva et inngrep vil gjøre synlig.',teaches_player:'At intensjon og rettigheter er viktige premisser, men ikke en erstatning for materialundersøkelse eller behandlingskompetanse.'},
  {id:'private_relation_world',social_function:'En nær relasjon gjør restkostnaden av skade, offentlig kritikk, stopp og faglig ansvar synlig uten å bli et uformelt konservatormøte hjemme.',class_position:'Privat nærperson uten profesjonell, juridisk eller institusjonell myndighet over kunstverket.',status:'Standing her måler tilstedeværelse, fortrolighet og om spilleren kan ha en identitet som ikke står og faller med prestisjen i et vellykket inngrep eller en synlig utstilling.',power_over_player:'Kan sette grenser for hva hjemmet tåler og utfordre spillerens selvfortelling, men kan ikke få fortrolig objektdokumentasjon eller autorisere behandling.',wants:'At spilleren kan snakke sant om belastning og tvil uten å dele sensitive opplysninger eller gjøre privat støtte til faglig fasit.',conceals:'Omsorg kan friste til for enkle råd når profesjonell usikkerhet faktisk må få stå åpen til neste dokumenterte kontrollpunkt.',speech_style:'Nær og jordnær; spør hva spilleren bærer og hva som kan legges igjen på jobb, ikke hvem som vant den faglige konflikten.',teaches_player:'At korrigerbarhet også krever et privat liv der profesjonell status kan falle uten at hele identiteten kollapser.'}
];

const slowAxes = [
  ['material_judgment','Materialskjønn','Utvikles gjennom presis observasjon, analysegrunnlag, dokumentert usikkerhet og evnen til å endre plan når verkets fysiske premisser endrer seg.'],
  ['intervention_traceability','Inngrepssporbarhet','Utvikles når tidligere og nye behandlinger, begrunnelse, utførelse, reversibilitet og etterkontroll kan rekonstrueres.'],
  ['competence_discipline','Kompetansedisiplin','Utvikles gjennom respekt for qualification_required, employer_appointment, egne ferdighetsgrenser og behovet for riktig spesialist.'],
  ['preventive_stewardship','Forebyggende forvaltning','Utvikles gjennom klima, lys, håndtering, emballasje, montering og risikoarbeid som hindrer skade før behandling blir nødvendig.'],
  ['loan_transport_reliability','Utlåns- og transportpålitelighet','Utvikles gjennom tydelige vilkår, facility report, forsikring, transportplan, mottakskontroll og sporbar avvikshåndtering.'],
  ['handoff_reliability','Handoff-pålitelighet','Utvikles gjennom versjon, eier, waiting-state og overlevering som ikke skjuler tidligere inngrep eller gjenværende usikkerhet.'],
  ['correction_openness','Korrigeringsåpenhet','Utvikles når ny materialanalyse, skade eller dokumentasjon kan endre en tidligere beslutning uten at korreksjon blir statustap.'],
  ['professional_identity','Profesjonell identitet','Utvikles i spennet mellom faglig autoritet, prestisje, seniorstatus og evnen til å be om hjelp eller stoppe arbeid.'],
  ['private_sustainability','Privat bærekraft','Utvikles gjennom fortrolighet, restitusjon, søvn og evnen til å bære ansvar uten å gjøre hjemmet til arbeidsflate.']
].map(([id,label,description]) => ({id,label,description,runtime_binding:'editorial_only_until_governed'}));

const cases = [
  ['Baseline før prestisjeverket flyttes','Et profilert verk skal ut av magasin til undersøkelse og mulig visning. Objektloggen har riktig ID og plassering, men tidligere inngrep er ufullstendig beskrevet og produksjonen ønsker å begynne håndtering før alle feltene er avklart.','Hva må dokumenteres i baseline før fysisk bevegelse, hva kan stå som eksplisitt usikkerhet, og hvem eier neste kontrollpunkt?'],
  ['Aktiv skade før fotografering','Ny inspeksjon viser løs eller ustabil overflate akkurat før foto- og presseplanen. Skaden er avgrenset, men ekstra håndtering kan gjøre den større og tidspunktet har høy synlighet.','Skal fotograferingen stoppes, tilpasses eller flyttes, og hvilke observasjoner og kompetansegrenser må være dokumentert før ny håndtering?'],
  ['Tidligere restaurering endrer behandlingsbildet','Undersøkelse og eldre dokumentasjon viser at en synlig overflate delvis består av tidligere restaurering. Det påvirker både hva som kan fjernes, hva som er originalt og hvordan et nytt inngrep bør begrunnes.','Hvordan skilles faktisk materialfunn, tidligere behandling, analysebehov og ønsket estetisk resultat før ny behandling planlegges?'],
  ['Kosmetisk ønske møter kompetansegrensen','Et utstillingsteam ønsker at et område skal fremstå jevnere før åpning, men tiltaket er ikke nødvendig for stabilitet og krever kvalifisert vurdering av materiale og reversibilitet.','Hva kan konservatoren anbefale eller avslå innen mandat, og hva må eksplisitt stoppes før riktig kvalifikasjon eller seniorutnevnelse foreligger?'],
  ['Facility report mangler kritisk klimaopplysning','Et attraktivt utlån nærmer seg, men mottakerens facility report mangler stabil dokumentasjon av klima og beredskap i rommet der verket skal vises.','Hvilke vilkår kan settes nå, hva må vente, og hvorfor kan institusjonens prestisje eller partnerens omdømme ikke erstatte målegrunnlaget?'],
  ['Transporthendelsen som ikke synes utenpå','En støtregistrering eller annen transporthendelse rapporteres ved ankomst. Kassen ser hel ut, men hendelsen traff et verk med kjent sårbarhet og krever ny kontroll før videre håndtering.','Hvilke deler av tilstands-, transport- og mottakssporet må gjenåpnes, og hva kan ikke erklæres sikkert bare fordi synlig skade mangler?'],
  ['Lyssensitivt verk og ønsket visningsperiode','Et verk med dokumentert lysfølsomhet er planlagt vist lenger og sterkere enn tidligere bevaringsvilkår tilsier. Kuratorisk verdi og publikumsinteresse er reelle, men materialkostnaden akkumuleres.','Hvordan avgrenses lysdose, periode eller alternativ visning slik at kuratorisk betydning ikke blir falsk materialmyndighet?'],
  ['Monteringsløsningen belaster bærematerialet','En elegant montering fordeler belastning dårligere enn antatt etter ny måling og prøveoppsett. Produksjonen er langt kommet, men den dokumenterte fysiske grensen har endret seg.','Skal feste, ramme, plassering eller tidsplan endres, og hvordan dokumenteres rework uten å skjule at den første planen ble forkastet?'],
  ['Kunstnerintensjon og fysisk stabilisering trekker ulikt','Dokumenterte utsagn fra kunstner eller bo peker mot et bestemt visuelt uttrykk, mens dagens materialtilstand gjør en full tilbakeføring til uttrykket risikabel.','Hvordan kan intensjon, rettigheter, materialhistorie og fysisk risiko holdes sammen uten at én av dem late som den alene avgjør behandlingen?'],
  ['Forsikringsspørsmål etter ny skadeobservasjon','En ny skadeobservasjon kan påvirke forsikring, ansvar og videre utlån. Teamet ønsker raskt å avgjøre om skaden er gammel eller ny, men dokumentasjonen er ennå ikke sterk nok.','Hva kan registreres som observasjon, hva krever videre sammenligning eller ekstern vurdering, og hvem har myndighet til å ta forsikrings- og avtalesporet videre?'],
  ['Ny behandling må kunne leses om ti år','Et tiltak virker teknisk vellykket, men dokumentasjonen er for knapp til at en framtidig konservator vil forstå materialvalg, begrunnelse, utførelse og etterkontroll.','Hva må kompletteres før saken kan lukkes, og hvordan unngås at et visuelt godt resultat får erstatte sporbar behandlingshistorie?'],
  ['Kapasitetspress og senioransvar','Flere sårbare verk venter samtidig, og teamet mangler nok senior kapasitet. En erfaren konservator kan mye av arbeidet, men Senior konservator er fortsatt appointment_required og kan ikke oppstå gjennom uformell forventning.','Hvordan prioriteres arbeid, stopp og ekstern kompetanse uten å late som erfaring eller standing automatisk gir arbeidsgiverutnevnelse?'],
  ['Offentlig kritikk av et synlig inngrep','Et synlig behandlingsvalg blir kritisert av fagmiljø og publikum. Noe kritikk bygger på reell ny informasjon, noe på estetisk preferanse, og institusjonen må forklare beslutningen uten å omskrive dokumentasjonen.','Hva må publiseres eller korrigeres, hvilke faglige spørsmål gjenåpnes, og hvordan skilles materialkunnskap fra omdømmeforsvar?'],
  ['Sesongen avsluttes med et lesbart behandlingsminne','Flere verk har endret tilstand, behandling, transport- eller visningsstatus gjennom perioden. Noen saker er lukket, andre står riktig nok fortsatt i waiting-state.','Hvordan overleveres objektloggene slik at neste forvalter ser hva som ble observert, behandlet, avvist, utsatt og fortsatt må kontrolleres uten en kunstig heltefortelling om at alt ble løst?']
];

const environments = [
  'tilstands-, material- og behandlingsatelieret der observasjon, analyse, tidligere inngrep, kompetanse, behandlingsvalg, reversibilitet og etterkontroll må forbli adskilte og sporbare',
  'magasin- og objektloggen der identitet, plassering, tidligere behandling, versjon og ventepunkt følger kunstverket før hver ny håndtering',
  'utlåns-, forsikrings-, transport- og klimabordet der facility report, emballasje, avtale, klima, kurérbehov, mottak og avvik møter den konservatorfaglige risikovurderingen',
  'utstillings- og monteringsflaten der lys, feste, ramme, avstand, sikkerhet, publikumsplan og visningsperiode må underordnes dokumenterte materialgrenser',
  'analyse- og forskningsgrensen der nye materialdata kan korrigere behandlingsgrunnlaget uten å bli forvekslet med automatisk beslutningsmyndighet',
  'kunstner-, bo- og rettighetsdialogen der intensjon og samtykke kan være viktige premisser uten å erstatte fysisk undersøkelse, kvalifikasjon eller institusjonelt mandat',
  'offentlig korrigeringsrom der institusjonen må kunne forklare skade, inngrep, endret behandling eller ny kunnskap uten å skjule tidligere versjon',
  'privatlivet der stresset ved skade, stopp og kritikk kan bearbeides uten at fortrolig objektdokumentasjon, behandlingsbilder eller personalsaker følger med hjem'
];

const phaseInfo = {
  morning:{beat_type:'task',focus:'Morgenen etablerer det versjonerte kunstverksobjektet før tempoet tar over. Spilleren må åpne loggen, skille observasjon fra analyse og behandlingsønske, navngi hvem som eier neste kontroll og markere hva som fortsatt venter på kvalifikasjon, employer_appointment, materialanalyse, forsikring, facility report, transport eller monteringsendring.'},
  lunch:{beat_type:'relationship',focus:'Lunsjfasen flytter saken inn i en relasjon der en annen aktør bærer en annen type kunnskap, ansvar eller risiko. Samme stopp eller tiltak kan derfor styrke standing hos ett publikum og skape frustrasjon hos et annet uten at reaksjonene summeres til én global reputation score eller blir fysisk evidens.'},
  afternoon:{beat_type:'decision',focus:'Ettermiddagen tvinger fram en avgrenset beslutning, anbefaling, behandling eller stopp. Spilleren må angi hva som kan avgjøres innen kompetanse og mandat, hva som fortsatt er waiting-state, og hvilket kontrollpunkt som gjør beslutningen korrigerbar når ny tilstand, analyse, transporthendelse eller avtale endrer grunnlaget.'},
  evening:{beat_type:'private_consequence',focus:'Kvelden viser restkostnaden av å bære ansvar for et sårbart kunstverk. Spilleren må tåle tvil, kritikk eller tap av prestisje uten å dele fortrolig objektdokumentasjon privat, og uten å bruke en nær relasjon som uformell konservator, arbeidsgiver, forsikringsgiver eller beslutningsorgan.'}
};

const phases = ['morning','lunch','afternoon','evening'];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  const [caseTitle, setup, question] = cases[day - 1];
  for (let p = 0; p < phases.length; p += 1) {
    const phase = phases[p];
    const info = phaseInfo[phase];
    const flat = (day - 1) * 4 + p;
    const audience = audiences[flat % audiences.length];
    const sourceRef = canonicalRefs[flat % canonicalRefs.length];
    const summary = `Dag ${day}, ${phase}: ${caseTitle}. ${setup} ${info.focus} Det vedvarende arbeidsobjektet er hele tiden ${PERSISTENT}: objekt-ID og proveniens, materialer og teknikk, tilstand og skade, tidligere inngrep, analysegrunnlag, kompetanse- og utnevnelsesgrense, behandlingsforslag og faktisk utført tiltak, reversibilitet, klima, utlån, forsikring, pakking, transport, montering, visningsvilkår, waiting-state, handoff, beslutning og avgrenset rework skal kunne rekonstrueres. Dagens konserveringsfaglige spørsmål er: ${question} Rollen må samtidig bevare de to canonicale løkkene — undersøk, dokumenter, risikovurder, tiltak, kontroll og dokumenter resultat; og forespørsel, tilstand, miljøkrav, transportkrav, faglig anbefaling og oppfølging. Spilleren får ikke løse presset ved å utføre udokumenterte inngrep, endre verk av kosmetiske grunner alene, skjule skade eller usikkerhet eller overstyre juridisk eierskap eller forsikringsbeslutninger. Career-portene forblir title-owned: Konservator er qualification_required med relevant_education_or_employer_qualification; Senior konservator er appointment_required og krever både relevant kvalifikasjon og employer_appointment. Ingen standing, History Go, Badge, erfaring eller sesongbeat endrer dette. Denne ${info.beat_type}-scenen bruker canonical mail-proveniens ${sourceRef} som delivery-anker og legger ingen ny runtime eller parallell sceneformat til systemet. Det redaksjonelle minnet er situert: akkurat ${audience.id} observerer denne fasen og kan senere huske hvordan spilleren håndterte materiale, grense, dokumentasjon og handoff.`;
    const standing = `Situert konsekvens for ${audience.id} på aksen ${audience.standing_axis}: Dag ${day}/${phase} blir ikke oversatt til én global reputation score. Gruppen vurderer særlig ${audience.cares_about[0]} og ${audience.cares_about[1]}. Samme handling kan derfor styrke tillit her og skape skepsis hos en annen gruppe uten at noen reaksjon automatisk blir materialdiagnose, juridisk fasit eller institusjonelt vedtak. Standing kan påvirke hvor tidlig tvil meldes, hvor mye kontekst spilleren får, hvor villige aktører er til å ta en vanskelig handoff og hvordan en senere korreksjon tolkes. Den kan ikke skrive om kunstverksloggen, produsere ny fysisk evidens eller oppheve Career- og authority-grensene. ${audience.cannot_grant} Den sosiale hukommelsen fra ${caseTitle} kan vende tilbake i senere beat, men behandling, kvalifikasjon, utnevnelse, forsikring, transport, eierskap, delegasjon og budsjett må fortsatt komme fra sine egne legitime prosesser, dokumenter og ansvarslinjer.`;
    coverage.push({day,phase,beat_type:info.beat_type,title:`${caseTitle} — ${phase}`,summary,standing_audience:audience.id,standing_consequence:standing,materialization_refs:[sourceRef]});
  }
}

const primaryThreads = [
  {id:'eva_materialgrense_under_prestisjepress',relationship:'Eva og spilleren følger flere kunstverk der materialrisiko, tidligere inngrep og estetisk forventning kolliderer med kalenderen. Relasjonen utvikles etter om spilleren respekterer qualification_required og appointment_required når et stopp koster synlighet, og om nye data faktisk får korrigere et tidligere behandlingsønske uten statusskamp.',beat_refs:['2/morning','2/afternoon','3/lunch','4/afternoon','7/morning','11/afternoon','14/afternoon']},
  {id:'jonas_objektminne_og_versjon',relationship:'Jonas og spilleren bygger et langt objektminne der plassering, tidligere behandling, usikkerhet og senere korreksjoner forblir synlige. Tråden tester om loggen kan bære både praktisk handoff og faglig tvil, eller om institusjonen gradvis gjør historikken penere enn neste konservator trenger.',beat_refs:['1/morning','1/afternoon','3/afternoon','6/morning','10/lunch','11/morning','14/morning']},
  {id:'samira_transport_klima_og_partnerhukommelse',relationship:'Samira og spilleren følger et utlån gjennom facility report, klima, emballasje, transport, hendelse og mottak. Relasjonen husker om vilkår ble dokumentert tidlig, om avvik ble gjenåpnet uten skyldskjuling og om partnerpress noen gang fikk late som logistisk mulighet var det samme som fysisk forsvarlighet.',beat_refs:['5/morning','5/afternoon','6/morning','6/afternoon','10/afternoon','12/lunch','14/lunch']},
  {id:'mikkel_monteringsalternativ_og_usynlig_arbeid',relationship:'Mikkel og spilleren må oversette konservatorfaglige grenser til konkrete endringer i lys, feste, avstand og tidsplan. Tråden viser om et faglig stopp ledsages av lesbare alternativer, og om produksjonslaget får rettidig handoff i stedet for å arve skjult usikkerhet som praktisk improvisasjon.',beat_refs:['2/lunch','7/lunch','7/afternoon','8/morning','8/afternoon','12/afternoon','14/afternoon']},
  {id:'nora_analyse_og_korrigerbart_skjonn',relationship:'Nora og spilleren arbeider med analyser som gjør enkelte tidligere antakelser sterkere og andre svakere. Tråden tester om instrumentdata brukes med metodeforbehold og kobles til beslutningsspørsmålet, eller om teknisk presisjon blir en ny statusform som presser bort konservatorens samlede materialskjønn.',beat_refs:['3/morning','3/afternoon','4/lunch','9/morning','10/morning','11/lunch','13/afternoon']},
  {id:'lina_intensjon_rettighet_og_materialhistorie',relationship:'Lina og spilleren må holde kunstnerintensjon, dokumenterte instruksjoner, rettigheter, tidligere inngrep og dagens materialtilstand sammen uten å gjøre én kilde til total myndighet. Relasjonen utvikles etter om dialog kan endre behandlingsgrunnlaget samtidig som fysisk risiko og profesjonell kompetanse forblir selvstendige grenser.',beat_refs:['4/morning','5/lunch','8/lunch','9/morning','9/afternoon','13/lunch','14/morning']},
  {id:'privat_grense_og_profesjonell_identitet',relationship:'Den private tråden viser hvordan skade, synlige behandlingsvalg, prestisje og kritikk kan feste seg i spillerens identitet. Spilleren må finne språk for ansvar og tvil uten å dele fortrolig materiale eller bruke hjemmet som bekreftelse på at egen faglige standing bør vinne neste arbeidsdag.',beat_refs:['1/evening','3/evening','6/evening','8/evening','10/evening','13/evening','14/evening']}
];

const privateAftermath = [
  {id:'verket_som_ble_stoppet_for_pressen',description:'Etter at fotografering og presseplan stoppes på grunn av aktiv skade, kjenner spilleren tapet som personlig og institusjonelt nederlag selv om stoppet var riktig. Hjemme må skuffelsen kunne deles uten tilstandsbilder, navn eller interne vurderinger, og uten at Eva gjøres til motstander for å ha holdt materialgrensen.',materialization_refs:[canonicalRefs[1]]},
  {id:'behandlingsvalget_som_ikke_ble_gjort',description:'Et kosmetisk ønsket inngrep blir avvist fordi kompetanse, reversibilitet eller faglig behov ikke er tilstrekkelig. Etterspillet undersøker om det å la være å handle kan oppleves som profesjonelt arbeid, uten at spilleren kompenserer med statussøk eller deler fortrolig objektdokumentasjon for å få privat støtte.',materialization_refs:[canonicalRefs[4]]},
  {id:'transporthendelsen_folger_med_hjem',description:'Etter en transporthendelse finnes ennå ingen sikker konklusjon om skade. Spilleren må tåle waiting-state gjennom kvelden uten å rekonstruere hendelsen privat med bilder og partneropplysninger, og uten å gjøre fravær av synlig skade til beroligende pseudo-evidens før ny kontroll.',materialization_refs:[canonicalRefs[8]]},
  {id:'kritikk_etter_synlig_inngrep',description:'Når et behandlingsvalg kritiseres offentlig, oppstår skam og forsvarstrang selv om dokumentasjonen viser et begrunnet valg. Etterspillet undersøker om kritikk kan brukes til avgrenset ny vurdering uten omdømmevask, skyldforskyvning eller behov for at en nær person bekrefter at den faglige beslutningen må ha vært riktig.',materialization_refs:[canonicalRefs[11]]},
  {id:'sesongslutt_uten_konservatorhelt',description:'På siste kveld må spilleren beskrive perioden uten å gjøre seg selv til den som reddet samlingen. Et verk som fortsatt venter på analyse, en transport som ble avlyst og et inngrep som ble korrigert kan være tegn på ansvar dersom neste forvalter overtar et sannere og mer lesbart material- og beslutningsspor.',materialization_refs:[canonicalRefs[14]]}
];

const delayedConsequences = [
  {id:'baseline_blir_senere_skadeanalyse',setup_ref:'1/afternoon',return_ref:'10/morning',domains:['job','reputation'],description:'Kvaliteten på baseline dag 1 påvirker hvor sikkert teamet senere kan skille ny skade fra eldre tilstand og tidligere inngrep.'},
  {id:'bevaringsstopp_blir_varslingsvilje',setup_ref:'2/afternoon',return_ref:'7/morning',domains:['relationship','job'],description:'Om Eva ble støttet ved første synlige stopp påvirker hvor tidlig hun løfter et senere lys- og visningsproblem.'},
  {id:'gammel_restaurering_blir_behandlingshukommelse',setup_ref:'3/afternoon',return_ref:'11/morning',domains:['job','reputation'],description:'Hvordan tidligere restaurering ble dokumentert former hvor lesbar en ny behandling blir for framtidige konservatorer.'},
  {id:'kompetansegrense_blir_senioransvar',setup_ref:'4/afternoon',return_ref:'12/afternoon',domains:['relationship','job'],description:'Om qualification_required ble respektert tidlig påvirker hvordan teamet senere håndterer appointment_required under kapasitetsmangel.'},
  {id:'facility_report_blir_partnerhukommelse',setup_ref:'5/afternoon',return_ref:'10/lunch',domains:['relationship','reputation'],description:'Et tydelig ventepunkt rundt mottaksklima påvirker om partnerne senere tolker forsikrings- og skadeavklaringen som ansvarlig eller som ny mistillit.'},
  {id:'transporthendelse_blir_rework_kvalitet',setup_ref:'6/afternoon',return_ref:'11/afternoon',domains:['job','reputation'],description:'Hvor presist transporthendelsen ble gjenåpnet påvirker om senere behandlingsdokumentasjon kan avgrense gammel og ny påvirkning.'},
  {id:'monteringsrework_blir_samarbeid',setup_ref:'8/afternoon',return_ref:'14/lunch',domains:['relationship','job'],description:'Hvordan den første monteringsplanen ble forkastet påvirker om produksjonslaget ved sesongslutt stoler på nye faglige grenser og handoff.'},
  {id:'privat_grense_blir_korrigerbarhet',setup_ref:'13/evening',return_ref:'14/morning',domains:['relationship','job'],description:'Evnen til å legge fra seg offentlig kritikk noen timer påvirker om sluttgjennomgangen blir defensiv eller faktisk lærende.'}
];

const authoritySeparation = 'Det finnes ingen global reputation score som kan konverteres til evidens, kildeautoritet eller konservatorfaglig sannhet. Standing hos konservatorer, registrarer, kuratorer, långivere, forsikrere, transportpartnere, kunstnere, rettighetshavere, forskere, operativt personale eller private relasjoner kan påvirke samarbeid og senere tolkning av spillerens valg, men kan ikke gi qualification_required, skape employer_appointment eller appointment_required, ansette eller utnevne, gi delegasjon, budsjett eller institusjonelt vedtak, produsere materialdiagnose, autorisere behandling, klarere forsikring eller transport eller avgjøre juridisk eierskap. History Go og Badge kan skjerpe spørsmål, aldri gi disse fullmaktene.';

const world = {
  schema:'civication_role_world_v1',version:1,category:CATEGORY,role_scope:ROLE,
  title:'Kunst / Konservering og samlingsbevaring — materialminne, behandlingsgrenser og situert tillit',status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan bevare og forvalte kunstverk når materialtilstand, tidligere inngrep, estetisk forventning, utstillingsprestisje, utlån, transport, forsikring og profesjonell kompetanse trekker i ulike retninger — uten å gjøre standing til materialdiagnose eller seniorstatus til en erstatning for kvalifikasjon og arbeidsgiverutnevnelse?',
    description:'Konserveringsarbeidet organiseres rundt kunstverk som har en fysisk historie som fortsetter gjennom hvert nytt inngrep, klima, utlån og visningsvalg. Sesongen gjør standing situert: konservatorer husker om materialgrensen ble respektert, registrarer om objektminnet var lesbart, kuratorer om alternativer ble forklart, transportpartnere om vilkår var tydelige, kunstner- og rettighetsmiljø om intensjon ble dokumentert uten å bli falsk behandlingsmyndighet, operativt personale om handoff kom i tide, framtidige forvaltere om korreksjoner ble bevart, og privatlivet om spilleren kan bære ansvar uten å gjøre faglig status til hele identiteten.'
  },
  theme_ids:themeIds,social_environments:environments,recurring_people_archetypes:recurringPeople,slow_axes:slowAxes,
  situated_reputation_model:{global_score_allowed:false,audiences,divergence_examples:[
    'Å stoppe fotografering på grunn av aktiv skade kan styrke standing hos konservatorer og framtidige forvaltere, samtidig som kommunikasjon og utstillingsteam opplever tap av tid og synlighet.',
    'Å avslå et kosmetisk inngrep kan styrke materialfaglig tillit og samtidig frustrere en kurator eller rettighetshaver som ønsket et bestemt visuelt uttrykk.',
    'Å holde et utlån åpent til facility report er komplett kan styrke forsikrings- og transporttillit, samtidig som långiver eller ledelse tolker institusjonen som lite smidig.',
    'Å gjenåpne tilstandsloggen etter en transporthendelse kan oppfattes ansvarlig av framtidige konservatorer og samtidig som belastende mistillit hos en logistikkpartner.',
    'Å synliggjøre tidligere restaurering i dokumentasjon og formidling kan styrke forsker- og fagmiljøets tillit, samtidig som noen publikums- eller eierskapsaktører foretrekker en enklere originalfortelling.',
    'Å publisere en korrigering av et synlig behandlingsvalg kan svekke kortsiktig omdømme og samtidig styrke langsiktig standing hos fagmiljø, forskere og framtidige forvaltere.'
  ],authority_separation:authoritySeparation},
  history_go_affordance:{
    source_ref:knowledgeRef,badge_id:'kunst',
    better_question:'History Go kan fungere som et kunsthistorisk og kildekritisk forstørrelsesglass når et kunstverk behandles som om dagens overflate var hele historien. Spilleren kan undersøke teknikk, verkstedpraksis, kunstnerens materialvalg, eldre restaureringer, utstillingshistorikk, dokumenterte beskrivelser og hvordan attribusjon eller tolkning har endret seg. Det bedre spørsmålet er ikke «hvordan får vi verket til å se mest mulig riktig ut?», men «hvilke kilder og fysiske observasjoner dokumenterer materialhistorien; hvilke spor kan skyldes tidligere inngrep eller aldring; hva krever ny analyse; og hvilke kunsthistoriske antakelser må holdes adskilt fra faktisk tilstand og behandlingskompetanse før et tiltak vurderes?»',
    authority_boundary:'History Go kan ikke gi qualification_required-konserveringskompetanse, kan ikke skape employer_appointment eller appointment_required, ansette eller utnevne, gi delegasjon eller budsjett, fatte behandlings- eller institusjonsvedtak, diagnostisere eller autentisere materialtilstand, autorisere behandling, klarere forsikring eller transport, avgjøre juridisk eierskap eller gjøre et Kunst-Badge til konservatorfaglig fasit. Det kan bare gjøre kunsthistoriske, materialhistoriske og kildekritiske spørsmål bedre.'
  },
  cross_role_proof:{status:'not_materialized_no_shared_work_object',shared_work_object_found:false,required_for_rollout:false,new_runtime:false,rule:'Cross-role er not_required_for_rollout. Ingen kobling til kuratering, museumsledelse, utstillingsproduksjon, kunstnerisk praksis eller eksterne transportpartnere materialiseres bare fordi de berører samme kunstverk. Et senere cross-role-spor krever et reelt delt arbeidsobjekt med identisk ID, versjon, eier og handoff-kontrakt; ellers forblir relasjonene redaksjonelle i denne Role World-en.'},
  season:{days:14,day_phases:phases,coverage},primary_threads:primaryThreads,private_aftermath:privateAftermath,delayed_consequences:delayedConsequences,
  existing_work_continuity:{work_loops:grammar.work_loops,persistent_work_object:PERSISTENT,waiting_states:grammar.rhythm_contract.waiting_states,handoff_rule:grammar.persistent_work_object_contract.handoff_rule,rework_rule:grammar.rhythm_contract.rework_rule,new_runtime_state:false},
  editorial_uniqueness:{
    statement:'Denne verdenen er ikke en omskriving av Historie/Museum og samling, Kunst/Utstillingsproduksjon eller Kunst/Kunstnerisk ledelse. Den organiserer 14 dager rundt kunstverkets fysiske og dokumenterte materialhistorie: tilstand, tidligere inngrep, analyse, behandling, reversibilitet, klima, utlån, forsikring, transport, montering og senere kontroll møtes i ett vedvarende objekt uten at kuratorisk prestisje, kunstnerintensjon, logistisk gjennomførbarhet eller sosial standing får eie hele den fysiske sannheten.',
    forbidden_shortcut:'Ingen eksisterende Role World-tekst eller plot kopieres. Bare canonical struktur, policy og de allerede materialiserte Kunst / Konservering og samlingsbevaring-prerequisitene gjenbrukes.'
  },
  materialization:{authored_dimensions:['situated_reputation'],no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,cross_role_link_materialized:false,source_refs:canonicalRefs}
};

write(WORLD, world);
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
write(INDEX, index);
checklist.reference_worlds.push(WORLD);
write(CHECKLIST, checklist);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = themeIds;
write(THEMEBANK, themeBank);

const source = `# Kunst / Konservering og samlingsbevaring — Role World rollout source-first\n\n## Scope lock\n- Canonical key: ${KEY}.\n- Existing roleModel, workGrammar, 16-step plan, four fictional People, four work surfaces, 15 canonical mails and persistent object are preserved.\n- Only remaining authored readiness dimension before this rollout: situated_reputation.\n- No new runtime and no parallel scene format.\n\n## Employment and authority invariants\n- Konservator: qualification_required with relevant_education_or_employer_qualification.\n- Senior konservator: appointment_required with relevant_education_or_employer_qualification plus employer_appointment.\n- Standing cannot grant qualification, appointment, treatment competence, insurance, transport approval, ownership, evidence, delegation, budget or institutional decision.\n\n## Editorial uniqueness\nThe world is material- and intervention-centred rather than generic museum work: condition, material analysis, prior interventions, treatment, reversibility, preventive conservation, climate, loan, insurance, transport, mounting and follow-up remain distinct but meet in one versioned work object. The 14-day season is not copied from another Role World.\n\n## Situated reputation\nEight bounded audiences keep separate standing axes. There is explicitly no global reputation score. Divergent reactions affect later cooperation and memory, not material truth or formal authority.\n\n## Cross-role\nStatus: not_materialized_no_shared_work_object. Cross-role is not_required_for_rollout until a genuinely shared work object with identical identity, version and handoff contract exists.\n\n## History Go\nHistory Go supports art-historical context, source criticism, technique and material-history questions. It cannot diagnose material condition, grant qualification or employer appointment, authorize treatment, clear insurance or transport, decide ownership or turn a Kunst Badge into conservation authority.\n\n## Quality gate\n30/30 role-specific editorial and provenance checks are encoded in the focused rollout test: exact identity; preserved loops; exact persistent object; exact title-owned Career gates; exact authority boundary; 15/15 canonical mail provenance; 8 separated audiences; no global reputation score; 9 slow axes; History Go boundary; cross-role quarantine; 14 days x 4 phases; 56 unique long-form beats; every canonical mail reused at least three times; 7 multi-day primary threads; 5 private aftermaths; 8 delayed consequences; index/checklist/theme registration; readiness removal from queue; Career runtime preservation; and source-first invariants.\n`;
writeText(SOURCE, source);

console.log(`Materialized ${WORLD}`);
console.log(`Canonical mail refs: ${canonicalRefs.length}`);
console.log(`Season beats: ${coverage.length}`);
console.log(`Audiences: ${audiences.length}; threads: ${primaryThreads.length}; aftermath: ${privateAftermath.length}; delayed: ${delayedConsequences.length}`);
