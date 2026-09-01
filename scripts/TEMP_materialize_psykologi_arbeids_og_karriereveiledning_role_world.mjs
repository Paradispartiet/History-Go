import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const ROLE = 'psykologi_arbeids_og_karriereveiledning';
const KEY = `psykologi/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/psykologi/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/psykologi/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/psykologi/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/psykologi/${ROLE}_plan.json`;
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];

const locks = {
  [MODEL]: '25a5167b7199020b529fad04b3669d39836577a66f05bf5d05593603012608ea',
  [GRAMMAR]: 'cac5de6dfa00a8df3bc9df16bd57a44fa8a3cc60351ae873d82940a17fda2bf6',
  [PLAN]: '473f2a52d72ca9d720d085c7286d34300c66d6cc603f38911856d59911e137f9',
  'data/Civication/roleModels/manifest.json': '9dee59410b2a89811dd725dd9d9d71dd8f8da9c2dfbc13188254d25d93eb65da'
};
for (const [file, expected] of Object.entries(locks)) {
  if (sha256(file) !== expected) throw new Error(`Source drift: ${file}`);
}

const refs = [];
for (const type of TYPES) {
  const file = `data/Civication/mailFamilies/psykologi/${type}/${ROLE}_${type}.json`;
  for (const mail of read(file).families.flatMap((family) => family.mails || [])) refs.push(`${file}#${mail.id}`);
}
if (refs.length !== 15 || new Set(refs).size !== 15) throw new Error('Expected 15 distinct canonical scene refs');

const model = read(MODEL);
const grammar = read(GRAMMAR);
const audiences = [
  {
    id: 'seekers',
    standing_axis: 'autonomy_and_consent_standing',
    cares_about: ['at egne mål, erfaringer og samtykke faktisk styrer planen', 'at foreløpige tolkninger kan motsies og revideres'],
    cannot_grant: 'Veisøkerens tillit kan ikke gi veilederen rett til å diagnostisere, behandle eller bestemme arbeid og utdanning på personens vegne.'
  },
  {
    id: 'guidance_colleagues',
    standing_axis: 'method_and_reflection_standing',
    cares_about: ['etterprøvbar metodebruk og bevart faglig uenighet', 'at kartlegging brukes som spørsmål og ikke personmerkelapp'],
    cannot_grant: 'Faglig standing kan ikke gjøre kartleggingsresultater til diagnose, klinisk arbeidsevnevurdering eller sannhet om veisøkeren.'
  },
  {
    id: 'team_leadership',
    standing_axis: 'delivery_and_boundary_standing',
    cares_about: ['realistiske frister, synlig restarbeid og ansvarlig lukking', 'at resultatpress ikke forfalsker måleierskap eller samtykke'],
    cannot_grant: 'Lederstanding kan ikke gi klinisk autorisasjon, utvide samtykke eller overføre beslutningen om livsvalg fra veisøkeren.'
  },
  {
    id: 'employers',
    standing_axis: 'relevance_and_match_standing',
    cares_about: ['presise arbeidskrav, sannferdig kompetanse og avgrenset deling', 'at en match tåler den faktiske arbeidshverdagen'],
    cannot_grant: 'Arbeidsgiverstanding kan ikke gi tilgang til sensitive opplysninger, omgjøre veiledning til helseattest eller presse fram ugyldig samtykke.'
  },
  {
    id: 'public_service_partners',
    standing_axis: 'handoff_and_accountability_standing',
    cares_about: ['tydelig neste eier, ventepunkt, frist og vurderingsdato', 'at systemaktivitet ikke forveksles med veisøkerens endelige valg'],
    cannot_grant: 'Systemstanding kan ikke gjøre en foreløpig plan bindende, legitimere overskuddsinformasjon eller låne klinisk myndighet.'
  },
  {
    id: 'education_and_training_partners',
    standing_axis: 'pathway_and_feasibility_standing',
    cares_about: ['realistiske kvalifiseringsløp og synlige overgangskostnader', 'at kortsiktig aktivitet ikke skjuler et langsiktig læringsmål'],
    cannot_grant: 'Utdanningsstanding kan ikke gjøre veilederens råd til opptaksvedtak, egnethetsdom eller beslutning over veisøkerens framtid.'
  },
  {
    id: 'private_relations',
    standing_axis: 'presence_and_confidentiality_standing',
    cares_about: ['nærvær uten at arbeidsdagen tar over privatlivet', 'at taushetsplikt og usikkerhet bæres uten uformell saksdrøfting'],
    cannot_grant: 'Privat tillit kan ikke brukes som faglig fullmakt eller gjøre nære relasjoner til reserveveiledere og mottakere av personopplysninger.'
  }
];

