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
const ROLE = 'kunst_museumsledelse';
const KEY = `${CATEGORY}/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/${CATEGORY}/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/${CATEGORY}/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/${CATEGORY}/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/${CATEGORY}/${ROLE}.json`;
const INDEX = 'data/Civication/roleWorlds/index.json';
const CHECKLIST = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEMEBANK = 'data/Civication/roleWorldThemeBank.json';
const BADGE = 'data/badges/kunst.json';
const SOURCE = 'reports/CIVICATION_KUNST_MUSEUMSLEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PERSISTENT = 'institusjonsstrategi_budsjett_styre_risiko_arbeidsmiljo_og_beredskapslogg';
const EXPECTED_LOOPS = [
  'mandat -> strategi -> budsjett -> gjennomforing -> rapportering -> evaluering',
  'hendelse -> sikre mennesker og samling -> etablere fakta -> beslutte -> informere -> etterkontroll'
];
const EXPECTED_AUTHORITY = {
  may: ['lede institusjonen innen mandat','fordele ressurser innen fullmakt','utøve arbeidsgiveransvar'],
  may_not: ['sette styrets myndighet til side','bruke samling eller midler privat','overstyre dokumenterte faglige sikkerhetsgrenser uten grunnlag','skjule vesentlig risiko']
};
const EXPECTED_POLICY = {Museumsdirektør:{policy:'appointment_required',qualification_ids:['employer_appointment']}};
const EXPECTED_ACTORS = [
  'anne_styreleder_kunst_museumsledelse',
  'omar_okonomi_hr_kunst_museumsledelse',
  'ida_samlings_beredskapsleder_kunst_museumsledelse',
  'marius_kunstnerisk_leder_kunst_museumsledelse'
];
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
must(JSON.stringify(grammar.work_loops) === JSON.stringify(EXPECTED_LOOPS), 'Museumsledelse work loops drifted');
must(JSON.stringify(grammar.authority_boundary) === JSON.stringify(EXPECTED_AUTHORITY), 'authority boundary drifted');
must(grammar.day_one_contract?.entry === 'career_offer_policy_by_title', 'title-owned entry policy drifted');
must(JSON.stringify(grammar.day_one_contract?.entry_policy_by_title) === JSON.stringify(EXPECTED_POLICY), 'Museumsdirektør Career policy drifted');
must(grammar.rhythm_contract?.waiting_states?.length === 6, 'waiting-state contract drifted');
must(JSON.stringify((model.related_people || []).map((p) => p.id)) === JSON.stringify(EXPECTED_ACTORS), 'prerequisite actor set drifted');
for (const person of model.related_people || []) must(person.fictional === true && person.fictional_scenario_actor === true && person.canonical_person_ref === null, `scenario actor provenance drifted: ${person.id}`);
const museumTier = (badge.tiers || []).find((entry) => entry.label === 'Museumsdirektør');
must(museumTier?.career_offer?.policy === 'appointment_required', 'Museumsdirektør must remain appointment_required');
must(JSON.stringify(museumTier?.career_offer?.qualification_ids) === JSON.stringify(['employer_appointment']), 'Museumsdirektør appointment gate drifted');
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
const validThemes = new Set(themeBank.themes.map((entry) => entry.id));
for (const id of themeIds) must(validThemes.has(id), `unknown theme ${id}`);

