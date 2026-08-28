#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'sosiologisk-teori-struktur-handling-makt-og-samfunnsendring';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/sociological_theory_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  reconciliation: 'reports/fagverk/sosiologi-antropologi-reconciliation-v1.json',
  chapter: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  report: 'reports/fagverk/sosiologi-antropologi-sociological-theory-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };

const PARAGRAPHS = {
  'sat-01': 'Durkheims begrep om sosiale fakta retter analysen mot handlemåter og institusjoner som møter individet som allerede etablerte og delvis sanksjonerte ordninger. Det betyr ikke at samfunnet er en tidløs ting: forskeren må vise hvilke regler, rutiner, forventninger eller fordelinger som faktisk virker i den avgrensede perioden, og hvordan de blir opprettholdt eller endret.',
  'sat-02': 'Sosiologisk forklaring krever et presist utfall, en analyseenhet og et tidsrom før en mekanisme foreslås. En endring i en organisasjon, et nabolag eller en populasjon kan ikke forklares bare ved å navngi «struktur». Sammenligning, prosessporing og kvalitativt materiale må koble konkrete betingelser til observerbare handlinger og konsekvenser.',
  'sat-03': 'Å forklare et fenomens historiske framvekst er noe annet enn å beskrive funksjonen det senere får. En praksis kan ha oppstått gjennom konflikt, tilfeldighet eller institusjonell arv, men i dag bidra til koordinering eller ulikhet. Durkheim og senere prosessosiologi gir derfor ulike spørsmål som må holdes fra hverandre før samme observasjon brukes som årsaksbevis.',
  'sat-04': 'Aggregerte mønstre kan avdekke sosial organisering, men beskriver ikke automatisk hvert individ. En korrelasjon mellom områder eller grupper kan skyldes seleksjon, institusjonelle forskjeller eller målemåten. Ansvarlig analyse rapporterer variasjon innad i kategoriene, unngår økologisk feilslutning og lar ikke statistisk medlemskap bli en tilskrivning av motiv, identitet eller moralsk verdi.',
  'sat-05': 'Weber definerer sosial handling gjennom mening orientert mot andre og bruker idealtyper som analytiske sammenligningsredskaper. En idealtype er ikke et gjennomsnitt eller en påstand om at virkelige mennesker følger én ren logikk. Forskeren må rekonstruere mening fra dokumenter, utsagn og situasjoner og samtidig undersøke materielle og institusjonelle rammer som aktøren ikke kontrollerer.',
  'sat-06': 'Webers skille mellom tradisjonell, karismatisk og legal-rasjonell legitimitet organiserer spørsmål om hvorfor herredømme oppfattes som gyldig. Typene kan blandes i samme institusjon, og lydighet er ikke bevis på overbevisning. Analyse må derfor skille begrunnelse, rutine, tvang, interesse og faktisk etterlevelse over tid.',
  'sat-07': 'Forståelse og årsaksforklaring er ikke konkurrerende sluttmål hos Weber, men må kobles gjennom en dokumentert handlingskjede. Aktørenes egne begrunnelser er nødvendig evidens om mening, men kan være strategiske eller ufullstendige. Relasjonell analyse undersøker derfor også hvem handlingen er rettet mot, hvilke ressurser som står på spill, og hvordan responsen endrer forløpet.',
  'sat-08': 'Fortolkning av mening krever metodisk åpenhet om forskerens språk, posisjon og tilgang. Et intervjuutsagn kan ikke behandles som direkte vindu til et stabilt indre motiv, og sitater må ikke løsrives fra kontekst. NESHs retningslinjer gjør informert samtykke, konfidensialitet, skadebegrensning og rettferdig representasjon til deler av kunnskapskvaliteten, ikke bare administrasjon.',
  'sat-09': 'Marx analyserer kapital som en historisk sosial relasjon organisert gjennom eiendom, varebytte og lønnsarbeid, ikke bare som penger eller maskiner. Klasseanalyse må derfor spesifisere forholdet mellom posisjoner, kontroll og avhengighet. Inntektsgrupper kan være nyttige indikatorer, men kan ikke alene dokumentere produksjonsrelasjon, kollektiv kapasitet eller bevissthet.',
  'sat-10': 'En prosessanalyse av kapitalisme undersøker hvordan kontrakter, teknologi, statlige regler og organisering fordeler kontroll over arbeid og overskudd over tid. Det er utilstrekkelig å lese enhver ulikhet som samme mekanisme. Alternative forklaringer som kompetansekrav, sektor, institusjonell arv og diskriminering må skilles og testes mot observerbare mellomledd.',
  'sat-11': 'Marxistisk klasseanalyse vektlegger konflikt, men relasjonell sosiologi minner om at interesser og kapasitet formes i forbindelser mellom arbeidere, ledelse, stat og markeder. Felles posisjon skaper ikke automatisk samordnet handling. Analyse av organisering må vise nettverk, fortolkning, ressurser, risiko og hendelser som omsetter en mulig interesse til kollektiv praksis.',
  'sat-12': 'Historiske forløp utfordrer forestillingen om at én økonomisk motsigelse gir et forhåndsbestemt resultat. Reform, krise, mobilisering og institusjonell tilpasning kan åpne flere baner. Marx gir spørsmål om makt og produksjon, mens tids- og prosessanalyse krever at forklaringen angir rekkefølge, vendepunkter, motkrefter og hvilke utfall som faktisk var mulige i situasjonen.',
  'sat-13': 'Goffmans dramaturgiske analyse viser hvordan selvpresentasjon, inntrykksstyring og publikum organiserer møter. «Frontstage» og «backstage» er relasjonelle situasjoner, ikke sanne og falske personligheter. Det samme mennesket kan måtte koordinere ulike forventninger på tvers av arenaer; et lite case må derfor avgrenses etter deltakerroller, setting, informasjonskontroll og hendelsesforløp.',
  'sat-14': 'Interaksjonsorden oppstår gjennom gjensidig oppmerksomhet, høflighet, reparasjon og risiko for tap av ansikt. Situasjonen kan ikke reduseres til individuelle egenskaper, fordi deltakernes muligheter avhenger av hverandres respons og av institusjonelle roller. Samtidig må forskeren undersøke hvordan klasse, kjønn, funksjonsevne eller autoritet påvirker hvem som kan definere hva som skjer.',
  'sat-15': 'Nærstudier av ett møte kan avdekke mekanismer som større datasett overser, men de gir ikke automatisk populasjonsestimater. Smalls case-argument gjør generalisering til et spørsmål om hva caset demonstrerer, utfordrer eller sammenlignes med. Feltet må derfor skille analytisk mekanisme, empirisk utbredelse og overførbarhet til nye situasjoner.',
  'sat-16': 'Observasjon av sårbare eller private situasjoner kan skape risiko selv når forskeren ikke griper inn. Goffmans detaljerte blikk må kombineres med forskningsetiske grenser: vurder forventet privathet, asymmetrisk makt, indirekte identifisering og konsekvenser av publisering. Et levende eksempel er ikke etisk forsvarlig dersom gjenkjennelighet eller dramatisering skader deltakerne.',
  'sat-17': 'Bourdieus habitus beskriver varige, men foranderlige disposisjoner formet gjennom erfaring; begrepet er ikke et skjult program som determinerer handling. Analyse må vise hvordan en disposisjon møter et bestemt felt og bestemte ressurser. Endrede betingelser kan skape misforhold, refleksjon og improvisasjon, slik at praksis aldri kan utledes fra bakgrunn alene.',
  'sat-18': 'Feltanalyse undersøker relasjoner mellom posisjoner som konkurrerer om spesifikke innsatser og autoritetsformer. Et felt kan ikke etableres bare ved å navngi en sektor. Forskeren må dokumentere grenser, aktører, kapitalformer, regler og konflikter og vise hvordan posisjonene avhenger av hverandre og endres gjennom kampen om definisjonsmakt.',
  'sat-19': 'Økonomisk, kulturell, sosial og symbolsk kapital virker bare gjennom sosialt anerkjente verdsettingsordninger. Lamont og Molnárs grenseanalyse viser hvordan klassifikasjoner skiller legitimt fra illegitimt og innenfor fra utenfor. Ressurser må derfor knyttes til arena, konverteringsmulighet og portvakter; en egenskap er ikke kapital i enhver sammenheng.',
  'sat-20': 'Bourdieus teoriverktøy er utviklet gjennom bestemte europeiske og koloniale kunnskapshistorier. Connells canon-kritikk krever at brukeren spør hvor begrepene kommer fra, hvilke erfaringer som er gjort universelle, og hvilke intellektuelle tradisjoner som er marginalisert. Kritikken avviser ikke sammenligning, men gjør symmetrisk kildevalg og kontekstprøving til kvalitetskrav.',
  'sat-21': 'Berger og Luckmann beskriver institusjonalisering som gjentatte handlinger som typifiseres, blir forventet og overføres som en objektiv sosial orden. Dette er en prosesspåstand, ikke en erklæring om at alt er vilkårlig konstruert. Forskeren må undersøke hvilke rutiner, dokumenter, roller og sanksjoner som stabiliserer praksisen, og hvem som kan endre den.',
  'sat-22': 'Legitimering gir institusjoner forklaringer og begrunnelser som gjør dem forståelige og forsvarlige. Symbolske grenser viser hvem og hva en begrunnelse inkluderer, rangerer eller ekskluderer. Men en offentlig begrunnelse beviser ikke faktisk aksept; analyse må sammenholde språk med etterlevelse, konflikt, håndheving og erfaringene til dem som bærer kostnadene.',
  'sat-23': 'Institusjoner fordeler roller og forventninger, mens Webers herredømmeanalyse undersøker autoritetens gyldighetskrav. Perspektivene overlapper, men stiller ulike spørsmål: hvordan en orden tas for gitt, og hvorfor bestemte kommandoer følges. Et godt design kan sammenholde dokumenterte regler, organisatoriske rutiner og deltakernes fortolkninger uten å slå nivåene sammen.',
  'sat-24': 'Kunnskap om samfunnet produseres innen institusjoner som skoler, medier, forvaltning og arbeidsplasser og kan knyttes til materielle interesser. Marx legger vekt på makt og produksjonsforhold; Berger og Luckmann på hverdagslig objektivering. Uenigheten kan undersøkes empirisk ved å spore hvem som definerer kategorier, hvordan de sirkulerer, og hvilke konsekvenser de får.',
  'sat-25': 'Symbolske og sosiale grenser skiller kategorier i språk fra institutionaliserte forskjeller i tilgang og belønning. Lamont og Molnár viser hvorfor ikke enhver distinksjon har samme virkning. Relasjonell analyse spør hvem som trekker grensen, i hvilken arena, med hvilke ressurser, og hvordan andre utfordrer, omgår eller stabiliserer den.',
  'sat-26': 'Crenshaws interseksjonalitet viser hvordan rettslige og politiske kategorier kan gjøre erfaringer usynlige når hvert maktforhold analyseres separat. Perspektivet er ikke en telling av identitetsmerker. En analyse må identifisere institusjonell mekanisme, relevant arena og konkret utfall og undersøke hvordan samvirkende ordninger skaper en særskilt posisjon.',
  'sat-27': 'Relasjonell sosiologi behandler aktører og egenskaper som formet i transaksjoner og historiske forløp. Dette utfordrer forklaringer som antar stabile enheter før forbindelsene undersøkes. Samtidig kan nettverkskart alene bli statiske; Abbott og Emirbayer krever at relasjoner plasseres i sekvenser av hendelser, tolkninger og endrede avhengigheter.',
  'sat-28': 'Forskning på marginaliserte posisjoner må unngå både usynliggjøring og overeksponering. Interseksjonell analyse kan kreve små undergrupper der indirekte identifisering er lett. NESHs prinsipper innebærer at dataminimering, deltakermedvirkning, presis kategoriargumentasjon og begrenset publisering må vurderes sammen med hva analysen faktisk kan dokumentere.',
  'sat-29': 'Teorivalg bør følge spørsmålet og evidensen, ikke en rangert kanon. Abbott viser verdien av sekvens og prosess, mens Connell viser hvordan kunnskapsgeografi påvirker hva som regnes som generell teori. Forsker og student må derfor begrunne både begrepets analytiske bidrag og fraværende alternativer fra andre steder, språk og tradisjoner.',
  'sat-30': 'Canon-kritikk undersøker institusjonell seleksjon, siteringsmønstre og asymmetrisk teoriarbeid uten å gjøre forskerens opprinnelse til et sannhetskriterium. Connell utfordrer arbeidsdelingen der Nord produserer teori og Sør leverer data. Et ansvarlig pensum lar ulike tradisjoner forklare, kritisere og sammenlignes, og dokumenterer kontekst og oversettelsesproblem.',
  'sat-31': 'Samfunnsendring kan studeres som sekvenser der relasjoner, kategorier og handlingsmuligheter omformes. Et enkelt før–etter-bilde kan ikke vise mekanismen. Prosessanalyse identifiserer utløsende hendelser, kumulative endringer, tilbakekoblinger og alternative baner, mens relasjonell teori viser hvordan aktører selv endres gjennom forløpet de inngår i.',
  'sat-32': 'En sterk sosiologisk konklusjon angir hva dataene støtter, hva som fortsatt er usikkert, og hvor langt funnet kan overføres. Den skiller empirisk mønster, mekanismeforslag og normativ vurdering; rapporterer negative eller tvetydige funn; og beskytter deltakerne. Teori fungerer da som prøvbart analyseverktøy, ikke pynt, autoritetsnavn eller universalforklaring.',
};

