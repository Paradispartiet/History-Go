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

const CATEGORY = 'historie';
const ROLE = 'historie_institusjonsledelse';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const INDEX = 'data/Civication/roleWorlds/index.json';
const CHECKLIST = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEMEBANK = 'data/Civication/roleWorldThemeBank.json';
const SOURCE = 'reports/CIVICATION_HISTORIE_INSTITUSJONSLEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TEST = 'tests/civication-historie-institusjonsledelse-role-world-rollout.test.js';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

must(!fs.existsSync(path.join(root, WORLD)), `${WORLD} already exists`);
must(fs.existsSync(path.join(root, MODEL)), `${MODEL} missing`);
must(fs.existsSync(path.join(root, GRAMMAR)), `${GRAMMAR} missing`);
must(fs.existsSync(path.join(root, PLAN)), `${PLAN} missing`);

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const index = read(INDEX);
const checklist = read(CHECKLIST);
const themeBank = read(THEMEBANK);

must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(plan.sequence?.length === 16, 'prerequisite plan must remain 16 steps');
must(grammar.day_one_contract?.entry === 'appointment_required', 'institutional leadership must remain appointment_required');
must(grammar.persistent_work_object_contract?.id === 'samfunnsoppdrag_ressurs_og_risikologg', 'persistent work object drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify({
  may:['styre institusjonen innen lov, delegasjon og samfunnsoppdrag'],
  may_not:['overstyre lovverk','diktere faglige funn','skjule vesentlig risiko','behandle institusjonens mandat som privat eierskap']
}), 'authority boundary drifted');
must((model.related_people || []).length === 4, 'expected four prerequisite scenario actors');
must(!index.roles.some((entry) => entry.category === CATEGORY && entry.role_scope === ROLE), 'Role World already registered');
must(!checklist.reference_worlds.includes(WORLD), 'Role World already in authoring checklist');
must(!themeBank.reference_profiles?.[KEY], 'Role World theme profile already exists');

const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => `${catalogPath(type)}#${mail.id}`));
});
must(canonicalRefs.length === 15 && new Set(canonicalRefs).size === 15, 'expected exactly 15 unique prerequisite mail refs');
const knowledgeRef = canonicalRefs.find((ref) => ref.includes('/knowledge/'));
must(knowledgeRef, 'knowledge provenance ref missing');

const themeIds = [
  'professional_culture',
  'class_power',
  'status_anxiety',
  'loyalty_up_down',
  'bureaucratic_power',
  'numerical_control',
  'care_vs_efficiency',
  'invisible_work',
  'shame_reputation',
  'public_private_leakage',
  'public_attention'
];
const validThemeIds = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of themeIds) must(validThemeIds.has(id), `unknown theme ${id}`);

const audiences = [
  {
    id:'board_and_governance',
    standing_axis:'mandate_fidelity_and_decision_quality',
    cares_about:['at styresaker skiller orientering, anbefaling og formelt vedtak','at risiko, økonomi og samfunnsoppdrag er synlige før irreversible beslutninger'],
    cannot_grant:'Styret kan gi eller avgrense formell delegasjon der styringsmodellen åpner for det, men standing hos styret kan ikke gjøre en historisk påstand sann, kan ikke gi spilleren kompetanse som mangler, kan ikke oppheve lovkrav og kan ikke gjøre personlig tillit til en ubegrenset fullmakt.'
  },
  {
    id:'professional_and_subject_leadership',
    standing_axis:'professional_integrity_and_protected_dissent',
    cares_about:['at faglige funn, kildegrunnlag og usikkerhet ikke bestilles ovenfra','at motstemmer kan overleve styringspress uten å bli behandlet som illojalitet'],
    cannot_grant:'Fagdirektører og profesjonsmiljø kan gi tung faglig motstand eller støtte, men de kan ikke gi budsjettfullmakt, kan ikke overta styrets eller direktørens formelle beslutningsrom og kan ikke gjøre faglig prestisje til personalmyndighet eller juridisk hjemmel.'
  },
  {
    id:'finance_and_resource_stewards',
    standing_axis:'resource_realism_and_traceable_commitment',
    cares_about:['at budsjett, prognose, kapasitet og forpliktelser holdes adskilt','at kutt og satsinger viser hvem som bærer konsekvensen og hva som må stoppes'],
    cannot_grant:'Økonomifunksjonen kan attestere tallgrunnlag og varsle om rammebrudd, men standing der kan ikke gi spilleren rett til å love midler uten fullmakt, kan ikke gjøre en prognose til disponible penger og kan ikke avgjøre historiefaglige funn eller styrets prioriteringer.'
  },
  {
    id:'employees_and_representatives',
    standing_axis:'fairness_working_conditions_and_voice',
    cares_about:['at omstilling, beredskap og prioritering ikke skyver skjult arbeid nedover','at medvirkning, arbeidsmiljø og reell kapasitet behandles som styringsinformasjon'],
    cannot_grant:'Ansatte og representanter kan bygge eller trekke tilbake sosial tillit til ledelsen, men denne standing kan ikke gi formell arbeidsgiverfullmakt, kan ikke erstatte lov- og avtaleverk og kan ikke alene gjøre en strategisk prioritering eller et faglig funn bindende.'
  },
  {
    id:'owners_ministry_and_public_principals',
    standing_axis:'public_mission_accountability_and_truthfulness_upward',
    cares_about:['at samfunnsoppdrag, mål og ressursbruk kan forklares uten pyntet sikkerhet','at avvik og begrensninger eskaleres før de blir skjulte styringsproblemer'],
    cannot_grant:'Eier-, departements- eller overordnet standing kan påvirke handlingsrom og framtidig tillit, men kan ikke gi en leder rett til å overstyre lov, kan ikke bestille bestemte faglige funn og kan ikke gjøre politisk eller administrativ preferanse til dokumentert historisk evidens.'
  },
  {
    id:'partners_users_and_affected_groups',
    standing_axis:'legibility_consequence_and_reciprocity',
    cares_about:['at institusjonens valg er forståelige for dem som blir berørt','at konsultasjon ikke brukes som dekor etter at beslutningen reelt er låst'],
    cannot_grant:'Berørte grupper og samarbeidspartnere kan gi viktig erfaringskunnskap og sosial legitimitet, men deres standing kan ikke gi intern delegasjon, kan ikke erstatte etterprøvbar saksbehandling og kan ikke gjøre popularitet eller konfliktfravær til bevis for at et faglig eller rettslig spørsmål er avgjort.'
  },
  {
    id:'public_media_and_future_institutions',
    standing_axis:'public_credibility_correction_and_long_memory',
    cares_about:['at offentlig kommunikasjon skiller fakta, ansvar, usikkerhet og korrigering','at institusjonen tåler å forklare feil uten syndebukk eller omdømmevask'],
    cannot_grant:'Offentlig omdømme, medieoppmerksomhet og framtidige arbeidsgiveres vurderinger kan få reelle karrierekonsekvenser, men kan ikke gi lovlig delegasjon, kan ikke autentisere kilder og kan ikke gjøre en populær fortelling til faglig sannhet eller budsjettfullmakt.'
  },
  {
    id:'private_relations',
    standing_axis:'presence_confidentiality_and_identity_beyond_office',
    cares_about:['at lederen kan være nær uten å bruke fortrolige saker som privat avlastning','at ansvar og status ikke spiser opp søvn, relasjoner og evnen til å korrigere seg selv'],
    cannot_grant:'En nær relasjon kan gi støtte, motstand og et annet blikk på spillerens identitet, men kan ikke gi beslutningsmandat, kan ikke bli en bakkanal for personal- eller styresaker og kan ikke gjøre privat trygghet til faglig evidens eller institusjonell autoritet.'
  }
];

