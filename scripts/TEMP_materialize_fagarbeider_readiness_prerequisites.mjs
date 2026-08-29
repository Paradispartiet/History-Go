#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`);
const KEY = 'naeringsliv/fagarbeider';
const ROLE = 'fagarbeider';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/fagarbeider.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/fagarbeider.json';
const FAMILY_ID = 'fagarbeider_profesjonelle_arbeidsrelasjoner';
const EXPECTED_DEBT = ['career:people', 'people_places_integrity', 'situated_reputation'];
const WORKPLACES = [
  'oppdrags_og_befaringsflate',
  'fag_og_utstyrsplass',
  'kvalitets_og_avvikspunkt',
  'overleverings_og_opplaeringsflate'
];

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const target = (readiness.rollout_queue || []).find((row) => row.key === KEY);
if (!target) throw new Error(`${KEY}: missing from rollout queue`);
if (target.classification !== 'needs_role_authored_work') throw new Error(`${KEY}: expected needs_role_authored_work, got ${target.classification}`);
if (JSON.stringify(target.blockers || []) !== '[]') throw new Error(`${KEY}: blockers must be empty`);
if (JSON.stringify(target.authored_work_required || []) !== JSON.stringify(EXPECTED_DEBT)) {
  throw new Error(`${KEY}: readiness debt changed: ${JSON.stringify(target.authored_work_required)}`);
}
if (target.cross_role_need !== 'not_required_for_rollout') throw new Error(`${KEY}: cross-role need changed`);
if (fs.existsSync(path.join(ROOT, WORLD_PATH))) throw new Error(`${KEY}: Role World already exists; prerequisite materializer refuses to run`);

const plan = read(PLAN_PATH);
if (plan.id !== 'fagarbeider_naeringsliv_v3' || plan.role_scope !== ROLE || !Array.isArray(plan.sequence) || plan.sequence.length <= 20) {
  throw new Error('Fagarbeider canonical plan identity/length drift');
}
for (let i = 0; i < 20; i += 1) {
  const step = plan.sequence[i];
  const expectedType = i % 2 === 0 ? 'job' : 'people';
  if (step.step !== i + 1 || step.type !== expectedType || JSON.stringify(step.fallback_types) !== '[]') {
    throw new Error(`Fagarbeider two-week practice step ${i + 1} drift`);
  }
}
if (plan.sequence[20]?.step !== 21 || plan.sequence[20]?.type !== 'job') throw new Error('Fagarbeider post-practice arc drift at step 21');
if (plan.sequence.some((step) => (step.allowed_families || []).includes(FAMILY_ID))) throw new Error('Prerequisite family is already wired into canonical plan');

const model = read(MODEL_PATH);
if (model.category !== 'naeringsliv' || model.role_scope !== ROLE || model.role_id !== 'naeringsliv_fagarbeider') throw new Error('Fagarbeider role-model identity drift');
if (JSON.stringify(model.work_life?.workplaces || []) !== JSON.stringify(WORKPLACES)) throw new Error('Fagarbeider work-life workplace drift');
if (JSON.stringify((model.related_places || []).map((row) => row.id)) !== JSON.stringify(WORKPLACES)) throw new Error('Fagarbeider related-place drift');
if (JSON.stringify(model.related_people || []) !== '[]') throw new Error(`Fagarbeider related_people already authored: ${JSON.stringify(model.related_people)}`);
for (const boundary of [
  'arbeide utenfor nødvendig kompetanse',
  'omgå sikkerhetssperrer eller påkrevde kontrollsteg',
  'selvgodkjenne alvorlige avvik uten rett kontrollfunksjon',
  'skjule feil for å beskytte tempo, kolleger eller egen status'
]) if (!(model.authority_boundary?.may_not || []).includes(boundary)) throw new Error(`Fagarbeider authority boundary drift: ${boundary}`);

const people = read(PEOPLE_PATH);
if (people.category !== 'naeringsliv' || people.role_scope !== ROLE || people.mail_type !== 'people') throw new Error('Fagarbeider People catalog identity drift');
if ((people.families || []).some((family) => family.id === FAMILY_ID)) throw new Error(`${FAMILY_ID}: already exists`);
for (const familyId of ['uformell_mentor', 'kollega_med_snarveier', 'taus_fagrespekt', 'ansvar_som_glir']) {
  if (!(people.families || []).some((family) => family.id === familyId)) throw new Error(`Existing Fagarbeider People family drift: ${familyId}`);
}

