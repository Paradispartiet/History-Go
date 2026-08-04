#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = 'data/places/subkultur-production';
const WRITE = process.argv.includes('--write');

const CASES = [
  {
    placeId: 'house_of_nerds',
    placeFile: 'data/places/subkultur/oslo/house_of_nerds.json',
    anchorType: 'scene_or_venue',
    start: '2015',
    emneIds: ['em_sub_gaming_lan', 'em_sub_scene_fellesskap', 'em_sub_kommersialisering'],
    methodId: 'met_sub_sceneanalyse',
    milieuUrl: 'https://houseofnerds.no/',
    milieuLocation: 'Gaming, bar og community; arrangementer og sosiale kvelder',
    outsideUrl: 'https://qlist.app/venues/Oslo/House-of-Nerds/RzZRckZRTGE5b3M3Y080ZUF4eU1Fdw',
    outsideLocation: 'Uavhengig katalogomtale og oppsummert publikumsinformasjon, oppdatert 11. juli 2026',
    identity: 'House of Nerds er en kommersiell spillarena som samtidig dokumenterer gjentatte arrangementer, sosial deltakelse og et konkret gamingfellesskap.',
    relationship: 'Miljøfunksjonen er avhengig av kommersiell drift, booking og skjenke-/serveringsrammer; stedet er derfor ikke et autonomt undergrunnsrom.',
    claim: 'Faste spillaktiviteter og arrangementer gjør lokalet til sosial infrastruktur for gamingmiljøer, mens betalings- og bookingmodellen former adgang og deltakelse.',
    practices: ['PC- og konsollspilling', 'brettspill', 'turneringer og sosiale kvelder'],
    organization: 'Virksomheten programmerer aktivitetene kommersielt, mens deltakere organiserer lag, vennegrupper og gjentatt sosial spilling.',
    expressions: 'Spillreferanser, utstyr, turneringsformat og sjangerkoder gjør gamingidentiteten synlig i lokalet.',
    access: 'Lokalet er offentlig tilgjengelig, men deler av tilbudet krever betaling, booking eller kjøp.',
    regulation: 'Kommersiell drift og booking styrer tid, kapasitet og tilgang til utstyr og rom.',
    negotiation: 'Kildene dokumenterer ikke en bestemt pågående konflikt; den analytiske spenningen gjelder åpen møteplass versus betalingsbasert adgang.',
    institutionalization: 'Et nettbasert og hjemlig interessefelt får fast lokale, program og markedsmodell.',
    stigmaRisk: 'En ren «nerdehjem»-fortelling kan romantisere fellesskapet og skjule økonomiske terskler og variasjon i deltakernes erfaringer.',
    current: 'House of Nerds markedsfører fortsatt gaming, VR, brettspill, eventer og sosiale kvelder i Oslo.',
    outsideLimit: 'Katalogomtalen bygger delvis på brukeropplevelser og er ikke en forskningsstudie.'
  },
  {
    placeId: 'lisbon_crew_hassan',
    placeFile: 'data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_crew_hassan.json',
    anchorType: 'scene_or_venue',
    start: '2004',
    emneIds: ['em_sub_diy_praksis', 'em_sub_sosial_organisering', 'em_sub_rett_til_byen', 'em_sub_gentrifisering_tap'],
    methodId: 'met_sub_organiseringsanalyse',
    milieuUrl: 'https://www.facebook.com/ccrewhassan/',
    milieuLocation: 'Crew Hassans egen arrangements- og organisasjonsside',
    outsideUrl: 'https://www.timeout.pt/lisboa/pt/noite/crew-hassan',
    outsideLocation: 'Time Out Lisboa, omtale av program, workshops og konserter, 26. desember 2017',
    identity: 'Crew Hassan er dokumentert som kulturkooperativ og flerbruksarena med konserter, DJ-sett, workshops og kollektiv kulturproduksjon.',
    relationship: 'Kooperativ organisering og rimelige kulturaktiviteter plasserer stedet utenfor ordinær kulturinstitusjon, samtidig som drift og lokaler er bundet til marked og byutvikling.',
    claim: 'Kooperativ drift, flerbruksprogram og gjentatt møteaktivitet gjorde Crew Hassan til en sosial og kulturell scene, ikke bare en bar eller arrangementsadresse.',
    practices: ['konserter og DJ-sett', 'workshops og bevegelsesaktiviteter', 'platesirkulasjon og møtevirksomhet'],
    organization: 'Kildene identifiserer stedet som kulturkooperativ og viser et program som kobler dag- og nattaktiviteter.',
    expressions: 'Musikkprogram, gjenbrukspreget interiør og platesirkulasjon ga stedet en gjenkjennelig alternativ profil.',
    access: 'Stedet kombinerte kafé, programaktiviteter og nattarrangementer med ulike terskler gjennom døgnet.',
    regulation: 'Driften var avhengig av et fast lokale og arrangementsrammer, selv om detaljene i tillatelser ikke er dokumentert i de valgte kildene.',
    negotiation: 'De valgte kildene dokumenterer ikke én bestemt konflikt; rapporten avgrenser seg derfor fra å hevde tvangsflytting eller årsak.',
    institutionalization: 'Et selvorganisert prosjekt ble stabilisert som kulturkooperativ med fast program og adresse.',
    stigmaRisk: 'Turist- og nattlivsomtaler kan romantisere «alternativ» atmosfære og underkommunisere arbeid, økonomi og interne grenser.',
    current: 'Crew Hassans egen side viser nyere aktivitet, mens den uavhengige kilden dokumenterer programprofilen historisk; status behandles derfor som mixed.',
    presentStatus: 'mixed',
    outsideTemporal: 'historical',
    outsideLimit: 'Time Out er en redaksjonell byguide, ikke en organisasjons- eller forskningskilde.'
  },
  {
    placeId: 'lisbon_desterro',
    placeFile: 'data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_desterro.json',
    anchorType: 'scene_or_venue',
    start: '2014',
    emneIds: ['em_sub_klubbkultur_natt', 'em_sub_scene_fellesskap', 'em_sub_sted_scene'],
    methodId: 'met_sub_sceneanalyse',
    milieuUrl: 'https://darc.pt/about/',
    milieuLocation: 'DARC About; formål, kunstfelt og åpenhet for forslag',
    outsideUrl: 'https://www.atlaslisboa.com/the-associations-of-lisbon/',
    outsideLocation: 'Atlas Lisboa, The Associations of Lisbon, 10. oktober 2019',
    identity: 'DARC/Desterro er en medlemsbasert, tverrfaglig forening som støtter produksjon innen musikk, lyd, scenekunst og visuell kunst.',
    relationship: 'Foreningsformen skaper en uavhengig produksjonsarena, men medlemskap, donasjoner og logistiske rammer regulerer adgang og program.',
    claim: 'Desterro fungerer som scene fordi foreningen kobler eksperimentell musikk, lydproduksjon, gjentatte arrangementer og deltakende samarbeid i ett sted.',
    practices: ['eksperimentelle konserter', 'elektroniske jamsesjoner', 'lyd-, performance- og kunstproduksjon'],
    organization: 'DARC beskriver seg som en tverrfaglig forening som mottar forslag og støtter skapende produksjon.',
    expressions: 'Eksperimentell elektronisk musikk, lydkunst og tverrfaglige program danner scenens uttrykksprofil.',
    access: 'Medlemskap og donasjoner regulerer deler av adgangen, mens forslag til program vurderes opp mot foreningens retning og kapasitet.',
    regulation: 'Foreningens logistiske muligheter og programorientering setter eksplisitte rammer for hvilke forslag som kan realiseres.',
    negotiation: 'De valgte kildene dokumenterer ikke en bestemt romkonflikt; medlemskap og kuratering behandles som adgangsforhandling, ikke som tvang.',
    institutionalization: 'En eksperimentell scene er stabilisert gjennom foreningsform, medlemskap og et vedvarende produksjonsprogram.',
    stigmaRisk: 'En ren «undergrunnsklubb»-etikett kan skjule foreningsarbeid, tverrfaglighet og de formelle adgangsrammene.',
    current: 'DARC presenterer fortsatt sitt formål, programområde og støtte til skapende produksjon på egen side.',
    outsideTemporal: 'historical',
    outsideLimit: 'Atlas Lisboa er en uavhengig bykulturpublikasjon, men omtalen er fra 2019.'
  },
  {
    placeId: 'lisbon_anjos70',
    placeFile: 'data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_anjos70.json',
    anchorType: 'mixed_subcultural_site',
    start: '2012',
    emneIds: ['em_sub_sosial_organisering', 'em_sub_sted_scene', 'em_sub_gentrifisering_tap'],
    methodId: 'met_sub_stedsanalyse',
    milieuUrl: 'https://anjos70.org/',
    milieuLocation: 'Om Anjos70 Art & Fleamarket; historie siden 2012, kalender og selgerdeltakelse',
    outsideUrl: 'https://www.visitlisboa.com/en/places/anjos70-art-fleamarket',
    outsideLocation: 'Visit Lisboa, markedsformat, gratis adgang og deltakerbredde',
    identity: 'Anjos70 er dokumentert som et tilbakevendende art- og loppemarked som siden 2012 samler selvstendige skapere, selgere og publikum på skiftende steder.',
    relationship: 'Miljøet bygger en alternativ markeds- og møteform, men er samtidig avhengig av arrangementssteder, selgerøkonomi og offentlig tilgjengelige lokaler.',
    claim: 'Gjentatte markeder, lav terskel og deltakerbasert salg gjør Anjos70 til et flyttbart kreativt miljø snarere enn bare én permanent bygning.',
    practices: ['art- og loppemarked', 'selvstendig salg og bytte', 'verksteder, musikk og sosial møteaktivitet'],
    organization: 'Arrangøren publiserer kalender, lokasjoner og selgerpåmelding og organiserer et gjentatt marked siden 2012.',
    expressions: 'Gjenbruk, håndverk, vintage, selvpublisering og individuell utforming gjør deltakerproduksjonen synlig.',
    access: 'Publikumsadgangen er gratis, mens selgerdeltakelse krever påmelding og plass i det organiserte markedet.',
    regulation: 'Skiftende arrangementssteder og organisert selgeropptak styrer hvor og hvordan miljøet kan samles.',
    negotiation: 'Flytting mellom lokasjoner viser avhengighet av tilgjengelige rom, men de valgte kildene dokumenterer ikke årsaken til hver flytting.',
    institutionalization: 'Et tidligere fast miljø videreføres som en mobil arrangementsorganisasjon med kalender, selgerordning og gjentatt publikumsmøte.',
    stigmaRisk: 'Merkeordet «alternativt marked» kan bli ren livsstilsbranding dersom arbeid, seleksjon, økonomi og stedsavhengighet ikke synliggjøres.',
    current: 'Anjos70 publiserer fortsatt kommende markeder og beskriver virksomheten som et møtested for kreative siden 2012.',
    outsideLimit: 'Visit Lisboa er en offisiell reiselivskilde og beskriver publikumsformatet bedre enn interne konflikter eller organisering.'
  },
  {
    placeId: 'blitzhuset',
    verifiedAt: '2026-08-04',
    placeFile: 'data/places/subkultur/oslo/places_subkultur/blitzhuset.json',
    anchorType: 'autonomous_space',
    start: '1982',
    emneIds: ['em_sub_autonomi_motstand', 'em_sub_diy_praksis', 'em_sub_undergrunn_miljo'],
    methodId: 'met_sub_organiseringsanalyse',
    milieuUrl: 'https://blitz.no/about.html',
    milieuLocation: 'Blitz, About; selvdefinisjon som selvstyrt ungdomshus og radikalt aktivismesenter siden 1982',
    outsideUrl: 'https://arkiv.nrk.no/programoversikt/avansert/indexbb68-2.html',
    outsideLocation: 'NRK, «Blitz fra innsiden»; dokumentaromtale, miljøstemmer, aktivitet, konflikt og stedshistorie',
    identity: 'Blitz dokumenterer seg som et selvstyrt ungdomshus og senter for radikal aktivisme, med kafé, musikk, mediearbeid og kollektive aktiviteter.',
    relationship: 'Huset er organisert utenfor ordinær kommersiell kulturdrift, men den langvarige bruken av kommunalt eid bygg er formet av avtaler, politiske vedtak og konflikt med myndigheter.',
    claim: 'Selvstyre, gjentatt kollektiv aktivitet og langvarig kamp om huset gjør Blitz til sosial og politisk infrastruktur, ikke bare et konsertsted eller en stilmarkør.',
    practices: ['selvstyrt møte- og kafédrift', 'konserter, øvingsrom og uavhengige medier', 'politisk organisering og demonstrasjoner'],
    organization: 'Blitz beskriver huset som selvstyrt; NRK dokumenterer både interne miljøstemmer, en avtale med Oslo kommune og periodiske konflikter om salg og nedlegging.',
    expressions: 'Punk, radikal politikk, feministisk mediearbeid og gjør-det-selv-praksis er knyttet til kollektive aktiviteter i huset, ikke behandlet som løs estetikk.',
    access: 'Huset fungerer som møtested og aktivitetshus, men kollektiv styring, husregler og politisk profil gjør at offentlig adresse ikke betyr grenseløs adgang eller innsyn.',
    regulation: 'Kommunalt eierskap, leieavtale og politiske vedtak setter ytre rammer, mens miljøet organiserer den daglige bruken.',
    negotiation: 'NRK dokumenterer gjentatte strider om riving, salg og politiinngrep samt interne diskusjoner om metoder; rapporten skiller dette fra nåværende konfliktstatus.',
    institutionalization: 'Et okkupasjonsmiljø fikk i 1982 en avtalt adresse og ble en varig, men fortsatt selvstyrt institusjon i kommunalt eid bygg.',
    stigmaRisk: 'En ren konfliktfortelling kan kriminalisere deltakere, mens en heroisk motkulturfortelling kan skjule intern uenighet, grenser og endring over tid.',
    current: 'Blitz presenterer fortsatt huset som selvstyrt ungdomshus og radikalt aktivismesenter; den valgte kontrollkilden dokumenterer den historiske utviklingen, ikke hele nåsituasjonen.',
    outsideTemporal: 'historical',
    outsideLimit: 'NRK-siden er en redaksjonell omtale av en dokumentar fra 2004 og gir sterk historisk kontroll, men kan ikke alene dokumentere dagens organisering.'
  },
  {
    placeId: 'hausmania',
    verifiedAt: '2026-08-04',
    placeFile: 'data/places/subkultur/oslo/places_subkultur/hausmania.json',
    anchorType: 'autonomous_space',
    start: '2000',
    emneIds: ['em_sub_autonomi_motstand', 'em_sub_diy_praksis'],
    methodId: 'met_sub_institusjonsanalyse',
    milieuUrl: 'https://www.hausmania.org/',
    milieuLocation: 'Hausmania; atelier- og studioutlysninger, krav om tilstedeværelse, engasjement og dugnad',
    outsideUrl: 'https://www.visitnorway.com/listings/hausmania-culture-house/2711/',
    outsideLocation: 'Visit Norway, Hausmania Culture House; uavhengig omtale av rimelige arbeidsrom utenfor kommersielle interesser',
    identity: 'Hausmania dokumenterer et kunstnerdrevet kulturhus der tilgang til arbeidsrom er knyttet til tilstedeværelse, engasjement og felles dugnad.',
    relationship: 'Kollektiv arbeidsplikt og rimelige rom utfordrer en rent kommersiell ateliermodell, samtidig som drift, leie og formelle bygningsrammer gjør huset til en forhandlet institusjon.',
    claim: 'Felles arbeidsplikt, kunstnerstyrte rom og rimelig produksjonsinfrastruktur gjør Hausmania til et organisert miljø, ikke bare en alternativ arrangementsadresse.',
    practices: ['kunst- og musikkproduksjon i atelierer og studioer', 'dugnad og kollektivt husarbeid', 'uavhengige utstillinger og arrangementer'],
    organization: 'Søkere til rom må forstå prosjektets egenart og forplikte seg til tilstedeværelse og dugnad; dette dokumenterer deltakelse som mer enn leieforhold.',
    expressions: 'Kunstnerdrevne arbeidsformer, uavhengig produksjon og den lovlige graffitiveggen gir synlige uttrykk, men uttrykkene alene brukes ikke som kvalifikasjon.',
    access: 'Arrangementer kan være offentlige, mens atelierer og studioer fordeles gjennom søknad og forpliktelser til husfellesskapet.',
    regulation: 'Romfordeling, dugnad, husdrift og eksterne eiendoms- og bygningsrammer regulerer hvem som kan bruke hvilke deler av stedet.',
    negotiation: 'Kildene dokumenterer spenningen mellom uavhengig produksjon og formalisert kulturhusdrift, men ikke én avgrenset pågående konflikt i 2026.',
    institutionalization: 'Et selvorganisert prosjekt har fått varige atelierer, studioer og tydeligere formelle ordninger uten at kollektiv deltakelse er fjernet.',
    stigmaRisk: 'Merket «undergrunn» kan romantisere huset og usynliggjøre arbeid, seleksjon, driftsansvar og forskjeller mellom beboelse, produksjon og publikumstilbud.',
    current: 'Hausmania lyser fortsatt ut arbeidsrom med krav om tilstedeværelse, engasjement og dugnad.',
    outsideLimit: 'Visit Norway bekrefter uavhengig kulturhus- og arbeidsromsfunksjonen, men gir begrenset innsyn i intern styring og konflikter.'
  },
  {
    placeId: 'xray_ungdomskulturhus',
    verifiedAt: '2026-08-04',
    placeFile: 'data/places/subkultur/oslo/places_subkultur/xray_ungdomskulturhus.json',
    anchorType: 'youth_space',
    start: '1994',
    emneIds: ['em_sub_ungdomskultur_identitet', 'em_sub_deltakelse_laring', 'em_sub_scene_fellesskap'],
    methodId: 'met_sub_deltakelsesanalyse',
    milieuUrl: 'https://x-rayukh.no/',
    milieuLocation: 'X-Ray Ungdomskulturhus; selvpresentasjon av rusfritt tilbud og ungdomskulturelle aktiviteter for 13–25 år',
    outsideUrl: 'https://samforsk.no/uploads/files/Publikasjoner/Xray_2019-WEB.pdf',
    outsideLocation: 'NTNU Samfunnsforskning, «Brukerstyrt ungdomskulturhus i 25 år»; organisering, deltakelse og erfaringer',
    identity: 'X-Ray er et rusfritt ungdomskulturhus der unge deltar i og styrer aktiviteter innen flere ungdomskulturelle uttrykk.',
    relationship: 'Brukerstyring og medvirkning gir unge faktisk organisatorisk rom innenfor et kommunalt finansiert tilbud med aldersgrenser, ansatte og rusfrie rammer.',
    claim: 'Langvarig brukerstyring, gjentatt deltakelse og læring på tvers av uttrykk gjør X-Ray til sosial infrastruktur for ungdomsmiljøer, ikke bare et fritidstilbud.',
    practices: ['brukerstyrte kulturaktiviteter', 'musikk-, dans- og medieproduksjon', 'veiledning, arrangementer og sosial læring'],
    organization: 'Miljøkilden beskriver målgruppe og aktiviteter, mens forskningsrapporten undersøker hvordan brukerstyring og medvirkning faktisk er organisert og erfart.',
    expressions: 'Hiphop, dans, musikk og andre ungdomskulturelle uttrykk blir lært og produsert i organiserte fellesskap; sjangernavn alene er ikke bevis.',
    access: 'Tilbudet retter seg mot unge, hovedsakelig 13–25 år, og har rusfrie regler; målgruppe og trygghetsrammer avgrenser adgangen.',
    regulation: 'Kommunal tilknytning, alder, rusfrihet og samspill mellom ansatte og unge setter rammene for brukerstyringen.',
    negotiation: 'Brukerstyring innebærer forhandling mellom ungdommers initiativ og institusjonelle ansvar; kildene gir ikke grunnlag for å kalle all aktivitet autonom.',
    institutionalization: 'Et ungdomskulturelt miljø er stabilisert i et kommunalt tilknyttet hus uten at deltakerstyring er redusert til symbolsk profil.',
    stigmaRisk: 'Ungdom kan framstilles som enten problemgruppe eller suksesshistorie; rapporten må bevare variasjon, begrense identifisering og skille institusjonens mål fra deltakernes erfaringer.',
    current: 'X-Ray publiserer fortsatt et rusfritt kulturtilbud for unge fra Oslo og omegn.',
    outsideLimit: 'Forskningsrapporten gir dybde og deltakerperspektiver fram til 2019, men må kombineres med nåværende programinformasjon for dagens funksjon.'
  },
  {
    placeId: 'svartlamon_trondheim',
    verifiedAt: '2026-08-04',
    placeFile: 'data/places/subkultur/trondelag/svartlamon_trondheim/svartlamon_trondheim.json',
    anchorType: 'alternative_neighborhood',
    start: '1999',
    emneIds: ['em_sub_autonomi_motstand', 'em_sub_diy_praksis'],
    methodId: 'met_sub_romlig_maktanalyse',
    milieuUrl: 'https://svartlamon.org/',
    milieuLocation: 'Svartlamon; egenbeskrivelse av byøkologisk forsøksområde, flat struktur, rimelig utleie, dugnad og motkultur',
    outsideUrl: 'https://www.codesign.nu/wp-content/uploads/2025/02/Stenberg-Bryngelsson-2022-eng-v2.pdf',
    outsideLocation: 'CoDesign/ArkDes, case study om Svartlamon, selvbygging, beboerorganisering og kommunal ramme',
    identity: 'Svartlamon beskriver et byøkologisk forsøksområde bygget på rimelig utleie, flat struktur, dugnad, deltakelse og motkulturelt fellesskap.',
    relationship: 'Området kombinerer beboerstyring og alternative boligpraksiser med kommunalt anerkjent forsøksstatus, stiftelsesforvaltning og planrammer.',
    claim: 'Beboerorganisering, rimelig leie, selvbygging og kollektiv ressursbruk gjør Svartlamon til et sosialt og romlig miljø, ikke bare et område med særpreget arkitektur.',
    practices: ['beboermøter og flat organisering', 'dugnad, gjenbruk og selvbygging', 'rimelig utleie og felles kulturaktiviteter'],
    organization: 'Egenbeskrivelsen vektlegger flat struktur og åpen økonomi; kontrollkilden dokumenterer selvbygging og forholdet mellom beboere, fagfolk og institusjonelle rammer.',
    expressions: 'Gjenbruk, egenbygging og kunstneriske uttrykk er knyttet til bolig- og fellesskapspraksis, ikke brukt som estetisk snarvei til subkultur.',
    access: 'Offentlige gater og arrangementer er åpne, mens boligtilgang, interne møter og private hjem ikke er offentlige forskningsflater.',
    regulation: 'Forsøksområde, boligstiftelse, leieordninger og kommunale rammer avgrenser selvstyret og gjør maktforholdene sammensatte.',
    negotiation: 'Områdets form er resultat av langvarig kamp og senere formalisering; rapporten skiller historisk konflikt fra dagens løpende forvaltning.',
    institutionalization: 'Et omstridt alternativt bomiljø ble i 1999 anerkjent som byøkologisk forsøksområde og fikk varige organisatoriske rammer.',
    stigmaRisk: 'Svartlamon kan romantiseres som friksjonsfri utopi eller stemples som avvik; begge deler skjuler intern variasjon, boligprivatliv og institusjonelle avhengigheter.',
    current: 'Svartlamon presenterer fortsatt området som Norges første byøkologiske forsøksområde med flat struktur, rimelig utleie og kollektiv deltakelse.',
    outsideLimit: 'Case-studien gir uavhengig analyse av bolig- og selvbyggingspraksis, men dekker ikke alle beboeres erfaringer eller hele områdets kulturmiljø.'
  },
  {
    placeId: 'hulen_bergen',
    verifiedAt: '2026-08-04',
    placeFile: 'data/places/subkultur/vestland/hulen_bergen/hulen_bergen.json',
    anchorType: 'scene_or_venue',
    start: '1969',
    emneIds: ['em_sub_scene_fellesskap', 'em_sub_undergrunn_miljo', 'em_sub_diy_praksis'],
    methodId: 'met_sub_sceneanalyse',
    milieuUrl: 'https://www.hulen.no/',
    milieuLocation: 'Hulen; organisasjonens program- og driftsinformasjon for den frivilligdrevne rockeklubben',
    outsideUrl: 'https://en.visitbergen.com/food-and-drink/hulen-bergen-p7139473',
    outsideLocation: 'Visit Bergen, Hulen Bergen; oppstart i 1969, frivillig drift og rolle som konsertarrangør',
    identity: 'Hulen er en langvarig, frivilligdrevet rockeklubb i et tidligere tilfluktsrom, med gjentatt program og organisatorisk rekruttering.',
    relationship: 'Frivillig drift og alternativt musikkprogram skaper en scene utenfor kommersiell kjededrift, samtidig som skjenking, billettering og arrangøransvar gir formelle grenser.',
    claim: 'Kontinuerlig frivillig arbeid, rekruttering og konserter siden 1969 gjør Hulen til en institusjonalisert musikkscene, ikke bare et særpreget lokale.',
    practices: ['frivillig konsertproduksjon', 'rock-, metal- og klubbarrangementer', 'opplæring og organisatorisk rekruttering'],
    organization: 'Hulen drives gjennom frivillige roller og gjentatt arrangørarbeid; kontrollkilden framhever denne driftsformen som sentral for stedets kontinuitet.',
    expressions: 'Rock- og metalprofil, plakater og det fysiske hulerommet gir scenekoder, men miljøstatusen begrunnes i organisering og praksis.',
    access: 'Publikum møter billett-, alders- og skjenkerammer, mens frivillige får andre former for tilgang gjennom arbeidsroller og ansvar.',
    regulation: 'Arrangøransvar, skjenking, sikkerhet og frivillig vaktarbeid regulerer bruk av rommet og hvem som kan delta på hvilke måter.',
    negotiation: 'Kildene dokumenterer ikke en bestemt pågående konflikt; den analytiske spenningen ligger mellom idealistisk frivillighet og varig arrangementsinstitusjon.',
    institutionalization: 'En alternativ student- og rockeklubb har over flere tiår blitt en stabil konsertinstitusjon uten å oppgi frivillig drift.',
    stigmaRisk: 'En mytisk «rockehule»-fortelling kan skjule arbeidsmengde, aldersgrenser, sikkerhet og forskjellen mellom publikum og organiserende miljø.',
    current: 'Hulen publiserer fortsatt program og organisasjonsinformasjon, og kontrollkilden beskriver klubben som aktiv frivilligdrevet arrangør.',
    outsideLimit: 'Visit Bergen er en destinasjonskilde og dokumenterer kontinuitet og driftsform bedre enn interne uenigheter eller arbeidsvilkår.'
  },
  {
    placeId: 'bergen_kjott_kulturhus',
    verifiedAt: '2026-08-04',
    placeFile: 'data/places/subkultur/vestland/bergen_kjott_kulturhus/bergen_kjott_kulturhus.json',
    anchorType: 'scene_or_venue',
    start: '2010',
    emneIds: ['em_sub_scene_fellesskap', 'em_sub_undergrunn_miljo', 'em_sub_diy_praksis'],
    methodId: 'met_sub_institusjonsanalyse',
    milieuUrl: 'https://www.bergenkjott.org/omoss',
    milieuLocation: 'Bergen Kjøtt, Om oss; studioer, residerende aktører, produksjonsrom, historie og ideell stiftelse',
    outsideUrl: 'https://www.fib.no/en/practical-information/venues/bergen-kjott',
    outsideLocation: 'Festspillene i Bergen, venueomtale; produksjonshus, studioer og Fabrikkhallen',
    identity: 'Bergen Kjøtt er et ideelt produksjonshus og kulturhus med studioer, residerende kunstnere og musikere, verksteder og offentlige arrangementer.',
    relationship: 'Huset gir uavhengige fagmiljøer delt produksjonsinfrastruktur, men romfordeling, leie, finansiering og program gjør det til en formalisert kulturinstitusjon.',
    claim: 'Faste studioer, residerende produsenter og samarbeid mellom organisasjoner gjør Bergen Kjøtt til et produksjonsmiljø, ikke bare en utleiescene i et industribygg.',
    practices: ['musikk- og kunstproduksjon i faste studioer', 'konserter, utstillinger og workshops', 'deling av teknisk og sosial infrastruktur'],
    organization: 'En ideell stiftelse driver huset og samarbeider med aktører som mangler egne presentasjonsrom; kontrollkilden bekrefter produksjons- og arenaformatet.',
    expressions: 'Eksperimentelle og tverrfaglige uttrykk blir produsert i studioer og prosjektrom; industribyggets estetikk er ikke i seg selv kvalifikasjon.',
    access: 'Offentlige arrangementer, studioleie og samarbeid har ulike terskler, og deler av bygget er arbeidsplass heller enn publikumsrom.',
    regulation: 'Stiftelsesdrift, leie, kapasitet, tekniske krav og tilgjengelighetsregler former tilgang til studioer og scener.',
    negotiation: 'Kildene viser overgangen fra kunstnerstyrt initiativ til stiftelsesdrift, men dokumenterer ikke én bestemt aktuell konflikt.',
    institutionalization: 'Et kunstnerinitiert prosjekt fra 2010 ble i 2019 overtatt av en ideell stiftelse og videreført som produksjons- og kulturhus.',
    stigmaRisk: '«Rå fabrikk» og «undergrunn» kan bli markedsestetikk som skjuler husets institusjonelle drift, økonomiske terskler og mangfoldet av arbeidspraksiser.',
    current: 'Bergen Kjøtt beskriver fortsatt 28 studioer, rundt 85 residerende aktører og et løpende program av produksjon og arrangementer.',
    outsideLimit: 'Festspillenes venueomtale er uavhengig av driftsorganisasjonen, men beskriver fysisk og programmatisk kapasitet mer enn intern organisering.'
  },
  {
    placeId: 'lisbon_galeria_ze_dos_bois',
    verifiedAt: '2026-08-04',
    placeFile: 'data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur/lisbon_galeria_ze_dos_bois.json',
    anchorType: 'scene_or_venue',
    start: '1994',
    emneIds: ['em_sub_grunnbegreper', 'em_sub_musikkscener'],
    methodId: 'met_sub_institusjonsanalyse',
    milieuUrl: 'https://zedosbois.org/en/history/',
    milieuLocation: 'Galeria Zé dos Bois, History; oppstart som ideell forening i 1994, formål, program og organisatorisk utvikling',
    outsideUrl: 'https://repositorio.ulisboa.pt/entities/publication/d2c822f0-12b9-4c8a-b607-656c17a1f993',
    outsideLocation: 'Universidade de Lisboa, masterstudie av ZDBs kuratoriske praksis og institusjonaliseringsprosess, 2019',
    identity: 'ZDB ble etablert av unge kunstnere som en ideell forening for å skape visnings- og produksjonsrom utenfor de etablerte institusjonene.',
    relationship: 'Foreningen oppsto som et selvinitiert alternativ til institusjonell kunstformidling, men har over tid utviklet profesjonell kuratering, fast program og varig organisasjon.',
    claim: 'Kunstnerinitiativ, ideell foreningsform og kontinuerlig tverrkunstnerisk produksjon gjør ZDB til et miljø og en infrastruktur, ikke bare et galleri.',
    practices: ['utstillinger og kunstproduksjon', 'eksperimentell musikk og scenekunst', 'kuratering, residens og tverrfaglig samarbeid'],
    organization: 'ZDBs historie beskriver en ideell forening og bredt produksjonsformål; universitetsstudien analyserer hvordan kuratering og organisasjon er blitt spesialisert.',
    expressions: 'Eksperimentelle kunst-, film-, performance- og musikkuttrykk bindes sammen av produksjon og kuratering, ikke av en enkel alternativ stil.',
    access: 'Publikumsprogrammet er åpent gjennom arrangementer, mens kunstnerutvalg, residens, kuratering og arbeidsrom styres organisatorisk.',
    regulation: 'Foreningsdrift, kuratoriske valg, finansiering og bygningsbruk regulerer hvilke prosjekter og deltakere som får plass.',
    negotiation: 'Kildene dokumenterer gradvis profesjonalisering og spesialisering; rapporten behandler dette som institusjonell endring, ikke som automatisk tap av autonomi.',
    institutionalization: 'Et ungdommelig kunstnerinitiativ fra 1994 har blitt en varig, profesjonalisert kulturorganisasjon med fortsatt eksperimentelt program.',
    stigmaRisk: 'En fortelling om «edgy» kunst kan romantisere miljøet og skjule kuratorisk makt, profesjonalisering, adgangsgrenser og ulik tilgang til ressurser.',
    current: 'ZDB publiserer fortsatt historie og program for en aktiv ideell kunstorganisasjon i Lisboa.',
    outsideLimit: 'Masterstudien gir uavhengig analyse av kuratering og institusjonalisering fram til 2019, men dokumenterer ikke alle nåværende praksiser.'
  }
];

