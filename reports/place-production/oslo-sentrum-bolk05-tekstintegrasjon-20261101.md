# Oslo sentrum – bolk 05: integrasjon av aktive stedstekster

**Dato:** 1. november 2026  
**PR:** #6867 (draft)  
**Omfang:** Redaksjonelle endringer i seks **eksisterende** canonical Place-filer, uten nye Places, flytting av kartpunkt, kategoriendring eller quizprogresjonsendring.

## Oppdaterte kilder og stedstekster

| Place-ID | Aktiv redaksjonell endring | Sti |
|---|---|---|
| `folketeateret` | Skiller Den Norske Operas avskjedsforestilling **31.12.2007** fra nytt operahus **2008**; forklarer Folketeaterpassasjen/Operapassasjen; oppdaterer tidslinje og tekstlige quizprofilmarkører | `data/places/scenekunst/oslo/places_scenekunst/folketeateret.json` |
| `kunstnernes_hus` | Utvider institusjons-, arkitektur- og okkupasjonshistorien, skiller Guernicas historiske utstilling i 1938 fra dagens samling | `data/places/kunst/oslo/places_kunst/kunstnernes_hus.json` |
| `historisk_museum` | Fletter inn Karl August Henriksen/Henrik Bull og jugendarkitekturen, uten å redusere eksisterende samlings- og etikkstoff | `data/places/historie/oslo/places_historie/historisk_museum.json` |
| `ibsen_museum_teater` | Tilføyer gjenoppbygging i 2006, teatersal/navn **2022** og leilighet gjenåpnet **1.7.2023**; skiller publikumsinngang fra Ibsens hjem | `data/places/litteratur/oslo/places_litteratur/ibsen_museum_teater.json` |
| `blitzhuset` | Utvider selvorganisering, musikk, kommuneavtale, rivingsvedtak og ombygging; omtaler 30c/30e uten å endre canonical adressen **30C** | `data/places/subkultur/oslo/places_subkultur/blitzhuset.json` |
| `kulturkirken_jakob_litteratur` | Tilføyer rehabilitering og ombruk 1985–2000; beholder musikkens hovedkategori, teknisk detaljtekst, bilde og kuratert Fagverk | `data/places/musikk/oslo/places_musikk/kulturkirken_jakob_litteratur.json` |

## Kildeankere

- [Oslo byleksikon – Folketeatret](https://oslobyleksikon.no/side/Folketeatret)
- [Oslo byleksikon – Folketeaterpassasjen](https://oslobyleksikon.no/side/Folketeaterpassasjen)
- [Kunstnernes Hus – vår historie](https://kunstnerneshus.no/om/historie)
- [Historisk museum – historien til museumsbygget](https://www.historiskmuseum.no/om-museet/om-bygningane/index.html)
- [IBSEN Museum & Teater – fra dramatikerhjem til museum](https://ibsenmt.no/fra-dramatikerhjem-til-museum)
- [Oslo byleksikon – Blitz](https://oslobyleksikon.no/side/Blitz)
- [Oslo byleksikon – Pilestredet](https://oslobyleksikon.no/side/Pilestredet)
- [Kulturkirken Jakob – historie](https://www.jakob.no/om-jakob/historie)

## Omfang og vern

- 6/6 canonical Place-filer endret; eksisterende `id`, `category`, `address`, `lat` og `lon` kontrollert uendret.
- Folketeaterets tidslinje og eksisterende tekstlige `quiz_profile.signature_features` korrigert; **ingen** quizspørsmål, svar, progresjon, manifest eller Knowledge-ID-er skrevet om.
- Ingen andre Oslo-bolker, Folkets Hus eller parallell litteraturquiz for Kulturkirken Jakob berørt.
- Ingen endring i bildeindeks, hero, frontImage eller cardImage. Eksisterende Kulturkirken Jakob-bilde beholdt.

## Åpne porter før v1

1. **Bilder:** Seks Commons-kandidater og lisenser er dokumentert i `oslo-sentrum-bolk05-bildekilder-20261101.md`. Originalbyte-nedlasting lyktes ikke i dette arbeidsmiljøet 1.11.2026. **Ingen WebP importert**, ingen SHA-256 eller utsnitt godkjent. Kjør bildeproduksjon med direkte filtilgang før bildeporten lukkes. Bevar synlig fotograf, filside, CC BY-SA-versjon og merking av beskjæring/konvertering.
2. **Quiz og kort:** Revider Folketeaterets eksisterende quiz mot tidskorrigeringen, og produser gjenstående fullquiz/QuizCards etter billedporten. Unngå årstallspugging og dobbelte ID-er.
3. **Generering og QA:** Regenerer bare berørte avledede registre etter repoets ordinære prosedyre; målrettet CI og visuell kontroll i mobilbredde og desktop. Grønne PR-kontroller alene er ikke app-godkjenning.

**Status:** Stage A **aktive tekster levert i PR-grenen**, Stage B og senere porter **ikke fullført**. Draft skal ikke merges som en ferdig v1-leveranse.
