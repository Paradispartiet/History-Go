import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const must = (condition, message) => { if (!condition) throw new Error(`ROLE_WORLD_PRECHECK: ${message}`); };

const CATEGORY = 'historie';
const ROLE = 'historie_fagledelse';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD_PATH = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL_PATH = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR_PATH = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN_PATH = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

must(!fs.existsSync(path.join(root, WORLD_PATH)), `${WORLD_PATH} already exists`);
const model = read(MODEL_PATH);
const grammar = read(GRAMMAR_PATH);
const plan = read(PLAN_PATH);
must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(plan.sequence?.length === 16, '16-step prerequisite plan drifted');
must(grammar.persistent_work_object_contract?.id === 'faglig_prioriterings_og_kvalitetslogg', 'persistent work object drifted');
must(grammar.day_one_contract?.entry === 'appointment_required', 'appointment gate drifted');

const sourceRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  must(doc.category === CATEGORY && doc.role_scope === ROLE && doc.mail_type === type, `${type} catalog identity drifted`);
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
must(sourceRefs.length === 15 && new Set(sourceRefs).size === 15, `expected 15 unique canonical source mails, got ${sourceRefs.length}`);
const knowledgeRef = sourceRefs.find((ref) => ref.includes('/knowledge/'));
must(knowledgeRef, 'knowledge provenance missing');

const themes = [
  'professional_culture',
  'class_power',
  'status_anxiety',
  'loyalty_up_down',
  'bureaucratic_power',
  'care_vs_efficiency',
  'precarity',
  'invisible_work',
  'shame_reputation',
  'public_private_leakage'
];
const themeBank = read('data/Civication/roleWorldThemeBank.json');
const themeSet = new Set((themeBank.themes || []).map((theme) => theme.id));
for (const theme of themes) must(themeSet.has(theme), `unknown theme ${theme}`);
must(!themeBank.reference_profiles?.[KEY], `${KEY} already registered in theme bank`);

const audiences = [
  {
    id: 'senior_historians_and_method_peers',
    standing_axis: 'evidentiary_independence_and_method_fairness',
    cares_about: [
      'at kildegrunnlag, usikkerhet, alternative tolkninger og metodiske innvendinger forblir synlige selv når lederen trenger en beslutning',
      'at faglig motstemme ikke blir straffet, omskrevet eller gjort personlig bare fordi den skaper friksjon i leveransen'
    ],
    cannot_grant: 'God standing hos seniorhistorikere og metodekolleger kan ikke gi lederen sannhet, evidens, kildeautoritet eller rett til å diktere en historisk konklusjon; metoden og kildene må fortsatt bære påstanden.'
  },
  {
    id: 'staff_and_capacity_bearers',
    standing_axis: 'capacity_fairness_delegation_and_workload_truth',
    cares_about: [
      'at prioritering viser hva teamet faktisk kan gjøre med tilgjengelig tid og kompetanse i stedet for å gjøre skjult overarbeid til reservekapasitet',
      'at ansvar, handoff, ventepunkt og rework fordeles med tydelig eier og ikke bare faller på den mest pliktoppfyllende medarbeideren'
    ],
    cannot_grant: 'God standing hos medarbeidere kan ikke gi spilleren ubegrenset personalmyndighet, rett til å omgå arbeidsgiveransvar eller myndighet til å pålegge skjult arbeid utenfor delegert ramme.'
  },
  {
    id: 'department_leadership_and_resource_line',
    standing_axis: 'mandate_resource_risk_and_escalation_clarity',
    cares_about: [
      'at leveranse, ressursbehov, frist og kapasitetsrisiko blir gjort beslutningsklare tidlig nok til at overordnet nivå faktisk kan prioritere',
      'at lederen skiller mellom faglig anbefaling, delegert beslutning og spørsmål som må eskaleres fordi mandat eller ressurser mangler'
    ],
    cannot_grant: 'God standing i lederlinjen kan ikke utvide delegasjon, linje-, budsjett- eller personalmyndighet utover formell ramme, og kan heller ikke gjøre ønsket styringsutfall til historiefaglig evidens.'
  },
  {
    id: 'quality_archive_and_documentation',
    standing_axis: 'traceability_correction_and_record_integrity',
    cares_about: [
      'at kildehenvisning, versjon, avvik, korrigering og begrunnelse er sporbar når en leveranse blir kontrollert eller gjenåpnet',
      'at feil repareres i både tekst og læringsspor slik at samme svikt ikke forsvinner bak en ny filversjon'
    ],
    cannot_grant: 'God standing hos kvalitets-, arkiv- eller dokumentasjonsfunksjoner kan ikke erstatte faglig analyse, gi publiseringsmyndighet eller legitimere at en usikker historisk påstand omtales som sikker.'
  },
  {
    id: 'commissioners_and_institutional_clients',
    standing_axis: 'scope_reliability_usefulness_and_independence',
    cares_about: [
      'at bestilling, leveranseomfang, begrensninger og frist er tydelige nok til at mottakeren vet hva materialet faktisk kan brukes til',
      'at lederen kan levere noe anvendelig uten å forme kildene etter en bestilt konklusjon eller skjule vesentlig usikkerhet'
    ],
    cannot_grant: 'God standing hos oppdragsgiver eller institusjonell bestiller kan ikke gi rett til å bestille et historisk funn, dispensere fra metodekrav eller overstyre faglig uenighet, kildegrunnlag og dokumenterte begrensninger.'
  },
  {
    id: 'public_communication_and_affected_groups',
    standing_axis: 'uncertainty_transparency_correction_and_public_respect',
    cares_about: [
      'at offentlig formidling skiller dokumentert funn, tolkning, usikkerhet og korrigering i stedet for å gjøre institusjonens sikkerhet større enn kildene tillater',
      'at berørte grupper og publikum ikke møtes med lederstatus som skjold når dokumentasjon, begrepsbruk eller representasjon blir utfordret'
    ],
    cannot_grant: 'God offentlig standing kan ikke gi publiseringsrett, kildeklarering, juridisk dispensasjon eller faglig sannhetsmyndighet; kritikk må håndteres gjennom dokumentasjon, korreksjon og riktig beslutningslinje.'
  },
  {
    id: 'profession_peers_and_future_employers',
    standing_axis: 'professional_judgment_learning_and_portfolio_trust',
    cares_about: [
      'at lederen over tid viser dømmekraft som tåler press, beskytter faglig integritet og gjør vanskelige prioriteringer etterprøvbare',
      'at læring fra feil og kapasitetsbrudd faktisk endrer senere praksis i stedet for å bli omdømmepleie etter at problemet er borte'
    ],
    cannot_grant: 'God profesjonell standing eller et sterkt omdømme kan ikke gi ansettelse, opprykk, formell delegasjon eller faglig kompetanse som ikke finnes; slike rettigheter og kvalifikasjoner må fortsatt etableres gjennom riktige prosesser.'
  },
  {
    id: 'private_relations',
    standing_axis: 'recovery_confidentiality_and_identity_boundary',
    cares_about: [
      'at spilleren klarer å gå ut av lederberedskap etter konflikt, feil og offentlig press uten å gjøre arbeidets status til privat egenverdi',
      'at fortrolig informasjon om medarbeidere, kilder, oppdragsgivere og interne avvik ikke brukes privat for å få støtte eller vinne en fortelling'
    ],
    cannot_grant: 'Nære relasjoner kan gi støtte og perspektiv, men kan ikke gi History Go-badge, faglig evidens, ledermandat, delegasjon, budsjett-, personal- eller publiseringsmyndighet eller rett til å dele fortrolig informasjon.'
  }
];

