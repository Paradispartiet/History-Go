import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ROLE = 'scenekunst_scene_og_produksjon';
const KEY = `scenekunst/${ROLE}`;
const MODEL = `data/Civication/roleModels/scenekunst/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/scenekunst/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/scenekunst/${ROLE}_plan.json`;
const REPORT = 'reports/CIVICATION_SCENEKUNST_SCENE_OG_PRODUKSJON_PREREQUISITES_SOURCE_FIRST.md';
const TEST = 'tests/civication-scenekunst-scene-og-produksjon-prerequisites.test.js';

const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];

const actors = [
  {
    id: 'ida_produksjonsleder',
    name: 'Ida',
    role: 'produksjonsleder',
    workplace_ids: ['produksjonskontor_og_callboard'],
    function: 'Ida holder produksjonsplan, bemanning, tidsvinduer, avhengigheter, godkjenninger og faktisk gjeldende call samlet gjennom dagen. Hun bruker samme produksjonsbok fra første klargjøring til forestilling og etterarbeid, slik at en endring i tid, ressurs eller arena kan spores til berørte oppgaver uten at tidligere beslutninger, varsling eller ansvar forsvinner.',
    authority_relation: 'Ida kan prioritere og koordinere innen delegert produksjonsmandat, men kan ikke overstyre teknisk sikkerhet, arbeidstidsgrenser, kunstnerisk beslutning, rettigheter eller tilgjengelighetskrav. Spilleren kan foreslå replanlegging og be om avklaring, men må navngi hvem som eier frigivelse, sikkerhet, kunstnerisk endring og bindende forpliktelser før status settes til klar.'
  },
  {
    id: 'jonas_inspisient',
    name: 'Jonas',
    role: 'inspisient',
    workplace_ids: ['inspisientpult_og_cuebok'],
    function: 'Jonas forvalter cuebok, calls, forestillingsrekkefølge, stoppkriterier, avvik og gjeldende scenestatus slik at lys, lyd, scene, utøvere og publikum møter samme versjon. Han gjør handoff eksplisitt mellom prøve, teknisk frigivelse og forestilling, og beholder hva som er bekreftet, betinget og fortsatt venter når tidsplanen endrer seg.',
    authority_relation: 'Jonas kan kalle avtalte cues og stanse sekvenser etter etablerte prosedyrer, men kan ikke erklære teknisk sikkerhet uten ansvarlig funksjon eller omskrive kunstnerisk innhold på egen hånd. Spilleren må skille koordinering fra godkjenning og sørge for at betinget status aldri kommuniseres som frigitt scene.'
  },
  {
    id: 'marwa_sceneteknisk_leder',
    name: 'Marwa',
    role: 'sceneteknisk leder',
    workplace_ids: ['scene_og_teknisk_sjekkpunkt'],
    function: 'Marwa samler rigg, strøm, lys, lyd, scenemekanikk, last, sikring og tekniske testresultater i den samme produksjonsboken som resten av teamet bruker. Hun oversetter kunstneriske og produksjonsmessige ønsker til dokumenterte premisser, sikre alternativer, retest og teknisk frigivelse, og gjør det synlig når et avvik gjenåpner bare én del av oppsettet.',
    authority_relation: 'Marwa kan stoppe eller avgrense teknisk arbeid som ikke er forsvarlig og kreve ny test før frigivelse. Hun bestemmer ikke kunstnerisk kvalitet og kan ikke presses av innslipp eller premierefrist til å signere en løsning hun ikke kan stå for. Spilleren må beholde sikkerhetsansvaret hos riktig funksjon selv når tidskostnaden blir synlig.'
  },
  {
    id: 'samira_publikumskoordinator',
    name: 'Samira',
    role: 'publikums- og vertskapskoordinator',
    workplace_ids: ['foaje_og_publikumsflyt'],
    function: 'Samira holder innslipp, kø, tilgjengelighet, vertskap, forsinkelsesinformasjon og publikumsflyt koblet til faktisk scenefrigivelse og forestillingsstatus. Hun trenger presise tidspunkter og betingelser fra produksjonsboken for å kunne informere uten å love mer enn teamet vet, og registrerer hvordan endringer påvirker publikum og front-of-house.',
    authority_relation: 'Samira kan organisere publikum og justere vertskapsflyt innen avtalte rammer, men kan ikke åpne salen mot en ikke-frigitt scene eller gjøre tilgjengelighetsbehov til et individuelt problem. Spilleren må gi henne sann status og alternativer, samtidig som scene-, sikkerhets- og kunstnerisk beslutning forblir hos sine respektive eiere.'
  }
];

const places = [
  {
    id: 'produksjonskontor_og_callboard',
    name: 'Produksjonskontoret og callboardet',
    function: 'Her holdes produksjonsplan, bemanning, calls, tidsvinduer, avhengigheter, beslutningseiere og distribuerte versjoner samlet. Flaten skiller planlagt fra bekreftet og frigitt, slik at en forskyvning i tid eller ressurs kan replanlegges uten å gjøre antakelser til godkjenninger.'
  },
  {
    id: 'scene_og_teknisk_sjekkpunkt',
    name: 'Scenen og teknisk sjekkpunkt',
    function: 'Her holdes rigg, strøm, lys, lyd, scenemekanikk, belastning, sikkerhetstest, avvik og teknisk frigivelse samlet. En kunstnerisk eller produksjonsmessig bestilling er aldri i seg selv sikkerhetsgodkjenning, og retest får navngitt eier og konkret omfang.'
  },
  {
    id: 'inspisientpult_og_cuebok',
    name: 'Inspisientpulten og cueboken',
    function: 'Her holdes calls, cues, stoppkriterier, gjeldende sceneversjon, kommunikasjon og forestillingsavvik samlet. Cueboken viser hva som er låst, betinget eller trukket tilbake slik at lys, lyd, scene og utøvere ikke arbeider etter ulike versjoner.'
  },
  {
    id: 'foaje_og_publikumsflyt',
    name: 'Foajeen og publikumsflyten',
    function: 'Her kobles innslipp, kø, universell utforming, vertskap, forsinkelsesinformasjon og publikumsbehov til faktisk scenestatus. Front-of-house får sann og tidsstemplet status uten å bli gjort til eier av teknisk frigivelse eller kunstnerisk beslutning.'
  }
];

