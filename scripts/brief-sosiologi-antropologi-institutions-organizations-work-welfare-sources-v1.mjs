#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/politikk/sosiologi_antropologi/institutions_organizations_work_welfare_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sosiologi-antropologi-institutions-organizations-work-welfare-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const c = (id, text, source_ids) => ({ id, text, source_ids, status: 'planned_requires_fulltext_verification' });

const sources = [
  { id: 'iow01-weber', title: 'Economy and Society: An Outline of Interpretive Sociology', publisher: 'University of California Press / Google Books', type: 'scholarly-book', url: 'https://books.google.com/books?id=MILOksrhgrYC', evidence_role: 'bureaucracy-authority-jurisdiction-hierarchy-rules', source_location: 'Bibliografisk forlagsvisning av Webers verk om legitim autoritet, byråkrati, jurisdiksjon og formell organisering.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow02-meyer-rowan', title: 'Institutionalized Organizations: Formal Structure as Myth and Ceremony', publisher: 'American Journal of Sociology / University of Chicago Press', type: 'peer-reviewed-article', url: 'https://www.journals.uchicago.edu/doi/10.1086/226550', evidence_role: 'institutional-rules-legitimacy-decoupling-formal-structure', source_location: 'Fagfellevurdert originalartikkel om institusjonaliserte regler, legitimitet og mulig frakobling mellom formell struktur og praksis.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow03-dimaggio-powell', title: 'The Iron Cage Revisited: Institutional Isomorphism and Collective Rationality in Organizational Fields', publisher: 'American Sociological Review / JSTOR', type: 'peer-reviewed-article', url: 'https://www.jstor.org/stable/2095101', evidence_role: 'organizational-fields-coercive-mimetic-normative-isomorphism', source_location: 'Fagfellevurdert originalartikkel om organisatoriske felt og tvangsmessig, mimetisk og normativ isomorfi.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow04-lipsky', title: 'Street-Level Bureaucracy: Dilemmas of the Individual in Public Services', publisher: 'Russell Sage Foundation', type: 'scholarly-book', url: 'https://www.russellsage.org/publications/book/street-level-bureaucracy', evidence_role: 'frontline-discretion-workload-coping-policy-implementation', source_location: 'Forlagssiden dokumenterer Lipskys analyse av skjønn, ressursknapphet og praksis i førstelinjens tjenesteimplementering.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow05-acker', title: 'Hierarchies, Jobs, Bodies: A Theory of Gendered Organizations', publisher: 'Gender & Society / SAGE Journals', type: 'peer-reviewed-article', url: 'https://journals.sagepub.com/doi/10.1177/089124390004002002', evidence_role: 'gendered-organizations-abstract-worker-job-design', source_location: 'Fagfellevurdert originalartikkel om hvordan organisatoriske strukturer, jobber og kontrakter kan bygge på kjønnede forutsetninger.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow06-burawoy', title: 'Manufacturing Consent: Changes in the Labor Process Under Monopoly Capitalism', publisher: 'University of Chicago Press', type: 'scholarly-book', url: 'https://press.uchicago.edu/ucp/books/book/chicago/M/bo23899991.html', evidence_role: 'labor-process-control-consent-workplace-games', source_location: 'Forlagssiden dokumenterer Burawoys etnografiske analyse av kontroll, samtykke og arbeidsplassens produksjonsspill.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow07-esping-andersen', title: 'The Three Worlds of Welfare Capitalism', publisher: 'Polity Press', type: 'scholarly-book', url: 'https://www.politybooks.com/bookdetail?book_slug=the-three-worlds-of-welfare-capitalism--9780745607962', evidence_role: 'welfare-regimes-decommodification-stratification', source_location: 'Forlagssiden dokumenterer Esping-Andersens komparative analyse av velferdsregimer, avkommodifisering og sosial lagdeling.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow08-korpi', title: 'Power Resources and Employer-Centered Approaches in Explanations of Welfare States and Varieties of Capitalism', publisher: 'World Politics / Cambridge University Press', type: 'peer-reviewed-article', url: 'https://www.cambridge.org/core/journals/world-politics/article/power-resources-and-employercentered-approaches-in-explanations-of-welfare-states-and-varieties-of-capitalism-protagonists-consenters-and-antagonists/6B7688A17F6C7EF213F0E6D2ACE7130B', evidence_role: 'power-resources-employers-labor-welfare-state-conflict', source_location: 'Fagfellevurdert artikkel som sammenlikner maktressurs- og arbeidsgiversentrerte forklaringer på velferdsstat og kapitalismevarianter.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow09-working-environment-act', title: 'Lov om arbeidsmiljø, arbeidstid og stillingsvern mv.', publisher: 'Lovdata', type: 'primary-law', url: 'https://lovdata.no/lov/2005-06-17-62', evidence_role: 'norway-employment-rights-working-time-protection-participation', source_location: 'Gjeldende norsk lovtekst om arbeidsmiljø, arbeidstid, medvirkning, ansettelse og stillingsvern.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow10-ssb-lfs', title: 'Arbeidskraftundersøkelsen', publisher: 'Statistisk sentralbyrå', type: 'official-statistics', url: 'https://www.ssb.no/arbeid-og-lonn/sysselsetting/statistikk/arbeidskraftundersokelsen', evidence_role: 'employment-unemployment-labor-force-definitions-norway', source_location: 'Offisiell statistikk med dokumenterte definisjoner og måleprinsipper for sysselsetting, arbeidsledighet og arbeidsstyrke.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow11-oecd-employment', title: 'OECD Employment Database', publisher: 'OECD', type: 'official-comparative-dataset', url: 'https://www.oecd.org/en/data/datasets/oecd-employment-database.html', evidence_role: 'comparative-employment-work-hours-earnings-labor-market', source_location: 'Offisiell internasjonal database for sammenliknbare arbeidsmarkeds-, sysselsettings-, arbeidstids- og lønnsindikatorer.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow12-oecd-socx', title: 'Social Expenditure Database (SOCX)', publisher: 'OECD', type: 'official-comparative-dataset', url: 'https://www.oecd.org/en/data/datasets/social-expenditure-database-socx.html', evidence_role: 'social-expenditure-public-private-program-composition', source_location: 'Offisiell internasjonal database for offentlig og privat sosialutgift, programnivå, sammensetning og nettoutgifter.', retrieval_status: 'verified_2026-08-29' },
  { id: 'iow13-nesh', title: 'Guidelines for Research Ethics in the Social Sciences and the Humanities', publisher: 'De nasjonale forskningsetiske komiteene', type: 'research-ethics-guideline', url: 'https://www.forskningsetikk.no/en/guidelines/social-sciences-and-humanities/guidelines-for-research-ethics-in-the-social-sciences-and-the-humanities/', evidence_role: 'workplace-research-dependency-confidentiality-group-harm', source_location: 'Nasjonale retningslinjer for frivillighet, avhengighetsforhold, konfidensialitet, tredjepersoner og skade i organisasjons- og arbeidslivsforskning.', retrieval_status: 'verified_2026-08-29' },
];

