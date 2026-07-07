# People expansion — Oslo subkultur batch 3 validation

Dato: 2026-07-07

## Scope-bekreftelse

- Batchen opprettet ingen nye places.
- Batchen endret ingen place-filer og endret ikke `data/places/places_index.json`.
- Batchen la ikke inn navngitte enkeltpersoner; alle opprettede entries er kollektive miljø-/sceneankre.
- Ingen secondary places ble opprettet eller gjettet.
- Target placeId ble ikke endret for å få audit grønn.

## Filer lest før endring

- `data/people/manifest.json`
- `data/places/manifest.json`
- `data/places/places_index.json`
- `data/people/subkultur/oslo/people_subkultur_oslo.json`
- `data/places/subkultur/oslo/places_subkultur.json`
- `reports/oslo-subkultur-new-places-batch-1-validation.md`
- `reports/people-of-places-status.md`
- `reports/people-place-coverage.md`

## Candidate peopleIds sjekket repo-wide

Sjekket mot alle manifest-listede people-filer før append:

| peopleId | Resultat |
|---|---|
| `helvete_neseblod_miljoet` | ikke funnet før append |
| `last_train_miljoet` | ikke funnet før append |
| `rock_in_miljoet` | ikke funnet før append |
| `club_7_miljoet` | ikke funnet før append |

Duplicate-sjekk etter append på alle manifest-listede people-filer: `duplicatePeopleIds = 0`.

## placeIds sjekket mot places_index

| placeId | Finnes i `places_index.json` | Batch-status |
|---|---:|---|
| `helvete_neseblod_records` | ja | primary anchor OK |
| `last_train_oslo` | ja | primary anchor OK |
| `rock_in_oslo` | ja | primary anchor OK |
| `club_7_vika` | ja | primary anchor OK |

## Entries lagt til

| peopleId | primary placeId | Status |
|---|---|---|
| `helvete_neseblod_miljoet` | `helvete_neseblod_records` | added |
| `last_train_miljoet` | `last_train_oslo` | added |
| `rock_in_miljoet` | `rock_in_oslo` | added |
| `club_7_miljoet` | `club_7_vika` | added |

## Skipped entries

Ingen kandidater ble skippet.

| peopleId | Årsak |
|---|---|
| — | ingen `skipped_existing_anchor` |
| — | ingen `skipped_missing_place` |

## Research-gate per opprettet miljøanker

### `helvete_neseblod_miljoet`

- Grunnlag i ny place-entry: `helvete_neseblod_records` beskrives som historisk black metal-platebutikk og senere Neseblod Records / Black Metal Museum i Schweigaards gate. Place-entryen sier også at stedet skal behandles nøkternt som musikkhistorie, platekultur, ekstremmetal, undergrunn og kontroversielt kulturminne, uten glorifisering av vold, drap, kirkebranner eller ekstremisme.
- Grunnlag i batch 1-valideringsrapporten: `helvete_neseblod_records` ble lagt til som nytt sted, med research om Helvete/Neseblod i Schweigaards gate 56 og formulert som musikkhistorie, platekultur, undergrunn og kontroversielt kulturminne.
- Batch 3-formulering: miljøankeret beskriver black metal-, platebutikk-, metalarkiv- og undergrunnsmiljøet knyttet til Helvete / Neseblod Records. Det er nøkternt formulert og er ikke skrevet som true crime.

### `last_train_miljoet`

- Grunnlag i ny place-entry: `last_train_oslo` beskrives som rockbar og konsertsted i sentrum, knyttet til Oslos rock-, indie- og undergrunnsmiljø. Place-entryen vektlegger liten fysisk scene, band, publikum, arrangører, rock-/indie-/undergrunnsmiljø, sentrum og kontinuitet.
- Grunnlag i batch 1-valideringsrapporten: `last_train_oslo` ble lagt til med offisiell adresse og kilder som beskriver Last Train som rockbar og konsertsted med lang kontinuitet.
- Batch 3-formulering: miljøankeret beskriver rock-, indie-, konsert- og barpublikumsmiljøet rundt Last Train, ikke en generisk pub.

### `rock_in_miljoet`

- Grunnlag i ny place-entry: `rock_in_oslo` beskrives som rock- og metalpub i Oslo med konserter, arrangementer og tydelig sjangerprofil. Place-entryen peker på Rock In som pub, møteplass og liten scene for sjangerpublikum, med vekt på rock, metal, små scener, miljøfellesskap og konsertkultur.
- Grunnlag i batch 1-valideringsrapporten: `rock_in_oslo` ble lagt til som nytt sted med researchgrunnlag for rock-/metalprofil og liten scene.
- Batch 3-formulering: miljøankeret beskriver rock-/metalpublikum, konserter, sjangerfellesskap og liten scene uten overdrevent intern sjargong.

### `club_7_miljoet`

- Grunnlag i ny place-entry: `club_7_vika` beskrives som historisk motkulturklubb i Oslo, knyttet til jazz, poesi, teater, film, alternative livsformer og 1960-/70-tallets motkultur. Place-entryen er eksplisitt på at Club 7 var aktivt fra 1963 til 1985, hadde flere lokasjoner, og at Vika-/Munkedamsveien 15-perioden brukes som områdeanker for den lange siste perioden.
- Grunnlag i batch 1-valideringsrapporten: `club_7_vika` ble lagt til som nytt sted, med research som vektla Club 7 som historisk motkulturarena og ikke et aktivt nåværende utested.
- Batch 3-formulering: miljøankeret beskriver historisk motkultur, jazz, poesi, teater, film, debatt, alternative livsformer og sceneoffentlighet, og er tydelig på at `club_7_vika` er et stedlig anker, ikke hele historien om miljøet.

## Navngitte personer

Bekreftet: ingen navngitte enkeltpersoner ble lagt inn i denne batchen. De fire nye entries er kollektive miljøankre.

## Place-filer

Bekreftet: ingen filer under `data/places/**` ble endret, og `data/places/places_index.json` ble ikke endret.

## Auditresultater etter batch

### JSON parse-sjekk

- `data/people/subkultur/oslo/people_subkultur_oslo.json`: OK
- `data/people/manifest.json`: OK
- `data/places/places_index.json`: OK

### Repo-wide people ID-sjekk

- Manifest-listede people-filer lest: 29
- `duplicatePeopleIds = 0`

### Audits

- `npm run build:tools`: OK
- `node dist/tools/audit-people-invalid-place-refs.mjs`: OK
  - `invalidPlaceRefs = 0`
  - `peopleWithoutValidPrimaryAnchor = 0`
- `node dist/tools/audit-people-of-places-status.mjs`: OK
  - `duplicatePeopleIds = 0`
  - `invalidPlaceRefs = 0`
  - `peopleWithoutValidPrimaryAnchor = 0`
  - `peopleWithEmptyPlacesArray = 0`
  - `flatPeopleFiles = 0`
  - `geographicPeopleFiles = 29`
- `node dist/tools/audit-people-place-coverage.mjs`: OK
  - `People uten gyldig sted = 0`
  - `Ugyldige place-referanser = 0`

Merk: `geographicPeopleFiles` er 29 i nåværende manifest/audit-output etter batchen, ikke 28.

## Endrede filer

- `data/people/subkultur/oslo/people_subkultur_oslo.json`
- `reports/people-invalid-place-refs.json`
- `reports/people-invalid-place-refs.md`
- `reports/people-of-places-status.json`
- `reports/people-of-places-status.md`
- `reports/people-place-coverage.json`
- `reports/people-place-coverage.md`
- `reports/people-oslo-subkultur-batch-3-validation.md`
