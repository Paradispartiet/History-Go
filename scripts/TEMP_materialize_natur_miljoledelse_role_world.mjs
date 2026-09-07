import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CATEGORY = 'natur';
const ROLE = 'natur_miljoledelse';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const SOURCE = 'reports/CIVICATION_NATUR_MILJOLEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const THEMES = ['professional_culture','bureaucratic_power','numerical_control','loyalty_up_down','care_vs_efficiency','shame_reputation','invisible_work','status_anxiety','public_private_leakage','class_power'];
const PERSISTENT = 'mandat_maal_risiko_kapasitet_prioritering_ansvar_avvik_tiltak_og_oppfolgingslogg';
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
if (canonicalRefs.length !== 15 || new Set(canonicalRefs).size !== 15) throw new Error(`Expected 15 unique canonical mail refs, got ${canonicalRefs.length}`);

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
if (plan.sequence.length !== 16) throw new Error('Miljøledelse prerequisite plan drifted from 16 steps');
if (grammar.persistent_work_object_contract?.id !== PERSISTENT) throw new Error('Persistent work object drift');

const audiences = [
  {
    id:'fag_og_kvalitet', axis:'faglig_integritet_og_uavhengighet_standing',
    cares:['at dokumenterte miljøfaglige funn står uendret når ledelsen prioriterer','at faglig uenighet, metodegrense og restusikkerhet kan sies tidlig uten sosial straff'],
    cannot:'Standing hos fag- og kvalitetsmiljøet kan ikke gi employer_appointment, utvide personal- eller budsjettfullmakt, gjøre lederstatus til faglig evidens eller la popularitet erstatte dokumenterte funn. Den kan ikke gi juridisk hjemmel, delegasjon eller offentlig myndighet, kan ikke gjøre History Go eller Natur-badge til feltdata, HMS-/avviksbevis eller kvalifikasjon, og kan ikke gjøre Naturvernleder, Miljøsjef eller Miljødirektør til en annen rolle enn arbeidsgiver faktisk har utnevnt. Høy tillit kan gjøre vanskelige faglige beskjeder lettere å motta, men kan ikke endre hva data viser, lukke et miljøavvik uten kontroll eller gjøre et lederønske til et formelt vedtak.'
  },
  {
    id:'okonomi_kapasitet_og_portefolje', axis:'kapasitets_og_prioriteringssannhet_standing',
    cares:['at budsjett, bemanning, kompetanse og restanser blir sammenlignbare før prioritering','at det som velges bort navngis med konsekvens, eier og reell rest-risiko'],
    cannot:'Standing hos økonomi-, kapasitet- og porteføljemiljøet kan ikke gi employer_appointment, budsjettfullmakt utover faktisk delegasjon eller rett til å bruke tall som faglig evidens for lav miljørisiko. Den kan ikke gjøre History Go eller Natur-badge til økonomisk hjemmel, feltdata, avviksbevis eller beslutningsmyndighet, og den kan ikke overstyre lov, dokumenterte miljøfunn eller arbeidsgivers formelle mandat. En leder kan være kjent som leveransedyktig og fortsatt mangle kapasitet; sosial tillit kan derfor aldri brukes til å skjule restanser, uholdbar belastning eller beslutninger som krever et annet nivå.'
  },
  {
    id:'miljorisiko_avvik_og_etterlevelse', axis:'avviks_og_etterlevelsesstanding',
    cares:['at alvorlighetsgrad, skadebegrensning, varsling og etterkontroll følger det dokumenterte avviket','at omdømme og leveransepress aldri reduserer risikovurderingen eller lukker kontrollsporet for tidlig'],
    cannot:'Standing hos miljøavvik-, HMS-, compliance- eller etterlevelsesmiljøet kan ikke gi employer_appointment, offentlig myndighet, juridisk hjemmel eller rett til å erklære et avvik lukket uten den kontrollen som faktisk kreves. Den kan ikke gjøre lederstatus, tidligere suksess, History Go eller Natur-badge til evidens for at skade er begrenset, at tiltak virker eller at varsling kan utelates. Tillit kan gi bedre samarbeid under press, men kan ikke endre lovkrav, delegasjon, faktagrunnlag eller gjøre Miljøsjefens ønskede kommunikasjon til et vedtak om faktisk risiko.'
  },
  {
    id:'medarbeidere_og_lederlinje', axis:'rettferdig_delegering_og_psykologisk_trygghet_standing',
    cares:['at ansvar, kompetansegrense, arbeidsbelastning og støtte følger hverandre i faktisk delegasjon','at medarbeidere kan melde usikkerhet, restanser og dårlige nyheter uten at ledermakt blir faglig press'],
    cannot:'Standing hos medarbeidere og i lederlinjen kan ikke gi employer_appointment eller gjøre relasjonell lojalitet til personalfullmakt, faglig evidens, budsjettmyndighet eller juridisk hjemmel. Den kan ikke gjøre History Go eller Natur-badge til dokumentasjon på kompetansedekning, og den kan ikke tillate at en leder bruker høy sosial tillit til å delegere ansvar uten kapasitet, tie et miljøfaglig avvik eller forskuttere et vedtak. God standing kan gjøre teamet mer villig til å si fra; den kan aldri erstatte arbeidsrettslige, faglige eller organisatoriske grenser.'
  },
  {
    id:'toppledelse_og_virksomhetsstyring', axis:'darlige_nyheter_og_mandatklar_ledelsesstanding',
    cares:['at toppledelsen får et sant bilde av målkonflikt, miljørisiko, kapasitet og konsekvens før beslutning','at lederen skiller hva hun kan prioritere selv fra hva som krever ny fullmakt eller høyere beslutning'],
    cannot:'Standing hos toppledelse og virksomhetsstyring kan ikke i seg selv gi employer_appointment, ny delegasjon, offentlig myndighet eller rett til å endre faglige funn. Den kan ikke gjøre et godt omdømme, en grønn statusrapport, History Go eller Natur-badge til evidens for miljøtilstand, etterlevelse eller kontroll. Selv sterk tillit oppover kan ikke sette lov til side, gjøre Naturvernleder, Miljøsjef eller Miljødirektør til statsråd, eller omgjøre et råd eller en intern prioritering til et vedtak som et annet organ faktisk eier.'
  },
  {
    id:'lederkolleger_og_tverrfaglige_partnere', axis:'handoff_og_tverrfaglig_tillit_standing',
    cares:['at handoff viser mandat, faglige premisser, åpne restanser, tiltak og neste eier uten pyntet status','at tverrfaglige kolleger kan stole på hva miljøledelsen faktisk vet, ikke vet og har besluttet'],
    cannot:'Standing hos lederkolleger og tverrfaglige partnere kan ikke gi employer_appointment, delegasjon, juridisk hjemmel eller rett til å overta andre profesjoners eller myndigheters beslutninger. Den kan ikke gjøre History Go eller Natur-badge til feltdata, avviksbevis eller generell ekspertstatus, og den kan ikke gjøre kollegial enighet til faglig evidens. Høy peer-tillit kan redusere friksjon i handoff, men kan ikke legitimere skjulte restanser, uavklarte eierskap eller et miljøfaglig funn som er justert for å passe virksomhetens ønskede fortelling.'
  },
  {
    id:'private_relations', axis:'privat_rolleavgrensning_og_naervaer_standing',
    cares:['at lederens beredskap, ansvarsspråk og behov for kontroll kan legges bort hjemme','at personlig verdi ikke blir gjort avhengig av organisatorisk gjennomslag, rang eller om miljøledelsen blir hørt'],
    cannot:'Standing i private relasjoner kan ikke gi employer_appointment, personal- eller budsjettfullmakt, faglig evidens, juridisk hjemmel, delegasjon eller offentlig myndighet. Den kan heller ikke gjøre History Go eller Natur-badge til bevis for at arbeidssaken er løst. En nær relasjon kan hjelpe lederen å se kostnaden av konstant beredskap, men kan ikke være uformell kontrollinstans, motta konfidensielle saksdetaljer som ikke skal deles, eller gjøre privat støtte til et vedtak om miljørisiko, bemanning eller virksomhetsprioritering.'
  }
];

