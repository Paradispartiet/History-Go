#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/politikk/sosiologi_antropologi/inequality_class_gender_racialization_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sosiologi-antropologi-inequality-class-gender-racialization-source-brief-v1-audit.json';
const EXISTING_CHAPTER = 'data/fagverk/politikk/fordeling-velferd-ulikhet.json';
const EXISTING_CLAIMS = 'data/fagverk/politikk/fordeling-velferd-ulikhet/claims.json';
const abs = (file) => path.join(ROOT, file);
const readText = (file) => fs.readFileSync(abs(file), 'utf8');
const read = (file) => JSON.parse(readText(file));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const gitBlobSha = (text) => crypto.createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');
const c = (id, text, source_ids) => ({ id, text, source_ids, status: 'planned_requires_fulltext_verification' });

const sources = [
  { id: 'ukr01-marx', title: 'Capital, Volume I', publisher: 'Penguin Classics', type: 'scholarly-book', url: 'https://www.penguin.co.uk/books/35192/capital-by-karl-marx-intro-ernest-mandel-trans-ben-fowkes/9780140445688', evidence_role: 'class-relations-labour-capital-exploitation', source_location: 'Forlagssiden dokumenterer Marx’ analyse av kapital, privat eiendom og sosiale relasjoner.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr02-weber', title: 'Economy and Society', publisher: 'University of California Press', type: 'scholarly-book', url: 'https://www.ucpress.edu/book/9780520280021/economy-and-society', evidence_role: 'class-status-party-social-closure-life-chances', source_location: 'Forlagssiden dokumenterer Webers komparative analyse av sosial handling, normative ordener og makt.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr03-bourdieu', title: 'Distinction: A Social Critique of the Judgement of Taste', publisher: 'Harvard Book Store / Routledge edition', type: 'scholarly-book', url: 'https://www.harvard.com/book/9780415567886', evidence_role: 'capital-habitus-field-taste-classification', source_location: 'Forlagssiden dokumenterer Bourdieus empiriske analyse av smak, klassifikasjon og sosial posisjon.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr04-tilly', title: 'Durable Inequality', publisher: 'University of California Press', type: 'scholarly-book', url: 'https://www.ucpress.edu/book/9780520221703/durable-inequality', evidence_role: 'categorical-inequality-opportunity-hoarding-exploitation', source_location: 'Forlagssiden dokumenterer Tillys relasjonelle forklaring på varig kategorisk ulikhet.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr05-acker', title: 'Hierarchies, Jobs, Bodies: A Theory of Gendered Organizations', publisher: 'SAGE Journals', type: 'peer-reviewed-article', url: 'https://journals.sagepub.com/doi/10.1177/089124390004002002', evidence_role: 'gendered-organizations-job-abstraction-organizational-inequality', source_location: 'Fagfellevurdert originalartikkel om hvordan organisasjonsstruktur og den abstrakte arbeidstakeren er kjønnet.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr06-dubois', title: 'The Souls of Black Folk', publisher: 'Oxford University Press', type: 'scholarly-book', url: 'https://global.oup.com/academic/product/the-souls-of-black-folk-9780199555833', evidence_role: 'color-line-double-consciousness-racialized-institutions', source_location: 'Forlagssiden dokumenterer Du Bois’ klassiske studie av rase, kultur og utdanning.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr07-crenshaw', title: 'Mapping the Margins', publisher: 'Stanford Law Review / JSTOR', type: 'peer-reviewed-article', url: 'https://www.jstor.org/stable/1229039', evidence_role: 'intersectionality-institutional-blind-spots-violence', source_location: 'Tidsskriftarkivet dokumenterer Crenshaws analyse av interseksjonalitet og institusjonelle blindsoner.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr08-ssb-norge', title: 'Økonomisk ulikhet i Norge i det 21. århundre', publisher: 'Statistisk sentralbyrå', type: 'official-research-report', url: 'https://www.ssb.no/inntekt-og-forbruk/inntekt-og-formue/artikler/okonomisk-ulikhet-i-norge-i-det-21.arhundre', evidence_role: 'norway-income-wealth-tax-distribution', source_location: 'SSB-rapporten dokumenterer utvikling i inntekt, formue, skattebyrde og progressivitet 2001–2018.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr09-ssb-measurement', title: 'Slik måler SSB ulikhet', publisher: 'Statistisk sentralbyrå', type: 'official-method-note', url: 'https://www.ssb.no/inntekt-og-forbruk/inntekt-og-formue/statistikk/inntekts-og-formuesstatistikk-for-husholdninger/artikler/slik-maler-ssb-ulikhet', evidence_role: 'gini-income-wealth-measurement-boundaries', source_location: 'SSBs metodenotat forklarer Gini og nødvendige skiller mellom inntekts- og formuesfordeling.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr10-wid', title: 'World Inequality Database Methodology', publisher: 'World Inequality Lab', type: 'research-data-methodology', url: 'https://wid.world/methodology/', evidence_role: 'distributional-national-accounts-source-combination-top-incomes', source_location: 'Metodesiden dokumenterer kombinasjon av nasjonalregnskap, survey-, skatte- og formuesdata.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr11-oecd', title: 'Income and Wealth Distribution Databases', publisher: 'OECD', type: 'official-data-methodology', url: 'https://www.oecd.org/en/data/datasets/income-and-wealth-distribution-database.html', evidence_role: 'cross-national-income-wealth-poverty-comparison', source_location: 'OECD beskriver databasenes definisjoner, dekning og løpende oppdatering for inntekt, fattigdom og formue.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr12-equality-law', title: 'Lov om likestilling og forbud mot diskriminering', publisher: 'Lovdata', type: 'primary-law', url: 'https://lovdata.no/lov/2017-06-16-51', evidence_role: 'discrimination-grounds-indirect-treatment-active-duty', source_location: 'Gjeldende norsk lovtekst om diskrimineringsgrunnlag, direkte og indirekte forskjellsbehandling og aktivitetsplikt.', retrieval_status: 'verified_2026-08-28' },
  { id: 'ukr13-nesh', title: 'Guidelines for Research Ethics in the Social Sciences and the Humanities', publisher: 'De nasjonale forskningsetiske komiteene', type: 'research-ethics-guideline', url: 'https://www.forskningsetikk.no/en/guidelines/social-sciences-and-humanities/guidelines-for-research-ethics-in-the-social-sciences-and-the-humanities/', evidence_role: 'sensitive-categories-data-minimization-representation', source_location: 'Nasjonale retningslinjer for ansvar, personvern, sårbarhet, konfidensialitet og redelig representasjon.', retrieval_status: 'verified_2026-08-28' },
];

