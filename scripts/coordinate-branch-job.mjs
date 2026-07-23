import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const readJson = async (p) => JSON.parse(await fs.readFile(path.join(root, p), 'utf8'));
const writeJson = async (p, value) => {
  const full = path.join(root, p);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const writeText = async (p, text) => {
  const full = path.join(root, p);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, text, 'utf8');
};

const expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];
const storyPath = 'data/stories/stories_etne_natur_rounds_batch4.json';
const articlePath = 'data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch4.json';
const reportDir = 'reports/etne-natur-rounds-batch4';

const sourceSets = {
  etnefjella: [
    { title: 'Etne kommune – Friluftsområde', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/friluftsomrade/' },
    { title: 'Haugesund Turistforening – lokale hytter', url: 'https://www.dnt.no/dnt-der-du-er/haugesund-turistforening/lokale-hytter/' },
    { title: 'Etnefjellet – Skarstølen som innfallsport', url: 'https://www.etnefjellet.no/' },
    { title: 'Etne kommune – Innlandsfiske', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/innlandsfiske/' }
  ],
  skaneviksfjella: [
    { title: 'Etne kommune – Friluftsområde', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/friluftsomrade/' },
    { title: 'Skånevik idrettslag – Ski', url: 'https://skaanevikidrettslag.no/ski/' },
    { title: 'Skånevik Fjordhotel – bygda og turforslag', url: 'https://www.fjordhotellet.no/bygda' }
  ],
  bokeskogen: [
    { title: 'Etne kommune – Friluftsområde', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/friluftsomrade/' },
    { title: 'Visit Norway / Region Sunnhordland – rundtur via bøkeskogen', url: 'https://www.visitnorway.no/listings/rundtur-i-sk%C3%A5nevik-via-b%C3%B8keskogen-og-postvegbrua/23399/' },
    { title: 'Kringom – Skånevik, morene', url: 'https://kringom.no/nb/sunnhordland/etne/skanevik-morene' }
  ]
};

const configs = {
  etnefjella: {
    file: 'data/places/natur/vestland/etne/etnefjella.json',
    sources: sourceSets.etnefjella,
    tasks: [
      { id: 'etnefjella_les_rutenettet', title: 'Les rutenettet', instruction: 'Fra et trygt, etablert startpunkt eller på kart: finn én merket rute, én hytteforbindelse og én mulig returretning. Ikke bruk områdeankeret som turstart i seg selv.', why: 'Etnefjella er et nettverk av ferdselslinjer og hytter, ikke én topp eller én tur.' },
      { id: 'etnefjella_finn_vannsystemet', title: 'Finn vann i høyfjellet', instruction: 'Bruk utsikt eller kart til å finne minst to vann eller vannløp i fjellområdet og se hvilken retning terrenget leder vannet.', why: 'Kommunen beskriver mange fiskevann, og vann er et gjennomgående element i Etnefjellas topografi og bruk.' },
      { id: 'etnefjella_sammenlign_innfallsporter', title: 'Sammenlign to innfallsporter', instruction: 'Finn Skarstøl og Rus på kartet og sammenlign hvordan de gir tilgang til ulike deler av fjellområdet. Gjør oppgaven uten å kjøre eller gå til et nytt sted.', why: 'Kommunen peker ut begge som veier til fjells, og flere innganger er en del av områdets identitet.' },
      { id: 'etnefjella_helarsblikk', title: 'Se etter helårsspor', instruction: 'Finn ett trekk som hører til sommerbruk og ett som hører til vinterbruk, for eksempel sti, anleggsvei, skiløypekorridor eller snøpreget terreng. Bruk bare det som faktisk er synlig eller kartlagt.', why: 'Etne kommune beskriver Etnefjella som et helårs friluftsområde med både tur-, sykkel- og skimuligheter.' }
    ],
    nature: {
      type: 'høyfjell / vannrik fjellnatur / friluftssystem',
      title: 'Haugalandets høyfjell som nettverk',
      summary: 'Etnefjella er ikke ett enkelt fjell, men et stort høyfjells- og friluftssystem med vann, rygger, daler, ruter og hytter. Etne kommune beskriver området som Haugalandets høyfjell og framhever et merket løypenett med turisthytter fra Seljestad mot Olalia, fiskevann, jaktterreng, skiløyper, kulturminner og flere oppganger fra E134. Veger til Skarstøl og Rus gjør enkelte deler lettere tilgjengelige, og kommunen peker også på anleggsveger som egnet for sykling. Haugesund Turistforening forvalter et større hytte- og T-merket rutenett i Etne- og Saudafjella, mens Skarstølen beskrives lokalt som en sentral innfallsport til Etnefjellet. Dette gjør Etnefjella særlig egnet til å lære forskjellen mellom et områdeanker og et enkelt turmål. History Go-punktet ligger ikke på en offisiell grense, parkeringsplass eller anbefalt start. Det representerer et sammenhengende fjellandskap der brukeren må planlegge den faktiske turen separat. Naturen kan leses gjennom høyde, vær, vann og ferdselslinjer: vannene samler avrenning i fjellterreng, rutene følger pass og daldrag, og årstidene endrer både framkommelighet og risiko. Kommunens innlandsfiskeinformasjon sier at de fleste av rundt førti gode fiskevann i kommunen ligger i Etnefjella, særlig i Sørfjellet og Midtre Etnefjell, og at bilveg til Rus og Skarstøl gjør deler av området lett tilgjengelige. Rundingen skal likevel ikke fylle inn udokumenterte arter eller gjøre hele fjellområdet til én «lett» tur. Etnefjella er et stort system med svært ulike forhold. Gameplay skal derfor bygge på kartlesing, trygg eksisterende rute og observasjon av vann, vær og topografi – ikke på å følge selve områdepunktet.',
      themes: ['høyfjell','rutenett','turisthytter','fiskevann','innfallsporter','helårsfriluftsliv','kartkompetanse'],
      nearby_place_ids: ['stordalsvatnet_etne','etneelva','langfoss_etne'],
      source_boundaries: ['Kartpunktet er et semantisk områdeanker og ikke en turstart eller grense for hele Etnefjella.', 'Opplysninger om hytter og T-merkede ruter gjelder det større Etne- og Saudafjell-systemet der Etnefjella inngår.', 'Ingen oppgave skal anta at en rute er trygg, preparert eller åpen uten separat aktuell turplanlegging.']
    },
    training: {
      title: 'Trygg fjellplanlegging i Etnefjella',
      summary: 'Tre lavintensive øvelser som trener kart, retning og beslutning før eller under en trygg etablert tur.',
      safety: 'Bruk bare planlagt, lovlig og egnet rute. Sjekk oppdatert vær, føre og eventuell skredfare separat før fjelltur. Områdeankeret er ikke en startplass. Snu ved dårlig sikt, usikkert underlag eller forhold som overstiger erfaring og utstyr.',
      exercises: [
        { id: 'etnefjella_trepunkt_kart', title: 'Trepunkt på kartet', instruction: 'Finn eget faktiske startpunkt, et tydelig rutepunkt og planlagt returpunkt. Kontroller at de ligger på samme planlagte ferdselslinje.', duration_minutes: 7, intensity: 'svært lett', why: 'Store fjellområder blir tryggere når områdekartet oversettes til en konkret turplan.' },
        { id: 'etnefjella_rolig_rutelesing', title: 'Rolig rutelesing', instruction: 'Gå rolig i opptil ti minutter på en trygg etablert rute og stopp to ganger for å kontrollere kart, retning og vær.', duration_minutes: 10, intensity: 'lett', why: 'Rutelesing underveis er viktigere enn å navigere mot et abstrakt områdepunkt.' },
        { id: 'etnefjella_vaerretur', title: 'Vær- og retursjekk', instruction: 'Pek ut ett værtegn som kan forverre turen og én tydelig returretning før du går videre.', duration_minutes: 4, intensity: 'svært lett', why: 'Høyfjellsbruk krever kontinuerlig vurdering av både vær og mulighet for å snu.' }
      ]
    },
    civication: [
      ['etnefjella_rutenett_relief','Rutenett-relieffet','landskapsmodell','En fysisk relieffmodell med Etnefjellas vann og hovedforbindelser markert uten å late som de danner én enkelt rute.','Området er definert av nettverket mellom høyfjell, vann, hytter og innfallsporter.','Gjør forskjellen mellom område og turtrasé konkret.'],
      ['etnefjella_skarstol_rus_par','Skarstøl–Rus-paret','innfallsportmodell','To fysiske brikker som viser de dokumenterte vegtilgangene Skarstøl og Rus.','Kommunen peker særskilt på begge som veier til fjells.','Viser at samme fjellområde kan ha flere innganger og bruksretninger.'],
      ['etnefjella_hyttekjede','Hyttekjeden','friluftsmodell','En fysisk kjede som symboliserer hytte- og rutenettet fra Seljestad-retningen mot Olalia.','Kommunen beskriver nettopp et merket løypenett med turisthytter gjennom området.','Dokumenterer organisert friluftsinfrastruktur uten å gjøre den til en naturgrense.'],
      ['etnefjella_helarskort','Helårskortet','sesongobjekt','Et todelt fysisk kort med sommersti/vann og vinterspor/snø.','Etnefjella brukes gjennom året og kommunen framhever både tur-, sykkel- og skimuligheter.','Gjør sesongskiftet til en del av hvordan samme landskap leses.']
    ],
    brands: [
      { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
      { id: 'haugesund_turistforening', name: 'Haugesund Turistforening', brand_kind: 'outdoor_life_actor', brand_type: 'dnt_member_association' },
      { id: 'dnt', name: 'Den Norske Turistforening', brand_kind: 'outdoor_life_actor', brand_type: 'national_trail_and_cabin_network' },
      { id: 'etnefjellet', name: 'Etnefjellet', brand_kind: 'local_access_actor', brand_type: 'skarsstol_mountain_access' },
      { id: 'etnefjella', name: 'Etnefjella', brand_kind: 'place_identity', brand_type: 'mountain_region' }
    ],
    forNa: {
      title: 'Fra fjellterreng til sammenhengende friluftsnett',
      before: 'Fjell, vann og gamle ferdselslinjer fantes før dagens organiserte rutenett, hytter, vegtilganger og vinterspor gjorde deler av området enklere å planlegge og bruke.',
      now: 'Etnefjella beskrives som et helårs friluftsområde med merkede forbindelser, turisthytter, fiskevann og flere innfallsporter, samtidig som store deler fortsatt må møtes som høyfjell og ikke som et anlegg.',
      change: 'Organisert friluftsinfrastruktur har gjort et stort fjellandskap mer lesbart og tilgjengelig uten å gjøre det til ett ensartet eller risikofritt område.',
      lookFor: ['merket ferdselslinje','vann og vannløp','skiftende høyde og terreng','spor etter sommer- og vinterbruk','forskjellen mellom områdekart og faktisk rute']
    },
    story: {
      id: 'st_etnefjella_fra_omrade_til_nettverk',
      title: 'Fra fjellområde til nettverk',
      summary: 'Etnefjella viser hvordan hytter, ruter og innfallsporter gjør et stort høyfjell lesbart uten å gjøre det til én tur.',
      story: 'Et fjellområde kan se enkelt ut på et oversiktskart. Ett navn ligger over et stort felt: Etnefjella. Men i terrenget finnes ingen enkelt inngang, ingen enkelt topp og ingen rute som alene kan representere hele området.\n\nEtne kommune beskriver et merket løypenett med turisthytter fra Seljestad mot Olalia, mange fiskevann, jaktterreng, skiløyper og flere oppganger fra E134. Skarstøl og Rus trekkes fram som vegtilganger til fjellet. Haugesund Turistforening organiserer hytter og T-merkede forbindelser i det større Etne- og Saudafjell-systemet. Slik blir fjellet gradvis til et nettverk.\n\nNettverket forandrer hvordan landskapet kan brukes. En hytte gjør en lengre ferd mulig. En merket rute gjør retningen lettere å lese. En veg til Skarstøl eller Rus flytter startpunktet opp i terrenget. Men infrastrukturen fjerner ikke været, høydeforskjellene eller behovet for å planlegge.\n\nDet er derfor History Go-markøren ikke skal følges som en navigasjonspil. Den er et områdeanker. Spilleren må velge en faktisk, trygg rute og lese landskapet derfra: vannene, passene, retningen og sesongen.\n\nEtnefjellas historie er i denne sammenhengen ikke historien om én attraksjon. Det er historien om hvordan et stort høyfjell blir forståelig gjennom et nett av steder, samtidig som fjellet fortsetter å være større enn nettverket.'
    },
    article: {
      title: 'Etnefjella',
      popup: 'Haugalandets høyfjell som et nettverk av vann, ruter, hytter og flere innfallsporter.',
      paragraphs: [
        'Etnefjella er et stort høyfjellsområde og skal ikke forstås som én topp. Etne kommune beskriver området som Haugalandets høyfjell og et viktig helårs friluftsområde.',
        'Kommunen oppgir et merket løypenett med turisthytter fra Seljestad mot Olalia, samt fiskevann, jaktterreng, skiløyper og kulturminner.',
        'Flere oppganger kommer fra E134. Veg til fjells ved Skarstøl og Rus gjør disse til tydelige innfallsporter, mens anleggsveger også brukes til sykling.',
        'Haugesund Turistforening har hytte- og T-merket rutenett i Etne- og Saudafjella. Etnefjella må derfor leses som del av et større organisert fjellsystem, uten at alle ruter og hytter ligger innenfor ett presist History Go-område.',
        'Kommunens innlandsfiskeinformasjon sier at de fleste av rundt førti gode fiskevann i Etne ligger i Etnefjella, særlig i Sørfjellet og Midtre Etnefjell.',
        'History Go-markøren er et semantisk områdeanker. Faktisk ferdsel må planlegges fra reelle startpunkter og aktuelle rute-, vær- og føreforhold.'
      ],
      facts: [
        ['01','Haugalandets høyfjell','Etne kommune omtaler Etnefjella som høyfjellsområdet på Haugalandet.'],
        ['02','Merket rutenett','Kommunen beskriver et merket løypenett gjennom fjellområdet.'],
        ['03','Turisthytter','Turisthytter er del av det organiserte friluftsnettet.'],
        ['04','Seljestad mot Olalia','Kommunen beskriver løypenettet med forbindelser fra Seljestad-retningen mot Olalia.'],
        ['05','Skarstøl','Skarstøl er en dokumentert vegtilgang og lokal innfallsport til fjellet.'],
        ['06','Rus','Kommunen oppgir også veg til fjells ved Rus.'],
        ['07','Mange fiskevann','De fleste av kommunens rundt førti gode fiskevann ligger i Etnefjella.'],
        ['08','Helårsbruk','Området har både sommer- og vinterbruk.'],
        ['09','DNT-nettverk','Haugesund Turistforening har hytter og T-merkede ruter i det større Etne- og Saudafjell-systemet.'],
        ['10','Områdeanker','History Go-punktet er ikke en turstart eller en presis grense.']
      ]
    }
  },
  skaneviksfjella: {
    file: 'data/places/natur/vestland/etne/skaneviksfjella.json',
    sources: sourceSets.skaneviksfjella,
    tasks: [
      { id: 'skaneviksfjella_finn_ost_vest', title: 'Finn øst–vest-spennet', instruction: 'Bruk kartet til å finne Børkjenesnuten i vest og Dalanuten i øst. Ikke forsøk å oppsøke begge som del av samme oppgave.', why: 'Kommunen bruker disse ytterpunktene for å beskrive bredden i fjellområdet.' },
      { id: 'skaneviksfjella_sammenlign_merking', title: 'Sammenlign merking', instruction: 'Velg én faktisk planlagt rute og sjekk om kilden beskriver den som merket, delvis merket eller uten tydelig merking. Anta aldri at hele fjellområdet er likt merket.', why: 'Kommunen sier eksplisitt at merkingen varierer mellom toppene.' },
      { id: 'skaneviksfjella_valdra_miljasaeter', title: 'Finn Valdra og Miljasæter', instruction: 'Finn Valdra og Miljasæter på kartet og se hvordan de fungerer som lokale innganger til fjellområdet. Gjør oppgaven som kartlesing dersom du ikke allerede er på trygg rute.', why: 'Kommunen og Skånevik IL dokumenterer begge stedene som viktige ferdsels- og vinterpunkter.' },
      { id: 'skaneviksfjella_sesongskifte', title: 'Les sesongskiftet', instruction: 'Finn ett spor eller kartlag for fottur og ett for vinterbruk. Forklar hva som må endres i planleggingen når underlaget går fra bar mark til snø.', why: 'Skånevik IL setter skispor fra Valdra og Miljasæter når snøforholdene tillater det.' }
    ],
    nature: {
      type: 'fjellområde / rygger og topper / bygdenært friluftsliv',
      title: 'Fjellforbindelsen mellom Etne og Skånevik',
      summary: 'Skåneviksfjella er fjellområdet mellom Etne og Skånevik og består av mange rygger, topper og lokale ferdselslinjer. Etne kommune beskriver området fra Børkjenesnuten i vest til Dalanuten i øst og understreker at merkingen varierer mellom rutene. Det er viktig for History Go: en områdemarkør må ikke gi inntrykk av at hele fjellområdet er én sammenhengende, likt merket tursti. Kommunen trekker fram turmuligheter fra Skånevik mot Valdra og Prestafjellet, mot Miljasæter og Leknesnibbane, samt mot Veten eller Stødlehetta via postvegen. Skånevik idrettslag viser at Valdra og Miljasæter også fungerer som vinterinnganger. Når det er nok snø, kjøres skiløyper fra begge steder; klubben beskriver en omtrent fem kilometer lang runde fra Miljasæter om Skjeldalskarsmyrane og en omtrent ni kilometer lang trase Valdra–Miljasæter tur-retur. Disse tallene beskriver konkrete skiløypetraseer og skal ikke brukes som mål på hele Skåneviksfjella. Lokale turbeskrivelser peker også på Prestafjellet og Leknesnepa som egne turmål. Naturprofilen skal derfor handle om fjellområdet som forbindelseslandskap: flere bygdenære innganger, varierende merking, ulike topper og tydelig sesongbruk. Markøren er et semantisk områdeanker ved Miljasæter og ikke en anbefalt start. Fysiske oppgaver skal bare utføres på en faktisk valgt og trygg rute. Om vinteren må løypestatus og forhold kontrolleres separat; om sommeren må brukeren ikke anta at en vintertrase er en merket sommersti.',
      themes: ['fjellrygger','topper','Valdra','Miljasæter','varierende merking','sesongløyper','bygdeforbindelser'],
      nearby_place_ids: ['skanevik_sentrum','postvegen_etne_skanevik','bokeskogen_milja'],
      source_boundaries: ['Kartpunktet er et områdeanker ved Miljasæter og ikke en presis start eller grense for Skåneviksfjella.', 'De dokumenterte 5 km og 9 km gjelder konkrete skiløypetraseer når det er nok snø, ikke hele fjellområdet.', 'Varierende merking betyr at hver faktisk tur må planlegges og kontrolleres separat.']
    },
    training: {
      title: 'Trygg rute- og sesonglesing i Skåneviksfjella',
      summary: 'Tre lette øvelser for å skille område, faktisk rute og sesongforhold.',
      safety: 'Velg en konkret etablert rute før fysisk aktivitet. Ikke naviger mot områdeankeret. Kontroller merking, vær, føre og vinterløypestatus separat. Skiløyper er sesongavhengige, og en vintertrasé er ikke automatisk en sommersti.',
      exercises: [
        { id: 'skaneviksfjella_rutevalg', title: 'Velg én faktisk rute', instruction: 'Finn ett konkret turmål og det reelle startpunktet før du beveger deg. Marker returveien på kartet.', duration_minutes: 6, intensity: 'svært lett', why: 'Området består av mange ruter med ulik merking og skal ikke behandles som én trasé.' },
        { id: 'skaneviksfjella_rolig_linjelesing', title: 'Rolig linjelesing', instruction: 'Gå rolig i opptil ti minutter på trygg etablert rute og sjekk om terreng og merking stemmer med kartet.', duration_minutes: 10, intensity: 'lett', why: 'Samsvar mellom kart, terreng og merking er sentralt i et område med varierende rutegrad.' },
        { id: 'skaneviksfjella_sesongsjekk', title: 'Sesongsjekk', instruction: 'Formuler én forskjell mellom dagens faktiske forhold og hvordan samme område kan brukes i en annen årstid.', duration_minutes: 4, intensity: 'svært lett', why: 'Fjellområdet brukes både til fotturer og preparerte skiløyper, men ikke på samme måte samtidig.' }
      ]
    },
    civication: [
      ['skaneviksfjella_ostvest_relief','Øst–vest-relieffet','landskapsmodell','En fysisk modell som markerer Børkjenesnuten i vest og Dalanuten i øst som kommunens beskrevne spenn.','Ytterpunktene konkretiserer størrelsen uten å gjøre området til én rute.','Gjør fjellområdet lesbart som bredt overgangslandskap.'],
      ['skaneviksfjella_valdra_milja_par','Valdra–Miljasæter-paret','innfallsportmodell','To fysiske brikker for de dokumenterte lokale inngangene og vinterløypene.','Begge stedene framheves av kommune og idrettslag som ferdselspunkter.','Viser hvordan bygdenære innganger organiserer bruken av fjellet.'],
      ['skaneviksfjella_5_9_spor','5/9-km-sporet','sesongmodell','En fysisk skisporbrikke med de dokumenterte 5 km- og 9 km-traseene markert som sesongruter.','Lengdene er spesifikke for Skånevik ILs løypenett fra Miljasæter og Valdra.','Dokumenterer vinterbruk uten å gjøre skiløypene til helårs naturgrenser.'],
      ['skaneviksfjella_merkingsskala','Merkingsskalaen','ruteobjekt','Et fysisk kort med flere nivåer av rutemerking og et tydelig spørsmålstegn.','Kommunen understreker at merkingen varierer mellom toppene.','Lærer at ruteinformasjon må kontrolleres konkret før ferdsel.']
    ],
    brands: [
      { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
      { id: 'skanevik_idrettslag', name: 'Skånevik Idrettslag', brand_kind: 'sports_and_outdoor_actor', brand_type: 'local_ski_trail_actor' },
      { id: 'skanevik_fjordhotel', name: 'Skånevik Fjordhotel', brand_kind: 'local_destination_actor', brand_type: 'local_hiking_information' },
      { id: 'skaneviksfjella', name: 'Skåneviksfjella', brand_kind: 'place_identity', brand_type: 'mountain_region' },
      { id: 'kartverket', name: 'Kartverket', brand_kind: 'public_actor', brand_type: 'place_name_authority' }
    ],
    forNa: {
      title: 'Fra lokale ferdselslinjer til sesongbasert løypenett',
      before: 'Fjellrygger, seterveger og lokale forbindelser mellom bygdene eksisterte før dagens turmerking og maskinpreparerte vinterspor organiserte deler av ferdselen tydeligere.',
      now: 'Skåneviksfjella brukes gjennom flere innganger og årstider, med varierende merking på sommerruter og preparerte skiløyper fra Valdra og Miljasæter når snøforholdene tillater det.',
      change: 'Organisert rute- og løypeinformasjon har gjort deler av fjellområdet lettere å bruke, men har ikke gjort hele landskapet likt merket eller tilgjengelig.',
      lookFor: ['faktisk rutemerking','retningen mellom Valdra og Miljasæter','forskjellen på sti og vinterspor','rygger og topper som deler landskapet','avstanden mellom områdeanker og faktisk startpunkt']
    },
    story: {
      id: 'st_skaneviksfjella_fjellet_med_mange_innganger',
      title: 'Fjellet med mange innganger',
      summary: 'Skåneviksfjella viser hvordan ett fjellområde kan ha mange lokale ruter, varierende merking og helt ulike sesonglinjer.',
      story: 'Mellom Etne og Skånevik ligger et fjellområde som ikke lar seg redusere til én tur. Etne kommune beskriver Skåneviksfjella fra Børkjenesnuten i vest til Dalanuten i øst og peker på flere ruter mot Valdra, Prestafjellet, Miljasæter, Leknesnibbane, Veten og Stødlehetta.\n\nDet avgjørende ordet i kommunens beskrivelse er «varierande». Merkingen er ikke lik overalt. Et områdekart kan derfor ikke brukes som løfte om en sammenhengende merket sti. Hver tur må velges som en egen ferdselslinje.\n\nOm vinteren får landskapet enda et lag. Skånevik idrettslag setter spor fra Valdra og Miljasæter når det er nok snø. Klubben beskriver en fem kilometers runde fra Miljasæter og en ni kilometers forbindelse Valdra–Miljasæter tur-retur. Når snøen forsvinner, er ikke disse sporene lenger det samme landskapet i praksis.\n\nSlik blir Skåneviksfjella et godt sted for å lære forskjellen mellom område og rute, og mellom sommer- og vinterkart. En rød linje på ett kart kan være et skiløypespor. Et annet kart kan vise en postveg eller en fottur mot en topp.\n\nHistory Go-markøren er derfor bare et anker for helheten. Den riktige fysiske handlingen begynner først når spilleren har valgt en reell start, en konkret rute og forhold som passer den dagen.'
    },
    article: {
      title: 'Skåneviksfjella',
      popup: 'Fjellområdet mellom Etne og Skånevik med mange topper, flere innganger, varierende merking og sesongbaserte skiløyper.',
      paragraphs: [
        'Skåneviksfjella er fjellområdet mellom Etne og Skånevik. Etne kommune beskriver et spenn fra Børkjenesnuten i vest til Dalanuten i øst.',
        'Kommunen trekker fram turer fra Skånevik mot Valdra og Prestafjellet, Miljasæter, Leknesnibbane og mot Veten eller Stødlehetta via postvegen.',
        'Merkingen varierer mellom rutene. Derfor må en faktisk tur planlegges separat; History Go-områdeankeret er ikke en turstart.',
        'Skånevik idrettslag bruker Valdra og Miljasæter som innganger til preparerte skiløyper når det er nok snø.',
        'Klubben beskriver en omtrent fem kilometer lang runde fra Miljasæter om Skjeldalskarsmyrane og en omtrent ni kilometer lang trase Valdra–Miljasæter tur-retur.',
        'Sesongløypene viser at samme fjellområde kan ha ulike ferdselsnett gjennom året. En vintertrasé er ikke automatisk en merket sommersti.'
      ],
      facts: [
        ['01','Mellom Etne og Skånevik','Kommunen definerer Skåneviksfjella som fjellområdet mellom de to bygdene.'],
        ['02','Børkjenesnuten i vest','Børkjenesnuten brukes som vestlig referanse i kommunens områdebeskrivelse.'],
        ['03','Dalanuten i øst','Dalanuten brukes som østlig referanse.'],
        ['04','Varierende merking','Kommunen sier at merkingen til de ulike toppene varierer.'],
        ['05','Valdra og Prestafjellet','Dette er blant de framhevede lokale turretningene.'],
        ['06','Miljasæter','Miljasæter er både turmål/innfallsport og startområde for vinterspor.'],
        ['07','Fem kilometers runde','Skånevik IL beskriver en ca. 5 km skiløyperunde fra Miljasæter.'],
        ['08','Ni kilometer Valdra–Miljasæter','Klubben beskriver ca. 9 km tur-retur mellom Valdra og Miljasæter.'],
        ['09','Sesongavhengig','Skisporene settes når det er nok snø.'],
        ['10','Område, ikke én rute','History Go-markøren representerer helheten og ikke en bestemt trasé.']
      ]
    }
  },
  bokeskogen_milja: {
    file: 'data/places/natur/vestland/etne/bokeskogen_milja.json',
    sources: sourceSets.bokeskogen,
    tasks: [
      { id: 'bokeskogen_milja_les_skogsrommet', title: 'Les skogsrommet', instruction: 'Følg den tilrettelagte naturstien og finn forskjellen mellom trestammer, trekroner og skogbunn uten å forlate stien.', why: 'Bøkeskogen er et konkret skogsmiljø der vertikal struktur kan observeres direkte.' },
      { id: 'bokeskogen_milja_finn_moreneformen', title: 'Finn moreneformen', instruction: 'Fra natursti eller trygg ferdsel: se etter en ryggform i terrenget og sammenlign høyde med området på begge sider. Ikke grav eller gå ut i bratt kant.', why: 'Kringom beskriver bøkeskogen som voksende på Skånevikmorenen.' },
      { id: 'bokeskogen_milja_infotavle', title: 'Bruk én infotavle', instruction: 'Velg én infotavle på naturstien, les ett konkret poeng om skog eller økologi og finn noe i omgivelsene som faktisk passer til teksten.', why: 'Naturstien er dokumentert med infotavler om skog og økologi.' },
      { id: 'bokeskogen_milja_skog_kulturlandskap', title: 'Finn overgangen til kulturlandskapet', instruction: 'Fra trygg rute: finn et punkt der skogsmiljøet åpner seg mot gårds-, vei- eller annet kulturlandskap og beskriv kontrasten.', why: 'Bøkeskogen inngår i en lettgått rundtur gjennom kulturlandskapet sør for Skånevik.' }
    ],
    nature: {
      type: 'bøkeskog / morenerygg / natursti',
      title: 'Bøkeskog på istidslandskap',
      summary: 'Bøkeskogen på Milja er et lite, tydelig skogsområde med en tilrettelagt natursti, men stedet blir langt rikere når skogen leses sammen med bakken den vokser på. Etne kommune beskriver skogen som omkring hundre år gammel. Kringom knytter den direkte til moreneryggen i Skånevik og omtaler den som en omtrent hundre år gammel plantet bøkeskog og en av de nordligste bøkeskogene i landet. Moreneryggen er best utviklet mellom Miljaelva og Valdraelva. Der har bekker skåret seg gjennom avsetningen, som enkelte steder er opptil ti meter høy og 35 meter bred. Dermed kan skog og geologi observeres i samme område: trærne danner dagens skogrom, mens terrengformen under dem ble skapt i sluttfasen av istiden. Kringom beskriver også hvordan breen transporterte frostforvitret stein rundt Prestafjellet og bygget opp ryggen, mens havet senere bearbeidet deler av landskapet da havnivået stod høyere. Den større geologiske historien hører primært hjemme ved den separate markøren for Skånevikmorenen, men bøkeskogen kan vise den fysisk i mindre skala. Visit Norway/Region Sunnhordland beskriver en lett, grønn rundtur på omtrent tre kilometer gjennom kulturlandskapet sør for Skånevik, der en ekstrasløyfe går innom naturstien med infotavler om skog og økologi. Dette gir Bøkeskogen en svært konkret gameplay-fordel: oppgavene kan holdes til den tilrettelagte naturstien og bygge på det brukeren faktisk ser. Rundingen skal ikke lage et artsinventar uten dokumentasjon. Den skal fokusere på skogstruktur, bøk som dominerende visuelt element, naturstien, moreneryggens form og overgangen mellom skog og kulturlandskap.',
      themes: ['bøkeskog','natursti','morene','istidslandskap','skogstruktur','kulturlandskap','nærnatur'],
      nearby_place_ids: ['moreneryggen_skanevik','skaneviksfjella','skanevik_sentrum'],
      source_boundaries: ['Kartpunktet er et semantisk Milja-anker og ikke en offisiell skogspolygon.', 'Den detaljerte kvartærgeologiske historien gjelder Skånevikmorenen som større landskapsform; Bøkeskogen er skogsområdet som vokser på deler av ryggen.', 'Ingen udokumentert flora- eller faunaliste skal fylles inn i naturprofilen.']
    },
    training: {
      title: 'Rolig naturstirunde i Bøkeskogen',
      summary: 'Tre lette øvelser for skogobservasjon på den tilrettelagte stien.',
      safety: 'Hold deg på naturstien eller annen tydelig lovlig ferdsel, ta hensyn til privat grusveg, landbruk og eventuelle beitedyr, og unngå glatte røtter og bratte kanter. Oppgavene krever ikke at du forlater stien eller klatrer på moreneryggen.',
      exercises: [
        { id: 'bokeskogen_milja_rolig_skogsgang', title: 'Rolig skogsgang', instruction: 'Gå rolig i åtte minutter på naturstien og legg merke til hvordan lys, lyd og sikt endrer seg gjennom skogrommet.', duration_minutes: 8, intensity: 'lett', why: 'Bøkeskogens tette trekroner og åpne partier kan oppleves direkte uten krevende aktivitet.' },
        { id: 'bokeskogen_milja_tre_lag', title: 'Tre lag i skogen', instruction: 'Stå stille på stien og finn ett trekk ved skogbunnen, ett ved stammene og ett i trekronene.', duration_minutes: 5, intensity: 'svært lett', why: 'Øvelsen gjør skogens vertikale struktur konkret.' },
        { id: 'bokeskogen_milja_terrengbalanse', title: 'Terreng og balanse', instruction: 'På en trygg, jevn del av stien går du sakte og ser fem meter fram for å planlegge fotplassering rundt røtter og ujevnt underlag. Stopp før bratt eller glatt parti.', duration_minutes: 5, intensity: 'lett', why: 'Øvelsen trener trygg ferdsel på skogssti uten å gjøre naturstien til treningsanlegg.' }
      ]
    },
    civication: [
      ['bokeskogen_milja_morene_skog_snitt','Morene–skog-snittet','landskapsmodell','En fysisk tverrsnittsmodell med morenerygg under et bøkeskogsdekke.','Bøkeskogen vokser på den dokumenterte Skånevikmorenen.','Kobler dagens skogrom til istidslandskapet under.'],
      ['bokeskogen_milja_naturstikort','Naturstikortet','stikart','Et fysisk samlekart over naturstisløyfen med infotavler markert som læringspunkter.','Den tilrettelagte naturstien er et av stedets tydeligste dokumenterte kjennetegn.','Gjør pedagogisk tilrettelegging til del av stedets historie.'],
      ['bokeskogen_milja_100arsring','Hundreårsringen','tidsobjekt','En fysisk trering-brikke merket «om lag 100 år», uten å late som den er et faktisk treboringsprøve.','Både kommunen og Kringom beskriver skogen som omtrent hundre år gammel.','Gjør den dokumenterte aldersbeskrivelsen konkret uten falsk presisjon.'],
      ['bokeskogen_milja_10x35_relief','10 × 35-relieffet','geologimodell','En fysisk profil av moreneryggens dokumenterte maksimalmål på opptil 10 meter høy og 35 meter bred.','Målene beskriver moreneryggen der bøkeskogen vokser, ikke selve skogens utstrekning.','Viser skalaen på terrengformen under skogen.']
    ],
    brands: [
      { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
      { id: 'region_sunnhordland', name: 'Region Sunnhordland', brand_kind: 'destination_actor', brand_type: 'hiking_information_source' },
      { id: 'kringom', name: 'Kringom', brand_kind: 'cultural_and_natural_history_actor', brand_type: 'regional_knowledge_source' },
      { id: 'bokeskogen_milja', name: 'Bøkeskogen på Milja', brand_kind: 'place_identity', brand_type: 'beech_forest' },
      { id: 'skanevikmorenen', name: 'Skånevikmorenen', brand_kind: 'landform_identity', brand_type: 'moraine_ridge' }
    ],
    forNa: {
      title: 'Fra istidsrygg til hundreårig skogrom',
      before: 'Moreneryggen ble dannet da bre, frostforvitret stein, smeltevann og senere havnivå formet Skåneviklandskapet lenge før dagens skog fantes.',
      now: 'En omtrent hundre år gammel plantet bøkeskog vokser på deler av ryggen, og en tilrettelagt natursti gjør både skog og økologi tilgjengelig som nærnatur.',
      change: 'Et gammelt istidslandskap har fått et nytt biologisk og sosialt lag: bøkeskogen og naturstien gjør geologien til et skogrom mennesker kan gå gjennom og lære i.',
      lookFor: ['ryggformen i terrenget','bøkestammer og trekroner','natursti og infotavler','bekker som skjærer i terrenget','overgangen mellom skog og kulturlandskap']
    },
    story: {
      id: 'st_bokeskogen_milja_skogen_pa_isen',
      title: 'Skogen som vokser på isens rygg',
      summary: 'Bøkeskogen på Milja er omkring hundre år gammel, men bakken under den forteller en historie fra slutten av istiden.',
      story: 'Når man går inn i Bøkeskogen på Milja, er det lett å tro at trærne er hele historien. Skogen er omkring hundre år gammel og naturstien er tilrettelagt med informasjon om skog og økologi. Men under røttene ligger et langt eldre landskap.\n\nKringom beskriver bøkeskogen som voksende på Skånevikmorenen. Da breen lå over området, stakk Prestafjellet opp, mens stein fra frostforvitret fjell og materiale breen selv rev løs ble transportert rundt fjellet. Dette materialet ble samlet i en morenerygg.\n\nMellom Miljaelva og Valdraelva er ryggen særlig tydelig. Den kan være opptil ti meter høy og 35 meter bred, og bekkene har skåret seg gjennom den. Mye senere kom bøkeskogen som et nytt lag over denne formen.\n\nI dag går en natursti gjennom skogen. Den inngår også som en avstikker på en lett rundtur gjennom kulturlandskapet sør for Skånevik. Dermed kan en besøkende på kort avstand bevege seg mellom skog, gårdslandskap, gamle ferdselslinjer og en terrengform fra slutten av istiden.\n\nHistory Go skiller likevel mellom stedene. Skånevikmorenen har sin egen markør for den større geologiske historien. Bøkeskogen er stedet der skogrommet og morenen møtes. Oppgaven er ikke å samle flest mulig artsnavn, men å se hvordan ulike tidslag kan ligge oppå hverandre i samme landskap.'
    },
    article: {
      title: 'Bøkeskogen på Milja',
      popup: 'Omtrent hundre år gammel bøkeskog med natursti, lagt over deler av den store Skånevikmorenen.',
      paragraphs: [
        'Etne kommune beskriver Bøkeskogen på Milja som en omkring hundre år gammel skog med tilrettelagt natursti.',
        'Kringom omtaler skogen som en omtrent hundre år gammel plantet bøkeskog og en av de nordligste bøkeskogene i landet.',
        'Skogen vokser på deler av Skånevikmorenen. Moreneryggen er særlig tydelig mellom Miljaelva og Valdraelva.',
        'Kringom oppgir at ryggen kan være opptil ti meter høy og 35 meter bred. Bekker har skåret seg gjennom den.',
        'Visit Norway/Region Sunnhordland beskriver bøkeskogen som en avstikker på en grønn rundtur på omtrent tre kilometer og 45–60 minutter gjennom kulturlandskapet sør for Skånevik.',
        'Naturstien har infotavler om skog og økologi. History Go-profilen bruker denne dokumenterte tilretteleggingen og fyller ikke inn udokumenterte artslister.'
      ],
      facts: [
        ['01','Omkring hundre år','Kommunen og Kringom beskriver skogen som omtrent hundre år gammel.'],
        ['02','Plantet bøkeskog','Kringom omtaler bestanden som plantet bøkeskog.'],
        ['03','En av de nordligste','Kringom beskriver den som en av de nordligste bøkeskogene i landet.'],
        ['04','Natursti','Skogen har en tilrettelagt natursti.'],
        ['05','Infotavler','Rundturbeskrivelsen oppgir infotavler om skog og økologi.'],
        ['06','På Skånevikmorenen','Bøkeskogen vokser på deler av moreneryggen i Skånevik.'],
        ['07','Opptil 10 meter høy','Moreneryggen kan ifølge Kringom være opptil ti meter høy.'],
        ['08','Opptil 35 meter bred','Ryggen kan være opptil 35 meter bred på det meste.'],
        ['09','Grønn rundtur','Bøkeskogen inngår som avstikker på en lett grønn rundtur gjennom kulturlandskapet.'],
        ['10','Semantisk kartanker','History Go-punktet er et Milja-anker og ikke en offisiell polygon for skoggrensen.']
      ]
    }
  }
};

const makeCivi = ([id,title,type,desc,reason,fn]) => ({ id,title,type,kind:'physical_object',desc,placeSpecificReason:reason,historicalFunction:fn,physicalObject:true,placeSpecific:true,storePrice:35,currency:'PC',collection:'etne_natur',collectable:true });
const stories = [];
const articles = [];

for (const [id,cfg] of Object.entries(configs)) {
  const rows = await readJson(cfg.file);
  const place = rows.find((x) => x.id === id);
  if (!place) throw new Error(`Missing ${id}`);
  if ('rounds' in place || 'rundinger' in place) throw new Error(`${id} has manual round override`);
  place.tasks_profile = { title:`Oppgaver ved ${place.name}`, summary:'Fire kildeledede, stedsspesifikke og sikkerhetsavgrensede handlinger.', tasks:cfg.tasks };
  place.nature_profile = cfg.nature;
  place.training_profile = cfg.training;
  place.civication_store = cfg.civication.map(makeCivi);
  place.brands = cfg.brands;
  place.for_na = { ...cfg.forNa, sources:cfg.sources.map((s) => s.url) };
  const existingLinks = Array.isArray(place.externalLinks) ? place.externalLinks : [];
  for (const s of cfg.sources) {
    if (!existingLinks.some((x) => x.url === s.url)) existingLinks.push({ type:'official', label:s.title, url:s.url, lang:'nb', verifiedAt:'2026-07-23' });
  }
  place.externalLinks = existingLinks;
  await writeJson(cfg.file, rows);

  stories.push({ id:cfg.story.id,type:'environmental',title:cfg.story.title,year:place.year ?? null,place_id:id,person_id:null,summary:cfg.story.summary,story:cfg.story.story,sources:cfg.sources,tags:place.tags || [],related_people:[],related_places:cfg.nature.nearby_place_ids,score:{narrative:5,historical:4,source:5,play_value:5,originality:4,total:23},arc:{start:cfg.story.summary,middle:cfg.forNa.change,end:cfg.nature.source_boundaries[0]},next_scenes:cfg.nature.nearby_place_ids.slice(0,2).map((place_id)=>({place_id,reason:`Neste landskapsledd fra ${place.name}.`})) });
  articles.push({ place_id:id,visual:{designCode:'article_nature_route_miniature'},version:2,title:cfg.article.title,popupDesc:cfg.article.popup,wikiText:cfg.article.paragraphs,summary:{one_liner:cfg.article.popup,themes:cfg.nature.themes,tone:['nøktern','faglig','stedsspesifikk','sikkerhetsstyrt']},facts:cfg.article.facts.map(([s,l,d])=>({id:`fact_${id}_${s}`,label:l,desc:d,confidence:'high',sources:[cfg.sources[0].title]})),chronology:[{id:`chrono_${id}_01`,year:place.year ?? null,period:place.period || 'Landskap og bruk',desc:cfg.forNa.before,confidence:'high',sources:[cfg.sources[0].title]},{id:`chrono_${id}_02`,year:2026,period:'Komplett rundingsprofil',desc:'History Go samler kildeledet naturinnhold og sikkerhetsavgrenset gameplay.',confidence:'high',sources:['History Go place data']}],sources:cfg.sources.map((s,i)=>({id:`source_${id}_${String(i+1).padStart(2,'0')}`,label:s.title,type:'external_reference',url:s.url,confidence:'high'})),interpretation:{what_to_notice:cfg.forNa.lookFor,why_it_matters:[cfg.story.summary,cfg.forNa.change],counterpoints:cfg.nature.source_boundaries},links:{entry_ids:[cfg.story.id],related_places:cfg.nature.nearby_place_ids,related_people:[]} });
}

await writeJson(storyPath, stories);
await writeJson(articlePath, articles);
const storyManifest = await readJson('data/stories/stories_manifest.json');
for (const id of Object.keys(configs)) if (!storyManifest.files.some((x)=>x.entity_id===id && x.path===storyPath)) storyManifest.files.push({category:'natur',entity_id:id,path:storyPath});
await writeJson('data/stories/stories_manifest.json',storyManifest);
const lexManifest = await readJson('data/leksikon/manifest.json');
if (!lexManifest.files.includes(articlePath)) lexManifest.files.push(articlePath);
await writeJson('data/leksikon/manifest.json',lexManifest);

const testPath='tests/etne-natur-rounds-batch4.test.js';
const targets=Object.fromEntries(Object.entries(configs).map(([id,c])=>[id,c.file]));
const test=`const assert=require('assert');const fs=require('fs');const path=require('path');const repo=path.resolve(__dirname,'..');const read=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));const rt=fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8');const m=rt.match(/natur:\\s*\\[([^\\]]+)\\]/);assert(m);const expected=['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];assert.deepStrictEqual(JSON.parse('['+m[1]+']'),expected);const targets=${JSON.stringify(targets)};const stories=read('${storyPath}');const articles=read('${articlePath}');const sm=read('data/stories/stories_manifest.json');const lm=read('data/leksikon/manifest.json');for(const[id,file]of Object.entries(targets)){const p=read(file).find(x=>x.id===id);assert(p);assert(!('rounds'in p)&&!('rundinger'in p));const s=stories.find(x=>x.place_id===id);const a=articles.find(x=>x.place_id===id);const content={tasks:p.tasks_profile,nature:p.nature_profile,badges:p.underbadge_ids,training:p.training_profile,civication:p.civication_store,brands:p.brands,før_nå:p.for_na,fortellinger:s?[s]:[],leksikon:a?[a]:[]};assert.deepStrictEqual(Object.keys(content),expected);for(const[k,v]of Object.entries(content))assert(Array.isArray(v)?v.length>0:v&&typeof v==='object',id+' mangler '+k);assert.strictEqual(p.tasks_profile.tasks.length,4);assert.strictEqual(p.training_profile.exercises.length,3);assert(p.civication_store.length===4&&p.civication_store.every(x=>x.physicalObject&&x.placeSpecific));assert(p.brands.length>=5);assert(p.nature_profile.summary.length>=1500);assert(p.nature_profile.source_boundaries.length>=3);assert(s&&s.sources.length>=3);assert(a&&a.facts.length>=10&&a.sources.length>=3);assert(sm.files.some(x=>x.entity_id===id&&x.path==='${storyPath}'));}assert(lm.files.includes('${articlePath}'));const etne=read(targets.etnefjella)[0];assert(/områdeanker/.test(JSON.stringify(etne))&&/Skarstøl/.test(JSON.stringify(etne))&&/Rus/.test(JSON.stringify(etne)));const sk=read(targets.skaneviksfjella)[0];assert(/varier/.test(JSON.stringify(sk))&&/5 km|fem kilometer/.test(JSON.stringify(sk))&&/9 km|ni kilometer/.test(JSON.stringify(sk)));const bok=read(targets.bokeskogen_milja)[0];assert(/10 meter/.test(JSON.stringify(bok))&&/35 meter/.test(JSON.stringify(bok))&&/udokumentert/.test(JSON.stringify(bok)));console.log('Etne nature rounds batch 4 OK');\n`;
await writeText(testPath,test);
await writeJson(`${reportDir}/summary.json`,{batch:'Etne nature rounds batch 4',date:'2026-07-23',places:Object.keys(configs),rounds:expectedRounds,content:Object.fromEntries(Object.keys(configs).map((id)=>[id,{tasks:4,trainingExercises:3,civicationObjects:4,brands:configs[id].brands.length,storyId:configs[id].story.id,articlePath}])),sourcePrinciples:['area anchors never treated as route starts','seasonal trail facts remain seasonal','no undocumented species inventories','beech forest geology separated from the larger moraine place']});
await writeText(`${reportDir}/README.md`,'# Etne natur – rundingsbatch 4\n\nKomplette naturprofiler for Etnefjella, Skåneviksfjella og Bøkeskogen på Milja. Områdeankre behandles som områder, ikke turstarter. Sesongløyper beholdes som sesongdata, og Bøkeskogens skogprofil skilles fra den separate Skånevikmorenen.\n');
let out='';try{out=execFileSync(process.execPath,[testPath],{cwd:root,encoding:'utf8'});}catch(e){out=`${e.stdout||''}${e.stderr||''}`;await writeText(`${reportDir}/validation/round-content-test.txt`,out);throw e;}await writeText(`${reportDir}/validation/round-content-test.txt`,out);console.log('Etne nature rounds batch 4 generated and validated.');