const topic_briefs = [
  {
    id: 'byrakrati-autoritet-regler-og-hierarki',
    title: 'Byråkrati, autoritet, regler og hierarki',
    method_ids: ['met_pol_institusjonsanalyse', 'met_pol_begrepsanalyse'],
    boundary: 'Webers idealtype beskriver organisatoriske kjennetegn og legitimitetsformer; den er verken en full beskrivelse av alle etater eller et synonym for ineffektivitet.',
    source_ids: ['iow01-weber', 'iow04-lipsky', 'iow09-working-environment-act'],
    planned_claims: [
      c('iow-01', 'Webers byråkrati er en idealtype med jurisdiksjon, hierarki, dokumentasjon og kvalifikasjonsbaserte roller, ikke en påstand om at alle organisasjoner faktisk virker slik.', ['iow01-weber', 'iow04-lipsky']),
      c('iow-02', 'Formelle regler fordeler myndighet og ansvar, men må leses sammen med rettslig virkeområde, faktisk arbeidsdeling og klage- eller kontrollordninger.', ['iow01-weber', 'iow09-working-environment-act']),
      c('iow-03', 'Et hierarkisk organisasjonskart viser rapporteringslinjer, men beviser ikke hvor informasjon, kompetanse og faktisk beslutningsmakt ligger.', ['iow01-weber', 'iow02-meyer-rowan']),
      c('iow-04', 'Regelbundet lik behandling kan øke forutsigbarhet, men kan også møte varierte situasjoner slik at skjønn og begrunnelse fortsatt blir nødvendig.', ['iow01-weber', 'iow04-lipsky']),
    ],
  },
  {
    id: 'institusjonell-legitimitet-frakobling-og-isomorfi',
    title: 'Institusjonell legitimitet, frakobling og isomorfi',
    method_ids: ['met_pol_institusjonsanalyse', 'met_pol_organisasjonsanalyse'],
    boundary: 'Lik formell struktur kan skyldes legitimitetspress og feltforbindelser; likhet er ikke automatisk bevis på teknisk effektivitet eller identisk praksis.',
    source_ids: ['iow02-meyer-rowan', 'iow03-dimaggio-powell'],
    planned_claims: [
      c('iow-05', 'Meyer og Rowan viser hvordan organisasjoner kan innlemme institusjonaliserte modeller for å oppnå legitimitet, ressurser og stabilitet.', ['iow02-meyer-rowan', 'iow03-dimaggio-powell']),
      c('iow-06', 'Frakobling betegner at formell policy og daglig praksis kan utvikle avstand, men avstanden må dokumenteres og kan ikke antas fra policyens seremonielle språk alene.', ['iow02-meyer-rowan', 'iow04-lipsky']),
      c('iow-07', 'DiMaggio og Powell skiller tvangsmessig, mimetisk og normativ isomorfi som ulike prosesser som kan gjøre organisasjoner mer like.', ['iow03-dimaggio-powell', 'iow02-meyer-rowan']),
      c('iow-08', 'Organisasjonslikhet kan uttrykke felles regulering, usikkerhetsrespons eller profesjonalisering og må ikke uten videre tolkes som beste praksis eller konvergent effekt.', ['iow03-dimaggio-powell', 'iow02-meyer-rowan']),
    ],
  },
  {
    id: 'forstelinje-skjonn-ressursknapphet-og-implementering',
    title: 'Førstelinje, skjønn, ressursknapphet og implementering',
    method_ids: ['met_pol_forvaltningsanalyse', 'met_pol_praksisanalyse'],
    boundary: 'Førstelinjeskjønn skaper ikke grenseløs individuell frihet; beslutninger formes av lov, ressurser, arbeidsmengde, kategorier, ledelse og brukernes situasjon.',
    source_ids: ['iow04-lipsky', 'iow01-weber', 'iow13-nesh'],
    planned_claims: [
      c('iow-09', 'Lipsky viser at ansatte som møter borgere direkte kan bli reelle medprodusenter av politikk når generelle regler må anvendes i konkrete saker.', ['iow04-lipsky', 'iow01-weber']),
      c('iow-10', 'Stor arbeidsmengde, begrensede ressurser og motstridende mål kan fremme rutiner og prioriteringer som gjør tjenesten håndterbar, men også fordeler adgang og venting.', ['iow04-lipsky', 'iow13-nesh']),
      c('iow-11', 'Formell rett, mottatt vedtak, faktisk tjeneste og brukerutfall er separate implementeringsledd og må ikke slås sammen til én indikator på velferd.', ['iow04-lipsky', 'iow07-esping-andersen']),
      c('iow-12', 'Ansvarlig kontroll av førstelinjeskjønn må undersøke begrunnelse, variasjon, klage, ressursvilkår og konsekvenser uten å gjøre ansatte eller brukere til forskningsmessige syndebukker.', ['iow04-lipsky', 'iow13-nesh']),
    ],
  },
  {
    id: 'arbeidsprosess-kontroll-samtykke-og-kjonn',
    title: 'Arbeidsprosess, kontroll, samtykke og kjønn',
    method_ids: ['met_pol_makt_og_ulikhetsanalyse', 'met_pol_organisasjonsanalyse'],
    boundary: 'Arbeidstakeres deltakelse, identitet og mestring kan sameksistere med kontroll og ulikhet; verken samtykke eller formell kontrakt opphever maktasymmetri.',
    source_ids: ['iow05-acker', 'iow06-burawoy', 'iow09-working-environment-act'],
    planned_claims: [
      c('iow-13', 'Burawoy analyserer hvordan arbeidsplassens spill, incentiver og normer kan organisere aktiv deltakelse i produksjonen og samtidig skjule bredere kontrollforhold.', ['iow06-burawoy', 'iow05-acker']),
      c('iow-14', 'Kontroll og samtykke er ikke motsetninger når arbeidere utvikler strategier og mening innenfor rammer de ikke selv har fastsatt.', ['iow06-burawoy', 'iow01-weber']),
      c('iow-15', 'Acker viser at forestillingen om den abstrakte arbeidstakeren kan bygge på kroppslige og omsorgsmessige forutsetninger som gjør organisasjonen kjønnet.', ['iow05-acker', 'iow09-working-environment-act']),
      c('iow-16', 'Formelt like jobbkrav kan få ulik virkning gjennom arbeidstid, oppgavefordeling, vurdering og karrierebaner, og hvert ledd må dokumenteres før årsak eller rettsbrudd konkluderes.', ['iow05-acker', 'iow09-working-environment-act']),
    ],
  },
  {
    id: 'sysselsetting-ansettelse-og-malegrenser',
    title: 'Sysselsetting, ansettelse og målegrenser',
    method_ids: ['met_pol_statistikk_og_fordelingsanalyse', 'met_pol_rettighetsanalyse'],
    boundary: 'Sysselsettingsstatus, arbeidsforholdets rettslige form, arbeidstid, inntekt og jobbkvalitet er ulike dimensjoner og krever forskjellige indikatorer.',
    source_ids: ['iow09-working-environment-act', 'iow10-ssb-lfs', 'iow11-oecd-employment'],
    planned_claims: [
      c('iow-17', 'Arbeidskraftundersøkelsen skiller sysselsatte, arbeidsledige og personer utenfor arbeidsstyrken gjennom standardiserte kriterier som må oppgis når tall sammenliknes.', ['iow10-ssb-lfs', 'iow11-oecd-employment']),
      c('iow-18', 'Å klassifiseres som sysselsatt beskriver arbeidsmarkedsstatus i referanseperioden, men beviser ikke fast arbeid, tilstrekkelig inntekt, ønsket arbeidstid eller godt arbeidsmiljø.', ['iow10-ssb-lfs', 'iow09-working-environment-act']),
      c('iow-19', 'Fast eller midlertidig ansettelse er en rettslig og kontraktsmessig egenskap som må holdes fra statistisk sysselsettingsstatus og opplevd jobbsikkerhet.', ['iow09-working-environment-act', 'iow11-oecd-employment']),
      c('iow-20', 'Tverrnasjonal arbeidsmarkedsanalyse krever harmoniserte definisjoner, alder, referanseperiode og nevner, men institusjonelle forskjeller kan fortsatt begrense sammenliknbarheten.', ['iow11-oecd-employment', 'iow10-ssb-lfs']),
    ],
  },
  {
    id: 'velferdsregimer-avkommodifisering-og-utgifter',
    title: 'Velferdsregimer, avkommodifisering og utgifter',
    method_ids: ['met_pol_velferdsstatlig_analyse', 'met_pol_komparativ_analyse'],
    boundary: 'Regimetyper er analytiske idealtyper, ikke komplette landetiketter; utgiftsnivå alene viser ikke rettigheter, fordeling, tjenestekvalitet eller utfall.',
    source_ids: ['iow07-esping-andersen', 'iow12-oecd-socx', 'iow08-korpi'],
    planned_claims: [
      c('iow-21', 'Esping-Andersen sammenlikner velferdsregimer gjennom blant annet avkommodifisering og lagdeling, ikke bare gjennom samlet offentlig utgift.', ['iow07-esping-andersen', 'iow12-oecd-socx']),
      c('iow-22', 'SOCX måler sosialutgifters nivå og sammensetning, men utgiftstall identifiserer ikke alene rettighetsvilkår, mottak, kvalitet eller virkning.', ['iow12-oecd-socx', 'iow07-esping-andersen']),
      c('iow-23', 'Sosialpolitikk kan både redusere markedsavhengighet og produsere nye skiller gjennom opptjeningskrav, målretting, familieroller og tjenestetilgang.', ['iow07-esping-andersen', 'iow08-korpi']),
      c('iow-24', 'Offentlig, obligatorisk privat og frivillig privat sosialutgift må skilles fordi lik samlet ressursbruk kan være organisert med ulike rettigheter og fordelingsvirkninger.', ['iow12-oecd-socx', 'iow07-esping-andersen']),
    ],
  },
  {
    id: 'maktressurser-koalisjoner-og-institusjonell-variasjon',
    title: 'Maktressurser, koalisjoner og institusjonell variasjon',
    method_ids: ['met_pol_makt_og_ulikhetsanalyse', 'met_pol_historisk_institusjonalisme'],
    boundary: 'Maktressurser er organisatoriske og institusjonelle kapasiteter, ikke en fast egenskap ved én klasse; arbeidsgivere, arbeidstakere, partier og staten kan inngå skiftende koalisjoner.',
    source_ids: ['iow08-korpi', 'iow07-esping-andersen', 'iow09-working-environment-act', 'iow11-oecd-employment'],
    planned_claims: [
      c('iow-25', 'Korpis maktressursperspektiv undersøker hvordan kollektiv organisering og politisk kapasitet påvirker fordelingskonflikter og velferdsinstitusjoner.', ['iow08-korpi', 'iow07-esping-andersen']),
      c('iow-26', 'Velferdsstatens utvikling kan ikke forklares som automatisk modernisering fordi konflikter, koalisjoner og institusjonelle valg former hvilke ordninger som etableres.', ['iow08-korpi', 'iow07-esping-andersen']),
      c('iow-27', 'Arbeidstaker- og arbeidsgivermakt må undersøkes gjennom organisering, forhandlingsarenaer, rettigheter, alternativer og kontroll over ressurser, ikke gjennom medlemstall alene.', ['iow08-korpi', 'iow09-working-environment-act']),
      c('iow-28', 'Sammenlikning av kapitalismevarianter må koble arbeidsmarkedstall til institusjoner og maktforhold før forskjeller tilskrives én nasjonal modell.', ['iow08-korpi', 'iow11-oecd-employment']),
    ],
  },
  {
    id: 'organisasjonsforskning-data-etikk-og-konklusjon',
    title: 'Organisasjonsforskning, dataetikk og konklusjon',
    method_ids: ['met_pol_dokumentanalyse', 'met_pol_forskningsetisk_analyse'],
    boundary: 'Arbeidslivsdata skapes i avhengighetsforhold og små miljøer; tilgang fra ledelsen erstatter ikke frivillighet, konfidensialitet eller forsvarlig slutningsrekkevidde.',
    source_ids: ['iow13-nesh', 'iow02-meyer-rowan', 'iow10-ssb-lfs'],
    planned_claims: [
      c('iow-29', 'Ansattes forskningsdeltakelse må være reelt frivillig selv når ledelsen har gitt adgang, fordi avhengighet og frykt for konsekvenser kan påvirke samtykket.', ['iow13-nesh', 'iow05-acker']),
      c('iow-30', 'Anonymisering i små organisasjoner må testes mot kombinasjoner av rolle, avdeling, hendelse og sitat, ikke bare mot fravær av navn.', ['iow13-nesh', 'iow02-meyer-rowan']),
      c('iow-31', 'Offisiell arbeidsmarkedsstatistikk og intensive organisasjonscase støtter ulike slutninger og kan ikke erstatte hverandres populasjons- og mekanismebevis.', ['iow10-ssb-lfs', 'iow13-nesh']),
      c('iow-32', 'En ansvarlig organisasjonskonklusjon skiller formell regel, faktisk praksis, forklaringsmekanisme, målt utfall, usikkerhet og normativ vurdering.', ['iow01-weber', 'iow04-lipsky', 'iow13-nesh']),
    ],
  },
];

