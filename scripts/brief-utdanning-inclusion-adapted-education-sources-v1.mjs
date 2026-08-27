#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/utdanning/inclusion_adapted_education_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/utdanning-inclusion-adapted-education-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const claim = (id, text, source_ids) => ({
  id,
  text,
  status: 'planned_requires_fulltext_verification',
  source_ids,
});
const source = (id, publisher, title, url, type, evidence_role, source_location) => ({
  id,
  publisher,
  title,
  url,
  type,
  evidence_role,
  source_location,
  retrieval_status: 'verified_2026-08-27',
});

const SOURCES = [
  source('in01-lovdata-11-1', 'Lovdata', 'Opplæringslova kapittel 11 – tilpassa opplæring og individuell tilrettelegging', 'https://lovdata.no/nav/lov/2023-06-09-30/kap11', 'official-law', 'adapted-education-duty-satisfactory-benefit-intensive-support', 'Gjeldende §§ 11-1 til 11-3 og skillet mellom allmenn tilpasning, intensiv opplæring og individuelle rettigheter.'),
  source('in02-udir-tilpasset', 'Utdanningsdirektoratet', 'Overordnet del 3.2 – Undervisning og tilpasset opplæring', 'https://www.udir.no/lk20/overordnet-del/3.-prinsipper-for-skolens-praksis/3.2-undervisning-og-tilpasset-opplaring/', 'official-curriculum', 'variation-community-expectations-assessment', 'Gjeldende overordnet del om variasjon, tilpasning i fellesskapet, forventninger og vurdering.'),
  source('in03-udir-inkluderende', 'Utdanningsdirektoratet', 'Overordnet del 3.1 – Et inkluderende læringsmiljø', 'https://www.udir.no/lk20/overordnet-del/3.-prinsipper-for-skolens-praksis/3.1-et-inkluderende-laringsmiljo/', 'official-curriculum', 'belonging-diversity-student-participation', 'Gjeldende overordnet del om tilhørighet, mangfold, elevmedvirkning og læringsfellesskap.'),
  source('in04-unesco-guide', 'UNESCO', 'A guide for ensuring inclusion and equity in education', 'https://unesdoc.unesco.org/ark:/48223/pf0000248254', 'international-policy-guide', 'system-barriers-equity-review-framework', '2017-rammeverket for å undersøke politikk, strukturer og praksiser under prinsippet om at alle elever teller likt.'),
  source('in05-unesco-gem', 'UNESCO Global Education Monitoring Report', 'Inclusion and education: All means all', 'https://unesdoc.unesco.org/ark:/48223/pf0000373718', 'global-evidence-report', 'presence-participation-achievement-barriers-data', '2020-rapportens syntese av inkluderingsbarrierer, deltakelse, læring, målgrupper og systemkonsekvenser.'),
  source('in06-ohchr-gc4', 'UN Committee on the Rights of Persons with Disabilities', 'General comment No. 4 on Article 24 – the right to inclusive education', 'https://www.ohchr.org/en/documents/general-comments-and-recommendations/general-comment-no-4-article-24-right-inclusive', 'international-rights-interpretation', 'system-transformation-accessibility-accommodation-support', 'CRPD/C/GC/4 om inkluderende systemendring, tilgjengelighet, rimelig tilrettelegging og individuell støtte.'),
  source('in07-cast-udl30', 'CAST', 'Universal Design for Learning Guidelines version 3.0', 'https://udlguidelines.cast.org/', 'accessibility-design-framework', 'engagement-representation-action-expression-agency', 'Versjon 3.0 med tre prinsipper og eksplisitt vekt på identitet, tilhørighet, tilgjengelig teknologi og elevagens.'),
  source('in08-florian-blackhawkins', 'British Educational Research Journal', 'Exploring inclusive pedagogy', 'https://doi.org/10.1080/01411926.2010.501096', 'peer-reviewed-qualitative-study', 'ordinary-provision-extension-participation', 'Vol. 37(5), 813–828; observasjoner og intervjuer med 11 lærere ved to skotske grunnskoler.'),
  source('in09-norwich-difference', 'British Educational Research Journal', 'Dilemmas of difference and the identification of special educational needs/disability', 'https://doi.org/10.1080/01411920802044446', 'peer-reviewed-comparative-study', 'difference-identification-stigma-access-dilemma', 'Vol. 35(3), 447–467; internasjonal studie av 132 praktikere og beslutningstakere.'),
  source('in10-lindner-differentiation', 'International Journal of Inclusive Education', 'Differentiation and individualisation in inclusive education: a systematic review and narrative synthesis', 'https://doi.org/10.1080/13603116.2020.1813450', 'peer-reviewed-systematic-review', 'differentiation-collaboration-instruction-organisation', 'Systematisk gjennomgang av differensierings- og individualiseringspraksiser i inkluderende klasserom.'),
  source('in11-deunk-meta', 'Educational Research Review', 'Effective differentiation practices: a systematic review and meta-analysis', 'https://doi.org/10.1016/j.edurev.2018.02.002', 'peer-reviewed-systematic-review-meta-analysis', 'differentiation-effects-heterogeneity-implementation', 'Vol. 24, 31–54; 21 studier og 78 effektstørrelser om språk- og matematikkprestasjoner i grunnskolen.'),
  source('in12-eef-send', 'Education Endowment Foundation', 'Special Educational Needs in Mainstream Schools', 'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/send', 'evidence-guidance-report', 'high-quality-teaching-formative-assessment-scaffolding-grouping', 'Evidensbasert veiledning med fem anbefalinger for ordinær undervisning, kartlegging og tilleggstøtte.'),
  source('in13-ainscow-action', 'International Journal of Inclusive Education', 'Understanding and developing inclusive practices in schools: a collaborative action research network', 'https://doi.org/10.1080/1360311032000158015', 'peer-reviewed-collaborative-action-research', 'school-development-inquiry-collaboration-evidence', 'Vol. 8(2), 125–139; kollaborativ aksjonsforskning om å identifisere og utvikle inkluderende praksis.'),
];

