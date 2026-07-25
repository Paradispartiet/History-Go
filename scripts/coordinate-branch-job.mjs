#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_byhistorie_stedsendring';
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

fs.mkdirSync(reportDir, {recursive: true});

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
  con_his_bevaring: C(
    'bevaring',
    'Bevaring er tiltak og beslutninger som opprettholder et historisk miljø, byggverk, anlegg eller spor slik at vesentlige materielle og historiske egenskaper kan følges over tid.',
    'heritage_preservation_concept',
    ['con_his_vern', 'con_his_kulturmiljo', 'con_his_ombruk'],
    ['con_his_riving'],
    'Å kalle et miljø bevart bare fordi enkelte fasader står igjen, uten å undersøke materialtap, flytting, funksjonsskifte og hvilke historiske sammenhenger som er brutt.',
    ['dokumentert kontinuitet i materiale eller struktur', 'vedtak eller praksis som begrenser endring', 'sporbar tilstand før og etter tiltak'],
    ['vernedokument, bygningsundersøkelse eller samtidig foto som viser hva som faktisk ble bevart', 'kontrollkilde som skiller juridisk status fra materiell tilstand']
  ),
  con_his_boligregimer: C(
    'boligregimer',
    'Boligregimer er historiske kombinasjoner av eierskap, leieformer, finansiering, regulering, boligpolitikk og sosial fordeling som bestemmer hvem som kan bo hvor og på hvilke vilkår.',
    'housing_regime_concept',
    ['con_his_eiendom', 'con_his_boligstandard', 'con_his_tomtemarkeder'],
    ['con_his_urban_morfologi'],
    'Å forklare et boligområde utelukkende med hustype eller arkitektur uten å dokumentere eierskap, pris, leievilkår, tildeling og offentlig regulering.',
    ['eier- og leiestruktur', 'finansierings- og tildelingsordninger', 'regler for bygging, bruk og omsetning'],
    ['matrikkel, leiekontrakter, boligstatistikk eller kommunale vedtak', 'kilde som viser faktisk bosetting og ikke bare planlagt målgruppe']
  ),
  con_his_boligstandard: C(
    'boligstandard',
    'Boligstandard beskriver historisk målbare kvaliteter ved boliger, som areal, lys, ventilasjon, sanitærforhold, oppvarming, tetthet og teknisk sikkerhet, vurdert mot samtidens normer og levekår.',
    'housing_standard_concept',
    ['con_his_boligregimer', 'con_his_rehabilitering', 'con_his_byfornyelse'],
    ['con_his_tomtemarkeder'],
    'Å bruke dagens komfortkrav som målestokk for eldre boliger eller anta at teknisk oppgradering automatisk ga bedre økonomisk og sosial tilgjengelighet.',
    ['sanitær- og forsyningsløsninger', 'personer eller hushold per rom', 'daterte bygnings- og helsekrav'],
    ['takst, boligtilsyn, folketelling eller bygningsbeskrivelse fra den undersøkte perioden', 'kontrollkilde som viser brukernes faktiske boforhold']
  ),
  con_his_byfornyelse: C(
    'byfornyelse',
    'Byfornyelse er samordnede inngrep som oppgraderer eksisterende byområder gjennom rehabilitering, infrastruktur, boligtiltak, eiendomsendringer og nye offentlige krav, uten nødvendigvis å rive hele området.',
    'urban_renewal_concept',
    ['con_his_rehabilitering', 'con_his_boligstandard', 'con_his_sanering'],
    ['con_his_gentrifisering'],
    'Å behandle all fysisk oppussing som byfornyelse eller likestille kommunale mål med gjennomførte forbedringer og fordelingsvirkninger.',
    ['samordnet program eller offentlig virkemiddel', 'målbar oppgradering av bygninger og tekniske systemer', 'endringer i beboersammensetning eller kostnader'],
    ['programdokument, budsjett, byggesak og gjennomføringsoversikt', 'beboer-, pris- eller flyttedata som viser hvem som fikk nytte eller belastning']
  ),
  con_his_bygrense: C(
    'bygrense',
    'Bygrense er en datert juridisk eller administrativ avgrensning av byens myndighetsområde, og må skilles fra den sammenhengende bebyggelsens faktiske utstrekning.',
    'administrative_boundary_concept',
    ['con_his_innlemmelse', 'con_his_byutvidelse', 'con_his_grenser'],
    ['con_his_urbanisering'],
    'Å lese en administrativ grense på ett kart som om den også viser hvor byen faktisk sluttet sosialt, økonomisk og fysisk.',
    ['datert grensevedtak', 'kartfestet jurisdiksjon', 'endret skatte-, politi- eller planmyndighet'],
    ['lov, kongelig resolusjon eller kommunalt grensevedtak', 'samtidig kart som kan sammenholdes med bebyggelse og funksjoner']
  ),
  con_his_byutvidelse: C(
    'byutvidelse',
    'Byutvidelse er historisk vekst i byens territorium, bebyggelse eller funksjonelle rekkevidde gjennom innlemmelse, utbygging, transportforbindelser og nye tekniske eller økonomiske nettverk.',
    'urban_expansion_concept',
    ['con_his_innlemmelse', 'con_his_urbanisering', 'con_his_forstad'],
    ['con_his_gentrifisering'],
    'Å anta at en formell innlemmelse straks skapte tett by eller at all befolkningsvekst skyldtes geografisk utvidelse.',
    ['utvidet administrativt område', 'ny sammenhengende bebyggelse', 'utvidede transport- og forsyningsnett'],
    ['sammenlignbare historiske kart og grensekilder', 'befolknings-, bygge- eller infrastrukturtall for minst to tidspunkter']
  ),
  con_his_eiendom: C(
    'eiendom',
    'Eiendom er historisk regulerte rettigheter til å eie, bruke, leie ut, overføre, arve og kontrollere jord, bolig, bygg og andre ressurser, slik rettighetene faktisk ble praktisert.',
    'property_relations_concept',
    ['con_his_tomtemarkeder', 'con_his_ekspropriasjon', 'con_his_boligregimer'],
    ['con_his_tilgang'],
    'Å redusere eiendom til registrert eiernavn uten å undersøke bruksrett, leie, heftelser, husholdsposisjon og offentlig regulering.',
    ['registrert eller dokumentert rettighetshaver', 'overføring, leie eller pant', 'konkret kontroll over bruk og avkastning'],
    ['matrikkel, skjøte, kontrakt, skifte eller rettsprotokoll', 'kilde som viser praktisk disposisjon i tillegg til formell tittel']
  ),
  con_his_ekspropriasjon: C(
    'ekspropriasjon',
    'Ekspropriasjon er offentlig tvangserverv av grunn eller rettigheter for et bestemt formål, gjennom en datert hjemmel, prosess, verdsetting og kompensasjon.',
    'compulsory_acquisition_concept',
    ['con_his_planmakt', 'con_his_eiendom', 'con_his_byfornyelse'],
    ['con_his_tomtemarkeder'],
    'Å bruke ekspropriasjon som synonym for enhver offentlig overtakelse eller anta at vedtaket alene viser når eiendommen faktisk ble overtatt og tiltaket gjennomført.',
    ['hjemmel og vedtak', 'identifisert eiendom eller rettighet', 'takst, kompensasjon og overtakelsesdato'],
    ['ekspropriasjonsvedtak, skjønn, kart og eiendomsprotokoll', 'gjennomføringskilde som viser faktisk overtakelse og arealbruk']
  ),
  con_his_ettertilstand: C(
    'ettertilstand',
    'Ettertilstand er den dokumenterte fysiske, funksjonelle, juridiske, økonomiske og sosiale situasjonen på et avgrenset sted etter et definert inngrep eller endringsforløp.',
    'before_after_analysis_concept',
    ['con_his_fortilstand', 'con_his_materialitet', 'con_his_urban_morfologi'],
    ['con_his_planmakt'],
    'Å velge et tilfeldig nyere bilde som ettertilstand uten å angi dato, avgrensning og om de sammenlignede kildene måler det samme.',
    ['eksplisitt sluttdato eller observasjonstidspunkt', 'samme romlige enhet som førtilstanden', 'målbare endringer i bruk, form eller befolkning'],
    ['sammenlignbar kart-, foto-, register- eller bygningskilde', 'kilde som dokumenterer gjennomføring og ikke bare planintensjon']
  ),
  con_his_flytting: C(
    'flytting',
    'Flytting er dokumentert endring av bosted, virksomhet, monument, bygg eller funksjon fra ett identifisert sted til et annet, frivillig eller under økonomisk, juridisk eller fysisk press.',
    'relocation_concept',
    ['con_his_fortrengning', 'con_his_riving', 'con_his_gentrifisering'],
    ['con_his_innlemmelse'],
    'Å tolke fravær fra en senere kilde som bevis på flytting uten å identifisere målsted, tidspunkt eller om aktøren ble nedlagt, registrert annerledes eller faktisk fortrengt.',
    ['datert avreise og nytt sted', 'identifiserbar person, virksomhet eller fysisk objekt', 'frivillig, pålagt eller prisdrevet årsak'],
    ['flyttemelding, adressebok, folkeregister, bedriftsregister eller transportdokument', 'kontrollkilde for målsted og årsak']
  ),
  con_his_forstad: C(
    'forstad',
    'Forstad er et historisk bosettings- og funksjonsområde utenfor den samtidige bykjernen, knyttet til byen gjennom arbeid, handel, transport og tjenester, men med varierende administrativ status.',
    'suburban_settlement_concept',
    ['con_his_sentrum', 'con_his_periferi', 'con_his_urbanisering'],
    ['con_his_bygrense'],
    'Å bruke forstad som tidløs betegnelse for alt utenfor sentrum eller anta at området manglet egen næring, institusjoner og lokal identitet.',
    ['pendlings- eller transportforbindelse', 'bolig- og funksjonsvekst utenfor kjernen', 'egen eller delt administrativ tilknytning'],
    ['historisk kart, folketelling og transportkilde', 'lokal kilde som viser områdets egne funksjoner og relasjon til byen']
  ),
  con_his_fortilstand: C(
    'førtilstand',
    'Førtilstand er den dokumenterte situasjonen på et avgrenset sted før et bestemt vedtak, inngrep eller endringsforløp, målt med kilder som kan sammenlignes med ettertilstanden.',
    'before_after_analysis_concept',
    ['con_his_ettertilstand', 'con_his_materialitet', 'con_his_urban_morfologi'],
    ['con_his_planmakt'],
    'Å rekonstruere førtilstanden fra nostalgiske ettertidsfortellinger alene eller sammenligne ulike geografiske utsnitt og registreringsmåter.',
    ['eksplisitt startdato', 'avgrenset sted og funksjon', 'dokumentert bebyggelse, bruk, eierskap eller befolkning'],
    ['samtidig kart, foto, takst, telling eller virksomhetsregister', 'uavhengig kontrollkilde som avdekker mangler i hovedkilden']
  ),
  con_his_fortrengning: C(
    'fortrengning',
    'Fortrengning er tap av faktisk mulighet til å bo, arbeide, drive virksomhet eller bruke et sted som følge av riving, prisvekst, regulering, kontraktsendring eller sosial eksklusjon.',
    'displacement_concept',
    ['con_his_gentrifisering', 'con_his_sanering', 'con_his_flytting'],
    ['con_his_byutvidelse'],
    'Å slutte fra prisvekst eller befolkningsendring alene til fortrengning uten å dokumentere hvem som mistet tilgang, når og gjennom hvilken mekanisme.',
    ['oppsigelse, utflytting eller bortfall av virksomhet', 'økte kostnader eller endrede adgangsvilkår', 'identifiserbar berørt gruppe'],
    ['adresse-, leie-, pris- eller virksomhetsdata over tid', 'intervju, protokoll eller sakskilde som dokumenterer årsaken til tap av sted']
  ),
  con_his_gatenett: C(
    'gatenett',
    'Gatenett er det historisk utviklede systemet av gater, forbindelser, kryss, hierarkier og stengninger som organiserer ferdsel, tomter, adresser og tilgang i byen.',
    'street_network_concept',
    ['con_his_tomtestruktur', 'con_his_transport', 'con_his_urban_morfologi'],
    ['con_his_bygrense'],
    'Å tilskrive hele dagens gatenett én plan eller periode uten å skille eldre traseer, senere gjennombrudd, navneendringer og bortfalte forbindelser.',
    ['daterte traseer og kryss', 'gatebredde og hierarki', 'nye, flyttede eller stengte forbindelser'],
    ['sammenlignbare bykart, reguleringsplaner og oppmålingsdata', 'felt- eller arkivkilde som kan datere gjennomføring']
  ),
  con_his_gentrifisering: C(
    'gentrifisering',
    'Gentrifisering er en historisk prosess der investering, eiendomsverdi, virksomhetsmiks og befolkningssammensetning endres slik at et område får høyere status og svakere gruppers tilgang presses.',
    'gentrification_concept',
    ['con_his_tomtemarkeder', 'con_his_fortrengning', 'con_his_klasse'],
    ['con_his_byfornyelse'],
    'Å bruke gentrifisering om enhver oppgradering, ny kafé eller prisøkning uten tidsserie for kapital, befolkning, virksomheter og mulig fortrengning.',
    ['økende salgs- eller leieverdier', 'endret inntekts-, yrkes- eller eierprofil', 'utskifting av virksomheter og brukere'],
    ['pris-, eiendoms-, folketellings- og virksomhetsdata fra flere tidspunkter', 'kvalitativ kilde som dokumenterer lokale erfaringer og fortrengningsmekanismer']
  ),
  con_his_grenser: C(
    'administrative og romlige grenser',
    'Grenser er historisk produserte skiller som fordeler jurisdiksjon, eierskap, ferdsel, adgang eller sosial tilhørighet mellom områder og grupper.',
    'boundary_concept',
    ['con_his_bygrense', 'con_his_tilgang', 'con_his_segregasjon'],
    ['con_his_gatenett'],
    'Å behandle en synlig kant, vei eller administrativ linje som samme type grense uten å undersøke hvilken rett, praksis eller sosial virkning den faktisk bar.',
    ['kartfestet eller beskrevet avgrensning', 'forskjell i regel, bruk eller adgang på hver side', 'aktører som håndhever eller utfordrer skillet'],
    ['datert kart, vedtak, kontrakt eller ordensregel', 'brukskilde som viser om grensen faktisk virket i hverdagen']
  ),
  con_his_infrastrukturer: C(
    'urban infrastruktur',
    'Urban infrastruktur er sammenkoblede tekniske og organisatoriske systemer for transport, vann, avløp, energi, kommunikasjon og avfall som muliggjør og styrer byens vekst og hverdagsliv.',
    'urban_infrastructure_concept',
    ['con_his_transport', 'con_his_tekniske', 'con_his_urban_morfologi'],
    ['con_his_gatenett'],
    'Å beskrive infrastruktur som nøytral teknikk uten å undersøke finansiering, geografisk dekning, tilgang, vedlikehold og hvilke områder som ble prioritert eller utelatt.',
    ['nettverk, knutepunkt og kapasitet', 'utbyggings- og tilkoblingsdatoer', 'forskjeller i dekning og adgang'],
    ['tekniske planer, driftsarkiv, budsjett og kart', 'kilde om faktisk levering, feil, bruk og sosial fordeling']
  ),
  con_his_innlemmelse: C(
    'innlemmelse',
    'Innlemmelse er en formell endring der et område overføres til en bykommune eller annen administrativ enhet, med nye grenser, myndighetsforhold og ofte endrede skatter og tjenester.',
    'municipal_annexation_concept',
    ['con_his_bygrense', 'con_his_byutvidelse', 'con_his_kommunal'],
    ['con_his_urbanisering'],
    'Å anta at innlemmelse betyr at området straks fikk tett bebyggelse, lik tjenestedekning eller samme lokale identitet som den eldre byen.',
    ['formelt vedtak og ikrafttredelsesdato', 'overført areal og befolkning', 'endret kommunal myndighet og tjenesteansvar'],
    ['lov, resolusjon, kommunestyresak og grensekart', 'kilde som viser praktiske følger etter ikrafttredelsen']
  ),
  con_his_klasse: C(
    'sosial klasse',
    'Sosial klasse er historisk ulikhet i kontroll over arbeid, inntekt, eiendom, utdanning og institusjonell makt, slik ulikheten påvirker bosted, mobilitet og bruk av byen.',
    'social_class_concept',
    ['con_his_segregasjon', 'con_his_gentrifisering', 'con_his_tilgang'],
    ['con_his_boligstandard'],
    'Å tilordne klasse direkte fra adresse, hustype eller yrkestittel uten å undersøke hushold, inntekt, eierskap, arbeidsrelasjon og endring over tid.',
    ['yrke, inntekt og eierskap', 'bolig- og utdanningsmønstre', 'ulik tilgang til ressurser og beslutninger'],
    ['folketelling, skatt, lønn, eiendom og husholdsdata', 'kvalitativ kilde som viser levd posisjon og lokale klassifikasjoner']
  ),
  con_his_kommunal: C(
    'kommunal forvaltning',
    'Kommunal forvaltning er bykommunens historiske organisering av planlegging, byggesaker, tjenester, eiendom, finansiering og gjennomføring gjennom folkevalgte organer og administrasjon.',
    'municipal_governance_concept',
    ['con_his_planmakt', 'con_his_politisk', 'con_his_byfornyelse'],
    ['con_his_eiendom'],
    'Å omtale kommunen som én samlet aktør uten å skille politiske vedtak, administrativ utredning, etater, budsjett og faktisk gjennomføring.',
    ['identifiserte organer og kompetanse', 'saksflyt fra forslag til vedtak', 'budsjett, utførelse og kontroll'],
    ['møtebok, innstilling, etatsarkiv og budsjett', 'gjennomføringskilde som viser hva som faktisk ble gjort']
  ),
  con_his_konflikt: C(
    'romlig konflikt',
    'Romlig konflikt er dokumentert strid om bruk, eierskap, tilgang, representasjon eller fordeling av et avgrenset sted mellom identifiserbare aktører med ulike ressurser og mål.',
    'spatial_conflict_concept',
    ['con_his_tilgang', 'con_his_offentlig_rom', 'con_his_planmakt'],
    ['con_his_grenser'],
    'Å kalle enhver meningsforskjell konflikt uten å vise partene, stridens gjenstand, handlingene, maktforholdet og det historiske utfallet.',
    ['navngitte parter og krav', 'protest, forhandling, rettssak eller håndheving', 'konkret omstridt areal eller funksjon'],
    ['saksdokument, avis, organisasjonsarkiv eller rettskilde', 'kilde fra mer enn én part eller en uavhengig kontrollkilde']
  ),
  con_his_kulturmiljo: C(
    'kulturmiljø',
    'Kulturmiljø er et geografisk område der bygg, anlegg, landskap, bruk og historiske relasjoner danner en sammenheng som ikke kan forstås gjennom enkeltobjekter alene.',
    'cultural_environment_concept',
    ['con_his_bevaring', 'con_his_vern', 'con_his_materialitet'],
    ['con_his_offentlig_rom'],
    'Å bruke kulturmiljø som estetisk kvalitetsstempel uten å avgrense området, datere lagene og dokumentere relasjonene mellom objekter, bruk og landskap.',
    ['sammenhengende historiske strukturer', 'lesbare tidslag og funksjonsforbindelser', 'avgrenset geografisk helhet'],
    ['kulturmiljøregistrering, historisk kart og bygningsdokumentasjon', 'brukshistorie eller feltkilde som viser sammenhengen mellom elementene']
  ),
  con_his_materialitet: C(
    'stedets materialitet',
    'Stedets materialitet er de fysiske egenskapene, byggematerialene, strukturene, slitasjesporene og ombyggingene som bærer informasjon om produksjon, bruk og endring.',
    'materiality_concept',
    ['con_his_kulturmiljo', 'con_his_urban_morfologi', 'con_his_fortilstand'],
    ['con_his_politisk'],
    'Å lese et fysisk spor som direkte bevis for én bestemt hendelse eller bruk uten datering, stratigrafi og kontroll mot skriftlige eller visuelle kilder.',
    ['materialtype og konstruksjon', 'spor etter ombygging, slitasje eller reparasjon', 'plassering i en datert fysisk sammenheng'],
    ['bygningsundersøkelse, foto, tegning eller arkeologisk dokumentasjon', 'kontrollkilde som kan datere og tolke sporet']
  ),
  con_his_modernisme: C(
    'modernistisk byplanlegging',
    'Modernistisk byplanlegging er en historisk plantradisjon som søkte funksjonsdeling, standardisering, lys, luft, trafikkseparasjon og storskala omforming gjennom ekspertstyrte planer.',
    'planning_tradition_concept',
    ['con_his_sanering', 'con_his_gatenett', 'con_his_tekniske'],
    ['con_his_urban_morfologi'],
    'Å kalle alle etterkrigsbygg eller store prosjekter modernistiske uten å dokumentere planprinsipper, aktører, program og faktisk gjennomført form.',
    ['funksjonsseparasjon og standardisering', 'storskala plan- eller utbyggingsenhet', 'prioritering av trafikk, lys og grønt'],
    ['planbeskrivelse, arkitekttegning, fagdebatt og vedtak', 'felt- eller kartkilde som viser hvilke prinsipper som faktisk ble realisert']
  ),
  con_his_offentlig_rom: C(
    'offentlig rom',
    'Offentlig rom er et byrom med rettslig eller praktisk allmenn tilgjengelighet der ferdsel, opphold, handel, protest og sosial kontroll organiseres gjennom regler, utforming og bruk.',
    'public_space_concept',
    ['con_his_tilgang', 'con_his_konflikt', 'con_his_planmakt'],
    ['con_his_eiendom'],
    'Å anta at offentlig eierskap gir lik faktisk tilgang, eller at et privat eid rom ikke kan ha offentlig funksjon og regulert allmenn bruk.',
    ['allmenn ferdsel eller opphold', 'regler for bruk og håndheving', 'mangfold eller konflikt mellom brukergrupper'],
    ['eierskaps- og reguleringskilde, ordensregler og plan', 'observasjon, foto, politi- eller brukerdata som viser praktisk tilgang']
  ),
  con_his_ombruk: C(
    'ombruk',
    'Ombruk er videre bruk av et eksisterende bygg, anlegg, materiale eller område til en ny eller endret funksjon, med varierende grad av fysisk og historisk kontinuitet.',
    'adaptive_reuse_concept',
    ['con_his_bevaring', 'con_his_rehabilitering', 'con_his_kulturmiljo'],
    ['con_his_riving'],
    'Å likestille ny funksjon i gammel fasade med full historisk kontinuitet uten å undersøke hvilke strukturer, arbeidsformer og brukergrupper som forsvant.',
    ['bevart fysisk struktur', 'dokumentert tidligere og ny funksjon', 'ombygging og ny adgang eller brukergruppe'],
    ['byggesak, tegning, virksomhetsregister og foto før og etter', 'kilde som dokumenterer tapte så vel som videreførte elementer']
  ),
  con_his_periferi: C(
    'periferi',
    'Periferi er en relasjonell posisjon med svakere tilgang til sentrale arbeidsplasser, tjenester, transport, investering eller beslutningsmakt i en bestemt historisk bystruktur.',
    'centre_periphery_concept',
    ['con_his_sentrum', 'con_his_forstad', 'con_his_transport'],
    ['con_his_bygrense'],
    'Å definere periferi bare som fysisk avstand fra sentrum uten å måle forbindelser, funksjoner, investering og politisk eller økonomisk avhengighet.',
    ['reisetid og nettverkstilknytning', 'fordeling av tjenester og investering', 'avhengighet av sentrale funksjoner'],
    ['transportkart, tjenesteoversikt, budsjett og arbeidsreisedata', 'lokal kilde som viser hvordan posisjonen ble erfart og endret']
  ),
  con_his_planmakt: C(
    'planmakt',
    'Planmakt er institusjonell kapasitet til å definere arealbruk, byggevolum, forbindelser, vern, ekspropriasjon og gjennomføringsrekkefølge gjennom planer, vedtak og kontroll.',
    'planning_power_concept',
    ['con_his_politisk', 'con_his_kommunal', 'con_his_ekspropriasjon'],
    ['con_his_tomtemarkeder'],
    'Å behandle vedtatt plan som ferdig virkelighet eller overse at grunneiere, finansiering, klager, etater og uformell praksis kan endre utfallet.',
    ['formell kompetanse og planvedtak', 'kontroll over tillatelser og rekkefølge', 'sanksjon, oppkjøp eller ekspropriasjon'],
    ['plan, saksframstilling, vedtak og byggesak', 'gjennomførings- og konfliktkilde som viser planens faktiske virkning']
  ),
  con_his_politisk: C(
    'politisk beslutning',
    'Politisk beslutning er et datert valg mellom handlingsalternativer gjort av et legitimert organ eller en mobilisert maktkoalisjon, med identifiserbare begrunnelser, motstand og konsekvenser.',
    'political_decision_concept',
    ['con_his_planmakt', 'con_his_kommunal', 'con_his_konflikt'],
    ['con_his_tekniske'],
    'Å forklare et byinngrep som politisk bare fordi kommunen var involvert, uten å identifisere beslutningsorgan, alternativer, flertall, interesser og gjennomføring.',
    ['formelt eller dokumentert beslutningspunkt', 'alternativer og begrunnelser', 'støttende og motsatte aktører'],
    ['møtebok, votering, partiprogram, høring eller korrespondanse', 'kilde som viser gjennomføring og virkning etter beslutningen']
  ),
  con_his_rehabilitering: C(
    'rehabilitering',
    'Rehabilitering er teknisk og funksjonell oppgradering av eksisterende bygg eller anlegg slik at konstruksjon, installasjoner og bruksevne forbedres uten full riving.',
    'building_rehabilitation_concept',
    ['con_his_byfornyelse', 'con_his_boligstandard', 'con_his_ombruk'],
    ['con_his_bevaring'],
    'Å bruke rehabilitering som synonym for kosmetisk oppussing eller anta at teknisk forbedring bevarte historisk materiale og eksisterende beboere.',
    ['utbedret konstruksjon eller teknisk anlegg', 'dokumentert standardheving', 'videreført hovedstruktur'],
    ['tilstandsrapport, byggesak, tegninger og kostnadsoversikt', 'før- og etterkilde om materiale, brukere og økonomiske vilkår']
  ),
  con_his_riving: C(
    'riving',
    'Riving er planlagt eller pålagt fysisk fjerning av hele eller deler av et bygg, anlegg eller bymiljø, med dokumenterbare beslutninger, metoder og etterfølgende arealbruk.',
    'demolition_concept',
    ['con_his_sanering', 'con_his_bevaring', 'con_his_fortrengning'],
    ['con_his_ombruk'],
    'Å behandle et bygg som revet fordi det ikke lenger er synlig, uten å undersøke brann, flytting, gradvis demontering, fasadebevaring eller innbygging i ny struktur.',
    ['rivetillatelse eller pålegg', 'datert fysisk bortfall', 'registrert avfall, gjenbruk eller ny arealbruk'],
    ['byggesak, foto, kart og entreprisedokument', 'kontrollkilde som avklarer omfang, dato og hva som kom etterpå']
  ),
  con_his_sanering: C(
    'sanering',
    'Sanering er offentlig eller privat program for å fjerne bebyggelse og funksjoner vurdert som helsefarlige, ineffektive eller uønskede, ofte for å muliggjøre ny planstruktur og bruk.',
    'clearance_policy_concept',
    ['con_his_riving', 'con_his_byfornyelse', 'con_his_fortrengning'],
    ['con_his_rehabilitering'],
    'Å bruke sanering om enhver riving eller godta samtidens problembeskrivelse uten å undersøke seleksjon, alternativer, berørte grupper og etterbruk.',
    ['avgrenset saneringsområde', 'offentlig problemdefinisjon og program', 'riving, flytting og ny planstruktur'],
    ['saneringsplan, helse- og boligrapport, vedtak og kart', 'beboer-, flytte- og gjennomføringskilder som viser konsekvensene']
  ),
  con_his_segregasjon: C(
    'segregasjon',
    'Segregasjon er vedvarende romlig konsentrasjon og adskillelse av grupper etter klasse, etnisitet, rettslig status eller livssituasjon, produsert gjennom marked, institusjoner og valg.',
    'spatial_segregation_concept',
    ['con_his_klasse', 'con_his_tilgang', 'con_his_boligregimer'],
    ['con_his_grenser'],
    'Å konkludere med segregasjon fra ett kart eller en synlig gruppe uten sammenligning, mål på konsentrasjon og analyse av boligmarked, regler og mobilitet.',
    ['ulik gruppefordeling mellom områder', 'stabilitet eller endring over flere tidspunkter', 'mekanismer i bolig, skole, arbeid eller adgang'],
    ['geokodet telling, register eller boligdata', 'kilde som dokumenterer institusjonelle og markedsmessige mekanismer']
  ),
  con_his_sentrum: C(
    'sentrum',
    'Sentrum er den historisk skiftende konsentrasjonen av handel, institusjoner, transport, arbeid og symbolsk makt som fungerer som referansepunkt i en bestemt by og periode.',
    'urban_centre_concept',
    ['con_his_periferi', 'con_his_transport', 'con_his_tomtemarkeder'],
    ['con_his_bygrense'],
    'Å behandle dagens sentrum som uendret gjennom historien eller definere sentrum bare ved geometrisk midtpunkt uten funksjoner, forbindelser og samtidige betegnelser.',
    ['konsentrasjon av sentrale funksjoner', 'transport- og gangstrømmer', 'høy symbolsk eller økonomisk verdi'],
    ['historisk kart, adressebok, virksomhets- og transportdata', 'samtidig språkbruk eller plan som viser hvordan sentrum ble avgrenset']
  ),
  con_his_skala: C(
    'analytisk skala',
    'Analytisk skala er valgt romlig og tidsmessig oppløsning, fra tomt og gate til bydel og region, som avgjør hvilke endringer, aktører og sammenhenger analysen kan se.',
    'analytical_scale_concept',
    ['con_his_urban_morfologi', 'con_his_bygrense', 'con_his_fortilstand'],
    ['con_his_sentrum'],
    'Å blande tall og forklaringer fra ulike geografiske enheter eller anta at en prosess som gjelder byen som helhet forklarer hvert kvartal likt.',
    ['eksplisitt geografisk enhet', 'avgrenset tidsintervall', 'sammenlignbare data på samme nivå'],
    ['kart- og metadata som dokumenterer enheten', 'sensitivitetskontroll mot minst én annen relevant skala']
  ),
  con_his_tekniske: C(
    'tekniske systemer',
    'Tekniske systemer er sammenkoblede anlegg, standarder, kompetanser og driftsrutiner som leverer vann, avløp, energi, transport, kommunikasjon eller andre urbane tjenester.',
    'technical_system_concept',
    ['con_his_infrastrukturer', 'con_his_transport', 'con_his_modernisme'],
    ['con_his_politisk'],
    'Å forklare et system ut fra synlige anlegg alene uten å undersøke nettverk, standarder, operatører, finansiering, vedlikehold og faktisk tjenestedekning.',
    ['fysiske nettverk og knutepunkt', 'driftsorganisasjon og standarder', 'kapasitet, dekning og feil'],
    ['teknisk tegning, driftsjournal, standard og budsjett', 'bruker- eller hendelseskilde som viser systemets faktiske ytelse']
  ),
  con_his_tilgang: C(
    'tilgang til byrom',
    'Tilgang til byrom er faktisk mulighet til å nå, bruke og oppholde seg på et sted, bestemt av rettigheter, pris, åpningstid, utforming, transport, kontroll og sosial aksept.',
    'urban_access_concept',
    ['con_his_offentlig_rom', 'con_his_grenser', 'con_his_segregasjon'],
    ['con_his_eiendom'],
    'Å likestille formell adgang med reell tilgang uten å undersøke kostnad, universell utforming, vakthold, transport, diskriminering og tidsbegrensninger.',
    ['juridiske og praktiske adgangsvilkår', 'reise- og oppholdsmulighet', 'bruksmønster mellom grupper'],
    ['regelverk, kart, åpningstid, pris og transportdata', 'observasjon, klage, intervju eller håndhevingskilde']
  ),
  con_his_tomtemarkeder: C(
    'tomtemarkeder',
    'Tomtemarkeder er historiske systemer for prising, omsetning, oppdeling, finansiering og forventning knyttet til byggegrunn, påvirket av planer, infrastruktur og eiendomsrett.',
    'land_market_concept',
    ['con_his_eiendom', 'con_his_gentrifisering', 'con_his_boligregimer'],
    ['con_his_boligstandard'],
    'Å bruke enkeltstående salgspriser som mål på tomtemarkedet uten å kontrollere areal, regulering, bebyggelse, transaksjonstype og forventet framtidig bruk.',
    ['daterte transaksjoner og pris per sammenlignbar enhet', 'endret regulering eller infrastruktur', 'oppdeling, sammenslåing og aktørkonsentrasjon'],
    ['skjøte, takst, matrikkel, auksjon og prisserie', 'plan- og finansieringskilde som forklarer forventningsverdien']
  ),
  con_his_tomtestruktur: C(
    'tomtestruktur',
    'Tomtestruktur er mønsteret av eiendomsgrenser, størrelser, former, adkomster og sammenslåinger som organiserer bebyggelse, investering og bruk i et byområde.',
    'parcel_structure_concept',
    ['con_his_gatenett', 'con_his_eiendom', 'con_his_urban_morfologi'],
    ['con_his_bygrense'],
    'Å lese dagens tomtegrenser bakover i tid eller anta at fysisk sammenhengende bebyggelse alltid tilhørte én eier og én utbyggingsprosess.',
    ['daterte parsellgrenser', 'deling og sammenslåing', 'adkomst og relasjon til gatenett'],
    ['matrikkel, oppmålingskart, skjøte og delingssak', 'historisk kart eller byggesak som viser faktisk bruk på tomtene']
  ),
  con_his_transport: C(
    'transportinfrastruktur',
    'Transportinfrastruktur er historiske nettverk, anlegg og driftsordninger for å flytte mennesker og varer, og virker både som forbindelse, barriere og driver for lokalisering.',
    'transport_infrastructure_concept',
    ['con_his_infrastrukturer', 'con_his_byutvidelse', 'con_his_sentrum'],
    ['con_his_gatenett'],
    'Å anta at åpning av en linje eller vei alene forklarer byvekst uten å dokumentere kapasitet, pris, rutetilbud, arealpolitikk og hvem som faktisk brukte forbindelsen.',
    ['trase, stopp og kapasitet', 'åpnings- og endringsdatoer', 'reise-, vare- og lokaliseringsmønstre'],
    ['ruteplan, trafikkdata, kart og anleggsarkiv', 'bosettings-, virksomhets- eller reisekilde som viser virkningen']
  ),
  con_his_urban: C(
    'urban utvikling',
    'Urban utvikling er samlet historisk endring i bebyggelse, befolkning, funksjoner, infrastruktur, institusjoner og relasjoner som gjør et område mer bymessig eller endrer dets plass i byen.',
    'urban_development_concept',
    ['con_his_urbanisering', 'con_his_urban_morfologi', 'con_his_byutvidelse'],
    ['con_his_byfornyelse'],
    'Å bruke urban som en estetisk eller moderne merkelapp uten å definere hvilke befolknings-, funksjons-, form- eller institusjonsendringer som undersøkes.',
    ['økt tetthet eller funksjonsmangfold', 'utvidet infrastruktur og institusjoner', 'endret relasjon til resten av byen'],
    ['kart, telling, virksomhets- og infrastrukturdokumentasjon', 'kontrollkilde som skiller planlagt fra faktisk utvikling']
  ),
  con_his_urban_morfologi: C(
    'urban morfologi',
    'Urban morfologi er den historiske formen byen får gjennom samspillet mellom gatenett, tomter, kvartaler, bygningstyper, høyder, åpne rom og terreng.',
    'urban_morphology_concept',
    ['con_his_gatenett', 'con_his_tomtestruktur', 'con_his_materialitet'],
    ['con_his_urbanisering'],
    'Å beskrive byform som statisk mønster uten å datere lagene, eiendomsprosessene og inngrepene som produserte og endret strukturen.',
    ['gatenett og kvartalsstruktur', 'tomte- og bygningstypologi', 'daterte lag av utbygging og omforming'],
    ['historiske kart, matrikkel, byggearkiv og feltregistrering', 'sammenlignbar kilde fra minst to tidspunkter']
  ),
  con_his_urbanisering: C(
    'urbanisering',
    'Urbanisering er historisk vekst i andelen mennesker, arbeid, tjenester og institusjoner knyttet til bymessige bosettinger, sammen med endrede forbindelser mellom by og omland.',
    'urbanization_process_concept',
    ['con_his_byutvidelse', 'con_his_forstad', 'con_his_urban'],
    ['con_his_innlemmelse'],
    'Å måle urbanisering bare med kommunens folketall eller behandle administrativ innlemmelse som identisk med økonomisk, sosial og fysisk urbanisering.',
    ['befolkningsvekst i bymessige områder', 'skifte i arbeid og tjenester', 'tettere regionale forbindelser'],
    ['sammenlignbar befolknings- og yrkesstatistikk', 'kart- og institusjonskilder som avgrenser den faktiske bymessige bosettingen']
  ),
  con_his_vern: C(
    'vern',
    'Vern er juridiske, administrative eller avtalebaserte begrensninger som skal beskytte natur-, bygg-, anleggs- eller kulturmiljøverdier mot bestemte former for endring.',
    'governance_concept',
    ['con_his_bevaring', 'con_his_kulturmiljo', 'con_his_planmakt'],
    ['con_his_ombruk'],
    'Å anta at vernestatus betyr uendret materiale, bruk og omgivelser, eller at alle historiske verdier omfattes av vedtakets konkrete formål og bestemmelser.',
    ['datert vernevedtak eller bindende bestemmelse', 'avgrenset objekt eller område', 'tillatte og forbudte tiltak'],
    ['vedtak, forskrift, planbestemmelse eller avtale', 'tilstands- og byggesakskilde som viser etterlevelse og endringer etter vern']
  )
};

