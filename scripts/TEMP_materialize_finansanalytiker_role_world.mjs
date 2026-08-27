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

const ROLE = 'finansanalytiker';
const KEY = 'naeringsliv/finansanalytiker';
const OBJECT = 'naeringsliv_finansanalytiker_investment_case_001';
const THREAD = 'naeringsliv_finansanalytiker_investment_case_realism_001';
const INSTITUTION = 'naeringsliv_investeringsanalyse_enhet_001';
const PREFIX = 'naeringsliv_finansanalytiker_realism_';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/finansanalytiker.json';
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
  narrative_arc: 'fra_modellpremiss_til_sporbart_investeringsvedtak_og_etterspill',
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
const catalogPath = type => `data/Civication/mailFamilies/naeringsliv/${type}/finansanalytiker_${type}.json`;
const addFamily = (type, item) => {
  const rel = catalogPath(type);
  const doc = read(rel);
  doc.families = (doc.families || []).filter(existing => existing.id !== item.id);
  doc.families.push(item);
  write(rel, doc);
};

const open = makeScene({
  type:'job', id:PREFIX+'investment_case_open_001', family:'role_world_rollout_finansanalytiker_case_open', day_phase:'morning', priority:99,
  from:'Elin, porteføljeansvarlig', actor:'elin_portefoljeansvarlig', place_id:'barcode',
  subject:'Åpne investeringscaset som ett sporbar arbeidsobjekt – ikke fem løse regneark',
  summary:'Elin trenger et investeringsgrunnlag til komiteen. Historikk, guiding, egen marginantakelse og peer-gruppe peker ikke helt samme vei. Du skal eie analysesporet, men ikke investeringsbeslutningen, og må gjøre kilder, modellversjon, åpne spørsmål og neste beslutningseier eksplisitte fra starten.',
  purpose:'Etablere ett vedvarende investeringscase som senere scener kan vente på, overlevere, reworke og lukke uten at anbefaling blir forvekslet med kapitalmyndighet.',
  stakes:'Hvis hver oppdatering behandles som et nytt dokument, kan gamle antakelser overleve uten eier, og komiteen kan få en skarp konklusjon uten å se hvilken versjon eller usikkerhet som faktisk bærer den.',
  situation:['Årsrapport og markedsdata er tilgjengelige, men ledelsens guiding og ditt eget marginestimat må skilles fra rapportert historikk.','Theo skal kvalitetssikre modellversjon og metode før caset går til Elin og investeringskomiteen.','Du kan analysere og anbefale; bare faktisk beslutningsorgan kan godkjenne investering eller flytte kapital.'],
  task_domain:'investment_case_baseline', competency:'datakritikk_og_modellsporbarhet', pressure:'beslutningstempo_vs_sporbart_premiss', choice_axis:'ett_sporbart_case_vs_løse_presentasjonsfiler', consequence_axis:'metodetillit_vs_versjonsgjeld',
  choices:[
    choice('A','Lås kildetype, modellversjon, scenario og åpne spørsmål i ett case','Jeg oppretter ett analysecase med historikk, guiding og egne antakelser skilt, og markerer hvem som eier neste review og beslutning.','Elin får et beslutningsspor som kan følges uten at analysen later som den eier investeringen. Theo kan se nøyaktig hvilken versjon og hvilke premisser han skal reviewe.',{quality:3,trust:2,risk:-2},[
      flag('finance_case_baseline_traced','sources_versions_and_decision_owner_traced')
    ],[
      standing('finance_standing_elin_open','manager:elin_portefoljeansvarlig',3,'Elin får et analysegrunnlag der premisser, versjon og beslutningseier er synlige før konklusjonen blir presentert som investeringsråd.','elin_portefoljeansvarlig'),
      standing('finance_standing_theo_open','professional:theo_senioranalytiker',2,'Theo får et reviewbart modellspor med tydelig kildeklassifisering, slik at metodekritikk kan skje før anbefalingen låses.','theo_senioranalytiker')
    ]),
    choice('B','Bygg presentasjonen først og rydd kildene når komiteen har sett retningen','Jeg lager et ryddig hovedcase nå og dokumenterer versjon, guiding og egne antakelser etter at retningen er avklart.','Caset blir raskt presentabelt, men samme hastighet gjør det vanskeligere å vite hvilke tall som er observasjon, forventning eller ønsket retning når reviewet starter.',{status:1,quality:-2,trust:-2,risk:3},[
      flag('finance_case_baseline_blurred','presentation_precedes_source_and_version_lock')
    ],[
      standing('finance_standing_elin_blurred','manager:elin_portefoljeansvarlig',-2,'Elin får et skarpere lysbilde, men svakere sporbarhet mellom kildene og anbefalingen hun senere skal forsvare overfor komiteen.','elin_portefoljeansvarlig'),
      standing('finance_standing_theo_blurred','professional:theo_senioranalytiker',-3,'Theo må begynne reviewet med å rekonstruere hvilken modell og hvilke antakelser som allerede har lekket inn i presentasjonen.','theo_senioranalytiker')
    ])
  ],
  fields:{ effects:{ work_object_ops:[{ op:'create', event_id:'finance_investment_case_created', work_object:{
    work_object_id:OBJECT, kind:'investment_analysis_case', role_scope:ROLE, institution_id:INSTITUTION,
    title:'Investeringscase: modell, scenario, anbefaling og beslutningsspor', status:'in_progress', phase:'baseline_and_source_lock',
    people_refs:['elin_portefoljeansvarlig','theo_senioranalytiker','investeringskomite'], place_refs:['barcode','bankplassen','oslo_bors'],
    knowledge_refs:['data/Civication/roleModels/naeringsliv/finansanalytiker.json','data/Civication/workGrammars/naeringsliv/finansanalytiker.json','data/Civication/mailFamilies/naeringsliv/knowledge/finansanalytiker_knowledge.json'],
    open_questions:['Hvilke tall er rapportert historikk, guiding og egne estimater?','Hvilken modellversjon tåler seniorreview og sensitivitetstest?','Hva kan analytikeren anbefale, og hvem kan faktisk godkjenne eller flytte kapital?'],
    deadline:'investeringskomite_dag_12', confidentiality:'internt_investeringsgrunnlag', flags:['finance_investment_case_opened'], shared:false
  } }] } }
});

