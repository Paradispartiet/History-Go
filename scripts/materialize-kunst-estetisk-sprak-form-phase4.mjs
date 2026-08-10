#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'estetisk-sprak-og-form';
const CHAPTER_DIR = 'data/fagverk/kunst/' + CHAPTER_ID;
const CHAPTER_FILE = 'data/fagverk/kunst/' + CHAPTER_ID + '.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), JSON.stringify(value, null, 2) + '\n');
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_kunst_representasjon_og_abstraksjon',
  'em_kunst_sjanger_stil_og_posisjonering',
  'em_kunst_konseptkunst_og_formalisme',
  'em_kunst_originalitet_og_referanse'
];

const methodIds = [
  'met_kunst_formanalyse',
  'met_kunst_materialitetsanalyse',
  'met_kunst_komparativ_verkanalyse',
  'met_kunst_ikonografisk_analyse',
  'met_kunst_kunsthistorisk_kontekstualisering',
  'met_kunst_konseptanalyse',
  'met_kunst_kontekstualisering',
  'met_kunst_kanon_og_arkivanalyse',
  'met_kunst_kritikk_og_diskursanalyse',
  'met_kunst_digital_sirkulasjonsanalyse'
];

const relatedPlaces = [
  { id: 'nasjonalmuseet', name: 'Nasjonalmuseet', role: 'Sammenlign figurative, abstraherte og konseptuelle verk med samme formale observasjonsprotokoll.' },
  { id: 'munch_museet', name: 'MUNCH', role: 'Følg motivvarianter, teknikk, stilisering og senere sirkulasjon uten å gjøre én versjon til original fasit.' },
  { id: 'vigelandsparken', name: 'Vigelandsparken', role: 'Analyser figur, rytme, skala, materiale og symboltolkning i et sammenhengende offentlig anlegg.' },
  { id: 'astrup_fearnley', name: 'Astrup Fearnley Museet', role: 'Undersøk readymade, appropriasjon, konsept og material perfeksjon i dokumenterte utstillinger og samlingsverk.' }
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
  primary_domain_id: 'estetisk_sprak_form',
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  emne_ids: emneIds,
  method_ids: methodIds,
  title: 'Estetisk språk og form: hvordan verk kommuniserer',
  subtitle: 'Fra figur, farge og komposisjon til konsept, stil, appropriasjon og motivets nye liv',
  lead: 'Kunstens form er ikke pynt rundt et budskap. Linje, farge, rom, rytme, materiale, skala, motiv, sjanger og referanse er handlinger som organiserer hva vi kan se og hvordan vi kan tolke. Kapittelet lærer brukeren å beskrive før den forklarer, og å skille dokumenterte verksegenskaper fra historiske kategorier og åpne fortolkninger.',
  learningObjectives: [
    'skille beskrivelse, klassifikasjon, kontekst og fortolkning som fire evidenslag',
    'analysere representasjon og abstraksjon som grader og strategier, ikke som en enkel enten-eller',
    'beskrive linje, flate, farge, rom, rytme, skala, materiale og teknikk presist',
    'bruke stil- og sjangerord som historiske sammenligningsverktøy, ikke som kunstnerpsykologi',
    'skille symbol, motiv og dokumentert ikonografi fra fri assosiasjon',
    'undersøke konsept og form som samvirkende nivåer i samme verk',
    'analysere originalitet gjennom variant, sitat, appropriasjon, remiks og sirkulasjon',
    'sammenligne konkrete verk ved fire canonicale Oslo-steder'
  ],
  diagnosticQuestions: [
    { question: 'Er abstrakt kunst uten referanser til verden?', answer: 'Ikke nødvendigvis. Formene kan være ikke-figurative, men materialer, titler, prosesser og kunsthistoriske sammenhenger kan fortsatt etablere referanser.' },
    { question: 'Kan en stilbetegnelse forklare hvorfor kunstneren laget verket?', answer: 'Nei. Stil beskriver observerbare likheter og historiske plasseringer; intensjon krever egne kilder.' },
    { question: 'Betyr konseptkunst at materialet er uviktig?', answer: 'Nei. Instruksjon, dokumentasjon, objekt, rom og utførelse materialiserer konseptet og kan endre hvordan det virker.' },
    { question: 'Er et originalt verk uten lån eller forløpere?', answer: 'Nei. Originalitet kan oppstå gjennom omforming, ny kontekst, variant, appropriasjon eller en ny relasjon mellom kjente elementer.' }
  ],
  relatedPlaces,
  moduleFiles: [
    CHAPTER_DIR + '/01-grunnlag.json',
    CHAPTER_DIR + '/02-fordypning.json',
    CHAPTER_DIR + '/03-anvendelse.json'
  ],
  briefFile: CHAPTER_DIR + '/brief.json',
  claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'kunst',
  chapter_id: CHAPTER_ID,
  primary_domain_id: 'estetisk_sprak_form',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Kunst-domenet Estetisk språk og form med verkforankret undervisning i representasjon, abstraksjon, stil, sjanger, konsept, formalisme, originalitet og referanse.',
  audience: 'Brukere som skal kunne utføre presis verkanalyse uten å gjøre smak, stilnavn, symbolassosiasjon eller kunstnerbiografi til bevis.',
  learningArc: [
    'starte med synlig form og kontrollert beskrivelse',
    'sammenligne figurative, abstraherte og ikke-figurative strategier',
    'skille motiv, symbol, ikonografi og åpen fortolkning',
    'bruke stil og sjanger som relasjonelle historiske kategorier',
    'undersøke konsept og materiale som gjensidig avhengige',
    'følge motivvarianter og reproduksjon på tvers av medier',
    'analysere appropriasjon som valg, omforming og ny kontekst',
    'avslutte med en etterprøvbar verkmatrise for fire Oslo-steder'
  ],
  requiredEmneIds: emneIds,
  requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'beskrivelse vs fortolkning',
    'figurativitet vs gjenkjennelighet',
    'abstraksjon vs fravær av referanse',
    'motiv vs symbol vs ikonografi',
    'stilbeskrivelse vs kunstnerintensjon',
    'sjangerkode vs kvalitetsdom',
    'formalisme vs kontekstløshet',
    'konsept vs dematerialisering',
    'variant vs kopi',
    'appropriasjon vs plagiatdom',
    'originalitet vs fravær av forløpere',
    'sirkulasjon vs dokumentert resepsjon'
  ],
  sourceStrategy: {
    priority: [
      'offisielle verk- og samlingsposter fra Nasjonalmuseet og MUNCH',
      'Vigelandmuseets verk-, park- og kronologidokumentasjon',
      'Astrup Fearnley Museets utstillings- og kunstnertekster',
      'canonical Kunst-filer som scope- og metodeeier, aldri som ekstern faktakilde'
    ],
    minimumExternalSources: 15,
    claimLevelTrace: true,
    sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'form, farge, linje, flate, rom, rytme, tekstur, skala og komposisjon',
      'representasjon, abstrahering og ikke-figurativ form',
      'motiv, symbol, ikonografi, stil og sjanger',
      'konseptkunst, formalisme og kontekstualisering',
      'variant, original, reproduksjon, appropriasjon og remiks',
      'Nasjonalmuseet, MUNCH, Vigelandsparken og Astrup Fearnley som canonicale stedscase'
    ],
    excluded: [
      'smaksdom brukt som formalanalyse',
      'kunstnerintensjon utledet bare fra stil eller biografi',
      'universell symbolbetydning uten dokumentert konvensjon eller kontekst',
      'abstraksjon definert som meningsløshet',
      'konseptkunst definert som materialløs',
      'originalitet definert som fravær av påvirkning',
      'appropriasjon automatisk dømt som enten kritikk eller plagiat',
      'digital spredning brukt som bevis på bestemt resepsjon'
    ]
  },
  qa: {
    exactCanonicalCoverage: '4/4',
    minimumModules: 3,
    minimumSections: 9,
    paragraphClaimTraceRequired: true,
    rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction']
  }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('kesf-grunnlag-1', 'Beskriv før du forklarer', [
        'Formanalyse begynner med det som kan etterprøves i verket: format, materiale, teknikk, linjer, fargefelt, rom, rytme, kontraster og figurforhold. Tolkningen kommer etterpå. Denne rekkefølgen gjør det mulig for andre å se hvilket visuelt grunnlag en påstand faktisk bygger på.',
        'Serge Poliakoffs Komposisjon fra 1953 er olje på lerret og organiserer kontraster mellom rødt og grønt, gult og blåsvart, runde former og kantete flater. Nasjonalmuseets verkstekst beskriver både farge, tekstur og balanse. Analysen trenger derfor ikke oversette feltene til skjulte figurer for å forklare hvordan bildet virker.',
        'Rigmor Iversens Abstrakt komposisjon fra 1950 er et grafisk blad utført i koldnål og rulett på papir. Betegnelsen abstrakt beskriver motivregistreringen, mens teknikken dokumenterer hvordan sporene er laget. Ingen av opplysningene fastsetter én betydning.'
      ], [['kesf-01'], ['kesf-02'], ['kesf-03']], [
        'Hold observasjon, katalogdata og fortolkning i separate setninger.',
        'Abstrakt form kan analyseres presist uten å gjøres figurativ.'
      ], [['kesf-01', 'kesf-02'], ['kesf-02', 'kesf-03']]),
      section('kesf-grunnlag-2', 'Representasjon og abstraksjon er grader', [
        'Marianne Heskes Mountains of the Mind begynte i videoopptak av landskap, ble bearbeidet digitalt og trykt i storformat på lerret. Resultatet er pikselert og abstrakt, men referansen til fjellandskap forsvinner ikke. Verket viser at abstrahering kan være en transformasjon av registrert virkelighet.',
        'Nasjonalmuseet knytter verkets flater til abstrakt ekspresjonisme, men skiller dem fra denne tradisjonens gestiske maling. Sammenligningen er nyttig fordi den angir både likhet og forskjell: visuell referanse alene gjør ikke to produksjonsmåter identiske.',
        'MUNCH dokumenterer at figuren i Skrik gradvis ble mer anonym, kjønnsløs og ikke-menneskelig gjennom flere forsøk. Motivet forblir gjenkjennelig, men stiliseringen reduserer individuell identitet. Representasjon og abstraksjon virker dermed samtidig.'
      ], [['kesf-04'], ['kesf-05'], ['kesf-06']], [
        'Spør hva som er bevart, forenklet, fordreid eller fjernet.',
        'Klassifiser graden av representasjon før du tillegger formen psykologisk betydning.'
      ], [['kesf-04', 'kesf-05'], ['kesf-06']]),
      section('kesf-grunnlag-3', 'Motiv, symbol og medium må skilles', [
        'MUNCH beskriver Madonna som et motiv med fem malte versjoner, tegninger og en omfattende litografisk produksjon. Det samme motivet endrer form når det går fra maleri til trykk, og mediumet endrer både fargebruk, ramme og sirkulasjon.',
        'I minst én malt versjon hadde Madonna opprinnelig en ramme med sædceller og foster. Rammen ble fjernet, mens motivene levde videre som integrert border i grafikken. Ikonografisk analyse må derfor datere hvilken versjon og hvilken fysisk del av verket den tolker.',
        'Litografiet kunne distribueres bredere enn maleriet, og MUNCH anslår at 250–300 avtrykk finnes. Mange eksemplarer opphever ikke verkstatusen, men gjør originalitetsbegrepet avhengig av matrise, trykk, variant og opplag.'
      ], [['kesf-07'], ['kesf-08'], ['kesf-09']], [
        'Et motiv kan være stabilt mens medium, ramme, farge og publikum endres.',
        'Et symbol blir ikke entydig bare fordi det er gjenkjennelig.'
      ], [['kesf-07', 'kesf-08'], ['kesf-08', 'kesf-09']])
    ],
    concepts: [
      { id: 'formal_beskrivelse', term: 'Formal beskrivelse', definition: 'En etterprøvbar registrering av verkets synlige og materielle organisering før historisk forklaring eller fortolkning.' },
      { id: 'representasjon', term: 'Representasjon', definition: 'Måter et verk avbilder, viser til eller organiserer forestillinger om noe utenfor seg selv.' },
      { id: 'abstraksjon', term: 'Abstraksjon', definition: 'Forenkling, omforming eller ikke-figurativ organisering som kan ha grader og fortsatt bevare referanser.' },
      { id: 'ikonografi', term: 'Ikonografi', definition: 'Analyse av dokumenterbare motiver, symboler og visuelle konvensjoner i historisk og kulturell sammenheng.' },
      { id: 'stil', term: 'Stil', definition: 'Et mønster av formale valg som brukes til sammenligning og historisk plassering, ikke et direkte mål på intensjon eller kvalitet.' },
      { id: 'variant', term: 'Variant', definition: 'En versjon av et motiv eller verk der medium, format, farge, detalj eller kontekst er endret uten at forbindelsen forsvinner.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('kesf-fordypning-1', 'Stil og sjanger er relasjoner', [
        'MUNCH viser at Edvard Munch arbeidet på tvers av maleri, grafikk, tegning, foto, film og skulptur og stadig prøvde nye teknikker. En stilbeskrivelse må derfor tåle variasjon innenfor samme kunstnerskap i stedet for å gjøre én overflate til personlig signatur.',
        'Munch møtte kritikk for uferdig preg og sterke farger, men fortsatte å realisere samme motiv på flere måter. Historiske reaksjoner dokumenterer hvilke normer formen brøt med; de beviser ikke at stilbrudd alene var kunstnerens mål.',
        'Skrik finnes i flere versjoner og ble brukt av Munch i kataloger, tidsskrifter og bokomslag. Senere bearbeidet Andy Warhol motivet i silketrykk. Stilposisjonering oppstår her gjennom både gjentakelse, mediumskifte og møte med massemedier.'
      ], [['kesf-10'], ['kesf-11'], ['kesf-12']], [
        'Stil må beskrives gjennom konkrete trekk og relevante sammenligninger.',
        'Et brudd blir historisk synlig mot en dokumentert norm, ikke bare fordi formen virker uvant i dag.'
      ], [['kesf-10', 'kesf-11'], ['kesf-11', 'kesf-12']]),
      section('kesf-fordypning-2', 'Konseptet trenger en form', [
        'Prosjekt Gjerdeløa ble realisert ved at Marianne Heske flyttet en om lag 350 år gammel løe fra Tafjord til Centre Pompidou i Paris i 1980 og senere tilbake. Handlingen, transporten, stedet og tidsforløpet er ikke emballasje rundt ideen; de er måten ideen blir tilgjengelig på.',
        'I tour – Retour ble løa flyttet til Astrup Fearnley og stilt sammen med en transparent harpiksavstøpning og Tidemands Fra Gudvangen. Sammenstillingen gjorde original, kopi, nasjonalt landskapsbilde og institusjonsrom til sammenlignbare deler av verket.',
        'Nasjonalmuseets katalog registrerer Prosjekt Gjerdeløa som en fotoinstallasjon fra 1980–1981/2011. Katalogobjektet er dokumentasjon og samlingsenhet, ikke hele den historiske hendelsen. Konseptanalyse må derfor navngi hvilket materialisert lag som undersøkes.'
      ], [['kesf-13'], ['kesf-14'], ['kesf-15']], [
        'Konseptkunst kan materialiseres som handling, objekt, dokumentasjon, sted og ny oppføring.',
        'Skill historisk prosjekt, senere restaging og museets samlingsobjekt.'
      ], [['kesf-13', 'kesf-15'], ['kesf-14', 'kesf-15']]),
      section('kesf-fordypning-3', 'Originalitet gjennom appropriasjon', [
        'Astrup Fearnley plasserer Jeff Koons i en readymade- og appropriasjonstradisjon. Han brukte hverdagsobjekter og masseestetiske referanser, men endret blant annet materiale, håndverksmessig finish og skala. Referansen er dermed synlig samtidig som objektets status og virkemåte endres.',
        'Museets Everyday Aesthetics-utstilling beskrev appropriasjonskunstnere som brukere av masseproduserte varer og bilder, mens Sherrie Levine tok verk fra mannlige forløpere for å utfordre ideen om det unike verkets aura. En appropriasjonsanalyse må dokumentere kildebildet, operasjonen og den nye konteksten før den vurderer kritikk eller originalitet.',
        'Rotating Views #2 koblet popkunst, masseproduksjon og senere appropriasjonskunst til ulike historiske diskusjoner om kunstnerrollen. At flere perioder bruker eksisterende bilder betyr ikke at strategiene er like; sammenligningen må vise forskjeller i medium, handling, institusjon og historisk spørsmål.'
      ], [['kesf-16'], ['kesf-17'], ['kesf-18']], [
        'Originalitet kan ligge i utvalg, omforming, skala, materiale, sekvens eller kontekst.',
        'Lik referanse er ikke bevis på lik hensikt eller lik historisk funksjon.'
      ], [['kesf-16', 'kesf-17'], ['kesf-17', 'kesf-18']])
    ],
    workedExamples: [
      { id: 'kesf-eksempel-1', title: 'Sammenlign figur og flate', situation: 'Skrik og Poliakoffs Komposisjon organiserer begge sterke formkontraster.', analysis: ['Beskriv linje, farge, rom og rytme i hvert verk uten psykologiske ord.', 'Marker hvor Skrik har figurative holdepunkter og hvor Komposisjon ikke har dem.', 'Først deretter sammenlignes hvordan formene styrer blikket.'] },
      { id: 'kesf-eksempel-2', title: 'Analyser et konseptuelt lag', situation: 'Prosjekt Gjerdeløa finnes som historisk flytting, senere restaging og fotoinstallasjon.', analysis: ['Dater hvert lag og registrer sted, objekt og dokumentasjon.', 'Beskriv hva betrakteren faktisk møter i den valgte versjonen.', 'Unngå å bruke én museumsregistrering som full dokumentasjon av hele prosjektet.'] },
      { id: 'kesf-eksempel-3', title: 'Spor en appropriasjon', situation: 'Et samtidsverk bruker et kjent bilde eller masseprodusert objekt.', analysis: ['Identifiser forløperen med kilde.', 'Beskriv nøyaktig hva som er beholdt og endret.', 'Vurder ny funksjon først etter at medium, skala, sted og publikum er dokumentert.'] }
    ],
    commonMisconceptions: [
      { claim: 'Abstrakt kunst forestiller ingenting og kan derfor bety hva som helst.', correction: 'Abstraksjon har grader og kan analyseres gjennom form, materiale, tittel, prosess og historisk kontekst.' },
      { claim: 'Stilen avslører kunstnerens personlighet og hensikt.', correction: 'Stil beskriver trekk og relasjoner; personlighet og hensikt krever biografiske eller samtidige kilder.' },
      { claim: 'Et kjent symbol har samme betydning overalt.', correction: 'Symbolbruk må knyttes til konkret versjon, konvensjon, tid, sted og dokumentert kontekst.' },
      { claim: 'Konseptkunst er bare en idé og har ingen form.', correction: 'Instruksjon, handling, objekt, dokumentasjon, rom og gjentakelse er materielle og formale realiseringer.' },
      { claim: 'Appropriasjon er automatisk enten plagiat eller institusjonskritikk.', correction: 'Analysen må først dokumentere forløper, operasjon, kreditering, rettslig kontekst og ny kunstnerisk funksjon.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('kesf-anvendelse-1', 'Les Vigelandsparken som formalt system', [
        'Vigelandmuseet beskriver parken som over 200 skulpturer i granitt, bronse og smijern, utviklet gjennom mer enn 40 års arbeid. Materialer, gjentatte menneskefigurer og parkens akser danner et samlet formsystem, men anleggets omfang gir ikke én samlet symbolsk fasit.',
        'Monolitten er 17 meter høy, hugget i én steinblokk og består av 121 menneskefigurer. Disse opplysningene forankrer analyse av skala, tetthet, vertikal rytme og kroppslig sammenfletting før mulige fortolkninger av liv, død eller åndelighet introduseres.',
        'Museet formulerer oppstandelse og åndelig lengsel som tolkninger av Monolitten, ikke som entydig definisjon. Språk som «har blitt tolket som» er en viktig evidensmarkør: det skiller dokumentert motiv fra institusjonelt formidlet fortolkning.'
      ], [['kesf-19'], ['kesf-20'], ['kesf-21']], [
        'Begynn med materiale, antall, skala, plassering og rytme.',
        'Bevar kildens modalitet når en betydning presenteres som tolkning.'
      ], [['kesf-19', 'kesf-20'], ['kesf-21']]),
      section('kesf-anvendelse-2', 'Følg motivets varianter og sirkulasjon', [
        'Skrik er et motiv i flere malte, tegnede og trykte versjoner, ikke ett enkelt objekt. En variantanalyse registrerer dato, medium, format, farge og komposisjonsendring før den spør hvilken versjon som senere ble ikonisk.',
        'Munch brukte selv en svart-hvitt-versjon i kataloger og publikasjoner, og Warhol laget i 1984 store, sterkt fargede silketrykk etter Munchs litografi. Referansen endrer både produksjonsmåte og forholdet til masseproduktet.',
        'At motivet sirkulerer i reklame, film og populærkultur dokumenterer rekkevidde, men ikke at alle brukere tolker det likt. Digital sirkulasjonsanalyse må skille antall reproduksjoner, konkrete bruksformer og faktisk resepsjon.'
      ], [['kesf-06', 'kesf-12'], ['kesf-12', 'kesf-22'], ['kesf-22']], [
        'Behandle hver versjon og senere bearbeidelse som et datert objekt.',
        'Sirkulasjon dokumenterer spredning; resepsjon krever egne kilder om mottakelse.'
      ], [['kesf-06', 'kesf-12'], ['kesf-22']]),
      section('kesf-anvendelse-3', 'Bygg en etterprøvbar verkmatrise', [
        'Lag seks kolonner: observasjon, materiale/teknikk, katalogdata, historisk sammenligning, kilde og fortolkning. For Nasjonalmuseets abstrakte verk fylles de tre første før avantgarde eller modernisme brukes som kontekst.',
        'For MUNCH registreres motivvariant og medium; for Vigelandsparken skala, figur og plassering; for Astrup Fearnley forløper, appropriasjonsoperasjon og utstillingskontekst. Samme matrise gjør svært ulike verk sammenlignbare uten å late som de stiller samme spørsmål.',
        'Avslutt med en usikkerhetslogg: ukjent intensjon, omstridt symbol, uidentifisert forløper, manglende resepsjonsdata eller senere katalogendring. En sterk verkanalyse viser nøyaktig hvor den går fra dokumentasjon til argument.'
      ], [['kesf-01', 'kesf-02', 'kesf-03'], ['kesf-06', 'kesf-16', 'kesf-19', 'kesf-20'], ['kesf-15', 'kesf-18', 'kesf-21', 'kesf-23', 'kesf-24']], [
        'Bruk samme kolonner, men ikke samme tolkningsfasit, på tvers av verk.',
        'Usikkerhet og alternative forklaringer er del av analysen.'
      ], [['kesf-01', 'kesf-16', 'kesf-19'], ['kesf-21', 'kesf-23', 'kesf-24']])
    ],
    applicationTasks: [
      { id: 'kesf-oppgave-1', title: 'Tre minutters formalbeskrivelse', task: 'Velg ett verk på Nasjonalmuseet og skriv uten stilnavn, følelser eller biografi.', prompts: ['Hvilke linjer, flater og farger organiserer blikket?', 'Hvordan virker format, skala og materiale?', 'Hvilke ord var observasjon og hvilke var allerede fortolkning?'] },
      { id: 'kesf-oppgave-2', title: 'Variantkart for Munch', task: 'Sammenlign to versjoner av Skrik eller Madonna.', prompts: ['Hva er stabilt i motivet?', 'Hva endres med medium og farge?', 'Hvordan påvirker opplag og sirkulasjon originalitetsbegrepet?'] },
      { id: 'kesf-oppgave-3', title: 'Ikonografisk kontroll', task: 'Analyser Monolitten uten å gjøre museets tolkningsforslag til fasit.', prompts: ['Hva kan observeres direkte?', 'Hva er dokumentert kontekst?', 'Hvilke betydninger er mulige, og hvor kommer de fra?'] },
      { id: 'kesf-oppgave-4', title: 'Konsept og materialisering', task: 'Kartlegg tre materielle lag i Prosjekt Gjerdeløa.', prompts: ['Hva var handlingen?', 'Hva ble utstilt i den valgte versjonen?', 'Hva bevarer museumsobjektet, og hva bevarer det ikke?'] },
      { id: 'kesf-oppgave-5', title: 'Appropriasjonsprotokoll', task: 'Velg ett verk eller en utstilling ved Astrup Fearnley som bruker en eksisterende referanse.', prompts: ['Hva er forløperen?', 'Hva er den dokumenterte operasjonen?', 'Hvordan endrer skala, materiale, sted eller publikum funksjonen?'] }
    ],
    selfCheck: [
      { question: 'Hva er første steg i formalanalyse?', answer: 'En kontrollert beskrivelse av synlig og materiell organisering før fortolkning.' },
      { question: 'Kan et abstrakt verk ha en konkret referanse?', answer: 'Ja. Referansen kan ligge i prosess, tittel, kildebilde, materiale eller kontekst selv om formen er ikke-figurativ.' },
      { question: 'Hva skiller motiv fra ikonografi?', answer: 'Motivet er det som fremstilles; ikonografi undersøker dokumenterbare symbol- og konvensjonslag.' },
      { question: 'Hva kan et stilnavn dokumentere?', answer: 'En begrunnet likhet eller historisk plassering, ikke automatisk intensjon, personlighet eller kvalitet.' },
      { question: 'Hvorfor er konseptkunst materiell?', answer: 'Fordi ideen realiseres gjennom blant annet handling, instruksjon, objekt, dokumentasjon, rom og tid.' },
      { question: 'Hva må en appropriasjonsanalyse identifisere?', answer: 'Forløper, valgt utsnitt eller objekt, kunstnerisk operasjon, medium, kreditering, kontekst og ny funksjon.' },
      { question: 'Hva skiller sirkulasjon fra resepsjon?', answer: 'Sirkulasjon viser hvor og hvordan noe spres; resepsjon dokumenterer hvordan konkrete mottakere tolker eller bruker det.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: publisher + ' – ' + title
});