const writeJson = (rel, value) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), {recursive:true});
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
};

const roleModel = {
  schema:'civication_role_model_v2',
  version:2,
  category:'scenekunst',
  role_scope:ROLE,
  role_id:ROLE,
  title:'Scene og produksjon',
  source:{
    badge_file:'data/badges/scenekunst.json',
    badge_id:'scenekunst',
    evidence:'data/Civication/scenekunstCareerLifeEvidence.json'
  },
  badge_titles:['Scenevert','Produksjonsassistent','Scenetekniker','Inspisientassistent','Produsent'],
  core_narrative:[
    'Scene og produksjon gjør kunstneriske planer spillbare gjennom call, bemanning, teknisk klargjøring, cue, publikumsflyt og sporbar overlevering; Badge-progresjon gir ikke automatisk ansettelse eller myndighet.',
    'Produksjonsboken skiller planlagt, bekreftet, betinget og frigitt status, slik at tidspress aldri blir en erstatning for HMS, teknisk sikkerhet, kunstnerisk mandat, rettigheter eller tilgjengelighet.',
    'Arbeidet går i gjentatte løkker av klargjøring, kontroll, venting, handoff, forestilling, avvik og avgrenset rework der samme beslutningshistorikk følger objektet videre.'
  ],
  competence_axes:[
    'publikumsflyt_og_vertsskap',
    'produksjonsplanlegging',
    'scene_og_teknisk_sikkerhet',
    'cue_og_avvikskommunikasjon',
    'ressurs_og_tidskoordinering',
    'tverrfaglig_samarbeid'
  ],
  ideal_type_problems:[
    {id:'forsinket_innslipp',problem:'Publikumskø og forsinket sceneklarering kolliderer med annonsert start.'},
    {id:'teknisk_avvik',problem:'Et teknisk avvik oppstår kort før forestilling og må håndteres uten å presse sikkerhetsgrensen.'},
    {id:'cue_kollisjon',problem:'Lys, lyd og sceneskift har motstridende cue-behov i samme overgang.'},
    {id:'ressursmangel',problem:'En nøkkelressurs faller ut og produksjonsplanen må omprioriteres.'},
    {id:'turne_overlevering',problem:'Produksjonen skal overleveres til en ny arena med andre tekniske og publikumsrettede rammer.'}
  ],
  authority_boundaries:{
    cannot:[
      'overstyre_godkjente_hms_og_sikkerhetsgrenser',
      'endre_kunstnerisk_innhold_uten_mandat',
      'inngaa_bindende_kontrakter_uten_fullmakt',
      'ignorere_rettighets_eller_tilgjengelighetskrav',
      'kommunisere_betinget_scene_som_teknisk_frigitt'
    ]
  },
  notes:['Shared canonical work world for Scenekunst; legacy `teater` role models are retained separately for compatibility.'],
  work_life:{
    daily_work:[
      'Oppdaterer produksjonsbok, call og bemanning med faktisk status, avhengighet, eier og neste kontroll.',
      'Koordinerer teknisk klargjøring og verifiserer at frigivelse kommer fra ansvarlig funksjon før innslipp eller cue.',
      'Holder cuebok og publikumsinformasjon synkronisert med gjeldende sceneversjon og registrerte stoppkriterier.',
      'Logger avvik, konsekvens og retest slik at senere endring gjenåpner bare berørte ledd før ny handoff.'
    ],
    responsibilities:[
      'produksjonsplan og call',
      'teknisk klargjøring og sikker handoff',
      'cue og forestillingsgjennomføring',
      'publikumsflyt og tilgjengelighet',
      'avvik, dokumentasjon og rework'
    ],
    work_environment:[
      'Produksjonskontor, scene, inspisientpult og foajé med reell venting på teknisk frigivelse, bemanning, rettighet, tilgjengelighet eller kunstnerisk avklaring.'
    ],
    status_position:[
      'Tillit følger evnen til å holde sann status og tydelige handoffs under press uten å låne myndighet fra sikkerhet, kunstnerisk ledelse, rettighet eller kontrakt.'
    ],
    workplaces:places.map(x=>x.id)
  },
  career_path:{
    entry_from:['Avtalt scene-/produksjonsstilling eller oppdrag; Badge-progresjon alene gir ikke ansettelse.'],
    progression_to:['Større produksjons-, inspisient- eller teknisk ansvar innen dokumentert kompetanse og delegert mandat.'],
    possible_promotions:[
      'Produksjonsleder eller hovedinspisient med større plan-, bemannings- og handoffansvar.',
      'Teknisk leder eller produsent når kompetanse, fullmakt og arbeidsgiverprosess er oppfylt.'
    ],
    possible_exits:[
      'Regi/koreografi, program/kuratering, arrangementsproduksjon eller kulturarena-drift.',
      'Teknisk produksjon, turnéledelse, prosjektledelse eller publikumsarbeid.'
    ],
    career_risks:[
      'Tidspress kan gjøre betinget status til falsk frigivelse og flytte risiko til scene, utøvere eller publikum.',
      'Utydelig call- og versjonskontroll kan skape dobbeltarbeid, arbeidstidsbrudd, feil cue og svekket tillit.'
    ]
  },
  required_knowledge:{
    education_basis:[
      'Produksjonsplanlegging, sceneteknisk grunnforståelse, HMS, cue/inspisientarbeid, arbeidstid, tilgjengelighet, rettigheter og publikumslogistikk.'
    ],
    skills:[
      'produksjonsplan_og_call',
      'scene_og_teknisk_sjekk',
      'cue_og_cuebok',
      'publikumsflyt_og_tilgjengelighet',
      'avvik_og_rework',
      'handoff_og_statussprak'
    ],
    category_knowledge:[
      'Hvordan kunstnerisk plan, bemanning, teknikk, sikkerhet, cue, publikum, rettigheter og tidsvinduer må møtes i én sporbar forestillingsstatus.'
    ],
    history_go_badges:['scenekunst'],
    place_connections:places.map(x=>x.id),
    people_connections:actors.map(x=>x.id)
  },
  authority_boundary:{
    may:[
      'koordinere produksjonsplan, call og bemanning innen delegert mandat',
      'be om og dokumentere teknisk, kunstnerisk, rettighets- og tilgjengelighetsavklaring',
      'holde tilbake innslipp eller handoff når ansvarlig frigivelse mangler',
      'replanlegge berørte oppgaver når premiss endres'
    ],
    may_not:[
      'overstyre_godkjente_hms_og_sikkerhetsgrenser',
      'endre_kunstnerisk_innhold_uten_mandat',
      'inngaa_bindende_kontrakter_uten_fullmakt',
      'ignorere_rettighets_eller_tilgjengelighetskrav',
      'kommunisere_betinget_scene_som_teknisk_frigitt'
    ]
  },
  related_people:actors.map(a=>({...a,fictional:true,fictional_scenario_actor:true,canonical_person_ref:null})),
  related_places:places
};

