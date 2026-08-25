#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = Object.freeze({
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  mapping: 'data/fag/subkultur/emnemapping_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  quizRules: 'data/fag/subkultur/quiz_generator_rules_subkultur_v5_1_source_priority_patch.json',
  quizTemplate: 'data/fag/subkultur/supersetQUIZMAL_subkultur.json'
});

const t = (id, title, definition, question, mechanism, distinction, methodIds, evidence, limitation, ethics = 'Ingen særskilt personvernrisiko utover normal kildekritikk.') => ({
  id, title, definition, question, mechanism, distinction, methodIds, evidence, limitation, ethics
});

const THEORY_CANON_BY_TOPIC = Object.freeze({
  em_sub_rett_til_byen: {
    thinkers: [{
      id: 'henri_lefebvre',
      name: 'Henri Lefebvre',
      why: 'Brukerverdi, hverdagsliv og kollektiv rett til å forme urbane rom.',
      tier: 'core',
      works: ['The Right to the City']
    }]
  }
});

const LEGACY_EMNE_IDS = Object.freeze([
  "em_sub_arrangorer_dugnad",
  "em_sub_autentisitet_tap",
  "em_sub_autonomi_motstand",
  "em_sub_avvik_normalitet",
  "em_sub_byutvikling_regulering",
  "em_sub_cosplay_fandom",
  "em_sub_deltakelse_laring",
  "em_sub_digitale_miljoer",
  "em_sub_diy_praksis",
  "em_sub_dokumentasjon_arkiv",
  "em_sub_estetikk_affekt",
  "em_sub_fandom_nisjer",
  "em_sub_fanziner_plakater",
  "em_sub_gaming_lan",
  "em_sub_gentrifisering_tap",
  "em_sub_graffiti_gatekunst",
  "em_sub_grensearbeid_autentisitet",
  "em_sub_historiemakt",
  "em_sub_historisering_revival",
  "em_sub_institusjonalisering",
  "em_sub_klaer_kropp_identitet",
  "em_sub_klasse_urban_stil",
  "em_sub_klubbkultur_natt",
  "em_sub_kommersialisering",
  "em_sub_kriminalisering",
  "em_sub_kropp_modifikasjon",
  "em_sub_kulturarv_undergrunn",
  "em_sub_kulturpolitikk_subkultur",
  "em_sub_marginalisering_synlighet",
  "em_sub_merkevare_stil",
  "em_sub_moralpanikk",
  "em_sub_motkultur",
  "em_sub_musikkobjekter",
  "em_sub_nettforum_memer",
  "em_sub_nostalgi_revival",
  "em_sub_objekter_merker",
  "em_sub_okkuperte_rom",
  "em_sub_ovingsrom_kjeller",
  "em_sub_plakater_stickers",
  "em_sub_politi_kontroll",
  "em_sub_portvoktere_innvielse",
  "em_sub_regulering_eiendom",
  "em_sub_remix_stil",
  "em_sub_rett_til_byen",
  "em_sub_ritualer_praksis",
  "em_sub_samlerobjekter",
  "em_sub_scene_fellesskap",
  "em_sub_scene_konflikt",
  "em_sub_skate_byrom",
  "em_sub_skeive_miljoer",
  "em_sub_smak_distinksjon",
  "em_sub_sosial_kontroll",
  "em_sub_sosial_organisering",
  "em_sub_sprak_slang_koder",
  "em_sub_sted_scene",
  "em_sub_stil_sprak",
  "em_sub_symboler_koder",
  "em_sub_synlighet_kontroll",
  "em_sub_tapte_steder",
  "em_sub_territoriale_koder",
  "em_sub_tilhorighet_miljo",
  "em_sub_trygghet_eksklusjon",
  "em_sub_uavhengige_medier",
  "em_sub_uformelle_moteplasser",
  "em_sub_undergrunn_mainstream",
  "em_sub_undergrunn_miljo",
  "em_sub_ungdomskultur_identitet",
  "em_sub_vennegjenger_lojalitet",
  "em_sub_visuelle_grenser",
  "em_sub_grunnbegreper",
  "em_sub_musikkscener",
  "em_sub_stil_kropp_symboler"
]);

