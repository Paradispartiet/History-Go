# History Go – undermerker, produksjonsbolk 01

Dato: 31. oktober 2026

## Formål og faktisk status

Scenekunst (7), By (10) og Film & TV (12) har **29 kanoniske underkategori-ID-er**, men ingen egne bilder registrert via `subBadgeImages` i de tre kategori-JSON-filene på `main`. Dette er **ikke** bevis for at 29 bilder mangler i alle mapper, og det er **ikke** en produksjonsgodkjenning for 29 nye illustrasjoner.

**Dette utkastet inneholder 29 konkrete motivspesifikasjoner og målrettet kontraktstest, men ingen nye bildefiler.** `data/badges/subbadge_round01_production_v1.json` inneholder eksakte ID-er, motiv og fargepar. `tests/subbadge-round01-production-contract.test.mjs` beskytter hovedmerker og registrerte undermerker.

## Vernet eksisterende arbeid

- Originalmerker: Historie, Sport, Politikk, Næringsliv og Subkultur.
- Nye godkjente hovedmerker: Religion, Kunst, Medier og Vitenskap.
- Nylig integrerte hovedmerker: Scenekunst, By, Film & TV og de øvrige hovedmerkene. Ingen hovedmerker endres i denne bolken.
- 8 registrerte religionsundermerker og 7 registrerte vitenskapsundermerker skal ikke erstattes.
- [Ekte kontaktark](../../badge-kontaktark.html) viser gjeldende faktiske bildefiler.

## Visuelle produksjonskrav

1. Bruk et **eget individuelt motiv** per underkategori, ikke utsnitt av et kontaktark. Realistisk tråd-/stoffstruktur, sydd kant og gjenkjennelig sentralsymbol. Unngå ekstra sirkler rundt symboler.
2. By: grå `#808080` og mørkegrå `#404040`, med arkitekturmotiver som kan skilles ved lav zoom.
3. Film & TV: magenta `#C2188B` og liljehvit `#E7F8FF`, med distinkte kino-, TV-, produksjons- og arkivmotiver.
4. Scenekunst: roserosa `#C96E8B` og grå `#808080`. Ingen limegrønn kant, svart bakgrunn eller gammelt grønt teatermerke.
5. Format: separat 1024 × 1024 WebP med faktisk alfa. Visuell kontroll i full størrelse **og kartstørrelse** før innkobling.
6. Undersøk eldre bildefiler og eventuelle spesialmapper før nyproduksjon, så vi ikke lager dubletter.
7. Et bilde får først `image`, `sha256` og aktiv kobling i riktig `subBadgeImages` etter godkjent kvalitet og bekreftet binæropplasting. Teknisk test alene er ikke visuell godkjenning.

## Arbeidsrekkefølge

| Bolk | Familie | Antall | Første motiver | Resultatkrav |
|---|---|---:|---|---|
| 01A | Scenekunst | 7 | Teater, Dans, Performance, Musikkteater | 7 individuelt reviderte bildefiler før aktivering |
| 01B | By | 10 | Klassisk arkitektur, Modernisme, Funksjonalisme, Brutalisme | 10 individuelt reviderte bildefiler før aktivering |
| 01C | Film & TV | 12 | Spillefilm, Kortfilm, Dokumentarfilm, TV-serier | 12 individuelt reviderte bildefiler før aktivering |

Resten av motivene og deres presise register-ID-er finnes i produksjonsmanifestet. Ingen «ferdig»-status tildeles kun på grunn av registrerte motivtekster.

## Godkjenningsport før merge av bildene

- De ni beskyttede hovedmerkene er uendret.
- Den eksisterende Religion- og Vitenskap-undermerkeproduksjonen er uendret.
- Manifest, faktiske bilder, mappekoblinger og checksums samsvarer.
- Ingen visuelt avviste kandidater er aktivert, heller ikke om bildeformatet er gyldig.
- Bare relevant testkjøring, ikke full CI uten grunn.

**Status for denne PR-en: spesifikasjon og kontrakt, ingen bilder produsert eller publisert.**
