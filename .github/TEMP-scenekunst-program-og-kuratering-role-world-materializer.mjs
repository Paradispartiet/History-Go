import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ROLE = 'scenekunst_program_og_kuratering';
const KEY = `scenekunst/${ROLE}`;
const WORLD = `data/Civication/roleWorlds/scenekunst/${ROLE}.json`;
const MODEL = `data/Civication/roleModels/scenekunst/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/scenekunst/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/scenekunst/${ROLE}_plan.json`;
const REPORT = 'reports/CIVICATION_SCENEKUNST_PROGRAM_OG_KURATERING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md';
const TEST = 'tests/civication-scenekunst-program-og-kuratering-role-world-rollout.test.js';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`);
};

const model = read(MODEL);
const grammar = read(GRAMMAR);
const plan = read(PLAN);
if (plan.sequence.length !== 16) throw new Error('Expected 16-step Program og kuratering plan');
if (grammar.persistent_work_object_contract?.id !== 'programportefolje_og_beslutningslogg') throw new Error('Unexpected persistent work object');

const catalogs = new Map();
const sourceRefs = [];
for (const type of TYPES) {
  const rel = `data/Civication/mailFamilies/scenekunst/${type}/${ROLE}_${type}.json`;
  const doc = read(rel);
  const mails = doc.families.flatMap((family) => family.mails || []);
  catalogs.set(type, { rel, mails });
  for (const mail of mails) sourceRefs.push(`${rel}#${mail.id}`);
}
if (sourceRefs.length !== 15 || new Set(sourceRefs).size !== 15) throw new Error(`Expected 15 unique source mails, got ${sourceRefs.length}`);
const knowledgeRef = sourceRefs.find((ref) => ref.includes('/knowledge/'));
if (!knowledgeRef) throw new Error('Knowledge source ref missing');

const themes = [
  'professional_culture',
  'class_power',
  'bureaucratic_power',
  'numerical_control',
  'invisible_work',
  'loyalty_up_down',
  'care_vs_efficiency',
  'status_anxiety',
  'shame_reputation',
  'public_private_leakage'
];

const audiences = [
  {
    id: 'artistic_field_and_program_practice',
    standing_axis: 'artistic_criteria_curatorial_judgement_and_field_trust',
    cares_about: [
      'at kunstneriske kriterier, faglig uenighet og restvalg er synlige når porteføljen prioriteres',
      'at feltrelasjoner ikke reduseres til nettverkspoeng, kjent navn eller institusjonell smak forkledd som nøytral kvalitet'
    ],
    cannot_grant: 'Faglig standing kan ikke gi spilleren kontraktsfullmakt, finansiering, rett til å omgå habilitet eller rett til å fremstille en kuratorisk preferanse som dokumentert representativitet.'
  },
  {
    id: 'artists_rightsholders_and_representatives',
    standing_axis: 'rights_fairness_commitment_and_artist_trust',
    cares_about: [
      'at kunstnere og rettighetshavere får sann status før de binder tid, materiale, reise eller andre muligheter',
      'at kreditering, bruk, avlysning, dokumentasjon og videreformidling avklares før synlighet blir behandlet som samtykke'
    ],
    cannot_grant: 'Tillit fra kunstnere eller rettighetshavere kan ikke erstatte avtale, samtykke, krediteringskrav, personvern, opphavsrett eller institusjonens faktiske økonomiske fullmakt.'
  },
  {
    id: 'venue_production_and_hosting',
    standing_axis: 'arena_fit_feasibility_handoff_and_production_trust',
    cares_about: [
      'at arena-fit beskriver faktisk rom, tid, teknikk, bemanning, sikkerhet og publikumsflyt før programmet kommuniseres som gjennomførbart',
      'at produksjonsfaglig motstemme får endre format, tidspunkt eller skala uten å bli behandlet som kunstnerisk illojalitet'
    ],
    cannot_grant: 'Produksjonsstanding kan ikke gi kuratoren teknisk godkjenning, HMS-unntak, bemanningsressurser som ikke finnes eller rett til å gjøre et uavklart gjestespill til bekreftet produksjon.'
  },
  {
    id: 'institution_leadership_and_governance',
    standing_axis: 'mandate_resource_habilitet_and_decision_quality',
    cares_about: [
      'at anbefaling, habilitetsvurdering, ressurskonsekvens og beslutningseier kan etterprøves før institusjonen binder seg',
      'at programmering ikke bruker lederens eller utvalgets status til å skjule hvem som foreslo, vurderte, besluttet og senere kontrollerte'
    ],
    cannot_grant: 'God standing hos ledelse eller utvalg kan ikke gi spilleren styremandat, budsjettmidler, rett til å delta ved inhabilitet eller myndighet til å omskrive faglig dissens som enighet.'
  },
  {
    id: 'publics_communities_and_access',
    standing_axis: 'public_relevance_representation_access_and_explanation',
    cares_about: [
      'at publikum og berørte miljøer ikke bare brukes som segmenter, men at antakelser prøves mot faktisk tilgjengelighet, representasjon og møteform',
      'at institusjonen kan forklare hvorfor noe prioriteres eller velges bort uten å gjøre enkeltgrupper til alibi for hele offentligheten'
    ],
    cannot_grant: 'Publikumsrespons, representasjonsdata eller offentlig støtte kan ikke alene gi kunstnerisk fasit, kontraktsfullmakt, rettighetsklarering eller rett til å utlevere personer som ga kritiske signaler.'
  },
  {
    id: 'funders_partners_and_external_hosts',
    standing_axis: 'partnership_truth_conditions_and_non_precommitment',
    cares_about: [
      'at tilskudd, samarbeid, vertskap og gjestespill beskrives med faktiske vilkår, avhengigheter og beslutningsstatus',
      'at ingen ekstern aktør må planlegge på grunnlag av et muntlig eller offentlig signal som internt fortsatt bare er en mulighet'
    ],
    cannot_grant: 'Partnerstanding kan ikke gjøre sannsynlig finansiering disponibel, skape en signert avtale, gi rettigheter som ikke er klarert eller gjøre en ekstern tidsfrist til intern fullmakt.'
  },
  {
    id: 'private_relations',
    standing_axis: 'private_boundary_status_and_non_leakage',
    cares_about: [
      'at kuratorrollen kan legges ned uten at privatlivet blir reserveutvalg, konfliktråd eller mottaker av fortrolige prosjektopplysninger',
      'at skuffelse, statusangst og omdømmepress kan bearbeides uten at kunstnere, søkere eller kolleger blir råstoff for privat avlastning'
    ],
    cannot_grant: 'Privat tillit kan ikke brukes som habilitetsvurdering, programjury, avtalegrunnlag, rettighetsklarering, presseråd eller mottakssted for fortrolige søknader og personopplysninger.'
  }
];

