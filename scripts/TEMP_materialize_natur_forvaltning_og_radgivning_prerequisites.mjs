import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ROLE = 'natur_forvaltning_og_radgivning';
const CATEGORY = 'natur';
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_FORVALTNING_OG_RADGIVNING_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'bestilling_kunnskapsgrunnlag_naturverdi_regelverk_alternativer_avboting_restusikkerhet_og_radlogg';

const ACTORS = [
  {id:'ingrid_fagansvarlig_natur_forvaltning_og_radgivning',name:'Ingrid',role:'fagansvarlig naturforvalter',workplace_ids:['mandat_og_kunnskapsgrunnlagsbord_natur']},
  {id:'henrik_plan_regelverksradgiver_natur_forvaltning_og_radgivning',name:'Henrik',role:'plan- og regelverksrådgiver',workplace_ids:['regelverk_plan_og_mandatspor_natur']},
  {id:'sara_kart_dataanalytiker_natur_forvaltning_og_radgivning',name:'Sara',role:'kart- og dataanalytiker',workplace_ids:['kart_data_og_naturverdiflate_natur']},
  {id:'mona_prosjekt_kvalitetssikrer_natur_forvaltning_og_radgivning',name:'Mona',role:'prosjekt- og kvalitetssikringsansvarlig',workplace_ids:['alternativ_avboting_og_radverksted_natur']}
];

const PLACES = [
  {id:'mandat_og_kunnskapsgrunnlagsbord_natur',name:'Mandat- og kunnskapsgrunnlagsbord',function:'Her avgrenses bestilling, beslutningsspørsmål, rollemandat, faktiske beslutningseiere, tilgjengelige naturdata, datagap, kildestatus, feltbehov, habilitet, frist og hvilke deler av leveransen som må vente før et faglig råd kan formuleres.'},
  {id:'regelverk_plan_og_mandatspor_natur',name:'Regelverk-, plan- og mandatspor',function:'Her kobles relevant regelverk, planstatus, delegasjon, saksrolle, krav til utredning, faktiske myndighetsgrenser og dokumenterte tolkninger til saken uten at rådgiveren gjør en faglig vurdering om til vedtak eller opptrer som beslutningseier.'},
  {id:'kart_data_og_naturverdiflate_natur',name:'Kart-, data- og naturverdiflate',function:'Her sammenstilles kartlag, registreringer, feltdata, naturverdier, kildekvalitet, metode, geografisk avgrensning, usikkerhet og motstridende funn slik at manglende data forblir synlige i stedet for å bli glattet over av prosjektets ønskede framdrift.'},
  {id:'alternativ_avboting_og_radverksted_natur',name:'Alternativ-, avbøtings- og rådverksted',function:'Her sammenlignes realistiske alternativer, avbøtende tiltak, restkonsekvens, restusikkerhet, interessekonflikter, kvalitetssikringsinnspill og ordlyden i det faglige rådet før saken leveres til den som faktisk eier beslutningen.'}
];