const DOMAINS = [
  {
    id: 'subkulturteori_feltgrenser',
    title: 'Subkulturteori og feltgrenser',
    definition: 'Avgrenser subkultur som dokumenterte sosiale verdener, og skiller feltet fra løs ungdoms-, stil-, sjanger- og aktivitetsklassifikasjon.',
    focus: ['feltgrense', 'subkultur', 'scene', 'motkultur', 'postsubkultur'],
    topics: [
      t('em_sub_grunnbegreper', 'Grunnbegreper i subkultur', 'Skiller subkultur, scene, motkultur, livsstil, fandom og sosial randsone etter hvilke relasjoner, normer og praksiser som faktisk kan dokumenteres.', 'Hvilket begrep beskriver caset mest presist, og hvilke observasjoner utelukker nabobegrepene?', 'Begrepsvalg styrer hvilke aktører, grenser og mekanismer analysen gjør synlige.', 'subkultur vs scene vs motkultur', ['met_sub_begrepsavgrensning'], ['fagdefinisjoner', 'casebeskrivelse', 'deltaker- og forskningskilder'], 'Begrepet må ikke brukes som etikett uten dokumentert sosial organisering.'),
      t('em_sub_musikkscener', 'Musikkscener og subkulturmiljøer', 'Undersøker når musikk inngår i et varig miljø med møteplasser, roller, normer og egen infrastruktur, framfor bare å være en sjanger eller konsert.', 'Hvilke sosiale forbindelser gjør en musikksammenheng til en scene?', 'Gjentatt samhandling mellom artister, arrangører, publikum og steder kan stabilisere en scene.', 'musikksjanger vs sosial scene', ['met_sub_sceneanalyse', 'met_sub_nettverksanalyse'], ['programarkiv', 'scenehistorier', 'intervjuer', 'stedsspor'], 'Berømmelse eller sjangertilhørighet beviser ikke et subkulturmiljø.'),
      t('em_sub_stil_kropp_symboler', 'Stil, kropp og symboler i subkulturer', 'Gir en overordnet ramme for hvordan kroppslige og visuelle uttrykk kan markere tilhørighet uten å gjøre enhver mote til subkultur.', 'Når fungerer et synlig uttrykk som sosial kode, og når er det bare individuell eller kommersiell stil?', 'Uttrykk får subkulturell betydning gjennom delt tolkning, sanksjoner og gjentatt bruk.', 'synlig stil vs sosial kode', ['met_sub_semiotisk_analyse', 'met_sub_grensearbeidsanalyse'], ['bilder med kontekst', 'deltakerforklaringer', 'sammenlignbare uttrykk'], 'Visuelle kjennetegn må ikke brukes til å identifisere eller stereotype enkeltpersoner.'),
      t('em_sub_undergrunn_miljo', 'Undergrunnsmiljø', 'Analyserer miljøer som organiserer produksjon, sirkulasjon eller møteplasser utenfor dominerende institusjoner og markeder.', 'Hvilke infrastrukturer og avhengigheter gjør miljøet reelt undergrunnspreget?', 'Egne distribusjonskanaler, rom og arbeidsformer kan gi relativ autonomi, men aldri full uavhengighet.', 'relativ autonomi vs isolasjon', ['met_sub_sceneanalyse', 'met_sub_organiseringsanalyse'], ['økonomiske spor', 'arrangørarkiv', 'deltakerkilder'], 'Selvpresentasjon som undergrunn må kontrolleres mot faktisk organisering.'),
      t('em_sub_ungdomskultur_identitet', 'Ungdomskultur og identitet', 'Undersøker ungdomskulturelle praksiser når de skaper dokumenterte fellesskap og identitetsarbeid, uten å anta at alt ungdomsliv er subkultur.', 'Hvilke praksiser og grenser gjør ungdomsmiljøet til mer enn en aldersgruppe?', 'Felles arenaer og repertoarer kan koble livsfase til kollektiv identitet.', 'alderskategori vs kulturmiljø', ['met_sub_deltakelsesanalyse', 'met_sub_begrepsavgrensning'], ['ungdommers egne kilder', 'feltstudier', 'arena- og aktivitetsdata'], 'Barn og unge krever særlig varsomhet, samtykke og minst mulig identifisering.'),
      t('em_sub_vennegjenger_lojalitet', 'Vennegjenger og lojalitet', 'Analyserer hvordan nære relasjoner, gjensidige forpliktelser og lojalitet kan bære et miljø uten at enhver vennegruppe blir en subkultur.', 'Når går relasjonene fra privat vennskap til en delt sosial verden?', 'Tette bånd kan opprettholde normer, ressurser og tilhørighet over tid.', 'privat vennskap vs kollektivt miljø', ['met_sub_nettverksanalyse', 'met_sub_fellesskapsanalyse'], ['relasjonshistorier', 'gruppepraksiser', 'møteplassdata'], 'Private relasjoner skal ikke kartlegges mer detaljert enn formålet krever.', 'Unngå navngivning av private eller sårbare nettverk.'),
      t('em_sub_fandom_nisjer', 'Fandom og nisjer', 'Skiller deltakende nisjefellesskap med egne normer og produksjonsformer fra vanlig publikum, forbruk og bred populærkultur.', 'Hva produserer eller forvalter deltakerne sammen utover å konsumere det samme?', 'Delt kunnskap, produksjon og portvokting kan omforme publikum til et varig miljø.', 'publikum vs deltakende fandom', ['met_sub_digital_fellesskapsanalyse', 'met_sub_grensearbeidsanalyse'], ['fanarbeid', 'forumspor', 'arrangementer', 'deltakerkilder'], 'En kommersiell målgruppe er ikke automatisk en subkultur.'),
      t('em_sub_motkultur', 'Motkultur', 'Avgrenser kollektive miljøer som utfordrer dominerende verdier eller institusjoner gjennom organiserte alternativer, ikke bare uttrykt misnøye.', 'Hvilket alternativ bygger miljøet, og hvilken dominerende orden retter det seg mot?', 'Motkultur kombinerer kritikk med praksiser som forsøker å virkeliggjøre andre normer.', 'opposisjon vs alternativ institusjonsbygging', ['met_sub_motstandsanalyse', 'met_sub_organiseringsanalyse'], ['programtekster', 'praksisspor', 'institusjonelle svar'], 'Konflikt alene dokumenterer ikke motkultur.'),
      t('em_sub_undergrunn_mainstream', 'Undergrunn og mainstream', 'Undersøker hvordan grensen mellom undergrunn og mainstream produseres, forhandles og flyttes av aktører, medier og markeder.', 'Hvem trekker grensen, etter hvilke kriterier og med hvilke konsekvenser?', 'Synlighet, distribusjon og institusjonell tilgang endrer ressurser og autentisitetsvurderinger.', 'analytisk grense vs fast essens', ['met_sub_grensearbeidsanalyse', 'met_sub_kommersialiseringsanalyse'], ['distribusjonsdata', 'mediedekning', 'deltakerdebatt'], 'Mainstream må ikke brukes som moralsk dom.'),
      t('em_sub_innenfra_utenfrablikk', 'Innenfra- og utenfrablikk', 'Undersøker hvordan miljøets selvforståelse, deltakende observasjon og eksterne beskrivelser belyser ulike sider av samme praksis.', 'Hvor støtter eller motsier miljønære og uavhengige kilder hverandre, og hvilke posisjoner former beskrivelsene?', 'Triangulering mellom posisjonerte kilder gjør både taus kunnskap, makt og stemplingsrisiko synlig.', 'miljønær innsikt vs representativitet og ekstern kontroll', ['met_sub_begrepsavgrensning', 'met_sub_etisk_kildeanalyse'], ['miljønære kilder', 'refleksive feltnotater', 'uavhengige kontrollkilder'], 'Nærhet gir ikke automatisk representativitet, og avstand gir ikke automatisk nøytralitet.', 'Kildeposisjon, samtykke og mulig skade skal beskrives eksplisitt.')
    ]
  },
  {
    id: 'fellesskap_scener_egenorganisering',
    title: 'Fellesskap, scener og egenorganisering',
    definition: 'Forklarer hvordan deltakere bygger, vedlikeholder og bestrider fellesskap, scener, regler og egenorganiserte infrastrukturer.',
    focus: ['fellesskap', 'scene', 'egenorganisering', 'deltakelse', 'grenser'],
    topics: [
      t('em_sub_arrangorer_dugnad', 'Arrangører og dugnad', 'Undersøker det ofte usynlige arbeidet som gjør arrangementer, lokaler og miljøer mulige gjennom koordinering, frivillighet og gjensidige forpliktelser.', 'Hvordan fordeles arbeid, ansvar og anerkjennelse i miljøet?', 'Dugnad kan bygge kapasitet og tilhørighet, men også skjule ulik belastning.', 'frivillighet vs ubetalt skjevfordeling', ['met_sub_organiseringsanalyse', 'met_sub_deltakelsesanalyse'], ['vaktlister', 'møtereferater', 'arrangørintervjuer'], 'Romantisering av dugnad kan skjule konflikt og utbrenthet.'),
      t('em_sub_deltakelse_laring', 'Deltakelse og læring', 'Analyserer hvordan ferdigheter, normer og roller læres gjennom observasjon, øving, veiledning og gradvis deltakelse.', 'Hvilke trinn fører en ny deltaker fra perifer til mer sentral rolle?', 'Praksisfellesskap overfører kunnskap gjennom handling og sosial tilbakemelding.', 'formell opplæring vs situert læring', ['met_sub_deltakelsesanalyse', 'met_sub_ritualanalyse'], ['læringsforløp', 'verkstedpraksis', 'deltakerberetninger'], 'Ikke anta at tilgang til arenaen betyr lik tilgang til læring.'),
      t('em_sub_grensearbeid_autentisitet', 'Grensearbeid og autentisitet', 'Undersøker hvordan deltakere skiller ekte, troverdig og innenfor fra falskt, kommersielt eller utenfor.', 'Hvilke handlinger og ressurser brukes for å hevde eller bestride autentisitet?', 'Autentisitetsdommer fordeler status og beskytter eller lukker fellesskapet.', 'selvforståelse vs sosial anerkjennelse', ['met_sub_grensearbeidsanalyse', 'met_sub_distinksjonsanalyse'], ['debatter', 'sanksjoner', 'deltakerkilder'], 'Analysen skal beskrive dommene, ikke overta dem som fasit.'),
      t('em_sub_portvoktere_innvielse', 'Portvoktere og innvielse', 'Kartlegger formelle og uformelle aktører som styrer adgang, informasjon, scener, roller eller anerkjennelse.', 'Hvem kan åpne eller lukke dører, og hvilke prøver må nye deltakere bestå?', 'Kontroll over knappe ressurser og normkunnskap gir portvoktermakt.', 'beskyttelse vs eksklusjon', ['met_sub_organiseringsanalyse', 'met_sub_grensearbeidsanalyse'], ['adgangsregler', 'rollefordeling', 'erfaringsberetninger'], 'Skjulte adgangskoder skal ikke publiseres dersom det øker risiko.'),
      t('em_sub_ritualer_praksis', 'Ritualer og praksis', 'Analyserer gjentatte handlinger som skaper felles rytme, overgang, tilhørighet eller minne.', 'Hva gjør ritualet med deltakernes relasjoner før, under og etter handlingen?', 'Gjentakelse og felles oppmerksomhet kan gjøre normer kroppslige og kollektive.', 'rutine vs sosialt ladet ritual', ['met_sub_ritualanalyse', 'met_sub_deltakelsesanalyse'], ['observasjon', 'sekvensbeskrivelse', 'deltakertolkning'], 'Ritualer må ikke eksotifiseres eller løsrives fra hverdagspraksis.'),
      t('em_sub_scene_fellesskap', 'Scene og fellesskap', 'Undersøker hvordan aktører, steder, hendelser og medier kobles til et gjenkjennelig sosialt og kulturelt felt.', 'Hvilke forbindelser gjør at enkeltaktiviteter oppfattes som samme scene?', 'Gjentatte relasjoner og felles referanser skaper sceneidentitet på tvers av arrangementer.', 'arrangementsrekke vs sosial scene', ['met_sub_sceneanalyse', 'met_sub_nettverksanalyse'], ['programmer', 'aktørnettverk', 'stedshistorikk'], 'En scene kan være fragmentert og må ikke fremstilles som én stemme.'),
      t('em_sub_scene_konflikt', 'Scenekonflikt', 'Analyserer interne uenigheter om retning, ressurser, trygghet, stil og representasjon som en del av scenens organisering.', 'Hvilke interesser og maktforskjeller strukturerer konflikten?', 'Konflikt kan både splitte miljøer og klargjøre normer og ansvar.', 'sakskonflikt vs personliggjøring', ['met_sub_konfliktanalyse', 'met_sub_organiseringsanalyse'], ['møtespor', 'flere partsstemmer', 'tidslinje'], 'Unngå å gjengi udokumenterte anklager eller identifisere sårbare parter.'),
      t('em_sub_sosial_organisering', 'Sosial organisering', 'Kartlegger roller, beslutningsformer, arbeidsdeling og ressursflyt i formelle og uformelle miljøer.', 'Hvordan blir beslutninger tatt, håndhevet og endret?', 'Organisasjonsformer fordeler handlekraft, ansvar og tilgang.', 'formell struktur vs faktisk praksis', ['met_sub_organiseringsanalyse'], ['vedtekter', 'møter', 'arbeidsdeling', 'ressurser'], 'Selvorganisering betyr ikke fravær av makt.'),
      t('em_sub_tilhorighet_miljo', 'Tilhørighet og miljø', 'Undersøker hvordan deltakere utvikler opplevelse av medlemskap, gjenkjennelse og ansvar overfor et miljø.', 'Hvilke relasjoner og praksiser gjør tilhørigheten varig eller situasjonell?', 'Gjensidig anerkjennelse og gjentatt deltakelse skaper sosial forankring.', 'selvidentifikasjon vs gjensidig medlemskap', ['met_sub_fellesskapsanalyse', 'met_sub_deltakelsesanalyse'], ['deltakerstemmer', 'møtefrekvens', 'felles praksiser'], 'Ingen enkelt deltaker kan uten videre representere hele miljøet.'),
      t('em_sub_trygghet_eksklusjon', 'Trygghet og eksklusjon', 'Analyserer hvordan trygghetstiltak, normer og adgangsregler samtidig kan beskytte noen og stenge andre ute.', 'Hvem blir tryggere, hvem får høyere terskel, og hvem definerer problemet?', 'Regler om adgang og atferd omfordeler risiko og tilhørighet.', 'trygghet for noen vs lik tilgang for alle', ['met_sub_trygghets_og_eksklusjonsanalyse', 'met_sub_konfliktanalyse'], ['husregler', 'hendelsesdata', 'ulike deltakerperspektiver'], 'Sikkerhetshendelser og utsatte personer krever dataminimering og kontekst.' )
    ]
  },
  {
    id: 'stil_symboler_koder_kropp',
    title: 'Stil, symboler, koder og kropp',
    definition: 'Analyserer hvordan uttrykk får sosial betydning gjennom bruk, fortolkning, kropp, smak og grensearbeid.',
    focus: ['stil', 'symbol', 'kode', 'kropp', 'smak'],
    topics: [
      t('em_sub_estetikk_affekt', 'Estetikk og affekt', 'Undersøker hvordan sanseinntrykk, stemning og kroppslig intensitet former tiltrekning, avstand og kollektiv erfaring.', 'Hvordan produseres en bestemt stemning, og hva gjør den med deltakelsen?', 'Lyd, lys, tempo, tetthet og materialitet påvirker kroppslige og sosiale responser.', 'beskrevet stemning vs dokumentert virkning', ['met_sub_affektanalyse'], ['rombeskrivelse', 'sansedata', 'deltakerfortolkning'], 'Følelsesvirkning må ikke generaliseres fra én observatør.'),
      t('em_sub_klaer_kropp_identitet', 'Klær, kropp og identitet', 'Analyserer hvordan påkledning og kroppslig fremføring uttrykker tilhørighet, forskjell og situasjonell identitet.', 'Hvilke betydninger får klærne i dette miljøet og denne situasjonen?', 'Kropp og klær kommuniserer gjennom delte, men omstridte koder.', 'selvpresentasjon vs andres lesning', ['met_sub_kropps_og_stilanalyse', 'met_sub_semiotisk_analyse'], ['bildekontekst', 'deltakerforklaringer', 'sammenligning'], 'Utseende skal ikke brukes til å tilskrive identitet til enkeltpersoner.'),
      t('em_sub_kropp_modifikasjon', 'Kropp og modifikasjon', 'Undersøker tatovering, piercing, hår og andre kroppspraksiser som sosialt situerte valg, håndverk og tegn.', 'Hvilke relasjoner, risikoer og betydninger inngår i modifikasjonen?', 'Varige eller krevende inngrep kan materialisere erfaring, tilhørighet og autonomi.', 'personlig valg vs sosialt kodet praksis', ['met_sub_kropps_og_stilanalyse', 'met_sub_materialitetsanalyse'], ['utøverpraksis', 'deltakerkilder', 'helse- og reguleringskontekst'], 'Kroppsdata er sensitive og krever eksplisitt samtykke ved individnivå.'),
      t('em_sub_objekter_merker', 'Objekter og merker', 'Analyserer hvordan patches, pins, logoer og hverdagsobjekter bærer minner, medlemskap og posisjon.', 'Hvordan er objektets betydning skapt gjennom bruk, sirkulasjon og gjenkjennelse?', 'Materielle ting stabiliserer relasjoner og gjør koder flyttbare.', 'vare som produkt vs objekt som sosialt spor', ['met_sub_materialitetsanalyse', 'met_sub_semiotisk_analyse'], ['objekthistorie', 'bruksspor', 'sirkulasjon'], 'Ikke anta mening fra symbolet alene.'),
      t('em_sub_remix_stil', 'Remix og stil', 'Undersøker hvordan eksisterende uttrykk siteres, omformes og kombineres for å skape nye posisjoner.', 'Hva er hentet, hva er endret, og hvem kan lese forskjellen?', 'Remix skaper betydning gjennom gjenkjennelse og forskyvning.', 'kopi vs transformativ gjenbruk', ['met_sub_remixanalyse', 'met_sub_semiotisk_analyse'], ['før-og-etter-materiale', 'produksjonskontekst', 'mottakelse'], 'Kulturell appropriasjon og ulik makt må vurderes konkret.'),
      t('em_sub_smak_distinksjon', 'Smak og distinksjon', 'Analyserer hvordan vurderinger av kvalitet og smak fordeler status og avstand innenfor og mellom miljøer.', 'Hvilke ressurser kreves for å kunne den rette smaken?', 'Kunnskap, tilgang og sosial bakgrunn kan omformes til anerkjennelse.', 'personlig preferanse vs sosial distinksjon', ['met_sub_distinksjonsanalyse'], ['smaksdebatter', 'tilgangsdata', 'statusmarkører'], 'Analysen må ikke behandle elitisme som naturlig kvalitet.'),
      t('em_sub_sprak_slang_koder', 'Språk, slang og koder', 'Undersøker hvordan ordvalg, sjargong og indirekte uttrykk skaper presisjon, humor, vern og grenser.', 'Hvem forstår koden, i hvilken situasjon og med hvilken effekt?', 'Språklig kompetanse kan gi tilgang og samtidig skjule mening for utenforstående.', 'fagspråk vs ekskluderende kode', ['met_sub_sprakanalyse', 'met_sub_grensearbeidsanalyse'], ['samtalekontekst', 'tekstmateriale', 'deltakerforklaring'], 'Private eller sikkerhetsrelevante koder skal ikke avdekkes ukritisk.'),
      t('em_sub_stil_sprak', 'Stil som språk', 'Analyserer stil som et sammensatt tegnsystem der plagg, lyd, bevegelse og situasjon virker sammen.', 'Hvilke kombinasjoner gjør uttrykket meningsfullt for dem som kan lese det?', 'Betydning oppstår relasjonelt mellom tegn, bærere, publikum og kontekst.', 'enkelttegn vs stilistisk helhet', ['met_sub_stilanalyse', 'met_sub_semiotisk_analyse'], ['kombinerte uttrykk', 'kontekst', 'mottakerlesninger'], 'Stil har ikke én stabil oversettelse.'),
      t('em_sub_symboler_koder', 'Symboler og koder', 'Undersøker hvordan tegn kondenserer historier, lojalitet og konflikt gjennom konvensjoner som kan være lokale og skiftende.', 'Hvilke kilder viser hva symbolet betyr her og nå?', 'Gjentatt bruk og kollektiv tolkning stabiliserer symbolsk mening.', 'tegnform vs sosial betydning', ['met_sub_symbolanalyse', 'met_sub_semiotisk_analyse'], ['brukskontekst', 'arkiv', 'deltakertolkning'], 'Symboltolkning uten kontekst kan produsere feil og stempling.'),
      t('em_sub_visuelle_grenser', 'Visuelle grenser', 'Analyserer hvordan estetiske valg gjør innenfor og utenfor synlig i rom, medier, kropp og situert samhandling.', 'Hvordan markeres grensen, og kan den krysses eller forhandles?', 'Visuelle repertoarer gjør sosial sortering rask, men aldri entydig.', 'gjenkjennelse vs stereotypisering', ['met_sub_grensearbeidsanalyse', 'met_sub_stilanalyse'], ['visuelt materiale', 'adgangspraksis', 'deltakerstemmer'], 'Visuelle mønstre skal ikke brukes til profilering av individer.')
    ]
  },
  {
    id: 'steder_territorier_okkupering',
    title: 'Steder, territorier og okkupasjon',
    definition: 'Undersøker hvordan miljøer skaper, forsvarer og mister rom gjennom bruk, symboler, eiendom, regulering og konflikt.',
    focus: ['sted', 'territorium', 'okkupasjon', 'byrom', 'romlig makt'],
    topics: [
      t('em_sub_gentrifisering_tap', 'Gentrifisering og tap', 'Analyserer hvordan investering, prisendring, regulering og omdømme kan fortrenge miljøer eller endre deres handlingsrom.', 'Hvilken mekanisme kobler områdeendring til konkret tap av tilgang eller kontroll?', 'Økte kostnader og endret eierskap kan bryte stedbundne nettverk.', 'områdefornyelse vs dokumentert fortrengning', ['met_sub_gentrifiseringsanalyse', 'met_sub_stedsanalyse'], ['leie- og eierskapsdata', 'flyttehistorikk', 'planvedtak'], 'Ikke bruk gentrifisering som totalforklaring uten tidsrekkefølge.'),
      t('em_sub_graffiti_gatekunst', 'Graffiti og gatekunst', 'Skiller writerpraksis, tagging, bestillingsverk og gatekunst etter produksjon, publikum, risiko og kontroll over flaten.', 'Hvilken praksis og hvilket miljø produserte uttrykket, under hvilke regler?', 'Kontroll over navn, flater og synlighet organiserer både fellesskap og konflikt.', 'graffiti som praksis vs bilde som estetikk', ['met_sub_graffitianalyse', 'met_sub_stedsanalyse'], ['lagvise flatespor', 'writerkilder', 'regulering', 'arkiv'], 'Ikke identifiser aktive utøvere eller ulovlige handlinger uten klar offentlighet.'),
      t('em_sub_klubbkultur_natt', 'Klubbkultur og natt', 'Analyserer nattlige scener gjennom dørpolitikk, musikk, rus, trygghet, økonomi og midlertidig bruk av rom.', 'Hvordan fordeles adgang, risiko og kontroll gjennom natten?', 'Tidsavgrensede rom kan skape intens tilhørighet samtidig som adgang og sikkerhet blir selektiv.', 'arrangement vs varig klubbscene', ['met_sub_klubbanalyse', 'met_sub_trygghets_og_eksklusjonsanalyse'], ['program', 'dørregler', 'deltakerkilder', 'tilsyn'], 'Rus, seksualitet og sikkerhet krever varsom og ikke-sensasjonell behandling.'),
      t('em_sub_okkuperte_rom', 'Okkuperte rom', 'Undersøker hvordan uautorisert eller omstridt bruk av bygninger skaper bolig, kultur, politikk og forhandling om eiendom.', 'Hvordan etableres faktisk kontroll, legitimitet og hverdagsdrift i rommet?', 'Kollektiv tilstedeværelse og vedlikehold kan utfordre formell eiendomsrett uten å oppheve den.', 'faktisk bruk vs juridisk eierskap', ['met_sub_romlig_maktanalyse', 'met_sub_organiseringsanalyse'], ['eiendomsdata', 'brukerarkiv', 'avtaler', 'myndighetskilder'], 'Ikke publiser opplysninger som øker risikoen for beboere eller aktive konflikter.'),
      t('em_sub_ovingsrom_kjeller', 'Øvingsrom og kjeller', 'Analyserer rimelige og skjermede arbeidsrom som infrastruktur for øving, produksjon, sosialisering og scenevekst.', 'Hva gjør rommet mulig som ikke kunne skjedd på den synlige scenen?', 'Lav terskel og kontroll over tid gir rom for prøving, feil og langsom kompetansebygging.', 'bakromsinfrastruktur vs offentlig arena', ['met_sub_stedsanalyse', 'met_sub_deltakelsesanalyse'], ['brukskalender', 'romhistorie', 'utøverintervjuer'], 'Private øvingssteder skal ikke lokaliseres mer presist enn nødvendig.'),
      t('em_sub_skate_byrom', 'Skate og byrom', 'Undersøker skating som stedskapende praksis når gjentatt bruk, ferdigheter, normer og konflikter danner et miljø.', 'Hvordan omformer skatere stedets funksjon, rytme og sosiale betydning?', 'Bevegelse og gjentakelse gjør arkitektur til lærings- og møtested.', 'skateanlegg vs dokumentert skatemiljø', ['met_sub_romlig_praksisanalyse', 'met_sub_stedsanalyse'], ['bruksmønstre', 'skaterkilder', 'design og regulering'], 'Et anlegg alene beviser ikke subkultur.'),
      t('em_sub_sted_scene', 'Sted og scene', 'Analyserer hvordan et konkret sted blir knutepunkt, symbol og praktisk ressurs for en scene.', 'Hvilke relasjoner forsvinner eller består dersom stedet flyttes eller stenger?', 'Samlokalisering kan redusere terskler, binde nettverk og lagre kollektivt minne.', 'scene på et sted vs scene som er avhengig av stedet', ['met_sub_sceneanalyse', 'met_sub_stedsanalyse'], ['aktørnettverk', 'stedstidslinje', 'flyttespor'], 'Ikke reduser en scene til én bygning.'),
      t('em_sub_byutvikling_regulering', 'Byutvikling og regulering', 'Undersøker hvordan planlegging, sikkerhetskrav, støyregler og arealbruk former subkulturelle rom.', 'Hvilket vedtak eller regelverk endrer faktisk miljøets handlingsrom?', 'Formelle standarder kan stabilisere, flytte eller lukke uformell bruk.', 'regulering som ramme vs regulering som årsak', ['met_sub_reguleringsanalyse', 'met_sub_romlig_maktanalyse'], ['planer', 'vedtak', 'tilsyn', 'brukerrespons'], 'Kausalitet krever dokumentert tidsrekkefølge og implementering.'),
      t('em_sub_territoriale_koder', 'Territoriale koder', 'Analyserer tegn, rutiner og relasjoner som signaliserer hvem som bruker, kjenner eller hevder et område.', 'Hvordan blir territoriet gjenkjent og håndhevet uten formelt eierskap?', 'Gjentatt bruk og kodet kommunikasjon kan skape uformell kontroll.', 'tilhørighet vs eksklusivt krav', ['met_sub_romlig_praksisanalyse', 'met_sub_symbolanalyse'], ['brukstid', 'markeringer', 'deltakerforklaring'], 'Ikke avslør sårbare gruppers detaljerte oppholdsmønstre.'),
      t('em_sub_uformelle_moteplasser', 'Uformelle møteplasser', 'Undersøker parker, gater, trapper og andre ordinære rom som får særskilt sosial funksjon gjennom gjentatt bruk.', 'Hvilke relasjoner og tjenester gjør stedet til mer enn et tilfeldig oppholdssted?', 'Tilgjengelighet og gjentakelse kan skape sosial infrastruktur uten formell organisasjon.', 'offentlig rom vs miljøets møteplass', ['met_sub_stedsanalyse', 'met_sub_fellesskapsanalyse'], ['observasjon over tid', 'brukerstemmer', 'nabolagskilder'], 'Sårbare brukere skal beskrives aggregert og uten rutekartlegging.')
    ]
  },
  {
    id: 'motstand_avvik_kontroll',
    title: 'Motstand, avvik og kontroll',
    definition: 'Analyserer hvordan avvik skapes, motstand organiseres og kontroll utøves gjennom lover, institusjoner, medier og interne normer.',
    focus: ['motstand', 'avvik', 'kontroll', 'kriminalisering', 'regulering'],
    topics: [
      t('em_sub_autonomi_motstand', 'Autonomi og motstand', 'Undersøker hvordan miljøer søker selvbestemmelse over rom, produksjon og normer, og hvilke avhengigheter som begrenser autonomien.', 'Hva kontrollerer miljøet selv, og hva kontrolleres fortsatt utenfra?', 'Egne ressurser og beslutningsformer kan øke handlingsrom uten å fjerne ytre makt.', 'autonomi vs absolutt uavhengighet', ['met_sub_motstandsanalyse', 'met_sub_organiseringsanalyse'], ['ressursflyt', 'beslutninger', 'forhandlinger'], 'Motstand skal ikke romantiseres som fravær av intern makt.'),
      t('em_sub_avvik_normalitet', 'Avvik og normalitet', 'Analyserer hvordan handlinger og grupper defineres som avvikende i bestemte institusjonelle og historiske sammenhenger.', 'Hvem har makt til å definere normalen, og hvilke følger får etiketten?', 'Regler og reaksjoner produserer avvikskategorier framfor bare å oppdage dem.', 'handling vs sosial avviksetikett', ['met_sub_avviksanalyse', 'met_sub_diskursanalyse'], ['regelverk', 'reaksjoner', 'selvdefinisjon'], 'Analysen må ikke gjenta stemplende kategorier som nøytral fakta.'),
      t('em_sub_kriminalisering', 'Kriminalisering', 'Undersøker prosessen der praksiser flyttes inn under straff, sanksjoner eller intensiv kontroll.', 'Hvilken regelendring eller håndhevingspraksis gjør handlingen straffbar i praksis?', 'Lovgivning og selektiv håndheving omformer risiko, synlighet og organisering.', 'ulovlighet vs kriminaliseringsprosess', ['met_sub_kriminaliseringsanalyse', 'met_sub_reguleringsanalyse'], ['lovtekst', 'håndhevingsdata', 'aktørperspektiver'], 'Unngå å identifisere mulige lovbrudd eller personer utover dokumentert offentlighet.'),
      t('em_sub_moralpanikk', 'Moralpanikk', 'Analyserer uforholdsmessig og symboltung bekymring når grupper fremstilles som trussel mot samfunnsorden.', 'Hvordan kobles enkelthendelser til en generalisert trussel, og hvem forsterker koblingen?', 'Medier, eksperter og myndigheter kan eskalere bekymring gjennom gjentakelse og typifisering.', 'reell skade vs overgeneralisert trusselbilde', ['met_sub_moralpanikkanalyse', 'met_sub_diskursanalyse'], ['medietidslinje', 'policyrespons', 'skadedata'], 'Begrepet må ikke brukes til å avvise reelle skader uten undersøkelse.'),
      t('em_sub_politi_kontroll', 'Politi og kontroll', 'Undersøker synlig og skjult politiinnsats, ordensregulering og møte mellom kontrollmyndighet og miljø.', 'Hvilke kontrollmidler brukes, mot hvem og med hvilke dokumenterte virkninger?', 'Tilstedeværelse, registrering og sanksjon endrer bruk av rom og risikovurdering.', 'formelt mandat vs faktisk praksis', ['met_sub_kontrollanalyse', 'met_sub_romlig_maktanalyse'], ['instrukser', 'hendelsesdata', 'flere partsstemmer'], 'Sikkerhetsopplysninger og persondata skal minimeres.'),
      t('em_sub_regulering_eiendom', 'Regulering og eiendom', 'Analyserer hvordan eierskap, kontrakter, tillatelser og tekniske krav fordeler kontroll over subkulturelle rom.', 'Hvem kan fatte bindende beslutninger om adgang, bruk og varighet?', 'Juridisk og økonomisk kontroll kan overstyre sosial bruk og opparbeidet tilhørighet.', 'sosial legitimitet vs formell råderett', ['met_sub_reguleringsanalyse', 'met_sub_romlig_maktanalyse'], ['grunnbok', 'kontrakter', 'vedtak', 'brukspraksis'], 'Skillet mellom rettslig posisjon og normativ vurdering må holdes tydelig.'),
      t('em_sub_rett_til_byen', 'Rett til byen', 'Undersøker krav om å delta i, bruke og forme byen utover formell adgang til offentlig rom.', 'Hvem får faktisk påvirke byrommets bruk og utvikling?', 'Deltakelse og kollektiv bruk kan utfordre en rent markeds- eller forvaltningsstyrt by.', 'tilgang til byen vs makt til å forme den', ['met_sub_rett_til_byen_analyse', 'met_sub_romlig_maktanalyse'], ['medvirkningsspor', 'planvedtak', 'brukerkrav'], 'Rettighetsbegrepet må knyttes til konkrete institusjoner og prosesser.'),
      t('em_sub_sosial_kontroll', 'Sosial kontroll', 'Analyserer interne normer, sanksjoner og omsorgsformer som regulerer deltakernes atferd og adgang.', 'Hvordan håndheves normen, og hvem kan utfordre den?', 'Rykte, adgang, støtte og sanksjoner kan virke sterkere enn formelle regler.', 'gjensidig ansvar vs tvang og eksklusjon', ['met_sub_kontrollanalyse', 'met_sub_fellesskapsanalyse'], ['normfortellinger', 'sanksjonsspor', 'deltakerperspektiver'], 'Påstander om kontroll krever flere perspektiver og skadebevissthet.'),
      t('em_sub_synlighet_kontroll', 'Synlighet og kontroll', 'Undersøker hvordan økt synlighet kan gi anerkjennelse og ressurser, men også overvåkning, regulering og tap av vern.', 'Hvilke gevinster og risikoer følger av å bli synlig for ulike publikum?', 'Synlighet flytter informasjon mellom miljø, marked, medier og myndigheter.', 'representasjon vs eksponering', ['met_sub_kontrollanalyse', 'met_sub_diskursanalyse'], ['mediespor', 'plattformdata', 'kontrollrespons'], 'Ikke øk synligheten til personer eller steder som aktivt søker vern.'),
      t('em_sub_kulturpolitikk_subkultur', 'Kulturpolitikk og subkultur', 'Analyserer hvordan støtte, lokaler, programmering og kulturarvpolitikk anerkjenner og omformer undergrunnsmiljøer.', 'Hvilke kriterier avgjør hvem som får ressurser, og hva må miljøet endre for å kvalifisere?', 'Offentlig støtte kan gi stabilitet samtidig som rapportering og kategorier endrer praksis.', 'ressurstilgang vs institusjonell tilpasning', ['met_sub_institusjonsanalyse', 'met_sub_reguleringsanalyse'], ['tildelingskriterier', 'budsjett', 'søknader', 'miljørespons'], 'Støtte må ikke tolkes automatisk som kontroll eller suksess.')
    ]
  },
  {
    id: 'medier_objekter_praksiser',
    title: 'Medier, objekter og praksiser',
    definition: 'Undersøker hvordan miljøer produserer, sirkulerer og bevarer uttrykk, medier, objekter og ferdigheter.',
    focus: ['medier', 'objekter', 'DIY', 'digital praksis', 'sirkulasjon'],
    topics: [
      t('em_sub_cosplay_fandom', 'Cosplay og fandom', 'Analyserer kostymebygging, fremføring og fellesskap som deltakende praksis med egne ferdigheter og normer.', 'Hvordan kobles håndverk, karaktertolkning og sosial anerkjennelse i miljøet?', 'Produksjon og fremføring gjør fans til medskapere og synlige deltakere.', 'kostymeforbruk vs deltakende praksis', ['met_sub_materialitetsanalyse', 'met_sub_deltakelsesanalyse'], ['arbeidsprosess', 'arrangement', 'deltakerkilder'], 'Bilder av deltakere krever samtykke og kontekst.'),
      t('em_sub_digitale_miljoer', 'Digitale miljøer', 'Undersøker nettbaserte miljøer med varige relasjoner, normer, roller og praksiser framfor tilfeldige følgergrupper.', 'Hvilke strukturer gjør det digitale fellesskapet sosialt varig?', 'Plattformfunksjoner og moderering former synlighet, adgang og kollektiv hukommelse.', 'publikumstall vs sosial organisering', ['met_sub_digital_fellesskapsanalyse', 'met_sub_nettverksanalyse'], ['trådforløp', 'moderering', 'deltakerkilder'], 'Lukkede rom og brukernavn skal ikke gjøres søkbare uten samtykke.'),
      t('em_sub_diy_praksis', 'DIY-praksis', 'Analyserer egenproduksjon, reparasjon og selvpublisering som materiell og organisatorisk strategi.', 'Hva produseres selv, hvorfor, og hvilke avhengigheter består?', 'Kontroll over produksjonsmidler kan redusere terskler og utvikle kollektiv kompetanse.', 'gjør-det-selv som hobby vs autonom infrastruktur', ['met_sub_diy_analyse', 'met_sub_organiseringsanalyse'], ['produksjonskjede', 'kostnader', 'arbeidsdeling'], 'DIY skal ikke romantiseres dersom arbeid og ressurser er skjevt fordelt.'),
      t('em_sub_fanziner_plakater', 'Fanziner og plakater', 'Undersøker selvpubliserte trykksaker som medier for informasjon, estetikk, nettverk og intern debatt.', 'Hvordan kobler trykksaken produsenter, steder og publikum?', 'Lavkostmedier kan sirkulere perspektiver uten etablert redaksjonell infrastruktur.', 'primærkilde til selvforståelse vs bevis for virkning', ['met_sub_mediearkeologisk_analyse', 'met_sub_diy_analyse'], ['originaltrykk', 'distribusjonsspor', 'produksjonskontekst'], 'Private adresser og personopplysninger i historisk materiale må skjermes.'),
      t('em_sub_gaming_lan', 'Gaming og LAN', 'Analyserer spill- og LAN-miljøer gjennom fysisk samvær, teknisk infrastruktur, konkurranse og kollektiv læring.', 'Hva gjør samlingen til et miljø framfor individuell spilling på samme sted?', 'Delt teknisk arbeid, tidsrytme og spillpraksis kan bygge varige relasjoner.', 'aktivitet vs dokumentert spillmiljø', ['met_sub_digital_fellesskapsanalyse', 'met_sub_deltakelsesanalyse'], ['arrangementsdata', 'nettverk', 'deltakerhistorier'], 'Mindreårige og brukeridentiteter krever ekstra vern.'),
      t('em_sub_musikkobjekter', 'Musikkobjekter', 'Undersøker kassetter, vinyl, mixtapes og utstyr som bærere av lyd, nettverk, minne og status.', 'Hvordan endrer objektets format produksjon, sirkulasjon og lytting?', 'Materielle formater organiserer tilgang og skaper spor etter relasjoner.', 'musikkverk vs sosialt musikkobjekt', ['met_sub_materialitetsanalyse', 'met_sub_mediearkeologisk_analyse'], ['objektbiografi', 'opplag', 'distribusjon', 'bruk'], 'Samlerverdi må skilles fra dokumentert miljøbetydning.'),
      t('em_sub_nettforum_memer', 'Nettforum og memer', 'Analyserer hvordan forumtråder og memer bygger felles referanser, konflikt og grensearbeid gjennom rask sirkulasjon.', 'Hvem kan produsere og forstå referansen, og hvordan endres den i sirkulasjon?', 'Remiks og repetisjon gjør kollektiv kunnskap synlig og foranderlig.', 'viral spredning vs miljøintern betydning', ['met_sub_digital_fellesskapsanalyse', 'met_sub_remixanalyse'], ['trådkontekst', 'varianter', 'sirkulasjonstid'], 'Ikke løft innhold fra kontekstforventet private rom uten samtykke.'),
      t('em_sub_plakater_stickers', 'Plakater og stickers', 'Undersøker små trykk og merker som stedbundne medier for kunngjøring, identitet og territoriell synlighet.', 'Hvordan bruker materialet plassering og gjentakelse for å nå et bestemt publikum?', 'Lav terskel og fysisk distribusjon kobler budskap til konkrete ruter og steder.', 'grafisk objekt vs romlig mediepraksis', ['met_sub_mediearkeologisk_analyse', 'met_sub_stedsanalyse'], ['plassering', 'lagdeling', 'datering', 'avsenderkontekst'], 'Ikke publiser kontaktinformasjon eller private adresser fra materialet.'),
      t('em_sub_samlerobjekter', 'Samlerobjekter', 'Analyserer innsamling, bytte og kuratering som praksiser for kunnskap, status, proveniens og minne.', 'Hvilke regler avgjør verdi og legitimitet i samlingen?', 'Knapphet, proveniens og ekspertise omformer ting til sosial kapital.', 'markedspris vs miljøintern verdi', ['met_sub_materialitetsanalyse', 'met_sub_distinksjonsanalyse'], ['proveniens', 'byttepraksis', 'kataloger', 'deltakerkilder'], 'Eierskap og proveniens må kontrolleres før publisering.'),
      t('em_sub_uavhengige_medier', 'Uavhengige medier', 'Undersøker redaksjoner og kanaler som bygger egne publiseringsformer, målgrupper og normer utenfor dominerende medier.', 'Hvilken redaksjonell og økonomisk struktur gjør mediet uavhengig, og fra hva?', 'Egen finansiering og distribusjon kan åpne offentlighet, men skaper nye avhengigheter.', 'uavhengig profil vs dokumentert strukturell autonomi', ['met_sub_organiseringsanalyse', 'met_sub_mediearkeologisk_analyse'], ['eierskap', 'finansiering', 'redaksjonell praksis', 'arkiv'], 'Aktørens egen uavhengighetspåstand må kontrolleres.')
    ]
  },
  {
    id: 'sosiale_randsoner_omsorg_skadereduksjon',
    title: 'Sosiale randsoner, omsorg og skadereduksjon',
    definition: 'Analyserer gatefellesskap, utsatthet, hjelp, rettigheter og skadereduksjon uten å gjøre sårbare mennesker til kulisser eller subkulturelle stereotyper.',
    focus: ['gatefellesskap', 'skadereduksjon', 'omsorg', 'stigma', 'rettigheter'],
    topics: [
      t('em_sub_klasse_urban_stil', 'Klasse og urban stil', 'Undersøker hvordan økonomi, bosted, rasialisering og tilgang former hvem som kan delta og hvordan urban stil leses.', 'Hvilke ressurser og kategorier påvirker deltakelse og anerkjennelse?', 'Ulik tilgang og sosial lesning kobler stil til makt og livssjanser.', 'stilvalg vs strukturell posisjon', ['met_sub_distinksjonsanalyse', 'met_sub_diskursanalyse'], ['levekår', 'deltakerstemmer', 'medierepresentasjon'], 'Unngå å slutte sosial bakgrunn fra utseende.'),
      t('em_sub_marginalisering_synlighet', 'Marginalisering og synlighet', 'Analyserer hvordan grupper blir skjøvet ut av institusjoner samtidig som de blir svært synlige som problem i offentligheten.', 'Hvem blir usynlig som borger, men synlig som kategori eller ordensproblem?', 'Selektiv representasjon kan kombinere tjenesteutelukkelse med intensiv kontroll.', 'sosial usynlighet vs offentlig eksponering', ['met_sub_diskursanalyse', 'met_sub_kontrollanalyse'], ['tjenestedata', 'mediedekning', 'brukerstemmer'], 'Språk og bildebruk skal motvirke stigma og uønsket identifisering.'),
      t('em_sub_skeive_miljoer', 'Skeive miljøer', 'Undersøker hvordan skeive miljøer bygger møteplasser, koder og vern i møte med diskriminering og ulik intern tilgang.', 'Hvordan skapes trygghet, og hvilke nye grenser oppstår samtidig?', 'Egne rom kan redusere minoritetsstress og muliggjøre fellesskap, men er ikke homogene.', 'vernende avgrensning vs intern eksklusjon', ['met_sub_trygghets_og_eksklusjonsanalyse', 'met_sub_fellesskapsanalyse'], ['miljønære kilder', 'diskrimineringsdata', 'stedshistorie'], 'Seksualitet og kjønnsidentitet er sensitive data og skal ikke tilskrives individer.'),
      t('em_sub_apne_rusmiljoer_gatefellesskap', 'Åpne rusmiljøer og gatefellesskap', 'Analyserer stedbundne relasjoner, overlevelsespraksiser og offentlig kontroll i åpne rusmiljøer uten å redusere mennesker til rusbruk.', 'Hvilke relasjoner, tjenester og romlige mønstre holder gatefellesskapet sammen?', 'Gjensidig hjelp, tilgang til marked og tjenester samt kontrollpress former stedets sosiale orden.', 'åpent rusmarked vs sosialt gatefellesskap', ['met_sub_omsorgslandskapsanalyse', 'met_sub_stedsanalyse'], ['aggregerte feltstudier', 'brukerorganisasjoner', 'tjeneste- og myndighetskilder'], 'Ingen kartlegging av enkeltpersoner, daglige ruter eller sårbare identiteter.'),
      t('em_sub_skadereduksjon_lavterskeltiltak', 'Skadereduksjon og lavterskeltiltak', 'Undersøker tiltak som reduserer skade og barrierer uten å kreve rusfrihet eller full problemoppløsning før hjelp.', 'Hvilken konkret skade, terskel og brukergruppe er tiltaket utformet for?', 'Lav terskel og praktisk støtte kan redusere risiko og koble mennesker til rettigheter og helsehjelp.', 'skadereduksjon vs behandling eller kontroll', ['met_sub_skadereduksjonsanalyse', 'met_sub_institusjonsanalyse'], ['tiltaksbeskrivelse', 'brukererfaring', 'utfallsdata', 'retningslinjer'], 'Helse- og rusopplysninger behandles aggregert og uten identifiserende detaljer.'),
      t('em_sub_hjemloshet_ustabile_boforhold', 'Hjemløshet og ustabile boforhold', 'Analyserer hvordan manglende eller utrygg bolig påvirker bruk av offentlige rom, nettverk, helse og tilgang til tjenester.', 'Hvilke institusjonelle og økonomiske mekanismer skaper eller opprettholder boligustabiliteten?', 'Boligmangel og vilkår i tjenester flytter private behov til offentlige rom.', 'synlig gateopphold vs årsaker til bostedsløshet', ['met_sub_omsorgslandskapsanalyse', 'met_sub_institusjonsanalyse'], ['boligdata', 'tjenesteløp', 'brukerstemmer', 'regelverk'], 'Bostedsløse personer skal aldri brukes som identifiserbare illustrasjoner uten tydelig samtykke.'),
      t('em_sub_gjensidig_hjelp_omsorg', 'Gjensidig hjelp og omsorg', 'Undersøker uformell deling av informasjon, mat, vern, penger og praktisk hjelp i utsatte miljøer.', 'Hvordan organiseres omsorg, og hvilke belastninger eller grenser følger med?', 'Gjensidighet kan kompensere for tjenestehull, men bygger på ulik kapasitet og risiko.', 'solidaritet vs forventet eller tvunget gjengjeldelse', ['met_sub_omsorgslandskapsanalyse', 'met_sub_fellesskapsanalyse'], ['miljønære kilder', 'hjelpepraksiser', 'tjenestekontekst'], 'Omsorgsrelasjoner er private og beskrives på gruppenivå.'),
      t('em_sub_stigma_representasjon', 'Stigma og representasjon', 'Analyserer hvordan språk, bilder og fortellinger binder negative egenskaper til grupper og steder, og hvordan berørte aktører svarer.', 'Hvilke representasjonsgrep gjør en kompleks gruppe til én problemidentitet?', 'Gjentatte framstillinger kan legitimere avstand, kontroll og lavere forventninger.', 'dokumentasjon av skade vs stemplende generalisering', ['met_sub_diskursanalyse', 'met_sub_etisk_kildeanalyse'], ['mediemateriale', 'selvrepresentasjon', 'policytekst', 'mottakelse'], 'Gjengi minst mulig stemplende detalj og prioriter berørtes egne korrigeringer.'),
      t('em_sub_personvern_forskningsetikk', 'Personvern og forskningsetikk', 'Undersøker hvordan samtykke, forventet offentlighet, dataminimering og skade vurderes ved dokumentasjon av sårbare eller kriminaliserte miljøer.', 'Kan opplysningen brukes uten å øke risiko, selv om den teknisk er offentlig?', 'Sammenstilling og varig lagring kan skape ny eksponering utover den opprinnelige konteksten.', 'offentlig tilgjengelighet vs etisk publiserbarhet', ['met_sub_etisk_kildeanalyse'], ['samtykkekontekst', 'risikovurdering', 'databehov', 'verneregler'], 'Dataminimering og minst mulig identifisering er standard.'),
      t('em_sub_tjenestemoter_rettigheter', 'Tjenestemøter og rettigheter', 'Analyserer møtet mellom utsatte miljøer og helse-, sosial-, bolig- og ordensinstitusjoner gjennom adgang, skjønn og rettigheter.', 'Hvilken regel, ressurs eller praksis avgjør hva personen faktisk får?', 'Institusjonelt skjønn og dokumentasjonskrav kan åpne eller blokkere tjenester.', 'formell rettighet vs faktisk tilgang', ['met_sub_institusjonsanalyse', 'met_sub_skadereduksjonsanalyse'], ['regelverk', 'tjenesteforløp', 'brukererfaring', 'tilsyn'], 'Enkeltsaker anonymiseres, og systemanalyse skilles fra medisinsk eller juridisk rådgivning.')
    ]
  },
  {
    id: 'kommersialisering_institusjonalisering_minne',
    title: 'Kommersialisering, institusjonalisering og minne',
    definition: 'Undersøker hvordan miljøer endres når markeder, offentlige institusjoner, arkiver og kulturarv overtar, stabiliserer eller omfortolker dem.',
    focus: ['kommersialisering', 'institusjonalisering', 'minne', 'kulturarv', 'tap'],
    topics: [
      t('em_sub_autentisitet_tap', 'Autentisitet og tap', 'Analyserer fortellinger om at et miljø har mistet noe ekte, og tester hva som faktisk er endret i praksis, adgang og makt.', 'Hvilket konkret før-og-etter-grunnlag bærer påstanden om tap?', 'Endret skala, eierskap eller publikum kan forskyve kriterier for troverdighet.', 'nostalgisk dom vs dokumentert endring', ['met_sub_stedsminneanalyse', 'met_sub_kommersialiseringsanalyse'], ['tidsserier', 'deltakerdebatt', 'organisasjonsendring'], 'Tidligere perioder skal ikke romantiseres som konfliktfrie.'),
      t('em_sub_dokumentasjon_arkiv', 'Dokumentasjon og arkiv', 'Undersøker hvem som samler, ordner og bevarer spor etter miljøer, og hvilke liv som faller utenfor arkivet.', 'Hvilke utvalg og beskrivelser former det som kan huskes?', 'Arkivpraksis gir varighet og autoritet til noen stemmer framfor andre.', 'bevart materiale vs representativ fortid', ['met_sub_mediearkeologisk_analyse', 'met_sub_etisk_kildeanalyse'], ['arkivkatalog', 'innsamlingspraksis', 'fravær og proveniens'], 'Private og sensitive arkivspor krever kontekstuell tilgangskontroll.'),
      t('em_sub_historiemakt', 'Historiemakt', 'Analyserer makten til å definere opprinnelse, vendepunkter, helter og tap i fortellinger om et miljø.', 'Hvem får autoritet som historieforteller, og hvilke alternativer forsvinner?', 'Kontroll over kilder og offentlig minne former legitimitet i nåtiden.', 'kollektivt minne vs dokumentert historisk mangfold', ['met_sub_stedsminneanalyse', 'met_sub_diskursanalyse'], ['konkurrerende fortellinger', 'arkivgrunnlag', 'minnesteder'], 'Unngå å erstatte kollektiv historie med noen få profilerte personer.'),
      t('em_sub_historisering_revival', 'Historisering og revival', 'Undersøker hvordan tidligere uttrykk og scener gjenoppføres, kurateres og gis ny betydning i senere perioder.', 'Hva videreføres, hva rekonstrueres, og hva er nytt i revivalen?', 'Selektiv gjenbruk av fortiden skaper samtidige identiteter og markeder.', 'kontinuitet vs retrospektiv rekonstruksjon', ['met_sub_stedsminneanalyse', 'met_sub_materialitetsanalyse'], ['før-og-etter-kilder', 'gjenbrukte objekter', 'deltakerfortellinger'], 'Revivalaktører kan ikke alene definere den historiske originalen.'),
      t('em_sub_institusjonalisering', 'Institusjonalisering', 'Analyserer hvordan uformelle praksiser får faste roller, regler, finansiering og organisatorisk varighet.', 'Hvilke praksiser standardiseres, og hvilke mister plass når organisasjonen formaliseres?', 'Stabil finansiering og ansvar kan øke kapasitet samtidig som spontanitet og adgang endres.', 'stabilisering vs byråkratisering', ['met_sub_institusjonsanalyse', 'met_sub_organiseringsanalyse'], ['vedtekter', 'finansiering', 'rolleendring', 'deltakerrespons'], 'Institusjonalisering er ikke automatisk tap eller forbedring.'),
      t('em_sub_kommersialisering', 'Kommersialisering', 'Undersøker hvordan varer, billetter, sponsorater og markedslogikk endrer produksjon, adgang og verdi.', 'Hvilken markedsmekanisme endrer hvem som kan delta eller kontrollere uttrykket?', 'Prising, eierskap og skala kan omfordele ressurser og definisjonsmakt.', 'inntekt som nødvendighet vs markedsstyrt omforming', ['met_sub_kommersialiseringsanalyse'], ['prisdata', 'eierskap', 'sponsoravtaler', 'deltakerdebatt'], 'Kommersiell aktivitet betyr ikke i seg selv at miljøet er uekte.'),
      t('em_sub_kulturarv_undergrunn', 'Kulturarv og undergrunn', 'Analyserer hvordan museer, vern og offentlig historie gjør undergrunnspraksiser bevaringsverdige og styrbare.', 'Hva må endres når en levende eller konfliktfylt praksis blir kulturarv?', 'Utvelgelse og konservering kan gi anerkjennelse, men fryse eller avpolitisere praksis.', 'levende bruk vs bevart representasjon', ['met_sub_kulturarvsanalyse', 'met_sub_institusjonsanalyse'], ['vernevedtak', 'utstillinger', 'miljøstemmer', 'bruksendring'], 'Berørte miljøer må ikke reduseres til råmateriale for institusjonen.'),
      t('em_sub_merkevare_stil', 'Merkevare og stil', 'Undersøker hvordan subkulturelle tegn blir salgbare identiteter for varer, steder og virksomheter.', 'Hvem eier, tjener på og kontrollerer den kommersielle oversettelsen av stilen?', 'Merkevarebygging standardiserer gjenkjennelige tegn og kan løsne dem fra miljøets praksis.', 'stilreferanse vs sosial miljøtilknytning', ['met_sub_kommersialiseringsanalyse', 'met_sub_semiotisk_analyse'], ['kampanjer', 'eierskap', 'designhistorie', 'miljørespons'], 'Ikke la kommersiell «alternativ» profil kvalifisere som subkultur alene.'),
      t('em_sub_nostalgi_revival', 'Nostalgi og revival', 'Analyserer følelsesmessig orientering mot en idealisert fortid og hvordan den mobiliseres i nye samlinger og produkter.', 'Hvilke deler av fortiden fremheves, og hvilke konflikter utelates?', 'Nostalgi skaper sammenheng og motivasjon gjennom selektivt minne.', 'erindring vs historisk rekonstruksjon', ['met_sub_stedsminneanalyse', 'met_sub_diskursanalyse'], ['minnefortellinger', 'samtidsbruk', 'historiske kilder'], 'Nostalgi skal analyseres, ikke brukes som historisk bevis.'),
      t('em_sub_tapte_steder', 'Tapte steder', 'Undersøker stengte, revne eller utilgjengelige steder gjennom dokumentert bruk, relasjoner, tap og videreføring.', 'Hva gikk faktisk tapt, og hvilke funksjoner ble flyttet eller gjenoppbygd?', 'Stedstap kan bryte nettverk og rutiner, men også produsere mobilisering og minne.', 'fysisk tap vs sosial kontinuitet', ['met_sub_stedsminneanalyse', 'met_sub_gentrifiseringsanalyse'], ['kart og tidslinje', 'brukerhistorier', 'flytte- og erstatningsspor'], 'Eksisterende beboere og nye brukere skal ikke usynliggjøres av nostalgien.')
    ]
  }
];