const handoff = makeScene({
  type:'people', id:PREFIX+'senior_handoff_wait_001', family:'role_world_rollout_finansanalytiker_senior_handoff', day_phase:'afternoon', priority:98,
  from:'Theo, senioranalytiker', actor:'theo_senioranalytiker', place_id:'barcode', handoff_to:'theo_senioranalytiker', waiting_for:'theo_senioranalytiker', rework_of:open.id,
  subject:'Theo har modellen – nå er venting en del av arbeidet, ikke et tomrom',
  summary:'Du overleverer låst modellversjon, kildeliste og scenarioantakelser til Theo. Mens han reviewer, kan du dokumentere åpne spørsmål og forberede sensitivitet, men du skal ikke lage en parallell «nyere» sannhet som gjør handoffet utdatert før det er lest.',
  purpose:'Gjøre overlevering og legitim venting eksplisitt som del av finansanalytikerens arbeidsrytme, med samme vedvarende analysecase før og etter review.',
  stakes:'Hvis venting behandles som ineffektivitet, oppstår parallelle modellkopier. Da kan reviewkommentaren treffe en versjon som ikke lenger er den som presenteres, og tillit blir et spørsmål om hvem som har siste fil.',
  situation:['Theo eier metode-reviewet i denne fasen, men ikke investeringsbeslutningen.','Caset må kunne stå i waiting uten at spilleren mister identitet eller skaper en ny uregistrert modellversjon.','Elin trenger en kort status om hva som faktisk venter og hva som fortsatt kan arbeides med.'],
  task_domain:'senior_review_handoff', competency:'versjonskontroll_og_handoff', pressure:'produktivitetssignal_vs_legitim_venting', choice_axis:'respektere_reviewkø_vs_parallel_modell', consequence_axis:'metodespor_vs_reworkgjeld',
  choices:[
    choice('A','Frys reviewversjonen og arbeid bare med dokumenterte sideoppgaver','Jeg markerer caset som waiting på Theo, fryser reviewversjonen og jobber bare med sensitiviteter som kan tilbakeføres til samme spor.','Ventingen blir synlig og legitim. Theo kan reviewe én faktisk versjon, og Elin ser at fremdrift ikke krever at handoffet undergraves av en parallell fil.',{quality:2,trust:3,risk:-2},[
      transition('finance_case_waiting_for_theo','waiting','awaiting_senior_review','Reviewversjonen er overlevert til Theo; caset venter på metode- og versjonskontroll.'),
      flag('finance_handoff_traced','senior_review_version_frozen')
    ],[
      standing('finance_standing_theo_handoff','professional:theo_senioranalytiker',4,'Theo kan stole på at filen han reviewer fortsatt er den autoritative analyseversjonen når kommentarene hans returnerer til spilleren.','theo_senioranalytiker'),
      standing('finance_standing_elin_wait','manager:elin_portefoljeansvarlig',2,'Elin får en presis ventestatus med neste eier og kan skille kontrollert reviewtid fra faktisk forsinkelse eller passivitet.','elin_portefoljeansvarlig')
    ]),
    choice('B','Fortsett i en ny kopi så tiden ikke ser ubrukt ut','Jeg lar Theo reviewe den låste filen, men bygger videre i en ny kopi som vi kan bruke hvis den blir bedre før reviewet er ferdig.','Du ser produktiv ut, men handoffet mister autoritet. Når Theo svarer, må teamet først avgjøre hvilken av to modeller som egentlig er investeringscaset.',{status:1,quality:-2,trust:-3,risk:4},[
      transition('finance_case_waiting_with_parallel_copy','waiting','awaiting_senior_review','Caset venter fortsatt på Theo, men en parallell modellkopi skaper rework- og versjonsgjeld.'),
      flag('finance_parallel_model','parallel_model_created_during_handoff')
    ],[
      standing('finance_standing_theo_parallel','professional:theo_senioranalytiker',-4,'Theo opplever at reviewarbeidet hans er gjort mot en versjon spilleren allerede har begynt å erstatte uten et avtalt endringsspor.','theo_senioranalytiker'),
      standing('finance_standing_elin_parallel','manager:elin_portefoljeansvarlig',-2,'Elin får raskere aktivitet, men svakere kontroll over hvilken modellversjon som faktisk ligger bak anbefalingen hun skal ta videre.','elin_portefoljeansvarlig')
    ])
  ]
});

