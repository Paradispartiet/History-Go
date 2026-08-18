#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const readText = (rel) => fs.readFileSync(abs(rel), 'utf8');
const writeText = (rel, value) => fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : `${value}\n`);
const run = (args) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });

const ROLE_SCOPE = 'controller';
const ROLE_WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/controller.json';
const LIFE_ROLE_PATH = 'data/Civication/lifestory/roles/controller/role.json';
const LIFE_THREADS_PATH = 'data/Civication/lifestory/roles/controller/threads.json';
const LIFE_SCENES_PATH = 'data/Civication/lifestory/roles/controller/scenes.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/controller_plan.json';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/controller.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_administrasjon_og_okonomistyring.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/controller_job.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/controller_people.json';
const CONFLICT_PATH = 'data/Civication/mailFamilies/naeringsliv/conflict/controller_conflict.json';
const STORY_PATH = 'data/Civication/mailFamilies/naeringsliv/story/controller_story.json';
const EVENT_PATH = 'data/Civication/mailFamilies/naeringsliv/event/controller_event.json';

const lifeRole = {
  version: 1,
  id: 'controller',
  navn: 'Controller',
  kjernefantasi: 'Du gjør driftens urolige virkelighet lesbar i tall uten å la rapporten bli penere enn det den faktisk kan bevise.',
  arbeidsoppgaver: [
    'forklare avvik mellom budsjett, prognose og faktisk resultat',
    'avstemme kontoer og finne rotårsaken bak differanser',
    'bygge prognoser med synlige forutsetninger og usikkerhet',
    'samle revisjonsspor og dokumentasjon som tåler etterprøving',
    'oversette driftens erfaringer til styringsinformasjon uten å gjøre mennesker til avvik'
  ],
  personer: [
    { id: 'ingrid_okonomisjef', navn: 'Ingrid, økonomisjefen', beskrivelse: 'Setter rapportfrister og trenger tall ledelsen kan bruke, men vet at for mye usikkerhet kan gjøre møtet vanskelig.' },
    { id: 'marius_regnskap', navn: 'Marius i regnskap', beskrivelse: 'Eier mye av underlaget og ser hvor ofte et tilsynelatende lite avvik skjuler et svakt spor.' },
    { id: 'driftsleder', navn: 'Elin, driftslederen', beskrivelse: 'Kjenner gulvet og nekter å la økonomispråk gjøre praktiske årsaker om til skyld.' },
    { id: 'revisor', navn: 'Revisoren', beskrivelse: 'Spør ikke om tallet ser rimelig ut, men om organisasjonen kan vise hvorfor det står der.' },
    { id: 'markedssjef', navn: 'Markedssjefen', beskrivelse: 'Lever med usikre kampanjeeffekter og har sterke grunner til å tro at neste uke blir bedre.' },
    { id: 'innkjoper', navn: 'Innkjøperen', beskrivelse: 'Ser leverandørpriser, avtaler og timing som rapporten bare viser som kostnad.' },
    { id: 'venn', navn: 'Jonas', beskrivelse: 'Merker når du begynner å kreve dokumentasjon, presisjon og forklaringer også av mennesker som bare vil bli trodd.' },
    { id: 'familie', navn: 'Søsteren din', beskrivelse: 'Er stolt av at du har ansvar, men reagerer når du snakker om familieliv som om det var et avviksnotat.' }
  ],
  hovedkonflikter: [
    'sporbarhet vs rapportfrist',
    'styringsinformasjon vs ønsket resultat',
    'økonomisk kontroll vs driftstillit',
    'presisjon vs falsk sikkerhet',
    'profesjonelt kontrollblikk vs privat tillit'
  ],
  endings: [
    {
      id: 'sporbar_styring',
      navn: 'Sporbar styring',
      tekst: 'Du lærte å gjøre usikkerhet tydelig uten å gjøre rapportene ubrukelige. Tallene dine ble et sted organisasjonen kunne undersøke problemer, ikke skjule dem.',
      kriterier: { meters: { integritet: { min: 66 }, handlingsrom: { min: 48 } }, flagg: { controller_skrev_forbehold: true } },
      standard: true
    },
    {
      id: 'hard_kontroll',
      navn: 'Hard kontroll',
      tekst: 'Rapportene ble stramme og folk sluttet å overraske deg. De sluttet også å fortelle deg ting før de hadde rukket å rydde dem bort.',
      kriterier: { meters: { synlighet: { min: 58 }, psyke: { max: 54 } }, flagg: { controller_presset_bevis: true } }
    },
    {
      id: 'pen_rapport',
      navn: 'Den pene rapporten',
      tekst: 'Du traff fristene og ga ledelsen et rolig bilde. Senere oppdaget du at noen av de viktigste problemene var blitt roligere på papiret enn i virkeligheten.',
      kriterier: { meters: { integritet: { max: 48 } }, flagg: { controller_valgte_ro: true } }
    },
    {
      id: 'tillit_som_kontroll',
      navn: 'Tillit som kontroll',
      tekst: 'Du gjorde kontrollen mer krevende, ikke mindre: folk måtte dokumentere, men de kunne også si at de ikke visste. Det gjorde avvikene tidligere og læringen bedre.',
      kriterier: { meters: { integritet: { min: 60 }, psyke: { min: 56 } }, flagg: { controller_lyttet_for_konklusjon: true } }
    }
  ],
  startState: {
    meters: { penger: 430, psyke: 62, energi: 67, integritet: 54, synlighet: 47, handlingsrom: 50 },
    relasjoner: {
      ingrid_okonomisjef: 52,
      marius_regnskap: 56,
      driftsleder: 48,
      revisor: 45,
      markedssjef: 44,
      innkjoper: 48,
      venn: 61,
      familie: 56
    }
  },
  dagsplan: {
    '1': [{ klokke: '08:15', tekst: 'Månedsrapport og avvik' }, { klokke: '13:00', tekst: 'Driftsforklaring' }, { klokke: '17:30', tekst: 'Forsøke å legge fra seg tallene' }],
    '2': [{ klokke: '09:00', tekst: 'Avstemming og prognose' }, { klokke: '14:00', tekst: 'Lederforberedelse' }],
    '3': [{ klokke: '08:30', tekst: 'Revisjonsspor' }, { klokke: '15:00', tekst: 'Periodisering og etikk' }]
  }
};

const lifeThreads = {
  version: 1,
  rolle: 'controller',
  threads: [
    { id: 'controller_control_home', type: 'privatliv', tittel: 'Regnearket følger deg hjem', tema: 'kontrollblikk', konflikt: 'arbeidets behov for dokumentasjon vs privatlivets behov for å bli trodd uten bevisføring', personer: ['venn'], startDag: 1, muligeRetninger: ['slippe kontrollen', 'be om bevis', 'erkjenne mønsteret'] },
    { id: 'controller_friend_trust', type: 'privatliv', tittel: 'Vennen som ikke er et avvik', tema: 'tillit', konflikt: 'presise spørsmål som arbeidsverktøy vs nærhet som ikke kan avstemmes', personer: ['venn'], startDag: 1, muligeRetninger: ['lytte', 'analysere', 'reparere'] },
    { id: 'controller_family_status', type: 'privatliv', tittel: 'Statusen i språket', tema: 'status', konflikt: 'stolthet over faglig ansvar vs avstand når fagspråket blir sosial rang', personer: ['familie'], startDag: 2, muligeRetninger: ['forklare enkelt', 'undervise', 'spørre tilbake'] },
    { id: 'controller_pressure_identity', type: 'arbeidsliv', tittel: 'Den som alltid skal vite', tema: 'falsk sikkerhet', konflikt: 'lederens behov for et klart svar vs controllerens plikt til å vise hva som fortsatt er usikkert', personer: ['ingrid_okonomisjef', 'driftsleder'], startDag: 2, muligeRetninger: ['synlig usikkerhet', 'sikker formulering', 'trinnvis avklaring'] },
    { id: 'controller_audit_memory', type: 'arbeidsliv', tittel: 'Organisasjonens hukommelse', tema: 'sporbarhet', konflikt: 'muntlig kunnskap som alle forstår nå vs dokumentasjon som må tåle at mennesker og minner skiftes ut', personer: ['marius_regnskap', 'revisor'], startDag: 3, muligeRetninger: ['bygge spor', 'stole på minnet', 'prioritere kildene'] }
  ]
};

