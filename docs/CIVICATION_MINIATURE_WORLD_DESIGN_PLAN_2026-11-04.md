# Civication – design- og byggeplan for én levende miniatyrverden

Dato: 2026-11-04. Status: påbegynt i egen GitHub-gren, ikke produksjonspublisert.

## Mål

Kartet skal være den visuelle grunnmuren i Civication: et stilrent, detaljrikt miniatyr-Oslo med små tegn på hverdagsliv. Kart, «Min dag», Karriere, Personlig, Fritid, Kommers og Kultur skal dele samme visuelle språk. Dette er en visuell videreutvikling av eksisterende spill, **ikke** en omskriving av spillmekanikk eller stedskatalog.

## Kode som allerede finnes

- Civication.html og js/Civication/civicationShellLoader.js: laster skallet og det rike kartet.
- js/Civication/ui/CivicationThreeMap.js: primær 3D-/WebGL-renderer med stilisert Oslo, sjø, gater, bygningsmodeller, trær, lokale miljøobjekter, landemerker, kamerazoom og place-hit-testing.
- js/Civication/ui/CivicationCanvasMap.js, js/Civication/ui/CivicationMap.js: 2D-/SVG-fallback som må bevares.
- js/Civication/ui/CivicationMapModel.js og js/Civication/ui/CivicationCityLayer.js: bydeler, kartankre og plasshendelser.
- css/civi-three-map.css, css/civi-map-miniatures.css, css/civi-polish.css: eksisterende deler av designidentiteten.
- js/Civication/ui/CivicationLifestoryUI.js: «Min dag»-renderer, der valg og progresjon ikke skal endres av grafikken.

Konklusjon: utvid **eksisterende 3D-kart**. Ikke lag nytt kart, bytt koordinatsystem eller gjør dekorative objekter til nye stedsposter.

## Visuell standard

- **Stemning:** moderne bymodell/diorama, ikke fantasy, glorete mobilspill eller fotorealistisk fullskjermsbilde.
- **Farger:** dempet stein, støvete grønt, koksgrå, varm tregrå, havblå og sparsomt varmt lys. Ingen neon, skinnende gull eller grove gradientflater.
- **Geometri:** små, enkle, kantmyke volum med lik materialfølelse og en konsistent skala. Mennesker i anonym, stilisert silhuett – ikke karikerte ansikter.
- **Tetthet:** mange små detaljfunn, men luft rundt steder og landemerker. På stor utzoom leses først byform, grønt, fjord og hovedsteder; mikrodetaljer leses først ved innzooming.
- **Interaksjon:** eksisterende History Go-steder, markører, trykkflater, pan/zoom og menyene beholder prioritet; dekor er ikke klikkbar.
- **Mobil:** minimal geometri, gjenbruk av materialer, avgrensede antall objekter, reduserte effekter ved lite ytelsesbudsjett. Ingen tunge video- eller bildebakgrunner.

## Arkitektur og komponenter

1. **Brett / terreng (eksisterer):** fjord, byform, parker, veier og distrikter.
2. **Bygninger / steder (eksisterer):** lokale GLB-modeller, stedskoblede miniatyrer og landemerker.
3. **Mikroliv (nytt):** eget deklarativt, deterministisk tegnelag med små benker, figurer, sykler, lykter, plantekasser, boder og kaidetaljer. Normaliserte koordinater; kun dekor.
4. **Atmosfære (videreutvikles):** morgen, dag, kveld og natt knyttet til spillets kanoniske fase, ikke mobilens klokke. Lys, vinduer og skygger påvirkes subtilt; kartets lesbarhet forblir stabil.
5. **UI-språk (videreutvikles):** «Min dag» og øvrige faner kan bruke små utsnitt/ikoner fra miniatyrbiblioteket, lav kontrast i dekor, mer luft og tydeligere handlingshierarki.

## Leveransetrinn