const recurringPeople = [
  {
    id:'karin_styreleder_world',
    social_function:'Karin gjør styrelinjen konkret og tester om spilleren klarer å legge fram ubehagelig risiko, alternative handlingsvalg og reell beslutningsmyndighet før saken er kommunikativt eller økonomisk låst.',
    class_position:'Styreleder med formell styringsmakt over direktøren innen vedtekter og lov, men uten rett til å produsere faglige funn gjennom posisjon.',
    status:'Hennes standing skiller mellom en direktør som gir styret styrbar informasjon og en direktør som beskytter egen handlefrihet ved å filtrere usikkerhet.',
    power_over_player:'Kan sette styresak, etterspørre grunnlag og utøve styrets myndighet, men kan ikke gjøre uformell enighet til vedtak eller overstyre lov og faglig evidens.',
    wants:'At beslutningsgrunnlag viser samfunnsoppdrag, økonomi, mennesker, alternativer, risiko, habilitet og hva som faktisk krever styrevedtak.',
    conceals:'Også styret er utsatt for omdømme-, eier- og tidspress og kan derfor ønske mer entydighet enn grunnlaget tåler.',
    speech_style:'Knapp og styringsorientert; spør hva som skal besluttes, av hvem, på hvilket grunnlag og hva som skjer dersom premisset ikke holder.',
    teaches_player:'At god institusjonsledelse oppover betyr å gjøre styrets reelle valg tydelige uten å låne styreautoritet til faglige påstander.'
  },
  {
    id:'marius_fagdirektor_world',
    social_function:'Marius bærer den faglige integriteten nær toppledelsen og gjør det sosialt synlig når strategiske eller kommunikative behov begynner å definere hvilket historisk funn institusjonen helst vil ha.',
    class_position:'Fagdirektør med høy profesjonell kapital og ansvar for faglige standarder, men uten ubegrenset budsjett-, personal- eller styremyndighet.',
    status:'Hans standing avhenger av om direktøren beskytter saklig motstemme og skiller oppdragsstyring fra styring av evidens.',
    power_over_player:'Kan kreve faglig begrunnelse, dokumentere uenighet og eskalere integritetsrisiko, men kan ikke alene overta institusjonens samlede prioriteringsansvar.',
    wants:'At faglige spørsmål får eksplisitte kriterier, at usikkerhet bevares og at ledelsen aldri bestiller en sannhet for å løse et styringsproblem.',
    conceals:'Profesjonell autonomi kan også undervurdere kostnad, kapasitet og legitime prioriteringer som toppledelsen faktisk må bære.',
    speech_style:'Presis og prinsipiell; spør hva kildene bærer, hva som er tolkning, og hvilken del av ønsket som egentlig kommer fra styringsbehov.',
    teaches_player:'At profesjonell autonomi må beskyttes uten å late som fagmiljøet står utenfor institusjonens ressurs- og ansvarssystem.'
  },
  {
    id:'selma_okonomisjef_world',
    social_function:'Selma gjør forskjellen mellom vedtatt ramme, prognose, bundne midler og ønsket satsing konkret, og viser hvem som faktisk absorberer kostnaden når ledelsen lover mer enn systemet tåler.',
    class_position:'Økonomisjef med sterk kontroll- og informasjonsmakt over ressursbildet, men uten mandat til å definere samfunnsoppdrag eller faglig konklusjon alene.',
    status:'Hennes standing måler om direktøren tåler tall som begrenser prestisje, og om økonomi brukes til å synliggjøre valg framfor å naturalisere dem.',
    power_over_player:'Kan attestere grunnlag, avvise uregistrerte forpliktelser og varsle styringsbrudd, men kan ikke bruke tall som veto mot lovlig besluttet faglig prioritering.',
    wants:'At alle satsinger har finansiering, kapasitet, eier, konsekvens og reverseringspunkt før de omtales som allerede besluttet.',
    conceals:'Tall kan gi en illusjon av nøytralitet og skjule normative valg om hvilke oppgaver, mennesker og risikoer som verdsettes.',
    speech_style:'Nøktern og scenarioorientert; skiller alltid mellom ramme, prognose, binding, risiko og beslutning.',
    teaches_player:'At økonomisk disiplin er en del av institusjonell sannferdighet, men ikke en erstatning for samfunnsoppdrag eller faglig skjønn.'
  },
  {
    id:'jon_beredskapsleder_world',
    social_function:'Jon holder krise- og beredskapssporet adskilt fra omdømmearbeid og tvinger ledelsen til å skille situasjonsbilde, midlertidig tiltak, myndighet og det som fortsatt er ukjent.',
    class_position:'Beredskapsleder med operativ innflytelse i hendelser, men avgrenset myndighet som ikke automatisk utvides til strategi, fag eller permanent personalbeslutning.',
    status:'Hans standing handler om hvorvidt ledelsen tar risiko alvorlig før den blir offentlig, og om læring fortsetter etter at akuttfasen er over.',
    power_over_player:'Kan kreve beredskapsprosess og tydelig situasjonsbilde, men kan ikke bruke krise som generell fullmakt til å omgå lov, styre eller faglige grenser.',
    wants:'At tiltak er proporsjonale, tidsavgrensede, dokumenterte og knyttet til hvem som revurderer dem når faktagrunnlaget endres.',
    conceals:'Beredskapslogikk kan selv bli for ekspansiv og gjøre usikkerhet til argument for mer kontroll enn situasjonen faktisk krever.',
    speech_style:'Kort og operativ; spør hva vi vet nå, hva vi ikke vet, hvem som beslutter og når tiltaket må vurderes på nytt.',
    teaches_player:'At kriseledelse må være rask uten å gjøre midlertidig makt permanent eller kommunikasjon til erstatning for fakta.'
  },
  {
    id:'employee_representative_world',
    social_function:'Ansattrepresentanten viser hvordan strategiske valg fordeler belastning, trygghet og stemme, og gjør usynlig arbeid og uformell lydighet til synlig styringsinformasjon.',
    class_position:'Representant nær arbeidshverdagen med kollektiv legitimitet og medvirkningsrett, men uten direktørens eller styrets formelle styringsmandat.',
    status:'Standing her måler om spilleren behandler medvirkning som reell kunnskaps- og rettighetskanal, ikke som kommunikasjon etter beslutning.',
    power_over_player:'Kan kreve korrekt prosess, synliggjøre belastning og mobilisere motstand, men kan ikke alene fatte styrevedtak eller avgjøre historiefaglige spørsmål.',
    wants:'At omstilling og prioritering viser arbeidsmengde, rettigheter, alternativer og konsekvenser før ansatte blir gjort ansvarlige for å få planen til å gå opp.',
    conceals:'Representasjon kan også prioritere etablerte grupper og må derfor utfordres på hvem som fortsatt mangler stemme.',
    speech_style:'Konkret og erfaringsnær; spør hvem som gjør merarbeidet, hvem som er hørt og hva som faktisk endres dersom innspillet er vesentlig.',
    teaches_player:'At institusjonell tillit nedover bygges gjennom reell påvirkning og sann kapasitetsinformasjon, ikke bare forklaring.'
  },
  {
    id:'owner_ministry_interface_world',
    social_function:'Eier- og departementsgrensesnittet gjør samfunnsoppdrag, mål, rapportering og politisk oppmerksomhet håndgripelig uten å gjøre styringssignal til faglig sannhet.',
    class_position:'Overordnet offentlig prinsipal med betydelig ressurs- og oppdragsmakt, men bundet av lov, styringsform og skillet mellom eierstyring og faglig innhold.',
    status:'Standing handler om hvorvidt direktøren er etterrettelig om mål, avvik og konsekvenser også når svaret er politisk eller administrativt ubehagelig.',
    power_over_player:'Kan endre rammer gjennom legitime prosesser, men kan ikke uformelt gi spilleren hjemmel til å overstyre lov eller bestille bestemte faglige funn.',
    wants:'At institusjonen gjør samfunnseffekt, risiko, ressursbruk og avvik forståelig nok til at eier kan ta sitt ansvar uten å bli skjermet av pyntet rapportering.',
    conceals:'Styringsbehov kan presse komplekse forhold inn i indikatorer og fortellinger som er enklere å rapportere enn å forsvare faglig.',
    speech_style:'Mål- og ansvarssøkende; spør hva som er levert, hvorfor avviket oppstod, hvilken risiko som gjenstår og hva som krever ny ramme.',
    teaches_player:'At lojalitet oppover betyr sannferdig styringsinformasjon, ikke å produsere den virkeligheten overordnet helst vil rapportere.'
  },
  {
    id:'public_accountability_world',
    social_function:'Offentlighetsgrensesnittet tester om ledelsen kan være presis om ansvar, feil og korreksjon når medie- og interessentlogikken belønner raske, personlige og enkle forklaringer.',
    class_position:'Journalister, brukere og berørte grupper uten intern linjemyndighet, men med reell makt over offentlig legitimitet, oppmerksomhet og institusjonens langsiktige omdømme.',
    status:'Standing måler om lederen gir sann status uten å eksponere fortrolige personer, skjule usikkerhet eller plassere skyld før faktagrunnlaget er klart.',
    power_over_player:'Kan etterprøve, kritisere og endre offentlig forståelse, men kan ikke gi intern delegasjon eller gjøre popularitet til juridisk eller faglig bevis.',
    wants:'At institusjonen forklarer hva som skjedde, hva den visste, hva den ikke visste, hvem som hadde ansvar og hvordan praksis faktisk endres.',
    conceals:'Offentlig oppmerksomhet kan premiere konflikt og entydighet selv når institusjonell læring krever langsommere og mer differensiert forklaring.',
    speech_style:'Direkte og konsekvensorientert; spør hvem som visste hva når, hvem som bar kostnaden og hvorfor offentligheten skal stole på neste versjon.',
    teaches_player:'At omdømme ikke repareres med budskap alene, men med sporbar korreksjon og grenser mellom offentlig ansvar og fortrolighet.'
  },
  {
    id:'private_counterweight_world',
    social_function:'Den private motvekten viser kostnaden ved å være identifisert med institusjonen hele døgnet og tester om spilleren kan søke støtte uten å gjøre hjemmet til uformelt styre- eller personalrom.',
    class_position:'Nær relasjon uten organisatorisk mandat, men med stor betydning for restitusjon, skam, selvbilde og evnen til å møte neste arbeidsdag med korrigerbar dømmekraft.',
    status:'Standing her måler nærvær, fortrolighet og om spilleren klarer å skille egen verdi fra institusjonens siste resultat eller medieoppslag.',
    power_over_player:'Kan påvirke selvforståelse og valg om grenser, men kan ikke gi faglig evidens, styrevedtak, budsjettfullmakt eller rett til å dele fortrolige opplysninger.',
    wants:'At spilleren kan si hva ansvaret gjør med ham eller henne uten å bruke identifiserbare medarbeidere og styresaker som privat debriefmateriale.',
    conceals:'Omsorg kan gli over i råd om å beskytte status eller unngå konflikt, selv når institusjonen trenger en ubehagelig korrigering.',
    speech_style:'Personlig og avvæpnende; spør hva som faktisk er ditt ansvar, hva som tilhører systemet, og hvem du er når telefonen legges bort.',
    teaches_player:'At bærekraftig institusjonsledelse krever en privat grense som verken benekter ansvar eller lar maktrollen bli hele identiteten.'
  }
];

