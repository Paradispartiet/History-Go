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

const ROLE = 'finansdirektor';
const KEY = 'naeringsliv/finansdirektor';
const OBJECT = 'naeringsliv_finansdirektor_refinancing_case_001';
const THREAD = 'naeringsliv_finansdirektor_refinancing_realism_001';
const INSTITUTION = 'naeringsliv_konsernfinans_001';
const PREFIX = 'naeringsliv_finansdirektor_realism_';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/finansdirektor.json';
const TYPES = ['job','people','story','knowledge','micro','conflict','event','followup','consequence'];
const tags = ['role_world_realism','controlled_rollout','naeringsliv',ROLE,'persistent_work','situated_reputation'];

const standing = (event_id, audience_id, delta, reason, source_actor_id) => ({ event_id, audience_id, delta, reason, source_actor_id });
const transition = (event_id, to_status, to_phase, note) => ({ op:'transition', event_id, work_object_id:OBJECT, to_status, to_phase, note });
const flag = (event_id, value) => ({ op:'add_flag', event_id, work_object_id:OBJECT, flag:value });
const choice = (id, label, reply, feedback, stats, work_object_ops = [], social_standing_ops = []) => ({
  id, label, reply, effect: id === 'A' ? 2 : -2, feedback,
  effects: { stats, work_object_ops, social_standing_ops }
});
const makeScene = spec => ({
  id: spec.id,
  mail_type: spec.type,
  mail_family: spec.family,
  role_scope: ROLE,
  phase: spec.phase || 'advanced',
  day_phase: spec.day_phase,
  priority: spec.priority,
  cooldown: 10,
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
  narrative_arc: 'fra_refinansieringsbehov_til_sporbart_styrevedtak_og_kapitaletterspill',
  interaction_mode: spec.interaction_mode || 'decision',
  work_context: {
    object_ids: [OBJECT],
    institution_id: INSTITUTION,
    ...(spec.handoff_to ? { handoff_to_actor_id: spec.handoff_to } : {}),
    ...(spec.waiting_for ? { waiting_for_actor_id: spec.waiting_for } : {}),
    ...(spec.rework_of ? { rework_of_scene_id: spec.rework_of } : {}),
    priority: 'high'
  },
  choices: spec.choices,
  ...(spec.fields || {})
});
const family = (id, purpose, learning_focus, mail) => ({ id, purpose, learning_focus, mails:[mail] });
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/finansdirektor_${type}.json`;
const flatten = doc => (doc.families || []).flatMap(row => row.mails || []);
const addFamily = (type, item) => {
  const rel = catalogPath(type);
  const doc = read(rel);
  doc.families = (doc.families || []).filter(existing => existing.id !== item.id);
  doc.families.push(item);
  write(rel, doc);
};

const open = makeScene({
  type:'job', id:PREFIX+'refinancing_case_open_001', family:'role_world_rollout_finansdirektor_case_open', day_phase:'morning', priority:99,
  from:'Nora, daglig leder', actor:'nora_daglig_leder', place_id:'barcode',
  subject:'Refinansieringen må bli ett styrbart kapitalcase før banken blir en tidsfrist',
  summary:'Nora vil sikre finansiering for vekstplanen før eksisterende låneramme blir trang. Du åpner ett refinansieringscase som samler likviditetsbehov, covenantbuffer, renteantakelser, styremandat og åpne spørsmål i samme spor før bankdialogen får sitt eget momentum.',
  purpose:'Etablere ett vedvarende kapitalarbeidsobjekt som senere kan overleveres til banken, stå legitimt i venting, reworkes når vilkår endrer seg og til slutt overleveres til styret uten at forhandling blir forvekslet med bindende fullmakt.',
  stakes:'Hvis finansieringen organiseres som løse presentasjoner og e-poster, kan et tidlig banksignal bli behandlet som om vilkårene allerede er akseptert. Da blir selskapets handlingsrom sosialt låst før styret har sett total kapitalpris, covenant og downside.',
  situation:[
    'Vekstplanen trenger finansiering, men selskapet har fortsatt tid til å sammenligne alternativer og dokumentere en reell covenantbuffer.',
    'Bankkontakten kan diskutere pris og struktur, mens styret må eie vesentlige endringer i kapitalstruktur og bindende forpliktelser.',
    'Du kan lede analyse, forhandle alternativer og anbefale retning; du kan ikke signere eller love finansiering uten nødvendig fullmakt.'
  ],
  task_domain:'refinancing_case_baseline', competency:'kapitalstruktur_og_mandatspor', pressure:'veksttempo_vs_sporbart_kapitalrom',
  choice_axis:'ett_sporbart_refinansieringscase_vs_løse_banksignaler', consequence_axis:'finansiell_tillit_vs_forventningsgjeld',
  choices:[
    choice('A','Lås kapitalbehov, covenantbuffer, beslutningsmandat og åpne vilkår i ett case',
      'Jeg oppretter ett refinansieringscase med behov, downside, covenantbuffer og eksplisitt styregrense før vi går videre med banken.',
      'Nora får retning uten falsk sikkerhet. Banken kan møte ett konsistent kapitalspor, og styret kan senere se hvilke vilkår som faktisk endret seg før beslutningen.',
      {quality:3,trust:2,risk:-2},
      [flag('cfo_case_baseline_traced','capital_need_covenant_and_mandate_traced')],
      [
        standing('cfo_standing_nora_open','manager:nora_daglig_leder',3,'Nora får et kapitalgrunnlag der vekstbehov, covenantbuffer og beslutningsmandat er synlige før bankdialogen blir behandlet som en ferdig finansieringsretning.','nora_daglig_leder'),
        standing('cfo_standing_board_open','professional:styreleder',2,'Styreleder får et senere beslutningsspor som viser hvilke antakelser og fullmaktsgrenser som var kjent før banken presenterte konkrete vilkår.','styreleder')
      ]),
    choice('B','Start bankdialogen med ønsket låneramme og dokumenter mandatet etterpå',
      'Jeg gir banken ønsket finansieringsretning nå og rydder covenant, downside og styremandat når vi har et konkret tilbud å reagere på.',
      'Du skaper tempo, men også forventningsgjeld. Når banken svarer, kan et uformelt utgangspunkt allerede føles som selskapets valgte kapitalstrategi.',
      {status:1,quality:-2,trust:-2,risk:3},
      [flag('cfo_case_baseline_blurred','bank_direction_precedes_mandate_and_downside_lock')],
      [
        standing('cfo_standing_nora_blurred','manager:nora_daglig_leder',-2,'Nora får raskere markedskontakt, men svakere kontroll over hvilke premisser banken kan oppfatte som ledelsens allerede valgte finansieringsretning.','nora_daglig_leder'),
        standing('cfo_standing_board_blurred','professional:styreleder',-3,'Styreleder risikerer å motta et kapitalvalg som sosialt er kommet lenger enn det formelle mandatet, før styret har sett total risiko og fleksibilitet.','styreleder')
      ])
  ],
  fields:{ effects:{ work_object_ops:[{ op:'create', event_id:'cfo_refinancing_case_created', work_object:{
    work_object_id:OBJECT, kind:'refinancing_capital_case', role_scope:ROLE, institution_id:INSTITUTION,
    title:'Refinansieringscase: kapitalbehov, covenant, vilkår og styrevedtak', status:'in_progress', phase:'baseline_and_mandate_lock',
    people_refs:['nora_daglig_leder','bankkontakt','styreleder','eierrepresentant'], place_refs:['barcode','bankplassen','oslo_bors'],
    knowledge_refs:[
      'data/Civication/roleModels/naeringsliv/finansdirektor.json',
      'data/Civication/workGrammars/naeringsliv/finansdirektor.json',
      'data/Civication/mailFamilies/naeringsliv/followup/finansdirektor_followup.json'
    ],
    open_questions:[
      'Hvor stort kapitalbehov tåler downside-scenarioet uten å presse covenantbufferen for langt?',
      'Hvilke finansieringsvilkår kan forhandles administrativt, og hvilke må styret eksplisitt eie?',
      'Hva må banken, daglig leder og styret få vite dersom markedsvilkårene endrer seg før beslutningen?'
    ],
    deadline:'styremote_refinansiering_dag_12', confidentiality:'konfidensielt_kapitalgrunnlag',
    flags:['cfo_refinancing_case_opened'], shared:false
  } }] } }
});

const bank = makeScene({
  type:'people', id:PREFIX+'bank_handoff_wait_001', family:'role_world_rollout_finansdirektor_bank_handoff', day_phase:'afternoon', priority:98,
  from:'Bankkontakt', actor:'bankkontakt', place_id:'bankplassen', handoff_to:'bankkontakt', waiting_for:'bankkontakt', rework_of:open.id,
  subject:'Kredittkomiteen har caset – nå må finansdirektøren tåle en ekte bankventing',
  summary:'Du overleverer låst kapitalbehov, scenario, covenantbuffer og mandat til bankkontakten for kredittbehandling. Mens banken vurderer caset kan du forberede alternative strukturer, men du skal ikke love styret eller Nora at et indikativt banksignal allerede er finansiering.',
  purpose:'Gjøre bank-handoff og legitim venting eksplisitt som del av finansdirektørens arbeidsrytme, samtidig som samme refinansieringscase beholder én autoritativ versjon og ett tydelig beslutningsspor.',
  stakes:'Hvis venting behandles som et tomrom som må fylles med løfter, kan et uavklart bankløp bli presentert internt som sikret kapital. Da blir senere rework tolket som svikt i stedet for normal finansieringsprosess.',
  situation:[
    'Banken eier kredittbehandlingen i denne fasen; finansdirektøren kan svare og forhandle, men ikke kontrollere utfallet.',
    'Nora ønsker en dato og en sannsynlig pris til neste ledermøte, selv om kredittkomiteen ikke har returnert.',
    'Alternativ finansiering kan forberedes uten å opprette et konkurrerende beslutningsspor eller foregripe styrets mandat.'
  ],
  task_domain:'bank_credit_handoff', competency:'finansiering_og_bank', pressure:'intern_forutsigbarhet_vs_legitim_ekstern_venting',
  choice_axis:'sporbar_venting_vs_foregripe_bankutfall', consequence_axis:'bank_og_ledertillit_vs_forventningsgjeld',
  choices:[
    choice('A','Marker caset waiting på banken og bruk tiden på dokumenterte alternativer',
      'Jeg fryser bankgrunnlaget, markerer neste eier og forbereder alternativer uten å omtale finansieringen som avklart.',
      'Ventingen blir synlig arbeid. Banken kan behandle én autoritativ pakke, mens Nora får en presis status som skiller forberedelse fra et faktisk kreditttilsagn.',
      {quality:2,trust:3,risk:-2},
      [
        transition('cfo_case_waiting_for_bank','waiting','awaiting_bank_credit_review','Kapitalgrunnlaget er overlevert; refinansieringscaset venter på bankens kredittbehandling.'),
        flag('cfo_bank_handoff_traced','bank_review_version_frozen')
      ],
      [
        standing('cfo_standing_bank_wait','professional:bankkontakt',4,'Bankkontakten kan stole på at kredittgrunnlaget fortsatt er den autoritative versjonen mens banken behandler pris, covenant og øvrige vilkår.','bankkontakt'),
        standing('cfo_standing_nora_wait','manager:nora_daglig_leder',2,'Nora får en presis ventestatus som skiller sannsynlig finansieringsretning fra et faktisk banktilsagn og lar henne planlegge uten falsk sikkerhet.','nora_daglig_leder')
      ]),
    choice('B','Presenter internt at finansieringen i praksis er sikret mens banken behandler saken',
      'Jeg gir Nora en klar retning nå og omtaler bankløpet som i praksis avklart, med forbehold om endelige detaljer.',
      'Du reduserer ubehaget ved venting, men gjør kredittbehandlingen til en formalitet før banken selv har gjort den. Senere vilkårsendringer får dermed større sosial kostnad.',
      {status:2,quality:-2,trust:-3,risk:4},
      [
        transition('cfo_case_waiting_prejudged_bank','waiting','awaiting_bank_credit_review','Caset venter på banken, men utfallet er sosialt foregrepet internt.'),
        flag('cfo_bank_outcome_prejudged','credit_outcome_presented_as_nearly_certain')
      ],
      [
        standing('cfo_standing_bank_prejudged','professional:bankkontakt',-4,'Bankkontakten opplever at et pågående kredittløp allerede brukes som intern sikkerhet, noe som gjør senere vilkårsforhandling vanskeligere og reduserer rommet for ny informasjon.','bankkontakt'),
        standing('cfo_standing_nora_prejudged','manager:nora_daglig_leder',-2,'Nora får et enklere budskap, men må senere håndtere forventningsbrudd dersom banken priser risikoen eller covenantene annerledes enn antydet.','nora_daglig_leder')
      ])
  ]
});

const rework = makeScene({
  type:'event', id:PREFIX+'rate_covenant_rework_001', family:'role_world_rollout_finansdirektor_rate_rework', day_phase:'morning', priority:97,
  from:'Bankkontakt', actor:'bankkontakt', place_id:'bankplassen', rework_of:bank.id,
  subject:'Rente og covenant flytter seg – samme refinansieringscase må åpnes for rework',
  summary:'Banken returnerer et indikativt term sheet samtidig som markedsrenten har flyttet seg. Finansieringen er fortsatt mulig, men samlet kapitalpris og covenantbuffer er svakere enn baseline. Det gamle grunnlaget var ryddig da det ble sendt, men kan ikke lenger bære styreanbefalingen uendret.',
  purpose:'Bevise at rework etter ekstern handoff er normal finansledelse: nye vilkår må endre samme arbeidsobjekt med synlig endringsspor i stedet for å bli gjemt i muntlige forbehold eller en ny parallell presentasjon.',
  stakes:'Hvis pris- og covenantendringen reduseres til fotnoter, kan styret vedta en kapitalstruktur som ser lik ut, men har mindre strategisk fleksibilitet. Hvis alt bygges om uten spor, forsvinner læringen om hva markedet faktisk endret.',
  situation:[
    'Term sheetet er ikke en bindende avtale, men det er konkret nok til å endre selskapets reelle kapitalalternativer.',
    'Bankkontakten forventer at du sammenligner samlet kostnad, covenant og fleksibilitet før neste forhandlingsrunde.',
    'Nora vil beholde vekstplanen; styret trenger å se om finansieringsrammen fortsatt tåler downside.'
  ],
  task_domain:'rate_and_covenant_rework', competency:'kapitalpris_covenant_og_endringsspor', pressure:'vekstfortelling_vs_nye_bankvilkar',
  choice_axis:'sporbar_rework_vs_beholde_gammelt_hovedbudskap', consequence_axis:'beslutningsrelevans_vs_kapitalblindhet',
  choices:[
    choice('A','Åpne caset for rework og vis eksakt hva rente og covenant gjør med handlingsrommet',
      'Jeg oppdaterer kapitalpris, covenantbuffer og downside i samme case og sender endringssporet til Nora, banken og styregrunnlaget.',
      'Samme refinansieringscase tåler at markedet flytter seg. Banken ser at vilkår behandles reelt, og styret kan skille gammel ambisjon fra ny bæreevne.',
      {quality:3,trust:3,risk:-3},
      [
        transition('cfo_case_rate_rework','in_progress','rate_and_covenant_rework','Nye rente- og covenantvilkår endrer kapitalrommet; samme case åpnes for sporbar rework.'),
        flag('cfo_rate_rework_traced','term_sheet_and_market_change_logged')
      ],
      [
        standing('cfo_standing_bank_rework','professional:bankkontakt',3,'Bankkontakten ser at endrede vilkår faktisk slår inn i selskapets analyse og mandat, slik at neste forhandling bygger på et reelt kapitalrom fremfor et gammelt vekstbudskap.','bankkontakt'),
        standing('cfo_standing_board_rework','professional:styreleder',3,'Styreleder får et beslutningsgrunnlag som viser hva som kommer fra markedet, hva som kommer fra bankens vilkår og hvordan dette endrer selskapets downside og fleksibilitet.','styreleder')
      ]),
    choice('B','Behold styrepresentasjonen og håndter rente- og covenantendringen muntlig',
      'Jeg lar hovedpresentasjonen stå så veksthistorien er stabil, og forklarer de nye vilkårene muntlig når styret spør.',
      'Historien flyter bedre, men modellen ligger bak kapitalmarkedet. Banken og styret får mindre grunnlag for å vite om rådet faktisk tåler de vilkårene selskapet nå kan få.',
      {status:2,quality:-3,trust:-3,risk:5},
      [
        transition('cfo_case_rate_rework_avoided','in_progress','rate_and_covenant_rework','Nye vilkår er kjent, men hovedgrunnlaget holdes i gammel form.'),
        flag('cfo_terms_reduced_to_footnote','material_financing_change_not_reworked_into_case')
      ],
      [
        standing('cfo_standing_bank_footnote','professional:bankkontakt',-3,'Bankkontakten ser at vesentlige vilkår behandles som presentasjonsdetaljer fremfor som faktiske rammer for kapitalstruktur og forhandling.','bankkontakt'),
        standing('cfo_standing_board_footnote','professional:styreleder',-4,'Styreleder får et penere hovedbudskap, men svakere mulighet til å forstå hvordan rente, covenant og fleksibilitet faktisk har endret beslutningen siden baseline.','styreleder')
      ])
  ]
});

const board = makeScene({
  type:'followup', id:PREFIX+'board_handoff_wait_001', family:'role_world_rollout_finansdirektor_board_wait', day_phase:'afternoon', priority:96,
  from:'Styreleder', actor:'styreleder', place_id:'oslo_bors', handoff_to:'styreleder', waiting_for:'styreleder', rework_of:rework.id,
  subject:'Finansieringsrådet er klart – nå må CFO overlevere og vente på styrets faktiske mandat',
  summary:'Reworket er ferdig og bankalternativene er forhandlet til et beslutningsklart nivå. Du kan anbefale struktur, forklare downside og peke på foretrukne vilkår, men styret må eie den vesentlige kapitalbeslutningen. Samme case går derfor fra aktiv forhandling til eksplisitt waiting på styret.',
  purpose:'Koble venting direkte til finansdirektørens fullmaktsgrense: høy standing hos Nora, banken eller styreleder kan gi innflytelse, men kan aldri gjøre en anbefaling eller term sheet til bindende selskapshandling uten riktig beslutning.',
  stakes:'Hvis finansdirektøren sosialt behandler styrevedtaket som gitt, kan banken og organisasjonen begynne å handle som om kapitalen allerede er bundet. Da blir formell governance en etterkontroll i stedet for faktisk beslutning.',
  situation:[
    'Styret har fått total kapitalpris, covenantbuffer, downside og forhandlingsalternativer i samme spor.',
    'Banken kan holde vilkår åpne en kort periode, men kan ikke få et bindende ja fra deg uten nødvendig fullmakt.',
    'Nora vil vite hva hun kan kommunisere til organisasjonen mens styret behandler anbefalingen.'
  ],
  task_domain:'board_capital_handoff', competency:'styre_og_eierkommunikasjon', pressure:'transaksjonstempo_vs_formell_kapitalmyndighet',
  choice_axis:'overlevere_og_vente_vs_foregripe_styrevedtak', consequence_axis:'governance_tillit_vs_mandatlekkasje',
  choices:[
    choice('A','Overlever anbefalingen som råd og marker caset waiting på styrets beslutning',
      'Jeg sender anbefaling, vilkår og downside til styret og markerer at bindende kapitalbeslutning venter på styrets mandat.',
      'Du gir banken og Nora et tydelig neste steg uten å låne styrets myndighet. Ventingen blir en styrt fase i kapitalcaset, ikke et signal om at beslutningen allerede finnes.',
      {quality:2,trust:3,risk:-3},
      [
        transition('cfo_case_waiting_for_board','waiting','awaiting_board_decision','Forhandlet finansieringsgrunnlag er overlevert; caset venter på styrets kapitalbeslutning.'),
        flag('cfo_board_handoff_traced','recommendation_separated_from_binding_capital_decision')
      ],
      [
        standing('cfo_standing_board_wait','professional:styreleder',4,'Styreleder får et klart skille mellom CFOens finansielle anbefaling og styrets egen beslutning, slik at ansvar og fullmakt forblir etterprøvbar også under tidspress.','styreleder'),
        standing('cfo_standing_nora_boardwait','manager:nora_daglig_leder',3,'Nora vet hva hun kan planlegge og hva hun ennå ikke kan kommunisere som besluttet, uten at finansdirektørens faglige tyngde blir brukt som erstatning for styrevedtak.','nora_daglig_leder')
      ]),
    choice('B','Gi banken et uformelt ja og behandle styremøtet som siste formalitet',
      'Jeg signaliserer at vi går for løsningen og ber banken holde vilkårene, så kan styret formalisere beslutningen etterpå.',
      'Du beskytter tempoet ved å flytte forventning foran mandat. Banken og organisasjonen kan nå lese et uformelt signal som om selskapet allerede har bundet seg.',
      {status:2,quality:-2,trust:-4,risk:5},
      [
        transition('cfo_case_waiting_board_prejudged','waiting','awaiting_board_decision','Caset venter formelt på styret, men spilleren har sosialt foregrepet bindende retning.'),
        flag('cfo_board_outcome_prejudged','bank_received_commitment_like_signal_before_board_decision')
      ],
      [
        standing('cfo_standing_board_prejudged','professional:styreleder',-5,'Styreleder må behandle en sak der finansdirektøren allerede har skapt ekstern forventning om utfallet, noe som svekker styrets faktiske beslutningsrom.','styreleder'),
        standing('cfo_standing_bank_precommit','professional:bankkontakt',-3,'Bankkontakten mottar et signal som ligner en forpliktelse før riktig beslutningsorgan har godkjent vilkårene, og fullmaktsgrensen blir vanskeligere å lese.','bankkontakt')
      ])
  ]
});

const aftermath = makeScene({
  type:'consequence', id:PREFIX+'board_aftermath_001', family:'role_world_rollout_finansdirektor_board_aftermath', day_phase:'evening', priority:95,
  from:'Styreleder', actor:'styreleder', place_id:'oslo_bors', rework_of:board.id,
  subject:'Styret har vedtatt kapitalretningen – nå må løfter, mandat og senere konsekvens holdes adskilt',
  summary:'Styret har tatt sin beslutning. Caset skal lukkes med baseline, bank-handoff, venting, rente-/covenant-rework, finansdirektørens anbefaling og styrets faktiske vedtak som separate lag. Senere likviditet eller vekst skal kunne spores tilbake uten at CFO omskriver hvem som eide beslutningen.',
  purpose:'Materialisere kapitaletterspill og governance-læring: et godt resultat gjør ikke et mandatbrudd riktig, og et stramt senere kapitalrom gjør ikke nødvendigvis en sporbar, riktig autorisert beslutning faglig svak.',
  stakes:'Hvis finansdirektøren bruker senere utfall til å omskrive mandatet eller premissene, mister styret og banken institusjonelt minne. Da kan neste finansieringsrunde gjenta samme forventnings- og covenantfeil uten å vite hvor den oppstod.',
  situation:[
    'Styrets vedtak er et eget institusjonelt lag og må ikke framstilles som en automatisk forlengelse av CFOens anbefaling.',
    'Caset inneholder nå bankventing, vilkårsrework og styrehandoff i samme arbeidsobjekt.',
    'Eierrepresentanten og Nora vil raskt vite hva beslutningen betyr for vekst, buffer og fremtidig handlingsrom.'
  ],
  task_domain:'capital_decision_aftermath', competency:'governance_og_kapitalminne', pressure:'beskytte_status_vs_bevare_beslutningsspor',
  choice_axis:'lukk_med_mandat_og_premiss_vs_omskriv_som_cfo_seier', consequence_axis:'langsiktig_tillit_vs_resultatdrevet_makt',
  choices:[
    choice('A','Lukk caset med anbefaling, styrevedtak, vilkår og læringspunkter som separate lag',
      'Jeg arkiverer hva vi anbefalte, hvilke vilkår styret faktisk godkjente og hvilke fremtidige triggere som skal åpne caset igjen.',
      'Refinansieringen blir institusjonelt minne fremfor en prestisjehistorie. Nora, banken, styret og eierne kan senere forstå både beslutning og konsekvens uten å flytte ansvar bakover.',
      {quality:3,trust:3,risk:-2},
      [
        transition('cfo_case_closed_with_board_record','closed','board_decision_recorded','Styrets beslutning, CFO-anbefalingen og de faktiske finansieringsvilkårene er skilt og dokumentert; caset lukkes.'),
        flag('cfo_case_learning_closed','board_decision_and_finance_advice_recorded_separately')
      ],
      [
        standing('cfo_standing_board_aftermath','professional:styreleder',3,'Styreleder får et etterprøvbart kapitalminne der styrets vedtak, CFOens råd og de faktiske vilkårene er separate, slik at senere prioritering ikke omskriver hvem som eide beslutningen.','styreleder'),
        standing('cfo_standing_bank_aftermath','professional:bankkontakt',2,'Bankkontakten ser at selskapet dokumenterer vilkår og beslutningsspor konsistent, noe som gjør senere covenant- eller refinansieringsdialog mer troverdig.','bankkontakt'),
        standing('cfo_standing_nora_aftermath','manager:nora_daglig_leder',2,'Nora får et tydelig bilde av hvilket kapitalrom styret faktisk har kjøpt og hvilke fremtidige triggere som må bringes tilbake til finansfunksjonen eller styret.','nora_daglig_leder')
      ]),
    choice('B','Oppsummer refinansieringen som CFOens vellykkede gjennomføring og ton ned beslutningsgrensene',
      'Jeg lager en kort suksessoppsummering rundt sikret kapital og bruker ikke plass på hvem som eide hvert mandat og hvilke vilkår som flyttet seg.',
      'Du får en sterkere prestasjonsfortelling, men svakere institusjonelt minne. Senere kan både gode og dårlige utfall feilaktig bli lest som bevis på én persons dømmekraft.',
      {status:2,quality:-3,trust:-2,risk:3},
      [
        transition('cfo_case_closed_with_status_bias','closed','board_decision_recorded','Caset lukkes, men læringen domineres av statusfortelling fremfor mandat og premiss.'),
        flag('cfo_status_bias','later_story_overwrites_authority_and_decision_time_reasoning')
      ],
      [
        standing('cfo_standing_board_statusbias','professional:styreleder',-3,'Styreleder mister et presist beslutningsminne når CFOens gjennomføringsfortelling får overskygge styrets mandat, vilkårene som endret seg og hvem som tok den bindende beslutningen.','styreleder'),
        standing('cfo_standing_bank_statusbias','professional:bankkontakt',-2,'Bankkontakten får et mindre etterprøvbart bilde av hvordan selskapet faktisk vurderte og godkjente finansieringen, noe som svekker læring ved neste forhandling.','bankkontakt'),
        standing('cfo_standing_nora_statusbias','manager:nora_daglig_leder',-2,'Nora får et enklere suksessnarrativ, men mindre støtte til å skille finansdirektørens faglige innflytelse fra styrets formelle kapitalmyndighet.','nora_daglig_leder')
      ])
  ]
});

addFamily('job', family('role_world_rollout_finansdirektor_case_open','Åpner ett vedvarende refinansieringscase med kapitalbehov, covenant og mandatspor.',['persistent_work_object','capital_structure','authority_boundary'],open));
addFamily('people', family('role_world_rollout_finansdirektor_bank_handoff','Gjør bankens kredittbehandling til eksplisitt handoff med legitim venting.',['handoff','waiting','bank_trust'],bank));
addFamily('event', family('role_world_rollout_finansdirektor_rate_rework','Lar rente og covenant åpne samme kapitalcase for sporbar rework.',['rework','refinancing','covenant'],rework));
addFamily('followup', family('role_world_rollout_finansdirektor_board_wait','Overleverer CFO-anbefalingen til styret og gjør venting på faktisk kapitalmyndighet eksplisitt.',['handoff','waiting','governance'],board));
addFamily('consequence', family('role_world_rollout_finansdirektor_board_aftermath','Lukker caset med skille mellom CFO-råd, styrevedtak, vilkår og situert standing.',['aftermath','governance','situated_reputation'],aftermath));

const planPath = 'data/Civication/mailPlans/naeringsliv/finansdirektor_plan.json';
const plan = read(planPath);
const rolloutFamilies = new Set([
  'role_world_rollout_finansdirektor_case_open','role_world_rollout_finansdirektor_bank_handoff',
  'role_world_rollout_finansdirektor_rate_rework','role_world_rollout_finansdirektor_board_wait',
  'role_world_rollout_finansdirektor_board_aftermath'
]);
plan.sequence = (plan.sequence || []).filter(step => !(step.allowed_families || []).some(id => rolloutFamilies.has(id)));
const start = plan.sequence.length;
[
  ['job','advanced','Åpne ett vedvarende refinansieringscase med sporbar kapitalbehov, covenantbuffer og styremandat.','role_world_rollout_finansdirektor_case_open',['people','knowledge','event']],
  ['people','advanced','Overlever låst bankpakke og gjør kredittbehandlingens legitime venting synlig uten å foregripe utfallet.','role_world_rollout_finansdirektor_bank_handoff',['event','followup','job']],
  ['event','mastery','Rework samme kapitalcase når rente og covenant endrer handlingsrommet etter bank-handoff.','role_world_rollout_finansdirektor_rate_rework',['job','conflict','knowledge']],
  ['followup','climax','Overlever finansieringsrådet til styret og vent på faktisk kapitalmyndighet.','role_world_rollout_finansdirektor_board_wait',['people','conflict','story']],
  ['consequence','climax','Lukk caset med styrevedtak, vilkår og governance-læring som separate lag.','role_world_rollout_finansdirektor_board_aftermath',['story','knowledge','people']]
].forEach((row, i) => plan.sequence.push({step:start+i+1,type:row[0],phase:row[1],step_goal:row[2],allowed_families:[row[3]],fallback_types:row[4]}));
write(planPath, plan);

const firstExistingId = type => {
  const mails = flatten(read(catalogPath(type)));
  if (!mails.length) throw new Error(`No existing ${type} mail for ${KEY}`);
  return mails[0].id;
};
const refs = {
  job:`${catalogPath('job')}#${open.id}`,
  people:`${catalogPath('people')}#${bank.id}`,
  story:`${catalogPath('story')}#${firstExistingId('story')}`,
  knowledge:`${catalogPath('knowledge')}#${firstExistingId('knowledge')}`,
  micro:`${catalogPath('micro')}#${firstExistingId('micro')}`,
  conflict:`${catalogPath('conflict')}#${firstExistingId('conflict')}`,
  event:`${catalogPath('event')}#${rework.id}`,
  followup:`${catalogPath('followup')}#${board.id}`,
  consequence:`${catalogPath('consequence')}#${aftermath.id}`
};
const refCycle = TYPES.map(type => refs[type]);
const phaseTypes = {morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence'};
const threadByPhase = {morning:'kapital_og_mandatspor', lunch:'bank_styre_og_tillit', afternoon:'venting_handoff_og_rework', evening:'cfo_identitet_og_etterspill'};
const dayThemes = [
  'Refinansieringscaset åpnes med kapitalbehov, covenantbuffer og fullmaktsgrense i ett spor før markedskontakt blir til forventning.',
  'Bank-handoffet gjør kredittbehandling og venting til eksplisitt arbeid; spilleren kan forberede alternativer uten å foregripe bankens beslutning.',
  'Covenant og likviditetsberedskap brukes til å kvalitetssikre samme kapitalcase mens banken arbeider med sine egne prosesser.',
  'Nora trenger en tydelig vekstretning, men situert standing hos daglig leder kan ikke gjøre uavklart finansiering mer sikker enn den er.',
  'Nye rente- og term-sheet-vilkår bryter inn og tvinger samme refinansieringscase tilbake til rework med synlig endringsspor.',
  'Banken, Nora og styret leser samme rework fra ulike ståsteder: kreditt, strategi og governance må derfor forbli separate publikumsflater.',
  'Kapitalpris, covenantbuffer og downside samles i en anbefaling som viser hva selskapet faktisk kjøper av fleksibilitet og risiko.',
  'Eier- og vekstpress gjør et raskt ja sosialt attraktivt, men CFOens anbefaling må fortsatt skilles fra bindende kapitalmyndighet.',
  'Caset overlever nye spørsmål uten å miste baseline, bank-handoff eller hvem som eier neste handling og beslutning.',
  'Finansdirektøren forbereder styrehandoffet og gjør eksplisitt hva som kan forhandles videre og hva bare styret kan godkjenne.',
  'Anbefalingen er ferdig, men spilleren må tåle waiting på styret uten å kommunisere finansieringen som allerede besluttet.',
  'Styret behandler kapitalvalget; høy standing kan gi CFOens råd stor vekt, men kan aldri oppgradere råd til bindende vedtak.',
  'Styrets beslutning returnerer og samme arbeidsobjekt går fra waiting til beslutningsetterspill med mandat og vilkår som separate lag.',
  'Caset lukkes med governance-læring og privat etterklang: kontrollbehov og status må ikke omskrive hvem som eide risikoen og beslutningen.'
];
const coverage = [];
for (let day=1; day<=14; day += 1) {
  for (const [pi, phase] of ['morning','lunch','afternoon','evening'].entries()) {
    const idx = (day-1)*4 + pi;
    coverage.push({
      day, phase, beat_type:phaseTypes[phase],
      summary:`Dag ${day}, ${phase}: ${dayThemes[day-1]} ${phase === 'morning' ? 'Morgenen låser siste bekreftede kapitalpremiss, covenantstatus og neste eier før nye signaler blir behandlet som fakta.' : phase === 'lunch' ? 'Lunsjflaten gjør forskjellen mellom Noras strategibehov, bankens kredittperspektiv og styrets formelle kapitalmyndighet sosialt lesbar.' : phase === 'afternoon' ? 'Ettermiddagen krever konkret arbeid i samme case: handoff, bankdialog, scenario, rework eller beslutningsklar styreanbefaling med sporbar neste eier.' : 'Kvelden viser hva venting, kontrollbehov og høy status gjør med CFOens identitet når kapitalprosessen ikke kan løses ved å love et utfall.'}`,
      thread_ids:[threadByPhase[phase]],
      materialization_refs:[refCycle[idx % refCycle.length]]
    });
  }
}
const thread = (id, relationship, beat_refs) => ({id, relationship, beat_refs});
const world = {
  schema:'civication_role_world_v1', version:1, category:'naeringsliv', role_scope:ROLE,
  title:'Finansdirektør — refinansiering, venting, rework og kapitalmyndighet', status:'role_world_complete',
  sociological_core:{
    main_problem:'Å gjøre selskapets kapitalbehov beslutningsklart uten at vekstpress, banktempo eller CFOens høye standing gjør indikative vilkår til løfter eller faglig innflytelse til bindende kapitalmyndighet.',
    description:'Denne Role World-en følger ett vedvarende refinansieringscase fra kapital- og mandatlås via bank-handoff, legitim venting og rente-/covenantdrevet rework til styrebehandling og kapitaletterspill. Nora, banken, styret og eierne vurderer samme arbeid fra ulike ståsteder, mens fullmaktsgrensen forblir uendret: finansdirektøren kan analysere, forhandle og anbefale, men kan ikke binde selskapet uten nødvendig mandat.'
  },
  theme_ids:['professional_culture','numerical_control','status_anxiety','shame_reputation','loyalty_up_down','social_mask','bureaucratic_power','public_private_leakage'],
  social_environments:[
    'Barcode-kontoret der vekstplan, likviditetsbehov og styreforberedelse gjør kapitalvalg til både faglige og politiske spørsmål.',
    'Bankplassen som History Go-kontekst for kreditt, finansinstitusjoner og tillit uten at stedstilknytningen gir spilleren noen moderne institusjonell fullmakt.',
    'Oslo Børs som stedlig kontekst for kapital, markedsrente og eierforventninger som kan endre selskapets finansielle handlingsrom raskt.',
    'Bankens kredittprosess der refinansieringscaset legitimt kan stå i waiting mens pris, covenant og vilkår behandles av en ekstern beslutningskjede.',
    'Lederflaten med Nora der strategisk tempo og behovet for sikre budskap trekker mot tydeligere løfter enn finansieringen faktisk tåler.',
    'Styret der CFOens faglige tyngde stopper ved anbefalingen og bindende kapitalmyndighet må forbli hos riktig beslutningsorgan.',
    'Den private kvelden etter styremøtet der kontroll, status og ansvar kan følge finansdirektøren hjem selv når beslutningen var institusjonelt delt.'
  ],
  recurring_people_archetypes:[
    {id:'nora_daglig_leder',social_function:'daglig leder som trenger finansielt handlingsrom for strategi og vekst',class_position:'øverste operative leder med høy formell makt og sterkt behov for kapitalforutsigbarhet',status:'svært høy formell status',power_over_player:'kan prioritere strategi, sette tempo og evaluere finansdirektørens bidrag, men kan ikke alene gjøre alle styrepliktige kapitalvalg bindende',wants:'en finansieringsretning som gir vekstkapasitet uten uventede covenant- eller likviditetsproblemer',conceals:'hvor mye organisasjonens forventninger allerede bygger på at finansieringen skal lykkes',speech_style:'strategisk og kort; spør hva vi kan gjøre, når pengene er sikre og hva som kan stoppe planen',teaches_player:'at tydelighet for ledelsen må bygges på faktisk kapitalrom, ikke på ønsket forutsigbarhet'},
    {id:'bankkontakt',social_function:'bankens relasjons- og kredittflate som priser risiko og formidler vilkår mellom selskap og bank',class_position:'ekstern profesjonell motpart med høy informasjons- og forhandlingsmakt',status:'høy situert status i finansieringsprosessen',power_over_player:'kan påvirke pris, covenant og prosess, men kan ikke bestemme selskapets interne mandat eller styrets endelige kapitalvalg',wants:'et troverdig grunnlag med realistisk downside, tydelig likviditetsbehov og ledelse som ikke foregriper kredittbeslutningen',conceals:'hvor mye bankens egen appetitt, kapitalbruk og interne kredittprosess kan flytte vilkårene etter første positive signal',speech_style:'kontrollert og vilkårsorientert; skiller indikasjon, term sheet, kredittgodkjenning og bindende dokumentasjon',teaches_player:'at bankdialog har flere beslutningsnivåer og at venting ikke er det samme som manglende fremdrift'},
    {id:'styreleder',social_function:'leder beslutningsorganet som må eie vesentlige endringer i kapitalstruktur og risikoramme',class_position:'øverste governance-posisjon over finansdirektørens faglige anbefaling i styrepliktige saker',status:'svært høy formell status',power_over_player:'kan utfordre, godkjenne eller avvise kapitalanbefalingen og påvirke CFOens standing, men skal få et selvstendig og etterprøvbart beslutningsgrunnlag',wants:'et kort råd som viser total kapitalpris, downside, covenant og hvilke valg styret faktisk må eie',conceals:'at styret også kan være utsatt for eierpress og prestisje knyttet til vekst, oppkjøp eller offensiv kapitalfortelling',speech_style:'komprimert og ansvarssøkende; spør hva vi vedtar, hva som kan gå galt, hvilke vilkår som binder oss og hvem som eier risikoen',teaches_player:'at CFOens innflytelse blir sterkere når den ikke forsøker å erstatte styrets mandat'},
    {id:'eierrepresentant',social_function:'eierperspektiv som vurderer avkastning, utvanning, kontroll og kapitaldisiplin',class_position:'kapitaleier med sterk indirekte makt over styre og strategi',status:'høy formell og økonomisk status',power_over_player:'kan påvirke forventninger og styrepress, men kan ikke gjøre ønsket avkastning til dokumentert finansielt faktum',wants:'vekst og avkastning uten unødvendig utvanning eller skjult finansieringsrisiko',conceals:'hvor mye preferansen for kontroll kan trekke kapitalstrukturen mot mer gjeld enn downside egentlig tåler',speech_style:'eierorientert og resultatdrevet; spør hva finansieringen gjør med kontroll, avkastning og fremtidig fleksibilitet',teaches_player:'at kapitalstruktur fordeler både kontroll og risiko mellom flere aktører'},
    {id:'cfo_privat_partner',social_function:'privat nærperson som møter spilleren etter bank- og styrepress uten organisatorisk agenda',class_position:'privat relasjon uten formell arbeids- eller kapitalmakt',status:'emosjonell nærhet uten arbeidsrang',power_over_player:'kan utfordre kontrollmasken og vise når ansvarsfølelse blir til behov for å bære hele utfallet alene',wants:'en samtale der usikkerhet og ansvar kan være menneskelig uten å bli omgjort til ny scenarioanalyse',conceals:'at hun blir sliten av at hver bekymring møtes som et problem som skal optimaliseres og kontrolleres',speech_style:'direkte og jordnær; spør hva som faktisk var ditt valg, hva styret eide og hva du ikke kan kontrollere',teaches_player:'at profesjonell status og kapitalmakt ikke bestemmer privat verdi eller gjør usikkerhet til personlig svikt'}
  ],
  slow_axes:[
    {id:'standing_ceo',meaning:'Noras situerte tillit til at finansdirektøren gir brukbar retning uten å gjøre uavklarte bankvilkår til løfter',runtime_binding:'existing'},
    {id:'standing_bank',meaning:'bankkontaktens situerte tillit til at selskapet skiller indikasjon, kredittbehandling, forhandling og bindende mandat',runtime_binding:'existing'},
    {id:'standing_board',meaning:'styrets situerte tillit til at CFOens råd viser total kapitalpris, covenant, downside og faktisk beslutningsgrense',runtime_binding:'existing'},
    {id:'capital_integrity',meaning:'om kapitalbehov, vilkår, covenantbuffer og downside forblir sporbare gjennom hele refinansieringscaset',runtime_binding:'existing'},
    {id:'waiting_cost',meaning:'presset til å love fremdrift når caset legitimt venter på bankens kredittprosess eller styrets beslutning',runtime_binding:'editorial_only_until_governed'},
    {id:'rework_debt',meaning:'kostnaden ved å bevare gammel vekstfortelling når markedsrente eller bankvilkår faktisk endrer kapitalrommet',runtime_binding:'editorial_only_until_governed'},
    {id:'authority_clarity',meaning:'om forhandling, CFO-anbefaling, daglig leders strategi og styrets bindende kapitalvedtak holdes institusjonelt adskilt',runtime_binding:'existing'},
    {id:'private_control_mask',meaning:'om høy profesjonell status gjør at kontrollbehov og ansvar følger spilleren hjem etter bank- og styreprosessen',runtime_binding:'editorial_only_until_governed'}
  ],
  season:{days:14,day_phases:['morning','lunch','afternoon','evening'],coverage},
  primary_threads:[
    thread('kapital_og_mandatspor','Forholdet mellom kapitalbehov, covenant, vilkår og eksplisitt fullmakt gjennom samme refinansieringscase.',['1/morning','2/morning','3/afternoon','5/morning','7/afternoon','10/morning','13/morning']),
    thread('bank_styre_og_tillit','Hvordan bankkontakt, Nora og styreleder vurderer samme kapitalarbeid fra forskjellige posisjoner og husker tidligere signaler.',['1/lunch','2/lunch','2/afternoon','4/lunch','6/lunch','9/lunch','12/lunch','13/lunch']),
    thread('venting_handoff_og_rework','Hvordan bankventing og endrede markedsvilkår åpner samme arbeidsobjekt for sporbar rework uten parallelt beslutningsspor.',['3/afternoon','5/afternoon','6/afternoon','7/morning','8/afternoon','9/afternoon','11/afternoon']),
    thread('cfo_myndighet_og_styre','Skillet mellom CFOens forhandling og anbefaling, Noras strategibehov og styrets faktiske myndighet til å binde kapital.',['7/lunch','8/lunch','9/morning','10/lunch','11/lunch','12/afternoon','13/afternoon']),
    thread('cfo_identitet_og_etterspill','Hvordan kontroll, status og ansvar påvirker profesjonsmasken før og etter styrets beslutning.',['1/evening','4/evening','7/evening','10/evening','11/evening','12/evening','13/evening','14/evening'])
  ],
  private_aftermath:[
    {id:'bank_waiting_feels_like_loss_of_control',description:'Mens kredittkomiteen behandler caset, merker spilleren hvor raskt legitim venting kan føles som tap av kontroll og friste til å love Nora mer enn banken faktisk har besluttet.',materialization_refs:[refs.people,refs.micro]},
    {id:'board_clarity_becomes_identity',description:'Før styremøtet kan ønsket om å være den CFOen som alltid har et klart svar gjøre betingede råd og synlig downside personlig vanskeligere å stå i.',materialization_refs:[refs.conflict,refs.story]},
    {id:'mandate_is_not_status',description:'Når caset venter på styret, må spilleren skille egen verdi og standing fra om styret følger den anbefalte finansieringsretningen.',materialization_refs:[refs.followup,refs.story]},
    {id:'capital_outcome_home',description:'Etter styrevedtaket utfordres spilleren til å holde senere vekst eller kapitalpress adskilt fra hva som faktisk var kjent, anbefalt og besluttet på beslutningstidspunktet.',materialization_refs:[refs.consequence,refs.knowledge]}
  ],
  delayed_consequences:[
    {id:'bank_signal_returns',setup_ref:'2/afternoon',return_ref:'5/afternoon',domains:['job','reputation']},
    {id:'rate_change_returns',setup_ref:'5/morning',return_ref:'8/afternoon',domains:['job','economy','reputation']},
    {id:'covenant_buffer_returns',setup_ref:'7/afternoon',return_ref:'11/afternoon',domains:['job','economy']},
    {id:'board_mandate_returns',setup_ref:'10/lunch',return_ref:'12/afternoon',domains:['job','reputation']},
    {id:'control_mask_returns',setup_ref:'13/evening',return_ref:'14/evening',domains:['psyche','narrative','reputation']}
  ],
  materialization:{no_new_runtime:true,source_refs:Object.values(refs)}
};
write(WORLD_PATH, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
index.roles = (index.roles || []).filter(row => `${row.category}/${row.role_scope}` !== KEY);
index.roles.push({category:'naeringsliv',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
index.effective_date = '2026-08-27';
index.note = 'Reference- og pilotbevisene består uendret. Finansdirektør er materialisert som kontrollert Role World-rollout med ett vedvarende refinansieringscase, eksplisitt waiting/handoff/rework og audience-spesifikk standing uten at CFO-standing kan erstatte bankens kredittprosess eller styrets bindende kapitalmyndighet.';
write(indexPath,index);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
checklist.reference_worlds = [...new Set([...(checklist.reference_worlds || []), WORLD_PATH])];
write(checklistPath,checklist);

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themePath);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = world.theme_ids;
write(themePath,themeBank);

const report = `# Civication Role World rollout — Næringsliv Finansdirektør

Status: Materialisert på kontrollert rollout-branch; completion gjelder først etter fail-closed generatorer, streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.

## Scope

- Lukker bare de dokumenterte authored debt-punktene \`rhythm_waiting_handoff_rework\` og \`situated_reputation\`.
- Gjenbruker eksisterende ni mailtyper og det etablerte refinansierings-/covenantsporet; bare fem nye scener materialiseres der vedvarende caseflyt faktisk manglet.
- Ett arbeidsobjekt følger kapitalbehov fra baseline via bank-handoff, waiting, rente-/covenantdrevet rework, styrehandoff og beslutningsetterspill.
- Audience-spesifikk standing skilles mellom Nora, bankkontakten, styret og eierperspektivet. Standing påvirker tillit og tolkning, aldri bindende fullmakt.
- Work grammar beholdes uendret: Finansdirektør kan analysere, forhandle og anbefale, men kan ikke signere eller love finansiering eller andre kapitalforpliktelser uten nødvendig mandat.
- Ingen ny runtime eller parallell scene-/reputation-/work engine.

## Materialisering

- 14 dager × 4 faser = 56 dramaturgiske beats.
- 5 nye rolle-spesifikke scener: case-open, bank-handoff/waiting, rente-/covenant-rework, styre-waiting og styre-aftermath.
- Eksisterende story, knowledge, micro og conflict-scener brukes som provenance i sesonggridet.
- Mailplan utvides fra 8 til 13 steg uten å skrive om den eksisterende faglige buen.

## Kvalitetsgrense

Rollouten skal feile lukket hvis persistent work object, waiting/handoff/rework, audience-spesifikk standing, fullmaktsgrense, provenance, compiled registry, Career Gameplay Matrix eller readiness ikke kan bevises samlet.
`;
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/CIVICATION_NAERINGSLIV_FINANSDIREKTOR_ROLE_WORLD_ROLLOUT.md'),report);

console.log('Materialized Finansdirektør Role World rollout');
console.log(JSON.stringify({world:WORLD_PATH,new_scenes:[open.id,bank.id,rework.id,board.id,aftermath.id],plan_steps:plan.sequence.length},null,2));
