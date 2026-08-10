#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'medieokonomi-eierskap-og-arbeid';
const CHAPTER_DIR = 'data/fagverk/media/' + CHAPTER_ID;
const CHAPTER_FILE = CHAPTER_DIR + '.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), JSON.stringify(value, null, 2) + '\n'); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_media_annonseokonomi', 'em_media_arbeidsdeling', 'em_media_betalingsmur',
  'em_media_desk_utvikling_design', 'em_media_digitalisering_av_redaksjon', 'em_media_frilans_og_press',
  'em_media_journalistisk_arbeidsliv', 'em_media_klikklogikk', 'em_media_kommersialisering_media',
  'em_media_konsernstruktur', 'em_media_lisens_og_finansiering', 'em_media_medieeierskap',
  'em_media_mediekonsern', 'em_media_nedbemanning', 'em_media_public_service_okonomi',
  'em_media_publikumsmarked', 'em_media_redaksjonell_kapasitet', 'em_media_sentralisering',
  'em_media_teknologisk_omstilling', 'em_media_tilgang_og_abonnement'
];
const methodIds = [
  'met_media_abonnementsanalyse', 'met_media_annonseokonomisk_analyse', 'met_media_arbeidsdelingsanalyse',
  'met_media_arbeidslivsanalyse', 'met_media_betalingsmuranalyse', 'met_media_digitaliseringsanalyse',
  'met_media_eierskapsanalyse', 'met_media_finansieringsanalyse', 'met_media_frilansanalyse',
  'met_media_kapasitetsanalyse', 'met_media_klikklogikkanalyse', 'met_media_kommersialiseringsanalyse',
  'met_media_konsernanalyse', 'met_media_nedbemanningsanalyse', 'met_media_omstillinganalyse',
  'met_media_produksjonsanalyse', 'met_media_public_service_analyse', 'met_media_publikumsmarkedsanalyse',
  'met_media_sentraliseringsanalyse'
];
const relatedPlaces = [
  { id: 'aftenposten_akersgata', name: 'Aftenposten i Akersgata', role: 'Kartlegg forholdet mellom historisk redaksjonell merkevare, eier, konsernfunksjoner, abonnement og redaktøransvar.' },
  { id: 'vg_huset', name: 'VG-huset', role: 'Undersøk hvordan annonsemarked, direkte brukerinntekter, data og publiseringsmålinger virker sammen uten å gjøre klikk til eneste kvalitetsmål.' },
  { id: 'nrk_huset_marienlyst', name: 'NRK-huset på Marienlyst', role: 'Skill offentlig finansiering, samfunnsoppdrag, tilsyn og redaksjonell uavhengighet i analysen av public service-økonomi.' },
  { id: 'dagbladet_akersgata', name: 'Dagbladet i Akersgata', role: 'Følg digital omstilling, konserntilknytning og arbeidsdeling mellom journalistikk, desk, produkt, design og distribusjon.' }
];
const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({ id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds });

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'media', subject_id: 'media',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'medieokonomi_eierskap_arbeid',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Medieøkonomi, eierskap og arbeid: hvem betaler for journalistikken?',
  subtitle: 'Eiere, annonse- og publikumsmarked, abonnement, arbeidsliv, teknologi og offentlig finansiering',
  lead: 'Journalistikk blir til i organisasjoner som må finansiere produksjon, lønne arbeid, velge teknologi og fordele makt. Kapittelet lærer brukeren å følge penger, eierskap, redaktøransvar, arbeidsvilkår, publikum og infrastruktur som separate spor. Slik kan økonomisk press og omstilling analyseres uten å gjøre enhver eier til innholdsredaktør, enhver måling til kvalitetsdom eller offentlig finansiering til statlig instruksjon.',
  learningObjectives: [
    'kartlegge eier, konsern, redaksjonell merkevare og ansvarlig redaktør som separate roller',
    'skille omsetning, kostnad, resultat og realverdi i medieøkonomiske tidsserier',
    'analysere annonsemarked, publikumsmarked, abonnement, betalingsmur og tilgang hver for seg',
    'sammenligne arbeidstaker- og frilansvilkår uten å forveksle honorar og lønn',
    'måle redaksjonell kapasitet med oppgaver, geografi, tid og kompetanse – ikke bare antall ansatte',
    'prøve påstander om konsern, sentralisering, kommersialisering og klikklogikk mot konkrete mekanismer',
    'analysere digitalisering, automatisering og arbeidsdeling mellom journalistikk, desk, utvikling og design',
    'skille finansieringsform, allmennkringkastingsoppdrag, tilsyn og redaksjonell uavhengighet'
  ],
  diagnosticQuestions: [
    { question: 'Bestemmer eieren innholdet i hver artikkel?', answer: 'Ikke etter medieansvarslovens redaktørmodell. Eierskap kan forme rammer og ressurser, mens ansvarlig redaktør har den løpende redaksjonelle beslutningsmyndigheten.' },
    { question: 'Er høyere omsetning det samme som bedre økonomi?', answer: 'Nei. Omsetning må skilles fra kostnader og resultat, og nominell vekst må justeres for prisvekst.' },
    { question: 'Betyr færre årsverk automatisk mindre journalistikk?', answer: 'Ikke automatisk. Kapasitet må måles i dekningsområder, tid, kompetanse og produksjon, men store kutt kan redusere hva redaksjonen faktisk rekker.' },
    { question: 'Er offentlig finansiering det samme som statlig styring av innhold?', answer: 'Nei. Finansiering, samfunnsoppdrag, tilsyn og redaktørens uavhengighet er forskjellige institusjonelle spor.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const distinctions = [
  'eierskap vs redaksjonell kontroll', 'eier vs ansvarlig redaktør', 'konsern vs redaksjonell merkevare',
  'eierkonsentrasjon vs innholdslikhet', 'omsetning vs resultat', 'nominell vekst vs realvekst',
  'annonsemarked vs publikumsmarked', 'rekkevidde vs betalende relasjon', 'betalingsmur vs abonnement',
  'tilgangsbegrensning vs utestengingshensikt', 'abonnement vs medlemskap og pakkesalg', 'arbeidstaker vs frilanser',
  'honorar vs lønn', 'frihet vs sikkerhetsnett', 'nedbemanning vs redaksjonell kapasitet',
  'årsverk vs faktisk dekning', 'effektivitet vs kvalitet', 'konsern vs fellesfunksjon',
  'sentralisering vs innholdsstandardisering', 'kommersialisering vs all inntekt', 'klikk vs offentlig verdi',
  'måling vs redaksjonelt mandat', 'digitalisering vs automatisering', 'verktøystøtte vs redaksjonelt ansvar',
  'arbeidsdeling vs silo', 'desk vs utvikling og design', 'offentlig finansiering vs statlig instruksjon',
  'lisensfinansiering vs budsjettfinansiering', 'allmennkringkasting vs statsmedium', 'mediestøtte vs betaling for bestemt innhold'
];
const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID,
  primary_domain_id: 'medieokonomi_eierskap_arbeid', relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Medias sjette og siste canonicale domene med claimsporet undervisning i medieeierskap, finansiering, publikumsmarked, arbeidsliv, konsern, kommersialisering, teknologi og public service-økonomi.',
  audience: 'Brukere som skal kunne rekonstruere hvordan penger, eiere, organisering, arbeidsvilkår og teknologi påvirker journalistikken uten å kortslutte analysen fra struktur til bestemt innhold.',
  learningArc: ['kartlegge eierskap og redaktøransvar', 'lese inntekter og realøkonomi', 'analysere abonnement og tilgang', 'sammenligne arbeidstaker og frilanser', 'måle kapasitet etter nedbemanning', 'undersøke konsern og sentralisering', 'prøve klikk- og kommersialiseringspåstander', 'kartlegge digital arbeidsdeling', 'skille public service-finansiering og innholdsstyring'],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds, requiredCriticalDistinctions: distinctions,
  sourceStrategy: {
    priority: ['norsk lov, tilsynsdata og offentlige utredninger om eierskap, økonomi, mediestøtte og allmennkringkasting', 'tariffavtaler, arbeidsrett og åpen forskning om journalistisk arbeid og frilans', 'årsrapporter og bransjerapporter om konsern, teknologi og omstilling', 'primærforskning og faglitteratur om politisk økonomi, data og redaksjonelle målinger'],
    minimumExternalSources: 20, claimLevelTrace: true, sourceLocationsRequired: true, currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: ['medieeierskap og konsernstruktur', 'annonse- og publikumsmarked', 'betalingsmur, abonnement og tilgang', 'journalistisk arbeidsliv og frilans', 'nedbemanning og redaksjonell kapasitet', 'mediekonsern og sentralisering', 'kommersialisering, klikklogikk og målinger', 'teknologisk omstilling og redaksjonell arbeidsdeling', 'public service-økonomi, lisens og finansiering'],
    excluded: ['eierskap brukt som automatisk bevis på instruksjon i enkeltsaker', 'nominelle kroner brukt som realvekst', 'klikk brukt som komplett kvalitetsmål', 'årsverk brukt alene som kapasitetsmål', 'frilanshonorar behandlet som direkte sammenlignbar lønn', 'offentlig støtte brukt som automatisk bevis på statlig innholdsstyring', 'fagkart brukt som faktakilde']
  },
  qa: { exactCanonicalCoverage: '20/20', minimumModules: 3, minimumSections: 9, paragraphClaimTraceRequired: true, rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction'] }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('mea-grunnlag-1', 'Eierskap, konsern og redaktøransvar er forskjellige maktlag', [
        'Medietilsynet målte at Amedia, Schibsted og Polaris kontrollerte 74,5 prosent av samlet avisopplag i 2024. Tallet beskriver eierkonsentrasjon, ikke automatisk likt innhold; analysen må også vise redaksjonelle merker, geografi, fellesfunksjoner og lokale beslutninger.',
        'Medieansvarsloven forbyr eier og selskapsledelse å instruere eller overprøve redaktøren i redaksjonelle spørsmål. Eieren kan fastsette formål og økonomiske rammer, men en påstand om konkret innholdsstyring må dokumentere mer enn eierskapet.',
        'Ved Aftenposten i Akersgata kan eierkjede, styre, konsernfunksjoner, ansvarlig redaktør og publiserende redaksjon tegnes som separate lag. Årsrapporter viser hvordan konsern deler teknologi og kompetanse samtidig som de beskriver distinkte merkevarer og direkte brukerrelasjoner.'
      ], [['mea-01'], ['mea-02'], ['mea-03']], ['Kartlegg juridisk eier, konsernfunksjoner, merkevare og redaktør hver for seg.', 'Skill strukturell påvirkning fra dokumentert instruksjon i en enkeltsak.'], [['mea-01', 'mea-02'], ['mea-02', 'mea-03']]),
      section('mea-grunnlag-2', 'Inntektsmiksen må leses i både nominelle og reelle kroner', [
        'Norske avis-, radio- og tv-virksomheter omsatte samlet for 28,3 milliarder kroner i 2024. Nominelt var det vekst fra 2020, men korrigert for prisstigning var omsetningen lavere; omsetning er dessuten ikke det samme som overskudd.',
        'Foreløpige avistall for 2025 viser at abonnementsvekst kunne veie opp for fall i annonser og løssalg, med en driftsmargin rundt fem prosent før produksjonstilskudd. Foreløpige regnskapstall må merkes som foreløpige og sammenlignes med kostnader og støtte.',
        'Globale aktører tok nær halvparten av det norske annonsemarkedet i 2024, mens avisenes brukerinntekter utgjorde en stadig større andel. Ved VG-huset bør annonsemarked, abonnement, rekkevidde og lønnsomhet derfor føres som fire ulike måleserier.'
      ], [['mea-04'], ['mea-05'], ['mea-06']], ['Juster tidsserier for prisvekst og skill omsetning fra resultat.', 'Før annonse- og publikumsmarkedet som separate inntektsstrømmer.'], [['mea-04', 'mea-05'], ['mea-05', 'mea-06']]),
      section('mea-grunnlag-3', 'Betalingsmur, abonnement og tilgang beskriver ulike relasjoner', [
        'Reuters Institute beskriver Norge som et marked med høy betalingsvilje for digitale nyheter, men uten ny vekst i andelen som betaler. Et abonnement kan gjelde én tittel, konserntilgang eller en pakke, så betalende relasjon og faktisk bruk må måles separat.',
        'Digital distribusjon har redusert enkelte produksjons- og distribusjonskostnader og gjort digitale betalingsløsninger mulige, men skalafordeler kan også styrke konsolidering. En betalingsmur er en tilgangsmekanisme; abonnementet er den økonomiske avtalen bak tilgangen.',
        'Betalingsmurer kan finansiere journalistikk og samtidig konsentrere bruk blant dem som betaler. Produksjonstilskudd, fri ungdomstilgang og andre tiltak kan utvide tilgang, men virkning må undersøkes i brukstall og mangfold – ikke utledes av tiltakets hensikt.'
      ], [['mea-07'], ['mea-08'], ['mea-09']], ['Skill betalingsmur, abonnementstype, faktisk bruk og publikumsprofil.', 'Analyser finansiering og tilgang som en dokumenterbar avveining.'], [['mea-07', 'mea-08'], ['mea-08', 'mea-09']])
    ],
    concepts: [
      { id: 'eierkonsentrasjon', term: 'Eierkonsentrasjon', definition: 'Hvor stor del av et mediemarked som kontrolleres av et lite antall eiere, målt med en eksplisitt markedsindikator.' },
      { id: 'redaktoransvar', term: 'Redaktøransvar', definition: 'Ansvarlig redaktørs selvstendige myndighet og rettslige ansvar for redaksjonelle beslutninger.' },
      { id: 'inntektsmiks', term: 'Inntektsmiks', definition: 'Fordelingen mellom annonser, abonnement, løssalg, støtte, lisensiering og andre inntektskilder.' },
      { id: 'publikumsmarked', term: 'Publikumsmarked', definition: 'Markedet der brukeren betaler direkte for tilgang, abonnement, medlemskap eller andre medietjenester.' },
      { id: 'redaksjonell-kapasitet', term: 'Redaksjonell kapasitet', definition: 'Redaksjonens faktiske evne til å dekke emner og områder med tilstrekkelig tid, kompetanse og produksjonsressurser.' },
      { id: 'public-service-okonomi', term: 'Public service-økonomi', definition: 'Finansierings- og styringsordninger som skal gjøre et bredt allmennkringkastingsoppdrag mulig uten å oppheve redaksjonell uavhengighet.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('mea-fordypning-1', 'Journalistisk arbeid har ulike kontrakter og risikofordelinger', [
        'Journalistavtalen regulerer blant annet arbeidstid, lønn, kompetanse og rettigheter i redaktørstyrte mediebedrifter. Avtaleverket viser at journalistisk frihet utøves innenfor organiserte arbeidsforhold, produksjonskrav og teknologisk endring.',
        'NJs veiledende frilanssatser bygger på lønnsnivå og tillegg for sosiale og driftsmessige kostnader som oppdragsgiver ikke dekker som ved ansettelse. Et frilanshonorar kan derfor ikke sammenlignes krone for krone med lønn.',
        'Norske frilansundersøkelser beskriver samtidig høy opplevd frihet og trivsel og lave inntekter, uforutsigbarhet og svakere sikkerhetsnett. Arbeidslivsanalysen må beholde både autonomi og sårbarhet som empiriske dimensjoner.'
      ], [['mea-10'], ['mea-11'], ['mea-12']], ['Skill kontraktsform, lønn eller honorar, rettigheter og risiko.', 'Mål frihet og sårbarhet separat i frilansarbeid.'], [['mea-10', 'mea-11'], ['mea-11', 'mea-12']]),
      section('mea-fordypning-2', 'Nedbemanning må oversettes til faktisk redaksjonell kapasitet', [
        'Nedbemanning kan følge sviktende inntekter, omorganisering eller teknologisk endring, mens arbeidsmiljøloven stiller krav om saklig grunn ved oppsigelse. Økonomisk begrunnelse og lovlig arbeidsprosess er to forskjellige vurderinger.',
        'NRKs bemanning falt fra 3 402 faste årsverk i 2018 til 3 139 i januar 2025, og journalistiske årsverk falt fra 2021 til 2025. Tallene viser endring i bemanning, men kapasitet krever også kartlegging av roller, geografi, dekningsfelt og tid.',
        'Digitalisering og kunstig intelligens kan effektivisere deler av produksjonen, samtidig som kutt kan redusere journalistisk bredde og investering kan flytte kompetanse. Kvalitetsvirkningen må påvises i konkrete oppgaver og publiseringer, ikke antas fra sparebeløpet.'
      ], [['mea-13'], ['mea-14'], ['mea-15']], ['Skill begrunnelsen for kutt fra arbeidsrettslig prosess.', 'Mål kapasitet gjennom dekning, kompetanse og tid i tillegg til årsverk.'], [['mea-13'], ['mea-14', 'mea-15']]),
      section('mea-fordypning-3', 'Konsern og sentralisering kan gi både deling og avhengighet', [
        'Mediekonsern kan kjøpe titler, dele teknologi, annonseplattform, abonnementssystem og analysekompetanse, mens redaksjonelle merkevarer består. Konserntilhørighet og fellesfunksjon er derfor ikke det samme som én felles redaksjon.',
        'Sentralisering kan redusere kostnader og gi tilgang til spesialkompetanse, men kan også flytte beslutninger og standardisere produksjon. Effekten må måles i hvilke oppgaver som flyttes, hvem som beslutter, og hvordan lokalt innhold og kapasitet endres.',
        'Medieansvarslovens redaktørvern gjelder også i konsern. En full konsernanalyse kombinerer derfor eierskap, finansiering, felles infrastruktur, arbeidsdeling og redaksjonell beslutningsmyndighet uten å slå lagene sammen.'
      ], [['mea-16'], ['mea-17'], ['mea-18']], ['Kartlegg hva konsernet deler og hva den enkelte redaksjonen beholder.', 'Test sentraliseringens økonomiske og redaksjonelle virkninger hver for seg.'], [['mea-16', 'mea-17'], ['mea-17', 'mea-18']])
    ],
    workedExamples: [
      { id: 'mea-eksempel-1', title: 'Tegn et eier- og ansvarskart', situation: 'En avis inngår i et stort konsern med felles teknologi.', analysis: ['Finn juridisk eier, styre og konsernfunksjoner.', 'Identifiser ansvarlig redaktør og redaksjonelle beslutningslinjer.', 'Marker hva som er dokumentert ramme, deling og eventuell instruksjon.'] },
      { id: 'mea-eksempel-2', title: 'Les et kutt uten å telle blindt', situation: 'Redaksjonen reduserer ti årsverk.', analysis: ['Finn roller, geografi og dekningsfelt før og etter.', 'Registrer teknologi, omfordeling og innkjøpt frilansarbeid.', 'Mål publiseringsbredde, tidsbruk og kildearbeid over tid.'] },
      { id: 'mea-eksempel-3', title: 'Auditér en klikkpåstand', situation: 'En redaksjon sies å styres bare av sidevisninger.', analysis: ['Kartlegg hvilke målinger som er synlige for hvem.', 'Følg én sak fra idé via pakking til oppfølging.', 'Sammenlign målebruk med mandat, abonnement og redaksjonell begrunnelse.'] }
    ],
    commonMisconceptions: [
      { claim: 'Eieren bestemmer automatisk hva avisen skriver.', correction: 'Eierskap former rammer, men redaktøransvaret beskytter løpende redaksjonelle beslutninger; konkret instruksjon må dokumenteres.' },
      { claim: 'Stigende omsetning betyr at mediene er blitt rikere.', correction: 'Omsetning må skilles fra resultat og kostnader, og nominelle kroner må justeres for prisvekst.' },
      { claim: 'Et høyt frilanshonorar er høyere lønn enn en ansatts.', correction: 'Honoraret skal også dekke ferie, pensjon, sykefravær, administrasjon og driftskostnader som ligger utenfor ansattlønnen.' },
      { claim: 'Færre årsverk beviser nøyaktig hvor mye journalistikk som forsvinner.', correction: 'Årsverk er et viktig inngangsmål, men faktisk kapasitet avhenger også av oppgaver, teknologi, kompetanse, geografi og tid.' },
      { claim: 'Alle publikumsmålinger gjør journalistikken klikkstyrt.', correction: 'Målinger kan brukes til plassering, pakking, planlegging og læring; styringseffekten må dokumenteres i beslutningsprosessen.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('mea-anvendelse-1', 'Kommersialisering og klikklogikk må påvises i beslutninger', [
        'Politisk økonomi undersøker hvordan varer, eierskap, romlige markeder og sosial organisering former kommunikasjon. Kommersialisering betyr ikke at all inntekt er mistenkelig, men at økonomiske krav og markedsrelasjoner blir relevante forklaringsspor.',
        'Publikums oppmerksomhet og data kan inngå som økonomiske ressurser i annonse- og plattformmarkeder. Smythe, Couldry, Mejias og Zuboff gir ulike teorier om dette; de er analytiske rammer som må prøves mot den konkrete medievirksomhetens inntekter og datapraksis.',
        'Redaksjonell analyse brukes blant annet til plassering, pakking, planlegging, sammenligning og forståelse av publikum. At en måling finnes beviser ikke at den overstyrer redaktørmandatet; beslutningsanalyse må vise hvem som brukte tallet, når og til hva.'
      ], [['mea-19'], ['mea-20'], ['mea-21']], ['Knytt kommersialisering til en dokumentert inntekts- eller beslutningsmekanisme.', 'Skill analyseverktøyets bruk fra en normativ dom over saken.'], [['mea-19', 'mea-20'], ['mea-21', 'mea-22']]),
      section('mea-anvendelse-2', 'Teknologisk omstilling fordeler oppgaver og ansvar på nytt', [
        'Digital distribusjon har endret kostnader, betalingsmuligheter, publiseringstakt og inngangsterskler. Digitalisering er en bred overgang i infrastruktur og arbeidsflyt; automatisering er den snevrere overføringen av bestemte oppgaver til systemer.',
        'Års- og bransjerapporter beskriver kunstig intelligens, plattformutvikling og nye produktformer som sentrale omstillingsfelt. Effektivitetspotensialet opphever ikke behovet for opplæring, kontroll, kildekritikk og navngitt redaksjonelt ansvar.',
        'Ved Dagbladet i Akersgata kan en produksjonsanalyse følge idé, rapportering, redigering, visualisering, design, utvikling og distribusjon. Arbeidsdeling er nødvendig koordinering, men blir en silo når informasjon og ansvar ikke følger saken mellom rollene.'
      ], [['mea-23'], ['mea-24'], ['mea-25']], ['Skill digitaliseringens infrastruktur fra automatisering av enkeltoppgaver.', 'Kartlegg menneskelig kontroll og ansvar gjennom hele produksjonskjeden.'], [['mea-23', 'mea-24'], ['mea-24', 'mea-25']]),
      section('mea-anvendelse-3', 'Allmennkringkasting krever separate finansierings- og uavhengighetsspor', [
        'NRK gikk fra kringkastingsavgift til finansiering over statsbudsjettet fra 2020, med flerårige styringssignaler som del av modellen. Lisens og budsjett er ulike finansieringsmekanismer; ingen av dem beskriver alene den redaksjonelle beslutningslinjen.',
        'Mediestøtteloven skal fremme ytringsmangfold og forutsigbare økonomiske rammer gjennom armlengdes organisering. Produksjonstilskudd gis etter regler til virksomheter, ikke som betaling for bestemte artikler eller standpunkter.',
        'Ved NRK-huset må finansieringsvedtak, allmennkringkastingsoppdrag, Medietilsynets kontroll og ansvarlig redaktørs beslutninger føres i fire kolonner. Offentlig finansiering kan skape ramme- og avhengighetsspørsmål, men statlig innholdsinstruksjon må dokumenteres særskilt.'
      ], [['mea-26'], ['mea-27'], ['mea-27']], ['Skill finansieringskilde, oppdrag, tilsyn og redaksjonell beslutning.', 'Prøv uavhengighet gjennom formelle regler og konkrete inngrep, ikke finansieringsetiketten alene.'], [['mea-26', 'mea-27'], ['mea-18', 'mea-27']])
    ],
    applicationTasks: [
      { id: 'mea-oppgave-1', title: 'Eierskapskart', task: 'Kartlegg én medievirksomhet fra eier til publiserende redaksjon.', prompts: ['Hvilke juridiske og økonomiske lag finnes?', 'Hva deles i konsernet?', 'Hvem har redaksjonell beslutningsmyndighet?'] },
      { id: 'mea-oppgave-2', title: 'Inntektsaudit', task: 'Sammenlign tre år med inntekter og resultat.', prompts: ['Er tallene nominelle eller reelle?', 'Hvordan endres annonse- og brukerinntekter?', 'Hvilke støtte- og kostnadsposter påvirker resultatet?'] },
      { id: 'mea-oppgave-3', title: 'Arbeidslivskart', task: 'Sammenlign en ansatt og en frilanser i samme produksjon.', prompts: ['Hvem bærer risiko og driftskostnader?', 'Hvilke rettigheter og tidskrav gjelder?', 'Hvordan påvirker kontrakten kilde- og produksjonstid?'] },
      { id: 'mea-oppgave-4', title: 'Kapasitetsmåling', task: 'Undersøk virkningene av en dokumentert omorganisering.', prompts: ['Hvilke årsverk og roller endres?', 'Hvilke felt og steder dekkes før og etter?', 'Hvilke alternative forklaringer finnes for produksjonsendringen?'] },
      { id: 'mea-oppgave-5', title: 'Public service-matrise', task: 'Analyser finansiering og styring av en allmennkringkaster.', prompts: ['Hvem vedtar finansieringen?', 'Hvem fastsetter og kontrollerer oppdraget?', 'Hvem avgjør den konkrete publiseringen?'] }
    ],
    selfCheck: [
      { question: 'Hvorfor beviser eierkonsentrasjon ikke innholdslikhet?', answer: 'Fordi markedsandel må suppleres med redaksjonelle merker, beslutningslinjer, geografi, fellesfunksjoner og faktisk innhold.' },
      { question: 'Hva skiller nominell og reell vekst?', answer: 'Reell vekst justerer beløpet for prisendring, mens nominell vekst sammenligner løpende kroner.' },
      { question: 'Hva skiller betalingsmur og abonnement?', answer: 'Betalingsmuren regulerer tilgang; abonnementet er avtalen og inntektsrelasjonen som kan gi tilgang.' },
      { question: 'Hvorfor kan honorar ikke sammenlignes direkte med lønn?', answer: 'Frilanseren må dekke sosiale rettigheter, fravær, administrasjon og drift som arbeidsgiver ellers bærer.' },
      { question: 'Hvordan måles redaksjonell kapasitet?', answer: 'Med årsverk og roller, men også dekningsfelt, geografi, kompetanse, tidsbruk og faktisk produksjon.' },
      { question: 'Når er en redaksjon klikkstyrt?', answer: 'Når beslutningssporet viser at klikkmål systematisk overstyrer andre redaksjonelle kriterier; tilgang til målinger alene er ikke nok.' },
      { question: 'Hva skiller offentlig finansiering fra statlig innholdsstyring?', answer: 'Finansieringen fastsetter ressurser, mens innholdsstyring krever dokumentert instruksjon eller inngrep i redaktørens konkrete beslutninger.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({ id, publisher, title, url, source_location, type, label: publisher + ' – ' + title });
const sources = [
  source('mea01-medietilsynet-eierskap', 'Medietilsynet', 'Avsendermangfoldsrapporten 2025', 'https://www.medietilsynet.no/globalassets/publikasjoner/mediemangfoldsregnskap/260121_avsendermangfoldsrapport25.pdf', 'Side 12–15 og resultatdelen om eierandeler, de tre største aviskonsernene, konsolidering, transparens og indikatorer for avsendermangfold', 'regulator-report'),
  source('mea02-medieansvarsloven', 'Lovdata', 'Lov om redaksjonell uavhengighet og ansvar i redaktørstyrte journalistiske medier', 'https://lovdata.no/lov/2020-05-29-59', 'Kapittel 3, særlig § 9 om redaktørens uavhengighet fra eier, utgiver og øvrig selskapsledelse i redaksjonelle spørsmål', 'legislation'),
  source('mea03-medietilsynet-okonomi-2024', 'Medietilsynet', 'Framleis låg lønnsemd for norske aviser og tv', 'https://www.medietilsynet.no/nyheter/aktuelt/framleis-lag-lonnsemd-for-norske-aviser-og-tv--medan-nasjonal-radio-held-fram-med-a-auka-lonnsemda/', 'Resultatdelen om samlet omsetning i 2024, nominell utvikling siden 2020, prisjustert utvikling og brukerinntektenes andel', 'regulator-current-data'),
  source('mea04-medietilsynet-aviser-2025', 'Medietilsynet', 'Økonomien i norske aviser 2021–2025', 'https://www.medietilsynet.no/fakta/rapporter/medieokonomi/2026/okonomien-i-norske-aviser-20212025/', 'Sammendraget og tabellene med foreløpige 2025-tall om abonnement, annonser, løssalg, driftsmargin og digitale annonseinntekter', 'regulator-current-data'),
  source('mea05-medietilsynet-annonser', 'Medietilsynet', 'Rekordlåge annonseinntekter for norske aviser i fjor', 'https://www.medietilsynet.no/nyheter/aktuelt/rekord-lage-annonseinntekter-for-norske-aviser-i-fjor/', 'Avsnittene om globale aktørers markedsandel, avisenes annonsefall, brukerinntektenes andel og forholdet mellom nett og papir i 2024', 'regulator-current-data'),
  source('mea06-reuters-norway', 'Reuters Institute for the Study of Journalism', 'Digital News Report 2026: Norway', 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/norway', 'Landkapitlets avsnitt om betalingsvilje, stagnasjon i betalt digitalnytt, abonnementstilbud og fri tilgang for unge', 'international-research-report'),
  source('mea07-oslo-economics', 'Oslo Economics og Medietilsynet', 'Redaktørstyrte mediers økonomiske forutsetninger', 'https://www.medietilsynet.no/globalassets/publikasjoner/medieokonomi/2025/250129-okonomiske-forutsetninger-for-redaktorstyrte-medier---utredning-oe.pdf', 'Side 6–7 og 63 om digital distribusjon, betaling, skalafordeler, konsolidering, betalingsmurer, kapasitet og produktivitet', 'commissioned-economic-report'),
  source('mea08-mediestotteloven', 'Lovdata', 'Lov om økonomisk støtte til mediene', 'https://lovdata.no/lov/2020-12-18-153', '§ 1 om ytringsmangfold, et bredt tilbud av redaktørstyrte journalistiske medier, forutsigbare rammer og armlengdes avstand', 'legislation'),
  source('mea09-produksjonstilskudd', 'Medietilsynet', 'Ti nye aviser får produksjonstilskudd', 'https://www.medietilsynet.no/nyheter/aktuelt/ti-nye-aviser-far-produksjonstilskudd/', '2025-vedtaket om samlet tilskudd, plattformnøytral ordning og formålet om mangfold av redaktørstyrte medier', 'regulator-decision'),
  source('mea10-nrk-mangfold', 'Medietilsynet', 'NRKs bidrag til mediemangfoldet', 'https://www.medietilsynet.no/fakta/rapporter/kringkasting/2026/nrks-bidrag-til-mediemangfoldet/', 'Bemanningsdelen med faste og journalistiske årsverk i 2018, 2021 og januar 2025 samt fordeling på roller og geografi', 'regulator-current-report'),
  source('mea11-nrk-aarsrapport', 'NRK', 'Årsrapport 2019', 'https://info.nrk.no/wp-content/uploads/2021/06/nrk_aarsrapport2019.pdf', 'Finansieringsdelen om overgangen fra kringkastingsavgift til statsbudsjett fra 2020 og varslede flerårige rammer', 'public-broadcaster-annual-report'),
  source('mea12-journalistavtalen', 'Norsk Journalistlag', 'Journalistavtalen for avis 2026–2028', 'https://www.nj.no/lonn-og-rettigheter/tariffavtaler/journalistavtalen-for-avis-mbl/', 'Bestemmelsene om arbeidstid, lønn, teknologisk utvikling, kompetanse, rasjonalisering og rettigheter ved gjenbruk', 'collective-agreement'),
  source('mea13-frilansjournalisten', 'Orkana Akademisk', 'Frilansjournalisten – fri og sårbar', 'https://www.orkana.no/wp-content/uploads/2025/12/frilansjournalisten.pdf', 'Kapitlene på side 27–43 og 185–197 om surveyene fra 2019 og 2024, autonomi, inntekt, usikkerhet og sikkerhetsnett', 'open-access-research-book'),
  source('mea14-frilanssatser', 'Norsk Journalistlag', 'Minstesatser for frilansere', 'https://www.nj.no/nj-frilans/minstesatser-for-frilansere/', 'Metodeforklaringen og satsene oppdatert 17. april 2026, med lønnsgrunnlag og tillegg for sosiale og driftsmessige kostnader', 'professional-rate-guidance'),
  source('mea15-arbeidsmiljoloven', 'Lovdata', 'Lov om arbeidsmiljø, arbeidstid og stillingsvern mv.', 'https://lovdata.no/lov/2005-06-17-62', 'Kapittel 15, særlig § 15-7 om krav til saklig grunn ved oppsigelse og vurdering av virksomhetens, arbeidsgivers eller arbeidstakers forhold', 'legislation'),
  source('mea16-schibsted-2025', 'Schibsted', 'Annual Report 2025', 'https://cdn.schibsted.com/wp-content/uploads/2026/06/30093957/Schibsted-Annual-Report-2025.pdf', 'Innledningen og strategidelen om nordisk konsolidering, distinkte merkevarer, direkte brukerrelasjoner, delte kapabiliteter, digital inntekt og KI', 'company-annual-report'),
  source('mea17-amedia-2025', 'Amedia', 'Årsrapport 2025', 'https://www.amedia.no/images/dokumenter/2261085%20Arsrapport%202025.pdf', 'Virksomhets- og strategidelene om konsernets eierskap, lokale redaksjonelle merker, felles tjenester, oppkjøp og digitale abonnementsvirksomhet', 'company-annual-report'),
  source('mea18-mbl-2035', 'Mediebedriftenes Landsforening', 'Fremtidens redaktørstyrte medier 2035', 'https://www.mediebedriftene.no/siteassets/dokumenter/sluttrapport_fremtidens-redaktorstyrte-medier.pdf', 'Scenario- og anbefalingsdelene om teknologi, KI, kompetanse, arbeidsdeling og bærekraftige forretningsmodeller fram mot 2035', 'industry-foresight-report'),
  source('mea19-mosco', 'SAGE Knowledge', 'The Political Economy of Communication', 'https://sk.sagepub.com/book/mono/the-political-economy-of-communication/toc', 'Innholdsfortegnelsen og rammeverkskapitlene om commodification, spatialization og structuration i kommunikasjonsanalyse', 'scholarly-monograph'),
  source('mea20-smythe', 'Canadian Journal of Political and Social Theory', 'Communications: Blindspot of Western Marxism', 'https://journals.uvic.ca/index.php/ctheory/article/view/13715', 'Artikkelens argument om publikum som vare og arbeid i reklamefinansierte kommunikasjonssystemer', 'scholarly-article'),
  source('mea21-couldry-mejias', 'Stanford University Press', 'The Costs of Connection', 'https://www.sup.org/books/sociology/costs-connection', 'Bokbeskrivelsen og rammeverket om datarelasjoner, utvinning og makt i digitale infrastrukturer', 'scholarly-monograph'),
  source('mea22-zuboff', 'Journal of Information Technology', 'Big Other: Surveillance Capitalism and the Prospects of an Information Civilization', 'https://aisel.aisnet.org/jit/vol30/iss1/10/', 'Artikkelens begreper om atferdsdata, prediksjon og overvåkingsbasert forretningsmodell', 'scholarly-article'),
  source('mea23-reuters-analytics', 'Reuters Institute for the Study of Journalism', 'Editorial analytics: how news media are developing and using audience data and metrics', 'https://reutersinstitute.politics.ox.ac.uk/sites/default/files/research/files/Editorial%2520analytics%2520-%2520how%2520news%2520media%2520are%2520developing%2520and%2520using%2520audience%2520data%2520and%2520metrics.pdf', 'Rapportdelene om redaksjonelle analyseverktøy, organisering, beslutninger, begrensninger og forholdet mellom målinger og redaksjonelle mål', 'international-research-report'),
  source('mea24-lamot-paulussen', 'Journalism Practice', 'Six Uses of Analytics: Digital Editors’ Perceptions of Audience Analytics in the Newsroom', 'https://doi.org/10.1080/17512786.2019.1617043', 'Metode- og resultatdelene om seks bruksmåter: plassering, pakking, planlegging, imitasjon, prestasjonsvurdering og publikumsforståelse', 'primary-research-article')
];
const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('mea-01', 'Amedia, Schibsted og Polaris kontrollerte til sammen 74,5 prosent av samlet norsk avisopplag i 2024, men eierandel må skilles fra redaksjonell innholdslikhet.', ['mea01-medietilsynet-eierskap'], ['mea-grunnlag-1']),
  claim('mea-02', 'Medieansvarsloven beskytter ansvarlig redaktørs beslutningsmyndighet mot instruksjon og overprøving fra eier og selskapsledelse i redaksjonelle spørsmål.', ['mea02-medieansvarsloven'], ['mea-grunnlag-1']),
  claim('mea-03', 'Store mediekonsern beskriver deling av teknologi og kompetanse samtidig som de opprettholder særskilte redaksjonelle merkevarer og brukerrelasjoner.', ['mea16-schibsted-2025', 'mea17-amedia-2025'], ['mea-grunnlag-1']),
  claim('mea-04', 'Samlet medieomsetning i 2024 var høyere enn i 2020 nominelt, men lavere korrigert for prisvekst, og omsetning er ikke resultat.', ['mea03-medietilsynet-okonomi-2024'], ['mea-grunnlag-2']),
  claim('mea-05', 'Foreløpige 2025-tall viste at abonnementsinntekter veide opp for fall i annonse- og løssalgsinntekter, med om lag fem prosent driftsmargin før støtte.', ['mea04-medietilsynet-aviser-2025'], ['mea-grunnlag-2']),
  claim('mea-06', 'Globale aktører tok nær halvparten av annonsemarkedet i 2024, samtidig som brukerinntekter var blitt avisenes største inntektskilde.', ['mea05-medietilsynet-annonser'], ['mea-grunnlag-2']),
  claim('mea-07', 'Norge hadde høy betalingsvilje for digitale nyheter i 2026, men ingen ny vekst i andelen som betalte, og tilbudene omfattet ulike abonnements- og tilgangsmodeller.', ['mea06-reuters-norway'], ['mea-grunnlag-3']),
  claim('mea-08', 'Digital distribusjon har redusert enkelte kostnader og muliggjort digital betaling, mens skalafordeler og betalingsmurer kan bidra til konsolidering og konsentrert bruk.', ['mea07-oslo-economics'], ['mea-grunnlag-3']),
  claim('mea-09', 'Produksjonstilskudd og tilgangstiltak har som formål å styrke mangfold og tilgang, men faktisk virkning må undersøkes empirisk.', ['mea09-produksjonstilskudd', 'mea06-reuters-norway', 'mea07-oslo-economics'], ['mea-grunnlag-3']),
  claim('mea-10', 'Journalistavtalen regulerer sentrale arbeidsvilkår, kompetanse og rettigheter også når teknologi og produksjonsformer endres.', ['mea12-journalistavtalen'], ['mea-fordypning-1']),
  claim('mea-11', 'Veiledende frilanssatser legger til sosiale og driftsmessige kostnader som gjør honorar og ansattlønn ikke direkte sammenlignbare.', ['mea14-frilanssatser', 'mea13-frilansjournalisten'], ['mea-fordypning-1']),
  claim('mea-12', 'Norske frilansundersøkelser dokumenterer både autonomi og trivsel og økonomisk usikkerhet, lave inntekter og svakere sikkerhetsnett.', ['mea13-frilansjournalisten'], ['mea-fordypning-1']),
  claim('mea-13', 'Nedbemanning kan begrunnes økonomisk eller organisatorisk, mens oppsigelser samtidig må oppfylle arbeidsmiljølovens krav til saklig grunn.', ['mea15-arbeidsmiljoloven', 'mea16-schibsted-2025'], ['mea-fordypning-2']),
  claim('mea-14', 'NRKs faste og journalistiske årsverk gikk ned fram mot 2025, men kapasitetsanalyse må supplere bemanning med roller, geografi og oppgaver.', ['mea10-nrk-mangfold'], ['mea-fordypning-2']),
  claim('mea-15', 'Teknologi kan øke produktivitet og flytte kompetanse, mens kutt kan svekke kapasitet; kvalitetseffekten må måles i konkrete redaksjonelle funksjoner.', ['mea07-oslo-economics', 'mea16-schibsted-2025'], ['mea-fordypning-2']),
  claim('mea-16', 'Mediekonsern kombinerer oppkjøp og felles infrastruktur med flere redaksjonelle merker, slik at konsern ikke er synonymt med én redaksjon.', ['mea01-medietilsynet-eierskap', 'mea16-schibsted-2025', 'mea17-amedia-2025'], ['mea-fordypning-3']),
  claim('mea-17', 'Sentralisering kan gi kostnads- og kompetansegevinster og samtidig flytte beslutninger; virkningen må påvises i arbeidsdeling, kostnad og lokalt innhold.', ['mea01-medietilsynet-eierskap', 'mea07-oslo-economics', 'mea17-amedia-2025'], ['mea-fordypning-3']),
  claim('mea-18', 'Redaktørens lovfestede uavhengighet består i konsern og må analyseres sammen med økonomiske rammer, fellesfunksjoner og faktisk beslutningspraksis.', ['mea02-medieansvarsloven'], ['mea-fordypning-3', 'mea-anvendelse-3']),
  claim('mea-19', 'Politisk økonomi tilbyr et rammeverk for å analysere varegjøring, romlig organisering og sosiale strukturer i kommunikasjon.', ['mea19-mosco'], ['mea-anvendelse-1']),
  claim('mea-20', 'Oppmerksomhet og data kan være økonomiske ressurser i reklame- og plattformmodeller, men teoriene må prøves mot den konkrete virksomhetens praksis.', ['mea20-smythe', 'mea21-couldry-mejias', 'mea22-zuboff'], ['mea-anvendelse-1']),
  claim('mea-21', 'Redaksjonell analyse brukes på flere måter, blant annet til plassering, pakking, planlegging, prestasjonsvurdering og publikumsforståelse.', ['mea24-lamot-paulussen'], ['mea-anvendelse-1']),
  claim('mea-22', 'Publikumsmålinger informerer redaksjonelle valg, men deres styringseffekt avhenger av organisasjon, mål og faktisk bruk i beslutninger.', ['mea23-reuters-analytics', 'mea24-lamot-paulussen'], ['mea-anvendelse-1']),
  claim('mea-23', 'Digitalisering har endret distribusjonskostnader, betaling og arbeidsflyt, mens automatisering gjelder overføring av avgrensede oppgaver til systemer.', ['mea07-oslo-economics'], ['mea-anvendelse-2']),
  claim('mea-24', 'KI og teknologisk omstilling kan endre redaksjonelt arbeid, men krever kompetanse, kontroll og tydelig plassering av ansvar.', ['mea16-schibsted-2025', 'mea18-mbl-2035'], ['mea-anvendelse-2']),
  claim('mea-25', 'Redaksjonell produksjon fordeler oppgaver mellom journalistikk, redigering, design, utvikling og distribusjon innenfor organiserte arbeids- og kompetanserammer.', ['mea12-journalistavtalen', 'mea18-mbl-2035'], ['mea-anvendelse-2']),
  claim('mea-26', 'NRKs finansiering gikk fra kringkastingsavgift til statsbudsjett fra 2020, med flerårige rammer som del av finansieringsmodellen.', ['mea11-nrk-aarsrapport'], ['mea-anvendelse-3']),
  claim('mea-27', 'Mediestøtte og offentlig kringkastingsfinansiering må skilles fra innholdsinstruksjon gjennom formål, armlengdes organisering, tilsyn og redaktøransvar.', ['mea08-mediestotteloven', 'mea09-produksjonstilskudd', 'mea02-medieansvarsloven', 'mea10-nrk-mangfold'], ['mea-anvendelse-3'])
];
const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID, sources, claims };

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.media;
  assert(subject && Array.isArray(subject.chapters), 'Media mangler kapittelliste i fagverkregisteret');
  const previousIds = ['presse-redaksjoner-og-avishus', 'offentlighet-ytringsfrihet-og-medieetikk', 'kilder-kritikk-og-sannhet', 'plattformer-algoritmer-og-distribusjon', 'propaganda-pavirkning-og-informasjonskrig'];
  assert(previousIds.every((id, index) => subject.chapters[index]?.id === id), 'De fem første Media-kapitlene er ikke bevart');
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE, primary_domain_id: 'medieokonomi_eierskap_arbeid', emne_ids: emneIds };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) { assert(subject.chapters.length === 5, 'Media må starte dette steget med nøyaktig fem kapitler'); subject.chapters.push(registryChapter); }
  else { assert(existingIndex === 5 && subject.chapters.length === 6, 'Reproduksjon forventer Media-kapittelet som nummer seks'); subject.chapters[existingIndex] = registryChapter; }
  subject.canonicalModel.note = 'Medias seks canonicale hovedområder eier rendererstrukturen og er materialisert som fulltekst- og claimsporede kapitler. Populærkultur bevares som et komplett nested mediefelt.';
  subject.editorialPlan = { completionRequirements: ['all_canonical_domains_materialized', 'all_canonical_emners_covered_exactly_once', 'paragraph_claim_trace_complete', 'full_subject_audit_green'] };
  registry.version = '2.64.0'; registry.updatedAt = '2026-08-10'; writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'media');
  assert(['chapters_in_progress', 'complete'].includes(subject?.editorialStatus), 'Media må starte fra dokumentert kapittelproduksjon eller komplett reproduksjon');
  subject.editorialStatus = 'complete'; subject.nextGate = 'maintenance_source_refresh_and_place_case_expansion';
  subject.note = 'Media har 6 canonicale hovedområder og 120 aktive hovedemner, alle materialisert i seks fulltekst- og claimsporede kapitler. Medieøkonomi, eierskap og arbeid fullfører faget med 20/20 emner, 19 canonicale metoder, 3 moduler, 9 seksjoner, 27 fagavsnitt, 27 verifiserte claims, 24 inspiserbare kilder og 4 stedscase. En separat helhetsaudit låser alle domener, eksakt emnedekning og fagets samlede innhold. Populærkultur forblir et komplett nested mediefelt med 56 emner.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter); writeJson(CHAPTER_DIR + '/brief.json', brief);
  for (const [file, value] of Object.entries(modules)) writeJson(CHAPTER_DIR + '/' + file, value);
  writeJson(CHAPTER_DIR + '/claims.json', claimsDoc); updateRegistry(); updateStatus();
  console.log('Materialiserte Media/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder. Media er komplett.');
}

main();
