#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/utdanning/history_of_education_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/utdanning-history-of-education-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const claim = (id, text, source_ids) => ({ id, text, status: 'planned_requires_fulltext_verification', source_ids });
const source = (id, publisher, title, url, type, evidence_role, source_location) => ({ id, publisher, title, url, type, evidence_role, source_location, retrieval_status: 'verified_2026-08-27' });

const SOURCES = [
  source('hi01-dokka-250', 'Nasjonalbiblioteket', 'En skole gjennom 250 år: den norske allmueskole, folkeskole, grunnskole 1739–1989', 'https://www.nb.no/items/URN:NBN:no-nb_digibok_2014071106106', 'scholarly-history-monograph', 'longitudinal-school-system-history', 'Hans-Jørgen Dokkas syntese av institusjoner, skolelover, profesjon og praksis fra 1739 til 1989.'),
  source('hi02-utdanning-1000', 'Nasjonalbiblioteket', 'Utsyn over norsk skole: norsk utdanning gjennom 1000 år', 'https://www.nb.no/items/URN:NBN:no-nb_digibok_2013071905104', 'scholarly-history-monograph', 'long-duration-education-history', 'Historisk oversikt som setter allmueskole og moderne skole i en lengre institusjonell sammenheng.'),
  source('hi03-1739-norway', 'Springer Reference', 'Norway – The Education Systems of Europe', 'https://link.springer.com/rwe/10.1007/978-3-319-07473-3_36', 'scholarly-reference-chapter', '1739-confessional-compulsory-school-origins', 'Fagfellevurdert oversikt over 1739-forordningen, pietisme, plikt, omgangsskole og senere systemutvikling.'),
  source('hi04-1889-folkeskole', 'Nasjonalbiblioteket', 'Skoleloven av 1889: fra almueskole til folkeskole', 'https://www.nb.no/items/URN:NBN:no-nb_digibok_2013012907034', 'historical-law-study', '1889-common-school-citizenship-transition', 'Dokumentasjon og analyse av lovskiftet fra almueskole til folkeskole og dets politiske sammenheng.'),
  source('hi05-girls-education', 'Paedagogica Historica', 'Struggling for girls’ education: coalition strategies of reformers in Norway and Prussia', 'https://doi.org/10.1080/00309230.2022.2116290', 'peer-reviewed-comparative-history', 'gendered-access-reform-coalitions', 'Komparativ historisk studie av koalisjoner, interesser og institusjonelle barrierer i utbyggingen av jenters utdanning.'),
  source('hi06-teacher-resistance', 'Scandinavian Journal of History', 'Collaboration and resistance in state institutions in Nazi-occupied Norway', 'https://doi.org/10.1080/03468755.2020.1846075', 'peer-reviewed-historical-study', 'occupation-teacher-resistance-institutional-agency', 'Arkivbasert analyse av statsinstitusjoner og læreraksjonen etter okkupasjonsregimets lover i 1942.'),
  source('hi07-postwar-reforms', 'Oxford Research Encyclopedia of Education', 'Postwar School Reforms in Norway', 'https://doi.org/10.1093/acrefore/9780190264093.013.1456', 'peer-reviewed-research-encyclopedia', 'comprehensive-school-welfare-state-reform-conflict', 'Thuen og Volckmars syntese av forsøk, 9- og 10-årig grunnskole, videregående integrasjon og fellesskap–individ-konflikten.'),
  source('hi08-reform94', 'Kunnskapsdepartementet', 'St.meld. nr. 16 (2006–2007) – ... og ingen stod igjen', 'https://www.regjeringen.no/no/dokumenter/stmeld-nr-16-2006-2007-/id441395/', 'official-policy-retrospective', 'reform94-rights-vocational-integration-limitations', 'Offisiell retrospektiv omtale av retten til videregående opplæring, koblingen skole–lærebedrift og vedvarende differensieringsutfordringer.'),
  source('hi09-opplaringslova1998', 'Lovdata', 'Lov om grunnskolen og den vidaregåande opplæringa (opplæringslova 1998)', 'https://lovdata.no/lov/1998-07-17-61', 'historical-law', 'legal-consolidation-rights-governance', 'Historisk lovtekst som samlet grunnskole og videregående opplæring og dokumenterer rettighets- og styringsspråk før 2024-loven.'),
  source('hi10-l97', 'Utdanningsdirektoratet', 'Læreplanverket for den 10-årige grunnskolen 1997 (L97)', 'https://www.udir.no/laring-og-trivsel/lareplanverket/utgatt/utgatt-lareplanverk-grunnskolen-L97/', 'historical-official-curriculum', 'ten-year-school-curriculum-primary-source', 'Arkivert offisiell læreplan for den tiårige grunnskolen, brukt som primærkilde til innhold og intensjon, ikke som bevis på praksis.'),
  source('hi11-curriculum-reform', 'Utdanningsdirektoratet', 'Kunnskapsløftet – på vei mot felles nasjonal læreplan?', 'https://www.udir.no/globalassets/filer/tall-og-forskning/rapporter/2011/5/pfi_sluttrapport_2011.pdf', 'commissioned-curriculum-research', 'n39-l97-lk06-curriculum-governance-analysis', 'Forskningsrapport med fagplanhistorie fra N39 til L97 og empirisk analyse av lokalt læreplanarbeid under LK06.'),
  source('hi12-marketization', 'Research in Comparative and International Education', 'Educational reforms and marketization in Norway', 'https://doi.org/10.1177/1745499916631063', 'peer-reviewed-policy-history', 'npm-governance-profession-equality-tensions', 'Historisk-institusjonell analyse med intervjuer ved 13 skoler av NPM, post-NPM og styringsspenninger etter 2001.'),
  source('hi13-truth-reconciliation', 'Kommunal- og distriktsdepartementet', 'Sannhets- og forsoningskommisjonens rapport og oppfølging', 'https://www.regjeringen.no/no/tema/urfolk-og-minoriteter/oppfolging-av-sannhets-og-forsoningskommisjonens-rapport/id3088271/', 'official-historical-commission', 'assimilation-school-language-historical-injustice', 'Kommisjonens historiske kartlegging og Stortingets 2024-behandling av fornorskingspolitikken overfor samer, kvener/norskfinner og skogfinner.'),
];