const m = (id, title, description, evidenceInputs, distinction, limitation) => ({ id, title, description, evidenceInputs, distinction, limitation });
const METHODS = [
  m('met_sub_begrepsavgrensning', 'Begrepsavgrensning', 'Sammenligner rivaliserende feltbegreper mot eksplisitte kjennetegn og negative avgrensninger i et dokumentert case.', ['fagdefinisjoner', 'casebeskrivelse', 'kontraeksempler'], 'subkultur, scene, motkultur og livsstil', 'Kan avgrense begrepsbruk, men beviser ikke at et case eksisterer.'),
  m('met_sub_sceneanalyse', 'Sceneanalyse', 'Kartlegger forbindelser mellom aktører, steder, hendelser og medier som over tid danner en gjenkjennelig scene.', ['aktørlister', 'programarkiv', 'stedstidslinjer'], 'arrangement vs varig scene', 'Synlige arrangementer kan overvurdere de mest profilerte aktørene.'),
  m('met_sub_fellesskapsanalyse', 'Fellesskapsanalyse', 'Undersøker gjensidig anerkjennelse, forpliktelser, grenser og tilhørighet i en avgrenset sosial verden.', ['deltakerstemmer', 'felles praksiser', 'grensesituasjoner'], 'selvidentifikasjon vs gjensidig medlemskap', 'Enkelte informanter kan ikke representere hele fellesskapet.'),
  m('met_sub_organiseringsanalyse', 'Organiseringsanalyse', 'Kartlegger beslutninger, roller, arbeidsdeling, ressurser og faktisk styring i formelle og uformelle organisasjoner.', ['vedtekter', 'møter', 'arbeidsdeling', 'ressursflyt'], 'formell struktur vs faktisk praksis', 'Uformelle maktforhold kan mangle skriftlige spor.'),
  m('met_sub_deltakelsesanalyse', 'Deltakelsesanalyse', 'Følger hvordan personer får adgang, lærer, bidrar og beveger seg mellom perifere og sentrale roller.', ['deltakerforløp', 'adgangspraksis', 'læringssituasjoner'], 'tilstedeværelse vs deltakelse', 'Metoden må ikke kartlegge private personer unødig.'),
  m('met_sub_grensearbeidsanalyse', 'Grensearbeidsanalyse', 'Analyserer situasjoner der aktører definerer, håndhever eller bestrider hvem og hva som hører til.', ['grensedebatter', 'adgangsregler', 'autentisitetsdommer'], 'beskrivelse av grense vs analytikerens norm', 'Synlige grensekonflikter kan skjule stille tilpasning.'),
  m('met_sub_ritualanalyse', 'Ritualanalyse', 'Bryter gjentatte handlinger ned i sekvens, deltakere, symboler, overgang og sosial virkning.', ['sekvensobservasjon', 'deltakertolkning', 'gjentakelser'], 'rutine vs sosialt ladet ritual', 'Ritualtolkning krever kontekst og kan ikke leses fra form alene.'),
  m('met_sub_konfliktanalyse', 'Konfliktanalyse', 'Skiller parter, interesser, ressurser, hendelsesforløp og mulige utfall i interne eller eksterne konflikter.', ['tidslinje', 'flere partsstemmer', 'beslutningsspor'], 'sakskonflikt vs personliggjøring', 'Uverifiserte anklager må ikke gjentas som fakta.'),
  m('met_sub_trygghets_og_eksklusjonsanalyse', 'Trygghets- og eksklusjonsanalyse', 'Vurderer hvem et trygghetstiltak beskytter, hvilke terskler det skaper og hvordan risiko omfordeles.', ['husregler', 'hendelsesdata', 'ulike brukerperspektiver'], 'trygghet for noen vs lik adgang', 'Hendelsesdata kan være skjeve og sensitive.'),
  m('met_sub_nettverksanalyse', 'Nettverksanalyse', 'Kartlegger relasjoner og knutepunkter uten å forveksle kontakt, innflytelse og medlemskap.', ['relasjonsdata', 'samarbeid', 'sirkulasjon'], 'kontakt vs sosialt bånd', 'Ufullstendige nettverk gir lett overdrevne sentralitetsfunn.'),
  m('met_sub_stilanalyse', 'Stilanalyse', 'Analyserer kombinasjoner av klær, lyd, bevegelse og uttrykk som situerte sosiale repertoarer.', ['visuelt og auditivt materiale', 'brukskontekst', 'mottakerlesninger'], 'enkelttegn vs stilistisk helhet', 'Stil kan ikke brukes til å fastslå en persons identitet.'),
  m('met_sub_semiotisk_analyse', 'Semiotisk analyse', 'Undersøker hvordan tegn får mening gjennom kode, kontrast, kontekst og fortolkende fellesskap.', ['tegnmateriale', 'brukskontekst', 'aktørtolkninger'], 'tegnform vs sosial betydning', 'Samme tegn kan ha motstridende betydninger.'),
  m('met_sub_symbolanalyse', 'Symbolanalyse', 'Følger ett symbols produksjon, bruk, variasjon og mottakelse for å skille dokumentert sosial betydning fra løs assosiasjon.', ['symbolforekomster over tid', 'brukskontekst', 'deltaker- og mottakerkilder'], 'symbolform vs historisk og situert betydning', 'Et symbol har ikke én stabil betydning på tvers av miljøer og perioder.'),
  m('met_sub_sprakanalyse', 'Språkanalyse', 'Analyserer sjargong, slang, fortelling og kodebruk i konkrete kommunikasjonssituasjoner.', ['tekst eller tale med kontekst', 'deltakerforklaring', 'situasjon'], 'ordbokbetydning vs situert bruk', 'Lukkede eller sikkerhetsrelevante koder skal ikke eksponeres.'),
  m('met_sub_kropps_og_stilanalyse', 'Kropps- og stilanalyse', 'Undersøker kroppslig fremføring, modifikasjon og påkledning som sosial praksis uten å slutte identitet fra utseende.', ['samtykket observasjon', 'deltakerforklaring', 'situasjon'], 'selvpresentasjon vs andres lesning', 'Kropps- og identitetsdata er sensitive.'),
  m('met_sub_distinksjonsanalyse', 'Distinksjonsanalyse', 'Kartlegger hvordan smak, kunnskap og tilgang omformes til status og sosial avstand.', ['smaksdommer', 'tilgangsdata', 'statusmarkører'], 'preferanse vs sosial distinksjon', 'Analysen kan overvurdere klasse dersom andre ressurser ikke testes.'),
  m('met_sub_affektanalyse', 'Affektanalyse', 'Beskriver hvordan sanselige og romlige forhold former kroppslig intensitet, stemning og deltakelse.', ['lyd, lys og rom', 'deltakerbeskrivelser', 'tidsforløp'], 'opplevd stemning vs dokumentert virkning', 'En observatørs reaksjon kan ikke generaliseres.'),
  m('met_sub_materialitetsanalyse', 'Materialitetsanalyse', 'Følger objekters produksjon, bruk, slitasje, sirkulasjon og verdi i et sosialt miljø.', ['objektbiografi', 'proveniens', 'bruksspor'], 'produkt vs sosialt objekt', 'Manglende proveniens begrenser historiske slutninger.'),
  m('met_sub_remixanalyse', 'Remixanalyse', 'Sammenligner kildeuttrykk og ny bruk for å identifisere sitat, endring, makt og ny betydning.', ['kildemateriale', 'varianter', 'produksjonskontekst'], 'kopi vs transformasjon', 'Likhet alene viser ikke intensjon eller påvirkning.'),
  m('met_sub_stedsanalyse', 'Stedsanalyse', 'Kobler fysisk utforming, bruk over tid, aktører, minner og regulering i ett avgrenset sted.', ['kart', 'observasjon', 'stedstidslinje', 'aktørkilder'], 'lokasjon vs sosialt sted', 'Nåværende observasjon kan ikke alene rekonstruere fortiden.'),
  m('met_sub_romlig_praksisanalyse', 'Romlig praksisanalyse', 'Følger bevegelse, rytme og gjentatt bruk for å vise hvordan rom produseres gjennom handling.', ['bruksmønstre', 'tidsrytmer', 'ruter på aggregert nivå'], 'designet funksjon vs faktisk bruk', 'Rutekartlegging kan true personvern i sårbare miljøer.'),
  m('met_sub_romlig_maktanalyse', 'Romlig maktanalyse', 'Sammenligner sosial bruk med juridisk, økonomisk og institusjonell kontroll over adgang og varighet.', ['eierskap', 'regulering', 'adgang', 'brukerkrav'], 'sosial legitimitet vs formell råderett', 'Makt kan ikke utledes fra eierskap alene.'),
  m('met_sub_graffitianalyse', 'Graffitianalyse', 'Analyserer lag, navn, flater, sirkulasjon og kontroll i writer- og gatekunstpraksiser.', ['flater over tid', 'writerkilder', 'regulering', 'arkiv'], 'praksis og miljø vs bildeestetikk', 'Aktive utøvere og lovbrudd skal ikke identifiseres.'),
  m('met_sub_klubbanalyse', 'Klubbanalyse', 'Undersøker nattlige scener gjennom program, dør, økonomi, sikkerhet, rus og tidslig bruk av rom.', ['program', 'adgangsregler', 'økonomi', 'deltakerstemmer'], 'enkeltarrangement vs klubbscene', 'Skjulte og uformelle arenaer krever varsomhet.'),
  m('met_sub_gentrifiseringsanalyse', 'Gentrifiseringsanalyse', 'Tester om investering, pris, eierskap og planendring kan kobles til konkret fortrengning eller bruksendring.', ['pris- og eierskapsdata', 'flyttehistorikk', 'planvedtak'], 'områdeendring vs dokumentert fortrengning', 'Samtidighet beviser ikke årsak.'),
  m('met_sub_motstandsanalyse', 'Motstandsanalyse', 'Identifiserer mål, repertoar, organisering, motpart og dokumenterte virkninger i kollektiv motstand.', ['aksjonsspor', 'program', 'organisering', 'motpartsrespons'], 'uttrykt misnøye vs organisert motstand', 'Motstand skal ikke romantiseres eller reduseres til stil.'),
  m('met_sub_avviksanalyse', 'Avviksanalyse', 'Undersøker hvem som definerer normalitet, hvordan etiketter anvendes og hvilke følger de får.', ['regler', 'reaksjoner', 'selvdefinisjon', 'historisk kontekst'], 'handling vs sosial avviksetikett', 'Analysen må ikke reprodusere stigma.'),
  m('met_sub_moralpanikkanalyse', 'Moralpanikkanalyse', 'Tester eskalering fra hendelse til generalisert trussel gjennom aktører, medierepetisjon og policyrespons.', ['medietidslinje', 'skadedata', 'reaksjoner'], 'reell skade vs overgeneralisert trussel', 'Begrepet må ikke avvise dokumentert skade.'),
  m('met_sub_kontrollanalyse', 'Kontrollanalyse', 'Kartlegger overvåkning, adgang, sanksjon og selvregulering samt hvem tiltakene faktisk rammer.', ['kontrollregler', 'hendelser', 'målgruppe', 'virkning'], 'mandat vs faktisk praksis', 'Kontrolldata kan være selektive og sensitive.'),
  m('met_sub_kriminaliseringsanalyse', 'Kriminaliseringsanalyse', 'Følger lov, håndheving og sanksjon over tid for å forklare hvordan praksiser gjøres straffbare i praksis.', ['lovendring', 'håndhevingsdata', 'aktørrespons'], 'ulovlighet vs kriminaliseringsprosess', 'Metoden skal ikke identifisere mulige lovbrytere.'),
  m('met_sub_reguleringsanalyse', 'Reguleringsanalyse', 'Kobler konkrete regler og vedtak til implementering, ressurser og observerbare konsekvenser.', ['regeltekst', 'vedtak', 'implementering', 'utfall'], 'regel på papiret vs faktisk gjennomføring', 'Regeltekst alene viser ikke virkning.'),
  m('met_sub_rett_til_byen_analyse', 'Rett-til-byen-analyse', 'Vurderer hvem som får bruke, delta i og forme byen gjennom institusjoner, eierskap og kollektiv praksis.', ['medvirkning', 'plan', 'brukerkrav', 'utfall'], 'adgang vs makt til å forme', 'Normative krav må skilles fra rettslige rettigheter.'),
  m('met_sub_diskursanalyse', 'Diskursanalyse', 'Analyserer kategorier, problemframstillinger, tausheter og autoritet i tekst og tale.', ['medietekst', 'policytekst', 'selvrepresentasjon'], 'språklig framstilling vs materiell virkning', 'Tekstanalyse alene viser ikke hvordan mottakere handler.'),
  m('met_sub_mediearkeologisk_analyse', 'Mediearkeologisk analyse', 'Undersøker format, teknologi, distribusjon, proveniens og brukshistorie i eldre og nyere medier.', ['originalmateriale', 'formatdata', 'distribusjon', 'proveniens'], 'medieinnhold vs mediets materielle vilkår', 'Bevart materiale er et selektivt utvalg.'),
  m('met_sub_diy_analyse', 'DIY-analyse', 'Kartlegger hva som produseres selv, hvilke ressurser og ferdigheter som kreves, og hvilke avhengigheter som består.', ['produksjonskjede', 'kostnader', 'arbeidsdeling', 'distribusjon'], 'egenproduksjon vs strukturell autonomi', 'Uformelt arbeid og ulik belastning kan skjules.'),
  m('met_sub_digital_fellesskapsanalyse', 'Digital fellesskapsanalyse', 'Undersøker varighet, moderering, roller, normer og relasjoner i plattformbaserte miljøer.', ['trådforløp', 'moderering', 'nettverk', 'deltakerkilder'], 'følgergruppe vs sosialt miljø', 'Forventet offentlighet må vurderes separat fra teknisk tilgang.'),
  m('met_sub_omsorgslandskapsanalyse', 'Omsorgslandskapsanalyse', 'Kartlegger hvordan mennesker beveger seg mellom uformell hjelp, steder og tjenester uten å individualisere sårbare ruter.', ['aggregerte brukerforløp', 'tjenestekart', 'miljønære kilder'], 'omsorgsnettverk vs enkelttiltak', 'Geografisk detalj kan øke risiko og skal minimeres.'),
  m('met_sub_skadereduksjonsanalyse', 'Skadereduksjonsanalyse', 'Vurderer målskade, terskel, målgruppe, implementering og dokumenterte utfall i lavterskeltiltak.', ['tiltaksregel', 'brukererfaring', 'utfallsdata', 'retningslinjer'], 'skadereduksjon vs behandling og kontroll', 'Helse- og rusdata krever aggregasjon og metodekritikk.'),
  m('met_sub_etisk_kildeanalyse', 'Etisk kildeanalyse', 'Vurderer samtykke, forventet offentlighet, sammenstillingsrisiko, dataminimering og mulig skade før bruk.', ['kildekontekst', 'samtykke', 'formål', 'risikovurdering'], 'offentlig tilgjengelighet vs etisk publiserbarhet', 'Metoden gir ikke automatisk tillatelse; ved tvil skal data utelates.'),
  m('met_sub_kommersialiseringsanalyse', 'Kommersialiseringsanalyse', 'Følger pris, eierskap, sponsorat, skala og kontroll for å forklare markedsdrevet endring.', ['prisdata', 'eierskap', 'avtaler', 'adgangsendring'], 'inntekt vs markedsstyrt omforming', 'Kommersiell aktivitet beviser ikke autentisitetstap.'),
  m('met_sub_kulturarvsanalyse', 'Kulturarvsanalyse', 'Undersøker utvelgelse, autorisering, bevaring og omfortolkning når praksis gjøres til kulturarv.', ['vernevedtak', 'utstillinger', 'innsamling', 'miljørespons'], 'levende praksis vs bevart representasjon', 'Institusjonskilder kan overrepresentere eget perspektiv.'),
  m('met_sub_institusjonsanalyse', 'Institusjonsanalyse', 'Kartlegger mandat, regler, ressurser, skjønn, implementering og faktisk utfall i møte med miljøer.', ['mandat', 'regel', 'ressurs', 'gjennomføring', 'utfall'], 'formell ordning vs faktisk tilgang', 'Institusjonens egen rapportering må kontrolleres.'),
  m('met_sub_stedsminneanalyse', 'Stedsminneanalyse', 'Sammenligner minner, arkiv, fysisk spor og senere bruk for å analysere hvordan steder huskes.', ['minnefortellinger', 'arkiv', 'kart', 'fysisk spor'], 'erindring vs historisk rekonstruksjon', 'Nostalgi og profilerte stemmer kan dominere materialet.')
];

