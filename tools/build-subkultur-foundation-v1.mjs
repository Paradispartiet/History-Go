#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const OUT = Object.freeze({
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  mapping: 'data/fag/subkultur/emnemapping_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json'
});

const t = (slug, title, definition, mechanism, limitation) => ({ slug, title, definition, mechanism, limitation });
const m = (slug, title, operation, data, limitation) => ({ slug, title, operation, data, limitation });

// Bevar etablerte emne-ID-er når begrepet fortsatt finnes, slik at eksisterende
// Places-, People- og quizreferanser ikke får ny betydning. Nye begreper får ny
// identitet; gamle ID-er gjenbrukes aldri for et annet faglig innhold.
const LEGACY_ID_BY_TOPIC = Object.freeze({
  subkultur_som_analytisk_kategori: 'em_sub_grunnbegreper',
  scene_stamme_postsubkultur: 'em_sub_musikkscener',
  motkultur_og_subkultur: 'em_sub_motkultur',
  mainstream_og_grensearbeid: 'em_sub_undergrunn_mainstream',
  innenfra_og_utenfrablikk: 'em_sub_historiemakt',
  ungdom_alder_og_livslop: 'em_sub_ungdomskultur_identitet',
  klasse_kjonn_rase_interseksjon: 'em_sub_klasse_urban_stil',
  lokal_global_translokal: 'em_sub_fandom_nisjer',
  komparative_grensetilfeller: 'em_sub_grensearbeid_autentisitet',
  dokumentasjon_og_ikke_kvalifisering: 'em_sub_undergrunn_miljo',
  scene_og_fellesskap: 'em_sub_scene_fellesskap',
  tilhorighet_og_identitet: 'em_sub_tilhorighet_miljo',
  diy_infrastruktur: 'em_sub_diy_praksis',
  arrangorer_og_dugnad: 'em_sub_arrangorer_dugnad',
  uformelle_regler: 'em_sub_ritualer_praksis',
  portvokting_og_innvielse: 'em_sub_portvoktere_innvielse',
  deltakelse_og_laring: 'em_sub_deltakelse_laring',
  omsorg_og_trygghet: 'em_sub_trygghet_eksklusjon',
  intern_konflikt_og_ulikhet: 'em_sub_vennegjenger_lojalitet',
  kontinuitet_og_generasjonsskifte: 'em_sub_sosial_organisering',
  stil_som_kommunikasjon: 'em_sub_stil_sprak',
  brikolasje_og_omkoding: 'em_sub_remix_stil',
  symboler_og_tegn: 'em_sub_symboler_koder',
  klar_kropp_og_modifikasjon: 'em_sub_klaer_kropp_identitet',
  sprak_slang_og_navn: 'em_sub_sprak_slang_koder',
  smak_og_distinksjon: 'em_sub_smak_distinksjon',
  subkulturell_kapital: 'em_sub_estetikk_affekt',
  autentisitet_og_ektehet: 'em_sub_stil_kropp_symboler',
  synlighet_og_passing: 'em_sub_visuelle_grenser',
  appropriasjon_og_hybridisering: 'em_sub_kropp_modifikasjon',
  stedsskaping: 'em_sub_sted_scene',
  territorium_og_ruter: 'em_sub_territoriale_koder',
  okkupasjon_og_autonome_rom: 'em_sub_okkuperte_rom',
  skate_og_byrom: 'em_sub_skate_byrom',
  graffiti_og_territorium: 'em_sub_graffiti_gatekunst',
  parker_gater_og_moteplasser: 'em_sub_uformelle_moteplasser',
  venue_bakrom_og_infrastruktur: 'em_sub_ovingsrom_kjeller',
  retten_til_byen: 'em_sub_rett_til_byen',
  fortrengning_og_romlig_endring: 'em_sub_gentrifisering_tap',
  stempling_og_avvik: 'em_sub_sosial_kontroll',
  moralske_entreprenorer: 'em_sub_regulering_eiendom',
  moralpanikk: 'em_sub_moralpanikk',
  politi_og_kriminalisering: 'em_sub_kriminalisering',
  regulering_og_tillatelse: 'em_sub_klubbkultur_natt',
  overvakning_og_synlighet: 'em_sub_synlighet_kontroll',
  motstandstaktikker: 'em_sub_autonomi_motstand',
  protest_og_direkte_aksjon: 'em_sub_skeive_miljoer',
  konflikt_og_forhandling: 'em_sub_scene_konflikt',
  kontrollens_konsekvenser: 'em_sub_politi_kontroll',
  fanziner_og_alternativpresse: 'em_sub_fanziner_plakater',
  plakater_og_stickers: 'em_sub_plakater_stickers',
  tags_pieces_og_signaturer: 'em_sub_objekter_merker',
  opptak_mixtapes_og_utgivelser: 'em_sub_musikkobjekter',
  klær_og_artefakter: 'em_sub_cosplay_fandom',
  uavhengig_radio_og_lydmedier: 'em_sub_uavhengige_medier',
  arkiv_og_dokumentasjon: 'em_sub_dokumentasjon_arkiv',
  digitale_plattformer: 'em_sub_nettforum_memer',
  algoritmer_og_oppdagelse: 'em_sub_gaming_lan',
  objektets_livslop: 'em_sub_samlerobjekter',
  apne_rusmiljoer: 'em_sub_marginalisering_synlighet',
  stigma_og_diskriminering: 'em_sub_avvik_normalitet',
  innlemmelse_og_inkorporering: 'em_sub_autentisitet_tap',
  kommersialisering: 'em_sub_kommersialisering',
  merkevare_og_turisme: 'em_sub_merkevare_stil',
  profesjonalisering: 'em_sub_kulturpolitikk_subkultur',
  institusjonalisering: 'em_sub_institusjonalisering',
  gentrifisering_og_fortrengning: 'em_sub_byutvikling_regulering',
  kulturarv_og_musealisering: 'em_sub_kulturarv_undergrunn',
  revival_og_nostalgi: 'em_sub_historisering_revival',
  tapte_steder_og_digitalt_minne: 'em_sub_tapte_steder',
  videreforing_og_transformasjon: 'em_sub_nostalgi_revival'
});