function choice(id, tekst, threadId, meterDelta, flag, relation, relationDelta, unlock = null, completed = false) {
  const effekter = {
    meters: meterDelta,
    flagg: { [flag]: true },
    threads: { [threadId]: completed ? { status: 'completed' } : { stepDelta: 1 } }
  };
  if (relation) effekter.relasjoner = { [relation]: relationDelta };
  const out = { id, tekst, effekter, konsekvensTekst: completed ? 'Valget blir stående som en liten, men tydelig endring i hvordan du bærer rollen videre.' : 'Du merker at måten du svarer på nå vil forme den neste samtalen mer enn selve formuleringen.' };
  if (unlock) out.laaserOpp = [unlock];
  return out;
}

function scene({ id, threadId, fase, dag, visningstype, avsender, tilgjengelighet, tittel, tekst, next, relation, positiveFlag, negativeFlag, completed }) {
  return {
    id, threadId, fase, dag, visningstype, avsender, tilgjengelighet, prioritet: tilgjengelighet === 'start' ? 9 : 7, tittel, tekst,
    valg: [
      choice('A', 'Si tydelig hva du vet, hva du ikke vet, og hva du trenger fra den andre før du konkluderer.', threadId, { integritet: 3, psyke: 1, energi: -2 }, positiveFlag, relation, 4, next, completed),
      choice('B', 'Gjør situasjonen enklere ved å presse fram én forklaring eller ett svar som kan lukkes nå.', threadId, { integritet: -2, synlighet: 2, energi: -1 }, negativeFlag, relation, -3, next, completed)
    ]
  };
}

const lifeScenes = {
  version: 1,
  rolle: 'controller',
  scenes: [
    scene({ id: 'controller_ls_home_01', threadId: 'controller_control_home', fase: 'kveld', dag: 1, visningstype: 'privat hendelse', avsender: 'venn', tilgjengelighet: 'start', tittel: 'Jonas sier at ikke alt trenger et kontrollspor', tekst: 'Du spør hvem som sa hva, når det skjedde og om han har meldingen. Jonas blir stille og sier at han fortalte deg hvordan han hadde det, ikke leverte dokumentasjon til et møte.', next: 'controller_ls_home_02', relation: 'venn', positiveFlag: 'controller_slapp_beviskravet', negativeFlag: 'controller_presset_bevis', completed: false }),
    scene({ id: 'controller_ls_home_02', threadId: 'controller_control_home', fase: 'kveld', dag: 3, visningstype: 'samtale', avsender: 'venn', tilgjengelighet: 'laast', tittel: 'Samtalen uten fotnoter', tekst: 'Jonas tar opp temaet igjen. Denne gangen spør han om du kan høre hele historien før du begynner å teste om delene henger sammen.', relation: 'venn', positiveFlag: 'controller_lyttet_for_konklusjon', negativeFlag: 'controller_gjorde_samtalen_til_revisjon', completed: true }),
    scene({ id: 'controller_ls_friend_01', threadId: 'controller_friend_trust', fase: 'kveld', dag: 1, visningstype: 'melding', avsender: 'venn', tilgjengelighet: 'start', tittel: '«Du tror meg jo ikke før alt kan bevises»', tekst: 'En kort melding fra Jonas treffer hardere enn en lang rapport. Han har lagt merke til at du svarer med kontrollspørsmål når han egentlig trenger at noen tror på opplevelsen hans.', next: 'controller_ls_friend_02', relation: 'venn', positiveFlag: 'controller_svarte_med_tillit', negativeFlag: 'controller_svarte_med_kontroll', completed: false }),
    scene({ id: 'controller_ls_friend_02', threadId: 'controller_friend_trust', fase: 'kveld', dag: 4, visningstype: 'samtale', avsender: 'venn', tilgjengelighet: 'laast', tittel: 'Tillit uten avstemming', tekst: 'Dere møtes igjen. Jonas spør ikke om du kan slutte å være controller, bare om du kan la noen setninger få være sanne før de blir analysert.', relation: 'venn', positiveFlag: 'controller_reparerte_tillit', negativeFlag: 'controller_forsvarte_kontrollblikket', completed: true }),
    scene({ id: 'controller_ls_family_01', threadId: 'controller_family_status', fase: 'kveld', dag: 2, visningstype: 'telefon', avsender: 'familie', tilgjengelighet: 'start', tittel: 'Søsteren din ber deg snakke vanlig', tekst: 'Du forklarer en familiesak med ord som premiss, avvik og handlingsrom. Søsteren din ler først, før hun spør om du kan snakke med henne som søster og ikke som et beslutningsgrunnlag.', next: 'controller_ls_family_02', relation: 'familie', positiveFlag: 'controller_snakket_enkelt', negativeFlag: 'controller_underviste_familien', completed: false }),
    scene({ id: 'controller_ls_family_02', threadId: 'controller_family_status', fase: 'kveld', dag: 5, visningstype: 'samtale', avsender: 'familie', tilgjengelighet: 'laast', tittel: 'Hvem har egentlig status i rommet?', tekst: 'Søsteren din sier hun er stolt av jobben din, men at hun merker når fagspråket gjør det vanskeligere å motsi deg. Du må velge om statusen skal forsvare deg eller åpne samtalen.', relation: 'familie', positiveFlag: 'controller_spurte_tilbake', negativeFlag: 'controller_brukte_statussprak', completed: true }),
    scene({ id: 'controller_ls_pressure_01', threadId: 'controller_pressure_identity', fase: 'formiddag', dag: 2, visningstype: 'møte', avsender: 'ingrid_okonomisjef', tilgjengelighet: 'start', tittel: 'Ingrid trenger ett tall før møtet', tekst: 'Ingrid trenger en prognose hun kan ta inn i ledergruppen. Du har et intervall og tre usikre premisser. Hun spør hvilket tall hun skal bruke på førstesiden.', next: 'controller_ls_pressure_02', relation: 'ingrid_okonomisjef', positiveFlag: 'controller_skrev_forbehold', negativeFlag: 'controller_valgte_ro', completed: false }),
    scene({ id: 'controller_ls_pressure_02', threadId: 'controller_pressure_identity', fase: 'ettermiddag', dag: 5, visningstype: 'intern vurdering', avsender: 'driftsleder', tilgjengelighet: 'laast', tittel: 'Det sikre tallet blir sitert som sannhet', tekst: 'Et tall du formulerte for å gjøre møtet håndterlig er nå gjentatt som sikker prognose. Driftsleder spør hvor sikker økonomi egentlig var da beslutningen ble tatt.', relation: 'driftsleder', positiveFlag: 'controller_korrigerte_sikkerheten', negativeFlag: 'controller_forsvarte_det_sikre_tallet', completed: true }),
    scene({ id: 'controller_ls_audit_01', threadId: 'controller_audit_memory', fase: 'formiddag', dag: 3, visningstype: 'melding', avsender: 'revisor', tilgjengelighet: 'start', tittel: 'Revisor ber om grunnen, ikke bare beløpet', tekst: 'Posten kan forklares muntlig av Marius, men underlaget er spredt. Revisor spør etter dokumentasjonen som viser hvem som visste hva da posten ble vurdert.', next: 'controller_ls_audit_02', relation: 'revisor', positiveFlag: 'controller_bygde_revisjonsspor', negativeFlag: 'controller_stolte_paa_muntlig_hukommelse', completed: false }),
    scene({ id: 'controller_ls_audit_02', threadId: 'controller_audit_memory', fase: 'ettermiddag', dag: 6, visningstype: 'samtale', avsender: 'marius_regnskap', tilgjengelighet: 'laast', tittel: 'Marius spør om kontrollen skal lære noe', tekst: 'Når underlaget endelig er samlet, viser det et tilbakevendende hull mellom mottak og periodisering. Marius spør om dere bare skal lukke avviket eller endre prosessen som lager det.', relation: 'marius_regnskap', positiveFlag: 'controller_endret_prosessen', negativeFlag: 'controller_lukket_bare_avviket', completed: true })
  ]
};

