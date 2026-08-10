#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'plattformer-algoritmer-og-distribusjon';
const CHAPTER_DIR = 'data/fagverk/media/' + CHAPTER_ID;
const CHAPTER_FILE = CHAPTER_DIR + '.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), JSON.stringify(value, null, 2) + '\n'); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_media_algoritmisk_prioritering', 'em_media_annonsemodell', 'em_media_deling_viralitet',
  'em_media_digital_glemsel', 'em_media_digital_offentlighet', 'em_media_distribusjonsmakt',
  'em_media_feed_synlighet', 'em_media_informasjonsarkitektur', 'em_media_metrikk_klikk',
  'em_media_moderering', 'em_media_nettverkseffekt', 'em_media_nyhetstempo',
  'em_media_oppmerksomhetsokonomi', 'em_media_plattformavhengighet', 'em_media_plattformmakt',
  'em_media_plattformregler', 'em_media_publikumsdata', 'em_media_pushvarsel',
  'em_media_sok_finnbarhet', 'em_media_sokbar_hukommelse'
];
const methodIds = [
  'met_media_feedanalyse', 'met_media_algoritmeanalyse', 'met_media_annonseanalyse',
  'met_media_oppmerksomhetsanalyse', 'met_media_delingsanalyse', 'met_media_viralitetsanalyse',
  'met_media_glemselsanalyse', 'met_media_hukommelsesanalyse', 'met_media_plattformanalyse',
  'met_media_digital_offentlighetsanalyse', 'met_media_avhengighetsanalyse',
  'met_media_distribusjonsanalyse', 'met_media_sokeanalyse', 'met_media_finnbarhetsanalyse',
  'met_media_metrikkanalyse', 'met_media_klikkonanalyse', 'met_media_modereringsanalyse',
  'met_media_regelanalyse', 'met_media_pushanalyse', 'met_media_tempoanalyse'
];
const relatedPlaces = [
  { id: 'vg_huset', name: 'VG-huset', role: 'Følg hvordan forside, personalisering, publikumsdata og pushvarsler kobler redaksjonelle valg til direkte og plattformstyrt distribusjon.' },
  { id: 'fornebu_teknologipark', name: 'Telenor hovedkontor – Fornebu', role: 'Skill nettet som transportinfrastruktur fra plattformenes sortering, moderering og kommersielle synlighetsmakt.' },
  { id: 'deichman_bjorvika', name: 'Deichman Bjørvika', role: 'Undersøk hvordan katalog, metadata, søk og digitalt bokkart gjør samlinger finn- og navigerbare før noen anbefalingsalgoritme rangerer dem.' },
  { id: 'telegrafbygningen', name: 'Telegrafbygningen', role: 'Sammenlign telegrafens og telefonens sentraliserte forbindelsesarkitektur med dagens nettverk, plattformer og distribusjonsavhengighet.' }
];
const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({ id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds });

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'media', subject_id: 'media',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'plattformer_algoritmer_distribusjon',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Plattformer, algoritmer og distribusjon: hvem styrer synligheten?',
  subtitle: 'Fra nettinfrastruktur, feed og søk til deling, moderering, annonsemodeller, pushvarsler og digital hukommelse',
  lead: 'Digital distribusjon er ikke ett teknisk rør. Nettet transporterer, plattformen setter regler, algoritmen rangerer, redaksjonen prioriterer, brukeren handler og målesystemet gjør noen reaksjoner synlige. Kapittelet lærer brukeren å skille disse lagene, slik at verken kode, klikk, viralitet, moderering eller søkbarhet blir forvekslet med sannhet, kvalitet eller fri offentlighet.',
  learningObjectives: [
    'skille fysisk nettinfrastruktur, nettnøytralitet, plattformregler og algoritmisk rangering',
    'rekonstruere hvilke signaler, mål og brukerhandlinger som former en feed uten å dikte algoritmens intensjon',
    'analysere crawling, indeksering, informasjonsarkitektur, rangering og finnbarhet som forskjellige trinn',
    'skille deling, rekkevidde, nettverkseffekt og strukturell viralitet fra tilslutning og sannhet',
    'prøve moderering mot plattformregel, lovgrunnlag, begrunnelse og klagemulighet',
    'analysere annonsemodell, profilering, oppmerksomhet, publikumsdata og metrikk uten å gjøre proxy til verdi',
    'sammenligne direktekanaler, pushvarsler og tredjepartsplattformer som ulike former for distribusjonsmakt',
    'skille sletting, avindeksering, arkivering og søkbar hukommelse'
  ],
  diagnosticQuestions: [
    { question: 'Bestemmer internettleverandøren hva som ligger øverst i en sosial feed?', answer: 'Normalt nei. Nettet transporterer trafikken, mens plattformens anbefalingssystem og regler styrer feedens utvalg og rekkefølge.' },
    { question: 'Betyr mange delinger at innholdet er sant eller støttet?', answer: 'Nei. Delinger dokumenterer sirkulasjonshandlinger; motiv, unik rekkevidde og sannhet krever egne spor.' },
    { question: 'Er moderert innhold bevist falskt eller ulovlig?', answer: 'Nei. Moderering kan bygge på en privat plattformregel, en risikovurdering eller lov, og vedtaket må undersøkes konkret.' },
    { question: 'Forsvinner en nettside når et navnesøk avindekseres?', answer: 'Nei. Treffet kan fjernes fra bestemte søk selv om kildesiden fortsatt finnes og kan nås på andre måter.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID,
  primary_domain_id: 'plattformer_algoritmer_distribusjon', relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Medias fjerde canonicale domene med claimsporet undervisning i nettinfrastruktur, plattformmakt, algoritmisk synlighet, søk, deling, moderering, annonsemodeller, metrikk, push og digital hukommelse.',
  audience: 'Brukere som skal kunne rekonstruere hvem som transporterer, sorterer, måler, fjerner, varsler og bevarer digitalt medieinnhold uten å gjøre systemets resultat til bevis på intensjon, kvalitet eller sannhet.',
  learningArc: ['tegne distribusjonsstakken fra nett til grensesnitt', 'reprodusere en feed- og rangeringsanalyse', 'følge søk fra crawling til synlig treff', 'kartlegge en delingskaskade', 'auditere modereringsregel og klagevei', 'følge annonse og publikumsdata', 'sammenligne push og plattformtrafikk', 'skille avindeksering, sletting og arkivering'],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'transport vs rangering', 'nettnøytralitet vs plattformnøytralitet', 'algoritme vs autonom intensjon',
    'personalisering vs faktarelevans', 'anbefalingssignal vs forklaring av ett konkret treff',
    'indeksert vs synlig og høyt rangert', 'informasjonarkitektur vs søkealgoritme',
    'deling vs tilslutning', 'rekkevidde vs unike personer', 'broadcast vs strukturell viralitet',
    'moderering vs sensurdom', 'plattformregel vs lov', 'fjernet innhold vs falskt innhold',
    'annonse vs redaksjonelt innhold', 'publikumsdata vs komplett publikum', 'metrikk vs verdi',
    'klikk vs oppmerksomhet og tillit', 'direktekanal vs plattformavhengighet',
    'pushhastighet vs objektiv viktighet', 'tempo vs verifisering', 'avindeksering vs sletting av kilde',
    'rett til sletting vs absolutt glemsel', 'arkivkopi vs søkbar hukommelse'
  ],
  sourceStrategy: {
    priority: ['EU-regelverk og norske myndighetskilder om plattformer, personvern og nett', 'plattformenes egne dokumenterte rangerings- og søkesystemer', 'primærforskning om nettverkede offentligheter og viralitet', 'redaktørstyrte mediers og Reuters Institutes dokumenterte distribusjonspraksis'],
    minimumExternalSources: 18, claimLevelTrace: true, sourceLocationsRequired: true, currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: ['nett, plattform og distribusjonslag', 'feed, personalisering og algoritmisk prioritering', 'søk, metadata og finnbarhet', 'deling, nettverkseffekt og viralitet', 'moderering og plattformregler', 'annonser, oppmerksomhet, publikumsdata og metrikk', 'push, tempo, avhengighet og distribusjonsmakt', 'digital glemsel, avindeksering og arkiv'],
    excluded: ['algoritme omtalt som bevisst person', 'klikk brukt som kvalitetsmål', 'deling brukt som sannhetsbevis', 'moderering omtalt automatisk som lovlig sensur', 'søkefravær brukt som bevis på sletting', 'fagkart brukt som faktakilde']
  },
  qa: { exactCanonicalCoverage: '20/20', minimumModules: 3, minimumSections: 9, paragraphClaimTraceRequired: true, rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction'] }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('pad-grunnlag-1', 'Distribusjon har flere tekniske og institusjonelle lag', [
        'Nkom definerer nettnøytralitet som lik og ikke-diskriminerende behandling av internettrafikk uavhengig av avsender, mottaker, utstyr, applikasjon, tjeneste eller innhold. Det gjelder transportlaget og betyr ikke at alle innlegg får lik synlighet inne på en plattform.',
        'Telenors beskrivelse av mobilnettet skiller basestasjon, regional transport, landsnett og kjernenett. På Fornebu kan disse lagene analyseres som infrastrukturen som flytter datapakker; feedrangering, moderering og annonsevalg skjer i andre systemer.',
        'Telegrafbygningen var Televerkets hovedbygg og del av en eldre sentralisert kommunikasjonsarkitektur. Historien viser at distribusjonsmakt fantes før digitale plattformer, men dagens makt må spesifiseres gjennom eierskap, protokoll, regel, data og rangeringsledd.'
      ], [['pad-01'], ['pad-02'], ['pad-03']], ['Tegn hele distribusjonsstakken før du plasserer ansvar.', 'Skill lik transport fra lik synlighet.'], [['pad-01', 'pad-02'], ['pad-01', 'pad-03']]),
      section('pad-grunnlag-2', 'Feedanalyse rekonstruerer signaler og mål – ikke en skjult personvilje', [
        'Meta beskriver Feed som innhold som velges og rangeres gjennom prediksjoner, innholdstrekk og andre signaler. Algoritmen er en regel- og modellkjede; den har ikke en autonom hensikt som kan leses direkte ut av ett resultat.',
        'TikTok beskriver For You-feeden som personlig rangering som justeres etter brukerinteraksjoner og eksplisitt tilbakemelding. Personalisering betyr derfor at to brukere kan få ulike utvalg, men ikke at systemet vet hva som er sant eller samfunnsviktig.',
        'DSA artikkel 27 krever forståelig informasjon om anbefalingssystemets hovedparametere og påvirkningsvalg. Slik åpenhet kan vise styringslogikken, men er ikke det samme som full kildekode eller en sikker årsaksforklaring for hvert enkelt innslag.'
      ], [['pad-04'], ['pad-05'], ['pad-06']], ['Registrer input, prediksjon, mål og output separat.', 'Dokumenter systemets uttalte parametere uten å dikte intensjon.'], [['pad-04', 'pad-05'], ['pad-06']]),
      section('pad-grunnlag-3', 'Søk og finnbarhet begynner før trefflisten', [
        'Google beskriver søk som tre hovedtrinn: crawling, indeksering og visning av søkeresultater. En side kan derfor finnes på nettet uten å være indeksert, og være indeksert uten å bli synlig høyt i et bestemt søk.',
        'Googles rangeringsveiledning beskriver automatiserte systemer som vurderer mange signaler. Teknisk kvalifisering, strukturert data eller god sideopplevelse garanterer ikke indeksering eller topplassering, og betaling kjøper ikke organisk crawling eller rangering.',
        'Deichman Bjørvikas digitale bokkart kobler katalogpost, bibliotek, hylleplass og kart. Caset viser at metadata og informasjonsarkitektur kan gjøre et objekt finnbart før en ekstern søkemotor rangerer det.'
      ], [['pad-07'], ['pad-08'], ['pad-09']], ['Skill crawling, indeks, rangering og grensesnitt.', 'Test metadata og navigasjon før du skylder på algoritmen.'], [['pad-07', 'pad-08'], ['pad-09']])
    ],
    concepts: [
      { id: 'plattform', term: 'Plattform', definition: 'En teknisk og institusjonell tjeneste som organiserer tilgang, regler, data, transaksjoner og synlighet mellom flere aktørgrupper.' },
      { id: 'anbefalingssystem', term: 'Anbefalingssystem', definition: 'Et system som velger eller rangerer informasjon for en mottaker ut fra parametere, signaler og et definert mål.' },
      { id: 'finnbarhet', term: 'Finnbarhet', definition: 'Hvor lett innhold kan oppdages gjennom metadata, lenker, navigasjon, søkeindeks og rangering.' },
      { id: 'nettverkseffekt', term: 'Nettverkseffekt', definition: 'At verdien eller rekkevidden til en tjeneste kan endres når flere brukere eller komplementære aktører deltar.' },
      { id: 'moderering', term: 'Moderering', definition: 'Regelstyrt vurdering, merking, nedrangering, begrensning eller fjerning av innhold og kontoer.' },
      { id: 'plattformavhengighet', term: 'Plattformavhengighet', definition: 'Sårbarhet som oppstår når tilgang til publikum, data eller inntekter styres av en tredjeparts vilkår og systemendringer.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('pad-fordypning-1', 'Deling og viralitet er målbare sirkulasjonsformer', [
        'danah boyd beskriver nettverkede offentligheter gjennom egenskaper som varighet, søkbarhet, kopierbarhet og skalerbar synlighet. Disse egenskapene endrer hvordan ytringer kan flyttes og gjenoppdages, men bestemmer ikke alene hvordan mennesker tolker dem.',
        'Goel og medforfattere skiller broadcast-lignende spredning fra flerleddet strukturell viralitet ved å analysere formen på delingskaskaden. Et stort publikum kan altså nås fra én stor avsender uten at innholdet har spredt seg viralt mellom mange ledd.',
        'Delingstall må derfor dekomponeres i originale poster, videresendinger, unike kontoer, tidsforløp og kaskadestruktur. En deling kan uttrykke støtte, kritikk, ironi eller lagring; den dokumenterer ikke alene tilslutning eller sannhet.'
      ], [['pad-10'], ['pad-11'], ['pad-12']], ['Mål kaskadens struktur, ikke bare totalsummen.', 'Skill sirkulasjonshandling fra motiv og sannhetsverdi.'], [['pad-11', 'pad-12'], ['pad-10', 'pad-12']]),
      section('pad-fordypning-2', 'Moderering må prøves mot riktig regel og klagevei', [
        'DSA skiller plattformens vilkår og innholdsmoderering fra statlig lovhåndheving og krever blant annet begrunnelse når synlighet eller tilgang begrenses. Analysen må derfor identifisere hvilken konkret regel og beslutningstype som er brukt.',
        'Regelverket gir brukere mekanismer for varsling, intern klage og utenrettslig tvisteløsning. Prosedyren gjør avgjørelsen etterprøvbar, men garanterer ikke at første vedtak eller klageresultatet er materielt riktig.',
        'Fjerning, merking og nedrangering er forskjellige inngrep. At innhold modereres beviser ikke i seg selv at innholdet er falskt eller ulovlig, og at innhold blir stående beviser heller ikke at plattformen går god for det.'
      ], [['pad-13'], ['pad-14'], ['pad-15']], ['Loggfør regel, inngrep, begrunnelse og anke hver for seg.', 'Skill plattformvedtak fra sannhets- og lovdom.'], [['pad-13', 'pad-14'], ['pad-15']]),
      section('pad-fordypning-3', 'Annonsemodellen gjør oppmerksomhet og data omsettelige', [
        'DSA krever at annonser merkes og at brukeren får informasjon om hvem som står bak og hvorfor annonsen vises. Det gjør den kommersielle rollen synligere, men skiller ikke automatisk all sponsing fra redaksjonelt stoff uten konkret analyse av presentasjonen.',
        'Datatilsynet beskriver hvordan aktivitet, interesser og plassering kan inngå i profilering for adferdsbasert markedsføring. En annonseanalyse må følge datakilde, behandlingsgrunnlag, segment, budsystem og eksponering – ikke bare annonsens bilde.',
        'Klikk, visningstid, åpning og deling er ulike proxyer. De kan måle registrerte handlinger i et system, men ikke hele publikummet, oppmerksomhetens kvalitet, tillit, forståelse eller journalistisk verdi.'
      ], [['pad-16'], ['pad-17'], ['pad-18']], ['Skill redaksjonell rolle, annonsemerke og målrettingsgrunnlag.', 'Navngi hva hver metrikk faktisk registrerer og hva den ikke måler.'], [['pad-16', 'pad-17'], ['pad-18']])
    ],
    workedExamples: [
      { id: 'pad-eksempel-1', title: 'Reproduser en feed', situation: 'To brukere får ulike nyhetsposter.', analysis: ['Lås konto, tidspunkt, følgerliste og historikk.', 'Registrer posisjon, merking og oppgitt anbefalingsgrunn.', 'Gjenta testen uten å slutte fra forskjell til skjult politisk intensjon.'] },
      { id: 'pad-eksempel-2', title: 'Kartlegg en delingskaskade', situation: 'En VG-sak omtales som viral.', analysis: ['Finn original publisering og første delere.', 'Skill stor broadcast-node fra flerleddet spredning.', 'Rapporter unike aktører, tidsforløp og ukjente motiv.'] },
      { id: 'pad-eksempel-3', title: 'Auditér et modereringsvedtak', situation: 'En journalistisk post blir nedrangert.', analysis: ['Finn regelversjon og beslutningsbegrunnelse.', 'Skill nedrangering fra fjerning og lovbrudd.', 'Følg intern klage og eventuelt tvisteløsningsspor.'] }
    ],
    commonMisconceptions: [
      { claim: 'Algoritmen bestemmer selv hva den vil vise.', correction: 'Mennesker og organisasjoner definerer data, mål, regler og system; modellen beregner innenfor denne sosiotekniske kjeden.' },
      { claim: 'Mange delinger betyr at saken er sann og støttet.', correction: 'Delinger viser sirkulasjon; sannhet, motiv og unike mottakere krever andre målinger.' },
      { claim: 'Moderert innhold er bevist ulovlig.', correction: 'Inngrepet kan bygge på privat regel eller risikostyring; lovlighet og faktisitet må vurderes separat.' },
      { claim: 'Flest klikk er det samme som best journalistikk.', correction: 'Klikk måler en registrert åpning, ikke automatisk lesing, forståelse, tillit eller samfunnsverdi.' },
      { claim: 'Nettnøytralitet gir alle poster lik plass i feeden.', correction: 'Nettnøytralitet gjelder transport av internettrafikk, ikke intern rangering i en plattform.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('pad-anvendelse-1', 'Redaksjoner kan personalisere og samtidig eie en redaksjonell forside', [
        'Schibsted beskriver en modell der manuelle toppsaker beholdes, mens algoritmer rangerer en liste under dem. Ved VG-huset må analysen derfor skille redaktørstyrt prioritering, personalisert modul og ekstern plattformdistribusjon.',
        'Medietilsynet beskriver en maktubalanse der globale plattformer styrer synlighet gjennom algoritmer, vilkår og moderering, samler brukerdata og tar annonseinntekter. Plattformavhengighet kan måles i trafikkandel, inntektsandel, datatilgang og konsekvens av regelendring.',
        'SSBs mediebarometer viser at sosiale medier og nettaviser er sentrale nyhetskilder, særlig for yngre grupper. Publikumsdata må likevel leses med alder, kanal, tidsmål og metode; registrerte brukere er ikke synonymt med hele offentligheten.'
      ], [['pad-19'], ['pad-20'], ['pad-21']], ['Skill redaksjonell kontroll fra ekstern distribusjonskontroll.', 'Mål avhengighet med konkrete trafikk-, data- og inntektsspor.'], [['pad-19', 'pad-20'], ['pad-20', 'pad-21']]),
      section('pad-anvendelse-2', 'Pushvarslet gjør redaksjonen til portvakt på låseskjermen', [
        'Reuters Institute beskriver mobilvarsler som en direkte kanal som kan bygge forhold mellom nyhetsmerke og bruker uten en sosial plattform som mellomledd. Kanalen er likevel avhengig av appbutikk, operativsystem, tillatelse og brukerens varselinnstillinger.',
        'Pushanalyse ved VG-huset registrerer tidspunkt, ordlyd, sakstype, oppdatering, målgruppe og vei til korrigert artikkel. Hurtig utsending dokumenterer redaksjonell hastegrad, ikke at hendelsen objektivt er viktigst eller fullstendig verifisert.',
        'Vær Varsom-plakatens krav om opplysningskontroll gjelder også under digitalt nyhetstempo. En push kan være kort, men kontrollsporet må fortsatt skille bekreftet informasjon, foreløpig opplysning og senere rettelse.'
      ], [['pad-22'], ['pad-23'], ['pad-24']], ['Analyser låseskjermen som egen knapp distribusjonsflate.', 'La tempo aldri erstatte opplysningskontroll og rettelsesspor.'], [['pad-22', 'pad-23'], ['pad-24']]),
      section('pad-anvendelse-3', 'Digital glemsel handler om flere kopier og flere former for synlighet', [
        'Datatilsynet presiserer at avindeksering fjerner bestemte søketreff, ikke selve kildesiden. Innholdet kan fortsatt nås med URL, andre søkeord, en annen søketjeneste eller fra et arkiv.',
        'Retten til sletting er ikke absolutt; personvern må blant annet avveies mot ytrings- og informasjonsfrihet, journalistikk og arkivformål. En glemselsanalyse må derfor registrere behandlingsansvarlig, kopi, formål, jurisdiksjon og beslutning.',
        'Nasjonalbibliotekets Nettarkiv høster norske nettsteder for dokumentasjon. Arkivert, publisert, indeksert og anbefalt er fire forskjellige statuser; digital hukommelse kan bestå selv når én plattform eller ett navnesøk slutter å vise innholdet.'
      ], [['pad-25'], ['pad-26'], ['pad-27']], ['Skill kilde, kopi, indeks, søketreff og arkivpost.', 'Dokumenter hva som faktisk er slettet, skjult, bevart eller fortsatt søkbart.'], [['pad-25', 'pad-26'], ['pad-27']])
    ],
    applicationTasks: [
      { id: 'pad-oppgave-1', title: 'Distribusjonskart', task: 'Tegn veien fra VG-publisering til leser.', prompts: ['Hvem transporterer datapakkene?', 'Hvem rangerer eller varsler?', 'Hvor finnes direkte og eksterne avhengigheter?'] },
      { id: 'pad-oppgave-2', title: 'Feedeksperiment', task: 'Sammenlign to kontrollerte feedøkter.', prompts: ['Hvilke variabler er låst?', 'Hvilke signaler oppgir plattformen?', 'Hvilke årsaker kan ikke bevises?'] },
      { id: 'pad-oppgave-3', title: 'Søk og bokkart', task: 'Følg ett verk gjennom Deichman og en ekstern søkemotor.', prompts: ['Hvilke metadata kreves?', 'Når blir objektet indeksert og synlig?', 'Hva skyldes informasjonsarkitektur?'] },
      { id: 'pad-oppgave-4', title: 'Metrikkaudit', task: 'Analyser dashboardet til en digital publisering.', prompts: ['Hva teller hver metrikk?', 'Hvilke brukere mangler?', 'Hvilke kvalitetsdommer kan ikke utledes?'] },
      { id: 'pad-oppgave-5', title: 'Digitalt glemselsspor', task: 'Følg en publisering som er avindeksert eller fjernet.', prompts: ['Finnes kildesiden fortsatt?', 'Hvilke kopier og arkiver finnes?', 'Hvilket retts- eller regelgrunnlag gjelder?'] }
    ],
    selfCheck: [
      { question: 'Hva skiller nettnøytralitet fra feedrangering?', answer: 'Nettnøytralitet gjelder ikke-diskriminerende trafikktransport; feedrangering velger rekkefølge og synlighet inne i en tjeneste.' },
      { question: 'Hva må en algoritmeanalyse registrere?', answer: 'Inputsignaler, modell eller regel, optimaliseringsmål, output, kontekst og usikkerhet.' },
      { question: 'Hva er forskjellen på broadcast og strukturell viralitet?', answer: 'Broadcast når mange fra få store noder; strukturell viralitet sprer seg gjennom flere delingsledd.' },
      { question: 'Hva beviser et modereringsvedtak?', answer: 'At plattformen har gjort et inngrep etter et bestemt spor, ikke automatisk at innholdet er falskt eller ulovlig.' },
      { question: 'Hvorfor er klikk en proxy?', answer: 'Det registrerer en handling i grensesnittet, ikke hele oppmerksomheten, forståelsen, tilliten eller verdien.' },
      { question: 'Hva gjør push til en direkte, men ikke uavhengig kanal?', answer: 'Redaksjonen når appbrukeren uten sosial feed, men er fortsatt avhengig av operativsystem, appbutikk, tillatelse og nett.' },
      { question: 'Hva fjernes ved avindeksering?', answer: 'Et søketreff i bestemte søk; kilden og andre kopier kan fortsatt eksistere.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({ id, publisher, title, url, source_location, type, label: publisher + ' – ' + title });
const sources = [
  source('pad01-nkom', 'Nasjonal kommunikasjonsmyndighet', 'Internett i Norge – Årsrapport 2024', 'https://nkom.no/rapporter-og-dokumenter/internett-i-norge-arsrapport-2024/_/attachment/download/d21d354d-893a-449d-b28f-4af64791182e%3A434c9e3aa16e349e1d5a8d01fbde1299f44e1dcc/Internett%20i%20Norge%20-%20%C3%85rsrapport%202024.pdf', 'Sammendraget og kapittel 1 om definisjon, regelverk og status for nettnøytralitet', 'regulator-report'),
  source('pad02-telenor', 'Telenor', 'Slik fungerer Telenors mobilnett', 'https://www.telenor.no/om/nettverk/telenors_mobilnett/', 'Delene om basestasjoner, RAN, Metro, landsnett og kjernenett', 'network-operator-documentation'),
  source('pad03-telemuseum', 'Norsk Teknisk Museum', 'Kartlegging av industridokumentasjon – Oslo', 'https://www.tekniskmuseum.no/forskningsfiler/1-industridokumentasjon-tilrapport-red/file', 'Registreringen av Telegrafbygningen, Kongens gate 21, som Televerkets hovedbygg fram til 1962', 'museum-documentation'),
  source('pad04-meta', 'Meta Transparency Center', 'Our Approach to Facebook Feed Ranking', 'https://transparency.meta.com/features/ranking-and-content/', 'Delene om valg, prediksjoner, signaler og rangering av innhold i Feed', 'platform-system-documentation'),
  source('pad05-tiktok', 'TikTok Newsroom', 'How TikTok recommends videos #ForYou', 'https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you', 'Delene om personlige anbefalinger, brukerinteraksjoner, videoinformasjon og innstillinger', 'platform-system-documentation'),
  source('pad06-google-search', 'Google Search Central', 'In-depth guide to how Google Search works', 'https://developers.google.com/search/docs/fundamentals/how-search-works', 'Delene om crawling, indeksering, serving og manglende garanti for synlighet', 'search-engine-documentation'),
  source('pad07-google-ranking', 'Google Search Central', 'A Guide to Google Search Ranking Systems', 'https://developers.google.com/search/docs/appearance/ranking-systems-guide', 'Oversikten over automatiserte rangeringssystemer, faktorer og signaler', 'search-engine-documentation'),
  source('pad08-dsa', 'Den europeiske union', 'Digital Services Act – Regulation (EU) 2022/2065', 'https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng', 'Artikkel 17 om begrunnelser, artikkel 20 om klage, artikkel 26 om annonser og artikkel 27 om anbefalingssystemer', 'eu-regulation'),
  source('pad09-eu-guide', 'Europakommisjonen', 'Digital Services Act: keeping us safe online', 'https://commission.europa.eu/news-and-media/news/digital-services-act-keeping-us-safe-online-2025-09-22_en', 'Delene om synlighetsbegrensning, klage, feedvalg og reklametransparens', 'eu-official-guidance'),
  source('pad10-deichman', 'Deichman', 'Lettere å finne fram i Bjørvika – prøv vårt digitale bokkart', 'https://deichman.no/aktuelt/lettere-%C3%A5-finne-fram-i-bj%C3%B8rvika-%E2%80%93-pr%C3%B8v-v%C3%A5rt-digitale-bokkart_77-wgPHwJ3', 'Trinnene fra katalogsøk og bibliotekvalg til hylleplassering i digitalt kart', 'library-service-documentation'),
  source('pad11-boyd', 'danah boyd', 'Social Network Sites as Networked Publics', 'https://www.danah.org/papers/2010/SNSasNetworkedPublics.pdf', 'Kapittelets analyse av persistens, søkbarhet, kopierbarhet, skalerbarhet og usynlige publikum', 'primary-research-chapter'),
  source('pad12-goel', 'INFORMS Management Science', 'The Structural Virality of Online Diffusion', 'https://pubsonline.informs.org/doi/10.1287/mnsc.2015.2158', 'Artikkelens definisjon og måling av broadcast-lignende og strukturelt viral spredning', 'primary-research-article'),
  source('pad13-datatilsynet-ads', 'Datatilsynet', 'Midlertidig forbud mot adferdsbasert markedsføring på Facebook og Instagram', 'https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2023/midlertidig-forbud-mot-adferdsbasert-markedsforing-pa-facebook-og-instagram/', 'Delene om sporing, profilering, datakategorier, markedsføringsformål og behandlingsgrunnlag', 'data-protection-decision'),
  source('pad14-ssb', 'Statistisk sentralbyrå', 'Norsk mediebarometer 2025', 'https://www.ssb.no/kultur-og-fritid/tids-og-mediebruk/artikler/norsk-mediebarometer-2025', 'Resultatene om sosiale medier og nettaviser som nyhetskilder fordelt på aldersgrupper', 'official-statistics'),
  source('pad15-medietilsynet', 'Medietilsynet', 'NRKs bidrag til mediemangfoldet 2026', 'https://www.medietilsynet.no/fakta/rapporter/kringkasting/2026/nrks-bidrag-til-mediemangfoldet/', 'Delene om digital distribusjon, globale plattformer, algoritmer, moderering, brukerdata og annonseinntekter', 'regulator-report'),
  source('pad16-schibsted', 'Schibsted', 'Personalisation can solve more problems than it creates', 'https://schibsted.com/news/personalisation-can-solve-more-problems-than-it-creates-also-for-democracy/', 'Beskrivelsen av manuelle toppsaker og algoritmisk rangering av artikler under dem', 'publisher-system-account'),
  source('pad17-reuters', 'Reuters Institute for the Study of Journalism', 'Walking the notification tightrope', 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025/walking-notification-tightrope-how-engage-audiences-while-avoiding', 'Analysen av mobilvarsler, direkte nyhetsrelasjon, brukerutvalg og risiko for overbelastning', 'journalism-research-report'),
  source('pad18-vvp', 'Norsk Presseforbund', 'Vær Varsom-plakaten 3.2', 'https://www.presse.no/vaer-varsom-plakaten/3-2', 'Punkt 3.2 om kritisk kildevalg, opplysningskontroll, bredde og relevans', 'professional-standards'),
  source('pad19-datatilsynet-search', 'Datatilsynet', 'Hvordan ber jeg om sletting av søketreff i søkemotorer?', 'https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/hvordan-slette-soketreff/', 'Delene om avindeksering, kildesiden, geografisk virkning og avveining mot informasjonsfriheten', 'data-protection-guidance'),
  source('pad20-nb', 'Nasjonalbiblioteket', 'Nettarkivet', 'https://www.nb.no/samlingen/nettarkivet/', 'Formålet og avsnittet om høsting av norske nettsteder etter pliktavleveringsloven', 'national-web-archive')
];
const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('pad-01', 'Nettnøytralitet gjelder lik og ikke-diskriminerende behandling av internettrafikk og må skilles fra plattformintern rangering.', ['pad01-nkom'], ['pad-grunnlag-1']),
  claim('pad-02', 'Et mobilnett består av flere transport- og kjernenettlag som er analytisk forskjellige fra applikasjonens feed og moderering.', ['pad02-telenor', 'pad01-nkom'], ['pad-grunnlag-1']),
  claim('pad-03', 'Telegrafbygningen var Televerkets hovedbygg fram til 1962 og dokumenterer en eldre sentralisert distribusjonsinfrastruktur.', ['pad03-telemuseum'], ['pad-grunnlag-1']),
  claim('pad-04', 'Meta beskriver Feed som innhold valgt og rangert gjennom prediksjoner, innholdstrekk og andre signaler.', ['pad04-meta'], ['pad-grunnlag-2']),
  claim('pad-05', 'TikToks For You-system rangerer innhold etter flere signaler og tilpasser anbefalingene gjennom brukerinteraksjoner og tilbakemelding.', ['pad05-tiktok'], ['pad-grunnlag-2']),
  claim('pad-06', 'DSA krever forståelig informasjon om anbefalingssystemets hovedparametere og brukerens mulighet til å påvirke dem.', ['pad08-dsa', 'pad09-eu-guide'], ['pad-grunnlag-2']),
  claim('pad-07', 'Google Search beskriver crawling, indeksering og visning av søkeresultater som forskjellige trinn.', ['pad06-google-search'], ['pad-grunnlag-3']),
  claim('pad-08', 'Rangeringssystemer vurderer mange signaler, og teknisk kvalifisering gir ingen garanti for indeksering eller topplassering.', ['pad06-google-search', 'pad07-google-ranking'], ['pad-grunnlag-3']),
  claim('pad-09', 'Deichmans digitale bokkart kobler katalogpost og bibliotekvalg til fysisk hylleplassering og viser informasjonsarkitekturens rolle i finnbarhet.', ['pad10-deichman'], ['pad-grunnlag-3']),
  claim('pad-10', 'Nettverkede offentligheter kjennetegnes blant annet av persistens, søkbarhet, kopierbarhet og skalerbarhet.', ['pad11-boyd'], ['pad-fordypning-1']),
  claim('pad-11', 'Strukturell viralitet måler delingskaskadens form og skiller flerleddet spredning fra broadcast-lignende rekkevidde.', ['pad12-goel'], ['pad-fordypning-1']),
  claim('pad-12', 'Et delingstall dokumenterer sirkulasjonshandlinger, men ikke alene unike mottakere, motiv, støtte eller sannhet.', ['pad11-boyd', 'pad12-goel'], ['pad-fordypning-1']),
  claim('pad-13', 'DSA krever begrunnelse ved bestemte modereringsinngrep og skiller plattformvilkår fra ulovlig innhold.', ['pad08-dsa', 'pad09-eu-guide'], ['pad-fordypning-2']),
  claim('pad-14', 'DSA etablerer interne klagemekanismer og mulighet for utenrettslig tvisteløsning ved plattformvedtak.', ['pad08-dsa', 'pad09-eu-guide'], ['pad-fordypning-2']),
  claim('pad-15', 'Fjerning, merking og nedrangering er ulike inngrep og utgjør ikke i seg selv en faktadom eller domstolsavgjørelse.', ['pad08-dsa'], ['pad-fordypning-2']),
  claim('pad-16', 'DSA krever reklamemerking og informasjon om annonsør og grunnlaget for at en annonse vises.', ['pad08-dsa', 'pad09-eu-guide'], ['pad-fordypning-3']),
  claim('pad-17', 'Adferdsbasert markedsføring kan bygge på detaljert sporing og profilering av aktivitet, plassering og interesser.', ['pad13-datatilsynet-ads'], ['pad-fordypning-3']),
  claim('pad-18', 'Klikk, visningstid, åpning og deling må behandles som forskjellige proxyer, ikke som direkte mål på journalistisk kvalitet.', ['pad15-medietilsynet', 'pad16-schibsted'], ['pad-fordypning-3']),
  claim('pad-19', 'Schibsted beskriver en hybridmodell med manuelt prioriterte toppsaker og algoritmisk rangering av en artikkelliste under dem.', ['pad16-schibsted'], ['pad-anvendelse-1']),
  claim('pad-20', 'Medietilsynet beskriver plattformmakt gjennom algoritmer, vilkår, moderering, brukerdata og annonseinntekter.', ['pad15-medietilsynet'], ['pad-anvendelse-1']),
  claim('pad-21', 'SSBs mediebarometer viser at sosiale medier og nettaviser er særlig sentrale nyhetskilder for yngre aldersgrupper.', ['pad14-ssb'], ['pad-anvendelse-1']),
  claim('pad-22', 'Mobilvarsler kan gi nyhetsmerker en direkte relasjon til appbrukere uten en sosial feed som mellomledd.', ['pad17-reuters'], ['pad-anvendelse-2']),
  claim('pad-23', 'Pushvarsler er en selektiv distribusjonskanal der utsendingstid og hastegrad ikke alene dokumenterer objektiv viktighet eller fullstendighet.', ['pad17-reuters'], ['pad-anvendelse-2']),
  claim('pad-24', 'Kravet om kildekritikk og opplysningskontroll gjelder også når nyheter publiseres i høyt digitalt tempo.', ['pad18-vvp'], ['pad-anvendelse-2']),
  claim('pad-25', 'Avindeksering kan fjerne et treff fra bestemte søk uten å fjerne selve nettsiden eller alle veier til den.', ['pad19-datatilsynet-search'], ['pad-anvendelse-3']),
  claim('pad-26', 'Sletting av søketreff krever en konkret avveining mellom personvern og allmennhetens informasjonsfrihet og er ikke absolutt.', ['pad19-datatilsynet-search'], ['pad-anvendelse-3']),
  claim('pad-27', 'Nettarkivet bevarer høstede norske nettsteder, slik at arkivering må skilles fra aktuell indeksering og anbefalt synlighet.', ['pad20-nb', 'pad19-datatilsynet-search'], ['pad-anvendelse-3'])
];
const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID, sources, claims };

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.media;
  assert(subject && Array.isArray(subject.chapters), 'Media mangler kapittelliste i fagverkregisteret');
  const previousIds = ['presse-redaksjoner-og-avishus', 'offentlighet-ytringsfrihet-og-medieetikk', 'kilder-kritikk-og-sannhet'];
  assert(previousIds.every((id, index) => subject.chapters[index]?.id === id), 'De tre første Media-kapitlene er ikke bevart');
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE, primary_domain_id: 'plattformer_algoritmer_distribusjon', emne_ids: emneIds };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) { assert(subject.chapters.length === 3, 'Media må starte dette steget med nøyaktig tre kapitler'); subject.chapters.push(registryChapter); }
  else { assert(existingIndex === 3 && subject.chapters.length === 4, 'Reproduksjon forventer Media-kapittelet som nummer fire'); subject.chapters[existingIndex] = registryChapter; }
  subject.canonicalModel.note = 'Medias seks canonicale hovedområder eier rendererstrukturen. De fire første områdene er materialisert som fulltekst- og claimsporede kapitler: Presse, redaksjoner og avishus; Offentlighet, ytringsfrihet og medieetikk; Kilder, kritikk og sannhet; og Plattformer, algoritmer og distribusjon. To hovedområder står igjen. Populærkultur bevares som et komplett nested mediefelt.';
  registry.version = '2.62.0'; registry.updatedAt = '2026-08-10'; writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'media');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Media må starte fra dokumentert kapittelproduksjon');
  subject.editorialStatus = 'chapters_in_progress'; subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Media har 6 canonicale hovedområder og 120 aktive hovedemner. Fire områder er nå materialisert: Presse, redaksjoner og avishus (21 emner), Offentlighet, ytringsfrihet og medieetikk (21 emner), Kilder, kritikk og sannhet (20 emner) og Plattformer, algoritmer og distribusjon (20 emner). Det nye kapittelet har 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims, 20 inspiserbare kilder og alle områdets 20 canonicale metoder. Totalt er 82 av 120 hovedemner dekket; to områder gjenstår. Populærkultur forblir et komplett nested mediefelt.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister'); assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter); writeJson(CHAPTER_DIR + '/brief.json', brief);
  for (const [file, value] of Object.entries(modules)) writeJson(CHAPTER_DIR + '/' + file, value);
  writeJson(CHAPTER_DIR + '/claims.json', claimsDoc); updateRegistry(); updateStatus();
  console.log('Materialiserte Media/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder.');
}

main();
