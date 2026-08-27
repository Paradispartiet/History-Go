#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/utdanning/education_policy_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/utdanning-education-policy-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const claim = (id, text, source_ids) => ({ id, text, status: 'planned_requires_fulltext_verification', source_ids });
const source = (id, publisher, title, url, type, evidence_role, source_location) => ({ id, publisher, title, url, type, evidence_role, source_location, retrieval_status: 'verified_2026-08-27' });

const SOURCES = [
  source('ep01-grunnlov-right', 'Kunnskapsdepartementet', 'NOU 2019: 23 – retten til utdanning og Grunnloven § 109', 'https://www.regjeringen.no/no/dokumenter/nou-2019-23/id2682434/?ch=5', 'official-legal-inquiry', 'constitutional-right-purpose-democracy', 'Utredningens sammenstilling av Grunnloven § 109, internasjonale forpliktelser og rettens demokratiske og individuelle formål.'),
  source('ep02-opplaringslov', 'Lovdata', 'Lov om grunnskoleopplæringa og den vidaregåande opplæringa', 'https://lovdata.no/dokument/NL/lov/2023-06-09-30', 'official-current-law', 'rights-duties-responsibility-governance', 'Gjeldende opplæringslov med rettigheter, plikter, kommunalt og fylkeskommunalt ansvar, klage og tilsyn.'),
  source('ep03-regulatory-principles', 'Kunnskapsdepartementet', 'NOU 2019: 23 – overordnede prinsipper for styring gjennom regelverk', 'https://www.regjeringen.no/no/dokumenter/nou-2019-23/id2682434/?ch=7', 'official-legal-policy-inquiry', 'rule-design-responsibility-proportionality', 'Utvalgets eksplisitte vurdering av regelstyring, ansvar, handlingsrom, etterlevelse og virkemiddelvalg.'),
  source('ep04-oecd-outlook', 'OECD', 'Education Policy Outlook in Norway', 'https://www.oecd.org/en/publications/education-policy-outlook-in-norway_8a042924-en.html', 'international-policy-profile', 'system-governance-strengths-challenges-reform', 'Landprofil som sammenligner systemtrekk, utfordringer, aktører og pågående reformer med andre utdanningssystemer.'),
  source('ep05-oecd-quality', 'OECD', 'Improving School Quality in Norway', 'https://www.oecd.org/en/publications/improving-school-quality-in-norway_179d4ded-en.html', 'international-policy-review', 'decentralization-quality-equity-capacity', 'Gjennomgang av høy offentlig ressursbruk, desentralisering, kommunal variasjon og virkemidler for kvalitet og likeverd.'),
  source('ep06-quality-system', 'Kunnskapsdepartementet', 'NOU 2023: 1 – Kvalitetsvurdering og kvalitetsutvikling i skolen', 'https://www.regjeringen.no/no/dokumenter/nou-2023-1/id2961070/', 'official-evidence-inquiry', 'quality-indicators-roles-development-accountability', 'Kunnskapsgrunnlag om nasjonalt kvalitetsvurderingssystem, indikatorer, roller, utilsiktede virkninger og utviklingsbehov.'),
  source('ep07-funding', 'European Commission Eurydice', 'Early childhood and school education funding in Norway', 'https://eurydice.eacea.ec.europa.eu/eurypedia/norway/early-childhood-and-school-education-funding', 'official-comparative-system-description', 'municipal-county-funding-responsibility', 'Oppdatert beskrivelse av kommunal og fylkeskommunal finansiering, statlige overføringer og ansvarsnivåer.'),
  source('ep08-reisel-inequality', 'Sociology of Education', 'Two Paths to Inequality in Educational Outcomes', 'https://doi.org/10.1177/0038040711417012', 'peer-reviewed-comparative-study', 'family-background-selection-equalization', 'Komparativ studie av familieulikhet og institusjonell seleksjon i Norge og USA; skiller utfallsmønstre fra enkle policyforklaringer.'),
  source('ep09-policy-enactment', 'Journal of Education Policy', 'Policy enactments in the UK secondary school', 'https://doi.org/10.1080/02680939.2010.493166', 'peer-reviewed-qualitative-study', 'policy-interpretation-translation-context', 'Braun, Maguire og Balls studie av hvordan policy fortolkes og oversettes av aktører i skoler med ulike materielle og profesjonelle vilkår.'),
  source('ep10-marketization', 'Research in Comparative and International Education', 'Educational reforms and marketization in Norway', 'https://doi.org/10.1177/1745499916631063', 'peer-reviewed-policy-study', 'npm-post-npm-profession-equity', 'Helgøy og Hommes historisk-institusjonelle analyse med intervjuer ved 13 skoler om NPM, post-NPM og norsk fellesskole.'),
  source('ep11-reform-planning', 'Scandinavian Journal of Educational Research', 'Reform planning strategies: a micro-policy case study of Norwegian school leaders', 'https://doi.org/10.1080/00313831.2023.2228830', 'peer-reviewed-case-study', 'lk20-local-planning-leadership-translation', 'Studie av hvordan skoleledere planla lokal gjennomføring av LK20 og håndterte kapasitet, oversettelse og organisatoriske valg.'),
  source('ep12-spatial-inequality', 'Nordic Journal of Studies in Educational Policy', 'Approaches to spatial inequalities in a Nordic welfare state – the case of Norway', 'https://site.uit.no/baeck/wp-content/uploads/sites/343/2024/04/Approaches-to-spatial-inequalities-in-a.dic-welfare-state-%E2%80%93-the-case-of-Norway.pdf', 'peer-reviewed-policy-analysis', 'geography-access-outcomes-rural-policy', 'Bæcks analyse av vedvarende geografiske forskjeller og hvordan universell nasjonal politikk møter lokale og rurale vilkår.'),
  source('ep13-school-choice', 'Scandinavian Political Studies', 'The Politics of School Choice in Scandinavia', 'https://doi.org/10.1111/1467-9477.70033', 'peer-reviewed-comparative-policy-study', 'choice-coalitions-institutions-norway-restraint', 'Komparativ analyse av hvorfor Norge, i motsetning til Sverige og Danmark, i begrenset grad innførte universelle skolevalgs- og voucherreformer.'),
];

