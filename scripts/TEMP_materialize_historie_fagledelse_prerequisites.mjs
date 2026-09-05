import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const must = (condition, message) => { if (!condition) throw new Error(`PRECHECK: ${message}`); };

const ROLE = 'historie_fagledelse';
const MODEL = 'data/Civication/roleModels/historie/historie_fagledelse.json';
const GRAMMAR = 'data/Civication/workGrammars/historie/historie_fagledelse.json';
const PLAN = 'data/Civication/mailPlans/historie/historie_fagledelse_plan.json';
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const EXPECTED_LOOPS = [
  'behov -> kapasitet -> prioritering -> fordeling -> oppfolging -> kvalitet -> justering',
  'avvik -> risiko -> ansvar -> tiltak -> dokumentasjon -> læring'
];
const EXPECTED_MAY = ['lede og prioritere innen delegert ramme'];
const EXPECTED_MAY_NOT = ['overstyre lov eller delegasjon', 'diktere faglige funn', 'skjule kapasitetsrisiko', 'late som lederrolle gir manglende fagkompetanse'];

must(fs.existsSync(path.join(root, MODEL)), `${MODEL} missing`);
must(fs.existsSync(path.join(root, GRAMMAR)), `${GRAMMAR} missing`);
must(!fs.existsSync(path.join(root, PLAN)), `${PLAN} already exists`);
for (const type of TYPES) {
  must(!fs.existsSync(path.join(root, `data/Civication/mailFamilies/historie/${type}/${ROLE}_${type}.json`)), `${type} catalog already exists`);
}

const grammar = read(GRAMMAR);
must(grammar.schema === 'civication_work_grammar_v2' && grammar.category === 'historie' && grammar.role_scope === ROLE && grammar.role_id === ROLE, 'wrong grammar identity');
must(JSON.stringify(grammar.work_loops) === JSON.stringify(EXPECTED_LOOPS), 'existing work loops drifted');
must(JSON.stringify(grammar.authority_boundary?.may) === JSON.stringify(EXPECTED_MAY), 'authority may drifted');
must(JSON.stringify(grammar.authority_boundary?.may_not) === JSON.stringify(EXPECTED_MAY_NOT), 'authority may_not drifted');
must(grammar.practice_stories?.length === 5 && grammar.task_families?.length === 6 && grammar.quality_axes?.length === 6, 'grammar editorial contract changed');
must(!grammar.actor_grammar && !grammar.place_grammar && !grammar.persistent_work_object_contract, 'grammar already deepened');

