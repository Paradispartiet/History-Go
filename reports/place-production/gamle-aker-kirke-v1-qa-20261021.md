# Gamle Aker kirke – v1-kontroll, 21. oktober 2026

**Canonical place-ID:** `gamle_aker_kirke`  
**Arbeidsgren:** `history-go/gamle-aker-quizcard-v1-20261021`  
**Beslutning:** `v1_candidate`; ikke erklær publisert v1 på grunnlag av denne delendringen.

## Behold eksisterende

- `desc`, `popupDesc`, 4.2-produksjonspakke, stedsspesifikt Fagverk, canonical plassering og eksisterende bildefiler.
- Fullquiz med 3 × 7 = 21 spørsmål, kilde-ID-er og Knowledge-lenker.
- Ett eksisterende QuizCard i `data/quizcards/historie/topp10_historie_sted_kort_batch1.json`. Tidligere kortspørsmål var generiske; gjenbruk kortet fremfor å opprette dublett.
- Gamle Aker har også tidligere fase-11-audit, men dette er ikke i seg selv godkjenning mot den nyere v1-minimumsstandarden.

## Fullquiz-QA

Spørsmål 01–07 dekker stående bygning, basilika, apsis, fossiler, usikker datering, Aker-navnet og fortsatt bruk. Spørsmål 08–14 dekker Nonneseter, to forskjellige branner (1592 og 1703), rivningsvedtak og redning (1852), Schirmer/von Hanno, pussfjerning på 1950-tallet og nyere rehabilitering. Spørsmål 15–21 gir fordypning i tidslag, kildekritikk og autentisitet. De metodiske spørsmålene er plassert i siste sett.

Kontroll av de 21 kanoniske spørsmålene: ingen åpenbar plassholder eller syntetisk spillterminologi i selve spørsmålene; tre sett med sju og separate historiske episoder. Spørsmål 14 er tidsbundet («rundt 2026») og bør revideres ved fremtidige endringer i rehabiliteringsstatus. Rivningsvedtaket i 1852 og brannen i 1703 skal ikke slås sammen.

**QuizCard:** Ti spørsmål er koblet direkte til fullquizen med eksakt tekst, svaralternativer, fasit, kilde-ID, claim-ID og Knowledge-ID. Testene verifiserer samme data og rendering via eksisterende PlaceCard-kontroller. Ingen ny fullquiz eller ekstra QuizCard opprettes.

## Historisk fortelling – redaksjonelle gjenstående grep

Gjeldende `desc` og `popupDesc` er gjennomgått. De er faktatette og presise, men mangler et sentralt konkret motiv: slange-/drageornamentet på utsiden av apsiden til nordkapellet. Den norske kirkes offisielle tekst kaller motivet Midgardsormen, mens faglig formidling bør skille selve steinhuggingen fra den sikre tolkningen av symbolikken.

Kilder:
- https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/sthans/forsideoppslag/gamle-aker/
- https://www.arkitektur.no/aktuelt/arkitektur/gamle-aker-om-igjen/
- https://snl.no/Gamle_Aker_kirke

Fremtidig redaksjonell endring bør åpne med at kalksteinen rommer fossiler som er langt eldre enn kirken; vise den innhugde ormen ved nordkapellet; fortelle om brannene og hvordan rivningsvedtaket i 1852 ble avverget. **Datering må fortsatt formidles som omdiskutert.** Ikke skriv at Olav Kyrre sikkert grunnla kirken, at en eldre trekirke er dokumentert, eller at det var et sikkert førkristent tingsted.

Ingen `desc`-/`popupDesc`-endring gjøres uten samtidig oppdatert claim-kjede, setningskoblinger, SHA-256, separat faktareview/redaksjonelt review og regenererte runtimefiler i samsvar med `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`.

## Bildekontroll

Eksisterende hovedfoto, kortfoto og før/etter-fotopar er lokale. Hovedfotoet viser sørsiden **10. februar 2008**, av Mahlum, offentlig domene:
https://commons.wikimedia.org/wiki/File:Gamle_Aker_kirke_S.jpg

Dette fotoet kan **ikke** dokumentere resultatet av rehabiliteringen i 2023–2024. Før/etter-bildets eldre motiv er oppgitt som Ole Tobias Olsen / Oslo Museum, CC BY-SA 4.0.

Som kandidat til en separat faktisk stående `frontImage` er følgende originale **portrettfoto** dokumentert: «Old Aker Church (Gamle Aker kirke).jpg» av VisitOSLO, 1800 × 2400 px, CC BY 2.0:
https://commons.wikimedia.org/wiki/File:Old_Aker_Church_(Gamle_Aker_kirke).jpg

Dette er **bare en kandidat**: motiv, bildekvalitet, originalfil, godkjent bearbeiding, lokal bildefil, metadata og faktisk PlaceCard-visning må kontrolleres før kobling i Place. Et eksternt URL-felt eller CSS-beskjæring erstatter ikke et egenprodusert stående lokalt bilde.

## Testbevis og resterende porter

- `tests/gamle-aker-v1-quizcard-parity.test.mjs`: data-, fasit-, kildesporings- og bildebanekontrakt.
- `tests/gamle-aker-quizcard-placecard-runtime.test.mjs`: JSDOM-test mot faktisk PlaceCard-kontroller og historie-manifest.
- Statisk bildebanekontroll er **ikke** en visuell bilde-QA.
- GitHub CI kan være grønn uten å ha kjørt den nye testen eller en faktisk Chromium-visning. Les workflowens faktiske jobber/steps før sluttporten omtales som bestått.
- Mangler før v1: dokumentert browser-QA i 390/1440 px, vurdert stående bildeflate der flip-kontrakten krever det, og redaksjonell/claim-validert styrking av hovedfortellingen.

## Seksdimensjonal kvalitetsvurdering – for hele v1, foreløpig

| Dimensjon | Score / 5 | Kommentar |
| --- | ---: | --- |
| Korrekthet og evidens | 4 | QuizCard med direkte kanonisk proveniens, historiske usikkerheter bevart |
| Dekning og ferdigstillelse | 3 | Redaksjon, stående bildeflate og full browser-QA gjenstår |
| Faglig og redaksjonell kvalitet | 4 | Generiske kortspørsmål erstattet, men Midgardsormen mangler fra hovedhistorien |
| Teknisk integritet | 3 | Måltester lagt inn; faktisk gjennomført relevant test-/browserkjøring må dokumenteres |
| Sikkerhet og ansvarlighet | 5 | Rettighetsgrenser og kildeusikkerhet synliggjort |
| Vedlikeholdbarhet | 5 | Eksisterende kort og runtime gjenbrukt, ingen ny parallell datamodell |
| **Sum** | **24/30** | **v1_candidate; ikke fullført** |
