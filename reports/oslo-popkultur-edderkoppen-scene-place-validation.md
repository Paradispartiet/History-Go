# Oslo popkultur — Edderkoppen Scene place validation

Generated: 2026-07-09

## Scope

Adds `edderkoppen_scene` as a new Oslo popular-culture place.

## Added / changed files

- `data/places/popkultur/oslo/places_oslo_populaerkultur/edderkoppen_scene.json`
- `data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json`
- `data/places/popkultur/oslo/places_oslo_populaerkultur_index.json`
- `reports/oslo-popkultur-edderkoppen-scene-place-validation.md`

## Classification

- Category: `populaerkultur`
- Rationale: Edderkoppen is treated as revue, comedy, show, musical and commercial entertainment history rather than literary/dramatic theatre.
- Primary place id: `edderkoppen_scene`
- Display name: `Edderkoppen Scene`
- Year: `1942`
- Coordinates: `59.918075, 10.739692`
- Coordinate status in split index: `manual_review`
- Coordinate type in split index: `building_center`

## Source basis

Primary sources used for text decisions:

- Store norske leksikon, `Leif Juster`:
  - Juster opened Edderkoppen in 1942.
  - Edderkoppen started in Søilen in Keysers gate with `Saker og Ting`.
  - In 1945 the theatre moved to Det Norske Teatret's former premises at St. Olavs plass with `Hva nå?`.
  - SNL names Per Kvist, Oliver Neerland, Lalla Carlsen, Kari Diesen and Ernst Diesen as Edderkoppen-linked collaborators.
  - `Fluer i nettet` in 1966 is described as Edderkoppen's last Juster revue.
- Store norske leksikon, `Einar Schanke`:
  - Schanke wrote revues for Edderkoppen.
  - In 1978 he reopened Edderkoppen as `ABC-teatret`, where he was later director.
- Secondary cross-check:
  - Edderkoppen Theatre summary source confirms St. Olavs plass, the ABC-teatret period, 1999 destruction, 2003 rebuilding and Edderkoppen Scene name from 2016. This was used only for modern continuity framing, not for the core Juster/Schanke claims.

## Duplicate gate

Repository search before creation returned no active matches for:

- `edderkoppen_scene`
- `edderkoppen`
- `Edderkoppen`
- `ABC-teatret`

## Runtime/index note

This PR updates the split popkultur place file, split manifest and split index. It does not regenerate global build outputs such as `data/places/places_index.json`, and it does not rewrite the original aggregate file `data/places/popkultur/oslo/places_oslo_populaerkultur.json`.

Follow-up validation/build recommended after merge:

```bash
node -e "for (const f of ['data/places/popkultur/oslo/places_oslo_populaerkultur/edderkoppen_scene.json','data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json','data/places/popkultur/oslo/places_oslo_populaerkultur_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run places:index:build
npm run build:tools
npm run places:index:check
npm run places:emners:check || npm run places:emner:check
npm run places:coords:check
```

Expected after full build:

- `duplicatePlaceIds = 0`
- `edderkoppen_scene` appears in global place index
- no invalid coordinate status regressions
