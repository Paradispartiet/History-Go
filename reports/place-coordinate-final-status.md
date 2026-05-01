# Place coordinate final status

Generert: 2026-05-01T20:16:33.114Z

## Oppsummering
- antall aktive place-filer: **17**
- antall aktive steder: **221**
- antall ok: **165**
- antall verified: **23**
- antall semantic_anchor: **10**
- antall steder med anchors: **20**
- antall invalid_anchor: **0**
- antall needs_multiple_anchors: **10**
- antall remaining_needs_review: **10**

## Gjenværende faktiske feil
- data/places/places_historie.json | gamle_trikkestallen | Gamle trikkestallen på Sagene | needs_multiple_anchors
- data/places/places_naeringsliv.json | akerselva_industri | Akerselva industriområde | low_precision_coord, needs_multiple_anchors, area_or_park_needs_manual_review
- data/places/oslo/places_oslo_natur_akerselvarute.json | bjoelsenparken_elvenaer | Bjølsenparken (elvenær del) | needs_multiple_anchors, area_or_park_needs_manual_review
- data/places/oslo/places_oslo_natur_akerselvarute.json | vaterland_historisk_elvelop | Vaterland – historisk elveløp | needs_multiple_anchors
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | noklevann_ljanselva_start | Nøklevann (Ljanselva start) | low_precision_coord, needs_multiple_anchors, area_or_park_needs_manual_review
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_skullerud | Ljanselva ved Skullerud | needs_multiple_anchors, area_or_park_needs_manual_review
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_hauketo | Ljanselva ved Hauketo | low_precision_coord, needs_multiple_anchors, area_or_park_needs_manual_review
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_ljan | Ljanselva ved Ljan | needs_multiple_anchors, area_or_park_needs_manual_review
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_fiskevollen | Ljanselva ved Fiskevollen | needs_multiple_anchors, area_or_park_needs_manual_review
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | needs_multiple_anchors, area_or_park_needs_manual_review

## Utsatt til senere datamodell (coordStatus=needs_manual_map_check)
- data/places/places_historie.json | gamle_aker_kirke | Gamle Aker kirke
- data/places/places_historie.json | var_frelsers_gravlund | Vår Frelsers gravlund
- data/places/places_historie.json | hovedoya_kloster | Hovedøya kloster
- data/places/places_historie.json | eidsvollsbygningen | Eidsvollsbygningen
- data/places/places_historie.json | oscarsborg_festning | Oscarsborg festning
- data/places/places_historie.json | grini_fangeleir | Grini fangeleir
- data/places/places_historie.json | villa_grande | Villa Grande
- data/places/places_historie.json | bogstad_gard | Bogstad gård
- data/places/places_historie.json | mollergata_19 | Møllergata 19
- data/places/places_historie.json | arbeidersamfunnets_plass | Arbeidersamfunnets plass
- data/places/places_historie.json | toyen_hovedgard | Tøyen hovedgård
- data/places/places_historie.json | sagene_skole | Sagene skole
- data/places/places_historie.json | trefoldighetskirken | Trefoldighetskirken
- data/places/places_historie.json | gamle_deichman_hammersborg | Gamle Deichman på Hammersborg

## next_batch_candidates
- data/places/places_historie.json | gamle_trikkestallen | Gamle trikkestallen på Sagene
- data/places/places_naeringsliv.json | akerselva_industri | Akerselva industriområde
- data/places/oslo/places_oslo_natur_akerselvarute.json | bjoelsenparken_elvenaer | Bjølsenparken (elvenær del)
- data/places/oslo/places_oslo_natur_akerselvarute.json | vaterland_historisk_elvelop | Vaterland – historisk elveløp
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | noklevann_ljanselva_start | Nøklevann (Ljanselva start)
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_skullerud | Ljanselva ved Skullerud
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_hauketo | Ljanselva ved Hauketo
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_ljan | Ljanselva ved Ljan
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_fiskevollen | Ljanselva ved Fiskevollen
- data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden

## Audit-regelendring
- Audit ble oppdatert til å tolke `coordStatus`/`coordNote` som bevisst metadata for presisjon/område, unngå falske `low_precision_coord` og område-flagg når metadata eller anchors finnes.
- For lineære steder med gyldige anchors fjernes falsk `street_or_route_as_single_point`; kun steder uten anchors flagges som `needs_multiple_anchors`.