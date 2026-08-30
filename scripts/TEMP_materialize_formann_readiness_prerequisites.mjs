#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`);

const KEY = 'naeringsliv/formann';
const PLAN_ROLE = 'formann';
const MODEL_ROLE = 'formann_arbeidsleder';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/formann_arbeidsleder.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/formann_people.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/formann_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/formann.json';
const FAMILY_ID = 'formann_profesjonelle_arbeidsrelasjoner';
const EXPECTED_DEBT = ['career:people', 'people_places_integrity', 'situated_reputation'];
const WORKPLACES = [
  'produksjons_og_arbeidsomrade',
  'arbeidslederpunkt',
  'hms_og_avvikspunkt',
  'skift_og_overleveringsrom'
];

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const target = (readiness.rollout_queue || []).find((row) => row.key === KEY);
if (!target) throw new Error(`${KEY}: missing from rollout queue`);
if (target.classification !== 'needs_role_authored_work') throw new Error(`${KEY}: expected needs_role_authored_work, got ${target.classification}`);
if (JSON.stringify(target.blockers || []) !== '[]') throw new Error(`${KEY}: blockers must be empty`);
if (JSON.stringify(target.authored_work_required || []) !== JSON.stringify(EXPECTED_DEBT)) {
  throw new Error(`${KEY}: readiness debt changed: ${JSON.stringify(target.authored_work_required)}`);
}
if (target.cross_role_need !== 'candidate_when_shared_work_is_real') throw new Error(`${KEY}: cross-role need changed`);
if (fs.existsSync(path.join(ROOT, WORLD_PATH))) throw new Error(`${KEY}: Role World already exists; prerequisite materializer refuses to run`);

const plan = read(PLAN_PATH);
if (plan.id !== 'formann_naeringsliv_v1' || plan.role_scope !== PLAN_ROLE || !Array.isArray(plan.sequence) || plan.sequence.length !== 31) {
  throw new Error('Formann canonical plan identity/length drift');
}
for (let i = 0; i < 20; i += 1) {
  const step = plan.sequence[i];
  const expectedType = i % 2 === 0 ? 'job' : 'people';
  if (step.step !== i + 1 || step.type !== expectedType || JSON.stringify(step.fallback_types) !== '[]') {
    throw new Error(`Formann two-week practice step ${i + 1} drift`);
  }
}
if (plan.sequence[20]?.step !== 21 || plan.sequence[20]?.type !== 'job') throw new Error('Formann post-practice arc drift at step 21');
if (plan.sequence[30]?.step !== 31 || plan.sequence[30]?.type !== 'story') throw new Error('Formann climax drift at step 31');
if (plan.sequence.some((step) => (step.allowed_families || []).includes(FAMILY_ID))) throw new Error('Prerequisite family is already wired into canonical plan');

const model = read(MODEL_PATH);
if (model.category !== 'naeringsliv' || model.role_scope !== MODEL_ROLE || model.role_id !== 'naeringsliv_formann_arbeidsleder') {
  throw new Error('Formann role-model identity drift');
}
if (JSON.stringify(model.work_life?.workplaces || []) !== JSON.stringify(WORKPLACES)) throw new Error('Formann work-life workplace drift');
if (JSON.stringify((model.related_places || []).map((row) => row.id)) !== JSON.stringify(WORKPLACES)) throw new Error('Formann related-place drift');
if (JSON.stringify(model.related_people || []) !== '[]') throw new Error(`Formann related_people already authored: ${JSON.stringify(model.related_people)}`);

const grammar = read(GRAMMAR_PATH);
if (JSON.stringify(grammar.work_loops || []) !== JSON.stringify([
  'mål -> kapasitet -> bemanning -> gjennomføring -> kontroll -> oppfølging',
  'hendelse -> sikre -> fakta -> ansvar -> tiltak -> læring'
])) throw new Error('Formann shared work-loop drift');
if (JSON.stringify(grammar.authority_boundary?.may || []) !== JSON.stringify([
  'prioritere drift innen fullmakt',
  'fordele arbeid',
  'eskalere kapasitets- og sikkerhetskonflikter'
])) throw new Error('Formann authority may-boundary drift');
if (JSON.stringify(grammar.authority_boundary?.may_not || []) !== JSON.stringify([
  'omgå arbeids- eller sikkerhetsrutiner',
  'skjule hendelser',
  'bruke utilbørlig press',
  'ta beslutninger uten fullmakt'
])) throw new Error('Formann authority may-not boundary drift');

const people = read(PEOPLE_PATH);
if (people.category !== 'naeringsliv' || people.role_scope !== PLAN_ROLE || people.mail_type !== 'people') throw new Error('Formann People catalog identity drift');
if ((people.families || []).some((family) => family.id === FAMILY_ID)) throw new Error(`${FAMILY_ID}: already exists`);