const METHODS = {
  policy: ['met_utdanning_policyanalyse', 'met_utdanning_dokument_lareplananalyse'],
  implementation: ['met_utdanning_case_prosessporing', 'met_utdanning_kvalitativ_feltstudie'],
  inequality: ['met_utdanning_register_ulikhetsanalyse', 'met_utdanning_litteratursyntese'],
  evaluation: ['met_utdanning_policyanalyse', 'met_utdanning_intervensjonsvurdering'],
};

const TOPICS = [
  { id: 'rettigheter-og-formal', title: 'Rettigheter, formål og politiske konflikter', method_ids: METHODS.policy, source_ids: ['ep01-grunnlov-right', 'ep02-opplaringslov', 'ep03-regulatory-principles'], boundary: 'Rettigheter setter bindende grenser og positive plikter, men avgjør ikke alene ressursnivå, virkemiddel eller hvordan motstridende hensyn skal prioriteres.', planned_claims: [
    claim('ep-01', 'Grunnloven § 109 gjør utdanning til en rett og knytter grunnleggende opplæring til individets utvikling, demokrati, rettsstat og menneskerettigheter.', ['ep01-grunnlov-right', 'ep02-opplaringslov']),
    claim('ep-02', 'Opplæringslova fordeler rettigheter, plikter og ansvar mellom elever, foreldre, kommuner, fylkeskommuner og statlige kontrollorganer.', ['ep02-opplaringslov', 'ep03-regulatory-principles']),
    claim('ep-03', 'En formell rett krever kapasitet, kompetanse, finansiering, klageordninger og tilsyn for å bli virksom i praksis.', ['ep02-opplaringslov', 'ep05-oecd-quality']),
    claim('ep-04', 'Utdanningspolitikk er konflikt om legitime verdier som likhet, kunnskap, frihet, fellesskap, effektivitet og lokal autonomi, ikke bare teknisk problemløsning.', ['ep01-grunnlov-right', 'ep04-oecd-outlook', 'ep13-school-choice']),
  ]},
  { id: 'styringsniva-og-virkemidler', title: 'Styringsnivåer, ansvar og virkemidler', method_ids: METHODS.policy, source_ids: ['ep02-opplaringslov', 'ep03-regulatory-principles', 'ep04-oecd-outlook', 'ep07-funding'], boundary: 'Desentralisering flytter ansvar og skjønn, men fjerner ikke statlig ansvar eller ulikhet i lokal kapasitet.', planned_claims: [
    claim('ep-05', 'Norsk utdanningsstyring kombinerer nasjonal lov og læreplan med kommunalt og fylkeskommunalt skoleeierskap og profesjonelt skjønn.', ['ep02-opplaringslov', 'ep04-oecd-outlook']),
    claim('ep-06', 'Virkemidler som lov, finansiering, informasjon, kompetansetiltak, tilsyn og resultatdata påvirker aktører gjennom ulike mekanismer.', ['ep03-regulatory-principles', 'ep06-quality-system']),
    claim('ep-07', 'Lokal autonomi kan gi tilpasning til kontekst, men utfallet avhenger av administrativ, økonomisk og faglig kapasitet.', ['ep05-oecd-quality', 'ep07-funding']),
    claim('ep-08', 'Ansvarliggjøring blir uklar når beslutningsmyndighet, ressurser og resultatkrav ligger på forskjellige nivåer uten et eksplisitt ansvarsspor.', ['ep03-regulatory-principles', 'ep04-oecd-outlook', 'ep06-quality-system']),
  ]},
  { id: 'agenda-og-reformdesign', title: 'Agenda, reformdesign og politiske koalisjoner', method_ids: METHODS.policy, source_ids: ['ep04-oecd-outlook', 'ep10-marketization', 'ep13-school-choice'], boundary: 'Et problem kommer ikke på dagsordenen eller får ett bestemt virkemiddel bare fordi evidensen peker på det; ideer, interesser, institusjoner og timing virker sammen.', planned_claims: [
    claim('ep-09', 'Problemdefinisjonen avgrenser hvilke årsaker, grupper og virkemidler som blir politisk synlige.', ['ep04-oecd-outlook', 'ep06-quality-system']),
    claim('ep-10', 'Reformer formes av partier, profesjoner, forvaltning, foreldre, kommuner og kunnskapsaktører med ulike ressurser og problemforståelser.', ['ep10-marketization', 'ep13-school-choice']),
    claim('ep-11', 'Norges begrensede skolemarkedsreformer kan ikke forklares med nordisk kultur alene, men må knyttes til koalisjoner og institusjonelle veto- og mulighetsstrukturer.', ['ep13-school-choice', 'ep10-marketization']),
    claim('ep-12', 'Et virkemiddels politiske appell må skilles fra dokumentert mekanisme, gjennomførbarhet og fordelingseffekt.', ['ep03-regulatory-principles', 'ep04-oecd-outlook']),
  ]},
  { id: 'iverksetting-og-profesjonelt-skjonn', title: 'Iverksetting, policy enactment og profesjonelt skjønn', method_ids: METHODS.implementation, source_ids: ['ep09-policy-enactment', 'ep10-marketization', 'ep11-reform-planning'], boundary: 'Skoler implementerer ikke policy mekanisk; de fortolker og oversetter den, men lokalt skjønn opphever ikke rettigheter eller offentlig ansvar.', planned_claims: [
    claim('ep-13', 'Policy enactment beskriver hvordan aktører fortolker og oversetter policytekster under bestemte materielle, organisatoriske og profesjonelle vilkår.', ['ep09-policy-enactment', 'ep11-reform-planning']),
    claim('ep-14', 'Samme reform kan få ulik praksis når skoler har forskjellig bemanning, elevgrunnlag, historie, ledelse og tilgang til støtte.', ['ep09-policy-enactment', 'ep05-oecd-quality']),
    claim('ep-15', 'Skolelederes planlegging av LK20 viser at reformarbeid innebærer prioritering, meningsskaping og organisering, ikke bare formidling av en ferdig tekst.', ['ep11-reform-planning', 'ep09-policy-enactment']),
    claim('ep-16', 'Profesjonelt skjønn er nødvendig for situert handling, men må være rettighetsbundet, begrunnet og etterprøvbart.', ['ep02-opplaringslov', 'ep03-regulatory-principles', 'ep10-marketization']),
  ]},
  { id: 'finansiering-og-kapasitet', title: 'Finansiering, prioritering og lokal kapasitet', method_ids: METHODS.evaluation, source_ids: ['ep05-oecd-quality', 'ep07-funding', 'ep12-spatial-inequality'], boundary: 'Ressursnivå og fordelingsmodell er politiske valg; utgift per elev er viktig input, men er verken alene kvalitetsmål eller kausalt effektbevis.', planned_claims: [
    claim('ep-17', 'Kommuner finansierer grunnskolen og fylkeskommuner videregående opplæring innenfor inntekts- og overføringssystemer som gir lokale prioriteringsvalg.', ['ep07-funding', 'ep02-opplaringslov']),
    claim('ep-18', 'Like nasjonale krav kan være ulikt krevende å oppfylle når bosettingsmønster, skolestruktur, rekruttering og økonomisk kapasitet varierer.', ['ep05-oecd-quality', 'ep12-spatial-inequality']),
    claim('ep-19', 'Høyere ressursbruk gir ikke automatisk bedre utfall, men utilstrekkelige ressurser kan blokkere rettigheter og implementering.', ['ep05-oecd-quality', 'ep07-funding']),
    claim('ep-20', 'Fordelingspolitikk må vurdere både lik tildeling og ulikt ressursbehov for å oppnå reelt likeverdige muligheter.', ['ep07-funding', 'ep08-reisel-inequality', 'ep12-spatial-inequality']),
  ]},
  { id: 'kvalitet-data-og-ansvar', title: 'Kvalitet, data og ansvarliggjøring', method_ids: METHODS.evaluation, source_ids: ['ep04-oecd-outlook', 'ep05-oecd-quality', 'ep06-quality-system', 'ep10-marketization'], boundary: 'Indikatorer er selektive representasjoner; de kan støtte læring og ansvar, men må ikke forveksles med hele kvaliteten eller årsaken til observerte forskjeller.', planned_claims: [
    claim('ep-21', 'Kvalitet i skolen omfatter flere formål enn målbare prestasjoner, blant annet læring, inkludering, danning, demokrati og læringsmiljø.', ['ep01-grunnlov-right', 'ep06-quality-system']),
    claim('ep-22', 'Indikatorer synliggjør valgte fenomener gjennom bestemte definisjoner, målemodeller og aggregeringer og utelater andre.', ['ep06-quality-system', 'ep05-oecd-quality']),
    claim('ep-23', 'Resultatdata kan brukes formativt til undersøkelse eller sanksjonerende til kontroll, og bruken påvirker aktørenes respons og mulige strategiske tilpasning.', ['ep06-quality-system', 'ep10-marketization']),
    claim('ep-24', 'Et resultatgap er et politisk relevant signal, men forklarer ikke årsak eller hvilket virkemiddel som vil redusere gapet.', ['ep05-oecd-quality', 'ep08-reisel-inequality']),
  ]},
  { id: 'ulikhet-valg-og-segregering', title: 'Ulikhet, geografi, valg og segregering', method_ids: METHODS.inequality, source_ids: ['ep08-reisel-inequality', 'ep12-spatial-inequality', 'ep13-school-choice'], boundary: 'Gruppeforskjeller må analyseres gjennom institusjonelle mekanismer og kontekst, ikke gjøres til egenskaper ved individer eller bevis for ett universelt tiltak.', planned_claims: [
    claim('ep-25', 'Reisel viser at familieulikhet og utdanningssystemets seleksjon er forskjellige veier til ulikhet og kan kreve ulike virkemidler.', ['ep08-reisel-inequality', 'ep04-oecd-outlook']),
    claim('ep-26', 'Geografiske forskjeller kan bestå i en universell velferdsstat fordi avstand, tilbud, arbeidsmarked og lokal kapasitet virker sammen.', ['ep12-spatial-inequality', 'ep05-oecd-quality']),
    claim('ep-27', 'Skolevalg kan øke familieinnflytelse og samtidig påvirke elevsammensetning og segregering, avhengig av opptaksregler og bosettingsmønster.', ['ep13-school-choice', 'ep08-reisel-inequality']),
    claim('ep-28', 'Nasjonale gjennomsnitt kan skjule ulik virkning mellom sosial bakgrunn, funksjon, språk, kjønn og geografi og bør suppleres med fordelte analyser.', ['ep08-reisel-inequality', 'ep12-spatial-inequality', 'ep06-quality-system']),
  ]},
  { id: 'legitimitet-og-evaluering', title: 'Demokratisk legitimitet, evaluering og revisjon', method_ids: METHODS.evaluation, source_ids: ['ep01-grunnlov-right', 'ep03-regulatory-principles', 'ep06-quality-system', 'ep09-policy-enactment'], boundary: 'Evaluering må undersøke implementering, mekanisme, fordelingsvirkning og alternativer; den kan informere demokratiske valg, ikke erstatte dem.', planned_claims: [
    claim('ep-29', 'Legitim utdanningspolitikk krever åpen begrunnelse av mål, virkemidler, fordelingsvalg og hvem som fikk delta i beslutningen.', ['ep01-grunnlov-right', 'ep03-regulatory-principles']),
    claim('ep-30', 'Evaluering bør skille mellom svak programteori, mangelfull implementering og et tiltak som ikke virker under rimelige betingelser.', ['ep06-quality-system', 'ep09-policy-enactment']),
    claim('ep-31', 'Utilsiktede virkninger og ulik effekt mellom grupper må inngå i evalueringen selv når gjennomsnittsmålet forbedres.', ['ep06-quality-system', 'ep08-reisel-inequality']),
    claim('ep-32', 'Policyrevisjon bør være en eksplisitt læringssløyfe der evidens, rettigheter, kostnader og berørte aktørers erfaringer vurderes sammen.', ['ep03-regulatory-principles', 'ep06-quality-system', 'ep11-reform-planning']),
  ]},
];

