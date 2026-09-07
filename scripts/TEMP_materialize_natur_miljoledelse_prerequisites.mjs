import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ROLE = 'natur_miljoledelse';
const CATEGORY = 'natur';
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_MILJOLEDELSE_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'mandat_maal_risiko_kapasitet_prioritering_ansvar_avvik_tiltak_og_oppfolgingslogg';

const ACTORS = [
  {id:'eva_fag_og_kvalitetsleder_natur_miljoledelse',name:'Eva',role:'fag- og kvalitetsleder',workplace_ids:['ledergruppe_mandat_og_maalbord_natur']},
  {id:'jonas_okonomi_og_kapasitetscontroller_natur_miljoledelse',name:'Jonas',role:'økonomi- og kapasitetscontroller',workplace_ids:['budsjett_kapasitet_og_portefoljeflate_natur']},
  {id:'amina_miljorisiko_og_avviksansvarlig_natur_miljoledelse',name:'Amina',role:'miljørisiko- og avviksansvarlig',workplace_ids:['miljorisiko_avvik_og_tiltaksrom_natur']},
  {id:'tor_hr_og_lederstotte_natur_miljoledelse',name:'Tor',role:'HR- og lederstøtte',workplace_ids:['bemanning_delegering_og_oppfolgingsrom_natur']}
];

const PLACES = [
  {id:'ledergruppe_mandat_og_maalbord_natur',name:'Ledergruppe-, mandat- og målbord',function:'Her låses arbeidsgivermandat, virksomhetsmål, miljømål, vesentlige faglige premisser, beslutningseier, fullmakter, rapporteringslinjer, prioriteringskriterier og hvilke uenigheter som må stå synlige før lederen fordeler ressurser eller gir styringssignaler.'},
  {id:'budsjett_kapasitet_og_portefoljeflate_natur',name:'Budsjett-, kapasitet- og porteføljeflate',function:'Her sammenstilles budsjett, bemanning, kompetansedekning, frister, lovpålagte og strategiske oppgaver, porteføljeavhengigheter og eksplisitte restanser slik at prioriteringer kan begrunnes uten å late som kapasiteten er større enn den faktisk er.'},
  {id:'miljorisiko_avvik_og_tiltaksrom_natur',name:'Miljørisiko-, avviks- og tiltaksrom',function:'Her registreres miljøavvik, alvorlighetsgrad, skadebegrensning, faktagrunnlag, varsling, tiltak, ansvar, frister, etterkontroll og gjenåpning. Omdømme, lederstatus eller ønsket leveransetempo kan aldri redusere selve risikovurderingen.'},
  {id:'bemanning_delegering_og_oppfolgingsrom_natur',name:'Bemannings-, delegerings- og oppfølgingsrom',function:'Her kobles oppgaveeierskap, faktisk delegasjon, kompetanse, arbeidsbelastning, sykefravær, støttebehov, lederoppfølging, handoff og rework til konkrete leveranser uten at personalmakt brukes til å overstyre faglige funn eller skjule uforsvarlig kapasitet.'}
];

const POLICY = {
  'Naturvernleder':{policy:'appointment_required',qualification_ids:['employer_appointment']},
  'Miljøsjef':{policy:'appointment_required',qualification_ids:['employer_appointment']},
  'Miljødirektør':{policy:'appointment_required',qualification_ids:['employer_appointment']}
};

const AUTHORITY = {
  may:['lede innen dokumentert arbeidsgivermandat','prioritere ressurser og portefølje innen gitt fullmakt','fordele ansvar og delegere oppgaver uten å delegere bort eget lederansvar','eskalere vesentlig miljørisiko, kapasitetsbrist og målkonflikter','stanse eller omprioritere arbeid når dokumentert risiko eller kapasitet krever det'],
  may_not:['materialisere ledelsesmandat uten employer_appointment','opptre som statsråd eller annen offentlig myndighet uten særskilt utnevnelse','sette lov eller forskrift til side','overstyre eller omskrive faglige funn av omdømme-, budsjett- eller leveransehensyn','bruke History Go eller Natur-badge som arbeidsgiverutnevnelse, personalfullmakt, faglig evidens eller beslutningshjemmel']
};