const POLICY = {
  'Naturforvalter':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Rådgiver (miljø/natur)':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  'Seniorrådgiver (miljø/natur)':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};

const AUTHORITY = {
  may:['gi faglige råd','utarbeide utredninger og planer','analysere alternativer og avbøtende tiltak','synliggjøre datagap, restusikkerhet og vesentlige naturfaglige avvik'],
  may_not:['late som faglig råd er politisk eller administrativt vedtak','overskride delegert mandat','endre funn for å tilfredsstille bestiller','overstyre lovverk','bruke History Go eller Natur-badge som delegert myndighet, yrkeskvalifikasjon eller saksbevis']
};

const LOOPS = [
  'bestilling -> kunnskapsgrunnlag -> analyse -> alternativer -> råd -> dokumentasjon',
  'tiltak -> naturverdi -> regelverk -> avbøting -> restusikkerhet -> anbefaling'
];

const FAMILY = {
  job:'forvaltning_radgivning_job',
  people:'forvaltning_radgivning_profesjonelle_relations',
  conflict:'forvaltning_radgivning_faglig_uavhengighet_og_bestillerpress',
  story:'forvaltning_radgivning_radgiveridentitet_og_mandat',
  event:'forvaltning_radgivning_nye_data_og_premissendring',
  micro:'forvaltning_radgivning_rask_premiss_og_kildeavklaring',
  followup:'forvaltning_radgivning_etterkontroll_og_beslutningshandoff',
  knowledge:'forvaltning_radgivning_history_go_naturkontekst',
  consequence:'forvaltning_radgivning_rad_og_etterspill'
};

const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

const longSummary = (subject, detail) => `${subject}. ${detail} Saken skal føres i ${PERSISTENT}, der bestilling, mandat, faktisk beslutningseier, kunnskapsgrunnlag, kildekvalitet, naturverdier, felt- og kartdata, datagap, regelverk, alternativer, avbøtende tiltak, interessekonflikter, restkonsekvens, restusikkerhet, habilitet, ventepunkt, handoff og neste eier holdes som separate felt. Rollen kan gi faglige råd, utarbeide utredninger og planer, analysere alternativer og avbøtende tiltak og synliggjøre vesentlige naturfaglige avvik, men kan ikke late som et faglig råd er et politisk eller administrativt vedtak, overskride delegert mandat, overstyre lovverk eller endre funn for å tilfredsstille bestiller. Alle tre Career-titlene krever relevant_education_or_employer_qualification; status, erfaring i spillet eller popularitet kan ikke erstatte denne gaten. History Go og Natur-badge kan gi arts-, steds-, økologi- og naturhistorisk kontekst som gjør spørsmål og alternativanalyse bedre, men er verken yrkeskvalifikasjon, feltdata, juridisk hjemmel, saksbevis, delegasjon eller forvaltningsmyndighet. En god løsning må derfor bevare skillet mellom faglig evidens, rådgiverens anbefaling og den beslutningen som en annen rolle eller institusjon faktisk eier, og gjøre det mulig å gjenåpne bare berørte premisser når nye data, regelverksavklaringer eller kvalitetssikringsinnspill kommer.`;
const goodReply = `Jeg låser først bestilling, mandat og faktisk beslutningseier, og skiller dokumenterte naturdata fra antakelser, bestillerønsker og rettslige eller administrative vurderinger som andre må eie. Jeg markerer datagap, kildekvalitet og restusikkerhet, beskriver minst ett reelt alternativ og relevant avbøting, og sender bare det uavklarte premisset til riktig faglig, juridisk eller beslutningsmessig eier. Hvis nye data eller en avklaring kommer, gjenåpner jeg den berørte vurderingen med nytt versjonsspor uten å omskrive det tidligere kunnskapsgrunnlaget eller late som fristen gjorde det sikrere.`;
const badReply = `Jeg prioriterer en rask og beslutningsklar leveranse, fyller inn manglende kunnskapsgrunnlag med det som virker mest sannsynlig og lar bestillers foretrukne tiltak styre hvilke alternativer som får plass. Jeg omtaler rådgiverens anbefaling som om den nesten allerede er besluttet, lar uklart regelverk eller manglende kartlegging forsvinne i sammendraget og sender saken videre uten eksplisitt restusikkerhet, faktisk beslutningseier eller spor for hva som må gjenåpnes dersom nye premisser kommer.`;
const goodFeedback = `Grepet gjør beslutningsgrunnlaget mer etterprøvbart fordi neste fagperson, prosjektleder eller beslutningseier kan se hva som er data, hva som er metode og tolkning, hvilke datagap og interessekonflikter som finnes, hvilke alternativer som faktisk ble sammenlignet, hva avbøting kan og ikke kan løse og hvor restusikkerheten ligger. Dermed kan frist, bestillerpress eller institusjonell status ikke fungere som skjult evidens, og den som faktisk har myndighet kan ta en beslutning uten at rådgiveren har forskuttert vedtaket.`;
const badFeedback = `Leveransen kan se ryddigere og mer handlingsklar ut på kort sikt, men den skjuler skillet mellom naturfaglig grunnlag, bestillerønske, regelverk, faglig råd og faktisk beslutning. Senere feltdata, en annen regelverkstolkning eller et realistisk alternativ blir vanskeligere å flette inn uten å åpne hele saken, og rådgiverrollen risikerer å opptre som beslutningseier uten delegasjon. Det svekker sporbarhet, faglig uavhengighet, tillit og muligheten til å forklare hvorfor et råd eller en konsekvensvurdering senere måtte endres.`;

const seeds = {
  job:[
    ['Avgrens bestilling før utredningen','Et tiltak skal vurderes raskt, men bestillingen blander naturfaglige spørsmål, ønsket prosjektutfall og hva beslutningseieren faktisk trenger å vite. Mandat, databehov og leveransegrense må avklares før analysen starter.',ACTORS[0],PLACES[0]],
    ['Kartlegg naturverdier og datagap','Kart og registreringer peker i ulike retninger, og eldre funn dekker ikke hele tiltaksområdet. Rådgiveren må skille dokumenterte naturverdier fra fravær av data og vise hvor ny kartlegging kan endre vurderingen.',ACTORS[2],PLACES[2]],
    ['Sammenlign realistiske alternativer','Prosjektet har ett foretrukket tiltak, men beslutningsgrunnlaget må vise realistiske alternativer og hva som faktisk endres i naturkonsekvens, gjennomførbarhet og restusikkerhet mellom dem.',ACTORS[3],PLACES[3]],
    ['Lever faglig råd til riktig beslutningseier','Utredningen nærmer seg levering og må skille fakta, metode, regelverkspremisser, avbøting, restkonsekvens og rådgiverens anbefaling fra selve vedtaket som eies av en annen rolle.',ACTORS[0],PLACES[3]]
  ],
  people:[
    ['Fagansvarlig utfordrer for sterk sikkerhet','Ingrid ser at et datagap er blitt omtalt som lav risiko og ber om at kunnskapsgrunnlag, manglende kartlegging og hvilke konklusjoner som ikke kan trekkes blir eksplisitte før rådet låses.',ACTORS[0],PLACES[0]],
    ['Regelverksrådgiver avgrenser mandatet','Henrik finner at prosjektteamet blander et faglig råd med en myndighetsvurdering og krever at relevant regelverk, delegasjon og faktisk beslutningseier skilles fra naturfaglig anbefaling.',ACTORS[1],PLACES[1]],
    ['Kartanalytiker oppdager skjev datadekning','Sara viser at kartlaget har høy detalj i deler av området og svak dekning i andre. Hun krever at geografisk skjevhet blir del av usikkerheten i stedet for å forsvinne i ett samlet risikonivå.',ACTORS[2],PLACES[2]],
    ['Kvalitetssikrer krever reelt alternativ','Mona ser at det påståtte alternativet i praksis er samme tiltak med små kosmetiske endringer, og ber om en sammenligning som faktisk kan påvirke råd, avbøting og restkonsekvens.',ACTORS[3],PLACES[3]]
  ],
  conflict:[['Bestiller ønsker mildere naturfaglig råd','Oppdragsgiver mener ordlyden er for streng for prosjektets framdrift og ber om at datagap, sårbar natur og restusikkerhet tones ned selv om kunnskapsgrunnlaget ikke har endret seg.',ACTORS[0],PLACES[3]]],
  story:[['Rådgiveren må tåle at rådet ikke blir valgt','Et etterprøvbart faglig råd peker mot et dyrere eller langsommere alternativ, men beslutningseieren velger noe annet innen sitt mandat. Spilleren må skille faglig integritet fra behovet for å kontrollere det endelige vedtaket.',ACTORS[0],PLACES[3]]],
  event:[['Ny naturregistrering endrer premisset','En ny registrering eller feltobservasjon viser en naturverdi som ikke lå i første kunnskapsgrunnlag. Berørte analyser, alternativer og avbøting må gjenåpnes uten at resten av saken omskrives.',ACTORS[2],PLACES[2]]],
  micro:[['Kildeår og kartversjon må avklares','To kartlag ser like ut, men bygger på ulike år og metodegrunnlag. Før de brukes sammen må kildeår, versjon og relevant avgrensning registreres eksplisitt.',ACTORS[2],PLACES[2]]],
  followup:[['Avbøting må etterkontrolleres','Et anbefalt avbøtende tiltak er tatt inn i videre plan, men ny prosjektutforming gjør at effekten og restkonsekvensen må vurderes på nytt i samme rådgivningsspor.',ACTORS[3],PLACES[3]]],
  knowledge:[['History Go gir bedre spørsmål, ikke beslutningsgrunnlag','History Go peker mot en art, lokal naturhistorie eller økologisk sammenheng som kan være relevant for saken. Kunnskapen skal brukes til å formulere kontrollspørsmål og lete etter dokumenterte kilder eller feltdata, ikke som hjemmel, kvalifikasjon eller saksbevis.',ACTORS[2],PLACES[0]]],
  consequence:[['Rådet leses som om det var et vedtak','Et kort sammendrag blir sitert videre som om rådgiveren hadde bestemt utfallet. Spilleren må korrigere rolle- og mandatgrensen samtidig som det faglige innholdet, datagapene og anbefalingen fortsatt er tydelige.',ACTORS[1],PLACES[1]]]
};

const makeMail = (type, seed, index) => {
  const [subject, detail, actor, place] = seed;
  return {
    id:`forvaltning_radgivning_${type}_${String(index+1).padStart(3,'0')}`,
    mail_type:type,
    mail_family:FAMILY[type],
    role_scope:ROLE,
    phase:index % 2 ? 'afternoon' : 'forenoon',
    priority:120 + index,
    from:actor.name,
    people_ref:actor.id,
    place_id:place.id,
    subject,
    summary:longSummary(subject,detail),
    situation:[
      `Rådloggen viser siste bestilling og mandat, faktisk beslutningseier, kunnskapsgrunnlag, datagap, naturverdier, regelverkspremisser, alternativer, avbøting, restusikkerhet, åpne avvik og hvem som eier neste avklaring.`,
      `En raskere løsning kan gjøre leveransen mer beslutningsklar, men kan samtidig skjule at naturdata mangler, at et alternativ ikke er reelt, at en regelverkstolkning må avklares eller at rådgiveren ikke selv eier vedtaket.`,
      `Du må velge et grep som gjør handoff og mulig rework lesbart uten å omskrive hvilke data, premisser, interessekonflikter, råd eller myndighetsgrenser som faktisk gjaldt.`
    ],
    task_domain:'naturforvaltning_og_miljoradgivning',
    competency:'sporbar_utredning_alternativanalyse_og_mandatklar_radgivning',
    pressure:'naturverdi_tiltak_frist_bestiller_og_beslutningsbehov',
    choice_axis:'etterprovbart_beslutningsgrunnlag_vs_improvisert_beslutningsklarhet',
    consequence_axis:'faglig_tillit_og_rolleavklaring_vs_skjult_usikkerhet_og_mandatglidning',
    narrative_arc:type,
    choices:[
      {id:'A',label:`Avklar ${subject.toLowerCase()} i rådgivningssporet`,reply:goodReply,effect:1,tags:['sporbarhet','faglig_uavhengighet','restusikkerhet'],feedback:goodFeedback,effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}},
      {id:'B',label:`Lukk ${subject.toLowerCase()} gjennom tempo og antatt mandat`,reply:badReply,effect:-1,tags:['tempo','bestillerpress','mandatglidning'],feedback:badFeedback,effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}}
    ]
  };
};