writeJson(LIFE_ROLE_PATH, lifeRole);
writeJson(LIFE_THREADS_PATH, lifeThreads);
writeJson(LIFE_SCENES_PATH, lifeScenes);

const manifest = readJson('data/Civication/lifestory/manifest.json');
manifest.roles.controller = {
  role: LIFE_ROLE_PATH,
  threads: LIFE_THREADS_PATH,
  scenes: LIFE_SCENES_PATH,
  role_scope: 'controller',
  badge_id: 'naeringsliv',
  badge_titles: ['Controller', 'Finansanalytiker', 'Økonomi- og finanssjef', 'Finansdirektør']
};
writeJson('data/Civication/lifestory/manifest.json', manifest);

const plan = readJson(PLAN_PATH);
plan.role_id = 'naer_controller';
plan.role_key = 'controller';
plan.main_case = {
  title: 'Tallet som blir beslutning før forklaringen er ferdig',
  premise: 'Månedsrapport, prognose, driftens forklaringer og revisjonsspor trekker i ulike retninger samtidig. Controlleren må gjøre usikkerhet brukbar uten å gjøre den usynlig.'
};
plan.outcome_rules = {
  mastery: [
    'skiller bokførte fakta, estimater og usikkerhet eksplisitt',
    'bygger sporbarhet før rapporten blir beslutningsgrunnlag',
    'bruker kontroll til læring uten å gjøre drift til syndebukk'
  ],
  risk: [
    'gjør ønsket resultat til premiss for klassifisering eller periodisering',
    'sender sikre konklusjoner før rotårsaken er forstått',
    'bruker rapportering slik at drift slutter å dele problemer tidlig'
  ]
};
writeJson(PLAN_PATH, plan);

const sourceRefs = [
  `${JOB_PATH}#job_controller_week1_month_report_before_explanation`,
  `${PEOPLE_PATH}#personal_controller_week1_counting_at_home`,
  `${JOB_PATH}#job_controller_week1_reconciliation_almost_matches`,
  `${PEOPLE_PATH}#personal_controller_week1_friend_not_controlled`,
  `${JOB_PATH}#job_controller_week1_operations_explains_variance`,
  `${CONFLICT_PATH}#controller_conflict_001`,
  `${JOB_PATH}#job_controller_week1_forecast_everyone_wants_certain`,
  `${PEOPLE_PATH}#personal_controller_week1_pattern_in_conversation`,
  `${JOB_PATH}#controller_job_001`,
  `${PEOPLE_PATH}#personal_controller_week1_dinner_as_spreadsheet`,
  `${JOB_PATH}#job_controller_week1_numbers_as_responsibility`,
  `${PEOPLE_PATH}#personal_controller_week1_weekend_without_variance`,
  `${JOB_PATH}#job_controller_week2_variance_did_not_disappear`,
  `${PEOPLE_PATH}#personal_controller_week2_documenting_a_feeling`,
  `${JOB_PATH}#job_controller_week2_operations_stop_explaining`,
  `${PEOPLE_PATH}#personal_controller_week2_friend_says_you_do_not_believe_me`,
  `${JOB_PATH}#job_controller_week2_periodization_or_polishing`,
  `${CONFLICT_PATH}#controller_conflict_002`,
  `${PEOPLE_PATH}#personal_controller_week2_auditing_own_words`,
  `${LIFE_SCENES_PATH}#controller_ls_home_01`,
  `${JOB_PATH}#job_controller_week2_audit_trail`,
  `${EVENT_PATH}#controller_event_001`,
  `${PEOPLE_PATH}#personal_controller_week2_conversation_without_evidence`,
  `${LIFE_SCENES_PATH}#controller_ls_home_02`,
  `${JOB_PATH}#job_controller_week2_numbers_as_governance`,
  `${STORY_PATH}#controller_story_001`,
  `${PEOPLE_PATH}#personal_controller_week2_weekend_without_audit_trail`,
  `${LIFE_SCENES_PATH}#controller_ls_friend_01`,
  `${JOB_PATH}#controller_job_002`,
  `${LIFE_SCENES_PATH}#controller_ls_friend_02`,
  `${STORY_PATH}#controller_story_002`,
  `${LIFE_SCENES_PATH}#controller_ls_family_01`,
  `${MODEL_PATH}#rapportfrist_vs_forklaring`,
  `${MODEL_PATH}#avstemming_uten_underlag`,
  `${MODEL_PATH}#driftens_forklaring`,
  `${LIFE_SCENES_PATH}#controller_ls_family_02`,
  `${MODEL_PATH}#resultatpynt`,
  `${MODEL_PATH}#tall_som_fasit_eller_spor`,
  `${MODEL_PATH}#kontroll_som_stotte_eller_overvaking`,
  `${MODEL_PATH}#periodisering_eller_resultatpynt`,
  `${GRAMMAR_PATH}#bilag`,
  `${GRAMMAR_PATH}#budsjett`,
  `${GRAMMAR_PATH}#prognose`,
  `${LIFE_SCENES_PATH}#controller_ls_pressure_01`,
  `${GRAMMAR_PATH}#datakilder`,
  `${GRAMMAR_PATH}#penere_tall`,
  `${LIFE_SCENES_PATH}#controller_ls_pressure_02`,
  `${PEOPLE_PATH}#personal_controller_week2_conversation_without_evidence`,
  `${LIFE_SCENES_PATH}#controller_ls_audit_01`,
  `${CONFLICT_PATH}#controller_conflict_001`,
  `${LIFE_SCENES_PATH}#controller_ls_audit_02`,
  `${STORY_PATH}#controller_story_001`,
  `${JOB_PATH}#controller_job_001`,
  `${LIFE_SCENES_PATH}#controller_ls_friend_02`,
  `${STORY_PATH}#controller_story_002`,
  `${LIFE_SCENES_PATH}#controller_ls_home_02`
];

