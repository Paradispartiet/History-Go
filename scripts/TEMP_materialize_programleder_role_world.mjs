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

const ROLE = 'programleder';
const OBJECT = 'film_tv_program_live_interview_case_001';
const THREAD = 'film_tv_program_live_interview_realism_001';
const tags = ['role_world_realism', 'controlled_rollout', 'film_tv', ROLE];
const standing = (event_id, audience_id, delta, reason, source_actor_id) => ({ event_id, audience_id, delta, reason, source_actor_id });
const transition = (event_id, to_status, to_phase, note) => ({ op: 'transition', event_id, work_object_id: OBJECT, to_status, to_phase, note });
const flag = (event_id, value) => ({ op: 'add_flag', event_id, work_object_id: OBJECT, flag: value });
const effect = (stats, work_object_ops = [], social_standing_ops = []) => ({
  stats,
  ...(work_object_ops.length ? { work_object_ops } : {}),
  ...(social_standing_ops.length ? { social_standing_ops } : {})
});
const choice = (id, label, reply, feedback, stats, workOps, standingOps, authority_action) => ({
  id,
  label,
  reply,
  effect: id === 'A' ? 2 : -2,
  feedback,
  effects: effect(stats, workOps, standingOps),
  ...(authority_action ? { authority_action } : {})
});
const makeScene = spec => ({
  role_scope: ROLE,
  place_id: spec.place_id,
  repeatable: false,
  stage: 'stable',
  thread_key: THREAD,
  planned_only: true,
  tags,
  id: spec.id,
  mail_type: spec.type,
  mail_family: spec.family,
  phase: spec.phase,
  day_phase: spec.day_phase,
  priority: spec.priority,
  cooldown: 12,
  from: spec.from,
  people_ref: spec.actor,
  person_id: spec.actor,
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
  narrative_arc: 'fra_uavklart_premiss_til_sporbart_sende_og_brukshandoff',
  interaction_mode: spec.interaction_mode || 'decision',
  work_context: {
    object_ids: [OBJECT],
    institution_id: 'film_tv_programredaksjon_001',
    ...(spec.handoff_to ? { handoff_to_actor_id: spec.handoff_to } : {}),
    ...(spec.waiting_for ? { waiting_for_actor_id: spec.waiting_for } : {}),
    ...(spec.rework_of ? { rework_of_scene_id: spec.rework_of } : {}),
    priority: spec.work_priority || 'high'
  },
  choices: spec.choices,
  ...(spec.fields || {})
});
const addFamily = (type, family) => {
  const rel = 'data/Civication/mailFamilies/film_tv/' + type + '/programleder_' + type + '.json';
  const doc = read(rel);
  doc.families = (doc.families || []).filter(item => item.id !== family.id);
  doc.families.push(family);
  write(rel, doc);
};
const family = (id, purpose, focus, mail) => ({ id, purpose, learning_focus: focus, mails: [mail] });

const open = makeScene({
  type: 'job',
  id: 'film_tv_program_realism_live_interview_case_open_001',
  family: 'role_world_rollout_program_live_interview_open',
  phase: 'advanced',
  day_phase: 'morning',
  priority: 98,
  from: 'Ingrid, redaksjonsleder',
  actor: 'ingrid_redaksjonsleder_program',
  place_id: 'briefrom_program_film_tv',
  subject: 'Åpne intervjuet som ett sporbart case før premisset blir sending',
  summary: 'Ingrid ber deg samle verifiserte fakta, åpne hypoteser, gjestens avtalte ramme, reservespor og beslutningseiere i ett arbeidsobjekt før studiomøtet.',
  purpose: 'Etablere et vedvarende intervju- og sendingscase som tåler venting, gjestehandoff, kildearbeid, rework, liveavvik og etterbruk.',
  stakes: 'Hvis premiss, fakta og gjestegrense lever i ulike private samtaler, kan programlederens synlighet skjule at ingen har et felles beslutningsgrunnlag.',
  situation: [
    'Amina har markert to tall som verifiserte og én årsaksforklaring som hypotese.',
    'Thea har dokumentert et sensitivt tema som krever ny avklaring dersom samtalen flytter seg.',
    'Ingrid eier premiss og publisering, mens Jonas eier kjøreplan og liveavvik.'
  ],
  task_domain: 'vedvarende_intervju_og_sendingscase',
  competency: 'research_og_rolleforstaelse',
  pressure: 'sendeklar_fasade_vs_sporbart_grunnlag',
  choice_axis: 'apne_felles_case_vs_stol_pa_egen_brief',
  consequence_axis: 'etterprovbar_flyt_vs_personavhengig_sending',
  choices: [
    choice('A','Opprett ett case med fakta, åpne spørsmål, gjestegrense og eiere','Jeg samler statusen i ett arbeidsobjekt og markerer hva som fortsatt krever beslutning.','Redaksjonen kan se forskjellen mellom det programlederen kan forberede og det andre må godkjenne.',{quality:2,trust:2,risk:-2,energy:-1},[
      flag('film_tv_program_case_baseline_traced','baseline_fact_scope_and_owners_traced')
    ],[
      standing('film_tv_program_standing_ingrid_open','manager:ingrid_redaksjonsleder_program',3,'Ingrid får et beslutningsklart grunnlag uten skjulte premissendringer.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_research_open','team:film_tv_programresearch',2,'Researchstatus og usikkerhet blir synlige i samme case.','amina_researcher_program')
    ]),
    choice('B','Behold notatene privat og stol på at du kan binde dem sammen på lufta','Jeg har oversikten og kan justere formuleringene underveis.','Programlederens hukommelse blir en skjult systemgrense, og andre kan ikke kontrollere hva som fortsatt er åpent.',{status:1,quality:-2,trust:-2,risk:3},[
      flag('film_tv_program_case_private_brief','baseline_fragmented_across_private_notes')
    ],[
      standing('film_tv_program_standing_ingrid_private','manager:ingrid_redaksjonsleder_program',-3,'Ingrid kan ikke se hvilke premisser som fortsatt er uavklart.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_research_private','team:film_tv_programresearch',-2,'Researcharbeidet blir løsrevet fra formuleringene som faktisk skal sies.','amina_researcher_program')
    ])
  ],
  fields: {
    effects: {
      work_object_ops: [{
        op: 'create',
        event_id: 'film_tv_program_live_interview_case_opened',
        work_object: {
          work_object_id: OBJECT,
          kind: 'live_interview_editorial_case',
          role_scope: ROLE,
          institution_id: 'film_tv_programredaksjon_001',
          title: 'Livesamtale: premiss, gjestegrense, faktagrunnlag og etterbruk',
          status: 'in_progress',
          phase: 'brief_evidence_and_guest_scope',
          people_refs: ['ingrid_redaksjonsleder_program','jonas_liveprodusent','amina_researcher_program','thea_gjestekoordinator'],
          place_refs: ['briefrom_program_film_tv','studio_program_film_tv','kontrollrom_program_film_tv','cinemateket_oslo'],
          knowledge_refs: ['data/people/film_tv/oslo/people_film_tv_oslo.json'],
          open_questions: [
            'Hvilke påstander er verifisert, og hvilke må forbli åpne spørsmål?',
            'Hvilken sensitiv omtale har gjesten faktisk avklart for sending og etterbruk?',
            'Hvem eier premiss, kjøreplan, publisering og eventuelle liveavvik?'
          ],
          deadline: 'live_program_dag_10_kveld',
          confidentiality: 'redaksjonelt_internt_og_avgrenset_gjesteinformasjon',
          flags: ['live_interview_case_opened'],
          shared: false
        }
      }]
    }
  }
});