const grammar = {
  schema:'civication_work_grammar_v2',
  version:2,
  category:'scenekunst',
  role_scope:ROLE,
  source:{evidence:'data/Civication/scenekunstCareerLifeEvidence.json'},
  badge_binding:{badge_id:'scenekunst',badge_titles:roleModel.badge_titles},
  task_families:[
    'publikum_og_vertskap',
    'produksjonsplan_og_call',
    'teknisk_klargjoring_og_sjekk',
    'cue_og_forestilling',
    'avvik_og_etterarbeid'
  ],
  work_loops:[
    {id:'forestilling',steps:['klargjor','sjekk','call','gjennomfor','logg_avvik']},
    {id:'produksjonsdag',steps:['prioriter','fordel','koordiner','verifiser','overlever']}
  ],
  practice_stories:[
    {id:'s1',setup:'Dørene skal åpnes, men scenen er ikke teknisk frigitt.',good:'Hold publikum informert, koordiner med teknisk ansvarlig og åpne først når sikkerhetsstatus er avklart.',bad:'Åpne likevel for å unngå forsinkelse.'},
    {id:'s2',setup:'En scenemekanikk gir uventet feilmelding før et skift.',good:'Stans det berørte elementet, aktiver avtalt avviksprosedyre og finn en sikker alternativ løsning.',bad:'Be en medarbeider om å improvisere rundt sperren.'},
    {id:'s3',setup:'Regissøren ønsker et ekstra cue som kolliderer med bemanning.',good:'Synliggjør konsekvensen og avklar prioritering med ansvarlig kunstnerisk og teknisk linje.',bad:'Legg inn cue uten kapasitetssjekk.'},
    {id:'s4',setup:'En turnéarene har lavere bæreevne enn opprinnelig scene.',good:'Tilpass teknisk plan og dokumenter hva som må endres før rigg.',bad:'Bruk original rigg fordi forestillingen skal se lik ut.'},
    {id:'s5',setup:'En produksjonsdag går over planlagt arbeidstid.',good:'Replanlegg og eskaler bemannings-/arbeidstidsbehov etter gjeldende rammer.',bad:'Forutsett at alle bare blir til jobben er ferdig.'}
  ],
  quality_axes:['sikkerhet','presisjon','flyt','kommunikasjon','tilgjengelighet','dokumentasjon'],
  authority_boundary:{may_not:roleModel.authority_boundary.may_not},
  role_id:ROLE,
  work_world:'Scene- og produksjonsarbeid der samme produksjonsbok binder call, bemanning, teknisk frigivelse, cue, publikumsflyt, avvik og handoff sammen uten å blande koordinering med sikkerhets-, kunstnerisk-, rettighets- eller kontraktsmyndighet.',
  pressure_axes:[
    'annonsert_start_vs_reell_scenefrigivelse',
    'kunstnerisk_endring_vs_bemanning_og_teknisk_sikkerhet',
    'produksjonsfart_vs_arbeidstid_og_dokumentasjon',
    'publikumsforventning_vs_tilgjengelighet_og_sann_status'
  ],
  actor_grammar:actors.map(({id,name,role,workplace_ids})=>({id,name,role,workplace_ids})),
  place_grammar:places,
  persistent_work_object_contract:{
    id:'produksjonsbok_call_og_avvikslogg',
    description:'Versjonert produksjonsbok for plan, call, bemanning, scenestatus, teknisk frigivelse, cue, publikumsinformasjon, avvik, beslutningseier, handoff og senere effekt.',
    states:[
      'plan_og_call_registrert',
      'teknisk_klargjoring_pagar',
      'venter_pa_frigivelse_eller_avklaring',
      'betinget_klar',
      'scene_teknisk_frigitt',
      'forestilling_og_cue',
      'avvik_og_bounded_rework',
      'handoff_og_etterarbeid'
    ],
    handoff_rule:'Neste funksjon mottar gjeldende plan/call, sceneversjon, teknisk status, bemanning, publikumspremiss, åpne avhengigheter, beslutningseier, siste avvik og konkret kontroll før status kan endres.'
  },
  rhythm_contract:{
    loop:'plan -> klargjor -> verify -> waiting/venting -> frigiv eller beting -> handoff -> cue/innslipp -> avvik -> effektkontroll -> bounded rework',
    waiting_states:[
      'teknisk_sikkerhetsfrigivelse',
      'kunstnerisk_avklaring',
      'bemanning_eller_arbeidstid',
      'rettighet_eller_tilgjengelighet'
    ],
    rework_rule:'Endret premiss gjenåpner bare berørte plan-, bemannings-, teknikk-, cue-, publikums- eller rettighetsledd; tidligere status, begrunnelse, eier og varsling beholdes.'
  },
  knowledge_dependencies:[
    {
      id:'history_go_scenekunst_edith_roger_nationaltheatret_produksjonsblikk',
      badge_id:'scenekunst',
      use:'Historisk kontekst om Edith Roger og Nationaltheatret som grunnlag for spørsmål om hvordan scenepraksis, ensemble og institusjonelle rammer henger sammen; aldri fasit for dagens sikkerhet, bemanning, cue eller produksjonsmyndighet.'
    }
  ],
  day_one_contract:{
    entry:'appointment_required',
    first_object:'produksjonsbok_call_og_avvikslogg',
    first_task:'Registrer dagens første call med sceneversjon, bemanning, teknisk status, innslippspremiss, beslutningseiere, åpne avhengigheter og hvilken kontroll som må passere før noe kommuniseres som frigitt.'
  },
  mail_generation_contract:{
    required_mail_types:TYPES,
    role_scope:ROLE,
    no_generic_fallback:true
  }
};