const audienceById = new Map(audiences.map((audience) => [audience.id, audience]));
const audienceCycle = audiences.map((audience) => audience.id);

const people = [
  {
    id: 'ingrid_avdelingsdirektor_world',
    social_function: 'Ingrid gjør styringslinjen konkret og tvinger frem skillet mellom hva Fagledelse kan prioritere selv, hva som krever mer ressurser, og hva som må eskaleres uten å late som overordnet ønske er historisk metode.',
    class_position: 'Avdelingsdirektør med formell posisjon over seksjonen og reell ressurs- og styringsmakt, men uten rett til å produsere evidens gjennom hierarki.',
    status: 'Hennes standing vurderer om spilleren er beslutningsklar, risikotransparent og lojal mot mandatet uten å bli lydig mot en bestilt konklusjon.',
    power_over_player: 'Hun kan avklare mandat, prioriteringsramme og eskalering, men kan ikke legitimere skjult kapasitetsrisiko eller gjøre en ønsket historisk konklusjon sann.',
    wants: 'At spilleren viser hvilke leveranser som kan holdes, hva som må velges bort, og hvilke faglige grenser som ikke kan forhandles bort for å få en pen statusrapport.',
    conceals: 'Hun står selv i styrings- og fristpress og kan derfor formulere organisatoriske behov med større sikkerhet enn kunnskapsgrunnlaget tåler.',
    speech_style: 'Kort, beslutningsorientert og rammesettende; spør etter alternativ, konsekvens, eier, frist og hva som krever hennes beslutning.',
    teaches_player: 'At ledelse oppover krever både tydelig styringsinformasjon og evne til å si at en ønsket konklusjon ikke kan kjøpes med hierarki.'
  },
  {
    id: 'marius_seniorhistoriker_world',
    social_function: 'Marius bærer den faglige motstemmen gjennom sesongen og gjør det kostbart, men mulig, å beskytte metodeuenighet når tempo og lederidentitet trekker mot tidlig lukking.',
    class_position: 'Seniorhistoriker med høy faglig kapital og metodeautoritet i kraft av arbeid og kompetanse, men uten personal- eller budsjettmyndighet.',
    status: 'Hans standing handler om hvorvidt uenighet får stå som faglig informasjon og om lederen skiller kompetent motlesning fra illojalitet.',
    power_over_player: 'Han kan kreve at kilde- og metodeinnvendinger blir synlige og be om ny vurdering, men kan ikke alene bestemme prioritering eller bruke faglig status som veto uten argument.',
    wants: 'At lederen beholder rivalforklaringer, usikkerhet og begrensninger lenge nok til at konklusjonen faktisk kan prøves, også når det skaper merarbeid.',
    conceals: 'Sterk faglig identitet kan også gjøre ham mindre sensitiv for ressurs- og leveransebegrensninger som lederen faktisk må håndtere.',
    speech_style: 'Presis, kildeorientert og skeptisk til administrative snarveier; spør hva påstanden bygger på og hva som ville falsifisere den.',
    teaches_player: 'At beskyttet motstemme er en kvalitetsressurs, men også må integreres i en reell prioriterings- og leveranseprosess.'
  },
  {
    id: 'nora_teamkoordinator_world',
    social_function: 'Nora gjør det usynlige koordineringsarbeidet synlig: hvem som venter, hvem som bærer ekstraarbeid, hvor handoff mangler eier og når en frist bare holdes fordi noen absorberer risiko privat.',
    class_position: 'Teamkoordinator nær den daglige arbeidsflyten, med stor informasjonsmakt om belastning og avhengigheter, men avgrenset formell myndighet.',
    status: 'Hennes standing handler om hvorvidt Fagledelse respekterer faktisk kapasitet, gjør prioritering ærlig og lar koordinering være mer enn opprydding etter lederbeslutninger.',
    power_over_player: 'Hun kan stoppe uklare handoffs og synliggjøre belastning, men kan ikke permanent omfordele personalressurser eller avgjøre faglige funn uten mandat.',
    wants: 'At alle leveranser har synlig eier, ventepunkt, neste kontroll og konsekvens for resten av porteføljen før noen lover at arbeidet er ferdig.',
    conceals: 'Hun kan ha normalisert eget ekstraarbeid så lenge at også hun undervurderer hvor mye kapasitet systemet faktisk mangler.',
    speech_style: 'Operativ og konkret; peker på kø, avhengighet, versjon, eier og hvilken annen oppgave som flyttes når noe prioriteres opp.',
    teaches_player: 'At kapasitet er et faglig kvalitetsvilkår når manglende tid og kompetanse påvirker hvilke kilder, kontroller og motlesninger som faktisk blir gjort.'
  },
  {
    id: 'sander_kvalitetsradgiver_world',
    social_function: 'Sander bærer avvik, korrigering og institusjonell hukommelse og tester om lederen virkelig vil lære av feil når rettelsen er dyr, synlig eller kommer sent.',
    class_position: 'Kvalitetsrådgiver med prosess- og kontrollmakt, men uten rett til å overta historiefaglig konklusjon eller generell stoppmyndighet uten begrunnelse.',
    status: 'Hans standing handler om sporbarhet, korrigeringsvilje og om lederen lar læringssporet overleve etter at teksten ser reparert ut.',
    power_over_player: 'Han kan kreve dokumentert avvik, korrigeringsansvar og nytt kontrollpunkt, men kan ikke gjøre kvalitetssystemet til egen faglig sannhetskilde.',
    wants: 'At feil blir koblet til årsak, eier, berørte leveranser og endret praksis, ikke bare lukket med en ny fil og et stille håp om at ingen spør.',
    conceals: 'Kvalitetssystemer kan selv bli ritualiserte, og Sander må derfor også utfordres på når kontroll produserer dokumentasjon uten bedre beslutninger.',
    speech_style: 'Systematisk og etterprøvbar; spør hva som skjedde, hvor det står, hvem som eier korrigeringen og hvordan neste kontroll faktisk blir annerledes.',
    teaches_player: 'At korreksjon er både faglig og sosialt arbeid fordi tillit avhenger av hvordan institusjonen reagerer når den oppdager at den tok feil.'
  },
  {
    id: 'commissioner_interface_world',
    social_function: 'Bestillergrensesnittet gjør brukskontekst og institusjonell nytte synlig uten å la en ønsket fortelling bli premiss for kildene.',
    class_position: 'Oppdragsgiver eller intern bestiller med makt over behov, tidsramme og mottak, men ikke over historisk sannhet.',
    status: 'Standing måler om lederen er pålitelig om omfang, begrensning og frist, også når budskapet ikke er det bestilleren håpet på.',
    power_over_player: 'Bestilleren kan definere behov og prioritere bruk, men kan ikke kjøpe en bestemt konklusjon eller oppheve kilde- og metodekrav.',
    wants: 'En leveranse som faktisk kan brukes, med tydelig skille mellom dokumentert funn, tolkning, begrensning og hva som krever mer arbeid.',
    conceals: 'Behovet for en klar beslutning kan gjøre institusjonen mindre tolerant for historisk usikkerhet enn den burde være.',
    speech_style: 'Formålsorientert; spør hva materialet betyr for beslutningen, når det kan leveres og hva som fortsatt er usikkert.',
    teaches_player: 'At nytte ikke er det samme som lydighet, og at god fagledelse oversetter usikkerhet til beslutningsrelevant informasjon uten å skjule den.'
  },
  {
    id: 'archive_source_steward_world',
    social_function: 'Arkiv- og kildeforvalteren minner om at tilgang, proveniens, kontekst og dokumentasjonspraksis setter grenser for hva teamet kan hevde og når.',
    class_position: 'Forvalter av kilder, metadata eller tilgang med viktig infrastrukturell makt, men uten rett til å fastsette den historiske tolkningen.',
    status: 'Standing handler om presis bruk av kilder, respekt for proveniens og at lederpress ikke oversettes til selektiv dokumentasjon.',
    power_over_player: 'Kan avklare tilgang og kildekontekst, men kan ikke gi ledermandat eller gjøre én kilde representativ for mer enn den faktisk bærer.',
    wants: 'At teamet dokumenterer hva materialet er, hvor det kommer fra, hvilke hull som finnes og hvilke begrensninger som følger bruken.',
    conceals: 'Arkivets egne ordninger og fravær kan også forme hva som virker synlig og viktig, og må derfor behandles som del av kildekritikken.',
    speech_style: 'Nøktern og proveniensorientert; spør etter signatur, serie, versjon, kontekst og hva som ikke finnes.',
    teaches_player: 'At kildeinfrastruktur er en maktbetingelse for historisk kunnskap, men ikke en erstatning for analyse.'
  },
  {
    id: 'public_communication_interface_world',
    social_function: 'Formidlingsgrensesnittet tester om institusjonen tåler å kommunisere usikkerhet, endring og korreksjon når offentligheten ønsker en enklere historie.',
    class_position: 'Kommunikasjons- eller formidlingsrolle med makt over timing og språk, men ikke over kildegrunnlag eller faglig sannhetsstatus.',
    status: 'Standing handler om om lederen gir sann status tidlig nok og ikke bruker publiseringspress til å hoppe over faglige eller organisatoriske porter.',
    power_over_player: 'Kan kreve forståelig og tidsriktig kommunikasjon, men kan ikke godkjenne en historisk konklusjon eller oppheve behovet for korreksjon.',
    wants: 'At publikum får vite hva som er sikkert, hva som er tolkning, hva som er endret og hvorfor en korreksjon eventuelt er nødvendig.',
    conceals: 'Behovet for tydelig budskap og frist kan favorisere sikkerhet og enkelhet selv når saken krever nyanser.',
    speech_style: 'Publikumsorientert og konkret; spør hva som kan sies nå, hva som må merkes som usikkert og hva som må endres offentlig.',
    teaches_player: 'At offentlig tillit ikke bygges ved å skjule usikkerhet, men ved å gjøre den håndterbar og korrigerbar.'
  },
  {
    id: 'private_counterweight_world',
    social_function: 'Den private motvekten viser hvordan lederpress, skam, prestisje og ansvar følger spilleren hjem og kan forvrenge neste arbeidsdag dersom de ikke skilles fra faglig vurdering.',
    class_position: 'Nær relasjon uten organisatorisk mandat og uten legitim tilgang til fortrolig arbeidsinformasjon.',
    status: 'Standing handler om tilgjengelighet, fortrolighet og om spilleren klarer å være mer enn rollen uten å bruke privat støtte som bakkanal for jobbavgjørelser.',
    power_over_player: 'Kan påvirke selvforståelse og restitusjon, men kan ikke gi faglig evidens, beslutningsmandat eller rett til å dele fortrolig informasjon.',
    wants: 'At spilleren kan snakke om belastning og verdi uten å trekke medarbeidere, kilder eller oppdragsgivere inn i privat statusforsvar.',
    conceals: 'Nærhet kan gjøre det fristende å bekrefte spilleren heller enn å utfordre hvordan lederrollen spiser opp identitet og hvile.',
    speech_style: 'Personlig og avvæpnende; spør hva konflikten gjør med spilleren, ikke bare hvordan den skal vinnes på jobb.',
    teaches_player: 'At faglig integritet også krever en privat grense som hindrer skam, prestisje og utmattelse i å bli skjulte beslutningskriterier.'
  }
];