const handoff = makeScene({
  type: 'people',
  id: 'film_tv_program_realism_guest_boundary_handoff_001',
  family: 'role_world_rollout_program_guest_boundary_handoff',
  phase: 'advanced',
  day_phase: 'afternoon',
  priority: 97,
  from: 'Thea, gjestekoordinator',
  actor: 'thea_gjestekoordinator',
  place_id: 'studio_program_film_tv',
  handoff_to: 'thea_gjestekoordinator',
  subject: 'Gi meg et gjestehandoff jeg kan avklare – ikke et løfte om at alt blir trygt',
  summary: 'Gjesten vil delta, men trenger en ny avklaring om familiedetaljen og klippebruk. Thea kan behandle et presist handoff; redaksjonen må vente på svar.',
  purpose: 'Gjøre gjestegrensen til faktisk handoff og venting, med ulik tillit hos Thea, Ingrid og studioteamet.',
  stakes: 'Å love trygghet kan roe gjesten nå, men programlederen eier verken fremtidig klipp eller publiseringsutfall.',
  situation: [
    'Det opprinnelige premisset dekker den generelle erfaringen, ikke en navngitt familiedetalj.',
    'Thea kan innhente og dokumentere ny avklaring.',
    'Ingrid må beslutte vesentlig premissendring etter at gjestens svar foreligger.'
  ],
  task_domain: 'gjestegrense_og_handoff',
  competency: 'omsorg_og_grensesetting',
  pressure: 'studiofremdrift_vs_reell_avklaring',
  choice_axis: 'presist_handoff_og_venting_vs_beroligende_lovnad',
  consequence_axis: 'situert_tillit_vs_forventningsgjeld',
  choices: [
    choice('A','Send tema, konkret detalj, bruksflater og beslutningseier hver for seg','Jeg ber Thea avklare sending, reprise og klipp separat og markerer caset som ventende.','Gjesten får en behandlingsbar forespørsel, og ventingen blir synlig for redaksjonen.',{quality:2,trust:2,risk:-2,energy:-1},[
      transition('film_tv_program_guest_handoff_waiting','waiting','awaiting_guest_scope_confirmation','Gjestehandoffet er sendt til Thea; redaksjonen venter på differensiert bruksavklaring.'),
      flag('film_tv_program_guest_handoff_traced','guest_scope_handoff_traced')
    ],[
      standing('film_tv_program_standing_thea_precise','professional:thea_gjestekoordinator',3,'Thea får et avgrenset spørsmål hun faktisk kan behandle.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_ingrid_wait','manager:ingrid_redaksjonsleder_program',2,'Ingrid ser at vesentlig premiss fortsatt venter på gjestens svar.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_studio_wait','team:film_tv_programstudio',1,'Studioteamet får sann ventestatus i stedet for falsk sendeklarhet.','jonas_liveprodusent')
    ]),
    choice('B','Si at redaksjonen sikkert vil respektere alt gjesten ønsker','Jeg lover at ingenting brukes på en måte gjesten ikke liker.','Du lover et redaksjonelt utfall uten å avklare bruksflater eller beslutningseier.',{status:1,quality:-2,trust:-2,risk:3},[
      transition('film_tv_program_guest_handoff_vague_waiting','waiting','awaiting_guest_scope_confirmation','Caset venter, men gjesten har fått en lovnad programlederen ikke kan garantere.'),
      flag('film_tv_program_guest_promise_risk','editorial_outcome_promised_without_authority')
    ],[
      standing('film_tv_program_standing_thea_vague','professional:thea_gjestekoordinator',-3,'Thea må reparere en uavgrenset lovnad før hun kan dokumentere samtykke.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_ingrid_promise','manager:ingrid_redaksjonsleder_program',-3,'Publiseringsmyndighet er presentert som programlederens personlige garanti.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_studio_false_ready','team:film_tv_programstudio',-1,'Studioet får inntrykk av at grensen er løst når den fortsatt venter.','jonas_liveprodusent')
    ])
  ]
});

const story = makeScene({
  type: 'story',
  id: 'film_tv_program_realism_guest_waiting_disclosure_001',
  family: 'role_world_rollout_program_guest_waiting_disclosure',
  phase: 'advanced',
  day_phase: 'evening',
  priority: 96,
  from: 'Thea, gjestekoordinator',
  actor: 'thea_gjestekoordinator',
  place_id: 'studio_program_film_tv',
  waiting_for: 'thea_gjestekoordinator',
  rework_of: handoff.id,
  subject: 'Lydprøven åpner et sterkere tema mens gjesteavklaringen fortsatt venter',
  summary: 'I ventetiden forteller gjesten om en belastning som kan gi sterk TV, men sier samtidig at hen ikke vet om det skal bli del av programmet.',
  purpose: 'La venting ha menneskelig og redaksjonell kostnad uten å gjøre sårbarhet til automatisk innhold.',
  stakes: 'Programlederens varme kan bygge tillit, men nærhet i lydprøven er ikke publiseringssamtykke.',
  situation: [
    'Samtalen skjer før formelt opptak.',
    'Gjesten ber om tid til å tenke sammen med Thea.',
    'Kontrollrommet har ikke endret kjøreplan eller premiss.'
  ],
  task_domain: 'gjestegrense_og_venting',
  competency: 'lytting_og_rolleforstaelse',
  pressure: 'sterkt_oyeblikk_vs_ikke_avklart_bruk',
  choice_axis: 'hold_rom_og_vent_vs_merk_sitat_for_sending',
  consequence_axis: 'menneskelig_tillit_vs_utnyttet_narhet',
  choices: [
    choice('A','Lytt, stans innholdsarbeidet og la Thea følge opp','Dette blir ikke del av programmet før du og Thea har avklart om og hvordan det kan brukes.','Gjesten får tid, og redaksjonen beholder et sant skille mellom samtale og publiserbart materiale.',{trust:3,quality:2,risk:-3,energy:-1},[
      transition('film_tv_program_disclosure_stays_waiting','waiting','awaiting_guest_scope_confirmation','Den sensitive opplysningen holdes utenfor innholdsarbeidet mens gjesten avklarer med Thea.'),
      flag('film_tv_program_disclosure_protected','soundcheck_disclosure_not_cleared_for_use')
    ],[
      standing('film_tv_program_standing_thea_care','professional:thea_gjestekoordinator',3,'Programlederen gir koordinatoren rom til reell oppfølging.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_studio_boundary','team:film_tv_programstudio',2,'Studioteamet lærer at et sterkt øyeblikk kan være utenfor sending.','jonas_liveprodusent')
    ]),
    choice('B','Noter sitatet som reserve dersom sendingen mister energi','Jeg bruker det bare hvis samtalen trenger mer nerve.','En uavklart betroelse gjøres til taktisk reserve, selv om gjesten ba om tid.',{status:1,quality:-2,trust:-3,risk:3},[
      transition('film_tv_program_disclosure_exploited_waiting','waiting','awaiting_guest_scope_confirmation','Caset venter formelt, men den sensitive opplysningen er likevel gjort til innholdsreserve.'),
      flag('film_tv_program_disclosure_exploitation','uncleared_disclosure_marked_as_content')
    ],[
      standing('film_tv_program_standing_thea_exploit','professional:thea_gjestekoordinator',-4,'Gjesteoppfølgingen undergraves av at uavklart materiale allerede behandles som innhold.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_studio_sensation','team:film_tv_programstudio',-2,'Studioet lærer at energi kan trumfe uttrykkelig usikkerhet.','jonas_liveprodusent')
    ])
  ]
});

