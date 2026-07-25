#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_middelalder_kirke_kongemakt';
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const targetInventoryPath = path.join(reportDir, 'middelalder-kirke-kongemakt-target-inventory.json');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
fs.mkdirSync(reportDir, { recursive: true });

const C = (label, definition, conceptType, related, distinguish, misuse, indicators, sources, broader = []) => ({
  label,
  definition,
  concept_type: conceptType,
  broader_concepts: broader,
  narrower_concepts: [],
  related_concepts: related,
  distinguish_from: distinguish,
  common_misuse: [misuse],
  indicators,
  source_requirements: sources,
  status: 'canonical_v5_5_curated'
});

const conceptSpecs = {
  con_his_aristokrati: C(
    'aristokrati',
    'Aristokrati er en historisk eliteform der slekt, jord, tjeneste, militære ressurser og adgang til kongelige eller kirkelige embeter gir varig, men omstridt, politisk og sosial rang.',
    'medieval_aristocracy_concept',
    ['con_his_kongemakt', 'con_his_jordegods', 'con_his_patronasje'],
    ['con_his_bondehushold'],
    'Å omtale alle stormenn som én arvelig stand uten å undersøke skiftende rang, tjenestebånd, regionale maktbaser og forholdet mellom formell tittel og faktisk ressurskontroll.',
    ['slekts- og allianseforbindelser', 'jord-, embets- eller militærressurser', 'dokumentert adgang til råd, hoff eller kirkelig ledelse'],
    ['diplomer, jordebøker, saga- og krønikemateriale med kildekritikk', 'arkeologiske og prosopografiske kontrollkilder som viser faktisk ressursgrunnlag']
  ),
  con_his_bondehushold: C(
    'bondehushold',
    'Bondehushold er en produksjons-, forbruks- og omsorgsenhet knyttet til gård, jordbruk, husdyr, rettigheter og arbeidsdeling mellom personer med ulik alder, kjønn og status.',
    'medieval_peasant_household_concept',
    ['con_his_dagligliv', 'con_his_demografi', 'con_his_jordegods'],
    ['con_his_aristokrati'],
    'Å behandle bondehusholdet som en stabil kjernefamilie uten å undersøke tjenestefolk, slekt, leilendingsforhold, sesongarbeid og endringer gjennom livsløpet.',
    ['gårds- og bruksrettigheter', 'arbeids- og ressursdeling i husholdet', 'spor etter produksjon, forbruk og omsorg'],
    ['jordebøker, skattelister, rettskilder og arkeologiske gårdsspor', 'skifte-, kostholds- eller bosettingsdata som viser husholdets sammensetning og variasjon']
  ),
  con_his_bydannelse: C(
    'bydannelse',
    'Bydannelse er en gradvis prosess der tett bosetting, handel, håndverk, kirkelige og kongelige institusjoner, rettslig særpreg og varig infrastruktur samles på et sted.',
    'medieval_urbanization_process_concept',
    ['con_his_byskaping', 'con_his_handverk', 'con_his_sted'],
    ['con_his_byskaping'],
    'Å datere en bys tilblivelse til ett grunnleggingsår uten å skille mellom tidlig bosetting, institusjonsetablering, markedsfunksjon, rettsstatus og materiell fortetting.',
    ['økende og varig bosettingstetthet', 'spesialisert handel, håndverk eller administrasjon', 'institusjoner og infrastruktur med urban rekkevidde'],
    ['daterte arkeologiske lag, kart og bygningsspor', 'diplomer, lov- og handelsmateriale som viser funksjon og rettslig status']
  ),
  con_his_byskaping: C(
    'institusjonell byskaping',
    'Institusjonell byskaping er målrettede kongelige, kirkelige eller lokale handlinger som etablerer kirker, gårder, markeder, forsvar, rettigheter og forbindelser som fremmer et bysamfunn.',
    'institutional_city_making_concept',
    ['con_his_bydannelse', 'con_his_kongelig', 'con_his_kirkelig'],
    ['con_his_bydannelse'],
    'Å lese et kongelig eller kirkelig tiltak som fullført bygrunnleggelse uten å dokumentere bosetting, bruk, finansiering, vedlikehold og senere institusjonell kontinuitet.',
    ['datert institusjonelt initiativ', 'tildelte rettigheter, jord eller ressurser', 'materiell gjennomføring og varig lokal bruk'],
    ['diplomer, lover, gavebrev og institusjonsarkiv', 'arkeologiske lag og bosettingsdata som kontrollerer om tiltaket faktisk ble gjennomført']
  ),
  con_his_dagligliv: C(
    'middelaldersk dagligliv',
    'Middelaldersk dagligliv omfatter gjentatte praksiser knyttet til arbeid, mat, bolig, klær, omsorg, religion, ferdsel og sosial omgang i bestemte hushold, institusjoner og lokalsamfunn.',
    'medieval_everyday_life_concept',
    ['con_his_bondehushold', 'con_his_handverk', 'con_his_religiose'],
    ['con_his_demografi'],
    'Å rekonstruere et ensartet hverdagsliv fra normative lover eller elitefortellinger uten å kontrollere regionale, sosiale, kjønnede og sesongmessige forskjeller.',
    ['gjentatte arbeids- og forbrukspraksiser', 'materielle spor etter bolig, mat og klær', 'lokale rytmer for religion, omsorg og ferdsel'],
    ['arkeologiske funn, bygningsspor og miljødata', 'lover, regnskaper og fortellende kilder lest mot praksisnære kontrollkilder']
  ),
  con_his_demografi: C(
    'middelalderdemografi',
    'Middelalderdemografi analyserer befolkningens størrelse, tetthet, alders- og husholdsstruktur, dødelighet, fruktbarhet og flytting gjennom indirekte og ufullstendige kilder.',
    'medieval_demography_concept',
    ['con_his_bondehushold', 'con_his_svartedauden', 'con_his_omforming'],
    ['con_his_dagligliv'],
    'Å presentere presise folketall uten å synliggjøre kildegrunnlag, geografisk dekning, registreringsenhet og usikkerheten i omregning fra gårder, skatter eller gravmateriale.',
    ['daterbare endringer i bosetting og gårdsbruk', 'dødelighets-, grav- eller husholdsspor', 'eksplisitt usikkerhetsintervall og geografisk avgrensning'],
    ['jordebøker, skatt, gravmateriale og bosettingsarkeologi', 'sammenlignbare lokale serier og metodekilder som dokumenterer beregningen']
  ),
  con_his_diplom: C(
    'middelalderdiplom',
    'Et middelalderdiplom er et formalisert skriftlig dokument som stadfester en rettshandling, avtale, gave, dom eller fullmakt gjennom tekst, vitner, datering og autentiserende kjennetegn.',
    'medieval_diploma_concept',
    ['con_his_skriftkultur', 'con_his_patronasje', 'con_his_kongelig'],
    ['con_his_muntlig'],
    'Å lese et diplom som en nøytral rapport om hendelsen uten å undersøke formulartype, avsenderinteresse, kopi, segl, proveniens og forholdet mellom skriftfesting og faktisk praksis.',
    ['identifiserbar rettshandling og aktører', 'datering, vitner, segl eller formular', 'sporbar original, kopi eller overleveringshistorie'],
    ['originaldiplom eller kritisk utgave med proveniens', 'andre diplomer, rettskilder eller materielle spor som kontrollerer innhold og gjennomføring']
  ),
  con_his_geografisk: C(
    'geografisk maktrom',
    'Geografisk maktrom er den skiftende romlige rekkevidden til jurisdiksjon, ferdsel, ressursbruk og institusjonell tilstedeværelse, som ikke nødvendigvis sammenfaller med senere grenser.',
    'medieval_spatial_power_concept',
    ['con_his_sted', 'con_his_kongedomme', 'con_his_statsgrenser'],
    ['con_his_norsk'],
    'Å projisere moderne kommune-, fylkes- eller statsgrenser bakover og behandle dem som stabile rammer for middelalderens mobilitet, rett og tilhørighet.',
    ['daterte jurisdiksjoner og ferdselsruter', 'institusjonell eller økonomisk rekkevidde', 'overlappende og omstridte romlige tilknytninger'],
    ['diplomer, lovområder, stedsnavn og historiske kartrekonstruksjoner', 'arkeologiske funn og nettverksdata som prøver faktisk kontakt og rekkevidde']
  ),
  con_his_handverk: C(
    'middelalderhåndverk',
    'Middelalderhåndverk er spesialisert produksjon basert på ferdigheter, redskaper, råvarer, verksteder og markeder, organisert i hushold, gårder, bymiljøer eller institusjoner.',
    'medieval_craft_production_concept',
    ['con_his_bydannelse', 'con_his_handel', 'con_his_dagligliv'],
    ['con_his_bondehushold'],
    'Å identifisere et håndverk bare fra én gjenstandstype uten å dokumentere produksjonsavfall, verktøy, arbeidssted, råvaretilførsel og forholdet mellom lokal produksjon og import.',
    ['produksjonsavfall, verktøy eller verkstedspor', 'spesialisert ferdighet og råvarekjede', 'produktdistribusjon eller markedsforbindelse'],
    ['arkeologiske kontekster med produksjonsspor', 'regnskaper, toll-, by- eller rettskilder som dokumenterer aktører og omsetning']
  ),
  con_his_jordegods: C(
    'jordegods',
    'Jordegods er en samling gårder, jordparter, inntektsrettigheter og plikter kontrollert av en person eller institusjon og forvaltet gjennom leie, avgifter, tjeneste og patronasje.',
    'medieval_landed_estate_concept',
    ['con_his_patronasje', 'con_his_kongemakt', 'con_his_kirkens'],
    ['con_his_jord'],
    'Å likestille registrert jordegods med sammenhengende territorium eller direkte drift uten å undersøke spredning, partseie, leilendinger, inntektsformer og skiftende kontroll.',
    ['identifiserbare jordparter og rettighetshaver', 'avgifter, leie eller tjenesteforpliktelser', 'forvaltnings- og overføringspraksis over tid'],
    ['jordebøker, diplomer, gavebrev og regnskaper', 'lokale gårds-, retts- og arkeologiske kilder som viser faktisk bruk og kontroll']
  ),
  con_his_kanonisk_rett: C(
    'kanonisk rett',
    'Kanonisk rett er kirkens norm- og rettssystem for embeter, ekteskap, arv, disiplin, sakramenter, eiendom og kirkelig prosess, anvendt gjennom bestemte institusjoner og jurisdiksjoner.',
    'canon_law_concept',
    ['con_his_kirkelig', 'con_his_ting', 'con_his_kongemakt'],
    ['con_his_muntlig'],
    'Å anta at universelle kirkerettslige tekster ble praktisert likt lokalt uten å undersøke mottak, kompetanse, konflikt med verdslig rett og faktisk doms- eller forvaltningspraksis.',
    ['relevant kirkerettslig norm eller formular', 'identifisert kirkelig domstol eller embete', 'dokumentert lokal anvendelse, forhandling eller konflikt'],
    ['kanoniske samlinger, statutter, brev og domsmateriale', 'lokale diplomer og verdslige rettskilder som viser mottak og jurisdiksjonsgrense']
  ),
  con_his_kirke: C(
    'kirkeinstitusjon',
    'Kirkeinstitusjonen er det organiserte fellesskapet av embeter, bispedømmer, kapitler, presteskap, eiendom, ritualer og rettsregler som bandt lokale menigheter til en større kirkelig orden.',
    'medieval_church_institution_concept',
    ['con_his_kirkelig', 'con_his_kirkens', 'con_his_kongemakt'],
    ['con_his_kirker'],
    'Å omtale kirken som én aktør uten å skille mellom pave, erkebiskop, biskop, kapittel, prest, kloster, menighet og deres ulike interesser og ressurser.',
    ['identifiserte embeter og institusjonsnivåer', 'økonomiske og rettslige ressurser', 'rituell, pastoral eller administrativ virksomhet'],
    ['kirkelige brev, statutter, jordebøker og regnskaper', 'lokale menighets-, arkeologiske og verdslige kilder som viser praksis og konflikt']
  ),
  con_his_kirkelig: C(
    'kirkelig jurisdiksjon',
    'Kirkelig jurisdiksjon er kirkens krav på myndighet over bestemte personer, handlinger, eiendommer og rettssaker gjennom embeter, domstoler og kanonisk rett.',
    'ecclesiastical_jurisdiction_concept',
    ['con_his_kanonisk_rett', 'con_his_kirke', 'con_his_ting'],
    ['con_his_kirkens'],
    'Å utlede faktisk kirkelig myndighet direkte fra en normtekst uten å dokumentere hvem som håndhevet den, hvilke saker den omfattet og hvordan verdslige aktører svarte.',
    ['angitt saklig og personlig kompetanse', 'kirkelig embete eller domsforum', 'dokumentert håndheving, anke eller jurisdiksjonskonflikt'],
    ['dommer, brev, statutter og prosessmateriale', 'verdslige lover, diplomer og konfliktsaker som avgrenser faktisk myndighet']
  ),
  con_his_kirkens: C(
    'kirkens institusjonsmakt',
    'Kirkens institusjonsmakt er kapasiteten kirkelige organer hadde til å forvalte jord, produsere skrift, forme normer, organisere ritualer og påvirke konger, lokalsamfunn og hushold.',
    'ecclesiastical_institutional_power_concept',
    ['con_his_kirke', 'con_his_jordegods', 'con_his_patronasje'],
    ['con_his_kirkelig'],
    'Å beskrive kirkens makt som allestedsnærværende uten å spesifisere institusjon, ressurs, mekanisme, geografisk rekkevidde og motstand eller avhengighet.',
    ['kontroll over embete, jord eller inntekt', 'norm-, skrift- eller ritualproduksjon', 'dokumentert innflytelse og motmakt i konkrete saker'],
    ['kirkelige arkiver, jordebøker, brev og liturgiske kilder', 'kongelige, lokale og arkeologiske kontrollkilder som viser gjennomslag og begrensning']
  ),
  con_his_kirker: C(
    'kirker og kirkelandskap',
    'Kirker og kirkelandskap er nettverket av kirkebygg, kirkegårder, veier, sokn, eiendommer og rituelle tyngdepunkter som organiserte landskap og lokal tilhørighet.',
    'medieval_church_landscape_concept',
    ['con_his_kirke', 'con_his_sted', 'con_his_klostre'],
    ['con_his_kirke'],
    'Å telle bevarte kirker som direkte mål på middelalderens kirkelige tetthet uten å inkludere tapte bygg, dateringsusikkerhet, funksjonsendring og soknegrenser.',
    ['daterte kirkebygg og kirkegårder', 'sokne-, ferdsels- eller eiendomsforbindelser', 'rituell og sosial bruk av landskapet'],
    ['arkeologiske og bygningshistoriske undersøkelser', 'diplomer, jordebøker og stedsnavn som dokumenterer nettverk og funksjon']
  ),
  con_his_kloster: C(
    'klosterinstitusjon',
    'En klosterinstitusjon er et regelbundet religiøst fellesskap med bestemte ordensidealer, bygninger, embeter, liturgi, jordegods, arbeid og forbindelser til givere og lokalsamfunn.',
    'medieval_monastery_institution_concept',
    ['con_his_klostre', 'con_his_kirkens', 'con_his_patronasje'],
    ['con_his_kirker'],
    'Å beskrive et kloster bare som et isolert religiøst bygg uten å undersøke orden, fellesskap, økonomi, kjønn, jordegods, gjestfrihet og lokale forbindelser.',
    ['identifisert orden og fellesskap', 'klosteranlegg, embeter og liturgi', 'økonomiske og patronasjebaserte forbindelser'],
    ['regel-, brev-, regnskaps- og jordeboksmateriale', 'arkeologiske anleggsspor og lokale kilder som viser praksis og kontakt']
  ),
  con_his_klostre: C(
    'klosternettverk',
    'Klosternettverk er forbindelser mellom flere klostre, ordenssentra, givere, gårder, handelsruter og kirkelige myndigheter som flyttet personer, tekster, ressurser og praksiser.',
    'medieval_monastic_network_concept',
    ['con_his_kloster', 'con_his_jordegods', 'con_his_skriftkultur'],
    ['con_his_kloster'],
    'Å behandle alle klostre som like eller direkte styrt fra ett sentrum uten å dokumentere ordenstilhørighet, lokale tilpasninger, kontaktfrekvens og økonomisk avhengighet.',
    ['flere identifiserte klosterinstitusjoner', 'person-, tekst- eller ressursutveksling', 'ordensmessige og regionale forbindelser'],
    ['brev, visitas, nekrologier, regnskaper og ordenskilder', 'arkeologiske og prosopografiske data som viser faktisk kontakt og lokal forskjell']
  ),
  con_his_kongedomme: C(
    'middelaldersk kongedømme',
    'Et middelaldersk kongedømme er en politisk orden som knytter konge, dynasti, lov, råd, inntekter, militær følge, kirke og regionale samfunn sammen gjennom skiftende lojaliteter og institusjoner.',
    'medieval_kingdom_concept',
    ['con_his_kongemakt', 'con_his_aristokrati', 'con_his_geografisk'],
    ['con_his_kongelig'],
    'Å framstille kongedømmet som en moderne sentralstat med faste grenser, lik administrasjon og ubrutt dynastisk kontroll.',
    ['anerkjent konge- eller dynastikrav', 'lov-, råd-, inntekts- og militærordninger', 'regional forhandling og institusjonell rekkevidde'],
    ['lover, diplomer, mynter og kongelige brev', 'regionale, kirkelige og arkeologiske kilder som viser faktisk myndighet og variasjon']
  ),
  con_his_kongelig: C(
    'kongelig nærvær',
    'Kongelig nærvær er daterbare handlinger, opphold, byggeprosjekter, utnevnelser, gaver og rettsavgjørelser som gjorde kongedømmet synlig og virksomt på bestemte steder.',
    'royal_presence_concept',
    ['con_his_kongemakt', 'con_his_byskaping', 'con_his_patronasje'],
    ['con_his_kongedomme'],
    'Å merke et anlegg eller dokument som kongelig og derfra slutte til varig kontroll uten å dokumentere bruk, finansiering, representasjon og senere institusjonell oppfølging.',
    ['datert kongelig handling eller opphold', 'ressurs, bygg, embete eller rettighet knyttet til kronen', 'lokal mottakelse og etterfølgende bruk'],
    ['kongelige diplomer, regnskaper, itinerarier og bygningsspor', 'lokale og kirkelige kilder som kontrollerer faktisk nærvær og virkning']
  ),
  con_his_kongemakt: C(
    'kongemakt',
    'Kongemakt er kongens og den kongelige organisasjonens evne til å kreve lydighet, mekle konflikter, utstede lov, hente ressurser, føre krig og utnevne personer gjennom konkrete institusjoner og relasjoner.',
    'medieval_royal_power_concept',
    ['con_his_kongedomme', 'con_his_aristokrati', 'con_his_kirke'],
    ['con_his_kongelig'],
    'Å måle kongemakt bare gjennom kongelige påstander eller seier i enkelthendelser uten å undersøke administrativ kapasitet, regional forhandling, ressursgrunnlag og tilbakevendende motstand.',
    ['lovgivning, dom eller utnevnelse', 'inntekts-, militær- eller administrativ kapasitet', 'dokumentert gjennomslag og forhandling i regionene'],
    ['kongelige lover, diplomer, regnskaper og rådskilder', 'aristokratiske, kirkelige og lokale kilder som viser aksept, konflikt og begrensning']
  ),
  con_his_middelalder: C(
    'middelalder som periodisering',
    'Middelalder som periodisering er en analytisk tidsavgrensning som ordner historiske forløp mellom ulike valgte start- og sluttpunkter og derfor må begrunnes etter sted, tema og kildesituasjon.',
    'medieval_periodization_concept',
    ['con_his_middelalderen', 'con_his_senmiddelalderens', 'con_his_omforming'],
    ['con_his_middelalderen'],
    'Å behandle middelalderen som en naturlig, ensartet og samtidig epoke for alle regioner, grupper og institusjoner.',
    ['eksplisitte tidsgrenser og begrunnelse', 'region- og temaspesifikke vendepunkter', 'synliggjorte kontinuiteter på tvers av grensen'],
    ['daterte kildeserier og historiografiske periodiseringsdiskusjoner', 'regionale sammenligninger som prøver om grensene faktisk passer']
  ),
  con_his_middelalderen: C(
    'middelaldersamfunn',
    'Middelaldersamfunn betegner den historiske helheten av hushold, rett, religion, økonomi, makt og materielle omgivelser innen et avgrenset område og tidsrom.',
    'medieval_social_formation_concept',
    ['con_his_middelalder', 'con_his_dagligliv', 'con_his_kongedomme'],
    ['con_his_middelalder'],
    'Å beskrive middelaldersamfunnet som én lukket samfunnstype uten å vise regionale forskjeller, kontaktsoner, sosial konflikt og endring gjennom perioden.',
    ['avgrenset befolkning og institusjonsstruktur', 'sammenheng mellom hushold, rett, religion og økonomi', 'dokumentert intern variasjon og historisk endring'],
    ['kombinerte arkeologiske, rettslige og administrative kilder', 'lokale og komparative studier som viser forskjeller mellom grupper og regioner']
  ),
  con_his_middelalderens: C(
    'middelalderbyens rom',
    'Middelalderbyens rom er den daterte organiseringen av gater, brygger, gårder, kirker, kongelige anlegg, verksteder og gravplasser, slik funksjoner og maktforhold fordelte seg fysisk.',
    'medieval_urban_space_concept',
    ['con_his_sted', 'con_his_bydannelse', 'con_his_kirker'],
    ['con_his_middelalderen'],
    'Å rekonstruere et sammenhengende middelalderkart fra funn med ulik datering eller bruke dagens gatenett og terreng som direkte fasit.',
    ['daterte bygg-, gate- og aktivitetslag', 'romlig forhold mellom institusjoner og hverdagsfunksjoner', 'endring i strandlinje, terreng eller tomtestruktur'],
    ['stratigrafiske undersøkelser, kartrekonstruksjoner og bygningsspor', 'diplomer og topografiske kilder som kontrollerer funksjon og datering']
  ),
  con_his_middelaldermakt: C(
    'sammensatt middelaldermakt',
    'Sammensatt middelaldermakt er overlappende myndighet mellom konge, kirke, aristokrati, ting, lokalsamfunn og hushold, utøvd gjennom rett, jord, personlige bånd, ritual og vold.',
    'polycentric_medieval_power_concept',
    ['con_his_kongemakt', 'con_his_kirkens', 'con_his_aristokrati'],
    ['con_his_kongedomme'],
    'Å plassere all middelaldermakt i én institusjon eller lese formelt hierarki som om det fjernet lokal autonomi, forhandling og jurisdiksjonsoverlapp.',
    ['flere samtidige maktsentra', 'overlappende rettigheter og jurisdiksjoner', 'forhandling, patronasje eller konflikt mellom nivåene'],
    ['lover, diplomer, jordebøker og konfliktmateriale', 'lokale, kirkelige og arkeologiske kilder som viser faktisk maktutøvelse']
  ),
  con_his_muntlig: C(
    'muntlig rettspraksis',
    'Muntlig rettspraksis er framføring, minne, vitnesbyrd, ed, kunngjøring og forhandling som skapte og bekreftet rett før, ved siden av eller gjennom senere skriftfesting.',
    'oral_legal_practice_concept',
    ['con_his_ting', 'con_his_skriftkultur', 'con_his_diplom'],
    ['con_his_diplom'],
    'Å behandle muntlig rett som skriftløs og uforanderlig tradisjon eller rekonstruere ordrette utsagn fra langt senere nedtegnelser.',
    ['vitner, eder og offentlig kunngjøring', 'ritualisert framføring eller kollektivt minne', 'spor etter senere skriftfesting eller tvist'],
    ['lover, diplomer og prosesskilder som omtaler muntlig handling', 'sammenlignbare rettspraksiser og kildekritiske analyser av nedtegnelsen']
  ),
  con_his_norsk: C(
    'norsk rikstilknytning',
    'Norsk rikstilknytning er historisk skiftende tilknytning til kongedømme, lovområder, kirkeprovins, skatt, militære krav og politiske fellesskap, ikke en tidløs nasjonal identitet.',
    'medieval_realm_affiliation_concept',
    ['con_his_kongedomme', 'con_his_geografisk', 'con_his_statsgrenser'],
    ['con_his_samiske'],
    'Å projisere moderne norsk nasjonalitet og territorium bakover på aktører som orienterte seg gjennom lokale, dynastiske, kirkelige og overlappende tilhørigheter.',
    ['dokumentert lov-, skatte- eller troskapsforbindelse', 'kirkelig eller kongelig institusjonstilknytning', 'overlapp eller endring i regional tilhørighet'],
    ['lover, diplomer, skatte- og kirkelige kilder', 'grense-, kontakt- og lokale kilder som viser konkurrerende tilhørigheter']
  ),
  con_his_okonomisk: C(
    'middelalderøkonomi',
    'Middelalderøkonomi er samspillet mellom jordbruk, avgifter, gaveutveksling, handel, håndverk, mynt, kreditt og institusjonell ressurskontroll i bestemte steder og perioder.',
    'medieval_economy_concept',
    ['con_his_handel', 'con_his_handverk', 'con_his_jordegods'],
    ['con_his_demografi'],
    'Å redusere økonomien til mynt og marked eller bruke moderne skille mellom økonomisk, politisk og religiøs handling uten å undersøke samtidens sammensatte forpliktelser.',
    ['produksjon og ressursgrunnlag', 'utveksling, avgift eller betalingsform', 'institusjonell kontroll og geografisk forbindelse'],
    ['regnskaper, jordebøker, mynter, toll- og handelsfunn', 'arkeologiske og rettslige kilder som viser ikke-monetære former og lokal praksis']
  ),
  con_his_omforming: C(
    'historisk omforming',
    'Historisk omforming er en flerleddet endring der institusjoner, bosetting, eiendom, arbeid og maktforhold reorganiseres uten at alle tidligere strukturer forsvinner samtidig.',
    'medieval_transformation_process_concept',
    ['con_his_svartedauden', 'con_his_senmiddelalderens', 'con_his_demografi'],
    ['con_his_bydannelse'],
    'Å bruke omforming som et uklart synonym for endring uten å angi førtilstand, mekanisme, tidsskala, berørte grupper og hva som faktisk fortsatte.',
    ['eksplisitt før- og ettertilstand', 'identifisert mekanisme og tidsforløp', 'samtidige brudd og kontinuiteter'],
    ['sammenlignbare kildeserier fra minst to tidspunkter', 'lokale kontrollkilder som viser ulik virkning mellom institusjoner og grupper']
  ),
  con_his_patronasje: C(
    'patronasje',
    'Patronasje er et gjensidig, men asymmetrisk forhold der en beskytter gir jord, embete, gave, vern eller adgang mot tjeneste, bønn, lojalitet, representasjon eller politisk støtte.',
    'medieval_patronage_concept',
    ['con_his_aristokrati', 'con_his_kongelig', 'con_his_kirkens'],
    ['con_his_jordegods'],
    'Å tolke enhver gave som patronasje uten å dokumentere varig relasjon, forventet motytelse, sosial asymmetri og hvem som faktisk kontrollerte ressursen.',
    ['identifiserbar patron og mottaker', 'ressurs eller adgang som overføres', 'forventet tjeneste, bønn, lojalitet eller representasjon'],
    ['gavebrev, diplomer, regnskaper og korrespondanse', 'prosopografiske og institusjonelle kilder som viser relasjonens varighet og motytelser']
  ),
  con_his_religiose: C(
    'religiøse praksiser',
    'Religiøse praksiser er ritualer, bønn, pilegrimsferd, gave, faste, begravelse og hverdagslige handlinger som knyttet tro, kropp, fellesskap, steder og institusjoner sammen.',
    'medieval_religious_practice_concept',
    ['con_his_kirke', 'con_his_kloster', 'con_his_kristning'],
    ['con_his_kirkelig'],
    'Å utlede menneskers tro direkte fra offisiell lære eller kirkelig norm uten å undersøke faktisk praksis, lokal variasjon, tvang og kombinasjoner av tradisjoner.',
    ['daterbart ritual eller materiell praksis', 'identifisert sosial og institusjonell ramme', 'lokal variasjon, deltakelse eller konflikt'],
    ['liturgiske, normative og fortellende kilder', 'arkeologiske, ikonografiske og praksisnære kilder som kontrollerer faktisk bruk']
  ),
  con_his_senmiddelalderens: C(
    'senmiddelalderlig omforming',
    'Senmiddelalderlig omforming er reorganiseringen av befolkning, gårdsbruk, jordleie, kirke, handel og politiske forbindelser etter pestbølger og andre kriser fra 1300-tallet og framover.',
    'late_medieval_transformation_concept',
    ['con_his_svartedauden', 'con_his_omforming', 'con_his_jordegods'],
    ['con_his_middelalder'],
    'Å forklare alle senmiddelalderlige endringer som direkte følge av én pesthendelse uten å skille regionale forløp, senere epidemier, politiske endringer og før-eksisterende tendenser.',
    ['endret bosetting og gårdsbruk', 'reorganisert jordleie, institusjon eller handel', 'datert utvikling gjennom flere tiår eller generasjoner'],
    ['jordebøker, skatt, diplomer og bosettingsarkeologi', 'regionale sammenligninger og serier som prøver alternative årsaker']
  ),
  con_his_skriftkultur: C(
    'middelaldersk skriftkultur',
    'Middelaldersk skriftkultur er miljøene, ferdighetene, språkene, materialene og institusjonene som produserte, kopierte, oppbevarte, leste og brukte tekster i rett, religion og forvaltning.',
    'medieval_written_culture_concept',
    ['con_his_diplom', 'con_his_muntlig', 'con_his_kirkelig'],
    ['con_his_diplom'],
    'Å likestille bevart skrift med all kommunikasjon eller anta at tekstens produsent, leser og praktiske bruker var samme person eller institusjon.',
    ['skrivekyndig miljø og produksjonssted', 'materiale, språk, formular og brukssituasjon', 'oppbevaring, kopiering eller sirkulasjon'],
    ['manuskripter, diplomer, paleografiske og kodikologiske data', 'institusjons- og brukskilder som viser lesere, framføring og praktisk virkning']
  ),
  con_his_sted: C(
    'historisk stedskontekst',
    'Historisk stedskontekst er den daterte kombinasjonen av terreng, bygg, eiendom, ferdsel, institusjoner, bruk og fortellinger som gir et avgrenset sted historisk betydning.',
    'medieval_place_context_concept',
    ['con_his_geografisk', 'con_his_middelalderens', 'con_his_kirker'],
    ['con_his_byskaping'],
    'Å behandle dagens synlige sted som identisk med middelalderens sted uten å kontrollere strandlinje, terreng, flytting, ruinbevaring, gjenoppbygging og funksjonsendring.',
    ['eksplisitt geografisk og kronologisk avgrensning', 'daterte materielle og institusjonelle lag', 'dokumentert bruk og forbindelse til omlandet'],
    ['stratigrafi, landskapsdata, historiske kartrekonstruksjoner og byggespor', 'diplomer, stedsnavn og ferdselskilder som kontrollerer funksjon og rekkevidde']
  ),
  con_his_svartedauden: C(
    'svartedauden',
    'Svartedauden er pestpandemien som nådde Norge i 1349–1350, analysert som et dokumentert sykdoms- og dødelighetsforløp med ulik lokal spredning og langsiktige demografiske, økonomiske og institusjonelle følger.',
    'black_death_event_process_concept',
    ['con_his_demografi', 'con_his_omforming', 'con_his_bondehushold'],
    ['con_his_senmiddelalderens'],
    'Å bruke svartedauden som en enkelt forklaring på all senere tilbakegang eller oppgi presise lokale dødstall uten samtidige eller metodisk begrunnede kilder.',
    ['daterte pest- eller dødelighetsspor', 'brudd i bosetting, inntekter eller institusjonell bemanning', 'lokalt avgrensede ettervirkninger med alternative forklaringer prøvd'],
    ['samtidige brev, annaler, testamenter og administrative brudd', 'grav-, bosettings- og jordeboksdata med eksplisitt metode og usikkerhet']
  ),
  con_his_ting: C(
    'tingforsamling',
    'En tingforsamling er en offentlig retts- og beslutningsarena der bestemte deltakere kunngjorde lov, avla ed, førte saker, vitnet, inngikk forlik og bekreftet politiske handlinger.',
    'medieval_thing_assembly_concept',
    ['con_his_kanonisk_rett', 'con_his_muntlig', 'con_his_kongemakt'],
    ['con_his_kirkelig'],
    'Å framstille tinget som et moderne demokratisk parlament eller som kongens rene redskap uten å undersøke adgang, representasjon, rettsfunksjon, ritual og regional variasjon.',
    ['identifisert tingsted og deltakerkrets', 'rettslig eller politisk sak og ritual', 'vitner, kunngjøring, dom eller forlik'],
    ['lover, diplomer, saga- og rettsmateriale med kildekritikk', 'arkeologiske tingstedsspor og regionale sammenligninger som viser faktisk praksis']
  )
};