const oldModel = read(MODEL);
const model = {
  ...oldModel,
  core_narrative:[
    'Omsette naturfaglig kunnskap, kartlegging, regelverk og realistiske alternativer til etterprøvbare råd uten å gjøre rådgiverrollen til beslutningsmyndighet.',
    'Rollen gjør naturforvaltning og miljørådgivning spillbar gjennom ett vedvarende beslutningsgrunnlag der bestilling, mandat, naturdata, datagap, naturverdier, regelverk, alternativer, avbøting, restkonsekvens, restusikkerhet og faglig anbefaling kan endres med nye premisser uten at bestillerpress eller status blir evidens.'
  ],
  work_life:{
    daily_work:[
      'Avgrenser bestilling, mandat, faktisk beslutningseier og hvilke naturfaglige spørsmål kunnskapsgrunnlaget må kunne svare på.',
      'Sammenstiller kartlegging, feltdata, naturverdier, kilder og datagap med eksplisitt kildekvalitet, geografisk avgrensning og usikkerhet.',
      'Prøver realistiske alternativer, avbøtende tiltak og restkonsekvens mot relevant regelverk og dokumenterte premisser.',
      'Formulerer faglige råd, håndterer bestillerpress, kvalitetssikring og handoff uten å late som anbefalingen er selve vedtaket.'
    ],
    responsibilities:['sporbare faglige råd','faglig uavhengighet','naturverdier og datagap','alternativanalyse','regelverksforståelse','avbøting og restusikkerhet','mandat- og beslutningsgrense'],
    work_environment:['Offentlig forvaltning, konsulentmiljø, felt- og kartleggingsprosjekter og tverrfaglige planprosesser der naturfaglige råd skal kunne etterprøves av både fagpersoner og den som faktisk eier beslutningen.'],
    status_position:['Naturforvalter, Rådgiver (miljø/natur) og Seniorrådgiver (miljø/natur) krever alle relevant_education_or_employer_qualification. History Go eller Natur-badge er læringsstøtte og kan aldri oppfylle kvalifikasjonsporten, gi delegert forvaltningsmyndighet eller gjøre et faglig råd til et vedtak.'],
    workplaces:PLACES.map(p=>p.id)
  },
  career_path:{
    entry_from:['Naturforvalter, Rådgiver og Seniorrådgiver etter dokumentert relevant_education_or_employer_qualification og faktisk arbeidsgiverrolle; spillstatus eller Badge kan ikke oppfylle denne porten.'],
    progression_to:['Mer selvstendig utrednings-, prosjekt- og kvalitetssikringsansvar gjennom dokumentert kompetanse, arbeidsgiverprosess og tydelig mandat.'],
    possible_promotions:['Seniorrådgiver når relevant kompetanse, erfaring og arbeidsgiverprosess støtter det.','Fag- eller prosjektansvar når arbeidsgiver uttrykkelig tildeler rollen ansvar; dette gir ikke automatisk vedtaks- eller politisk myndighet.'],
    possible_exits:['Biologisk eller økologisk fagarbeid, felt/kartlegging eller forskning når nødvendige kvalifikasjoner og ansettelsesvilkår er oppfylt.','Miljøledelse, planlegging eller annen forvaltning når ny rolle, mandat og eventuell appointment-gate er faktisk oppfylt.'],
    career_risks:['Bestiller-, frist- og prosjektpress kan belønne milde konklusjoner, skjulte datagap og urealistiske alternativer.','Rådgiverstatus og nærhet til beslutningstakere kan skape mandatglidning der et faglig råd sosialt begynner å opptre som et vedtak.']
  },
  required_knowledge:{
    education_basis:['Relevant naturfaglig, forvaltningsfaglig, planfaglig eller arbeidsgiververifisert kvalifikasjon etter stillingens faktiske krav; History Go er læringsstøtte, ikke yrkeskvalifikasjon, delegasjon eller saksbevis.'],
    skills:['naturforvaltning','utredningsmetode','regelverksforståelse','kart og geografiske data','kildekritikk','naturverdier og konsekvensvurdering','alternativanalyse','avbøtende tiltak','restusikkerhet','interessekonflikter','faglig rådgivning og mandatforståelse'],
    category_knowledge:['Naturfaglig kontekst, arts- og økologikunnskap, kartleggingskvalitet, naturverdier, datagap, relevant regelverk, realistiske alternativer, avbøting, restkonsekvens, restusikkerhet og skillet mellom kunnskapsgrunnlag, faglig råd og faktisk beslutning.'],
    history_go_badges:['natur'],
    place_connections:PLACES.map(p=>p.id),
    people_connections:ACTORS.map(a=>a.id),
    boundary:'History Go kan gi arter, steder, økologi, naturhistorie og begreper som forbedrer kontrollspørsmål og kildeleting, men kan ikke fungere som feltdata, juridisk hjemmel, delegasjon, relevant_education_or_employer_qualification, saksbevis eller beslutningsmyndighet.'
  },
  authority_boundary:AUTHORITY,
  challenges:[{id:'naturverdi_vs_bestiller_og_mandat',title:'Naturverdi, bestillerpress og mandat',description:'Rådgiveren må la kunnskapsgrunnlag, datagap, realistiske alternativer, regelverk og restusikkerhet begrense rådet selv når bestiller, frist eller prosjektstatus peker mot et ønsket utfall.',pressure:'naturverdi_vs_tiltak_faglig_uavhengighet_vs_bestilling_og_hastighet_vs_utredningskvalitet',affects:['quality','trust','risk']}],
  dilemmas:[{id:'rad_blir_behandlet_som_vedtak',title:'Faglig råd blir behandlet som beslutning',setup:'Prosjektet ønsker beslutningsklarhet og begynner å omtale rådgiverens anbefaling som om utfallet allerede var bestemt, samtidig som datagap eller reelle alternativer fortsatt finnes.',choice_axis:'mandatklar_faglig_anbefaling_vs_sosialt_forskuttert_vedtak',consequence_axis:'etterprovbar_tillit_vs_mandatglidning_og_skjult_usikkerhet',mail_hooks:TYPES}],
  related_people:ACTORS.map((a,index)=>({
    ...a,
    fictional:true,
    fictional_scenario_actor:true,
    canonical_person_ref:null,
    function:[
      'Ingrid bærer faglig problemavgrensning, naturverdi, datagap og rådgiverens uavhengighet. Hun krever at bestilling og beslutningsbehov oversettes til etterprøvbare fagspørsmål, at manglende data forblir synlige og at et faglig råd kan tåle at beslutningseieren senere velger noe annet innen sitt mandat.',
      'Henrik bærer regelverk, planstatus, saksrolle, delegasjon og skillet mellom rådgivning og myndighetsutøvelse. Han gjør det eksplisitt hvilke premisser rådgiveren kan beskrive og hvilke juridiske eller administrative avklaringer som må eies av riktig beslutnings- eller myndighetsrolle før saken kan gå videre.',
      'Sara bærer kartlag, geografisk avgrensning, registreringer, feltdata, kildeår, metode, naturverdier og datadekning. Hun sørger for at et tomt kartfelt ikke blir tolket som fravær av naturverdi, at skjev datadekning blir del av usikkerheten og at nye data kan gjenåpne bare berørte analyser.',
      'Mona bærer alternativanalyse, avbøting, restkonsekvens, restusikkerhet og kvalitetssikring av det ferdige rådet. Hun krever at alternativer er reelt forskjellige, at avbøting ikke beskrives som full løsning uten grunnlag og at handoff til beslutningseier viser både anbefaling, premisser og åpne spørsmål.'
    ][index],
    authority_relation:[
      'Ingrid kan kreve tydeligere kunnskapsgrunnlag, naturfaglig begrunnelse, datagap og rework og kan anbefale et faglig råd innen mandat, men kan ikke bestille et bestemt funn, gjøre senioritet til evidens, oppheve relevant_education_or_employer_qualification eller fatte det politiske eller administrative vedtaket som en annen rolle eier.',
      'Henrik kan avklare regelverks- og mandatspørsmål innen sin faktiske kompetanse, kreve at uklar delegasjon eskaleres og stoppe språk som feilaktig fremstiller råd som vedtak, men kan ikke overstyre lovverk, tildele seg selv offentlig myndighet, endre naturfaglige funn eller bruke et spill-badge som juridisk hjemmel.',
      'Sara kan kreve sporbare kart- og datakilder, markere geografiske datagap og gjenåpne berørte analyser når kildeår eller feltdata endres, men kan ikke gjøre manglende registrering til bevis for fravær, velge prosjektutfall, fatte forvaltningsvedtak eller bruke datateknisk ekspertise som erstatning for mandat.',
      'Mona kan kreve realistiske alternativer, dokumentert avbøting, eksplisitt restusikkerhet og en lesbar handoff til riktig beslutningseier, men kan ikke forskuttere vedtaket, tone ned faglige avvik for å tilfredsstille bestiller, gi yrkeskvalifikasjon eller gjøre kvalitetssikringsstatus til politisk eller administrativ myndighet.'
    ][index]
  })),
  related_places:PLACES
};
write(MODEL, model);