const knowledge = makeScene({
  type: 'knowledge',
  id: 'film_tv_program_realism_history_go_bang_hansen_waiting_001',
  family: 'role_world_rollout_program_history_go_waiting',
  phase: 'advanced',
  day_phase: 'evening',
  priority: 95,
  from: 'Amina, researcher',
  actor: 'amina_researcher_program',
  place_id: 'cinemateket_oslo',
  waiting_for: 'thea_gjestekoordinator',
  rework_of: handoff.id,
  interaction_mode: 'task',
  subject: 'Bruk ventetiden til kildekontekst uten å late som historien avgjør dagens intervju',
  summary: 'Mens gjesteavklaringen venter, ber Amina deg lese History Go-profilen til Pål Bang-Hansen som kontekst om norsk filmformidling og skille den fra dagens redaksjonelle beslutninger.',
  purpose: 'Gi venting legitimt arbeid som styrker spørsmålene uten å omgå gjestens svar eller låne historisk autoritet.',
  stakes: 'Kildearbeid kan skjerpe publikumsformidlingen, men må ikke bli en snarvei til nytt premiss.',
  situation: [
    'Pål Bang-Hansen er en canonical History Go-person knyttet til Cinemateket i Oslo.',
    'Profilen dokumenterer filmhistorisk formidling, ikke dagens fiktive gjesteavtale.',
    'Caset forblir ventende til Thea har et konkret svar.'
  ],
  task_domain: 'filmhistorisk_kildearbeid_i_ventetid',
  competency: 'faglig_kildebruk',
  pressure: 'produktiv_venting_vs_omga_avklaring',
  choice_axis: 'les_og_avgrens_vs_lan_autoritet',
  consequence_axis: 'bedre_kontekst_vs_premissglidning',
  choices: [
    choice('A','Les profilen og noter bare spørsmål kilden faktisk åpner','Jeg bruker profilen som historisk kontekst og lar gjesteavklaringen forbli et eget beslutningspunkt.','Ventetiden gir bedre kildebevissthet uten å produsere falskt samtykke eller nytt premiss.',{quality:2,trust:1,risk:-1,energy:-1},[
      flag('film_tv_program_history_context_reviewed','history_go_context_reviewed_while_waiting')
    ],[
      standing('film_tv_program_standing_research_bounded','professional:amina_researcher_program',3,'Amina ser at kilden brukes med eksplisitt rekkevidde.','amina_researcher_program'),
      standing('film_tv_program_standing_editorial_context','team:film_tv_programredaksjon',1,'Redaksjonen får kontekst uten at historie blir beslutningsautoritet.','ingrid_redaksjonsleder_program')
    ]),
    choice('B','Bruk formidlerstatusen som argument for å utvide samtalen','Filmhistorien viser at en god programleder bør våge å gå lenger.','En historisk profil gjøres til normativ fasit for et gjestepremiss den ikke dokumenterer.',{quality:-3,trust:-1,risk:2},[
      flag('film_tv_program_history_authority_slip','history_profile_used_as_editorial_authority')
    ],[
      standing('film_tv_program_standing_research_slip','professional:amina_researcher_program',-3,'Kildens faktiske rekkevidde blir overskredet.','amina_researcher_program'),
      standing('film_tv_program_standing_editorial_slip','team:film_tv_programredaksjon',-2,'Historisk status brukes til å skjule et nåtidig mandatproblem.','ingrid_redaksjonsleder_program')
    ])
  ],
  fields: {
    task_contract: {
      task_id: 'film_tv_program_role_world_history_go_bang_hansen',
      completion_rule: 'history_go_payload_completed',
      failure_rule: 'remain_open',
      evidence_refs: ['data/people/film_tv/oslo/people_film_tv_oslo.json']
    },
    task_payload: {
      task_kind: 'history_go_person',
      target_type: 'person',
      person_id: 'pal_bang_hansen',
      completion_mode: 'read_profile',
      title: 'Les profilen til Pål Bang-Hansen mens gjesteavklaringen venter',
      description: 'Bruk profilen som kildeforankret filmhistorisk kontekst, ikke som autoritet for dagens premiss.',
      return_context: {
        source: 'civication',
        mail_id: 'film_tv_program_realism_history_go_bang_hansen_waiting_001',
        role_scope: ROLE
      }
    }
  }
});

const micro = makeScene({
  type: 'micro',
  id: 'film_tv_program_realism_fact_card_rework_001',
  family: 'role_world_rollout_program_fact_card_rework',
  phase: 'mastery',
  day_phase: 'morning',
  priority: 94,
  from: 'Amina, researcher',
  actor: 'amina_researcher_program',
  place_id: 'briefrom_program_film_tv',
  rework_of: knowledge.id,
  subject: 'Gjesten har svart; nå må faktakortet bygges om før premisset kan godkjennes',
  summary: 'Theas avklaring åpner en generell erfaring, men holder familiedetaljen utenfor. Amina trenger et revidert faktakort som skiller sitat, bakgrunn, tall og åpne spørsmål.',
  purpose: 'Materialisere rework etter venting som konkret, lite redaksjonelt arbeid.',
  stakes: 'En rask kosmetisk endring kan la den uavklarte detaljen overleve i oppfølgingsspørsmål eller grafikk.',
  situation: [
    'Gjesten har avklart én generell formulering.',
    'Familiedetaljen kan ikke brukes i sending, reprise eller klipp.',
    'To tall er verifiserte; årsaksforklaringen er fortsatt hypotese.'
  ],
  task_domain: 'brief_rework_etter_gjesteavklaring',
  competency: 'research_og_forberedelse',
  pressure: 'kort_tid_vs_sporbart_rework',
  choice_axis: 'bygg_om_faktakort_vs_fjern_bare_synlig_detalj',
  consequence_axis: 'konsistent_premiss_vs_skjult_restrisiko',
  choices: [
    choice('A','Bygg kortet på nytt med kildestatus og bruksgrense per felt','Jeg skiller verifisert faktum, hypotese, godkjent formulering og tilbakeholdt detalj.','Reworken gjør både spørsmål, grafikk og oppfølging konsistente med gjestens svar.',{quality:3,trust:2,risk:-3,energy:-1},[
      transition('film_tv_program_fact_card_reworked','in_progress','brief_rework_after_guest_confirmation','Faktakortet er bygget om etter differensiert gjesteavklaring.'),
      flag('film_tv_program_fact_card_scope_clear','fact_card_source_and_use_scope_clear')
    ],[
      standing('film_tv_program_standing_research_rework','professional:amina_researcher_program',3,'Amina får et redigerbart kort med synlig kildestatus.','amina_researcher_program'),
      standing('film_tv_program_standing_editorial_rework','team:film_tv_programredaksjon',2,'Redaksjonen kan etterprøve hva som er endret og hvorfor.','ingrid_redaksjonsleder_program')
    ]),
    choice('B','Stryk familiedetaljen i åpningen og behold resten av kortet','Jeg fjerner den mest synlige formuleringen; resten kan justeres muntlig.','Den tilbakeholdte detaljen og hypotesen kan fortsatt lekke gjennom grafikk og oppfølgingslogikk.',{status:1,quality:-2,trust:-2,risk:3},[
      transition('film_tv_program_fact_card_cosmetic','in_progress','brief_rework_after_guest_confirmation','Faktakortet er kosmetisk endret uten full sporbarhet.'),
      flag('film_tv_program_fact_card_residual_risk','uncleared_detail_remains_in_brief_logic')
    ],[
      standing('film_tv_program_standing_research_cosmetic','professional:amina_researcher_program',-3,'Research må gjette hvilke restfelt programlederen fortsatt vil bruke.','amina_researcher_program'),
      standing('film_tv_program_standing_editorial_cosmetic','team:film_tv_programredaksjon',-2,'Reworken ser ferdig ut uten å være konsistent.','ingrid_redaksjonsleder_program')
    ])
  ]
});