const audiences = [
  {
    id:'board_and_owners', standing_axis:'mandate_reporting_and_material_risk_visibility',
    cares_about:['at styrevedtak, delegasjon, eierkrav og direktørens eget handlingsrom kan skilles fra hverandre i hver versjon av institusjonsloggen','at vesentlig økonomisk, juridisk, arbeidsmiljø- eller samlingsrisiko rapporteres med konsekvens og usikkerhet før tillit brukes som erstatning for formell behandling'],
    cannot_grant:'Standing hos styre og eiere kan påvirke hvor mye handlingsrom direktøren får innen et faktisk vedtak og hvor tidlig krevende saker løftes, men kan ikke gjøre personlig tillit til styremyndighet, kan ikke erstatte employer_appointment, kan ikke utvide budsjett eller delegasjon uten beslutning og kan ikke oppheve dokumenterte faglige sikkerhetsgrenser.'
  },
  {
    id:'leadership_team_and_employees', standing_axis:'employer_consistency_and_priority_traceability',
    cares_about:['at prioriteringer mellom bemanning, program, samling og drift henger sammen med budsjett, arbeidsmiljøansvar og tydelig beslutningseier','at ledelsen ikke bruker prestisje, tempo eller offentlig press til å flytte belastning nedover uten å eie konsekvens, rework og oppfølging'],
    cannot_grant:'Standing i ledergruppen og blant ansatte kan påvirke informasjonsflyt, varsling og gjennomføring, men kan ikke ansette eller utnevne Museumsdirektøren, gi styremyndighet, utvide delegert budsjett, avslutte en personalsak uten korrekt prosess eller gjøre popularitet til bevis for at arbeidsgiveransvaret er oppfylt.'
  },
  {
    id:'curators_and_artistic_leadership', standing_axis:'artistic_autonomy_under_governance',
    cares_about:['at samfunnsoppdrag, kunstnerisk autonomi og institusjonsstyring skilles slik at økonomisk eller hierarkisk makt ikke blir skjult kuratorisk fasit','at direktøren dokumenterer reelle faglige motstemmer når budsjett, sponsor, styre eller offentlig oppmerksomhet endrer rammer for programmet'],
    cannot_grant:'Standing hos kuratorer og kunstnerisk ledelse kan påvirke faglig tillit og kvaliteten på strategiske alternativer, men kan ikke gi employer_appointment, styrevedtak, budsjettfullmakt eller privat kontroll over institusjonen og kan ikke gjøre kunstnerisk autoritet til kompetanse til å overstyre konserverings-, sikkerhets- eller arbeidsmiljøgrenser.'
  },
  {
    id:'conservators_collection_and_security', standing_axis:'professional_safety_boundary_respect',
    cares_about:['at verifiserte fakta om mennesker, samling, bygg og sikkerhet står foran ønsket om åpning, omdømme eller økonomisk normaldrift når en hendelse krever faglig sikring','at direktørens kriseledelse bruker riktig fagmyndighet og etterlater et lesbart spor av hva som var kjent, hvilket tiltak som var faglig begrunnet og hvem som eide neste kontroll'],
    cannot_grant:'Standing hos konservatorer, samlingsforvaltere og sikkerhetsmiljø kan påvirke beredskap, varsling og operativ tillit, men kan ikke gi employer_appointment eller styremyndighet og kan ikke gjøre direktøren til konservator eller sikkerhetsspesialist; samtidig kan direktørstatus ikke oppheve deres dokumenterte faglige sikkerhetsgrenser uten grunnlag.'
  },
  {
    id:'finance_hr_and_legal_stewards', standing_axis:'budget_employer_and_compliance_discipline',
    cares_about:['at prognose, budsjett, kontrakt, anskaffelse, HR, arbeidsmiljø og juridisk risiko blir egne beslutningsspor fremfor sidebemerkninger til et ønsket prosjekt','at nytt økonomisk eller personalmessig faktum gjenåpner berørte deler av institusjonsloggen i stedet for å bli presset inn i en allerede besluttet fortelling'],
    cannot_grant:'Standing hos økonomi-, HR- og juridiske funksjoner kan påvirke hvor robust beslutningsgrunnlaget er og hvilke prosesser som kan gå videre, men kan ikke gi Museumsdirektørens employer_appointment, overta styrets myndighet eller opprette budsjettfullmakt uten vedtak og kan ikke gjøre etterlevelse til en snarvei rundt faglig sikkerhet eller kunstnerisk ansvar.'
  },
  {
    id:'funders_sponsors_and_public_authorities', standing_axis:'resource_boundary_and_noninterference',
    cares_about:['at finansiering, tilskudd, sponsorvilkår og offentlige forventninger er lesbare som rammer uten å bli skjult innholds-, personal- eller samlingsstyring','at direktøren skiller legitim rapportering og ressursavhengighet fra uformelle løfter om program, innkjøp, synlighet eller særbehandling'],
    cannot_grant:'Standing hos finansieringskilder, sponsorer og offentlige myndigheter kan påvirke ressurser, dialog og rapporteringskrav, men kan ikke gi employer_appointment, privat råderett over samling eller ansatte, skjult programmyndighet eller ubegrenset budsjett/delegasjon, og kan ikke oppheve styrevedtak eller dokumenterte faglige sikkerhetsgrenser.'
  },
  {
    id:'public_media_and_communities', standing_axis:'transparency_public_mission_and_correction',
    cares_about:['at institusjonen forklarer prioriteringer, avvik og usikkerhet i lys av samfunnsoppdraget uten å bruke omdømme som målestokk for sannhet','at feil, skjult risiko eller uheldige konsekvenser kan korrigeres offentlig uten at tidligere beslutningsgrunnlag omskrives til å se sikrere ut enn det var'],
    cannot_grant:'Offentlig standing, medieoppmerksomhet, kritikerros eller protest kan påvirke hvilke spørsmål ledelsen må besvare og hva institusjonen lærer, men kan ikke ansette eller utnevne Museumsdirektøren, gi styremyndighet, budsjett eller delegasjon og kan ikke gjøre publikumsrespons til faglig sikkerhetsbevis, juridisk beslutning eller arbeidsgiverprosess.'
  },
  {
    id:'private_relations', standing_axis:'presence_confidentiality_and_identity_beyond_director_status',
    cares_about:['at kriser, personalsaker, styrekonflikt og offentlig press kan bearbeides uten at hjemmet blir et uformelt styrings- eller konfidensielt saksrom','at spilleren kan være nærværende som privatperson uten å kreve at en relasjon bekrefter direktørstatus, rettferdiggjør en beslutning eller bærer institusjonens risiko'],
    cannot_grant:'En privat relasjon kan gi støtte, motstand og perspektiv på belastning, men kan ikke gi employer_appointment, styremyndighet, delegasjon, budsjett, arbeidsgiverfullmakt eller faglig sikkerhetskompetanse og kan ikke gjøre privat bekreftelse til evidens for at en institusjonell beslutning var korrekt.'
  }
];