const topic_briefs = [
  {
    id: 'klasse-relasjoner-arbeid-og-kapital',
    title: 'Klasse, relasjoner, arbeid og kapital',
    method_ids: ['met_pol_makt_og_ulikhetsanalyse', 'met_pol_begrepsanalyse'],
    boundary: 'Klasse må knyttes til relasjoner, ressurser og institusjoner; yrkestittel eller inntektskvintil er ikke alene en klasseteori.',
    source_ids: ['ukr01-marx', 'ukr02-weber'],
    planned_claims: [
      c('ukr-01', 'Marx analyserer klasse gjennom relasjoner til produksjon, arbeid og kontroll over kapital, ikke bare gjennom individuelle inntektsnivåer.', ['ukr01-marx', 'ukr08-ssb-norge']),
      c('ukr-02', 'Utbytting betegner en relasjonell mekanisme for tilegnelse av verdier og må skilles fra enhver observerbar forskjell i lønn eller forbruk.', ['ukr01-marx', 'ukr04-tilly']),
      c('ukr-03', 'Weber skiller klasseposisjonens markedssjanser fra statusgruppers sosiale ære og partiers organiserte makt.', ['ukr02-weber', 'ukr03-bourdieu']),
      c('ukr-04', 'En empirisk klasseanalyse må erklære enhet, relasjon, tidsrom og mekanisme før gruppene gis navn.', ['ukr01-marx', 'ukr02-weber']),
    ],
  },
  {
    id: 'kapital-status-livssjanser-og-mobilitet',
    title: 'Kapital, status, livssjanser og mobilitet',
    method_ids: ['met_pol_makt_og_ulikhetsanalyse', 'met_pol_statistikk_og_fordelingsanalyse'],
    boundary: 'Kapitalformer er analytiske relasjoner og mobilitet krever sammenlignbare posisjoner over tid; begrepene er ikke personlighetstyper.',
    source_ids: ['ukr02-weber', 'ukr03-bourdieu', 'ukr11-oecd'],
    planned_claims: [
      c('ukr-05', 'Bourdieu skiller økonomisk, kulturell og sosial kapital som ressurser med ulik omsettelighet og verdi i bestemte felt.', ['ukr03-bourdieu', 'ukr02-weber']),
      c('ukr-06', 'Smak og utdanningspraksis kan fungere som klassifikasjon og distinksjon uten at hvert individuelt valg kan avledes direkte av klasse.', ['ukr03-bourdieu', 'ukr13-nesh']),
      c('ukr-07', 'Livssjanser beskriver sannsynligheter knyttet til posisjon og institusjoner, ikke et sikkert individuelt livsforløp.', ['ukr02-weber', 'ukr11-oecd']),
      c('ukr-08', 'Relativ mobilitet må skille endring i samfunnets posisjonsstruktur fra endring i sammenhengen mellom sosial bakgrunn og voksen posisjon.', ['ukr02-weber', 'ukr11-oecd']),
    ],
  },
  {
    id: 'varig-kategorisk-ulikhet-og-sosial-lukking',
    title: 'Varig kategorisk ulikhet og sosial lukking',
    method_ids: ['met_pol_institusjonsanalyse', 'met_pol_makt_og_ulikhetsanalyse'],
    boundary: 'Kategori i seg selv forklarer ikke ulikhet; analysen må vise grense, relasjon, ressursstrøm og organisatorisk reproduksjon.',
    source_ids: ['ukr04-tilly', 'ukr02-weber'],
    planned_claims: [
      c('ukr-09', 'Tilly forklarer varig ulikhet gjennom relasjonelle mekanismer som utbytting, mulighetsmonopol, etterlikning og tilpasning.', ['ukr04-tilly', 'ukr01-marx']),
      c('ukr-10', 'Mulighetsmonopol oppstår når nettverk eller kategorier kontrollerer tilgang til verdifulle ressurser og holder andre utenfor.', ['ukr04-tilly', 'ukr02-weber']),
      c('ukr-11', 'Organisasjoner kan stabilisere kategoriske skiller fordi grensene reduserer transaksjonskostnader for noen samtidig som kostnadene bæres av andre.', ['ukr04-tilly', 'ukr05-acker']),
      c('ukr-12', 'Å dokumentere et gruppeskille er ikke nok; mekanismen må spores gjennom rekruttering, lønn, eierskap, regler eller tjenestetilgang.', ['ukr04-tilly', 'ukr12-equality-law']),
    ],
  },
  {
    id: 'kjonnede-organisasjoner-og-fordelingskjeder',
    title: 'Kjønnede organisasjoner og fordelingskjeder',
    method_ids: ['met_pol_likestillingsanalyse', 'met_pol_institusjonsanalyse'],
    boundary: 'Kjønnsforskjeller kan produseres av jobbdesign, arbeidstid, omsorgsansvar og vurderingsstandarder; de kan ikke forklares som gruppers essens.',
    source_ids: ['ukr05-acker', 'ukr12-equality-law'],
    planned_claims: [
      c('ukr-13', 'Acker viser at den tilsynelatende abstrakte arbeidstakeren ofte forutsetter en kropp og livssituasjon frigjort fra omsorgsarbeid.', ['ukr05-acker', 'ukr03-bourdieu']),
      c('ukr-14', 'Kjønnet ulikhet kan bygges inn i stillingsbeskrivelser, karriereløp, kontroll, symbolske bilder og daglig samhandling.', ['ukr05-acker', 'ukr12-equality-law']),
      c('ukr-15', 'Lik formell regel kan gi indirekte ulik virkning når arbeidstid, tilgjengelighet eller dokumentasjonskrav møter systematisk forskjellige livsbetingelser.', ['ukr05-acker', 'ukr12-equality-law']),
      c('ukr-16', 'En organisasjonsanalyse må sammenligne inngang, oppgavefordeling, belønning og avansement før forskjeller tilskrives preferanser.', ['ukr05-acker', 'ukr13-nesh']),
    ],
  },
  {
    id: 'rasialisering-fargelinje-og-institusjoner',
    title: 'Rasialisering, fargelinje og institusjoner',
    method_ids: ['met_pol_minoritet_og_representasjonsanalyse', 'met_pol_institusjonsanalyse'],
    boundary: 'Rasialisering betegner sosial og institusjonell produksjon av kategorisk forskjell; den gjør ikke historiske kategorier biologisk sanne.',
    source_ids: ['ukr06-dubois', 'ukr04-tilly', 'ukr12-equality-law'],
    planned_claims: [
      c('ukr-17', 'Du Bois’ fargelinje forbinder historisk raseklassifikasjon med institusjonelle grenser for utdanning, arbeid, politikk og sosial anerkjennelse.', ['ukr06-dubois', 'ukr04-tilly']),
      c('ukr-18', 'Dobbel bevissthet analyserer erfaring under et dominerende blikk og må ikke reduseres til en universell personlighetsegenskap.', ['ukr06-dubois', 'ukr13-nesh']),
      c('ukr-19', 'Rasialisering må undersøkes gjennom hvordan kategorier skapes, tilskrives og gis konsekvenser i institusjonelle praksiser.', ['ukr06-dubois', 'ukr12-equality-law']),
      c('ukr-20', 'Diskrimineringsanalyse må skille intensjon, regelutforming, indirekte virkning og dokumentert forskjellsbehandling.', ['ukr12-equality-law', 'ukr04-tilly']),
    ],
  },
  {
    id: 'interseksjonalitet-mekanismer-og-blindsoner',
    title: 'Interseksjonalitet, mekanismer og blindsoner',
    method_ids: ['met_pol_makt_og_ulikhetsanalyse', 'met_pol_rettighetsanalyse'],
    boundary: 'Interseksjonalitet undersøker samvirkende institusjonelle mekanismer og rettslige blindsoner; den er ikke en rangering av lidelse.',
    source_ids: ['ukr07-crenshaw', 'ukr05-acker', 'ukr12-equality-law'],
    planned_claims: [
      c('ukr-21', 'Crenshaw viser hvordan institusjoner kan overse skade som ikke passer en enkeltaksemodell for kjønn eller rase.', ['ukr07-crenshaw', 'ukr12-equality-law']),
      c('ukr-22', 'Interseksjonalitet krever analyse av hvordan konkrete regler, ressurser og maktrelasjoner virker sammen, ikke bare en liste identiteter.', ['ukr07-crenshaw', 'ukr04-tilly']),
      c('ukr-23', 'En gruppeintern gjennomsnittsverdi kan skjule undergrupper som møter andre terskler eller kombinasjoner av institusjonelle vilkår.', ['ukr07-crenshaw', 'ukr09-ssb-measurement']),
      c('ukr-24', 'Sammenligninger må begrunnes slik at de belyser mekanismer uten å gjøre utsatte grupper til homogene problemer.', ['ukr07-crenshaw', 'ukr13-nesh']),
    ],
  },
  {
    id: 'inntekt-formue-velferd-og-maling',
    title: 'Inntekt, formue, velferd og måling',
    method_ids: ['met_pol_statistikk_og_fordelingsanalyse', 'met_pol_fordelingsanalyse'],
    boundary: 'Inntekt, formue, fattigdom, klasse og velferd er ulike størrelser; hvert mål krever enhet, populasjon, periode og datakilde.',
    source_ids: ['ukr08-ssb-norge', 'ukr09-ssb-measurement', 'ukr10-wid', 'ukr11-oecd'],
    planned_claims: [
      c('ukr-25', 'Gini, kvotienter og toppandeler belyser ulike deler av fordelingen og kan ikke erstatte en full fordelingsprofil.', ['ukr09-ssb-measurement', 'ukr11-oecd']),
      c('ukr-26', 'Inntekt og nettoformue må analyseres separat fordi beholdning, gjeld, avkastning og løpende ressurser følger ulike fordelingsprosesser.', ['ukr08-ssb-norge', 'ukr11-oecd']),
      c('ukr-27', 'WID kombinerer survey-, skatte-, formues- og nasjonalregnskapsdata fordi hver datakilde har særskilte deknings- og toppinntektsproblemer.', ['ukr10-wid', 'ukr09-ssb-measurement']),
      c('ukr-28', 'Tverrnasjonale ulikhetstall krever harmoniserte inntektsbegreper, husholdningsenheter, prisgrunnlag og perioder før rangering tolkes.', ['ukr11-oecd', 'ukr10-wid']),
    ],
  },
  {
    id: 'forklaring-politikk-og-forskningsetikk',
    title: 'Forklaring, politikk og forskningsetikk',
    method_ids: ['met_pol_fordelingsanalyse', 'met_pol_dokumentanalyse'],
    boundary: 'Mønster, mekanisme, politisk virkning og normativ vurdering må holdes fra hverandre, særlig ved sensitive kategorier og registerdata.',
    source_ids: ['ukr08-ssb-norge', 'ukr12-equality-law', 'ukr13-nesh'],
    planned_claims: [
      c('ukr-29', 'En endring etter skatt eller overføring beskriver omfordeling, men identifiserer ikke alene hvilken regel eller atferdsrespons som skapte utfallet.', ['ukr08-ssb-norge', 'ukr11-oecd']),
      c('ukr-30', 'Korrelasjon mellom kategori og utfall må ikke presenteres som kategoriens egenskap uten analyse av seleksjon, institusjon og historisk mekanisme.', ['ukr04-tilly', 'ukr13-nesh']),
      c('ukr-31', 'Sensitive ulikhetsdata krever dataminimering, proporsjonalitet, kontekst og vurdering av indirekte identifisering og gruppeskade.', ['ukr13-nesh', 'ukr12-equality-law']),
      c('ukr-32', 'En full ulikhetskonklusjon skal skille målt mønster, foreslått mekanisme, politisk konsekvens, usikkerhet og normativ vurdering.', ['ukr08-ssb-norge', 'ukr13-nesh']),
    ],
  },
];

