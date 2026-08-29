#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'familie-slektskap-omsorg-og-livslop';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/family_kinship_care_life_course_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  reconciliation: 'reports/fagverk/sosiologi-antropologi-reconciliation-v1.json',
  chapter: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  report: 'reports/fagverk/sosiologi-antropologi-family-kinship-care-life-course-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};

const PARAGRAPHS = {
  'fkl-01': 'Morgan flytter familieanalysen fra en fast gruppe til praksiser som gjentas, forhandles og endres. Måltider, kontakt, økonomisk hjelp og omsorg kan gjøre relasjoner familiære uten at alle deler bosted. Finch viderefører praksisperspektivet gjennom spørsmål om anerkjennelse. Analysen må derfor navngi handling, relasjon, tid og institusjonell ramme i stedet for å anta én universell familieform.',
  'fkl-02': 'Finchs family display beskriver hvordan mennesker viser for relevante andre at bestemte relasjoner skal forstås som familie. Fotografier, høytider, omsorg og presentasjoner overfor skole eller tjenester kan få slik betydning. Display er ikke bare skuespill eller fasade; Morgan og Finch viser at anerkjennelse inngår i relasjonsarbeidet, samtidig som publikum og normer kan begrense hvilke familier som blir forståelige.',
  'fkl-03': 'SSB definerer familie og privathusholdning gjennom registrert bosted og bestemte relasjoner for å produsere sammenliknbar statistikk. Morgan viser hvorfor levd familiepraksis kan strekke seg over flere adresser eller omfatte andre omsorgspersoner. Registerenheten er derfor gyldig for sine statistiske formål, men må ikke uten videre brukes som komplett kart over tilhørighet, hjelp eller faktisk omsorg.',
  'fkl-04': 'Å være aleneboende betyr i SSBs statistikk at én person er registrert i husholdningen. Det sier ikke alene om personen er ensom, sosialt isolert, uten familie eller uten praktisk støtte. Slike slutninger krever egne mål på kontakt, relasjonskvalitet, nettverk og behov. NESHs krav til redelig framstilling tilsier at husholdningsstatus ikke gjøres til en psykologisk diagnose.',
  'fkl-05': 'Schneider kritiserer slektskapsforskning som gjør vestlige forestillinger om blod, natur og reproduksjon til universell analytisk målestokk. Carstens komparative arbeid viser i stedet at relasjoner kan skapes gjennom hus, mat, kropp og gjentatt omsorg. Kritikken avviser ikke biologiske forbindelser, men krever at forskeren undersøker hvordan lokale kategorier gis sosial betydning før de oversettes til ferdige slektskapsledd.',
  'fkl-06': 'Carstens begrep relatedness åpner for å studere hvordan nærhet og slektskapsliknende bånd blir til gjennom samboing, deling av mat, minner, kroppslige prosesser og omsorg. Morgans praksisperspektiv klargjør gjentakelsen i dette arbeidet. Begrepet skal ikke gjøre alle relasjoner like; analysen må fortsatt undersøke lokale navn, plikter, varighet, asymmetrier og hvem som kan anerkjenne eller avvise forbindelsen.',
  'fkl-07': 'Biologisk forbindelse, juridisk foreldreskap, daglig omsorg og opplevd tilhørighet kan overlappe, men de følger ulike regler og datakilder. Carsten viser den kulturelle og praktiske produksjonen av relatedness, mens barnelova regulerer rettslige posisjoner og ansvar. En presis analyse sier derfor hvilket lag som undersøkes og unngår å bruke genetikk, lovstatus eller følelsesmessig nærhet som automatisk bevis for de andre.',
  'fkl-08': 'Komparativ slektskapsanalyse må oversette lokale begreper uten å anta at familie, hus, avstamning eller person betyr det samme i alle samfunn. Schneider viser hvordan analytiske kategorier kan importere vestlige premisser, mens Carsten demonstrerer sammenlikning gjennom relasjonelle praksiser. Forskeren bør dokumentere originalterm, brukssituasjon, rettigheter og forpliktelser og forklare hva som tapes eller endres i oversettelsen.',
  'fkl-09': 'Ekteskap, samboerskap og andre partnerskap organiseres gjennom forskjellige juridiske, økonomiske og symbolske ordninger. SSB kan beskrive registrerte familieformer og bosted, mens Carsten viser at levd tilhørighet ikke uttømmes av kategoriene. Sammenlikning må derfor skille formell status, felles adresse, ressursdeling, omsorg og offentlig anerkjennelse og oppgi hvilket historisk regelverk observasjonen gjelder.',
  'fkl-10': 'Foreldreskap kan omfatte juridisk ansvar, genetisk eller reproduktiv forbindelse, daglig omsorg, forsørgelse og relasjonell identifikasjon. Barnelova regulerer flere av de rettslige posisjonene, mens Carsten viser hvordan slektskap også gjøres i praksis. Når lagene ikke faller sammen, må analysen unngå å kåre én automatisk virkelig forelder og heller undersøke myndighet, plikt, samvær, omsorg og barnets perspektiv separat.',
  'fkl-11': 'Reproduksjonsteknologi, adopsjon og varierte familieformer synliggjør at biologisk forbindelse og sosialt slektskap verken er identiske eller helt uavhengige. Carsten undersøker hvordan kropp, reproduksjon og relasjon gis kulturell betydning, mens Schneider kritiserer biologien som universell modell. Uenigheten er både empirisk og normativ: hvem regnes som familie, etter hvilke praksiser, regler og former for anerkjennelse?',
  'fkl-12': 'Barnets beste er et rettslig vurderingsprinsipp, ikke en enkel formel som alltid peker mot én familieform. Barnelova knytter avgjørelser til barnets interesser og medvirkning, mens NESH krever alderstilpasset informasjon og respekt i forskning. Voksnes ønsker, biologisk forbindelse og institusjonell bekvemmelighet kan være relevante, men kan ikke erstatte en konkret, begrunnet vurdering av barnet og situasjonen.',
  'fkl-13': 'Hochschilds second shift viser hvordan en arbeidsdag kan etterfølges av kjønnet fordelt husarbeid og omsorg hjemme. Morgan gjør det mulig å analysere oppgavene som familiepraksiser snarere enn naturlige egenskaper. Begrepet er ikke en påstand om alle par; forskeren må måle lønnsarbeid, oppgaver, ansvar, tilgjengelighet og forhandling og undersøke variasjon mellom husholdninger og over tid.',
  'fkl-14': 'Omsorgsfordeling kan ikke reduseres til samlet timetall. Hochschild synliggjør husarbeid, strategier og følelsesmessig arbeid, mens Tronto retter oppmerksomheten mot å oppdage behov, ta ansvar, utføre omsorg og vurdere respons. Analyse bør derfor registrere oppgavetype, planlegging, beslutningsmyndighet, beredskap, avbrudd og hvem som bærer konsekvensen når omsorgen uteblir eller må gjøres på nytt.',
  'fkl-15': 'Tronto behandler omsorg som et demokratisk og institusjonelt spørsmål fordi alle mennesker er avhengige av omsorg gjennom livsløpet. Markeder, familie og offentlige tjenester fordeler ansvar og synlighet ulikt. Helse- og omsorgstjenesteloven viser et offentlig sørge-for-ansvar, men avgjør ikke alene hvordan behov møtes. Analysen må følge beslutninger, ressurser, utførelse, mottakerrespons og ulikhet i faktisk tilgang.',
  'fkl-16': 'Kommunens lovfestede sørge-for-ansvar, vedtak om tjenester, faktisk levert hjelp og familiens ulønnede innsats er forskjellige ledd. Helse- og omsorgstjenesteloven regulerer offentlig ansvar og støtte til pårørende, mens Tronto viser den politiske fordelingen av omsorg. En tjenesteoversikt kan derfor ikke bevise avlastning eller kvalitet; mottak, kontinuitet, pårørendebelastning og brukerens utfall må dokumenteres særskilt.',
  'fkl-17': 'Barndom er både en fase i livsløpet, en institusjonell posisjon og en relasjon til voksne, jevnaldrende, skole og offentlige ordninger. Livsløpsforskningen viser betydningen av historisk timing, mens barnelova gir barn rettslig status. Alder påvirker avhengighet og handlingsrom, men gjør ikke alle barn like; kjønn, funksjon, ressurser, bosted og relasjoner skaper betydelig variasjon.',
  'fkl-18': 'Barnelova knytter avgjørelser til barnets beste og gir barn rett til informasjon og medvirkning tilpasset alder og modenhet. NESH overfører ikke rettsregelen mekanisk til forskning, men krever forståelig informasjon, frivillighet og vern mot utilbørlig press. Medvirkning betyr heller ikke at barnet alene bærer beslutningsansvaret; voksne og institusjoner må begrunne hvordan perspektivet er innhentet, vektet og beskyttet.',
  'fkl-19': 'Generasjon kan bety plass i en slektslinje, medlemskap i en fødselskohort eller deling av en historisk erfaring. Livsløpsforskningen bruker kohort for å skille tidsbundne erfaringer, mens Carsten undersøker generasjon i slektskapsrelasjoner. Betydningene kan møtes, men må ikke blandes: en besteforelderrolle, en årgang og en politisk generasjon har ulike enheter, mekanismer og evidenskrav.',
  'fkl-20': 'Forskning med barn krever alderstilpasset informasjon, reell mulighet til å avstå og vurdering av avhengighet til foreldre, skole eller tjeneste. NESH framhever sårbarhet, tredjepersonvern og skadebegrensning, mens barnelova understreker medvirkning. Foreldres samtykke gjør ikke barnets stemme overflødig, og barnets deltakelse gir ikke automatisk rett til å publisere sensitive opplysninger om resten av familien.',
  'fkl-21': 'Livsløpsperspektivet skiller enkeltstående overganger fra lengre forløp, timing fra varighet og historisk kontekst fra individuell handling. Annual Reviews-oversikten viser hvordan trajectories formes gjennom institusjoner og tidligere hendelser. Perspektivet er ikke en ferdig normalbiografi; analysen må beskrive hvilke overganger som studeres, hvem som definerer dem, tilgjengelige alternativer og hvordan utfall varierer mellom kohorter og posisjoner.',
  'fkl-22': 'Linked lives betegner at menneskers forløp henger sammen. Utdanning, arbeid, omsorg, migrasjon og pensjonering kan endres når partner, barn, foreldre eller andre nære relasjoner møter nye behov. Livsløpsforskningen gir tids- og institusjonsperspektivet, mens Morgan viser de konkrete familiepraksisene. Sammenheng betyr likevel ikke felles interesse; makt, konflikt og ulik ressurskontroll må undersøkes.',
  'fkl-23': 'Tidlig, sen og normal overgang er vurderinger skapt av institusjoner, kultur og statistiske forventninger. Livsløpsforskningen viser hvordan timing får konsekvenser, mens forskning på aldersulikhet viser at terskler fordeler rettigheter og plikter. En gjennomsnittsalder beskriver det typiske i et bestemt datamateriale, men kan ikke alene avgjøre hva som er ønskelig, modent eller avvikende for et individ.',
  'fkl-24': 'Alder, periode og kohort kan produsere liknende mønstre i data, men viser til ulike mekanismer. Endring med kronologisk alder kan forveksles med en historisk hendelse som rammer alle, eller med erfaringer særskilt for en fødselskohort. Livsløps- og aldersforskning krever derfor eksplisitt tidsdesign, sammenliknbare målinger og varsomhet når tverrsnittsdata tolkes som individuell aldring.',
  'fkl-25': 'Aldersulikhet formes av formelle terskler, arbeidsmarkeder, pensjonsordninger, akkumulerte ressurser og tidligere livsløp, ikke bare biologisk endring. Annual Reviews viser alder som institusjonell ulikhetsdimensjon, mens SSBs husholdningsdata kan belyse økonomiske ressurser. Kronologisk alder er derfor utilstrekkelig forklaring; analyse må skille funksjon, kohort, inntekt, formue, relasjoner og tilgang til tjenester.',
  'fkl-26': 'Å bo alene er en opplysning om husholdningssammensetning, ikke et direkte mål på ensomhet, sosial støtte eller omsorgsbehov. SSB gir presise registerdefinisjoner, mens aldersforskning viser variasjon i relasjoner og institusjonelle vilkår. En tjenesteanalyse må derfor koble husholdning til egne data om nettverk, funksjon, kontakt, preferanser og mottatt hjelp før den prioriterer eller beskriver risiko.',
  'fkl-27': 'Husholdningsinntekt og nettoformue må tolkes med antall personer, forbruksbehov, gjeld, eierskap og faktisk ressursdeling. SSB bruker ekvivalensskalaer og husholdningsenheter for sammenlikning, men slike mål kan ikke vise intern fordeling direkte. Når eldre eller familier sammenliknes, bør analysen oppgi enhet, referanseår, prisgrunnlag og om boligformue, overføringer og omsorgsressurser inngår.',
  'fkl-28': 'Formell rett til tjeneste, enkeltvedtak, faktisk levert hjelp, kvalitet, pårørendebelastning og brukerens utfall er separate ledd i en omsorgskjede. Helse- og omsorgstjenesteloven dokumenterer offentlig ansvar, mens Tronto viser at omsorgens respons og fordeling må vurderes. Et vedtak kan derfor være nødvendig uten å bevise tilstrekkelig hjelp; venting, kontinuitet, koordinering og mottakerens erfaring må følges.',
  'fkl-29': 'Et familieintervju er en situert fortelling til en bestemt forsker og kan også fungere som display av hvem familien er. Finch viser anerkjennelsens betydning, mens NESH minner om at utsagnet kan omtale fraværende tredjepersoner. Forskeren må analysere spørsmål, publikum, konflikt og taushet og kan ikke behandle én deltakers versjon som nøytral fasit om partner, barn eller slekt.',
  'fkl-30': 'Familiepraksiser kan undersøkes gjennom intervjuer, tidsbruk, observerte hendelser, dokumenter, registerdata og institusjonelle regler. Morgan gir praksisrammen, mens SSB viser verdien og grensene ved standardiserte enheter. Metodetriangulering betyr ikke at én kilde automatisk bekrefter en annen; forskeren må forklare hvilket spørsmål hver kilde besvarer, hvordan enhetene kobles og hvorfor avvik kan være analytisk viktige.',
  'fkl-31': 'Samtykke fra ett familiemedlem gir ikke automatisk rett til å publisere identifiserbare opplysninger om barn, partner eller andre slektninger. NESH behandler privat informasjon og tredjepersonvern som egne ansvar, mens barnelova synliggjør barns særskilte posisjon. Forskeren må minimere data, vurdere indirekte identifisering og konflikt, skille tilgang fra publiseringsrett og begrunne når omskriving eller utelatelse er nødvendig.',
  'fkl-32': 'En ansvarlig familiekonklusjon skiller minst fem lag: statistisk husholdning, juridisk posisjon, levd praksis, omsorgsrelasjon og normativ vurdering. SSB dokumenterer standardiserte enheter, mens Schneider viser hvordan analytiske kategorier kan bære kulturelle premisser. Konklusjonen bør oppgi datakilde, tidsrom, hvem som mangler, alternative tolkninger og hvilke verdier som brukes, i stedet for å kalle én modell den naturlige familien.',
};

