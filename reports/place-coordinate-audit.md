# Place coordinate audit (active data only)

Generert: 2026-04-30T09:51:40.894Z

## Aktiv hovedstatistikk
- Aktive place-filer lest: **18**
- Aktive steder lest: **228**
- ok: **129**
- needs_review: **70**
- conflict: **16**
- invalid: **13**
- duplicate: **0**
- outside_expected_area: **0**

## Aktive filer (fra manifest)
- data/places/oslo/places_oslo_natur_akerselvarute.json
- data/places/oslo/places_oslo_natur_alnaelva_rute.json
- data/places/oslo/places_oslo_natur_bygdoy.json
- data/places/oslo/places_oslo_natur_hovedsteder.json
- data/places/oslo/places_oslo_natur_ljanselva_rute.json
- data/places/oslo/places_oslo_natur_ostensjovannet.json
- data/places/places_by.json
- data/places/places_historie.json
- data/places/places_kunst.json
- data/places/places_litteratur.json
- data/places/places_musikk.json
- data/places/places_naeringsliv.json
- data/places/places_natur.json
- data/places/places_nature_aliases.json
- data/places/places_politikk.json
- data/places/places_sport.json
- data/places/places_subkultur.json
- data/places/places_vitenskap.json

## Aktive steder som må rettes
- data/places/places_by.json | ullevål_hageby | Ullevål Hageby | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_by.json | tjuvholmen | Tjuvholmen | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_by.json | deichman_bjorvika | Deichman Bjørvika | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_by.json | barcode | Barcode | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_by.json | damstredet_telthusbakken | Damstredet og Telthusbakken | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_by.json | vigelandsparken | Vigelandsparken | conflict | low_precision_coord, area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_by.json | voienvolden | Voienvolden | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord
- data/places/places_historie.json | damstredet_telthusbakken | Damstredet og Telthusbakken | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_kunst.json | vigelandsparken | Vigelandsparken | conflict | low_precision_coord, area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_kunst.json | tjuvholmen | Tjuvholmen | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_kunst.json | barcode | Barcode | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_litteratur.json | voienvolden | Vøienvolden gård | conflict | duplicate_id, duplicate_id_different_coord
- data/places/places_litteratur.json | deichman_bjorvika | Deichman Bjørvika | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_litteratur.json | ullevål_hageby | Ullevål Hageby | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_naeringsliv.json | frysja_industriomrade | Frysja industriområde | conflict | area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/oslo/places_oslo_natur_akerselvarute.json | frysja_industriomrade | Frysja industriområde | conflict | area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord
- data/places/places_nature_aliases.json | toyengata | Tøyengata | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | vaterlandsparken | Vaterlandsparken | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | lovisenberg_sykehus | Lovisenberg sykehus | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | nya_bjorvika | Nye Bjørvika | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | bjorvika_barcode | Bjørvika Barcode | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | frognerbadet | Frognerbadet | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | bjerke_travbane | Bjerke travbane | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | fagerborg_kirke | Fagerborg kirke | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | torshovparken | Torshovparken | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | borregravfeltet | Borrehaugene | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | munchs_hus_aasgardstrand | Munchs hus i Åsgårdstrand | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | trosterud_skulpturpark | Trosterud skulpturpark | invalid | missing_lat_lon, missing_radius
- data/places/places_nature_aliases.json | kuben_yrkesarena | Kuben yrkesarena | invalid | missing_lat_lon, missing_radius

## Flaggede aktive steder