const slowAxes = [
  ['evidence_independence_trust','Langsom tillit til at kildegrunnlag, usikkerhet og metode står over ønsket lederutfall.'],
  ['dissent_protection_trust','Langsom tillit til at faglig motstemme kan være synlig uten karriere- eller relasjonsstraff.'],
  ['capacity_fairness_trust','Langsom tillit til at kapasitet, kompetanse og overarbeid beskrives sant før frister loves.'],
  ['delegation_clarity_trust','Langsom tillit til at beslutninger tas av riktig eier og at lederrollen ikke utvider seg gjennom vane eller status.'],
  ['audit_repair_trust','Langsom tillit til at feil, avvik, korreksjon og læring er sporbare også etter at leveransen er lukket.'],
  ['commissioning_independence_trust','Langsom tillit til at bestillerbehov oversettes til gode spørsmål uten at svaret bestilles på forhånd.'],
  ['public_uncertainty_trust','Langsom offentlig tillit til at funn, tolkning, usikkerhet og korreksjon kommuniseres med riktig sikkerhetsnivå.'],
  ['professional_learning_trust','Langsom profesjonell standing knyttet til dømmekraft, læring og evne til å beskytte både kvalitet og mennesker under press.'],
  ['private_recovery_boundary','Langsom evne til å holde lederstatus, skam, fortrolighet og privat egenverdi fra å flyte sammen.']
].map(([id, meaning]) => ({ id, meaning, runtime_binding:'editorial_only_until_governed' }));

