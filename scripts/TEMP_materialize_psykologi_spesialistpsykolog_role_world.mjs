import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const ROLE = 'spesialistpsykolog';
const KEY = `psykologi/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/psykologi/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/psykologi/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/psykologi/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/psykologi/${ROLE}_plan.json`;
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];

const locks = {
  [MODEL]: 'b693d96df8ef3b284ba1b121cba6d31ada80a19da78fda54cde627f97e769426',
  [GRAMMAR]: 'ba568b66b2ae36c4463d84bcaac0675ee75459ca3b98c91bc3d84079391afdbb',
  [PLAN]: '56b5ffb54f4547e657fbbebff1e50aa1943600fc3fb7c6e3762fb16bb1f3059c',
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
    id: 'patients',
    standing_axis: 'goal_consent_and_explanation_standing',
    cares_about: ['at eget mål, samtykke og erfaring faktisk kan endre forløpet', 'at usikkerhet forklares uten at ekspertstatus blir fasit'],
    cannot_grant: 'Pasientens tillit kan ikke gi spesialisten kompetanse utenfor egen fordypning, frita andre fra ansvar eller skape lovregulert myndighet.'
  },
  {
    id: 'supervised_psychologists',
    standing_axis: 'guidance_and_responsibility_standing',
    cares_about: ['veiledning som styrker egen begrunnelse og dømmekraft', 'at råd, beslutning og ansvar forblir sporbare og adskilte'],
    cannot_grant: 'Veiledningsstanding kan ikke gjøre spesialisten til skjult beslutningstaker eller flytte psykologens kliniske ansvar uten eksplisitt handoff.'
  },
  {
    id: 'peer_specialists',
    standing_axis: 'scope_and_dissent_standing',
    cares_about: ['presise spesialitetsgrenser og reell plass for motforklaringer', 'at uenighet bevares til evidensen kan skille hypotesene'],
    cannot_grant: 'Kollegial standing kan ikke gjøre én fordypning universell eller overføre hele forløpet til den som leverer en avgrenset vurdering.'
  },
  {
    id: 'clinical_team',
    standing_axis: 'usable_expertise_and_handoff_standing',
    cares_about: ['råd som kan prøves, evalueres og revideres i arbeidshverdagen', 'navngitt beslutningseier, ventepunkt og kriterium for gjenåpning'],
    cannot_grant: 'Teamstanding kan ikke gjøre et spesialistråd til bindende klinisk regel eller oppheve kvalifikasjons-, samtykke- og ansvarsgrenser.'
  },
  {
    id: 'service_leadership',
    standing_axis: 'delivery_and_governance_standing',
    cares_about: ['framdrift uten falsk sikkerhet eller skjult restarbeid', 'at metodepilot, variasjon og risiko styres etterprøvbart'],
    cannot_grant: 'Lederstanding kan ikke gi spesialistgodkjenning, behandlingsmyndighet eller status som faglig ansvarlig uten særskilt kvalifikasjon og utpeking.'
  },
  {
    id: 'quality_and_oversight',
    standing_axis: 'traceability_and_learning_standing',
    cares_about: ['versjonert evidens, begrunnede avvik og dokumentert rework', 'at læring skiller metodeeffekt fra status, lojalitet og rapportpress'],
    cannot_grant: 'Kvalitetsstanding kan ikke erstatte dagens kliniske evidens, personvernkrav eller rett myndighetsnivå med en historisk eller administrativ fortelling.'
  },
  {
    id: 'private_relations',
    standing_axis: 'private_containment_standing',
    cares_about: ['nærvær uten uformell drøfting av kliniske opplysninger', 'at ekspertpress og tvil bæres uten å gjøre nære relasjoner til reservekolleger'],
    cannot_grant: 'Privat tillit kan ikke brukes som faglig fullmakt, klinisk konsultasjon eller mottakssted for taushetsbelagte opplysninger.'
  }
];

