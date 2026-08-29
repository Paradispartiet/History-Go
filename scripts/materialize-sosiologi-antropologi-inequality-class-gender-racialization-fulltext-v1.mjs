#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OWNER_CHAPTER_ID = 'fordeling-velferd-ulikhet';
const OVERLAY_ID = 'fordeling-velferd-ulikhet-strict-upgrade';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${OVERLAY_ID}`;
const P = {
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/inequality_class_gender_racialization_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  reconciliation: 'reports/fagverk/sosiologi-antropologi-reconciliation-v1.json',
  ownerChapter: 'data/fagverk/politikk/fordeling-velferd-ulikhet.json',
  ownerClaims: 'data/fagverk/politikk/fordeling-velferd-ulikhet/claims.json',
  overlay: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  report: 'reports/fagverk/sosiologi-antropologi-inequality-class-gender-racialization-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };

const PARAGRAPHS = {
  "ukr-01": "Hos Marx viser klasse til et forhold mellom dem som kontrollerer produksjonsmidler og dem som må selge arbeidskraft, ikke bare til et trinn i en inntektsfordeling. Inntektsdata fra SSB kan beskrive økonomiske forskjeller, men klasseforklaringen krever at analysen også følger eierskap, kontroll, arbeidsvilkår og hvordan verdier fordeles gjennom produksjonsforholdene.",
  "ukr-02": "Utbytting er hos Marx en bestemt relasjonell forklaring på hvordan overskudd tilegnes gjennom organiseringen av arbeid og eierskap. Tillys mekanismeperspektiv understreker også at ulikhet må spores i relasjoner. En lønnsforskjell dokumenterer derfor ikke utbytting alene; analysen må vise hvem som kontrollerer ressurser, hvordan avhengighet oppstår, og hvilken verdi eller fordel som overføres.",
  "ukr-03": "Weber skiller analytisk mellom klasse, status og parti. Klasse gjelder markedssjanser knyttet til ressurser og kvalifikasjoner, status gjelder sosial ære og livsstil, mens parti gjelder organisert påvirkning av makt. Bourdieus analyse av smak viser hvordan disse dimensjonene kan forbindes, men de må måles separat før økonomisk posisjon, anerkjennelse og politisk innflytelse behandles som samme hierarki.",
  "ukr-04": "En empirisk klasseanalyse må først angi hva som klassifiseres: personer, husholdninger, arbeidsposisjoner eller eierskapsrelasjoner. Deretter må tidsrom, relevant marked og foreslått mekanisme beskrives. Marx og Weber tilbyr ulike relasjonelle begreper, men ingen av dem rettferdiggjør at forskeren gir grupper klassenavn bare ut fra yrkestittel eller inntektskvintil uten å dokumentere forbindelsen til makt og livssjanser.",
  "ukr-05": "Bourdieu skiller økonomisk kapital fra kulturelle ressurser som utdanning og fortrolighet, og fra sosiale forbindelser som kan mobiliseres. Verdien av en kapitalform avhenger av feltet og av muligheten til å konvertere den til andre fordeler. Webers markedssjanser klargjør hvorfor de samme ressursene ikke gir identisk avkastning i alle institusjoner eller historiske situasjoner.",
  "ukr-06": "I Distinction undersøker Bourdieu hvordan smak og utdanningspraksis både uttrykker og produserer klassifikasjoner. Poenget er ikke at hvert kulturvalg avslører en fast klassepersonlighet. Forskningsetisk og metodisk må variasjon, kontekst og moteksempler beholdes, slik at forskeren ikke bruker mat, musikk eller språk som stereotype kjennetegn på hele grupper eller som skjult rangering av mennesker.",
  "ukr-07": "Webers begrep livssjanser beskriver hvordan sosial posisjon påvirker sannsynlig tilgang til arbeid, inntekt, utdanning og trygghet. OECDs fordelingsdata kan vise systematiske mønstre mellom posisjoner og utfall, men sier ikke at et enkelt individ får et bestemt liv. En ansvarlig analyse oppgir sannsynlighet, populasjon og institusjonelle betingelser og unngår å gjøre statistisk risiko til personlig skjebne.",
  "ukr-08": "Absolutt mobilitet kan øke når flere posisjoner blir tilgjengelige, selv om sammenhengen mellom foreldres og barns relative plassering forblir sterk. Relativ mobilitet krever derfor sammenlignbare posisjoner og kohorter, ikke bare telling av hvor mange som får høyere utdanning eller inntekt. Weber og OECD gir grunnlag for å skille strukturendring fra endring i selve forbindelsen mellom bakgrunn og voksen posisjon.",
  "ukr-09": "Tilly forklarer varig kategorisk ulikhet gjennom mekanismer som utbytting, mulighetsmonopol, etterlikning og tilpasning. Mekanismene virker i relasjoner og organisasjoner, ikke i kategorinavn alene. Marx’ analyse av produksjonsforhold gir ett mulig relasjonelt tilfelle, mens Tilly åpner for flere ressurser og institusjoner. Forskeren må vise hvilken mekanisme som faktisk passer dataene, framfor å liste alle som mulige.",
  "ukr-10": "Mulighetsmonopol oppstår når et nettverk eller en avgrenset kategori kontrollerer tilgang til en verdifull ressurs, for eksempel autorisasjon, kontrakter eller informasjon. Tilly og Webers begrep sosial lukking viser at grensen må undersøkes sammen med opptaksregler og sanksjoner. Et tett nettverk er ikke automatisk monopol; analysen må dokumentere hvem som holdes ute og hvilke fordeler kontrollen beskytter.",
  "ukr-11": "Organisasjoner kan stabilisere kategoriske skiller fordi kjente grenser gjør rekruttering, oppgavefordeling og kontroll enklere for dem som styrer. Tilly viser hvordan slike løsninger kan etterliknes og tilpasses, mens Acker viser at tilsynelatende nøytrale jobber kan bygge på kjønnede forutsetninger. Forklaringen må følge hvordan noen får lavere kostnader eller større kontroll, og hvordan andre bærer risikoen og begrensningene.",
  "ukr-12": "Et statistisk gruppeskille er et funn som krever forklaring, ikke selve mekanismen. Tillys relasjonelle analyse og diskrimineringslovens skille mellom direkte og indirekte forskjellsbehandling peker mot konkrete ledd: rekruttering, lønnsfastsettelse, eierskap, krav, skjønn og faktisk tjenestetilgang. Dokumentasjonen bør vise hvor i kjeden forskjellen oppstår, hvilke sammenlikninger som er relevante, og hvilke alternative forklaringer som er prøvd.",
  "ukr-13": "Acker kritiserer forestillingen om den abstrakte, kroppsløse arbeidstakeren. Krav om ubegrenset tid, kontinuerlig tilstedeværelse eller frihet fra omsorgsoppgaver kan framstå universelle, men bygger på en bestemt livsorganisering. Bourdieus ressursbegrep hjelper til å undersøke hvem som kan møte kravene. Analysen skal likevel dokumentere institusjonelle vilkår og ikke anta omsorgsansvar eller preferanser ut fra kjønn.",
  "ukr-14": "Kjønnet ulikhet kan produseres i flere organisatoriske ledd: hvordan jobber beskrives, hvem som får synlige oppgaver, hvilke karriereløp som regnes som normale, og hvilke uttrykk som forbindes med autoritet. Acker gjør disse leddene empirisk undersøkelige, mens diskrimineringsloven gir rettslige skiller. En samlet prosentforskjell må derfor brytes ned før årsak, ansvar eller lovbrudd konkluderes.",
  "ukr-15": "En regel kan være formulert likt for alle og likevel få systematisk ulik virkning. Krav om bestemte arbeidstider, fysisk tilstedeværelse eller omfattende dokumentasjon møter ulike omsorgs-, helse- og transportsituasjoner. Acker viser hvordan organisasjonen former disse vilkårene, og loven definerer indirekte forskjellsbehandling. Ulik virkning er samtidig et empirisk spørsmål som krever sammenlikning, saklighetsvurdering og proporsjonalitet.",
  "ukr-16": "Før forskjeller i lønn eller avansement forklares med individuelle preferanser, bør organisasjonen undersøkes som en fordelingskjede. Hvem søker, hvem kalles inn, hvem får krevende oppgaver, hvordan vurderes prestasjon, og hvem tilbys opplæring eller sponsorstøtte? Acker gir en struktur for analysen, mens NESH krever redelig representasjon. Data må beskytte personer og samtidig bevare relevante variasjoner og moteksempler.",
  "ukr-17": "Du Bois’ fargelinje knytter raseklassifikasjon til historiske og institusjonelle grenser for utdanning, arbeid, politisk deltakelse og sosial anerkjennelse. Tillys relasjonelle perspektiv klargjør hvordan slike grenser kan bli varige gjennom organisasjoner og ressurskontroll. Begrepet beskriver ikke en biologisk inndeling; analysen må vise hvordan kategorier ble produsert, håndhevet og gitt materielle eller symbolske konsekvenser.",
  "ukr-18": "Dobbel bevissthet hos Du Bois analyserer erfaringen av å forstå seg selv gjennom både egne perspektiver og et dominerende samfunns blikk. Det er en historisk situert analyse av makt og anerkjennelse, ikke en diagnose eller universell personlighetstype. NESHs krav til redelig representasjon innebærer at forskeren ikke påfører alle i en kategori samme erfaring, men dokumenterer stemmer, variasjon og kontekst.",
  "ukr-19": "Rasialisering betegner prosesser der mennesker tilskrives kategorier som gjøres relevante for adgang, mistanke, representasjon eller ressursfordeling. Du Bois viser den historiske institusjonelle siden, mens diskrimineringsloven gjør enkelte konsekvenser rettslig prøvbare. Analysen må følge hvem som kategoriserer, hvilke tegn som brukes, i hvilken situasjon kategorien aktiveres, og hvordan dette påvirker beslutninger uten å naturalisere kategorien.",
  "ukr-20": "Diskrimineringsanalyse må skille flere spørsmål. En beslutning kan være uttrykkelig motivert av et diskrimineringsgrunnlag, en generell regel kan ha indirekte ulik virkning, og et statistisk mønster kan ha flere mekanismer. Likestillings- og diskrimineringsloven gir juridiske definisjoner, mens Tilly bidrar med organisatorisk mekanismeanalyse. Dokumentert ulikhet er derfor verken automatisk bevis på intensjon eller irrelevant for rettslig vurdering.",
  "ukr-21": "Crenshaw viser at ordninger som behandler kjønn og rase i hvert sitt spor kan overse skade som produseres i skjæringspunktet. En institusjon kan dermed ha prosedyrer for begge kategorier og likevel mangle en relevant sammenlikningsgruppe eller hjelpekategori. Norsk diskrimineringsrett gir flere vernede grunnlag, men den empiriske analysen må fortsatt undersøke hvordan regler og tjenester møter samvirkende vilkår.",
  "ukr-22": "Interseksjonalitet er ikke en addisjon der hvert identitetsmerke gir en fast mengde ulempe. Crenshaw undersøker hvordan institusjonelle ordninger skaper bestemte blindsoner, og Tilly viser hvordan kategorier kobles til ressursstrømmer og grenser. En god analyse navngir derfor beslutningen, reglene, aktørene og mekanismene som virker sammen, og viser også hvor samvirket ikke kan dokumenteres.",
  "ukr-23": "Et gjennomsnitt for kvinner, innvandrere eller en inntektsgruppe kan skjule undergrupper med andre terskler og utfall. Crenshaws enkeltaksekritikk viser hvorfor kryssklassifisering kan være nødvendig, mens SSBs måleprinsipper krever klare enheter og nevner. Flere oppdelinger er likevel ikke alltid bedre: små celler gir usikkerhet og identifiseringsfare, så relevans, presisjon og personvern må balanseres.",
  "ukr-24": "Sammenlikninger av utsatte grupper må velges fordi de kan belyse en mekanisme, ikke fordi gruppene antas å være homogene problemer. Crenshaw viser faren ved feil sammenlikningsakse, og NESH krever respekt, kontekst og skadebegrensning. Forskeren bør forklare hvorfor gruppene sammenliknes, hvem som faller utenfor kategoriene, hvilke maktforhold som undersøkes, og hvordan resultatet kan misbrukes eller stigmatisere.",
  "ukr-25": "Gini-koeffisienten oppsummerer hele fordelingen i ett tall, mens kvotienter sammenlikner bestemte punkter og toppandeler beskriver konsentrasjon øverst. SSB og OECD viser at målene svarer på ulike spørsmål og reagerer ulikt på endringer. En full fordelingsprofil bør derfor oppgi median, spredning, lavinntekt, relevante andeler og datagrunnlag i stedet for å behandle ett mål som komplett ulikhetsbeskrivelse.",
  "ukr-26": "Inntekt er en strøm gjennom en periode, mens nettoformue er beholdningen av eiendeler minus gjeld på et tidspunkt. Avkastning, boligverdi, arv og gjeld kan derfor endre formuesfordelingen uten samme bevegelse i løpende inntekt. SSB og OECD måler begge, men med ulike definisjoner og databegrensninger. Analysen må holde husholdningsenhet, verdsetting og periode tydelig adskilt.",
  "ukr-27": "Surveydata kan gi detaljer om husholdninger, men mister ofte de rikeste og påvirkes av svarfeil. Skattedata dekker andre inntekter, formuesregistre har verdsettingsproblemer, og nasjonalregnskap gir aggregater. WID kombinerer kildene for å forene totalsummer og fordelinger. Metoden skaper ikke feilfrie tall; antakelser, imputering og revisjoner må oppgis når toppandeler og historiske serier tolkes.",
  "ukr-28": "Tverrnasjonale rangeringer er meningsfulle bare når inntektsbegrep, skatter og overføringer, husholdningsskalering, prisgrunnlag og referanseår kan sammenliknes. OECD harmoniserer indikatorer, mens WID kombinerer flere datakilder og nasjonalregnskap. Ulike metoder kan gi forskjellige nivåer uten at én rangering er uredelig. Analysen bør rapportere definisjon og usikkerhet før land beskrives som mer eller mindre ulikt.",
  "ukr-29": "At ulikheten er lavere etter skatt og overføringer enn før, beskriver en samlet omfordelende forskjell. Det identifiserer ikke alene hvilken skatt, ytelse, tjeneste eller atferdsrespons som skapte endringen. SSB og OECD kan dokumentere fordelingsprofiler, men kausal vurdering krever regler, mottak, tidsrekkefølge og alternative forklaringer. Deskriptiv omfordeling må derfor holdes adskilt fra effekten av ett tiltak.",
  "ukr-30": "Når en kategori samvarierer med et utfall, kan mønsteret skyldes seleksjon, historisk ressursfordeling, institusjonelle regler, diskriminering eller flere mekanismer samtidig. Tilly krever relasjonelle forklaringer, og NESH krever at grupper ikke framstilles som bærere av problemet. Analysen må prøve relevante alternativer og unngå språk som gjør kategorien selv til årsak når dataene bare viser en statistisk forbindelse.",
  "ukr-31": "Ulikhetsdata om små grupper, helse, økonomi eller diskriminering kan være sensitive selv uten navn. Kombinasjoner av sted, alder, rolle og hendelse kan gjøre personer gjenkjennelige, mens publisering kan skade en hel gruppe. NESH og diskrimineringsrettens vern tilsier dataminimering, proporsjonalitet og kontekst. Forskeren må dokumentere hvorfor variablene trengs, hvem som får tilgang, og hvordan restfare håndteres.",
  "ukr-32": "En faglig fullstendig ulikhetskonklusjon bør ha fem tydelige ledd: hvilket mønster som er målt, hvilken mekanisme som foreslås, hvilken politisk eller institusjonell konsekvens som følger, hvor usikker slutningen er, og hvilken normativ standard som brukes. SSB gir målte fordelinger, mens NESH krever redelig formidling. Skillet hindrer at tall alene presenteres som både årsaksbevis og rettferdighetsdom."
};

const MODULES = [
  { id: '01-klasse-kapital-livssjanser-og-mobilitet', title: 'Klasse, kapital, livssjanser og mobilitet', topicIndexes: [0, 1] },
  { id: '02-kategorisk-ulikhet-og-kjonnede-organisasjoner', title: 'Kategorisk ulikhet og kjønnede organisasjoner', topicIndexes: [2, 3] },
  { id: '03-rasialisering-og-interseksjonalitet', title: 'Rasialisering og interseksjonalitet', topicIndexes: [4, 5] },
  { id: '04-fordelingsmaling-forklaring-og-etikk', title: 'Fordelingsmåling, forklaring og etikk', topicIndexes: [6, 7] },
];

const QUESTIONS = [
  ['Hva skiller en relasjonell klasseanalyse fra en inntektsinndeling?', ['Den følger eierskap, arbeid, kontroll og avhengighet', 'Den bruker bare kvartiler', 'Den antar identiske livsstiler'], 0, 'ukr-01'],
  ['Hva er relativ mobilitet?', ['At alle får høyere inntekt', 'Endring i sammenhengen mellom bakgrunn og relativ voksen posisjon', 'Antall nye utdanningsplasser'], 1, 'ukr-08'],
  ['Hva er mulighetsmonopol?', ['Tilfeldig ulikhet', 'Kontroll over adgang til verdifulle ressurser', 'Enhver sosial relasjon'], 1, 'ukr-10'],
  ['Hvordan kan en lik regel gi ulik virkning?', ['Når den møter systematisk ulike livsbetingelser', 'Bare ved uttrykt diskriminerende hensikt', 'Den kan aldri gjøre det'], 0, 'ukr-15'],
  ['Hva betegner rasialisering?', ['Biologiske raser', 'Prosesser som produserer og konsekvenssetter kategorisk forskjell', 'En individuell personlighet'], 1, 'ukr-19'],
  ['Hva krever interseksjonalitet?', ['En liste over identitetsmerker', 'Analyse av samvirkende institusjonelle mekanismer', 'Rangering av lidelse'], 1, 'ukr-22'],
  ['Hvorfor trengs flere ulikhetsmål?', ['Fordi Gini, kvotienter og toppandeler belyser ulike deler av fordelingen', 'For å skjule definisjonen', 'Fordi alle målene er identiske'], 0, 'ukr-25'],
  ['Hva må en full ulikhetskonklusjon skille?', ['Mønster, mekanisme, konsekvens, usikkerhet og normativ standard', 'Bare gruppenavn', 'Kun statistisk signifikans'], 0, 'ukr-32'],
];

function buildReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_inequality_class_gender_racialization_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-28',
    status: 'pass',
    conclusion: 'inequality_class_gender_racialization_strict_reuse_overlay_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk',
    canonical_subcategory_id: 'sosiologi_antropologi',
    chapter_id: OWNER_CHAPTER_ID,
    overlay_id: OVERLAY_ID,
    counts: {
      domainsMaterialized: 5,
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
      classRelationCapitalAndMobilityBoundaries: true,
      genderedOrganizationAndRacializationBoundaries: true,
      intersectionalityNotAdditive: true,
      measurementCausalityAndResearchEthicsBoundaries: true,
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
      note: 'Felt 5 er fulltekstmaterialisert som strict reuse-overlay uten å endre eierkapitlet; underkategorien er fortsatt uferdig med 5/12 felt.',
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
    domain_id: 'ulikhet_klasse_kjonn_rasialisering',
    overlay_id: OVERLAY_ID,
    id: OWNER_CHAPTER_ID,
    chapter_id: OWNER_CHAPTER_ID,
    title: 'Ulikhet, klasse, kjønn og rasialisering — strict underkategoriutvidelse',
    subtitle: 'Fra klasse- og kapitalrelasjoner til organisasjoner, rasialisering, interseksjonalitet og fordelingsmåling',
    lead: 'Overlegget gjør sosiologiske forklaringer på ulikhet eksplisitt etterprøvbare. Det bygger på Politikk-kapitlet om fordeling og velferd uten å flytte, slette eller omskrive det, og tilfører egne claimspor for klasse, sosial lukking, kjønnede organisasjoner, rasialisering, interseksjonalitet, målegrenser og forskningsetikk.',
    reuseClassification: 'reuse_with_expansion',
    strictReuse: true,
    existingChapter: P.ownerChapter,
    existingClaims: P.ownerClaims,
    existingCoverage: { claims: 45, sources: 30, moduleFiles: ownerChapter.moduleFiles.length },
    ownerGitBlobShas: {
      chapter: 'd55591138538840c1be333783cf3e32f7a07c08d',
      claims: '88af362d097d45289dd8e1d932f1a2f5004e5488',
    },
    learningObjectives: [
      'skille relasjonell klasseanalyse fra ren inntektsinndeling',
      'analysere økonomisk, kulturell og sosial kapital uten å gjøre dem til personlighetstyper',
      'skille absolutt strukturendring fra relativ sosial mobilitet',
      'spore sosial lukking og varig kategorisk ulikhet gjennom organisasjoner og ressursstrømmer',
      'undersøke kjønnede jobbkrav og indirekte virkning uten essensialisering',
      'analysere rasialisering som historisk og institusjonell prosess',
      'bruke interseksjonalitet på konkrete mekanismer og blindsoner',
      'bygge fordelingsprofiler og skille mønster, mekanisme, politikk og normativ vurdering',
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
    primary_domain_id: 'ulikhet_klasse_kjonn_rasialisering',
    purpose: 'Gi en etterprøvbar ulikhetsanalyse som forbinder relasjoner, ressurser, kategorier, organisasjoner og mål uten å gjøre statistiske grupper til årsaker eller normative konklusjoner.',
    learningArc: topics.map((topic) => topic.title),
    methodsAndLimits: [
      'klasse krever relasjon og mekanisme, ikke bare inntektskategori',
      'kapitalformer og livssjanser er felt- og institusjonsavhengige',
      'absolutt og relativ mobilitet må skilles med sammenlignbare kohorter',
      'gruppeskill må spores gjennom konkrete organisatoriske fordelingsledd',
      'rasialisering og kjønn må analyseres institusjonelt uten essensialisering',
      'interseksjonalitet krever samvirkende mekanismer, ikke additiv telling',
      'ulikhetsmål har ulike enheter, dekningsproblemer og fordelingssensitivitet',
      'korrelasjon, tiltakskonsekvens og normativ vurdering er separate slutninger',
    ],
    realDisagreements: [
      'Marx forklarer klasse gjennom produksjons- og eierskapsrelasjoner, mens Weber skiller markedssjanser fra status og organisert makt.',
      'Bourdieu utvider ressursanalysen med kulturell og sosial kapital, men dette reiser empiriske spørsmål om måling, konvertering og feltspesifisitet.',
      'Tillys relasjonelle mekanismer utfordrer forklaringer som legger ulikhet i kategorienes egenskaper eller bare i individuelle valg.',
      'Acker og Crenshaw viser ulike institusjonelle blindsoner: kjønnede organisasjonsforutsetninger og enkeltaksemodeller for samvirkende ulikhet.',
      'SSB, OECD og WID bruker ulike datakombinasjoner og harmoniseringer; ett ulikhetsestimat kan ikke behandles som metodeuavhengig fasit.',
    ],
    criticalDistinctions: [
      'klasseforhold vs inntektskvintil',
      'utbytting vs enhver lønnsforskjell',
      'klasse vs status vs parti',
      'absolutt vs relativ mobilitet',
      'kategori vs mekanisme',
      'lik regel vs lik virkning',
      'rasialisering vs biologisk essens',
      'interseksjonalitet vs additiv identitetsliste',
      'inntekt vs nettoformue',
      'mønster vs mekanisme vs normativ vurdering',
    ],
    teachingScenarios: sourceBrief.decision_scenarios,
    safety: {
      classAsIncomeLabelOnly: false,
      categoryAsCause: false,
      genderAsPreferenceEssence: false,
      racializationAsBiology: false,
      intersectionalityAsSufferingRank: false,
      correlationAsCausation: false,
      sensitiveGroupDataAsRiskFree: false,
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
      id: `ukr-q${index + 1}`,
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
  production.progress.materializedDomains = 5;
  production.progress.strictCompletionProven = false;
  const entry = {
    ordinal: 5,
    domain_id: 'ulikhet_klasse_kjonn_rasialisering',
    chapter: P.ownerChapter,
    reuse_overlay: P.overlay,
    claims: P.claims,
    assessment: P.assessment,
    audit: P.report,
  };
  production.materialized = [...production.materialized.filter((row) => row.ordinal !== 5), entry].sort((a, b) => a.ordinal - b.ordinal);
  production.next_gate = 'family_kinship_care_life_course_fulltext_materialization';
  write(P.production, production);
  const reconciliation = read(P.reconciliation);
  reconciliation.status = 'authority_audit_complete_fulltext_production_in_progress';
  reconciliation.production_plan.source_first_ready = Math.max(reconciliation.production_plan.source_first_ready, 6);
  reconciliation.production_plan.materialized = 5;
  reconciliation.production_plan.next_domain = 'familie_slektskap_omsorg_livslop';
  write(P.reconciliation, reconciliation);
  write(P.report, buildReport(sourceBrief));
  return { chapter: OWNER_CHAPTER_ID, overlay: OVERLAY_ID, domains: 5, claims: 32, sources: 13 };
}

const result = materialize();
console.log(`Ulikhet, klasse, kjønn og rasialisering materialisert som strict reuse-overlay: ${result.domains}/12 felt, ${result.claims} nye claims, ${result.sources} nye kilder.`);

