# People expansion — Oslo populærkultur batch 1 validation

Generert: 2026-07-07T17:22:28Z

## Scope

Batchen legger kun til kollektive miljø-, publikums- og formatankre i `data/people/popkultur/oslo/people_popkultur_oslo.json`. Ingen navngitte enkeltpersoner, nye places, place-filer, `places_index`, manifest-filer eller UI/loader/relation-data ble endret.

## Candidate IDs sjekket repo-wide

Alle candidate IDs ble sjekket mot alle 28 manifest-listede people-filer før append.

| Candidate ID | Resultat |
|---|---|
| `house_of_nerds_miljoet` | ikke funnet; lagt til |
| `colosseum_premierepublikummet` | ikke funnet; lagt til |
| `folketeateret_musikalmiljoet` | ikke funnet; lagt til |
| `latter_standupmiljoet` | ikke funnet; lagt til |

Ingen `skipped_existing_anchor`.

## PlaceIds verifisert i `data/places/places_index.json`

| placeId | Resultat |
|---|---|
| `house_of_nerds` | finnes |
| `colosseum_kino` | finnes |
| `folketeateret` | finnes |
| `latter` | finnes |

Ingen `skipped_missing_place`.

## Research-gate per kollektivanker

| Candidate | Repo-grunnlag | Ekstern/offisiell verifisering | Resultat |
|---|---|---|---|
| `house_of_nerds_miljoet` | Repo-place beskriver House of Nerds som sosial møteplass for nerd-kultur, spill og sjangerfellesskap, med turneringer, brettspillkvelder og åpne arrangementer. | Offisiell House of Nerds-side beskriver stedet som sosialt samlingspunkt i hjertet av Oslo med PC-gaming-rom, VR Escape Room, konsoller, brettspill, bar, jevnlige eventer, turneringer og sosiale kvelder. | verifisert; lagt til |
| `colosseum_premierepublikummet` | Repo-place beskriver Colosseum kino som Norges ikoniske premiere- og storfilmkino med lanseringer, storfilmer, festivalvisninger og publikumsritual. | NFkino bekrefter Colosseum som kino med adresse Fridtjof Nansens vei 6, 0369 Oslo (Majorstua). | verifisert; lagt til |
| `folketeateret_musikalmiljoet` | Repo-place beskriver Folketeateret som storskalateater for musikaler og publikumsvennlige sceneshow. | Offisiell Folketeateret-side beskriver Folketeateret som privatdrevet musikal- og teaterscene i Oslo sentrum, med fokus på større musikaloppsetninger; kalender/kjøpsinformasjon bekrefter Storgata 21–23. | verifisert; lagt til |
| `latter_standupmiljoet` | Repo-place beskriver Latter som profesjonell standup-scene med tett kobling til TV-humor. | Offisiell Latter-side viser Latter på Aker Brygge, Holmens Gate 1, forestillingsprogram og «BOOK EN KOMIKER». | verifisert; lagt til |

Ingen `skipped_unverified_external_source`.

## Hvorfor dette er miljø-/publikums-/formatankre

- `house_of_nerds_miljoet` er et fandom-, spill- og community-anker for et fysisk sosialt spill- og eventsted, ikke en enkeltperson.
- `colosseum_premierepublikummet` er et publikums- og kinoritualanker for storfilm/premiere-formatet ved Colosseum kino, ikke en navngitt filmskaper eller kjendis.
- `folketeateret_musikalmiljoet` er et musikal-, ensemble-, sceneteknikk- og publikumsanker for et storskala scenested, ikke én skuespiller.
- `latter_standupmiljoet` er et standup-, klubb- og livehumor-formatanker ved Latter, ikke en navngitt komiker.

## Audit etter batch

| Felt | Verdi |
|---|---:|
| totalPeople | 503 |
| uniquePeopleIds | 503 |
| duplicatePeopleIds | 0 |
| invalidPlaceRefs | 0 |
| peopleWithoutValidPrimaryAnchor | 0 |
| peopleWithEmptyPlacesArray | 0 |
| flatPeopleFiles | 0 |
| geographicPeopleFiles | 28 |

Coverage etter batch for `populaerkultur`: 18 places, 5 med people, 13 uten people, 11 people-lenker, 11 unike people.

## Kjørte valideringer

- `node -e "for (const f of ['data/people/popkultur/oslo/people_popkultur_oslo.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"`
- Repo-wide duplicate ID-sjekk på alle manifest-listede people-filer.
- `npm run build:tools`
- `node dist/tools/audit-people-invalid-place-refs.mjs`
- `node dist/tools/audit-people-of-places-status.mjs`
- `node dist/tools/audit-people-place-coverage.mjs`