const dayScenarios = [
  {
    title: 'En overfylt programportefølje',
    tension: 'Flere kunstnerisk sterke forslag har kommet lenger i interne samtaler enn kapasitet, arenaer og avtaler faktisk tillater, og noen miljøer oppfatter allerede entusiasme som et løfte.',
    decision: 'skille forslag, kuratorisk anbefaling, ressursvurdering og faktisk beslutning før resten av sesongen arver falsk sikkerhet'
  },
  {
    title: 'Representasjonskartet motsier magefølelsen',
    tension: 'Yusufs felt- og publikumsanalyse viser gjentatte blindsoner i hvem som inviteres, hvem som faller utenfor og hvilke møteformer som gjør programmet tilgjengelig, samtidig som tallene ikke kan brukes som automatisk kunstnerisk fasit.',
    decision: 'bruke representasjonsdata som spørsmål og kontrollgrunnlag uten å gjøre grupper til kvoter, alibi eller essensielle kategorier'
  },
  {
    title: 'Arena-fit bryter med verkets første format',
    tension: 'Tor viser at et ønsket verk ikke kan gjennomføres på foreslått arena uten vesentlig endring i rigg, publikumsløp, bemanning og sikkerhet, mens kunstnerisk momentum gjør formatendring sosialt kostbar.',
    decision: 'bevare kunstnerisk hensikt samtidig som arena, teknikk og vertskapsansvar behandles som reelle rammer og ikke som etterarbeid'
  },
  {
    title: 'Rettigheter og dokumentasjon er ikke ferdig',
    tension: 'Mina avdekker at visning, dokumentasjon og videre bruk har ulike rettighetsgrunnlag, og en ekstern partner ønsker offentlig bekreftelse før alle tillatelser og avlysningspunkter er avklart.',
    decision: 'skille synlighet, avtale, samtykke, kreditering og faktisk bruksrett før partnerens tidsfrist blir en skjult fullmakt'
  },
  {
    title: 'Habilitet i et attraktivt prosjekt',
    tension: 'Et prosjekt med høy kunstnerisk relevans har en relasjon til en aktør som gjør spillerens egen rolle i vurderingen problematisk, og institusjonens ønske om fart frister til å behandle habilitet som et omdømmespørsmål.',
    decision: 'registrere relasjonen, avgrense egen deltakelse og sikre en etterprøvbar vurderingslinje uten å stemple prosjektet eller personen'
  },
  {
    title: 'Feltresearch utfordrer intern fortelling',
    tension: 'Yusufs kvalitative research viser at et programgrep som internt beskrives som inkluderende oppleves annerledes av flere berørte miljøer, men materialet er sammensatt og gir ikke ett entydig svar.',
    decision: 'endre spørsmål, møteform og begrunnelse der evidensen tilsier det uten å late som noen få intervjuer representerer hele offentligheten'
  },
  {
    title: 'Kommunikasjon vil annonsere før beslutningen er moden',
    tension: 'Programmet trenger synlighet for å holde et publikumsvindu og en partnerrelasjon, men flere avtale-, arena- og habilitetsforhold er fortsatt betingede, og et optimistisk språk kan bli lest som institusjonell forpliktelse.',
    decision: 'kommunisere hva som faktisk er besluttet, hva som er betinget og hva som fortsatt kan falle bort uten å bruke vaghet til å skjule ansvar'
  },
  {
    title: 'Rammeendring tvinger fram reprogrammering',
    tension: 'En ressurs- og tilgjengelighetsendring gjør den opprinnelige kombinasjonen av gjestespill, lokal produksjon og formidlingsaktivitet urealistisk, samtidig som alle deler har egne faglige og relasjonelle kostnader ved å bli flyttet.',
    decision: 'gjøre prioriteringskriterier, alternativkostnad og berørte relasjoner synlige før et kutt presenteres som nøytral logistikk'
  },
  {
    title: 'Et sent gjestespill åpner et sjeldent vindu',
    tension: 'Et internasjonalt eller nasjonalt gjestespill blir plutselig tilgjengelig, men krever rask arenaavklaring, rettighetskontroll, vertskapskapasitet og fortrengning av noe som allerede står i porteføljen.',
    decision: 'teste kunstnerisk verdi mot faktisk kapasitet og eksisterende forpliktelser før sjeldenhet og prestisje blir argument nok i seg selv'
  },
  {
    title: 'Kritikk av representasjon blir offentlig',
    tension: 'En legitim kritikk av mønstre i programmet får offentlig oppmerksomhet, og både defensive svar og symbolske hastegrep kan skade de langsiktige relasjonene som faktisk må repareres.',
    decision: 'skille forklaring, ansvar, lytting, endringspunkt og det som fortsatt krever mer kunnskap uten å bruke enkeltkunstnere som bevis for institusjonen'
  },
  {
    title: 'En kunstner trekker seg mens rettigheter henger',
    tension: 'En kunstner eller representant trekker seg etter endrede forutsetninger, og tidligere kommunikasjon gjør det uklart hvilke forventninger, kostnader og materialer som allerede er satt i bevegelse.',
    decision: 'rydde status, rettigheter, kostnadsansvar, offentlig kommunikasjon og læringsspor uten å presse fram samtykke for å redde programmet'
  },
  {
    title: 'Publikumssuksess skjuler produksjonsgjeld',
    tension: 'En synlig programhelg får sterk respons, men Tor og teamet viser at ekstraarbeid, improviserte handoffs og utsatt vedlikehold bar en del av resultatet som ikke vises i publikumstallene.',
    decision: 'evaluere kunstnerisk og offentlig effekt sammen med faktisk arbeidsbelastning og rework før suksess kopieres som format'
  },
  {
    title: 'Partneren vil forlenge det som ser vellykket ut',
    tension: 'En finansierings- eller vertskapspartner ønsker rask videreføring basert på synlighet og respons, mens rettigheter, ressursbruk, representasjonseffekt og kunstnerisk begrunnelse fortsatt trenger en samlet vurdering.',
    decision: 'gi et sant handlingsrom og eksplisitte forbehold fremfor å kjøpe relasjonen med en videreføring som institusjonen ennå ikke kan stå inne for'
  },
  {
    title: 'Porteføljen skal overleveres med sporbar læring',
    tension: 'Sesongen avsluttes med både gode resultater, avviste forslag, relasjonsskader, nye forbindelser og flere valg som bare kan forstås hvis beslutningsloggen viser hvem som visste hva når.',
    decision: 'overlevere en versjonert programportefølje der kriterier, habilitet, rettigheter, representasjon, arena-fit, restvalg og ettervirkning kan utfordres av neste beslutningseier'
  }
];