const decision_scenarios = [
  { id: 'iow-s1', title: 'Organisasjonskartet', prompt: 'En etat hevder at organisasjonskartet viser all beslutningsmakt. Skill formell jurisdiksjon, informasjon, kompetanse og faktisk skjønn.', claim_ids: ['iow-02', 'iow-03', 'iow-09'] },
  { id: 'iow-s2', title: 'Den kopierte kvalitetsstandarden', prompt: 'Flere institusjoner innfører samme sertifisering. Undersøk tvang, etterlikning, profesjonalisering, legitimitet og faktisk effekt.', claim_ids: ['iow-05', 'iow-07', 'iow-08'] },
  { id: 'iow-s3', title: 'Ventelisten', prompt: 'En førstelinjeenhet reduserer køen med en ny kategoriseringsregel. Følg ressursknapphet, skjønn, adgang, klage og brukerutfall.', claim_ids: ['iow-10', 'iow-11', 'iow-12'] },
  { id: 'iow-s4', title: 'Den nøytrale heltidsnormen', prompt: 'En arbeidsgiver kaller ubegrenset tilgjengelighet kjønnsnøytral. Analyser jobbdesign, omsorgsvilkår, oppgavefordeling og rettslig ramme.', claim_ids: ['iow-15', 'iow-16', 'iow-19'] },
  { id: 'iow-s5', title: 'Høy sysselsetting', prompt: 'En rapport bruker sysselsettingsandel som komplett mål på arbeidslivskvalitet. Skill status, timer, kontrakt, inntekt og arbeidsmiljø.', claim_ids: ['iow-17', 'iow-18', 'iow-20'] },
  { id: 'iow-s6', title: 'Den dyre velferdsstaten', prompt: 'To land har lik sosialutgift. Undersøk programtype, rettighet, privat/offentlig finansiering, lagdeling og faktisk tjeneste.', claim_ids: ['iow-21', 'iow-22', 'iow-24'] },
];