const slowAxes = [
  ['board_trust','Styretillit','Bygges gjennom tidlig, komplett og beslutningsrelevant informasjon; faller når risiko eller fullmaktsgrenser blir synlige først etter at saken er låst.'],
  ['professional_trust','Faglig tillit','Bygges når ledelsen beskytter evidens, metode, uenighet og korrigering selv under styringspress.'],
  ['staff_trust','Ansattetillit','Bygges når kapasitet, medvirkning, arbeidsmiljø og byrdefordeling faktisk endrer ledelsesvalg.'],
  ['resource_credibility','Ressurskredibilitet','Bygges når budsjett, prognose, kapasitet og forpliktelser beskrives uten optimistisk sammenblanding.'],
  ['owner_confidence','Eiertillit','Bygges gjennom sannferdig mål- og avviksrapportering og presis eskalering av behov for ny ramme.'],
  ['public_credibility','Offentlig troverdighet','Bygges gjennom presis ansvarlighet, korreksjon og vern mot syndebukkforklaringer.'],
  ['crisis_discipline','Beredskapsdisiplin','Bygges når midlertidig makt og tiltak forblir tidsavgrenset, dokumentert og reviderbart.'],
  ['institutional_memory','Institusjonell hukommelse','Bygges når beslutningsgrunnlag, uenighet, avvik og rework overlever personskifter og ny rapporteringssyklus.'],
  ['leadership_identity','Lederidentitet','Utvikles i spennet mellom formell autoritet, korrigerbarhet og evnen til å tåle at institusjonen ikke er privat eiendom.'],
  ['private_sustainability','Privat bærekraft','Endres sakte gjennom søvn, grenser, fortrolighet og om ansvar kan bæres uten at maktrollen koloniserer hele privatlivet.']
].map(([id,label,description]) => ({id,label,description,runtime_binding:'editorial_only_until_governed'}));