const archetypes = [
  {
    id:'eva_fag_og_kvalitetsleder_world', social_function:'Eva gjør faglig integritet sosialt synlig når miljøfunn, metodegrenser eller alvorlige reservasjoner kolliderer med ledergruppens ønskede tempo og fortelling.', class_position:'Fag- og kvalitetsleder med høy kunnskaps- og kontrollmakt i miljøfaglige spørsmål, men uten arbeidsgivermandat til å materialisere spillerens lederrolle eller overta virksomhetsbeslutninger.', status:'Høy situert faglig standing når hun kan stole på at ledelsen ikke omskriver ubehagelige funn.', power_over_player:'Kan kreve kvalitetssikring, rework og eksplisitt faglig avvik, men kan ikke tildele employer_appointment, budsjettfullmakt eller offentlig myndighet.', wants:'At ledelsen bruker faglige funn som premiss for styring uten å gjøre styringsbehov til premiss for funnet.', conceals:'At også hun kjenner statuspress når et presist faglig forbehold gjør organisasjonen mindre beslutningsklar.', speech_style:'Presis, lavmælt og premissbevisst; spør hva som faktisk er dokumentert, hva som er usikkert og hva ledelsen bare ønsker skal være sant.', teaches_player:'At faglig tillit til en leder bygges når dårlige nyheter tåler å stå uendret.'
  },
  {
    id:'jonas_okonomi_kapasitet_world', social_function:'Jonas gjør budsjett, faktisk kapasitet, kompetansedekning og restanser synlige når alle mål ikke kan leveres samtidig.', class_position:'Controller med høy tall- og porteføljemakt, men uten mandat til å gjøre økonomi til miljøfaglig evidens.', status:'Høy situert styringstillit når prioriteringskostnaden er eksplisitt.', power_over_player:'Kan utfordre planer som ikke går opp og synliggjøre økonomiske konsekvenser, men kan ikke overstyre miljøfunn eller tildele ny fullmakt.', wants:'En portefølje der prioritering betyr reelle valg, ikke bare mer skjult arbeid.', conceals:'At tallformatet kan gjøre menneskelig belastning og faglig usikkerhet mindre synlig enn de fortjener.', speech_style:'Kort og analytisk; spør hva som flyttes, hva som faller bort, og hvilken kapasitet antakelsen faktisk bygger på.', teaches_player:'At kapasitetsstanding skapes ved å vise restansen før den blir et avvik.'
  },
  {
    id:'amina_miljorisiko_avvik_world', social_function:'Amina gjør miljøavvikets faktagrunnlag, alvorlighetsgrad, skadebegrensning, varsling og etterkontroll sosialt vanskelig å pynte på.', class_position:'Avviks- og risikofunksjon med situert kontrollmakt, men uten rett til å oppheve arbeidsgiverlinje, lovkrav eller faglig metode.', status:'Høy kontrollstanding når hun kan stole på at omdømme ikke får redigere risikobildet.', power_over_player:'Kan kreve åpne avvik, sporbare tiltak og kontroll før lukking, men kan ikke materialisere employer_appointment eller gjøre risikorollen til offentlig myndighet.', wants:'At avvik håndteres som faktisk skade- og læringsspor, ikke kommunikasjonsproblem.', conceals:'At langvarige åpne avvik også skaper sosialt press på kontrollfunksjonen om å godta et penere avslutningspunkt.', speech_style:'Sekvensiell og konkret; spør hva som skjedde, hva som er sikret, hvem som er varslet, hva som gjenstår og hvem som eier neste kontroll.', teaches_player:'At avviksstanding bygges ved å holde kontrollsporet åpent så lenge fakta krever det.'
  },
  {
    id:'tor_hr_lederstotte_world', social_function:'Tor gjør bemanning, delegasjon, kompetanse og medarbeiderbelastning synlige når resultatkrav frister lederen til å behandle tilgjengelighet som kapasitet.', class_position:'HR- og lederstøtte med prosess- og arbeidsmiljømakt, men uten rett til å overta lederens konkrete prioriteringsansvar.', status:'Høy situert tillit når han kan utfordre både overbelastning og uklar delegasjon uten å bli brukt som alibi.', power_over_player:'Kan kreve ryddig lederoppfølging, eskalering og kompetansegrense, men kan ikke gi employer_appointment eller gjøre HR-prosess til faglig miljøevidens.', wants:'At oppgaveeierskap, kapasitet og støtte henger sammen før et menneske gjøres ansvarlig for en leveranse.', conceals:'At gode prosesser kan bli symbolsk ryddighet dersom reell arbeidsmengde ikke reduseres.', speech_style:'Rolig og konkret; spør hvem som faktisk kan gjøre jobben, hvilken støtte som finnes og hva lederen må ta tilbake som eget ansvar.', teaches_player:'At psykologisk trygghet må kunne brukes til å si nei, ikke bare til å snakke om belastning etterpå.'
  },
  {
    id:'toppledelse_virksomhetsstyring_world', social_function:'Toppledelsen setter virksomhetsmål, omdømme- og leveransepress og tester om miljølederen kan gjøre dårlige nyheter beslutningsklare uten å gjøre dem mildere.', class_position:'Overordnet styringsnivå med reell makt over mandat, budsjett og organisering innen egne fullmakter.', status:'Høy formell rang; spillerens standing avhenger av sann styringsinformasjon, ikke lydighet i konklusjonen.', power_over_player:'Kan endre prioriteringer, budsjett og mandat gjennom riktig prosess, men kan ikke gjøre ønsket utfall til faglig evidens eller oppheve lov.', wants:'Et beslutningsgrunnlag som viser hva som kan leveres, hva som må vente og hvilken risiko virksomheten faktisk bærer.', conceals:'At styringspress og ekstern synlighet kan gjøre et enkelt grønt budskap mer attraktivt enn en presis gul eller rød virkelighet.', speech_style:'Beslutningsorientert og knapp; spør hva som krever beslutning, hva som kan håndteres i linjen og hva konsekvensen av å vente er.', teaches_player:'At lojalitet oppover betyr å gi ledelsen den informasjonen den helst skulle sluppet å få.'
  },
  {
    id:'lederkollega_tverrfaglig_world', social_function:'En tverrfaglig lederkollega tester om handoff, målkonflikter og avhengigheter kan bæres mellom enheter uten at hver leder beskytter sin egen grønne status.', class_position:'Lederlikemann med ansvar for en annen del av virksomheten og reell avhengighet av miljøledelsens prioriteringer.', status:'Situert peer-standing basert på pålitelig handoff og tydelige eierskap.', power_over_player:'Kan returnere uklare leveranser og eskalere avhengigheter, men kan ikke utvide spillerens fullmakt eller omskrive miljøfaglige funn.', wants:'Forutsigbar koordinering der begge sider ser hva den andre faktisk kan love.', conceals:'At kollegial harmoni kan gjøre gjensidig forskjønning av restanser sosialt fristende.', speech_style:'Kollegial og konkret; spør hva som er låst, hva som er betinget, hvem som eier neste steg og hva som må eskaleres sammen.', teaches_player:'At peer-tillit bygges av sann overlevering, ikke av gjensidig beskyttelse av status.'
  },
  {
    id:'private_relation_miljoledelse_world', social_function:'En nær privat relasjon møter ettervirkningen av lederansvar, avvik, beredskap og rang når arbeidsdagen formelt er slutt.', class_position:'Privat likemann uten arbeidsmyndighet.', status:'Høy emosjonell betydning uten profesjonell rang eller tilgang til konfidensiell beslutningsinformasjon.', power_over_player:'Kan sette grenser for fravær, kontrollspråk og arbeidets plass hjemme, men kan ikke løse bemanning, avvik eller virksomhetsmandat.', wants:'Nærvær, restitusjon og en relasjon der spilleren ikke må være leder hele tiden.', conceals:'At gjentatt beredskap og moralsk alvor kan gjøre det vanskelig å si at også privatlivet trenger prioritet.', speech_style:'Hverdagslig, varm og direkte; spør hva som faktisk er ditt ansvar og hva som må få bli igjen på jobb.', teaches_player:'At lederautoritet må kunne legges fra seg uten at faglig ansvar eller personlig integritet forsvinner.'
  }
];