const typeFamily = {
  job:'scene_produksjonsbok',
  people:'scene_arbeidsrelasjoner',
  conflict:'scene_sikkerhet_og_tidspress',
  story:'scene_forestilling_i_drift',
  event:'scene_endret_bemanning',
  micro:'scene_statussprak',
  followup:'scene_tilgjengelighet_og_handoff',
  knowledge:'scene_history_go',
  consequence:'scene_sen_endring'
};

const defs = [
  {id:'scene_call_001',type:'job',from:'Ida',person:'ida_produksjonsleder',place:'produksjonskontor_og_callboard',subject:'Første call har tider, men tre avhengigheter står fortsatt som antakelser',competency:'produksjonsplan_og_call',specific:'Callen viser bemanning og tider, men scenefrigivelse, én nøkkelressurs og endelig innslippstid er ikke bekreftet.',good:'Merk hver avhengighet med eier og status, og distribuer en versjon som tydelig skiller planlagt, bekreftet og frigitt før noen bygger videre på callen.',bad:'Send callen som endelig for å skape arbeidsro og oppdater avvikene senere.'},
  {id:'scene_innslipp_002',type:'job',from:'Samira',person:'samira_publikumskoordinator',place:'foaje_og_publikumsflyt',subject:'Publikum står i kø, men scenen er bare betinget klar',competency:'publikumsflyt_og_sann_status',specific:'Foajeen fylles opp mens teknisk sjekk fortsatt har ett åpent stoppkriterium, og annonsert start nærmer seg.',good:'Gi Samira sann betinget status, nytt informasjonstidspunkt og publikumsalternativ, og åpne først når ansvarlig teknisk funksjon faktisk frigir scenen.',bad:'Åpne salen gradvis for å redusere køen og anta at siste tekniske punkt løses før publikum merker det.'},
  {id:'scene_cue_003',type:'job',from:'Jonas',person:'jonas_inspisient',place:'inspisientpult_og_cuebok',subject:'Nytt lyscue kolliderer med sceneskift og tilgjengelig bemanning',competency:'cue_og_handoff',specific:'Et sent kunstnerisk ønske legger et nytt cue inn i samme overgang som et bemanningskrevende sceneskift.',good:'Hold cueet betinget, kartlegg kapasitet og sikkerhetskonsekvens og få kunstnerisk og teknisk eier til å velge en gjennomførbar versjon før cueboken låses.',bad:'Legg cueet inn i cueboken og be teamet finne en praktisk løsning under gjennomløpet.'},
  {id:'scene_turne_004',type:'job',from:'Marwa',person:'marwa_sceneteknisk_leder',place:'scene_og_teknisk_sjekkpunkt',subject:'Turnéareneen har andre laste- og strømrammer enn originalscenen',competency:'turne_handoff_og_teknisk_plan',specific:'Mottaksarenaen dokumenterer lavere bæreevne og en annen strømfordeling enn produksjonen opprinnelig er rigget for.',good:'Lag en arena-spesifikk teknisk variant med eksplisitte avvik, ny test og eier før handoff, samtidig som kunstnerisk funksjon av endringene beskrives separat.',bad:'Send original teknisk plan som utgangspunkt og la mottaksarenaen improvisere tilpasningen på riggedagen.'},
  {id:'scene_ida_005',type:'people',from:'Ida',person:'ida_produksjonsleder',place:'produksjonskontor_og_callboard',subject:'Ida trenger en replan uten at usikker status blir skjult',competency:'produksjonsledelse_og_delegasjon',specific:'To avdelinger rapporterer ulik forståelse av hva som faktisk er låst etter en tidsforskyvning.',good:'Samle én tidsstemplet status med ansvarseier, avhengighet og neste kontroll, og la Ida replanlegge bare det som ligger innen produksjonsmandatet.',bad:'Be Ida sende en tydelig ordre om at gammel plan fortsatt gjelder til noen eksplisitt stopper den.'},
  {id:'scene_jonas_006',type:'people',from:'Jonas',person:'jonas_inspisient',place:'inspisientpult_og_cuebok',subject:'Jonas har to ulike sceneversjoner i omløp før gjennomløp',competency:'cueversjon_og_inspisientgrense',specific:'En kunstnerisk note er oppdatert, men teknisk team og ensemble har ikke fått samme versjonsnummer.',good:'Stans låsing av cueboken, identifiser gjeldende versjon og varsle berørte funksjoner før neste gjennomløp, uten å gjøre inspisienten til kunstnerisk beslutningseier.',bad:'La Jonas velge den versjonen som virker mest realistisk og korriger resten etter gjennomløpet.'},
  {id:'scene_marwa_007',type:'people',from:'Marwa',person:'marwa_sceneteknisk_leder',place:'scene_og_teknisk_sjekkpunkt',subject:'Marwa nekter å frigi en mekanisk overgang før ny test',competency:'teknisk_sikkerhetsmandat',specific:'En mekanisk overgang fungerer visuelt, men en sensorfeil gjør at teknisk leder krever ny test.',good:'Registrer stoppet som teknisk eiet, flytt berørte cues og innslippspremiss og test et sikkert alternativ før status kan bli frigitt.',bad:'Be Marwa godkjenne én forestilling med ekstra manuell overvåking siden premieren ellers blir forsinket.'},
  {id:'scene_samira_008',type:'people',from:'Samira',person:'samira_publikumskoordinator',place:'foaje_og_publikumsflyt',subject:'Samira trenger tilgjengelighetsinformasjon før dørene åpnes',competency:'tilgjengelighet_og_vertsskapsgrense',specific:'En midlertidig sceneløsning endrer publikumsrute og påvirker et tilgjengelighetsbehov som allerede er meldt.',good:'Oppdater publikumsrute og informasjon med ansvarlig tilgjengelighetsavklaring, og sørg for at endringen er bekreftet før Samira lover en løsning.',bad:'Be vertskapet løse behovet individuelt ved ankomst slik at resten av produksjonsplanen kan stå.'},
  {id:'scene_premierepress_009',type:'conflict',from:'Ida',person:'ida_produksjonsleder',place:'produksjonskontor_og_callboard',subject:'Premierepress gjør at arbeidstid, sikkerhet og kunstnerisk endring kolliderer',competency:'press_og_mandatgrenser',specific:'En sen kunstnerisk endring krever ekstra rigg og prøve samtidig som teamet nærmer seg avtalt arbeidstidsgrense.',good:'Synliggjør kostnad, sikkerhet og arbeidstid som separate premisser, eskaler til rette eiere og velg bare en versjon som faktisk kan bemannes og testes forsvarlig.',bad:'Be alle bli litt lenger fordi det er premiere og dokumenter overtiden når forestillingen er reddet.'},
  {id:'scene_forestilling_010',type:'story',from:'Jonas',person:'jonas_inspisient',place:'inspisientpult_og_cuebok',subject:'Forestillingen må bæres fra reset til siste cue med samme sannhetskilde',competency:'forestillingsflyt_og_kontinuitet',specific:'Dagen har hatt små endringer i call, teknikk og publikumsflyt, og nå må forestillingen kjøres uten at teamet faller tilbake på muntlige mellomversjoner.',good:'Bruk produksjonsbok og cuebok som felles status, kall bare verifiserte cues og logg hvert avvik med effekt og eier for neste forestilling.',bad:'Stol på at erfarne medarbeidere husker dagens endringer og ta samlet notat etter applaus.'},
  {id:'scene_fravaer_011',type:'event',from:'Ida',person:'ida_produksjonsleder',place:'produksjonskontor_og_callboard',subject:'En nøkkelperson blir syk få timer før forestilling',competency:'bemanning_og_replan',specific:'En funksjon med kritisk kunnskap faller ut, og eksisterende call fordeler ikke kompetansen på en måte som kan bæres av resten av teamet.',good:'Kartlegg hvilke oppgaver som faktisk krever funksjonen, replanlegg eller forenkle berørte ledd og få ansvarlige eiere til å bekrefte ny bemanning og test.',bad:'Fordel oppgavene uformelt på de som allerede er på jobb og behold forestillingsplanen uendret.'},
  {id:'scene_status_012',type:'micro',from:'Marwa',person:'marwa_sceneteknisk_leder',place:'scene_og_teknisk_sjekkpunkt',subject:'«Klar» brukes om både ferdig rigg, testet scene og faktisk frigivelse',competency:'statussprak_og_frigivelse',specific:'Tre team bruker ordet «klar» om ulike tilstander, og det gjør innslipp og cueplan sårbar for antakelser.',good:'Bytt til eksplisitte statuser som klargjort, testet, betinget og teknisk frigitt, med tidsstempel og eier for siste statusendring.',bad:'Be alle bruke «klar» konsekvent og stole på konteksten når de trenger mer detalj.'},
  {id:'scene_tilgjengelighet_013',type:'followup',from:'Samira',person:'samira_publikumskoordinator',place:'foaje_og_publikumsflyt',subject:'Ny publikumsrute må følges opp før neste forestilling',competency:'tilgjengelighet_handoff_og_rework',specific:'En midlertidig løsning fungerte under første forestilling, men publikumsloggen viser at ruten skapte kø og utydelig assistanse.',good:'Behold første løsning som dokumentert versjon, registrer effekten og gjenåpne bare rute-, bemannings- og informasjonsleddene som faktisk må forbedres før ny handoff.',bad:'Erstatt hele publikumsopplegget med en ny plan uten å beholde hva som fungerte eller hvorfor endringen gjøres.'},
  {id:'scene_edith_014',type:'knowledge',from:'Ida',person:'ida_produksjonsleder',place:'nationaltheatret',subject:'Edith Roger og Nationaltheatret: hvilke produksjonsspørsmål blir synlige i historisk scenekunst?',competency:'history_go_produksjonsrefleksjon',specific:'History Go har verifisert personpost om Edith Roger og scenekunstpost for Nationaltheatret; koblingen brukes til historiske spørsmål om scenepraksis, ikke som fasit for dagens drift eller sikkerhet.',good:'Les koblingen og formuler ett spørsmål om hvordan kunstnerisk arbeid, ensemble, scene og institusjonelle rammer må koordineres over tid, uten å låne historisk autoritet til dagens sikkerhets- eller produksjonsbeslutning.',bad:'Bruk den historiske koblingen som bevis for at dagens produksjonspraksis bør følge én bestemt teatertradisjon.'},
  {id:'scene_sen_endring_015',type:'consequence',from:'Jonas',person:'jonas_inspisient',place:'inspisientpult_og_cuebok',subject:'En sen endring fra forrige forestilling har skapt skjult cue- og resetgjeld',competency:'sen_konsekvens_og_bounded_rework',specific:'Et improvisert grep reddet forrige forestilling, men neste dags reset viser at lys, scene og cuebok nå beskriver ulike utgangspunkt.',good:'Logg den faktiske konsekvensen, gjenåpne bare de berørte cue-, reset- og sceneleddene og krev ny felles versjon før gjennomløp.',bad:'La teamet gjenta gårsdagens improvisasjon siden den fungerte foran publikum og formaliser den etter noen forestillinger.'}
];

