#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'felt-og-institusjon';
const CHAPTER_DIR = `data/fagverk/kunst/${CHAPTER_ID}`;
const CHAPTER_FILE = `data/fagverk/kunst/${CHAPTER_ID}.json`;
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const writeJson = (p, value) => {
  fs.mkdirSync(path.dirname(abs(p)), { recursive: true });
  fs.writeFileSync(abs(p), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_kunst_institusjoner_kanon',
  'em_kunst_okonomi_og_finansiering',
  'em_kunst_utdanning_og_rekruttering',
  'em_kunst_distribusjon_og_plattformisering'
];

const methodIds = [
  'met_kunst_institusjonsanalyse',
  'met_kunst_feltanalyse',
  'met_kunst_kuratorisk_analyse',
  'met_kunst_kritikk_og_diskursanalyse',
  'met_kunst_kanon_og_arkivanalyse',
  'met_kunst_komparativ_institusjonsanalyse',
  'met_kunst_digital_sirkulasjonsanalyse',
  'met_kunst_plattformanalyse',
  'met_kunst_resepsjonsanalyse'
];

const relatedPlaces = [
  { id: 'nasjonalmuseet', name: 'Nasjonalmuseet', role: 'Undersøk samling, innkjøp, katalogisering, utstilling og digital tilgjengeliggjøring som separate institusjonelle operasjoner.' },
  { id: 'kunstnernes_hus', name: 'Kunstnernes Hus', role: 'Undersøk kunstnerstyring, juryering og ikke-kommersiell visningspraksis gjennom institusjonens egen historie.' },
  { id: 'unge_kunstneres_samfund', name: 'Unge Kunstneres Samfund (UKS)', role: 'Sammenlign rollen som kunstnerstyrt visningssted med rollen som politisk medlemsorganisasjon.' },
  { id: 'munch_museet', name: 'MUNCH', role: 'Følg samling, digital verkskatalog, metadata og reproduksjonsvilkår som ulike distribusjonsledd.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'kunst',
  subject_id: 'kunst',
  id: CHAPTER_ID,
  chapter_id: CHAPTER_ID,
  primary_domain_id: 'felt_institusjon',
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  emne_ids: emneIds,
  method_ids: methodIds,
  title: 'Felt og institusjon: hvem gjør kunst synlig, varig og legitim?',
  subtitle: 'Fra samling, finansiering og utdanning til utstilling, katalog og digital plattform',
  lead: 'Kunstfeltet består ikke bare av verk og kunstnere. Museer, kunstnerstyrte hus, støtteordninger, utdanninger, juryer, arkiver og digitale kataloger velger hva som blir kjøpt, vist, finansiert, undervist, søkbart og bevart. Kapittelet lærer brukeren å dokumentere disse beslutningskjedene uten å gjøre institusjonell synlighet til et automatisk bevis på kvalitet eller varig kanonstatus.',
  learningObjectives: [
    'forklare hvordan samling, katalogisering, kuratering, utstilling og forskning virker som forskjellige institusjonelle operasjoner',
    'analysere kanondannelse som en historisk beslutningskjede framfor en tidløs liste over de beste verkene',
    'skille statlig museum, kunstnerstyrt visningssted, medlemsorganisasjon, støtteforvalter og kunstutdanning som ulike institusjonstyper',
    'skille prosjektstøtte fra arbeidsstipend og tildeling fra dokumentert kunstnerisk effekt',
    'undersøke opptak og rekruttering gjennom eksplisitte kriterier, portefølje, komité og dokumentert praksis',
    'analysere fysisk og digital distribusjon gjennom utvalg, metadata, søkegrensesnitt, lisens og plattformlogikk',
    'bruke institusjonsanalyse, feltanalyse, kuratorisk analyse, arkivanalyse og digital sirkulasjonsanalyse på konkrete Oslo-case',
    'skrive en etterprøvbar evidenskjede fra institusjonell handling til kilde, dato, aktør og avgrenset konklusjon'
  ],
  diagnosticQuestions: [
    { question: 'Betyr et museumsinnkjøp at verket nå er en varig del av kanon?', answer: 'Nei. Innkjøpet dokumenterer en institusjonell beslutning. Varig kanonstatus krever et lengre mønster av bevaring, visning, forskning, undervisning, kritikk og resepsjon.' },
    { question: 'Er prosjektstøtte og arbeidsstipend samme type finansiering?', answer: 'Nei. Prosjektstøtte er knyttet til et avgrenset tiltak, mens arbeidsstipend skal gi tid til kunstnerisk arbeid og utvikling over en angitt periode.' },
    { question: 'Beviser opptak ved en kunstutdanning at søkeren vil lykkes i kunstfeltet?', answer: 'Nei. Opptaket dokumenterer at en komité vurderte søkeren mot institusjonens kriterier på et bestemt tidspunkt, ikke senere karriere eller kunstnerisk verdi.' },
    { question: 'Er et verk tilgjengelig bare fordi posten finnes i en digital katalog?', answer: 'Ikke nødvendigvis. Metadata, bildekvalitet, søkbarhet, rettigheter, språk og grensesnitt avgjør hva brukeren faktisk kan finne og bruke.' }
  ],
  relatedPlaces,
  moduleFiles: [
    `${CHAPTER_DIR}/01-grunnlag.json`,
    `${CHAPTER_DIR}/02-fordypning.json`,
    `${CHAPTER_DIR}/03-anvendelse.json`
  ],
  briefFile: `${CHAPTER_DIR}/brief.json`,
  claimsFile: `${CHAPTER_DIR}/claims.json`
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'kunst',
  chapter_id: CHAPTER_ID,
  primary_domain_id: 'felt_institusjon',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere det første canonicale Kunst-domenet med kildebelagt undervisning i institusjoner, kanon, finansiering, utdanning, rekruttering, distribusjon og plattformisering.',
  audience: 'Brukere som skal kunne følge hvordan kunst blir valgt, finansiert, undervist, vist, katalogisert og distribuert uten å forveksle institusjonell beslutning med objektiv kvalitet eller dokumentert virkning.',
  learningArc: [
    'begynne med museets samfunnsoppdrag og bryte samlingsarbeidet ned i konkrete operasjoner',
    'følge hvordan innkjøp, katalog, utstilling og forskning kan bidra til kanondannelse over tid',
    'sammenligne statlig museum med kunstnerstyrte og medlemsbaserte institusjoner',
    'skille prosjektstøtte, arbeidsstipend, marked og egenfinansiering som ulike økonomiske mekanismer',
    'undersøke fagutdanning og opptak som dokumenterte rekrutteringsporter',
    'analysere utstilling, arkiv, digital katalog, metadata og lisens som distribusjonsinfrastruktur',
    'avslutte med en komparativ institusjonsmatrise for fire canonicale Oslo-steder'
  ],
  requiredEmneIds: emneIds,
  requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'institusjonell synlighet vs kunstnerisk kvalitet',
    'innkjøp vs varig kanonisering',
    'samling vs utstilling',
    'katalogpost vs full tilgjengelighet',
    'museum vs kunstnerstyrt visningssted',
    'medlemsorganisasjon vs offentlig forvaltningsorgan',
    'prosjektstøtte vs arbeidsstipend',
    'tildeling vs dokumentert effekt',
    'faglig komitévurdering vs objektiv rangering',
    'utdanning vs dokumentert kunstnerisk praksis',
    'opptak vs senere karriereutfall',
    'digitalisering vs plattformnøytral distribusjon',
    'metadatafelt vs selve kunstverket',
    'fri visning vs fri kommersiell gjenbruk',
    'nåværende institusjonspolitikk vs historisk praksis'
  ],
  sourceStrategy: {
    priority: [
      'Nasjonalmuseet og MUNCH for samfunnsoppdrag, samlingsarbeid, katalog og digital tilgjengeliggjøring',
      'Kunstnernes Hus og UKS for kunstnerstyrte institusjoners egen dokumenterte organisering og historie',
      'Kulturdirektoratet for gjeldende støtteordninger, søkergrupper, faglig behandling og stipendformål',
      'Kunsthøgskolen i Oslo for studieprogram, opptakskrav og komitébasert vurdering',
      'canonical Kunst-filer som emne-, metode- og progresjonsstyring, aldri som ekstern faktakilde'
    ],
    minimumExternalSources: 15,
    claimLevelTrace: true,
    sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'museumssamling, innkjøp, katalogisering, kuratering, forskning og formidling',
      'kanondannelse som historisk og institusjonell prosess',
      'kunstnerstyrte institusjoner og medlemsorganisasjoner',
      'prosjektstøtte og Statens kunstnerstipend',
      'kunstutdanning, porteføljevurdering, opptakskomité og dokumentert praksis',
      'utstilling, digital samling, søk, metadata, reproduksjon og lisens',
      'Nasjonalmuseet, Kunstnernes Hus, UKS og MUNCH som canonicale stedscase'
    ],
    excluded: [
      'rangering av enkeltkunstnere eller verk som objektivt best',
      'innkjøp, stipend eller opptak presentert som endelig kvalitetsbevis',
      'antakelser om juryens interne begrunnelse uten vedtak eller publisert dokumentasjon',
      'søkertall eller tildelingstall brukt uten årstall og aktuell kilde',
      'digital katalogpost presentert som identisk med fysisk møte med verket',
      'plattformalgoritmer tillagt effekt uten data om sortering, eksponering eller bruk',
      'institusjonens egen formålsbeskrivelse presentert som uavhengig dokumentasjon av faktisk effekt',
      'historiske organisasjonsformer presentert som dagens styringsmodell uten kontroll'
    ]
  },
  qa: {
    threeEditedModules: true,
    workedExamples: true,
    misconceptions: true,
    applicationTasks: true,
    selfCheck: true,
    canonicalPlaces: true,
    inspectableSources: true,
    paragraphLevelClaims: true,
    permanentAudit: true,
    exactFourOfFourEmneCoverage: true,
    ownerDomainGate: true,
    institutionalVisibilityQualityGuard: true,
    awardEffectGuard: true,
    admissionOutcomeGuard: true,
    digitizationAccessGuard: true,
    currentPolicyDateGuard: true
  }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('kfi-grunnlag-1', 'Institusjonen som beslutningskjede', [
        'En kunstinstitusjon gjør flere ting samtidig: den kan samle, bevare, forske, katalogisere, stille ut og formidle. Nasjonalmuseet beskriver samfunnsoppdraget sitt nettopp som å utvikle, forvalte, forske på, tilgjengeliggjøre og formidle Norges største samling av kunst, arkitektur og design. Institusjonsanalyse begynner derfor med å skille disse verbene, ikke med å omtale museet som én samlet portvokter.',
        'Nasjonalmuseet fikk navnet sitt da Nasjonalgalleriet, Arkitekturmuseet, Kunstindustrimuseet og Museet for samtidskunst ble slått sammen i 2003. Den sammensatte historien viser at en nasjonal samling allerede består av ulike fagtradisjoner, materialgrupper og eldre institusjonelle valg.',
        'Et innkjøp føyer et objekt til samlingen, men verket kan senere være magasinert, digitalisert, forsket på eller vist i skiftende sammenhenger. For å hevde at et verk har fått sterkere kanonposisjon, må analysen derfor dokumentere flere ledd og et tidsforløp, ikke bare inventarnummeret.'
      ], [['kfi-01'], ['kfi-02'], ['kfi-03', 'kfi-04']], [
        'Bryt institusjonen ned i konkrete handlinger og beslutninger.',
        'Et innkjøp er nødvendig evidens for samlingsstatus, men utilstrekkelig evidens for varig kanonisering.'
      ], [['kfi-01'], ['kfi-03', 'kfi-04']]),
      section('kfi-grunnlag-2', 'Kanon blir produsert over tid', [
        'Nasjonalmuseet beskriver samlingsutvikling som et hovedoppdrag med særlig vekt på det norske og med internasjonale verk som har betydning for samlingen. Det betyr at innkjøp er målrettede faglige valg i forhold til et eksisterende materiale, ikke et nøytralt speil av all kunst som lages.',
        'Katalogen gjør noen av valgene etterprøvbare gjennom opplysninger om kunstner, datering, materiale, ervervelse, eier og utstillingshistorikk. Samtidig omtaler museet katalogen som en levende ressurs. Registrering er derfor både dokumentasjon og pågående kunnskapsarbeid; felt kan endres når forskning eller språkbruk revideres.',
        'Kuratorisk analyse undersøker neste ledd: hvilke verk som faktisk settes sammen, i hvilken rekkefølge, under hvilken tittel og med hvilke tekster. Et magasinert verk, en søkbar katalogpost og et verk i en sentral samlingssal har tre ulike former for synlighet selv om alle tilhører samme samling.'
      ], [['kfi-03'], ['kfi-04', 'kfi-15'], ['kfi-01', 'kfi-15']], [
        'Kanon må studeres som gjentatte valg om samling, beskrivelse, visning, forskning og undervisning.',
        'Samlingsstatus, digital søkbarhet og utstillingsplassering er forskjellige evidenstyper.'
      ], [['kfi-03', 'kfi-04'], ['kfi-15']]),
      section('kfi-grunnlag-3', 'Statlig, kunstnerstyrt og medlemsbasert', [
        'Kunstnernes Hus beskriver seg som Norges eldste kunstnerstyrte institusjon, stiftet og bygget av norske kunstnere og i drift som ikke-kommersielt visningssted siden 1930. Huset viser at institusjonalisering ikke bare skjer gjennom staten eller museet; kunstnere kan selv bygge varige rom for produksjon, juryering og offentlighet.',
        'Den årlige Høstutstillingen ved Kunstnernes Hus er kunstnerjuryert og basert på fri innsendelse, slik at debutanter kan vises sammen med etablerte navn. Ordningen åpner en søknadsport, men juryeringen er fortsatt et utvalg: fri innsendelse betyr ikke automatisk deltakelse.',
        'UKS oppgir at organisasjonen ble grunnlagt av kunstnere for kunstnere i 1921 og kombinerer rollen som institusjon for internasjonal samtidskunst med en norsk politisk medlemsorganisasjon. Sammenligning av Nasjonalmuseet, Kunstnernes Hus og UKS må derfor registrere eierskap, medlemsgrunnlag, beslutningsorgan, samlingsansvar og programform hver for seg.'
      ], [['kfi-05'], ['kfi-06'], ['kfi-07']], [
        'Kunstnerstyrt betyr en bestemt styringshistorie, ikke fravær av institusjonelle porter.',
        'Institusjoner skal sammenlignes på samme eksplisitte variabler, ikke bare på størrelse eller prestisje.'
      ], [['kfi-05', 'kfi-07'], ['kfi-01', 'kfi-05', 'kfi-07']])
    ],
    concepts: [
      { id: 'kunstinstitusjon', term: 'Kunstinstitusjon', definition: 'En varig eller prosjektbasert organisasjon som organiserer produksjon, samling, visning, finansiering, utdanning, kritikk eller distribusjon av kunst.' },
      { id: 'kanondannelse', term: 'Kanondannelse', definition: 'Den historiske prosessen der verk, kunstnere og fortellinger får varig autoritet gjennom gjentatte valg i samlinger, utstillinger, forskning, kritikk og undervisning.' },
      { id: 'portvokter', term: 'Portvokter', definition: 'En aktør eller prosedyre som kontrollerer tilgang til en knapp ressurs som utstillingsplass, finansiering, utdanning, publisering eller synlighet.' },
      { id: 'kuratorisk_utvalg', term: 'Kuratorisk utvalg', definition: 'Et begrunnet valg og en sammenstilling av verk, rom, tekster og rekkefølge som former hvordan kunst blir synlig og fortolket.' },
      { id: 'samlingsproveniens', term: 'Samlingsproveniens', definition: 'Dokumentasjon av hvordan et objekt kom inn i en samling, med eierhistorie, ervervelsesmåte, dato og relevante beslutninger.' },
      { id: 'kunstnerstyrt', term: 'Kunstnerstyrt institusjon', definition: 'En institusjon der kunstnere har en definert rolle i eierskap, medlemskap, styring, juryering eller programbeslutninger.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('kfi-fordypning-1', 'Finansiering: følg ordningen, ikke bare pengene', [
        'Kulturdirektoratet samler retningslinjer og frister for tilskuddsordninger, innkjøpsordninger og kunstnerstipend. Før en tildeling tolkes, må analysen derfor identifisere hvilken ordning som ble brukt, hvem som kunne søke, hva midlene kunne dekke og hvilket organ som fattet beslutningen.',
        'Ordningen for produksjon og formidling av visuell kunst er åpen for blant andre enkeltkunstnere, kunstnergrupper, kuratorer og produsenter, mens visningssteder og arrangører henvises til en annen ordning. Samme kunstprosjekt kan altså møte forskjellige finansieringsporter avhengig av søkerrollen.',
        'Søknader i denne ordningen vurderes av et faglig utvalg som leser dem både enkeltvis og i forhold til andre søknader i samme runde. En tildeling dokumenterer derfor et konkurranseutsatt faglig vedtak innen bestemte kriterier og et bestemt budsjett, ikke en universell rangering av kunstnerisk kvalitet.'
      ], [['kfi-08'], ['kfi-09'], ['kfi-10']], [
        'Registrer ordning, søkerrolle, kriterier, beslutningsorgan, runde og dato.',
        'Tildeling skal ikke omskrives til objektiv kvalitetsdom eller dokumentert publikumseffekt.'
      ], [['kfi-08', 'kfi-09'], ['kfi-10']]),
      section('kfi-fordypning-2', 'Prosjektstøtte, arbeidsstipend og autonomi', [
        'Statens kunstnerstipend er en statlig ordning for yrkesaktive kunstnere, og Kulturdirektoratet opplyser at stipendene tildeles av et uavhengig utvalg. Formålet er å gi enkeltkunstnere mulighet til å utvikle virket sitt og ha kunstnerisk aktivitet som hovedvirke.',
        'Arbeidsstipend kan tildeles i ett til fem år og brukes til å arbeide som kunstner og videreutvikle kunstnerskapet. I 2026 er årsbeløpet oppgitt til 342 193 kroner. Beløp og regler er tidsbundne statusopplysninger og må derfor alltid ledsages av årstall og gjeldende kilde.',
        'Prosjektstøtte og arbeidsstipend kan begge skape tid og handlingsrom, men de gjør det på ulik måte. Prosjektstøtten vurderer et avgrenset tiltak; arbeidsstipendet følger kunstnerens virke over en periode. Feltanalysen må undersøke hvordan finansieringsformen påvirker rapportering, tidshorisont og avhengighet uten å anta hva den kunstneriske effekten ble.'
      ], [['kfi-11'], ['kfi-12'], ['kfi-09', 'kfi-11', 'kfi-12']], [
        'Skill finansieringsformens dokumenterte vilkår fra antatt kunstnerisk virkning.',
        'Alle beløp, frister og varigheter må dateres.'
      ], [['kfi-09', 'kfi-11'], ['kfi-12']]),
      section('kfi-fordypning-3', 'Utdanning og rekruttering som institusjonell port', [
        'Kunsthøgskolen i Oslo beskriver seg som Norges største statlige utdanningsinstitusjon for kunstnere og designere og tilbyr 21 studieprogrammer på tvers av billedkunst, design, kunst og håndverk, opera, dans, teater og pedagogisk praksis. Utdanningen er dermed både læringsmiljø, produksjonsinfrastruktur og en synlig inngang til profesjonelle nettverk.',
        'Kunstakademiet tilbyr en treårig bachelor i billedkunst på 180 studiepoeng og en toårig master på 120 studiepoeng. Gradsløpet dokumenterer institusjonalisert tid for praksis og faglig utvikling, men en grad er verken nødvendig for all profesjonell kunstpraksis eller tilstrekkelig bevis for senere posisjon i feltet.',
        'KHiOs publiserte opptakskrav viser at søkere til relevante masterløp vurderes gjennom blant annet portefølje, motivasjonsbrev, faglig tilknytning og annen kompetanse, med innstilling fra en tverrfaglig komité. Rekrutteringsanalyse skal derfor undersøke kriterier, dokumentkrav og komitésammensetning; den kan ikke utlede søkerens fremtidige kunstneriske verdi fra opptaksresultatet.'
      ], [['kfi-13'], ['kfi-14', 'kfi-11'], ['kfi-15a']], [
        'Kunstutdanning er en viktig institusjonell vei, men dokumentert praksis kan også etablere profesjonell status.',
        'Opptak dokumenterer en datert komitévurdering mot publiserte kriterier, ikke et sikkert karriereutfall.'
      ], [['kfi-11', 'kfi-14'], ['kfi-15a']])
    ],
    workedExamples: [
      { id: 'kfi-eksempel-1', title: 'Fra tildelingsliste til avgrenset påstand', steps: ['Finn ordningen og versjonen av retningslinjene som gjaldt i søknadsrunden.', 'Registrer søkerrolle, fagutvalg, tildelt beløp og vedtaksdato.', 'Skriv at prosjektet fikk støtte; ikke skriv at tildelingen beviser kvalitet eller effekt uten separat evidens.'] },
      { id: 'kfi-eksempel-2', title: 'Sammenlign prosjektstøtte og arbeidsstipend', steps: ['Noter om midlene er bundet til prosjekt eller til kunstnerisk arbeid over tid.', 'Sammenlign varighet, rapporteringskrav og hvem som kan søke.', 'Hold økonomisk handlingsrom og faktisk kunstnerisk resultat som to forskjellige analysetrinn.'] },
      { id: 'kfi-eksempel-3', title: 'Les et opptakssystem', steps: ['Samle publiserte opptakskrav og dokumentkrav for ett studieprogram.', 'Identifiser hvem som vurderer portefølje og kompetanse.', 'Beskriv porten uten å gjøre opptak eller avslag til en generell dom over søkeren.'] }
    ],
    commonMisconceptions: [
      { claim: 'Offentlig finansiering betyr politisk bestilt innhold.', correction: 'Ordning, lovgrunnlag, faglig beslutningsorgan og konkrete vilkår må undersøkes. Statlig finansiering alene dokumenterer ikke innholdsstyring.' },
      { claim: 'En stipendmottaker er kåret til en av landets beste kunstnere.', correction: 'Tildelingen dokumenterer et vedtak etter en bestemt ordnings kriterier og konkurranse i en bestemt runde.' },
      { claim: 'Kunstutdanning er den eneste veien til profesjonell status.', correction: 'Kulturdirektoratets kriterier viser at profesjonell kompetanse kan bygge på utdanning eller dokumentert praksis.' },
      { claim: 'Opptak ved et akademi forutsier karrieren.', correction: 'Opptaket er en komitévurdering av innsendt materiale og kvalifikasjoner på et bestemt tidspunkt.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('kfi-anvendelse-1', 'Fra utstillingsrom til digital katalog', [
        'Distribusjon begynner før publikum møter verket. Et museum velger hva som kjøpes inn, hvilke data som registreres, hvilke verk som fotograferes, hva som stilles ut og hvilke fortellinger som bygges rundt utvalget. Nasjonalmuseets nettkatalog lar brukeren søke i verk, kunstnere og utstillingshistorikk, slik at katalogen blir en egen forsknings- og formidlingsinfrastruktur.',
        'Nasjonalmuseets utviklingsmiljø markerte i 2023 at 50 000 objekter var digitalisert i nett-samlingen og opplyste i 2025 at gigapikselvisning var tatt i bruk. Slike funksjoner kan gjøre detaljer lettere å undersøke, men digitalisering er fortsatt et kuratert utvalg av objekter, metadata, fotografier og tekniske prioriteringer.',
        'Digital sirkulasjonsanalyse skal derfor registrere hva som finnes, hvilke felt som kan søkes, hvordan resultatene sorteres, hvilken bildekvalitet som tilbys og hva lisensen tillater. Antall digitaliserte objekter sier ikke alene hvor lett ulike kunstnere, medier eller perioder faktisk blir funnet.'
      ], [['kfi-16'], ['kfi-17'], ['kfi-16', 'kfi-17', 'kfi-20']], [
        'Digital katalog er en institusjonell distribusjonsform med egne utvalg og tekniske vilkår.',
        'Digitaliseringsvolum og faktisk oppdagbarhet må måles separat.'
      ], [['kfi-16', 'kfi-17'], ['kfi-17']]),
      section('kfi-anvendelse-2', 'MUNCH: samling, verkskatalog og bruksrett', [
        'MUNCH forvalter over 42 000 museumsobjekter, blant dem nær 28 000 kunstverk, og museet knytter samlingen til både Edvard Munch og gavene etter Rolf Stenersen, Amaldus Nielsen og Ludvig O. Ravensberg. Samlingsprofilen er dermed formet av gaver, kommunalt ansvar og senere museumsarbeid, ikke bare av ett løpende innkjøpsprogram.',
        'Den digitale verkskatalogen søker å samle hele Munchs kunstnerskap og omfatter den testamentariske gaven til Oslo kommune på nær 27 000 verk, i tillegg til verk i andre museer og private samlinger. Museet understreker at databasen oppdateres med ny forskning og kan inneholde usikkerhet; katalogen er derfor et forskningsverktøy, ikke en uforanderlig fasit.',
        'MUNCH åpner for bruk av reproduksjoner under oppgitte vilkår og ber om kreditering med kunstner, tittel, datering og fotoopplysning; siden viser også til en CC BY-NC-SA-lisens. Tilgjengelig bilde, åpent metadatafelt og fri kommersiell gjenbruk er tre forskjellige rettighetsnivåer som må leses eksplisitt.'
      ], [['kfi-18'], ['kfi-19'], ['kfi-20']], [
        'En digital verkskatalog kan koble objekter på tvers av eiere, men beholder faglig usikkerhet og revisjon.',
        'Les kreditering og lisens før et bilde gjenbrukes; synlighet er ikke det samme som fri bruk.'
      ], [['kfi-19'], ['kfi-20']]),
      section('kfi-anvendelse-3', 'Komparativ institusjonsmatrise i Oslo', [
        'Velg Nasjonalmuseet, Kunstnernes Hus, UKS og MUNCH og opprett samme kolonner for alle: mandat, styringsform, samlingsansvar, opptaks- eller utvalgsport, finansieringsspor, fysisk distribusjon, digital distribusjon og kildebegrensning. Sammenligningen blir først gyldig når institusjonstypene beskrives med like variabler.',
        'For hvert sted skal én konkret handling spores: et innkjøp eller katalogobjekt ved Nasjonalmuseet, en kunstnerjuryert utstillingsport ved Kunstnernes Hus, medlems- og programrollen ved UKS og et objekt med verkskatalog og bildelisens ved MUNCH. Skriv kjeden handling → aktør → dokument → dato → resultat → hva kilden ikke viser.',
        'Avslutt med to rivaliserende forklaringer på synlighet. Et verk kan være synlig fordi det er samlet og kuratert, fordi det vant en åpen juryering, fordi kunstneren inngår i et medlems- eller nettverksfelt, eller fordi metadata og reproduksjonsvilkår gjør digital sirkulasjon mulig. Analysen skal vise hvilken forklaring evidensen støtter, og hvor brukerdata, kritikk eller lengre tidsserier fortsatt mangler.'
      ], [['kfi-01', 'kfi-05', 'kfi-07', 'kfi-18'], ['kfi-03', 'kfi-06', 'kfi-07', 'kfi-19', 'kfi-20'], ['kfi-04', 'kfi-06', 'kfi-10', 'kfi-16', 'kfi-17']], [
        'Bruk identiske analysevariabler når ulike institusjonstyper sammenlignes.',
        'Alle synlighetsforklaringer må knyttes til en dokumentert mekanisme og en uttrykt kildebegrensning.'
      ], [['kfi-01', 'kfi-05', 'kfi-07', 'kfi-18'], ['kfi-04', 'kfi-10', 'kfi-16']])
    ],
    applicationTasks: [
      { id: 'kfi-oppgave-1', title: 'Samlingskjeden', task: 'Velg ett objekt i Nasjonalmuseets katalog. Registrer ervervelse, metadata, eventuell utstillingshistorikk og nåværende visningsstatus. Skriv én påstand kilden støtter og én kanonpåstand den ikke er sterk nok til å støtte.' },
      { id: 'kfi-oppgave-2', title: 'Finansieringsporten', task: 'Sammenlign gjeldende prosjektstøtte for visuell kunst med arbeidsstipend. Lag en tabell over søker, formål, beslutningsorgan, varighet, bundet aktivitet og hva tildelingen ikke dokumenterer.' },
      { id: 'kfi-oppgave-3', title: 'Rekrutteringsporten', task: 'Les opptakskravene til ett KHiO-program. Kartlegg dokumentkrav, kriterier og komité. Formuler resultatet uten å forutsi søkerens karriere eller rangere kunstnerisk verdi.' },
      { id: 'kfi-oppgave-4', title: 'Digital oppdagbarhet', task: 'Søk etter samme kunstner eller verkstype i Nasjonalmuseets og MUNCHs digitale kataloger. Sammenlign metadata, filtre, bilder, kreditering og lisens og noter hva som krever faktisk bruker- eller eksponeringsdata.' }
    ],
    selfCheck: [
      { question: 'Hva er forskjellen mellom samling og utstilling?', answer: 'Samlingen omfatter objekter institusjonen forvalter; utstillingen er et tids- og romavgrenset utvalg med en bestemt kuratorisk sammenstilling.' },
      { question: 'Hva dokumenterer et innkjøp sikkert?', answer: 'At institusjonen ervervet objektet på en bestemt måte og dato, dersom katalogen oppgir dette. Det dokumenterer ikke alene varig kanonstatus.' },
      { question: 'Hvorfor skal prosjektstøtte og arbeidsstipend skilles?', answer: 'De har ulikt formål, tidshorisont, søkerlogikk og binding til aktivitet og gir derfor forskjellige former for handlingsrom.' },
      { question: 'Hva viser en opptakskomité?', answer: 'En institusjonell vurderingsport med bestemte kriterier og dokumentkrav, ikke et sikkert mål på framtidig kunstnerisk verdi.' },
      { question: 'Hvorfor er metadata en del av distribusjonen?', answer: 'Metadata avgjør hva som kan søkes, filtreres, kobles og forstås i en digital katalog.' },
      { question: 'Hva må kontrolleres før et digitalt kunstbilde gjenbrukes?', answer: 'Rettighetsstatus, lisens, kommersiell eller ikke-kommersiell bruk, bildekreditering og eventuelle særvilkår.' }
    ]
  }
};