function topicHook(topic) {
  return {
    id: topic.id.replace(/^em_sub_/u, ''),
    title: topic.title,
    definition: topic.definition,
    analytical_question: topic.question,
    mechanism: topic.mechanism,
    critical_distinction: topic.distinction,
    emne_ids: [topic.id],
    recommended_method_ids: topic.methodIds,
    evidence_inputs: topic.evidence,
    limitation: topic.limitation,
    ethics_note: topic.ethics,
    canonical_status: 'canonical',
    canonical_file_role: 'active',
    theory_status: 'pending_evidence',
    source_anchor_required: true,
    documented_subcultural_context_required: true,
    do_not_generate_from_hook_label_only: true,
    ...(THEORY_CANON_BY_TOPIC[topic.id] ? { canon: THEORY_CANON_BY_TOPIC[topic.id] } : {})
  };
}

function emne(domain, topic) {
  const concepts = [...new Set([topic.title.toLowerCase(), topic.distinction, ...domain.focus])];
  return {
    emne_id: topic.id,
    subject_id: 'subkultur',
    domain: domain.id,
    area_id: domain.id,
    area_label: domain.title,
    level: 2,
    title: topic.title,
    short_label: topic.title,
    status: 'active',
    definition: topic.definition,
    why_it_matters: topic.mechanism,
    analytical_question: topic.question,
    mechanism: topic.mechanism,
    critical_distinction: topic.distinction,
    evidence_inputs: topic.evidence,
    limitation: topic.limitation,
    ethics_note: topic.ethics,
    keywords: concepts,
    dimensions: domain.focus,
    key_concepts: concepts,
    core_concepts: concepts,
    key_questions: [
      topic.question,
      `Hvilket kildegrunnlag kan dokumentere ${topic.title.toLowerCase()} uten å bruke canonicalfilen som faktakilde?`,
      `Hvilken feilslutning oppstår dersom man overser skillet «${topic.distinction}»?`
    ],
    blindspots: [topic.limitation, topic.ethics],
    methods: topic.methodIds,
    method_ids: topic.methodIds,
    recommended_methods: topic.methodIds,
    primary_theory_hooks: [topic.id.replace(/^em_sub_/u, '')],
    secondary_theory_hooks: [],
    reserve_theory_hooks: [],
    canonical_status: 'canonical',
    canonical_file_role: 'active',
    registry_version: 'subkulturpensum_v5_0_universal',
    mapping_count: 1,
    mapping_pressure: 'one_to_one',
    requires_subculture_anchor: true,
    requires_external_claim_basis: true,
    requires_documented_subcultural_context: true,
    case_gate_required: true,
    method_gate_required: true,
    theory_status: 'pending_evidence',
    scope_guard: 'Brukes bare når et dokumentert miljø, en sosial praksis og en påviselig relasjon til regler, institusjoner, markeder eller dominerende normer foreligger.',
    anti_patterns: [
      'Ikke bruk emneetiketten som faktakilde.',
      'Ikke klassifiser aktivitet, ungdom, estetikk, sjanger, arena eller marginalitet som Subkultur uten dokumentert sosialt miljø.'
    ],
    generator_constraints: {
      require_documented_environment: true,
      require_social_practice: true,
      require_main_society_relationship: true,
      require_external_claim_basis: true,
      do_not_generate_from_emne_label_only: true,
      require_emne_prefix: 'em_sub_'
    }
  };
}

