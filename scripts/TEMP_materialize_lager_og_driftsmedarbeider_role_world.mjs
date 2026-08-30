#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const KEY = 'naeringsliv/lager_og_driftsmedarbeider';
const ROLE = 'lager_og_driftsmedarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/lager_og_driftsmedarbeider.json';
const INDEX_PATH = 'data/Civication/roleWorlds/index.json';
const CHECKLIST_PATH = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEME_BANK_PATH = 'data/Civication/roleWorldThemeBank.json';
const READINESS_PATH = 'data/Civication/roleWorldRolloutReadiness.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_logistikk_og_drift.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json';

const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const read = (rel) => JSON.parse(readText(rel));
const write = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sha = (rel) => crypto.createHash('sha256').update(readText(rel)).digest('hex');

const protectedPaths = [PLAN_PATH, MODEL_PATH, GRAMMAR_PATH, JOB_PATH, PEOPLE_PATH];
const protectedHashes = Object.fromEntries(protectedPaths.map((rel) => [rel, sha(rel)]));
assert(!fs.existsSync(path.join(ROOT, WORLD_PATH)), 'Lager Role World already exists; refuse overwrite');

const readinessBefore = read(READINESS_PATH);
const queueRow = (readinessBefore.rollout_queue || []).find((row) => row.key === KEY);
assert(queueRow, 'Lager must still be in rollout queue before Role World materialization');
assert(queueRow.classification === 'rollout_ready', `Lager must be rollout_ready, got ${queueRow.classification}`);
assert(JSON.stringify(queueRow.authored_work_required) === JSON.stringify(['situated_reputation']), `unexpected authored debt: ${JSON.stringify(queueRow.authored_work_required)}`);
assert(queueRow.cross_role_need === 'not_required_for_rollout', `unexpected cross-role need: ${queueRow.cross_role_need}`);

const plan = read(PLAN_PATH);
assert(plan.id === 'naeringsliv_lager_og_driftsmedarbeider_plan' && plan.role_scope === ROLE, 'Lager plan identity drift');
assert(Array.isArray(plan.sequence) && plan.sequence.length === 20, 'Lager plan must remain exactly 20 steps');
for (let i = 0; i < 20; i += 1) {
  assert(plan.sequence[i].step === i + 1, `plan numbering drift at ${i + 1}`);
  assert(plan.sequence[i].type === (i % 2 === 0 ? 'job' : 'people'), `plan type drift at ${i + 1}`);
  assert(JSON.stringify(plan.sequence[i].fallback_types) === '[]', `plan fallback drift at ${i + 1}`);
}

const workLoops = [
  'mottak -> kontroll -> registrering -> lokasjon -> plukk -> utlevering',
  'avvik -> isolering -> telling/fakta -> korrigering -> godkjenning -> læring'
];
const grammar = read(GRAMMAR_PATH);
assert(JSON.stringify(grammar.work_loops) === JSON.stringify(workLoops), 'Lager work loops drifted');
assert(JSON.stringify(grammar.authority_boundary?.may) === JSON.stringify(['håndtere varer innen rutine', 'registrere avvik', 'isolere usikkert gods']), 'Lager may-authority drifted');
assert(JSON.stringify(grammar.authority_boundary?.may_not) === JSON.stringify(['forfalske lagerstatus', 'sende skadet gods uten avklaring', 'omgå sikkerhetsrutiner', 'skjule lageravvik']), 'Lager may-not authority drifted');

const model = read(MODEL_PATH);
const workplaces = ['varemottak_og_kollikontroll', 'plukk_pakk_og_systemflate', 'telling_og_avvikspunkt', 'hms_og_overleveringsflate'];
const actorIds = ['ragnhild_driftsleder_lager', 'pavel_erfaren_lagermedarbeider', 'marius_okonomikontakt_lager', 'helle_hms_og_skiftkontakt_lager'];
assert(model.role_scope === ROLE && model.role_id === 'naer_lager_og_driftsmedarbeider', 'Lager role-model identity drift');
assert(JSON.stringify(model.work_life.workplaces) === JSON.stringify(workplaces), 'Lager workplace drift');
assert(JSON.stringify(model.related_people.map((actor) => actor.id)) === JSON.stringify(actorIds), 'Lager professional People foundation drift');
for (const actor of model.related_people) assert(actor.fictional === true && actor.fictional_scenario_actor === true && actor.canonical_person_ref === null, `${actor.id}: fictional boundary drift`);

const sourceRefs = [
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week1_receiving_almost_matched`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week1_pick_list_pressure`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week1_wrong_location`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week1_pallet_in_the_way`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_late_missing_colli`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_store_waits_wrong_item`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_count_mismatch`,
  `${JOB_PATH}#job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed`,
  `${PEOPLE_PATH}#lager_people_ragnhild_mottak_001`,
  `${PEOPLE_PATH}#lager_people_pavel_sporbarhet_001`,
  `${PEOPLE_PATH}#lager_people_marius_avstemming_001`,
  `${PEOPLE_PATH}#lager_people_helle_hms_handoff_001`
];
for (const ref of sourceRefs) {
  const [rel, id] = ref.split('#');
  const mails = (read(rel).families || []).flatMap((family) => family.mails || []);
  assert(mails.some((mail) => mail.id === id), `canonical provenance ref missing: ${ref}`);
}

const REF = Object.freeze({
  receiving: sourceRefs[0], pick: sourceRefs[1], location: sourceRefs[2], pallet: sourceRefs[3],
  lateColli: sourceRefs[4], wrongItem: sourceRefs[5], count: sourceRefs[6], nearMiss: sourceRefs[7],
  ragnhild: sourceRefs[8], pavel: sourceRefs[9], marius: sourceRefs[10], helle: sourceRefs[11]
});

const themeIds = ['professional_culture', 'invisible_work', 'numerical_control', 'body_discipline', 'loyalty_up_down', 'local_knowledge_vs_system', 'care_vs_efficiency', 'bureaucratic_power', 'shame_reputation', 'public_private_leakage', 'status_anxiety'];
const themeBank = read(THEME_BANK_PATH);
const validThemes = new Set((themeBank.themes || []).map((theme) => theme.id));
for (const id of themeIds) assert(validThemes.has(id), `unknown Role World theme: ${id}`);
assert(!themeBank.reference_profiles[KEY], 'Lager theme profile already exists; refuse duplicate materialization');

