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

Denne planen er varig prosjektgrunnlag. Trinn A er implementert som en første kodeendring på separat gren og må verifiseres før den anses ferdig. Trinn B–D er ikke gjennomført.