function methodRecord(method) {
  const topics = DOMAINS.flatMap((domain) => domain.topics.map((topic) => ({ domain, topic })))
    .filter(({ topic }) => topic.methodIds.includes(method.id));
  const domains = [...new Set(topics.map(({ domain }) => domain.id))];
  return {
    method_id: method.id,
    title: method.title,
    short_label: method.title,
    status: 'active',
    operation: method.description,
    required_data: method.evidenceInputs,
    domain_ids: domains,
    description: method.description,
    definition: method.description,
    analytical_question: `Hva kan ${method.title.toLowerCase()} vise i dette dokumenterte caset, og hvilke alternative forklaringer består?`,
    data_forms: method.evidenceInputs,
    evidence_inputs: method.evidenceInputs,
    critical_distinctions: [method.distinction],
    coverage_domains: domains,
    emne_affinities: topics.map(({ topic }) => topic.id),
    procedure: [
      `Avgrens caset og formuler et spørsmål som faktisk krever ${method.title.toLowerCase()}.`,
      `Samle ${method.evidenceInputs.join(', ')} og dokumenter proveniens, tidsrom og skjevheter.`,
      `Gjennomfør analysen med eksplisitt skille mellom ${method.distinction}.`,
      'Test minst én alternativ forklaring, og rapporter usikkerhet og slutninger datagrunnlaget ikke kan bære.'
    ],
    limitations: [method.limitation, 'Canonicalfilen kan styre metodevalg, men kan ikke brukes som empirisk bevis.'],
    canonical_status: 'canonical',
    canonical_file_role: 'active',
    registry_version: 'subkulturpensum_v5_0_universal',
    external_claim_basis_required: true,
    ethics_review_required: domains.includes('sosiale_randsoner_omsorg_skadereduksjon'),
    generator_constraints: {
      require_documented_environment: true,
      require_external_claim_basis: true,
      do_not_generate_from_method_label_only: true,
      require_emne_prefix: 'em_sub_'
    }
  };
}