const sources = [
  { id: 'kfi01-nm-strategi', publisher: 'Nasjonalmuseet', title: 'Nasjonalmuseets strategi 2030', url: 'https://www.nasjonalmuseet.no/om-nasjonalmuseet/styret-organisasjon-og-ansatte/nasjonalmuseets-strategi/', source_location: 'Samfunnsoppdraget og målene for samling, publikum og samfunnsrolle', type: 'official-museum-strategy' },
  { id: 'kfi02-nm-samler', publisher: 'Nasjonalmuseet', title: 'Slik samler Nasjonalmuseet', url: 'https://www.nasjonalmuseet.no/om-nasjonalmuseet/innkjop-og-gaver/slik-samler-nasjonalmuseet/', source_location: 'Hovedoppdrag, samlingsprofil og beskrivelsen av hvordan nye verk kommer inn', type: 'official-collection-policy' },
  { id: 'kfi03-nm-samlingen', publisher: 'Nasjonalmuseet', title: 'Om samlingen', url: 'https://www.nasjonalmuseet.no/samlingen/om-samlingen/', source_location: 'Søk i verk, produsenter og utstillinger; avsnittet om sammenslåingen i 2003', type: 'official-collection-catalogue' },
  { id: 'kfi04-kunstnernes-hus', publisher: 'Kunstnernes Hus', title: 'Om Kunstnernes Hus', url: 'https://kunstnerneshus.no/om', source_location: 'Innledningen om kunstnerstyring siden 1930 og avsnittet om Høstutstillingen', type: 'institutional-history' },
  { id: 'kfi05-uks', publisher: 'Unge Kunstneres Samfund', title: 'UKS', url: 'https://www.uks.no/', source_location: 'Institusjonens egen presentasjon av grunnleggelsen i 1921, samtidskunstrollen og medlemsorganisasjonen', type: 'institutional-profile' },
  { id: 'kfi06-kd-ordninger', publisher: 'Kulturdirektoratet', title: 'Tilskuddsordninger', url: 'https://www.kulturdirektoratet.no/tilskuddsordninger', source_location: 'Innledningen om retningslinjer og frister for tilskudd, innkjøp og kunstnerstipend', type: 'current-official-funding-portal' },
  { id: 'kfi07-kd-visuell', publisher: 'Kulturdirektoratet', title: 'Visuell kunst – produksjon og formidling – kunstnere', url: 'https://www.kulturdirektoratet.no/tilskuddsordninger/prosjektstoette-visuell-kunst---kunstnere', source_location: 'Hvem kan søke, avgrensning mot visningssteder og vurderingskriterier', type: 'current-official-funding-guidance' },
  { id: 'kfi08-sks-oversikt', publisher: 'Kulturdirektoratet', title: 'Statens kunstnarstipend', url: 'https://www.kulturdirektoratet.no/statens-kunstnerstipend', source_location: 'Kort om ordningen, uavhengig utvalg og formålet med stipendene', type: 'current-official-stipend-overview' },
  { id: 'kfi09-sks-ordning', publisher: 'Kulturdirektoratet', title: 'Statens kunstnerstipend – søknadsinformasjon', url: 'https://www.kulturdirektoratet.no/tilskuddsordninger/statens-kunstnerstipend', source_location: 'Stipendtyper, profesjonelt virke, varighet og beløp for 2026', type: 'current-official-stipend-guidance' },
  { id: 'kfi10-khio', publisher: 'Kunsthøgskolen i Oslo', title: 'Kunsthøgskolen i Oslo', url: 'https://khio.no/', source_location: 'Presentasjonen av institusjonen, fagområdene og de 21 studieprogrammene', type: 'official-education-profile' },
  { id: 'kfi11-kunstakademiet', publisher: 'Kunsthøgskolen i Oslo', title: 'Kunstakademiet', url: 'https://khio.no/avdelinger/kunstakademiet', source_location: 'Studieprogrammene i billedkunst og gradslengde/studiepoeng', type: 'official-programme-page' },
  { id: 'kfi12-khio-opptak', publisher: 'Kunsthøgskolen i Oslo', title: 'Søk opptak', url: 'https://khio.no/studier/sok-opptak', source_location: 'Opptakskravene for relevante masterstudier, portefølje, motivasjonsbrev og tverrfaglig komité', type: 'current-official-admissions-guidance' },
  { id: 'kfi13-nm-beta', publisher: 'Nasjonalmuseet', title: 'Nasjonalmuseet beta', url: 'https://beta.nasjonalmuseet.no/', source_location: 'Milepælen 50 000 digitaliserte objekter fra 2023 og oppdateringen om gigapikselvisning høsten 2025', type: 'official-digital-development-log' },
  { id: 'kfi14-munch-samling', publisher: 'MUNCH', title: 'Om samlingen', url: 'https://www.munch.no/om-samlingen/', source_location: 'Samlingsomfanget og opplysningene om de fire private gavene', type: 'official-collection-profile' },
  { id: 'kfi15-munch-katalog', publisher: 'MUNCH', title: 'Tilgjengeliggjøring av Edvard Munchs kunstnerskap digitalt', url: 'https://www.munch.no/om-samlingen/digital-tilgjengeliggjoring-av-edvard-munchs-kunstnerskap/', source_location: 'Omfanget av verkskatalogen, den testamentariske gaven, andre eiere og forbehold om løpende revisjon', type: 'official-digital-catalogue-method' },
  { id: 'kfi16-munch-foto', publisher: 'MUNCH', title: 'Foto av Edvard Munchs kunstverk', url: 'https://www.munch.no/om-samlingen/foto-av-edvard-munchs-kunstverk/', source_location: 'Bruksvilkår, kreditering, fotoarkiv og CC BY-NC-SA 4.0-henvisning', type: 'official-image-rights-guidance' }
].map((source) => ({ ...source, label: `${source.publisher} – ${source.title}` }));

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('kfi-01', 'Nasjonalmuseet definerer samfunnsoppdraget som å utvikle, forvalte, forske på, tilgjengeliggjøre og formidle Norges største samling av kunst, arkitektur og design.', ['kfi01-nm-strategi'], ['kfi-grunnlag-1', 'kfi-grunnlag-2', 'kfi-anvendelse-3']),
  claim('kfi-02', 'Nasjonalmuseet fikk navnet sitt etter sammenslåingen av Nasjonalgalleriet, Arkitekturmuseet, Kunstindustrimuseet og Museet for samtidskunst i 2003.', ['kfi03-nm-samlingen'], ['kfi-grunnlag-1']),
  claim('kfi-03', 'Nasjonalmuseet beskriver utvikling og utfylling av samlingen som et hovedoppdrag med særlig vekt på norsk kunst, arkitektur og design og med internasjonale verk av betydning for samlingen.', ['kfi02-nm-samler'], ['kfi-grunnlag-1', 'kfi-grunnlag-2', 'kfi-anvendelse-3']),
  claim('kfi-04', 'Nasjonalmuseets samlingssider viser at samlingsutvikling, katalogisering, utstillingshistorikk og digital tilgjengeliggjøring er separate dokumenterbare operasjoner.', ['kfi02-nm-samler', 'kfi03-nm-samlingen'], ['kfi-grunnlag-1', 'kfi-grunnlag-2', 'kfi-anvendelse-3']),
  claim('kfi-05', 'Kunstnernes Hus oppgir at det er Norges eldste kunstnerstyrte institusjon og har vært et ikke-kommersielt visningssted og samlingspunkt siden 1930.', ['kfi04-kunstnernes-hus'], ['kfi-grunnlag-3', 'kfi-anvendelse-3']),
  claim('kfi-06', 'Kunstnernes Hus beskriver Høstutstillingen som kunstnerjuryert og basert på fri innsendelse, med debutanter og etablerte kunstnere i samme mønstring.', ['kfi04-kunstnernes-hus'], ['kfi-grunnlag-3', 'kfi-anvendelse-3']),
  claim('kfi-07', 'UKS oppgir at organisasjonen ble grunnlagt av kunstnere for kunstnere i 1921 og både er en institusjon for internasjonal samtidskunst og en norsk politisk medlemsorganisasjon.', ['kfi05-uks'], ['kfi-grunnlag-3', 'kfi-anvendelse-3']),
  claim('kfi-08', 'Kulturdirektoratets portal samler gjeldende retningslinjer og søknadsfrister for tilskuddsordninger, innkjøpsordninger og kunstnerstipend.', ['kfi06-kd-ordninger'], ['kfi-fordypning-1']),
  claim('kfi-09', 'Prosjektstøtten for visuell kunst skiller mellom søkere som enkeltkunstnere, grupper, kuratorer og produsenter og visningssteder eller arrangører som skal bruke en egen ordning.', ['kfi07-kd-visuell'], ['kfi-fordypning-1', 'kfi-fordypning-2']),
  claim('kfi-10', 'Søknader til prosjektstøtteordningen vurderes av et faglig utvalg både enkeltvis og i sammenheng med andre søknader i samme runde.', ['kfi07-kd-visuell'], ['kfi-fordypning-1', 'kfi-anvendelse-3']),
  claim('kfi-11', 'Statens kunstnerstipend er rettet mot yrkesaktive kunstnere, tildeles av et uavhengig utvalg og skal gi enkeltkunstnere mulighet til å utvikle virket sitt og ha kunstnerisk aktivitet som hovedvirke.', ['kfi08-sks-oversikt', 'kfi09-sks-ordning'], ['kfi-fordypning-2', 'kfi-fordypning-3']),
  claim('kfi-12', 'Kulturdirektoratet oppgir at arbeidsstipend kan tildeles i ett til fem år, og at årsbeløpet i 2026 er 342 193 kroner.', ['kfi09-sks-ordning'], ['kfi-fordypning-2']),
  claim('kfi-13', 'KHiO beskriver seg som Norges største statlige utdanningsinstitusjon for kunstnere og designere og oppgir 21 studieprogrammer på tvers av sju navngitte fagområder.', ['kfi10-khio'], ['kfi-fordypning-3']),
  claim('kfi-14', 'Kunstakademiet ved KHiO tilbyr en treårig bachelor i billedkunst på 180 studiepoeng og en toårig master på 120 studiepoeng.', ['kfi11-kunstakademiet'], ['kfi-fordypning-3']),
  claim('kfi-15a', 'KHiOs opptaksinformasjon for relevante masterstudier viser vurdering av portefølje, motivasjonsbrev, faglig tilknytning og annen kompetanse gjennom en tverrfaglig komité.', ['kfi12-khio-opptak'], ['kfi-fordypning-3']),
  claim('kfi-15', 'Nasjonalmuseets digitale samling lar brukeren søke i verk og kunstnere eller produsenter og bla i utstillinger og tilhørende verk.', ['kfi03-nm-samlingen'], ['kfi-grunnlag-2']),
  claim('kfi-16', 'Nasjonalmuseets nett-samling fungerer som en egen distribusjonsinfrastruktur gjennom søk i verk, produsenter og utstillingshistorikk.', ['kfi03-nm-samlingen'], ['kfi-anvendelse-1', 'kfi-anvendelse-3']),
  claim('kfi-17', 'Nasjonalmuseets digitale utviklingslogg markerte 50 000 digitaliserte objekter i 2023 og opplyste høsten 2025 at gigapikselvisning var implementert i nett-samlingen.', ['kfi13-nm-beta'], ['kfi-anvendelse-1', 'kfi-anvendelse-3']),
  claim('kfi-18', 'MUNCH oppgir at museet forvalter over 42 000 museumsobjekter, inkludert nær 28 000 kunstverk, og at samlingene etter Munch, Stenersen, Nielsen og Ravensberg alle kom som private gaver.', ['kfi14-munch-samling'], ['kfi-anvendelse-2', 'kfi-anvendelse-3']),
  claim('kfi-19', 'MUNCHs digitale verkskatalog omfatter den testamentariske gaven til Oslo kommune på nær 27 000 verk samt verk hos andre museer og private eiere, og katalogen oppdateres løpende med uttrykte forbehold om feil og attribusjon.', ['kfi15-munch-katalog'], ['kfi-anvendelse-2', 'kfi-anvendelse-3']),
  claim('kfi-20', 'MUNCH publiserer konkrete vilkår for bruk og kreditering av reproduksjoner og viser til CC BY-NC-SA 4.0 for fotoarkivet.', ['kfi16-munch-foto'], ['kfi-anvendelse-1', 'kfi-anvendelse-2', 'kfi-anvendelse-3'])
];