const audiences = [
  { id: 'operations_management', standing_axis: 'operational_truth_standing', cares_about: ['tidlig avvik som kan prioriteres', 'mottak og handoff som tåler beslutninger'], cannot_grant: 'Standing hos driftsledelsen kan ikke gi spilleren arbeidsledermyndighet, stock-korreksjonsrett eller adgang til å signere et usant mottak.' },
  { id: 'warehouse_team', standing_axis: 'peer_traceability_and_load_standing', cares_about: ['praktisk hjelp uten skjulte systemspor', 'rettferdig fysisk belastning og respekt for erfaring'], cannot_grant: 'Standing i laget kan ikke gjøre kollegial lojalitet til tillatelse for uregistrert flytting, skjulte avvik eller utrygge snarveier.' },
  { id: 'inventory_finance_control', standing_axis: 'explainable_stock_standing', cares_about: ['forklart differanse og transaksjonshistorie', 'tydelig skille mellom telling, årsak og godkjenning'], cannot_grant: 'Kontrollstanding kan ikke gi spilleren myndighet til å selvgodkjenne lagerkorreksjon eller velge hvilket tall som skal bli sant.' },
  { id: 'quality_hms', standing_axis: 'visible_hazard_and_learning_standing', cares_about: ['sikring, fakta og nestenulykkesspor', 'riktig kontrollnivå før lukking og normal drift'], cannot_grant: 'HMS-standing kan ikke gi spilleren myndighet til å lukke hendelser, oppheve sperrer eller skjule risiko fordi ingen ble skadet.' },
  { id: 'downstream_store_operations', standing_axis: 'variant_and_availability_trust', cares_about: ['riktig varevariant og troverdig tilgjengelighet', 'tidlig beskjed når lagerets svar fortsatt er usikkert'], cannot_grant: 'Nedstrøms tillit kan ikke gjøre kundepress til myndighet over plukkontroll, lagerstatus eller sikker vareflyt.' },
  { id: 'transport_supplier_interface', standing_axis: 'receiving_integrity_standing', cares_about: ['forutsigbart mottak og tydelige avvik', 'signatur som samsvarer med faktisk kontrollert gods'], cannot_grant: 'Transportstanding kan ikke gi rett til å akseptere skade, manglende kolli eller dokumentasjon spilleren ikke faktisk har kontrollert.' },
  { id: 'private_relations', standing_axis: 'private_recovery_and_role_containment', cares_about: ['restitusjon etter fysisk arbeid', 'at telling, kontrollblikk og lagerrang kan legges bort hjemme'], cannot_grant: 'Privat standing kan ikke løse arbeidsavvik, og profesjonell status kan ikke brukes som styringsrett eller målestokk i private relasjoner.' }
];

const slowAxes = audiences.map((audience) => ({ id: audience.standing_axis, meaning: `Situert standing for ${audience.id}; vurderes bare gjennom konkrete relasjoner og kan divergere fra andre publikum.`, runtime_binding: 'editorial_only_until_governed' }));

const recurringPeopleArchetypes = [
  { id: 'ragnhild_driftsleder_lager_world', social_function: 'driftsleder som trenger ærlig kapasitet, mottaksstatus og avvik før hun prioriterer', class_position: 'operativ leder over lagergulvet', status: 'høy formell status i lokal drift', power_over_player: 'kan prioritere arbeid og eskalering, men ikke gjøre usant mottak eller sikkerhetsbrudd gyldig', wants: 'forutsigbar flyt og tidlige beslutningsklare avvik', conceals: 'at grønn status kan bli belønnet før kostnaden ved å få den grønn blir synlig', speech_style: 'kort og avklarende om hva som er kjent, åpent og eid', teaches_player: 'at oppoverlojalitet krever et sant operativt grunnlag' },
  { id: 'pavel_erfaren_lagermedarbeider_world', social_function: 'erfaren kollega som kjenner både praktisk vareflyt og lagets uformelle snarveier', class_position: 'faglig sterk peer uten formell kontrollmyndighet', status: 'høy uformell tillit på gulvet', power_over_player: 'kan forme kollegiale normer, men ikke godkjenne skjult flytting eller regelbrudd', wants: 'en flyt som faktisk fungerer uten at laget blir syndebukk for dårlige prosesser', conceals: 'at nyttig erfaring også kan normalisere systemspor som tas senere', speech_style: 'konkret, lavmælt og løsningsorientert', teaches_player: 'at lokal kunnskap må gjøres sporbar for å bli robust' },
  { id: 'marius_okonomikontakt_lager_world', social_function: 'økonomikontakt som møter fysisk telling gjennom periode, verdi og avstemming', class_position: 'nedstrøms kontrollfunksjon med tallmakt', status: 'høy situert troverdighet i økonomisk kontroll', power_over_player: 'kan kreve forklaring og korrekt grunnlag, men ikke instruere fram en ubegrunnet lagerkorreksjon', wants: 'et lagergrunnlag som kan forklares etter at perioden er lukket', conceals: 'at tidsfristen for avstemming kan gjøre et pent tall mer fristende enn en åpen årsak', speech_style: 'presis om beløp, periode, spor og hva som fortsatt mangler', teaches_player: 'at fysisk kontroll og økonomisk lukking er ulike myndighetsledd' },
  { id: 'helle_hms_og_skiftkontakt_lager_world', social_function: 'HMS- og handoffkontakt som gjør nestenulykke og restarbeid synlig for neste skift', class_position: 'avgrenset sikkerhets- og overleveringsfunksjon', status: 'høy situert tillit ved risiko og læring', power_over_player: 'kan kreve et lesbart spor og riktig eskalering, men ikke overføre formell lukkemyndighet til spilleren', wants: 'synlige fakta, midlertidige tiltak og navngitt ansvar før normalisering', conceals: 'at dokumentasjon lettere fanger hendelsen enn den daglige kroppslige belastningen rundt den', speech_style: 'sekvensiell om sikret, kjent, ukjent og neste kontroll', teaches_player: 'at fravær av skade ikke betyr fravær av informasjon' },
  { id: 'elin_butikk_og_driftskontakt_world', social_function: 'nedstrøms mottaker som trenger riktig variant og troverdig beskjed om tilgjengelighet', class_position: 'kunde- og driftsledd uten lokal lagermyndighet', status: 'høy innflytelse på opplevd leveransekvalitet', power_over_player: 'kan utfordre feil og frister, men ikke oppheve lagerets kontrollpunkter', wants: 'riktig vare, rask avklaring og ærlig prognose', conceals: 'at presset etter et enkelt svar kan skjule usikkerheten lageret må undersøke', speech_style: 'direkte om variant, kundevirkning og når et pålitelig svar kommer', teaches_player: 'at nedstrøms tillit bygges ved å varsle usikkerhet før den blir feil løfte' },
  { id: 'transport_og_leverandorpress_world', social_function: 'transport- og leverandørgrense som gjør porttid, signatur og skade til forhandlet press', class_position: 'ekstern flytpartner uten myndighet over lagerkontrollen', status: 'sterk tidsmakt ved porten', power_over_player: 'kan skape kø- og tidskonsekvens, men ikke definere hva spilleren faktisk har mottatt', wants: 'rask lossing, tydelig avvik og forutsigbar frigivelse av transport', conceals: 'at hvert ekstra kontrollminutt kan bli skjøvet over på den som står ved porten', speech_style: 'frist-, dokument- og konsekvensorientert', teaches_player: 'at samarbeidsvilje ikke krever falsk signatur' },
  { id: 'privat_relasjon_lager_world', social_function: 'privat nær relasjon som møter kroppen og kontrollblikket etter skiftet', class_position: 'likemann uten arbeidsmyndighet', status: 'høy emosjonell betydning uten profesjonell rang', power_over_player: 'kan sette grenser for fravær og arbeidsmodus hjemme, men ikke løse lageravvik', wants: 'nærvær, hvile og et hjem som ikke behandles som lokasjoner og restanser', conceals: 'at gjentatt beredskap gjør usynlig lagerarbeid til en privat sosial kostnad', speech_style: 'hverdagslig og direkte; avviser når mennesker blir behandlet som vareflyt', teaches_player: 'at profesjonell sporbarhet må kunne slutte ved arbeidsdagens grense' }
];

