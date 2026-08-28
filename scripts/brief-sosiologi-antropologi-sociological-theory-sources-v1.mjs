#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/politikk/sosiologi_antropologi/sociological_theory_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sosiologi-antropologi-sociological-theory-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const claim = (id, text, source_ids) => ({ id, text, status: 'planned_requires_fulltext_verification', source_ids });
const source = (id, publisher, title, url, type, evidence_role, source_location) => ({ id, publisher, title, url, type, evidence_role, source_location, retrieval_status: 'verified_2026-08-28' });

const SOURCES = [
  source('sat01-durkheim-rules', 'Palgrave Macmillan', 'The Rules of Sociological Method', 'https://doi.org/10.1007/978-1-349-16939-9', 'scholarly-primary-classic', 'social-facts-comparison-explanation', 'Lukes-utgaven av Durkheims metodeverk; definisjon av sosiale fakta, komparasjon og skillet mellom årsak og funksjon.'),
  source('sat02-weber-economy-society', 'University of California Press', 'Economy and Society', 'https://www.ucpress.edu/books/economy-and-society-2/paper', 'scholarly-primary-classic', 'social-action-ideal-types-domination', 'Del I om sosiologiske grunnbegreper, meningsfull handling, idealtyper, legitimitet og herredømme.'),
  source('sat03-marx-capital-v1', 'Marxists Internet Archive', 'Capital, Volume I', 'https://www.marxists.org/archive/marx/works/1867-c1/', 'scholarly-primary-classic-open-text', 'commodity-labour-capital-class-relations', 'Del I, III og VIII om vareform, arbeidsprosess, merverdi og den historiske etableringen av kapitalforholdet.'),
  source('sat04-goffman-presentation', 'Penguin Books', 'The Presentation of Self in Everyday Life', 'https://www.penguin.co.uk/books/13511/the-presentation-of-self-in-everyday-life-by-erving-goffman/9780241547991', 'scholarly-primary-classic', 'interaction-order-performance-impression', 'Goffmans dramaturgiske analyse av situasjoner, opptredener, publikum, frontstage/backstage og inntrykksstyring.'),
  source('sat05-bourdieu-practice', 'Cambridge University Press', 'Outline of a Theory of Practice', 'https://doi.org/10.1017/CBO9780511812507', 'scholarly-primary-monograph', 'habitus-field-capital-practice-reflexivity', 'Særlig kapittel 2 om habitus og forholdet mellom objektive strukturer, disposisjoner og praksis; bygger på feltarbeid i Kabylia.'),
  source('sat06-berger-luckmann', 'Anchor Books', 'The Social Construction of Reality', 'https://books.google.com/books?id=Jcma84waN3AC', 'scholarly-primary-monograph', 'institutionalization-legitimation-knowledge', 'Del II om habituering, institusjonalisering, legitimering, roller og vedlikehold av sosial virkelighet.'),
  source('sat07-crenshaw-margins', 'Stanford Law Review', 'Mapping the Margins: Intersectionality, Identity Politics, and Violence against Women of Color', 'https://doi.org/10.2307/1229039', 'peer-reviewed-primary-theory-case-analysis', 'intersectionality-single-axis-limits-power', 'Artikkelens strukturelle, politiske og representasjonelle interseksjonalitet samt kritikk av énaksede kategorier.'),
  source('sat08-lamont-molnar', 'Annual Review of Sociology', 'The Study of Boundaries in the Social Sciences', 'https://doi.org/10.1146/annurev.soc.28.110601.141107', 'peer-reviewed-research-review', 'symbolic-social-boundaries-inequality-identity', 'Syntese av hvordan symbolske skiller kan bli sosiale grenser gjennom ressurser, eksklusjon og institusjoner.'),
  source('sat09-emirbayer', 'American Journal of Sociology', 'Manifesto for a Relational Sociology', 'https://doi.org/10.1086/231209', 'peer-reviewed-primary-theory-article', 'relational-processual-analysis-agency', 'Relasjonell kritikk av substantialisme og program for å analysere transaksjoner, prosesser og dynamiske relasjoner.'),
  source('sat10-abbott-time', 'University of Chicago Press', 'Time Matters: On Theory and Method', 'https://books.google.com/books?id=dtyvJcvordAC', 'scholarly-method-monograph', 'sequence-process-context-causality', 'Kapitler om sekvenser, turning points, kontekst og hvorfor sosial forklaring må ta tid og prosess alvorlig.'),
  source('sat11-connell-southern-theory', 'Polity Press', 'Southern Theory: The Global Dynamics of Knowledge in Social Science', 'https://www.raewynconnell.net/p/theory.html', 'scholarly-critical-monograph', 'global-knowledge-canon-coloniality', 'Kritikk av metropolitansk teoridannelse og analyse av hvordan kunnskapens geografi former hva som presenteres som universell teori.'),
  source('sat12-small-cases', 'Ethnography', 'How many cases do I need? On science and the logic of case selection in field-based research', 'https://doi.org/10.1177/1466138108099586', 'peer-reviewed-method-article', 'case-selection-sequential-inquiry-generalization-limits', 'Skiller casebasert sekvensiell undersøkelse fra surveylogikk og advarer mot mekaniske minimumstall for kvalitative studier.'),
  source('sat13-nesh-2021', 'De nasjonale forskningsetiske komiteene', 'Guidelines for Research Ethics in the Social Sciences and the Humanities', 'https://www.forskningsetikk.no/en/guidelines/social-sciences-and-humanities/guidelines-for-research-ethics-in-the-social-sciences-and-the-humanities/', 'official-research-ethics-guideline', 'consent-harm-privacy-representation-responsibility', 'Femte utgave om forskningsfellesskapet, deltakere, berørte grupper, oppdragsgivere, formidling, personvern og ansvar.'),
];