const days = [
  {title:'Et styrepapir er penere enn risikoen', conflict:'En strategisak er teknisk klar, men et sent premiss om kapasitet og måloppnåelse er formulert som om det var sikrere enn dokumentasjonen viser. Karin vil ha beslutningsklarhet, Selma ser økonomisk eksponering, og Marius mener den faglige begrensningen er underkommunisert.', question:'Skal saken utsettes, avgrenses eller legges fram med eksplisitt usikkerhet og alternativer?', audience:'board_and_governance'},
  {title:'Satsing uten reell kapasitet', conflict:'En profilert satsing passer samfunnsoppdraget, men finansiering, bemanning og kontrollkapasitet er ikke samtidig tilgjengelig. Hver del av organisasjonen antar at en annen del vil absorbere restarbeidet dersom direktøren bare signaliserer at satsingen er viktig.', question:'Hvilket arbeid må faktisk velges bort, og hvem eier beslutningen om det?', audience:'finance_and_resource_stewards'},
  {title:'Faglig motstemme møter styringssignal', conflict:'Et overordnet styringssignal peker mot en tydelig offentlig fortelling, mens Marius dokumenterer at kildene og den historiske konteksten ikke støtter samme grad av sikkerhet. Organisasjonen merker raskt om direktøren behandler motstemmen som kvalitet eller som illojalitet.', question:'Hvordan kan oppdraget styres uten å styre funnet?', audience:'professional_and_subject_leadership'},
  {title:'Omstilling med usynlig arbeid', conflict:'En omorganisering ser effektiv ut i organisasjonskartet, men koordinerings-, omsorgs- og kontrollarbeid flyttes til medarbeidere som ikke er synlige i gevinstberegningen. Ansattrepresentanten krever at faktisk arbeidsmengde og medvirkning blir en del av beslutningsgrunnlaget.', question:'Hva må måles og høres før omstillingen kan kalles forsvarlig?', audience:'employees_and_representatives'},
  {title:'Budsjettavvik før eierdialog', conflict:'Selma oppdager at prognosen har beveget seg, men den offentlige rapporteringen bygger fortsatt på et eldre og penere bilde. Eier forventer måloppnåelse, og fristpresset gjør det fristende å beskrive avviket som midlertidig før årsaken er forstått.', question:'Når skal avviket eskaleres, og med hvilket sikkerhetsnivå?', audience:'owners_ministry_and_public_principals'},
  {title:'Hendelse uten komplett situasjonsbilde', conflict:'En hendelse berører mennesker, drift og omdømme samtidig. Jon har nok informasjon til å anbefale midlertidige tiltak, men ikke nok til å fastslå årsak eller skyld, mens telefonene fra offentlighet og eier kommer før faktagrunnlaget er ferdig.', question:'Hvordan skilles akutt tiltak, fakta, ansvar og kommunikasjon?', audience:'public_media_and_future_institutions'},
  {title:'Muntlig løfte blir institusjonell forventning', conflict:'I en ekstern samtale har ledelsen signalisert støtte til et samarbeid før budsjett, kapasitet og formell beslutning er avklart. Partneren planlegger nå som om løftet er bindende, og intern motstand kan oppfattes som at organisasjonen trekker seg fra noe den allerede har lovet.', question:'Hvordan gjenopprettes skillet mellom positivt scenario og faktisk forpliktelse?', audience:'partners_users_and_affected_groups'},
  {title:'Prestisjeprosjektet møter faglig stopp', conflict:'Et prosjekt med høy ekstern synlighet står nær lansering, men en sen kontroll viser at et sentralt faglig premiss må revideres. Å stoppe vil koste status og penger; å fortsette vil gjøre lederlinjen medansvarlig for å presentere noe den vet ikke er etterprøvd.', question:'Hva må stoppes eller avgrenses, og hvem skal høre hvorfor?', audience:'professional_and_subject_leadership'},
  {title:'Styret vil ha ett svar, grunnlaget har tre', conflict:'Karin ber om en tydelig anbefaling før et viktig møte, men analysen viser tre legitime alternativer med ulike kostnader, rettigheter og faglige konsekvenser. Direktørens verdi ligger ikke i å late som usikkerheten er borte, men heller ikke i å sende valget tilbake som ustrukturert kompleksitet.', question:'Hvordan gjøres reelle alternativer beslutningsbare uten falsk sikkerhet?', audience:'board_and_governance'},
  {title:'Kuttforslaget fordeler risiko nedover', conflict:'Et nødvendig innsparingstiltak kan teknisk nå måltallet, men bare dersom vedlikehold, kontroll og menneskelig oppfølging reduseres samtidig. Selma viser tallene, ansatte beskriver praktiske konsekvenser, og eier vil vite om ledelsen fortsatt kan stå for samfunnsoppdraget.', question:'Hvilken risiko kan aksepteres, hvem kan akseptere den, og hva må i stedet prioriteres bort?', audience:'employees_and_representatives'},
  {title:'Offentlig kritikk etter korrekt beslutning', conflict:'En beslutning som var formelt og faglig forsvarlig får sterk offentlig motstand fra en gruppe som bærer en reell kostnad. Fristelsen er enten å avvise kritikken med prosedyren eller å undergrave beslutningssporet for å gjenvinne popularitet.', question:'Hvordan kan institusjonen stå for beslutningen og samtidig lære av berørte erfaringer?', audience:'partners_users_and_affected_groups'},
  {title:'Ny informasjon gjenåpner bare én del', conflict:'Et nytt dokument endrer ett sentralt premiss i en tidligere beslutning, men ikke hele strategien. Organisasjonen har allerede investert prestisje i den gamle versjonen, og noen ønsker full omkamp mens andre vil ignorere dokumentet for å beskytte fremdrift.', question:'Hvordan gjennomføres bounded rework uten historiesletting eller total reset?', audience:'public_media_and_future_institutions'},
  {title:'Et ledervalg følger hjem', conflict:'En personalsensitiv og offentlig synlig uke gjør at spilleren fortsatt mentalt forhandler saken hjemme. Den private relasjonen merker fravær og uro, men har verken rett til identifiserbar informasjon eller ansvar for å bære institusjonens konflikter.', question:'Hvordan kan ansvar bearbeides uten at hjemmet blir uformelt lederrom?', audience:'private_relations'},
  {title:'Sesongslutt med ansvar som kan spores', conflict:'De viktigste valgene i perioden skal oppsummeres for styre, ansatte, eier og offentlighet. Resultatene er blandede: noen mål er nådd, en feil er korrigert, et prosjekt ble stoppet og flere relasjoner husker samme beslutning forskjellig.', question:'Hvilken institusjonell hukommelse skal stå igjen når lederen ikke får skrive sin egen heltefortelling?', audience:'owners_ministry_and_public_principals'}
];

const phaseConfig = {
  morning:{
    beat_type:'task',
    label:'morgen',
    focus:'Spilleren åpner samfunnsoppdrag-, ressurs- og risikologgen og må etablere dagens faktiske grunnlag: hva som er dokumentert, hvilket mandat som gjelder, hvem som bærer beslutningen, hvilke avhengigheter som fortsatt venter og hva som ikke kan loves. Oppgaven handler om å gjøre styringsrommet presist før tempo, prestisje eller forventning låser retningen.'
  },
  lunch:{
    beat_type:'relationship',
    label:'lunsj',
    focus:'Saken leses gjennom en relasjon som har en annen type makt enn spilleren. Samtalen viser at tillit er situert: den samme beslutningen kan se ansvarlig ut for styret, for hard ut for ansatte, for vag ut for eier og for metodisk nødvendig ut for fagmiljøet. Spilleren må tåle denne forskjellen uten å oversette den til én samlet popularitetsscore.'
  },
  afternoon:{
    beat_type:'decision',
    label:'ettermiddag',
    focus:'Ettermiddagen tvinger fram en avgrenset beslutning eller anbefaling. Spilleren må navngi hva som faktisk avgjøres nå, hva som fortsatt er et scenario eller ventepunkt, hvilken fullmakt beslutningen bygger på, hvilke motargumenter som bevares, og hvilket kontrollpunkt som gjør beslutningen korrigerbar dersom premissene endrer seg.'
  },
  evening:{
    beat_type:'private_consequence',
    label:'kveld',
    focus:'Når arbeidsdagen slutter, forsvinner ikke konsekvensen. Telefonen, prestisjen, skammen eller lettelsen følger spilleren hjem, men fortrolige detaljer og institusjonell myndighet kan ikke gjøre det. Kvelden viser hvordan lederidentitet, søvn og nærhet påvirker neste dags dømmekraft uten å bli ny runtime-stat eller privat bakkanal for arbeidsbeslutninger.'
  }
};
const surfaces = ['samfunnsoppdrag_og_styringsbord','faglig_integritetsforum','budsjett_og_prioriteringsrom','risiko_beredskap_og_handoff'];
const phaseOrder = ['morning','lunch','afternoon','evening'];

