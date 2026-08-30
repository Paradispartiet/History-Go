#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const read = (rel) => JSON.parse(readText(rel));
const write = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`);
const sha = (rel) => crypto.createHash('sha256').update(readText(rel)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const KEY = 'naeringsliv/lager_og_driftsmedarbeider';
const ROLE = 'lager_og_driftsmedarbeider';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_logistikk_og_drift.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/lager_og_driftsmedarbeider.json';
const FAMILY_ID = 'lager_profesjonelle_arbeidsrelasjoner';
const EXPECTED_DEBT = ['career:people', 'people_places_integrity', 'situated_reputation'];
const WORKPLACES = [
  'varemottak_og_kollikontroll',
  'plukk_pakk_og_systemflate',
  'telling_og_avvikspunkt',
  'hms_og_overleveringsflate'
];
const SOURCE_REFS = [
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week1_receiving_almost_matched`,
  `${PEOPLE_PATH}#lager_people_snarvei_002`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_count_mismatch`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed`
];

const protectedPaths = [PLAN_PATH, GRAMMAR_PATH, JOB_PATH];
const protectedHashes = Object.fromEntries(protectedPaths.map((rel) => [rel, sha(rel)]));

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const target = (readiness.rollout_queue || []).find((row) => row.key === KEY);
assert(target, `${KEY}: missing from rollout queue`);
assert(target.classification === 'needs_role_authored_work', `${KEY}: expected needs_role_authored_work, got ${target.classification}`);
assert(JSON.stringify(target.blockers || []) === '[]', `${KEY}: blockers must be empty`);
assert(JSON.stringify(target.authored_work_required || []) === JSON.stringify(EXPECTED_DEBT), `${KEY}: readiness debt changed: ${JSON.stringify(target.authored_work_required)}`);
assert(target.cross_role_need === 'not_required_for_rollout', `${KEY}: cross-role need changed`);
assert(!fs.existsSync(path.join(ROOT, WORLD_PATH)), `${KEY}: Role World already exists; prerequisite materializer refuses to run`);

const plan = read(PLAN_PATH);
assert(plan.id === 'naeringsliv_lager_og_driftsmedarbeider_plan', 'Lager plan identity drift');
assert(plan.role_scope === ROLE && Array.isArray(plan.sequence) && plan.sequence.length === 20, 'Lager canonical plan scope/length drift');
for (let i = 0; i < 20; i += 1) {
  const step = plan.sequence[i];
  assert(step.step === i + 1, `Lager plan numbering drift at step ${i + 1}`);
  assert(step.type === (i % 2 === 0 ? 'job' : 'people'), `Lager plan type drift at step ${i + 1}`);
  assert(JSON.stringify(step.fallback_types) === '[]', `Lager plan fallback drift at step ${i + 1}`);
  assert(!(step.allowed_families || []).includes(FAMILY_ID), 'Prerequisite family is already wired into canonical plan');
}

const model = read(MODEL_PATH);
assert(model.category === 'naeringsliv' && model.role_scope === ROLE && model.role_id === 'naer_lager_og_driftsmedarbeider', 'Lager role-model identity drift');
assert(JSON.stringify(model.work_life?.workplaces || []) === JSON.stringify(WORKPLACES), 'Lager work-life workplace drift');
assert(JSON.stringify((model.related_places || []).map((row) => row.id)) === JSON.stringify(WORKPLACES), 'Lager related-place drift');
assert(JSON.stringify(model.related_people || []) === '[]', `Lager related_people already authored: ${JSON.stringify(model.related_people)}`);

const grammar = read(GRAMMAR_PATH);
assert(JSON.stringify(grammar.work_loops || []) === JSON.stringify([
  'mottak -> kontroll -> registrering -> lokasjon -> plukk -> utlevering',
  'avvik -> isolering -> telling/fakta -> korrigering -> godkjenning -> læring'
]), 'Lager shared work-loop drift');
assert(JSON.stringify(grammar.authority_boundary?.may || []) === JSON.stringify([
  'håndtere varer innen rutine',
  'registrere avvik',
  'isolere usikkert gods'
]), 'Lager shared authority may-boundary drift');
assert(JSON.stringify(grammar.authority_boundary?.may_not || []) === JSON.stringify([
  'forfalske lagerstatus',
  'sende skadet gods uten avklaring',
  'omgå sikkerhetsrutiner',
  'skjule lageravvik'
]), 'Lager shared authority may-not boundary drift');

