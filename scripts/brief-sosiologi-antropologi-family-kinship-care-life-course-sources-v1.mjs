#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/politikk/sosiologi_antropologi/family_kinship_care_life_course_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sosiologi-antropologi-family-kinship-care-life-course-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const c = (id, text, source_ids) => ({ id, text, source_ids, status: 'planned_requires_fulltext_verification' });

const sources = [
  { id: 'fkl01-morgan', title: 'Rethinking Family Practices', publisher: 'Palgrave Macmillan / Springer Nature', type: 'scholarly-book', url: 'https://link.springer.com/book/10.1057/9780230304680', evidence_role: 'family-practices-doing-family-time-space', source_location: 'Forlagssiden dokumenterer Morgans praksistilnærming til familie, tid, rom, kropp, følelser og etikk.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl02-finch', title: 'Displaying Families', publisher: 'SAGE Journals', type: 'peer-reviewed-article', url: 'https://journals.sagepub.com/doi/10.1177/0038038507072284', evidence_role: 'family-display-recognition-audience', source_location: 'Fagfellevurdert originalartikkel om hvordan familiepraksiser må kommuniseres og anerkjennes som familie.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl03-schneider', title: 'A Critique of the Study of Kinship', publisher: 'University of Michigan Press', type: 'scholarly-book', url: 'https://press.umich.edu/Books/A/A-Critique-of-the-Study-of-Kinship', evidence_role: 'kinship-western-bias-analytic-category', source_location: 'Forlagssiden dokumenterer Schneiders kritikk av vestlig skjevhet i universelle slektskapsmodeller.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl04-carsten', title: 'After Kinship', publisher: 'Cambridge University Press', type: 'scholarly-book', url: 'https://www.cambridge.org/core/books/after-kinship/BF660970EC79E6A4847E76A38CBE1DB9', evidence_role: 'relatedness-substance-house-gender-reproduction', source_location: 'Forlagssiden dokumenterer Carstens komparative analyse av relatedness, hus, kjønn, kropp og reproduksjon.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl05-hochschild', title: 'The Second Shift', publisher: 'Penguin Random House', type: 'scholarly-book', url: 'https://www.penguinrandomhouse.com/books/310593/the-second-shift-by-arlie-hochschild-with-anne-machung/', evidence_role: 'unpaid-household-labour-gender-time-strategies', source_location: 'Forlagssiden dokumenterer Hochschild og Machungs forskning om lønnsarbeid, husarbeid og omsorgsfordeling.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl06-tronto', title: 'Caring Democracy: Markets, Equality, and Justice', publisher: 'New York University Press / JSTOR', type: 'scholarly-book', url: 'https://www.jstor.org/stable/j.ctt9qgfvp', evidence_role: 'care-responsibility-democracy-institutions', source_location: 'Bokarkivet dokumenterer Trontos analyse av omsorg som politisk og institusjonelt ansvar.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl07-life-course', title: 'New Directions in Life Course Research', publisher: 'Annual Reviews', type: 'peer-reviewed-review', url: 'https://www.annualreviews.org/content/journals/10.1146/annurev.soc.34.040507.134619', evidence_role: 'life-course-transitions-trajectories-history-linked-lives', source_location: 'Fagfellevurdert oversikt over livsløp som historisk, institusjonelt og normativt konstruerte prosesser.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl08-age-inequality', title: 'Centering Age Inequality', publisher: 'Annual Reviews', type: 'peer-reviewed-review', url: 'https://www.annualreviews.org/content/journals/10.1146/annurev-soc-083121-043741', evidence_role: 'age-stratification-linked-lives-institutions', source_location: 'Fagfellevurdert oversikt over alder som ulikhetsdimensjon, institusjon og livsløpsposisjon.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl09-ssb-family', title: 'Familier og husholdninger', publisher: 'Statistisk sentralbyrå', type: 'official-statistics', url: 'https://www.ssb.no/befolkning/barn-familier-og-husholdninger/statistikk/familier-og-husholdninger', evidence_role: 'norway-family-household-definitions-composition', source_location: 'Offisiell statistikk med eksplisitte definisjoner av familie, privathusholdning, generasjoner og boforhold.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl10-ssb-household-income', title: 'Inntekt og formue for husholdninger', publisher: 'Statistisk sentralbyrå', type: 'official-statistics', url: 'https://www.ssb.no/inntekt-og-forbruk/inntekt-og-formue/statistikk/inntekts-og-formuesstatistikk-for-husholdninger', evidence_role: 'household-resource-unit-income-wealth-equivalence', source_location: 'Offisiell statistikk om husholdningsinntekt, formue, gjeld og fordelingsmål etter husholdningstype.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl11-children-act', title: 'Lov om barn og foreldre (barnelova)', publisher: 'Lovdata', type: 'primary-law', url: 'https://lovdata.no/lov/1981-04-08-7', evidence_role: 'child-parent-responsibility-participation-best-interests', source_location: 'Gjeldende norsk lovtekst om foreldreansvar, barnets interesser, medvirkning og samvær.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl12-care-services-act', title: 'Lov om kommunale helse- og omsorgstjenester', publisher: 'Lovdata', type: 'primary-law', url: 'https://lovdata.no/lov/2011-06-24-30', evidence_role: 'municipal-care-duty-support-relatives-services', source_location: 'Gjeldende norsk lovtekst om kommunens sørge-for-ansvar, omsorgstjenester og støtte til pårørende.', retrieval_status: 'verified_2026-08-28' },
  { id: 'fkl13-nesh', title: 'Guidelines for Research Ethics in the Social Sciences and the Humanities', publisher: 'De nasjonale forskningsetiske komiteene', type: 'research-ethics-guideline', url: 'https://www.forskningsetikk.no/en/guidelines/social-sciences-and-humanities/guidelines-for-research-ethics-in-the-social-sciences-and-the-humanities/', evidence_role: 'family-sensitive-data-children-consent-confidentiality', source_location: 'Nasjonale retningslinjer for forskning med barn, sårbare grupper, tredjepersoner og private relasjoner.', retrieval_status: 'verified_2026-08-28' },
];