const coverage = [];
let slot = 0;
for (let d = 0; d < days.length; d += 1) {
  const day = d + 1;
  const topic = days[d];
  for (let p = 0; p < phaseOrder.length; p += 1) {
    const phase = phaseOrder[p];
    const cfg = phaseConfig[phase];
    const audience = audiences[(d + p) % audiences.length];
    const sourceRef = canonicalRefs[slot % canonicalRefs.length];
    const surface = surfaces[(d + p) % surfaces.length];
    const summary = `Dag ${day}, ${cfg.label}: ${topic.title}. ${topic.conflict} ${cfg.focus} Arbeidet skjer mot ${surface}, men det vedvarende objektet er hele tiden samfunnsoppdrag_ressurs_og_risikologg; versjon, eier, fullmakt, ressursforutsetning, faglig innvending, berørt gruppe, ventepunkt og neste kontroll må kunne rekonstrueres. Dagens styringsspørsmål er: ${topic.question} Spilleren får ikke løse trykket ved å behandle appointment_required som personlig eierskap til institusjonen, ved å låne styrestatus som faglig evidens, ved å gjøre prognose til penger eller ved å skjule vesentlig risiko. Denne ${cfg.beat_type}-scenen gjenbruker canonical mail-proveniens ${sourceRef} som delivery-anker; den legger ingen ny runtime, ingen parallell sceneformat og ingen skjult global reputation-score til systemet. Det som endres redaksjonelt, er hvem som observerer valget og hva akkurat denne gruppen senere vil huske.`;
    const standing = `Situert konsekvens for ${audience.id}: På aksen ${audience.standing_axis} vurderes ikke spilleren etter én universell lederkarisma, men etter om handlingen gjorde mandat, kunnskapsgrunnlag, mennesker, ressurser og korrigerbarhet mer eller mindre lesbare for akkurat denne gruppen. Gruppen bryr seg særlig om ${audience.cares_about.join(' og ')}. En annen gruppe kan derfor lese samme valg annerledes uten at noen av dem blir fasit. Standing her kan påvirke samarbeid, hvor raskt tvil blir meldt, hvor mye kontekst spilleren får neste gang og hvordan senere feil tolkes, men den kan ikke skape ny delegasjon, budsjettfullmakt, juridisk hjemmel eller historiefaglig sannhet. ${audience.cannot_grant} Dag ${day}/${phase} etterlater derfor et sosialt minne som kan vende tilbake senere, mens formell myndighet fortsatt må komme fra lov, delegasjon og korrekt beslutningslinje.`;
    coverage.push({
      day,
      phase,
      beat_type:cfg.beat_type,
      title:`${topic.title} — ${cfg.label}`,
      summary,
      standing_audience:audience.id,
      standing_consequence:standing,
      materialization_refs:[sourceRef]
    });
    slot += 1;
  }
}

const primaryThreads = [
  {
    id:'karin_styre_og_delegasjon',
    relationship:'Karin og spilleren utvikler en styre–direktør-relasjon der tillit ikke betyr fravær av konflikt, men at styret får reelle alternativer, upyntet risiko og korrekt skille mellom orientering og vedtak. Tråden tester også om direktøren tåler at styret avgrenser handlingsrommet uten å gjøre fagmiljøet til politisk verktøy.',
    beat_refs:['1/lunch','2/afternoon','5/morning','9/lunch','10/afternoon','12/morning','14/afternoon']
  },
  {
    id:'marius_faglig_integritet',
    relationship:'Marius blir den vedvarende profesjonelle motstemmen som både kan redde institusjonen fra bestilte konklusjoner og selv bli blind for ressursbegrensning. Relasjonen utvikles gjennom eksplisitte metodekriterier, dokumentert uenighet og at lederrollen aldri brukes som snarvei til evidens.',
    beat_refs:['1/afternoon','3/lunch','3/afternoon','8/morning','8/afternoon','12/lunch','14/morning']
  },
  {
    id:'selma_ressurs_og_forpliktelse',
    relationship:'Selma og spilleren bygger eller mister tillit rundt hvorvidt tall brukes som beslutningsgrunnlag eller pynt. Hun trenger en leder som kan velge, men også en leder som erkjenner at hver ny prioritet har en alternativkostnad og at økonomifunksjonen ikke skal presses til å attestere ønsket virkelighet.',
    beat_refs:['2/morning','2/lunch','5/afternoon','7/morning','9/morning','10/lunch','14/lunch']
  },
  {
    id:'jon_beredskap_og_midlertidig_makt',
    relationship:'Jon bærer hendelser fra første signal til etterkontroll og gjør det mulig å se om midlertidige tiltak faktisk blir revidert. Relasjonen blir vanskelig når offentlighet ønsker skyld før fakta, eller når krisens effektive kommandologikk frister ledelsen til å beholde mer kontroll enn mandatet tåler.',
    beat_refs:['5/evening','6/morning','6/lunch','6/afternoon','6/evening','11/morning','12/afternoon']
  },
  {
    id:'ansatte_medvirkning_og_usynlig_arbeid',
    relationship:'Ansattsporet følger hvem som bærer restarbeid når strategien flyttes, og om medvirkning kommer tidlig nok til å kunne endre noe. Standing nedover bygges ikke av gode allmøter alene, men av at faktisk kapasitet, rettigheter og profesjonelle innvendinger får konsekvens i lederens valg.',
    beat_refs:['2/evening','4/morning','4/lunch','4/afternoon','7/lunch','10/morning','10/evening']
  },
  {
    id:'eier_offentlighet_og_samfunnsoppdrag',
    relationship:'Eier- og offentlighetstråden undersøker hvordan institusjonen kan være styrbar og samtidig sannferdig om usikkerhet. Spilleren må oversette kompleksitet til ansvarlig styringsinformasjon uten å produsere en heltefortelling, skjule avvik eller la offentlig oppmerksomhet bli mål på faglig sannhet.',
    beat_refs:['5/lunch','5/afternoon','6/afternoon','11/lunch','11/afternoon','12/evening','14/afternoon']
  },
  {
    id:'privat_grense_og_lederidentitet',
    relationship:'Den private tråden gjør institusjonsmaktens restkostnad synlig. Spilleren må finne språk for ansvar, skam og tvil uten å dele fortrolige mennesker eller gjøre en nær relasjon til uformell rådgiver. Det avgjør ikke formell standing, men påvirker om neste arbeidsdag starter med korrigerbarhet eller defensiv selvbeskyttelse.',
    beat_refs:['1/evening','3/evening','7/evening','8/evening','9/evening','13/evening','14/evening']
  }
];

const privateAftermath = [
  {
    id:'telefonen_pa_bordet',
    description:'Etter en krevende styredag lar spilleren telefonen ligge synlig gjennom middagen og reagerer på hvert varsel. Den private relasjonen setter en grense: støtte er mulig, men ikke dersom hele hjemmet må være på beredskap for institusjonen. Spilleren må velge et konkret tidspunkt for å være utilgjengelig uten å dele styresakens fortrolige detaljer.',
    materialization_refs:[canonicalRefs[1]]
  },
  {
    id:'skam_etter_korreksjon',
    description:'Når institusjonen må korrigere en offentlig påstand, kjenner spilleren skam selv om korreksjonen var faglig riktig. Kvelden undersøker forskjellen mellom personlig nederlag og institusjonell læring: å tåle at feil blir synlig kan være en del av god ledelse, men bare dersom ansvaret ikke skyves nedover på den som først meldte fra.',
    materialization_refs:[canonicalRefs[6]]
  },
  {
    id:'prestisje_etter_stopp',
    description:'Et prosjekt spilleren selv har frontet blir stoppet på grunn av nytt grunnlag. Privat oppstår fristelsen til å omtale fagmiljøet eller styret som årsaken til tapet. Etterspillet trener en mer presis identitet: direktøren eier beslutningsprosessen og korrigeringen uten å kreve at privatlivet bekrefter at han eller hun egentlig hadde rett.',
    materialization_refs:[canonicalRefs[9]]
  },
  {
    id:'sovn_og_kriseberedskap',
    description:'Etter hendelsen fortsetter kroppen å reagere som om alarmen står på selv etter at midlertidige tiltak er satt. Spilleren må delegere nattlig beredskap til riktig funksjon og akseptere at ansvar også betyr å bygge en organisasjon som kan fungere når direktøren sover, ikke å demonstrere uavbrutt personlig tilgjengelighet.',
    materialization_refs:[canonicalRefs[12]]
  },
  {
    id:'sesongslutt_uten_heltefortelling',
    description:'Ved slutten av perioden spør en nær relasjon om hva spilleren er mest stolt av. Svaret kan ikke bare være synlige resultater: også et avlyst prosjekt, et ubehagelig styrenotat og en offentlig korreksjon kan være tegn på ledelse dersom de gjorde institusjonen mer sannferdig, trygg og korrigerbar.',
    materialization_refs:[canonicalRefs[14]]
  }
];

