import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ROLE = 'politikk_kommunal_ledelse';
const CATEGORY = 'politikk';
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_POLITIKK_KOMMUNAL_LEDELSE_PREREQUISITES_SOURCE_FIRST.md';
const TEST = 'tests/civication-politikk-kommunal-ledelse-prerequisites.test.js';
const MANIFEST = 'data/Civication/roleModels/manifest.json';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'mandat_saksgrunnlag_habilitet_dagsorden_vedtak_begrunnelse_implementering_og_oppfolgingslogg';
const WAITING = [
  'administrativ_saksutredning',
  'habilitetsavklaring',
  'juridisk_hjemmelsavklaring',
  'budsjett_og_okonomiavklaring',
  'utvalgs_eller_formannskapsbehandling',
  'kommunestyrebehandling',
  'implementering_etterkontroll_eller_nye_fakta'
];

const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

const ACTORS = [
  {
    id:'sara_kommunedirektor_politikk_kommunal_ledelse',
    name:'Sara',
    role:'kommunedirektør',
    workplace_ids:['saksgrunnlag_og_administrativt_skille_kommune'],
    function:'Sara bærer administrasjonens helhetlige saksforberedelse, internkontroll og faglige integritet. Hun sørger for at utredning, økonomi, risiko, lovgrunnlag og gjennomføringsansvar er tydelig før politiske organer behandler en sak, og hun markerer eksplisitt når et politisk ønske må formuleres som bestilling eller vedtak i stedet for å bli behandlet som en administrativ fagkonklusjon.',
    authority_relation:'Sara kan organisere administrasjonen, levere faglige råd, gjøre oppmerksom på lov-, økonomi- og gjennomføringsrisiko og kreve et forsvarlig saksgrunnlag. Hun kan ikke gi spilleren election_or_mandate, overta kommunestyrets politiske valg, fabrikere hjemmel eller endre faglige konklusjoner fordi ordfører, flertall, parti eller offentlighet ønsker et bestemt budskap.'
  },
  {
    id:'jonas_kommuneadvokat_politikk_kommunal_ledelse',
    name:'Jonas',
    role:'kommuneadvokat og habilitetsrådgiver',
    workplace_ids:['habilitet_hjemmel_og_vedtaksrom_kommune'],
    function:'Jonas bærer den rettslige og prosessuelle kontrollen rundt habilitet, delegasjon, møteoffentlighet, vedtaksmyndighet og dokumentasjon. Han gjør det synlig når en sak må stanses, flyttes til riktig organ eller behandles på nytt, og sørger for at rettslige vurderinger og faktiske forutsetninger blir bevart selv når det politiske flertallet ønsker rask framdrift.',
    authority_relation:'Jonas kan gi rettslige råd, markere mulig inhabilitet, kontrollere delegasjon og anbefale at et vedtak utsettes eller behandles i riktig organ. Han kan ikke skape election_or_mandate, gjøre juridisk rådgivning til politisk beslutning, gi ordføreren kompetanse kommunestyret ikke har delegert, eller bruke lovspråk som dekke for et partipolitisk ønsket resultat.'
  },
  {
    id:'elin_formannskapssekretaer_politikk_kommunal_ledelse',
    name:'Elin',
    role:'formannskapssekretær og møtekoordinator',
    workplace_ids:['kommunestyresal_og_moteledelse_kommune'],
    function:'Elin bærer den demokratiske møteflyten fra innkalling og dagsorden til talerliste, habilitetsmarkering, forslag, votering, protokoll og videre oppfølging. Hun gjør alternative forslag og korrekt beslutningsnivå synlige og beskytter mindretallets og offentlighetens mulighet til å forstå hva som faktisk ble behandlet, vedtatt, utsatt eller sendt tilbake.',
    authority_relation:'Elin kan organisere møteprosedyre, dokumentere forslag og voteringer, avklare praktisk møteflyt og stoppe uleselige eller prosessuelt ufullstendige steg. Hun kan ikke velge politisk utfall, gi election_or_mandate, gjøre ordførers møteledelse til personlig vetorett, skjule dissens eller bruke protokollen til å omskrive hva kommunestyret faktisk besluttet.'
  },
  {
    id:'omar_innbyggerdialog_beredskap_politikk_kommunal_ledelse',
    name:'Omar',
    role:'rådgiver for innbyggerdialog og beredskapskommunikasjon',
    workplace_ids:['innbyggerdialog_beredskap_og_oppfolging_kommune'],
    function:'Omar bærer kontakten mellom politisk ledelse, berørte innbyggere, lokale organisasjoner, media og kommunens beredskaps- og tjenestelinjer. Han skiller hva kommunen vet, hva som fortsatt er usikkert, hva som er politisk prioritering og hva som faktisk er vedtatt, og dokumenterer hvilke grupper som blir berørt og hvilke løfter som krever formell behandling.',
    authority_relation:'Omar kan organisere dialog, samle bekymringer, samordne sikker offentlig informasjon og gjøre virkninger for ulike grupper synlige. Han kan ikke gjøre medietrykk, demonstrasjoner, popularitet eller private løfter til kommunalt vedtak, gi election_or_mandate, bruke kommunale kanaler som partikanal eller kommunisere en politisk intensjon som om den allerede hadde hjemmel og beslutning.'
  }
];