const days = [
  { title:'Kapasitetsklemmen blir synlig', tension:'Tre kritiske leveranser konkurrerer om de samme to spesialistene, og den opprinnelige planen forutsetter kapasitet som ikke finnes.', evidence:'prioriteringsloggen viser frist, kompetansebehov og hvilke kontrolltrinn som faller bort dersom alt beholdes', risk:'skjult overarbeid og redusert kilde- eller metodekontroll kan bli normalisert som ledereffektivitet', handoff:'en eksplisitt omprioritering med eier og konsekvens for det som utsettes' },
  { title:'Metodeuenigheten tåler ikke bare et ledermøte', tension:'En seniorhistoriker mener den raske tolkningen ikke skiller godt nok mellom kilde, inferens og rivalforklaring.', evidence:'motstemmen er dokumentert med konkrete kilde- og metodepunkter som fortsatt står åpne', risk:'uenighet kan bli tolket som illojalitet og forsvinne fra leveransen fordi lederen ønsker ro', handoff:'en avgrenset faglig beslutning som beholder innvendingen og nytt kontrollpunkt' },
  { title:'Usynlig overarbeid er blitt planforutsetning', tension:'Koordineringsflaten viser at fristene bare holder fordi enkelte medarbeidere tar restarbeid uten at det er synlig i kapasiteten.', evidence:'håndoffhistorikken viser gjentatte kveldsleveranser, uavklarte eiere og oppgaver som flyttes uten beslutning', risk:'arbeidsmiljø, kvalitet og rettferdighet svekkes samtidig som statusrapporten ser grønn ut', handoff:'reell belastning inn i prioriteringsbeslutningen og et eksplisitt nei til skjult reservekapasitet' },
  { title:'Bestilt konklusjon møter kildenes grense', tension:'Overordnet nivå ønsker en tydeligere historisk konklusjon enn dagens kildegrunnlag faktisk bærer.', evidence:'kildeoversikten viser både støttende materiale, fravær og alternative forklaringer som gjør sikkerhetsnivået begrenset', risk:'lederlojalitet kan forveksles med faglig integritet og institusjonen kan publisere større sikkerhet enn den har', handoff:'et beslutningsklart skille mellom hva som kan sies, hva som er tolkning og hva som ikke kan konkluderes' },
  { title:'Ventingen må få være en reell arbeidsstatus', tension:'En leveranse står stille fordi nødvendig kilde, mandat eller spesialistkompetanse ikke er tilgjengelig innen fristen.', evidence:'loggen har et tydelig ventepunkt, men flere aktører omtaler det som om arbeidet bare trenger mer tempo', risk:'teamet kan fylle kunnskapshullet med antakelser og sende risiko videre som om den var avklart', handoff:'ventestatus med årsak, ansvarlig avklarer, neste kontroll og konsekvens dersom avklaringen uteblir' },
  { title:'Handoff uten eier skaper ansvarsvakuum', tension:'Neste team har mottatt en fil, men ikke den åpne metodeinnvendingen, ventestatusen eller hvem som eier neste beslutning.', evidence:'versjonshistorikken viser at dokumentet flyttet seg mens beslutningsrom og uløst risiko ble borte i overleveringen', risk:'mottakeren kan tolke stillhet som godkjenning og bygge videre på et premiss ingen faktisk har lukket', handoff:'ny overlevering med eksplisitt status, eier, åpne spørsmål og kriterium for å gå videre' },
  { title:'En sen kildehenvisningsfeil utfordrer omdømmet', tension:'Rett før publisering oppdages en alvorlig feil i kildehenvisningen til et sentralt poeng.', evidence:'kontrollsporet viser hvor feilen oppsto, hvilke deler som berøres og at retting vil påvirke frist og kommunikasjon', risk:'prestisje og publiseringspress kan gjøre en stille kosmetisk retting mer fristende enn en sporbar korreksjon', handoff:'stopp eller avgrensning av berørt del, dokumentert korreksjon og nytt kontrollpunkt før publisering' },
  { title:'Ny kilde gjenåpner det som ble kalt ferdig', tension:'Et nytt arkivfunn endrer premisset etter at leveransen allerede er behandlet som avsluttet.', evidence:'den nye kilden påvirker en konkret del av argumentasjonen, men ikke nødvendigvis hele arbeidet', risk:'enten kan lederen ignorere funnet for å beskytte fristen, eller overreagere og gjenåpne alt uten avgrensning', handoff:'bounded rework som åpner bare berørte ledd og bevarer tidligere beslutnings- og endringsspor' },
  { title:'Omprioritering avslører kompetansegap', tension:'En politisk eller institusjonell hendelse gjør én leveranse akutt, men den nødvendige kompetansen er bundet i annet arbeid.', evidence:'kapasitetsbildet viser hvem som kan gjøre hva, hvilke oppgaver som allerede er kritiske og hva en flytting faktisk koster', risk:'lederen kan låne kompetanse uten å synliggjøre konsekvensene og skape kjedereaksjon av skjult forsinkelse', handoff:'omprioritering med eksplisitt kostnad, mottakende eier og ny frist for arbeidet som mister kapasitet' },
  { title:'Offentlig frist presser nyansene', tension:'Kommunikasjon trenger et klart budskap før et arrangement eller en offentlig milepæl, mens fagteamet fortsatt har vesentlig usikkerhet.', evidence:'arbeidsobjektet skiller dokumentert funn, tolkning, uavklart spørsmål og hva som kan korrigeres senere', risk:'institusjonen kan gjøre formidlingsklarhet til falsk historisk sikkerhet og påføre berørte grupper et vanskelig etterspill', handoff:'publiserbar formulering med korrekt sikkerhetsnivå, avgrensning og avtalt korreksjonsvei' },
  { title:'Korrigeringen må bli institusjonell læring', tension:'En feil er rettet i teksten, men årsaken ligger fortsatt i arbeidsflyt, kontroll og uklare eiere.', evidence:'avviksloggen viser mønsteret mellom tidspress, handoff og manglende metodekontroll over flere leveranser', risk:'organisasjonen kan få renere dokumenter uten bedre praksis og samme feil kan gjenta seg under neste pressbølge', handoff:'konkret endring i kontrollpunkt, ansvar og oppfølging som kan etterprøves i senere arbeid' },
  { title:'Lederrollen kan ikke late som allvitenhet', tension:'Spilleren må lede et område der en medarbeider har dypere fagkompetanse enn lederen selv.', evidence:'den faglige vurderingen er godt begrunnet, men konsekvensene for kapasitet og institusjonell prioritering må fortsatt besluttes', risk:'statusangst kan føre til overstyring, mens motsatt ytterlighet kan gjøre lederen passiv og utydelig om ansvar', handoff:'tydelig faglig eierskap hos kompetent medarbeider kombinert med lederansvar for ramme, prioritering og konsekvens' },
  { title:'Sluttleveransen må bevare begrensningene', tension:'Leveransen er nesten ferdig, men flere interessenter ønsker at forbehold og metodebegrensninger tones ned for å gjøre teksten sterkere.', evidence:'versjonen viser hvilke formuleringer som er direkte kildebelagt, hvilke som er tolkning og hvilke som fortsatt er usikre', risk:'et polert sluttprodukt kan slette nettopp de begrensningene som gjør det faglig pålitelig og vanskeligere å misbruke', handoff:'sluttversjon med synlige begrensninger, kontrollert språk og klart ansvar for eventuell senere korreksjon' },
  { title:'Etterspillet fordeler standing ulikt', tension:'Sesongens prioriteringer, feil, avslag og korreksjoner blir nå vurdert forskjellig av medarbeidere, fagfeller, ledelse, bestillere og offentlighet.', evidence:'loggen gjør det mulig å se både gode beslutninger, kostnader, feil, reparasjon og hvor tillit ble styrket eller svekket', risk:'lederen kan forsøke å samle alt i én fortelling om suksess eller nederlag og dermed miste den situerte læringen', handoff:'en avsluttende review som beholder divergerende standing, dokumenterer læring og ikke gjør omdømme til ny myndighet' }
];