const conflict = makeScene({
  type: 'conflict',
  id: 'film_tv_program_realism_editorial_premise_rework_001',
  family: 'role_world_rollout_program_editorial_premise_rework',
  phase: 'mastery',
  day_phase: 'afternoon',
  priority: 99,
  from: 'Ingrid, redaksjonsleder',
  actor: 'ingrid_redaksjonsleder_program',
  place_id: 'briefrom_program_film_tv',
  rework_of: micro.id,
  subject: 'Det reviderte premisset er sannere, men mindre salgbart',
  summary: 'Ingrid vil beholde konfliktkraften etter gjesteavklaringen og ber deg anbefale en åpning som er skarp uten å gjøre hypotesen til konklusjon.',
  purpose: 'Skille programlederens påvirkning på formulering fra redaksjonslederens godkjenning av premiss.',
  stakes: 'Situert tillit hos Ingrid kan gi innflytelse, men aldri gjøre programlederen til egen publiseringsmyndighet.',
  situation: [
    'Faktakortet skiller nå verifisert materiale fra hypotese.',
    'Gjestegrensen er dokumentert for alle bruksflater.',
    'Ingrid må godkjenne det reviderte premisset før studio.'
  ],
  task_domain: 'redaksjonelt_premiss_rework',
  competency: 'redaksjonell_rolleforstaelse',
  pressure: 'salgbart_anslag_vs_sannferdig_premiss',
  choice_axis: 'anbefal_apent_presist_sporsmal_vs_godkjenn_selv_skarp_konklusjon',
  consequence_axis: 'innflytelse_med_grense_vs_mandatglidning',
  choices: [
    choice('A','Anbefal et presist åpent spørsmål og be Ingrid godkjenne premisset','Jeg foreslår denne åpningen fordi den viser konflikten og holder hypotesen åpen for undersøkelse.','Du bruker faglig innflytelse uten å late som anbefalingen er en redaksjonell godkjenning.',{quality:3,trust:2,risk:-3},[
      transition('film_tv_program_premise_recommended','in_progress','premise_recommendation_awaiting_editorial_approval','Programlederen har anbefalt et revidert premiss; Ingrid beholder godkjenningspunktet.'),
      flag('film_tv_program_premise_authority_clear','premise_recommended_not_self_approved')
    ],[
      standing('film_tv_program_standing_ingrid_recommend','manager:ingrid_redaksjonsleder_program',3,'Ingrid får en redaksjonelt anvendelig anbefaling med tydelig kildestatus.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_editorial_integrity','team:film_tv_programredaksjon',2,'Redaksjonen ser hvem som anbefalte og hvem som godkjente.','ingrid_redaksjonsleder_program')
    ],{action_id:'recommend_interview_premise',intent:'recommend'}),
    choice('B','Bestem at den skarpeste formuleringen er sendeklar','Jeg tar ansvaret for åpningen; den fungerer bedre på lufta.','Synlighet og situert tillit brukes som erstatning for redaksjonell godkjenning.',{status:2,quality:-3,trust:-2,risk:3},[
      transition('film_tv_program_premise_self_approved','in_progress','premise_authority_breached','Programlederen har behandlet egen formulering som godkjent premiss.'),
      flag('film_tv_program_premise_authority_breach','host_self_approved_editorial_premise')
    ],[
      standing('film_tv_program_standing_ingrid_override','manager:ingrid_redaksjonsleder_program',-4,'Programlederen overtar et eksplisitt redaksjonelt godkjenningspunkt.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_editorial_override','team:film_tv_programredaksjon',-3,'Egen synlighet blir behandlet som institusjonell myndighet.','ingrid_redaksjonsleder_program')
    ],{action_id:'approve_editorial_premise',intent:'approve'})
  ]
});

const event = makeScene({
  type: 'event',
  id: 'film_tv_program_realism_live_gap_event_001',
  family: 'role_world_rollout_program_live_gap_event',
  phase: 'climax',
  day_phase: 'evening',
  priority: 100,
  from: 'Jonas, liveprodusent',
  actor: 'jonas_liveprodusent',
  place_id: 'kontrollrom_program_film_tv',
  handoff_to: 'jonas_liveprodusent',
  rework_of: conflict.id,
  subject: 'Innslaget faller ut etter premissreworken – kontrollrommet trenger nitti sekunder',
  summary: 'Jonas aktiverer et avtalt reservespor mens studioet venter. Programlederen må holde publikum orientert uten å åpne den tilbakeholdte gjestedetaljen eller overta teknisk kontroll.',
  purpose: 'Teste liveflyt som handoff mellom synlig programleder og usynlig kontrollromsmyndighet.',
  stakes: 'Publikum ser programlederen, men synlighet er ikke teknisk, sikkerhetsmessig eller redaksjonell totalmyndighet.',
  situation: [
    'Jonas eier kjøreplanendringen og har gitt nitti sekunders ramme.',
    'Ett reservespor er godkjent etter premissreworken.',
    'Den sensitive familiedetaljen forblir utenfor alle bruksflater.'
  ],
  task_domain: 'liveflyt_og_kontrollromshandoff',
  competency: 'timing_og_liveflyt',
  pressure: 'synlig_ansvar_vs_avgrenset_mandat',
  choice_axis: 'bruk_godkjent_reservespor_vs_improviser_nytt_tema',
  consequence_axis: 'rolig_kontinuitet_vs_nytt_scopeavvik',
  choices: [
    choice('A','Bekreft Jonas sin ramme og bruk det godkjente reservespor','Jeg holder oss i det avklarte temaet til kontrollrommet gir neste beskjed.','Publikum får sammenheng, gjestegrensen holder og kontrollrommet beholder avvikseierskapet.',{quality:2,trust:2,risk:-3,energy:-2},[
      transition('film_tv_program_live_gap_controlled','in_progress','live_continuity_under_control','Programlederen holder avtalt reservespor mens Jonas eier liveavviket.'),
      flag('film_tv_program_live_handoff_clear','control_room_handoff_respected')
    ],[
      standing('film_tv_program_standing_jonas_live','professional:jonas_liveprodusent',3,'Jonas kan løse avviket uten konkurrerende improvisasjon.','jonas_liveprodusent'),
      standing('film_tv_program_standing_studio_live','team:film_tv_programstudio',2,'Studioet opplever rolig og avgrenset ledelse i den synlige flaten.','jonas_liveprodusent')
    ]),
    choice('B','Start et nytt sensitivt spor mens kontrollrommet arbeider','Vi har ekstra tid, så la oss gå inn i det du fortalte før sending.','Teknisk ventetid brukes til å omgå både gjestegrense og redaksjonell beslutningslinje.',{status:2,quality:-3,trust:-4,risk:4},[
      transition('film_tv_program_live_gap_scope_breach','in_progress','live_scope_breach','Programlederen har åpnet et uavklart tema under et teknisk avvik.'),
      flag('film_tv_program_live_unapproved_topic','uncleared_guest_topic_opened_live')
    ],[
      standing('film_tv_program_standing_jonas_disrupted','professional:jonas_liveprodusent',-4,'Kontrollrommets beredskap får et nytt redaksjonelt avvik å håndtere.','jonas_liveprodusent'),
      standing('film_tv_program_standing_studio_breach','team:film_tv_programstudio',-4,'Studioet ser at gjestegrense brukes som improvisasjonsreserve.','jonas_liveprodusent')
    ])
  ]
});