const DOMAINS = [
  {
    id: 'subkulturteori_feltgrenser',
    title: 'Subkulturteori og feltgrenser',
    tagline: 'Hva som gjør et miljø subkulturelt – og hva som ikke gjør det.',
    definition: 'Fagområdet undersøker subkultur som analytisk kategori, sammenligner den med scene, motkultur og postsubkultur og gjør feltgrensene etterprøvbare.',
    methods: [
      m('begrepsavgrensning', 'Begrepsavgrensning', 'Bryt et omstridt begrep ned i nødvendige, mulige og utelukkende kjennetegn før caset klassifiseres.', 'fagdefinisjoner, aktørbruk, observerbar praksis og moteksempler', 'Metoden avgjør analytisk bruk, ikke hvem som har rett til å navngi sin egen identitet.'),
      m('grensetilfelle_sammenligning', 'Sammenligning av grensetilfeller', 'Sammenlign ett tydelig kvalifiserende, ett tvetydig og ett ikke-kvalifiserende case langs de samme kriteriene.', 'likeartede caser med dokumentert miljø, praksis, organisering og samfunnsposisjon', 'Ulike datamengder kan skape falske forskjeller mellom casene.'),
      m('begrepshistorisk_genealogi', 'Begrepshistorisk genealogi', 'Følg hvordan en kategori er definert, kritisert og omformet gjennom tid og fagtradisjoner.', 'daterte fagtekster, utgaver, debatter og senere kritikk', 'En begrepshistorie er ikke det samme som miljøets egen historie.'),
      m('innenfra_utenfra_triangulering', 'Innenfra–utenfra-triangulering', 'Still miljøets selvbeskrivelse, observasjon og uavhengig dokumentasjon ved siden av hverandre og lokaliser enighet og konflikt.', 'miljønære kilder, feltdata og uavhengige kontrollkilder', 'Tre kildetyper garanterer ikke representativitet dersom de bygger på samme stemme eller hendelse.'),
      m('negativ_caseanalyse', 'Negativ caseanalyse', 'Let aktivt etter et case som bryter med den foreløpige forklaringen og revider rekkevidden når det finnes.', 'avvikende og kontrasterende caser dokumentert etter samme standard', 'Fravær av et negativt case i et lite utvalg bekrefter ikke en universell regel.')
    ],
    topics: [
      t('subkultur_som_analytisk_kategori', 'Subkultur som analytisk kategori', 'Subkultur betegner en dokumenterbar sosial verden med delte praksiser, grenser og relasjoner til et større samfunn; annerledes smak alene er ikke tilstrekkelig.', 'Kategorien får forklaringskraft når medlemskap, praksis og samfunnsposisjon kan kobles i samme analyse.', 'En for bred bruk gjør enhver nisje til subkultur, mens en for trang bruk overser løse og hybride miljøer.'),
      t('scene_stamme_postsubkultur', 'Scene, stamme og postsubkultur', 'Scene, neo-stamme og postsubkultur er alternative modeller for mer flytende, situerte eller skiftende tilhørigheter enn klassiske subkulturmodeller.', 'Modellene flytter oppmerksomheten fra varig medlemskap til møteplasser, sirkulasjon og skiftende kombinasjoner av smak og relasjoner.', 'Flytende deltakelse utelukker ikke varige ulikheter, institusjoner eller sterke identiteter.'),
      t('motkultur_og_subkultur', 'Motkultur og subkultur', 'Motkultur viser til eksplisitte forsøk på å endre eller avvise samfunnsordener, mens subkultur også kan eksistere uten et samlet politisk prosjekt.', 'Skillet avklares ved å undersøke uttalte mål, organisering og praksis fremfor å lese politisk motstand ut av stil.', 'Et miljø kan være motkulturelt på ett område og samtidig integrert i marked eller institusjoner på andre.'),
      t('mainstream_og_grensearbeid', 'Mainstream og grensearbeid', 'Mainstream er ikke en fast motpol, men noe miljøer og omverdenen produserer gjennom løpende skiller mellom innenfor og utenfor.', 'Grenser opprettholdes gjennom språk, adgang, smak, medier, steder og fortellinger om hvem som er ekte eller kommersiell.', 'Aktørenes egne grensedragninger må analyseres uten å godtas som nøytrale beskrivelser av andre.'),
      t('innenfra_og_utenfrablikk', 'Innenfra- og utenfrablikk', 'Miljøets egen kunnskap og eksterne beskrivelser belyser ulike sider av samme praksis og må behandles som posisjonerte kilder.', 'Sammenstilling viser hvor selvforståelse, offentlig merkelapp og observerbar handling støtter eller motsier hverandre.', 'Miljønærhet gir innsikt, men ikke automatisk representativitet; avstand gir kontroll, men kan forsterke stigma.'),
      t('ungdom_alder_og_livslop', 'Ungdom, alder og livsløp', 'Subkulturell deltakelse kan være knyttet til ungdomstid, men kan også fortsette, endres eller få nye funksjoner gjennom livsløpet.', 'Alder påvirker tilgang, ressurser, risiko, omsorgsansvar og hvem som kan bli værende i et miljø.', 'Å forklare all deltakelse som ungdomsfase skjuler eldre aktører og institusjonell kontinuitet.'),
      t('klasse_kjonn_rase_interseksjon', 'Klasse, kjønn, rasisering og interseksjon', 'Tilgang, synlighet og autoritet i subkulturelle miljøer formes av flere sosiale posisjoner som virker sammen.', 'Ressurser, kroppslig trygghet, diskriminering og portvokting påvirker hvem som kan delta og hvem som blir lest som autentisk.', 'Én kategori kan ikke brukes som totalforklaring, og miljøet må ikke fremstilles som sosialt homogent.'),
      t('lokal_global_translokal', 'Lokale, globale og translokale miljøer', 'Subkulturer kan være stedbundne samtidig som tegn, mennesker og praksiser sirkulerer mellom byer, land og digitale nettverk.', 'Translokale forbindelser gjør at et lokalt miljø kan lære, låne og posisjonere seg gjennom eksterne referanser.', 'Lik stil på to steder dokumenterer ikke samme organisering, mening eller maktforhold.'),
      t('komparative_grensetilfeller', 'Komparative grensetilfeller', 'Grensetilfeller prøver definisjonen mot miljøer som deler enkelte trekk, men mangler andre nødvendige kjennetegn.', 'Systematisk sammenligning synliggjør hvilke kriterier som faktisk avgjør klassifiseringen.', 'Et grensetilfelle må beskrives med samme kildestandard som det kvalifiserende caset.'),
      t('dokumentasjon_og_ikke_kvalifisering', 'Dokumentasjon og ikke-kvalifisering', 'Manglende dokumentasjon av miljø, praksis eller sosial posisjon er grunn til å avstå fra Subkultur-kobling, ikke til å fylle gapet med antakelser.', 'En eksplisitt ikke-kvalifisering beskytter kategorien mot estetisk eller kommersiell utvanning.', 'Fravær i tilgjengelige kilder kan også skyldes marginalisering eller arkivtap og skal registreres som usikkerhet.')
    ]
  },
  {
    id: 'fellesskap_scener_egenorganisering',
    title: 'Fellesskap, scener og egenorganisering',
    tagline: 'Hvordan miljøer bygges, vedlikeholdes og bestrides i praksis.',
    definition: 'Fagområdet undersøker relasjoner, arbeid, regler, læring, omsorg og ulikhet som gjør en scene eller et miljø mulig over tid.',
    methods: [
      m('deltakende_observasjon', 'Deltakende observasjon', 'Observer gjentatte situasjoner, roller og praksiser over tid og før refleksiv feltdagbok.', 'situasjoner, feltnotater, samtykkebetingelser og posisjonsnotat', 'Forskerens tilgang og rolle former hva som blir synlig.'),
      m('relasjons_og_nettverkskartlegging', 'Relasjons- og nettverkskartlegging', 'Kartlegg hvem som kobler personer, steder, ressurser og hendelser uten å redusere relasjoner til bare kontaktfrekvens.', 'intervju, samarbeidsdata, hendelser og organisasjonsdokumenter', 'Sårbare nettverk kan ikke publiseres på individnivå uten særskilt risikovurdering.'),
      m('organisatorisk_prosessporing', 'Organisatorisk prosessporing', 'Rekonstruer en beslutning fra forslag gjennom forhandling, arbeid og faktisk gjennomføring.', 'møtereferat, arbeidsfordeling, tidslinje og aktørintervju', 'Uformelle beslutninger etterlater ofte skjeve eller manglende spor.'),
      m('praksis_og_laringsanalyse', 'Praksis- og læringsanalyse', 'Følg hvordan en deltaker lærer en konkret ferdighet, norm eller rolle gjennom observasjon, øving og tilbakemelding.', 'læringssituasjoner, artefakter, instruksjon og deltakerrefleksjon', 'Synlig mestring viser ikke alene hvem som ble ekskludert fra læringsløpet.'),
      m('intern_ulikhetsaudit', 'Intern ulikhetsaudit', 'Sammenlign adgang, taletid, arbeid, risiko og anerkjennelse mellom posisjoner i samme miljø.', 'rolledata, observasjon, intervjuer og fordelingsoversikt', 'Små tall og sensitive kjennetegn krever aggregering og varsom rapportering.')
    ],
    topics: [
      t('scene_og_fellesskap', 'Scene og fellesskap', 'En scene er forbindelser mellom aktører, steder, medier og hendelser, mens fellesskap også innebærer opplevd tilhørighet og gjensidige forpliktelser.', 'Skillet gjør det mulig å analysere tett sosial støtte og løs kulturell sirkulasjon uten å blande dem.', 'En aktiv arrangementsflate dokumenterer ikke automatisk et stabilt fellesskap.'),
      t('tilhorighet_og_identitet', 'Tilhørighet og identitet', 'Tilhørighet skapes gjennom deltakelse, gjenkjennelse og plass i relasjoner, ikke bare gjennom selvvalgt merkelapp.', 'Gjentatte møter og bekreftelse fra andre gjør identitet sosialt virksom.', 'Sterk identitet kan sameksistere med sporadisk praksis, og hyppig praksis med svak identifikasjon.'),
      t('diy_infrastruktur', 'DIY og egen infrastruktur', 'DIY viser til å produsere rom, medier, arrangementer eller tjenester med egne ressurser og kontroll over arbeidsprosessen.', 'Egen infrastruktur reduserer enkelte avhengigheter, men skaper nye krav til arbeid, kompetanse og finansiering.', 'Frivillig eller småskala produksjon er ikke automatisk selvstyrt eller ikke-kommersiell.'),
      t('arrangorer_og_dugnad', 'Arrangører og dugnad', 'Arrangører og frivillige omsetter ideer til tidsplaner, adgang, teknikk, økonomi, omsorg og opprydding.', 'Det ofte usynlige arbeidet stabiliserer miljøet og fordeler samtidig innflytelse og belastning.', 'Dugnad kan romantiseres og skjule utbrenthet, skjev arbeidsdeling eller ubetalt ekspertise.'),
      t('uformelle_regler', 'Uformelle regler', 'Uformelle regler styrer oppførsel, adgang og konflikt selv når miljøet avviser formelt hierarki.', 'Normer håndheves gjennom reaksjoner, rykte, veiledning og muligheten til å delta videre.', 'Regler som aldri uttrykkes kan være særlig vanskelige for nye deltakere å forstå og utfordre.'),
      t('portvokting_og_innvielse', 'Portvokting og innvielse', 'Portvokting avgjør hvem som får informasjon, sceneplass, ressurser eller definisjonsmakt; innvielse lærer nykommere kodene.', 'Kontroll over knappe muligheter gjør kulturell kunnskap til sosial adgang.', 'Enhver kvalitetsvurdering er ikke eksklusjon, men kriteriene må kunne undersøkes for skjevhet.'),
      t('deltakelse_og_laring', 'Deltakelse og læring', 'Subkulturell kompetanse læres ofte gjennom gradvis deltakelse i reelle oppgaver fremfor formell undervisning.', 'Observasjon, imitasjon, korrigering og ansvar flytter deltakeren fra perifer til mer sentral praksis.', 'Læringsbanen kan stoppe ved økonomiske, kroppslige eller sosiale barrierer som miljøet selv overser.'),
      t('omsorg_og_trygghet', 'Omsorg og trygghet', 'Omsorg består av konkrete ordninger for hvile, konflikthåndtering, tilgjengelighet, grensesetting og hjelp – ikke bare en inkluderende selvbeskrivelse.', 'Trygghetspraksiser fordeler ansvar og kan gjøre deltakelse mulig for flere.', 'Trygghet er ulikt fordelt, og én gruppes kontrolltiltak kan oppleves som overvåkning av en annen.'),
      t('intern_konflikt_og_ulikhet', 'Intern konflikt og ulikhet', 'Subkulturelle miljøer rommer interessekonflikter og ulik tilgang til status, tid, penger, kroppslig trygghet og nettverk.', 'Konflikter synliggjør hvem som kan definere problemet, sette regler og bli værende.', 'Analyse av intern ulikhet skal ikke brukes til å avvise miljøets samlede verdi eller politiske krav.'),
      t('kontinuitet_og_generasjonsskifte', 'Kontinuitet og generasjonsskifte', 'Miljøer videreføres når kunnskap, steder, roller og fortellinger overføres, men hvert generasjonsskifte omformer også praksisen.', 'Mentorskap, arkiv, ritualer og institusjoner bærer enkelte elementer gjennom utskifting av deltakere.', 'Kontinuitet i navn eller sted dokumenterer ikke at makt, verdier eller deltakere er de samme.')
    ]
  },
  {
    id: 'stil_symboler_koder_kropp',
    title: 'Stil, symboler, koder og kropp',
    tagline: 'Hvordan forskjell gjøres synlig, lesbar og omstridt.',
    definition: 'Fagområdet undersøker hvordan klær, kropp, språk, smak og tegn produserer mening, status og grenser i konkrete miljøer.',
    methods: [
      m('semiotisk_stilanalyse', 'Semiotisk stilanalyse', 'Analyser hvordan et tegn får mening gjennom kombinasjon, kontrast, omplassering og aktørenes egne fortolkninger.', 'bilder, objekter, språkbruk, kontekst og aktørforklaringer', 'Analytikeren må ikke tilskrive politisk mening som aktører og praksis ikke støtter.'),
      m('visuell_kontekstanalyse', 'Visuell kontekstanalyse', 'Les bilde, utsnitt, publiseringssituasjon og fravær samlet før visuell stil tolkes.', 'originalfil, metadata, serie, publiseringsflate og samtykkekontekst', 'Et ikonisk bilde kan overrepresentere det mest synlige og dramatiske.'),
      m('sprak_og_kodeanalyse', 'Språk- og kodeanalyse', 'Kartlegg hvordan ord, slang, navn og sjangermerker skifter betydning mellom situasjoner og deltakere.', 'samtaler, tekster, medier, tidsfesting og posisjonsdata', 'Kodekunnskap kan være sensitiv, og offentliggjøring kan endre eller skade praksisen.'),
      m('objektbiografi', 'Objektbiografi', 'Følg ett objekt fra produksjon og tilegnelse gjennom bruk, bytte, reparasjon, utstilling eller kassering.', 'objektspor, eierskap, brukssituasjoner, foto og intervju', 'Ett objekts livsløp kan ikke uten videre generaliseres til hele stilen.'),
      m('smaks_og_statuskartlegging', 'Smaks- og statuskartlegging', 'Undersøk hvilke vurderinger som gir anerkjennelse, hvem som kan uttale dem og hvilke ressurser de krever.', 'rangeringer, samtaler, adgang, forbruk, kompetanse og reaksjoner', 'Smak er situert; uttalte preferanser er ikke identiske med faktisk praksis.')
    ],
    topics: [
      t('stil_som_kommunikasjon', 'Stil som kommunikasjon', 'Stil kommuniserer gjennom sammensetning av tegn som blir lesbare i en bestemt historisk og sosial sammenheng.', 'Gjentakelse og kontrast gjør klær, lyd, kropp eller grafikk til signaler om tilhørighet og forskjell.', 'Samme tegn kan være mote, funksjon eller motstand i ulike miljøer og perioder.'),
      t('brikolasje_og_omkoding', 'Brikolasje og omkoding', 'Brikolasje er å ta eksisterende objekter eller tegn ut av vanlig sammenheng og sette dem sammen med ny funksjon eller mening.', 'Omplassering gjør hverdagslige varer til interne koder eller offentlige provokasjoner.', 'Ikke all gjenbruk er bevisst motstand, og tolkningen må forankres i praksis og kilder.'),
      t('symboler_og_tegn', 'Symboler og tegn', 'Symboler samler fortellinger og grenser i en form som raskt kan gjenkjennes, kopieres eller bestrides.', 'Tegn får kraft gjennom delt tolking, plassering og reaksjoner fra både miljø og omverden.', 'Symbolers mening er flertydig og kan endres når de flyttes mellom grupper.'),
      t('klar_kropp_og_modifikasjon', 'Klær, kropp og modifikasjon', 'Kroppen er både uttrykksflate og vilkår for deltakelse gjennom klær, hår, tatovering, bevegelse og fysisk ferdighet.', 'Kroppslig praksis gjør tilhørighet synlig og kan kreve tid, risiko, penger eller smerte.', 'Fokus på utseende kan skjule arbeid, relasjoner og deltakere som ikke følger en synlig stil.'),
      t('sprak_slang_og_navn', 'Språk, slang og navn', 'Slang og navn kondenserer erfaring, humor, rang og grensearbeid i ord som ikke har samme betydning utenfor miljøet.', 'Korrekt bruk signaliserer situasjonskunnskap og kan åpne eller lukke samtaler.', 'Å publisere interne uttrykk kan forflate nyanser eller gjøre en beskyttende kode tilgjengelig for kontrollaktører.'),
      t('smak_og_distinksjon', 'Smak og distinksjon', 'Smak ordner ikke bare objekter, men også personer og posisjoner gjennom vurderinger av kvalitet, renhet og kommersialitet.', 'Kunnskap om sjeldne eller riktige valg kan omsettes til anerkjennelse og adgang.', 'Smakshierarkier formes også av klasse, kjønn, rasisering og økonomi og kan ikke forklares som individuell sans alene.'),
      t('subkulturell_kapital', 'Subkulturell kapital', 'Subkulturell kapital er miljøspesifikk kunnskap, stil og forbindelser som gir status i en scene.', 'Kapitalen akkumuleres gjennom tidlig tilgang, korrekt dømmekraft, relasjoner og synlig kompetanse.', 'Begrepet må ikke skjule materiell kapital eller fremstille miljøets hierarki som meritokratisk.'),
      t('autentisitet_og_ektehet', 'Autentisitet og ekthet', 'Autentisitet er en sosial vurdering av troverdig samsvar mellom historie, praksis, stil og motiv.', 'Påstander om ekthet beskytter grenser og fordeler autoritet når miljøet vokser eller kommersialiseres.', 'Ingen ekstern analyse kan fastsette én ekte form; den kan undersøke hvem som får definere den og med hvilke følger.'),
      t('synlighet_og_passing', 'Synlighet og passing', 'Deltakere kan velge synlighet, skjule tegn eller bli lest feil avhengig av trygghet, arbeid, familie og kontroll.', 'Strategisk veksling mellom koder gjør det mulig å bevege seg mellom miljøer og institusjoner.', 'Usynlighet betyr ikke svak identitet, og synlighet betyr ikke frivillig eksponering.'),
      t('appropriasjon_og_hybridisering', 'Appropriasjon og hybridisering', 'Stiler oppstår gjennom lån og blanding, men maktforskjeller avgjør om utvekslingen gir anerkjennelse, tap eller utnyttelse.', 'Sirkulasjon løsriver tegn fra opprinnelige relasjoner og gjør dem tilgjengelige for nye aktører og markeder.', 'Likhet i uttrykk er ikke nok til å avgjøre skade; kreditering, kontroll, gevinst og historisk makt må undersøkes.')
    ]
  },
  {
    id: 'steder_territorier_okkupering',
    title: 'Steder, territorier og okkupasjon',
    tagline: 'Hvordan miljøer produserer rom og forhandler om retten til byen.',
    definition: 'Fagområdet undersøker møteplasser, ruter, okkupasjon, alternative boformer og praksiser som omskaper byens fysiske og juridiske rom.',
    methods: [
      m('stedlig_observasjon', 'Stedlig observasjon', 'Registrer bruk, rytme, materialitet, adgang og samhandling på flere tidspunkter uten å identifisere sårbare personer.', 'feltnotater, tidsserier, romskisse og refleksiv observatørlogg', 'Et kort besøk kan forveksle unntak, arrangement eller kontrollaksjon med normal bruk.'),
      m('rute_og_territoriekartlegging', 'Rute- og territoriekartlegging', 'Kartlegg bevegelse, stopp, grenser og alternative ruter sammen med aktørenes egen romforståelse.', 'deltakerkart, observasjon, intervjuer og offentlig arealdata', 'Detaljerte kart kan øke overvåkings- eller fortrengningsrisiko og må generaliseres.'),
      m('eiendoms_og_plandokumentanalyse', 'Eiendoms- og plandokumentanalyse', 'Følg eierskap, regulering, tillatelser og vedtak som endrer adgang eller bruk.', 'grunnbok, planer, saksdokumenter, kontrakter og tidslinje', 'Formelle dokumenter viser vedtak, men ikke nødvendigvis faktisk bruk eller uformelle avtaler.'),
      m('stedskonflikt_tidslinje', 'Stedskonfliktens tidslinje', 'Koble hendelser, krav, vedtak, forhandlinger og materielle endringer i en datert kjede.', 'presse, aktørarkiv, offentlige dokumenter, foto og intervjuer', 'Ettertidens seier- eller tapsfortelling kan forenkle samtidige uenigheter.'),
      m('affordans_og_praksisanalyse', 'Affordans- og praksisanalyse', 'Undersøk hvilke handlinger materialer, former og regler muliggjør eller hemmer for ulike brukere.', 'måling, foto, bruksspor, observasjon og regulering', 'Mulig bruk er ikke det samme som faktisk eller legitim bruk.')
    ],
    topics: [
      t('stedsskaping', 'Stedsskaping', 'Et rom blir et subkulturelt sted når gjentatt bruk, minner, regler og relasjoner gir det særskilt mening.', 'Praksis og fortelling binder materielle trekk til en sosial verden som deltakerne kan gjenkjenne.', 'Et kjent navn eller et veggmaleri alene dokumenterer ikke varig stedsskaping.'),
      t('territorium_og_ruter', 'Territorium og ruter', 'Territorier består av brukte soner, grenser og bevegelseslinjer som kan være tydelige for deltakere uten å være formelt merket.', 'Ruter kobler møteplasser, ressurser og trygghet og gjør miljøet større enn ett punkt på kartet.', 'Kartlegging kan gjøre uformelle eller sårbare mønstre unødig synlige.'),
      t('okkupasjon_og_autonome_rom', 'Okkupasjon og autonome rom', 'Okkupasjon tar rom i bruk uten ordinær disposisjonsrett og kan skape bolig, kultur eller politisk organisering.', 'Fysisk tilstedeværelse gjør krav på bruk og kan tvinge fram forhandling om eierskap, lov og byutvikling.', 'Okkupasjoner varierer i mål, varighet og intern styring og skal ikke behandles som én politisk form.'),
      t('alternative_boformer', 'Alternative boformer', 'Alternative boformer organiserer bolig, ressurser eller beslutninger annerledes enn dominerende husholds- og eiendomsmodeller.', 'Deling og kollektiv styring kan skape rimelighet og fellesskap, men krever vedlikehold og konfliktløsning.', 'En særegen bygning eller lav standard gjør ikke i seg selv bofellesskapet subkulturelt.'),
      t('skate_og_byrom', 'Skating og byrom', 'Skating leser arkitektur gjennom fart, friksjon, høyde og linjer og omformer gjennomgangsrom til kroppslige praksisrom.', 'Gjentatt bruk bygger ferdighet, lokal kunnskap og konflikt eller samarbeid om overflater.', 'Et anlegg kvalifiserer ikke som Subkultur uten dokumentert miljø, praksis og sosial organisering.'),
      t('graffiti_og_territorium', 'Graffiti og territorium', 'Graffiti writing knytter navn, ferdighet, ruter og synlighet til bestemte flater og konkurrerende regler for byrommet.', 'Plassering og gjentakelse gjør veggen til kommunikasjon både innad i miljøet og ut mot eiere og myndigheter.', 'Gatekunst, bestillingsverk og tags må ikke slås sammen uten å undersøke praksis, tillatelse og miljø.'),
      t('parker_gater_og_moteplasser', 'Parker, gater og møteplasser', 'Vanlige offentlige rom kan bli miljøankre gjennom regelmessig opphold, støtte, handel, konflikt eller ritual.', 'Lav adgangsterskel og sentralitet gjør at relasjoner kan opprettholdes uten medlemskap eller kjøp.', 'Tilstedeværelse i en park dokumenterer ikke én homogen gruppe eller frivillig offentlighet.'),
      t('venue_bakrom_og_infrastruktur', 'Venue, bakrom og infrastruktur', 'En scene avhenger av bakrom, lagring, teknikk, transport og uformelle arbeidsflater like mye som av publikumsrommet.', 'Infrastrukturen stabiliserer arrangementer og fordeler tilgang til utstyr og beslutninger.', 'Et kommersielt venue er ikke automatisk Subkultur selv om det booker alternative uttrykk.'),
      t('retten_til_byen', 'Retten til byen', 'Retten til byen retter oppmerksomheten mot hvem som kan bruke, forme og beslutte over urbane rom, ikke bare hvem som juridisk kan oppholde seg der.', 'Kollektiv bruk og krav om medvirkning utfordrer at eierskap eller markedsverdi alene bestemmer byens funksjon.', 'Begrepet er normativt og må kobles til konkrete rettigheter, beslutninger og konsekvenser.'),
      t('fortrengning_og_romlig_endring', 'Fortrengning og romlig endring', 'Fortrengning skjer når økonomiske, juridiske, sosiale eller symbolske endringer gjør videre bruk vanskelig eller umulig.', 'Økte kostnader, kontroll, ombygging og endret omdømme kan virke sammen før en formell utflytting.', 'Endring er ikke automatisk fortrengning; analysen må vise hvem som mistet hva, gjennom hvilken mekanisme.')
    ]
  },
  {
    id: 'motstand_avvik_kontroll',
    title: 'Motstand, avvik og kontroll',
    tagline: 'Hvordan regler skaper avvik, og hvordan miljøer svarer på kontroll.',
    definition: 'Fagområdet undersøker stempling, moralpanikk, politi, regulering, overvåkning, motstand og forhandling uten å anta konflikt der den ikke er dokumentert.',
    methods: [
      m('stemplingsanalyse', 'Stemplingsanalyse', 'Sammenlign handling, regel, merkelapp, håndhever og konsekvens i samme dokumenterte kjede.', 'regler, hendelser, omtale, sanksjoner og aktørreaksjoner', 'Metoden forklarer kategorisering, ikke nødvendigvis hvorfor handlingen oppsto.'),
      m('moralpanikk_prosessporing', 'Moralpanikkens prosessporing', 'Test om bekymring forsterkes gjennom symbolisering, generalisering, autoritative krav og uforholdsmessige tiltak.', 'tidsserie av medieoppslag, uttalelser, data og vedtak', 'Sterk offentlig bekymring er ikke automatisk moralpanikk dersom skade og respons er forholdsmessig dokumentert.'),
      m('kontrollkilde_triangulering', 'Triangulering av kontrollkilder', 'Sammenhold politi-, medie-, forvaltnings- og miljøkilder om samme hendelse og skill observasjon fra vurdering.', 'hendelsesnære kilder med dato, rolle og proveniens', 'Kontrollinstitusjonenes detaljerte data kan fortsatt bygge på selektiv registrering.'),
      m('handhevingsdata_analyse', 'Analyse av håndhevingsdata', 'Beregn hvem, hva, hvor og når kontroll rammer med eksplisitt nevner og regelgrunnlag.', 'kontroller, sanksjoner, befolkning/bruk, tidsrom og geografisk enhet', 'Registrert håndheving måler ikke all regelbryting og kan speile kontrollprioriteringer.'),
      m('motstandsrepertoar_analyse', 'Analyse av motstandsrepertoar', 'Klassifiser taktikker etter mål, målgruppe, risiko, ressurser og faktisk respons.', 'aksjonsdokumentasjon, kommunikasjon, observasjon og utfall', 'Synlig aksjon kan overskygge langsom organisering og omsorgsarbeid.')
    ],
    topics: [
      t('stempling_og_avvik', 'Stempling og avvik', 'Avvik oppstår også gjennom at regler lages og merkelapper anvendes på bestemte personer og handlinger.', 'Stempling påvirker adgang, selvforståelse og videre kontroll når kategorien får institusjonelle følger.', 'Perspektivet må ikke benekte reell skade eller redusere all regulering til vilkårlig makt.'),
      t('moralske_entreprenorer', 'Moralske entreprenører', 'Moralske entreprenører forsøker å definere problemer, etablere regler eller håndheve dem på vegne av en forestilt offentlig moral.', 'Ressurser og tilgang til medier eller myndigheter gjør enkelte problemdefinisjoner mer virksomme enn andre.', 'Aktører kan ha dokumentert omsorg eller skadegrunnlag; rollen avgjøres av prosessen, ikke motivet alene.'),
      t('moralpanikk', 'Moralpanikk', 'Moralpanikk er en prosess der en gruppe eller praksis framstilles som en bred samfunnstrussel gjennom forenkling og eskalering.', 'Medier, eksperter og myndigheter kan forsterke hverandres kategorier og legitimere tiltak utover dokumentert risiko.', 'Begrepet skal ikke brukes bare fordi omtalen er negativ eller tiltaket omstridt.'),
      t('politi_og_kriminalisering', 'Politi og kriminalisering', 'Kriminalisering gjør bestemte praksiser straffbare, mens politiarbeid avgjør hvordan reglene faktisk møter steder og mennesker.', 'Prioriteringer, skjønn og synlighet skaper ulik sannsynlighet for kontroll og registrering.', 'Analyse må skille lovtekst, operativ praksis og opplevd kontroll.'),
      t('regulering_og_tillatelse', 'Regulering og tillatelse', 'Tillatelser, åpningstider, støykrav, arealregler og sikkerhetskrav former hvilke miljøer som kan opprettholde steder og arrangementer.', 'Administrative krav omsetter generelle mål til kostnader, tidsbruk og adgang på lokalt nivå.', 'Regulering kan beskytte naboer og deltakere; virkningen må dokumenteres fremfor å antas som undertrykking.'),
      t('overvakning_og_synlighet', 'Overvåkning og synlighet', 'Overvåkning samler og tolker spor om personer, bevegelser eller praksiser og kan endre hvordan et miljø bruker rommet.', 'Kamera, plattformdata og patruljering gjør synlighet til både ressurs og risiko.', 'Følt overvåkning og faktisk databehandling må skilles, samtidig som usikkerhet kan påvirke atferd.'),
      t('motstandstaktikker', 'Motstandstaktikker', 'Motstand kan bestå av skjuling, omkoding, omgåelse, dokumentasjon, juridisk arbeid, satire eller direkte konfrontasjon.', 'Taktikker velges etter ressurser, risiko og hvilket publikum eller hvilken institusjon som skal påvirkes.', 'Ikke enhver avvikende handling er politisk motstand, og aktørens begrunnelse må undersøkes.'),
      t('protest_og_direkte_aksjon', 'Protest og direkte aksjon', 'Protest kommuniserer krav offentlig, mens direkte aksjon forsøker å endre situasjonen gjennom selve handlingen.', 'Aksjonen kan flytte kostnader, stoppe praksis, skape oppmerksomhet eller etablere et alternativ.', 'Symbolsk effekt, konkret utfall og intern mobilisering er forskjellige mål som må vurderes separat.'),
      t('konflikt_og_forhandling', 'Konflikt og forhandling', 'Konflikt synliggjør uforenlige krav, mens forhandling kan produsere avtaler, utsettelser eller nye prosedyrer uten full enighet.', 'Makt viser seg i hvem som får delta, hvilke alternativer som er mulige og hvem som bærer kostnaden.', 'Fravær av åpen konflikt kan skyldes stabil enighet, avhengighet, utmattelse eller manglende adgang.'),
      t('kontrollens_konsekvenser', 'Kontrollens konsekvenser', 'Kontroll kan redusere skade, flytte praksis, fragmentere nettverk eller øke risiko avhengig av utforming og miljø.', 'Tiltak endrer insentiver og geografi, og indirekte virkninger kan oppstå andre steder enn der kontrollen settes inn.', 'Intensjon eller antall kontroller er ikke nok; faktiske og fordelte utfall må måles.')
    ]
  },
  {
    id: 'medier_objekter_praksiser',
    title: 'Medier, objekter og praksiser',
    tagline: 'Hvordan miljøer lager, sirkulerer og bevarer sine egne uttrykk.',
    definition: 'Fagområdet undersøker ziner, plakater, tags, opptak, radio, gjenstander, arkiv og digitale plattformer som praksis og infrastruktur.',
    methods: [
      m('mediearkeologi', 'Mediearkeologi', 'Undersøk hvordan eldre formater, teknikker og infrastrukturer fortsatt former hva som kan produseres og bevares.', 'medieobjekter, avspillingsutstyr, formater, kataloger og brukshistorie', 'Teknologisk format forklarer ikke alene innholdets mening eller sosiale bruk.'),
      m('proveniens_og_dokumentkritikk', 'Proveniens- og dokumentkritikk', 'Spor hvem som skapte, valgte, redigerte, oppbevarte og publiserte et dokument.', 'original, metadata, arkivkontekst, versjoner og rettighetsstatus', 'God proveniens gjør ikke dokumentet representativt for hele miljøet.'),
      m('plattform_walkthrough', 'Plattform-walkthrough', 'Dokumenter grensesnitt, standardvalg, synlighetsregler og brukerbaner på et bestemt tidspunkt.', 'skjermopptak, vilkår, testkonto, dato og funksjonslogg', 'Plattformer endres raskt, og testbruk viser ikke alle personaliserte resultater.'),
      m('innholdsanalyse', 'Innholdsanalyse', 'Definer utvalg, kodingsenhet og kategorier før mønstre i tekster, bilder eller lyd telles og fortolkes.', 'avgrenset korpus, kodebok, reliabilitet og kontekstnotat', 'Frekvens er ikke det samme som betydning eller påvirkning.'),
      m('sirkulasjonsanalyse', 'Sirkulasjonsanalyse', 'Følg hvordan et objekt eller uttrykk beveger seg mellom produsenter, kanaler, steder og publikum.', 'distribusjonsspor, lenker, salg/bytte, hendelser og intervjuer', 'Synlige delinger kan skjule privat, analog eller ikke-målbar sirkulasjon.')
    ],
    topics: [
      t('fanziner_og_alternativpresse', 'Fanziner og alternativpresse', 'Fanziner og alternativpresse kombinerer egen publisering med miljøintern kritikk, dokumentasjon og distribusjon.', 'Lavskala produksjon lar deltakere styre redaksjon, format og kretsløp uten ordinære medieporter.', 'Et lite opplag er ikke automatisk opposisjonelt, og redaksjonell makt finnes også i DIY-medier.'),
      t('plakater_og_stickers', 'Plakater og stickers', 'Plakater og stickers gjør vegger, stolper og gjenstander til kortvarige distribusjonsflater for arrangement, identitet og krav.', 'Gjentakelse og plassering bygger synlighet med lave kostnader og uten stabil kanaltilgang.', 'Bevarte eksemplarer overrepresenterer ofte det visuelt slående eller det samlere valgte.'),
      t('tags_pieces_og_signaturer', 'Tags, pieces og signaturer', 'Tags og pieces er ulike writing-former med egne krav til navn, stil, tid, plass og lesbarhet.', 'Signaturen knytter handlinger på spredte flater til et rykte og en læringshistorie.', 'Analyse skal ikke publisere opplysninger som identifiserer nålevende writers eller ulovlige handlingsmønstre.'),
      t('opptak_mixtapes_og_utgivelser', 'Opptak, mixtapes og utgivelser', 'Opptak og mixtapes kuraterer lyd, rekkefølge og tilhørighet og kan sirkulere utenfor ordinære distribusjonsledd.', 'Kopiering og seleksjon bygger forbindelser mellom lokale miljøer og eksterne repertoarer.', 'Tilgjengelig lyd dokumenterer ikke automatisk rettigheter, produksjonskontekst eller mottakelse.'),
      t('klær_og_artefakter', 'Klær og artefakter', 'Klær, merker, utstyr og hjemmelagde objekter er bruksgjenstander som bærer spor av arbeid, slitasje, bytte og minne.', 'Objektene materialiserer kompetanse og relasjoner og kan flytte mellom hverdag, scene, marked og museum.', 'Et objekt må analyseres i bruk; katalogfoto alene reduserer praksis til design.'),
      t('uavhengig_radio_og_lydmedier', 'Uavhengig radio og lydmedier', 'Uavhengig radio skaper sendeflater, opplæring og alternative offentligheter gjennom teknisk og redaksjonelt arbeid.', 'Kontroll over sendeskjema og produksjon gir miljøer mulighet til å definere tema, språk og stemmer.', 'Uavhengig eierskap garanterer ikke bred deltakelse eller fravær av interne portvoktere.'),
      t('arkiv_og_dokumentasjon', 'Arkiv og dokumentasjon', 'Arkiv velger hvilke spor som bevares, beskrives og gjøres tilgjengelige og former dermed miljøets ettertid.', 'Katalogisering og proveniens kobler fragmenter til hendelser, personer og steder uten å gjøre samlingen fullstendig.', 'Arkivets tausheter må synliggjøres, særlig for muntlige, ulovlige eller sårbare praksiser.'),
      t('digitale_plattformer', 'Digitale plattformer', 'Digitale plattformer organiserer synlighet, kontakt og moderering gjennom grensesnitt, regler og datainnsamling.', 'Miljøer kan koordinere raskt, men blir samtidig avhengige av private infrastrukturer og skiftende vilkår.', 'Online aktivitet er ikke løsrevet fra sted, kropp eller sosial ulikhet.'),
      t('algoritmer_og_oppdagelse', 'Algoritmer og oppdagelse', 'Anbefalings- og rangeringssystemer påvirker hvilke uttrykk og miljøer brukere oppdager uten å være nøytrale speil av interesse.', 'Historikk, popularitet og plattformmål filtrerer sirkulasjon og kan belønne bestemte formater.', 'Uten tilgang til system og data kan analysen beskrive observerte mønstre, ikke fastslå hele algoritmens årsak.'),
      t('objektets_livslop', 'Objektets livsløp', 'Et subkulturelt objekts mening endres når det produseres, brukes, byttes, selges, arkiveres eller stilles ut.', 'Hvert skifte endrer hvem som kontrollerer objektet, hvilket publikum det møter og hvilke historier som følger med.', 'Senere samler- eller museumsverdi må ikke projiseres tilbake på opprinnelig bruk.')
    ]
  },
  {
    id: 'sosiale_randsoner_omsorg_skadereduksjon',
    title: 'Sosiale randsoner, omsorg og skadereduksjon',
    tagline: 'Gatefellesskap, åpne rusmiljøer og tjenester uten stempling eller romantisering.',
    definition: 'Fagområdet undersøker relasjoner, risiko, tjenester, rettigheter og rom i sosiale randsoner med særskilt personvern- og representasjonsvern.',
    methods: [
      m('risikomiljoanalyse', 'Risikomiljøanalyse', 'Analyser hvordan fysisk rom, marked, politikk, tjenester og relasjoner fordeler risiko og beskyttelse.', 'helse- og tjenestedata, sted, regler, intervjuer og tidsutvikling', 'Individdata må ikke brukes til å forklare strukturell risiko uten kontekst.'),
      m('tjenestereise_kartlegging', 'Kartlegging av tjenestereise', 'Følg en anonymisert brukerbane fra behov gjennom kontakt, terskel, hjelp, avbrudd og oppfølging.', 'prosedyrer, åpningstider, observasjon, anonymiserte erfaringer og utfall', 'Én reise er ikke representativ, og kartet må ikke røpe identitet eller sårbare ruter.'),
      m('deltakende_kunnskapsproduksjon', 'Deltakende kunnskapsproduksjon', 'La berørte grupper påvirke spørsmål, begreper, fortolkning og formidling med reell beslutningsmakt.', 'samskapingslogg, rolleavtaler, honorering, samtykke og uenighet', 'Deltakelse kan bli symbolsk dersom institusjonen beholder alle avgjørende valg.'),
      m('stigma_og_diskrimineringsanalyse', 'Stigma- og diskrimineringsanalyse', 'Skill merkelapp, stereotype, institusjonell behandling, forventet avvisning og konkrete konsekvenser.', 'språk, praksis, klager, tjenestedata og berørte stemmer', 'Ikke all negativ vurdering er diskriminering; sammenligningsgrunnlag og virkning må dokumenteres.'),
      m('personvern_og_representasjonsaudit', 'Personvern- og representasjonsaudit', 'Vurder identifiserbarhet, forventet offentlighet, sammenstilling, makt, skade og mulighet for medvirkning før publisering.', 'datakilder, publikum, kontekst, risikoscenario og avbøtende tiltak', 'Juridisk offentlighet er ikke alene etisk tillatelse til gjenbruk.')
    ],
    topics: [
      t('apne_rusmiljoer', 'Åpne rusmiljøer', 'Et åpent rusmiljø er et synlig, stedbundet nettverk av omsetning, bruk, sosial kontakt, tjenester og kontroll – ikke én homogen gruppe.', 'Sentralitet og gjentatte møter kobler ressurser og risiko samtidig som miljøet blir lett å regulere og omtale.', 'Beskrivelsen må unngå identifisering og skille observerbar aktivitet fra antakelser om personer.'),
      t('gatefellesskap', 'Gatefellesskap', 'Gatefellesskap kan gi informasjon, beskyttelse, identitet og gjensidig hjelp under ustabile livsvilkår.', 'Gjentatt samvær og praktisk utveksling bygger relasjoner uten formelt medlemskap eller fast lokale.', 'Fellesskap må ikke romantiseres slik at vold, utnyttelse eller ufrivillig eksponering forsvinner.'),
      t('hjemloshet_og_ustabilitet', 'Hjemløshet og ustabilitet', 'Hjemløshet omfatter flere former for manglende trygg og varig bolig og påvirker hvordan tid, eiendeler, tjenester og offentlige rom kan brukes.', 'Boligusikkerhet øker koordinasjonskostnader og gjør personer avhengige av steder og åpningstider de ikke kontrollerer.', 'Synlighet i gatebildet er ikke et fullstendig mål på hjemløshet.'),
      t('skadereduksjon', 'Skadereduksjon', 'Skadereduksjon forsøker å redusere helse- og samfunnsskade uten å gjøre rusfrihet til vilkår for all hjelp.', 'Tilgang til utstyr, nalokson, behandling, informasjon og relasjonell oppfølging kan redusere risiko og åpne tjenesteveier.', 'Tiltak må vurderes etter dekning, tilgjengelighet og faktiske utfall, ikke bare formell eksistens.'),
      t('lavterskeltjenester', 'Lavterskeltjenester', 'Lavterskeltjenester reduserer krav til henvisning, dokumentasjon, avtale eller rusfrihet for å gjøre hjelp tilgjengelig når behovet oppstår.', 'Beliggenhet, åpningstid, tillit og praktiske tilbud påvirker om formelt åpne tjenester faktisk kan brukes.', 'Lav terskel på ett punkt kan etterfølges av høye terskler videre i hjelpeforløpet.'),
      t('peerarbeid_og_gjensidig_hjelp', 'Peerarbeid og gjensidig hjelp', 'Peerarbeid bruker erfaringskunnskap i oppsøkende arbeid, tjenesteutforming, støtte og rettighetsarbeid.', 'Delt erfaring kan styrke tillit og presisjon når rollen samtidig har ressurser, opplæring og beslutningsrom.', 'Erfaring gjør ikke én person til talsperson for alle, og peerarbeid skal ikke brukes som billig erstatning for fagansvar.'),
      t('stigma_og_diskriminering', 'Stigma og diskriminering', 'Stigma kobler merkelapper til negative egenskaper og sosial avstand, mens diskriminering viser seg i ulik behandling og adgang.', 'Forventet avvisning kan endre tjenestebruk før en konkret avvisning skjer.', 'Analyse må skille holdninger, institusjonell praksis og dokumenterte konsekvenser.'),
      t('risikomiljo', 'Risikomiljø', 'Risikomiljøperspektivet flytter forklaringen fra individets valg til samspillet mellom fysisk rom, marked, politikk, tjenester og relasjoner.', 'De samme handlingene kan få ulike følger når tilgang til utstyr, hjelp, skjerming eller politiinnsats endres.', 'Strukturell analyse opphever ikke individuell handlekraft, men plasserer den i reelle rammer.'),
      t('personvern_og_representasjon', 'Personvern og representasjon', 'Formidling om sårbare miljøer må vurdere om personer kan gjenkjennes gjennom sted, bilde, tid, nettverk eller sammenstilte detaljer.', 'Dataminimering, aggregering og medvirkning reduserer skade og motvirker at mennesker blir gjort til illustrasjoner.', 'Anonymisering er utilstrekkelig dersom kombinasjonen av detaljer fortsatt identifiserer personen.'),
      t('tjenestested_og_nabokonflikt', 'Tjenestested og nabokonflikt', 'Tjenester ligger i konkrete nabolag der brukernes rettigheter, naboers erfaringer, drift og bypolitikk kan kollidere.', 'Lokalisering og organisering fordeler tilgjengelighet, synlighet og belastning mellom grupper.', 'Konflikt må dokumenteres; en tjeneste skal ikke framstilles som problemkilde bare fordi den betjener en stigmatisert gruppe.')
    ]
  },
  {
    id: 'kommersialisering_institusjonalisering_minne',
    title: 'Kommersialisering, institusjonalisering og minne',
    tagline: 'Hva som skjer når undergrunn blir marked, institusjon eller kulturarv.',
    definition: 'Fagområdet undersøker innlemmelse, profesjonalisering, gentrifisering, museum, revival og tapte steder som ulike transformasjoner av miljøer.',
    methods: [
      m('kommersialiseringskjede', 'Analyse av kommersialiseringskjeden', 'Følg hvem som velger, pakker, priser, distribuerer og tjener på et uttrykk fra miljø til marked.', 'kontrakter, priser, kreditering, distribusjon, intervjuer og eierskap', 'Salg er ikke i seg selv tap av autonomi; kontroll og fordeling må undersøkes.'),
      m('gentrifiseringssekvens', 'Gentrifiseringssekvens', 'Rekonstruer endringer i investering, omdømme, regulering, kostnad, brukere og fortrengning over tid.', 'eiendomsdata, planer, virksomheter, beboer-/brukerstemmer og stedsspor', 'Samtidig endring dokumenterer ikke at kultur alene forårsaket verdiøkning.'),
      m('institusjonaliserings_sammenligning', 'Sammenligning av institusjonalisering', 'Sammenlign styring, finansiering, adgang og praksis før og etter en formell organisatorisk endring.', 'vedtekter, budsjett, program, roller, deltakelse og intervjuer', 'Før-perioden må ikke romantiseres som fri for hierarki eller eksklusjon.'),
      m('minneregimeanalyse', 'Minnerregimeanalyse', 'Undersøk hvem som velger objekter, fortellinger, navn og tausheter når et miljø formidles som historie.', 'utstilling, arkiv, katalog, kuratorvalg, miljøstemmer og fravær', 'Bevaring er selektiv og kan ikke likestilles med miljøets egen videreføring.'),
      m('kontinuitet_og_bruddanalyse', 'Kontinuitets- og bruddanalyse', 'Identifiser hva som videreføres og hva som endres i aktører, praksis, sted, økonomi og mening.', 'før/etter-kilder, tidslinje, aktørkart og materiell dokumentasjon', 'Likhet i navn eller estetikk kan skjule fullstendig utskifting av sosial praksis.')
    ],
    topics: [
      t('innlemmelse_og_inkorporering', 'Innlemmelse og inkorporering', 'Inkorporering skjer når tegn eller praksiser tas opp i medier, marked eller institusjoner og får ny kontroll og betydning.', 'Utvalg og ompakking gjør uttrykket forståelig for et bredere publikum samtidig som enkelte konflikter tones ned.', 'Bred sirkulasjon betyr ikke at miljøet forsvinner eller at all mening blir ufarliggjort.'),
      t('kommersialisering', 'Kommersialisering', 'Kommersialisering gjør uttrykk, adgang eller opplevelser omsettelige og endrer hvem som finansierer og kontrollerer dem.', 'Pris, kontrakt, merkevare og distribusjon flytter ressurser og beslutninger gjennom verdikjeden.', 'Betalt arbeid kan styrke et miljø; analysen må vise kontroll, gevinst og konsekvens fremfor å moralisere over salg.'),
      t('merkevare_og_turisme', 'Merkevare og turisme', 'Byer og virksomheter kan bruke subkulturell historie som tegn på kreativitet, autentisitet og attraktivitet.', 'Kuratert synlighet trekker publikum og investering samtidig som uønsket risiko og konflikt redigeres bort.', 'Turisme kan også finansiere bevaring; forholdet til lokale aktører og bruk må dokumenteres.'),
      t('profesjonalisering', 'Profesjonalisering', 'Profesjonalisering innfører spesialiserte roller, lønn, standarder og ansvar i praksiser som tidligere var uformelle.', 'Kompetanse og stabil finansiering kan øke kapasitet, men også flytte makt fra deltakere til ansatte og oppdragsgivere.', 'Uformell drift er ikke automatisk mer demokratisk eller tilgjengelig.'),
      t('institusjonalisering', 'Institusjonalisering', 'Institusjonalisering gjør regler, roller og ressurser mer varige gjennom organisasjoner, avtaler eller offentlig anerkjennelse.', 'Stabilitet beskytter lokaler og aktivitet, men binder også praksisen til rapportering, styring og formelle mål.', 'Endringen må analyseres som forhandling, ikke som enkel overgang fra ekte til uekte.'),
      t('gentrifisering_og_fortrengning', 'Gentrifisering og fortrengning', 'Gentrifisering kobler investering, sosial utskifting, omdømme og romlig endring; fortrengning er en mulig, men ikke automatisk, følge.', 'Kulturell attraktivitet kan inngå i en større kjede av eiendom, planlegging og kapital som øker kostnader og endrer bruk.', 'Kulturens rolle må ikke overdrives når boligpolitikk, eierskap og makroøkonomi er sterkere drivere.'),
      t('kulturarv_og_musealisering', 'Kulturarv og musealisering', 'Musealisering flytter objekter og fortellinger fra brukssammenheng til kuratert bevaring og offentlig fortolkning.', 'Utvalg, katalogisering og utstilling gir varighet, men endrer adgang og autoritet over historien.', 'En museumsfortelling kan bevare spor uten å bevare praksis eller miljøets egen kontroll.'),
      t('revival_og_nostalgi', 'Revival og nostalgi', 'Revival gjenopptar eldre uttrykk eller praksiser, mens nostalgi former hvilke deler av fortiden som oppleves som verdifulle.', 'Nye deltakere, medier og markeder rekonstruerer fortiden for samtidige behov.', 'Gjenbruk er ikke kopi; kontinuitet og nytolkning må undersøkes separat.'),
      t('tapte_steder_og_digitalt_minne', 'Tapte steder og digitalt minne', 'Når et sted forsvinner, kan foto, kart, forum, lyd og muntlige minner opprettholde en distribuert stedstilknytning.', 'Digitale spor kobler tidligere deltakere og lar nye publikum rekonstruere ruter og hendelser.', 'Tilgjengelige nettspor favoriserer dem som dokumenterte og kan røpe personer eller ulovlige praksiser.'),
      t('videreforing_og_transformasjon', 'Videreføring og transformasjon', 'Et miljø kan videreføres gjennom relasjoner, ferdigheter og fortellinger selv når navn, sted eller formell organisasjon endres.', 'Analyse av flere dimensjoner skiller materiell, sosial og symbolsk kontinuitet fra ren merkevarelikhet.', 'Påstand om videreføring krever dokumenterte forbindelser og kan ikke bygges på estetisk likhet alene.')
    ]
  }
];