const LOOPS = [
  'mål -> risiko -> kapasitet -> prioritering -> ansvar -> oppfølging -> læring',
  'avvik -> alvorlighetsgrad -> tiltak -> kommunikasjon -> kontroll -> lukking'
];
const WAITING = ['faglig_risikovurdering','budsjett_eller_okonomiavklaring','bemanning_eller_kompetansedekning','juridisk_eller_compliance_avklaring','toppledelsesbeslutning','tiltaksgjennomforing','etterkontroll_eller_nye_data'];

const FAMILY = {
  job:'miljoledelse_job',
  people:'miljoledelse_profesjonelle_relations',
  conflict:'miljoledelse_faglig_integritet_og_styringspress',
  story:'miljoledelse_lederansvar_og_mandat',
  event:'miljoledelse_avvik_og_premissendring',
  micro:'miljoledelse_rask_prioriteringsavklaring',
  followup:'miljoledelse_etterkontroll_og_oppfolging',
  knowledge:'miljoledelse_history_go_naturkontekst',
  consequence:'miljoledelse_prioritering_og_etterspill'
};

const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), {recursive:true});
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

const longSummary = (subject, detail) => `${subject}. ${detail} Saken skal føres i ${PERSISTENT}, der dokumentert arbeidsgivermandat, virksomhets- og miljømål, beslutningseier, faglige premisser, miljørisiko, budsjett, bemanning, kompetansedekning, kapasitet, prioriteringskriterier, eksplisitte restanser, delegert ansvar, miljøavvik, tiltak, varsling, ventepunkt, handoff, etterkontroll og rework holdes som separate og versjonerte felt. Naturvernleder, Miljøsjef og Miljødirektør kan bare materialiseres etter employer_appointment; Badge-poeng, popularitet, tidligere gode resultater eller selverklært senioritet kan aldri oppfylle denne gaten. Lederen kan prioritere ressurser, fordele ansvar, eskalere risiko og styre gjennomføring innen dokumentert fullmakt, men kan ikke sette lov til side, gjøre personalmakt til faglig evidens, tone ned et miljøavvik for å beskytte omdømme eller opptre som statsråd. History Go og Natur-badge kan gi arts-, steds-, økologi- og naturhistorisk kontekst som gjør lederens kontrollspørsmål bedre, men er verken arbeidsgiverutnevnelse, feltdata, HMS- eller avviksbevis, delegasjon, budsjettfullmakt eller juridisk hjemmel. En god løsning må derfor gjøre selve prioriteringskostnaden synlig: hva som utsettes, hvilken rest-risiko som aksepteres, hvem som eier tiltaket, hva som må ventes på, og hvilket premiss som gjenåpner saken dersom kapasitet, faglige funn eller avviksbildet endres.`;
const goodReply = `Jeg låser først arbeidsgivermandat, beslutningseier og hvilke faglige premisser som faktisk er dokumentert. Deretter gjør jeg mål, miljørisiko, budsjett, bemanning, kompetanse og restanser sammenlignbare før jeg prioriterer. Jeg navngir hva som ikke blir gjort, hvem som eier hver oppgave og hvilket ventepunkt som stopper videre arbeid. Et alvorlig faglig eller miljømessig avvik blir stående uendret selv om ordlyden er ubehagelig. Hvis økonomi, bemanning, faggrunnlag eller alvorlighetsgrad endres, gjenåpner jeg bare berørte prioriteringer og tiltak med bevart versjonsspor i stedet for å omskrive hvorfor den forrige beslutningen ble tatt.`;
const badReply = `Jeg bruker lederrollen til å skape framdrift raskt, fordeler oppgavene slik at alt ser dekket ut og lar teamet håndtere restanser uten å synliggjøre hva som faktisk faller bort. Hvis en miljørisiko eller et avvik skaper uro, toner jeg ned formuleringen til budsjett og kommunikasjon er avklart. Jeg behandler tidligere gode resultater og lederstatus som tilstrekkelig grunnlag for å presse gjennom prioriteringen, og lar handoff skje uten eksplisitt beslutningseier, kapasitetspremiss eller spor for hva som må gjenåpnes dersom situasjonen endrer seg.`;
const goodFeedback = `Grepet gjør lederansvaret etterprøvbart fordi medarbeidere, fagansvarlige, økonomi, toppledelse og senere kontroll kan se hvilket mandat som gjaldt, hvilke faglige funn som var låst, hvilken kapasitet som faktisk fantes, hvilke oppgaver som ble prioritert bort, hvem som fikk ansvar og hvilken rest-risiko som ble akseptert. Dermed kan arbeidsgiverfullmakt brukes til reell styring uten å bli forvekslet med faglig sannhet, og et avvik kan eskaleres eller gjenåpnes uten at organisasjonen må late som den opprinnelige prioriteringen var mer sikker enn den var.`;
const badFeedback = `Løsningen kan skape kortsiktig ro og en penere statusrapport, men den gjør mandat, kapasitet og faglig grunnlag vanskeligere å skille fra hverandre. Skjulte restanser, uklare delegasjoner og nedtonet miljørisiko flytter kostnaden til medarbeidere, senere leveranser og den som må etterkontrollere avviket. Når situasjonen endres, finnes det heller ikke et lesbart spor for hvorfor oppgaver ble valgt bort eller hvem som faktisk eide tiltaket. Det øker både styringsrisiko, personalbelastning og faren for at ledermakt brukes til å overdøve ubehagelige faglige funn.`;

