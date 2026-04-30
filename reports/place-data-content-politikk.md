# Innholdsrapport – `places_politikk.json`

Dato: 2026-04-29

## Omfang

Oppdatert kun `data/places/places_politikk.json` med innholdsfeltene:
- `popupDesc`
- `emne_ids`
- `quiz_profile`

Ingen JS/CSS/HTML/UI/runtime/Wonderkammer-filer er endret.
Ingen andre `places_*.json`-filer er endret.

## Før/etter (kun `places_politikk.json`)

Fra audit før endring:
- Manglende `popupDesc`: **6**
- Manglende `emne_ids`: **6**
- Manglende `quiz_profile`: **6**

Fra audit etter endring:
- Manglende `popupDesc`: **0**
- Manglende `emne_ids`: **0**
- Manglende `quiz_profile`: **0**

## Kvalitetsvalg

- Brukte kun gyldige emner fra `data/fag/politikk/emner_politikk.json`:
  - `em_pol_makt_institusjoner`
  - `em_pol_geografi_sosial_struktur`
- Quiz-profiler er skrevet stedsspesifikt iht. bestilling:
  - `stortinget`: parlamentarisme, lovgivende makt, symbolbygg.
  - `youngstorget`: arbeiderbevegelse, demonstrasjoner, mobilisering.
  - `oslo_radhus`: kommunal makt, bysymbol, seremoni, representasjon.
  - `eidsvolls_plass`: byrom foran Stortinget, demonstrasjon, offentlighet.
  - `tinghuset`: rettsstat, domstol, offentlig institusjon.
  - `regjeringskvartalet`: regjeringsmakt, byutvikling, sikkerhet, nyere historie.

## Globale kontrolltall (etter endring)

- Ugyldige place-referanser globalt: **0** (uendret)