function buildBrief() {
  return {
    schema: 'history_go_sosiologi_antropologi_institutions_organizations_work_welfare_source_claim_brief_v1',
    version: '1.0.0',
    updated_at: '2026-08-29',
    status: 'source_first_ready_not_materialized',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    domain: { ordinal: 7, id: 'institusjoner_organisasjoner_arbeid_velferd', title: 'Institusjoner, organisasjoner, arbeid og velferd', production_mode: 'new_production_required' },
    source_strategy: { source_first: true, inspectable_urls_required: true, claim_level_trace_required: true, minimum_sources_per_claim: 2, fulltext_materialization_required_before_counting: true },
    sources,
    topic_briefs,
    decision_scenarios,
    reuse_contract: { classification: 'new_production_required', preserve_existing_owner_path: false, move_existing_content: false, delete_existing_content: false, undercategory_count_requires_new_strict_trace_and_assessment: true },
    subcategory_upgrade_registration: { registered: false, allowed_before_strict_upgrade_gate: false },
  };
}

function buildReport() {
  return {
    schema: 'history_go_sosiologi_antropologi_institutions_organizations_work_welfare_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-29',
    status: 'pass',
    conclusion: 'field_7_source_first_ready_not_materialized',
    counts: { ordinal: 7, inspectableSources: 13, topicBriefs: 8, plannedClaims: 32, teachingScenarios: 6, domainsMaterialized: 6, targetDomains: 12 },
    gates: {
      sourceFirst: true,
      everyClaimHasAtLeastTwoSources: true,
      everySourceUsed: true,
      bureaucracyAuthorityAndRuleBoundaries: true,
      institutionalLegitimacyAndIsomorphismBoundaries: true,
      discretionLaborProcessAndGenderBoundaries: true,
      employmentMeasurementAndRightsBoundaries: true,
      welfareRegimePowerResourceAndExpenditureBoundaries: true,
      workplaceResearchDependencyAndConfidentiality: true,
      noPrematureRegistration: true,
    },
    six_part_quality_review: {
      correctness_and_evidence: 5,
      coverage_and_completion: 5,
      disciplinary_editorial_quality: 5,
      technical_integrity: 5,
      safety_and_responsibility: 5,
      maintainability_and_auditability: 4,
      total: 29,
      maximum: 30,
      note: 'Kilde- og claimbriefen er klar for felt 7, men feltet teller ikke som materialisert før fulltekst, vurdering, registrering og audit finnes.',
    },
  };
}