const actors = [
  {
    id: 'arvid_erfaren_fagarbeider_formann',
    name: 'Arvid',
    role: 'erfaren fagarbeider',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Representerer den erfarne delen av laget som kjenner faktisk kapasitet, faglig kvalitet og belastningen bak tavletallene. Relasjonen gjør det mulig å vise hvordan arbeidsfordeling oppleves nedenfra uten å redusere Arvid til bare en ressurs i bemanningsplanen.',
    authority_relation: 'Formannen kan fordele oppgaver og prioritere drift innen fullmakt, mens Arvid kan gjøre kompetanse, belastning og faglig risiko synlig. Erfaring eller lojalitet gir ingen av dem rett til å omgå sikkerhetsrutiner, skjule hendelser eller flytte formell beslutningsmyndighet.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['produksjons_og_arbeidsomrade'],
    source_scene_refs: [`${GRAMMAR_PATH}#frist`]
  },
  {
    id: 'noor_nyansatt_fagarbeider_formann',
    name: 'Noor',
    role: 'nyansatt fagarbeider',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Gjør kompetansegrense, instrukskvalitet og muligheten til å si fra konkret i skiftstarten. Noor trenger et oppdrag som er tydelig nok til å utføres sikkert og en lederrelasjon der usikkerhet kan meldes før den blir til skjult risiko eller feil bemanning.',
    authority_relation: 'Formannen kan avklare prioritet, oppgave og forventet kontroll, men kan ikke bruke tids- eller statuspress til å få Noor til å late som nødvendig kompetanse finnes. Noor kan melde usikkerhet og stoppsignal uten at dette i seg selv gjør henne til kontroll- eller godkjenningsmyndighet.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['arbeidslederpunkt'],
    source_scene_refs: [`${GRAMMAR_PATH}#fravaer`]
  },
  {
    id: 'selma_hms_kvalitetskontakt_formann',
    name: 'Selma',
    role: 'HMS- og kvalitetskontakt',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Representerer etterprøvings- og sikkerhetsperspektivet når en hendelse, kvalitetsfeil eller nestenulykke truer flyten. Hun gjør skillet mellom å sikre situasjonen, dokumentere fakta, avklare ansvar og faktisk ha mandat til å lukke eller gjenstarte tydelig.',
    authority_relation: 'Formannen kan stanse lokal drift, sikre området og eskalere sikkerhetskonflikter, mens Selma kan kreve et lesbart avviksgrunnlag og riktig kontrollspor. Ingen av relasjonene gir rett til å skjule hendelser, oppheve rutiner eller ta beslutninger uten fullmakt.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['hms_og_avvikspunkt'],
    source_scene_refs: [`${GRAMMAR_PATH}#hendelse`]
  },
  {
    id: 'maja_neste_skiftleder_formann',
    name: 'Maja',
    role: 'neste skiftleder',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Overtar konsekvensene av det foregående skiftets prioriteringer og gjør derfor sannferdig overlevering til et sosialt ansvar, ikke bare et notat. Relasjonen synliggjør restarbeid, risiko, åpne beslutninger og hva neste skift faktisk kan stole på.',
    authority_relation: 'Formannen eier kvaliteten på egen overlevering, men kan ikke gjøre åpne risikoer usynlige for å beskytte eget skiftresultat. Maja kan utfordre uklar status og kreve avklaring, men overtakelsen gir henne ikke tilbakevirkende myndighet over beslutninger utenfor hennes fullmakt.',
    mail_family_refs: [FAMILY_ID],
    workplace_ids: ['skift_og_overleveringsrom'],
    source_scene_refs: [`${MODEL_PATH}#skift_og_overleveringsrom`]
  }
];

const choice = (id, label, reply, feedback, stats, flags = []) => ({
  id,
  label,
  reply,
  effect: 0,
  tags: ['professional_relationship', ...flags],
  feedback,
  effects: { stats }
});

const mail = ({ id, actor, place, subject, summary, situation, choices }) => ({
  id,
  mail_type: 'people',
  mail_family: FAMILY_ID,
  role_scope: PLAN_ROLE,
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
  purpose: 'Readiness-prerequisite: koble typed profesjonell relasjon til eksisterende Formann-arbeidsflate uten å endre canonical plan eller formell myndighet.',
  stakes: 'Valget påvirker samarbeid, sporbarhet og operativ tillit, men kan aldri utvide fullmakt, oppheve sikkerhetsrutiner eller erstatte riktig kontroll- og eskaleringslinje.',
  situation,
  choices
});