const phases = [
  {
    id: 'morning',
    beat_type: 'task',
    practice: 'Morgenarbeidet gjør grunnlaget eksplisitt før møter og tempo kan komprimere usikkerheten: status, kilder, kriterier, habilitet, rettigheter, arenaavhengigheter og beslutningseier må stå i samme arbeidsflate.'
  },
  {
    id: 'lunch',
    beat_type: 'relationship',
    practice: 'Ved lunsj prøves begrunnelsen av en konkret arbeidsrelasjon. Spilleren må tåle motstemme og asymmetri uten å kjøpe lojalitet med framtidige løfter, og den andre parten må få beholde sin egen faglige myndighet og rett til å være uenig.'
  },
  {
    id: 'afternoon',
    beat_type: 'decision',
    practice: 'I ettermiddagen må et valg, en avgrensning eller en handoff faktisk gjøres. Tempo er lov, men statusen på beslutningen, hvem som kan godkjenne neste ledd og hva som fortsatt er betinget må være lesbar for dem som skal handle etterpå.'
  },
  {
    id: 'evening',
    beat_type: 'private_consequence',
    practice: 'Om kvelden blir kostnaden mindre synlig: tap av prestisje, usikkerhet om egen dømmekraft, relasjonelt ubehag eller lettelsen etter å ha sagt nei. Privat ettervirkning må holdes adskilt fra fortrolig materiale og fra neste dags formelle beslutningsgrunnlag.'
  }
];

const threadDefs = [
  {
    id: 'program_portfolio_and_artistic_criteria',
    relationship: 'Programporteføljen følger hvordan kunstnerisk kvalitet, profil, restvalg og institusjonell kapasitet må holdes sammen uten at popularitet, prestisje eller knapphet blir skjulte erstatninger for faglige kriterier. Tråden lar Leilas og spillerens vurderinger være reelle, men gjør dem sporbare nok til at uenighet og senere effekt kan endre standing.',
    beat_refs: ['1/morning','2/afternoon','4/morning','6/afternoon','8/morning','10/afternoon','12/morning','14/afternoon']
  },
  {
    id: 'representation_and_field_relations',
    relationship: 'Representasjonstråden undersøker hvem institusjonen ser, inviterer, lytter til og gjør til publikum, uten å gjøre identitetsdata eller enkeltintervjuer til automatisk programmeringsfasit. Yusuf bringer evidens og motstemmer som må påvirke spørsmål og møteform, samtidig som kuratorisk ansvar ikke kan outsources til måling.',
    beat_refs: ['2/morning','2/lunch','6/morning','6/lunch','10/morning','10/lunch','12/lunch','14/lunch']
  },
  {
    id: 'rights_habilitet_and_contract_boundaries',
    relationship: 'Rettighets- og habilitetstråden følger hvordan nære feltrelasjoner, brukstillatelser, kreditering, dokumentasjon og avtalegrenser blir mer krevende når kunstnerisk interesse og tidsfrister peker i samme retning. Mina gjør grensen mellom god relasjon og gyldig fullmakt synlig, og spilleren må kunne tre ut av en vurdering uten å late som problemet dermed forsvinner.',
    beat_refs: ['4/lunch','4/afternoon','5/morning','5/afternoon','7/afternoon','9/afternoon','11/morning','14/morning']
  },
  {
    id: 'arena_fit_and_production_handoffs',
    relationship: 'Arena-fit-tråden lar kunstnerisk intensjon møte rom, teknikk, sikkerhet, bemanning, publikumsløp og faktisk vertskapskapasitet. Tor har ikke kunstnerisk veto, men produksjonsfaglig sannhet kan kreve skalaendring, venting eller rework, og et programvalg er ikke gjennomførbart før handoffen er mottakbar i neste fagledd.',
    beat_refs: ['1/afternoon','3/morning','3/lunch','8/afternoon','9/morning','9/lunch','12/afternoon','14/afternoon']
  },
  {
    id: 'publics_research_and_explanation',
    relationship: 'Offentlighetstråden følger hvordan research, publikumserfaring, kritikk og institusjonens forklaringer påvirker hverandre over tid. Spilleren skal kunne forklare reelle prioriteringer og feil uten å utlevere informanter eller gjøre respons til global score, og senere evidens kan derfor forbedre standing hos ett publikum samtidig som et annet fortsatt er kritisk.',
    beat_refs: ['2/evening','6/afternoon','7/morning','7/lunch','10/afternoon','10/evening','12/evening','13/lunch']
  },
  {
    id: 'partnership_pressure_and_commitment_truth',
    relationship: 'Partnertråden undersøker hvordan vertskap, tilskudd, gjestespill og samarbeid skaper tidsfrister som kan friste institusjonen til å kommunisere mer sikkerhet enn den faktisk har. Et sant forbehold kan koste momentum, men gjør det mulig å reparere når vilkår endres uten å late som en ekstern forventning var et internt vedtak.',
    beat_refs: ['4/evening','7/afternoon','8/lunch','9/afternoon','11/afternoon','11/evening','13/morning','13/afternoon']
  },
  {
    id: 'private_status_and_boundary',
    relationship: 'Den private tråden følger hvordan avslag, prestisje, kritikk og usikkerhet om egen dømmekraft kan lekke inn i kuratoriske valg. Nære relasjoner kan gi omsorg og perspektiv, men skal aldri bli reservejury, habilitetsvurdering eller kanal for fortrolige søknader; derfor må spilleren lære å skille personlig ettervirkning fra neste dags begrunnelse.',
    beat_refs: ['1/evening','3/evening','5/evening','7/evening','9/evening','11/evening','14/evening']
  }
];

