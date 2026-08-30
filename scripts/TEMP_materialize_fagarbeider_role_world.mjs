#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const KEY = 'naeringsliv/fagarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/fagarbeider.json';
const INDEX_PATH = 'data/Civication/roleWorlds/index.json';
const CHECKLIST_PATH = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEME_BANK_PATH = 'data/Civication/roleWorldThemeBank.json';
const READINESS_PATH = 'data/Civication/roleWorldRolloutReadiness.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/fagarbeider.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json';

const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const read = (rel) => JSON.parse(readText(rel));
const write = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const sha = (rel) => crypto.createHash('sha256').update(readText(rel)).digest('hex');

const protectedHashes = Object.fromEntries([PLAN_PATH, MODEL_PATH, GRAMMAR_PATH].map((rel) => [rel, sha(rel)]));
assert(!fs.existsSync(path.join(ROOT, WORLD_PATH)), 'Fagarbeider Role World already exists; refuse overwrite');

const readinessBefore = read(READINESS_PATH);
const queueRow = (readinessBefore.rollout_queue || []).find((row) => row.key === KEY);
assert(queueRow, 'Fagarbeider must still be present in rollout queue before Role World materialization');
assert(queueRow.classification === 'rollout_ready', `Fagarbeider must be rollout_ready, got ${queueRow.classification}`);
assert(JSON.stringify(queueRow.authored_work_required) === JSON.stringify(['situated_reputation']), `unexpected authored debt: ${JSON.stringify(queueRow.authored_work_required)}`);
assert(queueRow.cross_role_need === 'not_required_for_rollout', `unexpected cross-role need: ${queueRow.cross_role_need}`);

const plan = read(PLAN_PATH);
assert(plan.id === 'fagarbeider_naeringsliv_v3', `unexpected plan id: ${plan.id}`);
assert(plan.role_scope === 'fagarbeider', `unexpected plan role scope: ${plan.role_scope}`);
assert(Array.isArray(plan.sequence) && plan.sequence.length >= 20, 'Fagarbeider plan must retain at least 20 practice steps');
for (let i = 0; i < 20; i += 1) {
  const step = plan.sequence[i];
  assert(step.step === i + 1, `practice step ${i + 1} numbering drift`);
  assert(step.type === (i % 2 === 0 ? 'job' : 'people'), `practice step ${i + 1} type drift`);
  assert(Array.isArray(step.fallback_types) && step.fallback_types.length === 0, `practice step ${i + 1} fallback drift`);
}

const model = read(MODEL_PATH);
assert(model.role_scope === 'fagarbeider', 'roleModel scope drift');
assert(JSON.stringify(model.related_people.map((p) => p.id)) === JSON.stringify([
  'rune_arbeidsleder_fagarbeider',
  'amir_erfaren_fagarbeider',
  'selma_kvalitetskontakt_fagarbeider',
  'liv_laerling_fagarbeider'
]), 'professional People foundation drift');
assert(JSON.stringify(model.work_life.workplaces) === JSON.stringify([
  'oppdrags_og_befaringsflate',
  'fag_og_utstyrsplass',
  'kvalitets_og_avvikspunkt',
  'overleverings_og_opplaeringsflate'
]), 'workplace foundation drift');
assert(model.authority_boundary.may.includes('stanse eget arbeid ved relevant risiko'), 'stop-work authority drift');
assert(model.authority_boundary.may_not.includes('arbeide utenfor nødvendig kompetanse'), 'competence boundary drift');
assert(model.authority_boundary.may_not.includes('omgå sikkerhetssperrer eller påkrevde kontrollsteg'), 'safety boundary drift');
assert(model.authority_boundary.may_not.includes('selvgodkjenne alvorlige avvik uten rett kontrollfunksjon'), 'control authority boundary drift');

const grammar = read(GRAMMAR_PATH);
const workLoops = [
  'ordre -> standard -> utførelse -> kontroll -> avvik -> overlevering',
  'feil -> sikring -> diagnose -> tiltak -> kontroll -> læring'
];
assert(JSON.stringify(grammar.work_loops) === JSON.stringify(workLoops), 'Fagarbeider work loops drifted');

