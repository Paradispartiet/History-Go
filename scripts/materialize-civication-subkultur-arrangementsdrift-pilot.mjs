#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const j = (...parts) => path.join(ROOT, ...parts);
const writeJson = (rel, value) => {
  const full = j(rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};
const run = (args) => execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });

const category = 'subkultur';
const scope = 'subkultur_arrangementsdrift';
const roleId = 'subkultur_kulturhusvert';

const model = {
  schema: 'civication_role_model_v2',
  version: 3,
  category,
  role_scope: scope,
  role_id: roleId,
  title: 'Arrangementsdrift og publikumsvert',
  source: { evidence: 'data/Civication/subcultureCareerEvidence.json' },
  badge_titles: ['Kulturhusvert', 'Arrangementscrew', 'Produksjonsassistent', 'Kulturmedarbeider'],
  core_narrative: [
    'Subkulturens Badge-status er et separat livs- og omdømmelag. Arrangementsdrift er lønnet arbeid med synlige adgangsregler, sikker rigg, tilgjengelig publikumsflyt, crew-samarbeid og dokumentert overlevering.',
    'Miljøstatus, vennskap og kulturell troverdighet gir aldri skjult adgang, teknisk kompetanse eller arbeidsgivermyndighet.'
  ],
  work_life: {
    daily_work: [
      'lese kjøreplan, adgangslister og sikkerhetsavklaringer før åpning',
      'klargjøre publikumsareal og rigg innen egen opplæring og mandat',
      'motta crew, frivillige, artister og publikum med tydelige roller og like regler',
      'følge kø, tilgjengelighet, avvik og belastning gjennom arrangementet',
      'loggføre hendelser og levere presis vaktoverlevering'
    ],
    responsibilities: [
      'sikkerhet før åpningstidspress',
      'likebehandling i adgang og backstage',
      'tilgjengelig og rolig publikumsflyt',
      'rette belastning og pauser for crew og frivillige',
      'eskalere tekniske eller sikkerhetskritiske spørsmål til riktig ansvarlig'
    ],
    workplaces: ['kulturarena_hovedinngang', 'kulturarena_foaje', 'kulturarena_scene_rigg', 'kulturarena_backstage_checkpoint'],
    status_position: ['Arbeidsmyndighet følger vakt, opplæring og delegert rolle; ikke Subkultur-Badge eller sosial posisjon.']
  },
  career_path: {
    entry_from: ['direkte jobbtilbud som Kulturhusvert, Arrangementscrew, Produksjonsassistent eller Kulturmedarbeider'],
    progression_to: ['arrangementsplanlegging, kulturkoordinering eller mer selvstendig produksjonsarbeid etter faktisk erfaring og ny ansettelse'],
    possible_promotions: ['Arrangementsplanlegger, Kulturkonsulent eller Booking- og innholdskoordinator gjennom separat jobbprosess'],
    possible_exits: ['annen publikumsservice, arena- og driftsjobb, frivillig koordinering eller ordinær jobb utenfor kulturfeltet'],
    career_risks: ['sikkerhetsbrudd, skjult forskjellsbehandling, teknisk arbeid uten opplæring, dårlig avvikslogg eller systematisk slitasje på frivillige']
  },
  required_knowledge: {
    education_basis: ['lokal opplæring, kjøreplan, adgangsregler, sikkerhetsrutiner og konkret rollebrief'],
    skills: ['vertskap', 'publikumslogistikk', 'sikkerhetsforståelse', 'crew-samarbeid', 'avvikshåndtering'],
    category_knowledge: ['adgang og akkreditering', 'tilgjengelighet og kø', 'rigggrenser', 'frivilligbelastning', 'vaktoverlevering'],
    history_go_badges: ['subkultur'],
    concepts: ['synlig adgangsregel', 'tilgjengelig publikumsflyt', 'kompetansegrense ved rigg', 'rettferdig vaktbelastning', 'sporbar avviksoverlevering']
  },
  competence_axes: ['vertskap_og_service', 'publikumsflyt', 'rigg_og_praktisk_drift', 'sikkerhetsforstaelse', 'frivillig_og_crew_samarbeid', 'avvik_og_vaktskifte'],
  ideal_type_problems: [
    { id: 'skjult_portvakt', problem: 'Venner og miljøstatus presses inn som uformell adgangsregel.' },
    { id: 'forsinket_rigg', problem: 'Åpningstid nærmer seg mens rigg og rom ikke er sikkert ferdigstilt.' },
    { id: 'uklar_teknikk', problem: 'Noen ber deg bruke utstyr du ikke er opplært på.' },
    { id: 'frivillig_slitasje', problem: 'De samme frivillige tar de tyngste vaktene og begynner å falle fra.' },
    { id: 'publikumsavvik', problem: 'Kø, tilgjengelighet eller konflikt krever rask, rolig og dokumentert håndtering.' }
  ],
  authority_boundary: {
    can: ['håndheve avtalte adgangsregler i egen vakt', 'styre enkel publikumsflyt innen sikkerhetsplanen', 'stoppe egen oppgave og eskalere når kompetanse eller mandat mangler', 'loggføre og overlevere avvik'],
    cannot: ['overstyre_sikkerhetsplan', 'utføre_teknisk_arbeid_uten_opplaring', 'gi_venner_skjult_saertilgang', 'inngaa_avtaler_uten_mandat']
  },
  authority_boundaries: { cannot: ['overstyre_sikkerhetsplan', 'utføre_teknisk_arbeid_uten_opplaring', 'gi_venner_skjult_saertilgang', 'inngaa_avtaler_uten_mandat'] },
  related_people: [
    { id: 'ida_arrangementsansvarlig', name: 'Ida', role: 'Arrangementsansvarlig', function: 'Holder kjøreplan, adgangsregler og sikkerhetsavklaringer samlet og avgjør saker utenfor vertens mandat.' },
    { id: 'thomas_teknisk_ansvarlig', name: 'Thomas', role: 'Teknisk ansvarlig', function: 'Eier sikker bruk av scene- og riggutstyr og avklarer hva crew faktisk er opplært til å gjøre.' },
    { id: 'maja_frivilligkoordinator', name: 'Maja', role: 'Frivilligkoordinator', function: 'Fordeler vakter, pauser og belastning slik at lojalitet ikke blir til skjult gratis overarbeid.' },
    { id: 'leonora_publikumsvert', name: 'Leonora', role: 'Publikums- og tilgjengelighetsansvarlig', function: 'Følger kø, tilgjengelig inngang, ledsagerbehov og rolig håndtering av publikumshendelser.' }
  ],
  related_places: [
    { id: 'kulturarena_hovedinngang', reason: 'Adgangs- og køflate der synlige regler, gjesteliste og likebehandling må fungere under press.' },
    { id: 'kulturarena_foaje', reason: 'Publikumsflate for informasjon, tilgjengelighet, retning og tidlig konfliktdemping.' },
    { id: 'kulturarena_scene_rigg', reason: 'Arbeidsflate der framdrift aldri kan erstatte opplæring, sikker rigg eller teknisk ansvar.' },
    { id: 'kulturarena_backstage_checkpoint', reason: 'Overgang mellom publikum, crew og artistområder der akkreditering og vaktoverlevering må være sporbar.' }
  ],
  notes: ['Shared canonical Subkultur work world; individuelle v1-life-position-modeller beholdes som kompatibilitetslag og er ikke jobbautorisasjon.']
};