const commonSummary = ' Produksjonsboken skal samtidig skille planlagt, bekreftet, betinget og frigitt status for plan, bemanning, teknikk, cue og publikum. Dermed kan senere endringer gjenåpne bare berørte ledd uten at tidligere begrunnelse, eier, sikkerhetsgrense eller varsling forsvinner. Hver mail må gjøre synlig hva som faktisk er observert eller bekreftet, hvem som må svare før neste statusendring, og hva resten av teamet skal beholde mens avklaringen pågår.';

const makeChoice = (d, positive) => {
  if (positive) {
    return {
      id:'A',
      label:`Sporbar ${d.competency.replaceAll('_',' ')} med eksplisitt eier`,
      reply:`${d.good} Jeg oppdaterer produksjonsbok, gjeldende status, beslutningseier, åpne avhengigheter og neste kontroll slik at koordinering ikke blir lest som teknisk frigivelse, kunstnerisk mandat, rettighetsavklaring eller bindende fullmakt.`,
      effect:1,
      tags:['sporbarhet','sikkerhet','handoff'],
      feedback:`${d.good} Dette holder produksjonen i bevegelse samtidig som scene, inspisient, teknikk og vertskap kan se hva som er planlagt, bekreftet, betinget og frigitt. Når premisset endres blir rework avgrenset, og status kan overleveres uten å skjule sikkerhet, arbeidstid, tilgjengelighet eller beslutningseier.`,
      effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}
    };
  }
  return {
    id:'B',
    label:`Anta ${d.competency.replaceAll('_',' ')} og fyll sporbarhet senere`,
    reply:`${d.bad} Jeg lar produksjonsfarten være styrende og kompletterer status, eier, sikkerhets- eller handoffdetaljer senere dersom neste funksjon oppdager et problem eller ber om dokumentasjon.`,
    effect:-1,
    tags:['mandatglidning','statusgjeld','risiko'],
    feedback:`${d.bad} Det kan spare minutter nå, men flytter usikkerhet og risiko til scene, inspisient, teknikk, utøvere eller publikum. Når et premiss endres blir det uklart hvilken versjon som gjaldt, hvem som frigav hva, og hvilke deler som faktisk må testes på nytt.`,
    effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}
  };
};