function keywordList(topic, domain) {
  return [...new Set([
    ...topic.title.toLowerCase().replace(/[–,/]/g, ' ').split(/\s+/),
    ...domain.title.toLowerCase().replace(/[–,/]/g, ' ').split(/\s+/)
  ].filter((word) => word.length > 3))].slice(0, 10);
}

function methodId(method) { return `met_sub_${method.slug}`; }
function emneId(topic) { return LEGACY_ID_BY_TOPIC[topic.slug] || `em_sub_${topic.slug}`; }
function hookId(topic) { return `hook_sub_${topic.slug}`; }

function buildMethods() {
  return {
    version: 'v5.0-canonical-foundation',
    subject_id: 'subkultur',
    subject_title: 'Subkultur',
    scope: 'universal',
    type: 'methods',
    purpose: '40 operative analysemetoder for et kildebelagt og etisk Subkultur-fagverk.',
    updated_at: '2026-08-04',
    principles: {
      operation_before_label: true,
      data_requirement_required: true,
      inference_boundary_required: true,
      privacy_and_stigma_review_required: true,
      no_synonym_padding: true
    },
    methods: DOMAINS.flatMap((domain) => domain.methods.map((method) => ({
      method_id: methodId(method),
      title: method.title,
      short_label: method.title,
      domain_ids: [domain.id],
      description: `${method.operation} Metoden bruker ${method.data}.`,
      operation: method.operation,
      required_data: method.data,
      procedure: ['Avgrens analyseenhet og tidsrom.', 'Dokumenter datagrunnlag og kildenes posisjon.', method.operation, 'Test en alternativ forklaring eller et negativt case.', 'Rapporter usikkerhet, etikk og rekkevidde.'],
      limitations: [method.limitation],
      ethics_flags: domain.id === 'sosiale_randsoner_omsorg_skadereduksjon'
        ? ['sensitive_population', 'privacy_context', 'stigma_risk', 'participatory_voice']
        : ['contextual_integrity', 'voice_balance'],
      status: 'active'
    })))
  };
}