const grammar = {
  schema: 'civication_work_grammar_v2', version: 3, category, role_scope: scope, role_id: roleId,
  source: { evidence: 'data/Civication/subcultureCareerEvidence.json' },
  badge_binding: { badge_id: 'subkultur', badge_titles: model.badge_titles, progression_to: ['subkultur_program_og_koordinering'] },
  task_families: ['vertskap_og_adgang', 'rigg_og_klargjoring', 'publikumslogistikk', 'crew_og_frivilligflyt', 'avvik_og_overlevering'],
  work_loops: [
    { id: 'leveranse', steps: ['les_kjoreplan', 'klargjor_arena', 'motta_crew_og_artister', 'apne_og_folg_flyt', 'registrer_avvik_og_overlever'] },
    { id: 'avvik_og_kvalitet', steps: ['identifiser_risiko', 'avklar_ansvar', 'velg_sikker_handling', 'kommuniser_tydelig', 'logg_og_lar'] }
  ],
  practice_stories: [
    { id: 'doren', title: 'Bekjente vil foran køen', problem: 'Bekjente forventer å gå foran køen.', good_practice: 'Bruk samme synlige adgangsregler og eskaler reelle gjestelister.' },
    { id: 'fem_minutter', title: 'Fem minutter til åpning', problem: 'Rigg er forsinket rett før åpning.', good_practice: 'Prioriter sikker ferdigstillelse og avklar hva som kan utsettes.' },
    { id: 'backstage', title: 'Venn vil backstage', problem: 'En venn vil inn backstage uten akkreditering.', good_practice: 'Hold tilgang til avtalt plan og avklar med ansvarlig produsent.' },
    { id: 'frivillig', title: 'De samme tar alltid tungvakten', problem: 'De samme frivillige tar alltid de tyngste vaktene.', good_practice: 'Fordel belastning, pauser og ansvar eksplisitt.' },
    { id: 'ukjent_utstyr', title: 'Ukjent utstyr', problem: 'Du blir bedt om å bruke utstyr du ikke er opplært på.', good_practice: 'Hent teknisk ansvarlig og behold framdrift uten falsk kompetanse.' }
  ],
  quality_axes: ['sikkerhet', 'publikumsopplevelse', 'likebehandling', 'samarbeid', 'tilgjengelighet', 'ryddig_overlevering'],
  knowledge_dependencies: ['adgangsregler', 'tilgjengelighet', 'lokal_sikkerhetsplan', 'kompetansegrenser', 'avvikslogg'],
  authority_boundary: model.authority_boundary,
  mail_generation_contract: {
    required_mail_types: ['job', 'people', 'conflict', 'event', 'followup', 'knowledge', 'consequence'],
    required_axes: ['choice_axis', 'consequence_axis', 'narrative_arc']
  }
};