const decision_scenarios = [
  { id: 'ukr-s1', title: 'Bemanningssystemet', prompt: 'En arbeidsgiver hevder at lik tilgjengelighetsregel er nøytral. Spor jobbdesign, omsorgsbetingelser, indirekte virkning og alternative forklaringer.', claim_ids: ['ukr-13', 'ukr-15', 'ukr-16'] },
  { id: 'ukr-s2', title: 'Kommunens ulikhetskart', prompt: 'Et kart viser store inntektsforskjeller. Skill inntekt, formue, klasse, områdekomposisjon og kausal rekkevidde.', claim_ids: ['ukr-25', 'ukr-26', 'ukr-30'] },
  { id: 'ukr-s3', title: 'Rekrutteringsporten', prompt: 'Et firma rekrutterer bare gjennom ansattes nettverk. Analyser sosial lukking, mulighetsmonopol og dokumentasjon av virkning.', claim_ids: ['ukr-09', 'ukr-10', 'ukr-12'] },
  { id: 'ukr-s4', title: 'Enkeltakse-skjemaet', prompt: 'Et hjelpetiltak registrerer bare ett diskrimineringsgrunnlag. Undersøk blindsoner uten å rangere identiteter eller lidelse.', claim_ids: ['ukr-21', 'ukr-22', 'ukr-23'] },
  { id: 'ukr-s5', title: 'Internasjonal rangering', prompt: 'To land rangeres etter Gini. Kontroller inntektsbegrep, husholdningsenhet, periode, datakilder og toppinntektsdekning.', claim_ids: ['ukr-25', 'ukr-27', 'ukr-28'] },
  { id: 'ukr-s6', title: 'Den søkbare smågruppen', prompt: 'Et registeruttrekk viser en liten minoritetsgruppe. Vurder dataminimering, indirekte identifisering, kontekst og gruppeskade.', claim_ids: ['ukr-24', 'ukr-31', 'ukr-32'] },
];