export function buildCanonicalLayer() {
  const topics = DOMAINS.flatMap((domain) => domain.topics.map((topic) => ({ domain, topic })));
  const emner = topics.map(({ domain, topic }) => emne(domain, topic));
  const methods = METHODS.map(methodRecord);
  const categories = DOMAINS.map((domain, index) => ({
    id: domain.id,
    title: domain.title,
    order: index + 1,
    tagline: domain.definition,
    definition: domain.definition,
    focus: domain.focus,
    topic_hooks: domain.topics.map(topicHook),
    question_role: 'Start i dokumentert miljø, praksis, sted, objekt, konflikt, omsorgsrelasjon eller institusjonell prosess før teori.',
    source_priority: ['miljønær kilde', 'uavhengig kontrollkilde', 'forskning eller arkiv med inspectable lokasjon'],
    anti_patterns: ['aktivitet_eller_estetikk_alene', 'canonicalfil_som_faktakilde', 'stempling_eller_romantisering']
  }));
  const mappings = topics.map(({ domain, topic }) => ({
    emne_id: topic.id,
    title: topic.title,
    mappings: [{
      fagkart_kategori: domain.id,
      fagkart_kategori_tittel: domain.title,
      topic_hook: topic.id.replace(/^em_sub_/u, ''),
      topic_hook_tittel: topic.title,
      mapping_tier: 'primary',
      priority_score: 10,
      source_anchor_required: true,
      external_claim_basis_required: true,
      documented_subcultural_context_required: true,
      recommended_method_ids: topic.methodIds,
      analytical_question: topic.question,
      critical_distinction: topic.distinction
    }],
    mapping_status: 'canonical_one_to_one',
    primary_hooks: [topic.id.replace(/^em_sub_/u, '')],
    secondary_hooks: [],
    reserve_hooks: [],
    recommended_method_ids: topic.methodIds,
    canonical_status: 'canonical',
    canonical_file_role: 'active',
    registry_version: 'subkulturpensum_v5_0_universal',
    source_anchor_required: true,
    external_claim_basis_required: true,
    subculture_anchor_required: true,
    theory_status: 'pending_evidence'
  }));
  const fagkart = {
    version: 'v5.0-universal-canonical',
    updated_at: '2026-08-04',
    type: 'fagkart',
    subject_id: 'subkultur',
    subject_title: 'Subkultur',
    scope: 'universal',
    purpose: 'Canonicalt åttedomenekart for analyse av dokumenterte subkulturelle miljøer, praksiser, steder, randsoner og endringsprosesser.',
    canonical_registry_version: 'subkulturpensum_v5_0_universal',
    principles: [
      'Et dokumentert miljø, en sosial praksis og en relasjon til storsamfunnet må foreligge.',
      'Miljønær kilde og uavhengig kontrollkilde skal balanseres.',
      'Canonicalfiler styrer analyse, men er ikke faktakilder.',
      'Personvern, stigma og romantisering vurderes eksplisitt.'
    ],
    meta: { domain_count: 8, topic_hook_count: 80, hooks_per_domain: 10, theory_status: 'pending_evidence' },
    categories
  };
  const methodsDocument = {
    version: 'v5.0-universal-canonical',
    updated_at: '2026-08-04',
    type: 'methods_registry',
    subject_id: 'subkultur',
    subject_title: 'Subkultur',
    scope: 'universal',
    purpose: 'Operative og distinkte analysemetoder for Subkultur-fagverket.',
    principles: ['hver metode utfører en faktisk analyseoperasjon', 'hver metode har datakrav, prosedyre og begrensninger', 'ingen metode leverer faktapåstander uten ekstern evidens'],
    canonical_inputs: ['fagkart_subkultur_canonical_v4_5.json', 'emner_subkultur_canonical_v4_5.json'],
    methods
  };
  const domains = DOMAINS.map((domain, index) => ({
    order: index + 1,
    domain_id: domain.id,
    label: domain.title,
    definition: domain.definition,
    coverage_status: 'canonical_layer_materialized',
    theory_status: 'pending_evidence',
    chapter_status: 'not_started',
    emne_ids: domain.topics.map((topic) => topic.id),
    method_ids: [...new Set(domain.topics.flatMap((topic) => topic.methodIds))],
    hook_ids: domain.topics.map((topic) => topic.id.replace(/^em_sub_/u, ''))
  }));
  const pensum = {
    version: 'v5.0-universal-canonical',
    updated_at: '2026-08-04',
    type: 'subject_curriculum',
    subject_id: 'subkultur',
    subject_title: 'Subkultur',
    scope: 'universal',
    purpose: 'Binder åtte fagområder til 80 individuelt redigerte emner, operative metoder og én-til-én-hooks før teori- og kapittelproduksjon.',
    canonical_registry_version: 'subkulturpensum_v5_0_universal',
    domain_order: DOMAINS.map((domain) => domain.id),
    domains,
    canonical_files: OUT,
    primary_category_rule: 'Subkultur krever dokumentert miljø, sosial praksis og relasjon til regler, institusjoner, markeder eller dominerende normer.',
    source_priority: ['miljønær kilde', 'uavhengig kontrollkilde', 'forskning, arkiv eller offentlig dokumentasjon'],
    generator_policy: { canonical_files_are_guides_not_content: true, external_claim_basis_required: true, ethics_review_for_vulnerable_people_required: true },
    legacy_policy: { legacy_quiz_is_not_completion_evidence: true, foreign_primary_emne_prefixes_forbidden: true },
    emne_migration: { preserved_legacy_ids: LEGACY_EMNE_IDS, retired_ids: {} },
    migration_targets: { theory_objects: 80, chapters: 8, subject_pathways: 8, current_gate: 'theory_evidence_production' },
    summary: { domains: 8, emner: 80, methods: methods.length, mappings: 80, hooks: 80, theory_objects_evidence_ready: 0, chapters: 0, editorial_complete: false },
    next_gate: 'theory_claim_source_evidence'
  };
  const currentQuizRules = JSON.parse(fs.readFileSync(path.join(ROOT, OUT.quizRules), 'utf8'));
  const quizRules = {
    ...currentQuizRules,
    version: 'v5.2-universal-canonical-subkultur',
    scope: 'universal',
    purpose: 'Styrer kildebelagt Subkultur-quiz fra den universelle åttedomenemodellen uten å bruke canonicalfiler som faktakilde.',
    canonical_inputs: {
      ...currentQuizRules.canonical_inputs,
      domain_count: 8,
      emne_count: 80,
      method_count: methods.length,
      mapping_count: 80,
      topic_hook_count: 80
    },
    canonical_layer_status: 'materialized_theory_evidence_pending',
    hard_rules: {
      ...currentQuizRules.hard_rules,
      environment_practice_and_main_society_relationship_required: true,
      environment_near_and_independent_control_sources_required: true,
      privacy_stigma_and_romanticization_review_required: true,
      subkultur_question_must_start_from: DOMAINS.map((domain) => `${domain.title}: ${domain.focus.join(', ')}`)
    },
    soft_preferences: {
      ...currentQuizRules.soft_preferences,
      preferred_question_surfaces: DOMAINS.map((domain) => domain.id)
    },
    set_guidance: Object.fromEntries(DOMAINS.map((domain, index) => [String(index + 1), {
      name: domain.id,
      dominant_driver: domain.definition,
      canonical_role: 'emne-, metode- og progresjonsstyring; aldri faktakilde',
      allowed_methods: [...new Set(domain.topics.flatMap((topic) => topic.methodIds))],
      question_style: domain.focus.join(', '),
      external_claim_basis_required: true,
      environment_near_and_control_source_required: true
    }]))
  };
  const currentTemplate = JSON.parse(fs.readFileSync(path.join(ROOT, OUT.quizTemplate), 'utf8'));
  const quizTemplate = {
    ...currentTemplate,
    version: '3.0-universal-canonical',
    category_definition: 'Subkultur omfatter dokumenterte sosiale miljøer og praksiser på siden av eller i friksjon med storsamfunnet. Aktivitet, ungdom, estetikk, sjanger, arena, marginalitet eller kommersiell alternativ profil kvalifiserer ikke alene.',
    content_priorities: DOMAINS.map((domain) => domain.title),
    essential_concepts: ['miljø', 'sosial praksis', 'feltgrense', 'egenorganisering', 'kode', 'territorium', 'kontroll', 'DIY', 'skadereduksjon', 'institusjonalisering'],
    editorial_test: 'Dokumenterer kildene et faktisk miljø, en sosial praksis og en påviselig relasjon til regler, institusjoner, markeder eller dominerende normer, med både miljønær stemme og uavhengig kontroll?',
    canonical_layer: { domains: 8, emner: 80, methods: methods.length, hooks: 80, theory_status: 'pending_evidence' }
  };
  return { [OUT.fagkart]: fagkart, [OUT.emner]: emner, [OUT.methods]: methodsDocument, [OUT.mapping]: mappings, [OUT.pensum]: pensum, [OUT.quizRules]: quizRules, [OUT.quizTemplate]: quizTemplate };
}

function main() {
  const args = new Set(process.argv.slice(2));
  const built = buildCanonicalLayer();
  let stale = false;
  for (const [relative, value] of Object.entries(built)) {
    const absolute = path.join(ROOT, relative);
    if (args.has('--write')) {
      fs.writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
      continue;
    }
    const current = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (!isDeepStrictEqual(current, value)) {
      console.error(`UTDATERT: ${relative}`);
      stale = true;
    }
  }
  if (stale) process.exitCode = 1;
  else console.log(`Subkultur foundation V1 OK: ${DOMAINS.length} domener, ${DOMAINS.flatMap((domain) => domain.topics).length} emner og ${METHODS.length} metoder.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