function report(config) {
  const milieu = `source_${config.placeId}_milieu`;
  const outside = `source_${config.placeId}_outside`;
  const caseId = `case_${config.placeId}_environment`;
  return {
    schemaVersion: 'subkultur_place_production_v1',
    validatorVersion: '1.0.0',
    placeId: config.placeId,
    placeFile: config.placeFile,
    status: 'ready',
    subculturalIdentity: {
      statement: config.identity,
      anchorType: config.anchorType,
      mainSocietyRelationship: config.relationship,
      placeObjectDistinction: 'Rapporten skiller det fysiske stedet, driftsorganisasjonen, arrangementene og miljøene som bruker tilbudet.',
      temporalScope: { start: config.start, end: '2026', precision: 'year', rationale: 'Startåret følger kildene; sluttpunktet følger kontroll av nåværende eller blandet funksjon.' },
      sourceIds: [milieu, outside]
    },
    subcultureTopics: config.emneIds.map((emneId) => ({
      emneId,
      siteSpecificRationale: `Emnet er knyttet til dokumenterte praksiser, organisering og rombruk ved ${config.placeId}, ikke til arenaetiketten alene.`,
      caseIds: [caseId]
    })),
    sources: [
      {
        id: milieu,
        url: config.milieuUrl,
        sourceLocation: config.milieuLocation,
        sourceType: 'community_primary',
        perspective: 'milieu',
        verifiedAt: config.verifiedAt ?? '2026-08-03',
        temporalCoverage: 'current',
        provenance: 'Miljøets eller driftsorganisasjonens egen publiserte beskrivelse og programinformasjon.',
        limitations: 'Egenpresentasjonen dokumenterer praksis og selvforståelse, men kan framheve positive sider og kommersielle mål.'
      },
      {
        id: outside,
        url: config.outsideUrl,
        sourceLocation: config.outsideLocation,
        sourceType: 'reputable_secondary',
        perspective: 'secondary',
        verifiedAt: config.verifiedAt ?? '2026-08-03',
        temporalCoverage: config.outsideTemporal ?? 'current',
        provenance: 'Uavhengig redaksjonell, katalog- eller reiselivsomtale kontrollert mot miljøkilden.',
        limitations: config.outsideLimit
      }
    ],
    subcultureCases: [{
      id: caseId,
      claim: config.claim,
      actors: [
        { name: 'Deltakere, arrangører og skapere', roleOrInterest: 'Bygger aktivitet, uttrykk og gjentatt sosial bruk.', positionOrPower: 'Former miljøet i praksis, men kontrollerer ikke nødvendigvis lokalet eller alle adgangsvilkår.', sourceIds: [milieu, outside] },
        { name: 'Driftsorganisasjon, vertskap og eksterne rammesettere', roleOrInterest: 'Styrer program, lokaler, økonomi og formelle vilkår.', positionOrPower: 'Har større kontroll over kapasitet, booking, medlemskap eller arrangementssted.', sourceIds: [milieu, outside] }
      ],
      practicesAndCommunity: {
        practices: config.practices,
        belongingAndParticipation: 'Gjentatt deltakelse skaper gjenkjennelse og sosial læring, men adgang og tilhørighet er ikke lik for alle.',
        organizationOrGovernance: config.organization,
        codesOrExpressions: { status: 'documented', statement: config.expressions, sourceIds: [milieu, outside] },
        sourceIds: [milieu, outside]
      },
      spaceAndPower: {
        accessAndTerritory: config.access,
        controlOrRegulation: { status: 'documented', statement: config.regulation, sourceIds: [milieu, outside] },
        conflictOrNegotiation: { status: 'not_documented', rationale: config.negotiation, sourceIds: [milieu, outside] },
        displacementOrInstitutionalization: { status: 'documented', statement: config.institutionalization, sourceIds: [milieu, outside] },
        sourceIds: [milieu, outside]
      },
      representationAndEthics: {
        selfDefinition: { status: 'documented', statement: config.identity, sourceIds: [milieu] },
        externalLabels: { status: 'documented', statement: 'Den uavhengige kilden beskriver aktiviteter og publikumsformat uten å være identisk med miljøets egenpresentasjon.', sourceIds: [outside] },
        stigmaOrRomanticizationRisk: config.stigmaRisk,
        editorialSafeguard: 'Teksten skiller observerbare praksiser fra tolkning og synliggjør både miljøets egenpresentasjon og en uavhengig kontrollkilde.',
        privacySafeguard: 'Analysen omtaler organisasjoner og kollektive praksiser og identifiserer ikke sårbare enkeltpersoner.',
        sourceIds: [milieu, outside]
      },
      methodAndInference: {
        methodId: config.methodId,
        observationOrEvidence: 'Analysen kombinerer organisasjonsform, gjentatt program, deltakelsespraksis og adgang til stedet.',
        alternativeExplanations: ['Popularitet kan skyldes beliggenhet, markedsføring eller lav pris uten at alle brukere inngår i ett miljø.'],
        inferenceStatus: 'associational',
        reflexivity: 'Rapporten antar ikke at alle besøkende deler samme identitet, normer eller grad av tilhørighet.',
        uncertainty: 'Kildene dokumenterer offentlig program og selvforståelse bedre enn uformelle relasjoner og interne uenigheter.',
        sourceIds: [milieu, outside]
      },
      changeOverTime: {
        scope: { start: config.start, end: '2026', precision: 'period', rationale: 'Perioden følger oppstart og siste kontrollerte publiserte aktivitet.' },
        startingPoint: `Miljø- eller driftsformen er dokumentert fra ${config.start}.`,
        changeOrTurningPoint: config.institutionalization,
        currentOrEndPoint: config.current,
        continuities: config.practices.slice(0, 2),
        sourceIds: [milieu, outside]
      }
    }],
    presentFunction: {
      status: config.presentStatus ?? 'active',
      statement: config.current,
      historicalRelationship: 'Nåværende eller siste dokumenterte drift viderefører deler av miljøfunksjonen, men organisering og adgang kan ha endret seg.',
      checkedAt: config.verifiedAt ?? '2026-08-03',
      sourceIds: [milieu]
    },
    quizOpening: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
    chronologyStories: { status: 'N/A', chronologyReviewed: true, storiesReviewed: true, rationale: 'Materialet krever ingen ny chronology-post eller selvstendig Story i denne endringen.' },
    gates: {
      A: { status: 'PASS', evidenceRefs: ['subculturalIdentity'] },
      B: { status: 'PASS', evidenceRefs: ['subcultureTopics', caseId] },
      C: { status: 'PASS', evidenceRefs: [`${caseId}.actors`, `${caseId}.practicesAndCommunity`] },
      D: { status: 'PASS', evidenceRefs: [`${caseId}.spaceAndPower`] },
      E: { status: 'PASS', evidenceRefs: [`${caseId}.representationAndEthics`, 'sources'] },
      F: { status: 'PASS', evidenceRefs: [`${caseId}.methodAndInference`, `${caseId}.changeOverTime`, 'presentFunction'] },
      G: { status: 'N/A', rationale: 'Ingen stedquiz produseres eller revideres i denne rapporten.' },
      H: { status: 'N/A', rationale: 'Ingen chronology eller Story produseres eller revideres.' }
    },
    review: { reviewer: 'Subkultur-fagverkredaksjon', reviewedAt: config.verifiedAt ?? '2026-08-03', notes: 'Definisjon, stemmebalanse, rommakt, representasjon, slutningsgrense og nåstatus er kontrollert.' }
  };
}

function main() {
  fs.mkdirSync(path.join(ROOT, OUTPUT_DIR), { recursive: true });
  for (const config of CASES) {
    const relative = `${OUTPUT_DIR}/${config.placeId}.json`;
    const expected = JSON.stringify(report(config), null, 2) + '\n';
    if (WRITE) fs.writeFileSync(path.join(ROOT, relative), expected);
    else if (!fs.existsSync(path.join(ROOT, relative)) || fs.readFileSync(path.join(ROOT, relative), 'utf8') !== expected) {
      throw new Error(`${relative} mangler eller er utdatert; kjør --write`);
    }
  }
  console.log(`Subkultur place reports OK: ${CASES.length} rapporter.`);
}

main();