const plan = {
  schema: 'civication_mail_plan_v1', id: 'subkultur_arrangementsdrift_pilot_v1', category, role_scope: scope, role_id: roleId,
  title: 'Arrangementsdrift – publikumsarbeid',
  description: 'Publikumsarbeidspilot: én arrangementsdag fra åpning og adgang via crew- og sikkerhetspress til overlevering og forsinket konsekvens.',
  arc: {
    from: 'Vert eller crewmedarbeider som vil få kvelden til å flyte og kjenner miljøet, men må skille sosial status fra faktisk jobbmandat.',
    to: 'Medarbeider som kan levere god publikumsopplevelse uten å ofre likebehandling, tilgjengelighet, sikkerhet eller sporbar overlevering.',
    core_questions: ['Hvilke regler må være like synlige for venner og ukjente?', 'Når må åpningstempo vike for sikkerhet eller kompetansegrense?', 'Hvordan gjør en god overlevering små avvik håndterbare før de blir store?']
  },
  outcome_rules: {
    fired: { stability_values: ['FIRED'], strikes_gte: 3, score_lte: -3 },
    promoted: { completion_ratio_gte: 1, score_gte: 2, strikes_lte: 0, allow_warning: false },
    stagnated: { autonomy_delta: -6, stability: 'STAGNATED', add_branch_flags: ['career_stagnated', 'subkultur_arrangementsdrift_trust_stalled'] }
  },
  sequence: [
    { step: 1, type: 'job', phase: 'intro', step_goal: 'Gjør inngang og publikumsflate klare med synlige regler før dørene åpner.', allowed_families: ['subkultur_arrangementsdrift_apning'], fallback_types: [] },
    { step: 2, type: 'people', phase: 'early', step_goal: 'Fordel crew og frivilligbelastning uten å gjøre lojalitet til skjult plikt.', allowed_families: ['subkultur_arrangementsdrift_crew'], fallback_types: [] },
    { step: 3, type: 'conflict', phase: 'mid', step_goal: 'Håndhev adgang og backstage-regler når sosialt press blir konkret.', allowed_families: ['subkultur_arrangementsdrift_adgangspress'], fallback_types: [] },
    { step: 4, type: 'event', phase: 'mid', step_goal: 'Stopp eller eskaler en riggoppgave som går utenfor egen opplæring.', allowed_families: ['subkultur_arrangementsdrift_riggavvik'], fallback_types: [] }
  ]
};

function choice(id, label, reply, effect, feedback, stats, tags) { return { id, label, reply, effect, tags, feedback, effects: { stats } }; }
function mail({ id, type, family, phase, priority, from, people_ref, place_id, subject, summary, situation, task_domain, competency, pressure, choice_axis, consequence_axis, narrative_arc, choices }) {
  return { id, mail_type: type, mail_family: family, role_scope: scope, phase, priority, from, people_ref, place_id, subject, summary, situation, task_domain, competency, pressure, choice_axis, consequence_axis, narrative_arc, choices };
}
function catalog(type, familyId, purpose, learning, mails) { return { schema: 'civication_mail_family_catalog_v1', version: 1, category, role_scope: scope, mail_type: type, families: [{ id: familyId, purpose, learning_focus: learning, mails }] }; }

const catalogs = {};
catalogs.job = catalog('job', 'subkultur_arrangementsdrift_apning', 'Åpne arenaen med sikker, tilgjengelig og lik publikumsflyt.', ['åpning', 'adgang', 'tilgjengelighet'], [mail({
  id: 'subkultur_arrangementsdrift_job_apning', type: 'job', family: 'subkultur_arrangementsdrift_apning', phase: 'intro', priority: 130,
  from: 'Ida, arrangementsansvarlig', people_ref: 'ida_arrangementsansvarlig', place_id: 'kulturarena_hovedinngang', subject: 'Dørene åpner om tjue minutter — køskiltet mangler én regel',
  summary: 'Gjesteliste, ordinær kø og tilgjengelig inngang er klare, men skiltet forklarer ikke hvor ledsager og forhåndsavklarte behov skal henvende seg.',
  situation: ['Køen vokser allerede utenfor døren.', 'Et uklart skilt kan sende publikum fram og tilbake akkurat når trykket øker.', 'Du må velge mellom rask åpning og en liten avklaring som gjør reglene synlige før første gjest går inn.'],
  task_domain: 'apning_og_publikumsflyt', competency: 'publikumsflyt', pressure: 'apningstid_vs_tydelighet', choice_axis: 'synlig_flyt_vs_improvisert_forklaring', consequence_axis: 'tilgjengelighet_og_likebehandling_vs_kofriksjon', narrative_arc: 'doren_som_felles_regel',
  choices: [
    choice('A','Oppdater inngangsskiltet med ledsagerpunkt og tydelig kødeling før dørene åpner','Jeg bruker fem minutter på én synlig inngangsregel som alle kan følge.',1,'Åpningen blir litt strammere tidsmessig, men publikum får samme informasjon før presset begynner.',{quality:2,trust:2,risk:-2,energy:-1},['access','clarity']),
    choice('B','Åpne nå og la hver vert forklare tilgjengelig inngang muntlig etter behov','Vi tar detaljene i døren så køen begynner å bevege seg.',-1,'Tempoet øker, men samme behov kan få ulike svar og publikum må avsløre behovet sitt midt i køen.',{status:1,quality:-2,trust:-1,risk:2},['tempo','access_risk']),
    choice('C','Be Leonora plassere en midlertidig vert ved kødelingen mens skiltet ferdigstilles','Jeg deler oppgaven: én vert gjør regelen synlig mens jeg får resten av åpningen klar.',0,'Du kjøper både flyt og tydelighet, men binder en ekstra person akkurat i oppstarten.',{quality:1,trust:1,energy:-1},['coordination','access'])
  ]
})]);