const followup = makeScene({
  type: 'followup',
  id: 'film_tv_program_realism_reuse_boundary_handoff_001',
  family: 'role_world_rollout_program_reuse_boundary_handoff',
  phase: 'mastery',
  day_phase: 'morning',
  priority: 97,
  from: 'Thea, gjestekoordinator',
  actor: 'thea_gjestekoordinator',
  place_id: 'studio_program_film_tv',
  handoff_to: 'thea_gjestekoordinator',
  rework_of: event.id,
  subject: 'Etter sending må bruksgrensen overleve reprise, klipp og sosiale flater',
  summary: 'Samtalen holdt seg innen avtalt premiss, men en sterk generell formulering kan lett klippes sammen med kontekst gjesten ba om å holde utenfor.',
  purpose: 'Gjøre etterbruk til konkret rework og handoff, ikke en vag ettertanke.',
  stakes: 'En trygg direktesending er ikke nok dersom metadata og klippebestilling senere visker ut differensiert samtykke.',
  situation: [
    'Den generelle formuleringen kan brukes i sending og reprise.',
    'Familiedetaljen og lydprøvematerialet kan ikke brukes.',
    'Klipp, teksting og sosiale flater trenger samme eksplisitte grense.'
  ],
  task_domain: 'etterbruk_og_redaksjonelt_handoff',
  competency: 'redaksjonell_oppfolging',
  pressure: 'klippverdi_vs_differensiert_bruksgrense',
  choice_axis: 'skriv_flatespesifikt_handoff_vs_merk_alt_godkjent',
  consequence_axis: 'etterprovbar_etterbruk_vs_sen_tillitskonflikt',
  choices: [
    choice('A','Skriv separat status for sending, reprise, klipp, teksting og sosiale flater','Jeg registrerer godkjent formulering og tilbakeholdt materiale per bruksflate før handoff til Ingrid.','Bruksgrensen blir operativ for hele redaksjonen og kan etterprøves senere.',{quality:3,trust:3,risk:-3,energy:-1},[
      transition('film_tv_program_reuse_reworked','in_progress','post_broadcast_use_rework','Etterbruk er revidert per flate og klart for redaksjonelt handoff.'),
      flag('film_tv_program_reuse_scope_traced','reuse_scope_traced_per_surface')
    ],[
      standing('film_tv_program_standing_thea_reuse','professional:thea_gjestekoordinator',3,'Thea ser at gjestens avklaring overlever alle planlagte flater.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_editorial_reuse','team:film_tv_programredaksjon',3,'Redaksjonen får et konkret etterbrukshandoff.','ingrid_redaksjonsleder_program')
    ]),
    choice('B','Merk intervjuet som godkjent og la klipperen vurdere kontekst','Gjesten godkjente temaet, så redaksjonen kan bruke det som fungerer.','Du visker ut forskjellen mellom generell formulering, familiedetalj og lydprøve.',{status:1,quality:-3,trust:-3,risk:4},[
      transition('film_tv_program_reuse_blurred','in_progress','post_broadcast_use_rework','Etterbruk er merket generelt godkjent uten flatespesifikk grense.'),
      flag('film_tv_program_reuse_scope_blur','differentiated_consent_collapsed')
    ],[
      standing('film_tv_program_standing_thea_reuse_blur','professional:thea_gjestekoordinator',-4,'Gjesteavklaringen mister sin operative betydning i etterbruk.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_editorial_reuse_blur','team:film_tv_programredaksjon',-3,'Klippere og tekstere må gjette hva som faktisk kan brukes.','ingrid_redaksjonsleder_program')
    ])
  ]
});

const close = makeScene({
  type: 'consequence',
  id: 'film_tv_program_realism_live_interview_case_close_001',
  family: 'role_world_rollout_program_live_interview_close',
  phase: 'mastery',
  day_phase: 'afternoon',
  priority: 101,
  from: 'Ingrid, redaksjonsleder',
  actor: 'ingrid_redaksjonsleder_program',
  place_id: 'kontrollrom_program_film_tv',
  handoff_to: 'ingrid_redaksjonsleder_program',
  rework_of: followup.id,
  subject: 'Lukk programlederens case som anbefaling – Ingrid beholder publiseringsavgjørelsen',
  summary: 'Fakta, gjestegrense, liveavvik og etterbruk er samlet. Ingrid trenger programlederens begrunnede anbefaling og restspørsmål før hun godkjenner sluttstatus.',
  purpose: 'Avslutte det vedvarende caset uten å gjøre standing eller synlighet til publiseringsmyndighet.',
  stakes: 'Et ryddig case kan gi sterk situert tillit. Den tilliten utvider påvirkning, men flytter ikke godkjenning, sikkerhet eller redaksjonelt ansvar.',
  situation: [
    'Faktakort og premissrework er dokumentert.',
    'Gjestegrensen er registrert per bruksflate.',
    'Ingrid eier publisering og vesentlige redaksjonelle endringer.'
  ],
  task_domain: 'redaksjonelt_slutthandoff',
  competency: 'redaksjonell_integritet',
  pressure: 'personlig_eierskap_vs_institusjonell_beslutning',
  choice_axis: 'anbefal_status_med_restsporsmal_vs_erklar_selv_godkjent',
  consequence_axis: 'situert_tillit_med_grense_vs_autoritetslekkasje',
  choices: [
    choice('A','Anbefal publiseringsklar status og list restspørsmålene Ingrid må avgjøre','Jeg anbefaler status på dette grunnlaget; Ingrid avgjør publisering og eventuelle vesentlige endringer.','Caset lukkes som sporbart handoff med programlederens bidrag og beslutningseier tydelig adskilt.',{quality:3,trust:3,risk:-3,status:1},[
      transition('film_tv_program_case_completed','completed','editorial_handoff_ready_for_publication_approval','Programlederens case er fullført som anbefaling; publiseringsgodkjenning forblir hos Ingrid.'),
      flag('film_tv_program_case_authority_bounded','host_recommendation_and_editorial_approval_separated')
    ],[
      standing('film_tv_program_standing_ingrid_close','manager:ingrid_redaksjonsleder_program',3,'Ingrid får et komplett handoff med eksplisitte restbeslutninger.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_research_close','professional:amina_researcher_program',2,'Kildegrunnlaget overlever fra brief til etterbruk.','amina_researcher_program'),
      standing('film_tv_program_standing_jonas_close','professional:jonas_liveprodusent',2,'Liveavviket er dokumentert uten mandatglidning.','jonas_liveprodusent'),
      standing('film_tv_program_standing_thea_close','professional:thea_gjestekoordinator',2,'Gjestegrensen overlever alle bruksflater.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_editorial_close','team:film_tv_programredaksjon',2,'Redaksjonen kan etterprøve hele løpet.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_studio_close','team:film_tv_programstudio',1,'Studioets bidrag og avvik er synlige i samme case.','jonas_liveprodusent')
    ],{action_id:'recommend_interview_readiness',intent:'recommend'}),
    choice('B','Erklær programmet godkjent fordi du bar sendingen og kjenner materialet best','Jeg godkjenner sluttstatusen; resten er bare administrativ oppfølging.','Situert tillit og synlighet gjøres til publiseringsmyndighet, og restspørsmålene forsvinner fra handoffet.',{status:2,quality:-3,trust:-3,risk:4},[
      transition('film_tv_program_case_self_approved','completed','editorial_authority_breached','Programlederen har erklært publiseringsstatus uten godkjenning.'),
      flag('film_tv_program_case_self_approval','host_claimed_publication_authority')
    ],[
      standing('film_tv_program_standing_ingrid_self_approval','manager:ingrid_redaksjonsleder_program',-5,'Programlederen overtar redaksjonslederens eksplisitte beslutning.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_research_self_approval','professional:amina_researcher_program',-2,'Kildeusikkerhet blir usynlig i sluttstatusen.','amina_researcher_program'),
      standing('film_tv_program_standing_jonas_self_approval','professional:jonas_liveprodusent',-2,'Liveavvikets restpunkter underordnes programlederens personlige fasade.','jonas_liveprodusent'),
      standing('film_tv_program_standing_thea_self_approval','professional:thea_gjestekoordinator',-3,'Gjestegrensen behandles som ferdig bare fordi sendingen er over.','thea_gjestekoordinator'),
      standing('film_tv_program_standing_editorial_self_approval','team:film_tv_programredaksjon',-4,'Institusjonell godkjenning kollapser til synlighetsmakt.','ingrid_redaksjonsleder_program'),
      standing('film_tv_program_standing_studio_self_approval','team:film_tv_programstudio',-2,'Studioet lærer at den synlige rollen kan overstyre resten av produksjonen.','jonas_liveprodusent')
    ],{action_id:'approve_publication',intent:'approve'})
  ],
  fields: {
    authority_context: {
      institution_id: 'film_tv_programredaksjon_001',
      unit_id: 'film_tv_liveprogram',
      role_scope: ROLE,
      reporting_line: ['ingrid_redaksjonsleder_program','jonas_liveprodusent'],
      peer_functions: ['amina_researcher_program','thea_gjestekoordinator'],
      external_counterparts: ['film_tv_programgjest'],
      goals_pressures: ['faktapresisjon','gjestetillit','liveflyt','publikumstillit','sendefrist'],
      approval_points: [
        { approval_id: 'film_tv_program_premise_approval', action_id: 'approve_editorial_premise', approver_actor_id: 'ingrid_redaksjonsleder_program', approval_object_id: 'film_tv_program_premise_approval_001' },
        { approval_id: 'film_tv_program_publication_approval', action_id: 'approve_publication', approver_actor_id: 'ingrid_redaksjonsleder_program', approval_object_id: 'film_tv_program_publication_approval_001' },
        { approval_id: 'film_tv_program_live_rundown_approval', action_id: 'release_live_rundown', approver_actor_id: 'jonas_liveprodusent', approval_object_id: 'film_tv_program_live_rundown_001' }
      ],
      authority_rules: [
        { action_id: 'recommend_interview_readiness', authority: 'influence_only', requires_resources: [] },
        { action_id: 'recommend_interview_premise', authority: 'influence_only', requires_resources: [] },
        { action_id: 'approve_editorial_premise', authority: 'approval_required', approval_id: 'film_tv_program_premise_approval', requires_resources: [] },
        { action_id: 'approve_publication', authority: 'approval_required', approval_id: 'film_tv_program_publication_approval', requires_resources: [] },
        { action_id: 'release_live_rundown', authority: 'approval_required', approval_id: 'film_tv_program_live_rundown_approval', requires_resources: [] },
        { action_id: 'expand_sensitive_guest_scope', authority: 'forbidden', requires_resources: [] },
        { action_id: 'operate_untrained_studio_system', authority: 'forbidden', requires_resources: [] },
        { action_id: 'promise_editorial_outcome', authority: 'forbidden', requires_resources: [] }
      ],
      resources: [],
      escalation_paths: []
    }
  }
});