const professionalMails = [
  mail({
    id: 'formann_people_arvid_fordeling_001',
    actor: actors[0].id,
    place: 'produksjons_og_arbeidsomrade',
    subject: 'Arvid kan ta den tunge sonen igjen — men bør han?',
    summary: 'Tavla går enklest opp dersom Arvid får enda en krevende sone fordi han er den mest erfarne og sjelden protesterer. Scenen gjør arbeidsfordeling til mer enn kapasitetsregning: Formannen må se både leveranse, kompetanse, belastning og hva laget lærer om rettferdighet når den sterkeste alltid absorberer usikkerheten.',
    situation: [
      'En fraværssituasjon har gjort bemanningen strammere enn planlagt, og Arvid kan teknisk sett dekke den mest krevende sonen.',
      'Han har allerede tatt flere tunge oppgaver denne uken og sier rolig at han kan gjøre det igjen dersom det er nødvendig.',
      'Du må fordele arbeid innen fullmakt uten å gjøre pålitelighet til en automatisk begrunnelse for skjev belastning.'
    ],
    choices: [
      choice('A', 'Fordele med synlig belastningsvurdering', 'Jeg avklarer hvilken kompetanse som faktisk trengs, fordeler resten av laget først og bruker Arvid bare der erfaringen er nødvendig.', 'Du bruker arbeidsledermandatet uten å gjøre den mest pålitelige medarbeideren til permanent buffer. Kapasitet og rettferdighet blir behandlet som deler av samme risikobeslutning, og laget kan se hvorfor fordelingen ble som den ble.', { fairness: 2, capacity: 1, trust_team: 2 }),
      choice('B', 'Gi Arvid sonen for å sikre tempo', 'Jeg gir Arvid sonen fordi han kan levere den raskest og tar resten av bemanningen etterpå.', 'Du kjøper kortsiktig flyt med kjent kompetanse, men gjør tidligere pålitelighet til grunn for ny belastning. Det kan være innen fullmakten og likevel bygge en skjult norm der de sterkeste alltid bærer planens svakheter.', { speed: 2, fatigue_risk: 2, trust_team: -1 })
    ]
  }),
  mail({
    id: 'formann_people_noor_mandat_001',
    actor: actors[1].id,
    place: 'arbeidslederpunkt',
    subject: 'Noor nikker — men oppgaven er større enn introduksjonen hennes',
    summary: 'Noor får en oppgave som ligger nær det hun allerede kan, men inkluderer ett kontrollpunkt hun ikke har gjort alene. Hun nikker fordi tavla er presset og de andre står klare. Scenen tester om Formannen kan skape fremdrift uten å gjøre taushet til kompetansebevis eller bruke lederposisjonen som utilbørlig press.',
    situation: [
      'Du ser at Noor kjenner hovedoppgaven, men ikke har gjennomført det siste kontrollpunktet selvstendig tidligere.',
      'Hun sier at det sikkert går fint og virker mer opptatt av å ikke forsinke laget enn av å beskrive hva hun faktisk er trygg på.',
      'Som arbeidsleder kan du fordele arbeid, men du må også gjøre kompetanse- og eskaleringsgrensen mulig å si høyt.'
    ],
    choices: [
      choice('A', 'Avklare kompetanse før fordeling', 'Jeg skiller hovedoppgaven fra kontrollpunktet og avtaler hvem Noor skal hente inn dersom hun møter det hun ikke er godkjent for alene.', 'Du beholder fremdrift samtidig som instruksen tåler usikkerhet. Noor får et tydelig arbeid innenfor faktisk kompetanse, og lederrollen blir en kanal for trygg eskalering i stedet for et sosialt press om å late som alt er kjent.', { clarity: 2, safety: 2, trust_team: 1 }),
      choice('B', 'Be henne prøve og si fra hvis det stopper', 'Jeg ber Noor starte hele oppgaven og komme tilbake dersom kontrollpunktet blir vanskelig.', 'Du gjør oppstarten enkel, men flytter kompetansevurderingen inn i selve utførelsen. Når den nyansatte allerede kjenner på tidspress, kan terskelen for å si fra bli høyere enn den burde være, selv uten et eksplisitt regelbrudd.', { speed: 1, ambiguity: 2, safety: -1 })
    ]
  }),
  mail({
    id: 'formann_people_selma_avvik_001',
    actor: actors[2].id,
    place: 'hms_og_avvikspunkt',
    subject: 'Produksjonen kan starte igjen — men avviket er ikke ferdig',
    summary: 'Et område er fysisk sikret etter en nestenulykke, og den umiddelbare faren er fjernet. Selma peker på at hendelsesforløpet og årsaken fortsatt er uavklart. Scenen skiller Formannens operative stans- og sikringsansvar fra retten til å lukke avvik eller gjøre et ufullstendig faktagrunnlag til grønt lys for normal drift.',
    situation: [
      'Den konkrete faren er fjernet og en enkel funksjonstest ser normal ut, så produksjonspresset peker mot rask gjenstart.',
      'Selma mangler fortsatt et presist hendelsesforløp, hvem som eier årsaksavklaringen og hvilket kontrollsteg som må være dokumentert før saken kan lukkes.',
      'Du kan sikre og eskalere innen fullmakt; du kan ikke gjøre fravær av synlig fare til fullmakt til å hoppe over kontrollsporet.'
    ],
    choices: [
      choice('A', 'Sikre fakta og eskalere riktig', 'Jeg holder berørt aktivitet på nødvendig nivå, dokumenterer hva vi vet og ikke vet, og sender beslutningen om full gjenstart til riktig kontrollinje.', 'Du bruker operativ myndighet presist: situasjonen blir sikret uten at du later som en lokal funksjonstest avgjør hele saken. Sporbarhet og ansvar bevares, og produksjonspresset får ikke omskrive hvem som faktisk kan lukke avviket.', { safety: 2, documentation: 2, integrity: 2 }),
      choice('B', 'Starte opp fordi faren er fjernet', 'Jeg starter normal drift og ber Selma ferdigstille avviksdokumentasjonen parallelt.', 'Du beskytter kapasiteten, men skiller kontrollsporet fra beslutningen det skulle informere. Dersom årsaken viser seg å være bredere enn den synlige feilen, har gjenstarten allerede gjort tidsgevinsten til en risikobeslutning uten riktig grunnlag.', { speed: 2, future_risk: 2, documentation: -1 })
    ]
  }),
  mail({
    id: 'formann_people_maja_overlevering_001',
    actor: actors[3].id,
    place: 'skift_og_overleveringsrom',
    subject: 'Maja ser et grønt skift — men du vet om to gule punkter',
    summary: 'Skiftet ditt leverte hovedmålet, men to restpunkter er fortsatt åpne: ett midlertidig tiltak og én bemanningsusikkerhet som neste skift må følge opp. Scenen gjør overlevering til en ansvarshandling: Formannen kan rapportere et godt resultat uten å pynte bort risiko som ellers havner usynlig hos Maja.',
    situation: [
      'Dashboardet viser grønn leveranse, og begge restpunktene kan sannsynligvis løses tidlig i neste skift.',
      'Maja spør om det er noe hun må vite før hun tar over, og det er fristende å svare med bare det som faktisk stoppet produksjonen.',
      'Det som ikke stanset ditt skift kan likevel være avgjørende for hvordan det neste prioriterer bemanning, kontroll og risiko.'
    ],
    choices: [
      choice('A', 'Overlevere både resultat og restansvar', 'Jeg gir Maja grønnstatusen, men lister de to gule punktene med midlertidig tiltak, eier og hva som må kontrolleres videre.', 'Du gjør skiftresultatet etterprøvbart uten å redusere prestasjonen. Neste leder kan skille ferdig arbeid fra restarbeid og ta egne prioriteringer på et sant grunnlag, mens ansvarsgrensen mellom skiftene forblir lesbar.', { handoff: 2, trust_peer: 2, documentation: 2 }),
      choice('B', 'Rapportere bare det som faktisk er rødt', 'Jeg sier at skiftet er levert og nevner at det finnes noen små oppfølgingspunkter i loggen.', 'Du unngår en dramatisk overlevering, men gjør Maja avhengig av å oppdage betydningen selv. Når restansvar er kjent men ikke løftet tydelig, blir grønnstatusen mindre informativ enn den ser ut og risiko flyttes mellom skift.', { presentation: 1, handoff: -2, future_risk: 2 })
    ]
  })
];

model.related_people = actors;
model.notes = Array.isArray(model.notes) ? model.notes : [];
model.notes.push('Role World readiness prerequisite: fire eksplisitt fiktive profesjonelle scenarioaktører binder Formannens arbeidsrelasjoner til de fire eksisterende operative flatene uten å endre plan, runtime, shared work grammar eller formell authority.');
people.families.push({
  id: FAMILY_ID,
  description: 'Profesjonelle arbeidsrelasjoner for Formann Role World-readiness: typed, eksplisitt fiktive scenarioaktører på de eksisterende operative arbeidsflatene. Familien er prerequisite-evidens og er ikke et nytt steg i canonical plan.',
  fictional_scenario_actors: actors.map((actor) => actor.id),
  thread_binding: { people_thread_id: FAMILY_ID, people_phase: 'early' },
  mails: professionalMails
});

write(MODEL_PATH, model);
write(PEOPLE_PATH, people);
console.log(`MATERIALIZED: ${KEY} typed professional People prerequisite (${actors.length} actors / ${professionalMails.length} work scenes).`);