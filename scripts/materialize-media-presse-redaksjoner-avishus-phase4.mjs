#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'presse-redaksjoner-og-avishus';
const CHAPTER_DIR = 'data/fagverk/media/' + CHAPTER_ID;
const CHAPTER_FILE = CHAPTER_DIR + '.json';
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
  'em_media_av_og_tv_produksjon',
  'em_media_avisens_materielle_form',
  'em_media_avishus_offentlighetsrom',
  'em_media_byline_ansvar',
  'em_media_dagsorden',
  'em_media_forside_prioritering',
  'em_media_hendelse_og_presse',
  'em_media_journalist_kilde',
  'em_media_journalistisk_ansvar',
  'em_media_kildearbeid',
  'em_media_lokal_offentlighet',
  'em_media_lokalavis',
  'em_media_mediefellesskap',
  'em_media_mediehistorisk_endring',
  'em_media_nyhetsproduksjon',
  'em_media_nyhetssted',
  'em_media_pressehistorie',
  'em_media_presseklubb',
  'em_media_redaksjon_desk',
  'em_media_redaksjonell_institusjon',
  'em_media_trykkeri_materialitet'
];

const methodIds = [
  'met_media_trykkerianalyse',
  'met_media_materialitetsanalyse',
  'met_media_avishusanalyse',
  'met_media_institusjonsanalyse',
  'met_media_bylineanalyse',
  'met_media_ansvarsanalyse',
  'met_media_forsideanalyse',
  'met_media_dagsordenanalyse',
  'met_media_nyhetsstedsanalyse',
  'met_media_hendelsesanalyse',
  'met_media_journalistisk_analyse',
  'met_media_kildeanalyse',
  'met_media_lokalavisanalyse',
  'met_media_lokaloffentlighetsanalyse',
  'met_media_presseklubbanalyse',
  'met_media_fellesskapsanalyse',
  'met_media_pressehistorisk_analyse',
  'met_media_mediehistorisk_analyse',
  'met_media_produksjonsanalyse',
  'met_media_redaksjonsanalyse',
  'met_media_deskanalyse'
];