const recurringPeople = [
  {id:'anne_styreleder_world',social_function:'Anne gjør forskjellen mellom tillit, delegasjon og styrevedtak sosialt synlig når direktøren møter press for å handle før et spørsmål faktisk er behandlet på riktig nivå.',class_position:'Styreleder med formell styringsmakt over direktørens mandat og oppfølging, men uten rett til å gjøre styret til operativ fagledelse eller uformell personalsaksbehandler.',status:'Hennes tillit bygges når vesentlig risiko, mindretall, usikkerhet og konsekvens kommer fram tidlig nok til at styret kan ta den beslutningen det faktisk eier.',power_over_player:'Kan kreve styrebehandling, endre delegasjon gjennom formelle beslutninger og holde direktøren ansvarlig, men kan ikke gi skjult fullmakt gjennom personlig støtte eller oppheve profesjonelle sikkerhetsgrenser.',wants:'At styret får et beslutningsgrunnlag som skiller strategi, økonomi, faglige premisser, arbeidsgiveransvar og vesentlig risiko uten pynt.',conceals:'Et styre kan selv bli status- og omdømmesensitivt og fristes til å be om tryggere språk i stedet for mer presis risiko.',speech_style:'Kort, styringsorientert og konsekvensbevisst; spør hvem som eier beslutningen, hva styret faktisk har vedtatt og hva som må rapporteres.',teaches_player:'At god museumsledelse ikke er å maksimere direktørens makt, men å gjøre riktig beslutningsnivå og ansvar synlig.'},
  {id:'omar_okonomi_hr_world',social_function:'Omar gjør prognose, bemanning, arbeidsmiljø, kontrakt og arbeidsgiveransvar til konkrete data som må inn i samme institusjonslogg som program og strategi.',class_position:'Økonomi- og HR-leder med prosess- og informasjonsmakt, men uten styremyndighet eller rett til å redusere alle faglige spørsmål til økonomi.',status:'Hans standing følger om ledelsen bruker tall og HR-prosess til å vise konsekvens og ansvar, ikke til å skjule et politisk eller faglig valg bak teknisk språk.',power_over_player:'Kan stoppe uavklarte økonomiske eller HR-prosesser, varsle avvik og kreve korrekt saksbehandling, men kan ikke utnevne direktøren eller alene beslutte institusjonens strategiske prioritering.',wants:'At budsjett, prognose og arbeidsgiveransvar er tidlige premisser, slik at ansatte ikke arver kostnaden av uformelle løfter og sent oppdaget risiko.',conceals:'Teknisk korrekt prosess kan også bli et skjold mot tydelig ledelsesansvar dersom ingen vil si hvilket verdimessig prioriteringsvalg tallene faktisk tvinger fram.',speech_style:'Konkret og sporbar; spør hva beslutningen koster, hvem som bærer arbeidsbelastningen, hvilken fullmakt som brukes og hva som må gjenåpnes.',teaches_player:'At økonomi og arbeidsgiveransvar er styringens substans, ikke et administrativt vedlegg til kunstnerisk eller offentlig prestisje.'},
  {id:'ida_samlings_beredskap_world',social_function:'Ida gjør faglige sikkerhetsgrenser og verifiserte hendelsesfakta synlige når direktøren står mellom beredskap, åpningstid, publikum, økonomi og omdømme.',class_position:'Samlings- og beredskapsleder med operativ fagmyndighet i avtalte hendelser, men uten styremandat eller total institusjonsmyndighet.',status:'Hennes tillit avhenger av at ledelsen lar dokumenterte funn stå selv når de gjør kommunikasjon og gjenåpning vanskeligere.',power_over_player:'Kan aktivere beredskap, kreve sikring og løfte dokumenterte sikkerhetsgrenser; direktøren kan prioritere institusjonelle tiltak, men ikke gjøre tittel til erstatning for hennes fagkompetanse.',wants:'At mennesker og samling sikres først, og at etterkontrollen senere kan rekonstruere hvilke fakta, grenser og beslutninger som faktisk styrte hendelsen.',conceals:'Et beredskapsmiljø kan etter en krise bli så risikoavers at midlertidige tiltak behandles som permanente uten ny vurdering.',speech_style:'Faktabasert, operativ og tydelig på usikkerhet; skiller funn, anbefaling, beslutning og kontrollpunkt.',teaches_player:'At kriseledelse betyr å plassere myndighet hos riktig fag og samtidig holde institusjonelt ansvar samlet.'},
  {id:'marius_kunstnerisk_ledelse_world',social_function:'Marius gjør kunstnerisk autonomi og faglig motstemme levende når budsjett, sponsor, styresignal eller offentlig press påvirker programmet.',class_position:'Kunstnerisk leder med delegert programmyndighet og høy kulturell kapital, men uten rett til å sette arbeidsgiveransvar, budsjett eller styrets mandat til side.',status:'Hans standing følger om direktøren skiller legitim styring fra skjult innholdsinnblanding og lar reell faglig uenighet bli stående i beslutningssporet.',power_over_player:'Kan anbefale kunstnerisk retning, dokumentere konsekvens og nekte å late som et styringssignal er faglig konsensus, men kan ikke overta direktørens arbeidsgiver- eller totalansvar.',wants:'At institusjonen kan prioritere hardt uten å omskrive økonomisk eller politisk press til kunstneriske kriterier i ettertid.',conceals:'Profesjonell autonomi kan selv bli en statusmarkør som gjør legitime ressurs- og arbeidsgivergrenser vanskeligere å diskutere åpent.',speech_style:'Faglig, argumenterende og sensitiv for skjult premiss; spør hva som er kunstnerisk vurdering, hva som er styring og hvor beslutningen faktisk ligger.',teaches_player:'At direktøren beskytter faglig integritet ved å gjøre styringsmakt synlig, ikke ved å late som den ikke finnes.'},
  {id:'elin_verneombud_world',social_function:'Elin gjør arbeidsmiljø, varslingsvilje og asymmetrisk belastning sosialt synlig når et profilert prosjekt eller en krise belønner dem som holder ut i stillhet.',class_position:'Verneombud og ansattrepresentant med lov- og prosessforankret stemme, men uten ansvar for å overta ledelsens beslutning eller bli kanal for konfidensiell sladder.',status:'Hennes tillit bygges når bekymring behandles som arbeidsgiverinformasjon som krever handling og spor, ikke som illojalitet eller omdømmerisiko.',power_over_player:'Kan løfte arbeidsmiljøfare, kreve oppfølging og utfordre normalisering av belastning, men kan ikke gi direktørutnevnelse eller styremandat.',wants:'At ansatte kan melde reell risiko tidlig og se hva ledelsen gjør med informasjonen uten å måtte betale sosialt for å ha sagt fra.',conceals:'Representasjonsrollen kan bli fanget mellom kollegial lojalitet og behovet for å gjøre ubehagelige mønstre formelle.',speech_style:'Presis på belastning og prosess; spør hvem som rammes, hva som er dokumentert, hva arbeidsgiver har gjort og når oppfølgingen kommer.',teaches_player:'At arbeidsgiveransvar må tåle motstand fra dem som har mindre hierarkisk makt.'},
  {id:'nora_offentlig_finansiering_world',social_function:'Nora gjør offentlig finansiering, tilskuddskrav og politisk forventning synlig uten å la ressursavhengighet gli over i uformell program- eller personalstyring.',class_position:'Representant for offentlig finansierings- og eierdialog med betydelig ressursmakt, men uten automatisk intern instruksjonsrett i museet.',status:'Hennes tillit følger om direktøren rapporterer samfunnsoppdrag, risiko og ressursbruk presist uten å gi løfter utenfor mandatet.',power_over_player:'Kan stille vilkår innen lovlige tilskudds- og eierprosesser og kreve rapportering, men kan ikke privat utnevne direktøren eller styre enkeltverk, ansatte eller samlingsinngrep uten korrekt myndighetsgrunnlag.',wants:'At institusjonen kan forklare hvordan offentlige ressurser brukes, hvilke mål som nås og hvilke begrensninger som er reelle.',conceals:'Også legitim rapporteringsmakt kan skape indirekte press mot synlighet, trygghet eller målbarhet som konkurrerer med faglig og langsiktig ansvar.',speech_style:'Formell og målbevisst; spør hva mandatet sier, hvordan midlene er brukt, hva avviket betyr og hvilket organ som skal håndtere det.',teaches_player:'At ekstern ressursmakt må oversettes til transparente rammer, ikke skjult intern styring.'},
  {id:'private_relation_world',social_function:'Den private relasjonen viser hva som skjer når direktørspråk, beredskap, konfidensialitet og ansvar lekker inn i et liv der ingen skal være styre, HR eller kriseteam.',class_position:'Privat nærhet uten institusjonell myndighet, men med reell makt til å sette grenser for fravær, hemmelighold og kontinuerlig tilgjengelighet.',status:'Relasjonen tåler ansvar bedre når spilleren kan være usikker og til stede uten å gjøre hjemmet til bevisrom for egen moralsk eller profesjonell verdi.',power_over_player:'Kan kreve privat nærvær og utfordre identitetsfusjon, men kan ikke løse styresaker, personalsaker, sikkerhetsfunn eller gi employer_appointment.',wants:'At spilleren har et liv der institusjonens kriser ikke alltid eier tid, språk og oppmerksomhet.',conceals:'Omsorg kan også gli over i ønsket om en enkel moralsk fortelling om saker som faktisk krever taushet og institusjonell prosess.',speech_style:'Personlig og konkret; spør når du faktisk er hjemme, hva du kan dele og hva du trenger å legge fra deg uten å gjøre det til en beslutning.',teaches_player:'At bærekraftig ledelse krever privat grense, ikke bare bedre kapasitet.'}
];