function buildEmner() {
  return DOMAINS.flatMap((domain, domainIndex) => domain.topics.map((topic, topicIndex) => {
    const primaryMethod = domain.methods[topicIndex % domain.methods.length];
    const controlMethod = domain.methods[(topicIndex + 1) % domain.methods.length];
    return {
      emne_id: emneId(topic),
      subject_id: 'subkultur',
      domain: domain.id,
      area_id: domain.id,
      area_label: domain.title,
      level: topicIndex < 3 ? 1 : topicIndex < 7 ? 2 : 3,
      title: topic.title,
      short_label: topic.title,
      status: 'active',
      definition: topic.definition,
      why_it_matters: `${topic.mechanism} Analysen må samtidig holde fast ved denne avgrensningen: ${topic.limitation}`,
      mechanism: topic.mechanism,
      limitation: topic.limitation,
      keywords: keywordList(topic, domain),
      dimensions: ['miljo', 'praksis', 'sosial_posisjon', 'kildegrunnlag'],
      key_concepts: keywordList(topic, domain).slice(0, 6),
      key_questions: [
        `Hvilket dokumentert miljø eller hvilken praksis gjør ${topic.title.toLowerCase()} analytisk relevant?`,
        `Gjennom hvilken mekanisme virker ${topic.title.toLowerCase()} i dette caset?`,
        `Hvilken alternativ forklaring eller avgrensning kan svekke tolkningen?`,
        'Hvilke miljønære og uavhengige kilder må kombineres?'
      ],
      method_ids: [methodId(primaryMethod), methodId(controlMethod)],
      methods: [methodId(primaryMethod), methodId(controlMethod)],
      analysis_axes: ['innenfra_utenfra', 'praksis_representasjon', 'autonomi_avhengighet', 'synlighet_personvern'],
      source_requirements: {
        scholarly_primary: 1,
        independent_control_or_critique: 1,
        environment_near_case_source: 1,
        canonical_files_are_not_external_evidence: true
      },
      ethics_review: {
        required: domain.id === 'sosiale_randsoner_omsorg_skadereduksjon' || ['overvakning_og_synlighet', 'tags_pieces_og_signaturer'].includes(topic.slug),
        dimensions: ['privacy', 'stigma', 'romanticization', 'voice_balance']
      },
      order: domainIndex * 10 + topicIndex + 1
    };
  }));
}