const targetInventory = readJson(targetInventoryPath);
const targetIds = [...targetInventory.concept_ids].sort();
const specIds = Object.keys(conceptSpecs).sort();
if (JSON.stringify(targetIds) !== JSON.stringify(specIds)) {
  throw new Error(`Concept spec mismatch: target=${JSON.stringify(targetIds)} spec=${JSON.stringify(specIds)}`);
}

const concepts = readJson(conceptPath);
const conceptById = new Map(concepts.map((item) => [item.concept_id, item]));
const curatedConceptIndex = [];
for (const [id, spec] of Object.entries(conceptSpecs)) {
  const current = conceptById.get(id);
  if (!current) throw new Error(`Missing concept ${id}`);
  const previousLabel = current.label;
  Object.assign(current, spec);
  curatedConceptIndex.push({ concept_id: id, previous_label: previousLabel, label: current.label, concept_type: current.concept_type });
}
writeJson(conceptPath, concepts);

const theorySpecs = {
  theory_his_middelalder_by_kirke: {
    definition: 'Analyserer middelalderbyen som et romlig og institusjonelt samspill mellom kongelig nærvær, kirker, klostre, gårder, brygger, håndverk, rett og ferdsel, der ulike maktsentra både samarbeidet og konkurrerte.',
    limitations: [
      'Byens synlige ruiner og bevarte kirker overrepresenterer monumentale institusjoner og må balanseres mot boliger, verksteder, avfall og ferdsel.',
      'Arkeologiske lag med ulik datering kan ikke settes sammen til ett samtidig bykart uten eksplisitt kronologi.',
      'Kirkelig og kongelig investering dokumenterer ikke alene hvem som bodde i byen, hvordan anleggene ble brukt eller hvor langt makten rakk.'
    ]
  },
  theory_his_middelalder_kirke_kongemakt_kirke_og_konflikt: {
    definition: 'Forklarer forholdet mellom kongemakt og kirke gjennom konkurrerende jurisdiksjon, embetsutnevnelser, lov, jordegods, patronasje, ritual legitimitet og behovet for gjensidig organisatorisk støtte.',
    limitations: [
      'Konflikter mellom konge og erkebiskop kan ikke generaliseres til et permanent skille mellom stat og kirke eller til alle kirkelige aktører.',
      'Normative krav i brev og lov må skilles fra praktisk håndheving, kompromiss og regional variasjon.',
      'Personkonflikt, dynastisk strid og institusjonell jurisdiksjon må analyseres separat før de kobles årsaksmessig.'
    ]
  },
  theory_his_middelalder_kirke_middelalderens_oslo: {
    definition: 'Rekonstruerer middelalderens Oslo gjennom daterte bylag, strandlinje, kirkelandskap, kongelige anlegg, gårdsstruktur, havn, håndverk og forbindelser til omlandet, med stedets endring som hovedproblem.',
    limitations: [
      'Dagens Middelalderpark og synlige ruiner tilsvarer ikke byens historiske grenser, terreng eller funksjonsfordeling.',
      'Skriftlige kilder navngir selektivt personer og eiendommer og må kobles forsiktig til arkeologiske tomter og lag.',
      'Oslo kan ikke behandles som representativt for alle nordiske middelalderbyer uten eksplisitt komparativt grunnlag.'
    ]
  },
  theory_his_middelalder_kirke_lov_ting_og_jurisdiksjon: {
    definition: 'Analyserer rett som samspill mellom lovtekster, tingforsamlinger, muntlig kunngjøring, vitner, kongelig og kirkelig jurisdiksjon samt lokal forhandling om hvem som kunne dømme og håndheve.',
    limitations: [
      'Bevart lovtekst dokumenterer norm og redaksjon, ikke automatisk lik praksis i alle regioner eller perioder.',
      'Tingdeltakelse og representasjon må dokumenteres; institusjonen kan ikke uten videre beskrives som demokratisk eller egalitær.',
      'Kirkelig og verdslig jurisdiksjon overlappet, og enkeltsaker må plasseres i riktig sakstype, forum og ankemulighet.'
    ]
  },
  theory_his_middelalder_kirke_jord_eiendom_og_patronasje: {
    definition: 'Forklarer jord og eiendom som relasjoner mellom rettighetshavere, brukere, avgifter, gaver, arv og patronasje, der jordegods bandt hushold, aristokrati, kirke og kongemakt sammen over avstand.',
    limitations: [
      'Jordebok og gavebrev viser registrerte rettigheter og inntekter, ikke nødvendigvis direkte drift, sammenhengende territorium eller uomstridt kontroll.',
      'En gave kan ha religiøse, juridiske, familiære og politiske funksjoner samtidig og må ikke reduseres til økonomisk transaksjon.',
      'Senere kopier og institusjonsarkiv kan overrepresentere eiendom som ble beholdt og underdokumentere tap, tvist og lokal praksis.'
    ]
  },
  theory_his_middelalder_kirke_handel_handverk_og_bydannelse: {
    definition: 'Analyserer bydannelse gjennom forbindelsen mellom sjø- og landruter, markeder, varestrømmer, spesialisert håndverk, råvarer, kongelige og kirkelige institusjoner samt varig bosetting.',
    limitations: [
      'Importfunn dokumenterer kontakt og forbruk, men ikke automatisk handelsmannens identitet, handelsvolum eller organisasjonsform.',
      'Produksjon må påvises med verksted, verktøy eller avfall og kan ikke sluttes fra ferdige gjenstander alene.',
      'Handel kan støtte bydannelse uten å være tilstrekkelig årsak; rett, sikkerhet, institusjoner og omlandsproduksjon må undersøkes samtidig.'
    ]
  },
  theory_his_middelalder_kirke_bondehushold_demografi_og_dagligliv: {
    definition: 'Rekonstruerer bondehushold og dagligliv gjennom gårdsbruk, arbeidsdeling, kosthold, materielle spor, leie- og avgiftsforhold, livsløp og indirekte demografiske data.',
    limitations: [
      'Husholdets størrelse og sammensetning kan ikke leses direkte fra antall bygninger, ildsteder eller registrerte skatteenheter.',
      'Normative beskrivelser av kjønn, familie og arbeid må kontrolleres mot materielle, rettslige og lokale praksisspor.',
      'Demografiske beregninger må oppgi usikkerhet og kan ikke uten videre overføres mellom gårder, regioner og perioder.'
    ]
  },
  theory_his_middelalder_kirke_svartedauden_og_senmiddelalderens_omforming: {
    definition: 'Analyserer svartedauden som et akutt pest- og dødelighetsforløp og senmiddelalderens omforming som langvarige, regionalt ulike endringer i bosetting, jordleie, inntekter, institusjoner og politiske forbindelser.',
    limitations: [
      'Presise dødstall må ikke oppgis uten metode, geografisk enhet og usikkerhetsintervall.',
      'Tomme gårder, inntektsfall og institusjonelle brudd kan ha flere årsaker og må dateres i forhold til gjentatte pestbølger og andre kriser.',
      'Et samlet nasjonalt tilbakegangsbilde kan skjule lokal vekst, omfordeling, lønnsendring og institusjonell tilpasning.'
    ]
  },
  theory_his_middelalder_kirke_skriftkultur_diplom_og_muntlig_rett: {
    definition: 'Analyserer forholdet mellom muntlig rettspraksis og skriftkultur gjennom eder, vitner, offentlig kunngjøring, diplomer, formularer, segl, kopiering og institusjonell arkivering.',
    limitations: [
      'Skriftfesting må ikke tolkes som at muntlig praksis forsvant; tekst og framføring kunne være gjensidig avhengige.',
      'Et bevart diplom er et produsert og overlevert dokument med bestemte interesser, ikke et ordrett referat av hele rettshandlingen.',
      'Arkivbevaring er sosialt og institusjonelt skjev og kan ikke brukes som direkte mål på hvor vanlig en praksis var.'
    ]
  },
  theory_his_middelalder_kirke_samiske_kontaktsoner_handel_og_statsgrenser_i_middelalderen: {
    definition: 'Analyserer samiske kontaktsoner som overlappende rom for handel, skatt, ressursbruk, språk, religion og politiske krav, der senere statsgrenser ikke kan tas som middelalderens utgangspunkt.',
    limitations: [
      'Nasjonale kategorier og moderne grenser må ikke projiseres bakover på mobile og overlappende tilhørigheter.',
      'Skriftlige kilder fra kongelige og kirkelige aktører må balanseres mot arkeologi, stedsnavn og samiske kunnskapstradisjoner.',
      'Handel dokumenterer kontakt, men ikke automatisk fred, likeverd, assimilasjon eller politisk kontroll.'
    ]
  }
};