const mails = defs.map((d, idx) => {
  const m = {
    id:d.id,
    mail_type:d.type,
    mail_family:typeFamily[d.type],
    role_scope:ROLE,
    phase:idx < 5 ? 'forenoon' : idx < 10 ? 'workday' : 'late_workday',
    day_phase:idx < 5 ? 'morning' : 'afternoon',
    priority:150-idx,
    from:d.from,
    people_ref:d.person,
    person_id:d.person,
    place_id:d.place,
    subject:d.subject,
    summary:d.specific + commonSummary,
    situation:[
      d.specific,
      'Produksjonskoordinering er ikke i seg selv teknisk sikkerhetsgodkjenning, kunstnerisk mandat, rettighetsavklaring, kontraktsfullmakt eller universell-utforming-fasit.',
      'Neste steg må ha navngitt eier, eksplisitt status og kunne gjenåpnes av ny dokumentert informasjon uten at tidligere versjon slettes.'
    ],
    task_domain:ROLE,
    competency:d.competency,
    pressure:'produksjonsfart_vs_sporbar_frigivelse_og_handoff',
    choice_axis:'sann_status_og_bounded_rework_vs_antakelse_og_skjult_gjeld',
    consequence_axis:'baerekraftig_forestilling_vs_sikkerhets_versjons_og_tillitsgjeld',
    narrative_arc:d.id.replace('scene_',''),
    situated_audience_id:d.type === 'knowledge' ? 'historisk_scenekunstkontekst' : 'scene_produksjon_og_publikum',
    choices:[makeChoice(d,true),makeChoice(d,false)]
  };
  if (d.type === 'knowledge') {
    m.interaction_mode = 'task';
    m.task_contract = {
      task_id:'scenekunst_scene_og_produksjon_history_go_edith_roger',
      completion_rule:'history_go_payload_completed',
      failure_rule:'remain_open',
      evidence_refs:[
        'data/people/litteratur/oslo/nationaltheatret/edith_roger.json',
        'data/places/scenekunst/oslo/places_scenekunst/nationaltheatret.json'
      ]
    };
    m.task_payload = {
      task_kind:'history_go_person',
      target_type:'person',
      person_id:'edith_roger',
      completion_mode:'read_profile',
      title:'Les Edith Roger som historisk scenekunstkontekst',
      description:'Noter ett spørsmål om hvordan kunstnerisk arbeid, ensemble, scene og institusjonelle rammer må koordineres over tid uten å gjøre historien til fasit for dagens produksjons-, sikkerhets- eller bemanningsmyndighet.',
      return_context:{source:'civication',mail_id:d.id,role_scope:ROLE}
    };
  }
  return m;
});

const mailByType = Object.fromEntries(TYPES.map(t=>[t,mails.filter(m=>m.mail_type===t)]));
const familyPurpose = 'Authored scene/production gameplay with persistent production state, truthful release status, explicit handoffs and bounded authority.';
const focus = ['produksjonsplan_og_call','teknisk_sikkerhet','cue_og_forestilling','publikumsflyt_og_tilgjengelighet','avvik_handoff_og_rework'];