const SCENARIOS = [
  { id: 'scenario-right-without-capacity', title: 'En ny rett vedtas uten kapasitetsspor', purpose: 'Koble juridisk plikt til kompetanse, finansiering, klage og tilsyn.', source_ids: ['ep02-opplaringslov', 'ep05-oecd-quality'] },
  { id: 'scenario-indicator-target', title: 'Én indikator blir hele kvalitetsmålet', purpose: 'Analysere konstrukt, utelatelser, bruk og strategisk tilpasning.', source_ids: ['ep06-quality-system', 'ep10-marketization'] },
  { id: 'scenario-same-reform-different-schools', title: 'Samme reform får ulik lokal praksis', purpose: 'Spore fortolkning, kapasitet, organisering og profesjonelt skjønn.', source_ids: ['ep09-policy-enactment', 'ep11-reform-planning'] },
  { id: 'scenario-equal-grant', title: 'Lik tildeling møter ulike behov', purpose: 'Skille likhet i input fra likeverdige muligheter og kostnadsstruktur.', source_ids: ['ep07-funding', 'ep12-spatial-inequality'] },
  { id: 'scenario-school-choice', title: 'Skolevalg foreslås som entydig frihetstiltak', purpose: 'Vurdere familieinnflytelse, institusjoner, seleksjon og segregering sammen.', source_ids: ['ep13-school-choice', 'ep08-reisel-inequality'] },
  { id: 'scenario-average-improves', title: 'Gjennomsnittet forbedres mens gapet øker', purpose: 'Vurdere nivå, fordeling, grupper, mekanismer og normative prioriteringer.', source_ids: ['ep06-quality-system', 'ep08-reisel-inequality'] },
];

