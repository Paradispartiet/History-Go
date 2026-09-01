import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const C = 'psykologi';
const R = 'spesialistpsykolog';
const M = `data/Civication/roleModels/${C}/${R}.json`;
const G = `data/Civication/workGrammars/${C}/${R}.json`;
const P = `data/Civication/mailPlans/${C}/${R}_plan.json`;
const T = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const read = (file) => JSON.parse(fs.readFileSync(file));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const locks = {
  [M]: 'd5334897bb01f6d4b2f5f084131163e3114f40c11198d3c994e010d083f4fb00',
  [G]: 'db5377c773b2375e6226efcb0f6c207aeed1af4428c04189cec924d525c0c41e',
  'data/Civication/roleModels/manifest.json': '9dee59410b2a89811dd725dd9d9d71dd8f8da9c2dfbc13188254d25d93eb65da',
  'data/Civication/psychologyClinicalCareerEvidence.json': '1e356ba0162dd46bab81d8d6c6fc37818eebdadf3f96ca378ad5ddf54d49f2f5',
  'data/badges/psykologi.json': 'f52b6bab50b6c338d3d00c44328c38f56640ffb3a45f3252adc8afb1237d4fbc',
  'data/Civication/lifestory/roles/spesialistpsykolog/role.json': '33de02dc12a173ede8150965114577068da285b0eaa95a454c841f052ff2b9c3',
  'data/Civication/lifestory/roles/spesialistpsykolog/scenes.json': 'fe5bc78e888c4ca2e9c553c6d2721e65738e53a35a129ea830da6e961cca93a4',
  'data/Civication/lifestory/roles/spesialistpsykolog/threads.json': '243e68485259ab86480ea253cb23def1b2e7df995632f43f27c55b2ca2738809'
};
for (const [file, expected] of Object.entries(locks)) assert(hash(file) === expected, `drift ${file}`);
assert(!fs.existsSync(P), 'plan exists');
for (const type of T) assert(!fs.existsSync(`data/Civication/mailFamilies/${C}/${type}/${R}_${type}.json`), `${type} exists`);

const places = [
  ['spesialistpoliklinikkens_forlopsrom', 'Spesialistpoliklinikkens forløpsrom', 'Samler pasientmål, konkurrerende hypoteser, samtykke, risiko, tiltak, evaluering og neste beslutningspunkt i ett versjonert forløp uten å gjøre spesialiststatus til fasit.'],
  ['veiledningsrommet_for_klinisk_begrunnelse', 'Veiledningsrommet for klinisk begrunnelse', 'Gjør kollegaens egen vurdering, usikkerhet, risiko og ansvar synlig før spesialistråd gis, slik at veiledning ikke blir skjult overtakelse.'],
  ['tverrspesialistisk_hypotesemote', 'Det tverrspesialistiske hypotesemøtet', 'Prøver ulike spesialiteters forklaringer mot samme evidens og navngir hvem som eier videre undersøkelse, handoff og klinisk beslutning.'],
  ['metode_og_kvalitetsverkstedet', 'Metode- og kvalitetsverkstedet', 'Tester begrunnede tilpasninger og standardisering mot pasientutfall, implementeringsvilkår og dokumentert rework før praksis spres.']
].map(([id, name, fn]) => ({ id, name, function: fn }));