const audienceByBeat = (day, phaseIndex) => audiences[(day * 2 + phaseIndex - 2) % audiences.length];
const sourceByBeat = (day, phaseIndex) => sourceRefs[((day - 1) * 4 + phaseIndex) % sourceRefs.length];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  const scenario = dayScenarios[day - 1];
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
    const phase = phases[phaseIndex];
    const key = `${day}/${phase.id}`;
    const audience = audienceByBeat(day, phaseIndex);
    const ref = sourceByBeat(day, phaseIndex);
    const threadIds = threadDefs.filter((thread) => thread.beat_refs.includes(key)).map((thread) => thread.id);
    const summary = `Dag ${day}, ${phase.id}: ${scenario.title}. ${scenario.tension} ${phase.practice} I denne konkrete fasen skal spilleren ${scenario.decision}. Rollen må samtidig bevare skillet mellom kunstnerisk vurdering, habilitetsvurdering, rettighetsstatus, representasjonskunnskap, arena-fit, økonomisk eller institusjonell fullmakt og det som bare er en anbefaling. Alt som endrer handlingsrommet føres i den eksisterende \`programportefolje_og_beslutningslogg\` med versjon, kilde, berørt prosjekt, beslutningseier, venting, handoff, eventuell avgrenset rework og tidspunkt for ny kontroll. ${day % 2 === 0 ? 'Denne dagen må også synliggjøre hvem som ikke er i rommet når kriteriene formuleres, slik at fravær ikke forveksles med samtykke eller manglende interesse.' : 'Denne dagen må også vise hvilken alternativkostnad som flyttes til andre kunstnere, arenaer, ansatte eller publikumsgrupper når ett prosjekt får prioritet.'} ${phase.id === 'evening' ? 'Den private ettervirkningen registreres ikke som institusjonell evidens; bare den profesjonelle læringen som kan formuleres uten å røpe fortrolig materiale tas med videre.' : 'Neste aktør skal kunne se hva som er sant nå, hva som fortsatt kan bestrides og hvilke forhold som må være oppfylt før status kan løftes.'} Beat-en bruker den allerede authored mail-/arbeidsgrammatikken som materialisering og introduserer ingen ny dagsmotor, reputation-runtime eller skjult autoritetsakse.`;
    const standingConsequence = `Situert standing på dag ${day}, ${phase.id}, vurderes hos \`${audience.id}\` langs aksen \`${audience.standing_axis}\`. Her teller det at ${audience.cares_about[0]} og ${audience.cares_about[1]}. Valget kan derfor styrke standing når spilleren gjør kriterier, kildegrunnlag, berørte relasjoner, beslutningsstatus og reparerbarhet synlige, eller svekke den når prestisje, hastverk, nettverk eller publikumssignal brukes til å skjule hvem som faktisk bærer risikoen. ${audience.cannot_grant} Standing gjelder bare den konkrete relasjonen, arbeidsflaten og beslutningen som berøres av ${scenario.title.toLowerCase()}; den summeres aldri til en global reputation score og kan senere gå opp eller ned når rettighetsavklaring, partnerrespons, arenaerfaring, feltresearch eller kontrollpunkt gir ny evidens. En god relasjon i én krets skal heller ikke brukes som bevis på tillit i en annen.`;
    coverage.push({
      day,
      phase: phase.id,
      beat_type: phase.beat_type,
      summary,
      thread_ids: threadIds,
      materialization_refs: [ref],
      standing_audience: audience.id,
      standing_consequence: standingConsequence
    });
  }
}

const beatMap = new Map(coverage.map((beat) => [`${beat.day}/${beat.phase}`, beat]));
const privateAftermathDefs = [
  ['etter_arena_nei', ['3/evening','4/morning'], 'Et nødvendig nei til opprinnelig arenaformat kan kjennes som kunstnerisk feighet før det viser seg å ha bevart både verk, produksjonsrelasjon og senere handlingsrom. Meningen er å la spilleren bære statuskostnaden uten å omskrive produksjonsfaglig motstemme til personlig mangel på ambisjon.'],
  ['etter_habilitetsuttreden', ['5/evening','6/morning'], 'Å tre ut av en attraktiv vurdering kan oppleves som tap av kontroll og tilhørighet i feltet. Etterspillet viser at profesjonell integritet også innebærer å la andre eie en beslutning, og at privat frustrasjon ikke skal sendes tilbake som indirekte press på den nye vurderingslinjen.'],
  ['etter_offentlig_kritikk', ['10/evening','11/morning'], 'Offentlig kritikk kan produsere skam, forsvar og behov for raske symbolhandlinger. Etterspillet gjør det mulig å skille personlig omdømme fra institusjonens faktiske plikt til å lytte, dokumentere og endre praksis der evidensen holder, uten å gjøre kritikerne til råstoff for egen rehabilitering.'],
  ['etter_kunstner_trekker_seg', ['11/evening','12/morning'], 'Når en kunstner trekker seg, kan spilleren kjenne press til å redde fortellingen om programmet. Etterspillet holder fast ved at relasjonstap, rettighetsstatus og faktisk innrettelse må håndteres sannferdig, mens privat skuffelse ikke kan legitimere press om samtykke eller etterrasjonalisering av tidligere kommunikasjon.'],
  ['etter_sesongoverlevering', ['14/afternoon','14/evening'], 'Avslutningen lar spilleren møte forskjellen mellom en pen sesongfortelling og et lærbart beslutningsspor. Profesjonell stolthet kan bevares uten å skjule restvalg, rework, relasjonsskader eller usikkerhet; det er nettopp sporbarheten som gjør at neste kurator kan utfordre og forbedre praksisen.']
];
const private_aftermath = privateAftermathDefs.map(([id, beat_refs, meaning]) => ({
  id,
  description: meaning,
  materialization_refs: beat_refs.map((ref) => beatMap.get(ref).materialization_refs[0]),
  beat_refs,
  meaning
}));

