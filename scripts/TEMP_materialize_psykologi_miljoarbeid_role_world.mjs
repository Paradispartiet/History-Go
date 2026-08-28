#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
};

const ROLE = 'psykologi_miljoarbeid';
const KEY = 'psykologi/psykologi_miljoarbeid';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/psykologi_miljoarbeid.json';
const refs = [
  'data/Civication/mailFamilies/psykologi/job/psykologi_miljoarbeid_job.json#psykologi_miljoarbeid_job_vaktstart',
  'data/Civication/mailFamilies/psykologi/people/psykologi_miljoarbeid_people.json#psykologi_miljoarbeid_people_autonomi',
  'data/Civication/mailFamilies/psykologi/conflict/psykologi_miljoarbeid_conflict.json#psykologi_miljoarbeid_conflict_fortrolighet',
  'data/Civication/mailFamilies/psykologi/event/psykologi_miljoarbeid_event.json#psykologi_miljoarbeid_event_eskalering',
  'data/Civication/mailFamilies/psykologi/knowledge/psykologi_miljoarbeid_knowledge.json#psykologi_miljoarbeid_knowledge_dokumentasjon',
  'data/Civication/mailFamilies/psykologi/followup/psykologi_miljoarbeid_followup.json#psykologi_miljoarbeid_followup_fagkontakt',
  'data/Civication/mailFamilies/psykologi/consequence/psykologi_miljoarbeid_consequence.json#psykologi_miljoarbeid_consequence_neste_vakt'
];
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThreads = {
  morning:'observation_label_repair',
  lunch:'autonomy_and_relationship',
  afternoon:'boundary_safety_handoff',
  evening:'shift_afterlife_and_professional_mask'
};
const dayThemes = [
  'Vakten begynner med at ordet «deprimert» står i overleveringen mens det observerbare grunnlaget bare er tre avlyste frokoster. Elias-sporet åpnes som et vedvarende arbeidsobjekt der hendelser, personens egne ord, usikkerhet og neste observasjon må holdes adskilt.',
  'Elias sier nei til verkstedet selv om aktiviteten tidligere har vært viktig for ham. Miljøarbeideren må bevare autonomi under tidspress, notere hva som faktisk ble tilbudt og la neste steg bygge på hans eget valg fremfor skjult tvang.',
  'En fortrolig samtale glir over i alvorlig sikkerhetsbekymring. Relasjonen beskyttes ved å forklare grensen før informasjon deles videre, og Elias-sporet må vise hva personen selv sa, hva miljøarbeideren ikke kan vurdere klinisk og hvem som eier eskaleringen.',
  'Konflikten i fellesrommet krever rask handling uten pseudo-klinisk forklaring. Miljøarbeideren regulerer miljøet, skaper avstand og følger sikkerhetsrutinen, mens arbeidsobjektet gjør det synlig hva som skjedde før, under og etter hendelsen.',
  'Et kort notat skal overleve til neste vakt uten å gjøre «aggressiv», «ustabil» eller andre tolkningsord til personfakta. Dokumentasjonen revideres slik at atferd, kontekst, respons og det som fortsatt er ukjent kan leses uavhengig av forfatterens status.',
  'Sigrid som psykologfaglig kontakt trenger førstelinjens situasjonskunnskap før hun vurderer videre. Miljøarbeiderens verdi ligger i konkret tidslinje og Elias sine egne ord, ikke i å selge en diagnose eller behandlingsanbefaling.',
  'Neste vakt arver Elias-sporet og oppdager at tidligere språk allerede har endret hvordan teamet møter ham. Arbeidsobjektet går fra dokumentasjon til reparasjon: hvem retter sporet, hva forklares til Elias og hva må teamet slutte å gjenta som sikkert faktum.',
  'Elias møter teamet med mindre tillit og færre ord. Miljøarbeideren må tåle at god reparasjon ikke gir umiddelbar sosial gevinst, samtidig som neste observasjon og reelt valg får større plass enn ønsket om å få relasjonen raskt tilbake.',
  'En erfaren kollega foretrekker korte praktiske merkelapper fordi de virker effektive i vaktskiftet. Miljøarbeideren bruker den samme arbeidsflaten til å vise at presisjon kan være mer handlingsbar enn en rask forklaring når flere ansatte skal forstå samme person over tid.',
  'Pårørende ønsker trygghet og mer informasjon etter den vanskelige uka. Samarbeid skal være respektfullt, men standing hos pårørende kan ikke gi tilgang til opplysninger, klinisk myndighet eller rett til å overstyre Elias sine valg utover det gyldige grunnlaget faktisk tillater.',
  'Teamleder vil ha tydeligere framdrift og færre åpne spørsmål før neste møte. Miljøarbeideren kan skjerpe overleveringen og ansvarslinjen, men må la usikkerhet stå når den bare kan avklares av Elias, senere observasjon eller riktig fagperson.',
  'En ny hverdagsobservasjon ser ut til å støtte noe av den gamle tolkningen, men ikke hele den. Arbeidsobjektet viser hvorfor ett bekreftende tegn ikke gjør tidligere merkelapp riktig; sporbarheten gjør det mulig å revidere uten å late som historikken aldri påvirket praksis.',
  'Det oppstår et nytt sikkerhetssignal på en travel vakt. Miljøarbeideren bruker etablerte grenser, deeskalering og handoff igjen, mens standing kan utvikle seg ulikt hos Elias, kollega, leder og psykologfaglig kontakt fordi de vurderer ulike deler av arbeidet.',
  'Perioden avsluttes med et Elias-spor som fortsatt har åpne spørsmål, men langt tydeligere eierskap. Miljøarbeideren kan beskrive hva neste vakt skal følge, hva fagkontakten eier og hva Elias selv har sagt, uten å gjøre profesjonell tillit til global prestisje eller klinisk autoritet.'
];
const phaseTail = {
  morning:'Morgenen oppdaterer bare det som er observerbart og eksplisitt bekreftet, og holder tidligere merkelapper, diagnoseantakelser og sosial status utenfor faktakolonnen.',
  lunch:'Lunsjflaten gjør autonomi og situert standing synlig hos den aktuelle relasjonen, men tillit kan aldri gi miljøarbeideren behandlingsmandat, diagnosemyndighet eller rett til grenseløs informasjonsdeling.',
  afternoon:'Ettermiddagen krever et konkret støtte-, dokumentasjons-, deeskalerings- eller handoff-valg og skriver hvem som eier neste steg når klinisk eller sikkerhetsmessig vurdering går utenfor rollen.',
  evening:'Kvelden viser hva vakten gjør med personen som arbeider tett på andre, og trener på å legge fra seg ansvar som allerede er dokumentert og overlevert uten å gjøre uferdig arbeid til privat moralsk svikt.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type: phaseTypes[phase],
      summary: `Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids: [phaseThreads[phase]],
      materialization_refs: [refs[((day - 1) * 4 + pi) % refs.length]]
    });
  }
}

const theme_ids = ['professional_culture','bureaucratic_power','status_anxiety','shame_reputation','loyalty_up_down','social_mask','precarity','care_vs_efficiency'];

const persistent_work_object_model = {
  id:'elias_observation_handoff_record',
  title:'Elias-sporet — observasjon, støtte, overlevering og reparasjon',
  runtime_binding:'editorial_only_existing_pipeline',
  new_runtime_state:false,
  canonical_plan_id:'psykologi_miljoarbeid_pilot_v1',
  fields:['observable_facts','person_voice','support_action','uncertainty','escalation_owner','next_shift_watch','repair_trace'],
  rule:'Arbeidsobjektet skal bevare konkret observasjon og Elias sin egen stemme gjennom overlevering og handoff uten å gjøre tolkning til diagnose. Miljøarbeiderens situasjonskunnskap skal være nyttig for riktig klinisk eller sikkerhetsmessig myndighet, men kan aldri erstatte den.',
  lifecycle:[
    {id:'precise_handover',meaning:'Vaktstarten renser overleveringen for ubegrunnede diagnoseord og etablerer observerbare fakta, usikkerhet og neste konkrete observasjon.'},
    {id:'autonomy_support',meaning:'Elias sine valg og prioriteringer skrives inn i samme spor slik at støtte kan justeres uten å bli skjult tvang eller et mål om lydighet.'},
    {id:'boundary_disclosure',meaning:'Når fortrolighet møter alvorlig bekymring dokumenteres hva som ble sagt om grensen, hva Elias selv fortalte og hvorfor ansvaret må deles.'},
    {id:'deescalation_and_escalation',meaning:'Akutt miljøregulering og sikker handoff registreres uten klinisk forklaring; riktig ansvarseier blir eksplisitt.'},
    {id:'neutral_documentation',meaning:'Hendelse, kontekst og respons beskrives slik at neste vakt kan gjøre egen vurdering uten å arve en stigmatiserende personmerkelapp.'},
    {id:'professional_followup',meaning:'Psykologfaglig kontakt mottar konkret tidslinje og personens egne ord; førstelinjen markerer hva den ikke kan konkludere om.'},
    {id:'next_shift_repair',meaning:'Senere konsekvens av språk og praksis korrigeres både i dokumentasjon, teamrutine og forklaring til Elias før sporet går tilbake til ny observasjon.'}
  ],
  ownership:[
    {actor:'miljoarbeider',owns:'konkret observasjon, praktisk støtte, autonomistøtte, profesjonell grensesetting, deeskalering og nøytral dokumentasjon innen egen rolle'},
    {actor:'service_user',owns:'egne valg, egne mål, egne opplevelser og egne ord om hva som hjelper eller skader tillit'},
    {actor:'team_lead',owns:'lokal drift, sikkerhetskoordinering og avklaring av hvem som skal ta over når rutiner krever eskalering'},
    {actor:'psychologist_contact',owns:'klinisk vurdering og videre faglig beslutning når problemstillingen krever psykologfaglig eller annen klinisk myndighet'},
    {actor:'next_shift',owns:'sin nye observasjon og sin konkrete oppfølging; neste vakt skal ikke behandle tidligere merkelapper som ferdige fakta'}
  ]
};

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere. Ingen global reputation-score kan brukes som diagnosegrunnlag, behandlingsmandat, taushetsunntak, sikkerhetsmyndighet eller bevis for at miljøarbeiderens tolkning er klinisk riktig.',
  audiences:[
    {id:'service_user',standing_axis:'service_user_standing',cares_about:['at nei og egne mål faktisk påvirker støtten','at grenser og eventuell eskalering forklares før eller så tydelig som mulig','at stigmatiserende språk repareres i praksis'],cannot_grant:'diagnosemyndighet, psykoterapimandat, rett til å endre behandling eller generell tillatelse til å bære klinisk ansvar alene'},
    {id:'experienced_colleague',standing_axis:'colleague_standing',cares_about:['praktisk informasjon som fungerer i neste skift','presisjon som fortsatt er rask nok til drift','at erfaring brukes uten å bli sikker forklaring'],cannot_grant:'klinisk myndighet, rett til å diagnostisere eller rett til å behandle en erfaringsbasert merkelapp som medisinsk eller psykologisk faktum'},
    {id:'team_lead',standing_axis:'team_lead_standing',cares_about:['trygg drift og riktig eskalering','etterprøvbare observasjoner og tydelige neste steg','at vakten bruker egen deeskaleringskompetanse før ansvar overleveres'],cannot_grant:'klinisk vurderingsmyndighet, behandlingsmandat eller rett til å tilsidesette rollegrenser bare fordi lederen ønsker raskere konklusjon'},
    {id:'psychologist_contact',standing_axis:'psychologist_contact_standing',cares_about:['konkret tidslinje og brukerens egne ord','tydelig skille mellom observasjon og tolkning','tidlig eskalering når klinisk vurdering kreves'],cannot_grant:'at miljøarbeideren blir psykolog, får psykoterapimandat eller kan endre behandling uten den kompetansen og myndigheten rollen faktisk krever'},
    {id:'next_shift',standing_axis:'next_shift_standing',cares_about:['overlevering som kan brukes uten å stemple personen','synlig usikkerhet og ansvarseier','reparasjonsarbeid som gjør tidligere feil sporbare'],cannot_grant:'at tidligere språk blir sant ved gjentakelse, klinisk myndighet eller rett til å gjøre kollegial tillit til diagnose- eller behandlingsgrunnlag'},
    {id:'relatives',standing_axis:'relative_standing',cares_about:['trygghet og respektfullt samarbeid','at bekymring blir tatt på alvor','at Elias fortsatt behandles som person med egne valg og grenser'],cannot_grant:'fri tilgang til opplysninger, klinisk beslutningsmyndighet, diagnosegrunnlag eller rett til å overstyre personvern og selvbestemmelse uten gyldig grunnlag'}
  ],
  divergence_examples:[
    'Å skrive om «deprimert» til konkrete hendelser kan senke kortsiktig standing hos en kollega som vil ha raske merkelapper, men øke standing hos neste vakt og psykologfaglig kontakt fordi sporet blir etterprøvbart.',
    'Å nekte å love full hemmeligholdelse kan svekke Elias sin umiddelbare tillit, men senere styrke relasjonen dersom eskaleringen er forklart tydelig og ansvar faktisk deles på en trygg måte.',
    'Å bruke tid på å reparere stigmatiserende overlevering kan se mindre effektivt ut for drift, samtidig som standing hos Elias og framtidige vakter øker fordi språkpraksisen blir tryggere.'
  ],
  authority_separation:'Standing kan påvirke hvem som lytter til miljøarbeiderens observasjoner og hvor mye relasjonell tillit som finnes, men kan aldri skape diagnosemyndighet, psykoterapimandat, rett til å endre behandling, klinisk beslutningsmyndighet eller et generelt unntak fra profesjonelle grenser og nødvendig eskalering.'
};

const recurring_people_archetypes = [
  {id:'miljoarbeid_service_user',social_function:'personen som mottar støtte og bærer egne mål, grenser og erfaringer inn i en asymmetrisk tjenestesituasjon',class_position:'tjenestemottaker med begrenset institusjonsmakt men unik situert kunnskap om eget liv',status:'lav formell rang og høy situert relevans',power_over_player:'kan vise om støtten faktisk bygger autonomi eller bare gjør lydighet lettere',wants:'respekt, reelle valg og å bli møtt som mer enn et problem',conceals:'at tidligere kontroll eller stempling kan gjøre det risikabelt å si tydelig nei',speech_style:'konkret og hverdagslig; sier hva som fungerer, hva som føles kontrollerende og hva som ikke gir mening',teaches_player:'at førstelinjestøtte må kunne endres av personens egen stemme'},
  {id:'miljoarbeid_experienced_colleague',social_function:'erfaren kollega som kan løse praktiske problemer raskt men også gjøre erfaring til for sikker forklaring',class_position:'førstelinjekollega med uformell senioritet og sterk lokal praksiskunnskap',status:'middels formell rang, høy uformell status i vakten',power_over_player:'kan normalisere både god praksis og stigmatiserende snarveier i overleveringen',wants:'løsninger som virker raskt og gjør skiftet håndterbart',conceals:'at effektivitet noen ganger belønner språk som er kortere enn det er presist',speech_style:'praktisk og erfaringsdrevet; spør hva som fungerer og hva neste vakt trenger å vite',teaches_player:'at kollegial erfaring er verdifull uten å bli diagnosemyndighet'},
  {id:'miljoarbeid_team_lead',social_function:'leder som eier lokal drift og sikkerhetskoordinering uten å eie klinisk sannhet',class_position:'formell driftsleder med organisatorisk beslutningsmakt',status:'høy lokal organisasjonsstatus',power_over_player:'kan omprioritere bemanning, kreve tydelig overlevering og aktivere sikkerhetsrutiner',wants:'trygg drift, klar ansvarslinje og presise observasjoner',conceals:'at tids- og kapasitetskrav kan gjøre raske konklusjoner sosialt attraktive',speech_style:'kort og prioriterende; spør hva som skjedde, hvem som eier neste steg og hva vakten trenger nå',teaches_player:'at driftsmyndighet og klinisk vurderingsmyndighet må holdes adskilt'},
  {id:'miljoarbeid_psychologist_contact',social_function:'autorisert fagkontakt som trenger førstelinjens situasjonskunnskap uten at den selges som klinisk konklusjon',class_position:'profesjonell spesialistkontakt med mer formell klinisk kompetanse',status:'høy faglig status i kliniske spørsmål',power_over_player:'kan overta klinisk vurdering, stille krav til evidens og tydeliggjøre kompetansegrensen',wants:'konkrete hendelser, Elias sine egne ord og eksplisitt usikkerhet',conceals:'at ekspertstatus også kan gjøre førstelinjen for taus hvis den undervurderer egen situasjonskunnskap',speech_style:'presis og spørsmålsdrevet; ber om tidslinje, kontekst og hva som faktisk endret seg',teaches_player:'at god handoff gjør rollegrensen produktiv i stedet for passiv'},
  {id:'miljoarbeid_next_shift',social_function:'kollega på neste vakt som arver dokumentasjon, språk og konkrete watch-points',class_position:'likemann i samme førstelinjesystem med nytt observasjonsansvar',status:'kollegial likestatus, høy kontinuitetsmakt',power_over_player:'kan forsterke tidligere merkelapper eller bruke sporet til ny, selvstendig observasjon',wants:'kort, presis og handlingsbar overlevering uten skjulte diagnoser',conceals:'at gjentatte ord lett får høyere sannhetsstatus bare fordi de står i flere notater',speech_style:'kronologisk og praksisnær; spør hva som faktisk må følges med på denne vakten',teaches_player:'at dokumentasjon er sosial infrastruktur som former neste møte'},
  {id:'miljoarbeid_relative',social_function:'pårørende eller nærstående som ønsker trygghet og påvirkning uten automatisk tilgang til hele tjenestens informasjon',class_position:'utenfor institusjonen men med nær relasjon og situert kunnskap',status:'høy personlig relevans, ingen automatisk fag- eller beslutningsrang',power_over_player:'kan skape press for informasjon, rask forklaring eller mer kontroll rundt Elias',wants:'trygghet, å bli hørt og forstå hva tjenesten faktisk gjør',conceals:'at egen uro kan gjøre mer informasjon og mer kontroll til synonym med bedre hjelp',speech_style:'bekymret og konkret; spør hva som har skjedd og hva teamet gjør videre',teaches_player:'at samarbeid med nærstående må respektere både relasjon og gyldige informasjonsgrenser'}
];

const slow_axes = [
  {id:'work_object_trace_quality',meaning:'om Elias-sporet beholder observerbare fakta, personens stemme, usikkerhet, støttevalg og riktig eier over flere vakter',runtime_binding:'editorial_only_until_governed'},
  {id:'autonomy_support',meaning:'om praktisk støtte øker personens reelle valg og mestring fremfor å gjøre tidspress til skjult tvang',runtime_binding:'existing'},
  {id:'boundary_clarity',meaning:'om nærhet og fortrolighet kan eksistere sammen med tydelig profesjonell grense og sikker eskalering',runtime_binding:'existing'},
  {id:'documentation_precision',meaning:'om overlevering beskriver hendelse, kontekst og respons uten stigmatiserende personmerkelapper',runtime_binding:'editorial_only_until_governed'},
  {id:'service_user_standing',meaning:'situert tillit hos personen til autonomistøtte, transparens, respekt og reparasjon',runtime_binding:'editorial_only_until_governed'},
  {id:'colleague_standing',meaning:'situert tillit hos erfarne kolleger til at presisjon også kan være praktisk nyttig i travel drift',runtime_binding:'editorial_only_until_governed'},
  {id:'team_lead_standing',meaning:'situert tillit hos leder til sikker drift, tydelig handoff og riktig bruk av egen deeskaleringskompetanse',runtime_binding:'editorial_only_until_governed'},
  {id:'psychologist_contact_standing',meaning:'situert tillit hos fagkontakt til førstelinjens evidens, rollepresisjon og tidlige eskalering',runtime_binding:'editorial_only_until_governed'},
  {id:'next_shift_standing',meaning:'situert tillit hos neste vakt til at overleveringen kan brukes uten å arve skjult diagnose eller stigma',runtime_binding:'editorial_only_until_governed'},
  {id:'private_carryover',meaning:'hvor mye uferdig ansvar og emosjonell rest miljøarbeideren bærer privat etter at neste eier faktisk er dokumentert',runtime_binding:'editorial_only_until_governed'}
];

const work_rhythm_model = {
  runtime_binding:'editorial_only_existing_pipeline',
  new_runtime_state:false,
  rule:'Miljøarbeidet veksler mellom observasjon, autonomistøtte, venting, deeskalering, handoff og senere reparasjon i eksisterende Scene Pipeline. Tempo eller standing kan aldri gjøre førstelinjen til klinisk myndighet eller oppheve behovet for riktig eskalering.',
  states:[
    {id:'observation',meaning:'Vakten registrerer konkret hendelse, kontekst og personens egne ord før den bestemmer hva som faktisk trenger støtte eller eskalering.',guardrails:['observasjon skal holdes adskilt fra diagnose og personmerkelapp','usikkerhet skal forbli synlig når rollen ikke kan avklare den']},
    {id:'support',meaning:'Miljøarbeideren tilpasser aktivitet, relasjon og ramme slik at personens autonomi og mestring kan øke uten skjult tvang.',guardrails:['støtte skal tilby reelle valg når situasjonen tillater det','effektivitet skal ikke behandles som bevis på motivasjon eller samtykke']},
    {id:'waiting',meaning:'Når neste steg krever personens respons, senere observasjon eller faglig vurdering kan sporet stå åpent med tydelig watch-point og ansvar.',guardrails:['venting skal ha grunn og neste observasjonsvindu','alvorlig sikkerhetsbekymring skal ikke parkeres som vanlig venting']},
    {id:'handoff',meaning:'Situasjonskunnskap overleveres til teamleder, fagkontakt eller neste vakt med konkret evidens og eksplisitt skille mellom hva rollen vet og ikke vet.',guardrails:['handoff skal identifisere riktig ansvarseier','klinisk konklusjon skal ikke smygformuleres i førstelinjens overlevering']},
    {id:'repair',meaning:'Når tidligere språk eller praksis har skapt stigma eller kontroll rettes både dokumentasjon, teampraksis og forklaring til personen uten å love umiddelbar gjenopprettet tillit.',guardrails:['reparasjon skal gjøre feilen sporbar, ikke slette historien','personens reaksjon på reparasjonen skal behandles som ny data, ikke krav om tilgivelse']},
    {id:'delayed_consequence',meaning:'Konsekvensen av overlevering, autonomistøtte eller eskalering vurderes først på senere vakt når relasjon, praksis og nye observasjoner faktisk viser hva som skjedde.',guardrails:['senere utfall er ikke automatisk kausalbevis','blandede konsekvenser skal kunne eksistere samtidig hos ulike audiences']}
  ]
};

const primary_threads = [
  {id:'observation_label_repair',beat_refs:['1/morning','4/morning','5/morning','7/morning','9/morning','12/morning','14/morning']},
  {id:'autonomy_and_relationship',beat_refs:['2/lunch','3/lunch','7/lunch','8/lunch','10/lunch','13/lunch','14/lunch']},
  {id:'boundary_safety_handoff',beat_refs:['3/afternoon','4/afternoon','6/afternoon','10/afternoon','11/afternoon','13/afternoon','14/afternoon']},
  {id:'documentation_and_next_shift',beat_refs:['1/afternoon','5/afternoon','6/morning','7/afternoon','9/afternoon','12/afternoon','14/morning']},
  {id:'shift_afterlife_and_professional_mask',beat_refs:['1/evening','3/evening','4/evening','7/evening','10/evening','13/evening','14/evening']}
];

const private_aftermath = [
  {id:'label_doubt',beat_ref:'1/evening',text:'Etter første vakt sitter miljøarbeideren igjen med fristelsen til å tro at et sterkt ord hadde gjort bekymringen lettere å bære. Kvelden skiller behovet for sikkerhet fra behovet for en rask forklaring.'},
  {id:'confidentiality_residue',beat_ref:'3/evening',text:'Å dele alvorlig bekymring med riktig ansvarseier kan føles som relasjonelt svik selv når grensen ble forklart. Etterspillet lar uro eksistere uten å omdefinere sikker eskalering som feil.'},
  {id:'deescalation_adrenaline',beat_ref:'4/evening',text:'Etter hendelsen i fellesrommet merkes kroppen fortsatt selv om sikkerhetslinjen er overlevert. Miljøarbeideren trener på å skille emosjonell rest fra ansvar som nå faktisk ligger hos andre.'},
  {id:'repair_without_reward',beat_ref:'7/evening',text:'Reparasjonen av overleveringen gir ingen umiddelbar takk fra Elias. Det gjør langsom tillit synlig: riktig praksis kan være nødvendig selv når sosial standing ikke stiger samme kveld.'},
  {id:'role_can_end',beat_ref:'14/evening',text:'Perioden ender med et åpent, men tydelig eid Elias-spor. Miljøarbeideren kan gå hjem uten å bære klinisk ansvar privat fordi observasjon, watch-point og neste eier allerede er eksplisitt dokumentert.'}
];

const delayed_consequences = [
  {id:'vaktstart_language_returns',setup_ref:'1/morning',return_ref:'7/morning',description:'Tolkningsordet fra første overlevering kommer senere tilbake som endret praksis hos neste vakt og må repareres i dokumentasjon og møteform.'},
  {id:'autonomy_choice_returns',setup_ref:'2/lunch',return_ref:'8/lunch',description:'Elias sitt nei til verkstedet kommer senere tilbake som informasjon om hva slags støtte som faktisk øker eller svekker mestring.'},
  {id:'confidentiality_boundary_returns',setup_ref:'3/afternoon',return_ref:'10/lunch',description:'Den forklarte fortrolighetsgrensen kommer senere tilbake når samarbeid og informasjonsønsker må avgrenses på nytt uten å gjøre hemmelighold eller grenseløs deling til standard.'},
  {id:'deescalation_handoff_returns',setup_ref:'4/afternoon',return_ref:'6/afternoon',description:'Hendelsen i fellesrommet kommer tilbake som faglig oppfølging der førstelinjens konkrete tidslinje må overleveres uten klinisk konklusjon.'},
  {id:'documentation_repair_returns',setup_ref:'5/afternoon',return_ref:'12/afternoon',description:'Nøytral dokumentasjon kommer senere tilbake når et nytt tegn frister teamet til å gjenbruke den gamle merkelappen som om den nå var bevist.'},
  {id:'standing_divergence_returns',setup_ref:'9/morning',return_ref:'13/afternoon',description:'Friksjon med erfaren kollega kommer senere tilbake i en ny sikkerhetssituasjon der presisjon, deeskalering og riktig handoff vurderes ulikt av Elias, kollega, leder og fagkontakt.'}
];

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'psykologi',
  role_scope:ROLE,
  title:'Miljøarbeid — vedvarende Elias-spor, autonomi og rollepresis førstelinje',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å gjøre nær, praktisk menneskestøtte presis nok til å bevare autonomi, sikkerhet og kontinuitet uten at situasjonskunnskap glir over i diagnose, behandling eller ubegrunnet kontroll.',
    description:'Role World-en forfatter de to readiness-gapene persistent_work_object og situated_reputation rundt den eksisterende firetrinns menneskearbeidspiloten. Elias-sporet bærer observasjon, personstemme, støtte, usikkerhet, handoff og reparasjon mellom vakter uten ny runtime-state.'
  },
  theme_ids,
  social_environments:[
    'Bofellesskapets vaktrom der korte overleveringer kan bli sosial infrastruktur for enten presis oppfølging eller vedvarende stigma.',
    'Aktivitetstilbudet der effektivitet, motivasjon og autonomi kolliderer i små valg om buss, verksted og hverdagsmestring.',
    'Oppfølgingssamtalen der nærhet og fortrolighet må tåle at alvorlig sikkerhetsbekymring deles med riktig ansvarseier.',
    'Fellesrommet der miljøarbeideren kan regulere stimuli, skape avstand og deeskalere uten å improvisere diagnose eller terapi.',
    'Faglig oppfølging der psykologkontakt trenger førstelinjens konkrete tidslinje og personens egne ord uten pseudo-klinisk overstyring.',
    'Neste vakt der dokumentasjon får materiell konsekvens for hvordan Elias blir møtt og hvor mye kontroll eller autonomi teamet tilbyr.',
    'Privatlivet etter skiftet der varme, uro og ansvar må kunne skilles fra klinisk myndighet og fra saker som allerede er overlevert.'
  ],
  recurring_people_archetypes,
  slow_axes,
  persistent_work_object_model,
  work_rhythm_model,
  situated_reputation_model,
  primary_threads,
  private_aftermath,
  delayed_consequences,
  cross_role_link:{status:'candidate_when_shared_work_is_real',materialized:false,new_runtime:false,rule:'Cross-role skal bare materialiseres når shared work faktisk er genuint delt mellom canonicale karrierer. Psykologfaglig kontakt i Miljøarbeid-kildene er en intern fiktiv samarbeidsaktør, ikke i seg selv bevis for et nytt canonicalt delt runtime-objekt.'},
  season:{days:14,day_phases:phases,coverage},
  materialization:{
    authored_dimensions:['persistent_work_object','situated_reputation'],
    foundation_dimensions_bound:['institution_authority','rhythm_waiting_handoff_rework','history_go_affordance','people_places_integrity','provenance'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_work_grammar_preserved:true,
    cross_role_link_materialized:false,
    source_refs:refs
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE)) index.roles.push({category:'psykologi',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Psykologi Miljøarbeid er materialisert som kontrollert Role World-rollout med persistent Elias-overleveringsspor og audience-spesifikk standing; den eksisterende firetrinnspiloten, førstelinjens myndighetsgrense og no-new-runtime-regelen er bevart.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

const report = `# Civication Psykologi Miljøarbeid Role World rollout\n\nDato: **2026-08-28**\n\n## Resultat\n\nMiljøarbeid er materialisert som en komplett 14-dagers Role World med 56 beats. Rollouten forfatter nøyaktig readiness-gapene \`persistent_work_object\` og \`situated_reputation\`.\n\n## Vedvarende arbeidsobjekt\n\n\`elias_observation_handoff_record\` binder vaktstart, autonomistøtte, fortrolighetsgrense, deeskalering, nøytral dokumentasjon, faglig oppfølging og sen neste-vakt-konsekvens til ett redaksjonelt spor. Det lever i eksisterende Scene Pipeline og introduserer ingen ny runtime-state.\n\n## Situert standing\n\nStanding er separat for Elias, erfaren kollega, teamleder, psykologfaglig kontakt, neste vakt og pårørende. Ingen global score finnes, og standing kan aldri skape diagnosemyndighet, psykoterapimandat, behandlingsmyndighet eller generell rett til å dele opplysninger.\n\n## Bevarte kontrakter\n\n- eksisterende firetrinns mailplan er uendret\n- nøyaktig sju eksisterende mail-scener brukes som provenance\n- miljøarbeideren støtter, observerer, deeskalerer og dokumenterer innen rollen\n- klinisk vurdering eskaleres til riktig fagperson\n- ingen ny runtime eller cross-role-kobling er introdusert\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_PSYKOLOGI_MILJOARBEID_ROLE_WORLD_ROLLOUT.md'), report);

console.log(`Materialized ${KEY}: ${coverage.length} beats, ${refs.length} source refs, authored persistent work object + situated reputation`);
