import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
};

const KEY = 'sport/sport_trener';
const ROLE = 'sport_trener';
const WORLD_PATH = 'data/Civication/roleWorlds/sport/sport_trener.json';
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const target = (readiness.rollout_queue || []).find(row => row.key === KEY);
if (!target) throw new Error(`${KEY}: missing from rollout queue`);
if (target.classification !== 'rollout_ready') throw new Error(`${KEY}: expected rollout_ready, got ${target.classification}`);
if (JSON.stringify(target.blockers || []) !== '[]') throw new Error(`${KEY}: blockers must remain empty`);
if (JSON.stringify(target.authored_work_required || []) !== '["situated_reputation"]') throw new Error(`${KEY}: readiness debt changed: ${JSON.stringify(target.authored_work_required)}`);
if (target.cross_role_need !== 'candidate_when_shared_work_is_real') throw new Error(`${KEY}: cross-role classification changed`);
if (fs.existsSync(path.join(ROOT, WORLD_PATH))) throw new Error(`${KEY}: Role World already exists; refuse overwrite`);

const grammar = read('data/Civication/workGrammars/sport/sport_trener.json');
const plan = read('data/Civication/mailPlans/sport/sport_trener_plan.json');
const model = read('data/Civication/roleModels/sport/trener.json');
if (grammar.role_scope !== ROLE || model.role_scope !== ROLE || model.role_id !== ROLE) throw new Error('Sport-trener canonical identity drift');
if (plan.id !== 'sport_trener_v1' || plan.sequence?.length !== 8 || !plan.sequence.every(s => s.type === 'job' && JSON.stringify(s.fallback_types) === '["job"]')) throw new Error('Sport-trener eight-step plan drift');

const sources = [
  ['data/Civication/mailFamilies/sport/job/sport_trener_job.json','sport_trener_job_okt_001'],
  ['data/Civication/mailFamilies/sport/people/sport_trener_people.json','sport_trener_people_lina_001'],
  ['data/Civication/mailFamilies/sport/conflict/sport_trener_conflict.json','sport_trener_conflict_uttak_001'],
  ['data/Civication/mailFamilies/sport/story/sport_trener_story.json','sport_trener_story_resultatkrise_001'],
  ['data/Civication/mailFamilies/sport/event/sport_trener_event.json','sport_trener_event_kampdag_001'],
  ['data/Civication/mailFamilies/sport/micro/sport_trener_micro.json','sport_trener_micro_feedback_001'],
  ['data/Civication/mailFamilies/sport/knowledge/sport_trener_knowledge.json','sport_trener_knowledge_faggrense_001'],
  ['data/Civication/mailFamilies/sport/followup/sport_trener_followup.json','sport_trener_followup_belastning_001'],
  ['data/Civication/mailFamilies/sport/consequence/sport_trener_consequence.json','sport_trener_consequence_belastning_001']
];
const sourceRefs = sources.map(([rel,id]) => `${rel}#${id}`);
for (const [rel,id] of sources) {
  const doc = read(rel);
  const mails = (doc.families || []).flatMap(f => f.mails || []);
  if (!mails.some(m => m.id === id)) throw new Error(`Missing canonical source ${rel}#${id}`);
}
const follow = read(sources[7][0]).families.flatMap(f => f.mails || []).find(m => m.id === sources[7][1]);
const consequence = read(sources[8][0]).families.flatMap(f => f.mails || []).find(m => m.id === sources[8][1]);
if (follow.thread_key !== 'sport_trener.case.belastning_og_faggrense' || consequence.thread_key !== follow.thread_key) throw new Error('Persistent load thread drift');