const market = makeScene({
  type:'event', id:PREFIX+'market_rework_001', family:'role_world_rollout_finansanalytiker_market_rework', day_phase:'morning', priority:97,
  from:'Elin, porteføljeansvarlig', actor:'elin_portefoljeansvarlig', place_id:'oslo_bors', rework_of:handoff.id,
  subject:'Ny guiding endrer premisset – reviewet må føre til rework, ikke kosmetikk',
  summary:'Etter Theos review kommer ny guiding som svekker marginforutsetningen og flytter nedsiden. Den gamle modellen var metodisk ryddig da den ble reviewet, men er ikke lenger beslutningsrelevant. Caset må åpnes for kontrollert rework med tydelig endringsspor.',
  purpose:'Bevise at role rhythm ikke stopper ved handoff: ny informasjon kan legitimt åpne samme arbeidsobjekt igjen, og kvalitet måles i sporbar rework fremfor å beskytte tidligere arbeid.',
  stakes:'Hvis ny guiding bare legges i en fotnote for å redde presentasjonen, får komiteen en modell som er teknisk reviewet, men faglig foreldet. Hvis hele modellen bygges om uten spor, mister Theo muligheten til å se hva som faktisk endret seg.',
  situation:['Ny guiding er et nytt premiss, ikke en feil i den gamle historikken.','Theo har allerede reviewet kilde- og versjonsstrukturen, så reworket må bevare hans sporbarhet.','Elin trenger å vite om anbefalingen endres, men hun kan ikke kreve at analysen later som ny informasjon er uvesentlig.'],
  task_domain:'market_triggered_rework', competency:'scenario_og_endringsspor', pressure:'presentasjonsstabilitet_vs_ny_relevans', choice_axis:'sporbar_rework_vs_fotnote', consequence_axis:'beslutningsrelevans_vs_hindsightforsvar',
  choices:[
    choice('A','Åpne caset for rework og vis eksakt hvilke drivere som endres','Jeg markerer ny guiding som nytt premiss, oppdaterer scenarioene og sender endringssporet tilbake til Theo og Elin.','Samme case overlever nyheten fordi review, venting og rework henger sammen. Theo kan kontrollere endringen, og Elin ser om konklusjonen faktisk flytter seg.',{quality:3,trust:2,risk:-3},[
      transition('finance_case_market_rework','in_progress','market_rework','Ny guiding endrer marginpremiss og scenario; samme case åpnes for sporbar rework.'),
      flag('finance_market_rework_traced','new_guidance_reworked_with_change_log')
    ],[
      standing('finance_standing_theo_rework','professional:theo_senioranalytiker',3,'Theo ser at reviewet hans brukes som kontrollpunkt for en eksplisitt endring, ikke som kvalitetsstempel på en modell som nå har andre premisser.','theo_senioranalytiker'),
      standing('finance_standing_elin_rework','manager:elin_portefoljeansvarlig',3,'Elin får vite nøyaktig hvorfor anbefalingen kan endres etter ny guiding og kan forklare reworket som metode, ikke ubesluttsomhet.','elin_portefoljeansvarlig')
    ]),
    choice('B','Behold hovedmodellen og legg ny guiding i risikofotnoten','Jeg lar hovedcaset stå så komitepresentasjonen er stabil, og legger den nye guidingen inn som et risikomoment vi kan følge senere.','Presentasjonen endrer seg mindre, men modellen later som et endret premiss bare er perifer risiko. Metodisk standing kan falle selv om historien blir enklere å selge.',{status:2,quality:-3,trust:-2,risk:4},[
      transition('finance_case_market_rework_avoided','in_progress','market_rework','Ny guiding er kjent, men spilleren forsøker å holde hovedmodellen uendret.'),
      flag('finance_guidance_footnote','material_guidance_reduced_to_footnote')
    ],[
      standing('finance_standing_theo_footnote','professional:theo_senioranalytiker',-4,'Theo ser at et premiss som burde utløse ny modellkontroll er skjøvet ut av modellen for å bevare en tidligere konklusjon.','theo_senioranalytiker'),
      standing('finance_standing_elin_footnote','manager:elin_portefoljeansvarlig',-2,'Elin får en stabil presentasjon, men et svakere grunnlag for å vite om investeringsrådet fortsatt gjelder etter den nye guidingen.','elin_portefoljeansvarlig')
    ])
  ]
});

const committee = makeScene({
  type:'followup', id:PREFIX+'committee_wait_001', family:'role_world_rollout_finansanalytiker_committee_wait', day_phase:'afternoon', priority:96,
  from:'Elin, porteføljeansvarlig', actor:'elin_portefoljeansvarlig', place_id:'bankplassen', handoff_to:'investeringskomite', waiting_for:'investeringskomite', rework_of:market.id,
  subject:'Analysen er klar – nå må du overlevere og vente på den som faktisk kan flytte kapital',
  summary:'Reworket er ferdig, Theo har kontrollert endringssporet og Elin sender anbefalingen til investeringskomiteen. Din rolle går fra aktiv modellering til eksplisitt waiting: du kan svare på metode og scenario, men kan verken forhåndsgodkjenne eller opptre som om kapitalbeslutningen allerede er tatt.',
  purpose:'Koble handoff og venting direkte til myndighetsgrensen: analytikerens standing kan påvirke hvor mye anbefalingen blir lyttet til, men kan aldri oppgradere rollen til beslutningsorgan.',
  stakes:'Hvis analytikeren omtaler investeringen som vedtatt fordi caset er sterkt og Elin støtter det, flyttes sosial forventning foran formell beslutning. Da blir et analytisk råd i praksis behandlet som kapitalfullmakt.',
  situation:['Elin eier porteføljesiden av overleveringen; investeringskomiteen eier selve beslutningen.','Theo har faglig standing i metode, men heller ikke han kan godkjenne kapitalflyttingen.','Spilleren må tåle at et godt analysecaset kan stå stille mens beslutningstakerne gjør sitt arbeid.'],
  task_domain:'investment_committee_handoff', competency:'anbefaling_og_myndighetsklarhet', pressure:'analytisk_selvsikkerhet_vs_formell_beslutning', choice_axis:'overlevere_og_vente_vs_foregripe_vedtak', consequence_axis:'institusjonell_tillit_vs_mandatlekkasje',
  choices:[
    choice('A','Overlever anbefalingen som analyse og marker caset waiting på komiteen','Jeg sender anbefaling, scenario og usikkerhet som beslutningsgrunnlag og markerer at investeringsvedtaket eies av komiteen.','Elin og komiteen kan bruke analysen uten at den låner beslutningsmyndighet. Ventingen blir en del av arbeidsobjektets livsløp, ikke et hull spilleren må fylle med mer sikker retorikk.',{quality:2,trust:3,risk:-3},[
      transition('finance_case_waiting_for_committee','waiting','awaiting_investment_committee','Analyse og rework er overlevert; caset venter på investeringskomiteens beslutning.'),
      flag('finance_committee_handoff_traced','recommendation_separated_from_capital_decision')
    ],[
      standing('finance_standing_elin_committee','manager:elin_portefoljeansvarlig',3,'Elin kan presentere et tydelig råd samtidig som hennes og analytikerens roller forblir adskilt fra komiteens faktiske kapitalmyndighet.','elin_portefoljeansvarlig'),
      standing('finance_standing_committee_clear','professional:investeringskomite',3,'Komiteen mottar et beslutningsgrunnlag som skiller analyse, usikkerhet og anbefaling fra selve vedtaket de er satt til å eie.','investeringskomite')
    ]),
    choice('B','Kommuniser internt at investeringen i praksis er klar siden alle faglige signaler peker samme vei','Jeg sier at caset i praksis er godkjent faglig og at vi bare venter på den formelle komitebekreftelsen.','Du gjør waiting mindre ubehagelig ved å late som beslutningen allerede finnes. Det øker forventningsgjeld og svekker den tydelige grensen mellom analytisk innflytelse og kapitalmyndighet.',{status:2,quality:-2,trust:-3,risk:5},[
      transition('finance_case_waiting_prejudged','waiting','awaiting_investment_committee','Caset venter fortsatt på komiteen selv om spilleren sosialt har foregrepet utfallet.'),
      flag('finance_decision_prejudged','committee_outcome_socially_prejudged')
    ],[
      standing('finance_standing_elin_prejudged','manager:elin_portefoljeansvarlig',-3,'Elin må rydde opp i en forventning om at investeringen allerede er avgjort før beslutningsorganet faktisk har behandlet caset.','elin_portefoljeansvarlig'),
      standing('finance_standing_committee_prejudged','professional:investeringskomite',-4,'Komiteen ser at analytisk selvsikkerhet er brukt til å sosialt redusere deres beslutning til en formalitet, i strid med den faktiske myndighetsgrensen.','investeringskomite')
    ])
  ]
});