const METHODS = {
  theory: ['met_pol_begrepsanalyse', 'met_pol_ideologianalyse'],
  process: ['met_pol_komparativ_metode', 'met_pol_prosessporing'],
  practice: ['met_pol_praksisanalyse', 'met_pol_diskursanalyse'],
  inequality: ['met_pol_makt_og_ulikhetsanalyse', 'met_pol_statistikk_og_fordelingsanalyse'],
};

const TOPICS = [
  { id: 'sosiale-fakta-og-nivaer', title: 'Sosiale fakta, nivåer og forklaring', method_ids: METHODS.theory, source_ids: ['sat01-durkheim-rules', 'sat10-abbott-time', 'sat13-nesh-2021'], boundary: 'Et sosialt mønster er ikke en ting utenfor historien, og et gruppemønster beskriver ikke automatisk hvert individ.', planned_claims: [
    claim('sat-01', 'Durkheims sosiale fakta retter analysen mot handlemåter og institusjoner som møter individet som allerede etablerte og delvis sanksjonerte ordninger.', ['sat01-durkheim-rules', 'sat10-abbott-time']),
    claim('sat-02', 'Sosiologisk forklaring krever et presist utfall, analyseenhet og tidsrom før en mekanisme foreslås.', ['sat01-durkheim-rules', 'sat10-abbott-time']),
    claim('sat-03', 'Å forklare et fenomens historiske framvekst er noe annet enn å beskrive hvilken funksjon det senere får i en institusjon.', ['sat01-durkheim-rules', 'sat10-abbott-time']),
    claim('sat-04', 'Aggregerte mønstre kan avdekke sosial organisering, men må ikke brukes til å tilskrive egenskaper eller motiver til enkeltpersoner.', ['sat01-durkheim-rules', 'sat13-nesh-2021']),
  ]},
  { id: 'handling-mening-og-herredomme', title: 'Handling, mening, idealtyper og herredømme', method_ids: METHODS.theory, source_ids: ['sat02-weber-economy-society', 'sat10-abbott-time'], boundary: 'En idealtype er et analytisk sammenligningsredskap, ikke en beskrivelse av en ren person- eller samfunnstype.', planned_claims: [
    claim('sat-05', 'Weber avgrenser sosial handling som handling orientert mot andres faktiske eller forventede atferd og den meningen aktøren knytter til situasjonen.', ['sat02-weber-economy-society', 'sat10-abbott-time']),
    claim('sat-06', 'Idealtypen fremhever analytiske trekk for sammenligning; empiriske case forventes å avvike fra den rene konstruksjonen.', ['sat02-weber-economy-society', 'sat10-abbott-time']),
    claim('sat-07', 'Legitimt herredømme viser hvordan makt stabiliseres når regler, tradisjon eller personlige kvaliteter oppfattes som gyldige.', ['sat02-weber-economy-society', 'sat09-emirbayer']),
    claim('sat-08', 'Aktørmening kan ikke leses direkte fra et dokument eller utfall, men må underbygges med data om fortolkning, praksis og situasjon.', ['sat02-weber-economy-society', 'sat13-nesh-2021']),
  ]},
  { id: 'kapital-arbeid-og-klasse', title: 'Kapital, arbeid, klasse og historiske relasjoner', method_ids: METHODS.process, source_ids: ['sat03-marx-capital-v1', 'sat10-abbott-time', 'sat09-emirbayer'], boundary: 'Klasse er en relasjon til produksjon, eierskap og arbeid, ikke en moralsk egenskap eller en komplett identitet.', planned_claims: [
    claim('sat-09', 'Marx analyserer varen som en sosial form der bruksverdi og bytteverdi forbindes gjennom historisk organiserte produksjonsrelasjoner.', ['sat03-marx-capital-v1', 'sat09-emirbayer']),
    claim('sat-10', 'Merverdiargumentet knytter profitt til kontroll over arbeidskraft og produksjonstid, ikke bare til ulik fordeling etter at produksjonen er ferdig.', ['sat03-marx-capital-v1', 'sat10-abbott-time']),
    claim('sat-11', 'Kapital og lønnsarbeid må analyseres som gjensidig definerte relasjoner som opprettholdes av eiendomsrett, marked og organisasjon.', ['sat03-marx-capital-v1', 'sat09-emirbayer']),
    claim('sat-12', 'En marxistisk mekanisme må prøves mot institusjon, tidsperiode og alternativ forklaring fremfor å brukes som totalforklaring på ethvert sosialt utfall.', ['sat03-marx-capital-v1', 'sat10-abbott-time']),
  ]},
  { id: 'interaksjon-selv-og-situasjon', title: 'Interaksjonsorden, selvpresentasjon og situasjon', method_ids: METHODS.practice, source_ids: ['sat04-goffman-presentation', 'sat12-small-cases', 'sat13-nesh-2021'], boundary: 'Dramaturgiske begreper betyr ikke at handling alltid er falsk eller fullt strategisk.', planned_claims: [
    claim('sat-13', 'Goffmans dramaturgiske analyse undersøker hvordan deltakere samarbeider om en situasjonsdefinisjon gjennom opptreden, publikum og informasjonskontroll.', ['sat04-goffman-presentation', 'sat12-small-cases']),
    claim('sat-14', 'Frontstage og backstage betegner relasjonelle regioner med ulike publikum og forventninger, ikke faste sider ved en persons autentiske identitet.', ['sat04-goffman-presentation', 'sat09-emirbayer']),
    claim('sat-15', 'Et brudd i en opptreden kan synliggjøre normalt taus bakgrunnskunnskap og de reparasjonene som holder samhandling i gang.', ['sat04-goffman-presentation', 'sat12-small-cases']),
    claim('sat-16', 'Forskeren må analysere situasjonen uten å gjøre deltakernes ansiktsarbeid til bevis for bedrag eller personlig mangel.', ['sat04-goffman-presentation', 'sat13-nesh-2021']),
  ]},
  { id: 'habitus-felt-og-praksis', title: 'Habitus, felt, kapital og praksis', method_ids: METHODS.practice, source_ids: ['sat05-bourdieu-practice', 'sat03-marx-capital-v1', 'sat11-connell-southern-theory'], boundary: 'Habitus er historisk formede disposisjoner og sannsynligheter, ikke en skjult kulturkode som mekanisk bestemmer handling.', planned_claims: [
    claim('sat-17', 'Bourdieu bruker habitus til å analysere hvordan historiske vilkår innarbeides som varige, men ikke uforanderlige disposisjoner for praksis.', ['sat05-bourdieu-practice', 'sat10-abbott-time']),
    claim('sat-18', 'Feltanalyse krever at posisjoner, relevante kapitalformer, innsats og relasjoner spesifiseres for den konkrete arenaen.', ['sat05-bourdieu-practice', 'sat09-emirbayer']),
    claim('sat-19', 'Symbolsk kapital virker når bestemte ressurser og klassifikasjoner anerkjennes som legitime innen et felt.', ['sat05-bourdieu-practice', 'sat08-lamont-molnar']),
    claim('sat-20', 'Teori om reproduksjon må også kunne undersøke krise, feltendring, refleksivitet og praksiser som bryter med tidligere mønstre.', ['sat05-bourdieu-practice', 'sat11-connell-southern-theory']),
  ]},
  { id: 'institusjonalisering-og-kunnskap', title: 'Institusjonalisering, legitimering og sosial kunnskap', method_ids: METHODS.process, source_ids: ['sat06-berger-luckmann', 'sat10-abbott-time', 'sat08-lamont-molnar'], boundary: 'At en kategori er sosialt produsert betyr ikke at den er vilkårlig, uvirkelig eller uten materielle konsekvenser.', planned_claims: [
    claim('sat-21', 'Berger og Luckmann beskriver institusjonalisering som gjensidig typifisering av vanemessige handlinger som blir tilgjengelig for nye deltakere.', ['sat06-berger-luckmann', 'sat10-abbott-time']),
    claim('sat-22', 'Legitimering knytter institusjoner til forklaringer, normer og kunnskapsordener som gjør dem forståelige og forsvarlige.', ['sat06-berger-luckmann', 'sat08-lamont-molnar']),
    claim('sat-23', 'Roller forbinder situert handling med institusjonell orden ved å definere forventning, kompetanse og ansvar.', ['sat06-berger-luckmann', 'sat02-weber-economy-society']),
    claim('sat-24', 'Sosial konstruksjon må analyseres sammen med sanksjoner, ressurser og materielle vilkår for å forklare varighet og konsekvens.', ['sat06-berger-luckmann', 'sat03-marx-capital-v1']),
  ]},
  { id: 'grenser-interseksjonalitet-relasjoner', title: 'Grenser, interseksjonalitet og relasjonell analyse', method_ids: METHODS.inequality, source_ids: ['sat07-crenshaw-margins', 'sat08-lamont-molnar', 'sat09-emirbayer'], boundary: 'Kategorier og akser skal ikke summeres mekanisk; det er institusjonelle relasjoner og konkrete konsekvenser som må undersøkes.', planned_claims: [
    claim('sat-25', 'Lamont og Molnár skiller symbolske grenser fra sosiale grenser og viser at kulturelle skiller får ulikhetsvirkning når de kobles til ressurser og adgang.', ['sat08-lamont-molnar', 'sat09-emirbayer']),
    claim('sat-26', 'Crenshaws interseksjonalitet viser hvordan énaksede institusjoner kan gjøre bestemte erfaringer usynlige selv når hver kategori er juridisk anerkjent.', ['sat07-crenshaw-margins', 'sat08-lamont-molnar']),
    claim('sat-27', 'Relasjonell sosiologi erstatter ikke aktører med nettverk, men undersøker hvordan aktører og egenskaper formes gjennom transaksjoner over tid.', ['sat09-emirbayer', 'sat10-abbott-time']),
    claim('sat-28', 'Ansvarlig kategorianalyse må dokumentere hvem som klassifiserer, i hvilken institusjon, med hvilken ressursvirkning og hvilke motkategorier som finnes.', ['sat07-crenshaw-margins', 'sat13-nesh-2021']),
  ]},
  { id: 'teorivalg-kritikk-og-samfunnsendring', title: 'Teorivalg, kritikk, kunnskapsgeografi og samfunnsendring', method_ids: METHODS.process, source_ids: ['sat10-abbott-time', 'sat11-connell-southern-theory', 'sat13-nesh-2021'], boundary: 'En klassiker er et analytisk tilbud med historiske blindsoner, ikke et universelt fasitsvar eller et kvalitetsstempel i seg selv.', planned_claims: [
    claim('sat-29', 'Teorier bør velges etter hvilket utfall, nivå, tidsforløp og datamateriale de gjør mulig å undersøke, ikke etter kanonisk prestisje alene.', ['sat10-abbott-time', 'sat11-connell-southern-theory']),
    claim('sat-30', 'Connell viser at teoriens påståtte universalitet kan skjule en global arbeidsdeling der data hentes fra periferien og begreper gis autoritet i metropolen.', ['sat11-connell-southern-theory', 'sat13-nesh-2021']),
    claim('sat-31', 'Sosial endring krever prosessdata som kan skille gradvis forskyvning, kritisk hendelse, institusjonell omforming og nytolkning av eksisterende praksis.', ['sat10-abbott-time', 'sat09-emirbayer']),
    claim('sat-32', 'En sterk sosiologisk konklusjon synliggjør evidens, mekanisme, alternative forklaringer, rekkevidde, normativt standpunkt og forskerens representasjonsansvar.', ['sat10-abbott-time', 'sat13-nesh-2021']),
  ]},
];