const PLACES = [
  {
    id:'kommunestyresal_og_moteledelse_kommune',
    name:'Kommunestyresal og møteledelse',
    function:'Her kobles innkalling, dagsorden, sakskart, habilitet, taleliste, forslag, votering, protokoll og korrekt organ. Ordføreren kan lede prosedyren innen reglement og faktisk mandat, men kan ikke bruke klubbe, taletid eller posisjon til å erstatte kollegial behandling, skjule alternative forslag eller gjøre en personlig preferanse til kommunestyrevedtak.'
  },
  {
    id:'saksgrunnlag_og_administrativt_skille_kommune',
    name:'Saksgrunnlag og administrativt skille',
    function:'Her versjoneres administrasjonens utredning, økonomiske konsekvenser, risiko, tjenestefaglige råd, alternative løsninger og uenighet før politisk behandling. Rommet gjør eksplisitt at folkevalgte kan prioritere annerledes innen lovlig handlingsrom, men ikke kreve at administrasjonen omskriver fakta eller gjør partiprogram og valgkampløfter til faglig konklusjon.'
  },
  {
    id:'habilitet_hjemmel_og_vedtaksrom_kommune',
    name:'Habilitet, hjemmel og vedtaksrom',
    function:'Her kontrolleres election_or_mandate, habilitet, delegasjon, kommunelovens og forvaltningsrettens rammer, budsjettbindinger og hvilket organ som faktisk kan treffe beslutningen. Politisk flertall, hastverk eller ordførertittel registreres aldri som egen hjemmel, og tvil må være synlig før møteledelse, representasjon eller styringssignal kan brukes videre.'
  },
  {
    id:'innbyggerdialog_beredskap_og_oppfolging_kommune',
    name:'Innbyggerdialog, beredskap og oppfølging',
    function:'Her samles berørte grupper, offentlig kommunikasjon, kriseinformasjon, tjenestekonsekvenser, implementeringsansvar, frister, målepunkter og senere kontroll. Ordføreren representerer kommunen innen faktisk mandat, men private løfter, medietrykk og partikommunikasjon kan ikke konverteres til kommunale vedtak; nye fakta og gjennomføringsfunn kan gjenåpne berørte deler med bevart protokoll.'
  }
];

const AUTHORITY = {
  may:[
    'utøve ordførerfunksjoner når election_or_mandate og faktisk kommunalt mandat er dokumentert',
    'lede kommunestyremøter og andre møter innen lov, reglement og delegert rolle',
    'representere kommunen offentlig innen vedtak, fullmakter og sikker kunnskap',
    'søke kompromiss mellom politiske posisjoner uten å skjule alternativer, dissens eller beslutningseier',
    'be om administrativ utredning og oppfølging gjennom formelle kanaler når oppgaven ligger innen politisk organ og delegasjon'
  ],
  may_not:[
    'materialisere ordførermyndighet uten election_or_mandate',
    'sette kollegiale vedtak til side eller gjøre møteledelse til personlig beslutningsrett',
    'instruere administrasjonen til å endre faglige konklusjoner eller skjule vesentlig risiko uten rettslig og politisk grunnlag',
    'delta i eller påvirke en sak når habilitetsreglene krever at spilleren trer til side',
    'bruke kommunale ressurser, kanaler eller representasjonsrolle som privat eller partipolitisk fullmakt',
    'bruke History Go, Politikk-badge, XP, situated reputation, popularitet eller medietrykk som valgresultat, mandat, hjemmel, saksutredning eller kommunalt vedtak'
  ]
};