const relatedPlaces = [
  { id: 'aftenposten_akersgata', name: 'Aftenposten – Akersgata 51', role: 'Følg trykkeri, redaksjon, papirdesk, kildearbeid og Akersgatas lange pressehistorie.' },
  { id: 'vg_huset', name: 'VG-huset', role: 'Undersøk tabloidformat, nyhetsdesk, byline, redaksjonelt ansvar, åpne rettelser og flermedial publisering.' },
  { id: 'dagbladet_akersgata', name: 'Dagbladet – Akersgata 49', role: 'Les fotojournalistikk, redaksjonshistorie og avishuset som arbeidssted uten å gjøre bygningen til én samlet stemme.' },
  { id: 'nrk_huset_marienlyst', name: 'NRK-huset på Marienlyst', role: 'Analyser studio, kontrollrom, distriktsnettverk og redaksjonell-teknisk samproduksjon i radio, TV og nett.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'media', subject_id: 'media',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'presse_redaksjoner_avishus',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Presse, redaksjoner og avishus: hvordan nyheter blir til',
  subtitle: 'Fra trykkpresse, forside og Akersgata-desk til kildearbeid, rettelogg, lokal offentlighet og Marienlyst-produksjon',
  lead: 'Nyheter oppstår ikke idet en hendelse skjer. De blir valgt, undersøkt, redigert, formgitt, publisert, distribuert, rettet og arkivert av mennesker og tekniske systemer. Kapittelet lærer brukeren å undersøke avishuset som institusjon og arbeidssted uten å forveksle ett bygg, én byline eller én forside med hele journalistikken.',
  learningObjectives: [
    'analysere avisens format, trykk, sideinndeling og distribusjon som journalistiske betingelser',
    'skille hendelse, kildeutsagn, verifisert opplysning, redaksjonelt utvalg og publisert nyhet',
    'kartlegge reporter, vaktsjef, desk, fotograf, redaktør og teknisk produksjon uten å viske ut ansvar',
    'skille byline fra redaktørens og institusjonens samlede publiseringsansvar',
    'lese forside og sendeflate som prioritering, ikke som komplett bilde av virkeligheten',
    'undersøke avishus, presseklubb og lokalavis som ulike offentlighetsrom',
    'bruke rettelser og versjonsarkiv som spor etter journalistisk kvalitetssikring',
    'sammenligne papir-, nett-, lyd- og TV-produksjon gjennom fire canonicale Oslo-steder'
  ],
  diagnosticQuestions: [
    { question: 'Blir en hendelse automatisk en nyhet?', answer: 'Nei. Observasjon, kilder, verifisering, nyhetsvurdering, redigering og publisering ligger mellom hendelsen og nyheten.' },
    { question: 'Har bylineforfatteren alene ansvar for alt i saken?', answer: 'Nei. Bylinen synliggjør bidrag, mens redaktøren og mediet har et bredere ansvar for det publiserte produktet.' },
    { question: 'Viser forsiden dagens viktigste hendelser objektivt?', answer: 'Nei. Forsiden dokumenterer redaksjonens prioritering i en bestemt utgave og situasjon.' },
    { question: 'Er en rettet nettartikkel det samme som om feilen aldri ble publisert?', answer: 'Nei. Rettelse og rettelogg skal gjøre endringen etterprøvbar; arkivet må bevare publiseringshistorikken.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'media',
  chapter_id: CHAPTER_ID, primary_domain_id: 'presse_redaksjoner_avishus',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Medias første canonicale domene med kildebasert undervisning i avisformat, redaksjonsorganisering, kildearbeid, prioritering, pressehistorie, lokal offentlighet og audiovisuell produksjon.',
  audience: 'Brukere som skal kunne lese en avis, redaksjon eller sending som et dokumenterbart produksjonssystem uten å gjøre medieomtale, popularitet eller teori til faktakilde.',
  learningArc: [
    'starte i papir, trykk, side og historisk distribusjon',
    'kartlegge redaksjonens roller og beslutningspunkter',
    'skille kildeutsagn, kontroll og publisert påstand',
    'analysere forside, dagsorden og hendelsesutvalg',
    'undersøke avishus, nyhetssted og presseklubb som forskjellige rom',
    'prøve lokalavisens fellesskapsrolle mot dekningsdata og blindsoner',
    'lese rettelser og arkivversjoner som kvalitets- og historiespor',
    'avslutte med en produksjonsmatrise for fire Oslo-redaksjoner'
  ],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'hendelse vs publisert nyhet', 'kildeutsagn vs verifisert påstand',
    'anonym kilde vs ubegrunnet påstand', 'byline vs samlet redaktøransvar',
    'forside vs komplett hendelsesbilde', 'dagsorden vs bevis på objektiv viktighet',
    'publiseringshastighet vs dokumentert nøyaktighet', 'avishus vs én samlet aktør',
    'presseklubb vs redaksjonelt beslutningsrom', 'lokal dekning vs representativ offentlighet',
    'papirutgave vs identisk digital sekvens', 'rettelse vs slettet publiseringshistorikk'
  ],
  sourceStrategy: {
    priority: [
      'redaksjonenes egne historiske, metodiske, rettelses- og organisasjonskilder',
      'Norsk Redaktørforening og Norsk Presseforbunds ansvarskontrakter',
      'Nasjonalbibliotekets pressehistoriske og pliktavleveringskilder',
      'Pressens Hus og Medietilsynets dokumentasjon av offentlighet, lokaljournalistikk og allmennkringkasting'
    ],
    minimumExternalSources: 16, claimLevelTrace: true, sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'avisens materialitet, trykkeri, side, forside og arkiv',
      'redaksjon, desk, byline, kildearbeid, ansvar og rettelser',
      'avishus, nyhetssted, presseklubb, lokalavis og mediefellesskap',
      'radio-, TV- og nettproduksjon som redaksjonell og teknisk arbeidsdeling',
      'Aftenposten, VG, Dagbladet og NRK Marienlyst som canonicale stedscase'
    ],
    excluded: [
      'medieomtale brukt som bevis på at et sted er et medieproduksjonssted',
      'kildeutsagn gjengitt som ferdig verifisert fakta uten kontrollspor',
      'byline brukt som hele mediets ansvarskart',
      'forside eller seertall brukt som objektivt mål på samfunnsmessig viktighet',
      'avishus omtalt som én intensjon uten rolle- og beslutningsanalyse',
      'rettet tekst brukt uten å dokumentere at en tidligere publisering er endret'
    ]
  },
  qa: {
    exactCanonicalCoverage: '21/21', minimumModules: 3, minimumSections: 9,
    paragraphClaimTraceRequired: true,
    rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction']
  }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('mpr-grunnlag-1', 'Avisen er også et fysisk system', [
        'Materialitetsanalyse registrerer format, papir, trykk, spalter, bilder, sidetall, utgivelsesrytme og distribusjon før innholdet tolkes. Den trykte avisen tvinger redaksjonen til å fordele begrenset flate, mens nettutgaven kan endres løpende og ordnes gjennom andre innganger.',
        'Aftenpostens historie oppgir at avisen flyttet til Akersgata 51 i 1876 og tok i bruk en presse som kunne levere 3000 aviser i timen. Produksjonskapasiteten endret hvor raskt og bredt en ferdig redigert utgave kunne sirkulere, men bestemte ikke alene hvilke saker som ble valgt.',
        'Nasjonalbiblioteket krever fortløpende avlevering av avisutgaver og sideendringer. Arkivet viser dermed at en avis ikke bare er én tekst: utgave, tidspunkt, sideplassering og senere versjon må identifiseres før en historisk påstand sammenlignes.'
      ], [['mpr-01'], ['mpr-02'], ['mpr-03']], [
        'Beskriv mediets materielle og distribusjonsmessige ramme før budskapet generaliseres.',
        'Oppgi utgave og versjon; papirside og løpende nettside er ikke identiske sekvenser.'
      ], [['mpr-01', 'mpr-02'], ['mpr-03']]),
      section('mpr-grunnlag-2', 'Redaksjonen er en arbeidsdeling', [
        'En redaksjonsanalyse følger saken fra tips eller hendelse gjennom reporter, kildekontakt, dokumentasjon, foto, vaktsjef, desk, juridisk eller etisk vurdering, publisering og oppdatering. Avishuset samler roller, men er ikke én person eller én udelt intensjon.',
        'Aftenposten dokumenterte i 2020 at reportere og fotografer fortsatt arbeidet i felt mens papirdesk og store deler av redaksjonen produserte hjemmefra. Nyhetsproduksjon kan derfor være institusjonelt samordnet uten at alle sitter i samme bygg.',
        'VG oppgir ansvarlig redaktør, nyhetsredaktør, utviklingsredaktør og politisk redaktør sammen med redaksjonens besøksadresse. Rollene viser forskjellige beslutningsfelt; organisasjonskartet må likevel kobles til en konkret publisering før ansvar i én sak fordeles.'
      ], [['mpr-04'], ['mpr-05'], ['mpr-06']], [
        'Kartlegg overleveringer og beslutninger, ikke bare journalistens navn.',
        'Et avishus er institusjonell infrastruktur, ikke bevis på én samlet mening.'
      ], [['mpr-04', 'mpr-05'], ['mpr-06']]),
      section('mpr-grunnlag-3', 'Kilden leverer materiale – redaksjonen leverer påstanden', [
        'Kildeanalyse skiller hva en kilde hevder, hva kilden kan vite, hvilke interesser kilden har, og hva redaksjonen har kontrollert uavhengig. En navngitt kilde kan ta feil; en anonym kilde kan være nødvendig, men anonymitet kan ikke erstatte verifisering.',
        'VGs redaksjonelle trafikkregler krever som hovedregel at medarbeideren identifiserer seg som journalist, og at skjult eller falsk identitet bare brukes under strenge vilkår og redaksjonell godkjenning. Metodevalget er dermed et dokumenterbart beslutningspunkt.',
        'Bylinen synliggjør hvem som har bidratt, mens Redaktørplakaten legger det personlige og fulle innholdsansvaret til redaktøren. Bylinen er derfor et ansvarsspor, men ikke hele mediets kontroll- eller ansvarskjede.'
      ], [['mpr-07'], ['mpr-08'], ['mpr-09']], [
        'Skill kildeutsagn fra redaksjonens verifiserte og publiserte påstand.',
        'Anonymitet og byline må analyseres sammen med kontroll, ledelse og ansvar.'
      ], [['mpr-07', 'mpr-08'], ['mpr-09']])
    ],
    concepts: [
      { id: 'redaksjon', term: 'Redaksjon', definition: 'En organisert arbeids- og ansvarsstruktur som velger, kontrollerer, bearbeider og publiserer journalistisk innhold.' },
      { id: 'desk', term: 'Desk', definition: 'Funksjonen som samordner, redigerer, prioriterer, formgir og klargjør materiale for publisering.' },
      { id: 'byline', term: 'Byline', definition: 'Navngivning av journalistiske bidragsytere; et viktig spor, men ikke hele mediets ansvarskart.' },
      { id: 'kildearbeid', term: 'Kildearbeid', definition: 'Innhenting, vurdering, kryssjekking, beskyttelse og dokumentasjon av opplysninger fra personer og materiale.' },
      { id: 'dagsorden', term: 'Dagsorden', definition: 'Mønsteret av saker og problemer et medium gir oppmerksomhet og synlighet over tid.' },
      { id: 'rettelogg', term: 'Rettelogg', definition: 'En etterprøvbar oversikt over publiserte feil og endringer som viser at kvalitetssikring fortsetter etter publisering.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('mpr-fordypning-1', 'Forsiden prioriterer – den kopierer ikke dagen', [
        'Forsideanalyse registrerer hovedoppslag, størrelse, bilde, typografi, plassering, henvisninger og hva som ikke kom med. Forsiden viser redaksjonens prioritering i en bestemt utgave; den er ikke en komplett eller objektivt rangert liste over dagens hendelser.',
        'Aftenpostens tilbakeblikk på den siste Aften-utgaven brukte historiske forsider til å vise hvordan avisen hadde rammet inn store begivenheter og lokalstoff. Forsidene er verdifulle kilder til redaksjonell prioritering, men ikke til hele hendelsesforløpet eller publikums faktiske forståelse.',
        'En hendelsesanalyse må derfor bygge en egen tidslinje fra dokumenter, vitner og andre kilder før den sammenlignes med publiseringstid, overskrift og oppdateringer. At en sak kom først eller størst viser dagsorden, ikke automatisk årsak, sannhet eller samfunnsmessig betydning.'
      ], [['mpr-10'], ['mpr-11'], ['mpr-12']], [
        'Les forside, hendelse og resepsjon som tre forskjellige evidenslag.',
        'Synlighet dokumenterer prioritering; den beviser ikke objektiv viktighet eller sannhet.'
      ], [['mpr-10', 'mpr-11'], ['mpr-12']]),
      section('mpr-fordypning-2', 'Akersgata er et pressehistorisk sted, ikke én redaksjon', [
        'Aftenpostens gatehistorie beskriver hvordan avisen flyttet til Akersgata 51 i 1876 og hvordan andre aviser senere fulgte. Akersgata ble et pressebegrep fordi flere redaksjoner, trykkerier og nyhetsarbeidere var konsentrert der, ikke fordi de delte politisk linje eller arbeidsmåte.',
        'VG beskriver lanseringen i 1945 som en avis av en ny art, mens Dagbladets materiale om Akersgata 49 viser et annet redaksjonelt miljø og en lang fotojournalistisk praksis. Naboskap dokumenterer et mediemiljø; sammenfallende holdning må belegges separat.',
        'Et nyhetssted kan være der hendelsen skjer, der kilder møtes, der journalisten arbeider eller der saken publiseres. Avishusanalyse må oppgi hvilken funksjon stedet hadde i den konkrete produksjonen, ellers blir enhver bygning som omtales i pressen feilaktig et medieproduksjonssted.'
      ], [['mpr-13'], ['mpr-14', 'mpr-15'], ['mpr-16']], [
        'Skill geografisk klynge fra redaksjonell enighet.',
        'Krev dokumentert produksjonsfunksjon før et sted brukes som Media-case.'
      ], [['mpr-13', 'mpr-14', 'mpr-15'], ['mpr-16']]),
      section('mpr-fordypning-3', 'Presseklubb og lokalavis lager ulike offentligheter', [
        'Pressens Hus beskriver seg som et åpent samlingssted for kunnskap og debatt om journalistikk og medier, med elleve presseorganisasjoner og virksomheter i huset. Det er et offentlighets- og fagmiljø, men ikke en felles desk som bestemmer innholdet i medlemsmediene.',
        'Medietilsynets materiale om lokaljournalistikk knytter lokale nyheter, informasjon og debatt til deltakelse i lokaldemokrati og samfunnsliv. En lokalavis kan dermed være institusjonelt viktig uten at opplag eller nærhet alene viser hvem som blir hørt eller oversett.',
        'Kartleggingen av journalistiske blindsoner viser at flere tynt befolkede områder har usystematisk dekning fordi markedet er for lite til stabil avisdrift. Lokal offentlighet må derfor undersøkes gjennom faktisk dekningsfrekvens, emnebredden, kildemangfoldet og fraværet – ikke bare gjennom avisens eksistens.'
      ], [['mpr-17'], ['mpr-18'], ['mpr-19']], [
        'Presseklubben samler og diskuterer; den overtar ikke redaksjonenes publiseringsansvar.',
        'Lokal dekning er en demokratisk ressurs, men ikke automatisk representativ.'
      ], [['mpr-17'], ['mpr-18', 'mpr-19']])
    ],
    workedExamples: [
      { id: 'mpr-eksempel-1', title: 'Følg én sak gjennom desk', situation: 'Et tips blir hovedoppslag på VG.', analysis: ['Registrer hvem som tipset og hva kilden faktisk visste.', 'Følg kontroll, reporterarbeid, foto, vaktsjef, desk og redaktørvurdering.', 'Skill byline, redigering, publisering og senere rettelser i tidslinjen.'] },
      { id: 'mpr-eksempel-2', title: 'Les to forsider fra samme dag', situation: 'Aftenposten og Dagbladet prioriterer ulike hovedsaker.', analysis: ['Mål plass, bilde, ordvalg og henvisninger.', 'Bygg hendelsestidslinjen fra uavhengige kilder.', 'Forklar forskjellen som redaksjonelt utvalg uten å anta motiv som ikke er dokumentert.'] },
      { id: 'mpr-eksempel-3', title: 'Test lokal offentlighet', situation: 'En lokalavis hevder å dekke hele kommunen.', analysis: ['Tell steder, temaer og kildetyper over en avgrenset periode.', 'Registrer grupper og områder som sjelden opptrer.', 'Skill avisens geografiske navn fra dokumentert representasjon.'] }
    ],
    commonMisconceptions: [
      { claim: 'Det som skjedde, er det samme som det som sto i avisen.', correction: 'Hendelsen må rekonstrueres separat; avisen er en redigert og tidsbundet framstilling basert på tilgjengelige kilder.' },
      { claim: 'En navngitt kilde gjør opplysningen sann.', correction: 'Navngivning gir etterprøvbarhet, men kunnskap, interesser og uavhengig kontroll må fortsatt vurderes.' },
      { claim: 'Bylinen viser hvem som har alt ansvar for saken.', correction: 'Bylinen viser bidragsytere; redaktør, desk og mediet har videre kontroll- og publiseringsansvar.' },
      { claim: 'Forsiden viser objektivt hva som var viktigst.', correction: 'Forsiden dokumenterer redaksjonens prioritering innen en bestemt utgave, flate og nyhetssituasjon.' },
      { claim: 'En lokalavis representerer automatisk hele lokalsamfunnet.', correction: 'Representasjon må undersøkes gjennom kilder, temaer, geografisk spredning og systematiske fravær.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('mpr-anvendelse-1', 'Rettelsen er en del av journalistikken', [
        'VG skriver at feil skal rettes og publiserer en søkbar rettelogg med registreringer fra 28. mai 2019. En rettelse dokumenterer at redaksjonen har endret en publisert opplysning; den gjør ikke den opprinnelige feilen uhistorisk eller usynlig.',
        'VGs redaksjonelle regnskap for 2019 omtaler både prisbelønt journalistikk og alvorlige feil. Et slikt regnskap er en institusjonell egenkilde: det kan dokumentere hva redaksjonen selv erkjenner og hvilke tiltak den beskriver, mens uavhengig vurdering av effekt krever andre data.',
        'Nasjonalbibliotekets avlevering av avisutgaver og sideendringer gjør versjoner sammenlignbare. Arkivet bør brukes til å datere hva som sto hvor og når; en nyere nettversjon kan ikke projiseres bakover som om den var identisk med første publisering.'
      ], [['mpr-20'], ['mpr-21'], ['mpr-03', 'mpr-22']], [
        'Dokumenter hva som ble rettet, når og hvordan leseren får vite det.',
        'Skill redaksjonens egen evaluering fra uavhengig effektmåling.'
      ], [['mpr-20', 'mpr-21'], ['mpr-22']]),
      section('mpr-anvendelse-2', 'Kringkasting samordner redaksjon og teknikk', [
        'NRKs informasjonssider beskriver et allmennkringkastingstilbud på nett, TV og radio og viser distriktsinnganger for hele landet. AV- og TV-produksjonsanalyse må derfor følge både redaksjonell prioritering, programformat, studio, opptak, kontrollrom, sendeflate og digital publisering.',
        'NRKs årsrapport for 1985 beskriver produksjoner på Marienlyst der medarbeidere fra ti til tolv stasjoner arbeidet samtidig. Marienlyst var dermed et samordningssted for geografisk spredte bidrag, ikke bevis på at alle perspektiver eller beslutninger var sentralisert i én person.',
        'Medietilsynets vurdering av NRKs mediemangfold undersøker både innholds- og bruksmangfold, samarbeid med andre aktører og virkninger i nyhetsmarkedet. Allmennkringkasting må vurderes mot dokumentert tilbud, bruk og samarbeid – ikke bare institusjonens formålserklæring.'
      ], [['mpr-23'], ['mpr-24'], ['mpr-25']], [
        'Følg både redaksjonelle og tekniske ledd i en sending.',
        'Skill allmennkringkasteroppdrag, faktisk tilbud, publikum og markedsvirkning.'
      ], [['mpr-23', 'mpr-24'], ['mpr-25']]),
      section('mpr-anvendelse-3', 'Bygg en produksjonsmatrise', [
        'Lag kolonner for hendelse, tips, kilder, dokumentasjon, kryssjekk, reporter, foto eller lyd, desk, redaktør, format, forside eller sendeflate, publiseringstid, distribusjon, rettelse og arkivversjon. Merk hvilke felt som bygger på redaksjonens egen dokumentasjon og hvilke som er uavhengig kontrollert.',
        'Sammenlign Aftenpostens trykk- og Akersgata-historie, VGs tabloid- og rettelsespraksis, Dagbladets redaksjons- og fotohistorie og NRKs studio- og distriktsproduksjon. De fire casene viser at nyhetsproduksjon både er materiell, sosial, institusjonell og teknisk.',
        'Avslutt med tre separate dommer: hva hendelsen dokumenterer, hva redaksjonen valgte å publisere, og hva publikum faktisk kunne møte i den aktuelle utgaven eller sendingen. Først da kan dagsorden, ansvar og mediehistorisk endring analyseres uten å gjøre synlighet til sannhet.'
      ], [['mpr-04', 'mpr-07', 'mpr-20'], ['mpr-02', 'mpr-14', 'mpr-15', 'mpr-24'], ['mpr-10', 'mpr-12', 'mpr-22', 'mpr-25']], [
        'Hold hendelse, kilde, redaksjonelt valg og publisert versjon i separate kolonner.',
        'Bruk synlighet som data om prioritering, ikke som erstatning for sannhetskontroll.'
      ], [['mpr-07', 'mpr-20', 'mpr-22'], ['mpr-10', 'mpr-12']])
    ],
    applicationTasks: [
      { id: 'mpr-oppgave-1', title: 'Avisens materialitet', task: 'Sammenlign én papirforside og samme dags nettside.', prompts: ['Hva begrenser og organiserer papirflaten?', 'Hva kan endres eller flyttes på nett?', 'Hvilken versjon og tidspunkt analyserer du?'] },
      { id: 'mpr-oppgave-2', title: 'Kildeløpet', task: 'Velg én dokumentert nyhetssak.', prompts: ['Hva hevdet hver kilde?', 'Hva ble kryssjekket og av hvem?', 'Hvilke forbehold og kunnskapshull står igjen?'] },
      { id: 'mpr-oppgave-3', title: 'Byline og ansvar', task: 'Kartlegg ansvarskjeden i en Aftenposten- eller VG-sak.', prompts: ['Hvem står i bylinen?', 'Hvilke desk- og redaktørroller er dokumentert?', 'Finnes rettelse, metodeforklaring eller PFU-spor?'] },
      { id: 'mpr-oppgave-4', title: 'Lokal offentlighet', task: 'Kod en ukes lokalavis.', prompts: ['Hvilke steder, temaer og kildetyper dominerer?', 'Hvem omtales uten å få uttale seg?', 'Hvilke geografiske eller sosiale blindsoner finnes?'] },
      { id: 'mpr-oppgave-5', title: 'Studio til publikum', task: 'Følg ett NRK-innslag fra felt eller studio til publisering.', prompts: ['Hvilke redaksjonelle og tekniske roller inngår?', 'Hvordan endrer format og sendeflate materialet?', 'Hvilke oppdateringer eller arkivversjoner finnes?'] }
    ],
    selfCheck: [
      { question: 'Hva skiller en hendelse fra en nyhet?', answer: 'Nyheten er en redigert publisering bygget fra utvalgte og kontrollerte spor etter hendelsen.' },
      { question: 'Hvorfor er en navngitt kilde ikke nok?', answer: 'Kildens tilgang, interesser, presisjon og uavhengig kontroll må fortsatt vurderes.' },
      { question: 'Hva dokumenterer en byline?', answer: 'Hvem som har bidratt journalistisk, men ikke alene hele redaksjonens kontroll- og publiseringsansvar.' },
      { question: 'Hva kan en forside bevise?', answer: 'Hva redaksjonen prioriterte og hvordan den presenterte det i en bestemt utgave.' },
      { question: 'Hvorfor er avishuset ikke én aktør?', answer: 'Fordi ulike reportere, desker, redaktører, teknikere og avdelinger har forskjellige roller og beslutninger.' },
      { question: 'Hva viser en rettelogg?', answer: 'At en publisert opplysning er endret og hvordan redaksjonen gjør feilen etterprøvbar.' },
      { question: 'Hvordan testes lokal offentlighet?', answer: 'Gjennom faktisk dekning, kilde- og temabredde, geografisk spredning og dokumenterte fravær.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: publisher + ' – ' + title
});