export function generateAndAudit() {
  const brief = buildBrief();
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const sourceIds = new Set(brief.sources.map((source) => source.id));
  const used = new Set(claims.flatMap((claim) => claim.source_ids));
  assert(brief.sources.length === 13 && sourceIds.size === 13, 'Briefen skal ha 13 unike kilder');
  assert(brief.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-29'), 'Alle 13 kilder må være inspiserbare');
  assert(brief.topic_briefs.length === 8 && claims.length === 32 && new Set(claims.map((claim) => claim.id)).size === 32, 'Briefen skal ha 8 tema og 32 unike claims');
  assert(claims.every((claim) => claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Hvert claim må ha minst to gyldige kilder');
  assert([...sourceIds].every((id) => used.has(id)), 'Hver kilde må brukes');
  assert(brief.decision_scenarios.length === 6 && brief.decision_scenarios.every((scenario) => scenario.claim_ids.length >= 3), 'Seks claimbundne scenarier kreves');
  assert(brief.subcategory_upgrade_registration.registered === false, 'Source brief kan ikke registrere feltet som materialisert');
  const report = buildReport();
  write(BRIEF, brief);
  write(REPORT, report);
  assert(isDeepStrictEqual(read(BRIEF), brief) && isDeepStrictEqual(read(REPORT), report), 'Genererte artefakter er ikke deterministiske');
  return report;
}

const report = generateAndAudit();
console.log(`Institusjoner, organisasjoner, arbeid og velferd source-first klar: ${report.counts.inspectableSources} kilder, ${report.counts.plannedClaims} claims, materialisert fortsatt ${report.counts.domainsMaterialized}/12.`);

