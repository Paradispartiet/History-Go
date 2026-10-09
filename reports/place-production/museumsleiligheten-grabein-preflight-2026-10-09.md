# Museumsleiligheten Gråbein – checklist og nullmåling (2026-10-09)

**Status: PÅGÅR – IKKE sluttført.** Place `museumsleiligheten_grabein`, Tøyengata 38B.

## Preflight: Hovedbadge → kilde → profil
- Historie; undermerker `attenhundretallet`, `sosialhistorie`, `migrasjon_og_minoritetshistorie`, `kulturminner_og_bevaring`, alle fra canonical `data/badges/historie.json`.
- Badge-ruter: kronologi, historiske perioder, materielle spor, aktører, sosial kontekst, bevaring og minne. Kandidater: People, Objects, Brands, Historical Events.
- Bekreftet produksjonsprofil: **standard**. Egen bevart arbeiderleilighet med kildebåret historie om innvandring, boliger, urban fortetting, restaurering og museumsformidling.
- Own-place: den bevarte leiligheten i 38B. Ikke hele Gråbeingårdene, hele Tøyen eller Arbeidermuseet. Verifisert Geonorge-koordinat brukes som bygningsmarkør, ikke polygon.
- Kilder gjennomgått: [Oslo Museum](https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/), [Oslo byleksikon](https://oslobyleksikon.no/side/T%C3%B8yengata), [SNL Gråbeingårdene](https://snl.no/Gr%C3%A5being%C3%A5rdene), [SNL Haeselich](https://snl.no/Rudolf_Haeselich).
- Eksisterende #6159 quiz: 28 spørsmål / 4 sett, Knowledge, desktop-/mobilgjennomspilling PASS. Produseres ikke på nytt.

## Source → claim: historiske tidsankre

| År | Kildebåret hendelse |
|---|---|
| 1888 | Sju leiegårder rundt Tøyengata 38B, 212 små leiligheter (Oslo byleksikon). |
| 1891 | Familien Bjørklund, sju svenske arbeidsinnvandrere, bosatte seg i denne boligen (Oslo Museum). |
| 1981–83 | Sjugårdsgruppen rehabilitert (Oslo byleksikon), eksakt intervall beholdes. |
| 1987 | Museumsleiligheten tilbakeført (Oslo Museum). |
| 1990 | Oslo Museum overtok leiligheten (Oslo Museum). |

**Kronologi research PASS**, men epoke-/runtime-materialisering og epokeviser-QA er ikke utført, så **BLOCKED** for sluttporten.

## Checklist-gater

| Delsystem | Status | Dokumentasjon / neste gate |
|---|---|---|
| Identitet, koordinat, tekst, kilder | PASS kildefaglig | Canonical Place-data beholdt; rettet presisering av sju-gårdsgruppen og byfornyelsestidspunkt. |
| Quiz / Knowledge | PASS | #6159, 4×7 og runtime-test bestått. |
| Fagverk | UNDER ARBEID | Egen Place-eid standardartikkel, 4 linser, 5 spørsmål, 2 spor, registry; krever generering, tester og ekte nettleserlenker. |
| Språkleksikon | UNDER ARBEID | `Gråbein`, `klaskedo`, `leiegård`, `tilbakeføring`; manifest-resolvert. Dialekt BEGRUNNET N/A fordi dette ikke er et område-Place. |
| People | BLOCKED | Ole «Gråbein» Olsen og Rudolf Haeselich er direkte navngitte aktørkandidater; repoets personer mangler en profil med godkjent portrett og dokumentert eierkobling. Bjørklund er en dokumentert familie, ikke sju identifiserte personkort. |
| Objects | BLOCKED | Det finnes museumsobjekter/møbler, men individuelle gjenstanders originalproveniens og egne medlemsbilder er ennå ikke bekreftet. Ingen løse typegjenstander. |
| Brands | BEGRUNNET N/A foreløpig | Oslo Museum er forvalter og museum, men en separat kvalifisert stedsspesifikk Brand-kandidat er ikke dokumentert; kontrollér mot brandkontrakten før final. |
| Historical Events | BLOCKED | Daterte bygnings-/byfornyelsesankre finnes; egen canonical event-entitet, billedproveniens og preview er ikke kontrollert. Ikke forveksle tidslinje med samling. |
| PlaceCard-samlinger | BLOCKED | Ingen `place_card_profile` før minst én ekte canonical, kildebåret og bildeklart medlem og UI-verifikasjon finnes. Ikke tomme rundinger/filler. |
| `image` / `frontImage` | BLOCKED | Egen dokumentert fri eller klarert stedlig bildefil mangler. Oslo Museums Rune Thorstein-bilder kan ikke kopieres uten lisens/avtale. `frontImage` skal være stående, egen fil. |
| QuizCard/flip | BLOCKED | Ingen eksisterende fil for Gråbein i `bilder/QuizCards`. Stedsspesifikt kort, binding og test gjenstår. Ikke gjeninnfør `cardImage`. |
| Stories | UNDER VURDERING | Arbeidsmigrasjon og familiens boligliv gir mulig narrativ, men ikke dikt videre historie. |
| Før/etter | BLOCKED | Rehabilitering kildebelagt, men før-/etter-bilder fra samme synspunkt/rom og rettigheter er ikke dokumentert. |
| Nyheter | BEGRUNNET N/A | Ingen kontinuerlig, stedsegen nyhetsflate; museets sporadiske arrangementer er kalender-events. |
| Lesespor | BLOCKED | `Ulvehiet` (1919) er dokumentert i SNL. Verifiser lesbar, tillatt tekst og relevant forhold til leiligheten før publisering. |
| Relasjoner/ruter | UNDER VURDERING | Arbeidermuseet og Tøyen er faglige kontraster, ikke dokumentert rutemedlemskap. |
| Epokevisning, runtime, mobil/desktop, bilde-QA | BLOCKED | Sluttsjekk etter materialisering og legitime assets. |

**Ingen sluttattestasjon.** Teknisk grønn CI alene kan ikke overstyre manuell asset/visuell sluttkontroll.