catalogs.people = catalog('people', 'subkultur_arrangementsdrift_crew', 'Fordele belastning og pauser før lojalitet blir til skjult gratisarbeid.', ['crew', 'pauser', 'rettferdighet'], [mail({
  id: 'subkultur_arrangementsdrift_people_vaktfordeling', type: 'people', family: 'subkultur_arrangementsdrift_crew', phase: 'early', priority: 122,
  from: 'Maja, frivilligkoordinator', people_ref: 'maja_frivilligkoordinator', place_id: 'kulturarena_foaje', subject: 'Samme to frivillige har fått de tyngste postene igjen',
  summary: 'To erfarne frivillige kan arenaen best og har derfor endt med riggnær post, garderoberykk og sen nedrigg tre arrangementer på rad.',
  situation: ['Maja sier de fortsatt sier ja når de blir spurt.', 'Den nye crewgruppen trenger mer støtte hvis belastningen skal fordeles.', 'Du må velge om erfaring skal brukes som permanent ekstrabelastning eller som kapasitet til å lære opp flere.'],
  task_domain: 'crew_og_frivilligflyt', competency: 'frivillig_og_crew_samarbeid', pressure: 'erfaring_vs_slitasje', choice_axis: 'fordele_kompetanse_vs_belonne_lojalitet_med_mer_arbeid', consequence_axis: 'baerekraftig_crew_vs_frafall', narrative_arc: 'frivillig_slitasje',
  choices: [
    choice('A','Flytt én tungpost til nytt crew og gi den erfarne frivillige en tydelig mentorrolle med pause','Jeg bruker erfaring til opplæring i stedet for å gjøre den til permanent ekstravakt.',1,'Kompetansen sprer seg og belastningen blir synligere fordelt.',{quality:1,trust:2,risk:-1,energy:-1},['crew','fairness']),
    choice('B','Be de to erfarne ta hele tungvakten én kveld til fordi de alltid får det til','Vi trenger sikker levering i kveld; de nye kan lære neste gang.',-1,'Kvelden kan flyte, men systemet belønner lojalitet med mer slitasje og gjør kompetansen sårbar.',{status:1,trust:-2,risk:2,energy:1},['shortcut','burnout']),
    choice('C','Kort ned alle poster og roter crew oftere selv om hvert vaktskifte krever mer briefing','Jeg fordeler belastningen bredere og aksepterer mer overleveringsarbeid.',0,'Belastningen jevnes ut, men flere vaktskifter øker behovet for presise briefer.',{quality:1,trust:1,risk:-1,energy:-2},['rotation','handover'])
  ]
})]);

catalogs.conflict = catalog('conflict', 'subkultur_arrangementsdrift_adgangspress', 'Teste like adgangsregler når miljøstatus og vennskap presser på.', ['adgang', 'akkreditering', 'likebehandling'], [mail({
  id: 'subkultur_arrangementsdrift_conflict_backstage', type: 'conflict', family: 'subkultur_arrangementsdrift_adgangspress', phase: 'mid', priority: 118,
  from: 'Ida, arrangementsansvarlig', people_ref: 'ida_arrangementsansvarlig', place_id: 'kulturarena_backstage_checkpoint', subject: 'En kjent profil forventer backstage fordi «alle her kjenner meg»',
  summary: 'Personen står ikke på akkrediteringslisten, men kjenner både artist og flere i crewet og peker på sin status i miljøet.',
  situation: ['Køen bak personen hører diskusjonen.', 'Et muntlig unntak er enkelt nå og vanskelig å forklare likt senere.', 'Du må skille sosial anerkjennelse fra den faktiske backstage-rollen arrangementet har avtalt.'],
  task_domain: 'adgang_og_akkreditering', competency: 'vertskap_og_service', pressure: 'miljostatus_vs_synlig_regel', choice_axis: 'akkreditering_vs_skjult_saertilgang', consequence_axis: 'likebehandling_vs_portvaktkultur', narrative_arc: 'backstage',
  choices: [
    choice('A','Hold personen ved checkpointet og be Ida bekrefte eventuell gjestelisteendring før adgang','Jeg behandler statusen som irrelevant til ansvarlig faktisk endrer listen.',1,'Regelen er synlig, og et reelt unntak kan fortsatt dokumenteres av riktig ansvarlig.',{trust:2,quality:1,risk:-2,energy:-1},['access','mandate']),
    choice('B','Slipp personen inn fordi crewet åpenbart kjenner vedkommende','Jeg bruker miljøkunnskapen som uformell akkreditering.',-1,'Du løser én sosial situasjon ved å gjøre adgangsregelen usynlig og personavhengig.',{status:2,trust:-2,risk:3},['status','hidden_gate']),
    choice('C','Tilby å hente artisten ut til foajeen mens backstage-adgangen forblir uendret','Jeg løser kontaktbehovet uten å late som bekjentskap er akkreditering.',0,'Konflikten dempes og grensen står, men du binder tid til en mellomløsning.',{trust:1,quality:1,energy:-2,risk:-1},['deescalation','boundary'])
  ]
})]);