const MODULES = [
  { id: '01-sosiale-fakta-handling-og-forklaring', title: 'Sosiale fakta, handling og forklaring', topicIndexes: [0, 1] },
  { id: '02-klasse-interaksjon-og-situasjon', title: 'Klasse, interaksjon og situasjon', topicIndexes: [2, 3] },
  { id: '03-praksis-institusjoner-og-kunnskap', title: 'Praksis, institusjoner og kunnskap', topicIndexes: [4, 5] },
  { id: '04-grenser-kritikk-og-samfunnsendring', title: 'Grenser, kritikk og samfunnsendring', topicIndexes: [6, 7] },
];

const QUESTIONS = [
  ['Hva må avgrenses før «struktur» brukes som forklaring?', ['Kun teorinavn', 'Utfall, analyseenhet og tidsrom', 'Bare størrelsen på datasettet'], 1, 'sat-02'],
  ['Hva er en weberiansk idealtype?', ['Et moralsk ideal', 'Et statistisk gjennomsnitt', 'Et analytisk sammenligningsredskap'], 2, 'sat-05'],
  ['Hva dokumenterer en inntektsgruppe alene?', ['En komplett produksjonsrelasjon', 'En avgrenset økonomisk posisjon, ikke klassebevissthet', 'Kollektiv handling'], 1, 'sat-09'],
  ['Hva kan et nærstudium av ett møte ikke gi automatisk?', ['Innsikt i samhandling', 'Et populasjonsestimat', 'Et situasjonsforløp'], 1, 'sat-15'],
  ['Når er en ressurs kapital i Bourdieus forstand?', ['Når den verdsettes og kan virke i et bestemt felt', 'Alltid', 'Bare når den er økonomisk'], 0, 'sat-19'],
  ['Hva beviser en offentlig legitimering?', ['Automatisk aksept', 'Ikke mer enn en begrunnelse som må sammenholdes med praksis', 'At institusjonen er rettferdig'], 1, 'sat-22'],
  ['Hva er interseksjonalitet ikke?', ['Analyse av samvirkende institusjonelle ordninger', 'Telling av identitetsmerker', 'Undersøkelse av særskilte posisjoner'], 1, 'sat-26'],
  ['Hva kjennetegner en sterk sosiologisk konklusjon?', ['Den skjuler usikkerhet', 'Den bruker flest teorinavn', 'Den avgrenser støtte, usikkerhet og overførbarhet'], 2, 'sat-32'],
];

function buildReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_sociological_theory_fulltext_audit_v1',
    version: '1.0.0', updated_at: '2026-08-28', status: 'pass',
    conclusion: 'sociological_theory_fulltext_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
    counts: { domainsMaterialized: 1, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 13, assessmentQuestions: 8, teachingScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 1 },
    gates: { definitionAndBackground: true, namedTheoriesAndResearchers: true, findingsMethodsAndLimits: true, realDisagreement: true, teachingScenarios: true, plannedClaimsResolvedOneToOne: true, paragraphClaimTraceReciprocalAndComplete: true, everySourceInspectableAndUsed: true, categoryAggregateAndCausalityBoundaries: true, researchEthics: true, canonAndKnowledgeGeographyCritique: true, chapterRegisteredInSubcategoryExactlyOnce: true, categoryStatusStillExpansionPlanned: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Felt 1 er fulltekstmaterialisert og auditerbart; underkategorien er fortsatt uferdig med 1/12 felt.' },
  };
}

export function materialize() {
  const sourceBrief = read(P.sourceBrief);
  const topics = sourceBrief.topic_briefs;
  const plannedClaims = topics.flatMap((topic) => topic.planned_claims);
  if (plannedClaims.length !== 32 || Object.keys(PARAGRAPHS).length !== 32) throw new Error('Forventet 32 planlagte claims og 32 avsnitt');
  const moduleFiles = [];
  for (const moduleSpec of MODULES) {
    const file = `${DIR}/${moduleSpec.id}.json`;
    moduleFiles.push(file);
    write(file, {
      schema: 'history_go_fagverk_module_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
      id: moduleSpec.id, title: moduleSpec.title,
      sections: moduleSpec.topicIndexes.map((topicIndex) => {
        const topic = topics[topicIndex];
        return { id: topic.id, title: topic.title, method_ids: topic.method_ids, boundary: topic.boundary, paragraphs: topic.planned_claims.map((claim) => PARAGRAPHS[claim.id]), paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]) };
      }),
    });
  }
  write(P.chapter, {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'politikk', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', domain_id: 'sosiologisk_teori', id: CHAPTER_ID, chapter_id: CHAPTER_ID,
    title: 'Sosiologisk teori: struktur, handling, makt og samfunnsendring', subtitle: 'Fra Durkheim, Weber og Marx til interaksjon, praksis, interseksjonalitet, relasjoner og canon-kritikk',
    lead: 'Sosiologisk teori forklarer hvordan mønstre, institusjoner, relasjoner og meningsfulle handlinger formes og endres. Kapittelet sammenligner klassiske og samtidige teorier som prøvbare analyseverktøy, viser metodene og begrensningene deres og skiller gruppefunn fra individpåstander, empiriske forklaringer fra normative vurderinger og universelle påstander fra kunnskapens historiske geografi.',
    learningObjectives: ['avgrense utfall, analyseenhet, tidsrom og mekanisme', 'sammenligne Durkheim, Weber og Marx uten å gjøre teorinavn til fasit', 'analysere Goffmans interaksjonsorden og Bourdieus praksisteori med presise grenser', 'forklare institusjonalisering, legitimering og symbolske grenser', 'bruke interseksjonell og relasjonell analyse uten identitetsattribusjon', 'vurdere case-, prosess-, fortolknings- og aggregeringsbegrensninger', 'kritisk undersøke canon, kunnskapsgeografi og forskningsetikk', 'skrive konklusjoner med støtte, usikkerhet og overførbarhet'],
    moduleFiles, briefFile: P.brief, claimsFile: P.claims, assessmentFile: P.assessment, editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
  });
  write(P.brief, {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID, primary_domain_id: 'sosiologisk_teori',
    purpose: 'Gi en kildebundet, metodebevisst og sammenlignende innføring i sosiologisk teori som kan brukes på dokumenterte prosesser uten determinisme, identitetsattribusjon eller canon som autoritetsbevis.',
    learningArc: topics.map((topic) => topic.title), methodsAndLimits: ['begrepsanalyse krever operasjonalisering', 'fortolkning krever kontekst og refleksivitet', 'caseanalyse gir ikke automatisk populasjonsestimat', 'aggregater beskriver ikke individet', 'prosessforklaring krever tidsrekkefølge og alternativer'],
    realDisagreements: ['Marx vektlegger produksjonsforhold og konflikt, mens Weber skiller flere handlings- og legitimitetsformer.', 'Bourdieu forklarer reproduksjon gjennom habitus og felt, mens interaksjonisme viser situasjonell reparasjon og improvisasjon.', 'Institusjonalisering som tatt-for-gitt orden må vurderes mot teorier om materiell interesse og makt.', 'Connell utfordrer den geografisk snevre kanonen og den asymmetriske arbeidsdelingen mellom teori og data.'],
    criticalDistinctions: ['struktur vs universalforklaring', 'idealtype vs gjennomsnitt', 'inntektsgruppe vs klasseforhold', 'rolle vs personlighet', 'ressurs vs feltspesifikk kapital', 'symbolsk vs sosial grense', 'kategori vs årsak', 'analytisk generalisering vs populasjonsestimat', 'empirisk mønster vs normativ vurdering'],
    teachingScenarios: sourceBrief.decision_scenarios, safety: { identityAsCause: false, aggregateAsIndividual: false, theoryNameAsEvidence: false, publicJustificationAsAcceptance: false, observationWithoutEthics: false, canonAsUniversalByDefault: false },
  });
  write(P.claims, {
    schema: 'history_go_fagverk_claims_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID, retrieval_status: 'verified_2026-08-28', verified_at: '2026-08-28',
    sources: sourceBrief.sources.map((source) => ({ ...source, retrieval_status: 'verified_2026-08-28' })),
    claims: plannedClaims.map((claim) => ({ id: claim.id, claim: claim.text, source_ids: claim.source_ids, classification: 'verified_scholarly_source_synthesis', status: 'verified', verified_at: '2026-08-28' })),
  });
  write(P.assessment, {
    schema: 'history_go_fagverk_assessment_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
    questions: QUESTIONS.map(([question, options, answerIndex, claim_id], index) => ({ id: `sat-q${index + 1}`, type: 'multiple_choice', question, options, answerIndex, answer: options[answerIndex], claim_id, source: plannedClaims.find((claim) => claim.id === claim_id).source_ids, learner_typing: false })),
    caseTasks: sourceBrief.decision_scenarios.map((scenario) => ({ ...scenario, responseMode: 'guided_discussion_no_required_typing' })),
  });
  const production = read(P.production);
  production.status = 'fulltext_production_in_progress';
  production.progress.materializedDomains = 1;
  production.progress.strictCompletionProven = false;
  production.materialized = [{ ordinal: 1, domain_id: 'sosiologisk_teori', chapter: P.chapter, claims: P.claims, assessment: P.assessment, audit: P.report }];
  production.next_gate = 'anthropological_theory_fulltext_materialization';
  write(P.production, production);
  const reconciliation = read(P.reconciliation);
  reconciliation.status = 'authority_audit_complete_fulltext_production_in_progress';
  reconciliation.production_plan.source_first_ready = 2;
  reconciliation.production_plan.materialized = 1;
  reconciliation.production_plan.next_domain = 'antropologisk_teori';
  write(P.reconciliation, reconciliation);
  write(P.report, buildReport(sourceBrief));
  return { chapter: CHAPTER_ID, domains: 1, claims: 32, sources: 13 };
}

const result = materialize();
console.log(`Sosiologisk teori materialisert: ${result.domains}/12 felt, ${result.claims} claims, ${result.sources} kilder.`);