const phases = ['morning','lunch','afternoon','evening'];
const beatTypes = ['info','relationship','task','decision','conversation','social','consequence','private_consequence'];
const daily = [
  'Læringsmålet må tåle at god trening ser mindre spektakulær ut enn resultatorientert aktivitet.',
  'Uttak og rolleforklaring viser at en sportslig beslutning også produserer tillit, skuffelse og sosial rang.',
  'Kampplanen må reduseres til handlinger spillerne kan bruke under press uten at trenerens kontrollbehov tar over.',
  'Omsorg og krav må holdes sammen slik at standarden er tydelig uten å gjøre spilleren til prestasjonen sin.',
  'Repetisjon blir upopulær, men treneren må skille nødvendig læringsutholdenhet fra rigid planlojalitet.',
  'Resultatpress og profilstatus tester om uttakskriteriene fortsatt er dokumenterbare og like for alle.',
  'Belastningssignaler krever trenerfaglig tilpasning og korrekt eskalering uten at observasjon blir diagnose.',
  'En avklart belastningsramme må bli synlig i dagens økt, ellers finnes den bare som symbolsk dokumentasjon.',
  'Staben er uenig om utviklingsbehovet, og treneren må gjøre observasjoner, mål og ansvar eksplisitte før beslutning.',
  'Tre svake resultater gjør raske endringer sosialt attraktive selv om flere prestasjonssignaler faktisk er stabile.',
  'Spillernes tillit og ledelsens tillit kan utvikle seg ulikt når treneren velger langsiktig utvikling framfor kort ro.',
  'En tidligere uttaks- eller belastningsbeslutning vender tilbake og viser hvem som faktisk husker begrunnelsen.',
  'Offentlig og klubbinternt press gjør synlig handlekraft attraktiv, mens analyse og spillerutvikling kan belønne tilbakeholdenhet.',
  'Moden trenerledelse må kunne bære uenighet, skuffelse og resultatstøy uten å kjøpe status med myndighet rollen ikke har.'
];
const phaseText = {
  morning: 'Morgenen etablerer dagens sportslige ramme gjennom plan, observasjon og ansvar før statuspresset får definere problemet.',
  lunch: 'Midt på dagen tolker spillere, stab eller ledelse samme situasjon fra et annet ståsted, slik at standing blir audience-spesifikk.',
  afternoon: 'Ettermiddagen gjør konflikten handlingsnær i økt, uttak, kampplan eller belastning og krever et valg innen faktisk trenermandat.',
  evening: 'Kvelden viser den private eller forsinkede kostnaden av arbeidet og skiller profesjonell standing fra menneskeverd og formell myndighet.'
};
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let pi = 0; pi < phases.length; pi += 1) {
    const phase = phases[pi];
    const idx = (day * 4 + pi - 4) % sourceRefs.length;
    coverage.push({
      day,
      phase,
      beat_type: beatTypes[(day + pi - 1) % beatTypes.length],
      summary: `Dag ${day}, ${phase}: ${daily[day - 1]} ${phaseText[phase]} Samme hendelse kan derfor styrke tillit hos én gruppe og svekke den hos en annen uten at dette oppretter en global omdømmescore eller utvider trenerens authority.`,
      materialization_refs: [sourceRefs[idx]]
    });
  }
}