const focuses = [
  'Månedsrapporten åpner med et rødt varekostavvik, og spilleren må hindre at et uferdig tall blir ledergruppens ferdige forklaring.',
  'Hjemme merker spilleren at kontrollblikket allerede teller og kategoriserer det som egentlig skulle vært en rolig privat morgen.',
  'En liten avstemmingsdifferanse blir første test på om små tall skal lukkes raskt eller brukes til å finne et mønster i vareflyten.',
  'Jonas reagerer på at nærhet blir møtt med kontrollspørsmål, og privat tillit blir en konkret motvekt til arbeidsdagens beviskrav.',
  'Driftens forklaring utfordrer økonomiens første lesning av avviket og viser at et presist tall fortsatt kan ha en sosialt feil årsaksfortelling.',
  'Driftsleder bestrider en teknisk korrekt, men sosialt blind rapporttekst, og controlleren må skille fakta fra bekvem ansvarsplassering.',
  'Prognosen må leveres før fremtiden kan være sikker, slik at antakelser og intervaller blir en kamp om hva ledelsen skal oppfatte som styrbart.',
  'Et privat mønster blir synlig når spilleren begynner å etterspørre årsaksforklaringer i en samtale som ikke er et analyseoppdrag.',
  'Lagerverdi og bokført verdi peker i ulike retninger, og controlleren må tilbake til fysisk vareflyt før en manuell korreksjon får skjule årsaken.',
  'Middagen blir nesten behandlet som et regneark, og spilleren får kjenne hvordan faglig presisjon kan bli sosial avstand når den aldri slås av.',
  'Første uke samles i spørsmålet om tall er fasit eller spor, og valgene begynner å forme hvilken type kontroll andre forventer fra spilleren.',
  'Helgen gir en første mulighet til å la avvikene ligge igjen på jobb, eller fortsette å føre et usynlig kontrollregnskap over eget privatliv.',
  'Et avvik spilleren tidligere kunne ha lukket raskt kommer tilbake og viser at en pen månedsslutt ikke opphever en uløst rotårsak.',
  'Privat prøver spilleren å dokumentere en følelse før den får lov til å være gyldig, og kontrollspråket møter sin menneskelige grense.',
  'Driften begynner å holde igjen forklaringer fordi rapportering oppleves som overvåking, og controlleren ser hvordan kontrollkultur påvirker datakvalitet.',
  'Jonas sier eksplisitt at han ikke føler seg trodd, slik at relasjonstapet ikke kan bortforklares som et lite kommunikasjonsavvik.',
  'Periodisering blir en etisk gråsone når et reelt tap kan flyttes på papiret og samtidig endre hvordan ledelsen vurderer måneden.',
  'En leder ber om ro før kvartalsslutt, og controlleren må holde grensen mellom legitim regnskapsvurdering og kosmetisk resultatstyring.',
  'Spilleren merker at egen tale blir forhåndsrevidert, som om enhver privat formulering må tåle senere kontroll og sitat.',
  'Jonas setter ord på at ikke alt trenger et kontrollspor, og arbeidets profesjonelle styrke blir samtidig synlig som privat friksjon.',
  'Revisjonssporet testes på et avvik der beløpet kan forklares, men dokumentasjonen fortsatt er for svak til å overleve personskifte og tid.',
  'Revisor ber om underlaget nå, og rapportfristens egentlige kostnad blir tydelig når beviset for tallet ikke er like ferdig som presentasjonen.',
  'En samtale uten bevisføring blir et konkret forsøk på å lytte før man klassifiserer, både som privat ferdighet og som korrektiv til kontrollrollen.',
  'Jonas gir spilleren en ny sjanse til å høre hele historien før delene testes, og relasjonen husker hvordan den første samtalen ble håndtert.',
  'Andre uke løfter tallene fra rapportering til styringsmakt: det som kategoriseres som avvik avgjør hvilke handlinger organisasjonen ser som nødvendige.',
  'Controlleren formulerer rapporten som organisasjonsminne og må synliggjøre hva som er kjent, antatt og fortsatt uavklart.',
  'Helgen uten revisjonsspor tester om spilleren kan la kontroll være et arbeidsverktøy i stedet for en permanent personlig beredskap.',
  'Jonas sier at han trenger å bli møtt som venn, ikke som kilde, og privat tillit får sin egen kontinuitet gjennom sesongen.',
  'En ny prognose samler salg, kampanjekostnad og bemanning i ett styringssignal der optimisme har konkrete følger for andre menneskers planer.',
  'Vennskapet vender tilbake etter tidligere friksjon, og spilleren må vise om innsikten faktisk endrer måten spørsmål stilles på.',
  'Rolleidentiteten skjerpes: kontroll kan gjøre problemer reparerbare eller lære organisasjonen å skjule dem til rapporten allerede har funnet dem.',
  'Søsteren reagerer på fagspråket som sosial statusmarkør og ber om en samtale der hun ikke må konkurrere med profesjonell autoritet.',
  'Rapportfristen blir et idealtypisk problem: kvalitet kan ikke maksimeres i det uendelige, men usikkerhet må fortsatt få en synlig eier.',
  'Manglende underlag viser at et tall kan stemme uten at organisasjonen kan bevise hvorfor, og sporbarhet blir mer enn administrativ pynt.',
  'Driftens forklaring blir et eget faglig problem fordi mennesker med lavere rapportmakt kan vite mer om årsaken enn den som skriver kommentaren.',
  'Søsteren kommer tilbake til statusforskjellen i språket og tvinger spilleren til å velge mellom å forklare enkelt og å beskytte faglig rang.',
  'Resultatpynt formuleres som bekvemmelig timing snarere enn åpen manipulasjon, slik at den virkelige etiske gråsonen blir spillbar.',
  'Tall som fasit eller spor blir en eksplisitt refleksjon over om controlleren avslutter undersøkelsen eller åpner den på riktig sted.',
  'Kontroll som støtte eller overvåking vurderes gjennom hvordan andre faktisk reagerer: kommer de tidligere med problemer, eller senere med penere forklaringer?',
  'Grensen mellom periodisering og resultatpynt blir koblet til rolleidentitet, fordi metode bare virker når controlleren tåler å være den ubekvemme personen.',
  'Bilaget uten tilstrekkelig dokumentasjon gjør internkontroll konkret: å holde posten åpen kan være mer profesjonelt enn å få den til å forsvinne fra listen.',
  'Et uønsket budsjettavvik tester om ledelsesrapporten skal beskrive styringsproblemet eller beskytte organisasjonen mot å se det for tidlig.',
  'Prognosen må skille bokførte fakta, estimater og usikkerhet slik at hastighet ikke får endre evidensstatusen til tallene.',
  'Ingrid trenger ett tall til førstesiden, og spilleren må gjøre et intervall politisk og organisatorisk brukbart uten å late som usikkerheten er borte.',
  'To datakilder viser ulike tall, og uenigheten blir behandlet som informasjon som må rekonsileres i stedet for som et kosmetisk problem.',
  'En leder ønsker en klassifisering som gir penere resultat, og controllerens uavhengighet blir målt i evnen til å avvise et praktisk formulert press.',
  'Det sikre tallet blir sitert som sannhet senere, og spilleren møter konsekvensen av å ha gjort usikkerhet mindre synlig enn beslutningen krevde.',
  'Privat øver spilleren på en samtale uten bevisføring og oppdager at det å lytte ferdig også kan gjøre senere spørsmål bedre, ikke svakere.',
  'Revisor spør etter grunnen og tidspunktet bak en vurdering, slik at organisasjonens hukommelse ikke kan reduseres til hvem som fortsatt husker saken.',
  'Driftskonflikten vender tilbake med mer sosial hukommelse: tidligere rapportstil påvirker hvor villig gulvet er til å dele det som ikke passer i modellen.',
  'Marius viser at samme kontrollavvik gjentar seg i prosessen, og controlleren må velge mellom å lukke saken eller endre systemet som produserer den.',
  'Rapporten som organisasjonsminne vender tilbake når gamle formuleringer brukes som premiss for nye beslutninger ingen av de opprinnelige deltakerne kontrollerer.',
  'Lagerdifferansen brukes som sluttprøve på om spilleren fortsatt leter etter fysisk rotårsak når tempo, erfaring og status gjør en manuell post fristende.',
  'Jonas møter spilleren igjen med hukommelse fra tidligere kontrollspørsmål, og privat reparasjon krever en faktisk annen væremåte, ikke en bedre forklaring.',
  'Rolleidentiteten avsluttes med spørsmålet om hvilken organisasjon tallene trener fram: en som lærer tidlig, eller en som ser ryddig ut sent.',
  'Kvelden samler sesongen hjemme, der spilleren må avgjøre om kontrollblikket kan legges fra seg uten at faglig integritet oppleves som truet.'
];

