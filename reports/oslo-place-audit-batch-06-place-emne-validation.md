# Oslo place-audit batch 06 — automatisk validering av place-emne_ids

**Dato:** 2026-05-26

## Filer undersøkt
- `data/places/manifest.json`
- `data/places/places_index.json`
- `data/places/film/oslo/places_oslo_film.json`
- `data/fag/**/emner*_canonical*.json`
- `package.json`
- `tools/check-place-emne-links.mjs`
- `tools/check_places_index_sync.mjs`
- `tools/placeHealthReport.mjs`
- `reports/place-data-audit.md`
- `reports/oslo-place-audit-batch-05-film-tv-place-koblinger.md`

## Filer endret
- `tools/check_place_emne_ids.mjs` (ny)
- `package.json` (nytt npm-script)
- `reports/oslo-place-audit-batch-06-place-emne-validation.md` (ny rapport)

## Script opprettet/utvidet
Opprettet nytt script: `tools/check_place_emne_ids.mjs`.

Bakgrunn for nytt script:
- Det finnes eksisterende sjekker (`check-place-emne-links`, `placeHealthReport`), men batch 06 krevde en smal og eksplisitt valideringsfase med fast fail-kriterium rundt:
  1. canonical-oppslag av `emne_ids`
  2. duplikater internt per place
  3. duplikate place-id-er på tvers av aktive place-filer

## Hva scriptet sjekker
Scriptet:
1. Leser aktive place-filer fra `data/places/manifest.json`.
2. Scanner canonical emne-filer via mønster `data/fag/**/emner*_canonical*.json`.
3. Samler canonical emne-id-er (`id` / `emne_id`).
4. Validerer alle `emne_ids` i aktive place-filer.
5. Rapporterer `emne_ids` som mangler i canonical emne-kilder.
6. Rapporterer duplikate `emne_ids` internt på samme place.
7. Rapporterer duplikate place-id-er på tvers av aktive place-filer.
8. Returnerer exit code `1` ved funn, ellers `0`.

## Kjøringer og resultat
Kommandoer kjørt:
- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`

Resultat:
- `places:emner:check`: **FAIL** (forventet i nåværende datatilstand)
  - Active place files: 40
  - Canonical emne files scanned: 14
  - Canonical emne ids loaded: 878
  - Missing emne_ids: 510
  - Duplicate emne_ids within same place: 0
  - Duplicate place ids across active files: 0
- `places:index:check`: **PASS** (`places_index.json` er synkron)
- `health:places`: **PASS med warnings** (ingen errors; eksisterende warnings i datasett)

## Eksisterende feil scriptet finner
- Scriptet fant **510** `emne_ids` brukt i aktive place-filer som ikke finnes i canonical emne-kilder (slik disse filene er i dag).
- Scriptet fant **ingen** duplikate `emne_ids` internt på samme place.
- Scriptet fant **ingen** duplikate place-id-er på tvers av aktive place-filer.

## Klar for senere CI-kobling
Ja. Scriptet er laget for repeterbar, deterministisk kjøring og har tydelig exit-kode-kontrakt (`0`/`1`), så det er egnet som egen CI-gate.

## Forslag til batch 07
1. Rydd opp i de 510 manglende `emne_ids` ved å:
   - mappe til eksisterende canonical emner der det finnes semantisk match
   - eller opprette manglende canonical emner i riktig fagkilde før de brukes i place-data
2. Avklar policy for tverrfaglige `emne_ids` i place-filer (når cross-domain er tillatt).
3. Koble `places:emner:check` inn i fast pre-merge/CI flyt sammen med `places:index:check`.