const people = read(PEOPLE_PATH);
assert(people.category === 'naeringsliv' && people.role_scope === ROLE && people.mail_type === 'people', 'Lager People catalog identity drift');
assert(!(people.families || []).some((family) => family.id === FAMILY_ID), `${FAMILY_ID}: already exists`);

const resolveRef = (ref) => {
  const [rel, id] = ref.split('#');
  const catalog = read(rel);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert(mails.some((mail) => mail.id === id), `canonical source ref missing: ${ref}`);
};
for (const ref of SOURCE_REFS) resolveRef(ref);

const actors = [
  {
    id: 'ragnhild_driftsleder_lager',
    name: 'Ragnhild',
    role: 'driftsleder for lager og mottak',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Representerer virksomhetens operative prioritering ved varemottaket, der fysisk opptelling, dokumentasjon og transportpress må bli ett lesbart mottaksgrunnlag. Relasjonen gjør det mulig å be om avklaring og rapportere avvik uten at driftslederens tempoønske omskriver det spilleren faktisk har kontrollert.',
    authority_relation: 'Ragnhild kan prioritere arbeid, avklare mottaksrutine og eie beslutninger i driftslinjen. Spilleren kan kontrollere og stanse eget mottak ved avvik, men kan verken signere et usant antall for å hjelpe flyten eller bruke Ragnhilds støtte som egen godkjenningsmyndighet.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['varemottak_og_kollikontroll'],
    source_scene_refs: [SOURCE_REFS[0]]
  },
  {
    id: 'pavel_erfaren_lagermedarbeider',
    name: 'Pavel',
    role: 'erfaren lager- og plukkmedarbeider',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Bærer erfaringen fra lagergulvet og kjenner både reelle flaskehalser og snarveiene laget bruker når systemet ikke følger tempoet. Relasjonen gjør kollegial tillit, praktisk kunnskap og sporbarhet synlige samtidig, slik at erfaring ikke reduseres til verken fasit eller regelbrudd.',
    authority_relation: 'Pavel kan vise arbeidsmåter, advare om konsekvenser og støtte sikker utførelse, men erfaring gir ikke myndighet til å hoppe over registrering eller endre lagerstatus uten spor. Spilleren kan avvise en snarvei og melde prosessbehov uten å behandle kollegaen som en formell godkjenner.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['plukk_pakk_og_systemflate'],
    source_scene_refs: [SOURCE_REFS[1]]
  },
  {
    id: 'marius_okonomikontakt_lager',
    name: 'Marius',
    role: 'økonomi- og lageravstemmingskontakt',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Representerer det nedstrøms behovet for en beholdning som kan forklares, periodiseres og etterprøves. Relasjonen viser hvorfor en fysisk differanse ikke bare er et tall som skal lukkes, men et spor gjennom mottak, lokasjon, plukk, etterlevering og mulig faktisk tap.',
    authority_relation: 'Marius kan be om et avstemmingsgrunnlag og forklare økonomiske konsekvenser, men kan ikke instruere spilleren til å gjøre fysisk vare og system kunstig like. Spilleren kan telle, dokumentere og eskalere, men kan ikke selvgodkjenne en lagerkorreksjon som krever kontroll i en annen linje.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['telling_og_avvikspunkt'],
    source_scene_refs: [SOURCE_REFS[2]]
  },
  {
    id: 'helle_hms_og_skiftkontakt_lager',
    name: 'Helle',
    role: 'HMS- og skiftoverleveringskontakt',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Gjør nestenulykke, gangsoner, kroppslig risiko og restarbeid til et felles overleveringsgrunnlag før neste skift gjentar samme situasjon. Relasjonen skiller det å sikre og beskrive hendelsen fra skyldjakt, formell lukking og påstanden om at fravær av skade betyr fravær av læring.',
    authority_relation: 'Helle kan kreve et tydelig HMS- og handoff-spor og sende saken til riktig kontrollnivå. Spilleren kan stoppe eget arbeid, isolere risiko og beskrive fakta, men kan ikke lukke hendelsen alene, skjule den for å beskytte laget eller gjenstarte uten nødvendig avklaring.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['hms_og_overleveringsflate'],
    source_scene_refs: [SOURCE_REFS[3]]
  }
];

const choice = (id, label, reply, feedback, stats, tags) => ({
  id,
  label,
  reply,
  effect: 0,
  tags: ['professional_relationship', ...tags],
  feedback,
  effects: { stats }
});