const seeds = {
  job:[
    ['Prioriter porteføljen med reell kapasitet','Virksomheten har flere miljømål og lovpålagte leveranser enn teamet kan dekke samtidig. Lederen må gjøre kapasitet, risiko, tidskritikalitet og konsekvensen av utsettelse synlig før ansvar fordeles.',ACTORS[1],PLACES[1]],
    ['Håndter et alvorlig miljøavvik','Et avvik kan ha vesentlig miljøkonsekvens samtidig som virksomheten står foran en viktig leveranse. Fakta, skadebegrensning, varsling, tiltakseier og kontrollpunkt må låses før kommunikasjon eller omdømme får påvirke saken.',ACTORS[2],PLACES[2]],
    ['Fordel ansvar uten å skjule kompetansegap','En kritisk oppgave mangler tilstrekkelig kapasitet og nøkkelkompetanse. Lederen må redusere, omprioritere eller eskalere leveransen fremfor å late som delegasjon skaper kompetanse eller timer som ikke finnes.',ACTORS[3],PLACES[3]],
    ['Ta målkonflikten til riktig beslutningseier','Fagmiljøets anbefaling svekker et kortsiktig virksomhetsmål. Lederen må bevare funnet, synliggjøre alternativer og rest-risiko og sende selve målkonflikten til den som faktisk har mandat til å endre prioriteringen.',ACTORS[0],PLACES[0]]
  ],
  people:[
    ['Fagleder nekter å tone ned funnet','Eva dokumenterer en miljøfaglig risiko som kolliderer med et prestisjefylt mål. Hun forventer at lederen beskytter faglig integritet samtidig som uenighet, beslutningseier og mulige tiltak blir håndterbare.',ACTORS[0],PLACES[0]],
    ['Controller gjør restansen synlig','Jonas viser at budsjett og bemanning ikke dekker hele porteføljen. Han krever at prioritering betyr et eksplisitt valg av hva som utsettes, ikke bare en ny forventning om at teamet skal levere mer.',ACTORS[1],PLACES[1]],
    ['Avviksansvarlig eskalerer alvorlighetsgrad','Amina finner nye data som gjør et tidligere moderat avvik alvorligere. Lederen må gjenåpne tiltak, varsling og prioritering uten å bruke tidligere rapportering som grunn til å holde risikonivået nede.',ACTORS[2],PLACES[2]],
    ['Lederstøtte varsler uholdbar belastning','Tor ser at samme nøkkelperson stadig får de mest kritiske leveransene. Lederen må skille faktisk delegasjon fra skjult overbelastning og gjøre kompetanse-, kapasitet- og personalrisiko til del av styringsbildet.',ACTORS[3],PLACES[3]]
  ],
  conflict:[['Toppledelsen vil ha mildere risikospråk','Et vesentlig miljøproblem kan skade virksomhetens omdømme og toppledelsen ønsker en mer beroligende formulering før fakta eller tiltak har endret seg. Lederen må skille kommunikasjon fra selve risikovurderingen.',ACTORS[2],PLACES[2]]],
  story:[['Lederen må eie kostnaden ved prioritering','En synlig prioritering betyr at en populær leveranse utsettes for å beskytte en mer kritisk miljøoppgave. Spilleren må tåle intern misnøye uten å skyve ansvaret nedover eller omskrive hvorfor valget ble tatt.',ACTORS[1],PLACES[1]]],
  event:[['Nye data gjenåpner lukket avvik','Et avvik som var på vei mot lukking får nye målinger eller feltopplysninger som endrer alvorlighetsgrad og tiltakseffekt. Bare berørte deler skal gjenåpnes, mens tidligere beslutninger og begrunnelser bevares.',ACTORS[2],PLACES[2]]],
  micro:[['Avklar hvem som faktisk har fullmakt','En frist nærmer seg og to ledere tror den andre eier beslutningen om å flytte ressurser. Før prioritering eller delegasjon må faktisk arbeidsgiverfullmakt og beslutningseier registreres eksplisitt.',ACTORS[3],PLACES[0]]],
  followup:[['Et tiltak virker svakere enn forventet','Et miljøtiltak er gjennomført, men etterkontrollen viser at effekten er mindre enn planlagt. Lederen må gjenåpne rest-risiko, ansvar, kapasitet og neste tiltak uten å markere saken som ferdig av rapporteringshensyn.',ACTORS[2],PLACES[2]]],
  knowledge:[['History Go forbedrer kontrollspørsmål, ikke ledermandat','History Go gir naturhistorisk eller økologisk kontekst som peker mot et spørsmål teamet bør undersøke. Kunnskapen kan utløse kilde- eller feltkontroll, men kan ikke gi employer_appointment, personalfullmakt eller bevise et avvik.',ACTORS[0],PLACES[0]]],
  consequence:[['Skjult restanse kommer tilbake som styringssvikt','En oppgave som aldri ble eksplisitt prioritert bort, dukker senere opp som alvorlig restanse. Lederen må rekonstruere mandat, kapasitet og ansvar og korrigere styringssporet uten å legge hele skylden på medarbeideren som fikk en umulig portefølje.',ACTORS[1],PLACES[1]]]
};