const slowAxes = [
  ['mandate_discipline','Hvor presist spilleren skiller employer_appointment, styrevedtak, delegasjon og eget handlingsrom.'],
  ['board_reporting','Hvor tidlig vesentlig risiko, usikkerhet og konsekvens blir gjort lesbar for riktig styringsorgan.'],
  ['budget_traceability','Hvor godt budsjett, prognose, prioritering og senere rework kan rekonstrueres.'],
  ['employer_responsibility','Hvor konsekvent arbeidsmiljø, bemanning og asymmetrisk belastning behandles som egen lederplikt.'],
  ['professional_boundary_respect','Hvor stabilt direktøren respekterer dokumenterte konserverings-, samlings- og sikkerhetsgrenser.'],
  ['crisis_transparency','Hvor godt hendelsesfakta, beslutninger, kommunikasjon og etterkontroll holdes adskilt og korrigerbare.'],
  ['public_mission','Hvor tydelig samfunnsoppdrag brukes som begrunnet prioriteringsramme fremfor omdømme eller kortsiktig synlighet.'],
  ['correction_openness','Hvor villig institusjonen er til å gjenåpne berørte beslutningsspor når ny informasjon kommer.'],
  ['private_sustainability','Hvor godt spilleren bevarer konfidensialitet, privat nærvær og identitet utenfor direktørrollen.']
].map(([id,meaning]) => ({id,meaning,runtime_binding:'editorial_only_until_governed'}));