const model = read(MODEL);
Object.assign(model, {
  core_narrative:[
    'Lede og representere kommunen bare når election_or_mandate er dokumentert, med et lesbart skille mellom folkevalgt politisk prioritering, kollegiale vedtak, administrasjonens faglige integritet, habilitet og den rettslige kompetansen til hvert organ.',
    'Rollen gjør kommunal ledelse spillbar som et vedvarende demokratisk beslutningsspor der sak, utredning, habilitet, dagsorden, forslag, votering, offentlig begrunnelse, implementering og etterkontroll kan endres uten at ordførertittel, partiinteresse eller popularitet blir til egen myndighet.'
  ],
  work_life:{
    daily_work:[
      'avgrense saker mot election_or_mandate, delegasjon og riktig kommunalt organ',
      'lese administrativt saksgrunnlag, økonomi, risiko og juridiske premisser før politisk behandling',
      'lede møteprosedyre, synliggjøre alternative forslag og sikre korrekt votering og protokoll',
      'avklare habilitet, partirolle, representasjonsrolle og når spilleren må tre til side',
      'forklare vedtak offentlig, følge implementering og gjenåpne saken når nye fakta eller gjennomføringsproblemer endrer premissene'
    ],
    responsibilities:[
      'demokratisk møteledelse',
      'kollegial beslutningsmyndighet',
      'habilitet og rolleavklaring',
      'administrasjonens faglige integritet',
      'lovlig delegasjon og hjemmel',
      'innbyggerdialog og offentlighet',
      'skille mellom kommune- og partirolle',
      'implementering og etterkontroll'
    ],
    work_environment:[
      'Kommunestyre, formannskap, rådhus, lokale møter og offentlig representasjon i tett samspill med kommunedirektør, fagadministrasjon, juridiske rådgivere, partier, innbyggere og tjenester.'
    ],
    status_position:[
      'Ordfører materialiseres bare etter election_or_mandate. Politikk-badge og terskel 85 er læringsprogresjon, ikke valgresultat, konstituering, delegasjon, hjemmel eller rett til å bruke kommunale ressurser.'
    ],
    workplaces:PLACES.map(p=>p.id)
  },
  authority_boundaries:{can:AUTHORITY.may,cannot:AUTHORITY.may_not},
  authority_boundary:AUTHORITY,
  competence_axes:[
    'demokratisk_ledelse','moteledelse','habilitet','forhandling','offentlig_kommunikasjon',
    'institusjonsforstaelse','fag_politikk_skille','delegasjon_og_hjemmel'
  ],
  ideal_type_problems:[
    'fastlåst kommunestyre med flere alternative forslag',
    'habilitetstvil i en politisk viktig sak',
    'administrativt faggrunnlag møter press fra flertall eller parti',
    'lokal krise krever rask kommunikasjon før alle fakta er klare',
    'kommune- og partirollen kolliderer i bruk av kanaler, løfter eller ressurser'
  ],
  career_path:{
    entry_from:[
      'Ordfører bare etter dokumentert election_or_mandate og faktisk konstituering eller tilsvarende gyldig demokratisk mandat; Politikk-badge, XP, nettverk, omdømme og popularitet kan ikke oppfylle denne gaten.'
    ],
    progression_to:[
      'Utvidet kommunalt eller annet offentlig politisk ansvar bare gjennom reelle demokratiske, organisatoriske eller offentlige prosesser; høyere spillstatus utvider ikke delegasjon eller rettslig kompetanse.'
    ],
    possible_promotions:[
      'Andre folkevalgte eller politiske lederroller når valg, konstituering, utnevnelse eller organisasjonsprosess faktisk gir mandatet.',
      'Partiledelse eller regional/nasjonal politisk rolle gjennom separate demokratiske og organisatoriske prosesser; Civication kan bare trene ferdigheter og rolleforståelse.'
    ],
    possible_exits:[
      'Tilbake til annet folkevalgt, organisatorisk eller privat arbeid uten å beholde ordførermyndighet etter at mandatet opphører.',
      'Rådgivning eller administrativt arbeid der ny rolle, habilitet, ansettelse, styringslinje og eventuelle kvalifikasjonskrav vurderes på nytt.'
    ],
    career_risks:[
      'Flertallspress og medielogikk kan belønne at prosedyre, habilitet eller faglige motforestillinger behandles som hindringer i stedet for rettssikkerhets- og legitimitetskrav.',
      'Nærhet mellom parti, kommune og lokalsamfunn kan gjøre det fristende å bruke representasjonsrollen eller kommunale ressurser til private eller partipolitiske formål.'
    ]
  },
  required_knowledge:{
    education_basis:[
      'Ordførerrollen følger election_or_mandate, ikke en automatisk utdanningsstige. Kommunalrett, forvaltningsforståelse, økonomi, møteledelse og lokaldemokrati styrker beslutningskvalitet, men kan aldri erstatte det demokratiske mandatet.'
    ],
    skills:[
      'demokratisk møteledelse',
      'kommunelov og kommunale organer',
      'forvaltningsrettslig rolleforståelse',
      'habilitetsvurdering',
      'delegasjon og vedtaksmyndighet',
      'politisk forhandling og kompromiss',
      'administrasjon-politikk-skille',
      'saksframstilling og beslutningsgrunnlag',
      'kommuneøkonomi og budsjettpremisser',
      'offentlighet og protokollforståelse',
      'innbyggerdialog',
      'krise- og beredskapskommunikasjon',
      'kommune- og partirolle',
      'implementering og etterkontroll'
    ],
    category_knowledge:[
      'Lokaldemokrati, kommunale organer, politisk representasjon, administrasjonens rolle, habilitet, delegasjon, økonomiske rammer, offentlighet, rettssikkerhet og skillet mellom valgt mandat, kollegialt vedtak, faglig råd og partipolitisk aktivitet.'
    ],
    history_go_badges:['politikk'],
    place_connections:PLACES.map(p=>p.id),
    people_connections:ACTORS.map(a=>a.id),
    boundary:'History Go kan gi historisk, institusjonell og stedlig politikkontekst som skjerper spørsmål om lokaldemokrati, men er ikke election_or_mandate, kommunal saksutredning, habilitetsavgjørelse, juridisk vurdering, budsjettvedtak, delegasjon eller kommunestyrevedtak.'
  },
  challenges:[{
    id:'kollegialt_vedtak_vs_personlig_og_partipolitisk_press',
    title:'Kollegialt vedtak, administrativ integritet og personlig press',
    description:'Ordføreren må kunne lede fram en legitim behandling når flertall, parti, media eller berørte grupper ønsker et raskt utfall, uten å gjøre møteledelse, partiposisjon eller private løfter til kommunal myndighet.',
    pressure:'flertall_og_medietrykk_vs_habilitet_saksgrunnlag_og_korrekt_organ',
    affects:['quality','trust','risk']
  }],
  dilemmas:[{
    id:'ordforertittel_blir_behandlet_som_personlig_vedtaksmyndighet',
    title:'Ordførertittel blir behandlet som personlig vedtaksmyndighet',
    setup:'En tidskritisk og politisk populær løsning kan bare gjennomføres etter korrekt saksgrunnlag og kollegial behandling, men presset er stort for at ordføreren skal love utfallet umiddelbart.',
    choice_axis:'demokratisk_sporbarhet_vs_personlig_mandatglidning',
    consequence_axis:'legitimitet_og_korrigerbarhet_vs_ugyldighet_rolleblanding_og_tillitstap',
    mail_hooks:TYPES
  }],
  related_people:ACTORS.map(a=>({...a,fictional:true,fictional_scenario_actor:true,canonical_person_ref:null})),
  related_places:PLACES
});
write(MODEL, model);