const makeMail = (type, seed, index) => {
  const [subject, detail, actor, place] = seed;
  return {
    id:`miljoledelse_${type}_${String(index+1).padStart(3,'0')}`,
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
      `Oppfølgingsloggen viser dokumentert arbeidsgivermandat, mål, beslutningseier, miljørisiko, budsjett, bemanning, kompetanse, prioriterte og utsatte oppgaver, åpne avvik, tiltak, ansvar og hva organisasjonen venter på.`,
      `En rask løsning kan gi ro i rapporteringen, men kan samtidig skjule restanser, uholdbar belastning, mandatglidning eller at et miljøfaglig funn er blitt mildnet for å passe leveranse- eller omdømmebehov.`,
      `Du må velge et grep som gjør prioriteringskostnad, handoff og mulig rework lesbart uten å bruke lederstatus, employer_appointment eller History Go som erstatning for faglig evidens.`
    ],
    task_domain:'miljo_og_naturledelse',
    competency:'mandatklar_prioritering_risikostyring_kapasitet_og_oppfolging',
    pressure:'miljorisiko_budsjett_bemanning_virksomhetsmaal_og_omdomme',
    choice_axis:'etterprovbar_lederprioritering_vs_skjult_restansestyring',
    consequence_axis:'faglig_integritet_og_organisatorisk_tillit_vs_mandatglidning_og_skjult_risiko',
    narrative_arc:type,
    choices:[
      {id:'A',label:`Før ${subject.toLowerCase()} gjennom mandat- og risikosporet`,reply:goodReply,effect:1,tags:['mandat','sporbarhet','miljorisiko'],feedback:goodFeedback,effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}},
      {id:'B',label:`Lukk ${subject.toLowerCase()} gjennom tempo og lederstatus`,reply:badReply,effect:-1,tags:['tempo','omdommepress','mandatglidning'],feedback:badFeedback,effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}}
    ]
  };
};