const dayCases = [
  'Styrevedtaket må oversettes til faktisk delegasjon',
  'Budsjettkuttet treffer bemanning, samling og program samtidig',
  'Arbeidsmiljøvarsel i et profilert prosjekt',
  'Sponsor vil ha faglig innflytelse som motytelse',
  'Klimahendelse setter deler av samlingen i fare',
  'Gjenåpning etter hendelse møter sikkerhetsfaglig ventepunkt',
  'Styret ønsker et enklere risikobilde enn fakta tillater',
  'Kunstnerisk ledelse utfordrer et styringssignal',
  'Juridisk og anskaffelsesmessig premiss stanser hastevalget',
  'Mediene spør om risiko ledelsen tidligere omtalte for svakt',
  'Ansatte har mottatt motstridende prioriteringer fra ledergruppen',
  'Krisevedtaket må kunne rekonstrueres etter at tempoet har falt',
  'Offentlig kritikk av prioritering og samfunnsoppdrag krever korrigering',
  'Sesongen avsluttes med styre-/eierrapport og lesbart institusjonsminne'
];
const phases = ['morning','lunch','afternoon','evening'];
const audienceIds = audiences.map((a) => a.id);
const threadIds = ['anne_mandat_og_styringsansvar','omar_budsjett_arbeidsmiljo_og_rework','ida_sikkerhetsgrense_og_beredskap','marius_fagautonomi_under_styring','elin_varslingsvilje_og_arbeidsgiveransvar','nora_ressursmakt_og_samfunnsoppdrag','privat_grense_og_direktoridentitet'];

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let p = 0; p < phases.length; p += 1) {
    const phase = phases[p];
    const audience = audienceIds[(day * 4 + p - 4) % audienceIds.length];
    const ref = canonicalRefs[((day - 1) * 4 + p) % canonicalRefs.length];
    const actorThread = threadIds[(day + p - 1) % threadIds.length];
    const phaseText = phase === 'morning'
      ? `Morgenen åpner ${PERSISTENT} på siste versjon. Spilleren må skille styre/eier-mandat, delegasjon, budsjett/prognose, arbeidsgiver- og arbeidsmiljøstatus, samlings-/sikkerhetsfakta, beredskap, offentlig kommunikasjon, ventepunkt og neste eier før en oppgave får status som beslutningsklar.`
      : phase === 'lunch'
        ? 'Lunsjen flytter saken fra skjema til relasjon: en annen aktør viser hva den samme beslutningen betyr fra en posisjon med annen makt, risiko og kunnskap. Dialogen kan endre sosial tillit og informasjonsflyt, men kan ikke skape formell myndighet eller gjøre relasjonell enighet til evidens.'
        : phase === 'afternoon'
          ? `Ettermiddagen krever et avgrenset valg innen eksakt authority boundary: direktøren kan lede institusjonen innen mandat, fordele ressurser innen fullmakt og utøve arbeidsgiveransvar, men kan ikke sette styrets myndighet til side, bruke samling eller midler privat, overstyre dokumenterte faglige sikkerhetsgrenser uten grunnlag eller skjule vesentlig risiko.`
          : 'Kvelden viser privat og institusjonelt etterspill. Spilleren må tåle at ansvar, kritikk eller usikkerhet ikke løses av status, og må bevare konfidensialitet samtidig som neste arbeidsdag fortsatt har et lesbart beslutningsspor med venting, handoff og mulig rework.';
    const summary = `Dag ${day}, ${phase}: ${dayCases[day - 1]}. ${phaseText} Saken følger de to låste arbeidsløkkene — «${EXPECTED_LOOPS[0]}» og «${EXPECTED_LOOPS[1]}» — uten å blande dem sammen: strategi- og budsjettarbeid kan møte en hendelse, men hendelsesfakta og faglig sikring må fortsatt være eksplisitte før ledelsen bestemmer institusjonell respons. Arbeidsobjektet beholder mandat, versjon, verifiserte fakta, økonomisk status, faglige grenser, arbeidsmiljøinformasjon, styre/eierstatus, beslutning, kommunikasjon, kontrollpunkt og hvem som eier neste steg. Museumsdirektør er fortsatt appointment_required med employer_appointment; History Go, Kunst-Badge, standing, publikumstall, sponsorstøtte, styreleders tillit eller vellykket krisehåndtering kan aldri utnevne spilleren, utvide delegasjon eller budsjett, gjøre direktøren til konservator/sikkerhetsspesialist eller oppheve riktig styre-, HR-, juridisk eller faglig prosess. Hvis et nytt faktum endrer prognose, sikkerhet, arbeidsmiljø eller styrepremiss, gjenåpnes bare berørte deler med ny versjon fremfor at gammel beslutningshistorie omskrives.`;
    const standing = `Standing hos ${audience} er situert og påvirker bare relasjonell tillit, tilgang til informasjon, hvor tidlig motstand eller varsler kommer og hvor lett en senere handoff kan gjennomføres. Det finnes ingen global reputation score, og denne ståingen er ikke evidens for at en påstand, prognose, sikkerhetsvurdering eller institusjonell beslutning er sann. Den kan ikke gi employer_appointment, styremyndighet, delegasjon, budsjett, arbeidsgiverfullmakt, juridisk godkjenning eller profesjonell sikkerhetskompetanse. Et godt sosialt resultat kan derfor sameksistere med at saken må vente, eskaleres, reworkes eller stoppes. Autoritet og korrekthet følger fortsatt det versjonerte arbeidsobjektet, dokumenterte kilder/funn og eksakt beslutningsnivå, mens standing bare bestemmer hva relasjonen husker om måten spilleren brukte eller avgrenset makt på.`;
    coverage.push({day,phase,beat_type:{morning:'task',lunch:'relationship',afternoon:'decision',evening:'private_consequence'}[phase],summary,standing_audience:audience,standing_consequence:standing,thread_ids:[actorThread],materialization_refs:[ref]});
  }
}