const days = [
  { situation: 'Teamet vil ha ett endelig svar før Sanders konkurrerende hypoteser er prøvd, og ekspertforventningen gjør et foreløpig råd sosialt tyngre enn evidensen.', turn: 'Sesongen åpner med at presis usikkerhet må være et arbeidsprodukt, ikke en svakhet som skjules.' },
  { situation: 'Sander beskriver et hverdagsmål som ikke er operativt i den foreløpige planen, selv om planen er klinisk ryddig og lett å rapportere.', turn: 'Pasientmålet må kunne endre både vurderingsspørsmål og kriteriet for effekt.' },
  { situation: 'Ida ber spesialisten velge neste kliniske steg fordi hun frykter å stå alene med risikoen dersom hennes egen vurdering viser seg å være feil.', turn: 'Veiledningens kvalitet prøves når status kan gi rask trygghet ved å skjule hvem som faktisk besluttet.' },
  { situation: 'Standardmetoden treffer hovedhypotesen, men kolliderer med Sanders prioritet, toleranse og praktiske rammer på en måte manualen ikke avgjør.', turn: 'En tilpasning må være både individuelt relevant og etterprøvbar nok til senere rework.' },
  { situation: 'Ravi presenterer en motforklaring fra en annen fordypning og viser at den opprinnelige hypotesen mangler én beslutningskritisk observasjon.', turn: 'Faggrensen blir synlig når en legitim motstemme verken kan avvises eller gjøres til full ansvarsovertakelse.' },
  { situation: 'Forløpet venter på den beslutningskritiske observasjonen, mens teamets kalender og Sanders belastning gjør det fristende å behandle venting som passivitet.', turn: 'Venting må få eier, risikogrense og vurderingsdato uten å late som kunnskapen allerede finnes.' },
  { situation: 'Ny informasjon endrer risikobildet mens vurderingen fortsatt venter på Ravis avgrensede kompetanse, og gårsdagens tiltak kan ikke bare fortsette umerket.', turn: 'En endret risiko må åpne riktig del av loggen uten at spesialistrådet overtar den akutte beslutningslinjen.' },
  { situation: 'Handoffen til Ravi inneholder mye klinisk bakgrunn, men mangler det presise spørsmålet, objektversjonen og hvem som eier beslutningen etter svaret.', turn: 'Dataminimering og ansvar blir samme kvalitetsproblem når mer informasjon ikke skaper en bedre overføring.' },
  { situation: 'Nora vil standardisere en metodepilot fordi gjennomsnittet ser lovende ut, mens variasjonen viser at noen forløp trenger annen tilpasning og tettere evaluering.', turn: 'Fagutvikling må tåle forskjeller i utfall før en preferanse blir presentert som klinisk regel.' },
  { situation: 'Oppfølgingen viser delvis effekt: Sander beskriver én konkret forbedring, men hovedmålet står stille og én belastning har økt siden tilpasningen.', turn: 'Rework må bevare både det som virket og det som falsifiserer den for enkle suksessfortellingen.' },
  { situation: 'En eldre veiledning blir sitert i teamet som om spesialisten hadde besluttet fast praksis, selv om rådet gjaldt én versjon av ett forløp.', turn: 'Gjenfortalt ekspertstatus må føres tilbake til spørsmål, evidens, rekkevidde og faktisk beslutningseier.' },
  { situation: 'History Go-sporet ved Psykologisk institutt viser hvordan institusjoner og profesjonshistorie har formet hvem som får definere kliniske spørsmål og normalitet.', turn: 'Historien skal gjøre dagens ekspertpremiss mer prøvbart, men kan ikke levere behandlingssvaret.' },
  { situation: 'Senere praksis viser at en yngre kollega lot være å melde uenighet fordi forrige spesialistkonklusjon ble oppfattet som lukket og organisatorisk ønsket.', turn: 'Den tause motstemmen vender tilbake som pasientsikkerhets- og læringskostnad, ikke bare som et relasjonsproblem.' },
  { situation: 'Sluttgjennomgangen må skille Sanders mål og utfall fra metodepilotens prestisje, plassere gjenværende usikkerhet og navngi hvem som eier neste vurdering.', turn: 'Lukking må vise hva som er lært, hva som fortsatt er åpent og hvilken myndighet spesialiststatus aldri ga.' }
];
const phases = ['morning', 'lunch', 'afternoon', 'evening'];
const phaseWork = [
  'Morgenen krever at spilleren skiller Sanders ord, dokumentert evidens, kollegers observasjoner og egen spesialisttolkning; spesialitetsgrense, samtykke, risiko og manglende data merkes før loggen oppdateres.',
  'I lunsjsamtalen må den mest berørte stemmen få korrigere premisset, mens faglig uenighet, emosjonelt arbeid og forskjellen mellom råd og beslutning bevares uten en høflig konsensusmaske.',
  'Ettermiddagsvalget må angi et avgrenset tiltak eller ventepunkt, navngitt eier, evalueringstid og gjenåpningskriterium, med eksplisitt eskalering når spørsmålet ligger utenfor egen spesialitet eller stilling.',
  'Kvelden viser hva ekspertpresset gjorde med tvil, språk og nærvær; restarbeid må bli igjen i den versjonerte loggen uten at kliniske opplysninger eller beslutningsbyrde flyttes til privatlivet.'
];
const phaseFallout = [
  'Når kildene og hullene skilles før første handling, kan senere beslutninger etterprøves; skjules tolkningen som fakta, arver resten av dagen en autoritet evidensen aldri bar.',
  'Når korrigering og motstemme får stå i loggen, kan relasjonen forbedre neste vurdering; redigeres den bort, blir stillhet og lettelse feilaktig lest som faglig enighet.',
  'Når eier, rekkevidde, ventepunkt og stoppregel er eksplisitte, kan rådet brukes uten ansvarsglidning; ellers arver personen med minst status både risiko og forklaringsbyrde.',
  'Når restarbeid og privat grense føres sant, kan neste dag starte med riktig problem; hvis spesialisten absorberer alt selv, skjules systemkostnaden bak profesjonell utholdenhet.'
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
      summary: `${dayFrame.situation} ${phaseWork[phaseIndex]} ${dayFrame.turn} I ${marker} oppdateres spesialistforløpets hypotese-, tiltaks- og veiledningslogg gjennom den kanoniske scenen, uten ny runtime. Spesialistgodkjenning gjelder faktisk fordypning og stilling; den blir aldri generell klinisk kompetanse, skjult ansvarsovertakelse eller automatisk status som faglig ansvarlig.`,
      standing_audience: audience.id,
      standing_consequence: `${marker} gjør den situerte kostnaden synlig for ${audience.id}, som vurderer spesialisten etter ${audience.cares_about[0]}. ${phaseFallout[phaseIndex]} ${dayFrame.turn} Håndteringen kan styrke standing her og samtidig svekke den hos et annet publikum som bærer en annen kostnad. Følgen summeres aldri globalt og gir ingen ny klinisk, juridisk, informasjons- eller beslutningsmyndighet.`,
      materialization_refs: [refs[((day - 1) * 4 + phaseIndex) % refs.length]]
    });
  }
}