const sources = [
  source('mpr01-aften-history', 'Aftenposten', '125 år med Aftenposten', 'https://www.aftenposten.no/norge/i/bmwn3/125-aar-med-aftenposten', 'Historien om oppstart, flytting til Akersgata 51 i 1876, trykkeri og pressekapasitet', 'publisher-history'),
  source('mpr02-aften-akersgata', 'Aftenposten', 'Hva har skjedd i Akersgata?', 'https://www.aftenposten.no/historie/i/qPvo1e/hva-har-skjedd-i-akersgata-historien-om-akersgata-i-oslo', 'Gatehistorien om Aftenposten, VG, Dagbladet og Akersgata som pressemiljø', 'publisher-history'),
  source('mpr03-aften-home', 'Aftenposten', 'Denne helgen er hele Aftenposten produsert fra hjemmekontor', 'https://www.aftenposten.no/meninger/kommentar/i/dO2g9B/denne-helgen-er-hele-aftenposten-produsert-fra-hjemmekontor', 'Redaksjonssjefens beskrivelse av feltarbeid, papirdesk, operative ledere og distribuert produksjon', 'publisher-production-account'),
  source('mpr04-aften-aften', 'Aftenposten', 'Historien sett gjennom Aften-øyne', 'https://www.aftenposten.no/oslo/i/Opjx1/historien-sett-gjennom-aften-oeyne', 'Tilbakeblikket på Aften som lokalavis og historiske hendelser gjennom forsider', 'publisher-archive-story'),
  source('mpr05-vg-history', 'VG', 'Se det i VG', 'https://www.vg.no/nyheter/i/Eonyg5/se-det-i-vg', 'VGs egen historie om første utgave i 1945, redaksjonen og avisformatet', 'publisher-history'),
  source('mpr06-vg-contact', 'VG', 'Kontakt VG', 'https://www.vg.no/informasjon/kontakt-oss', 'Besøksadresse og oversikten over ansvarlig redaktør og redaktørroller', 'publisher-organization-record'),
  source('mpr07-vg-rules', 'VG', 'Trafikkregler for VGs redaksjon', 'https://www.vg.no/informasjon/trafikkregler', 'Reglene om kilder, skjult identitet, upublisert materiale, bilder og redaksjonelt ansvar', 'publisher-editorial-rules'),
  source('mpr08-vg-corrections', 'VG', 'Rettelser', 'https://www.vg.no/informasjon/rettelser', 'Prinsippet om at feil skal rettes og retteloggen fra 28. mai 2019', 'publisher-corrections-log'),
  source('mpr09-vg-account', 'VG', 'Redaksjonelt regnskap for VG i 2019', 'https://www.vg.no/nyheter/i/50Q3nW/redaksjonelt-regnskap-for-vg-i-2019', 'Redaksjonens egen gjennomgang av journalistikk, feil og tiltak i 2019', 'publisher-editorial-account'),
  source('mpr10-dagbladet-solstad', 'Dagbladet', 'Historien om Arve Solstad er spennende som en thriller', 'https://www.dagbladet.no/kultur/historien-om-arve-solstad-er-spennende-som-en-thriller/63521073', 'Pressehistorien og omtalen av redaksjonsmiljøet i Akersgata 49', 'publisher-history-review'),
  source('mpr11-dagbladet-photo', 'Dagbladet', 'Den siste blits er fyrt av', 'https://www.dagbladet.no/meninger/den-siste-blits-er-fyrt-av/73700602', 'Historien om Dagbladets fotojournalistiske arbeid fra Akersgata 49', 'publisher-professional-history'),
  source('mpr12-nb-first', 'Nasjonalbiblioteket', 'Norske redaktører protesterte for trykkefriheten', 'https://www.nb.no/historier-fra-samlingen/norske-redaktorer-protesterte-for-trykkefriheten/', 'Historien om de første norsktrykte avisene, lokal informasjonsbehov og trykkefrihet', 'national-library-history'),
  source('mpr13-nb-print', 'Nasjonalbiblioteket', 'Trykt materiale', 'https://www.nb.no/tjenester/pliktavlevering/trykt-materiale/', 'Reglene om fortløpende avlevering av aviser, alle utgaver og sideendringer', 'national-library-deposit-rule'),
  source('mpr14-editor', 'Norsk Redaktørforening', 'Redaktørplakaten', 'https://www.redaktor.no/ressurser/etiske-og-juridiske-rammeverk/redaktorplakaten', 'Kjerneprinsippene om redaksjonell uavhengighet og redaktørens fulle innholdsansvar', 'professional-standards'),
  source('mpr15-press-house', 'Pressens Hus', 'Hjem', 'https://pressenshus.no/', 'Beskrivelsen av huset som åpent samlingssted, programflater og de elleve beboerorganisasjonene', 'institution-profile'),
  source('mpr16-media-support', 'Medietilsynet', 'De direkte mediestøtteordningene', 'https://www.medietilsynet.no/globalassets/publikasjoner/utredninger-pa-oppdrag-fra-andre/mediestotterapporten/211206_mediestotte_utredning_endelig.pdf', 'Utredningen om lokale mediemarkeder, journalistiske blindsoner og markedssvikt', 'regulator-report'),
  source('mpr17-nrk-info', 'NRK', 'Hjelp og informasjon', 'https://info.nrk.no/', 'Oversikten over NRKs tilbud på nett, TV og radio, distriktsinnganger, oppdrag og presseetisk ramme', 'public-broadcaster-profile'),
  source('mpr18-nrk-1985', 'NRK', 'NRK 1985 del II', 'https://info.nrk.no/wp-content/uploads/2021/08/1985.pdf', 'Årsrapportens produksjonsbeskrivelser fra Marienlyst og bidrag fra flere stasjoner', 'public-broadcaster-annual-report'),
  source('mpr19-media-diversity', 'Medietilsynet', 'NRKs bidrag til mediemangfoldet', 'https://www.medietilsynet.no/fakta/rapporter/kringkasting/2026/nrks-bidrag-til-mediemangfoldet/', '2026-vurderingen av innholds- og bruksmangfold, samarbeid og konkurransevirkninger', 'regulator-report')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('mpr-01', 'Avisens format, trykk, sideinndeling og distribusjon er dokumenterbare produksjonsbetingelser som må skilles fra innholdstolkningen.', ['mpr01-aften-history', 'mpr12-nb-first', 'mpr13-nb-print'], ['mpr-grunnlag-1']),
  claim('mpr-02', 'Aftenposten flyttet til Akersgata 51 i 1876 og tok i bruk en presse med oppgitt kapasitet på 3000 aviser i timen.', ['mpr01-aften-history'], ['mpr-grunnlag-1', 'mpr-anvendelse-3']),
  claim('mpr-03', 'Nasjonalbiblioteket krever fortløpende avlevering av alle avisutgaver og sideendringer i løpet av dagen.', ['mpr13-nb-print'], ['mpr-grunnlag-1', 'mpr-anvendelse-1']),
  claim('mpr-04', 'Nyhetsproduksjon kan fordeles mellom feltarbeid, reportere, ledelse og desk uten at alle arbeider i samme bygning.', ['mpr03-aften-home'], ['mpr-grunnlag-2', 'mpr-anvendelse-3']),
  claim('mpr-05', 'Aftenposten dokumenterte i mars 2020 at feltarbeid fortsatte mens papirdesk og store deler av redaksjonen produserte hjemmefra.', ['mpr03-aften-home'], ['mpr-grunnlag-2']),
  claim('mpr-06', 'VG publiserer besøksadresse og navngitte roller for ansvarlig redaktør, nyhetsredaktør, utviklingsredaktør og politisk redaktør.', ['mpr06-vg-contact'], ['mpr-grunnlag-2']),
  claim('mpr-07', 'Kildearbeid krever vurdering av tilgang, interesse og uavhengig kontroll; kildeutsagn er ikke identisk med redaksjonens verifiserte påstand.', ['mpr07-vg-rules', 'mpr14-editor'], ['mpr-grunnlag-3', 'mpr-anvendelse-3']),
  claim('mpr-08', 'VG krever som hovedregel åpen journalistidentitet og særskilt redaksjonell godkjenning for skjult eller falsk identitet.', ['mpr07-vg-rules'], ['mpr-grunnlag-3']),
  claim('mpr-09', 'Redaktørplakaten legger fullt innholdsansvar til redaktøren, slik at byline ikke kan leses som hele mediets ansvarskjede.', ['mpr14-editor', 'mpr06-vg-contact'], ['mpr-grunnlag-3']),
  claim('mpr-10', 'En forside dokumenterer redaksjonell prioritering i en bestemt utgave, men er ikke et komplett hendelsesbilde.', ['mpr04-aften-aften', 'mpr05-vg-history'], ['mpr-fordypning-1', 'mpr-anvendelse-3']),
  claim('mpr-11', 'Aftenpostens historiske forsideutvalg viser hvordan Aften rammet inn både store begivenheter og lokalstoff gjennom sin utgivelseshistorie.', ['mpr04-aften-aften'], ['mpr-fordypning-1']),
  claim('mpr-12', 'Dagsorden og publiseringsrekkefølge viser synlighet og prioritering, mens sannhet, årsak og betydning krever egne evidensspor.', ['mpr04-aften-aften', 'mpr09-vg-account'], ['mpr-fordypning-1', 'mpr-anvendelse-3']),
  claim('mpr-13', 'Aftenpostens gatehistorie knytter flyttingen i 1876 til framveksten av Akersgata som klynge for flere aviser og pressevirksomheter.', ['mpr02-aften-akersgata'], ['mpr-fordypning-2']),
  claim('mpr-14', 'VG beskriver førsteutgaven i 1945 som en avis av en ny art og dokumenterer en egen redaksjonell og materiell utviklingslinje.', ['mpr05-vg-history'], ['mpr-fordypning-2', 'mpr-anvendelse-3']),
  claim('mpr-15', 'Dagbladets egne historiske tekster knytter Akersgata 49 til både redaksjonsledelse og langvarig fotojournalistisk arbeid.', ['mpr10-dagbladet-solstad', 'mpr11-dagbladet-photo'], ['mpr-fordypning-2', 'mpr-anvendelse-3']),
  claim('mpr-16', 'Et sted er et relevant Media-case når det har dokumentert funksjon i produksjon, kildearbeid, publisering, debatt eller pressehistorie – ikke bare fordi det omtales.', ['mpr02-aften-akersgata', 'mpr15-press-house'], ['mpr-fordypning-2']),
  claim('mpr-17', 'Pressens Hus beskriver seg som et åpent samlingssted for kunnskap og debatt og huser elleve presseorganisasjoner og virksomheter.', ['mpr15-press-house'], ['mpr-fordypning-3']),
  claim('mpr-18', 'Medietilsynets materiale knytter lokale nyheter, informasjon og debatt til deltakelse i lokaldemokrati og lokalt samfunnsliv.', ['mpr16-media-support'], ['mpr-fordypning-3']),
  claim('mpr-19', 'Medietilsynet beskriver journalistiske blindsoner der små markeder gir et svakt grunnlag for stabil lokal avisdrift.', ['mpr16-media-support'], ['mpr-fordypning-3']),
  claim('mpr-20', 'VG sier at feil skal rettes og oppgir at den åpne retteloggen inneholder rettelser fra 28. mai 2019.', ['mpr08-vg-corrections'], ['mpr-anvendelse-1', 'mpr-anvendelse-3']),
  claim('mpr-21', 'VGs redaksjonelle regnskap for 2019 omtaler både journalistiske prestasjoner, alvorlige feil og redaksjonens egne tiltak.', ['mpr09-vg-account'], ['mpr-anvendelse-1']),
  claim('mpr-22', 'Arkiverte utgaver og sideendringer gjør publiseringsversjoner sammenlignbare og hindrer at en rettet nettversjon behandles som første publisering.', ['mpr13-nb-print', 'mpr08-vg-corrections'], ['mpr-anvendelse-1', 'mpr-anvendelse-3']),
  claim('mpr-23', 'NRK beskriver et allmennkringkastingstilbud på nett, TV og radio med egne distriktsinnganger og presseetisk ramme.', ['mpr17-nrk-info'], ['mpr-anvendelse-2']),
  claim('mpr-24', 'NRKs årsrapport for 1985 dokumenterer produksjonssituasjoner på Marienlyst med medarbeidere fra ti til tolv stasjoner.', ['mpr18-nrk-1985'], ['mpr-anvendelse-2', 'mpr-anvendelse-3']),
  claim('mpr-25', 'Medietilsynets 2026-vurdering undersøker NRK gjennom innholds- og bruksmangfold, samarbeid og virkninger i nyhetsmarkedet.', ['mpr19-media-diversity'], ['mpr-anvendelse-2', 'mpr-anvendelse-3'])
];

