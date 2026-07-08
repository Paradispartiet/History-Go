# Remove hybrid subkultur places from active dataflow

Dato: 2026-07-09

## Bakgrunn

Prosjektregelen er nå at History Go places skal være konkrete steder: navngitte bygg, scener, parker, institusjoner, plasser, anlegg, butikker, klubber, monumenter eller andre tydelige fysiske steder med egen identitet.

Hybrid-/akse-/vegg-/undergang-/passasje-objekter skal ikke være aktive places og skal ikke brukes som grunnlag for people-of-place-ankre.

## Deaktivert fra aktiv dataflyt

Følgende placeId-er er lagt i `data/places/place_exclusions.json`:

- `vulkan_murvegger`
- `hausmannsgate_aksen`
- `kolstadgata_toyen_vegger`
- `gronland_underganger`
- `nybrua_pilarrom`
- `schweigaards_gate_lodalen`
- `kuba_akselpassasjer`
- `grunerlokka_bakgardsvegger`
- `brenneriveien_ingens_gate`

## Implementering

Denne PR-en gjør tre ting:

1. Legger til `data/places/place_exclusions.json` med deaktiverte placeId-er.
2. Oppdaterer `tools/build_places_index.mts` slik at deaktiverte ID-er ikke skrives til ny `places_index.json`.
3. Oppdaterer `tools/check_places_index_sync.mts` slik at index-check sammenligner etter samme disabled-place-filter.
4. Oppdaterer `js/dataHub.js` slik at runtime filtrerer deaktiverte places bort også før index-filen fysisk regenereres.

## Ikke gjort i denne PR-en

- Sletter ikke den gamle aggregate-kildefilen fysisk.
- Sletter ikke split-artefakter fysisk.
- Legger ikke til nye steder.
- Legger ikke til nye people.
- Endrer ikke quiz, emner eller koordinater for konkrete steder.

## Hvorfor ikke fysisk sletting direkte?

`data/places/subkultur/oslo/places_subkultur.json` er en stor aktiv aggregate-fil. Trygg fysisk sletting bør gjøres som separat mekanisk cleanup med lokal index-regenerering og full `bash scripts/check-places.sh`.

Denne PR-en fjerner hybridene fra aktiv app/dataflyt nå, samtidig som fysisk sletting kan tas kontrollert etterpå.

## Validering

Automatisk data-check workflow bør kjøre.

Lokal fallback:

```bash
bash scripts/check-places.sh
```

Forventet effekt:

- hybrid-ID-er filtreres bort fra runtime `DataHub.loadPlacesBase()`
- fremtidig `places:index:build` skriver dem ikke inn i ny `places_index.json`
- konkrete steder som `Sofienbergparken`, `Torggata Blad`, `Stovnertårnet`, `Hausmania`, `Blå`, `Skur 13`, `Kafé Hærverk`, `Oslo Skatehall` osv. beholdes