const sources = [
  source('kesf01-formmetode', 'Nasjonalmuseet', 'Komposisjon av Serge Poliakoff', 'https://www.nasjonalmuseet.no/samlingen/objekt/MS-02973-1988', 'Om verket og verksinformasjon om form, farge, teknikk, mål og historisk plassering', 'official-collection-work'),
  source('kesf02-iversen', 'Nasjonalmuseet', 'Abstrakt komposisjon av Rigmor Iversen', 'https://www.nasjonalmuseet.no/samlingen/objekt/NMK.2018.0453', 'Verksinformasjon om datering, grafikk, koldnål, rulett, papir og abstrakt motiv', 'official-collection-work'),
  source('kesf03-mountains', 'Nasjonalmuseet', 'Mountains of the Mind av Marianne Heske', 'https://www.nasjonalmuseet.no/samlingen/objekt/MS-03906-1996', 'Om verket, videomaleriet, pikselert abstraksjon, landskapsreferanse og medium', 'official-collection-work'),
  source('kesf04-gjerdeloa', 'Nasjonalmuseet', 'Prosjekt Gjerdeløa av Marianne Heske', 'https://www.nasjonalmuseet.no/samlingen/objekt/NMK.2016.0122', 'Katalogdata om datering, fotoinstallasjon, materiale og registreringsnivå', 'official-collection-work'),
  source('kesf05-munch-artist', 'MUNCH', 'Edvard Munch 1863–1944', 'https://www.munch.no/en/edvard-munch/', 'Institusjonens oversikt over medier, eksperimentering og kunsthistorisk plassering', 'official-artist-profile'),
  source('kesf06-creativity', 'MUNCH', 'What can Munch teach us about creativity?', 'https://www.munch.no/en/edvard-munch/what-can-munch-teach-us-about-creativity/', 'Avsnittene om motivvarianter, teknikker, form, kritikk og lån fra andre', 'official-collection-essay'),
  source('kesf07-scream', 'MUNCH', 'A Scream Through Culture', 'https://www.munch.no/en/our-collection/a-scream-through-culture/', 'Avsnittene om motivutvikling, flere versjoner, reproduksjon, Warhol og populær sirkulasjon', 'official-collection-essay'),
  source('kesf08-madonna', 'MUNCH', 'Madonna', 'https://www.munch.no/en/our-collection/madonna/', 'Avsnittene om fem malerier, ramme, grafikk, tegning, opplag og mediumvarianter', 'official-collection-essay'),
  source('kesf09-vampire', 'MUNCH', 'Vampire in disgrace', 'https://www.munch.no/en/our-collection/vampire-in-disgrace/', 'Avsnittene om tittelhistorie og versjoner i maleri, tegning og grafikk', 'official-collection-essay'),
  source('kesf10-park', 'Vigelandmuseet', 'Vigelandsparken', 'https://vigeland.museum.no/vigelandsparken', 'Parkoversikt med antall verk, materialer, arbeidstid og planhistorie', 'official-site-work-overview'),
  source('kesf11-monolith', 'Vigelandmuseet', 'Monolitten', 'https://vigeland.museum.no/en/vigelandpark/monolith', 'Høyde, én steinblokk, 121 figurer og museets eksplisitt modale tolkninger', 'official-site-work'),
  source('kesf12-timeline', 'Vigelandmuseet', 'Vigelandsparken – tidslinje', 'https://vigeland.museum.no/vigelandsparken/tidslinje', 'Daterte oppføringer om broen, Monolitten, Fontenen og parkens ferdigstilling', 'official-site-chronology'),
  source('kesf13-heske-afm', 'Astrup Fearnley Museet', 'Marianne Heske – tour – Retour', 'https://www.afmuseet.no/en/exhibitions/marianne-heske-tour-retour/', 'Prosjekt Gjerdeløa, flyttingene, harpiksavstøpningen og sammenstillingen med Tidemand', 'official-exhibition-essay'),
  source('kesf14-koons', 'Astrup Fearnley Museet', 'Jeff Koons – Works from the Astrup Fearnley Collection', 'https://www.afmuseet.no/en/exhibitions/jeff-koons-works-from-the-astrup-fearnley-collection/', 'Readymade, appropriasjon, hverdagsobjekter, skala, material perfeksjon og idé', 'official-exhibition-essay'),
  source('kesf15-everyday', 'Astrup Fearnley Museet', 'Everyday Aesthetics – Works from the Astrup Fearnley Collection', 'https://www.afmuseet.no/en/exhibitions/everyday-aesthetics-works-from-the-astrup-fearnley-collection/', 'Simulasjon, appropriasjon, Sherrie Levine, massebilder og hverdagsobjekter', 'official-exhibition-essay'),
  source('kesf16-rotating', 'Astrup Fearnley Museet', 'Rotating Views #2', 'https://www.afmuseet.no/en/exhibitions/rotating-views-2/', 'Popkunst, billedreferanser, masseproduksjon, appropriasjon og ulike kunstnerroller', 'official-exhibition-essay')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('kesf-01', 'Formanalyse kan forankres i katalogførte egenskaper som format, materiale, teknikk, mål og motiv før fortolkning.', ['kesf01-formmetode', 'kesf02-iversen'], ['kesf-grunnlag-1', 'kesf-anvendelse-3']),
  claim('kesf-02', 'Poliakoffs Komposisjon fra 1953 organiserer kontrasterende farger, runde og kantete flater og er utført i olje på lerret.', ['kesf01-formmetode'], ['kesf-grunnlag-1', 'kesf-anvendelse-3']),
  claim('kesf-03', 'Rigmor Iversens Abstrakt komposisjon fra 1950 er grafikk utført i koldnål og rulett på papir og katalogført med abstrakt motiv.', ['kesf02-iversen'], ['kesf-grunnlag-1', 'kesf-anvendelse-3']),
  claim('kesf-04', 'Mountains of the Mind bygger på videoopptak av landskap som ble digitalt bearbeidet og trykt i storformat.', ['kesf03-mountains'], ['kesf-grunnlag-2']),
  claim('kesf-05', 'Nasjonalmuseet beskriver Mountains of the Mind som en pikselert abstraksjon med landskapsreferanse og en relasjon til, men produksjonsmessig forskjell fra, abstrakt ekspresjonisme.', ['kesf03-mountains'], ['kesf-grunnlag-2']),
  claim('kesf-06', 'MUNCH dokumenterer at Skrik-figuren ble gradvis mer anonym og at motivet finnes i flere versjoner.', ['kesf07-scream'], ['kesf-grunnlag-2', 'kesf-anvendelse-2', 'kesf-anvendelse-3']),
  claim('kesf-07', 'Madonna finnes i fem malte versjoner samt tegninger og grafiske versjoner.', ['kesf08-madonna'], ['kesf-grunnlag-3']),
  claim('kesf-08', 'En tidlig Madonna-ramme med sædceller og foster ble fjernet fra maleriet, mens motivene ble integrert i litografiets border.', ['kesf08-madonna'], ['kesf-grunnlag-3']),
  claim('kesf-09', 'MUNCH anslår at 250–300 avtrykk av Madonna-litografiet finnes og eier selv 115 avtrykk.', ['kesf08-madonna'], ['kesf-grunnlag-3']),
  claim('kesf-10', 'MUNCH beskriver Munchs eksperimentering på tvers av maleri, grafikk, tegning, skulptur, foto og film.', ['kesf05-munch-artist', 'kesf06-creativity'], ['kesf-fordypning-1']),
  claim('kesf-11', 'Munch møtte kritikk for uferdig preg og sterke farger og realiserte motiver gjennom ulike komposisjoner, farger og malemåter.', ['kesf06-creativity'], ['kesf-fordypning-1']),
  claim('kesf-12', 'Munch brukte en trykt Skrik-versjon i publikasjoner, og Warhol laget i 1984 store silketrykk etter Munchs litografi.', ['kesf07-scream'], ['kesf-fordypning-1', 'kesf-anvendelse-2']),
  claim('kesf-13', 'Prosjekt Gjerdeløa ble realisert ved at en om lag 350 år gammel løe ble flyttet fra Tafjord til Paris i 1980 og senere tilbake.', ['kesf13-heske-afm'], ['kesf-fordypning-2']),
  claim('kesf-14', 'tour – Retour stilte den historiske løa sammen med en transparent harpiksavstøpning og Tidemands Fra Gudvangen.', ['kesf13-heske-afm'], ['kesf-fordypning-2']),
  claim('kesf-15', 'Nasjonalmuseet registrerer Prosjekt Gjerdeløa som en fotoinstallasjon datert 1980–1981/2011.', ['kesf04-gjerdeloa'], ['kesf-fordypning-2', 'kesf-anvendelse-3']),
  claim('kesf-16', 'Astrup Fearnley beskriver Koons som del av readymade- og appropriasjonstradisjonen og fremhever hverdagsobjekt, material perfeksjon og oppskalert format.', ['kesf14-koons'], ['kesf-fordypning-3', 'kesf-anvendelse-3']),
  claim('kesf-17', 'Everyday Aesthetics beskrev appropriasjon av masseproduserte bilder og varer og Sherrie Levines bruk av mannlige forløperes verk.', ['kesf15-everyday'], ['kesf-fordypning-3']),
  claim('kesf-18', 'Rotating Views #2 skilte historisk mellom popkunstens massebilder og senere appropriasjonskunstneres rolle som formidlere og manipulatorer av eksisterende bilder.', ['kesf16-rotating'], ['kesf-fordypning-3', 'kesf-anvendelse-3']),
  claim('kesf-19', 'Vigelandsparken består av over 200 skulpturer i granitt, bronse og smijern og er resultat av mer enn 40 års arbeid.', ['kesf10-park'], ['kesf-anvendelse-1', 'kesf-anvendelse-3']),
  claim('kesf-20', 'Monolitten er 17 meter høy, hugget i én steinblokk og fremstiller 121 menneskefigurer.', ['kesf11-monolith'], ['kesf-anvendelse-1', 'kesf-anvendelse-3']),
  claim('kesf-21', 'Vigelandmuseet presenterer oppstandelse og åndelig lengsel som tolkninger av Monolitten, ikke som en entydig definisjon.', ['kesf11-monolith'], ['kesf-anvendelse-1', 'kesf-anvendelse-3']),
  claim('kesf-22', 'MUNCH dokumenterer at Skrik har sirkulert gjennom Warhol, reklame, film og andre populærkulturelle sammenhenger.', ['kesf07-scream'], ['kesf-anvendelse-2']),
  claim('kesf-23', 'Vigelandmuseets tidslinje daterer utplassering og ferdigstilling av ulike deler av parken over flere tiår.', ['kesf12-timeline'], ['kesf-anvendelse-3']),
  claim('kesf-24', 'MUNCH dokumenterer at Vampire finnes i flere versjoner i maleri, tegning og grafikk og at motivets tittel har endret forståelsesramme.', ['kesf09-vampire'], ['kesf-anvendelse-3'])
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
    primary_domain_id: 'estetisk_sprak_form',
    emne_ids: emneIds
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 2, 'Kunst må starte dette steget med to kapitler');
    subject.chapters.push(registryChapter);
  } else {
    assert(subject.chapters.length === 3, 'Reproduksjon forventer nøyaktig tre Kunst-kapitler');
    subject.chapters[existingIndex] = registryChapter;
  }
  subject.canonicalModel.note = 'Kunstfagets seks canonicale fagområder eier rendererstrukturen. Felt og institusjon, Produksjon og praksis og Estetisk språk og form er materialisert som fulltekst- og claimsporede kapitler; tre områder står igjen i kapittelproduksjon.';
  registry.version = '2.55.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'kunst');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Kunst må starte fra chapters_in_progress');
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Kunst har seks canonicale fagområder og 21 aktive emner. Estetisk språk og form dekker nå sine 4 emner gjennom tre moduler, ni seksjoner, 27 claimsporede fagavsnitt, 24 verifiserte claims og 16 inspiserbare primærkilder. Tre av seks områder er materialisert; tre gjenstår, derfor står faget korrekt som chapters_in_progress.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter);
  writeJson(CHAPTER_DIR + '/brief.json', brief);
  for (const [file, value] of Object.entries(modules)) writeJson(CHAPTER_DIR + '/' + file, value);
  writeJson(CHAPTER_DIR + '/claims.json', claimsDoc);
  updateRegistry();
  updateStatus();
  console.log('Materialiserte Kunst/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder.');
}

main();