catalogs.event = catalog('event', 'subkultur_arrangementsdrift_riggavvik', 'Håndtere teknisk tidspress uten å late som kompetanse kan improviseres.', ['rigg', 'opplæring', 'sikkerhet'], [mail({
  id: 'subkultur_arrangementsdrift_event_rigg', type: 'event', family: 'subkultur_arrangementsdrift_riggavvik', phase: 'mid', priority: 116,
  from: 'Thomas, teknisk ansvarlig', people_ref: 'thomas_teknisk_ansvarlig', place_id: 'kulturarena_scene_rigg', subject: 'En motorisert rigg må flyttes — Thomas er bundet i fem minutter',
  summary: 'En kabelvei står feil og hindrer sikker publikumsåpning. En erfaren frivillig sier knappen er enkel og foreslår at du bare flytter riggen litt.',
  situation: ['Du er ikke opplært på den motoriserte riggen.', 'Åpningstid nærmer seg og området kan ikke brukes slik det står.', 'Valget er ikke mellom å bry seg eller ikke, men mellom sikker eskalering og falsk kompetanse under tidspress.'],
  task_domain: 'rigg_og_sikkerhet', competency: 'sikkerhetsforstaelse', pressure: 'frist_vs_kompetansegrense', choice_axis: 'stopp_og_eskaler_vs_improvisert_teknikk', consequence_axis: 'sikker_framdrift_vs_hendelsesrisiko', narrative_arc: 'ukjent_utstyr',
  choices: [
    choice('A','Sperr området midlertidig og vent på Thomas før den motoriserte riggen flyttes','Jeg holder åpningen i den sonen til opplært ansvarlig tar selve bevegelsen.',1,'Framdriften blir synlig forsinket, men kompetansegrensen holder når risikoen er størst.',{quality:2,trust:1,risk:-3,status:-1},['safety','escalation']),
    choice('B','Flytt riggen noen centimeter selv fordi frivilligen sier kontrollen er enkel','Jeg tar den raske tekniske snarveien for å holde åpningstiden.',-1,'Enkel betjening er ikke det samme som opplæring eller oversikt over last og klempunkter.',{status:1,quality:-2,risk:4,trust:-1},['unsafe','shortcut']),
    choice('C','Flytt publikumsruten bort fra sonen og be Thomas prioritere riggen når han er ledig','Jeg løser flyten midlertidig uten å røre utstyret jeg ikke er opplært på.',0,'Du holder deler av arenaen i gang, men skaper mer arbeid i kø- og skiltplanen.',{quality:1,risk:-2,energy:-2,trust:1},['reroute','safety'])
  ]
})]);

catalogs.followup = catalog('followup', 'subkultur_arrangementsdrift_overlevering', 'Følge opp dagens små avvik før neste vakt arver dem som rykter.', ['overlevering', 'avvik', 'sporbarhet'], [mail({
  id: 'subkultur_arrangementsdrift_followup_overlevering', type: 'followup', family: 'subkultur_arrangementsdrift_overlevering', phase: 'workday', priority: 112,
  from: 'Leonora, publikums- og tilgjengelighetsansvarlig', people_ref: 'leonora_publikumsvert', place_id: 'kulturarena_foaje', subject: 'Tre små publikumsavvik ligger bare i muntlige beskjeder',
  summary: 'Kødelingen ble endret, én dør var tung for rullestol og backstage-checkpointet fikk en muntlig gjestelisteavklaring. Ingen av delene står ennå i vaktoverleveringen.',
  situation: ['Neste vakt kommer inn om få minutter.', 'Hver hendelse virker liten isolert.', 'Sammen avgjør de om neste team møter samme problemer med kontekst eller starter fra null.'],
  task_domain: 'avvik_og_overlevering', competency: 'avvik_og_vaktskifte', pressure: 'slutten_pa_vakten_vs_sporbarhet', choice_axis: 'kort_logg_na_vs_muntlig_hukommelse', consequence_axis: 'laering_og_kontinuitet_vs_gjentakelse', narrative_arc: 'avvik_som_returnerer',
  choices: [
    choice('A','Skriv tre korte avvik med tiltak, ansvar og hva neste vakt skal kontrollere','Jeg gjør hvert avvik lite nok til å lese og presist nok til å handle på.',1,'Neste vakt får en arbeidsbar overlevering i stedet for løse minner.',{quality:2,trust:2,risk:-2,energy:-1},['handover','traceability']),
    choice('B','Gi neste vakt en rask muntlig oppsummering og gå fordi skiftet er over','Jeg forklarer det viktigste ved døren; de spør hvis noe er uklart.',-1,'Informasjonen blir personavhengig og mister ansvar, tidspunkt og hva som faktisk ble endret.',{status:1,quality:-2,risk:2,trust:-1},['oral_only','handover_risk']),
    choice('C','Logg bare tilgjengelighetsavviket og la adgang og kø være muntlige driftsdetaljer','Jeg prioriterer det mest alvorlige og lar resten følge crewets hukommelse.',0,'Du sikrer én viktig sak, men de andre mønstrene blir fortsatt vanskelige å oppdage over tid.',{quality:1,trust:0,risk:1,energy:-1},['partial_log','prioritization'])
  ]
})]);

