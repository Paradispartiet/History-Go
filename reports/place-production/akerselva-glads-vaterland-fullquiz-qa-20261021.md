# History Go – Glads mølle og Vaterland: quiz v1-kvalitetsbolk

**Dato:** 2026-10-21
**Utgangspunkt:** eksisterende publiserte historiske tekster, v4.2-pakker, dokumentarfoto, lokale 3:4-portretter og QuizCards.

## Resultat
| Sted | Tidligere | Aktive nå | Omskrevet | Tilbaketrukne |
| --- | ---: | ---: | ---: | ---: |
| Glads mølle | 35 / 5 sett | 21 / 3 sett | 7 | 14 |
| Vaterland – historisk elveløp | 42 / 6 sett | 21 / 3 sett | 8 | 21 |
| **Sum** | **77** | **42** | **15** | **35** |

Første to sett beholdes strukturelt. På Vaterland ble tre tidligere metaspørsmål i sett 1–2 erstattet med kildebelagte spørsmål om den åpne elvestrekningen, Elvegata i 1989 og Nybrua i 1827. Det tredje settet ble forbedret med saneringen fra 1959, historiske bilder og spor etter gatenettet. Glads mølles tredje sett ble revidert rundt dokumenterte hendelser i 1736–1992, tidligere industri, takform, fredning og senere ombruk.

De ti QuizCard-ID-ene på hvert sted er bevart. To QuizCard-spørsmål på Vaterland er synkronisert med forbedret fullquiztekst; Glads mølles QuizCard er uendret.

## Kildegrunnlag
- Glads mølle: [Oslo byleksikon](https://oslobyleksikon.no/side/Glads_m%C3%B8lle), [Bentse Brug](https://oslobyleksikon.no/side/Bentse_Brug), [Oslo kommunes Sagene-artikkel](https://magasin.oslo.kommune.no/byplan/sagene-et-unikt-omrade).
- Vaterland: [Oslo byleksikon om Vaterlands bru](https://oslobyleksikon.no/side/Vaterlands_bru), [Elvegata](https://oslobyleksikon.no/side/Elvegata), [Vaterland](https://oslobyleksikon.no/side/Vaterland), [SNL om Akerselva](https://snl.no/Akerselva), [Lokalhistoriewiki om Elvegata](https://lokalhistoriewiki.no/wiki/Elvegata_(Oslo)).
- Eksisterende stedsspesifikke og verifiserte produksjonspakker er bevart i `data/places/production/glads_molle.json` og `data/places/production/vaterland_historisk_elvelop.json`.

## Kontroller og avgrensning
Ny målrettet test `tests/akerselva-glads-vaterland-narrow-quiz.test.mjs` håndhever 3 × 7, unike stabile ID-er, svarindeks, kilde- og Knowledge-lenker, manifester og 10/10 QuizCard-paritet per sted. Sjekk må bestå etter kanonisk Knowledge-generering og ordinær GitHub-CI.

Eksisterende fotografier, portrettutsnitt, stedsbeskrivelser, koordinater, historier, plasseringer og UI-kode er **ikke** endret. Appens visuelle PlaceCard- og QuizCard-kontroll gjenstår før full v1-godkjenning. Ingen nye fotografier er oppfunnet.
