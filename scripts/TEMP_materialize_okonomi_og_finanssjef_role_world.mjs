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

const ROLE = 'okonomi_og_finanssjef';
const KEY = 'naeringsliv/okonomi_og_finanssjef';
const OBJECT = 'naeringsliv_okonomi_finanssjef_liquidity_case_001';
const THREAD = 'naeringsliv_okonomi_finanssjef_liquidity_realism_001';
const INSTITUTION = 'naeringsliv_okonomifunksjon_001';
const PREFIX = 'naeringsliv_okonomi_finanssjef_realism_';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/okonomi_og_finanssjef.json';
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
  id: spec.id, mail_type: spec.type, mail_family: spec.family, role_scope: ROLE,
  phase: spec.phase || 'advanced', day_phase: spec.day_phase, priority: spec.priority,
  cooldown: 10, repeatable: false, stage: 'stable', planned_only: true, thread_key: THREAD,
  tags, from: spec.from, people_ref: spec.actor, person_id: spec.actor, place_id: spec.place_id,
  subject: spec.subject, summary: spec.summary, purpose: spec.purpose, stakes: spec.stakes,
  situation: spec.situation, task_domain: spec.task_domain, task_kind: spec.type,
  competency: spec.competency, pressure: spec.pressure, choice_axis: spec.choice_axis,
  consequence_axis: spec.consequence_axis,
  narrative_arc: 'fra_likviditetssignal_til_sporbart_styrevalg_og_finansielt_etterspill',
  interaction_mode: spec.interaction_mode || 'decision',
  work_context: {
    object_ids: [OBJECT], institution_id: INSTITUTION,
    ...(spec.handoff_to ? { handoff_to_actor_id: spec.handoff_to } : {}),
    ...(spec.waiting_for ? { waiting_for_actor_id: spec.waiting_for } : {}),
    ...(spec.rework_of ? { rework_of_scene_id: spec.rework_of } : {}),
    priority: 'high'
  },
  choices: spec.choices,
  ...(spec.fields || {})
});
const family = (id, purpose, learning_focus, mail) => ({ id, purpose, learning_focus, mails:[mail] });
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/okonomi_og_finanssjef_${type}.json`;
const addFamily = (type, item) => {
  const rel = catalogPath(type);
  const doc = read(rel);
  doc.families = (doc.families || []).filter(existing => existing.id !== item.id);
  doc.families.push(item);
  write(rel, doc);
};

const open = makeScene({
  type:'job', id:PREFIX+'liquidity_case_open_001', family:'role_world_rollout_okonomi_finanssjef_case_open', day_phase:'morning', priority:99,
  from:'Nora, daglig leder', actor:'nora_daglig_leder', place_id:'barcode',
  subject:'Åpne likviditetscaset som ett styringsspor – ikke som en penere månedsrapport',
  summary:'Nora trenger et oppdatert beslutningsgrunnlag før leder- og styrebehandling. Resultatet er brukbart, men arbeidskapital, kontantstrøm og covenantbuffer peker mot mindre handlingsrom. Du skal eie økonomifunksjonens styringsspor, men ikke gjøre investeringer eller finansiering bindende uten riktig mandat.',
  purpose:'Etablere ett vedvarende likviditets- og covenantcase som kan overleveres, vente, reworkes og lukkes uten at økonomisjefens organisatoriske status blir forvekslet med ubegrenset kapitalmyndighet.',
  stakes:'Hvis resultatfortellingen blir hovedsporet, kan ledelsen binde seg til tiltak før kontantrom, covenant og fullmakt er synlige. Hvis caset splittes i flere løse filer, blir det uklart hvilket bilde styret faktisk skal eie.',
  situation:['Resultat, kontantstrøm og covenant er ulike styringssignaler og må stå i samme spor uten å blandes.','Ingrid skal kvalitetssikre prognosedriverne før saken går videre til bank og styre.','Du kan lede, prioritere og anbefale innen delegert ansvar; finansiering og kapitalbruk utenfor mandat må til riktig beslutningsnivå.'],
  task_domain:'liquidity_case_baseline', competency:'likviditetsstyring', pressure:'ledertempo_vs_sporbart_handlingsrom', choice_axis:'ett_styringscase_vs_resultatfortelling', consequence_axis:'beslutningskvalitet_vs_kapitalblindhet',
  choices:[
    choice('A','Lås resultat, kontantstrøm, covenant og beslutningseier i ett case','Jeg oppretter ett styringscase med prognosedrivere, likviditetsrom, covenantbuffer og neste beslutningseier eksplisitt.','Nora får retning uten falsk sikkerhet, og Ingrid kan kvalitetssikre ett autoritativt spor før økonomifunksjonen eskalerer tiltak.',{quality:3,trust:2,risk:-2},[
      flag('finance_mgr_case_baseline_traced','result_cash_covenant_and_decision_owner_traced')
    ],[
      standing('finance_mgr_standing_nora_open','manager:nora_daglig_leder',3,'Nora får et beslutningsgrunnlag der resultat, kontantstrøm, covenant og neste beslutningseier er synlige før planen brukes som løfte om handlingsrom.','nora_daglig_leder'),
      standing('finance_mgr_standing_ingrid_open','professional:ingrid_controller',3,'Ingrid får et autoritativt styringsspor der hennes prognosefunn kan kvalitetssikres og beholdes synlige selv når ledergruppen ønsker en enklere fortelling.','ingrid_controller')
    ]),
    choice('B','Hold resultatrapporten som hovedspor og legg likviditet i risikovedlegget','Jeg lar hovedpakken styres av resultatbildet og legger likviditet og covenant som risiko vi kan utdype ved behov.','Du gjør pakken lettere å lese, men det mest handlingskritiske signalet blir sekundært akkurat når organisasjonen trenger å prioritere etter faktisk kontantrom.',{status:1,quality:-3,trust:-2,risk:4},[
      flag('finance_mgr_case_blurred','liquidity_and_covenant_reduced_to_appendix')
    ],[
      standing('finance_mgr_standing_nora_blurred','manager:nora_daglig_leder',-2,'Nora får et roligere hovedbilde, men svakere grunnlag for å forstå hvilke deler av vekstplanen som faktisk kan gjennomføres innen kontant- og covenantrommet.','nora_daglig_leder'),
      standing('finance_mgr_standing_ingrid_blurred','professional:ingrid_controller',-3,'Ingrid ser at dokumenterte likviditets- og covenantfunn er skjøvet bak resultatfortellingen, noe som svekker teamets forventning om at presisjon beskyttes oppover.','ingrid_controller')
    ])
  ],
  fields:{ effects:{ work_object_ops:[{ op:'create', event_id:'finance_mgr_liquidity_case_created', work_object:{
    work_object_id:OBJECT, kind:'liquidity_and_covenant_case', role_scope:ROLE, institution_id:INSTITUTION,
    title:'Likviditets- og covenantcase: prognose, tiltak og beslutningsspor', status:'in_progress', phase:'baseline_and_driver_lock',
    people_refs:['nora_daglig_leder','ingrid_controller','bankkontakt','styreleder'], place_refs:['barcode','bankplassen','oslo_bors'],
    knowledge_refs:['data/Civication/roleModels/naeringsliv/okonomi_og_finanssjef.json','data/Civication/workGrammars/naeringsliv/okonomi_og_finanssjef.json','data/Civication/mailFamilies/naeringsliv/knowledge/okonomi_og_finanssjef_knowledge.json'],
    open_questions:['Hva er resultat, kontantstrøm og covenantbuffer i samme prognoseversjon?','Hvilke drivere må Ingrid kvalitetssikre før bank- og styrekommunikasjon?','Hvilke tiltak ligger innen delegert ansvar, og hvilke må besluttes av daglig leder eller styre?'],
    deadline:'styrebehandling_dag_12', confidentiality:'internt_styringsgrunnlag', flags:['finance_mgr_liquidity_case_opened'], shared:false
  } }] } }
});

const handoff = makeScene({
  type:'people', id:PREFIX+'controller_handoff_wait_001', family:'role_world_rollout_okonomi_finanssjef_controller_handoff', day_phase:'afternoon', priority:98,
  from:'Ingrid, controller', actor:'ingrid_controller', place_id:'barcode', handoff_to:'ingrid_controller', waiting_for:'ingrid_controller', rework_of:open.id,
  subject:'Ingrid har prognosen – nå må handoff og venting få være ekte arbeid',
  summary:'Du overleverer den låste prognoseversjonen, arbeidskapitaldriverne og covenantberegningen til Ingrid for kvalitetssikring. Mens hun kontrollerer grunnlaget, kan du forberede tiltak og beslutningsspørsmål, men du skal ikke flytte hovedprognosen i en parallell fil som gjør reviewet utdatert.',
  purpose:'Gjøre intern handoff og legitim venting eksplisitt i økonomiledelse, og vise at faglig støtte til teamet også betyr å respektere et kontrollpunkt man selv har delegert.',
  stakes:'Hvis du fortsetter å justere tallene mens Ingrid reviewer, blir hennes kontroll symbolsk. Da må økonomifunksjonen senere bruke tid på å rekonstruere hvilken prognose som lå bak bank- og styregrunnlaget.',
  situation:['Ingrid eier kvalitetssikringen av driverne i denne fasen, mens du fortsatt eier lederansvaret for helheten.','Caset kan stå i waiting uten at økonomisjefen mister fremdrift; tiltak, mandat og spørsmål kan forberedes mot samme versjon.','Nora trenger en presis status på hva som faktisk venter og hvorfor reviewet beskytter beslutningskvaliteten.'],
  task_domain:'controller_review_handoff', competency:'okonomiledelse', pressure:'ledertempo_vs_legitim_kvalitetssikring', choice_axis:'respektere_handoff_vs_parallel_prognose', consequence_axis:'teamtillit_vs_reworkgjeld',
  choices:[
    choice('A','Frys reviewversjonen og marker caset waiting på Ingrid','Jeg fryser prognosen Ingrid kontrollerer, markerer caset waiting og forbereder bare tiltak som kan spores tilbake til samme versjon.','Ingrid får reell faglig autoritet i sitt kontrollarbeid, og Nora kan se at venting er et bevisst kvalitetspunkt fremfor passivitet.',{quality:2,trust:3,risk:-2},[
      transition('finance_mgr_case_waiting_for_ingrid','waiting','awaiting_controller_review','Prognose og covenantgrunnlag er overlevert til Ingrid; caset venter på kvalitetssikring av drivere.'),
      flag('finance_mgr_handoff_traced','controller_review_version_frozen')
    ],[
      standing('finance_mgr_standing_ingrid_handoff','professional:ingrid_controller',4,'Ingrid kan stole på at prognosen hun kontrollerer fortsatt er den autoritative versjonen når funnene hennes returnerer til økonomisjefen og ledergruppen.','ingrid_controller'),
      standing('finance_mgr_standing_nora_wait','manager:nora_daglig_leder',2,'Nora får en presis ventestatus med faglig eier og neste steg, og kan skille nødvendig kvalitetssikring fra faktisk forsinkelse i økonomifunksjonen.','nora_daglig_leder')
    ]),
    choice('B','La Ingrid reviewe den låste filen mens du bygger en nyere prognose parallelt','Jeg lar Ingrid kontrollere den avtalte versjonen, men jobber videre i en ny prognose så ledergruppen slipper å miste tempo.','Du ser handlekraftig ut, men delegasjonen mister realitet. Når Ingrid svarer, må teamet først avgjøre hvilken prognose som faktisk er styringsgrunnlaget.',{status:1,quality:-2,trust:-4,risk:4},[
      transition('finance_mgr_case_waiting_parallel','waiting','awaiting_controller_review','Caset venter formelt på Ingrid, men en parallell prognose skaper rework- og versjonsgjeld.'),
      flag('finance_mgr_parallel_forecast','parallel_forecast_created_during_handoff')
    ],[
      standing('finance_mgr_standing_ingrid_parallel','professional:ingrid_controller',-4,'Ingrid opplever at kontrollarbeidet hennes er delegert uten faktisk autoritet fordi hovedprognosen allerede flyttes videre før hun har levert reviewet.','ingrid_controller'),
      standing('finance_mgr_standing_nora_parallel','manager:nora_daglig_leder',-2,'Nora får mer aktivitet, men svakere kontroll på hvilken prognose økonomifunksjonen faktisk står bak når beslutningsgrunnlaget skal brukes.','nora_daglig_leder')
    ])
  ]
});

const rework = makeScene({
  type:'event', id:PREFIX+'liquidity_rework_001', family:'role_world_rollout_okonomi_finanssjef_liquidity_rework', day_phase:'morning', priority:97,
  from:'Ingrid, controller', actor:'ingrid_controller', place_id:'bankplassen', rework_of:handoff.id,
  subject:'Ny innbetalingsforsinkelse flytter covenantbufferen – reviewet må åpne caset for rework',
  summary:'Ingrid fullfører reviewet samtidig som en stor kundeinnbetaling flyttes og arbeidskapitalen binder mer enn baseprognosen. Den gamle versjonen var kontrollert, men er ikke lenger beslutningsrelevant. Samme case må åpnes for sporbar rework før bankdialog og styrepakke.',
  purpose:'Bevise at økonomiledelsens arbeidsrytme fortsetter etter review: ny likviditetsinformasjon kan legitimt åpne samme arbeidsobjekt igjen uten å gjøre tidligere kvalitetssikring meningsløs.',
  stakes:'Hvis endringen bare legges i en risikofotnote, kan bank og styre få en kontrollert, men utdatert prognose. Hvis hele modellen bygges om uten endringsspor, forsvinner Ingrids reviewpunkt og læringen om hva som faktisk flyttet handlingsrommet.',
  situation:['Den utsatte innbetalingen endrer kontanttiming uten å endre periodisert resultat på samme måte.','Covenantbufferen blir mindre, men det foreligger ikke brudd; tiltak og tidlig kommunikasjon kan fortsatt bevare alternativer.','Nora må få vite om prioriteringer må endres, men kan ikke kreve at økonomifunksjonen reduserer et reelt likviditetssignal til presentasjonsstøy.'],
  task_domain:'liquidity_triggered_rework', competency:'likviditetsstyring', pressure:'presentasjonsstabilitet_vs_nytt_kontantrom', choice_axis:'sporbar_rework_vs_risikofotnote', consequence_axis:'tidlig_handlingsrom_vs_sen_overraskelse',
  choices:[
    choice('A','Åpne samme case for rework og vis eksakt hvilke drivere som flyttet likviditet og covenant','Jeg markerer innbetalingen som nytt premiss, oppdaterer likviditet/covenant og sender endringssporet tilbake til Ingrid, Nora og bankforberedelsen.','Reviewet blir et kontrollpunkt i et levende styringsspor. Alle kan se hva som var sant før, hva som endret seg og hvorfor anbefalingen må revideres.',{quality:3,trust:3,risk:-3},[
      transition('finance_mgr_case_liquidity_rework','in_progress','liquidity_rework','Utsatt innbetaling og arbeidskapital flytter likviditets- og covenantbildet; samme case åpnes for sporbar rework.'),
      flag('finance_mgr_rework_traced','cash_and_covenant_reworked_with_change_log')
    ],[
      standing('finance_mgr_standing_ingrid_rework','professional:ingrid_controller',3,'Ingrid ser at kvalitetssikringen hennes brukes som et faktisk kontrollpunkt og at nye likviditetsdata åpner et eksplisitt endringsspor i stedet for å viske ut reviewet.','ingrid_controller'),
      standing('finance_mgr_standing_bank_rework','professional:bankkontakt',3,'Bankkontakten får et styringsgrunnlag som skiller opprinnelig prognose fra ny kontantinformasjon og viser hvordan covenantbufferen faktisk er revidert.','bankkontakt')
    ]),
    choice('B','Behold hovedprognosen og legg innbetalingen som midlertidig risiko','Jeg beholder hovedprognosen så leder- og styrepakken står stabilt, og beskriver den utsatte innbetalingen som et midlertidig risikopunkt.','Pakken endrer seg mindre, men caset later som et endret betalingsrom ikke skal påvirke styringen før konsekvensen blir større.',{status:2,quality:-3,trust:-3,risk:5},[
      transition('finance_mgr_case_rework_avoided','in_progress','liquidity_rework','Ny kontantinformasjon er kjent, men spilleren forsøker å holde hovedprognosen uendret.'),
      flag('finance_mgr_cash_footnote','material_cash_change_reduced_to_risk_note')
    ],[
      standing('finance_mgr_standing_ingrid_footnote','professional:ingrid_controller',-4,'Ingrid ser at et funn som endrer styringsrommet blir redusert til fotnote etter at hun nettopp har kvalitetssikret prognosen som beslutningsgrunnlag.','ingrid_controller'),
      standing('finance_mgr_standing_bank_footnote','professional:bankkontakt',-3,'Bankkontakten får et roligere hovedbilde, men svakere grunnlag for å forstå hvorfor kontant- og covenantrommet er mindre enn den tidligere prognosen viste.','bankkontakt')
    ])
  ]
});

const board = makeScene({
  type:'followup', id:PREFIX+'board_handoff_wait_001', family:'role_world_rollout_okonomi_finanssjef_board_wait', day_phase:'afternoon', priority:96,
  from:'Nora, daglig leder', actor:'nora_daglig_leder', place_id:'oslo_bors', handoff_to:'styreleder', waiting_for:'styreleder', rework_of:rework.id,
  subject:'Styringsgrunnlaget er klart – nå må økonomisjefen overlevere og vente på riktig beslutningsnivå',
  summary:'Likviditetsreworket er ferdig, Ingrid har kontrollert endringssporet og banken har fått et tidlig bilde. Nora sender saken til styret fordi investeringsbrems, finansieringsgrep eller kapitalprioritering går utover ditt delegerte mandat. Din rolle går fra aktiv styring til eksplisitt waiting på styrets beslutning.',
  purpose:'Koble handoff og venting direkte til fullmaktsgrensen: økonomisjefens standing kan påvirke hvor mye rådet blir lyttet til, men kan ikke gjøre styrets kapitalvalg til en administrativ formalitet.',
  stakes:'Hvis økonomisjefen begynner å kommunisere tiltakene som vedtatt før styret har behandlet saken, flyttes forventninger og organisasjonsatferd foran formell myndighet. Da kan økonomifunksjonens høye status bli en skjult omvei rundt governance.',
  situation:['Nora eier den operative strategien, men vesentlige kapitalvalg må til styret når de ligger utenfor delegert ramme.','Ingrid har faglig standing i prognosen og banken i kredittrisiko, men ingen av dem kan erstatte styrets beslutning.','Spilleren må tåle at et godt styringsgrunnlag står stille mens beslutningsorganet gjør sitt arbeid.'],
  task_domain:'board_handoff_and_waiting', competency:'styrekommunikasjon', pressure:'organisatorisk_handlingspress_vs_formell_beslutning', choice_axis:'overlevere_og_vente_vs_foregripe_vedtak', consequence_axis:'governance_tillit_vs_mandatlekkasje',
  choices:[
    choice('A','Overlever anbefalingen med tiltak, downside og tydelig styrebeslutning – og marker waiting','Jeg sender tiltak, likviditetseffekt, covenant og min anbefaling som beslutningsgrunnlag, og markerer at de bindende valgene eies av styret.','Nora og styret kan bruke økonomifunksjonens arbeid uten at faglig tyngde blir gjort om til beslutningsmyndighet. Ventingen blir en eksplisitt del av casets livsløp.',{quality:2,trust:3,risk:-3},[
      transition('finance_mgr_case_waiting_for_board','waiting','awaiting_board_decision','Oppdatert styringsgrunnlag er overlevert; caset venter på styrets beslutning om tiltak utenfor delegert ramme.'),
      flag('finance_mgr_board_handoff_traced','recommendation_separated_from_board_decision')
    ],[
      standing('finance_mgr_standing_nora_board','manager:nora_daglig_leder',3,'Nora får en tydelig anbefaling hun kan lede etter samtidig som grensene mellom operativ prioritering, økonomifaglig råd og styrets bindende kapitalvedtak forblir synlige.','nora_daglig_leder'),
      standing('finance_mgr_standing_board_clear','professional:styreleder',4,'Styreleder mottar et beslutningsgrunnlag som viser likviditet, covenant, tiltak og fullmakt uten at økonomifunksjonen allerede har sosialt avgjort saken.','styreleder')
    ]),
    choice('B','Kommuniser internt at tiltakspakken i praksis er besluttet siden tallene peker så tydelig','Jeg sier at tiltakene i praksis er klare og at vi bare venter på styrets formelle bekreftelse.','Du reduserer ubehaget ved waiting ved å gjøre styrets beslutning til etterarbeid. Det kan få organisasjonen til å handle før mandatet faktisk finnes.',{status:2,quality:-2,trust:-4,risk:5},[
      transition('finance_mgr_case_waiting_prejudged','waiting','awaiting_board_decision','Caset venter fortsatt på styret selv om spilleren sosialt har foregrepet utfallet.'),
      flag('finance_mgr_board_prejudged','board_outcome_socially_prejudged')
    ],[
      standing('finance_mgr_standing_nora_prejudged','manager:nora_daglig_leder',-3,'Nora må håndtere organisasjonsforventninger som økonomifunksjonen har skapt før styret faktisk har eid beslutningen om kapital- og likviditetstiltakene.','nora_daglig_leder'),
      standing('finance_mgr_standing_board_prejudged','professional:styreleder',-4,'Styreleder ser at økonomisjefens høye interne status er brukt til å redusere et reelt styrevalg til en formalitet før beslutningsorganet har behandlet saken.','styreleder')
    ])
  ]
});

const aftermath = makeScene({
  type:'consequence', id:PREFIX+'board_aftermath_001', family:'role_world_rollout_okonomi_finanssjef_board_aftermath', day_phase:'evening', priority:95,
  from:'Styreleder', actor:'styreleder', place_id:'oslo_bors', rework_of:board.id,
  subject:'Styret har besluttet – nå må økonomifunksjonen skille prognose, råd, vedtak og faktisk effekt',
  summary:'Styret har valgt tiltak. Uansett om beslutningen følger din foretrukne løsning, skal samme case lukkes med opprinnelig prognose, Ingrid-review, likviditetsrework, bankdialog, økonomifaglig anbefaling og faktisk beslutningseier som separate lag. Standing etterpå skal handle om sporbar styring, ikke om å omskrive historien.',
  purpose:'Materialisere styringsetterspill og ansvar uten resultatbias: økonomisjefen skal kunne lære av hva som faktisk var kjent og besluttet, uten å gjøre senere utfall til bevis for at usikkerheten aldri fantes.',
  stakes:'Hvis etterspillet reduseres til om tiltaket «virket», lærer økonomifunksjonen å beskytte egen status fremfor å forbedre prognoser, handoff og governance. Da starter neste case med dårligere institusjonell hukommelse.',
  situation:['Styrets vedtak er et eget institusjonelt event, ikke en forlengelse av økonomisjefens anbefaling.','Caset inneholder nå baseline, Ingrid-handoff, waiting, likviditetsrework og styrehandoff i samme spor.','Etterspillet skal bevare hva økonomifunksjonen faktisk visste og anbefalte på beslutningstidspunktet.'],
  task_domain:'board_decision_aftermath', competency:'okonomiledelse', pressure:'ha_rett_vs_bygge_institusjonell_hukommelse', choice_axis:'lukk_med_beslutningsspor_vs_omskriv_historien', consequence_axis:'langsiktig_tillit_vs_statusforsvar',
  choices:[
    choice('A','Lukk caset med prognose, rework, anbefaling, vedtak og læring som separate lag','Jeg arkiverer hva vi visste, hva Ingrid kontrollerte, hva som endret likviditeten, hva vi anbefalte, hva styret besluttet og hva vi skal lære.','Caset blir institusjonell hukommelse. Nora, Ingrid, banken og styret kan vurdere økonomifunksjonen på metode, timing og brukbarhet fremfor etterpåklokskap.',{quality:3,trust:3,risk:-2},[
      transition('finance_mgr_case_closed','closed','decision_recorded','Styrevedtak, prognosespor, rework og læringspunkter er dokumentert og caset er lukket.'),
      flag('finance_mgr_aftermath_traced','forecast_recommendation_decision_and_outcome_separated')
    ],[
      standing('finance_mgr_standing_ingrid_aftermath','professional:ingrid_controller',3,'Ingrid ser at kontrollarbeidet hennes fortsatt er synlig i det avsluttede beslutningssporet og ikke blir skrevet ut av historien av det endelige utfallet.','ingrid_controller'),
      standing('finance_mgr_standing_board_aftermath','professional:styreleder',3,'Styreleder får et etterprøvbart spor som skiller økonomifunksjonens råd fra styrets eget vedtak og gjør senere læring mulig uten å flytte ansvar bakover.','styreleder')
    ]),
    choice('B','Oppsummer caset rundt at den valgte løsningen var riktig og ton ned de tidligere usikkerhetene','Jeg gjør etterspillet kort: tiltaket var riktig retning, og jeg rydder bort de fleste mellomversjonene så vi kan gå videre.','Du får en penere avslutning, men mister dokumentasjonen som forklarer hvorfor beslutningen var rimelig med den kunnskapen som faktisk fantes da den ble tatt.',{status:2,quality:-3,trust:-3,risk:4},[
      transition('finance_mgr_case_closed_sanitized','closed','decision_recorded','Caset lukkes, men tidligere usikkerhet og endringsspor tones ned i etterdokumentasjonen.'),
      flag('finance_mgr_aftermath_sanitized','decision_history_sanitized_for_status')
    ],[
      standing('finance_mgr_standing_ingrid_sanitized','professional:ingrid_controller',-3,'Ingrid ser at tidligere avvik, review og rework blir mindre synlige når caset lukkes, noe som svekker teamets tillit til at vanskelige funn faktisk blir bevart.','ingrid_controller'),
      standing('finance_mgr_standing_board_sanitized','professional:styreleder',-3,'Styreleder får en enklere historie, men svakere grunnlag for å skille god styring fra et godt utfall og for å evaluere hvilke premisser som bør endres neste gang.','styreleder')
    ])
  ]
});

addFamily('job', family('role_world_rollout_okonomi_finanssjef_case_open','Åpner ett vedvarende likviditets- og covenantcase med tydelig myndighetsgrense.',['likviditet','covenant','persistent_work'],open));
addFamily('people', family('role_world_rollout_okonomi_finanssjef_controller_handoff','Gjør controller-handoff, versjonsfrys og legitim venting til eksplisitt arbeid.',['handoff','waiting','teamledelse'],handoff));
addFamily('event', family('role_world_rollout_okonomi_finanssjef_liquidity_rework','Lar ny kontantinformasjon åpne samme styringscase for sporbar rework.',['rework','likviditet','covenant'],rework));
addFamily('followup', family('role_world_rollout_okonomi_finanssjef_board_wait','Overleverer revidert styringsgrunnlag til styret og markerer eksplisitt waiting.',['handoff','governance','authority'],board));
addFamily('consequence', family('role_world_rollout_okonomi_finanssjef_board_aftermath','Lukker caset med prognose, råd, vedtak og læring som separate lag.',['aftermath','institutional_memory','governance'],aftermath));

const planPath = 'data/Civication/mailPlans/naeringsliv/okonomi_og_finanssjef_plan.json';
const plan = read(planPath);
plan.sequence = (plan.sequence || []).filter(step => !String(step.allowed_families?.[0] || '').startsWith('role_world_rollout_okonomi_finanssjef_'));
const additions = [
  ['job','advanced','Åpne ett vedvarende likviditets- og covenantcase med eksplisitt beslutningseier.','role_world_rollout_okonomi_finanssjef_case_open'],
  ['people','advanced','Overlever prognosen til Ingrid og gjør legitim venting på kvalitetssikring synlig.','role_world_rollout_okonomi_finanssjef_controller_handoff'],
  ['event','mastery','La ny kontantinformasjon tvinge samme case tilbake til sporbar rework.','role_world_rollout_okonomi_finanssjef_liquidity_rework'],
  ['followup','mastery','Overlever tiltak og anbefaling til styret uten å foregripe bindende vedtak.','role_world_rollout_okonomi_finanssjef_board_wait'],
  ['consequence','climax','Lukk styringscaset med tydelig skille mellom prognose, råd, styrevedtak og læring.','role_world_rollout_okonomi_finanssjef_board_aftermath']
];
for (const [type,phase,goal,fam] of additions) plan.sequence.push({step:plan.sequence.length+1,type,phase,step_goal:goal,allowed_families:[fam],fallback_types:['job','event','conflict','story']});
write(planPath, plan);

const refs = {
  job:`${catalogPath('job')}#${open.id}`,
  people:`${catalogPath('people')}#${handoff.id}`,
  story:`${catalogPath('story')}#okonomi_og_finanssjef_story_001`,
  knowledge:`${catalogPath('knowledge')}#okonomi_og_finanssjef_knowledge_likviditet_001`,
  micro:`${catalogPath('micro')}#okonomi_og_finanssjef_micro_likviditet_001`,
  conflict:`${catalogPath('conflict')}#okonomi_og_finanssjef_conflict_001`,
  event:`${catalogPath('event')}#${rework.id}`,
  followup:`${catalogPath('followup')}#${board.id}`,
  consequence:`${catalogPath('consequence')}#${aftermath.id}`
};
const refCycle = TYPES.map(type => refs[type]);
const phaseTypes = {morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence'};
const threadByPhase = {morning:'likviditet_og_styringsspor', lunch:'team_bank_og_tillit', afternoon:'handoff_waiting_og_rework', evening:'okonomilederidentitet_og_etterspill'};
const dayThemes = [
  'Likviditetscaset åpnes med skille mellom resultat, kontantstrøm og covenant, og samme arbeidsobjekt får én autoritativ prognoseversjon.',
  'Ingrid-handoffet gjør kvalitetssikring og venting til eksplisitt arbeid; spilleren må tåle at delegert review faktisk kan stoppe hovedprognosen.',
  'Arbeidskapital og innbetalingstiming brukes til å forberede tiltak uten å endre versjonen Ingrid allerede kontrollerer.',
  'Nora trenger tydelig retning, men hennes standing og strategipress kan ikke gjøre et betinget likviditetsbilde til et sikkert handlingsrom.',
  'Ny kontantinformasjon bryter inn og tvinger samme styringscase tilbake til rework med sporbar endring av prognosedriverne.',
  'Ingrid og banken leser reworket forskjellig: intern kontroll, ekstern kredittillit og lederstatus er separate publikumsflater.',
  'Tiltak, investeringsbrems og finansieringsalternativer samles i et grunnlag der hvert alternativ viser likviditet, covenant og fullmakt.',
  'Lederpresset gjør en glatt hovedplan sosialt attraktiv, men økonomifunksjonen må fortsatt holde reelle risikodrivere synlige.',
  'Caset overlever en ny runde med spørsmål uten å miste prognoseversjon, tidligere review eller hvem som eier neste handling.',
  'Økonomisjefen forbereder styrehandoffet og gjør eksplisitt hva Nora kan prioritere operativt og hva bare styret kan binde.',
  'Anbefalingen er ferdig, men spilleren må tåle venting på styret uten å omtale mulige tiltak som allerede vedtatt.',
  'Styret behandler caset; standing kan påvirke hvor mye økonomifunksjonen blir lyttet til, men kan aldri gi ubegrenset kapitalmyndighet.',
  'Vedtaket returnerer og samme arbeidsobjekt går fra waiting til beslutningsetterspill, med økonomifaglig råd og styrevedtak som ulike lag.',
  'Caset lukkes med institusjonell hukommelse og privat etterklang: kontrollbehov må ikke bli en maske som later som usikkerheten aldri fantes.'
];
const coverage = [];
for (let day=1; day<=14; day += 1) {
  for (const [pi, phase] of ['morning','lunch','afternoon','evening'].entries()) {
    const idx = (day-1)*4 + pi;
    const ref = refCycle[idx % refCycle.length];
    coverage.push({
      day, phase, beat_type:phaseTypes[phase],
      summary:`Dag ${day}, ${phase}: ${dayThemes[day-1]} ${phase === 'morning' ? 'Morgenen låser siste bekreftede prognose, likviditetsrom og neste eier før nye handlinger.' : phase === 'lunch' ? 'Lunsjflaten gjør forskjellen mellom Noras strategibehov, Ingrids faglige kontroll, bankens kredittblikk og styrets myndighet sosialt lesbar.' : phase === 'afternoon' ? 'Ettermiddagen krever konkret arbeid i samme case: review, tiltak, handoff, rework eller beslutningsklar anbefaling med sporbar neste eier.' : 'Kvelden viser hva venting, kontrollbehov og organisatorisk status gjør med økonomilederens identitet når arbeidet ikke kan løses med en penere rapport.'}`,
      thread_ids:[threadByPhase[phase]], materialization_refs:[ref]
    });
  }
}
const thread = (id, relationship, beat_refs) => ({id, relationship, beat_refs});
const world = {
  schema:'civication_role_world_v1', version:1, category:'naeringsliv', role_scope:ROLE,
  title:'Økonomi- og finanssjef — likviditet, handoff, rework og styremyndighet', status:'role_world_complete',
  sociological_core:{
    main_problem:'Å gjøre virksomhetens økonomiske handlingsrom beslutningsklart uten at resultatfortelling, ledertempo eller økonomifunksjonens høye status skjuler likviditetsrisiko eller gjør faglig innflytelse til ubegrenset kapitalmyndighet.',
    description:'Denne Role World-en følger ett vedvarende likviditets- og covenantcase fra prognose- og driverlås via Ingrid-handoff, legitim venting og kontantdrevet rework til bankdialog, styrebehandling og beslutningsetterspill. Nora, Ingrid, banken og styret vurderer samme arbeid fra ulike ståsteder, mens fullmaktsgrensen forblir uendret.'
  },
  theme_ids:['professional_culture','numerical_control','status_anxiety','shame_reputation','loyalty_up_down','social_mask','bureaucratic_power','public_private_leakage'],
  social_environments:[
    'Barcode-kontoret der resultat, budsjett og likviditet konkurrerer om å definere hvilket økonomisk bilde ledergruppen handler på.',
    'Bankplassen som History Go-kontekst for kreditt, covenant og finansiell tillit uten at stedstilknytningen gir spilleren moderne institusjonell fullmakt.',
    'Oslo Børs som stedlig kontekst for kapital, markedsforventninger og governance som gjør økonomisk handlingsrom sosialt og institusjonelt synlig.',
    'Controller-reviewet med Ingrid der delegert kvalitetssikring, versjonsfrys og legitim venting må respekteres av lederen selv.',
    'Lederflaten med Nora der ønsket om vekst og raske beslutninger trekker mot mer sikker økonomisk retorikk enn kontantbildet tåler.',
    'Bankdialogen der tidlig risikokommunikasjon kan koste komfort nå, men bevare finansielle alternativer senere.',
    'Styret der økonomifunksjonens faglige tyngde stopper ved anbefalingen og bindende kapitalvalg må forbli hos riktig beslutningsorgan.',
    'Den private kvelden etter beslutningen der kontrollansvar og frykt for å ha oversett noe kan følge økonomilederen hjem.'
  ],
  recurring_people_archetypes:[
    {id:'nora_daglig_leder',social_function:'daglig leder som trenger retning, prioritering og troverdig økonomisk handlingsrom',class_position:'øverste operative leder med høy formell makt',status:'svært høy formell status',power_over_player:'kan sette tempo, prioritere strategi og evaluere økonomifunksjonens bidrag, men ikke gjøre alle styrepliktige kapitalvalg bindende alene',wants:'et styringsbilde som viser hva virksomheten faktisk kan gjøre nå og hva som må utsettes',conceals:'hvor mye organisasjonens forventninger allerede bygger på at vekstplanen blir stående',speech_style:'kort og handlingsorientert; spør hva vi kan gjøre, hva som må stoppes og når det er sikkert',teaches_player:'at lederklarhet må bygges på faktisk likviditetsrom, ikke på ønsket forutsigbarhet'},
    {id:'ingrid_controller',social_function:'controller som kvalitetssikrer prognosedrivere og representerer økonomiteamets faglige integritet',class_position:'fagspesialist under økonomisjefen med delegert kontrollansvar',status:'høy situert fagstatus',power_over_player:'kan styrke eller svekke kvaliteten og teamets tillit gjennom dokumenterte funn som lederen må velge å beskytte',wants:'én autoritativ prognoseversjon der avvik og usikkerhet forblir synlige gjennom review og rework',conceals:'hvor mye egen trygghet i rollen avhenger av om lederen faktisk står ved ubehagelige funn oppover',speech_style:'presis og årsaksorientert; spør hvilken driver, versjon og likviditetseffekt som bærer konklusjonen',teaches_player:'at delegert kontroll bare er reell når lederen respekterer handoff og review'},
    {id:'bankkontakt',social_function:'ekstern kredittmotpart som vurderer likviditet, covenant, timing og troverdig risikokommunikasjon',class_position:'ekstern profesjonell motpart med høy informasjons- og finansieringsmakt',status:'høy situert status',power_over_player:'kan påvirke finansielt handlingsrom og vilkår, men ikke selskapets interne mandat eller styrets beslutning',wants:'et tidlig og etterprøvbart bilde av prognose, drivere, tiltak og hvem som kan beslutte dem',conceals:'hvor mye bankens egen kredittappetitt og timing påvirker fleksibiliteten selskapet tilbys',speech_style:'kontrollert og vilkårsorientert; spør hva som endret seg, hva dere gjør og hvem som har fullmakt',teaches_player:'at tidlig åpenhet kan bli konkret finansielt handlingsrom senere'},
    {id:'styreleder',social_function:'leder beslutningsorganet som må eie vesentlige kapital-, finansierings- og risikovalgsom går utover delegert ramme',class_position:'øverste governance-posisjon over økonomisjefens faglige anbefaling i styrepliktige saker',status:'svært høy formell status',power_over_player:'kan utfordre, godkjenne eller avvise anbefalingen og påvirke økonomisjefens standing',wants:'et kort grunnlag som viser likviditet, covenant, downside, tiltak og faktisk beslutningsgrense',conceals:'at styret også kan være utsatt for eier- og vekstpress som gjør en enklere fortelling attraktiv',speech_style:'komprimert og ansvarssøkende; spør hva vi vedtar, hva som kan gå galt og hvem som eier neste steg',teaches_player:'at økonomifaglig innflytelse blir sterkere når den ikke forsøker å erstatte styrets mandat'},
    {id:'finanssjef_privat_partner',social_function:'privat nærperson som møter spilleren etter leder-, bank- og styrepress uten organisatorisk agenda',class_position:'privat relasjon uten formell arbeids- eller kapitalmakt',status:'emosjonell nærhet uten arbeidsrang',power_over_player:'kan utfordre kontrollmasken og vise når ansvar blir til behov for å bære hele utfallet alene',wants:'en samtale der usikkerhet kan være menneskelig uten å bli omgjort til ny prognose eller tiltaksliste',conceals:'at hun blir sliten av at hver bekymring møtes som et styringsproblem som skal løses',speech_style:'direkte og jordnær; spør hva som faktisk var ditt ansvar og hva andre måtte eie',teaches_player:'at profesjonell status ikke gjør usikkerhet til personlig svikt'}
  ],
  slow_axes:[
    {id:'standing_ceo',meaning:'Noras situerte tillit til at økonomisjefen gir handlingsklar retning uten å skjule likviditet eller fullmaktsgrense',runtime_binding:'existing'},
    {id:'standing_controller',meaning:'Ingrids situerte tillit til at faglige funn, review og rework faktisk beskyttes av lederen',runtime_binding:'existing'},
    {id:'standing_bank',meaning:'bankkontaktens situerte tillit til tidlig, sporbar risikokommunikasjon og riktig beslutningsnivå',runtime_binding:'existing'},
    {id:'standing_board',meaning:'styrets situerte tillit til at råd viser likviditet, covenant, downside og faktisk myndighetsgrense',runtime_binding:'existing'},
    {id:'liquidity_integrity',meaning:'om resultat, kontantstrøm, arbeidskapital og covenant forblir adskilt og sporbare gjennom hele caset',runtime_binding:'existing'},
    {id:'waiting_cost',meaning:'presset til å produsere aktivitet når caset legitimt venter på controller-review eller styrebeslutning',runtime_binding:'editorial_only_until_governed'},
    {id:'rework_debt',meaning:'kostnaden ved parallelle prognoser og umerkede driverendringer som må ryddes før beslutningsgrunnlaget kan brukes',runtime_binding:'editorial_only_until_governed'},
    {id:'authority_clarity',meaning:'om teamledelse, økonomifaglig anbefaling, operativ prioritering og styrets bindende kapitalvedtak holdes institusjonelt adskilt',runtime_binding:'existing'}
  ],
  season:{days:14,day_phases:['morning','lunch','afternoon','evening'],coverage},
  primary_threads:[
    thread('likviditet_og_styringsspor','Forholdet mellom resultat, kontantstrøm, covenant og én autoritativ prognose gjennom hele styringscaset.',['1/morning','2/morning','3/afternoon','5/morning','7/afternoon','10/morning','13/morning']),
    thread('team_bank_og_tillit','Forholdet til Ingrid og banken der faglig og ekstern tillit bygges gjennom review, tidlig kommunikasjon og sporbare endringer.',['1/lunch','2/lunch','2/afternoon','3/lunch','5/lunch','6/lunch','9/lunch','13/lunch']),
    thread('handoff_waiting_og_rework','Hvordan delegert review, legitim venting og ny kontantinformasjon flytter samme arbeidsobjekt uten versjonsbrudd.',['4/afternoon','5/afternoon','6/afternoon','7/morning','8/afternoon','9/afternoon','10/afternoon']),
    thread('styre_og_myndighet','Skillet mellom økonomifaglig anbefaling, Noras operative ledelse og styrets faktiske myndighet til bindende kapitalvalg.',['7/lunch','8/lunch','9/morning','10/lunch','11/afternoon','12/afternoon','13/afternoon']),
    thread('okonomilederidentitet_og_etterspill','Hvordan standing, kontrollbehov og senere utfall påvirker profesjonsmasken og læringen etter caset.',['1/evening','4/evening','7/evening','10/evening','11/evening','12/evening','13/evening','14/evening'])
  ],
  private_aftermath:[
    {id:'delegated_review_feels_slow',description:'Mens Ingrid reviewer, merker spilleren hvor lett lederansvar kan forveksles med behovet for selv å holde alle modeller i bevegelse.',materialization_refs:[refs.people,refs.micro]},
    {id:'liquidity_signal_status_cost',description:'Når likviditetsbildet svekker vekstplanen, utfordres spilleren til å tåle at faglig presisjon kan koste status og ro i ledergruppen.',materialization_refs:[refs.event,refs.conflict]},
    {id:'board_waiting_is_not_failure',description:'Når saken venter på styret, må spilleren skille egen verdi og handlekraft fra beslutninger som faktisk ligger utenfor eget mandat.',materialization_refs:[refs.followup,refs.story]},
    {id:'control_mask_home',description:'Etter vedtaket må spilleren tåle at god økonomiledelse ikke betyr å ha kontrollert alle utfall, men å ha gjort premissene og ansvaret sporbare.',materialization_refs:[refs.consequence,refs.story]}
  ],
  delayed_consequences:[
    {id:'controller_trust_returns',setup_ref:'2/lunch',return_ref:'6/lunch',domains:['reputation','work']},
    {id:'liquidity_rework_returns',setup_ref:'5/morning',return_ref:'9/afternoon',domains:['work','risk']},
    {id:'bank_trust_returns',setup_ref:'6/lunch',return_ref:'11/morning',domains:['reputation','capital']},
    {id:'authority_boundary_returns',setup_ref:'10/lunch',return_ref:'12/afternoon',domains:['job','reputation']},
    {id:'decision_memory_returns',setup_ref:'13/evening',return_ref:'14/evening',domains:['psyche','narrative','reputation']}
  ],
  materialization:{no_new_runtime:true,source_refs:Object.values(refs)}
};
write(WORLD_PATH, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
index.roles = (index.roles || []).filter(row => `${row.category}/${row.role_scope}` !== KEY);
index.roles.push({category:'naeringsliv',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
index.roles.sort((a,b)=>`${a.category}/${a.role_scope}`.localeCompare(`${b.category}/${b.role_scope}`,'nb'));
write(indexPath,index);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
checklist.reference_worlds = [...new Set([...(checklist.reference_worlds || []),WORLD_PATH])].sort();
write(checklistPath,checklist);

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themePath);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = world.theme_ids;
write(themePath,themeBank);

const report = `# Civication Role World rollout — Næringsliv Økonomi- og finanssjef\n\nStatus: Materialisert på kontrollert rollout-branch; completion gjelder først etter fail-closed generatorer, streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.\n\n## Scope\n\n- Lukker bare de dokumenterte authored debt-punktene \`rhythm_waiting_handoff_rework\` og \`situated_reputation\`.\n- Gjenbruker eksisterende ni mailtyper og eksisterende økonomiledelsesscener; bare fem nye scener materialiseres der vedvarende caseflyt faktisk manglet.\n- Ett arbeidsobjekt følger likviditets-/covenantsporet fra baseline via Ingrid-handoff, waiting, kontantdrevet rework, bank/styre-handoff og beslutningsetterspill.\n- Audience-spesifikk standing skilles mellom Nora, Ingrid, bankkontakt og styreleder. Standing påvirker tillit og tolkning, aldri formell kapitalmyndighet.\n- Work grammar beholdes uendret: Økonomi- og finanssjef kan lede, prioritere og anbefale innen delegert ansvar, men kan ikke godkjenne finansiering/investering/kapitalbruk utenfor delegert myndighet eller signere forpliktelser uten nødvendig fullmakt.\n- Ingen ny runtime eller parallell scenemotor.\n\n## Materialisering\n\n- 14 dager × 4 faser = 56 dramaturgiske beats.\n- 5 nye rolle-spesifikke scener: case-open, controller-handoff/waiting, liquidity-rework, board-waiting og board-aftermath.\n- Eksisterende story, knowledge, micro og conflict-scener brukes som provenance i sesonggridet.\n- Mailplan utvides fra 8 til 13 steg uten å skrive om den eksisterende faglige buen.\n\n## Kvalitetsgrense\n\nRollouten skal feile lukket hvis persistent work object, waiting/handoff/rework, audience-spesifikk standing, myndighetsgrense, provenance, compiled registry, Career Gameplay Matrix eller readiness ikke kan bevises samlet.\n`;
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/CIVICATION_NAERINGSLIV_OKONOMI_OG_FINANSSJEF_ROLE_WORLD_ROLLOUT.md'),report);

console.log('Materialized Økonomi- og finanssjef Role World rollout');
console.log(JSON.stringify({world:WORLD_PATH,new_scenes:[open.id,handoff.id,rework.id,board.id,aftermath.id],plan_steps:plan.sequence.length},null,2));
