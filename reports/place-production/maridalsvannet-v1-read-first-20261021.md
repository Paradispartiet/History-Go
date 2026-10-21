# Maridalsvannet – v1 nullmåling og kildekontroll, 21. oktober 2026

## Funn før produksjon
- Canonical place: `data/places/natur/oslo/places_oslo_natur_hovedsteder/maridalsvannet.json`, `id: maridalsvannet`, natur, dokumentert OSM-polygon (relation 1438314). Koordinater, identitetsgrense, category og underbadges beholdes.
- Eksisterende `popupDesc` inneholdt interne spillinstruksjoner («I History Go bør ...»), og `desc` var generisk. Begge er nå omskrevet til historisk fortelling med tydelige vendepunkter og aktører.
- Ingen aktiv `maridalsvannet` i quizmanifestet eller natur-QuizCard-samlinger ved nullmålingen. Ingen kuratert Fagverk-side før endringen.
- **V1-profil:** natur, innsjø/drikkevannskilde, med `innsjo`, `vann_og_vassdrag`, `vannkvalitet`, `skog`. Verken besøksstedets naturprofil eller gamle koordinater er endret.

## Kontrollerte kilder og faktagrense
- Oslo byleksikon – Maridalsvannet (https://oslobyleksikon.no/index.php?title=Maridalsvannet): avsnitt om inn- og utløp, 1867, 1888, 1920 og Oset 1971.
- Oslo byleksikon – Vannforsyningen (https://oslobyleksikon.no/index.php/Vannforsyningen): historikk 1850–1900, Oset 1971 og nytt anlegg 2008.
- Oslo kommune – Vann og avløp i 150 år (https://www.oslo.kommune.no/etater-foretak-og-ombud/vann-og-avlopsetaten/vann-og-avlop-i-150-ar/): forurensning og Maridalssyken, over 30 000 syke i 1888, bakgrunn for vannverksutbygging.
- Oslo kommune – ferdselsregler (https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/marka/ferdsel-ved-maridalsvannet-og-andre-drikkevannskilder): restriksjonsområder, ingen bading/fiske/båt og ikke rasting nærmere enn 50 meter i merkede områder.

Årstallene 1867, 1888, 1971 og 2008 brukes fordi de er historiske vendepunkter, ikke for å fylle en kronologi. Menneskene som ble syke omtales uten dramatiserende enkelthistorier som kildene ikke dokumenterer. Vannbehandling og kildebeskyttelse skilles fra påstander om dagens kvalitet.

## Bildefunn – ikke ferdiggodkjent
- Eget stående dokumentarfoto 1024×1369: Grzegorz Wysocki (2007), CC BY 3.0, https://commons.wikimedia.org/wiki/File:Maridalsvannet,_Oslo.jpg.
- Separat bredt dokumentarfoto: Geir Hval (2022), CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Maridalsvannet_i_Maridalen,_Oslo,_Norway_(2022.11.12).jpg.
- Begge kildene er åpnet og rettighetene kontrollert, men filene er foreløpig eksterne referanser. Lokal WebP-materialisering, lenketest og visning i faktisk app er ikke dokumentert. **V1-status er kandidat, ikke godkjent**, inntil dette er løst.

## Scope og videre porter
Egen Fagverk-blokk er produsert og registrert. Kildebasert fullquiz (minimum 3×7) og QuizCard (10 spørsmål) skal være fra samme faktabank, uten repetisjon og med eksplisitt fasit, kilder og Knowledge-kobling. Materialisering av runtime, Fagverk release, place-index, eventuelle beskrivelses-/oversettelsespakker, relevante tester og mobil/desktop-QA gjenstår. Ingen V3/vFerdig-status settes. Ikke start neste sted parallelt.