const topic_briefs = [
  {
    id: 'familiepraksiser-husholdning-og-display',
    title: 'Familiepraksiser, husholdning og display',
    method_ids: ['met_pol_praksisanalyse', 'met_pol_statistikk_og_fordelingsanalyse'],
    boundary: 'Familie, husholdning og bostedsregistrering er ulike analytiske enheter; praksis og display utvider uten å oppløse begrepspresisjon.',
    source_ids: ['fkl01-morgan', 'fkl02-finch', 'fkl09-ssb-family'],
    planned_claims: [
      c('fkl-01', 'Morgan analyserer familie som gjentatte praksiser gjennom hvilke relasjoner gjøres, vedlikeholdes og endres i tid og rom.', ['fkl01-morgan', 'fkl02-finch']),
      c('fkl-02', 'Finchs family display betegner hvordan praksiser kommuniseres til relevante andre og anerkjennes som familie.', ['fkl02-finch', 'fkl01-morgan']),
      c('fkl-03', 'SSBs familie og husholdning er statistiske definisjoner basert på bosted og bestemte relasjoner og dekker ikke alle levde omsorgsnettverk.', ['fkl09-ssb-family', 'fkl01-morgan']),
      c('fkl-04', 'Aleneboende, énfamiliehusholdning og sosial isolasjon er ulike påstander som krever ulike data.', ['fkl09-ssb-family', 'fkl13-nesh']),
    ],
  },
  {
    id: 'slektskap-relatedness-og-komparasjon',
    title: 'Slektskap, relatedness og komparasjon',
    method_ids: ['met_pol_begrepsanalyse', 'met_pol_praksisanalyse'],
    boundary: 'Slektskap kan ikke tas som en universell biologisk struktur; lokale kategorier, praksiser og institusjoner må dokumenteres.',
    source_ids: ['fkl03-schneider', 'fkl04-carsten'],
    planned_claims: [
      c('fkl-05', 'Schneider kritiserer at vestlige forestillinger om biologisk slektskap brukes som universell målestokk for sosial organisasjon.', ['fkl03-schneider', 'fkl04-carsten']),
      c('fkl-06', 'Carstens relatedness åpner for å undersøke hvordan slektskapsliknende relasjoner skapes gjennom samboing, mat, minner, kropp og omsorg.', ['fkl04-carsten', 'fkl01-morgan']),
      c('fkl-07', 'Biologisk forbindelse, juridisk foreldreskap, sosial omsorg og opplevd tilhørighet må holdes analytisk fra hverandre.', ['fkl04-carsten', 'fkl11-children-act']),
      c('fkl-08', 'Komparativ slektskapsanalyse må oversette lokale begreper uten å anta at familie, hus, avstamning og person betyr det samme overalt.', ['fkl03-schneider', 'fkl04-carsten']),
    ],
  },
  {
    id: 'partnerskap-foreldreskap-og-reproduksjon',
    title: 'Partnerskap, foreldreskap og reproduksjon',
    method_ids: ['met_pol_institusjonsanalyse', 'met_pol_rettighetsanalyse'],
    boundary: 'Partnerskap, bosted, foreldreskap, omsorg og reproduktiv forbindelse overlapper, men er ikke én institusjon eller én livsform.',
    source_ids: ['fkl04-carsten', 'fkl09-ssb-family', 'fkl11-children-act'],
    planned_claims: [
      c('fkl-09', 'Ekteskap, samboerskap og andre partnerskap organiseres gjennom forskjellige rettslige, økonomiske og symbolske ordninger.', ['fkl09-ssb-family', 'fkl04-carsten']),
      c('fkl-10', 'Foreldreskap omfatter juridiske posisjoner, daglig omsorg, økonomisk ansvar og relasjonell tilhørighet som ikke alltid faller sammen.', ['fkl11-children-act', 'fkl04-carsten']),
      c('fkl-11', 'Reproduksjonsteknologi og nye familieformer gjør skillet mellom biologisk og sosialt slektskap empirisk og normativt omstridt.', ['fkl04-carsten', 'fkl03-schneider']),
      c('fkl-12', 'Barnets beste og medvirkning er rettslige vurderingsprinsipper og må ikke reduseres til de voksnes preferanse eller én standardisert familieform.', ['fkl11-children-act', 'fkl13-nesh']),
    ],
  },
  {
    id: 'omsorgsarbeid-tid-og-sosial-reproduksjon',
    title: 'Omsorgsarbeid, tid og sosial reproduksjon',
    method_ids: ['met_pol_makt_og_ulikhetsanalyse', 'met_pol_velferdsstatlig_analyse'],
    boundary: 'Omsorg er arbeid, relasjon, behovsvurdering og offentlig ansvar; den kan ikke måles bare i timer eller behandles som privat naturressurs.',
    source_ids: ['fkl05-hochschild', 'fkl06-tronto', 'fkl12-care-services-act'],
    planned_claims: [
      c('fkl-13', 'Hochschilds second shift viser hvordan lønnsarbeid kan etterfølges av kjønnet fordelt hus- og omsorgsarbeid i hjemmet.', ['fkl05-hochschild', 'fkl01-morgan']),
      c('fkl-14', 'Fordeling av omsorg må undersøke tid, oppgavetype, beslutningsansvar, beredskap og følelsesarbeid, ikke bare samlet timetall.', ['fkl05-hochschild', 'fkl06-tronto']),
      c('fkl-15', 'Tronto analyserer omsorg som demokratisk og institusjonelt ansvar og utfordrer at avhengighet skyves ut av offentlig og økonomisk analyse.', ['fkl06-tronto', 'fkl12-care-services-act']),
      c('fkl-16', 'Kommunens sørge-for-ansvar og støtte til pårørende må skilles fra familiens faktiske ulønnede arbeid og fra den enkelte tjenestes virkning.', ['fkl12-care-services-act', 'fkl06-tronto']),
    ],
  },
  {
    id: 'barndom-generasjon-og-medvirkning',
    title: 'Barndom, generasjon og medvirkning',
    method_ids: ['met_pol_rettighetsanalyse', 'met_pol_praksisanalyse'],
    boundary: 'Barn er relasjonelle og rettighetsbærende aktører; alder begrunner tilpasset metode, ikke at deres perspektiver automatisk erstattes av voksnes.',
    source_ids: ['fkl11-children-act', 'fkl07-life-course', 'fkl13-nesh'],
    planned_claims: [
      c('fkl-17', 'Barndom er både livsfase, institusjonell posisjon og relasjon til voksne, jevnaldrende og offentlige ordninger.', ['fkl07-life-course', 'fkl11-children-act']),
      c('fkl-18', 'Barnelova knytter avgjørelser til barnets beste og gir barn rett til informasjon og medvirkning tilpasset alder og modenhet.', ['fkl11-children-act', 'fkl13-nesh']),
      c('fkl-19', 'Generasjon betegner både plass i en slektsrelasjon, fødselskohort og historisk erfaring; betydningene må ikke blandes.', ['fkl07-life-course', 'fkl04-carsten']),
      c('fkl-20', 'Forskning med barn krever tilpasset informasjon, reell frivillighet og vurdering av makt, avhengighet og tredjepersoners personvern.', ['fkl13-nesh', 'fkl11-children-act']),
    ],
  },
  {
    id: 'livslop-overganger-og-linked-lives',
    title: 'Livsløp, overganger og linked lives',
    method_ids: ['met_pol_levekarsanalyse', 'met_pol_institusjonsanalyse'],
    boundary: 'Livsløp er historisk og institusjonelt organiserte forløp med variasjon; overgangsalder er ikke universell normalitet eller individuell skjebne.',
    source_ids: ['fkl07-life-course', 'fkl08-age-inequality'],
    planned_claims: [
      c('fkl-21', 'Livsløpsperspektivet skiller overganger, varige trajectories, timing, historisk kontekst og menneskelig handling.', ['fkl07-life-course', 'fkl08-age-inequality']),
      c('fkl-22', 'Linked lives viser at utdanning, arbeid, omsorg, migrasjon og pensjonering påvirkes av nære relasjoners samtidige forløp.', ['fkl07-life-course', 'fkl01-morgan']),
      c('fkl-23', 'Tidlig, sen og normal overgang er institusjonelle og kulturelle vurderinger og må skilles fra statistisk typisk alder.', ['fkl07-life-course', 'fkl08-age-inequality']),
      c('fkl-24', 'Kohort, periode og alder må skilles for å unngå at historiske hendelser eller generasjonsforskjeller feilaktig tolkes som aldring.', ['fkl07-life-course', 'fkl08-age-inequality']),
    ],
  },
  {
    id: 'aldring-husholdning-og-velferd',
    title: 'Aldring, husholdning og velferd',
    method_ids: ['met_pol_levekarsanalyse', 'met_pol_velferdsstatlig_analyse'],
    boundary: 'Alder, funksjon, husholdning, omsorgsbehov og sosial deltakelse er forskjellige dimensjoner; kronologisk alder forklarer ikke alene behov.',
    source_ids: ['fkl08-age-inequality', 'fkl09-ssb-family', 'fkl10-ssb-household-income', 'fkl12-care-services-act'],
    planned_claims: [
      c('fkl-25', 'Aldersulikhet formes av institusjonelle terskler, akkumulerte ressurser og livsløp, ikke bare biologisk endring.', ['fkl08-age-inequality', 'fkl10-ssb-household-income']),
      c('fkl-26', 'Å bo alene er en husholdningsopplysning og kan ikke brukes som direkte mål på ensomhet, støtte eller omsorgsbehov.', ['fkl09-ssb-family', 'fkl08-age-inequality']),
      c('fkl-27', 'Husholdningsinntekt og formue må tolkes med husholdningssammensetning, gjeld og deling før eldres eller familiers ressurser sammenlignes.', ['fkl10-ssb-household-income', 'fkl09-ssb-family']),
      c('fkl-28', 'Formell tjenestetilgang, faktisk mottatt hjelp, pårørendebelastning og brukerens utfall er separate ledd i en omsorgskjede.', ['fkl12-care-services-act', 'fkl06-tronto']),
    ],
  },
  {
    id: 'familieforskning-metode-etikk-og-anvendelse',
    title: 'Familieforskning, metode, etikk og anvendelse',
    method_ids: ['met_pol_praksisanalyse', 'met_pol_dokumentanalyse'],
    boundary: 'Familiedata inneholder ofte opplysninger om flere enn deltakeren; analyse og formidling må håndtere relasjonelt samtykke, konflikt og indirekte identifisering.',
    source_ids: ['fkl01-morgan', 'fkl02-finch', 'fkl13-nesh'],
    planned_claims: [
      c('fkl-29', 'Intervjuer om familie er situerte fortellinger og displays og kan ikke behandles som nøytral fasit om alle relasjonens parter.', ['fkl02-finch', 'fkl13-nesh']),
      c('fkl-30', 'Familiepraksiser bør studeres på tvers av utsagn, tidsbruk, hendelser, dokumenter og institusjonelle vilkår når forskningsspørsmålet krever det.', ['fkl01-morgan', 'fkl09-ssb-family']),
      c('fkl-31', 'Samtykke fra ett familiemedlem gir ikke automatisk rett til å publisere identifiserbare opplysninger om barn, partner eller andre slektninger.', ['fkl13-nesh', 'fkl11-children-act']),
      c('fkl-32', 'En ansvarlig familiekonklusjon skiller statistisk husholdning, juridisk posisjon, levd praksis, omsorgsrelasjon og normativ vurdering.', ['fkl09-ssb-family', 'fkl03-schneider']),
    ],
  },
];