const oldGrammar = read(GRAMMAR);
const grammar = {
  ...oldGrammar,
  work_loops:LOOPS,
  authority_boundary:AUTHORITY,
  actor_grammar:ACTORS,
  place_grammar:PLACES,
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Et vedvarende, versjonert beslutningsgrunnlag som beholder bestilling, mandat, beslutningseier, kunnskapsgrunnlag, kildekvalitet, naturdata, naturverdier, datagap, regelverk, alternativer, avbøting, restkonsekvens, restusikkerhet, interessekonflikter, habilitet, faglig råd, ventepunkt, handoff og avgrenset rework gjennom samme rådgivningssak.',
    states:['bestilling_mottatt','mandat_avklart','beslutningseier_registrert','kunnskapsgrunnlag_innhentes','datagap_identifisert','naturverdier_vurderes','regelverk_avklares','alternativer_utformes','avboting_vurderes','restkonsekvens_vurderes','restusikkerhet_registrert','interessekonflikt_apen','venter_pa_avklaring','faglig_rad_utkast','kvalitetssikring','rework','rad_avgrenset','handoff_til_beslutningseier','gjenapnet'],
    handoff_rule:'Neste aktør overtar synlig bestilling og mandat, faktisk beslutningseier, kilde- og dataversjon, naturverdier, datagap, regelverkspremisser, alternativer, avbøting, restkonsekvens, restusikkerhet, åpne interessekonflikter, ventepunkt og neste eier; en handoff kan aldri gjøre rådgiverens anbefaling til et vedtak eller skjule at et premiss fortsatt er uavklart.'
  },
  rhythm_contract:{
    loop:'bestilling -> mandat -> kunnskapsgrunnlag -> analyse -> waiting/venting på kartlegging, regelverk, tiltakshaveropplysninger, tverrfaglig innspill eller kvalitetssikring -> alternativer -> avbøting -> restusikkerhet -> handoff -> faglig råd -> beslutningseier -> revisjon/rework -> læring',
    waiting_states:['feltdata_eller_kartlegging','regelverksavklaring','tiltakshaveropplysninger','tverrfaglig_innspill','kvalitetssikring','beslutningseier','nye_data_eller_premiss'],
    rework_rule:'Nye felt- eller kartdata, endret geografisk avgrensning, regelverksavklaring, nytt realistisk alternativ, endret avbøting, kvalitetssikringsinnspill eller tydeliggjort mandat gjenåpner bare berørt kunnskapsgrunnlag, analyse, alternativ eller råd med ny versjon og bevart endringsspor.'
  },
  knowledge_dependencies:[{id:'history_go_natur_forvaltning_sted_og_okologikontekst',badge_id:'natur',use:'History Go kan forbedre rådgivningsspørsmål gjennom arter, steder, økologi og naturhistorisk kontekst. Natur-badge er ikke relevant_education_or_employer_qualification, kan ikke erstatte feltdata eller kvalitetssikret kartlegging, kan ikke gi juridisk hjemmel eller delegasjon og kan ikke gjøre et faglig råd til et vedtak.'}],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:POLICY,first_object:PERSISTENT,first_task:'Registrer bestilling, mandat, faktisk beslutningseier, kunnskapsgrunnlag, kildekvalitet, naturverdier, datagap, relevant regelverk, minst ett mulig alternativ, restusikkerhet og neste kontrollpunkt før du formulerer et sterkt råd; marker eksplisitt hva History Go ikke beviser eller gir myndighet til.'},
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
};
write(GRAMMAR, grammar);

