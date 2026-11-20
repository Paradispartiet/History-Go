# Brands – kildeundersøkelse, runde 1 (16.11.2026)

Status: **visuell kildeundersøkelse, ingen godkjente eller importerte logoer**. Dette følger den maskinlagde opptellingen i `linked-brands-visual-inventory-2026-11-16.json`, som kun inkluderer Brands med direkte `place_ids` / `place_id`. Det er ikke bevist at alle disse er synlige i runtime.

## Viktig funn

Av 94 stedstilknyttede Brands har 75 `logo`-felt, fire har kun `image/cardImage` (trenger vurdering av faktisk logoidentitet), og 15 har ingen bildefelt. Alle 79 registrerte lokale bildefilstier finnes i undersøkte katalogmapper, men det er ingen automatisk garanti for riktig logo, epoke eller visning.

**Ingen KI-genererte logosymboler eller syntetiske ordmerker.** En egnet vare-/bedriftslogo må være dokumentert original, ha kilde-/rettighetsgrunnlag og riktig tidsstatus etter `docs/BRAND_ASSETS.md`.

## Første fem kildeavklaringer

| Brand | Tilknyttet Place | Kilde | Dokumentert | Bilde-/rettighetsstatus |
| --- | --- | --- | --- | --- |
| Frøken Dianas Salonger | `markveien` | https://www.frokendianassalonger.no/ og https://www.frokendianassalonger.no/pages/om-oss | Virksomhetens egen nettside og identitet; butikk fra 2008, dagens lokaler i Markveien 56 fra 2014 | **Kandidat til autentisk merke**; ingen separat original logo lastet ned og verifisert |
| Robot Oslo | `markveien` | https://www.robotoslo.com/ | Butikkidentitet fra 2005; dagens adresse oppgis som Korsgata 22, ved Markveien | **Kandidat**; identifiser autentisk logo, ikke bruk tilfeldig butikkutsidefoto som logo |
| KORO | `regjeringskvartalet` | https://koro.no/om-koro/logoer/ | Offisiell logo-side med nedlastingsarkiv | **Rettighetsavklaring nødvendig**: KORO opplyser at logo bare kan brukes etter avtale. Ingen automatisk import |
| Grüner IL | `daelenenga_idrettspark` | https://www.gruner.no/ | Offisiell klubbside med navn og lagidentitet | **Kandidat**; kontroller original emblemutgave og rettighetsgrunnlag |
| Nordic Office of Architecture | `regjeringskvartalet` | Ikke verifisert i denne runden | Stedstilknytning finnes i brand-master | **Uavklart**; hent original fra offisiell kilde før innføring |

Ikke kopier butikkskilt, logosymboler eller ordmerker fra genererte illustrasjoner. For Brands skal sourcePage vise hvor det autentiske logoassetet faktisk er funnet, og dataene skal angi transformasjonen (for eksempel proporsjonal skalering av originalen, ikke redesign).

## Prioritert arbeidsflyt

1. Verifiser aktuell logo + korrekt eier og tidsperiode for hvert Brand.
2. Bekreft bruksgrunnlag; stopp ved eksplisitte begrensninger.
3. Lag lokal fil og metadata i egen kandidatmappe, med dokumentert kilde og kreditering.
4. Gjennomgå at bildet faktisk er logo/ordmerke (ikke firmabygning, ansattfoto, annonse eller produkter).
5. Først da kobles til runtime / PlaceCard Brands.
