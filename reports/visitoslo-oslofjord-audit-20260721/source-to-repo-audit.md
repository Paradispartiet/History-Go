# VisitOSLO Oslofjorden — source-to-repo audit

Date: 2026-07-21

Source: https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/oslofjorden/attraksjoner

Visible source rows captured: **12**.

This is a machine-assisted first pass against the current canonical runtime index. Combined VisitOSLO rows are allowed to resolve to multiple canonical physical places. No new canonical place is created by this audit.

## Machine summary

```json
{
  "manual_review_required": 2,
  "manual_review_multiple_matches": 2,
  "unresolved_no_alias_match": 7,
  "candidate_exact_or_alias_match": 1
}
```

| # | VisitOSLO row | Type | Machine status | Canonical/alias hits | Top fuzzy candidates |
|---|---|---|---|---|---|
| 1 | Gressholmen, Heggholmen og Rambergøya | combined_islands | manual_review_required | gressholmen | gressholmen (Gressholmen); damstredet_telthusbakken (Damstredet og Telthusbakken); radmannsgarden_og_anatomibygget (Rådmannsgården og Anatomibygget); steen_og_strom (Steen & Strøm); palehaven_paleet (Paléhaven og Paleet) |
| 2 | Klosterruinene på Hovedøya | heritage_site | manual_review_multiple_matches | hovedoya_kloster, hovedoya | hovedoya (Hovedøya); hovedoya_kloster (Hovedøya kloster); bergseminaret_kongsberg (Bergseminaret på Kongsberg); mikaelskirken_slottsfjellet (Mikaelskirken på Slottsfjellet); fitjar_hakonarparken (Håkonarparken på Fitjar) |
| 3 | Ormøya og Malmøya | combined_islands | manual_review_required | — | damstredet_telthusbakken (Damstredet og Telthusbakken); radmannsgarden_og_anatomibygget (Rådmannsgården og Anatomibygget); steen_og_strom (Steen & Strøm); palehaven_paleet (Paléhaven og Paleet); krakstad_kirke_og_gravhaug (Kråkstad kirke og gravhaug) |
| 4 | Nakholmen | island | unresolved_no_alias_match | — | — |
| 5 | Steilene | island_group | unresolved_no_alias_match | — | — |
| 6 | Langøyene | island | unresolved_no_alias_match | — | — |
| 7 | Lindøya | island | unresolved_no_alias_match | — | — |
| 8 | Hovedøya | island | manual_review_multiple_matches | hovedoya_kloster, hovedoya | hovedoya (Hovedøya); hovedoya_kloster (Hovedøya kloster) |
| 9 | Aker Brygge | urban_area | candidate_exact_or_alias_match | aker_brygge | aker_brygge (Aker Brygge); gamle_aker_kirke (Gamle Aker kirke); hollen_brygge_sogne (Høllen brygge Søgne); skibladner_gjovik (DS Skibladner / Gjøvik brygge) |
| 10 | Ingierstrand bad | beach_facility | unresolved_no_alias_match | — | holmlia_bad (Holmlia bad); modum_bad_st_olafs_kilde (Modum Bad / St. Olafs kilde) |
| 11 | Bleikøya | island | unresolved_no_alias_match | — | — |
| 12 | Ulvøya | island | unresolved_no_alias_match | — | — |

## Manual review rule

Every unresolved or multi-match row must be reviewed for physical scope before production. A combined source row must not be forced into one marker when the source itself bundles several distinct islands or sites. Retail/service/activity-only rows are not present in this bounded attractions list.