const npc = (id, social_function, class_position, status, power_over_player, wants, conceals, speech_style, teaches_player) => ({
  id, social_function, class_position, status, power_over_player, wants, conceals, speech_style, teaches_player
});
const recurring = [
  npc('sportslig_koordinator_ida_world','sportslig koordinator som kobler sportslig plan til klubbens mål uten å eie trenerens faglige begrunnelse','koordinator med organisatorisk innflytelse','høy situert ledelsesstatus','kan etterspørre beslutningsgrunnlag og gjøre resultater synlige, men kan ikke gjøre statuspress til sportslig evidens','begrunnede prioriteringer, tidlig varsling og konsistente kriterier','at ledelsespress kan belønne synlige grep før analysen er ferdig','kort og beslutningsnær; spør hva som faktisk begrunner valget','at ledelsestillit bygges av sporbar dømmekraft, ikke av maksimal lydighet'),
  npc('assistenttrener_lina_world','assistenttrener som leser garderobe, roller og læringsbehov fra nært hold','faglig medarbeider i trenerstaben','høy kollegial tillit','kan utfordre hovedtrenerens observasjoner og påvirke gjennomføringen, men ikke arve mandat','tydelige roller, ærlig motlesning og en garderobe som forstår hva beslutninger betyr','egen uro for at uenighet kan bli tolket som illojalitet','direkte og spillerorientert; ber om konkret rolleforklaring','at trenerstaben blir sterkere når faglig uenighet kan korrigere planen'),
  npc('analyseansvarlig_noah_world','analyseansvarlig som skiller resultatstøy fra stabile prestasjonssignaler','spesialist uten uttaksmyndighet','høy epistemisk status','kan gjøre svake antakelser synlige, men ikke bestemme laguttak','få observasjoner som faktisk kan brukes i kamp og evaluering','at gode tall også kan bli brukt som sosialt skjold for treneren','presis og mønsterorientert; skiller signal, støy og usikkerhet','at analyse-standing vokser når treneren lar evidens endre beslutningen'),
  npc('spillerutvikler_amina_world','spillerutvikler som følger individuell progresjon og avklarte belastningsrammer','støttefaglig rolle med begrenset sportslig myndighet','høy situert utviklingstillit','kan kreve at avtalt ramme blir operativ i økta, men ikke overta hele kampplanen','bærekraftig progresjon, tydelige faggrenser og brukbare observasjoner','frustrasjon over at resultatpress kan gjøre tidligere avklaringer symbolske','rolig og konkret; spør hva rammen betyr for dagens aktivitet','at respekt for faggrense gjør trenerarbeidet mer presist, ikke mer passivt'),
  npc('spillergruppe_world','spillergruppen som både lærer av treneren og kollektivt vurderer rettferdighet','arbeidsutøvere med lavere formell makt, men stor relasjonell betydning','skiftende sportslig og sosial status','kan gi eller trekke tillit, gjennomføring og åpenhet uten å eie trenermandatet','forståelige krav, rettferdige kriterier og en reell utviklingsvei','at skuffelse ofte blir uttrykt som prinsipiell rettferdighetskritikk','erfaringsnær og konkret; spør hva valget betyr for neste trening','at spillertrust kan øke gjennom ærlig forklaring selv når uttaket fortsatt gjør vondt'),
  npc('sportslig_ledelse_world','sportslig ledelse som vurderer resultat, retning og mandat på organisasjonsnivå','formell lederrolle over sportslige rammer','høy formell status','kan endre oppdrag og rammer gjennom faktisk prosess, men ikke bruke omdømme som medisinsk eller kontraktsfullmakt','pålitelig retning og kriterier som tåler press','at kortsiktig resultat kan dominere selv når utviklingssignaler er bedre','formell og knapp; spør om ansvar, kriterium og konsekvens','at formell status og trenerfaglig sannhet ikke er det samme'),
  npc('offentlig_press_world','publikum, foresatte eller eksterne stemmer som ser uttak og resultat uten hele beslutningsgrunnlaget','ekstern sosial kraft uten formell trenerauthority','høy synlighetsmakt, lav formell myndighet','kan øke press og omdømmekostnad, men kan ikke velge laget','tydelige resultater, gjenkjennelige forklaringer og opplevd rettferdighet','at synlighet favoriserer enkle årsaker og raske syndebukker','raskt, kategorisk og resultatnært','at offentlig anerkjennelse kan divergere fra faglig troverdighet'),
  npc('privat_relajon_world','privat nær relasjon som møter treneren etter kamp og konflikt','likemann uten sportslig myndighet','høy emosjonell betydning','kan sette grenser for hvor mye trenerrollen får dominere privatlivet','at personen kan være mer enn tabell, uttak og neste økt','slitasjen ved å leve med kontinuerlig kampanalyse hjemme','hverdagslig og direkte; spør hva som faktisk kan vente til i morgen','at profesjonell standing er situert og ikke identisk med egenverdi')
];

