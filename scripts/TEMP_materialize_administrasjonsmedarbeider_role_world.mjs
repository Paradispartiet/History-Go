import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
};

const KEY = 'naeringsliv/administrasjonsmedarbeider';
const ROLE = 'administrasjonsmedarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/administrasjonsmedarbeider.json';

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const target = (readiness.rollout_queue || []).find((row) => row.key === KEY);
if (!target) throw new Error(`${KEY}: missing from rollout queue`);
if (target.classification !== 'rollout_ready') throw new Error(`${KEY}: expected rollout_ready, got ${target.classification}`);
if (JSON.stringify(target.blockers || []) !== '[]') throw new Error(`${KEY}: blockers must remain empty`);
if (JSON.stringify(target.authored_work_required || []) !== '["situated_reputation"]') {
  throw new Error(`${KEY}: readiness debt changed: ${JSON.stringify(target.authored_work_required)}`);
}
if (target.cross_role_need !== 'not_required_for_rollout') throw new Error(`${KEY}: cross-role classification changed`);
if (fs.existsSync(path.join(ROOT, WORLD_PATH))) throw new Error(`${KEY}: Role World already exists; refuse overwrite`);

const plan = read('data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json');
if (plan.id !== 'administrasjonsmedarbeider_naeringsliv_v1' || plan.role_scope !== ROLE || plan.sequence?.length !== 20) {
  throw new Error('Administrasjonsmedarbeider 20-step plan drift');
}
for (let i = 0; i < plan.sequence.length; i += 1) {
  const step = plan.sequence[i];
  if (step.step !== i + 1 || step.type !== (i % 2 === 0 ? 'job' : 'people') || JSON.stringify(step.fallback_types) !== '[]') {
    throw new Error(`Administrasjonsmedarbeider plan step ${i + 1} drift`);
  }
}

const model = read('data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json');
if (model.role_scope !== 'okonomi_og_administrasjonsmedarbeider' || model.role_id !== 'naeringsliv_okonomi_og_administrasjonsmedarbeider') {
  throw new Error('Administrasjonsmedarbeider role-model identity drift');
}
const peopleIds = (model.related_people || []).map((p) => p.id);
const expectedPeople = ['nora_administrasjonskoordinator','marius_regnskapsmedarbeider_admin','lea_innkjopskoordinator_admin','eirik_driftskontakt_admin'];
if (JSON.stringify(peopleIds) !== JSON.stringify(expectedPeople)) throw new Error(`Professional People drift: ${JSON.stringify(peopleIds)}`);
if ((model.related_places || []).length !== 4) throw new Error('Administrasjonsmedarbeider workplace surface drift');
if (!(model.authority_boundary?.may_not || []).includes('godkjenne uten fullmakt')) throw new Error('Approval authority boundary drift');
if (!(model.authority_boundary?.may_not || []).includes('presentere antakelser som dokumenterte fakta')) throw new Error('Evidence authority boundary drift');

const grammar = read('data/Civication/workGrammars/naeringsliv/naeringsliv_administrasjon_og_okonomistyring.json');
const expectedLoops = [
  'grunnlag -> kontroll -> registrering -> analyse -> rapport -> oppfølging',
  'avvik -> datakilde -> årsak -> konsekvens -> tiltak -> dokumentasjon'
];
if (JSON.stringify(grammar.work_loops) !== JSON.stringify(expectedLoops)) throw new Error('Administrasjonsmedarbeider work-loop drift');