const oldModel = read(MODEL);
const actorFunctions = [
  'Eva bærer miljøfaglig kvalitet, ubehagelige funn og skillet mellom faglig vurdering og lederens organisatoriske prioritering. Hun krever at dokumenterte risikoer, metodebegrensninger og faglig uenighet står synlig selv når virksomhetsmål eller omdømme gjør dem kostbare, og hun hjelper lederen å formulere hva som må eskaleres uten å gjøre faglederen til beslutningseier.',
  'Jonas bærer budsjett, kapasitetsbilde, portefølje, kostnader og eksplisitte restanser. Han gjør forskjellen synlig mellom å prioritere og bare å legge mer arbeid på teamet, kobler ressursvalg til hvilke leveranser som faktisk faller bort, og sørger for at økonomiske rammer beskrives som styringspremisser snarere enn som faglig bevis for at miljørisiko er lav.',
  'Amina bærer miljøavvik, alvorlighetsgrad, skadebegrensning, faktainnhenting, varsling, tiltak og etterkontroll. Hun sørger for at nye data kan gjenåpne et avvik og at kommunikasjon eller omdømme aldri får omskrive risikovurderingen, samtidig som lederen får et lesbart bilde av hvem som eier tiltaket og hvilke kontrollpunkter som må passeres før lukking.',
  'Tor bærer bemanning, faktisk delegasjon, kompetansedekning, arbeidsbelastning og lederoppfølging. Han gjør det synlig når en portefølje hviler på skjult overbelastning eller manglende kompetanse, krever at handoff og støttebehov får tydelig eier og hjelper lederen å skille legitim personalledelse fra press som kan få medarbeidere til å tie om faglige eller miljømessige problemer.'
];
const actorAuthority = [
  'Eva kan kreve faglig kvalitetssikring, dokumentere avvik og anbefale at en risiko eller målkonflikt eskaleres, men kan ikke bruke fagansvar til å tildele employer_appointment, disponere budsjett uten fullmakt, gjøre sin vurdering til et formelt virksomhetsvedtak eller gi lederen rett til å omskrive et ubehagelig funn.',
  'Jonas kan dokumentere økonomi, kapasitet, porteføljeeffekt og restanser og kan utfordre en prioritering som ikke går opp i faktiske ressurser, men kan ikke gjøre budsjettbegrensning til bevis for lav miljørisiko, gi seg selv arbeidsgiverfullmakt, overstyre faglige funn eller erstatte lederens ansvar for selve prioriteringen.',
  'Amina kan eskalere miljøavvik, kreve sporbar faktainnhenting, foreslå skadebegrensning og gjenåpne kontroll når nye data endrer alvorlighetsgrad, men kan ikke tone ned fakta for omdømme, bruke avviksrollen som offentlig myndighet, gi employer_appointment eller lukke et avvik bare fordi rapporteringsfristen er nådd.',
  'Tor kan avklare delegasjon, kapasitet, kompetansebehov og personalmessig oppfølging og kan varsle når arbeidsbelastningen gjør en leveranse uforsvarlig, men kan ikke tildele seg selv ledermandat, gjøre HR-prosess til faglig evidens, presse medarbeidere til å endre miljøfunn eller frita den utnevnte lederen fra ansvar for prioritering og oppfølging.'
];

