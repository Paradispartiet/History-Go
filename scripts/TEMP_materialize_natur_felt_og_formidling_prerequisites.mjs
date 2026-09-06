import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ROLE = 'natur_felt_og_formidling';
const CATEGORY = 'natur';
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_FELT_OG_FORMIDLING_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'feltplan_observasjon_prove_metadata_hms_formidling_og_handofflogg';

const ACTORS = [
  {id:'solveig_feltleder_natur_felt_og_formidling',name:'Solveig',role:'feltleder og metodeansvarlig',workplace_ids:['feltbrief_og_utstyrsbase_natur']},
  {id:'amir_artsfaglig_kvalitetssikrer_natur_felt_og_formidling',name:'Amir',role:'artsfaglig kvalitetssikrer',workplace_ids:['observasjonsflate_og_provetakingspunkt_natur']},
  {id:'nora_naturveileder_besoksansvarlig_natur_felt_og_formidling',name:'Nora',role:'naturveileder og besøksansvarlig',workplace_ids:['besokssenter_og_formidlingspunkt_natur']},
  {id:'jonas_hms_logistikk_natur_felt_og_formidling',name:'Jonas',role:'HMS- og logistikkansvarlig',workplace_ids:['kvalitetssjekk_og_handoffbord_natur']}
];

const PLACES = [
  {id:'feltbrief_og_utstyrsbase_natur',name:'Feltbrief og utstyrsbase',function:'Her låses dagens feltmål, vær- og risikobilde, rute, utstyr, tillatelser, prøvetakingsramme, stoppkriterier og hvem som eier neste beslutning før laget går ut.'},
  {id:'observasjonsflate_og_provetakingspunkt_natur',name:'Observasjonsflate og prøvetakingspunkt',function:'Her føres sted, tid, observatør, habitat, metode, artsusikkerhet, foto eller prøve-ID, feltavvik og hva som faktisk ble observert uten at en foreløpig tolkning blir gjort om til sikkert funn.'},
  {id:'besokssenter_og_formidlingspunkt_natur',name:'Besøkssenter og formidlingspunkt',function:'Her tilpasses kvalitetssikret naturkunnskap til målgruppe, språk og tilgjengelighet samtidig som sårbare lokaliteter, usikre artsfunn og faglige forbehold beskyttes mot overforenkling eller publikumspress.'},
  {id:'kvalitetssjekk_og_handoffbord_natur',name:'Kvalitetssjekk og handoffbord',function:'Her sammenholdes feltlogg, prøve- og fotometadata, HMS-avvik, artsavklaring, formidlingsgrunnlag, åpne spørsmål, ventepunkter og neste eier før data, prøve eller budskap sendes videre.'}
];