catalogs.knowledge = catalog('knowledge', 'subkultur_arrangementsdrift_kunnskap_i_bruk', 'Gjøre adgang, tilgjengelighet og sikkerhetsgrenser til konkrete driftsvalg.', ['tilgjengelighet', 'kompetansegrense', 'likebehandling'], [mail({
  id: 'subkultur_arrangementsdrift_knowledge_tilgjengelighet', type: 'knowledge', family: 'subkultur_arrangementsdrift_kunnskap_i_bruk', phase: 'forenoon', priority: 126,
  from: 'Leonora, publikums- og tilgjengelighetsansvarlig', people_ref: 'leonora_publikumsvert', place_id: 'kulturarena_hovedinngang', subject: 'Den tilgjengelige inngangen finnes — men krever at gjesten kjenner huset',
  summary: 'Trinnfri rute går via en sidedør som er lovlig og fysisk brukbar, men skiltet fra hovedkøen peker ikke dit og døren ser ut som personalinngang.',
  situation: ['Teknisk sett har arenaen en tilgjengelig inngang.', 'I praksis må gjesten vite at den finnes eller spørre foran køen.', 'Du må vurdere tilgjengelighet som faktisk brukbar publikumsflyt, ikke bare som en dør på plantegningen.'],
  task_domain: 'tilgjengelig_publikumslogistikk', competency: 'publikumsflyt', pressure: 'formell_losning_vs_faktisk_brukbarhet', choice_axis: 'selvforklarende_rute_vs_hjelp_pa_foresporsel', consequence_axis: 'verdig_tilgang_vs_avhengighet_av_innsidekunnskap', narrative_arc: 'publikumsavvik',
  choices: [
    choice('A','Merk trinnfri rute fra hovedkøen og brief alle inngangsverter på samme forklaring','Jeg gjør den tilgjengelige ruten synlig før noen må be om særbehandling.',1,'Tilgjengeligheten blir en del av ordinær drift i stedet for en skjult spesialløsning.',{quality:2,trust:2,risk:-2,energy:-1},['accessibility','knowledge']),
    choice('B','Behold sidedøren som den er og hjelp gjester som selv spør etter trinnfri inngang','Løsningen finnes allerede; vi responderer når behovet kommer.',-1,'Arenaen flytter informasjonsbyrden over på gjesten og gjør erfaringen avhengig av hvem som står i døren.',{status:1,quality:-2,trust:-2,risk:2},['reactive','accessibility_gap']),
    choice('C','Plasser én synlig vert ved hovedkøen som aktivt tilbyr ruteinformasjon til alle','Jeg gjør informasjonen tilgjengelig uten å endre skiltingen midt i åpningen.',0,'Det fungerer i denne vakten, men løsningen er fortsatt avhengig av bemanning og må inn i overleveringen.',{quality:1,trust:1,risk:-1,energy:-2},['service','temporary_fix'])
  ]
})]);

catalogs.consequence = catalog('consequence', 'subkultur_arrangementsdrift_forsinket_konsekvens', 'Vise hvordan små driftsvalg kommer tilbake som tillits-, sikkerhets- og bemanningskostnad.', ['sen_konsekvens', 'reparasjon', 'læring'], [mail({
  id: 'subkultur_arrangementsdrift_consequence_neste_vakt', type: 'consequence', family: 'subkultur_arrangementsdrift_forsinket_konsekvens', phase: 'workday', priority: 106,
  from: 'Ida, arrangementsansvarlig', people_ref: 'ida_arrangementsansvarlig', place_id: 'kulturarena_backstage_checkpoint', subject: 'Neste vakt møter samme unntak — men ingen kan vise hvem som godkjente det',
  summary: 'En person viser til «avtalen fra sist» for backstage-adgang. Vaktskiftet finner ingen logg, og to frivillige husker hendelsen forskjellig.',
  situation: ['Konsekvensen kommer etter at den første kvelden føltes ferdig.', 'Du kan reparere praksisen ved å gjøre unntak og ansvar sporbare.', 'Eller du kan lene deg på miljøhukommelsen og gjøre samme konflikt personavhengig enda en gang.'],
  task_domain: 'forsinket_adgangskonsekvens', competency: 'avvik_og_vaktskifte', pressure: 'relasjonspress_vs_dokumentert_mandat', choice_axis: 'reparer_regel_og_logg_vs_gjenta_uformelt_unntak', consequence_axis: 'langsiktig_tillit_vs_portvaktgjeld', narrative_arc: 'doren_returnerer',
  choices: [
    choice('A','Stans det uverifiserte unntaket og innfør at alle gjestelisteendringer får ansvarlig navn og vaktnotat','Jeg reparerer systemet: ingen ny adgangsendring uten synlig eier og spor.',1,'Du gjør tidligere uklarhet synlig og reduserer sjansen for at neste vakt må forhandle samme regel på nytt.',{quality:2,trust:2,risk:-3,status:-1},['repair','traceability']),
    choice('B','Godta «samme som sist» fordi personen åpenbart har vært backstage før','Jeg bruker historikken som nok bevis og unngår ny konflikt.',-1,'Et ulogget unntak blir gjort til varig presedens uten at noen kan vise mandatet.',{status:2,quality:-2,trust:-2,risk:4},['precedent','hidden_gate']),
    choice('C','La Ida avgjøre denne personen nå og legg bare den nye avgjørelsen inn i vaktnotatet','Jeg løser dagens adgang riktig, men avgrenser reparasjonen til det vi faktisk kan dokumentere nå.',0,'Dagens sak blir sporbar, mens eldre praksis fortsatt må ryddes senere.',{quality:1,trust:1,risk:-1,energy:-1},['escalation','limited_repair'])
  ]
})]);