const actors = [
  {
    id: 'ingrid_avdelingsdirektor_historie_fagledelse',
    name: 'Ingrid',
    role: 'avdelingsdirektør',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Ingrid holder den formelle linjen over seksjonen og gjør delegasjon, mål, ressursramme og eskaleringspunkt eksplisitt. Hun etterspør et beslutningsklart bilde av kapasitet og risiko, men skal ikke bruke overordnet posisjon til å bestille en bestemt historisk konklusjon eller gjøre uformelt press til faglig metode.',
    authority_relation: 'Ingrid kan avklare mandat, prioriteringsramme og hvilke ressurs- eller personalsaker som må løftes til riktig nivå. Hun kan ikke instruere spilleren til å skjule kapasitetsrisiko, omskrive dokumentert faglig uenighet eller behandle styringsønsker som evidens; spilleren kan heller ikke låne hennes myndighet til egne faglige snarveier.',
    workplace_ids: ['prioriterings_og_kapasitetsbord']
  },
  {
    id: 'marius_seniorhistoriker_historie_fagledelse',
    name: 'Marius',
    role: 'seniorhistoriker',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Marius bærer en selvstendig historiefaglig motstemme og prøver problemstilling, kildegrunnlag, begreper og tolkning mot eksplisitte metodekrav. Han gjør faglig uenighet produktiv ved å skille mellom hva kildene støtter, hva som er rimelig tolkning og hva ledelsen eventuelt bare ønsker skal være sant.',
    authority_relation: 'Marius kan kreve at metode- og evidensinnvendinger blir synlige i leveransen og kan be om ny vurdering når kildegrunnlaget er for svakt. Han har ikke personal- eller budsjettmyndighet, og spilleren kan ikke bruke lederrollen til å slette hans begrunnede motstemme, gi den automatisk veto eller diktere resultatet uten evidens.',
    workplace_ids: ['faglig_metoderom']
  },
  {
    id: 'nora_teamkoordinator_historie_fagledelse',
    name: 'Nora',
    role: 'teamkoordinator',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Nora holder den daglige kapasitets- og leveranseflyten sammen: hvem som eier en oppgave, hvilke avhengigheter som venter, hva som må overleveres og hvor en forsinkelse faktisk oppstår. Hun gjør usynlig koordineringsarbeid målbart uten å gjøre bemanningsoversikten til en erstatning for faglig skjønn.',
    authority_relation: 'Nora kan synliggjøre belastning, foreslå rekkefølge og stoppe en handoff som mangler eier, status eller nødvendig grunnlag. Hun kan ikke beslutte faglige funn eller permanent omfordele personalressurser uten mandat; spilleren kan ikke legge skjult overarbeid på henne eller bruke koordinering til å maskere at kapasiteten er utilstrekkelig.',
    workplace_ids: ['handoff_og_leveranseflate']
  },
  {
    id: 'sander_kvalitetsradgiver_historie_fagledelse',
    name: 'Sander',
    role: 'kvalitetsrådgiver',
    fictional: true,
    fictional_scenario_actor: true,
    canonical_person_ref: null,
    function: 'Sander følger avvik, sporbarhet, kontrollpunkter og korrigerende tiltak når en historiefaglig leveranse nærmer seg publisering eller formell bruk. Han undersøker om feil og usikkerhet er dokumentert slik at teamet kan lære av dem, i stedet for at kvalitet reduseres til et sent sjekkstempel.',
    authority_relation: 'Sander kan kreve dokumentert avvik, tydelig korrigeringsansvar og et nytt kontrollpunkt før en alvorlig feil lukkes. Han kan ikke overta den historiefaglige konklusjonen eller bruke kvalitetsprosessen som generell stoppmyndighet uten grunn; spilleren kan ikke skjule en kritisk feil for å beskytte frist, omdømme eller lederstatus.',
    workplace_ids: ['kvalitets_og_avvikspunkt']
  }
];

const places = [
  {
    id: 'prioriterings_og_kapasitetsbord',
    name: 'Prioriterings- og kapasitetsbordet',
    function: 'Her registreres innkommende oppdrag, frister, delegert mandat, tilgjengelig kompetanse og synlig kapasitetsrisiko før arbeid fordeles eller noe utsettes.'
  },
  {
    id: 'faglig_metoderom',
    name: 'Det faglige metoderommet',
    function: 'Her prøves problemstilling, kilder, kildekritikk, historiografiske valg, begreper og faglig uenighet før en konklusjon får status som beslutnings- eller publiseringsgrunnlag.'
  },
  {
    id: 'kvalitets_og_avvikspunkt',
    name: 'Kvalitets- og avvikspunktet',
    function: 'Her blir kritiske feil, usikkerhet, kontrollfunn og korrigerende tiltak stående med eier og nytt kontrollpunkt i stedet for å forsvinne når fristen nærmer seg.'
  },
  {
    id: 'handoff_og_leveranseflate',
    name: 'Handoff- og leveranseflaten',
    function: 'Her overleveres arbeid med versjon, status, åpne spørsmål, ventepunkt, ansvarlig mottaker og konsekvens for andre leveranser slik at koordineringsgjeld ikke skjules.'
  }
];