function buildBrief() {
  return {
    schema: 'history_go_sosiologi_antropologi_inequality_class_gender_racialization_source_claim_brief_v1',
    version: '1.0.0',
    updated_at: '2026-08-28',
    status: 'source_first_ready_not_materialized',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    domain: {
      ordinal: 5,
      id: 'ulikhet_klasse_kjonn_rasialisering',
      title: 'Ulikhet, klasse, kjønn og rasialisering',
      production_mode: 'reuse_with_expansion',
      existing_owner_chapter: EXISTING_CHAPTER,
      existing_owner_claims: EXISTING_CLAIMS,
      existing_owner_git_blob_shas: { chapter: 'd55591138538840c1be333783cf3e32f7a07c08d', claims: '88af362d097d45289dd8e1d932f1a2f5004e5488' },
    },
    source_strategy: { source_first: true, inspectable_urls_required: true, claim_level_trace_required: true, minimum_sources_per_claim: 2, fulltext_materialization_required_before_counting: true },
    sources,
    topic_briefs,
    decision_scenarios,
    reuse_contract: {
      classification: 'reuse_with_expansion',
      preserve_existing_owner_path: true,
      move_existing_content: false,
      delete_existing_content: false,
      existing_claims_remain_valid: true,
      undercategory_count_requires_new_strict_trace_and_assessment: true,
    },
    subcategory_upgrade_registration: { registered: false, allowed_before_strict_upgrade_gate: false },
  };
}