for (const t of TYPES) {
  writeJson(`data/Civication/mailFamilies/scenekunst/${t}/${ROLE}_${t}.json`, {
    schema:'civication_mail_family_catalog_v1',
    version:1,
    category:'scenekunst',
    role_scope:ROLE,
    mail_type:t,
    families:[{
      id:typeFamily[t],
      purpose:familyPurpose,
      learning_focus:focus,
      mails:mailByType[t]
    }]
  });
}

const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const phaseFor = i => i < 3 ? 'intro' : i < 10 ? 'advanced' : 'mastery';
const stepGoal = t => ({
  job:'Oppdater produksjonsbok/call med sann status, eier, avhengighet og neste kontroll.',
  people:'Bevar koordinering, sikkerhet, kunstnerisk mandat, rettighet og tilgjengelighetsgrenser i arbeidsrelasjonen.',
  conflict:'Skill premierepress, arbeidstid, sikkerhet og kunstnerisk endring før beslutning.',
  story:'Bær samme produksjonsstatus gjennom hel forestilling og dokumenter avvik.',
  event:'Replanlegg berørte oppgaver når bemanning eller premiss endres.',
  micro:'Bruk eksplisitt statusspraak for klargjort, testet, betinget og frigitt.',
  followup:'Bruk faktisk effekt til avgrenset rework og ny handoff.',
  knowledge:'Bruk History Go til et bedre produksjonsspørsmål uten fasitspråk.',
  consequence:'Koble sen konsekvens til dokumentert versjon og bounded rework.'
})[t];

const mailPlan = {
  schema:'civication_mail_plan_v1',
  version:1,
  id:`${ROLE}_foundation_v1`,
  category:'scenekunst',
  role_scope:ROLE,
  title:'Scene og produksjon',
  description:'Seksten steg gjennom samme produksjonsforløp fra første call og teknisk klargjøring til innslipp, cue, forestilling, turnéhandoff, avvik og sen konsekvens.',
  arc:{
    from:'Ny scene-/produksjonsfunksjon uten felles status for call, teknisk frigivelse, cue og publikum.',
    to:'Produksjonsmedarbeider som holder sann status og sikker handoff gjennom press uten å låne myndighet fra teknikk, kunstnerisk ledelse, rettighet eller kontrakt.',
    core_questions:[
      'Hva er planlagt, hva er bekreftet, og hva er faktisk frigitt?',
      'Hvem eier neste avklaring eller stoppkriterium?',
      'Hvilke ledd må retestes eller varsles når premisset endres?'
    ]
  },
  situated_audience_contract:{
    no_global_score:true,
    audiences:['produksjon_og_inspisient','teknikk_og_sikkerhet','kunstnerisk_team_og_utovere','publikum_og_vertskap'],
    rule:'Standing er bundet til konkret arbeidsrelasjon og leveranse; den skaper aldri global score, teknisk frigivelse, kunstnerisk mandat, rettighet eller kontraktsfullmakt.'
  },
  outcome_rules:{
    promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},
    fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},
    stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','produksjon_uten_sporbar_frigivelse']}
  },
  sequence:sequenceTypes.map((t,i)=>({
    step:i+1,
    type:t,
    phase:phaseFor(i),
    step_goal:stepGoal(t),
    allowed_families:[typeFamily[t]],
    fallback_types:[]
  }))
};

writeJson(MODEL, roleModel);
writeJson(GRAMMAR, grammar);
writeJson(PLAN, mailPlan);

const manifestPath = path.join(ROOT,'data/Civication/roleModels/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if (!manifest.files.includes(MODEL)) {
  manifest.files.push(MODEL);
  manifest.files.sort();
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest,null,2)+'\n');

const report = `# Scenekunst — Scene og produksjon prerequisites source-first

## Scope
This materialization closes the current authored prerequisite debt for \`${KEY}\`. It is **not Role World completion** and it creates no new runtime.

## Existing source foundation
- Canonical Scenekunst badge/career evidence remains the source boundary.
- The pre-existing role model already defined the five role titles and core safety/artistic authority boundary.
- The pre-existing work grammar already defined audience, production-plan, technical-check, cue/show and deviation/afterwork task families.
- This pass expands those sources into a complete, role-owned prerequisite package rather than inventing a parallel career.

## Materialized work world
- Four fictional scenario actors: Ida (produksjonsleder), Jonas (inspisient), Marwa (sceneteknisk leder), Samira (publikums- og vertskapskoordinator).
- Four role-owned work surfaces: produksjonskontor/callboard, scene/teknisk sjekkpunkt, inspisientpult/cuebok, foajé/publikumsflyt.
- Persistent object: \`produksjonsbok_call_og_avvikslogg\`.
- Rhythm: plan → klargjør → verify → waiting/venting → frigiv/beting → handoff → cue/innslipp → avvik → effektkontroll → bounded rework.
- Fifteen authored mails across all nine required mail types, with a deterministic 16-step plan and no generic fallback.
- Bounded History Go affordance: Edith Roger / Nationaltheatret is used to formulate a historical production question, never as authority for current HMS, technical release, staffing or production decisions.

## Authority boundary
Production coordination may schedule, request evidence, hold status and replan. It may not override HMS/technical safety, change artistic content without mandate, enter binding contracts without authority, ignore rights/accessibility, or communicate a conditional scene as technically released.

## Cross-role
Readiness remains \`candidate_when_shared_work_is_real\`. No shared-work object or cross-role runtime is materialized here; future cross-role linkage requires an actually shared versioned work object and explicit ownership/handoff evidence.

## Quality gate
29/30 before ordinary exact-head PR browser/boot CI. The withheld point is intentionally reserved for the independent exact-head browser/boot gate after permanent materialization.
`;
fs.mkdirSync(path.dirname(path.join(ROOT,REPORT)),{recursive:true});
fs.writeFileSync(path.join(ROOT,REPORT),report);