const threadIds = [
  'authority_and_independence',
  'capacity_and_workload',
  'method_dissent_and_evidence',
  'quality_correction_and_learning',
  'handoff_waiting_and_rework',
  'commissioning_and_public_trust',
  'private_identity_and_leadership'
];
const dayThreads = [
  ['capacity_and_workload','authority_and_independence'],
  ['method_dissent_and_evidence','authority_and_independence'],
  ['capacity_and_workload','handoff_waiting_and_rework'],
  ['authority_and_independence','method_dissent_and_evidence'],
  ['handoff_waiting_and_rework','method_dissent_and_evidence'],
  ['handoff_waiting_and_rework','capacity_and_workload'],
  ['quality_correction_and_learning','commissioning_and_public_trust'],
  ['quality_correction_and_learning','method_dissent_and_evidence'],
  ['capacity_and_workload','authority_and_independence'],
  ['commissioning_and_public_trust','method_dissent_and_evidence'],
  ['quality_correction_and_learning','handoff_waiting_and_rework'],
  ['private_identity_and_leadership','method_dissent_and_evidence'],
  ['commissioning_and_public_trust','quality_correction_and_learning'],
  ['private_identity_and_leadership','authority_and_independence']
];

const phaseInfo = {
  morning: {
    beat_type:'task',
    label:'morgenoppgaven',
    action:'Spilleren må åpne den versjonerte faglige prioriterings- og kvalitetsloggen, skille observasjon fra antakelse, og gjøre dagens reelle beslutningsrom eksplisitt før tempo eller hierarki får definere problemet.'
  },
  lunch: {
    beat_type:'relationship',
    label:'relasjonsmøtet midt på dagen',
    action:'En relasjonell motpart leser den samme saken fra sin posisjon og gjør kostnaden ved lederens valg sosialt synlig; spilleren må lytte uten å gi varme, status eller konflikt samme funksjon som evidens eller formell myndighet.'
  },
  afternoon: {
    beat_type:'decision',
    label:'ettermiddagens beslutningspunkt',
    action:'Spilleren må velge hva som faktisk kan besluttes nå, hva som skal vente, hva som skal eskaleres, og hvilket avgrenset rework som eventuelt åpnes, med tydelig eier og uten å slette tidligere uenighet eller risiko.'
  },
  evening: {
    beat_type:'private_consequence',
    label:'kveldens private konsekvens',
    action:'Arbeidsdagen lekker over i selvforståelse og nære relasjoner; spilleren må bearbeide ansvar, skam, prestisje eller lettelse uten å dele fortrolig materiale eller bruke privat bekreftelse som skjult begrunnelse for neste faglige valg.'
  }
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  const scenario = days[day - 1];
  for (const [phaseIndex, phase] of ['morning','lunch','afternoon','evening'].entries()) {
    const info = phaseInfo[phase];
    const beatIndex = (day - 1) * 4 + phaseIndex;
    const sourceRef = sourceRefs[beatIndex % sourceRefs.length];
    const audienceId = audienceCycle[beatIndex % audienceCycle.length];
    const audience = audienceById.get(audienceId);
    const summary = `Dag ${day}, ${info.label}: ${scenario.title}. ${scenario.tension} ${info.action} Det konkrete evidensbildet er at ${scenario.evidence}. Den sentrale risikoen er at ${scenario.risk}. Fagledelse må derfor holde tre nivåer fra hverandre samtidig: hva kildene og metoden støtter, hva den delegerte lederrollen kan prioritere eller eskalere, og hva relasjonene rundt arbeidet ønsker eller frykter. Dagens handoff-krav er ${scenario.handoff}. Beatet bruker canonical mail-proveniens ${sourceRef} som delivery-anker, men innfører ingen ny runtime og gjør ikke mailen til en parallell arbeidsmodell. ${audience.cares_about[0]} Dette betyr at spilleren må la loggen bevare versjon, eier, ventepunkt, faglig motstemme, avvik og neste kontroll slik at en senere mottaker kan rekonstruere hvorfor handlingen var legitim eller hvorfor den må gjenåpnes. På denne måten blir ${scenario.title.toLowerCase()} et spørsmål om både historiefaglig integritet og sosial makt: hvem får definere hast, hvem bærer skjult arbeid, hvem får sin tvil stående, og hvem kan faktisk ta neste beslutning.`;
    const standingConsequence = `Standing etter dag ${day}/${phase} er situert hos ${audience.id} langs aksen ${audience.standing_axis}, ikke en global reputation score. Denne gruppen bryr seg særlig om ${audience.cares_about[0]} og ${audience.cares_about[1]}. Dersom spilleren gjør ${scenario.handoff} synlig, kan tilliten øke hos denne gruppen selv om andre samtidig misliker forsinkelse, kostnad, uenighet eller offentlig korreksjon. Dersom spilleren i stedet skjuler ${scenario.risk}, kan lokal status se sterk ut mens langsom standing svekkes et annet sted. ${audience.cannot_grant} Beatet må derfor kunne ende med divergerende sosial vurdering uten at noen standing-verdi får lov til å overstyre kildegrunnlag, dokumentert metodeuenighet, formell delegasjon, arbeidsmiljøansvar eller riktig publiseringslinje. Den private og profesjonelle læringen ligger i å tåle at en faglig riktig avgrensning kan være upopulær i øyeblikket, og at en populær snarvei kan bli dyr når kilder, mennesker eller kontrollspor senere kommer tilbake.`;
    must(summary.length >= 650, `${day}/${phase} summary too short: ${summary.length}`);
    must(standingConsequence.length >= 520, `${day}/${phase} standing too short: ${standingConsequence.length}`);
    coverage.push({
      day,
      phase,
      beat_type: info.beat_type,
      summary,
      thread_ids: dayThreads[day - 1],
      materialization_refs: [sourceRef],
      standing_audience: audienceId,
      standing_consequence: standingConsequence
    });
  }
}
must(coverage.length === 56, 'coverage count drifted');