const beatTypeDays = [
  ['info','relationship','task','private_consequence'],
  ['task','conversation','decision','relationship'],
  ['task','private_consequence','consequence','private_consequence'],
  ['consequence','private_consequence','conversation','relationship'],
  ['decision','conversation','private_consequence','private_consequence'],
  ['task','consequence','relationship','private_consequence'],
  ['consequence','conversation','private_consequence','relationship'],
  ['task','relationship','decision','private_consequence'],
  ['info','task','conversation','private_consequence'],
  ['decision','conversation','decision','relationship'],
  ['task','social','task','conversation'],
  ['task','decision','consequence','private_consequence'],
  ['consequence','conversation','decision','social'],
  ['task','relationship','consequence','private_consequence']
];
const phases = ['morning', 'lunch', 'afternoon', 'evening'];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let phaseIndex = 0; phaseIndex < 4; phaseIndex += 1) {
    const index = (day - 1) * 4 + phaseIndex;
    coverage.push({
      day,
      phase: phases[phaseIndex],
      beat_type: beatTypeDays[day - 1][phaseIndex],
      summary: `Dag ${day}, ${phases[phaseIndex]}: ${focuses[index]}`,
      materialization_refs: [sourceRefs[index]]
    });
  }
}

const npc = (id, social_function, class_position, status, power_over_player, wants, conceals, speech_style, teaches_player) => ({ id, social_function, class_position, status, power_over_player, wants, conceals, speech_style, teaches_player });
const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'naeringsliv',
  role_scope: 'controller',
  title: 'Controller — tallene som får organisasjonen til å handle',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Å utøve definisjonsmakt gjennom tall uten å gjøre måling, klassifisering og rapportering til en penere virkelighet enn organisasjonen faktisk har grunnlag for.',
    description: 'Controlleren står mellom regnskap, drift, ledelse og revisjon. Rollen gjør komplekse hendelser lesbare gjennom tall, men må samtidig beskytte organisasjonen mot falsk sikkerhet, kosmetisk resultatstyring og kontrollformer som gjør at mennesker skjuler problemer før de kan forstås.'
  },
  theme_ids: ['numerical_control', 'bureaucratic_power', 'loyalty_up_down', 'status_anxiety'],
  social_environments: [
    'månedsrapporten og økonomisystemet der avvik blir synlige før årsakene er forstått',
    'driftsmøtet der fysisk vareflyt, bemanning og kampanjer møter økonomiens kategorier',
    'ledergruppen der korte styringssignaler kan bli beslutninger før usikkerheten rekker å følge med',
    'revisjonssporet der muntlig kunnskap må overleve som etterprøvbar dokumentasjon',
    'prognose- og budsjettarbeidet der fremtiden forhandles gjennom antakelser, scenarioer og status',
    'vennskap og familie der kontrollspørsmål, fagspråk og profesjonell autoritet kan følge spilleren hjem'
  ],
  recurring_people_archetypes: [
    npc('ingrid_okonomisjef','linjeleder som trenger beslutningsklar styringsinformasjon','økonomileder med formell myndighet og direkte tilgang til toppledelsen','høy formell status','setter frister, prioriterer rapportpakker og påvirker spillerens videre ansvar','at tallene er presise nok til å styre og korte nok til å bli brukt','hvor ofte hun selv må velge mellom synlig usikkerhet og et tydelig budskap oppover','kort, rolig og resultatorientert; spør hva hun trygt kan si i møtet','at ledelseslojalitet ikke er det samme som å levere ønsket konklusjon'),
    npc('marius_regnskap','underlags- og avstemmingspartner som kjenner postene bak rapporten','fagmedarbeider med høy detaljkunnskap, men mindre organisatorisk status enn ledelsen','sideordnet fagstatus','kan gjøre et tall etterprøvbart eller vise at sporet ikke holder','at avstemminger lukkes med reelt underlag og at små differanser ikke blir permanent normalitet','hvor mye historisk praksis som bygger på muntlige snarveier han selv har lært å leve med','detaljert og pragmatisk; peker ofte på filen, bilaget eller mottakslinjen som mangler','at intern kontroll er hverdagsarbeid, ikke bare revisjonens krav'),
    npc('driftsleder','operativ kunnskapsbærer som forklarer hva tallene betyr på gulvet','leder nær produksjon og vareflyt med ansvar for mennesker og praktisk gjennomføring','høy lokal status, lavere rapportmakt enn økonomiledelsen','kan gi eller holde tilbake årsaksforklaringer som økonomi trenger for å forstå avvik','at rapporten beskriver faktisk drift uten å gjøre teamet til enkel skyldmarkør','hvor raskt kontroll som oppleves urettferdig kan få driften til å rydde historien før den deles','konkret, rask og situasjonsnær; begynner med hva som faktisk skjedde','at datakvalitet også avhenger av sosial tillit mellom kontroll og drift'),
    npc('revisor','ekstern eller uavhengig leser som krever at organisasjonen kan vise hvorfor tall og vurderinger står der','spesialist med høy institusjonell legitimitet, men uten å eie den daglige driften','høy kontrollstatus','kan gjøre svake spor til formelle funn og tvinge fram dokumentasjon som fristen helst ville utsette','at vurderinger, periodiseringer og avvik har tydelig evidens og beslutningsspor','at også revisjon prioriterer og at ikke alle spørsmål har samme risiko eller verdi','nøktern, ordnær og kildeorientert; spør hvem, når, hvorfor og hvor det kan etterprøves','forskjellen mellom et plausibelt tall og en etterprøvbar vurdering'),
    npc('markedssjef','intern aktør som lever av å skape fremtidig effekt og derfor ofte har optimistiske premisser','leder med budsjett, synlighet og tilgang til beslutningstakere','høy prosjektstatus','kan levere antakelser som raskt blir prognosepremisser og presse på for å vente med negative konklusjoner','at kampanjeeffekter får tid til å materialisere seg før de dømmes','hvor stor del av optimismen som også beskytter eget omdømme og neste budsjett','energisk, fremoverskuende og sannsynlighetsorientert; snakker om hva som kommer','at prognoser fordeler ansvar før fremtiden faktisk har skjedd'),
    npc('innkjoper','kilde til pris-, avtale- og leverandørforklaringer bak varekost','spesialist med kommersiell informasjon og forhandlingsrelasjoner som økonomi ikke eier','middels formell status, høy informasjonsmakt','kan forklare kostnadsavvik eller gjøre dem vanskeligere å tolke hvis avtaleendringer ikke er dokumentert','at controlleren forstår timing, prisendringer og leverandørbetingelser før konklusjon','hvor mye som fortsatt er uavklart i forhandlinger og derfor ikke passer i en endelig kommentar','kommersiell og konkret; skiller mellom listepris, avtale, tidspunkt og faktisk faktura','at økonomiske tall er endepunktet for mange relasjoner og beslutninger utenfor regnearket'),
    npc('venn','privat korrektiv til kontrollblikket og krav om evidens','likemann uten institusjonell makt over spilleren','høy emosjonell betydning, ingen arbeidsrang','kan trekke seg unna når nærhet behandles som et problem som skal dokumenteres og lukkes','å bli hørt og trodd før opplevelsen hans blir analysert','hvor slitsomt det er å konkurrere med spillerens profesjonelle språk og metodiske sikkerhet','uformell, direkte og tidvis ironisk; sier raskt når samtalen føles som et møte','at privat tillit ikke er lavere evidensstandard, men en annen sosial relasjon'),
    npc('familie','nær relasjon som leser spillerens status og språk utenfra','ordinær by- og arbeidslivsdeltaker uten økonomifaglig institusjonsmakt','emosjonell nærhet med sterk sosial korrektivkraft','kan gjøre profesjonell identitet personlig og synliggjøre når faglig rang skaper avstand','et søskenforhold der hun kan spørre og motsi uten å bli undervist','at stolthet og irritasjon kan eksistere samtidig når spillerens status endrer samtaleformen','hverdagslig, konkret og personlig; ber om hvem og hva når språket blir abstrakt','hvordan statusangst og profesjonell maske kan leve videre etter arbeidstid')
  ],
  slow_axes: [
    { id: 'traceability', meaning: 'om forklaringer, vurderinger og rapportlinjer kan spores tilbake til underlag og ansvar', runtime_binding: 'existing' },
    { id: 'trust_drift', meaning: 'om driften opplever controllerens kontroll som hjelp til å forstå eller som overvåking de må beskytte seg mot', runtime_binding: 'existing' },
    { id: 'trust_manager', meaning: 'ledelsens tillit til at spilleren kan levere styringsinformasjon uten å skjule vesentlig usikkerhet', runtime_binding: 'existing' },
    { id: 'relationship_private', meaning: 'hvor godt spilleren klarer å holde profesjonell kontrollmetode fra å bli standardform i nære relasjoner', runtime_binding: 'existing' },
    { id: 'future_risk', meaning: 'akkumulert risiko når raske eller pene løsninger utsetter den egentlige årsaken', runtime_binding: 'existing' }
  ],
  season: { days: 14, day_phases: phases, coverage },
  primary_threads: [
    { id: 'deadline_truth', relationship: 'Ingrid og spilleren: beslutningsklarhet uten falsk sikkerhet', beat_refs: ['1/morning','2/afternoon','4/morning','5/morning','11/afternoon','14/afternoon'] },
    { id: 'drift_trust', relationship: 'Driftsleder og spilleren: fra avviksforklaring til kontrollkultur', beat_refs: ['1/afternoon','2/morning','2/lunch','4/afternoon','6/afternoon','7/morning','13/lunch'] },
    { id: 'audit_memory', relationship: 'Marius/revisor og spilleren: fra avstemming til organisatorisk hukommelse', beat_refs: ['1/afternoon','6/morning','6/lunch','10/lunch','11/morning','13/morning','13/afternoon'] },
    { id: 'private_control', relationship: 'Jonas og spilleren: kontrollblikk, tillit og reparasjon hjemme', beat_refs: ['1/lunch','1/evening','2/evening','5/evening','6/evening','7/evening','8/lunch','14/evening'] },
    { id: 'result_polishing', relationship: 'Controlleren og ledelsessystemet: periodisering, ønsket resultat og faglig uavhengighet', beat_refs: ['3/morning','5/morning','5/lunch','10/morning','10/afternoon','11/lunch','12/lunch','14/morning'] },
    { id: 'status_identity', relationship: 'Spilleren, familie og rolleidentitet: hva kontrollstatus gjør med selvbilde og språk', beat_refs: ['3/afternoon','7/lunch','8/afternoon','8/evening','9/evening','10/evening','11/evening','14/lunch'] }
  ],
  private_aftermath: [
    { id: 'control_language_home', description: 'Kontrollspørsmål og krav om dokumentasjon følger spilleren hjem og påvirker om Jonas opplever seg trodd.', materialization_refs: [`${LIFE_SCENES_PATH}#controller_ls_home_01`, `${LIFE_SCENES_PATH}#controller_ls_home_02`] },
    { id: 'friend_trust', description: 'Vennskapet kan repareres når spilleren endrer samtaleform, ikke bare forklarer hvorfor kontrollblikket finnes.', materialization_refs: [`${LIFE_SCENES_PATH}#controller_ls_friend_01`, `${LIFE_SCENES_PATH}#controller_ls_friend_02`] },
    { id: 'family_status', description: 'Fagspråk og profesjonell status blir synlig i familien og kan enten skape avstand eller oversettes til vanlig språk.', materialization_refs: [`${LIFE_SCENES_PATH}#controller_ls_family_01`, `${LIFE_SCENES_PATH}#controller_ls_family_02`] },
    { id: 'weekend_without_variance', description: 'Praksisukene lar spilleren prøve å avslutte arbeidsukens kontrollregnskap før helgen blir en ny rapportflate.', materialization_refs: [`${PEOPLE_PATH}#personal_controller_week1_weekend_without_variance`, `${PEOPLE_PATH}#personal_controller_week2_weekend_without_audit_trail`] },
    { id: 'identity_pressure', description: 'Behovet for alltid å ha et sikkert svar kan øke status på jobb og samtidig gjøre usikkerhet vanskeligere å tåle privat.', materialization_refs: [`${LIFE_SCENES_PATH}#controller_ls_pressure_01`, `${LIFE_SCENES_PATH}#controller_ls_pressure_02`] }
  ],
  delayed_consequences: [
    { id: 'unexplained_variance_returns', setup_ref: '1/morning', return_ref: '4/morning', domains: ['job','reputation','narrative'] },
    { id: 'control_changes_disclosure', setup_ref: '2/lunch', return_ref: '7/morning', domains: ['job','relationship','narrative'] },
    { id: 'certainty_becomes_quote', setup_ref: '8/morning', return_ref: '12/afternoon', domains: ['job','reputation'] },
    { id: 'private_evidence_cost', setup_ref: '1/evening', return_ref: '8/lunch', domains: ['relationship','psyche'] },
    { id: 'audit_trail_becomes_process', setup_ref: '6/morning', return_ref: '13/afternoon', domains: ['job','narrative'] },
    { id: 'polishing_shapes_identity', setup_ref: '5/morning', return_ref: '14/afternoon', domains: ['job','reputation','narrative'] }
  ],
  materialization: {
    no_new_runtime: true,
    source_refs: [MODEL_PATH, GRAMMAR_PATH, PLAN_PATH, JOB_PATH, PEOPLE_PATH, CONFLICT_PATH, STORY_PATH, EVENT_PATH, LIFE_ROLE_PATH, LIFE_THREADS_PATH, LIFE_SCENES_PATH]
  }
};
writeJson(ROLE_WORLD_PATH, world);