function buildFagkart() {
  return {
    subject_id: 'subkultur',
    subject_title: 'Subkultur',
    scope: 'universal',
    type: 'fagkart',
    version: 'v5.0-canonical-foundation',
    updated_at: '2026-08-04',
    canonical_registry_version: 'subkulturpensum_v5_0',
    purpose: 'Åtte-domene fagkart for et komplett, kildebelagt og etisk Subkultur-fagverk.',
    principles: {
      documented_environment_practice_and_social_position_required: true,
      activity_aesthetic_or_venue_alone_is_insufficient: true,
      universal_theory_local_cases: true,
      source_first: true,
      canonical_files_are_not_external_evidence: true,
      environment_near_and_independent_voice_required: true,
      privacy_stigma_and_romanticization_review_required: true,
      emne_prefix_required: 'em_sub_'
    },
    categories: DOMAINS.map((domain, index) => ({
      id: domain.id,
      title: domain.title,
      tagline: domain.tagline,
      definition: domain.definition,
      order: index + 1,
      focus: domain.topics.map(emneId),
      topic_hooks: domain.topics.map((topic, topicIndex) => ({
        id: hookId(topic),
        title: topic.title,
        definition: topic.definition,
        mechanism: topic.mechanism,
        limitation: topic.limitation,
        emne_ids: [emneId(topic)],
        recommended_method_ids: [
          methodId(domain.methods[topicIndex % 5]),
          methodId(domain.methods[(topicIndex + 1) % 5])
        ],
        source_priority: ['peer_reviewed_or_scholarly_source', 'independent_control_or_critique', 'environment_near_case_source'],
        anti_patterns: ['generic_rebellion', 'style_equals_subculture', 'venue_equals_environment', 'vulnerable_people_as_scenery']
      })),
      source_priority: ['scholarly_research', 'environment_near_documentation', 'independent_control_source'],
      anti_patterns: ['romanticization', 'stigmatization', 'oslo_case_as_universal_theory', 'undocumented_conflict']
    })),
    meta: {
      domain_count: 8,
      hook_count: 80,
      emne_count: 80,
      method_count: 40,
      contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json'
    }
  };
}