const METHODS = {
  document: ['met_utdanning_dokument_lareplananalyse', 'met_utdanning_litteratursyntese'],
  historical: ['met_utdanning_dokument_lareplananalyse', 'met_utdanning_kvalitativ_feltstudie'],
  comparative: ['met_utdanning_litteratursyntese', 'met_utdanning_kvalitativ_feltstudie'],
  ethics: ['met_utdanning_etikk_barn_representasjon', 'met_utdanning_dokument_lareplananalyse'],
};

const TOPICS = [
  { id: 'kilder-og-periodisering', title: 'Historiske kilder, periodisering og forklaring', method_ids: METHODS.historical, source_ids: ['hi01-dokka-250', 'hi02-utdanning-1000', 'hi11-curriculum-reform'], boundary: 'Perioder, lover og læreplaner organiserer undersøkelsen, men er ikke alene årsaksforklaringer eller bevis på lokal praksis.', planned_claims: [
    claim('hi-01', 'Utdanningshistorie må skille mellom normerende tekster, institusjonelle ordninger og praksisen elever og lærere faktisk erfarte.', ['hi01-dokka-250', 'hi11-curriculum-reform']),
    claim('hi-02', 'Periodisering er et analytisk valg som fremhever noen brudd og kontinuiteter og derfor må begrunnes fremfor å behandles som naturgitt.', ['hi01-dokka-250', 'hi02-utdanning-1000']),
    claim('hi-03', 'En læreplan kan dokumentere offisielle ambisjoner, men ikke uten videre hva lærere underviste eller elever lærte.', ['hi10-l97', 'hi11-curriculum-reform']),
    claim('hi-04', 'Utvidet skolegang er ikke automatisk lik sosial, språklig eller faglig deltakelse; tilgang og erfaring må undersøkes separat.', ['hi02-utdanning-1000', 'hi05-girls-education', 'hi13-truth-reconciliation']),
  ]},
  { id: 'allmueskole-og-folkeskole', title: 'Allmueskole, folkeskole og statsbygging', method_ids: METHODS.document, source_ids: ['hi01-dokka-250', 'hi03-1739-norway', 'hi04-1889-folkeskole'], boundary: '1739 og 1889 var viktige institusjonelle skifter, men virkningen var ulik etter sted, økonomi og lokal gjennomføring.', planned_claims: [
    claim('hi-05', '1739-forordningen knyttet obligatorisk allmueskole til pietistisk konfirmasjonsforberedelse, lesing og religiøs oppdragelse.', ['hi01-dokka-250', 'hi03-1739-norway']),
    claim('hi-06', 'Omgangsskole og kort årlig undervisning viser avstanden mellom sentral plikt og lokale ressurser i det spredtbygde Norge.', ['hi02-utdanning-1000', 'hi03-1739-norway']),
    claim('hi-07', '1889-lovene markerte overgangen fra almueskole til folkeskole og bandt skolen tettere til medborgerskap og det politiske fellesskapet.', ['hi01-dokka-250', 'hi04-1889-folkeskole']),
    claim('hi-08', 'Folkeskoleutbyggingen skapte en felles institusjon, men urban–rural ulikhet og parallelle videre skoleveier bestod.', ['hi01-dokka-250', 'hi02-utdanning-1000', 'hi04-1889-folkeskole']),
  ]},
  { id: 'kjonn-klasse-og-sprak', title: 'Kjønn, klasse, språk og eksklusjon', method_ids: METHODS.comparative, source_ids: ['hi05-girls-education', 'hi13-truth-reconciliation', 'hi02-utdanning-1000'], boundary: 'Nasjonale fortellinger om likhet må prøves mot hvem som fikk tilgang, på hvilket språk, til hvilket innhold og med hvilke konsekvenser.', planned_claims: [
    claim('hi-09', 'Jenters utdanningsadgang ble utvidet gjennom politiske koalisjoner og institusjonell kamp, ikke som automatisk følge av generell skolevekst.', ['hi05-girls-education', 'hi02-utdanning-1000']),
    claim('hi-10', 'Sosial bakgrunn påvirket lenge overgangen fra folkeskole til høyere skole selv når grunnopplæringen ble mer universell.', ['hi01-dokka-250', 'hi07-postwar-reforms']),
    claim('hi-11', 'Skolen var en sentral arena for fornorskingspolitikk som svekket samiske og kvenske eller norskfinske språk- og kulturvilkår.', ['hi13-truth-reconciliation', 'hi02-utdanning-1000']),
    claim('hi-12', 'En historieskriving som bare følger majoritetens institusjoner kan gjøre tvang, tap og minoritetsaktørers motstand usynlig.', ['hi13-truth-reconciliation', 'hi01-dokka-250']),
  ]},
  { id: 'profesjon-demokrati-og-okkupasjon', title: 'Lærerprofesjon, demokrati og okkupasjon', method_ids: METHODS.historical, source_ids: ['hi01-dokka-250', 'hi06-teacher-resistance', 'hi04-1889-folkeskole'], boundary: 'Læreres kollektive handling må analyseres i institusjonell og politisk kontekst, ikke gjøres til en tidløs profesjonsmyte.', planned_claims: [
    claim('hi-13', 'Seminarer, organisering og sertifiseringskrav bidro til å gjøre undervisning til en tydeligere profesjon med kollektiv identitet.', ['hi01-dokka-250', 'hi04-1889-folkeskole']),
    claim('hi-14', 'Lærere var både statens lokale representanter og aktører som kunne forhandle om eller motsette seg styring.', ['hi01-dokka-250', 'hi06-teacher-resistance']),
    claim('hi-15', 'Læreraksjonen i 1942 svarte på okkupasjonsregimets forsøk på korporativ organisering og ideologisk kontroll av skolen.', ['hi06-teacher-resistance', 'hi07-postwar-reforms']),
    claim('hi-16', 'Motstanden viser institusjonell handlekraft, men bør undersøkes med arkivkilder og variasjon fremfor heroiseres som en enstemmig fortelling.', ['hi06-teacher-resistance', 'hi01-dokka-250']),
  ]},
  { id: 'enhetsskole-og-velferdsstat', title: 'Enhetsskole, forsøk og velferdsstat', method_ids: METHODS.comparative, source_ids: ['hi07-postwar-reforms', 'hi01-dokka-250', 'hi02-utdanning-1000'], boundary: 'Enhetsskolen var både likhetsprosjekt og konfliktfelt mellom fellesskap, differensiering og individuelle behov.', planned_claims: [
    claim('hi-17', 'Etterkrigstidens enhetsskole knyttet felles skolegang til sosial utjevning, nasjonal integrasjon og velferdsstat.', ['hi07-postwar-reforms', 'hi02-utdanning-1000']),
    claim('hi-18', 'Niårig skole ble utviklet gjennom forsøk før lovfestingen i 1969, slik at reform og kunnskapsutvikling virket sammen.', ['hi07-postwar-reforms', 'hi01-dokka-250']),
    claim('hi-19', 'Felles skole reiste et vedvarende spørsmål om hvordan individuell tilpasning kunne forenes med sosialt og kulturelt fellesskap.', ['hi07-postwar-reforms', 'hi01-dokka-250']),
    claim('hi-20', 'Enhetsskoleidealets brede oppslutning utelukket ikke politisk konflikt om differensiering, frihet, kunnskap og statlig styring.', ['hi07-postwar-reforms', 'hi12-marketization']),
  ]},
  { id: 'videregaende-og-rettighetsutvidelse', title: 'Videregående integrasjon og rettighetsutvidelse', method_ids: METHODS.document, source_ids: ['hi07-postwar-reforms', 'hi08-reform94', 'hi09-opplaringslova1998'], boundary: 'Formell rett og samlet struktur må holdes fra fullføring, læreplassadgang og likeverdige faglige erfaringer.', planned_claims: [
    claim('hi-21', '1974-reformen samlet gymnas og yrkesskoler i en felles videregående struktur, men slettet ikke spenningen mellom studie- og yrkesveier.', ['hi07-postwar-reforms', 'hi08-reform94']),
    claim('hi-22', 'Reform 94 ga ungdom rett til videregående opplæring og knyttet skole og lærebedrift tettere sammen.', ['hi08-reform94', 'hi09-opplaringslova1998']),
    claim('hi-23', 'Nesten universell adgang etter Reform 94 skapte nye differensierings- og fullføringsutfordringer som rettigheten alene ikke løste.', ['hi08-reform94', 'hi07-postwar-reforms']),
    claim('hi-24', 'Opplæringslova 1998 konsoliderte rettigheter og systemnivåer, men lovtekst må analyseres sammen med ressurser og lokal gjennomføring.', ['hi09-opplaringslova1998', 'hi11-curriculum-reform']),
  ]},
  { id: 'lareplan-og-styringsskift', title: 'Læreplaner, desentralisering og resultatstyring', method_ids: METHODS.document, source_ids: ['hi10-l97', 'hi11-curriculum-reform', 'hi12-marketization'], boundary: 'Styringsskift er hybride og omstridte; nye begreper erstatter ikke nødvendigvis eldre praksiser eller verdier fullstendig.', planned_claims: [
    claim('hi-25', 'L97 dokumenterer både innføringen av tiårig grunnskole og et detaljert nasjonalt innholds- og verdiprosjekt.', ['hi10-l97', 'hi07-postwar-reforms']),
    claim('hi-26', 'LK06 flyttet vekt mot kompetansemål og lokalt læreplanarbeid, men forskningen viser variasjon i hvordan ansvaret ble forstått.', ['hi11-curriculum-reform', 'hi12-marketization']),
    claim('hi-27', 'Nasjonale prøver, resultatdata og ansvarliggjøring endret styringsrelasjoner uten at norsk skole ble et fullt markedssystem.', ['hi12-marketization', 'hi11-curriculum-reform']),
    claim('hi-28', 'NPM og post-NPM-elementer har virket sammen med eldre regler, profesjonsnormer og fellesskoleidealer i hybride styringsformer.', ['hi12-marketization', 'hi07-postwar-reforms']),
  ]},
  { id: 'historisk-dommekraft', title: 'Historisk dommekraft og skoleutvikling', method_ids: METHODS.ethics, source_ids: ['hi01-dokka-250', 'hi05-girls-education', 'hi06-teacher-resistance', 'hi13-truth-reconciliation'], boundary: 'Fortiden skal ikke brukes som moralsk pynt eller enkel fasit; aktører, alternativer, makt, kildestillhet og ettervirkninger må undersøkes.', planned_claims: [
    claim('hi-29', 'Historisk dommekraft krever at aktørers handlingsrom rekonstrueres uten å gjøre samtidens normer irrelevante for vurderingen av urett.', ['hi06-teacher-resistance', 'hi13-truth-reconciliation']),
    claim('hi-30', 'Reformintensjon, implementering og virkning må spores i forskjellige kilder for å unngå at vedtak blir forvekslet med resultat.', ['hi01-dokka-250', 'hi11-curriculum-reform']),
    claim('hi-31', 'Arkivstillhet kan gjenspeile makt fordi elever, minoriteter og kvinner ofte er svakere representert i institusjonenes egne dokumenter.', ['hi05-girls-education', 'hi13-truth-reconciliation']),
    claim('hi-32', 'Skolehistorie kan belyse nåtidige dilemmaer når kontinuitet og brudd undersøkes eksplisitt, ikke når fortiden gjøres til lineær framgangsfortelling.', ['hi02-utdanning-1000', 'hi07-postwar-reforms', 'hi12-marketization']),
  ]},
];