const days = [
  { situation: 'Nora sier at hun kan søke «hva som helst» fordi systemfristen nærmer seg, men formuleringen bærer veilederens hastverk mer enn hennes egen retning.', turn: 'Sesongen åpner med forskjellen mellom registrert aktivitet og et mål personen faktisk kan eie.' },
  { situation: 'Interesseprofilen peker mot strukturert kontorarbeid, mens Noras erfaring sier at isolasjon og ensformighet var grunnen til at forrige forsøk brøt sammen.', turn: 'Kartleggingen må åpnes for motbevis før den får forme neste alternativ.' },
  { situation: 'Utkastet til CV forklarer et fravær med mer helsehistorie enn Nora ønsker å dele, selv om én nøktern og sann linje er nok for kronologien.', turn: 'En pen tekst kan være et personvernbrudd dersom forfatterkontrollen forsvinner.' },
  { situation: 'Elins stillingsbeskrivelse blander ufravikelige skiftkrav med ønsker om personlighet og tempo, og Nora risikerer å bli oversolgt inn i en jobb som ikke varer.', turn: 'Matcharbeidet må skille faktisk oppgavekrav, tilretteleggingsrom og reklamespråk.' },
  { situation: 'Marius trenger en aktivitet før dagen er over, mens både et kvalifiseringsløp og et jobbspor fortsatt mangler avgjørende svar.', turn: 'Venting må få eier og vurderingsdato uten at datofeltet oppfinner et sluttvalg.' },
  { situation: 'Samir finner at planen kaller Nora umotivert, selv om samtalen viser ambivalens, tidligere nederlag og et mål som aldri ble hennes.', turn: 'Faglig kollegialitet prøves når en sikker formulering må åpnes igjen.' },
  { situation: 'Elin ber om årsaken til CV-hullet samtidig som et intervju plutselig kan gjennomføres samme ettermiddag.', turn: 'Kalenderpress og arbeidsgivermakt gjør frivillig deling vanskeligere å vurdere.' },
  { situation: 'Nora trekker den brede helsedelen av samtykket, men en eldre planversjon ligger allerede klar i handoffen til arbeidsgiverkontakten.', turn: 'Versjonskontroll blir et spørsmål om autonomi, ikke bare dokumentorden.' },
  { situation: 'Jobbmuligheten kobles til en antydning om at en helseforklaring vil gjøre intervjuet enklere å godkjenne.', turn: 'Et positivt utfall kan ikke brukes til å vaske bort en urettmessig informasjonskostnad.' },
  { situation: 'Et vikariat kan starte mandag og gir inntekt og referanse, men skyver kvalifiseringsløpet Nora selv har begynt å velge.', turn: 'Kortsiktig trygghet og langsiktig retning må vises som et reelt valg uten moralsk fasit.' },
  { situation: 'Oppfølgingen viser at ingen søknader ble sendt, og systemet leser stillheten som svak motivasjon selv om målet aldri bar Noras begrunnelse.', turn: 'Planen må gjenåpnes uten å gjøre manglende handling til en stabil egenskap.' },
  { situation: 'History Go-sporet viser hvordan tester og veiledning historisk har sortert mennesker etter skiftende institusjons- og arbeidsmarkedsbehov.', turn: 'Historien skal forbedre spørsmålet til dagens evidens, ikke dømme Noras egnethet.' },
  { situation: 'Elin tilbyr intervju, men begrunner tilbudet med en privat opplysning Nora ikke visste at noen hadde sendt.', turn: 'Resultatet vender tilbake som bevis på at prosessen kostet mer samtykke enn den fikk.' },
  { situation: 'Sluttgjennomgangen må skille Noras valgte retning fra systemets aktivitetstall og plassere åpne svar, samtykkegrenser og neste eier før planen lukkes.', turn: 'Læring må bli synlig uten at veilederen overtar valget eller skjuler restarbeidet.' }
];
const phases = ['morning', 'lunch', 'afternoon', 'evening'];
const phaseWork = [
  'Morgenen krever at spilleren skiller Noras ord, dokumentert evidens, egen tolkning og institusjonell frist; alt som fortsatt er uavklart merkes før planen oppdateres.',
  'I lunsjsamtalen må den berørte personen få korrigere premisset, og faglig uenighet, samtykkeendring og ubesvarte spørsmål må følge handoffen uten å glattes bort.',
  'Ettermiddagsvalget må angi avgrenset handling, neste eier, ventepunkt og kontrolltid, samtidig som arbeidsgiver- eller systembehov holdes adskilt fra Noras beslutningsrett.',
  'Kvelden viser hva tempoet gjorde med språk, nærvær og privat grense; saken må ligge igjen som sporbar rest, ikke flyttes over på utholdenhet eller uformell deling.'
];
const phaseFallout = [
  'Når kildene skilles før første handling, kan senere aktører se hva de faktisk vet; hvis tolkningen skjules som fakta, starter resten av dagen med en lånt sikkerhet.',
  'Når korrigeringen blir stående i planen, kan uenighet forbedre neste møte; hvis den redigeres bort, blir høflighet feilaktig lest som samtykke.',
  'Når eier, frist og stoppregel er eksplisitte, kan venting håndteres uten skyldforskyvning; ellers arver personen med minst makt både risiko og forklaringsbyrde.',
  'Når restarbeid og privat grense registreres ærlig, kan neste dag begynne sant; hvis veilederen absorberer presset alene, forsvinner systemfeilen bak profesjonell maske.'
];
const beatTypes = ['task', 'conversation', 'decision', 'private_consequence'];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
    const phase = phases[phaseIndex];
    const audience = audiences[(day + phaseIndex - 1) % audiences.length];
    const dayFrame = days[day - 1];
    const marker = `D${day}-${phase}`;
    coverage.push({
      day,
      phase,
      beat_type: beatTypes[phaseIndex],
      summary: `${dayFrame.situation} ${phaseWork[phaseIndex]} ${dayFrame.turn} I ${marker} oppdateres den samtykkebundne valg- og overgangsplanen gjennom den kanoniske scenen, uten ny runtime. Veiledning forblir støtte til valg og blir aldri diagnose, psykoterapi, klinisk arbeidsevnevurdering eller beslutningsmyndighet over arbeid og utdanning.`,
      standing_audience: audience.id,
      standing_consequence: `${marker} gjør den situerte kostnaden synlig for ${audience.id}, som vurderer veilederen etter ${audience.cares_about[0]}. ${phaseFallout[phaseIndex]} ${dayFrame.turn} Håndteringen kan styrke tillit her og samtidig svekke den hos et annet publikum som bærer en annen kostnad. Følgen summeres aldri globalt og gir ingen ny klinisk, juridisk, informasjons- eller beslutningsmyndighet.`,
      materialization_refs: [refs[((day - 1) * 4 + phaseIndex) % refs.length]]
    });
  }
}

