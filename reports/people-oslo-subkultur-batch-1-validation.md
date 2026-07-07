# People expansion — Oslo subkultur batch 1 validation

Generert: 2026-07-07

## Scope

Batchen legger til fire kollektive scene-/miljøankre i `data/people/subkultur/oslo/people_subkultur_oslo.json` på eksisterende Oslo subkultur-places. Det er ikke lagt inn navngitte enkeltpersoner, nye places, nye people-filer eller endringer i place-filer, `data/places/places_index.json` eller `data/people/manifest.json`.

## Candidate IDs sjekket repo-wide

Alle candidate IDs ble kontrollert mot alle manifest-listede people-filer i `data/people/manifest.json` før append.

| Candidate ID | Resultat |
|---|---|
| `skur13_miljoet` | ikke funnet; lagt til |
| `gamlebyen_sport_og_fritid_miljoet` | ikke funnet; lagt til |
| `kafe_haerverk_miljoet` | ikke funnet; lagt til |
| `vaterland_bar_scene_miljoet` | ikke funnet; lagt til |

`skipped_existing_anchor`: ingen.

## PlaceIds verifisert i places_index.json

| placeId | Resultat |
|---|---|
| `skur13` | finnes i `data/places/places_index.json` |
| `gamlebyen_sport_og_fritid` | finnes i `data/places/places_index.json` |
| `kafe_haerverk` | finnes i `data/places/places_index.json` |
| `vaterland_bar_scene` | finnes i `data/places/places_index.json` |
| `hausmania` | finnes i `data/places/places_index.json`; beholdt som secondary place for `kafe_haerverk_miljoet` |

`skipped_missing_place`: ingen.

## Research-gate per miljøanker

### `skur13_miljoet` → `skur13`

- Repoet definerer Skur 13 som arena for skate, graffiti og urbane subkulturer ved Tjuvholmen.
- Offisiell Skur 13-side beskriver Skur 13 som aktivitetshall for egenorganisert idrett, med skatehallen/aktivitetshallen og aktiviteter som skateboard, BMX, sparkesykkel, inline og quads.
- Oslo kommune beskriver skatehallen på Filipstad, nær Tjuvholmen, i et ombygd havnelager.
- Dette er derfor et trygt stedlig scene-/miljøanker for placeId `skur13`.

### `gamlebyen_sport_og_fritid_miljoet` → `gamlebyen_sport_og_fritid`

- Repoet definerer Gamlebyen Sport og Fritid som lokal skate-, scene- og aktivitetsarena i Gamlebyen, bygget gjennom dugnad, ungdomskultur og lavterskel nabolagsarbeid.
- Offisiell Gamlebyen-side bekrefter Gamlebyen Sport og Fritid, organisasjonens oppgave rettet mot barn/unge og voksne, og adresse St. Halvards gt. 4, 0192 Oslo.
- Dette er derfor et trygt miljøanker for placeId `gamlebyen_sport_og_fritid`.

### `kafe_haerverk_miljoet` → `kafe_haerverk`

- Repoet definerer Kafé Hærverk som liten bar, klubb, konsertsted og platebutikk i Hausmanns gate 34, med profil mot uavhengig og eksperimentell musikk.
- Offisiell Kafé Hærverk-side bekrefter KAFÉ HÆRVERK som bar, klubb, konsertsted og platebutikk i Hausmanns gate 34, 0182 Oslo.
- Dette er derfor et trygt sceneanker for placeId `kafe_haerverk`.

### `vaterland_bar_scene_miljoet` → `vaterland_bar_scene`

- Repoet definerer Vaterland Bar & Scene som bar og konsertscene i Brugata, tett knyttet til rock, punk, metal og undergrunnskultur.
- Offisiell Vaterland-side bekrefter Vaterland Bar & Scene i Brugata 9, 0186 Oslo.
- Ekstern venue-omtale beskriver Vaterland som rock-, punk- og metalvenue i Brugata 9.
- Dette er derfor et trygt sjanger-/sceneanker for placeId `vaterland_bar_scene`.

## Hvorfor dette er scene-/miljøankre, ikke enkeltpersoner

- Alle fire entries har kollektivt navn med `-miljøet` og beskriver stedbundne miljøer, scener, aktivitet, booking, sjangerfellesskap, dugnad eller ungdomskultur.
- Ingen entries er navngitte enkeltpersoner.
- Alle entries har primær `placeId` som finnes i `data/places/places_index.json`.
- Ankerlogikken følger eksisterende people-system for kollektive miljøankre som `blitz_miljoet`, `hausmania_miljoet`, `radi_orakel`, `gateavisa_miljoet`, `oslo_graffiti_miljoet` og `oslo_skateboardmiljoet`.

## Secondary placeIds

- `kafe_haerverk_miljoet` fikk secondary placeId `hausmania` som oppgitt i batchen.
- `hausmania` ble kontrollert mot `data/places/places_index.json` og finnes.
- Ingen secondary placeIds ble fjernet fordi audit viste ugyldige refs.

## Audit etter batch

| Felt | Verdi |
|---|---:|
| nye places | 0 |
| nye people/collective anchors | 4 |
| totalPeople | 496 |
| uniquePeopleIds | 496 |
| duplicatePeopleIds | 0 |
| invalidPlaceRefs | 0 |
| peopleWithoutValidPrimaryAnchor | 0 |
| peopleWithEmptyPlacesArray | 0 |
| flatPeopleFiles | 0 |
| geographicPeopleFiles | 28 |

## Kjørte valideringer

- JSON parse-sjekk for `data/people/subkultur/oslo/people_subkultur_oslo.json`, `data/people/manifest.json` og `data/places/places_index.json`: pass.
- Repo-wide duplicate ID-sjekk på alle manifest-listede people-filer: `duplicatePeopleIds = 0`.
- `npm run build:tools`: pass.
- `node dist/tools/audit-people-invalid-place-refs.mjs`: pass, `invalidPlaceRefs = 0`.
- `node dist/tools/audit-people-of-places-status.mjs`: pass, `duplicatePeopleIds = 0`, `invalidPlaceRefs = 0`, `peopleWithoutValidPrimaryAnchor = 0`, `peopleWithEmptyPlacesArray = 0`, `flatPeopleFiles = 0`, `geographicPeopleFiles = 28`.
- `node dist/tools/audit-people-place-coverage.mjs`: pass.