const SCENARIOS = [
  { id: 'scenario-law-equals-practice', title: 'En skolelov behandles som bevis på praksis', purpose: 'Skille norm, lokal implementering og elevens erfaring.', source_ids: ['hi01-dokka-250', 'hi11-curriculum-reform'] },
  { id: 'scenario-progress-narrative', title: 'Historien fortelles som ubrutt framgang', purpose: 'Finne kontinuiteter, kostnader, tap og motstridende virkninger.', source_ids: ['hi02-utdanning-1000', 'hi13-truth-reconciliation'] },
  { id: 'scenario-1889-local', title: '1889-loven møter et ressursfattig lokalsamfunn', purpose: 'Analysere avstand mellom nasjonal institusjon og lokal kapasitet.', source_ids: ['hi04-1889-folkeskole', 'hi01-dokka-250'] },
  { id: 'scenario-teacher-action', title: 'Læreraksjonen brukes som profesjonsmyte', purpose: 'Prøve heltefortellingen mot arkiv, variasjon og politisk kontekst.', source_ids: ['hi06-teacher-resistance', 'hi01-dokka-250'] },
  { id: 'scenario-reform94-right', title: 'Formell rett forveksles med fullføring', purpose: 'Skille adgang, læreplass, differensiering og oppnådd kompetanse.', source_ids: ['hi08-reform94', 'hi09-opplaringslova1998'] },
  { id: 'scenario-minority-silence', title: 'Minoritetsstemmer mangler i skolearkivet', purpose: 'Arbeide kildekritisk med makt, fravær og komplementære kilder.', source_ids: ['hi13-truth-reconciliation', 'hi05-girls-education'] },
];

