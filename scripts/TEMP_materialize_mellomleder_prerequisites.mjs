import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`);
const sha = (rel) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex');
const fail = (message) => { throw new Error(`Mellomleder prerequisite preflight failed: ${message}`); };
const same = (actual, expected, label) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`${label} drifted`);
};

const KEY = 'naeringsliv/mellomleder';
const ROLE = 'mellomleder';
const FAMILY_ID = 'mellomleder_profesjonelle_arbeidsrelasjoner';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/kapitalforvalter.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/mellomleder_plan.json';
const CAPITAL_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_finans_og_kapitalforvaltning.json';
const LEADERSHIP_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_virksomhetsledelse.json';
const PEOPLE_BASE_PATH = 'data/Civication/people/naeringsliv/mellomleder_people_base.json';
const READINESS_PATH = 'data/Civication/roleWorldRolloutReadiness.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/mellomleder.json';

const WORKPLACES = [
  'analyse_og_rapporteringsflate',
  'strategi_og_beslutningsrom',
  'drift_og_kapasitetsgjennomgang',
  'risiko_og_oppfolgingsbord'
];
const SOURCE_REFS = [
  `${JOB_PATH}#job_mellomleder_week1_first_monday_report`,
  `${JOB_PATH}#job_mellomleder_week2_numbers_become_politics`,
  `${JOB_PATH}#job_mellomleder_week1_peace_below_speed_above`,
  `${JOB_PATH}#job_mellomleder_week2_thomas_followup_aftershock`
];
const PROTECTED = [PLAN_PATH, CAPITAL_GRAMMAR_PATH, LEADERSHIP_GRAMMAR_PATH, JOB_PATH, PEOPLE_BASE_PATH];
const protectedBefore = Object.fromEntries(PROTECTED.map((rel) => [rel, sha(rel)]));

if (fs.existsSync(path.join(ROOT, WORLD_PATH))) fail('a Mellomleder Role World already exists');

const readiness = read(READINESS_PATH);
const ready = readiness.roles.find((row) => row.key === KEY);
if (!ready) fail('readiness row is missing');
if (ready.classification !== 'needs_role_authored_work') fail(`unexpected readiness classification ${ready.classification}`);
same(ready.authored_work_required, ['career:people', 'people_places_integrity', 'situated_reputation'], 'authored prerequisite debt');
same(ready.blockers, [], 'blocker list');
if (ready.cross_role?.need !== 'candidate_when_shared_work_is_real') fail('cross-role observation changed');

const plan = read(PLAN_PATH);
if (plan.id !== 'mellomleder_naeringsliv_v2' || plan.role_scope !== ROLE) fail('canonical plan identity changed');
if (plan.sequence.length !== 25) fail('canonical plan must contain 25 steps');
for (let i = 0; i < 20; i += 1) {
  const step = plan.sequence[i];
  if (step.step !== i + 1 || step.type !== (i % 2 === 0 ? 'job' : 'people')) fail(`canonical practice rhythm drifted at step ${i + 1}`);
  same(step.fallback_types, [], `step ${i + 1} fallback types`);
}
same(plan.sequence.slice(20).map((step) => step.type), ['conflict', 'people', 'job', 'story', 'event'], 'mastery arc');
if (plan.sequence.some((step) => (step.allowed_families || []).includes(FAMILY_ID))) fail('prerequisite family is already in canonical plan');

const capitalGrammar = read(CAPITAL_GRAMMAR_PATH);
same(capitalGrammar.work_loops, [
  'mandat -> data -> analyse -> risiko -> anbefaling/handling -> rapportering',
  'markedshendelse -> eksponering -> scenario -> mandat -> tiltak -> oppfølging'
], 'capital grammar work loops');
same(capitalGrammar.authority_boundary, {
  may: ['analysere innen oppdrag', 'forvalte innen uttrykkelig mandat', 'rapportere og eskalere risiko'],
  may_not: ['love avkastning', 'handle utenfor mandat', 'skjule interessekonflikter', 'late som personlig Badge-status er virksomhetskonsesjon']
}, 'capital grammar authority boundary');

const leadershipGrammar = read(LEADERSHIP_GRAMMAR_PATH);
same(leadershipGrammar.work_loops, [
  'mandat -> strategi -> ressursvalg -> gjennomføring -> resultat -> styreoppfølging',
  'risiko -> scenario -> beslutningsnivå -> tiltak -> kommunikasjon -> læring'
], 'leadership grammar work loops');
same(leadershipGrammar.authority_boundary, {
  may: ['lede innen delegert mandat', 'organisere gjennomføring', 'eskalere styresaker'],
  may_not: ['behandle eierskap som ledermandat', 'sette selskapsorganer til side', 'skjule vesentlig risiko', 'bruke virksomhetsmidler privat']
}, 'leadership grammar authority boundary');