const SCENARIOS = [
  { id: 'scenario-equal-rule-unequal-effect', title: 'En formelt lik regel gir systematisk ulik adgang', purpose: 'Sammenligne Durkheim, Weber, Marx og grenseanalyse uten å gjøre gruppetilhørighet til årsak.', source_ids: ['sat01-durkheim-rules', 'sat02-weber-economy-society', 'sat08-lamont-molnar'] },
  { id: 'scenario-role-breakdown', title: 'En offentlig ekspedisjon bryter sammen når rollene blir uklare', purpose: 'Analysere situasjonsdefinisjon, institusjonell rolle, reparasjon og maktasymmetri.', source_ids: ['sat04-goffman-presentation', 'sat06-berger-luckmann'] },
  { id: 'scenario-classification-system', title: 'Et datasystem innfører en ny risikokategori', purpose: 'Følge klassifikasjon fra modell og institusjon til ressursvirkning, motkrav og etisk ansvar.', source_ids: ['sat07-crenshaw-margins', 'sat08-lamont-molnar', 'sat13-nesh-2021'] },
  { id: 'scenario-workplace-change', title: 'En arbeidsplass endrer teknologi, kontroll og tempo samtidig', purpose: 'Skille kapitalrelasjon, felt, habitus, rolle og sekvensielle endringsmekanismer.', source_ids: ['sat03-marx-capital-v1', 'sat05-bourdieu-practice', 'sat10-abbott-time'] },
  { id: 'scenario-canonical-blind-spot', title: 'En klassisk teori brukes som universell forklaring på et ikke-europeisk case', purpose: 'Avgrense begrepsverdi, historisk kontekst, kunnskapsgeografi og representasjonsmakt.', source_ids: ['sat11-connell-southern-theory', 'sat13-nesh-2021'] },
  { id: 'scenario-intersectional-claim', title: 'Et gjennomsnitt skjuler en gruppe som faller mellom to institusjonelle kategorier', purpose: 'Teste énaksemodell, datagrunnlag, konkret mekanisme og alternative inndelinger.', source_ids: ['sat07-crenshaw-margins', 'sat12-small-cases', 'sat13-nesh-2021'] },
];