const concepts = readJson(conceptPath);
const conceptById = new Map(concepts.map((item) => [item.concept_id, item]));
for (const [id, spec] of Object.entries(conceptSpecs)) {
  const current = conceptById.get(id);
  if (!current) throw new Error(`Missing concept ${id}`);
  Object.assign(current, spec);
}
writeJson(conceptPath, concepts);

const theorySpecs = {
  theory_his_byutvidelse_grense_innlemmelse: {
    definition: 'Forklarer byvekst som et samspill mellom administrative grenseendringer, faktisk utbygging, transportforbindelser og kommunal tjenesteutvidelse, slik at innlemmelse og urbanisering kan dateres og analyseres hver for seg.',
    limitations: [
      'En administrativ innlemmelse beviser ikke at området straks ble sammenhengende bebygd eller funksjonelt integrert i byen.',
      'Kart over bygrensen må sammenholdes med befolknings-, bygge- og infrastrukturdokumentasjon fordi juridisk og fysisk utstrekning følger ulike tidsforløp.',
      'Transportåpning kan muliggjøre vekst, men er ikke en tilstrekkelig årsaksforklaring uten tomte-, bolig- og arbeidsmarkedsdata.'
    ]
  },
  theory_his_gatenett_tomtestruktur_infrastruktur: {
    definition: 'Analyserer hvordan gater, tomtegrenser og tekniske nettverk virker sammen som seiglivede strukturer som styrer adkomst, utbyggingsmuligheter, eiendomsdeling og senere omforming av et avgrenset byområde.',
    limitations: [
      'Dagens gatenett kan inneholde lag fra flere perioder og kan ikke tilskrives én plan uten datering av hver forbindelse.',
      'Matrikkel- og plankart viser formelle grenser og intensjoner, men ikke alltid faktisk ferdsel, bruk eller tidspunkt for gjennomføring.',
      'Lik fysisk form kan ha oppstått gjennom forskjellige eiendoms-, finansierings- og infrastrukturelle prosesser.'
    ]
  },
  theory_his_regulering_plan_ekspropriasjon: {
    definition: 'Forklarer stedsendring gjennom forholdet mellom reguleringsintensjon, politisk vedtak, eiendomsrett, ekspropriasjon, finansiering og trinnvis gjennomføring, med planarkivet som kilde til både makt og urealiserte alternativer.',
    limitations: [
      'En vedtatt reguleringsplan dokumenterer ønsket framtid, ikke at tiltaket ble finansiert, bygget eller brukt som planlagt.',
      'Ekspropriasjonsvedtak må skilles fra faktisk overtakelse, kompensasjon og senere arealbruk.',
      'Planarkivet overrepresenterer institusjonelle aktører og må kontrolleres mot eiere, beboere, virksomheter og materielle spor.'
    ]
  },
  theory_his_sanering_riving_fortrengning: {
    definition: 'Analyserer sanering som en selektiv prosess der problemdefinisjoner, helse- og moderniseringsargumenter, riving, flytting og ny arealbruk fordeler tap og gevinst ulikt mellom beboere, eiere, virksomheter og myndigheter.',
    limitations: [
      'Rivings- og saneringsregistre viser hva som forsvant, men sjelden hvor hushold og virksomheter flyttet eller hvilke nettverk som gikk tapt.',
      'Samtidens betegnelser som usunt eller foreldet må behandles som politiske og faglige argumenter, ikke nøytrale beskrivelser.',
      'Fysisk opprydding kan kombineres med både bedre boligstandard og sosial fortrengning; virkningene må måles separat.'
    ]
  },
  theory_his_byfornyelse_bolig_standard: {
    definition: 'Forklarer byfornyelse som koblingen mellom teknisk rehabilitering, boligstandard, finansiering, regulering og beboerøkonomi, og undersøker om oppgradering faktisk forbedret levekår uten å svekke tilgjengeligheten.',
    limitations: [
      'Teknisk standardheving er ikke det samme som bedre velferd dersom husleie, gjeld eller inngangskostnad samtidig øker.',
      'Gjennomsnittlige boligstandarder kan skjule store forskjeller mellom gårder, leiligheter og hushold.',
      'Programdokumenter må kontrolleres mot fullførte tiltak, vedlikehold og hvem som ble boende etter oppgraderingen.'
    ]
  },
  theory_his_naring_funksjonsskifte: {
    definition: 'Analyserer hvordan bygg, gater og områder skifter mellom produksjon, handel, lager, kontor, bolig, kultur og servering, og hvordan eierskap, regulering og hverdagsbruk gir funksjonsskiftet sosial betydning.',
    limitations: [
      'Formell brukskategori fanger ikke nødvendigvis blandet, midlertidig eller uregistrert bruk i samme bygg.',
      'Virksomhetsregistre kan vise etablering og nedleggelse, men ikke kundekrets, arbeidsmiljø eller uformelle lokale funksjoner.',
      'Ny funksjon betyr ikke automatisk brudd; materialer, eiere, arbeidskraft og nabolagsbruk kan videreføres på ulike måter.'
    ]
  },
  theory_his_industrihavn_transformasjon: {
    definition: 'Forklarer omforming av industri-, havne- og jernbaneområder gjennom avindustrialisering, logistikkendring, opprydding, infrastrukturfjerning, eiendomsutvikling og ny offentlig eller kommersiell bruk.',
    limitations: [
      'Nedlagt produksjon kan ligge flere tiår før ny utbygging; avindustrialisering og transformasjon må derfor dateres som separate faser.',
      'Bevarte haller, skinner eller kaier dokumenterer ikke kontinuitet i arbeid, eierskap eller sosial betydning.',
      'Store transformasjonsplaner kan åpne forbindelser og samtidig øke verdi og eksklusjon; offentlig tilgang og fordelingsvirkning må undersøkes hver for seg.'
    ]
  },
  theory_his_gentrifisering_verdi_befolkning: {
    definition: 'Analyserer gentrifisering som sammenhengen mellom reinvestering, tomte- og boligverdier, endret virksomhetsmiks, befolkningsskifte og mulig direkte eller indirekte fortrengning over et avgrenset tidsrom.',
    limitations: [
      'Prisvekst alene beviser ikke gentrifisering fordi den kan skyldes generell markedstrend, ny infrastruktur eller endret regulering.',
      'Befolkningsendring kan komme før, samtidig med eller etter investeringene og må analyseres med sammenlignbare geografiske enheter.',
      'Registerdata viser ofte nettoendring, men fanger dårlig press, ufrivillig flytting og tap av lavterskelvirksomheter.'
    ]
  },
  theory_his_bevaring_ombruk_kulturmiljo: {
    definition: 'Forklarer bevaring og ombruk som valg om hvilke materielle lag, funksjoner og fortellinger som videreføres, og undersøker hvordan vern, investering og ny bruk omformer kulturmiljøets sammenheng og tilgjengelighet.',
    limitations: [
      'Juridisk vern garanterer ikke materiell integritet, vedlikehold eller bevaring av omgivelser og bruk.',
      'Ombruk kan redde en bygning samtidig som arbeidsliv, sosial funksjon og historiske interiører forsvinner.',
      'Utvalg av verneverdier er historisk og politisk; fravær av vern betyr ikke fravær av dokumenterbar betydning.'
    ]
  },
  theory_his_offentlig_rom_tilgang_konflikt: {
    definition: 'Analyserer offentlige rom gjennom eierskap, rettslige adgangsvilkår, fysisk utforming, transport, kontroll, faktisk bruk og konflikt, slik at formell åpenhet kan skilles fra sosialt fordelt tilgang.',
    limitations: [
      'Offentlig eierskap eller fri inngang dokumenterer ikke lik praktisk tilgang når pris, kontroll, utforming eller sosial kode virker ekskluderende.',
      'Observasjon av dagens bruk kan ikke uten videre overføres til tidligere perioder med andre regler, forbindelser og brukergrupper.',
      'Konfliktkilder overrepresenterer synlige hendelser og må balanseres mot hverdagsbruk, fravær og grupper som ikke etterlot skriftlige spor.'
    ]
  }
};