const slowAxes = [
  ['sports_leadership_judgment_standing','situert ledelsestillit til dokumenterbar sportslig dømmekraft'],
  ['coaching_staff_trust_standing','situert stabstillit til motlesning, rolleavklaring og konsistente kriterier'],
  ['player_development_trust_standing','situert spillertillit til læringsmål, uttaksforklaring og utviklingsvei'],
  ['analysis_evidence_standing','situert analysetillit til at signal og støy behandles proporsjonalt'],
  ['load_boundary_trust_standing','situert støtteapparattillit til at avklarte rammer faktisk blir fulgt i praksis'],
  ['club_mandate_standing','situert organisasjonstillit til at treneren holder seg innen faktisk mandat'],
  ['public_result_reputation_standing','situert ekstern vurdering av resultat og synlig handlekraft uten formell authority'],
  ['private_coach_status_mask','hvor sterkt resultat og profesjonell kritikk lekker inn i privat egenverdi']
].map(([id, meaning]) => ({ id, meaning, runtime_binding: 'editorial_only_until_governed' }));

const audiences = [
  {id:'sports_leadership',standing_axis:'decision_reliability',cares_about:['begrunnede prioriteringer','stabil sportslig retning'],cannot_grant:'Kan ikke gjøre resultatomdømme til kontraktsfullmakt, medisinsk authority eller større uttaksmandat enn oppdraget gir.'},
  {id:'coaching_staff',standing_axis:'staff_judgment_trust',cares_about:['motlesning','tydelig ansvarsdeling'],cannot_grant:'Kan ikke overføre andre treneres eller spesialisters authority til spilleren eller hovedtreneren gjennom kollegial tillit.'},
  {id:'players',standing_axis:'selection_development_trust',cares_about:['rettferdige kriterier','konkret utviklingsvei'],cannot_grant:'Spillertillit eller popularitet kan ikke utvide trenerens formelle uttaks-, kontrakts- eller helsemyndighet.'},
  {id:'performance_analysis',standing_axis:'evidence_use_trust',cares_about:['signal mot støy','sporbar justering'],cannot_grant:'Analytisk standing kan ikke gjøre analysefunnet til automatisk laguttak eller overstyre andre mandatgrenser.'},
  {id:'player_development_and_load_support',standing_axis:'load_boundary_reliability',cares_about:['oppfølging av avklart ramme','observerbar progresjon'],cannot_grant:'Støtteapparatets tillit kan ikke gi treneren rett til diagnose, behandling, medisinsk klarering eller overstyring av avklart belastningsramme.'},
  {id:'club_leadership',standing_axis:'mandate_integrity',cares_about:['rolleavklaring','ansvarlig resultatpress'],cannot_grant:'Klubbstatus og ledertilfredshet kan ikke erstatte faktisk ansettelse, delegasjon, kontraktsfullmakt eller faglig autorisasjon.'},
  {id:'public_external_pressure',standing_axis:'visible_result_reputation',cares_about:['resultat','synlig handlekraft'],cannot_grant:'Publikums- eller foresattestøtte kan ikke bli et sportslig kriterium i seg selv og kan aldri gi treneren ny formell authority.'},
  {id:'private_relations',standing_axis:'private_role_containment',cares_about:['grense mellom jobb og privatliv','egenverdi utenfor resultat'],cannot_grant:'Privat støtte kan ikke løse faglige eller organisatoriske mandatspørsmål og kan ikke gjøre profesjonell status til personlig rettighet.'}
];

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'sport',
  role_scope: ROLE,
  title: 'Sport-trener — utvikling, uttak og situert tillit under resultatpress',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Å utvikle spillere og lag over tid når uttak, kampresultat, belastning, offentlig press og intern rang gjør synlig handlekraft mer sosialt attraktiv enn begrunnet trenerarbeid.',
    description: 'Role World-en lukker bare situated_reputation rundt den eksisterende trenerpraksisen. Øktplan, uttak, kampplan, belastningsoppfølging, authority og åtte-stegsplan beholdes uendret.'
  },
  theme_ids: ['professional_culture','status_anxiety','shame_reputation','loyalty_up_down','body_discipline','care_vs_efficiency','public_attention','public_private_leakage'],
  social_environments: [
    'Treningsfeltet der læringsmål, repetisjon, belastning og feedback blir synlige for hele gruppa.',
    'Garderoben der uttak og rolleforklaring kan beskytte eller bryte tillit selv når sportsvalget er faglig begrunnet.',
    'Konkurransearenaen der kampplan, resultat, publikum og trenerens status blir lest samtidig under tidspress.',
    'Trener- og analyserommet der observasjoner, uenighet og dokumenterte kriterier må bli beslutningsgrunnlag i stedet for intern rang.',
    'Støtteapparatets belastningsflate der treneren må handle sportslig innen en faglig ramme som eies av andre.',
    'Privatlivet der resultat og kritikk må kunne legges fra seg uten å bli en total dom over egen verdi.'
  ],
  recurring_people_archetypes: recurring,
  slow_axes: slowAxes,
  existing_work_continuity: {
    runtime_binding: 'existing_mail_and_work_grammar',
    new_runtime_state: false,
    work_loops: [...grammar.work_loops],
    canonical_surfaces: ['data/Civication/roleModels/sport/trener.json','data/Civication/workGrammars/sport/sport_trener.json','data/Civication/mailPlans/sport/sport_trener_plan.json',...sourceRefs.map(r => r.split('#')[0])],
    rule: 'Eksisterende øktplan, belastningsoppfølging, uttak, kampplan, feedback og senere konsekvens fortsetter gjennom canonical mail/work grammar; Role World-en legger bare situert standing rundt dette arbeidet.'
  },
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    divergence_examples: [
      'Et dokumentert uttak kan styrke stabens og ledelsens tillit samtidig som spiller- og publikumsstanding faller.',
      'En ærlig rolleforklaring kan styrke spillertillit selv om spilleren fortsatt mister startplassen.',
      'Respekt for en belastningsramme kan styrke støtteapparattillit og samtidig bli lest som svak handlekraft av resultatorienterte observatører.',
      'Å beholde deler av planen etter tre tap kan styrke analysetillit samtidig som offentlig omdømme svekkes.',
      'Å innrømme at en økt må revideres kan koste kortsiktig hovedtrenerstatus og samtidig styrke langsiktig spillerutviklingstillit.'
    ],
    rule: 'Standing er audience-spesifikk og kan divergere mellom ledelse, stab, spillere, analyse, støtteapparat, offentlighet og privatliv uten global sosial score.',
    authority_separation: 'Ingen standing kan gi medisinsk authority, kontraktsfullmakt, større uttaksmandat, arbeidsgivermakt eller Badge-basert ledermyndighet; faktisk mandat og faggrense forblir authoritative.'
  },
  cross_role_link: {
    status: 'candidate_when_shared_work_is_real',
    companion: 'sport/sport_utover',
    materialized: false,
    new_runtime: false,
    rule: 'Trener og utøver deler reelle trenings-, belastnings-, rolle- og konkurranseflater, men et framtidig shared work object krever egen governed proof og må bevare hver rolles authority og canonical role_scope.'
  },
  season: { days: 14, day_phases: phases, coverage },
  primary_threads: [
    {id:'learning_and_feedback',beat_refs:['1/morning','2/afternoon','5/morning','9/afternoon','14/morning']},
    {id:'selection_and_trust',beat_refs:['2/lunch','4/afternoon','6/afternoon','11/lunch','13/afternoon','14/afternoon']},
    {id:'match_plan_and_results',beat_refs:['3/morning','3/afternoon','6/evening','10/afternoon','13/morning','14/evening']},
    {id:'load_boundary_and_progression',beat_refs:['7/morning','7/afternoon','8/morning','8/afternoon','12/morning','12/evening']},
    {id:'staff_and_public_standing',beat_refs:['5/lunch','9/lunch','10/lunch','11/evening','13/lunch','14/lunch']}
  ],
  private_aftermath: [
    {id:'resultat_hjem',beat_refs:['3/evening','10/evening'],meaning:'Resultatpress følger med hjem og må skilles fra egenverdi.'},
    {id:'uttak_hjem',beat_refs:['2/evening','6/evening'],meaning:'Skuffelse rundt uttak blir med hjem selv når sportsvalget står.'},
    {id:'belastning_hjem',beat_refs:['7/evening','8/evening'],meaning:'Usikkerheten rundt belastning må kunne vente på riktig fagprosess.'},
    {id:'stab_hjem',beat_refs:['9/evening','11/evening'],meaning:'Faglig uenighet skal ikke automatisk bli personlig rangkamp.'},
    {id:'slutt_hjem',beat_refs:['13/evening','14/evening'],meaning:'Moden trenerstatus innebærer å kunne legge rollen fra seg.'}
  ],
  delayed_consequences: [
    {id:'learning_return',setup_ref:'1/morning',return_ref:'5/afternoon',meaning:'Tidlig læringspresisjon kommer tilbake når repetisjon blir upopulær.'},
    {id:'selection_return',setup_ref:'2/lunch',return_ref:'6/afternoon',meaning:'Tidlig rolleforklaring påvirker senere uttakstillit.'},
    {id:'plan_return',setup_ref:'3/afternoon',return_ref:'10/afternoon',meaning:'Kampplanens prinsipper blir testet av resultatkrise.'},
    {id:'load_return',setup_ref:'7/morning',return_ref:'8/afternoon',meaning:'Avklart belastning må bli faktisk treningspraksis.'},
    {id:'staff_return',setup_ref:'9/lunch',return_ref:'13/lunch',meaning:'Hvordan uenighet ble håndtert påvirker senere stabstillit.'},
    {id:'reputation_return',setup_ref:'11/lunch',return_ref:'14/afternoon',meaning:'Audience-spesifikk standing kommer tilbake uten å bli global authority.'}
  ],
  employment_conditions: [
    'Trenerjobben forutsetter faktisk oppdrag eller ansettelse; Badge-poeng alene gir ingen jobb.',
    'Arbeidstid, kampkalender og tilgjengelighetskrav er rolle-eid redaksjonelt stoff og ikke nytt globalt runtimefelt.',
    'Hovedtrener- eller ledermyndighet krever faktisk oppdrag og kan ikke materialiseres gjennom omdømme.'
  ],
  professional_culture: [
    'Trenerstaben må kunne motlese hverandre uten at uenighet automatisk blir illojalitet.',
    'Dokumenterte sportslige kriterier skal tåle statuspress og være forklarbare for dem som berøres.',
    'Omsorg, krav og faggrenser behandles som deler av profesjonell kvalitet, ikke som alternativer til resultatansvar.'
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
if (!(index.roles || []).some(r => r.category === 'sport' && r.role_scope === ROLE)) {
  index.roles.push({ category: 'sport', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
}
index.status = `${index.roles.length}_role_worlds_materialized`;
index.effective_date = '2026-08-29';
index.note = 'Sport-trener closes only situated reputation; existing coaching work, authority and cross-role runtime policy remain unchanged.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles[KEY] = world.theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_SPORT_TRENER_ROLE_WORLD_ROLLOUT.md'), `# Civication Sport-trener Role World rollout\n\n- Role: \`${KEY}\`\n- Status: \`role_world_complete\`\n- Authored debt closed: \`situated_reputation\` only\n- Season: 14 days / 56 beats\n- Canonical source refs: ${sourceRefs.length}\n- Existing eight-step plan, work grammar, role model, persistent load thread and authority boundaries preserved.\n- Cross-role candidate: \`sport/sport_utover\`; materialized: false; new runtime: false.\n- Permanent state must only be committed after focused gates and full Civication pass.\n`);
console.log(`Materialized ${KEY}: ${coverage.length} beats / ${sourceRefs.length} source refs`);