const actorProfiles = [
  {
    wants: 'At eget mål, samtykke og erfaring av tiltaket veier tyngre enn hvor elegant spesialistens forklaring ser ut for teamet.',
    conceals: 'Han toner ned tvil og belastning når han merker at fagmiljøet allerede har investert status i én forklaring.',
    speech_style: 'Konkret om hverdagsvirkning og prioritet, men mer forsiktig når ekspertspråk eller tidspress gjør korreksjon sosialt kostbar.',
    teaches_player: 'At pasientmedvirkning må kunne endre arbeidshypotesen, tiltaket og effektskriteriet, ikke bare bekrefte en ferdig plan.'
  },
  {
    wants: 'Å utvikle en begrunnelse hun selv kan stå for, dokumentere og revidere uten å bli forlatt alene med risikoen.',
    conceals: 'Hun kan be om fasit når statusforskjellen gjør det tryggere enn å vise hvor egen vurdering fortsatt er usikker.',
    speech_style: 'Presis om observasjoner, men søker eksplisitt bekreftelse når klinisk ansvar, hierarki og frykt for feil møtes.',
    teaches_player: 'At veiledning bygger dømmekraft når rådets rekkevidde og den veilededes beslutningsansvar forblir synlige.'
  },
  {
    wants: 'At spørsmålet til hans fordypning er avgrenset nok til at motforklaringen kan prøves uten at han arver hele forløpet.',
    conceals: 'Han kan undervurdere hvor lett et tydelig avgrenset innspill senere blir sitert som en full klinisk konklusjon.',
    speech_style: 'Hypoteseorientert og knapp, med tydelige krav til manglende observasjon, informasjonsgrunnlag og videre eier.',
    teaches_player: 'At respekt for annen ekspertise krever et reelt spørsmål og en eksplisitt handoff, ikke statuslån eller ansvarsdumping.'
  },
  {
    wants: 'Å få framdrift og mer lik praksis uten at pilotresultat, produksjonspress eller spesialistprestisje skjuler variasjon og risiko.',
    conceals: 'Hun frykter at åpen usikkerhet skal bli lest oppover som svak styring og kan derfor ønske konklusjon før læringen er moden.',
    speech_style: 'Frist- og kvalitetsorientert, mottakelig for tydelige målekriterier, men utålmodig med restarbeid som mangler eier.',
    teaches_player: 'At ledelsesmandat kan plassere tid og prosess, men aldri produsere spesialistkompetanse eller klinisk myndighet.'
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
  ['sander_goal_and_effect', 'Sanders mål og erfaring prøver om forløpsloggen faktisk kan endres av personen den gjelder, også når en ryddig klinisk fortelling peker en annen vei.', ['1/lunch', '2/morning', '4/lunch', '7/afternoon', '10/morning', '14/afternoon']],
  ['ida_guidance_and_responsibility', 'Idas behov for støtte krysser statusforskjell, risiko og senere gjenfortelling av rådet uten at veiledning blir skjult beslutning.', ['3/morning', '3/afternoon', '6/lunch', '8/afternoon', '11/morning', '13/lunch']],
  ['ravi_scope_and_dissent', 'Ravis avgrensede motforklaring gjør spesialitetsgrensen, informasjonsbehovet og handoffen til et vedvarende ansvarsspørsmål.', ['5/morning', '5/afternoon', '6/afternoon', '8/morning', '8/afternoon', '13/afternoon']],
  ['nora_standardization_and_power', 'Noras legitime behov for framdrift og lik praksis kolliderer med klinisk variasjon, faglig motstemme og myndighetsgrenser.', ['1/afternoon', '4/afternoon', '7/morning', '9/morning', '9/afternoon', '14/morning']],
  ['hypothesis_waiting_and_rework', 'Den konkurrerende hypotesen følger venting, endret risiko, delvis effekt og rework uten at tidligere evidens eller ansvar slettes.', ['1/morning', '5/lunch', '6/morning', '7/lunch', '10/afternoon', '14/lunch']],
  ['history_status_and_learning', 'Profesjonshistorien skjerper spørsmålet om ekspertstatus og institusjonsmakt før den tause motstemmen vender tilbake som dagens kvalitetsproblem.', ['2/lunch', '9/lunch', '11/lunch', '12/morning', '12/afternoon', '13/morning']],
  ['private_containment', 'Ekspertpress, tvil og klinisk alvor får privat etterklang uten at nære relasjoner blir reservekolleger eller mottakere av pasientopplysninger.', ['1/evening', '3/evening', '7/evening', '10/evening', '12/evening', '14/evening']]
].map(([id, relationship, beat_refs]) => ({ id, relationship, beat_refs }));

const privatePairs = [[1, 3], [4, 7], [8, 10], [11, 12], [13, 14]];
const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'psykologi',
  role_scope: ROLE,
  title: 'Spesialistpsykolog — prøvbar ekspertise, faggrense og situert tillit',
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
    persistent_work_object: 'spesialistforlopets_hypotese_tiltak_og_veiledningslogg',
    canonical_surfaces: [MODEL, GRAMMAR, PLAN, ...TYPES.map((type) => `data/Civication/mailFamilies/psykologi/${type}/${ROLE}_${type}.json`)],
    rule: 'Eksisterende plan, fire fiktive aktører, fire arbeidsflater, dobbel autorisasjonsport, venting, handoff, rework og ansvarsskille forblir authoritative.'
  },
  sociological_core: [
    'ekspertstatus fordeler taletid, tvilskostnad og definisjonsmakt i kliniske rom',
    'standardisering og individuell tilpasning fordeler synlighet mellom gjennomsnitt og faktisk pasientutfall',
    'veiledning, status og organisasjonspress kan flytte ansvar uten at en formell handoff har skjedd'
  ],
  employment_conditions: [
    'separat psykologautorisasjon eller lisens og spesialistgodkjenning',
    'klinisk arbeid innen faktisk spesialitet og stilling',
    'faglig forventning uten automatisk status som faglig ansvarlig'
  ],
  professional_culture: [
    'presis usikkerhet er en del av ekspertisen',
    'motstemme og rework er kvalitetsressurser',
    'veiledning skal styrke dømmekraft uten skjult ansvarsovertakelse'
  ],
  recurring_people_archetypes: archetypes,
  social_environments: model.work_life.workplaces,
  slow_axes: ['patient_goal', 'hypothesis_openness', 'specialty_scope', 'guidance_responsibility', 'method_adaptation', 'private_containment'],
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: 'Standing kan aldri gi psykologautorisasjon, spesialistgodkjenning, kompetanse utenfor faktisk fordypning, status som faglig ansvarlig, lovregulert vedtakskompetanse, persondatatilgang eller skjult ansvarsovertakelse.',
    rule: 'Standing divergerer mellom publikum, kan gå i ulike retninger etter samme kliniske valg og summeres aldri globalt.'
  },
  history_go_affordance: {
    source_ref: refs.find((ref) => ref.includes('/knowledge/')),
    knowledge_use: 'Institusjons- og profesjonshistorie brukes til å undersøke hvordan ekspertstatus, kliniske kategorier og organisatoriske forventninger former dagens spørsmål.',
    better_question: 'Hvilke historiske institusjons-, profesjons- og normalitetsforhold gjorde denne ekspertforklaringen plausibel og autoritativ, hvem eller hvilken evidens blir mindre synlig av den, hva viser dagens kliniske data, og hvilken kvalifisert rolle eier den nåværende beslutningen?',
    authority_boundary: 'History Go kan skjerpe spørsmål om institusjon, kategori og ekspertmakt, men kan ikke diagnostisere, behandle, gi autorisasjon eller spesialistgodkjenning, avgjøre dagens kliniske valg eller skape lovregulert myndighet.'
  },
  cross_role_link: {
    status: 'candidate_when_shared_work_is_real',
    materialized: false,
    new_runtime: false,
    companion_keys: ['psykologi/psykolog', 'psykologi/fagansvarlig', 'psykologi/klinikkleder'],
    rule: 'Readiness-behovet er not_required_for_rollout; ingen delt runtime eller shared_work_object opprettes før faktisk felles arbeid, samtykke, eierskap og handoff er styrt.'
  },
  theme_ids: ['professional_culture', 'class_power', 'bureaucratic_power', 'care_vs_efficiency', 'shame_reputation', 'status_anxiety', 'public_private_leakage', 'local_knowledge_vs_system', 'invisible_work', 'emotional_labor'],
  season: { days: 14, day_phases: phases, coverage },
  primary_threads: primaryThreads,
  private_aftermath: privatePairs.map(([from, to], index) => ({
    id: `private_aftermath_${index + 1}`,
    beat_refs: [`${from}/evening`, `${to}/evening`],
    meaning: 'Klinisk alvor, statuspress og tvil bæres uten pasientopplysninger, uformell konsultasjon eller døgnkontinuerlig ekspertberedskap i privatlivet.'
  })),
  delayed_consequences: [
    ['premature_closure', '1/morning', '13/morning'],
    ['patient_goal', '2/morning', '10/morning'],
    ['guidance_as_decision', '3/afternoon', '11/morning'],
    ['method_adaptation', '4/afternoon', '10/afternoon'],
    ['specialty_dissent', '5/morning', '13/afternoon'],
    ['waiting_risk', '6/morning', '7/afternoon'],
    ['handoff_scope', '8/morning', '11/afternoon'],
    ['pilot_status', '9/morning', '14/afternoon']
  ].map(([id, setup_ref, return_ref]) => ({
    id,
    setup_ref,
    return_ref,
    meaning: `${id} lar et tidlig dokumentert premiss vende tilbake som en senere, etterprøvbar følge for forløp, ansvar og situert standing.`
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

console.log('Materialized Spesialistpsykolog Role World: 56 beats, 15 refs, 7 audiences');