const actorProfiles = [
  {
    wants: 'Å eie retningen og kunne endre planen når erfaring, verdier eller hverdagsrammer motsier det første utkastet.',
    conceals: 'Hun toner ned tvil når hun merker at systemet belønner raske og ryddige svar.',
    speech_style: 'Konkret om erfaring og belastning, men kort og ettergivende når tidsfristen presenteres som uunngåelig.',
    teaches_player: 'At fravær av protest ikke er måleierskap, og at et gyldig samtykke må kunne avgrenses uten at muligheter straffes.'
  },
  {
    wants: 'At kollegiet bruker kartlegging transparent nok til at veisøkerens erfaring kan motsi både verktøy og veileder.',
    conceals: 'Han liker metodisk orden og kan derfor undervurdere hvor mye autoritet et ryddig skjema får i et presset system.',
    speech_style: 'Analytisk og spørrende, med krav om å skille observasjon, hypotese, veisøkerens ord og faglig konklusjon.',
    teaches_player: 'At god faglig kvalitet innebærer sporbar tvil, rework og bevart uenighet, ikke bare en konsistent plan.'
  },
  {
    wants: 'Å finne en kandidat som kan løse de reelle oppgavene og samtidig redusere arbeidsgiverens usikkerhet før intervjuet.',
    conceals: 'Hun vet at enkelte personspørsmål er unødvendige, men opplever dem som en raskere vei til intern godkjenning.',
    speech_style: 'Resultatorientert og vennlig, men presser på med korte frister og formuleringer om hva som vil gjøre prosessen enklere.',
    teaches_player: 'At en jobbmulighet skaper maktasymmetri, og at relevans må forsvares før personopplysninger deles.'
  },
  {
    wants: 'Å få en etterprøvbar oppfølgingsplan som oppfyller reelle frister uten at usikkerhet og venting forsvinner fra saken.',
    conceals: 'Han er redd for at åpne alternativer skal se ut som manglende framdrift i systemets rapportering.',
    speech_style: 'Friststyrt og saklig, med vekt på aktivitet, eier og dato, men mottakelig for presise begrunnelser for venting.',
    teaches_player: 'At systemkrav kan oppfylles med et sant neste steg uten å gjøre utforsking til et endelig livsvalg.'
  }
];
const archetypes = model.related_people.map((person, index) => ({
  id: `${person.id}_world`,
  social_function: person.function,
  class_position: person.role,
  status: `Situert profesjonell standing knyttet til ${model.work_life.workplaces[index]}.`,
  power_over_player: person.authority_relation,
  ...actorProfiles[index]
}));