const actorRows = [
  ['sander_pasient_komplekst_forlop', 'Sander', 'pasient i et komplekst, fiktivt forløp', 0, 'Sander holder sitt eget mål, sin hverdagskontekst og erfaringen av hva tiltakene faktisk gjør. Han gjør det mulig å prøve om en spesialistformulering hjelper personen den gjelder, eller bare skaper en ryddig fortelling for fagmiljøet.', 'Sander eier medvirkning, samtykke og retten til å få usikkerhet forklart. Han kan ikke pålegges en metode fordi den passer spesialistens fordypning, og informasjon om ham kan bare deles når behandlingsgrunnlag, nødvendighet og rolle er avklart.'],
  ['ida_psykolog_i_veiledning', 'Ida', 'psykolog i veiledning', 1, 'Ida har gjort den løpende kliniske vurderingen og trenger hjelp til å teste begrunnelse, risiko og endringskriterier. Hun viser om spesialistens råd bygger hennes dømmekraft eller gjør henne avhengig av en autoritativ fasit.', 'Ida beholder klinisk ansvar innen egen rolle og må selv kunne dokumentere beslutningen. Spesialisten kan gi råd og kreve forsvarlig eskalering, men kan ikke stille seg som skjult beslutningstaker eller overføre ansvar uten eksplisitt handoff.'],
  ['ravi_spesialist_annen_fordypning', 'Ravi', 'spesialistpsykolog med en annen fordypning', 2, 'Ravi ser et mønster fra en annen spesialitet og utfordrer hvilke data som mangler før planen låses. Han gjør faggrensen konkret og hindrer at én spesialistkompetanse framstilles som generell ekspertise på alle kliniske områder.', 'Ravi kan bidra med en avgrenset vurdering og navngi behov for videre kompetanse. Han overtar ikke hele forløpet ved å være uenig, og spilleren kan verken avvise eller delegere til ham uten å klargjøre spørsmål, ansvar og informasjonsgrunnlag.'],
  ['nora_teamleder_spesialisttjeneste', 'Nora', 'teamleder for den fiktive spesialisttjenesten', 3, 'Nora eier arbeidsflyt, frister og forbedringsrom og vil redusere ubegrunnet variasjon. Hun synliggjør når produksjonspress eller ønsket om lik praksis forsøker å gjøre en foreløpig spesialistvurdering til bindende standard.', 'Nora kan prioritere tid, be om dokumentert kvalitetsarbeid og plassere organisatorisk ansvar. Hun kan ikke gi spesialistgodkjenning, overstyre samtykke eller gjøre ledelsesmandat til diagnostisk, behandlingsmessig eller lovregulert myndighet.']
];
const people = actorRows.map(([id, name, role, placeIndex, fn, authority_relation]) => ({
  id,
  name,
  role,
  fictional: true,
  fictional_scenario_actor: true,
  canonical_person_ref: null,
  function: fn,
  authority_relation,
  workplace_ids: [places[placeIndex].id]
}));

const grammar = read(G);
grammar.work_loops = [
  'pasientmal -> konkurrerende hypoteser -> avgrenset vurdering -> samtykke og tiltak -> waiting pa ny informasjon -> evaluering -> rework -> lukking eller eskalering',
  'kollegasporsmal -> begrunnelse og risiko -> spesialistrad -> navngitt handoff -> kollegaens beslutning -> oppfolging -> ny veiledning eller annen spesialitet'
];
Object.assign(grammar, {
  actor_grammar: people.map(({ id, name, role, workplace_ids }) => ({ id, name, role, workplace_ids })),
  place_grammar: places,
  persistent_work_object_contract: {
    id: 'spesialistforlopets_hypotese_tiltak_og_veiledningslogg',
    description: 'Versjonert, dataminimert arbeidsobjekt for pasientmål, hypoteser, evidens, usikkerhet, samtykke, risiko, tiltak, spesialistråd, ansvar, handoff, evalueringsdato og rework i Sanders fiktive forløp.',
    states: ['mal_og_samtykke_avklart', 'hypoteser_under_proving', 'venter_pa_nodvendig_informasjon', 'tiltak_avgrenset', 'handoff_til_navngitt_eier', 'effekt_under_evaluering', 'revidert_lukket_eller_eskalert'],
    handoff_rule: 'Handoff navngir objektversjon, pasientmål, kjent og ukjent evidens, risiko, spesialitet, råd, beslutningseier, frist og hva som gjenåpner vurderingen; veiledning flytter aldri ansvar implisitt.'
  },
  rhythm_contract: {
    loop: 'hypotese -> waiting/venting på samtykke, observasjon eller annen spesialitet -> avgrenset tiltak -> handoff -> evaluering -> rework eller eskalering',
    waiting_states: ['pasientens_prioritet_eller_samtykke', 'beslutningskritisk_observasjon', 'annen_spesialistkompetanse', 'effekt_etter_avgrenset_tiltak'],
    rework_rule: 'Ny risiko, pasientens erfaring, motstridende evidens eller uteblitt effekt gjenåpner den berørte hypotesen og tiltaket uten å slette tidligere begrunnelse eller ansvar.'
  },
  knowledge_dependencies: [{
    id: 'history_go_psykologi_ekspertise_institusjon_og_kildegrense',
    badge_id: 'psykologi',
    place_id: 'psykologisk_institutt_uio',
    person_id: 'harald_schjelderup',
    use: 'Kildeforankret profesjonshistorie om institusjon, ekspertrolle og faglig autoritet skjerper spørsmålet om hvordan spesialiststatus former hypoteser, men gir ingen klinisk anbefaling, spesialistgodkjenning eller lovregulert myndighet.'
  }],
  day_one_contract: {
    entry: 'authorization_and_specialist_approval_required',
    first_object: 'spesialistforlopets_hypotese_tiltak_og_veiledningslogg',
    first_task: 'Registrer Sanders mål, samtykke, konkurrerende hypoteser, evidens, usikkerhet, risiko, spesialitetsgrense og neste beslutningspunkt før et råd eller tiltak låses.'
  },
  mail_generation_contract: { required_mail_types: T, role_scope: R, no_generic_fallback: true }
});
write(G, grammar);