writeJson('data/Civication/roleModels/subkultur/subkultur_arrangementsdrift.json', model);
writeJson('data/Civication/workGrammars/subkultur/subkultur_arrangementsdrift.json', grammar);
writeJson('data/Civication/mailPlans/subkultur/subkultur_arrangementsdrift_plan.json', plan);
for (const [type, value] of Object.entries(catalogs)) writeJson(`data/Civication/mailFamilies/subkultur/${type}/${scope}_${type}.json`, value);

const test = `#!/usr/bin/env node\nconst assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');\nconst ROOT=path.resolve(__dirname,'..');const read=(r)=>JSON.parse(fs.readFileSync(path.join(ROOT,r),'utf8'));\nfunction storage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()};}\nfunction makeFetch(root){return async(url)=>{const clean=String(url||'').split('?')[0].replace(/^\\/+/, '');const full=path.resolve(root,clean);if(!full.startsWith(root))return{ok:false,status:400,async json(){return null}};try{const body=await fs.promises.readFile(full,'utf8');return{ok:true,status:200,async json(){return JSON.parse(body)}}}catch{return{ok:false,status:404,async json(){return null}}}};}\nfunction load(rel){vm.runInThisContext(fs.readFileSync(path.join(ROOT,rel),'utf8'),{filename:rel});}\n(async()=>{const category='subkultur',scope='subkultur_arrangementsdrift',roleId='subkultur_kulturhusvert';const model=read('data/Civication/roleModels/subkultur/subkultur_arrangementsdrift.json'),grammar=read('data/Civication/workGrammars/subkultur/subkultur_arrangementsdrift.json'),plan=read('data/Civication/mailPlans/subkultur/subkultur_arrangementsdrift_plan.json'),matrix=read('data/Civication/careerGameplayMatrix.json');const required=grammar.mail_generation_contract.required_mail_types;\nassert.deepEqual(required,['job','people','conflict','event','followup','knowledge','consequence']);assert.deepEqual(plan.sequence.map(s=>s.type),['job','people','conflict','event']);assert.equal(model.related_people.length,4);assert.equal(model.related_places.length,4);assert.ok(model.required_knowledge.concepts.length>=4);assert.ok(model.core_narrative.some(x=>x.includes('Badge-status')));\nconst ids=new Set();for(const type of required){const cat=read('data/Civication/mailFamilies/'+category+'/'+type+'/'+scope+'_'+type+'.json');assert.equal(cat.mail_type,type);const mails=cat.families.flatMap(f=>f.mails||[]);assert.ok(mails.length>=1,type);for(const mail of mails){assert.ok(!ids.has(mail.id),mail.id);ids.add(mail.id);assert.ok(mail.place_id,mail.id);assert.ok(mail.choice_axis&&mail.consequence_axis&&mail.narrative_arc,mail.id);assert.ok(Array.isArray(mail.situation)&&mail.situation.length>=3,mail.id);assert.ok(Array.isArray(mail.choices)&&mail.choices.length>=2,mail.id);for(const c of mail.choices){assert.ok(c.feedback,mail.id+'/'+c.id);assert.ok(c.effects?.stats,mail.id+'/'+c.id);}}}\nglobal.window=global;global.localStorage=storage();global.location={href:'http://localhost/Civication.html'};global.Event=class Event{constructor(type){this.type=type}};global.document={readyState:'complete',addEventListener(){}};global.addEventListener=()=>{};global.dispatchEvent=()=>{};global.fetch=makeFetch(ROOT);global.CivicationCalendar={getPhase:()=> 'morning',setPhase(){},advanceByMinutes(){}};global.HG_CapitalMaintenance={maintain:()=>null};global.HG_Lifestyle={addTags:()=>null};global.CivicationPsyche={getAutonomy:()=>50,updateIntegrity(){},updateVisibility(){},updateEconomicRoom(){},updateTrust(){},checkBurnout(){},processCollapse(){}};\nfor(const s of ['js/Civication/core/civicationState.js','js/Civication/core/civicationEventEngine.js','js/Civication/systems/civicationEventChannels.js','js/Civication/systems/civicationCareerRoleResolver.js','js/Civication/systems/day/dayChoiceDirector.js','js/Civication/systems/day/dayConsequences.js','js/Civication/systems/civicationMailRuntime.js','js/Civication/systems/civicationWorkdayMailBuilder.js','js/Civication/systems/civicationDailyMailBuilder.js','js/Civication/systems/civicationCareerOutcomeRuntime.js'])load(s);\nfor(const title of ['Kulturhusvert','Arrangementscrew','Produksjonsassistent','Kulturmedarbeider']){const active={career_id:category,title};assert.equal(global.CivicationCareerRoleResolver.resolveCareerRoleScope(active),scope,title);}const active={career_id:category,role_id:roleId,title:'Kulturhusvert'};assert.equal(global.CivicationCareerRoleResolver.resolveCareerRoleId(active),roleId);assert.equal(global.CivicationMailRuntime.getPlanPath(active),'data/Civication/mailPlans/subkultur/subkultur_arrangementsdrift_plan.json');const candidates=await global.CivicationMailRuntime.makeCandidateMailsForActiveRole(active,{});assert.equal(candidates[0]?.id,'subkultur_arrangementsdrift_job_apning');\nconst daily=await global.CivicationDailyMailBuilder.buildQueue(active,{date:'2026-08-18'});const roleItems=daily.items.filter(r=>['forenoon','workday'].includes(r.phase)&&r.event?.role_scope===scope&&r.event?.source_type!=='daily_generated');const types=roleItems.map(r=>r.event.mail_type);assert.deepEqual(types.slice(0,3),['job','knowledge','people']);assert.ok(['conflict','event'].includes(types[3]));assert.deepEqual(types.slice(-2),['followup','consequence']);assert.equal(roleItems.filter(r=>r.event.source_type==='planned').length,1);\nconst finished={role_plan_id:plan.id,step_index:plan.sequence.length,history:plan.sequence.map(s=>({id:'step_'+s.step,source_type:'planned',choice_id:'A'}))};const decide=p=>global.CivicationCareerOutcomeRuntime.decideOutcome(active,plan,finished,p).status;assert.equal(decide({score:3,strikes:0,warning_used:false,stability:'STABLE'}),'PROMOTED');assert.equal(decide({score:1,strikes:0,warning_used:false,stability:'STABLE'}),'STAGNATED');assert.equal(decide({score:-3,strikes:3,warning_used:false,stability:'STABLE'}),'FIRED');\nconst world=matrix.worlds.find(w=>w.key==='subkultur/subkultur_arrangementsdrift');assert.ok(world);assert.equal(world.status,'playable');assert.equal(world.audit.runtime_gate,true);assert.deepEqual(world.audit.missing_components,[]);for(const c of ['day_one','workday_loop','people','places','mail','knowledge','consequences','performance','progression','exit'])assert.equal(world.audit.components[c].level,'complete',c);assert.equal(world.audit.components.practice_stories.level,'partial');assert.equal(world.audit.life_story_complete,false);console.log('civication-subkultur-arrangementsdrift-playability.test.js: PASS');\n})().catch(e=>{console.error(e);process.exit(1)});\n`;
fs.writeFileSync(j('tests/civication-subkultur-arrangementsdrift-playability.test.js'), test);

