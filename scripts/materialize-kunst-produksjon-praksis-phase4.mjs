#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'produksjon-og-praksis';
const CHAPTER_DIR = `data/fagverk/kunst/${CHAPTER_ID}`;
const CHAPTER_FILE = `data/fagverk/kunst/${CHAPTER_ID}.json`;
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_kunst_undergrunn_selvorganisert',
  'em_kunst_arbeidsformer_og_prosess',
  'em_kunst_teknologi_og_materialitet',
  'em_kunst_materialitet_teknikk_handverk',
  'em_kunst_kunstnerokonomi_og_prekaritet'
];

const methodIds = [
  'met_kunst_praksis_og_prosessanalyse',
  'met_kunst_atelier_og_arbeidsanalyse',
  'met_kunst_materialitetsanalyse',
  'met_kunst_formanalyse',
  'met_kunst_feltanalyse',
  'met_kunst_kritikk_og_diskursanalyse',
  'met_kunst_digital_sirkulasjonsanalyse',
  'met_kunst_resepsjonsanalyse',
  'met_kunst_komparativ_institusjonsanalyse'
];

const relatedPlaces = [
  { id: 'edvard_munchs_atelier_ekely', name: 'Edvard Munchs atelier på Ekely', role: 'Undersøk hvordan lys, rom, grafikkverksted og atelierorganisering inngår i kunstnerisk arbeid over tid.' },
  { id: 'kunsthall_oslo', name: 'Kunsthall Oslo', role: 'Følg nyproduksjon fra oppdrag og budsjett til installasjon, formidling og dokumentasjon.' },
  { id: 'hausmania', name: 'Hausmania', role: 'Analyser selvorganisert atelierdrift, deltakelseskrav, dugnad og rimelige produksjonsrom uten å romantisere usynlig arbeid.' },
  { id: 'kunstnernes_hus', name: 'Kunstnernes Hus', role: 'Sammenlign ettårig atelierstipend og studentdrevet visningsrom med andre produksjons- og arbeidsmodeller.' }
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
  primary_domain_id: 'produksjon_praksis',
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  emne_ids: emneIds,
  method_ids: methodIds,
  title: 'Produksjon og praksis: hvordan kunst blir til',
  subtitle: 'Fra atelier, verksted og materialprøve til teknologi, kollektiv drift og kunstnerøkonomi',
  lead: 'Et ferdig verk skjuler ofte mesteparten av arbeidet som gjorde det mulig: rom, prøver, verktøy, sikkerhet, samarbeid, finansiering, administrasjon, feil og omarbeiding. Kapittelet lærer brukeren å rekonstruere en dokumentert produksjonskjede uten å late som alle prosessvalg kan leses direkte ut av sluttresultatet.',
  learningObjectives: [
    'skille ferdig verk, prosessdokumentasjon og etterfølgende fortolkning som tre ulike evidenslag',
    'analysere hvordan atelier, verksted, lys, skala, verktøy og sikkerhetskrav setter konkrete produksjonsvilkår',
    'undersøke materialvalg som en kombinasjon av egenskaper, teknikk, tilgang, risiko og kunstnerisk beslutning',
    'kartlegge individuell kreditering og kollektiv produksjon uten å gjøre dem til motsetninger',
    'sammenligne selvorganiserte, kunstnerstyrte og offentlig finansierte produksjonsinfrastrukturer',
    'skille digitalt medium, digitalt verktøy, dokumentasjon og distribusjon',
    'skille honorar, utstillingsvederlag, prosjektmidler og dokumentert inntekt eller effekt',
    'bruke praksis-, atelier-, materialitets-, felt- og diskursanalyse på konkrete Oslo-case'
  ],
  diagnosticQuestions: [
    { question: 'Kan vi lese hele arbeidsprosessen ut av et ferdig kunstverk?', answer: 'Nei. Verket viser spor, men skisser, produksjonsnotater, intervjuer, verksteddata og dokumenterte endringer trengs for å rekonstruere prosessen.' },
    { question: 'Har et materiale én fast betydning?', answer: 'Nei. Materialets fysiske egenskaper er reelle, men kunstnerisk betydning oppstår i bruk, form, kontekst, historie og resepsjon.' },
    { question: 'Betyr selvorganisering at et miljø er uten regler eller institusjon?', answer: 'Nei. Tilgang, ansvar, dugnad, økonomi, vedlikehold og beslutningsformer organiserer også uavhengige rom.' },
    { question: 'Dokumenterer prosjektstøtte eller honorar at et verk lykkes?', answer: 'Nei. Beløpet dokumenterer finansiering eller betaling. Kunstnerisk, sosial eller økonomisk effekt krever annen evidens.' }
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
  primary_domain_id: 'produksjon_praksis',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Kunst-domenet Produksjon og praksis med kildebelagt undervisning i atelierarbeid, prosess, materialer, teknologi, håndverk, selvorganisering og kunstnerøkonomi.',
  audience: 'Brukere som skal kunne undersøke hvordan kunst faktisk produseres uten å gjøre sluttverket til komplett prosessbevis eller økonomisk støtte til et kvalitets- eller effektmål.',
  learningArc: [
    'begynne med atelieret som fysisk arbeidsbetingelse og skille observerbare spor fra antatt intensjon',
    'følge materiale og teknikk gjennom tilgang, verktøy, sikkerhet, prøving og form',
    'synliggjøre teknikere, verksteder, kollektiver og administrasjon bak individuell kreditering',
    'undersøke elektroniske og digitale medier som materialiserte produksjonssystemer',
    'sammenligne selvorganisert atelierdrift med stipend- og institusjonsbaserte arbeidsrom',
    'skille prosjektlogikk, honorar, vederlag, gratisarbeid og faktisk kunstnerinntekt',
    'avslutte med en etterprøvbar produksjonsmatrise for fire canonicale Oslo-steder'
  ],
  requiredEmneIds: emneIds,
  requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'ferdig verk vs dokumentert prosess',
    'prosesspor vs antatt kunstnerintensjon',
    'materialegenskap vs kunstnerisk betydning',
    'verktøy vs medium vs ferdig form',
    'tradisjonell teknikk vs uforanderlig tradisjon',
    'individuell kreditering vs enslig produksjon',
    'kollektiv praksis vs uklar ansvarslinje',
    'selvorganisering vs fravær av regler',
    'rimelig atelier vs fravær av arbeidskostnad',
    'digital produksjon vs immateriell produksjon',
    'dokumentasjon av prosess vs dokumentasjon som verk',
    'prosjektmidler vs kunstnerinntekt',
    'honorar vs utstillingsvederlag',
    'finansiering vs dokumentert kunstnerisk effekt',
    'nåværende driftsmodell vs historisk praksis'
  ],
  sourceStrategy: {
    priority: [
      'arbeids- og verkstedstedets egne dokumenter for rom, utstyr, tilgang og driftsmodell',
      'KHiO for verksteder, materialbasert kunst, teknikk, sikkerhet og pedagogisk praksis',
      'Kunsthall Oslo, Kunstnernes Hus og Atelier Nord for nyproduksjon, atelierprogram og mediekunst',
      'Regjeringen og Kulturdirektoratet for kunstnerøkonomi, betaling og støtteordninger',
      'canonical Kunst-filer som scope- og metodeeier, aldri som ekstern faktakilde'
    ],
    minimumExternalSources: 15,
    claimLevelTrace: true,
    sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'atelier, arbeidsrom, skisser, prøving, dokumentasjon og omarbeiding',
      'verkstedtilgang, verktøy, sikkerhet, teknikerkompetanse og delt produksjonsinfrastruktur',
      'keramikk, tekstil, grafikk, metall, tre, video, lyd og digitale produksjonsformer',
      'selvorganisering, atelierfellesskap, dugnad og kollektivt ansvar',
      'prosjektarbeid, honorar, vederlag, kunstnerinntekt og gratisarbeid',
      'Ekely, Kunsthall Oslo, Hausmania og Kunstnernes Hus som canonicale stedscase'
    ],
    excluded: [
      'kunstnerintensjon utledet bare fra ferdig form',
      'materiale tillagt universell symbolverdi uten kontekst',
      'teknologi presentert som autonom årsak til kunstnerisk nyvinning',
      'individuell signatur brukt som bevis på at verket ble produsert alene',
      'selvorganiserte miljøer romantisert uten økonomi, vedlikehold eller adgangsregler',
      'støtte eller honorar brukt som kvalitets- eller effektbevis',
      'nåværende utstyr, priser eller lokaler presentert som historisk konstante'
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
    exactFiveOfFiveEmneCoverage: true,
    ownerDomainGate: true,
    finishedWorkProcessGuard: true,
    materialMeaningGuard: true,
    selfOrganizationLaborGuard: true,
    fundingEffectGuard: true,
    rendererContractGuard: true
  }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section(
        'kpp-grunnlag-1',
        'Atelieret gjør arbeidsprosessen konkret',
        [
          'Edvard Munch kjøpte Ekely i 1916 og brukte eiendommen som hjem og arbeidssted fram til 1944. Stedet viser at kunstnerisk praksis kan være organisert gjennom en hel eiendom med bolig, hage, uteatelierer og egne arbeidsbygg, ikke bare gjennom ett rom med staffeli.',
          'Vinteratelieret ble oppført i 1919–20, omarbeidet og utvidet fram mot 1929 og rommer i dag to atelierrom og et grafikkverksted. Overlys, nordvendt lys, romvolum og trykkpresser er dokumenterbare arbeidsbetingelser; de beviser likevel ikke alene hvorfor Munch valgte en bestemt form i et bestemt verk.',
          'At atelierrommene fortsatt leies ut til profesjonelle kunstnere, og at Ekely også har kunstnerboliger med integrerte atelierer, viser hvordan et historisk arbeidssted kan bli en nåtidig produksjonsinfrastruktur. Praksisanalysen må datere hvilket lag den beskriver: Munchs arbeid, etterkrigstidens grafikkverksted eller dagens utleie.'
        ],
        [['kpp-01'], ['kpp-02'], ['kpp-02', 'kpp-03']],
        [
          'Analyser atelieret som lys, rom, utstyr, tid og adgang — ikke som en romantisk bakgrunn.',
          'Et fysisk prosesspor begrenser mulige forklaringer, men erstatter ikke dokumentasjon av konkrete valg.'
        ],
        [['kpp-01', 'kpp-02'], ['kpp-02']]
      ),
      section(
        'kpp-grunnlag-2',
        'Materiale er både egenskap og beslutning',
        [
          'KHiOs avdeling Kunst og håndverk organiserer utdanning rundt keramikk, tekstil, grafikk og tegning, metall- og smykkekunst og kunst i offentlige rom. Institusjonen beskriver verkstedet som en sentral arena for undervisning, kunstnerisk utviklingsarbeid og forskning, slik at materialarbeid behandles som kunnskapsproduksjon og ikke bare utførelse.',
          'KHiOs verksteder omfatter blant annet vev og digital tekstil, analoge og digitale medier, tre og CNC, grafikk, metall, keramikk og skulptur. Tilgang kan kreve sikkerhetskurs, og enkelte verktøy betjenes bare av verkstedmester. Materialvalg må derfor analyseres sammen med kompetanse, risiko, maskintilgang og institusjonelle regler.',
          'Bacheloren i medium- og materialbasert kunst kombinerer håndverksbasert materialundersøkelse med skriving, refleksjon, veiledning og utstillingspraksis. Det avviser både ideen om at håndverk er ren teknisk repetisjon og ideen om at et konsept kan realiseres uavhengig av materialkunnskap.'
        ],
        [['kpp-04'], ['kpp-05'], ['kpp-06']],
        [
          'Materialets fysiske egenskaper, produksjonsrisiko og kulturelle betydning må dokumenteres hver for seg.',
          'Teknikk er lært og situert praksis; den er verken bare tradisjon eller bare verktøybruk.'
        ],
        [['kpp-04', 'kpp-05'], ['kpp-06']]
      ),
      section(
        'kpp-grunnlag-3',
        'Kunstnernavnet skjuler ofte et produksjonslag',
        [
          'Fellesverkstedet beskriver seg som en ideell organisasjon som gir kunstnere og andre skapende tilgang til profesjonelle produksjonsmidler. Treverksted, produksjonshall, trykkverksted, digital avdeling og metallarbeid gjør infrastrukturen synlig før analysen spør hvem som signerer sluttverket.',
          'Verkstedet oppgir at fagteknikere forvalter avdelingene og deler erfaring og kunnskap med brukerne. En produksjonsanalyse skal derfor registrere teknisk veiledning, maskinoperasjon, materialanskaffelse og sikkerhet uten automatisk å overføre kunstnerisk medforfatterskap til alle som bidrar.',
          'Fellesverkstedet oppgir over 600 produksjoner årlig og begrunner modellen med delt utstyr, rom og kunnskap. Tallet dokumenterer aktivitet etter institusjonens egen rapportering, men sier ikke alene noe om kunstnerisk kvalitet, representativitet eller de enkelte prosjektenes arbeidsfordeling.'
        ],
        [['kpp-07'], ['kpp-08'], ['kpp-09']],
        [
          'Skill kunstnerisk kreditering fra hele kjeden av teknisk, administrativt og kollektivt arbeid.',
          'Aktivitetsvolum dokumenterer bruk, ikke automatisk kvalitet eller virkning.'
        ],
        [['kpp-07', 'kpp-08'], ['kpp-09']]
      )
    ],
    concepts: [
      { id: 'produksjonskjede', term: 'Produksjonskjede', definition: 'Den dokumenterbare rekken av idéarbeid, prøver, ressurser, personer, verktøy, beslutninger og omarbeidinger som leder fram mot et verk eller en hendelse.' },
      { id: 'atelierlogikk', term: 'Atelierlogikk', definition: 'Hvordan arbeidsrommets lys, skala, lagring, adgang, tidsbruk og sosiale organisering former hva slags arbeid som er mulig.' },
      { id: 'materialitet', term: 'Materialitet', definition: 'Materialers fysiske, sanselige, tekniske og historisk situerte egenskaper slik de virker i produksjon og møte med verket.' },
      { id: 'taus_kunnskap', term: 'Taus kunnskap', definition: 'Praktisk kunnen som ofte læres gjennom demonstrasjon, øvelse og kroppslig erfaring og ikke fullt ut kan erstattes av skriftlige instrukser.' },
      { id: 'produksjonsinfrastruktur', term: 'Produksjonsinfrastruktur', definition: 'Rom, maskiner, finansiering, kompetanse, regler og nettverk som gjør kunstnerisk arbeid gjennomførbart.' },
      { id: 'arbeidsdeling', term: 'Arbeidsdeling', definition: 'Fordelingen av kunstneriske, tekniske, administrative og omsorgsrelaterte oppgaver mellom aktører i en produksjon.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section(
        'kpp-fordypning-1',
        'Teknologi blir kunst gjennom konkrete operasjoner',
        [
          'Atelier Nord ble grunnlagt som grafikkverksted i 1965, fikk data- og videolaboratorium i 1993 og gjorde elektronisk kunst til hovedfelt etter at grafikkavdelingen ble lukket i 1998. Historien viser teknologisk produksjon som institusjonell ombygging av kompetanse, rom og oppdrag, ikke som et øyeblikkelig skifte fra analogt til digitalt.',
          'Atelier Nords nåværende lokaler samler galleri, kontor og studio i et kommunalt bygg som også rommer atten kunstneratelierer. Produksjon, administrasjon, visning og arbeidsfellesskap er dermed forskjellige funksjoner i samme infrastruktur og må ikke blandes i analysen.',
          'Atelier Nords dokumentasjon av Steina og Woody Vasulka viser hvordan videosynthesizere, sekvensere og selve videosignalet kunne være materiale for bildeproduksjon. Teknologien bestemmer likevel ikke verket alene: kunstnerne utviklet spørsmål, verktøy og operasjoner gjennom eksperimentell bruk.'
        ],
        [['kpp-10'], ['kpp-11'], ['kpp-12']],
        [
          'Kartlegg apparat, programvare, signal, operasjon og beslutning før teknologien tillegges effekt.',
          'Digital kunst er materiell gjennom maskiner, energi, lagring, grensesnitt og vedlikehold.'
        ],
        [['kpp-10', 'kpp-12'], ['kpp-11', 'kpp-12']]
      ),
      section(
        'kpp-fordypning-2',
        'Selvorganisering har også porter og arbeid',
        [
          'Hausmania tilbyr ifølge sin egen utlysning studioer og atelierer i ulike størrelser til kunstnere til en menneskevennlig pris. Tilgang er ikke automatisk: søkere forventes å forstå prosjektets egenart, være til stede, engasjere seg og delta i dugnad.',
          'Dugnaden gjør vedlikehold og fellesskap synlig, men kan også skjule hvem som har tid og økonomi til ubetalt arbeid. Feltanalyse skal derfor undersøke husleie, beslutninger, ansvar, konflikt og arbeidsmengde før selvorganisering omtales som friere eller mer inkluderende enn andre modeller.',
          'Kunstnernes Hus og KHiO driver på sin side et atelierprogram der åtte nyutdannede kunstnere årlig får ettårig atelierstipend og tilgang til et studentdrevet galleri. Sammenligningen viser to organiserte porter: medlems-/dugnadsbasert tilgang og tidsavgrenset stipendbasert tilgang.'
        ],
        [['kpp-13'], ['kpp-13', 'kpp-20'], ['kpp-14']],
        [
          'Selvorganisering betyr at regler og ressurser forvaltes på en annen måte, ikke at de forsvinner.',
          'Rimelig rom, stipend og dugnad fordeler kostnader ulikt og må undersøkes hver for seg.'
        ],
        [['kpp-13'], ['kpp-13', 'kpp-14', 'kpp-20']]
      ),
      section(
        'kpp-fordypning-3',
        'Prosjektlogikk og kunstnerøkonomi',
        [
          'Kunstnarkår beskriver at hoveddelen av kunstnere arbeider som frilansere og selvstendig næringsdrivende, og at dette gir utfordringer som ikke kan løses bare med kunstpolitikk. Arbeidsanalysen må derfor inkludere fakturering, sykefravær, pensjon, administrasjon og perioder uten kunstnerinntekt når kildene finnes.',
          'Regjeringen peker samtidig på at økt konkurranse om arbeid og offentlig støtte kan gi færre oppdrag og svakere utviklingsvilkår. Konkurranse er en strukturpåstand; den gir ikke grunnlag for å forklare ett kunstnerskap uten søknads-, inntekts- og tidsdata.',
          'Offentlige ordninger skiller mellom honorar for arbeid, utstillingsvederlag for visning og støtte til produksjon eller drift. Kulturdirektoratets arrangørordning kan dekke blant annet innholdsproduksjon, honorar, vederlag og lokaler, mens regjeringen dokumenterer gratisarbeid og underbetaling som et særskilt problem. Beløpene må derfor føres til riktig funksjon før økonomisk effekt vurderes.'
        ],
        [['kpp-17'], ['kpp-18'], ['kpp-19', 'kpp-20', 'kpp-21', 'kpp-22']],
        [
          'Skill prosjektbudsjett, omsetning, honorar, vederlag og disponibel kunstnerinntekt.',
          'En finansieringsbeslutning dokumenterer ressurstilgang, ikke verkets kvalitet eller virkning.'
        ],
        [['kpp-19', 'kpp-21', 'kpp-22'], ['kpp-18', 'kpp-20']]
      )
    ],
    workedExamples: [
      { id: 'kpp-eksempel-1', title: 'Rekonstruer en produksjonskjede', situation: 'Et ferdig installasjonsverk er dokumentert med foto, men produksjonsteksten nevner verksted og tekniker.', analysis: ['Skill det som er synlig i verket fra det produksjonsteksten dokumenterer.', 'Registrer materiale, verktøy, teknisk rolle, prøvefase og installasjon som separate ledd.', 'Marker kunstnerintensjon som ukjent dersom intervju, notat eller primærkilde mangler.'] },
      { id: 'kpp-eksempel-2', title: 'Sammenlign to arbeidsrom', situation: 'Ekely og Fellesverkstedet gir ulike typer tilgang til rom, utstyr og kompetanse.', analysis: ['Sammenlign lys, skala, verktøy, adgang, varighet og teknikerstøtte med samme variabler.', 'Skill historisk atelierbruk fra nåværende drift.', 'Formuler hva infrastrukturen muliggjør uten å hevde at den bestemmer sluttformen.'] },
      { id: 'kpp-eksempel-3', title: 'Les et utstillingsbudsjett', situation: 'Et visningssted oppgir produksjonsmidler, honorar, vederlag og lokalkostnader.', analysis: ['Før hver post til arbeid, visningsrett, produksjon eller drift.', 'Undersøk hvem som mottar beløpet og hvilken periode det dekker.', 'Ikke bruk totalbudsjettet som mål på kunstnerinntekt eller kunstnerisk effekt.'] }
    ],
    commonMisconceptions: [
      { claim: 'Det ferdige verket viser nøyaktig hvordan kunstneren arbeidet.', correction: 'Formen gir prosesspor, men en produksjonsrekonstruksjon krever samtidige kilder om prøver, valg, roller og endringer.' },
      { claim: 'Digital kunst er immateriell.', correction: 'Digital produksjon bruker maskiner, strøm, programvare, lagring, signaler, grensesnitt og vedlikehold.' },
      { claim: 'Kunstnerens signatur betyr at verket ble laget alene.', correction: 'Signaturen uttrykker kunstnerisk kreditering; teknikere, verksteder, produsenter og administratorer kan inngå i produksjonskjeden.' },
      { claim: 'Selvorganiserte rom er uten portvoktere og kostnader.', correction: 'Også selvorganiserte miljøer fordeler tilgang, tid, dugnad, husleie, vedlikehold og beslutningsmakt.' },
      { claim: 'Et stort prosjektbudsjett er det samme som høy kunstnerinntekt.', correction: 'Materialer, teknikk, transport, lokaler, administrasjon og andre honorarer kan utgjøre store deler av budsjettet.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section(
        'kpp-anvendelse-1',
        'Nyproduksjon er et oppdrag, ikke bare et nytt objekt',
        [
          'Kunsthall Oslo beskriver seg som et ikke-kommersielt visningssted for internasjonal samtidskunst med vekt på nye bestillingsverk og kunstproduksjonens sosiale og historiske sammenheng. Produksjonsanalyse begynner derfor før åpningen: oppdrag, utvikling, finansiering, romtilpasning og samarbeid må spores.',
          'At institusjonen er ikke-kommersiell betyr ikke at produksjonen er uten økonomi. Arrangørstøtte kan omfatte programmering, innholdsproduksjon, lønn, honorar, vederlag og lokaler, og hver post løser en annen del av produksjonen.',
          'Kunsthall Oslos femte gallerirom åpnet på Factory Tøyen i 2026. Flytting endrer rom, nabolag, publikumskontekst og produksjonsmuligheter, men institusjonell kontinuitet kan bare hevdes gjennom dokumentert program, organisasjon og arkiv.'
        ],
        [['kpp-15'], ['kpp-21'], ['kpp-16']],
        [
          'Følg nyproduksjon fra oppdrag til dokumentasjon med daterte kilder.',
          'Ikke-kommersiell beskriver formål og driftslogikk, ikke fravær av budsjett eller betaling.'
        ],
        [['kpp-15', 'kpp-16'], ['kpp-21']]
      ),
      section(
        'kpp-anvendelse-2',
        'Teknikk blir kunnskap når den kan prøves og deles',
        [
          'KHiOs CRAFT-samarbeid lanserte i 2023 en digital kunnskapsbank for keramisk kompetanse, historie og aktiviteter. Prosjektet viser at håndverkskunnskap kan dokumenteres og distribueres digitalt uten at skjermen erstatter materialprøven, brenningen eller den kroppslige øvelsen.',
          'Et verkstedbesøk bør derfor registrere arbeidssekvensen: materialvalg, forberedelse, verktøy, prøve, feil, justering, overflate og ferdigstilling. Når et trinn ikke er observert eller kildebelagt, skal det stå som et spørsmål og ikke fylles med en sannsynlig standardprosess.',
          'Sammenlign KHiOs sikkerhets- og opplæringsporter, Fellesverkstedets teknikerdelte produksjonsmidler og Ekelys tidsavgrensede atelierutleie. Alle gir tilgang til arbeid, men gjennom forskjellige kombinasjoner av kvalifikasjon, betaling, kompetanse og varighet.'
        ],
        [['kpp-23'], ['kpp-05', 'kpp-06', 'kpp-23'], ['kpp-02', 'kpp-05', 'kpp-07', 'kpp-08']],
        [
          'Dokumentasjon kan dele teknikk, men må angi hva som fortsatt krever verksted, materiale og veiledning.',
          'Sammenlign produksjonssteder med samme adgangs- og ressursvariabler.'
        ],
        [['kpp-23'], ['kpp-02', 'kpp-05', 'kpp-07']]
      ),
      section(
        'kpp-anvendelse-3',
        'Bygg en etterprøvbar produksjonsmatrise',
        [
          'Start med fire kolonner: dokumentert handling, aktør, ressurs og kilde med dato. Legg så til beslutningspunkt, alternativ og begrensning. Matrisen tvinger analysen til å skille hva som ble gjort fra hvorfor det ble gjort.',
          'For Ekely kan rom og grafikkverksted dokumenteres; for Hausmania kan atelierutlysning og dugnad dokumenteres; for Kunstnernes Hus kan stipendets varighet og antall plasser dokumenteres; for Kunsthall Oslo kan nyproduksjon og flytting dokumenteres. Ingen av disse opplysningene beviser alene kvalitet, inkludering eller effekt.',
          'Avslutt med en usikkerhetslogg: manglende prøvearkiv, ukjent arbeidstid, uoppgitt honorar, uklare teknikerroller eller udokumentert intensjon. En god produksjonsanalyse gjør hullene synlige i stedet for å erstatte dem med en glatt fortelling.'
        ],
        [['kpp-01', 'kpp-04', 'kpp-07', 'kpp-10'], ['kpp-02', 'kpp-13', 'kpp-14', 'kpp-15', 'kpp-16'], ['kpp-17', 'kpp-18', 'kpp-19', 'kpp-20', 'kpp-22']],
        [
          'Hver årsaks- eller intensjonspåstand må ha sterkere evidens enn en generell institusjonsbeskrivelse.',
          'Usikkerhet er en del av resultatet, ikke et felt som skal skjules.'
        ],
        [['kpp-01', 'kpp-12', 'kpp-15'], ['kpp-17', 'kpp-20']]
      )
    ],
    applicationTasks: [
      { id: 'kpp-oppgave-1', title: 'Atelierlesning', task: 'Besøk eller studer dokumentasjonen av Ekely. Skill fysiske arbeidsbetingelser fra påstander om Munchs konkrete beslutninger.', prompts: ['Hvilke romlige og tekniske forhold er dokumentert?', 'Hvilke prosessledd er ikke synlige?', 'Hvilken ekstra primærkilde ville styrket analysen?'] },
      { id: 'kpp-oppgave-2', title: 'Materialets kjede', task: 'Velg keramikk, tekstil, grafikk, metall eller digital video og bygg en produksjonskjede fra råmateriale eller signal til ferdig presentasjon.', prompts: ['Hvilke verktøy og sikkerhetskrav inngår?', 'Hvor oppstår irreversible valg?', 'Hvilke aktører bidrar utover kunstneren?'] },
      { id: 'kpp-oppgave-3', title: 'Selvorganiseringsaudit', task: 'Sammenlign Hausmania med Kunstnernes Hus sitt atelierprogram uten å rangere modellene.', prompts: ['Hvordan fordeles adgang og varighet?', 'Hvilke kostnader er penger, tid eller dugnad?', 'Hvem vedlikeholder rommet og tar beslutninger?'] },
      { id: 'kpp-oppgave-4', title: 'Teknologisk materialitet', task: 'Analyser ett video- eller digitalt verk gjennom signal, apparat, programvare, lagring og visningssituasjon.', prompts: ['Hva gjør teknologien faktisk?', 'Hva er kunstnerisk operasjon og hva er teknisk standard?', 'Hva må vedlikeholdes for at verket skal kunne vises igjen?'] },
      { id: 'kpp-oppgave-5', title: 'Prosjektøkonomi', task: 'Lag et eksempelbudsjett og skill kunstnerhonorar, utstillingsvederlag, produksjon, teknikk, transport, lokaler og administrasjon.', prompts: ['Hvem mottar hver post?', 'Hva er inntekt og hva er refusjon eller kostnad?', 'Hvilke effekter kan budsjettet ikke dokumentere?'] }
    ],
    selfCheck: [
      { question: 'Hvorfor er sluttverket utilstrekkelig som prosesskilde?', answer: 'Det viser resultat og spor, men ikke nødvendigvis forkastede forsøk, arbeidsdeling, tidsbruk, finansiering eller begrunnelser.' },
      { question: 'Hva skiller materialegenskap fra materialbetydning?', answer: 'Egenskapen kan måles eller observeres; betydningen oppstår gjennom bruk, form, historie, kontekst og resepsjon.' },
      { question: 'Hva må registreres i et verksted?', answer: 'Adgang, opplæring, verktøy, sikkerhet, materialer, teknikerroller, arbeidssekvens og begrensninger.' },
      { question: 'Betyr individuell signatur at produksjonen var individuell?', answer: 'Nei. Kreditering og faktisk arbeidsdeling er to separate spørsmål.' },
      { question: 'Hvorfor er selvorganisering ikke institusjonsløs?', answer: 'Miljøet må fortsatt forvalte tilgang, økonomi, ansvar, regler, vedlikehold og konflikter.' },
      { question: 'Hva skiller honorar fra utstillingsvederlag?', answer: 'Honorar betaler for arbeid, mens vederlag kompenserer for visning og at kunstneren ikke disponerer verket i perioden.' },
      { question: 'Hva dokumenterer finansiering sikkert?', answer: 'At ressurser ble tildelt eller budsjettert til bestemte formål; ikke alene kvalitet, inntekt eller effekt.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: `${publisher} – ${title}`
});

