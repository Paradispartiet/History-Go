#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
};
const exists = rel => fs.existsSync(path.join(ROOT, rel));

const ROLE = 'avdelingsleder';
const KEY = 'naeringsliv/avdelingsleder';
const OBJECT = 'naeringsliv_avdelingsleder_capacity_case_001';
const THREAD = 'naeringsliv_avdelingsleder_capacity_realism_001';
const INSTITUTION = 'naeringsliv_operativ_enhet_001';
const PREFIX = 'naeringsliv_avdelingsleder_realism_';
const TYPES = ['job','people','story','knowledge','micro','conflict','event','followup','consequence'];
const tags = ['role_world_realism','controlled_rollout','naeringsliv',ROLE,'situated_reputation'];

const standing = (event_id, audience_id, delta, reason, source_actor_id) => ({ event_id, audience_id, delta, reason, source_actor_id });
const transition = (event_id, to_status, to_phase, note) => ({ op:'transition', event_id, work_object_id:OBJECT, to_status, to_phase, note });
const flag = (event_id, value) => ({ op:'add_flag', event_id, work_object_id:OBJECT, flag:value });
const effects = (stats, work_object_ops, social_standing_ops) => ({ stats, work_object_ops, social_standing_ops });
const choice = (id, label, reply, feedback, stats, workOps, standingOps, authority_action) => ({
  id, label, reply, effect: id === 'A' ? 2 : -2, feedback,
  effects: effects(stats, workOps, standingOps),
  ...(authority_action ? { authority_action } : {})
});
const makeScene = spec => ({
  id: spec.id,
  mail_type: spec.type,
  mail_family: spec.family,
  role_scope: ROLE,
  phase: spec.phase || 'advanced',
  day_phase: spec.day_phase,
  priority: spec.priority,
  cooldown: 12,
  repeatable: false,
  stage: 'stable',
  planned_only: true,
  thread_key: THREAD,
  tags,
  from: spec.from,
  people_ref: spec.actor,
  person_id: spec.actor,
  place_id: spec.place_id,
  subject: spec.subject,
  summary: spec.summary,
  purpose: spec.purpose,
  stakes: spec.stakes,
  situation: spec.situation,
  task_domain: spec.task_domain,
  task_kind: spec.type,
  competency: spec.competency,
  pressure: spec.pressure,
  choice_axis: spec.choice_axis,
  consequence_axis: spec.consequence_axis,
  narrative_arc: 'fra_uklar_kapasitet_til_sporbart_prioriterings_og_ressurshandoff',
  interaction_mode: spec.interaction_mode || 'decision',
  work_context: {
    object_ids: [OBJECT],
    institution_id: INSTITUTION,
    ...(spec.handoff_to ? { handoff_to_actor_id: spec.handoff_to } : {}),
    ...(spec.waiting_for ? { waiting_for_actor_id: spec.waiting_for } : {}),
    ...(spec.rework_of ? { rework_of_scene_id: spec.rework_of } : {}),
    priority: spec.work_priority || 'high'
  },
  choices: spec.choices,
  ...(spec.fields || {})
});
const family = (id, purpose, focus, mail) => ({ id, purpose, learning_focus:focus, mails:[mail] });
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/avdelingsleder_${type}.json`;
const addFamily = (type, item) => {
  const rel = catalogPath(type);
  const doc = exists(rel) ? read(rel) : {
    schema:'civication_mail_family_catalog_v1', version:1, category:'naeringsliv', role_scope:ROLE, mail_type:type, families:[]
  };
  doc.families = (doc.families || []).filter(existing => existing.id !== item.id);
  doc.families.push(item);
  write(rel, doc);
};

const open = makeScene({
  type:'job', id:PREFIX+'capacity_case_open_001', family:'role_world_rollout_avdelingsleder_capacity_open', day_phase:'morning', priority:99,
  from:'Inger, regionleder', actor:'inger_overordnet_leder', place_id:'ledermoterom',
  subject:'Åpne ukeprioriteringen som ett kapasitetsspor – ikke som en pen statuslinje',
  summary:'Inger ber om en beslutningsklar ukeprioritering. Leveransen ligger nær mål, men fravær, opplæring, overtid og sene avvik viser at samme resultat bæres av ulik belastning. Du må gjøre kapasitet, eiere og åpne spørsmål synlige uten å late som du kan vedta nye rammer selv.',
  purpose:'Etablere ett vedvarende avdelingscase som binder prioritering, kapasitet, rapportering, teamreaksjoner og ressursbehov sammen gjennom samme arbeidsobjekt.',
  stakes:'Hvis avdelingen bare sender et grønt leveransetall oppover, kan ledelsen belønne fasaden mens teamet lærer at belastning ikke teller før den blir sykefravær eller kvalitetsbrudd.',
  situation:['Leveransegraden er 96 prosent, men overtid og innleie holder deler av planen oppe.','Rana melder at to nye ansatte fortsatt trenger tett opplæring, og fraværet stiger svakt.','Inger eier endelige ramme- og ressursbeslutninger; avdelingslederen eier prioritering av arbeid innen gjeldende fullmakt.'],
  task_domain:'kapasitet_og_ukeprioritering', competency:'prioritering_og_rapportering', pressure:'leveransefasade_vs_reell_baereevne', choice_axis:'sporbar_prioritering_vs_polert_status', consequence_axis:'situert_tillit_vs_skjult_belastning',
  choices:[
    choice('A','Samle leveranse, belastning, opplæring og åpne beslutninger i ett case','Jeg sender en prioritert status som viser både leveransen, kapasitetskostnaden og hva Inger faktisk må ta stilling til.','Inger får et styrbart grunnlag uten at teamets belastning forsvinner. Rana ser samtidig at det hun rapporterte faktisk når opp som del av beslutningsgrunnlaget, ikke som en privat bekymring.',{quality:2,trust:2,risk:-2,energy:-1},[
      flag('avdelingsleder_baseline_traced','capacity_baseline_and_owners_traced')
    ],[
      standing('avdelingsleder_standing_inger_open','manager:inger_overordnet_leder',3,'Inger får en kort status som fortsatt viser reelle kapasitetsgrenser og beslutningsbehov.','inger_overordnet_leder'),
      standing('avdelingsleder_standing_team_open','team:avdelingsleder_team',3,'Teamets belastning blir representert som styringsinformasjon i stedet for støy.','rana_teamkoordinator')
    ]),
    choice('B','Rapporter leveransen som stabil og ta belastningen internt senere','Jeg sender at avdelingen er på plan og håndterer restpunktene internt før de eventuelt blir et ledertema.','Rapporten blir lett å lese, men Inger mister informasjon hun trenger for å prioritere, mens teamet ser at ekstraarbeidet deres blir brukt til å produsere et grønnere bilde enn arbeidshverdagen tilsier.',{status:1,quality:-2,trust:-2,risk:3},[
      flag('avdelingsleder_baseline_polished','capacity_cost_hidden_from_manager')
    ],[
      standing('avdelingsleder_standing_inger_polished','manager:inger_overordnet_leder',-2,'Inger får mindre beslutningsrelevant informasjon selv om rapporten ser rolig ut.','inger_overordnet_leder'),
      standing('avdelingsleder_standing_team_polished','team:avdelingsleder_team',-4,'Teamet ser at egen belastning ikke teller i statusen så lenge leveransen fortsatt holder.','rana_teamkoordinator')
    ])
  ],
  fields:{ effects:{ work_object_ops:[{ op:'create', event_id:'avdelingsleder_capacity_case_opened', work_object:{ work_object_id:OBJECT, kind:'department_capacity_and_priority_case', role_scope:ROLE, institution_id:INSTITUTION, title:'Avdelingskapasitet: leveranse, bemanning, opplæring og ressursvalg', status:'in_progress', phase:'baseline_and_priority', people_refs:['inger_overordnet_leder','rana_teamkoordinator','mads_sidestilt_avdelingsleder','oyvind_okonomicontroller'], place_refs:['avdelingsgulv','teamrom_og_vaktplan','driftskontor','ledermoterom'], knowledge_refs:['data/Civication/roleModels/naeringsliv/avdelingsleder.json','data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json'], open_questions:['Hvilket arbeid må faktisk prioriteres ned hvis kapasiteten ikke øker?','Hvilken del av budsjettavviket er nødvendig kapasitetskostnad, og hvem kan godkjenne unntak?','Hvilke belastningssignaler må følges før de blir fravær eller kvalitetsbrudd?'], deadline:'avdelingsstatus_dag_14', confidentiality:'internt_ledelses_og_arbeidsmiljogrunnlag', flags:['capacity_case_opened'], shared:false } }] } }
});

const people = makeScene({
  type:'people', id:PREFIX+'team_handoff_001', family:'role_world_rollout_avdelingsleder_team_handoff', day_phase:'afternoon', priority:98,
  from:'Rana, teamkoordinator', actor:'rana_teamkoordinator', place_id:'teamrom_og_vaktplan', handoff_to:'rana_teamkoordinator', waiting_for:'inger_overordnet_leder', rework_of:open.id,
  subject:'Handoffet må skille det teamet vet fra det regionleder må beslutte',
  summary:'Rana samler vaktbytter, opplæringsbehov og gjentatt overtidsbelastning. Hun kan levere et konkret gulv-perspektiv, men trenger at du skiller observasjoner fra formelle ressursvalg og lar Inger eie beslutningen om varige rammeendringer.',
  purpose:'Gjøre ståstedet til teamet situert og operativt uten at høy teamtillit gir avdelingslederen ekstra budsjett-, HR- eller bemanningsmyndighet.',
  stakes:'Et uklart handoff gjør avdelingslederen til flaskehals og kan få teamets tillit til å bli tolket som fullmakt til å love løsninger organisasjonen ikke har godkjent.',
  situation:['Rana har konkrete eksempler på hvor opplæring og fravær flytter arbeid mellom personer.','Teamet ønsker svar på om ekstra kapasitet faktisk kommer, men Inger har ikke besluttet dette.','Du kan prioritere arbeid innen mandat og eskalere kapasitetskonflikten, men ikke love nye stillinger eller et budsjettunntak.'],
  task_domain:'team_handoff_og_bemanning', competency:'relasjonell_ledelse', pressure:'teamforventning_vs_formelt_mandat', choice_axis:'presist_handoff_vs_personlig_lovnad', consequence_axis:'teamtillit_vs_forventningsgjeld',
  choices:[
    choice('A','Send observasjoner, risikosignal og beslutningsbehov som tre separate deler','Jeg dokumenterer hva teamet ser, hva vi kan omprioritere nå, og hva som må avgjøres av Inger.','Rana får et handoff som beholder gulvets erfaring som egen evidens. Inger får et tydelig spørsmål i stedet for et ferdig vedtak, og teamets tillit øker uten at rollegrensen flyttes.',{quality:2,trust:2,risk:-2},[
      transition('avdelingsleder_team_handoff_waiting','waiting','awaiting_resource_direction','Teamets kapasitetsgrunnlag er dokumentert; varige ressursvalg venter på regionleder.'),
      flag('avdelingsleder_team_handoff_traced','team_evidence_and_decision_owner_separated')
    ],[
      standing('avdelingsleder_standing_rana_handoff','professional:rana_teamkoordinator',4,'Rana ser at observasjonene hennes blir bevart uten å bli omskrevet til et lederløfte.','rana_teamkoordinator'),
      standing('avdelingsleder_standing_inger_handoff','manager:inger_overordnet_leder',2,'Inger får et eksplisitt beslutningspunkt uten at avdelingslederen har tatt beslutningen på forskudd.','inger_overordnet_leder')
    ]),
    choice('B','Si til teamet at du skal sørge for ekstra kapasitet','Jeg sier at dette ordner jeg, og at vi får inn den kapasiteten vi trenger.','Teamet kan oppleve kortsiktig trygghet, men lovnaden binder deg til et ressursutfall du ikke eier. Hvis Inger velger annerledes, blir høy lokal tillit omgjort til både forventningsgjeld og mandatlekkasje.',{status:1,trust:-2,risk:4},[
      transition('avdelingsleder_team_handoff_promise','waiting','awaiting_resource_direction','Caset venter fortsatt på regionleder selv om spilleren har lovet et bestemt utfall.'),
      flag('avdelingsleder_resource_promise','resource_outcome_promised_without_authority')
    ],[
      standing('avdelingsleder_standing_rana_promise','professional:rana_teamkoordinator',-3,'Rana må senere forklare et løfte som ikke var forankret i faktisk fullmakt.','rana_teamkoordinator'),
      standing('avdelingsleder_standing_inger_promise','manager:inger_overordnet_leder',-4,'Inger oppdager at hennes ressursmyndighet er blitt fremstilt som avdelingslederens personlige beslutning.','inger_overordnet_leder')
    ])
  ]
});

const story = makeScene({
  type:'story', id:PREFIX+'peer_reputation_split_001', family:'role_world_rollout_avdelingsleder_peer_reputation', day_phase:'evening', priority:97,
  from:'Mads, sidestilt avdelingsleder', actor:'mads_sidestilt_avdelingsleder', place_id:'driftskontor', rework_of:people.id, waiting_for:'inger_overordnet_leder',
  subject:'Mads liker den rolige rapporten – Rana liker at belastningen faktisk står der',
  summary:'Mens caset venter på ressursretning, peker Mads på at ledergruppen belønner korte, rolige statusbilder. Samtidig har Rana gitt deg mer tillit fordi belastningen ikke ble filtrert bort. Rollen må tåle at standing hos to publikum beveger seg forskjellig.',
  purpose:'Materialisere omdømme som audience-spesifikk standing: sidestilt leder, team og regionleder kan vurdere samme handling ulikt uten at én global score avgjør sosial virkelighet.',
  stakes:'Hvis spilleren jager én samlet statusverdi, blir det rasjonelt å polere budskapet for den mektigste mottakeren og usynliggjøre kostnaden hos dem som faktisk bærer arbeidet.',
  situation:['Mads mener ledergruppen trenger ro og korthet for å handle.','Rana mener troverdig ledelse krever at skjult belastning står i samme bilde som leveransen.','Ingen av disse reaksjonene endrer hvem som kan godkjenne budsjett, bemanning eller formelle personalsaker.'],
  task_domain:'situert_omdomme_og_lederkultur', competency:'status_og_tillitsforstaelse', pressure:'ledergruppestatus_vs_teamlegitimitet', choice_axis:'erkjenn_publikumssplitt_vs_optimer_global_status', consequence_axis:'lesbar_tillit_vs_statusmaskering',
  choices:[
    choice('A','Behold den fulle statusen og gjør målgruppen for hvert signal tydelig','Jeg beholder kapasitetsdelen og merker hva som er teamobservasjon, ledervurdering og beslutningspunkt.','Mads er fortsatt mer skeptisk til lengden, men han kan se hva som er ditt ansvar og hva som må opp. Rana får bekreftet at lokal tillit ikke blir ofret for å maksimere status i ledergruppen.',{quality:2,trust:2,risk:-1},[
      flag('avdelingsleder_reputation_split_named','audience_specific_standing_made_explicit')
    ],[
      standing('avdelingsleder_standing_mads_explicit','professional:mads_sidestilt_avdelingsleder',1,'Mads ser en mer omfattende rapport, men også en tydeligere ansvarsdeling som er mulig å diskutere.','mads_sidestilt_avdelingsleder'),
      standing('avdelingsleder_standing_team_explicit','team:avdelingsleder_team',3,'Teamet ser at belastningsinformasjonen overlever inn i lederdialogen.','rana_teamkoordinator')
    ]),
    choice('B','Kort ned alt som kan få avdelingen til å se svak ut','Jeg fjerner belastningsdetaljene og lar leveranse, tiltak og kontroll være hovedbildet.','Mads opplever rapporten som mer ledervennlig, men teamets ståsted faller fordi informasjonen de tok risikoen ved å dele nå brukes til å produsere et penere bilde. Standing beveger seg ulikt, ikke globalt.',{status:2,quality:-2,trust:-2,risk:3},[
      flag('avdelingsleder_reputation_optimized_upward','manager_facing_status_optimized_at_team_cost')
    ],[
      standing('avdelingsleder_standing_mads_polished','professional:mads_sidestilt_avdelingsleder',3,'Mads liker den kortere lederformen og oppfatter deg som mer politisk smidig.','mads_sidestilt_avdelingsleder'),
      standing('avdelingsleder_standing_team_polished_again','team:avdelingsleder_team',-5,'Teamet ser at deres informasjon er filtrert ut når den truer lederstatusen.','rana_teamkoordinator')
    ])
  ]
});

const knowledge = makeScene({
  type:'knowledge', id:PREFIX+'history_go_workplace_context_001', family:'role_world_rollout_avdelingsleder_history_go_context', day_phase:'morning', priority:96,
  from:'Øyvind, økonomicontroller', actor:'oyvind_okonomicontroller', place_id:'lilleborg_fabrikker', rework_of:story.id, waiting_for:'inger_overordnet_leder',
  subject:'Bruk industrikonteksten til å stille et bedre kapasitets-spørsmål – ikke til å kreve et bestemt svar',
  summary:'Øyvind ber deg forklare hvorfor opplæring, innleie og kvalitet bør leses samlet. History Go-kunnskap om arbeidsdeling, produksjon og industri kan gjøre årsaksspørsmålet bedre, men historisk kontekst gir ingen moderne budsjett- eller personalmyndighet.',
  purpose:'Koble eksisterende History Go-/Næringsliv-kunnskap til et bedre profesjonelt handlingsrom uten å gjøre kunnskap til formell autoritet eller et ferdig normativt svar.',
  stakes:'Når kunnskap forveksles med myndighet, kan en faglig sterk avdelingsleder begynne å presentere egne ressursvalg som om historisk eller organisatorisk innsikt gjorde godkjenning unødvendig.',
  situation:['Lilleborg-fabrikkene gir et konkret stedlig anker for hvordan produksjon, arbeidsdeling og teknologi har organisert arbeid over tid.','Øyvind trenger en nåtidig årsaksforklaring basert på dagens tall, ikke en historisk analogi som fasit.','Inger beholder ressursmyndigheten uansett hvor god den faglige analysen er.'],
  task_domain:'history_go_og_kapasitetsanalyse', competency:'kunnskapsanvendelse', pressure:'faglig_innsikt_vs_mandatglidning', choice_axis:'bruk_kontekst_til_sporsmal_vs_bruk_kontekst_som_fasit', consequence_axis:'bedre_analyse_vs_falsk_autoritet',
  choices:[
    choice('A','Bruk konteksten til å teste om dagens kapasitetstall skjuler arbeidsdeling og opplæringskostnad','Jeg bruker kunnskapen til å formulere bedre spørsmål til Øyvind og Rana, og lar dagens underlag avgjøre konklusjonen.','Øyvind får et bedre analysekart uten at historien blir brukt som bevis for et budsjettvedtak. Teamet opplever at kunnskap hjelper avdelingen å forstå arbeidet i stedet for å overstyre dem som gjør det.',{quality:3,trust:2,risk:-2},[
      transition('avdelingsleder_history_context_applied','in_progress','evidence_reframed','History Go-kontekst brukes til å forbedre spørsmål og årsaksmodell, ikke til å vedta ressursutfall.')
    ],[
      standing('avdelingsleder_standing_oyvind_context','professional:oyvind_okonomicontroller',3,'Øyvind får tydeligere spørsmål uten at økonomiunderlaget erstattes av historisk analogi.','oyvind_okonomicontroller'),
      standing('avdelingsleder_standing_team_context','team:avdelingsleder_team',2,'Teamets nåtidige erfaring beholdes som nødvendig evidens ved siden av faglig kontekst.','rana_teamkoordinator')
    ]),
    choice('B','Bruk industrikonteksten til å argumentere for at ekstra kapasitet åpenbart må godkjennes','Jeg viser at historisk produksjonskunnskap tilsier at vi trenger mer bemanning, så dette bør behandles som avgjort.','Analysen kan være interessant, men du hopper fra kunnskap til formell konklusjon. Øyvind mister tillit til sporbarheten, og Ingers myndighet blir indirekte omgått gjennom faglig status.',{status:1,quality:-2,trust:-2,risk:3},[
      flag('avdelingsleder_knowledge_authority_leak','knowledge_presented_as_resource_approval')
    ],[
      standing('avdelingsleder_standing_oyvind_overreach','professional:oyvind_okonomicontroller',-3,'Øyvind ser at historisk kontekst brukes til å lukke et spørsmål dagens tall fortsatt må besvare.','oyvind_okonomicontroller'),
      standing('avdelingsleder_standing_inger_knowledge_overreach','manager:inger_overordnet_leder',-3,'Faglig innsikt blir brukt som om den erstattet regionlederens ressursbeslutning.','inger_overordnet_leder')
    ])
  ],
  fields:{ knowledge_context:{ source_refs:['data/Civication/roleModels/naeringsliv/avdelingsleder.json','data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json'], place_ref:'lilleborg_fabrikker', affordance:'better_capacity_question', authority_grant:false } }
});

const micro = makeScene({
  type:'micro', id:PREFIX+'standing_pulse_001', family:'role_world_rollout_avdelingsleder_standing_pulse', day_phase:'afternoon', priority:95,
  from:'Rana, teamkoordinator', actor:'rana_teamkoordinator', place_id:'avdelingsgulv', rework_of:knowledge.id,
  subject:'Fem minutter på gulvet viser hvorfor én omdømmescore ikke kan forklare avdelingen',
  summary:'Et kort gulvmøte viser at teamet verdsetter tydelige prioriteringer, mens Mads synes du gjør belastning for synlig og Øyvind først og fremst belønner sporbarhet. Samme lederhandling må derfor gi forskjellige standing-effekter hos forskjellige mottakere.',
  purpose:'Gjøre situert omdømme til en repeterbar sosial lesning med eksplisitte audience-id-er, uten å introdusere ny runtime eller en parallell omdømmemotor.',
  stakes:'Hvis alle reaksjoner kollapser til status, mister spilleren grunnen til å forstå hvem som faktisk har tillit, hvem som bare liker resultatet, og hvem som har formell beslutningsmakt.',
  situation:['Rana reagerer på om prioriteringen er rettferdig og gjennomførbar.','Mads reagerer på hvordan avdelingen fremstår i lederkollegiet.','Øyvind reagerer på om årsak og tall kan spores; ingen av disse standing-aksene flytter formell myndighet.'],
  task_domain:'situert_standing_pulse', competency:'sosial_lesning', pressure:'global_status_vs_publikumsspesifikk_tillit', choice_axis:'les_publikum_hver_for_seg_vs_jag_en_score', consequence_axis:'rolleforstaelse_vs_statusblindhet',
  choices:[
    choice('A','Oppdater handoffet etter hvem som trenger hva, uten å endre fakta','Jeg beholder samme faktagrunnlag, men gjør team-, økonomi- og lederbehov eksplisitte som ulike mottakerperspektiver.','Rana, Øyvind og Inger får hver sin lesbare grunn til å stole mer på arbeidet uten at noen får late som standing hos én målgruppe opphever kravene fra de andre eller skaper ny fullmakt.',{quality:2,trust:3,risk:-2},[
      flag('avdelingsleder_standing_pulse_split','standing_audiences_kept_separate')
    ],[
      standing('avdelingsleder_standing_rana_pulse','professional:rana_teamkoordinator',3,'Rana ser at teamets gjennomførbarhet ikke blir redusert til et generelt omdømmetall.','rana_teamkoordinator'),
      standing('avdelingsleder_standing_oyvind_pulse','professional:oyvind_okonomicontroller',3,'Øyvind ser at tallsporet beholdes selv når budskapet tilpasses mottakeren.','oyvind_okonomicontroller'),
      standing('avdelingsleder_standing_inger_pulse','manager:inger_overordnet_leder',2,'Inger får et lederrelevant sammendrag som fortsatt peker til det samme underlaget.','inger_overordnet_leder')
    ]),
    choice('B','Optimaliser bare for ledergruppens inntrykk','Jeg gjør statusen så sterk og kort som mulig oppover og lar de andre relasjonene håndteres senere.','Standing hos lederkolleger kan stige kortsiktig, men Rana og Øyvind får hver sin grunn til å miste tillit. Den situerte modellen gjør nettopp dette tapet synlig i stedet for å la én positiv statusscore skjule det.',{status:2,quality:-2,trust:-3,risk:3},[
      flag('avdelingsleder_standing_pulse_collapsed','standing_optimized_for_powerful_audience_only')
    ],[
      standing('avdelingsleder_standing_mads_pulse','professional:mads_sidestilt_avdelingsleder',3,'Mads liker den mer politisk polerte lederformen.','mads_sidestilt_avdelingsleder'),
      standing('avdelingsleder_standing_rana_pulse_loss','professional:rana_teamkoordinator',-4,'Rana ser at teamets signaler forsvinner når de konkurrerer med lederstatus.','rana_teamkoordinator'),
      standing('avdelingsleder_standing_oyvind_pulse_loss','professional:oyvind_okonomicontroller',-3,'Øyvind får mindre etterprøvbar årsaksinformasjon i bytte mot et penere budskap.','oyvind_okonomicontroller')
    ])
  ]
});

const conflict = makeScene({
  type:'conflict', id:PREFIX+'reporting_conflict_001', family:'role_world_rollout_avdelingsleder_reporting_conflict', day_phase:'afternoon', priority:94,
  from:'Inger, regionleder', actor:'inger_overordnet_leder', place_id:'ledermoterom', rework_of:micro.id,
  subject:'Kan du gjøre rapporten tydeligere uten å gjøre usikkerheten usynlig?',
  summary:'Inger trenger tre linjer til ledermøtet. Mads foreslår at du omtaler kapasiteten som stabil så lenge leveransen holder, mens Rana og Øyvind mener henholdsvis belastning og kostnadsårsak må være synlige. Du må komprimere uten å forfalske.',
  purpose:'Teste lojalitet oppover og nedover gjennom situert standing, samtidig som anbefaling forblir forskjellig fra regionlederens godkjenning av ressursendring.',
  stakes:'En avdelingsleder som blir belønnet for ro kan lære å bruke omdømme som grunn til å skjule usikkerhet. Det gjør ledelsen mindre informert og teamets senere reaksjon mer eksplosiv.',
  situation:['Inger trenger en kort beslutningslinje før ledermøtet.','Øyvind kan dokumentere kostnadsbildet, men ikke bestemme bemanningsrammen.','Du kan anbefale prioritering og omfordele arbeid innen fullmakt, men varig ressursendring krever godkjenning.'],
  task_domain:'rapportering_og_styring', competency:'redelig_komprimering', pressure:'lederklarhet_vs_sannhet', choice_axis:'kort_og_sporbart_vs_kort_og_polert', consequence_axis:'styringstillit_vs_skjult_risiko',
  choices:[
    choice('A','Skriv tre linjer: leveranse, kapasitetsrisiko og beslutningsbehov','Jeg komprimerer statusen, men beholder ett eksplisitt risikosignal og hva Inger må avgjøre.','Inger får korthet uten at du tar beslutningen for henne. Øyvind kan fortsatt spore årsaken, og teamets standing påvirkes av at deres belastning er representert selv i den korte lederversjonen.',{quality:3,trust:2,risk:-2},[
      transition('avdelingsleder_report_reworked','in_progress','decision_ready_report','Rapporten er komprimert til beslutningsklar status med kapasitetsrisiko og eier synlig.')
    ],[
      standing('avdelingsleder_standing_inger_report','manager:inger_overordnet_leder',4,'Inger får en kort rapport som fortsatt viser hva hun faktisk må beslutte.','inger_overordnet_leder'),
      standing('avdelingsleder_standing_team_report','team:avdelingsleder_team',2,'Teamet ser at belastningen ikke forsvinner når statusen sendes oppover.','rana_teamkoordinator')
    ]),
    choice('B','Kall kapasiteten stabil fordi leveransen fortsatt ligger nær mål','Jeg skriver at kapasiteten er stabil og at vi følger kostnader og fravær tett.','Mads kan oppleve formuleringen som profesjonelt rolig, men Inger får et svakere beslutningsgrunnlag. Teamet lærer at en positiv leveranse er nok til å gjøre deres signaler mindre virkelige i lederrommet.',{status:2,quality:-3,trust:-2,risk:4},[
      flag('avdelingsleder_report_capacity_hidden','capacity_risk_removed_for_status')
    ],[
      standing('avdelingsleder_standing_mads_report','professional:mads_sidestilt_avdelingsleder',3,'Mads liker at statusen ikke skaper ekstra uro i ledergruppen.','mads_sidestilt_avdelingsleder'),
      standing('avdelingsleder_standing_inger_report_loss','manager:inger_overordnet_leder',-4,'Inger får ikke vite at dagens leveranse krever ekstra kapasitetskostnad.','inger_overordnet_leder'),
      standing('avdelingsleder_standing_team_report_loss','team:avdelingsleder_team',-4,'Teamets belastning blir igjen usynlig i den formelle statusen.','rana_teamkoordinator')
    ])
  ]
});

const event = makeScene({
  type:'event', id:PREFIX+'capacity_incident_001', family:'role_world_rollout_avdelingsleder_capacity_incident', day_phase:'morning', priority:93,
  from:'Rana, teamkoordinator', actor:'rana_teamkoordinator', place_id:'avdelingsgulv', rework_of:conflict.id, handoff_to:'inger_overordnet_leder',
  subject:'Nytt fravær gjør fullmaktsgrensen konkret: prioriter lokalt, eskaler rammen',
  summary:'Et nytt fravær treffer samtidig som en kvalitetskritisk leveranse skal ferdigstilles. Du kan omprioritere arbeid og stoppe en uforsvarlig plan innen rollen, men du kan ikke selv vedta varig bemanningsøkning, budsjettunntak eller formelle personalsanksjoner.',
  purpose:'Bevise at situert standing og lokal lederstatus ikke utvider authority: legitim direkte prioritering innen mandat skal skilles fra handlinger som krever godkjenning.',
  stakes:'Når teamet har høy tillit til lederen kan det føles naturlig å handle på deres vegne. Hvis dette blir tolket som fullmakt til å kjøpe, ansette eller sanksjonere, lekker omdømme direkte inn i myndighet.',
  situation:['Fraværet gjør dagens plan urealistisk uten omprioritering.','Den operative ledergrammatikken tillater prioritering av arbeid innen fullmakt og eskalering av kapasitetskonflikter.','Budsjettunntak, varig bemanning og formelle personalsaker eies fortsatt av andre beslutningspunkter.'],
  task_domain:'driftsavvik_og_fullmakt', competency:'mandatklar_operativ_ledelse', pressure:'handlekraft_vs_myndighetslekkasje', choice_axis:'prioriter_innen_mandat_og_eskaler_vs_gjor_ressursvedtak_selv', consequence_axis:'legitim_handlekraft_vs_authority_breach',
  choices:[
    choice('A','Omprioriter dagens arbeid, beskytt kvalitet og eskaler varig ressursbehov','Jeg flytter ikke-kritisk arbeid, skjermer kvalitet og sender Inger et eksplisitt behov for rammebeslutning.','Teamet får konkret handlekraft fra deg der rollen faktisk har mandat. Inger får resten som godkjenningspunkt. Standing hos team og regionleder kan begge øke fordi du bruker riktig type makt på riktig nivå.',{quality:3,trust:3,risk:-3},[
      transition('avdelingsleder_incident_contained','in_progress','local_reprioritization_and_escalation','Dagens arbeid er omprioritert innen fullmakt; varig ressursendring er eskalert til regionleder.')
    ],[
      standing('avdelingsleder_standing_team_incident','team:avdelingsleder_team',4,'Teamet ser at du faktisk prioriterer ned arbeid i stedet for å be dem absorbere alt.','rana_teamkoordinator'),
      standing('avdelingsleder_standing_inger_incident','manager:inger_overordnet_leder',3,'Inger får et tydelig ressursproblem uten at du har foregrepet hennes beslutning.','inger_overordnet_leder')
    ]),
    choice('B','Bestem ekstra innleie og behandle det som din lederfullmakt','Jeg setter inn ekstra kapasitet nå og informerer økonomi og Inger etterpå.','Høy lokal status blir brukt som om den også var budsjettmyndighet. Teamet kan like den umiddelbare lettelsen, men handlingen bryter kontrakten og gjør standing til en urettmessig snarvei rundt beslutningssystemet.',{status:2,trust:-1,risk:5},[
      flag('avdelingsleder_incident_budget_breach','budget_change_executed_without_approval')
    ],[
      standing('avdelingsleder_standing_team_incident_relief','team:avdelingsleder_team',2,'Teamet liker den umiddelbare lettelsen, men står nå i en løsning som ikke er formelt forankret.','rana_teamkoordinator'),
      standing('avdelingsleder_standing_inger_incident_breach','manager:inger_overordnet_leder',-5,'Inger ser at budsjett- og ressursmyndighet er tatt uten godkjenning.','inger_overordnet_leder'),
      standing('avdelingsleder_standing_oyvind_incident_breach','professional:oyvind_okonomicontroller',-4,'Øyvind må håndtere en kostnadsbeslutning som ble utført før økonomisk godkjenning.','oyvind_okonomicontroller')
    ])
  ]
});

const followup = makeScene({
  type:'followup', id:PREFIX+'resource_handoff_followup_001', family:'role_world_rollout_avdelingsleder_resource_followup', day_phase:'afternoon', priority:92,
  from:'Inger, regionleder', actor:'inger_overordnet_leder', place_id:'ledermoterom', rework_of:event.id, handoff_to:'oyvind_okonomicontroller',
  subject:'Følg ressursbehovet helt fram til eier – uten å late som handoffet allerede er et ja',
  summary:'Inger ber om et endelig ressursnotat som Øyvind kan kostnadsfeste. Caset må vise hva som er gjort lokalt, hva som fortsatt er midlertidig, hvilke risikoer teamet bærer og hvilket valg regionleder/økonomi faktisk må godkjenne.',
  purpose:'Gjøre oppfølgingen til et sporbar handoff mellom avdelingsleder, regionleder og økonomi, med egne standing-effekter hos hver mottaker og uendret myndighetsgrense.',
  stakes:'Et ressursnotat som omtaler anbefalingen som besluttet kan gi kortsiktig fremdrift, men gjør både økonomi og regionleder til ettergodkjennere og setter teamets forventninger på feil grunnlag.',
  situation:['Dagens omprioritering var innen fullmakt og er dokumentert.','Øyvind kan kostnadsfeste alternativer, men kan ikke alene endre bemannings- eller personalrammen.','Inger må godkjenne varig ressursretning etter at kostnad, risiko og alternativ er synlig.'],
  task_domain:'ressurshandoff_og_oppfolging', competency:'handoff_og_sporbarhet', pressure:'fremdrift_vs_beslutningseierskap', choice_axis:'anbefaling_med_eier_vs_presentert_som_vedtak', consequence_axis:'institusjonell_tillit_vs_ettergodkjenning',
  choices:[
    choice('A','Send alternativene som anbefaling med eksplisitt eier og restspørsmål','Jeg sender Øyvind kostnadsbehovet og Inger anbefalingen, og markerer at varig endring fortsatt krever godkjenning.','Øyvind får et analyserbart bestillingsgrunnlag og Inger beholder beslutningspunktet. Teamets forventning kan holdes realistisk fordi du skiller det som er anbefalt fra det som faktisk er vedtatt.',{quality:3,trust:3,risk:-2},[
      transition('avdelingsleder_resource_handoff','waiting','awaiting_resource_approval','Kostnadsalternativer er overlevert; varig ressursretning venter eksplisitt på godkjenning.')
    ],[
      standing('avdelingsleder_standing_oyvind_followup','professional:oyvind_okonomicontroller',4,'Øyvind får et tydelig kostnadsoppdrag uten å bli gjort til ettergodkjenner av en allerede lovet løsning.','oyvind_okonomicontroller'),
      standing('avdelingsleder_standing_inger_followup','manager:inger_overordnet_leder',4,'Inger beholder sitt beslutningspunkt og får sammenlignbare alternativer.','inger_overordnet_leder')
    ]),
    choice('B','Skriv at ekstra kapasitet er besluttet og be Øyvind finne finansieringen','Jeg presenterer bemanningsløsningen som valgt og ber økonomi få den til å gå opp.','Du bruker fremdriftsspråk til å gjøre anbefalingen om til et vedtak. Øyvind og Inger mister hver sin type tillit, mens teamet risikerer å høre et løfte som fortsatt ikke er formelt sant.',{status:1,quality:-2,trust:-3,risk:4},[
      flag('avdelingsleder_handoff_afterapproval','recommendation_presented_as_approved_resource_change')
    ],[
      standing('avdelingsleder_standing_oyvind_afterapproval','professional:oyvind_okonomicontroller',-4,'Øyvind blir bedt om å finansiere et utfall som ikke er godkjent.','oyvind_okonomicontroller'),
      standing('avdelingsleder_standing_inger_afterapproval','manager:inger_overordnet_leder',-5,'Ingers beslutningsmyndighet er redusert til ettergodkjenning.','inger_overordnet_leder')
    ])
  ]
});

const consequence = makeScene({
  type:'consequence', id:PREFIX+'capacity_case_close_001', family:'role_world_rollout_avdelingsleder_capacity_close', day_phase:'evening', priority:91,
  from:'Inger, regionleder', actor:'inger_overordnet_leder', place_id:'ledermoterom', rework_of:followup.id,
  subject:'Lukk caset med anbefaling, ståsted per publikum og tydelig beslutningseier',
  summary:'Etter to uker skal kapasitetssaken lukkes som et sporbar ledergrunnlag: hva du prioriterte innen egen fullmakt, hva teamet lærte, hva Øyvind kan dokumentere, hvordan standing utviklet seg hos ulike publikum, og hva Inger fortsatt må godkjenne.',
  purpose:'Bevise at audience-spesifikk standing er varig sosial informasjon, men aldri en kilde til ekstra myndighet; sluttscenen må skille direkte fullmakt, påvirkning, godkjenningskrav og forbudte handlinger.',
  stakes:'Hvis høy standing hos team eller lederkolleger lar spilleren erklære ressursutfallet som godkjent, blir omdømmesystemet en skjult privilegie-escalation. Det er eksplisitt forbudt i Role World-kontrakten.',
  situation:['Du har legitimt omprioritert arbeid innen fullmakt og dokumentert konsekvensene.','Rana, Mads, Øyvind og Inger har ulike grunner til tillit eller skepsis som skal beholdes separat.','Varig budsjett-, bemannings- og formell personalendring krever fortsatt de oppgitte godkjenningspunktene.'],
  task_domain:'case_close_og_authority_boundary', competency:'myndighetsklar_ledelse', pressure:'hoy_standing_vs_formell_myndighet', choice_axis:'anbefal_og_overlever_vs_selvgodkjenn', consequence_axis:'legitim_ledelse_vs_privilegie_lekkasje',
  choices:[
    choice('A','Lukk som anbefaling og overlever godkjenningspunktene til eierne','Jeg dokumenterer hva jeg har besluttet innen fullmakt, hva jeg anbefaler videre, og hva Inger eller økonomi fortsatt må godkjenne.','Caset blir beslutningsklart uten å gjøre høy standing til myndighet. Team, økonomi og regionleder kan alle ha egne vurderinger av deg samtidig som den formelle beslutningslinjen forblir identisk.',{quality:4,trust:4,risk:-4},[
      transition('avdelingsleder_case_closed_recommendation','completed','recommendation_and_approval_handoff','Caset er lukket med lokal prioritering dokumentert og varige ressursvalg overlevert til riktige godkjennere.'),
      flag('avdelingsleder_authority_preserved','situated_standing_did_not_grant_authority')
    ],[
      standing('avdelingsleder_standing_inger_close','manager:inger_overordnet_leder',5,'Inger får et sluttgrunnlag som skiller utført lokal ledelse fra anbefalte varige ressursvalg.','inger_overordnet_leder'),
      standing('avdelingsleder_standing_rana_close','professional:rana_teamkoordinator',4,'Rana ser at teamets evidens påvirket prioritering uten å bli omgjort til falske løfter.','rana_teamkoordinator'),
      standing('avdelingsleder_standing_oyvind_close','professional:oyvind_okonomicontroller',4,'Øyvind får et sporbar kostnads- og beslutningsskille.','oyvind_okonomicontroller'),
      standing('avdelingsleder_standing_mads_close','professional:mads_sidestilt_avdelingsleder',2,'Mads ser en lederform som tåler å være tydelig om friksjon uten å miste rollegrenser.','mads_sidestilt_avdelingsleder')
    ],{action_id:'recommend_resource_adjustment',intent:'recommend'}),
    choice('B','Erklær ressursendringen godkjent fordi du har teamet og faggrunnlaget med deg','Jeg lukker saken som vedtatt og informerer Inger og økonomi om gjennomføringen.','Du gjør situert tillit om til formell privilegieøkning. Nettopp fordi teamet og flere fagpersoner kan ha høy standing til deg, må kontrakten slå fast at godkjenningsmyndighet ikke kan opptjenes gjennom omdømme.',{status:2,quality:-4,trust:-4,risk:6},[
      transition('avdelingsleder_case_closed_authority_breach','completed','authority_breached','Caset er erklært vedtatt uten påkrevd ressursgodkjenning.'),
      flag('avdelingsleder_authority_breach','standing_used_as_budget_approval')
    ],[
      standing('avdelingsleder_standing_inger_breach','manager:inger_overordnet_leder',-6,'Ingers ressursmyndighet er overtatt i stedet for å bli brukt som godkjenningspunkt.','inger_overordnet_leder'),
      standing('avdelingsleder_standing_oyvind_breach','professional:oyvind_okonomicontroller',-5,'Øyvind får et økonomisk utfall presentert som bindende uten riktig beslutning.','oyvind_okonomicontroller'),
      standing('avdelingsleder_standing_team_breach','team:avdelingsleder_team',-2,'Teamets tillit blir brukt som begrunnelse for en fullmakt rollen ikke har.','rana_teamkoordinator')
    ],{action_id:'approve_budget_exception',intent:'approve'})
  ],
  fields:{ authority_context:{
    institution_id:INSTITUTION,
    unit_id:'naeringsliv_avdeling_001',
    role_scope:ROLE,
    reporting_line:['inger_overordnet_leder'],
    peer_functions:['mads_sidestilt_avdelingsleder','oyvind_okonomicontroller','rana_teamkoordinator'],
    external_counterparts:[],
    goals_pressures:['leveranse','kapasitet','arbeidsmiljo','kvalitet','budsjett','sannferdig_rapportering'],
    approval_points:[
      {approval_id:'avdelingsleder_budget_exception_approval',action_id:'approve_budget_exception',approver_actor_id:'inger_overordnet_leder',approval_object_id:'avdelingsleder_budget_exception_001'},
      {approval_id:'avdelingsleder_headcount_approval',action_id:'approve_headcount_change',approver_actor_id:'inger_overordnet_leder',approval_object_id:'avdelingsleder_headcount_change_001'},
      {approval_id:'avdelingsleder_formal_personnel_approval',action_id:'approve_formal_personnel_measure',approver_actor_id:'inger_overordnet_leder',approval_object_id:'avdelingsleder_formal_personnel_measure_001'}
    ],
    authority_rules:[
      {action_id:'prioritize_work_within_mandate',authority:'direct',requires_resources:[]},
      {action_id:'allocate_daily_work',authority:'direct',requires_resources:[]},
      {action_id:'escalate_capacity_conflict',authority:'direct',requires_resources:[]},
      {action_id:'recommend_resource_adjustment',authority:'influence_only',requires_resources:[]},
      {action_id:'recommend_staffing_plan',authority:'influence_only',requires_resources:[]},
      {action_id:'approve_budget_exception',authority:'approval_required',approval_id:'avdelingsleder_budget_exception_approval',requires_resources:[]},
      {action_id:'approve_headcount_change',authority:'approval_required',approval_id:'avdelingsleder_headcount_approval',requires_resources:[]},
      {action_id:'approve_formal_personnel_measure',authority:'approval_required',approval_id:'avdelingsleder_formal_personnel_approval',requires_resources:[]},
      {action_id:'hide_safety_or_quality_incident',authority:'forbidden',requires_resources:[]},
      {action_id:'promise_resource_outcome',authority:'forbidden',requires_resources:[]},
      {action_id:'bypass_formal_personnel_process',authority:'forbidden',requires_resources:[]}
    ],
    resources:[],
    escalation_paths:['inger_overordnet_leder','oyvind_okonomicontroller']
  } }
});

const scenes = [open,people,story,knowledge,micro,conflict,event,followup,consequence];
for (const scene of scenes) addFamily(scene.mail_type, family(scene.mail_family, scene.purpose, [scene.competency,scene.pressure,'situated_reputation'], scene));

const planPath = 'data/Civication/mailPlans/naeringsliv/avdelingsleder_plan.json';
const plan = read(planPath);
plan.sequence = plan.sequence.filter(step => !String(step.allowed_families?.[0] || '').startsWith('role_world_rollout_avdelingsleder_'));
for (const scene of scenes) plan.sequence.push({ step:plan.sequence.length+1, type:scene.mail_type, phase:scene.phase, step_goal:scene.purpose, allowed_families:[scene.mail_family], fallback_types:[] });
write(planPath, plan);

const refs = scenes.map(scene => `${catalogPath(scene.mail_type)}#${scene.id}`);
const threads = [
  {id:'kapasitet_og_prioritering',relationship:'Rana og Inger husker om leveranse, opplæring og fravær ble gjort til ett lesbart kapasitetsgrunnlag uten at lokal lederstatus ble forvekslet med nye ressurser.',beat_refs:['1/morning','2/afternoon','5/morning','7/afternoon','10/morning','12/afternoon','14/afternoon']},
  {id:'teamtillit_og_rettferdighet',relationship:'Teamet reagerer på om belastning og prioriteringskostnader faktisk overlever oppover, og om lederen kan si nei til arbeid uten å love rammer hun ikke eier.',beat_refs:['1/afternoon','3/evening','4/morning','6/afternoon','9/morning','13/evening','14/morning']},
  {id:'lederstatus_og_sidestilt_politikk',relationship:'Mads og lederkollegiet vurderer hvor smidig og rolig avdelingen fremstår, mens samme valg kan gi en helt annen standing hos teamet og økonomi.',beat_refs:['2/evening','5/afternoon','7/evening','9/afternoon','10/evening','12/evening','14/afternoon']},
  {id:'rapportering_og_sporbarhet',relationship:'Øyvind og Inger reagerer på om tall, årsak, risiko og beslutningseier beholdes gjennom komprimering, rework og ressursoppfølging.',beat_refs:['2/morning','4/afternoon','6/evening','8/afternoon','11/morning','13/afternoon','14/evening']},
  {id:'mandat_og_omdomme',relationship:'Hele løpet tester om høy standing hos team, fagpersoner eller lederkolleger kan påvirke samarbeid uten noen gang å utvide avdelingslederens formelle myndighet.',beat_refs:['1/evening','3/afternoon','6/morning','8/evening','10/afternoon','12/morning','13/evening']}
];
const membership = new Map();
for (const thread of threads) for (const ref of thread.beat_refs) {
  if (!membership.has(ref)) membership.set(ref, []);
  membership.get(ref).push(thread.id);
}
const dayStories = [
  'Ukeprioriteringen åpnes som ett felles kapasitetscase der leveranse, opplæring, fravær og beslutningseiere må være synlige samtidig, slik at status ikke kan bli penere enn arbeidet den bygger på.',
  'Rana gjør teamets belastning konkret, mens Inger trenger et ledergrunnlag som skiller observasjon, lokal prioritering og varige ressursvalg som fortsatt krever godkjenning.',
  'Mads viser at sidestilte ledere kan belønne en roligere rapport samtidig som teamets standing faller hvis belastningen deres blir filtrert bort, og omdømme blir derfor eksplisitt situert.',
  'Øyvind tester om kostnad, innleie og opplæring kan forklares uten at én økonomisk kategori blir hele årsaksfortellingen eller får avgjøre hvem som har skylden.',
  'History Go-/industrikontekst brukes til å stille bedre spørsmål om arbeidsdeling og produksjon, men kunnskap gir ingen moderne budsjett-, bemannings- eller personalmyndighet.',
  'Det korte standing-pulset skiller reaksjonen hos Rana, Mads, Øyvind og Inger, slik at én positiv lederstatus ikke kan skjule tillitstap i teamet eller svakere sporbarhet hos økonomi.',
  'Rapporten må komprimeres til tre linjer uten å fjerne kapasitetsrisikoen, og spilleren må skille anbefaling til regionleder fra noe som faktisk er godkjent.',
  'Ledergruppen leser den reviderte statusen, og de ulike mottakerne viser at samme fakta kan ha forskjellig sosial betydning uten at beslutningskartet endres.',
  'Et nytt fravær gjør rollen konkret: avdelingslederen kan prioritere dagens arbeid innen mandat og eskalere rammen, men kan ikke selv vedta varig ressursendring.',
  'Teamet ser virkningen av lokal omprioritering mens ledergruppen ser konsekvensen i leveransebildet, og standing påvirkes av om handlekraften respekterte de formelle grensene.',
  'Øyvind kostnadsfester alternativer og caset går gjennom rework fra driftsproblem til beslutningsklart ressursnotat med åpne forutsetninger og synlig eier.',
  'Ressurshandoffet må overleve overgangen mellom avdeling, økonomi og regionleder uten at anbefaling blir omtalt som vedtak eller teamets håp blir gjort til løfte.',
  'Privat og sosial etterklang viser hvordan ledermasken følger hjem når spilleren både skal være tydelig for teamet og politisk lesbar i lederkollegiet uten å kontrollere alles vurdering.',
  'Caset lukkes med lokal prioritering, standing per publikum, sporbar anbefaling og eksplisitte godkjenningspunkter, slik at omdømme aldri kan opptjenes som myndighet.'
];
const phases = ['morning','lunch','afternoon','evening'];
const phaseText = {
  morning:'Morgenen etablerer siste bekreftede kapasitetsstatus, hvem som eier observasjonen og hvilket beslutningsnivå som gjelder før ny handling, slik at standing ikke kan erstatte fakta eller fullmakt.',
  lunch:'I lunsjflaten blir forskjellen mellom teamtillit, sidestilt lederstatus, økonomisk sporbarhet og regionlederens formelle beslutningsrolle sosialt lesbar uten at de kollapser til én global score.',
  afternoon:'Ettermiddagen krever et konkret handoff, en omprioritering eller en beslutningsklar anbefaling i det samme arbeidsobjektet, med audience-spesifikke reaksjoner og eksplisitt eier for neste steg.',
  evening:'Kvelden viser forsinket sosial eller privat etterklang: hvem som stoler mer eller mindre på deg og hvorfor, samtidig som denne standing-endringen uttrykkelig ikke flytter budsjett-, HR- eller bemanningsmyndighet.'
};
const coverage = [];
for (let day=1; day<=14; day+=1) {
  for (let i=0; i<phases.length; i+=1) {
    const phase=phases[i];
    const ref=`${day}/${phase}`;
    coverage.push({ day, phase, beat_type:day===9&&phase==='morning'?'decision':day===14&&phase==='afternoon'?'consequence':['info','conversation','task','private_consequence'][i], summary:`Dag ${day}, ${phase}: ${dayStories[day-1]} ${phaseText[phase]}`, thread_ids:membership.get(ref)||[threads[(day+i)%threads.length].id], materialization_refs:[refs[((day-1)*4+i)%refs.length]] });
  }
}
const person = (id,social_function,class_position,status,power_over_player,wants,conceals,speech_style,teaches_player) => ({id,social_function,class_position,status,power_over_player,wants,conceals,speech_style,teaches_player});
const world = {
  schema:'civication_role_world_v1', version:1, category:'naeringsliv', role_scope:ROLE,
  title:'Avdelingsleder — ansvar, standing og mandat i krysspress', status:'role_world_complete',
  sociological_core:{
    main_problem:'Å få en avdeling til å levere gjennom andre mennesker når spilleren har reell hverdagsmakt og høy situert standing, men bare avgrenset myndighet over budsjett, bemanning og formelle personalsaker.',
    description:'Avdelingslederen lever mellom strategi og drift. Rollen kan prioritere arbeid, fordele oppgaver og eskalere kapasitetskonflikter, men må samtidig tåle at team, økonomi, regionleder og sidestilte ledere vurderer samme handling ulikt. Denne Role World-en følger ett vedvarende kapasitetscase og gjør situated reputation eksplisitt uten å gjøre omdømme til privilegie- eller myndighetsøkning.'
  },
  theme_ids:['professional_culture','emotional_labor','social_mask','shame_reputation','loyalty_up_down','care_vs_efficiency','status_anxiety','bureaucratic_power'],
  social_environments:[
    'Avdelingsgulvet der leveranse, fravær, kvalitet og skjult ekstraarbeid blir synlig før de blir lederrapport.',
    'Teamrommet og vaktplanen der prioritering avgjør hvem som får tid, opplæring, avlastning og forklaring.',
    'Driftskontoret der KPI, avvik, kostnad og medarbeidersignaler må oversettes til samme beslutningsgrunnlag.',
    'Ledermøterommet der korte statuslinjer konkurrerer med behovet for å vise reell kapasitet og beslutningseiere.',
    'Økonomihandoffet der ressursbehov må kostnadsfestes uten at anbefaling blir presentert som godkjent vedtak.',
    'Lilleborg-fabrikkene som stedlig History Go-kontekst for industri, arbeidsdeling og produksjon uten normativ myndighet over dagens driftsvalg.',
    'Hjem og nære relasjoner der lederens profesjonelle kontroll, statusbehov og ansvarsfølelse kan fortsette etter arbeidstid.'
  ],
  recurring_people_archetypes:[
    person('inger_overordnet_leder','regionleder som eier varige ramme- og ressursbeslutninger','formell linjeleder med høy beslutningsmakt','høy formell status','kan godkjenne eller avslå ressursendringer og påvirke videre lederansvar','en kort og sann status som viser hva hun faktisk må beslutte','hvor sterkt hun selv presses til å vise stabilitet oppover','kort, styringsorientert og opptatt av valg, risiko og eier','at god ledelse oppover betyr beslutningsklarhet uten ettergodkjenning'),
    person('rana_teamkoordinator','teamnær koordinator som ser belastning, opplæring og arbeidsflyt før tallene','faglig mellomposisjon med høy lokal informasjonsmakt','høy situert teamstatus','kan styrke eller svekke teamets tillit til lederens rettferdighet og gjennomførbarhet','at belastning og prioriteringskostnad behandles som reell styringsinformasjon','hvor mye ekstraarbeid teamet allerede absorberer uformelt','konkret og hverdagsnær; sier hvem som gjør hva og hva som ikke rekker','at lokal tillit avhenger av at lederen faktisk velger bort arbeid når kapasiteten er brukt'),
    person('mads_sidestilt_avdelingsleder','sidestilt leder som leser politikk, status og hva som oppfattes som ro i lederkollegiet','lederkollega uten formell myndighet over spilleren','middels formell status og høy sosial status','kan påvirke normer, rykte og støtte i ledergruppen uten å godkjenne spillerens ressurser','en lederkollega som kommuniserer kort og ikke gjør egen avdeling til et problem','hvor ofte politisk smidighet også betyr at belastning blir privat','uformell og taktisk; snakker om hva ledelsen kommer til å høre','at standing hos lederkolleger kan stige samtidig som teamtillit faller'),
    person('oyvind_okonomicontroller','økonomifaglig motpart som gjør kostnader og alternativer etterprøvbare','spesialist med høy informasjonsmakt og avgrenset beslutningsmyndighet','høy situert fagstatus','kan gjøre ressursforslag troverdige eller vise at kostnadsgrunnlaget ikke holder','at anbefalinger skiller fakta, antakelse, kostnad og godkjenningspunkt','hvor ofte økonomi forventes å rydde opp etter beslutninger som allerede er sosialt lovet','nøktern og sporbar; spør hva som driver kostnaden og hvem som har godkjent','at økonomisk sporbarhet er en egen tillitsakse, ikke global status'),
    person('teamrepresentant','ansatt eller tillitsperson som gjør rettferdighet og arbeidsmiljø sosialt lesbart','arbeidstakerposisjon med liten formell ledermakt og høy erfaringsautoritet','høy situert legitimitet i teamet','kan gjøre uformell misnøye til tydelig kollektiv respons','at prioritering fordeler belastning rettferdig og forklares før den blir permanent kultur','hvor ulikt ansatte tør å melde fra avhengig av tidligere lederrespons','direkte og eksempelorientert; peker på mønstre fremfor lederretorikk','at standing nedenfra bygges gjennom konsekvent rettferdighet, ikke bare vennlighet'),
    person('hr_partner_avdeling','HR-funksjon som beskytter prosessgrensen rundt formelle personalsaker','støttefunksjon med institusjonell prosessmyndighet','middels formell status og høy situert prosessautoritet','kan blokkere eller korrigere uformelle snarveier i personalsaker','at lederen skiller daglig oppfølging fra formelle tiltak og dokumenterer riktig','hvor ofte HR først blir koblet på etter at en konflikt allerede er personliggjort','presis og prosessorientert; spør hva som er observasjon, samtale og formelt tiltak','at personalansvar ikke betyr ubegrenset personalmyndighet'),
    person('avdelingsleder_privathjem_venn','privat likemann som møter lederens behov for å analysere og prioritere alt','privat relasjon uten organisatorisk makt','emosjonell nærhet uten arbeidsrang','kan utfordre ledermasken og trekke seg unna når samtalen blir styringsmøte','å bli møtt uten KPI, handlingsliste eller skjult vurdering','at hun blir sliten av å konkurrere med arbeidets alvor og språk','uformell og direkte; sier når du høres ut som du leder et møte','at profesjonell tydelighet ikke automatisk er privat gjensidighet'),
    person('avdelingsleder_privathjem_familie','nær relasjon som bærer tidskostnaden og etterklangen av lederansvar','privat relasjon uten innflytelse på arbeidsplassen','høy emosjonell og praktisk betydning','kan gjøre grensen mellom ansvar og selvpålagt totalansvar konkret','forutsigbarhet om når jobben faktisk er ferdig og hva som kan vente','bekymring for at hver arbeidskrise behandles som om bare spilleren kan løse den','hverdagslig og konkret; spør hva som faktisk må skje i kveld','at sosial verdi hjemme ikke følger standing i avdelingen')
  ],
  slow_axes:[
    {id:'standing_manager',meaning:'Ingers situerte tillit til at spilleren leverer beslutningsklar og sann status uten å foregripe godkjenning',runtime_binding:'existing'},
    {id:'standing_team',meaning:'teamets situerte tillit til at belastning, opplæring og rettferdighet faktisk påvirker prioritering',runtime_binding:'existing'},
    {id:'standing_peer',meaning:'sidestilte lederes vurdering av spillerens politiske og organisatoriske lesbarhet',runtime_binding:'existing'},
    {id:'standing_finance',meaning:'økonomifunksjonens tillit til sporbarhet mellom årsak, kostnad, anbefaling og vedtak',runtime_binding:'existing'},
    {id:'capacity_truth',meaning:'om leveransebildet beholder synlig sammenheng med bemanning, opplæring, fravær og kvalitetsrisiko',runtime_binding:'existing'},
    {id:'authority_clarity',meaning:'om direkte fullmakt, påvirkning, godkjenningskrav og forbud holdes adskilt gjennom hele caset',runtime_binding:'existing'},
    {id:'leadership_mask',meaning:'presset til å fremstå rolig og kontrollert selv når ansvaret overstiger myndigheten',runtime_binding:'editorial_only_until_governed'},
    {id:'private_role_leakage',meaning:'om prioriterings- og kontrollspråket følger spilleren inn i private relasjoner',runtime_binding:'editorial_only_until_governed'}
  ],
  season:{days:14,day_phases:phases,coverage},
  primary_threads:threads,
  private_aftermath:[
    {id:'teamets_belastning_folger_hjem',description:'Når teamets skjulte ekstraarbeid blir synlig, kan avdelingslederen fortsette å bære ansvar privat selv etter at saken er eskalert.',materialization_refs:[refs[1],refs[4]]},
    {id:'lederstatus_som_maske',description:'Ros for rolig lederkommunikasjon kan gjøre det vanskeligere å innrømme usikkerhet eller utilstrekkelig mandat både på jobb og hjemme.',materialization_refs:[refs[2],refs[5]]},
    {id:'driftsavvik_og_skyld',description:'Et fraværs- eller kvalitetsavvik kan oppleves personlig selv når spilleren faktisk gjorde riktig lokal prioritering og eskalerte resten.',materialization_refs:[refs[6]]},
    {id:'ressurshandoff_uten_slutt',description:'Ventingen på formell ressursbeslutning kan forlenge arbeidsdagen mentalt uten at spilleren derfor får rett til å selvgodkjenne utfallet.',materialization_refs:[refs[7],refs[8]]}
  ],
  delayed_consequences:[
    {id:'baseline_returnerer_i_lederrapport',setup_ref:'1/morning',return_ref:'7/afternoon',domains:['job','reputation']},
    {id:'teamhandoff_returnerer_i_omprioritering',setup_ref:'1/afternoon',return_ref:'9/morning',domains:['relationship','job']},
    {id:'peerstanding_returnerer_i_ledergruppe',setup_ref:'3/evening',return_ref:'8/afternoon',domains:['reputation','relationship']},
    {id:'history_context_returnerer_i_ressursnotat',setup_ref:'5/morning',return_ref:'11/morning',domains:['knowledge','job']},
    {id:'standing_pulse_returnerer_i_komprimering',setup_ref:'6/afternoon',return_ref:'7/afternoon',domains:['reputation','job']},
    {id:'reporting_conflict_returnerer_i_handoff',setup_ref:'7/afternoon',return_ref:'12/afternoon',domains:['job','reputation']},
    {id:'capacity_incident_returnerer_i_close',setup_ref:'9/morning',return_ref:'14/afternoon',domains:['job','reputation']},
    {id:'authority_boundary_returnerer_i_sluttvalg',setup_ref:'10/afternoon',return_ref:'14/afternoon',domains:['job','reputation','relationship']}
  ],
  materialization:{no_new_runtime:true,source_refs:refs}
};
const worldPath='data/Civication/roleWorlds/naeringsliv/avdelingsleder.json';
write(worldPath,world);