const POLICY = {
  'Feltassistent':{policy:'direct'},
  'Naturveileder':{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};

const AUTHORITY = {
  may:['registrere dokumenterte observasjoner','samle prøver innen avtalt metode og sikkerhetsramme','formidle kvalitetssikret naturkunnskap','eskalere usikre funn og sikkerhetsavvik'],
  may_not:['fatte forvaltningsvedtak','utstede forskningskonklusjoner uten faglig grunnlag','utøve politisk myndighet','skjule usikkerhet i observasjonsdata','behandle History Go eller Natur-badge som feltbevis eller yrkeskvalifikasjon']
};

const LOOPS = [
  'brief -> feltplan -> observasjon -> dokumentasjon -> kvalitetssjekk -> rapportering',
  'målgruppe -> faggrunnlag -> formidling -> spørsmål -> korrigering -> læring'
];

const FAMILY = {
  job:'felt_formidling_job',
  people:'felt_formidling_profesjonelle_relations',
  conflict:'felt_formidling_presisjon_sikkerhet_og_publikumspress',
  story:'felt_formidling_faglig_integritet_og_tillit',
  event:'felt_formidling_vaer_avvik_og_saarbar_natur',
  micro:'felt_formidling_rask_metadata_og_budskapskorrigering',
  followup:'felt_formidling_artsavklaring_og_etterkontroll',
  knowledge:'felt_formidling_history_go_naturkontekst',
  consequence:'felt_formidling_sporbarhet_vern_og_etterspill'
};

const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

const longSummary = (subject, detail) => `${subject}. ${detail} Saken skal føres i ${PERSISTENT}, der feltmål, rute, metode, lokalitet, tidspunkt, observatør, habitat, vær, HMS, foto- eller prøve-ID, artsusikkerhet, datakvalitet, formidlingsgrunnlag, målgruppe, sårbarhetsgrense, avvik, ventepunkt, handoff og neste eier holdes som separate felt. Rollen kan registrere dokumenterte observasjoner, samle prøver innen avtalt metode og sikkerhetsramme, formidle kvalitetssikret naturkunnskap og eskalere usikre funn eller sikkerhetsavvik, men kan ikke fatte forvaltningsvedtak, skjule usikkerhet, utøve politisk myndighet eller gjøre et foreløpig artsfunn til forskningskonklusjon uten faglig grunnlag. History Go og Natur-badge kan gi arts-, steds- og begrepskontekst, men er verken feltdata, prøvebevis, arbeidsgiverkvalifikasjon eller tillatelse til å gå nærmere sårbar natur. En god løsning må derfor bevare sporbarhet og gjøre det mulig å gjenåpne berørt observasjon, prøve, rute eller formidlingsbudskap uten å omskrive hva som faktisk skjedde.`;
const goodReply = `Jeg beholder siste dokumenterte feltversjon, markerer hva som faktisk er observert og hva som fortsatt er usikkert, og lar HMS, sårbar natur og avtalt metode begrense tempoet. Jeg registrerer foto- eller prøve-ID og nødvendige metadata, sender arts- eller metodeavklaring til riktig faglig eier og lar formidlingen bruke et forståelig språk uten å fjerne det avgjørende forbeholdet. Dersom ny informasjon kommer, gjenåpner jeg bare den berørte delen og beholder tidligere spor.`;
const badReply = `Jeg prioriterer flyt og en enkel forklaring, fyller inn manglende metadata etter beste skjønn og lar det mest sannsynlige artsnavnet stå uten eksplisitt usikkerhet. Hvis været, publikum eller ruten presser planen, fortsetter jeg så lenge det virker praktisk, og lar neste aktør overta uten full oversikt over prøve-ID, avvik, sårbarhetsgrense eller hvem som faktisk eier den faglige avklaringen.`;
const goodFeedback = `Grepet gjør feltarbeidet og formidlingen litt langsommere, men holder observasjon, prøve, sikkerhet, artsavklaring og budskap etterprøvbart. Neste aktør kan se hva som er dokumentert, hva som venter, hvilke grenser som gjelder og hvorfor et budskap eventuelt ble korrigert. Dermed kan ny artskunnskap, endret vær, HMS-avvik eller sårbarhetsinformasjon faktisk endre rute eller formidling uten at tidligere feltspor slettes.`;
const badFeedback = `Dagen kan se mer effektiv og publikumsvennlig ut på kort sikt, men feltsporet mister skillet mellom observasjon, antakelse og bekreftet kunnskap. Et senere artsavvik, sikkerhetsspørsmål eller behov for å beskytte en lokalitet blir vanskeligere å rekonstruere, og tempo eller forventning får funksjon som skjult faglig bevis. Resultatet kan derfor bli mindre trygt, mindre sporbart og mer misvisende.`;

const seeds = {
  job:[
    ['Feltbrief før første rute','Dagens oppdrag kombinerer observasjon og besøksveiledning, men vær, sårbarhetsnivå, utstyr og stoppkriterier må være eksplisitt dokumentert før laget går ut.',ACTORS[0],PLACES[0]],
    ['Observasjon med komplett metadata','Et interessant artsfunn dukker opp i felt og må få lokalitet, tidspunkt, habitat, observatør, foto eller prøve-ID og eksplisitt artsusikkerhet før noe rapporteres som sikkert.',ACTORS[1],PLACES[1]],
    ['Formidling uten å røpe sårbar lokalitet','Publikum vil vite nøyaktig hvor et sårbart funn er gjort, og budskapet må være lærerikt uten å gjøre lokaliteten mer utsatt eller fremstille usikker kunnskap som sikker.',ACTORS[2],PLACES[2]],
    ['Handoff etter feltøkt','Feltlaget kommer tilbake med observasjoner, prøver, et væravvik og ett åpent artsspørsmål som må skilles og få riktig neste eier før dagen lukkes.',ACTORS[3],PLACES[3]]
  ],
  people:[
    ['Feltleder endrer planen ved værskifte','Solveig ser at vind og nedbør gjør planlagt trase eller prøvetaking mindre trygg og krever at rute og stoppkriterier oppdateres før arbeidet fortsetter.',ACTORS[0],PLACES[0]],
    ['Artsfaglig kvalitetssikrer holder funnet åpent','Amir mener bildet peker mot en bestemt art, men kjennetegnene er ikke tilstrekkelige og krever at funnet beholdes som usikkert til ny dokumentasjon finnes.',ACTORS[1],PLACES[1]],
    ['Naturveileder korrigerer en for enkel forklaring','Nora oppdager at en publikumsvennlig formulering har fjernet en avgjørende faglig nyanse og ber om at budskapet rettes uten å bli utilgjengelig.',ACTORS[2],PLACES[2]],
    ['HMS-ansvarlig krever tydelig neste eier','Jonas finner en prøve og et avvik uten komplett handoff og krever at ansvar, lagring, oppfølging og sikkerhetsstatus blir synlig før materialet forlater bordet.',ACTORS[3],PLACES[3]]
  ],
  conflict:[['Publikumspress ved sårbar natur','En gruppe ønsker å gå tettere på en sårbar lokalitet for bedre bilder, mens fag- og sikkerhetsgrunnlaget tilsier større avstand og en annen rute.',ACTORS[2],PLACES[2]]],
  story:[['Det spennende artsfunnet blir nedjustert','Et funn som skapte entusiasme viser seg etter kvalitetssjekk å være mindre sikkert enn først antatt, og spilleren må korrigere logg og formidling uten å skjule den tidligere vurderingen.',ACTORS[1],PLACES[1]]],
  event:[['Værskifte avbryter prøvetakingen','Et raskt værskifte gjør den planlagte prøvetakingen utrygg, og laget må stoppe, sikre materiale, dokumentere avbruddet og planlegge ny kontrollert økt.',ACTORS[0],PLACES[0]]],
  micro:[['Manglende tidspunkt på feltfoto','Et ellers godt artsfoto mangler et sikkert tidspunkt og må kobles til det som faktisk kan dokumenteres uten at noen fyller inn et antatt klokkeslett som fakta.',ACTORS[3],PLACES[3]]],
  followup:[['Artsavklaring krever ny observasjon','Kvalitetssjekken kan ikke avgjøre funnet fra første dokumentasjon, og en ny feltobservasjon må planlegges som oppfølging i samme logg.',ACTORS[1],PLACES[1]]],
  knowledge:[['History Go gir spørsmål, ikke feltbevis','Natur-kunnskap fra History Go peker mot en mulig art, naturtype eller historisk lokalitet, men må brukes til å stille bedre spørsmål og velge relevante kjennetegn uten å bli behandlet som faktisk observasjon eller yrkeskvalifikasjon.',ACTORS[2],PLACES[2]]],
  consequence:[['Dagens feltspor skal tåle etterkontroll','Før rapportering må observasjoner, prøver, HMS, artsusikkerhet og formidlingsvalg kunne leses av en ny aktør uten muntlig tilleggsinformasjon eller skjult rekonstruksjon.',ACTORS[3],PLACES[3]]]
};

const makeMail = (type, seed, index) => {
  const [subject, detail, actor, place] = seed;
  return {
    id:`felt_formidling_${type}_${String(index+1).padStart(3,'0')}`,
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
      `Felt- og formidlingsloggen viser siste plan, observasjoner, prøve- og fotometadata, HMS-status, artsusikkerhet, sårbarhetsgrense, åpne avvik og hvem som eier neste kontrollpunkt.`,
      `En raskere løsning kan holde rute eller publikumsflyt oppe, men kan samtidig skjule mangelfulle metadata, sikkerhetsrisiko, artsusikkerhet eller et budskap som er sikrere enn kunnskapsgrunnlaget.`,
      `Du må velge et grep som gjør handoff og mulig rework lesbart uten å omskrive hvilke observasjoner, prøver, grenser eller formidlingsvalg som faktisk gjaldt.`
    ],
    task_domain:'feltarbeid_og_naturformidling',
    competency:'sporbar_sikker_og_faglig_avgrenset_feltpraksis',
    pressure:'tempo_publikum_vaer_saarbarhet_og_presisjon',
    choice_axis:'sporbar_avgrensning_vs_improvisert_sikkerhet',
    consequence_axis:'trygg_faglig_tillit_vs_skjult_usikkerhet',
    narrative_arc:type,
    choices:[
      {id:'A',label:`Avklar ${subject.toLowerCase()} i feltloggen`,reply:goodReply,effect:1,tags:['sporbarhet','HMS','usikkerhet'],feedback:goodFeedback,effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}},
      {id:'B',label:`Lukk ${subject.toLowerCase()} gjennom tempo og antakelse`,reply:badReply,effect:-1,tags:['tempo','skjult_usikkerhet','svak_sporbarhet'],feedback:badFeedback,effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}}
    ]
  };
};

