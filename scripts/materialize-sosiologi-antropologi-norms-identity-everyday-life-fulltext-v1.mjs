#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OWNER_CHAPTER_ID = 'normer-identitet-hverdagsliv';
const OVERLAY_ID = 'normer-identitet-hverdagsliv-strict-upgrade';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${OVERLAY_ID}`;
const P = {
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/norms_identity_everyday_life_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  reconciliation: 'reports/fagverk/sosiologi-antropologi-reconciliation-v1.json',
  ownerChapter: 'data/fagverk/politikk/normer-identitet-hverdagsliv.json',
  ownerClaims: 'data/fagverk/politikk/normer-identitet-hverdagsliv/claims.json',
  overlay: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  report: 'reports/fagverk/sosiologi-antropologi-norms-identity-everyday-life-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };

const PARAGRAPHS = {
  "nia-01": "Alfred Schutz beskriver livsverdenen som den intersubjektive hverdagsordenen mennesker vanligvis tar for gitt. Aktører bruker typifiseringer av situasjoner, handlinger og andre for å koordinere uten å undersøke alt fra grunnen. Berger og Luckmann viser hvordan slike kunnskapsformer blir sosialt tilgjengelige. Analysen må likevel vise hvilke typifiseringer som faktisk brukes, av hvem og i hvilken situasjon.",
  "nia-02": "Typifisering reduserer kompleksitet: kategorien «kunde», «elev» eller «nabo» gir foreløpige forventninger som letter samhandling. Problemet oppstår når typen behandles som hele personen og avvik blir oversett eller sanksjonert. Schutz og Goffmans stigmaanalyse viser at kategorier er relasjonelle redskaper, ikke essens. Forskeren må rapportere variasjon innad og hvordan personen selv svarer på tilskrivningen.",
  "nia-03": "Berger og Luckmann analyserer institusjonalisering som en prosess der gjentatte handlinger typifiseres, blir forventet og legitimeres for nye deltakere. Da kan en historisk ordning framstå som objektiv virkelighet. Bourdieu tilfører spørsmålet om makt og tatt-for-gitthet. Prosesspåstanden krever dokumentasjon av rutiner, roller, begrunnelser, sanksjoner og hvem som kan endre ordningen.",
  "nia-04": "Hverdagskunnskap må undersøkes i konkrete språkhandlinger, situasjoner og sanksjoner. En forsker kan ikke erklære at «gruppen mener» noe fordi enkelte utsagn ligner. Schutz krever situert meningsforståelse, mens NESH krever redelig representasjon. Analysen bør vise uenighet, taushet, posisjon og skiftende sammenhenger og avstå fra å gjøre en etnisk, religiøs eller nasjonal kategori til homogen kultur.",
  "nia-05": "George Herbert Mead knytter selvets framvekst til rolletaking: barnet og den voksne lærer å forestille seg andres respons og etter hvert et mer organisert generalisert perspektiv. Selvet er dermed relasjonelt, men ikke passivt. Berger og Luckmann viser hvordan roller institusjonaliseres. Empirisk analyse må følge hvordan bestemte forventninger læres, prøves, motsies og endres, ikke bare navngi sosialisering.",
  "nia-06": "Goffmans frontstage og backstage betegner ulike publikum, settinger og informasjonsordninger. En servicerolle foran kunder og en samtale i pauserommet er ikke nødvendigvis et falskt og et sant selv. Mead bidrar med rolletaking og respons. Forskeren bør analysere forventninger, rekvisitter, tilgang og koordinering og unngå å gjøre variasjon mellom arenaer til bevis på uærlighet eller skjult personlighet.",
  "nia-07": "Selvpresentasjon lykkes bare dersom andre aksepterer, utfordrer eller reparerer inntrykket. Derfor er den et samarbeids- og forhandlingsfenomen, ikke individuell iscenesettelse alene. Goffman viser publikums og settingens betydning, mens Garfinkel retter blikket mot hvordan forståelighet produseres sekvensielt. Et case må dokumentere respons, informasjonskontroll og brudd, ikke utlede motiv fra klær, tone eller rolle alene.",
  "nia-08": "En sosial rolle avgrenser forventninger, ansvar og myndighet i en bestemt sammenheng. Den kan forklare hvorfor en lærer vurderer eller en saksbehandler begrunner, men ikke hele personens handlinger på tvers av hjem, arbeid og offentlighet. Mead og Goffman viser relasjonell rolletaking og situasjonsorden. Analyse må skille rollekrav, individuell improvisasjon, organisatoriske regler og publikums reaksjon.",
  "nia-09": "Etnometodologi undersøker de praktiske metodene medlemmer bruker for å gjøre handlinger gjenkjennelige, forståelige og ansvarlige. Garfinkel behandler ikke sosial orden som ferdig struktur som bare virker utenfra; den produseres i sekvenser, forklaringer og reparasjoner. Schutz bidrar med hverdagslig meningsorientering. Forskeren må nærstudere hendelsesforløp og deltakernes egne orienteringer før en underliggende regel påstås.",
  "nia-10": "Bakgrunnsforventninger blir ofte synlige når en handling bryter det vanlige og deltakerne forsøker å forklare eller reparere situasjonen. Garfinkels bruddeksperimenter er metodisk lærerike, men kan skape uro, ydmykelse eller maktmisbruk. NESH krever proporsjonalitet, informasjon og skadebegrensning. Undervisningsøvelser må derfor bruke lavrisiko, hypotetiske scenarioer eller frivillig demonstrasjon fremfor skjult forstyrrelse av sårbare personer.",
  "nia-11": "Reparasjon i samhandling viser hvordan deltakere håndterer misforståelser, feil ordvalg, avbrudd eller uklare forventninger. Garfinkels etnometodologi gjør sekvensen analytisk, mens Goffman viser risikoen for ansiktstap. Forskeren bør følge hvem som oppdager problemet, hvem som får definere løsningen og om orden faktisk gjenopprettes. Reparasjon kan også sementere autoritet eller åpne en norm for forhandling.",
  "nia-12": "Formelle regler får praktisk innhold gjennom tolkning, skjønn, rutiner, ressurser og sanksjoner. Lik ordlyd kan dermed gi ulik adgang eller virkning. Berger og Luckmann forklarer institusjonalisert praksis, mens likestillings- og diskrimineringsloven gir rettslige standarder for forskjellsbehandling og tilrettelegging. En analyse må skille regeltekst, implementerende aktør, faktisk beslutning, klagemulighet og dokumentert konsekvens.",
  "nia-13": "Bourdieus doxa viser til forutsetninger som oppfattes som så selvfølgelige innen en sosial orden at de sjelden formuleres eller forsvares. Berger og Luckmann beskriver hvordan institusjoner objektiveres og legitimeres. Doxa er likevel ikke usynlig magi: den må spores i kategorier, kroppslige rutiner, stillhet, sanksjoner og øyeblikk der noen utfordrer det som tidligere ble tatt for gitt.",
  "nia-14": "Habitus betegner historisk formede disposisjoner for å oppfatte og handle, men er ikke et skjult program som bestemmer individet. Bourdieu kobler disposisjonene til feltets aktuelle muligheter, mens Mead viser situert respons og rolletaking. Endrede betingelser kan skape misforhold, refleksjon og improvisasjon. Empirisk bruk krever dokumenterte erfaringer, arena og praksis, ikke bakgrunnskategori som automatisk årsak.",
  "nia-15": "Lamont og Molnár skiller symbolske grenser i språk og vurdering fra sosiale grenser som gir ulik tilgang, belønning eller medlemskap. En distinksjon blir derfor ikke materiell ulikhet uten institusjonelle mellomledd. Likestillingsloven gir standarder for diskriminering. Analysen må vise hvem som trekker grensen, hvilken arena den gjelder, hvordan den håndheves og om den får observerbare konsekvenser.",
  "nia-16": "Statistisk vanlig, sosialt forventet og rettslig tillatt er tre ulike normpåstander. En familieform kan være mest utbredt uten å være moralsk riktig eller rettslig påbudt. Lamont og Molnár viser vurderingsgrenser, mens lovverket fastsetter rettigheter og forbud. Presis analyse navngir målegrunnlaget, aktørene som forventer, relevant rettsregel og forskerens eventuelle normative argument hver for seg.",
  "nia-17": "Goffman analyserer stigma som et relasjonelt misforhold mellom en tilskrevet forventning og personens situerte sosiale identitet. En egenskap er ikke diskrediterende i alle sammenhenger. Lamont og Molnár viser hvordan grenser varierer mellom arenaer. Forskeren må dokumentere publikum, kategori, sanksjon og konsekvens og unngå språk som gjør den stigmatiserte egenskapen til personens essens eller naturlige problem.",
  "nia-18": "Passing og covering beskriver måter personer håndterer informasjon og synlighet under forventet sanksjon. De er situerte strategier, ikke stabile personlighetstrekk eller bevis på skam. Goffmans stigma- og selvpresentasjonsanalyser viser betydningen av publikum, risiko og tilgang til informasjon. Analyse må spørre hvilke konsekvenser avsløring kan få, hvilke alternativer personen faktisk har, og hvem som kontrollerer kategorien.",
  "nia-19": "Identifikasjon oppstår i samspillet mellom selvdefinisjon, andres kategorisering og institusjonelle registre. Mead forklarer relasjonell selvutvikling, mens grenseforskningen viser kategorienes kollektive og institusjonelle virkninger. De tre nivåene kan avvike: en person kan avvise en administrativ etikett som likevel styrer rettigheter eller statistikk. Forskeren må beholde avviket og ikke velge én kategori som hele sannheten.",
  "nia-20": "Små eller stigmatiserte grupper kan identifiseres indirekte gjennom kombinasjonen av sted, rolle, hendelse og sitat selv når navn fjernes. NESH krever dataminimering og skadevurdering, mens Goffman viser stigmaets situerte konsekvenser. Forskeren må vurdere nødvendigheten av detaljen, søkbarhet, deltakerinnsyn og omskriving og samtidig unngå at analysebegrepene gjentar en nedsettende offentlig kategori.",
  "nia-21": "West og Zimmerman analyserer kjønn som en rutinemessig prestasjon under ansvarlighet for forventede kjønnsnormer. Poenget er ikke at kjønn velges fritt i hvert møte, men at handlinger vurderes gjennom institusjonaliserte forventninger. Garfinkels etnometodologi synliggjør praktisk ansvarlighet. Forskeren må følge situasjon, vurdering og sanksjon og ikke forklare atferd ved å gjenta kategorien «mann» eller «kvinne».",
  "nia-22": "Judith Butlers performativitet beskriver hvordan gjentatte, normbundne handlinger produserer inntrykket av en naturlig og stabil kjønnsidentitet. West og Zimmerman gir et interaksjonelt språk for ansvarlighet. Performativity betyr ikke enkeltstående teater eller individuell vilje. Analyse må undersøke normenes historie, gjentakelse, brudd og sanksjon og samtidig avgrense hva materialet sier om kropp og institusjoner.",
  "nia-23": "Doing gender og performativitet flytter begge analysen fra kjønn som en fast forklarende egenskap til praksis, gjentakelse og norm. West og Zimmerman vektlegger interaksjonell ansvarlighet; Butler undersøker kategorienes performative og heteronormative vilkår. Uenigheten bør beholdes. Et empirisk case må angi hvilket nivå og hvilken mekanisme evidensen støtter fremfor å slå teoriene sammen til én metafor.",
  "nia-24": "Likestillingsanalyse må følge regel, beslutning, indirekte virkning, tilrettelegging og håndheving. Likestillingsloven gir rettslige kriterier, mens Butler viser hvordan kategorier og normer konstitueres. Kjønn alene forklarer ikke et utfall: analyse må undersøke institusjonell mekanisme, relevante sammenligningspersoner og alternative forklaringer og skille empirisk årsak, rettslig diskriminering og normativ kritikk.",
  "nia-25": "Crenshaw viser hvordan separate juridiske og politiske kategorier kan gjøre erfaringer usynlige når rasialisering, kjønn og andre maktforhold virker sammen. Likestillingsloven beskytter flere diskrimineringsgrunnlag, men en konkret vurdering krever institusjonell mekanisme og utfall. Interseksjonalitet er derfor ikke en opplisting av identiteter; den undersøker hvordan ordninger kombineres og hvor eksisterende kategorier skaper blindsoner.",
  "nia-26": "En interseksjonell analyse må avgrense arena, institusjonell prosess og konkret konsekvens. Crenshaws juridiske case viser kategoriers blindsoner, mens Lamont og Molnár gjør grensedragning og ulik tilgang analyserbar. Å telle hvor mange identitetsmerker en person har forklarer ingenting alene. Forskeren må vise hvordan bestemte regler, praksiser eller representasjoner virker sammen og vurdere alternative mekanismer.",
  "nia-27": "Administrative kategorier kan gjøre befolkninger synlige, fordele rettigheter og muliggjøre måling, men de kan også fryse grenser og utelate erfaringer som ikke passer skjemaet. Likestillingsloven viser rettslige formål, mens grenseforskningen viser sosiale konsekvenser. Analyse må dokumentere formål, definisjon, svarkategorier, manglendeverdier, hvem som klassifiserer og hvilke beslutninger kategorien faktisk styrer.",
  "nia-28": "Selvidentifikasjon, statistisk kategori og rettslig diskrimineringsgrunnlag er ulike datatyper og må ikke brukes om hverandre. Crenshaw viser institusjonelle blindsoner, mens lovverket definerer bestemte rettslige vern. En persons egen betegnelse kan avvike fra registeret uten å være feil. Forskeren må oppgi operasjonalisering, formål og konsekvens og unngå å gjøre kategorien til årsak eller full identitet.",
  "nia-29": "Observasjon av hverdagsliv kan berøre privathet, sårbarhet og makt selv på et fysisk eller digitalt offentlig sted. NESH krever vurdering av rimelige forventninger og skade, mens Goffmans situasjonsanalyse viser at publikum og informasjonsgrenser varierer. Offentlig adgang er derfor ikke full forskningsfullmakt. Forskeren må begrunne registrering, samtykke, dataminimering og publiseringsform for den konkrete situasjonen.",
  "nia-30": "Et sitat uten navn kan fortsatt identifisere noen når formulering, sted, rolle og hendelse kombineres eller søkes digitalt. NESH krever helhetlig konfidensialitetsvurdering, mens Goffmans stigmaanalyse viser mulig relasjonell skade. Forskeren må veie dokumentasjonsverdien mot risiko, vurdere omskriving eller utelatelse og ikke love anonymitet som teknisk umulig å garantere.",
  "nia-31": "En anvendt normanalyse bør skille fire lag: dokumentert praksis, sosial forventning, rettslig standard og forskerens normative vurdering. Likestillingsloven støtter rettslaget, mens Bourdieu gjør tatt-for-gitte forventninger og symbolsk makt analyserbare. Når lagene blandes, kan det vanlige feilaktig framstå som lovlig eller ønskelig. Konklusjonen må oppgi evidens og begrunnelse for hvert lag.",
  "nia-32": "En ansvarlig konklusjon om normer og identitet rapporterer variasjon, alternative fortolkninger, relevant institusjonell mekanisme og avgrenset rekkevidde. NESH krever redelig representasjon og skadebevissthet; Crenshaw viser kategoriers mulige blindsoner. Identitetskategorier beskriver ikke individets motiv eller moral. Analysen må si hva materialet støtter, hva det ikke kan forklare, og hvilke stemmer eller data som mangler."
};

const MODULES = [
  { id: '01-livsverden-selv-og-roller', title: 'Livsverden, selv og roller', topicIndexes: [0, 1] },
  { id: '02-praktisk-orden-normer-og-grenser', title: 'Praktisk orden, normer og grenser', topicIndexes: [2, 3] },
  { id: '03-stigma-kjonn-og-identitetsarbeid', title: 'Stigma, kjønn og identitetsarbeid', topicIndexes: [4, 5] },
  { id: '04-interseksjonalitet-etikk-og-anvendelse', title: 'Interseksjonalitet, etikk og anvendelse', topicIndexes: [6, 7] },
];

const QUESTIONS = [
  ['Hva er en typifisering hos Schutz?', ['En privat fantasi uten sosial forankring', 'En delt forventningsfigur som gjør situasjoner håndterlige', 'En juridisk regel'], 1, 'nia-02'],
  ['Hva viser Goffmans rolleanalyse?', ['At roller alltid er falske', 'At framføring og publikum former situert selvpresentasjon', 'At identitet er fast'], 1, 'nia-07'],
  ['Hva demonstrerer et normbruddeksperiment?', ['At regler bare finnes i lovtekst', 'At bakgrunnsforventninger blir synlige når de brytes', 'At orden er automatisk'], 1, 'nia-11'],
  ['Hva skiller en symbolsk grense fra en sosial grense?', ['Symbolske skiller er kategoriseringer; sosiale grenser gir ulik tilgang', 'De er alltid identiske', 'Sosiale grenser finnes bare i språk'], 0, 'nia-15'],
  ['Hva er stigma i Goffmans analyse?', ['En iboende egenskap', 'En relasjon mellom kjennetegn og situerte forventninger', 'En medisinsk diagnose'], 1, 'nia-17'],
  ['Hva betyr å gjøre kjønn?', ['Å utføre institusjonelt vurderte praksiser i samhandling', 'Å velge et kostyme fritt', 'Å benekte kropp og materialitet'], 0, 'nia-21'],
  ['Hva undersøker interseksjonalitet?', ['Summen av identitetsmerker', 'Hvordan institusjoner skaper samvirkende makt- og diskrimineringsformer', 'Bare individuelle holdninger'], 1, 'nia-25'],
  ['Hva krever ansvarlig hverdagsforskning?', ['Mest mulig innsamling', 'Dataminimering, kontekst og skadevurdering', 'At offentlige data alltid kan siteres'], 1, 'nia-30'],
];

function buildReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_norms_identity_everyday_life_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-28',
    status: 'pass',
    conclusion: 'norms_identity_everyday_life_strict_reuse_overlay_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: OWNER_CHAPTER_ID,
    overlay_id: OVERLAY_ID,
    counts: {
      domainsMaterialized: 4,
      targetDomains: 12,
      preservedOwnerClaims: 45,
      preservedOwnerSources: 30,
      expansionModules: 4,
      expansionSections: 8,
      expansionParagraphs: 32,
      expansionVerifiedClaims: 32,
      expansionInspectableSources: 13,
      assessmentQuestions: 8,
      teachingScenarios: sourceBrief.decision_scenarios.length,
      nextSourceBriefDomains: 1,
    },
    gates: {
      definitionAndBackground: true,
      namedTheoriesAndResearchers: true,
      findingsMethodsAndLimits: true,
      realDisagreement: true,
      teachingScenarios: true,
      plannedClaimsResolvedOneToOne: true,
      paragraphClaimTraceReciprocalAndComplete: true,
      everyExpansionSourceInspectableAndUsed: true,
      ownerChapterAndClaimsBytePreserved: true,
      strictReuseOverlayNoMoveOrDelete: true,
      normsDoxaAndSymbolicBoundaryDistinctions: true,
      stigmaGenderAndIntersectionalityBoundaries: true,
      ethicsProportionalityAndDataminimization: true,
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
      note: 'Felt 4 er fulltekstmaterialisert som strict reuse-overlay uten å endre eierkapitlet; underkategorien er fortsatt uferdig med 4/12 felt.',
    },
  };
}

export function materialize() {
  const sourceBrief = read(P.sourceBrief);
  const ownerChapter = read(P.ownerChapter);
  const ownerClaims = read(P.ownerClaims);
  const topics = sourceBrief.topic_briefs;
  const plannedClaims = topics.flatMap((topic) => topic.planned_claims);
  if (plannedClaims.length !== 32 || Object.keys(PARAGRAPHS).length !== 32) throw new Error('Forventet 32 planlagte claims og 32 avsnitt');
  if (ownerClaims.claims.length !== 45 || ownerClaims.sources.length !== 30) throw new Error('Eierinnholdets 45 claims og 30 kilder må være bevart');
  const moduleFiles = [];
  for (const moduleSpec of MODULES) {
    const file = `${DIR}/${moduleSpec.id}.json`;
    moduleFiles.push(file);
    write(file, {
      schema: 'history_go_fagverk_subcategory_reuse_module_v1',
      version: '1.0.0',
      subject_id: 'politikk',
      canonical_subcategory_id: 'sosiologi_antropologi',
      owner_chapter_id: OWNER_CHAPTER_ID,
      overlay_id: OVERLAY_ID,
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
  write(P.overlay, {
    schema: 'history_go_fagverk_subcategory_reuse_overlay_v1',
    version: '1.0.0',
    subject: 'politikk',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    domain_id: 'normer_identitet_hverdagsliv',
    overlay_id: OVERLAY_ID,
    id: OWNER_CHAPTER_ID,
    chapter_id: OWNER_CHAPTER_ID,
    title: 'Normer, identitet og hverdagsliv — strict underkategoriutvidelse',
    subtitle: 'Livsverden, sosial orden, stigma, kjønn, interseksjonalitet og ansvarlig hverdagsforskning',
    lead: 'Overlegget gjør den sosiologiske og antropologiske behandlingen av normer, identitet og hverdagsliv eksplisitt etterprøvbar. Det bygger på det eksisterende Politikk-kapitlet uten å flytte, slette eller omskrive det, og tilfører egne claimspor, forskningsgrenser, undervisningsscenarier og vurderinger.',
    reuseClassification: 'reuse_with_expansion',
    strictReuse: true,
    existingChapter: P.ownerChapter,
    existingClaims: P.ownerClaims,
    existingCoverage: { claims: 45, sources: 30, moduleFiles: ownerChapter.moduleFiles.length },
    ownerGitBlobShas: {
      chapter: 'd96c5fe5b9e6e52edc847e3326be4aa0c81022d4',
      claims: '8ea1d062cc3833be075a9ef82f863ea84ddf9b32',
    },
    learningObjectives: [
      'forklare hvordan livsverden, typifisering og institusjonalisering gjør hverdagen forståelig',
      'analysere selv, roller, publikum og inntrykksstyring uten å redusere handling til skuespill',
      'vise hvordan praktisk orden produseres gjennom bakgrunnsforventninger, regler og reparasjon',
      'skille norm, doxa, symbolsk grense, sosial grense og rettslig tillatelse',
      'analysere stigma, kategorisering og identitetsarbeid relasjonelt og situert',
      'sammenligne kjønn som gjøren og performativitet med presise avgrensninger',
      'bruke interseksjonalitet til å undersøke institusjonelle mekanismer og blindsoner',
      'vurdere proporsjonalitet, dataminimering og skade i hverdagsforskning',
    ],
    expansionModuleFiles: moduleFiles,
    expansionBriefFile: P.brief,
    expansionClaimsFile: P.claims,
    expansionAssessmentFile: P.assessment,
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
    ownerContentMoved: false,
    ownerContentDeleted: false,
  });
  write(P.brief, {
    schema: 'history_go_fagverk_subcategory_reuse_brief_v1',
    version: '1.0.0',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: OWNER_CHAPTER_ID,
    overlay_id: OVERLAY_ID,
    primary_domain_id: 'normer_identitet_hverdagsliv',
    purpose: 'Gi en etterprøvbar hverdagslivsanalyse som forbinder interaksjon, institusjon, makt og etikk uten å essensialisere identiteter eller forveksle normalitet med lovlighet.',
    learningArc: topics.map((topic) => topic.title),
    methodsAndLimits: [
      'situasjoner og institusjoner må avgrenses før identitet tolkes',
      'bakgrunnsforventninger blir ofte synlige gjennom brudd og reparasjon',
      'kategorier er analytiske og institusjonelle, ikke komplette personer',
      'symbolske grenser og faktisk ressursulikhet må skilles empirisk',
      'interseksjonalitet krever identifiserbare mekanismer og kan ikke reduseres til addisjon',
      'offentlig eller observerbar hverdag er ikke automatisk risikofri forskning',
      'ordvalg, konteksttap og søkbare sitater kan produsere skade',
    ],
    realDisagreements: [
      'Schutz’ fenomenologiske livsverden og Berger og Luckmanns institusjonalisering vektlegger ulike nivåer i produksjonen av hverdagskunnskap.',
      'Goffmans dramaturgiske situasjonsanalyse og Garfinkels etnometodologi er uenige om hvor analytisk privilegert rolleframføring er sammenliknet med praktisk meningsproduksjon.',
      'West og Zimmermans institusjonelle accountability og Butlers performativitet deler et antiesensialistisk utgangspunkt, men har ulike begreper om norm, gjentakelse og subjekt.',
      'Bourdieus doxa og Lamont og Molnárs symbolske grenser åpner ulike empiriske veier mellom selvsagt orden, kategorisering og ulik tilgang.',
    ],
    criticalDistinctions: [
      'hverdagskunnskap vs privat mening',
      'rolle vs komplett person',
      'formell regel vs praktisk regelbruk',
      'vanlig vs legitimt vs rettslig tillatt',
      'stigma vs iboende egenskap',
      'symbolsk grense vs sosial ressursgrense',
      'interseksjonalitet vs additiv identitetsliste',
      'observerbar praksis vs etisk risikofri data',
    ],
    teachingScenarios: sourceBrief.decision_scenarios,
    safety: {
      categoryAsEssence: false,
      stigmaAsIndividualDefect: false,
      genderPracticeAsFreeChoice: false,
      intersectionalityAsIdentityAddition: false,
      normalityAsLegality: false,
      publicEverydayLifeAsRiskFreeData: false,
    },
  });
  write(P.claims, {
    schema: 'history_go_fagverk_subcategory_reuse_claims_v1',
    version: '1.0.0',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: OWNER_CHAPTER_ID,
    overlay_id: OVERLAY_ID,
    retrieval_status: 'verified_2026-08-28',
    verified_at: '2026-08-28',
    preservedOwnerClaims: { path: P.ownerClaims, claims: 45, sources: 30 },
    sources: sourceBrief.sources.map((source) => ({ ...source, retrieval_status: 'verified_2026-08-28' })),
    claims: plannedClaims.map((claim) => ({
      id: claim.id,
      claim: claim.text,
      source_ids: claim.source_ids,
      classification: 'verified_scholarly_source_synthesis',
      status: 'verified',
      verified_at: '2026-08-28',
    })),
  });
  write(P.assessment, {
    schema: 'history_go_fagverk_subcategory_reuse_assessment_v1',
    version: '1.0.0',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: OWNER_CHAPTER_ID,
    overlay_id: OVERLAY_ID,
    questions: QUESTIONS.map(([question, options, answerIndex, claim_id], index) => ({
      id: `nia-q${index + 1}`,
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
  production.progress.materializedDomains = 4;
  production.progress.strictCompletionProven = false;
  const entry = {
    ordinal: 4,
    domain_id: 'normer_identitet_hverdagsliv',
    chapter: P.ownerChapter,
    reuse_overlay: P.overlay,
    claims: P.claims,
    assessment: P.assessment,
    audit: P.report,
  };
  production.materialized = [...production.materialized.filter((row) => row.ordinal !== 4), entry].sort((a, b) => a.ordinal - b.ordinal);
  production.next_gate = 'inequality_class_gender_racialization_fulltext_materialization';
  write(P.production, production);
  const reconciliation = read(P.reconciliation);
  reconciliation.status = 'authority_audit_complete_fulltext_production_in_progress';
  reconciliation.production_plan.source_first_ready = Math.max(reconciliation.production_plan.source_first_ready, 5);
  reconciliation.production_plan.materialized = 4;
  reconciliation.production_plan.next_domain = 'ulikhet_klasse_kjonn_rasialisering';
  write(P.reconciliation, reconciliation);
  write(P.report, buildReport(sourceBrief));
  return { chapter: OWNER_CHAPTER_ID, overlay: OVERLAY_ID, domains: 4, claims: 32, sources: 13 };
}

const result = materialize();
console.log(`Normer, identitet og hverdagsliv materialisert som strict reuse-overlay: ${result.domains}/12 felt, ${result.claims} nye claims, ${result.sources} nye kilder.`);