Object.assign(grammar, {
  actor_grammar: actors.map(({ id, name, role, workplace_ids }) => ({ id, name, role, workplace_ids })),
  place_grammar: places,
  persistent_work_object_contract: {
    id: 'faglig_prioriterings_og_kvalitetslogg',
    description: 'Et vedvarende, versjonert arbeidsobjekt som beholder oppdrag, prioritet, kapasitet, delegasjon, metode- og evidenskrav, faglige motstemmer, avvik, risiko, ventepunkt, handoff-eier og rework gjennom den samme leveransesyklusen.',
    states: ['registrert', 'kapasitetsvurdert', 'fordelt', 'under_faglig_arbeid', 'venter_pa_avklaring', 'under_kvalitetskontroll', 'leveringsklart', 'levert', 'gjenapnet'],
    handoff_rule: 'Neste aktør overtar synlig versjon, status, beslutningsrom, ventepunkt, åpne faglige spørsmål og uløst risiko; en handoff kan aldri slette tidligere metodevalg, avvik eller dokumentert faglig uenighet.'
  },
  rhythm_contract: {
    loop: 'inntak -> kapasitet -> prioritering -> fordeling -> faglig arbeid -> waiting/venting på evidens, mandat eller kompetanse -> handoff -> kvalitetskontroll -> levering -> rework -> læring',
    waiting_states: ['kilde_eller_evidensavklaring', 'mandatavklaring', 'kompetansebehov', 'ressursbeslutning'],
    rework_rule: 'Nye kilder, korrigert feil, endret mandat eller dokumentert kapasitetsbrudd gjenåpner bare berørt del med ny versjon og eksplisitt eier.'
  },
  knowledge_dependencies: [
    {
      id: 'history_go_historie_kildekritikk_og_historiografi',
      badge_id: 'historie',
      use: 'Gir historisk kontekst, kildekritisk trening og historiografisk bevissthet som kan forbedre spørsmål og kontroll, men gir verken ansettelse, personalmyndighet, budsjettfullmakt eller rett til å diktere et faglig funn.'
    }
  ],
  day_one_contract: {
    entry: 'appointment_required',
    first_object: 'faglig_prioriterings_og_kvalitetslogg',
    first_task: 'Registrer de aktive leveransene med mandat, kapasitet, kompetansebehov, faglig risiko, eier og eksplisitt hva som ikke kan gjøres innen dagens ramme.'
  },
  mail_generation_contract: {
    required_mail_types: TYPES,
    role_scope: ROLE,
    no_generic_fallback: true
  }
});
write(GRAMMAR, grammar);