| file | id | name | category | lat | lon | r | status | flags |
|---|---|---|---|---:|---:|---:|---|---|
| data/places/places_by.json | karl_johan | Karl Johans gate | by | 59.9138 | 10.7387 | 250 | needs_review | street_or_route_as_single_point |
| data/places/places_by.json | ring_3 | Ring 3 | by | 59.931 | 10.792 | 400 | needs_review | low_precision_coord |
| data/places/places_by.json | trikk_17_18 | Trikkelinje 17/18 | by | 59.92 | 10.76 | 300 | needs_review | low_precision_coord |
| data/places/places_by.json | st_hanshaugen_park | St. Hanshaugen park | by | 59.9234 | 10.7463 | 220 | needs_review | area_or_park_needs_manual_review |
| data/places/places_by.json | oslo_s | Oslo S | by | 59.911 | 10.7528 | 200 | needs_review | low_precision_coord |
| data/places/places_by.json | oslo_bussterminal | Oslo bussterminal | by | 59.9095 | 10.759 | 180 | needs_review | low_precision_coord |
| data/places/places_by.json | bogstadveien | Bogstadveien | by | 59.9279 | 10.7157 | 220 | needs_review | street_or_route_as_single_point |
| data/places/places_by.json | markveien | Markveien | by | 59.9235 | 10.7584 | 210 | needs_review | street_or_route_as_single_point |
| data/places/places_by.json | ullevål_hageby | Ullevål Hageby | by | 59.9369 | 10.7317 | 240 | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_by.json | christiania_torv | Christiania Torv | by | 59.9074 | 10.741 | 150 | needs_review | low_precision_coord |
| data/places/places_by.json | slottsparken | Slottsparken | by | 59.9166 | 10.7278 | 250 | needs_review | area_or_park_needs_manual_review |
| data/places/places_by.json | botsparken | Botsparken | by | 59.9053 | 10.769 | 170 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/places_by.json | stensparken | Stensparken | by | 59.9268 | 10.7406 | 200 | needs_review | area_or_park_needs_manual_review |
| data/places/places_by.json | tjuvholmen | Tjuvholmen | by | 59.9075 | 10.72 | 200 | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_by.json | bislett | Bislett | by | 59.925 | 10.7328 | 200 | needs_review | low_precision_coord |
| data/places/places_by.json | akerselva | Akerselva | by | 59.9225 | 10.7572 | 420 | needs_review | area_or_park_needs_manual_review |
| data/places/places_by.json | universitetsplassen | Universitetsplassen | by | 59.915 | 10.7397 | 150 | needs_review | low_precision_coord |
| data/places/places_by.json | operahuset | Operahuset | by | 59.9074 | 10.753 | 190 | needs_review | low_precision_coord |
| data/places/places_by.json | deichman_bjorvika | Deichman Bjørvika | by | 59.9078 | 10.7546 | 180 | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_by.json | barcode | Barcode | by | 59.91 | 10.7594 | 210 | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_by.json | damstredet_telthusbakken | Damstredet og Telthusbakken | by | 59.9219 | 10.7468 | 180 | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_by.json | vigelandsparken | Vigelandsparken | by | 59.927 | 10.7005 | 260 | conflict | low_precision_coord, area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_by.json | voienvolden | Voienvolden | by | 59.926 | 10.7435 | 170 | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord |
| data/places/places_historie.json | middelalder_oslo | Middelalderparken | historie | 59.9048 | 10.7605 | 180 | needs_review | area_or_park_needs_manual_review |
| data/places/places_historie.json | damstredet_telthusbakken | Damstredet og Telthusbakken | historie | 59.9295 | 10.7431 | 150 | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_kunst.json | vigelandsparken | Vigelandsparken | kunst | 59.927 | 10.7003 | 200 | conflict | low_precision_coord, area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_kunst.json | ekebergparken | Ekebergparken skulpturpark | kunst | 59.8997 | 10.7753 | 200 | needs_review | area_or_park_needs_manual_review |
| data/places/places_kunst.json | tjuvholmen | Tjuvholmen | kunst | 59.907 | 10.7205 | 150 | conflict | low_precision_coord, duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_kunst.json | barcode | Barcode | kunst | 59.9093 | 10.7539 | 150 | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_litteratur.json | voienvolden | Vøienvolden gård | litteratur | 59.9292 | 10.7514 | 150 | conflict | duplicate_id, duplicate_id_different_coord |
| data/places/places_litteratur.json | deichman_bjorvika | Deichman Bjørvika | litteratur | 59.9079 | 10.7541 | 150 | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_litteratur.json | litteraturhuset | Litteraturhuset | litteratur | 59.921 | 10.729 | 120 | needs_review | low_precision_coord |
| data/places/places_litteratur.json | ullevål_hageby | Ullevål Hageby | litteratur | 59.9394 | 10.7463 | 200 | conflict | duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_litteratur.json | alf_proysen_statue_nittedal | Alf Prøysen-statuen – Nittedal kulturhus | litteratur | 60.062 | 10.875 | 120 | needs_review | low_precision_coord |
| data/places/places_litteratur.json | oscar_braaten_statuen | Oscar Braaten-statuen | litteratur | 59.938 | 10.76 | 150 | needs_review | low_precision_coord |
| data/places/places_litteratur.json | alexander_kiellands_plass | Alexander Kiellands plass | litteratur | 59.9245 | 10.766 | 120 | needs_review | low_precision_coord |
| data/places/places_musikk.json | det_norske_teatret | Det Norske Teatret | musikk | 59.913 | 10.7418 | 140 | needs_review | low_precision_coord |
| data/places/places_naeringsliv.json | grunnlovsbygget_bankplassen | Den gamle Norges Bank | naeringsliv | 59.9107 | 10.742 | 120 | needs_review | low_precision_coord |
| data/places/places_naeringsliv.json | fornebu_teknologipark | Fornebu Teknologipark | naeringsliv | 59.8939 | 10.6262 | 400 | needs_review | area_or_park_needs_manual_review |
| data/places/places_naeringsliv.json | ulven_handelspark | Ulven handelspark | naeringsliv | 59.9229 | 10.8215 | 200 | needs_review | area_or_park_needs_manual_review |
| data/places/places_naeringsliv.json | akershus_energi | Akershus Energi Varme | naeringsliv | 59.947 | 10.8355 | 300 | needs_review | low_precision_coord |
| data/places/places_naeringsliv.json | ovre_foss | Øvre Foss – Hjula Veveri | naeringsliv | 59.9276 | 10.755 | 180 | needs_review | low_precision_coord |
| data/places/places_naeringsliv.json | jernbanetorget_trafikknutepunkt | Jernbanetorget – handelsknutepunktet | naeringsliv | 59.911 | 10.7508 | 150 | needs_review | low_precision_coord |
| data/places/places_naeringsliv.json | oslo_kraftselskap | Oslo Lysverker | naeringsliv | 59.919 | 10.7479 | 140 | needs_review | low_precision_coord |
| data/places/places_naeringsliv.json | frysja_industriomrade | Frysja industriområde | naeringsliv | 59.9611 | 10.7645 | 240 | conflict | area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/places_naeringsliv.json | norges_varemesse | Norges Varemesse | naeringsliv | 59.953 | 10.7525 | 250 | needs_review | low_precision_coord |
| data/places/places_naeringsliv.json | bryn_industriomrade | Bryn industriområde | naeringsliv | 59.9129 | 10.8251 | 250 | needs_review | area_or_park_needs_manual_review |
| data/places/places_naeringsliv.json | akerselva_industri | Akerselva industriområde | naeringsliv | 59.9286 | 10.758 | 260 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/places_natur.json | sognsvann | Sognsvann | natur | 59.9717 | 10.7331 | 200 | needs_review | area_or_park_needs_manual_review |
| data/places/places_politikk.json | tinghuset | Oslo tinghus | politikk | 59.9167 | 10.741 | 140 | needs_review | low_precision_coord |
| data/places/places_subkultur.json | sofienbergparken_subkultur | Sofienbergparken | subkultur | 59.9229 | 10.763 | 180 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/places_subkultur.json | torggata_blad | Torggata Blad | subkultur | 59.915 | 10.751 | 120 | needs_review | low_precision_coord |
| data/places/places_vitenskap.json | universitetets_gamle_kjemi | Universitetets gamle kjemibygning | vitenskap | 59.911 | 10.7414 | 140 | needs_review | low_precision_coord |
| data/places/oslo/places_oslo_natur_akerselvarute.json | frysja_industriomrade | Frysja industriområde | historie | 59.9695 | 10.7845 | 180 | conflict | area_or_park_needs_manual_review, duplicate_id, duplicate_id_different_coord, same_name_different_coord |
| data/places/oslo/places_oslo_natur_akerselvarute.json | nydalsdammen | Nydalsdammen | natur | 59.9458 | 10.766 | 120 | needs_review | low_precision_coord |
| data/places/oslo/places_oslo_natur_akerselvarute.json | bjoelsenparken_elvenaer | Bjølsenparken (elvenær del) | natur | 59.9386 | 10.7588 | 160 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_akerselvarute.json | voien_gard_voienvolden | Vøien gård / Vøienvolden | historie | 59.935 | 10.7535 | 180 | needs_review | low_precision_coord |
| data/places/oslo/places_oslo_natur_akerselvarute.json | kuba_parken | Kuba-parken | natur | 59.9298 | 10.748 | 180 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_akerselvarute.json | vulkan_industriomrade | Vulkan industriområde | by | 59.9247 | 10.7424 | 180 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_akerselvarute.json | elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | natur | 59.923 | 10.7408 | 120 | needs_review | low_precision_coord, street_or_route_as_single_point |
| data/places/oslo/places_oslo_natur_akerselvarute.json | fossveien_elvestrekning | Fossveien – elvestrekning | natur | 59.9218 | 10.7392 | 120 | needs_review | street_or_route_as_single_point |
| data/places/oslo/places_oslo_natur_akerselvarute.json | hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | by | 59.9197 | 10.7365 | 150 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_akerselvarute.json | nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | by | 59.9169 | 10.734 | 160 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_akerselvarute.json | akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | natur | 59.9119 | 10.747 | 200 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_hovedsteder.json | ostensjovannet | Østensjøvannet | natur | 59.88833 | 10.82694 | 450 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_hovedsteder.json | bygdoy_natur | Bygdøy natur- og kulturmiljø | natur | 59.9054 | 10.6843 | 900 | needs_review | suspicious_radius_high |
| data/places/oslo/places_oslo_natur_hovedsteder.json | alnaelva | Alnaelva | natur | 59.9211 | 10.8039 | 700 | needs_review | suspicious_radius_high |
| data/places/oslo/places_oslo_natur_hovedsteder.json | ljanselva | Ljanselva | natur | 59.8549 | 10.7946 | 700 | needs_review | suspicious_radius_high |
| data/places/oslo/places_oslo_natur_hovedsteder.json | maerradalen | Mærradalen | natur | 59.9372 | 10.6608 | 650 | needs_review | suspicious_radius_high |
| data/places/oslo/places_oslo_natur_hovedsteder.json | maridalsvannet | Maridalsvannet | natur | 59.98426 | 10.77889 | 1100 | needs_review | suspicious_radius_high |
| data/places/oslo/places_oslo_natur_hovedsteder.json | noklevann | Nøklevann | natur | 59.88341 | 10.87823 | 900 | needs_review | suspicious_radius_high |
| data/places/oslo/places_oslo_natur_alnaelva_rute.json | alnaparken | Alnaparken | natur | 59.9333 | 10.835 | 170 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_alnaelva_rute.json | alna_smalvoll | Alna ved Smalvoll | natur | 59.9226 | 10.817 | 150 | needs_review | low_precision_coord |
| data/places/oslo/places_oslo_natur_alnaelva_rute.json | alna_bryn | Alna ved Bryn | natur | 59.909 | 10.8015 | 150 | needs_review | low_precision_coord |
| data/places/oslo/places_oslo_natur_alnaelva_rute.json | alna_utlop_bjorvika | Alna utløp i Bjørvika | natur | 59.904 | 10.7638 | 170 | needs_review | low_precision_coord |
| data/places/oslo/places_oslo_natur_ljanselva_rute.json | noklevann_ljanselva_start | Nøklevann (Ljanselva start) | natur | 59.8836 | 10.878 | 170 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_skullerud | Ljanselva ved Skullerud | natur | 59.8642 | 10.8423 | 150 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_hauketo | Ljanselva ved Hauketo | natur | 59.8485 | 10.816 | 150 | needs_review | low_precision_coord, area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_ljan | Ljanselva ved Ljan | natur | 59.8359 | 10.8099 | 150 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_fiskevollen | Ljanselva ved Fiskevollen | natur | 59.8319 | 10.8048 | 150 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ljanselva_rute.json | ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | natur | 59.8288 | 10.8034 | 170 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ostensjovannet.json | ostensjovannet_nord | Østensjøvannet nord | natur | 59.8913 | 10.8255 | 150 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ostensjovannet.json | ostensjovannet_fugletarn | Østensjøvannet fugletårn | natur | 59.8878 | 10.8301 | 130 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ostensjovannet.json | ostensjovannet_sivbelte | Østensjøvannet sivbelte | natur | 59.8859 | 10.8247 | 150 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_ostensjovannet.json | ostensjovannet_sor | Østensjøvannet sør | natur | 59.8834 | 10.8272 | 150 | needs_review | area_or_park_needs_manual_review |
| data/places/oslo/places_oslo_natur_bygdoy.json | bygdoy_kongeskogen | Bygdøy Kongeskogen | natur | 59.9121 | 10.6758 | 170 | needs_review | area_or_park_needs_manual_review |
| data/places/places_nature_aliases.json | toyengata | Tøyengata |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | vaterlandsparken | Vaterlandsparken |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | lovisenberg_sykehus | Lovisenberg sykehus |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | nya_bjorvika | Nye Bjørvika |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | bjorvika_barcode | Bjørvika Barcode |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | frognerbadet | Frognerbadet |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | bjerke_travbane | Bjerke travbane |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | fagerborg_kirke | Fagerborg kirke |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | torshovparken | Torshovparken |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | borregravfeltet | Borrehaugene |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | munchs_hus_aasgardstrand | Munchs hus i Åsgårdstrand |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | trosterud_skulpturpark | Trosterud skulpturpark |  |  |  |  | invalid | missing_lat_lon, missing_radius |
| data/places/places_nature_aliases.json | kuben_yrkesarena | Kuben yrkesarena |  |  |  |  | invalid | missing_lat_lon, missing_radius |

## Sekundært: filer i repo men ikke i manifest (ikke med i hovedstatistikk)
- data/Civication/place_access_map.json
- data/Civication/place_contexts.json
- data/brands/brands_by_place.json
- data/maler/placeMAL.json
- data/maler/wk_placesMAL.json
- data/natur/nature_bird_place_map.json
- data/natur/nature_oslo_expansion_place_map.json
- data/natur/nature_place_map.json
- data/natur/nature_routes_place_map.json
- data/natur/places_akerselva_profiles_register_ids.json
- data/overlays/by/places_overlay_by.json
- data/places/oslo/Places.popkult2.json
- data/places/oslo/places_oslo_alna.json
- data/places/oslo/places_oslo_film.json
- data/places/oslo/places_oslo_media.json
- data/places/oslo/places_oslo_populaerkultur.json
- data/places/oslo/wonderkammer/wk_places_alna.json
- data/places/oslo_places.json
- data/places/places_by_22_with_quiz_profiles_v2_refined.json
- data/places_baseskjema.json
- data/places_musikk.json
- data/stories/places_by.json

## Sekundært: mulige duplikatfiler (aktive filer)
- Ingen