const sources = [
  ['data/Civication/mailFamilies/naeringsliv/job/administrasjonsmedarbeider_job.json','job_administrasjonsmedarbeider_week1_voucher_without_owner'],
  ['data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json','administrasjonsmedarbeider_people_nora_handoff_001'],
  ['data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json','administrasjonsmedarbeider_people_marius_documentation_001'],
  ['data/Civication/mailFamilies/naeringsliv/conflict/administrasjonsmedarbeider_conflict.json','conflict_administrasjonsmedarbeider_close_without_owner'],
  ['data/Civication/mailFamilies/naeringsliv/story/administrasjonsmedarbeider_story.json','story_administrasjonsmedarbeider_which_version_became_truth'],
  ['data/Civication/mailFamilies/naeringsliv/event/administrasjonsmedarbeider_event.json','event_administrasjonsmedarbeider_system_down_before_deadline'],
  ['data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json','personal_administrasjonsmedarbeider_week1_receipts_at_home']
];
const sourceRefs = sources.map(([rel, id]) => `${rel}#${id}`);
for (const [rel, id] of sources) {
  const doc = read(rel);
  const mails = (doc.families || []).flatMap((family) => family.mails || []);
  if (!mails.some((mail) => mail.id === id)) throw new Error(`Missing canonical source ${rel}#${id}`);
}

const phases = ['morning','lunch','afternoon','evening'];
const beatTypes = ['info','relationship','task','decision','conversation','social','consequence','private_consequence'];
const daily = [
  'Et bilag uten bekreftet eier tester om spilleren gjør usikkerhet synlig før fristen gjør en antakelse sosialt fristende.',
  'Nora trenger en sporbar handoff, og koordineringens standing skiller seg fra den formelle beslutningsmyndigheten som fortsatt ligger hos faktisk eier.',
  'Marius trenger dokumentert grunnlag, og økonomitillit bygges når praktisk sannsynlighet ikke får maskere evidensstatus.',
  'Lea viser at en korrekt sluttstatus fortsatt kan være et dårlig kontrollspor dersom selve rettelsen gjøres usynlig.',
  'Eiriks driftskontekst gjør saken forståelig uten å gjøre lokal kunnskap til økonomisk godkjenning.',
  'Fristpress gjør det sosialt attraktivt å lukke en nesten-avklart sak, mens god administrasjon holder manglende ansvar synlig.',
  'En gammel dokumentversjon har blitt behandlet som sannhet, og spilleren må reparere både filen og sporene den allerede har satt.',
  'Et systemavvik flytter arbeidet til midlertidige flater, og tillit avhenger av om kontrollsporet kan rekonstrueres etterpå.',
  'Gjentatte små feil gjør det fristende å rydde manuelt, men profesjonell standing kan kreve at prosessproblemet gjøres synlig for ledelsen.',
  'Kollegial lojalitet, service og kontroll trekker i ulike retninger når en rask løsning vil gjøre en annens manglende avklaring usynlig.',
  'Etterkontroll viser at den som kommer senere vurderer arbeidet ut fra rekonstruerbarhet, ikke ut fra hvor ryddig saken så ut ved lukking.',
  'Ledelsen ønsker beslutningsklare tall, mens spilleren må skille dokumentert fakta, estimat og fortsatt usikkerhet uten å kjøpe status med sikker tone.',
  'Arbeidsspråket begynner å lekke hjem, og privat standing bedres når personen kan la kvitteringer, åpne punkter og oppfølgingslogikk bli igjen på jobb.',
  'Moden administrativ tillit betyr å tåle synlig uferdighet, rette tidligere spor og overlevere ansvar uten å gjøre pålitelighet til uformell fullmakt.'
];
const phaseText = {
  morning: 'Morgenen etablerer grunnlag, eier og dagens kontrollspor før tempo og kø gjør en praktisk antakelse til fristende systemfakta.',
  lunch: 'Midt på dagen leser en annen aktør samme sak fra sitt faglige ståsted, slik at standing kan utvikle seg ulikt mellom publikum.',
  afternoon: 'Ettermiddagen krever en konkret registrering, korreksjon, eskalering eller handoff innen den myndigheten rollen faktisk har.',
  evening: 'Kvelden viser forsinket eller privat kostnad og skiller profesjonell pålitelighet fra personlig verdi og formell authority.'
};
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let pi = 0; pi < phases.length; pi += 1) {
    const phase = phases[pi];
    const ref = sourceRefs[(day * 4 + pi - 4) % sourceRefs.length];
    coverage.push({
      day,
      phase,
      beat_type: beatTypes[(day + pi - 1) % beatTypes.length],
      summary: `Dag ${day}, ${phase}: ${daily[day - 1]} ${phaseText[phase]} Standing er audience-spesifikk redaksjonell tolkning og kan styrkes hos én gruppe samtidig som den svekkes hos en annen; den kan aldri gi godkjenningsfullmakt, endre fagansvar eller gjøre antakelser til dokumenterte fakta.`,
      materialization_refs: [ref]
    });
  }
}