const model = read(MODEL);
must(model.schema === 'civication_role_model_v2' && model.category === 'historie' && model.role_scope === ROLE && model.role_id === ROLE, 'wrong role-model identity');
Object.assign(model, {
  core_narrative: [
    model.core_narrative[0],
    'Rollen bygger én etterprøvbar prioriterings- og kvalitetslogg der kapasitet, delegasjon, kilde- og metodekrav, faglig uenighet, avvik, handoff og korrigering kan følges uten at lederposisjon blir erstatning for historiefaglig evidens.'
  ],
  work_life: {
    daily_work: [
      'Registrerer leveranser, kapasitet, kompetansebehov og synlig risiko før prioritering.',
      'Fordeler arbeid med eksplisitt mandat og beskytter faglig motstemme mot lederpress.',
      'Følger kvalitet, avvik, ventepunkter og handoffs gjennom den samme versjonerte loggen.',
      'Gjenåpner arbeid når nye kilder, feil eller endrede rammer faktisk endrer premissene.'
    ],
    responsibilities: [
      'historiefaglig kvalitet og sporbar metode',
      'realistisk kapasitet og ressursprioritering',
      'delegasjon, arbeidsmiljø og tydelig ansvar',
      'avvik, korrigering og korrekt eskalering'
    ],
    work_environment: [
      'Arbeidet veksler mellom prioriteringsbord, faglig metodearbeid, kvalitetskontroll og tverrgående handoffs i arkiv, museum, direktorat eller forskningsinstitusjon.'
    ],
    status_position: [
      'Profesjonell tillit kommer av at vanskelige prioriteringer og faglige uenigheter blir håndtert synlig; lederstatus gir ikke ekstra evidens eller ubegrenset myndighet.'
    ],
    workplaces: places.map((p) => p.id)
  },
  career_path: {
    entry_from: [
      'Relevant historiefaglig eller institusjonell praksis kombinert med formell arbeidsgiverutnevnelse; Historie-badge alene gir ikke lederrollen.'
    ],
    progression_to: [
      'Større seksjons-, avdelings- eller institusjonsansvar når formell delegasjon, personal- og ressursmandat følger med.'
    ],
    possible_promotions: [
      'Avdelingsleder med bredere personal-, kapasitets- og kvalitetsansvar.',
      'Avdelingsdirektør eller annen institusjonsledelse når arbeidsgiver formelt utnevner og delegasjonen utvides.'
    ],
    possible_exits: [
      'Tilbake til senior historiefaglig spesialist-, forsker-, arkiv- eller kuratorpraksis.',
      'Overgang til rådgivning, prosjektledelse, kvalitet eller metodearbeid uten linjeansvar.'
    ],
    career_risks: [
      'Kort frist eller press ovenfra kan friste lederen til å skjule kapasitetsrisiko eller gjøre ønsket konklusjon til premiss.',
      'Utydelige handoffs kan skyve usynlig arbeid, feil og ansvar nedover i teamet.'
    ]
  },
  required_knowledge: {
    education_basis: [
      'Relevant historiefaglig forståelse, kildekritikk, institusjonskunnskap og dokumentert ledelses- eller koordineringspraksis.'
    ],
    skills: ['fagledelse', 'prioritering', 'kildekritikk', 'delegasjon', 'kapasitetsstyring', 'kvalitetsoppfolging'],
    category_knowledge: [
      'Historisk metode, kildekritikk, historiografi, institusjonelt mandat og skillet mellom å styre oppdraget og å styre hva evidensen skal vise.'
    ],
    history_go_badges: ['historie'],
    place_connections: places.map((p) => p.id),
    people_connections: actors.map((a) => a.id)
  },
  authority_boundary: {
    may: grammar.authority_boundary.may,
    may_not: grammar.authority_boundary.may_not
  },
  challenges: [
    {
      id: 'kapasitet_kvalitet_og_faglig_uavhengighet',
      title: 'Kapasitet, kvalitet og faglig uavhengighet',
      description: 'Lederen må gjøre reelle prioriteringer og stå for kvalitet uten å skjule ressursmangel eller gjøre formell autoritet til historiefaglig bevis.',
      pressure: 'frist_og_styringspress_vs_sporbar_faglighet',
      affects: ['quality', 'trust', 'risk']
    }
  ],
  dilemmas: [
    {
      id: 'kritisk_leveranse_svak_kapasitet',
      title: 'Kritisk leveranse, svak kapasitet',
      setup: 'To viktige leveranser kolliderer, en sentral metodeinnvending står åpen og overordnet ønsker rask konklusjon.',
      choice_axis: 'synlig_prioritering_vs_skjult_overbelastning',
      consequence_axis: 'langsiktig_faglig_tillit_vs_kortsiktig_fristgevinst',
      mail_hooks: TYPES
    }
  ],
  related_people: actors,
  related_places: places,
  mail_integration: {
    role_scope: ROLE,
    mail_profile: ROLE,
    can_feed_mail_types: TYPES,
    recommended_mail_families: TYPES.map((type) => `historie_fagledelse_${type}`),
    role_model_refs_supported: true
  }
});
write(MODEL, model);

const manifestPath = 'data/Civication/roleModels/manifest.json';
const manifest = read(manifestPath);
must(Array.isArray(manifest.files), 'role-model manifest missing files array');
must(!manifest.files.includes(MODEL), 'model unexpectedly present in manifest');
manifest.files.push(MODEL);
manifest.files.sort((a, b) => a.localeCompare(b));
write(manifestPath, manifest);

const familyIds = {
  job: 'historie_fagledelse_prioritering_job',
  people: 'historie_fagledelse_profesjonelle_relasjoner',
  conflict: 'historie_fagledelse_konklusjonspress',
  story: 'historie_fagledelse_lederidentitet',
  event: 'historie_fagledelse_ny_kilde_eller_feil',
  micro: 'historie_fagledelse_rask_mandatavklaring',
  followup: 'historie_fagledelse_handoff_og_rework',
  knowledge: 'historie_fagledelse_history_go_kildekritikk',
  consequence: 'historie_fagledelse_leveranse_etterspill'
};