const index = readJson('data/Civication/roleWorlds/index.json');
const controllerEntry = { category: 'naeringsliv', role_scope: 'controller', status: 'role_world_complete', path: ROLE_WORLD_PATH };
index.roles = (index.roles || []).filter((entry) => !(entry.category === 'naeringsliv' && entry.role_scope === 'controller'));
index.roles.push(controllerEntry);
index.status = 'four_reference_worlds_materialized';
index.fourth_reference_world = { category: 'naeringsliv', role_scope: 'controller', status: 'role_world_complete' };
index.note = 'Role World-completion er strengere enn Career Gameplay Matrix-status. Ekspeditør, Renholder, By-rådgiver og Controller er de fire første registrerte reference worlds og må hver beholde 14-dagers dekning, sosiale relasjoner, privat etterklang, forsinkede konsekvenser og reell materialiseringsprovenance.';
writeJson('data/Civication/roleWorlds/index.json', index);

const policy = readJson('data/Civication/roleWorldPolicy.json');
policy.fourth_reference_world = { category: 'naeringsliv', role_scope: 'controller', status: 'role_world_complete' };
policy.next_reference_world = { category: 'sport', role_scope: 'sport_utover' };
policy.later_reference_candidates = [];
writeJson('data/Civication/roleWorldPolicy.json', policy);