### Trinn A – første byggesteg (denne grenen)
- Legg til js/Civication/ui/CivicationMapMicroWorld.js som datastyrt miljølag i 3D.
- Håndplasser en kontrollert første samling detaljer i eksisterende parker, torg og vannkant.
- Integrer modulen i rich-map-loaderen og hovedscenen, med sikker fallback ved feil.
- Gjør antall nye objekter synlig i kartdiagnostikk.
- Test determinisme, posisjoner, objekttyper og kobling til 3D-kartet.
- Ingen endringer i valg, økonomi, lagring eller fremdrift.

### Trinn B – større, variert miniatyrbibliotek
- Innfør flere bygningstyper (kafé, bibliotek, kontor, kulturhus, stoppested), detaljer på riktige steder og rolige lokale sammenhenger.
- Bruk LOD og instansering ved økt mengde. Unngå plassering oppå eksisterende landemerker; følg kart og klareringssoner.
- Legg til enkle fokusankre der hver spillkategori får et sted på kartet.

### Trinn C – døgnrytme i verden
- Les kanonisk spillfase gjennom eksisterende tilstands-/hendelses-API.
- Morgen: lavt mykt lys; dag: nøytralt; kveld: enkelte vinduer/lykter; natt: rolig, blågrått med små varme lyspunkter.
- Bruk samme fase i «Min dag»-kortets diskrete mikroillustrasjon. Unngå skjermdekkende landskapsbilder.

### Trinn D – visuell helhet
- Komponentbibliotek for ikoner, detaljer, overflater, typografi og statusvisning i Personlig, Karriere, Fritid, Kommers og Kultur.
- Fjern redundant ramme-på-ramme-design uten å fjerne viktig informasjon.
- Små animasjoner bare når de har informasjons- eller stemningsverdi; respekter prefers-reduced-motion.

## Akseptkriterier og kvalitetsport

- Interaktive steder kan fortsatt trykkes på, og pan/zoom fungerer.
- WebGL-feil gir fungerende Canvas/SVG-fallback.
- Eksisterende Life Story-scener, valg, Skills, kapital og kalender påvirkes ikke.
- Kartet ser rolig ut både på mobil og desktop; detaljer er synlige ved innzooming uten å skjule landemerker.
- Ny geometri er deterministisk, begrenset og kan slås av ved behov.
- Måling med virkelig mobil/desktop: sjekk oppstartstid, antall draw calls, FPS/minne og hit-testing før videre utrulling; tilpass objekttetthet og LOD etter resultat. Mål minst 30 FPS på representativ mobil, men erklær ikke resultatet oppnådd uten måling.
- Gjennomfør node --test tests/civication-map-micro-world.test.js, relevant npm run test:civication-map, manuelt skjermbilde på iPhone/Safari + desktop og verifiser ?civicationLite=1.
- Ikke merge/publiser før relevante kvalitetskontroller og visuell inspeksjon er gjennomført.

## Tilbakerulling

Trinn A er isolert bak window.CIVICATION_MICROWORLD_ENABLED !== false. Slå av med window.CIVICATION_MICROWORLD_ENABLED = false før 3D-init, eller fjern modulen fra rich-map-listen og byggkallet. Resten av kartet og all spilltilstand står urørt.

## Videre status

Denne planen er varig prosjektgrunnlag. Trinn A er implementert som en første kodeendring på separat gren og må verifiseres før den anses ferdig. Trinn B (lokalmiljøer/instansering) og C (fasebasert stemning) er påbegynt som prototype. Trinn D gjenstår.

## Implementeringslogg – 2026-11-04

Første sammenhengende prototype på PR #7047:

- **Mikroverden på 3D-kart:** 46 dekorative objekter i 8 områder med 7 små objekttyper. Geometrien bruker gjenbrukte materialer og enkle former. Dekor skaper ingen nye stedskort eller interaksjonsmål. Antallet kan leses via microWorldObjects i getSceneStats().
- **Kontroll på detaljtetthet:** mikrogruppen er synlig ved vanlig startzoom, men skjules under zoom 0.95 for å unngå visuell støy og unødvendige draw calls ved maksimal oversikt. Ytelse er ikke målt på fysisk mobil ennå.
- **Felles døgnrytme:** CivicationWorldMood leser kanonisk kalender og oversetter de 8 spillfasene til morgen/dag/kveld/natt. Kartlys og himmeltone oppdateres kun ved faktisk visuell faseendring.
- **«Min dag»:** én liten 90×64 illustrasjon med samme miniatyrgate i fire lysforhold og en tekstetikett for aktiv døgnfase. Ekstra/duplisert heldagsstripe er fjernet; kort og valg har kun diskrete tonale aksenter.
- **Tester:** tests/civication-map-micro-world.test.js og tests/civication-world-mood.test.js er registrert under npm run test:civication-map.
- **Verifisert i tilgjengelig verktøymiljø:** syntaks for begge moduler, kartintegrasjon og testfiler; deterministisk geometri (46 unike koordinater, 8 områder, 7 typer); opprettelse av 46 dekormodeller uten placeId; og spillkalenderens fire visuelle faseutganger. Dette er ikke en full Node-, CI-, mobil- eller WebGL-regresjon.

**Gjenstående før merge:** Godkjent GitHub CI, full kartregresjon, manuell WebGL-/Canvas-fallback på mobil og desktop, og visuell kontroll av skalering/kontrast/overlapp. Etter dette fortsetter trinn B og D med flere steder, stilmessig kategorioversettelse og ytelsesstyrt utvidelse. Ikke hev at prosjektet er ferdig eller live basert på denne prototypen.

## Implementeringslogg – videre utvidelse av kartet

- **11 nærmiljøer, 67 håndplasserte props og 10 typer** er nå i mikroverdensmodulen. De nye typene er kafébord, liten hund og kollektivholdeplass; flere små scener er lagt til ved Sagene, Kampen og Majorstuen. Fargebruken forblir dempet og illustrasjonene små.
- **Klareringssoner:** plasseringene bruker kartets egne LANDMARK_CLEAR_ZONES med 0,005 normalisert sikkerhetsmargin. Ved en fremtidig kartendring filtreres dekor automatisk bort dersom det havner innenfor en vernet sone; ingen landemerkers klikkmål overstyres.
- **Instansering:** gjentatte mesh som deler geometri og materialer tegnes gjennom Three.js InstancedMesh i støttede miljøer; en enkel ikke-instansiert reservegren finnes for testing/eldre runtime. En isolert JS-simulering av de 67 objektene ga 251 delmesh redusert til 31 instansgrupper. Dette er **ikke** en målt faktisk GPU-/mobil-ytelse.
- **Ytterligere døgnstemning:** gatelyktenes materialer får en knapt synlig lysgrad på dagtid og en forsiktig varm emissiv komponent på kvelden/natten, uten ekstra lyskilder eller animasjonsløkker. Den samme spillfasen styrer kartets generelle lys.
- **Av/på og diagnostikk:** eksisterende funksjonsbryter for mikrodekor er beholdt. Ny statistikk: microWorldDrawGroups og microWorldSkipped.
- **Tester utvidet:** posisjoner holdes utenfor den faktiske rendererens klare soner, og simulert instansering skal bevare samme totale geometri og redusere antall grupper.

**Neste kontroll før merge:** full GitHub CI på den siste PR-headen, vanlig karttest-suite, browser smoke, manuell Safari/desktop-visuell kontroll og reell FPS-/draw-call-måling. Ingen produksjonsklar-status er erklært.

## Implementeringslogg – mikrokvartaler og detalj-LOD