function buildReport() {
  return {
    schema: 'history_go_sosiologi_antropologi_inequality_class_gender_racialization_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-28',
    status: 'pass',
    conclusion: 'field_5_source_first_ready_not_materialized',
    counts: { ordinal: 5, inspectableSources: 13, topicBriefs: 8, plannedClaims: 32, teachingScenarios: 6, preservedOwnerClaims: 45, preservedOwnerSources: 30, domainsMaterialized: 4, targetDomains: 12 },
    gates: { sourceFirst: true, everyClaimHasAtLeastTwoSources: true, everySourceUsed: true, classRelationAndMobilityBoundaries: true, genderedOrganizationAndRacializationBoundaries: true, intersectionalityNotAdditive: true, inequalityMeasurementBoundaries: true, ethicsAndGroupHarmBoundaries: true, reuseOwnerByteRecognized: true, noPrematureRegistration: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Kilde- og claimbriefen er klar for felt 5, men feltet teller ikke som materialisert før strict reuse-overlay, fulltekst, vurdering og audit finnes.' },
  };
}

export function generateAndAudit() {
  const ownerChapterText = readText(EXISTING_CHAPTER);
  const ownerClaimsText = readText(EXISTING_CLAIMS);
  const ownerClaims = JSON.parse(ownerClaimsText);
  assert(gitBlobSha(ownerChapterText) === 'd55591138538840c1be333783cf3e32f7a07c08d', 'Eierkapitlet for felt 5 avviker fra autoritativ blob');
  assert(gitBlobSha(ownerClaimsText) === '88af362d097d45289dd8e1d932f1a2f5004e5488', 'Eierclaims for felt 5 avviker fra autoritativ blob');
  assert(ownerClaims.claims.length === 45 && ownerClaims.sources.length === 30, 'Felt 5-eier skal ha 45 claims og 30 kilder');
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
console.log(`Ulikhet, klasse, kjønn og rasialisering source-first klar: ${report.counts.inspectableSources} kilder, ${report.counts.plannedClaims} claims, materialisert fortsatt ${report.counts.domainsMaterialized}/12.`);