const jobSource = read('data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json');
const jobMails = (jobSource.families || []).flatMap((family) => family.mails || []);
const firstInspection = jobMails.find((mail) => mail.id === 'job_fagarbeider_week1_first_inspection');
if (!firstInspection || !JSON.stringify(firstInspection).includes('Rune') || !JSON.stringify(firstInspection).includes('Amir')) {
  throw new Error('Canonical Rune/Amir first-inspection source drift');
}

const actors = [
  {
    id: 'rune_arbeidsleder_fagarbeider',
    name: 'Rune',
    role: 'arbeidsleder',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Fordeler konkrete oppdrag, prioriterer mellom tid og kvalitet og krever at risiko eller uklart mandat blir løftet tidlig nok til at arbeidet kan styres uten at fagarbeideren absorberer lederansvar.',
    authority_relation: 'Rune kan prioritere arbeid, avklare oppdrag og kreve eskalering innen sitt arbeidsledermandat, men kan ikke gjøre spillerens faglige standing til formell godkjenningsrett eller be spilleren arbeide utenfor kompetanse og sikkerhetsgrense.',
    mail_family_refs: [FAMILY_ID, 'ansvar_som_glir'],
    workplace_ids: ['oppdrags_og_befaringsflate'],
    source_scene_refs: ['data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json#job_fagarbeider_week1_first_inspection']
  },
  {
    id: 'amir_erfaren_fagarbeider',
    name: 'Amir',
    role: 'erfaren fagarbeider',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Er en erfaren faglig likemann som gjør taus kunnskap, standard og praktiske snarveier sosialt synlige, slik at spilleren må skille verdifull erfaringskunnskap fra vaner som flytter risiko til neste ledd.',
    authority_relation: 'Amir kan demonstrere praksis, utfordre vurderinger og dele kollegial faglig erfaring, men har ikke automatisk personal-, godkjennings- eller kontrollmyndighet over spilleren og kan ikke legitimere sikkerhetsbypass gjennom erfaring alene.',
    mail_family_refs: [FAMILY_ID, 'kollega_med_snarveier', 'uformell_mentor'],
    workplace_ids: ['fag_og_utstyrsplass'],
    source_scene_refs: ['data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json#job_fagarbeider_week1_first_inspection']
  },
  {
    id: 'selma_kvalitetskontakt_fagarbeider',
    name: 'Selma',
    role: 'kvalitets- og HMS-kontakt',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Leser avvik, kontrollspor og sikkerhetsgrunnlag fra et etterprøvingsperspektiv og gjør skillet mellom lokal korrigering og forhold som må til riktig kontrollfunksjon konkret for fagarbeideren.',
    authority_relation: 'Selma kan kreve dokumentasjon, stoppe en uklar kontrollsløyfe og løfte alvorlige avvik til riktig funksjon, men hun overfører ikke sin kontrollrolle til spilleren og kan ikke gjøre faglig tillit til rett til å selvgodkjenne alvorlige avvik.',
    mail_family_refs: [FAMILY_ID, 'taus_fagrespekt'],
    workplace_ids: ['kvalitets_og_avvikspunkt'],
    source_scene_refs: ['data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json#sluttkontroll']
  },
  {
    id: 'liv_laerling_fagarbeider',
    name: 'Liv',
    role: 'lærling i fagarbeid',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Må kunne overta en arbeidsoperasjon trygt og stiller spørsmål som tvinger spilleren til å gjøre taus fagkunnskap, restarbeid og risikogrense eksplisitt i stedet for å lære bort ubegrunnede snarveier.',
    authority_relation: 'Liv har rett til forståelig og sikker opplæring, men hennes behov for hjelp gir ikke spilleren ledermandat; spilleren kan lære bort innen eget faglige mandat, mens godkjenning, bemanning og arbeid utenfor kompetanse fortsatt tilhører riktige roller.',
    mail_family_refs: [FAMILY_ID, 'uformell_mentor'],
    workplace_ids: ['overleverings_og_opplaeringsflate'],
    source_scene_refs: ['data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json#overlevering']
  }
];

const mail = ({ id, actor, place, subject, summary, situation, choices }) => ({
  id,
  mail_type: 'people',
  mail_family: FAMILY_ID,
  role_scope: ROLE,
  phase: 'early',
  priority: 72,
  cooldown: 2,
  repeatable: false,
  stage: 'stable',
  actor_id: actor,
  person_id: actor,
  people_ref: actor,
  place_id: place,
  channel: 'work',
  messageChannel: 'work',
  mail_class: 'professional_message',
  subject,
  summary,
  purpose: 'Readiness-prerequisite: koble typed profesjonell relasjon til eksisterende Fagarbeider-arbeidsflate uten å endre canonical plan eller formell myndighet.',
  stakes: 'Valget påvirker samarbeid, sporbarhet og faglig tillit, men kan aldri gi ny formell myndighet eller erstatte kompetanse- og sikkerhetsgrensen.',
  situation,
  choices
});
const choice = (id, label, reply, feedback, stats, flags = []) => ({
  id,
  label,
  reply,
  effect: 0,
  tags: ['professional_relationship', ...flags],
  feedback,
  effects: { stats }
});