const professionalMail = ({ id, actor, from, place, sourceRef, subject, summary, purpose, situation, taskDomain, competency, pressure, choiceAxis, consequenceAxis, choices }) => ({
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
  from,
  place_id: place,
  channel: 'work',
  messageChannel: 'work',
  mail_class: 'professional_message',
  subject,
  summary,
  purpose,
  stakes: 'Valget påvirker samarbeid, sporbarhet og sikker flyt, men kan aldri utvide spillerens fullmakt, oppheve HMS eller erstatte riktig godkjennings- og eskaleringslinje.',
  situation,
  task_domain: taskDomain,
  competency,
  pressure,
  choice_axis: choiceAxis,
  consequence_axis: consequenceAxis,
  narrative_arc: 'lager_profesjonelle_arbeidsrelasjoner_prerequisite',
  learning_focus: ['profesjonell relasjon', 'sporbar vareflyt', 'authority-grense', 'people_places_integrity'],
  source_scene_ref: sourceRef,
  choices
});

const professionalMails = [
  professionalMail({
    id: 'lager_people_ragnhild_mottak_001',
    actor: actors[0].id,
    from: 'Ragnhild',
    place: WORKPLACES[0],
    sourceRef: SOURCE_REFS[0],
    subject: 'Ragnhild trenger et mottakstall — men du ser fortsatt bare 17 kolli',
    summary: 'Følgeseddelen sier 18 kolli, den fysiske opptellingen viser 17 og transporten vil videre. Ragnhild trenger et beslutningsklart mottak, ikke et pent tall. Scenen gjør driftslederrelasjonen konkret: spilleren må skille kontroll av eget arbeid fra myndigheten til å avgjøre hva virksomheten gjør med et dokumentert avvik.',
    purpose: 'Binde mottakskontroll og avvik til den eksisterende driftslederstemmen uten å gjøre tempo eller lederstøtte til godkjenning av et usant mottak.',
    situation: [
      'Du har telt 17 synlige kolli mot 18 på følgeseddelen, og sjåføren viser til et nytt tidsvindu som allerede er i ferd med å ryke.',
      'Ragnhild spør hva du faktisk kan bekrefte nå, og hva hun må ta videre med transportør og intern drift.',
      'Du kan kontrollere, registrere avvik og be om avklaring; du kan ikke gjøre sannsynlig etterlevering til et kolli som allerede er mottatt.'
    ],
    taskDomain: 'mottak_og_kollikontroll',
    competency: 'leveransekontroll_og_avviksrapportering',
    pressure: 'transporttid_og_driftsflyt',
    choiceAxis: 'tempo_vs_sporbarhet',
    consequenceAxis: 'rask_port_vs_sant_mottaksgrunnlag',
    choices: [
      choice('A', 'Gi et sant mottaksgrunnlag', 'Jeg bekrefter 17 kolli, registrerer avviket og gir deg hva som er kontrollert, hva som mangler og hva transportør må avklare.', 'Du holder fysisk vare, dokument og beslutningslinje fra hverandre uten å stoppe all videre handling. Ragnhild får et grunnlag hun kan prioritere fra, mens signaturen fortsatt betyr det spilleren faktisk har kontrollert.', { accuracy: 3, traceability: 3, management_trust: 2 }, ['receiving', 'integrity']),
      choice('B', 'Signere 18 for å holde porten i flyt', 'Jeg signerer 18 og legger inn en intern merknad om at ett kolli trolig kommer senere.', 'Du gjør porten raskere, men lar signaturen påstå mer enn opptellingen beviser. Avviket mister sitt tydeligste kontrollpunkt, og Ragnhild får en grønn status som kan spre feil til beholdning, økonomi og senere plukk.', { speed: 2, traceability: -3, future_risk: 3 }, ['shortcut', 'receiving'])
    ]
  }),
  professionalMail({
    id: 'lager_people_pavel_sporbarhet_001',
    actor: actors[1].id,
    from: 'Pavel',
    place: WORKPLACES[1],
    sourceRef: SOURCE_REFS[1],
    subject: 'Pavel kan åpne køen — hvis flyttingen får vente i systemet',
    summary: 'Plukksonen står, og Pavel viser den uformelle flyttingen som laget bruker når systemregistreringen blir flaskehals. Snarveien er praktisk kunnskap og reell risiko samtidig. Scenen tester om spilleren kan respektere erfaringen, bevare kollegial tillit og likevel nekte at fysisk vare får et skjult mellomliv uten lokasjonsspor.',
    purpose: 'Binde den eksisterende snarvei-scenen til en typed kollegarelasjon der erfaring kan brukes uten å gjøre uregistrert flytting til normal drift.',
    situation: [
      'Pavel peker ut de riktige varene og en ledig plass i plukksonen, men den ordinære registreringskøen gjør at flyttingen ikke blir synlig med én gang.',
      'Han sier at laget har gjort dette før og at registreringen kan tas når trykket har lagt seg.',
      'Du kan håndtere varen innen rutine og melde et prosessproblem; du kan ikke la lojalitet til laget erstatte det systemsporet neste person trenger.'
    ],
    taskDomain: 'plukk_pakk_og_systemspor',
    competency: 'lokasjon_og_registrering',
    pressure: 'kollegial_lojalitet_og_plukkkø',
    choiceAxis: 'laghjelp_vs_sporbarhet',
    consequenceAxis: 'øyeblikkelig_flyt_vs_rekonstruerbar_varebevegelse',
    choices: [
      choice('A', 'Flytte bare med samtidig spor', 'Jeg hjelper Pavel med flyttingen når vi kan registrere den samtidig, og melder at prosessen trenger en raskere lovlig flyt.', 'Du tar den praktiske innsikten på alvor uten å gjøre den usynlig. Pavel blir samarbeidspartner i en forbedring, og plukksonen får en løsning som neste medarbeider kan rekonstruere i stedet for en privat lagerhistorie.', { teamwork: 2, traceability: 3, improvement: 2 }, ['teamwork', 'system']),
      choice('B', 'Bruke snarveien og registrere senere', 'Jeg flytter varene nå og avtaler med Pavel at vi rydder hele systemsporet sammen etter køen.', 'Du beskytter laget i øyeblikket, men gjør hukommelse og ledig tid til kontrollsystem. Hvis varen plukkes, flyttes igjen eller glemmes før oppryddingen, blir kollegial tillit også kilden til en ny differanse.', { speed: 2, team_trust: 1, traceability: -3 }, ['shortcut', 'loyalty'])
    ]
  }),
  professionalMail({
    id: 'lager_people_marius_avstemming_001',
    actor: actors[2].id,
    from: 'Marius',
    place: WORKPLACES[2],
    sourceRef: SOURCE_REFS[2],
    subject: 'Marius trenger avstemming — systemet sier 24 og gulvet sier 19',
    summary: 'Økonomien skal lukke et enkelt grunnlag, men kontrolltellingen av samme lokasjon viser fem færre varer enn systemet. Marius trenger forklaring, ikke bare samsvar. Scenen gjør lagerdifferansen til en profesjonell handoff mellom fysisk kontroll og økonomisk avstemming uten å gi spilleren myndighet til å velge hvilket tall som skal bli sant.',
    purpose: 'Binde telling, avviksspor og økonomisk konsekvens til en typed nedstrøms relasjon med tydelig korrigerings- og godkjenningsgrense.',
    situation: [
      'Du har kontrolltelt 19 enheter der systemet viser 24, og samme reol har nylig hatt både feilplukk og en forsinket etterlevering.',
      'Marius spør hva som er verifisert før økonomigrunnlaget lukkes, og om differansen kan korrigeres i dag.',
      'Du kan telle, undersøke bevegelser og registrere avvik; du kan ikke gjøre en uforklart korreksjon til bevis på hvor de fem enhetene ble av.'
    ],
    taskDomain: 'telling_og_lageravvik',
    competency: 'kontrolltelling_og_transaksjonsspor',
    pressure: 'periodeavslutning_og_tallro',
    choiceAxis: 'rask_avstemming_vs_forklart_differanse',
    consequenceAxis: 'pent_systemtall_vs_etterprøvbar_lagerhistorie',
    choices: [
      choice('A', 'Overlevere fakta og åpent avvik', 'Jeg gir deg dobbelttellingen, siste kjente bevegelser og det åpne avviket, men lar riktig kontrollinje avgjøre selve korreksjonen.', 'Du gir økonomien et presist, avgrenset grunnlag og bevarer forskjellen mellom observasjon, årsak og godkjenning. Avstemmingen kan ta lengre tid, men den kan senere forklares uten at systemendringen skjuler det opprinnelige problemet.', { accuracy: 3, documentation: 3, finance_trust: 2 }, ['counting', 'handoff']),
      choice('B', 'Korrigere systemet til fysisk telling', 'Jeg endrer systemet til 19 nå, så kan vi undersøke årsaken etter at avstemmingen er lukket.', 'Du skaper samsvar, men fjerner selve signalet før årsaken og myndigheten er avklart. Et riktig fysisk tall kan fortsatt bli en feil kontrollhandling når historikken ikke viser hvorfor korreksjonen ble gjort eller hvem som godkjente den.', { closure: 2, auditability: -3, future_risk: 2 }, ['correction', 'shortcut'])
    ]
  }),
  professionalMail({
    id: 'lager_people_helle_hms_handoff_001',
    actor: actors[3].id,
    from: 'Helle',
    place: WORKPLACES[3],
    sourceRef: SOURCE_REFS[3],
    subject: 'Helle spør hva neste skift må vite om pallen alle gikk forbi',
    summary: 'Ingen ble skadet da en ansatt måtte hoppe unna en pall i den trange gangsonen, og den fysiske hindringen er nå flyttet. Helle trenger et spor som neste skift kan handle på. Scenen skiller rydding fra læring, faktabeskrivelse fra skyld og spillerens rett til å stoppe eget arbeid fra myndigheten til å lukke HMS-saken.',
    purpose: 'Binde nestenulykke og skiftoverlevering til en typed HMS-relasjon som bevarer fakta, restansvar og riktig kontrollmyndighet.',
    situation: [
      'Pallen er flyttet og ingen har synlig skade, men flere så at gangsonen var trang og at flyttingen skjedde under høyt tidspress.',
      'Helle spør hva som er kjent, hva som fortsatt må undersøkes og hvilket midlertidig tiltak neste skift faktisk skal følge.',
      'Du kan stoppe eget arbeid, isolere risiko og melde hendelsen; du kan ikke la fravær av skade bli grunn til å skjule eller selvlukke nestenulykken.'
    ],
    taskDomain: 'hms_og_skiftoverlevering',
    competency: 'nestenulykke_og_risikohandoff',
    pressure: 'normal_flyt_og_lagets_status',
    choiceAxis: 'rask_normalisering_vs_synlig_læring',
    consequenceAxis: 'ryddet_gangsone_vs_varig_sikkerhetsforbedring',
    choices: [
      choice('A', 'Overlevere fakta, tiltak og åpent ansvar', 'Jeg beskriver hendelsen uten å gjette skyld, registrerer gangsonen og tidspresset, og gir neste skift midlertidig tiltak og navngitt eskaleringspunkt.', 'Du gjør flaks til informasjon før den blir skade. Helle får et etterprøvbart spor, neste skift vet hva som er midlertidig og åpent, og spilleren holder seg innen retten til å sikre og melde uten å late som saken er formelt lukket.', { safety: 3, handoff: 3, learning: 2 }, ['hms', 'handoff']),
      choice('B', 'Si at området er ryddet og saken løst', 'Jeg sier at pallen er flyttet, ingen ble skadet og neste skift kan arbeide normalt.', 'Du overleverer en fysisk forbedring, men skjuler forholdene som gjorde nestenulykken mulig. Neste skift får ingen grunn til å beskytte gangsonen mot samme tidspress, og fravær av skade blir feilaktig behandlet som full kontroll.', { flow: 2, safety_learning: -3, future_risk: 3 }, ['normalization', 'concealment'])
    ]
  })
];