const B = (text, audience, consequence, ref) => ({ text, audience, consequence, ref });
const days = [
  {
    morning: B('Følgeseddelen sier 18, pallen viser 17, og sjåføren trenger signaturen før neste tidsvindu. Du teller på nytt og må gi Ragnhild et mottaksgrunnlag som skiller faktisk kontroll fra håpet om at kolliet dukker opp senere.', 'operations_management', 'Ragnhilds standing styrkes dersom avviket er presist nok til å prioritere fra, mens transportleddet kan lese samme stopp som treghet fordi du nekter å la signaturen bære mer sikkerhet enn opptellingen.', REF.receiving),
    lunch: B('Pavel forteller hvordan ett manglende kolli pleier å bli forklart bort når porten er full. Du må ta erfaringen hans på alvor uten å gjøre tidligere uformell praksis til bevis på at mottaket denne gangen kan registreres grønt.', 'warehouse_team', 'Standing i laget øker når du bruker kollegakunnskap uten å gjøre noen til syndebukk, men kan falle dersom kontrollspråket oppleves som mistillit til dem som vanligvis holder porten i gang.', REF.pavel),
    afternoon: B('Ragnhild ber om status før hun omdisponerer resten av skiftet. Du leverer 17 mottatt, ett avvik, kjent dokumentasjon og neste avklaringspunkt, slik at ledelsen kan velge kapasitet uten å late som varen allerede finnes.', 'operations_management', 'Oppoverstanding bygges gjennom et beslutningsklart svar, samtidig som den som ønsket en rask grønn port kan vurdere deg som mindre fleksibel; tilliten er situert fordi samme presisjon skaper ulik sosial kostnad.', REF.ragnhild),
    evening: B('Hjemme teller du handleposene før du setter dem ned og merker irritasjonen når noen avbryter rekkefølgen. Du må oppdage at kontrollblikket som beskyttet mottaket ikke automatisk er omsorgsfullt i et rom uten følgeseddel.', 'private_relations', 'Privat standing styrkes når du kan legge fra deg behovet for å bekrefte alt fysisk, men arbeidets publikum ser aldri denne innsatsen; profesjonell nøyaktighet gir derfor ingen automatisk privat kreditt.', REF.receiving)
  },
  {
    morning: B('Plukklisten krever 12 enheter, hylla har åtte riktige og seks nesten like. Pavel vet at ordren haster, men du må stoppe gjettingen og gjøre variant, lokasjon og systemtall til tre separate kontrollspørsmål.', 'warehouse_team', 'Pavel kan lese stoppen som faglig ryddighet og hjelp til laget, mens kolleger i køen kan lese den som svak flyt; peer-standing avgjøres av om du også bidrar til en brukbar vei videre.', REF.pick),
    lunch: B('Pavel viser en uregistrert flytting som vil åpne plukksonen umiddelbart. Du foreslår å registrere samtidig og melde prosessflaskehalsen, slik at hans lokale kunnskap blir forbedringsgrunnlag i stedet for en privat hemmelighet.', 'warehouse_team', 'Kollegial standing kan svekkes fordi snarveien mister enkelheten, men styrkes på lengre sikt når Pavel blir kilde til en synlig forbedring fremfor den som alene må bære en risikabel norm.', REF.pavel),
    afternoon: B('Butikken venter på allergivennlig variant, men den fysiske hylla kan ikke støtte systemets løfte. Du varsler at åtte er bekreftet og resten uavklart før du undersøker blandingen, i stedet for å sende en nesten lik vare.', 'downstream_store_operations', 'Elins tillit styrkes av tidlig og presis usikkerhet selv om leveransen blir mindre, mens intern leveransestanding kan falle fordi avviket blir synlig før det er løst.', REF.wrongItem),
    evening: B('En venn ber om et enkelt svar på når du kommer, og du hører deg selv svare med betingelser, kontrollpunkter og forbehold. Du må skille ærlig usikkerhet fra et lagerpreget behov for å gjøre privat tid til en prognose.', 'private_relations', 'Privat standing styrkes når usikkerhet kan sies uten å organisere den andre som et nedstrøms ledd; arbeidets gode varslingspraksis må oversettes, ikke bare kopieres hjem.', REF.pick)
  },
  {
    morning: B('Emballasjerullene står fysisk på C-04-03 mens systemet peker til C-02-01. Du stanser usikker plukk og undersøker siste bevegelse, fordi en stille fysisk flytting vil gjøre hylla penere og lagerhistorien svakere.', 'inventory_finance_control', 'Kontrollstanding styrkes når lokasjonsfeilen beholder sitt spor, mens laget kan oppleve mer venting; den samme handlingen gir altså bedre etterprøvbarhet og mindre umiddelbar popularitet.', REF.location),
    lunch: B('Pavel mener varen kan flyttes riktig nå og historikken ryddes etterpå. Du ber ham rekonstruere hva laget faktisk vet om mottak, påfyll og retur, slik at erfaringen hans hjelper årsakssøket uten å bli uformell godkjenning.', 'warehouse_team', 'Pavels standing til deg vokser dersom spørsmålet anerkjenner erfaring, men kan falle hvis han opplever at praksisen hans blir gjort til avvik; relasjonen avhenger av hvordan ansvar skilles fra skyld.', REF.pavel),
    afternoon: B('Du registrerer lokasjonsavviket, flytter varen med synlig transaksjon og varsler plukk om hva som fortsatt er usikkert. Arbeidet tar lenger tid, men neste person kan se både hvor varen er og hvorfor systemet endret seg.', 'inventory_finance_control', 'Lagerkontrollens standing styrkes gjennom rekonstruerbar korreksjon, mens driftsledelsen kan savne tempo; ingen av vurderingene endrer hvem som må godkjenne videre kontroll.', REF.location),
    evening: B('Hjemme flytter du glass og ladere for bedre flyt uten å spørre dem som bruker rommet. Du må merke at en effektiv lokasjon på lageret har institusjonelt formål, mens privat orden uten samtykke kan bli asymmetrisk kontroll.', 'private_relations', 'Privat standing svekkes når logistikkblikket blir styringsrett hjemme, men styrkes når du spør og tåler andre ordninger; yrkeskompetanse gir ikke automatisk sosial rang.', REF.location)
  },
  {
    morning: B('En tung pall står delvis i gangsonen mens truck og ansatte skal forbi. Du stopper egen passasje, isolerer området og vurderer trygg flytting i stedet for å la kroppene absorbere en dårlig plassert last.', 'quality_hms', 'HMS-standing styrkes når faren blir konkret før skade, mens kolleger som allerede har gått rundt pallen kan lese sperringen som overreaksjon; sikkerhetstillit bygges ikke nødvendigvis gjennom øyeblikkelig enighet.', REF.pallet),
    lunch: B('Helle spør hva som er sikret, hvem som fortsatt trenger tilgang og hvilket midlertidig tiltak neste skift må kjenne. Du beskriver faktiske forhold uten å gjøre den som satte pallen der til hele årsaken.', 'quality_hms', 'Helles tillit styrkes av skillet mellom fakta og skyld, mens lagstanding beskyttes når hendelsen ikke reduseres til én person; den sosiale gevinsten avhenger av at risikoen fortsatt forblir synlig.', REF.helle),
    afternoon: B('Produksjonen vil ha gangsonen åpnet straks pallen er flyttet. Du dokumenterer plassering, tidspress og kontroll av området før normal flyt, uten å late som lokal rydding gir deg formell HMS-lukkemyndighet.', 'operations_management', 'Ledelsesstanding kan styrkes fordi driften får et klart gjenstartsgrunnlag og samtidig svekkes hos dem som ønsket umiddelbar åpning; myndighetsgrensen består uansett publikum.', REF.pallet),
    evening: B('Kroppen gjentar løftet og den trange passasjen etter at skiftet er over. Du velger hvile og forteller hva som belastet deg, i stedet for å bruke fravær av skade som bevis på at kroppen ikke trenger oppfølging.', 'private_relations', 'Privat standing styrkes når kroppen får være sann uten å bli et nytt avviksskjema, mens lagets vurdering av innsatsen forblir separat; utholdenhet hjemme gir ingen HMS-kreditt på jobb.', REF.helle)
  },
  {
    morning: B('Det manglende kolliet kommer fem dager senere, men kan ikke bare legges inn som om det aldri manglet. Du kobler etterleveringen til det åpne avviket, mottaksdatoen og transportørhistorikken før varen får ny lokasjon.', 'transport_supplier_interface', 'Transportstanding kan falle fordi etterleveringen fortsatt får et avviksspor, mens drifts- og kontrollstanding styrkes fordi historien ikke blir omskrevet; samarbeidet må tåle dokumentert forsinkelse.', REF.lateColli),
    lunch: B('Marius forklarer at en vanlig mottaksregistrering kan gi feil periode eller dobbeltspor. Du gir ham det faktiske hendelsesforløpet og ber riktig linje avgjøre periodisering, uten å gjøre økonomiens frist til din lagergodkjenning.', 'inventory_finance_control', 'Marius får større tillit til lagergrunnlaget når du avgrenser hva du vet, men kan fortsatt oppleve tidspunktet som krevende; kontrollstanding handler om forklarbarhet, ikke om friksjonsfri lukking.', REF.marius),
    afternoon: B('Ragnhild vil vite om varen kan loves videre samme dag. Du skiller fysisk tilgjengelighet fra ferdig system- og avviksbehandling og gir et tidspunkt for neste bekreftelse i stedet for et grønt svar uten grunnlag.', 'operations_management', 'Ledelsesstanding styrkes gjennom en prognose med tydelige forutsetninger, mens nedstrømsleddet kan miste tålmodighet; ingen av dem får myndighet til å gjøre etterleveringen historieløs.', REF.ragnhild),
    evening: B('Du leter hjemme etter det som mangler og kjenner samme rastløshet som ved det sene kolliet. Du må la en privat gjenstand være borte en stund uten å gjøre hele rommet og relasjonen til et årsakssøk.', 'private_relations', 'Privat standing styrkes når kontrollbehovet ikke overtar samværet, men denne roen er usynlig for arbeidsplassen; sosial verdi kan ikke samles i én omdømmekonto.', REF.lateColli)
  },
  {
    morning: B('Elin melder at butikken fikk feil variant til en kunde som spurte spesifikt etter allergivennlig vare. Du må bekrefte feilen, varsle om tilgjengelighet og undersøke om lokasjonen blander varene før du lover ny levering.', 'downstream_store_operations', 'Elins standing til deg styrkes av et konkret svar som ikke bagatelliserer kundevirkningen, mens intern standing kan falle fordi feilen blir synlig utad; troverdighet og omdømme peker ikke alltid samme vei.', REF.wrongItem),
    lunch: B('Pavel mener feilplukket ikke kan forstås uten å se på reolen og systemtallet sammen. Du inviterer ham inn i rekonstruksjonen, men beholder skillet mellom hans erfaring, dine observasjoner og formell beslutning om korrigerende tiltak.', 'warehouse_team', 'Peer-standing styrkes når lokal kunnskap får en reell rolle uten å bli uformell domstol, mens kontrollfunksjoner får bedre evidens; samarbeidet gir ingen ny godkjenningsmyndighet.', REF.pavel),
    afternoon: B('Du isolerer de to variantene, kontrollerer etikett og lokasjon, og gir Elin en sann prognose for riktig vare. Kunden må vente, men lageret slutter å sende usikkerheten videre som tilsynelatende sikker leveranse.', 'downstream_store_operations', 'Nedstrøms tillit styrkes når neste svar kan brukes, selv om leveransehastigheten ser svakere ut; standing måles i den konkrete relasjonen og kan ikke reduseres til antall utsendte ordre.', REF.wrongItem),
    evening: B('Du kjenner skammen over at en liten plukkforskjell fikk en stor virkning hos noen du aldri møtte. Du må ta ansvar uten å gjøre deg selv til hele systemfeilen eller bruke privat selvkritikk som erstatning for faktisk læring.', 'private_relations', 'Privat standing styrkes når skyld kan deles som erfaring fremfor å bli taushet, mens profesjonell tillit bare kan gjenbygges gjennom handling på jobb; følelsen er ikke et globalt omdømmetall.', REF.wrongItem)
  },
  {
    morning: B('Kontrolltellingen viser 19 der systemet sier 24. Du teller på nytt, skiller lignende variant og henter siste bevegelser før ordet svinn får feste, fordi et tidlig moralsk svar kan skjule mottak, plukk eller lokasjonsfeil.', 'inventory_finance_control', 'Kontrollstanding styrkes når du beskytter årsaksrommet mot rask konklusjon, mens ledelsen kan savne et enkelt tall; etterprøvbarhet kan se ut som ubesluttsomhet for et annet publikum.', REF.count),
    lunch: B('Marius trenger grunnlag før periodeavslutning og spør om systemet kan korrigeres til 19. Du overleverer dobbelttelling og spor, men lar riktig kontrollinje eie korreksjonen slik at samsvar ikke blir forvekslet med forklaring.', 'inventory_finance_control', 'Marius får større tillit til grensedragningen selv om lukking forsinkes, mens noen i driften kan lese den som byråkrati; kontrollstanding gir ikke spilleren større mandat.', REF.marius),
    afternoon: B('Du finner at feilplukk, sen etterlevering og blandet lokasjon alle kan bidra til differansen. Du registrerer delsporene og lar fem enheter forbli åpent avvik fremfor å presse flere usikre hendelser inn i én fortelling.', 'operations_management', 'Ledelsesstanding styrkes når kompleksiteten blir beslutningsklar uten falsk presisjon, men kan svekkes hos dem som ønsker én skyld og én dato; sannheten om lageret er sosialt krevende nettopp fordi den ikke er enkel.', REF.count),
    evening: B('Hjemme begynner du å regne egen energi som startsaldo, forbruk og rest. Du må la tretthet være kroppslig erfaring uten å kreve at den kan avstemmes til null før du fortjener hvile.', 'private_relations', 'Privat standing styrkes når du kan være sliten uten å levere et pent regnskap, mens arbeidsstanding ikke endres av hvor effektivt du restituerer; publikumene forblir adskilt.', REF.marius)
  },
  {
    morning: B('Flere så en ansatt hoppe unna pallen, men ingen ble skadet og avviket er fortsatt uskrevet. Du isolerer den trange passasjen og samler tid, plassering og arbeidsflyt før minnene blir til et rykte om hvem som var uforsiktig.', 'quality_hms', 'HMS-standing styrkes når fakta bevares uten skyldjakt, mens enkelte kolleger kan frykte at åpenheten rammer laget; sikkerhetstillit krever at sosial beskyttelse ikke betyr skjult hendelse.', REF.nearMiss),
    lunch: B('Helle ber deg skille hva som er observert fra hva dere antar om årsaken. Du navngir blokkert gangsone, høyt tempo og manglende avvik, men lar formell vurdering og lukking bli hos riktig kontrollnivå.', 'quality_hms', 'Helles tillit styrkes av presis rolleforståelse, mens driftsstanding kan utfordres av at saken forblir åpen; ingen god relasjon gir rett til å lukke risikoen raskere enn grunnlaget tillater.', REF.helle),
    afternoon: B('Neste skift skal bruke samme passasje. Du overleverer midlertidig tiltak, hva som må undersøkes og hvem som eier oppfølging, slik at ryddet gulv ikke blir presentert som ferdig læring.', 'operations_management', 'Handoff-standing styrkes fordi neste skift kan arbeide selvstendig, mens forrige skifts presentasjon blir mindre grønn; situert tillit bygges ved å gjøre restansvaret synlig.', REF.nearMiss),
    evening: B('Kroppen spiller av hoppet du så, selv om det ikke var din kropp som var nærmest pallen. Du forteller om reaksjonen uten å gjøre deg til eneste sikkerhetsbarriere eller kreve at en privat relasjon løser arbeidsplassen.', 'private_relations', 'Privat standing styrkes gjennom ærlig avgrensning av ansvar, mens HMS-standing fortsatt avhenger av dokumentasjon og tiltak på jobb; omsorg hjemme kan ikke erstatte kontrollsporet.', REF.helle)
  },
  {
    morning: B('En ny leveranse kommer mens gårsdagens avvik fortsatt er åpent, og transportøren spør om du denne gangen kan gjøre kontrollen raskere. Du planlegger porten slik at kjent usikkerhet ikke blir begrunnelse for mindre kontroll av nytt gods.', 'transport_supplier_interface', 'Transportstanding styrkes dersom du gjør kontrollrekkefølgen forutsigbar, men kan svekkes hvis tidsvinduet likevel ryker; profesjonell integritet består i å være samarbeidsvillig uten falsk aksept.', REF.receiving),
    lunch: B('Ragnhild vil unngå at avvik gjør hele mottaket defensivt. Du foreslår klare stoppkriterier og rask frigivelse av det som faktisk stemmer, slik at nøyaktighet ikke blir total stans eller symbolsk strenghet.', 'operations_management', 'Ledelsesstanding styrkes når du kan kombinere kontroll med praktisk flyt, mens laget får mindre grunn til å se avvik som kollektiv straff; tillit skapes gjennom avgrensning, ikke gjennom svakere krav.', REF.ragnhild),
    afternoon: B('Sjåføren peker på dokumentasjonen og du peker på fysisk skade som ikke står der. Du registrerer avviket og isolerer godset før videre flyt, uten å bruke transportørens tidspress som årsak til å sende risikoen videre.', 'transport_supplier_interface', 'Leverandørstanding kan falle fordi saken blir synlig og tidskrevende, mens kvalitet og nedstrøms tillit styrkes; publikumene vurderer samme stopp fra ulike kostnadsposisjoner.', REF.receiving),
    evening: B('Du kommer hjem senere fordi mottaket krevde ekstra kontroll og merker lysten til å presentere forsinkelsen som heroisk ansvar. Du må fortelle sannheten uten å bruke arbeidsmoralen som krav på privat takknemlighet.', 'private_relations', 'Privat standing styrkes når konsekvensen anerkjennes uten rang, mens profesjonell stå-på-vilje ikke kjøper sosial gjeld hjemme; arbeid og relasjon har ulike regnskap.', REF.ragnhild)
  },
  {
    morning: B('Plukksonen bygger kø fordi systemet fortsatt viser en lokasjon som teamet ikke stoler på. Du stanser gjetting, fordeler fysisk søk og systemkontroll, og gjør det tydelig hva som kan plukkes uten å blande variantene.', 'warehouse_team', 'Lagstanding styrkes når stoppet også inneholder en konkret arbeidsfordeling, mens nedstrømsleddet kan miste tålmodighet; praktisk hjelp og sporbarhet må bevises sammen.', REF.pick),
    lunch: B('Pavel sier at teamet blir målt på linjer, ikke på feil de unngår. Du løfter fram den skjulte letingen og kontrollen i statusen uten å gjøre all treghet til kvalitet eller bruke laget som skjold mot resultatansvar.', 'warehouse_team', 'Peer-standing styrkes når usynlig arbeid blir anerkjent, mens ledelsesstanding avhenger av at forklaringen fortsatt er konkret og etterprøvbar; solidaritet er ikke et fritak fra resultat.', REF.pavel),
    afternoon: B('Du finner varen på ny lokasjon og må velge mellom stille fysisk retting og en registrert bevegelse som viser hvorfor køen oppstod. Du velger sporet og varsler hvilke ordre som må kontrolleres på nytt.', 'inventory_finance_control', 'Kontrollstanding styrkes gjennom synlig rework, mens produksjonstallene viser mer arbeid enn planlagt; reputasjonen divergerer fordi ett publikum ser kostnad og et annet ser redusert framtidsrisiko.', REF.location),
    evening: B('Du hører deg selv beskrive en privat uenighet som feil lokasjon og dårlig flyt. Du stopper metaforen og spør hva den andre faktisk prøver å si, slik at logistikkens presisjon ikke avpersonifiserer relasjonen.', 'private_relations', 'Privat standing styrkes når mennesker ikke behandles som objekter som skal plasseres riktig, mens yrkesidentiteten tåler å være nyttig uten å dominere språket hjemme.', REF.pick)
  },
  {
    morning: B('Butikken spør om riktig variant finnes etter gårsdagens feil, samtidig som tellingen på samme reol fortsatt er uavklart. Du gir et avgrenset tilgjengelighetssvar og nekter å la systemets 24 bli kundeløfte før fysisk kontroll.', 'downstream_store_operations', 'Elins tillit styrkes av et svar hun kan formidle videre, men leveransestanding svekkes når tallet blir lavere; nøyaktighet fordeler skuffelsen tidligere i stedet for å skjule den.', REF.wrongItem),
    lunch: B('Marius vil vite om feilplukket forklarer hele differansen. Du viser hva returen faktisk dekker og lar resten stå åpent, fordi en plausibel hendelse ikke skal få absorbere alle manglende enheter.', 'inventory_finance_control', 'Kontrollstanding styrkes når du motstår en bekvem totalforklaring, mens driftsledelsen kan ønske raskere lukking; tillit knyttes til påstandsgrensen, ikke til hvor komplett historien høres ut.', REF.marius),
    afternoon: B('Du korrigerer den bekreftede returen, beholder restdifferansen som avvik og informerer både plukk og butikk. Flere ledd får mindre pene tall, men ingen trenger å bygge neste beslutning på et skjult femtall.', 'operations_management', 'Oppover- og nedstrømsstanding styrkes gjennom samme sanne delkorreksjon, mens de som må forklare restavviket kan vurdere deg strengere; sosial gevinst er aldri garantert av teknisk riktighet.', REF.count),
    evening: B('Du kjenner behovet for å forklare hele dagen før du kan slappe av, men årsaken er fortsatt sammensatt. Du øver på å si hva som er gjort og hva som forblir åpent uten å gjøre privat ro avhengig av full årsakslukking.', 'private_relations', 'Privat standing styrkes når uferdig arbeid kan få en tydelig grense, mens profesjonell standing fortsatt venter på neste kontroll; evnen til å hvile er ikke det samme som å erklære avviket ferdig.', REF.marius)
  },
  {
    morning: B('Den samme gangsonen er ryddet, men et nytt hastebehov frister laget til midlertidig plassering. Du stopper før pallen settes ned og foreslår en synlig venteplass, slik at læringen påvirker handling før ny nestenulykke.', 'quality_hms', 'HMS-standing styrkes når tidligere hendelse endrer praksis, mens teamet kan oppleve mindre fleksibilitet i et travelt øyeblikk; sikkerhetskultur blir synlig nettopp når ingen ny skade har tvunget den fram.', REF.pallet),
    lunch: B('Helle spør om tiltaket faktisk hjelper eller bare flytter køen. Du følger vareflyten og kroppene gjennom området, og lar erfaring fra gulvet justere løsningen uten å oppheve kravet om fri gangsone.', 'quality_hms', 'Helles og lagets standing til deg kan styrkes samtidig når tiltaket tåler kritikk, men ledelsen kan se mer tidsbruk; læring er situert samarbeid, ikke lydighet mot første løsning.', REF.helle),
    afternoon: B('Ragnhild ber om produksjonskonsekvensen av den nye venteplassen. Du gir tall på ekstra håndtering og redusert risiko og ber henne prioritere kapasitet, i stedet for å skjule HMS-kostnaden inne i kroppene på gulvet.', 'operations_management', 'Ledelsesstanding styrkes når tradeoffen er beslutningsklar, mens enkelte peers kan frykte at tallene åpner for å fjerne tiltaket; sann rapportering må derfor bevare både kostnad og sikkerhetsgrense.', REF.nearMiss),
    evening: B('Kroppen er mindre spent fordi området fungerte bedre, men du merker stolthet over å ha sett løsningen. Du deler den uten å gjøre privat samtale til en rapport om egen verdi eller forvente at arbeidsresultatet skal rangere deg hjemme.', 'private_relations', 'Privat standing styrkes når stolthet kan være nærvær fremfor statuskrav, mens HMS-standing forblir knyttet til om tiltaket faktisk virker over tid; én god dag gir ingen global score.', REF.nearMiss)
  },
  {
    morning: B('Ragnhild, Pavel, Marius og Helle møtes rundt samme vareflyt: mottak, uregistrert flytting, differanse og nestenulykke viser at ingen enkelt rolle eier hele sannheten. Du må gi hver person riktig faktagrunnlag uten å flytte myndighet mellom dem.', 'operations_management', 'Standing styrkes ulikt når du tåler at ledelse, peer, kontroll og HMS stiller forskjellige spørsmål; ingen samlet popularitet kan erstatte presis rolle- og informasjonsdeling.', REF.ragnhild),
    lunch: B('Pavel frykter at kontrollmøtet gjør lagergulvet til problemet, mens Marius trenger spor som tåler revisjon. Du beskriver snarveien som prosess og handling uten å skjule hvem som visste hva eller gjøre erfaring til skyldbevis.', 'warehouse_team', 'Peer-standing styrkes dersom gulvkunnskap blir hørt, mens kontrollstanding styrkes dersom sporet forblir konkret; balansen krever sannhet begge veier og gir ingen immunitet mot ansvar.', REF.pavel),
    afternoon: B('Marius avgrenser hva økonomi kan godkjenne, og Helle avgrenser hva HMS fortsatt må følge opp. Du beholder ditt ansvar for telling, avvik og sikring uten å gjøre de andres kontrollfunksjoner til personlig prestisje.', 'inventory_finance_control', 'Kontrollstanding styrkes når myndighet ikke lekker gjennom gode relasjoner, mens noen kan lese avgrensningen som distanse; profesjonell respekt betyr å vite hvem som faktisk kan beslutte.', REF.marius),
    evening: B('Hjemme merker du hvor lett arbeidsdagen blir fortalt som en konkurranse mellom hvem som hadde rett. Du velger å beskrive hva hver person beskyttet, slik at privat samtale ikke fortsetter lagerets statuskamp.', 'private_relations', 'Privat standing styrkes når flere perspektiver kan finnes uten ny dom, mens jobbreputasjonen forblir situert hos dem som deltok; hjemmet er ikke siste instans for arbeidsrang.', REF.helle)
  },
  {
    morning: B('Den siste mottaksrunden samler kontroll, lokasjon, plukk, avvik og sikker passasje i én flyt. Du gjør hvert stoppkriterium lesbart, slik at pålitelig drift ikke avhenger av at du personlig husker alle tidligere feil.', 'operations_management', 'Ledelsesstanding styrkes når systemet tåler fravær og handoff, mens personlig status kan føles mindre viktig; moden profesjonell tillit ligger i en flyt som ikke trenger helten.', REF.receiving),
    lunch: B('Pavel overtar deler av kontrollen og utfordrer ett unødvendig dobbeltsteg. Du beholder sporet som beskytter varen, men fjerner kontrollen som bare signaliserte grundighet, slik at lagets erfaring faktisk kan forbedre standarden.', 'warehouse_team', 'Peer-standing styrkes når kritikk får materiell virkning, mens kontrollstanding bevares fordi det avgjørende sporet består; respekt vises gjennom begrunnet revisjon, ikke gjennom å si ja til alt.', REF.pavel),
    afternoon: B('Du overleverer åpent restavvik til Marius og kjent HMS-oppfølging til Helle, med fakta, eier og neste kontroll. Arbeidsdagen avsluttes uten at åpne punkter blir skjult eller bæres som privat allestedsnærvær.', 'quality_hms', 'Handoff-standing styrkes hos begge kontrollpublikum fordi restansvar er lesbart, mens grønn leveranse ser mindre perfekt ut; sosial tillit bygges ved å vise det uferdige presist.', REF.helle),
    evening: B('Du legger fra deg skannerblikket, lar ting stå uten optimal lokasjon og møter en privat relasjon uten å måle dagen i linjer, differanser eller reddede minutter. Rollen avsluttes som ansvarlig uten å bli hele personen.', 'private_relations', 'Privat standing styrkes gjennom gjensidighet og hvile, mens arbeidets publikum vurderer de sporene du faktisk etterlot på jobb; avslutningen bevarer flere situerte omdømmer uten global rang.', REF.marius)
  }
];