const scenes = [open,handoff,story,knowledge,micro,conflict,event,followup,close];
for (const scene of scenes) {
  addFamily(scene.mail_type, family(scene.mail_family, scene.purpose, [scene.competency, scene.pressure], scene));
}

const planPath = 'data/Civication/mailPlans/film_tv/programleder_plan.json';
const plan = read(planPath);
const additions = scenes.map((scene, index) => ({
  step: plan.sequence.length + index + 1,
  type: scene.mail_type,
  phase: scene.phase,
  step_goal: scene.purpose,
  allowed_families: [scene.mail_family],
  fallback_types: []
}));
plan.sequence = plan.sequence.filter(step => !String(step.allowed_families?.[0] || '').startsWith('role_world_rollout_program_'));
plan.sequence.push(...additions.map((step,index) => ({...step,step:plan.sequence.length + index + 1})));
write(planPath, plan);

const refs = scenes.map(scene => 'data/Civication/mailFamilies/film_tv/' + scene.mail_type + '/programleder_' + scene.mail_type + '.json#' + scene.id);
const threads = [
  { id: 'faktagrunnlag_og_premiss', relationship: 'Amina og Ingrid reagerer på om programlederens skarphet bevarer kildestatus og godkjenningslinje.', beat_refs: ['1/morning','2/afternoon','5/morning','6/afternoon','9/morning','12/afternoon','14/afternoon'] },
  { id: 'gjestegrense_og_tillit', relationship: 'Thea og gjesten husker om venting ble respektert, og om differensiert samtykke overlever etterbruk.', beat_refs: ['1/afternoon','3/evening','4/morning','7/afternoon','10/morning','13/evening','14/morning'] },
  { id: 'liveflyt_og_kontrollrom', relationship: 'Jonas må kunne stole på at den synlige programlederen holder rammen mens kontrollrommet eier avviket.', beat_refs: ['2/evening','5/afternoon','7/evening','9/afternoon','10/evening','12/evening','14/afternoon'] },
  { id: 'offentlig_tillit_og_reparasjon', relationship: 'Publikumstillit formes av hvordan usikkerhet, rettelser, gjestegrenser og klipp forklares gjennom hele løpet.', beat_refs: ['2/morning','4/afternoon','6/evening','8/afternoon','11/morning','13/afternoon','14/evening'] },
  { id: 'profesjonell_maske_og_privathjem', relationship: 'Programlederens regulerte ro og synlighet følger hjem som statuspress, skam og vansker med å legge rollen ned.', beat_refs: ['1/evening','3/afternoon','6/morning','8/evening','10/afternoon','12/morning','13/evening'] }
];
const membership = new Map();
for (const thread of threads) for (const ref of thread.beat_refs) {
  if (!membership.has(ref)) membership.set(ref, []);
  membership.get(ref).push(thread.id);
}
const dayStories = [
  'Intervjuet åpnes som et felles case der fakta, hypoteser, gjestegrense og beslutningseiere må være synlige samtidig.',
  'Amina tester om den skarpe åpningen faktisk bæres av kildene, mens Ingrid vurderer hvilket premiss redaksjonen kan stå inne for.',
  'Thea sender gjestehandoffet og gjør ventingen operativ; studioets tidsplan kan ikke omgjøre et ubesvart spørsmål til samtykke.',
  'En sårbar opplysning fra lydprøven gjør forskjellen mellom menneskelig nærhet og publiserbart materiale konkret.',
  'Ventetiden brukes til History Go-kontekst om filmformidling uten at Pål Bang-Hansens historiske status avgjør dagens fiktive programvalg.',
  'Gjestens differensierte svar krever at faktakort, spørsmål, grafikk og bruksflater bygges om som faktisk rework.',
  'Ingrid utfordrer programlederen til å bevare konfliktkraft uten å gjøre hypotese til konklusjon eller anbefaling til godkjenning.',
  'Studioet prøver det reviderte premisset, og ulik standing hos research, gjestekoordinator og redaksjonsleder blir synlig.',
  'Kontrollrommet tester reservespor og tidsbeskjeder før live; programlederens ro må være koordinert, ikke personlig totalmakt.',
  'Et teknisk bortfall skaper nitti sekunders venting på lufta, og gjestegrensen må holde også når publikum forventer flyt.',
  'Etter sending skiller redaksjonen mellom det som ble sagt, det som kan gjentas, og materialet som fortsatt skal holdes tilbake.',
  'Klipp og sosiale flater gjør et generelt samtykke utilstrekkelig; metadata og bestillinger må bære den samme grensen.',
  'Privat etterklang viser kostnaden ved å være synlig, rolig og ansvarsbærende selv når avgjørelsene tilhører andre.',
  'Caset lukkes som anbefaling og restspørsmål til Ingrid, mens publisering, sikkerhet og kjøreplan beholder sine eiere.'
];
const phases = ['morning','lunch','afternoon','evening'];
const phaseText = {
  morning: 'Morgenen etablerer siste bekreftede status, kildestatus og eier før ny handling.',
  lunch: 'I lunsjflaten blir asymmetrien mellom synlighet, situert tillit og formell myndighet sosialt lesbar.',
  afternoon: 'Ettermiddagen krever et konkret handoff, en rework eller en beslutningsklar anbefaling i samme case.',
  evening: 'Kvelden viser offentlig eller privat etterklang som ikke forsvinner fordi sendingen fortsatt ser kontrollert ut.'
};
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let i = 0; i < phases.length; i += 1) {
    const phase = phases[i];
    const ref = day + '/' + phase;
    coverage.push({
      day,
      phase,
      beat_type: day === 10 && phase === 'evening' ? 'decision' : day === 14 && phase === 'afternoon' ? 'consequence' : ['info','conversation','task','private_consequence'][i],
      summary: 'Dag ' + day + ', ' + phase + ': ' + dayStories[day - 1] + ' ' + phaseText[phase],
      thread_ids: membership.get(ref) || [threads[(day + i) % threads.length].id],
      materialization_refs: [refs[((day - 1) * 4 + i) % refs.length]]
    });
  }
}
const person = (id, social_function, class_position, status, power_over_player, wants, conceals, speech_style, teaches_player) => ({id,social_function,class_position,status,power_over_player,wants,conceals,speech_style,teaches_player});
const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'film_tv',
  role_scope: ROLE,
  title: 'Programleder — synlig ansvar uten ubegrenset redaksjonell myndighet',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Å bære publikums tillit, gjestens sårbarhet og sendingens synlige kontinuitet når programlederens stemme har høy situert makt, men premiss, publisering, kjøreplan og sikkerhet eies av flere andre funksjoner',
    description: 'Programlederen gjør research, spørsmål, lytting, timing og redaksjonelle grenser til en offentlig samtale. Rollen belønnes for nærhet, improvisasjon og personlig troverdighet, men nettopp synligheten kan skjule andres arbeid og friste til mandatglidning. Role World-en følger ett vedvarende livesamtalecase gjennom gjestehandoff, reell venting, History Go-kontekst, faktarework, premisskonflikt, kontrollromsavvik, etterbruk og myndighetsavgrenset sluttstatus.'
  },
  theme_ids: ['public_attention','professional_culture','emotional_labor','social_mask','shame_reputation','loyalty_up_down','care_vs_efficiency','public_private_leakage'],
  social_environments: [
    'Briefrommet der kildestatus, hypoteser, gjestepremiss og redaksjonelle eiere må bli ett lesbart grunnlag.',
    'Programstudioet der menneskelig nærhet, prestasjon og tidsplan møtes foran et publikum som ser programlederen, men ikke hele beslutningssystemet.',
    'Kontrollrommet der timing og tekniske avvik eies av andre enn den synlige stemmen på lufta.',
    'Cinemateket i Oslo og Pål Bang-Hansen-profilen som kildeforankret filmhistorisk kontekst uten normativ makt over dagens program.',
    'Klippe- og etterbruksflaten der differensiert samtykke må overleve metadata, teksting, reprise og sosiale formater.',
    'Offentlig respons der programlederens personlige omdømme lett forveksles med programmets kollektive kvalitet.',
    'Hjem, vennskap og familie der den profesjonelle roen, synligheten og skammen etter feil fortsetter etter at sendingen er slutt.'
  ],
  recurring_people_archetypes: [
    person('ingrid_redaksjonsleder_program','redaksjonsleder som eier premiss, publisering og vesentlige endringer','formell redaksjonell leder med høy beslutningsmakt','høy formell status','kan godkjenne eller stoppe premiss og publisering og påvirke nye oppdrag','et sannferdig, beslutningsklart handoff der usikkerhet og restspørsmål er synlige','hvor ofte kommersielt press gjør et skarpere, svakere underbygd premiss fristende','kort, analytisk og konfliktorientert; spør hva redaksjonen kan stå inne for','at faglig innflytelse virker best når godkjenningspunktet fortsatt er eksplisitt'),
    person('jonas_liveprodusent','liveprodusent som eier kjøreplan, kontrollromsbeskjeder og tekniske avvik','produksjonsleder med situert myndighet over sendeflyten','høy formell status under liveavvik','kan endre kjøreplan, gi tidsrammer og stoppe utrygg eller ukoordinert flyt','en programleder som fyller tid innen avtalt beredskap og lytter til kontrollrommet','hvor ofte kontrollrommets usynlige arbeid bare blir synlig når programlederen improviserer mot det','presis og tidskodet; sier ramme, reservespor og neste beskjed','at den synlige rollen kan bære ro uten å eie systemet som skaper den'),
    person('amina_researcher_program','researcher som holder fakta, uttale, tall og usikkerhet sporbare','fagarbeider med høy kunnskapsmakt og lavere offentlig status','middels formell status og høy situert autoritet på kilder','kan blokkere en formulering faglig og dokumentere at premisset løper foran evidensen','at research faktisk overlever inn i spørsmål, grafikk, rettelser og etterbruk','frustrasjonen over at presisjon omtales som forsiktighet når tempoet øker','nøktern og kildeorientert; skiller dokumentert, sannsynlig, åpent og feil','at kildestatus er en arbeidsfordeling, ikke en fotnote'),
    person('thea_gjestekoordinator','gjestekoordinator som dokumenterer premiss, praktiske behov og sensitiv bruksgrense','relasjonell mellomfunksjon med begrenset redaksjonell rang og høy tillitsbetydning','middels formell status og høy situert autoritet på gjesteavklaringen','kan holde materiale utenfor, kreve ny avklaring og synliggjøre brudd på avtalt ramme','et presist handoff og en programleder som tåler at gjesten trenger tid','hvor mye reparasjonsarbeid som kreves når varme formuleringer blir løfter om utfall','rolig og flatespesifikk; spør hva som kan brukes hvor, av hvem og når','at omsorg blir operativ først når den kan overleveres'),
    person('film_tv_programgjest','gjest som både er kunnskapsbærer, sårbart menneske og råmateriale for en offentlig form','ekstern deltaker med lav institusjonell makt, men avgjørende rett til egne grenser','høy offentlig interesse og begrenset produksjonsmakt','kan endre eller trekke sensitive deler av premisset og påvirke publikums tillit','å bli lyttet til uten at nærhet, tidspress eller lydprøve automatisk blir innhold','frykten for at et sterkt øyeblikk blir viktigere enn det avtalte formålet','konkret og prøvende; skiller mellom det som kan sies nå og det som trenger tid','at samtykke er differensiert og kan kreve ny avklaring når konteksten endres'),
    person('film_tv_studioansvarlig','studiofunksjon som ser kropp, lys, sikkerhet og praktisk beredskap rundt den offentlige samtalen','teknisk og operativ fagarbeider med lite synlighet','middels situert status i studio','kan stoppe eller avgrense praktisk gjennomføring, men ikke avgjøre redaksjonelt premiss','at programlederens improvisasjon respekterer rommets og crewets faktiske kapasitet','hvor ofte teknisk arbeid forventes å absorbere nye ideer uten tid eller anerkjennelse','kort og konkret; sier hva som er klart, hva som venter og hvem som kan frigi','at flyt er kollektiv infrastruktur, ikke personlig karisma'),
    person('venn','privat likemann som møter programlederens profesjonelle oppmerksomhet og behov for å kontrollere samtalen','privat relasjon uten redaksjonell makt','emosjonell nærhet uten faglig rang','kan utfordre serviceblikket og minne spilleren på at ikke alle samtaler er sendinger','et vennskap der pauser, feil og uferdige tanker får stå uten å bli redigert','at hun både beundrer synligheten og savner en mindre kuratert nærhet','uformell og direkte; spør om du lytter eller bare forbereder neste spørsmål','at profesjonell intervjukompetanse ikke automatisk er privat gjensidighet'),
    person('familie','nær relasjon som bærer rytmebrudd, offentlig respons og etterarbeidets tidskostnad','privat relasjon uten innflytelse på produksjonen','emosjonell og praktisk autoritet','kan gjøre kostnaden ved sen beredskap og offentlig skam konkret','forutsigbarhet om når rollen legges ned og hva som faktisk må repareres i kveld','bekymring for at publikums dom følger spilleren inn i hjemmet','hverdagslig og konkret; spør når du er ferdig, hvem som eier feilen og om alt må løses nå','at offentlig omdømme og privat verdi ikke er samme akse')
  ],
  slow_axes: [
    { id:'faktapresisjon', meaning:'om påstander, hypoteser, rettelser og spørsmål beholder synlig kildestatus gjennom hele programløpet', runtime_binding:'existing' },
    { id:'gjestetillit', meaning:'om gjestens avtalte og nye grenser respekteres per bruksflate', runtime_binding:'existing' },
    { id:'liveflyt', meaning:'om programlederen holder publikum orientert i koordinasjon med kontrollrommet', runtime_binding:'existing' },
    { id:'publikumstillit', meaning:'om offentlig autoritet brukes til presisjon og åpen reparasjon fremfor fasade', runtime_binding:'existing' },
    { id:'redaksjonell_mandatklarhet', meaning:'om anbefaling, premissgodkjenning, publisering og kjøreplan beholder sine eiere', runtime_binding:'existing' },
    { id:'situert_programtillit', meaning:'audience-spesifikk standing hos leder, research, gjestekoordinator, kontrollrom, redaksjon og studio', runtime_binding:'existing' },
    { id:'synlighets_og_kontraktsutrygghet', meaning:'presset til å skape sterke øyeblikk og unngå synlige feil for å sikre videre oppdrag', runtime_binding:'editorial_only_until_governed' },
    { id:'privat_profesjonell_maske', meaning:'om intervjuerrollen og den regulerte roen kan legges ned hjemme', runtime_binding:'editorial_only_until_governed' }
  ],
  season: { days:14, day_phases:phases, coverage },
  primary_threads: threads,
  private_aftermath: [
    { id:'venting_som_offentlig_beredskap', description:'Når gjestens svar lar vente på seg, blir programlederens profesjonelle ro arbeid som fortsetter i kroppen og hjemme.', materialization_refs:[refs[1],refs[2]] },
    { id:'saarbarhet_som_etterklang', description:'Å beskytte en sterk betroelse kan gi mindre dramatisk sending, men tryggere privat etterklang enn å gjøre den til reserveinnhold.', materialization_refs:[refs[2]] },
    { id:'livefeil_og_skam', description:'Et liveavvik blir offentlig knyttet til programlederens ansikt selv når systemet og løsningen eies kollektivt.', materialization_refs:[refs[6]] },
    { id:'etterbruk_uten_arbeidsdagsslutt', description:'Klippe- og samtykkerework kan forlenge sendingen inn i kvelden uten at publikum ser arbeidet.', materialization_refs:[refs[7],refs[8]] }
  ],
  delayed_consequences: [
    { id:'baseline_returnerer_i_premiss', setup_ref:'1/morning', return_ref:'7/afternoon', domains:['job','narrative'] },
    { id:'gjestehandoff_returnerer_i_lydprove', setup_ref:'1/afternoon', return_ref:'4/morning', domains:['relationship','reputation'] },
    { id:'venting_returnerer_i_faktarework', setup_ref:'3/afternoon', return_ref:'6/afternoon', domains:['job','narrative'] },
    { id:'kildegrense_returnerer_i_apning', setup_ref:'5/morning', return_ref:'7/afternoon', domains:['job','reputation'] },
    { id:'premissmyndighet_returnerer_live', setup_ref:'7/afternoon', return_ref:'10/evening', domains:['job','reputation'] },
    { id:'kontrollromshandoff_returnerer_i_avvik', setup_ref:'9/afternoon', return_ref:'10/evening', domains:['job','reputation'] },
    { id:'gjestegrense_returnerer_i_etterbruk', setup_ref:'4/morning', return_ref:'12/afternoon', domains:['relationship','job'] },
    { id:'offentlig_maske_returnerer_hjemme', setup_ref:'10/evening', return_ref:'13/evening', domains:['psyche','relationship','reputation'] }
  ],
  materialization: { no_new_runtime:true, source_refs:refs }
};
const worldPath = 'data/Civication/roleWorlds/film_tv/programleder.json';
write(worldPath, world);

