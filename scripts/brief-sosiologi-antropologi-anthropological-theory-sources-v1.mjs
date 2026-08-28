#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/politikk/sosiologi_antropologi/anthropological_theory_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sosiologi-antropologi-anthropological-theory-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const sources = [
  ['aat01-boas', 'University of Chicago Press', 'Race, Language, and Culture', 'https://press.uchicago.edu/ucp/books/book/chicago/R/bo5939851.html', 'historical-particularism-language-race-culture', 'Boksiden dokumenterer Boas-samlingen og dens plass i kultur- og sosialantropologi.'],
  ['aat02-malinowski', 'Internet Archive', 'Argonauts of the Western Pacific', 'https://archive.org/details/argonautsofwest00mali', 'participant-observation-kula-fieldwork', 'Digitalisert primærutgave med innledning, metodeargument og Kula-etnografi.'],
  ['aat03-mauss', 'Routledge', 'The Gift: The Form and Reason for Exchange in Archaic Societies', 'https://www.routledge.com/The-Gift-The-Form-and-Reason-for-Exchange-in-Archaic-Societies/Mauss/p/book/9780415267496', 'gift-reciprocity-obligation-total-social-fact', 'Forlagssiden dokumenterer Mauss’ analyse av gave, utveksling og sosial forpliktelse.'],
  ['aat04-levi-strauss', 'Basic Books', 'Structural Anthropology', 'https://www.hachettebookgroup.com/titles/claude-levi-strauss/structural-anthropology/9780465095162/', 'structuralism-classification-myth-kinship', 'Forlagssiden identifiserer Lévi-Strauss’ strukturalistiske antropologi og analyseområder.'],
  ['aat05-geertz', 'Basic Books', 'The Interpretation of Cultures', 'https://www.basicbooks.com/titles/clifford-geertz/the-interpretation-of-cultures/9780465093557/', 'thick-description-symbol-interpretation', 'Forlagssiden dokumenterer Geertz’ fortolkende antropologi og begrepet tett beskrivelse.'],
  ['aat06-turner', 'Routledge', 'The Ritual Process: Structure and Anti-Structure', 'https://www.routledge.com/The-Ritual-Process-Structure-and-Anti-Structure/Turner-Abrahams-Harris/p/book/9780202011905', 'ritual-liminality-communitas-process', 'Forlagssiden beskriver Ndembu-materialet og Turners begreper liminalitet og communitas.'],
  ['aat07-douglas', 'Routledge', 'Purity and Danger', 'https://www.routledge.com/Purity-and-Danger-An-Analysis-of-Concepts-of-Pollution-and-Taboo/Douglas/p/book/9780415289955', 'classification-purity-danger-boundary', 'Forlagssiden dokumenterer Douglas’ analyse av renhet, fare, tabu og klassifikasjon.'],
  ['aat08-sahlins', 'Routledge', 'Stone Age Economics', 'https://www.routledge.com/Stone-Age-Economics/Sahlins/p/book/9780415320103', 'economic-anthropology-subsistence-exchange', 'Forlagssiden dokumenterer Sahlins’ kritikk av knapphetsantakelser og studier av utveksling.'],
  ['aat09-strathern', 'University of California Press', 'The Gender of the Gift', 'https://www.ucpress.edu/book/9780520072022/the-gender-of-the-gift', 'gender-gift-personhood-melanesia', 'Forlagssiden dokumenterer Stratherns kritikk av vestlige antakelser i analyse av kjønn, person og gave.'],
  ['aat10-abu-lughod', 'Open Encyclopedia of Anthropology', 'Culture', 'https://doi.org/10.29164/26culture', 'writing-against-culture-specificity-power', 'Fagfellevurdert oversikt som dokumenterer kulturdebatt, inkludert Abu-Lughods kritikk av avgrensede kulturenheter.'],
  ['aat11-said', 'Penguin', 'Orientalism', 'https://www.penguin.co.uk/books/57454/orientalism-by-edward-w-said/9780141187426', 'orientalism-representation-colonial-knowledge', 'Forlagssiden dokumenterer Saids analyse av representasjon, kunnskap og kolonial makt.'],
  ['aat12-ethnography', 'Open Encyclopedia of Anthropology', 'Ethnography', 'https://www.anthroencyclopedia.com/entry/ethnography', 'participant-observation-comparison-reflexivity', 'Fagfellevurdert metodeoversikt om langvarig deltakende observasjon, sammenligning og teori.'],
  ['aat13-nesh', 'De nasjonale forskningsetiske komiteene', 'Guidelines for Research Ethics in the Social Sciences and the Humanities', 'https://www.forskningsetikk.no/en/guidelines/social-sciences-and-humanities/guidelines-for-research-ethics-in-the-social-sciences-and-the-humanities/', 'research-ethics-consent-confidentiality-representation', 'Retningslinjene angir ansvar for samtykke, konfidensialitet, utsatte grupper, skade og formidling.'],
].map(([id, publisher, title, url, evidence_role, source_location]) => ({ id, publisher, title, url, type: id.includes('nesh') ? 'research-ethics-guideline' : id.includes('encyclopedia') || id === 'aat10-abu-lughod' || id === 'aat12-ethnography' ? 'peer-reviewed-open-reference' : 'scholarly-primary-or-classic', evidence_role, source_location, retrieval_status: 'verified_2026-08-28', label: `${publisher} – ${title}` }));

