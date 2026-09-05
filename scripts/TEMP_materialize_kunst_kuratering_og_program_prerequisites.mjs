import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value.endsWith('\n') ? value : `${value}\n`);
};
const exists = (rel) => fs.existsSync(path.join(root, rel));
const must = (condition, message) => { if (!condition) throw new Error(`PRECHECK: ${message}`); };

const CATEGORY = 'kunst';
const ROLE = 'kunst_kuratering_og_program';
const KEY = `${CATEGORY}/${ROLE}`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const MANIFEST = 'data/Civication/roleModels/manifest.json';
const BADGE = 'data/badges/kunst.json';
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_KUNST_KURATERING_OG_PROGRAM_PREREQUISITES_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'utstillingsprogram_research_utvalg_proveniens_rettighet_og_beslutningslogg';
const EXPECTED_LOOPS = [
  'spørsmål -> research -> utvalg -> begrunnelse -> kunstnerdialog -> produksjon -> publikumsrespons',
  'påstand -> kildekontroll -> tolkning -> motperspektiv -> tekst -> faglig kontroll'
];
const EXPECTED_AUTHORITY = {
  may: ['foreslå og begrunne utvalg','utvikle konsepter','forhandle faglige premisser innen mandat'],
  may_not: ['skjule interessekonflikter','garantere innkjøp eller salg uten fullmakt','endre proveniens uten dokumentasjon','framstille tolkning som ubestridt faktum']
};
const EXPECTED_POLICIES = {
  Kuratorassistent:{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  Kurator:{policy:'appointment_required',qualification_ids:['employer_appointment']},
  'Senior kurator':{policy:'appointment_required',qualification_ids:['employer_appointment']}
};
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

for (const rel of [MODEL, GRAMMAR, MANIFEST, BADGE]) must(exists(rel), `${rel} missing`);
must(!exists(PLAN), `${PLAN} already exists`);
for (const type of TYPES) must(!exists(catalogPath(type)), `${catalogPath(type)} already exists`);

const model = read(MODEL);
const grammar = read(GRAMMAR);
const manifest = read(MANIFEST);
const badge = read(BADGE);
must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(JSON.stringify(grammar.work_loops) === JSON.stringify(EXPECTED_LOOPS), 'curatorial work loops drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify(EXPECTED_AUTHORITY), 'curatorial authority boundary drifted');

const tierByLabel = Object.fromEntries(badge.tiers.map((tier) => [tier.label, tier]));
const assistantOffer = tierByLabel.Kuratorassistent?.career_offer;
const curatorTier = tierByLabel.Kurator;
const seniorOffer = tierByLabel['Senior kurator']?.career_offer;
must(assistantOffer?.policy === 'qualification_required', 'Kuratorassistent policy drifted');
must(JSON.stringify(assistantOffer?.qualification_ids) === JSON.stringify(['relevant_education_or_employer_qualification']), 'Kuratorassistent qualification drifted');
must(curatorTier?.life_position?.id === 'kuratorpraksis' && curatorTier.life_position.employment_independent === true, 'Kurator life position split drifted');
must(curatorTier?.career_unlock?.policy === 'appointment_required', 'Kurator career unlock policy drifted');
must(JSON.stringify(curatorTier?.career_unlock?.qualification_ids) === JSON.stringify(['employer_appointment']), 'Kurator appointment requirement drifted');
must(seniorOffer?.policy === 'appointment_required', 'Senior kurator policy drifted');
must(JSON.stringify(seniorOffer?.qualification_ids) === JSON.stringify(['employer_appointment']), 'Senior kurator appointment requirement drifted');

const people = [
  {
    id:'ingrid_senior_kurator_kunst_kuratering_og_program',name:'Ingrid',role:'senior kurator',workplace_ids:['research_og_kuratorisk_beslutningsrom'],
    function:'Ingrid gjør researchspørsmål, utvalgskriterier, kunsthistoriske kilder, motperspektiver og institusjonell beslutning til et synlig kuratorisk spor. Hun krever at det framgår hvilke verk og kunstnere som var kandidater, hvorfor noen ble valgt eller valgt bort, hva som er dokumentert fakta, hva som er kuratorisk tolkning, hvilke interesser som er deklarert og hvilken formell beslutning som fortsatt mangler før programmet kan presenteres som vedtatt.',
    authority_relation:'Ingrid kan foreslå og begrunne utvalg, utvikle konsepter og forhandle faglige premisser innen mandat, men kan ikke bruke seniorstatus til å garantere innkjøp eller salg, skjule interessekonflikter, omskrive proveniens eller attribusjon uten dokumentasjon eller gjøre sin tolkning til ubestridt faktum. Hun kan heller ikke gjøre Kurator-livspraksis, History Go eller et Kunst-Badge til employer_appointment.',
    fictional:true,fictional_scenario_actor:true,canonical_person_ref:null
  },
  {
    id:'malik_proveniens_rettighet_kunst_kuratering_og_program',name:'Malik',role:'registrar og proveniens-/rettighetskontakt',workplace_ids:['proveniens_rettighet_og_lanekontroll'],
    function:'Malik holder objektidentitet, proveniens, attribusjonsstatus, eierskapsspor, lånestatus, billed- og visningsrettigheter, samtykker og kildegrunnlag adskilt fra den kuratoriske lysten til å få et verk inn i fortellingen. Han markerer hva som er bekreftet, omstridt, uavklart eller under ekstern vurdering og gjør ventepunktet eksplisitt før tekst, avtale eller produksjon låser et usikkert premiss.',
    authority_relation:'Malik kan kreve dokumentasjon, flagge proveniens- og rettighetsusikkerhet og holde en handoff åpen, men kan ikke alene avgjøre juridisk eierskap, autentisere attribusjon, klarere alle rettigheter, godkjenne innkjøp eller salg eller gi kuratorisk ansettelsesmyndighet. Registreringsstatus, ekstern interesse og History Go er informasjonsgrunnlag, ikke juridisk eller kuratorisk vedtak.',
    fictional:true,fictional_scenario_actor:true,canonical_person_ref:null
  },
  {
    id:'sofia_kunstner_programdialog_kunst_kuratering_og_program',name:'Sofia',role:'kunstner- og programkoordinator',workplace_ids:['kunstnerdialog_og_programbord'],
    function:'Sofia gjør kunstnerdialog, invitasjoner, samtykker, praktiske premisser, programrytme og uenighet om kontekstualisering til et versjonert samarbeidsspor. Hun sørger for at kunstnerens egen posisjon siteres som kunstnerens posisjon, at kuratorisk tolkning merkes som tolkning, og at endringer i verk, tekst, rettighet eller tilgjengelighet får en eksplisitt eier og ikke forsvinner i muntlig koordinering.',
    authority_relation:'Sofia kan koordinere dialog og dokumentere hva partene faktisk har sagt eller avtalt innen sitt mandat, men kan ikke presse fram samtykke, love innkjøp, salg eller visning, avgjøre proveniens, overstyre rettighetshaver eller gjøre kunstnerens ønske til ubestridt kildefakta. Hun kan heller ikke ansette eller utnevne Kurator eller Senior kurator gjennom sosial standing eller prosjektansvar.',
    fictional:true,fictional_scenario_actor:true,canonical_person_ref:null
  },
  {
    id:'henrik_tekst_formidling_produksjon_kunst_kuratering_og_program',name:'Henrik',role:'redaktør og produksjonshandoff',workplace_ids:['tekst_formidling_og_produksjonshandoff'],
    function:'Henrik gjør veggtekst, katalogtekst, formidlingspremiss, produksjonsbehov, korrektur og publikumsrespons til et kontrollert handoff-spor. Han tester om påstander faktisk støttes av kildene, om tolkning er merket, om uavklart proveniens eller rettighet er synlig på riktig nivå, og om en sen korreksjon gjenåpner bare de berørte tekst-, utvalgs- og produksjonsfeltene.',
    authority_relation:'Henrik kan kreve kildehenvisning, skille fakta fra tolkning og stoppe publisering av en uunderbygd påstand, men kan ikke fatte det kuratoriske utvalgsvedtaket, avgjøre rettigheter eller proveniens, love kjøp eller salg, tildele budsjett eller delegasjon eller gjøre en vellykket publikumsrespons til employer_appointment eller faglig sannhetsbevis.',
    fictional:true,fictional_scenario_actor:true,canonical_person_ref:null
  }
];

const places = [
  {id:'research_og_kuratorisk_beslutningsrom',name:'Research- og kuratorisk beslutningsrom',workplace_type:'curatorial_research',function:'Her holdes researchspørsmål, kilder, kandidater, utvalgskriterier, motperspektiver, habilitet, programprofil, begrunnelse og formell beslutning i samme versjonerte spor uten at arbeidshypotese blir vedtak eller tolkning blir fakta.'},
  {id:'proveniens_rettighet_og_lanekontroll',name:'Proveniens-, rettighets- og lånekontroll',workplace_type:'provenance_rights_loans',function:'Her skilles dokumentert proveniens og attribusjon fra uavklarte ledd, og eierskapsspor, lånepremisser, samtykker og rettigheter registreres som egne avhengigheter før programmet lover mer enn grunnlaget tillater.'},
  {id:'kunstnerdialog_og_programbord',name:'Kunstnerdialog- og programbord',workplace_type:'artist_program_dialogue',function:'Her versjoneres kunstnerens posisjon, kuratorisk respons, invitasjon, programplassering, praktiske premisser, samtykke, uenighet og neste ansvarlige slik at relasjonelt press ikke kan omskrive hva som faktisk ble sagt eller besluttet.'},
  {id:'tekst_formidling_og_produksjonshandoff',name:'Tekst-, formidlings- og produksjonshandoff',workplace_type:'editorial_production_handoff',function:'Her kontrolleres påstander, kilder, tolkningsmarkører, representasjon, rettighetsstatus, korrektur, produksjonsbehov og publikumsrespons før tekst og program sendes videre, og senere korreksjoner kan gjenåpnes avgrenset.'}
];

const enrichedModel = {
  ...model,
  core_narrative:[
    ...model.core_narrative,
    'Rollen fører hvert utstillings- og programvalg gjennom en versjonert logg der researchspørsmål, kilder, kandidater, utvalgskriterier, proveniens og attribusjon, rettigheter og samtykker, habilitet, kunstnerdialog, institusjonell beslutning, tekstversjon, produksjonshandoff, publikumsrespons og korreksjon kan rekonstrueres. Kuratorisk standing, History Go eller en arbeidsuavhengig Kurator-livspraksis kan aldri erstatte dokumentasjon eller employer_appointment.'
  ],
  work_life:{
    daily_work:[
      'Formulerer researchspørsmål og registrerer kilder, kunstner- og verkskandidater, utvalgskriterier og motperspektiver før programutvalg låses.',
      'Skiller dokumentert fakta, uavklart proveniens eller attribusjon, kunstnerens egen posisjon og kuratorisk tolkning gjennom alle tekst- og beslutningsversjoner.',
      'Håndterer venting på kildekontroll, proveniens-/rettighetsavklaring, kunstnerrespons, låne- eller gjennomførbarhetsinput, habilitetsvurdering og formell beslutning med tydelig eier og handoff.',
      'Gjenåpner bare berørte utvalgs-, tekst-, rettighets- eller produksjonsfelt når ny kilde, konflikt, protest, rettighetsendring eller offentlig korreksjon endrer grunnlaget.'
    ],
    responsibilities:['sporbar research og kuratorisk begrunnelse','transparent utvalg, habilitet og representasjonsbevissthet','proveniens-, attribusjons- og rettighetsusikkerhet som eksplisitte premisser','kunstnerdialog, tekstlig etterprøvbarhet og korrigerbar produksjonshandoff'],
    work_environment:['museum, galleri, kunsthall, arkiv, atelierbesøk, låne- og rettighetsdialog, redaksjons- og produksjonsmøter'],
    status_position:['Kuratorisk standing kan gi tillit og større prosjektansvar, men kan aldri skape employer_appointment, juridisk rettighetsavklaring, proveniensbevis eller institusjonell fullmakt. Kurator som livspraksis er uttrykkelig separat fra Kurator som ansettelse.'],
    workplaces:places.map((p)=>p.id)
  },
  authority_boundaries:{
    can:['foreslå og begrunne kunstneriske utvalg','utvikle kuratoriske konsepter','forhandle faglige premisser innen mandat','bestille og syntetisere research innen ramme'],
    cannot:['garantere innkjøp eller salg uten fullmakt','endre proveniens eller attribusjon uten dokumentasjon','skjule interessekonflikter eller uavklarte rettigheter','framstille kuratorisk tolkning som objektivt eller ubestridt faktum']
  },
  career_path:{
    entry_from:['Kuratorassistent følger canonical `qualification_required` med relevant utdanning eller arbeidsgiverkvalifikasjon. Kurator og Senior kurator følger canonical `appointment_required` med `employer_appointment`. Den separate Kurator-livspraksisen er employment_independent og gir ingen ansettelsesrett.'],
    progression_to:['Videre kuratorisk ansvar følger dokumentert research, transparent utvalg, etisk og kildekritisk praksis og faktisk arbeidsgiverutnevnelse der tittelen krever det; badge, popularitet, nettverk eller livspraksis kan ikke erstatte canonical gate.'],
    possible_promotions:['Kuratorassistent kan gå mot Kurator først når faktisk `employer_appointment` foreligger; relevant praksis eller kvalifikasjon alene endrer ikke appointment-gaten.','Kurator kan få Senior kurator-ansvar først gjennom reell arbeidsgiverutnevnelse og dokumentert prosjekt-/fagansvar; standing eller vellykket program alene er ikke utnevnelse.'],
    possible_exits:['Research, redaksjon, kunstformidling eller programkoordinering der kildekritikk og kunstnerdialog beholdes uten at Kurator-tittel følger automatisk.','Samlings-, rettighets-, arkiv- eller produksjonsarbeid der deler av det kuratoriske kunnskapsgrunnlaget brukes uten at utvalgs- eller ansettelsesmyndighet følger med.'],
    career_risks:['Donor-, eier-, nettverks- eller prestisjepress kan gjøre det sosialt dyrt å holde habilitet, proveniensusikkerhet eller et upopulært motperspektiv synlig.','Sterk publikumsrespons eller kunstnerisk nærhet kan friste rollen til å behandle tolkning, samtykke, rettighet eller ansettelsesstatus som mer avklart enn dokumentasjonen viser.']
  },
  required_knowledge:{
    education_basis:['Kuratorassistent krever den canonicale relevante kvalifikasjonen. Kurator og Senior kurator krever faktisk `employer_appointment`. Kurator-livspraksis, History Go, Kunst-Badge, scenarioresultat eller sosial standing kan ikke oppfylle en employment gate.'],
    skills:['kunsthistorisk og samtidskunstfaglig research','kildekritikk og kildeproveniens','kuratorisk metode og utvalgskriterier','proveniens- og attribusjonsusikkerhet','rettigheter, samtykke og kunstnerdialog','habilitet og interessekonflikt','representasjonsanalyse og programprofil','tekst, kontekstualisering og tolkningsmarkering','låne- og gjennomførbarhetsinput uten myndighetsovertakelse','versjonert handoff, korrigering og avgrenset rework'],
    category_knowledge:['Kunsthistorie, samtidskunst, kunstner- og verkbiografi, utstillingshistorikk, institusjonshistorie, dokumentert proveniens og attribusjon, rettighets- og samtykkespørsmål, kuratoriske metoder og skillet mellom kildefakta, kunstnerposisjon, fortolkning og institusjonelt valg.'],
    history_go_badges:['kunst'],place_connections:places.map((p)=>p.id),people_connections:people.map((p)=>p.id),
    boundary:'History Go kan skjerpe kunsthistoriske spørsmål, verk- og kunstnerbiografi, utstillingshistorikk, kildekritikk og spørsmål om proveniens eller mottakelse, men kan ikke sertifisere proveniens eller attribusjon, klarere rettigheter eller samtykke, godkjenne innkjøp, salg eller utlån, fatte institusjonelt utvalgsvedtak, løse habilitet, gi budsjett eller delegasjon eller gjøre Kurator-livspraksis eller Kunst-Badge til `employer_appointment`.'
  },
  authority_boundary:EXPECTED_AUTHORITY,
  challenges:[{id:'sporbar_kuratering_under_prestisje_og_nettverkspress',title:'Sporbar kuratering under prestisje- og nettverkspress',description:'Kurateringsteamet må holde kilder, utvalgskriterier, proveniens- og attribusjonsusikkerhet, rettigheter, habilitet, kunstnerdialog, representasjon og beslutningseier synlig selv når donor, eier, nettverk, pressefrist eller en sterk kuratorisk fortelling belønner rask lukking.',pressure:'prestisje_nettverk_og_frist_vs_sporbar_begrunnelse',affects:['quality','trust','risk']}],
  dilemmas:[{id:'hovedverk_med_uavklart_proveniens_og_press',title:'Hovedverk med uavklart proveniens og press',setup:'Et verk passer svært godt i utstillingsfortellingen, men et viktig proveniensledd og deler av rettighetsgrunnlaget er uavklart samtidig som en støttespiller forventer at verket inkluderes.',choice_axis:'sporbar_usikkerhet_og_habilitet_vs_narrativ_og_prestisje',consequence_axis:'etterprovbar_legitimitet_vs_senere_korrigering_og_tillitstap',mail_hooks:TYPES}],
  related_people:people,
  related_places:places
};

const enrichedGrammar = {
  ...grammar,
  actor_grammar:people.map(({id,name,role,workplace_ids})=>({id,name,role,workplace_ids})),
  place_grammar:places.map(({id,name,function})=>({id,name,function})),
  persistent_work_object_contract:{
    id:PERSISTENT,
    description:'Et vedvarende, versjonert utstillings- og programobjekt som beholder researchspørsmål og kilder, kunstner- og verkskandidater, utvalgskriterier, dokumentert fakta versus tolkning, proveniens og attribusjonsstatus, rettigheter og samtykker, habilitet og interesser, kunstnerdialog, låne- og gjennomførbarhetsinput, institusjonell beslutning og eier, tekstversjoner, produksjonshandoff, publikumsrespons, ventepunkt og avgrenset rework gjennom samme kuratoriske sak.',
    states:['researchsporsmal_og_kildekart','kandidatliste','utvalgskriterier_og_motperspektiv','proveniens_attribusjon_og_rettighetskontroll','habilitet_og_interesseerklæring','kunstnerdialog','venter_pa_kilde_proveniens_eller_rettighet','venter_pa_kunstner_eller_lanegiver','kuratorisk_anbefaling','venter_pa_formell_beslutning','tekst_og_kontekstversjon','produksjonshandoff','publisert_program','publikumsrespons_og_kritikk','revisjon','gjenapnet'],
    handoff_rule:'Neste aktør overtar synlig siste godkjente versjon med researchspørsmål, kilder, utvalgskriterier, kandidatstatus, proveniens/attribusjon, rettigheter/samtykke, habilitet, kunstnerdialog, beslutningseier, tekstversjon, ventepunkt og eksplisitt neste ansvarlige. Ingen muntlig nettverksfordel, donorforventning, kunstnernærhet eller kuratorisk standing får skjule uavklart grunnlag eller gjøre anbefaling til vedtak.',
    rework_rule:'Ny kilde, korrigert proveniens eller attribusjon, endret rettighets- eller samtykkestatus, deklarert interessekonflikt, kunstnerprotest, låne-/gjennomførbarhetsendring eller dokumentert offentlig feil gjenåpner bare berørte utvalgs-, tekst-, avtale- og produksjonsfelt. Tidligere versjoner beholdes slik at hva institusjonen visste, tolket, anbefalte og besluttet kan rekonstrueres.'
  },
  rhythm_contract:{
    loop:'question/research -> documented selection rationale -> waiting/handoff -> dialogue/decision -> text/production -> public response -> bounded rework',
    waiting_states:['venter_pa_kildekontroll','venter_pa_proveniens_eller_attribusjonsvurdering','venter_pa_rettighet_eller_samtykke','venter_pa_kunstner_eller_lanegiver','venter_pa_habilitetsavklaring','venter_pa_formell_beslutning_eller_employer_appointment'],
    handoff_points:['research_til_utvalg','utvalg_til_proveniens_rettighet','faglig_anbefaling_til_formell_beslutning','beslutning_til_tekst_og_produksjon','publisering_til_respons_og_korreksjon'],
    rework_rule:'Rework skal være avgrenset til feltene som faktisk rammes av ny kilde, proveniens-/attribusjonsendring, rettighet/samtykke, habilitet, kunstnerdialog, låne-/produksjonsinput eller dokumentert feil; tidligere utvalgs-, tekst- og beslutningsversjoner skal ikke slettes.'
  },
  knowledge_dependencies:[{id:'history_go_kunst_kunsthistorie_kildekritikk_og_utstillingshistorikk',badge_id:'kunst',use:'History Go kan styrke kunsthistorisk kontekst, verk- og kunstnerbiografi, utstillingshistorikk og kildekritikk, men kan ikke sertifisere proveniens/attribusjon, klarere rettigheter/samtykke, vedta innkjøp/salg/utlån, løse habilitet, gi budsjett/delegasjon eller skape `employer_appointment` for Kurator eller Senior kurator.'}],
  day_one_contract:{entry:'career_offer_policy_by_title',entry_policy_by_title:EXPECTED_POLICIES,first_object:PERSISTENT,first_task:'Opprett første versjon med researchspørsmål, kilder, kandidater, utvalgskriterier, fakta/tolkning, proveniens/attribusjon, rettighet/samtykke, habilitet, kunstnerdialog, beslutningseier, ventepunkt og neste ansvarlige. Marker eksplisitt at Kurator-livspraksis, History Go, Kunst-Badge og sosial standing ikke kan erstatte `qualification_required` eller `employer_appointment`.'},
  mail_generation_contract:{required_mail_types:TYPES,role_scope:ROLE,no_generic_fallback:true}
};

const familyIds = {
  job:`${ROLE}_kuratorisk_saksarbeid`,people:`${ROLE}_faglige_relasjoner`,conflict:`${ROLE}_habilitet_utvalg_og_institusjonelt_press`,story:`${ROLE}_tolkning_kunstnerdialog_og_ansvar`,event:`${ROLE}_ny_kilde_proveniens_eller_rettighetsendring`,micro:`${ROLE}_rask_kilde_og_handoff_sjekk`,followup:`${ROLE}_korrigering_og_rework`,knowledge:`${ROLE}_history_go_kunsthistorie_og_kildekritikk`,consequence:`${ROLE}_senere_kritikk_og_sporbarhet`
};
const cases = {
  job:[
    ['uavklart_proveniens_hovedverk','Malik',people[1].id,places[1].id,'Hovedverket har et uavklart proveniensledd','Et sentralt verk styrker konseptet, men et viktig proveniensledd og attribusjonsgrunnlag er fortsatt uavklart før utvalget kan låses.'],
    ['donoronske_utvalg','Ingrid',people[0].id,places[0].id,'En støttespiller forventer et bestemt verk','En sentral støttespiller forventer at et verk inkluderes, men den aktive begrunnelsen viser at ønsket ikke følger de dokumenterte utvalgskriteriene.'],
    ['kunstneruenighet_tekst','Sofia',people[2].id,places[2].id,'Kunstneren bestrider kontekstualiseringen','Kunstneren mener veggteksten blander deres egen posisjon med institusjonens tolkning og krever at skillet blir synlig før publisering.'],
    ['smalt_nettverk_program','Ingrid',people[0].id,places[0].id,'Shortlisten gjentar det samme nettverket','Researchloggen viser høy faglig kvalitet i enkeltsakene, men også at kandidater og kilder over tid rekrutteres fra et svært smalt nettverk som påvirker programprofilen.']
  ],
  people:[
    ['seniorstatus_og_utnevnelse','Ingrid',people[0].id,places[0].id,'Seniorstatus er ikke en ansettelsesgate','Teamet må skille faglig standing og senior veiledning fra den faktiske arbeidsgiverutnevnelsen som Kurator- og Senior kurator-titlene krever.'],
    ['registrar_og_kuratorisk_press','Malik',people[1].id,places[1].id,'Registraren holder usikkerheten åpen','Malik nekter å gjøre en foreløpig proveniensoppføring mer sikker bare fordi verket er kuratorisk attraktivt og produksjonen trenger et ja.'],
    ['kunstnerdialog_og_samtykke','Sofia',people[2].id,places[2].id,'God relasjon er ikke samtykke','Sofia minner om at en varm kunstnerdialog ikke automatisk betyr samtykke til ny bruk, ny tekst eller alle rettigheter programmet ønsker.'],
    ['redaktor_og_korreksjon','Henrik',people[3].id,places[3].id,'Redaktøren vil bevare den gamle tekstversjonen','Henrik oppdager at en kilde er feilsitert og krever en korrigert tekstversjon som bevarer hva som tidligere sto og hvilke programfelt endringen faktisk påvirker.']
  ],
  conflict:[['habilitet_og_eierpress','Ingrid',people[0].id,places[0].id,'En nær relasjon skaper habilitetspress','En aktør med nær relasjon til beslutningsmiljøet presser på for en kunstner som ikke kan begrunnes uten at interessekonflikten og utvalgskriteriene synliggjøres.']],
  story:[['kunstnerposisjon_vs_tolkning','Sofia',people[2].id,places[2].id,'To ulike fortellinger må få stå side om side','Kunstnerens egen lesning og institusjonens kuratoriske tolkning trekker i ulike retninger, og saken må vise hvem som hevder hva uten å gjøre uenigheten til en faktakonflikt som kan slettes.']],
  event:[['ny_kilde_endrer_attribusjon','Malik',people[1].id,places[1].id,'En ny kilde endrer attribusjonsgrunnlaget','En ny dokumentkilde svekker et premiss i attribusjonen etter at utvalg og tekst er langt kommet, slik at bare de avhengige feltene må gjenåpnes og tidligere versjon beholdes.']],
  micro:[['hurtigsjekk_for_handoff','Henrik',people[3].id,places[3].id,'Fem felt før produksjonshandoff','Før tekst og program sendes videre må du raskt kontrollere kilde, tolkningsmarkør, proveniens/rettighet, beslutningseier og eksplisitt ventepunkt i den aktive versjonen.']],
  followup:[['korrigering_etter_kritikk','Henrik',people[3].id,places[3].id,'Kritikken avdekker en dokumenterbar feil','Etter publisering peker kritikk på en faktisk feil i en kildehenvisning; korreksjonen må være synlig uten å omskrive hele den kuratoriske historien eller skjule den tidligere versjonen.']],
  knowledge:[['history_go_grense','Ingrid',people[0].id,places[0].id,'History Go skjerper spørsmålet, ikke myndigheten','History Go gir relevant kunsthistorisk kontekst og utstillingshistorikk, men teamet må vise eksplisitt at dette ikke sertifiserer proveniens, klarerer rettigheter eller skaper employer_appointment.']],
  consequence:[['senere_sporbarhet','Malik',people[1].id,places[1].id,'Et gammelt utvalg blir etterprøvd','Måneder senere blir institusjonen bedt om å forklare hvorfor et verk ble valgt, hva man visste om proveniens og rettighet, hvilke interesser som var deklarert og hvem som faktisk fattet beslutningen.']]
};

const commonSummary = (specific) => `${specific} ${PERSISTENT} må oppdateres slik at researchspørsmål og kilder, kunstner- og verkskandidater, utvalgskriterier og motperspektiver, dokumentert fakta versus kuratorisk tolkning, proveniens og attribusjonsstatus, rettigheter og samtykker, habilitet og interesser, kunstnerdialog, låne- og gjennomførbarhetsinput, institusjonell beslutning og beslutningseier, tekstversjon, produksjonshandoff, publikumsrespons, ventepunkt og neste ansvarlige fortsatt kan rekonstrueres. Kuratorisk prestisje, donorpress, kunstnernærhet, History Go, Kunst-Badge eller den arbeidsuavhengige Kurator-livspraksisen kan ikke sertifisere proveniens eller attribusjon, klarere rettigheter, love innkjøp eller salg, gjøre en anbefaling til institusjonelt vedtak eller skape employer_appointment. Valget må bevare skillet mellom kildefakta, kunstnerens posisjon, kuratorisk tolkning og formell beslutning, og bare gjenåpne de delene av utvalgs-, tekst-, rettighets- eller produksjonssporet som ny informasjon faktisk berører.`;
const situation = [
  `Den aktive versjonen av ${PERSISTENT} viser kilder, kandidater, utvalgskriterier, fakta/tolkning, proveniens/attribusjon, rettighet/samtykke, habilitet, kunstnerdialog, beslutning, tekst, venting og neste ansvarlige før valget tas.`,
  'En sosialt, kunstnerisk eller produksjonsmessig enklere løsning kan gi rask framdrift, men vil gjøre begrunnelse, rettighetsgrunnlag, beslutningseier eller senere korreksjon vanskeligere å rekonstruere.',
  'Du må bevare de canonicale Career-gatene og myndighetsgrensen: Kurator-livspraksis er ikke ansettelse, og ingen badge, relasjon eller prosjektprestasjon kan erstatte qualification_required eller employer_appointment.'
];
const positiveReply = (label) => `Jeg velger å ${label.toLowerCase()}. Jeg oppdaterer bare berørte felt i ${PERSISTENT}, beholder tidligere versjon og uavklart informasjon synlig, skiller dokumentert kildefakta fra kunstnerposisjon og kuratorisk tolkning, og setter eksplisitt neste eier, ventepunkt og hvilken kilde, proveniens-/rettighetsavklaring, habilitetsvurdering, formell beslutning eller arbeidsgiverutnevnelse som fortsatt mangler.`;
const negativeReply = (label) => `Jeg velger å ${label.toLowerCase()}. Jeg lar prestisje, nettverk, fortellingskraft eller produksjonsfrist veie tyngre enn det versjonerte kilde-, proveniens-, rettighets-, habilitets- og beslutningssporet og sender saken videre uten å gjøre usikkerhet, tolkning, formell eier eller canonical Career-gate tydelig nok for neste aktør.`;
const positiveFeedback = 'Dette kan forsinke utvalg, avtale, tekst eller produksjon, men neste aktør kan se hva som faktisk er dokumentert, hva som bare er tolkning, hvilke interesser og rettigheter som fortsatt er åpne, hvem som eier beslutningen og hva som må skje før handoff. Det beskytter etterprøvbarhet og korrigerbarhet uten å gi History Go, Kunst-Badge, sosial standing eller Kurator-livspraksis en arbeidsgiver-, rettighets-, proveniens- eller innkjøpsmyndighet de ikke har.';
const negativeFeedback = 'Saken ser enklere og mer ferdig ut lokalt, men arbeidsobjektet mister et vesentlig skille mellom kilde, tolkning, kunstnerposisjon, proveniens, rettighet, habilitet og formelt vedtak. Senere kritikk, ny kilde, kunstnerprotest, rettighetskrav eller intern kontroll kan da gjøre både utvalgsbegrunnelsen og institusjonens ansvar vanskeligere å rekonstruere og korrigere uten større rework.';
const labels = {
  job:['Hold usikkerheten åpen og dokumenter neste kontrollpunkt','Deklarer presset og bruk de åpne utvalgskriteriene','Skill kunstnerposisjon fra kuratorisk tolkning','Undersøk strukturene bak shortlisten før den låses'],
  people:['Skill standing fra faktisk employer_appointment','Behold proveniensusikkerheten i handoffen','Dokumenter hva som faktisk er samtykket til','Korriger bare berørte tekst- og programfelt'],
  conflict:['Deklarer relasjonen og krev sporbar utvalgsbegrunnelse'],story:['La posisjonene stå tydelig attribuert side om side'],event:['Gjenåpne attribusjonsavhengige felt og behold historikken'],micro:['Kontroller de fem handoff-feltene før publisering'],followup:['Publiser en sporbar korreksjon med tidligere versjon bevart'],knowledge:['Bruk History Go til kildekritikk og behold myndighetsgrensen'],consequence:['Rekonstruer beslutningen fra den versjonerte loggen']
};
const badLabels = {
  job:['Ta verket inn fordi konseptet trenger det','La støttespillerens forventning avgjøre','Glatt over uenigheten i én institusjonell stemme','Lås shortlisten uten å undersøke nettverkseffekten'],
  people:['Behandle senior standing som om den ga utnevnelse','Gjør registreringen sikrere enn kildene tillater','Tolk god relasjon som generelt samtykke','Overskriv den gamle teksten uten versjonsspor'],
  conflict:['Hold relasjonen uformell og gå videre med utvalget'],story:['Skriv institusjonens tolkning som om kunstneren delte den'],event:['Endre attribusjonen i sluttproduktet uten å bevare avhengigheter'],micro:['Send videre fordi produksjonen kjenner saken muntlig'],followup:['Rett feilen stille uten å bevare tidligere versjon'],knowledge:['Bruk badgekunnskap som om den klarerte proveniens og rolle'],consequence:['Forklar i ettertid fra hukommelse og sosial standing']
};

for (const type of TYPES) {
  const entries = cases[type];
  const mails = entries.map((entry,index)=>{
    const [slug,from,people_ref,place_id,subject,specific] = entry;
    return {
      id:`${ROLE}_${type}_${slug}_${String(index+1).padStart(3,'0')}`,mail_type:type,mail_family:familyIds[type],role_scope:ROLE,
      phase:type === 'knowledge' ? 'intro' : (['job','people'].includes(type) && index === 0 ? 'intro' : (['followup','story','consequence'].includes(type) ? 'mastery' : 'advanced')),
      priority:140-index,from,people_ref,place_id,subject,summary:commonSummary(specific),situation,
      task_domain:'kunstkuratering_og_utstillingsprogram',competency:'research_utvalg_kildekritikk_habilitet_rettighet_og_sporbar_beslutning',
      pressure:'prestisje_nettverk_og_frist_vs_kilde_habilitet_rettighet_og_sporbar_begrunnelse',choice_axis:'sporbar_begrunnelse_vs_rask_narrativ_lukking',consequence_axis:'etterprovbar_legitimitet_vs_senere_korreksjon_og_tillitstap',narrative_arc:slug,
      choices:[
        {id:'A',label:labels[type][index],reply:positiveReply(labels[type][index]),effect:1,tags:['sporbarhet','kildekritikk','habilitet','revisjon'],feedback:positiveFeedback,effects:{stats:{quality:2,trust:2,risk:-2,energy:-1}}},
        {id:'B',label:badLabels[type][index],reply:negativeReply(badLabels[type][index]),effect:-1,tags:['lukking','prestisje','usikkerhet','risiko'],feedback:negativeFeedback,effects:{stats:{status:1,quality:-2,trust:-2,risk:3}}}
      ]
    };
  });
  write(catalogPath(type),{schema:'civication_mail_family_catalog_v1',version:1,category:CATEGORY,role_scope:ROLE,mail_type:type,families:[{id:familyIds[type],purpose:`Trene ${type} gjennom ${PERSISTENT} med research-, utvalgs-, proveniens-, rettighets-, habilitets-, Career- og handoff-grenser.`,learning_focus:['kildekritikk','kuratorisk_begrunnelse','habilitet_og_rettighet','sporbar_handoff'],mails}]});
}

const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const phaseFor = (i) => i < 3 ? 'intro' : i < 10 ? 'advanced' : 'mastery';
const plan = {
  schema:'civication_mail_plan_v1',version:1,id:`${ROLE}_foundation_v1`,category:CATEGORY,role_scope:ROLE,title:'Kuratering og utstillingsprogram',
  description:`Seksten steg fra researchspørsmål og kandidater til utvalg, proveniens/rettighet, kunstnerdialog, beslutning, tekst, produksjon, publikumsrespons og avgrenset rework i samme ${PERSISTENT}.`,
  arc:{from:'Kuratorisk medarbeider som møter sterke verk, kunstnere, kilder og institusjonelle forventninger med ulik dokumentasjonsstyrke og uklare beslutningsgrenser.',to:'Rolleutøver som kan holde kildefakta, kunstnerposisjon, kuratorisk tolkning, proveniens/rettighet, habilitet, formelt vedtak og Career-gate adskilt og sporbar gjennom venting, handoff og rework.',core_questions:['Hva er dokumentert kildefakta, hva er kunstnerens posisjon, og hva er kuratorisk tolkning?','Hvilken proveniens-, rettighets-, habilitets- eller formell beslutningsavklaring mangler før neste handoff?','Når skal ny kilde eller kritikk gjenåpne bare den berørte delen av utvalg, tekst eller produksjon?']},
  outcome_rules:{promoted:{completion_ratio_gte:1,score_gte:2,strikes_lte:0},fired:{stability_values:['FIRED'],strikes_gte:3,score_lte:-3},stagnated:{autonomy_delta:-10,stability:'STAGNATED',add_branch_flags:['career_stagnated',`${ROLE}_kilde_habilitet_og_sporbarhetssvikt`]}},
  sequence:sequenceTypes.map((type,i)=>({step:i+1,type,phase:phaseFor(i),step_goal:`Før ${PERSISTENT} gjennom ${type} med synlig research, kilde/tolkning, utvalg, proveniens/rettighet, habilitet, beslutningseier, Career-gate, ventepunkt, handoff og avgrenset rework.`,allowed_families:[familyIds[type]],fallback_types:[]}))
};

if (!manifest.files.includes(MODEL)) manifest.files.push(MODEL);
manifest.files.sort();
write(MODEL,enrichedModel);
write(GRAMMAR,enrichedGrammar);
write(MANIFEST,manifest);
write(PLAN,plan);

const source = `# Kunst / Kuratering og program — prerequisites source-first\n\n## Scope lock\nThis package completes only the prerequisite foundation required before a dedicated Role World. It is **not Role World completion** and does not author situated reputation. No new runtime is introduced.\n\n## Canonical Career split\n- Kuratorassistent: \`qualification_required\` with \`relevant_education_or_employer_qualification\`.\n- Kurator: the badge retains the separate employment-independent \`kuratorpraksis\` life position, while the Career unlock remains \`appointment_required\` with \`employer_appointment\`.\n- Senior kurator: \`appointment_required\` with \`employer_appointment\`.\n- History Go, Kunst Badge, standing and the Kurator life position cannot convert themselves into employment appointment.\n\n## Preserved authority and work grammar\nThe two existing kuratorial work loops and the exact work-grammar authority boundary are preserved. The new persistent object is \`${PERSISTENT}\`, with explicit waiting, handoff and bounded rework.\n\n## People and places\nFour fictional scenario actors and four role-owned work surfaces cover research/selection, provenance-rights-loans, artist/program dialogue and editorial/production handoff. No canonical person is implied.\n\n## Mail provenance\n15 source mails across all nine required types are materialized: 4 job, 4 people, and one conflict, story, event, micro, followup, knowledge and consequence mail. The deterministic plan has 16 steps and no generic fallback.\n\n## History Go boundary\nHistory Go may strengthen art-history context, artist/work biography, exhibition history and source criticism. It cannot certify provenance or attribution, clear rights or consent, approve acquisition/sale/loan, resolve conflicts of interest, make institutional selections, grant budget/delegation or create \`employer_appointment\`.\n\n## Cross-role quarantine\nReadiness marks this role \`candidate_when_shared_work_is_real\`. This prerequisite package does not materialize a cross-role link. A later link requires a genuinely shared work object with the same ID, version, owner and handoff contract; adjacency to conservation, production, collection management or artistic leadership is insufficient.\n\n## Verification target\nThe focused prerequisite test proves the exact Career split, 15 source mails, four fictional people, four work surfaces, persistent-work continuity, all nine mail types, no generic fallback, no new runtime and readiness reduction to only \`situated_reputation\`.\n`;
writeText(SOURCE,source);
console.log(`Materialized prerequisites for ${KEY}`);