const sourceRefs = [
  'data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json#job_fagarbeider_week1_first_inspection',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_rune_oppdrag_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_amir_standard_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_selma_avvik_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_liv_overlevering_001',
  'data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json#fagarbeider_conflict_integritet_early_001',
  'data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json#fagarbeider_conflict_ansvar_intro_001',
  'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#personal_fagarbeider_week1_body_after_first_day'
];
for (const ref of sourceRefs) {
  const [rel, id] = ref.split('#');
  const catalog = read(rel);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert(mails.some((mail) => mail.id === id), `canonical provenance ref missing: ${ref}`);
}

const themeIds = [
  'professional_culture',
  'body_discipline',
  'shame_reputation',
  'loyalty_up_down',
  'local_knowledge_vs_system',
  'invisible_work',
  'status_anxiety',
  'public_private_leakage'
];
const themeBank = read(THEME_BANK_PATH);
const validThemes = new Set((themeBank.themes || []).map((theme) => theme.id));
for (const themeId of themeIds) assert(validThemes.has(themeId), `unknown Role World theme: ${themeId}`);
assert(!themeBank.reference_profiles[KEY], 'Fagarbeider theme profile already exists; refuse duplicate materialization');

const recurringPeopleArchetypes = [
  {
    id: 'rune_arbeidsleder_fagarbeider_world',
    social_function: 'arbeidsleder som fordeler oppdrag, prioriterer tempo og krever tidlig risikosignal uten å eie fagarbeiderens kompetansegrense',
    class_position: 'formell gulvnær leder med prioriteringsmakt',
    status: 'høy situert arbeidslederstatus',
    power_over_player: 'kan prioritere oppdrag og kreve eskalering, men kan ikke gjøre faglig standing til sikkerhetsbypass eller kompetanseutvidelse',
    wants: 'tidlig varsling, realistisk fremdrift og tydelig skille mellom det som kan løses lokalt og det som må løftes',
    conceals: 'at leveringspress kan gjøre en stille snarvei sosialt enklere enn et synlig kapasitetsproblem',
    speech_style: 'kort og oppdragsnær; spør hva som stopper, hva som er sikkert og hva som må eskaleres',
    teaches_player: 'at pålitelighet overfor ledelse bygges ved å gjøre risiko styrbar, ikke ved å absorbere den'
  },
  {
    id: 'amir_erfaren_fagarbeider_world',
    social_function: 'erfaren faglig likemann som bærer taus kunnskap, praktisk status og fristelsen til å gjøre vaner til standard',
    class_position: 'faglig sidestilt kollega med høy uformell autoritet',
    status: 'høy situert fagrespekt',
    power_over_player: 'kan påvirke hva som oppfattes som dyktig og praktisk, men kan ikke legitimere sikkerhetsbrudd eller gi formell godkjenningsmyndighet',
    wants: 'arbeidsflyt som faktisk fungerer, respekt for erfaring og kolleger som kan lese situasjonen uten unødvendig friksjon',
    conceals: 'at en effektiv vane kan overleve lenge etter at grunnlaget for den er borte',
    speech_style: 'praktisk, knapp og erfaringsnær; viser heller enn å forelese',
    teaches_player: 'at taus kunnskap må kunne prøves mot standard og risiko før den fortjener å bli norm'
  },
  {
    id: 'selma_kvalitetskontakt_fagarbeider_world',
    social_function: 'kvalitets- og HMS-kontakt som leser feil, avvik og sikkerhetsgrunnlag med etterprøvingsmakt',
    class_position: 'kontrollfunksjon med avgrenset formell myndighet',
    status: 'høy situert kvalitet- og HMS-tillit',
    power_over_player: 'kan kreve dokumentasjon og riktig kontrollsløyfe, men kan ikke overføre kontrollfunksjonens godkjenningsrett til spilleren',
    wants: 'synlige avvik, ærlig evidens og korrigering som kan rekonstrueres etterpå',
    conceals: 'at kontrollmiljøet lett ser det dokumenterte avviket, men ikke alltid det usynlige forebyggingsarbeidet som hindret flere',
    speech_style: 'presis og konsekvensorientert; spør hva som er observert, sikret, kontrollert og fortsatt åpent',
    teaches_player: 'at kvalitetstanding kommer av sporbar korrigering og riktig myndighetsgrense, ikke feilfri fasade'
  },
  {
    id: 'liv_laerling_fagarbeider_world',
    social_function: 'lærling som trenger at taus kunnskap, sikkerhetsgrense og restarbeid blir forståelig nok til trygg overtakelse',
    class_position: 'lærende juniorposisjon med lav formell status og reelt sikkerhetsbehov',
    status: 'lav formell status, høy betydning som test på overførbar faglighet',
    power_over_player: 'kan kreve forståelig opplæring og si fra om uklarhet, men gir ikke spilleren leder- eller godkjenningsmandat',
    wants: 'forklaringer som kan brukes selvstendig uten å arve skjulte snarveier',
    conceals: 'at respekt for den erfarne kan gjøre det vanskelig å spørre når noe ikke gir mening',
    speech_style: 'konkret og spørrende; ber om hvorfor et grep er trygt, ikke bare hvordan det gjøres',
    teaches_player: 'at faglig autoritet blir sterkere når kunnskapen tåler å bli forklart og kontrollert'
  },
  {
    id: 'neste_skift_fagarbeider_world',
    social_function: 'kollega eller neste skift som må overta arbeid med riktig status, restarbeid, risiko og kontrollpunkt',
    class_position: 'downstream faglig likemann uten tilgang til hele forhistorien',
    status: 'situert overleveringstillit',
    power_over_player: 'kan avsløre uklare overleveringer og returnere arbeid, men kan ikke retroaktivt gi spilleren myndighet den ikke hadde',
    wants: 'presis status, eksplisitt risiko og spor som gjør det mulig å fortsette uten gjetting',
    conceals: 'at muntlig kollegial tillit kan gjøre manglende dokumentasjon usynlig helt til noe svikter',
    speech_style: 'kort og operativ; spør hva som er ferdig, hva som ikke er ferdig og hva som ikke må røres',
    teaches_player: 'at en god overlevering må fungere også når mottakeren ikke deler avsenderens hukommelse'
  },
  {
    id: 'produksjonspress_fagarbeider_world',
    social_function: 'kunde-, produksjons- eller leveransepress som belønner synlig fremdrift raskere enn usynlig kontrollarbeid',
    class_position: 'etterspørselsside med økonomisk og tidsmessig press, men ikke automatisk fagmyndighet',
    status: 'høy påvirkningskraft på tempo, varierende faglig legitimitet',
    power_over_player: 'kan etterspørre levering og prioritering, men kan ikke oppheve kompetanse-, sikkerhets- eller kontrollkrav',
    wants: 'forutsigbar levering, minst mulig stopp og klare svar om tid',
    conceals: 'at kostnaden ved å hoppe over kontroll ofte kommer senere og hos andre',
    speech_style: 'resultat- og tidsorientert; spør når det er ferdig og hva som kan kuttes',
    teaches_player: 'at profesjonell standing ikke er det samme som å gjøre ethvert press fornøyd i øyeblikket'
  },
  {
    id: 'privat_relasjon_fagarbeider_world',
    social_function: 'privat nær relasjon som møter kropp, stillhet og arbeidsidentitet etter en fysisk og normtung arbeidsdag',
    class_position: 'likemann uten arbeidsmyndighet',
    status: 'høy emosjonell betydning uten profesjonell rang',
    power_over_player: 'kan sette grenser for fravær og arbeidslekkasje, men kan ikke løse faglige eller formelle arbeidsproblemer',
    wants: 'nærvær, restitusjon og et menneske som ikke bare måler seg gjennom å tåle mer på jobb',
    conceals: 'at gjentatt taushet eller utslitt tilstedeværelse også blir en sosial konsekvens av arbeidskulturen',
    speech_style: 'hverdagslig og direkte; spør hvordan det faktisk går i stedet for hvor mye som ble produsert',
    teaches_player: 'at faglig stolthet kan være situert til arbeid uten å bli hele personens verdi'
  }
];