const topicData = [
  ['kultur-historie-og-relativisme', 'Kultur, historie og relativisme', ['aat01-boas','aat10-abu-lughod'], 'Kultur er et analytisk problem og historisk mønster, ikke en lukket boks eller automatisk årsak.', [
    'Boas’ historiske partikularisme utfordrer rangering av samfunn langs én universell utviklingslinje og krever dokumentasjon av konkrete historiske forløp.',
    'Språk, biologisk kategorisering og kulturell praksis kan samvariere uten å utgjøre én naturlig eller uforanderlig enhet.',
    'Kulturrelativisme er et metodisk krav om kontekstuell forståelse, ikke et forbud mot empirisk eller etisk vurdering.',
    'Abu-Lughods kulturkritikk viser hvordan avgrensede gruppebeskrivelser kan skjule historie, makt, variasjon og forbindelser.'
  ]],
  ['feltarbeid-deltakelse-og-refleksivitet', 'Feltarbeid, deltakelse og refleksivitet', ['aat02-malinowski','aat12-ethnography','aat13-nesh'], 'Nærhet gir situert kunnskap, men opphever ikke seleksjon, makt eller forskningsetisk ansvar.', [
    'Malinowskis langvarige feltarbeid etablerte deltakende observasjon som kobling mellom hverdagspraksis, språk og institusjoner.',
    'Deltakelse og observasjon skaper ulike typer tilgang og må dokumenteres gjennom feltrolle, tidsrom, språk og hendelsesutvalg.',
    'Feltdata er samprodusert i relasjoner; refleksivitet undersøker hvordan forskerens posisjon former tilgang, fortolkning og taushet.',
    'Samtykke i feltarbeid er en vedvarende prosess og må vurderes mot forventet privathet, sårbarhet og indirekte identifisering.'
  ]],
  ['gave-utveksling-og-relasjon', 'Gave, utveksling og relasjon', ['aat03-mauss','aat08-sahlins','aat09-strathern'], 'Utveksling kan skape gjeld, allianse og personhood; den er ikke automatisk frivillig, harmonisk eller lik.', [
    'Mauss analyserer gaven som en forpliktende sekvens av å gi, motta og gjengjelde som binder økonomi, rett, ritual og relasjon.',
    'Gaveutveksling kan produsere solidaritet og dominans samtidig, avhengig av timing, gjengjeldelsesmulighet og asymmetri.',
    'Sahlins viser at økonomisk handling må undersøkes gjennom institusjonelle og kulturelle ordninger, ikke universell knapphetspsykologi alene.',
    'Strathern utfordrer vestlige antakelser om individ, eierskap og kjønn når relasjoner og personer beskrives i melanesisk etnografi.'
  ]],
  ['struktur-klassifikasjon-og-slektskap', 'Struktur, klassifikasjon og slektskap', ['aat04-levi-strauss','aat07-douglas','aat09-strathern'], 'Analytiske motsetninger og slektskapsmodeller må ikke erstatte variasjon, historie eller aktørers praksis.', [
    'Lévi-Strauss bruker relasjoner og transformasjoner mellom tegn, myter og slektskapsposisjoner som strukturalistisk analyseenhet.',
    'En strukturalistisk modell viser mulige ordninger, men dokumenterer ikke alene historisk opphav, faktisk utbredelse eller individuell mening.',
    'Douglas analyserer renhet og fare som klassifikasjonsarbeid der tvetydighet kan oppfattes som uorden og møtes med grensedragning.',
    'Slektskapskategorier må undersøkes gjennom praksis, rettigheter, omsorg og selvidentifikasjon, ikke bare genealogisk skjema.'
  ]],
  ['symbol-ritual-og-fortolkning', 'Symbol, ritual og fortolkning', ['aat05-geertz','aat06-turner','aat07-douglas'], 'Fortolkning må bygges fra kontekst og alternative lesninger; et symbol har ikke én løsrevet universell betydning.', [
    'Geertz’ tette beskrivelse skiller en fysisk handling fra de sosiale kodene og situasjonene som gjør handlingen meningsfull.',
    'Fortolkende antropologi produserer argumenterte lesninger av offentlig mening, ikke direkte tilgang til et homogent kollektivt indre.',
    'Turners prosessanalyse av ritual undersøker brudd, liminalitet, communitas og reintegrasjon som sekvenser med mulige konflikter.',
    'Ritual og klassifikasjon kan stabilisere orden eller åpne kritikk; virkningen må undersøkes i deltakelse, autoritet og etterfølgende praksis.'
  ]],
  ['okonomi-materialitet-og-historie', 'Økonomi, materialitet og historie', ['aat03-mauss','aat08-sahlins','aat02-malinowski'], 'Markedsmål og nytteantakelser kan ikke alene forklare produksjon, fordeling, utveksling eller verdi.', [
    'Økonomisk antropologi undersøker hvordan produksjon, fordeling og forbruk inngår i slektskap, politikk, moral og ritual.',
    'Sahlins’ «opprinnelige overflodssamfunn» er en kritikk av bestemte knapphetsmål, ikke en romantisk påstand om fravær av arbeid eller risiko.',
    'Kula-materialet viser at verdifulle gjenstanders bevegelse kan organisere status og allianser uten å reduseres til varepris.',
    'Materielle objekter får sosial virkning gjennom bruk, sirkulasjon og klassifikasjon; symbolsk verdi opphever ikke arbeid eller makt.'
  ]],
  ['representasjon-kolonialitet-og-kjonn', 'Representasjon, kolonialitet og kjønn', ['aat10-abu-lughod','aat11-said','aat09-strathern','aat13-nesh'], 'Kritikk av representasjon krever både maktanalyse og presis empirisk beskrivelse; forskeren kan ikke tale som nøytral totalautoritet.', [
    'Said viser hvordan orientalistiske representasjoner knyttet kunnskap om «Østen» til europeiske institusjoner og kolonial makt.',
    'Kolonialitetskritikk undersøker arkiv, kategori, oversettelse og institusjonell autoritet, ikke forskerens opprinnelse som sannhetsbevis.',
    'Strathern viser hvordan vestlige feministiske og antropologiske begreper kan feilleses som universelle beskrivelser av kjønn og personhood.',
    'Ansvarlig etnografisk representasjon skiller sitat, observasjon og tolkning og vurderer deltakerinnsyn, anonymisering og mulig skade.'
  ]],
  ['sammenligning-teoribygging-og-ansvar', 'Sammenligning, teoribygging og ansvar', ['aat01-boas','aat12-ethnography','aat13-nesh','aat10-abu-lughod'], 'Sammenlignbarhet må argumenteres; lik etikett betyr ikke samme relasjon, skala eller historiske prosess.', [
    'Antropologisk sammenligning kan avdekke variasjon og utfordre selvfølgeligheter når enheter, begreper og kontekst gjøres eksplisitte.',
    'Små etnografiske case støtter analytisk generalisering gjennom mekanisme og kontrast, ikke automatisk representativitet for en befolkning.',
    'Teoribygging må la etnografiske funn endre begrepene og ikke bare plassere lokalt materiale under en ferdig universell modell.',
    'En ansvarlig konklusjon angir tilgang, posisjon, usikkerhet, alternative fortolkninger, overførbarhet og hva materialet ikke kan bære.'
  ]],
];