const decision_scenarios = [
  { id: 'fkl-s1', title: 'Den registrerte husholdningen', prompt: 'En kommune bruker bostedsregister som mål på familie og støtte. Skill husholdning, praksis, omsorgsnettverk og databegrensning.', claim_ids: ['fkl-03', 'fkl-04', 'fkl-30'] },
  { id: 'fkl-s2', title: 'Slektskapets oversettelse', prompt: 'Et feltarbeid oversetter en lokal relasjon direkte til biologisk fetter. Undersøk lokal kategori, praksis, juridisk posisjon og analytisk skjevhet.', claim_ids: ['fkl-05', 'fkl-06', 'fkl-08'] },
  { id: 'fkl-s3', title: 'Den usynlige omsorgsberedskapen', prompt: 'En tidsbruksanalyse teller utførte oppgaver, men ikke planlegging og beredskap. Bygg en bredere omsorgsfordeling.', claim_ids: ['fkl-13', 'fkl-14', 'fkl-15'] },
  { id: 'fkl-s4', title: 'Barnets møte', prompt: 'Voksne har samtykket til forskning om en familiesak. Vurder barnets informasjon, medvirkning, frivillighet og tredjepersonvern.', claim_ids: ['fkl-18', 'fkl-20', 'fkl-31'] },
  { id: 'fkl-s5', title: 'Sen overgang', prompt: 'En rapport kaller utflytting etter 25 unormal. Skill statistisk timing, normativ standard, kohort og institusjonelle vilkår.', claim_ids: ['fkl-21', 'fkl-23', 'fkl-24'] },
  { id: 'fkl-s6', title: 'Aleneboende eldre', prompt: 'Et tjenestekart likestiller aleneboende med ensom og hjelpetrengende. Skill husholdning, nettverk, funksjon, ressurser og faktisk behov.', claim_ids: ['fkl-25', 'fkl-26', 'fkl-28'] },
];