const primaryThreads = [
  { id:'authority_and_independence', relationship:'Forholdet mellom delegert ledelsesmyndighet og historiefaglig uavhengighet: spilleren må være tydelig nok til å prioritere og eskalere, men aldri bruke hierarki til å produsere evidens, bestille konklusjon eller gjøre motstemme til illojalitet.', beat_refs:['1/morning','2/afternoon','4/lunch','4/afternoon','9/afternoon','13/lunch','14/afternoon'] },
  { id:'capacity_and_workload', relationship:'Forholdet mellom realistisk kapasitet, skjult arbeid og lederstatus: sesongen viser hvordan kvalitet og arbeidsmiljø svekkes når tids- og kompetansegap kamufleres som fleksibilitet, og hvordan tydelig prioritering kan koste status før den bygger tillit.', beat_refs:['1/lunch','3/morning','3/afternoon','6/lunch','9/morning','11/lunch','14/lunch'] },
  { id:'method_dissent_and_evidence', relationship:'Forholdet mellom faglig motstemme, kildegrunnlag og konklusjon: Marius og andre faglige stemmer gjør uenighet til data som må bevares og prøves, samtidig som lederen fortsatt må avgjøre ramme, frist og hva som er tilstrekkelig for den konkrete leveransen.', beat_refs:['2/lunch','2/afternoon','4/morning','5/afternoon','8/morning','12/afternoon','13/morning'] },
  { id:'quality_correction_and_learning', relationship:'Forholdet mellom feil, korreksjon og institusjonell hukommelse: Sander presser på for at avvik ikke bare rettes kosmetisk, men kobles til årsak, ansvar, berørte leveranser og endret praksis som kan etterprøves senere.', beat_refs:['5/morning','7/morning','7/afternoon','8/afternoon','11/morning','11/afternoon','13/afternoon'] },
  { id:'handoff_waiting_and_rework', relationship:'Forholdet mellom venting, handoff og bounded rework: arbeid må kunne stå legitimt stille, overleveres med åpen risiko og gjenåpnes selektivt når premisser endres, uten at tidligere beslutningsspor slettes eller hele porteføljen automatisk nullstilles.', beat_refs:['3/lunch','5/lunch','6/morning','6/afternoon','8/lunch','10/afternoon','13/lunch'] },
  { id:'commissioning_and_public_trust', relationship:'Forholdet mellom bestillerbehov, offentlig formidling og historisk usikkerhet: spilleren må gjøre leveransen anvendelig og forståelig uten å la frist, kommunikasjonsbehov eller institusjonell prestisje øke sikkerheten utover det kildene faktisk bærer.', beat_refs:['4/lunch','7/lunch','10/morning','10/lunch','10/afternoon','13/afternoon','14/morning'] },
  { id:'private_identity_and_leadership', relationship:'Forholdet mellom lederidentitet, skam, prestisje og privat restitusjon: kveldsbeatene viser hvordan konflikter og feil kan følge spilleren hjem, og hvorfor fortrolighet og et liv utenfor rollen er nødvendig for å unngå at statusangst blir skjult beslutningslogikk.', beat_refs:['1/evening','4/evening','7/evening','10/evening','12/evening','13/evening','14/evening'] }
];
for (const thread of primaryThreads) must(threadIds.includes(thread.id), `unknown thread ${thread.id}`);