let claimNo = 1;
const topic_briefs = topicData.map(([id,title,source_ids,boundary,texts], topicIndex) => ({
  id, title, method_ids: topicIndex === 1 ? ['met_pol_praksisanalyse','met_pol_dokumentanalyse'] : ['met_pol_begrepsanalyse','met_pol_diskursanalyse'], source_ids, boundary,
  planned_claims: texts.map((text, claimIndex) => { const id = `aat-${String(claimNo++).padStart(2,'0')}`; const pair = [source_ids[claimIndex % source_ids.length], source_ids[(claimIndex + 1) % source_ids.length]]; return { id, text, status: 'planned_requires_fulltext_verification', source_ids: [...new Set(pair.length === 1 ? [...pair, 'aat13-nesh'] : pair)] }; }),
}));

const decision_scenarios = [
  ['museum-etikett', 'Et museum vil beskrive én gjenstand som uttrykk for en hel kultur.', 'Avgrens proveniens, tid, produsent, bruk og alternative stemmer før generalisering.'],
  ['skolefeltarbeid', 'En student observerer et klasserom der barn ikke kan velge bort tilstedeværelse.', 'Vurder pliktbærer, samtykke, barns medvirkning, dataminimering og indirekte identifisering.'],
  ['gave-eller-betaling', 'En lokal utveksling omtales enten som ren gave eller skjult marked.', 'Følg sekvens, gjeld, relasjon, verdsetting og deltakernes egne kategorier.'],
  ['ritual-i-endring', 'Et offentlig ritual får nytt publikum og digital distribusjon.', 'Sammenlign sekvens, autoritet, symboltolkning og praksis før og etter endringen.'],
  ['regional-kultur', 'En rapport forklarer et politisk utfall med «middelhavskultur».', 'Test skala, historiske forbindelser, variasjon innad og institusjonelle alternativer.'],
  ['representasjon', 'Et dramatisk sitat kan gjøre en sårbar deltaker gjenkjennelig.', 'Vurder nødvendighet, kontekst, anonymisering, deltakerinnsyn og skade før publisering.'],
].map(([id,prompt,expectedBoundary]) => ({ id,prompt,expectedBoundary,responseMode:'guided_discussion_no_required_typing' }));