const model = {
  ...oldModel,
  core_narrative:[
    'Lede miljø- og naturarbeid gjennom dokumentert arbeidsgivermandat, synlig miljørisiko, reell kapasitet og etterprøvbare prioriteringer uten å bruke ledermakt til å omskrive faglige funn.',
    'Rollen gjør miljøledelse spillbar gjennom ett vedvarende styrings- og avviksspor der mål, risiko, budsjett, bemanning, delegasjon, restanser, tiltak og etterkontroll kan endres med nye premisser uten at omdømme eller hierarki blir evidens.'
  ],
  work_life:{
    daily_work:[
      'Låser arbeidsgivermandat, miljømål, virksomhetsmål, beslutningseier og hvilke faglige premisser som ikke kan forhandles bort.',
      'Sammenstiller miljørisiko, budsjett, bemanning, kompetanse og portefølje for å prioritere med eksplisitte restanser og ansvar.',
      'Håndterer miljøavvik fra alvorlighetsgrad og skadebegrensning til varsling, tiltak, kontroll og eventuell gjenåpning.',
      'Følger opp medarbeidere, delegasjon, målkonflikter og leveranser uten å bruke personalmakt eller omdømmehensyn til å overstyre faglige funn.'
    ],
    responsibilities:['arbeidsgivermandat','miljørisiko','budsjett og kapasitet','bemanning og kompetanse','prioritering og restanser','miljøavvik og tiltak','delegasjon og oppfølging','faglig integritet'],
    work_environment:['Offentlig virksomhet, organisasjon eller bedrift med ledergruppe, fagmiljø, budsjettansvar, personaloppfølging og miljøforpliktelser der styring må kunne etterprøves av både medarbeidere og høyere beslutningsnivå.'],
    status_position:['Naturvernleder, Miljøsjef og Miljødirektør krever alle employer_appointment. History Go og Natur-badge er læringsstøtte og kan aldri materialisere arbeidsgiverutnevnelse, personalfullmakt, budsjettmyndighet eller formell lederstatus.'],
    workplaces:PLACES.map(p=>p.id)
  },
  authority_boundaries:{can:AUTHORITY.may,cannot:AUTHORITY.may_not},
  career_path:{
    entry_from:['Naturvernleder, Miljøsjef eller Miljødirektør bare etter dokumentert employer_appointment til den konkrete lederrollen; spillstatus, naturkunnskap eller Badge-poeng kan ikke oppfylle denne porten.'],
    progression_to:['Større portefølje-, budsjett- eller personalansvar bare når arbeidsgiver faktisk endrer mandat og fullmakter; høyere spillstatus utvider ikke organisasjonsmyndigheten.'],
    possible_promotions:['Større miljølederansvar når arbeidsgiver gjennom en ny eller utvidet appointment gir dokumentert mandat.','Overordnet virksomhetsledelse dersom separat rolle, kompetansekrav og arbeidsgiverprosess faktisk er oppfylt.'],
    possible_exits:['Faglig miljø- eller naturarbeid uten personalansvar når relevant kompetanse og ansettelsesvilkår er oppfylt.','Forvaltning eller rådgivning der ny rolle og eventuelle kvalifikasjonskrav er dokumentert; overgang gir ikke automatisk offentlig myndighet.'],
    career_risks:['Resultat-, budsjett- og omdømmepress kan belønne skjulte restanser, for lav risikorapportering og uholdbar arbeidsbelastning.','Hierarki kan skape taushet eller mandatglidning dersom medarbeidere oppfatter lederens ønskede utfall som viktigere enn dokumenterte faglige funn.']
  },
  required_knowledge:{
    education_basis:['Relevant miljø-, natur-, virksomhets- og ledelseskompetanse etter stillingens faktiske krav kombinert med employer_appointment til rollen; History Go er læringsstøtte, ikke utnevnelse, personalfullmakt eller evidens.'],
    skills:['miljøledelse','miljørisiko','strategisk prioritering','budsjettforståelse','kapasitetsstyring','bemanning og kompetansedekning','delegasjon','miljøavvik og skadebegrensning','kvalitetsstyring','faglig integritet','lederkommunikasjon','etterkontroll og organisatorisk læring'],
    category_knowledge:['Naturfaglig kontekst, miljømål, miljørisiko, avviksbehandling, kapasitet, budsjett, bemanning, delegasjon, styringslinjer, faglig uavhengighet og skillet mellom arbeidsgiverfullmakt, faglige funn og offentlig myndighet.'],
    history_go_badges:['natur'],
    place_connections:PLACES.map(p=>p.id),
    people_connections:ACTORS.map(a=>a.id),
    boundary:'History Go kan gi arter, steder, økologi og naturhistorie som forbedrer lederens kontrollspørsmål, men kan ikke fungere som employer_appointment, feltdata, avviksbevis, juridisk hjemmel, budsjettfullmakt, delegasjon eller personalmyndighet.'
  },
  authority_boundary:AUTHORITY,
  challenges:[{id:'miljorisiko_vs_virksomhetsmaal_og_kapasitet',title:'Miljørisiko, virksomhetsmål og reell kapasitet',description:'Lederen må la dokumentert miljørisiko og faktisk kapasitet begrense porteføljen selv når budsjett, leveransepress eller omdømme gjør det fristende å skjule restanser eller mildne faglige funn.',pressure:'miljorisiko_vs_virksomhetsmaal_og_kapasitet_vs_ambisjon',affects:['quality','trust','risk']}],
  dilemmas:[{id:'ledermakt_blir_behandlet_som_evidens',title:'Lederønske blir behandlet som faglig sannhet',setup:'Organisasjonen begynner å behandle lederens ønskede leveranse eller risikospråk som et premiss for hva fagmiljøet bør konkludere, samtidig som kapasitet eller nye data peker i en annen retning.',choice_axis:'mandatklar_styring_vs_hierarkisk_faglig_overstyring',consequence_axis:'etterprovbar_tillit_vs_skjult_risiko_og_taushet',mail_hooks:TYPES}],
  related_people:ACTORS.map((a,index)=>({...a,fictional:true,fictional_scenario_actor:true,canonical_person_ref:null,function:actorFunctions[index],authority_relation:actorAuthority[index]})),
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
    description:'Et vedvarende, versjonert leder- og avviksspor som beholder arbeidsgivermandat, mål, beslutningseier, faglige premisser, miljørisiko, budsjett, bemanning, kompetanse, kapasitet, prioriteringskriterier, eksplisitte restanser, delegert ansvar, miljøavvik, tiltak, varsling, ventepunkt, handoff, etterkontroll og avgrenset rework gjennom samme styringsforløp.',
    states:['mandat_bekreftet','maal_laset','beslutningseier_registrert','faglige_premisser_laset','miljorisiko_vurderes','budsjett_avklart','kapasitet_kartlagt','kompetansegap_identifisert','prioritering_utkast','restanser_synliggjort','ansvar_delegert','avvik_apent','alvorlighetsgrad_satt','tiltak_pagar','venter_pa_avklaring','lederoppfolging','etterkontroll','rework','lukket_med_rest_risiko','gjenapnet'],
    handoff_rule:'Neste aktør overtar synlig arbeidsgivermandat, beslutningseier, faglige premisser, miljørisiko, budsjett, bemanning, kapasitet, prioriterte og utsatte oppgaver, delegert ansvar, åpne avvik, tiltak, ventepunkt og neste eier; handoff kan aldri skape employer_appointment, skjule restanser eller gjøre lederens ønskede utfall til faglig evidens.'
  },
  rhythm_contract:{
    loop:'mål -> risiko -> kapasitet -> waiting/venting på faglig vurdering, budsjett, bemanning, compliance, toppledelsesbeslutning eller tiltak -> prioritering -> ansvar -> handoff -> oppfølging -> avvik -> etterkontroll -> revisjon/rework -> læring',
    waiting_states:WAITING,
    rework_rule:'Ny faglig risikovurdering, endret budsjett, bemanningsendring, nytt kompetansegap, compliance-avklaring, endret alvorlighetsgrad, svakere tiltakseffekt eller endret arbeidsgivermandat gjenåpner bare berørte prioriteringer, ansvar eller avvik med ny versjon og bevart begrunnelse.'
  },
  knowledge_dependencies:[{id:'history_go_natur_miljoledelse_sted_og_okologikontekst',badge_id:'natur',use:'History Go kan forbedre lederens kontrollspørsmål gjennom arter, steder, økologi og naturhistorie. Natur-badge er ikke employer_appointment, kan ikke erstatte feltdata eller avviksbevis, kan ikke gi personal-, budsjett- eller offentlig myndighet og kan ikke gjøre lederstatus til faglig evidens.'}],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:POLICY,first_object:PERSISTENT,first_task:'Bekreft employer_appointment og faktisk arbeidsgivermandat, registrer mål, beslutningseier, faglige premisser, miljørisiko, budsjett, bemanning, kompetanse, minst én eksplisitt restanse, delegert ansvar og neste kontrollpunkt før du lover leveranse; marker hva History Go ikke beviser eller gir myndighet til.'},
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
  schema:'civication_mail_plan_v1',version:1,id:'natur_miljoledelse_foundation_v1',category:CATEGORY,role_scope:ROLE,title:'Miljø- og naturledelse',
  description:'Seksten steg fra første mandat-, mål- og kapasitetsavklaring til etterprøvbar prioritering, avvikshåndtering, delegasjon, etterkontroll og organisatorisk læring.',
  arc:{from:'Nyutnevnt miljøleder som må lære at employer_appointment gir organisatorisk ansvar, ikke rett til å omskrive faglige funn eller gjøre kapasitet usynlig.',to:'En mandatklar leder som kan holde mål, miljørisiko, budsjett, bemanning, prioritering, avvik, tiltak og personaloppfølging adskilt og sporbare gjennom samme styringsforløp.',core_questions:['Hva er arbeidsgivermandatet, og hvilke faglige premisser kan ikke styres bort?','Hvilke oppgaver utsettes når kapasitet og miljørisiko faktisk sammenlignes?','Hvem eier tiltak, handoff og neste beslutning — og hva må vente før saken kan lukkes?']},
  outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated','miljoledelse_mandat_kapasitet_eller_integritetssvikt']}},
  sequence:sequenceTypes.map((type,i)=>({step:i+1,type,phase:i<3?'intro':i<10?'advanced':'mastery',step_goal:`Før ${PERSISTENT} gjennom ${type} med synlig arbeidsgivermandat, mål, miljørisiko, kapasitet, eksplisitte restanser, delegert ansvar, ventepunkt, handoff og etterkontroll.`,allowed_families:[FAMILY[type]],fallback_types:[]}))
};
write(PLAN, plan);