const claimsDoc = {
  schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'media',
  chapter_id: CHAPTER_ID, sources, claims
};

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.media;
  assert(subject && Array.isArray(subject.chapters), 'Media mangler kapittelliste i fagverkregisteret');
  const registryChapter = {
    id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE,
    primary_domain_id: 'presse_redaksjoner_avishus', emne_ids: emneIds
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 0, 'Media må starte dette steget uten kapitler');
    subject.chapters.push(registryChapter);
  } else {
    assert(subject.chapters.length === 1, 'Reproduksjon forventer nøyaktig ett Media-kapittel');
    subject.chapters[existingIndex] = registryChapter;
  }
  subject.canonicalModel.note = 'Medias seks canonicale hovedområder eier rendererstrukturen. Presse, redaksjoner og avishus er materialisert som fulltekst- og claimsporet kapittel; fem hovedområder står igjen. Populærkultur bevares som et komplett nested mediefelt og oppretter ikke et konkurrerende toppfag.';
  registry.version = '2.59.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'media');
  assert(['structure_ready', 'chapters_in_progress'].includes(subject?.editorialStatus), 'Media må starte fra structure_ready eller dokumentert kapittelproduksjon');
  subject.editorialStatus = 'chapters_in_progress';
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Media har 6 canonicale hovedområder og 120 aktive hovedemner. Presse, redaksjoner og avishus dekker nå sine 21 emner gjennom 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 25 verifiserte claims, 19 inspiserbare kilderegistreringer og alle områdets 21 canonicale metoder. Ett av seks hovedområder er materialisert; fem gjenstår. Populærkultur forblir et komplett nested mediefelt.';
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
  console.log('Materialiserte Media/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder.');
}

main();