assert(days.length === 14, `expected 14 authored days, got ${days.length}`);
const phases = ['morning', 'lunch', 'afternoon', 'evening'];
const beatTypes = ['info', 'relationship', 'task', 'decision', 'conversation', 'social', 'consequence', 'private_consequence'];
const audienceIds = new Set(audiences.map((audience) => audience.id));
const coverage = [];
for (let day = 1; day <= days.length; day += 1) {
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
    const phase = phases[phaseIndex];
    const authored = days[day - 1][phase];
    assert(audienceIds.has(authored.audience), `${day}/${phase}: unknown audience ${authored.audience}`);
    assert(sourceRefs.includes(authored.ref), `${day}/${phase}: unknown source ref`);
    coverage.push({
      day,
      phase,
      beat_type: beatTypes[((day - 1) * phases.length + phaseIndex) % beatTypes.length],
      summary: authored.text,
      standing_audience: authored.audience,
      standing_consequence: authored.consequence,
      materialization_refs: [authored.ref]
    });
  }
}

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'naeringsliv',
  role_scope: ROLE,
  title: 'Lager- og driftsmedarbeider — synlig spor, kropp og situert tillit',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Å holde fysisk vare, systemhistorie og sikker arbeidsflyt troverdige når flere publikum belønner ulike deler av resultatet og feil ofte blir synlige først i neste ledd.',
    description: 'Role World-en lukker bare situert omdømme rundt eksisterende lagerpraksis. Den canonicale 20-stegsplanen, People-forankringen, arbeidsflatene, arbeidsløkkene og authority-grensen beholdes uendret.'
  },
  theme_ids: themeIds,
  social_environments: [
    'Varemottaket der signatur, kollitall, skade og transporttid forhandler om hva som kan kalles mottatt.',
    'Plukk-, pakk- og systemflaten der lokal erfaring, variantkontroll og uregistrert bevegelse konkurrerer om flyt.',
    'Telling- og avvikspunktet der fysisk beholdning, transaksjonshistorie og økonomisk lukking må holdes adskilt.',
    'HMS- og overleveringsflaten der ryddet gulv ikke automatisk betyr lukket hendelse eller ferdig læring.',
    'Det nedstrøms møtet med butikk og drift der lagerets usikkerhet blir kundeløfte, feil variant eller troverdig prognose.',
    'Privatlivet der kropp, telling og kontrollblikk må kunne legges bort uten å fornekte arbeidets ansvar.'
  ],
  recurring_people_archetypes: recurringPeopleArchetypes,
  slow_axes: slowAxes,
  existing_work_continuity: {
    runtime_binding: 'existing_mail_and_work_grammar',
    new_runtime_state: false,
    work_loops: workLoops,
    canonical_surfaces: [MODEL_PATH, GRAMMAR_PATH, PLAN_PATH, JOB_PATH, PEOPLE_PATH],
    rule: 'Den eksisterende 20-stegs praksisplanen og begge canonical work loops forblir authoritative; Role World-en legger bare audience-spesifikk Standing rundt eksisterende scener og skaper ingen ny scene-, plan-, work-object- eller rytme-runtime.'
  },
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: 'Standing uttrykker situert tillit hos ulike publikum. Den kan aldri gi lagerkorreksjons-, arbeidsleder-, transportaksept- eller HMS-lukkemyndighet, oppheve sikkerhetskrav eller legitimere skjult vare- og hendelseshistorie.',
    rule: 'Standing kan divergere mellom driftsledelse, lagerteam, kontroll/økonomi, HMS, nedstrøms drift, transportgrense og privatliv uten global sosial score.'
  },
  cross_role_link: {
    status: 'not_required_for_rollout',
    materialized: false,
    new_runtime: false,
    companion_keys: [],
    rule: 'Readiness requires no cross-role link. Downstream and control audiences remain social consequences inside this Role World; no companion career, shared persistent object or cross-role runtime is invented.'
  },
  season: { days: 14, day_phases: phases, coverage },
  primary_threads: [
    { id: 'receiving_truth_and_transport', beat_refs: ['1/morning', '1/afternoon', '5/morning', '9/morning', '9/afternoon', '14/morning'] },
    { id: 'pluck_location_and_trace', beat_refs: ['2/morning', '2/lunch', '3/morning', '3/afternoon', '10/morning', '10/afternoon'] },
    { id: 'stock_reconciliation_and_downstream', beat_refs: ['5/lunch', '6/morning', '7/morning', '7/lunch', '11/morning', '11/afternoon'] },
    { id: 'safety_body_and_handoff', beat_refs: ['4/morning', '4/lunch', '8/morning', '8/afternoon', '12/morning', '14/afternoon'] },
    { id: 'warehouse_team_and_invisible_work', beat_refs: ['1/lunch', '3/lunch', '6/lunch', '10/lunch', '13/lunch', '14/lunch'] },
    { id: 'private_role_containment', beat_refs: ['1/evening', '4/evening', '7/evening', '10/evening', '13/evening', '14/evening'] }
  ],
  private_aftermath: [
    { id: 'kontrollblikk_hjemme', beat_refs: ['1/evening', '3/evening'], meaning: 'Mottaks- og lokasjonsblikk må kunne vike for samtykke og gjensidighet i private rom.' },
    { id: 'kroppen_som_skjult_buffer', beat_refs: ['4/evening', '8/evening'], meaning: 'Fysisk belastning og nestenulykke kan erkjennes uten at fravær av skade blir bevis på at alt gikk bra.' },
    { id: 'uforklart_rest', beat_refs: ['5/evening', '11/evening'], meaning: 'Uferdige årsaksspor kan få en tydelig arbeidsgrense uten å invadere privat hvile.' },
    { id: 'feilens_skam', beat_refs: ['6/evening', '7/evening'], meaning: 'Ansvar for feil må skilles fra forestillingen om at én person er hele vareflytens moralske verdi.' },
    { id: 'rollen_lagt_ned', beat_refs: ['9/evening', '12/evening', '14/evening'], meaning: 'Profesjonell stolthet kan bæres hjem uten å bli rang, kontroll eller krav på privat sosial gjeld.' }
  ],
  delayed_consequences: [
    { id: 'receiving_signature_return', setup_ref: '1/morning', return_ref: '9/morning', meaning: 'Den første sanne signaturen avgjør om neste transportforhandling kan bygge på et troverdig mottaksspor.' },
    { id: 'pavel_shortcut_return', setup_ref: '2/lunch', return_ref: '10/lunch', meaning: 'Måten snarveien møtes på avgjør om Pavels erfaring senere blir forbedringskilde eller skjult motpraksis.' },
    { id: 'location_return', setup_ref: '3/morning', return_ref: '11/morning', meaning: 'Et bevart lokasjonsspor avgjør om feil variant og beholdningsdifferanse senere kan skilles fra hverandre.' },
    { id: 'pallet_learning_return', setup_ref: '4/morning', return_ref: '12/morning', meaning: 'Tidlig synlig risiko avgjør om neste hastebehov møtes med endret praksis eller gjentatt flaks.' },
    { id: 'late_colli_period_return', setup_ref: '5/morning', return_ref: '7/lunch', meaning: 'Etterleveringens historikk avgjør om økonomisk avstemming senere kan forklare perioden uten dobbeltspor.' },
    { id: 'wrong_variant_return', setup_ref: '6/morning', return_ref: '11/afternoon', meaning: 'Tidlig nedstrøms sannhet gjør en senere delkorreksjon troverdig selv om restdifferansen forblir åpen.' },
    { id: 'private_boundary_return', setup_ref: '1/evening', return_ref: '14/evening', meaning: 'Kontrollblikket fra første dag prøves til slutt mot evnen til å være ansvarlig på jobb og gjensidig hjemme.' }
  ],
  employment_conditions: [
    'Arbeid på lager forutsetter faktisk ansettelse, opplæring, lokale rutiner og relevant tilgang; Badge-poeng eller Standing gir ingen jobb eller systemmyndighet.',
    'Truck, farlig gods, lagerkorreksjon, HMS-lukking og arbeidsledelse følger institusjonelle krav og kan ikke materialiseres gjennom sosial tillit.',
    'Standing kan påvirke samarbeid og hvilke opplysninger andre deler, men aldri oppheve godkjenning, sikkerhetskrav eller formell kontroll.'
  ],
  professional_culture: [
    'God lagerkultur gjør fysisk vare, systemspor og restusikkerhet synlige før feil flyttes videre som tilsynelatende riktige leveranser.',
    'Kollegial hjelp er robust når lokal kunnskap kan brukes uten at registrering, HMS eller avvik blir private hemmeligheter.',
    'En grønn lagerstatus er ufullstendig dersom den skjuler skjev kroppslig belastning, ukjent lokasjon, uavklart differanse eller risiko neste skift må oppdage selv.'
  ],
  materialization: {
    authored_dimensions: ['situated_reputation'],
    no_new_runtime: true,
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_people_foundation_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    cross_role_link_materialized: false,
    source_refs: sourceRefs
  }
};