const grammar = read(GRAMMAR);
Object.assign(grammar, {
  badge_binding:{badge_id:'politikk',badge_titles:['Ordfører']},
  work_world:'Kommunal politisk ledelse der folkevalgte organer, administrasjon, innbyggere og lokale konflikter må håndteres innen election_or_mandate, lov, habilitet, delegasjon og kollegiale vedtak.',
  task_families:[
    'moteledelse','lokal_forhandling','innbyggerdialog','representasjon','habilitetsvurdering',
    'saksgrunnlag_og_delegasjon','vedtaksoppfolging'
  ],
  work_loops:[
    'sak -> administrativt grunnlag -> habilitet og hjemmel -> politisk behandling -> møte -> vedtak -> offentlig forklaring -> implementering -> etterkontroll',
    'lokal konflikt eller krise -> sikre fakta -> avklare ansvar og mandat -> dialog -> korrekt organ -> legitim avgjørelse eller midlertidig handling -> oppfølging'
  ],
  pressure_axes:[
    'flertallspress_vs_kollegial_prosedyre',
    'partiinteresse_vs_kommuneansvar',
    'politisk_tempo_vs_administrativt_og_rettslig_grunnlag',
    'offentlig_press_vs_habilitet_og_rolleklarhet'
  ],
  practice_stories:[
    {id:'fastlast_mote',setup:'Kommunestyret står fast i en konflikt som truer møteplanen.',decision:'Bruk møteledelse og prosedyre til å sikre reell behandling, ikke til å presse fram ønsket resultat.',learning:'demokratisk ledelse beskytter prosessen også under konflikt'},
    {id:'habilitet',setup:'Du har en nær relasjon til en aktør i en viktig plansak.',decision:'Avklar habilitet før du deltar videre og la riktig organ håndtere saken.',learning:'legitimitet krever grenser for egen deltakelse'},
    {id:'administrasjonspress',setup:'Et flertall vil at administrasjonen skal endre en faglig konklusjon uten nytt grunnlag.',decision:'Skill politisk bestilling fra faglig integritet og bruk formelle kanaler.',learning:'politisk styring er ikke det samme som å skrive fagkonklusjonen'},
    {id:'lokal_krise',setup:'En lokal hendelse krever rask offentlig kommunikasjon før alle fakta er klare.',decision:'Koordiner med beredskap og kommuniser sikkert om det som faktisk er kjent.',learning:'ordførerrollen må ikke fylle kunnskapshull med gjetning'},
    {id:'parti_og_kommune',setup:'Partiet ønsker å bruke kommunale kanaler til valgkamp.',decision:'Hold institusjonell kommunikasjon og partiarbeid adskilt.',learning:'offentlig rolle og partirolle har forskjellige ressurser og mandat'}
  ],
  quality_axes:[
    'demokratisk_ledelse','moteledelse','habilitet','forhandling','offentlig_kommunikasjon',
    'institusjonsforstaelse','administrativ_integritet','sporbarhet'
  ],
  authority_boundary:AUTHORITY,
  actor_grammar:ACTORS.map(({id,name,role,workplace_ids})=>({id,name,role,workplace_ids})),
  place_grammar:PLACES,
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Et vedvarende, versjonert kommunalt beslutningsspor som holder election_or_mandate, faktisk mandat, beslutningseier, administrativt saksgrunnlag, økonomi, risiko, habilitet, delegasjon, dagsorden, forslag, votering, vedtak, offentlig begrunnelse, implementeringsansvar, ventepunkt, innbyggerdialog, parti-/kommunegrense, etterkontroll og rework som separate felt.',
    states:[
      'election_or_mandate_bekreftet','mandat_avgrenset','beslutningseier_registrert','saksgrunnlag_bestilt',
      'saksgrunnlag_mottatt','faglig_uenighet_synlig','okonomipremiss_registrert','habilitet_vurderes',
      'habilitet_avklart','hjemmel_og_delegasjon_vurderes','dagsorden_klar','alternative_forslag_registrert',
      'venter_pa_avklaring','politisk_behandling','votering','vedtak_protokollert','offentlig_begrunnelse',
      'implementering','innbyggeroppfolging','etterkontroll','rework','gjenapnet','lukket_med_rest_usikkerhet'
    ],
    handoff_rule:'Neste aktør overtar synlig election_or_mandate og mandat, beslutningseier, saksgrunnlag, habilitet, hjemmel og delegasjon, politiske alternativer, vedtak, implementeringsansvar, ventepunkt og neste kontroll. Handoff kan aldri skape et mandat, omskrive administrativ faglighet, skjule inhabilitet eller gjøre partiønske til kommunalt vedtak.'
  },
  rhythm_contract:{
    loop:'sak -> saksgrunnlag -> waiting/venting på habilitet, hjemmel, økonomi, utvalg/formannskap, kommunestyre eller nye fakta -> politisk behandling -> møte og vedtak -> handoff -> implementering -> innbyggerdialog -> etterkontroll -> revisjon/rework',
    waiting_states:WAITING,
    rework_rule:'Nye fakta, endret habilitetsvurdering, rettslig avklaring, økonomiske premisser, nytt politisk forslag, kommunestyrevedtak eller implementeringsfunn gjenåpner bare berørte ledd med tidligere saksgrunnlag, forslag, votering, protokoll og begrunnelse bevart.'
  },
  knowledge_dependencies:[{
    id:'history_go_politikk_kommunal_ledelse_lokaldemokratisk_kontekst',
    badge_id:'politikk',
    use:'History Go kan forbedre spørsmål om lokal politisk historie, institusjoner, steder og demokratiske konflikter, men Politikk-badge er ikke election_or_mandate, kan ikke erstatte kommunal utredning, habilitetskontroll eller juridisk vurdering og kan ikke skape et kommunestyrevedtak.'
  }],
  day_one_contract:{
    entry:'career_offer_policy_by_title',
    entry_policy_by_title:{
      'Ordfører':{policy:'appointment_required',qualification_ids:['election_or_mandate']}
    },
    first_object:PERSISTENT,
    first_task:'Bekreft election_or_mandate og faktisk kommunalt mandat. Registrer beslutningseier, administrativt saksgrunnlag, økonomiske og rettslige premisser, habilitet, korrekt organ, alternative politiske forslag, hva som må vente på formell behandling og hva History Go eller Politikk-badge ikke beviser eller gir myndighet til før første møteledelses- eller representasjonshandling.'
  },
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
});
write(GRAMMAR, grammar);