const specs = {
  job: [
    ['kapasitetsklemme', 'Ingrid', actors[0].id, places[0].id, 'Tre kritiske leveranser deler de samme to spesialistene'],
    ['metodeuenighet', 'Marius', actors[1].id, places[1].id, 'En leveranse er rask, men metodeinnvendingen står fortsatt åpen'],
    ['sen_feil', 'Sander', actors[3].id, places[2].id, 'En alvorlig kildehenvisningsfeil oppdages rett før publisering'],
    ['handoff', 'Nora', actors[2].id, places[3].id, 'Neste team mottar filen uten synlig ventepunkt og eier']
  ],
  people: [
    ['ingrid_mandat', 'Ingrid', actors[0].id, places[0].id, 'Hva kan du faktisk prioritere innen delegasjonen?'],
    ['marius_motstemme', 'Marius', actors[1].id, places[1].id, 'Den faglige motstemmen må stå igjen etter ledermøtet'],
    ['nora_kapasitet', 'Nora', actors[2].id, places[3].id, 'Usynlig overarbeid blir brukt som kapasitetsreserve'],
    ['sander_avvik', 'Sander', actors[3].id, places[2].id, 'Avviket er rettet i teksten, men ikke i læringssporet']
  ],
  conflict: [
    ['bestilt_konklusjon', 'Ingrid', actors[0].id, places[1].id, 'Overordnet ønsker en tydeligere historisk konklusjon enn kildene bærer']
  ],
  story: [
    ['leder_vs_fagperson', 'Marius', actors[1].id, places[1].id, 'Er du faglig sterk fordi du leder, eller leder du ved å beskytte faglig styrke?']
  ],
  event: [
    ['ny_kilde', 'Sander', actors[3].id, places[2].id, 'En ny kilde endrer premisset etter at leveransen ble kalt ferdig']
  ],
  micro: [
    ['kan_vi_love_fristen', 'Nora', actors[2].id, places[0].id, 'Kan du love fristen uten å ha kompetansen tilgjengelig?']
  ],
  followup: [
    ['rework_etter_handoff', 'Nora', actors[2].id, places[3].id, 'Handoff må gjenåpnes etter at mottaker fant et ubesvart metodepunkt']
  ],
  knowledge: [
    ['kildekritikk_og_historiografi', 'Marius', actors[1].id, places[1].id, 'History Go-kunnskap skjerper spørsmålet, men avgjør ikke konklusjonen']
  ],
  consequence: [
    ['etterspill', 'Sander', actors[3].id, places[2].id, 'En rask leveranse skapte ny korrigering, ekstraarbeid og svekket tillit']
  ]
};

const makeScene = (type, [slug, from, peopleRef, placeId, subject], index) => {
  const summary = `Den faglige prioriterings- og kvalitetsloggen står i et konkret ${type}-punkt: ${subject.toLowerCase()}. Kapasitet, delegert mandat, kilde- og metodekrav, dokumentert faglig uenighet, avvik, frist og neste eier peker ikke samme vei. Du må oppdatere det vedvarende arbeidsobjektet slik at beslutningsrom, venting og risiko er synlige, uten å gjøre lederstatus til faglig evidens eller skyve skjult arbeid videre til neste aktør.`;
  return {
    id: `historie_fagledelse_${type}_${slug}_${String(index + 1).padStart(3, '0')}`,
    mail_type: type,
    mail_family: familyIds[type],
    role_scope: ROLE,
    phase: index < 1 ? 'forenoon' : 'workday',
    priority: 130 - index,
    from,
    people_ref: peopleRef,
    place_id: placeId,
    subject,
    summary,
    situation: [
      'Loggen viser oppdragets nåværende versjon, prioritet, eier, metode- eller kvalitetskrav og hva som fortsatt ikke er avklart.',
      'En rask lukking kan gi lokal fremdrift, men vil skjule kapasitet, faglig motstemme, avvik eller hvem som faktisk har myndighet til neste beslutning.',
      'Du må velge et grep som gjør waiting, handoff og mulig rework synlig for den neste som skal stole på leveransen.'
    ],
    task_domain: 'historiefaglig_ledelse',
    competency: 'sporbar_prioritering_og_faglig_integritet',
    pressure: 'frist_og_styringspress_vs_kvalitet_og_kapasitet',
    choice_axis: 'synlig_avklaring_vs_uformell_lukking',
    consequence_axis: 'faglig_og_organisatorisk_tillit_vs_skjult_risiko',
    narrative_arc: slug,
    choices: [
      {
        id: 'A',
        label: `Avklar ${slug} i loggen`,
        reply: 'Jeg beholder den faglige motstemmen og dagens status i loggen, markerer kapasitets- eller evidensgapet og sender bare den avgrensede beslutningen til riktig eier med et eksplisitt nytt kontrollpunkt.',
        effect: 1,
        tags: ['sporbarhet', 'mandat', 'kapasitet', 'faglig_integritet'],
        feedback: 'Arbeidet kan se langsommere ut i øyeblikket, men neste aktør ser hva som er vurdert, hva som fortsatt venter, hvilken kompetanse eller myndighet som mangler og hva som må gjenåpnes dersom premissene endrer seg. Det beskytter både medarbeidere og historiefaglig kvalitet mot at lederpress blir skjult i leveransen.',
        effects: { stats: { quality: 2, trust: 2, risk: -2, energy: -1 } }
      },
      {
        id: 'B',
        label: `Lukk ${slug} gjennom lederbeslutning`,
        reply: 'Jeg behandler fremdriftsbehovet som tilstrekkelig grunn til å lukke ventepunktet, fordeler restarbeidet uformelt og lar leveransen gå videre uten å vise hele kapasitets- og metodeusikkerheten.',
        effect: -1,
        tags: ['uformell_myndighet', 'skjult_kapasitet', 'risiko'],
        feedback: 'Fristen ser bedre ut lokalt, men loggen mister skillet mellom prioritering, evidens og faktisk myndighet. Teamet må absorbere skjult arbeid, mottakeren kan tro at metode- og kvalitetsinnvendinger er lukket, og en senere feil blir dyrere å spore tilbake. Lederstatus har da erstattet nettopp den åpenheten rollen skulle beskytte.',
        effects: { stats: { status: 1, quality: -2, trust: -2, risk: 3 } }
      }
    ]
  };
};