const privateAftermath = [
  { id:'capacity_guilt_afterhours', description:'Etter første kapasitetsklemme oppdager spilleren hvor lett lederansvar blir til privat skyld for arbeid som strukturelt ikke kan gjøres innen rammen. Aftermathen trener skillet mellom å eie prioriteringen og å late som egen innsats kan kompensere permanent for manglende kapasitet.', materialization_refs:[sourceRefs[0],sourceRefs[6]] },
  { id:'dissent_and_status_shame', description:'Etter metodekonflikten sitter spilleren med ubehaget ved å bli utfordret av en mer spesialisert kollega. Aftermathen gjør statusangst eksplisitt og krever at lederen ikke tar den med tilbake som straff, micromanagement eller behov for å vinne neste faglige diskusjon.', materialization_refs:[sourceRefs[1],sourceRefs[5]] },
  { id:'correction_exposure_and_recovery', description:'Etter den sene feilen må spilleren tåle at en korreksjon både beskytter kvalitet og synliggjør at institusjonen tok feil. Privat bearbeiding skal redusere behovet for omdømmeforsvar, ikke åpne for å dele fortrolig avviksinformasjon.', materialization_refs:[sourceRefs[2],sourceRefs[14]] },
  { id:'commissioning_pressure_at_home', description:'Etter press fra bestiller eller offentlig frist oppstår fristelsen til å gjøre en organisatorisk seier til personlig målestokk. Aftermathen beskytter privat identitet og minner om at en tydelig faglig grense kan være riktig selv når den koster sosial varme eller kortsiktig status.', materialization_refs:[sourceRefs[8],knowledgeRef] },
  { id:'season_end_divergent_standing', description:'Ved sesongslutt finnes ingen én dom over lederen: noen verdsetter korreksjon, andre husker forsinkelse, noen ansatte husker beskyttet kapasitet, og enkelte bestillere ønsket mer sikkerhet. Aftermathen lar disse vurderingene stå side om side uten å komprimeres til global score.', materialization_refs:[sourceRefs[9],sourceRefs[13],sourceRefs[14]] }
];