const npc = (id, social_function, class_position, status, power_over_player, wants, conceals, speech_style, teaches_player) => ({
  id, social_function, class_position, status, power_over_player, wants, conceals, speech_style, teaches_player
});
const recurring = [
  npc('nora_administrasjonskoordinator_world','administrasjonskoordinator som fordeler og følger åpne prosesser uten å eie andres faglige godkjenning','koordinerende rolle med prosessinnflytelse','høy situert koordineringsstatus','kan kreve synlig eier, frist og handoff, men kan ikke gi spilleren godkjenningsfullmakt','sporbare overleveringer, tidlig varsling og saker som ikke blir stående som nesten ferdige','at køpress kan gjøre en antatt eier sosialt mer attraktiv enn et synlig åpent punkt','kort, strukturert og prosessnær; spør hvem som faktisk eier neste avklaring','at koordineringsstanding bygges av å bevare ansvar, ikke av å absorbere det'),
  npc('marius_regnskapsmedarbeider_world','regnskapsmedarbeider som trenger etterprøvbart grunnlag før registreringen kan behandles som økonomisk fakta','faglig sidestilt økonomirolle med spesifikt dokumentasjonsansvar','høy epistemisk status i regnskapsnære spørsmål','kan kreve underlag og korrigering, men kan ikke overføre sin fagmyndighet til spilleren','dokumentert grunnlag, eksplisitt usikkerhet og sporbar korreksjon','at fristpress kan gjøre muntlig plausibilitet fristende også for økonomifunksjonen','presis og kildeorientert; skiller hva systemet viser fra hva underlaget faktisk beviser','at økonomitillit vokser når usikkerhet får stå åpen til kilden finnes'),
  npc('lea_innkjopskoordinator_world','innkjøpskoordinator som eier bestillingsgrunnlag og leverandørspor, men ikke spillerens administrative registrering','spesialist med avgrenset prosessmyndighet','høy situert innkjøpstillit','kan dokumentere bestillingsgrunnlag og korrigere referanser i sitt spor, men ikke godkjenne utbetaling eller skjule historikk','korrekte referanser, bevart endringshistorikk og tydelig ansvarsdeling','at en ryddig sluttstatus kan friste organisasjonen til å glemme hvordan feilen oppstod','konkret og referansenær; spør hvilket dokument som beviser koblingen','at korreksjon er sterkest når både gammel feil og nytt grunnlag kan rekonstrueres'),
  npc('eirik_driftskontakt_world','driftskontakt som leverer lokal hendelseskontekst, faktisk operativ eier og timing uten økonomisk godkjenningsmyndighet','operativ fagkontakt med høy lokal kunnskap og begrenset formell kontrollmakt','høy situert driftskredibilitet','kan bekrefte operative fakta og ansvar, men ikke bestemme regnskapsklassifisering eller gi formell godkjenning','at administrasjonen bruker lokal kontekst uten å oversette den til falsk sikkerhet','at det er fristende å la den som vet mest om hendelsen også bli behandlet som den som kan godkjenne alt','direkte og hendelsesnær; beskriver hva som faktisk skjedde og hvem som må svare videre','at lokal kunnskap styrker sporbarhet når den beholder sin faglige grense'),
  npc('ingrid_kontorleder_world','kontorleder som vurderer om administrasjonen gjør frister, ansvar og kontrollspor beslutningsklare uten å kamuflere uferdighet','formell lokal leder over administrativ arbeidsflyt','høy formell status','kan prioritere arbeid og kreve eskalering innen mandat, men kan ikke gjøre lojalitet eller standing til økonomisk godkjenning','pålitelig varsling, synlig risiko og arbeidsflyt som tåler etterkontroll','at ledelsesbehovet for ryddige rapporter kan favorisere pen sluttstatus fremfor synlig usikkerhet','knapp og beslutningsnær; spør hva som er kjent, hva som mangler og hvem som eier neste steg','at lederstanding styrkes av beslutningsklar usikkerhet, ikke av overdrevet sikkerhet'),
  npc('etterkontroll_world','senere kontrollør eller kollega som må rekonstruere hvorfor en registrering, versjon eller handoff ble endret','downstream kontrollposisjon uten daglig nærhet til den opprinnelige saken','lav sosial nærhet, høy etterprøvingsmakt','kan avdekke svake spor og kreve forklaring, men kan ikke retroaktivt gi spilleren myndighet den aldri hadde','kilder, tidsstempler, endringsgrunnlag og tydelig skille mellom fakta og antakelse','at kontroll ofte først ser arbeidet når noe gikk galt, og derfor kan undervurdere usynlig forebygging','nøktern og rekonstruktiv; spør hva en utenforstående faktisk kan vite fra sporet','at profesjonell reputasjon ofte avgjøres lenge etter handlingen av hvor godt arbeidet kan rekonstrueres'),
  npc('privat_relajon_admin_world','privat nær relasjon som møter personen når mapper, åpne punkter og oppfølgingsspråk følger med hjem','likemann uten arbeidsmyndighet','høy emosjonell betydning','kan sette grenser for hvor mye administrasjonsrollen får organisere privatlivet, men kan ikke løse arbeidsmandat eller fagspørsmål','nærvær, uformell tid og at ikke alt behandles som sak eller status','slitasjen ved å bli møtt som et oppfølgingspunkt i stedet for en person','hverdagslig og direkte; ber om svar uten saksnummer, kontrollfrist eller mappe','at profesjonell pålitelighet er situert og ikke behøver å bli en total identitet')
];