const slowAxes = [
  { id: 'leadership_risk_reliability_standing', meaning: 'situert arbeidslederstanding for tidlig risikosignal, realistisk fremdrift og riktig eskalering', runtime_binding: 'editorial_only_until_governed' },
  { id: 'craft_standard_standing', meaning: 'situert fagrespekt for dømmekraft, standard og evne til å skille erfaring fra normalisert snarvei', runtime_binding: 'editorial_only_until_governed' },
  { id: 'quality_hms_traceability_standing', meaning: 'situert kvalitet- og HMS-standing for synlig avvik, sikring og rekonstruerbar korrigering', runtime_binding: 'editorial_only_until_governed' },
  { id: 'teaching_handoff_standing', meaning: 'situert opplæringsstanding for trygg forklaring, teach-back og eksplisitt kompetansegrense', runtime_binding: 'editorial_only_until_governed' },
  { id: 'downstream_reliability_standing', meaning: 'situert overleveringstillit for korrekt status, restarbeid og risiko til neste ledd', runtime_binding: 'editorial_only_until_governed' },
  { id: 'delivery_integrity_standing', meaning: 'situert standing under produksjons- og kundepress for å levere uten å gjøre tempo til overordnet sikkerhetsregel', runtime_binding: 'editorial_only_until_governed' },
  { id: 'private_role_containment_standing', meaning: 'hvor godt fysisk belastning, fagstatus og jobbkonflikt holdes situert uten å spise opp privat relasjon og restitusjon', runtime_binding: 'editorial_only_until_governed' }
];