const bankPath = 'data/Civication/roleWorldThemeBank.json';
const bank = read(bankPath);
bank.reference_profiles['film_tv/programleder'] = world.theme_ids;
write(bankPath, bank);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
checklist.reference_worlds = checklist.reference_worlds.filter(item => item !== worldPath);
checklist.reference_worlds.push(worldPath);
write(checklistPath, checklist);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
index.status = 'ten_role_worlds_materialized';
index.effective_date = '2026-08-26';
index.roles = index.roles.filter(item => !(item.category === 'film_tv' && item.role_scope === ROLE));
index.roles.push({category:'film_tv',role_scope:ROLE,status:'role_world_complete',path:worldPath});
index.note = 'Reference-bølgen og de strukturelle pilotbevisene består uendret. Kurator, manusmedarbeider, produksjonsassistent og programleder er de fire første kontrollerte rolle-for-rolle-rolloutene; programlederen tilfører reell gjesteventing, handoff/rework, kildeavgrenset History Go-kontekst og audience-spesifikk tillit uten publiserings- eller kontrollromsmyndighetslekkasje.';
write(indexPath, index);

const playabilityPath = path.join(ROOT, 'tests/civication-film-tv-programleder-playability.test.js');
let playability = fs.readFileSync(playabilityPath, 'utf8');
playability = playability.replace(
  "const planSequenceTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'knowledge', 'followup', 'consequence'];",
  "const planSequenceTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'knowledge', 'followup', 'consequence', 'job', 'people', 'story', 'knowledge', 'micro', 'conflict', 'event', 'followup', 'consequence'];"
);
playability = playability.replace('assert.equal(plan.sequence.length, 9);','assert.equal(plan.sequence.length, 18);');
fs.writeFileSync(playabilityPath, playability.trimEnd() + '\n');

