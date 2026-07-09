# Legacy coordinate system audit

Generert: 2026-07-09T17:55:48.764Z

Dette er rapportmodus for Coordinate Source Contract v1. Stor backlog blokkerer ikke tools:check ennå.

| id | name | file | legacy problem | recommended action |
|---|---|---|---|---|
| farsund_byhistorie_havn | Farsund byhistorie og havn | data/places/by/agder/farsund_byhistorie_havn.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| grimstad_byhistorie_og_havn | Grimstad byhistorie og havn | data/places/by/agder/grimstad_byhistorie_og_havn.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| kristiansand_lufthavn_kjevik | Kristiansand lufthavn Kjevik | data/places/by/agder/kristiansand_lufthavn_kjevik.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lillesand_byhistorie_og_havn | Lillesand byhistorie og havn | data/places/by/agder/lillesand_byhistorie_og_havn.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lyngor_uthavn_tvedestrand | Lyngør uthavn Tvedestrand | data/places/by/agder/lyngor_uthavn_tvedestrand.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| merdo_uthavn_arendal | Merdø uthavn Arendal | data/places/by/agder/merdo_uthavn_arendal.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| ny_hellesund_uthavn_sogne | Ny-Hellesund uthavn | data/places/by/agder/ny_hellesund_uthavn_sogne.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| tvedestrand_byhistorie_og_havn | Tvedestrand byhistorie og havn | data/places/by/agder/tvedestrand_byhistorie_og_havn.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| aker_brygge | Aker Brygge | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| aker_brygge | Aker Brygge | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| aker_brygge | Aker Brygge | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| akerselva | Akerselva | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| akerselva | Akerselva | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bankplassen | Bankplassen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| barcode | Barcode | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| barcode | Barcode | data/places/by/oslo/places_by.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| barcode | Barcode | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| barcode | Barcode | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| barcode | Barcode | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| birkelunden | Birkelunden | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| birkelunden | Birkelunden | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| birkelunden | Birkelunden | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| birkelunden | Birkelunden | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bislett | Bislett | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bislett | Bislett | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bislett | Bislett | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bislett | Bislett | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bislett | Bislett | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| bislett | Bislett | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bislett | Bislett | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bislett | Bislett | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bislett | Bislett | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bislett | Bislett | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bislett | Bislett | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bislett | Bislett | data/places/by/oslo/places_by.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bispelokket | Bispelokket / Trafikkmaskinen | data/places/by/oslo/places_by.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| bjorvika | Bjørvika | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| bjorvika | Bjørvika | data/places/by/oslo/places_by.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| bjorvika | Bjørvika | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bjorvika | Bjørvika | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bogstadveien | Bogstadveien | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| bogstadveien | Bogstadveien | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| botsparken | Botsparken | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| botsparken | Botsparken | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| botsparken | Botsparken | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| botsparken | Botsparken | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| carl_berner_plass | Carl Berners plass | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| christiania_torv | Christiania Torv | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| deichman_bjorvika | Deichman Bjørvika | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| gronland_basarene | Grønland basarene | data/places/by/oslo/places_by.json | Ugyldig coordStatus=needs_review. | downgrade_to_needs_source |
| gronland_basarene | Grønland basarene | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| gronland_basarene | Grønland basarene | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| gronland_kirke | Grønland kirke | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| gronlandsleiret | Grønlandsleiret | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| gronlandsleiret | Grønlandsleiret | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| grorud | Grorud | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| grorud | Grorud | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | data/places/by/oslo/places_by.json | Ugyldig coordStatus=needs_review. | downgrade_to_needs_source |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| helsfyr | Helsfyr | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| helsfyr | Helsfyr | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| helsfyr | Helsfyr | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| jernbanetorget | Jernbanetorget | data/places/by/oslo/places_by.json | Lavpresisjonskoordinat står som verified | downgrade_to_needs_manual_visual_qa |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| kampen_kirke | Kampen kirke | data/places/by/oslo/places_by.json | Lavpresisjonskoordinat står som verified | downgrade_to_needs_manual_visual_qa |
| karl_johan | Karl Johans gate | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| karl_johan | Karl Johans gate | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| majorstuen_krysset | Majorstuen krysset | data/places/by/oslo/places_by.json | Ugyldig coordStatus=needs_review. | downgrade_to_needs_source |
| majorstuen_krysset | Majorstuen krysset | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| markveien | Markveien | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| markveien | Markveien | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| nationaltheatret_stasjon | Nationaltheatret stasjon | data/places/by/oslo/places_by.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| nydalen | Nydalen | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| nydalen | Nydalen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| okern | Økern | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| okern | Økern | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| olaf_ryes_plass | Olaf Ryes plass | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| operahuset | Operahuset | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| oslo_bussterminal | Oslo bussterminal | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| oslo_s | Oslo S | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| radhusplassen | Rådhusplassen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ring_3 | Ring 3 | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| ring_3 | Ring 3 | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ring_3 | Ring 3 | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| rodelokka | Rodeløkka | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| rodelokka | Rodeløkka | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| romsaås | Romsås | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| romsaås | Romsås | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sagene | Sagene | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| sagene | Sagene | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| skoyen | Skøyen | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| skoyen | Skøyen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| slottsparken | Slottsparken | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| slottsparken | Slottsparken | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| slottsparken | Slottsparken | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| slottsparken | Slottsparken | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| sorenga | Sørenga | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| sorenga | Sørenga | data/places/by/oslo/places_by.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| sorenga | Sørenga | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sorenga | Sørenga | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| sorenga | Sørenga | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| spikersuppa | Spikersuppa | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| spikersuppa | Spikersuppa | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| spikersuppa | Spikersuppa | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| st_hanshaugen_park | St. Hanshaugen park | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| st_hanshaugen_park | St. Hanshaugen park | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| st_hanshaugen_park | St. Hanshaugen park | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| st_hanshaugen_park | St. Hanshaugen park | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| stensparken | Stensparken | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| stensparken | Stensparken | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| stensparken | Stensparken | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| stensparken | Stensparken | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| storgata | Storgata | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| storgata | Storgata | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| tigeren | Tigerstatuen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| tjuvholmen | Tjuvholmen | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| tjuvholmen | Tjuvholmen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| tjuvholmen | Tjuvholmen | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| torggata | Torggata | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| torggata | Torggata | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| torshov | Torshov | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| torshov | Torshov | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| toyen_torg | Tøyen torg | data/places/by/oslo/places_by.json | Ugyldig coordStatus=needs_review. | downgrade_to_needs_source |
| toyen_torg | Tøyen torg | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| toyen_torg | Tøyen torg | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| trikk_17_18 | Trikkelinje 17/18 | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| trikk_17_18 | Trikkelinje 17/18 | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| trikk_17_18 | Trikkelinje 17/18 | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| tullin | Tullin | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| tullin | Tullin | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ullern | Ullern | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| ullern | Ullern | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ullevål_hageby | Ullevål Hageby | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| ullevål_hageby | Ullevål Hageby | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| universitetsplassen | Universitetsplassen | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| vaalerenga | Vålerenga | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| vaalerenga | Vålerenga | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| vigelandsparken | Vigelandsparken | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| vigelandsparken | Vigelandsparken | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| vigelandsparken | Vigelandsparken | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| vigelandsparken | Vigelandsparken | data/places/by/oslo/places_by.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| vinderen | Vinderen | data/places/by/oslo/places_by.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| vinderen | Vinderen | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | Mangler coordRole. | downgrade_to_needs_source |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| voienvolden | Voienvolden | data/places/by/oslo/places_by.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| vulkan_energisentral | Vulkan energisentral | data/places/by/oslo/places_by.json | Ugyldig coordStatus=needs_review. | downgrade_to_needs_source |
| vulkan_energisentral | Vulkan energisentral | data/places/by/oslo/places_by.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| tingvatn_fornminnepark_haegebostad | Tingvatn fornminnepark Hægebostad | data/places/historie/agder/tingvatn_fornminnepark_haegebostad.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| eidsvoll_verk_andelva | Eidsvoll Verk / Andelva | data/places/historie/akershus/places_historie_akershus_batch1.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| veien_kulturminnepark | Veien Kulturminnepark | data/places/historie/buskerud/places_historie_buskerud_batch1.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| drammen_tollbod_havn | Drammen tollbod / havneområdet | data/places/historie/buskerud/places_historie_buskerud_batch3.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| krokkleiva_kongeveien | Krokkleiva / Den bergenske kongevei | data/places/historie/buskerud/places_historie_buskerud_batch5.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lisbon_palacio_fronteira | Palácio dos Marqueses de Fronteira | data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| mustad_hunnselva_gjovik | Mustad / Hunnselva industrimiljø | data/places/historie/innlandet/places_historie_innlandet_batch11.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| espedalen_nikkelverk | Espedalen nikkelverk | data/places/historie/innlandet/places_historie_innlandet_batch13.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| elverum_stasjon_jernbanemiljo | Elverum stasjon / jernbanemiljø | data/places/historie/innlandet/places_historie_innlandet_batch15.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| moelv_stasjon_mjoslinjen | Moelv stasjon / Mjøslinjen | data/places/historie/innlandet/places_historie_innlandet_batch16.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| glomdalsmuseet_elverum | Glomdalsmuseet | data/places/historie/innlandet/places_historie_innlandet_batch2.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| norsk_skogmuseum_elverum | Norsk Skogmuseum | data/places/historie/innlandet/places_historie_innlandet_batch2.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| koppangtunet_stor_elvdal | Koppangtunet / Stor-Elvdal museum | data/places/historie/innlandet/places_historie_innlandet_batch9.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| avaldsnes_kongsgard | Avaldsnes kongsgård | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| avaldsnes_kongsgard | Avaldsnes kongsgård | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bergenhus_haakonshallen | Bergenhus / Håkonshallen | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_exact_building_area. | downgrade_to_needs_source |
| bergenhus_haakonshallen | Bergenhus / Håkonshallen | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| hafrsfjord | Hafrsfjord | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| hafrsfjord | Hafrsfjord | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| lade_gard | Lade gård / Lade | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| lade_gard | Lade gård / Lade | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| moster_gamle_kyrkje | Moster gamle kyrkje | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_exact_building_area. | downgrade_to_needs_source |
| moster_gamle_kyrkje | Moster gamle kyrkje | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| nidarosdomen | Nidarosdomen | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_exact_building. | downgrade_to_needs_source |
| nidarosdomen | Nidarosdomen | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| reinskloster | Rein kloster | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| reinskloster | Rein kloster | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| sola_erling_skjalgsson | Sola / Erling Skjalgssons maktlandskap | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| sola_erling_skjalgsson | Sola / Erling Skjalgssons maktlandskap | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| stiklestad | Stiklestad | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| stiklestad | Stiklestad | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| tonsberg_slottsfjell | Slottsfjellet i Tønsberg | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| tonsberg_slottsfjell | Slottsfjellet i Tønsberg | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| tonsberg_slottsfjell | Slottsfjellet i Tønsberg | data/places/historie/norge/places_historie_norge_for_1500_batch1.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| audunborg_hegrenes | Audunborg på Hegrenes | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=needs_manual_coordinate_check. | downgrade_to_needs_source |
| audunborg_hegrenes | Audunborg på Hegrenes | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bjarkoy_tore_hund | Tore Hunds naust og monument på Bjarkøy | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_archaeological_site. | downgrade_to_needs_source |
| bjarkoy_tore_hund | Tore Hunds naust og monument på Bjarkøy | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| egge_gard_steinkjer | Egge gård og Egge museum | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_museum_area. | downgrade_to_needs_source |
| egge_gard_steinkjer | Egge gård og Egge museum | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| elgeseter_kloster | Elgeseter kloster i Klostergata | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| elgeseter_kloster | Elgeseter kloster i Klostergata | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| elgeseter_kloster | Elgeseter kloster i Klostergata | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| fitjar_hakonarparken | Håkonarparken på Fitjar | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| fitjar_hakonarparken | Håkonarparken på Fitjar | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| fitjar_hakonarparken | Håkonarparken på Fitjar | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| giske_kyrkje | Giske kyrkje og Giskeætta | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_exact_building_area. | downgrade_to_needs_source |
| giske_kyrkje | Giske kyrkje og Giskeætta | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| gulatinget_flolid | Gulatinget på Flolid | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| gulatinget_flolid | Gulatinget på Flolid | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| hallvardskirken_oslo | Hallvardskirken i middelalder-Oslo | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_ruin_area. | downgrade_to_needs_source |
| hallvardskirken_oslo | Hallvardskirken i middelalder-Oslo | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| hallvardskirken_oslo | Hallvardskirken i middelalder-Oslo | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| hjorungavag | Hjørungavåg | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| hjorungavag | Hjørungavåg | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| munkeliv_kloster | Munkeliv kloster på Nordnes | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| munkeliv_kloster | Munkeliv kloster på Nordnes | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| nordnes_bergen | Nordnes i Bergen | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| nordnes_bergen | Nordnes i Bergen | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| rimol_melhus | Rimol i Melhus | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| rimol_melhus | Rimol i Melhus | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| stein_ringerike_halvdanshaugen | Stein på Ringerike / Halvdanshaugen | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| stein_ringerike_halvdanshaugen | Stein på Ringerike / Halvdanshaugen | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| talgje_kyrkje | Talgje kyrkje og Talgje-godset | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_exact_building_area. | downgrade_to_needs_source |
| talgje_kyrkje | Talgje kyrkje og Talgje-godset | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| varteig_kirke | Varteig kirke og Inga fra Varteig-landskapet | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| varteig_kirke | Varteig kirke og Inga fra Varteig-landskapet | data/places/historie/norge/places_historie_norge_for_1500_batch2.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bohus_festning_bagaholmen | Bohus festning på Bagaholmen | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_fortress_area. | downgrade_to_needs_source |
| bohus_festning_bagaholmen | Bohus festning på Bagaholmen | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bratsberg_gard | Bratsberg gård | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_gard_area. | downgrade_to_needs_source |
| bratsberg_gard | Bratsberg gård | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| fimreite_slagsted | Fimreite slagsted | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| fimreite_slagsted | Fimreite slagsted | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| frostatinget_logtun | Frostatinget på Logtun | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| frostatinget_logtun | Frostatinget på Logtun | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| hakonshella_bauta | Håkonshella og Håkon den gode-bautaen | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| hakonshella_bauta | Håkonshella og Håkon den gode-bautaen | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| kalmar_slott | Kalmar slott | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_castle_area. | downgrade_to_needs_source |
| kalmar_slott | Kalmar slott | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| kalvskinnet_slagsted | Kalvskinnet slagsted | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| kalvskinnet_slagsted | Kalvskinnet slagsted | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| kristkirken_bergenhus | Kristkirken på Bergenhus | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_ruin_area. | downgrade_to_needs_source |
| kristkirken_bergenhus | Kristkirken på Bergenhus | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| nidaros_erkebispegarden | Erkebispegården i Nidaros | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_building_area. | downgrade_to_needs_source |
| nidaros_erkebispegarden | Erkebispegården i Nidaros | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| nidaros_erkebispegarden | Erkebispegården i Nidaros | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| re_slagsted_ramnes | Re slagsted ved Ramnes | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_memorial_area. | downgrade_to_needs_source |
| re_slagsted_ramnes | Re slagsted ved Ramnes | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| sekken_slagsted | Sekken slagsted og minnestein | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| sekken_slagsted | Sekken slagsted og minnestein | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| vagar_lofoten_storvagan | Vågar i Storvågan/Kabelvåg | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Ugyldig coordStatus=verified_museum_area. | downgrade_to_needs_source |
| vagar_lofoten_storvagan | Vågar i Storvågan/Kabelvåg | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| vagar_lofoten_storvagan | Vågar i Storvågan/Kabelvåg | data/places/historie/norge/places_historie_norge_for_1500_batch3.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| downpatrick_magnus_berrfott | Downpatrick og Magnus Berrføtt | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| downpatrick_magnus_berrfott | Downpatrick og Magnus Berrføtt | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| holmengra_hvaler | Holmengrå ved Hvaler | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| holmengra_hvaler | Holmengrå ved Hvaler | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| jelling_kongsgard | Jelling kongsgård og monumentområde | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Ugyldig coordStatus=verified_monument_area. | downgrade_to_needs_source |
| jelling_kongsgard | Jelling kongsgård og monumentområde | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| orkney_birsay | Brough of Birsay / Orknøyene | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Ugyldig coordStatus=verified_archaeological_area. | downgrade_to_needs_source |
| orkney_birsay | Brough of Birsay / Orknøyene | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| stamford_bridge_battlefield | Stamford Bridge battlefield | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Ugyldig coordStatus=verified_area. | downgrade_to_needs_source |
| stamford_bridge_battlefield | Stamford Bridge battlefield | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| stamford_bridge_battlefield | Stamford Bridge battlefield | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| york_jorvik | Jórvík / York | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Ugyldig coordStatus=verified_formidlingspunkt. | downgrade_to_needs_source |
| york_jorvik | Jórvík / York | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| york_jorvik | Jórvík / York | data/places/historie/norge/places_historie_norge_for_1500_batch4.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| botsfengselet | Botsfengselet | data/places/historie/oslo/places_historie_added_batch_01.json | Ugyldig coordStatus=verified_source_coordinate. | downgrade_to_needs_source |
| botsfengselet | Botsfengselet | data/places/historie/oslo/places_historie_added_batch_01.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| botsfengselet | Botsfengselet | data/places/historie/oslo/places_historie_added_batch_01.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| galgeberg | Galgeberg | data/places/historie/oslo/places_historie_added_batch_01.json | Ugyldig coordStatus=verified_source_coordinate. | downgrade_to_needs_source |
| galgeberg | Galgeberg | data/places/historie/oslo/places_historie_added_batch_01.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| galgeberg | Galgeberg | data/places/historie/oslo/places_historie_added_batch_01.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| gamle_radhus | Gamle rådhus | data/places/historie/oslo/places_historie_added_batch_01.json | Ugyldig coordStatus=verified_source_coordinate. | downgrade_to_needs_source |
| gamle_radhus | Gamle rådhus | data/places/historie/oslo/places_historie_added_batch_01.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| gamle_radhus | Gamle rådhus | data/places/historie/oslo/places_historie_added_batch_01.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| nonneseter_kloster | Nonneseter kloster | data/places/historie/oslo/places_historie_added_batch_01.json | Ugyldig coordStatus=verified_source_coordinate. | downgrade_to_needs_source |
| nonneseter_kloster | Nonneseter kloster | data/places/historie/oslo/places_historie_added_batch_01.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| nonneseter_kloster | Nonneseter kloster | data/places/historie/oslo/places_historie_added_batch_01.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| oslo_hospital | Oslo hospital | data/places/historie/oslo/places_historie_added_batch_01.json | Ugyldig coordStatus=verified_source_coordinate. | downgrade_to_needs_source |
| oslo_hospital | Oslo hospital | data/places/historie/oslo/places_historie_added_batch_01.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| oslo_hospital | Oslo hospital | data/places/historie/oslo/places_historie_added_batch_01.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| oslo_ladegard | Oslo ladegård | data/places/historie/oslo/places_historie_added_batch_01.json | Ugyldig coordStatus=verified_source_coordinate. | downgrade_to_needs_source |
| oslo_ladegard | Oslo ladegård | data/places/historie/oslo/places_historie_added_batch_01.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| oslo_ladegard | Oslo ladegård | data/places/historie/oslo/places_historie_added_batch_01.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | data/places/historie/oslo/places_historie_added_batch_01.json | Ugyldig coordStatus=verified_source_coordinate. | downgrade_to_needs_source |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | data/places/historie/oslo/places_historie_added_batch_01.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| prinds_christian_augusts_minde | Prinds Christian Augusts Minde | data/places/historie/oslo/places_historie_added_batch_01.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| akerhus_slott | Akerhus Slott | data/places/historie/oslo/places_historie.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| akershus_festning | Akershus festning | data/places/historie/oslo/places_historie.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bogstad_gard | Bogstad gård | data/places/historie/oslo/places_historie.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| damstredet_telthusbakken | Damstredet og Telthusbakken | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| gamle_aker_kirke | Gamle Aker kirke | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Verified krever coordType. | downgrade_to_needs_source |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| gamle_trikkestallen | Gamle trikkestallen på Sagene | data/places/historie/oslo/places_historie.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | Verified krever coordType. | downgrade_to_needs_source |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| gamlebyen_gravlund | Gamlebyen gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| grini_fangeleir | Grini fangeleir | data/places/historie/oslo/places_historie.json | Ugyldig coordStatus=needs_review. | downgrade_to_needs_source |
| grini_fangeleir | Grini fangeleir | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| grini_fangeleir | Grini fangeleir | data/places/historie/oslo/places_historie.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| hovedoya_kloster | Hovedøya kloster | data/places/historie/oslo/places_historie.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Verified krever coordType. | downgrade_to_needs_source |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| middelalder_oslo | Middelalderparken | data/places/historie/oslo/places_historie.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| mollergata_19 | Møllergata 19 | data/places/historie/oslo/places_historie.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| oslo_domkirke | Oslo domkirke | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | Verified krever coordType. | downgrade_to_needs_source |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| sagene_skole | Sagene skole | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| slottet | Det kongelige slott | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | Verified krever coordType. | downgrade_to_needs_source |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| sofienberg_kirke | Sofienberg kirke | data/places/historie/oslo/places_historie.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Verified krever coordType. | downgrade_to_needs_source |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| trefoldighetskirken | Trefoldighetskirken | data/places/historie/oslo/places_historie.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| var_frelsers_gravlund | Vår Frelsers gravlund | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | Mangler coordRole. | downgrade_to_needs_source |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| villa_grande | Villa Grande | data/places/historie/oslo/places_historie.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| brekkeparken_skien | Brekkeparken Skien | data/places/historie/telemark/places_historie_telemark_batch1.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| borrerhaugene_midgard | Borreparken / Borre-haugene | data/places/historie/vestfold/places_historie_vestfold_batch1.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| ekebergparken | Ekebergparken skulpturpark | data/places/kunst/oslo/places_kunst.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | Mangler coordRole. | downgrade_to_needs_source |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| munch_museet | MUNCH | data/places/kunst/oslo/places_kunst.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | Mangler coordRole. | downgrade_to_needs_source |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| eldorado_bokhandel | Eldorado Bokhandel | data/places/litteratur/oslo/places_litteratur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | Mangler coordRole. | downgrade_to_needs_source |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | Verified krever coordNote. | downgrade_to_needs_source |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| litteraturhuset | Litteraturhuset | data/places/litteratur/oslo/places_litteratur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | Mangler coordRole. | downgrade_to_needs_source |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| nationaltheatret | Nationaltheatret | data/places/litteratur/oslo/places_litteratur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| norli_universitetsgata | Norli Universitetsgata | data/places/litteratur/oslo/places_litteratur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| aftenposten_akersgata | Aftenposten i Akersgata | data/places/media/oslo/places_oslo_media.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| dagbladet_akersgata | Dagbladet i Akersgata | data/places/media/oslo/places_oslo_media.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| klassekampen_redaksjon | Klassekampen-redaksjonen (Hausmanns gate) | data/places/media/oslo/places_oslo_media.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | Mangler coordRole. | downgrade_to_needs_source |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | Verified krever coordNote. | downgrade_to_needs_source |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| det_norske_teatret | Det Norske Teatret | data/places/musikk/oslo/places_musikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | Mangler coordRole. | downgrade_to_needs_source |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| john_dee | John Dee | data/places/musikk/oslo/places_musikk.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | Mangler coordRole. | downgrade_to_needs_source |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| rockefeller | Rockefeller Music Hall | data/places/musikk/oslo/places_musikk.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| salt | SALT | data/places/musikk/oslo/places_musikk.json | Spesialpunkt fra batch 02: skal ikke være verified uten full v1-kontrakt; brukerrapport sier punktet fortsatt var feil. Oslo Mek-note: dagens Oslo Mek og historisk verksted må ikke blandes. | upgrade_to_osm_or_place_id |
| salt | SALT | data/places/musikk/oslo/places_musikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| salt | SALT | data/places/musikk/oslo/places_musikk.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| salt | SALT | data/places/musikk/oslo/places_musikk.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | Mangler coordRole. | downgrade_to_needs_source |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sentrum_scene | Sentrum Scene | data/places/musikk/oslo/places_musikk.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lisbon_conserveira_de_lisboa | Conserveira de Lisboa | data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| raufoss_industripark_ammunisjon | Raufoss industripark / ammunisjonsfabrikken | data/places/naeringsliv/innlandet/raufoss_industripark_ammunisjon.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| akerselva_industri | Akerselva industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| akershus_kaier | Akershuskaiene | data/places/naeringsliv/oslo/places_naeringsliv.json | Spesialpunkt fra batch 02: skal ikke være verified uten full v1-kontrakt; brukerrapport sier punktet fortsatt var feil. Oslo Mek-note: dagens Oslo Mek og historisk verksted må ikke blandes. | upgrade_to_geometry |
| akershus_kaier | Akershuskaiene | data/places/naeringsliv/oslo/places_naeringsliv.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| akershus_kaier | Akershuskaiene | data/places/naeringsliv/oslo/places_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| akershus_kaier | Akershuskaiene | data/places/naeringsliv/oslo/places_naeringsliv.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| fornebu_teknologipark | Fornebu Teknologipark | data/places/naeringsliv/oslo/places_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler coordRole. | downgrade_to_needs_source |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | Verified krever coordNote. | downgrade_to_needs_source |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| frysja_industriomrade | Frysja industriområde | data/places/naeringsliv/oslo/places_naeringsliv.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| gronlikaia | Grønlikaia | data/places/naeringsliv/oslo/places_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | Mangler coordRole. | downgrade_to_needs_source |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | Verified krever coordNote. | downgrade_to_needs_source |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| grunnlovsbygget_bankplassen | Den gamle Norges Bank | data/places/naeringsliv/oslo/places_naeringsliv.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| havnelageret | Oslo Havnelager | data/places/naeringsliv/oslo/places_naeringsliv.json | Spesialpunkt fra batch 02: skal ikke være verified uten full v1-kontrakt; brukerrapport sier punktet fortsatt var feil. Oslo Mek-note: dagens Oslo Mek og historisk verksted må ikke blandes. | upgrade_to_address_source |
| havnelageret | Oslo Havnelager | data/places/naeringsliv/oslo/places_naeringsliv.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| havnelageret | Oslo Havnelager | data/places/naeringsliv/oslo/places_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| havnelageret | Oslo Havnelager | data/places/naeringsliv/oslo/places_naeringsliv.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| oslo_mek | Oslo Mekaniske Verksted | data/places/naeringsliv/oslo/places_naeringsliv.json | Spesialpunkt fra batch 02: skal ikke være verified uten full v1-kontrakt; brukerrapport sier punktet fortsatt var feil. Oslo Mek-note: dagens Oslo Mek og historisk verksted må ikke blandes. | upgrade_to_historical_source |
| oslo_mek | Oslo Mekaniske Verksted | data/places/naeringsliv/oslo/places_naeringsliv.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| oslo_mek | Oslo Mekaniske Verksted | data/places/naeringsliv/oslo/places_naeringsliv.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| tollbukaia | Tollbukaia | data/places/naeringsliv/oslo/places_naeringsliv.json | Spesialpunkt fra batch 02: skal ikke være verified uten full v1-kontrakt; brukerrapport sier punktet fortsatt var feil. Oslo Mek-note: dagens Oslo Mek og historisk verksted må ikke blandes. | upgrade_to_geometry |
| tollbukaia | Tollbukaia | data/places/naeringsliv/oslo/places_naeringsliv.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| tollbukaia | Tollbukaia | data/places/naeringsliv/oslo/places_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| tollbukaia | Tollbukaia | data/places/naeringsliv/oslo/places_naeringsliv.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ulven_handelspark | Ulven handelspark | data/places/naeringsliv/oslo/places_naeringsliv.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| heroya_industripark_porsgrunn | Herøya industripark | data/places/naeringsliv/telemark/heroya_industripark_porsgrunn.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| baneheia_kristiansand_bypark | Baneheia Kristiansand bypark | data/places/natur/agder/baneheia_kristiansand_bypark.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| furulunden_mandal_kulturpark | Furulunden Mandal kulturpark | data/places/natur/agder/furulunden_mandal_kulturpark.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| alnaelva | Alnaelva | data/places/natur/oslo/places_oslo_alna.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| alnaelva | Alnaelva | data/places/natur/oslo/places_oslo_alna.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| alnaelva | Alnaelva | data/places/natur/oslo/places_oslo_alna.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| alnaelva | Alnaelva | data/places/natur/oslo/places_oslo_alna.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| alnaelvstien | Alnaelvstien | data/places/natur/oslo/places_oslo_alna.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| loelva_historisk | Loelva (historisk vassdrag) | data/places/natur/oslo/places_oslo_alna.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler coordRole. | downgrade_to_needs_source |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever coordNote. | downgrade_to_needs_source |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| akerselva_utlop_bjorvika | Akerselvas utløp mot fjorden (Bjørvika) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bjoelsenparken_elvenaer | Bjølsenparken (elvenær del) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler coordRole. | downgrade_to_needs_source |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever coordNote. | downgrade_to_needs_source |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| elvestrekning_bla_brenneriveien | Elvestrekning ved Blå (Brenneriveien) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Lavpresisjonskoordinat står som verified | downgrade_to_needs_manual_visual_qa |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler coordRole. | downgrade_to_needs_source |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever coordNote. | downgrade_to_needs_source |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| fossveien_elvestrekning | Fossveien – elvestrekning | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler coordRole. | downgrade_to_needs_source |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever coordNote. | downgrade_to_needs_source |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| hausmannsomradet_elvelop | Hausmannsområdet (elveløp) | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler coordRole. | downgrade_to_needs_source |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever coordType. | downgrade_to_needs_source |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| kuba_parken | Kuba-parken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Mangler coordRole. | downgrade_to_needs_source |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| nybrua_vaterlandsparken | Nybrua / Vaterlandsparken | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| vaterland_historisk_elvelop | Vaterland – historisk elveløp | data/places/natur/oslo/places_oslo_natur_akerselvarute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| alna_bryn | Alna ved Bryn | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| alna_bryn | Alna ved Bryn | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| alna_bryn | Alna ved Bryn | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| alna_smalvoll | Alna ved Smalvoll | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| alna_smalvoll | Alna ved Smalvoll | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| alna_smalvoll | Alna ved Smalvoll | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| alna_utlop_bjorvika | Alna utløp i Bjørvika | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Ugyldig coordStatus=needs_detail_check. | downgrade_to_needs_source |
| alna_utlop_bjorvika | Alna utløp i Bjørvika | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| alna_utlop_bjorvika | Alna utløp i Bjørvika | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| alna_utlop_bjorvika | Alna utløp i Bjørvika | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| alnaparken | Alnaparken | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| alnsjoen_alna_kilde | Alnsjøen (Alna-kilde) | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| groruddammen | Groruddammen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| kvaernerbyen_alna | Kværnerbyen ved Alna | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| svartdalen | Svartdalen | data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler coordRole. | downgrade_to_needs_source |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever coordNote. | downgrade_to_needs_source |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bygdoy_bygdoynes | Bygdøy Bygdøynes | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler coordRole. | downgrade_to_needs_source |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever coordNote. | downgrade_to_needs_source |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bygdoy_dronningberget | Bygdøy Dronningberget | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler coordRole. | downgrade_to_needs_source |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever coordNote. | downgrade_to_needs_source |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bygdoy_huk | Bygdøy Huk | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_kongeskogen | Bygdøy Kongeskogen | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| bygdoy_kongeskogen | Bygdøy Kongeskogen | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_kongeskogen | Bygdøy Kongeskogen | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler coordRole. | downgrade_to_needs_source |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever coordNote. | downgrade_to_needs_source |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bygdoy_paradisbukta | Bygdøy Paradisbukta | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Mangler coordRole. | downgrade_to_needs_source |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | Verified krever coordNote. | downgrade_to_needs_source |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| bygdoy_roykenvika | Bygdøy Røykensvika | data/places/natur/oslo/places_oslo_natur_bygdoy.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| alnaelva_hovedsteder | Alnaelva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| alnaelva_hovedsteder | Alnaelva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| alnaelva_hovedsteder | Alnaelva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bygdoy_natur | Bygdøy natur- og kulturmiljø | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| bygdoy_natur | Bygdøy natur- og kulturmiljø | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_natur | Bygdøy natur- og kulturmiljø | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ljanselva | Ljanselva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| ljanselva | Ljanselva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ljanselva | Ljanselva | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| maerradalen | Mærradalen | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| maerradalen | Mærradalen | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| maerradalen | Mærradalen | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| maerradalen | Mærradalen | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| maridalsvannet | Maridalsvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| maridalsvannet | Maridalsvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| maridalsvannet | Maridalsvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| noklevann | Nøklevann | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| noklevann | Nøklevann | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| noklevann | Nøklevann | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ostensjovannet | Østensjøvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Ugyldig coordStatus=semantic_anchor. | downgrade_to_needs_source |
| ostensjovannet | Østensjøvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ostensjovannet | Østensjøvannet | data/places/natur/oslo/places_oslo_natur_hovedsteder.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ljanselva_bunnefjorden | Ljanselva ut i Bunnefjorden | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Ugyldig coordStatus=needs_detail_check. | downgrade_to_needs_source |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| ljanselva_fiskevollen | Ljanselva ved Fiskevollen | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ljanselva_hauketo | Ljanselva ved Hauketo | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| ljanselva_hauketo | Ljanselva ved Hauketo | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ljanselva_hauketo | Ljanselva ved Hauketo | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| ljanselva_hauketo | Ljanselva ved Hauketo | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ljanselva_ljan | Ljanselva ved Ljan | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| ljanselva_ljan | Ljanselva ved Ljan | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ljanselva_ljan | Ljanselva ved Ljan | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| ljanselva_ljan | Ljanselva ved Ljan | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ljanselva_skullerud | Ljanselva ved Skullerud | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| ljanselva_skullerud | Ljanselva ved Skullerud | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ljanselva_skullerud | Ljanselva ved Skullerud | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| ljanselva_skullerud | Ljanselva ved Skullerud | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| noklevann_ljanselva_start | Nøklevann (Ljanselva start) | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Mangler coordRole. | downgrade_to_needs_source |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | Verified krever coordNote. | downgrade_to_needs_source |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| skraperudtjern | Skraperudtjern | data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bogerudmyra | Bøler/Bogerudmyra | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| bogerudmyra | Bøler/Bogerudmyra | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bogerudmyra | Bøler/Bogerudmyra | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler coordRole. | downgrade_to_needs_source |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Verified krever coordNote. | downgrade_to_needs_source |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| ostensjovannet_fugletarn | Østensjøvannet fugletårn | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler coordRole. | downgrade_to_needs_source |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Verified krever coordNote. | downgrade_to_needs_source |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| ostensjovannet_nord | Østensjøvannet nord | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ostensjovannet_sivbelte | Østensjøvannet sivbelte | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| ostensjovannet_sivbelte | Østensjøvannet sivbelte | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| ostensjovannet_sivbelte | Østensjøvannet sivbelte | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Mangler coordRole. | downgrade_to_needs_source |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | Verified krever coordNote. | downgrade_to_needs_source |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| ostensjovannet_sor | Østensjøvannet sør | data/places/natur/oslo/places_oslo_natur_ostensjovannet.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bantjern_salamanderlokalitet | Båntjern salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| bantjern_salamanderlokalitet | Båntjern salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bantjern_salamanderlokalitet | Båntjern salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| bantjern_salamanderlokalitet | Båntjern salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| blindern_forskningsparken_salamanderdam | Blindern/Forskningsparken salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| blindern_forskningsparken_salamanderdam | Blindern/Forskningsparken salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| blindern_forskningsparken_salamanderdam | Blindern/Forskningsparken salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| blindern_forskningsparken_salamanderdam | Blindern/Forskningsparken salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| bygdoy_kongsgard_salamanderdam | Bygdøy Kongsgård salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Ugyldig coordStatus=nearby_reference. | downgrade_to_needs_source |
| bygdoy_kongsgard_salamanderdam | Bygdøy Kongsgård salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| bygdoy_kongsgard_salamanderdam | Bygdøy Kongsgård salamanderdam | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Gammelt koordinatsystem bør kasseres eller oppgraderes til v1 | keep_as_legacy_unverified |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Mangler coordRole. | downgrade_to_needs_source |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| tjernsmyr_salamanderlokalitet | Tjernsmyr salamanderlokalitet | data/places/natur/oslo/places_oslo_natur_salamanderdammer.json | Lavpresisjonskoordinat står som verified | downgrade_to_needs_manual_visual_qa |
| elverum_folkehogskole_1940 | Elverum folkehøgskole / Elverumsfullmakten | data/places/politikk/innlandet/elverum_folkehogskole_1940.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | Mangler coordRole. | downgrade_to_needs_source |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| stortinget | Stortinget | data/places/politikk/oslo/places_politikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | Mangler coordRole. | downgrade_to_needs_source |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | Verified krever coordNote. | downgrade_to_needs_source |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| tinghuset | Oslo tinghus | data/places/politikk/oslo/places_politikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | Mangler coordRole. | downgrade_to_needs_source |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| youngstorget | Youngstorget | data/places/politikk/oslo/places_politikk.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| selhurst_park_london | Selhurst Park | data/places/sport/europa/england/footballgrounds_london.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| daelenenga_idrettspark | Dælenenga idrettspark | data/places/sport/europa/norway/oslo_sport.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| nordre_aasen_idrettspark | Nordre Åsen idrettspark | data/places/sport/europa/norway/oslo_sport.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| gardermoen_motorpark | Gardermoen Motorpark | data/places/sport/europa/norway/places_motorsport_ostlandet.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| aktivitet_rudolf_nilsens_plass | Rudolf Nilsens plass aktivitetspark | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lekeplass_botsparken | Botsparken lekeplass | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lekeplass_kampen_park | Kampen park lekeplass | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lekeplass_snippen | Snippen lekepark | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lekeplass_sofienbergparken | Sofienbergparken lekeplass | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| lekeplass_stensparken | Stensparken lekeplass | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| treningssted_kampen_park | Kampen park treningssted | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| treningssted_torshovdalen | Torshovdalen trenings- og aktivitetspark | data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | Mangler coordRole. | downgrade_to_needs_source |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| furuset_aktivitetspark | Furuset Aktivitetspark | data/places/sport/europa/norway/urban_movement/furuset_aktivitetspark.json | Historisk sted mangler historisk sourceProvider | upgrade_to_historical_source |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | Mangler coordRole. | downgrade_to_needs_source |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| verdensparken_parkour | Verdensparken parkour | data/places/sport/europa/norway/urban_movement/verdensparken_parkour.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| blitzhuset | Blitzhuset | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | Lavpresisjons lat/lon kan ikke være verified. | downgrade_to_needs_manual_visual_qa |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| brenneriveien_ingens_gate | Brenneriveien / Ingens gate | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| club_7_vika | Club 7 | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| gamlebyen_sport_og_fritid | Gamlebyen Sport og Fritid | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| hausmania | Hausmania | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| hausmannsgate_aksen | Hausmannsgate-aksen | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| helvete_neseblod_records | Helvete / Neseblod Records | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| jaeger_oslo | Jaeger | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| kafe_haerverk | Kafé Hærverk | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| kolstadgata_toyen_vegger | Kolstadgata veggmiljø | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| kuba_akselpassasjer | Kuba-passasjene ved Akerselva | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| last_train_oslo | Last Train | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| mir_grunerlokka_lufthavn | MIR / Grünerløkka Lufthavn | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| oslo_skatehall | Oslo Skatehall | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| revolver_oslo | Revolver | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| rock_in_oslo | Rock In | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| schweigaards_gate_lodalen | Schweigaards gate–Lodalen veggakse | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| skur13 | Skur 13 | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sofienbergparken_subkultur | Sofienbergparken | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| stovnertarnet | Stovnertårnet | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| sub_scene | Sub Scene | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| the_villa | The Villa | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| torggata_blad | Torggata Blad | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| vaterland_bar_scene | Vaterland Bar & Scene | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | Mangler coordRole. | downgrade_to_needs_source |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
| xray_ungdomskulturhus | X-Ray Ungdomskulturhus | data/places/subkultur/oslo/places_subkultur.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| setesdal_mineralpark_evje | Setesdal mineralpark Evje | data/places/vitenskap/agder/setesdal_mineralpark_evje.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| forskningsparken | Forskningsparken | data/places/vitenskap/oslo/places_vitenskap.json | Lineært/kai/gate/park-sted mangler geometry/anchors/line_anchor/area_anchor | upgrade_to_geometry |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | Mangler locatorType i coordinate source contract v1. | upgrade_to_address_source |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | Mangler sourceProvider i coordinate source contract v1. | upgrade_to_osm_or_place_id |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | Verified krever sourceObjectId eller strukturert address. | upgrade_to_osm_or_place_id |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | Mangler geocodeAccuracy. | downgrade_to_needs_manual_visual_qa |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | Mangler coordRole. | downgrade_to_needs_source |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | Verified krever coordNote. | downgrade_to_needs_source |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | manual_map_check kan bare være QA-lag, ikke primær kilde alene. | upgrade_to_osm_or_place_id |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | coordStatus=verified men mangler locatorType | downgrade_to_needs_source |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | coordStatus=verified men mangler sourceProvider | downgrade_to_needs_source |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | coordStatus=verified men mangler sourceObjectId og address | upgrade_to_osm_or_place_id |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | coordStatus=verified men mangler geocodeAccuracy | downgrade_to_needs_manual_visual_qa |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | coordStatus=verified men mangler coordRole | downgrade_to_needs_source |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | coordSource=manual_map_check er eneste kilde | upgrade_to_osm_or_place_id |
| universitetets_gamle_kjemi | Universitetets gamle kjemibygning | data/places/vitenskap/oslo/places_vitenskap.json | coordType finnes men locatorType mangler | downgrade_to_needs_source |