const audiences = [
  {
    id: 'work_leadership', standing_axis: 'leadership_risk_reliability_standing',
    cares_about: ['tidlig risikosignal og realistisk fremdrift', 'riktig eskalering før et fagproblem blir et leveranseproblem'],
    cannot_grant: 'Arbeidslederstanding kan ikke gi spilleren rett til å arbeide utenfor kompetanse, omgå sikkerhet eller overta formell leder- eller godkjenningsmyndighet.'
  },
  {
    id: 'craft_peers', standing_axis: 'craft_standard_standing',
    cares_about: ['praktisk dømmekraft som tåler standardkontroll', 'kollegial lojalitet uten at snarveier blir skjult norm'],
    cannot_grant: 'Fagrespekt kan ikke gjøre kollegial vane til formell standard eller legitimere arbeid utenfor sikkerhets- og kompetansegrense.'
  },
  {
    id: 'quality_hms', standing_axis: 'quality_hms_traceability_standing',
    cares_about: ['synlige avvik og dokumentert sikring', 'riktig kontrollfunksjon og sporbar korrigering'],
    cannot_grant: 'Kvalitet- og HMS-standing kan ikke gi spilleren rett til å selvgodkjenne alvorlige avvik eller overta kontrollfunksjonens myndighet.'
  },
  {
    id: 'apprentices_learning', standing_axis: 'teaching_handoff_standing',
    cares_about: ['forklaring som gjør taus kunnskap overførbar', 'teach-back og tydelig kompetanse- og risikogrense'],
    cannot_grant: 'Opplæringsstanding kan ikke gjøre mentorfaglighet til personalmyndighet, bemanningsrett eller godkjenning uten mandat.'
  },
  {
    id: 'downstream_handoff', standing_axis: 'downstream_reliability_standing',
    cares_about: ['sann status på ferdig og uferdig arbeid', 'restarbeid, risiko og kontrollpunkt som kan rekonstrueres av neste ledd'],
    cannot_grant: 'Overleveringstillit kan ikke gjøre muntlig kollegial tillit til erstatning for påkrevd kontroll eller formell godkjenning.'
  },
  {
    id: 'production_customer_pressure', standing_axis: 'delivery_integrity_standing',
    cares_about: ['forutsigbar levering og ærlig kapasitetsinformasjon', 'at nødvendig standard og sikkerhet overlever tidspress'],
    cannot_grant: 'Leveransestanding kan ikke gi kunde eller produksjon rett til å oppheve sikkerhetssteg, kompetansekrav eller nødvendig kontroll.'
  },
  {
    id: 'private_relations', standing_axis: 'private_role_containment_standing',
    cares_about: ['restitusjon og faktisk nærvær', 'at faglig status og konflikt ikke blir hele personens private identitet'],
    cannot_grant: 'Privat standing kan ikke løse arbeidsmandat eller gi godkjenning, og profesjonell standing kan ikke brukes som rang i privatlivet.'
  }
];