const professionalMails = [
  mail({
    id: 'fagarbeider_people_rune_oppdrag_001',
    actor: actors[0].id,
    place: 'oppdrags_og_befaringsflate',
    subject: 'Før du starter: hvem eier den siste avklaringen?',
    summary: 'Rune sender et oppdrag som ser lite ut, men arbeidsgrunnlaget har én kritisk uklarhet. Scenen trener skillet mellom å være selvstendig fagarbeider og å absorbere lederens beslutningsansvar: spilleren må enten synliggjøre avklaringen eller gjøre en antakelse som senere kan se ut som faglig sikkerhet.',
    situation: [
      'Rune har gitt deg en oppgave med tydelig frist, men ett punkt i arbeidsgrunnlaget kan tolkes på to måter.',
      'Du kan gjøre en sannsynlig faglig antakelse og komme raskt i gang, eller sende den konkrete uklarheten tilbake før utførelse.',
      'Oppdraget er ditt å utføre; beslutningen som mangler er ikke automatisk din å eie.'
    ],
    choices: [
      choice('A', 'Avklare før utførelse', 'Jeg sender Rune den konkrete uklarheten og beskriver hva jeg kan gjøre straks avklaringen er tatt.', 'Du beskytter både fremdrift og ansvarsgrense: faglig selvstendighet blir synlig som presis avklaring, ikke som at du overtar beslutningsrett som aldri ble delegert.', { clarity: 2, safety: 1, trust_manager: 1 }),
      choice('B', 'Velge den mest sannsynlige tolkningen', 'Jeg dokumenterer antakelsen og starter på den løsningen som virker mest sannsynlig.', 'Du holder tempoet oppe, men gjør en leder-/bestilleruklarhet til ditt eget risikopunkt; dokumentasjon reduserer skaden uten å gjøre antakelsen til formell avklaring.', { speed: 1, future_risk: 1, clarity: -1 })
    ]
  }),
  mail({
    id: 'fagarbeider_people_amir_standard_001',
    actor: actors[1].id,
    place: 'fag_og_utstyrsplass',
    subject: 'Den raske metoden virker — helt til den ikke gjør det',
    summary: 'Amir viser en erfaringsbasert måte å spare tid på som ofte fungerer, men som hopper over et kontrollpunkt. Scenen gjør kollegial fagrespekt konkret: spilleren kan hente ut den nyttige tause kunnskapen uten å la sosial lojalitet eller erfaring alene bli argument for å omgå standard og sikkerhet.',
    situation: [
      'Amir viser deg et grep som gjør jobben raskere og forklarer hvilket tegn han bruker for å vite at det vanligvis går bra.',
      'Grepet inneholder ekte erfaringskunnskap, men erstatter samtidig et formelt kontrollsteg som finnes av en grunn.',
      'Du må skille det som er verdifullt i erfaringen fra det som ikke bør gjøres til ny skjult norm.'
    ],
    choices: [
      choice('A', 'Beholde kunnskapen, ikke bypasset', 'Jeg ber Amir forklare tegnet han leser, men gjennomfører fortsatt det påkrevde kontrollsteget.', 'Du viser at respekt for erfaren praksis ikke krever lydighet mot snarveien: taus kunnskap kan tas inn i faget samtidig som kontrollgrensen forblir eksplisitt og etterprøvbar.', { craft: 2, safety: 2, trust_colleague: 1 }),
      choice('B', 'Følge Amir denne gangen', 'Jeg bruker Amirs metode og følger ekstra nøye med på utfallet.', 'Du styrker den kollegiale flyten på kort sikt, men gjør personlig erfaring til erstatning for en kontroll som ikke var din å oppheve; risikoen flyttes fremover i arbeidskjeden.', { speed: 2, trust_colleague: 1, future_risk: 2 })
    ]
  }),
  mail({
    id: 'fagarbeider_people_selma_avvik_001',
    actor: actors[2].id,
    place: 'kvalitets_og_avvikspunkt',
    subject: 'Et avvik kan rettes lokalt uten å forsvinne fra sporet',
    summary: 'Selma ser at du allerede har korrigert en feil som lå innenfor din kompetanse, men spør hva neste skift kan vite om årsaken og kontrollen. Scenen skiller håndverksmessig korrigering fra kontrollmyndighet: spilleren skal dokumentere og eskalere riktig uten å late som egen retting er alvorlig-avviks-godkjenning.',
    situation: [
      'Feilen er fysisk rettet, resultatet ser riktig ut og du kan forklare hva du gjorde.',
      'Selma peker på at kontrollsporet fortsatt mangler årsak, før/etter-status og hvem som eventuelt må godkjenne at et alvorlig avvik kan lukkes.',
      'Godt fagarbeid må tåle at den som kommer senere kan rekonstruere både rettingen og grensen for din myndighet.'
    ],
    choices: [
      choice('A', 'Dokumentere og sende til riktig kontroll', 'Jeg dokumenterer årsak, tiltak og kontrollresultat, og lar riktig kontrollfunksjon eie eventuell formell lukking.', 'Du gjør lokalt faglig ansvar kompatibelt med institusjonell kontroll: kompetansen din reparerer problemet, mens sporet tydelig viser hvilken beslutning som fortsatt tilhører en annen funksjon.', { documentation: 2, quality: 2, safety: 1 }),
      choice('B', 'Lukke som ferdig fordi rettingen er god', 'Jeg registrerer saken som ferdig siden feilen er rettet og kontrollmålingen ser riktig ut.', 'Du forveksler godt utført korrigering med rett til å lukke hele kontrollsporet; kvaliteten kan være høy samtidig som myndighets- og sporbarhetsgrensen blir svakere.', { quality: 1, documentation: -2, future_risk: 2 })
    ]
  }),
  mail({
    id: 'fagarbeider_people_liv_overlevering_001',
    actor: actors[3].id,
    place: 'overleverings_og_opplaeringsflate',
    subject: 'Liv kan gjenta stegene — men kan hun se når hun skal stoppe?',
    summary: 'Liv har lært arbeidsrekkefølgen og kan utføre standardtilfellet, men overleveringen viser at hun fortsatt mangler stoppkriteriet for et avvik. Scenen trener fagarbeideren som mentor uten lederglidning: spilleren må gjøre dømmekraft og kompetansegrense eksplisitt fremfor bare å demonstrere riktig håndbevegelse.',
    situation: [
      'Liv gjennomfører standardrekkefølgen riktig og kan forklare hva hun gjør i hvert steg.',
      'Når du endrer ett symptom i eksemplet, fortsetter hun likevel fordi hun ikke har lært hvilket tegn som betyr at saken må stoppes og avklares.',
      'Overleveringen er først trygg når kunnskapen om grensen er like tydelig som kunnskapen om selve oppgaven.'
    ],
    choices: [
      choice('A', 'Lære bort stoppkriteriet og få teach-back', 'Jeg forklarer hvilket tegn som endrer situasjonen, og ber Liv beskrive når hun selv skal stoppe og hente hjelp.', 'Du gjør taus dømmekraft overførbar uten å late som lærlingen kan mer enn hun kan: opplæringen styrker selvstendighet nettopp ved å gjøre kompetanse- og eskaleringsgrensen eksplisitt.', { mentoring: 2, safety: 2, clarity: 1 }),
      choice('B', 'Vise henne én gang til', 'Jeg demonstrerer riktig håndtering av avviket og ber henne følge samme mønster neste gang.', 'Du gir en nyttig demonstrasjon, men lar deler av vurderingen forbli personbåren; Liv kan kopiere løsningen uten å ha fått en tydelig regel for når hun må stoppe og be om faglig avklaring.', { mentoring: 1, craft: 1, future_risk: 1 })
    ]
  })
];

model.related_people = actors;
model.notes = Array.isArray(model.notes) ? model.notes : [];
model.notes.push('Role World readiness prerequisite: fire eksplisitt fiktive profesjonelle scenarioaktører binder eksisterende People-mail til de fire canonicale arbeidsflatene uten å endre plan, runtime eller authority.');
people.families.push({
  id: FAMILY_ID,
  description: 'Profesjonelle arbeidsrelasjoner for Role World-readiness: typed, eksplisitt fiktive scenarioaktører på eksisterende Fagarbeider-arbeidsflater. Familien er prerequisite-evidens og inngår ikke som nytt plansteg.',
  fictional_scenario_actors: actors.map((actor) => actor.id),
  thread_binding: { people_thread_id: FAMILY_ID, people_phase: 'early' },
  mails: professionalMails
});

write(MODEL_PATH, model);
write(PEOPLE_PATH, people);
console.log(`MATERIALIZED: ${KEY} typed professional People prerequisite (${actors.length} actors / ${professionalMails.length} work scenes).`);