const sources = [
  source('kpp01-ekely', 'Stiftelsen Edvard Munchs Atelier', 'Om Ekely', 'https://edvard-munchs-atelier.no/om-ekely/', 'Avsnittene om Munchs Ekely, vinteratelieret, grafikkverkstedet og dagens atelierbruk', 'official-studio-history'),
  source('kpp02-khio-kunst-handverk', 'Kunsthøgskolen i Oslo', 'Kunst og håndverk', 'https://khio.no/avdelinger/kunst-og-handverk', 'Avdelingens fagområder, verkstedets rolle og material- og håndverksbasert kunnskap', 'official-education-profile'),
  source('kpp03-khio-verksteder', 'Kunsthøgskolen i Oslo', 'Verksteder', 'https://khio.no/en/about/workshops', 'Oversikten over verksteder, utstyr, sikkerhetskurs og tilgang', 'official-workshop-infrastructure'),
  source('kpp04-khio-bachelor', 'Kunsthøgskolen i Oslo', 'Bachelorstudium i medium- og materialbasert kunst', 'https://khio.no/studieprogrammer/bakf', 'Programbeskrivelse, fagområder, materialundersøkelse, refleksjon og utstillingspraksis', 'official-programme-page'),
  source('kpp05-fellesverkstedet', 'Fellesverkstedet', 'About', 'https://www.fellesverkstedet.no/about', 'Formål, verkstedsavdelinger, teknikere, delt produksjonsmodell og oppgitt aktivitetsnivå', 'official-workshop-profile'),
  source('kpp06-atelier-nord-about', 'Atelier Nord', 'About / History', 'https://ateliernord.no/about/?lang=en', 'Historien fra grafikkverksted via data- og videolaboratorium til elektronisk kunst og dagens lokaler', 'official-media-art-history'),
  source('kpp07-atelier-nord-vasulka', 'Atelier Nord', 'Steina and Woody Vasulka: It’s All About the Signal', 'https://ateliernord.no/project/steina-and-woody-vasulka-its-all-about-the-signal/?lang=en', 'Avsnittene om videosignal, synthesizere, sekvensere og teknisk bildeproduksjon', 'official-exhibition-research'),
  source('kpp08-hausmania', 'Hausmania Kulturhus', 'Velkommen til Hausmania', 'https://www.hausmania.org/', 'Utlysningen av studioer og atelierer med krav om tilstedeværelse, engasjement og dugnad', 'official-self-organized-space'),
  source('kpp09-kunstnernes-hus-atelier', 'Kunstnernes Hus', 'Atelierprogram', 'https://kunstnerneshus.no/atelierprogrammet', 'Samarbeidet med KHiO, åtte ettårige atelierstipend og Akademirommet', 'official-artist-studio-programme'),
  source('kpp10-kunsthall-about', 'Kunsthall Oslo', 'About Kunsthall Oslo', 'https://kunsthalloslo.no/?lang=en&p=863', 'Institusjonens ikke-kommersielle profil, nye bestillingsverk og sosialhistoriske produksjonskontekst', 'official-art-space-profile'),
  source('kpp11-kunsthall-factory', 'Kunsthall Oslo', 'Det nye galleriet på Factory Tøyen', 'https://kunsthalloslo.no/?lang=nb&p=18523', 'Opplysningene om femte gallerirom, åpning i 2026 og ny fysisk ramme', 'official-current-location-update'),
  source('kpp12-kunstnarkar-rammer', 'Kultur- og likestillingsdepartementet', 'Meld. St. 22 (2022–2023) Kunstnarkår – rammer', 'https://www.regjeringen.no/no/dokumenter/meld.-st.-22-20222023/id2983542/?ch=2', 'Avsnittene om konkurranse, oppdrag, støtte og kunstneriske utviklingsvilkår', 'official-policy-white-paper'),
  source('kpp13-kunstnarkar-arbeid', 'Kultur- og likestillingsdepartementet', 'Meld. St. 22 (2022–2023) Kunstnarkår – kunstnerøkonomi', 'https://www.regjeringen.no/no/dokumenter/meld.-st.-22-20222023/id2983542/?ch=3', 'Avsnittene om frilansere, selvstendig næringsdrivende og målet om rimelig betaling', 'official-artist-economy-policy'),
  source('kpp14-rimelig-betaling', 'Kultur- og likestillingsdepartementet', 'Prop. 1 S (2025–2026) – rimelig betaling for kunstnerisk arbeid', 'https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123306/?ch=2', 'Avsnittene om gratisarbeid, underbetaling, selvstendig næringsdrivende, honorar og vederlag', 'current-official-budget-policy'),
  source('kpp15-arrangorstotte', 'Kulturdirektoratet', 'Visuell kunst – arrangører', 'https://www.kulturdirektoratet.no/tilskuddsordninger/arrangoerstoette-visuell-kunst', 'Listen over støtteberettigede kostnader og krav til profesjonell drift', 'current-official-funding-guidance'),
  source('kpp16-craft', 'Kunsthøgskolen i Oslo', 'En milepæl for keramisk kunst og kunnskapsdeling', 'https://khio.no/om-kunsthogskolen-i-oslo/aktuelt/en-milepael-for-keramisk-kunst-og-kunnskapsdeling', 'Lanseringen av Decoding Ceramics i 2023 og prosjektets kunnskapsdelingsmodell', 'official-artistic-research-update')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('kpp-01', 'Edvard Munch kjøpte Ekely i 1916 og bodde og arbeidet på eiendommen fram til sin død i 1944.', ['kpp01-ekely'], ['kpp-grunnlag-1', 'kpp-anvendelse-3']),
  claim('kpp-02', 'Vinteratelieret på Ekely ble oppført i 1919–20, omarbeidet fram til 1929 og rommer to atelierer og et grafikkverksted som fortsatt brukes av profesjonelle kunstnere.', ['kpp01-ekely'], ['kpp-grunnlag-1', 'kpp-anvendelse-2', 'kpp-anvendelse-3']),
  claim('kpp-03', 'Ekely-området omfatter en kunstnerkoloni med 44 boliger med integrerte atelierer og et gjesteatelierprogram.', ['kpp01-ekely'], ['kpp-grunnlag-1']),
  claim('kpp-04', 'KHiOs avdeling Kunst og håndverk dekker keramikk, tekstil, grafikk og tegning, metall- og smykkekunst og kunst i offentlige rom og beskriver verkstedet som sentralt for undervisning, utviklingsarbeid og forskning.', ['kpp02-khio-kunst-handverk'], ['kpp-grunnlag-2', 'kpp-anvendelse-3']),
  claim('kpp-05', 'KHiOs verksteder dekker tradisjonelle og digitale teknikker, krever sikkerhetskurs for mye av utstyret og reserverer enkelte verktøy for verkstedmester.', ['kpp03-khio-verksteder'], ['kpp-grunnlag-2', 'kpp-anvendelse-2']),
  claim('kpp-06', 'Bachelorstudiet i medium- og materialbasert kunst kombinerer håndverksbasert materialundersøkelse med skriving, refleksjon, veiledning og utstillingspraksis.', ['kpp04-khio-bachelor'], ['kpp-grunnlag-2', 'kpp-anvendelse-2']),
  claim('kpp-07', 'Fellesverkstedet beskriver seg som en ideell organisasjon som gir kunstnere og andre skapende tilgang til profesjonelle produksjonsmidler i flere verkstedsavdelinger.', ['kpp05-fellesverkstedet'], ['kpp-grunnlag-3', 'kpp-anvendelse-2', 'kpp-anvendelse-3']),
  claim('kpp-08', 'Fellesverkstedet oppgir at fagteknikere forvalter avdelingene og deler kompetanse med brukerne.', ['kpp05-fellesverkstedet'], ['kpp-grunnlag-3', 'kpp-anvendelse-2']),
  claim('kpp-09', 'Fellesverkstedet oppgir at virksomheten legger til rette for mer enn 600 produksjoner årlig.', ['kpp05-fellesverkstedet'], ['kpp-grunnlag-3']),
  claim('kpp-10', 'Atelier Nord ble grunnlagt som grafikkverksted i 1965, fikk data- og videolaboratorium i 1993 og gjorde elektronisk kunst til hovedfokus etter 1998.', ['kpp06-atelier-nord-about'], ['kpp-fordypning-1', 'kpp-anvendelse-3']),
  claim('kpp-11', 'Atelier Nords nåværende lokaler samler galleri, kontor og studio i et kommunalt bygg med atten kunstneratelierer.', ['kpp06-atelier-nord-about'], ['kpp-fordypning-1']),
  claim('kpp-12', 'Atelier Nords Vasulka-presentasjon dokumenterer videosignal, videosynthesizere og sekvensere som operative materialer i eksperimentell bildeproduksjon.', ['kpp07-atelier-nord-vasulka'], ['kpp-fordypning-1', 'kpp-anvendelse-3']),
  claim('kpp-13', 'Hausmania tilbyr studioer og atelierer til kunstnere og krever at brukere forstår prosjektet, er til stede, engasjerer seg og deltar i dugnad.', ['kpp08-hausmania'], ['kpp-fordypning-2', 'kpp-anvendelse-3']),
  claim('kpp-14', 'Kunstnernes Hus og KHiO gir åtte nyutdannede kunstnere årlig ettårig atelierstipend og tilgang til studentgalleriet Akademirommet.', ['kpp09-kunstnernes-hus-atelier'], ['kpp-fordypning-2', 'kpp-anvendelse-3']),
  claim('kpp-15', 'Kunsthall Oslo beskriver seg som et ikke-kommersielt visningssted med vekt på nye bestillingsverk og kunstproduksjonens sosiale og historiske sammenheng.', ['kpp10-kunsthall-about'], ['kpp-anvendelse-1', 'kpp-anvendelse-3']),
  claim('kpp-16', 'Kunsthall Oslo åpnet sitt femte gallerirom på Factory Tøyen i 2026.', ['kpp11-kunsthall-factory'], ['kpp-anvendelse-1', 'kpp-anvendelse-3']),
  claim('kpp-17', 'Kunstnarkår oppgir at hoveddelen av kunstnere arbeider som frilansere og selvstendig næringsdrivende.', ['kpp13-kunstnarkar-arbeid'], ['kpp-fordypning-3', 'kpp-anvendelse-3']),
  claim('kpp-18', 'Kunstnarkår peker på at økt konkurranse om arbeid og offentlig støtte kan gi færre oppdrag og svakere kunstneriske utviklingsvilkår.', ['kpp12-kunstnarkar-rammer'], ['kpp-fordypning-3', 'kpp-anvendelse-3']),
  claim('kpp-19', 'Regjeringens kunstnerpolitikk har rimelig betaling for kunstnerisk arbeid som et uttrykt mål.', ['kpp13-kunstnarkar-arbeid'], ['kpp-fordypning-3', 'kpp-anvendelse-3']),
  claim('kpp-20', 'Regjeringens budsjettproposisjon for 2026 beskriver gratisarbeid og underbetaling som en utfordring, særlig for selvstendig næringsdrivende kunstnere.', ['kpp14-rimelig-betaling'], ['kpp-fordypning-2', 'kpp-fordypning-3', 'kpp-anvendelse-3']),
  claim('kpp-21', 'Kulturdirektoratets arrangørstøtte kan dekke programmering, innholdsproduksjon, lønn eller honorar, utstillingsvederlag og lokaler som separate budsjettposter.', ['kpp15-arrangorstotte'], ['kpp-fordypning-3', 'kpp-anvendelse-1']),
  claim('kpp-22', 'Offisiell politikk skiller honorar for arbeid fra utstillingsvederlag for visning av kunstnerens verk.', ['kpp14-rimelig-betaling'], ['kpp-fordypning-3', 'kpp-anvendelse-3']),
  claim('kpp-23', 'KHiO deltok i CRAFT-samarbeidet som lanserte den digitale kunnskapsbanken Decoding Ceramics i 2023.', ['kpp16-craft'], ['kpp-anvendelse-2'])
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
  assert(Array.isArray(subject.chapters), 'Kunst mangler kapittelliste');
  const registryChapter = {
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: CHAPTER_FILE,
    primary_domain_id: 'produksjon_praksis',
    emne_ids: emneIds
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 1, 'Kunst må starte dette steget med ett kapittel');
    subject.chapters.push(registryChapter);
  } else {
    assert(subject.chapters.length === 2, 'Reproduksjon forventer nøyaktig to Kunst-kapitler');
    subject.chapters[existingIndex] = registryChapter;
  }
  subject.canonicalModel.note = 'Kunstfagets seks canonicale fagområder eier rendererstrukturen. Felt og institusjon og Produksjon og praksis er materialisert som fulltekst- og claimsporede kapitler; fire områder står igjen i kapittelproduksjon.';
  registry.version = '2.54.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'kunst');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Kunst må starte fra chapters_in_progress');
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Kunst har seks canonicale fagområder og 21 aktive emner. Felt og institusjon dekker 4 emner, og Produksjon og praksis dekker nå sine 5 emner gjennom tre moduler, ni seksjoner, 27 claimsporede fagavsnitt, 23 verifiserte claims og 16 inspiserbare primærkilder. To av seks områder er materialisert; fire gjenstår, derfor står faget korrekt som chapters_in_progress.';
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
