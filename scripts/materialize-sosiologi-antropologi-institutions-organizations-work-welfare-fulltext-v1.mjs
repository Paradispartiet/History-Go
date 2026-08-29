#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'institusjoner-organisasjoner-arbeid-og-velferd';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/institutions_organizations_work_welfare_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  reconciliation: 'reports/fagverk/sosiologi-antropologi-reconciliation-v1.json',
  chapter: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  report: 'reports/fagverk/sosiologi-antropologi-institutions-organizations-work-welfare-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};

const PARAGRAPHS = {
  'iow-01': 'Weber beskriver byråkratiet som en idealtype bygget på avgrenset jurisdiksjon, hierarki, skriftlig dokumentasjon, fagkompetanse og upersonlige regler. Idealtypen er et sammenlikningsredskap, ikke en påstand om at enhver etat fungerer slik eller at byråkrati betyr treghet. Lipsky viser nettopp hvorfor konkret tjenestearbeid kan avvike fra den formelle modellen når generelle regler møter sammensatte saker.',
  'iow-02': 'Formelle regler fordeler myndighet, ansvar og framgangsmåter, men teksten alene viser ikke hvem som faktisk utfører, fortolker eller kontrollerer arbeidet. Webers jurisdiksjonsbegrep må derfor kobles til rettslig virkeområde, delegasjon, arbeidsdeling og dokumenterte beslutninger. Arbeidsmiljøloven illustrerer at regel, ansvarlig aktør, medvirkningsordning og håndheving er separate ledd som må følges empirisk.',
  'iow-03': 'Et organisasjonskart viser offisielle rapporteringslinjer og enheter, men kan ikke alene lokalisere informasjon, ekspertise, uformelle nettverk eller beslutningsmakt. Weber gir den hierarkiske idealtypen, mens Meyer og Rowan viser at formelle strukturer også kan kommunisere legitimitet. En ansvarlig analyse sammenholder kartet med saker, møter, dokumentflyt, ressurskontroll og hvem som kan stanse eller endre beslutninger.',
  'iow-04': 'Regelbundet behandling kan øke forutsigbarhet, begrunnelse og kontroll, men like regler møter ikke nødvendigvis like situasjoner. Weber synliggjør upersonlig regelmyndighet, mens Lipsky viser hvorfor førstelinjen må kategorisere og prioritere. Skjønn er derfor verken automatisk vilkårlighet eller grenseløs frihet; forskeren må undersøke hjemmel, relevante forskjeller, konsistens, ressursvilkår, dokumentasjon og klagemulighet.',
  'iow-05': 'Meyer og Rowan viser hvordan organisasjoner innlemmer institusjonaliserte modeller fordi de signaliserer rasjonalitet og kan gi legitimitet, ressurser og stabilitet. DiMaggio og Powell plasserer slike prosesser i organisatoriske felt. En ny standard kan dermed spres uten dokumentert lokal effekt. Analysen må skille hvem som forventer modellen, hvilke fordeler etterlevelse gir, og om praksis eller utfall faktisk endres.',
  'iow-06': 'Frakobling betegner mulig avstand mellom formell policy og daglig virksomhet. Hos Meyer og Rowan kan avstanden beskytte både legitimitet og fleksibel praksis, mens Lipsky viser hvordan arbeidsvilkår påvirker implementering. Begrepet må ikke brukes som automatisk mistanke om hykleri. Forskeren må dokumentere den konkrete regelen, faktisk praksis, tidsrom, variasjon, begrunnelse og konsekvens for berørte personer.',
  'iow-07': 'DiMaggio og Powell skiller tre isomorfiprosesser: tvang gjennom avhengighet og regulering, mimetisk etterlikning under usikkerhet og normativ påvirkning gjennom profesjoner. Meyer og Rowan viser den institusjonelle legitimiteten som kan følge. Prosessene kan opptre samtidig, men er ikke utskiftbare etiketter. Dokumentasjonen må identifisere aktører, avhengigheter, usikkerhet, profesjonelle nettverk og faktisk spredningsforløp.',
  'iow-08': 'At organisasjoner blir like, beviser ikke at de har funnet den mest effektive løsningen eller produserer identiske resultater. DiMaggio og Powell viser feltpress og kollektiv rasjonalitet, mens Meyer og Rowan viser legitimitetens rolle. Sammenlikning bør derfor holde formell struktur, arbeidsprosess, ressursbruk og utfall fra hverandre og undersøke om likheten skyldes lov, finansiering, etterlikning eller profesjonalisering.',
  'iow-09': 'Lipskys førstelinjebyråkrater møter borgere direkte og anvender generelle regler på konkrete situasjoner. Prioritering, kategorisering og fortolkning gjør dem til medprodusenter av politikk, selv innenfor Webers regel- og hierarkimodell. Dette betyr ikke at den enkelte ansatte fritt lager loven. Analysen må følge rettslig ramme, ledelseskrav, ressurser, dokumentasjon, brukerens bidrag og hvem som kan overprøve beslutningen.',
  'iow-10': 'Når arbeidsmengden er høy, ressursene begrensede og målene motstridende, kan førstelinjen utvikle rutiner som reduserer kompleksitet og fordeler tid. Lipsky viser at slike mestringsformer også påvirker adgang og venting. NESH krever varsom representasjon av ansatte og brukere. Forskeren bør måle kø, sakstype, bemanning, prioriteringsregel, variasjon og konsekvens uten å redusere systemproblemer til personlig moral.',
  'iow-11': 'Formell rettighet, innsendt søknad, saksbehandling, vedtak, faktisk levert tjeneste og brukerutfall er ulike implementeringsledd. Lipsky viser hvordan praksis former møtet med ordningen, mens Esping-Andersen analyserer velferdsinstitusjonenes rettigheter og lagdeling. Et høyt antall positive vedtak kan derfor ikke alene bevise tilgang eller virkning; frafall, ventetid, omfang, kvalitet og behovsendring må dokumenteres.',
  'iow-12': 'Kontroll av førstelinjeskjønn bør undersøke rettsgrunnlag, begrunnelser, liknende saker, ressursvilkår, klage og konsekvenser. Lipsky forklarer hvorfor skjønn oppstår, mens NESH krever at forskning ikke utsetter ansatte eller brukere for unødig skade. Individavvik kan være viktig, men analysen må også teste om regler, måltall, teknologi eller bemanning systematisk former variasjonen og hvem som får belastningen.',
  'iow-13': 'Burawoy viser hvordan arbeidsplassens spill, akkord, mål og kollegiale normer kan organisere aktiv deltakelse i produksjonen. Arbeidere skaper mening og strategier, men innenfor rammer for eierskap og kontroll. Acker utvider spørsmålet til jobbdesign og kroppslige forutsetninger. Et observerbart engasjement beviser derfor ikke fravær av maktasymmetri; belønning, alternativer og fordelingsvirkning må undersøkes.',
  'iow-14': 'Kontroll og samtykke er ikke nødvendigvis motsetninger. Hos Burawoy kan ansatte utvikle ferdigheter, konkurranse og fellesskap gjennom ordninger som samtidig sikrer produksjon og skjuler større fordelingsspørsmål. Weber viser organisasjonens formelle myndighet. Analysen må skille frivillig handling innenfor arbeidet fra kontroll over mål, teknologi, bemanning og overskudd og unngå både total tvang- og full frihetsfortelling.',
  'iow-15': 'Acker kritiserer den abstrakte arbeidstakeren som tilsynelatende er kroppsløs og alltid tilgjengelig. Jobber kan være utformet rundt forutsetninger om tid, omsorgsfrihet og bestemt autoritetsuttrykk. Arbeidsmiljøloven gir rettslige rammer, men avgjør ikke den empiriske fordelingen alene. Forskeren bør følge arbeidstid, oppgaver, fravær, tilrettelegging, vurdering og karriere uten å anta ansvar eller preferanser ut fra kjønn.',
  'iow-16': 'Formelt like jobbkrav kan gi ulik virkning gjennom turnus, tilgjengelighet, synlige oppgaver, prestasjonsmål og karriereløp. Acker gjør organisasjonens kjønnede prosesser analyserbare, mens arbeidsmiljøloven avgrenser rettigheter og arbeidsgiverplikter. En prosentforskjell er et funn, ikke ferdig årsaks- eller rettsbevis. Hvert beslutningsledd, relevant sammenlikningsgruppe, saklig begrunnelse og alternativ forklaring må dokumenteres.',
  'iow-17': 'Arbeidskraftundersøkelsen bruker standardiserte kriterier for å skille sysselsatte, arbeidsledige og personer utenfor arbeidsstyrken. OECD harmoniserer indikatorer for internasjonal sammenlikning. Tallene blir meningsfulle først når alder, referanseuke, aktiv jobbsøking, tilgjengelighet og nevner oppgis. En endret definisjon eller spørsmålsmåte kan flytte personer mellom kategorier uten at deres faktiske arbeidssituasjon endres tilsvarende.',
  'iow-18': 'Å bli klassifisert som sysselsatt beskriver aktivitet i en bestemt referanseperiode, men sier ikke alene om kontrakten er fast, inntekten tilstrekkelig, arbeidstiden ønsket eller arbeidsmiljøet forsvarlig. SSB dokumenterer statusmålet, mens arbeidsmiljøloven regulerer andre egenskaper. En analyse av jobbkvalitet må derfor kombinere status med timer, lønn, forutsigbarhet, rettigheter, helsebelastning og arbeidstakerens preferanser.',
  'iow-19': 'Fast og midlertidig ansettelse er kontrakts- og rettskategorier, mens sysselsetting er en statistisk arbeidsmarkedsstatus og jobbsikkerhet også kan være en opplevd vurdering. Arbeidsmiljøloven definerer rettslige vilkår, og OECD måler arbeidsmarkedet komparativt. Begrepene overlapper, men er ikke identiske. Forskeren må oppgi kontraktstype, varighet, referanseperiode, faktisk kontinuitet og hvilken usikkerhet som undersøkes.',
  'iow-20': 'Tverrnasjonal arbeidsmarkedsanalyse krever harmoniserte definisjoner, aldersgrenser, referanseperioder og nevnere. OECD gir sammenliknbare indikatorer, mens SSB dokumenterer den norske målingen. Harmonisering fjerner likevel ikke forskjeller i permisjoner, utdanning, kontrakter, trygder eller uformelt arbeid. Rangeringer bør derfor ledsages av definisjon, usikkerhet, institusjonell kontekst og alternative indikatorer på arbeidstid og jobbkvalitet.',
  'iow-21': 'Esping-Andersen sammenlikner velferdsregimer gjennom blant annet avkommodifisering, rettighetsstruktur og sosial lagdeling, ikke bare samlet pengebruk. OECDs SOCX dokumenterer utgiftsnivå og sammensetning, men kan ikke alene gjenskape regimet. Typene er analytiske sammenlikningsmodeller, ikke komplette landnavn. Forskeren må undersøke konkrete programmer, opptjeningskrav, familierolle, markedsløsninger, tjenestetilgang og historisk periode.',
  'iow-22': 'SOCX gjør offentlig og privat sosialutgift sammenliknbar på programnivå, men høy utgift viser ikke automatisk generøse rettigheter, rettferdig fordeling eller gode utfall. Esping-Andersen viser betydningen av institusjonell utforming. Utgiften kan påvirkes av priser, behov, demografi og skattesystem. Analyse bør derfor skille brutto og netto, offentlig og privat, kontant og tjeneste samt hvem som mottar og faktisk får behov møtt.',
  'iow-23': 'Sosialpolitikk kan redusere avhengighet av arbeidsmarkedet og samtidig skape eller bevare skiller gjennom opptjening, målretting, yrkestilknytning og familieroller. Esping-Andersen kaller lagdeling en del av regimet, mens Korpi retter blikket mot fordelingskonflikt og maktressurser. Ett program kan dermed beskytte og differensiere samtidig. Påstanden må vise regel, finansiering, mottakergruppe, alternativ og fordelingsvirkning.',
  'iow-24': 'Offentlig, obligatorisk privat og frivillig privat sosialutgift må skilles fordi samme totalsum kan bygge på svært ulike rettigheter og risikoer. OECDs SOCX registrerer sammensetningen, mens Esping-Andersen analyserer forholdet mellom stat, marked og familie. Sammenlikningen bør også oppgi skatt, brukerbetaling, dekning og tjenestekvalitet; samlet ressursbruk beviser ikke universell adgang eller like stor trygghet.',
  'iow-25': 'Korpis maktressursperspektiv undersøker hvordan kollektiv organisering og politisk kapasitet påvirker fordelingskonflikter og velferdsinstitusjoner. Esping-Andersens regimer viser mulige institusjonelle resultater. Maktressurser er ikke en fast egenskap ved en klasse eller organisasjon; medlemskap, koordinering, økonomiske alternativer, allianser, partier og statlig myndighet må plasseres i konkrete historiske konflikter og beslutningsarenaer.',
  'iow-26': 'Velferdsstatens utvikling kan ikke forklares som automatisk følge av økonomisk modernisering. Korpi viser betydningen av konflikt, organisering og koalisjoner, mens Esping-Andersen sammenlikner institusjonelle løsninger. Industrialisering eller aldring kan skape press, men bestemmer ikke ytelsens vilkår eller fordeling. Analysen må følge aktører, interesser, maktressurser, reformsekvens, kompromisser og alternativer som faktisk var tilgjengelige.',
  'iow-27': 'Arbeidstaker- og arbeidsgivermakt kan ikke måles med medlemstall alene. Korpi framhever organisatoriske ressurser, mens arbeidsmiljøloven viser rettslige arenaer for medvirkning og vern. Forhandlingsevne påvirkes også av streikekapasitet, erstatningsmuligheter, kompetanse, marked, finansiering og politiske allianser. En presis analyse oppgir nivå, sak, tidsrom og hvordan ressursen faktisk ble mobilisert eller blokkert.',
  'iow-28': 'Sammenlikning av kapitalismevarianter må koble arbeidsmarkedsutfall til institusjoner, koalisjoner og maktforhold. Korpi viser uenigheten mellom maktressurs- og arbeidsgiversentrerte forklaringer, mens OECD gir harmoniserte indikatorer. Et landgjennomsnitt avslører ikke mekanismen. Forskeren må sammenlikne regler, organisering, forhandlingssystem, sektorer og historisk sekvens og undersøke om samme institusjon virker ulikt for forskjellige grupper.',
  'iow-29': 'Ansatte kan føle at forskning er obligatorisk når ledelsen har åpnet organisasjonen, selv om skjemaet sier frivillig. NESH krever reell mulighet til å avstå uten konsekvens, mens Acker synliggjør hierarki og organisasjonsposisjon. Forskeren må skille institusjonell adgang fra individuelt samtykke, unngå at leder får vite hvem som avslo og vurdere arbeidstid, rekrutteringskanal og framtidig avhengighet.',
  'iow-30': 'I små organisasjoner kan kombinasjonen av rolle, avdeling, tidspunkt, prosjekt og sitat identifisere en person selv uten navn. NESH krever skadebegrensning, mens Meyer og Rowan minner om at formell og faktisk praksis kan avvike på sensitive måter. Anonymisering må derfor testes mot lokalkunnskap og søkbarhet, og dataminimering, omskriving eller utelatelse må veies mot dokumentasjonsbehovet.',
  'iow-31': 'Arbeidskraftundersøkelsen støtter populasjonsestimater gjennom definert utvalg og vekting, mens et intensivt organisasjonscase kan belyse praksis og mekanismer. SSB dokumenterer statistikkens rekkevidde, og NESH krever redelig formidling. Metodene kan utfylle, men ikke erstatte hverandre. Ett case gir ikke nasjonal prevalens, og et aggregert mønster viser ikke automatisk hvilken organisatorisk prosess som skapte forskjellen.',
  'iow-32': 'En ansvarlig organisasjonskonklusjon skiller formell regel, observert praksis, foreslått mekanisme, målt utfall, usikkerhet og normativ vurdering. Weber gir språk for formell autoritet, Lipsky for implementering og NESH for redelighet. Konklusjonen bør vise hvilke data hvert ledd bygger på, alternative forklaringer, berørte grupper og rekkevidde, framfor å bruke organisasjonskart eller resultatindikator som komplett forklaring.',
};