const aftermath = makeScene({
  type:'consequence', id:PREFIX+'committee_aftermath_001', family:'role_world_rollout_finansanalytiker_committee_aftermath', day_phase:'evening', priority:95,
  from:'Investeringskomiteen', actor:'investeringskomite', place_id:'bankplassen', rework_of:committee.id,
  subject:'Vedtaket kom – nå må analyse, beslutning og resultat holdes fra hverandre',
  summary:'Komiteen har tatt beslutningen. Uansett om utfallet følger din anbefaling, skal caset lukkes med dokumentert modellversjon, usikkerhet, rework og faktisk beslutningseier. Standing etterpå skal handle om metode og brukbarhet, ikke om å omskrive historien slik at du alltid «hadde rett».',
  purpose:'Materialisere beslutningsetterspill og resultatbias: samme analyse kan være metodisk god selv om markedet senere går mot den, og en god markedsutvikling kan ikke gjøre en svak metode retroaktivt riktig.',
  stakes:'Hvis spilleren bruker utfallet som eneste kvalitetsmål, lærer rollen å jage treff fremfor sporbar analyse. Da vil standing belønne flaks og straffe ærlig usikkerhet, og neste investeringscase starter med feil læring.',
  situation:['Komiteens vedtak er et eget institusjonelt event, ikke en forlengelse av analytikerens anbefaling.','Caset inneholder nå baseline, Theo-handoff, venting, markedsrework og komitehandoff i samme spor.','Etterspillet skal bevare hva analysen faktisk sa på beslutningstidspunktet før senere markedsutfall er kjent.'],
  task_domain:'decision_aftermath_and_learning', competency:'resultatbias_og_metodelaering', pressure:'ha_rett_vs_vaere_sporbar', choice_axis:'lukk_med_beslutningsspor_vs_omskriv_historien', consequence_axis:'langsiktig_metodetillit_vs_resultatjakt',
  choices:[
    choice('A','Lukk caset med anbefaling, usikkerhet, vedtak og læringspunkter som separate lag','Jeg arkiverer hva modellen viste, hva vi ikke visste, hva komiteen vedtok og hvilke senere signaler som faktisk bør endre neste analyse.','Caset blir et institusjonelt minne i stedet for en seiers- eller tapsfortelling. Elin, Theo og komiteen kan vurdere samme arbeid fra sine egne ståsteder uten at én global status bestemmer historien.',{quality:3,trust:3,risk:-2},[
      transition('finance_case_closed_with_decision_record','closed','decision_recorded','Komiteens beslutning og analysens samtidige premisser er skilt og dokumentert; caset lukkes.'),
      flag('finance_case_learning_closed','decision_and_analysis_recorded_separately')
    ],[
      standing('finance_standing_elin_aftermath','manager:elin_portefoljeansvarlig',3,'Elin får et etterprøvbart beslutningsminne som gjør det mulig å lære av caset uten å forveksle markedets senere utfall med kvaliteten på datagrunnlaget.','elin_portefoljeansvarlig'),
      standing('finance_standing_theo_aftermath','professional:theo_senioranalytiker',3,'Theo ser at metode-review, venting og rework er bevart som del av historikken, slik at neste analyse kan forbedres fra faktiske prosessdata.','theo_senioranalytiker'),
      standing('finance_standing_committee_aftermath','professional:investeringskomite',2,'Komiteen får et klart skille mellom rådet de mottok og vedtaket de selv tok, noe som bevarer ansvar selv når utfallet senere blir kjent.','investeringskomite')
    ]),
    choice('B','Skriv etterspillet som bevis på at anbefalingen var riktig eller feil','Jeg oppsummerer caset ut fra om markedet senere bekreftet anbefalingen, og lar det være hovedmålet på analysekvalitet.','Du får en enklere prestasjonsfortelling, men taper skillet mellom metode og utfall. Flaks kan bli standing, og ærlig usikkerhet kan bli behandlet som svakhet.',{status:1,quality:-3,trust:-2,risk:3},[
      transition('finance_case_closed_with_result_bias','closed','decision_recorded','Caset lukkes, men læringen domineres av resultatbias fremfor samtidige premisser.'),
      flag('finance_result_bias','later_outcome_overwrites_decision_time_reasoning')
    ],[
      standing('finance_standing_elin_resultbias','manager:elin_portefoljeansvarlig',-2,'Elin mister et presist beslutningsminne fordi senere markedsutfall får overskrive hvilke premisser og usikkerheter som faktisk var kjent da rådet ble gitt.','elin_portefoljeansvarlig'),
      standing('finance_standing_theo_resultbias','professional:theo_senioranalytiker',-3,'Theo ser at metodearbeidet blir vurdert gjennom senere utfall i stedet for gjennom sporbarheten og kvaliteten som kunne kontrolleres på beslutningstidspunktet.','theo_senioranalytiker'),
      standing('finance_standing_committee_resultbias','professional:investeringskomite',-2,'Komiteens eget ansvar blir uklart når analytikerens treffsikkerhet brukes som etterpåforklaring på et vedtak som faktisk hadde flere eiere og usikkerheter.','investeringskomite')
    ])
  ]
});