const manifest = read(MANIFEST);
if (!manifest.files.includes(MODEL)) {
  manifest.files.push(MODEL);
  manifest.files.sort();
  write(MANIFEST, manifest);
}

const FAMILY_IDS = {
  job:'kommunal_ledelse_job',
  people:'kommunal_ledelse_profesjonelle_relations',
  conflict:'kommunal_ledelse_habilitet_og_styringspress',
  story:'kommunal_ledelse_demokratisk_ledelse_og_mandat',
  event:'kommunal_ledelse_krise_og_premissendring',
  micro:'kommunal_ledelse_rask_prosedyreavklaring',
  followup:'kommunal_ledelse_vedtak_implementering_og_oppfolging',
  knowledge:'kommunal_ledelse_history_go_politikkontekst',
  consequence:'kommunal_ledelse_tillit_ansvar_og_etterspill'
};

const SPECS = [
  ['job','Avgrens ordførermandatet før første styringssignal','sara_kommunedirektor_politikk_kommunal_ledelse','saksgrunnlag_og_administrativt_skille_kommune','forenoon'],
  ['job','Gjør alternative forslag sammenlignbare før møtet','elin_formannskapssekretaer_politikk_kommunal_ledelse','kommunestyresal_og_moteledelse_kommune','afternoon'],
  ['job','Skill politisk bestilling fra administrativ fagkonklusjon','sara_kommunedirektor_politikk_kommunal_ledelse','saksgrunnlag_og_administrativt_skille_kommune','forenoon'],
  ['job','Koble vedtaket til reell implementering og kontroll','omar_innbyggerdialog_beredskap_politikk_kommunal_ledelse','innbyggerdialog_beredskap_og_oppfolging_kommune','afternoon'],
  ['people','Avklar arbeidsdelingen med kommunedirektøren','sara_kommunedirektor_politikk_kommunal_ledelse','saksgrunnlag_og_administrativt_skille_kommune','forenoon'],
  ['people','La kommuneadvokaten prøve habilitet og delegasjon','jonas_kommuneadvokat_politikk_kommunal_ledelse','habilitet_hjemmel_og_vedtaksrom_kommune','afternoon'],
  ['people','Bruk møtesekretariatet til å beskytte forslag og votering','elin_formannskapssekretaer_politikk_kommunal_ledelse','kommunestyresal_og_moteledelse_kommune','forenoon'],
  ['people','La innbyggerdialogen synliggjøre hvem som faktisk berøres','omar_innbyggerdialog_beredskap_politikk_kommunal_ledelse','innbyggerdialog_beredskap_og_oppfolging_kommune','afternoon'],
  ['conflict','Flertallet vil presse administrasjonen til å omskrive rådet','sara_kommunedirektor_politikk_kommunal_ledelse','saksgrunnlag_og_administrativt_skille_kommune','afternoon'],
  ['story','Ordførertittelen frister til å love et utfall før vedtak','elin_formannskapssekretaer_politikk_kommunal_ledelse','kommunestyresal_og_moteledelse_kommune','afternoon'],
  ['event','En lokal krise endrer premissene samme dag som møtet','omar_innbyggerdialog_beredskap_politikk_kommunal_ledelse','innbyggerdialog_beredskap_og_oppfolging_kommune','forenoon'],
  ['micro','Stopp i tre minutter og avklar hvem som faktisk kan beslutte','jonas_kommuneadvokat_politikk_kommunal_ledelse','habilitet_hjemmel_og_vedtaksrom_kommune','forenoon'],
  ['followup','Følg protokollert vedtak gjennom administrasjon og tjenester','sara_kommunedirektor_politikk_kommunal_ledelse','saksgrunnlag_og_administrativt_skille_kommune','afternoon'],
  ['knowledge','Bruk History Go som politikkontekst, aldri som kommunal hjemmel','jonas_kommuneadvokat_politikk_kommunal_ledelse','habilitet_hjemmel_og_vedtaksrom_kommune','forenoon'],
  ['consequence','Et privat løfte kolliderer med det kommunestyret faktisk vedtok','omar_innbyggerdialog_beredskap_politikk_kommunal_ledelse','innbyggerdialog_beredskap_og_oppfolging_kommune','afternoon']
];