const oldModel = read(MODEL);
const model = {
  ...oldModel,
  core_narrative:[
    'Samle, kvalitetssikre og formidle naturkunnskap i felt uten å gjøre observasjon eller formidling til myndighetsvedtak.',
    'Rollen gjør feltarbeid og naturformidling spillbart gjennom ett vedvarende spor der plan, observasjon, prøve, metadata, HMS, artsusikkerhet, sårbar natur, målgruppe, korrigering og handoff kan endre neste handling uten at publikumspress eller badge blir faglig bevis.'
  ],
  work_life:{
    daily_work:['Forbereder feltbrief, rute, utstyr, HMS, metode og stoppkriterier før dagens første observasjon.','Registrerer observasjoner og prøver med sporbare metadata, artsusikkerhet og avvik uten å fylle inn manglende fakta.','Tilpasser kvalitetssikret naturkunnskap til publikum uten å røpe sårbare lokaliteter eller fjerne avgjørende forbehold.','Kvalitetssikrer feltlogg og gjør handoff av prøve, artsavklaring, sikkerhetsavvik og oppfølging til eksplisitt neste eier.'],
    responsibilities:['nøyaktig observasjon','sikker feltpraksis','sporbar dokumentasjon','artsusikkerhet','sårbarhetsvern','tilpasset formidling'],
    work_environment:['Naturreservater, feltlokaliteter, besøksflater og friluftsområder der plan, observasjon, prøve, HMS og formidling må henge sammen.'],
    status_position:['Feltassistent kan tilbys direkte innen stillingens avgrensede mandat. Naturveileder krever relevant_education_or_employer_qualification. History Go eller Natur-badge er læringsstøtte og kan ikke oppfylle Naturveileder-porten eller gi forvaltningsmyndighet.'],
    workplaces:PLACES.map((p)=>p.id)
  },
  career_path:{
    entry_from:['Feltassistent via direct career offer; Naturveileder først etter dokumentert relevant_education_or_employer_qualification.'],
    progression_to:['Mer selvstendig felt- eller formidlingsansvar gjennom dokumentert praksis, relevant kvalifikasjon og eksplisitt arbeidsgivermandat.'],
    possible_promotions:['Naturveileder når relevant utdanning eller arbeidsgiverkvalifikasjon faktisk er oppfylt.','Koordinerende felt- eller besøksansvar når arbeidsgiver uttrykkelig tildeler ansvar; dette gir ikke automatisk forsknings- eller forvaltningsmyndighet.'],
    possible_exits:['Biologi, økologi, forskning eller naturforvaltning når den nye rollens egne kvalifikasjonsporter er oppfylt.','Friluftsliv, undervisning, museum, besøkssenter eller annen formidling uten at feltstatus automatisk følger med.'],
    career_risks:['Publikumspress, tid og spennende funn kan belønne overforenkling eller for tidlig artsbestemmelse.','Gjentatt improvisasjon med HMS eller metadata kan gjøre senere dokumentasjon ubrukelig selv når selve feltarbeidet ser effektivt ut.']
  },
  required_knowledge:{
    education_basis:['Feltassistent følger stillingens opplæring og mandat; Naturveileder krever relevant_education_or_employer_qualification. History Go er læringsstøtte, ikke denne kvalifikasjonen.'],
    skills:['feltmetode','arts- og naturforståelse','HMS og risikovurdering','prøve- og fotometadata','sporbar dokumentasjon','artsusikkerhet','sårbarhetsvern','målgruppetilpasset formidling','tilgjengelig kommunikasjon','handoff og avvikshåndtering'],
    category_knowledge:['Naturfaglig kontekst, artskjennetegn, habitat, naturtyper, feltmetode, prøvespor, vær- og sikkerhetsgrenser, sårbar natur og skillet mellom dokumentert observasjon og foreløpig tolkning.'],
    history_go_badges:['natur'],
    place_connections:PLACES.map((p)=>p.id),
    people_connections:ACTORS.map((a)=>a.id),
    boundary:'History Go kan gi arter, steder, begreper og bedre spørsmål, men kan ikke fungere som faktisk feltobservasjon, prøvebevis, arbeidsgiverkvalifikasjon, adgangstillatelse eller forvaltningsvedtak.'
  },
  authority_boundary:AUTHORITY,
  challenges:[{id:'presisjon_sikkerhet_og_publikum',title:'Presisjon, sikkerhet og publikumspress',description:'Felt- og formidlingsrollen må la dokumentasjon, HMS, sårbar natur og reell artsusikkerhet begrense tempo og budskap selv når gruppen ønsker mer nærhet eller et sikrere svar.',pressure:'tempo_vs_presisjon_og_tilgjengelighet_vs_saarbarhet',affects:['quality','trust','risk']}],
  dilemmas:[{id:'spennende_funn_med_svak_dokumentasjon',title:'Spennende funn med svak dokumentasjon',setup:'Et mulig sjeldent artsfunn skaper forventning, men metadata eller kjennetegn er utilstrekkelige.',choice_axis:'sporbar_usikkerhet_vs_publikumseffekt',consequence_axis:'langsiktig_faglig_tillit_vs_kortsiktig_entusiasme',mail_hooks:TYPES}],
  related_people:ACTORS.map((a,index)=>({
    ...a,
    fictional:true,
    fictional_scenario_actor:true,
    canonical_person_ref:null,
    function:[
      'Solveig gjør feltplan, rutevalg, værvurdering, utstyr, stoppkriterier og praktisk metode til en synlig arbeidsflyt før observasjon eller prøvetaking starter. Hun holder dagens mål og risikobilde sammen, slik at et værskifte, utstyrsproblem eller sikkerhetsavvik kan endre planen uten at laget later som den opprinnelige ruten fortsatt gjelder.',
      'Amir bærer artsfaglig kvalitetssikring og skillet mellom dokumentert kjennetegn, sannsynlig identifikasjon og bekreftet funn. Han kobler foto, lokalitet, habitat, tidspunkt og manglende kjennetegn til eksplisitt artsusikkerhet, slik at et spennende funn kan nedjusteres eller kreve ny observasjon uten at tidligere feltspor blir skrevet om.',
      'Nora bærer naturformidling, målgruppe, tilgjengelig språk og beskyttelse av sårbar natur. Hun gjør det mulig å være engasjerende uten å røpe utsatte lokaliteter eller fjerne faglige forbehold, og hun registrerer når spørsmål fra publikum viser at et budskap må korrigeres eller nyanseres før neste formidlingsrunde.',
      'Jonas bærer HMS, logistikk, prøve- og utstyrshandoff og lukking av dagens feltspor. Han kobler avvik, lagring, transport, ansvar og åpne oppgaver til eksplisitt neste eier, slik at ingen prøve, sikkerhetshendelse eller artsavklaring blir hengende mellom aktører eller rekonstruert muntlig i ettertid.'
    ][index],
    authority_relation:[
      'Solveig kan endre eller stoppe feltplanen når metode, vær eller sikkerhet krever det og kan fordele praktiske oppgaver innen sitt mandat, men kan ikke gjøre et usikkert funn sikkert, utstede forskningskonklusjon, fatte forvaltningsvedtak eller la fremdriftsmål overstyre dokumenterte stoppkriterier.',
      'Amir kan be om bedre dokumentasjon, holde en artsidentifikasjon åpen og anbefale ny observasjon eller faglig eskalering, men kan ikke omskrive manglende metadata, bruke faglig status som erstatning for evidens eller gjøre artskvalitetssikring til offentlig eller politisk myndighet.',
      'Nora kan tilpasse språk, ruteinformasjon og publikumsopplegg innen fag- og sikkerhetsrammen og kan skjerme sårbar lokalitetsinformasjon, men kan ikke oppfylle Naturveileder-kvalifikasjon gjennom badge, love tilgang som strider mot vern eller gjøre et formidlingsbudskap til forvaltningsvedtak.',
      'Jonas kan stoppe praktisk flyt når HMS, prøveansvar eller handoff er uavklart og kan kreve at neste eier blir navngitt, men kan ikke fylle inn ukjente feltdata, avgjøre artsfaglige spørsmål, tildele yrkeskvalifikasjon eller bruke logistikkansvar som generell faglig myndighet.'
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
    description:'Et vedvarende, versjonert felt- og formidlingsobjekt som beholder brief, rute, metode, observasjon, prøve- og fotometadata, HMS, artsusikkerhet, sårbarhetsgrense, målgruppe, formidlingsbudskap, avvik, ventepunkt, handoff og avgrenset rework gjennom samme arbeidsdag og oppfølging.',
    states:['brief_mottatt','risiko_vurdert','feltplan_lagt','utstyr_kontrollert','rute_aktiv','observasjon_apen','prove_eller_foto_registrert','metadata_kontrollert','artsavklaring_venter','hms_avvik_apent','formidlingsgrunnlag_klart','malgruppe_tilpasset','venter_pa_faglig_svar','handoff_klar','rework','korrigert','rapportert','arkivert','gjenapnet'],
    handoff_rule:'Neste aktør overtar synlig feltplan, metode, observasjon, prøve- og fotometadata, HMS-status, artsusikkerhet, sårbarhetsgrense, ventepunkt og neste eier; en handoff kan aldri gjøre manglende metadata, venting eller publikumspress til faglig godkjenning.'
  },
  rhythm_contract:{
    loop:'brief -> feltplan -> observasjon/prøve -> dokumentasjon -> waiting/venting på artsavklaring, værvindu, sikkerhetsklarering eller faglig svar -> handoff -> formidling -> spørsmål -> korrigering/rework -> rapportering -> læring',
    waiting_states:['vaervindu','artsavklaring','prove_eller_fotometadata','hms_avklaring','saarbarhetsvurdering','faglig_kvalitetssjekk','malgruppe_eller_tilgjengelighet'],
    rework_rule:'Nytt artsgrunnlag, korrigert metadata, HMS-avvik, endret vær, sårbarhetsinformasjon eller misvisende publikumsrespons gjenåpner bare berørt observasjon, prøve, rute eller formidlingsbudskap med ny versjon og bevart endringsspor.'
  },
  knowledge_dependencies:[{id:'history_go_natur_felt_og_stedskontekst',badge_id:'natur',use:'History Go kan forbedre feltspørsmål og formidling gjennom arter, steder, økologi og naturhistorie. Natur-badge er ikke feltobservasjon, arbeidsgiverkvalifikasjon, adgangstillatelse eller forvaltningsmyndighet og kan ikke gjøre et usikkert artsfunn sikkert.'}],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:POLICY,first_object:PERSISTENT,first_task:'Ta imot feltbriefen, registrer rute, metode, vær, HMS, utstyr, stoppkriterier, dagens observasjons- eller formidlingsmål og hvem som eier første åpne avklaring; bruk History Go som kontekst, aldri som feltbevis eller kvalifikasjon.'},
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
  schema:'civication_mail_plan_v1',version:1,id:'natur_felt_og_formidling_foundation_v1',category:CATEGORY,role_scope:ROLE,title:'Felt og naturformidling',
  description:'Seksten steg fra første feltbrief til sporbar observasjon, trygg rute, kvalitetssikret formidling, eksplisitt handoff og korrigering gjennom samme felt- og formidlingslogg.',
  arc:{from:'Ny feltassistent eller kvalifisert naturveileder som må lære at tempo, publikum og et spennende funn aldri er feltbevis.',to:'En trygg felt- og formidlingsutøver som kan holde observasjon, prøve, metadata, HMS, sårbar natur, artsusikkerhet og publikumsforståelse sammen uten å skjule avvik.',core_questions:['Hva er faktisk observert, og hva er foreløpig arts- eller faglig tolkning?','Hvilken HMS-, sårbarhets- eller metadatagrense kan endre rute eller oppfølging?','Hva må vente, kvalitetssikres eller eskaleres før funnet eller budskapet kan bli sikrere?']},
  outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','felt_formidling_sporbarhetssvikt']}},
  sequence:sequenceTypes.map((type,i)=>({step:i+1,type,phase:i<3?'intro':i<10?'advanced':'mastery',step_goal:`Før ${PERSISTENT} gjennom ${type} med synlig observasjon, HMS, artsusikkerhet, ventepunkt, handoff og neste eier.`,allowed_families:[FAMILY[type]],fallback_types:[]}))
};
write(PLAN, plan);

for (const type of TYPES) {
  const mails = seeds[type].map((seed,i)=>makeMail(type,seed,i));
  write(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`,{
    schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,
    families:[{id:FAMILY[type],purpose:`Trene ${type} gjennom det versjonerte felt- og formidlingssporet uten å blande observasjon, tolkning, kvalifikasjon og myndighet.`,learning_focus:['feltmetode','HMS','sporbarhet','artsusikkerhet','formidling'],mails}]
  });
}

fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,SOURCE),`# Natur / Felt og formidling — prerequisites source-first\n\n## Scope\n\nCanonical role: \`natur/natur_felt_og_formidling\`. This package materializes the playable Career/work foundation and is **not Role World completion**. Bounded audience standing remains reserved for the later dedicated Role World authoring pass.\n\n## Career gates\n\n- **Feltassistent** — direct career offer within the role's bounded task and authority contract.\n- **Naturveileder** — \`qualification_required\` via \`relevant_education_or_employer_qualification\`.\n\nHistory Go and the Natur badge are learning support, not a field observation, employer qualification, access permit or administrative authority.\n\n## Playable foundation\n\nThe package keeps the existing field and interpretation loops and authority boundary, then adds four bounded work actors, four work surfaces, a persistent editorial object (\`${PERSISTENT}\`), waiting/handoff/rework, a 16-step plan and **15 source mails** across all nine canonical mail types. Observation, sample/photo metadata, HMS, species uncertainty, sensitive-nature limits and public-facing corrections remain separately traceable.\n\n## Authority\n\nThe role may record documented observations, collect samples within agreed method and safety limits, communicate quality-assured nature knowledge, and escalate uncertain findings or safety deviations. It may not make administrative decisions, issue unsupported research conclusions, exercise political authority, hide uncertainty, or turn History Go knowledge into field evidence.\n\n## Cross-role\n\nReadiness says \`candidate_when_shared_work_is_real\`. This prerequisite package does not invent a cross-role link or mark shared work complete; any later shared-work decision must be proved from real work in the dedicated rollout authoring.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene engine. Existing Career gates, Scene Pipeline, mail machinery and audits remain canonical.\n`);

console.log(JSON.stringify({role:ROLE,actors:ACTORS.length,places:PLACES.length,mail_types:TYPES.length,total_mails:Object.values(seeds).flat().length,persistent:PERSISTENT},null,2));