addFamily('job', family('role_world_rollout_finansanalytiker_case_open','Åpner ett vedvarende investeringscase med kilde-, versjons- og myndighetsspor.',['persistent_work_object','source_types','authority_boundary'],open));
addFamily('people', family('role_world_rollout_finansanalytiker_senior_handoff','Gjør seniorreview til et eksplisitt handoff med legitim venting og versjonsfrys.',['handoff','waiting','version_control'],handoff));
addFamily('event', family('role_world_rollout_finansanalytiker_market_rework','Lar ny markedsinformasjon åpne samme case for sporbar rework.',['rework','new_information','scenario'],market));
addFamily('followup', family('role_world_rollout_finansanalytiker_committee_wait','Overleverer analysen til beslutningsorganet og gjør venting på kapitalvedtak eksplisitt.',['handoff','waiting','authority_boundary'],committee));
addFamily('consequence', family('role_world_rollout_finansanalytiker_committee_aftermath','Lukker caset med skille mellom analyse, vedtak, senere utfall og situert standing.',['aftermath','result_bias','situated_reputation'],aftermath));

const planPath = 'data/Civication/mailPlans/naeringsliv/finansanalytiker_plan.json';
const plan = read(planPath);
const rolloutFamilies = new Set([
  'role_world_rollout_finansanalytiker_case_open','role_world_rollout_finansanalytiker_senior_handoff',
  'role_world_rollout_finansanalytiker_market_rework','role_world_rollout_finansanalytiker_committee_wait',
  'role_world_rollout_finansanalytiker_committee_aftermath'
]);
plan.sequence = (plan.sequence || []).filter(step => !(step.allowed_families || []).some(id => rolloutFamilies.has(id)));
const start = plan.sequence.length;
[
  ['job','advanced','Åpne ett vedvarende investeringscase med sporbar kilde, modellversjon og beslutningseier.','role_world_rollout_finansanalytiker_case_open',['people','knowledge','micro']],
  ['people','advanced','Overlever låst reviewversjon til Theo og gjør legitim venting synlig uten parallell modellkopi.','role_world_rollout_finansanalytiker_senior_handoff',['knowledge','micro','job']],
  ['event','mastery','Rework samme case når ny markedsinformasjon endrer premisset etter seniorreview.','role_world_rollout_finansanalytiker_market_rework',['job','conflict','knowledge']],
  ['followup','climax','Overlever anbefalingen til investeringskomiteen og vent på faktisk beslutningsmyndighet.','role_world_rollout_finansanalytiker_committee_wait',['conflict','story','event']],
  ['consequence','climax','Lukk caset med beslutningsspor og resultatbias-kontroll etter komiteens vedtak.','role_world_rollout_finansanalytiker_committee_aftermath',['story','knowledge','people']]
].forEach((row, i) => plan.sequence.push({step:start+i+1,type:row[0],phase:row[1],step_goal:row[2],allowed_families:[row[3]],fallback_types:row[4]}));
write(planPath, plan);