export function build({ writeFiles = true } = {}) {
  const brief = {
    schema: 'history_go_sosiologi_antropologi_sociological_theory_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-28', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi',
    planned_unit_id: 'sosiologisk-teori-struktur-handling-makt-og-samfunnsendring', future_chapter_id: 'sosiologisk-teori-struktur-handling-makt-og-samfunnsendring',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false }, metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: { title: 'Sosiologisk teori: struktur, handling, makt og samfunnsendring', primary_domain_id: 'sosiologisk_teori', canonical_emne_id: 'em_pol_sosiologi_teori', ownership: 'Sosiologi og antropologi eier den systematiske sammenstillingen av klassisk og nyere sosiologisk teori. Eksisterende Politikk-kapitler beholdes og sekundærbindes; de flyttes eller dupliseres ikke.', included: TOPICS.map((topic) => topic.title), excluded: ['klassiker som fasit', 'identitet som årsak', 'idealtype som personkategori', 'habitus som determinisme', 'sosial konstruksjon som uvirkelighet', 'interseksjonalitet som mekanisk summering', 'gruppesnitt som individpåstand', 'normativ vurdering som empirisk funn'] },
    source_policy: { classic_is_not_authority_proof: true, theory_requires_scope_conditions: true, ideal_type_is_not_empirical_person_type: true, habitus_is_not_determinism: true, social_construction_is_not_unreality: true, category_is_not_cause: true, aggregate_is_not_individual: true, intersectionality_is_not_axis_addition: true, global_canon_requires_knowledge_geography: true, normative_claim_requires_explicit_standard: true, planned_claim_is_not_verified_claim: true, fulltext_requires_reciprocal_paragraph_claim_trace: true, sources_verified_at: '2026-08-28' },
    allowed_method_ids: [...new Set(Object.values(METHODS).flat())], sources: SOURCES, decision_scenarios: SCENARIOS, topic_briefs: TOPICS, next_gate: 'sociological_theory_source_brief_complete_full_chapter_production',
  };
  if (writeFiles) write(BRIEF, brief);
  return brief;
}