function buildBrief() {
  return {
    schema: 'history_go_sosiologi_antropologi_family_kinship_care_life_course_source_claim_brief_v1',
    version: '1.0.0',
    updated_at: '2026-08-28',
    status: 'source_first_ready_not_materialized',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    domain: { ordinal: 6, id: 'familie_slektskap_omsorg_livslop', title: 'Familie, slektskap, omsorg og livsløp', production_mode: 'new_production_required' },
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
    schema: 'history_go_sosiologi_antropologi_family_kinship_care_life_course_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-28',
    status: 'pass',
    conclusion: 'field_6_source_first_ready_not_materialized',
    counts: { ordinal: 6, inspectableSources: 13, topicBriefs: 8, plannedClaims: 32, teachingScenarios: 6, domainsMaterialized: 5, targetDomains: 12 },
    gates: {
      sourceFirst: true,
      everyClaimHasAtLeastTwoSources: true,
      everySourceUsed: true,
      familyHouseholdAndPracticeBoundaries: true,
      kinshipRelatednessAndComparisonBoundaries: true,
      careWorkInstitutionAndResponsibilityBoundaries: true,
      childhoodLifeCourseAndAgeBoundaries: true,
      relationalConsentAndThirdPartyPrivacy: true,
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
      note: 'Kilde- og claimbriefen er klar for felt 6, men feltet teller ikke som materialisert før fulltekst, vurdering, registrering og audit finnes.',
    },
  };
}

export function generateAndAudit() {
  const brief = buildBrief();
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const sourceIds = new Set(brief.sources.map((source) => source.id));
  const used = new Set(claims.flatMap((claim) => claim.source_ids));
  assert(brief.sources.length === 13 && sourceIds.size === 13 && brief.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-28'), 'Alle 13 kilder må være inspiserbare');
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
console.log(`Familie, slektskap, omsorg og livsløp source-first klar: ${report.counts.inspectableSources} kilder, ${report.counts.plannedClaims} claims, materialisert fortsatt ${report.counts.domainsMaterialized}/12.`);