const delayedConsequences = [
  {id:'styrepapirets_usikkerhet_vender_tilbake',setup_ref:'1/afternoon',return_ref:'9/lunch',domains:['reputation','job'],description:'Hvordan spilleren merket usikkerhet dag 1 påvirker hvor mye styret stoler på den senere anbefalingen når alternativene er flere og risikoen høyere.'},
  {id:'kapasitetsvalget_blir_arbeidsmiljo',setup_ref:'2/afternoon',return_ref:'10/morning',domains:['relationship','job'],description:'Det som ble omtalt som effektivisering vender tilbake som konkret belastning og viser om tidligere alternativkostnader faktisk ble registrert.'},
  {id:'faglig_motstemme_blir_korreksjonskapital',setup_ref:'3/lunch',return_ref:'8/afternoon',domains:['reputation','relationship'],description:'Måten Marius ble behandlet på avgjør om han senere varsler tidlig om et nytt faglig problem eller antar at lederlinjen ikke vil høre det.'},
  {id:'medvirkning_blir_implementeringsvilje',setup_ref:'4/lunch',return_ref:'11/lunch',domains:['relationship','job'],description:'Ansattes erfaring av reell påvirkning former hvor mye de tror på invitasjonen til dialog når en senere offentlig kontrovers krever organisatorisk læring.'},
  {id:'avvikets_tidspunkt_blir_eiertillit',setup_ref:'5/afternoon',return_ref:'14/afternoon',domains:['reputation','job'],description:'Om budsjettavviket ble eskalert tidlig nok påvirker eierens tolkning av sesongens samlede rapport og direktørens troverdighet om nye risikoer.'},
  {id:'krisetiltak_blir_styringspresedens',setup_ref:'6/afternoon',return_ref:'12/afternoon',domains:['job','reputation'],description:'Et midlertidig tiltak fra hendelsen blir senere brukt som eksempel på hva ledelsen kan gjøre raskt; spilleren må enten avgrense presedensen eller la krisemakt normaliseres.'},
  {id:'muntlig_lofte_blir_partnerhukommelse',setup_ref:'7/lunch',return_ref:'11/afternoon',domains:['relationship','reputation'],description:'Hvordan forventningen ble korrigert påvirker om samarbeidspartneren tolker senere konsultasjon som reell dialog eller som ny risiko for uformelle løfter.'},
  {id:'privat_grense_blir_korrigerbarhet',setup_ref:'13/evening',return_ref:'14/morning',domains:['relationship','job'],description:'Evnen til å legge fra seg rollen noen timer påvirker om siste dags oppsummering blir defensiv selvpresentasjon eller åpen institusjonell læring.'}
];