const model = read(M);
model.work_life = {
  daily_work: [
    'Holder Sanders mål, konkurrerende hypoteser, evidens, usikkerhet, samtykke, risiko og tiltak samlet i én versjonert forløpslogg.',
    'Prøver spesialistmetode mot pasientens situasjon og dokumenterer både begrunnet tilpasning og kriteriet for ny vurdering.',
    'Veileder Ida gjennom hennes begrunnelse og risiko uten å overta den kliniske beslutningen implisitt.',
    'Henter Ravis andre spesialistperspektiv når spørsmålet går utenfor egen fordypning, med tydelig handoff og ansvar.',
    'Følger venting, effekt og rework fram til hypotesen kan revideres, lukkes eller eskaleres.'
  ],
  responsibilities: [
    'presis usikkerhet innen faktisk spesialitet',
    'pasientmål, samtykke og dataminimering',
    'veiledning uten skjult ansvarsovertakelse',
    'navngitt handoff til annen kompetanse',
    'etterprøvbar evaluering og rework'
  ],
  work_environment: ['Arbeidet veksler mellom forløpsrom, veiledningsrom, tverrspesialistisk hypotesemøte og metodeverksted; alle fire er fiktive arbeidsflater.'],
  status_position: ['Tillit følger evnen til å gjøre ekspertisen prøvbar, faggrensen synlig og pasientens mål operativt; spesialiststatus gir verken allmenn klinisk kompetanse eller automatisk lovmyndighet.'],
  workplaces: places.map(({ id }) => id)
};
model.related_people = people;
model.related_places = places;
model.required_knowledge = {
  ...model.required_knowledge,
  place_connections: places.map(({ id }) => id),
  people_connections: people.map(({ id }) => id)
};
model.mail_integration = {
  role_scope: R,
  mail_profile: `${C}_${R}`,
  can_feed_mail_types: T,
  recommended_mail_families: T.map((type) => `${R}_${type}`),
  role_model_refs_supported: true
};
write(M, model);
assert(read('data/Civication/roleModels/manifest.json').files.filter((file) => file === M).length === 1, 'manifest ownership');

const familyIds = Object.fromEntries(T.map((type) => [type, `${R}_${type}_forlopslogg`]));
const scenes = {
  job: [
    ['hypotesestart', 'Nora', 3, 0, 'Teamet ber om ett endelig svar før konkurrerende hypoteser er prøvd'],
    ['begrunnet_tilpasning', 'Sander', 0, 0, 'Standardmetoden treffer deler av problemet, men ikke Sanders prioritet og rammer'],
    ['veiledning_uten_overtakelse', 'Ida', 1, 1, 'Ida ber spesialisten velge neste kliniske steg for henne'],
    ['metodepilot', 'Nora', 3, 3, 'En ny arbeidsmåte skal standardiseres før pilotens forskjeller er evaluert']
  ],
  people: [
    ['sanders_prioritet', 'Sander', 0, 0, 'Sander beskriver et mål som ikke er operativt i den foreløpige planen'],
    ['idas_begrunnelse', 'Ida', 1, 1, 'Ida trenger et vurderingspunkt hun selv kan begrunne og følge opp'],
    ['ravis_motforklaring', 'Ravi', 2, 2, 'Ravi viser evidens fra en annen fordypning som kan endre hypotesen'],
    ['noras_tidsfrist', 'Nora', 3, 3, 'Nora trenger framdrift uten å gjøre en foreløpig anbefaling til klinisk regel']
  ],
  conflict: [['spesialitetsgrense', 'Ravi', 2, 2, 'To spesialistperspektiver peker ulikt og ansvaret for neste undersøkelse er uklart']],
  story: [['ekspertstatus_som_fasit', 'Ida', 1, 1, 'En tidligere veiledning ble gjengitt som om spesialisten hadde overtatt beslutningen']],
  event: [['endret_risiko', 'Sander', 0, 0, 'Ny informasjon endrer risikobildet mens vurderingen venter på annen kompetanse']],
  micro: [['beslutningskritisk_minutt', 'Ravi', 2, 2, 'Et kort tidsvindu kan brukes til å verifisere hva Ravi faktisk trenger for sin avgrensede vurdering']],
  followup: [['tiltak_som_ma_revideres', 'Sander', 0, 3, 'Den begrunnede tilpasningen ga bare delvis effekt og må åpnes for rework']],
  knowledge: [['profesjonshistorisk_kildegrense', 'Ravi', 2, 2, 'Historien om faglig autoritet kan skjerpe spørsmålet, men ikke avgjøre Sanders behandling']],
  consequence: [['taus_motstemme', 'Nora', 3, 3, 'Senere praksis viser om ekspertstatus gjorde det vanskeligere å melde uenighet']]
};

