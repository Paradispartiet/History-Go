# Hybrid subkultur place guard

Dato: 2026-07-09

## Bakgrunn

Etter cleanupen av hybrid-/akse-/vegg-/undergang-/passasje-steder må `check-places.sh` stoppe samme feiltype før den kommer inn igjen.

Prosjektregelen er:

- History Go places skal være konkrete steder.
- Konkrete steder kan være navngitte bygg, scener, parker, institusjoner, plasser, anlegg, butikker, klubber, monumenter eller tydelige fysiske steder med egen identitet.
- Hybridobjekter som `vegger`, `akser`, `underganger`, `pilarrom` og `passasjer` skal ikke være aktive places.

## Endring

`bash scripts/check-places.sh` får en ny gate:

```text
== Active subkultur place concreteness guard ==
```

Gaten leser:

- `data/places/manifest.json`
- alle manifest-listede place-filer
- `data/places/place_exclusions.json`

Den hopper over placeId-er som er eksplisitt deaktivert i `place_exclusions.json`.

Den feiler hvis et aktivt `category: "subkultur"`-sted ser ut som et hybrid-/akse-/vegg-/undergang-/passasje-objekt uten å være deaktivert.

## Hvorfor dette er viktig

Dette gjør at fremtidige batcher ikke kan gjeninnføre kunstige kartobjekter som people-of-place-grunnlag.

Riktig behandling framover:

- ekte sted → kan være aktiv place
- hybrid/akse/vegg/undergang/passasje → skal enten ikke inn, eller ligge i `place_exclusions.json` til fysisk cleanup er gjort

## Ikke endret

- Ingen data/places-filer
- Ingen people-filer
- Ingen manifest
- Ingen index
- Ingen UI/runtime

## Validering

Automatisk data-check workflow skal kjøre.

Lokal fallback:

```bash
bash scripts/check-places.sh
```