const refs = {
  job:`${catalogPath('job')}#${open.id}`,
  people:`${catalogPath('people')}#${handoff.id}`,
  story:`${catalogPath('story')}#finansanalytiker_story_001`,
  knowledge:`${catalogPath('knowledge')}#finansanalytiker_knowledge_kildetype_001`,
  micro:`${catalogPath('micro')}#finansanalytiker_micro_antakelse_001`,
  conflict:`${catalogPath('conflict')}#finansanalytiker_conflict_001`,
  event:`${catalogPath('event')}#${market.id}`,
  followup:`${catalogPath('followup')}#${committee.id}`,
  consequence:`${catalogPath('consequence')}#${aftermath.id}`
};
const refCycle = TYPES.map(type => refs[type]);
const phaseTypes = {morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence'};
const threadByPhase = {morning:'modell_og_kildespor', lunch:'seniorreview_og_venting', afternoon:'markedsdrevet_rework', evening:'analytikeridentitet_og_etterspill'};
const dayThemes = [
  'Caset åpnes med skille mellom historikk, guiding og egne antakelser, og samme arbeidsobjekt får én autoritativ modellversjon.',
  'Theo-handoffet gjør reviewkø og venting til eksplisitt arbeid; spilleren må tåle at fremdrift også kan være å ikke skape en ny kopi.',
  'Sensitivitet og kildetype blir brukt til å forberede review uten å endre den versjonen som allerede er overlevert.',
  'Elin trenger en tydelig anbefaling, men standing hos porteføljeansvarlig kan ikke gjøre usikkerheten eller myndighetsgrensen mindre.',
  'Ny markedsinformasjon bryter inn og tvinger samme analysecase tilbake til rework med sporbar endring av premissene.',
  'Theo og Elin leser reworket forskjellig: metode, beslutningsklarhet og intern status er separate publikumsflater.',
  'Peer-gruppe, margin og downside samles i en anbefaling der hvert scenario viser hva som må være sant før kapitalbeslutningen.',
  'Komitepresset gjør skarpe konklusjoner sosialt attraktive, men anbefalingen må fortsatt skille råd fra vedtak.',
  'Caset overlever en ny runde med spørsmål uten å miste modellversjon, tidligere review eller hvem som eier neste handling.',
  'Analytikeren forbereder komitehandoffet og gjør eksplisitt hva Elin kan anbefale videre og hva bare komiteen kan beslutte.',
  'Anbefalingen er ferdig, men spilleren må tåle venting på investeringskomiteen uten å omtale et mulig utfall som allerede vedtatt.',
  'Komiteen behandler caset; standing kan påvirke hvor mye analysen blir lyttet til, men kan aldri gi analytikeren rett til å flytte kapital.',
  'Vedtaket returnerer og samme arbeidsobjekt går fra waiting til beslutningsetterspill, med analyse og vedtak dokumentert som ulike lag.',
  'Caset lukkes med resultatbias-kontroll og privat etterklang: profesjonell sikkerhet må ikke bli en maske som later som usikkerhet aldri fantes.'
];
const coverage = [];
for (let day=1; day<=14; day += 1) {
  for (const [pi, phase] of ['morning','lunch','afternoon','evening'].entries()) {
    const idx = (day-1)*4 + pi;
    const ref = refCycle[idx % refCycle.length];
    coverage.push({
      day, phase, beat_type:phaseTypes[phase],
      summary:`Dag ${day}, ${phase}: ${dayThemes[day-1]} ${phase === 'morning' ? 'Morgenen låser siste bekreftede premiss, versjon og neste eier før nye handlinger.' : phase === 'lunch' ? 'Lunsjflaten gjør forskjellen mellom Elins beslutningsbehov, Theos metodetillit og komiteens formelle myndighet sosialt lesbar.' : phase === 'afternoon' ? 'Ettermiddagen krever konkret arbeid i det samme caset: review, sensitivitet, handoff, rework eller beslutningsklar anbefaling med sporbar neste eier.' : 'Kvelden viser hva venting, statusbehov og ønsket om å ha rett gjør med analytikerens identitet når arbeidet ikke kan løses med enda en celle.'}`,
      thread_ids:[threadByPhase[phase]],
      materialization_refs:[ref]
    });
  }
}
const thread = (id, relationship, beat_refs) => ({id, relationship, beat_refs});
const world = {
  schema:'civication_role_world_v1', version:1, category:'naeringsliv', role_scope:ROLE,
  title:'Finansanalytiker — modell, venting, rework og kapitalmyndighet', status:'role_world_complete',
  sociological_core:{
    main_problem:'Å gjøre usikker framtid beslutningsklar gjennom modeller uten at tempo, intern standing eller ønsket konklusjon gjør antakelser til fakta eller analytisk innflytelse til kapitalmyndighet.',
    description:'Denne Role World-en følger ett vedvarende investeringscase fra kilde- og versjonslås via Theo-handoff, legitim venting og markedsdrevet rework til komitebehandling og beslutningsetterspill. Elin, Theo og investeringskomiteen vurderer samme arbeid fra ulike ståsteder, mens rollens myndighetsgrense forblir uendret: analytikeren kan analysere og anbefale, men ikke godkjenne investering eller flytte kapital.'
  },
  theme_ids:['professional_culture','numerical_control','status_anxiety','shame_reputation','loyalty_up_down','social_mask','bureaucratic_power','public_private_leakage'],
  social_environments:[
    'Barcode-kontoret der regneark, modellversjoner og korte presentasjonsfrister gjør metodevalg sosialt synlige.',
    'Bankplassen som History Go-kontekst for finansinstitusjoner, kapital, dokumentasjon og beslutningsmakt uten å gi spilleren moderne institusjonell myndighet.',
    'Oslo Børs som stedlig kontekst for prisdannelse, notering og markedsinformasjon som kan endre analysepremisser raskt.',
    'Seniorreviewet med Theo, der venting og versjonsfrys må behandles som legitimt arbeid fremfor produktivitetstap.',
    'Porteføljeflaten med Elin, der beslutningsklarhet, risiko og intern standing trekker analysen mot tydeligere konklusjoner.',
    'Investeringskomiteen der analytisk innflytelse stopper ved anbefalingen og faktisk kapitalmyndighet ligger hos beslutningsorganet.',
    'Den private kvelden etter komitémøtet, der behovet for å ha rett kan følge analytikeren hjem og gjøre usikkerhet personlig.'
  ],
  recurring_people_archetypes:[
    {id:'elin_portefoljeansvarlig',social_function:'porteføljeansvarlig som trenger beslutningsklar analyse og eier overleveringen til komiteen',class_position:'senior beslutningsnær rolle med høy organisatorisk innflytelse',status:'høy formell og situert status',power_over_player:'kan prioritere analysearbeid, vurdere spillerens ansvar og avgjøre hvilke råd som tas videre',wants:'en klar anbefaling med synlige usikkerhetsdrivere og et spor hun kan forsvare',conceals:'hvor sterkt hun presses til å komme til møtet med én retning selv når datagrunnlaget er betinget',speech_style:'kort og beslutningsorientert; spør hva du mener, hva som må være sant og hva som kan endre rådet',teaches_player:'at beslutningsklarhet er verdifullt når den ikke kjøpes ved å skjule usikkerhet'},
    {id:'theo_senioranalytiker',social_function:'senioranalytiker som eier metode-review, versjonskontroll og faglig motstand',class_position:'senior fagspesialist uten investeringskomiteens formelle kapitalmyndighet',status:'høy situert fagstatus',power_over_player:'kan styrke eller svekke tilliten til modell, kildebruk og analytisk håndverk',wants:'én autoritativ modellversjon med kildetype, sensitivitet og endringsspor som tåler review',conceals:'hvor mye egen standing også påvirkes av om teamets modeller senere viser seg å være etterprøvbare',speech_style:'presis og teknisk; spør hvilken celle, kilde, versjon og sensitivitet som faktisk bærer konklusjonen',teaches_player:'at venting og rework er deler av god metode når de bevarer sporbarhet'},
    {id:'investeringskomite',social_function:'beslutningsgruppe som mottar analyse og faktisk kan godkjenne eller avvise kapitalbeslutningen',class_position:'formelt beslutningsorgan med høy kapitalmyndighet',status:'svært høy formell status',power_over_player:'kan bruke, utfordre eller avvise analysen og påvirke spillerens videre standing uten å overta metodeansvaret',wants:'et kort beslutningsgrunnlag som fortsatt viser hva anbefalingen avhenger av og hvem som bærer nedsiden',conceals:'at komiteens behov for et vedtak kan gjøre betinget usikkerhet sosialt mindre attraktiv enn skarpe svar',speech_style:'komprimert og utfordrende; spør kjøp eller ikke, hvorfor nå, hva kan gå galt og hvem eier premisset',teaches_player:'at analytisk autoritet stopper ved rådet selv når komiteen stoler på spilleren'},
    {id:'selskap_ir_kontakt',social_function:'ekstern informasjonskilde som representerer selskapets rapportering og guiding',class_position:'selskapets profesjonelle kommunikasjonsflate med informasjonsmakt men uten kontroll over spillerens metode',status:'middels formell status og høy kildebetydning',power_over_player:'kan tilføre ny guiding og forklaringer som endrer modellpremisser, men kan ikke bestemme hvordan analysen klassifiserer usikkerheten',wants:'at markedet forstår selskapets strategi og fremtidsforventninger på en sammenhengende måte',conceals:'hvor grensen går mellom legitim guiding, optimistisk framing og informasjon som ennå ikke er bevist',speech_style:'kontrollert og investorrettet; skiller rapporterte fakta fra fremoverskuende budskap når den presses',teaches_player:'at kilde og interesse må klassifiseres før informasjon får samme status som historiske tall'},
    {id:'finansanalytiker_privat_venn',social_function:'privat likemann som møter spilleren etter timer med modeller, komitepress og behov for å være sikker',class_position:'privat relasjon uten organisatorisk eller kapitalmessig makt',status:'emosjonell nærhet uten arbeidsrang',power_over_player:'kan utfordre profesjonsmasken og vise når ønsket om å ha rett blir identitet fremfor metode',wants:'en samtale der usikkerhet kan være ekte uten å bli omgjort til scenario, prosent eller prestasjonsfortelling',conceals:'at hun blir sliten av å bli møtt som et publikum som skal overbevises i stedet for en person',speech_style:'uformell og direkte; spør om du faktisk vet det eller bare trenger å føle deg sikker',teaches_player:'at standing i finansmiljøet ikke bestemmer sosial verdi eller sannhet privat'}
  ],
  slow_axes:[
    {id:'standing_manager',meaning:'Elins situerte tillit til at spilleren leverer beslutningsklar analyse uten å skjule hva rådet avhenger av',runtime_binding:'existing'},
    {id:'standing_senior',meaning:'Theos situerte tillit til modellversjon, kildeklassifisering, sensitivitet og sporbar rework',runtime_binding:'existing'},
    {id:'standing_committee',meaning:'komiteens situerte vurdering av analysens brukbarhet uten at standing gir spilleren kapitalmyndighet',runtime_binding:'existing'},
    {id:'model_integrity',meaning:'om historikk, guiding, egne estimater og scenarioer forblir adskilt gjennom hele arbeidsobjektet',runtime_binding:'existing'},
    {id:'waiting_cost',meaning:'presset til å produsere ny aktivitet når caset legitimt venter på review eller beslutning',runtime_binding:'editorial_only_until_governed'},
    {id:'rework_debt',meaning:'kostnaden ved parallelle versjoner og umerkede premissendringer som må ryddes før anbefalingen kan brukes',runtime_binding:'editorial_only_until_governed'},
    {id:'authority_clarity',meaning:'om analyse, anbefaling, porteføljeoverlevering og komitevedtak holdes institusjonelt adskilt',runtime_binding:'existing'},
    {id:'private_certainty_mask',meaning:'om profesjonell sikkerhet og resultatbehov lekker inn i privat identitet etter beslutningen',runtime_binding:'editorial_only_until_governed'}
  ],
  season:{days:14,day_phases:['morning','lunch','afternoon','evening'],coverage},
  primary_threads:[
    thread('modell_og_kildespor','Forholdet mellom spillerens modell, kildetype og én autoritativ versjon gjennom hele investeringscaset.',['1/morning','2/morning','3/afternoon','5/morning','7/afternoon','10/morning','13/morning']),
    thread('seniorreview_og_venting','Forholdet til Theo der faglig tillit bygges gjennom handoff, venting, review og sporbar retur.',['1/lunch','2/lunch','2/afternoon','3/lunch','5/lunch','6/lunch','9/lunch','13/lunch']),
    thread('markedsdrevet_rework','Hvordan ny guiding og markedsinformasjon kan legitimt åpne samme arbeidsobjekt for rework uten versjonsbrudd.',['4/afternoon','5/afternoon','6/afternoon','7/morning','8/afternoon','9/afternoon','10/afternoon']),
    thread('komite_og_myndighet','Skillet mellom analytisk anbefaling, Elins overlevering og komiteens faktiske myndighet til å beslutte kapital.',['7/lunch','8/lunch','9/morning','10/lunch','11/afternoon','12/afternoon','13/afternoon']),
    thread('analytikeridentitet_og_etterspill','Hvordan standing, ønsket om skarpe svar og senere utfall påvirker profesjonsmasken og læringen etter caset.',['1/evening','4/evening','7/evening','10/evening','11/evening','12/evening','13/evening','14/evening'])
  ],
  private_aftermath:[
    {id:'waiting_feels_like_failure',description:'Mens Theo reviewer, merker spilleren hvor sterkt finansmiljøet kan gjøre legitim venting til en følelse av å være mindre nyttig, og fristelsen til å lage en parallell modell følger med hjem.',materialization_refs:[refs.people,refs.micro]},
    {id:'sharp_answer_identity',description:'Etter komitepresset kan ønsket om en ren kjøp/ikke-kjøp-konklusjon bli en personlig målestokk på om analytikeren virker smart nok, selv når faglig kvalitet krever betingelser.',materialization_refs:[refs.conflict,refs.story]},
    {id:'decision_is_not_self',description:'Når caset venter på komiteen, må spilleren skille egen verdi og standing fra om beslutningsorganet følger anbefalingen.',materialization_refs:[refs.followup,refs.story]},
    {id:'outcome_bias_home',description:'Etter vedtaket og senere markedsbevegelse utfordres spilleren til å huske hva som faktisk var kjent på beslutningstidspunktet i stedet for å bruke utfallet som identitet.',materialization_refs:[refs.consequence,refs.story]}
  ],
  delayed_consequences:[
    {id:'version_debt_returns',setup_ref:'2/afternoon',return_ref:'5/afternoon',domains:['job','reputation']},
    {id:'source_blur_returns',setup_ref:'1/morning',return_ref:'7/afternoon',domains:['job','narrative']},
    {id:'senior_trust_returns',setup_ref:'2/lunch',return_ref:'9/lunch',domains:['relationship','reputation']},
    {id:'market_rework_returns',setup_ref:'5/morning',return_ref:'10/afternoon',domains:['job','economy']},
    {id:'authority_boundary_returns',setup_ref:'10/lunch',return_ref:'12/afternoon',domains:['job','reputation']},
    {id:'result_bias_returns',setup_ref:'13/evening',return_ref:'14/evening',domains:['psyche','narrative','reputation']}
  ],
  materialization:{no_new_runtime:true,source_refs:Object.values(refs)}
};
write(WORLD_PATH, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
index.roles = (index.roles || []).filter(row => `${row.category}/${row.role_scope}` !== KEY);
index.roles.push({category:'naeringsliv',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
index.effective_date = '2026-08-27';
index.note = 'Reference- og pilotbevisene består uendret. Finansanalytiker er materialisert som kontrollert Role World-rollout med ett vedvarende investeringscase, eksplisitt waiting/handoff/rework og audience-spesifikk standing uten at analytisk standing gir kapitalmyndighet.';
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

const report = `# Civication Role World rollout — Næringsliv Finansanalytiker\n\nStatus: Materialisert på kontrollert rollout-branch; completion gjelder først etter fail-closed generatorer, streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.\n\n## Scope\n\n- Lukker bare de dokumenterte authored debt-punktene \`rhythm_waiting_handoff_rework\` og \`situated_reputation\`.\n- Gjenbruker eksisterende ni mailtyper og eksisterende sterke finansscener; bare fem nye scener materialiseres der vedvarende caseflyt faktisk manglet.\n- Ett arbeidsobjekt følger analyse fra baseline gjennom Theo-handoff, waiting, markedsdrevet rework, komitehandoff og beslutningsetterspill.\n- Audience-spesifikk standing skilles mellom Elin, Theo og investeringskomiteen. Standing påvirker tillit og tolkning, aldri formell investeringsmyndighet.\n- Work grammar beholdes uendret: Finansanalytiker kan analysere og anbefale, men kan ikke godkjenne investering, flytte kapital eller overstyre beslutningsorgan.\n- Ingen ny runtime eller parallell scenemotor.\n\n## Materialisering\n\n- 14 dager × 4 faser = 56 dramaturgiske beats.\n- 5 nye rolle-spesifikke scener: case-open, senior-handoff/waiting, market-rework, committee-waiting og committee-aftermath.\n- Eksisterende story, knowledge, micro og conflict-scener brukes som provenance i sesonggridet.\n- Mailplan utvides fra 8 til 13 steg uten å skrive om den eksisterende faglige buen.\n\n## Kvalitetsgrense\n\nRollouten skal feile lukket hvis persistent work object, waiting/handoff/rework, audience-spesifikk standing, myndighetsgrense, provenance, compiled registry, Career Gameplay Matrix eller readiness ikke kan bevises samlet.\n`;
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/CIVICATION_NAERINGSLIV_FINANSANALYTIKER_ROLE_WORLD_ROLLOUT.md'),report);

console.log('Materialized Finansanalytiker Role World rollout');
console.log(JSON.stringify({world:WORLD_PATH,new_scenes:[open.id,handoff.id,market.id,committee.id,aftermath.id],plan_steps:plan.sequence.length},null,2));