const test = `const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(R,p))),KEY='${KEY}',ROLE='${ROLE}',MODEL='${MODEL}',GRAMMAR='${GRAMMAR}',PLAN='${PLAN}',TYPES=${JSON.stringify(TYPES)},ACTORS=${JSON.stringify(actors.map(x=>x.id))},PLACES=${JSON.stringify(places.map(x=>x.id))};
const g=read(GRAMMAR);
assert.equal(g.persistent_work_object_contract.id,'produksjonsbok_call_og_avvikslogg');
assert.match(g.rhythm_contract.loop,/waiting|venting/i);
assert.deepEqual(g.actor_grammar.map(x=>x.id),ACTORS);
assert.deepEqual(g.place_grammar.map(x=>x.id),PLACES);
assert.ok(g.knowledge_dependencies.some(x=>x.id==='history_go_scenekunst_edith_roger_nationaltheatret_produksjonsblikk'));
assert.deepEqual(g.mail_generation_contract.required_mail_types,TYPES);
assert.equal(g.day_one_contract.entry,'appointment_required');
assert.match(g.authority_boundary.may_not.join(' '),/hms|sikkerhet/i);
assert.match(g.authority_boundary.may_not.join(' '),/kunstnerisk/i);
assert.match(g.authority_boundary.may_not.join(' '),/rettighet|tilgjengelig/i);
assert.equal(read('data/Civication/roleModels/manifest.json').files.filter(x=>x===MODEL).length,1);
const model=read(MODEL);
assert.deepEqual(model.work_life.workplaces,PLACES);
assert.deepEqual(model.related_people.map(x=>x.id),ACTORS);
for(const[i,p]of model.related_people.entries()){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null);assert.deepEqual(p.workplace_ids,[PLACES[i]]);assert.ok(p.function.length>=220);assert.ok(p.authority_relation.length>=220)}
assert.ok(model.career_path.possible_promotions.length>=2);assert.ok(model.career_path.possible_exits.length>=2);assert.ok(model.required_knowledge.history_go_badges.includes('scenekunst'));
const plan=read(PLAN);
assert.equal(plan.id,ROLE+'_foundation_v1');assert.equal(plan.sequence.length,16);
assert.deepEqual(plan.sequence.map(x=>x.type),${JSON.stringify(sequenceTypes)});
for(const[i,s]of plan.sequence.entries()){assert.equal(s.step,i+1);assert.deepEqual(s.fallback_types,[]);assert.equal(s.allowed_families.length,1)}
for(const x of ['promoted','fired','stagnated'])assert.ok(plan.outcome_rules[x]);
const C={job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1},ids=new Set(),subjects=new Set();
for(const type of TYPES){const c=read('data/Civication/mailFamilies/scenekunst/'+type+'/'+ROLE+'_'+type+'.json'),ms=c.families.flatMap(f=>f.mails||[]),labels=[];assert.equal(c.schema,'civication_mail_family_catalog_v1');assert.equal(c.mail_type,type);assert.equal(ms.length,C[type]);for(const x of ms){assert.ok(!ids.has(x.id));assert.ok(!subjects.has(x.subject));ids.add(x.id);subjects.add(x.subject);assert.ok(x.summary.length>=320);assert.equal(x.situation.length,3);assert.equal(x.choices.length,2);for(const q of x.choices){labels.push(q.label);assert.ok(q.reply.length>=150);assert.ok(q.feedback.length>=220);assert.ok(Object.keys(q.effects.stats).length>=3)}}assert.equal(new Set(labels).size,labels.length)}
assert.equal(ids.size,15);
const k=read('data/Civication/mailFamilies/scenekunst/knowledge/'+ROLE+'_knowledge.json').families[0].mails[0];
assert.equal(k.place_id,'nationaltheatret');assert.equal(k.task_payload.person_id,'edith_roger');assert.equal(k.task_contract.completion_rule,'history_go_payload_completed');for(const r of k.task_contract.evidence_refs)assert.ok(fs.existsSync(path.join(R,r)),r);
const pack=read('data/Civication/rolePackIndex.json').roles.find(x=>x.category==='scenekunst'&&x.role_scope===ROLE);assert.equal(pack.status,'complete_reference_v2');
const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(x=>x.key===KEY);assert.equal(career.status,'playable');assert.equal(career.audit.runtime_gate,true);assert.deepEqual(career.audit.missing_components,[]);
const rr=read('data/Civication/roleWorldRolloutReadiness.json'),ready=rr.roles.find(x=>x.key===KEY);assert.equal(ready.classification,'rollout_ready');assert.ok(['role_world_not_started','role_world_complete'].includes(ready.role_world_status));for(const d of ['people_places_integrity','persistent_work_object','rhythm_waiting_handoff_rework','history_go_affordance','situated_reputation'])assert.equal(ready.dimensions[d].status,'foundation_ready',d);assert.deepEqual(ready.authored_work_required,[]);assert.equal(ready.cross_role.need,'candidate_when_shared_work_is_real');assert.equal(rr.rollout_queue.some(x=>x.key===KEY),ready.role_world_status==='role_world_not_started');
const sp=read('data/Civication/scenarioPeople/generated/scenekunst.json'),fp=new Set(Object.values(sp.people_pool||{}).flat().map(x=>x.person_id));for(const id of ACTORS)assert.ok(!fp.has(id));
const sf=fs.readFileSync(path.join(R,'${REPORT}'),'utf8');assert.match(sf,/not Role World completion/i);assert.match(sf,/produksjonsbok_call_og_avvikslogg/);assert.match(sf,/candidate_when_shared_work_is_real/);assert.match(sf,/29\\/30/);
console.log('Civication Scenekunst Scene og produksjon prerequisites: OK');
`;
fs.writeFileSync(path.join(ROOT,TEST),test);

console.log(JSON.stringify({
  role:KEY,
  actors:actors.length,
  places:places.length,
  mails:mails.length,
  sequence:mailPlan.sequence.length,
  persistent_work_object:grammar.persistent_work_object_contract.id
},null,2));