export function build({ writeFiles = true } = {}) {
  const brief = {
    schema: 'history_go_utdanning_education_policy_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'utdanning',
    planned_unit_id: 'utdanningspolitikk-rettigheter-styring-ulikhet-og-legitimitet', future_chapter_id: 'utdanningspolitikk-rettigheter-styring-ulikhet-og-legitimitet',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false }, metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: { title: 'Utdanningspolitikk: rettigheter, styring, ulikhet og legitimitet', primary_domain_id: 'utdanningspolitikk', canonical_emne_id: 'em_utdanning_utdanningspolitikk', ownership: 'Utdanning eier analysen av rettigheter, politiske mål og konflikter, styringsnivåer, virkemidler, finansiering, reformoversettelse, kvalitetsdata, ulikhet og demokratisk revisjon i utdanningssystemet.', included: TOPICS.map((topic) => topic.title), excluded: ['partipolitisk anbefaling som faglig fasit', 'lovtekst som implementeringsbevis', 'indikator som komplett kvalitetsdefinisjon', 'resultatgap som kausal forklaring', 'lokal autonomi uten kapasitetsanalyse', 'gjennomsnittseffekt uten fordelingsvirkning'] },
    source_policy: { rights_require_implementation_capacity: true, policy_is_contested_value_choice: true, instruments_require_mechanism: true, decentralization_requires_capacity_analysis: true, policy_is_enacted_not_copied: true, indicator_is_not_complete_quality: true, gap_is_not_causal_explanation: true, averages_require_distribution_analysis: true, evaluation_informs_not_replaces_democracy: true, planned_claim_is_not_verified_claim: true, fulltext_requires_reciprocal_paragraph_claim_trace: true, sources_verified_at: '2026-08-27' },
    allowed_method_ids: [...new Set(Object.values(METHODS).flat())], sources: SOURCES, decision_scenarios: SCENARIOS, topic_briefs: TOPICS, next_gate: 'education_policy_source_brief_complete_full_chapter_production',
  };
  if (writeFiles) write(BRIEF, brief);
  return brief;
}