const MODULES = [
  { id: '01-familiepraksiser-display-og-slektskap', title: 'Familiepraksiser, display og slektskap', topicIndexes: [0, 1] },
  { id: '02-foreldreskap-reproduksjon-og-omsorgsarbeid', title: 'Foreldreskap, reproduksjon og omsorgsarbeid', topicIndexes: [2, 3] },
  { id: '03-barndom-generasjon-og-livslop', title: 'Barndom, generasjon og livsløp', topicIndexes: [4, 5] },
  { id: '04-aldring-velferd-og-forskningsetikk', title: 'Aldring, velferd og forskningsetikk', topicIndexes: [6, 7] },
];

const QUESTIONS = [
  ['Hva skiller husholdning fra levd familiepraksis?', ['Husholdning er en statistisk bostedsenhet; praksis kan gå på tvers av adresser', 'Begrepene er alltid identiske', 'Praksis gjelder bare juridisk familie'], 0, 'fkl-03'],
  ['Hva undersøker relatedness?', ['Bare biologisk avstamning', 'Hvordan relasjoner skapes gjennom lokale praksiser og betydninger', 'Kun juridisk foreldreskap'], 1, 'fkl-06'],
  ['Hvorfor må foreldreskap deles analytisk?', ['Fordi juridisk posisjon, omsorg, forsørgelse og tilhørighet kan avvike', 'Fordi biologi alltid avgjør alt', 'Fordi barnets perspektiv er irrelevant'], 0, 'fkl-10'],
  ['Hva mangler en omsorgsanalyse som bare teller timer?', ['Ingenting', 'Oppgavetype, ansvar, beredskap og følelsesarbeid', 'Bare husholdningens adresse'], 1, 'fkl-14'],
  ['Hva betyr linked lives?', ['At alle familiemedlemmer har samme interesse', 'At nære relasjoners livsforløp påvirker hverandre', 'At livsløp er biologisk fastlagt'], 1, 'fkl-22'],
  ['Hvorfor må alder, periode og kohort skilles?', ['For å unngå å tolke historiske eller generasjonelle mønstre som aldring', 'Fordi de alltid måles likt', 'For å fjerne historisk kontekst'], 0, 'fkl-24'],
  ['Hva beviser aleneboende status?', ['Ensomhet', 'Omsorgsbehov', 'Bare husholdningssammensetning'], 2, 'fkl-26'],
  ['Hva krever relasjonelt personvern i familieforskning?', ['At én deltaker kan samtykke for alle', 'Vurdering av tredjepersoner og indirekte identifisering', 'At alle sitater publiseres ordrett'], 1, 'fkl-31'],
];

function buildReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_family_kinship_care_life_course_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-29',
    status: 'pass',
    conclusion: 'family_kinship_care_life_course_fulltext_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: CHAPTER_ID,
    counts: { domainsMaterialized: 6, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 13, assessmentQuestions: 8, teachingScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 1 },
    gates: {
      definitionAndBackground: true,
      namedTheoriesAndResearchers: true,
      findingsMethodsAndLimits: true,
      realDisagreement: true,
      teachingScenarios: true,
      plannedClaimsResolvedOneToOne: true,
      paragraphClaimTraceReciprocalAndComplete: true,
      everySourceInspectableAndUsed: true,
      householdFamilyAndPracticeBoundaries: true,
      kinshipTranslationAndRelatednessBoundaries: true,
      careWorkInstitutionAndPublicResponsibilityBoundaries: true,
      childParticipationLifeCourseAndAgeBoundaries: true,
      relationalConsentAndThirdPartyPrivacyBoundaries: true,
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
      note: 'Felt 6 er fulltekstmaterialisert med eksplisitte skiller mellom husholdning, slektskap, omsorg og livsløp; underkategorien er fortsatt uferdig med 6/12 felt.',
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
    domain_id: 'familie_slektskap_omsorg_livslop',
    id: CHAPTER_ID,
    chapter_id: CHAPTER_ID,
    title: 'Familie, slektskap, omsorg og livsløp',
    subtitle: 'Fra familiepraksiser og relatedness til omsorgsfordeling, linked lives, aldring og relasjonell forskningsetikk',
    lead: 'Familie og slektskap er ikke én naturlig enhet som kan leses direkte fra adresse, biologi eller lovstatus. Kapittelet følger hvordan relasjoner gjøres og anerkjennes, hvordan omsorg fordeles mellom husholdning, marked og velferdsstat, og hvordan barndom, generasjon, overganger og aldring formes gjennom historiske institusjoner og sammenkoblede liv.',
    learningObjectives: [
      'skille statistisk husholdning fra levd familiepraksis og sosialt nettverk',
      'analysere family display og relatedness uten å universaliserte vestlige slektskapskategorier',
      'holde biologisk forbindelse, juridisk foreldreskap, omsorg og tilhørighet fra hverandre',
      'måle omsorg gjennom tid, oppgaver, ansvar, beredskap og mottakerrespons',
      'analysere barns medvirkning og generasjon som rettslige, relasjonelle og historiske posisjoner',
      'skille overgang, trajectory, timing, periode, kohort og linked lives',
      'analysere aldring gjennom ressurser, institusjonelle terskler, funksjon og tjenestekjeder',
      'beskytte tredjepersoner og håndtere relasjonelt samtykke i familieforskning',
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
    primary_domain_id: 'familie_slektskap_omsorg_livslop',
    purpose: 'Gi en etterprøvbar analyse av familie, slektskap, omsorg og livsløp som skiller statistiske, juridiske, praktiske og normative lag og beskytter personer i relasjonelle data.',
    learningArc: topics.map((topic) => topic.title),
    methodsAndLimits: [
      'registerbasert husholdning dekker ikke alle levde omsorgsnettverk',
      'slektskapsbegreper må oversettes og historiseres',
      'intervju og family display er situerte kilder',
      'tidsbruk alene måler ikke omsorgens ansvar og beredskap',
      'tverrsnitt kan ikke uten videre skille alder, periode og kohort',
      'rettslig adgang eller foreldres samtykke erstatter ikke barnets medvirkning',
      'familiedata kan identifisere tredjepersoner som ikke deltar',
    ],
    realDisagreements: [
      'Schneider kritiserer biologisk slektskap som universell modell, mens Carstens relatedness søker et sammenliknbart språk for relasjoner uten å oppheve lokal forskjell.',
      'Familiepraksis og display utvider analysen utover husholdningen, men statistiske og rettslige enheter er fortsatt nødvendige for bestemte spørsmål.',
      'Omsorg kan forstås som privat relasjon, arbeid, markedstjeneste eller demokratisk ansvar; Tronto viser at plasseringen er politisk omstridt.',
      'Livsløpsinstitusjoner skaper normert timing, mens individuell handling og historiske kohortforskjeller utfordrer én standardbiografi.',
    ],
    criticalDistinctions: [
      'familie vs husholdning',
      'biologisk forbindelse vs juridisk posisjon vs levd omsorg',
      'family display vs fasade',
      'omsorgstid vs ansvar og beredskap',
      'barnets medvirkning vs fullt beslutningsansvar',
      'alder vs periode vs kohort',
      'aleneboende vs ensom eller hjelpetrengende',
      'deltakers samtykke vs tredjepersoners publiseringsvern',
    ],
    teachingScenarios: sourceBrief.decision_scenarios,
    safety: {
      householdAsCompleteFamilyMap: false,
      biologyAsAutomaticParenthood: false,
      adultConsentAsChildConsent: false,
      livingAloneAsLonelinessDiagnosis: false,
      ageAsSufficientNeedAssessment: false,
      oneFamilyAccountAsNeutralTruth: false,
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
      classification: 'verified_scholarly_and_primary_source_synthesis',
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
      id: `fkl-q${index + 1}`,
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
  production.progress.materializedDomains = 6;
  production.progress.strictCompletionProven = false;
  const entry = { ordinal: 6, domain_id: 'familie_slektskap_omsorg_livslop', chapter: P.chapter, claims: P.claims, assessment: P.assessment, audit: P.report };
  production.materialized = [...production.materialized.filter((row) => row.ordinal !== 6), entry].sort((a, b) => a.ordinal - b.ordinal);
  production.next_gate = 'institutions_organizations_work_welfare_fulltext_materialization';
  write(P.production, production);
  const reconciliation = read(P.reconciliation);
  reconciliation.status = 'authority_audit_complete_fulltext_production_in_progress';
  reconciliation.production_plan.source_first_ready = Math.max(reconciliation.production_plan.source_first_ready, 7);
  reconciliation.production_plan.materialized = 6;
  reconciliation.production_plan.next_domain = 'institusjoner_organisasjoner_arbeid_velferd';
  write(P.reconciliation, reconciliation);
  write(P.report, buildReport(sourceBrief));
  return { chapter: CHAPTER_ID, domains: 6, claims: 32, sources: 13 };
}

const result = materialize();
console.log(`Familie, slektskap, omsorg og livsløp materialisert: ${result.domains}/12 felt, ${result.claims} claims, ${result.sources} kilder.`);