const actorById = new Map(ACTORS.map(a=>[a.id,a]));
const commonSummary = (subject) =>
  `${subject}. Dette steget føres i ${PERSISTENT}. Election_or_mandate, faktisk mandat, beslutningseier, administrativt saksgrunnlag, faglig uenighet, økonomiske og rettslige premisser, habilitet, delegasjon, dagsorden, alternative forslag, votering, protokollert vedtak, offentlig begrunnelse, parti-/kommunegrense, implementeringsansvar, ventepunkt og etterkontroll skal være separate og versjonerte felt. Ordfører kan bare materialiseres etter dokumentert election_or_mandate; Politikk-badge, terskel 85, XP, situated reputation, nettverk, popularitet eller medietrykk kan aldri oppfylle denne gaten. Ordføreren kan lede og representere innen lov, reglement, vedtak og delegasjon, men kan ikke sette kollegiale organer til side, omskrive administrativ faglighet, delta ved inhabilitet eller bruke kommunale ressurser som partikanal. History Go kan gi lokalhistorisk og institusjonell kontekst, men er ikke saksutredning, juridisk vurdering, habilitetsavgjørelse, budsjettvedtak eller demokratisk mandat. En god løsning gjør derfor eksplisitt hva som er fakta, hva som er politisk prioritering, hvilket organ som faktisk kan beslutte, hvem som må tre til side, hva man venter på og hva som skal gjenåpne saken.`;

const positiveReply = (subject) =>
  `Jeg fører ${subject.toLowerCase()} gjennom det kommunale beslutningssporet i stedet for å bruke ordførertittelen som snarvei. Først kontrollerer jeg election_or_mandate, egen habilitet, korrekt organ og delegasjon. Deretter bevarer jeg administrasjonens saksgrunnlag og uenighet, skiller dette fra politiske alternativer og sørger for at forslag, votering og protokoll viser hva som faktisk ble besluttet. Kommunikasjon bygger på vedtak og sikker kunnskap, partiaktivitet holdes adskilt fra kommunens ressurser, og implementeringen får ansvarlig eier, frist og etterkontroll. Nye fakta eller rettslige premisser gjenåpner bare berørte ledd med tidligere dokumentasjon intakt.`;

const positiveFeedback =
  'Grepet bevarer lokaldemokratisk etterprøvbarhet fordi administrasjon, folkevalgte, mindretall, innbyggere, kontrollorganer og senere beslutningstakere kan se hva som var saksgrunnlag, hva som var politisk prioritering, hvilken habilitets- og delegasjonsvurdering som gjaldt, hvilke forslag som faktisk ble votert over og hvilket vedtak som bar implementeringen. Ordføreren bruker dermed et reelt demokratisk mandat uten å gjøre møteledelse, popularitet eller partiposisjon til egen hjemmel, og saken kan korrigeres normalt dersom nye fakta, økonomiske forhold eller juridiske vurderinger endrer premissene.';

const negativeReply = (subject) =>
  `Jeg lukker ${subject.toLowerCase()} ved å bruke ordførertittel, flertallspress og politisk tempo som om det var tilstrekkelig beslutningsgrunnlag. Administrativt råd tones ned når det er upraktisk, mulig inhabilitet behandles som et omdømmeproblem, og det holdes uklart om saken faktisk er vedtatt av riktig organ. Jeg kommuniserer ønsket utfall før protokoll og delegasjon er avklart, lar parti- og kommunerolle flyte sammen og vurderer implementeringen som ferdig når budskapet er levert. Dersom nye fakta kommer senere, forsøker jeg å beskytte den tidligere kommunikasjonen i stedet for å gjenåpne det berørte beslutningsleddet.`;

const negativeFeedback =
  'Løsningen kan gi kortsiktig tempo, men den blander demokratisk mandat, møteledelse, faglig grunnlag og kommunikasjon på en måte som gjør både gyldighet og ansvar uklart. Når administrativ uenighet tones ned, habilitet ikke avklares, beslutningseier blir uklar eller et politisk løfte presenteres som vedtak, kan verken kommunestyret, administrasjonen eller innbyggerne etterprøve hva som faktisk skjedde. Nye fakta blir da en personlig og institusjonell tillitskrise i stedet for et normalt grunnlag for avgrenset rework, og kommunen risikerer både prosessfeil, rolleblanding og dårlig implementering.';

const mailsByType = Object.fromEntries(TYPES.map(t=>[t,[]]));
SPECS.forEach(([type,subject,people_ref,place_id,phase], idx) => {
  const actor = actorById.get(people_ref);
  const m = {
    id:`kommunal_ledelse_${type}_${String(mailsByType[type].length+1).padStart(3,'0')}`,
    mail_type:type,
    mail_family:FAMILY_IDS[type],
    role_scope:ROLE,
    phase,
    priority:120+idx,
    from:actor.name,
    people_ref,
    place_id,
    subject,
    summary:commonSummary(subject),
    situation:[
      'Beslutningssporet viser election_or_mandate, saksgrunnlag, habilitet, korrekt organ, alternative forslag, åpne ventepunkter og hva et eventuelt vedtak skal følges opp mot.',
      'Presset er reelt: flertall, parti, medielogikk, lokal konflikt eller krise kan gjøre det fristende å behandle ønsket utfall som om både prosedyre og hjemmel allerede var avklart.',
      'Du må velge et grep som bevarer skillet mellom administrativ faglighet, folkevalgt prioritering, kollegial myndighet og offentlig representasjon og som tåler handoff og avgrenset rework.'
    ],
    task_domain:'kommunal_politisk_ledelse',
    competency:'demokratisk_ledelse_habilitet_delegasjon_fag_politikk_skille_og_oppfolging',
    pressure:'flertall_parti_administrasjon_lov_innbyggere_media_og_tid',
    choice_axis:'etterprovbar_kollegial_ledelse_vs_personlig_mandatglidning_og_rolleblanding',
    consequence_axis:'demokratisk_tillit_gyldighet_og_korrigerbarhet_vs_prosessfeil_og_ansvarsuklarhet',
    narrative_arc:type,
    choices:[
      {
        id:'A',
        label:`Før ${subject.toLowerCase()} gjennom korrekt demokratisk beslutningsspor`,
        reply:positiveReply(subject),
        effect:1,
        tags:['election_or_mandate','habilitet','kollegialt_vedtak','sporbarhet'],
        feedback:positiveFeedback,
        effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}
      },
      {
        id:'B',
        label:`Lukk ${subject.toLowerCase()} gjennom tittel og politisk tempo`,
        reply:negativeReply(subject),
        effect:-1,
        tags:['mandatglidning','rolleblanding','prosessrisiko'],
        feedback:negativeFeedback,
        effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}
      }
    ]
  };
  mailsByType[type].push(m);
});