const primaryThreads = [
  {id:'anne_mandat_og_styringsansvar',relationship:'Anne og spilleren bygger et langsomt forhold rundt styremandat, vesentlig risiko og hva som faktisk er delegert. Tråden tester om direktøren kan være handlekraftig uten å gjøre personlig styretillit til en skjult fullmakt, og om ubehagelige premisser blir stående når saken senere rapporteres.',beat_refs:['1/lunch','2/afternoon','4/morning','6/lunch','9/afternoon','12/morning','14/afternoon']},
  {id:'omar_budsjett_arbeidsmiljo_og_rework',relationship:'Omar gjør sammenhengen mellom budsjett, prognose, bemanning og arbeidsgiveransvar vanskelig å skyve til administrasjonen. Forholdet utvikles gjennom uenighet om tempo, hva som er et teknisk avvik og når ny økonomisk eller arbeidsmiljømessig informasjon faktisk må gjenåpne en prioritering.',beat_refs:['2/morning','3/afternoon','5/lunch','7/morning','9/lunch','11/afternoon','13/morning']},
  {id:'ida_sikkerhetsgrense_og_beredskap',relationship:'Ida og spilleren møtes der direktørens totalansvar må gi reell plass til en annens fagmyndighet. Tråden lar en hendelse, gjenåpning, medietrykk og etterkontroll vise om ledelsen beskytter dokumenterte sikkerhetsgrenser også når de er dyre eller omdømmemessig vanskelige.',beat_refs:['4/afternoon','5/morning','6/afternoon','8/lunch','10/morning','12/afternoon','14/morning']},
  {id:'marius_fagautonomi_under_styring',relationship:'Marius holder den kunstneriske motstemmen levende når budsjett, sponsor, styre og offentlig kritikk legger press på programmet. Relasjonen prøver om direktøren kan skille legitim styring fra skjult innholdsinnblanding og bevare uenigheten uten å frasi seg eget institusjonsansvar.',beat_refs:['1/afternoon','3/lunch','4/lunch','7/afternoon','8/afternoon','11/lunch','13/afternoon']},
  {id:'elin_varslingsvilje_og_arbeidsgiveransvar',relationship:'Elin gjør hierarkisk asymmetri synlig gjennom arbeidsmiljøvarsel, belastning og behovet for oppfølging etter at medie- eller prosjektpress har falt. Tråden måler ikke popularitet, men om ansatte lærer at det er trygt å bringe ubehagelig informasjon inn i et spor som faktisk får eier, tiltak og senere kontroll.',beat_refs:['2/lunch','3/morning','5/afternoon','8/morning','10/lunch','11/morning','13/lunch']},
  {id:'nora_ressursmakt_og_samfunnsoppdrag',relationship:'Nora representerer ekstern ressursmakt som både er legitim og potensielt styrende. Forholdet utvikles når tilskudd, sponsorliknende forventninger, rapportering og offentlig samfunnsoppdrag må holdes transparente slik at finansiering ikke blir uformell program-, personal- eller samlingsmyndighet.',beat_refs:['1/morning','4/morning','6/morning','7/lunch','9/morning','10/afternoon','14/lunch']},
  {id:'privat_grense_og_direktoridentitet',relationship:'Den private tråden undersøker hva som skjer når direktørrollen blir en identitet som aldri slår seg av. Hjemmet kan gi støtte og motstand, men skal verken bli styre, HR, beredskapsrom eller arena for konfidensielle detaljer; bærekraft må bygges uten at privat bekreftelse blir moralsk frikjennelse.',beat_refs:['2/evening','4/evening','6/evening','8/evening','10/evening','12/evening','14/evening']}
];

const privateAftermath = [
  {id:'arbeidsmiljovarselet_folger_hjem',description:'Etter arbeidsmiljøvarselet er den profesjonelle oppgaven ikke over bare fordi neste formelle steg er delegert. Spilleren må holde taushet om detaljer, tåle at en privat relasjon merker fraværet og samtidig møte neste dag uten å kreve hjemlig støtte til egen vurdering. Etterspillet gjør arbeidsgiveransvar og privat bærekraft til to forskjellige forpliktelser.',materialization_refs:[canonicalRefs[4]]},
  {id:'samlingshendelsen_uten_heltedirektor',description:'Etter samlingshendelsen er fristelsen stor til å fortelle en historie om handlekraftig ledelse. Det private etterspillet holder fast ved at riktig fagmyndighet, venting og kontroll var viktigere enn heltestatus, og at spilleren må kunne leve med en avslutning der usikkerhet fortsatt finnes uten å gjøre den til personlig nederlag.',materialization_refs:[canonicalRefs[8]]},
  {id:'styrekritikken_etter_risikorapporten',description:'Når styret reagerer på at en risiko ble løftet sent eller uklart, følger skammen og statuspresset med hjem. Etterspillet undersøker om spilleren kan skille behovet for korrigering fra ønsket om å bli bekreftet som en god leder, og om institusjonell feil kan eies uten å lekke konfidensiell styredialog inn i privatlivet.',materialization_refs:[canonicalRefs[10]]},
  {id:'offentlig_kritikk_uten_omdommesnarvei',description:'Offentlig kritikk av prioriteringer frister til rask kommunikasjon som gjenoppretter kontroll. Privat må spilleren tåle at en presis korrigering kan gjøre situasjonen mer komplisert før den blir bedre, og at publikumstall eller mediedekning ikke kan brukes som bevis på at den opprinnelige beslutningen var riktig.',materialization_refs:[canonicalRefs[12]]},
  {id:'sesongslutt_med_ansvar_som_fortsetter',description:'Sesongen slutter ikke med at direktøren blir frikjent eller kronet. Styre-/eierrapporten, åpne oppfølgingspunkter og privat tretthet blir stående samtidig. Etterspillet viser at institusjonsminne, relasjoner og arbeidsgiveransvar fortsetter etter den dramaturgiske slutten, mens tittel og standing fortsatt ikke gir ekstra myndighet.',materialization_refs:[canonicalRefs[14]]}
];