const manifestPath = 'data/Civication/roleModels/manifest.json';
const manifest = read(manifestPath);
if (!manifest.files.includes(MODEL)) manifest.files.push(MODEL);
manifest.files = [...new Set(manifest.files)];
write(manifestPath, manifest);

const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const plan = {
  schema:'civication_mail_plan_v1',version:1,id:'natur_forvaltning_og_radgivning_foundation_v1',category:CATEGORY,role_scope:ROLE,title:'Naturforvaltning og miljørådgivning',
  description:'Seksten steg fra første bestillings- og mandatavklaring til etterprøvbart kunnskapsgrunnlag, realistiske alternativer, avbøting, restusikkerhet, faglig råd og korrekt handoff til faktisk beslutningseier.',
  arc:{from:'Ny naturforvalter eller miljørådgiver som må lære at bestillerbehov og nærhet til beslutningstakere aldri er evidens eller delegasjon.',to:'En faglig trygg rådgiver som kan holde naturdata, datagap, regelverk, alternativer, avbøting, restusikkerhet, anbefaling og beslutningsmyndighet adskilt gjennom hele saken.',core_questions:['Hva er faktisk dokumentert, og hvilke datagap begrenser rådet?','Hvilke realistiske alternativer eller avbøtende tiltak kan endre naturkonsekvensen?','Hvem eier faglig råd, regelverksavklaring og selve beslutningen — og hva må vente før handoff?']},
  outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','forvaltning_radgivning_mandat_eller_integritetssvikt']}},
  sequence:sequenceTypes.map((type,i)=>({step:i+1,type,phase:i<3?'intro':i<10?'advanced':'mastery',step_goal:`Før ${PERSISTENT} gjennom ${type} med synlig kunnskapsgrunnlag, datagap, regelverk, alternativer, restusikkerhet, ventepunkt, handoff og faktisk beslutningseier.`,allowed_families:[FAMILY[type]],fallback_types:[]}))
};
write(PLAN, plan);