- Eget dataark i js/Civication/ui/CivicationMicroWorldDistricts.js med **14 kuraterte småmiljøer** i stilisert Oslo. Seks nye miljøer er synlige ved standardzoom; åtte gir nærbildedetaljer først ved innzooming.
- Totalt **25 miniatyrmiljøer, 158 småobjekter og 15 forskjellige objekttyper**, inkludert små kiosker, søppelbøtter, blomsterstander, parasoller og en diskret fontene. Hvert objekt består av enkle, gjentatte Three.js-former i samme avdempede palett.
- **Totrinns detaljstyring:** 107 basisobjekter ved vanlig zoom, 51 ekstra fra zoom 2,1. Hele mikroverdenen skjules under zoom 0,95. Dette gir roligere oversikt og nye oppdagelser ved innzooming.
- **Instansering etter detaljnivå, geometri og materiale.** Isolert JavaScript-kontroll: 583 kildedelmesh fra de 158 figurene fordeles på 80 instansgrupper (inkludert grupper skjult ved standardzoom). Antall grupper er ikke identisk med oppmålte GPU-draw calls.
- **Validering:** 158 unike normaliserte koordinater, 158 plasseringer utenfor de eksisterende landmark-klareringssonene, ingen egne placeId eller nye klikkmål. Ekstra props kan slås av med eksisterende funksjonsbryter.
- **Testregresjon:** karttesten laster bydelsdatamodulen og kontrollerer begge LOD-nivåer, avslag nær landemerker, instansantall, sammenheng med 3D-hovedkart og døgnlysets emissivverdier.
- **CI:** GitHub TypeScript guard og Civication browser smoke var grønne på forrige prototype-commit. Dette beviser ikke at nyeste 158-prop-head er godkjent; CI, mobilinspeksjon og virkelig FPS-måling gjenstår før merge.

Faglig avgrensning: Håndvalgte miniatyrklynger er estetiske stedsvignetter i det stiliserte Oslo-kartet, ikke påstander om nøyaktige geografiske koordinater eller ekte virksomheters plassering. Eventuell videre utvidelse bør først inspiseres visuelt på mobil ved lav, normal og høy zoom.

## Implementeringslogg – større, lesbart kartutsnitt

Brukerfeedback: kartet og miniatyrene oppleves for små selv etter flere nye detaljer. Kodegjennomgangen viste at selve kartcontaineren allerede dekker hele skjermen; det er **kameraets avstand/standardzoom** som gjør byen liten. Derfor endres utsnitt, ikke UI-containerens CSS eller byens kanoniske koordinater.

- **WebGL / Three.js:** standardzoom endret fra 1,24 til 1,56 på større skjermer (omtrent +26 % opplevd lineær skala), og 1,72 ved viewportbredde opptil 640 px (omtrent +39 %). Samme nivå benyttes ved kartets nullstillingsknapp.
- **Canvas fallback:** startzoom og nullstilling bruker nå 1,22 (desktop) / 1,34 (mobil), med 1,0 som fortsatt tilgjengelig minstezoom for full oversikt.
- **Trygg integrasjon:** Panorering, berøringsbevegelser, projeksjon av steder og treffområder følger uendret samme kartkamera og zoomtilstand som før. Ingen geometri, spilløkonomi, stedsdata eller historieprogresjon endres.
- **Mikrodetaljer:** med større startutsnitt er 107 basisobjekter tydeligere. De 51 ekstra forblir forbeholdt innzooming fra zoom 2,1, slik at forsiden ikke blir overfylt.
- **Testet isolert:** faktiske Three.js-/CanvasMap-moduler evaluert med stubbede kamera-/DOM-objekter. Reset ga henholdsvis 1,72/1,56 og 1,34/1,22 for mobil/desktop; utzooming fungerte i begge kartmotorene.
- **Automatiske tester:** egne regresjonskontroller lagt til eksisterende projektor-/kartzoomtester. Verifiser resultatet på faktisk iPhone/Safari og desktop før merge, særlig at aktuelle sentrumsområder fyller skjermen uten at stedsklikk skjules.

Den økte startzoomen er bevisst moderat. Hvis visuell gjennomgang viser at mobilutsnittet blir for trangt, justeres verdiene før publisering; ikke øk etter gjetning alene.

## Implementeringslogg – forankret zoom og «Hele Oslo»

Etter større startutsnitt var mobilens pinch-zoom fortsatt sentrert på skjermen, ikke fingrenes posisjon. Dette er korrigert i den kanoniske Three.js-kartmotoren:

- **Finger-/museforankret zoom:** zoom-anker beregnes på det skråstilte modellbrettets bakkeplan, inkludert kameratilt og svak vinkel i horisontalplanet. Ved innzooming skal det samme gatepunktet ligge på samme skjermkoordinat. To-fingerflytting panorerer også, selv når fingrene ikke endrer avstand.
- **Nullstill riktig:** 3D-kartet oppdaterer stedmodellenes LOD og utsnitt etter kameraets nye posisjon, også når nullstilling går fra et høyt til et lavere zoomnivå. Eksisterende place-raycasting er uendret.
- **To tydelige kartvisninger:** «⤢» vender tilbake til den større byvisningen (1,56 på desktop; 1,72 på mobil), mens en ny diskret «Oslo»-knapp viser hele kartet. Begge funksjonene er implementert i både Three.js og Canvas fallback, med tekstlig aria-label.
- **Faktisk full mobiloversikt i 3D:** oversiktszoom beregnes fra modellbrettets størrelse og tilgjengelig viewportbredde. Minste tillatte 3D-zoom er nå 0,32, siden tidligere 0,5 ikke kunne passe et 33,4-enheters brett i smal portrettvisning.
- **Isolert kodekontroll:** ved 390 × 844 px gir 3D-oversikt zoom 0,41984 og synlig bredde 35 verdensenheter; tilsvarende byvisning 1,72. Canvas går til 1,0 for oversikt og 1,34 for byvisning. Koordinatankeret holdt seg innenfor numerisk avrundingsfeil ved zoom både i sentrum og på viewportkantene.
- **Tester:** regresjonstester lagt til for 3D-forankring, panoramaoversikt, full brettbredde, riktig nullstilling og Canvas-fallback.
- **Visuell QA gjenstår:** tidligere GitHub browser-smoke-artefakt inneholdt «Min dag» og «Personer», men ikke eget skjermbilde av kartmodus. Disse skjermbildene beviser derfor **ikke** utseendet på 3D-miniatyrene. Kartet bør inspiseres ved både mobil-/desktop-zoom før merge.

Det er fortsatt bare rendering og kartnavigasjon som er endret; all spilltilstand og det faktiske stedskataloginnholdet er uendret.

## Implementeringslogg – tydeligere detaljer i nærvisningen (2026-11-05)

Brukerprioritet: **bygninger, mennesker og gater skal bli faktisk lettere å lese når man zoomer inn**, ikke bare større på skjermen.

- **Bygninger:** et deterministisk utvalg av generiske bygg får dører og små overdekninger på gatefasaden. To `THREE.InstancedMesh`-grupper gir ekstra dybde uten én draw call per bygg. Eksisterende fasadeteksturer, bygningenes plassering og landemerkeklareringer er beholdt.
- **Mennesker:** små figurmodeller har nå skuldre, to armer, hår og sko i samme dempede palett. Delene gjenbruker geometri og materialer fra eksisterende mikroverden, også i instansmodusen.
- **Gater:** hovedveier får et svakt fortaus-/kantsteinbånd og to kuraterte fotgjengerfelt. Nærdetaljene er dekorative og følger veiskjelettet; de introduserer ingen kartklikk, nye stedsdata eller mer GIS-presisjon enn modellen har.
- **LOD/ytelse:** bygnings- og gatedetaljer vises først fra zoom 2,1, som de eksisterende 51 høyzoom-mikroobjektene. De opprettes én gang under oppsettet og bytter kun `visible` ved zoom, uten arbeid per animasjonsramme. Mobil-FPS og faktisk GPU-belastning er **ikke målt ennå**.
- **Tester:** `tests/civication-map-micro-world.test.js` kontrollerer nå også menneskesilhuetter, instansbruk og nær-LOD-koblingene. Dette erstatter ikke visuell QA.

**Før merge:** vis kartet på virkelig mobil i byvisning, 2,1+ nærvisning og «Hele Oslo»; se etter at dører og gangfelt verken flyter over underlaget, skjules av andre objekter eller overlesser det dempede diorama-uttrykket. Sjekk både dags- og nattfase og sammenlikn ytelse med forrige head. PR forblir draft inntil dette er bekreftet.