const delayedConsequences = [
  {id:'uklar_delegasjon_blir_styreoppfolging',setup_ref:'1/morning',return_ref:'7/afternoon',domains:['job','reputation','narrative']},
  {id:'budsjettpremiss_blir_bemanningsrework',setup_ref:'2/morning',return_ref:'11/afternoon',domains:['job','economy','relationship']},
  {id:'arbeidsmiljovarsel_blir_varslingsvilje',setup_ref:'3/morning',return_ref:'11/morning',domains:['relationship','psyche','reputation']},
  {id:'sponsorgrense_blir_ressurstillit',setup_ref:'4/morning',return_ref:'13/afternoon',domains:['economy','reputation','narrative']},
  {id:'samlingsfunn_blir_gjenapningsgrense',setup_ref:'5/morning',return_ref:'10/morning',domains:['job','reputation']},
  {id:'beredskapsvalg_blir_etterkontroll',setup_ref:'6/afternoon',return_ref:'12/afternoon',domains:['job','narrative']},
  {id:'kunstnerisk_motstemme_blir_styringshukommelse',setup_ref:'8/lunch',return_ref:'13/morning',domains:['relationship','reputation','narrative']},
  {id:'privat_grense_blir_baerekraft',setup_ref:'4/evening',return_ref:'14/evening',domains:['psyche','relationship','livelihood']}
];

const authoritySeparation = 'Ingen global reputation score kan bli evidens, sannhet eller formell myndighet. Museumsdirektør forblir appointment_required og krever employer_appointment; standing, History Go eller Kunst-Badge kan ikke ansette eller utnevne spilleren. Styrevedtak, delegasjon og budsjett må ha korrekt eier; standing kan ikke opprette eller utvide dem. Direktøren kan lede institusjonen innen mandat, fordele ressurser innen fullmakt og utøve arbeidsgiveransvar, men kan ikke sette styrets myndighet til side, bruke samling eller midler privat, overstyre dokumenterte faglige sikkerhetsgrenser uten grunnlag eller skjule vesentlig risiko. History Go kan gi kunsthistorisk og institusjonshistorisk kontekst, men ikke juridisk, HR-, sikkerhets-, samlings- eller konservatorfaglig fasit.';

const world = {
  schema:'civication_role_world_v1',version:1,category:CATEGORY,role_scope:ROLE,
  title:'Kunst / Museumsledelse — styringsansvar, faglige grenser og institusjonell tillit',status:'role_world_complete',
  sociological_core:{main_problem:'Hvordan kan en museumsdirektør bære institusjonelt totalansvar uten å forveksle tittel, omdømme eller ressursmakt med grenseløs myndighet?',description:'Museumsledelse er et asymmetrisk arbeid der styre/eier, ansatte, kunstfag, samling, sikkerhet, økonomi, finansiering, publikum og privatliv møter den samme direktørrollen fra ulike maktposisjoner. Verdenen gjør synlig at god ledelse består i å holde mandat, beslutningsnivå, faggrenser, arbeidsgiveransvar, vesentlig risiko og korrigering lesbare over tid, også når handling må skje raskt.'},
  theme_ids:themeIds,
  social_environments:['direktor_og_ledergruppebord','styre_eier_og_mandatspunkt','budsjett_arbeidsgiver_og_prioriteringsrom','samlingsrisiko_beredskap_og_offentlighetsrom','kunstnerisk_fagdialog','ansatt_og_verneombudsdialog','finansiering_og_offentlig_eierdialog','privatliv'],
  recurring_people_archetypes:recurringPeople,
  slow_axes:slowAxes,
  situated_reputation_model:{global_score_allowed:false,authority_separation,audiences,divergence_examples:[
    'Styret kan stole mer på direktørens rapportering samtidig som ansatte mister tillit dersom budsjettpress skyves nedover uten tydelig arbeidsgiveransvar.',
    'Kunstnerisk ledelse kan oppleve sterkere faglig integritet når direktøren nekter sponsorinnblanding, selv om finansieringspartneren blir mer krevende i dialogen.',
    'Samlings- og sikkerhetsmiljø kan få høyere tillit etter at en åpning utsettes, mens publikum og presse i samme øyeblikk opplever beslutningen som svak eller uforståelig.',
    'En presis offentlig korrigering kan svekke kortsiktig omdømme, men styrke framtidig institusjonsminne og tillit hos styre, ansatte og fagmiljø.',
    'Et budsjettmessig ansvarlig kutt kan være legitimt overfor styret, men samtidig skade arbeidsmiljøstanding dersom belastning og prosess ikke håndteres som arbeidsgiveransvar.',
    'Privat bærekraft kan forbedres når spilleren setter grense for tilgjengelighet selv om enkelte profesjonelle relasjoner opplever mindre umiddelbar respons.'
  ]},
  history_go_affordance:{badge_id:'kunst',source_ref:knowledgeRef,better_question:'History Go kan gjøre museumsledelse bedre ved å åpne kunsthistoriske og institusjonshistoriske spørsmål før direktøren velger: Hvordan har samlings- og utstillingspraksis blitt legitimert tidligere? Hvilke institusjonelle konflikter følger av kanon, representasjon, offentlig finansiering og endrede samfunnsoppdrag? Hvilke kilder kan skille historisk påstand fra dagens strategiske begrunnelse? Denne kunnskapen gjør alternativer og offentlig begrunnelse skarpere, men den leverer ikke dagens budsjett, arbeidsmiljøfakta, juridiske vurdering, sikkerhetsstatus eller styrevedtak.',authority_boundary:'History Go kan ikke gi employer_appointment eller appointment_required Museumsdirektør-status, kan ikke ansette eller utnevne, kan ikke opprette styremyndighet, delegasjon eller budsjett, kan ikke avgjøre HR/juridisk prosess, arbeidsgiveransvar, samlings- eller sikkerhetsfakta, konservatorfaglige inngrep eller eierskap, og et Kunst-Badge kan aldri overstyre dokumenterte faglige sikkerhetsgrenser eller skjule vesentlig risiko.'},
  cross_role_proof:{status:'not_materialized_no_shared_work_object',shared_work_object_found:false,required_for_rollout:false,new_runtime:false,candidate_when_shared_work_is_real:false,rule:'Canonical readiness sier not_required_for_rollout. Ingen cross-role-link materialiseres uten et senere, konkret og genuint delt arbeidsobjekt med identisk ID, versjon, eier og handoff. Ledelse over flere fag er ikke i seg selv bevis på ett delt runtime-objekt.'},
  existing_work_continuity:{work_loops:EXPECTED_LOOPS,persistent_work_object:PERSISTENT,waiting_states:grammar.rhythm_contract.waiting_states,handoff_rule:grammar.persistent_work_object_contract.handoff_rule,rework_rule:grammar.rhythm_contract.rework_rule,new_runtime_state:false},
  editorial_uniqueness:{not_copy_of:['kunst/kunst_kunstnerisk_ledelse','kunst/kunst_kuratering_og_program','historie/historie_museum_og_samling'],rule:'Denne verdenen er institusjonsdirektør- og styringsansvarsentrert: styre/eier-mandat, budsjett/prognose, arbeidsgiveransvar, samlings-/sikkerhetsgrenser, beredskap, ekstern ressursmakt, offentlig ansvar og korrigerbart institusjonsminne. Den er ikke en programportefølje, kuratorisk researchverden eller samlingsfaglig museumpraksis.'},
  season:{days:14,day_phases:phases,coverage},
  primary_threads:primaryThreads,
  private_aftermath:privateAftermath,
  delayed_consequences:delayedConsequences,
  materialization:{no_new_runtime:true,source_refs:canonicalRefs,authored_dimensions:['situated_reputation'],existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,career_title_gates_preserved:true,cross_role_link_materialized:false}
};