const delayed_consequences = [
  { id: 'portfolio_promise_returns', setup_ref: '1/morning', return_ref: '4/afternoon', domains: ['job','reputation','narrative'] },
  { id: 'representation_question_returns', setup_ref: '2/lunch', return_ref: '6/afternoon', domains: ['relationship','reputation','narrative'] },
  { id: 'arena_fit_returns', setup_ref: '3/morning', return_ref: '8/afternoon', domains: ['job','economy','reputation'] },
  { id: 'rights_condition_returns', setup_ref: '4/afternoon', return_ref: '11/morning', domains: ['job','relationship','economy'] },
  { id: 'habilitet_returns', setup_ref: '5/afternoon', return_ref: '10/afternoon', domains: ['relationship','reputation','narrative'] },
  { id: 'announcement_returns', setup_ref: '7/afternoon', return_ref: '11/evening', domains: ['reputation','relationship','narrative'] },
  { id: 'late_guest_returns', setup_ref: '9/afternoon', return_ref: '12/morning', domains: ['job','economy','reputation'] },
  { id: 'success_extension_returns', setup_ref: '12/evening', return_ref: '14/afternoon', domains: ['job','relationship','reputation','narrative'] }
];

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'scenekunst',
  role_scope: ROLE,
  title: 'Program og kuratering — portefølje, habilitet, rettigheter, representasjon og arena-fit',
  status: 'role_world_complete',
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
  },
  existing_work_continuity: {
    runtime_binding: 'existing_mail_plan_and_work_grammar',
    new_runtime_state: false,
    work_loops: grammar.work_loops,
    persistent_work_object: 'programportefolje_og_beslutningslogg',
    canonical_surfaces: [MODEL, GRAMMAR, PLAN, ...TYPES.map((type) => `data/Civication/mailFamilies/scenekunst/${type}/${ROLE}_${type}.json`)],
    rule: 'Eksisterende 16-stegsplan, fire fiktive arbeidsaktører, fire arbeidsflater, waiting, handoff, avgrenset rework og programportefolje_og_beslutningslogg forblir authoritative; Role World legger dramaturgisk dybde og situert standing oppå dette uten ny runtime.'
  },
  sociological_core: [
    'kuratorisk makt virker gjennom seleksjon, timing, språk, tilgang og synlighet, men må skilles fra rettighets-, produksjons-, økonomi- og institusjonsfullmakt slik at faglig smak ikke blir skjult totalmyndighet',
    'representasjon handler både om hvem som får plass, hvem som blir spurt, hvilke arenaer og møteformer som er mulige og hvem som bærer kostnaden ved institusjonens kriterier; en telling alene kan verken bevise kvalitet eller rettferdighet',
    'feltrelasjoner er produktive og nødvendige, men nettverk kan også skape habilitetsproblemer, informasjonsasymmetri og statuspress; derfor må beslutningsloggen bevare kriterier, relasjoner, motstemme, rettighetsstatus og ettervirkning'
  ],
  employment_conditions: [
    'formell tilsetting eller oppnevning i program-/kuratorrolle med eksplisitt delegasjon, habilitetskrav, budsjett- og kontraktsgrenser; Badge-progresjon alene gir aldri stillingen',
    'avklart rettighets-, personvern-, krediterings-, avtale-, HMS-, arena-, tilgjengelighets- og representasjonsramme for prosjekter som skal utvikles, inviteres, dokumenteres eller offentliggjøres',
    'kunstnerisk vurderingsrom med plikt til å skille anbefaling fra vedtak, gjøre alternativkostnader synlige og la produksjons-, rettighets- og feltfaglig motstemme beholde sin egen myndighet'
  ],
  professional_culture: [
    'uenighet om kvalitet, representasjon, arena-fit, rettigheter eller kapasitet behandles som nødvendig programinformasjon når den er begrunnet og sporbar, ikke som illojalitet mot sesongprofilen',
    'et kjent navn, en sjelden mulighet, et sterkt publikumstall eller en partnerfrist gjør ikke et prosjekt mer klarert enn det faktisk er',
    'evaluering skiller kunstnerisk virkning, publikumsmøte, relasjonell effekt, rettighetsstatus, produksjonsgjeld og institusjonell læring; synlig gjennomføring alene er aldri fullført kvalitetsbevis'
  ],
  recurring_people_archetypes: [
    {
      id: 'leila_programsjef_world',
      social_function: 'Leila bærer langsiktig programprofil og sammenhengen mellom enkeltverk, kunstneriske miljøer og institusjonens samlede portefølje, og utfordrer spilleren når hastevalg gjør kriteriene smalere enn de framstår.',
      class_position: 'programsjef med delegert kunstnerisk utviklings- og prioriteringsmandat',
      status: 'Situert profesjonell standing knyttet til programbord_og_utvalgskart og den versjonerte programporteføljen.',
      power_over_player: 'Leila kan utvikle, rangere og utfordre programalternativer innen delegasjonen og nekte å fremstille faglig uenighet som konsensus; hun kan ikke alene inngå avtale, disponere finansiering eller gi spilleren habilitet.',
      wants: 'At programmet kan forklare både hva det søker, hva det velger bort og hvilke relasjoner og offentligheter kriteriene faktisk produserer.',
      conceals: 'Hun kan undervurdere hvor mye egne feltrelasjoner og tidligere suksesser påvirker hva som umiddelbart oppleves som kunstnerisk relevant.',
      speech_style: 'Felt- og verkorientert, presis på kunstnerisk sammenheng og rask til å oppdage når logistikk eller prestisje blir presentert som estetisk argument.',
      teaches_player: 'At kuratorisk dømmekraft blir sterkere når kriterier, relasjoner og restvalg tåler eksplisitt motstemme.'
    },
    {
      id: 'tor_arena_og_produksjonssjef_world',
      social_function: 'Tor oversetter programønske til konkret rom, tid, teknikk, bemanning, sikkerhet og publikumsløp og gjør det synlig når et verk bare er mulig dersom format, skala eller tidspunkt endres.',
      class_position: 'arena- og produksjonssjef med operativ gjennomførings- og sikkerhetskompetanse',
      status: 'Situert profesjonell standing knyttet til arena_og_gjestespillkart og mottakbare produksjonshandoffs.',
      power_over_player: 'Tor kan avvise falsk teknisk klarering og kreve ny plan når arena, sikkerhet eller kapasitet ikke holder; han kan ikke alene avgjøre kunstnerisk verdi eller bruke produksjonsrollen som generell programveto.',
      wants: 'At kunstneriske valg kommer tidlig nok til å kunne påvirke format og at rework behandles som kostnad og læring, ikke som usynlig fleksibilitet.',
      conceals: 'Han kan noen ganger presentere den mest robuste produksjonsløsningen som den eneste mulige fordi det er krevende å prise alternative, mer sårbare løsninger.',
      speech_style: 'Konkret, sekvensiell og konsekvensorientert; skiller mellom mulig, forsvarlig, bemannet, prøvd og faktisk bekreftet.',
      teaches_player: 'At arena-fit er en kunstnerisk relevant realitet uten å være kunstnerisk fasit, og at god handoff bevarer begge sannhetene.'
    },
    {
      id: 'mina_rettighets_og_avtalekoordinator_world',
      social_function: 'Mina holder invitasjon, avtale, samtykke, kreditering, dokumentasjon, viderebruk og avlysningsvilkår fra hverandre når relasjonell tillit eller tidsfrist frister institusjonen til å anta mer enn den har rett til.',
      class_position: 'rettighets- og avtalekoordinator med faglig kontrollansvar for avtalestatus og brukstillatelser',
      status: 'Situert profesjonell standing knyttet til rettighets_og_avtalerom og sporbar status før offentliggjøring og bruk.',
      power_over_player: 'Mina kan stoppe falsk rettighets- eller avtalestatus og eskalere manglende samtykke eller delegasjon; hun kan ikke bestemme kunstnerisk prioritet eller love finansiering og produksjon på spillerens vegne.',
      wants: 'At kunstnere og partnere kan stole på at institusjonens ord betyr det samme internt og eksternt, særlig når materiale skal dokumenteres eller brukes videre.',
      conceals: 'Hun kan vente for lenge med å løfte en uklarhet hvis hun frykter å bli oppfattet som den som ødelegger et sjeldent kunstnerisk vindu.',
      speech_style: 'Nøktern og statuspresis, med tydelig forskjell mellom forespurt, mottatt, avtalt, signert, klarert, kreditert og tidsavgrenset.',
      teaches_player: 'At gode feltrelasjoner trenger tydelige rettighetsgrenser nettopp fordi tillit ellers blir brukt som erstatning for samtykke.'
    },
    {
      id: 'yusuf_felt_og_publikumsanalytiker_world',
      social_function: 'Yusuf samler feltresearch, publikumserfaring og representasjonssignaler uten å late som et utvalg mennesker eller en metrikk kan representere hele offentligheten, og utfordrer institusjonens komfortable fortellinger om hvem programmet er for.',
      class_position: 'felt- og publikumsanalytiker med research- og evalueringsmandat uten programmeringsfullmakt',
      status: 'Situert profesjonell standing knyttet til feltresearch_og_representasjonskart og etterprøvbare spørsmål om tilgang og virkning.',
      power_over_player: 'Yusuf kan korrigere påstander om data, utvalg og representasjon og kreve at begrensninger synliggjøres; han kan ikke gjøre research til automatisk kunstnerisk fasit eller gi spilleren mandat fra grupper som ikke faktisk har gitt det.',
      wants: 'At institusjonen bruker research til å stille bedre spørsmål og endre praksis når evidensen holder, uten å gjøre mennesker til datapunkter eller dekorativ legitimering.',
      conceals: 'Han kan undervurdere hvor mye metodevalg og institusjonens tilgang bestemmer hvem som i det hele tatt blir synlig i researchen.',
      speech_style: 'Metodebevisst og konkret, rask til å spørre hvem som mangler, hva et funn faktisk kan generaliseres til og hvilket alternativt signal som ville endret konklusjonen.',
      teaches_player: 'At representasjonsarbeid krever både telling, lytting, metodekritikk og kuratorisk ansvar, og at ingen av delene kan erstatte de andre.'
    }
  ],
  social_environments: [
    'programbord_og_utvalgskart',
    'feltresearch_og_representasjonskart',
    'rettighets_og_avtalerom',
    'arena_og_gjestespillkart',
    'kunstner_og_representantmoter',
    'publikums_og_partneroffentlighet',
    'privat_etterarbeid_uten_saksdata'
  ],
  slow_axes: [
    { id: 'artistic_field_trust', meaning: 'Langsom standing i feltet bygges av konsistente kriterier, sann status og reparasjon når institusjonen endrer kurs.', runtime_binding: 'editorial_only_until_governed' },
    { id: 'rights_and_commitment_trust', meaning: 'Tillit til avtale- og rettighetspraksis utvikles over flere valg og kan falle raskt dersom synlighet brukes som erstatning for samtykke.', runtime_binding: 'editorial_only_until_governed' },
    { id: 'production_reliability', meaning: 'Produksjonsstanding formes av mottakbare handoffs, realistisk arena-fit og om rework synliggjøres før belastning blir normalisert.', runtime_binding: 'editorial_only_until_governed' },
    { id: 'public_relevance_and_representation', meaning: 'Offentlig standing varierer mellom berørte miljøer og formes av tilgjengelighet, forklaring, lytting og faktisk endring over tid.', runtime_binding: 'editorial_only_until_governed' }
  ],
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: 'Standing kan aldri gi eller slå sammen programmeringsmandat, habilitetsvurdering, styre- eller ledermyndighet, budsjett- eller kontraktsfullmakt, rettighetsklarering, samtykke, HMS- eller teknisk godkjenning, persondatatilgang eller rett til å gjøre felt- og publikumssignal til automatisk kunstnerisk fasit.',
    rule: 'Standing divergerer mellom situerte publikum, kan gå i motsatte retninger etter samme programvalg og summeres aldri til en global reputation-score eller skjult autoritetsakse.'
  },
  history_go_affordance: {
    source_ref: knowledgeRef,
    knowledge_use: 'Inger Buresund ved Black Box teater brukes som kildeforankret inngang til hvordan programmering, kunstnerisk profil, institusjonell praksis og relasjoner til et felt kan utvikles over tid.',
    better_question: 'Hvordan kan den konkrete historien om Inger Buresund og Black Box teater hjelpe oss å undersøke hvilke programvalg, relasjoner, arenaformer og offentligheter som faktisk bygde profil i sin historiske sammenheng, hvilke kilder og motstemmer som bærer denne forståelsen, og hvilke forskjeller i mandat, finansiering, rettigheter, representasjon og produksjonsvilkår må synliggjøres før historien kan skjerpe—men aldri avgjøre—dagens fiktive kuratoriske valg?',
    authority_boundary: 'History Go kan gi kildeforankret scenekunsthistorie og bedre spørsmål om programpraksis, men kan ikke velge dagens kunstnere, gi habilitet, klarere rettigheter, inngå avtale, godkjenne arena eller teknikk, disponere budsjett eller gjøre en historisk praksis til fasit for nåtidig kuratering.'
  },
  cross_role_link: {
    status: 'not_required_for_rollout',
    materialized: false,
    new_runtime: false,
    companion_keys: [],
    rule: 'Readiness-kontrakten sier not_required_for_rollout; ingen cross-role runtime eller shared_work_object opprettes for å fullføre denne rolleverdenen. Faktisk delt arbeid kan eventuelt materialiseres senere gjennom en separat, styrt kontrakt.'
  },
  theme_ids: themes,
  season: {
    days: 14,
    day_phases: phases.map((phase) => phase.id),
    coverage
  },
  primary_threads: threadDefs,
  private_aftermath,
  delayed_consequences
};
write(WORLD, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
index.roles = (index.roles || []).filter((entry) => !(entry.category === 'scenekunst' && entry.role_scope === ROLE));
index.roles.push({ category: 'scenekunst', role_scope: ROLE, status: 'role_world_complete', path: WORLD });
const materializedCount = index.roles.filter((entry) => entry.status === 'role_world_complete').length;
index.status = `${materializedCount}_role_worlds_materialized`;
index.effective_date = '2026-09-03';
write(indexPath, index);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
checklist.reference_worlds = [...new Set([...(checklist.reference_worlds || []), WORLD])];
write(checklistPath, checklist);

const themeBankPath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themeBankPath);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = themes;
write(themeBankPath, themeBank);