const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
if (!checklist.reference_worlds.includes(ROLE_WORLD_PATH)) checklist.reference_worlds.push(ROLE_WORLD_PATH);
checklist.next_reference_world = { category: 'sport', role_scope: 'sport_utover' };
writeJson('data/Civication/roleWorldAuthoringChecklist.json', checklist);

let standard = readText('docs/CIVICATION_ROLE_WORLD_STANDARD.md');
standard = standard.replace('De tre første reference Role Worlds er nå materialisert og permanent testet:', 'De fire første reference Role Worlds er nå materialisert og permanent testet:');
standard = standard.replace('by/by_radgiver_plan     → role_world_complete\n```', 'by/by_radgiver_plan     → role_world_complete\nnaeringsliv/controller  → role_world_complete\n```');
standard = standard.replace('Ekspeditør, Renholder og By-rådgiver er strukturreferanser for metoden, ikke innholdsmaler som senere roller skal kopiere. By-rådgiver beviser at standarden også fungerer i en kunnskaps- og forvaltningsverden der byråkratisk makt, lokal kunnskap, planjuss, politisk lesbarhet og lojalitet oppover/nedover må holdes fra hverandre uten å miste sammenheng.\n\nNeste reference Role World er:\n\n```text\nnaeringsliv/controller\n```\n\nController skal teste samme authoring-prosess i en tall- og kontrollverden der målinger, avvik, budsjett, styringsinformasjon og organisatorisk lojalitet kan gjøre virkeligheten mer lesbar — eller skjule det tallene ikke fanger.\n\nDeretter følger:\n\n```text\nsport/sport_utover\n```', 'Ekspeditør, Renholder, By-rådgiver og Controller er strukturreferanser for metoden, ikke innholdsmaler som senere roller skal kopiere. Controller beviser at standarden også fungerer i en tall- og kontrollverden der målinger, avvik, budsjett, revisjonsspor og organisatorisk lojalitet kan gjøre virkeligheten mer lesbar — eller skjule det tallene ikke fanger.\n\nNeste reference Role World er:\n\n```text\nsport/sport_utover\n```');
writeText('docs/CIVICATION_ROLE_WORLD_STANDARD.md', standard);

let guide = readText('docs/CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md');
guide = guide.replace('De tre første reference worlds er materialisert:', 'De fire første reference worlds er materialisert:');
guide = guide.replace('by/by_radgiver_plan     → role_world_complete\n```', 'by/by_radgiver_plan     → role_world_complete\nnaeringsliv/controller  → role_world_complete\n```');
guide = guide.replace('De viser at samme produksjonsmetode kan bære servicearbeid, usynlig fysisk arbeid og kommunal kunnskaps-/forvaltningsmakt uten å kopiere innhold, NPC-er eller konfliktakser.\n\nNeste reference Role World er:\n\n```text\nnaeringsliv/controller\n```\n\nDeretter:\n\n```text\nsport/sport_utover\n```', 'De viser at samme produksjonsmetode kan bære servicearbeid, usynlig fysisk arbeid, kommunal kunnskaps-/forvaltningsmakt og økonomisk tall-/kontrollarbeid uten å kopiere innhold, NPC-er eller konfliktakser.\n\nNeste reference Role World er:\n\n```text\nsport/sport_utover\n```');
writeText('docs/CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md', guide);

let contractTest = readText('tests/civication-role-world-contract.test.js');
if (!contractTest.includes('policy.fourth_reference_world')) {
  contractTest = contractTest.replace(
    "assert.equal(policy.third_reference_world.role_scope, 'by_radgiver_plan');\nassert.ok(String(policy.next_reference_world.category || '').trim());",
    "assert.equal(policy.third_reference_world.role_scope, 'by_radgiver_plan');\nassert.deepEqual(policy.fourth_reference_world, index.fourth_reference_world);\nassert.equal(policy.fourth_reference_world.status, 'role_world_complete');\nassert.equal(policy.fourth_reference_world.category, 'naeringsliv');\nassert.equal(policy.fourth_reference_world.role_scope, 'controller');\nassert.ok(String(policy.next_reference_world.category || '').trim());"
  );
}
contractTest = contractTest.replace("assert.equal(completeWorlds.length, 3, 'The third Role World production wave must expose exactly three completed reference worlds');", "assert.equal(completeWorlds.length, 4, 'The fourth Role World production wave must expose exactly four completed reference worlds');");
if (!contractTest.includes("Controller must be the fourth completed Role World")) {
  contractTest = contractTest.replace(
    "assert.deepEqual(referenceIdentity(completeWorlds[2]), index.third_reference_world);",
    "assert.deepEqual(referenceIdentity(completeWorlds[2]), index.third_reference_world);\nassert.deepEqual(referenceIdentity(completeWorlds[3]), {\n  category: 'naeringsliv',\n  role_scope: 'controller',\n  status: 'role_world_complete'\n}, 'Controller must be the fourth completed Role World');\nassert.deepEqual(referenceIdentity(completeWorlds[3]), index.fourth_reference_world);"
  );
}
writeText('tests/civication-role-world-contract.test.js', contractTest);

