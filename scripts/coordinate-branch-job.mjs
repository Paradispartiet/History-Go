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
const writeText = async (p, value) => {
  const full = path.join(root, p);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, value, 'utf8');
};

const expectedRounds = ['tasks', 'nature', 'badges', 'training', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const storyPath = 'data/stories/stories_etne_natur_rounds_batch2.json';
const articlePath = 'data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch2.json';
const reportDir = 'reports/etne-natur-rounds-batch2';

const sources = {
  folgefonna: [
    { title: 'Folgefonna nasjonalpark – Om nasjonalparken', url: 'https://folgefonna.info/om-nasjonalparken/' },
    { title: 'NVE – 042/2 Mosneselva', url: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-2-mosneselva/' },
    { title: 'Etne kommune – naturforvaltning', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/' }
  ],
  mosneselva: [
    { title: 'NVE – 042/2 Mosneselva', url: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-2-mosneselva/' },
    { title: 'Etne kommune – naturforvaltning', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/' },
    { title: 'Folgefonna nasjonalpark – Om nasjonalparken', url: 'https://folgefonna.info/om-nasjonalparken/' }
  ],
  rullestadvatnet: [
    { title: 'Etne kommune – innlandsfiske', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/innlandsfiske/' },
    { title: 'Etne kommune – friluftsområde', url: 'https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/friluftsomrade/' },
    { title: 'Kartverket SSR – Rullestadvatnet', url: 'https://stadnamn.kartverket.no/' }
  ]
};

const placeConfigs = {
  folgefonnanasjonalpark_etne: {
    file: 'data/places/natur/vestland/etne/folgefonnanasjonalpark_etne.json',
    patch: {
      tasks_profile: {
        title: 'Les brelandskapet uten å gå på breen',
        summary: 'Fire trygge observasjonsoppgaver for merket sti, offentlig vei eller annet etablert utsiktspunkt. Ingen oppgave krever breferdsel, krysning av elv eller ferdsel utenfor trygg rute.',
        tasks: [
          {
            id: 'folgefonna_etne_finn_hoydegradienten',
            title: 'Finn høydegradienten',
            instruction: 'Fra en trygg, etablert ferdselslinje: finn tre nivåer i landskapet – et lavere dal- eller fjordnivå, et fjellnivå og et høyere snø- eller brepåvirket nivå dersom det er synlig. Ikke forlat ruta for å få bedre utsikt.',
            why: 'Folgefonna-landskapet er bygget opp av store høydeforskjeller, og overgangene forklarer både klima, vegetasjon og vannets retning.'
          },
          {
            id: 'folgefonna_etne_spor_etter_is',
            title: 'Finn et spor etter isens arbeid',
            instruction: 'Se etter én synlig landform som kan leses som et resultat av is eller frost, for eksempel en bred dalform, blankskurt fjell, ur eller en tydelig renne. Beskriv formen uten å klatre eller gå utenfor trygg ferdsel.',
            why: 'Nasjonalparkens landskap er preget av gjentatte istider, brebevegelse, frostforvitring og rennende vann.'
          },
          {
            id: 'folgefonna_etne_folg_vannet',
            title: 'Følg vannet med blikket',
            instruction: 'Finn et høyt punkt der snø, is eller nedbør kan samle seg, og følg med blikket hvordan vannet må bevege seg mot søkk, bekker, daler og til slutt fjord. Gjør hele oppgaven fra samme trygge ståsted.',
            why: 'Etne-siden av Folgefonna henger sammen med vassdrag som fører vann fra høyfjellet mot Åkrafjorden.'
          },
          {
            id: 'folgefonna_etne_les_vaervinduet',
            title: 'Les værvinduet',
            instruction: 'Registrer skyer, vind, sikt og temperaturfølelse før du fortsetter. Pek ut ett tegn som kan bety at forholdene er i ferd med å bli dårligere.',
            why: 'Høyfjell og brepåvirket terreng kan skifte raskt. Å lese været er en del av å forstå og bruke landskapet trygt.'
          }
        ]
      },
      nature_profile: {
        type: 'nasjonalpark / brepåvirket høyfjell / villmark',
        title: 'Etne-siden av Folgefonna',
        summary: 'Etne-delen av Folgefonna nasjonalpark er et stort områdeanker i et landskap som strekker seg langt utover selve kartpunktet. Nasjonalparken ble opprettet i 2005 og har Folgefonna som sitt dominerende naturelement. Folgefonna er ikke én sammenhengende enkel breflate, men består av Nordfonna, Midtfonna og Sørfonna, i tillegg til mindre breer. Nasjonalparkforvaltningen beskriver et dramatisk landskap med fjorder, fjell, daler, smeltevann, brearmer og høyfjell, og forklarer hvordan is gjennom mange istider har gravd ut daler og fjorder. I Etne er det særlig forbindelsen mot fjellområdene nord for Åkrafjorden og Mosnesvassdraget som gjør stedet faglig tydelig. NVE beskriver Mosnesvassdraget som et system som går fra Folgefonna til Åkrafjorden, og store deler av det øvre nedbørfeltet ligger innenfor nasjonalparken. Dermed kan spilleren lese nasjonalparken som et sammenhengende system: nedbør og snø samles høyt, is og frost former fjellet, smeltevann og elver flytter materiale, og vannet fortsetter ned gjennom dalene mot fjorden. Vegetasjonen endrer seg også med høyde, berggrunn, vind og nedbør. Nasjonalparkens egen formidling fremhever store lokale forskjeller i mikroklima og hardføre fjellarter på næringsfattig grunn. History Go-markøren representerer bare Etne-delen av det store verneområdet. Den er ikke en breinnkomst, et turmål i seg selv eller en anbefaling om å gå utenfor merket og trygg ferdsel. Natur-rundingen skal derfor gjøre landskapet lesbart fra lovlig og etablert rute: høydeforskjeller, dalformer, vannets retning, værskifter og forbindelsen mellom bre, vassdrag og fjord.',
        themes: ['nasjonalpark', 'bre og is', 'høyfjell', 'landskapsforming', 'smeltevann', 'mikroklima', 'vern'],
        nearby_place_ids: ['mosneselva_etne', 'sandvikevatnet_etne', 'akrafjorden'],
        source_boundaries: [
          'Kartpunktet er et representativt områdeanker for Etne-delen av nasjonalparken, ikke en breinnkomst.',
          'Ingen oppgave eller treningsøvelse krever ferdsel på bre, skredutsatt terreng eller umerket rute.',
          'Generelle fakta om Folgefonna brukes bare til å forklare det større verneområdet som Etne-delen inngår i.'
        ]
      },
      training_profile: {
        title: 'Trygg terrenglesing i Folgefonna-landskap',
        summary: 'Tre lavintensive øvelser som kan gjøres på etablert og trygg ferdselslinje uten breferdsel eller teknisk fjelltur.',
        safety: 'Bruk bare merket sti, offentlig vei eller annet tydelig etablert og lovlig ferdselsareal. Ikke gå på bre uten godkjent brefører og riktig utstyr. Sjekk vær og skredvarsel før fjelltur, hold avstand til bratte elveløp, ur, skavler og usikker is, og snu tidlig dersom sikt eller vær forverres. Kartpunktet er ikke en anbefalt startplass.',
        exercises: [
          {
            id: 'folgefonna_etne_kartstopp',
            title: 'Kartstopp og retning',
            instruction: 'Stopp på trygg grunn og bruk kart eller offlinekart til å peke ut nord, nærmeste dalretning og retningen mot Åkrafjorden. Fortsett først når du vet hvor den etablerte ruta går.',
            duration_minutes: 6,
            intensity: 'svært lett',
            why: 'Orientering kobler det store verneområdet til terrenget du faktisk kan se og reduserer risikoen for å følge feil linje.'
          },
          {
            id: 'folgefonna_etne_rolig_stigning',
            title: 'Rolig stigning på trygg rute',
            instruction: 'Gå rolig i opptil åtte minutter på en tydelig og egnet etablert rute. Hold et tempo der du kan snakke normalt, og snu ved dårligere underlag, vær eller sikt.',
            duration_minutes: 8,
            intensity: 'lett',
            why: 'En kontrollert stigning gjør høydegradienten fysisk merkbar uten at øvelsen blir en prestasjonstur.'
          },
          {
            id: 'folgefonna_etne_trepunktsobservasjon',
            title: 'Trepunktspause',
            instruction: 'Stå stille på trygg grunn i tre minutter. Registrer ett tegn på vann, ett tegn på vær og én landform. Avslutt med å sjekke ruta og forholdene før du går videre.',
            duration_minutes: 5,
            intensity: 'svært lett',
            why: 'Øvelsen trener systematisk observasjon og sikker beslutningstaking i et stort fjellandskap.'
          }
        ]
      },
      civication_store: [
        {
          id: 'folgefonna_etne_reliefmodell',
          title: 'Relieffmodellen av Etne-siden av Folgefonna',
          type: 'landskapsmodell',
          kind: 'physical_object',
          desc: 'En fysisk relieffmodell som viser kommunegrensen mot nasjonalparken, høyfjellsplatået og retningen mot Mosnesvassdraget og Åkrafjorden.',
          placeSpecificReason: 'Modellen gjengir nettopp kryssflaten mellom Folgefonna nasjonalpark og Etne kommune.',
          historicalFunction: 'Gjør det mulig å lese hvordan det store verneområdet er avgrenset og hvordan Etne-delen inngår i helheten.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 55,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'folgefonna_etne_bretilfjord_modell',
          title: 'Bre-til-fjord-vannmodellen',
          type: 'hydrologimodell',
          kind: 'physical_object',
          desc: 'En liten fysisk modell der smeltevann kan følges fra brepåvirket høyfjell gjennom vassdrag mot Åkrafjorden.',
          placeSpecificReason: 'Koblingen mellom Folgefonna og Mosnesvassdraget er sentral for akkurat Etne-siden av nasjonalparken.',
          historicalFunction: 'Viser hvordan vern av høyfjell også beskytter prosesser og vannsystemer nedstrøms.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 45,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'folgefonna_etne_isformingsbrikke',
          title: 'Isformingsbrikken',
          type: 'geologisk_modell',
          kind: 'physical_object',
          desc: 'En taktil brikke med dalprofil, blankskurt berg og frostsprekk som viser tre måter is og frost former Folgefonna-landskapet på.',
          placeSpecificReason: 'Nasjonalparkens formidling legger stor vekt på isens og frostens rolle som landskapsformere.',
          historicalFunction: 'Knytter dagens landskap til gjentatte istider og pågående forvitring.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 30,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'folgefonna_etne_vernekart',
          title: 'Vernekartet fra 2005',
          type: 'kartobjekt',
          kind: 'physical_object',
          desc: 'Et fysisk samlekart som markerer nasjonalparkgrensen og Etne-delen av det vernete landskapet.',
          placeSpecificReason: 'Stedets identitet er direkte knyttet til nasjonalparkstatusen fra 2005 og den geografiske Etne-andelen.',
          historicalFunction: 'Gjør selve vernevedtaket og arealavgrensningen synlig som samfunnsvalg.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 35,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        }
      ],
      brands: [
        { id: 'folgefonna_nasjonalpark', name: 'Folgefonna nasjonalpark', brand_kind: 'protected_area', brand_type: 'national_park' },
        { id: 'besokssenter_folgefonna', name: 'Besøkssenter Folgefonna nasjonalpark', brand_kind: 'visitor_centre', brand_type: 'nature_interpretation' },
        { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
        { id: 'nve', name: 'Norges vassdrags- og energidirektorat', brand_kind: 'public_actor', brand_type: 'watercourse_management' },
        { id: 'miljodirektoratet', name: 'Miljødirektoratet', brand_kind: 'public_actor', brand_type: 'environmental_management' }
      ],
      for_na: {
        title: 'Fra fjellandskap til samlet nasjonalparkvern',
        before: 'Før nasjonalparken ble opprettet i 2005 var ikke dette store landskapet samlet under samme nasjonalparkstatus, selv om naturprosessene, breen og vassdragene allerede bandt området sammen.',
        now: 'Etne-delen inngår i Folgefonna nasjonalpark og må forstås som en del av et større vernet system av bre, høyfjell, daler og vassdrag.',
        change: 'Vernevedtaket gjorde landskapets sammenheng til en formell forvaltningsverdi og ga et felles rammeverk for å beskytte naturen på tvers av kommunegrenser.',
        lookFor: ['overgangen mellom dal og høyfjell', 'retningen vannet følger nedover', 'spor etter is og frost', 'skiftende vær og sikt', 'at kartpunktet representerer et stort område, ikke ett enkelt utsiktspunkt'],
        sources: sources.folgefonna.map((s) => s.url)
      }
    }
  },
  mosneselva_etne: {
    file: 'data/places/natur/vestland/etne/mosneselva_etne.json',
    patch: {
      tasks_profile: {
        title: 'Les et brevassdrag fra trygg ferdsel',
        summary: 'Fire stedshandlinger som gjør nedbørfelt, erosjon og bre-til-fjord-sammenheng synlig uten å sende spilleren ned til elva, inn i ur eller ut i bratt terreng.',
        tasks: [
          {
            id: 'mosneselva_finn_gradienten',
            title: 'Finn gradienten fra fjell mot fjord',
            instruction: 'Fra trygg vei, sti eller utsiktsplass: finn den høyeste synlige delen av landskapet og følg terrengets fall mot dalbunnen eller fjorden. Ikke gå nærmere elv eller brattkant for å kontrollere retningen.',
            why: 'Mosnesvassdragets store høydeforskjell er selve motoren i vannets bevegelse fra Folgefonna mot Åkrafjorden.'
          },
          {
            id: 'mosneselva_erosjon_avsetning',
            title: 'Se etter erosjon og avsetning',
            instruction: 'Finn fra trygg avstand ett tegn på at vann eller skred har flyttet materiale, for eksempel en ur, grusvifte, sandflate eller erodert renne. Beskriv om materialet virker grovt eller fint.',
            why: 'NVE fremhever aktive prosesser i avsetninger og fjell som en viktig del av verneverdien.'
          },
          {
            id: 'mosneselva_sammenlign_dalsider',
            title: 'Sammenlign dalside og dalbunn',
            instruction: 'Velg ett punkt høyt i dalsiden og ett lavere punkt du kan se fra samme sikre ståsted. Sammenlign helning, vegetasjon og løsmasser.',
            why: 'Den trange V-dalen og skredmaterialet skaper sterke naturkontraster over korte avstander.'
          },
          {
            id: 'mosneselva_fire_systemdeler',
            title: 'Finn fire deler av vannsystemet',
            instruction: 'Bruk utsikt og kart til å identifisere fire av disse: bre/snøfelt, bekk/elv, innsjø, dal og fjord. Det er nok å finne dem på kart dersom de ikke er synlige.',
            why: 'Mosnesvassdraget er verdifullt nettopp fordi mange landskapsledd fortsatt henger sammen i ett lite påvirket system.'
          }
        ]
      },
      nature_profile: {
        type: 'vernet brevassdrag / bratt dal / fjordutløp',
        title: 'Fra Folgefonna til Åkrafjorden',
        summary: 'Mosnesvassdraget er et av de tydeligste bre-til-fjord-systemene i Etne. NVE beskriver det vernede feltet som 89 kvadratkilometer stort og omtrent 20 kilometer langt fra Folgefonna i nord til utløpet i Åkrafjorden. Høydeforskjellen går fra havnivå til 1638 meter, og bre, elver og vann er sentrale elementer i et variert og kontrastrikt landskap. Sandvikevatnet ligger sentralt i vassdraget, 328 meter over havet, og er det største vannet i feltet med et areal på omtrent 0,5 kvadratkilometer. Nedenfor breen går elva gjennom en trang V-formet dal med svært bratte dalsider. I bunnen av sidene ligger vegetasjonsløse urer med store blokker, mens løsmasser samles i dalbunnen og ved dalmunningen mot fjorden. NVE beskriver også bjørke- og furuskog opp mot skoggrensen omkring 750 meter, og gråor- og heggeskog på skredmateriale ved Sandvikevatnet. Vassdraget ble vernet i 1993 som type- og referansevassdrag. Verneverdien ligger både i urørtheten og i at feltet viser mange naturprosesser i sammenheng: breens påvirkning, elveløpsformer, isavsmeltingsformer, erosjon, avsetning, botanikk og landfauna. Mosnesvassdraget ligger samtidig i en region som ellers er sterkt preget av vannkraftutbygging. En mindre del av øvre felt er overført, blant annet brevann fra Blomstølskardvann, og NVE peker på den store sanduren ved innløpet til Sandvikevatnet som et spor etter at elva tidligere var større og mer masseførende. Derfor er dette ikke bare et «urørt» landskap i enkel forstand, men et viktig restfelt og referanseområde der både naturlige prosesser og enkelte inngrep kan leses. History Go-markøren er et representativt linjeanker, ikke en tilgang til hele vassdraget. Naturinnholdet skal observeres fra trygg eksisterende ferdsel og aldri sende spilleren ut i bratt, veiløst eller umerket terreng.',
        themes: ['brevassdrag', 'type- og referansevassdrag', 'V-dal', 'erosjon og avsetning', 'Sandvikevatnet', 'urørthet', 'vannkraftens restfelt'],
        nearby_place_ids: ['folgefonnanasjonalpark_etne', 'sandvikevatnet_etne', 'akrafjorden'],
        source_boundaries: [
          'Kartpunktet er et representativt linjeanker og ikke et bestemt tilgangspunkt til elva.',
          'Opplysninger om 20 km, 89 km², høydenivå og Sandvikevatnet gjelder hele det vernede vassdraget.',
          'Ingen oppgave krever ferdsel i ur, bratt dal, elvekant eller utenfor etablert trygg rute.'
        ]
      },
      training_profile: {
        title: 'Lavintensiv terrenglesing ved Mosnesvassdraget',
        summary: 'Tre enkle øvelser for orientering og landskapslesing fra trygg og etablert ferdsel.',
        safety: 'Bruk bare offentlig vei, merket sti eller annet etablert lovlig ferdselsareal. Ikke gå ned i ur, mot bratte elvejuv eller ut på glatte steiner ved vann. Hold stor avstand til skredutsatte dalsider og snu ved dårlig sikt, kraftig nedbør eller usikkert underlag. Kartpunktet er ikke et anbefalt startpunkt.',
        exercises: [
          {
            id: 'mosneselva_kartgradient',
            title: 'Kartgradient',
            instruction: 'Stå stille på trygg grunn og bruk kartet til å finne retningen mot høyfjellet og retningen mot Åkrafjorden. Sammenlign med terrengets faktiske fall.',
            duration_minutes: 6,
            intensity: 'svært lett',
            why: 'Øvelsen kobler nedbørfeltets store skala til landskapet du ser.'
          },
          {
            id: 'mosneselva_rolig_observasjonsgang',
            title: 'Rolig observasjonsgang',
            instruction: 'Gå rolig i opptil ti minutter langs en trygg etablert ferdselslinje. Stopp tre ganger og noter ett nytt tegn på vann, løsmasser eller vegetasjon hver gang.',
            duration_minutes: 10,
            intensity: 'lett',
            why: 'Gjennom bevegelse blir overgangene mellom terreng, vegetasjon og vannprosesser tydeligere.'
          },
          {
            id: 'mosneselva_sikkerhetsstopp',
            title: 'Sikkerhetsstopp før videre ferdsel',
            instruction: 'Før du fortsetter, pek ut nærmeste trygge returretning, ett område du ikke skal gå inn i, og ett værtegn du følger med på.',
            duration_minutes: 4,
            intensity: 'svært lett',
            why: 'I bratt og nedbørrikt terreng er sikkerhetsvurdering en del av selve landskapskompetansen.'
          }
        ]
      },
      civication_store: [
        {
          id: 'mosneselva_89km2_relief',
          title: 'Relieffkartet over 89 km²',
          type: 'nedborfeltmodell',
          kind: 'physical_object',
          desc: 'En fysisk relieffplate som viser det vernede Mosnesvassdragets fall fra høyfjellet til Åkrafjorden.',
          placeSpecificReason: 'Arealet på 89 km² og den store høydegradienten er dokumenterte kjennetegn ved Mosnesvassdraget.',
          historicalFunction: 'Gjør type- og referansevassdragets helhet synlig som ett sammenhengende system.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 55,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'mosneselva_sandvikevatnet_sandur',
          title: 'Sandurmodellen ved Sandvikevatnet',
          type: 'sedimentmodell',
          kind: 'physical_object',
          desc: 'En fysisk modell av sanduren som viser hvordan et mer masseførende brevassdrag har lagt opp sediment ved innløpet til Sandvikevatnet.',
          placeSpecificReason: 'NVE bruker nettopp sanduren ved Sandvikevatnet som spor etter tidligere større vann- og massetransport.',
          historicalFunction: 'Bevarer et fysisk bilde av hvordan bre og elv flytter materiale over tid.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 40,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'mosneselva_vernebrikke_1993',
          title: 'Vernebrikken 1993',
          type: 'verneobjekt',
          kind: 'physical_object',
          desc: 'En samlerbrikke merket 042.4Z og 1993, året Mosnesvassdraget ble vernet i Verneplan IV.',
          placeSpecificReason: 'Vassdragsnummeret og verneåret er direkte knyttet til Mosneselva.',
          historicalFunction: 'Gjør vassdragsvernet lesbart som et konkret forvaltningsvalg.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 25,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'mosneselva_bretilfjord_stripe',
          title: 'Bre-til-fjord-stripen',
          type: 'landskapsmodell',
          kind: 'physical_object',
          desc: 'En lang fysisk profil fra 1638 meter over havet til fjordnivå, med bre, innsjø, V-dal og utløp markert.',
          placeSpecificReason: 'Den ekstreme høydegradienten og hele kjeden fra Folgefonna til Åkrafjorden definerer stedet.',
          historicalFunction: 'Viser hvorfor vassdraget brukes som type- og referanseområde.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 45,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        }
      ],
      brands: [
        { id: 'nve', name: 'Norges vassdrags- og energidirektorat', brand_kind: 'public_actor', brand_type: 'watercourse_management' },
        { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
        { id: 'folgefonna_nasjonalpark', name: 'Folgefonna nasjonalpark', brand_kind: 'protected_area', brand_type: 'national_park' },
        { id: 'miljodirektoratet', name: 'Miljødirektoratet', brand_kind: 'public_actor', brand_type: 'environmental_management' },
        { id: 'mosnesvassdraget', name: 'Mosnesvassdraget', brand_kind: 'protected_watercourse_identity', brand_type: 'reference_watercourse' }
      ],
      for_na: {
        title: 'Fra større brevannføring til vernet restfelt',
        before: 'NVE beskriver hvordan elva tidligere var større og mer masseførende, noe den store sanduren ved innløpet til Sandvikevatnet fortsatt vitner om.',
        now: 'En mindre del av øvre felt er overført til kraftsystemet, mens resten av vassdraget er vernet som type- og referansevassdrag i et område som ellers er sterkt vannkraftutbygd.',
        change: 'Vannføringen og sedimenttransporten er delvis endret, men landskapet bevarer tydelige spor etter tidligere prosesser og har fått økt verdi som restfelt og referanseområde.',
        lookFor: ['V-formet dal', 'urer og store blokker', 'løsmasser i dalbunnen', 'retningen mot Sandvikevatnet og fjorden', 'kontrasten mellom vernet restfelt og utbygde nabovassdrag'],
        sources: sources.mosneselva.map((s) => s.url)
      }
    }
  },
  rullestadvatnet: {
    file: 'data/places/natur/vestland/etne/rullestadvatnet.json',
    patch: {
      tasks_profile: {
        title: 'Les Rullestadvatnet som ferskvannssystem',
        summary: 'Fire lavterskeloppgaver fra offentlig eller tilrettelagt ferdsel. Ingen oppgave krever fiske, båt, bading eller ferdsel på is.',
        tasks: [
          {
            id: 'rullestadvatnet_finn_innlop_utlop',
            title: 'Finn innløp og utløpsretning',
            instruction: 'Bruk kart og utsikt fra trygg ferdsel til å finne hvor vann kommer inn i innsjøen og hvilken retning det går videre. Det er nok å bruke kart dersom utløpet ikke er synlig.',
            why: 'En innsjø er en del av et større vannsystem, ikke en isolert vannflate.'
          },
          {
            id: 'rullestadvatnet_sammenlign_strandsoner',
            title: 'Sammenlign to strandsoner',
            instruction: 'Fra trygg og lovlig ferdsel: sammenlign to synlige deler av vannkanten. Se etter forskjeller i stein, vegetasjon, bratthet eller menneskelig tilrettelegging.',
            why: 'Strandsonen viser hvordan terreng og bruk varierer rundt samme innsjø.'
          },
          {
            id: 'rullestadvatnet_les_tilrettelegging',
            title: 'Les tilretteleggingen',
            instruction: 'Finn ett element som gjør området mer tilgjengelig, for eksempel en pir, sti, rasteplass eller annen tilrettelegging. Forklar hvilken barriere elementet reduserer.',
            why: 'Kommunen fremhever den tilrettelagte fiskepiren ved innfallsosen som en del av områdets bruk.'
          },
          {
            id: 'rullestadvatnet_finn_fjellrammen',
            title: 'Finn fjellrammen rundt vannet',
            instruction: 'Stå på trygg grunn og følg horisonten rundt innsjøen med blikket. Finn ett sted der terrenget er bratt og ett der det åpner seg mer.',
            why: 'Rullestadvatnet ligger i et tydelig dal- og fjellandskap der terrenget styrer både utsikt, vannveier og tilgang.'
          }
        ]
      },
      nature_profile: {
        type: 'innsjø / ferskvann / friluftsliv',
        title: 'Ferskvannet ved Rullestad',
        summary: 'Rullestadvatnet er en stor og tydelig innsjø i Åkrafjordområdet og et viktig lokalt møtepunkt mellom ferskvannsnatur og friluftsliv. Etne kommune beskriver rundt førti gode fiskevann i kommunen og peker ut Rullestadvatnet som det mest brukte vannet i Åkrafjordområdet. Det gjør stedet interessant som mer enn en fiskeplass: innsjøen viser hvordan et stort ferskvann blir en del av hverdagslandskapet, med vannflate, innløp og utløp, strandsoner, fjellramme og tilrettelegging for ulike brukere. Kommunen opplyser at campingplassen på Halvfjordingen leier ut båt, og at området ved innfallsosen er tilrettelagt for rullestol med fiskepir. Samtidig skal History Go-markøren representere hele innsjøen, ikke piren, en bestemt brygge eller ett fiskepunkt. Natur-rundingen skal derfor gjøre vannsystemet synlig: hvor vannet kommer fra, hvordan terrenget samler avrenning, hvordan strandsonen varierer og hvordan en stor vannflate påvirker opplevelsen av dalen rundt. Tilretteleggingen brukes som et eget læringsspor om tilgjengelig friluftsliv, men den skal ikke overskygge innsjøen som natursted. Kildene gir ikke grunnlag for å knytte bestemte fiskearter til dette place-id-et, og artsinnhold skal derfor ikke fylles med antakelser. På samme måte skal ingen oppgave oppfordre til bading, isferdsel eller bruk av båt uten at spilleren selv følger gjeldende lokale regler og sikkerhetsforhold. Rullestadvatnet egner seg særlig til å trene blikket for vannets retning, strandsoner, terreng og forskjellen mellom selve naturstedet og infrastrukturen som gjør det lettere å bruke.',
        themes: ['innsjø', 'ferskvann', 'vannsystem', 'strandsoner', 'tilgjengelig friluftsliv', 'dal- og fjellandskap'],
        nearby_place_ids: ['jettegrytene_rullestad', 'postvegen_rullestadjuvet', 'langebudalen_naturreservat'],
        source_boundaries: [
          'Kartpunktet representerer hele innsjøen og er ikke en bestemt brygge, badeplass eller fiskeplass.',
          'Ingen bestemte fiskearter knyttes til Rullestadvatnet uten en stedsspesifikk kilde.',
          'Tilrettelegging ved innfallsosen brukes som dokumentert eksempel på tilgjengelighet, ikke som beskrivelse av hele strandsonen.'
        ]
      },
      training_profile: {
        title: 'Rolig vannkant- og terrenglesing',
        summary: 'Tre lette øvelser for orientering og bevegelse på offentlig eller tilrettelagt ferdselsareal ved innsjøen.',
        safety: 'Hold deg på offentlig vei, tilrettelagt plass eller tydelig lovlig sti. Ikke gå ut på is, ikke tren på glatte steiner i vannkanten og ikke bruk båt som del av øvelsene. Barn skal ha tett voksenoppfølging nær vann. Stopp ved sterk vind, dårlig sikt eller utrygt underlag.',
        exercises: [
          {
            id: 'rullestadvatnet_vannlinjeorientering',
            title: 'Vannlinjeorientering',
            instruction: 'Stå på trygg grunn og pek ut innsjøens lengderetning, nærmeste høye terreng og den retningen du tror utløpet går. Kontroller med kart.',
            duration_minutes: 6,
            intensity: 'svært lett',
            why: 'Øvelsen trener romforståelse og kobler vannflaten til dalformen rundt.'
          },
          {
            id: 'rullestadvatnet_rolig_tilgjengelighetsrunde',
            title: 'Rolig tilgjengelighetsrunde',
            instruction: 'Gå i opptil ti minutter på en trygg og tilgjengelig ferdselslinje. Legg merke til underlag, helning, kanter og steder der tilrettelegging gjør ferdselen enklere eller sikrere.',
            duration_minutes: 10,
            intensity: 'lett',
            why: 'Rullestadvatnet er dokumentert som et sted med tilrettelagt tilgang, og øvelsen gjør tilgjengelighet til noe konkret man kan lese i landskapet.'
          },
          {
            id: 'rullestadvatnet_tre_stille_minutter',
            title: 'Tre stille minutter ved vannet',
            instruction: 'Fra trygg avstand til vannkanten: stå eller sitt stille og registrer ett tegn på vind, ett tegn på vannbevegelse og ett tegn på menneskelig bruk.',
            duration_minutes: 5,
            intensity: 'svært lett',
            why: 'Innsjøen kan leses samtidig som naturmiljø og friluftssted.'
          }
        ]
      },
      civication_store: [
        {
          id: 'rullestadvatnet_reliefmodell',
          title: 'Relieffmodellen av Rullestadvatnet',
          type: 'innsjomodell',
          kind: 'physical_object',
          desc: 'En fysisk modell av vannflaten og dalrammen rundt Rullestadvatnet.',
          placeSpecificReason: 'Formen på innsjøen og det omsluttende terrenget er stedets tydeligste naturidentitet.',
          historicalFunction: 'Gjør innsjøen lesbar som del av et større landskap og vannsystem.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 45,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'rullestadvatnet_innfallsosmodell',
          title: 'Innfallsosmodellen',
          type: 'vannsystemmodell',
          kind: 'physical_object',
          desc: 'En liten fysisk modell som viser overgangen fra innrennende vann til innsjø og den tilrettelagte sonen ved innfallsosen.',
          placeSpecificReason: 'Kommunen knytter den tilgjengelige fiskepiren direkte til innfallsosen ved Rullestadvatnet.',
          historicalFunction: 'Viser hvordan vannsystem og tilrettelegging møtes på ett konkret sted.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 35,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'rullestadvatnet_tilgjengelighetspikto',
          title: 'Tilgjengelighetspiktogrammet',
          type: 'tilgjengelighetsobjekt',
          kind: 'physical_object',
          desc: 'En fysisk samlerbrikke som kombinerer vannsymbol og universell tilgang som minne om den tilrettelagte fiskepiren.',
          placeSpecificReason: 'Rullestadvatnet trekkes særskilt frem av kommunen som tilrettelagt for rullestol ved innfallsosen.',
          historicalFunction: 'Synliggjør hvordan friluftsliv kan utformes for flere brukergrupper.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 20,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        },
        {
          id: 'rullestadvatnet_akrafjord_ferskvannskort',
          title: 'Åkrafjordens mest brukte ferskvann',
          type: 'stedskort',
          kind: 'physical_object',
          desc: 'Et fysisk kartkort som markerer Rullestadvatnet og kommunens beskrivelse av det som det mest brukte vannet i Åkrafjordområdet.',
          placeSpecificReason: 'Denne lokale bruksstatusen er eksplisitt knyttet til Rullestadvatnet i kommunens innlandsfiskeinformasjon.',
          historicalFunction: 'Dokumenterer innsjøens rolle i lokalt friluftsliv.',
          physicalObject: true,
          placeSpecific: true,
          storePrice: 25,
          currency: 'PC',
          collection: 'etne_natur',
          collectable: true
        }
      ],
      brands: [
        { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
        { id: 'rullestadvatnet', name: 'Rullestadvatnet', brand_kind: 'place_identity', brand_type: 'freshwater_lake' },
        { id: 'friluftsradet_vest', name: 'Friluftsrådet Vest', brand_kind: 'outdoor_life_actor', brand_type: 'regional_outdoor_council' },
        { id: 'halvfjordingen', name: 'Halvfjordingen', brand_kind: 'local_access_actor', brand_type: 'boat_rental_and_camping' },
        { id: 'kartverket', name: 'Kartverket', brand_kind: 'public_actor', brand_type: 'place_name_authority' }
      ],
      for_na: {
        title: 'Fra naturgitt vannkant til mer tilgjengelig friluftsliv',
        before: 'Rullestadvatnet var et mye brukt natur- og fiskevann før dagens dokumenterte tilrettelegging gjorde enkelte deler av området lettere tilgjengelige for flere.',
        now: 'Kommunen beskriver båtutleie ved Halvfjordingen og en fiskepir ved innfallsosen som er tilrettelagt for rullestol.',
        change: 'Tilretteleggingen har lagt et nytt lag over naturstedet: innsjøen er den samme, men flere kan bruke en del av vannkanten uten at hele stedet blir redusert til et anlegg.',
        lookFor: ['selve vannflaten', 'innfallsosen', 'forskjellen mellom naturlig og tilrettelagt strand', 'dal- og fjellrammen', 'hvordan underlag og helning påvirker tilgjengelighet'],
        sources: sources.rullestadvatnet.map((s) => s.url)
      }
    }
  }
};

for (const [id, config] of Object.entries(placeConfigs)) {
  const rows = await readJson(config.file);
  const place = rows.find((row) => row.id === id);
  if (!place) throw new Error(`Missing place ${id} in ${config.file}`);
  if (Object.prototype.hasOwnProperty.call(place, 'rounds') || Object.prototype.hasOwnProperty.call(place, 'rundinger')) {
    throw new Error(`${id} has manual round override`);
  }
  Object.assign(place, config.patch);
  await writeJson(config.file, rows);
}

const stories = [
  {
    id: 'st_folgefonna_etne_fra_is_til_fjord',
    type: 'environmental',
    title: 'Fra is til fjord',
    year: 2005,
    place_id: 'folgefonnanasjonalpark_etne',
    person_id: null,
    summary: 'Etne-siden av Folgefonna viser hvordan is, høyfjell og smeltevann bindes sammen med vassdragene som faller mot Åkrafjorden.',
    story: 'På kartet er nasjonalparken en grense. I terrenget er den en sammenheng. Høyt i landskapet samles nedbør som snø og is, og gjennom årstider og lange geologiske tidsrom beveger vannet seg nedover. Breen sliper fjell, frost sprenger blokker løs, og elvene bruker grus og stein som slipemiddel. Daler og fjorder er derfor ikke kulisser rundt Folgefonna, men spor etter de samme prosessene som fortsatt virker i dag.\n\nFolgefonna består av flere breområder, og nasjonalparkens egen formidling beskriver store variasjoner i høyde, vind, nedbør og mikroklima. Fra fjordarmene kan landskapet følges opp gjennom dalene til høyfjellet. På Etne-siden er forbindelsen mot Mosnesvassdraget særlig tydelig: NVE beskriver et vernet system som går fra Folgefonna til Åkrafjorden. Vann som begynner høyt, ender i et helt annet landskap ved fjorden.\n\nI 2005 ble nasjonalparken opprettet. Vernegrensen samlet store deler av dette landskapet under ett forvaltningsregime, men naturens egne forbindelser følger ikke administrative linjer. For History Go er derfor Etne-markøren et områdeanker, ikke et punkt man skal oppsøke som en attraksjon. Stedet skal leses fra trygg, etablert ferdsel: se høydegradienten, følg vannets retning, les været og finn spor etter is og frost.\n\nDet viktigste er kanskje å forstå målestokken. Et brelandskap kan ikke reduseres til et bilde av blåis. Det består også av vannet som forlater isen, dalene isen har formet, vegetasjonen som tåler klimaet, og de raske værskiftene som bestemmer hvordan mennesker kan ferdes. På Etne-siden av Folgefonna møtes alle disse lagene i én fortelling fra is til fjord.',
    sources: sources.folgefonna,
    tags: ['folgefonnanasjonalpark', 'bre', 'smeltevann', 'landskapsforming', 'Etne', 'Åkrafjorden'],
    related_people: [],
    related_places: ['mosneselva_etne', 'sandvikevatnet_etne', 'akrafjorden'],
    score: { narrative: 5, historical: 4, source: 5, play_value: 5, originality: 4, total: 23 },
    arc: {
      start: 'Nedbør samles som snø og is høyt i Folgefonna-landskapet.',
      middle: 'Is, frost og rennende vann former fjell, daler og vassdrag.',
      end: 'Etne-delen vernes som del av et større system som må oppleves på naturens og sikkerhetens premisser.'
    },
    next_scenes: [
      { place_id: 'mosneselva_etne', reason: 'Mosneselva viser vannsystemet videre fra Folgefonna mot Åkrafjorden.' },
      { place_id: 'sandvikevatnet_etne', reason: 'Sandvikevatnet viser hvordan vann og sediment samles midt i det vernede vassdraget.' }
    ]
  },
  {
    id: 'st_mosneselva_vassdraget_som_ble_staende_igjen',
    type: 'environmental',
    title: 'Vassdraget som ble stående igjen',
    year: 1993,
    place_id: 'mosneselva_etne',
    person_id: null,
    summary: 'Mosnesvassdraget ble vernet som type- og referansevassdrag i et område der vannkraftutbygging ellers har endret mange nabofelt.',
    story: 'Fra Folgefonna faller landskapet nesten hele veien til havnivå. På omtrent tjue kilometer passerer vannet bre, fjellvann, bratte dalsider, ur, skog og til slutt Åkrafjorden. Det er denne sammenhengen som gjør Mosnesvassdraget til mer enn én elv.\n\nNVE beskriver feltet som 89 kvadratkilometer stort og med høyder fra 1638 meter til fjorden. Sandvikevatnet ligger sentralt i systemet. Nedenfor breen går elva gjennom en trang V-dal, og store blokker og skredmateriale ligger ved foten av de bratte dalsidene. Her er vann ikke bare noe som renner. Det er en kraft som flytter materiale og bygger landskap.\n\nMen historien er ikke helt uten inngrep. Brevann fra Blomstølskardvann er overført til kraftverkene i Blåfalli. NVE peker på den store sanduren ved innløpet til Sandvikevatnet som et spor etter at elva tidligere var større og mer masseførende. Samtidig er resten av feltet lite teknisk påvirket. Nettopp derfor fikk det økt verdi som restfelt i et område der mange andre vassdrag er utbygd.\n\nI 1993 ble Mosnesvassdraget vernet som type- og referansevassdrag. Et referansevassdrag er verdifullt fordi det lar oss forstå hvordan et større natursystem fungerer når mange av prosessene fortsatt kan studeres i sammenheng. På stedet kan spilleren lese denne fortellingen uten å gå ned i elva: gjennom dalformen, urene, løsmassene, høydegradienten og retningen fra Folgefonna mot fjorden.\n\nMosneselva er dermed også en historie om det som ikke ble bygget ut. Vernet beskytter ikke et statisk bilde, men et system av pågående prosesser. Vannet fortsetter å renne, frost fortsetter å sprenge fjell, skred fortsetter å flytte stein, og elva fortsetter å forme dalen.',
    sources: sources.mosneselva,
    tags: ['mosneselva', 'vernet_vassdrag', 'brevassdrag', 'referansevassdrag', 'sandvikevatnet', 'vannkraft'],
    related_people: [],
    related_places: ['folgefonnanasjonalpark_etne', 'sandvikevatnet_etne', 'akrafjorden'],
    score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 5, total: 25 },
    arc: {
      start: 'Vannet faller fra Folgefonna gjennom et stort høyde- og landskapsspenn.',
      middle: 'En mindre overføring endrer deler av vannføringen, mens resten av feltet forblir lite påvirket.',
      end: 'I 1993 vernes vassdraget som restfelt, type- og referansesystem.'
    },
    next_scenes: [
      { place_id: 'sandvikevatnet_etne', reason: 'Sandvikevatnet ligger sentralt i vassdraget og viser sedimenthistorien tydelig.' },
      { place_id: 'folgefonnanasjonalpark_etne', reason: 'Folgefonna viser høyfjells- og breenden av det samme vannsystemet.' }
    ]
  },
  {
    id: 'st_rullestadvatnet_vannet_som_ble_mer_tilgjengelig',
    type: 'environmental',
    title: 'Vannet som ble mer tilgjengelig',
    year: null,
    place_id: 'rullestadvatnet',
    person_id: null,
    summary: 'Rullestadvatnet er både en stor innsjø i dal- og fjellandskapet og et eksempel på hvordan friluftsliv kan gjøres mer tilgjengelig.',
    story: 'Rullestadvatnet er først og fremst en innsjø. Vannet samler avrenning fra terrenget rundt, har innløp og utløp og danner en lang, tydelig vannflate i et markert dal- og fjellandskap. Men innsjøer er også steder mennesker lærer å bruke på forskjellige måter.\n\nEtne kommune beskriver Rullestadvatnet som det mest brukte vannet i Åkrafjordområdet. Det finnes mange fiskevann i kommunen, særlig i fjellområdene, men Rullestadvatnet skiller seg ut gjennom både størrelse, beliggenhet og tilrettelegging. Kommunen viser til båtutleie ved Halvfjordingen og en fiskepir ved innfallsosen som er tilrettelagt for rullestol.\n\nTilrettelegging forandrer ikke selve innsjøen, men den forandrer hvem som kan komme nær nok til å bruke og oppleve deler av den. En pir, et jevnere underlag eller en tydelig ferdselslinje kan redusere barrierer som ellers gjør naturen vanskelig tilgjengelig. Samtidig er det viktig å ikke gjøre hele naturstedet om til et anlegg. Kartmarkøren representerer Rullestadvatnet som helhet, ikke bare den tilrettelagte sonen.\n\nFor History Go blir derfor oppgaven todelt. Spilleren skal lese innsjøen som vannsystem – retningen på vannet, strandsonene og terrenget rundt – og samtidig legge merke til hvordan menneskelig tilrettelegging endrer bruken av ett lite område. Det gir en konkret måte å forstå forskjellen mellom natur og tilgang.\n\nKildene sier ikke hvilke fiskearter som skal knyttes til akkurat dette place-id-et, og rundingene fyller derfor ikke innsjøen med antatte artslister. I stedet står vannet selv i sentrum: en stor ferskvannsflate som både formes av landskapet og blir en del av lokalt friluftsliv.',
    sources: sources.rullestadvatnet,
    tags: ['rullestadvatnet', 'innsjø', 'ferskvann', 'friluftsliv', 'tilgjengelighet', 'Åkrafjorden'],
    related_people: [],
    related_places: ['jettegrytene_rullestad', 'postvegen_rullestadjuvet', 'langebudalen_naturreservat'],
    score: { narrative: 4, historical: 3, source: 4, play_value: 5, originality: 4, total: 20 },
    arc: {
      start: 'Rullestadvatnet ligger som en stor ferskvannsflate i dal- og fjellandskapet.',
      middle: 'Lokalt friluftsliv og tilrettelegging gjør deler av vannkanten lettere tilgjengelige.',
      end: 'Stedet kan leses både som natursystem og som eksempel på hvordan tilgang formes.'
    },
    next_scenes: [
      { place_id: 'jettegrytene_rullestad', reason: 'Jettegrytene viser vannets og isens landskapsforming i samme område.' },
      { place_id: 'postvegen_rullestadjuvet', reason: 'Postvegen viser hvordan mennesker har funnet ferdselslinjer gjennom det bratte Rullestadlandskapet.' }
    ]
  }
];

const articles = [
  {
    place_id: 'folgefonnanasjonalpark_etne',
    visual: { designCode: 'article_nature_route_miniature' },
    version: 2,
    title: 'Folgefonna nasjonalpark – Etne',
    popupDesc: 'Etne-delen av et stort verneområde der bre, høyfjell, vær og vassdrag henger sammen.',
    wikiText: [
      'Folgefonna nasjonalpark ble opprettet i 2005. History Go-markøren gjelder bare delen av nasjonalparken som ligger i Etne kommune og er et representativt områdeanker, ikke en breinnkomst eller et bestemt turmål.',
      'Folgefonna består av Nordfonna, Midtfonna og Sørfonna, i tillegg til mindre breer. Nasjonalparkens egen formidling beskriver store landskapskontraster fra fjord og dal til høyfjell, brearmer og smeltevann.',
      'Is og frost har formet landskapet gjennom gjentatte istider. Brebevegelse sliper fjell, frostforvitring sprenger blokker løs, og rennende vann transporterer grus og stein videre gjennom dalene.',
      'På Etne-siden er koblingen mot Mosnesvassdraget sentral. NVE beskriver et vernet vassdrag som går fra Folgefonna til Åkrafjorden, slik at høyfjell, brepåvirkning, elver, innsjø og fjord kan leses som ett system.',
      'Nasjonalparkens formidling fremhever store variasjoner i mikroklima. Høyde, vind, nedbør og berggrunn gjør at vegetasjonen kan skifte mye over korte avstander, samtidig som de mest fjellrike og næringsfattige områdene domineres av hardføre arter.',
      'Fysisk gameplay må følge etablerte og trygge ferdselslinjer. Markøren gir ikke grunnlag for å gå på bre, krysse elver eller oppsøke umerket høyfjellsterreng.'
    ],
    summary: {
      one_liner: 'Etne-siden av Folgefonna viser sammenhengen mellom bre, høyfjell, vann og fjord innenfor et stort nasjonalparkvern.',
      themes: ['nasjonalpark', 'bre', 'høyfjell', 'smeltevann', 'landskapsforming', 'vern'],
      tone: ['nøktern', 'faglig', 'stedsspesifikk', 'sikkerhetsstyrt']
    },
    facts: [
      { id: 'fact_folgefonna_etne_01', label: 'Nasjonalpark fra 2005', desc: 'Folgefonna nasjonalpark ble opprettet i 2005.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'fact_folgefonna_etne_02', label: 'Tre hovedbreer', desc: 'Folgefonna består av Nordfonna, Midtfonna og Sørfonna, i tillegg til mindre breer.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'fact_folgefonna_etne_03', label: 'Etne-del av større vern', desc: 'History Go-stedet representerer bare nasjonalparkarealet som berører Etne.', confidence: 'high', sources: ['Etne kommune', 'History Go place data'] },
      { id: 'fact_folgefonna_etne_04', label: 'Bre til fjord', desc: 'Mosnesvassdraget binder Folgefonna til Åkrafjorden og gjør vannsystemet synlig fra høyfjell til fjord.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_folgefonna_etne_05', label: 'Is former landskapet', desc: 'Brebevegelse og gjentatte istider har vært sentrale i utformingen av daler og fjorder rundt Folgefonna.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'fact_folgefonna_etne_06', label: 'Frostforvitring', desc: 'Frysing og tining i fjellsprekker er en viktig pågående landskapsprosess.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'fact_folgefonna_etne_07', label: 'Store mikroklimavariasjoner', desc: 'Temperatur, vind og nedbør kan variere sterkt over korte avstander i nasjonalparken.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'fact_folgefonna_etne_08', label: 'Områdeanker', desc: 'Kartpunktet er et representativt områdeanker og ikke en anbefalt adkomst til bre eller høyfjell.', confidence: 'high', sources: ['History Go place data'] },
      { id: 'fact_folgefonna_etne_09', label: 'Vern av sammenheng', desc: 'Nasjonalparkvernet beskytter et stort sammenhengende landskap, ikke bare selve isflaten.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'fact_folgefonna_etne_10', label: 'Sikker ferdsel', desc: 'History Go-oppgavene er avgrenset til etablerte og trygge ferdselslinjer.', confidence: 'high', sources: ['History Go production rule'] }
    ],
    chronology: [
      { id: 'chrono_folgefonna_etne_01', year: null, period: 'Gjentatte istider', desc: 'Is og smeltevann former daler, fjordlandskap og bergflater over lange tidsrom.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'chrono_folgefonna_etne_02', year: 2005, period: 'Nasjonalpark opprettes', desc: 'Folgefonna nasjonalpark etableres som samlet verneområde.', confidence: 'high', sources: ['Folgefonna nasjonalpark'] },
      { id: 'chrono_folgefonna_etne_03', year: 2026, period: 'History Go-rundingsprofil', desc: 'Etne-delen får komplett stedsspesifikk naturprofil med sikkerhetsavgrenset gameplay.', confidence: 'high', sources: ['History Go place data'] }
    ],
    sources: sources.folgefonna.map((s, i) => ({ id: `source_folgefonna_etne_${String(i + 1).padStart(2, '0')}`, label: s.title, type: 'official', url: s.url, confidence: 'high' })),
    interpretation: {
      what_to_notice: ['høydegradient', 'dalformer', 'vannets retning', 'spor etter is og frost', 'værskifter'],
      why_it_matters: ['Bre, vann og fjord er deler av samme landskapssystem.', 'Vernet beskytter store sammenhenger som krysser kommunegrenser.', 'Sikker terrenglesing er en del av naturkompetansen.'],
      counterpoints: ['Kartpunktet er ikke en breinnkomst.', 'Generelle Folgefonna-fakta beskriver et større område enn bare Etne-markøren.', 'Ingen runding skal oppfordre til umerket bre- eller høyfjellsferdsel.']
    },
    links: { entry_ids: ['st_folgefonna_etne_fra_is_til_fjord'], related_places: ['mosneselva_etne', 'sandvikevatnet_etne', 'akrafjorden'], related_people: [] }
  },
  {
    place_id: 'mosneselva_etne',
    visual: { designCode: 'article_nature_route_miniature' },
    version: 2,
    title: 'Mosneselva',
    popupDesc: 'Vernet brevassdrag fra Folgefonna til Åkrafjorden, med store høydeforskjeller og aktive landskapsprosesser.',
    wikiText: [
      'Mosnesvassdraget er et 89 km² stort vernet nedbørfelt i Etne. NVE beskriver et omtrent 20 kilometer langt system fra Folgefonna til Åkrafjorden, med høyder fra 1638 meter til havnivå.',
      'Bre, elver og vann er sentrale i landskapet. Sandvikevatnet ligger 328 meter over havet, har et areal på omtrent 0,5 km² og er det største vannet i vassdraget.',
      'Nedenfor breen går elva gjennom en trang V-formet dal med svært bratte dalsider. Urene inneholder store blokker, og løsmasser er konsentrert i dalbunnen og ved munningen mot fjorden.',
      'NVE beskriver bjørke- og furuskog opp mot skoggrensen omkring 750 meter, samt gråor- og heggeskog på skredmateriale ved Sandvikevatnet.',
      'Brevann fra Blomstølskardvann er overført til kraftverkene i Blåfalli. Den store sanduren ved innløpet til Sandvikevatnet viser at elva tidligere var større og mer masseførende.',
      'Vassdraget ble vernet i 1993 som type- og referansevassdrag. Verdien øker fordi det ligger som et lite påvirket restfelt i en region som ellers er sterkt preget av vannkraftutbygging.'
    ],
    summary: {
      one_liner: 'Et vernet bre-til-fjord-vassdrag som bevarer sterke kontraster og fungerer som type- og referanseområde.',
      themes: ['brevassdrag', 'V-dal', 'Sandvikevatnet', 'sediment', 'referansevassdrag', 'vannkraft'],
      tone: ['nøktern', 'faglig', 'prosessbasert', 'sikkerhetsstyrt']
    },
    facts: [
      { id: 'fact_mosneselva_01', label: '89 km²', desc: 'Det vernede nedbørfeltet er 89 kvadratkilometer.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_02', label: 'Omtrent 20 km', desc: 'Vassdraget strekker seg omtrent 20 kilometer fra Folgefonna til Åkrafjorden.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_03', label: '1638–0 moh.', desc: 'Høydenivået går fra 1638 meter til havnivå.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_04', label: 'Sandvikevatnet', desc: 'Sandvikevatnet er største vann i vassdraget, omtrent 0,5 km² og 328 meter over havet.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_05', label: 'Trang V-dal', desc: 'Nedenfor breen renner elva gjennom en trang V-formet dal med svært bratte sider.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_06', label: 'Ur og store blokker', desc: 'Vegetasjonsløse urer med store blokker ligger ved foten av dalsidene.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_07', label: 'Skoggrense omkring 750 moh.', desc: 'Bjørke- og furuskog utgjør mye av vegetasjonen opp til skoggrensen omkring 750 meter.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_08', label: 'Overført brevann', desc: 'Brevann fra Blomstølskardvann er overført til kraftverkene i Blåfalli.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_09', label: 'Sandur som spor', desc: 'Sanduren ved Sandvikevatnet vitner om at elva tidligere var større og mer masseførende.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_10', label: 'Vernet i 1993', desc: 'Mosnesvassdraget ble vernet i Verneplan IV i 1993.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_11', label: 'Type- og referansevassdrag', desc: 'NVE anbefaler vassdraget som type- og referansevassdrag.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'fact_mosneselva_12', label: 'Restfelt', desc: 'Vassdragets verdi øker fordi det ligger i et område som ellers er sterkt vannkraftutbygd.', confidence: 'high', sources: ['NVE – Mosneselva'] }
    ],
    chronology: [
      { id: 'chrono_mosneselva_01', year: null, period: 'Bre- og isavsmelting', desc: 'Is, elver og avsetninger former det bratte landskapet fra høyfjell mot fjord.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'chrono_mosneselva_02', year: null, period: 'Vannkraftoverføring', desc: 'Brevann fra Blomstølskardvann overføres til kraftverkene i Blåfalli.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'chrono_mosneselva_03', year: 1993, period: 'Verneplan IV', desc: 'Mosnesvassdraget vernes som type- og referansevassdrag.', confidence: 'high', sources: ['NVE – Mosneselva'] },
      { id: 'chrono_mosneselva_04', year: 2026, period: 'Komplett rundingsprofil', desc: 'History Go samler vassdragets prosesser, sikkerhetsregler og stedsspesifikke læringsinnhold i én naturprofil.', confidence: 'high', sources: ['History Go place data'] }
    ],
    sources: sources.mosneselva.map((s, i) => ({ id: `source_mosneselva_${String(i + 1).padStart(2, '0')}`, label: s.title, type: 'official', url: s.url, confidence: 'high' })),
    interpretation: {
      what_to_notice: ['V-dalen', 'urer', 'løsmasser', 'høydegradienten', 'retningen mot fjorden'],
      why_it_matters: ['Vassdraget bevarer mange naturprosesser i sammenheng.', 'Restfeltet gir referanseverdi i en utbygd region.', 'Sedimentspor kan vise tidligere vannføring og transport.'],
      counterpoints: ['Markøren er ikke tilgangspunkt til hele vassdraget.', 'Urørthet betyr ikke at feltet er helt uten inngrep.', 'Sikker ferdsel går foran nærhet til elv og bratt terreng.']
    },
    links: { entry_ids: ['st_mosneselva_vassdraget_som_ble_staende_igjen'], related_places: ['folgefonnanasjonalpark_etne', 'sandvikevatnet_etne', 'akrafjorden'], related_people: [] }
  },
  {
    place_id: 'rullestadvatnet',
    visual: { designCode: 'article_nature_route_miniature' },
    version: 2,
    title: 'Rullestadvatnet',
    popupDesc: 'Stor innsjø og mye brukt friluftssted i Åkrafjordområdet, med dokumentert tilrettelagt tilgang ved innfallsosen.',
    wikiText: [
      'Rullestadvatnet ligger ved Rullestad i Etne og er en stor ferskvannsflate i et markert dal- og fjellandskap. History Go-markøren representerer hele innsjøen og ikke én bestemt brygge, fiskeplass eller badeplass.',
      'Etne kommune opplyser at det finnes rundt førti gode fiskevann i kommunen. I Åkrafjordområdet beskrives Rullestadvatnet som det mest brukte vannet.',
      'Kommunen viser til båtutleie ved campingplassen på Halvfjordingen og til en fiskepir ved innfallsosen som er tilrettelagt for rullestol.',
      'Tilretteleggingen er viktig som læringsspor om tilgjengelig friluftsliv, men naturprofilen behandler først og fremst innsjøen som vannsystem: vannflate, innløp og utløp, strandsoner og forholdet til terrenget rundt.',
      'Kildene som brukes i denne batchen gir ikke grunnlag for å knytte bestemte fiskearter til akkurat Rullestadvatnet. Rundingene unngår derfor artslister som ikke er dokumentert på stedet.',
      'Fysiske oppgaver skal gjøres fra offentlig, tilrettelagt eller tydelig lovlig ferdsel. Ingen øvelse krever båt, bading, isferdsel eller opphold på glatte steiner i vannkanten.'
    ],
    summary: {
      one_liner: 'En stor innsjø i Åkrafjordområdet der natur, friluftsliv og tilrettelagt tilgang kan leses samtidig.',
      themes: ['innsjø', 'ferskvann', 'friluftsliv', 'tilgjengelighet', 'strandsoner', 'dal- og fjellandskap'],
      tone: ['nøktern', 'stedsspesifikk', 'tilgjengelighetsbevisst', 'sikkerhetsstyrt']
    },
    facts: [
      { id: 'fact_rullestadvatnet_01', label: 'Mest brukt i Åkrafjordområdet', desc: 'Etne kommune beskriver Rullestadvatnet som det mest brukte vannet i Åkrafjordområdet.', confidence: 'high', sources: ['Etne kommune – innlandsfiske'] },
      { id: 'fact_rullestadvatnet_02', label: 'Rundt 40 fiskevann i kommunen', desc: 'Kommunen opplyser at Etne har rundt førti gode fiskevann.', confidence: 'high', sources: ['Etne kommune – innlandsfiske'] },
      { id: 'fact_rullestadvatnet_03', label: 'Båtutleie ved Halvfjordingen', desc: 'Kommunen viser til båtutleie ved campingplassen på Halvfjordingen.', confidence: 'high', sources: ['Etne kommune – innlandsfiske'] },
      { id: 'fact_rullestadvatnet_04', label: 'Tilrettelagt fiskepir', desc: 'Ved innfallsosen finnes en fiskepir som kommunen oppgir er tilrettelagt for rullestol.', confidence: 'high', sources: ['Etne kommune – innlandsfiske'] },
      { id: 'fact_rullestadvatnet_05', label: 'Innsjøanker', desc: 'Kartpunktet er et områdeanker for hele Rullestadvatnet og ikke et bestemt fiskepunkt.', confidence: 'high', sources: ['History Go place data'] },
      { id: 'fact_rullestadvatnet_06', label: 'Natur før aktivitet', desc: 'History Go-profilen behandler innsjøen som natur- og vannsystem, mens fiske og tilrettelegging er brukslag rundt stedet.', confidence: 'high', sources: ['History Go place data'] },
      { id: 'fact_rullestadvatnet_07', label: 'Ingen udokumentert artsliste', desc: 'Denne batchens kilder gir ikke grunnlag for å navngi bestemte fiskearter for place-id-en.', confidence: 'high', sources: ['History Go source boundary'] },
      { id: 'fact_rullestadvatnet_08', label: 'Friluftsområde', desc: 'Rullestad-området inngår i kommunens friluftslandskap med postveg, jettegryter og andre nærliggende natursteder.', confidence: 'high', sources: ['Etne kommune – friluftsområde'] },
      { id: 'fact_rullestadvatnet_09', label: 'Tilgjengelighet som eget spor', desc: 'Den tilrettelagte innfallsosen gjør det mulig å lære om hvordan fysisk utforming påvirker hvem som kan bruke naturstedet.', confidence: 'high', sources: ['Etne kommune – innlandsfiske'] },
      { id: 'fact_rullestadvatnet_10', label: 'Sikker vannkant', desc: 'Oppgavene er avgrenset til trygg ferdsel og krever ikke båt, is eller bading.', confidence: 'high', sources: ['History Go production rule'] }
    ],
    chronology: [
      { id: 'chrono_rullestadvatnet_01', year: null, period: 'Naturgitt innsjølandskap', desc: 'Rullestadvatnet fungerer som ferskvannssystem i dal- og fjellandskapet.', confidence: 'high', sources: ['History Go place data'] },
      { id: 'chrono_rullestadvatnet_02', year: null, period: 'Tilrettelagt friluftsliv', desc: 'Båtutleie og en rullestoltilrettelagt fiskepir dokumenteres ved vannet.', confidence: 'high', sources: ['Etne kommune – innlandsfiske'] },
      { id: 'chrono_rullestadvatnet_03', year: 2026, period: 'Komplett rundingsprofil', desc: 'History Go produserer en full naturprofil som skiller innsjøen fra den enkelte tilretteleggingen.', confidence: 'high', sources: ['History Go place data'] }
    ],
    sources: sources.rullestadvatnet.map((s, i) => ({ id: `source_rullestadvatnet_${String(i + 1).padStart(2, '0')}`, label: s.title, type: i === 2 ? 'official_registry' : 'official', url: s.url, confidence: 'high' })),
    interpretation: {
      what_to_notice: ['vannets lengderetning', 'innløp og utløpsretning', 'variasjon i strandsonen', 'fjellrammen', 'tilrettelegging ved innfallsosen'],
      why_it_matters: ['Innsjøen er både natursted og lokalt friluftssted.', 'Tilrettelegging kan redusere barrierer uten å definere hele naturstedet.', 'Kildekritikk hindrer at udokumenterte arter fylles inn.'],
      counterpoints: ['Markøren er ikke en bestemt fiskeplass.', 'Kommunens informasjon om tilrettelegging gjelder konkrete deler av området, ikke hele strandsonen.', 'Manglende artsopplysninger skal ikke erstattes med antakelser.']
    },
    links: { entry_ids: ['st_rullestadvatnet_vannet_som_ble_mer_tilgjengelig'], related_places: ['jettegrytene_rullestad', 'postvegen_rullestadjuvet', 'langebudalen_naturreservat'], related_people: [] }
  }
];

await writeJson(storyPath, stories);
await writeJson(articlePath, articles);

const storiesManifest = await readJson('data/stories/stories_manifest.json');
for (const story of stories) {
  if (!storiesManifest.files.some((row) => row.entity_id === story.place_id && row.path === storyPath)) {
    storiesManifest.files.push({ category: 'natur', entity_id: story.place_id, path: storyPath });
  }
}
await writeJson('data/stories/stories_manifest.json', storiesManifest);

const leksikonManifest = await readJson('data/leksikon/manifest.json');
if (!leksikonManifest.files.includes(articlePath)) leksikonManifest.files.push(articlePath);
await writeJson('data/leksikon/manifest.json', leksikonManifest);

const testPath = 'tests/etne-natur-rounds-batch2.test.js';
const testSource = `const assert = require('assert');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch, 'runtime mangler naturprofil');\nconst expected = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nassert.deepStrictEqual(JSON.parse('[' + profileMatch[1] + ']'), expected);\nconst targets = ${JSON.stringify(Object.fromEntries(Object.entries(placeConfigs).map(([id, c]) => [id, c.file])))};\nconst stories = readJson('${storyPath}');\nconst articles = readJson('${articlePath}');\nconst storyManifest = readJson('data/stories/stories_manifest.json');\nconst leksikonManifest = readJson('data/leksikon/manifest.json');\nconst allIds = new Set();\nfor (const [id, file] of Object.entries(targets)) {\n  const place = readJson(file).find(x => x.id === id);\n  assert(place, 'mangler ' + id);\n  for (const forbidden of ['rounds','rundinger']) assert(!Object.prototype.hasOwnProperty.call(place, forbidden), id + ' har manuell ' + forbidden);\n  const story = stories.find(x => x.place_id === id);\n  const article = articles.find(x => x.place_id === id);\n  const content = { tasks: place.tasks_profile, nature: place.nature_profile, badges: place.underbadge_ids, training: place.training_profile, civication: place.civication_store, brands: place.brands, før_nå: place.for_na, fortellinger: story ? [story] : [], leksikon: article ? [article] : [] };\n  assert.deepStrictEqual(Object.keys(content), expected);\n  for (const [roundId, value] of Object.entries(content)) {\n    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');\n    assert(filled, id + ' mangler ' + roundId);\n  }\n  assert.strictEqual(place.tasks_profile.tasks.length, 4, id + ' skal ha fire tasks');\n  assert.strictEqual(place.training_profile.exercises.length, 3, id + ' skal ha tre treningsøvelser');\n  assert(place.civication_store.length >= 4 && place.civication_store.every(x => x.physicalObject === true && x.placeSpecific === true), id + ' har ugyldig civication');\n  assert(place.brands.length >= 4, id + ' mangler aktører');\n  assert(place.nature_profile.summary.length >= 1200, id + ' nature summary er for kort');\n  assert(place.nature_profile.source_boundaries.length >= 3, id + ' mangler source boundaries');\n  assert(place.for_na.before && place.for_na.now && place.for_na.change && place.for_na.lookFor.length >= 5, id + ' mangler før/nå');\n  assert(story && story.sources.length >= 3, id + ' mangler kildeledet fortelling');\n  assert(article && article.version === 2 && article.facts.length >= 10 && article.sources.length >= 3, id + ' mangler komplett leksikon');\n  assert(storyManifest.files.some(x => x.entity_id === id && x.path === '${storyPath}' && x.category === 'natur'), id + ' story ikke manifestlastet');\n  for (const obj of [...place.tasks_profile.tasks, ...place.training_profile.exercises, ...place.civication_store]) {\n    assert(!allIds.has(obj.id), 'duplikat rundings-id ' + obj.id);\n    allIds.add(obj.id);\n  }\n}\nassert(leksikonManifest.files.includes('${articlePath}'), 'leksikonfil ikke manifestlastet');\nconst folge = readJson(targets.folgefonnanasjonalpark_etne)[0];\nassert(/ikke gå på bre|ikke.*bre/i.test(folge.training_profile.safety));\nconst mosnes = readJson(targets.mosneselva_etne)[0];\nassert(/89 kvadratkilometer|89 km²/.test(mosnes.nature_profile.summary));\nassert(/1993/.test(JSON.stringify(mosnes)));\nconst rullestad = readJson(targets.rullestadvatnet)[0];\nassert(/rullestol/i.test(JSON.stringify(rullestad)));\nassert(/ikke.*fiskearter|ingen bestemte fiskearter/i.test(JSON.stringify(rullestad)));\nconsole.log('Etne nature rounds batch 2 OK');\n`;
await writeText(testPath, testSource);

const report = {
  batch: 'Etne nature rounds batch 2',
  date: '2026-07-23',
  places: Object.keys(placeConfigs),
  rounds: expectedRounds,
  content: Object.fromEntries(Object.keys(placeConfigs).map((id) => [id, {
    tasks: 4,
    trainingExercises: 3,
    civicationObjects: 4,
    brands: placeConfigs[id].patch.brands.length,
    storyId: stories.find((x) => x.place_id === id).id,
    articlePath
  }])),
  sourcePrinciples: [
    'official-source-led',
    'no manual rounds override',
    'no invented species claims',
    'broad area anchors never treated as access points',
    'all physical gameplay safety-bounded'
  ]
};
await writeJson(`${reportDir}/summary.json`, report);
await writeText(`${reportDir}/README.md`, `# Etne natur – rundingsbatch 2\n\nKomplette naturprofiler for Folgefonna nasjonalpark – Etne, Mosneselva og Rullestadvatnet.\n\nAlle tre følger canonical naturprofil uten manuell rounds-override: tasks, nature, badges, training, civication, brands, før_nå, fortellinger og leksikon.\n\nKildegrunnlaget er primært NVE, Folgefonna nasjonalpark og Etne kommune. Brede områdeankre behandles som områdeankre, ikke som anbefalte startpunkter. Rullestadvatnet får ingen udokumenterte artskoblinger.\n`);

let testOutput = '';
try {
  testOutput = execFileSync(process.execPath, [testPath], { cwd: root, encoding: 'utf8' });
} catch (error) {
  testOutput = `${error.stdout || ''}${error.stderr || ''}`;
  await writeText(`${reportDir}/validation/round-content-test.txt`, testOutput);
  throw error;
}
await writeText(`${reportDir}/validation/round-content-test.txt`, testOutput);

console.log('Etne nature rounds batch 2 generated and validated.');