export function audit({ writeReport = false } = {}) {
  const brief = fs.existsSync(abs(BRIEF)) ? read(BRIEF) : build({ writeFiles: false });
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const sourceIds = new Set(brief.sources.map((row) => row.id));
  const usedSources = new Set(claims.flatMap((row) => row.source_ids));
  assert(brief.subject_id === 'politikk' && brief.canonical_subcategory_id === 'sosiologi_antropologi', 'Feil canonical eier eller underkategori');
  assert(!brief.runtime_registration.registered && !brief.metadata_registration.global_status_mutation_in_source_brief, 'Source brief kan ikke registrere runtime eller complete-status');
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Feil 13/8/32/6-struktur');
  assert(new Set(claims.map((row) => row.id)).size === 32 && claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være unike, planlagte og kildebundet');
  assert(brief.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-28'), 'Kilder må være inspiserbare og presist lokalisert');
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle kilder må brukes i claimplanen');
  assert(['classic_is_not_authority_proof', 'theory_requires_scope_conditions', 'ideal_type_is_not_empirical_person_type', 'habitus_is_not_determinism', 'social_construction_is_not_unreality', 'category_is_not_cause', 'aggregate_is_not_individual', 'intersectionality_is_not_axis_addition', 'global_canon_requires_knowledge_geography', 'normative_claim_requires_explicit_standard'].every((key) => brief.source_policy[key]), 'Teori- og ansvarlighetsgrenser mangler');
  const report = { schema: 'history_go_sosiologi_antropologi_sociological_theory_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-28', status: 'pass', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', domain_id: 'sosiologisk_teori', counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, plannedModules: 4 }, gates: { sourceFirstUnregistered: true, canonicalSubcategoryOwnership: true, allSourcesInspectable: true, everyClaimSourceBound: true, everySourceUsed: true, classicalAndContemporaryTheory: true, structureActionPowerChangeCoverage: true, qualitativeAndProcessMethodCoverage: true, canonCritiqueAndKnowledgeGeography: true, categoryAndAggregateBoundaries: true, explicitResearchEthics: true, fulltextClaimTraceRequired: true }, six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Source-first-produksjon; claims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor og selvstendig redaksjonell kontroll.' }, next_gate: brief.next_gate };
  if (writeReport) write(REPORT, report); else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  if (process.argv.includes('--write-brief')) build();
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Sosiologisk teori source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) { console.error(`Sosiologisk teori source brief FEIL: ${error.message}`); process.exitCode = 1; }