const targetTheoryIds = [...targetInventory.theory_ids].sort();
const theorySpecIds = Object.keys(theorySpecs).sort();
if (JSON.stringify(targetTheoryIds) !== JSON.stringify(theorySpecIds)) {
  throw new Error(`Theory spec mismatch: target=${JSON.stringify(targetTheoryIds)} spec=${JSON.stringify(theorySpecIds)}`);
}

const theories = readJson(theoryPath);
const theoryById = new Map(theories.map((item) => [item.theory_id, item]));
for (const [id, spec] of Object.entries(theorySpecs)) {
  const current = theoryById.get(id);
  if (!current) throw new Error(`Missing theory ${id}`);
  Object.assign(current, spec, { status: 'canonical_v5_5_curated', evidence_ready: false });
}
writeJson(theoryPath, theories);

const run = (name, command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

run('middelalder-kirke-kongemakt-domain-validation.log', process.execPath, ['tools/validate-historie-domain.mjs', domainId]);
run('middelalder-kirke-kongemakt-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('middelalder-kirke-kongemakt-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('middelalder-kirke-kongemakt-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('middelalder-kirke-kongemakt-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('middelalder-kirke-kongemakt-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('middelalder-kirke-kongemakt-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('middelalder-kirke-kongemakt-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);

const readiness = readJson(path.join(reportDir, 'historie-v5-5-readiness.json'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain?.freeze_ready) throw new Error(`${domainId} did not become freeze_ready: ${JSON.stringify(domain)}`);
const index = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concepts: curatedConceptIndex,
  curated_theory_ids: Object.keys(theorySpecs)
};
writeJson(path.join(reportDir, 'middelalder-kirke-kongemakt-curation-index.json'), index);
const summary = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concept_ids: Object.keys(conceptSpecs),
  curated_theory_ids: Object.keys(theorySpecs),
  domain_readiness: domain,
  global_status: readiness.status,
  v6_allowed: readiness.v6_allowed,
  quality_issue_totals: readiness.quality_issue_totals,
  next_gate: 'Continue individual curation of the remaining V5.5 domains before global freeze and V6 activation.'
};
writeJson(path.join(reportDir, 'middelalder-kirke-kongemakt-curation-readiness.json'), summary);
fs.rmSync(targetInventoryPath, { force: true });
console.log(JSON.stringify(summary, null, 2));
