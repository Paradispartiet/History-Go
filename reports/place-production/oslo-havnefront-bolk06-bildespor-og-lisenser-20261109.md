# Oslo havnefront, bolk 06 — bildevalg, kilder og rettighetsport
**Dato:** 2026-11-09. **Status: utvalgte kandidater, ingen mediefiler materialisert gjennom dette dokumentet.** Tekstfasen og synk av fire Place-open-shards er utført separat i PR #7118.

## Kontrakt

- Bilder må vise det **rette** kanoniske stedet, ikke bare nabolaget; for bygninger skal inngang/fasade være lesbar også i mobilformat.
- `image` er liggende historisk eller nåtidig stedsflate, `frontImage` en **egen faktisk stående fil** med `height > width`; hver krever dokumentert kilde, lisens, opphav, utsnitt og eventuell endring.
- Dersom ett foto beskjæres til to formater, skal det være separate fysiske bildefiler, men visuell egenart må vurderes. Ingen CSS-maskert gjenbruk eller automatisk fallthrough.
- Aldri hevde at historisk utsnitt viser dagens utsikt. Originalillustrasjoner må merkes som illustrasjoner, ikke arkivfotografier.
- Alle bilder kontrolleres i faktisk PlaceCard og popup på 390px/1440px før v1.

## Verifiserte Commons-kandidater

| Sted | Rolle/kandidat | Motivet | Fotograf/dato | Eksakt lisens | Kildeside |
| --- | --- | --- | --- | --- | --- |
| `astrup_fearnley` | hero | Astrup Fearnley Museumsbygningen på Tjuvholmen | Chell Hill / 2. juni 2013 | **CC BY-SA 3.0 Unported** | https://commons.wikimedia.org/wiki/File:2013-06_Astrup_Fearnley_Tjuvholmen.jpg |
| `astrup_fearnley` | portrettkandidat / utsnitt krever kontroll | Astrup Fearnley Museet, annet fotografi | Mentalmelt / 13. aug. 2013 | **CC BY-SA 3.0 Unported** | https://commons.wikimedia.org/wiki/File:Astrup_Fearnley_Oslo_2013.jpg |
| `akrobaten_gangbro` | hero | Gangbro over Oslo S | Øyvind Holmstad / 29. okt. 2015 | **CC BY-SA 4.0 International** | https://commons.wikimedia.org/wiki/File:The_pedestrian_bridge_across_Oslo_Central_Station.JPG |
| `akrobaten_gangbro` | portrett | Akrobaten gangbro / Barcode | Binobose / 26. juni 2018 | **CC BY-SA 4.0 International** | https://commons.wikimedia.org/wiki/File:Akrobaten_Pedestrian_Bridge.jpg |
| `amerikalinjen` | hero | Den Norske Amerikalinjes tidligere hovedkontor, i hotellbruk | Olav Helland / 21. sept. 2019 | **CC BY-SA 4.0 International** | https://commons.wikimedia.org/wiki/File:Amerikalinjen_Hotell.jpg |
| `amerikalinjen` | portrettkandidat | Historisk rederihovedkontor, fasade | Knut Hjelleset / 22. sept. 2013 | **CC BY-SA 3.0 Norway** | https://commons.wikimedia.org/wiki/File:Den_norske_Amerikalinje.JPG |
| `aker_brygge` | eksisterende hero-kilde | Aker Brygge 2026 | Jorge Franganillo / 1. juni 2026 | **CC BY 4.0 International** | https://commons.wikimedia.org/wiki/File:Oslo_-_Aker_Brygge.jpg |
| `aker_brygge` | separat portrettkandidat | Aker Brygge 2026, annet opptak | Jorge Franganillo / 6. juni 2026 | **CC BY 4.0 International** | https://commons.wikimedia.org/wiki/File:Oslo_Aker_Brygge,_2026.jpg |
| `akerselva_utlop_bjorvika` | historisk kontrast, **IKKE dagens hero** | Utløpet sett fra kulverten før nyere byromsarbeid | Helge Høifødt / 29. juni 2011 | **CC BY-SA 3.0 Unported** | https://commons.wikimedia.org/wiki/File:Akerselvas_utlop_sett_fra_kulverten.jpg |

## Krever fremdeles eksakt original- og motivkontroll før materialisering

- **Akerselvas utløp, dagens bilde:** `Akerselvas utløp Munchs brygge og Munchmuset sett fra Dronning Eufemias gate.jpg` i Wikimedia Commons' `Category:Akerselvallmenningen, Oslo`. Store norske leksikon omtaler det som Helge Høifødts foto (2020), **CC BY-SA 4.0**. Den eksakte Commons-filpostens rettighetsside må leses ved materialisering, og bildenavnets stavemåte `Munchmuset` må brukes korrekt for oppslag. Ikke marker dette som ferdig originalkontroll.
- **Akershuskaiene:** Har allerede lokale, dokumenterte hero- og portrettvarianter i canonical Place. **Bevar dem** og gjør kun kildesjekk, bildefilkontroll og faktisk browser-QA.
- **Akrobaten:** Den fritt lisensierte portrettkildens GPS/EXIF virker å vise et punkt et stykke fra Place-ankeret. Bildet omtales eksplisitt som Akrobaten, men motivet må inspiseres visuelt før bruk, ellers velges et annet egnet foto av broen.
- **Astrup:** Begge kandidatene er liggende originaler; ved stående `frontImage` må et særskilt fysisk utsnitt av museumsbygningen lages og faktisk kontrolleres, ikke bare beskjæres av appens CSS.
- **Amerikalinjen:** Bildenes originalopphav og lisens er synlig, men portrettutsnitt skal kontrolleres for hovedportal/fasade og ikke bare tilstøtende Jernbanetorget.
- **Aker Brygge:** Det eksisterende `image` bruker Commons-redirect. Lokale lisensførte varianter kan erstatte runtime-avhengighet, men god historietekst/Fagverk skal ikke skrives om.

## Produksjonsstatus

**9 kandidater med inspisert Commons-lisens + en aktuell Akerselva-kandidat med utestående originalkontroll.** Ingen foto er lastet ned, konvertert til WebP, kontrollert for motiv/portrettgeometri eller koblet til PlaceCard via denne filen. Ikke hev bilde- eller v1-PASS før den separate produksjonsfasen faktisk er gjennomført. Ingen lisensforespørsler sendes; uavklarte foto kan erstattes av korrekt merkede originalillustrasjoner.