const dayThemes = [
  'Første befaring skiller det som ser enkelt ut fra det som faktisk må avklares før utførelse.',
  'Amirs erfaringsbaserte snarvei tester om sosial fagrespekt kan skilles fra dokumentert standard og risiko.',
  'En kritisk uklar instruks tvinger spilleren til å gjøre manglende grunnlag synlig fremfor å kjøpe flyt med gjetting.',
  'Unormalt utstyr gjør kompetansegrensen konkret når rask feilsøking frister mer enn sikring og riktig eskalering.',
  'Kunde- eller produksjonspress gjør rask ferdigstillelse sosialt verdifull før kvalitet og sikkerhet er ferdig kontrollert.',
  'Uttrykket godt nok blir en kamp om hvem som får definere faglig standard når ingen enkelt feil ennå ser dramatisk ut.',
  'Selma krever at et avvik bevares som etterprøvbart spor, også når lokal korrigering kunne gjort sluttresultatet pent.',
  'Produksjonsmålet kan nås ved å hoppe over et sikkerhetssteg, og spilleren må gjøre kapasitetskonflikten synlig i stedet.',
  'Skiftbyttet tester om status, restarbeid og risiko er forståelige for noen som ikke deler spillerens hukommelse.',
  'Liv må lære en operasjon som er lett for den erfarne kroppen, men bare trygg når vurderingene kan forklares og prøves tilbake.',
  'Ansvar uten full myndighet blir synlig når andre forventer at fagarbeideren fikser rammen som bare ledelsen kan beslutte.',
  'En senere kontroll vender tilbake til tidligere standardvalg og viser om faglig standing bygger på sporbarhet eller bare godt rykte.',
  'Kropp, stillhet og status begynner å lekke hjem, og privat standing krever at arbeidsrollen kan legges fra seg uten å fornekte belastningen.',
  'Moden faglig autoritet betyr å stå for standard, sikker overlevering og læring uten å gjøre respekt til uformell fullmakt.'
];
const phases = ['morning', 'lunch', 'afternoon', 'evening'];
const phaseText = {
  morning: 'Morgenen etablerer oppdrag, standard og risikobilde før produksjonspresset gjør den raske løsningen sosialt attraktiv.',
  lunch: 'Midt på dagen leser en annen aktør det samme arbeidet gjennom sin egen faglige eller organisatoriske standing, slik at vurderingene kan divergere.',
  afternoon: 'Ettermiddagen krever konkret utførelse, kontroll, avvikshåndtering, eskalering eller overlevering innen myndigheten rollen faktisk har.',
  evening: 'Kvelden viser forsinket, kroppslig eller privat kostnad og skiller faglig stolthet fra personlig verdi og formell authority.'
};
const beatTypes = ['info', 'relationship', 'task', 'decision', 'conversation', 'social', 'consequence', 'private_consequence'];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
    const phase = phases[phaseIndex];
    const absoluteIndex = (day - 1) * phases.length + phaseIndex;
    coverage.push({
      day,
      phase,
      beat_type: beatTypes[absoluteIndex % beatTypes.length],
      summary: `Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseText[phase]} Standing er audience-spesifikk redaksjonell tolkning og kan styrkes hos én gruppe samtidig som den svekkes hos en annen; den kan aldri utvide kompetanse, oppheve sikkerhet, gi kontroll- eller godkjenningsmyndighet eller gjøre en snarvei til formell standard.`,
      materialization_refs: [sourceRefs[absoluteIndex % sourceRefs.length]]
    });
  }
}

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'naeringsliv',
  role_scope: 'fagarbeider',
  title: 'Fagarbeider — standard, taus kunnskap og situert faglig tillit',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Å bygge faglig autoritet gjennom sikkert og etterprøvbart arbeid når tempo, kollegial lojalitet og taus erfaring kan belønne snarveier raskere enn standard, dokumentasjon og lærbarhet.',
    description: 'Role World-en lukker bare situated reputation rundt eksisterende Fagarbeider-praksis. Den etablerte praksisplanen, arbeidsgrammatikken, People-forankringen, arbeidsflatene og authority-grensen beholdes uendret.'
  },
  theme_ids: themeIds,
  social_environments: [
    'Oppdrags- og befaringsflaten der et enkelt utseende kan skjule kritiske forutsetninger som må avklares før arbeid starter.',
    'Fag- og utstyrsplassen der praktisk erfaring, kropp, verktøy og kollegial status gjør forskjellen mellom nyttig taus kunnskap og normalisert snarvei sosialt synlig.',
    'Kvalitets- og avvikspunktet der et godt sluttresultat ikke er nok dersom feilen, sikringen og korrigeringen ikke kan rekonstrueres.',
    'Overleverings- og opplæringsflaten der kunnskap må tåle forklaring, teach-back og eksplisitt restarbeid for å kunne gå trygt videre.',
    'Møtet med arbeidsledelse, produksjon og kunde der tid og levering presser mot standard uten å eie fagarbeiderens sikkerhets- eller kompetansegrense.',
    'Privatlivet der fysisk belastning, stillhet og fagstolthet må kunne være sanne uten at jobben blir hele personens identitet.'
  ],
  recurring_people_archetypes: recurringPeopleArchetypes,
  slow_axes: slowAxes,
  existing_work_continuity: {
    runtime_binding: 'existing_mail_and_work_grammar',
    new_runtime_state: false,
    work_loops: workLoops,
    canonical_surfaces: [
      MODEL_PATH,
      GRAMMAR_PATH,
      PLAN_PATH,
      'data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json',
      'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json',
      'data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json'
    ],
    rule: 'Den eksisterende 20-stegs to-ukers praksisblokken, den senere Fagarbeider-buen og de to canonical work loops forblir authoritative; Role World-en legger bare situert Standing rundt eksisterende scener og skaper ingen ny oppgave-, scene-, work-object- eller rytme-runtime.'
  },
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: 'Standing uttrykker situert tillit hos ulike publikum. Den kan aldri utvide spillerens kompetanse, oppheve sikkerhetskrav, gi formell ledermyndighet eller kontroll-/godkjenningsrett, og kan aldri legitimere skjulte feil eller snarveier.',
    rule: 'Standing er audience-spesifikk og kan divergere mellom arbeidsledelse, fagkolleger, kvalitet/HMS, lærling, neste ledd, produksjons-/kundepress og privatliv uten global sosial score.'
  },
  cross_role_link: {
    status: 'not_required_for_rollout',
    materialized: false,
    new_runtime: false,
    rule: 'Cross-role er ikke nødvendig for denne rollouten. Rune, Amir, Selma og Liv forblir authored professional People-kontakter i Fagarbeiderens canonical work world; ingen governed shared work object med en annen Role World introduseres.'
  },
  season: {
    days: 14,
    day_phases: phases,
    coverage
  },
  primary_threads: [
    { id: 'standard_and_shortcut', beat_refs: ['1/morning', '2/lunch', '6/afternoon', '8/morning', '12/lunch', '14/morning'] },
    { id: 'risk_and_quality_trace', beat_refs: ['3/morning', '4/afternoon', '7/morning', '7/afternoon', '11/lunch', '12/afternoon'] },
    { id: 'authority_without_mandate', beat_refs: ['1/afternoon', '5/lunch', '8/afternoon', '11/morning', '11/afternoon', '14/afternoon'] },
    { id: 'teaching_and_handoff', beat_refs: ['4/lunch', '9/morning', '9/afternoon', '10/lunch', '10/afternoon', '14/lunch'] },
    { id: 'situated_standing_and_private_boundary', beat_refs: ['2/evening', '5/evening', '8/evening', '10/evening', '13/evening', '14/evening'] }
  ],
  private_aftermath: [
    { id: 'kropp_etter_arbeid', beat_refs: ['1/evening', '4/evening'], meaning: 'Fysisk belastning kan erkjennes og restitueres uten at det behandles som svak faglighet.' },
    { id: 'kollegial_lojalitet_hjem', beat_refs: ['2/evening', '6/evening'], meaning: 'Lojalitet til kolleger kan stoppe ved arbeidsdagens slutt uten at spilleren må bære skjulte snarveier som privat moralsk gjeld.' },
    { id: 'avvik_hjem', beat_refs: ['7/evening', '8/evening'], meaning: 'Et synlig avvik er profesjonell informasjon, ikke en total dom over egen verdi.' },
    { id: 'laering_hjem', beat_refs: ['10/evening', '11/evening'], meaning: 'Å ikke kunne forklare alt på første forsøk kan bli grunnlag for læring i stedet for statusforsvar.' },
    { id: 'slutt_hjem', beat_refs: ['13/evening', '14/evening'], meaning: 'Moden faglig standing innebærer å kunne være stolt av arbeidet uten å gjøre tåleevne eller rang på jobb til hele privatidentiteten.' }
  ],
  delayed_consequences: [
    { id: 'inspection_return', setup_ref: '1/morning', return_ref: '6/afternoon', meaning: 'Tidlig avklaring på befaring avgjør senere om godt nok kan diskuteres mot faktisk grunnlag i stedet for vane.' },
    { id: 'shortcut_return', setup_ref: '2/lunch', return_ref: '8/morning', meaning: 'Amirs tidlige snarvei kommer tilbake når produksjonspress gjør samme vane dyrere og mer risikofylt.' },
    { id: 'equipment_return', setup_ref: '4/afternoon', return_ref: '12/lunch', meaning: 'Valget om å sikre og eskalere unormalt utstyr avgjør senere om kontrollsporet tåler etterprøving.' },
    { id: 'deviation_return', setup_ref: '7/afternoon', return_ref: '12/afternoon', meaning: 'Selmas krav om sporbar korrigering avgjør om den senere kvalitetssamtalen handler om læring eller forsvar.' },
    { id: 'handoff_return', setup_ref: '9/morning', return_ref: '14/lunch', meaning: 'Tidlig overleveringspraksis kommer tilbake når noen andre må stole på status uten å ha vært til stede.' },
    { id: 'teaching_return', setup_ref: '10/lunch', return_ref: '14/afternoon', meaning: 'Livs teach-back viser om spillerens faglige autoritet faktisk er overførbar uten at mentorstatus glir over i formell myndighet.' }
  ],
  employment_conditions: [
    'Fagarbeid forutsetter faktisk stilling, oppdrag, kompetanse og relevante sikkerhetsforutsetninger; Badge-poeng alene gir ingen jobb eller myndighet.',
    'Arbeidstid, bemanning, utstyrsansvar, sikkerhetskrav og kontrollfunksjoner er rolle-eid redaksjonelt stoff og ikke nye globale runtimefelt.',
    'Utvidet leder-, kontroll- eller godkjenningsmyndighet krever faktisk delegasjon og kan ikke materialiseres gjennom faglig omdømme eller kollegial respekt.'
  ],
  professional_culture: [
    'God fagkultur gjør standard, risiko og korrigering diskuterbar også når en erfaren kollega allerede har en løsning som pleier å fungere.',
    'Kollegial lojalitet beskytter mennesker bedre når avvik og kompetansegrenser kan sies høyt uten at det automatisk leses som illojalitet.',
    'Taus kunnskap blir sterkere, ikke svakere, når den kan forklares, læres bort og etterprøves uten å late som alle situasjoner er identiske.'
  ],
  materialization: {
    authored_dimensions: ['situated_reputation'],
    no_new_runtime: true,
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    cross_role_link_materialized: false,
    source_refs: sourceRefs
  }
};

