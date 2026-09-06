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
const ROLE = 'kunst_kuratering_og_program';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const INDEX = 'data/Civication/roleWorlds/index.json';
const CHECKLIST = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEMEBANK = 'data/Civication/roleWorldThemeBank.json';
const SOURCE = 'reports/CIVICATION_KUNST_KURATERING_OG_PROGRAM_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const BADGE = 'data/badges/kunst.json';
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
  Kuratorassistent: {policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},
  Kurator: {policy:'appointment_required',qualification_ids:['employer_appointment']},
  'Senior kurator': {policy:'appointment_required',qualification_ids:['employer_appointment']}
};
const catalogPath = (type) => `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;

must(!fs.existsSync(path.join(root, WORLD)), `${WORLD} already exists`);
for (const rel of [MODEL, GRAMMAR, PLAN, INDEX, CHECKLIST, THEMEBANK, BADGE]) must(fs.existsSync(path.join(root, rel)), `${rel} missing`);
const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
const index = read(INDEX);
const checklist = read(CHECKLIST);
const themeBank = read(THEMEBANK);
const badge = read(BADGE);
must(model.schema === 'civication_role_model_v2' && model.role_scope === ROLE, 'role model identity drifted');
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'work grammar identity drifted');
must(plan.sequence?.length === 16, 'prerequisite plan must remain 16 steps');
must(grammar.persistent_work_object_contract?.id === PERSISTENT, 'persistent work object drifted');
must(JSON.stringify(grammar.work_loops) === JSON.stringify(EXPECTED_LOOPS), 'curatorial work loops drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify(EXPECTED_AUTHORITY), 'authority boundary drifted');
must(grammar.day_one_contract?.entry === 'career_offer_policy_by_title', 'title-owned entry policy drifted');
must(JSON.stringify(grammar.day_one_contract?.entry_policy_by_title) === JSON.stringify(EXPECTED_POLICIES), 'Career title policies drifted');
must((model.related_people || []).length === 4, 'expected four prerequisite scenario actors');
for (const person of model.related_people) {
  must(person.fictional === true && person.fictional_scenario_actor === true && person.canonical_person_ref === null, `scenario actor provenance drifted: ${person.id}`);
}
const byLabel = Object.fromEntries((badge.tiers || []).map((entry) => [entry.label, entry]));
must(byLabel.Kuratorassistent?.career_offer?.policy === 'qualification_required', 'Kuratorassistent gate drifted');
must(JSON.stringify(byLabel.Kuratorassistent?.career_offer?.qualification_ids) === JSON.stringify(['relevant_education_or_employer_qualification']), 'Kuratorassistent qualification drifted');
must(byLabel.Kurator?.life_position?.id === 'kuratorpraksis' && byLabel.Kurator?.life_position?.employment_independent === true, 'Kurator life-position split drifted');
must(byLabel.Kurator?.career_unlock?.policy === 'appointment_required', 'Kurator career gate drifted');
must(JSON.stringify(byLabel.Kurator?.career_unlock?.qualification_ids) === JSON.stringify(['employer_appointment']), 'Kurator appointment requirement drifted');
must(byLabel['Senior kurator']?.career_offer?.policy === 'appointment_required', 'Senior kurator gate drifted');
must(JSON.stringify(byLabel['Senior kurator']?.career_offer?.qualification_ids) === JSON.stringify(['employer_appointment']), 'Senior kurator appointment requirement drifted');
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
  'professional_culture','class_power','status_anxiety','bureaucratic_power','care_vs_efficiency',
  'invisible_work','shame_reputation','public_private_leakage','public_attention'
];
const validThemeIds = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of themeIds) must(validThemeIds.has(id), `unknown theme ${id}`);

const audiences = [
  {
    id:'curatorial_peers_and_researchers',
    standing_axis:'research_and_interpretive_traceability',
    cares_about:['at researchspørsmål, kilder, motperspektiver og utvalgskriterier kan etterprøves før programmet låses','at skillet mellom dokumentert fakta, kunstnerposisjon, kuratorisk tolkning og institusjonelt valg forblir synlig gjennom tekst og beslutning'],
    cannot_grant:'Standing hos kuratoriske kolleger og forskere kan påvirke faglig tillit, hvem som inviterer spilleren inn i vanskelige vurderinger og hvor tidlig tvil deles, men kan ikke gi qualification_required, employer_appointment eller appointment_required, kan ikke gjøre tolkning til evidens og kan ikke skape budsjett, delegasjon eller institusjonell beslutningsmyndighet.'
  },
  {
    id:'registrars_provenance_and_rights',
    standing_axis:'provenance_rights_and_attribution_integrity',
    cares_about:['at proveniens, attribusjon, eierskapsspor, rettighet og samtykke markeres som bekreftet, omstridt eller uavklart uten narrativ pynt','at ny dokumentasjon gjenåpner bare de berørte feltene og beholder tidligere versjon av hva institusjonen visste og hevdet'],
    cannot_grant:'Standing hos registrarer og proveniens- eller rettighetsmiljø kan gi bedre informasjonsflyt og tidligere varsling, men kan ikke autentisere et verk, avgjøre juridisk eierskap alene, klarere alle rettigheter, godkjenne innkjøp eller salg eller gjøre sosial tillit, History Go eller et Kunst-Badge til dokumentert proveniens eller arbeidsgiverutnevnelse.'
  },
  {
    id:'artists_estates_and_lenders',
    standing_axis:'dialogue_consent_and_commitment',
    cares_about:['at kunstnerens eller boets posisjon, lånepremisser, samtykke og uenighet dokumenteres uten skjulte løfter om programplass','at kuratorisk nærhet ikke brukes til å omgå rettigheter, formell beslutning, proveniensusikkerhet eller institusjonens faktiske mandat'],
    cannot_grant:'Standing hos kunstnere, bo, långivere og samarbeidspartnere kan påvirke dialog, tilgang og hvilke alternativer som fortsatt er mulige, men kan ikke skape employer_appointment, gjøre en invitasjon til et bindende institusjonelt vedtak, garantere innkjøp eller salg, avgjøre budsjett eller gjøre relasjonell nærhet til rettighets- eller proveniensbevis.'
  },
  {
    id:'institutional_decision_owners',
    standing_axis:'mandate_habilitation_and_decision_clarity',
    cares_about:['at habilitet, interessekonflikt, anbefaling, beslutningseier og faktisk vedtak er separate spor i programobjektet','at kuratorisk kvalitet ikke brukes som begrunnelse for å hoppe over fullmakt, budsjett, delegasjon eller riktig beslutningsorgan'],
    cannot_grant:'Standing hos ledelse og formelle beslutningseiere kan påvirke ansvar, prosjektstørrelse og hvor mye tillit en anbefaling får, men kan ikke oppheve habilitetskrav, skrive om proveniens, gi rettigheter som ikke finnes eller gjøre Kurator-livspraksis, popularitet eller faglig standing til appointment_required employer_appointment.'
  },
  {
    id:'editors_production_and_mediation',
    standing_axis:'text_handoff_and_correction_reliability',
    cares_about:['at tekst, kildegrunnlag, tolkningsmarkører, rettighetsstatus og produksjonshandoff er versjonert og eiet før publisering','at en korrigert påstand, endret samtykke eller kunstnerprotest gir avgrenset rework framfor skjult omskriving av hele programhistorien'],
    cannot_grant:'Standing hos redaksjon, produksjon og formidling kan påvirke hvor smidig handoff og korreksjon skjer, men kan ikke gjøre tekstlig sikkerhet til dokumentert faktum, gi budsjett eller delegasjon, klarere rettigheter, vedta innkjøp eller salg eller endre canonical qualification_required og appointment_required-gater.'
  },
  {
    id:'publics_critics_and_communities',
    standing_axis:'public_reasoning_and_representational_legibility',
    cares_about:['at programmet kan forklare utvalg, fravalg, representasjonsmønstre og usikkerhet uten å late som kritikk er uvitenhet','at dokumenterte feil eller nye kilder faktisk kan korrigere tekst og premiss selv etter at en fortelling har fått offentlig oppmerksomhet'],
    cannot_grant:'Offentlig standing, kritikerros, protest eller publikumsrespons kan påvirke institusjonens læring og hvilke spørsmål som må besvares, men kan ikke gjøre flertall til sannhet, gi arbeidsgiverutnevnelse, budsjett eller delegasjon, løse habilitet, autentisere attribusjon eller klarere rettigheter, innkjøp, salg og eierskap.'
  },
  {
    id:'future_researchers_and_program_memory',
    standing_axis:'correction_access_and_program_memory',
    cares_about:['at framtidige kuratorer og forskere kan se hvorfor et verk eller en kunstner ble valgt, hva som var usikkert og hvem som faktisk besluttet','at programobjektet bevarer kilde-, proveniens-, rettighets-, tekst- og beslutningsversjoner slik at institusjonell hukommelse tåler senere revisjon'],
    cannot_grant:'Standing hos framtidige forvaltere og forskere kan styrke korrigerbarhet og institusjonell hukommelse, men kan ikke retroaktivt skape manglende evidens, employer_appointment, rettighet, budsjett eller delegasjon og kan ikke gjøre et senere faglig konsensus til bevis på hva institusjonen faktisk visste da beslutningen ble tatt.'
  },
  {
    id:'private_relations',
    standing_axis:'presence_confidentiality_and_identity_beyond_curatorial_status',
    cares_about:['at offentlig kritikk, kunstneruenighet, press og faglig tvil kan bearbeides uten at hjemmet blir et uformelt program- eller personalsaksrom','at spilleren kan ha en identitet som ikke står og faller med prestisje, nettverk, åpning, anmeldelse eller egen Kurator-status'],
    cannot_grant:'En nær relasjon kan gi støtte, motstand og perspektiv på belastning, men kan ikke gi qualification_required, appointment_required eller employer_appointment, kan ikke avgjøre proveniens, rettighet, habilitet, innkjøp, salg, budsjett eller delegasjon og kan ikke gjøre privat bekreftelse til evidens for en kuratorisk påstand.'
  }
];

const recurringPeople = [
  {
    id:'ingrid_senior_kurator_world',
    social_function:'Ingrid gjør researchspørsmål, utvalgskriterier, motperspektiv og skillet mellom anbefaling og faktisk beslutning sosialt synlig når et sterkt narrativ eller en prestisjefrist belønner rask lukking.',
    class_position:'Senior kurator med høy profesjonell kapital og faktisk arbeidsgiverutnevnelse, men uten rett til å gjøre senioritet til proveniensbevis, budsjettfullmakt eller grenseløs institusjonell myndighet.',
    status:'Hennes standing avhenger av om spilleren kan vise hvorfor et utvalg er gjort, hvilke kilder som bærer det og hva som fortsatt er tolkning eller uavklart premiss.',
    power_over_player:'Kan kreve ny research, tydeligere begrunnelse og en reell motstemme før anbefaling, men kan ikke bruke seniorstatus til å garantere kjøp, salg, rettighet eller employer_appointment.',
    wants:'At programmet tåler faglig uenighet og senere revisjon fordi kriterier, kandidater, fravalg, kilder og beslutningseier finnes i samme lesbare spor.',
    conceals:'En erfaren kurator kan bli så investert i egen fortelling at ønsket om koherens gjør motkilder og ubehagelige fravalg sosialt dyrere enn de burde være.',
    speech_style:'Kilde- og kriterieorientert; spør hva som faktisk er dokumentert, hva som er fortolkning og hvilken ny opplysning som ville endret utvalget.',
    teaches_player:'At kuratorisk autoritet blir sterkere når begrunnelsen kan utfordres, ikke når den gjøres uangripelig.'
  },
  {
    id:'malik_proveniens_rettighet_world',
    social_function:'Malik gjør proveniens, attribusjon, eierskapsspor, rettigheter og samtykke til egne beslutningsavhengigheter i stedet for små fotnoter under et ferdig kuratorisk narrativ.',
    class_position:'Registrar og proveniens-/rettighetskontakt med informasjons- og prosessmakt, men uten automatisk juridisk, kuratorisk eller arbeidsgivermessig beslutningsmyndighet.',
    status:'Hans standing måler om spilleren lar et hull være synlig, sender riktig spørsmål videre og beholder tidligere versjon når ny dokumentasjon endrer saken.',
    power_over_player:'Kan holde en handoff åpen og kreve dokumentasjon før tekst eller avtale låses, men kan ikke alene autentisere attribusjon, avgjøre eierskap eller godkjenne innkjøp og salg.',
    wants:'At programmet aldri lover mer om verkets historie, rettighet eller tilgjengelighet enn kildene og avtalene faktisk tåler.',
    conceals:'Systematisk kontroll kan gi falsk trygghet dersom fravær av registrert problem blir behandlet som positivt bevis på at problemet ikke finnes.',
    speech_style:'Status- og versjonsbevisst; spør hva som er bekreftet, omstridt, uavklart, hvem som eier neste kontroll og hva som må vente.',
    teaches_player:'At et godt program kan tåle et hull i fortellingen bedre enn det kan tåle en skjult usikkerhet.'
  },
  {
    id:'sofia_kunstner_programdialog_world',
    social_function:'Sofia gjør kunstnerdialog, invitasjon, samtykke, uenighet og programplassering til et spor som ikke kan omskrives av relasjonell nærhet eller etterpåklokskap.',
    class_position:'Kunstner- og programkoordinator med sterk relasjonell tilgang og handoff-ansvar, men uten fullmakt til å love opptak, kjøp, salg eller employer_appointment.',
    status:'Hennes standing avhenger av om spilleren skiller åpen utviklingsdialog fra løfte, og om kunstnerens egen posisjon blir bevart når kuratorisk tolkning avviker.',
    power_over_player:'Kan hente avklaringer, organisere dialog og stoppe en uklar kommunikasjon, men kan ikke gjøre kunstnernærhet til rettighet, budsjett, beslutning eller sannhet.',
    wants:'At kunstnere vet hva som er foreslått, hva som er besluttet, hva som er åpent og hva institusjonen faktisk ber om samtykke til.',
    conceals:'Omsorg for relasjonen kan friste til å tone ned et fravalg, en konflikt eller et uavklart premiss som egentlig må kommuniseres tydelig.',
    speech_style:'Relasjonell og presis; spør hva som ble sagt, hva som ble lovet, hva som bare var en idé og hvem som skal følge opp neste versjon.',
    teaches_player:'At tillit i kunstnerdialog krever lesbare grenser mellom invitasjon, forhandling, anbefaling og vedtak.'
  },
  {
    id:'henrik_tekst_produksjon_world',
    social_function:'Henrik gjør kildekontroll, tolkningsmarkører, korrektur, rettighetsstatus og produksjonshandoff synlig når et program må gå fra faglig arbeidsdokument til offentlig tekst og faktisk produksjon.',
    class_position:'Redaktør og produksjonshandoff med kontroll over publiseringsklarhet og praktisk overlevering, men uten kuratorisk veto eller juridisk rettighetsmyndighet.',
    status:'Hans standing måler om spilleren gir redaksjonen et lesbart grunnlag der en korrigering kan gjøres uten å skjule hva som tidligere sto og hvorfor det endret seg.',
    power_over_player:'Kan returnere tekst for kildekontroll, markere manglende rettighetsstatus og stoppe en uleselig handoff, men kan ikke gjøre språklig sikkerhet til faktabevis eller gi budsjettfullmakt.',
    wants:'At produksjon og publisering bygger på riktig versjon av utvalg, kilder, rettigheter, tekst og beslutning og at senere korreksjon forblir mulig.',
    conceals:'En stram redaksjonell prosess kan friste til å fjerne synlig usikkerhet fordi den oppleves som dårlig formidling, selv når usikkerheten er faglig nødvendig.',
    speech_style:'Redaksjonell og konkret; spør hvilken setning kilden bærer, hva som er tolkning og hvilken versjon produksjonen faktisk skal følge.',
    teaches_player:'At offentlig klarhet ikke krever falsk sikkerhet; den krever presise markører for hva vi vet, tolker og beslutter.'
  },
  {
    id:'aisha_kritiker_forsker_world',
    social_function:'Aisha representerer den informerte offentlige og forskende motlesningen som kan finne et oversett kildeproblem, et repeterende representasjonsmønster eller en institusjonell blindflekk etter at programmet føles ferdig.',
    class_position:'Uavhengig kritiker og forsker uten intern beslutningsmyndighet, men med offentlig og kunnskapsmessig makt til å gjøre svak begrunnelse synlig.',
    status:'Hennes standing avhenger av om institusjonen svarer på dokumenterbare premisser, viser hva den faktisk vurderte og kan korrigere uten defensiv historieskriving.',
    power_over_player:'Kan publisere kritikk, framlegge kilder og stille spørsmål som bør gjenåpne berørte felt, men kan ikke gi ansettelse, budsjett, delegasjon eller erstatte institusjonens faktiske beslutningsprosess.',
    wants:'At programmet kan leses som en etterprøvbar institusjonell handling, ikke som et personlig smaksutsagn som ber om immunitet mot kritikk.',
    conceals:'Også en skarp offentlig lesning kan overtolke motiv eller undervurdere praktiske begrensninger dersom institusjonen ikke gjør beslutningssporet tilgjengelig.',
    speech_style:'Analytisk og kildehenvisende; spør hvilke premisser som lå til grunn, hvilke alternativer som fantes og hva institusjonen vil endre når en påstand ikke holder.',
    teaches_player:'At offentlig kritikk kan være en kilde til bedre institusjonell hukommelse når svaret er dokumentasjon og korrigering framfor statusforsvar.'
  },
  {
    id:'liv_beslutningseier_world',
    social_function:'Liv gjør forskjellen mellom kuratorisk anbefaling og institusjonelt vedtak konkret når habilitet, budsjett, lånepremiss eller offentlig risiko krever riktig eier av beslutningen.',
    class_position:'Institusjonell beslutningseier med delegert mandat over bestemte program- og ressursvalg, men uten rett til å omskrive faglig kildegrunnlag eller gjøre ledelsesønske til proveniens.',
    status:'Hennes standing måler om spilleren sender et beslutningsklart og ærlig grunnlag videre, inkludert uenighet, usikkerhet, habilitet og hvilke premisser som fortsatt er eksternt avhengige.',
    power_over_player:'Kan fatte eller eskalere beslutninger innen delegert mandat, men kan ikke gjøre en uklar kilde sikker, klarere rettigheter uten grunnlag eller erstatte canonical title-gates med personlig tillit.',
    wants:'At institusjonelle vedtak kan spores tilbake til eksplisitte faglige premisser uten at kuratorisk arbeid eller ledelsesansvar glir inn i hverandre.',
    conceals:'Beslutningspress kan gjøre det fristende å be om en enklere anbefaling enn situasjonen faglig tåler, særlig nær åpning eller offentlig lansering.',
    speech_style:'Mandat- og konsekvensorientert; spør hva som faktisk må besluttes, hva som fortsatt venter, hvem som eier risikoen og hva beslutningen ikke kan avgjøre.',
    teaches_player:'At et godt beslutningsgrunnlag viser grensene for både faglig anbefaling og formell myndighet.'
  },
  {
    id:'private_relation_world',
    social_function:'En nær relasjon gjør restkostnaden av prestisje, offentlig kritikk, kunstneruenighet, frister og profesjonell tvil synlig uten å bli et uformelt kuratormøte hjemme.',
    class_position:'Privat nærperson uten kuratorisk, juridisk eller institusjonell myndighet over programmet.',
    status:'Standing her måler tilstedeværelse, fortrolighet og om spilleren kan ha en identitet som ikke er lik programstatus, nettverk, anmeldelse eller stillingstittel.',
    power_over_player:'Kan sette grenser for hva hjemmet tåler og utfordre spillerens selvfortelling, men kan ikke få fortrolige rettighets-, personalsaks- eller beslutningsopplysninger eller autorisere faglige valg.',
    wants:'At spilleren kan snakke sant om press, tvil og skuffelse uten å gjøre privat støtte til faglig fasit eller lekkasje av fortrolig materiale.',
    conceals:'Omsorg kan friste til for enkle råd når faglig usikkerhet faktisk må stå åpen til neste dokumenterte kontrollpunkt.',
    speech_style:'Nær og jordnær; spør hva spilleren bærer, hva som kan legges igjen på jobb og hva et dårlig resultat gjør med selvbildet.',
    teaches_player:'At korrigerbar profesjonell identitet trenger et privat liv der prestisje kan falle uten at hele personen gjør det.'
  }
];

const slowAxes = [
  {id:'research_traceability',label:'Researchspor',description:'Utvikles gjennom presise spørsmål, kildeproveniens, motkilder og synlig skille mellom dokumentasjon og fortolkning.',runtime_binding:'editorial_only_until_governed'},
  {id:'selection_rationale',label:'Utvalgsbegrunnelse',description:'Utvikles når kriterier, kandidater, fravalg og representasjonsvirkning er lesbare før programmet låses.',runtime_binding:'editorial_only_until_governed'},
  {id:'provenance_rights_discipline',label:'Proveniens- og rettighetsdisiplin',description:'Utvikles når proveniens, attribusjon, eierskapsspor, rettighet og samtykke holdes som egne statusfelt og ventepunkter.',runtime_binding:'editorial_only_until_governed'},
  {id:'habilitation_integrity',label:'Habilitet og mandat',description:'Utvikles når interesser, habilitet, anbefaling, beslutningseier og faktisk vedtak ikke glir sammen under press.',runtime_binding:'editorial_only_until_governed'},
  {id:'artist_dialogue',label:'Kunstnerdialog',description:'Utvikles gjennom presis dokumentasjon av invitasjon, posisjon, uenighet, samtykke og hva som faktisk er lovet.',runtime_binding:'editorial_only_until_governed'},
  {id:'handoff_reliability',label:'Tekst- og produksjonshandoff',description:'Utvikles når riktig kilde-, rettighets-, tekst- og beslutningsversjon følger saken videre med eksplisitt eier.',runtime_binding:'editorial_only_until_governed'},
  {id:'correction_openness',label:'Korrigerbarhet',description:'Utvikles når nye kilder, protest og dokumenterte feil gjenåpner berørte felt uten å slette tidligere institusjonell historie.',runtime_binding:'editorial_only_until_governed'},
  {id:'curatorial_identity',label:'Kuratorisk identitet',description:'Utvikles når faglig autoritet tåler uenighet og skiller praksis, standing og faktisk arbeidsgiverutnevnelse.',runtime_binding:'editorial_only_until_governed'},
  {id:'private_sustainability',label:'Privat bærekraft',description:'Utvikles når offentlig oppmerksomhet og prestisje ikke gjør hjemmet til arbeidsrom eller privat bekreftelse til faglig evidens.',runtime_binding:'editorial_only_until_governed'}
];

const socialEnvironments = [
  'research- og utvalgsrommet der spørsmål, kilder, kandidater, kriterier og motperspektiver må eksistere før en programfortelling får autoritet',
  'proveniens-, attribusjons-, rettighets- og lånekontrollen der uavklart status er en eksplisitt avhengighet og ikke et hull som kan skrives bort',
  'kunstnerdialog- og programbordet der invitasjon, kunstnerposisjon, uenighet, samtykke og programplassering versjoneres uten skjulte løfter',
  'habilitets- og beslutningspunktet der interesser, anbefaling, budsjettpremiss, delegasjon og faktisk institusjonelt vedtak holdes adskilt',
  'tekst-, formidlings- og produksjonshandoffen der kilde, tolkningsmarkør, rettighetsstatus, korrektur og neste eier må følge samme versjon',
  'offentlig kritikk- og korrigeringsrom der institusjonen må kunne svare på premisser, vise tidligere versjon og rette dokumenterte feil',
  'programminnet der framtidige kuratorer og forskere kan rekonstruere hva som var kjent, tolket, anbefalt og besluttet',
  'privatlivet der offentlig oppmerksomhet, avslag og kunstnerkonflikt kan bearbeides uten at fortrolig program-, rettighets- eller personalsaksinformasjon følger med hjem'
];

const dayCases = [
  'Researchspørsmålet må låses før et prestisjeverk får definere hele fortellingen.',
  'En nær relasjon til en kandidat gjør habilitet og åpent fravalg viktigere enn nettverkskomfort.',
  'Et sentralt proveniensledd mangler samtidig som verket passer perfekt i programnarrativet.',
  'Attribusjonen er mindre sikker enn den etablerte veggteksten antyder, og tidligere kildebruk må leses på nytt.',
  'Kunstneren mener institusjonens kontekstualisering forskyver verkets premiss og krever at egen posisjon skilles fra kuratorisk tolkning.',
  'Rettighets- eller samtykkestatus endres etter at tekst og produksjon har begynt, og bare berørte felt skal gjenåpnes.',
  'Et mønster i kandidatliste og fravalg viser smal representasjon uten at kvalitet kan reduseres til kvote eller nettverk.',
  'Låne- og gjennomførbarhetsinput gjør et ønsket hovedverk vanskelig, og praktisk motstand må ikke skjules som kunstnerisk fravalg.',
  'En publiseringstekst blander dokumentert fakta, kunstnerens egen posisjon og kuratorisk tolkning i samme sikre stemme.',
  'Det er uklart hvem som faktisk eier den formelle beslutningen etter at faglig anbefaling, budsjett og habilitet peker i ulike retninger.',
  'Offentlig kritikk peker på en kilde og et historisk perspektiv programmet ikke behandlet godt nok, og saken må åpnes uten statusforsvar.',
  'En kunstner trekker et samtykke eller endrer deltakelsespremiss, og programmet må revideres uten å omskrive hva som tidligere var avtalt.',
  'En dokumentert feil oppdages nær åpning, og tekst, produksjon og offentlig begrunnelse må korrigeres uten å skjule den gamle versjonen.',
  'Sesongen avsluttes med et programminne som må vise kilder, utvalg, fravalg, usikkerhet, dialog, beslutning og korreksjon for neste forvalter.'
];

const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = {morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'};
const phaseLead = {
  morning:'Morgenen åpner et nytt arbeidssteg i det versjonerte programobjektet og tvinger spilleren til å skille observasjon av kilder og status fra ønsket programutfall.',
  lunch:'Lunsjfasen gjør den sosiale makten i saken synlig gjennom en aktør som både vet noe, ønsker noe og har en avgrenset myndighet som ikke kan lånes av spilleren.',
  afternoon:'Ettermiddagen krever en beslutning eller eksplisitt ventestatus innen faktisk mandat, med synlig eier, kontrollpunkt og avgrenset rework dersom premisset senere endres.',
  evening:'Kvelden viser privat restkostnad og profesjonell identitet uten å gjøre hjemmet til et skjult beslutningsrom eller privat støtte til faglig evidens.'
};
const actorNames = ['Ingrid','Malik','Sofia','Henrik','Aisha','Liv','en nær relasjon'];

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
    const phase = phases[phaseIndex];
    const audience = audiences[(day * 2 + phaseIndex) % audiences.length];
    const ref = canonicalRefs[((day - 1) * 4 + phaseIndex) % canonicalRefs.length];
    const actor = actorNames[((day - 1) + phaseIndex) % actorNames.length];
    const summary = `Dag ${day}, ${phase}: ${dayCases[day - 1]} ${phaseLead[phase]} ${actor} gjør et av premissene sosialt lesbart, men arbeidet må fortsatt gå gjennom ${PERSISTENT}. Objektet beholder researchspørsmål og kildeproveniens, kandidater og utvalgskriterier, dokumentert fakta versus kuratorisk tolkning, proveniens og attribusjonsstatus, rettigheter og samtykker, habilitet og interesseerklæring, kunstnerdialog, låne- og gjennomførbarhetsinput, kuratorisk anbefaling, formell beslutning og beslutningseier, tekstversjon, produksjonshandoff, publikumsrespons, ventepunkt og neste ansvarlige. De canonicale arbeidsløkkene forblir '${EXPECTED_LOOPS[0]}' og '${EXPECTED_LOOPS[1]}'. Spilleren kan foreslå og begrunne utvalg, utvikle konsepter og forhandle faglige premisser innen mandat, men kan ikke skjule interessekonflikter, garantere innkjøp eller salg uten fullmakt, endre proveniens uten dokumentasjon eller framstille tolkning som ubestridt faktum. Kuratorassistent er fortsatt qualification_required; Kurator og Senior kurator er appointment_required gjennom employer_appointment. Kuratorpraksis er employment_independent, og verken standing, History Go, Kunst-Badge, nettverk, programrespons eller denne beat-en kan endre title-gatene, skape budsjett eller delegasjon eller gjøre en anbefaling til institusjonelt vedtak.`;
    const standing = `Standing hos ${audience.id} endres bare som langsom, situert hukommelse om hvordan denne konkrete saken ble håndtert: ${audience.cares_about.join(' og ')}. Den er uttrykkelig ikke en global reputation score og kan divergere fra alle andre publikums vurdering. Den kan påvirke hvor tidlig ${actor} deler tvil, hvor mye kontekst spilleren får og hvor lett neste handoff blir, men kan aldri produsere evidens, autentisere attribusjon, løse proveniens, rettighet eller samtykke, oppheve habilitet, gi qualification_required, appointment_required eller employer_appointment, skape budsjett eller delegasjon, garantere innkjøp eller salg eller gjøre offentlig respons til sannhet. ${audience.cannot_grant} Dag ${day}/${phase} lagrer derfor bare redaksjonell standing rundt eksisterende Scene Pipeline og eksisterende mailkilder; den oppretter ingen ny runtime state og ingen parallell motor.`;
    coverage.push({day,phase,beat_type:phaseTypes[phase],summary,standing_audience:audience.id,standing_consequence:standing,materialization_refs:[ref]});
  }
}

const primaryThreads = [
  {id:'ingrid_research_utvalg_og_motstemme',relationship:'Ingrid bærer en langsom faglig relasjon der spilleren må vise at sterke programgrep fortsatt kan rekonstrueres gjennom researchspørsmål, kilder, kandidater, utvalgskriterier, motperspektiver og en faktisk beslutningseier. Relasjonen belønner korrigerbar begrunnelse, ikke lik smak eller personlig lojalitet.',beat_refs:['1/morning','2/afternoon','4/lunch','7/afternoon','9/morning','11/afternoon','14/morning']},
  {id:'malik_proveniens_rettighet_og_attribusjon',relationship:'Malik holder den dokumentariske motstanden mot et for glatt narrativ levende. Tillit bygges når uavklart proveniens, attribusjon, eierskapsspor, rettighet og samtykke får egne statuser, eiere og ventepunkter og når en senere korreksjon ikke sletter hva institusjonen tidligere trodde.',beat_refs:['1/afternoon','3/morning','4/afternoon','6/morning','8/lunch','11/morning','14/afternoon']},
  {id:'sofia_kunstnerdialog_samtykke_og_uenighet',relationship:'Sofia følger om spilleren kan ha tett kunstnerdialog uten å gjøre invitasjon til løfte, nærhet til myndighet eller kunstnerens egen posisjon til identisk med kuratorisk tolkning. Forholdet tåler uenighet når den blir dokumentert og koblet til neste ansvarlige.',beat_refs:['2/lunch','5/morning','5/afternoon','6/lunch','9/lunch','12/morning','13/lunch']},
  {id:'henrik_tekst_handoff_og_korrigering',relationship:'Henrik gjør den offentlige teksten til et kontrollpunkt for kildeproveniens, tolkningsmarkør, rettighetsstatus og korrekt versjon. Relasjonen utvikles når spilleren leverer korrigerbar klarhet og aksepterer at en dokumentert feil kan kreve synlig ny versjon framfor defensiv omskriving.',beat_refs:['3/lunch','7/morning','9/afternoon','10/lunch','11/lunch','13/afternoon','14/lunch']},
  {id:'liv_habilitet_mandat_og_beslutning',relationship:'Liv holder forskjellen mellom faglig anbefaling og institusjonelt vedtak stabil gjennom hele sesongen. Spilleren må sende videre uenighet, habilitet, budsjettpremiss og eksterne avhengigheter uten å be ledelsen om å produsere faglig sikkerhet som kildene ikke gir.',beat_refs:['2/morning','2/afternoon','8/afternoon','10/morning','10/afternoon','12/afternoon','14/afternoon']},
  {id:'aisha_offentlig_motlesning_og_programminne',relationship:'Aisha gjør offentlig kritikk og senere forskning til en mulig korrektiv kraft uten at publikum blir en ny beslutningsmyndighet. Forholdet må vise om institusjonen svarer på premisser, kan synliggjøre fravalg og representasjonsmønstre og kan rette en påstand uten å late som den gamle versjonen aldri fantes.',beat_refs:['7/lunch','9/evening','11/morning','11/afternoon','12/lunch','13/morning','14/evening']},
  {id:'privat_grense_og_kuratorisk_identitet',relationship:'Den private tråden undersøker om spilleren kan bære avslag, prestisje, nettverkskonflikt og offentlig kritikk uten å gjøre hjemmet til et uformelt kuratorisk råd. Profesjonell status skal kunne falle eller korrigeres uten at hele identiteten krever privat bekreftelse.',beat_refs:['1/evening','3/evening','5/evening','8/evening','10/evening','12/evening','14/evening']}
];

const privateAftermath = [
  {id:'prestisjeverket_som_matte_vente',description:'Etter at et prestisjeverk ikke kan behandles som programanker før research- og proveniensgrunnlaget er lesbart, følger tvilen med hjem. Spilleren må tåle at et faglig riktig ventepunkt kan oppleves som tap av tempo og status uten å dele fortrolig dokumentasjon eller søke privat autorisasjon for å overstyre ventingen.',materialization_refs:[canonicalRefs[0]]},
  {id:'kunstneruenigheten_som_ble_synlig',description:'En reell uenighet med en kunstner blir stående eksplisitt i tekst- og dialogsporet. Privat må spilleren tåle at respektfull dokumentasjon ikke garanterer relasjonell harmoni, og at et nært menneske kan støtte belastningen uten å bli jury over kunstnerens posisjon, institusjonens mandat eller rettighetsgrunnlaget.',materialization_refs:[canonicalRefs[4]]},
  {id:'habilitetsvalget_som_kostet_nettverk',description:'Når en interessekonflikt deklareres og spilleren trekker seg fra deler av et utvalg, kan nettverket lese det som avstand eller svakhet. Etterspillet undersøker om profesjonell integritet kan beholdes uten å gjøre privatlivet til et sted for å rekonstruere status, angripe kolleger eller dele interne vurderinger.',materialization_refs:[canonicalRefs[6]]},
  {id:'kritikken_som_avdekket_en_reell_mangel',description:'Offentlig kritikk treffer et faktisk hull i kildearbeid eller representasjonsanalyse. Spilleren må skille skam fra korrigerbarhet: svaret på jobb er ny kildekontroll og synlig rettelse, mens hjemmet bare skal bære den menneskelige restkostnaden, ikke selve programbehandlingen eller strategien for å vinne omdømme tilbake.',materialization_refs:[canonicalRefs[11]]},
  {id:'sesongslutt_uten_kuratorhelt',description:'Programmet avsluttes uten en fortelling om den geniale enkeltkuratoren. Det som står igjen er et lesbart kollektivt arbeid med kilder, fravalg, uenighet, rettigheter, beslutning og korreksjon. Privat må spilleren kunne oppleve dette som faglig verdi selv om den sosiale belønningen er mindre spektakulær enn personlig prestisje.',materialization_refs:[canonicalRefs[14]]}
];

const delayedConsequences = [
  {id:'tidlig_kildekart_blir_senere_korreksjonsgrunnlag',setup_ref:'1/morning',return_ref:'11/afternoon',domains:['research','public_correction'],description:'Det tidlige kildekartet gjør det mulig å se nøyaktig hvilken premiss offentlig kritikk faktisk endrer.'},
  {id:'habilitetserklaering_blir_senere_tillit_under_fravalg',setup_ref:'2/morning',return_ref:'10/afternoon',domains:['habilitation','decision'],description:'Den tidlige interesseerklæringen gjør et senere upopulært fravalg institusjonelt lesbart framfor personlig mystisk.'},
  {id:'proveniushull_blir_senere_programminne',setup_ref:'3/morning',return_ref:'14/afternoon',domains:['provenance','institutional_memory'],description:'Det bevarte hullet gjør at neste forvalter kan se både hva som manglet og hvorfor programmet ventet.'},
  {id:'attribusjonsforbehold_blir_senere_tekstkorreksjon',setup_ref:'4/afternoon',return_ref:'13/afternoon',domains:['attribution','text'],description:'Et eksplisitt attribusjonsforbehold gjør en sen tekstkorreksjon avgrenset og sporbar.'},
  {id:'kunstneruenighet_blir_senere_dialogkvalitet',setup_ref:'5/morning',return_ref:'12/morning',domains:['artist_dialogue','consent'],description:'Den dokumenterte uenigheten hindrer at en senere endring i deltakelsespremiss blir framstilt som plutselig eller illojal.'},
  {id:'rettighetsventing_blir_senere_handoffkvalitet',setup_ref:'6/morning',return_ref:'9/afternoon',domains:['rights','production'],description:'Synlig venting gjør at redaksjon og produksjon ikke arver et uavklart rettighetsspørsmål som skjult ansvar.'},
  {id:'representasjonsanalyse_blir_senere_offentlig_begrunnelse',setup_ref:'7/afternoon',return_ref:'11/afternoon',domains:['representation','public_reasoning'],description:'Det tidlige mønsterarbeidet gjør det mulig å svare på kritikk med faktiske kriterier og fravalg, ikke bare intensjon.'},
  {id:'privat_grense_blir_senere_korrigerbar_identitet',setup_ref:'8/evening',return_ref:'14/evening',domains:['private_life','professional_identity'],description:'En tydelig privat grense gjør at en senere offentlig korreksjon ikke må kompenseres med statusforsvar hjemme.'}
];

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:CATEGORY,
  role_scope:ROLE,
  title:'Kunst / Kuratering og program — kildearbeid, utvalg, uenighet og situert legitimitet',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Hvordan bygge et utstillings- og programnarrativ når kilder, kunstnerrelasjoner, nettverk, proveniens, attribusjon, rettigheter, representasjon, institusjonelt mandat og offentlig oppmerksomhet trekker i ulike retninger — uten å gjøre kuratorisk standing til sannhet, ansettelse eller grenseløs myndighet?',
    description:'Rollen organiseres rundt et versjonert programobjekt der det som er kjent, tolket, foreslått, forhandlet og faktisk besluttet må kunne skilles. Standing er situert: kuratoriske kolleger husker research- og utvalgsdisiplin, registrarer proveniens og rettigheter, kunstnere dialog og løfter, beslutningseiere habilitet og mandat, redaksjon handoff og korreksjon, offentligheten begrunnelse og representasjon, framtidige forvaltere programminnet og privatlivet om spilleren kan tåle kritikk uten å gjøre status til identitet.'
  },
  theme_ids:themeIds,
  social_environments:socialEnvironments,
  recurring_people_archetypes:recurringPeople,
  slow_axes:slowAxes,
  existing_work_continuity:{
    runtime_binding:'existing_mail_plan_and_work_grammar',
    new_runtime_state:false,
    work_loops:[...grammar.work_loops],
    persistent_work_object:PERSISTENT,
    waiting_states:[...grammar.rhythm_contract.waiting_states],
    handoff_rule:grammar.persistent_work_object_contract.handoff_rule,
    rework_rule:grammar.rhythm_contract.rework_rule,
    canonical_surfaces:[MODEL,GRAMMAR,PLAN,...TYPES.map(catalogPath)],
    rule:'Den eksisterende 16-stegs planen, ni mailtyper, fire profesjonelle scenarioaktører, fire arbeidsflater, det versjonerte programobjektet og waiting/handoff/rework-rytmen forblir authoritative; Role World-en legger bare situert standing og 14-dagers dramaturgi rundt disse kildene.'
  },
  situated_reputation_model:{
    global_score_allowed:false,
    audiences,
    divergence_examples:[
      'En kildekritisk utsettelse kan styrke standing hos forskere og registrarer samtidig som kunstner eller ledelse opplever tap av tempo.',
      'Et åpent habilitetsfravalg kan svekke nettverksnærhet samtidig som institusjonell beslutningsstanding styrkes.',
      'En synlig proveniensusikkerhet kan gjøre offentlig tekst mindre elegant samtidig som framtidig programminne blir mer troverdig.',
      'En kunstner kan være uenig i tolkningen og likevel ha høy standing på om dialogen var redelig og samtykket korrekt håndtert.',
      'En offentlig korreksjon kan koste prestisje i øyeblikket og samtidig styrke standing hos kritikere, redaksjon og framtidige forvaltere.',
      'En stram privat grense kan oppleves som mindre tilgjengelig hjemme på en vanskelig kveld samtidig som den beskytter både fortrolighet og langsiktig relasjon.'
    ],
    authority_separation:'Det finnes ingen global reputation score. Standing er sosial hukommelse, ikke evidens, og kan aldri produsere dokumentert proveniens, attribusjon, rettighet, samtykke eller habilitet. Den kan ikke oppfylle qualification_required, appointment_required eller employer_appointment, kan ikke ansette eller utnevne, gi delegasjon eller budsjett, garantere innkjøp eller salg, avgjøre eierskap eller gjøre kuratorisk tolkning til ubestridt faktum. Kuratorpraksis forblir employment_independent. History Go og Kunst-Badge kan skjerpe spørsmål og kildekritikk, men kan ikke overta title-gater, institusjonell beslutning eller juridisk og dokumentarisk myndighet.'
  },
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  history_go_affordance:{
    badge_id:'kunst',
    source_ref:knowledgeRef,
    better_question:'History Go kan gjøre det neste kuratoriske spørsmålet bedre ved å hente kunsthistorisk kontekst, verk- og kunstnerbiografi, utstillingshistorikk, institusjonshistorie og kildekritiske spor som gjør en påstand, et fravalg eller et representasjonsmønster lettere å undersøke. Det riktige spørsmålet er ikke «hva bør vi velge fordi jeg kjenner historien?», men «hvilke kilder bærer denne påstanden, hvilke motperspektiver mangler, hva er dokumentert fakta versus kunstnerposisjon og kuratorisk tolkning, hvilken proveniens- eller attribusjonsusikkerhet finnes, og hvilken rettighet, habilitet eller formell beslutning må fortsatt avklares før dette kan bli offentlig program?»',
    authority_boundary:'History Go kan ikke sertifisere proveniens eller attribusjon, klarere rettighet eller samtykke, løse habilitet, garantere innkjøp eller salg, avgjøre eierskap, gi delegasjon eller budsjett, gjøre en anbefaling til institusjonelt vedtak, ansette eller utnevne eller oppfylle qualification_required, appointment_required eller employer_appointment. Et Kunst-Badge og Kurator-livspraksis kan heller ikke gi disse fullmaktene.'
  },
  cross_role_proof:{
    status:'not_materialized_no_shared_work_object',
    shared_work_object_found:false,
    required_for_rollout:false,
    new_runtime:false,
    candidate_when_shared_work_is_real:true,
    rule:'Readiness markerer candidate_when_shared_work_is_real, men denne Role World-en materialiserer ingen cross-role link. En framtidig kobling krever et reelt delt work object med samme identitet, versjon, eier- og handoff-kontrakt; naboskap mellom Kuratering, Kunstnerisk ledelse, Utstillingsproduksjon eller Konservering er ikke nok.'
  },
  editorial_uniqueness:{
    not_copy_of:['kunst/kunst_kunstnerisk_ledelse','kunst/kunst_utstillingsproduksjon','kunst/kunst_konservering_og_samling'],
    rule:'Denne verdenen er research-, utvalgs-, proveniens-/attribusjons-, rettighets-, habilitets-, kunstnerdialog-, tekst- og korreksjonssentrert. Den er ikke portefølje-/styreledelse, produksjonsdrift eller materialbehandling, selv når de samme institusjonene og enkelte handoff-grenser møtes.'
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
    career_title_gates_preserved:true,
    kurator_life_position_split_preserved:true,
    cross_role_link_materialized:false,
    source_refs:canonicalRefs
  }
};

write(WORLD, world);
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
write(INDEX, index);
checklist.reference_worlds.push(WORLD);
write(CHECKLIST, checklist);
themeBank.reference_profiles[KEY] = themeIds;
write(THEMEBANK, themeBank);

const source = `# Kunst / Kuratering og program — Role World rollout source-first\n\n## Scope lock\n\nCanonical role: \`${KEY}\`. This materialization is the dedicated Role World rollout and authors only \`situated_reputation\`. The existing Career gameplay, role model, work grammar, persistent work object, People, Places, mail plan and nine mail families remain authoritative.\n\n## Career and Life/Career boundary\n\n- Kuratorassistent: \`qualification_required\` with \`relevant_education_or_employer_qualification\`.\n- Kurator: \`appointment_required\` with \`employer_appointment\`.\n- Senior kurator: \`appointment_required\` with \`employer_appointment\`.\n- Kurator \`kuratorpraksis\` remains an employment-independent Life Position and is not an employment gate.\n- Standing, History Go, Kunst-Badge, popularity, network access or season outcomes cannot replace these gates.\n\n## Existing work continuity\n\nThe persistent object remains \`${PERSISTENT}\`. Both canonical work loops are preserved byte-for-byte. Waiting, owner, handoff and bounded rework remain in the existing work grammar and mail plan. The Role World does not create a new work engine.\n\n## Situated reputation\n\nThere is **no global reputation score**. Eight audiences can remember the same action differently: curatorial peers/researchers; registrar/provenance/rights; artists/estates/lenders; institutional decision owners; editors/production/mediation; publics/critics/communities; future researchers/program memory; and private relations. Standing cannot produce evidence, legal status, appointment, budget, delegation, acquisition/sale authority or institutional decision.\n\n## Cross-role proof\n\nStatus: \`not_materialized_no_shared_work_object\`. Readiness says \`candidate_when_shared_work_is_real\`, but this rollout does not materialize a cross-role link. A future link requires a genuinely shared work object with the same identity, version, owner and handoff contract.\n\n## History Go boundary\n\nHistory Go can improve art-historical and source-critical questions, but cannot certify provenance/attribution, rights/consent, habilitation, ownership, acquisition/sale, budget/delegation, institutional selection decisions or Career title gates.\n\n## Editorial uniqueness\n\nThis Role World is research-, selection-, provenance/attribution-, rights-, habilitation-, artist-dialogue-, text- and correction-centered. It is not a copy of Kunstnerisk ledelse, Utstillingsproduksjon or Konservering og samlingsbevaring.\n\n## Materialization provenance\n\nThe 15 canonical prerequisite mails across all nine required mail types are the only materialization sources. Every source mail is reused at least three times over the 56-beat season; there is no raw mail-family runtime fallback.\n\n## Runtime boundary\n\n**No new runtime** and no parallel scene format. The existing Scene Pipeline remains canonical. All slow standing axes are \`editorial_only_until_governed\`.\n\n## Quality gate\n\n**30/30** Role World quality gate target: scope, source reuse, Career boundary, Life/Career split, authority, 14×4 coverage, situated standing, divergence, threads, private aftermath, delayed consequences, History Go boundary, cross-role proof, registration, readiness shrink and runtime non-expansion are all explicit and fail-closed verified before permanent commit.\n`;
writeText(SOURCE, source);

console.log(`Materialized ${WORLD} with ${coverage.length} beats, ${canonicalRefs.length} source refs and no new runtime.`);
