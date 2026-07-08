# People expansion — Oslo urban movement batch 1 validation

Dato: 2026-07-09

## Scope

Denne batchen legger til to kollektive sport-/urban movement-ankre for nye, allerede etablerte Oslo-steder:

- `verdensparken_parkour`
- `furuset_aktivitetspark`

Dette er ikke en researchbatch for nye places. Det opprettes ingen nye places.

## Implementering

Ny people-fil:

- `data/people/sport/oslo/people_sport_oslo_urban_movement_batch1.json`

Manifest oppdatert:

- `data/people/manifest.json`

## Added entries

| peopleId | primary placeId | type | status |
|---|---|---|---|
| `verdensparken_parkour_miljoet` | `verdensparken_parkour` | kollektivt miljøanker | added |
| `furuset_aktivitetspark_miljoet` | `furuset_aktivitetspark` | kollektivt miljøanker | added |

## Gate checks

Repo-søk før opprettelse fant ingen eksisterende treff på:

- `verdensparken_parkour_miljoet`
- `furuset_aktivitetspark_miljoet`

Place-grunnlag:

- `verdensparken_parkour` ble lagt inn i PR #1857 som sport/parkour/urban movement-place.
- `furuset_aktivitetspark` ble lagt inn i PR #1857 som sport/aktivitetspark/nærmiljøanlegg.

Begge miljøankre er skrevet som kollektive miljøer, ikke navngitte personer.

## Ikke endret

- Ingen `data/places/**`
- Ingen `data/places/manifest.json`
- Ingen `data/places/places_index.json`
- Ingen quiz-filer
- Ingen UI/runtime/loader-filer
- Ingen researchendringer

## Validering som bør kjøres før merge

```bash
node -e "for (const f of ['data/people/sport/oslo/people_sport_oslo_urban_movement_batch1.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Forventet:

- nye collective people anchors: 2
- nye named people: 0
- nye places: 0
- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0

## Endrede filer

- `data/people/sport/oslo/people_sport_oslo_urban_movement_batch1.json`
- `data/people/manifest.json`
- `reports/people-oslo-urban-movement-batch-1-validation.md`