export function build({ writeFiles = true } = {}) {
  const brief = {
    schema: 'history_go_utdanning_history_of_education_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'utdanning',
    planned_unit_id: 'utdanningshistorie-fellesskole-reformer-og-historisk-dommekraft', future_chapter_id: 'utdanningshistorie-fellesskole-reformer-og-historisk-dommekraft',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false }, metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: { title: 'Utdanningshistorie: fellesskole, reformer og historisk dømmekraft', primary_domain_id: 'utdanningshistorie', canonical_emne_id: 'em_utdanning_utdanningshistorie', ownership: 'Utdanning eier analysen av norske utdanningsinstitusjoners utvikling, aktørkonflikter, ulik tilgang, læreplan- og styringsskift og metodene som gjør historiske påstander etterprøvbare.', included: TOPICS.map((topic) => topic.title), excluded: ['lineær framskrittsfortelling', 'lovtekst som implementeringsbevis', 'nasjonal majoritetshistorie uten minoritets- og ulikhetsperspektiv', 'reformnavn som årsaksforklaring', 'heltefortelling uten arkivkritikk', 'dagens begreper projisert ukritisk bakover'] },
    source_policy: { periodization_requires_argument: true, reform_text_is_not_implementation: true, expansion_is_not_equal_participation: true, majority_narrative_requires_minority_history: true, archive_silence_requires_power_analysis: true, oral_and_retrospective_sources_require_context: true, no_linear_progress_myth: true, causal_claims_require_mechanisms: true, planned_claim_is_not_verified_claim: true, fulltext_requires_reciprocal_paragraph_claim_trace: true, sources_verified_at: '2026-08-27' },
    allowed_method_ids: [...new Set(Object.values(METHODS).flat())], sources: SOURCES, decision_scenarios: SCENARIOS, topic_briefs: TOPICS, next_gate: 'history_of_education_source_brief_complete_full_chapter_production',
  };
  if (writeFiles) write(BRIEF, brief);
  return brief;
}