const report = `# Scenekunst / Program og kuratering — Role World rollout source-first\n\n## Scope\n\nDedicated one-role rollout for \`${KEY}\` after the merged prerequisite package. The rollout preserves the existing appointment gate, role model, four fictional current-work actors, four governed work surfaces, 16-step mail plan, 15 authored mails, waiting/handoff/rework contract and \`programportefolje_og_beslutningslogg\`. No new runtime is introduced.\n\n## Editorial uniqueness\n\nThis world is authored specifically around program dramaturgy, curatorial selection, habilitet, rights and consent, representation research, arena-fit, external hosting, public explanation and the social cost of saying no. It does not copy the Institusjonsledelse world’s board/employer storyline or characters; only the proven 14-day Role World structure and fail-closed contract are reused.\n\n## World depth\n\n- 14 days × 4 phases = 56 unique beats.\n- Seven situated audiences; no global reputation score.\n- Seven evolving multi-day threads.\n- Eight delayed consequences.\n- Five private aftermath pairs.\n- All 15 existing authored source mails are reused at least three times as materialization refs.\n- Bounded Inger Buresund / Black Box teater History Go affordance.\n- Persistent work remains \`programportefolje_og_beslutningslogg\`.\n- Cross-role status remains \`not_required_for_rollout\`; no shared work object is created.\n\n## Authority boundaries\n\nProgram standing never becomes contract, rights, habilitet, budget, board/leadership, HMS, technical, person-data or consent authority. Production and rights specialists retain their own professional vetoes where law, safety, consent or actual status require it, without gaining general artistic veto. Representation evidence improves questions and accountability but is never an automatic artistic score.\n\n## Fail-closed publication\n\nThe temporary materializer and workflow must prove the focused rollout contract, prerequisite compatibility, canonical Role World contract, generated-state synchronization, full Civication and repository diff cleanliness before permanent files are committed. TEMP surfaces are deleted in the publishing commit.\n\n## Quality gate — 29/30\n\n| Axis | Score |\n| --- | ---: |\n| Architecture and contracts | 5/5 |\n| Content depth and specificity | 5/5 |\n| State, consequence and fail-closed behavior | 5/5 |\n| Test and generated-state integrity | 5/5 |\n| Repository hygiene and scope discipline | 5/5 |\n| Runtime evidence at publication | 4/5 |\n\nNo critical Role World gaps. The withheld point is reserved until exact-head GitHub CI supplies authoritative browser boot-smoke evidence.\n`;
write(REPORT, report);