const controllerTest = `#!/usr/bin/env node\nconst assert = require('node:assert/strict');\nconst fs = require('node:fs');\nconst path = require('node:path');\nconst { execFileSync } = require('node:child_process');\n\nconst ROOT = path.resolve(__dirname, '..');\nconst rel = (p) => path.join(ROOT, p);\nconst readJson = (p) => JSON.parse(fs.readFileSync(rel(p), 'utf8'));\nconst worldPath = 'data/Civication/roleWorlds/naeringsliv/controller.json';\nconst modelPath = 'data/Civication/roleModels/naeringsliv/controller.json';\nconst matrixPath = 'data/Civication/careerGameplayMatrix.json';\nconst themeBankPath = 'data/Civication/roleWorldThemeBank.json';\nconst manifestPath = 'data/Civication/lifestory/manifest.json';\nconst planPath = 'data/Civication/mailPlans/naeringsliv/controller_plan.json';\nconst world = readJson(worldPath);\nconst model = readJson(modelPath);\nconst matrix = readJson(matrixPath);\nconst themeBank = readJson(themeBankPath);\nconst manifest = readJson(manifestPath);\nconst plan = readJson(planPath);\n\nassert.equal(world.schema, 'civication_role_world_v1');\nassert.equal(world.category, 'naeringsliv');\nassert.equal(world.role_scope, 'controller');\nassert.equal(world.status, 'role_world_complete');\nassert.equal(world.season.days, 14);\nassert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);\nassert.equal(world.season.coverage.length, 56);\nassert.deepEqual(world.theme_ids, themeBank.reference_profiles['naeringsliv/controller']);\n\nconst coverage = new Map();\nconst summaries = new Set();\nfor (const beat of world.season.coverage) {\n  const key = beat.day + '/' + beat.phase;\n  assert.ok(!coverage.has(key), 'duplicate coverage ' + key);\n  coverage.set(key, beat);\n  assert.ok(String(beat.summary || '').trim().length >= 70, key + ': thin summary');\n  assert.ok(!summaries.has(beat.summary), key + ': duplicate summary');\n  summaries.add(beat.summary);\n}\nfor (let day = 1; day <= 14; day += 1) for (const phase of ['morning','lunch','afternoon','evening']) assert.ok(coverage.has(day + '/' + phase));\n\nconst identifierFields = new Set(['id','mail_id','scene_id','scenario_id','story_id','thread_id','event_id','key']);\nfunction collect(value, out = new Set()) {\n  if (Array.isArray(value)) { for (const item of value) collect(item, out); return out; }\n  if (!value || typeof value !== 'object') return out;\n  for (const [key, item] of Object.entries(value)) {\n    if (identifierFields.has(key) && (typeof item === 'string' || typeof item === 'number')) out.add(String(item));\n    collect(item, out);\n  }\n  return out;\n}\nconst cache = new Map();\nconst use = new Map();\nfunction verifyRef(refString) {\n  const i = String(refString).indexOf('#');\n  assert.ok(i > 0 && i < String(refString).length - 1, 'materialization ref must be file#id: ' + refString);\n  const file = String(refString).slice(0, i);\n  const id = String(refString).slice(i + 1);\n  assert.ok(fs.existsSync(rel(file)), 'missing file ' + file);\n  let ids = cache.get(file);\n  if (!ids) { ids = collect(readJson(file)); cache.set(file, ids); }\n  assert.ok(ids.has(id), 'missing id ' + id + ' in ' + file);\n  use.set(refString, (use.get(refString) || 0) + 1);\n}\nfor (const beat of world.season.coverage) beat.materialization_refs.forEach(verifyRef);\nfor (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyRef);\nassert.ok(use.size >= 45, 'expected broad Controller provenance, got ' + use.size);\nconst seasonUse = new Map();\nfor (const beat of world.season.coverage) for (const refString of beat.materialization_refs) seasonUse.set(refString, (seasonUse.get(refString) || 0) + 1);\nassert.ok(Math.max(...seasonUse.values()) <= 4, 'no single source may carry more than four season beats');\n\nassert.ok(world.recurring_people_archetypes.length >= 8);\nconst npcIds = new Set(world.recurring_people_archetypes.map((entry) => entry.id));\nfor (const id of ['ingrid_okonomisjef','marius_regnskap','driftsleder','revisor','markedssjef','innkjoper','venn','familie']) assert.ok(npcIds.has(id), 'missing NPC ' + id);\nassert.ok(world.primary_threads.length >= 6);\nfor (const thread of world.primary_threads) {\n  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);\n  const days = new Set();\n  for (const ref of thread.beat_refs) { assert.ok(coverage.has(ref), 'missing beat ' + ref); days.add(Number(ref.split('/')[0])); }\n  assert.ok(days.size >= 3, thread.id + ': must span at least three days');\n}\nconst phaseOrder = new Map([['morning',0],['lunch',1],['afternoon',2],['evening',3]]);\nconst orderOf = (ref) => { const [day, phase] = ref.split('/'); return Number(day) * 10 + phaseOrder.get(phase); };\nassert.ok(world.delayed_consequences.length >= 6);\nfor (const item of world.delayed_consequences) { assert.ok(coverage.has(item.setup_ref)); assert.ok(coverage.has(item.return_ref)); assert.ok(orderOf(item.return_ref) > orderOf(item.setup_ref)); }\nassert.equal(world.materialization.no_new_runtime, true);\n\nassert.equal(model.role_scope, 'controller');\nassert.equal(model.role_id, 'naer_controller');\nconst resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');\nassert.equal(resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', role_id: 'naer_controller' }), 'controller');\nassert.equal(resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', title: 'Controller' }), 'controller');\nassert.ok(plan.outcome_rules.mastery.length >= 3);\nassert.ok(plan.outcome_rules.risk.length >= 3);\n\nconst life = manifest.roles.controller;\nassert.ok(life);\nassert.equal(life.role_scope, 'controller');\nassert.equal(life.badge_id, 'naeringsliv');\nconst lifeApi = require('../js/Civication/lifestory/lifestoryContent.js');\nlifeApi.buildContent({\n  role: readJson(life.role),\n  phaseDefinitions: readJson('data/Civication/lifestory/shared/phaseDefinitions.json'),\n  roleThreads: readJson(life.threads),\n  roleScenes: readJson(life.scenes),\n  lifeThreads: readJson('data/Civication/lifestory/life/threads.json'),\n  lifeScenes: readJson('data/Civication/lifestory/life/scenes.json')\n});\n\nexecFileSync(process.execPath, ['tests/civication-controller-two-week-flow.test.js'], { cwd: ROOT, stdio: 'pipe' });\nexecFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });\nconst career = matrix.worlds.find((entry) => entry.key === 'naeringsliv/controller');\nassert.ok(career);\nassert.equal(career.status, 'reference_complete');\nassert.equal(career.audit.complete_components.length, 15);\nassert.equal(career.audit.missing_components.length, 0);\nassert.equal(career.audit.life_story_complete, true);\nassert.deepEqual(career.audit.practice_weeks, ['1','2']);\nconsole.log('civication-controller-role-world.test.js: PASS');\n`;
writeText('tests/civication-controller-role-world.test.js', controllerTest);

run(['scripts/build-civication-scene-registry.mjs', '--write']);
run(['scripts/audit-civication-career-gameplay.mjs', '--write']);
run(['tests/civication-controller-first-week-praksisfortellinger.test.js']);
run(['tests/civication-controller-second-week-praksisfortellinger.test.js']);
run(['tests/civication-controller-two-week-flow.test.js']);
run(['tests/civication-controller-role-world.test.js']);
run(['tests/civication-role-world-contract.test.js']);
run(['scripts/build-civication-scene-registry.mjs', '--check']);
run(['scripts/audit-civication-career-gameplay.mjs', '--check']);

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = matrix.worlds.find((entry) => entry.key === 'naeringsliv/controller');
if (!career || career.status !== 'reference_complete' || career.audit.complete_components.length !== 15 || career.audit.missing_components.length !== 0 || !career.audit.life_story_complete) {
  throw new Error('Controller failed final Career Gameplay reference_complete gate');
}
console.log('Controller Role World materialization: PASS');