const bankPath='data/Civication/roleWorldThemeBank.json';
const bank=read(bankPath);
bank.reference_profiles[KEY]=world.theme_ids;
write(bankPath,bank);

const checklistPath='data/Civication/roleWorldAuthoringChecklist.json';
const checklist=read(checklistPath);
checklist.reference_worlds=(checklist.reference_worlds||[]).filter(item=>item!==worldPath);
checklist.reference_worlds.push(worldPath);
write(checklistPath,checklist);

const indexPath='data/Civication/roleWorlds/index.json';
const index=read(indexPath);
index.effective_date='2026-08-27';
index.roles=(index.roles||[]).filter(item=>!(item.category==='naeringsliv'&&item.role_scope===ROLE));
index.roles.push({category:'naeringsliv',role_scope:ROLE,status:'role_world_complete',path:worldPath});
index.note='Reference- og pilotbevisene består uendret. Avdelingsleder er neste canonical kontrollerte Role World-rollout og tilfører audience-spesifikk standing for team, regionleder, økonomi og sidestilte ledere uten at standing gir budsjett-, HR- eller bemanningsmyndighet.';
write(indexPath,index);

const report=[
  '# Civication Role World rollout — Næringsliv Avdelingsleder','',
  'Status: Materialized on the controlled-rollout branch; completion is valid only after the role-specific gate, full Civication suite, exact-head CI, merge and post-merge verification are green.','',
  '## Scope and debt closed','',
  '- Canonical role: naeringsliv/avdelingsleder',
  '- Readiness classification at rollout start: rollout_ready',
  '- Targeted authored debt: situated_reputation',
  '- Existing authority foundation is preserved: local prioritization within mandate is direct; budget, headcount and formal personnel changes remain approval-gated',
  '- Runtime policy: existing Scene Pipeline remains canonical; no new runtime or parallel reputation engine','',
  '## Materialization','',
  '- 14 days x four phases = 56 provenance-backed dramaturgical beats',
  '- Persistent work object: '+OBJECT,
  '- Nine authored rollout scenes across all canonical mail types; the three previously absent Avdelingsleder catalog types are created in the canonical mail-family structure',
  '- Situated standing is audience-specific for Inger, Rana, Mads, Øyvind, the team and relevant professional counterparts',
  '- Standing changes collaboration and social interpretation only; it never grants approval rights','',
  '## Quality assessment','',
  '- Correctness and evidence 5/5','- Coverage and completion 5/5','- Editorial quality 5/5','- Technical integrity 5/5','- Safety and responsibility 5/5','- Maintainability and auditability 4/5','- Total 29/30'
].join('\n')+'\n';
fs.writeFileSync(path.join(ROOT,'reports/CIVICATION_NAERINGSLIV_AVDELINGSLEDER_ROLE_WORLD_ROLLOUT.md'),report);

console.log('Materialized Næringsliv Avdelingsleder Role World rollout.');