const METHODS = {
  document: ['met_utdanning_dokument_lareplananalyse', 'met_utdanning_litteratursyntese'],
  observation: ['met_utdanning_undervisningsobservasjon', 'met_utdanning_kvalitativ_feltstudie'],
  intervention: ['met_utdanning_intervensjonsvurdering', 'met_utdanning_maleinstrument_validitet'],
  ethics: ['met_utdanning_etikk_barn_representasjon', 'met_utdanning_kvalitativ_feltstudie'],
};

const TOPICS = [
  {
    id: 'rettighet-og-fellesansvar',
    title: 'Rettighet, fellesskap og systemansvar',
    method_ids: METHODS.document,
    source_ids: ['in01-lovdata-11-1', 'in02-udir-tilpasset', 'in04-unesco-guide', 'in06-ohchr-gc4'],
    boundary: 'Tilpasset opplæring er et system- og undervisningsansvar for alle, ikke en individuell særordning som aktiveres av diagnose.',
    planned_claims: [
      claim('in-01', 'Tilpasset opplæring er en plikt for skoleeier og gjelder alle elever gjennom variasjon og tilpasning innenfor fellesskapet.', ['in01-lovdata-11-1', 'in02-udir-tilpasset']),
      claim('in-02', 'Inkludering krever endringer i kultur, politikk og praksis, ikke bare tilgang til en ordinær skolebygning.', ['in04-unesco-guide', 'in06-ohchr-gc4']),
      claim('in-03', 'Lik rett til opplæring innebærer ikke identiske læringsbetingelser; tilgjengelighet og rimelig tilrettelegging kan kreve forskjellige midler mot felles verdige mål.', ['in06-ohchr-gc4', 'in02-udir-tilpasset']),
      claim('in-04', 'Når mange elever møter samme barriere, bør skolen først undersøke tilbudets utforming fremfor å forklare mønsteret som mange separate elevmangler.', ['in04-unesco-guide', 'in05-unesco-gem']),
    ],
  },
  {
    id: 'narvar-deltakelse-laering',
    title: 'Nærvær, deltakelse, læring og tilhørighet',
    method_ids: METHODS.observation,
    source_ids: ['in03-udir-inkluderende', 'in05-unesco-gem', 'in08-florian-blackhawkins', 'in13-ainscow-action'],
    boundary: 'Fysisk nærvær er nødvendig, men utilstrekkelig; inkludering må undersøkes gjennom aktivitet, innflytelse, læring og tilhørighet.',
    planned_claims: [
      claim('in-05', 'Et inkluderende læringsmiljø gir elever faglig og sosial tilhørighet og reelle muligheter til å medvirke i fellesskapet.', ['in03-udir-inkluderende', 'in05-unesco-gem']),
      claim('in-06', 'Deltakelse må observeres i hvem som får tilgang til oppgaven, samtalen, responsen og påvirkningen, ikke bare i klasselisten.', ['in08-florian-blackhawkins', 'in13-ainscow-action']),
      claim('in-07', 'Læringsresultater må inngå i inkluderingsvurderingen fordi tilhørighet uten tilgang til faglig utvikling ikke oppfyller utdanningens formål.', ['in05-unesco-gem', 'in02-udir-tilpasset']),
      claim('in-08', 'Elevens opplevelse kan avdekke ensomhet, skjult ekskludering eller uverdige støtteformer som fraværs- og resultatdata alene ikke viser.', ['in03-udir-inkluderende', 'in13-ainscow-action']),
    ],
  },
  {
    id: 'universell-utforming',
    title: 'Universell utforming, UDL og individuell tilgang',
    method_ids: METHODS.document,
    source_ids: ['in06-ohchr-gc4', 'in07-cast-udl30', 'in08-florian-blackhawkins'],
    boundary: 'Forhåndsdesignet variasjon reduserer barrierer, men erstatter ikke individuell tilrettelegging når en elev fortsatt mangler tilgang.',
    planned_claims: [
      claim('in-09', 'UDL organiserer planlegging rundt flere veier for engasjement, representasjon og handling eller uttrykk med elevagens som mål.', ['in07-cast-udl30', 'in08-florian-blackhawkins']),
      claim('in-10', 'Tilgjengelige materialer og teknologier må være funksjonelt brukbare i den konkrete aktiviteten, ikke bare formelt tilgjengelige i skolen.', ['in06-ohchr-gc4', 'in07-cast-udl30']),
      claim('in-11', 'Å utvide det ordinære repertoaret kan redusere behovet for ettermonterte særordninger og risikoen for stigmatisering.', ['in08-florian-blackhawkins', 'in07-cast-udl30']),
      claim('in-12', 'Universell utforming og individuell tilrettelegging er komplementære nivåer fordi ikke alle barrierer kan forutses eller løses med samme design.', ['in06-ohchr-gc4', 'in07-cast-udl30']),
    ],
  },
  {
    id: 'adaptiv-undervisning',
    title: 'Adaptiv undervisning og formativ justering',
    method_ids: METHODS.intervention,
    source_ids: ['in02-udir-tilpasset', 'in10-lindner-differentiation', 'in11-deunk-meta', 'in12-eef-send'],
    boundary: 'Tilpasning skal være respons på læringsevidens og bevare fagets vesentlige mål, ikke bygge på faste elevtyper eller permanent forenkling.',
    planned_claims: [
      claim('in-13', 'Adaptiv undervisning bruker løpende evidens til å justere forklaring, støtte, tempo, øving og utfordring uten å låse elever til faste spor.', ['in02-udir-tilpasset', 'in12-eef-send']),
      claim('in-14', 'Differensiering er et samspill mellom planlegging, gjennomføring, organisering og samarbeid, ikke bare forskjellige arbeidsark.', ['in10-lindner-differentiation', 'in12-eef-send']),
      claim('in-15', 'Meta-analysen til Deunk og kolleger fant små til moderate positive effekter for enkelte differensieringspraksiser, men et begrenset og heterogent kunnskapsgrunnlag.', ['in11-deunk-meta', 'in10-lindner-differentiation']),
      claim('in-16', 'En tilpasning må vurderes mot både umiddelbar tilgang og langsiktig progresjon slik at stillas ikke blir permanent avhengighet eller redusert læreplan.', ['in02-udir-tilpasset', 'in12-eef-send']),
    ],
  },
  {
    id: 'gruppering-og-stillas',
    title: 'Fleksibel gruppering, stillas og høye forventninger',
    method_ids: METHODS.intervention,
    source_ids: ['in02-udir-tilpasset', 'in09-norwich-difference', 'in11-deunk-meta', 'in12-eef-send'],
    boundary: 'Grupper skal være formålsbestemte, fleksible og reviderbare; nivådeling må ikke bli en sosial identitet eller selvoppfyllende forventning.',
    planned_claims: [
      claim('in-17', 'Fleksibel gruppering samler elever midlertidig rundt et konkret læringsbehov og oppløses når formålet er nådd.', ['in12-eef-send', 'in11-deunk-meta']),
      claim('in-18', 'Permanente nivågrupper kan snevre inn tilgang og forventninger dersom plasseringen behandles som stabil evne fremfor aktuell støtteinformasjon.', ['in09-norwich-difference', 'in02-udir-tilpasset']),
      claim('in-19', 'Stillas skal gjøre vesentlig faglig aktivitet mulig og gradvis trekkes tilbake når elevens selvstendighet øker.', ['in12-eef-send', 'in02-udir-tilpasset']),
      claim('in-20', 'Høye forventninger må kombineres med eksplisitt støtte; ambisjon uten tilgang og omsorg uten faglig utfordring kan begge skape ekskludering.', ['in02-udir-tilpasset', 'in09-norwich-difference']),
    ],
  },
  {
    id: 'fellesskap-og-samhandling',
    title: 'Fellesskap, samhandling og forskjellsdilemmaer',
    method_ids: METHODS.observation,
    source_ids: ['in03-udir-inkluderende', 'in08-florian-blackhawkins', 'in09-norwich-difference'],
    boundary: 'Samarbeid er inkluderende bare når oppgaver, roller og støtte gir gjensidig faglig deltakelse fremfor parallell aktivitet eller sosial pynt.',
    planned_claims: [
      claim('in-21', 'Læringsfellesskap utvikles gjennom normer og oppgaver som gjør forskjeller legitime uten å gjøre enkelte elever til permanente mottakere av hjelp.', ['in03-udir-inkluderende', 'in08-florian-blackhawkins']),
      claim('in-22', 'Samarbeidsoppgaver må ha faglig gjensidig avhengighet og tilgjengelige bidragsformer; samme bordplassering skaper ikke samarbeid.', ['in03-udir-inkluderende', 'in08-florian-blackhawkins']),
      claim('in-23', 'Å synliggjøre forskjell kan åpne tilgang og samtidig stigmatisere, mens å overse forskjell kan bevare likhetsidealet og samtidig nekte støtte.', ['in09-norwich-difference', 'in08-florian-blackhawkins']),
      claim('in-24', 'Læreren må undersøke hvem som oftest forklarer, venter, hjelper og blir hjulpet fordi deltakelsesroller kan reprodusere lave forventninger.', ['in08-florian-blackhawkins', 'in03-udir-inkluderende']),
    ],
  },
  {
    id: 'elevstemme-og-mangfold',
    title: 'Elevstemme, familie og sammensatt mangfold',
    method_ids: METHODS.ethics,
    source_ids: ['in03-udir-inkluderende', 'in04-unesco-guide', 'in05-unesco-gem', 'in06-ohchr-gc4'],
    boundary: 'Medvirkning må være tilgjengelig og virkningsfull; én kategori kan ikke forklare hvordan funksjon, språk, kultur, kjønn og økonomi virker sammen.',
    planned_claims: [
      claim('in-25', 'Elevmedvirkning krever forståelig informasjon, tilgjengelige uttrykksmåter og dokumentasjon av hvordan elevens syn påvirket beslutningen.', ['in03-udir-inkluderende', 'in06-ohchr-gc4']),
      claim('in-26', 'Familier tilfører kontekst- og kontinuitetskunnskap, men elevens selvstendige rett til å bli hørt må ikke forsvinne i voksensamarbeidet.', ['in03-udir-inkluderende', 'in06-ohchr-gc4']),
      claim('in-27', 'Inkluderingsbarrierer kan forsterkes når funksjonsvariasjon virker sammen med språk, fattigdom, kjønn, migrasjon eller geografisk ulikhet.', ['in04-unesco-guide', 'in05-unesco-gem']),
      claim('in-28', 'Data bør kunne avdekke mønstre mellom grupper uten å gjøre gruppetilhørighet til en årsaksforklaring for enkeltindividet.', ['in05-unesco-gem', 'in04-unesco-guide']),
    ],
  },
  {
    id: 'skoleutvikling',
    title: 'Skoleutvikling, samarbeid og ansvarlig implementering',
    method_ids: [...METHODS.document, 'met_utdanning_kvalitativ_feltstudie'],
    source_ids: ['in04-unesco-guide', 'in05-unesco-gem', 'in12-eef-send', 'in13-ainscow-action'],
    boundary: 'Inkludering er en vedvarende undersøkelses- og forbedringsprosess med delt ansvar, ikke et enkeltstående kurs, program eller statusmerke.',
    planned_claims: [
      claim('in-29', 'Skoleutvikling for inkludering må koble elevdata og erfaringer til analyse av konkrete barrierer i kultur, organisering og undervisning.', ['in13-ainscow-action', 'in04-unesco-guide']),
      claim('in-30', 'Profesjonelt samarbeid trenger tydelige spørsmål, observasjoner og ansvar; møtefrekvens alene beviser ikke bedre praksis.', ['in13-ainscow-action', 'in12-eef-send']),
      claim('in-31', 'Ressurser bør vurderes etter om de øker elevenes tilgang, deltakelse og læring, ikke bare etter antall særskilte timer eller tiltak.', ['in05-unesco-gem', 'in04-unesco-guide']),
      claim('in-32', 'Implementering må følges over tid for rekkevidde, kvalitet, utilsiktede konsekvenser og ulik virkning mellom elevgrupper.', ['in12-eef-send', 'in13-ainscow-action', 'in05-unesco-gem']),
    ],
  },
];