for (const type of TYPES) {
  const mails = seeds[type].map((seed,i)=>makeMail(type,seed,i));
  write(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`,{
    schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,
    families:[{id:FAMILY[type],purpose:`Trene ${type} gjennom ett versjonert beslutningsgrunnlag uten å blande naturdata, bestillerønske, regelverk, faglig råd og faktisk myndighet.`,learning_focus:['faglig_integritet','sporbarhet','alternativanalyse','restusikkerhet','mandat'],mails}]
  });
}

fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,SOURCE),`# Natur / Forvaltning og rådgivning — prerequisites source-first\n\n## Scope\n\nCanonical role: \`natur/natur_forvaltning_og_radgivning\`. This package materializes the playable Career/work foundation and is **not Role World completion**. The remaining realism dimension stays reserved for the dedicated one-role rollout PR.\n\n## Career gates\n\n- **Naturforvalter** — \`qualification_required\` via \`relevant_education_or_employer_qualification\`.\n- **Rådgiver (miljø/natur)** — \`qualification_required\` via \`relevant_education_or_employer_qualification\`.\n- **Seniorrådgiver (miljø/natur)** — \`qualification_required\` via \`relevant_education_or_employer_qualification\`.\n\nHistory Go and the Natur badge are learning support, not professional qualification, field evidence, legal authority, delegation or a management decision.\n\n## Playable foundation\n\nThe package preserves the existing two advisory work loops and authority boundary, then adds four bounded work actors, four work surfaces, a persistent editorial object (\`${PERSISTENT}\`), seven explicit waiting states, handoff/rework, a 16-step plan and **15 source mails** across all nine canonical mail types. Bestilling, mandat, decision owner, nature evidence, data gaps, regulation, realistic alternatives, mitigation, residual consequence, residual uncertainty and the professional recommendation remain separately traceable.\n\n## Authority\n\nThe role may give professional advice, prepare assessments and plans, compare alternatives and mitigation, and surface major nature-related gaps. It may not present advice as a political or administrative decision, exceed delegated authority, override law, change findings for a commissioner, or use History Go/Natur-badge as qualification or public authority.\n\n## Cross-role\n\nReadiness says \`not_required_for_rollout\`; this prerequisite package does not invent a cross-role link. Genuine shared work can use the existing Scene Pipeline when later evidence proves a governed shared object.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene engine. Existing Career gates, Scene Pipeline, mail machinery and audits remain canonical.\n`);

console.log(JSON.stringify({role:ROLE,actors:ACTORS.length,places:PLACES.length,mail_types:TYPES.length,total_mails:Object.values(seeds).flat().length,persistent:PERSISTENT},null,2));