const delayedConsequences = [
  { id:'hidden_capacity_returns_as_delay', setup_ref:'1/afternoon', return_ref:'3/morning', domains:['job','relationship','reputation'] },
  { id:'protected_dissent_returns_as_better_argument', setup_ref:'2/lunch', return_ref:'8/afternoon', domains:['job','relationship','narrative'] },
  { id:'conclusion_pressure_returns_in_public_wording', setup_ref:'4/afternoon', return_ref:'10/morning', domains:['job','reputation','narrative'] },
  { id:'waiting_state_returns_as_clean_handoff', setup_ref:'5/morning', return_ref:'6/afternoon', domains:['job','relationship'] },
  { id:'late_error_returns_as_learning_demand', setup_ref:'7/afternoon', return_ref:'11/morning', domains:['job','reputation','narrative'] },
  { id:'new_source_returns_in_final_limitations', setup_ref:'8/morning', return_ref:'13/afternoon', domains:['job','narrative','reputation'] },
  { id:'public_deadline_returns_as_correction_trust', setup_ref:'10/lunch', return_ref:'14/morning', domains:['relationship','reputation','narrative'] },
  { id:'status_anxiety_returns_in_private_review', setup_ref:'12/evening', return_ref:'14/evening', domains:['psyche','relationship','reputation'] }
];

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: CATEGORY,
  role_scope: ROLE,
  title: 'Historie / Fagledelse — evidens, kapasitet, delegasjon og situert tillit',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Hvordan lede historiefaglig arbeid under ressurs-, frist- og styringspress uten at hierarki, omdømme eller organisatorisk behov blir erstatning for kilder, metode, beskyttet motstemme og reell kapasitet?',
    description: 'Fagledelse står mellom profesjonell kunnskapsproduksjon og institusjonell styring. Rollen må prioritere mennesker og ressurser, delegere, eskalere og levere, men samtidig beskytte at historiske påstander fortsatt må bæres av dokumentasjon og metode. Sesongen gjør derfor standing situert: medarbeidere, fagfeller, lederlinje, kvalitetsfunksjoner, bestillere, offentlighet og private relasjoner kan lese samme beslutning ulikt uten at noen av dem får bli én global score eller ny formell myndighet.'
  },
  theme_ids: themes,
  social_environments: [
    'prioriterings- og kapasitetsbordet der frister, kompetanse, ressursramme og valg av hva som ikke skal gjøres blir synlige',
    'det faglige metoderommet der kildegrunnlag, rivalforklaringer, begreper og dokumentert uenighet prøves uten at lederstatus blir evidens',
    'kvalitets- og avvikspunktet der feil, versjoner, korreksjon og institusjonell læring må overleve publiseringspress',
    'handoff- og leveranseflaten der ventepunkt, eier, åpen risiko og bounded rework avgjør om ansvar faktisk følger arbeidet',
    'leder- og bestillergrensen der mandat, ressursbehov, offentlig nytte og ønsket fortelling må skilles fra faglig konklusjon',
    'arkiv- og kildegrensen der proveniens, tilgang, fravær og kildekontekst påvirker hva teamet kan vite og hevde',
    'privatlivet der ansvar, skam, prestisje og utmattelse kan lekke inn i neste arbeidsdag dersom lederidentitet ikke har en tydelig grense'
  ],
  recurring_people_archetypes: people,
  slow_axes: slowAxes,
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    divergence_examples: [
      'En utsatt leveranse kan svekke standing hos bestiller, men styrke standing hos medarbeidere og fagfeller fordi kapasitets- og metodegrensen ble gjort ærlig.',
      'En offentlig korreksjon kan koste institusjonell prestisje kortsiktig, men styrke kvalitets- og publikumstillit fordi feilen ble håndtert sporbar og åpent.',
      'Å beskytte en faglig motstemme kan oppleves som treghet i lederlinjen, men som profesjonell integritet blant historikere og framtidige fagmiljøer.',
      'En tydelig omprioritering kan skape frustrasjon hos teamet som mister kapasitet, men også tillit fordi kostnaden ikke ble skjult eller skjøvet nedover.',
      'Å avvise en bestilt konklusjon kan svekke relasjonell varme hos en oppdragsgiver, men beskytte leveransens anvendelighet fordi sikkerhetsnivået forblir etterprøvbart.',
      'En leder som innrømmer manglende spesialistkompetanse kan tape status i ett rom og samtidig styrke standing hos medarbeidere fordi faglig eierskap blir plassert riktig.',
      'En hard kvalitetsport kan irritere kommunikasjon før frist, men senere redusere behovet for større offentlig korreksjon.',
      'Privat støtte kan hjelpe spilleren å tåle upopulære valg, men gir ingen ny evidens, myndighet eller rett til å dele fortrolig arbeidsmateriale.'
    ],
    rule: 'Standing er audience-spesifikk og kan divergere over tid; samme beslutning kan bygge tillit ett sted og koste den et annet. Ingen standing aggregeres til en global score eller brukes som skjult authority-, evidens- eller ansettelsesmekanisme.',
    authority_separation: 'Ingen global standing, omdømme, History Go-badge eller sosial kapital kan skape evidens eller kildeautoritet, gi rett til å diktere en historisk konklusjon, undertrykke dokumentert faglig motstemme, utvide delegasjon eller linjemyndighet, gi budsjett- eller personalmyndighet, dispensere fra arbeidsmiljø- eller lovkrav, eller gi publiseringsmyndighet som ligger hos andre. Standing beskriver relasjonell tillit til hvordan arbeidet ledes; den erstatter aldri kilder, metode, formell myndighet eller riktig beslutningslinje.'
  },
  materialization: {
    authored_dimensions: ['situated_reputation'],
    source_refs: sourceRefs,
    no_new_runtime: true,
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_people_foundation_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    cross_role_link_materialized: false
  },
  existing_work_continuity: {
    work_loops: grammar.work_loops,
    persistent_work_object: grammar.persistent_work_object_contract.id,
    rhythm: grammar.rhythm_contract,
    new_runtime_state: false,
    plan_steps: plan.sequence.length
  },
  history_go_affordance: {
    source_ref: knowledgeRef,
    badge_id: 'historie',
    better_question: 'History Go-kunnskap kan hjelpe Fagledelse med å stille bedre spørsmål om hvordan periodisering, kildeutvalg, institusjonell hukommelse, fravær i arkiver, perspektiv og historiografiske tradisjoner former en historisk fremstilling. Det bedre spørsmålet er derfor ikke hva spillet allerede har «bevist», men hvilke kilder og alternative forklaringer som mangler, hvilke begreper som styrer tolkningen, hvem som ikke er synlig i materialet, og hvilket sikkerhetsnivå leveransen faktisk tåler. En leder kan bruke denne konteksten til å bestille bedre kildekritikk, beskytte motlesning og formulere mer presise kontrollpunkter, men må fortsatt la det konkrete kildegrunnlaget og faglige arbeidet avgjøre hva som kan hevdes.',
    authority_boundary: 'History Go og et `historie`-Badge kan ikke gi ansettelse, utnevnelse, delegasjon, linje-, budsjett- eller personalmyndighet, kan ikke sertifisere en kilde, diktere en historisk konklusjon, oppheve dokumentert metodeuenighet eller gi publiseringsmyndighet. Affordancen er bare historisk og kildekritisk spørsmålsforbedring.'
  },
  cross_role_proof: {
    status: 'not_materialized_no_shared_work_object',
    shared_work_object_found: false,
    new_runtime: false,
    candidate_when_shared_work_is_real: true,
    rule: 'Cross-role kobling materialiseres først når et faktisk shared work object / delt arbeidsobjekt er bevist mellom Historie/Fagledelse og en annen rolle. At roller kan ha plausible bestillinger, arkivhandoffs, kommunikasjonsbehov eller ledelsesgrensesnitt er ikke i seg selv nok til å opprette ny runtime.'
  },
  season: {
    days: 14,
    day_phases: ['morning','lunch','afternoon','evening'],
    coverage
  },
  primary_threads: primaryThreads,
  private_aftermath: privateAftermath,
  delayed_consequences: delayedConsequences
};

const useCounts = new Map(sourceRefs.map((ref) => [ref, 0]));
for (const beat of coverage) useCounts.set(beat.materialization_refs[0], useCounts.get(beat.materialization_refs[0]) + 1);
for (const [ref, count] of useCounts) must(count >= 3, `${ref} underused: ${count}`);
write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
must(!(index.roles || []).some((entry) => entry.category === CATEGORY && entry.role_scope === ROLE), 'Role World index entry already exists');
index.roles.push({ category:CATEGORY, role_scope:ROLE, status:'role_world_complete', path:WORLD_PATH });
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
must(!checklist.reference_worlds.includes(WORLD_PATH), 'authoring checklist already contains world');
checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

themeBank.reference_profiles ||= {};
themeBank.reference_profiles[KEY] = themes;
write('data/Civication/roleWorldThemeBank.json', themeBank);

console.log(`Materialized ${WORLD_PATH}: 14 days / ${coverage.length} beats / ${sourceRefs.length} canonical source refs / situated reputation only`);
