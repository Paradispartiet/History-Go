# Stories coverage-snapshot — 27. juli 2026

> **Tidsbundet snapshot.** Rapporten gjelder commit `9f69a1310f882c10d707008480227d27b44565ea`. Aktiv sannhet ligger i de aktive manifestene, sourcefilene og `npm run check:stories`.

## Sammendrag

- Aktive, unike places: **1444**.
- Places med minst én primær story: **236**.
- Places uten primær story: **1208**.
- Total place-coverage: **16.3%**.
- Story-manifest-entryer: **176**, fordelt på **158** unike storyfiler.
- Unike stories: **251**; place-koblede: **251**; person-koblede: **98**.
- Aktive, unike people: **1367**; people med primær story: **95** (6.9%).
- Gjentatte sourceforekomster deduplisert: **0** places og **0** people.

## Totaltall

| Måltall | Antall |
|---|---:|
| Aktive place-sourcefiler | 1444 |
| Aktive, unike places | 1444 |
| Places med story | 236 |
| Places uten story | 1208 |
| Place-coverage | 16.3% |
| Story-manifest-entryer | 176 |
| Unike storyfiler | 158 |
| Unike stories | 251 |
| Place-koblede stories | 251 |
| Person-koblede stories | 98 |
| Aktive, unike people | 1367 |
| People med primær story | 95 |
| Places med flere primære stories | 11 |

## Dekning per canonical place-kategori

| Kategori | Places totalt | Med story | Uten story | Coverage |
|---|---:|---:|---:|---:|
| by | 237 | 25 | 212 | 10.5% |
| film_tv | 8 | 7 | 1 | 87.5% |
| historie | 517 | 51 | 466 | 9.9% |
| kunst | 64 | 13 | 51 | 20.3% |
| litteratur | 45 | 10 | 35 | 22.2% |
| media | 13 | 9 | 4 | 69.2% |
| musikk | 16 | 1 | 15 | 6.3% |
| naeringsliv | 150 | 13 | 137 | 8.7% |
| natur | 108 | 46 | 62 | 42.6% |
| politikk | 39 | 10 | 29 | 25.6% |
| psykologi | 3 | 3 | 0 | 100.0% |
| religion | 4 | 1 | 3 | 25.0% |
| scenekunst | 62 | 6 | 56 | 9.7% |
| sport | 83 | 26 | 57 | 31.3% |
| subkultur | 56 | 4 | 52 | 7.1% |
| vitenskap | 39 | 11 | 28 | 28.2% |

## Største udekkede kategori-gap

| Kategori | Uten story | Places totalt | Coverage |
|---|---:|---:|---:|
| historie | 466 | 517 | 9.9% |
| by | 212 | 237 | 10.5% |
| naeringsliv | 137 | 150 | 8.7% |
| natur | 62 | 108 | 42.6% |
| sport | 57 | 83 | 31.3% |
| scenekunst | 56 | 62 | 9.7% |
| subkultur | 52 | 56 | 7.1% |
| kunst | 51 | 64 | 20.3% |
| litteratur | 35 | 45 | 22.2% |
| politikk | 29 | 39 | 25.6% |

## Places med flest primære stories

| place_id | Navn | Kategori | Stories |
|---|---|---|---:|
| `folketeateret` | Folketeateret | scenekunst | 3 |
| `mollergata_19` | Møllergata 19 | historie | 3 |
| `oslo_radhus` | Oslo rådhus | politikk | 3 |
| `regjeringskvartalet` | Regjeringskvartalet | politikk | 3 |
| `barcode` | Barcode | by | 2 |
| `etneelva` | Etneelva | natur | 2 |
| `lisbon_fundacao_calouste_gulbenkian` | Fundação Calouste Gulbenkian | kunst | 2 |
| `lisbon_tram_28` | Tram 28 (Eléctrico 28) | by | 2 |
| `munch_museet` | MUNCH | kunst | 2 |
| `nrk_huset_marienlyst` | NRK-huset på Marienlyst | media | 2 |
| `vaterland_historisk_elvelop` | Vaterland – historisk elveløp | historie | 2 |
| `abc_studio_etne` | ABC Studio | kunst | 1 |
| `aftenposten_akersgata` | Aftenposten – Akersgata 51 | media | 1 |
| `akerselva` | Akerselva | by | 1 |
| `akerselva_utlop_bjorvika` | Akerselvas utløp mot fjorden (Bjørvika) | natur | 1 |
| `akershus_festning` | Akershus festning | historie | 1 |
| `akrafjorden` | Åkrafjorden | natur | 1 |
| `alna_bryn` | Alna ved Bryn | natur | 1 |
| `alna_smalvoll` | Alna ved Smalvoll | natur | 1 |
| `alna_utlop_bjorvika` | Alnas historiske utløp ved Vannspeilet | natur | 1 |

## Metode

- Coverage-enheten er én unik aktiv `place.id` med minst én manifestlastet story der primær `place_id` matcher stedet.
- Gjentatte story-manifest-paths dedupliseres før fysiske storyfiler lastes.
- Både root-arrays, wrapper-arrays og canonical enkeltobjektfiler støttes.
- Gjentatte place-/people-sourceforekomster dedupliseres på ID og rapporteres som auditmåltall.
- Flere stories på samme place øker storytotalen, men stedet teller bare én gang i coverage.
- `related_places` og `next_scenes[].place_id` integritetskontrolleres, men teller ikke som primær coverage.
- Kategoritabellen bruker canonical `place.category`.

## Kontroll

- `npm run typecheck:tools`: **pass**
- `npm run test:stories-manifest`: **pass**
- `npm run check:stories`: **pass**
- Generert: **2026-07-27T06:39:40+02:00**
- Input-commit: `9f69a1310f882c10d707008480227d27b44565ea`
- Maskinlesbar oppsummering: `reports/stories/STORIES_COVERAGE_SNAPSHOT_2026-07-27.json`

## Tolkning

Dette er en produksjonsbaseline, ikke en kontrakt. Nye story-, place- eller people-endringer gjør tallene historiske; neste rapport skal genereres på nytt fra aktive manifests.