const theories = readJson(theoryPath);
const theoryById = new Map(theories.map((item) => [item.theory_id, item]));
for (const [id, spec] of Object.entries(theorySpecs)) {
  const current = theoryById.get(id);
  if (!current) throw new Error(`Missing theory ${id}`);
  Object.assign(current, spec, {status: 'canonical_v5_5_curated', evidence_ready: false});
}
writeJson(theoryPath, theories);

const run = (name, command, args) => {
  const result = spawnSync(command, args, {cwd: root, encoding: 'utf8'});
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

run('byhistorie-domain-validation.log', process.execPath, ['tools/validate-historie-byhistorie-stedsendring.mjs']);
run('byhistorie-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('byhistorie-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('byhistorie-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('byhistorie-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('byhistorie-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('byhistorie-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('byhistorie-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);

const readiness = JSON.parse(fs.readFileSync(path.join(reportDir, 'historie-v5-5-readiness.json'), 'utf8'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
const summary = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concept_ids: Object.keys(conceptSpecs),
  curated_theory_ids: Object.keys(theorySpecs),
  domain_readiness: domain,
  global_status: readiness.status,
  v6_allowed: readiness.v6_allowed,
  quality_issue_totals: readiness.quality_issue_totals,
  next_gate: 'Complete the remaining V5.5 domains before global freeze and V6 activation.'
};
writeJson(path.join(reportDir, 'byhistorie-curation-readiness.json'), summary);
console.log(JSON.stringify(summary, null, 2));
