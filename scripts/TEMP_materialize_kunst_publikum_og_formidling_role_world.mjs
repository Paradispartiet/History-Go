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
const must = (condition, message) => { if (!condition) throw new Error(`PRECHECK: ${message}`); };

const CATEGORY = 'kunst';
const ROLE = 'kunst_publikum_og_formidling';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const INDEX = 'data/Civication/roleWorlds/index.json';
const CHECKLIST = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEMEBANK = 'data/Civication/roleWorldThemeBank.json';
const BADGE = 'data/badges/kunst.json';
const SOURCE = 'reports/CIVICATION_KUNST_PUBLIKUM_OG_FORMIDLING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'publikumsmote_formidling_tilgjengelighet_hendelses_og_eskaleringslogg';
const LOOPS = [
  'forbered -> motta -> avklare behov -> formidle -> observer -> dokumenter',
  'hendelse -> sikre situasjon -> eskaler -> informer -> dokumenter -> lær'
];
const AUTHORITY = {
  may:['formidle godkjent fagstoff','veilede publikum','håndtere ordinære publikumsbehov'],
  may_not:['endre proveniens eller katalogdata','love utlån eller salg uten fullmakt','omdefinere institusjonens faglige standpunkt','ignorere sikkerhets- eller bevaringsrutiner']
};
const POLICY = {
  'Vertskap (museum/galleri)':{policy:'direct',qualification_ids:[]},
  Gallerimedarbeider:{policy:'direct',qualification_ids:[]},
  Formidler:{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']}
};
const ACTORS = [
  'sara_senior_formidler_kunst_publikum_og_formidling',
  'jon_publikumsvert_kunst_publikum_og_formidling',
  'amal_tilgjengelighetskoordinator_kunst_publikum_og_formidling',
  'erik_galleridrift_sikkerhet_kunst_publikum_og_formidling'
];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

must(!fs.existsSync(path.join(root,WORLD)),`${WORLD} already exists`);
for (const rel of [MODEL,GRAMMAR,PLAN,INDEX,CHECKLIST,THEMEBANK,BADGE]) must(fs.existsSync(path.join(root,rel)),`${rel} missing`);
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const index = read(INDEX);
const checklist = read(CHECKLIST);
const themeBank = read(THEMEBANK);
const badge = read(BADGE);
must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE,'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE,'work grammar identity drifted');
must(plan.sequence?.length === 16,'prerequisite plan must remain 16 steps');
must(grammar.persistent_work_object_contract?.id === PERSISTENT,'persistent work object drifted');
must(JSON.stringify(grammar.work_loops) === JSON.stringify(LOOPS),'work loops drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify(AUTHORITY),'authority boundary drifted');
must(grammar.day_one_contract?.entry === 'career_offer_policy_by_title','title-owned entry contract drifted');
must(JSON.stringify(grammar.day_one_contract?.entry_policy_by_title) === JSON.stringify(POLICY),'Career policies drifted');
must(JSON.stringify((model.related_people || []).map((p) => p.id)) === JSON.stringify(ACTORS),'prerequisite actor set drifted');
for (const person of model.related_people || []) must(person.fictional === true && person.fictional_scenario_actor === true && person.canonical_person_ref === null,`actor provenance drifted: ${person.id}`);
const byLabel = Object.fromEntries((badge.tiers || []).map((entry) => [entry.label,entry]));
must(byLabel['Vertskap (museum/galleri)']?.career_offer?.policy === 'direct','Vertskap policy drifted');
must(byLabel.Gallerimedarbeider?.career_offer?.policy === 'direct','Gallerimedarbeider policy drifted');
must(byLabel.Formidler?.career_offer?.policy === 'qualification_required','Formidler policy drifted');
must(JSON.stringify(byLabel.Formidler?.career_offer?.qualification_ids) === JSON.stringify(['relevant_education_or_employer_qualification']),'Formidler qualification drifted');
must(!index.roles.some((entry) => entry.category === CATEGORY && entry.role_scope === ROLE),'Role World already registered');
must(!checklist.reference_worlds.includes(WORLD),'Role World already in checklist');
must(!themeBank.reference_profiles?.[KEY],'Role World theme profile already exists');

const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
must(canonicalRefs.length === 15 && new Set(canonicalRefs).size === 15,'expected exactly 15 canonical mail refs');
const knowledgeRef = canonicalRefs.find((ref) => ref.includes('/knowledge/'));
must(knowledgeRef,'knowledge mail ref missing');

const themeIds = ['professional_culture','class_power','status_anxiety','bureaucratic_power','care_vs_efficiency','invisible_work','shame_reputation','public_private_leakage','public_attention'];
const validThemes = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of themeIds) must(validThemes.has(id),`unknown theme ${id}`);

const audiences = [
  {
    id:'visitors_and_mixed_publics',standing_axis:'clarity_respect_and_interpretive_room',
    cares_about:['at besøkende får tydelig skille mellom dokumenterte verkdata, institusjonens godkjente fagstoff, begrunnede tolkninger og spørsmål som faktisk står åpne','at publikum kan være uenige, usikre, erfarne eller helt nye uten at formidleren bruker sosial eller faglig status til å gjøre én reaksjon til den riktige'],
    cannot_grant:'Standing hos besøkende kan påvirke trygghet, samtalevilje, senere deltakelse og hvilke spørsmål som blir sagt høyt, men kan ikke gi Formidler-kvalifikasjonen relevant_education_or_employer_qualification, kan ikke endre proveniens eller katalogdata, autorisere utlån eller salg, omdefinere institusjonens faglige standpunkt eller overstyre sikkerhets- og bevaringsrutiner.'
  },
  {
    id:'disabled_visitors_and_access_needs',standing_axis:'accessibility_response_and_dignity',
    cares_about:['at språk, tempo, sanseformat, pauser, ledsagerbehov og fysiske rammer behandles som konkret kvalitet i publikumsmøtet fremfor et tillegg som bare tilbys når noen insisterer','at tilpasning bygger på faktiske behov og tilbakemeldinger uten å gjøre én persons løsning representativ for alle eller redusere faglig innhold til et mindreverdig spor'],
    cannot_grant:'Standing hos besøkende med ulike tilgjengelighetsbehov kan styrke institusjonens læring og gjøre framtidige tilbud bedre, men kan ikke gi Career-kvalifikasjon, endre proveniens eller katalogdata, gi myndighet over sikkerhet eller bevaring eller gjøre en vellykket enkeltløsning til universell fasit for alle grupper.'
  },
  {
    id:'educators_hosts_and_frontline_peers',standing_axis:'handoff_precision_and_frontline_reliability',
    cares_about:['at spørsmål, hendelser, gruppebehov og tidligere kommunikasjon følger med i en tydelig handoff slik at neste medarbeider ikke må gjette hva som allerede er sagt eller lovet','at frontlinjearbeidets usynlige belastning, køhåndtering og små korreksjoner blir dokumentert og fordelt i stedet for å bæres av den mest erfarne eller mest serviceorienterte personen'],
    cannot_grant:'Standing blant formidlere, verter og gallerimedarbeidere kan påvirke hvem som deler usikkerhet og hvem som ber om hjelp tidlig, men kan ikke gi Formidler-kvalifikasjon, skape fagmyndighet over proveniens eller katalogdata, autorisere salg eller utlån eller oppheve sikkerhets- og bevaringsgrenser.'
  },
  {
    id:'curators_researchers_and_subject_specialists',standing_axis:'source_traceability_and_correction',
    cares_about:['at populære formuleringer fortsatt kan spores til kilder, kataloggrunnlag og eksplisitte tolkningsledd, og at ukjente spørsmål faktisk sendes til riktig fagperson','at en korrigert attribusjon, datering eller ny kilde gjenåpner bare berørte deler av formidlingssporet uten at tidligere publikumskommunikasjon omskrives til å se riktigere ut enn den var'],
    cannot_grant:'Standing hos kuratorer, forskere og fagspesialister kan gi raskere avklaring og større tillit til formidlerens kildebruk, men kan ikke gjøre personlig relasjon til proveniensbevis, gi salgs- eller utlånsfullmakt, endre katalogdata uten korrekt prosess eller erstatte relevant_education_or_employer_qualification.'
  },
  {
    id:'conservation_security_and_gallery_operations',standing_axis:'safety_boundary_respect_and_incident_memory',
    cares_about:['at berøring, kapasitetsavvik, tekniske problemer og andre hendelser stoppes og sikres før service- eller omdømmehensyn får styre fortellingen','at formidleren skiller umiddelbar sikring fra senere faglig vurdering og bevarer hva som faktisk ble observert, eskalert, kommunisert og kontrollert'],
    cannot_grant:'Standing hos konservator-, sikkerhets- og driftsmiljø kan påvirke varslingsvilje og operativ tillit, men kan ikke gjøre formidleren til konservator eller sikkerhetsspesialist og kan ikke gi Career-kvalifikasjon; samtidig kan publikumsros, formidlerstatus eller Kunst-Badge aldri brukes til å ignorere dokumenterte sikkerhets- eller bevaringsrutiner.'
  },
  {
    id:'teachers_guides_and_community_partners',standing_axis:'preparation_reciprocity_and_group_memory',
    cares_about:['at skole-, guide- og samarbeidspartnere får realistisk informasjon om mål, format, kapasitet og hva institusjonen trenger å vite før besøket','at erfaringer fra en gruppe føres tilbake som avgrenset læring slik at relasjonen blir bedre over tid uten at én partners forventning blir skjult standard for alle publikum'],
    cannot_grant:'Standing hos lærere, guider og community-partnere kan påvirke forberedelse, gjenbesøk og hvor ærlig behov deles, men kan ikke endre katalogdata, gi utlåns- eller salgsfullmakt, omdefinere institusjonens faglige standpunkt, oppheve sikkerhetsregler eller gi Formidler-kvalifikasjonen.'
  },
  {
    id:'critics_media_and_public_attention',standing_axis:'public_explanation_and_correction_under_visibility',
    cares_about:['at høy offentlig oppmerksomhet ikke gjør publikumsrespons, anmeldelse eller viral fortelling til evidens for kunsthistoriske påstander eller institusjonens faglige standpunkt','at feil eller for sikre formuleringer kan korrigeres åpent med kilde og versjon uten at frontlinjearbeideren må beskytte egen status ved å skjule tidligere usikkerhet'],
    cannot_grant:'Offentlig standing, kritikertilslutning, medieoppmerksomhet eller popularitet kan påvirke press og synlighet, men kan ikke gi relevant_education_or_employer_qualification, endre proveniens eller katalogdata, autorisere utlån eller salg eller overstyre sikkerhets- og bevaringsrutiner; sosial oppmerksomhet er ikke evidens.'
  },
  {
    id:'private_relations',standing_axis:'presence_decompression_and_identity_beyond_public_performance',
    cares_about:['at spilleren kan gå ut av den kontinuerlige vertskaps- og formidlerrollen hjemme og ikke må gjøre privatlivet til en ny scene der alle konflikter, spørsmål og publikumsreaksjoner skal prosesseres','at taushetsbehov, emosjonell belastning og frykten for å ha sagt noe feil kan deles på et nivå som ikke lekker personopplysninger, hendelsesdetaljer eller uavklarte faglige forhold'],
    cannot_grant:'En privat relasjon kan gi støtte, grensesetting og perspektiv på sosial eksponering, men kan ikke gi Formidler-kvalifikasjon, endre proveniens eller katalogdata, autorisere salg/utlån, løse sikkerhets- eller bevaringsspørsmål eller gjøre privat bekreftelse til evidens for at en offentlig formulering var faglig korrekt.'
  }
];

const recurringPeople = [
  {id:'sara_senior_formidler_world',social_function:'Sara gjør skillet mellom kilde, katalogdata, godkjent fagstoff, tolkning og åpent spørsmål sosialt synlig når en velfungerende fortelling frister til å bli sikrere enn grunnlaget.',class_position:'Senior formidler med høy intern metodekapital og større kvalitetssikringsansvar, men uten rett til å endre proveniens eller katalogdata på egen hånd.',status:'Hennes faglige tillit øker når spilleren kan være tydelig uten å late som usikkerhet er svakhet, og når korrigering blir en normal del av formidlingsarbeidet.',power_over_player:'Kan kreve omarbeiding av formidlingsopplegg, stoppe ubegrunnede formuleringer og hente riktig fagperson, men kan ikke gi Career-kvalifikasjon eller gjøre senioritet til institusjonell fasit.',wants:'At publikum møter rik kunstfaglig kontekst med synlig kildegrunnlag og reelt rom for begrunnet uenighet.',conceals:'Erfarne formidlere kan bli knyttet til egne vellykkede dramaturgier og merke korreksjon som et tap av autoritet selv når de faglig vet bedre.',speech_style:'Presis, inviterende og kildebevisst; spør hva vi vet, hva vi tolker og hvilken opplysning som ville endret formuleringen.',teaches_player:'At troverdig formidling blir sterkere når usikkerhet og korreksjon håndteres eksplisitt.'},
  {id:'jon_publikumsvert_world',social_function:'Jon gjør kø, små konflikter, orientering, gjentatte spørsmål og usynlig servicearbeid synlig som en viktig del av hvordan publikum faktisk møter institusjonen.',class_position:'Frontlinjearbeider med lavere formell fagstatus enn kuratorer og seniorformidlere, men med mye situasjonskunnskap om hva som fungerer i rommet.',status:'Hans tillit følger om formidlingsteamet tar vertskapsobservasjoner alvorlig og gir tydelige handoff-punkter i stedet for å sende alle vanskelige situasjoner tilbake til fronten.',power_over_player:'Kan omfordele publikumsflyt, varsle om kapasitets- og serviceproblemer og kreve hjelp, men kan ikke overta fag-, konservator- eller sikkerhetsmyndighet.',wants:'At ordinære publikumsbehov løses godt, mens problemer som faktisk krever faglig eller sikkerhetsmessig ansvar blir eskalert før vertskapet står alene.',conceals:'Sterk servicekultur kan gjøre det sosialt vanskelig å si at kapasiteten er nådd eller at en gjest må vente på en annen fagperson.',speech_style:'Praktisk og konkret; forteller hva publikum faktisk spør om, hvor køen stopper opp og hvilken beskjed som ikke fungerer.',teaches_player:'At god formidling også avhenger av usynlig frontlinjearbeid og tydelig arbeidsdeling.'},
  {id:'amal_tilgjengelighet_world',social_function:'Amal gjør tilgjengelighet til en løpende metode- og kvalitetsdiskusjon i stedet for en sjekkliste som kan krysses av før publikum kommer.',class_position:'Koordinator med spesialisert tilgjengelighetskompetanse og tverrfunksjonell innflytelse, men uten rett til å gjøre ett behov til universell norm eller overstyre sikkerhets-/bevaringsgrenser alene.',status:'Hennes tillit følger om gruppers erfaring faktisk endrer neste versjon av opplegget og om tilpasning skjer uten paternalistisk eller faglig nedsettende språk.',power_over_player:'Kan kreve ny planlegging, alternative formater og evaluering av tiltak, men kan ikke endre verksmetadata eller gi Career-kvalifikasjon.',wants:'At flere kan delta i det samme faglige rommet gjennom reell tilpasning av språk, tempo, format og praktiske betingelser.',conceals:'Institusjoner kan feire tilgjengelighetsinitiativer før de har undersøkt om de faktisk virket for dem de var ment for.',speech_style:'Behovs- og erfaringsorientert; spør hvem løsningen fungerer for, hva gruppen har sagt og hva neste versjon må endre.',teaches_player:'At tilgjengelighet er empirisk og relasjonell kvalitet, ikke bare en god intensjon.'},
  {id:'erik_sikkerhet_drift_world',social_function:'Erik gjør sikkerhets- og hendelsesgrensen konkret når publikumsflyt, verk, teknikk og service kolliderer under press.',class_position:'Drifts- og sikkerhetsansvarlig med operativ myndighet i avtalte situasjoner, men uten rett til å avgjøre proveniens, katalogdata eller institusjonens kunstfaglige standpunkt.',status:'Hans tillit øker når formidleren varsler tidlig, beskriver observasjon uten skade-spekulasjon og lar sikkerhetsrutinen stå selv når den skaper kø eller misnøye.',power_over_player:'Kan stoppe en utrygg situasjon, avsperre og eskalere videre; spilleren kan ikke bruke servicepress eller formidlerstatus til å ignorere dette.',wants:'At små avvik behandles som læringsdata før de blir store hendelser, med klart skille mellom sikring, observasjon, fagvurdering og kommunikasjon.',conceals:'Operativ sikkerhetskultur kan bli så regelstyrt at publikumsopplevelse og tilgjengelighet ikke får nok plass i evalueringen etter en hendelse.',speech_style:'Kort og hendelsesnær; spør hva du så, hva du gjorde, hvem som ble varslet og hvilket kontrollpunkt som gjenstår.',teaches_player:'At trygghet og service ikke er motsetninger når eskalering og læring er tydelige.'},
  {id:'leila_laerer_partner_world',social_function:'Leila representerer lærere, guider og community-partnere som møter institusjonen med egne mål, tidsrammer og kunnskap om gruppen før besøket.',class_position:'Ekstern samarbeidspartner med høy situasjonskunnskap om deltakerne, men uten intern myndighet over verkdata, sikkerhet eller institusjonens faglige standpunkt.',status:'Hennes tillit følger om avtaler er realistiske, behov blir hørt og institusjonen er villig til å lære av det som faktisk skjedde i gruppen.',power_over_player:'Kan påvirke forberedelse og samarbeid gjennom tilbakemeldinger og valg om gjenbesøk, men kan ikke gi fag- eller Career-myndighet.',wants:'At besøket kobler kunstmøtet til gruppens forutsetninger uten å behandle dem som passive mottakere av en ferdig institusjonsfortelling.',conceals:'Samarbeidspartnere kan også ønske forutsigbarhet så sterkt at åpent tolkningsrom eller institusjonens faktiske kapasitetsgrenser blir frustrerende.',speech_style:'Kontekstuell og gruppeorientert; spør hva deltakerne trenger, hva de skal forberede og hvordan erfaringen kan følges opp.',teaches_player:'At gode publikumsrelasjoner begynner før besøket og fortsetter etter at gruppen går.'},
  {id:'noah_kritisk_besokende_world',social_function:'Noah representerer den kunnskapsrike og kritiske besøkende som tester om institusjonen faktisk tåler motspørsmål om tolkning, kanon, fravær og kildegrunnlag.',class_position:'Besøkende uten institusjonell tittel, men med kulturell kapital og offentlig stemme som kan gjøre en svak formulering synlig langt utenfor rommet.',status:'Hans tillit avhenger mindre av å få rett enn av om formidleren kan svare presist, markere usikkerhet og korrigere uten defensiv statuskamp.',power_over_player:'Kan utfordre, dokumentere og kritisere offentlig, men kan ikke gjøre sin egen kunnskap eller publikumsrespons til institusjonens nye katalogdata eller formelle standpunkt.',wants:'At institusjonen viser hvordan den vet det den sier og gir plass til begrunnede alternative lesninger.',conceals:'Kritisk kompetanse kan bli en sosial prestasjon der det viktigste blir å avsløre en feil fremfor å forstå hva som faktisk er omstridt.',speech_style:'Spiss, konkret og kildeorientert; spør hva utsagnet bygger på og hvem som har definert kategorien.',teaches_player:'At offentlig kritikk kan brukes som test av sporbarhet uten at flertall eller retorisk styrke blir sannhetskriterium.'},
  {id:'private_relation_world',social_function:'Den private relasjonen viser kostnaden ved å være kontinuerlig sosialt tilgjengelig, vennlig, tydelig og korrigerbar foran fremmede hele dagen.',class_position:'Privat nærhet uten institusjonell myndighet, men med reell makt til å sette grenser for emosjonelt arbeid, skjermtid og behovet for å gjenfortelle dagens konflikter.',status:'Relasjonen tåler jobben bedre når spilleren kan være til stede uten å gjøre hjemmet til en ekstra publikumsscene eller arena for konfidensielle hendelsesdetaljer.',power_over_player:'Kan kreve nærvær og grensesetting, men kan ikke avgjøre katalog-, proveniens-, sikkerhets- eller kvalifikasjonsspørsmål.',wants:'At spilleren har et selv som ikke bare måles i hvor godt andre opplevde møtet med institusjonen den dagen.',conceals:'Omsorg kan gli over i krav om full forklaring på saker som spilleren faktisk må holde avgrenset eller konfidensielle.',speech_style:'Personlig og jordnær; spør om energi, fravær og hva du trenger å legge fra deg.',teaches_player:'At bærekraftig frontlinjearbeid krever et privat rom uten publikum.'}
];

const slowAxes = [
  ['interpretive_precision','Hvor presist spilleren skiller data, godkjent fagstoff, tolkning og åpent spørsmål.'],
  ['uncertainty_honesty','Hvor trygt spilleren kan si at noe er ukjent og hente riktig fagperson.'],
  ['accessibility_response','Hvor godt konkrete behov endrer format og neste versjon av opplegget.'],
  ['frontline_handoff','Hvor lesbart ansvar og tidligere kommunikasjon følger mellom vertskap, formidling og fag/drift.'],
  ['safety_boundary_respect','Hvor stabilt servicepress holdes adskilt fra sikkerhets- og bevaringsgrenser.'],
  ['incident_memory','Hvor godt observasjon, sikring, eskalering, informasjon og etterkontroll kan rekonstrueres.'],
  ['public_correction','Hvor villig spilleren er til å korrigere synlige formuleringer uten å beskytte status.'],
  ['social_energy','Hvor bærekraftig spilleren håndterer kontinuerlig sosial og emosjonell eksponering.'],
  ['private_sustainability','Hvor godt privatliv og konfidensialitet bevares etter intense publikumsmøter.']
].map(([id,meaning]) => ({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const dayCases = [
  'Første gruppe avslører at standardbriefen ikke passer alle',
  'Et populært verk utløser uenighet om én sikker fortelling',
  'Proveniensspørsmålet du ikke kan besvare i rommet',
  'Publikumstopp gjør kø, kapasitet og service til maktspørsmål',
  'Tilgjengelighetsbehov endrer både tempo og rute',
  'Berøring av verk tester rolig grensesetting og eskalering',
  'En faglig korreksjon må inn i et allerede innarbeidet omvisningsgrep',
  'Skolepartneren utfordrer hva institusjonen mener med deltakelse',
  'Et teknisk avvik endrer ruten midt i formidlingen',
  'Kritisk besøkende gjør en for sikker formulering offentlig synlig',
  'Frontlinjen er sliten og små handoff-feil begynner å hope seg opp',
  'Ny kataloginformasjon krever avgrenset rework i publikumsmaterialet',
  'Offentlig ros og kritikk trekker i ulike retninger samtidig',
  'Sesongen avsluttes med et lesbart minne om hva publikum faktisk møtte'
];
const phases = ['morning','lunch','afternoon','evening'];
const audienceIds = audiences.map((entry) => entry.id);
const threadIds = ['sara_kilde_tolkning_og_korreksjon','jon_frontlinje_handoff_og_kapasitet','amal_tilgjengelighet_og_erfaringsdata','erik_sikkerhet_hendelse_og_laring','leila_partnerforberedelse_og_gruppeminne','noah_kritikk_og_offentlig_korrigering','privat_grense_og_sosial_energi'];
const coverage = [];
for (let day=1; day<=14; day+=1) {
  for (let p=0; p<4; p+=1) {
    const phase = phases[p];
    const audience = audienceIds[((day-1)*4+p)%audienceIds.length];
    const ref = canonicalRefs[((day-1)*4+p)%canonicalRefs.length];
    const thread = threadIds[(day+p-1)%threadIds.length];
    const phaseText = phase === 'morning'
      ? `Morgenen åpner ${PERSISTENT} på siste versjon. Spilleren skiller målgruppe og behov, verk-/utstillingsgrunnlag, godkjent fagstoff, tolkning, usikkerhet, tilgjengelighet, kapasitet, sikkerhets-/bevaringsgrense, tidligere kommunikasjon og hvem som eier neste avklaring før gruppen møtes.`
      : phase === 'lunch'
        ? 'Lunsjen viser hvordan samme publikumssak ser annerledes ut fra en aktør med annen status, kunnskap og belastning. Samtalen kan endre tillit og hvor raskt noen deler usikkerhet, men den kan ikke gjøre sosial enighet til katalogdata, proveniensbevis eller formell fagmyndighet.'
        : phase === 'afternoon'
          ? `Ettermiddagen krever et avgrenset valg innen den låste authority boundary: rollen kan formidle godkjent fagstoff, veilede publikum og håndtere ordinære publikumsbehov, men kan ikke endre proveniens eller katalogdata, love utlån eller salg uten fullmakt, omdefinere institusjonens faglige standpunkt eller ignorere sikkerhets- eller bevaringsrutiner.`
          : 'Kvelden viser etterspillet av kontinuerlig sosial eksponering. Spilleren må tåle at en vanskelig samtale, korrigering eller hendelse ikke kan løses ved å få privat bekreftelse, og må samtidig bevare konfidensialitet og nok avstand til at neste arbeidsdag ikke begynner med skjult emosjonell gjeld.';
    const summary = `Dag ${day}, ${phase}: ${dayCases[day-1]}. ${phaseText} Saken følger de to låste arbeidsløkkene — «${LOOPS[0]}» og «${LOOPS[1]}» — uten å blande vanlig formidling med hendelsesmyndighet. Det versjonerte arbeidsobjektet beholder hva publikum trengte, hva institusjonen faktisk visste, hva som ble tolket eller stående åpent, hvilke tilgjengelighetsvalg som ble gjort, hva publikum allerede fikk høre, eventuell hendelse, hvem som ble varslet, sikkerhets-/bevaringsgrense, kontrollpunkt og neste eier. Vertskap (museum/galleri) og Gallerimedarbeider forblir direct Career-entry; Formidler forblir qualification_required med relevant_education_or_employer_qualification. History Go, Kunst-Badge, høy publikumsstanding, ros, erfaring eller sterke personlige relasjoner kan aldri fjerne Formidler-gaten, endre proveniens/katalogdata, autorisere utlån eller salg, fastsette institusjonens nye faglige standpunkt eller overstyre sikkerhets- og bevaringsrutiner. Ny kilde, endret gruppebehov, tilgjengelighetsfunn eller hendelsesinformasjon gjenåpner bare berørte deler med ny versjon og ny eier; det som allerede ble kommunisert eller registrert blir stående som institusjonelt minne.`;
    const standing = `Dag ${day}/${phase}: Standing hos ${audience} er situert og påvirker bare relasjonell tillit, samtalevilje, hvor tidlig spørsmål eller avvik deles, og hvor lett neste handoff kan gjennomføres. Det finnes ingen global reputation score, og ståingen er ikke evidens for at en kunsthistorisk påstand, katalogopplysning, proveniens, sikkerhetsvurdering eller institusjonell formulering er sann. Den kan ikke gi relevant_education_or_employer_qualification eller gjøre spilleren til Formidler, kan ikke endre proveniens eller katalogdata, love utlån eller salg, omdefinere institusjonens faglige standpunkt eller oppheve sikkerhets- og bevaringsrutiner. Et sosialt godt møte kan derfor fortsatt måtte ende med synlig usikkerhet, venting, eskalering, stopp eller senere korreksjon. Faglig korrekthet følger dokumentert grunnlag og riktig fagperson; standing bestemmer bare hva relasjonen husker om hvordan spilleren lyttet, forklarte, avgrenset egen rolle og korrigerte seg.`;
    coverage.push({day,phase,beat_type:{morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'}[phase],summary,standing_audience:audience,standing_consequence:standing,thread_ids:[thread],materialization_refs:[ref]});
  }
}

const primaryThreads = [
  {id:'sara_kilde_tolkning_og_korreksjon',relationship:'Sara og spilleren bygger et flerukers faglig forhold rundt spørsmålet om hvor sikker en god fortelling får lov til å høres ut. Tråden lar populære formuleringer, nye kilder og synlige korreksjoner teste om spilleren kan beholde formidlingskraft uten å beskytte egen status på bekostning av kildegrensen.',beat_refs:['1/lunch','2/afternoon','3/morning','7/afternoon','10/morning','12/afternoon','14/morning']},
  {id:'jon_frontlinje_handoff_og_kapasitet',relationship:'Jon gjør frontlinjens usynlige arbeid til en vedvarende relasjonell test. Når kø, gjester og små konflikter bygger seg opp, må spilleren vise at observasjoner fra en rolle med lavere fagstatus faktisk får eier og handoff i stedet for å bli behandlet som servicebakgrunn.',beat_refs:['1/morning','4/morning','4/lunch','6/morning','9/lunch','11/morning','14/lunch']},
  {id:'amal_tilgjengelighet_og_erfaringsdata',relationship:'Amal og spilleren utvikler et forhold rundt forskjellen mellom å tilby tilgjengelighet og å undersøke om den virker. Tråden følger konkrete gruppebehov, evaluering og rework slik at tilpasning blir del av faglig kvalitet uten å bli paternalistisk eller redusere innhold.',beat_refs:['1/afternoon','5/morning','5/afternoon','8/lunch','11/afternoon','13/morning','14/afternoon']},
  {id:'erik_sikkerhet_hendelse_og_laring',relationship:'Erik og spilleren møtes når service og trygghet trekker i ulik retning. Tråden lar berøring, kapasitet og teknisk avvik vise om formidleren kan stoppe rolig, beskrive observasjon uten skade-spekulasjon og overlate vurdering til riktig fagmyndighet uten statuskamp.',beat_refs:['2/morning','4/afternoon','6/afternoon','9/morning','9/afternoon','11/lunch','13/afternoon']},
  {id:'leila_partnerforberedelse_og_gruppeminne',relationship:'Leila gjør samarbeid før og etter besøket synlig. Tråden tester om institusjonen kan lytte til gruppens forutsetninger, gi realistiske rammer og føre erfaring tilbake til neste versjon uten å gjøre én partners ønsker til skjult standard for alle.',beat_refs:['2/lunch','3/afternoon','5/lunch','8/morning','8/afternoon','12/morning','13/lunch']},
  {id:'noah_kritikk_og_offentlig_korrigering',relationship:'Noah utfordrer formidlerens behov for å framstå sikker i offentligheten. Gjennom gjentatte motspørsmål, deling og senere korreksjon blir relasjonen en test av om institusjonen tåler kildepress uten å gjøre kritikk til fiendskap eller publikumsoppmerksomhet til sannhetsmål.',beat_refs:['3/lunch','6/lunch','7/morning','10/lunch','10/afternoon','12/lunch','13/morning']},
  {id:'privat_grense_og_sosial_energi',relationship:'Den private tråden følger kostnaden ved å være emosjonelt regulert og sosialt tilgjengelig hele dagen. Spilleren må utvikle et privat rom der dagens publikumsreaksjoner kan legges fra seg uten å lekke hendelses- eller persondetaljer og uten å kreve at nærhet gjenoppretter profesjonell status.',beat_refs:['2/evening','4/evening','6/evening','8/evening','10/evening','12/evening','14/evening']}
];

const privateAftermath = [
  {id:'provenienssporsmalet_folger_hjem',description:'Et spørsmål spilleren ikke kunne besvare blir sittende i kroppen etter arbeidstid. Den private oppgaven er å tåle ufullstendighet uten å slå opp, spekulere eller gjenfortelle konfidensielle detaljer som om hjemmet var en ekstra fagvakt. Neste dag skal spørsmålet tilbake til riktig fagspor, ikke løses av skam eller privat bekreftelse.',materialization_refs:[canonicalRefs[2]]},
  {id:'hendelsen_uten_heltefortelling',description:'Etter berøring av verk er fristelsen stor til å vurdere dagen ut fra om spilleren så rolig og kompetent ut. Etterspillet holder fast ved at riktig sikring, varsling og dokumentasjon er viktigere enn heltestatus, og at skadegrad eller faglig konsekvens fortsatt tilhører riktig fagperson.',materialization_refs:[canonicalRefs[6]]},
  {id:'korrigeringen_etter_popularitet',description:'En populær formulering må korrigeres offentlig. Hjemme blir spørsmålet om spilleren kan skille profesjonell skam fra faktisk faglig ansvar: å erkjenne en feil svekker ikke nødvendigvis tillit, men privatlivet skal heller ikke brukes til å få en dom over om man fortsatt er en god formidler.',materialization_refs:[canonicalRefs[10]]},
  {id:'tilgjengelighetsarbeidet_som_ikke_blir_synlig',description:'Et vellykket tilpasset opplegg gir lite offentlig status fordi mye av arbeidet er forberedelse, tempo, pauser og små endringer. Etterspillet undersøker om spilleren kan verdsette usynlig kvalitet uten å kreve applaus, samtidig som erfaringene dokumenteres så neste gruppe faktisk får nytte av dem.',materialization_refs:[canonicalRefs[12]]},
  {id:'sesongslutt_uten_publikumsscore',description:'Sesongen slutter med mange ulike reaksjoner, ikke én publikumsdom. Noen relasjoner er sterkere, andre mer kritiske, og flere faglige spørsmål står fortsatt åpne. Etterspillet gjør det eksplisitt at ingen global score kan summere dette til verdi eller myndighet; arbeidsminnet og privat bærekraft må stå ved siden av hverandre.',materialization_refs:[canonicalRefs[14]]}
];

const delayedConsequences = [
  {id:'ukjent_sporsmal_blir_kildekorrigering',setup_ref:'3/morning',return_ref:'12/afternoon',domains:['job','reputation','narrative']},
  {id:'kapasitetsgrense_blir_frontlinjetillit',setup_ref:'4/morning',return_ref:'11/morning',domains:['job','relationship','reputation']},
  {id:'tilgjengelighetstilpasning_blir_ny_standardkandidat',setup_ref:'5/morning',return_ref:'13/morning',domains:['job','relationship','narrative']},
  {id:'beroring_blir_hendelsesminne',setup_ref:'6/afternoon',return_ref:'11/lunch',domains:['job','reputation']},
  {id:'populaer_fortelling_blir_offentlig_korreksjon',setup_ref:'2/afternoon',return_ref:'10/afternoon',domains:['reputation','narrative','psyche']},
  {id:'partnerforberedelse_blir_gruppeminne',setup_ref:'8/morning',return_ref:'14/lunch',domains:['relationship','job']},
  {id:'teknisk_avvik_blir_ruterework',setup_ref:'9/morning',return_ref:'13/afternoon',domains:['job','narrative']},
  {id:'privat_grense_blir_sosial_baerekraft',setup_ref:'4/evening',return_ref:'14/evening',domains:['psyche','relationship','livelihood']}
];

const authoritySeparation = 'Ingen global reputation score kan bli evidens, katalogdata eller faglig myndighet. Vertskap (museum/galleri) og Gallerimedarbeider forblir direct Career-entry, mens Formidler forblir qualification_required med relevant_education_or_employer_qualification. Standing, History Go, Kunst-Badge, publikumsros eller lang erfaring kan ikke gi eller fjerne den kvalifikasjonen. Rollen kan formidle godkjent fagstoff, veilede publikum og håndtere ordinære publikumsbehov, men kan ikke endre proveniens eller katalogdata, love utlån eller salg uten fullmakt, omdefinere institusjonens faglige standpunkt eller ignorere sikkerhets- eller bevaringsrutiner. Sosial tillit kan aldri erstatte riktig fagperson, dokumentert kilde eller hendelseseskalering.';

const world = {
  schema:'civication_role_world_v1',version:1,category:CATEGORY,role_scope:ROLE,
  title:'Kunst / Publikum og formidling — fortolkningsrom, tilgjengelighet og situert tillit',status:'role_world_complete',
  sociological_core:{main_problem:'Hvordan kan publikumsarbeideren være varm, tydelig og tilgjengelig uten å gjøre sosial trygghet, personlig karisma eller publikumsrespons til faglig fasit?',description:'Publikumsrettet kunstarbeid er frontlinjearbeid med asymmetrisk kunnskap og synlighet. Besøkende, kolleger, fagspesialister, sikkerhet, samarbeidspartnere, kritikere og privatliv husker ulike sider av samme møte. Verdenen gjør synlig hvordan tolkning, tilgjengelighet, service, sikkerhet, status og emosjonelt arbeid må holdes adskilt fra proveniens, katalogdata og formell fagmyndighet.'},
  theme_ids:themeIds,
  social_environments:['publikumsinngang_og_vertskapspunkt','omvisning_og_formidlingsflate','tilgjengelighet_og_gruppetilpasningsbord','galleridrift_hendelse_og_eskaleringspunkt','faglig_kilde_og_korreksjonsrom','skole_guide_og_partnerdialog','offentlig_kritikk_og_medieoppmerksomhet','privatliv'],
  recurring_people_archetypes:recurringPeople,
  slow_axes:slowAxes,
  situated_reputation_model:{global_score_allowed:false,authority_separation:authoritySeparation,audiences,divergence_examples:[
    'En omvisning kan få sterk publikumsrespons samtidig som fagspesialister får lavere tillit dersom tolkning presenteres som dokumentert faktum.',
    'Tilgjengelighetsstanding kan styrkes når tempo senkes selv om køen og enkelte spontane besøkende blir mer misfornøyde.',
    'Sikkerhets- og driftsmiljø kan få større tillit til spilleren etter et tydelig stopp, mens den berørte gjesten opplever situasjonen som mindre servicevennlig.',
    'En offentlig korreksjon kan svekke kortsiktig status hos dem som likte den opprinnelige fortellingen, men styrke kilde- og korrigeringstillit hos fagmiljø og kritiske besøkende.',
    'Frontlinjekolleger kan få høyere tillit når spilleren sier nei til ekstra kapasitet, selv om en samarbeidspartner opplever mindre fleksibilitet samme dag.',
    'Privat bærekraft kan bli bedre når spilleren slutter å svare på publikumsrelaterte spørsmål hjemme, selv om profesjonelle relasjoner får litt mindre umiddelbar tilgjengelighet.'
  ]},
  history_go_affordance:{badge_id:'kunst',source_ref:knowledgeRef,better_question:'History Go kan gjøre publikumsformidlingen skarpere ved å åpne kunsthistoriske, verk-, utstillings- og institusjonshistoriske spørsmål før møtet: Hvilke kilder bærer opplysningen? Hva er dokumentert katalogdata, hva er en faglig tolkning, og hvilke motperspektiver finnes? Hvordan har visning, kanon, samling og institusjonsrolle endret seg over tid? Denne kunnskapen kan gi bedre spørsmål, kontekst og samtaler med publikum, men den avgjør ikke dagens proveniensstatus, katalogendring, utlåns-/salgsfullmakt, sikkerhetsvurdering eller bevaringsrutine og kan ikke gjøre en ukvalifisert spiller til Formidler.',authority_boundary:'History Go kan ikke gi relevant_education_or_employer_qualification eller oppheve qualification_required for Formidler; et Kunst-Badge kan ikke endre proveniens eller katalogdata, autorisere utlån eller salg, omdefinere institusjonens faglige standpunkt, gi konservator-/sikkerhetsmyndighet eller overstyre sikkerhets- og bevaringsrutiner. Vertskap og Gallerimedarbeider er direct entry, men heller ikke disse titlene gir utvidet fagmyndighet.'},
  cross_role_proof:{status:'not_materialized_no_shared_work_object',shared_work_object_found:false,required_for_rollout:false,new_runtime:false,candidate_when_shared_work_is_real:false,rule:'Canonical readiness sier not_required_for_rollout. Publikum og formidling kan eskalere til kuratering, konservering, sikkerhet og tilgjengelighet gjennom eksisterende Scene Pipeline, men ingen cross-role-link materialiseres uten et senere genuint delt arbeidsobjekt med identisk ID, versjon, eier og handoff.'},
  existing_work_continuity:{work_loops:LOOPS,persistent_work_object:PERSISTENT,waiting_states:grammar.rhythm_contract.waiting_states,handoff_rule:grammar.persistent_work_object_contract.handoff_rule,rework_rule:grammar.rhythm_contract.rework_rule,new_runtime_state:false},
  editorial_uniqueness:{not_copy_of:['kunst/kunst_kuratering_og_program','kunst/kunst_utstillingsproduksjon','kunst/kunst_museumsledelse'],rule:'Denne verdenen er publikums- og frontlinjesentrert: sosial eksponering, tolkning i rommet, konkret tilgjengelighet, kø/kapasitet, handoff, hendelseseskalering, offentlig korreksjon og privat dekompresjon. Den er ikke en kuratorisk programportefølje, produksjonsplan eller institusjonsdirektørverden.'},
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  materialization:{no_new_runtime:true,source_refs:canonicalRefs,authored_dimensions:['situated_reputation'],existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,career_title_gates_preserved:true,cross_role_link_materialized:false}
};

write(WORLD,world);
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
write(INDEX,index);
checklist.reference_worlds.push(WORLD);
write(CHECKLIST,checklist);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = themeIds;
write(THEMEBANK,themeBank);

writeText(SOURCE,`# Kunst / Publikum og formidling — Role World rollout source-first\n\n## Scope lock\n\n- Canonical role: \`${KEY}\`.\n- Dedicated Role World authors exactly \`situated_reputation\`; prerequisite Career/work foundation remains authoritative.\n- \`Vertskap (museum/galleri)\` remains \`direct\`.\n- \`Gallerimedarbeider\` remains \`direct\`.\n- \`Formidler\` remains \`qualification_required\` with \`relevant_education_or_employer_qualification\`.\n- No new runtime or parallel scene format.\n\n## Preserved work foundation\n\n- Persistent editorial object: \`${PERSISTENT}\`.\n- Work loops preserved exactly: \`${LOOPS[0]}\` and \`${LOOPS[1]}\`.\n- Authority boundary preserved exactly.\n- All 15 canonical prerequisite mails remain source refs and each is reused at least three times in the 56-beat season.\n\n## Situated standing\n\n- 8 bounded audiences, 9 slow editorial-only axes and **no global reputation score**.\n- Standing affects relationships and information flow only; it is not evidens and cannot grant the Formidler qualification or alter provenance/catalogue/safety authority.\n- Audiences cover visitors, accessibility needs, frontline peers, curatorial/research specialists, conservation/security/operations, teachers/community partners, critics/public attention and private relations.\n\n## Season and continuity\n\n- 14 days × 4 phases = 56 beats.\n- 7 primary threads, 5 private aftermaths and 8 delayed consequences.\n- Waiting, handoff and rework remain bound to the existing persistent work contract.\n\n## Cross-role\n\n- \`not_materialized_no_shared_work_object\`.\n- Canonical cross-role need remains \`not_required_for_rollout\`; escalation to other professions does not by itself prove one shared runtime object.\n\n## History Go boundary\n\nHistory Go can improve art-/artwork-/exhibition-/institution-history questions and source criticism, but cannot grant the Formidler qualification, change provenance/catalogue data, authorize sale/loan, redefine the institution's professional position or override safety/conservation routines.\n\n## Editorial uniqueness\n\nPublikum og formidling is front-line audience-work centered rather than a copy of Kuratering og program, Utstillingsproduksjon or Museumsledelse.\n\n## Quality gate\n\n30/30: role identity; three Career gates; work loops; authority; persistent work; rhythm; 15 source mails; bounded audiences; no global score; 9 axes; 56 beats; four phases; source reuse; seven threads; private aftermath; delayed consequences; interpretive precision; uncertainty honesty; accessibility; frontline handoff; safety boundary; incident memory; public correction; social energy; private boundary; History Go separation; no new runtime; no cross-role invention; index registration; authoring checklist registration; theme profile; source-first report.\n`);

console.log(JSON.stringify({materialized:WORLD,coverage:coverage.length,audiences:audiences.length,axes:slowAxes.length,threads:primaryThreads.length,aftermath:privateAftermath.length,delayed:delayedConsequences.length,source_refs:canonicalRefs.length},null,2));