for (const type of TYPES) {
  const mails = seeds[type].map((seed,i)=>makeMail(type,seed,i));
  write(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`,{
    schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,
    families:[{id:FAMILY[type],purpose:`Trene ${type} gjennom ett versjonert leder- og avviksspor uten å blande arbeidsgivermandat, faglige funn, kapasitet, omdømme og offentlig myndighet.`,learning_focus:['mandat','miljorisiko','kapasitetsstyring','faglig_integritet','oppfolging'],mails}]
  });
}

fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,SOURCE),`# Natur / Miljøledelse — prerequisites source-first\n\n## Scope\n\nCanonical role: \`natur/natur_miljoledelse\`. This package materializes the playable Career/work foundation and is **not Role World completion**. The audience-bound realism layer remains reserved for the dedicated one-role rollout PR.\n\n## Career gates\n\n- **Naturvernleder** — \`appointment_required\` via \`employer_appointment\`.\n- **Miljøsjef** — \`appointment_required\` via \`employer_appointment\`.\n- **Miljødirektør** — \`appointment_required\` via \`employer_appointment\`.\n\nHistory Go and the Natur badge are learning support, not employer appointment, staff authority, budget authority, environmental evidence or legal authority.\n\n## Playable foundation\n\nThe package preserves the existing two management work loops and authority boundary, then adds four bounded work actors, four work surfaces, a persistent editorial object (\`${PERSISTENT}\`), seven explicit waiting states, handoff/rework, a 16-step plan and **15 source mails** across all nine canonical mail types. Mandate, goals, professional findings, environmental risk, budget, staffing, competence, capacity, priorities, explicit backlog, delegated responsibility, deviations, measures and follow-up remain separately traceable.\n\n## Authority\n\nThe role may lead inside a documented employer mandate, prioritize resources, delegate tasks, escalate environmental risk and follow up measures. It may not materialize leadership without employer_appointment, act as a minister, set law aside, suppress professional findings for reputation or use History Go/Natur-badge as appointment or evidence.\n\n## Cross-role\n\nReadiness says \`candidate_when_shared_work_is_real\`. This prerequisite package does not invent a shared-work link. A later governed cross-role object is allowed only if actual shared work and ownership are proved.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene engine. Existing Career gates, Scene Pipeline, mail machinery and audits remain canonical.\n`);

for (const person of model.related_people) {
  if (person.function.length < 220) throw new Error(`${person.id}: function depth ${person.function.length}`);
  if (person.authority_relation.length < 250) throw new Error(`${person.id}: authority depth ${person.authority_relation.length}`);
}
for (const place of model.related_places) if (place.function.length < 180) throw new Error(`${place.id}: place depth ${place.function.length}`);
for (const type of TYPES) {
  const catalog = read(`data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`);
  for (const mail of catalog.families.flatMap(f=>f.mails||[])) {
    if (mail.summary.length < 700) throw new Error(`${mail.id}: summary ${mail.summary.length}`);
    for (const choice of mail.choices) {
      if (choice.reply.length < 380) throw new Error(`${mail.id}/${choice.id}: reply ${choice.reply.length}`);
      if (choice.feedback.length < 430) throw new Error(`${mail.id}/${choice.id}: feedback ${choice.feedback.length}`);
    }
  }
}

console.log(JSON.stringify({role:ROLE,actors:ACTORS.length,places:PLACES.length,mail_types:TYPES.length,total_mails:Object.values(seeds).flat().length,persistent:PERSISTENT},null,2));