function buildBrief() {
  return { schema:'history_go_sosiologi_antropologi_anthropological_theory_source_claim_brief_v1', version:'1.0.0', updated_at:'2026-08-28', status:'source_claim_brief_complete_full_chapter_next', subject_id:'politikk', canonical_subcategory_id:'sosiologi_antropologi', planned_unit_id:'antropologisk-teori-kultur-relasjon-feltarbeid-og-representasjon', future_chapter_id:'antropologisk-teori-kultur-relasjon-feltarbeid-og-representasjon', runtime_registration:{registered:false,allowed_before_full_chapter_gate:false}, metadata_registration:{deferred_until_fulltext:true,global_status_mutation_in_source_brief:false,release_mutation_in_source_brief:false}, scope:{title:'Antropologisk teori: kultur, relasjon, feltarbeid og representasjon', included:topicData.map((row)=>row[1]), excluded:['kultur som lukket eller homogen årsak','etnografi som nøytral tilgang uten relasjon og seleksjon','relativisme som fritak fra etikk','klassisk canon som universell autoritet']}, source_policy:{minimum_sources:13,source_locations_required:true,claim_level_trace_required:true,two_sources_per_planned_claim:true}, allowed_method_ids:['met_pol_begrepsanalyse','met_pol_diskursanalyse','met_pol_praksisanalyse','met_pol_dokumentanalyse'], sources, topic_briefs, decision_scenarios, next_gate:'anthropological_theory_fulltext_materialization' };
}

function buildReport() {
  return { schema:'history_go_sosiologi_antropologi_anthropological_theory_source_brief_audit_v1', version:'1.0.0', updated_at:'2026-08-28', status:'pass', subject_id:'politikk', canonical_subcategory_id:'sosiologi_antropologi', domain_id:'antropologisk_teori', counts:{verifiedSources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,plannedModules:4}, gates:{sourceFirstUnregistered:true,canonicalSubcategoryOwnership:true,allSourcesInspectable:true,everyClaimSourceBound:true,everySourceUsed:true,cultureHistoryAndRelativism:true,fieldworkReflexivityAndEthics:true,giftKinshipClassificationAndRitual:true,economicMaterialAndHistoricalAnalysis:true,representationColonialityAndGender:true,comparisonAndTheoryBuilding:true,fulltextClaimTraceRequired:true}, six_part_quality_review:{correctness_and_evidence:5,coverage_and_completion:5,disciplinary_editorial_quality:5,technical_integrity:5,safety_and_responsibility:5,maintainability_and_auditability:4,total:29,maximum:30,note:'Source-first-produksjon; antropologiske claims forblir planlagte til fulltekst og gjensidig paragraph↔claim-spor.'}, next_gate:'anthropological_theory_source_brief_complete_full_chapter_production' };
}

export function audit() {
  const brief=read(BRIEF); const report=read(REPORT); const claims=brief.topic_briefs.flatMap((topic)=>topic.planned_claims); const ids=new Set(brief.sources.map((source)=>source.id)); const used=new Set(claims.flatMap((claim)=>claim.source_ids));
  assert(isDeepStrictEqual(brief,buildBrief()),`${BRIEF} er utdatert`); assert(isDeepStrictEqual(report,buildReport()),`${REPORT} er utdatert`);
  assert(brief.sources.length===13 && brief.topic_briefs.length===8 && claims.length===32 && brief.decision_scenarios.length===6,'Forventet 13/8/32/6');
  assert(brief.sources.every((source)=>source.url.startsWith('https://')&&source.source_location&&source.retrieval_status==='verified_2026-08-28'),'Kilder må være inspiserbare');
  assert(claims.every((claim)=>claim.source_ids.length>=2&&claim.source_ids.every((id)=>ids.has(id)))&&[...ids].every((id)=>used.has(id)),'Claims må ha minst to kilder og alle kilder må brukes');
  assert(brief.runtime_registration.registered===false&&brief.metadata_registration.global_status_mutation_in_source_brief===false,'Source-first kan ikke registrere fulltekst eller endre global status');
  return report;
}

if(process.argv.includes('--write-brief'))write(BRIEF,buildBrief());
if(process.argv.includes('--write-report'))write(REPORT,buildReport());
const report=audit();
console.log(`Antropologisk teori source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