const model = read(MODEL_PATH);
if (model.category !== 'naeringsliv' || model.role_scope !== 'kapitalforvalter' || model.role_id !== 'naeringsliv_kapitalforvalter') fail('fallback role model identity changed');
same(model.work_life?.workplaces, WORKPLACES, 'model workplaces');
same((model.related_places || []).map((place) => place.id), WORKPLACES, 'related places');
same(model.related_people, [], 'related people baseline');

const people = read(PEOPLE_PATH);
if (people.category !== 'naeringsliv' || people.role_scope !== ROLE || people.mail_type !== 'people') fail('People catalog identity changed');
if ((people.families || []).some((family) => family.id === FAMILY_ID)) fail('professional family already exists');

const jobs = read(JOB_PATH);
const jobMails = (jobs.families || []).flatMap((family) => family.mails || []);
for (const ref of SOURCE_REFS) {
  const [, id] = ref.split('#');
  if (!jobMails.some((mail) => mail.id === id)) fail(`canonical source scene ${id} is missing`);
}

const actors = [
  {
    id: 'ingrid_omradesjef_mellomleder', name: 'Ingrid', role: 'områdesjef og rapportmottaker',
    function: 'Representerer beslutningsnivået som trenger et styringssignal før hele arbeidshverdagen kan beskrives i tall. Ingrid gjør det nødvendig å skille observert leveranse, overtid, usikker kapasitet og ukjent arbeidsmiljø fra tolkninger, slik at rapporten kan brukes uten å gjøre fravær av data til bevis på ro.',
    authority_relation: 'Ingrid kan be om rapportering, klargjøre prioriteringer og eie beslutninger innen sin linje, mens mellomlederen eier kvaliteten og avgrensningen i eget beslutningsgrunnlag. Press om en grønn status gir ikke fullmakt til å skjule kostnad, love ekstra kapasitet eller opptre som eier, styre, HR eller konsernledelse.',
    workplace_ids: [WORKPLACES[0]], source_scene_refs: [SOURCE_REFS[0]]
  },
  {
    id: 'mads_sidestilt_leder_mellomleder', name: 'Mads', role: 'sidestilt leder i styringsdialogen',
    function: 'Representerer en lederkollega som ser hvordan det samme tiltaket kan bli lest som investering, kapasitetskostnad eller politisk signal avhengig av presentasjonen. Mads gjør styringsspråk til en konkret relasjonell risiko: et godt råd kan synliggjøre flere hensyn, men kan også friste spilleren til å gjøre én sann del til hele bildet.',
    authority_relation: 'Mads kan dele erfaring, koordinere avhengigheter og forklare hvordan ledergruppen sannsynligvis vil lese tallene, men han godkjenner ikke spillerens rapport og leder ikke spillerens team. Kollegial støtte kan aldri erstatte delegert mandat, skjule vesentlig risiko eller gjøre strategisk innpakning til tillatelse for uriktig rapportering.',
    workplace_ids: [WORKPLACES[1]], source_scene_refs: [SOURCE_REFS[1]]
  },
  {
    id: 'rana_teamkoordinator_mellomleder', name: 'Rana', role: 'teamkoordinator med lokal kapasitetskunnskap',
    function: 'Representerer den nære kunnskapen om hvordan opplæring, tempo, uformell støtte og faktisk oppgavefordeling påvirker kapasiteten bak et tilsynelatende fullt bemannet team. Rana gjør lokal erfaring til etterprøvbar driftsinformasjon uten at enkeltobservasjoner automatisk blir diagnose, personalsak eller tillatelse til å dele private forhold.',
    authority_relation: 'Rana kan beskrive arbeidsflyt, belastning og hvor laget trenger avklaring, men hun avgjør ikke bemanning, helseforhold eller formelle personaltiltak. Mellomlederen kan justere arbeid innen delegert mandat og be om bedre grunnlag, men kan ikke bruke koordinatorens tillit til å omgå personvern, HR-linje eller faglige beslutningsgrenser.',
    workplace_ids: [WORKPLACES[2]], source_scene_refs: [SOURCE_REFS[2]]
  },
  {
    id: 'thomas_medarbeider_oppfolging_mellomleder', name: 'Thomas', role: 'medarbeider i avgrenset oppfølging',
    function: 'Representerer medarbeideren som trenger å vite om en samtale handler om støtte, ordinære forventninger eller starten på en formell prosess. Thomas gjør lederens språk og dokumentasjon til selve arbeidsobjektet: bare relevante observasjoner, avtalte tiltak og tydelig prosess kan følges opp uten at antakelser om helse eller motiv blir behandlet som fakta.',
    authority_relation: 'Mellomlederen kan beskrive observerbart arbeid, avklare ordinære forventninger og avtale støtte innen mandat, men kan ikke diagnostisere utmattelse, love fortrolighet utenfor gjeldende policy eller starte en skjult formell sak. Thomas kan be om klarhet og korrigere faktagrunnlaget; han gir ikke samtykke til sladder eller ubegrenset dokumentasjon.',
    workplace_ids: [WORKPLACES[3]], source_scene_refs: [SOURCE_REFS[3]]
  }
].map((actor) => ({
  ...actor,
  fictional: true,
  fictional_scenario_actor: true,
  canonical_person_ref: null,
  mail_family_refs: [FAMILY_ID]
}));

