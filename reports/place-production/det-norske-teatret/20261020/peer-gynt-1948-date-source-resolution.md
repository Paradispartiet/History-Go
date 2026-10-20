# Det Norske Teatret – Peer Gynt-premieren i 1948, datokorrigering

Dato: 20. oktober 2026. Presisjonskorrigering på gjeldende `main`, ikke gjenbruk av det utdaterte C6-treet i PR #6304.

## Dokumentert dato og kildekonflikt

- [Det Norske Teatrets FOREST-produksjonsarkiv](https://arkiv.detnorsketeatret.no/produksjon/peer-gynt-19480302) oppgir **2. mars 1948**, `Hovudscenen (Stortingsgata 16)`, 125 forestillinger og Harald Sæveruds dirigering av 24 musikere.
- [Sceneweb, produksjon 38041](https://sceneweb.no/nb/production/38041/Peer_Gynt) oppgir **2. mars 1948**, samme historiske scene og produksjon, og viser også en 2. mars-datert programregistrering.
- [Det Norske Teatrets teaterhistoriker: Jakta på Peer](https://www.detnorsketeatret.no/bakgrunnsartiklar/6360) beskriver eksplisitt premieren **2. mars 1948**.
- [SNL: Peer Gynt – musikk](https://snl.no/Peer_Gynt_-_musikk) oppgir avvikende **2. mai 1948**. Avviket er dokumentert, ikke skjult; tre produksjonsnære oppslag veier tyngst for premieredatoen.

## Endringsgrense

Kun den feilaktige datoen i Hans Jacob Nilsens eksisterende `popupDesc` rettes til **2. mars 1948**, og direkte kildepekere legges til. C3-rapportens samme feil korrigeres. Oppføringens `id`, `desc`, `year`, `placeId`, `places`, `image`, `cardImage`, `imageMeta`, Wikidata-ID og øvrige beskrivelser forblir urørt. Runtime-shards og Place-open genereres gjennom `place-open:build`.

Dette gir **ingen** godkjenning av Forestillinger, Objects, Brands, frontImage, quiz/QuizCard eller full Place-closeout. Den gamle C6-PR-en må ikke merges uten en separat kilde- og bildesikker avstemming mot nyere `main`.