const slowAxes = [
  ['coordination_handoff_standing','situert koordineringsstanding for tydelig eier, frist og sporbar handoff'],
  ['accounting_traceability_standing','situert økonomitillit til dokumentert grunnlag og synlig evidensstatus'],
  ['procurement_source_integrity_standing','situert innkjøpstillit til korrekte referanser og bevart endringshistorikk'],
  ['operations_context_boundary_standing','situert driftstillit til presis bruk av lokal kontekst uten authority-drift'],
  ['office_leadership_reliability_standing','situert lederstanding for tidlig varsling, kontroll og beslutningsklar usikkerhet'],
  ['audit_reconstructability_standing','situert etterkontrollstanding for at andre kan rekonstruere kilde, endring og ansvar'],
  ['private_role_containment_standing','hvor godt administrasjonsspråk, kontrollbehov og arbeidsstatus holdes situert til jobb']
].map(([id, meaning]) => ({ id, meaning, runtime_binding: 'editorial_only_until_governed' }));

const audiences = [
  {id:'administrative_coordination',standing_axis:'coordination_handoff_standing',cares_about:['tydelig eier og frist','sporbar overlevering'],cannot_grant:'Koordineringsstanding kan ikke gi spilleren godkjenningsfullmakt, fagansvar eller rett til å fylle manglende eier med en antakelse.'},
  {id:'accounting_economy',standing_axis:'accounting_traceability_standing',cares_about:['dokumentert økonomisk grunnlag','skille mellom fakta, estimat og usikkerhet'],cannot_grant:'Økonomitillit kan ikke gi spilleren rett til å godkjenne uten fullmakt, bestemme regnskapsklassifisering uten grunnlag eller presentere muntlig plausibilitet som bokført fakta.'},
  {id:'procurement',standing_axis:'procurement_source_integrity_standing',cares_about:['korrekt bestillingsreferanse','bevart historikk når koblinger korrigeres'],cannot_grant:'Innkjøpsstanding kan ikke gi utbetalingsmyndighet, gjøre leverandørsporet til hele økonomisannheten eller la spilleren overta innkjøpsrollens fagansvar.'},
  {id:'operations',standing_axis:'operations_context_boundary_standing',cares_about:['presis hendelseskontekst','faktisk operativ eier og timing'],cannot_grant:'Driftstillit kan ikke gjøre lokal forklaring til økonomisk godkjenning, regnskapsklassifisering eller generell beslutningsfullmakt.'},
  {id:'office_leadership',standing_axis:'office_leadership_reliability_standing',cares_about:['tidlig varsling om avvik','beslutningsklar status uten skjult usikkerhet'],cannot_grant:'Lederstanding kan ikke erstatte delegasjon eller fullmakt og kan ikke gjøre lojalitet til grunnlag for å skjule avvik eller lukke uavklarte saker.'},
  {id:'audit_downstream_control',standing_axis:'audit_reconstructability_standing',cares_about:['kilde og tidsstempel','endringsgrunnlag og etterprøvbar ansvarslinje'],cannot_grant:'Etterkontrollstanding kan ikke retroaktivt gi myndighet, gjøre manglende dokumentasjon sann eller forvandle en pen sluttstatus til et gyldig kontrollspor.'},
  {id:'private_relations',standing_axis:'private_role_containment_standing',cares_about:['at private relasjoner ikke blir saker','at arbeidsstatus og kontrollbehov kan legges fra seg'],cannot_grant:'Privat støtte kan ikke gi arbeidsfullmakt, økonomisk authority eller rett til å organisere andre mennesker som administrative objekter.'}
];

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'naeringsliv',
  role_scope: ROLE,
  title: 'Administrasjonsmedarbeider — sporbarhet, usynlig arbeid og situert tillit',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Å gjøre virksomhetens bilag, frister, versjoner og åpne punkter etterprøvbare når godt administrativt arbeid ofte er usynlig, mens raske lukkede saker og sikker tone kan gi høyere kortsiktig status.',
    description: 'Role World-en lukker bare situated_reputation rundt eksisterende administrativ praksis. Den 20-stegs praksisplanen, arbeidsgrammatikken, People-forankringen, arbeidsflatene og authority-grensen beholdes uendret.'
  },
  theme_ids: ['professional_culture','invisible_work','bureaucratic_power','numerical_control','shame_reputation','loyalty_up_down','status_anxiety','public_private_leakage'],
  social_environments: [
    'Innboks- og mottaksflaten der saker konkurrerer om oppmerksomhet og det sosialt letteste ofte er å anta en eier.',
    'Registrerings- og kontrollflaten der tall og kategorier kan se ferdige ut før dokumentasjonen faktisk tåler etterprøving.',
    'Arkiv- og versjonsflaten der organisasjonens hukommelse avgjøres av hvilke spor som bevares når noe korrigeres.',
    'Frist- og oppfølgingsbordet der koordinering må holde ansvar synlig uten å bli uformell beslutningsmyndighet.',
    'Møtet med økonomi, innkjøp og drift der samme sak leses gjennom ulike faglige evidens- og ansvarsgrenser.',
    'Privatlivet der sakslogikk og kontrollbehov må kunne stoppe før relasjoner blir behandlet som mapper og åpne punkter.'
  ],
  recurring_people_archetypes: recurring,
  slow_axes: slowAxes,
  existing_work_continuity: {
    runtime_binding: 'existing_mail_and_work_grammar',
    new_runtime_state: false,
    work_loops: [...grammar.work_loops],
    canonical_surfaces: [
      'data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json',
      'data/Civication/workGrammars/naeringsliv/naeringsliv_administrasjon_og_okonomistyring.json',
      'data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json',
      ...[...new Set(sourceRefs.map((ref) => ref.split('#')[0]))]
    ],
    rule: 'Den eksisterende 20-stegs to-ukers praksisplanen og de to canonical work loops forblir authoritative; Role World-en legger bare situert standing rundt eksisterende job/People-scener og skaper ingen ny oppgave-, scene- eller rytme-runtime.'
  },
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    divergence_examples: [
      'Å holde et bilag åpent til eier er bekreftet kan styrke accounting- og audit-standing samtidig som koordinering opplever mer synlig kø og høyere fristpress.',
      'Å dokumentere en korrigert bestillingsreferanse kan styrke procurement- og audit-standing selv om en leder kortsiktig foretrekker den renere sluttstatusen uten historikk.',
      'Å bruke Eiriks lokale forklaring som kontekst, men ikke godkjenning, kan styrke operations-standing samtidig som en fristpresset økonomifunksjon opplever mindre umiddelbar beslutningsklarhet.',
      'Å eskalere gjentatte brukerfeil som systemproblem kan styrke office-leadership-standing og samtidig svekke kollegial komfort fordi den manuelle snarveien blir synlig.',
      'Å erkjenne at en tidligere versjon ble brukt feil kan koste kortsiktig status for presisjon og samtidig styrke downstream audit-standing fordi reparasjonen kan spores.',
      'Å la kvitteringen hjemme forbli uviktig kan redusere personens følelse av kontroll og samtidig styrke private-relations-standing fordi administrasjonsrollen holdes situert til arbeid.'
    ],
    authority_separation: 'Audience-spesifikk standing kan aldri gi godkjenningsfullmakt, regnskaps- eller innkjøpsmyndighet, ledermandat, rett til å skjule avvik eller rett til å presentere antakelser som dokumenterte fakta; faktisk rolle, delegasjon, kilder og faggrense forblir authoritative.',
    rule: 'Standing er audience-spesifikk og kan divergere mellom koordinering, økonomi, innkjøp, drift, ledelse, etterkontroll og privatliv uten global sosial score.'
  },
  cross_role_link: {
    status: 'not_required_for_rollout',
    materialized: false,
    new_runtime: false,
    rule: 'Cross-role is not required for this rollout. Nora, Marius, Lea and Eirik remain authored professional People contacts inside Administrasjonsmedarbeiderens canonical work world; no genuinely shared governed work object with a second Role World is introduced.'
  },
  season: { days: 14, day_phases: phases, coverage },
  primary_threads: [
    {id:'ownership_and_handoff',beat_refs:['1/morning','2/lunch','6/afternoon','9/lunch','14/afternoon']},
    {id:'documentation_and_evidence',beat_refs:['1/afternoon','3/lunch','6/morning','11/afternoon','12/morning','14/morning']},
    {id:'version_and_reconstructability',beat_refs:['4/afternoon','7/morning','7/afternoon','10/lunch','11/lunch','14/lunch']},
    {id:'system_deadline_and_control',beat_refs:['5/morning','8/morning','8/afternoon','9/afternoon','12/afternoon','14/afternoon']},
    {id:'situated_standing_and_private_boundary',beat_refs:['2/evening','5/evening','10/evening','12/evening','13/evening','14/evening']}
  ],
  private_aftermath: [
    {id:'kvoittering_hjem',beat_refs:['1/evening','3/evening'],meaning:'Administrasjonsblikket må kunne stoppe før private kvitteringer blir kontrollobjekter.'},
    {id:'aapne_punkter_hjem',beat_refs:['5/evening','6/evening'],meaning:'Uferdige saker kan få riktig neste eier uten å bli mentalt beholdt som privat ansvar.'},
    {id:'versjon_hjem',beat_refs:['7/evening','11/evening'],meaning:'En synlig feilretting er profesjonell reparasjon, ikke en total dom over personens verdi.'},
    {id:'frist_hjem',beat_refs:['8/evening','12/evening'],meaning:'Fristpress kan legges fra seg når kontrollsporet faktisk er bevart og ansvar er overlevert.'},
    {id:'slutt_hjem',beat_refs:['13/evening','14/evening'],meaning:'Moden administrativ standing innebærer å kunne være pålitelig på jobb uten å organisere privatlivet som en sakskø.'}
  ],
  delayed_consequences: [
    {id:'owner_return',setup_ref:'1/morning',return_ref:'6/afternoon',meaning:'Tidlig synliggjøring av manglende eier avgjør senere om fristpress kan håndteres uten å skjule ansvar.'},
    {id:'handoff_return',setup_ref:'2/lunch',return_ref:'9/lunch',meaning:'Noras første handoff-standard kommer tilbake når flere saker konkurrerer om samme frist.'},
    {id:'documentation_return',setup_ref:'3/lunch',return_ref:'11/afternoon',meaning:'Marius sin dokumentasjonsgrense avgjør om senere etterkontroll kan rekonstruere beslutningen.'},
    {id:'version_return',setup_ref:'4/afternoon',return_ref:'11/lunch',meaning:'En tidlig korrigeringspraksis avgjør om versjonshistorien senere kan repareres uten ny usikkerhet.'},
    {id:'system_return',setup_ref:'8/morning',return_ref:'12/afternoon',meaning:'Midlertidig logging under systemsvikt avgjør om fristarbeidet senere kan rekonsilieres.'},
    {id:'reputation_return',setup_ref:'10/lunch',return_ref:'14/afternoon',meaning:'Audience-spesifikk standing kommer tilbake ved slutt-handoff uten å bli global authority.'}
  ],
  employment_conditions: [
    'Administrativt arbeid forutsetter faktisk stilling eller oppdrag; Badge-poeng alene gir ingen jobb eller fullmakt.',
    'Frister, arbeidstid, systemtilgang og kontrollansvar er rolle-eid redaksjonelt stoff og ikke nye globale runtimefelt.',
    'Utvidet godkjennings-, innkjøps- eller ledermyndighet krever faktisk delegasjon og kan ikke materialiseres gjennom omdømme eller pålitelighet.'
  ],
  professional_culture: [
    'God administrasjon gjør usikkerhet, feil og ansvar synlig nok til at andre kan handle uten å måtte stole på personhukommelse.',
    'Kollegial service må ikke gjøre kontrollsporet svakere eller flytte fagansvar til den som bare koordinerer.',
    'Korreksjon behandles som profesjonell læring når den bevarer kilde, tidligere feil og begrunnelse for endringen.'
  ],
  materialization: {
    authored_dimensions: ['situated_reputation'],
    no_new_runtime: true,
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    cross_role_link_materialized: false,
    source_refs: sourceRefs
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if ((index.roles || []).some((entry) => entry.category === 'naeringsliv' && entry.role_scope === ROLE)) {
  throw new Error(`${KEY}: Role World index entry already exists`);
}
index.roles.push({ category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
index.status = `${index.roles.length}_role_worlds_materialized`;
index.effective_date = '2026-08-29';
index.note = 'Administrasjonsmedarbeider closes only situated reputation; existing 20-step administrative practice, People/Places integrity, work grammar and authority remain unchanged.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles[KEY] = world.theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_NAERINGSLIV_ADMINISTRASJONSMEDARBEIDER_ROLE_WORLD_ROLLOUT.md'), `# Civication Administrasjonsmedarbeider Role World rollout\n\n- Role: \`${KEY}\`\n- Status: \`role_world_complete\`\n- Authored debt closed: \`situated_reputation\` only\n- Season: 14 days / 56 beats\n- Canonical source refs: ${sourceRefs.length}\n- Existing 20-step plan, shared work grammar, professional People/Places foundation and authority boundaries preserved.\n- Cross-role: \`not_required_for_rollout\`; materialized: false; new runtime: false.\n- Permanent state must only be committed after focused gates and full Civication pass.\n`);

console.log(`Materialized ${KEY}: ${coverage.length} beats / ${sourceRefs.length} source refs`);