run(['scripts/audit-civication-career-gameplay.mjs', '--write']);
run(['scripts/build-civication-scene-registry.mjs', '--write']);
run(['scripts/build-civication-scene-registry.mjs', '--check']);
run(['tests/civication-subkultur-arrangementsdrift-playability.test.js']);
run(['tests/civication-mail-choice-uniqueness.test.js']);
run(['tests/civication-religion-forskning-playability.test.js']);
run(['tests/civication-produksjonsassistent-playability.test.js']);
run(['tests/civication-avdelingsleder-playability.test.js']);
run(['tests/civication-role-world-contract.test.js']);

const matrix = JSON.parse(fs.readFileSync(j('data/Civication/careerGameplayMatrix.json'), 'utf8'));
const world = matrix.worlds.find((item) => item.key === 'subkultur/subkultur_arrangementsdrift');
if (!world) throw new Error('Subkultur arrangementsdrift missing from Career Gameplay Matrix');
if (world.status !== 'playable') throw new Error(`Expected playable, got ${world.status}; missing=${JSON.stringify(world.audit?.missing_components || [])}`);
if (world.audit?.runtime_gate !== true) throw new Error('Subkultur arrangementsdrift runtime gate did not pass');
if ((world.audit?.missing_components || []).length) throw new Error(`Subkultur arrangementsdrift still has missing components: ${world.audit.missing_components.join(', ')}`);
console.log(`Subkultur arrangementsdrift Career Gameplay status: ${world.status}; complete=${world.audit.complete_components.length}; partial=${Object.values(world.audit.components).filter((c)=>c.level==='partial').length}`);