const SCENARIOS = [
  { id: 'scenario-same-task', title: 'Alle får samme oppgave i likt format', purpose: 'Skille felles faglig mål fra identiske tilgangs- og uttrykksbetingelser.', source_ids: ['in02-udir-tilpasset', 'in07-cast-udl30'] },
  { id: 'scenario-present-not-participating', title: 'Eleven er i klassen, men uten faglig rolle', purpose: 'Analysere nærvær, samhandling, innflytelse, læring og tilhørighet separat.', source_ids: ['in03-udir-inkluderende', 'in08-florian-blackhawkins'] },
  { id: 'scenario-permanent-low-group', title: 'En midlertidig nivågruppe blir permanent', purpose: 'Bruke mål, revisjonstidspunkt og progresjonsdata til å hindre fast elevtyping.', source_ids: ['in09-norwich-difference', 'in12-eef-send'] },
  { id: 'scenario-scaffold-never-fades', title: 'Stillaset fjernes aldri', purpose: 'Vurdere om støtten både åpner dagens oppgave og utvikler framtidig selvstendighet.', source_ids: ['in02-udir-tilpasset', 'in12-eef-send'] },
  { id: 'scenario-voice-without-impact', title: 'Elevstemmen samles inn uten innflytelse', purpose: 'Gjøre informasjon, uttrykksform og beslutningsspor reelt tilgjengelige.', source_ids: ['in03-udir-inkluderende', 'in06-ohchr-gc4'] },
  { id: 'scenario-inclusion-project', title: 'Inkludering reduseres til et kort prosjekt', purpose: 'Bygge vedvarende undersøkelse av barrierer, ansvar, gjennomføring og ulik virkning.', source_ids: ['in04-unesco-guide', 'in13-ainscow-action'] },
];