write(WORLD_PATH, world);

const index = read(INDEX_PATH);
assert(!index.roles.some((entry) => entry.category === 'naeringsliv' && entry.role_scope === 'fagarbeider'), 'Fagarbeider already registered in Role World index');
index.roles.push({ category: 'naeringsliv', role_scope: 'fagarbeider', status: 'role_world_complete', path: WORLD_PATH });
index.status = `${index.roles.length}_role_worlds_materialized`;
write(INDEX_PATH, index);

const checklist = read(CHECKLIST_PATH);
assert(!checklist.reference_worlds.includes(WORLD_PATH), 'Fagarbeider already present in authoring checklist');
checklist.reference_worlds.push(WORLD_PATH);
write(CHECKLIST_PATH, checklist);

themeBank.reference_profiles[KEY] = themeIds;
write(THEME_BANK_PATH, themeBank);

for (const [rel, beforeHash] of Object.entries(protectedHashes)) {
  assert(sha(rel) === beforeHash, `${rel} changed during Role World materialization`);
}

console.log(JSON.stringify({
  role_world: WORLD_PATH,
  index_status: index.status,
  source_refs: sourceRefs.length,
  days: world.season.days,
  beats: world.season.coverage.length,
  audiences: world.situated_reputation_model.audiences.length,
  protected_surfaces_unchanged: Object.keys(protectedHashes)
}, null, 2));