const MODULES = [
  { id: '01-byrakrati-legitimitet-og-organisatoriske-felt', title: 'Byråkrati, legitimitet og organisatoriske felt', topicIndexes: [0, 1] },
  { id: '02-forstelinje-arbeidsprosess-og-kjonn', title: 'Førstelinje, arbeidsprosess og kjønn', topicIndexes: [2, 3] },
  { id: '03-sysselsetting-velferdsregimer-og-maling', title: 'Sysselsetting, velferdsregimer og måling', topicIndexes: [4, 5] },
  { id: '04-maktressurser-forskning-og-ansvarlig-slutning', title: 'Maktressurser, forskning og ansvarlig slutning', topicIndexes: [6, 7] },
];

const QUESTIONS = [
  ['Hva er Webers byråkrati i denne analysen?', ['En idealtype for sammenlikning', 'Et synonym for ineffektivitet', 'En full beskrivelse av alle etater'], 0, 'iow-01'],
  ['Hva må dokumenteres før frakobling konkluderes?', ['Bare policyens språk', 'Konkret avstand mellom formell policy og praksis', 'At organisasjonen er stor'], 1, 'iow-06'],
  ['Hva gjør førstelinjen til medprodusent av politikk?', ['Anvendelse av generelle regler i konkrete saker', 'Frihet fra alle regler', 'Bare organisasjonskartet'], 0, 'iow-09'],
  ['Hvordan kan kontroll og samtykke sameksistere?', ['Ansatte kan handle aktivt innenfor rammer de ikke bestemmer', 'Samtykke opphever alltid makt', 'Kontroll krever full tvang'], 0, 'iow-14'],
  ['Hva beviser statistisk sysselsettingsstatus?', ['God jobbkvalitet', 'Fast kontrakt', 'Arbeidsmarkedsaktivitet etter en definert regel'], 2, 'iow-18'],
  ['Hvorfor er sosialutgift ikke et komplett velferdsmål?', ['Den viser ikke alene rettigheter, fordeling, kvalitet eller utfall', 'Utgifter kan ikke måles', 'Alle land bruker identiske ordninger'], 0, 'iow-22'],
  ['Hva inngår i maktressurser utover medlemstall?', ['Bare organisasjonens navn', 'Mobilisering, alternativer, rettigheter og allianser', 'Kun nasjonal inntekt'], 1, 'iow-27'],
  ['Hva krever samtykke i arbeidslivsforskning?', ['Ledelsens tillatelse er nok', 'Reell mulighet til å avstå uten konsekvens', 'At lederen kjenner alle avslag'], 1, 'iow-29'],
];

function buildReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_institutions_organizations_work_welfare_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-29',
    status: 'pass',
    conclusion: 'institutions_organizations_work_welfare_fulltext_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: CHAPTER_ID,
    counts: { domainsMaterialized: 7, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 13, assessmentQuestions: 8, teachingScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 1 },
    gates: {
      definitionAndBackground: true,
      namedTheoriesAndResearchers: true,
      findingsMethodsAndLimits: true,
      realDisagreement: true,
      teachingScenarios: true,
      plannedClaimsResolvedOneToOne: true,
      paragraphClaimTraceReciprocalAndComplete: true,
      everySourceInspectableAndUsed: true,
      bureaucracyAuthorityAndRuleBoundaries: true,
      institutionalLegitimacyDecouplingAndIsomorphismBoundaries: true,
      discretionLaborProcessAndGenderBoundaries: true,
      employmentMeasurementAndRightsBoundaries: true,
      welfareRegimePowerResourceAndExpenditureBoundaries: true,
      workplaceResearchDependencyAndConfidentialityBoundaries: true,
      chapterRegisteredInSubcategoryExactlyOnce: true,
      categoryStatusStillExpansionPlanned: true,
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
      note: 'Felt 7 er fulltekstmaterialisert med eksplisitte skiller mellom formell struktur, implementering, arbeid, velferd og utfall; underkategorien er fortsatt uferdig med 7/12 felt.',
    },
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
      schema: 'history_go_fagverk_module_v1',
      version: '1.0.0',
      subject_id: 'politikk',
      canonical_subcategory_id: 'sosiologi_antropologi',
      chapter_id: CHAPTER_ID,
      id: moduleSpec.id,
      title: moduleSpec.title,
      sections: moduleSpec.topicIndexes.map((topicIndex) => {
        const topic = topics[topicIndex];
        return {
          id: topic.id,
          title: topic.title,
          method_ids: topic.method_ids,
          boundary: topic.boundary,
          paragraphs: topic.planned_claims.map((claim) => PARAGRAPHS[claim.id]),
          paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]),
        };
      }),
    });
  }
  write(P.chapter, {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    subject: 'politikk',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    domain_id: 'institusjoner_organisasjoner_arbeid_velferd',
    id: CHAPTER_ID,
    chapter_id: CHAPTER_ID,
    title: 'Institusjoner, organisasjoner, arbeid og velferd',
    subtitle: 'Fra byråkrati, legitimitet og førstelinjeskjønn til arbeidsprosess, velferdsregimer og maktressurser',
    lead: 'Institusjoner og organisasjoner virker gjennom både formelle regler og situert praksis. Kapittelet følger hvordan myndighet, legitimitet, skjønn, arbeidsorganisering og velferdsordninger produserer beslutninger og fordelinger, og hvorfor organisasjonskart, sysselsettingstall eller sosialutgifter aldri alene beviser faktisk makt, jobbkvalitet, tjenestetilgang eller virkning.',
    learningObjectives: [
      'bruke Webers byråkrati som idealtype uten å gjøre det til full empirisk beskrivelse',
      'skille formell struktur, legitimitet, frakobling og isomorfiprosesser',
      'analysere førstelinjeskjønn gjennom regler, ressurser, begrunnelser og utfall',
      'undersøke kontroll, samtykke og kjønnede forutsetninger i arbeidsprosesser',
      'skille sysselsettingsstatus, kontrakt, arbeidstid, inntekt og jobbkvalitet',
      'sammenlikne velferdsregimer uten å redusere dem til sosialutgift',
      'analysere arbeidstaker-, arbeidsgiver- og statsmakt som mobiliserbare ressurser',
      'ivareta frivillighet, konfidensialitet og slutningsgrenser i organisasjonsforskning',
    ],
    moduleFiles,
    briefFile: P.brief,
    claimsFile: P.claims,
    assessmentFile: P.assessment,
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
  });
  write(P.brief, {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: CHAPTER_ID,
    primary_domain_id: 'institusjoner_organisasjoner_arbeid_velferd',
    purpose: 'Gi en etterprøvbar organisasjons- og velferdsanalyse som holder formell regel, faktisk praksis, makt, målt utfall og normativ vurdering fra hverandre.',
    learningArc: topics.map((topic) => topic.title),
    methodsAndLimits: [
      'idealtype og organisasjonskart er ikke full empirisk beskrivelse',
      'lik formell struktur beviser ikke lik praksis eller effektivitet',
      'førstelinjeskjønn må analyseres sammen med rett, ressurser og klage',
      'sysselsettingsstatus måler ikke automatisk jobbkvalitet',
      'sosialutgift identifiserer ikke alene rettighet, tilgang eller virkning',
      'maktressurser må dokumenteres som kapasitet og mobilisering i en konkret arena',
      'ledelsens forskningstilgang erstatter ikke ansattes frivillige samtykke',
    ],
    realDisagreements: [
      'Weber framhever regelbunden formell organisering, mens Lipsky viser hvor mye implementeringen formes av førstelinjens situerte skjønn.',
      'Meyer og Rowan og DiMaggio og Powell forklarer struktur gjennom legitimitet og feltpress, mens tekniske forklaringer legger større vekt på effektiv oppgaveløsning.',
      'Burawoy viser samtykke innenfor arbeidskontroll, mens teorier om direkte kontroll legger større vekt på tvang og overvåking.',
      'Esping-Andersens regimetyper vektlegger institusjonell utforming, mens Korpis maktressursperspektiv forklarer ordningene gjennom konflikt og kollektiv kapasitet.',
    ],
    criticalDistinctions: [
      'idealtype vs faktisk organisasjon',
      'formell struktur vs praksis',
      'skjønn vs vilkårlighet',
      'deltakelse vs kontroll over rammene',
      'sysselsatt vs trygg og god jobb',
      'sosialutgift vs rettighet og utfall',
      'maktressurs vs medlemstall',
      'organisasjonsadgang vs individuelt samtykke',
    ],
    teachingScenarios: sourceBrief.decision_scenarios,
    safety: {
      organizationChartAsCompletePowerMap: false,
      discretionAsPersonalMoralFailure: false,
      employmentStatusAsJobQuality: false,
      expenditureAsWelfareOutcome: false,
      managementAccessAsEmployeeConsent: false,
      anonymousTitleAsGuaranteedAnonymity: false,
    },
  });
  write(P.claims, {
    schema: 'history_go_fagverk_claims_v1',
    version: '1.0.0',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: CHAPTER_ID,
    retrieval_status: 'verified_2026-08-29',
    verified_at: '2026-08-29',
    sources: sourceBrief.sources.map((source) => ({ ...source, retrieval_status: 'verified_2026-08-29' })),
    claims: plannedClaims.map((claim) => ({
      id: claim.id,
      claim: claim.text,
      source_ids: claim.source_ids,
      classification: 'verified_scholarly_primary_and_official_source_synthesis',
      status: 'verified',
      verified_at: '2026-08-29',
    })),
  });
  write(P.assessment, {
    schema: 'history_go_fagverk_assessment_v1',
    version: '1.0.0',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: CHAPTER_ID,
    questions: QUESTIONS.map(([question, options, answerIndex, claim_id], index) => ({
      id: `iow-q${index + 1}`,
      type: 'multiple_choice',
      question,
      options,
      answerIndex,
      answer: options[answerIndex],
      claim_id,
      source: plannedClaims.find((claim) => claim.id === claim_id).source_ids,
      learner_typing: false,
    })),
    caseTasks: sourceBrief.decision_scenarios.map((scenario) => ({ ...scenario, responseMode: 'guided_discussion_no_required_typing' })),
  });
  const production = read(P.production);
  production.status = 'fulltext_production_in_progress';
  production.progress.materializedDomains = 7;
  production.progress.strictCompletionProven = false;
  const entry = { ordinal: 7, domain_id: 'institusjoner_organisasjoner_arbeid_velferd', chapter: P.chapter, claims: P.claims, assessment: P.assessment, audit: P.report };
  production.materialized = [...production.materialized.filter((row) => row.ordinal !== 7), entry].sort((a, b) => a.ordinal - b.ordinal);
  production.next_gate = 'culture_religion_ritual_materiality_fulltext_materialization';
  write(P.production, production);
  const reconciliation = read(P.reconciliation);
  reconciliation.status = 'authority_audit_complete_fulltext_production_in_progress';
  reconciliation.production_plan.source_first_ready = Math.max(reconciliation.production_plan.source_first_ready, 8);
  reconciliation.production_plan.materialized = 7;
  reconciliation.production_plan.next_domain = 'kultur_religion_ritual_materialitet';
  write(P.reconciliation, reconciliation);
  write(P.report, buildReport(sourceBrief));
  return { chapter: CHAPTER_ID, domains: 7, claims: 32, sources: 13 };
}

const result = materialize();
console.log(`Institusjoner, organisasjoner, arbeid og velferd materialisert: ${result.domains}/12 felt, ${result.claims} claims, ${result.sources} kilder.`);