write(WORLD, world);
index.roles.push({category:CATEGORY,role_scope:ROLE,status:'role_world_complete',path:WORLD});
write(INDEX,index);
checklist.reference_worlds.push(WORLD);
write(CHECKLIST,checklist);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = themeIds;
write(THEMEBANK,themeBank);

writeText(SOURCE, `# Kunst / Museumsledelse — Role World rollout source-first\n\n## Scope lock\n\n- Canonical role: \`${KEY}\`.\n- Dedicated Role World authors exactly \`situated_reputation\`; prerequisite Career/work foundation remains authoritative.\n- Museumsdirektør remains \`appointment_required\` with \`employer_appointment\`.\n- No new runtime or parallel scene format.\n\n## Preserved work foundation\n\n- Persistent editorial object: \`${PERSISTENT}\`.\n- Work loops preserved exactly: \`${EXPECTED_LOOPS[0]}\` and \`${EXPECTED_LOOPS[1]}\`.\n- Authority boundary preserved exactly; standing cannot create styremyndighet, delegasjon, budsjett, arbeidsgiverfullmakt or professional safety competence.\n- All 15 canonical prerequisite mails remain source refs and each is reused at least three times in the 56-beat season.\n\n## Situated standing\n\n- 8 bounded audiences, 9 slow editorial-only axes and **no global reputation score**.\n- Standing affects relationships and information flow only; it is not evidens and cannot grant employer_appointment.\n- Audiences cover board/owners, leadership/employees, artistic leadership, collection/safety, finance/HR/legal, funders/public authorities, public/media/communities and private relations.\n\n## Season and continuity\n\n- 14 days × 4 phases = 56 beats.\n- 7 primary threads, 5 private aftermaths and 8 delayed consequences.\n- Waiting, handoff and rework remain bound to the existing persistent work contract.\n\n## Cross-role\n\n- \`not_materialized_no_shared_work_object\`.\n- Canonical cross-role need remains \`not_required_for_rollout\`; no shared object is invented merely because the director leads across functions.\n\n## History Go boundary\n\nHistory Go can improve art-/institution-history questions and source criticism, but cannot appoint the director, create board authority, delegation or budget, decide HR/legal/safety/collection facts, authorize conservation work or override documented professional safety boundaries.\n\n## Editorial uniqueness\n\nMuseumsledelse is institution-governance and total-responsibility centered rather than a copy of Kunstnerisk ledelse, Kuratering og program or Historie/Museum og samling.\n\n## Quality gate\n\n30/30: role identity; title gate; work loops; authority; persistent work; rhythm; 15 source mails; bounded audiences; no global score; 9 axes; 56 beats; four phases; source reuse; seven threads; private aftermath; delayed consequences; board/eier governance; employer duty; collection/safety boundary; crisis transparency; public mission; correction; private boundary; History Go separation; no new runtime; no cross-role invention; index registration; authoring checklist registration; theme profile; source-first report.\n`);

console.log(JSON.stringify({materialized:WORLD,coverage:coverage.length,audiences:audiences.length,axes:slowAxes.length,threads:primaryThreads.length,aftermath:privateAftermath.length,delayed:delayedConsequences.length,source_refs:canonicalRefs.length},null,2));