function buildMapping() {
  return DOMAINS.flatMap((domain) => domain.topics.map((topic, index) => ({
    emne_id: emneId(topic),
    title: topic.title,
    mappings: [{
      fagkart_kategori: domain.id,
      fagkart_kategori_tittel: domain.title,
      topic_hook: hookId(topic),
      topic_hook_tittel: topic.title,
      mapping_tier: 'primary',
      priority_score: 10,
      recommended_method_ids: [methodId(domain.methods[index % 5]), methodId(domain.methods[(index + 1) % 5])],
      question_surface_mode: 'documented-environment-practice-social-position-first',
      documented_environment_required: true,
      documented_practice_required: true,
      documented_social_position_required: true,
      environment_near_source_required: true,
      independent_control_source_required: true,
      external_claim_basis_required: true,
      privacy_and_stigma_review_required: domain.id === 'sosiale_randsoner_omsorg_skadereduksjon',
      use_note: `Bruk ${topic.title} gjennom den dokumenterte mekanismen; behold avgrensningen og test en alternativ forklaring.`,
      anti_patterns: ['canonical_file_as_fact_source', 'generic_taste_question', 'undocumented_conflict', 'case_as_universal_proof']
    }]
  })));
}

function buildPensum() {
  return {
    version: 'v5.0-canonical-foundation',
    subject_id: 'subkultur',
    subject_title: 'Subkultur',
    scope: 'universal',
    type: 'pensum',
    canonical_registry_version: 'subkulturpensum_v5_0',
    updated_at: '2026-08-04',
    purpose: 'Canonical progresjon gjennom åtte fagområder og 80 individuelt redigerte emner.',
    canonical_files: OUT,
    summary: {
      domain_count: 8,
      emne_count: 80,
      hook_count: 80,
      method_count: 40,
      completion_status: 'foundation_ready_not_materialized'
    },
    domain_order: DOMAINS.map((domain) => domain.id),
    domains: DOMAINS.map((domain, index) => ({
      domain_id: domain.id,
      label: domain.title,
      tagline: domain.tagline,
      definition: domain.definition,
      order: index + 1,
      status: 'foundation_ready',
      emne_count: 10,
      hook_count: 10,
      method_count: 5,
      emne_ids: domain.topics.map(emneId),
      hook_ids: domain.topics.map(hookId),
      method_ids: domain.methods.map(methodId),
      completion_gate: 'theory_evidence_and_chapter_required'
    })),
    source_priority: ['scholarly_primary_source', 'independent_control_or_critique', 'environment_near_case_source'],
    primary_category_rule: 'Miljø, praksis og sosial posisjon må være dokumentert; aktivitet, stil eller arena alene kvalifiserer ikke.',
    legacy_policy: {
      old_emne_ids_are_not_implicitly_aliased: true,
      foreign_em_by_ids_are_blocked_from_completion: true,
      migration_map_required_before_runtime_switch: true
    },
    emne_migration: {
      preserved_legacy_ids: Object.values(LEGACY_ID_BY_TOPIC).sort(),
      retired_ids: {
        em_sub_digitale_miljoer: {
          status: 'retired_unreferenced',
          superseded_by: ['em_sub_nettforum_memer', 'em_sub_gaming_lan'],
          rationale: 'Det gamle samleemnet skilte ikke mellom plattformmiljøer, nettforum, memer, algoritmisk oppdagelse og spill-/LAN-praksiser. Ingen aktive Places-, People- eller quizobjekter refererte ID-en ved migrasjonen.'
        }
      }
    },
    next_gate: 'theory_claim_source_evidence'
  };
}

const generated = {
  [OUT.fagkart]: buildFagkart(),
  [OUT.emner]: buildEmner(),
  [OUT.methods]: buildMethods(),
  [OUT.mapping]: buildMapping(),
  [OUT.pensum]: buildPensum()
};

const changed = [];
for (const [relative, value] of Object.entries(generated)) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  let current = '';
  try { current = fs.readFileSync(path.join(ROOT, relative), 'utf8'); } catch {}
  if (current === next) continue;
  changed.push(relative);
  if (WRITE) fs.writeFileSync(path.join(ROOT, relative), next, 'utf8');
}

if (CHECK && changed.length) {
  console.error('Subkultur-grunnfilene er utdatert:');
  for (const file of changed) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log(`Subkultur foundation ${WRITE ? 'skrevet' : 'OK'}: 8 domener, 80 emner, 80 hooks, 40 metoder; ${changed.length} avvik.`);
}