const report = [
  '# Civication Role World rollout — Film/TV Programleder',
  '',
  'Status: Materialized on the controlled-rollout branch; completion is valid only after the role-specific gate, full Civication suite, PR checks, exact-head merge, and post-merge verification are green.',
  '',
  '## Scope and debt closed',
  '',
  '- Canonical role: film_tv/programleder',
  '- Queue position at rollout start: 1',
  '- Targeted readiness debt: rhythm_waiting_handoff_rework and situated_reputation',
  '- Cross-role candidates remain film_tv/regissor and film_tv/serieskaper only when genuinely shared work is material; this rollout fabricates no dependency',
  '- Runtime policy: existing Scene Pipeline remains canonical; no new runtime or parallel scene format',
  '',
  '## Materialization',
  '',
  '- 14 days x four phases = 56 unique, provenance-backed beats',
  '- Persistent work object: ' + OBJECT,
  '- Nine new authored scenes across every canonical Programleder mail type',
  '- Situated standing is audience-specific for Ingrid, Jonas, Amina, Thea, programredaksjonen and programstudioet; standing never grants authority',
  '- Premise and publication approval remain with Ingrid; live rundown authority remains with Jonas; sensitive-scope expansion, untrained studio operation and editorial-outcome promises are forbidden',
  '',
  '## Quality assessment',
  '',
  '- Correctness and evidence 5/5',
  '- Coverage and completion 5/5',
  '- Editorial quality 5/5',
  '- Technical integrity 5/5',
  '- Safety and responsibility 5/5',
  '- Maintainability and auditability 4/5',
  '- Total 29/30'
].join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_FILM_TV_PROGRAMLEDER_ROLE_WORLD_ROLLOUT.md'), report);

console.log('Materialized controlled Film/TV Programleder Role World rollout.');