const claimsDoc = {
  schema: 'history_go_fagverk_chapter_claims_v1',
  version: '1.0.0',
  subject_id: 'kunst',
  chapter_id: CHAPTER_ID,
  sources,
  claims
};

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.kunst;
  assert(subject, 'Kunst mangler i fagverkregisteret');
  assert(Array.isArray(subject.chapters), 'Kunst chapters er ikke en liste');
  assert(!subject.chapters.some((row) => row.id === CHAPTER_ID), `${CHAPTER_ID} finnes allerede`);
  subject.chapters.push({
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: CHAPTER_FILE,
    primary_domain_id: 'felt_institusjon',
    emne_ids: emneIds
  });
  subject.canonicalModel.note = 'Kunstfagets seks canonicale fagområder eier rendererstrukturen. Felt og institusjon er materialisert som første fulltekst- og claimsporede kapittel; de fem øvrige områdene står eksplisitt igjen i kapittelproduksjon.';
  registry.version = '2.53.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'kunst');
  assert(subject?.editorialStatus === 'structure_ready', 'Kunst må starte fra structure_ready');
  subject.editorialStatus = 'chapters_in_progress';
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Kunst har seks canonicale fagområder og 21 aktive emner. Felt og institusjon er nå første fullverdige kapittel og dekker områdets fire emner nøyaktig én gang gjennom tre moduler, ni seksjoner, 27 claimsporede fagavsnitt, 21 verifiserte claims og 16 inspiserbare primærkilder. De fem øvrige Kunst-områdene gjenstår, derfor står faget korrekt som chapters_in_progress.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter);
  writeJson(`${CHAPTER_DIR}/brief.json`, brief);
  for (const [file, value] of Object.entries(modules)) writeJson(`${CHAPTER_DIR}/${file}`, value);
  writeJson(`${CHAPTER_DIR}/claims.json`, claimsDoc);
  updateRegistry();
  updateStatus();
  console.log(`Materialiserte Kunst/${CHAPTER_ID}: ${emneIds.length} emner, 3 moduler, ${claims.length} claims og ${sources.length} kilder.`);
}

main();