const authoritySeparation = 'Situert standing er uttrykkelig ikke en global reputation-score og ikke en parallell karrieremotor. Styretillit kan ikke gjøre en faglig påstand til evidens; faglig tillit kan ikke gi styre-, personal- eller budsjettfullmakt; ansattetillit kan ikke oppheve lov, tariff eller delegasjon; eiertillit kan ikke gi rett til å diktere historiske funn; offentlig popularitet kan ikke gjøre kommunikasjon til sannhet. History Go og Badge kan gi bedre spørsmål om kilder, historiografi, institusjonell hukommelse og tidligere styringsformer, men kan ikke gi ansettelse eller utnevnelse, kan ikke skape delegasjon, kan ikke love budsjettmidler, kan ikke autentisere et dokument og kan ikke fatte vedtak. Formell myndighet forblir bundet til lov, arbeidsgiveroppnevning, delegasjon og korrekt beslutningslinje, mens standing bare beskriver hvordan ulike relasjoner husker spillerens måte å bruke eller avgrense denne myndigheten på.';

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:CATEGORY,
  role_scope:ROLE,
  title:'Historie / Institusjonsledelse — samfunnsoppdrag, styremakt, faglig integritet og situert tillit',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan lede en historiefaglig institusjon med reell styrings-, ressurs- og arbeidsgivermakt uten å gjøre samfunnsoppdraget til privat eiendom, styrestatus til evidens eller omdømme til erstatning for korrigerbar beslutningskvalitet?',
    description:'Institusjonsledelse samler flere maktformer i én rolle: styre- og eierstyring, arbeidsgiveransvar, budsjett, beredskap, offentlighet og ansvar for at profesjonell kunnskapsproduksjon fortsatt kan motsi ledelsen. Sesongen gjør derfor standing situert. Styret kan verdsette tidlig risiko, ansatte reell medvirkning, fagmiljøet beskyttet motstemme, eier styrbarhet, økonomifunksjonen ressursrealisme, offentligheten korreksjon og privatlivet grenser. De kan reagere ulikt på samme beslutning uten at noen reaksjon blir ny myndighet eller én global poengsum.'
  },
  theme_ids:themeIds,
  social_environments:[
    'samfunnsoppdrag- og styringsbordet der vedtekter, eierstyring, styresak, beslutningseier og formell delegasjon må være synlige før lederintensjon blir institusjonell handling',
    'det faglige integritetsforumet der kilder, metode, usikkerhet og profesjonell motstemme må kunne stå imot både omdømmebehov og ønsket styringsfortelling',
    'budsjett- og prioriteringsrommet der vedtatt ramme, prognose, bundne midler, kapasitet og alternativkostnad skiller realistisk prioritering fra skjult overforpliktelse',
    'risiko-, beredskaps- og handoffflaten der situasjonsbilde, midlertidige tiltak, konfidensialitet, eier, kontrollpunkt og bounded rework hindrer at krisemakt blir permanent',
    'styremøtet der direktøren både er saksforbereder, leder og underlagt styrets mandat og derfor må tåle at beslutningsgrunnlaget begrenser egen handlefrihet',
    'medvirknings- og arbeidsmiljøgrensen der ansatte gjør usynlig arbeid, kapasitetsgjeld og praktiske konsekvenser synlige før strategiske løfter blir låst',
    'eier- og offentlighetsgrensen der institusjonen må oversette kompleksitet til styrbar og forståelig informasjon uten å pynte avvik eller ofre fortrolige mennesker',
    'privatlivet der institusjonens prestisje, konflikt og døgnberedskap kan lekke inn uten at hjemmet blir uformelt styre-, personal- eller kriserom'
  ],
  recurring_people_archetypes:recurringPeople,
  situated_reputation_model:{
    global_score_allowed:false,
    audiences,
    divergence_examples:[
      'Et stopp i et prestisjeprosjekt kan styrke fagmiljøets og styrets tillit fordi evidensgrensen ble respektert, samtidig som offentlig standing faller på kort sikt fordi forventninger brytes.',
      'Et raskt kostnadskutt kan styrke eierens kortsiktige inntrykk av handlekraft, men svekke ansattes og kvalitetsfunksjonens tillit dersom kontrollarbeid og belastning skyves usynlig nedover.',
      'Å merke usikkerhet tydelig i en styresak kan oppleves som mindre beslutningssterkt i øyeblikket, men styrke senere styretillit når et premiss faktisk endrer seg.',
      'Å varsle budsjettavvik tidlig kan svekke status hos en overordnet som ønsket ro, samtidig som økonomifunksjonen og framtidige beslutningstakere får større tillit til tallgrunnlaget.',
      'Å avgrense krisemakt etter akuttfasen kan frustrere dem som likte tempoet, men styrke rettighets-, arbeidsmiljø- og styretillit fordi midlertidig fullmakt ikke ble normalisert.',
      'En offentlig korreksjon kan gi negativ medieoppmerksomhet samme dag og samtidig styrke profesjonell og langsiktig offentlig troverdighet fordi institusjonen viser at feil faktisk endrer praksis.',
      'Å gi ansatte reell medvirkning kan forsinke implementering og svekke kortsiktig eierinntrykk av tempo, men redusere skjult arbeid og styrke implementeringskvaliteten.',
      'Å si nei til å diskutere identifiserbare personalsaker hjemme kan oppleves av den private relasjonen som distanse i øyeblikket, men beskytter både fortrolighet og muligheten for et privat rom som ikke koloniseres av ledermakt.'
    ],
    authority_separation:authoritySeparation
  },
  slow_axes:slowAxes,
  history_go_affordance:{
    source_ref:knowledgeRef,
    badge_id:'historie',
    better_question:'History Go kan brukes som kildekritisk og historiografisk motstand når institusjonsledelsen møter en styringsfortelling som virker selvsagt. Spilleren kan undersøke hvordan institusjoner tidligere har klassifisert mennesker og problemer, hvilke kilder og arkivfravær som formet beslutninger, hvilke styringsformer som har endret seg, og hvilke tidligere konflikter som bare ligner dagens på overflaten. Det bedre spørsmålet er ikke «hva gjorde en sterk leder før?», men «hvilke kilder, maktforhold, mandatgrenser og berørte perspektiver må vi undersøke før vi antar at en historisk parallell faktisk er relevant for dagens beslutning?»',
    authority_boundary:'History Go kan ikke gi appointment_required-stillingen, kan ikke gi eller utvide delegasjon, kan ikke skape budsjettfullmakt, kan ikke fatte styre- eller direktørvedtak, kan ikke autentisere en kilde og kan ikke diktere et historiefaglig funn. Badge og historisk kontekst kan skjerpe spørsmål og kildekritikk, men formell myndighet og profesjonell evidens må fortsatt komme fra sine egne legitime kilder.'
  },
  cross_role_proof:{
    status:'not_materialized_no_shared_work_object',
    shared_work_object_found:false,
    required_for_rollout:false,
    new_runtime:false,
    rule:'Cross-role er not_required_for_rollout her. Ingen kobling materialiseres bare fordi styre, økonomi, fagmiljø, ansatte eller eier finnes i andre roller. Et senere cross-role-spor krever et reelt delt arbeidsobjekt med identisk versjon, eier og handoff-kontrakt; ellers forblir relasjonene redaksjonelle i denne Role World-en.'
  },
  season:{
    days:14,
    day_phases:['morning','lunch','afternoon','evening'],
    coverage
  },
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  existing_work_continuity:{
    work_loops:grammar.work_loops,
    persistent_work_object:grammar.persistent_work_object_contract.id,
    waiting_states:grammar.rhythm_contract.waiting_states,
    handoff_rule:grammar.persistent_work_object_contract.handoff_rule,
    rework_rule:grammar.rhythm_contract.rework_rule,
    new_runtime_state:false
  },
  editorial_uniqueness:{
    statement:'Denne verdenen er ikke en omskriving av Fagledelse eller Scenekunst/Institusjonsledelse. Den organiserer 14 dager rundt offentlig historiefaglig institusjonsmakt: styrets styringsrett, eierens samfunnsoppdrag, direktørens arbeidsgiver- og ressursansvar, profesjonell autonomi, beredskap, avviksrapportering og den særlige faren for at institusjonell prestisje blir brukt som sannhetskilde.',
    forbidden_shortcut:'Ingen eksisterende Role World-tekst eller plot kopieres. Bare den canonicale strukturen, policyen og prerequisite-proveniensen gjenbrukes.'
  },
  materialization:{
    authored_dimensions:['situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_people_foundation_preserved:true,
    existing_work_grammar_preserved:true,
    existing_persistent_work_preserved:true,
    existing_rhythm_preserved:true,
    cross_role_link_materialized:false,
    source_refs:canonicalRefs
  }
};

write(WORLD, world);

index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
write(INDEX, index);

checklist.reference_worlds.push(WORLD);
write(CHECKLIST, checklist);

themeBank.reference_profiles ||= {};
themeBank.reference_profiles[KEY] = themeIds;
write(THEMEBANK, themeBank);

const sourceFirst = `# Civication Historie — Institusjonsledelse Role World rollout

## Scope lock

Role: \`${KEY}\` (\`Avdelingsdirektør\` / \`Direktør\`).

This is the dedicated one-role Role World completion. The prerequisite foundation is already canonical and remains untouched: formal entry stays \`appointment_required\` with \`employer_appointment\`, the two work loops and exact authority boundary stay unchanged, the 16-step mail plan stays canonical, and the persistent object remains \`samfunnsoppdrag_ressurs_og_risikologg\`.

## 29/30 prerequisite foundation -> 30/30 Role World

Readiness before this rollout is \`rollout_ready\` with exactly one authored dimension left: situated reputation. This package authors that dimension and nothing else. It does not reinterpret Career gameplay, add a qualification shortcut, change salary policy, or invent a shared runtime.

## Editorial uniqueness

This world is written specifically for historical institutional leadership rather than copied from Fagledelse or Scenekunst. Its social core is the concentration and separation of public institutional powers: board governance, employer responsibility, budget and capacity, owner/public mission, professional autonomy, crisis authority, public correction and the private cost of being identified with the institution. The same decision can therefore strengthen board trust while weakening staff trust, or strengthen professional trust while creating short-term public criticism.

There is **no global reputation score**. Eight audiences have independent standing axes and none can grant powers belonging to another institution. Standing is editorial memory until separately governed; it is not a new runtime state.

## Season architecture

- 14 days, four phases per day, exactly 56 unique dramaturgical beats.
- Morning = task, lunch = relationship, afternoon = decision, evening = private consequence.
- All 15 canonical prerequisite mail refs are reused as delivery provenance at least three times.
- Seven long threads connect board/delegation, professional integrity, finance/resource realism, crisis authority, employees/mediation, owner/public mission and private identity.
- Five private aftermaths and eight delayed consequences make choices return later instead of becoming isolated vignettes.

## Authority and History Go

History Go can improve questions about sources, historiography, institutional memory and misleading historical parallels. It cannot appoint the player, grant delegation, create budget authority, authenticate a source, make a board decision or dictate a professional finding. \`appointment_required\` remains a hard Career and role-world boundary.

## Cross-role

Cross-role is \`not_required_for_rollout\`. No shared work object is invented. A future cross-role connection is allowed only if the same real work object, version, owner and handoff contract genuinely exist across roles.

## Fail-closed verification

The temporary materializer writes the world, index/checklist/theme registration, strict one-role rollout test and this report. The workflow then regenerates Career/readiness, verifies prerequisite compatibility, global Role World contract, Scene Registry and Scenario People invariants, runs the full Civication suite and learning audits, removes all TEMP surfaces, and commits only the exact verified permanent state.
`;
writeText(SOURCE, sourceFirst);