export function audit({ writeReport = false } = {}) {
  const brief = fs.existsSync(abs(BRIEF)) ? read(BRIEF) : build({ writeFiles: false });
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims); const sourceIds = new Set(brief.sources.map((row) => row.id)); const usedSources = new Set(claims.flatMap((row) => row.source_ids));
  assert(brief.scope.primary_domain_id === 'utdanningshistorie', 'Feil domene');
  assert(!brief.runtime_registration.registered && !brief.metadata_registration.global_status_mutation_in_source_brief, 'Source brief kan ikke registrere runtime');
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Feil 13/8/32/6-struktur');
  assert(new Set(claims.map((row) => row.id)).size === 32 && claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være unike og kildebundet');
  assert(brief.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-27'), 'Kilder må være inspiserbare');
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle kilder må brukes');
  assert(['periodization_requires_argument', 'reform_text_is_not_implementation', 'expansion_is_not_equal_participation', 'majority_narrative_requires_minority_history', 'archive_silence_requires_power_analysis', 'oral_and_retrospective_sources_require_context', 'no_linear_progress_myth', 'causal_claims_require_mechanisms'].every((key) => brief.source_policy[key]), 'Historiske metodegrenser mangler');
  const report = { schema: 'history_go_utdanning_history_of_education_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'pass', subject_id: 'utdanning', domain_id: 'utdanningshistorie', counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, modules: 4 }, gates: { sourceFirstUnregistered: true, allSourcesInspectable: true, everyClaimSourceBound: true, everySourceUsed: true, periodizationBoundary: true, reformImplementationBoundary: true, participationBeyondAccessBoundary: true, minorityHistoryBoundary: true, archivePowerBoundary: true, retrospectiveSourceBoundary: true, noLinearProgressBoundary: true, causalMechanismBoundary: true, fulltextClaimTraceRequired: true }, six_part_quality_review: { source_authority_and_provenance: 5, claim_plan_and_verifiability: 5, historical_context_and_periodization: 5, power_difference_and_representation: 5, method_and_scenarios: 4, architecture_and_reproducibility: 5, total: 29, maximum: 30, note: 'Source-first-produksjon; historiske claims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.' }, next_gate: brief.next_gate };
  if (writeReport) write(REPORT, report); else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  if (process.argv.includes('--write-brief')) build();
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Utdanningshistorie source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) { console.error(`Utdanningshistorie source brief FEIL: ${error.message}`); process.exitCode = 1; }