for (const type of TYPES) {
  const rel = `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
  write(rel, {
    schema:'civication_mail_family_catalog_v1',
    version:1,
    category:CATEGORY,
    role_scope:ROLE,
    mail_type:type,
    families:[{
      id:FAMILY_IDS[type],
      purpose:`Trene ${type} i kommunal politisk ledelse gjennom ett versjonert demokratisk beslutningsspor uten å blande election_or_mandate, administrativ faglighet, habilitet, kollegialt vedtak og representasjonsrolle.`,
      learning_focus:['demokratisk_ledelse','election_or_mandate','habilitet','fag_politikk_skille','kollegialt_vedtak','oppfolging'],
      mails:mailsByType[type]
    }]
  });
}

const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const phaseForStep = step => step <= 3 ? 'intro' : step <= 10 ? 'advanced' : 'mastery';
write(PLAN, {
  schema:'civication_mail_plan_v1',
  version:1,
  id:'politikk_kommunal_ledelse_foundation_v1',
  category:CATEGORY,
  role_scope:ROLE,
  title:'Kommunal politisk ledelse',
  description:'Seksten steg fra kontroll av election_or_mandate og kommunalt mandat til saksgrunnlag, habilitet, dagsorden, kollegial behandling, offentlig begrunnelse, implementering og etterkontroll.',
  arc:{
    from:'Ny ordfører som må lære at election_or_mandate gir et avgrenset demokratisk mandat, ikke personlig vedtaksmyndighet, rett til å omskrive administrativ faglighet eller adgang til å bruke kommunale ressurser som partikanal.',
    to:'En demokratisk ansvarlig ordfører som kan holde saksgrunnlag, politisk prioritering, habilitet, delegasjon, møteledelse, kollegiale vedtak, representasjon, partirolle og implementering adskilt og sporbare.',
    core_questions:[
      'Hva er administrasjonens dokumenterte saksgrunnlag, og hva er den folkevalgtes politiske prioritering?',
      'Er jeg habil, hvilket organ eier beslutningen, og hvilken delegasjon eller hjemmel finnes faktisk?',
      'Hva ble faktisk vedtatt og protokollert, hvem skal implementere det, og hvilket nytt premiss skal gjenåpne saken?'
    ]
  },
  outcome_rules:{
    promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},
    fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},
    stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','kommunal_ledelse_mandat_habilitet_eller_prosessvikt']}
  },
  sequence:sequenceTypes.map((type,i)=>({
    step:i+1,
    type,
    phase:phaseForStep(i+1),
    step_goal:`Før ${PERSISTENT} gjennom ${type} med synlig election_or_mandate, mandat, saksgrunnlag, habilitet, korrekt organ, alternativer, vedtak, parti-/kommunegrense, handoff og etterkontroll.`,
    allowed_families:[FAMILY_IDS[type]],
    fallback_types:[]
  }))
});

fs.writeFileSync(path.join(root,SOURCE), `# Politikk / Kommunal ledelse — prerequisite source-first\n\n## Scope\n\nDenne pakken materialiserer det spillbare prerequisite-laget for \`${ROLE}\` uten å materialisere Role World-status. Den eksisterende rollemodellen og work grammarens kjernebegrenser beholdes, men utvides med første dag, fire fiktive scenarioaktører, fire kommunale arbeidsflater, persistent work object, rytme/venting/rework, knowledge boundary, 15 rolle-spesifikke mails og 16-stegs plan.\n\n## Autoritetsgrense\n\n- Ordfører er \`appointment_required\` med \`election_or_mandate\`.\n- Politikk-badge og terskel 85 er læringsprogresjon, ikke valgresultat eller konstituering.\n- Møteledelse kan ikke sette kollegiale vedtak til side.\n- Politisk ledelse kan ikke omskrive administrativ faglighet eller oppheve habilitet, delegasjon eller hjemmel.\n- Kommunale kanaler og ressurser er ikke partiets private ressurser.\n- History Go gir kontekst, ikke saksutredning, mandat eller vedtak.\n\n## Playable loop\n\nSak → administrativt grunnlag → habilitet/hjemmel → politisk behandling → møte/votering → protokollert vedtak → offentlig forklaring → implementering → etterkontroll/rework.\n\n## Materialisering\n\n- 4 scenarioaktører\n- 4 arbeidsflater\n- 23 work-object states\n- 7 waiting states\n- 9 mailtyper / 15 mails\n- 16 plansteg\n- no generic fallback\n\nRole World forblir separat og skal først materialiseres etter at prerequisite-pakken er grønn og merget.\n`);

const test = `const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT,rel));
const KEY='politikk/politikk_kommunal_ledelse';
const ROLE='politikk_kommunal_ledelse';
const MODEL='data/Civication/roleModels/politikk/politikk_kommunal_ledelse.json';
const GRAMMAR='data/Civication/workGrammars/politikk/politikk_kommunal_ledelse.json';
const PLAN='data/Civication/mailPlans/politikk/politikk_kommunal_ledelse_plan.json';
const WORLD='data/Civication/roleWorlds/politikk/politikk_kommunal_ledelse.json';
const TYPES=${JSON.stringify(TYPES)};
const ACTORS=${JSON.stringify(ACTORS.map(a=>a.id))};
const PLACES=${JSON.stringify(PLACES.map(p=>p.id))};
const PERSISTENT='${PERSISTENT}';
assert.ok(exists(MODEL)&&exists(GRAMMAR)&&exists(PLAN));
const model=read(MODEL), grammar=read(GRAMMAR), plan=read(PLAN);
assert.equal(model.schema,'civication_role_model_v2'); assert.equal(model.role_scope,ROLE);
assert.deepEqual(model.work_life.workplaces,PLACES); assert.deepEqual(model.related_people.map(p=>p.id),ACTORS);
assert.ok(model.required_knowledge.skills.length>=12); assert.deepEqual(model.required_knowledge.history_go_badges,['politikk']);
for(const p of model.related_people){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null);assert.ok(p.function.length>=220);assert.ok(p.authority_relation.length>=250);}
for(const p of model.related_places) assert.ok(p.function.length>=220);
assert.deepEqual(grammar.actor_grammar.map(a=>a.id),ACTORS); assert.deepEqual(grammar.place_grammar.map(p=>p.id),PLACES);
assert.equal(grammar.persistent_work_object_contract.id,PERSISTENT); assert.ok(grammar.persistent_work_object_contract.states.length>=20);
assert.match(grammar.rhythm_contract.loop,/waiting|venting/i); assert.equal(grammar.rhythm_contract.waiting_states.length,7);
assert.equal(grammar.day_one_contract.entry_policy_by_title['Ordfører'].policy,'appointment_required');
assert.deepEqual(grammar.day_one_contract.entry_policy_by_title['Ordfører'].qualification_ids,['election_or_mandate']);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types,TYPES); assert.equal(grammar.mail_generation_contract.no_generic_fallback,true);
const badge=read('data/badges/politikk.json'); const offer=badge.tiers.find(t=>t.career_offer?.role_scope===ROLE).career_offer;
assert.equal(offer.policy,'appointment_required'); assert.deepEqual(offer.qualification_ids,['election_or_mandate']);
assert.equal(plan.id,'politikk_kommunal_ledelse_foundation_v1'); assert.equal(plan.sequence.length,16);
let total=0; for(const type of TYPES){const cat=read(\`data/Civication/mailFamilies/politikk/\${type}/\${ROLE}_\${type}.json\`); const mails=cat.families.flatMap(f=>f.mails||[]); total+=mails.length; for(const m of mails){assert.equal(m.role_scope,ROLE);assert.ok(ACTORS.includes(m.people_ref));assert.ok(PLACES.includes(m.place_id));assert.ok(m.summary.length>=700);assert.equal(m.choices.length,2);for(const c of m.choices){assert.ok(c.reply.length>=380);assert.ok(c.feedback.length>=430);}}} assert.equal(total,15);
const pack=read('data/Civication/rolePackIndex.json').roles.find(r=>r.category==='politikk'&&r.role_scope===ROLE); assert.ok(pack); assert.equal(pack.status,'complete_reference_v2');
const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(r=>r.key===KEY); assert.ok(career); assert.equal(career.status,'playable'); assert.equal(career.audit.runtime_gate,true); assert.deepEqual(career.audit.missing_components,[]);
const readiness=read('data/Civication/roleWorldRolloutReadiness.json'); const ready=readiness.roles.find(r=>r.key===KEY); assert.ok(ready); assert.equal(ready.classification,'rollout_ready');
for(const dim of ['people_places_integrity','persistent_work_object','rhythm_waiting_handoff_rework','history_go_affordance']) assert.equal(ready.dimensions[dim].status,'foundation_ready');
assert.equal(readiness.rollout_queue.some(r=>r.key===KEY&&r.classification==='rollout_ready'),!exists(WORLD));
const scenarioPeople=read('data/Civication/scenarioPeople/generated/politikk.json'); const factual=new Set(Object.values(scenarioPeople.people_pool||{}).flat().map(p=>p.person_id)); for(const id of ACTORS) assert.ok(!factual.has(id));
const boundary=JSON.stringify({model,grammar}).toLowerCase(); for(const term of ['election_or_mandate','history go','politikk-badge','habilitet','kommunestyre','administrasjon','kollegial','parti']) assert.ok(boundary.includes(term),term);
console.log('PASS: Politikk Kommunal ledelse foundation is playable and rollout-ready while election, collegial authority and administration boundaries remain external.');
`;
fs.writeFileSync(path.join(root,TEST), test);

console.log(JSON.stringify({
  role:ROLE,
  actors:ACTORS.length,
  places:PLACES.length,
  mail_types:TYPES.length,
  total_mails:Object.values(mailsByType).reduce((n,a)=>n+a.length,0),
  persistent:PERSISTENT
}, null, 2));