function makeScene(type, [slug, from, personIndex, placeIndex, subject], index) {
  return {
    id: `${R}_${type}_${slug}_${String(index + 1).padStart(3, '0')}`,
    mail_type: type,
    mail_family: familyIds[type],
    role_scope: R,
    phase: index ? 'workday' : 'forenoon',
    day_phase: index ? 'afternoon' : 'morning',
    priority: 145 - index,
    from,
    people_ref: people[personIndex].id,
    person_id: people[personIndex].id,
    place_id: places[placeIndex].id,
    subject,
    summary: `Spesialistforløpets hypotese-, tiltaks- og veiledningslogg står i et konkret ${type}-punkt: ${subject.toLowerCase()}. Sanders mål, konkurrerende hypoteser, evidens, usikkerhet, samtykke, risiko, spesialitetsgrense, råd og beslutningseier peker ikke automatisk samme vei. Du må bevare faglig motstemme, dataminimering og neste evalueringspunkt uten å gjøre spesialiststatus til fasit eller veiledning til skjult overtakelse.`,
    situation: [
      'Forløpsloggen viser objektversjon, pasientmål, kjent og ukjent evidens, samtykke, risiko, tiltak, råd, eier og evalueringsdato.',
      'En rask ekspertkonklusjon kan skape framdrift nå, men skjule faggrensen eller flytte ansvar og rework til neste person.',
      'Valget må gjøre venting, handoff og kriteriet for gjenåpning synlig uten å dele mer klinisk informasjon enn rollen krever.'
    ],
    task_domain: 'spesialisert_klinisk_psykologarbeid',
    competency: 'presis_usikkerhet_veiledning_og_spesialitetsgrense',
    pressure: 'ekspertise_vs_usikkerhet',
    choice_axis: 'proevbar_begrunnelse_vs_status_som_fasit',
    consequence_axis: 'laering_og_sikkerhet_vs_skjult_ansvar',
    narrative_arc: slug,
    choices: [
      {
        id: 'A',
        label: `Avgrens ${slug} i forløpsloggen`,
        reply: 'Jeg bevarer pasientmålet og motstemmen, skiller kjent fra antatt, navngir spesialitetsgrense, risiko, ventepunkt, beslutningseier og hva som skal utløse evaluering eller rework.',
        effect: 1,
        tags: ['epistemisk_ydmykhet', 'pasientmedvirkning', 'handoff'],
        feedback: 'Neste kliniker og pasienten ser hva som faktisk er kjent, hva som fortsatt venter, hvilket råd spesialisten ga og hvem som eier beslutningen. Forløpet kan revideres uten at tidligere begrunnelse slettes, og ekspertise brukes som en prøvbar ressurs innen faktisk spesialitet.',
        effects: { stats: { quality: 2, trust: 2, risk: -2, energy: -1 } }
      },
      {
        id: 'B',
        label: `Lukk ${slug} med spesialiststatus`,
        reply: 'Jeg presenterer den mest sannsynlige forklaringen som endelig, lar teamet gjennomføre rådet og fjerner ventepunktet fordi tydelig ekspertretning nå er viktigere enn flere forbehold.',
        effect: -1,
        tags: ['status_som_fasit', 'ansvarsglidning', 'risiko'],
        feedback: 'Arbeidsflaten blir ryddigere, men Sanders mål, alternativ evidens og faktisk beslutningseier blir vanskeligere å rekonstruere. Kollegene kan lese rådet som overtatt ansvar, og senere rework starter uten spor av hvorfor hypotesen ble lukket eller hvilken spesialitetsgrense som gjaldt.',
        effects: { stats: { status: 1, quality: -2, trust: -2, risk: 3 } }
      }
    ]
  };
}