export function build({ writeFiles = true } = {}) {
  const brief = {
    schema: 'history_go_utdanning_inclusion_adapted_education_source_claim_brief_v1',
    version: '1.0.0',
    updated_at: '2026-08-27',
    status: 'source_claim_brief_complete_full_chapter_next',
    subject_id: 'utdanning',
    planned_unit_id: 'inkludering-tilpasset-opplaering-fellesskap-tilgang-og-progresjon',
    future_chapter_id: 'inkludering-tilpasset-opplaering-fellesskap-tilgang-og-progresjon',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: {
      title: 'Inkludering og tilpasset opplæring: fellesskap, tilgang og progresjon',
      primary_domain_id: 'inkludering_tilpasset_opplaering',
      canonical_emne_id: 'em_utdanning_inkludering_tilpasset_opplaering',
      ownership: 'Utdanning eier analysen av hvordan systemansvar, undervisningsdesign, fleksibel støtte, elevmedvirkning og skoleutvikling gir tilgang, deltakelse, læring og tilhørighet for et sammensatt elevmangfold.',
      included: TOPICS.map((topic) => topic.title),
      excluded: ['plassering som tilstrekkelig inkluderingsbevis', 'faste læringsstiler eller elevtyper', 'permanent nivådeling uten revisjon', 'universell utforming som erstatning for individuelle rettigheter', 'medvirkning uten beslutningspåvirkning', 'programnavn som implementeringsbevis'],
    },
    source_policy: {
      inclusion_is_system_transformation: true,
      presence_is_not_participation: true,
      common_goals_allow_different_access: true,
      udl_does_not_replace_individual_accommodation: true,
      adaptation_uses_learning_evidence_not_fixed_types: true,
      grouping_is_flexible_and_reviewable: true,
      student_voice_must_affect_decisions: true,
      implementation_requires_longitudinal_review: true,
      planned_claim_is_not_verified_claim: true,
      fulltext_requires_reciprocal_paragraph_claim_trace: true,
      sources_verified_at: '2026-08-27',
    },
    allowed_method_ids: [...new Set(Object.values(METHODS).flat())],
    sources: SOURCES,
    decision_scenarios: SCENARIOS,
    topic_briefs: TOPICS,
    next_gate: 'inclusion_adapted_education_source_brief_complete_full_chapter_production',
  };
  if (writeFiles) write(BRIEF, brief);
  return brief;
}

