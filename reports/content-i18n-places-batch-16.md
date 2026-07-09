# Content i18n places batch 16

## Status
- Data-only translation batch, but merged in two PRs.
- PR #2023 added batch 16a: 20 placeIds.
- PR #2035 added batch 16b: 20 placeIds.
- This repaired report documents both sets.
- Batch 16 total: 40 placeIds translated to en/es/pt after batch 15.
- Builds on PR #2000 / batch 15 and PR #2011 / batch 15 PT cleanup.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope
Current batch 16 data files:
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`

Repair files:
- `reports/content-i18n-places-batch-16.md`
- `reports/content-i18n-places-batch-16-repair.md`

## Batch 16a / PR #2023 placeIds
| placeId | Notes |
|---|---|
| `moelv_stasjon_mjoslinjen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `stange_stasjon_dovrebanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `gran_stasjon_gjovikbanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `lena_stasjon_totenbanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `reinsvoll_stasjon_totenbanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `dokka_stasjon_valdresbanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `skarnes_stasjon_kongsvingerbanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `braskereidfoss_kraftverk` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `slidredomen_vestre_slidre` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `bruflat_kirke_etnedal` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `skreia_stasjon_totenbanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `flisa_stasjon_solorbanen` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `vinger_kirke_kongsvinger` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `grue_finnskog_kirke` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `furnes_kirke_ringsaker` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `alvdal_kirke` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `bjorgan_prestegard_kvikne` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `kvikne_kirke` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `oyer_kirke` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |
| `tretten_kirke` | PR #2023 batch 16a translation entry; documented here, not changed by the repair. |

## Batch 16b / PR #2035 placeIds
| placeId | Notes |
|---|---|
| `skjaak_bygdamuseum` | PR #2035 batch 16b translation entry; quality-checked for this repair. |
| `stenberg_toten_museum` | PR #2035 batch 16b translation entry; generic pt fallback replaced. |
| `jorstadmoen_leir` | PR #2035 batch 16b translation entry; generic pt fallback replaced. |
| `nordberg_fort` | PR #2035 batch 16b translation entry; generic pt fallback replaced. |
| `gausdal_bygdetun` | PR #2035 batch 16b translation entry; generic pt fallback replaced. |
| `trysil_bygdetun` | PR #2035 batch 16b translation entry; generic pt fallback replaced. |
| `solor_museum_flisa` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `grue_kirke_brannminne` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `lom_bygdamuseum_presthaugen` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `blokkodden_villmarksmuseum` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `husantunet_alvdal_bygdemuseum` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `koppangtunet_stor_elvdal` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `tylldalen_bygdetun` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `faaberg_kirke` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `vang_kirke_hamar` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `mesna_kraft_og_industri` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `lillehammer_bryggeri_historisk_miljo` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `kistefos_tresliperi_jevnaker` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `kapp_melkefabrikk` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |
| `loiten_braenderi` | PR #2035 batch 16b translation entry; generic es/pt fallback replaced. |

## Translation summary
| Language | File | Entries before batch 16 | Entries after batch 16a | Entries after batch 16b | Total added |
|---|---|---:|---:|---:|---:|
| en | `data/i18n/content/places/en.json` | 674 | 694 | 714 | 40 |
| es | `data/i18n/content/places/es.json` | 674 | 694 | 714 | 40 |
| pt | `data/i18n/content/places/pt.json` | 674 | 694 | 714 | 40 |

## Repair note
Generic Spanish and Portuguese fallback text in batch 16b was replaced with concrete translations based on the canonical Norwegian source semantics for each affected placeId. The repair preserved placeIds, field sets, `_sourceHash`, and `_status`, and did not add new placeIds or alter canonical place data.

## Quality checks
- JSON parse passed.
- Both 16a and 16b ID sets present in en/es/pt.
- No duplicate IDs.
- No batch 15 IDs reused.
- Disabled IDs excluded.
- es/pt generic fallback removed for batch 16b.
- pt Spanish leakage check passed.
- No runtime files changed.
- No UI dictionaries changed.
- No canonical place data changed.
- No places_index regeneration.

## Recommended next batch
`Content i18n batch 17 — translate next visible manifest-backed places to en/es/pt`

## Final note
Batch 16 consists of PR #2023 and PR #2035 together. Batch 17 must exclude all 40 batch 16 IDs listed here.