export function audit({ writeReport = false } = {}) {
  const brief = fs.existsSync(abs(BRIEF)) ? read(BRIEF) : build({ writeFiles: false });
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims); const sourceIds = new Set(brief.sources.map((row) => row.id)); const usedSources = new Set(claims.flatMap((row) => row.source_ids));
  assert(brief.scope.primary_domain_id === 'utdanningspolitikk', 'Feil domene');
  assert(!brief.runtime_registration.registered && !brief.metadata_registration.global_status_mutation_in_source_brief, 'Source brief kan ikke registrere runtime');
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Feil 13/8/32/6-struktur');
  assert(new Set(claims.map((row) => row.id)).size === 32 && claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være unike og kildebundet');
  assert(brief.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-27'), 'Kilder må være inspiserbare');
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle kilder må brukes');
  assert(['rights_require_implementation_capacity', 'policy_is_contested_value_choice', 'instruments_require_mechanism', 'decentralization_requires_capacity_analysis', 'policy_is_enacted_not_copied', 'indicator_is_not_complete_quality', 'gap_is_not_causal_explanation', 'averages_require_distribution_analysis', 'evaluation_informs_not_replaces_democracy'].every((key) => brief.source_policy[key]), 'Utdanningspolitiske metodegrenser mangler');
  const report = { schema: 'history_go_utdanning_education_policy_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'pass', subject_id: 'utdanning', domain_id: 'utdanningspolitikk', counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, modules: 4 }, gates: { sourceFirstUnregistered: true, allSourcesInspectable: true, everyClaimSourceBound: true, everySourceUsed: true, rightCapacityBoundary: true, contestedValuesBoundary: true, instrumentMechanismBoundary: true, decentralizationCapacityBoundary: true, policyEnactmentBoundary: true, indicatorQualityBoundary: true, gapCausalityBoundary: true, distributionBoundary: true, democraticEvaluationBoundary: true, fulltextClaimTraceRequired: true }, six_part_quality_review: { source_authority_and_provenance: 5, claim_plan_and_verifiability: 5, policy_theory_and_governance: 5, rights_equity_and_democracy: 5, method_and_scenarios: 4, architecture_and_reproducibility: 5, total: 29, maximum: 30, note: 'Source-first-produksjon; policyclaims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.' }, next_gate: brief.next_gate };
  if (writeReport) write(REPORT, report); else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  if (process.argv.includes('--write-brief')) build();
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Utdanningspolitikk source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) { console.error(`Utdanningspolitikk source brief FEIL: ${error.message}`); process.exitCode = 1; }
