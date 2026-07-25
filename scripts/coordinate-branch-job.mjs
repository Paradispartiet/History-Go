#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_krig_okkupasjon_motstand';
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const inventoryPath = path.join(reportDir, 'krig-okkupasjon-motstand-inventory.json');

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
  con_his_avhor: C(
    'avhør',
    'Avhør er en institusjonelt organisert utspørring der myndigheter, militære eller andre maktaktører søker informasjon, tilståelser eller identifikasjon under bestemte rettslige og praktiske vilkår.',
    'interrogation_practice_concept',
    ['con_his_fangenskap', 'con_his_vold', 'con_his_informasjonskontroll'],
    ['con_his_gransking'],
    'Å behandle et avhørsreferat som en direkte og frivillig forklaring uten å undersøke press, oversettelse, redigering, protokollform og avhørerens formål.',
    ['identifisert avhører og avhørt person', 'datert sted og institusjonell ramme', 'spørsmål, svar, pressmidler eller protokollpraksis'],
    ['original protokoll, journal eller saksmappe med proveniens', 'kontrollkilde fra den avhørte, vitner eller senere rettslig prøving']
  ),
  con_his_demokrati: C(
    'demokrati',
    'Demokrati er historisk organiserte ordninger for politisk representasjon, rettigheter, offentlig meningsdannelse, maktbegrensning og ansvarliggjøring, slik de faktisk fungerte for ulike grupper.',
    'democratic_order_concept',
    ['con_his_overgangsrettferdighet', 'con_his_sikkerhetsstat', 'con_his_folkerett'],
    ['con_his_okkupasjon'],
    'Å beskrive etterkrigstidens styre som demokratisk bare fordi valg og grunnlov ble gjenopprettet, uten å undersøke unntaksregler, eksklusjon, overvåking og reell deltakelse.',
    ['valg og representasjon', 'rettighetsvern og maktbegrensning', 'åpen offentlighet og ansvarliggjøring'],
    ['lov- og valgdokumenter, stortings- eller kommunekilder', 'kilder om faktisk deltakelse, eksklusjon og myndighetspraksis']
  ),
  con_his_etterkrig: C(
    'etterkrigsorden',
    'Etterkrigsorden er den politiske, rettslige, økonomiske og sosiale reorganiseringen etter en krig, fra maktoverføring og rettsoppgjør til gjenoppbygging, sikkerhetspolitikk og nye kollektive fortellinger.',
    'postwar_order_concept',
    ['con_his_overgangsrettferdighet', 'con_his_gjenoppbygging', 'con_his_krigsminne'],
    ['con_his_ettervirkninger'],
    'Å bruke etterkrig som en ensartet periode med ett startpunkt og én utviklingsretning uten å skille mellom rett, økonomi, hverdagsliv, sikkerhet og minne.',
    ['formell maktoverføring og nye institusjoner', 'rettsoppgjør og gjenoppbygging', 'endret sikkerhets- og minnepolitikk'],
    ['lover, regjerings- og forvaltningsarkiver, budsjetter og planer', 'samtidige kilder fra berørte grupper og sammenlignbare før-og-etter-data']
  ),
  con_his_ettervirkninger: C(
    'ettervirkninger',
    'Ettervirkninger er dokumenterbare konsekvenser som fortsetter etter at den akutte krigs- eller okkupasjonssituasjonen er avsluttet, eksempelvis helseplager, tap, rettighetsendringer, institusjonell læring og konflikt om minne.',
    'long_term_consequence_concept',
    ['con_his_krigsminne', 'con_his_veteraner', 'con_his_etterkrig'],
    ['con_his_ettertid'],
    'Å kalle enhver senere utvikling en ettervirkning uten å dokumentere en mekanisme eller forbindelse til krigen, okkupasjonen eller rettsoppgjøret.',
    ['vedvarende helse-, økonomi- eller rettighetsvirkning', 'sporbar institusjonell eller sosial mekanisme', 'daterbar kontinuitet etter konfliktens slutt'],
    ['langsiktige register-, helse-, erstatnings- eller forvaltningskilder', 'kontrollgruppe, sammenlignbart sted eller kilde som prøver alternative forklaringer']
  ),
  con_his_fangeleirer: C(
    'fangeleirer',
    'Fangeleirer er avgrensede anlegg for kollektiv internering eller fangenskap, organisert gjennom vakthold, registrering, forsyning, arbeid, disiplin og bestemte kategorier av fanger.',
    'detention_camp_concept',
    ['con_his_fangenskap', 'con_his_internering', 'con_his_forfolgelse'],
    ['con_his_fengsler'],
    'Å behandle alle leirer som samme institusjonstype eller bruke senere minnestedsgrenser som om de tilsvarte leirens historiske utstrekning og funksjon.',
    ['avgrenset leirorganisasjon og kommandolinje', 'fange- og personellregister', 'vakthold, innkvartering, arbeid og forsyning'],
    ['leiradministrasjon, kart, fangelister og transportspor', 'fangeberetninger, lokale kilder og materielle spor som kontrollerer administrativ dokumentasjon']
  ),
  con_his_fangenskap: C(
    'fangenskap',
    'Fangenskap er tap av bevegelsesfrihet under militær, politisk eller strafferettslig kontroll, med skiftende rettsstatus, institusjon, varighet, levevilkår og mulighet til kontakt eller prøving.',
    'captivity_condition_concept',
    ['con_his_fangeleirer', 'con_his_fengsler', 'con_his_internering'],
    ['con_his_tvang'],
    'Å slutte fra registrert arrestasjon til et sammenhengende fangenskapsforløp uten å rekonstruere overføringer, statusendringer, løslatelse, flukt eller død.',
    ['datert frihetsberøvelse og status', 'institusjon eller transportkjede', 'vilkår, varighet og utfall'],
    ['arrest-, fange-, transport- og løslatelsesregistre', 'brev, dagbøker, vitneutsagn eller rettskilder som dokumenterer faktisk forløp']
  ),
  con_his_fengsler: C(
    'fengsler',
    'Fengsler er permanente eller midlertidig omformede institusjoner for individuell eller gruppevis frihetsberøvelse, styrt gjennom celleplassering, vakthold, avhør, disiplin og juridisk eller administrativ klassifikasjon.',
    'prison_institution_concept',
    ['con_his_fangenskap', 'con_his_avhor', 'con_his_vold'],
    ['con_his_fangeleirer'],
    'Å anta at fengselets ordinære regelverk beskriver praksisen under krig og okkupasjon uten å undersøke overbelegg, fremmede myndigheter, særavdelinger og uformell vold.',
    ['institusjonell ledelse og regelverk', 'innsettelses- og cellejournaler', 'avhør, disiplin, overføring og løslatelse'],
    ['fengselsjournaler, instrukser, plantegninger og korrespondanse', 'fange- og ansattkilder som kan prøve forskjellen mellom regel og praksis']
  ),
  con_his_folkerett: C(
    'folkerett',
    'Folkerett er de mellomstatlige reglene, sedvanene og institusjonene som historisk regulerte krigføring, okkupasjon, fangebehandling, sivilt vern og staters ansvar, slik reglene ble tolket og håndhevet i samtiden.',
    'international_law_concept',
    ['con_his_okkupasjon', 'con_his_total_krig', 'con_his_overgangsrettferdighet'],
    ['con_his_landssvik'],
    'Å anvende dagens traktater og rettsbegreper direkte på eldre handlinger uten å fastslå hvilke regler som gjaldt, for hvem og med hvilken håndhevingsmulighet.',
    ['gjeldende traktat eller sedvaneregel', 'identifisert rettssubjekt og handling', 'samtidig tolkning, protest eller håndheving'],
    ['traktattekst, militær instruks, diplomatisk note eller dom', 'kontrollkilde som viser faktisk praksis og eventuell normkonflikt']
  ),
  con_his_forfolgelse: C(
    'forfølgelse',
    'Forfølgelse er målrettet og vedvarende utsatthet for registrering, rettighetstap, ekspropriasjon, internering, deportasjon eller vold på grunnlag av tilskrevet identitet, politikk eller gruppetilhørighet.',
    'persecution_process_concept',
    ['con_his_registrering', 'con_his_internering', 'con_his_vold'],
    ['con_his_informasjonskontroll'],
    'Å bruke forfølgelse om enhver diskriminerende eller fiendtlig handling uten å dokumentere målgruppe, gjentakelse, institusjonell sammenheng og eskalering.',
    ['definert målgruppe og kategorisering', 'gjentatte eller samordnede inngrep', 'rettighetstap, frihetsberøvelse, deportasjon eller vold'],
    ['lover, registre, politisaker, beslag- og transportdokumenter', 'kilder fra de forfulgte og lokale kontrollkilder som viser gjennomføring']
  ),
  con_his_grasoner: C(
    'gråsoner',
    'Gråsoner er historiske situasjoner der aktørers handlinger ikke entydig kan klassifiseres som motstand, samarbeid eller tilpasning fordi tvang, avhengighet, skiftende informasjon og flere samtidige formål virker sammen.',
    'ambiguous_action_concept',
    ['con_his_tilpasning', 'con_his_samarbeid', 'con_his_motstand'],
    ['con_his_kollaborasjon'],
    'Å bruke gråsone som en måte å unngå vurdering av dokumenterte valg, konsekvenser og maktforhold, eller som automatisk moralsk frikjennelse.',
    ['motstridende eller skiftende handlinger', 'dokumentert tvang, avhengighet eller informasjonsmangel', 'ulik virkning for aktøren og andre'],
    ['mikrohistorisk sammenstilling av samtidige kilder', 'kontrollkilder fra berørte parter og dokumentasjon av alternativer aktøren faktisk hadde']
  ),
  con_his_informasjonskontroll: C(
    'informasjonskontroll',
    'Informasjonskontroll er samordnede tiltak for å styre produksjon, tilgang, sirkulasjon og lagring av informasjon gjennom sensur, propaganda, overvåking, beslag, lisensiering og kontroll over kommunikasjonsteknologi.',
    'information_control_concept',
    ['con_his_sensur', 'con_his_propaganda', 'con_his_registrering'],
    ['con_his_sikkerhetsstat'],
    'Å slutte fra et sensurvedtak til effektiv kontroll uten å undersøke håndheving, alternative kanaler, rykter, utenlandssendinger og mottakernes praksis.',
    ['regel eller kommandolinje for informasjon', 'kontroll over medier, post, radio eller arkiv', 'dokumentert håndheving og omgåelse'],
    ['sensurarkiv, presseinstrukser, beslag og overvåkingsrapporter', 'illegal presse, dagbøker, lytter- eller leserkilder som viser mottak og omgåelse']
  ),
  con_his_internering: C(
    'internering',
    'Internering er administrativ eller militær frihetsberøvelse uten ordinær straffedom, begrunnet i sikkerhet, krig, statsborgerskap eller gruppetilhørighet og gjennomført i bestemte institusjoner og tidsrom.',
    'administrative_detention_concept',
    ['con_his_fangenskap', 'con_his_fangeleirer', 'con_his_registrering'],
    ['con_his_fengsler'],
    'Å bruke internering og fengsling som synonymer uten å undersøke hjemmel, rettsstatus, prøvingsmulighet og hvilken myndighet som besluttet frihetsberøvelsen.',
    ['administrativt eller militært vedtak', 'fravær eller avgrensning av ordinær dom', 'identifisert leir, institusjon og varighet'],
    ['interneringsvedtak, registre, instrukser og korrespondanse', 'personmapper, klager og beretninger som dokumenterer faktisk status og forløp']
  ),
  con_his_kald: C(
    'kald krig',
    'Kald krig er en historisk konfliktorden preget av blokkdannelse, avskrekking, etterretning, ideologisk konkurranse, beredskap og stedfortrederkriger uten vedvarende direkte storkrig mellom hovedmaktene.',
    'cold_war_order_concept',
    ['con_his_sikkerhetsstat', 'con_his_beredskap', 'con_his_propaganda'],
    ['con_his_total_krig'],
    'Å bruke kald krig som én stabil global periode eller forklare all innenrikspolitisk kontroll med supermaktskonflikten uten nasjonal og lokal dokumentasjon.',
    ['blokk- og alliansetilknytning', 'avskrekking, beredskap og etterretning', 'ideologisk og informasjonsmessig konflikt'],
    ['regjerings-, forsvars-, diplomati- og etterretningskilder', 'åpne samfunnskilder og motpartsarkiver som kontrollerer offisielle trusselbilder']
  ),
  con_his_kollaborasjon: C(
    'kollaborasjon',
    'Kollaborasjon er politisk, administrativt, økonomisk eller militært samarbeid med en okkupasjonsmakt som bidrar til dens styring, ressursutnyttelse eller undertrykkelse utover ren tvangstilpasning.',
    'collaboration_concept',
    ['con_his_okkupasjon', 'con_his_samarbeid', 'con_his_landssvik'],
    ['con_his_tilpasning'],
    'Å stemple enhver handel, arbeidsutførelse eller kontakt under okkupasjon som kollaborasjon uten å undersøke grad av frivillighet, alternativ, formål og faktisk bidrag til okkupasjonsmakten.',
    ['dokumentert samhandling med okkupasjonsmakt', 'politisk, økonomisk eller militært bidrag', 'grad av initiativ, gevinst og tilgjengelige alternativer'],
    ['avtaler, medlemskap, regnskap, ordre og saksmapper', 'samtidige kontrollkilder som belyser tvang, motiv og konsekvens']
  ),
  con_his_krig: C(
    'krig',
    'Krig er organisert væpnet konflikt mellom stater eller andre politiske aktører, med mobilisering, kommandostrukturer, ressursbruk, vold og rettslige kategorier som påvirker både stridende og sivile.',
    'armed_conflict_concept',
    ['con_his_total_krig', 'con_his_vold', 'con_his_mobilisering'],
    ['con_his_okkupasjon'],
    'Å la en formell krigserklæring alene definere konfliktens start, slutt og geografiske omfang uten å rekonstruere faktisk vold, mobilisering og kontroll.',
    ['organiserte væpnede aktører og kommandolinjer', 'militære operasjoner og ressursmobilisering', 'dokumentert påvirkning på sivile og territorium'],
    ['militære ordre, operasjonslogger, tapstall og kart', 'sivile, diplomatiske og lokale kilder som kontrollerer militær dokumentasjon']
  ),
  con_his_krigsminne: C(
    'krigsminne',
    'Krigsminne er de skiftende individuelle og kollektive fortolkningene av krig gjennom erindringer, minnesteder, seremonier, undervisning, rettighetskrav og offentlig konflikt om hvem og hva som skal huskes.',
    'war_memory_concept',
    ['con_his_veteraner', 'con_his_ettervirkninger', 'con_his_etterkrig'],
    ['con_his_propaganda'],
    'Å bruke senere minnefortellinger som direkte bevis for hendelser uten å skille mellom erfaring, erindringstidspunkt, offentlig sjanger og senere politiske behov.',
    ['daterte minnefortellinger og markeringer', 'institusjoner eller aktører som former utvalget', 'endringer, konflikter og tausheter over tid'],
    ['memoarer, intervjuer, monument- og seremoniarkiver', 'samtidige hendelseskilder og konkurrerende minnefortellinger']
  ),
  con_his_landssvik: C(
    'landssvik',
    'Landssvik er en historisk og rettslig kategori for handlinger vurdert som illojale mot staten under krig eller okkupasjon, avgrenset gjennom lovgrunnlag, tiltalepraksis, dom og ettertidens fortolkning.',
    'treason_legal_concept',
    ['con_his_kollaborasjon', 'con_his_overgangsrettferdighet', 'con_his_samarbeid'],
    ['con_his_folkerett'],
    'Å bruke landssvik som en tidløs moralsk merkelapp eller likestille sosial fordømmelse med rettslig skyld uten å vise hjemmel, bevis og domspraksis.',
    ['gjeldende eller tilbakevirkende hjemmel', 'etterforskning, tiltale og dom', 'variasjon i reaksjon etter handlingstype og aktør'],
    ['lovforarbeid, politi- og påtalearkiv, dommer og benådning', 'kontrollkilder om faktisk handling, samtidens rettsforståelse og sosial reaksjon']
  ),
  con_his_mobilisering: C(
    'mobilisering',
    'Mobilisering er organisert omstilling av personell, økonomi, transport, produksjon og offentlig myndighet for krig, beredskap eller kollektiv innsats, fra innkalling til faktisk deployering og forsyning.',
    'war_mobilization_concept',
    ['con_his_krig', 'con_his_beredskap', 'con_his_total_krig'],
    ['con_his_motstand'],
    'Å likestille mobiliseringsordre med operativ styrke uten å dokumentere oppmøte, utrustning, transport, kommandolinjer og forsyningssituasjon.',
    ['innkalling og personelloversikt', 'materiell, transport og forsyning', 'operativ plassering og myndighetsfullmakter'],
    ['mobiliseringsplaner, ruller, transport- og forsyningsjournaler', 'avdelings-, kommune- og personkilder som viser faktisk gjennomføring']
  ),
  con_his_motstand: C(
    'motstand',
    'Motstand er handlinger som bevisst søker å hindre, undergrave eller delegitimere en okkupasjonsmakt eller autoritær kontroll, fra sivil ulydighet og informasjonsarbeid til sabotasje og væpnet kamp.',
    'resistance_action_concept',
    ['con_his_okkupasjon', 'con_his_samarbeid', 'con_his_grasoner'],
    ['con_his_kollaborasjon'],
    'Å klassifisere all regelbrudd, passivitet eller ettertidig selvframstilling som motstand uten å dokumentere hensikt, mål, organisering, risiko og virkning.',
    ['uttalt eller dokumenterbar motstandsintensjon', 'handling rettet mot kontroll, ressurser eller legitimitet', 'risiko, organisering og konsekvens'],
    ['illegale publikasjoner, nettverks-, politi- og militærarkiv', 'samtidige personkilder og motpartskilder som prøver hensikt og virkning']
  ),
  con_his_norge: C(
    'Norge som krigssamfunn',
    'Norge som krigssamfunn er en nasjonal analyseenhet for hvordan stat, regioner, økonomi, mobilisering, okkupasjon og sivilt hverdagsliv hang sammen og varierte innenfor landets grenser.',
    'national_wartime_society_concept',
    ['con_his_okkupasjonen', 'con_his_mobilisering', 'con_his_total_krig'],
    ['con_his_oslo'],
    'Å behandle Norge som én homogen erfaring og la nasjonale institusjonskilder representere kyst, innland, nordområder, minoriteter og ulike sosiale grupper uten kontroll.',
    ['nasjonal myndighets- og territorialramme', 'regionale forskjeller i kontroll, krig og forsyning', 'forbindelser mellom stat, lokalsamfunn og hushold'],
    ['nasjonale og regionale myndighets-, militær- og økonomikilder', 'lokale og gruppebaserte kontrollkilder som synliggjør geografisk og sosial variasjon']
  ),
  con_his_okkupasjon: C(
    'okkupasjon',
    'Okkupasjon er faktisk militær kontroll over fremmed territorium uten suveren overføring, utøvd gjennom kommandolinjer, administrasjon, politi, økonomisk utnyttelse og regulering av sivilt liv.',
    'military_occupation_concept',
    ['con_his_motstand', 'con_his_kollaborasjon', 'con_his_folkerett'],
    ['con_his_krig'],
    'Å bruke invasjon, anneksjon og okkupasjon som synonymer eller anta at kontrollen var like sterk i alle områder og perioder.',
    ['utenlandsk militær kontroll og kommandolinje', 'administrativ og politimessig myndighetsutøvelse', 'regulering av territorium, ressurser og sivile'],
    ['militære og sivile forordninger, kommandokilder og kart', 'lokale myndighets-, virksomhets- og personkilder som viser faktisk kontroll']
  ),
  con_his_okkupasjonen: C(
    'okkupasjonsperioden i Norge',
    'Okkupasjonsperioden i Norge er det daterte forløpet fra invasjon og etablert fremmed kontroll til frigjøring og maktoverføring, analysert gjennom skiftende faser, geografier og institusjoner.',
    'occupation_period_concept',
    ['con_his_norge', 'con_his_okkupasjon', 'con_his_etterkrig'],
    ['con_his_kald'],
    'Å behandle 1940–1945 som en uforanderlig blokk eller bruke frigjøringsdatoen som om alle kontroll-, forsynings- og voldssystemer opphørte samtidig.',
    ['invasjon og etablering av kontroll', 'daterte faser i styring, motstand og krigsforløp', 'frigjøring, kapitulasjon og maktoverføring'],
    ['militære og politiske kronologier, forordninger og situasjonsrapporter', 'regionale og lokale kilder som dokumenterer faseforskjeller og overganger']
  ),
  con_his_oslo: C(
    'Oslo under okkupasjon',
    'Oslo under okkupasjon er en urban analyseenhet for hvordan okkupasjonsmyndighet, sentraladministrasjon, fengsler, transport, propaganda, motstand og hverdagsliv ble konsentrert og romlig organisert i hovedstaden.',
    'occupied_city_concept',
    ['con_his_okkupasjon', 'con_his_informasjonskontroll', 'con_his_motstand'],
    ['con_his_norge'],
    'Å bruke hovedstadens institusjoner og synlige hendelser som representativ modell for hele landet eller anta at dagens minnesteder viser okkupasjonsbyens fulle geografi.',
    ['lokalisert okkupasjons- og statsadministrasjon', 'fengsler, transport- og kommunikasjonsknutepunkter', 'romlige mønstre i kontroll, motstand og sivilt liv'],
    ['historiske kart, adresse-, politi-, transport- og byarkiver', 'lokale person-, virksomhets- og nabolagskilder som kontrollerer institusjonsperspektivet']
  ),
  con_his_overgangsrettferdighet: C(
    'overgangsrettferdighet',
    'Overgangsrettferdighet er rettslige, administrative og politiske tiltak for å håndtere overgrep og samarbeid etter regimeskifte eller konflikt, som straff, oppreisning, sannhetsarbeid, tilbakeføring og institusjonsreform.',
    'transitional_justice_concept',
    ['con_his_landssvik', 'con_his_etterkrig', 'con_his_demokrati'],
    ['con_his_folkerett'],
    'Å måle overgangsrettferdighet bare i antall dommer eller anta at rettslig oppgjør, sosial forsoning, oppreisning og demokratisk stabilisering er samme prosess.',
    ['rettsoppgjør og administrative reaksjoner', 'oppreisning, tilbakeføring eller sannhetsarbeid', 'institusjonell reform og offentlig legitimering'],
    ['lover, dommer, kommisjons-, erstatnings- og forvaltningsarkiv', 'kilder fra ofre, tiltalte og berørte institusjoner som viser ulik virkning']
  ),
  con_his_propaganda: C(
    'propaganda',
    'Propaganda er strategisk utformet kommunikasjon som søker å forme oppfatninger, følelser og handlinger gjennom seleksjon, gjentakelse, symboler, fiendebilder og kontrollert distribusjon.',
    'propaganda_concept',
    ['con_his_sensur', 'con_his_informasjonskontroll', 'con_his_krigsminne'],
    ['con_his_informasjonskontroll'],
    'Å tolke propagandaens innhold som bevis på mottakernes tro eller atferd uten å undersøke rekkevidde, konkurrerende budskap, sosial situasjon og faktisk respons.',
    ['identifisert avsender, målgruppe og kanal', 'strategisk budskap, symbolbruk og gjentakelse', 'distribusjon, mottak og dokumentert respons'],
    ['originale medier, kampanjeplaner og distribusjonsdata', 'dagbøker, brev, opinions-, politi- eller publikumsdata som belyser mottak']
  ),
  con_his_registrering: C(
    'registrering',
    'Registrering er systematisk innsamling og ordning av opplysninger om personer, eiendom, tilhørighet eller aktivitet, slik at institusjoner kan identifisere, fordele, overvåke eller gripe inn.',
    'administrative_registration_concept',
    ['con_his_forfolgelse', 'con_his_internering', 'con_his_sikkerhetsstat'],
    ['con_his_sensur'],
    'Å behandle et register som en nøytral avspeiling av befolkningen uten å undersøke formål, kategorier, dekning, feil, oppdatering og senere bruk.',
    ['definert registreringsformål og kategori', 'ansvarlig institusjon og datainnsamling', 'kobling til kontroll, tildeling eller inngrep'],
    ['registerinstruks, skjema, database eller kartotek med proveniens', 'kontrollkilder om dekning, feil og hvordan registreringen faktisk ble brukt']
  ),
  con_his_samarbeid: C(
    'samarbeid under okkupasjon',
    'Samarbeid under okkupasjon er praktisk eller institusjonell samhandling mellom aktører med ulike maktposisjoner, og må analyseres etter formål, tvang, initiativ, gevinst og konsekvens før det klassifiseres politisk eller rettslig.',
    'occupation_cooperation_concept',
    ['con_his_tilpasning', 'con_his_kollaborasjon', 'con_his_grasoner'],
    ['con_his_motstand'],
    'Å bruke samarbeid som synonym for kollaborasjon eller som moralsk nøytral betegnelse uten å undersøke hvem samarbeidet styrket og hvilke alternativer som fantes.',
    ['identifiserte parter og maktforhold', 'konkret utveksling, oppgave eller avtale', 'grad av tvang, initiativ, gevinst og virkning'],
    ['avtaler, ordre, regnskap, møte- og saksarkiv', 'person- og motpartskilder som dokumenterer motiv, handlingsrom og konsekvens']
  ),
  con_his_sensur: C(
    'sensur',
    'Sensur er forhåndskontroll, endring, stans eller strafferettslig begrensning av ytringer og informasjon gjennom regler, sensurorganer og konkret håndheving.',
    'censorship_concept',
    ['con_his_propaganda', 'con_his_informasjonskontroll', 'con_his_sikkerhetsstat'],
    ['con_his_registrering'],
    'Å identifisere sensur bare ut fra fravær av publisering eller anta at en forbudsliste dokumenterer full håndheving og lydighet.',
    ['formell regel eller sensurinstans', 'inngrep i konkret tekst, bilde, sending eller kanal', 'sanksjon, beslag eller dokumentert selvsensur'],
    ['sensurvedtak, korrekturer, beslag og presseinstrukser', 'redaksjons-, forfatter- og publikumskilder som viser omgåelse og virkning']
  ),
  con_his_sikkerhetsstat: C(
    'sikkerhetsstat',
    'Sikkerhetsstat er en statsordning der beredskap, etterretning, overvåking, hemmelighold og utvidede fullmakter får varig betydning for institusjoner, rettigheter og politisk kontroll.',
    'security_state_concept',
    ['con_his_kald', 'con_his_beredskap', 'con_his_registrering'],
    ['con_his_total_krig'],
    'Å forklare enhver etterkrigsovervåking som en samlet sikkerhetsstat uten å dokumentere institusjonell samordning, fullmakter, målgrupper og varighet.',
    ['varige sikkerhets- og etterretningsinstitusjoner', 'utvidede fullmakter og hemmelighold', 'overvåking, registrering og politisk målretting'],
    ['lover, instrukser, budsjetter, kontroll- og etterretningsarkiv', 'parlamentariske, rettslige og berørte gruppers kilder som prøver offisiell begrunnelse']
  ),
  con_his_tilpasning: C(
    'tilpasning under okkupasjon',
    'Tilpasning under okkupasjon er endring av hverdagspraksis, arbeid eller institusjonell atferd for å håndtere knapphet, regler og risiko uten at handlingen nødvendigvis støtter eller motarbeider okkupasjonsmakten.',
    'occupation_adaptation_concept',
    ['con_his_samarbeid', 'con_his_grasoner', 'con_his_okkupasjon'],
    ['con_his_kollaborasjon'],
    'Å bruke tilpasning som automatisk frikjennelse eller som skjult anklage uten å dokumentere handlingsrom, tvang, gevinst, skade og endring over tid.',
    ['konkret endring i praksis eller ressursbruk', 'dokumentert regel, knapphet eller risiko', 'handlingsalternativer og virkninger for andre'],
    ['husholds-, virksomhets-, kommunale og reguleringskilder', 'samtidige person- og motpartskilder som synliggjør handlingsrom og konsekvens']
  ),
  con_his_total_krig: C(
    'total krig',
    'Total krig er en analytisk modell for konflikter der stat, økonomi, teknologi, propaganda og sivile ressurser mobiliseres i en slik bredde at skillet mellom front, produksjon og hverdagsliv svekkes.',
    'total_war_concept',
    ['con_his_krig', 'con_his_mobilisering', 'con_his_norge'],
    ['con_his_kald'],
    'Å kalle enhver omfattende krig total uten å undersøke mobiliseringsgrad, statlig kapasitet, sivile mål, økonomisk omstilling og geografiske forskjeller.',
    ['bred personell- og økonomimobilisering', 'sivil produksjon og infrastruktur integrert i krigføringen', 'propaganda, rasjonering og svekket skille mellom front og bakland'],
    ['mobiliserings-, produksjons-, forsynings- og budsjettkilder', 'husholds-, arbeidslivs- og lokale kilder som viser faktisk gjennomtrengning']
  ),
  con_his_tvang: C(
    'tvang',
    'Tvang er begrensning av handlingsvalg gjennom vold, trussel, frihetsberøvelse, rettslig sanksjon eller kontroll over nødvendige ressurser, vurdert ut fra aktørens faktiske alternativer.',
    'coercion_concept',
    ['con_his_vold', 'con_his_fangenskap', 'con_his_registrering'],
    ['con_his_tilpasning'],
    'Å redusere tvang til eksplisitt fysisk trussel eller motsatt anta at enhver asymmetrisk situasjon fjernet alt handlingsrom.',
    ['uttalt eller implisitt sanksjon', 'kontroll over kropp, bevegelse, arbeid eller livsnødvendige ressurser', 'dokumenterbart redusert handlingsalternativ'],
    ['ordre, regelverk, straffe- og arbeidsdokumenter', 'person- og vitnekilder som viser opplevde alternativer og faktisk håndheving']
  ),
  con_his_under: C(
    'under okkupasjon',
    'Under okkupasjon betegner en konkret historisk relasjon der sivile, institusjoner og territorier handler innenfor fremmed militær kontroll, skiftende regler og asymmetriske maktforhold.',
    'occupation_condition_concept',
    ['con_his_okkupasjon', 'con_his_okkupasjonen', 'con_his_norge'],
    ['con_his_etterkrig'],
    'Å bruke under okkupasjon som ren tidsangivelse uten å spesifisere hvilken myndighet, regel, geografisk kontroll og fase som formet den undersøkte handlingen.',
    ['datert fremmed kontroll', 'identifisert regel- og myndighetsstruktur', 'konkret virkning på aktørens handlingsrom'],
    ['forordninger, situasjonsrapporter og lokale forvaltningskilder', 'person-, virksomhets- og motstandskilder som viser faktisk maktforhold']
  ),
  con_his_veteraner: C(
    'veteraner',
    'Veteraner er tidligere militære eller motstandsaktive som etter tjenesten inngår i historisk skiftende ordninger for anerkjennelse, organisering, helse, pensjon, minne og politisk representasjon.',
    'veteran_status_concept',
    ['con_his_krigsminne', 'con_his_ettervirkninger', 'con_his_mobilisering'],
    ['con_his_motstand'],
    'Å behandle veteraner som én homogen erfaringsgruppe eller bruke senere status til å avgjøre hvem som faktisk tjenestegjorde, med hvilken rolle og under hvilke vilkår.',
    ['dokumentert tjeneste eller aktivitet', 'etterkrigsstatus, organisasjon eller ytelse', 'helse-, minne- eller representasjonskrav'],
    ['tjeneste-, medlems-, pensjons- og helsearkiv', 'intervjuer og samtidige personkilder kontrollert mot administrative registre']
  ),
  con_his_vold: C(
    'vold',
    'Vold er tilsiktet eller institusjonelt organisert bruk av fysisk skade, død eller kroppslig makt, analysert etter aktør, mål, situasjon, kommandoforhold, intensitet og virkning.',
    'violence_concept',
    ['con_his_krig', 'con_his_forfolgelse', 'con_his_tvang'],
    ['con_his_tvang'],
    'Å bruke vold som en udifferensiert samlebetegnelse uten å skille mellom kamp, henrettelse, tortur, mishandling, strukturell tvang og ulike bevisnivåer.',
    ['identifisert handling, aktør og mål', 'skadeform, våpen eller kroppslig makt', 'kommandoforhold, mønster og konsekvens'],
    ['medisinske, rettslige, militære og politimessige kilder', 'vitne-, offer- og gjerningspersonkilder triangulert mot materielle spor']
  )
};

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
  theory_his_okkupasjon_byrom_kontroll: {
    definition: 'Forklarer okkuperte byrom gjennom den romlige koblingen mellom militære hovedkvarter, administrasjon, politi, fengsler, transport, kommunikasjon, beslag og sivile bevegelsesmønstre, slik at formell myndighet kan skilles fra faktisk kontroll i ulike deler av byen.',
    limitations: [
      'Institusjonenes adresser dokumenterer ikke alene hvor kontrollen var sterkest; vakthold, patruljer, transport og siviles omgåelse må rekonstrueres.',
      'Hovedstaden kan overrepresentere sentraladministrasjon og synlige motstandshendelser og kan ikke uten videre brukes som modell for resten av landet.',
      'Dagens minnesteder og bevarte bygg er et selektivt utvalg og må kontrolleres mot samtidige kart, riving, ombruk og glemte steder.'
    ]
  },
  theory_his_krig_okkupasjon_okkupasjon_og_motstand: {
    definition: 'Analyserer okkupasjon og motstand som et asymmetrisk forhold mellom fremmed militærmakt, norsk forvaltning, sivile institusjoner og organiserte eller uorganiserte motstandsaktører, med vekt på hvordan kontroll, informasjon, ressurser og risiko endret seg gjennom forløpet.',
    limitations: [
      'Motstand kan ikke identifiseres bare ut fra senere medlemskap eller selvframstilling; samtidige handlinger, hensikt og virkning må dokumenteres.',
      'Okkupasjons- og politiarkiver overrepresenterer oppdagede nettverk, mens vellykket hemmelighold og hverdagsmotstand ofte etterlater svakere spor.',
      'Modellen må skille mellom nasjonal strategi, lokale nettverk og individuelle valg og kan ikke gjøre motstanden mer samlet enn kildene tillater.'
    ]
  },
  theory_his_krig_okkupasjon_rettsoppgjor_og_etterkrig: {
    definition: 'Forklarer overgangen fra okkupasjon til etterkrigsorden gjennom maktoverføring, lovgivning, etterforskning, rettsoppgjør, benådning, gjenoppbygging og demokratisk legitimering, og undersøker både institusjonell kontinuitet og konflikt om skyld og medlemskap.',
    limitations: [
      'Dommer dokumenterer rettslig avgjørelse, ikke hele handlingsforløpet, sosial skyld eller senere rehabilitering.',
      'Rettsoppgjørets lovgrunnlag må vurderes mot samtidens konstitusjonelle og folkerettslige debatt uten å bruke senere rett som automatisk fasit.',
      'Nasjonale tall kan skjule forskjeller i tiltalepraksis, kjønn, klasse, region og type samarbeid og må brytes ned før årsaker forklares.'
    ]
  },
  theory_his_krig_okkupasjon_okkupasjon_samarbeid_tilpasning_og_motstand: {
    definition: 'Analyserer handlinger under okkupasjon langs flere dimensjoner — tvang, initiativ, formål, gevinst, skade, organisering og endring over tid — for å skille praktisk tilpasning, samarbeid, kollaborasjon og motstand uten å redusere dem til én moralsk skala.',
    limitations: [
      'Samme aktør kan skifte praksis eller kombinere samarbeid og motstand; én etikett kan derfor ikke erstatte kronologisk rekonstruksjon.',
      'Økonomisk eller administrativ samhandling må vurderes mot konkrete alternativer og konsekvenser, ikke bare mot etterkrigstidens kategorier.',
      'Mangel på dokumentert motstand beviser ikke støtte, mens påberopt tvang må prøves mot tilgjengelig handlingsrom og faktisk fordel.'
    ]
  },
  theory_his_krig_okkupasjon_propaganda_sensur_og_informasjonskontroll: {
    definition: 'Forklarer informasjonsmakt gjennom samspillet mellom propaganda, sensur, medieeierskap, radio- og postkontroll, overvåking, illegal presse og publikums aktive tolkning, slik at budskapets produksjon, rekkevidde og mottak analyseres separat.',
    limitations: [
      'Eksponering for propaganda er ikke bevis på overbevisning eller handling; mottak må dokumenteres gjennom flere samtidige kildetyper.',
      'Sensurarkiver viser særlig inngrep som ble registrert og kan undervurdere selvsensur, muntlig kommunikasjon og vellykket omgåelse.',
      'Illegal presses opplag og senere symbolstatus må ikke uten videre brukes som mål på faktisk lesing, representativitet eller politisk virkning.'
    ]
  },
  theory_his_krig_okkupasjon_fangenskap_vold_og_forfolgelse: {
    definition: 'Analyserer fangenskap, vold og forfølgelse som sammenkoblede institusjonelle forløp fra kategorisering og arrestasjon via avhør, fengsel, leir, transport og tvangsarbeid til løslatelse, deportasjon eller død, med tydelig skille mellom rettsstatus og faktisk behandling.',
    limitations: [
      'Fange- og transportregistre kan være ufullstendige, dupliserte eller produsert av gjerningsinstitusjoner og må trianguleres mot person- og lokalkilder.',
      'Juridiske kategorier som krigsfange, internert og straffange beskriver ikke nødvendigvis de faktiske levevilkårene eller voldsnivået.',
      'Overlevendes kilder er avgjørende, men overlevelses- og intervjutidspunkt kan påvirke hvilke erfaringer som er dokumentert.'
    ]
  },
  theory_his_krig_okkupasjon_folkerett_rettsoppgjor_og_overgangsrettferdighet: {
    definition: 'Undersøker forholdet mellom samtidens folkerett, okkupasjonsrett, nasjonal strafferett og etterkrigstidens overgangsrettferdighet, fra normenes gyldighet og håndheving til dom, oppreisning, tilbakeføring og institusjonell reform.',
    limitations: [
      'Senere konvensjoner og rettsutvikling kan belyse, men ikke uten videre avgjøre, hvilke regler og ansvarskategorier som gjaldt på handlingstidspunktet.',
      'Normbrudd må skilles fra håndhevingssvikt; fravær av dom eller protest beviser ikke at handlingen var lovlig.',
      'Straff, oppreisning, sannhetsarbeid og forsoning har ulike mål og virkning og kan ikke måles med samme resultatindikator.'
    ]
  },
  theory_his_krig_okkupasjon_krigsminne_veteraner_og_ettervirkninger: {
    definition: 'Analyserer hvordan veteranstatus, helse, erstatning, organisasjoner, memoarer, minnesteder og offentlige markeringer former krigens ettervirkninger og konkurrerende fortellinger om innsats, offer, skyld og nasjonalt fellesskap.',
    limitations: [
      'Senere minnefortellinger må dateres og sjangerbestemmes og kan ikke brukes som uformidlet dokumentasjon av hendelser.',
      'Offisiell veteranstatus og støtteordninger kan ekskludere grupper som deltok eller ble rammet, og må sammenholdes med faktisk tjeneste og erfaring.',
      'Synlige monumenter og jubileer overrepresenterer institusjonelt anerkjente minner og må balanseres mot taushet, konflikt og fravær.'
    ]
  },
  theory_his_krig_okkupasjon_motstand_samarbeid_tilpasning_og_grasoner: {
    definition: 'Bruker mikrohistorisk rekonstruksjon til å analysere gråsoner mellom motstand, samarbeid og tilpasning gjennom konkrete aktørers relasjoner, informasjon, risiko, ressurser og skiftende valg, uten å oppheve forskjellen mellom tvang og frivillig bidrag.',
    limitations: [
      'Gråsonebegrepet må ikke bli en restkategori som gjør dokumentert ansvar eller skade analytisk usynlig.',
      'Et individuelt forløp kan vise muligheter og mekanismer, men er ikke uten videre representativt for en organisasjon eller befolkning.',
      'Etterkrigsforklaringer om motiv må prøves mot samtidige handlinger, fordeler, nettverk og alternativer.'
    ]
  },
  theory_his_krig_okkupasjon_kald_krig_beredskap_og_sikkerhetsstat: {
    definition: 'Forklarer etterkrigstidens beredskap og sikkerhetsstat gjennom trusseloppfatning, allianser, sivilforsvar, militær planlegging, etterretning, registrering og politisk overvåking, og undersøker hvordan midlertidige krisetiltak kunne bli varige institusjoner.',
    limitations: [
      'Offisielle trusselvurderinger er strategiske dokumenter og må ikke behandles som nøytrale mål på faktisk fare.',
      'Sikkerhetsarkiver er selektive, graderte og produsert av kontrollerende institusjoner; målgruppenes handlinger og erfaringer krever egne kilder.',
      'Beredskap, etterretning og ulovlig eller politisert overvåking må skilles institusjonelt og rettslig før sikkerhetsstat konkluderes.'
    ]
  }
};

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

run('krig-okkupasjon-motstand-domain-validation.log', process.execPath, ['tools/validate-historie-domain.mjs', domainId]);
run('krig-okkupasjon-motstand-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('krig-okkupasjon-motstand-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('krig-okkupasjon-motstand-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('krig-okkupasjon-motstand-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('krig-okkupasjon-motstand-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('krig-okkupasjon-motstand-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('krig-okkupasjon-motstand-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);

const readiness = readJson(path.join(reportDir, 'historie-v5-5-readiness.json'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain?.freeze_ready) {
  throw new Error(`${domainId} did not become freeze_ready: ${JSON.stringify(domain)}`);
}

const index = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concepts: curatedConceptIndex,
  curated_theory_ids: Object.keys(theorySpecs)
};
writeJson(path.join(reportDir, 'krig-okkupasjon-motstand-curation-index.json'), index);

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
writeJson(path.join(reportDir, 'krig-okkupasjon-motstand-curation-readiness.json'), summary);
fs.rmSync(inventoryPath, { force: true });
console.log(JSON.stringify(summary, null, 2));