model.related_people = actors;
model.notes = Array.isArray(model.notes) ? model.notes : [];
model.notes.push('Role World readiness prerequisite: fire eksplisitt fiktive profesjonelle scenarioaktører binder mottak, plukk/system, telling/avvik og HMS/overlevering til eksisterende arbeidsflater uten å endre plan, runtime, shared work grammar eller formell authority.');

people.families.push({
  id: FAMILY_ID,
  purpose: 'Typed profesjonelle arbeidsrelasjoner for Role World-readiness på de fire eksisterende lagerflatene; familien er prerequisite-evidens og ikke et nytt steg i canonical plan.',
  learning_focus: ['profesjonelle arbeidsrelasjoner', 'people_places_integrity', 'sporbarhet', 'HMS', 'myndighetsgrense'],
  fictional_scenario_actors: actors.map((actor) => actor.id),
  thread_binding: { people_thread_id: FAMILY_ID, people_phase: 'early' },
  mails: professionalMails
});

write(MODEL_PATH, model);
write(PEOPLE_PATH, people);

for (const [rel, beforeHash] of Object.entries(protectedHashes)) {
  assert(sha(rel) === beforeHash, `${rel} changed during prerequisite materialization`);
}

console.log(JSON.stringify({
  key: KEY,
  actors: actors.length,
  professional_mails: professionalMails.length,
  source_refs: SOURCE_REFS.length,
  protected_surfaces_unchanged: protectedPaths
}, null, 2));