const testSource = `const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const ROLE = 'historie_institusjonsledelse';
const KEY = \`historie/\${ROLE}\`;
const WORLD = \`data/Civication/roleWorlds/historie/\${ROLE}.json\`;
const PLAN = \`data/Civication/mailPlans/historie/\${ROLE}_plan.json\`;
const MODEL = \`data/Civication/roleModels/historie/\${ROLE}.json\`;
const GRAMMAR = \`data/Civication/workGrammars/historie/\${ROLE}.json\`;
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const catalogPath = (type) => \`data/Civication/mailFamilies/historie/\${type}/\${ROLE}_\${type}.json\`;
const canonicalRefs = TYPES.flatMap((type) => {
  const doc = read(catalogPath(type));
  return (doc.families || []).flatMap((family) => (family.mails || []).map((mail) => \`\${catalogPath(type)}#\${mail.id}\`));
});

assert.ok(exists(WORLD), 'Historie Institusjonsledelse Role World must exist');
const world = read(WORLD);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'historie');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of ['no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved']) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.equal(read(PLAN).sequence.length, 16);
assert.deepEqual(world.existing_work_continuity.work_loops, read(GRAMMAR).work_loops);
assert.equal(world.existing_work_continuity.persistent_work_object, 'samfunnsoppdrag_ressurs_og_risikologg');
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.equal(read(GRAMMAR).day_one_contract.entry, 'appointment_required');
assert.deepEqual(read(GRAMMAR).authority_boundary, {
  may:['styre institusjonen innen lov, delegasjon og samfunnsoppdrag'],
  may_not:['overstyre lovverk','diktere faglige funn','skjule vesentlig risiko','behandle institusjonens mandat som privat eierskap']
});

for (const person of read(MODEL).related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}
assert.equal(canonicalRefs.length, 15);
assert.equal(new Set(canonicalRefs).size, 15);
assert.deepEqual(world.materialization.source_refs, canonicalRefs);

const audienceIds = ['board_and_governance','professional_and_subject_leadership','finance_and_resource_stewards','employees_and_representatives','owners_ministry_and_public_principals','partners_users_and_affected_groups','public_media_and_future_institutions','private_relations'];
const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
assert.deepEqual(rep.audiences.map((audience) => audience.id), audienceIds);
assert.equal(new Set(rep.audiences.map((audience) => audience.standing_axis)).size, audienceIds.length);
for (const audience of rep.audiences) {
  assert.ok(audience.cares_about.length >= 2);
  assert.ok(audience.cannot_grant.length >= 100);
  assert.match(audience.cannot_grant, /kan ikke|ikke gi/i);
}
assert.ok(rep.divergence_examples.length >= 6);
for (const term of [/global/i,/evidens|kilde/i,/styre/i,/deleg/i,/budsjett/i,/ansett|utnevn/i,/History Go|Badge/i]) assert.match(rep.authority_separation, term);
assert.ok(world.slow_axes.length >= 9);
for (const axis of world.slow_axes) assert.equal(axis.runtime_binding, 'editorial_only_until_governed');

assert.ok(canonicalRefs.includes(world.history_go_affordance.source_ref));
assert.equal(world.history_go_affordance.badge_id, 'historie');
assert.ok(world.history_go_affordance.better_question.length >= 350);
assert.match(world.history_go_affordance.better_question, /kilde|historiografi|institusjon/i);
for (const term of [/kan ikke/i,/appoint|utnevn|ansett/i,/deleg/i,/budsjett/i,/vedtak/i,/autentiser/i]) assert.match(world.history_go_affordance.authority_boundary, term);

assert.equal(world.cross_role_proof.status, 'not_materialized_no_shared_work_object');
assert.equal(world.cross_role_proof.shared_work_object_found, false);
assert.equal(world.cross_role_proof.required_for_rollout, false);
assert.equal(world.cross_role_proof.new_runtime, false);
assert.match(world.cross_role_proof.rule, /not_required_for_rollout|reelt delt|shared work object/i);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => \`\${beat.day}/\${beat.phase}\`));
assert.equal(beatKeys.size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.summary)).size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size, 56);
const expectedBeatType = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const useCounts = new Map(canonicalRefs.map((ref) => [ref,0]));
for (const beat of world.season.coverage) {
  assert.equal(beat.beat_type, expectedBeatType[beat.phase]);
  assert.ok(beat.summary.length >= 650, \`\${beat.day}/\${beat.phase}: summary \${beat.summary.length}\`);
  assert.ok(beat.standing_consequence.length >= 520, \`\${beat.day}/\${beat.phase}: standing \${beat.standing_consequence.length}\`);
  assert.ok(audienceIds.includes(beat.standing_audience));
  assert.equal(beat.materialization_refs.length, 1);
  assert.ok(canonicalRefs.includes(beat.materialization_refs[0]));
  useCounts.set(beat.materialization_refs[0], useCounts.get(beat.materialization_refs[0]) + 1);
}
for (const [ref,count] of useCounts) assert.ok(count >= 3, \`\${ref} underused: \${count}\`);

assert.equal(world.primary_threads.length, 7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 180);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => ref.split('/')[0])).size >= 3);
  for (const ref of thread.beat_refs) assert.ok(beatKeys.has(ref), \`\${thread.id}: \${ref}\`);
}
assert.equal(world.private_aftermath.length, 5);
for (const aftermath of world.private_aftermath) {
  assert.ok(aftermath.description.length >= 180);
  for (const ref of aftermath.materialization_refs) assert.ok(canonicalRefs.includes(ref));
}
assert.equal(world.delayed_consequences.length, 8);
const order = (ref) => { const [day,phase] = ref.split('/'); return Number(day)*10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0); };
for (const delayed of world.delayed_consequences) {
  assert.ok(beatKeys.has(delayed.setup_ref));
  assert.ok(beatKeys.has(delayed.return_ref));
  assert.ok(order(delayed.return_ref) > order(delayed.setup_ref));
  assert.ok(delayed.domains.includes('reputation') || delayed.domains.includes('relationship') || delayed.domains.includes('job'));
}

const idx = read('data/Civication/roleWorlds/index.json');
assert.deepEqual(idx.roles.find((entry) => entry.category === 'historie' && entry.role_scope === ROLE), {category:'historie',role_scope:ROLE,status:'role_world_complete',path:WORLD});
assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD));
assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY], world.theme_ids);
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((entry) => entry.key === KEY);
assert.equal(ready.role_world_status, 'role_world_complete');
assert.ok(ready.already_reference_or_pilot);
assert.ok(!(readiness.rollout_queue || []).some((entry) => entry.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 59);
assert.ok(readiness.summary.rollout_queue_roles <= 26);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
assert.equal(career.audit.salary.rows.length, 2);
for (const salary of career.audit.salary.rows) assert.equal(salary.offer_policy, 'appointment_required');

const source = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_HISTORIE_INSTITUSJONSLEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
assert.match(source, /Editorial uniqueness/i);
assert.match(source, /global reputation score/i);
assert.match(source, /not_required_for_rollout/);
assert.match(source, /appointment_required/);
assert.match(source, /30\\/30/);
console.log('Civication Historie Institusjonsledelse Role World rollout: OK');
`;
writeText(TEST, testSource);

console.log(JSON.stringify({
  world: WORLD,
  source_refs: canonicalRefs.length,
  audiences: audiences.length,
  beats: coverage.length,
  threads: primaryThreads.length,
  private_aftermath: privateAftermath.length,
  delayed_consequences: delayedConsequences.length
}));