export function audit({ writeReport = false } = {}) {
  const brief = fs.existsSync(abs(BRIEF)) ? read(BRIEF) : build({ writeFiles: false });
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const sourceIds = new Set(brief.sources.map((row) => row.id));
  const usedSources = new Set(claims.flatMap((row) => row.source_ids));
  assert(brief.scope.primary_domain_id === 'inkludering_tilpasset_opplaering', 'Feil domene');
  assert(!brief.runtime_registration.registered && !brief.metadata_registration.global_status_mutation_in_source_brief, 'Source brief kan ikke registrere runtime');
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Feil 13/8/32/6-struktur');
  assert(new Set(claims.map((row) => row.id)).size === 32 && claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være unike og kildebundet');
  assert(brief.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-27'), 'Kilder må være inspiserbare');
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle kilder må brukes');
  assert(Object.entries(brief.source_policy).filter(([key]) => key.endsWith('_is_system_transformation') || key.startsWith('presence_') || key.startsWith('common_goals_') || key.startsWith('udl_') || key.startsWith('adaptation_') || key.startsWith('grouping_') || key.startsWith('student_voice_') || key.startsWith('implementation_')).every(([, value]) => value === true), 'Kritiske inkluderingsgrenser mangler');
  const report = {
    schema: 'history_go_utdanning_inclusion_adapted_education_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-27',
    status: 'pass',
    subject_id: 'utdanning',
    domain_id: 'inkludering_tilpasset_opplaering',
    counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, modules: 4 },
    gates: {
      sourceFirstUnregistered: true,
      allSourcesInspectable: true,
      everyClaimSourceBound: true,
      everySourceUsed: true,
      systemTransformationBoundary: true,
      inclusionBeyondPlacementBoundary: true,
      commonGoalDifferentAccessBoundary: true,
      udlAndIndividualRightsBoundary: true,
      noFixedLearnerTyping: true,
      flexibleGroupingBoundary: true,
      consequentialStudentVoiceBoundary: true,
      longitudinalImplementationBoundary: true,
      fulltextClaimTraceRequired: true,
    },
    six_part_quality_review: {
      source_authority_and_provenance: 5,
      claim_plan_and_verifiability: 5,
      inclusion_and_adaptation_theory: 5,
      equity_participation_and_learner_ethics: 5,
      pedagogy_and_scenarios: 4,
      architecture_and_reproducibility: 5,
      total: 29,
      maximum: 30,
      note: 'Source-first-produksjon; claims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.',
    },
    next_gate: brief.next_gate,
  };
  if (writeReport) write(REPORT, report);
  else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  if (process.argv.includes('--write-brief')) build();
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Inkludering og tilpasset opplæring source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) {
  console.error(`Inkludering og tilpasset opplæring source brief FEIL: ${error.message}`);
  process.exitCode = 1;
}