const commonMail = {
  mail_type: 'people', mail_family: FAMILY_ID, role_scope: ROLE, phase: 'early', priority: 72,
  cooldown: 2, repeatable: false, stage: 'stable', channel: 'work', messageChannel: 'work',
  mail_class: 'professional_message',
  purpose: 'Readiness-prerequisite: koble en typed profesjonell relasjon til en eksisterende Mellomleder-arbeidsflate uten å endre canonical plan eller formell myndighet.',
  stakes: 'Valget påvirker beslutningskvalitet, tillit og sporbarhet, men kan aldri utvide mandat, erstatte korrekt personalprosess eller gjøre et styringssignal sannere enn kildene.'
};
const bind = (mail, index) => ({
  ...commonMail, ...mail,
  actor_id: actors[index].id,
  person_id: actors[index].id,
  people_ref: actors[index].id,
  place_id: WORKPLACES[index],
  source_scene_ref: SOURCE_REFS[index]
});

const mails = [
  bind({
    id: 'mellomleder_people_ingrid_rapport_001', subject: 'Ingrid trenger ett styringssignal før ledermøtet',
    summary: 'Mandagsrapporten viser 101 prosent leveranse og moderat registrert overtid, men sier ingenting sikkert om hvordan tempoet oppleves eller hvor mye uformell støtte som holder resultatet oppe. Ingrid trenger ett styringssignal før ledermøtet. Mellomlederen må gjøre både resultat, kjent kostnad og usikkerhet synlig uten å diagnostisere laget, kreve bemanning som ikke er besluttet eller late som et grønt tall alene beskriver gjennomføringsevnen.',
    situation: [
      'Leveransen er 101 prosent, registrert overtid er moderat, og det finnes ikke en ny måling av arbeidsmiljø eller skjult støttearbeid.',
      'Ingrid spør om rapporten kan stå grønn og ber om én kort forklaring dersom noe må løftes videre.',
      'Du skal gjøre rapporten beslutningsbar uten å gjøre ukjent kapasitet til enten dokumentert krise eller dokumentert ro.'
    ],
    choices: [
      { id: 'A', label: 'Rapportere resultat, kostnad og usikkerhet', reply: 'Jeg markerer leveransen som oppnådd, viser registrert overtid og skriver eksplisitt at bærekraftig kapasitet ikke kan konkluderes før vi har bedre grunnlag.', effect: 0, tags: ['professional_relationship'], feedback: 'Du gir Ingrid et kort styringssignal som fortsatt kan etterprøves. Rapporten skiller målt resultat fra kjent kostnad og ukjent belastning, slik at hun kan prioritere videre uten at du har funnet opp verken en personalsak eller en rett til nye ressurser. Det beskytter både beslutningskvalitet og mandatgrensen.', effects: { stats: { clarity: 2, integrity: 2, decision_quality: 2 } } },
      { id: 'B', label: 'Holde rapporten entydig grønn', reply: 'Jeg rapporterer 101 prosent levering og moderat overtid som grønt, og lar kapasitetsusikkerheten vente til vi har sikrere tegn.', effect: 0, tags: ['professional_relationship'], feedback: 'Du sender et enkelt signal oppover, men gjør fravær av data til en implisitt bekreftelse på at leveransen er bærekraftig. Ingrid får mindre friksjon i møtet, mens kostnaden og usikkerheten blir vanskeligere å koble til beslutningen dersom teamet senere ikke holder samme tempo.', effects: { stats: { presentation: 2, ambiguity: 2, future_risk: 2 } } }
    ]
  }, 0),
  bind({
    id: 'mellomleder_people_mads_styringspolitikk_001', subject: 'Mads ser to sanne historier i de samme tallene',
    summary: 'Opplæringstiden kan beskrives som en investering i fremtidig kapasitet, men den reduserer samtidig leveransekapasiteten denne uken. Mads forklarer at ledergruppen sannsynligvis vil belønne investeringsspråket og utfordre kostnadsspråket. Mellomlederen må bevare begge de sanne sidene, skille kollegialt råd fra godkjenning og unngå at strategisk innpakning skjuler den operative konsekvensen som beslutningstakerne faktisk trenger å ta stilling til.',
    situation: [
      'Den planlagte opplæringen bygger nødvendig kompetanse, men opptar timer som ellers ville gått til ukens leveranse.',
      'Mads sier at investeringsrammen vil møte mindre motstand enn en rapport som legger hovedvekten på kapasitetskostnaden.',
      'Du kan bruke rådet til å gjøre saken lesbar, men Mads har verken godkjenningsmyndighet eller ansvar for faktagrunnlaget ditt.'
    ],
    choices: [
      { id: 'A', label: 'Vise investering og kapasitetskostnad sammen', reply: 'Jeg beskriver opplæringen som en begrunnet investering og tallfester samtidig hvilken kortsiktig kapasitet og usikkerhet beslutningen medfører.', effect: 0, tags: ['professional_relationship'], feedback: 'Du bruker Mads som en kilde til politisk forståelse uten å låne en myndighet han ikke har. Ledergruppen får se både hensikten og kostnaden, og kan dermed velge prioritet på et sannferdig grunnlag. Rapporten blir strategisk lesbar uten at den operative virkeligheten redigeres bort.', effects: { stats: { decision_quality: 2, transparency: 2, trust_peer: 1 } } },
      { id: 'B', label: 'Lede med investeringshistorien alene', reply: 'Jeg fremhever kompetanseinvesteringen og lar kapasitetskostnaden ligge i vedlegget dersom noen spør etter den.', effect: 0, tags: ['professional_relationship'], feedback: 'Du øker sjansen for støtte til opplæringen, men lar presentasjonsformen avgjøre hvor synlig kostnaden blir. Dersom ukens leveranse svikter, kan beslutningstakerne med rette si at de aldri fikk det samtidige avveiningsgrunnlaget, og Mads sitt råd kan ikke brukes som godkjenning i etterkant.', effects: { stats: { influence: 2, transparency: -2, future_risk: 2 } } }
    ]
  }, 1),
  bind({
    id: 'mellomleder_people_rana_kapasitet_001', subject: 'Rana kjenner kapasiteten bak åtte av åtte navn',
    summary: 'Bemanningsarket viser åtte av åtte på jobb, men Nadia er i opplæring, Thomas leverer langsommere enn planlagt og Ida bruker tid på uformell veiledning. Rana kjenner arbeidsflyten og kan vise hvor kapasiteten faktisk forsvinner. Mellomlederen må behandle observasjonene som avgrenset driftsevidens, ikke som diagnose eller tillatelse til å dele personopplysninger, og justere arbeid innen eget mandat før en bredere sak eventuelt eskaleres.',
    situation: [
      'Arket viser full bemanning, samtidig som opplæring, lavere tempo og uformell veiledning reduserer tilgjengelige leveringstimer.',
      'Rana kan beskrive hvilke oppgaver som stopper og hvem som hjelper hvem, men hun kjenner ikke medisinske årsaker eller formell status.',
      'Du må velge en lokal kapasitetsrespons som er tydelig nok til å måles uten å gjøre medarbeiderobservasjoner til sladder eller personalsak.'
    ],
    choices: [
      { id: 'A', label: 'Justere oppgaver og samle avgrenset evidens', reply: 'Jeg fordeler opplæring og kritiske oppgaver på nytt, avtaler hvilke flaskehalser Rana skal logge, og holder årsakstolkninger utenfor kapasitetsbildet.', effect: 0, tags: ['professional_relationship'], feedback: 'Du bruker lokal kunnskap som driftsevidens og holder personvern- og mandatgrensen lesbar. Tiltaket kan prøves, måles og korrigeres uten at Rana gjøres til personalansvarlig eller at enkeltpersoners tempo forklares med antakelser. Ved behov finnes det nå et bedre grunnlag for riktig eskalering.', effects: { stats: { capacity: 2, privacy: 2, evidence_quality: 2 } } },
      { id: 'B', label: 'Be hele laget øke tempoet', reply: 'Jeg minner alle om leveransekravet og ber Rana følge ekstra med på hvem som fortsatt trenger støtte gjennom dagen.', effect: 0, tags: ['professional_relationship'], feedback: 'Du sender et tydelig krav, men lar den kjente strukturen bak kapasitetsgapet stå urørt. Rana blir samtidig bedt om å overvåke personer fremfor arbeidsflyt, noe som kan gjøre støttebehov til sosial eksponering uten at dataene blir bedre eller ledermandatet mer presist.', effects: { stats: { pressure: 2, trust_team: -2, ambiguity: 2 } } }
    ]
  }, 2),
  bind({
    id: 'mellomleder_people_thomas_oppfolging_001', subject: 'Thomas spør hva oppfølgingen faktisk betyr',
    summary: 'Etter samtalen spør Thomas om dette fortsatt er vanlig støtte, en tydelig forventningsavklaring eller starten på en formell personalsak. Notatene inneholder observerbart arbeid, men også løse formuleringer om energi og motivasjon som ikke er avklart. Mellomlederen må beskrive kjent status, korrigere dokumentasjonen til nødvendige fakta og avtale neste steg uten å diagnostisere, love fortrolighet utenfor policy eller gjøre helse-adjacent informasjon til stoff for teamet.',
    situation: [
      'Thomas har fått støtte og en ordinær forventningsavklaring, men det er ikke besluttet at en formell personalprosess er startet.',
      'Noen notater beskriver konkret arbeid og frister, mens andre tolker energi og motivasjon uten sikkert grunnlag.',
      'Han ber om et klart svar på hva som skjer, hva som dokumenteres og hvem som kan få innsyn.'
    ],
    choices: [
      { id: 'A', label: 'Avklare status og begrense dokumentasjonen', reply: 'Jeg sier hva som er støtte og ordinære forventninger nå, bekrefter at ingen skjult formell prosess er startet, og avtaler bare nødvendig faktadokumentasjon og innsyn.', effect: 0, tags: ['professional_relationship'], feedback: 'Du gjør prosessgrensen eksplisitt og gir Thomas mulighet til å korrigere faktagrunnlaget. Dokumentasjonen knyttes til observerbart arbeid, avtalte tiltak og gjeldende innsyn, uten diagnose eller ubegrenset fortrolighetsløfte. Dersom en formell prosess senere blir aktuell, må den startes i riktig linje og varsles som det.', effects: { stats: { clarity: 2, privacy: 2, trust_employee: 2 } } },
      { id: 'B', label: 'Beholde fleksibilitet og dokumentere bredt', reply: 'Jeg sier at vi foreløpig følger opp uformelt, men beholder alle notatene slik at vi har et komplett bilde dersom saken blir mer alvorlig.', effect: 0, tags: ['professional_relationship'], feedback: 'Du unngår å låse prosessen, men lar Thomas bære usikkerheten mens tolkninger samles uten tydelig formål eller innsynsgrense. Bred dokumentasjon er ikke det samme som godt grunnlag, og en senere formell prosess blir mindre ryddig dersom uavklarte helse- eller motivantakelser allerede ligger i saken.', effects: { stats: { flexibility: 1, privacy: -2, process_risk: 2 } } }
    ]
  }, 3)
];

model.related_people = actors;
model.notes = [
  ...(model.notes || []),
  'Mellomleder-readiness: fire eksplisitt fiktive profesjonelle scenarioaktører binder canonicale to-ukers jobscener til eksisterende arbeidsflater; private og historiske People-familier forblir uendret.'
];
people.families.push({
  id: FAMILY_ID,
  description: 'Profesjonelle arbeidsrelasjoner for Mellomleder-readiness: typed, eksplisitt fiktive scenarioaktører på eksisterende arbeidsflater. Familien er prerequisite-evidens og er ikke et nytt steg i canonical plan.',
  fictional_scenario_actors: actors.map((actor) => actor.id),
  thread_binding: { people_thread_id: FAMILY_ID, people_phase: 'early' },
  mails
});

write(MODEL_PATH, model);
write(PEOPLE_PATH, people);

for (const rel of PROTECTED) {
  if (sha(rel) !== protectedBefore[rel]) fail(`protected canonical source changed: ${rel}`);
}

console.log(`Materialized ${actors.length} fictional professional actors and ${mails.length} bounded People scenes for ${KEY}.`);
console.log('Protected plan, grammars, Job catalog and existing People base remain byte-identical.');