for (const type of T) {
  const mails = scenes[type].map((scene, index) => makeScene(type, scene, index));
  if (type === 'knowledge') {
    const mail = mails[0];
    mail.place_id = 'psykologisk_institutt_uio';
    mail.subject = 'Profesjonshistorie skjerper spørsmålet, ikke behandlingssvaret';
    mail.summary = 'Ravi ber deg bruke History Go-profilen til Harald Schjelderup ved Psykologisk institutt, UiO som kildeforankret profesjonshistorie om institusjon og ekspertrolle. Oppgaven kan skjerpe hvordan du undersøker spesialiststatusens virkning på hypoteser og faglig motstemme, men den kan ikke avgjøre Sanders behandling, bekrefte dagens metode, gi spesialistgodkjenning eller skape klinisk eller lovregulert myndighet.';
    mail.situation = [
      'Harald Schjelderup er en canonical History Go-person knyttet til Psykologisk institutt, UiO.',
      'Oppgaven gjelder lesing av en kildeforankret historisk profil og et refleksjonsspørsmål om institusjon og ekspertrolle.',
      'Historisk kontekst holdes helt adskilt fra Sanders nåværende kliniske data, samtykke, vurdering og behandlingsgrunnlag.'
    ];
    mail.interaction_mode = 'task';
    mail.task_contract = {
      task_id: 'spesialistpsykolog_history_go_schjelderup_ekspertrolle',
      completion_rule: 'history_go_payload_completed',
      failure_rule: 'remain_open',
      evidence_refs: ['data/people/psykologi/oslo/people_psykologi_oslo.json']
    };
    mail.task_payload = {
      task_kind: 'history_go_person',
      target_type: 'person',
      person_id: 'harald_schjelderup',
      completion_mode: 'read_profile',
      title: 'Les Harald Schjelderup som profesjonshistorie',
      description: 'Les den kildeforankrede profilen og noter hvordan historisk ekspertstatus kan forme spørsmål uten å bli dagens kliniske fasit.',
      return_context: { source: 'civication', mail_id: mail.id, role_scope: R }
    };
  }
  write(`data/Civication/mailFamilies/${C}/${type}/${R}_${type}.json`, {
    schema: 'civication_mail_family_catalog_v1',
    version: 1,
    category: C,
    role_scope: R,
    mail_type: type,
    families: [{
      id: familyIds[type],
      purpose: `Trene ${type} gjennom den vedvarende spesialistforløpsloggen.`,
      learning_focus: ['epistemisk_ydmykhet', 'pasientmedvirkning', 'spesialitetsgrense', 'veiledning_uten_overtakelse', 'handoff_og_rework'],
      mails
    }]
  });
}

const sequence = ['job', 'people', 'knowledge', 'job', 'people', 'conflict', 'job', 'people', 'event', 'micro', 'job', 'people', 'followup', 'story', 'consequence', 'job'];
write(P, {
  schema: 'civication_mail_plan_v1',
  version: 1,
  id: 'psykologi_spesialistpsykolog_foundation_v1',
  category: C,
  role_scope: R,
  role_id: 'psykologi_spesialistpsykolog',
  title: 'Spesialistpsykolog – ekspertisen som må forbli prøvbar',
  description: 'Seksten steg gjennom samme fiktive spesialistforløp, fra konkurrerende hypoteser og pasientmål via veiledning, venting og annen spesialitet til evaluering og rework.',
  arc: {
    from: 'Godkjent spesialist som møter forventningen om ett sikkert svar i et komplekst forløp.',
    to: 'Spesialist som gjør ekspertise, faggrense, pasientmedvirkning, ansvar og revisjon synlige i samme arbeidsobjekt.',
    core_questions: ['Hva vet vi, og hva antar vi?', 'Hvem eier beslutningen etter rådet?', 'Hva skal få hypotesen eller tiltaket til å åpnes igjen?']
  },
  outcome_rules: {
    promoted: { completion_ratio_gte: 1, score_gte: 2, strikes_lte: 0 },
    fired: { stability_values: ['FIRED'], strikes_gte: 3, score_lte: -3 },
    stagnated: { autonomy_delta: -10, stability: 'STAGNATED', add_branch_flags: ['career_stagnated', 'spesialiststatus_lukket_forlopet'] }
  },
  sequence: sequence.map((type, index) => ({
    step: index + 1,
    type,
    phase: index < 3 ? 'intro' : index < 10 ? 'advanced' : 'mastery',
    step_goal: `Før forløpsloggen gjennom ${type} med synlig pasientmål, evidens, usikkerhet, spesialitetsgrense, eier og evalueringspunkt.`,
    allowed_families: [familyIds[type]],
    fallback_types: []
  }))
});

for (const [file, expected] of Object.entries(locks)) {
  if (![M, G].includes(file)) assert(hash(file) === expected, `${file} changed`);
}
console.log('PASS materialized Spesialistpsykolog prerequisites');