const primaryThreads = [
  ['nora_goal_ownership', 'Nora og veilederen forhandler om hvem målet tilhører når frister, manglende søknader og nye alternativer presser planen.', ['1/morning', '1/lunch', '5/afternoon', '10/morning', '11/lunch', '14/afternoon']],
  ['samir_method_dissent', 'Samir gjør kartleggingens usikkerhet og kollegial rework til en prøve på om profesjonskulturen tåler at veisøkerens erfaring motsier et ryddig verktøy.', ['2/morning', '2/afternoon', '6/morning', '6/afternoon', '12/lunch', '14/lunch']],
  ['elin_relevance_and_privacy', 'Elins legitime behov for jobbmatch kolliderer med presset for helseforklaring, Noras kontroll over opplysningene og senere ansvar for hva som faktisk ble delt.', ['4/morning', '4/afternoon', '7/morning', '9/afternoon', '13/morning', '13/afternoon']],
  ['marius_system_time', 'Marius og veilederen må gjøre frister, venting og neste eier synlige uten å gjøre rapporterbar aktivitet til sluttvalg eller plassere skylden for systemtid hos Nora.', ['1/afternoon', '5/morning', '5/afternoon', '8/lunch', '11/morning', '14/morning']],
  ['consent_versioning', 'Noras samtykke endres mens CV, presentasjon og arbeidsgiverhandoff beveger seg raskere enn godkjenningen, slik at gammel og ny planversjon får ulik sosial kostnad.', ['3/morning', '3/afternoon', '7/lunch', '8/morning', '8/afternoon', '13/lunch']],
  ['history_and_classification', 'Historien om testing vender tilbake i dagens metodevalg og hindrer at institusjonelle kategorier gjøres til personens natur.', ['2/lunch', '6/lunch', '9/lunch', '12/morning', '12/afternoon', '14/lunch']],
  ['private_boundary', 'Arbeidsdagens tidspress og sensitive stoff må få privat etterklang uten at nære relasjoner blir reservekolleger, uformelle saksdrøftere eller mottakere av personopplysninger.', ['1/evening', '3/evening', '7/evening', '9/evening', '11/evening', '14/evening']]
].map(([id, relationship, beat_refs]) => ({ id, relationship, beat_refs }));