assert(world.season.coverage.length === 56, 'Lager coverage must be 56 beats');
assert(new Set(world.season.coverage.map((beat) => beat.summary)).size === 56, 'all summaries must be unique');
assert(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size === 56, 'all standing consequences must be unique');
for (const beat of world.season.coverage) {
  assert(beat.summary.length >= 140, `${beat.day}/${beat.phase}: summary too shallow`);
  assert(beat.standing_consequence.length >= 120, `${beat.day}/${beat.phase}: standing consequence too shallow`);
}
const sourceUse = new Map(sourceRefs.map((ref) => [ref, 0]));
for (const beat of world.season.coverage) sourceUse.set(beat.materialization_refs[0], sourceUse.get(beat.materialization_refs[0]) + 1);
for (const [ref, count] of sourceUse) assert(count >= 2, `${ref}: must ground at least two authored beats, got ${count}`);

write(WORLD_PATH, world);

const index = read(INDEX_PATH);
assert(!index.roles.some((entry) => entry.category === 'naeringsliv' && entry.role_scope === ROLE), 'Lager already registered in Role World index');
index.roles.push({ category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
index.status = `${index.roles.length}_role_worlds_materialized`;
write(INDEX_PATH, index);

const checklist = read(CHECKLIST_PATH);
assert(!checklist.reference_worlds.includes(WORLD_PATH), 'Lager already present in authoring checklist');
checklist.reference_worlds.push(WORLD_PATH);
write(CHECKLIST_PATH, checklist);

themeBank.reference_profiles[KEY] = themeIds;
write(THEME_BANK_PATH, themeBank);

for (const [rel, before] of Object.entries(protectedHashes)) assert(sha(rel) === before, `${rel} changed during Role World materialization`);

console.log(JSON.stringify({
  role_world: WORLD_PATH,
  index_status: index.status,
  source_refs: sourceRefs.length,
  source_ref_minimum_uses: Math.min(...sourceUse.values()),
  days: world.season.days,
  beats: world.season.coverage.length,
  unique_summaries: new Set(world.season.coverage.map((beat) => beat.summary)).size,
  unique_standing_consequences: new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size,
  audiences: world.situated_reputation_model.audiences.length,
  protected_surfaces_unchanged: protectedPaths
}, null, 2));
