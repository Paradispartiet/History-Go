# Det Norske Teatret – C30: stedseierskap, bilderettigheter og quizkort

**Dato:** 20. oktober 2026. **Grunnlag:** C10-produksjonsregisteret og canonical DNT-workcard på `main` `5ce5422dcccfe5f84c53b7899474514f266f4ef8`, kontrollert mot lenkede primær-/institusjonsarkiver. Dette er kildearbeid, ikke bildepåføring eller Place-closeout.

## Dokumentert løsning av den åpne spillestedssaken

Tidligere C10 oppga `scene: null` og `stage_unresolved` for `klaar_en_to_1989`. [Det Norske Teatrets FOREST-arkiv](https://forest.detnorsketeatret.no/produksjon/klaar-en-to-kjoooor-19891128) oppgir **28. november 1989** og **Spelestad: Prøvesalen**. [Scenewebs spillestedspost](https://sceneweb.no/nb/venue/8948/Scene_3%20%28tidligere%20Pr%C3%B8vesalen%29%2C%20Det%20Norske%20Teatret) identifiserer dette som Scene 3 (tidligere Prøvesalen), **etablert 1985 på Kristian IVs gate 8**; navneendringen trådte i kraft **1. januar 2011**. At produksjonen var et samarbeid med NRK Fjernsynsteatret, beviser ikke at den ble fremført i et annet bygg. Dermed oppgraderes denne *kun* fra `stage_unresolved` til `house_confirmed`.

Resultat: **8/8 kandidater stedfestet til nåværende teaterhus. 0/8 publiseringsklare.** C10 beholder alle premierer, People-ID-er, kilder og eksisterende bildeblokker.

| Oppsetning | Premiere | Dokumentert scene | Mediebeslutning |
| --- | --- | --- | --- |
| Romeo og Julie | 19.09.1985 | Hovudscenen | Bilde mangler / ikke klarert |
| Cats | 09.11.1985 | Hovudscenen | Bilde mangler / ikke klarert |
| KLAAR....EN...TOO....KJØØØØR | 28.11.1989 | Prøvesalen (senere Scene 3) | Bilde mangler / ikke klarert |
| Salka Valka | 08.11.1990 | Scene 2 | Bilde mangler / ikke klarert |
| Medmenneske | 28.11.1991 | Hovudscenen | Bilde mangler / ikke klarert |
| Molly Sweeney | 23.02.1996 | Scene 2 | Program finnes, men er **ikke** automatisk et fritt forestillingsfoto |
| Sterk vind | 04.09.2021 | Scene 2 | Konkrete produksjonsfoto dokumentert, **copyright** |
| Tid for glede | 29.01.2022 | Hovudscenen | Konkrete produksjonsfoto dokumentert, **copyright** |

## Mediekilder undersøkt, men ikke godkjent

- [Sceneweb, Sterk vind – foto 148601](https://sceneweb.no/nb/multimedia/148601): fotograf Pernille Sandberg, viser Jon Bleiklie Devik, Jan Grønli og Anne Marit Jacobsen fra oppsetningen, men lisensfeltet er **© Det Norske Teatret**.
- [Sceneweb, Sterk vind – foto 143883](https://sceneweb.no/nb/multimedia/143883): fotograf Pernille Sandberg, merket **Copyright: Det Norske Teatret**.
- [Sceneweb, Tid for glede – foto 161473](https://sceneweb.no/nb/multimedia/161473): fotograf Pernille Sandberg; oppgir **copyright: Det Norske Teatret og Pernille Sandberg**.
- [Sceneweb, Molly Sweeney](https://sceneweb.no/nb/production/80304/Molly_Sweeney) har et programvedlegg fra 1996. Programtilgang er ikke dokumentasjon på fri bildegjenbruk.
- [Sceneweb, Cats (1985)](https://sceneweb.no/nb/production/52871/Cats) og [Sceneweb, Salka Valka (1990)](https://sceneweb.no/nb/production/42669/Salka_Valka) oppgir ingen vedlegg for de aktuelle produksjonene i de gjennomgåtte postene.

**Avgrensning:** At et foto kan lastes ned eller vises i Sceneweb betyr ikke at History GO har gjenbruksrett. Ingen av disse settes som `member_image`, og ingen billedrettigheter gjøres om til CC/PD uten kildedokumentasjon eller eksplisitt tillatelse. Det er ikke en fullstendig gjennomgang av alle mulige bildearkiver.

## QuizCard-status presisert

[PR #6357](https://github.com/Paradispartiet/History-Go/pull/6357), merget 18. oktober 2026, la inn **ett QuizCard med ti eksisterende kildebaserte spørsmål** om Det Norske Teatret i `data/quizcards/scenekunst/scenekunst_oslo_v1_batch1.json`. Dette betyr ikke at PlaceCard-kortet fungerer i live visning: original målquiz ligger under `musikk` mens QuizCard er under `scenekunst`. Kategori-/target-binding, Knowledge-paritet og desktop/mobil-akseptanse står igjen. Den eldre baseline-observasjonen fra 13. oktober (Quizkort mangler) beholdes som historisk observasjon.

**Samlet port:** Forestillinger **BLOCKED** (8/8 med bildekrav); People **BLOCKED** (57/87 publiserte portretter); Objects/Brands/frontImage/QuizCard-finalisering/full UI **ikke lukket**.