const privatePairs = [[1, 3], [4, 7], [8, 9], [10, 11], [13, 14]];
const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'psykologi',
  role_scope: ROLE,
  title: 'Arbeids- og karriereveiledning — valgautonomi, sortering og situert tillit',
  status: 'role_world_complete',
  materialization: {
    authored_dimensions: ['situated_reputation'],
    no_new_runtime: true,
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_people_foundation_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    cross_role_link_materialized: false,
    source_refs: refs
  },
  existing_work_continuity: {
    runtime_binding: 'existing_mail_plan_and_work_grammar',
    new_runtime_state: false,
    work_loops: grammar.work_loops,
    persistent_work_object: 'samtykkebundet_valg_og_overgangsplan',
    canonical_surfaces: [MODEL, GRAMMAR, PLAN, ...TYPES.map((type) => `data/Civication/mailFamilies/psykologi/${type}/${ROLE}_${type}.json`)],
    rule: 'Eksisterende plan, fire fiktive aktører, fire arbeidsflater, venting, handoff, rework, samtykke og veisøkerens beslutningsrett forblir authoritative.'
  },
  sociological_core: [
    'resultatpress kan gjøre systemaktivitet til et lånt livsmål',
    'kartlegging og arbeidsmarkedsfiltre fordeler muligheter og definisjonsmakt',
    'samtykke og privatliv prøves i porten mellom veisøker, arbeidsgiver og offentlig oppfølging'
  ],
  employment_conditions: [
    'rådgiver- eller veilederansvar uten klinisk autorisasjon',
    'resultat- og fristpress i et fleraktørsystem',
    'kunnskapsasymmetri uten beslutningsrett over veisøkerens liv'
  ],
  professional_culture: [
    'veisøkerens begrunnelse kan motsi både skjema og systemfrist',
    'faglig kvalitet krever sporbar tvil og rework',
    'relevant deling er mindre enn alt et system eller en arbeidsgiver ønsker å vite'
  ],
  recurring_people_archetypes: archetypes,
  social_environments: model.work_life.workplaces,
  slow_axes: ['goal_ownership', 'consent_integrity', 'method_humility', 'system_time', 'match_truth', 'private_containment'],
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: 'Standing kan aldri gi diagnostisk eller behandlingsmessig myndighet, klinisk arbeidsevnevurdering, tilgang til sensitive opplysninger, opptaks- eller ansettelsesmyndighet eller beslutningsrett over veisøkerens arbeid og utdanning.',
    rule: 'Standing divergerer mellom publikum, kan gå i ulike retninger etter samme valg og summeres aldri globalt.'
  },
  history_go_affordance: {
    source_ref: refs.find((ref) => ref.includes('/knowledge/')),
    knowledge_use: 'Institusjons-, testings- og arbeidsmarkedshistorie brukes til å undersøke hvordan kategorier og veiledningsverktøy fordeler synlighet og muligheter.',
    better_question: 'Hvilke historiske institusjons-, testings- og arbeidsmarkedsforhold gjorde denne kategorien nyttig, hvem ble sortert eller usynliggjort av den, hvilken nåværende evidens motsier den, og hvordan kan Nora selv prøve alternativet uten at historien blir en egnethetsdom?',
    authority_boundary: 'History Go kan skjerpe spørsmål om system, kategori og makt, men kan ikke diagnostisere, behandle, vurdere klinisk arbeidsevne, gi tilgang til persondata eller bestemme Noras jobb og utdanning.'
  },
  cross_role_link: {
    status: 'candidate_when_shared_work_is_real',
    materialized: false,
    new_runtime: false,
    companion_keys: ['psykologi/klinikkleder', 'psykologi/psykologi_miljoarbeid'],
    rule: 'Ingen delt runtime eller shared_work_object opprettes før faktisk felles arbeid, eierskap, samtykke og handoff er styrt.'
  },
  theme_ids: ['professional_culture', 'class_power', 'bureaucratic_power', 'care_vs_efficiency', 'shame_reputation', 'precarity', 'status_anxiety', 'public_private_leakage', 'local_knowledge_vs_system', 'invisible_work', 'emotional_labor'],
  season: { days: 14, day_phases: phases, coverage },
  primary_threads: primaryThreads,
  private_aftermath: privatePairs.map(([from, to], index) => ({
    id: `private_aftermath_${index + 1}`,
    beat_refs: [`${from}/evening`, `${to}/evening`],
    meaning: 'Arbeidsdagens usikkerhet, tidspress og personvern bæres uten at privatlivet blir uformell saksbehandling eller profesjonell reservekapasitet.'
  })),
  delayed_consequences: [
    ['borrowed_goal', '1/morning', '11/lunch'],
    ['profile_label', '2/morning', '6/afternoon'],
    ['cv_disclosure', '3/morning', '13/morning'],
    ['match_truth', '4/morning', '10/afternoon'],
    ['system_waiting', '5/morning', '14/morning'],
    ['consent_version', '7/lunch', '8/afternoon'],
    ['health_pressure', '9/morning', '13/afternoon'],
    ['historical_sorting', '2/lunch', '12/afternoon']
  ].map(([id, setup_ref, return_ref]) => ({
    id,
    setup_ref,
    return_ref,
    meaning: `${id} lar et tidlig dokumentert valg eller premiss vende tilbake som en senere, etterprøvbar følge for plan, relasjon og situert standing.`
  }))
};

write(WORLD, world);
const index = read('data/Civication/roleWorlds/index.json');
index.roles = index.roles.filter((entry) => !(entry.category === 'psykologi' && entry.role_scope === ROLE));
index.roles.push({ category: 'psykologi', role_scope: ROLE, status: 'role_world_complete', path: WORLD });
index.status = `${index.roles.length}_role_worlds_materialized`;
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
if (!checklist.reference_worlds.includes(WORLD)) checklist.reference_worlds.push(WORLD);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles[KEY] = world.theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

console.log('Materialized arbeids- og karriereveiledning Role World: 56 beats, 15 refs, 7 audiences');