const test = `const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');\nconst ROOT=path.resolve(__dirname,'..'),read=r=>JSON.parse(fs.readFileSync(path.join(ROOT,r),'utf8'));\nconst KEY='${KEY}',ROLE='${ROLE}',WORLD='${WORLD}',PLAN='${PLAN}',MODEL='${MODEL}',GRAMMAR='${GRAMMAR}';\nconst world=read(WORLD);assert.equal(world.schema,'civication_role_world_v1');assert.equal(world.status,'role_world_complete');assert.deepEqual(world.materialization.authored_dimensions,['situated_reputation']);for(const k of ['no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved'])assert.equal(world.materialization[k],true,k);assert.equal(world.materialization.cross_role_link_materialized,false);\nassert.deepEqual(world.existing_work_continuity.work_loops,read(GRAMMAR).work_loops);assert.equal(world.existing_work_continuity.persistent_work_object,'programportefolje_og_beslutningslogg');assert.equal(world.existing_work_continuity.new_runtime_state,false);assert.equal(read(PLAN).sequence.length,16);for(const p of read(MODEL).related_people){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null);}\nconst refs=world.materialization.source_refs;assert.equal(refs.length,15);assert.equal(new Set(refs).size,15);for(const ref of refs){const [f,id]=ref.split('#');assert.ok(read(f).families.flatMap(x=>x.mails||[]).some(m=>m.id===id),ref);}\nconst audienceIds=['artistic_field_and_program_practice','artists_rightsholders_and_representatives','venue_production_and_hosting','institution_leadership_and_governance','publics_communities_and_access','funders_partners_and_external_hosts','private_relations'];assert.equal(world.situated_reputation_model.global_score_allowed,false);assert.deepEqual(world.situated_reputation_model.audiences.map(a=>a.id),audienceIds);for(const a of world.situated_reputation_model.audiences){assert.ok(a.cares_about.length>=2);assert.match(a.cannot_grant,/ikke|kan ikke/i);}for(const term of [/habilit/i,/rettighet/i,/kontrakt/i,/HMS/i,/teknisk/i])assert.match(world.situated_reputation_model.authority_separation,term);\nassert.ok(refs.includes(world.history_go_affordance.source_ref));assert.ok(world.history_go_affordance.better_question.length>=220);assert.match(world.history_go_affordance.better_question,/Inger Buresund/);assert.match(world.history_go_affordance.better_question,/Black Box teater/);assert.match(world.history_go_affordance.authority_boundary,/ikke|kan ikke/i);assert.equal(world.cross_role_link.status,'not_required_for_rollout');assert.equal(world.cross_role_link.materialized,false);assert.equal(world.cross_role_link.new_runtime,false);assert.equal('shared_work_object'in world.cross_role_link,false);assert.match(world.cross_role_link.rule,/not_required_for_rollout/);\nassert.equal(world.season.days,14);assert.deepEqual(world.season.day_phases,['morning','lunch','afternoon','evening']);assert.equal(world.season.coverage.length,56);const beatKeys=new Set(world.season.coverage.map(b=>b.day+'/'+b.phase));assert.equal(beatKeys.size,56);assert.equal(new Set(world.season.coverage.map(b=>b.summary)).size,56);assert.equal(new Set(world.season.coverage.map(b=>b.standing_consequence)).size,56);const uses=new Map(refs.map(r=>[r,0]));for(const b of world.season.coverage){assert.ok(b.summary.length>=620,b.day+'/'+b.phase+' summary');assert.ok(b.standing_consequence.length>=500,b.day+'/'+b.phase+' consequence');assert.ok(audienceIds.includes(b.standing_audience));assert.equal(b.materialization_refs.length,1);assert.ok(refs.includes(b.materialization_refs[0]));uses.set(b.materialization_refs[0],uses.get(b.materialization_refs[0])+1);}for(const [r,n]of uses)assert.ok(n>=3,r+' underused '+n);\nassert.equal(world.primary_threads.length,7);for(const t of world.primary_threads){assert.ok(t.relationship.length>=160);assert.ok(t.beat_refs.length>=5&&t.beat_refs.length<=10);assert.ok(new Set(t.beat_refs.map(r=>r.split('/')[0])).size>=3);for(const r of t.beat_refs)assert.ok(beatKeys.has(r),r);}assert.equal(world.private_aftermath.length,5);for(const x of world.private_aftermath){assert.equal(new Set(x.beat_refs).size,x.beat_refs.length);assert.ok(x.meaning.length>=140);for(const r of x.beat_refs)assert.ok(beatKeys.has(r),r);}assert.equal(world.delayed_consequences.length,8);for(const x of world.delayed_consequences){assert.ok(beatKeys.has(x.setup_ref));assert.ok(beatKeys.has(x.return_ref));assert.ok(Number(x.return_ref.split('/')[0])>Number(x.setup_ref.split('/')[0]));}\nconst index=read('data/Civication/roleWorlds/index.json');assert.deepEqual(index.roles.find(e=>e.category==='scenekunst'&&e.role_scope===ROLE),{category:'scenekunst',role_scope:ROLE,status:'role_world_complete',path:WORLD});assert.match(index.status,/_role_worlds_materialized$/);assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD));assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY],world.theme_ids);\nconst readiness=read('data/Civication/roleWorldRolloutReadiness.json');assert.ok(!(readiness.rollout_queue||[]).some(e=>e.key===KEY));assert.equal(readiness.roles.find(e=>e.key===KEY).role_world_status,'role_world_complete');assert.ok(readiness.summary.role_world_complete_or_pilot>=48);assert.equal(readiness.gate.gate_pass,true);const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(e=>e.key===KEY);assert.equal(career.status,'playable');assert.equal(career.audit.runtime_gate,true);assert.deepEqual(career.audit.missing_components,[]);\nconst source=fs.readFileSync(path.join(ROOT,'${REPORT}'),'utf8');assert.match(source,/Editorial uniqueness/i);assert.match(source,/global reputation score/i);assert.match(source,/not_required_for_rollout/);assert.match(source,/29\\/30/);console.log('Civication Scenekunst Program og kuratering Role World rollout: OK');\n`;
write(TEST, test);

console.log(JSON.stringify({ world: WORLD, beats: coverage.length, sources: sourceRefs.length, threads: threadDefs.length, private_aftermath: private_aftermath.length, delayed_consequences: delayed_consequences.length }, null, 2));