const slowAxes = [
  ['faglig_integritet_og_uavhengighet_standing','Om ledelsen bevarer dokumenterte miljøfunn, metodegrenser og faglig uenighet gjennom press.'],
  ['kapasitets_og_prioriteringssannhet_standing','Om budsjett, bemanning, kompetanse og restanser blir synlige før mål loves.'],
  ['avviks_og_etterlevelsesstanding','Om alvorlighetsgrad, tiltak, varsling og etterkontroll tåler omdømme- og leveransepress.'],
  ['rettferdig_delegering_og_psykologisk_trygghet_standing','Om ansvar følger kompetanse, kapasitet, støtte og en reell mulighet til å si fra.'],
  ['darlige_nyheter_og_mandatklar_ledelsesstanding','Om toppledelsen får et sant risikobilde og tydelig skille mellom linjebeslutning og ny fullmakt.'],
  ['handoff_og_tverrfaglig_tillit_standing','Om lederkolleger får sann status, åpne avhengigheter og tydelig neste eier.'],
  ['miljofaglig_langsiktighet_vs_kortsiktig_leveranse','Om langsiktig naturverdi og etterlevelse forblir synlige når kortsiktig måloppnåelse belønnes.'],
  ['organisatorisk_laring_etter_avvik','Om rework og etterkontroll endrer praksis i stedet for bare å lukke saken administrativt.'],
  ['privat_rolleavgrensning_og_naervaer_standing','Om arbeidets beredskap, rang og kontrollspråk kan holdes situert uten å styre privatlivet.']
].map(([id,meaning])=>({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const threadDefs = [
  ['faglig_integritet_vs_lederpress','Eva og spilleren utvikler en relasjon der faglig uenighet må kunne stå synlig også når den gjør lederens egen leveranse vanskeligere. Tråden går fra tidlig premissavklaring via press om mildere språk til en senere situasjon der Eva må kunne stole på at lederen ikke bruker appointment, rang eller omdømme til å flytte konklusjonen.','1/morning','1/afternoon','3/lunch','5/afternoon','8/morning','12/afternoon'],
  ['kapasitet_budsjett_og_restansesannhet','Jonas og spilleren lærer om hverandre gjennom gjentatte porteføljevalg. Relasjonen blir troverdig bare dersom lederen kan navngi det som ikke blir gjort, tåle at tallene viser utilstrekkelig kapasitet og la senere rework bevare hvorfor den opprinnelige prioriteringen ble tatt.','1/lunch','2/morning','4/afternoon','7/morning','10/lunch','13/afternoon'],
  ['miljoavvik_omdomme_og_etterlevelse','Amina tester om lederens integritet overlever den sosiale kostnaden ved et åpent alvorlig avvik. Tråden følger skadebegrensning, varsling, press om lukking, ny informasjon og etterkontroll, og lar standing hos kontrollmiljøet endres langsomt gjennom sporbar praksis fremfor ett heroisk valg.','2/afternoon','3/evening','6/morning','9/afternoon','11/morning','14/afternoon'],
  ['bemanning_delegering_og_psykologisk_trygghet','Tor og medarbeiderlinjen gjør det synlig om delegering faktisk følger kompetanse, kapasitet og støtte. Tråden lar lederen møte taushet, overbelastning og handoff over flere dager slik at tillit ikke reduseres til trivselsspråk, men blir en praktisk rett til å melde usikkerhet før skade eller restanse.','2/lunch','4/morning','6/lunch','8/afternoon','11/lunch','13/morning'],
  ['toppledelse_mandat_og_darlige_nyheter','Forholdet til toppledelsen utvikles gjennom flere beslutningspunkter der spilleren må gjøre målkonflikt, risiko og kapasitetsbrist beslutningsklart. Standing oppover kan øke selv når lederen sier nei eller ber om ny fullmakt, fordi sann styringsinformasjon skiller profesjonell lojalitet fra lydighet.','3/morning','5/lunch','7/afternoon','9/lunch','12/morning','14/lunch'],
  ['peer_ledelse_handoff_og_laring','En lederkollega møter spilleren i gjentatte avhengigheter og overleveringer. Tråden viser hvordan grønne statusfortellinger kan friste begge, men hvordan sann handoff, eksplisitte restanser og senere rework gradvis bygger en peer-standing som tåler konflikt uten at noen overtar den andres mandat.','4/lunch','5/evening','8/lunch','10/afternoon','12/lunch','14/morning'],
  ['privat_rolleavgrensning','Den private relasjonen følger ikke saken som faglig rådgiver, men merker hvordan beredskap, skyld, kontrollspråk og behovet for å være den som løser alt lekker hjem. Tråden lar spilleren øve på å bevare konfidensialitet, legge fra seg rang og tåle at personlig verdi ikke bestemmes av hvor mye organisasjonen lyttet.','1/evening','4/evening','7/evening','10/evening','13/evening','14/evening']
];
const threadMap = new Map();
for (const [id,,...refs] of threadDefs) for (const ref of refs) {
  if (!threadMap.has(ref)) threadMap.set(ref,[]);
  threadMap.get(ref).push(id);
}

const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const environmentByPhase = {
  morning:'ledergruppe_mandat_og_maalbord_natur',
  lunch:'bemanning_delegering_og_oppfolgingsrom_natur',
  afternoon:'miljorisiko_avvik_og_tiltaksrom_natur',
  evening:'privatliv_uten_arbeidsmyndighet'
};
const audienceCycle = audiences.map(a=>a.id);
const summaryCore = `Miljøledelse blir sosialt lesbar når samme beslutning vurderes forskjellig av fagmiljø, medarbeidere, økonomi, toppledelse, kontrollfunksjoner og privatliv. Spilleren må holde arbeidsgivermandat, miljøfaglige funn, faktisk kapasitet, budsjett, kompetanse, eksplisitte restanser, miljøavvik, tiltak, varsling, handoff og etterkontroll adskilt i ${PERSISTENT}. Employer appointment gir en avgrenset organisatorisk rolle, men er aldri evidens for at et miljøfaglig funn er riktig og gir ingen automatisk offentlig myndighet. Naturvernleder, Miljøsjef og Miljødirektør må derfor tåle at profesjonell standing kan utvikle seg i ulike retninger samtidig: toppledelsen kan verdsette beslutningsklarhet, fagmiljøet kan verdsette ubehagelige forbehold, medarbeidere kan verdsette rettferdig belastning, mens en kontrollfunksjon kan kreve at et avvik forblir åpent. History Go og Natur-badge kan skjerpe kontrollspørsmål gjennom arter, steder, økologi og naturhistorie, men kan ikke fungere som employer_appointment, feltdata, avviksbevis, juridisk hjemmel, delegasjon, personalfullmakt, budsjettmyndighet eller vedtak. Standing skal derfor aldri være en global score, aldri konverteres til sannhet eller myndighet og aldri få lov til å lukke et faglig eller organisatorisk premiss som fortsatt er åpent. Nye data, endret budsjett, bemanningsendring, svakere tiltakseffekt, compliance-avklaring eller endret mandat skal gjenåpne bare berørt del av styringssporet med bevart versjon og begrunnelse.`;
const consequenceCore = `Standing er situert hos denne målgruppen og beveger seg bare langsomt gjennom gjentatt praksis. Den kan påvirke hvor mye andre stoler på lederens informasjon, hvor tidlig de deler dårlige nyheter, om en handoff blir møtt med tillit eller kontrollbehov, og hvordan senere uenighet tolkes. Den kan ikke materialisere employer_appointment, utvide delegasjon, skape budsjett- eller personalfullmakt, gjøre lederstatus til faglig evidens, erstatte feltdata eller avviksbevis, gi juridisk hjemmel eller offentlig myndighet, eller gjøre History Go/Natur-badge til et vedtak. En sosial gevinst hos én målgruppe kan samtidig koste standing hos en annen; en pen status oppover kan for eksempel svekke faglig og medarbeiderbasert tillit dersom restanser skjules. Derfor lagres ingen global reputation score, og Role World-laget beskriver bare redaksjonelle, målgruppebundne konsekvenser rundt den eksisterende Scene Pipeline.`;

const coverage = [];
let n = 0;
for (let day=1; day<=14; day+=1) for (const phase of phases) {
  const ref = `${day}/${phase}`;
  const sourceRef = canonicalRefs[n % canonicalRefs.length];
  const audience = audienceCycle[(day + phases.indexOf(phase) - 1) % audienceCycle.length];
  const threadIds = threadMap.get(ref) || [];
  const phaseFocus = phase === 'morning' ? 'Dagen åpner med konkret styringsarbeid: mandat, mål, risikobilde, kapasitet og hvilket premiss som faktisk krever handling før lederen lover leveranse.' : phase === 'lunch' ? 'Midt på dagen blir styringen sosial: en medarbeider, fagperson eller lederkollega husker tidligere prioriteringer og tester om lederen tåler spørsmål, usikkerhet og reelle avhengigheter.' : phase === 'afternoon' ? 'Ettermiddagen tvinger fram en avgrenset beslutning eller eskalering der kapasitet, miljøfaglig integritet, omdømme og myndighetsgrense trekker i ulike retninger.' : 'Kvelden viser etterklangen uten å gjøre hjemmet til ny arbeidsflate: ansvarskropp, skam, stolthet, beredskap og konfidensialitet må avgrenses fra privat nærvær.';
  const summary = `Dag ${day}, ${phase}: ${phaseFocus} Canonical materialization source er ${sourceRef}, og beatet bygger videre på faktisk mail-, People-, place-, work-loop- og persistent-object-grunnlag i stedet for å opprette et parallelt runtimeformat. ${summaryCore} Denne konkrete dagen må spilleren gjøre minst én kostnad synlig: hva som utsettes, hvem som eier neste kontroll, hvilken rest-risiko som fortsatt finnes, eller hvilken faglig uenighet som må følge saken videre. Tidligere valg blir husket gjennom trådene ${threadIds.length ? threadIds.join(', ') : 'dagens lokale standing-spor'}, slik at tillit ikke resettes mellom scener. Ledelse behandles som relasjonell og institusjonell praksis: et riktig avviksspor kan være sosialt ubehagelig, et ærlig kapasitetsbilde kan svekke kortsiktig status, og en tydelig mandatgrense kan oppfattes som mindre handlekraftig selv når den beskytter både medarbeidere og beslutningskvalitet. Beatet avsluttes derfor ikke med et universelt poeng, men med et sporbarhetsspørsmål om hva den aktuelle målgruppen nå har grunn til å stole mer eller mindre på.`;
  const standing = `Standing etter dag ${day}/${phase} er situert hos ${audience}. ${consequenceCore} I dette beatet vurderes lederen særlig på om hun gjør beslutningskostnad, faglige premisser og eierskap lesbart for akkurat denne målgruppen, og om senere rework kan spores tilbake til det som faktisk var kjent nå. Et godt utfall betyr ikke at alle liker beslutningen; det betyr at målgruppen får konsistent grunn til å forstå grensene, informasjonen og ansvaret. Et svakt utfall kan gi forsinket friksjon: mindre vilje til å dele dårlige nyheter, mer kontroll i handoff, høyere statusangst eller større privat lekkasje. Ingen slik reaksjon kan brukes som evidens for miljøtilstand eller som hjemmel for neste beslutning.`;
  coverage.push({day,phase,beat_type:phaseTypes[phase],environment:environmentByPhase[phase],summary,standing_audience:audience,standing_consequence:standing,thread_ids:threadIds,materialization_refs:[sourceRef]});
  n += 1;
}

const primaryThreads = threadDefs.map(([id,relationship,...beat_refs])=>({id,relationship:`${relationship} Relasjonen må forbli målgruppebundet og kan ikke bli en skjult global reputation score. Hvert tilbakebesøk skal vise hva personen eller gruppen faktisk husker fra tidligere beat, hva som nå er lettere eller vanskeligere å si, og hvilke myndighets- eller evidensgrenser som fortsatt er uendret selv om tilliten har flyttet seg.`,beat_refs}));
const privateAftermath = [1,4,7,10,13,14].map((day,i)=>({
  id:`privat_etterklang_${String(i+1).padStart(2,'0')}`,
  description:`Etter dag ${day} følger arbeidets ansvar og emosjonelle rest inn i privatlivet uten at den private relasjonen får arbeidsmyndighet. Spilleren må kunne si at en sak er alvorlig uten å dele konfidensielle detaljer, legge fra seg lederens kommandospråk og tåle at et uavklart miljøavvik eller en vanskelig prioritering ikke kan løses ved mer kontroll hjemme. Etterklangen gjør public_private_leakage konkret: beredskap, skyld, statusangst og stolthet kan påvirke nærvær, men partnerens støtte er verken employer_appointment, faglig evidens, delegasjon eller vedtak. Over flere kvelder blir det synlig om spilleren klarer å skille personlig verdi fra organisatorisk gjennomslag og om hvile faktisk behandles som en forutsetning for forsvarlig ledelse, ikke som belønning etter at alt er løst.`,
  materialization_refs:[canonicalRefs[(day*3)%canonicalRefs.length]]
}));
const delayedPairs = [
  ['restanse_blir_kapasitetskrise','1/lunch','7/morning',['capacity','trust']],
  ['mildnet_risikosprak_returnerer','1/afternoon','8/morning',['quality','risk']],
  ['avvikstiltak_ma_etterkontrolleres','2/afternoon','9/afternoon',['risk','quality']],
  ['delegasjon_uten_stotte_returnerer','2/lunch','8/afternoon',['trust','energy']],
  ['darlige_nyheter_endrer_toppledelsestillit','3/morning','12/morning',['status','trust']],
  ['pyntet_handoff_blir_peer_rework','4/lunch','10/afternoon',['quality','trust']],
  ['privat_beredskap_blir_grensesetting','4/evening','13/evening',['energy','trust']],
  ['organisatorisk_laring_bevises_senere','6/morning','14/afternoon',['quality','risk','trust']]
];
const delayedConsequences = delayedPairs.map(([id,setup_ref,return_ref,domains])=>({id,setup_ref,return_ref,domains,description:`Konsekvensen settes opp i ${setup_ref} og returnerer i ${return_ref}. Den skal vise at situert standing og organisatorisk læring beveger seg over tid gjennom faktiske spor, ikke gjennom en global poengsum: senere aktører husker kvaliteten på tidligere mandatavklaring, restanse, avvikshåndtering, handoff eller privat grensesetting og reagerer på om premissene ble bevart da nye data eller beslutninger kom.`}));

const world = {
  schema:'civication_role_world_v1',version:1,category:CATEGORY,role_scope:ROLE,
  title:'Natur / Miljøledelse — mandat, miljøintegritet og situert lederstanding',status:'role_world_complete',
  sociological_core:{main_problem:'Hvordan kan en miljøleder bygge legitim tillit hos fagmiljø, medarbeidere, kontrollfunksjoner, lederkolleger og toppledelse når god ledelse ofte krever å synliggjøre restanser, stå i ubehagelige miljøfunn, eskalere risiko eller si at virksomheten ikke har kapasitet til alt?',description:'Role World-en lukker bare situated_reputation rundt den allerede komplette Miljøledelse-prerequisiten. Appointment-gater, 16-stegs plan, People/Places, persistent leder- og avvikslogg, work loops, authority boundary og Scene Pipeline beholdes uendret.'},
  theme_ids:THEMES,
  social_environments:['ledergruppe_mandat_og_maalbord_natur','budsjett_kapasitet_og_portefoljeflate_natur','miljorisiko_avvik_og_tiltaksrom_natur','bemanning_delegering_og_oppfolgingsrom_natur','toppledelse_og_virksomhetsstyring','lederkolleger_og_tverrfaglige_avhengigheter','kontroll_etterlevelse_og_etterkontroll','privatliv_uten_arbeidsmyndighet'],
  recurring_people_archetypes:archetypes,
  slow_axes:slowAxes,
  existing_work_continuity:{runtime_binding:'existing_mail_and_work_grammar',new_runtime_state:false,work_loops:grammar.work_loops,persistent_work_object:PERSISTENT,waiting_states:grammar.rhythm_contract.waiting_states,handoff_rule:grammar.persistent_work_object_contract.handoff_rule,rework_rule:grammar.rhythm_contract.rework_rule,canonical_surfaces:[MODEL,GRAMMAR,PLAN,...TYPES.map(catalogPath)],rule:'Eksisterende 16-stegs Miljøledelse-plan, de to canonical work loops, fire prerequisite-aktører, fire arbeidsflater, persistent leder-/avvikslogg, waiting/handoff/rework, appointment-gater og authority boundary forblir authoritative. Role World-en legger bare situert Standing rundt eksisterende arbeid og skaper ingen ny scene-, plan-, work-object-, career- eller reputation-runtime.'},
  situated_reputation_model:{global_score_allowed:false,audiences:audiences.map(a=>({id:a.id,standing_axis:a.axis,cares_about:a.cares,cannot_grant:a.cannot})),divergence_examples:['Høy standing hos toppledelsen kan falle hos fagmiljøet dersom lederen gjør et ubehagelig funn mildere for å gi beslutningsro.','Høy standing hos medarbeidere kan øke når lederen reduserer leveransepress, selv om porteføljestatus oppover blir svakere på kort sikt.','Et åpent alvorlig avvik kan styrke kontroll- og kvalitetsstanding samtidig som omdømme- eller leveransestående blir mer krevende.','En tydelig beskjed om utilstrekkelig kapasitet kan først leses som lav handlekraft, men senere gi høyere peer- og toppledelsestillit når restansen ellers ville blitt et større avvik.','Å returnere en uklar handoff kan koste kollegial harmoni, men styrke langsiktig peer-standing fordi eierskap og rest-risiko blir tydelige.','Å be en fagperson beholde en dissens kan svekke lederens kontroll over budskapet, men styrke faglig standing fordi hierarki ikke blir brukt som evidens.','Å holde konfidensielle arbeidsdetaljer ute av hjemmet kan oppleves som avstand i øyeblikket, men styrke privat standing når lederen samtidig er ærlig om egen belastning.','Å kreve ny employer_appointment eller eksplisitt utvidet mandat før større fullmakt tas kan forsinke organisasjonen, men beskytter både leder- og myndighetsstanding.'],authority_separation:'Ingen global standing, omdømme eller sosial tillit kan materialisere Naturvernleder, Miljøsjef eller Miljødirektør uten appointment_required og employer_appointment. Standing er ikke faglig evidens, feltdata, miljøavviksbevis, juridisk hjemmel, delegasjon, budsjettfullmakt, personalmyndighet eller offentlig vedtak. History Go og Natur-badge er læringsstøtte og kan ikke oppfylle appointment-gaten eller gjøre lederstatus til sannhet. Arbeidsgivermandat må fortsatt skilles fra lovverk, faglige funn og beslutninger som eies av andre organer eller roller.'},
  history_go_affordance:{badge_id:'natur',source_ref:canonicalRefs.find(ref=>ref.includes('/knowledge/')) || canonicalRefs[0],better_question:`History Go kan gjøre miljølederens spørsmål bedre ved å gi steds-, arts-, økologi- og naturhistorisk kontekst som peker mot hva som bør undersøkes, hvem som bør involveres og hvilke antakelser som trenger faktiske data. I en lederrolle er gevinsten særlig å kunne spørre om et påstått lavrisikoområde faktisk har naturverdier, om en tidsplan tar hensyn til sesong, om en virksomhetsmålsetting bygger på riktig geografisk kontekst, og om et avvik kan ha konsekvenser som den generelle styringsrapporten ikke fanger. Denne kunnskapen skal føre til bedre bestilling av kartlegging, tydeligere kontrollspørsmål, mer realistisk alternativ- og tiltaksdiskusjon og bedre forståelse av hvorfor fagpersoner trenger tid eller metode. Den skal aldri brukes som snarvei rundt fagmiljøet. Et Natur-badge kan vise at spilleren har lært begreper eller kontekst, men ikke at en konkret art er på stedet, at et tiltak virker, at et miljøavvik er lukket eller at lederen har formell kompetanse eller fullmakt. God History Go-bruk i Miljøledelse betyr derfor å oversette nysgjerrighet til sporbare spørsmål i ${PERSISTENT}: Hva vet vi? Hva mangler? Hvem eier den faglige avklaringen? Hvilken beslutning må vente? Hvilket nytt premiss skal gjenåpne prioriteringen? Slik kan læringslaget bidra til bedre styring uten å bli et skjult bevis eller et autoritetsstempel.`,authority_boundary:'History Go og Natur-badge kan ikke materialisere employer_appointment, erstatte feltdata, miljøkartlegging, avviksbevis eller faglig kvalitetssikring, gi juridisk hjemmel, delegasjon, personal- eller budsjettfullmakt, lukke et miljøavvik eller gjøre en intern lederprioritering til offentlig vedtak eller beslutningsmyndighet.'},
  cross_role_proof:{status:'candidate_when_shared_work_is_real_no_shared_object',shared_work_object_found:false,required_for_rollout:false,new_runtime:false,candidate_when_shared_work_is_real:true,rule:'Readiness klassifiserer rollen som candidate_when_shared_work_is_real, men prerequisite- og Role World-produksjonen har ikke bevist ett konkret governed shared work object med felles eierskap på tvers av roller. Derfor materialiseres ingen cross-role-link i denne rollout-PR-en. En senere kobling kan bare opprettes når faktisk delt arbeid, objektidentitet, authority og handoff er eksplisitt bevist i eksisterende Scene Pipeline.'},
  editorial_uniqueness:{not_copy_of:['naeringsliv/formann','natur/natur_forvaltning_og_radgivning','scenekunst/scenekunst_institusjonsledelse'],rule:'Miljøledelse er særskilt skrevet rundt employer_appointment, miljøfaglig integritet, budsjett og kapasitet, eksplisitte restanser, miljøavvik, etterlevelse, bemanning, delegasjon, toppledelsespress, omdømmerisiko, organisatorisk læring og privat rolleavgrensning. Den kopierer ikke Formannens gulv-/skiftledelse, rådgiverrollens beslutningsgrunnlag eller institusjonsledelsens kulturproduksjon.'},
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  materialization:{authored_dimensions:['situated_reputation'],no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,career_title_gates_preserved:true,cross_role_link_materialized:false,source_refs:canonicalRefs}
};
write(WORLD,world);

const index = read('data/Civication/roleWorlds/index.json');
index.roles = (index.roles || []).filter(row=>!(row.category===CATEGORY && row.role_scope===ROLE));
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
index.status = `${index.roles.length}_role_worlds_materialized`;
write('data/Civication/roleWorlds/index.json',index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
if (!checklist.reference_worlds.includes(WORLD)) checklist.reference_worlds.push(WORLD);
write('data/Civication/roleWorldAuthoringChecklist.json',checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles[KEY] = THEMES;
write('data/Civication/roleWorldThemeBank.json',themeBank);

fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,SOURCE),`# Natur / Miljøledelse — Role World rollout source-first\n\n## Scope lock\n\nCanonical role: \`${KEY}\`. This rollout closes **only** \`situated_reputation\`. It preserves the existing 16-step mail plan, four prerequisite People, four work surfaces, two work loops, persistent \`${PERSISTENT}\`, waiting/handoff/rework and authority boundary.\n\n## Career gates\n\n- **Naturvernleder** — \`appointment_required\` via \`employer_appointment\`.\n- **Miljøsjef** — \`appointment_required\` via \`employer_appointment\`.\n- **Miljødirektør** — \`appointment_required\` via \`employer_appointment\`.\n\nNo standing, History Go status or Natur-badge can satisfy employer appointment, create staff/budget authority, become environmental evidence or create public authority.\n\n## Situated reputation\n\nThere is **no global reputation score**. Standing is bounded to seven audiences: fag/quality, economy/capacity, environmental risk/compliance, employees/leadership line, top management/governance, peer/tverrfaglig leadership and private relations. Each audience has its own slow standing axis and explicit cannot-grant boundary.\n\n## Dramaturgy\n\nThe Role World has **14 days × 4 phases = 56 unique beats**, seven multi-day relationship threads, six private aftermaths and eight delayed consequences. Beats are grounded in all **15 canonical mail sources** from the prerequisite package.\n\n## Cross-role\n\nReadiness says \`candidate_when_shared_work_is_real\`. No governed shared work object is proved here, so there is **no cross-role link** and no invented shared object. A future link requires concrete shared work, ownership, authority and handoff proof.\n\n## History Go boundary\n\nHistory Go can improve environmental leadership questions through place, species, ecology and natural-history context. It cannot provide employer appointment, field data, deviation evidence, legal basis, delegation, staff/budget authority, compliance proof or a management/public decision.\n\n## Editorial uniqueness\n\nThis world is written specifically around employer appointment, environmental integrity, capacity/budget tradeoffs, explicit backlog, environmental deviations, employee voice, governance pressure, organizational learning and private role containment. It is not a copy of Formann, Natur / Forvaltning og rådgivning or Scenekunst / Institusjonsledelse.\n\n## Runtime\n\n**No new runtime.** Existing Scene Pipeline, Career gates, mail machinery and governed state remain canonical.\n`);

console.log(JSON.stringify({role:KEY,world:WORLD,canonical_refs:canonicalRefs.length,days:world.season.days,beats:world.season.coverage.length,audiences:audiences.length,threads:primaryThreads.length,delayed:delayedConsequences.length},null,2));