for (const type of TYPES) {
  write(`data/Civication/mailFamilies/historie/${type}/${ROLE}_${type}.json`, {
    schema: 'civication_mail_family_catalog_v1',
    version: 1,
    category: 'historie',
    role_scope: ROLE,
    mail_type: type,
    families: [
      {
        id: familyIds[type],
        purpose: `Trene ${type} gjennom den vedvarende faglige prioriterings- og kvalitetsloggen.`,
        learning_focus: ['faglig_integritet', 'kapasitet', 'delegasjon', 'sporbarhet'],
        mails: specs[type].map((spec, index) => makeScene(type, spec, index))
      }
    ]
  });
}

const sequenceTypes = ['job', 'people', 'knowledge', 'job', 'people', 'conflict', 'job', 'people', 'event', 'micro', 'job', 'people', 'followup', 'story', 'consequence', 'job'];
write(PLAN, {
  schema: 'civication_mail_plan_v1',
  version: 1,
  id: 'historie_fagledelse_foundation_v1',
  category: 'historie',
  role_scope: ROLE,
  title: 'Historiefaglig ledelse',
  description: 'Seksten steg fra første kapasitets- og mandatkartlegging til sporbar levering, korrigering og læring i den samme faglige loggen.',
  arc: {
    from: 'Formelt utnevnt faglig leder som arver flere leveranser, skjult kapasitetsgjeld og åpne metodepunkter.',
    to: 'Leder som kan prioritere, delegere, beskytte historiefaglig uavhengighet og føre feil, handoffs og rework uten å skjule kostnaden.',
    core_questions: [
      'Hva er delegert prioritering, og hva må eskaleres?',
      'Hvilke faglige premisser og motstemmer må bli stående i loggen?',
      'Når må ny evidens, feil eller kapasitetsbrudd gjenåpne arbeidet?'
    ]
  },
  outcome_rules: {
    promoted: { completion_ratio_gte: 1, score_gte: 2, strikes_lte: 0 },
    fired: { stability_values: ['FIRED'], strikes_gte: 3, score_lte: -3 },
    stagnated: {
      autonomy_delta: -10,
      stability: 'STAGNATED',
      add_branch_flags: ['career_stagnated', 'historie_fagledelse_mandat_og_kvalitetssvikt']
    }
  },
  sequence: sequenceTypes.map((type, index) => ({
    step: index + 1,
    type,
    phase: index < 3 ? 'intro' : index < 10 ? 'advanced' : 'mastery',
    step_goal: `Føre den faglige loggen gjennom ${type} med synlig mandat, kapasitet, faglig status, ventepunkt og neste eier.`,
    allowed_families: [familyIds[type]],
    fallback_types: []
  }))
});

console.log('PASS: materialized Historie/Fagledelse prerequisite foundation without Role World completion.');
